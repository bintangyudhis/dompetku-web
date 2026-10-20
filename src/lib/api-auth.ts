import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/** Ambil ID pengguna dari sesi — null bila belum masuk. */
export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Respons 401 standar untuk API yang butuh login. */
export function unauthorized() {
  return NextResponse.json(
    { error: "Silakan masuk dulu untuk mengakses data ini." },
    { status: 401 }
  );
}
