const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { messages, max_tokens = 1400 } = req.body;
    
    const body = JSON.stringify({
      model: "google/gemini-flash-1.5",
      messages,
      max_tokens
    });

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://vidyai-app.vercel.app',
          'X-Title': 'Vidyai',
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const req2 = https.request(options, (res2) => {
        let data = '';
        res2.on('data', chunk => data += chunk);
        res2.on('end', () => resolve(data));
      });
      req2.on('error', reject);
      req2.write(body);
      req2.end();
    });

    const data = JSON.parse(response);
    const result = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
