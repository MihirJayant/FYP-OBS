import React, { useState, useEffect, useRef } from "react";
import "./ChatBot.css";
import { sendChatMessage } from "../api/chatbot";
import { useNavigate } from "react-router-dom";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi, I am your AI assistant. I can help you:\n\n- Post jobs\n- Find jobs near you\n- Place bids\n- Check your status\n\nWhat would you like to do?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  var user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  var scrollToBottom = function () {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!user) return null;

  var addMessage = function (text, sender, data) {
    var newMsg = {
      id: Date.now() + Math.random(),
      text: text,
      sender: sender,
      data: data || null,
    };
    setMessages(function (prev) {
      return [...prev, newMsg];
    });
    return newMsg;
  };

  var handleSend = async function (e) {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    var userMessage = input.trim();
    setInput("");

    addMessage(userMessage, "user");

    var newHistory = conversationHistory.concat([
      { role: "user", content: userMessage },
    ]);

    setIsTyping(true);

    try {
      var response = await sendChatMessage(userMessage, newHistory);

      if (response.success) {
        var botMessage = response.data.message;

        addMessage(botMessage, "bot", response.data);

        setConversationHistory(
          newHistory.concat([{ role: "assistant", content: botMessage }])
        );

        if (response.data.action_result && response.data.action_result.data) {
          handleActionResult(
            response.data.action_executed,
            response.data.action_result
          );
        }
      } else {
        addMessage(
          "Sorry, I am having trouble right now. Please try again.",
          "bot"
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage("Something went wrong. Please try again.", "bot");
    } finally {
      setIsTyping(false);
    }
  };

  var handleActionResult = function (action, result) {
    if (!result.data) return;

    if (action === "search_jobs" || action === "get_my_jobs") {
      if (Array.isArray(result.data) && result.data.length > 0) {
        addMessage(null, "bot", { type: "job_list", jobs: result.data });
      }
    } else if (action === "get_my_bids") {
      if (Array.isArray(result.data) && result.data.length > 0) {
        addMessage(null, "bot", { type: "bid_list", bids: result.data });
      }
    } else if (action === "create_job") {
      if (result.data && result.data.id) {
        addMessage(null, "bot", {
          type: "action_button",
          label: "View Job",
          url: "/jobs/" + result.data.id,
        });
      }
    }
  };

  var handleQuickAction = function (actionText) {
    setInput(actionText);
    setTimeout(function () {
      var form = document.getElementById("chatbot-form");
      if (form) form.requestSubmit();
    }, 100);
  };

  var formatMessageText = function (text) {
    if (!text) return null;
    var formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
    return { __html: formatted };
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="d-flex align-items-center">
              <i className="bi bi-robot fs-4 me-2"></i>
              <div>
                <h6 className="mb-0">AI Assistant</h6>
                <small className="text-light opacity-75">
                  Powered by Gemini
                </small>
              </div>
            </div>
            <button
              className="btn-close btn-close-white"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            ></button>
          </div>

          {/* Messages */}
          <div className="chatbot-body">
            {messages.map(function (msg) {
              return (
                <div
                  key={msg.id}
                  className={"chat-message " + msg.sender}
                >
                  {msg.text && (
                    <div
                      dangerouslySetInnerHTML={formatMessageText(msg.text)}
                    />
                  )}

                  {/* Job List */}
                  {msg.data &&
                    msg.data.type === "job_list" &&
                    msg.data.jobs && (
                      <div className="mt-2">
                        {msg.data.jobs.map(function (job) {
                          return (
                            <div
                              key={job.id}
                              className="mini-job-card"
                              onClick={function () {
                                navigate("/jobs/" + job.id);
                              }}
                            >
                              <div className="mini-job-title">{job.title}</div>
                              <div className="d-flex justify-content-between">
                                <span className="mini-job-budget">
                                  {"\u00A3"}
                                  {job.budget}
                                </span>
                                {job.distance && (
                                  <span className="text-muted small">
                                    {Number(job.distance).toFixed(1)} km
                                  </span>
                                )}
                              </div>
                              <small className="text-muted">
                                {job.address}
                              </small>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* Bid List */}
                  {msg.data &&
                    msg.data.type === "bid_list" &&
                    msg.data.bids && (
                      <div className="mt-2">
                        {msg.data.bids.map(function (bid) {
                          return (
                            <div
                              key={bid.id}
                              className="mini-job-card"
                              onClick={function () {
                                navigate("/jobs/" + bid.job_id);
                              }}
                            >
                              <div className="mini-job-title">
                                {bid.job_title}
                              </div>
                              <div className="d-flex justify-content-between">
                                <span className="mini-job-budget">
                                  Diamonds: {bid.diamonds_used}
                                </span>
                                <span
                                  className={
                                    "badge bg-" +
                                    (bid.status === "accepted"
                                      ? "success"
                                      : bid.status === "open"
                                      ? "warning"
                                      : "secondary")
                                  }
                                >
                                  {bid.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* Action Button */}
                  {msg.data && msg.data.type === "action_button" && (
                    <button
                      className="btn btn-sm btn-primary mt-2"
                      onClick={function () {
                        navigate(msg.data.url);
                      }}
                    >
                      {msg.data.label}
                    </button>
                  )}

                  {/* Confirmation Buttons */}
                  {msg.data && msg.data.awaiting_confirmation && (
                    <div className="mt-2 d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={function () {
                          handleQuickAction("Yes, confirm");
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={function () {
                          handleQuickAction("No, cancel");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="chat-message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="chat-chips">
            {user.role === "provider" && (
              <>
                <button
                  className="chip"
                  onClick={function () {
                    handleQuickAction("Show jobs near me");
                  }}
                >
                  Jobs Near Me
                </button>
                <button
                  className="chip"
                  onClick={function () {
                    handleQuickAction("Show my bids");
                  }}
                >
                  My Bids
                </button>
              </>
            )}
            {user.role === "poster" && (
              <>
                <button
                  className="chip"
                  onClick={function () {
                    handleQuickAction("I want to post a job");
                  }}
                >
                  Post Job
                </button>
                <button
                  className="chip"
                  onClick={function () {
                    handleQuickAction("Show my jobs");
                  }}
                >
                  My Jobs
                </button>
              </>
            )}
            <button
              className="chip"
              onClick={function () {
                handleQuickAction("Check my balance");
              }}
            >
              Balance
            </button>
          </div>

          {/* Input */}
          <form
            id="chatbot-form"
            className="chatbot-input-area"
            onSubmit={handleSend}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={function (e) {
                setInput(e.target.value);
              }}
              disabled={isTyping}
              aria-label="Chat message input"
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={function () {
            setIsOpen(true);
          }}
          aria-label="Open chatbot"
        >
          <i className="bi bi-chat-dots-fill"></i>
        </button>
      )}
    </div>
  );
};

export default ChatBot;