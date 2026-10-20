import { withAuth } from "next-auth/middleware";

/**
 * Proteksi route — pengguna yang belum masuk diarahkan ke /login
 * (halaman signIn kustom dari konfigurasi NextAuth).
 */
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/transaksi/:path*", "/kategori/:path*", "/profil/:path*"],
};
