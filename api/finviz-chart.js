// NexoTrade — Proxy para charts de Finviz
// GET /api/finviz-chart?t=NVDA&p=d   (p = d|w|m)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const ticker = (req.query.t || "").toUpperCase().trim();
  const period = ["d","w","m"].includes(req.query.p) ? req.query.p : "d";

  if (!ticker) return res.status(400).json({ error: "Falta ticker ?t=AAPL" });

  const url = `https://finviz.com/chart.ashx?t=${ticker}&ty=c&ta=1&p=${period}`;

  try {
    const r = await fetch(url, {
      headers: {
        "Referer":    "https://finviz.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":     "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (!r.ok) return res.status(r.status).json({ error: "Finviz error", status: r.status });

    const contentType = r.headers.get("content-type") || "image/gif";
    const buf = await r.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=1800"); // 15 min cache
    return res.status(200).send(Buffer.from(buf));
  } catch(e) {
    return res.status(500).json({ error: "Error proxy chart", detail: e.message });
  }
}
