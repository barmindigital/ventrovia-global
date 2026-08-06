import { NextResponse } from "next/server";
import { siteContent } from "@/app/lib/site-content";

const REQUEST_EMAIL =
  process.env.REQUEST_TO_EMAIL || siteContent.contacts.email;
const FROM_EMAIL =
  process.env.REQUEST_FROM_EMAIL ||
  `Заявки сайта <requests@${new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://industriapostavok.ru").hostname}>`;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_FILES = 5;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 128_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_FILE_PATTERN = /\.(pdf|xls|xlsx|doc|docx|jpg|jpeg|png)$/i;

type RequestPayload = {
  name?: unknown;
  company?: unknown;
  contact?: unknown;
  phone?: unknown;
  email?: unknown;
  product?: unknown;
  message?: unknown;
  consent?: unknown;
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

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  const isJson = contentType.startsWith("application/json");
  const isMultipart = contentType.startsWith("multipart/form-data");
  if (!isJson && !isMultipart) {
    return NextResponse.json(
      { ok: false, message: "Ожидается форма заявки." },
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
  let uploadedFiles: File[] = [];
  try {
    if (isMultipart) {
      const form = await request.formData();
      payload = Object.fromEntries(form.entries()) as RequestPayload;
      uploadedFiles = form
        .getAll("file")
        .filter((file): file is File => file instanceof File && file.size > 0);
    } else {
      payload = (await request.json()) as RequestPayload;
    }
  } catch {
    return NextResponse.json(
      { ok: false, message: "Некорректный формат заявки." },
      { status: 400 },
    );
  }

  if (clean(payload.website, 120)) {
    return NextResponse.json({ ok: true });
  }

  const legacyContact = clean(payload.contact, 180);
  const fields = {
    name: clean(payload.name, 120),
    company: clean(payload.company, 160),
    phone: clean(payload.phone, 80) ||
      (legacyContact && !EMAIL_PATTERN.test(legacyContact) ? legacyContact : ""),
    email: clean(payload.email, 180) ||
      (EMAIL_PATTERN.test(legacyContact) ? legacyContact : ""),
    product: clean(payload.product, 500),
    message: clean(payload.message, 3000),
    consent: clean(payload.consent, 12),
  };

  if (!fields.name || !fields.company || (!fields.phone && !fields.email)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Заполните имя, компанию и хотя бы один контакт.",
      },
      { status: 400 },
    );
  }

  if (fields.email && !EMAIL_PATTERN.test(fields.email)) {
    return NextResponse.json(
      { ok: false, message: "Проверьте адрес электронной почты." },
      { status: 400 },
    );
  }

  if (!["yes", "true", "1"].includes(fields.consent.toLowerCase())) {
    return NextResponse.json(
      { ok: false, message: "Необходимо согласие на обработку данных." },
      { status: 400 },
    );
  }

  if (uploadedFiles.length > MAX_FILES) {
    return NextResponse.json(
      { ok: false, message: `Можно прикрепить не более ${MAX_FILES} файлов.` },
      { status: 400 },
    );
  }

  if (uploadedFiles.length) {
    const totalFileSize = uploadedFiles.reduce(
      (total, file) => total + file.size,
      0,
    );
    if (totalFileSize > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, message: "Общий размер файлов превышает 15 МБ." },
        { status: 413 },
      );
    }
    if (uploadedFiles.some((file) => !ALLOWED_FILE_PATTERN.test(file.name))) {
      return NextResponse.json(
        { ok: false, message: "Недопустимый формат файла." },
        { status: 400 },
      );
    }
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
    ["Компания", fields.company],
    ["Телефон", fields.phone || "—"],
    ["E-mail", fields.email || "—"],
    ["Позиция", fields.product || "—"],
    ["Комментарий", fields.message || "—"],
    [
      "Файлы",
      uploadedFiles.length
        ? uploadedFiles.map((file) => file.name).join(", ")
        : "—",
    ],
    ["Согласие", "получено"],
  ];
  const text = [
    `Новая заявка с сайта «${siteContent.site.name}»`,
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

  const attachments = uploadedFiles.length
    ? await Promise.all(
        uploadedFiles.map(async (file) => ({
          filename: file.name.replace(/[\r\n]/g, " ").slice(0, 180),
          content: arrayBufferToBase64(await file.arrayBuffer()),
        })),
      )
    : undefined;

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
        reply_to: fields.email || undefined,
        subject: fields.product
          ? `Заявка: ${fields.product.replace(/[\r\n]+/g, " ").slice(0, 90)}`
          : "Новая заявка с сайта",
        text,
        html,
        attachments,
      }),
      signal: AbortSignal.timeout(15_000),
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
