import type { Metadata } from "next";
import "@fontsource-variable/onest";
import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { ContactDock } from "./components/ContactDock";
import { CookieBanner } from "./components/CookieBanner";
import { RequestModal } from "./components/RequestModal";
import { AttributionCapture } from "./components/AttributionCapture";
import { YandexMetrika } from "./components/YandexMetrika";
import { serializeJsonLd, SITE_URL } from "./lib/seo-content";
import { siteContent } from "./lib/site-content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteContent.site.defaultSeoTitle,
    template: `%s | ${siteContent.site.name}`,
  },
  description: siteContent.site.defaultSeoDescription,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: siteContent.site.name,
    title: siteContent.site.openGraphTitle,
    description: siteContent.site.openGraphDescription,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  verification: {
    yandex: "2c78c9b70d149211",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: siteContent.site.name,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  telephone: siteContent.contacts.phoneDisplay,
  email: siteContent.contacts.email,
  description: siteContent.site.defaultSeoDescription,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: siteContent.contacts.phoneDisplay,
    email: siteContent.contacts.email,
    areaServed: "RU",
    availableLanguage: "ru",
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: siteContent.site.name,
  inLanguage: "ru-RU",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/catalog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <AttributionCapture />
        <YandexMetrika />
        <a className="skip-link" href="#content">
          Перейти к содержимому
        </a>
        <SiteHeader />
        <main id="content">{children}</main>
        <SiteFooter />
        <ContactDock />
        <RequestModal />
        <CookieBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(organizationJsonLd),
          }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
