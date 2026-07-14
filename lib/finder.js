// NexoTrade — Motor de SETUPS de acciones REALES (Smart Money / Finder Pro).
// Reutiliza el endpoint técnico (que ya calcula RSI/SMA/MACD/target reales vía
// Twelve Data y está cacheado 1h en el CDN). Por cada acción del universo lee
// /api/data?type=technical y construye un setup con score 0-100, señales
// (VOL/BRK/MOM/SM/CAT), objetivo, stop, entrada y tesis bilingüe. Cache 1h.
// GET /api/data?type=finder — Educativo, no es consejo financiero.

const BASE = process.env.FINDER_BASE || "https://nexotradeia.com";

const UNIVERSE = [
  "NVDA","AAPL","MSFT","GOOGL","AMZN","META","TSLA",      // mega tech
  "AMD","AVGO","SMCI","INTC",                              // semis
  "JPM","BAC","V",                                          // finanzas
  "COIN","MSTR",                                            // cripto-proxy
  "PLTR","SOFI",                                            // growth
  "XOM","CVX","KO",                                         // energía/consumo
  "DIS","NKE",                                              // consumo
  "SPY","QQQ",                                              // ETFs
  "SKHY",                                                  // IPO reciente (SK hynix, debut Nasdaq 10 jul 2026)
];

const NAMES = {
  NVDA:"NVIDIA", AAPL:"Apple", MSFT:"Microsoft", GOOGL:"Alphabet", AMZN:"Amazon",
  META:"Meta", TSLA:"Tesla", AMD:"AMD", AVGO:"Broadcom", MU:"Micron", SMCI:"Super Micro",
  JPM:"JPMorgan", BAC:"Bank of America", V:"Visa", COIN:"Coinbase", MSTR:"MicroStrategy",
  PLTR:"Palantir", SOFI:"SoFi", XOM:"Exxon", CVX:"Chevron", NFLX:"Netflix",
  DIS:"Disney", NKE:"Nike", SPY:"S&P 500 ETF", QQQ:"Nasdaq 100 ETF", SKHY:"SK hynix",
};

const parseVol = s => {
  if(s==null) return null; if(typeof s==="number") return s;
  const m=/([\d.]+)\s*([BMK]?)/i.exec(String(s)); if(!m) return null;
  const n=parseFloat(m[1]); const u=(m[2]||"").toUpperCase();
  return u==="B"?n*1e9:u==="M"?n*1e6:u==="K"?n*1e3:n;
};
const fmtVol = n => n==null||!isFinite(n)?null:n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":String(Math.round(n));

async function fetchTech(sym){
  try{
    const r=await fetch(`${BASE}/api/data?type=technical&symbol=${sym}`,{signal:AbortSignal.timeout(8000)});
    if(!r.ok) return null; const j=await r.json();
    if(!j || j.price==null || j.rsi==null) return null;   // sin datos técnicos
    return j;
  }catch(e){ return null; }
}

function buildRow(sym, t){
  const price=+t.price;
  const norm=(typeof t.score==="number")?t.score:0;   // -1..1
  const bullish=norm>=0;
  const dir=bullish?"LONG":"SHORT";
  const rsi=t.rsi!=null?Math.round(t.rsi):null;
  const sma50=t.sma50!=null?+t.sma50:null;
  const macdHist=(t.macd&&typeof t.macd.hist==="number")?t.macd.hist:0;
  const resistance=t.resistance!=null?+t.resistance:price;
  const support=t.support1!=null?+t.support1:price;
  const volT=parseVol(t.volToday), avgV=parseVol(t.avgVol10);
  const volRatio=(volT&&avgV&&avgV>0)?volT/avgV:null;
  const mcap=(t.metric&&t.metric.mcap)?t.metric.mcap:null;
  // earnings
  let earnDays=null, earnDate=t.nextEarn||null;
  if(earnDate){ const d=Math.round((new Date(earnDate+"T12:00:00Z")-Date.now())/864e5); if(d>=0&&d<=60) earnDays=d; }
  // señales reales
  const fVol = volRatio!=null && volRatio>=1.5;
  const fBrk = bullish ? price>=resistance*0.985 : price<=support*1.015;
  const fMom = bullish ? (rsi!=null&&rsi>=55&&macdHist>0) : (rsi!=null&&rsi<=45&&macdHist<0);
  const fSm  = bullish ? (sma50!=null&&price>sma50) : (sma50!=null&&price<sma50);
  const fCat = earnDays!=null && earnDays<=10;
  const flags=[]; if(fVol)flags.push("VOL"); if(fBrk)flags.push("BRK"); if(fMom)flags.push("MOM"); if(fSm)flags.push("SM"); if(fCat)flags.push("CAT");
  // score 0-100
  let sc=52;
  if(volRatio!=null){ sc+= volRatio>=3?14:volRatio>=2?10:volRatio>=1.5?7:volRatio>=1.2?3:0; }
  if(fBrk)sc+=10; if(fMom)sc+=10; if(fSm)sc+=8; if(fCat)sc+=6; sc+=Math.round(Math.abs(norm)*8);
  const score=Math.max(35,Math.min(99,sc));
  // niveles
  const tgt = t.oracleTarget!=null ? +t.oracleTarget : (bullish?price*1.1:price*0.9);
  const atrApprox = t.stop!=null ? Math.abs(price-(+t.stop)) : price*0.045;
  const stop = bullish ? +(price-atrApprox).toFixed(2) : +(price+atrApprox).toFixed(2);
  const entry = `${(price*0.99).toFixed(2)}–${(price*1.01).toFixed(2)}`;
  const smartMoney=Math.max(5,Math.min(95,Math.round(50+norm*45)));
  const chg = (t.metric&&0) ? 0 : 0; // el % en vivo lo pone el cliente
  const vr = volRatio!=null?volRatio.toFixed(1)+"×":"—";
  const macdW_en=macdHist>0?"bullish":"bearish", macdW_es=macdHist>0?"alcista":"bajista";
  const why_en=`${sym} ${fBrk?(bullish?"is breaking its 30-day high":"is breaking below 30-day support"):(bullish?"holds above its 50-day average":"trades below its 50-day average")} on ${vr} its average volume. RSI ${rsi}, MACD ${macdW_en}.${fCat?` Earnings in ${earnDays} days.`:""}`;
  const why_es=`${sym} ${fBrk?(bullish?"rompe su máximo de 30 días":"rompe bajo su soporte de 30 días"):(bullish?"se mantiene sobre su media de 50 días":"cotiza bajo su media de 50 días")} con ${vr} su volumen promedio. RSI ${rsi}, MACD ${macdW_es}.${fCat?` Earnings en ${earnDays} días.`:""}`;
  return {
    tk:sym, name:NAMES[sym]||sym, dir, price:+price.toFixed(2), chg,
    tgt:+tgt.toFixed(2), stop, entry, flags, score,
    rsi, sma50:sma50!=null?+sma50.toFixed(2):null, volRatio:volRatio!=null?+volRatio.toFixed(1):null,
    vol:fmtVol(volT), avgVol:fmtVol(avgV), mcap, smartMoney,
    nextEarn:earnDate, earnDays, why_en, why_es,
  };
}

