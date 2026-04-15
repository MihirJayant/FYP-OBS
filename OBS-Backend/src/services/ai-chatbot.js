
 //AI Chatbot Service using Google Gemini
 //Handles natural language understanding and action extraction
 
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a helpful assistant for an Online Bidding System (OBS) platform in the UK.
Your job is to help users:
1. Post jobs (for job posters)
2. Find and bid on jobs (for service providers)
3. Accept bids on their jobs
4. Leave reviews after job completion
5. Check their job/bid status
6. Answer questions about the platform

IMPORTANT RULES:
- Always be friendly and helpful
- Ask for missing information before taking action
- Use UK English spelling
- Currency is GBP (pounds)
- Postcodes are UK format (e.g., NG1 4BU)
- Keep responses concise

When you identify a user intent, respond with a JSON object in this EXACT format:
{
  "action": "ACTION_NAME",
  "params": { ... },
  "message": "Your friendly response to the user",
  "needs_confirmation": true/false
}

AVAILABLE ACTIONS:
1. "create_job" - params: { title, description, category, budget, postcode, deadline }
2. "search_jobs" - params: { category, postcode, radius_km, min_budget, max_budget }
3. "place_bid" - params: { job_id, amount, message, estimated_days }
4. "accept_bid" - params: { bid_id }
5. "leave_review" - params: { job_id, rating, review_text }
6. "get_my_jobs" - params: {}
7. "get_my_bids" - params: {}
8. "get_job_details" - params: { job_id }
9. "get_balance" - params: {}
10. "none" - For general questions or when no action is needed

CATEGORIES AVAILABLE:
- Cleaning
- Plumbing
- Electrical
- Gardening
- Moving
- Painting
- Carpentry
- Handyman
- Other

If the user hasn't provided enough information, set "action": "none" and ask for the missing details in your message.

EXAMPLES:

User: "I need a plumber to fix my sink"
Response: {
  "action": "none",
  "params": {},
  "message": "I can help you post a plumbing job. To get you the best quotes, I need a few details:\\n\\nWhat is your postcode?\\nWhat is your budget?\\nAny specific details about the issue?",
  "needs_confirmation": false
}

User: "Post a job for cleaning my house in NG1 4BU, budget 100 pounds"
Response: {
  "action": "create_job",
  "params": {
    "title": "House Cleaning",
    "description": "House cleaning service required",
    "category": "Cleaning",
    "budget": 100,
    "postcode": "NG1 4BU"
  },
  "message": "I will create this cleaning job for you:\\n\\nTitle: House Cleaning\\nLocation: NG1 4BU\\nBudget: 100 pounds\\n\\nShall I post this job now?",
  "needs_confirmation": true
}

User: "yes" (after confirmation request)
Response: {
  "action": "confirm_previous",
  "params": {},
  "message": "Processing your request...",
  "needs_confirmation": false
}

User: "Show me plumbing jobs near me"
Response: {
  "action": "search_jobs",
  "params": {
    "category": "Plumbing"
  },
  "message": "Let me find plumbing jobs for you. What is your postcode so I can show jobs near you?",
  "needs_confirmation": false
}

User: "What is this platform about?"
Response: {
  "action": "none",
  "params": {},
  "message": "Welcome to the Online Bidding System!\\n\\nThis platform connects people who need services with skilled providers:\\n\\nFor Job Posters:\\n- Post jobs and receive competitive bids\\n- Choose the best provider based on price and reviews\\n\\nFor Service Providers:\\n- Browse available jobs in your area\\n- Place bids and win work\\n\\nHow can I help you today?",
  "needs_confirmation": false
}

Always respond with valid JSON only. No text before or after the JSON.`;

/**
 * Process a user message and extract intent/action
 */
async function processMessage(userMessage, conversationHistory, userContext) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    var contextInfo = "";
    if (userContext.role) {
      contextInfo += "\nUser role: " + userContext.role;
    }
    if (userContext.name) {
      contextInfo += "\nUser name: " + userContext.name;
    }
    if (userContext.postcode) {
      contextInfo += "\nUser postcode: " + userContext.postcode;
    }
    if (userContext.pendingAction) {
      contextInfo +=
        "\nPending action awaiting confirmation: " +
        JSON.stringify(userContext.pendingAction);
    }

    var historyStr = "";
    if (conversationHistory && conversationHistory.length > 0) {
      historyStr = "\n\nRecent conversation:\n";
      var recentMessages = conversationHistory.slice(-6);
      for (var i = 0; i < recentMessages.length; i++) {
        var msg = recentMessages[i];
        var label = msg.role === "user" ? "User" : "Assistant";
        historyStr += label + ": " + msg.content + "\n";
      }
    }

    var fullPrompt =
      SYSTEM_PROMPT +
      contextInfo +
      historyStr +
      "\n\nUser: " +
      userMessage +
      "\n\nRespond with JSON only:";

    var result = await model.generateContent(fullPrompt);
    var response = await result.response;
    var text = response.text().trim();

    // Clean up markdown code blocks if present
    if (text.startsWith("```json")) {
      text = text.slice(7);
    }
    if (text.startsWith("```")) {
      text = text.slice(3);
    }
    if (text.endsWith("```")) {
      text = text.slice(0, -3);
    }
    text = text.trim();

    var parsed = JSON.parse(text);

    return {
      success: true,
      action: parsed.action || "none",
      params: parsed.params || {},
      message:
        parsed.message ||
        "I am not sure how to help with that. Could you rephrase?",
      needs_confirmation: parsed.needs_confirmation || false,
    };
  } catch (error) {
    console.error("AI Chatbot Error:", error);
    return {
      success: false,
      action: "none",
      params: {},
      message:
        "I am having trouble understanding that. Could you try again or rephrase your request?",
      needs_confirmation: false,
      error: error.message,
    };
  }
}

/**
 * Generate a response for action results
 */
async function generateActionResponse(action, result, userContext) {
  try {
    var model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    var prompt =
      "You are a helpful assistant. Generate a brief, friendly response for this action result.\n" +
      "Action: " +
      action +
      "\n" +
      "Result: " +
      JSON.stringify(result) +
      "\n" +
      "User role: " +
      (userContext.role || "unknown") +
      "\n" +
      "Keep the response concise and friendly. If there is an error, be helpful about what to do next.\n" +
      "Respond with plain text only (not JSON).";

    var response = await model.generateContent(prompt);
    return response.response.text().trim();
  } catch (error) {
    console.error("Error generating action response:", error);
    if (result.success) {
      return "Done!";
    }
    return "Something went wrong. Please try again.";
  }
}

module.exports = {
  processMessage,
  generateActionResponse,
};