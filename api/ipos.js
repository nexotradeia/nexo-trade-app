// NexoTrade — IPO Calendar proxy (Financial Modeling Prep)
// GET /api/ipos   →  IPOs del año en tiempo real
// Requiere env var: FMP_API_KEY  (gratis en financialmodelingprep.com)

const FMP_KEY = process.env.FMP_API_KEY || "";

// Sectores conocidos por símbolo (enriquece respuesta FMP que no siempre tiene sector)
const SECTOR_HINTS = {
  KLAR:"Fintech", CBRS:"Semiconductores", CHYM:"Neobank", SHEI:"Moda/Retail",
  DCRD:"Social",  TURO:"Marketplace",     MDLN:"Salud",   PNRA:"Restaurantes",
  ETOR:"Fintech", CRWV:"Cloud/IA",        VG:"Energía",
};

function fmtRaise(totalValue) {
  if (!totalValue) return "—";
  if (totalValue >= 1e9) return `$${(totalValue / 1e9).toFixed(1)}B`;
  if (totalValue >= 1e6) return `$${(totalValue / 1e6).toFixed(0)}M`;
  return `$${totalValue.toLocaleString()}`;
}

function mapStatus(fmpStatus) {
  const s = (fmpStatus || "").toLowerCase();
  if (s === "priced")   return "priced";
  if (s === "trading" || s === "listed") return "trading";
  return "upcoming";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  // Cache 6 horas — IPOs no cambian tan frecuentemente
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=43200");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!FMP_KEY) {
    return res.status(200).json({
      ipos: [],
      source: "no-key",
      message: "Agrega FMP_API_KEY en Vercel → Settings → Environment Variables"
    });
  }

  try {
    const year  = new Date().getFullYear();
    const from  = `${year}-01-01`;
    const to    = `${year}-12-31`;
    const url   = `https://financialmodelingprep.com/api/v3/ipo_calendar?from=${from}&to=${to}&apikey=${FMP_KEY}`;
    const r     = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`FMP HTTP ${r.status}`);
    const raw   = await r.json();

    const ipos = raw.map(ipo => ({
      company:  ipo.company || "—",
      ticker:   ipo.symbol  || "—",
      exchange: ipo.exchange || "—",
      date:     ipo.date    || "—",
      range:    ipo.offerPrice ? `$${parseFloat(ipo.offerPrice).toFixed(2)}` : "Por definir",
      raise:    fmtRaise(ipo.totalSharesValue),
      shares:   ipo.shares  ? `${(ipo.shares / 1e6).toFixed(1)}M acciones` : "—",
      sector:   SECTOR_HINTS[ipo.symbol] || "Mercado",
      status:   mapStatus(ipo.status),
      url:      ipo.url || null,
      desc:     "",   // FMP no provee descripción — se puede enriquecer manualmente
    }));

    // Ordenar: upcoming primero, luego por fecha desc
    ipos.sort((a, b) => {
      if (a.status === "upcoming" && b.status !== "upcoming") return -1;
      if (a.status !== "upcoming" && b.status === "upcoming") return  1;
      return b.date.localeCompare(a.date);
    });

    return res.status(200).json({ ipos, source: "fmp", total: ipos.length });
  } catch(e) {
    console.error("[ipos]", e.message);
    return res.status(500).json({ ipos: [], source: "error", error: e.message });
  }
}
