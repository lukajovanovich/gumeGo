# GumeGo

A web app for booking seasonal tire changes at the customer's address, with tire storage
management for the service. Customers book a time window and the mechanic comes to their car.
If they want, the off-season tires are taken to a warehouse, where each set is tracked by a QR code.

**Live demo:** _coming soon_

> The UI is in Serbian, because the app is built for the local market.

## Features

**For customers**
- **Booking without an account:** the customer picks a package, number of tires, date and a time window when the car is available. They only sign up at the end, by email or Google. The unfinished booking is kept in the browser, so it survives the redirect and is submitted automatically after login.
- **Two service packages:** an on-site wheel swap (for customers with two sets of rims), or pickup, remounting and balancing at the workshop (one set of rims).
- **My garage:** saved cars for faster repeat bookings.
- **My bookings:** booking status (pending, confirmed, in progress, done), plus cancellation.
- **Tire storage:** the customer can see their stored tire sets, with photos and how long they have been stored.

**For the admin**
- **Booking dashboard:** all bookings, with status changes.
- **Tire storage:** each stored set gets a code (`GG-0001`), season, location, notes and photos. Photos taken on a phone are compressed in the browser before upload.
- **QR labels:** printable labels, one per tire. Scanning a label opens that set's page.

## Tech stack

- **Frontend:** React 18, React Router, Vite, plain CSS
- **Backend:** Supabase (PostgreSQL, Auth with email and Google OAuth, Storage)
- **Hosting:** Vercel

## Security and data integrity

The app talks to the database straight from the browser, so the rules live in the database itself:

- **Row Level Security on every table:** customers can only read their own bookings, cars and tire sets. Only admins can see everyone's data and change statuses.
- **Admin rights can't be changed from the client:** the `is_admin` flag can only be set directly in the database.
- **Prices are calculated on the server:** a PostgreSQL trigger (`compute_booking_price`) works out the final price. Whatever price the client sends is ignored.
- **Private storage bucket:** tire photos are only available to the admin and to the set's owner.
- **Cancellations go through a database function** (`cancel_booking`), which checks ownership and status.

## Project structure

```
src/
  pages/        Booking, My bookings, Garage, Tire set, Admin, Storage, About
  components/   Layout, auth forms, admin navigation
  config.js     Packages, prices, time windows, statuses
  draft.js      Keeps an unfinished booking across sign-up and OAuth redirect
  tireSets.js   Storage helpers: photos, QR links, storage duration
supabase/
  schema.sql                 Profiles, bookings, pricing trigger, RLS
  002_garaza_i_termin.sql    Cars and time windows
  003_skladiste.sql          Tire sets and photo storage
```

## Running locally

```bash
npm install
cp .env.example .env   # add your Supabase URL and anon key
npm run dev
```

The database is set up by running the SQL files in `supabase/` in order, in a Supabase project.
To make a user an admin:

```sql
update public.profiles set is_admin = true where email = 'user@example.com';
```
