# Ventrovia

International manufacturer knowledge base and industrial RFQ website for
`ventroviaglobal.com`.

## Runtime scope

The repository is brand-only. It contains manufacturer identities, reviewed
Brand Knowledge, approved logo assets, English public content, SEO metadata,
RFQ infrastructure and the website application. It contains no SKU database,
product-search index, product route, product API or product-level admin.

The owner's separate legacy dataset is not a project dependency and must never
be copied into this repository, a deployment, a CI artifact or a public asset.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm brands:directory
pnpm brands:international
pnpm brands:operations
pnpm check
pnpm audit:international
pnpm audit:bundle
pnpm audit:visual
```

`pnpm build` creates the Sites-compatible production bundle. Timeweb uses
`pnpm build:timeweb`. Both builds are required to succeed without any private
owner data mounted.

## Data boundaries

- `data/manufacturers/identities.json`: compact 2,703-manufacturer identity index.
- `data/brand-sources/`: reviewed manufacturer-owned source facts.
- `data/brand-knowledge-international/`: English public Brand Knowledge profiles.
- `data/brand-operations/`: private brand-health reports used only by authenticated admin routes.
- `public/images/brand-logos/`: reviewed publishable brand assets.

Operational brand reports must stay server-side. Public pages may import only
the compact identity directory and public English profiles.

## Deployment

The canonical base URL is `https://ventroviaglobal.com`. DNS changes remain a
separate owner-approved operation; see `VENTROVIA_DOMAIN_MIGRATION.md`.

The GitHub repository keeps its historical remote name while Timeweb incident
`#12495561` is open. Renaming the repository during an active deployment-routing
incident could disrupt the existing integration and is intentionally deferred.
