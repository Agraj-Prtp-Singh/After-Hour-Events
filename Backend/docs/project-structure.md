# Project Structure Guide

This document explains what each folder in this repository is used for.

## Root (`Event-Management-System/`)

- `Backend/`: Main backend application (Node.js + Express + MongoDB).
- `.gitignore`: Files/folders Git should ignore.
- `package.json`: Root-level npm metadata/scripts (if used by your setup).
- `README.md`: High-level project overview and setup notes.

## Backend (`Backend/`)

- `docs/`: Project documentation.
- `node_modules/`: Installed npm dependencies (auto-generated).
- `src/`: Application source code.

## Backend Docs (`Backend/docs/`)

- `sprint1-apis.md`: Short API reference for Sprint 1 endpoints.
- `examples/`: Example payloads/usages used by docs.

## Backend Source (`Backend/src/`)

- `app.js`: Express app setup (middlewares, routes, error handlers).
- `server.js`: Server bootstrap (starts app, connects runtime pieces).

### `config/`

- Environment and infrastructure configuration.
- Example: DB config, `.env` parsing/validation, runtime settings.

### `constants/`

- Shared constant values used across the app.
- Example: roles, HTTP status codes.

### `controllers/`

- Route handlers for request/response flow.
- Accept request data and call services.

### `middlewares/`

- Express middlewares for auth, errors, not-found handling, validation guards.

### `models/`

- Mongoose schemas/models for MongoDB collections.
- Example: `user`, `event`, `registration`.

### `repositories/`

- Data access layer (database queries grouped per entity).
- Keeps DB logic separate from business logic.

### `routes/`

- API route definitions and route grouping (`/auth`, `/events`, `/registrations`).

### `scripts/`

- One-off or maintenance scripts (migrations, data sync helpers).

### `services/`

- Core business logic.
- Coordinates repositories, validations, and domain rules.

### `utils/`

- Reusable helper utilities.
- Example: custom error class, async wrapper, pagination helper.

### `validators/`

- Request payload validation logic for APIs.

