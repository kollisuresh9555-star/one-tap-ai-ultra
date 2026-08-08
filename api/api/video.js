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

        if (!process.env.FAL_KEY) {
            return res.status(500).json({
                error: "FAL_KEY is missing in Vercel"
            });
        }

        const response = await fetch(
            "https://queue.fal.run/fal-ai/wan-25-preview/text-to-video",
            {
                method: "POST",
                headers: {
                    "Authorization": `Key ${process.env.FAL_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    input: {
                        prompt: prompt.trim(),
                        aspect_ratio: "16:9",
                        resolution: "480p",
                        duration: "5"
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Video API Error:", error);

        return res.status(500).json({
            error: error.message || "Video generation failed"
        });
    }
}
