-- ============================================================
-- NEXO TRADE — Migration 003: Paper Trading Simulator
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ============================================================
-- 1. TABLA: paper_trading_accounts
-- Una cuenta por usuario, con balance virtual
-- ============================================================
create table if not exists public.paper_trading_accounts (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references public.profiles(id) on delete cascade,
  balance           numeric(14,2) not null default 10000.00,  -- efectivo disponible
  starting_balance  numeric(14,2) not null default 10000.00,
  total_deposited   numeric(14,2) not null default 10000.00,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.paper_trading_accounts enable row level security;
create policy "Usuario ve su propia cuenta" on public.paper_trading_accounts
  for select using (auth.uid() = user_id);
create policy "Usuario crea su cuenta"     on public.paper_trading_accounts
  for insert with check (auth.uid() = user_id);
create policy "Usuario actualiza su cuenta" on public.paper_trading_accounts
  for update using (auth.uid() = user_id);


-- ============================================================
-- 2. TABLA: paper_positions (posiciones abiertas)
-- ============================================================
create table if not exists public.paper_positions (
  id           uuid primary key default uuid_generate_v4(),
  account_id   uuid not null references public.paper_trading_accounts(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  ticker       text not null,
  shares       numeric(14,6) not null check (shares > 0),
  avg_price    numeric(14,4) not null,          -- precio promedio de compra
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(account_id, ticker)
);

create index if not exists paper_positions_account_idx on public.paper_positions(account_id);
create index if not exists paper_positions_user_idx    on public.paper_positions(user_id);

alter table public.paper_positions enable row level security;
create policy "Usuario ve sus posiciones"      on public.paper_positions
  for select using (auth.uid() = user_id);
create policy "Usuario inserta posiciones"     on public.paper_positions
  for insert with check (auth.uid() = user_id);
create policy "Usuario actualiza posiciones"   on public.paper_positions
  for update using (auth.uid() = user_id);
create policy "Usuario elimina posiciones"     on public.paper_positions
  for delete using (auth.uid() = user_id);


-- ============================================================
-- 3. TABLA: paper_trades (historial de operaciones)
-- ============================================================
create table if not exists public.paper_trades (
  id           uuid primary key default uuid_generate_v4(),
  account_id   uuid not null references public.paper_trading_accounts(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  ticker       text not null,
  type         text not null check (type in ('buy', 'sell')),
  shares       numeric(14,6) not null check (shares > 0),
  price        numeric(14,4) not null,
  total        numeric(14,2) not null,          -- shares * price
  pnl          numeric(14,2),                   -- ganancia/pérdida realizada (solo en sells)
  pnl_pct      numeric(8,4),                    -- % de ganancia/pérdida
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists paper_trades_account_idx on public.paper_trades(account_id);
create index if not exists paper_trades_user_idx    on public.paper_trades(user_id);
create index if not exists paper_trades_created_idx on public.paper_trades(created_at desc);

alter table public.paper_trades enable row level security;
create policy "Usuario ve sus trades"    on public.paper_trades
  for select using (auth.uid() = user_id);
create policy "Usuario inserta trades"   on public.paper_trades
  for insert with check (auth.uid() = user_id);


-- ============================================================
-- 4. FUNCIÓN: ejecutar operación de compra
-- ============================================================
create or replace function public.paper_buy(
  p_user_id  uuid,
  p_ticker   text,
  p_shares   numeric,
  p_price    numeric
)
returns json language plpgsql security definer as $$
declare
  v_account   public.paper_trading_accounts%rowtype;
  v_total     numeric;
  v_position  public.paper_positions%rowtype;
  v_new_avg   numeric;
  v_new_shares numeric;
begin
  v_total := round(p_shares * p_price, 2);

  -- Obtener cuenta
  select * into v_account
  from public.paper_trading_accounts
  where user_id = p_user_id;

  if not found then
    -- Auto-crear cuenta si no existe
    insert into public.paper_trading_accounts (user_id)
    values (p_user_id)
    returning * into v_account;
  end if;

  -- Verificar balance suficiente
  if v_account.balance < v_total then
    return json_build_object('error', 'Saldo insuficiente. Tienes $' || v_account.balance || ' disponibles.');
  end if;

  -- Actualizar o crear posición
  select * into v_position
  from public.paper_positions
  where account_id = v_account.id and ticker = p_ticker;

  if found then
    v_new_shares := v_position.shares + p_shares;
    v_new_avg    := round(((v_position.shares * v_position.avg_price) + (p_shares * p_price)) / v_new_shares, 4);
    update public.paper_positions
      set shares = v_new_shares, avg_price = v_new_avg, updated_at = now()
    where id = v_position.id;
  else
    insert into public.paper_positions (account_id, user_id, ticker, shares, avg_price)
    values (v_account.id, p_user_id, p_ticker, p_shares, p_price);
  end if;

  -- Descontar del balance
  update public.paper_trading_accounts
    set balance = balance - v_total, updated_at = now()
  where id = v_account.id;

  -- Registrar trade
  insert into public.paper_trades (account_id, user_id, ticker, type, shares, price, total)
  values (v_account.id, p_user_id, p_ticker, 'buy', p_shares, p_price, v_total);

  return json_build_object('success', true, 'total', v_total);
end;
$$;


-- ============================================================
-- 5. FUNCIÓN: ejecutar operación de venta
-- ============================================================
create or replace function public.paper_sell(
  p_user_id  uuid,
  p_ticker   text,
  p_shares   numeric,
  p_price    numeric
)
returns json language plpgsql security definer as $$
declare
  v_account   public.paper_trading_accounts%rowtype;
  v_position  public.paper_positions%rowtype;
  v_total     numeric;
  v_pnl       numeric;
  v_pnl_pct   numeric;
begin
  v_total := round(p_shares * p_price, 2);

  select * into v_account
  from public.paper_trading_accounts where user_id = p_user_id;

  if not found then
    return json_build_object('error', 'No tienes cuenta de paper trading.');
  end if;

  select * into v_position
  from public.paper_positions
  where account_id = v_account.id and ticker = p_ticker;

  if not found then
    return json_build_object('error', 'No tienes posición en ' || p_ticker);
  end if;

  if v_position.shares < p_shares then
    return json_build_object('error', 'Solo tienes ' || v_position.shares || ' acciones de ' || p_ticker);
  end if;

  -- Calcular P&L
  v_pnl     := round((p_price - v_position.avg_price) * p_shares, 2);
  v_pnl_pct := round(((p_price - v_position.avg_price) / v_position.avg_price) * 100, 4);

  -- Actualizar o eliminar posición
  if v_position.shares = p_shares then
    delete from public.paper_positions where id = v_position.id;
  else
    update public.paper_positions
      set shares = shares - p_shares, updated_at = now()
    where id = v_position.id;
  end if;

  -- Sumar al balance
  update public.paper_trading_accounts
    set balance = balance + v_total, updated_at = now()
  where id = v_account.id;

  -- Registrar trade
  insert into public.paper_trades (account_id, user_id, ticker, type, shares, price, total, pnl, pnl_pct)
  values (v_account.id, p_user_id, p_ticker, 'sell', p_shares, p_price, v_total, v_pnl, v_pnl_pct);

  -- Puntos por operación rentable
  if v_pnl > 0 then
    perform public.add_points(p_user_id, 5, 'profitable_trade', p_ticker);
  end if;

  return json_build_object('success', true, 'total', v_total, 'pnl', v_pnl, 'pnl_pct', v_pnl_pct);
end;
$$;


-- ============================================================
-- 6. VISTA: paper_portfolio_summary
-- ============================================================
create or replace view public.paper_portfolio_summary
  with (security_invoker = true)
as
  select
    a.user_id,
    a.balance                                           as cash,
    a.starting_balance,
    coalesce(sum(p.shares * p.avg_price), 0)           as positions_cost,
    count(p.id)                                        as open_positions,
    (select count(*) from public.paper_trades t
      where t.account_id = a.id)                       as total_trades,
    (select coalesce(sum(pnl),0) from public.paper_trades t
      where t.account_id = a.id and type = 'sell')     as realized_pnl,
    (select count(*) from public.paper_trades t
      where t.account_id = a.id and type = 'sell' and pnl > 0) as winning_trades,
    (select count(*) from public.paper_trades t
      where t.account_id = a.id and type = 'sell' and pnl <= 0) as losing_trades
  from public.paper_trading_accounts a
  left join public.paper_positions p on p.account_id = a.id
  group by a.id, a.user_id, a.balance, a.starting_balance;

-- ============================================================
-- FIN MIGRATION 003
-- ============================================================
