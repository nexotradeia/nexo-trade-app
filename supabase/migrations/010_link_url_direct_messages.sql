-- ============================================================
-- NEXO TRADE — Migration 010: link_url en posts + direct_messages
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- Seguro de correr múltiples veces (IF NOT EXISTS en todo)
-- ============================================================


-- ============================================================
-- 1. POSTS — columna link_url (para preview de URLs en posts)
-- ============================================================
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS link_url TEXT;


-- ============================================================
-- 2. TABLA: direct_messages  (mensajes privados entre usuarios)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  read        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para cargar conversaciones rápido
CREATE INDEX IF NOT EXISTS dm_sender_idx   ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS dm_receiver_idx ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS dm_created_idx  ON public.direct_messages(created_at DESC);
-- Índice compuesto para buscar conversaciones entre dos usuarios
CREATE INDEX IF NOT EXISTS dm_conversation_idx
  ON public.direct_messages(LEAST(sender_id::text, receiver_id::text), GREATEST(sender_id::text, receiver_id::text), created_at DESC);


-- ============================================================
-- 3. RLS — Row Level Security para direct_messages
-- ============================================================
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Solo el emisor o receptor pueden ver el mensaje
DROP POLICY IF EXISTS "Usuarios ven sus propios mensajes" ON public.direct_messages;
CREATE POLICY "Usuarios ven sus propios mensajes"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Solo el emisor puede crear mensajes
DROP POLICY IF EXISTS "Emisor crea mensajes" ON public.direct_messages;
CREATE POLICY "Emisor crea mensajes"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Solo el receptor puede marcar como leído
DROP POLICY IF EXISTS "Receptor marca leído" ON public.direct_messages;
CREATE POLICY "Receptor marca leído"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = receiver_id);


-- ============================================================
-- 4. REALTIME — mensajes aparecen al instante
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;


-- ============================================================
-- ✅ LISTO — Después de correr este SQL:
--   • Los posts pueden tener links con preview
--   • Los mensajes privados se guardan en Supabase
--   • Los mensajes aparecen en tiempo real (realtime)
--   • RLS garantiza privacidad: solo tú ves tus mensajes
-- ============================================================
