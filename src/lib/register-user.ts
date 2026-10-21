import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { DEFAULT_CATEGORIES, DEFAULT_SHORTCUTS } from "./seed";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type HasilDaftar =
  | {
      ok: true;
      user: { id: string; name: string; email: string };
    }
  | { ok: false; status: number; error: string };

/**
 * Buat akun baru + kategori & shortcut bawaan. Dipakai bersama oleh
 * pendaftaran web (POST /api/auth/register) dan aplikasi mobile
 * (POST /api/public/auth/register) — satu akun berlaku untuk keduanya.
 */
export async function daftarPengguna(
  nameRaw: string,
  emailRaw: string,
  password: string
): Promise<HasilDaftar> {
  const name = (nameRaw ?? "").trim();
  const email = (emailRaw ?? "").toLowerCase().trim();

  if (name.length < 2 || name.length > 80) {
    return { ok: false, status: 400, error: "Nama harus 2–80 karakter." };
  }
  if (!EMAIL_RE.test(email) || email.length > 120) {
    return { ok: false, status: 400, error: "Alamat email tidak valid." };
  }
  if (password.length < 6 || password.length > 72) {
    return {
      ok: false,
      status: 400,
      error: "Kata sandi minimal 6 karakter.",
    };
  }

  const sudahAda = await prisma.user.findUnique({ where: { email } });
  if (sudahAda) {
    return {
      ok: false,
      status: 409,
      error: "Email sudah terdaftar. Silakan masuk.",
    };
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash },
  });

  // Kategori bawaan untuk akun baru
  const dibuat = await Promise.all(
    DEFAULT_CATEGORIES.map((c) =>
      prisma.category.create({ data: { ...c, userId: user.id } })
    )
  );
  const kategoriId = new Map(dibuat.map((k) => [k.name, k.id]));

  // Shortcut cepat bawaan (mis. "Parkir 2k")
  await prisma.quickShortcut.createMany({
    data: DEFAULT_SHORTCUTS.map((s) => ({
      label: s.label,
      amount: s.amount,
      icon: s.icon,
      categoryId: kategoriId.get(s.categoryName) ?? null,
      userId: user.id,
    })),
  });

  return {
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
  };
}
