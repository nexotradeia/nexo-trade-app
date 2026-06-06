// NexoTrade — Pre-Market & After-Hours (Yahoo/Stooq bloqueados en Vercel).
// Usa Twelve Data si hay TWELVE_DATA_KEY (cubre ETFs, índices, commodities, acciones).
// Stooq no expone sesión extendida → mostramos última sesión regular.
// Enrutado: /api/data?type=premarket&session=pre|post
const TD_KEY = process.env.TWELVE_DATA_KEY || "c55564b877964430bc84dbd46ff63b35";
const fmtVol = n => n==null||isNaN(n)?"—":n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(Math.round(n));

const ETFS    = [["SPY","SPY","S&P 500 ETF"],["QQQ","QQQ","Nasdaq 100 ETF"],["DIA","DIA","Dow Jones ETF"],["IWM","IWM","Russell 2000 ETF"]];
const INDICES = [["DJI","DJI","Dow Jones"],["SPX","SPX","S&P 500"],["IXIC","NDX","Nasdaq"]];
const COMMS   = [["XAU/USD","GOLD","Gold"],["WTI/USD","WTI","Crude Oil"],["XAG/USD","SILVER","Silver"]];
const STOCKS  = ["AAPL","MSFT","NVDA","AMZN","META","GOOGL","TSLA","AVGO","AMD","NFLX","JPM","WMT","PLTR","COIN","MU","MRVL","INTC","BA","UBER","SOFI","GME","SMCI","ARM","CRWD"];

async function tdQuote(symbols){
  if(!TD_KEY) return {};
  const r=await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${TD_KEY}`,{signal:AbortSignal.timeout(9000)});
  if(!r.ok) throw new Error("td "+r.status);
  const j=await r.json();
  return (symbols.length===1)?{[symbols[0]]:j}:j;
}
function shape(defs,data){
  return defs.map(([sym,s,n])=>{const q=data[sym];if(!q||q.close==null||q.status==="error")return null;const p=parseFloat(q.close);return {s,n,p:+p.toFixed(2),chg:+(+(q.percent_change??0)).toFixed(2),regChg:+(+(q.percent_change??0)).toFixed(2),vol:q.volume?parseFloat(q.volume):null,volFmt:fmtVol(q.volume?parseFloat(q.volume):null),ext:false};}).filter(Boolean);
}

export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method==="OPTIONS") return res.status(200).end();
  const session = req.query.session==="post" ? "post" : "pre";
  const et=new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
  const mins=et.getHours()*60+et.getMinutes(), wd=et.getDay()>=1&&et.getDay()<=5;
  const marketState = !wd?"CLOSED":mins>=240&&mins<570?"PRE":mins>=570&&mins<960?"REGULAR":mins>=960&&mins<1200?"POST":"CLOSED";
  try{
    if(!TD_KEY){ res.setHeader("Cache-Control","no-store"); return res.status(200).json({session,marketState,etfs:[],indices:[],commodities:[],mostActive:[],gainers:[],losers:[],source:"need-twelvedata-key"}); }
    const all=[...ETFS.map(x=>x[0]),...INDICES.map(x=>x[0]),...COMMS.map(x=>x[0]),...STOCKS];
    const data=await tdQuote(all);
    const etfs=shape(ETFS,data), indices=shape(INDICES,data), commodities=shape(COMMS,data);
    const stocks=shape(STOCKS.map(s=>[s,s,s]),data).filter(x=>x.p!=null);
    const mostActive=[...stocks].filter(x=>x.vol!=null).sort((a,b)=>(b.vol||0)-(a.vol||0)).slice(0,12);
    const gainers=[...stocks].sort((a,b)=>b.chg-a.chg).slice(0,8);
    const losers =[...stocks].sort((a,b)=>a.chg-b.chg).slice(0,8);
    res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({session,marketState,etfs,indices,commodities,mostActive,gainers,losers,source:"twelvedata",ts:Date.now()});
  }catch(e){
    console.error("[premarket]",e.message); res.setHeader("Cache-Control","no-store");
    return res.status(200).json({session,etfs:[],indices:[],commodities:[],mostActive:[],gainers:[],losers:[],source:"error",error:e.message});
  }
}
