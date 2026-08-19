# Sprint 16 — Ventrovia international expansion

Date: 2026-08-19.

## Before → after

| Metric | Before | After |
| --- | ---: | ---: |
| Manufacturers | 2,806 | 2,806 |
| BRAND_SAFE | 146 | 178 |
| BRAND_WEAK | 2,652 | 2,614 |
| BRAND_REVIEW | 8 | 14 |
| Manufacturer sitemap target | 146 | 178 |
| Product sitemap | 0 | 0 |
| BRAND_SAFE with logo | 102 | 102 |
| BRAND_COMPLETE | 120 | 143 |
| English short descriptions | 146 | 178 |
| English full descriptions | 146 | 178 |
| Official domains | 146 | 178 |
| Tier A source records | 245 | 305 |
| Family-evidence brands | 130 | 162 |
| Public/remote product records | 0 | 0 |

## New BRAND_SAFE cohort

Würges, Numatics, Řetězy Vamberk, BERNSTEIN, Hohner Elektrotechnik,
Bolondi, Svecom, Yamada, COMEPI, Servomech, Viking Pump, Gruner,
NetterVibration, DUNGS, Stallkamp, GMN, SITI, Faggiolati Pumps, HOMA and
Stieber Clutch, INOXPA, Pedrollo, SUCO, APV, Calpeda, IWAKI, Lowara,
John Crane, KRACHT, HydraForce, SANDPIPER and Dixon.

Every new profile has at least one manufacturer-owned Tier A source, factual
English product areas, family or product-line evidence, unique metadata and an
RFQ path. None was promoted from logo evidence alone.

## Conservative review outcomes

INVENT, DATASENSOR, VESTA, SIMOTOP, LARZEP and STMSI remain non-indexable.
Their blockers are ambiguous identity, unresolved legacy/current-brand mapping
or the lack of an accessible manufacturer-owned source. No reseller was used as
primary evidence.

## Quality and SEO controls

- 178 indexable pages have unique English titles and meta descriptions.
- The reproducible word-trigram Jaccard audit compared all 15,753 BRAND_SAFE
  pairs at a 0.72 threshold and found zero near-duplicate pairs.
- The deterministic sample contains all 178 SAFE pages plus 72 WEAK controls.
- Unsupported dealer, distributor, stock, price and warranty claims: zero.
- Wrong identity and wrong-logo findings in the published set: zero.
- Product schema, product sitemap entries, product routes and remotely stored
  product records: zero.

## Visual restoration

The warm pre-rebrand industrial palette is restored while preserving Ventrovia
identity, English copy, `.com` canonical and Dubai contacts. The PDF-derived V
geometry is retained with the corrected wordmark VENTROVIA. Site-color, light,
dark, monochrome, symbol, horizontal, tagline, favicon/app and social variants
are available. The automated blue-regression audit reports zero first-party
blue leftovers; official third-party manufacturer logos keep their own colors.

## Infrastructure boundary

No DNS, SSL, domain-binding, networking or `.ru` detach action was performed.
Timeweb ticket `#12495561` remains the routing authority. Mail remains
`BLOCKED_MAILBOX_ACCESS`; forms remain `SAFE_FAILURE`. These blockers do not
change the correctness of the source or the manufacturer-only build.

Sites mirror version 116 was published successfully from exact source commit
`14b97b6`. Runtime checks returned 200 for Home, Manufacturers and the new
INOXPA profile; `/catalog`, a legacy SKU route and the product API returned 404.
The deployed sitemap contains 178 manufacturer URLs and zero product URLs.

## Performance

- Public client JavaScript: 386,450 bytes across 26 files.
- `/manufacturers` server render: 19.33 ms median, 64.20 ms p95.
- Source-backed manufacturer page: 1.75 ms median, 6.77 ms p95.
- Homepage server render: 1.93 ms median, 2.75 ms p95.
- Manufacturer search over 2,806 identities: 0.290 ms median, 0.334 ms p95.
