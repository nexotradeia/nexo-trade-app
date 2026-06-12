// ============================================================
// NEXO TRADE — Hook: useRealtime
// Suscripción en tiempo real a posts, likes y comentarios
// ============================================================
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions {
  table: string
  schema?: string
  event?: RealtimeEvent
  filter?: string          // ej: 'post_id=eq.abc123'
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  onChange?: (payload: any) => void
}

export function useRealtime({
  table,
  schema = 'public',
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channelName = filter
      ? `realtime:${schema}:${table}:${filter}`
      : `realtime:${schema}:${table}`

    const config: any = {
      event,
      schema,
      table,
    }
    if (filter) config.filter = filter

    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', config, (payload: any) => {
        onChange?.(payload)
        if (payload.eventType === 'INSERT') onInsert?.(payload)
        if (payload.eventType === 'UPDATE') onUpdate?.(payload)
        if (payload.eventType === 'DELETE') onDelete?.(payload)
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, schema, event, filter])
}


// ============================================================
// Hook especializado para el Feed en tiempo real
// ============================================================
import { useState, useCallback } from 'react'

export interface Post {
  id: string
  user_id: string
  content: string | null
  gif_url: string | null
  ticker: string | null
  likes_count: number
  comments_count: number
  created_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
    subscription_tier: string
  }
}

interface UseFeedRealtimeResult {
  posts: Post[]
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  newPostsCount: number
  loadNewPosts: () => void
}

export function useFeedRealtime(initialPosts: Post[]): UseFeedRealtimeResult {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])

  // Escuchar nuevos posts en tiempo real
  useRealtime({
    table: 'posts',
    event: 'INSERT',
    onInsert: async (payload) => {
      // Obtener datos del autor
      const { data } = await supabase
        .from('posts')
        .select(`*, profiles(username, display_name, avatar_url, subscription_tier)`)
        .eq('id', payload.new.id)
        .single()

      if (data) {
        setPendingPosts(prev => [data as Post, ...prev])
      }
    },
  })

  // Actualizar likes en tiempo real
  useRealtime({
    table: 'post_likes',
    onInsert: (payload) => {
      setPosts(prev => prev.map(p =>
        p.id === payload.new.post_id
          ? { ...p, likes_count: p.likes_count + 1 }
          : p
      ))
    },
    onDelete: (payload) => {
      setPosts(prev => prev.map(p =>
        p.id === payload.old.post_id
          ? { ...p, likes_count: Math.max(0, p.likes_count - 1) }
          : p
      ))
    },
  })

  // Actualizar comentarios en tiempo real
  useRealtime({
    table: 'post_comments',
    onInsert: (payload) => {
      setPosts(prev => prev.map(p =>
        p.id === payload.new.post_id
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ))
    },
  })

  const loadNewPosts = useCallback(() => {
    setPosts(prev => [...pendingPosts, ...prev])
    setPendingPosts([])
  }, [pendingPosts])

  return {
    posts,
    setPosts,
    newPostsCount: pendingPosts.length,
    loadNewPosts,
  }
}
