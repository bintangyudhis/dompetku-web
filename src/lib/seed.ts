// Data bawaan untuk pengguna baru — kategori & shortcut cepat.
// Dipakai oleh API register agar akun baru langsung siap dipakai.

export interface SeedCategory {
  name: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
}

export interface SeedShortcut {
  label: string;
  amount: number; // rupiah
  icon: string;
  categoryName: string; // merujuk ke nama di DEFAULT_CATEGORIES
}

export const DEFAULT_CATEGORIES: SeedCategory[] = [
  { name: "Gaji", icon: "💼", type: "INCOME" },
  { name: "Bonus", icon: "🎁", type: "INCOME" },
  { name: "Makanan", icon: "🍔", type: "EXPENSE" },
  { name: "Transportasi", icon: "🛵", type: "EXPENSE" },
  { name: "Parkir", icon: "🅿️", type: "EXPENSE" },
  { name: "Kopi & Jajan", icon: "☕", type: "EXPENSE" },
  { name: "Belanja", icon: "🛒", type: "EXPENSE" },
  { name: "Tagihan", icon: "🧾", type: "EXPENSE" },
  { name: "Kesehatan", icon: "💊", type: "EXPENSE" },
  { name: "Lainnya", icon: "📦", type: "EXPENSE" },
];

export const DEFAULT_SHORTCUTS: SeedShortcut[] = [
  { label: "Parkir 2k", amount: 2000, icon: "🅿️", categoryName: "Parkir" },
  { label: "Kopi 15k", amount: 15000, icon: "☕", categoryName: "Kopi & Jajan" },
  {
    label: "Makan siang 25k",
    amount: 25000,
    icon: "🍱",
    categoryName: "Makanan",
  },
  { label: "Bensin 50k", amount: 50000, icon: "⛽", categoryName: "Transportasi" },
];
