import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

/**
 * POST /api/shortcuts/[id]/pakai — catat pengeluaran 1-klik dari preset.
 * Membuat transaksi EXPENSE memakai nominal + kategori shortcut, tanggal hari ini.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const shortcut = await prisma.quickShortcut.findFirst({
    where: { id, userId },
    include: { category: true },
  });
  if (!shortcut) {
    return NextResponse.json(
      { error: "Shortcut tidak ditemukan." },
      { status: 404 }
    );
  }
  if (!shortcut.categoryId) {
    return NextResponse.json(
      { error: "Shortcut ini belum punya kategori. Atur dulu kategorinya." },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: shortcut.amount,
      note: shortcut.label,
      date: new Date(),
      type: "EXPENSE",
      categoryId: shortcut.categoryId,
      userId,
    },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json({ transaction }, { status: 201 });
}
