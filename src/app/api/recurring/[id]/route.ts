import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

/** PUT /api/recurring/[id] — ubah template pemasukan rutin. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const ada = await prisma.recurringTemplate.findFirst({ where: { id, userId } });
  if (!ada) {
    return NextResponse.json({ error: "Pemasukan rutin tidak ditemukan." }, { status: 404 });
  }

  let body: {
    label?: string;
    amount?: number;
    note?: string | null;
    dayOfMonth?: number;
    active?: boolean;
    categoryId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.label !== undefined) {
    const label = body.label.trim().slice(0, 80);
    if (!label) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
    data.label = label;
  }
  if (body.amount !== undefined) {
    const amount = Math.floor(Number(body.amount));
    if (!Number.isFinite(amount) || amount < 1 || amount > 999_999_999_999) {
      return NextResponse.json({ error: "Nominal harus angka positif." }, { status: 400 });
    }
    data.amount = amount;
  }
  if (body.dayOfMonth !== undefined) {
    const d = Math.floor(Number(body.dayOfMonth));
    if (!Number.isInteger(d) || d < 1 || d > 28) {
      return NextResponse.json({ error: "Tanggal terbit harus antara 1–28." }, { status: 400 });
    }
    data.dayOfMonth = d;
  }
  if (body.note !== undefined) data.note = (body.note ?? "").trim().slice(0, 200) || null;
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.categoryId !== undefined) {
    const category = await prisma.category.findFirst({
      where: { id: body.categoryId, userId, type: "INCOME" },
    });
    if (!category) {
      return NextResponse.json({ error: "Kategori pemasukan tidak ditemukan." }, { status: 400 });
    }
    data.categoryId = category.id;
  }

  const template = await prisma.recurringTemplate.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ template });
}

/** DELETE /api/recurring/[id] — hapus template. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const ada = await prisma.recurringTemplate.findFirst({ where: { id, userId } });
  if (!ada) {
    return NextResponse.json({ error: "Pemasukan rutin tidak ditemukan." }, { status: 404 });
  }

  await prisma.recurringTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
