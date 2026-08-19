# Ventrovia remote-data purge policy

Audit date: 2026-08-19

Ventrovia source control and deployments are manufacturer-only. Permitted data
include the manufacturer identity index, reviewed Brand Knowledge, manufacturer
sources, English content, brand logos, SEO metadata and RFQ infrastructure.

Private legacy product records, record shards, search indexes, product evidence,
product-level review data, media indexes and archive exports are prohibited in:

- Git branches, tags, releases and workflow artifacts;
- Sites and Timeweb sources, saved builds and deployments;
- public assets, server bundles, APIs and remote admin routes;
- CI caches or downloadable backups.

The clean build must pass with no owner-private directory mounted. Product and
category routes return the ordinary 404 response; no remote admin route exposes
product-level data. Brand Health remains authenticated and uses brand-only
operational datasets.

Provider retention that cannot be deleted through available project controls is
recorded as `MANUAL_ACTION_REQUIRED`; it is never silently reported as clean.
