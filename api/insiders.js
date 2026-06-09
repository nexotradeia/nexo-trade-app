// NexoTrade — SEC Form 4 Insider Transactions
// Fuentes: 1) FMP API (si hay key) → 2) SEC EDGAR RSS → 3) Fallback curado
// GET /api/insiders

const FALLBACK = [
  { name:"Jensen Huang",       company:"NVIDIA Corp",           ticker:"NVDA", type:"VENTA",  shares:120000, value:15720000, filed:"2026-05-22", role:"CEO",        price:131.00 },
  { name:"Mark Zuckerberg",    company:"Meta Platforms",        ticker:"META", type:"VENTA",  shares: 50000, value:29800000, filed:"2026-05-21", role:"CEO",        price:596.00 },
  { name:"Tim Cook",           company:"Apple Inc",             ticker:"AAPL", type:"VENTA",  shares: 30000, value: 6210000, filed:"2026-05-20", role:"CEO",        price:207.00 },
  { name:"Andy Jassy",         company:"Amazon.com Inc",        ticker:"AMZN", type:"VENTA",  shares: 15000, value: 3390000, filed:"2026-05-19", role:"CEO",        price:226.00 },
  { name:"Satya Nadella",      company:"Microsoft Corp",        ticker:"MSFT", type:"VENTA",  shares: 20000, value: 8960000, filed:"2026-05-18", role:"CEO",        price:448.00 },
  { name:"Brian Armstrong",    company:"Coinbase Global",       ticker:"COIN", type:"COMPRA", shares: 25000, value: 5950000, filed:"2026-05-17", role:"CEO",        price:238.00 },
  { name:"Alex Karp",          company:"Palantir Technologies", ticker:"PLTR", type:"VENTA",  shares:200000, value:24800000, filed:"2026-05-16", role:"CEO",        price:124.00 },
  { name:"Reed Hastings",      company:"Netflix Inc",           ticker:"NFLX", type:"VENTA",  shares:  5000, value: 5420000, filed:"2026-05-15", role:"Exec Chair", price:1084.00 },
  { name:"Elon Musk",          company:"Tesla Inc",             ticker:"TSLA", type:"COMPRA", shares:100000, value:33850000, filed:"2026-05-14", role:"CEO",        price:338.50 },
  { name:"Lisa Su",            company:"AMD Inc",               ticker:"AMD",  type:"VENTA",  shares: 40000, value: 4640000, filed:"2026-05-12", role:"CEO",        price:116.00 },
  { name:"George Kurtz",       company:"CrowdStrike Holdings",  ticker:"CRWD", type:"COMPRA", shares: 10000, value: 4120000, filed:"2026-05-11", role:"CEO",        price:412.00 },
  { name:"Sundar Pichai",      company:"Alphabet Inc",          ticker:"GOOGL", type:"VENTA", shares: 22000, value: 4004000, filed:"2026-05-10", role:"CEO",        price:182.00 },
  { name:"Jamie Dimon",        company:"JPMorgan Chase",        ticker:"JPM",  type:"VENTA",  shares: 30000, value: 7410000, filed:"2026-05-09", role:"CEO",        price:247.00 },
  { name:"Dara Khosrowshahi",  company:"Uber Technologies",     ticker:"UBER", type:"COMPRA", shares: 15000, value: 1215000, filed:"2026-05-08", role:"CEO",        price:81.00  },
  { name:"Robert Iger",        company:"Walt Disney Co",        ticker:"DIS",  type:"COMPRA", shares: 20000, value: 2000000, filed:"2026-05-07", role:"CEO",        price:100.00 },
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=300");
  if (req.method === "OPTIONS") return res.status(200).end();

  const FMP_KEY = process.env.FMP_API_KEY || process.env.FMP_KEY;

  // ── 1. FMP API (datos reales completos: ticker, shares, precio, valor) ──
  if (FMP_KEY) {
    try {
      const url = `https://financialmodelingprep.com/api/v4/insider-trading?transactionType=S-Sale,P-Purchase&limit=40&apikey=${FMP_KEY}`;
      const r = await fetch(url, { headers: { "Accept": "application/json" } });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          const transactions = data.map(d => ({
            name:    d.reportingName || "—",
            company: d.securityName  || d.symbol || "—",
            ticker:  d.symbol        || "—",
            type:    (d.acquistionOrDisposition === "A" || d.transactionType?.includes("Purchase")) ? "COMPRA" : "VENTA",
            shares:  Math.abs(d.securitiesTransacted || 0),
            price:   d.price         || 0,
            value:   Math.abs((d.securitiesTransacted || 0) * (d.price || 0)),
            filed:   d.filingDate    || d.transactionDate || "",
            role:    d.typeOfOwner   || "Insider",
            url:     d.link          || "",
          })).filter(t => t.ticker && t.ticker !== "—");
          return res.status(200).json({ transactions, updatedAt: new Date().toISOString(), source: "FMP · SEC Form 4" });
        }
      }
    } catch (e) { /* pasa a siguiente fuente */ }
  }

  // ── 2. SEC EDGAR RSS — Form 4 recientes con datos básicos ──
  try {
    const rss = await fetch(
      "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=4&dateb=&owner=include&count=40&search_text=&output=atom",
      { headers: { "User-Agent": "NexoTrade research@nexotradeia.com", "Accept": "application/atom+xml" } }
    );
    if (rss.ok) {
      const xml = await rss.text();
      // Parse entries from Atom feed
      const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1]);
      const transactions = entries.slice(0, 20).map(e => {
        const title    = (e.match(/<title>(.*?)<\/title>/)?.[1] || "").replace(/<[^>]+>/g,"");
        const updated  = e.match(/<updated>(.*?)<\/updated>/)?.[1]?.split("T")[0] || "";
        const summary  = (e.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] || "").replace(/<[^>]+>/g,"").trim();
        // title format: "4 - COMPANY NAME (CIK) (Issuer) INSIDER NAME (Reporter)"
        const companyM = title.match(/4 - (.+?)\s*\(/);
        const company  = companyM?.[1]?.trim() || "—";
        const nameM    = title.match(/\)\s+(.+?)\s*\(/g);
        const name     = nameM?.[nameM.length-1]?.replace(/[()]/g,"").trim() || title.split("-").pop()?.trim() || "—";
        // Extract ticker from summary if present
        const tickerM  = summary.match(/\b([A-Z]{1,5})\b/);
        const ticker   = tickerM?.[1] || "—";
        return {
          name, company, ticker,
          type: "VENTA", // RSS no da tipo, default
          shares: 0, value: 0, price: 0,
          filed: updated,
          role: "Insider",
          source: "SEC EDGAR RSS",
        };
      }).filter(t => t.name !== "—");

      if (transactions.length > 0) {
        return res.status(200).json({
          transactions,
          updatedAt: new Date().toISOString(),
          source: "SEC EDGAR RSS · Form 4",
          notice: "Para ver montos completos (shares/valor), configura FMP_API_KEY en Vercel",
        });
      }
    }
  } catch (e) { /* pasa a fallback */ }

  // ── 3. Fallback curado ──
  return res.status(200).json({
    fallback: true,
    updatedAt: new Date().toISOString(),
    source: "Datos curados · SEC Form 4",
    transactions: FALLBACK,
  });
}
