import { NextResponse } from "next/server";
import { daftarPengguna } from "@/lib/register-user";
import { buatTokenSesi } from "@/lib/api-auth";

/**
 * POST /api/public/auth/register — daftar akun baru dari aplikasi mobile.
 * Body: { name, email, password } — akun yang sama dengan website (satu
 * database); pembuatan akun memakai logika yang sama dengan web.
 * Sukses: 201 { token, user } — langsung masuk, tidak perlu login ulang.
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

  const token = await buatTokenSesi(hasil.user);
  if (!token) {
    return NextResponse.json(
      { error: "Server belum dikonfigurasi untuk sesi aplikasi." },
      { status: 500 }
    );
  }

  return NextResponse.json({ token, user: hasil.user }, { status: 201 });
}
