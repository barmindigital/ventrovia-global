"use client";

import { useEffect, useRef, useState } from "react";
import { RequestForm } from "./RequestForm";
import { REQUEST_MODAL_EVENT } from "./RequestCta";

type RequestModalDetail = {
  defaultProduct?: string;
};

export function RequestModal() {
  const [open, setOpen] = useState(false);
  const [defaultProduct, setDefaultProduct] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<RequestModalDetail>).detail;
      setDefaultProduct(detail?.defaultProduct ?? "");
      setOpen(true);
    };
    window.addEventListener(REQUEST_MODAL_EVENT, handleOpen);
    return () => window.removeEventListener(REQUEST_MODAL_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    if (window.matchMedia("(min-width: 821px)").matches) {
      window.setTimeout(() => {
        dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
      }, 0);
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="request-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        aria-labelledby="request-modal-title"
        aria-modal="true"
        className="request-modal"
        ref={dialogRef}
        role="dialog"
      >
        <div className="request-modal-heading">
          <div>
            <p className="eyebrow">Заявка на поставку</p>
            <h2 id="request-modal-title">Оставить заявку</h2>
            <p>Ответим в рабочее время и уточним детали поставки.</p>
          </div>
          <button
            aria-label="Закрыть форму"
            className="request-modal-close"
            onClick={() => setOpen(false)}
            type="button"
          >
            ×
          </button>
        </div>
        <RequestForm compact defaultProduct={defaultProduct} key={defaultProduct} />
      </div>
    </div>
  );
}
