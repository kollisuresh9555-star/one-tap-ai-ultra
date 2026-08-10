const MODEL = "fal-ai/wan-25-preview/text-to-video";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const body = req.body || {};

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    const duration =
      body.duration === "10" || body.duration === 10
        ? "10"
        : "5";

    const aspect_ratio =
      body.aspect_ratio === "9:16" ||
      body.aspect_ratio === "1:1"
        ? body.aspect_ratio
        : "16:9";

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Video prompt is required"
      });
    }

    const key = process.env.FAL_KEY;

    if (!key) {
      return res.status(500).json({
        success: false,
        error: "FAL_KEY is missing in Vercel"
      });
    }

    const falResponse = await fetch(
      `https://queue.fal.run/${MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio,
          resolution: "480p",
          duration
        })
      }
    );

    // IMPORTANT:
    // Read response as text first.
    const rawText = await falResponse.text();

    let falData;

    try {
      falData = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        success: false,
        error: "FAL returned non-JSON response",
        raw_response: rawText
      });
    }

    // FAL error
    if (!falResponse.ok) {
      return res.status(falResponse.status).json({
        success: false,
        error:
          falData?.detail ||
          falData?.message ||
          falData?.error ||
          "FAL video request failed",
        fal_response: falData
      });
    }

    // FAL queue request ID
    const requestId =
      falData?.request_id ||
      falData?.requestId ||
      falData?.id;

    if (!requestId) {
      return res.status(502).json({
        success: false,
        error: "FAL did not return request_id",
        fal_response: falData
      });
    }

    // EXACT JSON response for frontend
    return res.status(200).json({
      success: true,
      request_id: requestId,
      requestId: requestId,
      status: "IN_QUEUE"
    });

  } catch (error) {
    console.error("VIDEO API ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Video generation failed"
    });
  }
}
