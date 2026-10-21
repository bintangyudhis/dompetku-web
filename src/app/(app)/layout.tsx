import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";

// Membaca sesi → boleh blocking, render per-request.
export const instant = false;

/** Layout area aplikasi — hanya untuk pengguna yang sudah masuk. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <Navbar userName={session?.user?.name ?? "Pengguna"} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
          DompetKu © 2026 — catat keuanganmu setiap hari.
        </p>
      </footer>
    </div>
  );
}
