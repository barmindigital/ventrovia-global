"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "industria-postavok-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(localStorage.getItem(COOKIE_CONSENT_KEY) !== "accepted");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <aside aria-label="Уведомление о cookie" className="cookie-banner">
      <p>
        Мы используем cookie-файлы, чтобы сайт работал корректно. Подробнее — в{" "}
        <Link href="/privacy">политике конфиденциальности</Link>.
      </p>
      <button
        className="button button-primary"
        onClick={() => {
          localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
          setVisible(false);
        }}
        type="button"
      >
        Принять
      </button>
    </aside>
  );
}
