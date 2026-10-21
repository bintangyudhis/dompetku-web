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
