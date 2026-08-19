import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminCookieOptions, hasTrustedOrigin } from "@/app/lib/admin-auth";

export async function POST() {
  if (!(await hasTrustedOrigin())) {
    return NextResponse.json({ error: "Request origin is not allowed" }, { status: 403 });
  }
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", adminCookieOptions(0));
  return NextResponse.json({ ok: true });
}
