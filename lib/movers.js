// NexoTrade — Top Movers EN VIVO: gainers y losers reales del día (Finnhub). Server-side, batched, cacheado.
const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
const UNIVERSE = [
  "NVDA","TSLA","AAPL","META","AMZN","MSFT","GOOGL","AMD","AVGO","NFLX","COST","MU","INTC",
  "PLTR","SMCI","COIN","MSTR","MARA","RIOT","CLSK","SOFI","HOOD","RIVN","LCID","NIO","AFRM",
  "UPST","ROKU","SNAP","PINS","DKNG","CVNA","ARM","CRWD","SHOP","UBER","ABNB","NU","DELL",
  "BBAI","IONQ","RGTI","QBTS","OKLO","SMR","NNE","UEC","CCJ","GME","AMC","LUNR","ACHR","JOBY"
];
async function quote(sym) {
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FK}`, { signal: AbortSignal.timeout(5000) });
    if (r.ok) { const j = await r.json(); if (j && typeof j.dp === "number" && j.c) return { sym, dp: j.dp, price: j.c }; }
  } catch (e) { /* skip */ }
  return null;
}
export default async function movers(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=45, stale-while-revalidate=120");
  const all = [];
  const CH = 7;
  for (let k = 0; k < UNIVERSE.length; k += CH) {
    const batch = UNIVERSE.slice(k, k + CH);
    const out = await Promise.all(batch.map(quote));
    out.forEach((o) => { if (o) all.push(o); });
    if (k + CH < UNIVERSE.length) await new Promise((r) => setTimeout(r, 200));
  }
  const sorted = all.slice().sort((a, b) => b.dp - a.dp);
  const gainers = sorted.filter((x) => x.dp > 0).slice(0, 6);
  const losers = sorted.filter((x) => x.dp < 0).slice(-6).reverse();
  return res.status(200).json({ gainers, losers, n: all.length, ts: Date.now() });
}
