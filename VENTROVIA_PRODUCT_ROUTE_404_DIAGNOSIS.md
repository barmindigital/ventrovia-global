# Ventrovia product-route 404 diagnosis

Audit date: 2026-08-24

## Finding

Product URLs return the ordinary Ventrovia 404 page by design. This is not a
Timeweb routing failure and it is not caused by the manufacturer Brand Factory.
The international application is intentionally manufacturer-only.

## Direct cause

The Next.js application contains no route modules for `/catalog`, `/products`,
product categories, SKU pages, or `/api/products`. Requests to those paths do
not match an application route and therefore fall through to `app/not-found.tsx`.

`app/sitemap.ts` publishes corporate pages and indexable `BRAND_SAFE`
manufacturer pages only. It does not publish product URLs.

## Enforced project boundary

The current repository policy explicitly excludes the private Russian product
dataset, product search indexes, product APIs, product routes, and product-level
administration from Ventrovia. Automated release tests require the catalog,
product payload, product API, product admin, and representative product routes
to return 404 and require recoverable product stores to be absent from the
repository and deployment.

The reachable Git history contains no current product-route or product-data
path. Historical private product data was separated from the brand-only
repository and retained outside the Ventrovia runtime according to the purge
policy.

## Residual non-runtime code

`app/globals.css` still contains legacy catalog-oriented class definitions.
Those unused styles do not create routes, load product data, or make the catalog
recoverable. They can be removed later as a dead-CSS cleanup, but their presence
does not explain or change the 404 behaviour.

## Conclusion

`/catalog`, product pages, legacy SKU URLs, and `/api/products` return 404 because
the route handlers and their datasets were deliberately removed from the
international application. Restoring them would be a separate product decision
requiring a new, explicitly authorised architecture and data boundary; it is
not a deployment repair.
