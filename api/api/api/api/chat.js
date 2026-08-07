"use strict";

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required"
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OPENROUTER_API_KEY is not configured"
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://one-tap-ai-ultra.vercel.app",
          "X-Title": "One Tap AI Ultra"
        },

        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt.trim()
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "OpenRouter request failed"
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({
        success: false,
        error: "No response received from OpenRouter"
      });
    }

    return res.status(200).json({
      success: true,
      answer: answer
    });

  } catch (error) {

    console.error("Chat API Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Chat generation failed"
    });
  }
};
