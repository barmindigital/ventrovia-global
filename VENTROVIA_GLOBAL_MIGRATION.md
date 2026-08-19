# Ventrovia global migration

## Outcome

The public application is now an English-language international industrial
sourcing site under the Ventrovia identity. Manufacturer knowledge remains the
public SEO asset. The former Russian product catalogue is a separate versioned
archive and is not loaded by the international runtime.

## Brand and contact source of truth

`app/lib/site-brand.ts` defines:

- VENTROVIA / Ventrovia;
- GLOBAL INDUSTRIAL TRADE;
- `https://ventroviaglobal.com`;
- `sales@ventroviaglobal.com`;
- `+971 55 725 4463` / `tel:+971557254463`;
- Office 29c02, 29th Floor, I-Rise Tower, Hessa Street, Barsha Heights,
  Dubai, UAE;
- English, worldwide market and Dubai base location;
- all production brand-asset paths.

## Public runtime boundary

The international build has no public product list, product search, category
list, SKU content, product schema, product sitemap or product JSON endpoint.
Legacy catalogue paths render one neutral, `noindex, follow` RFQ page without
reading the archive. Public product illustrations and the old company
presentation were moved to internal archive directories.

The generated private catalogue loader is empty unless a separate archive
runtime explicitly enables `RUSSIAN_CATALOG_ARCHIVE_RUNTIME_ENABLED`. Setting
only `PRODUCT_CATALOG_PUBLIC_ENABLED=true` cannot restore catalogue data to the
international deployment.

## Manufacturer knowledge migration

All 2,806 manufacturer identities are preserved in a compact English public
directory without historical product counts. The 146 source-verified profiles
retain their verification status and now have separate `EN_CONTENT_READY` and
`EN_SEO_READY` states. English text is generated from existing official-source
facts, not by translating unsupported Russian catalogue assertions.

The manufacturer sitemap includes only these 146 English-ready profiles. The
product sitemap count is zero.

## Known external blockers

- `BLOCKED_EMAIL_INFRASTRUCTURE`: mailbox/MX/sending-domain configuration is
  external and must be completed before automated RFQ delivery is claimed.
- `BLOCKED_DOMAIN_DNS`: DNS, TLS and final custom-domain attachment require the
  production hosting and DNS accounts.
- `BLOCKED_TIMEWEB_AUTH`: if the legacy Timeweb project still requires user
  authorisation, the migration does not bypass it.

The Sites mirror can be deployed independently after all local release gates
pass. Custom-domain operations remain a separate approved step.
