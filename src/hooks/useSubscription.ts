// ============================================================
// NEXO TRADE — Hook: useSubscription
// Estado de suscripción VIP del usuario actual
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface SubscriptionState {
  tier: 'free' | 'vip'
  isVip: boolean
  isFree: boolean
  vipSince: string | null
  vipExpiresAt: string | null
  stripeCustomerId: string | null
  loading: boolean
  // Límites según tier
  watchlistLimit: number | null   // null = ilimitado
  canPostGifs: boolean
  canCreateBattles: boolean
}

const FREE_LIMITS = {
  watchlistLimit: 5,
  canPostGifs: false,
  canCreateBattles: false,
}

const VIP_LIMITS = {
  watchlistLimit: null,   // ilimitado
  canPostGifs: true,
  canCreateBattles: true,
}

export function useSubscription(): SubscriptionState & { refresh: () => Promise<void> } {
  const { user } = useAuth()
  const [state, setState] = useState<SubscriptionState>({
    tier: 'free',
    isVip: false,
    isFree: true,
    vipSince: null,
    vipExpiresAt: null,
    stripeCustomerId: null,
    loading: true,
    ...FREE_LIMITS,
  })

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, vip_since, vip_expires_at, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    const isVip = data.subscription_tier === 'vip'
    const limits = isVip ? VIP_LIMITS : FREE_LIMITS

    setState({
      tier: data.subscription_tier as 'free' | 'vip',
      isVip,
      isFree: !isVip,
      vipSince: data.vip_since,
      vipExpiresAt: data.vip_expires_at,
      stripeCustomerId: data.stripe_customer_id,
      loading: false,
      ...limits,
    })
  }, [user?.id])

  useEffect(() => {
    fetchSubscription()

    // Escuchar cambios en tiempo real del tier
    if (!user) return

    const channel = supabase
      .channel(`profile-tier-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        const updated = payload.new as any
        const isVip = updated.subscription_tier === 'vip'
        const limits = isVip ? VIP_LIMITS : FREE_LIMITS
        setState(prev => ({
          ...prev,
          tier: updated.subscription_tier,
          isVip,
          isFree: !isVip,
          vipSince: updated.vip_since,
          vipExpiresAt: updated.vip_expires_at,
          ...limits,
        }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, fetchSubscription])

  return { ...state, refresh: fetchSubscription }
}


// ============================================================
// Hook para iniciar el flujo de pago Stripe
// ============================================================
export function useStripeCheckout() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const startCheckout = useCallback(async (priceId: string) => {
    if (!session) return
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          price_id:    priceId,
          success_url: `${window.location.origin}/dashboard?vip=success`,
          cancel_url:  `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar el pago')
    } finally {
      setLoading(false)
    }
  }, [session])

  return { startCheckout, loading, error }
}
