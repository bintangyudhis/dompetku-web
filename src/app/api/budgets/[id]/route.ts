import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

/** PUT /api/budgets/[id] — ubah nominal budget. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  let body: { amount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const amount = Math.floor(Number(body.amount));
  if (!Number.isFinite(amount) || amount < 1000 || amount > 999_999_999_999) {
    return NextResponse.json(
      { error: "Batas budget minimal Rp1.000." },
      { status: 400 }
    );
  }

  const ada = await prisma.budget.findFirst({ where: { id, userId } });
  if (!ada) {
    return NextResponse.json({ error: "Budget tidak ditemukan." }, { status: 404 });
  }

  const budget = await prisma.budget.update({
    where: { id },
    data: { amount },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ budget });
}

/** DELETE /api/budgets/[id] — hapus budget. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const ada = await prisma.budget.findFirst({ where: { id, userId } });
  if (!ada) {
    return NextResponse.json({ error: "Budget tidak ditemukan." }, { status: 404 });
  }

  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
