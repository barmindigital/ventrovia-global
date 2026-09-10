import type { Metadata } from "next";
import { pageOpenGraph } from "../lib/open-graph";
import Link from "next/link";
import { SITE_BRAND } from "../lib/site-brand";

export const metadata: Metadata = {
  title: "Privacy Policy | Aihamyn Hampa Trading",
  description: "How Aihamyn Hampa Trading processes contact details, RFQ information, attachments and essential website data.",
  alternates: { canonical: "/privacy" },
  openGraph: pageOpenGraph({
    title: "Privacy Policy | Aihamyn Hampa Trading",
    description: "How Aihamyn Hampa Trading processes contact details, RFQ information, attachments and essential website data.",
    url: "/privacy",
  }),
};

export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Privacy Policy</span></div>
          <p className="eyebrow">Personal data</p><h1>Privacy Policy</h1><p>Effective 19 August 2026.</p>
        </div>
      </section>
      <section className="section shell legal-content">
        <h2>1. Scope</h2><p>This policy explains how Aihamyn Hampa Trading processes information submitted through this website and its request-for-quotation forms. By submitting a form, you confirm that you have read this policy.</p>
        <h2>2. Information we receive</h2><p>An enquiry may contain your name, company, phone number, email address, equipment requirement, comments and voluntarily attached files. Essential cookies and local browser storage may be used to operate the interface and preserve a draft enquiry.</p>
        <h2>3. Purpose</h2><p>Information is used to review your requirement, contact you, prepare a commercial proposal, clarify technical details and protect the website from misuse. Aihamyn Hampa Trading does not sell enquiry data and does not use it for automated decision-making.</p>
        <h2>4. Cookies and analytics</h2><p>The public website does not currently run optional analytics or advertising trackers. Essential storage may be used only where it is required to operate a requested feature. If optional analytics are introduced later, this notice and the consent controls will be updated before they are enabled. Sensitive RFQ fields must not be included in analytics events.</p>
        <h2>5. Storage and access</h2><p>Access is limited to personnel and service providers who need the information to handle the enquiry or operate the website. Data are retained only for as long as needed for the stated purpose or applicable obligations.</p>
        <h2>6. Your choices</h2><p>You may ask about the processing of your information or request correction, restriction or deletion by writing to <a href={`mailto:${SITE_BRAND.email}`}>{SITE_BRAND.email}</a>.</p>
        <h2>7. Contact</h2><p>{SITE_BRAND.name}, {SITE_BRAND.address.singleLine}. Email: <a href={`mailto:${SITE_BRAND.email}`}>{SITE_BRAND.email}</a>.</p>
      </section>
    </>
  );
}
