export const COOKIE_CONSENT_KEY =
  "industria-postavok-analytics-consent-v1";
export const COOKIE_CONSENT_EVENT = "industria-postavok:cookie-consent";
const LEGACY_COOKIE_CONSENT_KEY = "industria-postavok-cookie-consent";

export type CookieConsent = "accepted" | "declined";

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored === "accepted" || stored === "declined" ? stored : null;
  } catch {
    return null;
  }
}

export function saveCookieConsent(value: CookieConsent) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
  } catch {
    // Consent still applies to the current page when storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent<CookieConsent>(COOKIE_CONSENT_EVENT, { detail: value }),
  );
}

export function resetCookieConsent() {
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
  } catch {
    // Reloading still prevents analytics from starting automatically.
  }
  window.location.reload();
}
