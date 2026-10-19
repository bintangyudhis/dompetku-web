// Data statis Day 1 — akan digantikan data dinamis di hari-hari berikutnya.

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
    judul: "Scaffold & Landing Page",
    deskripsi: "Inisialisasi proyek Next.js dan halaman utama berbahasa Indonesia.",
  },
  {
    hari: 2,
    judul: "Database dengan Prisma",
    deskripsi: "Skema database SQLite untuk transaksi dan kategori.",
  },
  {
    hari: 3,
    judul: "Dashboard Ringkasan",
    deskripsi: "Halaman dashboard dengan total pemasukan, pengeluaran, dan saldo.",
  },
  {
    hari: 4,
    judul: "CRUD Transaksi",
    deskripsi: "Tambah, ubah, dan hapus catatan pemasukan serta pengeluaran.",
  },
  {
    hari: 5,
    judul: "Kategori & Filter",
    deskripsi: "Kelola kategori, filter transaksi berdasarkan tanggal dan kategori.",
  },
  {
    hari: 6,
    judul: "Grafik & Laporan",
    deskripsi: "Visualisasi tren keuangan dan laporan bulanan.",
  },
  {
    hari: 7,
    judul: "REST API + Autentikasi",
    deskripsi:
      "API ber-token agar aplikasi mobile minggu ke-2 bisa mengambil data dari server ini.",
  },
];
