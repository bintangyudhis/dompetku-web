import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerUserId, unauthorizedBearer } from "@/lib/api-auth";

/** GET /api/public/categories?type= — daftar kategori (butuh Bearer). */
export async function GET(req: Request) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();

  const type = new URL(req.url).searchParams.get("type")?.toUpperCase();
  const where: Record<string, unknown> = { userId };
  if (type === "INCOME" || type === "EXPENSE") where.type = type;

  const categories = await prisma.category.findMany({
    where,
    select: { id: true, name: true, icon: true, type: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

const TIPE_VALID = ["INCOME", "EXPENSE"] as const;

/**
 * POST /api/public/categories — buat kategori baru (butuh Bearer).
 * Body: { name, icon?, type }. Cerminan POST /api/categories versi sesi,
 * supaya aplikasi Flutter bisa CRUD kategori tanpa sesi NextAuth.
 */
export async function POST(req: Request) {
  const userId = await getBearerUserId(req);
  if (!userId) return unauthorizedBearer();

  let body: { name?: string; icon?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 },
    );
  }

  const name = (body.name ?? "").trim();
  const icon = (body.icon ?? "💰").trim() || "💰";
  const type = (body.type ?? "").toUpperCase();

  if (name.length < 1 || name.length > 60) {
    return NextResponse.json(
      { error: "Nama kategori harus 1–60 karakter." },
      { status: 400 },
    );
  }
  if (icon.length > 10) {
    return NextResponse.json(
      { error: "Ikon terlalu panjang." },
      { status: 400 },
    );
  }
  if (!TIPE_VALID.includes(type as (typeof TIPE_VALID)[number])) {
    return NextResponse.json(
      { error: "Tipe kategori harus INCOME atau EXPENSE." },
      { status: 400 },
    );
  }

  try {
    const category = await prisma.category.create({
      data: { userId, name, icon, type },
      select: { id: true, name: true, icon: true, type: true },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Kategori dengan nama itu sudah ada." },
        { status: 409 },
      );
    }
    throw e;
  }
}
