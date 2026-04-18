# Pillway — Architecture & API Reference

## Overview

Pillway is a prescription transfer service with a three-tier architecture:

```
Browser (Angular 16)
        │  HTTPS
        ▼
Express API  (Vercel Serverless — Node.js)
        │  TCP / TLS
        ▼
PostgreSQL  (Supabase-hosted)
```

The frontend never touches the database directly. All business logic, authentication, and data access live in the Express API.

---

## Frontend

| Item | Detail |
|---|---|
| Framework | Angular 16 |
| Build tool | Angular CLI + custom Webpack (DefinePlugin for env vars) |
| Hosting | Vercel (static site, SPA rewrites) |
| URL | https://pillway-tawny.vercel.app |

### Key modules

```
src/app/
├── core/
│   ├── guards/        auth.guard.ts          — redirects unauthenticated users to /login
│   ├── interceptors/  jwt.interceptor.ts     — attaches Bearer token to every request; auto-logout on 401
│   ├── models/        booking.model.ts       — shared TypeScript interfaces
│   └── services/
│       ├── auth.service.ts                   — login / register / logout / token storage
│       └── booking.service.ts                — createBooking / getBookings API calls
└── features/
    ├── auth/          login.component.ts     — sign-in / sign-up tabs
    ├── transfer/                             — multi-step booking wizard
    │   ├── transfer.component.ts            — step router + logout button
    │   ├── transfer-form.service.ts         — shared reactive form state across steps
    │   └── steps/
    │       ├── step-location/               — Google Maps pharmacy search
    │       ├── step-preferences/            — service type + add-ons
    │       └── step-review/                 — summary + submit
    └── confirmation/  confirmation.component.ts — post-booking success screen
```

### Auth flow

1. User logs in → `AuthService.login()` POSTs to `/auth/login`
2. Backend returns a JWT → stored in `localStorage` under key `pw_token`
3. `JwtInterceptor` reads the token and sets `Authorization: Bearer <token>` on every outgoing request
4. On any `401` response the interceptor calls `AuthService.logout()` and redirects to `/login`
5. `AuthGuard` blocks access to `/transfer` and `/confirmation` when no token is present

### Environment variables (Vercel frontend project)

| Variable | Description |
|---|---|
| `API_URL` | Backend base URL e.g. `https://pillway-6733.vercel.app` |
| `GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |

---

## Backend

| Item | Detail |
|---|---|
| Runtime | Node.js / TypeScript |
| Framework | Express 4 |
| ORM | Prisma 7 |
| Hosting | Vercel Serverless (`@vercel/node`) |
| URL | https://pillway-6733.vercel.app |

### Project structure

```
src/
├── config/
│   └── prisma.ts          — singleton PrismaClient with pg adapter
├── controllers/
│   ├── auth.controller.ts      — register / login handlers
│   └── bookings.controller.ts  — createBooking / getBookings handlers
├── middleware/
│   ├── authenticate.ts    — JWT verification, sets req.userId
│   └── errorHandler.ts    — centralised error → HTTP response mapping
├── routes/
│   ├── auth.routes.ts     — /auth prefix
│   └── bookings.routes.ts — /api/bookings prefix
└── types/
    └── express.d.ts       — extends Request with userId?: string
```

### Environment variables (Vercel backend project)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase connection string (pooled) |
| `DIRECT_URL` | Yes | Supabase direct connection string (for migrations) |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime, default `7d` |
| `FRONTEND_URL` | Yes | Allowed CORS origin e.g. `https://pillway-tawny.vercel.app` |
| `NODE_ENV` | Yes | Set to `production` on Vercel |

The server **exits immediately** at startup if `JWT_SECRET` or `DATABASE_URL` is missing.

---

## API Reference

Base URL: `https://pillway-6733.vercel.app`

All request and response bodies are `application/json`.  
Protected routes require `Authorization: Bearer <token>` header.

---

### Health

#### `GET /health`

Returns server status. No authentication required.

**Response `200`**
```json
{ "status": "ok", "timestamp": "2026-04-18T12:00:00.000Z" }
```

---

### Auth

#### `POST /auth/register`

Creates a new user account and returns a JWT.

**Request body**
```json
{
  "email":    "user@example.com",
  "password": "minimum6chars",
  "fullName": "Jane Smith"
}
```

| Field | Type | Rules |
|---|---|---|
| `email` | string | Required, valid email, normalised to lowercase |
| `password` | string | Required, min 6 characters |
| `fullName` | string | Optional |

**Response `201`**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "uuid", "email": "user@example.com", "fullName": "Jane Smith" }
}
```

**Errors**

| Status | Condition |
|---|---|
| `400` | Validation failure — `code: "VALIDATION_ERROR"` with `issues` array |
| `409` | Email already registered |

---

#### `POST /auth/login`

Authenticates an existing user and returns a JWT.

**Request body**
```json
{
  "email":    "user@example.com",
  "password": "yourpassword"
}
```

**Response `200`**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "uuid", "email": "user@example.com", "fullName": "Jane Smith" }
}
```

