import type { Metadata } from "next";
import { SITE_BRAND } from "./site-brand";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

export const defaultOpenGraphImage = {
  url: SITE_BRAND.logos.social,
  width: 1200,
  height: 630,
  alt: `${SITE_BRAND.displayName} — ${SITE_BRAND.tagline}`,
};

// Next.js replaces the parent openGraph object instead of merging it, so every
// page builds its tags from this base to keep the preview image and site name.
export function pageOpenGraph(overrides: OpenGraph = {}): OpenGraph {
  return {
    type: "website",
    locale: "en",
    siteName: SITE_BRAND.displayName,
    images: [defaultOpenGraphImage],
    ...overrides,
  } as OpenGraph;
}
