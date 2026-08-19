import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RequestCta } from "../../components/RequestCta";
import { brandLogoBySlug } from "../../lib/brand-logos";
import { brandInitials, brandWordmarkTone } from "../../lib/brand-wordmark";
import {
  brandDisplayName,
  brandKnowledgeFor,
  brandMetaDescription,
  brandReadinessFor,
  brandSeoTitle,
  isBrandIndexable,
} from "../../lib/brand-knowledge.server";
import { manufacturerBySlug, manufacturers } from "../../lib/manufacturer-directory";
import { canonicalManufacturerSlug, legacyManufacturerSlugsFor } from "../../lib/international-manufacturer-identifiers";
import { serializeJsonLd } from "../../lib/json-ld";
import { SITE_URL } from "../../lib/site-brand";

type BrandPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const slugs = manufacturers
    .filter((manufacturer) => isBrandIndexable(manufacturer.slug))
    .flatMap((manufacturer) => [manufacturer.slug, ...legacyManufacturerSlugsFor(manufacturer.slug)]);
  return Array.from(new Set(slugs)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = manufacturerBySlug(slug);
  if (!brand) return {};
  const name = brandDisplayName(brand.slug, brand.name);
  const canonical = `/manufacturers/${brand.slug}`;
  const title = brandSeoTitle(brand.slug, brand.name);
  const description = brandMetaDescription(brand.slug, brand.name);
  const logo = brandLogoBySlug(brand.slug);
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: isBrandIndexable(brand.slug), follow: true },
    openGraph: { type: "website", url: canonical, title, description, images: logo ? [{ url: logo.src, alt: `${name} logo` }] : undefined },
  };
}

