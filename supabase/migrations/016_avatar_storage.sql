-- ============================================================
-- NEXO TRADE — Migración 016: Fotos de perfil (Supabase Storage)
-- Bucket público "avatars" + columna avatar_url en profiles
-- ============================================================

-- 1. Columna avatar_url en profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Bucket público "avatars" (2 MB máx, solo imágenes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = TRUE,
      file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

-- 3. Políticas RLS en storage.objects
-- Lectura pública
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Cada usuario solo escribe en su carpeta: avatars/<user_id>/...
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Verificación
SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'avatars';
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar_url';
