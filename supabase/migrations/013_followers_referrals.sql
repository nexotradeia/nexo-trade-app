-- ============================================================
-- NEXO TRADE — Migración 013: followers_count + referred_by
-- Arregla los errores 400 en queries de perfiles y referidos
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- Todas las sentencias son idempotentes (IF NOT EXISTS)
-- ============================================================

-- 1. PROFILES — columna followers_count (contador denormalizado)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS followers_count INTEGER NOT NULL DEFAULT 0;

-- 2. PROFILES — columnas de referidos (por si la 009 no se aplicó)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS profiles_referred_by_idx ON public.profiles(referred_by);

-- 3. Backfill: poblar followers_count desde la tabla follows
UPDATE public.profiles p
SET followers_count = COALESCE(f.cnt, 0)
FROM (
  SELECT following_id, COUNT(*) AS cnt
  FROM public.follows
  GROUP BY following_id
) f
WHERE f.following_id = p.id;

-- 4. Trigger: mantener followers_count sincronizado automáticamente
CREATE OR REPLACE FUNCTION public.sync_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_followers_count ON public.follows;
CREATE TRIGGER trg_sync_followers_count
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.sync_followers_count();

-- 5. Verificación
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('followers_count','referral_code','referred_by','referral_count');
