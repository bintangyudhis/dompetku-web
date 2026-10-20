import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Masuk — DompetKu",
  description: "Masuk ke akun DompetKu untuk mencatat keuanganmu.",
};

// Halaman ini membaca sesi (cookies) → boleh blocking, render per-request.
export const instant = false;

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/transaksi");

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-12 font-sans dark:bg-black">
      <AuthForm mode="login" />
    </main>
  );
}
