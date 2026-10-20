import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/seed";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Membuat akun baru + mengisi kategori bawaan agar langsung siap dipakai.
 */
export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 }
    );
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").toLowerCase().trim();
  const password = body.password ?? "";

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: "Nama harus 2–80 karakter." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email) || email.length > 120) {
    return NextResponse.json(
      { error: "Alamat email tidak valid." },
      { status: 400 }
    );
  }
  if (password.length < 6 || password.length > 72) {
    return NextResponse.json(
      { error: "Kata sandi minimal 6 karakter." },
      { status: 400 }
    );
  }

  const sudahAda = await prisma.user.findUnique({ where: { email } });
  if (sudahAda) {
    return NextResponse.json(
      { error: "Email sudah terdaftar. Silakan masuk." },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash },
  });

  // Kategori bawaan untuk akun baru
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user.id })),
  });

  return NextResponse.json(
    { ok: true, user: { id: user.id, name: user.name, email: user.email } },
    { status: 201 }
  );
}
