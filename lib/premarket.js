// NexoTrade — Pre-Market & After-Hours vía Finnhub (Yahoo/Stooq bloqueados en Vercel).
// Finnhub no expone sesión extendida en free → mostramos última sesión regular.
// Enrutado: /api/data?type=premarket&session=pre|post
const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
async function fh(sym){
  const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FK}`,{signal:AbortSignal.timeout(7000)});
  if(!r.ok) throw new Error("fh "+r.status);
  const j=await r.json();
  if(j.c==null||j.c===0) return null;
  return { p:+j.c, chg:+(+(j.dp??0)).toFixed(2) };
}
async function fhSet(defs){
  const out=await Promise.allSettled(defs.map(async([sym,s,n])=>{const q=await fh(sym);if(!q)return null;return {s,n,p:+q.p.toFixed(2),chg:q.chg,regChg:q.chg,vol:null,volFmt:"—",ext:false};}));
  return out.filter(x=>x.status==="fulfilled"&&x.value).map(x=>x.value);
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// Llamadas por lotes para no exceder el límite por segundo de Finnhub (free)
async function fhSetChunked(defs,size=12,gap=1100){
  const out=[];
  for(let i=0;i<defs.length;i+=size){
    out.push(...await fhSet(defs.slice(i,i+size)));
    if(i+size<defs.length) await sleep(gap);
  }
  return out;
}
const ETFS=[["SPY","SPY","S&P 500 ETF"],["QQQ","QQQ","Nasdaq 100 ETF"],["DIA","DIA","Dow Jones ETF"],["IWM","IWM","Russell 2000 ETF"]];
const INDICES=[["SPY","SPY","S&P 500 (SPY)"],["QQQ","QQQ","Nasdaq 100 (QQQ)"],["DIA","DIA","Dow 30 (DIA)"],["IWM","IWM","Russell 2000 (IWM)"]];
const COMMS=[["GLD","GOLD","Gold (GLD)"],["SLV","SILVER","Silver (SLV)"],["USO","WTI","Crude Oil (USO)"],["UNG","NATGAS","Natural Gas (UNG)"],["CPER","COPPER","Copper (CPER)"]];
const STOCKS=["AAPL","MSFT","NVDA","AMZN","META","GOOGL","TSLA","AVGO","AMD","NFLX","JPM","WMT","PLTR","COIN","MU","MRVL","INTC","BA","UBER","SOFI","GME","SMCI","ARM","CRWD","LLY","XOM","DIS","PYPL","SHOP","BAC"];

export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method==="OPTIONS") return res.status(200).end();
  const session = req.query.session==="post" ? "post" : "pre";
  const et=new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
  const mins=et.getHours()*60+et.getMinutes(), wd=et.getDay()>=1&&et.getDay()<=5;
  const marketState = !wd?"CLOSED":mins>=240&&mins<570?"PRE":mins>=570&&mins<960?"REGULAR":mins>=960&&mins<1200?"POST":"CLOSED";
  try{
    const [etfs, indices, commodities, stocks] = await Promise.all([
      fhSet(ETFS), fhSet(INDICES), fhSet(COMMS), fhSet(STOCKS.map(s=>[s,s,s])),
    ]);
    const sv=stocks.filter(x=>x.p!=null);
    const gainers=[...sv].sort((a,b)=>b.chg-a.chg).slice(0,30);
    const losers =[...sv].sort((a,b)=>a.chg-b.chg).slice(0,30);
    const mostActive=[...sv].sort((a,b)=>Math.abs(b.chg)-Math.abs(a.chg)).slice(0,30);
    res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({session,marketState,etfs,indices,commodities,mostActive,gainers,losers,source:"finnhub",ts:Date.now()});
  }catch(e){
    console.error("[premarket]",e.message); res.setHeader("Cache-Control","no-store");
    return res.status(200).json({session,etfs:[],indices:[],commodities:[],mostActive:[],gainers:[],losers:[],source:"error",error:e.message});
  }
}
