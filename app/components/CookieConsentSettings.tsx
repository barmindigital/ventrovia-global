"use client";

import { resetCookieConsent } from "@/app/lib/cookie-consent";

export function CookieConsentSettings() {
  return (
    <button
      className="button button-outline legal-cookie-settings"
      onClick={resetCookieConsent}
      type="button"
    >
      Change cookie preferences
    </button>
  );
}
