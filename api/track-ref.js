// NexoTrade — Influencer Referral Tracker
// POST /api/track-ref  { ref_code, user_email?, user_id?, source? }

const SUPABASE_URL = "https://glvrzrtatekuuhwtzzhd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "sb_publishable_1CCvWAO3iqcFZmcqvUdlZg_rOdSZZcl";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

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

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
