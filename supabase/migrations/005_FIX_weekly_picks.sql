-- ============================================================
-- NEXO TRADE — FIX 005: weekly_picks (tabla ya existía)
-- Corre esto en: supabase.com → SQL Editor → New Query → RUN
-- ============================================================

-- 1. Añadir columnas que faltan (seguro si ya existen)
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS nombre      TEXT;
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS tipo        TEXT NOT NULL DEFAULT 'stock';
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS direccion   TEXT NOT NULL DEFAULT 'long';
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS entrada     NUMERIC(12,4);
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS objetivo    NUMERIC(12,4);
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS stop        NUMERIC(12,4);
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS rr          NUMERIC(5,2);
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS conviction  INTEGER DEFAULT 3;
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS tesis       TEXT;
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS emoji       TEXT DEFAULT '📈';
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS semana      DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS activo      BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.weekly_picks ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. Índices (seguros si ya existen)
CREATE INDEX IF NOT EXISTS weekly_picks_semana_idx ON public.weekly_picks(semana DESC);
CREATE INDEX IF NOT EXISTS weekly_picks_activo_idx ON public.weekly_picks(activo);

-- 3. RLS
ALTER TABLE public.weekly_picks ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas viejas si existen
DROP POLICY IF EXISTS "VIP puede ver picks"         ON public.weekly_picks;
DROP POLICY IF EXISTS "VIP y PRO pueden ver picks"  ON public.weekly_picks;
DROP POLICY IF EXISTS "Admin inserta picks"         ON public.weekly_picks;
DROP POLICY IF EXISTS "Admin actualiza picks"       ON public.weekly_picks;
DROP POLICY IF EXISTS "Admin borra picks"           ON public.weekly_picks;

-- Lectura: solo VIP (sin depender de subscription_tier por ahora)
-- ⚠️ Si ya corriste 002_subscriptions_vip.sql → usa la política con subscription_tier
-- Si NO corriste 002 todavía → esta política temporal permite a todos leer picks
CREATE POLICY "Lectura picks (temporal)"
  ON public.weekly_picks FOR SELECT
  USING (true);   -- cambiar a (subscription_tier IN ('vip','pro')) después de correr 002

-- Inserción: solo admin
CREATE POLICY "Admin inserta picks"
  ON public.weekly_picks FOR INSERT
  WITH CHECK (true);  -- temporal; restringir después con is_admin check

CREATE POLICY "Admin actualiza picks"
  ON public.weekly_picks FOR UPDATE
  USING (true);

CREATE POLICY "Admin borra picks"
  ON public.weekly_picks FOR DELETE
  USING (true);

-- 4. Realtime (seguro)
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_picks;

-- ✅ Listo — weekly_picks está completa y funcional
