// NexoTrade — Indicadores técnicos REALES sobre velas diarias.
// Acciones/ETFs: Twelve Data (time_series con OHLC+volumen). Cripto: CoinGecko (close).
// Métricas fundamentales (P/E, EPS, Beta, Market Cap, 52W, vol): Finnhub /stock/metric.
// GET /api/data?type=technical&symbol=AAPL
// Cacheado 1h en el CDN.
const TD_KEY = process.env.TWELVE_DATA_KEY || "c55564b877964430bc84dbd46ff63b35";
const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";

const CG_IDS = {
  BTC:"bitcoin", ETH:"ethereum", SOL:"solana", BNB:"binancecoin", XRP:"ripple",
  ADA:"cardano", DOGE:"dogecoin", AVAX:"avalanche-2", DOT:"polkadot", LINK:"chainlink",
  MATIC:"matic-network", POL:"matic-network", LTC:"litecoin", TRX:"tron", UNI:"uniswap",
  ATOM:"cosmos", XLM:"stellar", NEAR:"near", APT:"aptos", ARB:"arbitrum", OP:"optimism",
  BCH:"bitcoin-cash", ETC:"ethereum-classic", PEPE:"pepe", SHIB:"shiba-inu",
};

const sma = (a, n) => a.length < n ? null : a.slice(-n).reduce((x, y) => x + y, 0) / n;
function emaSeries(a, n){ if(a.length<n) return []; const k=2/(n+1); const out=[]; let prev=a.slice(0,n).reduce((x,y)=>x+y,0)/n; out[n-1]=prev; for(let i=n;i<a.length;i++){ prev=a[i]*k+prev*(1-k); out[i]=prev; } return out; }
function rsiSeries(c, period=14){ if(c.length<period+1) return []; const out=[]; let g=0,l=0; for(let i=1;i<=period;i++){ const d=c[i]-c[i-1]; if(d>=0)g+=d; else l-=d; } let ag=g/period, al=l/period; out[period]=al===0?100:100-100/(1+ag/al); for(let i=period+1;i<c.length;i++){ const d=c[i]-c[i-1]; const up=d>0?d:0, dn=d<0?-d:0; ag=(ag*(period-1)+up)/period; al=(al*(period-1)+dn)/period; out[i]=al===0?100:100-100/(1+ag/al); } return out; }
const last = a => (a && a.length) ? a[a.length-1] : null;

function indicators(closes, highs, lows){
  if(!closes || closes.length < 35) return null;
  const price = closes[closes.length-1];
  const s20=sma(closes,20), s50=sma(closes,50);
  const rs = rsiSeries(closes,14); const rsi = last(rs);
  // MACD 12/26/9
  const e12=emaSeries(closes,12), e26=emaSeries(closes,26);
  const macdLineArr=[]; for(let i=0;i<closes.length;i++){ if(e12[i]!=null && e26[i]!=null) macdLineArr.push(e12[i]-e26[i]); }
  const sigArr = emaSeries(macdLineArr,9);
  const macdLine=last(macdLineArr), macdSig=last(sigArr); const macdHist=(macdLine!=null&&macdSig!=null)?macdLine-macdSig:null;
  // Bollinger 20,2
  let bbU=null,bbL=null; if(closes.length>=20){ const w=closes.slice(-20); const m=w.reduce((a,b)=>a+b,0)/20; const sd=Math.sqrt(w.reduce((a,b)=>a+(b-m)*(b-m),0)/20); bbU=m+2*sd; bbL=m-2*sd; }
  // Stochastic RSI (sobre RSI series, ventana 14)
  let stochRsi=null; if(rs.length>=14){ const w=rs.slice(-14).filter(x=>x!=null); if(w.length){ const mn=Math.min(...w),mx=Math.max(...w); stochRsi=mx>mn?((rsi-mn)/(mx-mn))*100:50; } }
  // ATR 14 (si hay high/low reales)
  let atr=null; if(highs && lows && highs.length===closes.length && closes.length>=15){ const trs=[]; for(let i=1;i<closes.length;i++){ const h=highs[i],l=lows[i],pc=closes[i-1]; trs.push(Math.max(h-l, Math.abs(h-pc), Math.abs(l-pc))); } atr=trs.slice(-14).reduce((a,b)=>a+b,0)/14; }
  // Señal compuesta (igual que antes, para compatibilidad)
  let score=0,n=0; const s10=sma(closes,10);
  if(s20!=null){score+=price>s20?1:-1;n++;} if(s50!=null){score+=price>s50?1:-1;n++;}
  if(s10!=null&&s20!=null){score+=s10>s20?1:-1;n++;} if(rsi!=null){score+=rsi>55?1:rsi<45?-1:0;n++;}
  const mom=closes.length>11?(price-closes[closes.length-11])/closes[closes.length-11]:0; score+=mom>0.03?1:mom<-0.03?-1:0;n++;
  const norm=n?score/n:0;
  const signal=norm>=0.6?"Strong Buy":norm>=0.2?"Buy":norm>-0.2?"Neutral":norm>-0.6?"Sell":"Strong Sell";
  const f2=x=>x==null?null:+x.toFixed(2);
  return {
    signal, score:+norm.toFixed(2), price:f2(price),
    rsi: rsi!=null?+rsi.toFixed(1):null,
    sma20:f2(s20), sma50:f2(s50), ma20:f2(s20), ma50:f2(s50),
    macd:{line:f2(macdLine), signal:f2(macdSig), hist:f2(macdHist)},
    bbUpper:f2(bbU), bbLower:f2(bbL),
    stochRsi: stochRsi!=null?+stochRsi.toFixed(1):null,
    atr14:f2(atr),
    // niveles reales
    resistance:f2(highs?Math.max(...closes.slice(-30)):null),
    support1:f2(lows?Math.min(...closes.slice(-20)):null),
    support2:f2(lows?Math.min(...closes.slice(-60)):null),
    stop: atr!=null?f2(price-1.5*atr):null,
    oracleTarget: f2(price*(1+Math.max(-0.15,Math.min(0.20,norm*0.12+mom)))),
  };
}

