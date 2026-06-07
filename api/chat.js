// NexoTrade AI — Vercel Serverless Function
// Usa Groq API (GRATIS) con modelo Llama 3 — 14,400 requests/día sin costo

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, systemPrompt, lang } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  // Idioma: usa el que envía el front; si no, lo infiere del systemPrompt (inglés vs español)
  const isEN = (lang === "en") || (!lang && /^You are|English/i.test(systemPrompt || ""));

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // Si no hay Groq key configurada, usa respuesta inteligente local
  if (!GROQ_API_KEY) {
    return res.status(200).json({
      reply: generarRespuestaLocal(message, isEN)
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
      return res.status(200).json({ reply: generarRespuestaLocal(message, isEN) });
    }

    const reply = data.choices?.[0]?.message?.content || generarRespuestaLocal(message, isEN);
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(200).json({ reply: generarRespuestaLocal(message, isEN) });
  }
}

// Respuestas locales inteligentes cuando no hay API key configurada (bilingüe ES/EN)
function generarRespuestaLocal(message, isEN = false) {
  const msg = message.toLowerCase();
  const DISC_ES = "\n\n⚠️ Esto no es consejo financiero. Consulta un asesor antes de invertir.";
  const DISC_EN = "\n\n⚠️ This is not financial advice. Consult an advisor before investing.";
  const D = isEN ? DISC_EN : DISC_ES;

  if (msg.includes("bitcoin") || msg.includes("btc")) {
    return (isEN
      ? "₿ Bitcoin is the most important cryptocurrency in the market. Its price depends on factors like institutional adoption, global regulation and the ~4-year halving cycle. To invest in BTC, consider dollar-cost averaging (DCA) instead of buying all at once."
      : "₿ Bitcoin es la criptomoneda más importante del mercado. Su precio depende de factores como la adopción institucional, las regulaciones globales y el ciclo de halvings (cada ~4 años). Para invertir en BTC, considera el promedio de costo en dólares (DCA) en lugar de comprar todo de una vez.") + D;
  }
  if (msg.includes("nvidia") || msg.includes("nvda")) {
    return (isEN
      ? "📊 NVIDIA (NVDA) is the global leader in AI chips. Its GPUs are used to train artificial intelligence models. Growth depends on data center demand. Check the quarterly earnings to see if it keeps the momentum."
      : "📊 NVIDIA (NVDA) es el líder global en chips para IA. Sus GPU son usadas para entrenar modelos de inteligencia artificial. El crecimiento depende de la demanda de centros de datos. Revisa los earnings trimestrales para ver si mantiene el momentum.") + D;
  }
  if (msg.includes("sp500") || msg.includes("s&p") || msg.includes("nasdaq")) {
    return (isEN
      ? "📈 Indices like the S&P 500 and NASDAQ represent the performance of the US market. Historically the S&P 500 has returned ~10% per year. Investing in ETFs like SPY or QQQ is a popular strategy for diversified exposure."
      : "📈 Los índices como S&P 500 y NASDAQ representan el rendimiento del mercado americano. Históricamente el S&P 500 ha retornado ~10% anual. Invertir en ETFs como SPY o QQQ es una estrategia popular para exposición diversificada.") + D;
  }
  if (msg.includes("ethereum") || msg.includes("eth")) {
    return (isEN
      ? "🔷 Ethereum is the most used blockchain for smart contracts and DeFi. Its value is tied to network usage. Since the merge to Proof of Stake, ETH has deflation in its supply. Consider the ecosystem's utility when evaluating its price."
      : "🔷 Ethereum es la blockchain más usada para contratos inteligentes y DeFi. Su valor está ligado al uso de su red. Desde el merge a Proof of Stake, ETH tiene deflación en su supply. Considera la utilidad del ecosistema al evaluar su precio.") + D;
  }
  if (msg.includes("start") || msg.includes("begin") || msg.includes("empezar") || msg.includes("comenzar") || msg.includes("principiante") || msg.includes("nuevo")) {
    return (isEN
      ? "🌱 To start investing: 1) Educate yourself first (free on YouTube, books, communities like NexoTrade). 2) Define your risk tolerance. 3) Start with diversified ETFs (SPY, QQQ). 4) Use NexoTrade's Paper Trading to practice without real money. 5) Only invest what you can afford to lose."
      : "🌱 Para empezar a invertir: 1) Edúcate primero (sin costo en YouTube, libros, comunidades como NexoTrade). 2) Define tu tolerancia al riesgo. 3) Empieza con ETFs diversificados (SPY, QQQ). 4) Usa el Paper Trading de NexoTrade para practicar sin dinero real. 5) Invierte solo lo que puedas perder.") + D;
  }

  return (isEN
    ? `🤖 Good question about "${message.substring(0, 40)}...". For real-time analysis, the full AI is enabled from the admin panel. Meanwhile, explore the NexoTrade feed to see what the community traders are saying about this topic.`
    : `🤖 Buena pregunta sobre "${message.substring(0, 40)}...". Para obtener análisis en tiempo real activa la IA completa en el panel de administración. Mientras tanto, explora el feed de NexoTrade para ver qué dicen los traders de la comunidad sobre este tema.`) + D;
}
