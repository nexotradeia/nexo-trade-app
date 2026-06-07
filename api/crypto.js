// NexoTrade Crypto Screener — datos en vivo de CoinGecko + Fear & Greed
// GET /api/crypto  →  { coins:[...], global:{...}, source }
// Sin API key (CoinGecko free tier). Cacheado en el edge para no agotar el rate limit.

// Patrón derivado del momentum real (24h / 7d)
function derivePattern(chg24, chg7) {
  if (chg24 >= 6 && chg7 >= 12) return "Breakout";
  if (chg24 >= 3)               return "Momentum";
  if (chg7  >= 6 && chg24 >= 0) return "Trend Up";
  if (chg24 <= -6)              return "Reversal";
  if (chg24 <= -2)              return "Volatility";
  if (Math.abs(chg24) < 1.5)   return "Consolidation";
  return "Base";
}

// Score IA 0-100 a partir de momentum + volumen/mcap (liquidez relativa)
function deriveScore(chg24, chg7, vol, mcap) {
  let s = 50;
  s += Math.max(-18, Math.min(18, chg24 * 1.6));   // momentum 24h
  s += Math.max(-10, Math.min(12, chg7 * 0.5));    // tendencia 7d
  const liq = mcap > 0 ? vol / mcap : 0;           // rotación de volumen
  s += Math.max(0, Math.min(14, liq * 90));
  return Math.max(1, Math.min(99, Math.round(s)));
}

const fmtUsd = (n) => {
  if (n == null) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return "$" + (n / 1e9).toFixed(1)  + "B";
  if (n >= 1e6)  return "$" + (n / 1e6).toFixed(1)  + "M";
  return "$" + Math.round(n).toLocaleString();
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=180");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")    return res.status(405).json({ error: "Method not allowed" });

  try {
    const mktUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&price_change_percentage=24h,7d&sparkline=true";
    const [mktR, globR, fngR] = await Promise.allSettled([
      fetch(mktUrl, { signal: AbortSignal.timeout(8000), headers: { accept: "application/json" } }),
      fetch("https://api.coingecko.com/api/v3/global", { signal: AbortSignal.timeout(8000), headers: { accept: "application/json" } }),
      fetch("https://api.alternative.me/fng/?limit=1", { signal: AbortSignal.timeout(8000) }),
    ]);

    if (mktR.status !== "fulfilled" || !mktR.value.ok) throw new Error("CoinGecko markets unavailable");
    const markets = await mktR.value.json();

    const coins = markets.map((c) => {
      const chg24 = c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0;
      const chg7  = c.price_change_percentage_7d_in_currency ?? 0;
      const vol   = c.total_volume ?? 0;
      const mcap  = c.market_cap ?? 0;
      const spark = (c.sparkline_in_7d?.price || []).filter((_, i) => i % 12 === 0).slice(-12);
      return {
        s: (c.symbol || "").toUpperCase(),
        n: c.name,
        img: c.image,
        p: c.current_price,
        chg: +chg24.toFixed(2),
        chg7: +chg7.toFixed(2),
        mkt: fmtUsd(mcap),
        mcapRaw: mcap,
        vol: fmtUsd(vol),
        rank: c.market_cap_rank,
        pattern: derivePattern(chg24, chg7),
        score: deriveScore(chg24, chg7, vol, mcap),
        spark: spark.length >= 2 ? spark : (c.sparkline_in_7d?.price || []).slice(-8),
      };
    });

    // Global
    let global = { btcDom: null, totalMcap: "—", totalVol: "—", mcapChg: null };
    if (globR.status === "fulfilled" && globR.value.ok) {
      const g = (await globR.value.json()).data || {};
      global.btcDom    = g.market_cap_percentage?.btc != null ? +g.market_cap_percentage.btc.toFixed(1) : null;
      global.ethDom    = g.market_cap_percentage?.eth != null ? +g.market_cap_percentage.eth.toFixed(1) : null;
      global.totalMcap = fmtUsd(g.total_market_cap?.usd);
      global.totalVol  = fmtUsd(g.total_volume?.usd);
      global.mcapChg   = g.market_cap_change_percentage_24h_usd != null ? +g.market_cap_change_percentage_24h_usd.toFixed(2) : null;
    }

    // Fear & Greed
    if (fngR.status === "fulfilled" && fngR.value.ok) {
      const f = (await fngR.value.json()).data?.[0];
      if (f) { global.fng = parseInt(f.value); global.fngLabel = f.value_classification; }
    }

    return res.status(200).json({ coins, global, source: "coingecko", ts: Date.now() });
  } catch (e) {
    console.error("[crypto] error:", e.message);
    return res.status(200).json({ coins: [], global: {}, source: "error", error: e.message });
  }
}
