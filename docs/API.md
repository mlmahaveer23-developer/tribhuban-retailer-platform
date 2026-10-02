# API Contracts

## Status

No production APIs exist yet. This document defines the standards for all APIs built within the Next.js internal platform.

## API Style

**REST over HTTPS** for external-facing and module-boundary interfaces.

Next.js API Routes (`/api/*`) for the internal platform backend.

## Authentication

All API requests (except public endpoints) must include:

```
Authorization: Bearer <supabase_jwt_token>
```

The backend validates the JWT and extracts user identity and role.

## Request/Response Format

- **Content-Type**: `application/json`
- **Timestamps**: ISO 8601 (`2026-09-14T13:00:00Z`)
- **IDs**: UUID v4
- **Pagination**: Cursor-based for lists (`?cursor=<id>&limit=20`)

### Success Response

```json
{
  "data": { ... },
  "meta": { "cursor": "next_id", "has_more": true }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [ ... ]
  }
}
```

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Unauthorized (authenticated but lacking permission) |
| 404 | Not found |
| 409 | Conflict (duplicate, version mismatch) |
| 422 | Unprocessable entity |
| 429 | Rate limited |
| 500 | Internal server error |

## Rate Limiting

- Authentication endpoints: 5 requests/minute per IP
- Standard API: 100 requests/minute per user
- Bulk operations: 10 requests/minute per user

## Webhook Contracts

### Incoming (from Razorpay, Shopify, Partners)

1. Verify signature before processing
2. Return 200 immediately, process asynchronously
3. Handle duplicate deliveries (idempotency)
4. Log all webhook events

### Outgoing (to partner systems)

1. Use HTTPS with proper certificates
2. Include retry logic with exponential backoff
3. Log delivery status
4. Define failure handling per partner

## API Endpoints (Planned — Stage 1)

### Retailer Onboarding

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/retailers/register` | Register new retailer | Public (with rate limit) |
| GET | `/api/retailers/:id` | Get retailer profile | Retailer (own) or Sales Exec |
| POST | `/api/retailers/:id/survey` | Submit survey response | Retailer (own) |
| POST | `/api/retailers/:id/concerns` | Submit concern/feedback | Retailer (own) |
| PATCH | `/api/retailers/:id/status` | Update retailer status | Admin / Sales Exec |
| GET | `/api/admin/retailers` | List retailers (filtered) | Admin / Sales Exec |

Detailed endpoint specifications will be added as each module is implemented.
