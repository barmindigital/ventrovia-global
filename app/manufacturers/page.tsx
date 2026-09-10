import type { Metadata } from "next";
import { pageOpenGraph } from "../lib/open-graph";
import Link from "next/link";
import { Fragment } from "react";
import { ManufacturerBrowser } from "../components/ManufacturerBrowser";
import { manufacturers } from "../lib/manufacturer-directory";
import { brandLogoBySlug } from "../lib/brand-logos";
import { brandDisplayName, brandKnowledgeFor, brandReadinessFor, isBrandIndexable } from "../lib/brand-knowledge.server";
import { renderHeadingLines, siteContent } from "../lib/site-content";

const pageContent = siteContent.pages.manufacturers;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/manufacturers" },
  openGraph: pageOpenGraph({ url: "/manufacturers", title: pageContent.seoTitle, description: pageContent.seoDescription }),
};

const listedManufacturers = manufacturers.filter(({ slug }) => isBrandIndexable(slug));
const listedCount = new Intl.NumberFormat("en-US").format(listedManufacturers.length);

export default function ManufacturersPage() {
  return (
    <>
      <section className="page-hero"><div className="shell"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Manufacturers</span></div><div className="page-hero-row"><div><p className="eyebrow">{pageContent.eyebrow}</p><h1>{renderHeadingLines(pageContent.heading).map((line, index) => <Fragment key={`${line}-${index}`}>{index > 0 ? <br /> : null}{line}</Fragment>)}</h1><p>{pageContent.intro}</p></div><div className="page-count"><strong>{listedCount}</strong><span>manufacturers with verified profiles</span></div></div></div></section>
      <section className="section shell"><ManufacturerBrowser manufacturers={listedManufacturers.map(({ aliases, name, slug }) => {
        const logo = brandLogoBySlug(slug);
        return { aliases: [name, ...aliases, ...(brandKnowledgeFor(slug)?.aliases ?? [])], descriptor: brandKnowledgeFor(slug)?.productCategories.slice(0, 2).join(" · "), logoBackground: logo?.presentationBackground, logoSrc: logo?.src, name: brandDisplayName(slug, name), readiness: brandReadinessFor(slug), slug };
      })} /></section>
    </>
  );
}
