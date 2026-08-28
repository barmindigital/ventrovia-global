"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { brandInitials, brandWordmarkTone } from "../lib/brand-wordmark";
import { manufacturerMatchesQuery, normalizeSearchText } from "../lib/international-manufacturer-identifiers";

type PublicManufacturer = {
  slug: string;
  name: string;
  aliases: string[];
  logoSrc?: string;
  logoBackground?: "light" | "dark";
  descriptor?: string;
  readiness: "BRAND_SAFE" | "BRAND_WEAK" | "BRAND_REVIEW";
};

const formatCount = (value: number) => new Intl.NumberFormat("en").format(value);

export function ManufacturerBrowser({ manufacturers }: { manufacturers: PublicManufacturer[] }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(63);
  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    const hasExactAlias = normalizedQuery && manufacturers.some((manufacturer) => manufacturer.aliases.some((alias) => normalizeSearchText(alias) === normalizedQuery));
    return manufacturers.filter((manufacturer) => {
      const matchesLetter = letter === "All" || manufacturer.name.toLocaleUpperCase("en").startsWith(letter);
      const matchesQuery = hasExactAlias
        ? manufacturer.aliases.some((alias) => normalizeSearchText(alias) === normalizedQuery)
        : manufacturerMatchesQuery(manufacturer, query);
      return matchesLetter && matchesQuery;
    });
  }, [letter, manufacturers, query]);
  const visibleManufacturers = filtered.slice(0, visibleCount);
  const letters = useMemo(() => {
    const available = new Set(manufacturers.map(({ name }) => name.trim().charAt(0).toLocaleUpperCase("en")));
    return ["All", ...[...available].filter(Boolean).sort((left, right) => left.localeCompare(right, "en"))];
  }, [manufacturers]);

  return (
    <>
      <div className="manufacturer-tools">
        <label className="sr-only" htmlFor="manufacturer-query">Search manufacturers</label>
        <input id="manufacturer-query" onChange={(event) => { setQuery(event.target.value); setVisibleCount(63); }} placeholder="Search by manufacturer or alias" type="search" value={query} />
        <span aria-live="polite">{formatCount(filtered.length)} {filtered.length === 1 ? "manufacturer" : "manufacturers"}</span>
      </div>
      <div aria-label="Manufacturer alphabet" className="manufacturer-alphabet">
        {letters.map((item) => <button aria-pressed={letter === item} className={letter === item ? "is-active" : undefined} key={item} onClick={() => { setLetter(item); setVisibleCount(63); }} type="button">{item}</button>)}
      </div>
      <div className="manufacturer-list">
        {visibleManufacturers.map((manufacturer) => {
          const logo = manufacturer.logoSrc;
          return (
            <Link className="manufacturer-card" href={`/manufacturers/${manufacturer.slug}`} key={manufacturer.slug}>
              <span aria-label={logo ? undefined : `Text identity for ${manufacturer.name}`} className={`brand-card-visual${logo ? ` has-logo${manufacturer.logoBackground === "dark" ? " logo-on-dark" : ""}` : ` wordmark ${brandWordmarkTone(manufacturer.slug)}`}`} role={logo ? undefined : "img"}>
                {logo ? <Image alt={`${manufacturer.name} logo`} height={80} src={logo} unoptimized width={180} /> : <><span aria-hidden="true" className="brand-wordmark-initials" data-initials={brandInitials(manufacturer.name)} /><span className="brand-wordmark-copy"><strong>{manufacturer.name}</strong><small>manufacturer</small></span></>}
              </span>
              <h2>{manufacturer.name}</h2>
              <p><span>{manufacturer.descriptor ?? (manufacturer.readiness === "BRAND_SAFE" ? "Source-backed manufacturer profile" : "RFQ by manufacturer and model")}</span></p>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state" role="status">
          <h2>No manufacturers found</h2>
          <p>Check the spelling, try another alias or clear the current filters.</p>
          <button className="button button-outline" onClick={() => { setQuery(""); setLetter("All"); setVisibleCount(63); }} type="button">Clear search</button>
        </div>
      )}
      {visibleCount < filtered.length && <div className="manufacturer-more"><button className="button button-outline" onClick={() => setVisibleCount((count) => count + 63)} type="button">Show 63 more</button><span>Showing {formatCount(Math.min(visibleCount, filtered.length))} of {formatCount(filtered.length)}</span></div>}
      <p className="trademark-note">All trademarks belong to their respective owners and are used for identification. Displaying a logo does not indicate authorised-dealer status. <Link href="/manufacturers/logos">Logo sources and rights</Link></p>
    </>
  );
}
