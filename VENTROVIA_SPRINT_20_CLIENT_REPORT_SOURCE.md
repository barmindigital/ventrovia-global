# VENTROVIA Sprint 20 — factual source for the client report

Date: 20 August 2026  
Project: VENTROVIA — Global Industrial Trade  
Production: https://ventroviaglobal.com  
Canonical host: `ventroviaglobal.com`  
Scope: international manufacturer knowledge website, user-experience QA, infrastructure review, release validation, and a controlled official-source brand wave.

This document is a factual source for a future client-facing Word report. It is not legal advice, does not contain credentials, and does not include the private Russian product catalogue or the customer catalogue handoff.

## 1. Executive outcome

Sprint 20 converted the Services navigation item from a homepage redirect into a complete English `/services` page, standardised the public primary CTA as **Request an Offer**, verified the main desktop/mobile customer journeys, and expanded the official-source manufacturer corpus without relaxing identity gates.

The international runtime remains manufacturer-only. No public products, SKU routes, product search, product API, product schema, or product sitemap were introduced.

Release source:

- GitHub and local `main`: `e72a1453e99a3014b1f275fef6579d46a5a92556`.
- UX change: `230ba85` — Services page and Request an Offer terminology.
- Brand data wave: `730e3aa` — official-source Wave 68.
- QA hardening: `e72a145` — retry transient asset checks.
- Sites mirror: version 122, sourced from the same `e72a145` commit.

## 2. Scope boundaries

Included:

- public Ventrovia UI and navigation;
- `/services` content and SEO;
- CTA and RFQ behaviour;
- contact data and safe form failure;
- desktop, mobile, and tablet interaction paths;
- manufacturer directory and search;
- representative brand-page validation;
- technical SEO, structured data, sitemap, canonical, robots, and link crawl;
- DNS, TLS, registrar, Timeweb, GitHub, analytics, and security review;
- one controlled official-source Brand Knowledge wave.

Excluded by design:

- the private Russian product catalogue;
- the separately prepared customer catalogue handoff;
- mailbox login, reset, takeover, or creation;
- DNS/provider migration or a new CDN connection;
- unsupported distributor, stock, warranty, price, or availability claims;
- mass Brand × Category URL publication.

## 3. Manufacturer data: before and after

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Manufacturer identities | 2,806 | 2,806 | 0 |
| BRAND_SAFE | 816 | 830 | +14 |
| BRAND_WEAK | 1,872 | 1,858 | -14 |
| BRAND_REVIEW | 118 | 118 | 0 |
| BRAND_COMPLETE | 654 | 668 | +14 |
| Confirmed official domains | 816 | 830 | +14 |
| Official source records | 1,919 | 1,948 | +29 |
| Tier A source records | 1,737 | 1,766 | +29 |
| BRAND_SAFE with logo | 194 | 198 | +4 |
| Confirmed countries | 714 | 728 | +14 |
| Confirmed headquarters | 389 | 402 | +13 |
| Brands with family evidence | 800 | 814 | +14 |
| English short descriptions | 816 | 830 | +14 |
| English full descriptions | 816 | 830 | +14 |
| Indexable manufacturer pages | 816 | 830 | +14 |
| Public product records | 0 | 0 | 0 |

## 4. New official-source BRAND_SAFE profiles

The following 14 profiles passed the existing identity, official-domain, product-scope, English content, SEO, and unsupported-claim gates:

1. HBC-radiomatic
2. MAAG
3. Neugart
4. Oriental Motor
5. Royal Pas Reform
6. Revent
7. Sandvik
8. SANOVO
9. SAUTER
10. SCHROEDAHL
11. Settima
12. Sydex
13. Walraven
14. Weber Food Technology

Only manufacturer-owned or clearly attributable official corporate sources were used as publication evidence. A missing logo did not block a factual SAFE profile; incorrect or fuzzy-only logo matching was not accepted.

## 5. Services and CTA changes

### New `/services` page

The new page covers only neutral, supportable B2B services:

- industrial equipment sourcing;
- manufacturer sourcing;
- part-number and model requests;
- specification and BOM requests;
- procurement support;
- international supply enquiries.

It includes English Title, Meta Description, canonical, Open Graph data, breadcrumbs, and semantically appropriate Service and BreadcrumbList structured data. It does not claim authorised distribution, guaranteed delivery, own stock, direct contracts, or guaranteed availability.

