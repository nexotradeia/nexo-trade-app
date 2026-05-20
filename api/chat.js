// NexoTrade AI — Vercel Serverless Function
// La API key de OpenAI vive en Vercel (segura, nunca visible en el código)

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, systemPrompt } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content: systemPrompt || "Eres la IA de NexoTrade, asistente financiero en español. Responde de forma concisa y educativa sobre acciones, crypto y mercados. Máximo 3 párrafos. Añade siempre disclaimer de que no es consejo financiero.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ reply: "Error conectando con la IA. Inténtalo de nuevo." });
    }

    const reply = data.choices?.[0]?.message?.content || "No pude responder en este momento.";
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ reply: "Error interno. Inténtalo de nuevo." });
  }
}
