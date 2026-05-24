// NexoTrade GIF Proxy — busca GIFs via Tenor desde el servidor (sin CORS)
// GET /api/gifs?q=QUERY   →  busca por término
// GET /api/gifs            →  featured / trending

const TENOR_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCDg";
const GIPHY_KEY  = "dc6zaTOxFJmzC";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")    return res.status(405).json({ error: "Method not allowed" });

  const q   = (req.query.q || "").trim();
  const src = req.query.src || "tenor"; // "tenor" | "giphy"

  // ── Intentar Tenor ───────────────────────────────────────────────────────
  try {
    const tenorUrl = q
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif&contentfilter=medium&locale=es`
      : `https://tenor.googleapis.com/v2/search?q=trading+stocks+crypto&key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif&contentfilter=medium`;

    const r = await fetch(tenorUrl);
    const d = await r.json();

    if (d.results && d.results.length > 0) {
      const gifs = d.results.map(g => ({
        id:      g.id,
        title:   g.title || "gif",
        preview: g.media_formats?.tinygif?.url || g.media_formats?.gif?.url || "",
        full:    g.media_formats?.gif?.url     || g.media_formats?.tinygif?.url || "",
        src:     "tenor",
      })).filter(g => g.preview);

      return res.status(200).json({ gifs, source: "tenor" });
    }
  } catch(e) {
    // Tenor falló → intentar Giphy
  }

  // ── Fallback: Giphy ───────────────────────────────────────────────────────
  try {
    const giphyUrl = q
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=20&rating=g&lang=es`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=20&rating=g`;

    const r = await fetch(giphyUrl);
    const d = await r.json();

    if (Array.isArray(d.data) && d.data.length > 0) {
      const gifs = d.data.map(g => ({
        id:      g.id,
        title:   g.title || "gif",
        preview: g.images?.fixed_height_small?.url || g.images?.fixed_height?.url || "",
        full:    g.images?.fixed_height?.url       || g.images?.original?.url     || "",
        src:     "giphy",
      })).filter(g => g.preview);

      return res.status(200).json({ gifs, source: "giphy" });
    }
  } catch(e) {
    // Giphy también falló
  }

  // ── Fallback final: GIFs de trading hardcodeados ─────────────────────────
  const FALLBACK_GIFS = [
    { id:"f1", title:"To the moon 🚀",  preview:"https://media.giphy.com/media/3oEjHFOscgNwdYnpxm/giphy.gif", full:"https://media.giphy.com/media/3oEjHFOscgNwdYnpxm/giphy.gif", src:"fallback" },
    { id:"f2", title:"Bull market 📈",   preview:"https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", full:"https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", src:"fallback" },
    { id:"f3", title:"Money rain 💸",    preview:"https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",full:"https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",src:"fallback" },
    { id:"f4", title:"Bear market 📉",   preview:"https://media.giphy.com/media/l0MYB9P2lWRCyMJTW/giphy.gif", full:"https://media.giphy.com/media/l0MYB9P2lWRCyMJTW/giphy.gif", src:"fallback" },
    { id:"f5", title:"Diamond hands 💎", preview:"https://media.giphy.com/media/h7kbFBm0vAajWfDKqR/giphy.gif",full:"https://media.giphy.com/media/h7kbFBm0vAajWfDKqR/giphy.gif",src:"fallback" },
    { id:"f6", title:"Stonks 📊",        preview:"https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif",full:"https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif",src:"fallback" },
    { id:"f7", title:"Crypto moon 🌙",   preview:"https://media.giphy.com/media/WraEeHVZcIGRuNPgaE/giphy.gif",full:"https://media.giphy.com/media/WraEeHVZcIGRuNPgaE/giphy.gif",src:"fallback" },
    { id:"f8", title:"Celebrate 🎉",     preview:"https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif", full:"https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif", src:"fallback" },
    { id:"f9", title:"Rocket 🚀",        preview:"https://media.giphy.com/media/xT0xeuOy2Fcl9vDGiA/giphy.gif",full:"https://media.giphy.com/media/xT0xeuOy2Fcl9vDGiA/giphy.gif",src:"fallback" },
    { id:"f10",title:"Wait and see 👀",  preview:"https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif", full:"https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif", src:"fallback" },
    { id:"f11",title:"Panic sell 😱",    preview:"https://media.giphy.com/media/26ufcVAp3AiJJsrIs/giphy.gif",  full:"https://media.giphy.com/media/26ufcVAp3AiJJsrIs/giphy.gif",  src:"fallback" },
    { id:"f12",title:"HODL 💪",          preview:"https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", full:"https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", src:"fallback" },
  ];

  return res.status(200).json({ gifs: FALLBACK_GIFS, source: "fallback" });
}
