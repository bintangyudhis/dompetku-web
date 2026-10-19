import type { Fitur } from "@/lib/features";

export default function FeatureCard({ fitur }: { fitur: Fitur }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-3xl" aria-hidden="true">
        {fitur.ikon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {fitur.judul}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {fitur.deskripsi}
      </p>
    </div>
  );
}
