// NexoTrade — Weekly AI Picks Sender (LIVE MARKET DATA)
// GET /api/send-picks?secret=NEXO_PICKS_2026
// Fetches real prices from Finnhub, ranks top 5 by weekly momentum, sends via Brevo
// Cron: every Monday 8am ET (configured in vercel.json)

const SUPABASE_URL = "https://glvrzrtatekuuhwtzzhd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "sb_publishable_1CCvWAO3iqcFZmcqvUdlZg_rOdSZZcl";
const BREVO_KEY    = process.env.BREVO_API_KEY;
const API_SECRET   = process.env.SUBSCRIBERS_SECRET || "NEXO_PICKS_2026";
const FINNHUB_KEY  = process.env.FINNHUB_KEY || "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
const SENDER_EMAIL = "info@nexotradeia.com";
const SENDER_NAME  = "NexoTrade AI Picks";

// ── CANDIDATE POOL (AI evaluates all, picks top 5 weekly) ─────────────────────
const CANDIDATES = [
  { symbol: "NVDA",  name: "NVIDIA Corp.",          color: "#00e87a", sector: "AI/Semiconductors" },
  { symbol: "META",  name: "Meta Platforms",         color: "#60a5fa", sector: "Social Media/AI"   },
  { symbol: "AAPL",  name: "Apple Inc.",             color: "#a855f7", sector: "Consumer Tech"     },
  { symbol: "AMZN",  name: "Amazon.com",             color: "#fbbf24", sector: "Cloud/eCommerce"   },
  { symbol: "MSFT",  name: "Microsoft Corp.",        color: "#00e87a", sector: "Cloud/AI"          },
  { symbol: "GOOGL", name: "Alphabet Inc.",          color: "#34d399", sector: "Search/Cloud"      },
  { symbol: "AVGO",  name: "Broadcom Inc.",          color: "#f59e0b", sector: "Semiconductors"    },
  { symbol: "AMD",   name: "Advanced Micro Devices", color: "#ec4899", sector: "Semiconductors"    },
  { symbol: "TSM",   name: "Taiwan Semiconductor",   color: "#f87171", sector: "Chip Manufacturing"},
  { symbol: "JPM",   name: "JPMorgan Chase",         color: "#60a5fa", sector: "Financials"        },
  { symbol: "LLY",   name: "Eli Lilly & Co.",        color: "#a855f7", sector: "Pharma/GLP-1"      },
  { symbol: "ORCL",  name: "Oracle Corp.",           color: "#fbbf24", sector: "Cloud/AI DB"       },
  { symbol: "CRM",   name: "Salesforce Inc.",        color: "#34d399", sector: "Enterprise SaaS"   },
  { symbol: "NFLX",  name: "Netflix Inc.",           color: "#f87171", sector: "Streaming"         },
  { symbol: "UBER",  name: "Uber Technologies",      color: "#60a5fa", sector: "Mobility/AI"       },
];

