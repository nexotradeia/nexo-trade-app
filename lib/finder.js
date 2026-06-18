// NexoTrade — Motor de SETUPS de acciones REALES (Smart Money / Finder Pro).
// Calcula indicadores técnicos reales (RSI, SMA20/50, MACD, ATR, momentum) sobre
// velas diarias de Yahoo Finance (gratis), + market cap / earnings vía Finnhub.
// Devuelve ~22 acciones rankeadas con score 0-100, señales (VOL/BRK/MOM/SM/CAT),
// objetivo, stop, entrada y tesis bilingüe. Cacheado 1h en el CDN.
// GET /api/data?type=finder
// Educativo — no es consejo financiero.

const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
const TD_KEY = process.env.TWELVE_DATA_KEY || "c55564b877964430bc84dbd46ff63b35";
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "application/json" };

// Universo diverso: mega-cap tech, semis, finanzas, cripto-proxy, energía, consumo, ETFs.
const UNIVERSE = [
  "NVDA","AAPL","MSFT","GOOGL","AMZN","META","TSLA",      // mega tech
  "AMD","AVGO","MU","SMCI",                                 // semis
  "JPM","BAC","V",                                          // finanzas
  "COIN","MSTR",                                            // cripto-proxy
  "PLTR","SOFI",                                            // growth
  "XOM","CVX",                                              // energía
  "NFLX","DIS","NKE",                                       // consumo
  "SPY","QQQ",                                              // ETFs
];

const NAMES = {
  NVDA:"NVIDIA", AAPL:"Apple", MSFT:"Microsoft", GOOGL:"Alphabet", AMZN:"Amazon",
  META:"Meta", TSLA:"Tesla", AMD:"AMD", AVGO:"Broadcom", MU:"Micron", SMCI:"Super Micro",
  JPM:"JPMorgan", BAC:"Bank of America", V:"Visa", COIN:"Coinbase", MSTR:"MicroStrategy",
  PLTR:"Palantir", SOFI:"SoFi", XOM:"Exxon", CVX:"Chevron", NFLX:"Netflix",
  DIS:"Disney", NKE:"Nike", SPY:"S&P 500 ETF", QQQ:"Nasdaq 100 ETF",
};

// ---- matemática de indicadores (idéntica a lib/technical.js) ----
const sma = (a, n) => a.length < n ? null : a.slice(-n).reduce((x, y) => x + y, 0) / n;
function emaSeries(a, n){ if(a.length<n) return []; const k=2/(n+1); const out=[]; let prev=a.slice(0,n).reduce((x,y)=>x+y,0)/n; out[n-1]=prev; for(let i=n;i<a.length;i++){ prev=a[i]*k+prev*(1-k); out[i]=prev; } return out; }
function rsiSeries(c, period=14){ if(c.length<period+1) return []; const out=[]; let g=0,l=0; for(let i=1;i<=period;i++){ const d=c[i]-c[i-1]; if(d>=0)g+=d; else l-=d; } let ag=g/period, al=l/period; out[period]=al===0?100:100-100/(1+ag/al); for(let i=period+1;i<c.length;i++){ const d=c[i]-c[i-1]; const up=d>0?d:0, dn=d<0?-d:0; ag=(ag*(period-1)+up)/period; al=(al*(period-1)+dn)/period; out[i]=al===0?100:100-100/(1+ag/al); } return out; }
const last = a => (a && a.length) ? a[a.length-1] : null;

