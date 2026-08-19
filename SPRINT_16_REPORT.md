# Sprint 16 — Ventrovia international expansion

Date: 2026-08-19.

## Outcome

The verified manufacturer surface increased from 146 `BRAND_SAFE` pages at
the start of Sprint 16 to 324 in the current validated source. The latest
factory continuation began at 178 and added 146 `BRAND_SAFE` profiles while
moving 17 uncertain records to `BRAND_REVIEW` instead of guessing.

No Git push, Timeweb deployment, DNS change, domain-binding change or `.ru`
detach was performed. Ticket `#12495561` remains the authority for the
Timeweb routing incident. The private Russian catalogue archive was not read,
copied, connected, committed or deployed.

## Before → current validated source

| Metric | Sprint start | Current source |
| --- | ---: | ---: |
| Manufacturers | 2,806 | 2,806 |
| BRAND_SAFE | 146 | 324 |
| BRAND_WEAK | 2,652 | 2,451 |
| BRAND_REVIEW | 8 | 31 |
| Manufacturer sitemap target | 146 | 324 |
| Product sitemap | 0 | 0 |
| BRAND_SAFE with logo | 102 | 112 |
| BRAND_COMPLETE | 120 | 270 |
| English short descriptions | 146 | 324 |
| English full descriptions | 146 | 324 |
| Official domains | 146 | 324 |
| Tier A source records | 245 | 566 |
| Family-evidence brands | 130 | 308 |
| Countries confirmed | — | 259 |
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

Wave 12 added: Blackmer, Bran+Luebbe, General Kinematics, Magnescale, Mueller
Steam Specialty, Richardson Electronics, Timmer, URACA, Wilden, BOMAR, 4B
Braime, Fireye, Plenty Filters, AHP Merkle, B&R Automation, Baltimore Aircoil,
ELGO Electronic, Filton, HEINZMANN, M PUMPS, PEGAS-GONDA, SOFIMA Hydraulics,
Zander, ABP Induction, Bondioli & Pavesi, Clextral, Dynisco, Flender, GIVI
MISURE, Hankison, Headline Filters, Italvibras and KNOLL.

Wave 13 added: Jabsco, LTN Servotechnik, Price Pump, sera, TSCHAN, Tsurumi
Pump, Welch, Cla-Val, DURAG GROUP, Flygt, GEMELS, Hengesbach, INFICON,
Nicotra Gebhardt, Rossi, Verderflex, AViTEQ, CIB Unigas, FUNKE, Grindex,
Harmonic Drive, Hurco, Hydra-Cell and Permco.

Every promotion has a canonical identity, at least one manufacturer-owned
identity/product source, confirmed product areas, English content, unique SEO
metadata and a neutral RFQ path. Logo presence did not verify an identity and
was not required for `BRAND_SAFE`.

## Conservative review outcomes

FREUND, SPECKEN-DRUMAG, Wheatley Pump, PRISMA, CHAMPION, AECO, Nocchi,
PRECILEC, HYDRAULIK SEEHAUSEN, KRAFTMANN, NIMCO, MIL S, Urlinski, SPCO,
Drive Systems, Indufil and Warner Electric were not promoted in the latest
continuation. Their recorded blockers are ambiguous identity, unresolved
current ownership, an inaccessible official source or insufficient accessible
first-party product evidence. The negative cache prevents immediate repeat
research.

## Factory outputs

- `mass-brand-source-results.json`: all 2,806 manufacturers with status,
  priority, effort class, sources, facts, logo state and blocker.
- `brand-source-cache.json`: reusable positive and negative source cache.
- `international-brand-semantic-map.json`: all 324 safe brands with confirmed
  categories, families, SEO intent and evidence coverage.
- `category-opportunity-report.json`: evidence-counted category opportunities;
  it creates no public category URLs.
- `processing-metrics.json`: 355 historically processed source records,
  324 safe and 31 review, 91.27% source-to-safe yield, and 1.75 sources per
  safe profile. Hourly throughput remains `NOT_MEASURED` because historical
  waves did not record elapsed time; no fabricated rate is reported.

## Quality and SEO controls

- 324 indexable pages have unique English titles and meta descriptions.
- The word-trigram Jaccard audit compared all 52,326 `BRAND_SAFE` pairs at a
  0.72 threshold and found zero near-duplicate pairs.
- The deterministic sample contains all 324 safe pages.
- Unsupported dealer, distributor, stock, price and warranty claims: zero.
- Automated published-set wrong-identity and wrong-logo findings: zero.
- Product schema, product sitemap entries, product routes and remotely stored
  product records: zero.
- First-party blue-regression findings: zero; manufacturer logos retain their
  official colours.

## Category opportunity snapshot

The strongest evidence-backed future editorial candidates are pumps (88 safe
brands), automation and control (71), industrial valves and flow control
(59), industrial sensors (57), drive and motion control (53), measurement and
instrumentation (50), electric motors (42), and filtration and water systems
(31). These are
reports only: no Brand × Category or public category pages were created.

## Deployment boundary

The current validated local source targets 324 manufacturer URLs. The existing
Sites mirror remains on its previously published 178-page version; the new
factory wave was deliberately not published because Sprint 16 imposes a hard
no-push rule until Timeweb ticket `#12495561` is closed. Timeweb was not
deployed. Product sitemap and product runtime remain zero in source.

Mail remains `BLOCKED_MAILBOX_ACCESS`; forms remain `SAFE_FAILURE`. These are
separate from the source and Brand Knowledge quality gates.
