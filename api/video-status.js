const MODEL = "fal-ai/wan-25-preview/text-to-video";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { request_id, requestId } = req.body || {};
    const id = request_id || requestId;

    if (!id) {
      return res.status(400).json({
        error: "request_id is required"
      });
    }

    const key = process.env.FAL_KEY;

    if (!key) {
      return res.status(500).json({
        error: "FAL_KEY is missing in Vercel"
      });
    }

    const baseUrl =
      `https://queue.fal.run/${MODEL}/requests/${encodeURIComponent(id)}`;

    // -------------------------
    // CHECK STATUS
    // -------------------------

    const statusResponse = await fetch(
      `${baseUrl}/status`,
      {
        method: "GET",
        headers: {
          "Authorization": `Key ${key}`
        }
      }
    );

    const statusText = await statusResponse.text();

    let statusData;

    try {
      statusData = JSON.parse(statusText);
    } catch {
      return res.status(502).json({
        error: "FAL returned non-JSON status response",
        details: statusText
      });
    }

    if (!statusResponse.ok) {
      return res.status(statusResponse.status).json({
        error: "FAL status request failed",
        details: statusData
      });
    }

    // Still processing
    if (statusData.status !== "COMPLETED") {
      return res.status(200).json({
        status: statusData.status || "IN_PROGRESS",
        request_id: id
      });
    }

    // -------------------------
    // GET RESULT
    // -------------------------

    const resultResponse = await fetch(
      baseUrl,
      {
        method: "GET",
        headers: {
          "Authorization": `Key ${key}`
        }
      }
    );

    const resultText = await resultResponse.text();

    let resultData;

    try {
      resultData = JSON.parse(resultText);
    } catch {
      return res.status(502).json({
        error: "FAL returned non-JSON result response",
        details: resultText
      });
    }

    if (!resultResponse.ok) {
      return res.status(resultResponse.status).json({
        error: "FAL result request failed",
        details: resultData
      });
    }

    return res.status(200).json({
      status: "COMPLETED",
      request_id: id,
      result: resultData
    });

  } catch (error) {
    console.error("VIDEO STATUS ERROR:", error);

    return res.status(500).json({
      error: error.message || "Video status check failed"
    });
  }
}
