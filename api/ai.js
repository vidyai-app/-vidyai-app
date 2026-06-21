import https from "https";

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  try {
    const { messages, max_tokens = 1400 } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is missing in Vercel Environment Variables",
      });
    }

    const body = JSON.stringify({
      model: "google/gemini-flash-1.5",
      messages,
      max_tokens,
    });

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: "openrouter.ai",
        path: "/api/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://vidyai-app.vercel.app",
          "X-Title": "Vidyai",
          "Content-Length": Buffer.byteLength(body),
        },
      };

      const request = https.request(options, (apiResponse) => {
        let data = "";

        apiResponse.on("data", (chunk) => {
          data += chunk;
        });

        apiResponse.on("end", () => {
          resolve(data);
        });
      });

      request.on("error", (error) => {
        reject(error);
      });

      request.write(body);
      request.end();
    });

    const parsed = JSON.parse(response);

    if (parsed.error) {
      console.error("OpenRouter Error:", parsed.error);

      return res.status(500).json({
        error: parsed.error.message || "OpenRouter request failed",
      });
    }

    const result =
      parsed?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    return res.status(200).json({
      result,
    });
  } catch (error) {
    console.error("API Error:", error);

    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}
