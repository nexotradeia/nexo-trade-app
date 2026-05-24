// NexoTrade — Dividend Calendar proxy (Yahoo Finance)
// GET /api/dividends  →  próximos dividendos de las principales acciones

const TOP_DIVIDEND_TICKERS = [
  "AAPL","MSFT","JNJ","KO","PEP","PG","MCD","T","VZ","XOM","CVX",
  "JPM","BAC","WFC","IBM","INTC","ABBV","MRK","PFE","HD","LOW",
  "MMM","CAT","GE","UPS","TGT","WMT","COST","V","MA"
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  if (req.method === "OPTIONS") return res.status(200).end();

  const results = [];
  const batch = TOP_DIVIDEND_TICKERS.slice(0, 20);

  try {
    // Fetch quoteSummary for dividend info
    const symbols = batch.join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=symbol,shortName,regularMarketPrice,dividendDate,exDividendDate,trailingAnnualDividendRate,trailingAnnualDividendYield,forwardPE&lang=en-US`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`);
    const d = await r.json();
    const quotes = d?.quoteResponse?.result || [];

    for (const q of quotes) {
      if (!q.trailingAnnualDividendRate || q.trailingAnnualDividendRate <= 0) continue;
      results.push({
        ticker:   q.symbol,
        name:     q.shortName || q.symbol,
        price:    q.regularMarketPrice,
        divRate:  q.trailingAnnualDividendRate,
        yield:    (q.trailingAnnualDividendYield || 0) * 100,
        exDate:   q.exDividendDate ? new Date(q.exDividendDate * 1000).toISOString().split("T")[0] : null,
        payDate:  q.dividendDate    ? new Date(q.dividendDate    * 1000).toISOString().split("T")[0] : null,
        quarterly: (q.trailingAnnualDividendRate / 4).toFixed(4),
      });
    }

    results.sort((a, b) => {
      if (!a.exDate) return 1;
      if (!b.exDate) return -1;
      return a.exDate.localeCompare(b.exDate);
    });

    return res.status(200).json({ dividends: results });
  } catch(e) {
    console.error("[dividends]", e.message);
    return res.status(500).json({ dividends: [], error: e.message });
  }
}
