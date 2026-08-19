import { internationalManufacturers } from "../generated/manufacturer-directory";
import {
  SEARCH_ALIASES,
  canonicalManufacturerSlug,
} from "./international-manufacturer-identifiers";

export const manufacturers = internationalManufacturers.map((manufacturer) => {
  const slug = canonicalManufacturerSlug(manufacturer.slug);
  return {
    ...manufacturer,
    slug,
    aliases: Array.from(
      new Set([
        manufacturer.name,
        ...manufacturer.aliases,
        ...(SEARCH_ALIASES[slug] ?? []),
      ]),
    ),
  };
});

const manufacturerIndex = new Map(
  manufacturers.map((manufacturer) => [manufacturer.slug, manufacturer]),
);

export const manufacturerBySlug = (slug: string) =>
  manufacturerIndex.get(canonicalManufacturerSlug(slug));
