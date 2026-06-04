-- ═══════════════════════════════════════════════════════════════════
-- 012 — TRACKING DE VISITAS (Sesión 11)
-- Registra TODAS las visitas al sitio (usuarios registrados Y anónimos)
-- para mostrar el conteo en el panel de administrador.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.site_visits (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  visitor_id    text not null,
  is_registered boolean not null default false,
  path          text,
  referrer      text,
  device        text
);

create index if not exists idx_site_visits_created  on public.site_visits(created_at);
create index if not exists idx_site_visits_visitor  on public.site_visits(visitor_id);

alter table public.site_visits enable row level security;

drop policy if exists "site_visits_insert_all" on public.site_visits;
create policy "site_visits_insert_all" on public.site_visits
  for insert with check (true);

drop policy if exists "site_visits_select_all" on public.site_visits;
create policy "site_visits_select_all" on public.site_visits
  for select using (true);
