# industriapostavok.ru domain handoff

This handoff transfers only control of where the domain points. It does not
transfer Ventrovia source code, GitHub access, Timeweb credentials, Brand
Knowledge or the private Russian catalogue.

## Current state

- registrar/DNS: REG.RU (`ns1.reg.ru`, `ns2.reg.ru`);
- apex and `www`: `147.45.99.78` (Timeweb Cloud network);
- MX: `mx.yandex.net`;
- SPF: `v=spf1 redirect=_spf.yandex.net`;
- both web hosts remain bound to the Ventrovia Timeweb application during the
  `.com` DNS/SSL propagation window.

## Ventrovia prerequisites

Do not detach `.ru` until `ventroviaglobal.com` passes the DNS, HTTPS, www
redirect, production, canonical, manufacturer-sitemap, zero-product-sitemap,
catalogue-absence and `.ru`-independence gates in
`VENTROVIA_INFRASTRUCTURE_CUTOVER.md`. Email delivery is a separate blocker and
does not block domain handoff.

As of 2026-08-19 the handoff is not yet released: the `.com` apex is live, but
one public resolver still caches the old `www` A record and the Timeweb `www`
certificate is pending. Do not remove either `.ru` binding until the recorded
TTL expires, `www` redirects over valid HTTPS, and repeated production checks
are stable.

## Ventrovia-side detach

1. In Timeweb **App Platform → Ventrovia → Settings → Domains**, remove
   `industriapostavok.ru` and `www.industriapostavok.ru` only after `.com` is
   independently serving production.
2. Confirm the Ventrovia build, assets, forms, canonical tags and redirects do
   not call the `.ru` host.
3. Do not delete the Timeweb application or expose its credentials.

## What the customer changes in REG.RU

The customer must obtain exact DNS records from the host of their new site,
then in REG.RU open the domain's DNS/resource-record editor and:

1. replace the apex A/AAAA records with the new host's exact targets;
2. replace the `www` A/CNAME record with the new host's exact target;
3. preserve Yandex MX/TXT records unless the customer is intentionally moving
   their mail service;
4. wait for DNS propagation and issue an SSL certificate on the new host;
5. verify apex, `www`, HTTPS and the customer's own canonical policy.

No exact target record is supplied here because the customer's new hosting
target has not been provided. Domain ownership at REG.RU is not changed by
Ventrovia and must not be transferred implicitly.
