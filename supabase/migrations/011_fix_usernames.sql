-- ============================================================
-- NEXO TRADE — Migration 011: Fix usernames en posts
-- Causa del bug "Anónimo": posts sin username denormalizado
-- y posible falta de política SELECT en profiles
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- ============================================================


-- ============================================================
-- 1. PROFILES — política SELECT pública (para join desde posts)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver perfiles (necesario para el join posts→profiles)
DROP POLICY IF EXISTS "Perfiles visibles para todos" ON public.profiles;
CREATE POLICY "Perfiles visibles para todos"
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Solo el dueño puede actualizar su propio perfil
DROP POLICY IF EXISTS "Usuario actualiza su propio perfil" ON public.profiles;
CREATE POLICY "Usuario actualiza su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Solo el dueño puede insertar su propio perfil
DROP POLICY IF EXISTS "Usuario inserta su propio perfil" ON public.profiles;
CREATE POLICY "Usuario inserta su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 2. POSTS — columna user_name (fallback denormalizado)
-- ============================================================
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS posts_user_name_idx ON public.posts(user_name);


-- ============================================================
-- 3. BACKFILL — rellenar user_name desde profiles
-- ============================================================
UPDATE public.posts p
SET user_name = pr.username
FROM public.profiles pr
WHERE p.user_id = pr.id
  AND p.user_name IS NULL
  AND pr.username IS NOT NULL;


-- ============================================================
-- 4. TRIGGER — guarda user_name automáticamente al insertar
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_post_username()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_username TEXT;
BEGIN
  SELECT username INTO v_username
  FROM public.profiles
  WHERE id = NEW.user_id;

  NEW.user_name = COALESCE(v_username, 'Trader');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_username ON public.posts;
CREATE TRIGGER trg_post_username
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_post_username();


-- ============================================================
-- ✅ LISTO — Después de correr este SQL:
--   • Los posts siempre tendrán user_name (sin "Anónimo")
--   • Los nuevos posts auto-obtienen el username vía trigger
--   • Los posts viejos ya tienen el username backfilled
--   • El join profiles→posts funciona por la nueva política SELECT
-- ============================================================
