# Brand Knowledge governance

## Purpose

The public site treats manufacturers as an evidence-backed B2B knowledge base. Product records remain preserved in PIM but are not public while `PRODUCT_CATALOG_PUBLIC_ENABLED=false`.

## Evidence boundary

- `Tier A`: official manufacturer, corporate, catalog, documentation or press resource.
- `Tier B`: official parent company or legal/corporate representative.
- `Tier C`: supplementary discovery only.
- `Tier D`: reseller, competitor, historical import or unknown origin; cannot confirm a public brand fact.
- Historical product relations may prioritize research but never prove a public brand category, family, country or corporate fact.

Every public factual profile is stored in `data/brand-knowledge/curated-brand-facts.json`. A profile becomes `BRAND_SAFE` only when it has an available Tier A/B source, a confirmed identity and unique factual copy. Missing sections are omitted. Unconfirmed raw country, founding year and taxonomy are not shown.

## Publication classes

- `BRAND_SAFE`: indexable; confirmed official identity and source, meaningful unique content, factual metadata and no identity blocker.
- `BRAND_WEAK`: accessible for RFQ but `noindex, follow`; no unsupported company facts are displayed.
- `BRAND_REVIEW`: ambiguous identity, duplicate name or blocked source; accessible for RFQ and always `noindex, follow`.

Logo absence does not block `BRAND_SAFE`. Product catalog counts, SKU, product cards and product schema are forbidden on manufacturer pages while the product catalog is disabled.

## Completeness is not verification

`BRAND_COMPLETE` is an internal quality metric, never a replacement for source verification. The transparent 100-point score is recorded in `data/brand-knowledge/brand-completeness.json`: identity source 20, official domain 10, publishable logo 10, description 15, categories 10, families 10, country/headquarters 10, catalogs/documentation 10 and SEO readiness 5. A profile can be `BRAND_SAFE` without being complete, while no score can promote a profile that lacks official identity evidence.

## Logo policy

Each accepted local logo records its source page, original asset URL, format, pixel/view-box dimensions, SHA-256 checksum, checked date, brand scope, license, rights status and publication status in `data/brand-knowledge/logo-audit.json`.

Logos are never generated, taken from Dalkos or inferred from a favicon. Identity must match the canonical manufacturer. A missing or uncertain logo falls back to the shared text wordmark. Brand marks are never recolored, stretched or overlaid.

## Content and SEO

- Russian copy is independently written from extracted source-backed facts; official names remain in their original spelling.
- No page may claim official dealer, official representative, stock, price, availability or manufacturer warranty without explicit evidence.
- Product families are shown only when their relationship to the brand is supported by an official source. Family membership never proves a SKU specification.
- `Brand` structured data is emitted only for `BRAND_SAFE`; `Product` and `Offer` structured data are never emitted on brand pages.
- Sitemap inclusion is limited to `BRAND_SAFE`. Product sitemap URLs remain zero.

## Operations

Run:

```sh
pnpm brands:knowledge
pnpm audit:brands
```

The first command regenerates the complete 2,806-brand health model, review queue, FAST_PATH list, Pareto ranking, completeness report, deterministic sample and logo/content/similarity/SEO audits. The second command fails when any generated report is stale. Private reports are served only through authenticated, `private, no-store` admin endpoints.

To improve a brand, add or update its reviewed facts and sources, run the generator, review the dry-run reports, run all gates, then publish. Never promote a profile merely because a similarly named domain or logo exists.
