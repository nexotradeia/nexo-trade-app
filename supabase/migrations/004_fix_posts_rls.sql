-- ═══════════════════════════════════════════════════════════
-- NEXO TRADE — Fix RLS: Todos pueden leer posts públicamente
-- Corre esto en: supabase.com → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- 1. Asegura que RLS está activado en posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 2. Elimina políticas viejas si existen
DROP POLICY IF EXISTS "Posts visibles para todos" ON posts;
DROP POLICY IF EXISTS "Usuarios pueden crear sus posts" ON posts;
DROP POLICY IF EXISTS "Usuarios pueden editar sus posts" ON posts;
DROP POLICY IF EXISTS "public_read_posts" ON posts;
DROP POLICY IF EXISTS "authenticated_insert_posts" ON posts;

-- 3. LECTURA: cualquier persona (con o sin cuenta) puede ver todos los posts
CREATE POLICY "Posts visibles para todos"
  ON posts FOR SELECT
  USING (true);

-- 4. ESCRITURA: solo usuarios autenticados pueden crear posts
CREATE POLICY "Usuarios pueden crear sus posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. ACTUALIZACIÓN: solo el autor puede editar (likes etc los maneja el sistema)
CREATE POLICY "Usuarios pueden editar sus posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. También fix para profiles (para que se vean los avatares y nombres)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles visibles para todos" ON profiles;
CREATE POLICY "Profiles visibles para todos"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Usuarios editan su perfil" ON profiles;
CREATE POLICY "Usuarios editan su perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Listo ✅ — Los posts ahora son visibles para todos los usuarios