// Acumulador en memoria (persiste mientras el contenedor está caliente). Como el
// plan gratuito de Twelve Data limita ~8 símbolos/min, cada invocación trae los que
// puede y los va guardando; en pocas llamadas se completa el universo y luego se
// sirve entero al instante. TTL 55min por símbolo.
const CACHE = {};
const TTL = 55 * 60 * 1000;

// ── Set base (último recurso): si Twelve Data está frío o caído, la tabla nunca queda vacía.
//    Cuando llegan datos reales, se fusionan por ticker y reemplazan a estos.
function seedRow(sym, price, dir, score, rsi, flags){
  const bull = dir === "LONG";
  const tgt = bull ? price * 1.1 : price * 0.9;
  const atr = price * 0.045;
  const stop = bull ? +(price - atr).toFixed(2) : +(price + atr).toFixed(2);
  const entry = `${(price * 0.99).toFixed(2)}–${(price * 1.01).toFixed(2)}`;
  const smartMoney = Math.max(5, Math.min(95, bull ? score - 2 : 100 - score));
  const why_en = `${sym} ${bull ? "holds above its 50-day average" : "trades below its 50-day average"}. RSI ${rsi}.`;
  const why_es = `${sym} ${bull ? "se mantiene sobre su media de 50 días" : "cotiza bajo su media de 50 días"}. RSI ${rsi}.`;
  return { tk:sym, name:NAMES[sym]||sym, dir, price:+price.toFixed(2), chg:0, tgt:+tgt.toFixed(2), stop, entry, flags, score,
    rsi, sma50:null, volRatio:null, vol:null, avgVol:null, mcap:null, smartMoney, nextEarn:null, earnDays:null, why_en, why_es };
}
const SEED_ROWS = [
  seedRow("NVDA", 210.69, "LONG", 88, 61, ["MOM","SM"]),
  seedRow("AVGO", 411.56, "LONG", 85, 58, ["BRK","SM"]),
  seedRow("META", 577.22, "LONG", 82, 57, ["MOM","SM"]),
  seedRow("AMZN", 244.39, "LONG", 80, 56, ["SM"]),
  seedRow("AAPL", 298.01, "LONG", 74, 54, ["SM"]),
  seedRow("MSFT", 379.40, "LONG", 73, 53, ["SM"]),
  seedRow("GOOGL",368.03, "LONG", 76, 55, ["MOM"]),
  seedRow("AMD",  168.40, "LONG", 71, 56, ["MOM"]),
  seedRow("COIN", 248.90, "LONG", 78, 60, ["VOL","MOM"]),
  seedRow("PLTR", 134.20, "LONG", 75, 59, ["MOM"]),
  seedRow("TSLA", 400.49, "SHORT", 62, 44, ["SM"]),
  seedRow("INTC", 133.99, "SHORT", 58, 42, ["SM"]),
];

export default async function finder(req, res){
  try{
    const now = Date.now();
    const stale = UNIVERSE.filter(s => !CACHE[s] || (now - CACHE[s].ts) > TTL);
    await Promise.allSettled(stale.map(async sym=>{
      const t = await fetchTech(sym); if(!t) return;
      try{ const row = buildRow(sym, t); if(row) CACHE[sym] = { row, ts: now }; }catch(e){}
    }));
    let rows = UNIVERSE.map(s => CACHE[s] && CACHE[s].row).filter(Boolean);
    rows.sort((a,b)=>b.score-a.score);
    if(rows.length>=18){
      res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate=21600");
      return res.status(200).json({ rows, n:rows.length, asOf:new Date().toISOString() });
    }
    // todavía calentando o fuente caída: completar con set base para que la tabla NUNCA quede vacía
    if(rows.length < 6){
      const have = new Set(rows.map(r=>r.tk));
      rows = rows.concat(SEED_ROWS.filter(r=>!have.has(r.tk))).sort((a,b)=>b.score-a.score);
    }
    res.setHeader("Cache-Control","s-maxage=45, stale-while-revalidate=600");
    return res.status(200).json({ rows, n:rows.length, warming:true, asOf:new Date().toISOString() });
  }catch(e){
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ rows:SEED_ROWS, n:SEED_ROWS.length, src:"seed", error:String((e&&e.message)||e) });
  }
}
