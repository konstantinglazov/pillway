# Pillway — Prescription Transfer App

A location-based prescription transfer and service request flow built with:

- **Frontend**: Angular 16+ (multi-step reactive form, Google Maps Places)
- **Backend**: Express.js + TypeScript (REST API, Zod validation)
- **Database**: Supabase (PostgreSQL + Row Level Security + Auth)
- **Maps**: Google Maps JavaScript API + Places Autocomplete

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | 16+ (`npm i -g @angular/cli`) |
| Supabase account | [supabase.com](https://supabase.com) |
| Google Cloud project | Maps JavaScript API + Places API enabled |

---

## 1. Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) → **New Project**
2. Enter project name `pillway`, a strong DB password, choose your region.
3. Wait ~2 minutes for provisioning.
4. Open **SQL Editor** in the Supabase dashboard and paste the entire contents of:

   ```
   supabase/migrations/001_initial_schema.sql
   ```

   Click **Run**.  This creates the `profiles`, `pharmacies`, and `bookings`
   tables, enables Row Level Security on all three, and registers an auth trigger
   that auto-creates a profile row on user sign-up.

5. From **Settings → API**, copy:
   - **Project URL** → used as `SUPABASE_URL` (backend) and `supabaseUrl` (frontend)
   - **anon / public key** → `supabaseAnonKey` in `environment.ts` (safe to expose)
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY` in `.env` (**never expose**)

---

## 2. Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → your project.
2. Enable **Maps JavaScript API** and **Places API**.
3. Create an API key under **Credentials**.
4. (Before going to production) restrict the key to your domain under
   **Key restrictions → HTTP referrers**.

---

## 3. Backend Setup

```bash
cd backend

# Copy example env file and fill in your values
cp .env.example .env
# Edit .env:
#   SUPABASE_URL=https://xxxx.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=eyJ...
#   PORT=3000
#   FRONTEND_URL=http://localhost:4200

npm install
npm run dev
# API running at http://localhost:3000
# GET http://localhost:3000/health → { status: "ok" }
```

---

## 4. Frontend Setup

```bash
cd frontend

npm install

# Fill in your values in:
#   src/environments/environment.ts
#     supabaseUrl: 'https://xxxx.supabase.co'
#     supabaseAnonKey: 'eyJ...'
#     googleMapsApiKey: 'AIza...'

ng serve
# App running at http://localhost:4200
```

The Angular dev server is configured (via `proxy.conf.json`) to forward all
`/api/*` requests to `http://localhost:3000`, so both servers must be running.

---

## 5. User Flow

1. Navigate to `http://localhost:4200` — you will be redirected to `/login`.
2. Create an account (email + password) or sign in.
3. Complete the 3-step transfer form:
   - **Step 1** — Select service type and any additional services.
   - **Step 2** — Search for and pin a pharmacy using the Google Maps widget.
   - **Step 3** — Review all collected data and click **Confirm Order**.
4. The booking is saved to Supabase and you land on the confirmation page.

---

## 6. Project Structure

```
pillway/
├── backend/                   Express.js API (service_role key lives here only)
│   ├── src/
│   │   ├── config/supabase.ts   Supabase admin client
│   │   ├── controllers/         Route handler logic
│   │   ├── routes/              Express routers
│   │   └── middleware/          Error handler
│   └── .env.example
├── frontend/                  Angular 16+ app (anon key only)
│   └── src/app/
│       ├── core/              Services, models, guards
│       └── features/
│           ├── auth/          Login / sign-up
│           ├── transfer/      Multi-step form (3 steps)
│           └── confirmation/  Post-booking screen
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## 7. Security Notes

| Key | Where it lives | Exposed to browser? |
|-----|---------------|---------------------|
| `supabaseAnonKey` | `environment.ts` | Yes (safe — RLS enforces isolation) |
| `SUPABASE_SERVICE_ROLE_KEY` | `backend/.env` | **No — bypasses RLS** |
| `googleMapsApiKey` | `environment.ts` | Yes (restrict by HTTP referrer in prod) |

---

## 8. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/bookings` | Create a booking (upserts pharmacy) |
| `GET` | `/api/bookings/:userId` | List bookings for a user |
