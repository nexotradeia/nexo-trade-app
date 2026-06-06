// NexoTrade Commodities API — performance data via Yahoo Finance (server-side, no CORS)
// GET /api/commodities  → returns all 14 commodities with price + period % changes

const SYMBOLS = [
  { id:"GC=F",  name:"Gold",          ticker:"XAU", color:"#d97706", cat:"Metals",      unit:"USD/oz"    },
  { id:"SI=F",  name:"Silver",        ticker:"XAG", color:"#94a3b8", cat:"Metals",      unit:"USD/oz"    },
  { id:"HG=F",  name:"Copper",        ticker:"HG",  color:"#ea580c", cat:"Metals",      unit:"USD/lb"    },
  { id:"PL=F",  name:"Platinum",      ticker:"XPT", color:"#8b5cf6", cat:"Metals",      unit:"USD/oz"    },
  { id:"CL=F",  name:"Crude Oil WTI", ticker:"WTI", color:"#1d4ed8", cat:"Energy",      unit:"USD/bbl"   },
  { id:"BZ=F",  name:"Brent Oil",     ticker:"BRT", color:"#475569", cat:"Energy",      unit:"USD/bbl"   },
  { id:"NG=F",  name:"Natural Gas",   ticker:"NG",  color:"#dc2626", cat:"Energy",      unit:"USD/MMBtu" },
  { id:"RB=F",  name:"Gasoline RBOB", ticker:"RB",  color:"#7c3aed", cat:"Energy",      unit:"USD/gal"   },
  { id:"ZW=F",  name:"Wheat",         ticker:"ZW",  color:"#b45309", cat:"Agriculture", unit:"USc/bu"    },
  { id:"ZC=F",  name:"Corn",          ticker:"ZC",  color:"#16a34a", cat:"Agriculture", unit:"USc/bu"    },
  { id:"ZS=F",  name:"Soybeans",      ticker:"ZS",  color:"#15803d", cat:"Agriculture", unit:"USc/bu"    },
  { id:"KC=F",  name:"Coffee",        ticker:"KC",  color:"#92400e", cat:"Agriculture", unit:"USc/lb"    },
  { id:"CC=F",  name:"Cocoa",         ticker:"CC",  color:"#7c2d12", cat:"Agriculture", unit:"USD/MT"    },
  { id:"SB=F",  name:"Sugar No.11",   ticker:"SB",  color:"#db2777", cat:"Agriculture", unit:"USc/lb"    },
];

async function fetchSymbol(sym) {
  const now   = Math.floor(Date.now() / 1000);
  const y3ago = now - 3 * 365 * 24 * 3600;
  const url   = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&period1=${y3ago}&period2=${now}&includePrePost=false`;

  const r = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!r.ok) throw new Error(`Yahoo ${r.status} for ${sym}`);
  return r.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60"); // cache 5 min
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")    return res.status(405).json({ error: "Method not allowed" });

  const pct = (a, b) => (a && b) ? +((b - a) / a * 100).toFixed(2) : null;

  const results = await Promise.allSettled(
    SYMBOLS.map(async (c) => {
      try {
        const data       = await fetchSymbol(c.id);
        const result     = data?.chart?.result?.[0];
        if (!result) return null;

        const closes     = result.indicators?.quote?.[0]?.close?.filter(v => v != null) || [];
        const timestamps = result.timestamp || [];
        if (closes.length < 2) return null;

        const last   = closes[closes.length - 1];
        const prev   = closes[closes.length - 2]  || last;
        const ago5   = closes[Math.max(0, closes.length - 6)]   || last;
        const ago21  = closes[Math.max(0, closes.length - 22)]  || last;
        const ago63  = closes[Math.max(0, closes.length - 64)]  || last;
        const ago252 = closes[Math.max(0, closes.length - 253)] || last;

        // YTD: first close of current year
        const thisYear = new Date().getFullYear();
        let ytdBase = last;
        for (let i = 0; i < timestamps.length; i++) {
          if (new Date(timestamps[i] * 1000).getFullYear() === thisYear) {
            ytdBase = closes[i] || last;
            break;
          }
        }

        return {
          ...c,
          price:  +last.toFixed(last >= 100 ? 2 : 4),
          daily:  pct(prev,   last),
          week:   pct(ago5,   last),
          month:  pct(ago21,  last),
          month3: pct(ago63,  last),
          ytd:    pct(ytdBase,last),
          year1:  pct(ago252, last),
          spark:  closes.slice(-30).map(v => +v.toFixed(4)),
        };
      } catch {
        return null;
      }
    })
  );

  const commodities = results
    .map(r => r.status === "fulfilled" ? r.value : null)
    .filter(Boolean);

  return res.status(200).json({
    commodities,
    updatedAt: new Date().toISOString(),
    count: commodities.length,
  });
}
