"use strict";

module.exports = async function handler(req, res) {

  // Only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    // Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "OPENROUTER_API_KEY is not configured in Vercel"
      });
    }

    // Read request body
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required"
      });
    }

    // OpenRouter request
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": req.headers.origin || "https://one-tap-ai-ultra.vercel.app",
          "X-Title": "ONE TAP AI ULTRA 2050"
        },

        body: JSON.stringify({
          model: "openai/gpt-4o-mini",

          messages: [
            {
              role: "user",
              content: prompt.trim()
            }
          ],

          temperature: 0.7,
          max_tokens: 1000
        })
      }
    );

    // Read response
    const data = await response.json();

    // OpenRouter error
    if (!response.ok) {
      console.error("OpenRouter Error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "OpenRouter request failed"
      });
    }

    // Extract AI response
    const message =
      data?.choices?.[0]?.message?.content;

    if (!message) {
      return res.status(500).json({
        success: false,
        error: "No AI response received"
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      response: message
    });

  } catch (error) {

    console.error("Chat API Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Chat generation failed"
    });
  }
};
