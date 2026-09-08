# Deployment

## Target

- Primary origin: `https://aihamyn.ae`
- Secondary host: `www.aihamyn.ae`, permanently redirected to the apex
  (configured in `next.config.ts`)
- Hosting: Timeweb App Platform, backend application `ventrovia` (ID 250775,
  Amsterdam, Node.js 24), built from the `main` branch of
  `barmindigital/ventrovia-global`. The repository is connected by URL, so
  auto-deploy is off: after pushing `main`, open the app's **Деплой** tab and
  start a deploy manually. Build command `pnpm install --frozen-lockfile &&
  pnpm run build:timeweb`, start command `pnpm run start:timeweb`, health
  check path `/`. Public IP `72.56.72.134`.
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
2. Push `main`, then start a deploy from the Timeweb **Деплой** tab (the app
   builds with `pnpm build:timeweb` and starts with `pnpm start:timeweb`).
3. In Timeweb **Settings → Domains** both `aihamyn.ae` and
   `www.aihamyn.ae` must be attached; copy the exact A/CNAME targets
   the panel shows.
4. At REG.RU point the apex and `www` records to those targets. Do not guess an
   IP address.
5. Wait for propagation and for Let's Encrypt certificates on both hosts.
6. Verify on the live hostname: `/`, `/manufacturers`, one manufacturer page,
   `/robots.txt`, `/sitemap.xml`, and that `www` redirects once to the apex.

## Search engines

After the domain serves the release, verify ownership in Google Search Console
and Bing Webmaster Tools from the owner's own accounts and submit
`https://aihamyn.ae/sitemap.xml`. Only manufacturers with verified
profiles are listed in the sitemap; the remaining identities stay `noindex`.

## Rollback

Redeploy the previous successful build from the Timeweb deployments list.
DNS does not need to change for an application rollback.
