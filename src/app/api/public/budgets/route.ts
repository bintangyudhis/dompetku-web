import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerUserId, unauthorizedBearer } from "@/lib/api-auth";
import {
  batasBulanJakarta,
  bulanKiniJakarta,
  namaBulan,
} from "@/lib/waktu";

function parseBulan(searchParams: URLSearchParams): {
  year: number;
  month: number;
} {
  const kini = bulanKiniJakarta();
  const month = Number(searchParams.get("month") ?? kini.month);
  const year = Number(searchParams.get("year") ?? kini.year);
  return {
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : kini.month,
    year:
      Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : kini.year,
  };
}

/**
 * GET /api/public/budgets?month=&year= — daftar budget bulan berjalan
 * beserta realisasi pengeluaran per kategori (butuh Bearer).
 * Cerminan GET /api/budgets versi sesi untuk aplikasi Flutter.
 */
export async function GET(req: Request) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();

  const { month, year } = parseBulan(new URL(req.url).searchParams);
  const { awal, akhir } = batasBulanJakarta(year, month);

  const [budgets, pemakaian] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, month, year },
      include: {
        category: { select: { id: true, name: true, icon: true, type: true } },
      },
      orderBy: { category: { name: "asc" } },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: awal, lt: akhir } },
      _sum: { amount: true },
    }),
  ]);

  const terpakai = new Map(
    pemakaian.map((p) => [p.categoryId, p._sum.amount ?? 0]),
  );

  const hasil = budgets.map((b) => {
    const spent = terpakai.get(b.categoryId) ?? 0;
    const persen = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    return {
      id: b.id,
      amount: b.amount,
      month: b.month,
      year: b.year,
      category: b.category,
      spent,
      persen,
      sisa: b.amount - spent,
      status: persen >= 100 ? "LEWAT" : persen >= 80 ? "WASPADA" : "AMAN",
    };
  });

  return NextResponse.json({
    bulan: namaBulan(year, month),
    month,
    year,
    budgets: hasil,
  });
}

/**
 * POST /api/public/budgets — buat/ubah batas budget kategori untuk satu
 * bulan (butuh Bearer). Body: { categoryId, amount, month?, year? }.
 * Upsert per (kategori, bulan, tahun), sama seperti versi sesi.
 */
export async function POST(req: Request) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();

  let body: {
    categoryId?: string;
    amount?: number;
    month?: number;
    year?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 },
    );
  }

  const amount = Math.floor(Number(body.amount));
  if (!Number.isFinite(amount) || amount < 1000 || amount > 999_999_999_999) {
    return NextResponse.json(
      { error: "Batas budget minimal Rp1.000." },
      { status: 400 },
    );
  }

  const kini = bulanKiniJakarta();
  const month = body.month ?? kini.month;
  const year = body.year ?? kini.year;
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Bulan tidak valid." },
      { status: 400 },
    );
  }

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId ?? "", userId, type: "EXPENSE" },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Kategori pengeluaran tidak ditemukan." },
      { status: 400 },
    );
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId: category.id,
        month,
        year,
      },
    },
    update: { amount },
    create: { userId, categoryId: category.id, amount, month, year },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ budget }, { status: 201 });
}
