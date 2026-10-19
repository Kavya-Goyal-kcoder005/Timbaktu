# Timbaktu Production Deployment Guide

This guide outlines the production deployment strategy for Timbaktu.

---

## 1. Frontend Deployment (Vercel)

1. Connect the GitHub repository to **Vercel**.
2. Set the **Root Directory** to `apps/web`.
3. Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-api-domain.onrender.com/api/v1`
5. The bundled [`apps/web/vercel.json`](file:///c:/Users/DELL/OneDrive/Desktop/Timbaktu/apps/web/vercel.json) handles client-side route rewrites and security headers automatically.

---

## 2. Backend Deployment (Render)

1. Create a **Web Service** on **Render** (or use the provided [`render.yaml`](file:///c:/Users/DELL/OneDrive/Desktop/Timbaktu/render.yaml) Blueprint).
2. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build --workspace=@timbaktu/shared && npm run build --workspace=@timbaktu/api`
   - **Start Command**: `npm run start --workspace=@timbaktu/api`
   - **Health Check Path**: `/health`
3. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/timbaktu?retryWrites=true&w=majority`
   - `JWT_SECRET`: Random 64-character secret string
   - `SESSION_SECRET`: Random 64-character secret string
   - `CORS_ORIGIN`: `https://your-timbaktu-web.vercel.app`
   - `PUBLIC_APP_URL`: `https://your-timbaktu-web.vercel.app`
   - `STORAGE_PROVIDER`: `local` (or `cloudinary`)

---

## 3. MongoDB Atlas Configuration

1. Create an M0/M10 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user with `readWrite` access to the `timbaktu` database.
3. Under **Network Access**, allow access from Render's IP addresses (or `0.0.0.0/0` with strong password authentication).
4. Copy the connection string to `MONGODB_URI`.
