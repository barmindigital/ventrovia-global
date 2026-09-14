# Deployment

## Target

- Primary origin: `https://aihamyn.ae`
- Secondary host: `www.aihamyn.ae`, permanently redirected to the apex
  (configured in `next.config.ts`)
- Hosting: Timeweb App Platform, backend application `AIHAMYN` (ID 250775,
  Amsterdam, Node.js 24), built from the `main` branch of the private
  repository `yanianya/aihamyn`, connected through the Timeweb GitHub
  integration. Build command `pnpm install --frozen-lockfile &&
  pnpm run build:timeweb`, start command `pnpm run start:timeweb`, health
  check path `/`. Public IP `72.56.72.134`.
- Enquiry mail relay: Timeweb cloud server `aihamyn-mail` (`72.56.106.2`,
  `mail.aihamyn.ae`), see `docs/EMAIL_SETUP.md`.
- Registrar and authoritative DNS: REG.RU (`ns1.reg.ru`, `ns2.reg.ru`)

## Environment variables

Set these in the hosting control panel (never commit them):

```text
ADMIN_PASSWORD=<strong password>
ADMIN_SESSION_SECRET=<random secret>
REQUEST_TO_EMAIL=info@aihamyn.ae   # optional, this is the default
RESEND_API_KEY=                    # optional; without it enquiries use the mail relay
```

## Release checklist

1. `pnpm check` passes locally.
2. Push `main`. The deploy commit is pinned: in Timeweb open
   **Настройки → Настройки деплоя**, select the new commit, press
   **Сохранить данные** and confirm **Запустить** (the app builds with
   `pnpm build:timeweb` and starts with `pnpm start:timeweb`).
3. In Timeweb **Settings → Domains** both `aihamyn.ae` and
   `www.aihamyn.ae` must be attached; copy the exact A/CNAME targets
   the panel shows.
4. At REG.RU point the apex and `www` records to those targets. Do not guess an
   IP address.
5. Wait for propagation and for Let's Encrypt certificates on both hosts.
6. Run `pnpm test:e2e:full` against the live site.

## Search engines

After the domain serves the release, verify ownership in Google Search Console
and Bing Webmaster Tools from the owner's own accounts and submit
`https://aihamyn.ae/sitemap.xml`. Only manufacturers with verified
profiles are listed in the sitemap; the remaining identities stay `noindex`.

## Rollback

Redeploy the previous successful build from the Timeweb deployments list.
DNS does not need to change for an application rollback.
