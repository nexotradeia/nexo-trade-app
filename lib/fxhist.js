// NexoTrade — Histórico diario de pares FX vía Stooq (para correlación y volatilidad)
// /api/data?type=fxhist  →  { pairs:[{s,n,closes:[...]}], source }
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "text/csv,*/*" };
const PAIRS = [
  ["eurusd","EUR/USD"],["gbpusd","GBP/USD"],["usdjpy","USD/JPY"],["usdchf","USD/CHF"],
  ["audusd","AUD/USD"],["usdcad","USD/CAD"],["nzdusd","NZD/USD"],["eurjpy","EUR/JPY"],
  ["gbpjpy","GBP/JPY"],["eurgbp","EUR/GBP"],
];
const ymd = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
async function closes(sym){
  const d1 = ymd(new Date(Date.now()-75*864e5));
  const r = await fetch(`https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=d&d1=${d1}`, { headers: UA, signal: AbortSignal.timeout(8000) });
  if(!r.ok) throw new Error("stooq HTTP "+r.status);
  const txt = await r.text();
  if(!txt || !txt.includes(",")) return [];
  return txt.trim().split(/\r?\n/).slice(1).map(l=>parseFloat(l.split(",")[4])).filter(x=>!isNaN(x));
}
export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method==="OPTIONS") return res.status(200).end();
  try{
    const out = await Promise.allSettled(PAIRS.map(async ([s,n])=>({ s, n, closes: await closes(s) })));
    const pairs = out.filter(x=>x.status==="fulfilled" && x.value.closes.length>6).map(x=>x.value);
    res.setHeader("Cache-Control","s-maxage=600, stale-while-revalidate=1800");
    return res.status(200).json({ pairs, source:"stooq", ts:Date.now() });
  }catch(e){
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ pairs:[], source:"error", error:e.message });
  }
}
