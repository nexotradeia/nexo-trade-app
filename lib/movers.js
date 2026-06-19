// NexoTrade — Top Movers del día.
// 1) Intenta gainers/losers REALES de TODO el mercado vía Yahoo (con VOLUMEN).
// 2) Si Yahoo falla, cae al universo fijo de Finnhub (sin volumen).
// Server-side + cacheado en el CDN de Vercel. Gratis, sin límite de 250/día.
const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
const UNIVERSE = [
  "NVDA","TSLA","AAPL","META","AMZN","MSFT","GOOGL","AMD","AVGO","NFLX",
  "PLTR","SMCI","COIN","MSTR","MARA","RIOT","SOFI","HOOD","RIVN","ARM",
  "MU","CRWD","SHOP","UBER","IONQ","OKLO","SMR","GME","NVAX","DKNG"
];

async function yahooScreen(scrId) {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=${scrId}&count=25&lang=en-US&region=US`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    const q = (d && d.finance && d.finance.result && d.finance.result[0] && d.finance.result[0].quotes) || [];
    return q.map((x) => ({
      sym: x.symbol,
      dp: typeof x.regularMarketChangePercent === "number" ? x.regularMarketChangePercent : null,
      price: typeof x.regularMarketPrice === "number" ? x.regularMarketPrice : null,
      vol: typeof x.regularMarketVolume === "number" ? x.regularMarketVolume : null,
    })).filter((x) => x.sym && x.dp != null && x.price != null);
  } catch (e) { return []; }
}

async function quote(sym) {
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FK}`, { signal: AbortSignal.timeout(5000) });
    if (r.ok) { const j = await r.json(); if (j && typeof j.dp === "number" && j.c) return { sym, dp: j.dp, price: j.c, vol: null }; }
  } catch (e) {}
  return null;
}
async function fillMap(syms, map) {
  const CH = 4;
  for (let k = 0; k < syms.length; k += CH) {
    const b = syms.slice(k, k + CH);
    const out = await Promise.all(b.map(quote));
    b.forEach((sym, idx) => { if (out[idx]) map[sym] = out[idx]; });
    if (k + CH < syms.length) await new Promise((r) => setTimeout(r, 350));
  }
}

export default async function movers(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  // ── 1) Yahoo: movers reales de todo el mercado + volumen ──
  const [yg, yl] = await Promise.all([yahooScreen("day_gainers"), yahooScreen("day_losers")]);
  let gainers = yg.filter((x) => x.dp > 0).sort((a, b) => b.dp - a.dp).slice(0, 8);
  let losers = yl.filter((x) => x.dp < 0).sort((a, b) => a.dp - b.dp).slice(0, 8);
  if (gainers.length + losers.length >= 8) {
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json({ gainers, losers, n: gainers.length + losers.length, src: "yahoo", ts: Date.now() });
  }

  // ── 2) Fallback: universo fijo vía Finnhub (sin volumen) ──
  const map = {};
  await fillMap(UNIVERSE, map);
  for (let pass = 0; pass < 2; pass++) {
    const missing = UNIVERSE.filter((s) => !map[s]);
    if (!missing.length) break;
    await new Promise((r) => setTimeout(r, 450));
    await fillMap(missing, map);
  }
  const all = Object.keys(map).map((k) => map[k]);
  const sorted = all.slice().sort((a, b) => b.dp - a.dp);
  gainers = sorted.filter((x) => x.dp > 0).slice(0, 6);
  losers = sorted.filter((x) => x.dp < 0).slice(-6).reverse();
  if (gainers.length + losers.length >= 6) {
    if (all.length >= 18) res.setHeader("Cache-Control", "s-maxage=45, stale-while-revalidate=180");
    else res.setHeader("Cache-Control", "s-maxage=8, stale-while-revalidate=30");
    return res.status(200).json({ gainers, losers, n: all.length, src: "finnhub", ts: Date.now() });
  }

  // ── 3) Último recurso: si Yahoo Y Finnhub fallan, set base (evita que el widget quede vacío) ──
  const SEED_G = [
    { sym: "NVDA", dp: 2.95, price: 210.69, vol: null },
    { sym: "AVGO", dp: 4.70, price: 411.56, vol: null },
    { sym: "AMD",  dp: 3.10, price: 168.40, vol: null },
    { sym: "PLTR", dp: 2.60, price: 134.20, vol: null },
    { sym: "COIN", dp: 5.20, price: 248.90, vol: null },
    { sym: "MSTR", dp: 3.80, price: 1820.0, vol: null },
  ];
  const SEED_L = [
    { sym: "TSLA", dp: -1.80, price: 400.49, vol: null },
    { sym: "INTC", dp: -2.40, price: 133.99, vol: null },
    { sym: "RIVN", dp: -3.10, price: 11.20, vol: null },
    { sym: "SNAP", dp: -2.80, price: 11.80, vol: null },
    { sym: "BABA", dp: -2.10, price: 74.20, vol: null },
    { sym: "PYPL", dp: -1.50, price: 61.40, vol: null },
  ];
  res.setHeader("Cache-Control", "s-maxage=8, stale-while-revalidate=30");
  return res.status(200).json({ gainers: SEED_G, losers: SEED_L, n: 12, src: "seed", ts: Date.now() });
}
