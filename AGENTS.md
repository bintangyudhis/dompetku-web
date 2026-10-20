<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Pelajaran Day 2 (Next.js 16 + cacheComponents)
- Halaman yang membaca sesi via `getServerSession` (cookies) WAJIB menambahkan
  `export const instant = false;` agar build lolos — kalau tidak, build gagal
  dengan error "uncached or runtime data during prerendering".
- `export const dynamic = "force-dynamic"` TIDAK kompatibel dengan
  `cacheComponents: true` (build error). `await connection()` saja tidak cukup.
- `src/middleware.ts` harus mengekspor fungsi secara eksplisit
  (`export default withAuth(...)`); pola `export { default } from ...` ditolak.
- Pola auth: `src/lib/auth.ts` (authOptions) + `src/app/api/auth/[...nextauth]/route.ts`
  + `src/app/api/auth/register/route.ts` + `src/middleware.ts` (withAuth, proteksi
  /transaksi, /kategori, /profil).
