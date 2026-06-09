-- ============================================================
-- NEXO TRADE — Migración 022: alertas de precio en la nube
-- Permite que el emisor de Web Push (nexo_push_alert.py) evalúe
-- las alertas de cada usuario aunque la app esté CERRADA.
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_alerts (
  user_id    UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  alerts     JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

-- El dueño puede ver / crear / actualizar / borrar sus propias alertas
DROP POLICY IF EXISTS "user_alerts_select" ON public.user_alerts;
CREATE POLICY "user_alerts_select" ON public.user_alerts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_alerts_insert" ON public.user_alerts;
CREATE POLICY "user_alerts_insert" ON public.user_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_alerts_update" ON public.user_alerts;
CREATE POLICY "user_alerts_update" ON public.user_alerts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_alerts_delete" ON public.user_alerts;
CREATE POLICY "user_alerts_delete" ON public.user_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- NOTA: el emisor (nexo_push_alert.py) usa la SERVICE ROLE key, que ignora RLS
-- y puede leer todas las filas para enviar las notificaciones.

-- Verificación
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema='public' AND table_name='user_alerts';
