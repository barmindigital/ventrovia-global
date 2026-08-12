"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatCount,
} from "../lib/catalog-public";
import { brandInitials, brandWordmarkTone } from "../lib/brand-wordmark";
import {
  manufacturerMatchesQuery,
  normalizeSearchText,
} from "../lib/manufacturer-identifiers";

type PublicManufacturer = {
  slug: string;
  name: string;
  count: number;
  aliases: string[];
  country?: string;
  verificationStatus?: "verified" | "needs_review";
  logoSrc?: string;
  descriptor?: string;
  readiness: "BRAND_SAFE" | "BRAND_WEAK" | "BRAND_REVIEW";
};

export function ManufacturerBrowser({
  manufacturers,
  showProductCounts = true,
}: {
  manufacturers: PublicManufacturer[];
  showProductCounts?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("Все");
  const [visibleCount, setVisibleCount] = useState(63);
  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    const hasExactAlias = normalizedQuery && manufacturers.some((manufacturer) =>
      manufacturer.aliases.some((alias) => normalizeSearchText(alias) === normalizedQuery),
    );
    return manufacturers.filter((manufacturer) => {
      const matchesLetter = letter === "Все" || manufacturer.name.toLocaleUpperCase("ru").startsWith(letter);
      const matchesQuery = hasExactAlias
        ? manufacturer.aliases.some((alias) => normalizeSearchText(alias) === normalizedQuery)
        : manufacturerMatchesQuery(manufacturer, query);
      return matchesLetter && matchesQuery;
    });
  }, [letter, manufacturers, query]);
  const visibleManufacturers = filtered.slice(0, visibleCount);
  const shownCount = Math.min(visibleCount, filtered.length);
  const totalCount = filtered.length;
  const letters = useMemo(() => {
    const available = new Set(manufacturers.map(({ name }) => name.trim().charAt(0).toLocaleUpperCase("ru")));
    return ["Все", ...[...available].filter(Boolean).sort((left, right) => left.localeCompare(right, "ru"))];
  }, [manufacturers]);

  return (
    <>
      <div className="manufacturer-tools">
        <label className="sr-only" htmlFor="manufacturer-query">
          Поиск производителя
        </label>
        <input
          id="manufacturer-query"
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setVisibleCount(63);
          }}
          placeholder="Найти производителя"
          type="search"
          value={query}
        />
        <span>{formatCount(query ? filtered.length : manufacturers.length)} в базе</span>
      </div>
      <div aria-label="Алфавитный указатель производителей" className="manufacturer-alphabet">
        {letters.map((item) => (
          <button
            aria-pressed={letter === item}
            className={letter === item ? "is-active" : undefined}
            key={item}
            onClick={() => {
              setLetter(item);
              setVisibleCount(63);
            }}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="manufacturer-list">
        {visibleManufacturers.map((manufacturer) => {
          const logo = manufacturer.logoSrc;
          return (
            <Link
              className="manufacturer-card"
              href={`/manufacturers/${manufacturer.slug}`}
              key={manufacturer.slug}
            >
              <span
                aria-label={
                  logo
                    ? undefined
                    : `Текстовая карточка производителя ${manufacturer.name}`
                }
                className={`brand-card-visual${
                  logo
                    ? " has-logo"
                    : ` wordmark ${brandWordmarkTone(manufacturer.slug)}`
                }`}
                role={logo ? undefined : "img"}
              >
                {logo ? (
                  <Image
                    alt={`${manufacturer.name} — логотип производителя`}
                    height={80}
                    src={logo}
                    unoptimized
                    width={180}
                  />
                ) : (
                  <>
                    <span
                      aria-hidden="true"
                      className="brand-wordmark-initials"
                      data-initials={brandInitials(manufacturer.name)}
                    />
                    <span className="brand-wordmark-copy">
                      <strong>{manufacturer.name}</strong>
                      <small>производитель</small>
                    </span>
                  </>
                )}
              </span>
              <h2>{manufacturer.name}</h2>
              <p>
                <span>{manufacturer.descriptor ?? "Подбор по модели и маркировке"}</span>
                {showProductCounts && (
                  <span>{formatCount(manufacturer.count)} исх. поз.</span>
                )}
              </p>
            </Link>
          );
        })}
      </div>
      {visibleCount < filtered.length && (
        <div className="manufacturer-more">
          <button
            className="button button-outline"
            onClick={() => setVisibleCount((count) => count + 63)}
            type="button"
          >
            Показать ещё 63
          </button>
          <span>
            Показано {formatCount(shownCount)} из {formatCount(totalCount)}
          </span>
        </div>
      )}
      <p className="trademark-note">
        Товарные знаки принадлежат соответствующим правообладателям и
        используются для идентификации продукции. Наличие логотипа не означает
        статус официального дилера.{" "}
        <Link href="/manufacturers/logos">Источники и лицензии</Link>
      </p>
    </>
  );
}
