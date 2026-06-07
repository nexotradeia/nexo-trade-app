// NexoTrade — Datos de mercado para Vercel (Yahoo/Stooq bloqueados).
// Forex: Frankfurter (ECB). ETFs/Índices: Finnhub (60/min). Commodities: Twelve Data (8/min, caché largo). Crypto: CoinGecko.
// /api/data?type=quotes&set=etfs|commodities|forex|bonds|overview
const fmtVol = n => n==null||isNaN(n)?"—":n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(Math.round(n));
const TD_KEY = process.env.TWELVE_DATA_KEY || "c55564b877964430bc84dbd46ff63b35";
const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";

// ── Finnhub (ETFs, índices vía proxies) ──
async function fh(sym){
  const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FK}`,{signal:AbortSignal.timeout(7000)});
  if(!r.ok) throw new Error("fh "+r.status);
  const j=await r.json();
  if(j.c==null||j.c===0) return null;
  return { p:+j.c, chg:+(+(j.dp??0)).toFixed(2) };
}
async function fhSet(defs){
  const out=await Promise.allSettled(defs.map(async([sym,s,n])=>{const q=await fh(sym);if(!q)return null;return {s,n,p:q.p,chg:q.chg,regChg:q.chg,vol:null,volFmt:"—"};}));
  return out.filter(x=>x.status==="fulfilled"&&x.value).map(x=>x.value);
}
const ETFS=[["SPY","SPY","S&P 500 ETF"],["QQQ","QQQ","Nasdaq 100 ETF"],["IWM","IWM","Russell 2000 ETF"],["DIA","DIA","Dow Jones ETF"],["GLD","GLD","Gold ETF"],["SLV","SLV","Silver ETF"],["TLT","TLT","20Y Treasury"],["XLF","XLF","Financials"],["XLK","XLK","Technology"],["XLE","XLE","Energy"],["ARKK","ARKK","ARK Innovation"],["SMH","SMH","Semiconductors"]];
const IDX_PROXY=[["SPY","SPY","S&P 500 (SPY)"],["QQQ","QQQ","Nasdaq 100 (QQQ)"],["DIA","DIA","Dow 30 (DIA)"],["IWM","IWM","Russell 2000 (IWM)"]];
// Mercados por región — ETFs por país vía Finnhub (rastrean el índice local). [símbolo, código, etiqueta]
const REGIONS={
  europe:[["EWG","DAX","Alemania · DAX"],["EWU","FTSE","Reino Unido · FTSE 100"],["EWQ","CAC","Francia · CAC 40"],["EWP","IBEX","España · IBEX 35"],["EWI","MIB","Italia · FTSE MIB"],["EWL","SMI","Suiza · SMI"]],
  asia:[["EWJ","NIKKEI","Japón · Nikkei 225"],["MCHI","CHINA","China · MSCI China"],["EWH","HSI","Hong Kong · Hang Seng"],["EWA","ASX","Australia · ASX 200"],["INDA","NIFTY","India · Nifty 50"],["EWY","KOSPI","Corea · KOSPI"]],
  latam:[["EWZ","BOVESPA","Brasil · Bovespa (B3)"],["EWW","IPC","México · IPC (BMV)"],["ARGT","MERVAL","Argentina · Merval"],["ILF","LATAM","Latinoamérica · ILF"],["ECH","IPSA","Chile · IPSA"],["GXG","COLCAP","Colombia · MSCI"]],
};

// ── Forex (Frankfurter/ECB) ──
const FX_CCY=["EUR","GBP","JPY","CHF","AUD","CAD","NZD","MXN","BRL","CNY"];
const FX_PAIRS=[["EURUSD","EUR/USD"],["GBPUSD","GBP/USD"],["USDJPY","USD/JPY"],["USDCHF","USD/CHF"],["AUDUSD","AUD/USD"],["USDCAD","USD/CAD"],["NZDUSD","NZD/USD"],["EURGBP","EUR/GBP"],["USDMXN","USD/MXN"],["USDBRL","USD/BRL"],["USDCNY","USD/CNY"],["EURJPY","EUR/JPY"],["GBPJPY","GBP/JPY"]];
const pv=(r,p)=>{const g=c=>r[c];switch(p){case"EURUSD":return 1/g("EUR");case"GBPUSD":return 1/g("GBP");case"USDJPY":return g("JPY");case"USDCHF":return g("CHF");case"AUDUSD":return 1/g("AUD");case"USDCAD":return g("CAD");case"NZDUSD":return 1/g("NZD");case"EURGBP":return g("GBP")/g("EUR");case"USDMXN":return g("MXN");case"USDBRL":return g("BRL");case"USDCNY":return g("CNY");case"EURJPY":return g("JPY")/g("EUR");case"GBPJPY":return g("JPY")/g("GBP");default:return null;}};
async function forexRows(){
  const start=new Date(Date.now()-8*864e5).toISOString().slice(0,10);
  const r=await fetch(`https://api.frankfurter.app/${start}..?from=USD&to=${FX_CCY.join(",")}`,{signal:AbortSignal.timeout(8000)});
  if(!r.ok) throw new Error("frankfurter "+r.status);
  const j=await r.json();const dates=Object.keys(j.rates||{}).sort();
  if(dates.length<2) return [];
  const cur=j.rates[dates[dates.length-1]],prev=j.rates[dates[dates.length-2]];
  return FX_PAIRS.map(([s,n])=>{const p=pv(cur,s),pp=pv(prev,s);if(!p||!pp)return null;return {s,n,p:+p.toFixed(s.includes("JPY")?2:5),chg:+(((p-pp)/pp)*100).toFixed(2),regChg:+(((p-pp)/pp)*100).toFixed(2),vol:null,volFmt:"—"};}).filter(Boolean);
}

