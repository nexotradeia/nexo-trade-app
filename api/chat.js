// NexoTrade AI — Vercel Serverless Function
// Usa Groq API (GRATIS) con modelo Llama 3 — 14,400 requests/día sin costo

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, systemPrompt } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // Si no hay Groq key configurada, usa respuesta inteligente local
  if (!GROQ_API_KEY) {
    return res.status(200).json({
      reply: generarRespuestaLocal(message)
    });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",   // Gratis, rápido, excelente en español
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemPrompt || `Eres NexoTrade AI, asistente financiero experto en español para la plataforma nexotradeia.com.
Ayudas a inversores hispanohablantes con análisis de acciones, crypto, mercados y estrategias de inversión.
Responde siempre en español, de forma clara, educativa y concisa (máximo 3 párrafos).
Añade siempre al final: "⚠️ Esto no es consejo financiero. Consulta un asesor antes de invertir."`,
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      // Fallback a respuesta local si Groq falla
      return res.status(200).json({ reply: generarRespuestaLocal(message) });
    }

    const reply = data.choices?.[0]?.message?.content || generarRespuestaLocal(message);
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(200).json({ reply: generarRespuestaLocal(message) });
  }
}

// Respuestas locales inteligentes cuando no hay API key configurada
function generarRespuestaLocal(message) {
  const msg = message.toLowerCase();

  if (msg.includes("bitcoin") || msg.includes("btc")) {
    return "₿ Bitcoin es la criptomoneda más importante del mercado. Su precio depende de factores como la adopción institucional, las regulaciones globales y el ciclo de halvings (cada ~4 años). Para invertir en BTC, considera el promedio de costo en dólares (DCA) en lugar de comprar todo de una vez.\n\n⚠️ Esto no es consejo financiero. Consulta un asesor antes de invertir.";
  }
  if (msg.includes("nvidia") || msg.includes("nvda")) {
    return "📊 NVIDIA (NVDA) es el líder global en chips para IA. Sus GPU son usadas para entrenar modelos de inteligencia artificial. El crecimiento depende de la demanda de centros de datos. Revisa los earnings trimestrales para ver si mantiene el momentum.\n\n⚠️ Esto no es consejo financiero. Consulta un asesor antes de invertir.";
  }
  if (msg.includes("sp500") || msg.includes("s&p") || msg.includes("nasdaq")) {
    return "📈 Los índices como S&P 500 y NASDAQ representan el rendimiento del mercado americano. Históricamente el S&P 500 ha retornado ~10% anual. Invertir en ETFs como SPY o QQQ es una estrategia popular para exposición diversificada.\n\n⚠️ Esto no es consejo financiero. Consulta un asesor antes de invertir.";
  }
  if (msg.includes("ethereum") || msg.includes("eth")) {
    return "🔷 Ethereum es la blockchain más usada para contratos inteligentes y DeFi. Su valor está ligado al uso de su red. Desde el merge a Proof of Stake, ETH tiene deflación en su supply. Considera la utilidad del ecosistema al evaluar su precio.\n\n⚠️ Esto no es consejo financiero. Consulta un asesor antes de invertir.";
  }
  if (msg.includes("empezar") || msg.includes("comenzar") || msg.includes("principiante") || msg.includes("nuevo")) {
    return "🌱 Para empezar a invertir: 1) Edúcate primero (sin costo en YouTube, libros, comunidades como NexoTrade). 2) Define tu tolerancia al riesgo. 3) Empieza con ETFs diversificados (SPY, QQQ). 4) Usa el Paper Trading de NexoTrade para practicar sin dinero real. 5) Invierte solo lo que puedas perder.\n\n⚠️ Esto no es consejo financiero. Consulta un asesor antes de invertir.";
  }

  return `🤖 Buena pregunta sobre "${message.substring(0, 40)}...". Para obtener análisis en tiempo real activa la IA completa en el panel de administración. Mientras tanto, explora el feed de NexoTrade para ver qué dicen los traders de la comunidad sobre este tema.\n\n⚠️ Esto no es consejo financiero. Consulta un asesor antes de invertir.`;
}
