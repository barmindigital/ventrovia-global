"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  readCookieConsent,
  saveCookieConsent,
} from "@/app/lib/cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(readCookieConsent() === null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <aside aria-label="Cookie notice" className="cookie-banner">
      <p>
        We use essential cookies to operate the website. Optional analytics may be enabled only with your consent. See our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <div className="cookie-banner-actions">
        <button
          className="button button-primary"
          onClick={() => {
            saveCookieConsent("accepted");
            setVisible(false);
          }}
          type="button"
        >
          Accept
        </button>
        <button
          className="button button-outline"
          onClick={() => {
            saveCookieConsent("declined");
            setVisible(false);
          }}
          type="button"
        >
          Decline
        </button>
      </div>
    </aside>
  );
}
