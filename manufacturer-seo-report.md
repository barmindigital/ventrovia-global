# Manufacturer SEO report

Checked: 2026-08-19

## Indexation surface

- Canonical manufacturer records: 2,806.
- `BRAND_SAFE` and indexable: 178.
- `BRAND_WEAK`: 2,614, served as `noindex, follow` RFQ pages.
- `BRAND_REVIEW`: 14, served as `noindex, follow` until identity or source blockers are resolved.
- Manufacturer sitemap URLs prepared in source: 178.
- Product sitemap URLs: 0.
- Product catalog public flag: disabled.

## Metadata quality

Every `BRAND_SAFE` page uses its canonical brand name as H1. Its title pairs that name with the leading officially confirmed product group, while the meta description uses up to three confirmed product groups and a neutral RFQ action. The generated audit records 178 unique titles, 178 unique meta descriptions, no missing canonicals, no missing Open Graph metadata and no duplicate metadata.

Primary intent follows the factual form `{Brand} + {confirmed product group}`. Secondary intent is neutral international equipment sourcing and RFQ review; it does not imply an authorized relationship.

## Content quality

- Unique short descriptions: 178.
- Unique full descriptions: 178.
- Profiles with category evidence: 178.
- Profiles with family evidence: 162.
- Tier A source records: 305.
- Word-trigram Jaccard findings across all 15,753 profile pairs at threshold 0.72: 0.
- Forbidden dealer, representative, stock, price or warranty claims: 0.

Descriptions are composed from explicit Brand Facts and sources. Imported SKU data can prioritize research but cannot enter public brand copy. Technical parameters are not inferred from family or category relationships.

The deterministic validation set now contains 250 records: all 178 indexable
profiles plus 72 noindex controls. Its source, content, logo and readiness
checks are regenerated with every Brand Knowledge release instead of remaining
as a historical static snapshot.

## Structured data and links

Indexable brand pages emit `Brand` and `BreadcrumbList` structured data matching visible content. They do not emit `Product`, `Offer`, `AggregateRating` or review data. The internal path is Home → Manufacturers → Brand; no brand page links to hidden products. Official websites and documentation open as external links without partnership claims.

## Logos and visual quality

102 indexable pages have an exact canonical-ID, publishable logo. The remaining 76 use the shared text fallback. The registry keeps 524 publishable candidates; no logo was mapped by fuzzy name, and no favicon, reseller logo or generated approximation was accepted.

## Technical health

The manufacturer sitemap is generated from the compact readiness index. Full descriptions and evidence stay server-side. The directory sends only card-level display fields, while product counts remain suppressed. Product APIs, searches, catalog listings and product sitemap entries remain closed.

## Next opportunities

The fastest path to 500 safe pages is cohort source work, not template expansion: verify manufacturer-owned domains, capture one About/identity source and one Products/Solutions source, write source-traceable English copy, then reuse exact registry logos where available. The current next queue begins with LEESON Electric, Wheatley Pump, BEI Sensors, Remak, Freund, Liverani, Airtec, ATOS, ESPA Pumps, STASTO, Carpanelli, Hamworthy, Precilec, Wachendorff and Ashcroft.

Future Google Search Console and Bing Webmaster Tools measurement should segment `/manufacturers`, canonical brand pages, indexed versus noindex readiness, brand-name queries, category-qualified brand queries, impressions, clicks, average position and RFQ conversions. Yandex may remain secondary. No analytics result is asserted until those systems are connected.
