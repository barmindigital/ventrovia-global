# Ventrovia domain migration

The application is prepared for the canonical origin
`https://ventroviaglobal.com`. DNS, mailbox and registrar changes are not
performed by this repository migration.

## Target policy

- primary origin: `https://ventroviaglobal.com`
- secondary host: `www.ventroviaglobal.com`
- redirect: permanent `www` → non-`www`
- HTTPS: required on both hosts before the redirect is enabled
- public language: English
- product catalogue: excluded from the international deployment

## DNS and hosting checklist

1. In the selected production host, add both custom domains and obtain the
   exact A/AAAA/CNAME values supplied by that host. Do not guess an IP address.
2. Add the supplied records at the DNS provider. Keep the existing TTL during
   verification; reduce it in advance only if operationally necessary.
3. Wait for authoritative DNS propagation and confirm both hosts resolve to the
   intended deployment.
4. Issue and validate TLS certificates for both hosts.
5. Set `ventroviaglobal.com` as primary and configure a 301 redirect from
   `www.ventroviaglobal.com` to the same path on the primary host.
6. Set `NEXT_PUBLIC_SITE_URL=https://ventroviaglobal.com` and
   `VENTROVIA_INTERNATIONAL_SITE_ENABLED=true` in production.
7. Keep `RUSSIAN_CATALOG_ARCHIVE_RUNTIME_ENABLED=false` and
   `PRODUCT_CATALOG_PUBLIC_ENABLED=false`.
8. Verify `/`, `/manufacturers`, a BRAND_SAFE manufacturer page, `/robots.txt`
   and `/sitemap.xml` on the final hostname.

## Email infrastructure

Create and verify `sales@ventroviaglobal.com` before treating web-form delivery
as operational. Configure the mailbox or forwarding destination, MX records,
SPF, DKIM and a conservative DMARC policy. Verify the sending domain with the
configured transactional-mail provider, then set:

```text
REQUEST_TO_EMAIL=sales@ventroviaglobal.com
REQUEST_FROM_EMAIL=Ventrovia RFQ <requests@ventroviaglobal.com>
RESEND_API_KEY=<server-side secret>
```

Until that validation is complete, the form returns a visible service error
and presents a `mailto:` fallback. It never reports an enquiry as delivered
when no delivery channel is configured.

## Search migration

After the final domain serves the release:

1. verify ownership in Google Search Console and Yandex Webmaster only from the
   real production account;
2. submit `https://ventroviaglobal.com/sitemap.xml`;
3. validate canonical URLs and the absence of product URLs;
4. add redirects from any legacy public brand URLs only after the final legacy
   host migration policy is approved;
5. monitor crawl errors, canonical selection and indexed manufacturer pages.

## Rollback

Rollback the hosting release first, without changing the archive or deleting
data. If DNS has already changed, restore the previous verified host records
and certificate configuration. Never enable the Russian catalogue flags as a
domain rollback mechanism.
