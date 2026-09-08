"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { siteContent } from "@/app/lib/site-content";
import {
  readRequestAttribution,
  REQUEST_SOURCE_LABELS,
  REQUEST_TYPE_LABELS,
  type RequestSourceId,
  type RequestType,
} from "@/app/lib/request-attribution";

const REQUEST_DRAFT_KEY = "ventrovia-request-draft";
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_FILE_PATTERN = /\.(pdf|xls|xlsx|doc|docx|jpg|jpeg|png)$/i;

type RequestDraft = {
  name: string;
  company: string;
  phone: string;
  email: string;
  product: string;
  message: string;
};

const emptyDraft: RequestDraft = {
  name: "",
  company: "",
  phone: "",
  email: "",
  product: "",
  message: "",
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1).replace(".0", "")} MB`;
}

export function RequestForm({
  compact = false,
  defaultProduct = "",
  onSuccessChange,
  onSuccessClose,
  requestContext = "",
  requestType = "supply",
  source,
}: {
  compact?: boolean;
  defaultProduct?: string;
  onSuccessChange?: (submitted: boolean) => void;
  onSuccessClose?: () => void;
  requestContext?: string;
  requestType?: RequestType;
  source: RequestSourceId;
}) {
  const fallbackEmail = siteContent.contacts.email;
  const formId = useId().replaceAll(":", "");
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<RequestDraft>({
    ...emptyDraft,
    product: defaultProduct,
  });
  const [feedback, setFeedback] = useState("");
  const [fallbackMailto, setFallbackMailto] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedDraft = localStorage.getItem(REQUEST_DRAFT_KEY);
        if (!savedDraft) return;
        const parsed = JSON.parse(savedDraft) as Partial<RequestDraft>;
        setDraft((current) => ({
          ...current,
          ...parsed,
          product: defaultProduct || parsed.product || "",
        }));
      } catch {
        localStorage.removeItem(REQUEST_DRAFT_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [defaultProduct]);

  const updateDraft = (field: keyof RequestDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (field === "phone" || field === "email") {
      phoneRef.current?.setCustomValidity("");
      emailRef.current?.setCustomValidity("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    form.delete("file");
    selectedFiles.forEach((file) => form.append("file", file, file.name));

    if (!draft.phone.trim() && !draft.email.trim()) {
      const message = "Enter a phone number or email address.";
      phoneRef.current?.setCustomValidity(message);
      emailRef.current?.setCustomValidity(message);
      phoneRef.current?.reportValidity();
      setFeedback(message);
      return;
    }

    if (selectedFiles.length > MAX_FILES) {
      setFeedback(`You can attach up to ${MAX_FILES} files.`);
      return;
    }

    if (selectedFiles.some((file) => !ALLOWED_FILE_PATTERN.test(file.name))) {
      setFeedback("Accepted formats: PDF, XLS/XLSX, DOC/DOCX and JPG/PNG.");
      return;
    }

    const totalFileSize = selectedFiles.reduce(
      (total, file) => total + file.size,
      0,
    );
    if (totalFileSize > MAX_FILE_SIZE) {
      setFeedback("The total attachment size exceeds 15 MB.");
      return;
    }

    const attribution = readRequestAttribution();
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    const submittedAt = new Date().toISOString();
    const metadata = {
      requestType,
      requestSource: source,
      requestContext,
      pageTitle,
      pageUrl,
      submittedAt,
      ...attribution,
    };
    Object.entries(metadata).forEach(([key, value]) => form.set(key, value));

    const requestTypeLabel = REQUEST_TYPE_LABELS[requestType];
    const requestSourceLabel = REQUEST_SOURCE_LABELS[source];
    const fallbackSubject = [
      "Ventrovia website enquiry",
      requestTypeLabel,
      requestSourceLabel,
      requestType === "equipment" && draft.product ? draft.product : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const text = [
      fallbackSubject,
      `Enquiry type: ${requestTypeLabel}`,
      `Enquiry source: ${requestSourceLabel}`,
      `Source ID: ${source}`,
      `Page: ${pageTitle}`,
      `Page URL: ${pageUrl}`,
      `Context: ${requestContext || "—"}`,
      `Landing page: ${attribution.landingPage || "—"}`,
      `Referrer: ${attribution.referrer || "—"}`,
      `UTM source: ${attribution.utmSource || "—"}`,
      `UTM medium: ${attribution.utmMedium || "—"}`,
      `UTM campaign: ${attribution.utmCampaign || "—"}`,
      `UTM term: ${attribution.utmTerm || "—"}`,
      `UTM content: ${attribution.utmContent || "—"}`,
      `YCLID: ${attribution.yclid || "—"}`,
      `GCLID: ${attribution.gclid || "—"}`,
      `Device time: ${submittedAt}`,
      `Name: ${draft.name}`,
      `Company: ${draft.company}`,
      `Phone: ${draft.phone || "—"}`,
      `E-mail: ${draft.email || "—"}`,
      `Part / model: ${draft.product || "—"}`,
      `Message: ${draft.message || "—"}`,
      selectedFiles.length
        ? `Files: ${selectedFiles.map((file) => file.name).join(", ")}`
        : "Files: —",
    ].join("\n");

    setSending(true);
    setFallbackMailto("");
    setFeedback("Sending your enquiry…");

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as {
        ok?: boolean;
        fallback?: boolean;
        message?: string;
      };

      if (response.ok && result.ok) {
        localStorage.removeItem(REQUEST_DRAFT_KEY);
        setDraft({ ...emptyDraft, product: defaultProduct });
        setSelectedFiles([]);
        setFeedback("");
        setSubmitted(true);
        onSuccessChange?.(true);
        formElement.reset();
        if (fileInputRef.current) fileInputRef.current.value = "";
        const analyticsEvent = {
          event: "request_submit_success",
          request_source: requestSourceLabel,
          request_source_id: source,
          request_type: requestTypeLabel,
          request_type_id: requestType,
          request_context: requestContext || "No context provided",
          page_title: pageTitle,
        };
        const analyticsWindow = window as typeof window & {
          dataLayer?: Array<Record<string, unknown>>;
        };
        analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
        analyticsWindow.dataLayer.push(analyticsEvent);
        window.dispatchEvent(
          new CustomEvent("ventrovia:request-sent", {
            detail: analyticsEvent,
          }),
        );
        return;
      }

      localStorage.setItem(REQUEST_DRAFT_KEY, JSON.stringify(draft));
      await navigator.clipboard?.writeText(text).catch(() => undefined);
      setFallbackMailto(
        `mailto:${fallbackEmail}?subject=${encodeURIComponent(fallbackSubject)}&body=${encodeURIComponent(text)}`,
      );
      setFeedback(
        `${result.message || "The email channel is temporarily unavailable."} Your fields and selected files remain in the form.`,
      );
    } catch {
      localStorage.setItem(REQUEST_DRAFT_KEY, JSON.stringify(draft));
      setFallbackMailto(
        `mailto:${fallbackEmail}?subject=${encodeURIComponent(fallbackSubject)}&body=${encodeURIComponent(text)}`,
      );
      setFeedback(
        "The enquiry could not be sent. Your fields and selected files remain in the form.",
      );
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <section
        aria-live="polite"
        className={`request-success${compact ? " request-success-compact" : ""}`}
        role="status"
      >
        <button
          aria-label="Close message"
          className="request-success-close"
          onClick={() => {
            setSubmitted(false);
            onSuccessChange?.(false);
            onSuccessClose?.();
          }}
          type="button"
        >
          ×
        </button>
        <span className="request-success-mark" aria-hidden="true">
          ✓
        </span>
        <p className="eyebrow eyebrow-light">Enquiry received</p>
        <h3>Your enquiry has been sent</h3>
        <p>Thank you. Our sales team will review the information and respond using the contact details provided.</p>
      </section>
    );
  }

  return (
    <form
      className={`request-form${compact ? " request-form-compact" : ""}`}
      data-request-source={source}
      data-request-type={requestType}
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >
      <div className="form-grid">
        <div className="field">
          <label htmlFor={`${formId}-name`}>Name *</label>
          <input
            autoComplete="name"
            id={`${formId}-name`}
            name="name"
            onChange={(event) => updateDraft("name", event.target.value)}
            required
            value={draft.name}
          />
        </div>
        <div className="field">
          <label htmlFor={`${formId}-company`}>Company *</label>
          <input
            autoComplete="organization"
            id={`${formId}-company`}
            name="company"
            onChange={(event) => updateDraft("company", event.target.value)}
            required
            value={draft.company}
          />
        </div>
        <div className="field">
          <label htmlFor={`${formId}-phone`}>Phone</label>
          <input
            autoComplete="tel"
            id={`${formId}-phone`}
            name="phone"
            onChange={(event) => updateDraft("phone", event.target.value)}
            ref={phoneRef}
            type="tel"
            value={draft.phone}
          />
        </div>
        <div className="field">
          <label htmlFor={`${formId}-email`}>E-mail</label>
          <input
            autoComplete="email"
            id={`${formId}-email`}
            name="email"
            onChange={(event) => updateDraft("email", event.target.value)}
            ref={emailRef}
            type="email"
            value={draft.email}
          />
        </div>
        <div className="field field-full">
          <label htmlFor={`${formId}-product`}>
            Part number, model or equipment (optional)
          </label>
          <input
            id={`${formId}-product`}
            name="product"
            onChange={(event) => updateDraft("product", event.target.value)}
            value={draft.product}
          />
        </div>
        <div className="field field-full">
          <label htmlFor={`${formId}-message`}>Message (optional)</label>
          <textarea
            id={`${formId}-message`}
            name="message"
            onChange={(event) => updateDraft("message", event.target.value)}
            placeholder="Quantity, target date and technical requirements"
            value={draft.message}
          />
        </div>
        <div className="field field-full file-field">
          <span className="field-label">Attach files (optional)</span>
          <input
            accept=".pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
            className="file-input"
            id={`${formId}-file`}
            multiple
            name="file"
            onChange={(event) => {
              const addedFiles = Array.from(event.target.files ?? []);
              if (!addedFiles.length) return;

              setSelectedFiles((current) => {
                const uniqueFiles = [...current];
                for (const file of addedFiles) {
                  const duplicate = uniqueFiles.some(
                    (item) =>
                      item.name === file.name &&
                      item.size === file.size &&
                      item.lastModified === file.lastModified,
                  );
                  if (!duplicate) uniqueFiles.push(file);
                }

                if (uniqueFiles.length > MAX_FILES) {
                  setFeedback(`You can attach up to ${MAX_FILES} files.`);
                } else {
                  setFeedback("");
                }
                return uniqueFiles.slice(0, MAX_FILES);
              });
              event.target.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
          <div className="file-picker-row">
            <label className="file-picker-button" htmlFor={`${formId}-file`}>
              Choose files
            </label>
            <small>Up to 5 files, 15 MB total.</small>
          </div>
          {selectedFiles.length > 0 && (
            <ul className="selected-files" aria-label="Selected files">
              {selectedFiles.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <span className="selected-file-name">
                    <strong>{file.name}</strong>
                    <small>{formatFileSize(file.size)}</small>
                  </span>
                  <button
                    aria-label={`Remove file ${file.name}`}
                    onClick={() => {
                      setSelectedFiles((current) =>
                        current.filter((item) => item !== file),
                      );
                      setFeedback("");
                    }}
                    type="button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="request-honeypot" aria-hidden="true">
          <label htmlFor={`${formId}-website`}>Website</label>
          <input
            autoComplete="off"
            id={`${formId}-website`}
            name="website"
            tabIndex={-1}
          />
        </div>
      </div>
      <label className="consent-field">
        <input name="consent" required type="checkbox" value="yes" />
        <span>
          By submitting this form, you consent to the processing of your personal data and agree to the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </span>
      </label>
      <div className="form-actions">
        <button
          className="button button-primary button-submit"
          disabled={sending}
          type="submit"
        >
          {sending ? "Sending…" : "Send enquiry"}
        </button>
        {(feedback || fallbackMailto) && (
          <span className="form-feedback" aria-live="polite">
            {feedback}
            {fallbackMailto && (
              <>
                {" "}
                <a href={fallbackMailto}>Send by email</a>
              </>
            )}
          </span>
        )}
      </div>
    </form>
  );
}
