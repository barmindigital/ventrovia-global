# Ventrovia global infrastructure readiness

Checked: 2026-08-19.

## Release boundary

The application is an English, manufacturer-only international website. It has
no product routes, SKU search, product API, product sitemap or public product
dataset. The owner-local Russian archive is not a runtime or build dependency.

## Active provider incident

Timeweb ticket `#12495561` covers intermittent custom-domain edge routing and
the pending `www` certificate. Until support closes or explicitly instructs a
change, the project must not alter DNS records, domain attachments, SSL
settings, application IP/networking or the `.ru` binding. Website code can be
validated and the separate Sites mirror can be updated without treating that
as proof that the Timeweb edge is fixed.

## Region and latency

The repository does not encode a Russian locale, currency or Moscow timezone.
Server-side RFQ timestamps use `Asia/Dubai`; public prices and currencies are
not fabricated. The exact Timeweb App Platform execution region is not exposed
in the repository and must be confirmed in the provider response or control
panel after the routing incident. No server migration is justified while the
current edge path is unstable.

For a worldwide audience, measure real-user performance by geography before
adding infrastructure. If static-asset and manufacturer-page latency is poor
outside the current region, the first candidate is a provider-neutral CDN with
immutable static caching and conservative HTML caching. Cloudflare is a future
option, not an active dependency and must not be inserted during incident
`#12495561`.

## Registrar and DNS

REG.RU can remain the registrar and authoritative DNS provider for an
international `.com` website. Registrar location does not set SEO geography.
The target policy remains apex canonical with a permanent `www` to apex
redirect. TTL and routing records stay frozen until the incident is resolved.

## Search readiness

- HTML language: English.
- Canonical origin: `https://ventroviaglobal.com`.
- Indexable surface: 178 BRAND_SAFE manufacturer pages only.
- Product sitemap: zero URLs.
- Organization data: Ventrovia, Dubai, UAE, worldwide service scope.
- No hreflang is emitted for languages that do not exist.

After stable production routing, add domain properties in Google Search Console
and Bing Webmaster Tools, verify ownership with provider-issued values, submit
`/sitemap.xml`, and monitor canonical selection, coverage, brand queries and
country-level performance. Do not invent verification tokens in source.

## GitHub

The source content and README identify Ventrovia. The remote repository keeps
its historical name because Timeweb deploys from it and renaming during the
current incident creates unnecessary integration risk. A future rename must be
performed only after a clean deployment is proven, followed by updating the
Timeweb GitHub integration and deploy-key label.
