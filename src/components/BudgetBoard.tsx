"use client";

import { useCallback, useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  category: { id: string; name: string; icon: string };
  spent: number;
  persen: number;
  sisa: number;
  status: "AMAN" | "WASPADA" | "LEWAT";
}

interface Kategori {
  id: string;
  name: string;
  icon: string;
}

interface DataBudget {
  bulan: string;
  month: number;
  year: number;
  budgets: Budget[];
}

const GAYA_STATUS: Record<Budget["status"], { bar: string; badge: string; label: string }> = {
  AMAN: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    label: "Aman",
  },
  WASPADA: {
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    label: "⚠️ 80% terpakai",
  },
  LEWAT: {
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    label: "🚨 Melewati batas",
  },
};

/** Board budget — batas per kategori + progress + peringatan. */
export default function BudgetBoard({ kategori }: { kategori: Kategori[] }) {
  const [data, setData] = useState<DataBudget | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form tambah/ubah
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const muat = useCallback(async () => {
    try {
      const res = await fetch("/api/budgets");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal memuat budget.");
      setData(json as DataBudget);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat budget.");
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  function bukaTambah() {
    setEditId(null);
    setCategoryId("");
    setAmount("");
    setFormError(null);
    setFormTerbuka(true);
  }

  function bukaUbah(b: Budget) {
    setEditId(b.id);
    setCategoryId(b.category.id);
    setAmount(String(b.amount));
    setFormError(null);
    setFormTerbuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    const nominal = Math.floor(Number(amount));
    if (!categoryId) {
      setFormError("Pilih kategori dulu.");
      return;
    }
    if (!Number.isFinite(nominal) || nominal < 1000) {
      setFormError("Batas budget minimal Rp1.000.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(editId ? `/api/budgets/${editId}` : "/api/budgets", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, amount: nominal }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(json.error ?? "Gagal menyimpan budget.");
        return;
      }
      setFormTerbuka(false);
      muat();
    } catch {
      setFormError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  async function hapus(id: string, nama: string) {
    if (!window.confirm(`Hapus budget kategori "${nama}" bulan ini?`)) return;
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (res.ok) muat();
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        ❌ {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Periode: <span className="font-semibold text-zinc-800 dark:text-zinc-100">{data?.bulan ?? "…"}</span>
        </p>
        <button
          onClick={bukaTambah}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          ➕ Tambah budget
        </button>
      </div>

      {!data ? (
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      ) : data.budgets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-4xl">📉</p>
          <p className="mt-3 font-semibold">Belum ada budget bulan ini</p>
          <p className="mt-1 text-sm text-zinc-500">
            Atur batas pengeluaran per kategori agar keuanganmu terkendali.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.budgets.map((b) => {
            const gaya = GAYA_STATUS[b.status];
            return (
              <li
                key={b.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{b.category.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{b.category.name}</p>
                    <p className="text-xs text-zinc-500">
                      {formatRupiah(b.spent)} dari {formatRupiah(b.amount)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${gaya.badge}`}>
                    {gaya.label}
                  </span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${gaya.bar}`}
                    style={{ width: `${Math.min(b.persen, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                    {b.persen}%
                  </span>
                  <span className="text-zinc-500">
                    Sisa {formatRupiah(Math.max(b.sisa, 0))}
                    {b.sisa < 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        {" "}(lewat {formatRupiah(-b.sisa)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => bukaUbah(b)}
                    className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  >
                    ✏️ Ubah
                  </button>
                  <button
                    onClick={() => hapus(b.id, b.category.name)}
                    className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {formTerbuka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={simpan}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-bold">
              {editId ? "✏️ Ubah budget" : "➕ Budget baru"}
            </h2>
            <div>
              <label className="mb-1 block text-sm font-medium">Kategori pengeluaran</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!!editId}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="">— Pilih kategori —</option>
                {kategori.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.icon} {k.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Batas per bulan (Rp)</label>
              <input
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="mis. 500000"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400">❌ {formError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormTerbuka(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
