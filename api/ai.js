export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { messages, max_tokens = 1400 } = req.body;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://vidyai-app.vercel.app",
        "X-Title": "Vidyai"
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages,
        max_tokens
      })
    });
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
