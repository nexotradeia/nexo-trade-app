// NexoTrade — Pre-Market & After-Hours vía Stooq (Yahoo está bloqueado en Vercel).
// Stooq no expone sesión extendida, así que mostramos la última sesión regular
// (ETFs, índices, commodities y movers) para que la página nunca quede vacía.
// GET /api/premarket?session=pre|post
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "text/csv,*/*" };
const fmtVol = n => n==null||isNaN(n)?"—":n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(Math.round(n));
const ymd = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;

const ETFS    = [["spy.us","SPY","S&P 500 ETF"],["qqq.us","QQQ","Nasdaq 100 ETF"],["dia.us","DIA","Dow Jones ETF"],["iwm.us","IWM","Russell 2000 ETF"]];
const INDICES = [["^dji","DJI","Dow Jones"],["^spx","SPX","S&P 500"],["^ndq","NDX","Nasdaq"],["^vix","VIX","VIX"]];
const COMMS   = [["gc.f","GOLD","Gold"],["cl.f","WTI","Crude Oil"],["si.f","SILVER","Silver"],["ng.f","NATGAS","Natural Gas"]];
const STOCKS  = ["aapl.us","msft.us","nvda.us","amzn.us","meta.us","googl.us","tsla.us","avgo.us","amd.us","nflx.us","jpm.us","wmt.us","xom.us","lly.us","pltr.us","coin.us","mu.us","mrvl.us","intc.us","ba.us","dis.us","uber.us","sofi.us","gme.us","smci.us","arm.us","crwd.us","snow.us","shop.us","pypl.us"];

async function stooqCloses(sym){
  const d1 = ymd(new Date(Date.now()-10*864e5));
  const r = await fetch(`https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=d&d1=${d1}`, { headers: UA, signal: AbortSignal.timeout(8000) });
  if(!r.ok) throw new Error("stooq "+r.status);
  const txt = await r.text();
  if(!txt || !txt.includes(",")) return { closes:[], vols:[] };
  const rows = txt.trim().split(/\r?\n/).slice(1).map(l=>l.split(","));
  return { closes: rows.map(c=>parseFloat(c[4])).filter(x=>!isNaN(x)), vols: rows.map(c=>parseFloat(c[5])).filter(x=>!isNaN(x)) };
}
async function fetchDefs(defs){
  const out = await Promise.allSettled(defs.map(async ([sym,s,n])=>{
    const { closes, vols } = await stooqCloses(sym);
    if(closes.length<2) return null;
    const p=closes[closes.length-1], prev=closes[closes.length-2], vol=vols.length?vols[vols.length-1]:null;
    return { s, n, p:+p.toFixed(2), chg:+(((p-prev)/prev)*100).toFixed(2), regChg:+(((p-prev)/prev)*100).toFixed(2), vol, volFmt:fmtVol(vol), ext:false };
  }));
  return out.filter(x=>x.status==="fulfilled" && x.value).map(x=>x.value);
}

export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method==="OPTIONS") return res.status(200).end();
  const session = req.query.session==="post" ? "post" : "pre";
  // estado de mercado en ET
  const et=new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
  const mins=et.getHours()*60+et.getMinutes(), wd=et.getDay()>=1&&et.getDay()<=5;
  const marketState = !wd?"CLOSED":mins>=240&&mins<570?"PRE":mins>=570&&mins<960?"REGULAR":mins>=960&&mins<1200?"POST":"CLOSED";
  try{
    const stockDefs = STOCKS.map(s=>[s, s.replace(".us","").toUpperCase(), s.replace(".us","").toUpperCase()]);
    const [etfs, indices, commodities, stocks] = await Promise.all([
      fetchDefs(ETFS), fetchDefs(INDICES), fetchDefs(COMMS), fetchDefs(stockDefs),
    ]);
    const withMove = stocks.filter(x=>x.p!=null);
    const mostActive = [...withMove].filter(x=>x.vol!=null).sort((a,b)=>(b.vol||0)-(a.vol||0)).slice(0,12);
    const gainers = [...withMove].sort((a,b)=>b.chg-a.chg).slice(0,8);
    const losers  = [...withMove].sort((a,b)=>a.chg-b.chg).slice(0,8);
    res.setHeader("Cache-Control","s-maxage=90, stale-while-revalidate=300");
    return res.status(200).json({ session, marketState, etfs, indices, commodities, mostActive, gainers, losers, source:"stooq", ts:Date.now() });
  }catch(e){
    console.error("[premarket] error:", e.message);
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ session, etfs:[], indices:[], commodities:[], mostActive:[], gainers:[], losers:[], source:"error", error:e.message });
  }
}
