// NexoTrade — Price Cache Endpoint
// GET /api/prices?tickers=NVDA,AAPL,BTC,...
// Yahoo v8 chart (primario, fiable desde Vercel) + Finnhub fallback. CDN cache 60s.
const FINNHUB_KEY = process.env.FINNHUB_KEY || "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";

const CRYPTO_YH = { BTC:"BTC-USD", ETH:"ETH-USD", SOL:"SOL-USD", BNB:"BNB-USD", XRP:"XRP-USD", DOGE:"DOGE-USD", ADA:"ADA-USD", AVAX:"AVAX-USD", LINK:"LINK-USD", MATIC:"MATIC-USD", DOT:"DOT-USD", LTC:"LTC-USD" };
const CRYPTO_FH = { BTC:"BINANCE:BTCUSDT", ETH:"BINANCE:ETHUSDT", SOL:"BINANCE:SOLUSDT", BNB:"BINANCE:BNBUSDT", XRP:"BINANCE:XRPUSDT", DOGE:"BINANCE:DOGEUSDT", ADA:"BINANCE:ADAUSDT", AVAX:"BINANCE:AVAXUSDT", LINK:"BINANCE:LINKUSDT" };

async function yahooQuote(symbol) {
  const y = CRYPTO_YH[symbol] || symbol;
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?interval=1d&range=1d`,
      { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }, signal: AbortSignal.timeout(7000) });
    if (!r.ok) return null;
    const j = await r.json();
    const m = j && j.chart && j.chart.result && j.chart.result[0] && j.chart.result[0].meta;
    if (!m || typeof m.regularMarketPrice !== "number") return null;
    const c = m.regularMarketPrice;
    const pc = typeof m.previousClose === "number" ? m.previousClose : (typeof m.chartPreviousClose === "number" ? m.chartPreviousClose : null);
    const dp = (pc && pc > 0) ? ((c - pc) / pc * 100) : 0;
    return { c, d: pc ? +(c - pc).toFixed(2) : 0, dp: +dp.toFixed(2), pc: pc || 0, h: m.regularMarketDayHigh || 0, l: m.regularMarketDayLow || 0 };
  } catch (e) { return null; }
}

async function finnhubQuote(symbol) {
  const s = CRYPTO_FH[symbol] || symbol;
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s)}&token=${FINNHUB_KEY}`, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    const d = await r.json();
    if (!d || !d.c) return null;
    return { c: d.c, d: d.d, dp: d.dp, pc: d.pc, h: d.h, l: d.l };
  } catch (e) { return null; }
}

async function getQuote(sym) { return (await yahooQuote(sym)) || (await finnhubQuote(sym)); }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

  const raw = req.query?.tickers || "";
  const tickers = raw.split(",").map(t => t.trim().toUpperCase()).filter(Boolean).slice(0, 60);
  if (!tickers.length) return res.status(400).json({ error: "tickers param required" });

  const prices = {};
  const CH = 12;
  for (let i = 0; i < tickers.length; i += CH) {
    const part = tickers.slice(i, i + CH);
    const out = await Promise.all(part.map(async s => ({ s, q: await getQuote(s) })));
    out.forEach(({ s, q }) => { if (q) prices[s] = q; });
  }
  return res.status(200).json({ ok: true, ts: Date.now(), prices });
}
