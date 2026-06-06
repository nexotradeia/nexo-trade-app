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

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#00A8FF 0%,#0066CC 100%);padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="56" height="56" rx="14" fill="rgba(255,255,255,0.15)"/>
              <path d="M14 38L22 26L30 32L38 18" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="42" cy="18" r="3" fill="#00E58F"/>
            </svg>
            <h1 style="margin:16px 0 4px;color:#fff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">¡Bienvenido a NexoTrade! 🎉</h1>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px;">La comunidad inversora en español</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;color:#1E293B;font-size:16px;line-height:1.6;">
              Hola 👋, gracias por suscribirte al análisis de mercado semanal de NexoTrade.
            </p>
            <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.7;">
              Cada semana recibirás en tu correo:
            </p>

            <!-- BENEFICIOS -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="padding:12px 16px;background:#F0F9FF;border-radius:10px;margin-bottom:8px;display:block;">
                  <span style="font-size:20px;">📊</span>
                  <span style="color:#1E293B;font-size:15px;font-weight:600;margin-left:10px;">Análisis técnico de los mercados</span>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="padding:12px 16px;background:#F0FFF4;border-radius:10px;">
                  <span style="font-size:20px;">🎯</span>
                  <span style="color:#1E293B;font-size:15px;font-weight:600;margin-left:10px;">Picks de acciones y crypto de la semana</span>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="padding:12px 16px;background:#FFF7ED;border-radius:10px;">
                  <span style="font-size:20px;">📰</span>
                  <span style="color:#1E293B;font-size:15px;font-weight:600;margin-left:10px;">Noticias que mueven el mercado</span>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="padding:12px 16px;background:#FDF4FF;border-radius:10px;">
                  <span style="font-size:20px;">🔴</span>
                  <span style="color:#1E293B;font-size:15px;font-weight:600;margin-left:10px;">Avisos de webinars en vivo</span>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="https://nexotradeia.com" style="display:inline-block;background:linear-gradient(135deg,#00A8FF,#0066CC);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                    Ir a NexoTrade →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#94A3B8;font-size:13px;text-align:center;line-height:1.6;">
              Si no te suscribiste tú, puedes ignorar este correo.<br/>
              <a href="https://nexotradeia.com" style="color:#00A8FF;text-decoration:none;">Darse de baja</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#F8FAFC;padding:20px 40px;text-align:center;border-top:1px solid #E2E8F0;">
            <p style="margin:0;color:#94A3B8;font-size:12px;">
              © 2025 NexoTrade · <a href="https://nexotradeia.com" style="color:#64748B;text-decoration:none;">nexotradeia.com</a>
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
        subject:  "✅ Suscripción confirmada — Análisis de mercado gratis cada semana",
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
