import type { Metadata } from "next";
import { pageOpenGraph } from "./lib/open-graph";
import Image from "next/image";
import Link from "next/link";
import { RequestCta } from "./components/RequestCta";
import { RequestForm } from "./components/RequestForm";
import { RevealOnScroll } from "./components/RevealOnScroll";
import { ScrollHeroOrb } from "./components/ScrollHeroOrb";
import { brandLogoBySlug } from "./lib/brand-logos";
import { renderHeadingLines, siteContent } from "./lib/site-content";
import { SITE_BRAND } from "./lib/site-brand";

const featuredManufacturers = [
  { slug: "bosch-rexroth", name: "Bosch Rexroth" },
  { slug: "ifm-electronic", name: "ifm electronic" },
  { slug: "marelli-motori", name: "Marelli Motori" },
  { slug: "marathon-electric", name: "Marathon Electric" },
  { slug: "vivoil-oleodinamica-vivolo-s-r-l", name: "Vivoil" },
  { slug: "herz", name: "HERZ" },
  { slug: "hydac", name: "HYDAC" },
  { slug: "mp-pumps", name: "MP Pumps" },
  { slug: "cantoni-group", name: "Cantoni Group" },
  { slug: "parker-hannifin-gmbh", name: "Parker Hannifin" },
  { slug: "siemens", name: "Siemens" },
  { slug: "abb", name: "ABB" },
  { slug: "festo", name: "Festo" },
  { slug: "skf", name: "SKF" },
  { slug: "sew-eurodrive", name: "SEW-Eurodrive" },
  { slug: "grundfos", name: "Grundfos" },
  { slug: "smc", name: "SMC" },
  { slug: "schneider-electric", name: "Schneider Electric" },
  { slug: "rockwell-automation", name: "Rockwell Automation" },
  { slug: "sick-ag", name: "SICK" },
];

const heroTrustItems = [
  "Specification-led RFQs",
  "Manufacturer and model review",
  "Hard-to-find industrial requirements",
  "International supply coordination",
  "Commercial terms confirmed per request",
];

const pageContent = siteContent.pages.home;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({ url: "/", title: pageContent.seoTitle, description: pageContent.seoDescription }),
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{pageContent.eyebrow}</p>
            <h1>{renderHeadingLines(pageContent.heading).map((line) => <span key={line}>{line}</span>)}</h1>
            <p className="hero-lead">{pageContent.intro}</p>
            <div className="hero-links">
              <RequestCta className="button button-primary" source="hero_home">Request an Offer</RequestCta>
              <RequestCta className="button button-outline" requestType="specification" source="hero_home">Send Your Specification</RequestCta>
            </div>
          </div>
          <div className="hero-visual" aria-label="Global industrial sourcing network">
            <ScrollHeroOrb />
            <div className="hero-badge"><span>{SITE_BRAND.tagline}</span><strong>Worldwide industrial sourcing</strong></div>
          </div>
        </div>
        <div className="hero-trust-shell">
          <ul className="hero-trust" aria-label="Sourcing principles">{heroTrustItems.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="section services-section" id="services">
        <div className="shell">
          <div className="section-heading services-heading">
            <div>
              <p className="eyebrow">A structured commercial workflow</p>
              <h2>Industrial sourcing services</h2>
              <p className="section-intro">Aihamyn Hampa Trading supports the commercial sourcing process from requirement review through international supply coordination. Scope and terms are confirmed for every RFQ.</p>
            </div>
          </div>
          <div className="service-points-grid service-cards">
            <article><span>01</span><h3>Requirement review</h3><p>We review the manufacturer, complete model, part number and technical specification.</p></article>
            <article><span>02</span><h3>Source assessment</h3><p>We identify a suitable supply path and clarify the exact commercial requirement.</p></article>
            <article><span>03</span><h3>Quote preparation</h3><p>Pricing and lead-time information are prepared after supplier confirmation.</p></article>
            <article><span>04</span><h3>Supply coordination</h3><p>Commercial documentation and international movement are coordinated for the accepted order.</p></article>
          </div>
        </div>
      </section>

      <section className="section shell" id="sourcing">
        <div className="company-intro">
          <div><p className="eyebrow">Specification-led sourcing</p><h2>Start with the exact requirement</h2></div>
          <div>
            <p>Send the manufacturer, model, part number or a complete specification. Each requirement is reviewed in its commercial and technical context before a proposal is prepared.</p>
            <div className="company-actions">
              <Link className="text-link" href="/manufacturers">Explore manufacturers <span aria-hidden="true">→</span></Link>
              <RequestCta className="button button-outline" requestType="specification" source="home_specification">Send a specification</RequestCta>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" id="about">
        <div className="company-intro">
          <div><p className="eyebrow">About Aihamyn Hampa Trading</p><h2><span>Global reach.</span><span>Precise industrial RFQs.</span></h2></div>
          <div>
            <p>Aihamyn Hampa Trading is a Dubai-based international industrial sourcing and supply business. Our public knowledge base helps buyers identify manufacturers and confirmed product areas before submitting an RFQ.</p>
            <div className="company-actions"><Link className="text-link" href="/about">How we work <span aria-hidden="true">→</span></Link></div>
          </div>
        </div>
        <RevealOnScroll className="business-stats company-facts" stagger>
          <Link href="/contacts"><strong>Dubai</strong><span>operating base in the UAE</span></Link>
          <Link href="/manufacturers"><strong>2,300+</strong><span>verified manufacturer profiles</span></Link>
          <Link href="#request"><strong>RFQ</strong><span>model and specification review</span></Link>
          <Link href="/about"><strong>Worldwide</strong><span>international market focus</span></Link>
        </RevealOnScroll>
        <div className="geography-panel" id="geography">
          <div><p className="eyebrow">Worldwide scope</p><h3>International industrial sourcing</h3><p>Every route, delivery scope and lead time is confirmed for the individual requirement. Our location in Dubai supports a global business focus without limiting sourcing to a single region.</p></div>
          <Image alt="Worldwide industrial sourcing map" height={941} src="/images/company/international-reach-map.webp" unoptimized width={1672} />
        </div>
      </section>

      <section className="section shell" id="manufacturers">
        <div className="section-heading">
          <div><p className="eyebrow">Manufacturer knowledge base</p><h2>Source by verified manufacturer identity</h2><p className="section-intro">Browse official brand identities, source-backed product areas and documented families, then send the exact requirement for review.</p></div>
          <Link className="text-link" href="/manufacturers">All manufacturers <span aria-hidden="true">→</span></Link>
        </div>
        <div className="brand-cloud">
          {featuredManufacturers.map((brand) => {
            const logo = brandLogoBySlug(brand.slug);
            return (
              <Link className={`brand-chip brand-chip-logo${logo?.presentationBackground === "dark" ? " logo-on-dark" : ""}`} href={`/manufacturers/${brand.slug}`} key={brand.slug}>
                {logo ? <><Image alt={`${brand.name} logo`} height={72} loading="lazy" src={logo.src} unoptimized width={180} /><span>{brand.name}</span></> : <strong>{brand.name}</strong>}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section shell" id="request">
        <div className="process-panel request-process-panel">
          <div className="process-form-column">
            <p className="eyebrow eyebrow-light">Request for quotation</p>
            <h2>Tell us what you need to source</h2>
            <p>Include the manufacturer, complete model, part number and required quantity. Attach a specification when several lines or technical details are involved.</p>
            <RequestForm source="home_form" />
          </div>
        </div>
      </section>
    </>
  );
}
