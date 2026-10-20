import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

const TIPE_VALID = ["INCOME", "EXPENSE"] as const;

async function milikPengguna(userId: string, id: string) {
  return prisma.category.findFirst({ where: { id, userId } });
}

/** PUT /api/categories/[id] — ubah nama/ikon/tipe kategori. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const category = await milikPengguna(userId, id);
  if (!category) {
    return NextResponse.json(
      { error: "Kategori tidak ditemukan." },
      { status: 404 }
    );
  }

  let body: { name?: string; icon?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 }
    );
  }

  const data: { name?: string; icon?: string; type?: string } = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (name.length < 1 || name.length > 60) {
      return NextResponse.json(
        { error: "Nama kategori harus 1–60 karakter." },
        { status: 400 }
      );
    }
    data.name = name;
  }
  if (body.icon !== undefined) {
    const icon = body.icon.trim() || "💰";
    if (icon.length > 10) {
      return NextResponse.json(
        { error: "Ikon terlalu panjang." },
        { status: 400 }
      );
    }
    data.icon = icon;
  }
  if (body.type !== undefined) {
    const type = body.type.toUpperCase();
    if (!TIPE_VALID.includes(type as (typeof TIPE_VALID)[number])) {
      return NextResponse.json(
        { error: "Tipe kategori harus INCOME atau EXPENSE." },
        { status: 400 }
      );
    }
    data.type = type;
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data,
    });
    return NextResponse.json({ category: updated });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Kategori dengan nama itu sudah ada." },
        { status: 409 }
      );
    }
    throw e;
  }
}

/** DELETE /api/categories/[id] — hapus kategori (ditolak bila masih dipakai transaksi). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const category = await milikPengguna(userId, id);
  if (!category) {
    return NextResponse.json(
      { error: "Kategori tidak ditemukan." },
      { status: 404 }
    );
  }

  const dipakai = await prisma.transaction.count({
    where: { categoryId: id, userId },
  });
  if (dipakai > 0) {
    return NextResponse.json(
      {
        error: `Kategori masih dipakai ${dipakai} transaksi. Pindahkan dulu transaksinya ke kategori lain.`,
      },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
