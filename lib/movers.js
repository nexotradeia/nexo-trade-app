// NexoTrade — Top Movers del día (gainers/losers reales, Finnhub). Server-side, batched + reintentos, cacheado.
const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
const UNIVERSE = [
  "NVDA","TSLA","AAPL","META","AMZN","MSFT","GOOGL","AMD","AVGO","NFLX",
  "PLTR","SMCI","COIN","MSTR","MARA","RIOT","SOFI","HOOD","RIVN","ARM",
  "MU","CRWD","SHOP","UBER","IONQ","OKLO","SMR","GME","NVAX","DKNG"
];
async function quote(sym) {
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FK}`, { signal: AbortSignal.timeout(5000) });
    if (r.ok) { const j = await r.json(); if (j && typeof j.dp === "number" && j.c) return { sym, dp: j.dp, price: j.c }; }
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
  const gainers = sorted.filter((x) => x.dp > 0).slice(0, 6);
  const losers = sorted.filter((x) => x.dp < 0).slice(-6).reverse();
  if (all.length >= 18) res.setHeader("Cache-Control", "s-maxage=45, stale-while-revalidate=180");
  else res.setHeader("Cache-Control", "s-maxage=8, stale-while-revalidate=30");
  return res.status(200).json({ gainers, losers, n: all.length, ts: Date.now() });
}
