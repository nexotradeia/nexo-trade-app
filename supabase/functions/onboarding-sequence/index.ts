// NEXO TRADE — Edge Function: onboarding-sequence
// Envía secuencia de 5 emails en 7 días tras el registro.
//
// ACTIVAR: supabase secrets set RESEND_API_KEY=re_xxxx
// DEPLOY:  supabase functions deploy onboarding-sequence
//
// LLAMAR desde send-welcome o desde un cron/trigger de Supabase:
//   POST /functions/v1/onboarding-sequence
//   { "email": "user@email.com", "name": "María", "user_id": "uuid", "day": 1 }
//
// Días disponibles: 1 (bienvenida ya existe), 2, 3, 5, 7

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL     = "NexoTrade <hola@nexotradeia.com>";
const BASE_URL       = "https://nexotradeia.com";
const STRIPE_VIP     = "https://buy.stripe.com/6oU00c6U24PDe4U3S5aR202";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── EMAIL 2: Top Feature (día 2) ─────────────────────────────────────────────
function buildDay2Email(name: string): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>🤖 Conoce tu asistente IA de trading</title></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Segoe UI',system-ui,sans-serif;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#0B1A2E,#0D2244);padding:36px 32px;text-align:center;">
    <div style="font-size:48px;margin-bottom:12px;">🤖</div>
    <h1 style="color:#fff;margin:0 0 8px;font-size:22px;font-weight:900;">Tu asistente IA de trading</h1>
    <p style="color:#64748b;margin:0;font-size:14px;">Disponible 24/7 solo para ti</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hola <strong>${name}</strong>, ¿sabías que NexoTrade tiene una IA especializada en mercados financieros?
    </p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 12px;color:#64748b;font-size:13px;font-weight:600;">PREGÚNTALE COSAS COMO:</p>
      ${["¿Cuál es el soporte clave de NVDA esta semana?","¿Conviene entrar en BTC ahora o esperar?","Explícame qué es un iron condor","¿Cómo gestiono el riesgo con $5,000?"].map(q=>`
      <div style="display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #F1F5F9;">
        <span style="color:#00A8FF;font-size:14px;flex-shrink:0;">→</span>
        <span style="color:#334155;font-size:13px;">"${q}"</span>
      </div>`).join("")}
    </div>
    <a href="${BASE_URL}" style="display:block;background:linear-gradient(135deg,#00A8FF,#0080CC);border-radius:12px;padding:14px 28px;text-align:center;color:#fff;font-weight:800;font-size:15px;text-decoration:none;margin:20px 0;">
      🤖 Chatear con la IA ahora →
    </a>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">La IA está disponible desde el menú principal de NexoTrade</p>
  </div>
  <div style="background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 NexoTrade · <a href="${BASE_URL}" style="color:#00A8FF;">nexotradeia.com</a></p>
  </div>
</div>
</body></html>`;
}

// ── EMAIL 3: Caso de éxito (día 3) ───────────────────────────────────────────
function buildDay3Email(name: string): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>📈 Cómo María triplicó su portafolio con NexoTrade</title></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Segoe UI',system-ui,sans-serif;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#052e16,#14532d);padding:36px 32px;text-align:center;">
    <div style="font-size:48px;margin-bottom:12px;">📈</div>
    <h1 style="color:#86efac;margin:0 0 8px;font-size:22px;font-weight:900;">Historia real de un trader VIP</h1>
    <p style="color:#4ade80;margin:0;font-size:13px;">Resultados de un miembro de la comunidad</p>
  </div>
  <div style="padding:32px;">
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:14px;padding:20px;margin:0 0 20px;">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🦅</div>
        <div>
          <div style="font-weight:800;color:#065f46;font-size:14px;">Carlos R. · Medellín, Colombia</div>
          <div style="font-size:11px;color:#6ee7b7;margin-bottom:8px;">Miembro VIP desde enero 2026</div>
          <p style="margin:0;color:#047857;font-size:13px;line-height:1.6;font-style:italic;">
            "Antes perdía dinero sin saber por qué. Entré a NexoTrade, seguí los picks semanales durante 3 meses y pasé de $2,000 a $6,400 en mi portafolio. La comunidad me enseñó a gestionar el riesgo de verdad."
          </p>
        </div>
      </div>
    </div>
    <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 16px;">
      Hola <strong>${name}</strong>, historias como la de Carlos son comunes en nuestra comunidad. Los picks VIP semanales no son señales aleatorias — cada uno viene con análisis técnico, precio de entrada, stop loss y target.
    </p>
    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 10px;color:#1e40af;font-weight:700;font-size:13px;">LOS 10 PICKS VIP DE ESTA SEMANA INCLUYEN:</p>
      ${["NVDA — COMPRA · Target +18%","BTC — COMPRA · Target +24%","MSFT — COMPRA · Target +12%","SPY — NEUTRO · Esperar dato Fed"].map(p=>`
      <div style="padding:5px 0;border-bottom:1px solid #DBEAFE;font-size:12px;color:#1e3a8a;">📊 ${p}</div>`).join("")}
      <div style="padding:5px 0;font-size:12px;color:#64748b;font-style:italic;">+ 6 picks más desbloqueados con VIP...</div>
    </div>
    <a href="${STRIPE_VIP}" style="display:block;background:linear-gradient(135deg,#7C3AED,#6366F1);border-radius:12px;padding:14px 28px;text-align:center;color:#fff;font-weight:800;font-size:15px;text-decoration:none;margin:20px 0;">
      ✦ Ver los 10 picks — 7 días gratis →
    </a>
  </div>
  <div style="background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 NexoTrade · <a href="${BASE_URL}" style="color:#00A8FF;">nexotradeia.com</a></p>
  </div>
</div>
</body></html>`;
}

