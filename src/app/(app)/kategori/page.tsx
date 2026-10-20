import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CategoryBoard, { type KategoriItem } from "@/components/CategoryBoard";

export const metadata = {
  title: "Kategori — DompetKu",
  description: "Kelola kategori pemasukan dan pengeluaran.",
};

// Membaca sesi + database → boleh blocking, render per-request.
export const instant = false;

/** Halaman kategori: tambah, ubah, hapus. */
export default async function KategoriPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const rows = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: { _count: { select: { transactions: true } } },
  });

  const awal: KategoriItem[] = rows.map((k) => ({
    id: k.id,
    name: k.name,
    icon: k.icon,
    type: k.type,
    dipakai: k._count.transactions,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">🏷️ Kategori</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Kelompokkan transaksimu. Kategori yang masih dipakai transaksi tidak
        bisa dihapus.
      </p>
      <div className="mt-6">
        <CategoryBoard awal={awal} />
      </div>
    </div>
  );
}
