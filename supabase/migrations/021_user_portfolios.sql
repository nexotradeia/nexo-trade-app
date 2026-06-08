-- ============================================================
-- NEXO TRADE — Migración 021: Portafolio en la nube (Portfolio Oracle AI)
-- Guarda las posiciones de cada usuario (ticker, acciones, precio de
-- entrada, notas) en su cuenta para verlas en CUALQUIER dispositivo.
--
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- Idempotente (IF NOT EXISTS). No destructivo.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_portfolios (
  user_id    UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  positions  JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{id,ticker,shares,entryPrice,note,addedAt}]
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "up_select_own" ON public.user_portfolios;
CREATE POLICY "up_select_own" ON public.user_portfolios
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "up_insert_own" ON public.user_portfolios;
CREATE POLICY "up_insert_own" ON public.user_portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "up_update_own" ON public.user_portfolios;
CREATE POLICY "up_update_own" ON public.user_portfolios
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "up_delete_own" ON public.user_portfolios;
CREATE POLICY "up_delete_own" ON public.user_portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Verificación
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='user_portfolios'
ORDER BY ordinal_position;
