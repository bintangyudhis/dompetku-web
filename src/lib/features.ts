// Data statis untuk landing page.

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

