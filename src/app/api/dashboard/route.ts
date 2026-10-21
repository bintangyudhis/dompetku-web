import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

const ZONA = "Asia/Jakarta";
const HARI_MS = 24 * 60 * 60 * 1000;

/** Ambil komponen tanggal (tahun, bulan, hari) di zona Jakarta. */
function bagianTanggal(d: Date): { y: number; m: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const ambil = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: ambil("year"), m: ambil("month"), day: ambil("day") };
}

/** Kunci "YYYY-MM-DD" untuk tanggal di zona Jakarta. */
function kunciHari(d: Date): string {
  const { y, m, day } = bagianTanggal(d);
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Awal & akhir bulan berjalan (dalam UTC instant, aman untuk query). */
function batasBulan(d: Date): { awal: Date; akhir: Date } {
  const { y, m } = bagianTanggal(d);
  // 00:00 hari pertama di Jakarta = 17:00 UTC hari sebelumnya (WIB = UTC+7)
  const awal = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0) - 7 * 60 * 60 * 1000);
  const akhir = new Date(Date.UTC(y, m, 1, 0, 0, 0) - 7 * 60 * 60 * 1000);
  return { awal, akhir };
}

/** Label pendek "1 Okt" dari kunci hari. */
function labelHari(kunci: string): string {
  const [y, m, day] = kunci.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" })
    .format(new Date(Date.UTC(y, m - 1, day)))
    .replace(".", "");
}

interface ArusHarian {
  tanggal: string;
  label: string;
  pemasukan: number;
  pengeluaran: number;
}

interface KategoriTotal {
  id: string;
  nama: string;
  icon: string;
  total: number;
}

/**
 * GET /api/dashboard — ringkasan untuk halaman dashboard:
 * kartu (saldo, pemasukan & pengeluaran bulan ini), arus kas 30 hari,
 * analisa pengeluaran per kategori bulan ini, dan 5 transaksi terbaru.
 */
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const sekarang = new Date();
  const { awal: awalBulan, akhir: akhirBulan } = batasBulan(sekarang);
  const awalArusKas = new Date(sekarang.getTime() - 29 * HARI_MS);

  const [agregat, transaksiRentang] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: awalArusKas } },
      select: {
        id: true,
        amount: true,
        type: true,
        note: true,
        date: true,
        category: { select: { id: true, name: true, icon: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const total = (tipe: string) =>
    agregat.find((a) => a.type === tipe)?._sum.amount ?? 0;
  const pemasukanSemua = total("INCOME");
  const pengeluaranSemua = total("EXPENSE");

  let pemasukanBulan = 0;
  let pengeluaranBulan = 0;

  // Inisialisasi 30 bucket harian (zona Jakarta)
  const arusKas: ArusHarian[] = [];
  const indeksHari = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(sekarang.getTime() - i * HARI_MS);
    const kunci = kunciHari(d);
    indeksHari.set(kunci, arusKas.length);
    arusKas.push({ tanggal: kunci, label: labelHari(kunci), pemasukan: 0, pengeluaran: 0 });
  }

  const petaKategori = new Map<string, KategoriTotal>();

  for (const t of transaksiRentang) {
    const dalamBulan = t.date >= awalBulan && t.date < akhirBulan;
    if (t.type === "INCOME") {
      if (dalamBulan) pemasukanBulan += t.amount;
    } else if (t.type === "EXPENSE") {
      if (dalamBulan) {
        pengeluaranBulan += t.amount;
        const ada = petaKategori.get(t.category.id);
        if (ada) {
          ada.total += t.amount;
        } else {
          petaKategori.set(t.category.id, {
            id: t.category.id,
            nama: t.category.name,
            icon: t.category.icon,
            total: t.amount,
          });
        }
      }
    }
    const idx = indeksHari.get(kunciHari(t.date));
    if (idx !== undefined) {
      if (t.type === "INCOME") arusKas[idx].pemasukan += t.amount;
      else arusKas[idx].pengeluaran += t.amount;
    }
  }

  const perKategori = [...petaKategori.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return NextResponse.json({
    ringkasan: {
      saldo: pemasukanSemua - pengeluaranSemua,
      pemasukanBulanIni: pemasukanBulan,
      pengeluaranBulanIni: pengeluaranBulan,
      sisaBulanIni: pemasukanBulan - pengeluaranBulan,
    },
    arusKas,
    perKategori,
    terbaru: transaksiRentang.slice(0, 5).map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      note: t.note,
      date: t.date.toISOString(),
      category: t.category,
    })),
  });
}
