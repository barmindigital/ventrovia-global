export const SITE_BRAND = Object.freeze({
  name: "Aihamyn Hampa Trading – FZCO",
  shortName: "Aihamyn Hampa Trading",
  displayName: "AIHAMYN HAMPA TRADING – FZCO",
  tagline: "GLOBAL PROCUREMENT & INDUSTRIAL SUPPLY",
  domain: "aihamyn.ae",
  canonicalBase: "https://aihamyn.ae",
  primaryMarket: "Worldwide",
  primaryLanguage: "English",
  locale: "en",
  baseLocation: "Dubai, United Arab Emirates",
  email: "info@aihamyn.ae",
  phoneDisplay: "+971 50 981 2776",
  phoneHref: "+971509812776",
  address: {
    line1: "",
    line2: "",
    line3: "",
    singleLine: "Dubai, UAE",
  },
  logos: {
    symbolDark: "/brand/aihamyn-symbol-dark.svg",
    symbolLight: "/brand/aihamyn-symbol-light.svg",
    horizontalDark: "/brand/aihamyn-horizontal-dark.svg",
    horizontalLight: "/brand/aihamyn-horizontal-light.svg",
    horizontalTaglineDark: "/brand/aihamyn-horizontal-tagline-dark.svg",
    horizontalTaglineLight: "/brand/aihamyn-horizontal-tagline-light.svg",
    symbolMonochrome: "/brand/aihamyn-symbol-monochrome.svg",
    horizontalMonochrome: "/brand/aihamyn-horizontal-monochrome.svg",
    horizontalTaglineMonochrome:
      "/brand/aihamyn-horizontal-tagline-monochrome.svg",
    appIcon: "/brand/aihamyn-app-icon.svg",
    social: "/og.jpg",
  },
});

// The site has one canonical public identity. A stale deployment variable from
// the former Russian site must never rewrite metadata back to the retired host.
export const SITE_URL = SITE_BRAND.canonicalBase;
