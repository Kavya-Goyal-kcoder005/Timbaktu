# Timbaktu Testing & QA Documentation

Timbaktu maintains an automated test suite across all packages and applications.

---

## 1. Running Tests

```bash
# Run all tests across the monorepo:
npm test

# Run backend API tests (in-memory MongoDB):
npm run test --workspace=@timbaktu/api

# Run frontend UI component tests:
npm run test --workspace=@timbaktu/web
```

---

## 2. Test Coverage Summary

### Backend Tests (`apps/api/tests`)
- **`health.test.ts`**:
  - `GET /health`: Verifies healthy service status, database connection, and uptime reporting.
  - `GET /`: Verifies root welcome response.
- **`api.test.ts`**:
  - **Auth & Registration**: Valid registration, password hashing verification, duplicate username rejection, duplicate email rejection.
  - **Login & Sessions**: Login with email/username, password validation, 401 on incorrect credentials, authenticated `/auth/me` check, unauthenticated rejection.
  - **Post CRUD & Publishing**: Creation with slug generation, reading time calculation, HTML sanitization (stripping `<script>` tags).
  - **Server-Side Ownership Enforcement**: Proves that User 2 attempting to update or delete User 1's post is strictly blocked with `HTTP 403 Forbidden`.
  - **Feed & Discovery**: Public post listing, tag filtering, full-text search.
  - **Exports**: Markdown generation, clean standalone HTML generation, PDF document generation with PDFKit.
  - **Moderation**: Content report submission.

### Frontend Tests (`apps/web/tests`)
- **`TimbaktuBird.test.tsx`**: Mascot rendering, animation states, and speech bubbles.
- **`Button.test.tsx`**: Button variants, loading spinner states, and disabled behavior.
