const MODEL = "fal-ai/wan-25-preview";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { request_id } = req.body || {};

        if (!request_id) {
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

        const statusResponse = await fetch(
            `https://queue.fal.run/${MODEL}/requests/${encodeURIComponent(request_id)}/status`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Key ${key}`
                }
            }
        );

        const statusData = await statusResponse.json();

        if (!statusResponse.ok) {
            return res.status(statusResponse.status).json({
                error: statusData
            });
        }

        if (statusData.status !== "COMPLETED") {
            return res.status(200).json({
                status: statusData.status
            });
        }

        const resultResponse = await fetch(
            `https://queue.fal.run/${MODEL}/requests/${encodeURIComponent(request_id)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Key ${key}`
                }
            }
        );

        const resultData = await resultResponse.json();

        if (!resultResponse.ok) {
            return res.status(resultResponse.status).json({
                error: resultData
            });
        }

        return res.status(200).json({
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
