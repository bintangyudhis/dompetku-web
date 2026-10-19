import Link from "next/link";
import FeatureCard from "@/components/FeatureCard";
import { fiturUnggulan, rencana7Hari } from "@/lib/features";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      {/* Navigasi sederhana */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            💰 DompetKu
          </span>
          <Link
            href="/login"
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Masuk
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-20 px-6 py-16">
        {/* Hero */}
        <section className="flex flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-amber-300 bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            🚧 Day 1 — Dalam pengembangan bertahap
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Kelola Keuangan Pribadimu dengan{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              DompetKu
            </span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Aplikasi web pencatat keuangan pribadi berbahasa Indonesia. Catat
            pemasukan dan pengeluaran harian, pantau arus kas, dan rencanakan
            keuanganmu dengan lebih baik.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow transition hover:bg-emerald-700"
            >
              Mulai Mencatat
            </Link>
            <span className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
              ⏳ Fitur login segera hadir (Day 7)
            </span>
          </div>
        </section>

        {/* Fitur */}
        <section>
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Fitur yang Akan Dibangun
          </h2>
          <p className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
            Dikembangkan step-by-step selama 7 hari.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fiturUnggulan.map((fitur) => (
              <FeatureCard key={fitur.judul} fitur={fitur} />
            ))}
          </div>
        </section>

        {/* Rencana 7 hari */}
        <section>
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Rencana Pengembangan 7 Hari
          </h2>
          <p className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
            Satu push setiap hari, satu fitur (atau lebih) setiap harinya.
          </p>
          <ol className="mt-8 space-y-4">
            {rencana7Hari.map((rencana) => (
              <li
                key={rencana.hari}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {rencana.hari}
                </span>
                <div>
                  <h3 className="font-semibold">{rencana.judul}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {rencana.deskripsi}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
          DompetKu © 2026 — Dibangun dengan Next.js, satu commit setiap hari.
        </p>
      </footer>
    </div>
  );
}
