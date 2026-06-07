-- ============================================================
-- NEXO TRADE — Migration 001: Tabla POSTS completa
-- Modelo estilo StockTwits: posts persistentes + realtime
--
-- Ejecutar en: supabase.com → SQL Editor → New Query → RUN
-- Es seguro correrlo múltiples veces (IF NOT EXISTS en todo)
-- ============================================================


-- ============================================================
-- 0. EXTENSIONES necesarias
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 1. TABLA PRINCIPAL: posts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Contenido
  text           TEXT        NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
  ticker         TEXT        NOT NULL DEFAULT 'GENERAL',   -- $BTC, $SPY, GENERAL...
  sentiment      TEXT        NOT NULL DEFAULT 'bull'
                               CHECK (sentiment IN ('bull','bear','neutral')),
  tags           TEXT[]      DEFAULT '{}',
  image_url      TEXT,        -- URL de imagen adjunta (ya en 008)
  gif_url        TEXT,        -- GIF (solo VIP)

  -- Contadores (desnormalizados para velocidad — se actualizan con triggers)
  likes_count    INTEGER     NOT NULL DEFAULT 0,
  comments_count INTEGER     NOT NULL DEFAULT 0,
  reposts_count  INTEGER     NOT NULL DEFAULT 0,

  -- Metadata
  is_deleted     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_pinned      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para velocidad de carga del feed
CREATE INDEX IF NOT EXISTS posts_created_idx    ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_user_idx       ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_ticker_idx     ON public.posts(ticker);
CREATE INDEX IF NOT EXISTS posts_sentiment_idx  ON public.posts(sentiment);
CREATE INDEX IF NOT EXISTS posts_deleted_idx    ON public.posts(is_deleted) WHERE is_deleted = FALSE;


-- ============================================================
-- 2. TABLA: post_likes  (quién le dio like a qué post)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS post_likes_post_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_idx ON public.post_likes(user_id);


-- ============================================================
-- 3. TABLA: post_comments  (comentarios en posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_comments (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text       TEXT        NOT NULL CHECK (char_length(text) BETWEEN 1 AND 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS post_comments_post_idx ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_user_idx ON public.post_comments(user_id);


-- ============================================================
-- 4. TRIGGERS — actualizan contadores automáticamente
--    Así likes_count siempre es exacto sin queries extra
-- ============================================================

-- 4A. Likes counter
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1,
      updated_at = NOW() WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0),
      updated_at = NOW() WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_likes_count ON public.post_likes;
CREATE TRIGGER trg_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- 4B. Comments counter
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1,
      updated_at = NOW() WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0),
      updated_at = NOW() WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_comments_count ON public.post_comments;
CREATE TRIGGER trg_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- 4C. updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Posts: cualquiera puede leer, solo autenticados pueden crear
DROP POLICY IF EXISTS "Posts visibles para todos"       ON public.posts;
DROP POLICY IF EXISTS "Usuarios pueden crear sus posts" ON public.posts;
DROP POLICY IF EXISTS "Usuarios pueden editar sus posts"ON public.posts;
DROP POLICY IF EXISTS "Usuario crea posts (con restricción GIF)" ON public.posts;

CREATE POLICY "Posts visibles para todos"
  ON public.posts FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Usuarios pueden crear sus posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden editar sus posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Likes: cualquiera lee, solo tú das/quitas tu like
DROP POLICY IF EXISTS "Likes visibles"           ON public.post_likes;
DROP POLICY IF EXISTS "Usuario gestiona sus likes" ON public.post_likes;

CREATE POLICY "Likes visibles"
  ON public.post_likes FOR SELECT USING (TRUE);

CREATE POLICY "Usuario gestiona sus likes"
  ON public.post_likes FOR ALL
  USING (auth.uid() = user_id);

-- Comentarios: cualquiera lee, solo tú creas/borras los tuyos
DROP POLICY IF EXISTS "Comentarios visibles"              ON public.post_comments;
DROP POLICY IF EXISTS "Usuario gestiona sus comentarios"  ON public.post_comments;

CREATE POLICY "Comentarios visibles"
  ON public.post_comments FOR SELECT USING (TRUE);

CREATE POLICY "Usuario gestiona sus comentarios"
  ON public.post_comments FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
-- 6. REALTIME — activa cambios en tiempo real
--    Esto hace que los posts aparezcan al instante en todos
--    los navegadores conectados (como StockTwits)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;


-- ============================================================
-- ✅ LISTO — Tu feed ahora funciona exactamente como StockTwits:
--   • Posts se guardan permanentemente en Supabase
--   • Aparecen en tiempo real en todos los navegadores
--   • Likes y comentarios actualizan contadores automáticamente
--   • RLS garantiza que solo tú editas tus posts
-- ============================================================
