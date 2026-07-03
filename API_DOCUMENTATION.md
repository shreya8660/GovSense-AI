# GovSense AI — API Documentation

Base URL: `http://localhost:5000/api` (local) or `https://your-backend.onrender.com/api` (deployed)

All responses follow this envelope:
```json
{ "success": true, "message": "...", "data": { ... }, "meta": { ... } }
```
Errors:
```json
{ "success": false, "message": "..." }
```

**Auth header** (for protected routes): `Authorization: Bearer <jwt>`
**Roles**: `citizen` | `officer` | `admin` | `system` (n8n via `x-api-key`)

---

## Auth — `/api/auth`

### POST `/register` — Public
Registers a new citizen and returns a token (auto-login).
```json
// Request
{ "name": "Jane Citizen", "email": "jane@example.com", "password": "SecurePass123", "phone": "+919876543210" }

// Response 201
{ "success": true, "message": "Registration successful",
  "data": { "token": "eyJ...", "role": "citizen", "user": { "_id": "...", "name": "Jane Citizen", "email": "jane@example.com", "isEmailVerified": false } } }
```

### POST `/login` — Public
```json
// Request
{ "email": "jane@example.com", "password": "SecurePass123", "role": "citizen" }
// role must be "citizen" | "officer" | "admin"

// Response 200
{ "success": true, "message": "Login successful", "data": { "token": "eyJ...", "role": "citizen", "user": { ... } } }
```

### POST `/logout` — Private
Stateless; simply gives the client a clean endpoint to call. No body required.

### GET `/profile` — Private
Returns the logged-in account (officer responses include populated `department`).

### PUT `/profile` — Private
Body accepts any of: `name`, `phone`, `avatar`, `preferredLanguage`.

### PUT `/change-password` — Private
```json
{ "currentPassword": "old...", "newPassword": "new12345" }
```

### POST `/forgot-password` — Public
```json
{ "email": "jane@example.com", "role": "citizen" }
```
Always returns a generic success message (does not reveal whether the account exists).

### PUT `/reset-password/:token?role=citizen` — Public
```json
{ "password": "newPassword123" }
```

### GET `/verify-email/:token` — Public
Marks the citizen's `isEmailVerified` as `true`.

---

## Feedback — `/api/feedback`

### POST `/` — Private (Citizen), `multipart/form-data`
Runs AI analysis synchronously before responding.

| Field | Required | Notes |
|---|---|---|
| `policyName` | ✅ | free text |
| `policy` | | ObjectId, if linked to a formal Policy |
| `department` | ✅ | ObjectId |
| `category` | ✅ | ObjectId |
| `title` | ✅ | |
| `description` | ✅ | |
| `rating` | ✅ | 1-5 |
| `location` | | |
| `inputMode` | | `text` \| `voice` |
| `language` | | `en` \| `hi` \| `kn` \| `ta` |
| `attachment` | | file (jpg/png/webp/pdf/doc/docx, ≤5MB) |

```json
// Response 201 (excerpt)
{ "success": true, "message": "Feedback submitted and analyzed successfully",
  "data": { "feedback": {
    "_id": "...", "title": "...", "status": "pending",
    "ai": {
      "sentiment": { "label": "negative", "confidenceScore": 0.87 },
      "emotion": "concerned",
      "keywords": ["water", "delay", "infrastructure"],
      "summary": "Citizen reports delayed water infrastructure repairs.",
      "provider": "gemini"
    }
  } } }
```

### GET `/` — Private (Officer/Admin)
Query params: `page`, `limit`, `department`, `category`, `status`, `sentiment`, `search`, `sortBy`.
Returns `data.items[]` + `meta.{total,page,limit,totalPages}`.

### GET `/my` — Private (Citizen)
Same pagination shape, scoped to the logged-in citizen.

### GET `/:id` — Private (owner citizen, or officer/admin)

### PUT `/:id` — Private
Citizen may edit `title`/`description`/`rating`/`location`/`category` while `status === 'pending'`
(re-runs AI analysis if title/description changed). Officer/Admin may also set `status`/`isPublic`.

### DELETE `/:id` — Private
Owner citizen while pending, or Admin at any time.

### PUT `/:id/approve` — Private (Officer/Admin)
```json
{ "decision": "approved" } // or "rejected"
```

---

## AI — `/api/ai`

### POST `/analyze` — Private (Officer/Admin)
Either re-analyze an existing feedback, or analyze arbitrary text:
```json
{ "feedbackId": "..." }
// or
{ "title": "...", "description": "..." }
```

---

## Dashboard — `/api/dashboard`
Accessible with an Officer/Admin JWT, **or** header `x-api-key: <N8N_API_KEY>`.

### GET `/stats?department=`
```json
{ "data": { "stats": {
  "total": 240, "positive": 140, "negative": 60, "neutral": 40,
  "avgRating": 3.8, "departmentCount": 5, "negativePercentage": 25.0
} } }
```

### GET `/charts`
```json
{ "data": {
  "pie": [{ "name": "positive", "value": 140 }, ...],
  "bar": [{ "department": "Ministry of Health", "positive": 40, "negative": 10, "neutral": 5 }, ...],
  "line": [{ "month": "Feb 2026", "total": 30, "positive": 18, "negative": 8, "neutral": 4 }, ...]
} }
```

---

## Reports — `/api/report`
Same auth as Dashboard (JWT or `x-api-key`). Returns a binary file (not JSON).

### GET `/pdf?department=&range=weekly|monthly&start=&end=`
Returns `application/pdf`.

### GET `/excel?department=&range=weekly|monthly&start=&end=`
Returns `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

## Departments — `/api/departments`
| Method | Path | Access |
|---|---|---|
| GET | `/?activeOnly=true` | Public |
| GET | `/:id` | Public |
| POST | `/` | Admin — `{ name, code, description?, contactEmail?, contactPhone? }` |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

## Categories — `/api/categories`
| Method | Path | Access |
|---|---|---|
| GET | `/?activeOnly=true` | Public |
| POST | `/` | Admin — `{ name, description?, icon? }` |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

## Policies — `/api/policies`
| Method | Path | Access |
|---|---|---|
| GET | `/?department=&category=&status=&search=&page=&limit=` | Public |
| GET | `/:id` | Public (increments `viewCount`) |
| POST | `/` | Admin — `{ title, description, department, category?, status?, tags?, consultationStartDate?, consultationEndDate? }` |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

---

## Admin — `/api/admin` (all routes require an Admin JWT)

| Method | Path | Body / Query |
|---|---|---|
| GET | `/users?search=&page=&limit=` | — |
| PUT | `/users/:id/status` | `{ isActive }` |
| DELETE | `/users/:id` | — |
| GET | `/officers?search=&department=&page=&limit=` | — |
| POST | `/officers` | `{ name, email, password, department, designation?, employeeId? }` (auto-approved) |
| PUT | `/officers/:id/approve` | `{ approve: boolean }` |
| PUT | `/officers/:id` | `{ name?, phone?, department?, designation?, employeeId?, isActive? }` |
| DELETE | `/officers/:id` | — |
| GET | `/analytics` | — user/officer/department/feedback counts + 6-month citizen growth |
| GET | `/logs?action=&page=&limit=` | — |
| GET | `/settings` | — |
| PUT | `/settings` | `{ siteName?, negativeAlertThreshold?, maintenanceMode?, supportEmail?, allowCitizenRegistration? }` |

---

## Health check

### GET `/api/health` — Public
```json
{ "success": true, "message": "GovSense AI API is running", "timestamp": "2026-07-03T..." }
```
