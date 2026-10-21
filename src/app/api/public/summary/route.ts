import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerUserId, unauthorizedBearer } from "@/lib/api-auth";
import { batasBulanJakarta, bulanKiniJakarta } from "@/lib/waktu";

/**
 * GET /api/public/summary — ringkasan keuangan (butuh Bearer token).
 * Dipakai aplikasi Flutter (dompetku-app) sebagai API server.
 */
export async function GET(req: Request) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();

  const { year, month } = bulanKiniJakarta();
  const { awal, akhir } = batasBulanJakarta(year, month);

  const [agregatSemua, agregatBulan] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { gte: awal, lt: akhir } },
      _sum: { amount: true },
    }),
  ]);

  const ambil = (arr: typeof agregatSemua, tipe: string) =>
    arr.find((a) => a.type === tipe)?._sum.amount ?? 0;

  const pemasukan = ambil(agregatSemua, "INCOME");
  const pengeluaran = ambil(agregatSemua, "EXPENSE");

  return NextResponse.json({
    saldo: pemasukan - pengeluaran,
    pemasukanBulanIni: ambil(agregatBulan, "INCOME"),
    pengeluaranBulanIni: ambil(agregatBulan, "EXPENSE"),
    year,
    month,
  });
}
