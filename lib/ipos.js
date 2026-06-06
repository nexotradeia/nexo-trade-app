// NexoTrade — IPO Calendar proxy
// GET /api/ipos  →  IPOs del año en tiempo real
// Fuente 1: Financial Modeling Prep (si hay FMP_API_KEY)
// Fuente 2 (fallback Sesión 11): Finnhub IPO calendar — key gratuita ya activa

const FMP_KEY = process.env.FMP_API_KEY || "";
const FH_KEY  = process.env.FINNHUB_API_KEY || "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";

// Enriquecimiento manual: descripción y sector para tickers conocidos
const ENRICH = {
  SPCX:{ sector:"Aerospace",      desc:"SpaceX — la empresa aeroespacial de Elon Musk. Starlink + lanzamientos. El IPO más esperado de la década." },
  CRWV:{ sector:"Cloud/AI",       desc:"GPU cloud provider for AI workloads, OpenAI's primary infrastructure partner." },
  VG:  { sector:"Energy",         desc:"Major U.S. LNG exporter. One of the biggest IPOs of the year by capital raised." },
  ETOR:{ sector:"Fintech",        desc:"Social trading platform with 35M registered users worldwide." },
  KLAR:{ sector:"Fintech",        desc:"Europe's leading BNPL platform with 85M users across 45 countries." },
  CHYM:{ sector:"Neobank",        desc:"U.S. neobank with 22M active accounts. No overdraft fees model." },
  SHEI:{ sector:"Retail",         desc:"Ultra-fast fashion e-commerce giant. Est. valuation $65B." },
  DCRD:{ sector:"Social",         desc:"Community platform with 150M monthly users." },
  TURO:{ sector:"Marketplace",    desc:"Peer-to-peer car sharing marketplace — the Airbnb for cars." },
  MDLN:{ sector:"Healthcare",     desc:"Largest private U.S. medical supplies manufacturer." },
  PNRA:{ sector:"Food",           desc:"Bakery-café chain with 2,100+ locations in the U.S." },
  CBRS:{ sector:"Semiconductors", desc:"AI chip designer building wafer-scale processors. Direct NVIDIA competitor." },
  DBRK:{ sector:"Cloud/AI",       desc:"Data and AI platform valued at $62B in last private round." },
};

function fmtRaise(totalSharesValue) {
  if (!totalSharesValue) return "—";
  if (totalSharesValue >= 1e9) return `$${(totalSharesValue / 1e9).toFixed(1)}B`;
  if (totalSharesValue >= 1e6) return `$${(totalSharesValue / 1e6).toFixed(0)}M`;
  return `$${totalSharesValue.toLocaleString()}`;
}

function mapStatus(rawStatus, dateStr) {
  const s = (rawStatus || "").toLowerCase();
  if (s === "priced")                    return "priced";
  if (s === "trading" || s === "listed") return "trading";
  const today = new Date().toISOString().split("T")[0];
  if (dateStr && dateStr <= today) return "trading";
  return "upcoming";
}

function mapAndRespond(res, raw, source) {
  const ipos = raw.map(ipo => {
    const enriched = ENRICH[ipo.symbol] || {};
    return {
      company:  ipo.company  || "—",
      ticker:   ipo.symbol   || "—",
      exchange: ipo.exchange || "—",
      date:     ipo.date     || "—",
      range:    ipo.offerPrice ? `$${parseFloat(ipo.offerPrice).toFixed(2)}` : "Por definir",
      raise:    fmtRaise(ipo.totalSharesValue),
      shares:   ipo.shares ? `${(ipo.shares / 1e6).toFixed(1)}M acciones` : "—",
      sector:   enriched.sector || "Mercado",
      status:   mapStatus(ipo.status, ipo.date),
      desc:     enriched.desc || "",
      url:      ipo.url || null,
    };
  });
  ipos.sort((a, b) => {
    const order = { upcoming: 0, priced: 1, trading: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return (a.date || "9999").localeCompare(b.date || "9999");
  });
  // Cache solo en éxito — los errores NO se cachean (fix Sesión 11)
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=43200");
  return res.status(200).json({ ipos, source, total: ipos.length });
}

async function fetchFMP(year) {
  const url = `https://financialmodelingprep.com/api/v3/ipo_calendar?from=${year}-01-01&to=${year}-12-31&apikey=${FMP_KEY}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`FMP HTTP ${r.status}`);
  const raw = await r.json();
  if (!Array.isArray(raw) || raw.length === 0) throw new Error("FMP empty");
  return raw;
}

async function fetchFinnhub(year, attempt = 1) {
  const url = `https://finnhub.io/api/v1/calendar/ipo?from=${year}-01-01&to=${year}-12-31&token=${FH_KEY}`;
  let r;
  try {
    r = await fetch(url, { signal: AbortSignal.timeout(4500) });
  } catch (e) {
    if (attempt < 2) return fetchFinnhub(year, attempt + 1); // 1 reintento (cold start)
    throw e;
  }
  if (!r.ok) throw new Error(`Finnhub HTTP ${r.status}`);
  const j = await r.json();
  const list = (j.ipoCalendar || [])
    .filter(i => i.symbol && (i.status || "").toLowerCase() !== "withdrawn")
    .map(i => ({
      company: i.name || i.symbol,
      symbol:  i.symbol,
      exchange:i.exchange || "—",
      date:    i.date,
      offerPrice: i.price || null,
      totalSharesValue: i.totalSharesValue || null,
      shares:  i.numberOfShares || null,
      status:  i.status || null,
      url:     null,
    }));
  if (list.length === 0) throw new Error("Finnhub empty");
  return list;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const year = new Date().getFullYear();
  let fmpErr = "sin FMP_API_KEY";

  if (FMP_KEY) {
    try {
      const raw = await fetchFMP(year);
      return mapAndRespond(res, raw, "fmp");
    } catch (e) { fmpErr = e.message; }
  }

  try {
    const raw = await fetchFinnhub(year);
    return mapAndRespond(res, raw, "finnhub");
  } catch (e2) {
    console.error("[ipos] fmp:", fmpErr, "| finnhub:", e2.message);
    res.setHeader("Cache-Control", "no-store"); // nunca cachear errores
    return res.status(200).json({ ipos: [], source: "error", error: `${fmpErr} / ${e2.message}` });
  }
}
