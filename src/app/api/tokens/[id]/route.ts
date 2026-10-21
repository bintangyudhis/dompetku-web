import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

/** DELETE /api/tokens/[id] — cabut (revoke) token API. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const ada = await prisma.apiToken.findFirst({ where: { id, userId } });
  if (!ada) {
    return NextResponse.json({ error: "Token tidak ditemukan." }, { status: 404 });
  }

  await prisma.apiToken.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
