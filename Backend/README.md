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

## Sprint 1 Modules

- Auth Module (`/auth`)
- Event Module (`/events`)
- Registration Module (`/registrations`)

Detailed endpoint docs: [docs/sprint1-apis.md](./docs/sprint1-apis.md)
