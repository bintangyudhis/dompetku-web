/** Utilitas waktu zona Asia/Jakarta — dipakai API yang butuh batas bulan. */

const ZONA = "Asia/Jakarta";
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export interface BagianTanggal {
  y: number;
  m: number;
  day: number;
}

/** Ambil komponen tanggal (tahun, bulan, hari) di zona Jakarta. */
export function bagianTanggalJakarta(d: Date): BagianTanggal {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const ambil = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: ambil("year"), m: ambil("month"), day: ambil("day") };
}

/** Kunci bulan "YYYY-MM" untuk tanggal sekarang di Jakarta. */
export function bulanKiniJakarta(d: Date = new Date()): { year: number; month: number } {
  const { y, m } = bagianTanggalJakarta(d);
  return { year: y, month: m };
}

/** Awal & akhir bulan (sebagai instant UTC) untuk query database. */
export function batasBulanJakarta(
  year: number,
  month: number
): { awal: Date; akhir: Date } {
  const awal = new Date(Date.UTC(year, month - 1, 1) - WIB_OFFSET_MS);
  const akhir = new Date(Date.UTC(year, month, 1) - WIB_OFFSET_MS);
  return { awal, akhir };
}

/** Jumlah hari dalam bulan (zona Jakarta). */
export function hariDalamBulan(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Nama bulan Indonesia, mis. "Oktober 2026". */
export function namaBulan(year: number, month: number): string {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 1))
  );
}
