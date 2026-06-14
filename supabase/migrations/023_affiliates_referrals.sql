-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ NEXO TRADE — Migración 023: Afiliados / Influencers (dashboard real)   ║
-- ║ Crea las tablas que lee /affiliates.html y conecta /api/track-ref.     ║
-- ║ Pegar TODO en Supabase → SQL Editor → Run. Es idempotente (se puede    ║
-- ║ correr varias veces sin romper nada).                                  ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1) Tabla de afiliados (lo que el dashboard inserta al postularse y luego lee)
create table if not exists public.affiliates (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  email           text unique,
  username        text,
  referral_code   text unique,
  platform        text,
  followers       integer default 0,
  tier            text default 'nano',
  commission_pct  numeric default 20,
  status          text default 'pending',     -- pending | active | rejected
  total_clicks    integer default 0,
  total_signups   integer default 0,
  total_paying    integer default 0,
  total_earned    numeric default 0,
  balance_pending numeric default 0,
  total_paid_out  numeric default 0,
  created_at      timestamptz default now()
);

-- 2) Tabla de referidos (cada persona que llega por el link de un afiliado)
create table if not exists public.referrals (
  id                uuid primary key default gen_random_uuid(),
  affiliate_id      uuid references public.affiliates(id) on delete cascade,
  status            text default 'signup',     -- click | signup | trial | paying | churned
  referred_name     text,
  referred_email    text,
  referred_user_id  uuid,
  plan_type         text,
  country           text,
  device_type       text,
  commission_earned numeric default 0,
  commission_paid   boolean default false,
  source            text default 'signup',
  clicked_at        timestamptz default now(),
  created_at        timestamptz default now()
);
create index if not exists idx_referrals_affiliate on public.referrals(affiliate_id);

-- 3) Seguridad (RLS)
alter table public.affiliates enable row level security;
alter table public.referrals  enable row level security;

-- Postularse como afiliado: cualquiera puede insertar su solicitud
drop policy if exists aff_insert on public.affiliates;
create policy aff_insert on public.affiliates
  for insert to anon, authenticated with check (true);

-- Leer afiliados: el afiliado ve SU fila (por email); los admin ven todas
drop policy if exists aff_select on public.affiliates;
create policy aff_select on public.affiliates
  for select to anon, authenticated using (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email','')) or
    lower(coalesce(auth.jwt() ->> 'email','')) in ('mariagalarraga2013@gmail.com','admin@nexotrade.com')
  );

-- Leer referidos: el afiliado ve los suyos; los admin ven todos
drop policy if exists ref_select on public.referrals;
create policy ref_select on public.referrals
  for select to anon, authenticated using (
    affiliate_id in (select id from public.affiliates
                     where lower(email) = lower(coalesce(auth.jwt() ->> 'email',''))) or
    lower(coalesce(auth.jwt() ->> 'email','')) in ('mariagalarraga2013@gmail.com','admin@nexotrade.com')
  );

-- 4) Función que registra un referido (la llama /api/track-ref).
--    SECURITY DEFINER → puede escribir aunque RLS esté activo, y es llamable
--    con la clave pública. Busca el afiliado por su código; si no existe,
--    devuelve null y no hace nada (p.ej. referidos amigo por UUID).
create or replace function public.record_referral(
  p_ref_code text, p_email text, p_user_id uuid, p_source text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_aff uuid;
begin
  select id into v_aff from public.affiliates
    where lower(referral_code) = lower(trim(p_ref_code)) limit 1;
  if v_aff is null then return null; end if;

  insert into public.referrals(affiliate_id, status, referred_email, referred_user_id, source, clicked_at, created_at)
    values (v_aff, 'signup', p_email, p_user_id, coalesce(p_source,'signup'), now(), now());

  update public.affiliates set total_signups = total_signups + 1 where id = v_aff;
  return v_aff;
end; $$;

grant execute on function public.record_referral(text, text, uuid, text) to anon, authenticated;

-- ✅ Verificación rápida (opcional): debe devolver las 2 tablas
-- select table_name from information_schema.tables where table_name in ('affiliates','referrals');
