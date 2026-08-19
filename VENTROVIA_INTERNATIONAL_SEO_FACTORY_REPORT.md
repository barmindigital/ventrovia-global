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
| BRAND_SAFE | 300 |
| BRAND_WEAK | 2,481 |
| BRAND_REVIEW | 25 |
| Official domains | 300 |
| Official source records | 524 |
| Tier A source records | 523 |
| English short descriptions | 300 |
| English full descriptions | 300 |
| Brands with family/series evidence | 284 |
| BRAND_COMPLETE | 250 |
| BRAND_SAFE with logo | 108 |
| Manufacturer sitemap target | 300 |
| Product sitemap | 0 |

The latest six batches processed 133 manufacturers: 122 became `BRAND_SAFE`
and 11 were conservatively assigned `BRAND_REVIEW`. Across all recorded
source work, the source-success rate is 92.31%. Historical processing duration was not captured, so
hourly throughput metrics are intentionally reported as `NOT_MEASURED`.

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
- Metadata audit: 300 unique titles and 300 unique descriptions.
- Similarity audit: 44,850 pair comparisons, 0 findings at 0.72.
- Deterministic sample: 300 records, including every current safe page.
- Logo gate: no fuzzy-only mapping and no product image used as a logo.
- Blue regression: 0 first-party findings.
- Visibility boundary: product routes, product API, product sitemap, product
  schema and remote product records remain 0.

## Category opportunity map

The report-only semantic map identifies these strongest future editorial
clusters:

| Confirmed category | Safe brands |
| --- | ---: |
| Pumps and pumping systems | 79 |
| Industrial automation and control | 64 |
| Industrial valves and flow control | 57 |
| Industrial sensors | 53 |
| Drive and motion-control systems | 50 |
| Measurement and instrumentation | 42 |
| Electric motors | 41 |
| Filtration and water systems | 29 |
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

The next 30 are MIL S, Jabsco Pump, LTN Servotechnik, Price Pump, SERA,
TSCHAN, Tsurumi Pump, Urlinski, Welch, CLA-VAL, DURAG Group, Flygt, GEMELS,
Hengesbach, INFICON, Nicotra Gebhardt, Rossi Motoriduttori, SPCO, Verderflex,
Warner Electric, AViTEQ, CIB UNIGAS, Drive Systems, FUNKE, Grindex, Harmonic
Drive, Hurco, Hydra-Cell, Indufil and Permco.

## Release boundary

This factory output is validated locally only. It is not pushed to GitHub,
Timeweb or Sites while Timeweb ticket `#12495561` remains open. DNS, SSL,
domain bindings and `industriapostavok.ru` remain untouched. The private
Russian catalogue archive remains outside the project and unused.
