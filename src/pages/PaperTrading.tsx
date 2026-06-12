// ============================================================
// NEXO TRADE — Page: Paper Trading Simulator
// ============================================================
import { useState, useRef } from 'react'
import { usePaperTrading } from '../hooks/usePaperTrading'
import type { StockQuote } from '../hooks/usePaperTrading'
import { useLanguage } from '../context/LanguageContext'
import { postTimestamp } from '../lib/dateUtils'
import Logo from '../components/Logo'

const fmt = (n: number, dec = 2) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n)

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function PaperTrading() {
  const { theme } = useLanguage()
  const dark = theme === 'dark'
  const {
    summary, positions, trades, loading,
    winRate, totalValue, totalPnl, totalPnlPct,
    getQuote, buy, sell, resetAccount,
  } = usePaperTrading()

  const [tab,         setTab]         = useState<'portfolio' | 'trade' | 'history'>('portfolio')
  const [searchTicker,setSearchTicker]= useState('')
  const [quote,       setQuote]       = useState<StockQuote | null>(null)
  const [quoteLoading,setQuoteLoading]= useState(false)
  const [quoteError,  setQuoteError]  = useState<string | null>(null)
  const [tradeType,   setTradeType]   = useState<'buy' | 'sell'>('buy')
  const [sharesInput, setSharesInput] = useState('')
  const [tradeMsg,    setTradeMsg]    = useState<{ ok: boolean; text: string } | null>(null)
  const [tradeLoading,setTradeLoading]= useState(false)
  const [showReset,   setShowReset]   = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const c = {
    bg:       dark ? '#0B1020' : '#F0F4FF',
    surface:  dark ? '#131A2E' : '#FFFFFF',
    border:   dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text:     dark ? '#F0F4FF' : '#111827',
    muted:    dark ? '#7B8DB0' : '#6B7280',
    green:    '#00D26A',
    red:      '#EF4444',
    gold:     '#F59E0B',
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTicker.trim()) return
    setQuoteLoading(true)
    setQuoteError(null)
    setQuote(null)
    setTradeMsg(null)
    const q = await getQuote(searchTicker.trim())
    if (!q) setQuoteError(`"${searchTicker.toUpperCase()}" not found`)
    else setQuote(q)
    setQuoteLoading(false)
  }

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quote || !sharesInput) return
    const shares = parseFloat(sharesInput)
    if (isNaN(shares) || shares <= 0) { setTradeMsg({ ok: false, text: 'Invalid quantity' }); return }

    setTradeLoading(true)
    setTradeMsg(null)

    const res = tradeType === 'buy'
      ? await buy(quote.ticker, shares, quote.price)
      : await sell(quote.ticker, shares, quote.price)

    if ('error' in res && res.error) {
      setTradeMsg({ ok: false, text: res.error })
    } else {
      const total = fmtUSD((res as any).total ?? 0)
      if (tradeType === 'buy') {
        setTradeMsg({ ok: true, text: `✓ Bought ${shares} shares of ${quote.ticker} for ${total}` })
      } else {
        const pnl = (res as any).pnl ?? 0
        const sign = pnl >= 0 ? '+' : ''
        setTradeMsg({ ok: pnl >= 0, text: `✓ Sold ${shares} shares · P&L: ${sign}${fmtUSD(pnl)}` })
      }
      setSharesInput('')
    }
    setTradeLoading(false)
  }

  const position = quote ? positions.find(p => p.ticker === quote.ticker) : null

  // ── Common styles ──────────────────────────────────────
  const card: React.CSSProperties = {
    background: c.surface, border: `1px solid ${c.border}`,
    borderRadius: '16px', padding: '20px',
  }
  const statCard = (accent?: string): React.CSSProperties => ({
    background: accent ? `${accent}11` : c.surface,
    border: `1px solid ${accent ? accent + '33' : c.border}`,
    borderRadius: '14px', padding: '16px 20px',
  })
  const tabBtn = (active: boolean): React.CSSProperties => ({
    background: active ? (dark ? 'rgba(0,210,106,0.12)' : 'rgba(0,210,106,0.1)') : 'transparent',
    border: active ? '1px solid rgba(0,210,106,0.3)' : `1px solid transparent`,
    borderRadius: '10px', padding: '8px 18px',
    color: active ? c.green : c.muted,
    fontSize: '13px', fontWeight: active ? '700' : '400',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: '"Inter", sans-serif' }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${c.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Logo size="sm" />
          <div style={{ width: '1px', height: '24px', background: c.border }} />
          <span style={{ fontSize: '16px', fontWeight: '700', color: c.text }}>📊 Paper Trading</span>
          <span style={{ fontSize: '11px', background: 'rgba(0,210,106,0.1)', border: '1px solid rgba(0,210,106,0.2)', color: c.green, padding: '3px 10px', borderRadius: '100px', fontWeight: '600' }}>FREE</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['portfolio', 'trade', 'history'].map(t => (
            <button key={t} style={tabBtn(tab === t)} onClick={() => setTab(t as any)}>
              {t === 'portfolio' ? '💼 Portfolio' : t === 'trade' ? '🔄 Trade' : '📋 History'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>

        {/* ── STATS HEADER ── */}
        {!loading && summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
            <div style={statCard()}>
              <div style={{ fontSize: '11px', color: c.muted, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px' }}>TOTAL VALUE</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: c.text }}>{fmtUSD(totalValue)}</div>
            </div>
            <div style={statCard(totalPnl >= 0 ? c.green : c.red)}>
              <div style={{ fontSize: '11px', color: c.muted, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px' }}>TOTAL P&L</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: totalPnl >= 0 ? c.green : c.red }}>
                {totalPnl >= 0 ? '+' : ''}{fmtUSD(totalPnl)}
                <span style={{ fontSize: '13px', marginLeft: '6px' }}>({totalPnlPct >= 0 ? '+' : ''}{fmt(totalPnlPct)}%)</span>
              </div>
            </div>
            <div style={statCard()}>
              <div style={{ fontSize: '11px', color: c.muted, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px' }}>CASH</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: c.text }}>{fmtUSD(summary.cash)}</div>
            </div>
            <div style={statCard()}>
              <div style={{ fontSize: '11px', color: c.muted, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px' }}>WIN RATE</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: winRate >= 50 ? c.green : c.red }}>{winRate}%</div>
              <div style={{ fontSize: '11px', color: c.muted }}>{summary.winning_trades}W / {summary.losing_trades}L</div>
            </div>
            <div style={statCard()}>
              <div style={{ fontSize: '11px', color: c.muted, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px' }}>TRADES</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: c.text }}>{summary.total_trades}</div>
              <div style={{ fontSize: '11px', color: c.muted }}>{summary.open_positions} open position{summary.open_positions !== 1 ? 's' : ''}</div>
            </div>
          </div>
        )}

        {/* ── TAB: PORTFOLIO ── */}
        {tab === 'portfolio' && (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Open positions</h2>
              <button onClick={() => setShowReset(true)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: c.red, borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Reset account
              </button>
            </div>

            {positions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: c.muted }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <div style={{ fontSize: '15px', marginBottom: '8px' }}>No open positions</div>
                <div style={{ fontSize: '13px' }}>Go to "Trade" to buy your first stock</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    {['Ticker', 'Shares', 'Avg Price', 'Est. Value', 'Cost', 'Date'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: c.muted, fontWeight: '600', letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positions.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: c.green }}>{p.ticker}</span>
                      </td>
                      <td style={{ padding: '14px 12px', fontSize: '14px' }}>{fmt(p.shares, 4)}</td>
                      <td style={{ padding: '14px 12px', fontSize: '14px' }}>{fmtUSD(p.avg_price)}</td>
                      <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: '600' }}>{fmtUSD(p.shares * p.avg_price)}</td>
                      <td style={{ padding: '14px 12px', fontSize: '14px' }}>{fmtUSD(p.shares * p.avg_price)}</td>
                      <td style={{ padding: '14px 12px', fontSize: '12px', color: c.muted }}>
                        {postTimestamp(p.created_at, 'en').label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── TAB: TRADE ── */}
        {tab === 'trade' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Search */}
            <div style={card}>
              <h2 style={{ margin: '0 0 18px', fontSize: '16px', fontWeight: '700' }}>Search stock</h2>
              <form onSubmit={handleSearch}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    ref={searchRef}
                    value={searchTicker}
                    onChange={e => setSearchTicker(e.target.value.toUpperCase())}
                    placeholder="AAPL, TSLA, NVDA..."
                    style={{
                      flex: 1, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      border: `1px solid ${c.border}`, borderRadius: '10px',
                      padding: '10px 14px', color: c.text, fontSize: '14px',
                      fontFamily: 'inherit', outline: 'none',
                    }}
                  />
                  <button type="submit" disabled={quoteLoading} style={{
                    background: 'rgba(0,210,106,0.15)', border: '1px solid rgba(0,210,106,0.3)',
                    borderRadius: '10px', padding: '10px 18px', color: c.green,
                    fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {quoteLoading ? '...' : 'Search'}
                  </button>
                </div>
              </form>

              {quoteError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: c.red }}>
                  {quoteError}
                </div>
              )}

              {quote && (
                <div style={{ background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: c.green }}>{quote.ticker}</div>
                      <div style={{ fontSize: '12px', color: c.muted }}>{quote.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{fmtUSD(quote.price)}</div>
                      <div style={{ fontSize: '13px', color: quote.change >= 0 ? c.green : c.red, fontWeight: '600' }}>
                        {quote.change >= 0 ? '+' : ''}{fmt(quote.change)} ({quote.changePct >= 0 ? '+' : ''}{fmt(quote.changePct)}%)
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {[
                      ['Open', fmtUSD(quote.open)],
                      ['High', fmtUSD(quote.high)],
                      ['Low', fmtUSD(quote.low)],
                    ].map(([label, val]) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: c.muted, marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {position && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(0,210,106,0.08)', border: '1px solid rgba(0,210,106,0.2)', borderRadius: '8px', fontSize: '12px', color: c.green }}>
                      You hold {fmt(position.shares, 4)} shares · Avg {fmtUSD(position.avg_price)}
                    </div>
                  )}
                </div>
              )}

              {/* Suggested tickers */}
              {!quote && (
                <div>
                  <div style={{ fontSize: '11px', color: c.muted, marginBottom: '10px', fontWeight: '600' }}>POPULAR</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['AAPL','TSLA','NVDA','MSFT','AMZN','META','GOOGL','SPY','QQQ','BTC-USD'].map(t => (
                      <button key={t} onClick={() => { setSearchTicker(t); searchRef.current?.focus() }} style={{
                        background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${c.border}`, borderRadius: '8px',
                        padding: '5px 12px', fontSize: '12px', fontWeight: '600',
                        color: c.muted, cursor: 'pointer', fontFamily: 'inherit',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trade form */}
            <div style={card}>
              <h2 style={{ margin: '0 0 18px', fontSize: '16px', fontWeight: '700' }}>Execute trade</h2>

              {!quote ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: c.muted }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
                  <div>Search for a stock first</div>
                </div>
              ) : (
                <form onSubmit={handleTrade}>
                  {/* Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    {(['buy', 'sell'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setTradeType(t)} style={{
                        background: tradeType === t
                          ? t === 'buy' ? 'rgba(0,210,106,0.15)' : 'rgba(239,68,68,0.15)'
                          : 'transparent',
                        border: `1px solid ${tradeType === t ? (t === 'buy' ? 'rgba(0,210,106,0.4)' : 'rgba(239,68,68,0.4)') : c.border}`,
                        borderRadius: '10px', padding: '12px',
                        color: tradeType === t ? (t === 'buy' ? c.green : c.red) : c.muted,
                        fontSize: '14px', fontWeight: '700',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                        {t === 'buy' ? '📈 Buy' : '📉 Sell'}
                      </button>
                    ))}
                  </div>

                  {/* Quantity */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: c.muted, fontWeight: '600', display: 'block', marginBottom: '6px' }}>NUMBER OF SHARES</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={sharesInput}
                      onChange={e => setSharesInput(e.target.value)}
                      placeholder="e.g. 10"
                      style={{
                        width: '100%', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${c.border}`, borderRadius: '10px',
                        padding: '10px 14px', color: c.text, fontSize: '16px',
                        fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Summary */}
                  {sharesInput && parseFloat(sharesInput) > 0 && (
                    <div style={{ background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: c.muted }}>Current price</span>
                        <span style={{ fontWeight: '600' }}>{fmtUSD(quote.price)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', borderTop: `1px solid ${c.border}`, paddingTop: '8px' }}>
                        <span>Estimated total</span>
                        <span style={{ color: tradeType === 'buy' ? c.red : c.green }}>
                          {tradeType === 'buy' ? '-' : '+'}{fmtUSD(parseFloat(sharesInput) * quote.price)}
                        </span>
                      </div>
                      {summary && tradeType === 'buy' && (
                        <div style={{ fontSize: '11px', color: c.muted, marginTop: '4px' }}>
                          Available cash: {fmtUSD(summary.cash)}
                        </div>
                      )}
                    </div>
                  )}

                  {tradeMsg && (
                    <div style={{
                      background: tradeMsg.ok ? 'rgba(0,210,106,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${tradeMsg.ok ? 'rgba(0,210,106,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      borderRadius: '10px', padding: '10px 14px',
                      fontSize: '13px', color: tradeMsg.ok ? c.green : c.red,
                      marginBottom: '12px',
                    }}>
                      {tradeMsg.text}
                    </div>
                  )}

                  <button type="submit" disabled={tradeLoading || !sharesInput} style={{
                    width: '100%',
                    background: tradeType === 'buy'
                      ? 'linear-gradient(135deg, #00D26A, #00a855)'
                      : 'linear-gradient(135deg, #EF4444, #dc2626)',
                    border: 'none', borderRadius: '12px', padding: '14px',
                    color: '#fff', fontSize: '16px', fontWeight: '700',
                    cursor: 'pointer', fontFamily: 'inherit',
                    opacity: (!sharesInput || tradeLoading) ? 0.6 : 1,
                  }}>
                    {tradeLoading ? 'Processing...' : tradeType === 'buy' ? `Buy ${quote.ticker}` : `Sell ${quote.ticker}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: HISTORY ── */}
        {tab === 'history' && (
          <div style={card}>
            <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700' }}>Trade history</h2>
            {trades.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: c.muted }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <div>No trades yet</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    {['Type','Ticker','Shares','Price','Total','P&L','Date'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: c.muted, fontWeight: '600', letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map(t => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: t.type === 'buy' ? 'rgba(0,210,106,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${t.type === 'buy' ? 'rgba(0,210,106,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          color: t.type === 'buy' ? c.green : c.red,
                          borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: '700',
                        }}>{t.type === 'buy' ? 'BUY' : 'SELL'}</span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: '700', color: c.green }}>{t.ticker}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{fmt(t.shares, 4)}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{fmtUSD(t.price)}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600' }}>{fmtUSD(t.total)}</td>
                      <td style={{ padding: '12px' }}>
                        {t.pnl != null
                          ? <span style={{ color: t.pnl >= 0 ? c.green : c.red, fontWeight: '700', fontSize: '13px' }}>
                              {t.pnl >= 0 ? '+' : ''}{fmtUSD(t.pnl)} ({t.pnl_pct != null ? (t.pnl_pct >= 0 ? '+' : '') + fmt(t.pnl_pct) + '%' : ''})
                            </span>
                          : <span style={{ color: c.muted, fontSize: '12px' }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '12px', fontSize: '11px', color: c.muted }}>
                        {postTimestamp(t.created_at, 'en').label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Reset Modal */}
      {showReset && (
        <div onClick={() => setShowReset(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>Reset account</h3>
            <p style={{ color: c.muted, fontSize: '14px', margin: '0 0 24px' }}>This will close all your positions and clear your history. You'll start fresh with $10,000.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowReset(false)} style={{ flex: 1, background: 'transparent', border: `1px solid ${c.border}`, borderRadius: '10px', padding: '12px', color: c.muted, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={async () => { await resetAccount(); setShowReset(false) }} style={{ flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: c.red, cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>Yes, reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
