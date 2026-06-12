// ============================================================
// NEXO TRADE — Hook: useUserData
// Datos completos del usuario autenticado (perfil + badges + stats)
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface UserProfile {
  id:                string
  username:          string
  display_name:      string | null
  avatar_url:        string | null
  bio:               string | null
  points:            number
  level:             number
  lang:              string
  theme:             string
  subscription_tier: 'free' | 'vip'
  vip_since:         string | null
  vip_expires_at:    string | null
  stripe_customer_id:string | null
  created_at:        string
  // Stats (desde vista user_profile_full)
  badge_icons:       string[]
  badge_slugs:       string[]
  post_count:        number
  follower_count:    number
  following_count:   number
  watchlist_count:   number
}

interface UseUserDataResult {
  profile:       UserProfile | null
  loading:       boolean
  error:         string | null
  refresh:       () => Promise<void>
  updateProfile: (updates: Partial<Pick<UserProfile, 'username' | 'display_name' | 'bio' | 'avatar_url' | 'lang' | 'theme'>>) => Promise<{ error: string | null }>
}

export function useUserData(): UseUserDataResult {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('user_profile_full')
      .select('*')
      .eq('id', user.id)
      .single()

    if (err) {
      // Fallback a profiles básico si la vista falla
      const { data: basic, error: basicErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (basicErr) { setError(basicErr.message); setLoading(false); return }
      setProfile({ ...basic, badge_icons: [], badge_slugs: [], post_count: 0, follower_count: 0, following_count: 0, watchlist_count: 0 } as UserProfile)
    } else {
      setProfile(data as UserProfile)
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchProfile()

    if (!user) return

    // Escuchar actualizaciones en tiempo real del perfil propio
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'profiles',
        filter: `id=eq.${user.id}`,
      }, () => { fetchProfile() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, fetchProfile])

  const updateProfile = useCallback(async (
    updates: Partial<Pick<UserProfile, 'username' | 'display_name' | 'bio' | 'avatar_url' | 'lang' | 'theme'>>
  ) => {
    if (!user) return { error: 'No autenticado' }

    const { error: err } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (err) return { error: err.message }
    await fetchProfile()
    return { error: null }
  }, [user?.id, fetchProfile])

  return { profile, loading, error, refresh: fetchProfile, updateProfile }
}


// ============================================================
// Hook para obtener el perfil de cualquier usuario por username
// ============================================================
export function usePublicProfile(username: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!username) return
    setLoading(true)

    supabase
      .from('user_profile_full')
      .select('*')
      .eq('username', username)
      .single()
      .then(({ data }) => {
        setProfile(data as UserProfile ?? null)
        setLoading(false)
      })
  }, [username])

  return { profile, loading }
}
