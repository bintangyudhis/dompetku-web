"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface KategoriItem {
  id: string;
  name: string;
  icon: string;
  type: string;
  dipakai: number;
}

const TIPE_LABEL: Record<string, { judul: string; ikon: string }> = {
  EXPENSE: { judul: "Pengeluaran", ikon: "💸" },
  INCOME: { judul: "Pemasukan", ikon: "💰" },
};

/** Papan kelola kategori: tambah, ubah, hapus. Dikelompokkan per tipe. */
export default function CategoryBoard({
  awal,
}: {
  awal: KategoriItem[];
}) {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [ikon, setIkon] = useState("");
  const [tipe, setTipe] = useState("EXPENSE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [diedit, setDiedit] = useState<KategoriItem | null>(null);
  const [namaEdit, setNamaEdit] = useState("");
  const [ikonEdit, setIkonEdit] = useState("");
  const [errorEdit, setErrorEdit] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  async function tambah(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = nama.trim();
    if (!name) {
      setError("Nama kategori wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon: ikon.trim() || "💰", type: tipe }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menambah kategori.");
        setLoading(false);
        return;
      }
      setNama("");
      setIkon("");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function bukaUbah(k: KategoriItem) {
    setDiedit(k);
    setNamaEdit(k.name);
    setIkonEdit(k.icon);
    setErrorEdit(null);
  }

  async function simpanUbah(e: React.FormEvent) {
    e.preventDefault();
    if (!diedit) return;
    setErrorEdit(null);
    const name = namaEdit.trim();
    if (!name) {
      setErrorEdit("Nama kategori wajib diisi.");
      return;
    }
    setLoadingEdit(true);
    try {
      const res = await fetch(`/api/categories/${diedit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon: ikonEdit.trim() || "💰" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorEdit(data.error ?? "Gagal menyimpan kategori.");
        setLoadingEdit(false);
        return;
      }
      setDiedit(null);
      router.refresh();
    } catch {
      setErrorEdit("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoadingEdit(false);
    }
  }

  async function hapus(k: KategoriItem) {
    if (!window.confirm(`Hapus kategori "${k.icon} ${k.name}"?`)) return;
    const res = await fetch(`/api/categories/${k.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      window.alert(data.error ?? "Gagal menghapus kategori.");
      return;
    }
    router.refresh();
  }

  const inputCls =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <div>
      {/* Form tambah */}
      <form
        onSubmit={tambah}
        className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 className="text-sm font-bold">➕ Tambah Kategori</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={ikon}
            onChange={(e) => setIkon(e.target.value)}
            placeholder="😀"
            maxLength={10}
            aria-label="Ikon kategori"
            className={`${inputCls} w-16 text-center`}
          />
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama kategori, mis. Langganan"
            maxLength={60}
            className={`${inputCls} min-w-44 flex-1`}
          />
          <select
            value={tipe}
            onChange={(e) => setTipe(e.target.value)}
            className={inputCls}
            aria-label="Tipe kategori"
          >
            <option value="EXPENSE">Pengeluaran</option>
            <option value="INCOME">Pemasukan</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan…" : "Tambah"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>

      {/* Daftar per tipe */}
      {(Object.keys(TIPE_LABEL) as string[]).map((t) => {
        const daftar = awal.filter((k) => k.type === t);
        return (
          <section key={t} className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              {TIPE_LABEL[t].ikon} {TIPE_LABEL[t].judul} ({daftar.length})
            </h2>
            {daftar.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">
                Belum ada kategori {TIPE_LABEL[t].judul.toLowerCase()}.
              </p>
            ) : (
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {daftar.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-900"
                      aria-hidden="true"
                    >
                      {k.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{k.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        {k.dipakai} transaksi
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => bukaUbah(k)}
                      title="Ubah"
                      aria-label={`Ubah kategori ${k.name}`}
                      className="rounded-lg px-2 py-1 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => hapus(k)}
                      title="Hapus"
                      aria-label={`Hapus kategori ${k.name}`}
                      className="rounded-lg px-2 py-1 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {/* Modal ubah */}
      {diedit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDiedit(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">✏️ Ubah Kategori</h2>
            <form onSubmit={simpanUbah} className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ikonEdit}
                  onChange={(e) => setIkonEdit(e.target.value)}
                  maxLength={10}
                  aria-label="Ikon kategori"
                  className={`${inputCls} w-16 text-center`}
                />
                <input
                  type="text"
                  value={namaEdit}
                  onChange={(e) => setNamaEdit(e.target.value)}
                  maxLength={60}
                  required
                  aria-label="Nama kategori"
                  className={`${inputCls} flex-1`}
                />
              </div>
              {errorEdit && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                  {errorEdit}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiedit(null)}
                  className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingEdit}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loadingEdit ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