// ── Commodities (ETFs proxy vía Finnhub — fiable y completo) ──
const COMM_ETF=[["USO","WTI","Crude Oil (USO)"],["BNO","BRENT","Brent Oil (BNO)"],["UNG","NATGAS","Natural Gas (UNG)"],["GLD","GOLD","Gold (GLD)"],["SLV","SILVER","Silver (SLV)"],["CPER","COPPER","Copper (CPER)"],["PPLT","PLATINUM","Platinum (PPLT)"],["PALL","PALLADIUM","Palladium (PALL)"],["WEAT","WHEAT","Wheat (WEAT)"],["CORN","CORN","Corn (CORN)"],["SOYB","SOYBEAN","Soybeans (SOYB)"],["JO","COFFEE","Coffee (JO)"]];
async function tdCommodities(){ return fhSet(COMM_ETF); }

// ── Bonos / Rendimientos del Tesoro USA (fuente oficial home.treasury.gov) ──
async function treasuryBonds(){
  const yr=new Date().getFullYear();
  const r=await fetch(`https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${yr}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${yr}&page&_format=csv`,{signal:AbortSignal.timeout(9000),headers:{"User-Agent":"Mozilla/5.0"}});
  if(!r.ok) throw new Error("treasury "+r.status);
  const txt=await r.text();
  const lines=txt.trim().split(/\r?\n/);
  if(lines.length<2) return [];
  const head=lines[0].split(",").map(s=>s.replace(/"/g,"").trim());
  const last=lines[1].split(",");
  const col=name=>{const i=head.indexOf(name);return i>=0?parseFloat((last[i]||"").replace(/"/g,"")):null;};
  const map=[["3 Mo","^IRX","US 13-Week (3M)"],["2 Yr","2YY=F","US 2-Year"],["5 Yr","^FVX","US 5-Year"],["10 Yr","^TNX","US 10-Year"],["30 Yr","^TYX","US 30-Year"]];
  return map.map(([c,s,n])=>{const v=col(c);return (v==null||isNaN(v))?null:{s,n,p:v,chg:0,regChg:0};}).filter(Boolean);
}

// Índices reales vía Twelve Data (con respaldo a ETF proxy si falla)
async function indicesReal(){
  if(TD_KEY){
    try{
      const defs=[["SPX","SPX","S&P 500"],["IXIC","NDX","Nasdaq"],["DJI","DJI","Dow Jones"],["RUT","RUT","Russell 2000"]];
      const r=await fetch(`https://api.twelvedata.com/quote?symbol=${defs.map(d=>d[0]).join(",")}&apikey=${TD_KEY}`,{signal:AbortSignal.timeout(9000)});
      if(r.ok){const j=await r.json();const rows=defs.map(([sym,s,n])=>{const q=j[sym]!==undefined?j[sym]:null;if(!q||q.close==null||q.status==="error")return null;return {s,n,p:+parseFloat(q.close).toFixed(2),chg:+(+(q.percent_change??0)).toFixed(2),regChg:+(+(q.percent_change??0)).toFixed(2),vol:null,volFmt:"—"};}).filter(Boolean);if(rows.length>=2) return rows;}
    }catch(e){}
  }
  return fhSet(IDX_PROXY); // respaldo: ETF proxy
}

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
    if(set==="etfs"){ const rows=await fhSet(ETFS); res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=600"); return res.status(200).json({set,rows,source:"finnhub",ts:Date.now()}); }
    if(set==="commodities"){ const rows=await tdCommodities(); res.setHeader("Cache-Control","s-maxage=600, stale-while-revalidate=1800"); return res.status(200).json({set,rows,source:"twelvedata",ts:Date.now()}); }
    if(set==="overview"){
      const [indices,crypto,comm]=await Promise.all([indicesReal().catch(()=>[]),coingeckoTop(5).catch(()=>[]),tdCommodities().then(r=>r.slice(0,4)).catch(()=>[])]);
      res.setHeader("Cache-Control","s-maxage=180, stale-while-revalidate=600");
      return res.status(200).json({indices,crypto,commodities:comm,source:"finnhub+coingecko+td",ts:Date.now()});
    }
    if(set==="bonds"){ const rows=await treasuryBonds(); const y10=rows.find(r=>r.s==="^TNX")?.p,y2=rows.find(r=>r.s==="2YY=F")?.p; const extra=(y10!=null&&y2!=null)?{spread10_2:+(y10-y2).toFixed(2)}:{}; res.setHeader("Cache-Control","s-maxage=3600, stale-while-revalidate=7200"); return res.status(200).json({set,rows,...extra,source:"treasury",ts:Date.now()}); }
    if(REGIONS[set]){ const rows=await fhSet(REGIONS[set]); res.setHeader("Cache-Control","s-maxage=180, stale-while-revalidate=600"); return res.status(200).json({set,rows,source:"finnhub-etf",ts:Date.now()}); }
    res.setHeader("Cache-Control","no-store"); return res.status(400).json({error:"unknown set: "+set});
  }catch(e){
    console.error("[quotes]",e.message); res.setHeader("Cache-Control","no-store");
    return res.status(200).json({set,rows:[],source:"error",error:e.message});
  }
}
