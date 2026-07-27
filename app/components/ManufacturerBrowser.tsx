"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCount, manufacturers } from "../lib/catalog-data";

export function ManufacturerBrowser() {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(60);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    return manufacturers.filter((manufacturer) => {
      if (!normalized && manufacturer.slug === "abb") return false;
      return [manufacturer.name, manufacturer.country ?? ""].some((value) =>
        value.toLocaleLowerCase("ru").includes(normalized),
      );
    });
  }, [query]);
  const visibleManufacturers = filtered.slice(0, visibleCount);

  return (
    <>
      <div className="manufacturer-tools">
        <label className="sr-only" htmlFor="manufacturer-query">
          Поиск производителя
        </label>
        <input
          id="manufacturer-query"
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(60);
          }}
          placeholder="Найти производителя"
          type="search"
          value={query}
        />
        <span>{formatCount(query ? filtered.length : manufacturers.length)} в базе</span>
      </div>
      <div className="manufacturer-list">
        {!query && (
          <Link className="manufacturer-card brand-featured" href="/manufacturers/abb">
            <span className="brand-card-visual" role="img" aria-label="Фирменная карточка ABB">
              <i>ABB</i>
            </span>
            <h2>ABB</h2>
            <p><span>Автоматика и электрификация</span><span>Открыть ↗</span></p>
          </Link>
        )}
        {visibleManufacturers.map((manufacturer) => {
          const initials = manufacturer.name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();
          return (
            <Link
              className="manufacturer-card"
              href={`/manufacturers/${manufacturer.slug}`}
              key={manufacturer.slug}
            >
              <span
                className="brand-card-visual"
                role="img"
                aria-label={`Фирменная карточка ${manufacturer.name}`}
              >
                <i>{initials}</i>
              </span>
              <h2>{manufacturer.name}</h2>
              <p>
                <span>{manufacturer.country ?? "Международный бренд"}</span>
                <span>{formatCount(manufacturer.count)} поз.</span>
              </p>
            </Link>
          );
        })}
      </div>
      {visibleCount < filtered.length && (
        <div className="manufacturer-more">
          <button
            className="button button-outline"
            onClick={() => setVisibleCount((count) => count + 60)}
            type="button"
          >
            Показать ещё 60
          </button>
          <span>
            Показано {formatCount(Math.min(visibleCount, filtered.length))} из{" "}
            {formatCount(filtered.length)}
          </span>
        </div>
      )}
    </>
  );
}
