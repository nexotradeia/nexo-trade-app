// NexoTrade — Cotizaciones vía Stooq (sin API key, funciona desde Vercel).
// Yahoo está bloqueado en Vercel, por eso usamos Stooq para ETFs/commodities/forex/bonos
// y CoinGecko para crypto. /api/data?type=quotes&set=etfs|commodities|forex|bonds|overview
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "text/csv,*/*" };

const fmtUsd = n => n==null?"—":n>=1e12?"$"+(n/1e12).toFixed(2)+"T":n>=1e9?"$"+(n/1e9).toFixed(1)+"B":n>=1e6?"$"+(n/1e6).toFixed(1)+"M":"$"+Math.round(n).toLocaleString();
const fmtVol = n => n==null||isNaN(n)?"—":n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(Math.round(n));
const ymd = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;

// [stooqSymbol, outputSymbol, displayName]
const SETS = {
  etfs: [
    ["spy.us","SPY","S&P 500 ETF"],["qqq.us","QQQ","Nasdaq 100 ETF"],["iwm.us","IWM","Russell 2000 ETF"],["dia.us","DIA","Dow Jones ETF"],
    ["vti.us","VTI","Total Market"],["voo.us","VOO","Vanguard S&P 500"],["gld.us","GLD","Gold ETF"],["slv.us","SLV","Silver ETF"],
    ["tlt.us","TLT","20Y Treasury"],["xlf.us","XLF","Financials"],["xlk.us","XLK","Technology"],["xle.us","XLE","Energy"],
    ["arkk.us","ARKK","ARK Innovation"],["eem.us","EEM","Emerging Mkts"],["smh.us","SMH","Semiconductors"],["xlv.us","XLV","Health Care"],
    ["xly.us","XLY","Consumer Disc."],["schd.us","SCHD","Dividend ETF"],["vnq.us","VNQ","Real Estate"],["efa.us","EFA","EAFE Intl"],
  ],
  commodities: [
    ["gc.f","GOLD","Gold"],["si.f","SILVER","Silver"],["cl.f","WTI","Crude Oil (WTI)"],["ng.f","NATGAS","Natural Gas"],
    ["hg.f","COPPER","Copper"],["zw.f","WHEAT","Wheat"],["zc.f","CORN","Corn"],["zs.f","SOYBEAN","Soybeans"],
    ["pl.f","PLATINUM","Platinum"],["pa.f","PALLADIUM","Palladium"],["kc.f","COFFEE","Coffee"],["sb.f","SUGAR","Sugar"],
  ],
  forex: [
    ["eurusd","EURUSD","EUR/USD"],["gbpusd","GBPUSD","GBP/USD"],["usdjpy","USDJPY","USD/JPY"],["usdchf","USDCHF","USD/CHF"],
    ["audusd","AUDUSD","AUD/USD"],["usdcad","USDCAD","USD/CAD"],["nzdusd","NZDUSD","NZD/USD"],["eurgbp","EURGBP","EUR/GBP"],
    ["usdmxn","USDMXN","USD/MXN"],["usdbrl","USDBRL","USD/BRL"],["usdcny","USDCNY","USD/CNY"],["eurjpy","EURJPY","EUR/JPY"],["gbpjpy","GBPJPY","GBP/JPY"],
  ],
  bonds: [
    ["13usy.b","^IRX","US 13-Week (3M)"],["2usy.b","2YY=F","US 2-Year"],["5usy.b","^FVX","US 5-Year"],
    ["10usy.b","^TNX","US 10-Year"],["30usy.b","^TYX","US 30-Year"],
  ],
};

async function stooqCloses(sym, daysAgo){
  const d1 = ymd(new Date(Date.now()-daysAgo*864e5));
  const r = await fetch(`https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=d&d1=${d1}`, { headers: UA, signal: AbortSignal.timeout(8000) });
  if(!r.ok) throw new Error("stooq HTTP "+r.status);
  const txt = await r.text();
  if(!txt || !txt.includes(",") || txt.toLowerCase().includes("no data")) return { closes:[], vols:[] };
  const rows = txt.trim().split(/\r?\n/).slice(1).map(l=>l.split(","));
  const closes = rows.map(c=>parseFloat(c[4])).filter(x=>!isNaN(x));
  const vols   = rows.map(c=>parseFloat(c[5])).filter(x=>!isNaN(x));
  return { closes, vols };
}

async function fetchSet(defs, daysAgo=10){
  const out = await Promise.allSettled(defs.map(async ([sym,s,n])=>{
    const { closes, vols } = await stooqCloses(sym, daysAgo);
    if(closes.length<2) return null;
    const p = closes[closes.length-1], prev = closes[closes.length-2];
    const vol = vols.length ? vols[vols.length-1] : null;
    return { s, n, p:+p, chg:+(((p-prev)/prev)*100).toFixed(2), regChg:+(((p-prev)/prev)*100).toFixed(2), vol, volFmt:fmtVol(vol) };
  }));
  return out.filter(x=>x.status==="fulfilled" && x.value).map(x=>x.value);
}

async function coingeckoTop(n=5){
  const r = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${n}&page=1`, { headers:{accept:"application/json"}, signal: AbortSignal.timeout(8000) });
  if(!r.ok) throw new Error("cg "+r.status);
  return (await r.json()).map(c=>({ s:(c.symbol||"").toUpperCase(), n:c.name, p:c.current_price, chg:+(+(c.price_change_percentage_24h??0)).toFixed(2), regChg:+(+(c.price_change_percentage_24h??0)).toFixed(2) }));
}

export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,OPTIONS");
  if(req.method==="OPTIONS") return res.status(200).end();
  const set = String(req.query.set||"etfs").trim();
  try{
    if(set==="overview"){
      const [indices, crypto, comm] = await Promise.all([
        fetchSet([["^spx","SPX","S&P 500"],["^ndq","NDX","Nasdaq"],["^dji","DJI","Dow Jones"],["^vix","VIX","VIX"]]),
        coingeckoTop(5).catch(()=>[]),
        fetchSet([["gc.f","GOLD","Gold"],["cl.f","WTI","Crude Oil"],["ng.f","NATGAS","Natural Gas"],["si.f","SILVER","Silver"]]),
      ]);
      res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=300");
      return res.status(200).json({ indices, crypto, commodities:comm, source:"stooq+coingecko", ts:Date.now() });
    }
    const defs = SETS[set];
    if(!defs){ res.setHeader("Cache-Control","no-store"); return res.status(400).json({ error:"unknown set: "+set }); }
    const rows = await fetchSet(defs, set==="bonds"?12:10);
    let extra = {};
    if(set==="bonds"){ const y10=rows.find(r=>r.s==="^TNX")?.p, y2=rows.find(r=>r.s==="2YY=F")?.p; if(y10!=null&&y2!=null) extra.spread10_2=+(y10-y2).toFixed(2); }
    res.setHeader("Cache-Control","s-maxage=90, stale-while-revalidate=300");
    return res.status(200).json({ set, rows, ...extra, source:"stooq", ts:Date.now() });
  }catch(e){
    console.error("[quotes] error:", e.message);
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ set, rows:[], source:"error", error:e.message });
  }
}
