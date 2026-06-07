-- ============================================================
-- NEXO TRADE — Migration 002: Suscripciones VIP + Stripe
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ============================================================
-- 1. AÑADIR CAMPOS DE SUSCRIPCIÓN A PROFILES
-- ============================================================
alter table public.profiles
  add column if not exists subscription_tier  text    not null default 'free' check (subscription_tier in ('free', 'vip')),
  add column if not exists stripe_customer_id text    unique,
  add column if not exists vip_since          timestamptz,
  add column if not exists vip_expires_at     timestamptz;

create index if not exists profiles_tier_idx on public.profiles(subscription_tier);


-- ============================================================
-- 2. TABLA: subscriptions  (historial de pagos / suscripciones)
-- ============================================================
create table if not exists public.subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_customer_id     text not null,
  stripe_price_id        text not null,
  status                 text not null,   -- active | canceled | past_due | trialing
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  canceled_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_user_idx   on public.subscriptions(user_id);
create index if not exists subscriptions_stripe_idx on public.subscriptions(stripe_subscription_id);

-- RLS
alter table public.subscriptions enable row level security;
create policy "Usuario ve sus propias suscripciones"
  on public.subscriptions for select using (auth.uid() = user_id);


-- ============================================================
-- 3. TABLA: watchlist_weekly  (VIP — seguimiento semanal)
-- ============================================================
create table if not exists public.watchlist_weekly (
  id          serial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  ticker      text not null,
  week_start  date not null default date_trunc('week', current_date)::date,
  price_open  numeric(12,4),   -- precio al inicio de la semana
  price_close numeric(12,4),   -- precio al cierre (actualizado)
  change_pct  numeric(8,4),    -- % de cambio en la semana
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, ticker, week_start)
);

alter table public.watchlist_weekly enable row level security;

create policy "Usuario ve su watchlist semanal"
  on public.watchlist_weekly for select using (auth.uid() = user_id);
create policy "Solo VIP crea watchlist semanal"
  on public.watchlist_weekly for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and subscription_tier = 'vip'
    )
  );
create policy "Usuario actualiza su watchlist semanal"
  on public.watchlist_weekly for update using (auth.uid() = user_id);
create policy "Usuario elimina de su watchlist semanal"
  on public.watchlist_weekly for delete using (auth.uid() = user_id);


-- ============================================================
-- 4. FUNCIÓN: activar / desactivar VIP (llamada desde webhook)
-- ============================================================
create or replace function public.set_user_vip(
  p_user_id       uuid,
  p_active        boolean,
  p_expires_at    timestamptz default null
)
returns void language plpgsql security definer as $$
begin
  if p_active then
    update public.profiles set
      subscription_tier = 'vip',
      vip_since         = coalesce(vip_since, now()),
      vip_expires_at    = p_expires_at
    where id = p_user_id;

    -- Badge VIP
    insert into public.user_badges (user_id, badge_id)
    select p_user_id, id from public.badges where slug = 'verified_pro'
    on conflict do nothing;
  else
    update public.profiles set
      subscription_tier = 'free',
      vip_expires_at    = now()
    where id = p_user_id;
  end if;
end;
$$;


-- ============================================================
-- 5. FUNCIÓN: verificar límite watchlist para usuarios gratis
-- ============================================================
create or replace function public.check_watchlist_limit()
returns trigger language plpgsql as $$
declare
  user_tier    text;
  watch_count  integer;
begin
  select subscription_tier into user_tier
  from public.profiles where id = new.user_id;

  if user_tier = 'vip' then
    return new; -- VIP sin límite
  end if;

  select count(*) into watch_count
  from public.stock_watchlist where user_id = new.user_id;

  if watch_count >= 5 then
    raise exception 'WATCHLIST_LIMIT_REACHED: Los usuarios gratis pueden guardar hasta 5 acciones. Actualiza a VIP para watchlist ilimitada.';
  end if;

  return new;
end;
$$;

drop trigger if exists watchlist_limit_check on public.stock_watchlist;
create trigger watchlist_limit_check
  before insert on public.stock_watchlist
  for each row execute function public.check_watchlist_limit();


-- ============================================================
-- 6. FUNCIÓN: upsert suscripción desde Stripe webhook
-- ============================================================
create or replace function public.upsert_subscription(
  p_user_id              uuid,
  p_stripe_sub_id        text,
  p_stripe_customer_id   text,
  p_stripe_price_id      text,
  p_status               text,
  p_period_start         timestamptz,
  p_period_end           timestamptz,
  p_canceled_at          timestamptz default null
)
returns void language plpgsql security definer as $$
begin
  insert into public.subscriptions (
    user_id, stripe_subscription_id, stripe_customer_id,
    stripe_price_id, status, current_period_start, current_period_end, canceled_at
  ) values (
    p_user_id, p_stripe_sub_id, p_stripe_customer_id,
    p_stripe_price_id, p_status, p_period_start, p_period_end, p_canceled_at
  )
  on conflict (stripe_subscription_id) do update set
    status               = excluded.status,
    current_period_start = excluded.current_period_start,
    current_period_end   = excluded.current_period_end,
    canceled_at          = excluded.canceled_at,
    updated_at           = now();

  -- Actualizar stripe_customer_id en profiles
  update public.profiles
    set stripe_customer_id = p_stripe_customer_id
  where id = p_user_id and stripe_customer_id is null;

  -- Activar / desactivar VIP según estado
  if p_status in ('active', 'trialing') then
    perform public.set_user_vip(p_user_id, true, p_period_end);
  else
    perform public.set_user_vip(p_user_id, false);
  end if;
end;
$$;


-- ============================================================
-- 7. ACTUALIZAR RLS: posts — GIFs solo para VIP
-- ============================================================
-- Primero eliminamos la política general de inserción
drop policy if exists "Usuario crea sus posts" on public.posts;

-- Política nueva: free puede postear texto, VIP puede postear texto + GIFs
create policy "Usuario crea posts (con restricción GIF)"
  on public.posts for insert with check (
    auth.uid() = user_id
    and (
      gif_url is null  -- texto siempre permitido
      or exists (      -- GIF solo VIP
        select 1 from public.profiles
        where id = auth.uid() and subscription_tier = 'vip'
      )
    )
  );


-- ============================================================
-- 8. VISTA: user_profile_full (datos completos con tier)
-- ============================================================
create or replace view public.user_profile_full
  with (security_invoker = true)
as
  select
    p.*,
    coalesce(
      array_agg(b.icon order by ub.earned_at) filter (where b.id is not null),
      '{}'::text[]
    ) as badge_icons,
    coalesce(
      array_agg(b.slug order by ub.earned_at) filter (where b.id is not null),
      '{}'::text[]
    ) as badge_slugs,
    (select count(*) from public.posts    where user_id = p.id and is_deleted = false) as post_count,
    (select count(*) from public.follows  where following_id = p.id)                   as follower_count,
    (select count(*) from public.follows  where follower_id = p.id)                    as following_count,
    (select count(*) from public.stock_watchlist where user_id = p.id)                 as watchlist_count
  from public.profiles p
  left join public.user_badges ub on ub.user_id = p.id
  left join public.badges b       on b.id = ub.badge_id
  group by p.id;


-- ============================================================
-- 9. HABILITAR REALTIME en tablas clave
-- ============================================================
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_likes;
alter publication supabase_realtime add table public.post_comments;
alter publication supabase_realtime add table public.battle_stocks;
alter publication supabase_realtime add table public.battle_votes;
alter publication supabase_realtime add table public.profiles;

-- ============================================================
-- FIN MIGRATION 002
-- ============================================================
