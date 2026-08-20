# Ventrovia international pre-launch audit

Audit date: 2026-08-20.

## Executive release decision

The public Ventrovia website is technically ready as an English,
manufacturer-only website. The production crawl, metadata corpus, product
visibility controls, SSL, canonical host, assets and core buyer journeys pass.

The website release is **PASS WITH MANUAL SECURITY ACTIONS**. Before paid
traffic or a wider launch, the owner must rotate the production credentials
listed below and complete a final physical-device mobile smoke test. Email
delivery remains a separate known blocker and does not change website or domain
readiness.

## Verified baseline

- source commit: `978ec4911e5ee5a002524bc7de1d6f0db90cf1c8`;
- GitHub `origin/main`: the same commit;
- Timeweb production commit: the same commit;
- Sites mirror: version 119;
- manufacturers: 2,806;
- `BRAND_SAFE`: 816;
- `BRAND_WEAK`: 1,872;
- `BRAND_REVIEW`: 118;
- `BRAND_COMPLETE`: 654;
- `BRAND_SAFE` with a publishable logo: 194;
- manufacturer sitemap URLs: 816;
- product sitemap URLs: 0;
- international runtime product records/routes/API: 0.

Mass brand expansion was frozen for this sprint. The only public changes are
pre-launch UX, accessibility, upload validation and response-header fixes.

## Real browser journey

The production website was exercised as a buyer rather than only through unit
tests:

- homepage logo, navigation, hero CTAs, content CTAs, manufacturer links and
  footer links resolve to the expected destinations;
- Home, Manufacturers, About, Services and Contact paths work;
- email and phone links use `mailto:sales@ventroviaglobal.com` and
  `tel:+971557254463`;
- quote and specification CTAs open a usable RFQ dialog with the correct page
  and manufacturer context;
- the dialog closes by button, Escape and outside click, traps focus while
  open and returns focus to its opener;
- manufacturer search passed exact, partial, case-insensitive, alias and
  diacritic cases for Bosch Rexroth, Kuebler/Kübler, Grundfos, INOXPA and ATOS;
- singular result wording and the zero-result recovery action were corrected;
- a stratified set of 50 `BRAND_SAFE` pages was inspected across pumps,
  automation, valves, measurement, sensors, drives, motors, hydraulics and
  niche manufacturers;
- sampled brand pages contained one canonical H1, factual content, no empty
  sections, safe official links, RFQ paths, FAQ and breadcrumbs;
- the 404 page, `/catalog`, legacy SKU paths and product API paths return the
  intended unavailable/404 result.

The available browser surface uses a fixed desktop viewport. Mobile-menu
behaviour is covered by source inspection and automated interaction tests, but
a final visual run on a real 390 x 844 device and one tablet remains
`MANUAL_DEVICE_SMOKE_REQUIRED`.

## Forms and contact data

Production contact data is consistent:

- email: `sales@ventroviaglobal.com`;
- phone: `+971 55 725 4463`;
- address: Office 29c02, 29th Floor, I-Rise Tower, Hessa Street, Barsha
  Heights, Dubai, UAE.

Required fields, email validation, consent, loading, error handling and file
limits were exercised. Production rejects disguised files and more than five
attachments. PDF, JPEG, PNG, DOC, XLS, DOCX and XLSX uploads now require a
matching binary signature; filenames are normalised before server processing.

Mail transport cannot be verified without the mailbox owner. A controlled
valid request returned an honest error with clickable email and phone fallback,
not a false success. Current status:

- `EMAIL = BLOCKED_MAILBOX_ACCESS`;
- `FORMS = SAFE_FAILURE`;
- `FAKE_SUCCESS = 0`.

No mailbox login, reset, creation or ownership change was attempted.

## Complete production crawl

The repeatable report is stored at
`data/brand-operations/prelaunch-production-audit.json`.

- sitemap URLs: 821;
- manufacturer URLs: 816;
- crawled public/link-discovered pages: 828;
- failed page fetches: 0;
- page issues: 0;
- indexability issues: 0;
- duplicate titles: 0;
- duplicate meta descriptions: 0;
- mixed-content pages: 0;
- old-identity pages: 0;
- Russian-character indexable pages: 0;
- internal assets checked: 543;
- broken internal assets: 0;
- unsafe external-link markup: 0;
- product-schema pages: 0.

Official manufacturer links were checked for valid HTTPS markup, external
target behaviour and safe `rel` attributes. External manufacturer websites
were deliberately not aggressively crawled.

## SEO and structured data

- document language is English;
- the canonical origin is `https://ventroviaglobal.com`;
- no Sites, Timeweb temporary or `.ru` canonical remains;
- all 816 safe manufacturer pages have unique English titles and meta
  descriptions;
- Organization data uses Ventrovia, the Dubai address, new phone/email and the
  `.com` origin;
- Brand/Organization and BreadcrumbList markup is used only where semantically
  appropriate;
- Product, Offer, AggregateRating, review and price schemas are absent;
- robots and the manufacturer-only sitemap are reachable;
- product sitemap is zero.

## Identity, language and visual system

Public audit results:

- `VENTORVIA`: 0 occurrences;
- `Индустрия Поставок`: 0 occurrences;
- old Russian contact/canonical dependency: 0;
- unintended blue UI findings: 0;
- active palette: graphite, ivory, terracotta and controlled red;
- unsupported commercial claims in safe-brand content: 0;
- duplicate English brand titles/metas: 0.

The header, footer, mobile logo variant, favicon, Open Graph asset and
structured-data logo use the current Ventrovia asset family.

