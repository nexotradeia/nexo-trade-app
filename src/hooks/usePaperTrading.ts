// ============================================================
// NEXO TRADE — Hook: usePaperTrading
// Lógica completa del simulador de paper trading
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface StockQuote {
  ticker:    string
  name:      string
  price:     number
  change:    number
  changePct: number
  open:      number
  high:      number
  low:       number
  prevClose: number
  volume:    number
  currency:  string
  exchange:  string
}

export interface PaperPosition {
  id:        string
  ticker:    string
  shares:    number
  avg_price: number
  created_at:string
}

export interface PaperTrade {
  id:         string
  ticker:     string
  type:       'buy' | 'sell'
  shares:     number
  price:      number
  total:      number
  pnl:        number | null
  pnl_pct:    number | null
  created_at: string
}

export interface PaperSummary {
  cash:           number
  starting_balance:number
  positions_cost: number
  open_positions: number
  total_trades:   number
  realized_pnl:   number
  winning_trades: number
  losing_trades:  number
}

export function usePaperTrading() {
  const { user } = useAuth()
  const [summary,   setSummary]   = useState<PaperSummary | null>(null)
  const [positions, setPositions] = useState<PaperPosition[]>([])
  const [trades,    setTrades]    = useState<PaperTrade[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Asegurar que existe la cuenta (auto-crear)
    const { data: existing } = await supabase
      .from('paper_trading_accounts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      await supabase
        .from('paper_trading_accounts')
        .insert({ user_id: user.id })
    }

    const [sumRes, posRes, tradeRes] = await Promise.all([
      supabase.from('paper_portfolio_summary').select('*').eq('user_id', user.id).single(),
      supabase.from('paper_positions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('paper_trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
    ])

    if (sumRes.data)    setSummary(sumRes.data as PaperSummary)
    if (posRes.data)    setPositions(posRes.data as PaperPosition[])
    if (tradeRes.data)  setTrades(tradeRes.data as PaperTrade[])
    setLoading(false)
  }, [user?.id])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Obtener precio de un ticker
  const getQuote = useCallback(async (ticker: string): Promise<StockQuote | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-stock-price', {
        body: null,
        headers: {},
        method: 'GET',
      })
      // Usar fetch directo para pasar query params
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-stock-price?ticker=${encodeURIComponent(ticker)}`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } }
      )
      if (!res.ok) return null
      return await res.json() as StockQuote
    } catch {
      return null
    }
  }, [])

  // Comprar
  const buy = useCallback(async (ticker: string, shares: number, price: number) => {
    if (!user) return { error: 'No autenticado' }
    const { data, error } = await supabase.rpc('paper_buy', {
      p_user_id: user.id,
      p_ticker:  ticker.toUpperCase(),
      p_shares:  shares,
      p_price:   price,
    })
    if (error) return { error: error.message }
    const result = data as any
    if (result?.error) return { error: result.error }
    await fetchAll()
    return { success: true, total: result.total }
  }, [user?.id, fetchAll])

  // Vender
  const sell = useCallback(async (ticker: string, shares: number, price: number) => {
    if (!user) return { error: 'No autenticado' }
    const { data, error } = await supabase.rpc('paper_sell', {
      p_user_id: user.id,
      p_ticker:  ticker.toUpperCase(),
      p_shares:  shares,
      p_price:   price,
    })
    if (error) return { error: error.message }
    const result = data as any
    if (result?.error) return { error: result.error }
    await fetchAll()
    return { success: true, total: result.total, pnl: result.pnl, pnl_pct: result.pnl_pct }
  }, [user?.id, fetchAll])

  // Resetear cuenta
  const resetAccount = useCallback(async () => {
    if (!user) return
    await supabase.from('paper_positions').delete().eq('user_id', user.id)
    await supabase.from('paper_trades').delete().eq('user_id', user.id)
    await supabase.from('paper_trading_accounts').update({
      balance: 10000, updated_at: new Date().toISOString()
    }).eq('user_id', user.id)
    await fetchAll()
  }, [user?.id, fetchAll])

  // Win rate calculado
  const winRate = summary && (summary.winning_trades + summary.losing_trades) > 0
    ? Math.round((summary.winning_trades / (summary.winning_trades + summary.losing_trades)) * 100)
    : 0

  // Portfolio total estimado (sin precios en tiempo real aquí)
  const totalValue = summary ? summary.cash + summary.positions_cost : 0
  const totalPnl   = summary ? totalValue - summary.starting_balance : 0
  const totalPnlPct= summary && summary.starting_balance > 0
    ? ((totalPnl / summary.starting_balance) * 100)
    : 0

  return {
    summary, positions, trades, loading, error,
    winRate, totalValue, totalPnl, totalPnlPct,
    getQuote, buy, sell, resetAccount, refresh: fetchAll,
  }
}
