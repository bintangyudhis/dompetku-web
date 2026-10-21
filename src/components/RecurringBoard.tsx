"use client";

import { useCallback, useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

interface Template {
  id: string;
  label: string;
  amount: number;
  note: string | null;
  dayOfMonth: number;
  active: boolean;
  category: { id: string; name: string; icon: string };
  sudahDiterapkan: boolean;
}

interface Kategori {
  id: string;
  name: string;
  icon: string;
}

/** Board pemasukan rutin — kelola template + terapkan ke bulan ini. */
export default function RecurringBoard({ kategori }: { kategori: Kategori[] }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [menerapkan, setMenerapkan] = useState(false);

  // Form tambah/ubah
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const muat = useCallback(async () => {
    try {
      const res = await fetch("/api/recurring");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal memuat data.");
      setTemplates(json.templates as Template[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  function tampilkanPesan(teks: string) {
    setPesan(teks);
    window.setTimeout(() => setPesan(null), 3000);
  }

  async function terapkan() {
    setMenerapkan(true);
    try {
      const res = await fetch("/api/recurring/terapkan", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      tampilkanPesan(res.ok ? `✅ ${json.pesan}` : `❌ ${json.error ?? "Gagal."}`);
      if (res.ok) muat();
    } catch {
      tampilkanPesan("❌ Terjadi kesalahan jaringan.");
    } finally {
      setMenerapkan(false);
    }
  }

  function bukaTambah() {
    setEditId(null);
    setLabel("");
    setAmount("");
    setNote("");
    setDayOfMonth("1");
    setCategoryId("");
    setActive(true);
    setFormError(null);
    setFormTerbuka(true);
  }

  function bukaUbah(t: Template) {
    setEditId(t.id);
    setLabel(t.label);
    setAmount(String(t.amount));
    setNote(t.note ?? "");
    setDayOfMonth(String(t.dayOfMonth));
    setCategoryId(t.category.id);
    setActive(t.active);
    setFormError(null);
    setFormTerbuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    const nominal = Math.floor(Number(amount));
    const tanggal = Math.floor(Number(dayOfMonth));
    if (!label.trim()) {
      setFormError("Nama pemasukan wajib diisi, mis. “Gaji bulanan”.");
      return;
    }
    if (!Number.isFinite(nominal) || nominal < 1) {
      setFormError("Nominal harus angka lebih dari 0.");
      return;
    }
    if (!Number.isInteger(tanggal) || tanggal < 1 || tanggal > 28) {
      setFormError("Tanggal terbit harus antara 1–28.");
      return;
    }
    if (!categoryId) {
      setFormError("Pilih kategori pemasukan.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(editId ? `/api/recurring/${editId}` : "/api/recurring", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          amount: nominal,
          note: note.trim() || null,
          dayOfMonth: tanggal,
          categoryId,
          ...(editId ? { active } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(json.error ?? "Gagal menyimpan.");
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
    if (!window.confirm(`Hapus pemasukan rutin "${nama}"?`)) return;
    const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
    if (res.ok) muat();
  }

  async function toggleAktif(t: Template) {
    const res = await fetch(`/api/recurring/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !t.active }),
    });
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
        <button
          onClick={terapkan}
          disabled={menerapkan}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {menerapkan ? "Menerapkan…" : "⚡ Terapkan bulan ini"}
        </button>
        <button
          onClick={bukaTambah}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          ➕ Tambah rutin
        </button>
      </div>

      {pesan && (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          {pesan}
        </p>
      )}

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-4xl">🔁</p>
          <p className="mt-3 font-semibold">Belum ada pemasukan rutin</p>
          <p className="mt-1 text-sm text-zinc-500">
            Daftarkan gaji atau pemasukan berulangmu — terbitkan otomatis jadi
            transaksi tiap bulan dengan satu klik.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <li
              key={t.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                t.active
                  ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  : "border-zinc-200 bg-zinc-50 opacity-70 dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{t.category.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{t.label}</p>
                  <p className="text-xs text-zinc-500">
                    Tiap tanggal {t.dayOfMonth} · {t.category.name}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    t.sudahDiterapkan
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {t.sudahDiterapkan ? "✅ Bulan ini" : "⏳ Belum"}
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatRupiah(t.amount)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => toggleAktif(t)}
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {t.active ? "⏸️ Nonaktifkan" : "▶️ Aktifkan"}
                </button>
                <button
                  onClick={() => bukaUbah(t)}
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  ✏️ Ubah
                </button>
                <button
                  onClick={() => hapus(t.id, t.label)}
                  className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                >
                  🗑️ Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formTerbuka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={simpan}
            className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-white p-6 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-bold">
              {editId ? "✏️ Ubah pemasukan rutin" : "➕ Pemasukan rutin baru"}
            </h2>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="mis. Gaji bulanan"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Nominal (Rp)</label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="mis. 5000000"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tanggal terbit</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kategori pemasukan</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
              <label className="mb-1 block text-sm font-medium">Catatan (opsional)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="mis. Gaji PT Maju Mundur"
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
