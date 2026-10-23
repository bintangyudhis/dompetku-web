# 💰 DompetKu

**DompetKu** adalah aplikasi web pencatat keuangan pribadi berbahasa Indonesia. Catat pemasukan dan pengeluaran harian, pantau arus kas lewat dashboard, atur budget per kategori, daftarkan pemasukan rutin, dan hubungkan aplikasi mobile lewat REST API dengan akun yang sama — semuanya dalam satu tempat.

Proyek ini dibangun **bertahap selama 3 hari** (19–21 Oktober 2026) — repo pertama
dari program streak GitHub 4 minggu (7 repo, push setiap hari).

🌐 **Live:** https://dompetku-web-lake.vercel.app

## 🛠️ Teknologi

- [Next.js 16](https://nextjs.org/) (App Router, Cache Components)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) (dark mode manual via class)
- TypeScript
- [NextAuth.js v4](https://next-auth.js.org/) (Credentials + JWT) + bcryptjs
- Prisma v6 + Supabase Postgres (via connection pooler)
- [Recharts](https://recharts.github.io/) untuk grafik dashboard

## 🗓️ Rencana 3 Hari

| Hari | Fokus | Status |
| ---- | ----- | ------ |
| 1 | Scaffold Next.js + landing page; skema Prisma (User, Category, Transaction, Budget) live di Supabase; deploy Vercel | ✅ |
| 2 | Login & register (NextAuth), proteksi route, profil & logout; CRUD kategori & transaksi + filter & pencarian; shortcut pengeluaran 1-klik | ✅ |
| 3 | Dashboard + analisa per kategori; budget & pemasukan tetap; export/import CSV; dark mode; REST API untuk aplikasi Flutter (login + token sesi) | ✅ |

## ✨ Fitur

- 📊 **Dashboard** — kartu saldo/pemasukan/pengeluaran/sisa bulan ini, grafik
  arus kas 30 hari, analisa pengeluaran per kategori (pie chart + persen),
  dan 5 transaksi terbaru.
- 🔐 **Autentikasi** — daftar & masuk dengan email + kata sandi (hash bcrypt);
  akun baru otomatis dapat 10 kategori & 4 shortcut bawaan.
- 💸 **Transaksi** — tambah/ubah/hapus pemasukan & pengeluaran; filter tipe,
  kategori & rentang tanggal; pencarian catatan; **export & import CSV**
  (export mengikuti filter aktif; import membuat kategori baru otomatis).
- 🏷️ **Kategori** — tambah/ubah/hapus; dikelompokkan pemasukan vs pengeluaran;
  kategori yang masih dipakai transaksi tidak bisa dihapus.
- ⚡ **Shortcut cepat** — preset pengeluaran 1-klik seperti "Parkir 2k";
  bisa ditambah, diubah, dan dihapus sendiri.
- 📉 **Budget** — batas pengeluaran per kategori per bulan; progress bar +
  badge peringatan saat pemakaian mencapai **80%** dan **100%**.
- 🔁 **Pemasukan rutin** — daftarkan gaji/pemasukan berulang (tanggal terbit
  1–28); satu klik "Terapkan bulan ini" menerbitkannya jadi transaksi
  (idempoten — tidak dobel).
- 🌙 **Dark mode** — toggle manual di navbar, tersimpan di localStorage.
- 🔑 **REST API untuk aplikasi mobile** — aplikasi HP masuk dengan email +
  kata sandi yang sama seperti web (satu akun, satu database) dan menerima
  **token sesi** (JWT); permintaan data membawa header
  `Authorization: Bearer <token sesi>` pada setiap permintaan data:
  - `POST /api/public/auth/register` — daftar akun dari aplikasi
  - `POST /api/public/auth/login` — masuk, menerima token sesi
  - `GET /api/public/summary` — saldo & ringkasan bulan ini
  - `GET /api/public/transactions?limit=50&type=EXPENSE` — daftar transaksi
  - `POST /api/public/transactions` — catat transaksi
  - `GET /api/public/categories?type=INCOME` — daftar kategori
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

## 🗄️ Database

Skema Prisma (`prisma/schema.prisma`): `User`, `Category`, `Transaction`,
`Budget`, `QuickShortcut`, `RecurringTemplate`.

Migrasi SQL di `prisma/migrations/` (nama unik per repo karena beberapa repo
program ini berbagi satu project Supabase):

| Migrasi | Isi |
| ------- | --- |
| `0001_init` | User, Category, Transaction, Budget |
| `0002_day2_shortcuts` | QuickShortcut |
| `0003_day3_rutin` | RecurringTemplate |
| `0004_day3_api_token` | ApiToken |
| `0005_drop_api_token` | (mencabut ApiToken — auth aplikasi diganti login + token sesi) |

## 📁 Struktur Folder

```
src/
├── app/
│   ├── (app)/                  # Area aplikasi (terproteksi middleware)
│   │   ├── dashboard/page.tsx  # Ringkasan + grafik + analisa kategori
│   │   ├── transaksi/page.tsx  # Daftar + filter + CRUD transaksi & shortcut
│   │   ├── kategori/page.tsx   # CRUD kategori
│   │   ├── budget/page.tsx     # Budget per kategori + progress
│   │   ├── rutin/page.tsx      # Pemasukan tetap + terapkan bulanan
│   │   ├── profil/page.tsx     # Profil & statistik akun
│   │   └── layout.tsx          # Layout + navbar aplikasi
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Handler NextAuth
│   │   ├── auth/register/      # API pendaftaran + seed data bawaan
│   │   ├── categories/         # CRUD kategori
│   │   ├── transactions/       # CRUD transaksi + filter & pencarian
│   │   ├── shortcuts/          # CRUD shortcut + pencatatan 1-klik
│   │   ├── dashboard/          # Ringkasan untuk dashboard
│   │   ├── budgets/            # CRUD budget + realisasi
│   │   ├── recurring/          # CRUD pemasukan rutin + terapkan
│   │   ├── export/transactions # Unduh CSV
│   │   ├── import/transactions # Impor CSV (JSON)
│   │   └── public/             # REST API publik (Bearer token)
│   ├── login/page.tsx          # Halaman masuk
│   ├── register/page.tsx       # Halaman daftar
│   └── page.tsx                # Landing page
├── components/                 # Komponen UI (board, grafik, form, dsb.)
├── lib/                        # auth, prisma, format, waktu (zona Jakarta)
├── middleware.ts               # Proteksi route via NextAuth
└── types/next-auth.d.ts        # Augmentasi tipe sesi

prisma/
├── schema.prisma               # Skema database
└── migrations/                 # Migrasi SQL (dijalankan otomatis saat deploy)
```

## 🔮 Rencana Lanjutan

- **Minggu ke-3 program (26–28 Okt):** aplikasi mobile Flutter `dompetku-app`
  yang mengambil data lewat REST API web ini — masuk dengan akun yang sama.

## Catatan performa (23 Oktober 2026)

- Fungsi Vercel dipindah ke region Singapura (sin1) agar sejajar dengan database Supabase; sebelumnya fungsi berjalan di region default Amerika sehingga setiap query menyeberangi samudra.
- Ditambah `loading.tsx` pada grup halaman aplikasi, sehingga navigasi menu langsung menampilkan kerangka halaman selama data dimuat.
- Hasil pengukuran ulang malam yang sama: halaman /transaksi turun dari 6,9 detik menjadi sekitar 1,2 detik; API ringkasan dari 3,1 detik menjadi sekitar 0,9 detik.