// ── EMAIL 4: Oferta VIP (día 5) ───────────────────────────────────────────────
function buildDay5Email(name: string): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>✦ Tu acceso VIP está esperando, ${name}</title></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Segoe UI',system-ui,sans-serif;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#1a0533,#2e1065);padding:36px 32px;text-align:center;">
    <div style="display:inline-block;background:rgba(167,139,250,0.15);border:1px solid rgba(167,139,250,0.3);border-radius:30px;padding:6px 16px;margin-bottom:16px;">
      <span style="color:#a78bfa;font-size:12px;font-weight:700;letter-spacing:1px;">✦ ACCESO PREMIUM</span>
    </div>
    <h1 style="color:#fff;margin:0 0 8px;font-size:24px;font-weight:900;">Todo lo que te pierdes siendo Free</h1>
    <p style="color:#94a3b8;margin:0;font-size:14px;">Solo $9.99/mes — 7 días gratis para empezar</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 20px;">
      <strong>${name}</strong>, llevas 5 días en NexoTrade. Esta semana los miembros VIP recibieron:
    </p>
    <div style="display:grid;gap:10px;margin:0 0 24px;">
      ${[
        {icon:"🎯",title:"10 picks semanales",desc:"Con análisis completo, entrada, stop y target"},
        {icon:"💡",title:"30+ ideas de inversión",desc:"Upside calculado en tiempo real vs precio actual"},
        {icon:"🏛️",title:"52 portafolios institucionales",desc:"Buffett, Ackman, Burry — actualizados trimestralmente"},
        {icon:"🔔",title:"Alertas de precio por email",desc:"Notificación inmediata cuando tus acciones mueven"},
        {icon:"🤖",title:"IA de trading ilimitada",desc:"Sin límites de preguntas. Como tener un analista 24/7"},
      ].map(f=>`
      <div style="display:flex;gap:12px;align-items:flex-start;padding:12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <span style="font-size:22px;flex-shrink:0;">${f.icon}</span>
        <div>
          <div style="font-weight:700;color:#0F172A;font-size:13px;margin-bottom:2px;">${f.title}</div>
          <div style="font-size:12px;color:#64748b;">${f.desc}</div>
        </div>
      </div>`).join("")}
    </div>
    <a href="${STRIPE_VIP}" style="display:block;background:linear-gradient(135deg,#7C3AED,#6366F1);border-radius:14px;padding:16px 28px;text-align:center;color:#fff;font-weight:900;font-size:16px;text-decoration:none;box-shadow:0 4px 24px rgba(124,58,237,0.4);">
      ✦ Comenzar 7 días gratis →
    </a>
    <p style="color:#94a3b8;font-size:11px;text-align:center;margin:10px 0 0;">Sin tarjeta requerida · Cancela cuando quieras · Acceso inmediato</p>
  </div>
  <div style="background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 NexoTrade · <a href="${BASE_URL}" style="color:#7C3AED;">nexotradeia.com</a></p>
  </div>
