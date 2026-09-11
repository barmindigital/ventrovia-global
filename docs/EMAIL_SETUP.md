# Enquiry email delivery

Enquiries from the website forms (`/api/request`) are delivered to
`info@aihamyn.ae` (Google Workspace, MX `smtp.google.com`).

## How delivery works

Timeweb App Platform does not provide reverse DNS for application IPs, and
Gmail refuses mail from an IP without it. The website therefore hands each
enquiry to a small relay server that delivers it with proper sender
authentication:

```text
website (72.56.72.134) --SMTP+STARTTLS--> relay mail.aihamyn.ae (72.56.106.2) --> Google MX
```

- `app/lib/direct-mail.ts` — SMTP client (MX lookup, STARTTLS, MIME with
  attachments) and the forward-confirmed reverse DNS check.
- `app/lib/mail-relay.ts` — relay host and its pinned TLS certificate.
- `app/api/request/route.ts` — validation, message building and delivery.

Delivery starts only when `mail.aihamyn.ae` resolves to an address whose PTR
record points back to it (checked every ten minutes). If the relay cannot
accept an enquiry, the visitor gets a `mailto:` link with the enquiry
pre-filled, so nothing is silently lost. Every attempt is written to the
application log as `RFQ direct delivery`.

If `RESEND_API_KEY` is set, the route uses Resend instead of the relay.

## Relay server

Timeweb cloud server 9081233, Frankfurt, `72.56.106.2`,
Ubuntu 26.04, SSH by key only.

- Postfix relays only for `127.0.0.0/8` and the website IP `72.56.72.134`;
  `mydestination = localhost`, IPv4 only, it never stores mail for aihamyn.ae.
- OpenDKIM signs `aihamyn.ae` with selector `relay`.
- Firewall: SSH open, port 25 open only to `72.56.72.134`.
- TLS towards the website uses a self-signed certificate for
  `mail.aihamyn.ae`, valid until 2036 and pinned in `mail-relay.ts`.

## DNS (REG.RU)

| Record | Value |
| --- | --- |
| `mail` A | `72.56.106.2` |
| `@` TXT (SPF) | `v=spf1 ip4:72.56.106.2 include:_spf.google.com ~all` |
| `_dmarc` TXT | `v=DMARC1; p=none; rua=mailto:info@aihamyn.ae` |
| `relay._domainkey` TXT | DKIM public key from `/etc/opendkim/keys/aihamyn.ae/relay.txt` |
| `google._domainkey` TXT | Google Workspace DKIM |
| PTR `72.56.106.2` | `mail.aihamyn.ae` (Timeweb panel → server → Network) |

## Tests

The unit tests set `MAIL_DELIVERY=disabled`, and the browser e2e suite answers
`/api/request` inside the browser, so no test sends real mail.
