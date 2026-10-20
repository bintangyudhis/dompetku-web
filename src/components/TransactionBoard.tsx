"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatRupiah, formatTanggal } from "@/lib/format";
import TransactionForm, {
  type KategoriOption,
  type TransaksiAwal,
} from "./TransactionForm";

export interface TransaksiItem {
  id: string;
  amount: number;
  note: string | null;
  date: string; // ISO
  type: string;
  categoryId: string;
  category: { id: string; name: string; icon: string };
}

interface TransactionBoardProps {
  transactions: TransaksiItem[];
  categories: KategoriOption[];
  totalMasuk: number;
  totalKeluar: number;
  totalSemua: number;
}

/**
 * Papan transaksi: filter, pencarian, daftar, tambah/ubah/hapus.
 * Filter disimpan di URL agar bisa dibagikan & dipakai tombol kembali.
 */
export default function TransactionBoard({
  transactions,
  categories,
  totalMasuk,
  totalKeluar,
  totalSemua,
}: TransactionBoardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [diedit, setDiedit] = useState<TransaksiAwal | null>(null);

  // Debounce pencarian → update URL
  useEffect(() => {
    const t = setTimeout(() => {
      const saatIni = searchParams.get("q") ?? "";
      if (q !== saatIni) terapkan({ q });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function terapkan(perubahan: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(perubahan)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.replace(`/transaksi?${next.toString()}`));
  }

  function resetFilter() {
    setQ("");
    startTransition(() => router.replace("/transaksi"));
  }

  async function hapus(id: string, label: string) {
    if (!window.confirm(`Hapus transaksi "${label}"?`)) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "Gagal menghapus transaksi.");
      return;
    }
    router.refresh();
  }

  function bukaTambah() {
    setDiedit(null);
    setModalTerbuka(true);
  }

  function bukaUbah(t: TransaksiItem) {
    setDiedit({
      id: t.id,
      amount: t.amount,
      note: t.note,
      date: t.date,
      type: t.type,
      categoryId: t.categoryId,
    });
    setModalTerbuka(true);
  }

  const adaFilter = ["q", "type", "categoryId", "from", "to"].some(
    (k) => searchParams.get(k)
  );

  const inputCls =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <div>
      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Pemasukan
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(totalMasuk)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Pengeluaran
          </p>
          <p className="mt-1 text-lg font-bold text-red-600 dark:text-red-400">
            {formatRupiah(totalKeluar)}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 sm:col-span-1 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Selisih
          </p>
          <p className="mt-1 text-lg font-bold">{formatRupiah(totalMasuk - totalKeluar)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Cari catatan…"
          className={`${inputCls} w-44 flex-1 sm:max-w-56`}
        />
        <select
          value={searchParams.get("type") ?? ""}
          onChange={(e) => terapkan({ type: e.target.value })}
          className={inputCls}
          aria-label="Filter tipe"
        >
          <option value="">Semua tipe</option>
          <option value="EXPENSE">Pengeluaran</option>
          <option value="INCOME">Pemasukan</option>
        </select>
        <select
          value={searchParams.get("categoryId") ?? ""}
          onChange={(e) => terapkan({ categoryId: e.target.value })}
          className={`${inputCls} max-w-44`}
          aria-label="Filter kategori"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => terapkan({ from: e.target.value })}
          className={inputCls}
          aria-label="Dari tanggal"
        />
        <input
          type="date"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => terapkan({ to: e.target.value })}
          className={inputCls}
          aria-label="Sampai tanggal"
        />
        {adaFilter && (
          <button
            type="button"
            onClick={resetFilter}
            className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Reset
          </button>
        )}
        <button
          type="button"
          onClick={bukaTambah}
          className="ml-auto rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          ➕ Tambah
        </button>
      </div>

      {/* Daftar */}
      <div className="mt-4">
        {isPending && (
          <p className="py-2 text-sm text-zinc-500">Memuat…</p>
        )}
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <p className="text-4xl" aria-hidden="true">
              📭
            </p>
            <p className="mt-3 font-medium">
              {adaFilter
                ? "Tidak ada transaksi yang cocok dengan filter."
                : "Belum ada transaksi. Yuk catat yang pertama!"}
            </p>
            {!adaFilter && (
              <button
                type="button"
                onClick={bukaTambah}
                className="mt-4 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                ➕ Tambah Transaksi
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-500">
              Menampilkan {transactions.length} dari {totalSemua} transaksi
            </p>
            <ul className="space-y-2">
              {transactions.map((t) => {
                const masuk = t.type === "INCOME";
                return (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xl dark:bg-zinc-900"
                      aria-hidden="true"
                    >
                      {t.category.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {t.note || t.category.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                        {t.category.name} • {formatTanggal(t.date)}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-bold ${
                        masuk
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {masuk ? "+" : "−"}
                      {formatRupiah(t.amount)}
                    </p>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => bukaUbah(t)}
                        title="Ubah"
                        aria-label={`Ubah transaksi ${t.note || t.category.name}`}
                        className="rounded-lg px-2 py-1 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(t.id, t.note || t.category.name)}
                        title="Hapus"
                        aria-label={`Hapus transaksi ${t.note || t.category.name}`}
                        className="rounded-lg px-2 py-1 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {modalTerbuka && (
        <TransactionForm
          categories={categories}
          initial={diedit}
          onClose={() => setModalTerbuka(false)}
          onSaved={() => {
            setModalTerbuka(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
