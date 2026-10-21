"use client";

import { useEffect, useState } from "react";

const KUNCI = "dompetku-theme";

/** Terapkan tema tersimpan sebelum render — dipanggil dari skrip inline di layout. */
export function temaTersimpan(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const simpan = window.localStorage.getItem(KUNCI);
  if (simpan === "dark" || simpan === "light") return simpan;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Toggle dark mode — disimpan di localStorage. */
export default function ThemeToggle() {
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setTema(temaTersimpan());
    setSiap(true);
  }, []);

  function toggle() {
    const baru = tema === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", baru === "dark");
    window.localStorage.setItem(KUNCI, baru);
    setTema(baru);
  }

  if (!siap) {
    return <span className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      title={tema === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      aria-label="Ganti tema terang/gelap"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-lg transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      {tema === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
