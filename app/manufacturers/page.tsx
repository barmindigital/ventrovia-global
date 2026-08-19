import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { ManufacturerBrowser } from "../components/ManufacturerBrowser";
import { manufacturers } from "../lib/manufacturer-directory";
import { brandLogoBySlug } from "../lib/brand-logos";
import { brandDisplayName, brandKnowledgeFor, brandReadinessFor } from "../lib/brand-knowledge.server";
import { renderHeadingLines, siteContent } from "../lib/site-content";

const pageContent = siteContent.pages.manufacturers;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/manufacturers" },
  openGraph: { url: "/manufacturers", title: pageContent.seoTitle, description: pageContent.seoDescription },
};

export default function ManufacturersPage() {
  return (
    <>
      <section className="page-hero"><div className="shell"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Manufacturers</span></div><div className="page-hero-row"><div><p className="eyebrow">{pageContent.eyebrow}</p><h1>{renderHeadingLines(pageContent.heading).map((line, index) => <Fragment key={`${line}-${index}`}>{index > 0 ? <br /> : null}{line}</Fragment>)}</h1><p>{pageContent.intro}</p></div><div className="page-count"><strong>2,800+</strong><span>manufacturer identities preserved</span></div></div></div></section>
      <section className="section shell"><ManufacturerBrowser manufacturers={manufacturers.map(({ aliases, name, slug }) => ({ aliases: [name, ...aliases, ...(brandKnowledgeFor(slug)?.aliases ?? [])], descriptor: brandKnowledgeFor(slug)?.productCategories.slice(0, 2).join(" · "), logoSrc: brandLogoBySlug(slug)?.src, name: brandDisplayName(slug, name), readiness: brandReadinessFor(slug), slug }))} /></section>
    </>
  );
}
