import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

const TIPE_VALID = ["INCOME", "EXPENSE"] as const;

/**
 * GET /api/transactions?type=&categoryId=&from=YYYY-MM-DD&to=YYYY-MM-DD&q=&limit=
 * Daftar transaksi milik pengguna, terbaru dulu.
 */
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type")?.toUpperCase();
  const categoryId = searchParams.get("categoryId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1),
    200
  );

  const where: Record<string, unknown> = { userId };
  if (type && TIPE_VALID.includes(type as (typeof TIPE_VALID)[number])) {
    where.type = type;
  }
  if (categoryId) where.categoryId = categoryId;
  if (from || to) {
    const date: Record<string, Date> = {};
    if (from) {
      const d = new Date(`${from}T00:00:00`);
      if (!isNaN(d.getTime())) date.gte = d;
    }
    if (to) {
      const d = new Date(`${to}T23:59:59.999`);
      if (!isNaN(d.getTime())) date.lte = d;
    }
    if (Object.keys(date).length > 0) where.date = date;
  }
  if (q) where.note = { contains: q, mode: "insensitive" };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({ transactions, total });
}

/** POST /api/transactions — catat transaksi baru. */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  let body: {
    amount?: number;
    note?: string;
    date?: string;
    type?: string;
    categoryId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 }
    );
  }

  const amount = Math.floor(Number(body.amount));
  const type = (body.type ?? "").toUpperCase();
  const categoryId = body.categoryId ?? "";
  const note = (body.note ?? "").trim().slice(0, 200) || null;

  if (!Number.isFinite(amount) || amount < 1 || amount > 999_999_999_999) {
    return NextResponse.json(
      { error: "Nominal harus angka positif." },
      { status: 400 }
    );
  }
  if (!TIPE_VALID.includes(type as (typeof TIPE_VALID)[number])) {
    return NextResponse.json(
      { error: "Tipe transaksi harus INCOME atau EXPENSE." },
      { status: 400 }
    );
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Kategori tidak ditemukan." },
      { status: 400 }
    );
  }
  if (category.type !== type) {
    return NextResponse.json(
      {
        error: `Kategori "${category.name}" adalah kategori ${
          category.type === "INCOME" ? "pemasukan" : "pengeluaran"
        }.`,
      },
      { status: 400 }
    );
  }

  let date = new Date();
  if (body.date) {
    const d = new Date(body.date);
    if (isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "Tanggal tidak valid." },
        { status: 400 }
      );
    }
    date = d;
  }

  const transaction = await prisma.transaction.create({
    data: { amount, note, date, type, categoryId, userId },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ transaction }, { status: 201 });
}
