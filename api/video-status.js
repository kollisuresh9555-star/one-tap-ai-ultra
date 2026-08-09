const MODEL = "fal-ai/wan-25-preview/text-to-video";

export default async function handler(req, res) {
    res.setHeader("Content-Type", "application/json");

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const requestId = req.query?.request_id;

        if (!requestId) {
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

        const statusUrl =
            `https://queue.fal.run/${MODEL}/requests/` +
            `${encodeURIComponent(requestId)}/status`;

        const statusResponse = await fetch(statusUrl, {
            headers: {
                Authorization: `Key ${key}`
            }
        });

        const statusText = await statusResponse.text();

        let statusData;

        try {
            statusData = JSON.parse(statusText);
        } catch {
            return res.status(502).json({
                error: "FAL status returned non-JSON",
                response: statusText
            });
        }

        if (!statusResponse.ok) {
            return res.status(statusResponse.status).json({
                error: statusData
            });
        }

        if (statusData.status !== "COMPLETED") {
            return res.status(200).json({
                success: true,
                request_id: requestId,
                status: statusData.status
            });
        }

        const resultUrl =
            `https://queue.fal.run/${MODEL}/requests/` +
            `${encodeURIComponent(requestId)}`;

        const resultResponse = await fetch(resultUrl, {
            headers: {
                Authorization: `Key ${key}`
            }
        });

        const resultText = await resultResponse.text();

        let resultData;

        try {
            resultData = JSON.parse(resultText);
        } catch {
            return res.status(502).json({
                error: "FAL result returned non-JSON",
                response: resultText
            });
        }

        if (!resultResponse.ok) {
            return res.status(resultResponse.status).json({
                error: resultData
            });
        }

        return res.status(200).json({
            success: true,
            request_id: requestId,
            status: "COMPLETED",
            result: resultData
        });

    } catch (error) {
        console.error("Video Status Error:", error);

        return res.status(500).json({
            error: error.message || "Video status check failed"
        });
    }
}
