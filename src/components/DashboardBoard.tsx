"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah, formatTanggal } from "@/lib/format";

interface Ringkasan {
  saldo: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  sisaBulanIni: number;
}

interface ArusHarian {
  tanggal: string;
  label: string;
  pemasukan: number;
  pengeluaran: number;
}

interface KategoriTotal {
  id: string;
  nama: string;
  icon: string;
  total: number;
}

interface Transaksi {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  date: string;
  category: { id: string; name: string; icon: string };
}

interface DataDashboard {
  ringkasan: Ringkasan;
  arusKas: ArusHarian[];
  perKategori: KategoriTotal[];
  terbaru: Transaksi[];
}

const WARNA_PIE = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function formatSingkat(nilai: number): string {
  if (Math.abs(nilai) >= 1_000_000_000) return `${(nilai / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(nilai) >= 1_000_000) return `${(nilai / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(nilai) >= 1_000) return `${(nilai / 1_000).toFixed(0)}rb`;
  return String(nilai);
}

function Kartu({
  judul,
  nilai,
  warna,
}: {
  judul: string;
  nilai: number;
  warna: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{judul}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${warna}`}>
        {formatRupiah(nilai)}
      </p>
    </div>
  );
}

function TooltipKeuangan({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-zinc-600 dark:text-zinc-300">
          {p.name}: <span className="font-semibold">{formatRupiah(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

/** Board dashboard: kartu ringkasan + grafik + transaksi terbaru. */
export default function DashboardBoard() {
  const [data, setData] = useState<DataDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Gagal memuat dashboard.");
        setData(json as DataDashboard);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        ❌ {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["", "", "", ""].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900"
          />
        ))}
      </div>
    );
  }

  const { ringkasan } = data;
  const totalKategori = data.perKategori.reduce((s, k) => s + k.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kartu judul="💰 Saldo total" nilai={ringkasan.saldo} warna="text-zinc-900 dark:text-zinc-50" />
        <Kartu judul="📈 Pemasukan bulan ini" nilai={ringkasan.pemasukanBulanIni} warna="text-emerald-600 dark:text-emerald-400" />
        <Kartu judul="📉 Pengeluaran bulan ini" nilai={ringkasan.pengeluaranBulanIni} warna="text-red-600 dark:text-red-400" />
        <Kartu judul="🧮 Sisa bulan ini" nilai={ringkasan.sisaBulanIni} warna={ringkasan.sisaBulanIni < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-bold">📊 Arus kas 30 hari terakhir</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.arusKas} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#71717a" strokeOpacity={0.25} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                interval={4}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={formatSingkat}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip content={<TooltipKeuangan />} cursor={{ fill: "#71717a", fillOpacity: 0.1 }} />
              <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-bold">🍰 Analisa pengeluaran per kategori</h2>
          {data.perKategori.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Belum ada pengeluaran bulan ini.
            </p>
          ) : (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.perKategori}
                      dataKey="total"
                      nameKey="nama"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {data.perKategori.map((k, i) => (
                        <Cell key={k.id} fill={WARNA_PIE[i % WARNA_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<TooltipKeuangan />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-2">
                {data.perKategori.map((k, i) => {
                  const persen = totalKategori > 0 ? Math.round((k.total / totalKategori) * 100) : 0;
                  return (
                    <li key={k.id} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: WARNA_PIE[i % WARNA_PIE.length] }}
                      />
                      <span className="font-medium">
                        {k.icon} {k.nama}
                      </span>
                      <span className="ml-auto text-zinc-500 dark:text-zinc-400">
                        {persen}% · {formatRupiah(k.total)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-bold">🕘 Transaksi terbaru</h2>
          {data.terbaru.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Belum ada transaksi. Catat yang pertama di halaman Transaksi!
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.terbaru.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-2xl">{t.category.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {t.note ?? t.category.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatTanggal(t.date)} · {t.category.name}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      t.type === "INCOME"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "-"}
                    {formatRupiah(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
