import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

const TIPE_VALID = ["INCOME", "EXPENSE"] as const;

async function milikPengguna(userId: string, id: string) {
  return prisma.transaction.findFirst({ where: { id, userId } });
}

/** PUT /api/transactions/[id] — ubah transaksi. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const existing = await milikPengguna(userId, id);
  if (!existing) {
    return NextResponse.json(
      { error: "Transaksi tidak ditemukan." },
      { status: 404 }
    );
  }

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

  const data: {
    amount?: number;
    note?: string | null;
    date?: Date;
    type?: string;
    categoryId?: string;
  } = {};

  if (body.amount !== undefined) {
    const amount = Math.floor(Number(body.amount));
    if (!Number.isFinite(amount) || amount < 1 || amount > 999_999_999_999) {
      return NextResponse.json(
        { error: "Nominal harus angka positif." },
        { status: 400 }
      );
    }
    data.amount = amount;
  }
  if (body.note !== undefined) {
    data.note = body.note.trim().slice(0, 200) || null;
  }
  if (body.date !== undefined) {
    const d = new Date(body.date);
    if (isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "Tanggal tidak valid." },
        { status: 400 }
      );
    }
    data.date = d;
  }

  const type = body.type !== undefined ? body.type.toUpperCase() : existing.type;
  const categoryId =
    body.categoryId !== undefined ? body.categoryId : existing.categoryId;

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
  data.type = type;
  data.categoryId = categoryId;

  const updated = await prisma.transaction.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ transaction: updated });
}

/** DELETE /api/transactions/[id] — hapus transaksi. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const existing = await milikPengguna(userId, id);
  if (!existing) {
    return NextResponse.json(
      { error: "Transaksi tidak ditemukan." },
      { status: 404 }
    );
  }

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