### Public CTA policy

- Primary: **Request an Offer**.
- Secondary: **Send Your Specification**.
- Contact: **Contact Us**.

The primary wording was updated across header, mobile menu, homepage, services, about, contact/RFQ entry points, manufacturer pages, footer, and accessible labels. Internal API field names were not renamed when that would have created unnecessary integration risk.

## 6. Real-user journey QA

The production website was exercised in the browser, not only through unit tests.

Validated paths included:

- Ventrovia logo to homepage from main routes;
- Home, Manufacturers, Services, About, Contact, and primary CTA navigation;
- Services links from Home, Manufacturers, a brand page, About, Contact, footer, and mobile menu;
- Request an Offer modal and manufacturer context;
- Send Your Specification flow and file validation;
- email and telephone fallbacks;
- English 404 page;
- manufacturer cards, logo fallback, and brand links.

Responsive checks:

- 390 × 844 mobile;
- 320 × 568 small mobile;
- 768 × 1024 tablet;
- both sides of the 820 px navigation breakpoint.

Verified behaviours:

- mobile menu opens, closes, and closes after navigation;
- Escape and outside click close the menu/modal where implemented;
- no horizontal overflow at tested widths;
- the logo remains aligned and correctly sized;
- visual system remains graphite, ivory, terracotta, and controlled red;
- no unintended Ventrovia-blue UI regression was detected.

## 7. Forms and contact data

Approved public contact data:

- Email: `sales@ventroviaglobal.com`.
- Email links: `mailto:sales@ventroviaglobal.com`.
- Phone: `+971 55 725 4463`.
- Phone links: `tel:+971557254463`.
- Address: Office 29c02, 29th Floor, I-Rise Tower, Hessa Street, Barsha Heights, Dubai, UAE.

The address was verified in Contact, Footer, About, and Organization structured data.

Form status:

- `EMAIL = BLOCKED_MAILBOX_ACCESS`.
- `FORMS = SAFE_FAILURE`.
- The Sprint did not attempt mailbox login, password reset, takeover, or mailbox creation.
- A controlled synthetic submission returned an honest delivery failure rather than a false success.
- The failure state provides clickable email and phone alternatives.
- A disallowed `.svg` upload was rejected by the client validation; no file was uploaded.
- Manufacturer-page enquiries retain manufacturer context without product data.

## 8. Manufacturer directory and brand-page QA

Search checks passed for exact names, case-insensitive queries, partial queries, aliases, and diacritics, including:

- Bosch Rexroth;
- Kuebler / Kübler;
- Grundfos;
- INOXPA;
- ATOS;
- a short partial query;
- a deterministic zero-result query.

A stratified 50-page BRAND_SAFE browser/sample audit covered pumps, automation, valves, measurement, sensors, drives, motors, hydraulics, large/niche brands, and profiles with/without logos.

Results:

- wrong identity: 0 detected in the sample;
- wrong logo: 0 detected in the sample;
- empty public sections: 0 detected;
- internal product links: 0;
- brand CTA and breadcrumbs: present and functional;
- official external product URLs remained external evidence links and were not misclassified as Ventrovia product routes.

## 9. SEO and public visibility

The final local corpus gates passed for all 830 BRAND_SAFE profiles:

- English content ready: 830;
- English SEO ready: 830;
- unique Titles: 830;
- unique Meta Descriptions: 830;
- unsupported commercial claims: 0 detected;
- old spelling/old public identity: 0 detected;
- manufacturer sitemap target: 830;
- product sitemap: 0;
- Product/Offer/Review/AggregateRating schema: 0;
- public product records: 0;
- client product bundle markers: 0.

Canonical policy: every indexable page uses `https://ventroviaglobal.com/...`. The Sites mirror and Timeweb temporary hosts are not canonical. `industriapostavok.ru` is not a Ventrovia dependency and remains detached.

The `/services` page is indexable and included in the static sitemap surface.

## 10. Production and network validation

Final release checks established:

