import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { SignJWT, jwtVerify } from "jose";
import { authOptions } from "./auth";

/** Ambil ID pengguna dari sesi — null bila belum masuk. */
export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Respons 401 standar untuk API yang butuh login. */
export function unauthorized() {
  return NextResponse.json(
    { error: "Silakan masuk dulu untuk mengakses data ini." },
    { status: 401 }
  );
}

/*
 * === Autentikasi aplikasi mobile (REST API publik /api/public/*) ===
 *
 * Arsitektur yang disepakati (2026-10-21): aplikasi HP masuk dengan email +
 * kata sandi yang sama dengan web (satu akun, satu database). Setelah login
 * berhasil, server menerbitkan TOKEN SESI (JWT, ditandatangani
 * NEXTAUTH_SECRET) yang dibawa aplikasi pada setiap permintaan data.
 *
 * Selain itu ada API KEY APLIKASI: satu kunci yang hanya tertanam di code
 * aplikasi + env server (MOBILE_API_KEY), terkirim sebagai header
 * `x-api-key`. Ini kunci identitas aplikasi — BUKAN token buatan pengguna
 * dan tidak pernah ditampilkan di website. Bila env belum terpasang,
 * pemeriksaan kunci aplikasi dilewati (diaktifkan saat minggu aplikasi).
 */

function kunciJwt(): Uint8Array | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/** Terbitkan token sesi untuk aplikasi (berlaku 30 hari). */
export async function buatTokenSesi(user: {
  id: string;
  name: string;
  email: string;
}): Promise<string | null> {
  const kunci = kunciJwt();
  if (!kunci) return null;
  return new SignJWT({ name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(kunci);
}

/** Benar bila permintaan membawa API key aplikasi yang benar. */
export function kunciAplikasiValid(req: Request): boolean {
  const kunci = process.env.MOBILE_API_KEY;
  if (!kunci) return true; // belum dipasang — aktif mulai minggu aplikasi
  return req.headers.get("x-api-key") === kunci;
}

/**
 * Ambil ID pengguna dari header `Authorization: Bearer <token sesi>` —
 * dipakai endpoint publik /api/public/*. Token sesi diterbitkan oleh
 * POST /api/public/auth/login. Mengembalikan null bila token tidak valid,
 * kedaluwarsa, atau API key aplikasi salah.
 */
export async function getBearerUserId(req: Request): Promise<string | null> {
  if (!kunciAplikasiValid(req)) return null;

  const header = req.headers.get("authorization") ?? "";
  const cocok = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!cocok) return null;

  const kunci = kunciJwt();
  if (!kunci) return null;

  try {
    const { payload } = await jwtVerify(cocok[1], kunci);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Respons 401 untuk endpoint publik — belum login di aplikasi. */
export function unauthorizedBearer() {
  return NextResponse.json(
    {
      error:
        "Sesi aplikasi tidak valid. Masuk lewat aplikasi untuk mendapatkan token sesi.",
    },
    { status: 401 }
  );
}
