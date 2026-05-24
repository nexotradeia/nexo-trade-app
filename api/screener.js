// NexoTrade — Stock Screener proxy (Yahoo Finance predefined screens)
// GET /api/screener?screen=gainers|losers|active|undervalued|growth|dividend

const SCREENS = {
  gainers:    "day_gainers",
  losers:     "day_losers",
  active:     "most_actives",
  undervalued:"undervalued_growth_stocks",
  growth:     "growth_technology_stocks",
  dividend:   "portfolio_anchors",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
  if (req.method === "OPTIONS") return res.status(200).end();

  const screen = req.query.screen || "gainers";
  const scrId  = SCREENS[screen] || SCREENS.gainers;

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=${scrId}&count=25&lang=en-US&region=US`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`);
    const d = await r.json();
    const quotes = d?.finance?.result?.[0]?.quotes || [];
    return res.status(200).json({ quotes, screen, total: quotes.length });
  } catch(e) {
    console.error("[screener]", e.message);
    return res.status(500).json({ quotes: [], error: e.message });
  }
}