- apex HTTPS: 50/50 Ventrovia responses;
- www HTTPS: 20/20 valid redirects to apex;
- HTTP to HTTPS: 308;
- apex and www certificates: hostname and chain valid, certificate period 19 August–17 November 2026;
- mixed content: 0 detected;
- `/catalog`: 404;
- legacy SKU route: 404;
- product API: 404/unavailable;
- product sitemap: 404/absent and zero product URLs in the main sitemap.
- all 14 Wave 68 profiles live with the correct canonical and Request an Offer CTA: 14/14.

The final post-wave production crawl is recorded in `data/brand-operations/prelaunch-production-audit.json` and is the authoritative machine-readable QA evidence for page reachability, canonical, metadata uniqueness, old-brand leakage, product schema, mixed content, external-link safety, and assets.

Final crawl result:

- sitemap URLs: 836;
- manufacturer sitemap URLs: 830;
- product sitemap URLs: 0;
- crawled/queued pages: 843/843;
- page fetch failures: 0;
- page issues: 0;
- indexable-page issues: 0;
- duplicate Titles: 0;
- duplicate Meta Descriptions: 0;
- Product schema pages: 0;
- old identity pages: 0;
- mixed-content pages: 0;
- Russian-character indexable pages: 0;
- internal assets: 542;
- broken assets: 0;
- crawl median HTML response time: 118 ms;
- crawl p95 HTML response time: 227 ms.

The Timeweb build for `e72a145` completed successfully, and the production sitemap changed from 816 to 830 manufacturer URLs. The Sites mirror version 122 also serves `/services` and all 830 manufacturer sitemap entries from the same commit.

## 11. GitHub review

Observed repository state:

- owner: `yanianya`;
- repository: private;
- current repository name remains `industria-postavok` to avoid breaking the active Timeweb integration during this production Sprint;
- branches: 1;
- tags: 0;
- forks: 0;
- releases: none;
- GitHub Actions workflows/artifacts/caches: none visible;
- repository README and current-facing project content: Ventrovia.

Installed/integrated applications visible in GitHub:

- Railway;
- Timeweb Cloud Apps.

Detailed scopes, collaborators, deploy keys, webhooks, and branch-protection controls require GitHub sudo re-authentication. No password or authentication bypass was attempted. These items therefore remain `MANUAL_GITHUB_SUDO_REVIEW_REQUIRED`; no integration was removed without proof that it is unused.

No secrets were found in the repository/runtime/bundle checks. Secret values are intentionally absent from this report.

## 12. Timeweb review

Observed application:

- App ID: `231783`;
- app name: `ventrovia-global`;
- title: VENTROVIA — Global Industrial Trade;
- attached public hosts: apex and www only;
- both web records point to `147.45.99.78`;
- `industriapostavok.ru` is not attached;
- private network: disabled;
- firewall groups: none displayed;
- resource plan displayed: 4 × 3.3 GHz, 8 GB RAM, 80 GB storage;
- hosting UI displays a Russia region flag; an exact city was not exposed in the available panel.

The detailed environment-settings view remained stuck in a loading state, so environment variable names could not be independently enumerated through the UI. Repository and runtime audits nevertheless found no dependency on the old `.ru` host, old identity, Russian product data, or public product routes. Status: `TIMEWEB_ENV_DETAIL = BLOCKED_SETTINGS_UI`.

International delivery recommendation: **CDN RECOMMENDED**, but not connected in this Sprint. The site is global and mostly static, with hundreds of manufacturer pages and logos. A CDN can improve latency and cache delivery across the Middle East, Asia, North America, and regions remote from the current origin. Provider selection and DNS change should be a separate measured release.

## 13. REG.RU and DNS review

Observed `ventroviaglobal.com` configuration:

- nameservers: `ns1.reg.ru`, `ns2.reg.ru`;
- apex A: `147.45.99.78`;
- www A: `147.45.99.78`;
- AAAA: none;
- CNAME: none;
- old web IP `95.163.244.138`: absent;
- MX: priority 1 `smtp.google.com.`;
- TXT: Google site verification and Google DKIM present;
- SPF: not observed;
- DMARC: not observed;
- DNSSEC/DS: not observed;
- displayed DNS TTL: one day; externally observed cache TTL can be lower;
- registration valid through 29 July 2027;
- auto-renewal status was not independently confirmed.

REG.RU itself does not prevent international operation. No registrar transfer, DNS rewrite, ownership change, or `.ru` modification was performed.

## 14. Analytics and privacy readiness

