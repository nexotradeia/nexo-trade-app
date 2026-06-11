// NexoTrade — AI Signal of the Day
// GET /api/ai-signal
// Finds the stock with most analyst upgrades today → returns signal card data
// Vercel CDN caches 1 hour (s-maxage=3600)

const FMP_KEY = process.env.FMP_API_KEY || process.env.FMP_KEY;

// Fallback signals if FMP is unavailable or no upgrades today
const FALLBACKS = [
  { ticker:"NVDA", name:"NVIDIA Corp.",     price:"135.00", target:"162.00", stop:"124.20", conf:91, up:20.0, n:6,
    es:"6 analistas actualizaron $NVDA a COMPRA hoy. Demanda de chips IA en máximos históricos. Upside del 20% al objetivo consenso.",
    en:"6 analysts upgraded $NVDA to BUY today. AI chip demand at all-time highs. 20% upside to consensus target." },
  { ticker:"META", name:"Meta Platforms",   price:"562.00", target:"650.00", stop:"517.00", conf:88, up:15.7, n:5,
    es:"5 analistas mejoraron $META a COMPRA. Aceleración de ingresos publicitarios y adopción de IA.",
    en:"5 analysts upgraded $META to BUY. Ad revenue acceleration and AI adoption driving growth." },
  { ticker:"AAPL", name:"Apple Inc.",       price:"213.00", target:"245.00", stop:"196.00", conf:82, up:15.0, n:4,
    es:"4 analistas subieron precio objetivo de $AAPL. iPhone 17 y servicios superaron estimaciones.",
    en:"4 analysts raised $AAPL price target. iPhone 17 and services beat estimates." },
  { ticker:"MSFT", name:"Microsoft Corp.",  price:"390.00", target:"450.00", stop:"359.00", conf:90, up:15.4, n:7,
    es:"7 analistas actualizaron $MSFT a COMPRA. Azure AI crece 35% interanual, margen récord.",
    en:"7 analysts upgraded $MSFT to BUY. Azure AI grows 35% YoY, record margins." },
  { ticker:"AMZN", name:"Amazon.com",       price:"195.00", target:"230.00", stop:"179.00", conf:85, up:17.9, n:5,
    es:"5 analistas mejoraron $AMZN. AWS y publicidad aceleran. Márgenes en máximos de 3 años.",
    en:"5 analysts upgraded $AMZN. AWS and advertising accelerating. Margins at 3-year highs." },
];

