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

const REQUEST_DRAFT_KEY = "industria-postavok-request-draft";
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
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} КБ`;
  return `${(size / (1024 * 1024)).toFixed(1).replace(".0", "")} МБ`;
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
      const message = "Укажите телефон или e-mail.";
      phoneRef.current?.setCustomValidity(message);
      emailRef.current?.setCustomValidity(message);
      phoneRef.current?.reportValidity();
      setFeedback(message);
      return;
    }

    if (selectedFiles.length > MAX_FILES) {
      setFeedback(`Можно прикрепить не более ${MAX_FILES} файлов.`);
      return;
    }

    if (selectedFiles.some((file) => !ALLOWED_FILE_PATTERN.test(file.name))) {
      setFeedback("Допустимы PDF, XLS/XLSX, DOC/DOCX и JPG/PNG.");
      return;
    }

    const totalFileSize = selectedFiles.reduce(
      (total, file) => total + file.size,
      0,
    );
    if (totalFileSize > MAX_FILE_SIZE) {
      setFeedback("Общий размер файлов превышает 15 МБ.");
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
      "Заявка с сайта",
      requestTypeLabel,
      requestSourceLabel,
      requestType === "product" && draft.product ? draft.product : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const text = [
      fallbackSubject,
      `Тип заявки: ${requestTypeLabel}`,
      `Источник заявки: ${requestSourceLabel}`,
      `ID источника: ${source}`,
      `Страница: ${pageTitle}`,
      `URL страницы: ${pageUrl}`,
      `Контекст: ${requestContext || "—"}`,
      `Первая страница визита: ${attribution.landingPage || "—"}`,
      `Источник перехода: ${attribution.referrer || "—"}`,
      `UTM source: ${attribution.utmSource || "—"}`,
      `UTM medium: ${attribution.utmMedium || "—"}`,
      `UTM campaign: ${attribution.utmCampaign || "—"}`,
      `UTM term: ${attribution.utmTerm || "—"}`,
      `UTM content: ${attribution.utmContent || "—"}`,
      `YCLID: ${attribution.yclid || "—"}`,
      `GCLID: ${attribution.gclid || "—"}`,
      `Время на устройстве: ${submittedAt}`,
      `Имя: ${draft.name}`,
      `Компания: ${draft.company}`,
      `Телефон: ${draft.phone || "—"}`,
      `E-mail: ${draft.email || "—"}`,
      `Позиция: ${draft.product || "—"}`,
      `Комментарий: ${draft.message || "—"}`,
      selectedFiles.length
        ? `Файлы: ${selectedFiles.map((file) => file.name).join(", ")}`
        : "Файлы: —",
    ].join("\n");

    setSending(true);
    setFallbackMailto("");
    setFeedback("Отправляем заявку…");

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
          request_source: source,
          request_type: requestType,
          request_context: requestContext,
        };
        const analyticsWindow = window as typeof window & {
          dataLayer?: Array<Record<string, unknown>>;
        };
        analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
        analyticsWindow.dataLayer.push(analyticsEvent);
        window.dispatchEvent(
          new CustomEvent("industria-postavok:request-sent", {
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
        `${result.message || "Почтовый канал временно недоступен"} Поля и выбранные файлы сохранены в форме.`,
      );
    } catch {
      localStorage.setItem(REQUEST_DRAFT_KEY, JSON.stringify(draft));
      setFallbackMailto(
        `mailto:${fallbackEmail}?subject=${encodeURIComponent(fallbackSubject)}&body=${encodeURIComponent(text)}`,
      );
      setFeedback(
        "Не удалось отправить заявку. Поля и выбранные файлы сохранены в форме.",
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
          aria-label="Закрыть сообщение"
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
        <p className="eyebrow eyebrow-light">Заявка принята</p>
        <h3>Заявка успешно отправлена</h3>
        <p>
          Спасибо! Менеджер отдела поставок свяжется с вами по указанному
          контакту в рабочее время.
        </p>
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
          <label htmlFor={`${formId}-name`}>Имя *</label>
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
          <label htmlFor={`${formId}-company`}>Компания *</label>
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
          <label htmlFor={`${formId}-phone`}>Телефон</label>
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
            Артикул, модель или оборудование (необязательно)
          </label>
          <input
            id={`${formId}-product`}
            name="product"
            onChange={(event) => updateDraft("product", event.target.value)}
            value={draft.product}
          />
        </div>
        <div className="field field-full">
          <label htmlFor={`${formId}-message`}>Комментарий (необязательно)</label>
          <textarea
            id={`${formId}-message`}
            name="message"
            onChange={(event) => updateDraft("message", event.target.value)}
            placeholder="Количество, срок, технические требования"
            value={draft.message}
          />
        </div>
        <div className="field field-full file-field">
          <span className="field-label">Прикрепить файлы (необязательно)</span>
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
                  setFeedback(`Можно прикрепить не более ${MAX_FILES} файлов.`);
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
              Выбрать файлы
            </label>
            <small>До 5 файлов, общий объём — до 15 МБ.</small>
          </div>
          {selectedFiles.length > 0 && (
            <ul className="selected-files" aria-label="Выбранные файлы">
              {selectedFiles.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <span className="selected-file-name">
                    <strong>{file.name}</strong>
                    <small>{formatFileSize(file.size)}</small>
                  </span>
                  <button
                    aria-label={`Удалить файл ${file.name}`}
                    onClick={() => {
                      setSelectedFiles((current) =>
                        current.filter((item) => item !== file),
                      );
                      setFeedback("");
                    }}
                    type="button"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="request-honeypot" aria-hidden="true">
          <label htmlFor={`${formId}-website`}>Сайт</label>
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
          Нажимая на кнопку, Вы даёте согласие на обработку персональных данных
          и соглашаетесь с{" "}
          <Link href="/privacy">политикой конфиденциальности</Link>.
        </span>
      </label>
      <div className="form-actions">
        <button
          className="button button-primary button-submit"
          disabled={sending}
          type="submit"
        >
          {sending ? "Отправляем…" : "Оставить заявку"}
        </button>
        {(feedback || fallbackMailto) && (
          <span className="form-feedback" aria-live="polite">
            {feedback}
            {fallbackMailto && (
              <>
                {" "}
                <a href={fallbackMailto}>Отправить по почте</a>
              </>
            )}
          </span>
        )}
      </div>
    </form>
  );
}
