# Ventrovia International SEO Factory Report

Checked: 2026-08-20

## Factory contract

`BRAND_SAFE` requires canonical identity, a manufacturer-owned source or an
unambiguous official corporate source, no identity conflict, meaningful About
or Products evidence, a confirmed product area, factual English copy, unique
title and meta description, safe RFQ language and no unsupported commercial
claim.

The factory follows `official source → Brand Facts → English content → SEO`.
Logos never verify identity, missing logos do not block safe content, and
manufacturer logos are not recoloured.

## Sprint 19 result

| Metric | Before | After |
| --- | ---: | ---: |
| Manufacturer identities | 2,806 | 2,806 |
| BRAND_SAFE | 500 | 816 |
| BRAND_WEAK | 2,261 | 1,872 |
| BRAND_REVIEW | 45 | 118 |
| BRAND_COMPLETE | 434 | 654 |
| Official domains | 500 | 816 |
| Official source records | 1,291 | 1,919 |
| Tier A source records | 1,188 | 1,737 |
| English short descriptions | 500 | 816 |
| English full descriptions | 500 | 816 |
| Brands with family or series evidence | 484 | 800 |
| Confirmed countries | 422 | 714 |
| Confirmed headquarters | 168 | 389 |
| BRAND_SAFE with logo | 136 | 194 |
| Manufacturer sitemap target | 500 | 816 |
| Product sitemap | 0 | 0 |

Sprint 19 processed 389 manufacturers in 20 evidence waves. Of these, 316 met
the strict publication gate and 73 were conservatively assigned to review or a
blocked state. The measured window was 0.8769 hours: 443.59 processed records
per hour and 360.34 new SAFE profiles per hour, with an 81.23% source-to-SAFE
success rate. Parallel source work is included in this wall-clock throughput.

## Factory improvements

- Curated wave files are now discovered deterministically; adding a wave no
  longer requires editing a long import list.
- Generation fails on duplicate profile IDs, duplicate blocked IDs, a
  SAFE/REVIEW conflict or an ID absent from the 2,806-record identity index.
- English category normalisation was extended for hydraulic, logistics,
  combustion, filling, belt-drive, heavy-machinery and fabrication evidence.
- Sprint timing, per-wave yield, SAFE/hour and source-success metrics are now
  reproducible from a versioned processing window.
- The category opportunity model now measures logo, full-content, family and
  Tier A coverage independently from truth verification.

## Quality gates

- Canonical identity/source integrity: PASS.
- Indexable title duplicates: 0.
- Indexable meta-description duplicates: 0.
- Unsupported public commercial claims: 0.
- Systemic near-duplicate descriptions: 0 at the configured threshold.
- Deterministic validation sample: 300 SAFE pages.
- Wrong-logo findings in the published mapping: 0.
- Product routes, product API, product sitemap, Product schema and international
  runtime product records: 0.

## Category opportunity map

The strongest verified clusters are pumps (187 SAFE brands), automation (171),
drives (126), valves (121), measurement (116), sensors (113), electric motors
(109), filtration and water systems (69), gear units (68) and hydraulics (61).
No category or Brand × Category URL is published in this Sprint. See
`VENTROVIA_CATEGORY_SEO_OPPORTUNITIES.md` for the report-only editorial model.

## Bottleneck analysis

Identity and first-party source discovery remain the bottleneck. Once a clear
manufacturer identity and product area are confirmed, the structured English
content, metadata, sitemap and audits are deterministic. Most blockers come from
short generic names, parallel companies with the same name, acquired or legacy
brands whose continuity is unclear, 403-protected official sources and records
that duplicate an existing canonical entity.

The fastest safe improvement is to maintain domain and negative caches, group
targeted discovery by official-site structure, and process clear manufacturer
names concurrently. That can raise SAFE/hour further without relaxing identity
verification; broad crawling, fuzzy logo matching and reseller evidence would
increase risk rather than useful throughput.

## Release boundary

The public application remains manufacturer-only. The private Russian catalogue
archive was neither read nor touched. Product data are not a build input and no
product URL layer has been restored.
