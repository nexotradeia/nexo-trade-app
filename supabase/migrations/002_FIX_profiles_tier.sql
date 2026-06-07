-- ============================================================
-- NEXO TRADE — FIX 002: Añadir subscription_tier a profiles
-- Corre esto PRIMERO, antes de 006_pro_tier.sql
-- supabase.com → SQL Editor → New Query → RUN
-- ============================================================

-- 1. Añadir columnas VIP a profiles (seguro si ya existen)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier  TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS vip_since          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vip_expires_at     TIMESTAMPTZ;

-- 2. Añadir constraint (solo si no existe ya)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'profiles'
      AND constraint_name = 'profiles_subscription_tier_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_subscription_tier_check
      CHECK (subscription_tier IN ('free', 'vip', 'pro'));
  END IF;
END $$;

-- 3. Índice
CREATE INDEX IF NOT EXISTS profiles_tier_idx ON public.profiles(subscription_tier);

-- 4. Tabla subscriptions (historial de pagos)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id     TEXT NOT NULL,
  stripe_price_id        TEXT NOT NULL,
  status                 TEXT NOT NULL,
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  canceled_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve sus propias suscripciones" ON public.subscriptions;
CREATE POLICY "Usuario ve sus propias suscripciones"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 5. Función set_user_vip
CREATE OR REPLACE FUNCTION public.set_user_vip(
  p_user_id       UUID,
  p_active        BOOLEAN,
  p_expires_at    TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_active THEN
    UPDATE public.profiles SET
      subscription_tier = 'vip',
      vip_since         = COALESCE(vip_since, NOW()),
      vip_expires_at    = p_expires_at
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles SET
      subscription_tier = 'free',
      vip_expires_at    = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- ✅ Listo — profiles tiene subscription_tier
-- Ahora puedes correr 006_pro_tier.sql
