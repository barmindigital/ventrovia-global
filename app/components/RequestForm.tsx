"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { siteContent } from "@/app/lib/site-content";

const REQUEST_DRAFT_KEY = "industria-postavok-request-draft";
const MAX_FILE_SIZE = 15 * 1024 * 1024;
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

export function RequestForm({
  compact = false,
  defaultProduct = "",
}: {
  compact?: boolean;
  defaultProduct?: string;
}) {
  const fallbackEmail = siteContent.contacts.email;
  const formId = useId().replaceAll(":", "");
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<RequestDraft>({
    ...emptyDraft,
    product: defaultProduct,
  });
  const [feedback, setFeedback] = useState("");
  const [fallbackMailto, setFallbackMailto] = useState("");
  const [sending, setSending] = useState(false);

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
    const file = form.get("file");

    if (!draft.phone.trim() && !draft.email.trim()) {
      const message = "Укажите телефон или e-mail.";
      phoneRef.current?.setCustomValidity(message);
      emailRef.current?.setCustomValidity(message);
      phoneRef.current?.reportValidity();
      setFeedback(message);
      return;
    }

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        setFeedback("Файл превышает допустимый размер 15 МБ.");
        return;
      }
      if (!ALLOWED_FILE_PATTERN.test(file.name)) {
        setFeedback("Допустимы PDF, XLS/XLSX, DOC/DOCX и JPG/PNG.");
        return;
      }
    }

    const text = [
      "Заявка с сайта",
      `Имя: ${draft.name}`,
      `Компания: ${draft.company}`,
      `Телефон: ${draft.phone || "—"}`,
      `E-mail: ${draft.email || "—"}`,
      `Позиция: ${draft.product || "—"}`,
      `Комментарий: ${draft.message || "—"}`,
      file instanceof File && file.size > 0 ? `Файл: ${file.name}` : "Файл: —",
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
        setDraft(emptyDraft);
        setFeedback(
          result.message ||
            "Заявка отправлена. Мы свяжемся с вами по указанному контакту.",
        );
        formElement.reset();
        return;
      }

      localStorage.setItem(REQUEST_DRAFT_KEY, JSON.stringify(draft));
      await navigator.clipboard?.writeText(text).catch(() => undefined);
      setFallbackMailto(
        `mailto:${fallbackEmail}?subject=${encodeURIComponent("Заявка с сайта")}&body=${encodeURIComponent(text)}`,
      );
      setFeedback(
        `${result.message || "Почтовый канал временно недоступен"} Поля и выбранный файл сохранены в форме.`,
      );
    } catch {
      localStorage.setItem(REQUEST_DRAFT_KEY, JSON.stringify(draft));
      setFallbackMailto(
        `mailto:${fallbackEmail}?subject=${encodeURIComponent("Заявка с сайта")}&body=${encodeURIComponent(text)}`,
      );
      setFeedback(
        "Не удалось отправить заявку. Поля и выбранный файл сохранены в форме.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      className={`request-form${compact ? " request-form-compact" : ""}`}
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
          <label htmlFor={`${formId}-file`}>Прикрепить файл (необязательно)</label>
          <input
            accept=".pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
            id={`${formId}-file`}
            name="file"
            type="file"
          />
          <small>PDF, XLS/XLSX, DOC/DOCX, JPG/PNG — до 15 МБ.</small>
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
        <span className="form-feedback" aria-live="polite">
          {feedback || `Заявка будет направлена на ${fallbackEmail}.`}
          {fallbackMailto && (
            <>
              {" "}
              <a href={fallbackMailto}>Отправить по почте</a>
            </>
          )}
        </span>
      </div>
    </form>
  );
}
