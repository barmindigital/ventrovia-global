import type { Metadata } from "next";
import "@fontsource-variable/onest";
import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { serializeJsonLd, SITE_URL } from "./lib/seo-content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Индустрия поставок — промышленное оборудование и комплектующие",
    template: "%s | Индустрия поставок",
  },
  description:
    "Подбор промышленного оборудования и комплектующих по модели, артикулу и производителю. Каталог из 156 917 товарных позиций.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Индустрия поставок",
    title: "Индустрия поставок — промышленное оборудование",
    description:
      "156 917 товарных позиций, 2 806 производителей и подбор по точному артикулу.",
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
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Индустрия поставок",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description:
    "Подбор и поставка промышленного оборудования и комплектующих по модели, артикулу и производителю.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Индустрия поставок",
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
    <html lang="ru">
      <body>
        <a className="skip-link" href="#content">
          Перейти к содержимому
        </a>
        <SiteHeader />
        <main id="content">{children}</main>
        <SiteFooter />
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
