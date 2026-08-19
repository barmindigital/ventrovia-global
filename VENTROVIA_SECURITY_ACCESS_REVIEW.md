# Ventrovia security and access review

Audit date: 2026-08-19.

## Authenticated GitHub findings

- repository remote: `yanianya/industria-postavok`;
- repository visibility: **Private**; owner: `yanianya`;
- direct collaborators and teams: **0**;
- reachable remote refs contain only `main`; no remote tags were returned;
- reachable `main` contains zero forbidden product-data paths;
- repository forks: **0**; releases: **0**; Actions runs: **0**; Actions caches:
  **0**; repository/environment Actions secrets and variables: **0**;
- no Git LFS configuration and no `.github/workflows` are present;
- one read/write deploy key, titled `Индустрия поставок — загрузка проекта`, was
  used within the last week. Keep it until a replacement deployment path is
  tested;
- one active Timeweb webhook targets the Timeweb Cloud App API. GitHub reports
  no deliveries yet;
- the Timeweb Cloud GitHub App has access only to this repository and is the
  expected deployment integration;
- the Railway App is installed with access to all repositories and broad
  repository permissions, but its user authorization is reported as never
  used. This is `MANUAL_ACCESS_REVIEW_REQUIRED`;
- fine-grained token `Timeweb Admin CMS` is limited to this repository with
  metadata read and code read/write access; GitHub reports it as never used;
- fine-grained token `bitrix-report-trigger` is limited to another repository
  and is unrelated to Ventrovia. No classic personal access tokens exist;
- the Resend OAuth application is authorized but reported as never used;
- GitHub lists the current browser session and two stale browser sessions. The
  owner must confirm the stale sessions before revocation;
- no account-level SSH or GPG keys are configured. The repository deploy key is
  separate from account SSH keys;
- classic branch protection is not configured on `main`.

Current conclusion: reachable Git history and provider-visible downloadable
objects are clean. No other person has direct repository access. Railway,
stale browser sessions and the unused `Timeweb Admin CMS` token require an
owner decision; they were not revoked automatically.

## Manual access-closure checklist

Sign in as `yanianya`, then:

1. **Settings → Applications → Installed GitHub Apps → Railway App**: confirm a
   current business need. If none exists, remove Railway access. Expected
   result: Timeweb remains installed and the repository still deploys.
2. **Settings → Sessions**: open both stale macOS sessions and revoke only those
   the owner does not recognize. Expected result: only known sessions remain.
3. **Developer settings → Fine-grained tokens → Timeweb Admin CMS**: keep only
   if the authenticated content editor will be used. Otherwise delete it after
   verifying that Timeweb deployment still works.
4. After the new Timeweb deployment succeeds, replace the old Russian-named
   deploy key with a new Ventrovia deployment credential, verify one deploy,
   then delete the old key.
5. Add a `main` ruleset requiring intentional changes and preventing accidental
   force pushes. Do not enable a rule that blocks the current automated deploy
   until its compatibility is tested.

GitHub documents artifact/run removal at
`https://docs.github.com/en/actions/how-tos/manage-workflow-runs` and cache
removal at
`https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manage-caches`.

## Credential rotation plan

Rotate after replacement credentials are installed and tested, in this order:

1. GitHub deployment/content token or deploy key;
2. Timeweb deployment token and repository integration;
3. Sites source credentials (short-lived credentials should simply expire);
4. Resend/API mail credential after domain verification;
5. `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`;
6. any other production API key found in Timeweb environment settings.

Never display old values, commit new values, or revoke the only working
deployment credential before a replacement succeeds.
