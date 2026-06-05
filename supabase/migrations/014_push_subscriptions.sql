-- ============================================================
-- NEXO TRADE — Migración 014: suscripciones Web Push
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_subs_user_idx ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Cualquiera (incluso anónimo) puede suscribirse y borrar su propia suscripción por endpoint
DROP POLICY IF EXISTS "push_subs_insert" ON public.push_subscriptions;
CREATE POLICY "push_subs_insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "push_subs_delete" ON public.push_subscriptions;
CREATE POLICY "push_subs_delete" ON public.push_subscriptions
  FOR DELETE USING (TRUE);

-- Necesario para upsert por endpoint (re-suscripción del mismo navegador)
DROP POLICY IF EXISTS "push_subs_update" ON public.push_subscriptions;
CREATE POLICY "push_subs_update" ON public.push_subscriptions
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

-- Sin SELECT para anon/authenticated (privacidad). El service role lo lee para enviar.

-- Verificación
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='push_subscriptions';
