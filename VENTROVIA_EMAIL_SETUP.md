# Ventrovia email setup

Target recipient: `sales@ventroviaglobal.com`.

## Current public DNS evidence

- MX: priority 1, `smtp.google.com`;
- Google ownership TXT: present;
- Google DKIM selector `google._domainkey`: present;
- root SPF: absent;
- DMARC at `_dmarc`: absent;
- mailbox existence, outbound authorization and real delivery: unverified;
- Timeweb Mail is not provisioned for this account; mail is external;
- current Sites environment: no production variables, therefore RFQ delivery
  intentionally returns HTTP 503 with a visible `mailto:` fallback.

The MX and DKIM records strongly indicate a partial Google Workspace setup, but
they do not prove that the `sales` mailbox exists or receives mail.

## Receiving mailbox

1. Sign in to `https://admin.google.com` as a domain administrator.
2. Open **Account → Domains → Manage domains** and confirm
   `ventroviaglobal.com` is verified and Gmail is activated.
3. Open **Directory → Users** and confirm an active, licensed
   `sales@ventroviaglobal.com` user or documented Group/alias with a real
   recipient. Create it only under the chosen company policy.
4. Send a message from an unrelated external mailbox and verify it appears in
   the intended inbox. An SMTP/API success alone is not delivery proof.

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
   Ventrovia. Do not invent a reporting address. Review reports before moving
   to quarantine/reject.

Official references:

- Google SPF: `https://support.google.com/a/answer/33786`
- Google DMARC rollout: `https://support.google.com/a/answer/10032473`
- Resend domain verification: `https://resend.com/docs/dashboard/domains/introduction`

## Application transport

After the Resend sending domain is verified, set these server-side in Timeweb:

```text
REQUEST_TO_EMAIL=sales@ventroviaglobal.com
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

Until this test passes: `BLOCKED_EMAIL_MAILBOX_SETUP` and
`BLOCKED_EMAIL_TRANSPORT_VERIFICATION`.
