// NEXO TRADE — Edge Function: send-welcome
// Envía email de bienvenida vía Resend cuando un usuario se registra.
//
// ACTIVAR: supabase secrets set RESEND_API_KEY=re_xxxx
// DEPLOY:  supabase functions deploy send-welcome

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL     = "NexoTrade <hola@nexotradeia.com>";
const BASE_URL       = "https://nexotradeia.com";
const STRIPE_VIP     = "https://buy.stripe.com/6oU00c6U24PDe4U3S5aR202";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // ── Validar API key configurada ──────────────────────────
    if (!RESEND_API_KEY || RESEND_API_KEY === "") {
      console.error("RESEND_API_KEY no configurada. Corre: supabase secrets set RESEND_API_KEY=re_xxxx");
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const { email, name, referral_code } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "email required" }), {
      status: 400, headers: { "Content-Type": "application/json", ...CORS },
    });

    const userName     = name || email.split("@")[0];
    const referralLink = referral_code
      ? `${BASE_URL}?ref=${referral_code}`
      : BASE_URL;

    const html = buildWelcomeEmail(userName, referralLink);

    // ── Enviar vía Resend ────────────────────────────────────
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [email],
        subject: `🚀 ¡Bienvenido a NexoTrade, ${userName}!`,
        html,
        tags: [
          { name: "type",     value: "welcome" },
          { name: "platform", value: "nexotrade" },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    console.log(`✅ Email bienvenida enviado a ${email} — ID: ${data.id}`);

    // ── Programar secuencia de onboarding (días 2, 3, 5, 7) ──
    // Llama la función SQL para registrar los emails pendientes
    // (el servidor los procesará vía cron o manualmente)
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
      const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      if (SUPABASE_URL && SUPABASE_KEY) {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/schedule_onboarding_emails`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ p_user_id: referral_code || null, p_email: email, p_name: userName }),
        });
        console.log(`📅 Onboarding sequence programada para ${email}`);
      }
    } catch (schedErr) {
      // No bloquear el flujo si falla el scheduling
      console.warn("Onboarding schedule warning:", schedErr);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { "Content-Type": "application/json", ...CORS },
    });

  } catch (e) {
    console.error("send-welcome exception:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS },
    });
  }
});

// ════════════════════════════════════════════════════════════
// Template del email de bienvenida
// ════════════════════════════════════════════════════════════
function buildWelcomeEmail(userName: string, referralLink: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Bienvenido a NexoTrade</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;min-height:100vh;">
<tr><td align="center" style="padding:32px 16px;">
<table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

  <!-- ── LOGO & HEADER ── -->
  <tr><td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:20px;padding:36px 32px;text-align:center;border:1px solid #1e293b;margin-bottom:0;">
    <div style="display:inline-block;background:#00A8FF;border-radius:14px;width:56px;height:56px;line-height:56px;font-size:28px;margin-bottom:16px;">📈</div>
    <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">¡Bienvenido, ${userName}! 🎉</h1>
    <p style="margin:0;color:#64748b;font-size:15px;">Ya eres parte de la comunidad inversora en español más activa.</p>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>

  <!-- ── BADGE EARLY ADOPTER ── -->
  <tr><td style="background:linear-gradient(135deg,#854d0e22,#78350f22);border-radius:14px;padding:16px 20px;border:1px solid #92400e44;text-align:center;">
    <span style="background:#D97706;color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;letter-spacing:0.5px;">🏅 EARLY ADOPTER</span>
    <p style="margin:8px 0 0;color:#fbbf24;font-size:13px;">Eres de los primeros — tienes el badge exclusivo en tu perfil.</p>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>

  <!-- ── QUÉ HACER PRIMERO ── -->
  <tr><td style="background:#1e293b;border-radius:16px;padding:24px;border:1px solid #334155;">
    <h2 style="margin:0 0 18px;color:#ffffff;font-size:15px;font-weight:800;">🚀 Empieza aquí (3 pasos):</h2>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${[
        ["1","📝","Publica tu primera idea","Dinos qué ticker tienes en el radar. El feed te está esperando."],
        ["2","👥","Sigue a los mejores traders","En el Leaderboard verás quién está generando más rentabilidad."],
        ["3","🎮","Compite en Paper Trading","$100,000 virtuales para practicar sin riesgo. Sube al ranking."],
      ].map(([n, e, t, d]) => `
      <tr><td style="padding:0 0 14px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:36px;height:36px;background:#0f172a;border-radius:10px;border:1px solid #334155;text-align:center;vertical-align:middle;font-size:18px;">${e}</td>
          <td style="width:10px;"></td>
          <td>
            <div style="color:#ffffff;font-weight:700;font-size:13px;margin-bottom:2px;">${t}</div>
            <div style="color:#64748b;font-size:12px;line-height:1.4;">${d}</div>
          </td>
        </tr></table>
      </td></tr>`).join("")}
    </table>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>

  <!-- ── VIP PROMO ── -->
  <tr><td style="background:linear-gradient(135deg,#4c1d9520,#1e40af20);border-radius:16px;padding:22px 24px;border:1px solid #7C3AED55;text-align:center;">
    <div style="font-size:32px;margin-bottom:10px;">✦</div>
    <h3 style="margin:0 0 6px;color:#a78bfa;font-size:16px;font-weight:900;">Hazte VIP por solo $9.99/mes</h3>
    <p style="margin:0 0 8px;color:#8b5cf6;font-size:12px;line-height:1.5;">Picks semanales exclusivos · Señales de trading · Alertas de precio · 50% descuento en webinars · Badge VIP en tu perfil</p>
    <a href="${STRIPE_VIP}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#4c1d95);border-radius:10px;padding:11px 28px;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;margin-top:4px;">Ver plan VIP →</a>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>

  <!-- ── REFERIDOS ── -->
  <tr><td style="background:#1e293b;border-radius:14px;padding:18px 20px;border:1px solid #334155;">
    <h3 style="margin:0 0 8px;color:#ffffff;font-size:14px;font-weight:800;">🎁 Invita amigos — gana puntos</h3>
    <p style="margin:0 0 10px;color:#64748b;font-size:12px;line-height:1.5;">Comparte tu link de referido y gana +50 puntos de reputación por cada amigo que se una.</p>
    <a href="${referralLink}" style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:8px 14px;color:#00A8FF;font-size:12px;font-family:monospace;text-decoration:none;display:inline-block;word-break:break-all;">${referralLink}</a>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>

  <!-- ── CTA PRINCIPAL ── -->
  <tr><td style="text-align:center;">
    <a href="${BASE_URL}" style="display:inline-block;background:linear-gradient(135deg,#00A8FF,#0099ff);border-radius:12px;padding:14px 40px;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;letter-spacing:-0.2px;">Ir a NexoTrade →</a>
  </td></tr>

  <tr><td style="height:24px;"></td></tr>

  <!-- ── FOOTER ── -->
  <tr><td style="text-align:center;padding:0 0 24px;">
    <p style="margin:0 0 4px;color:#334155;font-size:11px;">NexoTrade · <a href="${BASE_URL}" style="color:#334155;text-decoration:none;">nexotradeia.com</a></p>
    <p style="margin:0;color:#1e293b;font-size:10px;">Recibes este email porque te registraste en NexoTrade.<br/>⚠️ Solo educativo. No es consejo financiero.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
