import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

function escapeCsv(nilai: string | number): string {
  const s = String(nilai);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function formatTanggalCsv(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * GET /api/export/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Unduh seluruh (atau rentang) transaksi sebagai file CSV.
 */
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = { userId };
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) {
    const date: Record<string, Date> = {};
    if (from) {
      const d = new Date(`${from}T00:00:00`);
      if (!isNaN(d.getTime())) date.gte = d;
    }
    if (to) {
      const d = new Date(`${to}T23:59:59.999`);
      if (!isNaN(d.getTime())) date.lte = d;
    }
    if (Object.keys(date).length > 0) where.date = date;
  }

  const rows = await prisma.transaction.findMany({
    where,
    include: { category: { select: { name: true } } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    take: 5000,
  });

  const baris = [
    "tanggal,tipe,kategori,nominal,catatan",
    ...rows.map((t) =>
      [
        formatTanggalCsv(t.date),
        t.type,
        escapeCsv(t.category.name),
        t.amount,
        escapeCsv(t.note ?? ""),
      ].join(",")
    ),
  ];

  const namaFile = `dompetku-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse("\uFEFF" + baris.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${namaFile}"`,
    },
  });
}
