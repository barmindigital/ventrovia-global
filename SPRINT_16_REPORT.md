# Sprint 16 — Ventrovia international expansion

Date: 2026-08-19.

## Outcome

The verified manufacturer surface increased from 146 `BRAND_SAFE` pages at
the start of Sprint 16 to 267 in the current validated source. The latest
factory continuation began at 178 and added 89 `BRAND_SAFE` profiles while
moving nine uncertain records to `BRAND_REVIEW` instead of guessing.

No Git push, Timeweb deployment, DNS change, domain-binding change or `.ru`
detach was performed. Ticket `#12495561` remains the authority for the
Timeweb routing incident. The private Russian catalogue archive was not read,
copied, connected, committed or deployed.

## Before → current validated source

| Metric | Sprint start | Current source |
| --- | ---: | ---: |
| Manufacturers | 2,806 | 2,806 |
| BRAND_SAFE | 146 | 267 |
| BRAND_WEAK | 2,652 | 2,516 |
| BRAND_REVIEW | 8 | 23 |
| Manufacturer sitemap target | 146 | 267 |
| Product sitemap | 0 | 0 |
| BRAND_SAFE with logo | 102 | 105 |
| BRAND_COMPLETE | 120 | 220 |
| English short descriptions | 146 | 267 |
| English full descriptions | 146 | 267 |
| Official domains | 146 | 267 |
| Tier A source records | 245 | 464 |
| Family-evidence brands | 130 | 251 |
| Countries confirmed | — | 209 |
| Headquarters confirmed | — | 42 |
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

Wave 11 added: Koneteollisuus, KROMBACH, Hydropa, FIMET, ZUMBACH, Bosch
Packaging Technology / Syntegon, Panametrics, Ross Valve, SEIM, SIATA,
VERLINDE, WOERNER, END-Armaturen, Foxboro Eckardt, Gimatic, Hydroline and
Malvern Panalytical.

Every promotion has a canonical identity, at least one manufacturer-owned
identity/product source, confirmed product areas, English content, unique SEO
metadata and a neutral RFQ path. Logo presence did not verify an identity and
was not required for `BRAND_SAFE`.

## Conservative review outcomes

FREUND, SPECKEN-DRUMAG, Wheatley Pump, PRISMA, CHAMPION, AECO, Nocchi,
PRECILEC and HYDRAULIK SEEHAUSEN were not promoted in the latest continuation.
Their recorded blockers are ambiguous identity, unresolved current ownership
or insufficient accessible first-party product evidence. The negative cache
prevents immediate repeat research.

## Factory outputs

- `mass-brand-source-results.json`: all 2,806 manufacturers with status,
  priority, effort class, sources, facts, logo state and blocker.
- `brand-source-cache.json`: reusable positive and negative source cache.
- `international-brand-semantic-map.json`: all 267 safe brands with confirmed
  categories, families, SEO intent and evidence coverage.
- `category-opportunity-report.json`: evidence-counted category opportunities;
  it creates no public category URLs.
- `processing-metrics.json`: 290 historically processed source records,
  267 safe and 23 review, 92.07% source-to-safe yield, and 1.74 sources per
  safe profile. Hourly throughput remains `NOT_MEASURED` because historical
  waves did not record elapsed time; no fabricated rate is reported.

## Quality and SEO controls

- 267 indexable pages have unique English titles and meta descriptions.
- The word-trigram Jaccard audit compared all 35,511 `BRAND_SAFE` pairs at a
  0.72 threshold and found zero near-duplicate pairs.
- The deterministic sample contains all 267 safe pages.
- Unsupported dealer, distributor, stock, price and warranty claims: zero.
- Automated published-set wrong-identity and wrong-logo findings: zero.
- Product schema, product sitemap entries, product routes and remotely stored
  product records: zero.
- First-party blue-regression findings: zero; manufacturer logos retain their
  official colours.

## Category opportunity snapshot

The strongest evidence-backed future editorial candidates are pumps (72 safe
brands), automation and control (55), industrial valves and flow control
(55), industrial sensors (48), drive and motion control (46), electric motors
(40), measurement and instrumentation (36), and geared drives (20). These are
reports only: no Brand × Category or public category pages were created.

## Deployment boundary

The current validated local source targets 267 manufacturer URLs. The existing
Sites mirror remains on its previously published 178-page version; the new
factory wave was deliberately not published because Sprint 16 imposes a hard
no-push rule until Timeweb ticket `#12495561` is closed. Timeweb was not
deployed. Product sitemap and product runtime remain zero in source.

Mail remains `BLOCKED_MAILBOX_ACCESS`; forms remain `SAFE_FAILURE`. These are
separate from the source and Brand Knowledge quality gates.
