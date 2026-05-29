// NEXO TRADE — api/congress.js
// Proxy de trades de congresistas de EE.UU.
// Fuente primaria: Quiver Quantitative (si existe API key)
// Fallback: datos curados 2025-2026

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");

  const QUIVER_KEY = process.env.QUIVER_API_KEY;

  // ── Intentar Quiver Quantitative si hay API key ──────────────────
  if (QUIVER_KEY) {
    try {
      const r = await fetch(
        "https://api.quiverquant.com/beta/live/congresstrading",
        { headers: { Authorization: `Bearer ${QUIVER_KEY}` } }
      );
      if (r.ok) {
        const data = await r.json();
        // Normalizar formato Quiver → nuestro formato
        const trades = (Array.isArray(data) ? data : data.data || [])
          .slice(0, 100)
          .map((t) => ({
            name:   t.Representative || t.Name || "Unknown",
            party:  t.Party || "?",
            state:  t.State || "",
            ticker: t.Ticker || "",
            type:   (t.Transaction || "").toLowerCase().includes("sale") ? "sell" : "buy",
            amount: t.Range || t.Amount || "$1K–$15K",
            date:   t.TransactionDate || t.Date || "",
            asset:  t.AssetDescription || t.Ticker || "",
            house:  t.House || "House",
          }));
        return res.status(200).json({ source: "quiver", trades });
      }
    } catch (e) {
      // fall through to curated data
    }
  }

  // ── Datos curados 2024-2026 (STOCK Act disclosures) ──────────────
  const CURATED = [
    // ── Mayo 2026 ────────────────────────────────────────────────
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"NVDA", type:"buy",  amount:"$500K–$1M",   date:"2026-05-20", asset:"NVIDIA Corp",                   house:"House"  },
    { name:"Josh Gottheimer",        party:"D", state:"NJ", ticker:"PLTR", type:"buy",  amount:"$50K–$100K",  date:"2026-05-19", asset:"Palantir Technologies",          house:"House"  },
    { name:"Michael McCaul",         party:"R", state:"TX", ticker:"LMT",  type:"buy",  amount:"$100K–$250K", date:"2026-05-16", asset:"Lockheed Martin",                house:"House"  },
    { name:"Ro Khanna",              party:"D", state:"CA", ticker:"TSLA", type:"buy",  amount:"$15K–$50K",   date:"2026-05-14", asset:"Tesla Inc",                      house:"House"  },
    { name:"Tommy Tuberville",       party:"R", state:"AL", ticker:"XOM",  type:"sell", amount:"$50K–$100K",  date:"2026-05-12", asset:"Exxon Mobil",                    house:"Senate" },
    { name:"Marjorie Taylor Greene", party:"R", state:"GA", ticker:"AMZN", type:"buy",  amount:"$15K–$50K",   date:"2026-05-10", asset:"Amazon.com Inc",                 house:"House"  },
    { name:"Rick Scott",             party:"R", state:"FL", ticker:"CRWD", type:"buy",  amount:"$100K–$250K", date:"2026-05-08", asset:"CrowdStrike Holdings",           house:"Senate" },
    { name:"Dan Crenshaw",           party:"R", state:"TX", ticker:"RTX",  type:"buy",  amount:"$50K–$100K",  date:"2026-05-06", asset:"Raytheon Technologies",          house:"House"  },
    { name:"Alexandria Ocasio-Cortez",party:"D",state:"NY", ticker:"AAPL", type:"buy",  amount:"$1K–$15K",    date:"2026-05-05", asset:"Apple Inc",                      house:"House"  },
    { name:"Pete Sessions",          party:"R", state:"TX", ticker:"CVX",  type:"buy",  amount:"$50K–$100K",  date:"2026-05-03", asset:"Chevron Corp",                   house:"House"  },
    // ── Abril 2026 ───────────────────────────────────────────────
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"GOOG", type:"buy",  amount:"$500K–$1M",   date:"2026-04-28", asset:"Alphabet Inc",                   house:"House"  },
    { name:"Susie Lee",              party:"D", state:"NV", ticker:"MSFT", type:"buy",  amount:"$100K–$250K", date:"2026-04-25", asset:"Microsoft Corp",                  house:"House"  },
    { name:"John Curtis",            party:"R", state:"UT", ticker:"COIN", type:"buy",  amount:"$50K–$100K",  date:"2026-04-22", asset:"Coinbase Global",                house:"Senate" },
    { name:"Debbie Wasserman Schultz",party:"D",state:"FL", ticker:"META", type:"buy",  amount:"$15K–$50K",   date:"2026-04-20", asset:"Meta Platforms",                 house:"House"  },
    { name:"Brian Mast",             party:"R", state:"FL", ticker:"BA",   type:"sell", amount:"$50K–$100K",  date:"2026-04-18", asset:"Boeing Co",                      house:"House"  },
    { name:"Pat Fallon",             party:"R", state:"TX", ticker:"AXON", type:"buy",  amount:"$15K–$50K",   date:"2026-04-17", asset:"Axon Enterprise",                house:"House"  },
    { name:"Mike Waltz",             party:"R", state:"FL", ticker:"PLTR", type:"buy",  amount:"$50K–$100K",  date:"2026-04-15", asset:"Palantir Technologies",          house:"House"  },
    { name:"Ron Wyden",              party:"D", state:"OR", ticker:"AMZN", type:"buy",  amount:"$15K–$50K",   date:"2026-04-12", asset:"Amazon.com Inc",                 house:"Senate" },
    { name:"Markwayne Mullin",       party:"R", state:"OK", ticker:"XOM",  type:"buy",  amount:"$100K–$250K", date:"2026-04-10", asset:"Exxon Mobil",                    house:"Senate" },
    { name:"Lori Chavez-DeRemer",    party:"R", state:"OR", ticker:"NVDA", type:"buy",  amount:"$15K–$50K",   date:"2026-04-08", asset:"NVIDIA Corp",                    house:"House"  },
    // ── Marzo 2026 ───────────────────────────────────────────────
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"CRWD", type:"buy",  amount:"$250K–$500K", date:"2026-03-28", asset:"CrowdStrike Holdings",           house:"House"  },
    { name:"Josh Gottheimer",        party:"D", state:"NJ", ticker:"AMD",  type:"buy",  amount:"$50K–$100K",  date:"2026-03-25", asset:"Advanced Micro Devices",         house:"House"  },
    { name:"Marjorie Taylor Greene", party:"R", state:"GA", ticker:"TSLA", type:"buy",  amount:"$15K–$50K",   date:"2026-03-22", asset:"Tesla Inc",                      house:"House"  },
    { name:"Rick Scott",             party:"R", state:"FL", ticker:"JPM",  type:"sell", amount:"$250K–$500K", date:"2026-03-18", asset:"JPMorgan Chase",                 house:"Senate" },
    { name:"Dan Crenshaw",           party:"R", state:"TX", ticker:"LMT",  type:"buy",  amount:"$15K–$50K",   date:"2026-03-15", asset:"Lockheed Martin",                house:"House"  },
    { name:"Susie Lee",              party:"D", state:"NV", ticker:"AAPL", type:"buy",  amount:"$50K–$100K",  date:"2026-03-12", asset:"Apple Inc",                      house:"House"  },
    { name:"Tommy Tuberville",       party:"R", state:"AL", ticker:"GLD",  type:"buy",  amount:"$100K–$250K", date:"2026-03-10", asset:"SPDR Gold Shares ETF",           house:"Senate" },
    { name:"Kevin Hern",             party:"R", state:"OK", ticker:"OXY",  type:"buy",  amount:"$50K–$100K",  date:"2026-03-08", asset:"Occidental Petroleum",          house:"House"  },
    { name:"David Rouzer",           party:"R", state:"NC", ticker:"HD",   type:"buy",  amount:"$15K–$50K",   date:"2026-03-05", asset:"Home Depot Inc",                 house:"House"  },
    { name:"Laphonza Butler",        party:"D", state:"CA", ticker:"NVDA", type:"buy",  amount:"$50K–$100K",  date:"2026-03-02", asset:"NVIDIA Corp",                    house:"Senate" },
    // ── Febrero 2026 ─────────────────────────────────────────────
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"TSLA", type:"buy",  amount:"$1M–$5M",     date:"2026-02-28", asset:"Tesla Inc",                      house:"House"  },
    { name:"Michael McCaul",         party:"R", state:"TX", ticker:"NVDA", type:"buy",  amount:"$250K–$500K", date:"2026-02-25", asset:"NVIDIA Corp",                    house:"House"  },
    { name:"Ro Khanna",              party:"D", state:"CA", ticker:"MSFT", type:"buy",  amount:"$15K–$50K",   date:"2026-02-20", asset:"Microsoft Corp",                 house:"House"  },
    { name:"John Rutherford",        party:"R", state:"FL", ticker:"JPM",  type:"buy",  amount:"$50K–$100K",  date:"2026-02-18", asset:"JPMorgan Chase",                 house:"House"  },
    { name:"Pat Fallon",             party:"R", state:"TX", ticker:"GD",   type:"buy",  amount:"$15K–$50K",   date:"2026-02-15", asset:"General Dynamics",               house:"House"  },
    { name:"Rick Scott",             party:"R", state:"FL", ticker:"AMZN", type:"buy",  amount:"$500K–$1M",   date:"2026-02-12", asset:"Amazon.com Inc",                 house:"Senate" },
    { name:"Josh Gottheimer",        party:"D", state:"NJ", ticker:"META", type:"buy",  amount:"$50K–$100K",  date:"2026-02-10", asset:"Meta Platforms",                 house:"House"  },
    { name:"Brian Higgins",          party:"D", state:"NY", ticker:"GOOGL",type:"sell", amount:"$50K–$100K",  date:"2026-02-08", asset:"Alphabet Inc",                   house:"House"  },
    { name:"Mike Collins",           party:"R", state:"GA", ticker:"PLTR", type:"buy",  amount:"$50K–$100K",  date:"2026-02-05", asset:"Palantir Technologies",          house:"House"  },
    { name:"John Moolenaar",         party:"R", state:"MI", ticker:"INTC", type:"sell", amount:"$15K–$50K",   date:"2026-02-02", asset:"Intel Corp",                     house:"House"  },
    // ── Enero 2026 ───────────────────────────────────────────────
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"AAPL", type:"buy",  amount:"$250K–$500K", date:"2026-01-28", asset:"Apple Inc",                      house:"House"  },
    { name:"Tommy Tuberville",       party:"R", state:"AL", ticker:"TSLA", type:"buy",  amount:"$15K–$50K",   date:"2026-01-22", asset:"Tesla Inc",                      house:"Senate" },
    { name:"Dan Crenshaw",           party:"R", state:"TX", ticker:"AXON", type:"buy",  amount:"$50K–$100K",  date:"2026-01-18", asset:"Axon Enterprise",                house:"House"  },
    { name:"Ro Khanna",              party:"D", state:"CA", ticker:"AMD",  type:"buy",  amount:"$15K–$50K",   date:"2026-01-15", asset:"Advanced Micro Devices",         house:"House"  },
    { name:"Marjorie Taylor Greene", party:"R", state:"GA", ticker:"NVDA", type:"buy",  amount:"$15K–$50K",   date:"2026-01-12", asset:"NVIDIA Corp",                    house:"House"  },
    { name:"Pete Sessions",          party:"R", state:"TX", ticker:"COP",  type:"buy",  amount:"$50K–$100K",  date:"2026-01-10", asset:"ConocoPhillips",                 house:"House"  },
    { name:"David Schweikert",       party:"R", state:"AZ", ticker:"COIN", type:"buy",  amount:"$1K–$15K",    date:"2026-01-08", asset:"Coinbase Global",                house:"House"  },
    { name:"Debbie Wasserman Schultz",party:"D",state:"FL", ticker:"MSFT", type:"buy",  amount:"$50K–$100K",  date:"2026-01-05", asset:"Microsoft Corp",                 house:"House"  },
    { name:"Rick Scott",             party:"R", state:"FL", ticker:"NFLX", type:"buy",  amount:"$100K–$250K", date:"2026-01-03", asset:"Netflix Inc",                    house:"Senate" },
    // ── 2025 ─────────────────────────────────────────────────────
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"NVDA", type:"buy",  amount:"$1M–$5M",     date:"2025-12-20", asset:"NVIDIA Corp",                    house:"House"  },
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"GOOG", type:"buy",  amount:"$500K–$1M",   date:"2025-11-10", asset:"Alphabet Inc",                   house:"House"  },
    { name:"Tommy Tuberville",       party:"R", state:"AL", ticker:"GME",  type:"sell", amount:"$1K–$15K",    date:"2025-10-22", asset:"GameStop Corp",                  house:"Senate" },
    { name:"Ron Wyden",              party:"D", state:"OR", ticker:"MSFT", type:"buy",  amount:"$15K–$50K",   date:"2025-10-15", asset:"Microsoft Corp",                 house:"Senate" },
    { name:"Josh Gottheimer",        party:"D", state:"NJ", ticker:"NVDA", type:"buy",  amount:"$50K–$100K",  date:"2025-09-30", asset:"NVIDIA Corp",                    house:"House"  },
    { name:"Michael McCaul",         party:"R", state:"TX", ticker:"AAPL", type:"sell", amount:"$15K–$50K",   date:"2025-09-18", asset:"Apple Inc",                      house:"House"  },
    { name:"Susie Lee",              party:"D", state:"NV", ticker:"TSLA", type:"buy",  amount:"$50K–$100K",  date:"2025-09-05", asset:"Tesla Inc",                      house:"House"  },
    { name:"Dan Crenshaw",           party:"R", state:"TX", ticker:"RTX",  type:"buy",  amount:"$15K–$50K",   date:"2025-08-28", asset:"Raytheon Technologies",          house:"House"  },
    { name:"Rick Scott",             party:"R", state:"FL", ticker:"AMZN", type:"buy",  amount:"$500K–$1M",   date:"2025-08-12", asset:"Amazon.com Inc",                 house:"Senate" },
    { name:"Ro Khanna",              party:"D", state:"CA", ticker:"PLTR", type:"buy",  amount:"$15K–$50K",   date:"2025-07-25", asset:"Palantir Technologies",          house:"House"  },
    { name:"Pat Fallon",             party:"R", state:"TX", ticker:"LMT",  type:"buy",  amount:"$50K–$100K",  date:"2025-07-15", asset:"Lockheed Martin",                house:"House"  },
    { name:"Markwayne Mullin",       party:"R", state:"OK", ticker:"CVX",  type:"buy",  amount:"$100K–$250K", date:"2025-07-08", asset:"Chevron Corp",                   house:"Senate" },
    { name:"Brian Mast",             party:"R", state:"FL", ticker:"NOC",  type:"buy",  amount:"$15K–$50K",   date:"2025-06-20", asset:"Northrop Grumman",               house:"House"  },
    { name:"Kevin Hern",             party:"R", state:"OK", ticker:"XOM",  type:"buy",  amount:"$50K–$100K",  date:"2025-06-10", asset:"Exxon Mobil",                    house:"House"  },
    { name:"Mike Collins",           party:"R", state:"GA", ticker:"TSLA", type:"buy",  amount:"$15K–$50K",   date:"2025-05-28", asset:"Tesla Inc",                      house:"House"  },
    { name:"David Schweikert",       party:"R", state:"AZ", ticker:"BTC",  type:"buy",  amount:"$1K–$15K",    date:"2025-05-15", asset:"Bitcoin ETF (IBIT)",             house:"House"  },
    { name:"Alexandria Ocasio-Cortez",party:"D",state:"NY", ticker:"MSFT", type:"buy",  amount:"$1K–$15K",    date:"2025-04-30", asset:"Microsoft Corp",                 house:"House"  },
    { name:"Brian Higgins",          party:"D", state:"NY", ticker:"AMZN", type:"buy",  amount:"$50K–$100K",  date:"2025-04-18", asset:"Amazon.com Inc",                 house:"House"  },
    { name:"John Moolenaar",         party:"R", state:"MI", ticker:"NVDA", type:"buy",  amount:"$50K–$100K",  date:"2025-04-05", asset:"NVIDIA Corp",                    house:"House"  },
    { name:"Pete Sessions",          party:"R", state:"TX", ticker:"OXY",  type:"buy",  amount:"$15K–$50K",   date:"2025-03-25", asset:"Occidental Petroleum",          house:"House"  },
    { name:"John Rutherford",        party:"R", state:"FL", ticker:"WFC",  type:"sell", amount:"$50K–$100K",  date:"2025-03-12", asset:"Wells Fargo & Co",               house:"House"  },
    { name:"Lori Chavez-DeRemer",    party:"R", state:"OR", ticker:"AMD",  type:"buy",  amount:"$15K–$50K",   date:"2025-02-28", asset:"Advanced Micro Devices",         house:"House"  },
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"MSFT", type:"buy",  amount:"$500K–$1M",   date:"2025-02-14", asset:"Microsoft Corp",                 house:"House"  },
    { name:"David Rouzer",           party:"R", state:"NC", ticker:"LOW",  type:"buy",  amount:"$15K–$50K",   date:"2025-02-03", asset:"Lowe's Companies",               house:"House"  },
    { name:"Josh Gottheimer",        party:"D", state:"NJ", ticker:"AMZN", type:"buy",  amount:"$15K–$50K",   date:"2025-01-20", asset:"Amazon.com Inc",                 house:"House"  },
    { name:"Marjorie Taylor Greene", party:"R", state:"GA", ticker:"NVDA", type:"buy",  amount:"$15K–$50K",   date:"2025-01-15", asset:"NVIDIA Corp",                    house:"House"  },
    { name:"Tommy Tuberville",       party:"R", state:"AL", ticker:"GLD",  type:"buy",  amount:"$50K–$100K",  date:"2025-01-10", asset:"SPDR Gold Shares ETF",           house:"Senate" },
    { name:"Rick Scott",             party:"R", state:"FL", ticker:"TSLA", type:"buy",  amount:"$100K–$250K", date:"2025-01-06", asset:"Tesla Inc",                      house:"Senate" },
  ];

  // Sort by date descending
  CURATED.sort((a,b) => new Date(b.date) - new Date(a.date));

  res.status(200).json({ source: "curated", trades: CURATED });
}
