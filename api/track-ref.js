// NexoTrade — Influencer Referral Tracker
// POST /api/track-ref  { ref_code, user_email?, user_id?, source? }
// Llama a la función SECURITY DEFINER record_referral() que busca el afiliado
// por su referral_code, inserta la fila en `referrals` (la que lee el dashboard)
// y suma el contador del afiliado. Si el código no es de un afiliado (p.ej. un
// referido amigo por UUID), no hace nada y responde { matched:false }.

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
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/record_referral`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_ref_code: String(ref_code).trim(),
        p_email: user_email || null,
        p_user_id: user_id || null,
        p_source: source || "signup",
      }),
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[track-ref] supabase error:", text);
      return res.status(500).json({ error: text });
    }
    // record_referral devuelve el uuid del afiliado, o null si el código no existe
    const affiliateId = text ? JSON.parse(text) : null;
    return res.status(200).json({ ok: true, matched: !!affiliateId, affiliate_id: affiliateId });
  } catch (e) {
    console.error("[track-ref] exception:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
