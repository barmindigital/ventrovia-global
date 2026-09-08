# Deployment

## Target

- Primary origin: `https://ventroviaglobal.com`
- Secondary host: `www.ventroviaglobal.com`, permanently redirected to the apex
  (configured in `next.config.ts`)
- Hosting: Timeweb App Platform, application `industria-postavok` (ID 231783),
  deployed automatically from the `main` branch of the GitHub repository
- Registrar and authoritative DNS: REG.RU (`ns1.reg.ru`, `ns2.reg.ru`)

## Environment variables

Set these in the hosting control panel (never commit them):

```text
ADMIN_PASSWORD=<strong password>
ADMIN_SESSION_SECRET=<random secret>
REQUEST_TO_EMAIL=sales@ventroviaglobal.com
REQUEST_FROM_EMAIL=Ventrovia RFQ <requests@ventroviaglobal.com>
RESEND_API_KEY=<server-side secret, only after EMAIL_SETUP.md is complete>
```

## Release checklist

1. `pnpm check` passes locally.
2. Push `main`; Timeweb builds with `pnpm build:timeweb` and starts with
   `pnpm start:timeweb`.
3. In Timeweb **Settings → Domains** both `ventroviaglobal.com` and
   `www.ventroviaglobal.com` must be attached; copy the exact A/CNAME targets
   the panel shows.
4. At REG.RU point the apex and `www` records to those targets. Do not guess an
   IP address.
5. Wait for propagation and for Let's Encrypt certificates on both hosts.
6. Verify on the live hostname: `/`, `/manufacturers`, one manufacturer page,
   `/robots.txt`, `/sitemap.xml`, and that `www` redirects once to the apex.

## Search engines

After the domain serves the release, verify ownership in Google Search Console
and Bing Webmaster Tools from the owner's own accounts and submit
`https://ventroviaglobal.com/sitemap.xml`. Only manufacturers with verified
profiles are listed in the sitemap; the remaining identities stay `noindex`.

## Rollback

Redeploy the previous successful build from the Timeweb deployments list.
DNS does not need to change for an application rollback.
