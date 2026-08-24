# Ventrovia International SEO Factory Report

Checked: 2026-08-24

## Factory contract

`BRAND_SAFE` requires a canonical identity, manufacturer-owned or unambiguous
official corporate evidence, no identity conflict, meaningful About or Products
evidence, a confirmed product area, factual English content, unique metadata,
safe RFQ language and no unsupported commercial claim.

The pipeline remains `official source → Brand Facts → English content → SEO`.
Logos do not verify identity, missing logos do not block publication, and
manufacturer logos are not recoloured.

## Sprint 21 result

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Manufacturer identities | 2,806 | 2,806 | 0 |
| BRAND_SAFE | 830 | 1,607 | +777 |
| BRAND_WEAK | 1,858 | 898 | -960 |
| BRAND_REVIEW | 118 | 301 | +183 |
| BRAND_COMPLETE | 668 | 1,214 | +546 |
| Official domains | 830 | 1,607 | +777 |
| Official source records | 1,948 | 3,158 | +1,210 |
| Tier A source records | 1,766 | 2,928 | +1,162 |
| English short descriptions | 830 | 1,607 | +777 |
| English full descriptions | 830 | 1,607 | +777 |
| Family or series evidence | 814 | 1,591 | +777 |
| Confirmed countries | 728 | 1,441 | +713 |
| Confirmed headquarters | 402 | 797 | +395 |
| BRAND_SAFE with logo | 198 | 348 | +150 |
| Manufacturer sitemap target | 830 | 1,607 | +777 |
| Product sitemap | 0 | 0 | 0 |

The measured processing window was 2.0183 hours. The factory processed 960
records, published 777, and conservatively moved 183 to review or a blocked
state. Throughput was 475.64 processed records/hour and 384.97 SAFE/hour, with
an 80.94% source-to-SAFE success rate. Parallel source work is included in this
wall-clock measurement.

## Quality gates

- Canonical identity and source integrity: PASS.
- Duplicate current-company identity found during the final audit: one Moog GAT
  duplicate was demoted to `DUPLICATE_CANONICAL_CANDIDATE` before release.
- Indexable titles: 1,607 unique; duplicates: 0.
- Indexable meta descriptions: 1,607 unique; duplicates: 0.
- Content similarity: 1,290,421 pairs checked; findings: 0 at threshold 0.72.
- Deterministic validation sample: 500 SAFE pages.
- Product schema pages: 0.
- Public or remotely stored product records: 0.

## Category opportunity map

The largest confirmed clusters are automation (346 SAFE brands), pumps (287),
measurement (236), industrial machinery (233), valves (224), sensors (196),
drives (177), electric motors (161), filtration and water systems (154),
thermal management (124), hydraulics (118), geared drives (96), and pneumatics
(88).

No category or Brand × Category URL was published. The machine-readable source
is `data/brand-operations/category-opportunity-report.json`; the editorial
recommendations are in `VENTROVIA_CATEGORY_SEO_OPPORTUNITIES.md`.

## Logo result

Exact reviewed registry reuse increased SAFE logo coverage from 198 to 348.
Coverage was not doubled because fuzzy matching, favicons and reseller assets
remain prohibited. The safe next logo wave should target high-value SAFE brands
through official media kits and manufacturer-owned press resources.

## Bottleneck and next optimisation

Identity resolution and first-party source discovery remain the bottleneck.
Content and SEO generation are deterministic after the evidence gate. The most
effective next optimisation is to reuse the official-domain and negative caches,
prioritise the remaining unambiguous manufacturer names, and group discovery by
known official-site structure. This improves throughput without introducing a
broad crawler or weakening identity verification.

## Runtime boundary

The application remains manufacturer-only. The private Russian catalogue and
customer handoff were not read or changed. Product routes, product search,
product API, product sitemap and Product schema remain absent.
