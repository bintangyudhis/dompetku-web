import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
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

/**
 * Ambil ID pengguna dari header `Authorization: Bearer <token>` — dipakai
 * endpoint publik /api/public/*. Mengembalikan null bila token tidak valid.
 * Memperbarui lastUsedAt saat token dipakai.
 */
export async function getBearerUserId(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") ?? "";
  const cocok = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!cocok) return null;

  const tokenHash = createHash("sha256").update(cocok[1]).digest("hex");
  const token = await prisma.apiToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true },
  });
  if (!token) return null;

  await prisma.apiToken.update({
    where: { id: token.id },
    data: { lastUsedAt: new Date() },
  });

  return token.userId;
}

/** Respons 401 untuk endpoint publik — token hilang atau tidak valid. */
export function unauthorizedBearer() {
  return NextResponse.json(
    { error: "Token API tidak valid. Sertakan header Authorization: Bearer <token>." },
    { status: 401 }
  );
}