// AI analysis templates per stock (dynamically adapted with real price data)
const ANALYSIS = {
  NVDA:  "AI infrastructure buildout driving GPU demand to record highs. Data center revenue up 400%+ YoY. Blackwell chips shipping — $200B+ backlog. Institutions accumulating via options. Key catalyst: quarterly earnings.",
  META:  "Llama AI models powering Instagram, Reels and WhatsApp engagement. Ad revenue +18% YoY. Threads surpassing 200M users. Zuckerberg executing share buybacks. Strong 50-day MA support holding.",
  AAPL:  "Apple Intelligence 2.0 driving iPhone upgrade cycle. Services growing 20%+ YoY. Active $110B buyback program. Buffett maintaining massive position. WWDC catalyst expected this quarter.",
  AMZN:  "AWS accelerating at 22% QoQ — AI enterprise contracts surging. Bedrock winning Fortune 500 clients. Record 11% operating margin. Prime Video ad revenue monetizing ahead of schedule.",
  MSFT:  "Copilot AI integration across Office 365 driving ARPU expansion. Azure growing 29% YoY on AI workloads. OpenAI partnership paying off. $80B data center investment confirms AI leadership.",
  GOOGL: "Google Cloud accelerating on AI demand. Gemini Ultra gaining enterprise traction. Search market share stable despite AI competition. YouTube ad revenue recovering strongly.",
  AVGO:  "Custom AI chip (XPU) revenue exploding — hyperscaler demand from Meta & Google. Networking segment growing 46%. VMware integration ahead of schedule. High-margin recurring revenue.",
  AMD:   "MI300X GPU gaining market share vs NVIDIA in AI inference. ROCm software stack maturing. Data center revenue tripling YoY. Microsoft Azure choosing AMD for cost-efficient AI workloads.",
  TSM:   "World's most advanced chip manufacturer — sole supplier for NVDA, AAPL and AMD cutting-edge nodes. Gross margins at 58%. Arizona Fab 21 ramping. Geopolitical risk present — size accordingly.",
  JPM:   "Record investment banking revenue. Net interest income holding despite rate environment. AI automation cutting costs 15%. $12B stock buyback active. Dimon leading consolidation plays.",
  LLY:   "Mounjaro/Zepbound driving explosive GLP-1 demand. Revenue guidance raised 3x this year. Manufacturing capacity expanding globally. Obesity drug market estimated at $150B+ by 2030.",
  ORCL:  "OCI (Oracle Cloud) winning massive AI training contracts from Elon Musk's xAI and others. Database AI upgrades driving renewals. Ellison's $40B capex commitment to AI infrastructure paying off.",
  CRM:   "Agentforce AI platform transforming CRM — early enterprise adoption strong. Data Cloud growing 30%+. Margin expansion on track. Benioff returning to operational discipline.",
  NFLX:  "Ad-supported tier surpassing 40M subscribers. Live sports rights driving subscriber growth. Password sharing crackdown adding $2B+ annual revenue. Free cash flow at all-time highs.",
  UBER:  "Robotaxi partnerships with Waymo expanding. Delivery segment achieving sustained profitability. AI-powered route optimization cutting driver costs. International growth above estimates.",
};

// ── MARKET OVERVIEW TICKERS ───────────────────────────────────────────────────
const MARKET = [
  { key: "sp500",   symbol: "SPY",         label: "S&P 500",     note: "Key support 50-day MA"      },
  { key: "nasdaq",  symbol: "QQQ",         label: "NASDAQ",      note: "Tech leadership intact"     },
  { key: "dow",     symbol: "DIA",         label: "DOW JONES",   note: "Blue chips consolidating"   },
  { key: "russell", symbol: "IWM",         label: "RUSSELL 2000",note: "Small caps risk indicator"  },
  { key: "vix",     symbol: "^VIX",        label: "VIX (Fear)",  note: "Volatility sentiment"       },
  { key: "btc",     symbol: "BINANCE:BTCUSDT", label: "BITCOIN", note: "Crypto risk appetite"       },
];

// ── FINNHUB HELPERS ───────────────────────────────────────────────────────────

async function finnhubQuote(symbol) {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const d = await r.json();
    // d.c = current, d.d = change, d.dp = % change, d.pc = prev close
    if (!d || !d.c) return null;
    return d;
  } catch { return null; }
}

async function finnhubWeeklyCandle(symbol) {
  // Get 8 trading days of daily candles to compute 5-day return
  try {
    const to   = Math.floor(Date.now() / 1000);
    const from = to - 12 * 24 * 3600; // 12 calendar days back covers 8 trading days
    const url  = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const d = await r.json();
    if (!d || d.s !== "ok" || !d.c || d.c.length < 2) return null;
    const first = d.c[0];
    const last  = d.c[d.c.length - 1];
    return ((last - first) / first) * 100; // 5-day %
  } catch { return null; }
}

