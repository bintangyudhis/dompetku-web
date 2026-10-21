import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/api-auth";

const TIPE_VALID = ["INCOME", "EXPENSE"] as const;
const MAKS_BARIS = 1000;

interface BarisMasuk {
  tanggal?: string;
  tipe?: string;
  kategori?: string;
  nominal?: number | string;
  catatan?: string;
}

/**
 * POST /api/import/transactions — impor transaksi dari JSON
 * { rows: [{ tanggal: "YYYY-MM-DD", tipe: "INCOME|EXPENSE",
 *             kategori: "nama", nominal: 50000, catatan: "..." }] }.
 * Klien mem-parsing file CSV menjadi JSON ini. Kategori yang belum ada
 * dibuat otomatis. Mengembalikan jumlah baris yang dibuat & dilewati.
 */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  let body: { rows?: BarisMasuk[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows.slice(0, MAKS_BARIS) : [];
  if (rows.length === 0) {
    return NextResponse.json({ error: "Tidak ada baris untuk diimpor." }, { status: 400 });
  }

  const kategoriAda = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, type: true },
  });
  const petaKategori = new Map(
    kategoriAda.map((k) => [`${k.type}|${k.name.toLowerCase()}`, k.id])
  );

  let dibuat = 0;
  let dilewati = 0;

  for (const r of rows) {
    const tipe = (r.tipe ?? "").toUpperCase();
    const nominal = Math.floor(Number(r.nominal));
    const namaKategori = (r.kategori ?? "").trim().slice(0, 80);

    if (!TIPE_VALID.includes(tipe as (typeof TIPE_VALID)[number])) {
      dilewati++;
      continue;
    }
    if (!Number.isFinite(nominal) || nominal < 1 || nominal > 999_999_999_999) {
      dilewati++;
      continue;
    }
    if (!namaKategori) {
      dilewati++;
      continue;
    }

    let tanggal = new Date();
    if (r.tanggal) {
      const d = new Date(r.tanggal);
      if (isNaN(d.getTime())) {
        dilewati++;
        continue;
      }
      tanggal = d;
    }

    let categoryId = petaKategori.get(`${tipe}|${namaKategori.toLowerCase()}`);
    if (!categoryId) {
      const baru = await prisma.category.create({
        data: {
          name: namaKategori,
          icon: tipe === "INCOME" ? "💰" : "📦",
          type: tipe,
          userId,
        },
      });
      categoryId = baru.id;
      petaKategori.set(`${tipe}|${namaKategori.toLowerCase()}`, categoryId);
    }

    await prisma.transaction.create({
      data: {
        amount: nominal,
        note: (r.catatan ?? "").trim().slice(0, 200) || null,
        date: tanggal,
        type: tipe,
        categoryId,
        userId,
      },
    });
    dibuat++;
  }

  return NextResponse.json({
    dibuat,
    dilewati,
    pesan: `${dibuat} transaksi diimpor${dilewati > 0 ? `, ${dilewati} baris dilewati (data tidak valid)` : ""}.`,
  });
}
