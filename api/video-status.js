const MODEL = "fal-ai/wan-2.5-preview";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Video prompt is required"
      });
    }

    const key = process.env.FAL_KEY;

    if (!key) {
      return res.status(500).json({
        error: "FAL_KEY is missing in Vercel"
      });
    }

    const response = await fetch(
      `https://queue.fal.run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspect_ratio: "16:9",
          resolution: "480p",
          duration: "5"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data
      });
    }

    const requestId =
      data.request_id ||
      data.requestId ||
      data.id;

    if (!requestId) {
      return res.status(500).json({
        error: "FAL did not return a request_id",
        response: data
      });
    }

    return res.status(200).json({
      request_id: requestId
    });

  } catch (error) {
    console.error("Video API Error:", error);

    return res.status(500).json({
      error: error.message || "Video generation failed"
    });
  }
}
