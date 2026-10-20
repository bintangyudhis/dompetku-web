// Data statis untuk landing page — diperbarui mengikuti rencana program.

export interface Fitur {
  judul: string;
  deskripsi: string;
  ikon: string;
}

export const fiturUnggulan: Fitur[] = [
  {
    judul: "Catat Transaksi",
    deskripsi:
      "Catat setiap pemasukan dan pengeluaran harian dalam hitungan detik, lengkap dengan nominal dan catatan.",
    ikon: "💸",
  },
  {
    judul: "Dashboard Ringkasan",
    deskripsi:
      "Lihat total pemasukan, pengeluaran, dan saldo sekilas di satu halaman dashboard yang rapi.",
    ikon: "📊",
  },
  {
    judul: "Kategori Cerdas",
    deskripsi:
      "Kelompokkan transaksi ke kategori seperti Makanan, Transportasi, dan Tagihan agar mudah dianalisis.",
    ikon: "🏷️",
  },
  {
    judul: "Laporan & Grafik",
    deskripsi:
      "Pantau tren keuangan bulanan lewat grafik dan laporan sederhana yang mudah dibaca.",
    ikon: "📈",
  },
  {
    judul: "Shortcut Cepat",
    deskripsi:
      'Catat pengeluaran rutin seperti "Parkir 2k" atau "Kopi 15k" dalam satu klik — preset bisa ditambah dan diubah sendiri.',
    ikon: "⚡",
  },
  {
    judul: "API untuk Aplikasi Mobile",
    deskripsi:
      "Menyediakan REST API agar aplikasi mobile (Flutter) bisa mengambil data langsung dari web ini.",
    ikon: "🔌",
  },
];

export interface RencanaHari {
  hari: number;
  judul: string;
  deskripsi: string;
}

export const rencana7Hari: RencanaHari[] = [
  {
    hari: 1,
    judul: "Scaffold & Database",
    deskripsi:
      "Proyek Next.js + landing page; skema Prisma (User, Category, Transaction, Budget) live di Supabase Postgres; deploy Vercel.",
  },
  {
    hari: 2,
    judul: "Login & Pencatatan Transaksi",
    deskripsi:
      "Autentikasi NextAuth (login/register, proteksi route, profil); CRUD kategori & transaksi + filter & pencarian; shortcut pengeluaran 1-klik.",
  },
  {
    hari: 3,
    judul: "Dashboard & API Mobile",
    deskripsi:
      "Dashboard ringkasan + analisa per kategori; budget & pemasukan tetap; REST API ber-token untuk aplikasi Flutter minggu ke-3.",
  },
];
