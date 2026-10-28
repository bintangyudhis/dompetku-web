import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerUserId, unauthorizedBearer } from "@/lib/api-auth";

/**
 * PATCH /api/public/budgets/[id] — ubah nominal budget (butuh Bearer).
 * Cerminan PUT /api/budgets/[id] versi sesi, memakai PATCH sesuai
 * konvensi klien aplikasi.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();
  const { id } = await params;

  let body: { amount?: number };
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

  const ada = await prisma.budget.findFirst({ where: { id, userId } });
  if (!ada) {
    return NextResponse.json(
      { error: "Budget tidak ditemukan." },
      { status: 404 },
    );
  }

  const budget = await prisma.budget.update({
    where: { id },
    data: { amount },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ budget });
}

/** DELETE /api/public/budgets/[id] — hapus budget (butuh Bearer). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();
  const { id } = await params;

  const ada = await prisma.budget.findFirst({ where: { id, userId } });
  if (!ada) {
    return NextResponse.json(
      { error: "Budget tidak ditemukan." },
      { status: 404 },
    );
  }

  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
