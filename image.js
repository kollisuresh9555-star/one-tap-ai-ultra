import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const result = await fal.subscribe(
      "fal-ai/flux/schnell",
      {
        input: {
          prompt: prompt
        }
      }
    );

    return res.status(200).json({
      success: true,
      image: result.data.images[0].url
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}