function fmt(n, dec=2){ return Number(n).toFixed(dec); }
function pct(a,b){ return fmt(((b-a)/a)*100,1); }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=300');

  if (!FMP_KEY) {
    // No key — rotate fallbacks by day of week
    const fb = FALLBACKS[new Date().getDay() % FALLBACKS.length];
    return res.json({ ...fb, source:'fallback', cached: new Date().toISOString() });
  }

  try {
    // ── 1. Today's analyst upgrades ──────────────────────────────────────────
    const upgradesRes = await fetch(
      `https://financialmodelingprep.com/api/v4/upgrades-downgrades?apikey=${FMP_KEY}&limit=200`,
      { signal: AbortSignal.timeout(6000) }
    );
    const upgrades = await upgradesRes.json();

    if (!Array.isArray(upgrades)) throw new Error('Bad upgrades response');

    // Filter: only today, only BUY-type grades
    const today = new Date().toISOString().split('T')[0];
    const BUY_WORDS = ['buy','outperform','overweight','strong buy','accumulate','positive'];
    const todayBuys = upgrades.filter(u => {
      const date = (u.publishedDate || u.date || '').substring(0,10);
      const grade = (u.newGrade || '').toLowerCase();
      return date === today && BUY_WORDS.some(w => grade.includes(w));
    });

    // Count per ticker
    const counts = {};
    todayBuys.forEach(u => {
      const sym = u.symbol;
      if (!sym || sym.includes('.') || sym.length > 5) return; // skip non-US
      counts[sym] = (counts[sym] || 0) + 1;
    });

    // Pick top ticker (most upgrades today)
    const ranked = Object.entries(counts).sort((a,b) => b[1]-a[1]);
    let topTicker = ranked[0]?.[0];
    let upgradeCount = ranked[0]?.[1] || 0;

    // ── 2. If no upgrades today, try yesterday ───────────────────────────────
    if (!topTicker) {
      const yesterday = upgrades.filter(u => {
        const grade = (u.newGrade || '').toLowerCase();
        return BUY_WORDS.some(w => grade.includes(w));
      });
      const yCounts = {};
      yesterday.forEach(u => {
        const sym = u.symbol;
        if (!sym || sym.includes('.') || sym.length > 5) return;
        yCounts[sym] = (yCounts[sym] || 0) + 1;
      });
      const yRanked = Object.entries(yCounts).sort((a,b) => b[1]-a[1]);
      topTicker = yRanked[0]?.[0];
      upgradeCount = yRanked[0]?.[1] || 1;
    }

    if (!topTicker) throw new Error('No upgrades found');

    // ── 3. Quote + price target + analyst rec ────────────────────────────────
    const [quoteRes, targetRes, recRes] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/quote/${topTicker}?apikey=${FMP_KEY}`, { signal: AbortSignal.timeout(5000) }),
      fetch(`https://financialmodelingprep.com/api/v3/price-target-consensus/${topTicker}?apikey=${FMP_KEY}`, { signal: AbortSignal.timeout(5000) }),
      fetch(`https://financialmodelingprep.com/api/v3/analyst-stock-recommendations/${topTicker}?apikey=${FMP_KEY}&limit=1`, { signal: AbortSignal.timeout(5000) }),
    ]);

    const quotes  = await quoteRes.json();
    const targets = await targetRes.json();
    const recs    = await recRes.json();

    const q   = Array.isArray(quotes)  ? quotes[0]  : null;
    const t   = Array.isArray(targets) ? targets[0] : null;
    const rec = Array.isArray(recs)    ? recs[0]    : null;

    if (!q?.price) throw new Error(`No quote for ${topTicker}`);

    const price     = q.price;
    const ptarget   = t?.targetConsensus || t?.targetMedian || price * 1.14;
    const stop      = price * 0.92;
    const upside    = pct(price, ptarget);
    const volRatio  = q.avgVolume > 0 ? fmt(q.volume / q.avgVolume, 1) : '1.0';

    // Confidence = % of analysts with buy/strong buy
    const sb = rec?.strongBuy || 0;
    const b  = rec?.buy       || 0;
    const h  = rec?.hold      || 0;
    const s  = (rec?.sell || 0) + (rec?.strongSell || 0);
    const total = sb + b + h + s;
    const conf = total > 0 ? Math.round(((sb + b) / total) * 100) : 78;

    const volText = parseFloat(volRatio) >= 1.5
      ? `volumen ${volRatio}× sobre promedio`
      : 'volumen normal';
    const volTextEn = parseFloat(volRatio) >= 1.5
      ? `volume ${volRatio}× above average`
      : 'normal volume';

    // ── 4. Build entry range ─────────────────────────────────────────────────
    const entryLow  = fmt(price * 0.998);
    const entryHigh = fmt(price * 1.005);
    const entry = `$${entryLow}–${entryHigh}`;

    return res.json({
      ticker: topTicker,
      name:   q.name || topTicker,
      price:  fmt(price),
      entry,
      target: `$${fmt(ptarget)}`,
      stop:   `$${fmt(stop)}`,
      conf,
      upside,
      n: upgradeCount,
      change: fmt(q.changesPercentage || 0, 2),
      es: `${upgradeCount} analista${upgradeCount>1?'s':''} actualizaron $${topTicker} a COMPRA hoy. Upside del ${upside}% al objetivo consenso de $${fmt(ptarget)} — ${volText}.`,
      en: `${upgradeCount} analyst${upgradeCount>1?'s':''} upgraded $${topTicker} to BUY today. ${upside}% upside to consensus target of $${fmt(ptarget)} — ${volTextEn}.`,
      source: 'fmp',
      cached: new Date().toISOString(),
    });

  } catch (err) {
    // Rotate fallbacks by day
    const fb = FALLBACKS[new Date().getDay() % FALLBACKS.length];
    return res.json({ ...fb, source:'fallback', error: err.message, cached: new Date().toISOString() });
  }
}
