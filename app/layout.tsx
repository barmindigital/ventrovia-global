import type { Metadata } from "next";
import "@fontsource-variable/onest";
import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { ContactDock } from "./components/ContactDock";
import { RequestModal } from "./components/RequestModal";
import { AttributionCapture } from "./components/AttributionCapture";
import { serializeJsonLd } from "./lib/json-ld";
import { siteContent } from "./lib/site-content";
import { SITE_BRAND, SITE_URL } from "./lib/site-brand";
import { pageOpenGraph } from "./lib/open-graph";

const publicSiteDescription = siteContent.site.defaultSeoDescription;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteContent.site.defaultSeoTitle,
    // Page titles already carry the Aihamyn Hampa Trading suffix where it adds value.
    // Keeping the root template neutral prevents duplicate "| Aihamyn Hampa Trading" text.
    template: "%s",
  },
  description: publicSiteDescription,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({
    title: siteContent.site.openGraphTitle,
    description: siteContent.site.openGraphDescription,
    url: SITE_URL,
  }),
  twitter: { card: "summary_large_image", images: [SITE_BRAND.logos.social] },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_BRAND.name,
  url: SITE_URL,
  logo: `${SITE_URL}${SITE_BRAND.logos.horizontalTaglineDark}`,
  telephone: SITE_BRAND.phoneDisplay,
  email: SITE_BRAND.email,
  description: publicSiteDescription,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: SITE_BRAND.phoneDisplay,
    email: SITE_BRAND.email,
    areaServed: "Worldwide",
    availableLanguage: "English",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_BRAND.name,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AttributionCapture />
        <a className="skip-link" href="#content">Skip to content</a>
        <SiteHeader />
        <main id="content">{children}</main>
        <SiteFooter />
        <ContactDock />
        <RequestModal />
        <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }} type="application/ld+json" />
        <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }} type="application/ld+json" />
      </body>
    </html>
  );
}
