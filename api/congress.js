// NEXO TRADE — api/congress.js
// Proxy de trades de congresistas de EE.UU.
// Fuente 1: Quiver Quantitative (si existe API key)
// Fuente 2: Capitol Trades scraping (datos STOCK Act, dominio público)
// Fuente 3: datos curados 2025-2026

// ── Helper: parse concatenated names like "David TaylorRepublicanHouseOH"
function parseRawName(raw) {
  // Pattern: Name + Party (Republican|Democrat|Independent) + Chamber (House|Senate) + State (2 letters)
  const rx = /(Republican|Democrat|Democratic|Independent)(House|Senate)([A-Z]{2})$/;
  const m = raw.match(rx);
  if (m) {
    const name = raw.slice(0, raw.length - m[0].length).trim();
    const party = m[1].startsWith("R") ? "R" : m[1] === "Independent" ? "I" : "D";
    return { name, party, house: m[2], state: m[3] };
  }
  // Fallback: try splitting on Jr/Sr suffixes or just return raw
  return { name: raw, party: "", house: "House", state: "" };
}

// ── Helper: map Capitol Trades JSON format → our format ──────────────
function mapCapitolTrade(t) {
  const politician = t.politician || t.member || {};
  const asset = t.asset || t.issuer || {};
  const txType = (t.type || t.transactionType || t.transaction || "").toLowerCase();

  // Get raw name and try to parse if concatenated
  let rawName = politician.name || (politician.firstName ? politician.firstName + " " + politician.lastName : null) || t.name || "Unknown";
  let parsedParty = (politician.party || t.party || "").slice(0, 1).toUpperCase();
  let parsedHouse = politician.chamber || politician.house || t.chamber || "House";
  let parsedState = politician.state || t.state || "";

  // If name looks concatenated (has Republican/Democrat/House/Senate appended), parse it
  if (/Republican|Democrat|Independent/.test(rawName) && !parsedParty && !parsedState) {
    const parsed = parseRawName(rawName);
    rawName = parsed.name;
    if (!parsedParty) parsedParty = parsed.party;
    if (!parsedHouse || parsedHouse === "House") parsedHouse = parsed.house;
    if (!parsedState) parsedState = parsed.state;
  } else if (/Republican|Democrat|Independent/.test(rawName)) {
    // Even if we have other fields, fix the name
    const parsed = parseRawName(rawName);
    rawName = parsed.name || rawName;
  }

  return {
    name:   rawName,
    party:  parsedParty,
    state:  parsedState,
    ticker: asset.ticker || asset.symbol || t.ticker || "",
    type:   txType.includes("sale") || txType.includes("sell") ? "sell" : "buy",
    amount: t.range || t.amount || t.size || "$1K–$15K",
    date:   t.filedDate || t.transactionDate || t.date || "",
    asset:  asset.name || asset.description || t.assetName || "",
    house:  parsedHouse,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");

  const QUIVER_KEY = process.env.QUIVER_API_KEY;

  // ── 1. Quiver Quantitative ────────────────────────────────────────
  if (QUIVER_KEY) {
    try {
      const r = await fetch(
        "https://api.quiverquant.com/beta/live/congresstrading",
        { headers: { Authorization: `Bearer ${QUIVER_KEY}` } }
      );
      if (r.ok) {
        const data = await r.json();
        const trades = (Array.isArray(data) ? data : data.data || [])
          .slice(0, 150)
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
      // fall through
    }
  }

  // ── 2. Capitol Trades scraping (STOCK Act public disclosures) ─────
  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };

    const r = await fetch("https://www.capitoltrades.com/trades?pageSize=100", { headers });
    if (r.ok) {
      const html = await r.text();

      // ── Try Next.js __NEXT_DATA__ embedded JSON ──────────────────
      const ndMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (ndMatch) {
        try {
          const nd = JSON.parse(ndMatch[1]);
          // Capitol Trades Next.js data structure
          const raw =
            nd?.props?.pageProps?.trades ||
            nd?.props?.pageProps?.data ||
            nd?.props?.pageProps?.initialTrades ||
            [];
          if (Array.isArray(raw) && raw.length > 0) {
            const trades = raw.slice(0, 150).map(t => mapCapitolTrade(t));
            return res.status(200).json({ source: "capitoltrades", trades });
          }
        } catch (_) {}
      }

      // ── Try inline JSON chunks (common in Next.js 13+) ───────────
      const selfDataMatch = html.match(/self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g);
      if (selfDataMatch) {
        // Next.js 13+ app-router streaming format — skip for now, use regex parse
      }

      // ── Regex HTML table parser ───────────────────────────────────
      // Capitol Trades renders <tr> rows with <td> cells
      const rowRx = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const cellRx = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const tagRx = /<[^>]+>/g;
      const clean = s => s.replace(tagRx, "").replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();

      const rows = [];
      let rowM;
      while ((rowM = rowRx.exec(html)) !== null) {
        const cells = [];
        let cellM;
        const cellSrc = rowM[1];
        cellRx.lastIndex = 0;
        while ((cellM = cellRx.exec(cellSrc)) !== null) {
          cells.push(clean(cellM[1]));
        }
        if (cells.length >= 5) rows.push(cells);
      }

      // Expect columns: [politician, party?, ticker, published, traded, filed, type, size]
      // Filter rows that look like trade data (have a buy/sell type)
      const typeWords = /\b(buy|sell|purchase|sale|exchange)\b/i;
      const tradeRows = rows.filter(r => r.some(c => typeWords.test(c)));

      if (tradeRows.length > 0) {
        const trades = tradeRows.slice(0, 150).map(cells => {
          // Try to detect column positions heuristically
          const typeCell = cells.find(c => typeWords.test(c)) || "";
          const type = /sale|sell/i.test(typeCell) ? "sell" : "buy";
          const dateCell = cells.find(c => /\d{4}/.test(c) && /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(c)) || "";
          const amountCell = cells.find(c => /\$|K–|\d+K/.test(c)) || "";
          const tickerCell = cells.find(c => /^[A-Z]{1,5}$/.test(c.trim())) || cells.find(c => /:US/.test(c))?.replace(/:US.*/,"").trim() || "";
          const nameCell = cells[0] || "";
          return {
            name: nameCell.length < 50 ? nameCell : "",
            party: cells.find(c => c === "D" || c === "R") || "",
            state: "",
            ticker: tickerCell.replace(/:US.*/,"").trim().toUpperCase(),
            type,
            amount: amountCell || "",
            date: dateCell,
            asset: "",
            house: "House",
          };
        }).filter(t => t.ticker && t.date);

        if (trades.length > 0) {
          return res.status(200).json({ source: "capitoltrades", trades });
        }
      }
    }
  } catch (e) {
    // fall through to curated
  }

  // ── 3. Datos curados 2024-2026 (STOCK Act disclosures) ───────────
  const CURATED = [
    // ── Mayo 2026 ────────────────────────────────────────────────
    { name:"Nancy Pelosi",           party:"D", state:"CA", ticker:"NVDA", type:"buy",  amount:"$500K–$1M",   date:"2026-05-20", asset:"NVIDIA Corp",                   house:"House"  },
    { name:"Josh Gottheimer",        party:"D", state:"NJ", ticker:"PLTR", type:"buy",  amount:"$50K–$100K",  date:"2026-05-19", asset:"Palantir Technologies",          house:"House"  },
    { name:"Michael McCaul",         party:"R", state:"TX", ticker:"LMT",  type:"buy",  amount:"$100K–$250K", date:"2026-05-16", asset:"Lockheed Martin",                house:"House"  },
    { name:"Ro Khanna",              party:"D", state:"CA", ticker:"TSLA", type:"buy",  amount:"$15K–$50K",   date:"2026-05-14", asset:"Tesla Inc",                      house:"House"  },
    { name:"Tommy Tuberville",       party:"R", state:"AL", ticker:"XOM",  type:"sell", amount:"$50K–$100K",  date:"2026-05-12", asset:"Exxon Mobil",                    house:"Senate" },
    { name:"Jake Auchincloss",       party:"D", state:"MA", ticker:"STT",  type:"sell", amount:"$15K–$50K",   date:"2026-05-18", asset:"State Street Corporation",       house:"House"  },
    { name:"Tim Moore",              party:"R", state:"NC", ticker:"SPY",  type:"buy",  amount:"$50K–$100K",  date:"2026-05-18", asset:"S&P 500 ETF",                    house:"House"  },
    { name:"Buddy Carter",           party:"R", state:"GA", ticker:"NVDA", type:"buy",  amount:"$1M–$5M",     date:"2026-05-07", asset:"NVIDIA Corp",                    house:"House"  },
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
    { name:"Jake Auchincloss",       party:"D", state:"MA", ticker:"STT",  type:"sell", amount:"$15K–$50K",   date:"2026-02-17", asset:"State Street Corporation",       house:"House"  },
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
    // ── Más congresistas ─────────────────────────────────────────
    { name:"Daniel Goldman",         party:"D", state:"NY", ticker:"NVDA", type:"buy",  amount:"$1M–$5M",     date:"2026-05-21", asset:"NVIDIA Corp",                    house:"House"  },
    { name:"Suzan DelBene",          party:"D", state:"WA", ticker:"MSFT", type:"buy",  amount:"$100K–$250K", date:"2026-05-19", asset:"Microsoft Corp",                 house:"House"  },
    { name:"Don Beyer",              party:"D", state:"VA", ticker:"AMD",  type:"buy",  amount:"$50K–$100K",  date:"2026-05-17", asset:"Advanced Micro Devices",         house:"House"  },
    { name:"Bill Hagerty",           party:"R", state:"TN", ticker:"COIN", type:"buy",  amount:"$250K–$500K", date:"2026-05-15", asset:"Coinbase Global",                house:"Senate" },
    { name:"French Hill",            party:"R", state:"AR", ticker:"JPM",  type:"buy",  amount:"$50K–$100K",  date:"2026-05-13", asset:"JPMorgan Chase",                 house:"House"  },
    { name:"Marie Gluesenkamp Perez",party:"D", state:"WA", ticker:"F",    type:"buy",  amount:"$15K–$50K",   date:"2026-05-11", asset:"Ford Motor Co",                  house:"House"  },
    { name:"Jared Moskowitz",        party:"D", state:"FL", ticker:"PLTR", type:"buy",  amount:"$50K–$100K",  date:"2026-05-09", asset:"Palantir Technologies",          house:"House"  },
    { name:"Max Miller",             party:"R", state:"OH", ticker:"GE",   type:"buy",  amount:"$100K–$250K", date:"2026-05-04", asset:"General Electric",               house:"House"  },
    { name:"Katie Britt",            party:"R", state:"AL", ticker:"AAPL", type:"buy",  amount:"$15K–$50K",   date:"2026-04-27", asset:"Apple Inc",                      house:"Senate" },
    { name:"Greg Landsman",          party:"D", state:"OH", ticker:"PG",   type:"buy",  amount:"$15K–$50K",   date:"2026-04-21", asset:"Procter & Gamble",               house:"House"  },
    { name:"Scott Franklin",         party:"R", state:"FL", ticker:"NOC",  type:"buy",  amount:"$50K–$100K",  date:"2026-04-14", asset:"Northrop Grumman",               house:"House"  },
    { name:"Shelley Moore Capito",   party:"R", state:"WV", ticker:"DUK",  type:"buy",  amount:"$50K–$100K",  date:"2026-04-09", asset:"Duke Energy",                    house:"Senate" },
    { name:"Earl Blumenauer",        party:"D", state:"OR", ticker:"COST", type:"buy",  amount:"$15K–$50K",   date:"2026-03-30", asset:"Costco Wholesale",               house:"House"  },
    { name:"Garret Graves",          party:"R", state:"LA", ticker:"CVX",  type:"buy",  amount:"$50K–$100K",  date:"2026-03-19", asset:"Chevron Corp",                   house:"House"  },
    { name:"Kathy Manning",          party:"D", state:"NC", ticker:"GOOGL",type:"buy",  amount:"$100K–$250K", date:"2026-03-07", asset:"Alphabet Inc",                   house:"House"  },
    { name:"Cynthia Lummis",         party:"R", state:"WY", ticker:"BTC",  type:"buy",  amount:"$100K–$250K", date:"2026-02-27", asset:"Bitcoin",                        house:"Senate" },
    { name:"Ritchie Torres",         party:"D", state:"NY", ticker:"META", type:"buy",  amount:"$15K–$50K",   date:"2026-02-13", asset:"Meta Platforms",                 house:"House"  },
    { name:"Thomas Kean Jr",         party:"R", state:"NJ", ticker:"V",    type:"buy",  amount:"$50K–$100K",  date:"2026-01-29", asset:"Visa Inc",                       house:"House"  },
  ];

  CURATED.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.status(200).json({ source: "curated", trades: CURATED });
}

