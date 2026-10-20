// Utilitas format — Day 1 baru menyediakan format Rupiah;
// fungsi lain (tanggal, dsb.) ditambahkan di hari berikutnya.

/**
 * Format angka menjadi mata uang Rupiah, mis. 1500000 -> "Rp1.500.000"
 */
export function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nilai);
}

/**
 * Format tanggal ke Bahasa Indonesia, mis. "20 Oktober 2026".
 */
export function formatTanggal(tanggal: Date | string): string {
  const d = typeof tanggal === "string" ? new Date(tanggal) : tanggal;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Format tanggal + jam ke Bahasa Indonesia, mis. "20 Okt 2026, 08.30".
 */
export function formatTanggalJam(tanggal: Date | string): string {
  const d = typeof tanggal === "string" ? new Date(tanggal) : tanggal;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
