import type { Metadata } from "next";
import Link from "next/link";
import { RequestCta } from "../components/RequestCta";
import { serializeJsonLd } from "../lib/json-ld";
import { renderHeadingLines, siteContent } from "../lib/site-content";
import { SITE_BRAND, SITE_URL } from "../lib/site-brand";

const pageContent = siteContent.pages.services;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/services" },
  openGraph: {
    title: pageContent.seoTitle,
    description: pageContent.seoDescription,
    url: "/services",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/services#service`,
  name: "Industrial equipment sourcing services",
  description: pageContent.seoDescription,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: "Worldwide",
  serviceType: "Industrial equipment sourcing and procurement support",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Services",
      item: `${SITE_URL}/services`,
    },
  ],
};

const services = [
  {
    number: "01",
    title: "Industrial equipment sourcing",
    text: "Submit a defined industrial requirement using the manufacturer, model, part reference or technical description available to your team.",
  },
  {
    number: "02",
    title: "Manufacturer sourcing",
    text: "Use the Aihamyn Hampa Trading manufacturer knowledge base to identify a brand and send an enquiry against its confirmed product areas.",
  },
  {
    number: "03",
    title: "Part number & model requests",
    text: "Send the complete part number or model as written on your documentation. The reference is reviewed before commercial information is prepared.",
  },
  {
    number: "04",
    title: "Specification & BOM requests",
    text: "Attach a specification or bill of materials when the requirement includes several lines, alternatives or detailed technical context.",
  },
  {
    number: "05",
    title: "Procurement support",
    text: "Aihamyn Hampa Trading helps procurement teams clarify the requested scope, quantity, documentation and delivery requirement for an actionable RFQ.",
  },
  {
    number: "06",
    title: "International supply enquiries",
    text: "International customers can request pricing, lead-time information and supply coordination. Feasibility and terms are confirmed for each enquiry.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Home</Link><span>/</span><span>Services</span>
          </div>
          <p className="eyebrow">{pageContent.eyebrow}</p>
          <h1>{renderHeadingLines(pageContent.heading).map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{pageContent.intro}</p>
          <div className="company-actions specification-button">
            <RequestCta requestContext="Industrial sourcing services" source="services_page">Request an Offer</RequestCta>
            <RequestCta className="button button-outline" requestContext="Specification or BOM request" requestType="specification" source="services_page">Send Your Specification</RequestCta>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">What you can request</p>
            <h2>A clear route from requirement to commercial review</h2>
            <p className="section-intro">Each service begins with information supplied by the buyer. Availability, pricing, lead time and delivery scope are confirmed only after the individual requirement has been reviewed.</p>
          </div>
        </div>
        <div className="content-grid services-capability-grid">
          {services.map((service) => (
            <article className="value-card" key={service.number}>
              <span>{service.number}</span>
              <h2>{service.title}</h2>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section service-points">
        <div className="shell">
          <div className="section-heading services-heading">
            <div>
              <p className="eyebrow eyebrow-light">How the enquiry is handled</p>
              <h2>Specification-led commercial workflow</h2>
            </div>
          </div>
          <div className="service-points-grid">
            <div><span>01</span><p>Requirement and manufacturer reference reviewed</p></div>
            <div><span>02</span><p>Missing technical or commercial details clarified</p></div>
            <div><span>03</span><p>Pricing and lead-time information requested</p></div>
            <div><span>04</span><p>Supply scope presented for buyer review</p></div>
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell brand-sections">
          <div>
            <p className="eyebrow">Prepare your enquiry</p>
            <h2>Include the information that identifies the requirement</h2>
          </div>
          <article className="content-card">
            <h3>Useful information</h3>
            <ul>
              <li>Manufacturer and complete model or part number</li>
              <li>Required quantity and target delivery location</li>
              <li>Technical specification, drawing or bill of materials</li>
              <li>Any acceptable alternatives or documentation requirements</li>
            </ul>
            <p>Commercial feasibility, availability and supply terms are confirmed only after the individual enquiry has been reviewed.</p>
            <div className="company-actions specification-button">
              <RequestCta requestContext="Services page offer request" source="services_page">Request an Offer</RequestCta>
              <Link className="text-link" href="/contacts">Contact {SITE_BRAND.displayName} <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} type="application/ld+json" />
    </>
  );
}
