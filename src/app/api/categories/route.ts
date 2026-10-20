import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

const TIPE_VALID = ["INCOME", "EXPENSE"] as const;

/** GET /api/categories?type=EXPENSE — daftar kategori milik pengguna. */
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const categories = await prisma.category.findMany({
    where: {
      userId,
      ...(type && TIPE_VALID.includes(type as (typeof TIPE_VALID)[number])
        ? { type }
        : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { transactions: true } } },
  });

  return NextResponse.json({ categories });
}

/** POST /api/categories — buat kategori baru. Body: { name, icon?, type } */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  let body: { name?: string; icon?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 }
    );
  }

  const name = (body.name ?? "").trim();
  const icon = (body.icon ?? "💰").trim() || "💰";
  const type = (body.type ?? "").toUpperCase();

  if (name.length < 1 || name.length > 60) {
    return NextResponse.json(
      { error: "Nama kategori harus 1–60 karakter." },
      { status: 400 }
    );
  }
  if (icon.length > 10) {
    return NextResponse.json(
      { error: "Ikon terlalu panjang." },
      { status: 400 }
    );
  }
  if (!TIPE_VALID.includes(type as (typeof TIPE_VALID)[number])) {
    return NextResponse.json(
      { error: "Tipe kategori harus INCOME atau EXPENSE." },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({
      data: { name, icon, type, userId },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e: unknown) {
    // P2002 = melanggar @@unique([userId, name])
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
