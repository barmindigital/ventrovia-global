# Brand SEO strategy

## Current public surface

The public acquisition surface consists of `/manufacturers` and evidence-backed manufacturer pages. The product catalog remains disabled, product sitemap count remains zero, and no manufacturer page may expose SKU, product cards, product counts or links to hidden products.

## Publication order

1. **Manufacturer page** — the current unit of publication. It requires a verified canonical identity, an official Tier A/B source, useful source-backed Russian content, factual metadata and no identity conflict.
2. **Manufacturer × Category page** — a future unit, not published in Sprint 14. It will require a BRAND_SAFE manufacturer, an officially evidenced category relationship, enough distinct content to answer category intent and an explicit publication gate.
3. **Category page** — future editorial layer built from verified relationships, never from raw PIM counts.
4. **Industry page** — future layer requiring direct official application/industry evidence. Product type alone cannot prove an industry.

## Search intent

Each manufacturer page selects one primary intent from its strongest officially confirmed product group, plus restrained equipment and RFQ secondary intents. H1 remains the canonical brand name. Titles and descriptions must be unique and factual; dealer status, availability, price, stock and representation claims are forbidden without explicit evidence.

## Brand × Category candidates

The server-side report `data/brand-knowledge/brand-category-candidates.json` is the only current hand-off for the next landing-page layer. Every record contains the manufacturer, normalized public category label, evidence scope and source, proposed intent and content readiness. All records are `CANDIDATE_NOT_PUBLISHED`; the report creates no URL.

Before any candidate can be published, the next sprint must add:

- a dedicated indexability and duplicate-content gate;
- page-level unique content assembled only from Brand Facts;
- canonical and sitemap policy;
- deterministic semantic sampling;
- proof that the page adds value beyond the parent manufacturer page.

## Measurement plan

When Search Console, Yandex Webmaster or Metrica is connected by an authorized operator, measure brand impressions, non-brand category impressions, RFQ events, specification uploads, zero-result manufacturer searches and brand-page assisted conversions. No external analytics integration is implied or enabled by this document.

## Scale rules

- Grow manufacturer coverage in reviewed batches of 20–50.
- Prefer BRAND_WEAK records that already have an exact canonical logo mapping or a strong official-domain candidate, but never treat either as identity proof.
- Cache source checks and respect 403, 429, authentication, CAPTCHA and robots restrictions.
- Keep BRAND_WEAK and BRAND_REVIEW `noindex, follow`.
- Keep product URLs, product schema and product sitemap entries at zero while catalog visibility is disabled.
