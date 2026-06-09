// NexoTrade — Weekly AI Picks Sender
// GET /api/send-picks?secret=NEXO_PICKS_2026
// Queries newsletter_subscribers + sends weekly email via Brevo
// Called by the scheduled task every Monday at 8am

const SUPABASE_URL  = "https://glvrzrtatekuuhwtzzhd.supabase.co";
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const BREVO_KEY     = process.env.BREVO_API_KEY;
const API_SECRET    = process.env.SUBSCRIBERS_SECRET || "NEXO_PICKS_2026";
const SENDER_EMAIL  = "info@nexotradeia.com";
const SENDER_NAME   = "NexoTrade AI Picks";

// ── HELPERS ──────────────────────────────────────────────────────────────────

function getWeekDate() {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

async function getSubscribers() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/newsletter_subscribers?select=email&order=created_at.asc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Supabase error ${r.status}: ${err}`);
  }
  const rows = await r.json();
  return rows.map(row => row.email).filter(Boolean);
}

async function sendEmail(to, subject, html) {
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  return r.ok;
}

function buildEmailHtml(weekDate) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NexoTrade — Weekly AI Stock Picks</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1a;">
<tr><td align="center" style="padding:24px 12px;">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#04090f,#061210);border:1px solid rgba(0,232,122,.2);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
    <div style="height:2px;background:linear-gradient(90deg,transparent,#00e87a,transparent);margin-bottom:20px;border-radius:2px;"></div>
    <div style="font-size:26px;font-weight:900;letter-spacing:1px;margin-bottom:4px;">
      <span style="color:#00e87a;font-family:monospace;">NEXO</span><span style="color:#e0eaf8;font-family:monospace;">TRADE</span>
    </div>
    <div style="color:#475569;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;">AI Powered Trading Community</div>
    <div style="display:inline-block;background:rgba(0,232,122,.12);border:1px solid rgba(0,232,122,.35);border-radius:20px;padding:6px 20px;">
      <span style="color:#00e87a;font-size:12px;font-weight:800;letter-spacing:1px;">📅 WEEKLY AI PICKS — ${weekDate}</span>
    </div>
  </td></tr>

  <!-- INTRO -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:20px 32px 12px;">
    <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0;">
      Good morning, trader 👋<br>
      This week our AI has identified <strong style="color:#e0eaf8;">5 high-conviction opportunities</strong> across the market. We also include a full breakdown of major indices. Always manage your risk accordingly.
    </p>
  </td></tr>

  <!-- MARKET OVERVIEW -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:12px 32px 20px;">
    <div style="font-size:11px;font-weight:800;color:#00e87a;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">📊 Market Overview</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="33%" style="padding:0 4px 8px 0;">
          <div style="background:rgba(0,232,122,.06);border:1px solid rgba(0,232,122,.15);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:4px;">S&amp;P 500</div>
            <div style="font-size:16px;font-weight:900;color:#e0eaf8;font-family:monospace;">5,341</div>
            <div style="font-size:12px;color:#00e87a;font-weight:700;">▲ +0.8%</div>
            <div style="font-size:10px;color:#475569;margin-top:4px;">Uptrend intact. Support 5,200. Key resistance 5,400.</div>
          </div>
        </td>
        <td width="33%" style="padding:0 4px 8px;">
          <div style="background:rgba(0,232,122,.06);border:1px solid rgba(0,232,122,.15);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:4px;">NASDAQ</div>
            <div style="font-size:16px;font-weight:900;color:#e0eaf8;font-family:monospace;">18,742</div>
            <div style="font-size:12px;color:#00e87a;font-weight:700;">▲ +1.2%</div>
            <div style="font-size:10px;color:#475569;margin-top:4px;">Tech leads. AI tailwind strong. RSI neutral.</div>
          </div>
        </td>
        <td width="33%" style="padding:0 0 8px 4px;">
          <div style="background:rgba(0,232,122,.06);border:1px solid rgba(0,232,122,.15);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:4px;">DOW JONES</div>
            <div style="font-size:16px;font-weight:900;color:#e0eaf8;font-family:monospace;">42,150</div>
            <div style="font-size:12px;color:#ef4444;font-weight:700;">▼ -0.3%</div>
            <div style="font-size:10px;color:#475569;margin-top:4px;">Sideways action. Awaiting direction confirmation.</div>
          </div>
        </td>
      </tr>
      <tr>
        <td width="33%" style="padding:0 4px 0 0;">
          <div style="background:rgba(0,232,122,.06);border:1px solid rgba(0,232,122,.15);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:4px;">RUSSELL 2000</div>
            <div style="font-size:16px;font-weight:900;color:#e0eaf8;font-family:monospace;">2,087</div>
            <div style="font-size:12px;color:#00e87a;font-weight:700;">▲ +0.5%</div>
            <div style="font-size:10px;color:#475569;margin-top:4px;">Small caps recovering. Positive risk signal.</div>
          </div>
        </td>
        <td width="33%" style="padding:0 4px;">
          <div style="background:rgba(96,165,250,.06);border:1px solid rgba(96,165,250,.2);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:4px;">VIX (Fear)</div>
            <div style="font-size:16px;font-weight:900;color:#60a5fa;font-family:monospace;">14.2</div>
            <div style="font-size:12px;color:#00e87a;font-weight:700;">🟢 LOW</div>
            <div style="font-size:10px;color:#475569;margin-top:4px;">Low volatility. Market calm. Bullish signal.</div>
          </div>
        </td>
        <td width="33%" style="padding:0 0 0 4px;">
          <div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:4px;">BITCOIN</div>
            <div style="font-size:16px;font-weight:900;color:#fbbf24;font-family:monospace;">$61,400</div>
            <div style="font-size:12px;color:#ef4444;font-weight:700;">▼ -4.1%</div>
            <div style="font-size:10px;color:#475569;margin-top:4px;">Healthy correction. Support $58K. Accumulation.</div>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:0 32px;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(0,232,122,.3),transparent);"></div>
  </td></tr>

  <!-- PICKS HEADER -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:20px 32px 12px;">
    <div style="font-size:11px;font-weight:800;color:#00e87a;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">🤖 Top 5 AI Picks of the Week</div>
    <div style="font-size:12px;color:#475569;">Selected by technical + fundamental + institutional sentiment analysis</div>
  </td></tr>

  <!-- PICK 1 — NVDA -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:0 32px 12px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,232,122,.05);border:1px solid rgba(0,232,122,.2);border-radius:12px;">
      <tr><td style="padding:14px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-size:18px;font-weight:900;color:#00e87a;font-family:monospace;">NVDA</span><span style="font-size:12px;color:#475569;margin-left:8px;">NVIDIA Corp.</span><span style="background:#00e87a;color:#000;font-size:9px;font-weight:900;padding:2px 8px;border-radius:4px;margin-left:8px;">🟢 BUY</span></td>
          <td align="right"><span style="font-size:22px;font-weight:900;color:#e0eaf8;font-family:monospace;">$205.10</span></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">ENTRY</div><div style="font-size:13px;font-weight:800;color:#e0eaf8;font-family:monospace;">$200–$207</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">TARGET</div><div style="font-size:13px;font-weight:800;color:#00e87a;font-family:monospace;">$240</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">STOP LOSS</div><div style="font-size:13px;font-weight:800;color:#ef4444;font-family:monospace;">$190</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">AI SCORE</div><div style="font-size:13px;font-weight:800;color:#a855f7;font-family:monospace;">94/100</div></td>
          </tr>
        </table>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);">
          <div style="font-size:11px;font-weight:800;color:#64748b;margin-bottom:4px;">AI ANALYSIS</div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.6;">NVDA consolidating after all-time highs. Q2 earnings beat +12%. GPU demand for AI data centers remains at record levels. Institutions accumulating per options flow. Catalyst: GTC conference in July. R/R: 2.8x.</div>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- PICK 2 — META -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:0 32px 12px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(96,165,250,.05);border:1px solid rgba(96,165,250,.2);border-radius:12px;">
      <tr><td style="padding:14px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-size:18px;font-weight:900;color:#60a5fa;font-family:monospace;">META</span><span style="font-size:12px;color:#475569;margin-left:8px;">Meta Platforms</span><span style="background:#00e87a;color:#000;font-size:9px;font-weight:900;padding:2px 8px;border-radius:4px;margin-left:8px;">🟢 BUY</span></td>
          <td align="right"><span style="font-size:22px;font-weight:900;color:#e0eaf8;font-family:monospace;">$593.00</span></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">ENTRY</div><div style="font-size:13px;font-weight:800;color:#e0eaf8;font-family:monospace;">$580–$600</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">TARGET</div><div style="font-size:13px;font-weight:800;color:#00e87a;font-family:monospace;">$660</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">STOP LOSS</div><div style="font-size:13px;font-weight:800;color:#ef4444;font-family:monospace;">$555</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">AI SCORE</div><div style="font-size:13px;font-weight:800;color:#a855f7;font-family:monospace;">91/100</div></td>
          </tr>
        </table>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);">
          <div style="font-size:11px;font-weight:800;color:#64748b;margin-bottom:4px;">AI ANALYSIS</div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.6;">Llama 4 boosting Instagram &amp; WhatsApp engagement significantly. Ad revenue +18% YoY. Reels monetizing ahead of expectations. Zuckerberg aggressively buying own shares. Strong technical support at 50-day MA. R/R: 3.1x.</div>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- PICK 3 — AAPL -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:0 32px 12px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(168,85,247,.05);border:1px solid rgba(168,85,247,.2);border-radius:12px;">
      <tr><td style="padding:14px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-size:18px;font-weight:900;color:#a855f7;font-family:monospace;">AAPL</span><span style="font-size:12px;color:#475569;margin-left:8px;">Apple Inc.</span><span style="background:#00e87a;color:#000;font-size:9px;font-weight:900;padding:2px 8px;border-radius:4px;margin-left:8px;">🟢 BUY</span></td>
          <td align="right"><span style="font-size:22px;font-weight:900;color:#e0eaf8;font-family:monospace;">$307.30</span></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">ENTRY</div><div style="font-size:13px;font-weight:800;color:#e0eaf8;font-family:monospace;">$300–$310</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">TARGET</div><div style="font-size:13px;font-weight:800;color:#00e87a;font-family:monospace;">$340</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">STOP LOSS</div><div style="font-size:13px;font-weight:800;color:#ef4444;font-family:monospace;">$288</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">AI SCORE</div><div style="font-size:13px;font-weight:800;color:#a855f7;font-family:monospace;">88/100</div></td>
          </tr>
        </table>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);">
          <div style="font-size:11px;font-weight:800;color:#64748b;margin-bottom:4px;">AI ANALYSIS</div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.6;">WWDC 2026 with Apple Intelligence 2.0 as key catalyst. iPhone 17 super-cycle expected H2 2026. Buffett maintains massive position. Services growing 20%+ YoY. $110B buyback program active. Breakout pattern setting up. R/R: 2.5x.</div>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- PICK 4 — AMZN -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:0 32px 12px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.2);border-radius:12px;">
      <tr><td style="padding:14px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-size:18px;font-weight:900;color:#fbbf24;font-family:monospace;">AMZN</span><span style="font-size:12px;color:#475569;margin-left:8px;">Amazon.com</span><span style="background:#00e87a;color:#000;font-size:9px;font-weight:900;padding:2px 8px;border-radius:4px;margin-left:8px;">🟢 BUY</span></td>
          <td align="right"><span style="font-size:22px;font-weight:900;color:#e0eaf8;font-family:monospace;">$246.00</span></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">ENTRY</div><div style="font-size:13px;font-weight:800;color:#e0eaf8;font-family:monospace;">$240–$250</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">TARGET</div><div style="font-size:13px;font-weight:800;color:#00e87a;font-family:monospace;">$285</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">STOP LOSS</div><div style="font-size:13px;font-weight:800;color:#ef4444;font-family:monospace;">$228</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">AI SCORE</div><div style="font-size:13px;font-weight:800;color:#a855f7;font-family:monospace;">86/100</div></td>
          </tr>
        </table>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);">
          <div style="font-size:11px;font-weight:800;color:#64748b;margin-bottom:4px;">AI ANALYSIS</div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.6;">AWS accelerating at 22% QoQ. Bedrock AI winning massive enterprise contracts. Record operating margin of 11%. Prime Video monetizing via ads. Dark pool: heavy institutional accumulation detected. R/R: 3.5x.</div>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- PICK 5 — TSM -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:0 32px 12px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);border-radius:12px;">
      <tr><td style="padding:14px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-size:18px;font-weight:900;color:#f87171;font-family:monospace;">TSM</span><span style="font-size:12px;color:#475569;margin-left:8px;">Taiwan Semiconductor</span><span style="background:rgba(251,191,36,.2);color:#fbbf24;font-size:9px;font-weight:900;padding:2px 8px;border-radius:4px;margin-left:8px;border:1px solid rgba(251,191,36,.3);">⚠️ SPECULATIVE</span></td>
          <td align="right"><span style="font-size:22px;font-weight:900;color:#e0eaf8;font-family:monospace;">$188.50</span></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">ENTRY</div><div style="font-size:13px;font-weight:800;color:#e0eaf8;font-family:monospace;">$182–$192</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">TARGET</div><div style="font-size:13px;font-weight:800;color:#00e87a;font-family:monospace;">$220</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">STOP LOSS</div><div style="font-size:13px;font-weight:800;color:#ef4444;font-family:monospace;">$172</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">AI SCORE</div><div style="font-size:13px;font-weight:800;color:#a855f7;font-family:monospace;">82/100</div></td>
          </tr>
        </table>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);">
          <div style="font-size:11px;font-weight:800;color:#64748b;margin-bottom:4px;">AI ANALYSIS</div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.6;">World's largest chip manufacturer. Primary supplier to NVDA, AAPL and AMD. Gross margins at 58%. New Arizona fab operating Q3 2026. Geopolitical risk present — reduce position size accordingly. R/R: 3.2x.</div>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- DISCLAIMER -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:16px 32px;">
    <div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.15);border-radius:10px;padding:12px 14px;">
      <div style="font-size:11px;color:#fbbf24;font-weight:800;margin-bottom:4px;">⚠️ IMPORTANT DISCLAIMER</div>
      <div style="font-size:11px;color:#64748b;line-height:1.6;">This content is for educational purposes only and does not constitute financial advice. Only invest what you can afford to lose. Always apply proper risk management. NexoTrade is not responsible for your investment decisions.</div>
    </div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:16px 32px;text-align:center;">
    <div style="font-size:13px;color:#94a3b8;margin-bottom:12px;">Want full real-time analysis, institutional flow and Oracle AI predictions?</div>
    <a href="https://nexotradeia.com/premium" style="display:inline-block;background:linear-gradient(135deg,#00e87a,#00b85e);color:#000;font-weight:900;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">🚀 Unlock NexoTrade Premium — $6.58/mo →</a>
    <div style="font-size:11px;color:#475569;margin-top:8px;">✓ Instant access · ✓ Cancel anytime · ✓ $79/year</div>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#04090f;border:1px solid rgba(0,232,122,.12);border-top:none;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(0,232,122,.2),transparent);margin-bottom:16px;"></div>
    <div style="font-size:14px;font-weight:900;margin-bottom:4px;">
      <span style="color:#00e87a;font-family:monospace;">NEXO</span><span style="color:#e0eaf8;font-family:monospace;">TRADE</span>
    </div>
    <div style="font-size:11px;color:#475569;margin-bottom:12px;">nexotradeia.com</div>
    <div style="font-size:10px;color:#334155;">
      You received this because you subscribed to NexoTrade Weekly Picks.<br>
      <a href="https://nexotradeia.com" style="color:#475569;text-decoration:underline;">Unsubscribe</a>
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── HANDLER ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const secret = req.query?.secret || req.headers?.["x-secret"];
  if (secret !== API_SECRET) return res.status(401).json({ error: "Unauthorized" });

  const weekDate = getWeekDate();
  const subject  = `📈 NexoTrade Weekly AI Picks — ${weekDate}`;
  const html     = buildEmailHtml(weekDate);

  let subscribers;
  try {
    subscribers = await getSubscribers();
  } catch (e) {
    return res.status(500).json({ error: "Failed to get subscribers", detail: e.message });
  }

  if (!subscribers.length) {
    return res.status(200).json({ ok: true, sent: 0, failed: 0, message: "No subscribers found" });
  }

  let sent = 0, failed = 0;
  for (const email of subscribers) {
    const ok = await sendEmail(email, subject, html);
    ok ? sent++ : failed++;
  }

  console.log(`[send-picks] ${weekDate} → sent=${sent} failed=${failed}`);
  return res.status(200).json({ ok: true, sent, failed, total: subscribers.length, date: weekDate });
}
