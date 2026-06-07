-- ============================================================
-- NEXO TRADE — FIX 006: Tier PRO $24.99
-- ⚠️ CORRER DESPUÉS de 002_FIX_profiles_tier.sql
-- supabase.com → SQL Editor → New Query → RUN
-- ============================================================

-- 1. Actualizar constraint para incluir 'pro'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'vip', 'pro'));

-- 2. Columnas adicionales para PRO
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_since      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_pro_subscription_id TEXT;

-- 3. Función set_user_pro
CREATE OR REPLACE FUNCTION public.set_user_pro(
  p_user_id    UUID,
  p_active     BOOLEAN,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_active THEN
    UPDATE public.profiles SET
      subscription_tier = 'pro',
      pro_since         = COALESCE(pro_since, NOW()),
      pro_expires_at    = p_expires_at
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles SET
      subscription_tier = 'free',
      pro_expires_at    = NOW()
    WHERE id = p_user_id
      AND subscription_tier = 'pro';
  END IF;
END;
$$;

-- 4. Actualizar RLS de weekly_picks para restringir a VIP/PRO
DROP POLICY IF EXISTS "Lectura picks (temporal)"   ON public.weekly_picks;
DROP POLICY IF EXISTS "VIP puede ver picks"         ON public.weekly_picks;
DROP POLICY IF EXISTS "VIP y PRO pueden ver picks"  ON public.weekly_picks;

CREATE POLICY "VIP y PRO pueden ver picks"
  ON public.weekly_picks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND subscription_tier IN ('vip', 'pro')
    )
  );

-- ✅ Listo — tier PRO activo
