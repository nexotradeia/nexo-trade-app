// NexoTrade — Market Pulse: rendimiento real por narrativa (server-side).
// Robusto: pocos tickers/tema + reintentos + NO cachea resultados pobres (solo cuando trae casi todas las narrativas).
const FK = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
const THEMES = [
  { name: "IA",      emoji: "🤖", tks: ["NVDA","AMD","PLTR"] },
  { name: "Nuclear", emoji: "☢️", tks: ["SMR","OKLO","VST"] },
  { name: "Uranio",  emoji: "⛏️", tks: ["CCJ","UEC","UUUU"] },
  { name: "GLP-1",   emoji: "💉", tks: ["LLY","NVO","VKTX"] },
  { name: "Quantum", emoji: "⚛️", tks: ["IONQ","RGTI","QBTS"] },
  { name: "Bitcoin", emoji: "₿", tks: ["MSTR","COIN","MARA"] },
];
async function fetchDp(sym) {
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FK}`, { signal: AbortSignal.timeout(5000) });
    if (r.ok) { const j = await r.json(); if (j && typeof j.dp === "number") return j.dp; }
  } catch (e) {}
  return null;
}
async function fillMap(syms, map) {
  const CH = 4;
  for (let k = 0; k < syms.length; k += CH) {
    const b = syms.slice(k, k + CH);
    const out = await Promise.all(b.map(fetchDp));
    b.forEach((sym, idx) => { if (out[idx] != null) map[sym] = out[idx]; });
    if (k + CH < syms.length) await new Promise((r) => setTimeout(r, 350));
  }
}
export default async function pulse(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const uniq = Array.from(new Set(THEMES.reduce((a, t) => a.concat(t.tks), [])));
  const map = {};
  await fillMap(uniq, map);
  for (let pass = 0; pass < 2; pass++) {
    const missing = uniq.filter((s) => map[s] == null);
    if (!missing.length) break;
    await new Promise((r) => setTimeout(r, 450));
    await fillMap(missing, map);
  }
  const themes = THEMES.map((t) => {
    const vals = t.tks.map((k) => map[k]).filter((v) => v != null);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    let top = null, topv = -1e9;
    t.tks.forEach((k) => { if (map[k] != null && map[k] > topv) { topv = map[k]; top = k; } });
    return { name: t.name, emoji: t.emoji, avg, top, topv, n: vals.length };
  }).filter((r) => r.avg != null).sort((a, b) => b.avg - a.avg);
  // Solo cachear resultados BUENOS (>=5 narrativas); pobres → reintentar pronto
  if (themes.length >= 5) res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
  else res.setHeader("Cache-Control", "s-maxage=8, stale-while-revalidate=30");
  return res.status(200).json({ themes, count: Object.keys(map).length, ts: Date.now() });
}
