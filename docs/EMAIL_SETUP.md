# Aihamyn Hampa Trading email setup

Target recipient: `info@aihamyn.ae`.

Operational status: `MAILBOX_ACCESS_UNAVAILABLE` and
`EMAIL_PRODUCTION = BLOCKED_MAILBOX_ACCESS`.

Mailbox access belongs to the mailbox owner. Do not attempt password recovery,
login, ownership changes or mailbox creation without their separate
authorization. This blocker does not block the website itself: until delivery
is verified the RFQ form returns a visible error with a `mailto:` fallback.

## Current public DNS evidence

- MX: priority 1, `smtp.google.com`;
- Google ownership TXT: present;
- Google DKIM selector `google._domainkey`: present;
- root SPF: absent;
- DMARC at `_dmarc`: absent;
- mailbox existence, outbound authorization and real delivery: unverified;
- Timeweb Mail is not provisioned for this account; mail is external;
- production has no mail variables yet, therefore RFQ delivery intentionally
  returns HTTP 503 with a visible `mailto:` fallback.

The MX and DKIM records strongly indicate a partial Google Workspace setup, but
they do not prove that the `sales` mailbox exists or receives mail.

## Relay delivery (current transport, no provider account)

Timeweb does not set reverse DNS for App Platform IPs, and Gmail refuses mail
from an IP without it, so the website does not deliver mail itself. Without
`RESEND_API_KEY`, `/api/request` hands each enquiry over SMTP (STARTTLS, pinned
certificate) to our relay server, which delivers it to `info@aihamyn.ae` only
(`app/lib/direct-mail.ts`, `app/lib/mail-relay.ts`).

Relay: Timeweb cloud server 9081233 "Ambitious Aquila", Frankfurt, 72.56.106.2,
710 ₽/month, Ubuntu 26.04, SSH key `aihamyn_timeweb_ed25519` only.

- Postfix relays only for `127.0.0.0/8` and the website IP `72.56.72.134`;
  `mydestination = localhost`, so it never stores mail for aihamyn.ae and sends
  everything to the recipients' MX over IPv4.
- OpenDKIM signs `aihamyn.ae` with selector `relay`
  (`/etc/opendkim/keys/aihamyn.ae/relay.txt` holds the DNS value).
- The firewall allows SSH from anywhere and port 25 only from 72.56.72.134.
- TLS for the website connection uses a self-signed certificate for
  mail.aihamyn.ae valid until 2036; the website pins it.

DNS for the relay:

1. `mail.aihamyn.ae` A → `72.56.106.2`.
2. SPF: `v=spf1 ip4:72.56.106.2 include:_spf.google.com ~all`.
3. PTR for 72.56.106.2 → `mail.aihamyn.ae` (Timeweb panel, server → Сеть).
4. DKIM: TXT `relay._domainkey` with the value from relay.txt.

Until step 3 is visible in DNS the route makes no delivery attempt: it checks
every ten minutes that mail.aihamyn.ae resolves to an address whose PTR points
back to it and keeps the `mailto:` fallback meanwhile. Every attempt is logged
as `RFQ direct delivery`.

Tests set `MAIL_DELIVERY=disabled` so no test ever sends real mail.

## Receiving mailbox — deferred owner action

Only an authorized mailbox/domain administrator may later confirm Gmail,
mailbox or group/alias state and perform a real inbox-delivery test. Until that
happens, the address may remain visible as the approved public contact address,
but the application must not claim that form submissions are delivered there.

Google's current Workspace MX target is `smtp.google.com`; the published MX
already matches it. Official instructions:
`https://support.google.com/a/answer/87127`.

## Sender authentication

1. List every sender: Google Workspace and the web-form transport (currently
   designed for Resend).
2. If Google Workspace is the only sender at the root domain, publish the
   Google-recommended root TXT value
   `v=spf1 include:_spf.google.com ~all`. If another root-domain sender is used,
   calculate one combined SPF record; never publish multiple SPF records.
3. In Resend, add the selected sending domain and copy the exact SPF/MX/DKIM
   records displayed by its dashboard. Resend recommends a sending/return-path
   subdomain; do not add Resend receiving MX records at the root because that
   can conflict with Google Workspace.
4. Confirm both Google and Resend DKIM checks are green.
5. After SPF/DKIM have been stable for at least 48 hours, add DMARC with an
   initial monitoring policy (`p=none`) and a reporting mailbox controlled by
   Aihamyn Hampa Trading. Do not invent a reporting address. Review reports before moving
   to quarantine/reject.

Official references:

- Google SPF: `https://support.google.com/a/answer/33786`
- Google DMARC rollout: `https://support.google.com/a/answer/10032473`
- Resend domain verification: `https://resend.com/docs/dashboard/domains/introduction`

## Application transport

After the Resend sending domain is verified, set these server-side in Timeweb:

```text
REQUEST_TO_EMAIL=info@aihamyn.ae
REQUEST_FROM_EMAIL=<exact verified sender accepted by Resend>
RESEND_API_KEY=<new server-side secret>
```

Keep the API key out of Git. Deploy, submit one controlled inquiry with a unique
subject, and verify all of the following:

- API reports success;
- the message arrives in the actual `sales` inbox;
- Reply-To is the test requester's address;
- page/manufacturer attribution is present;
- a transport failure returns an honest error and never a success message.

Until this test passes: `BLOCKED_MAILBOX_ACCESS` and
`BLOCKED_EMAIL_TRANSPORT_VERIFICATION`. The current project has no proven
independent server-side enquiry store, so forms must return a visible safe
failure instead of a success response whenever delivery is unavailable.
