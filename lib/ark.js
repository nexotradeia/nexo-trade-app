// NexoTrade — ARK Daily Holdings proxy (sin CORS)
// ARK Invest publica sus holdings DIARIAMENTE en CSV público
// GET /api/ark?fund=ARKK|ARKQ|ARKW|ARKG|ARKF

const FALLBACK = {
  ARKK: [
    { ticker:"TSLA",  company:"Tesla Inc",                   weight:11.2, change: 2.1,  price:338 },
    { ticker:"COIN",  company:"Coinbase Global",              weight: 8.1, change: 3.4,  price:238 },
    { ticker:"ROKU",  company:"Roku Inc",                    weight: 7.4, change:-1.3,  price: 68 },
    { ticker:"RBLX",  company:"Roblox Corp",                 weight: 5.1, change: 0.8,  price: 47 },
    { ticker:"PATH",  company:"UiPath Inc",                  weight: 4.8, change:-0.5,  price: 14 },
    { ticker:"HOOD",  company:"Robinhood Markets",           weight: 4.2, change: 2.3,  price: 47 },
    { ticker:"EXAS",  company:"Exact Sciences",              weight: 3.9, change: 1.2,  price: 46 },
    { ticker:"RXRX",  company:"Recursion Pharma",            weight: 3.7, change: 4.1,  price:  8 },
    { ticker:"BEAM",  company:"Beam Therapeutics",           weight: 3.1, change:-2.1,  price: 22 },
    { ticker:"PACB",  company:"Pacific Biosciences",         weight: 2.8, change: 0.5,  price:  2 },
    { ticker:"CRISPR",company:"CRISPR Therapeutics",         weight: 2.5, change: 1.8,  price: 55 },
    { ticker:"DNA",   company:"Ginkgo Bioworks",             weight: 2.1, change:-0.9,  price:  3 },
    { ticker:"TXG",   company:"10x Genomics",                weight: 1.9, change: 2.3,  price: 21 },
    { ticker:"VCNX",  company:"Vaccinex Inc",                weight: 1.7, change:-1.5,  price:  4 },
    { ticker:"SEER",  company:"Seer Inc",                    weight: 1.5, change: 3.2,  price:  6 },
  ],
  ARKQ: [
    { ticker:"TSLA",  company:"Tesla Inc",                   weight:12.8, change: 2.1,  price:338 },
    { ticker:"KTOS",  company:"Kratos Defense",              weight: 7.9, change: 1.5,  price: 28 },
    { ticker:"UAVS",  company:"AgEagle Aerial Systems",      weight: 6.4, change:-0.8,  price:  2 },
    { ticker:"PATH",  company:"UiPath Inc",                  weight: 5.9, change:-0.5,  price: 14 },
    { ticker:"RKLB",  company:"Rocket Lab USA",              weight: 5.3, change: 3.7,  price: 25 },
    { ticker:"TRMB",  company:"Trimble Inc",                 weight: 4.8, change: 0.9,  price: 62 },
    { ticker:"ASTR",  company:"Astra Space Inc",             weight: 4.2, change:-2.1,  price:  1 },
    { ticker:"SPCE",  company:"Virgin Galactic",             weight: 3.7, change:-3.5,  price:  2 },
    { ticker:"ACHR",  company:"Archer Aviation",             weight: 3.5, change: 5.2,  price: 10 },
    { ticker:"JOBY",  company:"Joby Aviation",               weight: 3.1, change: 2.4,  price:  7 },
  ],
  ARKW: [
    { ticker:"COIN",  company:"Coinbase Global",             weight: 9.8, change: 3.4,  price:238 },
    { ticker:"HOOD",  company:"Robinhood Markets",           weight: 7.3, change: 2.3,  price: 47 },
    { ticker:"TSLA",  company:"Tesla Inc",                   weight: 6.9, change: 2.1,  price:338 },
    { ticker:"SQ",    company:"Block Inc",                   weight: 6.1, change: 1.8,  price: 68 },
    { ticker:"ROKU",  company:"Roku Inc",                    weight: 5.4, change:-1.3,  price: 68 },
    { ticker:"TWLO",  company:"Twilio Inc",                  weight: 4.8, change:-0.7,  price: 62 },
    { ticker:"RBLX",  company:"Roblox Corp",                 weight: 4.3, change: 0.8,  price: 47 },
    { ticker:"SPOT",  company:"Spotify Technology",          weight: 3.9, change: 1.5,  price:360 },
    { ticker:"SNAP",  company:"Snap Inc",                    weight: 3.4, change:-1.9,  price: 11 },
    { ticker:"MSTR",  company:"MicroStrategy",               weight: 3.1, change: 4.2,  price:388 },
  ],
  ARKG: [
    { ticker:"RXRX",  company:"Recursion Pharma",            weight: 8.9, change: 4.1,  price:  8 },
    { ticker:"CRISPR",company:"CRISPR Therapeutics",         weight: 7.4, change: 1.8,  price: 55 },
    { ticker:"EXAS",  company:"Exact Sciences",              weight: 6.8, change: 1.2,  price: 46 },
    { ticker:"BEAM",  company:"Beam Therapeutics",           weight: 6.1, change:-2.1,  price: 22 },
    { ticker:"PACB",  company:"Pacific Biosciences",         weight: 5.7, change: 0.5,  price:  2 },
    { ticker:"NTLA",  company:"Intellia Therapeutics",       weight: 5.3, change: 3.1,  price: 15 },
    { ticker:"TXG",   company:"10x Genomics",                weight: 4.9, change: 2.3,  price: 21 },
    { ticker:"VERV",  company:"Verve Therapeutics",          weight: 4.2, change:-1.4,  price: 14 },
    { ticker:"TWST",  company:"Twist Bioscience",            weight: 3.8, change: 1.9,  price: 28 },
    { ticker:"DNA",   company:"Ginkgo Bioworks",             weight: 3.4, change:-0.9,  price:  3 },
  ],
  ARKF: [
    { ticker:"COIN",  company:"Coinbase Global",             weight:10.4, change: 3.4,  price:238 },
    { ticker:"SQ",    company:"Block Inc",                   weight: 8.9, change: 1.8,  price: 68 },
    { ticker:"HOOD",  company:"Robinhood Markets",           weight: 7.3, change: 2.3,  price: 47 },
    { ticker:"SOFI",  company:"SoFi Technologies",           weight: 6.8, change: 2.9,  price: 14 },
    { ticker:"MELI",  company:"MercadoLibre",                weight: 5.9, change: 1.1,  price:2200 },
    { ticker:"NU",    company:"Nu Holdings",                 weight: 5.4, change: 3.2,  price: 16 },
    { ticker:"AFRM",  company:"Affirm Holdings",             weight: 4.8, change:-1.7,  price: 52 },
    { ticker:"OPEN",  company:"Opendoor Technologies",       weight: 4.1, change:-2.3,  price:  3 },
    { ticker:"UPST",  company:"Upstart Holdings",            weight: 3.7, change: 4.5,  price: 78 },
    { ticker:"LMND",  company:"Lemonade Inc",                weight: 3.2, change: 0.8,  price: 22 },
  ],
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=300");
  if (req.method === "OPTIONS") return res.status(200).end();

  const fund = (req.query.fund || "ARKK").toUpperCase();

  // Multiple URL formats to try (ARK has changed their CDN before)
  const FUND_NAMES = {
    ARKK: "ARK_INNOVATION_ETF_ARKK_HOLDINGS",
    ARKQ: "ARK_AUTONOMOUS_TECHNOLOGY_&_ROBOTICS_ETF_ARKQ_HOLDINGS",
    ARKW: "ARK_NEXT_GENERATION_INTERNET_ETF_ARKW_HOLDINGS",
    ARKG: "ARK_GENOMIC_REVOLUTION_ETF_ARKG_HOLDINGS",
    ARKF: "ARK_FINTECH_INNOVATION_ETF_ARKF_HOLDINGS",
  };
  const fileName = FUND_NAMES[fund] || FUND_NAMES["ARKK"];
  const URLS_TO_TRY = [
    `https://ark-funds.com/wp-content/uploads/funds-etf-csv/${fileName}.csv`,
    `https://ark-funds.com/wp-content/uploads/funds-etf-csv/${fund}_HOLDINGS.csv`,
    `https://assets.ark-funds.com/funds/${fund}/${fileName}.csv`,
  ];

  let text = null;
  for (const url of URLS_TO_TRY) {
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/csv,text/plain,*/*",
          "Referer": "https://ark-funds.com/",
        },
      });
      if (r.ok) {
        const t = await r.text();
        if (t && t.length > 100 && t.includes(",")) { text = t; break; }
      }
    } catch {}
  }

  // Parse if we got valid CSV
  let holdings = [];
  if (text) {
    try {
      const lines = text.trim().split("\n").filter(l => l.trim());
      if (lines.length >= 2) {
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase());
        for (let i = 1; i < Math.min(lines.length, 31); i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
          const row = {};
          headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
          const ticker  = row["ticker"] || row["symbol"] || "";
          const company = row["company"] || row["name"] || "";
          const weight  = parseFloat(row["weight (%)"] || row["weight"] || 0);
          const value   = parseFloat(row["market value"] || 0);
          const shares  = parseFloat(row["shares"] || 0);
          if (ticker && ticker !== "—" && ticker !== "ticker") {
            holdings.push({ ticker, company, shares, weight, value, fund });
          }
        }
      }
    } catch {}
  }

  const fromCSV = holdings.length > 0;
  if (!fromCSV) {
    // Use rich curated fallback
    holdings = (FALLBACK[fund] || FALLBACK["ARKK"]).map(h => ({ ...h, fund }));
  }

  try {

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
      fallback: !fromCSV,
      holdings: enriched,
      count: enriched.length,
    });
  } catch (err) {
    // Ultimate fallback — Finnhub fetch failed but we still have holdings
    const fallbackHoldings = (FALLBACK[fund] || FALLBACK["ARKK"]).map(h => ({ ...h, fund }));
    return res.status(200).json({
      fund,
      date: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
      fallback: true,
      holdings: fallbackHoldings,
      count: fallbackHoldings.length,
    });
  }
}
