"use client";

import type { ReactNode } from "react";

export const REQUEST_MODAL_EVENT = "industria-postavok:open-request";

type RequestCtaProps = {
  children?: ReactNode;
  className?: string;
  defaultProduct?: string;
  onTrigger?: () => void;
};

export function RequestCta({
  children = "Оставить заявку",
  className = "button button-primary",
  defaultProduct = "",
  onTrigger,
}: RequestCtaProps) {
  return (
    <button
      className={className}
      onClick={() => {
        onTrigger?.();
        window.dispatchEvent(
          new CustomEvent(REQUEST_MODAL_EVENT, { detail: { defaultProduct } }),
        );
      }}
      type="button"
    >
      {children}
    </button>
  );
}
