"use client";

import { useEffect, useRef, useState } from "react";
import { RequestForm } from "./RequestForm";
import { REQUEST_MODAL_EVENT } from "./RequestCta";
import type {
  RequestSourceId,
  RequestType,
} from "../lib/request-attribution";

type RequestModalDetail = {
  defaultProduct?: string;
  requestContext?: string;
  requestType?: RequestType;
  source?: RequestSourceId;
};

export function RequestModal() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestDetail, setRequestDetail] = useState<RequestModalDetail>({});
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<RequestModalDetail>).detail;
      setRequestDetail(detail ?? {});
      setSubmitted(false);
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

  const closeModal = () => {
    setOpen(false);
    setSubmitted(false);
  };

  return (
    <div
      className="request-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        aria-labelledby="request-modal-title"
        aria-modal="true"
        className={`request-modal${submitted ? " is-success" : ""}`}
        ref={dialogRef}
        role="dialog"
      >
        {submitted ? (
          <span className="sr-only" id="request-modal-title">
            Заявка успешно отправлена
          </span>
        ) : (
          <div className="request-modal-heading">
            <div>
              <p className="eyebrow">Заявка на поставку</p>
              <h2 id="request-modal-title">Оставить заявку</h2>
              <p>Ответим в рабочее время и уточним детали поставки.</p>
            </div>
            <button
              aria-label="Закрыть форму"
              className="request-modal-close"
              onClick={closeModal}
              type="button"
            >
              ×
            </button>
          </div>
        )}
        <RequestForm
          compact
          defaultProduct={requestDetail.defaultProduct}
          key={`${requestDetail.source}-${requestDetail.defaultProduct}`}
          onSuccessChange={setSubmitted}
          onSuccessClose={closeModal}
          requestContext={requestDetail.requestContext}
          requestType={requestDetail.requestType}
          source={requestDetail.source ?? "unattributed"}
        />
      </div>
    </div>
  );
}
