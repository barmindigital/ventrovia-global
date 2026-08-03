import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  hasTrustedOrigin,
  verifyAdminPassword,
} from "@/app/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

function clientAddress(value: string | null) {
  return value?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  if (!(await hasTrustedOrigin())) {
    return NextResponse.json({ error: "Недопустимый источник запроса" }, { status: 403 });
  }
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Административная панель ещё не настроена" }, { status: 503 });
  }

  const headerStore = await headers();
  const address = clientAddress(headerStore.get("x-forwarded-for"));
  const now = Date.now();
  const current = attempts.get(address);
  const state = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + 15 * 60 * 1000 }
    : current;
  if (state.count >= 5) {
    return NextResponse.json({ error: "Слишком много попыток. Повторите позже" }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!(await verifyAdminPassword(password))) {
    attempts.set(address, { ...state, count: state.count + 1 });
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  attempts.delete(address);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, await createAdminSession(), adminCookieOptions());
  return NextResponse.json({ ok: true });
}
