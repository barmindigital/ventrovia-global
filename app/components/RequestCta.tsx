"use client";

import type { ReactNode } from "react";
import type {
  RequestSourceId,
  RequestType,
} from "../lib/request-attribution";

export const REQUEST_MODAL_EVENT = "ventrovia:open-request";

type RequestCtaProps = {
  children?: ReactNode;
  className?: string;
  defaultProduct?: string;
  onTrigger?: () => void;
  requestContext?: string;
  requestType?: RequestType;
  source: RequestSourceId;
};

export function RequestCta({
  children = "Request a Quote",
  className = "button button-primary",
  defaultProduct = "",
  onTrigger,
  requestContext = "",
  requestType = "supply",
  source,
}: RequestCtaProps) {
  return (
    <button
      className={className}
      onClick={() => {
        onTrigger?.();
        window.dispatchEvent(
          new CustomEvent(REQUEST_MODAL_EVENT, {
            detail: {
              defaultProduct,
              requestContext,
              requestType,
              source,
            },
          }),
        );
      }}
      type="button"
    >
      {children}
    </button>
  );
}
