import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BudgetBoard from "@/components/BudgetBoard";

export const instant = false;

export const metadata = {
  title: "Budget — DompetKu",
  description: "Atur batas pengeluaran per kategori setiap bulan.",
};

/** Halaman budget: batas per kategori + progress + peringatan 80%/100%. */
export default async function BudgetPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const kategori = await prisma.category.findMany({
    where: { userId, type: "EXPENSE" },
    select: { id: true, name: true, icon: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">📉 Budget</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tentukan batas pengeluaran per kategori — dapat peringatan saat
          pemakaian mencapai 80% dan 100%.
        </p>
      </div>
      <BudgetBoard kategori={kategori} />
    </div>
  );
}
