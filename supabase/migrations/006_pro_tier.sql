-- ============================================================
-- NEXO TRADE — Migration 006: Tier PRO $24.99/mes
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- ============================================================

-- ============================================================
-- 1. AÑADIR TIER 'pro' AL CHECK CONSTRAINT EN PROFILES
-- ============================================================
-- Primero eliminamos el check viejo (si existe) y creamos uno nuevo
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'vip', 'pro'));

-- ============================================================
-- 2. AÑADIR CAMPOS EXTRA PARA PRO
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_since      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_pro_subscription_id TEXT UNIQUE;

-- ============================================================
-- 3. FUNCIÓN: activar / desactivar PRO (desde webhook Stripe)
-- ============================================================
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

    -- Badge PRO dorado automático
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.badges WHERE slug IN ('verified_pro','early_adopter')
    ON CONFLICT DO NOTHING;
  ELSE
    -- Al bajar de PRO → vuelve a free (no a VIP automáticamente)
    UPDATE public.profiles SET
      subscription_tier = 'free',
      pro_expires_at    = NOW()
    WHERE id = p_user_id AND subscription_tier = 'pro';
  END IF;
END;
$$;

-- ============================================================
-- 4. ACTUALIZAR upsert_subscription PARA MANEJAR PRO
-- ============================================================
CREATE OR REPLACE FUNCTION public.upsert_subscription(
  p_user_id              UUID,
  p_stripe_sub_id        TEXT,
  p_stripe_customer_id   TEXT,
  p_stripe_price_id      TEXT,
  p_status               TEXT,
  p_period_start         TIMESTAMPTZ,
  p_period_end           TIMESTAMPTZ,
  p_canceled_at          TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  -- IDs de precio Stripe (actualizar cuando tengas los IDs reales)
  VIP_PRICE_ID TEXT := 'price_vip_placeholder';  -- ← reemplazar con price ID Stripe VIP
  PRO_PRICE_ID TEXT := 'price_pro_placeholder';  -- ← reemplazar con price ID Stripe PRO
BEGIN
  INSERT INTO public.subscriptions (
    user_id, stripe_subscription_id, stripe_customer_id,
    stripe_price_id, status, current_period_start, current_period_end, canceled_at
  ) VALUES (
    p_user_id, p_stripe_sub_id, p_stripe_customer_id,
    p_stripe_price_id, p_status, p_period_start, p_period_end, p_canceled_at
  )
  ON CONFLICT (stripe_subscription_id) DO UPDATE SET
    status               = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end   = EXCLUDED.current_period_end,
    canceled_at          = EXCLUDED.canceled_at,
    updated_at           = NOW();

  -- Actualizar stripe_customer_id en profiles
  UPDATE public.profiles
    SET stripe_customer_id = p_stripe_customer_id
  WHERE id = p_user_id AND stripe_customer_id IS NULL;

  -- Activar / desactivar según tier y estado
  IF p_status IN ('active', 'trialing') THEN
    IF p_stripe_price_id = PRO_PRICE_ID THEN
      PERFORM public.set_user_pro(p_user_id, TRUE, p_period_end);
    ELSE
      -- VIP (o cualquier otro precio → VIP por defecto)
      PERFORM public.set_user_vip(p_user_id, TRUE, p_period_end);
    END IF;
  ELSE
    -- Cancelado / vencido — bajar al tier correspondiente
    IF p_stripe_price_id = PRO_PRICE_ID THEN
      PERFORM public.set_user_pro(p_user_id, FALSE);
    ELSE
      PERFORM public.set_user_vip(p_user_id, FALSE);
    END IF;
  END IF;
END;
$$;

-- ============================================================
-- 5. VISTA ACTUALIZADA: user_profile_full con tier correcto
-- ============================================================
CREATE OR REPLACE VIEW public.user_profile_full
  WITH (security_invoker = TRUE)
AS
  SELECT
    p.*,
    -- tier efectivo (pro > vip > free)
    CASE
      WHEN p.subscription_tier = 'pro'
        AND (p.pro_expires_at IS NULL OR p.pro_expires_at > NOW()) THEN 'pro'
      WHEN p.subscription_tier IN ('vip','pro')
        AND (p.vip_expires_at IS NULL OR p.vip_expires_at > NOW()) THEN 'vip'
      ELSE 'free'
    END AS effective_tier,
    COALESCE(
      ARRAY_AGG(b.icon ORDER BY ub.earned_at) FILTER (WHERE b.id IS NOT NULL),
      '{}'::TEXT[]
    ) AS badge_icons,
    COALESCE(
      ARRAY_AGG(b.slug ORDER BY ub.earned_at) FILTER (WHERE b.id IS NOT NULL),
      '{}'::TEXT[]
    ) AS badge_slugs,
    (SELECT COUNT(*) FROM public.posts    WHERE user_id = p.id AND is_deleted = FALSE) AS post_count,
    (SELECT COUNT(*) FROM public.follows  WHERE following_id = p.id)                   AS follower_count,
    (SELECT COUNT(*) FROM public.follows  WHERE follower_id  = p.id)                   AS following_count,
    (SELECT COUNT(*) FROM public.stock_watchlist WHERE user_id = p.id)                 AS watchlist_count
  FROM public.profiles p
  LEFT JOIN public.user_badges ub ON ub.user_id = p.id
  LEFT JOIN public.badges b       ON b.id = ub.badge_id
  GROUP BY p.id;

-- ============================================================
-- 6. WEEKLY PICKS — ampliar acceso a tier PRO
-- ============================================================
-- Actualizar política existente (si ya existe 005)
DROP POLICY IF EXISTS "VIP puede ver picks" ON public.weekly_picks;
CREATE POLICY "VIP y PRO pueden ver picks"
  ON public.weekly_picks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND subscription_tier IN ('vip', 'pro')
    )
  );

-- ============================================================
-- FIN MIGRATION 006
-- ============================================================
