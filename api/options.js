// NexoTrade - Cadenas de opciones REALES (Sesion 11)
// GET /api/options?ticker=NVDA
// Fuente 1: CBOE delayed quotes (oficial de la bolsa de opciones, gratis, ~15 min retraso)
// Fuente 2 (fallback): Yahoo Finance
// Devuelve top contratos cerca del dinero: precio real, volumen, OI, IV,
// probabilidad ITM (Black-Scholes N(d2)) y score de factibilidad 0-100.
// Educativo - no es consejo financiero.

const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "application/json" };

function normCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

function probITM(S, K, ivDec, days, isCall) {
  if (!S || !K || !ivDec || ivDec <= 0 || days <= 0) return null;
  const T = days / 365, r = 0.04;
  const d2 = (Math.log(S / K) + (r - (ivDec * ivDec) / 2) * T) / (ivDec * Math.sqrt(T));
  const p = isCall ? normCdf(d2) : normCdf(-d2);
  return Math.round(p * 100);
}

const fmtK = n => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n || 0);

// Pago potencial: cuantas veces multiplica la prima si la accion hace su
// movimiento esperado de 1 sigma (S * IV * sqrt(T)) al vencimiento
function payMult(o, S, days) {
  const lp = o.last || ((o.bid || 0) + (o.ask || 0)) / 2;
  if (!lp || !o.iv || o.iv <= 0) return 0;
  const move = S * o.iv * Math.sqrt(days / 365);
  const target = o.isCall ? S + move : S - move;
  const intrinsic = o.isCall ? Math.max(0, target - o.strike) : Math.max(0, o.strike - target);
  return intrinsic / lp;
}

// Score 0-100 (prioridades del usuario): VOLUMEN + PAGO POTENCIAL + probabilidad
// + mas barato + MAS TIEMPO + liquidez
function feasScore(o, S, days, prob) {
  let sc = 0;
  sc += Math.min(25, Math.log10((o.vol || 0) + 1) * 8);                            // volumen (lo que mas pesa)
  const pm = payMult(o, S, days);
  sc += pm >= 3 ? 15 : pm >= 2 ? 12 : pm >= 1.5 ? 8 : pm >= 1 ? 5 : 1;             // paga mas dinero
  if (prob != null) sc += prob >= 60 ? 20 : prob >= 50 ? 16 : prob >= 40 ? 11 : prob >= 30 ? 6 : 2;
  const lp = o.last || ((o.bid || 0) + (o.ask || 0)) / 2;
  sc += lp > 0 && lp <= 1 ? 10 : lp <= 3 ? 8 : lp <= 5 ? 5 : lp <= 10 ? 2 : 0;     // mas economico
  sc += days >= 30 ? 12 : days >= 21 ? 9 : days >= 14 ? 6 : days >= 7 ? 4 : 1;     // mas tiempo
  sc += Math.min(7, Math.log10((o.oi || 0) + 1) * 2);
  if (o.bid > 0 && o.ask > 0) {
    const spr = (o.ask - o.bid) / ((o.ask + o.bid) / 2);
    sc += spr < 0.05 ? 7 : spr < 0.10 ? 5 : spr < 0.20 ? 2 : 0;
  }
  const dist = Math.abs(o.strike - S) / S;
  sc += dist < 0.02 ? 3 : dist < 0.05 ? 2 : 0;
  return Math.min(99, Math.round(sc));
}

function shapeRow(t, o, S, days, expStr) {
  const prob = probITM(S, o.strike, o.iv, days, o.isCall);
  const kStr = Number.isInteger(o.strike) ? String(o.strike) : o.strike.toFixed(1);
  return {
    s: t,
    n: `${t} $${kStr}${o.isCall ? "C" : "P"}`,
    strike: `$${kStr}${o.isCall ? "C" : "P"}`,
    exp: expStr,
    price: o.last > 0 ? `$${o.last.toFixed(2)}` : (o.bid > 0 || o.ask > 0) ? `$${(((o.bid || 0) + (o.ask || 0)) / 2).toFixed(2)}` : "—",
    iv: o.iv > 0 ? `${Math.round(o.iv * 100)}%` : "—",
    vol: fmtK(o.vol || 0),
    oi: fmtK(o.oi || 0),
    pay: payMult(o, S, days) > 0 ? `${payMult(o, S, days).toFixed(1)}x` : "—",
    prob: prob != null ? `${prob}%` : "—",
    type: o.isCall ? "call" : "put",
    chg: o.chg || 0,
    score: feasScore(o, S, days, prob),
    spot: S, days,
  };
}

