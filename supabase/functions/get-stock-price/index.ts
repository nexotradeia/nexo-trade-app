// ============================================================
// NEXO TRADE — Edge Function: get-stock-price
// Obtiene precio actual + info de cualquier ticker (Yahoo Finance)
// ============================================================
const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StockData {
  ticker:        string
  name:          string
  price:         number
  change:        number
  changePct:     number
  open:          number
  high:          number
  low:           number
  prevClose:     number
  volume:        number
  marketCap:     number | null
  currency:      string
  exchange:      string
  timestamp:     number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url    = new URL(req.url)
    const ticker = (url.searchParams.get('ticker') ?? '').toUpperCase().trim()

    if (!ticker) {
      return new Response(JSON.stringify({ error: 'ticker requerido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Yahoo Finance v8 API (sin auth, CORS libre desde servidor)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d&includePrePost=false`

    const resp = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexoTrade/1.0)',
        'Accept':     'application/json',
      }
    })

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Ticker '${ticker}' no encontrado` }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await resp.json()
    const result = data?.chart?.result?.[0]

    if (!result) {
      return new Response(JSON.stringify({ error: `No hay datos para '${ticker}'` }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const meta  = result.meta
    const price = meta.regularMarketPrice ?? meta.previousClose ?? 0
    const prev  = meta.previousClose ?? price
    const change    = parseFloat((price - prev).toFixed(4))
    const changePct = parseFloat(((change / prev) * 100).toFixed(4))

    const stock: StockData = {
      ticker:    meta.symbol,
      name:      meta.shortName ?? meta.longName ?? meta.symbol,
      price:     parseFloat(price.toFixed(4)),
      change,
      changePct,
      open:      meta.regularMarketOpen      ?? prev,
      high:      meta.regularMarketDayHigh   ?? price,
      low:       meta.regularMarketDayLow    ?? price,
      prevClose: prev,
      volume:    meta.regularMarketVolume    ?? 0,
      marketCap: meta.marketCap              ?? null,
      currency:  meta.currency               ?? 'USD',
      exchange:  meta.exchangeName           ?? meta.fullExchangeName ?? '',
      timestamp: meta.regularMarketTime      ?? Date.now() / 1000,
    }

    return new Response(JSON.stringify(stock), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'max-age=15' }
    })

  } catch (err) {
    console.error('get-stock-price error:', err)
    return new Response(JSON.stringify({ error: 'Error obteniendo precio' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
