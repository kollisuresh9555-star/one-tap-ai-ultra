"use strict";

const { fal } = require("@fal-ai/client");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, image_size } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required"
      });
    }

    if (!process.env.FAL_KEY) {
      return res.status(500).json({
        success: false,
        error: "FAL_KEY is not configured in Vercel"
      });
    }

    fal.config({
      credentials: process.env.FAL_KEY
    });

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt.trim(),
        image_size: image_size || "square_hd"
      }
    });

    const images = result?.data?.images;

    if (!images || !images.length || !images[0]?.url) {
      return res.status(500).json({
        success: false,
        error: "Fal AI returned no image"
      });
    }

    return res.status(200).json({
      success: true,
      image: images[0].url
    });

  } catch (error) {
    console.error("Fal AI Error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Image generation failed"
    });
  }
};
