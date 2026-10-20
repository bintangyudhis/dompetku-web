import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionBoard, {
  type TransaksiItem,
} from "@/components/TransactionBoard";
import QuickShortcuts, {
  type ShortcutItem,
} from "@/components/QuickShortcuts";

export const metadata = {
  title: "Transaksi — DompetKu",
  description: "Catat dan kelola pemasukan serta pengeluaran harian.",
};

// Membaca sesi + database → boleh blocking, render per-request.
export const instant = false;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

/** Halaman transaksi: daftar + filter + pencarian + tambah/ubah/hapus. */
export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const sp = await searchParams;
  const q = str(sp.q).trim();
  const type = str(sp.type).toUpperCase();
  const categoryId = str(sp.categoryId);
  const from = str(sp.from);
  const to = str(sp.to);

  const where: Record<string, unknown> = { userId };
  if (type === "INCOME" || type === "EXPENSE") where.type = type;
  if (categoryId) where.categoryId = categoryId;
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
  if (q) where.note = { contains: q, mode: "insensitive" };

  const [rows, categories, ringkasan, totalSemua, shortcutRows] =
    await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: { select: { id: true, name: true, icon: true } } },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 100,
      }),
      prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, icon: true, type: true },
      }),
      prisma.transaction.groupBy({
        by: ["type"],
        where,
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where }),
      prisma.quickShortcut.findMany({
        where: { userId },
        include: {
          category: { select: { id: true, name: true, icon: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  const shortcuts: ShortcutItem[] = shortcutRows.map((s) => ({
    id: s.id,
    label: s.label,
    amount: s.amount,
    icon: s.icon,
    categoryId: s.categoryId,
    category: s.category,
  }));

  const transactions: TransaksiItem[] = rows.map((t) => ({
    id: t.id,
    amount: t.amount,
    note: t.note,
    date: t.date.toISOString(),
    type: t.type,
    categoryId: t.categoryId,
    category: t.category,
  }));

  const totalMasuk =
    ringkasan.find((r) => r.type === "INCOME")?._sum.amount ?? 0;
  const totalKeluar =
    ringkasan.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">💸 Transaksi</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Catat pemasukan & pengeluaran harianmu di sini.
      </p>
      <div className="mt-6">
        <QuickShortcuts
          shortcuts={shortcuts}
          kategoriPengeluaran={categories.filter((c) => c.type === "EXPENSE")}
        />
      </div>
      <div className="mt-6">
        <TransactionBoard
          transactions={transactions}
          categories={categories}
          totalMasuk={totalMasuk}
          totalKeluar={totalKeluar}
          totalSemua={totalSemua}
        />
      </div>
    </div>
  );
}
