import { NextResponse } from "next/server";
import { daftarPengguna } from "@/lib/register-user";

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Membuat akun baru + mengisi kategori bawaan agar langsung siap dipakai.
 * Logika pembuatan akun dipakai bersama dengan pendaftaran aplikasi mobile
 * (lihat src/lib/register-user.ts).
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

  const hasil = await daftarPengguna(
    body.name ?? "",
    body.email ?? "",
    body.password ?? ""
  );
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.error }, { status: hasil.status });
  }

  return NextResponse.json({ ok: true, user: hasil.user }, { status: 201 });
}
