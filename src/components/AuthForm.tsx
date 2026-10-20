"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "register";
}

/**
 * Form login & register — dipakai di /login dan /register.
 * Register: buat akun via API lalu masuk otomatis.
 */
export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Pendaftaran gagal. Coba lagi.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          isRegister
            ? "Akun berhasil dibuat, tetapi masuk otomatis gagal. Silakan masuk manual."
            : "Email atau kata sandi salah."
        );
        setLoading(false);
        return;
      }

      router.push("/transaksi");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:ring-emerald-900";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-center">
        <div className="text-4xl" aria-hidden="true">
          {isRegister ? "📝" : "🔐"}
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {isRegister ? "Buat Akun DompetKu" : "Masuk ke DompetKu"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isRegister
            ? "Daftar gratis — kategori & shortcut siap pakai langsung dibuatkan."
            : "Selamat datang kembali! Catat keuanganmu hari ini."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {isRegister && (
          <div>
            <label
              htmlFor="nama"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nama
            </label>
            <input
              id="nama"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              className={inputCls}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            required
            maxLength={120}
            autoComplete="email"
            className={inputCls}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Kata sandi
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRegister ? "Minimal 6 karakter" : "Kata sandimu"}
            required
            minLength={6}
            maxLength={72}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className={inputCls}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Memproses…" : isRegister ? "Daftar" : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {isRegister ? (
          <>
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Masuk di sini
            </Link>
          </>
        ) : (
          <>
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Daftar gratis
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
