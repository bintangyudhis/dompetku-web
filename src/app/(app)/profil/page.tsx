import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatTanggal } from "@/lib/format";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Profil — DompetKu",
  description: "Lihat dan kelola profil akun DompetKu.",
};

// Membaca sesi + database → boleh blocking, render per-request.
export const instant = false;

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { transactions: true, categories: true } },
    },
  });
  if (!user) redirect("/login");

  const totalPengeluaran = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "EXPENSE" },
    _sum: { amount: true },
  });

  const inisial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">👤 Profil</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Informasi akun DompetKu kamu.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
            {inisial}
          </span>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.email}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Bergabung sejak {formatTanggal(user.createdAt)}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              Transaksi
            </dt>
            <dd className="mt-1 text-2xl font-bold">
              {user._count.transactions}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              Kategori
            </dt>
            <dd className="mt-1 text-2xl font-bold">
              {user._count.categories}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              Total keluar
            </dt>
            <dd className="mt-1 text-lg font-bold text-red-600 dark:text-red-400">
              {formatRupiah(totalPengeluaran._sum.amount ?? 0)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <LogoutButton className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700" />
        </div>
      </div>
    </div>
  );
}