// ---- Fuente 1: CBOE (cdn.cboe.com, sin key) ----
async function fetchCboe(ticker) {
  const r = await fetch(`https://cdn.cboe.com/api/global/delayed_quotes/options/${ticker}.json`, { headers: UA, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`CBOE HTTP ${r.status}`);
  const j = await r.json();
  const d = j?.data;
  const S = d?.current_price || d?.close;
  const chg = d?.percent_change || 0;
  const raw = d?.options || [];
  if (!S || raw.length === 0) throw new Error("CBOE sin datos");

  const now = new Date();
  const parsed = [];
  for (const o of raw) {
    const m = /^([A-Z.]+)(\d{6})([CP])(\d{8})$/.exec(o.option || "");
    if (!m) continue;
    const exp = new Date(Date.UTC(2000 + +m[2].slice(0, 2), +m[2].slice(2, 4) - 1, +m[2].slice(4, 6)));
    const days = Math.round((exp - now) / 86400000);
    if (days < 7 || days > 40) continue;                       // sweet spot 7-40 dias
    const strike = +m[4] / 1000;
    if (Math.abs(strike - S) / S > 0.10) continue;              // cerca del dinero ±10%
    let iv = o.iv ?? o.implied_volatility ?? 0;
    if (iv > 3) iv = iv / 100;                                  // algunos vienen en %
    const vol = o.volume || 0, oi = o.open_interest ?? o.openInterest ?? 0;
    if (vol + oi <= 50) continue;                               // liquidez minima
    parsed.push({ isCall: m[3] === "C", strike, iv, vol, oi, bid: o.bid || 0, ask: o.ask || 0, last: o.last_trade_price ?? o.last ?? 0, days, exp, chg });
  }
  if (parsed.length === 0) throw new Error("CBOE sin contratos en rango");
  // usar el vencimiento mas comun dentro del rango
  const byExp = {};
  parsed.forEach(p => { const k = p.exp.toISOString().slice(0, 10); (byExp[k] = byExp[k] || []).push(p); });
  // preferir el vencimiento MAS LEJANO con suficientes contratos (mas tiempo = menos riesgo de expirar)
  const groups = Object.values(byExp).filter(g => g.length >= 8);
  const pool = groups.length ? groups : Object.values(byExp);
  const best = pool.sort((a, b) => b[0].days - a[0].days)[0];
  const days = best[0].days;
  const expStr = best[0].exp.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return { S, rows: best, days, expStr };
}

// ---- MODO FLOW: actividad inusual REAL (volumen del dia >> open interest) ----
// vol/OI alto = dinero institucional entrando HOY. Es la misma senal que venden
// los servicios de pago de "unusual options activity".
async function fetchCboeFlow(ticker) {
  const r = await fetch(`https://cdn.cboe.com/api/global/delayed_quotes/options/${ticker}.json`, { headers: UA, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`CBOE HTTP ${r.status}`);
  const j = await r.json();
  const d = j?.data;
  const S = d?.current_price || d?.close;
  const raw = d?.options || [];
  if (!S || raw.length === 0) throw new Error("CBOE sin datos");
  const now = new Date();
  const out = [];
  for (const o of raw) {
    const m = /^([A-Z.]+)(\d{6})([CP])(\d{8})$/.exec(o.option || "");
    if (!m) continue;
    const exp = new Date(Date.UTC(2000 + +m[2].slice(0, 2), +m[2].slice(2, 4) - 1, +m[2].slice(4, 6)));
    const days = Math.round((exp - now) / 86400000);
    if (days < 1 || days > 60) continue;
    const strike = +m[4] / 1000;
    if (Math.abs(strike - S) / S > 0.15) continue;
    const vol = o.volume || 0;
    const oi = o.open_interest ?? 0;
    if (vol < 200) continue;
    const ratio = vol / Math.max(oi, 1);
    if (ratio < 1.5) continue;                                   // inusual: hoy se negocia 1.5x+ su OI
    const last = o.last_trade_price ?? ((o.bid || 0) + (o.ask || 0)) / 2;
    if (!last || last <= 0) continue;
    const premium = Math.round(last * vol * 100);                 // $ movidos hoy en este contrato
    if (premium < 200000) continue;                               // minimo $200K
    const isCall = m[3] === "C";
    const isGold = ratio >= 3 && premium >= 1e6;                  // muy inusual + premium grande
    const otm = Math.abs(((strike - S) / S) * 100).toFixed(1);
    out.push({
      ticker, type: isGold ? "Golden Sweep" : isCall ? "Call Sweep" : "Put Sweep",
      isCall, isDark: false, isGold,
      price: S, strike, premium, size: vol,
      expiry: exp.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit", timeZone: "UTC" }),
      otm, ratio: +ratio.toFixed(1),
      sentiment: isCall ? "bullish" : "bearish",
      aboveSMA200: true, highVol: ratio >= 3,
    });
  }
  out.sort((a, b) => b.premium - a.premium);
  return out.slice(0, 12);
}

// ---- Fuente 2: Yahoo Finance (fallback) ----
async function fetchYahoo(ticker) {
  const yget = async u => { const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(6000) }); if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`); return r.json(); };
  const base = await yget(`https://query2.finance.yahoo.com/v7/finance/options/${ticker}`);
  const r0 = base?.optionChain?.result?.[0];
  const S = r0?.quote?.regularMarketPrice;
  const chg = r0?.quote?.regularMarketChangePercent || 0;
  const now = Math.floor(Date.now() / 1000);
  const exps = (r0?.expirationDates || []).filter(e => e > now);
  if (!S || exps.length === 0) throw new Error("Yahoo sin datos");
  const target = exps.find(e => (e - now) / 86400 >= 7 && (e - now) / 86400 <= 40) || exps[0];
  let chain = r0.options?.[0];
  if (!chain || chain.expirationDate !== target) {
    const full = await yget(`https://query2.finance.yahoo.com/v7/finance/options/${ticker}?date=${target}`);
    chain = full?.optionChain?.result?.[0]?.options?.[0];
  }
  if (!chain) throw new Error("Yahoo sin chain");
  const days = Math.max(1, Math.round((target - now) / 86400));
  const expStr = new Date(target * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const conv = (c, isCall) => ({ isCall, strike: c.strike, iv: c.impliedVolatility || 0, vol: c.volume || 0, oi: c.openInterest || 0, bid: c.bid || 0, ask: c.ask || 0, last: c.lastPrice || 0, days, chg });
  const near = c => Math.abs(c.strike - S) / S <= 0.10 && (c.volume || 0) + (c.openInterest || 0) > 50;
  const rows = [...(chain.calls || []).filter(near).map(c => conv(c, true)), ...(chain.puts || []).filter(near).map(c => conv(c, false))];
  if (rows.length === 0) throw new Error("Yahoo sin contratos");
  return { S, rows, days, expStr };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const ticker = String(req.query.ticker || "").toUpperCase().replace(/[^A-Z.]/g, "");
  if (!ticker) { res.setHeader("Cache-Control", "no-store"); return res.status(400).json({ error: "ticker requerido" }); }

  // MODO FLOW: contratos con actividad inusual real (vol >> OI)
  if (req.query.mode === "flow") {
    try {
      const items = await fetchCboeFlow(ticker);
      res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=240");
      return res.status(200).json({ ticker, items, source: "cboe" });
    } catch (e) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ ticker, items: [], source: "error", error: e.message });
    }
  }

  let err1 = "";
  for (const [name, fn] of [["cboe", fetchCboe], ["yahoo", fetchYahoo]]) {
    try {
      const { S, rows, days, expStr } = await fn(ticker);
      const contracts = rows.map(o => shapeRow(ticker, o, S, days, expStr))
        .sort((a, b) => b.score - a.score); // TODOS los contratos que pasan filtros de calidad // top 3 por ticker
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120"); // refresca cada 1 min (origen ~15 min retraso OPRA)
      return res.status(200).json({ ticker, spot: S, expiry: expStr, days, contracts, source: name });
    } catch (e) { if (!err1) err1 = e.message; else err1 += " / " + e.message; }
  }
  res.setHeader("Cache-Control", "no-store"); // nunca cachear errores
  return res.status(200).json({ ticker, contracts: [], source: "error", error: err1 });
}
