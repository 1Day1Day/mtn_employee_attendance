# MTN Tarkwa Attendance System

A staff attendance system for the MTN Ghana Tarkwa branch: phone clock-in via a
daily QR code with a location radius check, a shared clock-in station for staff
without phones, and an admin area for user approval, location settings, excused
days, and an audit of missed working days.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, styled in MTN's yellow and black
- Prisma + PostgreSQL (Supabase)
- Hosted on Vercel

## How the pieces fit together

- **Phone + QR:** `/admin/qr` shows a QR code that encodes a signed link
  (`/clock?token=...`) which is only valid for the current day. Scanning it
  opens the clock page; if the person isn't signed in yet, they're sent to
  `/login` (or `/register` if new) and returned to the same link afterwards.
  Clocking in checks the phone's GPS against the branch location and radius
  set in `/admin/location`.
- **Station (no phone):** `/station` is a clock-only kiosk page meant to run
  on a tablet or PC at the branch. It has no admin controls, so it's safe to
  leave open on a shared screen. Staff enter their 5-digit staff ID and
  password; interns/NSP pick their name and enter their PIN. No location
  check is needed since the device itself is fixed at the branch — instead it
  sends a device secret (see `.env.example`) so only that registered device
  can record attendance this way.
- **Registration:** new staff supply a 5-digit staff ID; interns/NSP have no
  ID and instead choose their name and set a PIN at registration. Everyone
  starts as `PENDING` until an admin approves them in `/admin/users`.
- **Audit:** `/admin/audit` counts, per person per month, Monday-to-Friday
  days with no clock-in, skipping any day marked as excused (a holiday for
  everyone, or approved leave for one person, added in
  `/admin/excused-days`). Anyone at or above the threshold (default 5, set in
  `/admin/location`) is listed.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** (supabase.com), then from
   Project Settings → Database, copy:
   - The **Transaction pooler** connection string (port 6543) into
     `DATABASE_URL` — this is what Vercel's serverless functions should use.
   - The **direct** connection string (port 5432) into `DIRECT_URL` — Prisma
     uses this only for migrations.

3. **Copy the environment file and fill in the values:**
   ```bash
   cp .env.example .env
   ```
   Generate random values for `JWT_SECRET` and the two station-secret
   variables, for example with `openssl rand -hex 32`.

4. **Create the database tables:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the first admin account:**
   ```bash
   npx prisma db seed
   ```
   This creates staff ID `00001` with password `changeme123`. Sign in and
   change it immediately from `/admin/users` → Reset password.

6. **Run locally:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000/login` to sign in as the seeded admin, then
   `/admin/location` to set the real branch coordinates and radius (use the
   "Use my current location" button while standing at the branch).

## Deploying to Vercel

1. Push this project to a GitHub repository and import it in Vercel.
2. Add the same environment variables from your `.env` file in the Vercel
   project settings (Settings → Environment Variables).
3. Set `NEXT_PUBLIC_APP_URL` to your real Vercel URL once you have it (the QR
   code links are built from this).
4. Deploy. Run `npx prisma migrate deploy` once against the production
   database (or let it run as part of your build command) so the tables
   exist before first use.
5. Open `/station` on the tablet or PC you'll use as the branch's shared
   clock-in device, and leave it there. Nothing else on that page requires
   sign-in, so it's safe to leave open.

## Notes and known limitations

- **GPS accuracy:** phone GPS is often off by 10-50 metres, especially
  indoors. Start with a radius of 100m and tighten it only after checking it
  doesn't lock out people who are genuinely at the branch.
- **Buddy punching at the station:** a PIN reduces this but doesn't fully
  prevent a colleague clocking in for someone else. Adding a webcam capture
  per clock-in would help if this becomes a problem.
- **Time zone:** deploy with the server time zone set to `Africa/Accra` (or
  set `TZ=Africa/Accra` as an environment variable) so "today" for the QR
  code and the audit month lines up with local time.
- **Data protection:** only "within range / outside range" and the distance
  are stored for each clock-in — not raw GPS coordinates — to limit how much
  location data is kept. Ghana's Data Protection Act applies to staff
  personal data stored here, so check with MTN's branch or IT contact before
  using this with real staff data.
