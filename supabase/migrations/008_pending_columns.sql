-- ============================================================
-- NEXO TRADE — Migration 008: Columnas y tablas pendientes
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- Todas las sentencias son seguras (IF NOT EXISTS / IF NOT EXISTS)
-- ============================================================


-- ============================================================
-- 1. POSTS — columna image_url (para imágenes en posts)
-- ============================================================
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS image_url TEXT;


-- ============================================================
-- 2. PROFILES — columna hide_from_leaderboard (privacidad)
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hide_from_leaderboard BOOLEAN NOT NULL DEFAULT FALSE;


-- ============================================================
-- 3. TABLA: follows  (sistema de seguidores)
-- (Si ya existe no hace nada)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_idx  ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cualquiera puede ver follows" ON public.follows;
CREATE POLICY "Cualquiera puede ver follows"
  ON public.follows FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Usuario gestiona sus propios follows" ON public.follows;
CREATE POLICY "Usuario gestiona sus propios follows"
  ON public.follows FOR ALL USING (auth.uid() = follower_id);


-- ============================================================
-- 4. TABLA: job_listings  (bolsa de trabajo)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_listings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  location    TEXT,
  type        TEXT,        -- full-time | part-time | freelance | remote
  salary      TEXT,
  description TEXT,
  tags        TEXT[],      -- array de etiquetas
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_listings_user_idx    ON public.job_listings(user_id);
CREATE INDEX IF NOT EXISTS job_listings_active_idx  ON public.job_listings(active);
CREATE INDEX IF NOT EXISTS job_listings_created_idx ON public.job_listings(created_at DESC);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cualquiera puede ver trabajos activos" ON public.job_listings;
CREATE POLICY "Cualquiera puede ver trabajos activos"
  ON public.job_listings FOR SELECT USING (active = TRUE);

DROP POLICY IF EXISTS "Usuario gestiona sus propias ofertas" ON public.job_listings;
CREATE POLICY "Usuario gestiona sus propias ofertas"
  ON public.job_listings FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- ✅ LISTO — Pega este SQL completo en Supabase SQL Editor
-- y presiona RUN. Puedes correrlo múltiples veces sin problema.
-- ============================================================
