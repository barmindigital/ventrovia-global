# Ventrovia International SEO Factory Report

Checked: 2026-08-19

## Factory contract

`BRAND_SAFE` requires canonical identity, a manufacturer-owned source or
official corporate source, no identity conflict, meaningful About or Products
evidence, a confirmed product area, factual English copy, unique title and
meta description, safe RFQ language and no unsupported commercial claim.

The factory follows: `official source → Brand Facts → English content → SEO`.
Logos never verify identity, missing logos do not block safe content, and
manufacturer logos are not recoloured.

## Current result

| Metric | Value |
| --- | ---: |
| Manufacturer identities | 2,806 |
| BRAND_SAFE | 324 |
| BRAND_WEAK | 2,451 |
| BRAND_REVIEW | 31 |
| Official domains | 324 |
| Official source records | 567 |
| Tier A source records | 566 |
| English short descriptions | 324 |
| English full descriptions | 324 |
| Brands with family/series evidence | 308 |
| BRAND_COMPLETE | 270 |
| BRAND_SAFE with logo | 112 |
| Manufacturer sitemap target | 324 |
| Product sitemap | 0 |

The latest seven batches processed 163 manufacturers: 146 became `BRAND_SAFE`
and 17 were conservatively assigned `BRAND_REVIEW`. Across all recorded
source work, the source-success rate is 91.27%. Historical processing duration
was not captured, so hourly throughput metrics are intentionally reported as
`NOT_MEASURED`.

## Source discovery and cache

The generated source cache stores verified URLs, source type, scope, tier,
HTTP state and check date. Negative outcomes preserve the blocker and attempted
URLs, preventing repeated work on ambiguous or unavailable sources. External
temporary blockers receive a review date; permanent identity conflicts do not
receive an automatic retry date.

The mass result index assigns every manufacturer an effort class:

- `FAST`: already safe or has a usable exact logo mapping that can accelerate
  the visual pass after identity verification.
- `NORMAL`: high-priority unresolved identities.
- `EXPENSIVE`: lower-priority unresolved identities.
- `BLOCKED`: a recorded ambiguity or source blocker.

## Quality gates

- Identity audit: PASS.
- Content audit: PASS; unsupported commercial claims 0.
- Metadata audit: 324 unique titles and 324 unique descriptions.
- Similarity audit: 52,326 pair comparisons, 0 findings at 0.72.
- Deterministic sample: 324 records, including every current safe page.
- Logo gate: no fuzzy-only mapping and no product image used as a logo.
- Blue regression: 0 first-party findings.
- Visibility boundary: product routes, product API, product sitemap, product
  schema and remote product records remain 0.

## Category opportunity map

The report-only semantic map identifies these strongest future editorial
clusters:

| Confirmed category | Safe brands |
| --- | ---: |
| Pumps and pumping systems | 88 |
| Industrial automation and control | 71 |
| Industrial valves and flow control | 59 |
| Industrial sensors | 57 |
| Drive and motion-control systems | 53 |
| Measurement and instrumentation | 50 |
| Electric motors | 42 |
| Filtration and water systems | 31 |
| Pneumatic equipment | 23 |
| Gear units and geared drives | 21 |

No Brand × Category URLs are created. The counts only identify where a future
editorial layer may have enough verified coverage for a separate feasibility
review.

## Bottleneck analysis

The bottleneck is identity and first-party source discovery, not English copy,
metadata, logos or build time. Once a manufacturer-owned identity and product
area are confirmed, the structured conversion and audit path is deterministic.
Short generic names, acquired brands, inaccessible sites and legacy ownership
produce most review outcomes.

The next optimisation should add measured batch timestamps and source-attempt
durations. That will produce honest processed/hour and safe/hour values without
changing verification standards. A universal crawler is not justified; the
current targeted homepage/About/Products/catalogue path has the better risk and
effort profile.

## Next queue

The next 30 are REGINA GROUP, SCANCON, STROMAG, VON ROHR ARMATUREN, BEGE
AANDRIJFTECHNIEK, COMARME, HELMUT FISCHER, GRAYMILLS, KRAL, NAVCO,
POMPETRAVAINI, SCHECHTL, SIREM, SWEP, TOREX, BAUER GEAR MOTOR, BONETTI,
BUSCH VACUUM, DESMI, DRASTAR, EBAWE, LUEBBERING, MGM, MOOG GAT, OLAER,
OSLV ITALIA, REDEX, SIMACO, SPITZENREITER and STONE.

## Release boundary

This factory output is validated locally only. It is not pushed to GitHub,
Timeweb or Sites while Timeweb ticket `#12495561` remains open. DNS, SSL,
domain bindings and `industriapostavok.ru` remain untouched. The private
Russian catalogue archive remains outside the project and unused.
