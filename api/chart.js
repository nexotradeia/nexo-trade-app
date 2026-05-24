// NexoTrade Chart API — OHLC data via Yahoo Finance (server-side, sin CORS)
// GET /api/chart?ticker=AAPL&range=1y&interval=1d

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")    return res.status(405).json({ error: "Method not allowed" });

  const ticker   = (req.query.ticker || "").toUpperCase().trim();
  const range    = req.query.range    || "1y";
  const interval = req.query.interval || "1d";

  if (!ticker) return res.status(400).json({ error: "ticker requerido" });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}&includePrePost=false`;
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      }
    });

    if (!r.ok) throw new Error(`Yahoo responded ${r.status}`);
    const data = await r.json();

    const result = data?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: "Ticker no encontrado", ticker });

    const timestamps = result.timestamp || [];
    const q = result.indicators?.quote?.[0] || {};
    const meta = result.meta || {};

    const candles = timestamps.map((t, i) => ({
      time:  t,
      open:  q.open?.[i]  ?? null,
      high:  q.high?.[i]  ?? null,
      low:   q.low?.[i]   ?? null,
      close: q.close?.[i] ?? null,
    })).filter(d => d.open && d.high && d.low && d.close);

    return res.status(200).json({
      ticker:   meta.symbol       || ticker,
      currency: meta.currency     || "USD",
      exchange: meta.exchangeName || "",
      name:     meta.shortName    || ticker,
      price:    meta.regularMarketPrice || null,
      change:   meta.regularMarketChangePercent || null,
      candles,
    });
  } catch(e) {
    return res.status(500).json({ error: "Error obteniendo datos", detail: e.message });
  }
}
