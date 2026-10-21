import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { buatTokenSesi } from "@/lib/api-auth";

/**
 * POST /api/public/auth/login — masuk untuk aplikasi mobile.
 * Body: { email, password } — akun yang sama dengan website (satu database).
 * Sukses: { token, user } — token sesi (JWT, 30 hari) dipakai aplikasi pada
 * setiap permintaan berikutnya sebagai `Authorization: Bearer <token>`.
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 }
    );
  }

  const email = (body.email ?? "").toLowerCase().trim();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan kata sandi wajib diisi." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json(
      { error: "Email atau kata sandi salah." },
      { status: 401 }
    );
  }

  const token = await buatTokenSesi(user);
  if (!token) {
    return NextResponse.json(
      { error: "Server belum dikonfigurasi untuk sesi aplikasi." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
