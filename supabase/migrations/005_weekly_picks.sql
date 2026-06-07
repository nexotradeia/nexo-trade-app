-- ============================================================
-- NEXO TRADE — Migration 005: Tabla weekly_picks (VIP picks)
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- ============================================================

-- ============================================================
-- 1. TABLA: weekly_picks (picks semanales VIP del admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weekly_picks (
  id          SERIAL PRIMARY KEY,
  ticker      TEXT        NOT NULL,
  nombre      TEXT,                        -- nombre de la empresa/activo
  tipo        TEXT        NOT NULL DEFAULT 'stock'  -- 'stock' | 'crypto' | 'etf' | 'forex'
              CHECK (tipo IN ('stock','crypto','etf','forex')),
  direccion   TEXT        NOT NULL DEFAULT 'long'   -- 'long' | 'short'
              CHECK (direccion IN ('long','short')),
  entrada     NUMERIC(12,4),               -- precio de entrada sugerido
  objetivo    NUMERIC(12,4),               -- precio objetivo (take profit)
  stop        NUMERIC(12,4),               -- stop loss sugerido
  rr          NUMERIC(5,2),                -- ratio riesgo/recompensa
  conviction  INTEGER     DEFAULT 3        -- 1-5 estrellas
              CHECK (conviction BETWEEN 1 AND 5),
  tesis       TEXT,                        -- análisis / tesis de inversión
  emoji       TEXT        DEFAULT '📈',
  semana      DATE        NOT NULL DEFAULT CURRENT_DATE,  -- semana del pick
  activo      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS weekly_picks_semana_idx ON public.weekly_picks(semana DESC);
CREATE INDEX IF NOT EXISTS weekly_picks_activo_idx ON public.weekly_picks(activo);

-- ============================================================
-- 2. RLS — Solo usuarios VIP pueden leer picks
-- ============================================================
ALTER TABLE public.weekly_picks ENABLE ROW LEVEL SECURITY;

-- Lectura: solo usuarios VIP (o PRO)
DROP POLICY IF EXISTS "VIP puede ver picks" ON public.weekly_picks;
CREATE POLICY "VIP puede ver picks"
  ON public.weekly_picks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND subscription_tier IN ('vip', 'pro')
    )
  );

-- Admin puede insertar (service_role bypasses RLS automáticamente)
-- Para insertar desde el Admin Panel en App: usar service role o función SECURITY DEFINER
DROP POLICY IF EXISTS "Admin inserta picks" ON public.weekly_picks;
CREATE POLICY "Admin inserta picks"
  ON public.weekly_picks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_admin = TRUE
    )
  );

-- Admin puede actualizar/borrar picks
DROP POLICY IF EXISTS "Admin actualiza picks" ON public.weekly_picks;
CREATE POLICY "Admin actualiza picks"
  ON public.weekly_picks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "Admin borra picks" ON public.weekly_picks;
CREATE POLICY "Admin borra picks"
  ON public.weekly_picks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_admin = TRUE
    )
  );

-- ============================================================
-- 3. FUNCIÓN: insertar pick (para llamar desde el Admin Panel)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_insert_weekly_pick(
  p_ticker      TEXT,
  p_nombre      TEXT      DEFAULT NULL,
  p_tipo        TEXT      DEFAULT 'stock',
  p_direccion   TEXT      DEFAULT 'long',
  p_entrada     NUMERIC   DEFAULT NULL,
  p_objetivo    NUMERIC   DEFAULT NULL,
  p_stop        NUMERIC   DEFAULT NULL,
  p_rr          NUMERIC   DEFAULT NULL,
  p_conviction  INTEGER   DEFAULT 3,
  p_tesis       TEXT      DEFAULT NULL,
  p_emoji       TEXT      DEFAULT '📈',
  p_semana      DATE      DEFAULT CURRENT_DATE
)
RETURNS public.weekly_picks
LANGUAGE plpgsql
SECURITY DEFINER  -- corre como el dueño de la función (bypassa RLS)
AS $$
DECLARE
  v_row public.weekly_picks;
BEGIN
  -- Solo admin puede llamar esta función
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Solo el admin puede insertar picks.';
  END IF;

  INSERT INTO public.weekly_picks
    (ticker, nombre, tipo, direccion, entrada, objetivo, stop, rr, conviction, tesis, emoji, semana)
  VALUES
    (UPPER(p_ticker), p_nombre, p_tipo, p_direccion, p_entrada, p_objetivo, p_stop, p_rr, p_conviction, p_tesis, p_emoji, p_semana)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ============================================================
-- 4. HABILITAR REALTIME en weekly_picks
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_picks;

-- ============================================================
-- 5. DATOS DE EJEMPLO (comentados — descomentar si quieres)
-- ============================================================
/*
INSERT INTO public.weekly_picks (ticker, nombre, tipo, direccion, entrada, objetivo, stop, rr, conviction, tesis, emoji, semana) VALUES
('NVDA', 'NVIDIA Corporation',  'stock',  'long',  900, 980, 870, 2.67, 5, 'Momentum AI sigue fuerte. Catalista: earnings Q2 el 28 May. Soporte en 900 probado 2 veces esta semana.', '🟢', CURRENT_DATE),
('BTC',  'Bitcoin',             'crypto', 'long',  67000, 72000, 63000, 1.25, 4, 'Halving completado. ETF flows positivos. Objetivo siguiente resistencia en 72K.', '₿', CURRENT_DATE),
('SPY',  'S&P 500 ETF',        'etf',    'long',  520, 535, 510, 1.5, 3, 'Temporada de earnings positiva. Fed en pausa. Bias alcista mientras sostenga 520.', '📊', CURRENT_DATE);
*/

-- ============================================================
-- FIN MIGRATION 005
-- ============================================================
