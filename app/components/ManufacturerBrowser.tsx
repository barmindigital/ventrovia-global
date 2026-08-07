"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatCount,
  type CatalogManufacturerOption,
} from "../lib/catalog-public";
import { brandLogoBySlug } from "../lib/brand-logos";
import { brandInitials, brandWordmarkTone } from "../lib/brand-wordmark";
import { manufacturerMatchesQuery } from "../lib/manufacturer-identifiers";

export function ManufacturerBrowser({
  manufacturers,
}: {
  manufacturers: CatalogManufacturerOption[];
}) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(63);
  const filtered = useMemo(() => {
    return manufacturers.filter((manufacturer) =>
      manufacturerMatchesQuery(manufacturer, query),
    );
  }, [manufacturers, query]);
  const visibleManufacturers = filtered.slice(0, visibleCount);
  const shownCount = Math.min(visibleCount, filtered.length);
  const totalCount = filtered.length;

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
      <div className="manufacturer-list">
        {visibleManufacturers.map((manufacturer) => {
          const logo = brandLogoBySlug(manufacturer.slug);
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
                    src={logo.src}
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
                <span>
                  {manufacturer.verificationStatus === "verified"
                    ? manufacturer.country ?? "Регион не указан"
                    : "Данные на проверке"}
                </span>
                <span>{formatCount(manufacturer.count)} исх. поз.</span>
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