function indicators(closes, highs, lows){
  if(!closes || closes.length < 35) return null;
  const price = closes[closes.length-1];
  const s20=sma(closes,20), s50=sma(closes,50), s10=sma(closes,10);
  const rs = rsiSeries(closes,14); const rsi = last(rs);
  const e12=emaSeries(closes,12), e26=emaSeries(closes,26);
  const macdArr=[]; for(let i=0;i<closes.length;i++){ if(e12[i]!=null && e26[i]!=null) macdArr.push(e12[i]-e26[i]); }
  const sigArr = emaSeries(macdArr,9);
  const macdLine=last(macdArr), macdSig=last(sigArr); const macdHist=(macdLine!=null&&macdSig!=null)?macdLine-macdSig:null;
  let atr=null; if(highs && lows && highs.length===closes.length && closes.length>=15){ const trs=[]; for(let i=1;i<closes.length;i++){ const h=highs[i],l=lows[i],pc=closes[i-1]; trs.push(Math.max(h-l, Math.abs(h-pc), Math.abs(l-pc))); } atr=trs.slice(-14).reduce((a,b)=>a+b,0)/14; }
  const mom = closes.length>11 ? (price-closes[closes.length-11])/closes[closes.length-11] : 0;
  // score compuesto -1..1
  let score=0,n=0;
  if(s20!=null){score+=price>s20?1:-1;n++;} if(s50!=null){score+=price>s50?1:-1;n++;}
  if(s10!=null&&s20!=null){score+=s10>s20?1:-1;n++;} if(rsi!=null){score+=rsi>55?1:rsi<45?-1:0;n++;}
  score+=mom>0.03?1:mom<-0.03?-1:0;n++;
  if(macdHist!=null){score+=macdHist>0?1:-1;n++;}
  const norm = n?score/n:0;
  const resistance = Math.max(...closes.slice(-30));
  const support = Math.min(...closes.slice(-20));
  return { price, s20, s50, rsi, macdHist, atr, mom, norm, resistance, support };
}

async function stooqCandles(sym){
  try{
    const u=`https://stooq.com/q/d/l/?s=${sym.toLowerCase()}.us&i=d`;
    const r=await fetch(u,{headers:UA,signal:AbortSignal.timeout(7000)}); if(!r.ok) return null;
    const txt=await r.text(); const lines=txt.trim().split(/\r?\n/); if(lines.length<40) return null;
    if(!lines[0].toLowerCase().startsWith("date")) return null;
    const closes=[],highs=[],lows=[],vols=[];
    for(let i=1;i<lines.length;i++){ const p=lines[i].split(","); if(p.length<6) continue; const h=+p[2],l=+p[3],c=+p[4],v=+p[5]; if(isFinite(c)&&c>0){ closes.push(c); highs.push(isFinite(h)?h:c); lows.push(isFinite(l)?l:c); vols.push(isFinite(v)?v:0); } }
    if(closes.length<40) return null;
    return { closes, highs, lows, vols, price:closes[closes.length-1], prevClose:closes[closes.length-2] };
  }catch(e){ return null; }
}

function parseTD(d){ if(!d||!Array.isArray(d.values)) return null; const v=d.values.slice().reverse();
  const closes=v.map(x=>+parseFloat(x.close)).filter(isFinite);
  const highs=v.map(x=>+parseFloat(x.high)).filter(isFinite);
  const lows=v.map(x=>+parseFloat(x.low)).filter(isFinite);
  const vols=v.map(x=>+parseFloat(x.volume)).filter(x=>isFinite(x));
  if(closes.length<40) return null;
  return {closes,highs,lows,vols,price:closes[closes.length-1],prevClose:closes[closes.length-2]}; }

// Velas diarias REALES vía Twelve Data (1 símbolo por llamada — el plan gratis no permite lote).
async function candlesTD(sym){
  try{
    const u=`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}&interval=1day&outputsize=90&apikey=${TD_KEY}`;
    const r=await fetch(u,{signal:AbortSignal.timeout(9000)}); if(!r.ok) return null;
    const j=await r.json(); if(!j||j.status==="error") return null;
    return parseTD(j);
  }catch(e){ return null; }
}

// TD primero (funciona en Vercel); Stooq/Yahoo como respaldo.
async function getCandles(sym){ return (await candlesTD(sym)) || (await stooqCandles(sym)) || (await yahooCandles(sym)); }

