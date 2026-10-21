-- DropTable: fitur token API buatan pengguna dicabut (2026-10-21).
-- Aplikasi mobile sekarang masuk dengan login email+kata sandi yang sama
-- dan menerima token sesi; tidak ada lagi token yang dikelola pengguna.
DROP TABLE IF EXISTS "ApiToken";
