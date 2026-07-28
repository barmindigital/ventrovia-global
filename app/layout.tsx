import type { Metadata } from "next";
import "@fontsource-variable/onest";
import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

const siteUrl = "https://promsnab-catalog-ru-2026.romabarmin111.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
      </body>
    </html>
  );
}
