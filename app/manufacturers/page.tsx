import type { Metadata } from "next";
import { pageOpenGraph } from "../lib/open-graph";
import Link from "next/link";
import { Fragment } from "react";
import { ManufacturerBrowser } from "../components/ManufacturerBrowser";
import { manufacturers } from "../lib/manufacturer-directory";
import { brandLogoBySlug } from "../lib/brand-logos";
import { brandDisplayName, brandKnowledgeFor, isBrandIndexable } from "../lib/brand-knowledge.server";
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

// Every listed brand is serialised into the page for client-side search, so the
// records carry only what the cards and the search need.
const LOGO_DIRECTORY = "/images/brand-logos/";
const browserManufacturers = listedManufacturers.map(({ aliases, name, slug }) => {
  const logo = brandLogoBySlug(slug);
  const displayName = brandDisplayName(slug, name);
  const seen = new Set([displayName.toLocaleLowerCase("en")]);
  const searchAliases = [name, ...aliases, ...(brandKnowledgeFor(slug)?.aliases ?? [])].filter((alias) => {
    const key = alias.toLocaleLowerCase("en");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    slug,
    name: displayName,
    ...(searchAliases.length ? { aliases: searchAliases } : {}),
    descriptor: brandKnowledgeFor(slug)?.productCategories.slice(0, 2).join(" · "),
    ...(logo ? { logo: logo.src.startsWith(LOGO_DIRECTORY) ? logo.src.slice(LOGO_DIRECTORY.length) : logo.src } : {}),
    ...(logo?.presentationBackground === "dark" ? { logoOnDark: true } : {}),
  };
});

export default function ManufacturersPage() {
  return (
    <>
      <section className="page-hero"><div className="shell"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Manufacturers</span></div><div className="page-hero-row"><div><p className="eyebrow">{pageContent.eyebrow}</p><h1>{renderHeadingLines(pageContent.heading).map((line, index) => <Fragment key={`${line}-${index}`}>{index > 0 ? <br /> : null}{line}</Fragment>)}</h1><p>{pageContent.intro}</p></div><div className="page-count"><strong>{listedCount}</strong><span>manufacturers with verified profiles</span></div></div></div></section>
      <section className="section shell"><ManufacturerBrowser manufacturers={browserManufacturers} /></section>
    </>
  );
}
