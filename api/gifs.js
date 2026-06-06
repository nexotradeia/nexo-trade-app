// NexoTrade GIF Proxy — busca GIFs via Tenor desde el servidor (sin CORS)
// GET /api/gifs?q=QUERY   →  busca por término
// GET /api/gifs            →  featured (trading por defecto)

const TENOR_KEY = process.env.TENOR_API_KEY || "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCDg";

// GIFs de trading hardcodeados — siempre disponibles como último recurso
const FALLBACK_GIFS = [
  { id:"f1",  title:"To the moon 🚀",    preview:"https://media.tenor.com/x8v1oNUOmg4AAAAM/stock-market-stocks.gif",      full:"https://media.tenor.com/x8v1oNUOmg4AAAC/stock-market-stocks.gif",      src:"fallback" },
  { id:"f2",  title:"Bull market 📈",    preview:"https://media.tenor.com/KRCceVCMu_kAAAAM/stocks-go-up-stocks.gif",       full:"https://media.tenor.com/KRCceVCMu_kAAAC/stocks-go-up-stocks.gif",       src:"fallback" },
  { id:"f3",  title:"Money rain 💸",     preview:"https://media.tenor.com/Nd4fCVHqMwQAAAAM/money-rain.gif",               full:"https://media.tenor.com/Nd4fCVHqMwQAAAC/money-rain.gif",               src:"fallback" },
  { id:"f4",  title:"Bear market 📉",    preview:"https://media.tenor.com/v-HJSoYkrxoAAAAM/bear-market-stocks.gif",       full:"https://media.tenor.com/v-HJSoYkrxoAAAC/bear-market-stocks.gif",       src:"fallback" },
  { id:"f5",  title:"Diamond hands 💎",  preview:"https://media.tenor.com/OVH0MnNHNiMAAAAM/diamond-hands-hold.gif",       full:"https://media.tenor.com/OVH0MnNHNiMAAAC/diamond-hands-hold.gif",       src:"fallback" },
  { id:"f6",  title:"Stonks 📊",         preview:"https://media.tenor.com/cB_5sRnlC0YAAAAM/stonks-stock.gif",             full:"https://media.tenor.com/cB_5sRnlC0YAAAC/stonks-stock.gif",             src:"fallback" },
  { id:"f7",  title:"Crypto moon 🌙",    preview:"https://media.tenor.com/pYzGr5vqfiwAAAAM/bitcoin-crypto.gif",           full:"https://media.tenor.com/pYzGr5vqfiwAAAC/bitcoin-crypto.gif",           src:"fallback" },
  { id:"f8",  title:"Celebrate 🎉",      preview:"https://media.tenor.com/GfSX-u7VGM4AAAAM/celebrate-excited.gif",        full:"https://media.tenor.com/GfSX-u7VGM4AAAC/celebrate-excited.gif",        src:"fallback" },
  { id:"f9",  title:"Rocket 🚀",         preview:"https://media.tenor.com/LqLHRMsn5JIAAAAM/rocket-launch.gif",            full:"https://media.tenor.com/LqLHRMsn5JIAAAC/rocket-launch.gif",            src:"fallback" },
  { id:"f10", title:"Wait and see 👀",   preview:"https://media.tenor.com/3HHuXdRBHHMAAAAM/watching-waiting.gif",         full:"https://media.tenor.com/3HHuXdRBHHMAAAC/watching-waiting.gif",         src:"fallback" },
  { id:"f11", title:"Panic sell 😱",     preview:"https://media.tenor.com/y2JXkY1pXkwAAAAM/panic-sell-stocks.gif",        full:"https://media.tenor.com/y2JXkY1pXkwAAAC/panic-sell-stocks.gif",        src:"fallback" },
  { id:"f12", title:"HODL 💪",           preview:"https://media.tenor.com/LTMRDXdQRksAAAAM/hodl-bitcoin.gif",             full:"https://media.tenor.com/LTMRDXdQRksAAAC/hodl-bitcoin.gif",             src:"fallback" },
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")    return res.status(405).json({ error: "Method not allowed" });

  const q = (req.query.q || "").trim();

  // ── Tenor v2 ─────────────────────────────────────────────────────────────────
  try {
    const tenorUrl = q
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=30&media_filter=tinygif,gif&contentfilter=high&random=false&locale=es`
      : `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent("money cash rich")}&key=${TENOR_KEY}&limit=30&media_filter=tinygif,gif&contentfilter=high&random=false`;

    const r = await fetch(tenorUrl, { signal: AbortSignal.timeout(5000) });

    if (!r.ok) throw new Error(`Tenor HTTP ${r.status}`);

    const d = await r.json();

    if (d.results && d.results.length > 0) {
      const gifs = d.results
        .map(g => ({
          id:      g.id,
          title:   g.title || "gif",
          preview: g.media_formats?.tinygif?.url || g.media_formats?.gif?.url || "",
          full:    g.media_formats?.gif?.url || g.media_formats?.tinygif?.url || "",
          src:     "tenor",
        }))
        .filter(g => g.preview && g.full);

      if (gifs.length > 0) {
        return res.status(200).json({ gifs, source: "tenor" });
      }
    }
  } catch(e) {
    console.error("[gifs] Tenor error:", e.message);
  }

  // ── Fallback: GIFs hardcodeados de trading ───────────────────────────────────
  return res.status(200).json({ gifs: FALLBACK_GIFS, source: "fallback" });
}
