# GumeGo

Web aplikacija za zakazivanje zamene guma na adresi korisnika.

## Pokretanje

```
npm install
npm run dev
```

Otvori http://localhost:5173

## Podešavanje baze (Supabase), jednom

1. Napravi besplatan nalog na https://supabase.com i novi projekat (region: Frankfurt / Central EU).
2. **SQL Editor → New query**: nalepi ceo sadržaj fajla `supabase/schema.sql` i klikni **Run**.
3. **Project Settings → API**: kopiraj `Project URL` i `anon public` ključ.
4. U folderu projekta napravi fajl `.env` (po uzoru na `.env.example`) i upiši te dve vrednosti.
5. Ponovo pokreni `npm run dev`.
6. (Za testiranje) **Authentication → Sign In / Providers → Email**: isključi "Confirm email" da ne moraš da potvrđuješ email pri svakoj registraciji.

## Kako postaviti admina

Registruj se u aplikaciji, pa u Supabase **SQL Editor** pokreni:

```sql
update public.profiles set is_admin = true where email = 'tvoj@email.com';
```

Odjavi se i ponovo prijavi, pa će se u zaglavlju pojaviti dugme **Admin**.

Polje `is_admin` ne može da se promeni iz aplikacije. Pravila u bazi (Row Level Security)
dozvoljavaju samo adminu da vidi tuđe rezervacije i menja statuse, čak i ako neko zaobiđe sajt.

## Cene

Cene su upisane na dva mesta i moraju da se poklapaju:
- `src/config.js`: prikaz u aplikaciji
- `supabase/schema.sql`, funkcija `compute_booking_price`: prava cena koja se upisuje u bazu
