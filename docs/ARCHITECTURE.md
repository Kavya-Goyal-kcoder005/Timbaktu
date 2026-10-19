# Timbaktu Architecture Specification

## 1. System Overview
Timbaktu is structured as a TypeScript monorepo with strict boundaries between frontend presentation, backend business logic, and shared domain contracts.

```
+--------------------------------------------------------------------+
|                         CLIENT BROWSER                             |
|  - React 19 SPA (Vite)                                             |
|  - TipTap Editor (Rich Text Content)                               |
|  - Web Audio API (Signature Jingle Synthesizer)                    |
|  - MediaRecorder API (Microphone Voice Capture)                    |
|  - TanStack Query (Server State Cache & Invalidation)              |
+---------------------------------+----------------------------------+
                                  |
                                  | HTTPS / REST / HttpOnly Cookies
                                  v
+--------------------------------------------------------------------+
|                         EXPRESS BACKEND                            |
|  - Security Middleware: Helmet, CORS, Rate Limiting, Cookie Parser |
|  - Authentication: JWT Session Verification (Cookie or Bearer)     |
|  - Post Domain Engine: HTML Sanitization, Reading Time, Slugs      |
|  - Server-Side Ownership Enforcement (Forbidden 403 on tampering)  |
|  - Export Generation: Markdown, Clean HTML, PDFKit, Audio Stream   |
+-------------------+--------------------------------+---------------+
                    |                                |
                    v                                v
+----------------------------------+ +-------------------------------+
|         DATABASE LAYER           | |      MEDIA STORAGE SERVICE    |
| - Mongoose Schemas & Validation  | | - LocalDiskStorageProvider    |
| - MongoDB Atlas (Production)     | |   (HTTP 206 Range Streaming)  |
| - MongoMemoryServer (Dev & CI)   | | - Cloudinary / S3 Adapters    |
+----------------------------------+ +-------------------------------+
```

## 2. Key Architectural Decisions

### 2.1 The Mascot & Offline Web Audio Synthesis
Rather than relying on external MP3/WAV files that can fail due to CORS, network latency, or copyright, Timbaktu implements:
1. **SVG Vector Mascot**: 100% offline, scale-independent, CSS keyframe-animated.
2. **Web Audio API Jingle**: Synthesizes the musical motif ("*Tu tu tu tu... Timbaktu!*") in real time using oscillator nodes with gentle pitch bends and volume envelopes. Respects browser autoplay restrictions by only triggering after explicit user interaction.

### 2.2 Media Storage Abstraction
MongoDB strictly holds metadata (file size, duration, URL, MIME type). Binary audio and image assets are stored via the `IMediaStorageProvider` abstraction:
- In local development, `LocalDiskStorageProvider` stores recordings in `./uploads` and streams them via HTTP 206 Partial Content range requests, enabling browser audio scrubbing.
- In production, adapters stream directly to Cloudinary or Amazon S3.

### 2.3 Server-Side Ownership & Security
All mutation endpoints (`PATCH /api/v1/posts/:id`, `DELETE /api/v1/posts/:id`, `publish`, `unpublish`) strictly enforce:
```typescript
if (!post.authorId.equals(req.user._id)) {
  throw new AppError('Forbidden: You can only modify your own posts.', 403, 'FORBIDDEN');
}
```
Client-side state never dictates ownership.
