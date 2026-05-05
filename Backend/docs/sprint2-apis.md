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

## 3) AI Chatbot API

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
- `question` is required and must be a non-empty string (max 1000 chars).
- If `OPENAI_API_KEY` is configured, chatbot uses OpenAI (`source: "openai"`).
- If OpenAI is not configured or fails, chatbot uses local fallback (`source: "fallback"`).

### OpenAI Health Check (Chatbot)
Use this endpoint to verify OpenAI integration:
- Send POST `/api/v1/chatbot/ask` with any normal question.
- If response `data.source` is `openai`, integration is working.
- If response `data.source` is `fallback`, OpenAI key/config is missing or request failed.

## Standard Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```
