export const REQUEST_ATTRIBUTION_KEY =
  "industria-postavok-request-attribution";

export const REQUEST_TYPE_LABELS = {
  supply: "Запрос поставки",
  product: "Запрос по товару",
} as const;

export type RequestType = keyof typeof REQUEST_TYPE_LABELS;

export const REQUEST_SOURCE_LABELS = {
  hero_home: "Первый экран",
  header_desktop: "Шапка сайта",
  header_mobile: "Мобильное меню",
  home_bottom: "Главная — нижняя форма",
  contact_dock: "Панель быстрой связи",
  contacts_page: "Страница контактов",
  footer: "Подвал сайта",
  about_page: "Страница «О компании»",
  catalog_help: "Каталог — помощь с подбором",
  catalog_empty: "Каталог — ничего не найдено",
  manufacturer_page: "Страница производителя",
  product_page: "Карточка товара",
  catalog_position: "Карточка позиции каталога",
  unattributed: "Источник не определён",
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
