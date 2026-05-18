# Sprint 2 API Docs (Short)

Base URL: `/api/v1`

## 1) Event Moderation APIs

### GET `/events/pending`
Purpose: List events waiting for admin moderation.  
Auth: Bearer token required (`admin`)  
Query (optional): `page`, `limit`  
Response: `200 OK` with items + pagination.

### PATCH `/events/:id/review`
Purpose: Approve or deny an event created/updated by planner.  
Auth: Bearer token required (`admin`)

Body (approve):
```json
{
  "decision": "approved"
}
```

Body (deny):
```json
{
  "decision": "denied",
  "denialReason": "Please update venue details and timing."
}
```

Response: `200 OK`

Notes:
- `decision` must be `approved` or `denied`.
- `denialReason` is required when `decision` is `denied`.
- Approval sets `approvalStatus=approved` and `isPublished=true`.
- Denial sets `approvalStatus=denied` and keeps `isPublished=false`.

## 2) Event Creation/Update Approval Behavior

### POST `/events`
Purpose: Create event (planner/admin).  
Auth: Bearer token required (`event_planner` or `admin`)  
Response: `201 Created`

Behavior:
- If creator is `event_planner`: event starts as `approvalStatus=pending`, `isPublished=false`.
- If creator is `admin`: event is auto-approved (`approvalStatus=approved`, `isPublished=true`).

### PATCH `/events/:id`
Purpose: Update event (owner/admin).  
Auth: Bearer token required (owner or admin)  
Response: `200 OK`

Behavior:
- Non-admin owner update moves event back to moderation (`approvalStatus=pending`, `isPublished=false`).
- Admin update retains review control.

## 3) Auth Password Recovery APIs

### POST `/auth/forgot-password`
Purpose: Start forgot-password flow and send reset OTP to email.  
Auth: No

Body:
```json
{
  "email": "user@example.com"
}
```

Response: `200 OK`
```json
{
  "success": true,
  "message": "If the email exists, password reset instructions have been sent",
  "data": {
    "message": "If the email exists, password reset instructions have been sent"
  }
}
```

Notes:
- Always returns success-style response to avoid leaking whether an email exists.
- Reset OTP expiry is controlled by `PASSWORD_RESET_EXPIRES_MINUTES` (default `15`).

### POST `/auth/reset-password`
Purpose: Reset password using OTP received via email.  
Auth: No

Body:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newStrongPassword"
}
```

Response: `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "message": "Password reset successful"
  }
}
```

Notes:
- `newPassword` must be at least 6 characters.
- `otp` must be a 6-digit code.
- Invalid/expired OTP returns `400 Bad Request`.
- Max attempts is controlled by `PASSWORD_RESET_MAX_ATTEMPTS` (default `5`).

## 4) AI Chatbot API

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
    "source": "gemini"
  }
}
```

Notes:
- `question` is required and must be a non-empty string (max 1000 chars).
- If `GEMINI_API_KEY` is configured, chatbot uses Gemini (`source: "gemini"`).
- If Gemini is not configured or fails, chatbot uses local fallback (`source: "fallback"`).

### Gemini Health Check (Chatbot)
Use this endpoint to verify Gemini integration:
- Send POST `/api/v1/chatbot/ask` with any normal question.
- If response `data.source` is `gemini`, integration is working.
- If response `data.source` is `fallback`, Gemini key/config is missing or request failed.

## 5) Vendor APIs

### GET `/vendor/events`
Purpose: List published events available for vendors.  
Auth: Bearer token required (`vendor`)  
Query (optional): `search`  
Response: `200 OK`

### POST `/vendor/apply/:eventId`
Purpose: Submit vendor application to an event.  
Auth: Bearer token required (`vendor`)

Body (optional):
```json
{
  "message": "We provide sound system and stage setup."
}
```

Response: `201 Created`

Notes:
- Prevents duplicate applications for same vendor+event.
- Returns `409 Conflict` if vendor already applied.

### GET `/vendor/applications`
Purpose: List current vendor's applications.  
Auth: Bearer token required (`vendor`)  
Response: `200 OK`

### GET `/vendor/profile`
Purpose: Fetch current vendor profile.  
Auth: Bearer token required (`vendor`)  
Response: `200 OK`

## 6) Planner Vendor Review APIs

### GET `/planner/vendor-applications`
Purpose: List vendor applications for planner-owned events.  
Auth: Bearer token required (`event_planner` or `admin`)  
Query (optional): `status` (`pending`, `approved`, `rejected`)  
Response: `200 OK`

### PATCH `/planner/vendor-applications/:applicationId/review`
Purpose: Approve or reject vendor application.  
Auth: Bearer token required (`event_planner` owner of event or `admin`)

Body (approve):
```json
{
  "decision": "approved"
}
```

Body (reject):
```json
{
  "decision": "rejected",
  "rejectionReason": "Vendor slots are full for this category."
}
```

Response: `200 OK`

Notes:
- `decision` must be `approved` or `rejected`.
- `rejectionReason` is required when `decision` is `rejected`.
- Approval enforces event `vendorLimit`; returns `409 Conflict` if limit reached.
- Approval/rejection creates vendor notification records.
## Standard Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```
