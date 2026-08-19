import { NextResponse } from "next/server";
import { siteContent } from "@/app/lib/site-content";
import { SITE_BRAND, SITE_URL } from "@/app/lib/site-brand";
import {
  REQUEST_SOURCE_LABELS,
  REQUEST_TYPE_LABELS,
  type RequestSourceId,
  type RequestType,
} from "@/app/lib/request-attribution";

const REQUEST_EMAIL =
  process.env.REQUEST_TO_EMAIL || siteContent.contacts.email;
const FROM_EMAIL =
  process.env.REQUEST_FROM_EMAIL ||
  `${SITE_BRAND.displayName} RFQ <requests@${new URL(SITE_URL).hostname}>`;
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
  requestType?: unknown;
  requestSource?: unknown;
  requestContext?: unknown;
  pageTitle?: unknown;
  pageUrl?: unknown;
  landingPage?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmTerm?: unknown;
  utmContent?: unknown;
  yclid?: unknown;
  gclid?: unknown;
  submittedAt?: unknown;
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
      { ok: false, message: "A valid enquiry form is required." },
      { status: 415 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { ok: false, message: "The enquiry exceeds the allowed size." },
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
      { ok: false, message: "The enquiry format is invalid." },
      { status: 400 },
    );
  }

  if (clean(payload.website, 120)) {
    return NextResponse.json({ ok: true });
  }

  const legacyContact = clean(payload.contact, 180);
  const rawRequestType = clean(payload.requestType, 40);
  const rawRequestSource = clean(payload.requestSource, 80);
  const requestTypeId: RequestType = Object.hasOwn(
    REQUEST_TYPE_LABELS,
    rawRequestType,
  )
    ? (rawRequestType as RequestType)
    : "supply";
  const requestSourceId: RequestSourceId = Object.hasOwn(
    REQUEST_SOURCE_LABELS,
    rawRequestSource,
  )
    ? (rawRequestSource as RequestSourceId)
    : "unattributed";
  const requestTypeLabel = REQUEST_TYPE_LABELS[requestTypeId];
  const requestSourceLabel = REQUEST_SOURCE_LABELS[requestSourceId];
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
    requestType: requestTypeId,
    requestSource: requestSourceId,
    requestContext: clean(payload.requestContext, 700),
    pageTitle: clean(payload.pageTitle, 300),
    pageUrl: clean(payload.pageUrl, 1200),
    landingPage: clean(payload.landingPage, 1200),
    referrer: clean(payload.referrer, 1200),
    utmSource: clean(payload.utmSource, 300),
    utmMedium: clean(payload.utmMedium, 300),
    utmCampaign: clean(payload.utmCampaign, 500),
    utmTerm: clean(payload.utmTerm, 500),
    utmContent: clean(payload.utmContent, 500),
    yclid: clean(payload.yclid, 300),
    gclid: clean(payload.gclid, 300),
    submittedAt: clean(payload.submittedAt, 80),
  };

  if (!fields.name || !fields.company || (!fields.phone && !fields.email)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Enter your name, company and at least one contact method.",
      },
      { status: 400 },
    );
  }

  if (fields.email && !EMAIL_PATTERN.test(fields.email)) {
    return NextResponse.json(
      { ok: false, message: "Check the email address." },
      { status: 400 },
    );
  }

  if (!["yes", "true", "1"].includes(fields.consent.toLowerCase())) {
    return NextResponse.json(
      { ok: false, message: "Consent to data processing is required." },
      { status: 400 },
    );
  }

  if (uploadedFiles.length > MAX_FILES) {
    return NextResponse.json(
      { ok: false, message: `You can attach up to ${MAX_FILES} files.` },
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
        { ok: false, message: "The total attachment size exceeds 15 MB." },
        { status: 413 },
      );
    }
    if (uploadedFiles.some((file) => !ALLOWED_FILE_PATTERN.test(file.name))) {
      return NextResponse.json(
        { ok: false, message: "The attachment format is not allowed." },
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
        message: "Email delivery is not yet connected. Please use the email link below.",
      },
      { status: 503 },
    );
  }

  const receivedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Dubai",
  }).format(new Date());
  const rows = [
    ["Enquiry type", requestTypeLabel],
    ["Enquiry source", requestSourceLabel],
    ["Source ID", fields.requestSource],
    ["Page", fields.pageTitle || "—"],
    ["Page URL", fields.pageUrl || "—"],
    ["Requirement context", fields.requestContext || fields.product || "—"],
    ["Landing page", fields.landingPage || "—"],
    ["Referrer", fields.referrer || "—"],
    ["UTM source", fields.utmSource || "—"],
    ["UTM medium", fields.utmMedium || "—"],
    ["UTM campaign", fields.utmCampaign || "—"],
    ["UTM term", fields.utmTerm || "—"],
    ["UTM content", fields.utmContent || "—"],
    ["YCLID", fields.yclid || "—"],
    ["GCLID", fields.gclid || "—"],
    ["Received in Dubai", receivedAt],
    ["Device time", fields.submittedAt || "—"],
    ["Name", fields.name],
    ["Company", fields.company],
    ["Phone", fields.phone || "—"],
    ["E-mail", fields.email || "—"],
    ["Part / model", fields.product || "—"],
    ["Message", fields.message || "—"],
    [
      "Files",
      uploadedFiles.length
        ? uploadedFiles.map((file) => file.name).join(", ")
        : "—",
    ],
    ["Consent", "received"],
  ];
  const safeProduct = fields.product
    .replace(/[\r\n]+/g, " ")
    .slice(0, 90);
  const subject = [
    "Ventrovia website enquiry",
    requestTypeLabel,
    requestSourceLabel,
    fields.requestType === "equipment" ? safeProduct : "",
  ]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 220);
  const text = [
    subject,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
  const html = `
    <h1>${escapeHtml(subject)}</h1>
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
        subject,
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
        message: "The email service is temporarily unavailable.",
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        fallback: true,
        message: "The email service could not accept the enquiry.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "The enquiry was sent successfully.",
  });
}