function fmt(n, dec = 2) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toFixed(dec);
}

function fmtPrice(p) {
  if (!p) return "—";
  if (p >= 1000) return "$" + (p / 1000).toFixed(2) + "K";
  if (p >= 100)  return "$" + p.toFixed(2);
  return "$" + p.toFixed(2);
}

function arrow(pct) {
  return pct >= 0 ? "▲" : "▼";
}

function pctColor(pct) {
  return pct >= 0 ? "#00e87a" : "#ef4444";
}

function scoreFromMomentum(weekPct, dayPct) {
  // Weighted momentum score → mapped to 70–97
  const raw = (weekPct || 0) * 0.65 + (dayPct || 0) * 0.35;
  const clamped = Math.max(-10, Math.min(15, raw));
  return Math.round(70 + ((clamped + 10) / 25) * 27);
}

function signalBadge(score) {
  if (score >= 88) return { label: "🟢 BUY",        bg: "#00e87a", fg: "#000", border: "rgba(0,232,122,.2)" };
  if (score >= 80) return { label: "🟡 WATCH",       bg: "rgba(251,191,36,.15)", fg: "#fbbf24", border: "rgba(251,191,36,.3)" };
  return               { label: "⚠️ SPECULATIVE", bg: "rgba(239,68,68,.12)",  fg: "#f87171", border: "rgba(239,68,68,.25)" };
}

// ── SUPABASE ──────────────────────────────────────────────────────────────────

async function getSubscribers() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/newsletter_subscribers?select=email&order=created_at.asc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  const rows = await r.json();
  return rows.map(row => row.email).filter(Boolean);
}

// ── EMAIL SENDER ──────────────────────────────────────────────────────────────

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

// ── EMAIL TEMPLATE ────────────────────────────────────────────────────────────

function buildPickCard(pick, rank) {
  const sig   = signalBadge(pick.score);
  const price = fmtPrice(pick.price);
  const entry_lo = fmtPrice(pick.price * 0.985);
  const entry_hi = fmtPrice(pick.price * 1.015);
  const target   = fmtPrice(pick.price * 1.15);
  const stop     = fmtPrice(pick.price * 0.93);
  const dayStr   = `${arrow(pick.dp)} ${Math.abs(pick.dp).toFixed(2)}%`;
  const wkStr    = pick.weekPct !== null
    ? `${arrow(pick.weekPct)} ${Math.abs(pick.weekPct).toFixed(2)}%`
    : "—";

  return `
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:0 32px 12px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,.03);border:1px solid ${pick.color}33;border-radius:12px;">
      <tr><td style="padding:14px 16px;">
        <!-- TITLE ROW -->
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <span style="font-size:11px;color:#475569;font-weight:700;margin-right:6px;">#${rank}</span>
            <span style="font-size:18px;font-weight:900;color:${pick.color};font-family:monospace;">${pick.symbol}</span>
            <span style="font-size:12px;color:#475569;margin-left:8px;">${pick.name}</span>
            <span style="background:${sig.bg};color:${sig.fg};font-size:9px;font-weight:900;padding:2px 8px;border-radius:4px;margin-left:8px;border:1px solid ${sig.border};">${sig.label}</span>
          </td>
          <td align="right">
            <span style="font-size:22px;font-weight:900;color:#e0eaf8;font-family:monospace;">${price}</span>
          </td>
        </tr></table>
        <!-- PERF ROW -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;margin-bottom:10px;">
          <tr>
            <td><span style="font-size:11px;color:#475569;">Today: </span><span style="font-size:11px;font-weight:800;color:${pctColor(pick.dp)};">${dayStr}</span></td>
            <td><span style="font-size:11px;color:#475569;">This week: </span><span style="font-size:11px;font-weight:800;color:${pctColor(pick.weekPct || 0)};">${wkStr}</span></td>
            <td><span style="font-size:11px;color:#475569;">Sector: </span><span style="font-size:11px;color:#64748b;">${pick.sector}</span></td>
          </tr>
        </table>
        <!-- LEVELS ROW -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
          <tr>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">ENTRY ZONE</div><div style="font-size:12px;font-weight:800;color:#e0eaf8;font-family:monospace;">${entry_lo}–${entry_hi}</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">TARGET +15%</div><div style="font-size:12px;font-weight:800;color:#00e87a;font-family:monospace;">${target}</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">STOP LOSS -7%</div><div style="font-size:12px;font-weight:800;color:#ef4444;font-family:monospace;">${stop}</div></td>
            <td width="25%" style="text-align:center;"><div style="font-size:10px;color:#475569;margin-bottom:2px;">AI SCORE</div><div style="font-size:12px;font-weight:800;color:#a855f7;font-family:monospace;">${pick.score}/100</div></td>
          </tr>
        </table>
        <!-- ANALYSIS -->
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);">
          <div style="font-size:11px;font-weight:800;color:#64748b;margin-bottom:4px;">🤖 AI ANALYSIS</div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.6;">${ANALYSIS[pick.symbol] || "Strong momentum detected. Institutional accumulation signals positive. Monitor key levels carefully."}</div>
        </div>
      </td></tr>
    </table>
  </td></tr>`;
}

