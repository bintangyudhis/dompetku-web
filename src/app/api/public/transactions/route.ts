import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerUserId, unauthorizedBearer } from "@/lib/api-auth";

const TIPE_VALID = ["INCOME", "EXPENSE"] as const;

/**
 * GET /api/public/transactions?limit=&type= — daftar transaksi (butuh Bearer).
 */
export async function GET(req: Request) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type")?.toUpperCase();
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1),
    200
  );

  const where: Record<string, unknown> = { userId };
  if (type && TIPE_VALID.includes(type as (typeof TIPE_VALID)[number])) {
    where.type = type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: { select: { id: true, name: true, icon: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return NextResponse.json({ transactions });
}

/**
 * POST /api/public/transactions — catat transaksi baru (butuh Bearer).
 * Body: { amount, type: "INCOME"|"EXPENSE", categoryId, note?, date? }.
 */
export async function POST(req: Request) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();

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
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const amount = Math.floor(Number(body.amount));
  const type = (body.type ?? "").toUpperCase();

  if (!Number.isFinite(amount) || amount < 1 || amount > 999_999_999_999) {
    return NextResponse.json({ error: "Nominal harus angka positif." }, { status: 400 });
  }
  if (!TIPE_VALID.includes(type as (typeof TIPE_VALID)[number])) {
    return NextResponse.json({ error: "Tipe harus INCOME atau EXPENSE." }, { status: 400 });
  }

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId ?? "", userId },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 400 });
  }
  if (category.type !== type) {
    return NextResponse.json(
      { error: "Tipe transaksi tidak cocok dengan kategori." },
      { status: 400 }
    );
  }

  let date = new Date();
  if (body.date) {
    const d = new Date(body.date);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Tanggal tidak valid." }, { status: 400 });
    }
    date = d;
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      note: (body.note ?? "").trim().slice(0, 200) || null,
      date,
      type,
      categoryId: category.id,
      userId,
    },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ transaction }, { status: 201 });
}
