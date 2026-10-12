-- GumeGo – izmena 003: skladište guma (setovi sa QR kodom i slikama).
-- Pokrenuti jednom u Supabase: SQL Editor → New query → Run.

-- ============ SETOVI GUMA U SKLADIŠTU ============
create sequence public.tire_set_seq;
grant usage on sequence public.tire_set_seq to authenticated;

create table public.tire_sets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('GG-' || lpad(nextval('public.tire_set_seq')::text, 4, '0')),
  user_id uuid not null references public.profiles (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  car_id uuid references public.cars (id) on delete set null,
  tires int not null default 4 check (tires between 1 and 8),
  season text not null default 'summer' check (season in ('summer', 'winter')),
  description text not null default '',
  location text not null default '',
  note text not null default '',
  photos text[] not null default '{}',
  status text not null default 'stored' check (status in ('stored', 'returned')),
  stored_at date not null default current_date,
  returned_at date,
  created_at timestamptz not null default now()
);

alter table public.tire_sets enable row level security;

-- Vlasnik vidi svoje gume, admin sve; samo admin dodaje i menja
create policy "tire_sets_select_own_or_admin" on public.tire_sets
  for select using (user_id = auth.uid() or public.is_admin());
create policy "tire_sets_insert_admin" on public.tire_sets
  for insert with check (public.is_admin());
create policy "tire_sets_update_admin" on public.tire_sets
  for update using (public.is_admin()) with check (public.is_admin());
create policy "tire_sets_delete_admin" on public.tire_sets
  for delete using (public.is_admin());

-- ============ SLIKE (privatni bucket) ============
-- Putanja slike: <id seta>/<ime fajla>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tire-photos', 'tire-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "tire_photos_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'tire-photos' and public.is_admin())
  with check (bucket_id = 'tire-photos' and public.is_admin());

create policy "tire_photos_owner_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'tire-photos'
    and exists (
      select 1 from public.tire_sets t
      where t.id::text = (storage.foldername(name))[1] and t.user_id = auth.uid()
    )
  );
