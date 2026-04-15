import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";

var SERVER_URL = import.meta.env.VITE_IMG_URL || "http://localhost:5001";

var Notifications = function () {
  var [notifications, setNotifications] = useState([]);
  var [showPanel, setShowPanel] = useState(false);
  var [unreadCount, setUnreadCount] = useState(0);
  var socketRef = useRef(null);
  var navigate = useNavigate();

  var user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  useEffect(
    function () {
      if (!user) return;

      // Connect to Socket.io server
      var socket = io(SERVER_URL, {
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", function () {
        console.log("Socket connected for notifications");
        // Register this user
        socket.emit("register", user.id);
      });

      socket.on("notification", function (data) {
        console.log("Notification received:", data);
        setNotifications(function (prev) {
          var updated = [data].concat(prev);
          // Keep only last 20 notifications
          if (updated.length > 20) {
            updated = updated.slice(0, 20);
          }
          return updated;
        });
        setUnreadCount(function (prev) {
          return prev + 1;
        });
      });

      socket.on("disconnect", function () {
        console.log("Socket disconnected");
      });

      return function () {
        socket.disconnect();
      };
    },
    [user ? user.id : null]
  );

  var handleToggle = function () {
    setShowPanel(!showPanel);
    if (!showPanel) {
      setUnreadCount(0);
    }
  };

  var handleNotificationClick = function (notification) {
    if (notification.job_id) {
      navigate("/jobs/" + notification.job_id);
      setShowPanel(false);
    }
  };

  var handleClearAll = function () {
    setNotifications([]);
    setUnreadCount(0);
  };

  var getTimeAgo = function (dateStr) {
    var now = new Date();
    var then = new Date(dateStr);
    var seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    return Math.floor(seconds / 86400) + "d ago";
  };

  var getNotificationIcon = function (type) {
    switch (type) {
      case "new_bid":
        return "bi-cash-coin";
      case "bid_accepted":
        return "bi-check-circle";
      case "job_completed":
        return "bi-trophy";
      case "new_review":
        return "bi-star";
      default:
        return "bi-bell";
    }
  };

  if (!user) return null;

  return (
    <div className="notifications-container">
      {/* Bell button */}
      <button
        className="notifications-bell"
        onClick={handleToggle}
        aria-label={"Notifications" + (unreadCount > 0 ? ", " + unreadCount + " unread" : "")}
      >
        <i className="bi bi-bell-fill"></i>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>

      {/* Panel */}
      {showPanel && (
        <div
          className="notifications-panel"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="notifications-header">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            <div className="d-flex align-items-center gap-2">
              {notifications.length > 0 && (
                <button
                  className="btn btn-link btn-sm p-0 text-muted"
                  onClick={handleClearAll}
                >
                  Clear all
                </button>
              )}
              <button
                className="btn-close btn-close-sm"
                onClick={function () {
                  setShowPanel(false);
                }}
                aria-label="Close notifications"
              ></button>
            </div>
          </div>

          <div className="notifications-body">
            {notifications.length === 0 ? (
              <div className="text-center py-4">
                <i
                  className="bi bi-bell-slash"
                  style={{ fontSize: "32px", color: "#ccc" }}
                ></i>
                <p className="text-muted small mt-2 mb-0">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map(function (notif, index) {
                return (
                  <div
                    key={index}
                    className="notification-item"
                    onClick={function () {
                      handleNotificationClick(notif);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={function (e) {
                      if (e.key === "Enter") handleNotificationClick(notif);
                    }}
                  >
                    <div className="notification-icon">
                      <i className={"bi " + getNotificationIcon(notif.type)}></i>
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{notif.title}</p>
                      <p className="notification-message">{notif.message}</p>
                      <small className="notification-time">
                        {getTimeAgo(notif.created_at)}
                      </small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;