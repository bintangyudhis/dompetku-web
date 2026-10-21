import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";
import { bulanKiniJakarta } from "@/lib/waktu";

/**
 * GET /api/recurring — daftar pemasukan rutin + status penerapan bulan ini.
 */
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { year, month } = bulanKiniJakarta();
  const kunciBulan = `${year}-${String(month).padStart(2, "0")}`;

  const templates = await prisma.recurringTemplate.findMany({
    where: { userId },
    include: {
      category: { select: { id: true, name: true, icon: true, type: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    bulanIni: kunciBulan,
    templates: templates.map((t) => ({
      id: t.id,
      label: t.label,
      amount: t.amount,
      note: t.note,
      dayOfMonth: t.dayOfMonth,
      active: t.active,
      category: t.category,
      sudahDiterapkan: t.lastApplied === kunciBulan,
    })),
  });
}

/** POST /api/recurring — tambah pemasukan rutin baru. */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  let body: {
    label?: string;
    amount?: number;
    note?: string;
    dayOfMonth?: number;
    categoryId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const label = (body.label ?? "").trim().slice(0, 80);
  const amount = Math.floor(Number(body.amount));
  const dayOfMonth = Math.floor(Number(body.dayOfMonth ?? 1));
  const note = (body.note ?? "").trim().slice(0, 200) || null;

  if (!label) {
    return NextResponse.json({ error: "Nama pemasukan wajib diisi." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < 1 || amount > 999_999_999_999) {
    return NextResponse.json({ error: "Nominal harus angka positif." }, { status: 400 });
  }
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 28) {
    return NextResponse.json(
      { error: "Tanggal terbit harus antara 1–28." },
      { status: 400 }
    );
  }

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId ?? "", userId, type: "INCOME" },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Kategori pemasukan tidak ditemukan." },
      { status: 400 }
    );
  }

  const template = await prisma.recurringTemplate.create({
    data: { label, amount, note, dayOfMonth, categoryId: category.id, userId },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ template }, { status: 201 });
}
