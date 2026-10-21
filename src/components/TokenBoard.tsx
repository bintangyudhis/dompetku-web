"use client";

import { useCallback, useEffect, useState } from "react";
import { formatTanggalJam } from "@/lib/format";

interface Token {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

const CONTOH_CURL = `curl -H "Authorization: Bearer TOKEN_KAMU" \\
  https://dompetku-web-lake.vercel.app/api/public/summary`;

/** Board kelola token API + dokumentasi endpoint publik. */
export default function TokenBoard() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [membuat, setMembuat] = useState(false);
  const [tokenBaru, setTokenBaru] = useState<string | null>(null);
  const [disalin, setDisalin] = useState(false);

  const muat = useCallback(async () => {
    try {
      const res = await fetch("/api/tokens");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal memuat token.");
      setTokens(json.tokens as Token[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat token.");
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  async function buat(e: React.FormEvent) {
    e.preventDefault();
    setMembuat(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nama.trim() || "Token API" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal membuat token.");
        return;
      }
      setTokenBaru(json.token as string);
      setDisalin(false);
      setNama("");
      muat();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setMembuat(false);
    }
  }

  async function cabut(id: string, name: string) {
    if (!window.confirm(`Cabut token "${name}"? Aplikasi yang memakainya akan berhenti bisa akses.`)) return;
    const res = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
    if (res.ok) muat();
  }

  async function salin() {
    if (!tokenBaru) return;
    try {
      await navigator.clipboard.writeText(tokenBaru);
      setDisalin(true);
      window.setTimeout(() => setDisalin(false), 2000);
    } catch {
      // clipboard API tidak tersedia — pengguna bisa blok manual
    }
  }

  return (
    <div className="space-y-6">
      {tokenBaru && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950">
          <p className="font-bold text-amber-800 dark:text-amber-200">
            🔑 Token barumu — simpan sekarang!
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Nilai ini tidak akan ditampilkan lagi setelah kamu menutupnya.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-xl bg-white px-3 py-2 font-mono text-sm dark:bg-black">
              {tokenBaru}
            </code>
            <button
              onClick={salin}
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              {disalin ? "✅ Disalin!" : "📋 Salin"}
            </button>
            <button
              onClick={() => setTokenBaru(null)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-bold">➕ Buat token baru</h2>
        <form onSubmit={buat} className="mt-3 flex flex-wrap gap-2">
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama token, mis. dompetku-app"
            maxLength={60}
            className="min-w-52 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            disabled={membuat}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {membuat ? "Membuat…" : "Buat token"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">❌ {error}</p>}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-bold">🔑 Token aktif ({tokens.length}/10)</h2>
        {tokens.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Belum ada token. Buat satu untuk menghubungkan aplikasi lain
            (mis. aplikasi Flutter minggu depan).
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {tokens.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {t.name}{" "}
                    <code className="font-mono text-xs text-zinc-500">{t.prefix}…</code>
                  </p>
                  <p className="text-xs text-zinc-500">
                    Dibuat {formatTanggalJam(t.createdAt)}
                    {t.lastUsedAt ? ` · terakhir dipakai ${formatTanggalJam(t.lastUsedAt)}` : " · belum pernah dipakai"}
                  </p>
                </div>
                <button
                  onClick={() => cabut(t.id, t.name)}
                  className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                >
                  🗑️ Cabut
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-bold">📖 Cara pakai REST API</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Sertakan token di header{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
            Authorization: Bearer TOKEN_KAMU
          </code>{" "}
          pada setiap request.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-100">
          {CONTOH_CURL}
        </pre>
        <ul className="mt-4 space-y-2 text-sm">
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">GET /api/public/summary</code> — saldo & ringkasan bulan ini</li>
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">GET /api/public/transactions?limit=50&type=EXPENSE</code> — daftar transaksi</li>
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">POST /api/public/transactions</code> — catat transaksi (body: amount, type, categoryId, note?, date?)</li>
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">GET /api/public/categories?type=INCOME</code> — daftar kategori</li>
        </ul>
      </div>
    </div>
  );
}
