"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Parser CSV sederhana — mendukung field ber-quote ("..."). */
function parseCsv(teks: string): string[][] {
  const baris: string[][] = [];
  let row: string[] = [];
  let field = "";
  let dalamKutip = false;

  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (dalamKutip) {
      if (c === '"') {
        if (teks[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          dalamKutip = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      dalamKutip = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && teks[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") baris.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.length > 1 || row[0] !== "") baris.push(row);
  return baris;
}

interface FilterAktif {
  type: string;
  categoryId: string;
  from: string;
  to: string;
  q: string;
}

/** Tombol export & import CSV transaksi. */
export default function DataTransfer({ filter }: { filter: FilterAktif }) {
  const router = useRouter();
  const inputFile = useRef<HTMLInputElement>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [mengimpor, setMengimpor] = useState(false);

  function urlExport(): string {
    const p = new URLSearchParams();
    if (filter.type) p.set("type", filter.type);
    if (filter.categoryId) p.set("categoryId", filter.categoryId);
    if (filter.from) p.set("from", filter.from);
    if (filter.to) p.set("to", filter.to);
    const qs = p.toString();
    return `/api/export/transactions${qs ? `?${qs}` : ""}`;
  }

  function tampilkanPesan(teks: string) {
    setPesan(teks);
    window.setTimeout(() => setPesan(null), 4000);
  }

  async function imporFile(file: File) {
    setMengimpor(true);
    try {
      // Hapus BOM bila ada
      const teks = (await file.text()).replace(/^\uFEFF/, "");
      const semua = parseCsv(teks);
      if (semua.length === 0) {
        tampilkanPesan("❌ File CSV kosong.");
        return;
      }
      // Lewati header bila baris pertama diawali "tanggal"
      const data =
        semua[0][0]?.trim().toLowerCase() === "tanggal" ? semua.slice(1) : semua;
      const rows = data.map((kolom) => ({
        tanggal: (kolom[0] ?? "").trim(),
        tipe: (kolom[1] ?? "").trim().toUpperCase(),
        kategori: (kolom[2] ?? "").trim(),
        nominal: Number((kolom[3] ?? "").trim()),
        catatan: (kolom[4] ?? "").trim(),
      }));

      const res = await fetch("/api/import/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const json = await res.json().catch(() => ({}));
      tampilkanPesan(res.ok ? `✅ ${json.pesan}` : `❌ ${json.error ?? "Gagal mengimpor."}`);
      if (res.ok) router.refresh();
    } catch {
      tampilkanPesan("❌ Gagal membaca file.");
    } finally {
      setMengimpor(false);
      if (inputFile.current) inputFile.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={urlExport()}
        className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        ⬇️ Export CSV
      </a>
      <button
        onClick={() => inputFile.current?.click()}
        disabled={mengimpor}
        className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        {mengimpor ? "Mengimpor…" : "⬆️ Import CSV"}
      </button>
      <input
        ref={inputFile}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) imporFile(f);
        }}
      />
      {pesan && <span className="text-xs text-zinc-600 dark:text-zinc-300">{pesan}</span>}
    </div>
  );
}
