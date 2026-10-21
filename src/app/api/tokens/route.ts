import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

const PREFIX = "dk_";

/**
 * GET /api/tokens — daftar token API milik pengguna
 * (tanpa nilai token aslinya — hanya prefix & info pakai).
 */
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const tokens = await prisma.apiToken.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      prefix: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tokens });
}

/**
 * POST /api/tokens { name } — buat token API baru.
 * Nilai token asli HANYA dikembalikan sekali di respons ini — simpan baik-baik.
 */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 60) || "Token API";

  const jumlah = await prisma.apiToken.count({ where: { userId } });
  if (jumlah >= 10) {
    return NextResponse.json(
      { error: "Maksimal 10 token per akun. Hapus token lama dulu." },
      { status: 400 }
    );
  }

  const token = `${PREFIX}${randomBytes(32).toString("hex")}`;
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const dibuat = await prisma.apiToken.create({
    data: {
      name,
      tokenHash,
      prefix: token.slice(0, 11),
      userId,
    },
    select: { id: true, name: true, prefix: true, createdAt: true },
  });

  return NextResponse.json(
    {
      token,
      ...dibuat,
      peringatan:
        "Simpan token ini sekarang — nilainya tidak akan ditampilkan lagi.",
    },
    { status: 201 }
  );
}
