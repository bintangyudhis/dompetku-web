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
