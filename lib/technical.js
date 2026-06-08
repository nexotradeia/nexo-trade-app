// NexoTrade — Señal técnica DIARIA real (tipo Investing "Technical").
// Calcula RSI(14) + medias móviles (SMA10/20/50) + momentum sobre velas diarias reales.
// Acciones/ETFs: Twelve Data (time_series). Cripto: CoinGecko (market_chart).
// GET /api/data?type=technical&symbol=AAPL
// Respuesta: {symbol, signal, score, rsi, price, sma20, sma50, asOf}
// Cacheado 6h en el CDN (la señal diaria no cambia intradía).

const TD_KEY = process.env.TWELVE_DATA_KEY || "c55564b877964430bc84dbd46ff63b35";

const CG_IDS = {
  BTC:"bitcoin", ETH:"ethereum", SOL:"solana", BNB:"binancecoin", XRP:"ripple",
  ADA:"cardano", DOGE:"dogecoin", AVAX:"avalanche-2", DOT:"polkadot", LINK:"chainlink",
  MATIC:"matic-network", POL:"matic-network", LTC:"litecoin", TRX:"tron", UNI:"uniswap",
  ATOM:"cosmos", XLM:"stellar", NEAR:"near", APT:"aptos", ARB:"arbitrum", OP:"optimism",
  BCH:"bitcoin-cash", ETC:"ethereum-classic", PEPE:"pepe", SHIB:"shiba-inu",
};

const sma = (a, n) => a.length < n ? null : a.slice(-n).reduce((x, y) => x + y, 0) / n;

function rsi(c, period = 14) {
  if (c.length < period + 1) return null;
  let g = 0, l = 0;
  for (let i = c.length - period; i < c.length; i++) {
    const d = c[i] - c[i - 1];
    if (d >= 0) g += d; else l -= d;
  }
  const ag = g / period, al = l / period;
  if (al === 0) return 100;
  return 100 - 100 / (1 + ag / al);
}

async function candlesTD(symbol) {
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=120&apikey=${TD_KEY}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j || j.status === "error" || !Array.isArray(j.values)) return null;
  // Twelve Data devuelve más reciente primero → invertir a más antiguo primero
  return j.values.map(v => +parseFloat(v.close)).filter(x => isFinite(x)).reverse();
}

async function candlesCG(id) {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=120&interval=daily`;
  const r = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j || !Array.isArray(j.prices)) return null;
  return j.prices.map(p => +p[1]).filter(x => isFinite(x));
}

function signalFrom(c) {
  if (!c || c.length < 25) return null;
  const price = c[c.length - 1];
  const s10 = sma(c, 10), s20 = sma(c, 20), s50 = sma(c, 50);
  const r = rsi(c, 14);
  let score = 0, n = 0;
  if (s20 != null) { score += price > s20 ? 1 : -1; n++; }
  if (s50 != null) { score += price > s50 ? 1 : -1; n++; }
  if (s10 != null && s20 != null) { score += s10 > s20 ? 1 : -1; n++; }
  if (r != null) { score += r > 55 ? 1 : r < 45 ? -1 : 0; n++; }
  const mom = c.length > 11 ? (price - c[c.length - 11]) / c[c.length - 11] : 0;
  score += mom > 0.03 ? 1 : mom < -0.03 ? -1 : 0; n++;
  const norm = n ? score / n : 0;
  const signal = norm >= 0.6 ? "Strong Buy" : norm >= 0.2 ? "Buy" : norm > -0.2 ? "Neutral" : norm > -0.6 ? "Sell" : "Strong Sell";
  return {
    signal, score: +norm.toFixed(2),
    rsi: r != null ? +r.toFixed(1) : null,
    price: +price.toFixed(2),
    sma20: s20 != null ? +s20.toFixed(2) : null,
    sma50: s50 != null ? +s50.toFixed(2) : null,
  };
}

export default async function technical(req, res) {
  const symbol = String(req.query.symbol || "").toUpperCase().trim().replace(/[^A-Z0-9.]/g, "");
  if (!symbol) { res.setHeader("Cache-Control", "no-store"); return res.status(400).json({ error: "missing symbol" }); }
  try {
    const closes = CG_IDS[symbol] ? await candlesCG(CG_IDS[symbol]) : await candlesTD(symbol);
    const out = signalFrom(closes);
    if (!out) {
      res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
      return res.status(200).json({ symbol, signal: null, note: "no data (provider limit or unknown symbol)" });
    }
    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400"); // 6h
    return res.status(200).json({ symbol, ...out, asOf: new Date().toISOString() });
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=120");
    return res.status(200).json({ symbol, signal: null, error: String((e && e.message) || e) });
  }
}
