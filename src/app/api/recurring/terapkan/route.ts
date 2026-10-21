import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";
import { bulanKiniJakarta, hariDalamBulan } from "@/lib/waktu";

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * POST /api/recurring/terapkan — terbitkan transaksi pemasukan bulan ini
 * untuk semua template aktif yang belum diterapkan bulan ini.
 * Idempoten: template yang sudah diterapkan bulan ini dilewati.
 */
export async function POST() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { year, month } = bulanKiniJakarta();
  const kunciBulan = `${year}-${String(month).padStart(2, "0")}`;
  const maksHari = hariDalamBulan(year, month);

  const templates = await prisma.recurringTemplate.findMany({
    where: { userId, active: true, NOT: { lastApplied: kunciBulan } },
    include: { category: { select: { id: true, name: true } } },
  });

  if (templates.length === 0) {
    return NextResponse.json({
      diterbitkan: 0,
      pesan: "Semua pemasukan rutin bulan ini sudah diterapkan.",
    });
  }

  const dibuat = await prisma.$transaction(
    templates.map((t) => {
      const hari = Math.min(t.dayOfMonth, maksHari);
      // 07:00 WIB di tanggal terbit
      const date = new Date(Date.UTC(year, month - 1, hari, 7, 0, 0) - WIB_OFFSET_MS);
      return prisma.transaction.create({
        data: {
          amount: t.amount,
          note: t.note ?? `${t.label} — ${kunciBulan}`,
          date,
          type: "INCOME",
          categoryId: t.categoryId,
          userId,
        },
      });
    })
  );

  await prisma.recurringTemplate.updateMany({
    where: { id: { in: templates.map((t) => t.id) } },
    data: { lastApplied: kunciBulan },
  });

  return NextResponse.json({
    diterbitkan: dibuat.length,
    pesan: `${dibuat.length} pemasukan rutin diterbitkan untuk bulan ini.`,
  });
}
