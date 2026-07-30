"use client";

import { FormEvent, useState } from "react";

export function RequestForm({ defaultProduct = "" }: { defaultProduct?: string }) {
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      name: String(form.get("name") || ""),
      company: String(form.get("company") || ""),
      contact: String(form.get("contact") || ""),
      product: String(form.get("product") || ""),
      message: String(form.get("message") || ""),
      website: String(form.get("website") || ""),
    };
    const text = [
      "Запрос на подбор оборудования",
      `Имя: ${payload.name || "—"}`,
      `Компания: ${payload.company || "—"}`,
      `Телефон / e-mail: ${payload.contact || "—"}`,
      `Позиция: ${payload.product || "—"}`,
      `Комментарий: ${payload.message || "—"}`,
    ].join("\n");

    setSending(true);
    setFeedback("Отправляем заявку…");

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        fallback?: boolean;
        message?: string;
      };

      if (response.ok && result.ok) {
        localStorage.removeItem("promsnab-request-draft");
        setFeedback(
          result.message ||
            "Заявка отправлена. Мы свяжемся с вами по указанному контакту.",
        );
        formElement.reset();
        return;
      }

      await navigator.clipboard.writeText(text).catch(() => undefined);
      localStorage.setItem("promsnab-request-draft", text);
      setFeedback(
        `${result.message || "Почтовый канал временно недоступен"} Открываем резервное письмо на sales@industriapostavok.ru.`,
      );
      window.location.href = `mailto:sales@industriapostavok.ru?subject=${encodeURIComponent(
        "Запрос на подбор оборудования",
      )}&body=${encodeURIComponent(text)}`;
    } catch {
      localStorage.setItem("promsnab-request-draft", text);
      setFeedback(
        "Заявка сохранена. Открываем резервное письмо на sales@industriapostavok.ru.",
      );
      window.location.href = `mailto:sales@industriapostavok.ru?subject=${encodeURIComponent(
        "Запрос на подбор оборудования",
      )}&body=${encodeURIComponent(text)}`;
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Ваше имя</label>
          <input id="name" name="name" required />
        </div>
        <div className="field">
          <label htmlFor="company">Компания</label>
          <input id="company" name="company" />
        </div>
        <div className="field field-full">
          <label htmlFor="contact">Телефон или e-mail</label>
          <input id="contact" name="contact" required />
        </div>
        <div className="field field-full">
          <label htmlFor="product">Артикул, модель или оборудование</label>
          <input defaultValue={defaultProduct} id="product" name="product" required />
        </div>
        <div className="field field-full">
          <label htmlFor="message">Комментарий</label>
          <textarea id="message" name="message" placeholder="Количество, срок, технические требования" />
        </div>
        <div className="request-honeypot" aria-hidden="true">
          <label htmlFor="website">Сайт</label>
          <input
            autoComplete="off"
            id="website"
            name="website"
            tabIndex={-1}
          />
        </div>
      </div>
      <div className="form-actions">
        <button
          className="button button-light button-submit"
          disabled={sending}
          type="submit"
        >
          {sending ? "Отправляем…" : "Отправить заявку"}
        </button>
        <span className="form-feedback" aria-live="polite">
          {feedback ||
            "Заявка будет отправлена менеджеру. При сбое откроется резервное письмо."}
        </span>
      </div>
    </form>
  );
}