async function candlesTD(symbol){
  const url=`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=120&apikey=${TD_KEY}`;
  const r=await fetch(url,{signal:AbortSignal.timeout(9000)}); if(!r.ok) return null;
  const j=await r.json(); if(!j||j.status==="error"||!Array.isArray(j.values)) return null;
  const v=j.values.slice().reverse();
  return {
    closes:v.map(x=>+parseFloat(x.close)).filter(isFinite),
    highs:v.map(x=>+parseFloat(x.high)).filter(isFinite),
    lows:v.map(x=>+parseFloat(x.low)).filter(isFinite),
    vols:v.map(x=>+parseFloat(x.volume)).filter(x=>isFinite(x)),
  };
}
async function candlesCG(id){
  const url=`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=120&interval=daily`;
  const r=await fetch(url,{signal:AbortSignal.timeout(9000)}); if(!r.ok) return null;
  const j=await r.json(); if(!j||!Array.isArray(j.prices)) return null;
  const closes=j.prices.map(p=>+p[1]).filter(isFinite);
  return {closes, highs:null, lows:null, vols:(j.total_volumes||[]).map(p=>+p[1])};
}
async function finnhubMetric(symbol){
  try{
    const r=await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FK}`,{signal:AbortSignal.timeout(7000)});
    if(!r.ok) return null; const j=await r.json(); const m=j&&j.metric; if(!m) return null;
    const num=x=>(typeof x==="number"&&isFinite(x))?x:null;
    const mc=num(m.marketCapitalization); // en millones USD
    return {
      w52h:num(m["52WeekHigh"]), w52l:num(m["52WeekLow"]),
      mcap: mc!=null?(mc>=1e6?(mc/1e6).toFixed(2)+"T":mc>=1e3?(mc/1e3).toFixed(1)+"B":mc.toFixed(0)+"M"):null,
      pe:num(m.peTTM)||num(m.peBasicExclExtraTTM)||num(m.peNormalizedAnnual),
      eps:num(m.epsTTM)||num(m.epsInclExtraItemsTTM)||num(m.epsNormalizedAnnual),
      beta:num(m.beta),
      div:num(m.dividendYieldIndicatedAnnual)||num(m.currentDividendYieldTTM),
      avgVol10:num(m["10DayAverageTradingVolume"]), // en millones de acciones
    };
  }catch(e){ return null; }
}
const fmtVol=n=>n==null||!isFinite(n)?null:n>=1e9?(n/1e9).toFixed(2)+"B":n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(Math.round(n));

export default async function technical(req, res){
  const symbol=String(req.query.symbol||"").toUpperCase().trim().replace(/[^A-Z0-9.]/g,"");
  if(!symbol){ res.setHeader("Cache-Control","no-store"); return res.status(400).json({error:"missing symbol"}); }
  try{
    const isCrypto=!!CG_IDS[symbol];
    const data=isCrypto?await candlesCG(CG_IDS[symbol]):await candlesTD(symbol);
    const out=data?indicators(data.closes, data.highs, data.lows):null;
    let metric=null; if(!isCrypto) metric=await finnhubMetric(symbol);
    const volToday = data&&data.vols&&data.vols.length?fmtVol(data.vols[data.vols.length-1]):null;
    const avgVol10 = metric&&metric.avgVol10!=null?fmtVol(metric.avgVol10*1e6):(data&&data.vols&&data.vols.length>=10?fmtVol(data.vols.slice(-10).reduce((a,b)=>a+b,0)/10):null);
    if(!out){ res.setHeader("Cache-Control","s-maxage=180, stale-while-revalidate=600"); return res.status(200).json({symbol, signal:null, metric, volToday, avgVol10, note:"no data"}); }
    res.setHeader("Cache-Control","s-maxage=3600, stale-while-revalidate=21600");
    return res.status(200).json({symbol, ...out, metric, volToday, avgVol10, asOf:new Date().toISOString()});
  }catch(e){ res.setHeader("Cache-Control","s-maxage=120"); return res.status(200).json({symbol, signal:null, error:String((e&&e.message)||e)}); }
}