**Errors**

| Status | Condition |
|---|---|
| `400` | Validation failure |
| `401` | Invalid email or password |

---

### Bookings

All booking endpoints require a valid JWT.

#### `POST /api/bookings`

Creates a new prescription transfer booking for the authenticated user.  
The `userId` is read from the JWT — it is never accepted from the request body.

**Request body**
```json
{
  "pharmacy": {
    "name":              "Shoppers Drug Mart",
    "formatted_address": "123 Main St, Toronto, ON",
    "lat":               43.6532,
    "lng":              -79.3832,
    "place_id":          "ChIJ..."
  },
  "service_type":        "Transfer Prescription",
  "additional_services": ["Blister Pack", "Delivery"],
  "prescription_notes":  "Brand X only"
}
```

| Field | Type | Rules |
|---|---|---|
| `pharmacy.name` | string | Required |
| `pharmacy.formatted_address` | string | Required |
| `pharmacy.lat` | number | Required, -90 to 90 |
| `pharmacy.lng` | number | Required, -180 to 180 |
| `pharmacy.place_id` | string | Required, used for deduplication |
| `service_type` | string | Required |
| `additional_services` | string[] | Optional, defaults to `[]` |
| `prescription_notes` | string | Optional |

**Response `201`**
```json
{ "success": true, "booking_id": "uuid" }
```

**Errors**

| Status | Condition |
|---|---|
| `400` | Validation failure |
| `401` | Missing or invalid JWT |
| `500` | Unexpected database error |

---

#### `GET /api/bookings`

Returns all bookings for the authenticated user, most recent first.

**Response `200`**
```json
{
  "success": true,
  "bookings": [
    {
      "id":                 "uuid",
      "userId":             "uuid",
      "serviceType":        "Transfer Prescription",
      "additionalServices": ["Blister Pack"],
      "prescriptionNotes":  "Brand X only",
      "status":             "pending",
      "createdAt":          "2026-04-18T12:00:00.000Z",
      "pharmacy": {
        "name":             "Shoppers Drug Mart",
        "formattedAddress": "123 Main St, Toronto, ON"
      }
    }
  ]
}
```

**Errors**

| Status | Condition |
|---|---|
| `401` | Missing or invalid JWT |

---

## Database Schema

Hosted on Supabase (PostgreSQL). Managed via Prisma.

```
users
├── id           UUID  PK
├── email        TEXT  UNIQUE
├── password_hash TEXT
├── full_name    TEXT  nullable
└── created_at   TIMESTAMPTZ

pharmacies
├── id               UUID  PK
├── name             TEXT
├── formatted_address TEXT
├── lat              FLOAT
├── lng              FLOAT
├── place_id         TEXT  UNIQUE  ← deduplication key from Google Places
└── created_at       TIMESTAMPTZ

bookings
├── id                  UUID  PK
├── user_id             UUID  FK → users(id)  ON DELETE CASCADE
├── pharmacy_id         UUID  FK → pharmacies(id)
├── service_type        TEXT
├── additional_services TEXT[]
├── prescription_notes  TEXT  nullable
├── status              ENUM  (pending | confirmed | cancelled)  DEFAULT pending
└── created_at          TIMESTAMPTZ

INDEX bookings(user_id)
```

Row Level Security (RLS) is enabled on all three tables.

---

## Error response format

All errors follow a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable description",
  "code":    "ERROR_CODE"
}
```

Validation errors include an `issues` array:

```json
{
  "success": false,
  "code":    "VALIDATION_ERROR",
  "issues":  [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## Security measures

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt, cost factor 12 |
| Auth tokens | JWT, signed with `JWT_SECRET`, expires in 7 days |
| Transport | HTTPS enforced by Vercel on both frontend and backend |
| CORS | Backend accepts requests only from `FRONTEND_URL` |
| Security headers | `helmet` middleware (CSP, HSTS, X-Frame-Options, etc.) |
| Input validation | Zod schemas on all endpoints |
| SQL injection | Prisma parameterised queries — no raw SQL |
| Row Level Security | Enabled on all Supabase tables |
| Auth bypass prevention | `userId` always sourced from JWT, never from request body |

---

## Running locally

**Backend**
```bash
cd pillway/backend
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, FRONTEND_URL
npm install
npx prisma generate
npm run dev                   # http://localhost:3001
```

**Frontend**
```bash
cd pillway/frontend
cp .env.example .env          # fill in API_URL=http://localhost:3001, GOOGLE_MAPS_API_KEY
npm install
npm start                     # http://localhost:4200
```

**Tests**
```bash
cd pillway/backend  && npm test   # Jest + supertest
cd pillway/frontend && npm test   # Karma + Jasmine
```
