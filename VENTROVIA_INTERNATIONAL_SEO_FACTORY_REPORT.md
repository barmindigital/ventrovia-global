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
| BRAND_SAFE | 220 |
| BRAND_WEAK | 2,566 |
| BRAND_REVIEW | 20 |
| Official domains | 220 |
| Official source records | 381 |
| Tier A source records | 380 |
| English short descriptions | 220 |
| English full descriptions | 220 |
| Brands with family/series evidence | 204 |
| BRAND_COMPLETE | 180 |
| BRAND_SAFE with logo | 102 |
| Manufacturer sitemap target | 220 |
| Product sitemap | 0 |

The latest two batches processed 48 manufacturers: 42 became `BRAND_SAFE` and
six were conservatively assigned `BRAND_REVIEW`. The source-success rate for
these batches was 87.5%. Historical processing duration was not captured, so
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
- Metadata audit: 220 unique titles and 220 unique descriptions.
- Similarity audit: 24,090 pair comparisons, 0 findings at 0.72.
- Deterministic sample: 250 records, including every current safe page.
- Logo gate: no fuzzy-only mapping and no product image used as a logo.
- Blue regression: 0 first-party findings.
- Visibility boundary: product routes, product API, product sitemap, product
  schema and remote product records remain 0.

## Category opportunity map

The report-only semantic map identifies these strongest future editorial
clusters:

| Confirmed category | Safe brands |
| --- | ---: |
| Pumps and pumping systems | 63 |
| Drive and motion-control systems | 40 |
| Industrial valves and flow control | 40 |
| Electric motors | 39 |
| Industrial sensors | 36 |
| Industrial automation and control | 31 |
| Measurement and instrumentation | 23 |
| Gear units and geared drives | 19 |
| Filtration and water systems | 17 |
| Linear-motion components | 16 |

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

The next 30 are PRECILEC, KONETEOLLISUUS, ESA Pyronics, Sensorex, Berg
Spanntechnik, Brooks Instrument, Elster Kromschröder, Huba Control, InterApp,
Relpol, co-ax, ipf electronic, Nocchi, Pneumax, YXLON, Gambarotta, Krombach,
OBL, Kabelschlepp, Kadant Johnson, Pulsafeeder, Schischek, WAMGROUP, CyTec
Zylindertechnik, ISOIL, Johnson Pump, TECOFI, di-soric, Dresser-Rand and
Hydropa.

## Release boundary

This factory output is validated locally only. It is not pushed to GitHub,
Timeweb or Sites while Timeweb ticket `#12495561` remains open. DNS, SSL,
domain bindings and `industriapostavok.ru` remain untouched. The private
Russian catalogue archive remains outside the project and unused.
