export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { messages, max_tokens = 1400 } = req.body;
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is missing in Vercel Environment Variables" });
    }
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://vidyai-app.vercel.app",
        "X-Title": "Vidyai"
      },
      body: JSON.stringify({ model: "meta-llama/llama-3.3-70b-instruct:free", messages, max_tokens })
    });
    const parsed = await response.json();
    if (parsed.error) {
      console.error("OpenRouter Error:", parsed.error);
      return res.status(500).json({ error: parsed.error.message || "OpenRouter request failed" });
    }
    const result = parsed?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return res.status(200).json({ result });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}