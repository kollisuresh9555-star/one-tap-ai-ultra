export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      prompt,
      duration = 5,
      aspect_ratio = "16:9"
    } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Video prompt is required"
      });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "POLLINATIONS_API_KEY is missing in Vercel Environment Variables"
      });
    }

    const params = new URLSearchParams({
      model: "wan",
      duration: String(duration),
      aspectRatio: aspect_ratio
    });

    const url =
      "https://gen.pollinations.ai/video/" +
      encodeURIComponent(prompt.trim()) +
      "?" +
      params.toString();

    console.log("Video request:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "video/mp4"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Pollinations error:",
        response.status,
        errorText
      );

      return res.status(502).json({
        error: "Pollinations video generation failed",
        status: response.status,
        details: errorText
      });
    }

    const contentType =
      response.headers.get("content-type") || "";

    console.log("Video content type:", contentType);

    if (!contentType.includes("video")) {
      const text = await response.text();

      return res.status(502).json({
        error: "Pollinations did not return a video",
        contentType,
        details: text
      });
    }

    const buffer = Buffer.from(
      await response.arrayBuffer()
    );

    res.setHeader(
      "Content-Type",
      contentType || "video/mp4"
    );

    res.setHeader(
      "Content-Length",
      buffer.length.toString()
    );

    res.setHeader(
      "Content-Disposition",
      'inline; filename="generated-video.mp4"'
    );

    return res.status(200).send(buffer);

  } catch (error) {

    console.error(
      "VIDEO API ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Video generation failed"
    });
  }
}
