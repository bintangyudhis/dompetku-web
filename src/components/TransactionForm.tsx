"use client";

import { useMemo, useState } from "react";

export interface KategoriOption {
  id: string;
  name: string;
  icon: string;
  type: string;
}

export interface TransaksiAwal {
  id: string;
  amount: number;
  note: string | null;
  date: string; // ISO
  type: string;
  categoryId: string;
}

interface TransactionFormProps {
  categories: KategoriOption[];
  initial?: TransaksiAwal | null;
  onClose: () => void;
  onSaved: () => void;
}

function keInputTanggal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Form tambah/ubah transaksi dalam modal. */
export default function TransactionForm({
  categories,
  initial,
  onClose,
  onSaved,
}: TransactionFormProps) {
  const isEdit = !!initial;
  const [type, setType] = useState(initial?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [date, setDate] = useState(
    initial ? keInputTanggal(initial.date) : keInputTanggal(new Date().toISOString())
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const kategoriTipe = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  // Bila tipe diganti dan kategori terpilih tidak cocok → reset pilihan.
  function gantiTipe(t: string) {
    setType(t);
    if (!categories.some((c) => c.id === categoryId && c.type === t)) {
      setCategoryId("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const nominal = Math.floor(Number(amount));
    if (!Number.isFinite(nominal) || nominal < 1) {
      setError("Nominal harus angka lebih dari 0.");
      return;
    }
    if (!categoryId) {
      setError("Pilih kategori dulu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/transactions/${initial!.id}` : "/api/transactions",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: nominal,
            type,
            categoryId,
            date: new Date(`${date}T12:00:00`).toISOString(),
            note: note.trim() || null,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan transaksi.");
        setLoading(false);
        return;
      }
      onSaved();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-emerald-900";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">
          {isEdit ? "✏️ Ubah Transaksi" : "➕ Tambah Transaksi"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Tipe */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
            {[
              { v: "EXPENSE", label: "💸 Pengeluaran" },
              { v: "INCOME", label: "💰 Pemasukan" },
            ].map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => gantiTipe(t.v)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  type === t.v
                    ? "bg-white shadow text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Nominal */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nominal (Rp)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="mis. 25000"
              required
              className={inputCls}
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">— Pilih kategori —</option>
              {kategoriTipe.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Catatan <span className="font-normal text-zinc-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="mis. makan siang di warteg"
              maxLength={200}
              className={inputCls}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Menyimpan…" : isEdit ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
