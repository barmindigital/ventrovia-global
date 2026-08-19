export const MANUFACTURER_SLUG_ALIASES: Readonly<Record<string, string>> = {
  price_pump: "price-pump",
  bradman_lake: "bradman-lake",
  "-quincy-compressor": "quincy-compressor",
  "-okuma": "okuma",
  "kessler--co": "kessler-co",
  "soco-sSystem": "soco-system",
  "val-co-": "val-co",
  "zae-antriebsSysteme": "zae-antriebssysteme",
  kubler: "kuebler",
  "schmersal-gmbh": "schmersal",
};

export const SEARCH_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "bosch-rexroth": ["Bosch Rexroth", "Rexroth"],
  "ifm-electronic": ["IFM", "IFM Electronic"],
  "marathon-electric": ["Marathon", "Marathon Electric"],
  "elco-motors": ["Elco", "Elco Motors"],
  herz: ["Herz"],
  kuebler: ["Kübler", "Kubler", "Kuebler"],
  schmersal: ["Schmersal", "Schmersal GmbH"],
};

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/giu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function canonicalManufacturerSlug(slug: string) {
  return MANUFACTURER_SLUG_ALIASES[slug] ?? slug;
}

export function legacyManufacturerSlugsFor(canonicalSlug: string) {
  return Object.entries(MANUFACTURER_SLUG_ALIASES)
    .filter(([, canonical]) => canonical === canonicalSlug)
    .map(([legacy]) => legacy);
}

export function manufacturerMatchesQuery(
  manufacturer: { aliases: readonly string[] },
  query: string,
) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  return manufacturer.aliases.some((value) =>
    normalizeSearchText(value).includes(normalizedQuery),
  );
}
