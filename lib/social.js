// NexoTrade — Trending social (StockTwits): qué tickers se ven/hablan más. Server-side, cacheado.
export default async function social(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
  try {
    const r = await fetch("https://api.stocktwits.com/api/2/trending/symbols.json?limit=20", {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "application/json" },
      signal: AbortSignal.timeout(7000),
    });
    if (r.ok) {
      const j = await r.json();
      const trending = (j.symbols || []).map((s) => ({
        ticker: s.symbol, name: s.title || "", watchers: s.watchlist_count || 0,
      })).filter((s) => s.ticker).slice(0, 16);
      return res.status(200).json({ trending, source: "StockTwits", ts: Date.now() });
    }
  } catch (e) { /* skip */ }
  return res.status(200).json({ trending: [], ts: Date.now() });
}
