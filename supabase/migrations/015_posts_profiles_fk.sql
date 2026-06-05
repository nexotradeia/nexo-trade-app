-- ============================================================
-- NEXO TRADE — Migración 015 (Sesión 12): join feed posts→profiles
-- Hallazgo: el FK posts_user_id_fkey YA existía apuntando a profiles,
-- pero el caché de PostgREST estaba desactualizado → 400 en el join
-- y doble query en cada carga del feed.
-- Fix aplicado:
--   1. NOTIFY pgrst, 'reload schema';  (recarga el caché)
--   2. App.jsx usa hint explícito: profiles!posts_user_id_fkey(...)
-- (Se creó y luego eliminó un FK duplicado posts_user_id_profiles_fkey
--  que causaba ambigüedad PGRST201.)
-- ============================================================

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_profiles_fkey;
NOTIFY pgrst, 'reload schema';

-- Verificación: debe quedar solo posts_user_id_fkey
SELECT conname, confrelid::regclass AS referencia
FROM pg_constraint
WHERE conrelid = 'public.posts'::regclass AND contype = 'f';
