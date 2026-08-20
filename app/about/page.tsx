import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { RequestCta } from "../components/RequestCta";
import { renderHeadingLines, siteContent } from "../lib/site-content";
import { SITE_BRAND } from "../lib/site-brand";

const pageContent = siteContent.pages.about;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/about" },
  openGraph: { title: pageContent.seoTitle, description: pageContent.seoDescription, url: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>About</span></div>
          <p className="eyebrow">{pageContent.eyebrow}</p>
          <h1>{renderHeadingLines(pageContent.heading).map((line, index, lines) => <Fragment key={line}>{line}{index < lines.length - 1 && <br />}</Fragment>)}</h1>
          <p>{pageContent.intro}</p>
        </div>
      </section>
      <section className="section shell">
        <div className="content-grid">
          <article className="value-card"><span>01</span><h2>Requirement first</h2><p>Every engagement starts with a defined manufacturer, model, part number or technical specification.</p></article>
          <article className="value-card"><span>02</span><h2>Commercial clarity</h2><p>Pricing, lead time and supply scope are confirmed for the individual RFQ rather than presented as assumed stock.</p></article>
          <article className="value-card"><span>03</span><h2>International coordination</h2><p>Ventrovia supports industrial sourcing and supply coordination for requirements serving customers worldwide.</p></article>
        </div>
      </section>
      <section className="section section-tint">
        <div className="shell brand-sections">
          <div><p className="eyebrow">Our role</p><h2>A structured route from specification to commercial proposal</h2></div>
          <article className="content-card">
            <p>Ventrovia is based in {SITE_BRAND.baseLocation} and operates with a worldwide market focus. We help procurement teams structure enquiries for industrial equipment, components and hard-to-find requirements.</p>
            <p>Our public manufacturer knowledge base uses official identity and product-area sources. It is designed to support correct brand identification without presenting an unverified product catalogue or implying authorised-dealer status.</p>
            <p>For each RFQ, the exact model, quantity, documentation and commercial requirements are reviewed before pricing and lead-time information are provided.</p>
            <div className="company-actions specification-button"><RequestCta source="about_page">Request an Offer</RequestCta><RequestCta className="button button-outline" requestType="specification" source="about_page">Send Your Specification</RequestCta></div>
          </article>
        </div>
      </section>
    </>
  );
}
