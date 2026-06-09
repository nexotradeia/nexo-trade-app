// NexoTrade — Economic Calendar proxy (Financial Modeling Prep)
// GET /api/econCalendar?months=3   →  eventos macro EEUU en tiempo real
// Requiere env var: FMP_API_KEY  (gratis en financialmodelingprep.com)

const FMP_KEY = process.env.FMP_API_KEY || process.env.FMP_KEY || "";

// Mapeo de nombres en inglés → español + categoría
function mapEvent(rawName) {
  const n = (rawName || "").toLowerCase();
  if (n.includes("nonfarm payroll") || n.includes("nfp"))
    return { es: "Nóminas No Agrícolas (NFP)", cat: "Empleo" };
  if (n.includes("unemployment rate"))
    return { es: "Tasa de Desempleo", cat: "Empleo" };
  if (n.includes("initial jobless") || n.includes("jobless claims"))
    return { es: "Solicitudes de Desempleo Semanal", cat: "Empleo" };
  if (n.includes("average hourly earnings"))
    return { es: "Salario Promedio por Hora", cat: "Empleo" };
  if (n.includes("fed interest rate") || n.includes("fomc") || n.includes("federal funds rate"))
    return { es: "FOMC — Decisión de Tasas", cat: "Banco Central" };
  if (n.includes("fed chair") || n.includes("powell"))
    return { es: "Discurso del Presidente de la Fed", cat: "Banco Central" };
  if (n.includes("core pce") || n.includes("pce price index"))
    return { es: "PCE Inflación (Core)", cat: "Inflación" };
  if (n.includes("pce"))
    return { es: "PCE Inflación", cat: "Inflación" };
  if (n.includes("core cpi") || n.includes("core consumer price"))
    return { es: "IPC Core / CPI (Core)", cat: "Inflación" };
  if (n.includes("cpi") || n.includes("consumer price index"))
    return { es: "IPC / CPI", cat: "Inflación" };
  if (n.includes("producer price") || n.includes("ppi"))
    return { es: "IPC Productor (PPI)", cat: "Inflación" };
  if (n.includes("gdp") || n.includes("gross domestic product"))
    return { es: "PIB EEUU (GDP)", cat: "Economía" };
  if (n.includes("retail sales"))
    return { es: "Ventas al Por Menor", cat: "Consumo" };
  if (n.includes("consumer confidence") || n.includes("consumer sentiment") || n.includes("michigan"))
    return { es: "Confianza del Consumidor", cat: "Consumo" };
  if (n.includes("personal spending") || n.includes("personal income"))
    return { es: "Gasto / Ingreso Personal", cat: "Consumo" };
  if (n.includes("ism manufactur") || n.includes("pmi manufactur") || n.includes("manufacturing pmi"))
    return { es: "ISM Manufactura (PMI)", cat: "Manufactura" };
  if (n.includes("ism services") || n.includes("services pmi") || n.includes("non-manufactur"))
    return { es: "ISM Servicios (PMI)", cat: "Manufactura" };
  if (n.includes("industrial production"))
    return { es: "Producción Industrial", cat: "Manufactura" };
  if (n.includes("durable goods"))
    return { es: "Pedidos de Bienes Duraderos", cat: "Manufactura" };
  if (n.includes("existing home") || n.includes("new home sales") || n.includes("pending home"))
    return { es: "Ventas de Viviendas", cat: "Economía" };
  if (n.includes("building permits") || n.includes("housing starts"))
    return { es: "Permisos de Construcción / Viviendas", cat: "Economía" };
  if (n.includes("trade balance"))
    return { es: "Balanza Comercial", cat: "Economía" };
  if (n.includes("current account"))
    return { es: "Cuenta Corriente", cat: "Economía" };
  return { es: rawName, cat: "Economía" };
}

function impactKey(impact) {
  const i = (impact || "").toLowerCase();
  if (i === "high")   return "high";
  if (i === "medium") return "med";
  return "low";
}

function countryFlag(cc) {
  const flags = { US:"🇺🇸", EU:"🇪🇺", GB:"🇬🇧", DE:"🇩🇪", JP:"🇯🇵", CN:"🇨🇳", CA:"🇨🇦", AU:"🇦🇺" };
  return flags[cc] || "🌐";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  // Cache 1 hora — datos macro no cambian frecuentemente
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!FMP_KEY) {
    return res.status(200).json({
      events: [],
      source: "no-key",
      message: "Agrega FMP_API_KEY en Vercel → Settings → Environment Variables (gratis en financialmodelingprep.com)"
    });
  }

  try {
    // Rango: 30 días atrás → 6 meses adelante
    const now   = new Date();
    const from  = new Date(now); from.setDate(from.getDate() - 30);
    const to    = new Date(now); to.setMonth(to.getMonth() + 6);
    const fmt   = d => d.toISOString().split("T")[0];

    const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${fmt(from)}&to=${fmt(to)}&apikey=${FMP_KEY}`;
    const r   = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`FMP HTTP ${r.status}`);
    const raw = await r.json();

    // Filtrar: solo EEUU + UE, solo High y Medium impact
    const KEEP_COUNTRIES = new Set(["US", "EU", "GB"]);
    const KEEP_IMPACT    = new Set(["High", "Medium"]);

    const events = raw
      .filter(e => KEEP_COUNTRIES.has(e.country) && KEEP_IMPACT.has(e.impact))
      .map(e => {
        const { es, cat } = mapEvent(e.event);
        return {
          date:    (e.date || "").split(" ")[0],   // "2026-05-29 08:30:00" → "2026-05-29"
          event:   es,
          cat,
          country: countryFlag(e.country),
          imp:     impactKey(e.impact),
          prev:    e.previous || "—",
          est:     e.estimate || "—",
          actual:  e.actual   || null,
          time:    (e.date || "").split(" ")[1]?.slice(0,5) || "",
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({ events, source: "fmp", total: events.length });
  } catch(e) {
    console.error("[econCalendar]", e.message);
    // Degradar con gracia (200) para no romper la UI; la página muestra estado vacío
    return res.status(200).json({ events: [], source: "error", error: e.message });
  }
}
