# Ventrovia infrastructure cutover

Audit date: 2026-08-19. This document is an operational checklist, not an
authorization to change DNS, domain ownership or credentials.

## Verified release baseline

- source branch: `main`, clean and synchronized with `origin/main`;
- manufacturer identities: 2,806;
- BRAND_SAFE / BRAND_WEAK / BRAND_REVIEW: 146 / 2,652 / 8;
- manufacturer sitemap URLs: 146;
- product sitemap URLs and remotely stored product records: 0;
- canonical origin in source: `https://ventroviaglobal.com`;
- current clean Sites release: version 115;
- private Russian catalogue: owner-local and excluded from every build input.

The authenticated Timeweb inventory found one App Platform application:
`industria-postavok` (`ID 231783`). It is connected to GitHub branch `main`
with automatic deployment enabled. The clean Brand Knowledge release is commit
`906c4ed`. The application initially had two domain bindings: `industriapostavok.ru` and
`www.industriapostavok.ru`. No Timeweb S3 buckets, network disks, managed
databases or cloud servers exist in this account.

## Observed DNS state

The authoritative nameservers for `ventroviaglobal.com` are `ns1.reg.ru` and
`ns2.reg.ru`. The apex and `www` currently resolve to `95.163.244.138`, a REG.RU
network address. The apex has a Let's Encrypt certificate but returns HTTP 400;
the `www` TLS handshake does not complete. This is not a production-ready
Ventrovia endpoint.

`industriapostavok.ru` and its `www` host resolve to `147.45.99.78`, a Timeweb
Cloud network. They currently serve the older Ventrovia deployment. The `.ru`
domain must remain attached until the `.com` cutover gates below are green.

## Timeweb cutover

The account is authenticated. The account email confirmation banner remains
open and should be completed so operational notices are received.

1. Open **App Platform → industria-postavok (ID 231783)**.
2. On **Deployments**, deploy the latest `main` source and confirm the build has
   no `/catalog`, product API, product data or catalogue-admin routes.
3. On **Settings → Domains → Edit**, add `ventroviaglobal.com` and
   `www.ventroviaglobal.com` as external domains. Copy the exact DNS target
   shown by Timeweb; do not assume that an old application IP is permanent.
4. On **Settings / Environment**, set
   `NEXT_PUBLIC_SITE_URL=https://ventroviaglobal.com` and
   `VENTROVIA_INTERNATIONAL_SITE_ENABLED=true`. Configure mail variables only
   after the mail steps in `VENTROVIA_EMAIL_SETUP.md` pass.
5. Inventory storage, volumes, backups, build artefacts and prior deployments.
   Delete only versions that contain the legacy product dataset. Preserve the
   current Brand Knowledge application and its required configuration.
6. At REG.RU, replace the current `.com` A/AAAA/CNAME records only with the
   exact targets supplied by Timeweb. Keep one canonical host: apex primary and
   a permanent `www` → apex redirect.
7. Wait for DNS propagation and Timeweb's automatic Let's Encrypt issuance for
   both hosts.

Timeweb documents the domain workflow at
`https://timeweb.cloud/docs/apps/upravlenie-apps-v-paneli`.

The provider UI exposes no separate S3, volume, database, server or app-history
resource containing catalogue data. A clean immutable redeploy is still
required to replace the currently running old container. Provider-retained
container images or internal backups are not user-visible; request their purge
from Timeweb support if contractual deletion of provider-retained copies is
required.

## Clean deployment result

The first authenticated cutover deployment completed successfully from clean
Brand Knowledge commit `735386a`. Timeweb reported the new container healthy
and removed the previous container. Runtime verification returned ordinary 404
responses for `/catalog`, a legacy SKU path, the public product API and the
catalogue health admin route. The public sitemap contained 146 manufacturer
URLs and zero product URLs.

The Timeweb settings form continued returning legacy `.ru` values after an
authenticated save and reload. To prevent that provider state from overriding
Ventrovia, the application now treats the central brand configuration as the
only canonical origin and accepts form-address overrides only on the
`ventroviaglobal.com` domain. The legacy environment values therefore cannot
restore `.ru` metadata or route enquiries to the retired address. They should
still be replaced or deleted in Timeweb after provider support confirms why
the settings form is not persisting changes.

## Production acceptance gates

All gates must pass on `https://ventroviaglobal.com` before `.ru` detach:

- apex returns the Ventrovia English homepage over valid HTTPS;
- `www` redirects once with 301/308 to the same path on the apex;
- `/catalog`, an old product URL and product APIs return ordinary 404 responses;
- `/sitemap.xml` contains 146 current manufacturer URLs and zero product URLs;
- canonical, robots, Open Graph and JSON-LD use the `.com` origin;
- no asset, form or redirect depends on `industriapostavok.ru`.

The corresponding release-state gates are:

- `VENTROVIA_COM_DNS = PASS`;
- `VENTROVIA_COM_SSL = PASS`;
- `VENTROVIA_PRODUCTION = PASS`;
- `WWW_REDIRECT = PASS`;
- `CANONICAL = PASS`;
- `MANUFACTURER_SITEMAP = PASS`;
- `PRODUCT_SITEMAP_ZERO = PASS`;
- `CATALOG_ABSENT = PASS`;
- `NO_DEPENDENCY_ON_RU = PASS`.

Email is deliberately independent of this release gate. The approved status is
`EMAIL_PRODUCTION = BLOCKED_MAILBOX_ACCESS` until a mailbox owner separately
provides access or verifies delivery. Public forms must remain in `SAFE_FAILURE`
unless a real transport or independent server-side submission store is proven.

## Rollback

If the `.com` deployment fails, restore only the last clean Brand Knowledge
deployment and its DNS target. Never restore the private catalogue as a
cutover rollback. Do not detach `.ru` until `.com` is independently healthy.
