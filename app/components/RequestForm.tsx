"use client";

import { FormEvent, useState } from "react";

export function RequestForm({ defaultProduct = "" }: { defaultProduct?: string }) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = [
      "Запрос на подбор оборудования",
      `Имя: ${form.get("name") || "—"}`,
      `Компания: ${form.get("company") || "—"}`,
      `Телефон / e-mail: ${form.get("contact") || "—"}`,
      `Позиция: ${form.get("product") || "—"}`,
      `Комментарий: ${form.get("message") || "—"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      localStorage.setItem("promsnab-request-draft", text);
      setFeedback(
        "Заявка сохранена и скопирована. Сейчас откроется письмо на sales@vitrologistics.com.",
      );
    } catch {
      localStorage.setItem("promsnab-request-draft", text);
      setFeedback(
        "Заявка сохранена. Сейчас откроется письмо на sales@vitrologistics.com.",
      );
    }
    window.location.href = `mailto:sales@vitrologistics.com?subject=${encodeURIComponent("Запрос на подбор оборудования")}&body=${encodeURIComponent(text)}`;
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
      </div>
      <div className="form-actions">
        <button className="button button-light" type="submit">
          Сохранить заявку
        </button>
        <span className="form-feedback" aria-live="polite">
          {feedback || "Заявка откроется в вашей почтовой программе и сохранится как локальный черновик."}
        </span>
      </div>
    </form>
  );
}
