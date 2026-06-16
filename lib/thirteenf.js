// NexoTrade — 13F de fondos notables (SEC EDGAR). Server-side, cacheado fuerte (13F = trimestral).
const FUNDS = [
  { name: "Berkshire · Buffett", cik: "0001067983" },
  { name: "Scion · M. Burry",    cik: "0001649339" },
  { name: "ARK Invest",          cik: "0001697748" },
];
const UA = { "User-Agent": "NexoTrade research@nexotradeia.com", "Accept": "application/json" };

async function latest13F(cik) {
  const r = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, { headers: UA, signal: AbortSignal.timeout(7000) });
  if (!r.ok) return null;
  const j = await r.json();
  const rec = j.filings && j.filings.recent;
  if (!rec || !rec.form) return null;
  for (let i = 0; i < rec.form.length; i++) {
    if (rec.form[i] === "13F-HR") return { accession: rec.accessionNumber[i], date: rec.filingDate[i] };
  }
  return null;
}
async function holdingsOf(cik, accession) {
  const noDash = accession.replace(/-/g, "");
  const base = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${noDash}`;
  const ir = await fetch(`${base}/index.json`, { headers: UA, signal: AbortSignal.timeout(7000) });
  if (!ir.ok) return null;
  const idx = await ir.json();
  const items = (idx.directory && idx.directory.item) || [];
  const xmls = items.map((it) => it.name).filter((n) => /\.xml$/i.test(n) && !/primary_doc/i.test(n));
  for (const fn of xmls) {
    try {
      const xr = await fetch(`${base}/${fn}`, { headers: { ...UA, Accept: "application/xml" }, signal: AbortSignal.timeout(7000) });
      if (!xr.ok) continue;
      const xml = await xr.text();
      if (!/infoTable/i.test(xml)) continue;
      const blocks = xml.split(/<(?:\w+:)?infoTable>/i).slice(1);
      const agg = {};
      blocks.forEach((b) => {
        const nm = (b.match(/<(?:\w+:)?nameOfIssuer>([^<]+)</i) || [])[1];
        const vl = (b.match(/<(?:\w+:)?value>([^<]+)</i) || [])[1];
        if (nm && vl) { const v = Number(String(vl).replace(/[^0-9.]/g, "")) || 0; const k = nm.trim(); agg[k] = (agg[k] || 0) + v; }
      });
      const holdings = Object.keys(agg).map((name) => ({ name, value: agg[name] })).sort((a, b) => b.value - a.value).slice(0, 6);
      if (holdings.length) return holdings;
    } catch (e) { /* try next xml */ }
  }
  return null;
}
export default async function thirteenf(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
  const funds = [];
  await Promise.all(FUNDS.map(async (f) => {
    try {
      const lt = await latest13F(f.cik);
      if (!lt) return;
      const h = await holdingsOf(f.cik, lt.accession);
      if (h && h.length) funds.push({ name: f.name, date: lt.date, holdings: h });
    } catch (e) { /* skip fund */ }
  }));
  return res.status(200).json({ funds, ts: Date.now() });
}
