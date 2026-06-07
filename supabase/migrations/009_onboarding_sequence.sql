-- NEXO TRADE — Migración 009: Onboarding email sequence + referral_code
-- Correr en: Supabase SQL Editor → New Query → Pegar y ejecutar

-- 1. Agregar columna referral_code y referred_by a profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_day INTEGER DEFAULT 1;

-- 2. Crear tabla para tracking de emails de onboarding
CREATE TABLE IF NOT EXISTS onboarding_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  day integer NOT NULL,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent'
);

-- 3. Índice para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS onboarding_emails_user_day
  ON onboarding_emails(user_id, day);

-- 4. Habilitar RLS en onboarding_emails
ALTER TABLE onboarding_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service can manage onboarding emails"
  ON onboarding_emails FOR ALL USING (true);

-- 5. Función para programar emails de onboarding (llamar al registrarse)
-- Esta función se puede llamar desde un trigger o desde el Edge Function send-welcome
CREATE OR REPLACE FUNCTION schedule_onboarding_emails(p_user_id uuid, p_email text, p_name text)
RETURNS void AS $$
BEGIN
  -- Registrar que los emails deben enviarse (el cron los procesará)
  INSERT INTO onboarding_emails (user_id, email, day, status)
  VALUES
    (p_user_id, p_email, 2, 'pending'),
    (p_user_id, p_email, 3, 'pending'),
    (p_user_id, p_email, 5, 'pending'),
    (p_user_id, p_email, 7, 'pending')
  ON CONFLICT (user_id, day) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Vista para ver estado de onboarding
CREATE OR REPLACE VIEW v_onboarding_status AS
SELECT
  p.id,
  p.username,
  p.email,
  p.created_at,
  COUNT(oe.id) FILTER (WHERE oe.status = 'sent') as emails_sent,
  COUNT(oe.id) FILTER (WHERE oe.status = 'pending') as emails_pending,
  p.referral_code,
  p.referral_count
FROM profiles p
LEFT JOIN onboarding_emails oe ON oe.user_id = p.id
GROUP BY p.id, p.username, p.email, p.created_at, p.referral_code, p.referral_count;

-- NOTA: Para procesar los emails pendientes cada día, ejecutar desde tu servidor:
-- SELECT * FROM onboarding_emails WHERE status = 'pending' AND day = X;
-- Luego llamar: POST /functions/v1/onboarding-sequence { email, day }
-- Y actualizar: UPDATE onboarding_emails SET status = 'sent' WHERE id = X;
