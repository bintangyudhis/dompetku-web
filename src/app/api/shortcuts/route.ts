import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

/** GET /api/shortcuts — daftar preset pengeluaran 1-klik milik pengguna. */
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const shortcuts = await prisma.quickShortcut.findMany({
    where: { userId },
    include: { category: { select: { id: true, name: true, icon: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ shortcuts });
}

/**
 * POST /api/shortcuts — buat preset baru.
 * Body: { label, amount, icon?, categoryId? }
 * Shortcut selalu bertipe pengeluaran.
 */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  let body: { label?: string; amount?: number; icon?: string; categoryId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 }
    );
  }

  const label = (body.label ?? "").trim();
  const amount = Math.floor(Number(body.amount));
  const icon = (body.icon ?? "⚡").trim() || "⚡";

  if (label.length < 1 || label.length > 40) {
    return NextResponse.json(
      { error: "Label harus 1–40 karakter, mis. “Parkir 2k”." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(amount) || amount < 1 || amount > 999_999_999_999) {
    return NextResponse.json(
      { error: "Nominal harus angka positif." },
      { status: 400 }
    );
  }
  if (icon.length > 10) {
    return NextResponse.json({ error: "Ikon terlalu panjang." }, { status: 400 });
  }

  let categoryId: string | null = null;
  if (body.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: body.categoryId, userId, type: "EXPENSE" },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Kategori pengeluaran tidak ditemukan." },
        { status: 400 }
      );
    }
    categoryId = category.id;
  }

  try {
    const shortcut = await prisma.quickShortcut.create({
      data: { label, amount, icon, categoryId, userId },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });
    return NextResponse.json({ shortcut }, { status: 201 });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Shortcut dengan label itu sudah ada." },
        { status: 409 }
      );
    }
    throw e;
  }
}
