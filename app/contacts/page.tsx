import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { RequestForm } from "../components/RequestForm";
import { PhoneAction } from "../components/PhoneAction";
import { renderHeadingLines, siteContent } from "../lib/site-content";
import { SITE_BRAND } from "../lib/site-brand";

const pageContent = siteContent.pages.contacts;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/contacts" },
  openGraph: { title: pageContent.seoTitle, description: pageContent.seoDescription, url: "/contacts" },
};

type ContactsPageProps = { searchParams: Promise<{ requirement?: string }> };

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { requirement = "" } = await searchParams;
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Contact</span></div>
          <p className="eyebrow">{pageContent.eyebrow}</p>
          <h1>{renderHeadingLines(pageContent.heading).map((line, index, lines) => <Fragment key={line}>{line}{index < lines.length - 1 && <br />}</Fragment>)}</h1>
          <p>{pageContent.intro}</p>
        </div>
      </section>
      <section className="section shell contact-layout">
        <aside className="contact-aside">
          <p className="eyebrow">Sales enquiries</p>
          <h2>Contact our sourcing team</h2>
          <div className="contact-lines"><PhoneAction>{SITE_BRAND.phoneDisplay}</PhoneAction><a href={`mailto:${SITE_BRAND.email}`}>{SITE_BRAND.email}</a></div>
          <div className="contact-hours" aria-label="Office address"><strong>{SITE_BRAND.baseLocation}</strong><span>{SITE_BRAND.address.line1}</span><span>{SITE_BRAND.address.line2}</span><span>{SITE_BRAND.address.line3}</span></div>
          <p>Include the manufacturer, complete model, part number, quantity and target delivery requirement. A specification can be attached when the request contains several lines.</p>
        </aside>
        <RequestForm defaultProduct={requirement} requestContext={requirement ? `Requirement: ${requirement}` : ""} requestType={requirement ? "equipment" : "supply"} source="contacts_page" />
      </section>
    </>
  );
}
