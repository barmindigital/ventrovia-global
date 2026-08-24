# Ventrovia analytics event contract — provider not connected

Checked: 2026-08-24

No GA4, Search Console, Bing or other owner-issued identifier is configured by
this contract. Optional analytics must remain disabled until the owner selects a
provider and the consent/privacy decision is implemented.

## Privacy rules

- Never send names, email addresses, telephone numbers, messages, uploaded file
  names, part numbers, specifications or other RFQ content.
- Manufacturer search values must be normalised or aggregated before leaving the
  first-party boundary; raw free-text searches may contain confidential data.
- Events must not be emitted before optional-analytics consent when the selected
  provider requires it.
- `rfq_success` is emitted only after the server confirms durable delivery or
  storage. An HTTP request start or client-side validation pass is not success.
- Current forms remain `SAFE_FAILURE`; therefore current production must not emit
  `rfq_success`.

## Event names and allowed fields

| Event | Trigger | Allowed fields |
|---|---|---|
| `manufacturer_search` | User submits or changes a manufacturer-directory query | `query_length`, `result_count` |
| `manufacturer_zero_result` | A completed manufacturer search returns no matches | `query_length` |
| `manufacturer_view` | A public manufacturer profile is rendered | `manufacturer_slug`, `source_page` |
| `request_offer_click` | Primary Request an Offer action opens or navigates | `source_page`, `manufacturer_slug?` |
| `send_specification_click` | Specification action opens | `source_page`, `manufacturer_slug?` |
| `email_click` | Approved public email link is activated | `source_page` |
| `phone_click` | Approved public phone link is activated | `source_page` |
| `form_start` | First meaningful interaction with an enquiry form | `form_type`, `source_page`, `manufacturer_slug?` |
| `form_error` | Validation or transport fails | `form_type`, `error_class`, `source_page` |
| `rfq_success` | Server confirms real durable delivery/storage | `form_type`, `source_page`, `manufacturer_slug?` |

`manufacturer_slug` is the public canonical identifier, not a product ID. No
product, SKU or private-catalogue field is permitted.

## Implementation gate

Before activation, add an owner-issued provider ID through server environment
configuration, document consent behaviour, test opt-out and event suppression,
verify that failed forms emit only `form_error`, and inspect the production
network payload for prohibited fields. Do not hardcode provider IDs in source.
