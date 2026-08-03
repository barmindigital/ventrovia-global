import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { RequestForm } from "../components/RequestForm";
import { renderHeadingLines, siteContent } from "../lib/site-content";

const pageContent = siteContent.pages.contacts;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/contacts" },
  openGraph: {
    title: pageContent.seoTitle,
    description: pageContent.seoDescription,
    url: "/contacts",
  },
};

type ContactsPageProps = {
  searchParams: Promise<{ product?: string }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { product = "" } = await searchParams;
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link><span>/</span><span>Запрос</span>
          </div>
          <p className="eyebrow">{pageContent.eyebrow}</p>
          <h1>
            {renderHeadingLines(pageContent.heading).map((line, index, lines) => (
              <Fragment key={line}>
                {line}
                {index < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </h1>
          <p>{pageContent.intro}</p>
        </div>
      </section>
      <section className="section shell contact-layout">
        <aside className="contact-aside">
          <p className="eyebrow">Контакты</p>
          <h2>Свяжитесь с нами</h2>
          <div className="contact-lines">
            <a href={`tel:${siteContent.contacts.phoneHref}`}>
              {siteContent.contacts.phoneDisplay}
            </a>
            <a href={`mailto:${siteContent.contacts.email}`}>
              {siteContent.contacts.email}
            </a>
          </div>
          <div className="contact-hours" aria-label="График работы">
            <strong>График работы</strong>
            <span>{siteContent.contacts.weekdays}</span>
            <span>{siteContent.contacts.weekend}</span>
          </div>
          <p>
            Для подбора достаточно модели, артикула, фотографии шильдика или
            описания задачи. Укажите количество, желаемый срок и возможность
            предложить аналог.
          </p>
        </aside>
        <RequestForm defaultProduct={product} />
      </section>
    </>
  );
}
