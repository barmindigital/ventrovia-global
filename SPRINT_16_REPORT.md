# Sprint 16 — Ventrovia international expansion

Date: 2026-08-19.

## Outcome

The verified manufacturer surface increased from 146 `BRAND_SAFE` pages at
the start of Sprint 16 to 250 in the current validated source. The latest
factory continuation began at 178 and added 72 `BRAND_SAFE` profiles while
moving seven uncertain records to `BRAND_REVIEW` instead of guessing.

No Git push, Timeweb deployment, DNS change, domain-binding change or `.ru`
detach was performed. Ticket `#12495561` remains the authority for the
Timeweb routing incident. The private Russian catalogue archive was not read,
copied, connected, committed or deployed.

## Before → current validated source

| Metric | Sprint start | Current source |
| --- | ---: | ---: |
| Manufacturers | 2,806 | 2,806 |
| BRAND_SAFE | 146 | 250 |
| BRAND_WEAK | 2,652 | 2,535 |
| BRAND_REVIEW | 8 | 21 |
| Manufacturer sitemap target | 146 | 250 |
| Product sitemap | 0 | 0 |
| BRAND_SAFE with logo | 102 | 103 |
| BRAND_COMPLETE | 120 | 207 |
| English short descriptions | 146 | 250 |
| English full descriptions | 146 | 250 |
| Official domains | 146 | 250 |
| Tier A source records | 245 | 433 |
| Family-evidence brands | 130 | 234 |
| Countries confirmed | — | 196 |
| Headquarters confirmed | — | 41 |
| Public/remote product records | 0 | 0 |

## Latest source-backed cohorts

Wave 7 added: LEESON, BEI Sensors, REMAK, Liverani, AIRTEC, Atos, ESPA,
STASTO, Carpanelli, Hamworthy, Wachendorff, Ashcroft, Baldor-Reliance,
Italsensor, ECOFIT, Marsh Bellofram, Parvalux, Valpres, DEBEM, OME Motors,
Waukesha Cherry-Burrell, ATLANTA, and Hilliard / HILCO.

Wave 8 added: Goulds Pumps, DAMEL, Marzocchi Pompe, Metal Work Pneumatic,
ClydeUnion Pumps, DESTACO, Gefran, Hokuyo, FLUX, Mono Pumps, Paglierani,
Profroid, Ascon Tecnologic, Bernio Elettromeccanica, Bronkhorst,
Erhardt+Leimer, LABOM, Lika Electronic, and Rotork.

Wave 9 added: ESA Pyronics, Sensorex, BERG Spanntechnik, Brooks Instrument,
Huba Control, InterApp, Pneumax, Comet Yxlon, KABELSCHLEPP, Kadant Johnson,
Pulsafeeder, Schischek, Relpol, co-ax, ipf electronic, WAMGROUP, TECOFI,
di-soric, and OBL.

Wave 10 added: Honeywell Kromschröder, Gambarotta, CYTEC, ISOIL Industria,
Dresser-Rand, NASH, SONDERMANN, Speroni, Verderair, Barksdale and Johnson Pump.

Every promotion has a canonical identity, at least one manufacturer-owned
identity/product source, confirmed product areas, English content, unique SEO
metadata and a neutral RFQ path. Logo presence did not verify an identity and
was not required for `BRAND_SAFE`.

## Conservative review outcomes

FREUND, SPECKEN-DRUMAG, Wheatley Pump, PRISMA, CHAMPION, AECO and Nocchi were not
promoted in the latest continuation. Their recorded blockers are ambiguous
identity, unresolved current ownership or insufficient accessible first-party
product evidence. The negative cache prevents immediate repeat research.

## Factory outputs

- `mass-brand-source-results.json`: all 2,806 manufacturers with status,
  priority, effort class, sources, facts, logo state and blocker.
- `brand-source-cache.json`: reusable positive and negative source cache.
- `international-brand-semantic-map.json`: all 250 safe brands with confirmed
  categories, families, SEO intent and evidence coverage.
- `category-opportunity-report.json`: evidence-counted category opportunities;
  it creates no public category URLs.
- `processing-metrics.json`: 271 historically processed source records,
  250 safe and 21 review, 92.25% source-to-safe yield, and 1.74 sources per
  safe profile. Hourly throughput remains `NOT_MEASURED` because historical
  waves did not record elapsed time; no fabricated rate is reported.

## Quality and SEO controls

- 250 indexable pages have unique English titles and meta descriptions.
- The word-trigram Jaccard audit compared all 31,125 `BRAND_SAFE` pairs at a
  0.72 threshold and found zero near-duplicate pairs.
- The deterministic sample contains all 250 safe pages.
- Unsupported dealer, distributor, stock, price and warranty claims: zero.
- Automated published-set wrong-identity and wrong-logo findings: zero.
- Product schema, product sitemap entries, product routes and remotely stored
  product records: zero.
- First-party blue-regression findings: zero; manufacturer logos retain their
  official colours.

## Category opportunity snapshot

The strongest evidence-backed future editorial candidates are pumps (71 safe
brands), automation and control (49), industrial valves and flow control
(48), drive and motion control (45), industrial sensors (44), electric motors
(39), measurement and instrumentation (31), and geared drives (19). These are
reports only: no Brand × Category or public category pages were created.

## Deployment boundary

The current validated local source targets 250 manufacturer URLs. The existing
Sites mirror remains on its previously published 178-page version; the new
factory wave was deliberately not published because Sprint 16 imposes a hard
no-push rule until Timeweb ticket `#12495561` is closed. Timeweb was not
deployed. Product sitemap and product runtime remain zero in source.

Mail remains `BLOCKED_MAILBOX_ACCESS`; forms remain `SAFE_FAILURE`. These are
separate from the source and Brand Knowledge quality gates.