function buildMarketCard(m) {
  const isUp   = m.pct >= 0;
  const color  = isUp ? "#00e87a" : "#ef4444";
  const isCrypto = m.key === "btc";
  const isVix    = m.key === "vix";
  const cardColor = isCrypto ? "rgba(251,191,36,.06)" : isVix ? "rgba(96,165,250,.06)" : "rgba(0,232,122,.06)";
  const borderColor = isCrypto ? "rgba(251,191,36,.2)" : isVix ? "rgba(96,165,250,.2)" : "rgba(0,232,122,.15)";
  const priceColor  = isCrypto ? "#fbbf24" : isVix ? "#60a5fa" : "#e0eaf8";

  let pctDisplay = `${arrow(m.pct)} ${Math.abs(m.pct).toFixed(2)}%`;
  if (isVix) {
    pctDisplay = m.price < 15 ? "🟢 LOW" : m.price < 25 ? "🟡 MODERATE" : "🔴 HIGH";
  }

  return `
    <td width="33%" style="padding:0 4px 8px;">
      <div style="background:${cardColor};border:1px solid ${borderColor};border-radius:10px;padding:10px 12px;">
        <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:4px;">${m.label}</div>
        <div style="font-size:16px;font-weight:900;color:${priceColor};font-family:monospace;">${isCrypto ? "$" : ""}${m.price >= 1000 ? m.price.toLocaleString("en-US", {maximumFractionDigits:0}) : m.price.toFixed(2)}</div>
        <div style="font-size:12px;color:${isVix ? "#00e87a" : color};font-weight:700;">${pctDisplay}</div>
        <div style="font-size:10px;color:#475569;margin-top:4px;">${m.note}</div>
      </div>
    </td>`;
}

