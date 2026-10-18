# Warung Nusantara - Toko Online (Tugas Personal Lab 2, Week 8)

Lanjutan Tugas Lab 1: ditambah autentikasi JWT, proteksi route, pesanan, deployment, dan Google Analytics 4.
Frontend React (Vite) + backend Express + MongoDB.

## Jalankan lokal
Butuh Node.js 18+ dan MongoDB (lokal atau Atlas).
```bash
# terminal 1
cd backend && cp .env.example .env    # isi MONGODB_URI dan JWT_SECRET
npm install && npm start              # http://localhost:4000
# terminal 2
cd frontend && cp .env.example .env   # isi VITE_GA_ID untuk mengaktifkan GA4 (opsional)
npm install && npm run dev            # http://localhost:5173
```

## Deploy
1. Database: MongoDB Atlas (cluster M0, user database, Network Access `0.0.0.0/0`).
2. Backend -> Render. Root Directory `backend`, Start `npm start`. Env: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `ADMIN_EMAILS`. Lihat `render.yaml`.
3. Frontend -> Vercel/Netlify. Root Directory `frontend`. Env: `VITE_API_URL` (URL Render), `VITE_GA_ID`.
4. Ubah `FRONTEND_URL` di Render menjadi alamat frontend (tanpa slash di akhir).
Detail lengkap ada di dokumen laporan.
