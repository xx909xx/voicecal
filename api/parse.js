export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Extract calendar event information from natural language. Return ONLY valid JSON with this exact structure: { title: string, date: YYYY-MM-DD, time: HH:MM (24hr), duration_minutes: number }"
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Invalid OpenAI response", data });
    }

    const parsed = JSON.parse(data.choices[0].message.content);

    return res.status(200).json(parsed);

  } catch (error) {
    return res.status(500).json({
      error: "Parsing failed",
      details: error.message
    });
  }
}

