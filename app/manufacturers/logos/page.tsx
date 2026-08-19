import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brandLogoRegistry } from "../../lib/brand-logos";

export const metadata: Metadata = {
  title: "Manufacturer logo sources",
  description: "Source and reuse records for manufacturer logos used for brand identification.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/manufacturers" },
};

export default function BrandLogoSourcesPage() {
  return (
    <>
      <section className="page-hero"><div className="shell"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/manufacturers">Manufacturers</Link><span>/</span><span>Logo sources</span></div><p className="eyebrow">Asset provenance</p><h1>Manufacturer logo sources</h1><p>Only reviewed assets with an explicit source and reuse status enter this registry. A neutral text treatment is used when a logo cannot be published safely.</p></div></section>
      <section className="section shell">
        <div className="logo-source-list">{brandLogoRegistry.map((logo) => <article className="logo-source-card" key={logo.slug}><div className="logo-source-preview"><Image alt={`${logo.name} logo`} height={120} src={logo.src} unoptimized width={260} /></div><div><h2>{logo.name}</h2><p>{logo.license}</p><p>{logo.attribution}</p>{logo.licenseUrl && <a href={logo.licenseUrl} rel="noreferrer" target="_blank">Licence terms ↗</a>}<a href={logo.sourcePage} rel="noreferrer" target="_blank">Source page ↗</a></div></article>)}</div>
        <p className="trademark-note">All trademarks belong to their respective owners. Display is used for identification and does not imply an official partnership.</p>
      </section>
    </>
  );
}
