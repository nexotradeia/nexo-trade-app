// NexoTrade — ARK Daily Holdings proxy (sin CORS)
// ARK Invest publica sus holdings DIARIAMENTE en CSV público
// GET /api/ark?fund=ARKK|ARKQ|ARKW|ARKG|ARKF

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=300");
  if (req.method === "OPTIONS") return res.status(200).end();

  const fund = (req.query.fund || "ARKK").toUpperCase();
  const FUND_NAMES = {
    ARKK: "ARK_INNOVATION_ETF_ARKK_HOLDINGS",
    ARKQ: "ARK_AUTONOMOUS_TECHNOLOGY_&_ROBOTICS_ETF_ARKQ_HOLDINGS",
    ARKW: "ARK_NEXT_GENERATION_INTERNET_ETF_ARKW_HOLDINGS",
    ARKG: "ARK_GENOMIC_REVOLUTION_ETF_ARKG_HOLDINGS",
    ARKF: "ARK_FINTECH_INNOVATION_ETF_ARKF_HOLDINGS",
  };
  const fileName = FUND_NAMES[fund] || FUND_NAMES["ARKK"];
  const url = `https://ark-funds.com/wp-content/uploads/funds-etf-csv/${fileName}.csv`;

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NexoTrade/1.0)",
        "Accept": "text/csv,*/*",
      },
    });
    if (!r.ok) throw new Error(`ARK HTTP ${r.status}`);
    const text = await r.text();

    // Parse CSV
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) throw new Error("Empty CSV");

    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase());
    const holdings = [];

    for (let i = 1; i < Math.min(lines.length, 31); i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
      const row = {};
      headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });

      const ticker  = row["ticker"] || row["symbol"] || "";
      const company = row["company"] || row["name"] || "";
      const shares  = parseFloat(row["shares"] || row["market value"] || 0);
      const weight  = parseFloat(row["weight (%)"] || row["weight"] || 0);
      const value   = parseFloat(row["market value"] || 0);

      if (ticker && ticker !== "—") {
        holdings.push({ ticker, company, shares, weight, value, fund });
      }
    }

    // Fetch price changes from Finnhub for top 10
    const FINNHUB_KEY = process.env.FINNHUB_KEY || "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
    const top10 = holdings.slice(0, 10);
    const prices = await Promise.allSettled(
      top10.map(async h => {
        if (!h.ticker) return null;
        try {
          const qr = await fetch(`https://finnhub.io/api/v1/quote?symbol=${h.ticker}&token=${FINNHUB_KEY}`);
          const qd = await qr.json();
          return { ticker: h.ticker, price: qd.c || 0, change: qd.dp || 0 };
        } catch { return null; }
      })
    );
    const priceMap = {};
    prices.forEach(r => { if (r.status === "fulfilled" && r.value) priceMap[r.value.ticker] = r.value; });

    const enriched = holdings.map(h => ({
      ...h,
      price:  priceMap[h.ticker]?.price  || null,
      change: priceMap[h.ticker]?.change || null,
    }));

    return res.status(200).json({
      fund,
      date: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
      holdings: enriched,
      count: enriched.length,
    });
  } catch (err) {
    // Fallback con datos conocidos de ARKK
    return res.status(200).json({
      fund,
      date: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
      fallback: true,
      holdings: [
        { ticker:"TSLA",  company:"Tesla Inc",              weight:11.2, change: 2.1,  price:338 },
        { ticker:"ROKU",  company:"Roku Inc",               weight: 8.4, change:-1.3,  price: 68 },
        { ticker:"COIN",  company:"Coinbase Global",         weight: 7.9, change: 3.4,  price:238 },
        { ticker:"RBLX",  company:"Roblox Corp",             weight: 5.1, change: 0.8,  price: 47 },
        { ticker:"PATH",  company:"UiPath Inc",              weight: 4.8, change:-0.5,  price: 14 },
        { ticker:"EXAS",  company:"Exact Sciences",          weight: 4.2, change: 1.2,  price: 46 },
        { ticker:"RXRX",  company:"Recursion Pharma",        weight: 3.9, change: 4.1,  price:  8 },
        { ticker:"HOOD",  company:"Robinhood Markets",       weight: 3.7, change: 2.3,  price: 47 },
        { ticker:"BEAM",  company:"Beam Therapeutics",       weight: 3.1, change:-2.1,  price: 22 },
        { ticker:"PACB",  company:"Pacific Biosciences",     weight: 2.8, change: 0.5,  price:  2 },
      ],
      count: 10,
    });
  }
}
