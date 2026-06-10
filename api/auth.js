// NexoTrade — Auth + Track-Ref Proxy
// POST /api/auth                   { email, password }  → login
// POST /api/auth?type=track-ref    { ref_code, ... }    → influencer referral

const SUPABASE_URL = "https://glvrzrtatekuuhwtzzhd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "sb_publishable_1CCvWAO3iqcFZmcqvUdlZg_rOdSZZcl";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── Track-Ref (influencer referral tracker) ──────────────────────────────
  if (req.query?.type === "track-ref") {
    const { ref_code, user_email, user_id, source } = req.body || {};
    if (!ref_code) return res.status(400).json({ error: "ref_code required" });
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/influencer_referrals`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          ref_code: ref_code.toLowerCase().trim(),
          user_email: user_email || null,
          user_id: user_id || null,
          source: source || "landing",
        }),
      });
      if (!r.ok) { const err = await r.text(); return res.status(500).json({ error: err }); }
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email y contrase\u00f1a requeridos" });

  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({
        error: json.msg || json.error_description || json.error || "Credenciales incorrectas",
      });
    }
    return res.status(200).json({
      access_token: json.access_token,
      refresh_token: json.refresh_token,
      user: json.user,
    });
  } catch (e) {
    return res.status(500).json({ error: "Error de conexi\u00f3n con el servidor" });
  }
}
