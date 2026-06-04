// NexoTrade - Cadenas de opciones REALES (Sesion 11)
// GET /api/options?ticker=NVDA -> contratos reales via Yahoo Finance (~15 min retraso)
// Devuelve los mejores contratos cerca del dinero con:
//   precio real del contrato, volumen, open interest, IV real,
//   probabilidad ITM (Black-Scholes N(d2)) y score de factibilidad 0-100.
// Educativo - no es consejo financiero.

const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "application/json" };

// CDF normal estandar (aprox. Abramowitz-Stegun)
function normCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

// Probabilidad de terminar ITM al vencimiento (N(d2) para calls, N(-d2) para puts)
function probITM(S, K, ivDec, days, isCall) {
  if (!S || !K || !ivDec || ivDec <= 0 || days <= 0) return null;
  const T = days / 365;
  const r = 0.04;
  const d2 = (Math.log(S / K) + (r - (ivDec * ivDec) / 2) * T) / (ivDec * Math.sqrt(T));
  const p = isCall ? normCdf(d2) : normCdf(-d2);
  return Math.round(p * 100);
}

const fmtK = n => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n || 0);

// Score de factibilidad 0-100: liquidez + spread justo + moneyness sana + tiempo razonable
function feasScore(c, S, days) {
  let sc = 0;
  const vol = c.volume || 0, oi = c.openInterest || 0;
  sc += Math.min(25, Math.log10(vol + 1) * 8);          // volumen (demanda hoy)
  sc += Math.min(20, Math.log10(oi + 1) * 5);            // open interest (interes abierto)
  const bid = c.bid || 0, ask = c.ask || 0;
  if (bid > 0 && ask > 0) {
    const spr = (ask - bid) / ((ask + bid) / 2);
    sc += spr < 0.05 ? 20 : spr < 0.10 ? 14 : spr < 0.20 ? 7 : 0;  // spread apretado = facil entrar/salir
  }
  const dist = Math.abs(c.strike - S) / S;
  sc += dist < 0.02 ? 12 : dist < 0.05 ? 10 : dist < 0.08 ? 6 : 2; // cerca del dinero
  sc += days >= 7 && days <= 45 ? 10 : days < 7 ? 4 : 6;           // ni 0DTE ni demasiado lejos
  const iv = c.impliedVolatility || 0;
  sc += iv > 0.15 && iv < 1.2 ? 3 : 0;                              // IV en rango sano
  const lp = c.lastPrice || ((c.bid || 0) + (c.ask || 0)) / 2;      // prima economica = accesible
  sc += lp > 0 && lp <= 1 ? 10 : lp <= 3 ? 8 : lp <= 5 ? 5 : lp <= 10 ? 2 : 0;
  return Math.min(99, Math.round(sc));
}

async function yget(url) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const ticker = String(req.query.ticker || "").toUpperCase().replace(/[^A-Z.]/g, "");
  if (!ticker) { res.setHeader("Cache-Control", "no-store"); return res.status(400).json({ error: "ticker requerido" }); }

  try {
    // 1) chain base -> lista de vencimientos + precio spot
    const base = await yget(`https://query2.finance.yahoo.com/v7/finance/options/${ticker}`);
    const r0 = base?.optionChain?.result?.[0];
    if (!r0) throw new Error("sin datos");
    const S = r0.quote?.regularMarketPrice;
    const chgPct = r0.quote?.regularMarketChangePercent || 0;
    const now = Math.floor(Date.now() / 1000);
    const exps = (r0.expirationDates || []).filter(e => e > now);
    if (!S || exps.length === 0) throw new Error("sin vencimientos");

    // 2) elegir vencimiento 7-40 dias (el sweet spot del screener); si no, el mas cercano
    const target = exps.find(e => (e - now) / 86400 >= 7 && (e - now) / 86400 <= 40) || exps[0];
    let chain = r0.options?.[0];
    if (!chain || chain.expirationDate !== target) {
      const full = await yget(`https://query2.finance.yahoo.com/v7/finance/options/${ticker}?date=${target}`);
      chain = full?.optionChain?.result?.[0]?.options?.[0];
    }
    if (!chain) throw new Error("sin chain");

    const days = Math.max(1, Math.round((target - now) / 86400));
    const expStr = new Date(target * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

    // 3) contratos cerca del dinero (±10%) con liquidez minima
    const near = c => Math.abs(c.strike - S) / S <= 0.10 && (c.volume || 0) + (c.openInterest || 0) > 50;
    const shape = (c, isCall) => {
      const prob = probITM(S, c.strike, c.impliedVolatility, days, isCall);
      return {
        s: ticker,
        n: `${ticker} $${Number.isInteger(c.strike) ? c.strike : c.strike.toFixed(1)}${isCall ? "C" : "P"}`,
        strike: `$${Number.isInteger(c.strike) ? c.strike : c.strike.toFixed(1)}${isCall ? "C" : "P"}`,
        exp: expStr,
        price: c.lastPrice != null ? `$${c.lastPrice.toFixed(2)}` : "—",
        iv: c.impliedVolatility ? `${Math.round(c.impliedVolatility * 100)}%` : "—",
        vol: fmtK(c.volume || 0),
        oi: fmtK(c.openInterest || 0),
        prob: prob != null ? `${prob}%` : "—",
        type: isCall ? "call" : "put",
        chg: chgPct,
        score: feasScore(c, S, days),
        spot: S, days,
      };
    };
    const all = [
      ...(chain.calls || []).filter(near).map(c => shape(c, true)),
      ...(chain.puts  || []).filter(near).map(c => shape(c, false)),
    ].sort((a, b) => b.score - a.score).slice(0, 3); // top 3 por ticker

    if (all.length === 0) throw new Error("sin contratos liquidos");

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120"); // refresca cada 1 min (el dato de origen ya trae ~15 min de retraso de OPRA)
    return res.status(200).json({ ticker, spot: S, expiry: expStr, days, contracts: all, source: "yahoo" });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store"); // nunca cachear errores
    return res.status(200).json({ ticker, contracts: [], source: "error", error: e.message });
  }
}
