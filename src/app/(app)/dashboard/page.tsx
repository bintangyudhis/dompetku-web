import DashboardBoard from "@/components/DashboardBoard";

export const instant = false;

export const metadata = {
  title: "Dashboard — DompetKu",
};

/** Halaman dashboard: ringkasan, grafik, analisa kategori, transaksi terbaru. */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">📊 Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gambaran keuanganmu bulan ini dalam sekali lihat.
        </p>
      </div>
      <DashboardBoard />
    </div>
  );
}
