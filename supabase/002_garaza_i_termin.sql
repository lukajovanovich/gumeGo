-- GumeGo – izmena 002: Moja garaža + vremenski prozor za preuzimanje/vraćanje.
-- Pokrenuti jednom u Supabase: SQL Editor → New query → Run.

-- ============ GARAŽA ============
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  make_model text not null,
  plate text not null default '',
  tire_size text not null default '',
  summer_tires text not null default '',
  winter_tires text not null default '',
  two_sets boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.cars enable row level security;

create policy "cars_select_own_or_admin" on public.cars
  for select using (user_id = auth.uid() or public.is_admin());
create policy "cars_insert_own" on public.cars
  for insert with check (user_id = auth.uid());
create policy "cars_update_own" on public.cars
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cars_delete_own" on public.cars
  for delete using (user_id = auth.uid());

-- ============ REZERVACIJE: auto + vremenski prozor ============
alter table public.bookings
  add column car_id uuid references public.cars (id) on delete set null,
  add column pickup_from time,
  add column return_by time,
  alter column slot drop not null,
  add constraint bookings_window_check check (pickup_from is null or return_by > pickup_from);

-- Korisnik može da veže rezervaciju samo za svoj auto
drop policy "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own" on public.bookings
  for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    and date > current_date
    and (car_id is null or exists (select 1 from public.cars c where c.id = car_id and c.user_id = auth.uid()))
  );
