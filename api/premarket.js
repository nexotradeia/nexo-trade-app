// NexoTrade — Pre-Market & After-Hours REALES (Yahoo Finance)
// GET /api/premarket   →  { etfs, indices, commodities, stocks, movers, marketState, source }
// Datos reales de sesión extendida: preMarketPrice / postMarketPrice / marketState.
// Educativo — no es consejo financiero.

const UA = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept": "application/json",
};

// Universo de acciones (líderes S&P/Nasdaq + más activas habituales)
const STOCK_UNIVERSE = [
  "AAPL","MSFT","NVDA","AMZN","META","GOOGL","TSLA","AVGO","AMD","NFLX",
  "JPM","V","MA","COST","WMT","XOM","JNJ","LLY","UNH","HD",
  "PLTR","COIN","MU","MRVL","SMCI","ARM","INTC","CRWD","SNOW","SHOP",
  "BA","DIS","BABA","UBER","PYPL","SOFI","RIVN","NIO","GME","CVX",
];
const ETF_SYMBOLS   = ["DIA","QQQ","SPY","IWM"];
const INDEX_SYMBOLS = ["^DJI","^GSPC","^IXIC","^VIX","DX-Y.NYB"];
const COMMODITIES   = ["GC=F","SI=F","CL=F","NG=F","HG=F"];

const INDEX_NAMES = { "^DJI":"Dow Jones", "^GSPC":"S&P 500", "^IXIC":"Nasdaq", "^VIX":"VIX", "DX-Y.NYB":"Dollar Index" };
const COMM_NAMES  = { "GC=F":"Gold", "SI=F":"Silver", "CL=F":"Crude Oil", "NG=F":"Nat Gas", "HG=F":"Copper" };

const fmtVol = n => n == null ? "—" : n >= 1e9 ? (n/1e9).toFixed(1)+"B" : n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n);

// ── Crumb + cookie de Yahoo (necesario para v7/quote) ──
async function getCrumb() {
  const r0 = await fetch("https://fc.yahoo.com", { headers: UA, signal: AbortSignal.timeout(6000) }).catch(() => null);
  let cookie = "";
  if (r0) {
    const sc = r0.headers.get("set-cookie");
    if (sc) cookie = sc.split(",").map(s => s.split(";")[0].trim()).filter(Boolean).join("; ");
  }
  const rc = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
    headers: { ...UA, cookie }, signal: AbortSignal.timeout(6000),
  });
  const crumb = await rc.text();
  if (!crumb || crumb.includes("<")) throw new Error("crumb inválido");
  return { crumb, cookie };
}

async function yahooQuote(symbols, crumb, cookie) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}&crumb=${encodeURIComponent(crumb)}`;
  const r = await fetch(url, { headers: { ...UA, cookie }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`Yahoo quote HTTP ${r.status}`);
  const j = await r.json();
  return j?.quoteResponse?.result || [];
}

// Fallback sin crumb: v8 chart por símbolo (regular + previous close)
async function chartQuote(sym) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?includePrePost=true&interval=5m&range=1d`, { headers: UA, signal: AbortSignal.timeout(7000) });
  if (!r.ok) throw new Error("chart HTTP " + r.status);
  const m = (await r.json())?.chart?.result?.[0]?.meta;
  if (!m) throw new Error("sin meta");
  return {
    symbol: sym,
    shortName: m.shortName || sym,
    regularMarketPrice: m.regularMarketPrice,
    regularMarketPreviousClose: m.chartPreviousClose ?? m.previousClose,
    regularMarketChangePercent: m.chartPreviousClose ? ((m.regularMarketPrice - m.chartPreviousClose) / m.chartPreviousClose) * 100 : 0,
    regularMarketVolume: m.regularMarketVolume,
    marketState: m.marketState,
  };
}

// Normaliza un quote de Yahoo a la sesión pedida (pre | post | regular)
function shape(q, session) {
  const reg   = q.regularMarketPrice;
  const regCh = q.regularMarketChangePercent ?? 0;
  let price = reg, chg = regCh, ext = false;
  if (session === "pre" && q.preMarketPrice != null) {
    price = q.preMarketPrice; chg = q.preMarketChangePercent ?? 0; ext = true;
  } else if (session === "post" && q.postMarketPrice != null) {
    price = q.postMarketPrice; chg = q.postMarketChangePercent ?? 0; ext = true;
  }
  return {
    s: q.symbol,
    n: q.shortName || q.longName || q.symbol,
    p: price != null ? +price.toFixed(2) : null,
    chg: +(+chg).toFixed(2),
    regChg: +(+regCh).toFixed(2),
    vol: q.regularMarketVolume ?? null,
    volFmt: fmtVol(q.regularMarketVolume),
    ext,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const session = (req.query.session === "post") ? "post" : "pre";
  const all = [...ETF_SYMBOLS, ...INDEX_SYMBOLS, ...COMMODITIES, ...STOCK_UNIVERSE];

  try {
    let quotes = [];
    try {
      const { crumb, cookie } = await getCrumb();
      quotes = await yahooQuote(all, crumb, cookie);
    } catch (e) {
      // Fallback: chart por símbolo (sin pre/post, pero datos reales regulares)
      const settled = await Promise.allSettled(all.map(chartQuote));
      quotes = settled.filter(s => s.status === "fulfilled").map(s => s.value);
    }

    const bySym = {};
    quotes.forEach(q => { bySym[q.symbol] = q; });

    const marketState = quotes.find(q => q.marketState)?.marketState || "CLOSED";

    const pick = (syms, nameMap) => syms.map(s => bySym[s] ? { ...shape(bySym[s], session), n: nameMap?.[s] || bySym[s].shortName || s } : null).filter(Boolean);

    const etfs        = pick(ETF_SYMBOLS);
    const indices     = pick(INDEX_SYMBOLS, INDEX_NAMES);
    const commodities = pick(COMMODITIES, COMM_NAMES);
    const stocks      = STOCK_UNIVERSE.map(s => bySym[s] ? shape(bySym[s], session) : null).filter(Boolean);

    const withMove = stocks.filter(x => x.p != null);
    const mostActive = [...withMove].filter(x => x.vol != null).sort((a, b) => (b.vol || 0) - (a.vol || 0)).slice(0, 12);
    const gainers    = [...withMove].sort((a, b) => b.chg - a.chg).slice(0, 8);
    const losers     = [...withMove].sort((a, b) => a.chg - b.chg).slice(0, 8);

    res.setHeader("Cache-Control", "s-maxage=45, stale-while-revalidate=120");
    return res.status(200).json({
      session, marketState, etfs, indices, commodities,
      mostActive, gainers, losers,
      source: "yahoo", ts: Date.now(),
    });
  } catch (e) {
    console.error("[premarket] error:", e.message);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ session, etfs: [], indices: [], commodities: [], mostActive: [], gainers: [], losers: [], source: "error", error: e.message });
  }
}
