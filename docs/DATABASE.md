# Timbaktu Database Specification

Timbaktu uses **MongoDB** via **Mongoose**.

---

## 1. User Model (`User`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `username` | String | Unique, Index, Lowercase, Trim | 3-30 character username |
| `email` | String | Unique, Index, Lowercase, Trim | Valid email address |
| `passwordHash` | String | Required | 12-round bcrypt hash |
| `displayName` | String | Required, Max 50 | Author display name |
| `bio` | String | Max 250 | Author biography |
| `avatarUrl` | String | Optional | URL to avatar image |
| `preferences` | Object | Nested | `{ soundEnabled, introEnabled, theme }` |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Modification timestamp |

---

## 2. Post Model (`Post`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `authorId` | ObjectId | Ref: User, Index | Author foreign key |
| `title` | String | Required, Max 120 | Story title |
| `slug` | String | Unique, Index | URL-safe slug |
| `excerpt` | String | Max 300 | Short teaser |
| `contentHtml` | String | Required, Sanitized | Clean HTML body |
| `audio` | Object | Optional | `{ id, provider, url, mimeType, fileSizeBytes, durationSeconds }` |
| `coverImage` | Object | Optional | `{ id, provider, url, mimeType, fileSizeBytes }` |
| `tags` | [String] | Index | Lowercase story tags (max 6) |
| `readingTimeMinutes`| Number | Min 1 | Estimated reading time |
| `status` | String | 'draft' \| 'published' | Publication status |
| `visibility` | String | 'public' \| 'unlisted' \| 'private' | Access control |
| `publishedAt` | Date | Index | Publication timestamp |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Modification timestamp |

---

## 3. Database Indexes

To maintain sub-50ms query times at scale, the following indexes are defined:
1. `User.username`: Unique ascending index
2. `User.email`: Unique ascending index
3. `Post.slug`: Unique ascending index
4. `Post.compound_feed`: `{ status: 1, visibility: 1, publishedAt: -1 }` (optimizes public story feeds)
5. `Post.compound_author`: `{ authorId: 1, status: 1, updatedAt: -1 }` (optimizes author dashboard)
6. `Post.text_search`: Text index on `{ title: 'text', excerpt: 'text', tags: 'text' }` for keyword search.
