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
    <aside aria-label="Уведомление о cookie" className="cookie-banner">
      <p>
        Мы используем обязательные cookie для работы сайта и, только с вашего
        согласия, Яндекс Метрику для аналитики и Вебвизора. Подробнее — в{" "}
        <Link href="/privacy">политике конфиденциальности</Link>.
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
          Принять
        </button>
        <button
          className="button button-outline"
          onClick={() => {
            saveCookieConsent("declined");
            setVisible(false);
          }}
          type="button"
        >
          Отклонить
        </button>
      </div>
    </aside>
  );
}
