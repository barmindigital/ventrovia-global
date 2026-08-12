import { cookies, headers } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_LIFETIME_SECONDS,
  constantTimeEqual,
  createAdminSessionWithSecret,
  verifyAdminSessionWithSecret,
} from "./admin-session";

export { ADMIN_COOKIE_NAME } from "./admin-session";

export async function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12) return false;
  return constantTimeEqual(password, expected);
}

export async function createAdminSession() {
  return createAdminSessionWithSecret(process.env.ADMIN_SESSION_SECRET ?? "");
}

export async function verifyAdminSession(token: string | undefined) {
  return verifyAdminSessionWithSecret(token, process.env.ADMIN_SESSION_SECRET);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export function adminCookieOptions(maxAge = ADMIN_SESSION_LIFETIME_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function hasTrustedOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
