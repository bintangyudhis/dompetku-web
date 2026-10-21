import Link from "next/link";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  userName: string;
}

const TAUTAN = [
  { href: "/dashboard", label: "📊 Dashboard" },
  { href: "/transaksi", label: "💸 Transaksi" },
  { href: "/kategori", label: "🏷️ Kategori" },
  { href: "/budget", label: "📉 Budget" },
  { href: "/rutin", label: "🔁 Rutin" },
  { href: "/token-api", label: "🔑 Token API" },
  { href: "/profil", label: "👤 Profil" },
];

/** Navigasi utama area aplikasi (sudah login). */
export default function Navbar({ userName }: NavbarProps) {
  const inisial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          💰 DompetKu
        </Link>

        <div className="order-3 -mx-1 flex w-full flex-nowrap items-center gap-1 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:order-2 sm:w-auto sm:flex-1 sm:overflow-visible sm:pb-0">
          {TAUTAN.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="order-2 ml-auto flex items-center gap-3 sm:order-3 sm:ml-0">
          <ThemeToggle />
          <span
            title={userName}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
          >
            {inisial}
          </span>
          <span className="hidden max-w-32 truncate text-sm font-medium text-zinc-700 sm:inline dark:text-zinc-300">
            {userName}
          </span>
          <LogoutButton />
        </div>
      </nav>
    </header>
  );
}