async function yahooCandles(sym){
  try{
    const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=6mo&interval=1d`;
    const r=await fetch(u,{headers:UA,signal:AbortSignal.timeout(7000)}); if(!r.ok) return null;
    const j=await r.json(); const res=j&&j.chart&&j.chart.result&&j.chart.result[0]; if(!res) return null;
    const q=res.indicators&&res.indicators.quote&&res.indicators.quote[0]; if(!q) return null;
    const closes=(q.close||[]).filter(x=>typeof x==="number"&&isFinite(x));
    const highs=(q.high||[]).filter(x=>typeof x==="number"&&isFinite(x));
    const lows=(q.low||[]).filter(x=>typeof x==="number"&&isFinite(x));
    const vols=(q.volume||[]).filter(x=>typeof x==="number"&&isFinite(x));
    const meta=res.meta||{};
    const price=typeof meta.regularMarketPrice==="number"?meta.regularMarketPrice:last(closes);
    const prevClose=typeof meta.chartPreviousClose==="number"?meta.chartPreviousClose:(typeof meta.previousClose==="number"?meta.previousClose:null);
    if(closes.length) closes[closes.length-1]=price; // usa precio en vivo como último cierre
    return { closes, highs, lows, vols, price, prevClose };
  }catch(e){ return null; }
}

async function finnhubMetric(sym){
  try{
    const r=await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${sym}&metric=all&token=${FK}`,{signal:AbortSignal.timeout(6000)});
    if(!r.ok) return null; const j=await r.json(); const m=j&&j.metric; if(!m) return null;
    const num=x=>(typeof x==="number"&&isFinite(x))?x:null;
    const mc=num(m.marketCapitalization);
    return {
      mcap: mc!=null?(mc>=1e6?(mc/1e6).toFixed(2)+"T":mc>=1e3?(mc/1e3).toFixed(0)+"B":mc.toFixed(0)+"M"):null,
      avgVol10: num(m["10DayAverageTradingVolume"]), // millones de acciones
      w52h: num(m["52WeekHigh"]),
    };
  }catch(e){ return null; }
}

async function nextEarnings(sym){
  try{
    const today=new Date(); const to=new Date(today.getTime()+30*864e5);
    const f=d=>d.toISOString().slice(0,10);
    const r=await fetch(`https://finnhub.io/api/v1/calendar/earnings?from=${f(today)}&to=${f(to)}&symbol=${sym}&token=${FK}`,{signal:AbortSignal.timeout(6000)});
    if(!r.ok) return null; const j=await r.json(); const arr=(j&&j.earningsCalendar)||[];
    if(!arr.length) return null; arr.sort((a,b)=>new Date(a.date)-new Date(b.date));
    const d=arr[0].date; if(!d) return null;
    const days=Math.round((new Date(d+"T12:00:00Z")-today)/864e5);
    return days>=0?{date:d,days}:null;
  }catch(e){ return null; }
}

const fmtVolM=n=>n==null||!isFinite(n)?null:n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":String(Math.round(n));

