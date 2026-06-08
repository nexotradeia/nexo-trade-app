-- ============================================================
-- NEXO TRADE — Migración 020: Watchlist en la nube (sincronizada)
-- Guarda la watchlist de cada usuario en su cuenta para que la
-- vea en CUALQUIER dispositivo donde inicie sesión.
--
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- Idempotente (IF NOT EXISTS). No destructivo.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_watchlists (
  user_id    UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  tickers    JSONB NOT NULL DEFAULT '[]'::jsonb,   -- ej. ["AAPL","NVDA","BTC"]
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_watchlists ENABLE ROW LEVEL SECURITY;

-- Cada usuario SOLO puede ver su propia watchlist
DROP POLICY IF EXISTS "uw_select_own" ON public.user_watchlists;
CREATE POLICY "uw_select_own" ON public.user_watchlists
  FOR SELECT USING (auth.uid() = user_id);

-- Crear su propia fila
DROP POLICY IF EXISTS "uw_insert_own" ON public.user_watchlists;
CREATE POLICY "uw_insert_own" ON public.user_watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Actualizar su propia fila (necesario para el upsert)
DROP POLICY IF EXISTS "uw_update_own" ON public.user_watchlists;
CREATE POLICY "uw_update_own" ON public.user_watchlists
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Borrar su propia fila
DROP POLICY IF EXISTS "uw_delete_own" ON public.user_watchlists;
CREATE POLICY "uw_delete_own" ON public.user_watchlists
  FOR DELETE USING (auth.uid() = user_id);

-- Verificación (debe devolver la tabla y sus columnas)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='user_watchlists'
ORDER BY ordinal_position;
