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
  "fullName": "Aarav Sharma",
  "phone": "+9779812345678",
  "email": "aarav@example.com",
  "password": "secret123",
  "role": "user"
}
```
Response: `201 Created` with `token` and `user`.

### POST `/auth/login`
Purpose: Login existing user.
Auth: No
Body:
```json
{
  "email": "aarav@example.com",
  "password": "secret123"
}
```
Response: `200 OK` with `token` and `user`.

### GET `/auth/me`
Purpose: Get current logged-in profile.
Auth: Bearer token required
Response: `200 OK` with user profile.

## 3) Event APIs
### POST `/events`
Purpose: Create an event.
Auth: Bearer token required (`organizer` or `admin`)
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

### DELETE `/events/:id`
Purpose: Delete event.
Auth: Bearer token required (owner or admin)
Response: `204 No Content`

### GET `/events/:id/registrations`
Purpose: List registrations of one event.
Auth: Bearer token required (owner or admin)
Response: `200 OK`

## 4) Registration APIs
### POST `/events/:id/register`
Purpose: Register logged-in user to an event.
Auth: Bearer token required
Response: `201 Created`

### DELETE `/events/:id/register`
Purpose: Cancel logged-in user's registration.
Auth: Bearer token required
Response: `200 OK`

### GET `/registrations/me`
Purpose: List current user's registered events.
Auth: Bearer token required
Response: `200 OK`

## Standard Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```
