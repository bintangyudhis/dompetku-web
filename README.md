# 💰 DompetKu

**DompetKu** adalah aplikasi web pencatat keuangan pribadi berbahasa Indonesia. Catat pemasukan dan pengeluaran harian, pantau arus kas, dan rencanakan keuangan dengan lebih baik — semuanya dalam satu tempat.

Proyek ini dibangun **step-by-step selama 7 hari** (19–25 Oktober 2026), dengan satu commit & push setiap harinya sebagai bagian dari program build streak GitHub.

## 🛠️ Teknologi

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript
- Prisma + SQLite *(mulai Day 2)*

## 🗓️ Rencana Fitur 7 Hari

| Hari | Fokus | Status |
| ---- | ----- | ------ |
| 1 | Scaffold proyek Next.js + landing page | ✅ |
| 2 | Database dengan Prisma (transaksi, kategori) | ⏳ |
| 3 | Dashboard ringkasan keuangan | ⏳ |
| 4 | CRUD transaksi (pemasukan & pengeluaran) | ⏳ |
| 5 | Kategori & filter transaksi | ⏳ |
| 6 | Grafik & laporan bulanan | ⏳ |
| 7 | REST API + autentikasi token (untuk aplikasi mobile minggu ke-2) | ⏳ |

## 🚀 Cara Menjalankan

Pastikan Node.js versi 20 atau lebih baru sudah terinstal.

```bash
# 1. Install dependensi
npm install

# 2. Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

Perintah lain yang berguna:

```bash
npm run build   # build untuk production
npm run start   # jalankan hasil build production
npm run lint    # cek lint dengan ESLint
```

## 📁 Struktur Folder

```
src/
├── app/            # Halaman & layout (App Router)
│   ├── login/      # Halaman login (placeholder, full fitur di Day 7)
│   └── page.tsx    # Landing page
├── components/     # Komponen UI yang dipakai ulang (mis. FeatureCard)
└── lib/            # Utilitas & data statis (format Rupiah, daftar fitur)
```

## 🔮 Rencana Lanjutan

- **Minggu ke-2:** aplikasi mobile Flutter yang mengambil data lewat REST API web ini.
- **Minggu ke-3:** proyek IoT terpisah (server web + firmware ESP32 untuk kipas topi bertenaga panel surya).
