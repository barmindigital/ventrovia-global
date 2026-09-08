# Brand Knowledge governance

## Purpose

The public site treats manufacturers as an evidence-backed B2B knowledge base.
Every public brand fact must trace back to a manufacturer-owned source.

## Evidence tiers

- `Tier A`: official manufacturer, corporate, catalog, documentation or press resource.
- `Tier B`: official parent company or legal/corporate representative.
- `Tier C`: supplementary discovery only.
- `Tier D`: reseller, competitor, historical import or unknown origin; cannot confirm a public brand fact.

Reviewed factual inputs are stored under `data/brand-sources/`; English public
profiles are generated under `data/brand-knowledge-international/`. A profile
becomes `BRAND_SAFE` only when it has an available Tier A/B source, a confirmed
identity and unique factual copy. Missing sections are omitted; unconfirmed
country, founding year and taxonomy are never shown.

## Publication classes

- `BRAND_SAFE`: indexable; confirmed official identity and source, unique content, factual metadata, no identity blocker. Listed on `/manufacturers` and in the sitemap.
- `BRAND_REVIEW`: ambiguous identity, duplicate name or blocked source; the page stays reachable for RFQ but is `noindex, follow` and is not listed.

A missing logo does not block `BRAND_SAFE`. Product counts, SKUs, product
cards and `Product`/`Offer` structured data are never emitted on brand pages.

## Completeness is not verification

`BRAND_COMPLETE` (recorded in `data/brand-operations/brand-completeness.json`)
is an internal quality metric. A profile can be `BRAND_SAFE` without being
complete, and no score can promote a profile that lacks official identity
evidence.

## Logo policy

Each accepted logo records its source page, original asset URL, format,
dimensions, SHA-256 checksum, checked date, brand scope, license, rights status
and publication status in `data/brand-operations/logo-audit.json` and is
registered in `app/lib/brand-logos.ts`.

Logos are never generated, copied from third-party catalogs or inferred from a
favicon. A missing or uncertain logo falls back to the shared text wordmark.
Brand marks are never recoloured, stretched or overlaid.

## Content and SEO

- Copy is written independently from extracted, source-backed facts; official names keep their original spelling.
- No page may claim official dealer, official representative, stock, price, availability or manufacturer warranty without explicit evidence.
- Product families are shown only when an official source supports their relationship to the brand.
- `Brand` structured data is emitted only for `BRAND_SAFE`.
- Titles and meta descriptions must be unique across the indexable cohort; the generator fails when duplicates or high-similarity content appear in `seo-health.json`.

## Operations

```sh
pnpm brands:directory
pnpm brands:international
pnpm brands:operations
pnpm brands:master
pnpm audit:brands
```

The generators rebuild the identity directory, public profiles, the brand-health
model (review queue, fast-path list, completeness, logo coverage and content/SEO
audits) and the portable brand-master package. `audit:brands` fails when any
generated report is stale. Private reports are served only through
authenticated, `private, no-store` admin endpoints.

To improve a brand, add or update its reviewed facts and sources, run the
generators, review the reports, run `pnpm check`, then publish. Never promote a
profile merely because a similarly named domain or logo exists.
