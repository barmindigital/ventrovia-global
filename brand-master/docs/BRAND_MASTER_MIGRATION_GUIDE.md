# Brand Master migration guide

This guide describes how to connect the Brand Master to a new website or data platform without depending on the current application.

## 1. Verify the package

1. Verify the archive SHA-256 supplied beside the archive.
2. Extract it into a clean directory.
3. Run `node tests/portable-test.mjs .` from the package root.
4. Compare the reported counts with `BRAND_MASTER_MANIFEST.json`.

The validation requires only a current Node.js runtime and reads no files outside the package.

## 2. Import stable identity fields first

Create the brand table using `id`, `canonicalName`, `displayName`, `slug`, `aliases`, `formerNames`, `identityStatus` and `publicationStatus`.

- Keep `id` immutable and use it for relationships.
- Keep `slug` stable for canonical URLs.
- Do not derive IDs from display names during import.
- Do not publish REVIEW records as confirmed manufacturers.

## 3. Import factual profile data

For SAFE records, import official-domain, location, description, category, family, series, industry and document fields. Keep nullable fields nullable; do not invent default countries, headquarters or founded years.

Descriptions are site-neutral. Add the new site's sourcing or commercial language in a presentation layer, not inside Brand Master.

## 4. Import sources separately

Load `data/brand-sources.json` into a source table keyed by `sourceId`. Connect brands through `sourceRecordIds`.

Recommended model:

- `brands`
- `brand_sources`
- `brand_categories`
- `brand_families`
- `brand_aliases`
- `brand_assets`
- `brand_review_state`

Keep evidence and review data server-side unless the new product explicitly needs to expose a selected official link.

## 5. Connect categories

Use `data/brand-category-taxonomy.json` as the controlled vocabulary. Category IDs are portable identifiers; labels are English display values. Preserve relation evidence state.

Do not convert category membership into product-level claims. Brand Master describes manufacturer scope, not a catalogue of orderable products.

## 6. Connect logos

Logo paths are relative to the package root. Copy `brand-assets/logos/` into the new media store while retaining:

- the stable brand relationship;
- the original checksum;
- source and rights metadata;
- the original file format where supported.

Generate thumbnails or WebP derivatives only as technical derivatives. Do not recolour or redraw manufacturer marks. Respect `presentationBackground`: official white/reverse marks require a neutral dark container, while `light` assets require a light container. Use a text fallback when `logo` is `null`.

## 7. Build the directory and pages

- Directory: list all 2,806 identities if desired, but distinguish SAFE from REVIEW in publication policy.
- Public manufacturer pages: publish SAFE records only unless the new site's editorial policy explicitly supports unresolved placeholders.
- Search: index canonical name, display name and safe name aliases.
- Page content: use factual descriptions and categories from Brand Master.
- Commercial CTA: add the new site's wording separately.

## 8. Preserve aliases and redirects

Read `data/brand-slug-aliases.json`.

- `safeAliasSlugs` may be used as redirect candidates after route-level review.
- `blockedAliasSlugs` must not be redirected automatically because they collide with a canonical slug or another identity.
- Never auto-merge records from alias similarity alone.

## 9. Build SEO at presentation time

Use `seo.titleCore` and append the new site's suffix at render time. Use `seo.metaFactual` as the factual component of the meta description; add a site CTA separately only if accurate.

Do not carry the old site's canonical host, suffix or RFQ wording into the new implementation. Canonicals, Open Graph URLs, structured data and sitemap URLs belong to the new site configuration.

## 10. Keep REVIEW honest

Use `data/brand-review-queue.json` as the research queue. It contains blocker categories, reason text, attempted URLs and a bounded-research cohort. A successful review must add authoritative identity and product-scope evidence before promotion.

Possible duplicates are candidates only. Preserve both stable IDs until a human-reviewed merge plan defines the canonical survivor and redirect behavior.

## 11. Framework examples

Any framework can load `data/brand-master.json` or import it into a database. The export has no React, Next.js, Vinext, Timeweb, Sites or domain dependency. For large public directories, keep the full evidence graph server-side and send only display fields required by the current result page to the browser.

## 12. Acceptance checks for the new site

- 2,806 unique stable IDs and slugs imported.
- SAFE and REVIEW counts match the manifest.
- No REVIEW identity is silently published as confirmed.
- Source-record relationships resolve.
- Logo checksums match and no logo is attached to the wrong ID.
- Alias collisions are handled conservatively.
- SEO titles use the new site's suffix and host.
- Brand descriptions contain no previous-site presentation copy.
- No product catalogue is inferred from Brand Master.
