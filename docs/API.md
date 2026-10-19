# Timbaktu REST API Reference

Base URL: `/api/v1`

---

## 1. Health & Status
- **`GET /health`**
  - Returns: `{ status: "healthy", service: "timbaktu-api", database: "connected", uptime: 123 }`

---

## 2. Authentication (`/api/v1/auth`)
- **`POST /auth/register`**
  - Body: `{ displayName, username, email, password, confirmPassword }`
  - Response: `201 Created` with User JSON & sets `timbaktu_token` HttpOnly cookie.
- **`POST /auth/login`**
  - Body: `{ login: "username or email", password }`
  - Response: `200 OK` with User JSON & sets `timbaktu_token` cookie.
- **`POST /auth/logout`**
  - Clears `timbaktu_token` cookie.
- **`GET /auth/me`**
  - Requires Auth. Returns current authenticated user profile.

---

## 3. Users (`/api/v1/users`)
- **`GET /users/:username`**
  - Returns public profile, story count, and total voiceover duration.
- **`PATCH /users/me`**
  - Requires Auth. Updates `displayName`, `bio`, `avatarUrl`, or `preferences`.

---

## 4. Posts (`/api/v1/posts`)
- **`GET /posts`**
  - Query parameters:
    - `page` (default 1)
    - `limit` (default 10)
    - `tag` (filter by tag)
    - `author` (filter by username)
    - `mine=true` (author's own posts, including drafts)
    - `q` (text search)
- **`POST /posts`**
  - Requires Auth.
  - Body: `{ title, excerpt?, contentHtml, audio?, tags?, status: "draft" | "published" }`
  - Automatically calculates reading time, sanitizes HTML, and generates slug.
- **`GET /posts/:slug`**
  - Fetches post by unique slug. Drafts/private posts accessible only by author.
- **`PATCH /posts/:id`**
  - Requires Auth + Author Ownership. Updates post fields.
- **`DELETE /posts/:id`**
  - Requires Auth + Author Ownership. Deletes post & cleans up attached audio.
- **`POST /posts/:id/publish`**
  - Requires Auth + Author Ownership. Sets status to published.
- **`POST /posts/:id/unpublish`**
  - Requires Auth + Author Ownership. Reverts status to draft.

---

## 5. Media (`/api/v1/media`)
- **`POST /media/upload`**
  - Requires Auth. Multipart form upload (`file`, `durationSeconds`).
- **`GET /media/stream/:filename`**
  - Streams media supporting HTTP 206 Partial Content range requests.
- **`DELETE /media/:id`**
  - Requires Auth. Deletes media asset.

---

## 6. Exports & Moderation
- **`GET /posts/:id/export?format=md|html|pdf|audio`**
  - Exports post in requested format with `Content-Disposition: attachment`.
- **`POST /posts/:id/report`**
  - Body: `{ reason: "spam" | "offensive" | ..., details? }`
