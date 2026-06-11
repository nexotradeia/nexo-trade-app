// NexoTrade — Auth Proxy
// POST /api/auth  { email, password }
// Proxies Supabase auth from the server (avoids mobile network issues)

const SUPABASE_URL = "https://glvrzrtatekuuhwtzzhd.supabase.co";
const SUPABASE_KEY = "sb_publishable_1CCvWAO3iqcFZmcqvUdlZg_rOdSZZcl";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email y contraseña requeridos" });

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
      return res.status(r.status).json({ error: json.msg || json.error_description || json.error || "Credenciales incorrectas" });
    }

    // Return user + tokens
    return res.status(200).json({
      access_token: json.access_token,
      refresh_token: json.refresh_token,
      user: json.user,
    });
  } catch (e) {
    return res.status(500).json({ error: "Error de conexión con el servidor" });
  }
}