function buildRow(sym, c, metric, earn){
  const ind=indicators(c.closes, c.highs, c.lows);
  if(!ind) return null;
  const price=ind.price;
  const chg = c.prevClose ? (price-c.prevClose)/c.prevClose*100 : 0;
  const bullish = ind.norm >= 0;
  const dir = bullish ? "LONG" : "SHORT";
  // volumen hoy vs promedio
  const volToday = c.vols.length ? c.vols[c.vols.length-1] : null;
  const avgVol = metric&&metric.avgVol10!=null ? metric.avgVol10*1e6 : (c.vols.length>=10 ? c.vols.slice(-10).reduce((a,b)=>a+b,0)/10 : null);
  const volRatio = (volToday&&avgVol&&avgVol>0) ? volToday/avgVol : null;
  // señales reales
  const fVol = volRatio!=null && volRatio>=1.5;
  const fBrk = bullish ? price>=ind.resistance*0.985 : price<=ind.support*1.015;
  const fMom = bullish ? (ind.rsi!=null&&ind.rsi>=55&&ind.macdHist>0) : (ind.rsi!=null&&ind.rsi<=45&&ind.macdHist<0);
  const fSm  = bullish ? (ind.s50!=null&&price>ind.s50&&ind.s20>ind.s50) : (ind.s50!=null&&price<ind.s50&&ind.s20<ind.s50);
  const fCat = !!(earn && earn.days<=10);
  const flags=[]; if(fVol)flags.push("VOL"); if(fBrk)flags.push("BRK"); if(fMom)flags.push("MOM"); if(fSm)flags.push("SM"); if(fCat)flags.push("CAT");
  // score 0-100 (conviccion)
  let sc=52;
  if(volRatio!=null){ sc+= volRatio>=3?14:volRatio>=2?10:volRatio>=1.5?7:volRatio>=1.2?3:0; }
  if(fBrk)sc+=10; if(fMom)sc+=10; if(fSm)sc+=8; if(fCat)sc+=6;
  sc+=Math.round(Math.abs(ind.norm)*8);
  const score=Math.max(35,Math.min(99,sc));
  // niveles
  const atr=ind.atr||price*0.03;
  const target = bullish ? price*(1+Math.max(0.04,Math.min(0.22,Math.abs(ind.norm)*0.14+Math.max(0,ind.mom))))
                         : price*(1-Math.max(0.04,Math.min(0.22,Math.abs(ind.norm)*0.14+Math.max(0,-ind.mom))));
  const stop = bullish ? price-1.5*atr : price+1.5*atr;
  const entryLo=price*0.99, entryHi=price*1.01;
  const smartMoney=Math.max(5,Math.min(95,Math.round(50+ind.norm*45)));
  const rsiR = ind.rsi!=null?Math.round(ind.rsi):null;
  const f2=x=>x==null?null:+x.toFixed(2);
  // tesis bilingüe
  const vr = volRatio!=null?volRatio.toFixed(1)+"×":"—";
  const macdW_en = ind.macdHist>0?"bullish":"bearish", macdW_es = ind.macdHist>0?"alcista":"bajista";
  const why_en = `${sym} ${fBrk?(bullish?"is breaking its 30-day high":"is breaking below 30-day support"):(bullish?"holds above its 50-day average":"trades below its 50-day average")} on ${vr} its average volume. RSI ${rsiR}, MACD ${macdW_en}.${fCat?` Earnings in ${earn.days} days.`:""}`;
  const why_es = `${sym} ${fBrk?(bullish?"rompe su máximo de 30 días":"rompe bajo su soporte de 30 días"):(bullish?"se mantiene sobre su media de 50 días":"cotiza bajo su media de 50 días")} con ${vr} su volumen promedio. RSI ${rsiR}, MACD ${macdW_es}.${fCat?` Earnings en ${earn.days} días.`:""}`;
  return {
    tk:sym, name:NAMES[sym]||sym, dir, price:f2(price), chg:+chg.toFixed(2),
    tgt:f2(target), stop:f2(stop), entry:`${entryLo.toFixed(2)}–${entryHi.toFixed(2)}`,
    flags, score,
    rsi: rsiR, sma50: f2(ind.s50), volRatio: volRatio!=null?+volRatio.toFixed(1):null,
    vol: fmtVolM(volToday), avgVol: fmtVolM(avgVol),
    mcap: metric?metric.mcap:null, smartMoney,
    nextEarn: earn?earn.date:null, earnDays: earn?earn.days:null,
    why_en, why_es,
  };
}

export default async function finder(req, res){
  try{
    const results = await Promise.allSettled(UNIVERSE.map(async sym=>{
      const c = await getCandles(sym);
      if(!c) return null;
      const [metric, earn] = await Promise.all([ finnhubMetric(sym), nextEarnings(sym) ]);
      return buildRow(sym, c, metric, earn);
    }));
    let rows = results.map(r=>r.status==="fulfilled"?r.value:null).filter(Boolean);
    rows.sort((a,b)=>b.score-a.score);
    if(rows.length){
      res.setHeader("Cache-Control","s-maxage=3600, stale-while-revalidate=21600");
      return res.status(200).json({ rows, n:rows.length, asOf:new Date().toISOString() });
    }
    // diagnóstico: por qué no hubo filas
    let diag={};
    try{
      const u=`https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&outputsize=90&apikey=${TD_KEY}`;
      const r=await fetch(u,{signal:AbortSignal.timeout(9000)});
      const txt=await r.text();
      diag.tdStatus=r.status; diag.tdSample=txt.slice(0,180);
      const c=await getCandles("AAPL"); diag.aaplCandles=c?c.closes.length:null;
      const m=await finnhubMetric("AAPL"); diag.aaplMetric=m?m.mcap:"null";
      const built=c?buildRow("AAPL",c,m,null):null; diag.builtOk=!!built;
    }catch(de){ diag.diagErr=String(de&&de.message||de); }
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ rows:[], n:0, error:"no data", ver:"diag1", diag });
  }catch(e){
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ rows:[], n:0, error:String((e&&e.message)||e) });
  }
}
