// NexoTrade — Cotizaciones genéricas vía Yahoo Finance (ETFs, Commodities, Forex, Bonos)
// Se enruta desde /api/data?type=quotes&set=etfs|commodities|forex|bonds|overview
// Educativo — no es consejo financiero.

const UA = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept": "application/json",
};

const SETS = {
  etfs: [
    ["SPY","S&P 500 ETF"],["QQQ","Nasdaq 100 ETF"],["IWM","Russell 2000 ETF"],["DIA","Dow Jones ETF"],
    ["VTI","Total Market"],["VOO","Vanguard S&P 500"],["GLD","Gold ETF"],["SLV","Silver ETF"],
    ["TLT","20Y Treasury"],["XLF","Financials"],["XLK","Technology"],["XLE","Energy"],
    ["ARKK","ARK Innovation"],["EEM","Emerging Mkts"],["EFA","EAFE Intl"],["SMH","Semiconductors"],
    ["XLV","Health Care"],["XLY","Consumer Disc."],["SCHD","Dividend ETF"],["VNQ","Real Estate"],
  ],
  commodities: [
    ["GC=F","Gold"],["SI=F","Silver"],["CL=F","Crude Oil (WTI)"],["BZ=F","Brent Oil"],
    ["NG=F","Natural Gas"],["HG=F","Copper"],["ZW=F","Wheat"],["ZC=F","Corn"],
    ["ZS=F","Soybeans"],["PL=F","Platinum"],["PA=F","Palladium"],["KC=F","Coffee"],
    ["SB=F","Sugar"],["CT=F","Cotton"],["CC=F","Cocoa"],["LE=F","Live Cattle"],
  ],
  forex: [
    ["EURUSD=X","EUR/USD"],["GBPUSD=X","GBP/USD"],["USDJPY=X","USD/JPY"],["USDCHF=X","USD/CHF"],
    ["AUDUSD=X","AUD/USD"],["USDCAD=X","USD/CAD"],["NZDUSD=X","NZD/USD"],["EURGBP=X","EUR/GBP"],
    ["USDMXN=X","USD/MXN"],["USDBRL=X","USD/BRL"],["USDCNY=X","USD/CNY"],["USDARS=X","USD/ARS"],
    ["EURJPY=X","EUR/JPY"],["GBPJPY=X","GBP/JPY"],["DX-Y.NYB","Dollar Index"],
  ],
  bonds: [
    ["^IRX","US 13-Week (3M)"],["2YY=F","US 2-Year"],["^FVX","US 5-Year"],
    ["^TNX","US 10-Year"],["^TYX","US 30-Year"],
  ],
};

async function getCrumb() {
  let cookie = "";
  const r0 = await fetch("https://fc.yahoo.com", { headers: UA, signal: AbortSignal.timeout(6000) }).catch(() => null);
  if (r0) { const sc = r0.headers.get("set-cookie"); if (sc) cookie = sc.split(",").map(s => s.split(";")[0].trim()).filter(Boolean).join("; "); }
  const rc = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", { headers: { ...UA, cookie }, signal: AbortSignal.timeout(6000) });
  const crumb = await rc.text();
  if (!crumb || crumb.includes("<")) throw new Error("crumb inválido");
  return { crumb, cookie };
}

async function yquote(symbols, crumb, cookie) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}&crumb=${encodeURIComponent(crumb)}`;
  const r = await fetch(url, { headers: { ...UA, cookie }, signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error("Yahoo quote HTTP " + r.status);
  return (await r.json())?.quoteResponse?.result || [];
}

async function chartQuote(sym) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=5m&range=1d`, { headers: UA, signal: AbortSignal.timeout(7000) });
  if (!r.ok) throw new Error("chart HTTP " + r.status);
  const m = (await r.json())?.chart?.result?.[0]?.meta;
  if (!m) throw new Error("sin meta");
  const pc = m.chartPreviousClose ?? m.previousClose;
  return { symbol: sym, regularMarketPrice: m.regularMarketPrice, regularMarketChangePercent: pc ? ((m.regularMarketPrice - pc) / pc) * 100 : 0, regularMarketVolume: m.regularMarketVolume };
}

const fmtVol = n => n == null ? "—" : n >= 1e9 ? (n/1e9).toFixed(1)+"B" : n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n);

async function fetchSet(symbols) {
  let quotes = [];
  try { const { crumb, cookie } = await getCrumb(); quotes = await yquote(symbols.map(s => s[0]), crumb, cookie); }
  catch { const s = await Promise.allSettled(symbols.map(x => chartQuote(x[0]))); quotes = s.filter(r => r.status === "fulfilled").map(r => r.value); }
  const by = {}; quotes.forEach(q => { by[q.symbol] = q; });
  return symbols.map(([sym, name]) => {
    const q = by[sym]; if (!q || q.regularMarketPrice == null) return null;
    return { s: sym, n: name, p: +q.regularMarketPrice, chg: +(+(q.regularMarketChangePercent ?? 0)).toFixed(2), vol: q.regularMarketVolume ?? null, volFmt: fmtVol(q.regularMarketVolume) };
  }).filter(Boolean);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const set = String(req.query.set || "etfs").trim();
  try {
    if (set === "overview") {
      const [indices, crypto, comm] = await Promise.all([
        fetchSet([["^DJI","Dow Jones"],["^GSPC","S&P 500"],["^IXIC","Nasdaq"],["^VIX","VIX"],["^RUT","Russell 2000"],["DX-Y.NYB","Dollar Index"]]),
        fetchSet([["BTC-USD","Bitcoin"],["ETH-USD","Ethereum"],["SOL-USD","Solana"],["XRP-USD","XRP"],["DOGE-USD","Dogecoin"]]),
        fetchSet([["GC=F","Gold"],["CL=F","Crude Oil"],["NG=F","Natural Gas"],["SI=F","Silver"]]),
      ]);
      res.setHeader("Cache-Control", "s-maxage=45, stale-while-revalidate=120");
      return res.status(200).json({ indices, crypto, commodities: comm, source: "yahoo", ts: Date.now() });
    }
    const symbols = SETS[set];
    if (!symbols) { res.setHeader("Cache-Control", "no-store"); return res.status(400).json({ error: "unknown set: " + set }); }
    const rows = await fetchSet(symbols);
    // Spread 10Y-2Y para bonos
    let extra = {};
    if (set === "bonds") {
      const y10 = rows.find(r => r.s === "^TNX")?.p, y2 = rows.find(r => r.s === "2YY=F")?.p;
      if (y10 != null && y2 != null) extra.spread10_2 = +(y10 - y2).toFixed(2);
    }
    res.setHeader("Cache-Control", "s-maxage=45, stale-while-revalidate=120");
    return res.status(200).json({ set, rows, ...extra, source: "yahoo", ts: Date.now() });
  } catch (e) {
    console.error("[quotes] error:", e.message);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ set, rows: [], source: "error", error: e.message });
  }
}
