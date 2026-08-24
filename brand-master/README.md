# Industrial Brand Master

This directory is the versioned, framework-neutral export source for the manufacturer database. It contains 2,806 stable brand identities, source-backed profiles where identity is confirmed, an explicit REVIEW state where it is not, portable SEO core data, a controlled category vocabulary, source records, alias routing data and quality reports.

The current repository does not duplicate logo binaries in this directory. Run the package command to assemble the complete transferable package with `brand-assets/logos/`, validate it independently and create a compressed archive outside the repository.

## Principles

- Stable brand IDs and canonical slugs are preserved.
- BRAND_SAFE and BRAND_REVIEW are verification states, not completeness scores.
- REVIEW records do not assert an official domain, description, category or logo.
- Manufacturer facts are separated from site-specific presentation and calls to action.
- SEO titles are stored as suffix-free `titleCore` values.
- Logo files are included only for confirmed identities with publishable mappings.
- No current website framework, hosting provider, domain, credentials or product-catalog data is required.

## Contents

- `data/brand-master.json` — primary lossless export.
- `data/brand-master.csv` — UTF-8 review/import view; nested data remains authoritative in JSON.
- `data/brand-sources.json` — normalized official-source registry.
- `data/brand-slug-aliases.json` — canonical slugs and collision-aware alias candidates.
- `data/brand-category-taxonomy.json` — controlled English category vocabulary.
- `data/brand-review-queue.json` — unresolved identity blockers and retry cohort.
- `data/brand-seo-semantic-map.json` — site-neutral SEO core and intent data.
- `data/brand-content-quality-audit.json` — exact and near-duplicate audit for portable English content.
- `data/brand-completeness.json` — per-brand field coverage.
- `data/brand-logo-gaps.json` — SAFE profiles without a verified logo.
- `data/brand-duplicate-candidates.json` — candidates only; no automatic merges.
- `BRAND_MASTER_MANIFEST.json` — counts, policies, sizes and SHA-256 checksums.
- `docs/` — schema and migration guidance.
- `reports/` — unresolved, duplicate, logo, completeness and content-portability summaries.

## Validation

The portability test uses only the Node.js standard library. In an assembled customer package, run:

```sh
node tests/portable-test.mjs .
```

The test loads the export without React, Next.js, Vinext, Timeweb, Sites or the current domain.
