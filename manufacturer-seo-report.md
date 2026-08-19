# Manufacturer SEO report

Checked: 2026-08-19

## Indexation surface

- Canonical manufacturer records: 2,806.
- `BRAND_SAFE` and eligible for indexing: 324.
- `BRAND_WEAK`: 2,451, served as `noindex, follow` RFQ pages.
- `BRAND_REVIEW`: 31, served as `noindex, follow` until identity or source
  blockers are resolved.
- Manufacturer sitemap URLs prepared in current source: 324.
- Product sitemap URLs: 0.
- Public/remote product records: 0.

## Metadata quality

Each `BRAND_SAFE` page uses its canonical brand name as H1. Its English title
combines the brand with its strongest confirmed product area, and its English
meta description uses confirmed product groups plus a neutral RFQ action.

- Unique titles: 324 of 324.
- Unique meta descriptions: 324 of 324.
- Duplicate titles: 0.
- Duplicate meta descriptions: 0.
- Missing canonical, Open Graph or required schema findings: 0.
- Product, Offer, Review and AggregateRating schema pages: 0.

Primary intent follows `{Brand} + {confirmed product area}`. Secondary intent
is neutral international equipment sourcing and RFQ review; it never implies
an authorised relationship.

## Content and evidence quality

- English short descriptions: 324.
- English full descriptions: 324.
- Profiles with category evidence: 324.
- Profiles with family or series evidence: 308.
- Official source records: 567.
- Tier A source records: 566.
- Word-trigram Jaccard comparisons: 52,326.
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

112 indexable pages have an exact canonical-ID, publishable logo. The remaining
212 use the shared text fallback. The registry retains 524 publishable
candidates; no logo was mapped by fuzzy name and no favicon, reseller logo or
generated approximation was accepted.

## Category opportunity

The current evidence map is strongest for pumps (88 brands), automation and
control (71), industrial valves and flow control (59), industrial sensors
(57), drive and motion control (53), measurement (50), electric motors (42),
and filtration and water systems (31). These counts support future editorial review but do not
publish new category URLs in this sprint.

## Next source queue

The fastest next cohort begins with REGINA GROUP, SCANCON, STROMAG, VON ROHR
ARMATUREN, BEGE AANDRIJFTECHNIEK, COMARME, HELMUT FISCHER, GRAYMILLS, KRAL,
NAVCO, POMPETRAVAINI, SCHECHTL, SIREM, SWEP and TOREX.

The fastest route toward 500 safe pages remains: confirm identity and one
manufacturer-owned product source, extract the minimum fact graph, generate
English content and metadata, then enrich logos, headquarters, families and
documents in a second pass.
