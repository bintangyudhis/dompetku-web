# 💰 DompetKu

**DompetKu** adalah aplikasi web pencatat keuangan pribadi berbahasa Indonesia. Catat pemasukan dan pengeluaran harian, pantau arus kas, dan rencanakan keuangan dengan lebih baik — semuanya dalam satu tempat.

Proyek ini dibangun **bertahap selama 3 hari** (19–21 Oktober 2026) — repo pertama
dari program streak GitHub 4 minggu (7 repo, push setiap hari).

🌐 **Live:** https://dompetku-web-lake.vercel.app

## 🛠️ Teknologi

- [Next.js 16](https://nextjs.org/) (App Router, Cache Components)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript
- [NextAuth.js v4](https://next-auth.js.org/) (Credentials + JWT) + bcryptjs
- Prisma v6 + Supabase Postgres (via connection pooler)

## 🗓️ Rencana 3 Hari

| Hari | Fokus | Status |
| ---- | ----- | ------ |
| 1 | Scaffold Next.js + landing page; skema Prisma (User, Category, Transaction, Budget) live di Supabase; deploy Vercel | ✅ |
| 2 | Login & register (NextAuth), proteksi route, profil & logout; CRUD kategori & transaksi + filter & pencarian; shortcut pengeluaran 1-klik | ✅ |
| 3 | Dashboard + analisa per kategori; budget & pemasukan tetap; REST API ber-token untuk aplikasi Flutter | ⏳ |

## ✨ Fitur (Day 2)

- 🔐 **Autentikasi** — daftar & masuk dengan email + kata sandi (hash bcrypt);
  akun baru otomatis dapat 10 kategori & 4 shortcut bawaan.
- 💸 **Transaksi** — tambah/ubah/hapus pemasukan & pengeluaran; filter tipe,
  kategori & rentang tanggal; pencarian catatan.
- 🏷️ **Kategori** — tambah/ubah/hapus; dikelompokkan pemasukan vs pengeluaran;
  kategori yang masih dipakai transaksi tidak bisa dihapus.
- ⚡ **Shortcut cepat** — preset pengeluaran 1-klik seperti "Parkir 2k";
  bisa ditambah, diubah, dan dihapus sendiri.
- 👤 **Profil** — info akun, statistik transaksi & total pengeluaran, logout.

## 🚀 Cara Menjalankan

Pastikan Node.js versi 20 atau lebih baru sudah terinstal.

```bash
# 1. Install dependensi
npm install

# 2. Siapkan environment (lihat .env.example)
cp .env.example .env
# isi DATABASE_URL, DIRECT_URL, dan NEXTAUTH_SECRET

# 3. Jalankan migrasi database
npx prisma migrate deploy

# 4. Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

Perintah lain yang berguna:

```bash
npm run build   # prisma migrate deploy + build untuk production
npm run start   # jalankan hasil build production
npm run lint    # cek lint dengan ESLint
```

> **Catatan deploy hemat:** repo ini memakai `vercel.json` dengan `ignoreCommand`
> yang membatalkan build Vercel bila pesan commit mengandung `[skip-vercel]`.
> Deploy resmi dilakukan sekali sehari lewat commit kosong `Day N: deploy`.

## 📁 Struktur Folder

```
src/
├── app/
│   ├── (app)/                  # Area aplikasi (terproteksi middleware)
│   │   ├── transaksi/page.tsx  # Daftar + filter + CRUD transaksi & shortcut
│   │   ├── kategori/page.tsx   # CRUD kategori
│   │   ├── profil/page.tsx     # Profil & statistik akun
│   │   └── layout.tsx          # Layout + navbar aplikasi
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Handler NextAuth
│   │   ├── auth/register/      # API pendaftaran + seed data bawaan
│   │   ├── categories/         # CRUD kategori
│   │   ├── transactions/       # CRUD transaksi + filter & pencarian
│   │   └── shortcuts/          # CRUD shortcut + pencatatan 1-klik
│   ├── login/page.tsx          # Halaman masuk
│   ├── register/page.tsx       # Halaman daftar
│   └── page.tsx                # Landing page
├── components/                 # Komponen UI (form, papan transaksi, dsb.)
├── lib/                        # auth, prisma, format, validasi & seed
├── middleware.ts               # Proteksi route via NextAuth
└── types/next-auth.d.ts        # Augmentasi tipe sesi

prisma/
├── schema.prisma               # User, Category, Transaction, Budget, QuickShortcut
└── migrations/                 # Migrasi SQL (dijalankan otomatis saat deploy)
```

## 🔮 Rencana Lanjutan

- **Day 3 (21 Okt):** dashboard ringkasan + analisa per kategori, budget,
  pemasukan tetap, REST API ber-token.
- **Minggu ke-3 program:** aplikasi mobile Flutter yang mengambil data lewat
  REST API web ini.