Production did not load active Google Analytics, Yandex Metrica, or another analytics script during the audit. The repository contains dormant analytics/cookie components, but they are not mounted in the current public runtime.

Current privacy position:

- no unnecessary cookie banner was introduced;
- no optional analytics was claimed as active;
- no external tracker was activated without a consent/design decision;
- the application has internal event hooks for future successful enquiries but no active analytics consumer.

Recommended next step: implement a consent-aware, privacy-reviewed measurement plan for manufacturer queries, zero-result searches, brand clicks, CTA opens, and successful/failed enquiry stages. Search Console and Bing Webmaster verification should be treated as separate owner-authorised integrations.

## 15. Quality and build gates

The final local release gate passed:

- ESLint;
- TypeScript;
- 25/25 automated tests;
- Brand Identity Audit;
- Content Audit;
- International SEO Audit;
- Logo Audit;
- Blue Regression Audit;
- Visibility Audit;
- Security/Infrastructure Audit;
- Bundle Audit;
- vinext/Sites build;
- production/Timeweb build.

Bundle boundary at the checkpoint:

- public JavaScript: 386,146 bytes across 23 files;
- product assets/markers: 0;
- Brand evidence and long-form source data remain server-side.

## 16. Category SEO readiness (report only)

No Brand × Category URLs were published. The strongest evidence-backed category opportunities after Wave 68 are:

| Category | SAFE brands | Quality score |
|---|---:|---:|
| Industrial automation and control | 175 | 88 |
| Pumps and pumping systems | 191 | 87 |
| Drive and motion-control systems | 128 | 89 |
| Industrial valves and flow control | 123 | 87 |
| Measurement and instrumentation | 116 | 88 |
| Industrial sensors | 114 | 89 |
| Electric motors | 110 | 87 |
| Industrial machinery | 91 | 88 |
| Filtration and water systems | 70 | 87 |
| Gear units and geared drives | 69 | 89 |

These are candidates for a separately designed second SEO layer, not an instruction to publish thin directories.

## 17. Open blockers and exact manual actions

### Mailbox access

Status: `BLOCKED_MAILBOX_ACCESS`.

Manual action: the authorised mailbox owner must confirm access to `sales@ventroviaglobal.com`, verify receiving/sending, and provide or configure an approved delivery transport without sharing passwords in source control. Only after an actual controlled delivery test may forms move from SAFE_FAILURE to a success state.

### GitHub protected settings

Status: `MANUAL_GITHUB_SUDO_REVIEW_REQUIRED`.

Manual action: in GitHub repository **Settings**, re-authenticate through the normal sudo prompt, then review Collaborators, Deploy keys, Webhooks, Installed GitHub Apps, Actions secrets, and Branch protection. Remove Railway or an old read/write deploy key only after confirming it is not used by Timeweb or another current release path.

### Timeweb environment details

Status: `BLOCKED_SETTINGS_UI`.

Manual action: in Timeweb App Platform → App 231783 → Settings, retry after the panel is responsive and record environment variable names only. Do not copy secret values. Remove a value only when it is demonstrably obsolete.

### Domain renewal and email authentication

Status: review required.

Manual action: confirm REG.RU auto-renewal for `ventroviaglobal.com`. The authorised mail administrator should separately confirm the correct provider and then add or repair SPF/DMARC only using provider-issued values; do not guess DNS records or remove existing Google MX/DKIM records.

### Sites project metadata

Status: non-blocking metadata debt.

The Sites title is already Ventrovia, but the connector-exposed project description remains an old catalogue description and cannot be changed through the available metadata operation. Update it manually when the Sites UI exposes description editing. This text is not the canonical production metadata.

## 18. Recommended next commercial sprint

The highest-value next sprint is not another architecture rewrite. It should combine:

1. mailbox/form delivery closure with real end-to-end enquiry evidence;
2. a consent-aware analytics baseline for search and RFQ conversion;
3. logo enrichment for the 632 SAFE profiles without a published logo;
4. a controlled next Brand Knowledge wave from the existing fastest-path queue;
5. design and editorial validation of the first one or two high-confidence category landings, beginning with automation and pumps, without mass URL publication;
6. CDN proof-of-concept and multi-region measurement before any DNS cutover.

## 19. Final safeguards

