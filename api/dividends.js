// NexoTrade — Dividend Calendar proxy (Financial Modeling Prep)
// GET /api/dividends?year=2026  →  dividendos del año solicitado
// Requiere: FMP_API_KEY en Vercel (mismo que IPOs)

const FMP_KEY = process.env.FMP_API_KEY || "";

// Sectores para enriquecer la respuesta de FMP (no siempre lo incluye)
const SECTOR_MAP = {
  AAPL:"Tecnología", MSFT:"Tecnología", IBM:"Tecnología", CSCO:"Tecnología", TXN:"Tecnología", INTC:"Tecnología",
  JNJ:"Salud", ABBV:"Salud", PFE:"Salud", MRK:"Salud", BMY:"Salud", MDT:"Salud",
  KO:"Consumo", PEP:"Consumo", MCD:"Consumo", PG:"Consumo", WMT:"Consumo", HD:"Consumo", CL:"Consumo", GIS:"Consumo", KMB:"Consumo",
  XOM:"Energía", CVX:"Energía", COP:"Energía", OXY:"Energía", ET:"Energía", MMP:"Energía",
  T:"Telecomunicaciones", VZ:"Telecomunicaciones",
  JPM:"Finanzas", BAC:"Finanzas", WFC:"Finanzas", GS:"Finanzas", BLK:"Finanzas",
  O:"REITs", AMT:"REITs", SPG:"REITs", PLD:"REITs", VICI:"REITs", MPW:"REITs",
  NEE:"Utilities", DUK:"Utilities", SO:"Utilities", D:"Utilities",
  MAIN:"BDC/Yield", ARCC:"BDC/Yield", FSK:"BDC/Yield",
};

// Nombres de empresa para enriquecer
const NAME_MAP = {
  AAPL:"Apple Inc", MSFT:"Microsoft Corp", IBM:"IBM Corp", CSCO:"Cisco Systems", TXN:"Texas Instruments", INTC:"Intel Corp",
  JNJ:"Johnson & Johnson", ABBV:"AbbVie Inc", PFE:"Pfizer Inc", MRK:"Merck & Co", BMY:"Bristol-Myers Squibb", MDT:"Medtronic",
  KO:"Coca-Cola Co", PEP:"PepsiCo Inc", MCD:"McDonald's Corp", PG:"Procter & Gamble", WMT:"Walmart Inc", HD:"Home Depot Inc",
  XOM:"ExxonMobil Corp", CVX:"Chevron Corp", COP:"ConocoPhillips", OXY:"Occidental Petroleum", ET:"Energy Transfer LP",
  T:"AT&T Inc", VZ:"Verizon Comm",
  JPM:"JPMorgan Chase", BAC:"Bank of America", WFC:"Wells Fargo", GS:"Goldman Sachs", BLK:"BlackRock Inc",
  O:"Realty Income Corp", AMT:"American Tower", SPG:"Simon Property Group", PLD:"Prologis Inc", VICI:"VICI Properties", MPW:"Medical Properties Trust",
  NEE:"NextEra Energy", DUK:"Duke Energy", SO:"Southern Company", D:"Dominion Energy",
  MAIN:"Main Street Capital", ARCC:"Ares Capital Corp", FSK:"FS KKR Capital",
};

// Tickers a consultar (top dividend payers del S&P 500)
const TICKERS = Object.keys(SECTOR_MAP);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  if (req.method === "OPTIONS") return res.status(200).end();

  const year = parseInt(req.query?.year) || new Date().getFullYear();
  const from = `${year}-01-01`;
  const to   = `${year}-12-31`;

  if (!FMP_KEY) {
    return res.status(200).json({ dividends: [], source: "no-key", year });
  }

  try {
    // FMP stock_dividend_calendar: todos los dividendos en el rango
    const url = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${from}&to=${to}&apikey=${FMP_KEY}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`FMP HTTP ${r.status}`);
    const raw = await r.json();

    if (!Array.isArray(raw) || raw.length === 0) throw new Error("empty");

    // Filtrar solo los tickers que nos interesan y deduplicar por ticker (tomar el más reciente)
    const byTicker = {};
    for (const d of raw) {
      const sym = d.symbol;
      if (!TICKERS.includes(sym)) continue;
      // Si ya existe, quedarse con el de ex-date más próximo al futuro
      if (!byTicker[sym] || d.date > byTicker[sym].date) {
        byTicker[sym] = d;
      }
    }

    const dividends = Object.values(byTicker).map(d => ({
      ticker:    d.symbol,
      name:      NAME_MAP[d.symbol]   || d.symbol,
      sector:    SECTOR_MAP[d.symbol] || "Mercado",
      exDate:    d.date        || null,   // ex-dividend date
      payDate:   d.paymentDate || null,
      divRate:   d.adjDividend ? d.adjDividend * 4 : null,  // anualizado (asumiendo trimestral)
      quarterly: d.dividend    ? parseFloat(d.dividend).toFixed(4) : "—",
      yield:     null,  // FMP calendar no da yield directamente — se calcula en fallback
      price:     null,
    })).filter(d => d.exDate);

    dividends.sort((a, b) => (a.exDate || "9999").localeCompare(b.exDate || "9999"));

    return res.status(200).json({ dividends, source: "fmp", year, total: dividends.length });

  } catch (e) {
    console.error("[dividends]", e.message);
    return res.status(200).json({ dividends: [], source: "error", error: e.message, year });
  }
}