const commercialFaq = (name: string) => [
  { question: `How can I request ${name} equipment?`, answer: "Send the complete model, part number or a clear nameplate image. Ventrovia will review the requirement before providing pricing and lead-time information." },
  { question: "Can I request an obsolete or hard-to-find model?", answer: "Yes. Include every available identifier and document. Availability, possible replacement and commercial terms must be confirmed for the individual requirement." },
  { question: "Can Ventrovia review an alternative?", answer: "An alternative can be considered only after the relevant technical parameters and operating conditions are checked. Similar-looking part numbers are not treated as proof of compatibility." },
  { question: "Can I upload a specification?", answer: "Yes. Attach a list containing the manufacturer and complete designation for each line so the request can be reviewed as one RFQ." },
];

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const canonicalSlug = canonicalManufacturerSlug(slug);
  if (canonicalSlug !== slug) redirect(`/manufacturers/${canonicalSlug}`);
  const brand = manufacturerBySlug(slug);
  if (!brand) notFound();

  const profile = brandKnowledgeFor(brand.slug);
  const readiness = brandReadinessFor(brand.slug);
  const displayName = brandDisplayName(brand.slug, brand.name);
  const logo = brandLogoBySlug(brand.slug);
  const brandUrl = `${SITE_URL}/manufacturers/${brand.slug}`;
  const summary = profile?.shortDescription ?? `Send the complete ${displayName} model, part number or specification for an industrial sourcing review. Brand and product information is checked before a commercial proposal is prepared.`;
  const brandJsonLd = profile ? {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: profile.officialName,
    alternateName: profile.aliases,
    url: brandUrl,
    description: profile.shortDescription,
    logo: logo ? `${SITE_URL}${logo.src}` : undefined,
    sameAs: [profile.officialWebsite],
  } : null;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Manufacturers", item: `${SITE_URL}/manufacturers` },
      { "@type": "ListItem", position: 3, name: displayName, item: brandUrl },
    ],
  };
  const faq = commercialFaq(displayName);

  return (
    <>
      <section className="page-hero">
        <div className="shell brand-hero">
          <div>
            <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/manufacturers">Manufacturers</Link><span>/</span><span>{displayName}</span></div>
            <p className="eyebrow">Manufacturer knowledge base</p>
            <h1>{displayName}</h1>
            <p>{summary}</p>
            <div className="brand-hero-actions">
              <RequestCta defaultProduct={displayName} requestContext={`Manufacturer: ${displayName}`} requestType="equipment" source="manufacturer_page">Request Price and Lead Time</RequestCta>
              <RequestCta className="button button-outline" defaultProduct={displayName} requestContext={`Specification for manufacturer: ${displayName}`} requestType="specification" source="manufacturer_page">Send Your Specification</RequestCta>
            </div>
          </div>
          <div className="brand-visual" aria-label={`${displayName} manufacturer profile`} role="img">
            <Image alt="" height={900} priority src="/images/brands/global-sourcing-cover.webp" unoptimized width={1600} />
            {logo ? <span className="brand-hero-logo"><Image alt={`${displayName} logo`} height={150} src={logo.src} unoptimized width={360} /></span> : <span aria-label={`Text identity for ${displayName}`} className={`brand-wordmark-hero ${brandWordmarkTone(brand.slug)}`} role="img"><span aria-hidden="true" className="brand-wordmark-initials" data-initials={brandInitials(displayName)} /><span className="brand-wordmark-copy"><strong>{displayName}</strong><small>manufacturer</small></span></span>}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="brand-sections">
          <aside>
            <p className="eyebrow">Source-backed details</p>
            <ul className="brand-facts">
              <li><span>Brand</span><strong>{profile?.officialName ?? displayName}</strong></li>
              {profile?.country && <li><span>Brand origin</span><strong>{profile.country}</strong></li>}
              {profile?.headquarters && <li><span>Headquarters</span><strong>{profile.headquarters}</strong></li>}
              {profile?.foundedYear && <li><span>Founded</span><strong>{profile.foundedYear}</strong></li>}
              {profile?.parentCompany && <li><span>Corporate group</span><strong>{profile.parentCompany}</strong></li>}
              <li><span>Page status</span><strong>{readiness === "BRAND_SAFE" ? "Official source confirmed" : "Source review in progress"}</strong></li>
            </ul>
            {profile && <a className="brand-official-link" href={profile.officialWebsite} rel="noreferrer" target="_blank">Official manufacturer website <span aria-hidden="true">↗</span></a>}
          </aside>
          <article className="content-card">
            <h2>About the manufacturer</h2>
            {profile ? profile.fullDescription.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>This public page contains only a safe manufacturer identity and a path to submit an RFQ. A source-backed company description and product areas will be added after official-source verification.</p>}
            {profile && profile.productCategories.length > 0 && <section className="brand-knowledge-section"><h3>Official product areas</h3><div className="brand-tag-list">{profile.productCategories.map((item) => <span key={item}>{item}</span>)}</div></section>}
            {profile && (profile.productFamilies.length > 0 || profile.series.length > 0) && <section className="brand-knowledge-section"><h3>Documented families and product lines</h3><div className="brand-tag-list">{[...profile.productFamilies, ...profile.series].map((item) => <span key={item}>{item}</span>)}</div><p className="brand-scope-note">Family membership does not establish the exact specifications or compatibility of an individual model.</p></section>}
            {profile && profile.industries.length > 0 && <section className="brand-knowledge-section"><h3>Documented application areas</h3><p>{profile.industries.join(" · ")}</p></section>}
            {profile && (profile.officialCatalogs.length > 0 || profile.documentationSources.length > 0) && <section className="brand-knowledge-section"><h3>Official manufacturer materials</h3><ul className="brand-document-list">{profile.officialCatalogs.map((url, index) => <li key={url}><a href={url} rel="noreferrer" target="_blank">Official catalogue{profile.officialCatalogs.length > 1 ? ` ${index + 1}` : ""} ↗</a></li>)}{profile.documentationSources.map((url, index) => <li key={url}><a href={url} rel="noreferrer" target="_blank">Technical documentation{profile.documentationSources.length > 1 ? ` ${index + 1}` : ""} ↗</a></li>)}</ul></section>}
          </article>
        </div>
      </section>

      <section className="section section-tint"><div className="shell brand-rfq-panel"><div><p className="eyebrow">Request for quotation</p><h2>Request {displayName} equipment</h2><p>Send the complete part number, model or specification. Our team will review the requirement and provide pricing and lead-time information after confirmation.</p></div><RequestCta defaultProduct={displayName} requestContext={`Manufacturer: ${displayName}`} requestType="equipment" source="manufacturer_page">Send an Enquiry</RequestCta></div></section>

      <section className="section shell">
        <div className="section-heading"><div><p className="eyebrow">Questions and answers</p><h2>Preparing an RFQ</h2></div></div>
        <div className="brand-faq-grid">{faq.map((item) => <article className="content-card" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div>
        <p className="trademark-note">The {displayName} trademark belongs to its respective owner and is used for identification. Source links and trademark references do not imply a commercial relationship with the trademark owner.{logo && <> <Link href="/manufacturers/logos">Logo source</Link></>}</p>
      </section>

      {brandJsonLd && <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(brandJsonLd) }} type="application/ld+json" />}
      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} type="application/ld+json" />
    </>
  );
}
