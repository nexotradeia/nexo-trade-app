// NexoTrade — Datos de mercado para Vercel (Yahoo/Stooq bloqueados).
// Forex: Frankfurter (ECB, sin key). ETFs/Commodities/Índices: Twelve Data (si hay TWELVE_DATA_KEY). Crypto: CoinGecko.
// /api/data?type=quotes&set=etfs|commodities|forex|bonds|overview
const fmtVol = n => n==null||isNaN(n)?"—":n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(Math.round(n));
const TD_KEY = process.env.TWELVE_DATA_KEY || "";

// ── FOREX vía Frankfurter (ECB) ──
const FX_CCY = ["EUR","GBP","JPY","CHF","AUD","CAD","NZD","MXN","BRL","CNY"];
const FX_PAIRS = [
  ["EURUSD","EUR/USD"],["GBPUSD","GBP/USD"],["USDJPY","USD/JPY"],["USDCHF","USD/CHF"],
  ["AUDUSD","AUD/USD"],["USDCAD","USD/CAD"],["NZDUSD","NZD/USD"],["EURGBP","EUR/GBP"],
  ["USDMXN","USD/MXN"],["USDBRL","USD/BRL"],["USDCNY","USD/CNY"],["EURJPY","EUR/JPY"],["GBPJPY","GBP/JPY"],
];
const pairVal = (r, pair) => {
  const g=c=>r[c]; // unidades de c por 1 USD
  switch(pair){
    case"EURUSD":return 1/g("EUR");case"GBPUSD":return 1/g("GBP");case"USDJPY":return g("JPY");
    case"USDCHF":return g("CHF");case"AUDUSD":return 1/g("AUD");case"USDCAD":return g("CAD");
    case"NZDUSD":return 1/g("NZD");case"EURGBP":return g("GBP")/g("EUR");case"USDMXN":return g("MXN");
    case"USDBRL":return g("BRL");case"USDCNY":return g("CNY");case"EURJPY":return g("JPY")/g("EUR");
    case"GBPJPY":return g("JPY")/g("GBP");default:return null;
  }
};
const ymd = d => d.toISOString().slice(0,10);
async function frankfurter(fromDays){
  const start=ymd(new Date(Date.now()-fromDays*864e5));
  const r=await fetch(`https://api.frankfurter.app/${start}..?from=USD&to=${FX_CCY.join(",")}`,{signal:AbortSignal.timeout(8000)});
  if(!r.ok) throw new Error("frankfurter "+r.status);
  const j=await r.json();
  const dates=Object.keys(j.rates||{}).sort();
  return { dates, rates:j.rates||{} };
}
async function forexRows(){
  const {dates,rates}=await frankfurter(8);
  if(dates.length<2) return [];
  const cur=rates[dates[dates.length-1]], prev=rates[dates[dates.length-2]];
  return FX_PAIRS.map(([s,n])=>{const p=pairVal(cur,s),pp=pairVal(prev,s);if(!p||!pp)return null;return {s,n,p:+p.toFixed(s.includes("JPY")?2:5),chg:+(((p-pp)/pp)*100).toFixed(2),regChg:+(((p-pp)/pp)*100).toFixed(2),vol:null,volFmt:"—"};}).filter(Boolean);
}

// ── Twelve Data (ETFs / commodities / índices) ──
async function twelveData(symbols){
  if(!TD_KEY) return [];
  const r=await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.map(s=>s[0]).join(","))}&apikey=${TD_KEY}`,{signal:AbortSignal.timeout(9000)});
  if(!r.ok) throw new Error("td "+r.status);
  const j=await r.json();
  const get=sym=> (j[sym]!==undefined?j[sym]:(symbols.length===1?j:null));
  return symbols.map(([sym,s,n])=>{const q=get(sym);if(!q||q.close==null||q.status==="error")return null;const p=parseFloat(q.close);return {s,n,p,chg:+(+(q.percent_change??0)).toFixed(2),regChg:+(+(q.percent_change??0)).toFixed(2),vol:q.volume?parseFloat(q.volume):null,volFmt:fmtVol(q.volume?parseFloat(q.volume):null)};}).filter(Boolean);
}
const TD_SETS = {
  etfs:[["SPY","SPY","S&P 500 ETF"],["QQQ","QQQ","Nasdaq 100 ETF"],["IWM","IWM","Russell 2000 ETF"],["DIA","DIA","Dow Jones ETF"],["GLD","GLD","Gold ETF"],["SLV","SLV","Silver ETF"],["TLT","TLT","20Y Treasury"],["XLF","XLF","Financials"],["XLK","XLK","Technology"],["XLE","XLE","Energy"],["ARKK","ARKK","ARK Innovation"],["SMH","SMH","Semiconductors"]],
  commodities:[["XAU/USD","GOLD","Gold"],["XAG/USD","SILVER","Silver"],["WTI/USD","WTI","Crude Oil (WTI)"],["XPT/USD","PLATINUM","Platinum"],["XPD/USD","PALLADIUM","Palladium"],["XCU/USD","COPPER","Copper"]],
  indices:[["SPX","SPX","S&P 500"],["IXIC","NDX","Nasdaq"],["DJI","DJI","Dow Jones"]],
};

async function coingeckoTop(n=5){
  const r=await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${n}&page=1`,{headers:{accept:"application/json"},signal:AbortSignal.timeout(8000)});
  if(!r.ok) throw new Error("cg "+r.status);
  return (await r.json()).map(c=>({s:(c.symbol||"").toUpperCase(),n:c.name,p:c.current_price,chg:+(+(c.price_change_percentage_24h??0)).toFixed(2),regChg:+(+(c.price_change_percentage_24h??0)).toFixed(2)}));
}

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,OPTIONS");
  if(req.method==="OPTIONS") return res.status(200).end();
  const set=String(req.query.set||"etfs").trim();
  try{
    if(set==="forex"){ const rows=await forexRows(); res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate=900"); return res.status(200).json({set,rows,source:"frankfurter",ts:Date.now()}); }
    if(set==="overview"){
      const [indices,crypto,comm]=await Promise.all([twelveData(TD_SETS.indices).catch(()=>[]),coingeckoTop(5).catch(()=>[]),twelveData(TD_SETS.commodities.slice(0,4)).catch(()=>[])]);
      res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=600");
      return res.status(200).json({indices,crypto,commodities:comm,source:TD_KEY?"twelvedata+coingecko":"coingecko(need TD key)",ts:Date.now()});
    }
    if(set==="bonds"){ res.setHeader("Cache-Control","no-store"); return res.status(200).json({set,rows:[],source:"unavailable",note:"treasury source pending"}); }
    const defs=TD_SETS[set];
    if(!defs){ res.setHeader("Cache-Control","no-store"); return res.status(400).json({error:"unknown set: "+set}); }
    const rows=await twelveData(defs);
    res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({set,rows,source:TD_KEY?"twelvedata":"need-twelvedata-key",ts:Date.now()});
  }catch(e){
    console.error("[quotes]",e.message); res.setHeader("Cache-Control","no-store");
    return res.status(200).json({set,rows:[],source:"error",error:e.message});
  }
}
