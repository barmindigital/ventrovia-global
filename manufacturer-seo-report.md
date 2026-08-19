# Manufacturer SEO report

Checked: 2026-08-19

## Indexation surface

- Canonical manufacturer records: 2,806.
- `BRAND_SAFE` and eligible for indexing: 267.
- `BRAND_WEAK`: 2,516, served as `noindex, follow` RFQ pages.
- `BRAND_REVIEW`: 23, served as `noindex, follow` until identity or source
  blockers are resolved.
- Manufacturer sitemap URLs prepared in current source: 267.
- Product sitemap URLs: 0.
- Public/remote product records: 0.

## Metadata quality

Each `BRAND_SAFE` page uses its canonical brand name as H1. Its English title
combines the brand with its strongest confirmed product area, and its English
meta description uses confirmed product groups plus a neutral RFQ action.

- Unique titles: 267 of 267.
- Unique meta descriptions: 267 of 267.
- Duplicate titles: 0.
- Duplicate meta descriptions: 0.
- Missing canonical, Open Graph or required schema findings: 0.
- Product, Offer, Review and AggregateRating schema pages: 0.

Primary intent follows `{Brand} + {confirmed product area}`. Secondary intent
is neutral international equipment sourcing and RFQ review; it never implies
an authorised relationship.

## Content and evidence quality

- English short descriptions: 267.
- English full descriptions: 267.
- Profiles with category evidence: 267.
- Profiles with family or series evidence: 251.
- Official source records: 465.
- Tier A source records: 464.
- Word-trigram Jaccard comparisons: 35,511.
- Near-duplicate findings at threshold 0.72: 0.
- Forbidden dealer, representative, stock, price or warranty claims: 0.

Public prose is generated from explicit Brand Facts derived from first-party
sources. Imported SKU data is absent from the international runtime and cannot
enter public manufacturer copy. Technical parameters are not inferred from a
family or category relationship.

## Structured data, linking and logos

Indexable brand pages emit `Brand` and `BreadcrumbList` data matching visible
content. The internal path is Home → Manufacturers → Brand, with no links to
hidden products. Official sources open as external links without partnership
claims.

105 indexable pages have an exact canonical-ID, publishable logo. The remaining
162 use the shared text fallback. The registry retains 524 publishable
candidates; no logo was mapped by fuzzy name and no favicon, reseller logo or
generated approximation was accepted.

## Category opportunity

The current evidence map is strongest for pumps (72 brands), automation and
control (55), industrial valves and flow control (55), industrial sensors
(48), drive and motion control (46), electric motors (40), measurement (36),
and geared drives (20). These counts support future editorial review but do not
publish new category URLs in this sprint.

## Next source queue

The fastest next cohort begins with MIL S, BLACKMER, BRAN+LUEBBE, GENERAL
KINEMATICS, KRAFTMANN, MAGNESCALE, MUELLER STEAM SPECIALTY, NIMCO,
RICHARDSON ELECTRONICS, TIMMER, URACA, WILDEN, BOMAR, BRAIME 4B and FIREYE.

The fastest route toward 500 safe pages remains: confirm identity and one
manufacturer-owned product source, extract the minimum fact graph, generate
English content and metadata, then enrich logos, headquarters, families and
documents in a second pass.
