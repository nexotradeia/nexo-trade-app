// NexoTrade Newsletter — Bienvenida automática por email
// POST /api/newsletter-welcome   body: { email }
// Envía email de bienvenida con Resend

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL     = "NexoTrade <newsletter@nexotradeia.com>";
const REPLY_TO       = "hola@nexotradeia.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body || {};
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email inválido" });
  }

  // Si no hay Resend configurado, solo log y OK
  if (!RESEND_API_KEY) {
    console.log(`[newsletter] Suscriptor sin Resend key: ${email}`);
    return res.status(200).json({ ok: true, message: "Registrado (sin email key)" });
  }

  const row = (title) => `
              <tr>
                <td style="padding:14px 2px;border-bottom:1px solid #ECEFF3;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="vertical-align:middle;width:26px;">
                      <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:#0F4C81;color:#fff;font-size:11px;line-height:20px;text-align:center;font-weight:700;">&#10003;</span>
                    </td>
                    <td style="vertical-align:middle;color:#243B53;font-size:15px;font-weight:500;padding-left:10px;">${title}</td>
                  </tr></table>
                </td>
              </tr>`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#EEF1F5;font-family:Georgia,'Times New Roman',-apple-system,BlinkMacSystemFont,'Segoe UI',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#EEF1F5;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E2E7EE;border-radius:6px;overflow:hidden;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B1A2E 0%,#0F3B44 100%);padding:40px 40px 32px;text-align:center;">
            <svg width="44" height="44" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="56" height="56" rx="13" fill="rgba(255,255,255,0.10)"/>
              <path d="M14 38L22 26L30 32L38 18" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="40" cy="18" r="3" fill="#19B3A6"/>
            </svg>
            <div style="margin:18px 0 0;color:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:600;letter-spacing:3px;">NEXOTRADE</div>
            <div style="margin:8px auto 0;width:40px;height:2px;background:#19B3A6;"></div>
            <p style="margin:14px 0 0;color:#9FB3C8;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Market Intelligence</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 44px;">
            <h1 style="margin:0 0 18px;color:#0B1A2E;font-size:22px;font-weight:600;">Welcome to NexoTrade.</h1>
            <p style="margin:0 0 16px;color:#3D4F61;font-size:15px;line-height:1.7;">
              Thank you for subscribing. From now on you'll receive our market analysis straight to your inbox — with the same depth professional investors rely on.
            </p>
            <p style="margin:0 0 8px;color:#6B7C8E;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
              Every week you'll receive
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 30px;font-family:'Helvetica Neue',Arial,sans-serif;">
              ${row("Technical analysis of the markets")}
              ${row("Weekly stock & crypto picks")}
              ${row("News that moves the market")}
              ${row("Early access to live webinars")}
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
              <tr><td align="center">
                <a href="https://nexotradeia.com" style="display:inline-block;background:#0F4C81;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:4px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                  Access the platform
                </a>
              </td></tr>
            </table>

            <p style="margin:0;color:#9AA7B4;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;text-align:center;line-height:1.6;">
              If you didn't sign up for this, you can safely ignore this message.<br/>
              <a href="https://nexotradeia.com" style="color:#0F4C81;text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0B1A2E;padding:22px 40px;text-align:center;">
            <p style="margin:0;color:#7C8EA0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.5px;">
              © 2026 NexoTrade · <a href="https://nexotradeia.com" style="color:#9FB3C8;text-decoration:none;">nexotradeia.com</a><br/>
              <span style="color:#5A6B7D;">Educational content. Not financial advice.</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:     FROM_EMAIL,
        to:       [email],
        reply_to: REPLY_TO,
        subject:  "Welcome to NexoTrade — your weekly market analysis",
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[newsletter] Resend error:", data);
      return res.status(500).json({ error: "Error enviando email", detail: data });
    }

    console.log(`[newsletter] Email enviado a ${email} — id: ${data.id}`);
    return res.status(200).json({ ok: true, id: data.id });

  } catch(e) {
    console.error("[newsletter] fetch error:", e.message);
    return res.status(500).json({ error: "Error de red al enviar email" });
  }
}
