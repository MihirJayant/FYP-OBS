/*
  AI Description Service  Uses Google Gemini to enhance job descriptions and detect categories
 */
var { GoogleGenerativeAI } = require("@google/generative-ai");

var genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

var ENHANCE_PROMPT = `You are a professional job listing writer for a UK-based service marketplace called OBS (Online Bidding System).

A user has written a rough description of the job they need done. Your task is to:

1. Rewrite their description into a clear, professional job listing. Keep it concise but detailed enough for service providers to understand the work required. Use UK English. Do not add information the user did not mention. Keep the tone friendly but professional.

2. Suggest the most appropriate category from this list:
- Cleaning
- Plumbing
- Electrical
- Gardening
- Moving
- Painting
- Carpentry
- Handyman
- Other

3. Suggest a concise job title if the current one is empty or generic.

Respond with JSON only in this exact format:
{
  "enhanced_description": "The professional rewritten description here",
  "suggested_category": "Category name from the list",
  "suggested_title": "A short clear job title"
}

Do not include any text before or after the JSON. Do not use markdown code blocks.`;

/**
 * Enhance a job description using Gemini
 */
async function enhanceDescription(roughText, currentTitle) {
  try {
    if (!roughText || roughText.trim().length < 10) {
      return {
        success: false,
        error: "Please write at least a short paragraph describing what you need done.",
      };
    }

    var model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    var userInput = "User's rough description: " + roughText.trim();
    if (currentTitle && currentTitle.trim()) {
      userInput += "\nCurrent job title: " + currentTitle.trim();
    }

    var fullPrompt = ENHANCE_PROMPT + "\n\n" + userInput + "\n\nRespond with JSON only:";

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
      enhanced_description: parsed.enhanced_description || roughText,
      suggested_category: parsed.suggested_category || "Other",
      suggested_title: parsed.suggested_title || "",
    };
  } catch (error) {
    console.error("AI Description Error:", error);
    return {
      success: false,
      error: "Failed to enhance description. Please try again.",
    };
  }
}

module.exports = {
  enhanceDescription,
};