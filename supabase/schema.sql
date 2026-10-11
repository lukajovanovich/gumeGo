-- GumeGo – šema baze. Pokrenuti jednom u Supabase: SQL Editor → New query → Run.

-- ============ PROFILI ============
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Automatski pravi profil kad se korisnik registruje
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
-- Namerno NEMA insert/update/delete politika: niko iz aplikacije ne može
-- da promeni is_admin. Admin se postavlja samo iz Supabase dashboard-a.

-- ============ REZERVACIJE ============
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  package_id text not null check (package_id in ('twoSets', 'oneSet')),
  tires int not null check (tires in (2, 4)),
  address text not null,
  city text not null,
  phone text not null,
  note text not null default '',
  date date not null,
  slot text not null,
  storage boolean not null default false,
  storage_months int not null default 0 check (storage_months between 0 and 12),
  price_service int not null default 0,
  price_storage int not null default 0,
  price_total int not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'in_progress', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  check (not storage or storage_months >= 1)
);

-- Cena se računa u bazi, da korisnik ne bi mogao da pošalje svoju cenu.
-- Ako menjaš cene, promeni ih ovde I u src/config.js.
create or replace function public.compute_booking_price()
returns trigger
language plpgsql
as $$
begin
  if not new.storage then
    new.storage_months := 0;
  end if;
  new.price_service := new.tires * case new.package_id when 'twoSets' then 750 else 1500 end;
  new.price_storage := new.tires * 200 * new.storage_months;
  new.price_total := new.price_service + new.price_storage;
  return new;
end;
$$;

create trigger bookings_compute_price
  before insert or update of package_id, tires, storage, storage_months on public.bookings
  for each row execute function public.compute_booking_price();

alter table public.bookings enable row level security;

create policy "bookings_select_own_or_admin" on public.bookings
  for select using (user_id = auth.uid() or public.is_admin());

create policy "bookings_insert_own" on public.bookings
  for insert with check (user_id = auth.uid() and status = 'pending' and date > current_date);

create policy "bookings_update_admin" on public.bookings
  for update using (public.is_admin()) with check (public.is_admin());

-- Korisnik može samo da otkaže svoju rezervaciju dok je na čekanju
create or replace function public.cancel_booking(booking_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.bookings
  set status = 'cancelled'
  where id = booking_id and user_id = auth.uid() and status = 'pending';
  if not found then
    raise exception 'Rezervacija ne može da se otkaže.';
  end if;
end;
$$;

-- ============ POSTAVLJANJE ADMINA ============
-- Prvo se registruj u aplikaciji, pa pokreni (sa svojim emailom):
-- update public.profiles set is_admin = true where email = 'tvoj@email.com';