</div>
</body></html>`;
}

// ── EMAIL 5: Last chance (día 7) ──────────────────────────────────────────────
function buildDay7Email(name: string): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>⏰ Última oportunidad esta semana, ${name}</title></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Segoe UI',system-ui,sans-serif;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#1c0505,#450a0a);padding:36px 32px;text-align:center;">
    <div style="font-size:48px;margin-bottom:12px;">⏰</div>
    <h1 style="color:#fca5a5;margin:0 0 8px;font-size:22px;font-weight:900;">Los picks de esta semana cierran hoy</h1>
    <p style="color:#f87171;margin:0;font-size:13px;">Cada lunes se publican nuevos análisis VIP</p>
  </div>
  <div style="padding:32px;">
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:14px;padding:16px 20px;margin:0 0 20px;text-align:center;">
      <div style="font-size:28px;font-weight:900;color:#ea580c;">🔥 Solo quedan 23 spots VIP este mes</div>
      <div style="font-size:13px;color:#9a3412;margin-top:4px;">Limitamos el acceso para mantener la calidad de las señales</div>
    </div>
    <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 16px;">
      <strong>${name}</strong>, llevas una semana con nosotros. El próximo lunes publicamos los picks de la semana — son exclusivos para VIP y desaparecen el domingo. ¿Te los vas a perder?
    </p>
    <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin:0 0 20px;">
      <div style="font-weight:700;color:#334155;font-size:13px;margin-bottom:10px;">LO QUE OBTIENES CON VIP:</div>
      ${["✅ 10 picks cada lunes con análisis completo","✅ 30+ ideas de inversión con upside en tiempo real","✅ 52 portafolios gurús 13F actualizados","✅ IA de trading ilimitada sin restricciones","✅ Alertas de precio por email personalizadas","✅ Webinars con 50% de descuento VIP"].map(f=>`
      <div style="font-size:12px;color:#475569;padding:4px 0;">${f}</div>`).join("")}
    </div>
    <a href="${STRIPE_VIP}" style="display:block;background:linear-gradient(135deg,#ea580c,#c2410c);border-radius:14px;padding:16px 28px;text-align:center;color:#fff;font-weight:900;font-size:16px;text-decoration:none;box-shadow:0 4px 24px rgba(234,88,12,0.4);margin:0 0 10px;">
      🔥 Activar VIP ahora — $9.99/mes →
    </a>
    <a href="${STRIPE_VIP}" style="display:block;background:#fff;border:2px solid #7C3AED;border-radius:14px;padding:14px 28px;text-align:center;color:#7C3AED;font-weight:800;font-size:14px;text-decoration:none;">
      ✦ Empezar con 7 días gratis →
    </a>
    <p style="color:#94a3b8;font-size:11px;text-align:center;margin:10px 0 0;">Sin tarjeta requerida · Sin compromiso · Cancela cuando quieras</p>
  </div>
  <div style="background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">
      © 2026 NexoTrade · <a href="${BASE_URL}" style="color:#00A8FF;">nexotradeia.com</a><br>
      <a href="${BASE_URL}/unsubscribe" style="color:#cbd5e1;font-size:10px;">Cancelar suscripción a emails</a>
    </p>
  </div>
</div>
</body></html>`;
}

// ── SERVE ─────────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const { email, name, user_id, day } = await req.json();
    if (!email || !day) {
      return new Response(JSON.stringify({ error: "email and day required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const userName = name || email.split("@")[0];

    const EMAILS: Record<number, { subject: string; html: string }> = {
      2: { subject: `🤖 Tu asistente IA de trading te espera, ${userName}`,   html: buildDay2Email(userName) },
      3: { subject: `📈 Cómo Carlos pasó de $2k a $6k con NexoTrade`,         html: buildDay3Email(userName) },
      5: { subject: `✦ Todo lo que te pierdes siendo Free, ${userName}`,       html: buildDay5Email(userName) },
      7: { subject: `⏰ Última oportunidad esta semana — picks VIP cierran hoy`, html: buildDay7Email(userName) },
    };

    const emailData = EMAILS[day];
    if (!emailData) {
      return new Response(JSON.stringify({ error: `Day ${day} not supported. Use: 2, 3, 5, 7` }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    console.log(`✅ Email día ${day} enviado a ${email} — ID: ${data.id}`);
    return new Response(JSON.stringify({ success: true, id: data.id, day, email }), {
      status: 200, headers: { "Content-Type": "application/json", ...CORS },
    });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS },
    });
  }
});
