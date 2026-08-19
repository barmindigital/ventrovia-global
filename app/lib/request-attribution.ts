export const REQUEST_ATTRIBUTION_KEY =
  "ventrovia-request-attribution";

export const REQUEST_TYPE_LABELS = {
  supply: "Supply enquiry",
  product: "Equipment enquiry",
  specification: "Specification enquiry",
} as const;

export type RequestType = keyof typeof REQUEST_TYPE_LABELS;

export const REQUEST_SOURCE_LABELS = {
  hero_home: "Homepage hero",
  header_desktop: "Desktop header",
  header_mobile: "Mobile navigation",
  home_form: "Homepage RFQ form",
  home_bottom: "Homepage lower form",
  contact_dock: "Contact dock",
  contacts_page: "Contact page",
  footer: "Site footer",
  about_page: "About page",
  catalog_help: "Sourcing request page",
  catalog_empty: "Sourcing request empty state",
  manufacturer_page: "Manufacturer page",
  product_page: "Archived product route",
  catalog_position: "Archived catalog position route",
  unattributed: "Unattributed source",
} as const;

export type RequestSourceId = keyof typeof REQUEST_SOURCE_LABELS;

export type StoredRequestAttribution = {
  landingPage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  yclid: string;
  gclid: string;
};

function attributionFromCurrentPage(): StoredRequestAttribution {
  const params = new URLSearchParams(window.location.search);
  return {
    landingPage: window.location.href,
    referrer: document.referrer,
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmTerm: params.get("utm_term") ?? "",
    utmContent: params.get("utm_content") ?? "",
    yclid: params.get("yclid") ?? "",
    gclid: params.get("gclid") ?? "",
  };
}

export function captureInitialRequestAttribution() {
  const current = attributionFromCurrentPage();
  try {
    const saved = sessionStorage.getItem(REQUEST_ATTRIBUTION_KEY);
    if (saved) return JSON.parse(saved) as StoredRequestAttribution;
    sessionStorage.setItem(REQUEST_ATTRIBUTION_KEY, JSON.stringify(current));
  } catch {
    // The form still works when storage is unavailable.
  }
  return current;
}

export function readRequestAttribution() {
  try {
    const saved = sessionStorage.getItem(REQUEST_ATTRIBUTION_KEY);
    if (saved) return JSON.parse(saved) as StoredRequestAttribution;
  } catch {
    // Fall back to the current page below.
  }
  return captureInitialRequestAttribution();
}
