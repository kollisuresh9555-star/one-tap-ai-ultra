const MODEL = "fal-ai/wan-25-preview/text-to-video";

export default async function handler(req, res) {
    res.setHeader("Content-Type", "application/json");

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { prompt, duration = "5", aspect_ratio = "16:9" } =
            req.body || {};

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
                    aspect_ratio,
                    resolution: "480p",
                    duration
                })
            }
        );

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            return res.status(502).json({
                error: "FAL returned non-JSON response",
                response: text
            });
        }

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
            return res.status(502).json({
                error: "FAL did not return request_id",
                response: data
            });
        }

        return res.status(200).json({
            success: true,
            request_id: requestId,
            status: "IN_QUEUE"
        });

    } catch (error) {
        console.error("Video API Error:", error);

        return res.status(500).json({
            error: error.message || "Video generation failed"
        });
    }
}
