# Sprint 1 API Docs (Short)

Base URL: `/api/v1`

## 1) Health Check
### GET `/health`
Purpose: Verify backend is running.
Auth: No
Response: `200 OK`

## 2) Auth APIs
### POST `/auth/register`
Purpose: Create a user account.
Auth: No
Body:
```json
{
  "fullName": "Rohan Shrestha",
  "phone": "+9779812345678",
  "email": "rohan@example.com",
  "password": "secret123",
  "role": "student"
}
```
Response: `201 Created` with `token` and `user`.
Supported roles: `student`, `vendor`, `event_planner`, `admin`.

### POST `/auth/login`
Purpose: Login existing user.
Auth: No
Body:
```json
{
  "email": "rohan@example.com",
  "password": "secret123"
}
```
Response: `200 OK` with `token` and `user`.

### GET `/auth/me`
Purpose: Get current logged-in profile.
Auth: Bearer token required
Response: `200 OK` with user profile.

### POST `/auth/otp/send`
Purpose: Generate OTP for an existing user and send it to their email.
Auth: No
Body:
```json
{
  "email": "aarav@example.com"
}
```
Response: `200 OK` with OTP expiry info.
The generated OTP is emailed using SMTP.
Optional debug mode: if `OTP_EXPOSE_IN_RESPONSE=true`, the OTP is also included in the API response.

### POST `/auth/otp/verify`
Purpose: Verify OTP and issue auth token.
Auth: No
Body:
```json
{
  "email": "aarav@example.com",
  "otp": "123456"
}
```
Response: `200 OK` with `token` and `user`.

## 3) Event APIs
### POST `/events`
Purpose: Create an event.
Auth: Bearer token required (`event_planner` or `admin`)
Body:
```json
{
  "title": "Tech Meetup 2026",
  "description": "A meetup for developers and startups.",
  "location": "Kathmandu",
  "startDate": "2026-05-12T10:00:00.000Z",
  "endDate": "2026-05-12T14:00:00.000Z",
  "capacity": 100,
  "tags": ["tech", "networking"]
}
```
Response: `201 Created`
Approval behavior:
- If created by `event_planner`: event is created as `pending` and `isPublished=false` (not visible in public listing until admin approval).
- If created by `admin`: event is auto-approved and published (`approvalStatus=approved`, `isPublished=true`).

### GET `/events`
Purpose: List published events.
Auth: No
Query (optional): `page`, `limit`, `search`, `fromDate`, `toDate`
Response: `200 OK` with items + pagination.

### GET `/events/:id`
Purpose: Get one event by id.
Auth: No
Response: `200 OK` or `404 Not Found`

### PATCH `/events/:id`
Purpose: Update event.
Auth: Bearer token required (owner or admin)
Body: Any event fields to update
Response: `200 OK`
Approval behavior:
- If updated by non-admin owner: event is moved back to `pending` and unpublished until re-approved by admin.
- Admin updates keep review control.

### DELETE `/events/:id`
Purpose: Delete event.
Auth: Bearer token required (owner or admin)
Response: `204 No Content`

### GET `/events/:id/registrations`
Purpose: List registrations of one event.
Auth: Bearer token required (owner or admin)
Response: `200 OK`

### GET `/events/pending`
Purpose: List events waiting for moderation.
Auth: Bearer token required (`admin`)
Query (optional): `page`, `limit`
Response: `200 OK` with items + pagination.

### PATCH `/events/:id/review`
Purpose: Approve or deny a pending event.
Auth: Bearer token required (`admin`)
Body:
```json
{
  "decision": "approved"
}
```
or
```json
{
  "decision": "denied",
  "denialReason": "Please update venue details and timing."
}
```
Response: `200 OK`
Notes:
- `decision` must be `approved` or `denied`.
- `denialReason` is required when decision is `denied`.

## 4) Registration APIs
### POST `/events/:id/register`
Purpose: Register logged-in user to an event.
Auth: Bearer token required
Response: `201 Created`
Only published (approved) events can be registered.

### DELETE `/events/:id/register`
Purpose: Cancel logged-in user's registration.
Auth: Bearer token required
Response: `200 OK`

### GET `/registrations/me`
Purpose: List current user's registered events.
Auth: Bearer token required
Response: `200 OK`
Each registration now includes a `ticket.qrPayload` signed token for QR generation in the student dashboard.

### GET `/registrations/ticket/scan?token=<qrPayload>`
Purpose: Resolve a ticket QR payload into registration + event details.
Auth: Bearer token required (must be the same logged-in user that owns the ticket)
Response: `200 OK`

## 5) AI Chatbot API
### POST `/chatbot/ask`
Purpose: Ask backend assistant for system navigation and feature explanations.
Auth: No
Body:
```json
{
  "question": "How do I register for an event?"
}
```
Response: `200 OK`
```json
{
  "success": true,
  "message": "Chatbot response generated successfully",
  "data": {
    "answer": "To register for an event, call POST /api/v1/events/:id/register with a Bearer token...",
    "source": "openai"
  }
}
```
Notes:
- If `OPENAI_API_KEY` is set, response source is usually `openai`.
- If OpenAI settings are missing or request fails, backend falls back to an internal rule-based assistant (`source: fallback`).

## Standard Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```
