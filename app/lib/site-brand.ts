export const SITE_BRAND = Object.freeze({
  name: "Ventrovia",
  displayName: "VENTROVIA",
  tagline: "GLOBAL INDUSTRIAL TRADE",
  domain: "aihamyn.ae",
  canonicalBase: "https://aihamyn.ae",
  primaryMarket: "Worldwide",
  primaryLanguage: "English",
  locale: "en",
  baseLocation: "Dubai, UAE",
  email: "sales@ventroviaglobal.com",
  phoneDisplay: "+971 55 725 4463",
  phoneHref: "+971557254463",
  address: {
    line1: "Office 29c02, 29th Floor, I-Rise Tower",
    line2: "Hessa Street, Barsha Heights",
    line3: "Dubai, UAE",
    singleLine:
      "Office 29c02, 29th Floor, I-Rise Tower, Hessa Street, Barsha Heights, Dubai, UAE",
  },
  logos: {
    symbolDark: "/brand/ventrovia-symbol-dark.svg",
    symbolLight: "/brand/ventrovia-symbol-light.svg",
    horizontalDark: "/brand/ventrovia-horizontal-dark.svg",
    horizontalLight: "/brand/ventrovia-horizontal-light.svg",
    horizontalTaglineDark: "/brand/ventrovia-horizontal-tagline-dark.svg",
    horizontalTaglineLight: "/brand/ventrovia-horizontal-tagline-light.svg",
    symbolMonochrome: "/brand/ventrovia-symbol-monochrome.svg",
    horizontalMonochrome: "/brand/ventrovia-horizontal-monochrome.svg",
    horizontalTaglineMonochrome:
      "/brand/ventrovia-horizontal-tagline-monochrome.svg",
    appIcon: "/brand/ventrovia-app-icon.svg",
    social: "/og.png",
  },
});

// Ventrovia has one canonical public identity. A stale deployment variable from
// the former Russian site must never rewrite metadata back to the retired host.
export const SITE_URL = SITE_BRAND.canonicalBase;
