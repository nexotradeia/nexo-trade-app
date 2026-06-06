// NexoTrade — Histórico FX vía Frankfurter (ECB, sin key) para correlación/volatilidad
// /api/data?type=fxhist  →  { pairs:[{s,n,closes:[...]}], source }
const CCY=["EUR","GBP","JPY","CHF","AUD","CAD","NZD"];
const PAIRS=[["EURUSD","EUR/USD"],["GBPUSD","GBP/USD"],["USDJPY","USD/JPY"],["USDCHF","USD/CHF"],["AUDUSD","AUD/USD"],["USDCAD","USD/CAD"],["NZDUSD","NZD/USD"],["EURGBP","EUR/GBP"],["EURJPY","EUR/JPY"],["GBPJPY","GBP/JPY"]];
const pv=(r,p)=>{const g=c=>r[c];switch(p){case"EURUSD":return 1/g("EUR");case"GBPUSD":return 1/g("GBP");case"USDJPY":return g("JPY");case"USDCHF":return g("CHF");case"AUDUSD":return 1/g("AUD");case"USDCAD":return g("CAD");case"NZDUSD":return 1/g("NZD");case"EURGBP":return g("GBP")/g("EUR");case"EURJPY":return g("JPY")/g("EUR");case"GBPJPY":return g("JPY")/g("GBP");default:return null;}};
const ymd=d=>d.toISOString().slice(0,10);
export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method==="OPTIONS") return res.status(200).end();
  try{
    const start=ymd(new Date(Date.now()-80*864e5));
    const r=await fetch(`https://api.frankfurter.app/${start}..?from=USD&to=${CCY.join(",")}`,{signal:AbortSignal.timeout(9000)});
    if(!r.ok) throw new Error("frankfurter "+r.status);
    const j=await r.json();
    const dates=Object.keys(j.rates||{}).sort();
    const pairs=PAIRS.map(([s,n])=>{const closes=dates.map(d=>pv(j.rates[d],s)).filter(x=>x!=null&&!isNaN(x));return {s,n,closes};}).filter(p=>p.closes.length>6);
    res.setHeader("Cache-Control","s-maxage=3600, stale-while-revalidate=7200");
    return res.status(200).json({pairs,source:"frankfurter",ts:Date.now()});
  }catch(e){
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({pairs:[],source:"error",error:e.message});
  }
}