- Private Russian catalogue accessed: **NO**.
- Customer catalogue handoff added to Git/Sites/Timeweb: **NO**.
- Product catalogue restored to Ventrovia: **NO**.
- Public product records: **0**.
- Product sitemap URLs: **0**.
- `/catalog`: **404**.
- Legacy SKU route: **404**.
- Product API: **404/unavailable**.
- Old `.ru` dependency: **0**.
- Public `VENTORVIA` spelling: **0**.
- Public `Индустрия Поставок` identity: **0**.

## 20. Sprint 21 manufacturer-scale update — 24 August 2026

Sprint 21 reused the established official-source Brand Factory without adding a
new public architecture. It processed every one of the 1,858 records that was
not SAFE at the Sprint baseline. The measured waves accepted 1,394 candidates
and classified 464 for review; final cross-corpus controls conservatively
demoted targeted identity overlaps, producing a net gain of 1,389 SAFE
profiles.

| Metric | Sprint 21 start | Sprint 21 finish | Change |
|---|---:|---:|---:|
| Manufacturer identities | 2,806 | 2,806 | 0 |
| BRAND_SAFE | 830 | 2,219 | +1,389 |
| BRAND_WEAK | 1,858 | 0 | -1,858 |
| BRAND_REVIEW | 118 | 587 | +469 |
| BRAND_COMPLETE | 668 | 1,515 | +847 |
| Official domains | 830 | 2,219 | +1,389 |
| Official source records | 1,948 | 3,890 | +1,942 |
| Tier A source records | 1,766 | 3,614 | +1,848 |
| SAFE with logo | 198 | 459 | +261 |
| Confirmed countries | 728 | 2,018 | +1,290 |
| Confirmed headquarters | 402 | 956 | +554 |
| Family evidence | 814 | 2,203 | +1,389 |
| English short descriptions | 830 | 2,219 | +1,389 |
| English full descriptions | 830 | 2,219 | +1,389 |
| Manufacturer sitemap target | 830 | 2,219 | +1,389 |
| Product sitemap | 0 | 0 | 0 |

Measured throughput was 427.51 processed records/hour and 320.75 accepted SAFE
records/hour across a 4.3461-hour parallel processing window. The wave
source-to-SAFE success rate was 75.03%. Ambiguous identities, inaccessible or
insecure sources, product lines and canonical duplicates were retained in
review instead of being promoted for numerical completeness.

The final SEO corpus contains 2,219 unique Titles and 2,219 unique Meta
Descriptions, with no systemic near-duplicate finding at the configured 0.72
threshold. The strengthened generation gate rejects duplicate display names,
normalised official-name collisions and records without qualifying HTTPS
official evidence.

Logo coverage increased from 198 to 459 through exact reviewed registry
matches, more than doubling the published count. Fuzzy matches, favicons and
reseller assets were not accepted merely to meet a coverage target.

The strongest report-only SEO clusters after Sprint 21 are automation (491),
pumps (344), measurement (342), industrial machinery (314), valves (297),
sensors (279), filtration and water systems (209), drives (202), electric
motors (193), thermal management (190), hydraulics (162), conveying (137),
geared drives (118), and pneumatics (117). No mass category or Brand × Category
URL layer was published. Two unpublished local editorial prototypes document a
future controlled rollout for Pumps and Industrial Automation.

The product-route investigation confirmed that `/catalog`, product pages,
legacy SKU routes and `/api/products` return 404 by intentional architecture:
their route modules and datasets are absent from the manufacturer-only
application, and release tests enforce that boundary. This is not a Timeweb
routing fault. The private Russian catalogue and customer handoff were not read,
changed, committed or deployed during Sprint 21.

The final local release gate passed ESLint, TypeScript, 25 automated tests,
brand identity, content, SEO, logo, visual, visibility, security and bundle
audits. A deterministic 500-profile sample recorded zero wrong identities,
wrong logos, unsupported claims, empty sections, SEO errors or product leakage.
The Timeweb production build completed in 24.68 seconds with approximately
914 MB maximum resident memory. The rendered manufacturer directory HTML was
718,596 bytes; public JavaScript remained 386,146 bytes across 23 files. A
1,000-query local manufacturer-search benchmark over all 2,806 identities
measured 0.754 ms median and 1.025 ms p95.
