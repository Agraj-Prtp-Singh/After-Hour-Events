# Event Management Backend (Sprint 1)

Clean and standard Node.js backend architecture with Express + MongoDB (Mongoose).

## Architecture

- `src/routes`: API routes
- `src/controllers`: request/response handlers
- `src/services`: business logic
- `src/repositories`: data access layer
- `src/models`: Mongoose schemas
- `src/middlewares`: auth, error, not found, ObjectId validation
- `src/config`: env and database config
- `src/validators`: payload validation
- `docs`: concise API docs for Sprint 1

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Start development server:

```bash
npm run dev
```

`PORT=0` means Node chooses a free port automatically.
Check terminal log: `Server running on port <port>`, then use `http://localhost:<port>/api/v1`.

If you see `querySrv ECONNREFUSED _mongodb._tcp...`, your network is blocking SRV DNS.
Set `MONGODB_URI_DIRECT` in `.env` (Atlas direct `mongodb://...` format) and restart.

## OTP Email Setup (SMTP)

To send OTP to real inboxes, configure these in `.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

For Gmail, use an App Password and set:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`

Keep `OTP_EXPOSE_IN_RESPONSE=false` to avoid leaking OTP in API responses.

## Sprint 1 Modules

- Auth Module (`/auth`)
- Event Module (`/events`)
- Registration Module (`/registrations`)

## Ticket QR (Student Dashboard)

- `GET /api/v1/registrations/me` now includes a signed `ticket.qrPayload` for each active registration.
- Student dashboard can render that payload as a QR code on the ticket.
- Scanner flow: `GET /api/v1/registrations/ticket/scan?token=<qrPayload>` (Bearer token required).
- The scan endpoint returns the registered event details for that ticket.

Detailed endpoint docs: [docs/sprint1-apis.md](./docs/sprint1-apis.md)
