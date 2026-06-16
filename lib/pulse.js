// NexoTrade — Market Pulse: rendimiento real por narrativa temática (server-side, cacheado)
// Lotes pequeños + reintento para no topar el burst de Finnhub y traer TODAS las narrativas.
const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
const THEMES = [
  { name: "IA",      emoji: "🤖", tks: ["NVDA","AVGO","AMD","PLTR","SMCI"] },
  { name: "Nuclear", emoji: "☢️", tks: ["SMR","OKLO","NNE","CEG","VST"] },
  { name: "Uranio",  emoji: "⛏️", tks: ["CCJ","UEC","UUUU","DNN"] },
  { name: "GLP-1",   emoji: "💉", tks: ["LLY","NVO","VKTX"] },
  { name: "Quantum", emoji: "⚛️", tks: ["IONQ","RGTI","QBTS","QUBT"] },
  { name: "Bitcoin", emoji: "₿", tks: ["MSTR","COIN","MARA","RIOT","HOOD"] },
];
async function fetchDp(sym) {
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FK}`, { signal: AbortSignal.timeout(5000) });
    if (r.ok) { const j = await r.json(); if (j && typeof j.dp === "number") return j.dp; }
  } catch (e) { /* skip */ }
  return null;
}
async function fillMap(syms, map) {
  const CH = 4;
  for (let k = 0; k < syms.length; k += CH) {
    const b = syms.slice(k, k + CH);
    const out = await Promise.all(b.map(fetchDp));
    b.forEach((sym, idx) => { if (out[idx] != null) map[sym] = out[idx]; });
    if (k + CH < syms.length) await new Promise((r) => setTimeout(r, 400));
  }
}
export default async function pulse(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=90, stale-while-revalidate=180");
  const uniq = Array.from(new Set(THEMES.reduce((a, t) => a.concat(t.tks), [])));
  const map = {};
  await fillMap(uniq, map);
  const missing = uniq.filter((s) => map[s] == null);
  if (missing.length) { await new Promise((r) => setTimeout(r, 500)); await fillMap(missing, map); }
  const themes = THEMES.map((t) => {
    const vals = t.tks.map((k) => map[k]).filter((v) => v != null);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    let top = null, topv = -1e9;
    t.tks.forEach((k) => { if (map[k] != null && map[k] > topv) { topv = map[k]; top = k; } });
    return { name: t.name, emoji: t.emoji, avg, top, topv, n: vals.length };
  }).filter((r) => r.avg != null).sort((a, b) => b.avg - a.avg);
  return res.status(200).json({ themes, count: Object.keys(map).length, ts: Date.now() });
}
