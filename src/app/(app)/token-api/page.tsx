import TokenBoard from "@/components/TokenBoard";

export const instant = false;

export const metadata = {
  title: "Token API — DompetKu",
  description: "Kelola token akses untuk REST API publik DompetKu.",
};

/** Halaman kelola token API + dokumentasi endpoint publik. */
export default function TokenApiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">🔑 Token API</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Buat token akses agar aplikasi lain (mis. aplikasi Flutter) bisa
          membaca & mencatat ke DompetKu lewat REST API.
        </p>
      </div>
      <TokenBoard />
    </div>
  );
}
