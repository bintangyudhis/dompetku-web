import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RecurringBoard from "@/components/RecurringBoard";

export const instant = false;

export const metadata = {
  title: "Pemasukan Rutin — DompetKu",
  description: "Kelola gaji dan pemasukan berulang yang terbit tiap bulan.",
};

/** Halaman pemasukan tetap: template rutin + tombol terapkan bulan ini. */
export default async function RutinPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const kategori = await prisma.category.findMany({
    where: { userId, type: "INCOME" },
    select: { id: true, name: true, icon: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">🔁 Pemasukan Rutin</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Daftarkan gaji atau pemasukan berulangmu — terbitkan jadi transaksi
          tiap bulan dengan satu klik.
        </p>
      </div>
      <RecurringBoard kategori={kategori} />
    </div>
  );
}
