"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";

export interface ShortcutItem {
  id: string;
  label: string;
  amount: number;
  icon: string;
  categoryId: string | null;
  category: { id: string; name: string; icon: string } | null;
}

export interface KategoriPengeluaran {
  id: string;
  name: string;
  icon: string;
}

interface QuickShortcutsProps {
  shortcuts: ShortcutItem[];
  kategoriPengeluaran: KategoriPengeluaran[];
}

/**
 * Shortcut cepat — preset pengeluaran 1-klik (mis. "Parkir 2k").
 * Mode kelola: tambah/ubah/hapus preset.
 */
export default function QuickShortcuts({
  shortcuts,
  kategoriPengeluaran,
}: QuickShortcutsProps) {
  const router = useRouter();
  const [kelola, setKelola] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [dipakai, setDipakai] = useState<string | null>(null);

  // Form tambah/ubah
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function tampilkanPesan(teks: string) {
    setPesan(teks);
    window.setTimeout(() => setPesan(null), 2500);
  }

  async function pakai(s: ShortcutItem) {
    setDipakai(s.id);
    try {
      const res = await fetch(`/api/shortcuts/${s.id}/pakai`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        tampilkanPesan(`❌ ${data.error ?? "Gagal mencatat."}`);
        return;
      }
      tampilkanPesan(`✅ ${s.label} tercatat!`);
      router.refresh();
    } catch {
      tampilkanPesan("❌ Terjadi kesalahan jaringan.");
    } finally {
      setDipakai(null);
    }
  }

  function bukaTambah() {
    setEditId(null);
    setLabel("");
    setAmount("");
    setIcon("");
    setCategoryId("");
    setError(null);
    setFormTerbuka(true);
  }

  function bukaUbah(s: ShortcutItem) {
    setEditId(s.id);
    setLabel(s.label);
    setAmount(String(s.amount));
    setIcon(s.icon);
    setCategoryId(s.categoryId ?? "");
    setError(null);
    setFormTerbuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const nominal = Math.floor(Number(amount));
    if (!label.trim()) {
      setError("Label wajib diisi, mis. “Parkir 2k”.");
      return;
    }
    if (!Number.isFinite(nominal) || nominal < 1) {
      setError("Nominal harus angka lebih dari 0.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        editId ? `/api/shortcuts/${editId}` : "/api/shortcuts",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: label.trim(),
            amount: nominal,
            icon: icon.trim() || "⚡",
            categoryId: categoryId || null,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan shortcut.");
        setLoading(false);
        return;
      }
      setFormTerbuka(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function hapus(s: ShortcutItem) {
    if (!window.confirm(`Hapus shortcut "${s.label}"?`)) return;
    const res = await fetch(`/api/shortcuts/${s.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "Gagal menghapus shortcut.");
      return;
    }
    router.refresh();
  }

  const inputCls =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold">⚡ Shortcut Cepat</h2>
        <button
          type="button"
          onClick={() => setKelola((v) => !v)}
          className="rounded-full px-3 py-1 text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          {kelola ? "Selesai" : "Kelola"}
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Satu klik langsung tercatat sebagai pengeluaran hari ini.
      </p>

      {pesan && (
        <p
          role="status"
          className="mt-2 rounded-xl bg-white px-3 py-2 text-sm font-medium shadow-sm dark:bg-zinc-900"
        >
          {pesan}
        </p>
      )}

      {shortcuts.length === 0 ? (
        <div className="mt-3 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Belum ada shortcut. Buat preset pengeluaran favoritmu!
          </p>
          <button
            type="button"
            onClick={bukaTambah}
            className="mt-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            ➕ Buat Shortcut
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {shortcuts.map((s) => (
            <div key={s.id} className="flex items-stretch">
              <button
                type="button"
                onClick={() => pakai(s)}
                disabled={dipakai === s.id || kelola}
                title={
                  s.category
                    ? `Catat ${s.label} → ${s.category.name}`
                    : `Catat ${s.label}`
                }
                className="flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow disabled:opacity-60 dark:border-amber-800 dark:bg-zinc-900"
              >
                <span className="text-lg" aria-hidden="true">
                  {s.icon}
                </span>
                <span>
                  {dipakai === s.id ? "Mencatat…" : s.label}
                  <span className="block text-xs font-normal text-zinc-500">
                    {formatRupiah(s.amount)}
                  </span>
                </span>
              </button>
              {kelola && (
                <div className="flex flex-col justify-center gap-1 pl-1">
                  <button
                    type="button"
                    onClick={() => bukaUbah(s)}
                    title="Ubah"
                    aria-label={`Ubah shortcut ${s.label}`}
                    className="rounded-lg px-1.5 py-0.5 text-xs transition hover:bg-amber-200 dark:hover:bg-amber-900"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => hapus(s)}
                    title="Hapus"
                    aria-label={`Hapus shortcut ${s.label}`}
                    className="rounded-lg px-1.5 py-0.5 text-xs transition hover:bg-amber-200 dark:hover:bg-amber-900"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
          {kelola && (
            <button
              type="button"
              onClick={bukaTambah}
              className="flex items-center rounded-xl border border-dashed border-amber-400 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
            >
              ➕ Baru
            </button>
          )}
        </div>
      )}

      {/* Modal form tambah/ubah */}
      {formTerbuka && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setFormTerbuka(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">
              {editId ? "✏️ Ubah Shortcut" : "➕ Shortcut Baru"}
            </h3>
            <form onSubmit={simpan} className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="⚡"
                  maxLength={10}
                  aria-label="Ikon"
                  className={`${inputCls} w-16 text-center`}
                />
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Label, mis. Parkir 2k"
                  maxLength={40}
                  required
                  aria-label="Label shortcut"
                  className={`${inputCls} flex-1`}
                />
              </div>
              <input
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nominal (Rp), mis. 2000"
                required
                aria-label="Nominal"
                className={`${inputCls} w-full`}
              />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-label="Kategori pengeluaran"
                className={`${inputCls} w-full`}
              >
                <option value="">— Kategori (opsional) —</option>
                {kategoriPengeluaran.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormTerbuka(false)}
                  className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                >
                  {loading ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
