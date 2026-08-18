# Google Ads Order Funnel

Verified: August 5, 2026

## Live Campaign

- Campaign: `PRPD | Search | North DFW`
- Status: **Enabled — Eligible (Learning)**
- Budget: **$15/day**
- Bid strategy: Maximize Clicks with a **$3.50 maximum CPC**
- Goal: campaign-specific **Purchase**; Google reports the goal as Healthy/Active
- Network: Google Search only
- Location policy: presence-only targeting for Allen, Carrollton, Frisco, Little Elm, McKinney, Plano, and Prosper
- Auto-tagging: on
- The separate generic `Campaign #2` remains paused and is not part of this funnel.

## Customer-To-Record Flow

1. A local searcher clicks the Google Search ad and lands on `https://getprpd.com/order`.
2. Google auto-tagging adds a `gclid`, `gbraid`, or `wbraid` when applicable. The order page retains that identifier for the session and classifies the visit as `google / cpc` when no manual UTM source is present.
3. The customer completes the normal required order fields and submits the order.
4. `/api/order` validates the cutoff, customer/contact/address fields, menu items, quantities, referral code, and all server-owned prices.
5. The server writes the canonical order to `Orders` and the amount due to `Payment Log`.
6. `Orders` stores the existing UTM/landing/referrer fields plus Google click ID, click-ID type, match type, device, and network when available. These fields are for internal attribution and possible later reconciliation; they are not displayed publicly.
7. Resend independently sends:
   - the owner notification to the established PRPD operations inbox, including a readable acquisition section such as `Google Ads / Search`; and
   - the itemized order-received and Zelle-instruction email to the customer.
8. The server sends the existing fail-soft TikTok `PlaceAnOrder` event. TikTok failure cannot block the order, Sheet writes, or emails.
9. Only after `/api/order` returns success, the browser sends the Google Ads completed-order conversion with the confirmed order value, `USD`, and the order ID as the transaction ID.

## Measurement Meaning

- A Search ad click is traffic, not a lead or sale.
- A homepage intake submission is a Website Lead and follows the separate `/api/lead` funnel.
- A successful weekly order submission is the campaign's primary Google Ads Purchase conversion.
- Payment remains a separate operational confirmation through Zelle. The current Google goal measures a validated order, not a cleared bank payment.

## Current Baseline

The live Google Sheet showed four active Batch 5 order accounts totaling **$457** after the earlier $77 submission and its matching Payment Log record were removed on August 5; the verified second submission for $88 remains. Their stored UTM source fields were blank, so they remain `Direct / unattributed`; do not retroactively label them as Google-generated. Google campaign performance was still at zero impressions and zero clicks immediately after enablement.

### 4:19 PM Central live delivery check

- The intended campaign remains **Enabled — Eligible (Learning)** at **$15/day**.
- Google diagnostics says the campaign is published, the new bid strategy is learning, and both impressions and clicks are still upcoming.
- The live campaign dashboard displayed **0 impressions, 0 clicks, $0.00 average CPC, and $0.00 cost**.
- The responsive Search ad remains **Enabled — Eligible**.
- The campaign still targets the same seven cities: Allen, Carrollton, Frisco, Little Elm, McKinney, Plano, and Prosper.
- The live Google Sheet still contains **0 Google-attributed Batch 5 orders**.
- The account conversion overview shows one unverified action and no recording conversions yet. The production completed-order event remains deployed and tested; do not change bidding or duplicate the conversion action while the new campaign and tag verification are still propagating.

## Operating Review

- Check impressions, clicks, actual CPC, search terms, and completed-order conversions after the campaign has had time to enter auctions.
- Keep the $3.50 CPC cap during the initial learning period.
- Do not raise the cap merely because the first few hours show zero impressions.
- Review search terms before adding keywords or negatives.
- Reconcile Google-attributed orders against the owner email, `Orders`, `Payment Log`, and Google Ads transaction IDs without exposing customer data.
