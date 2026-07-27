"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCount, manufacturers } from "../lib/catalog-data";

export function ManufacturerBrowser() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    return manufacturers.filter((manufacturer) =>
      [manufacturer.name, manufacturer.country ?? ""].some((value) =>
        value.toLocaleLowerCase("ru").includes(normalized),
      ),
    );
  }, [query]);

  return (
    <>
      <div className="manufacturer-tools">
        <label className="sr-only" htmlFor="manufacturer-query">
          Поиск производителя
        </label>
        <input
          id="manufacturer-query"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти производителя"
          type="search"
          value={query}
        />
        <span>{filtered.length} в витрине</span>
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
        {filtered.map((manufacturer) => {
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
    </>
  );
}
