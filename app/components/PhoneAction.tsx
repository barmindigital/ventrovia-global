"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { siteContent } from "../lib/site-content";

type PhoneActionProps = {
  children?: ReactNode;
  className?: string;
  label?: string;
};

export function PhoneAction({ children, className, label }: PhoneActionProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const phoneDisplay = siteContent.contacts.phoneDisplay;
  const phoneHref = `tel:${siteContent.contacts.phoneHref}`;

  const showPhone = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    let copySucceeded = false;
    try {
      await navigator.clipboard.writeText(phoneDisplay);
      copySucceeded = true;
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = phoneDisplay;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.append(textArea);
      textArea.select();
      copySucceeded = document.execCommand("copy");
      textArea.remove();
    }
    setCopied(copySucceeded);
    setVisible(true);
  };

  return (
    <>
      <a
        aria-label={label ?? `Show phone number ${phoneDisplay}`}
        className={className}
        href={phoneHref}
        onClick={showPhone}
      >
        {children ?? phoneDisplay}
      </a>
      {visible && (
        <div aria-live="polite" className="phone-popover" role="status">
          <div>
            <small>{copied ? "Number copied" : "Industrial sourcing team"}</small>
            <strong>{phoneDisplay}</strong>
          </div>
          <a href={phoneHref}>Call</a>
          <button aria-label="Close" onClick={() => setVisible(false)} type="button">
            ×
          </button>
        </div>
      )}
    </>
  );
}