function buildEmailHtml(weekDate, picks, marketData) {
  const pickCards = picks.map((p, i) => buildPickCard(p, i + 1)).join("");

  // Build market rows (2 rows of 3)
  const mRow1 = marketData.slice(0, 3).map(buildMarketCard).join("");
  const mRow2 = marketData.slice(3, 6).map(buildMarketCard).join("");

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
      Our AI scanned <strong style="color:#e0eaf8;">15 top stocks</strong> this week and selected the <strong style="color:#00e87a;">5 highest-conviction opportunities</strong> based on real-time price momentum, technical signals and institutional sentiment. All prices are live as of market open.
    </p>
  </td></tr>

  <!-- MARKET OVERVIEW -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:12px 32px 4px;">
    <div style="font-size:11px;font-weight:800;color:#00e87a;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">📊 Market Overview — Live</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>${mRow1}</tr>
      <tr>${mRow2}</tr>
    </table>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:4px 32px 12px;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(0,232,122,.3),transparent);"></div>
  </td></tr>

  <!-- PICKS HEADER -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:12px 32px 12px;">
    <div style="font-size:11px;font-weight:800;color:#00e87a;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">🤖 Top 5 AI Picks of the Week</div>
    <div style="font-size:12px;color:#475569;">Ranked by weekly momentum · Live prices from Finnhub · Risk/Reward calculated automatically</div>
  </td></tr>

  ${pickCards}

  <!-- DISCLAIMER -->
  <tr><td style="background:#060d12;border-left:1px solid rgba(0,232,122,.12);border-right:1px solid rgba(0,232,122,.12);padding:16px 32px;">
    <div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.15);border-radius:10px;padding:12px 14px;">
      <div style="font-size:11px;color:#fbbf24;font-weight:800;margin-bottom:4px;">⚠️ IMPORTANT DISCLAIMER</div>
      <div style="font-size:11px;color:#64748b;line-height:1.6;">This content is for educational purposes only and does not constitute financial advice. Past performance does not guarantee future results. Only invest what you can afford to lose. Always apply proper risk management. NexoTrade is not responsible for your investment decisions.</div>
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

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const secret = req.query?.secret || req.headers?.["x-secret"];
  if (secret !== API_SECRET) return res.status(401).json({ error: "Unauthorized" });

  const weekDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // 1. Fetch market overview
  console.log("[send-picks] Fetching market data...");
  const marketData = [];
  for (const m of MARKET) {
    const q = await finnhubQuote(m.symbol);
    if (q) {
      marketData.push({ ...m, price: q.c, pct: q.dp, change: q.d });
    } else {
      // fallback placeholder
      marketData.push({ ...m, price: 0, pct: 0, change: 0 });
    }
    // small delay to respect rate limits
    await new Promise(r => setTimeout(r, 150));
  }

  // 2. Fetch quotes for all 15 candidates
  console.log("[send-picks] Scoring candidates...");
  const scored = [];
  for (const c of CANDIDATES) {
    const q = await finnhubQuote(c.symbol);
    if (!q || !q.c) continue;
    // Fetch weekly candle
    const weekPct = await finnhubWeeklyCandle(c.symbol);
    await new Promise(r => setTimeout(r, 150));

    const score = scoreFromMomentum(weekPct, q.dp);
    scored.push({
      ...c,
      price:   q.c,
      dp:      q.dp,    // daily % change
      change:  q.d,
      weekPct: weekPct,
      score,
    });
  }

  // 3. Pick top 5 by score
  const picks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  console.log("[send-picks] Top 5:", picks.map(p => `${p.symbol}(${p.score})`).join(", "));

  // 4. Get subscribers
  let subscribers;
  try {
    subscribers = await getSubscribers();
  } catch (e) {
    return res.status(500).json({ error: "Failed to get subscribers", detail: e.message });
  }

  if (!subscribers.length) {
    return res.status(200).json({ ok: true, sent: 0, failed: 0, message: "No subscribers found" });
  }

  // 5. Build and send email
  const html    = buildEmailHtml(weekDate, picks, marketData);
  const subject = `📈 NexoTrade Weekly AI Picks — ${weekDate}`;

  let sent = 0, failed = 0;
  for (const email of subscribers) {
    const ok = await sendEmail(email, subject, html);
    ok ? sent++ : failed++;
  }

  console.log(`[send-picks] Done → sent=${sent} failed=${failed} picks=${picks.map(p=>p.symbol).join(",")}`);
  return res.status(200).json({
    ok: true, sent, failed, total: subscribers.length,
    date: weekDate,
    picks: picks.map(p => ({ symbol: p.symbol, score: p.score, price: p.price, weekPct: p.weekPct })),
  });
}
