-- 007_newsletter_subscribers.sql
-- Tabla para capturar emails del pop-up de newsletter

create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text default 'popup',   -- popup | footer | landing
  created_at  timestamptz default now()
);

-- Solo los admins pueden leer/exportar
alter table public.newsletter_subscribers enable row level security;

create policy "Admin can read subscribers"
  on public.newsletter_subscribers for select
  using ( auth.jwt() ->> 'email' = 'mariagalarraga2013@gmail.com' );

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);
