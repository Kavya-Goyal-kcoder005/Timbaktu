# TIMBAKTU 🐦
> *"Stories sound better here."*

Timbaktu is a complete, full-stack talking-blogging web platform where editorial prose and human voice unite. Writers compose articles, record voice narrations directly in the browser, and publish both together—giving visitors the choice to read, listen, or both.

---

## 🌟 Key Features

- **The Talking-Blogging Format**: Read the article with crisp editorial typography or press play to hear the author's voice narration.
- **Timbaktu the Cuckoo**: Original SVG mascot component with 7 animation states (`idle`, `hopping`, `dancing`, `listening`, `recording`, `celebrating`, `sleeping`).
- **Signature Musical Identity**: Original Web Audio API synthesized jingle ("*Tu tu tu tu... Timbaktu!*"), 100% offline, zero copyright, respecting browser autoplay policies and user audio preferences.
- **In-Browser Audio Recording**: Record voice narration via the MediaRecorder API, preview with scrubbing, re-record, and upload directly to media storage.
- **TipTap Rich Text Editor**: Editorial article formatting including headings, quotes, lists, links, and bold/italic styles.
- **Full End-to-End CRUD**: Create, read, update, publish/unpublish, and delete posts with strict server-side ownership authorization.
- **Multi-Format Export**: One-click exports to Markdown, self-contained HTML, high-quality PDF (PDFKit), and direct narration audio download.
- **Social Sharing & Discovery**: Web Share API integration, fallback link copying, tag discovery, and full-text search.
- **Zero-Config Local Dev**: Auto-booting embedded MongoDB (`mongodb-memory-server`) and local media streaming with HTTP 206 Range headers when external database credentials are not yet supplied.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, TipTap, Lucide Icons, Web Audio API |
| **Backend** | Node.js, Express, TypeScript, Mongoose, Zod, bcrypt (12 rounds), jsonwebtoken, cookie-parser, helmet, cors |
| **Database** | MongoDB Atlas (Production) / In-Memory MongoDB (Local Dev & CI Tests) |
| **Media Storage** | Local Disk with HTTP 206 streaming (Dev) / Cloudinary & AWS S3 abstraction (Production) |
| **Testing** | Vitest, Supertest, Testing Library |
| **Deployment** | Vercel (Frontend), Render (Backend), GitHub Actions CI |

---

## 📁 Repository Structure

```
timbaktu/
├── apps/
│   ├── api/                 # Express REST API backend
│   │   ├── src/
│   │   │   ├── config/      # Environment & database connection
│   │   │   ├── middleware/  # Auth, validation, and error handling
│   │   │   ├── models/      # Mongoose User & Post schemas
│   │   │   ├── modules/     # Auth, Users, Posts, Media, Exports, Reports
│   │   │   └── services/    # Media storage abstraction (Local/Cloudinary/S3)
│   │   └── tests/           # Comprehensive API integration tests
│   └── web/                 # React frontend application
│       ├── src/
│       │   ├── components/  # Mascot, Audio, Editor, Navigation, Shared UI
│       │   ├── context/     # AuthContext session management
│       │   ├── pages/       # Home, PostDetail, Create, Edit, Dashboard, Profile, Settings
│       │   └── utils/       # Web Audio API jingle synthesizer
│       └── tests/           # Mascot and component unit tests
├── packages/
│   └── shared/              # Shared types, Zod schemas, and utilities
├── docs/                    # Architecture, API, Database, Deployment & Testing docs
├── .github/workflows/       # GitHub Actions CI workflow
├── .env.example             # Documented environment variables
└── render.yaml              # Render deployment configuration
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/your-username/timbaktu.git
cd timbaktu
npm install
```

### 3. Build Shared Library
```bash
npm run build --workspace=@timbaktu/shared
```

### 4. Run Both Web & API Concurrently
```bash
# In Terminal 1 (Start API on http://localhost:5000):
npm run dev:api

# In Terminal 2 (Start Web on http://localhost:5173):
npm run dev:web
```
*Note: If no `MONGODB_URI` is provided, the API automatically spins up a local in-memory MongoDB instance with zero configuration required!*

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Run all automated unit and integration tests across workspaces:
```bash
npm test
```

Run tests individually:
```bash
# Backend API tests (21 tests covering Auth, CRUD, Ownership, and Exports):
npm run test --workspace=@timbaktu/api

# Frontend component tests:
npm run test --workspace=@timbaktu/web
```

---

## 🌐 Production Deployment

Refer to [`docs/DEPLOYMENT.md`](file:///c:/Users/DELL/OneDrive/Desktop/Timbaktu/docs/DEPLOYMENT.md) for step-by-step instructions on deploying the Web application to **Vercel** and the API service to **Render** with MongoDB Atlas.

---

## 📄 Documentation

- [Architecture Overview](file:///c:/Users/DELL/OneDrive/Desktop/Timbaktu/docs/ARCHITECTURE.md)
- [REST API Reference](file:///c:/Users/DELL/OneDrive/Desktop/Timbaktu/docs/API.md)
- [Database Models & Indexes](file:///c:/Users/DELL/OneDrive/Desktop/Timbaktu/docs/DATABASE.md)
- [Deployment Guide](file:///c:/Users/DELL/OneDrive/Desktop/Timbaktu/docs/DEPLOYMENT.md)
- [Testing & Quality Assurance](file:///c:/Users/DELL/OneDrive/Desktop/Timbaktu/docs/TESTING.md)
