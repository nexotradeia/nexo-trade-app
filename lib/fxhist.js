// NexoTrade — Histórico diario de pares FX (para correlación y volatilidad)
// /api/data?type=fxhist  →  { pairs:[{s,n,closes:[...]}], source }
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "application/json" };
const PAIRS = [
  ["EURUSD=X","EUR/USD"],["GBPUSD=X","GBP/USD"],["USDJPY=X","USD/JPY"],["USDCHF=X","USD/CHF"],
  ["AUDUSD=X","AUD/USD"],["USDCAD=X","USD/CAD"],["NZDUSD=X","NZD/USD"],["EURJPY=X","EUR/JPY"],
  ["GBPJPY=X","GBP/JPY"],["EURGBP=X","EUR/GBP"],
];
async function series(sym){
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2mo`, { headers: UA, signal: AbortSignal.timeout(8000) });
  if(!r.ok) throw new Error("chart HTTP "+r.status);
  const res = (await r.json())?.chart?.result?.[0];
  return (res?.indicators?.quote?.[0]?.close || []).filter(x => x != null);
}
export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  if (req.method === "OPTIONS") return res.status(200).end();
  try{
    const out = await Promise.allSettled(PAIRS.map(async ([s,n]) => ({ s, n, closes: await series(s) })));
    const pairs = out.filter(x => x.status==="fulfilled" && x.value.closes.length > 6).map(x => x.value);
    res.setHeader("Cache-Control","s-maxage=600, stale-while-revalidate=1800");
    return res.status(200).json({ pairs, source: "yahoo", ts: Date.now() });
  }catch(e){
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ pairs: [], source: "error", error: e.message });
  }
}
