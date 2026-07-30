import { NextResponse } from "next/server";

const REQUEST_EMAIL =
  process.env.REQUEST_TO_EMAIL || "sales@industriapostavok.ru";
const FROM_EMAIL =
  process.env.REQUEST_FROM_EMAIL || "Заявки сайта <requests@industriapostavok.ru>";
const MAX_REQUEST_BYTES = 32_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RequestPayload = {
  name?: unknown;
  company?: unknown;
  contact?: unknown;
  product?: unknown;
  message?: unknown;
  website?: unknown;
};

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json(
      { ok: false, message: "Ожидается заявка в формате JSON." },
      { status: 415 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Размер заявки превышает допустимый." },
      { status: 413 },
    );
  }

  let payload: RequestPayload;
  try {
    payload = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Некорректный формат заявки." },
      { status: 400 },
    );
  }

  if (clean(payload.website, 120)) {
    return NextResponse.json({ ok: true });
  }

  const fields = {
    name: clean(payload.name, 120),
    company: clean(payload.company, 160),
    contact: clean(payload.contact, 180),
    product: clean(payload.product, 500),
    message: clean(payload.message, 3000),
  };

  if (!fields.name || !fields.contact || !fields.product) {
    return NextResponse.json(
      { ok: false, message: "Заполните имя, контакт и позицию." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        fallback: true,
        message: "Почтовый канал ещё не подключён.",
      },
      { status: 503 },
    );
  }

  const rows = [
    ["Имя", fields.name],
    ["Компания", fields.company || "—"],
    ["Телефон / e-mail", fields.contact],
    ["Позиция", fields.product],
    ["Комментарий", fields.message || "—"],
  ];
  const text = [
    "Новая заявка с сайта «Индустрия поставок»",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
  const html = `
    <h1>Новая заявка с сайта</h1>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><th align="left" style="border-bottom:1px solid #ddd">${escapeHtml(
              label,
            )}</th><td style="border-bottom:1px solid #ddd">${escapeHtml(
              value,
            )}</td></tr>`,
        )
        .join("")}
    </table>
  `;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [REQUEST_EMAIL],
        reply_to: EMAIL_PATTERN.test(fields.contact)
          ? fields.contact
          : undefined,
        subject: `Заявка: ${fields.product
          .replace(/[\r\n]+/g, " ")
          .slice(0, 90)}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        fallback: true,
        message: "Почтовый сервис временно недоступен.",
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        fallback: true,
        message: "Почтовый сервис временно не принял заявку.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Заявка отправлена на ${REQUEST_EMAIL}.`,
  });
}
