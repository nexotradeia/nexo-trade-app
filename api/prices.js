// NexoTrade — Price Cache Endpoint
// GET /api/prices?tickers=NVDA,AAPL,BTC,...
// Vercel CDN caches response 60s — Finnhub only called once per minute globally
// Todos los usuarios reciben precios en ~80ms desde el CDN

const FINNHUB_KEY = process.env.FINNHUB_KEY || "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";

// Tickers crypto que usan endpoint diferente en Finnhub
const CRYPTO_MAP = {
  BTC: "BINANCE:BTCUSDT", ETH: "BINANCE:ETHUSDT", SOL: "BINANCE:SOLUSDT",
  BNB: "BINANCE:BNBUSDT", XRP: "BINANCE:XRPUSDT", DOGE:"BINANCE:DOGEUSDT",
  ADA: "BINANCE:ADAUSDT", AVAX:"BINANCE:AVAXUSDT", LINK:"BINANCE:LINKUSDT",
};

async function fetchQuote(symbol) {
  const finnhubSymbol = CRYPTO_MAP[symbol] || symbol;
  try {
    const r = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSymbol)}&token=${FINNHUB_KEY}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!r.ok) return null;
    const d = await r.json();
    if (!d || !d.c) return null;
    return { c: d.c, d: d.d, dp: d.dp, pc: d.pc, h: d.h, l: d.l };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Vercel CDN cache: 60s fresh, 120s stale-while-revalidate
  // → primera petición toca Finnhub, las siguientes vienen del CDN en ~80ms
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

  const raw = req.query?.tickers || "";
  const tickers = raw
    .split(",")
    .map(t => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 60); // máx 60 por llamada

  if (!tickers.length) {
    return res.status(400).json({ error: "tickers param required" });
  }

  // Fetch todos en paralelo
  const results = await Promise.all(
    tickers.map(async symbol => ({ symbol, quote: await fetchQuote(symbol) }))
  );

  const prices = {};
  for (const { symbol, quote } of results) {
    if (quote) prices[symbol] = quote;
  }

  return res.status(200).json({
    ok: true,
    ts: Date.now(),
    prices,
  });
}
