import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

async function milikPengguna(userId: string, id: string) {
  return prisma.quickShortcut.findFirst({ where: { id, userId } });
}

/** PUT /api/shortcuts/[id] — ubah preset. */
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
      { error: "Shortcut tidak ditemukan." },
      { status: 404 }
    );
  }

  let body: { label?: string; amount?: number; icon?: string; categoryId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 }
    );
  }

  const data: {
    label?: string;
    amount?: number;
    icon?: string;
    categoryId?: string | null;
  } = {};

  if (body.label !== undefined) {
    const label = body.label.trim();
    if (label.length < 1 || label.length > 40) {
      return NextResponse.json(
        { error: "Label harus 1–40 karakter." },
        { status: 400 }
      );
    }
    data.label = label;
  }
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
  if (body.icon !== undefined) {
    const icon = body.icon.trim() || "⚡";
    if (icon.length > 10) {
      return NextResponse.json(
        { error: "Ikon terlalu panjang." },
        { status: 400 }
      );
    }
    data.icon = icon;
  }
  if (body.categoryId !== undefined) {
    if (body.categoryId === null || body.categoryId === "") {
      data.categoryId = null;
    } else {
      const category = await prisma.category.findFirst({
        where: { id: body.categoryId, userId, type: "EXPENSE" },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Kategori pengeluaran tidak ditemukan." },
          { status: 400 }
        );
      }
      data.categoryId = category.id;
    }
  }

  try {
    const updated = await prisma.quickShortcut.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, icon: true } } },
    });
    return NextResponse.json({ shortcut: updated });
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

/** DELETE /api/shortcuts/[id] — hapus preset. */
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
      { error: "Shortcut tidak ditemukan." },
      { status: 404 }
    );
  }

  await prisma.quickShortcut.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