## HTTP, DNS and SSL

- apex stability: 50/50 responses served Ventrovia with HTTP 200;
- `www`: 20/20 responses used valid TLS and permanent 308 redirect to the
  apex;
- HTTP redirects to HTTPS;
- certificates for apex and `www` match their hostnames and are valid through
  2026-11-17;
- active apex and `www` A records point to `147.45.99.78`;
- old address `95.163.244.138` is absent;
- no mixed content was found.

Production now sends HSTS, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: SAMEORIGIN`, strict referrer policy and a conservative
Permissions Policy.

## REG.RU

The `.com` domain is active through 2027-07-29. Auto-renew is enabled for
2027-07-15, but REG.RU reports no payment card or sufficient renewal funding.
Nameservers are `ns1.reg.ru` and `ns2.reg.ru`; web records point only to the
current Ventrovia address. TTL is one day. DNSSEC is not currently visible.

Mail DNS contains Google MX, Google verification and Google DKIM records. SPF
and DMARC were not found. No mail DNS was changed because the provider and
mailbox owner are not available for verification.

REG.RU currently warns that the registrant phone and email are publicly visible
in Whois. This is `MANUAL_DOMAIN_PRIVACY_REQUIRED`; it must not be corrected by
guessing or changing ownership data.

`industriapostavok.ru` is detached and was not modified during this sprint.

## GitHub and deployment access

- repository `yanianya/industria-postavok` is private;
- the owner is `yanianya`;
- only `main` is visible; forks, releases and Actions runs are absent;
- the current reachable tree contains no forbidden product-data paths;
- current source/history scans found no exposed private key or credential
  pattern;
- Timeweb Cloud Apps is the active deployment integration;
- Railway App remains installed with broad repository access and requires an
  owner decision;
- the historical read/write deploy key requires a least-privilege replacement;
- GitHub security settings that require sudo reauthentication could not be
  changed without the owner's password.

Do not rename the repository until the Timeweb GitHub integration is migrated
in a coordinated change. Do not enable branch rules that break the current
direct-to-main deployment path; migrate to a PR/check workflow first.

## Critical credential rotation

During the authenticated Timeweb configuration audit, existing secret values
were visible in the provider UI. They must be treated as exposed. No values are
recorded in this report or in Git.

Rotate, in a controlled order:

1. `RESEND_API_KEY`: create a replacement in the verified mail provider,
   update Timeweb, test, then revoke the old key;
2. `ADMIN_PASSWORD`: replace it with an owner-stored unique value;
3. `ADMIN_SESSION_SECRET`: replace it with a new high-entropy random value and
   invalidate old sessions;
4. `GITHUB_CONTENT_TOKEN`: replace it with a fine-grained token limited to this
   private repository and the minimum required content permission, verify the
   admin publishing flow, then revoke the old token.

After each replacement, save the Timeweb environment, restart the application,
verify `/admin` and the public safe-failure form path, and never paste a secret
into a ticket or repository file.

Non-secret Timeweb configuration was corrected to the `.com` canonical, the
approved sales address and Ventrovia RFQ sender display. The Timeweb app is
named `ventrovia-global`; production uses the audited commit.

## Performance and delivery

- public client JavaScript: 385,567 bytes across 23 chunks;
- directory HTML: approximately 621 KB;
- crawl median page response: 155 ms from the audit location;
- crawl p95 page response: 263 ms;
- total crawled HTML: approximately 33.2 MB;
- production build: pass, including 835 generated routes;
- manufacturer search remains client-responsive over 2,806 compact records.

Real multi-region measurements are not available, so no geographic latency is
invented. For a worldwide, static-heavy catalogue of manufacturer knowledge,
`CDN_RECOMMENDED` is the next infrastructure evaluation. It should be tested
with real-user measurements and conservative cache rules before adoption;
Cloudflare or another provider must not be connected automatically.

## Privacy, analytics and legal surface

No Google Analytics, Yandex Metrica or other active analytics tracker was found
in the public runtime, and the inspected session set no analytics cookie. The
unused consent banner is therefore not rendered; the privacy page now states
the current no-optional-analytics condition directly. A separate Terms page
does not currently exist. Worldwide
privacy, cookie, upload-retention and terms wording require qualified legal
review; no missing legal entity, licence or tax details were invented.

## Verification gates

- ESLint: pass;
- TypeScript: pass;
- automated tests: 23/23 pass;
- brand identity/content/SEO audits: pass;
- logo audit: pass;
- blue regression audit: pass, zero findings;
- sitemap and product visibility audits: pass;
- security and bundle audits: pass;
- production build: pass;
- public crawl: pass;
- Timeweb production route stability: pass;
- Sites mirror deployment: pass.

## Manual pre-launch actions

1. Rotate the four Timeweb credentials above and verify admin/form behaviour.
2. In GitHub, reauthenticate and review Installed GitHub Apps, deploy keys,
   webhooks, collaborators and sessions. Remove Railway if it has no current
   business purpose; otherwise restrict it to selected repositories.
3. In REG.RU, enable registrant-contact privacy and fund/configure renewal well
   before 2027-07-15.
4. Ask the actual mail owner/provider to confirm receiving and sending, then
   add only provider-issued SPF/DMARC values and perform a real end-to-end RFQ
   delivery test.
5. Complete one final visual/accessibility smoke on a real 390 x 844 phone and
   one tablet.
6. Obtain an international legal review before enabling analytics, paid
   campaigns or broad personal-data collection.
