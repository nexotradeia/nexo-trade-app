// NexoTrade — Newsletter subscribers list (server-side only)
// GET /api/subscribers?secret=NEXO_PICKS_2026
// Returns JSON array of active subscriber emails

const SUPABASE_URL = "https://glvrzrtatekuuhwtzzhd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "sb_publishable_1CCvWAO3iqcFZmcqvUdlZg_rOdSZZcl";
const API_SECRET   = process.env.SUBSCRIBERS_SECRET   || "NEXO_PICKS_2026";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const secret = req.query?.secret || req.headers?.["x-secret"];
  if (secret !== API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/newsletter_subscribers?select=email&order=created_at.asc`,
      {
        headers: {
          apikey:        SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!r.ok) {
      const err = await r.text();
      console.error("[subscribers] Supabase error:", err);
      return res.status(500).json({ error: "Supabase query failed", detail: err });
    }

    const rows  = await r.json();
    const emails = rows.map(row => row.email).filter(Boolean);

    console.log(`[subscribers] ${emails.length} subscribers returned`);
    return res.status(200).json({ emails, count: emails.length });

  } catch (e) {
    console.error("[subscribers] fetch error:", e.message);
    return res.status(500).json({ error: "Network error", detail: e.message });
  }
}
