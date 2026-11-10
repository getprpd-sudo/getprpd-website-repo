# PRPD Business Center

**October 5, 2026 update:** Current Batch 13 costs are regenerated from its actual recipe registry, including bundle and custom builds, and remain provisional estimates. Historical costs require matching batch records; unavailable costs must not appear as zero-cost profit. See the [cost audit](costing/BATCH_13_COST_RECONCILIATION_2026-10-05.md) and [verified payment reconciliation](active/BATCH_13_PAYMENT_RECONCILIATION_2026-10-05.md). No actual-margin claim or production deployment is implied.

Updated: August 4, 2026

## Purpose

The Business Center is the private operating view for growth and cash visibility. It combines:

- a Daily Brief view with current orders, meals, recent leads, missing order details, outstanding balances, and the three highest-priority internal actions;
- read-only Google Sheets data from `Orders`, `Payment Log`, `Website Leads`, and `Accounts Receivable`;
- booked revenue, collected cash, outstanding balances, estimated consumed-and-packed cost, operating contribution, and net cash movement;
- source, UTM, referral-code, partner, and menu-email opt-in reporting;
- a persistent Marketing Studio that turns the active menu into reviewed campaign drafts, shot lists, tracked order links, workflow status, and performance records;
- a customer lifecycle queue for post-delivery feedback, reorder follow-up, and win-back drafts;
- a service-area Google Business Profile launch kit and local verification-status record;
- a private referral-code registry and credit ledger tied to fully paid referred orders;
- a prioritized DFW partnership pipeline with offers, tasting status, unique codes, next actions, and editable notes;
- read-only TikTok Marketing API reporting with CSV fallback;
- a local purchase and expense ledger that distinguishes inventory, equipment, and current-batch operating costs.

It is not a replacement for the Google Sheet, bank account, tax records, or formal accounting software. Operating contribution and net cash movement are not accounting profit.

## Open It

Double-click `open-business-center.bat`, or start the existing local server and open:

`http://127.0.0.1:4173/operations/business-center`

The tool is localhost-only. `operations/` remains excluded from Vercel.

The launcher reads `.env.local` when secured Vercel variables have been pulled. If the full reporting endpoint and local credentials are unavailable, current Orders still sync through the protected planner endpoint and merge with the latest secured historical snapshot. The UI states this explicitly instead of presenting snapshot data as live.

The `All batches` view uses the union of batch numbers found in Orders, Payment Log, and local expenses. This preserves Batch 1 even though its original itemized Orders rows are unavailable and its history exists in Payment Log.

## Security And Storage

- The browser calls only the localhost server.
- Google credentials remain in an ignored service-account file or encrypted Vercel variables.
- The Google fallback uses the read-only Sheets scope.
- The protected Vercel endpoint requires the existing planner key and returns only four controlled ranges.
- The ignored historical snapshot lives at `operations/private-data/business-center/sheets-snapshot.json`. It contains customer operating data and must never be committed or deployed.
- Outreach notes, Google Business status, lifecycle status, the optional Google review link, marketing campaigns, ad imports, and manual expenses are saved atomically to `operations/private-data/business-center/state.json`.
- Referral owner details and balances live in the private Google Sheet tab `Referral Codes`; they are not saved in public configuration or local browser storage.
- `operations/private-data/` is excluded from Git and Vercel.
- No outreach email is sent automatically. The UI prepares a draft for Rida to review.
- Explicit customer email opt-outs are suppressed in the lifecycle queue, and Talal, Duaa, and Rida are excluded from customer marketing drafts.
- The scheduled Daily Operator Brief sends only one internal email to the configured notification address. It never contacts customers.
- TikTok access tokens are read only by protected Vercel functions. They are never returned to the browser, saved in local Business Center state, or committed to Git.

## Google Business Profile

The Growth view prepares the exact profile data, tracked order link, and service-area review list. The service areas are derived from cities in actual order history so PRPD does not accidentally claim areas it has never served.

Google account ownership and verification remain manual. Create one `PRPD` service-area profile, enter the real operating address only for verification, and hide that address from customers. Do not use a mailbox, virtual office, or the business mailing address as a storefront. Enter only staffed customer-response hours. After verification, save the public profile URL and direct review link in the Business Center.

## Referral Program

1. Create a customer or partner code in Growth. If the code is blank, the system generates one from the owner name.
2. The tracked order link is copied automatically and carries both the code and UTM attribution.
3. Checkout validates the code against the private registry. The owner cannot redeem their own code, and existing customers cannot use a first-order code.
4. The ledger counts a reward only when the referred order is fully paid in Payment Log.
5. Apply earned credit manually to a future owner order, then record `Credit used`; the available balance updates deterministically.
6. Deactivate a code immediately when a relationship ends or an offer should stop.

The initial offer is `$10` off the referred customer's first order and `$10` future credit after payment. Change this only as a deliberate program-level decision, not per conversation.

## Partnership Pipeline

Each target has one concrete offer, one unique code, a tasting state, last-contact date, next-action date, and notes. Use **Create or edit code** to move the target into the referral program, then prepare the outreach draft. Outreach remains manually reviewed and sent. Passive flyer drops do not count as a partnership test; use a tasting, approved sampling table, member challenge, or preorder pickup with measurable attribution.

## On-Demand Operator Brief

The PRPD Operator brief remains implemented in `api/operator-brief.js`, but its automatic email schedule was disabled by owner request on October 6, 2026.

- Vercel no longer calls this endpoint on a daily schedule.
- The endpoint remains available for an authenticated manual preview when the owner wants it.
- The endpoint reads the same four controlled Google Sheets ranges as the Business Center.
- Deterministic code calculates the brief; no model guesses order totals, balances, or customer status.
- Customer-profile checks validate a 10-digit phone number, email shape, street address, city, and five-digit or ZIP+4 code instead of treating any nonblank cell as valid.
- The internal profiles Talal Account, Duaa Hassan, and Rida Khan are permanent profile-check exceptions because their orders are handled internally. Their meals, revenue, payments, balances, production quantities, and receivables remain included.
- A deliberately authorized cron/manual send can still use Resend from `operations@mail.getprpd.com`; ordinary use should remain preview-only.
- Successful sends are recorded in the Google Sheet tab `Automation Log`.
- The date-based run ID and Resend idempotency key prevent duplicate daily emails.
- A planner-key-authorized request can preview JSON without sending an email.

The first version reports recent orders rather than attempting to infer edited-order history. Central website-error monitoring and Resend/TikTok delivery diagnostics remain later monitoring work.

Required production variables:

- `CRON_SECRET`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_BASE64` or `GOOGLE_SERVICE_ACCOUNT_JSON`
- `RESEND_API_KEY`
- `PRPD_PLANNER_KEY`
- `NOTIFICATION_EMAIL` (optional; defaults to `getprpd@gmail.com`)

## TikTok Reporting

The Business Center supports two reporting paths:

1. **Marketing API sync:** choose a date range and press **Sync TikTok API**. The localhost server calls the protected Vercel endpoint, which calls TikTok server-to-server and returns normalized campaign totals. This activates after an approved TikTok developer/Marketing API app, advertiser ID, and access token are configured.
2. **CSV fallback:** export a campaign report from Ads Manager and import it locally. Use this while API access is pending or to audit the API result.

Choose the matching batch before syncing or importing. New reports are tagged to that batch so the same ad spend is not deducted from every historical batch. Legacy unassigned reports remain visible in `All batches` but are excluded from individual-batch contribution.

Required Vercel variables are `TIKTOK_MARKETING_ACCESS_TOKEN` and `TIKTOK_ADVERTISER_ID`. The existing `PRPD_PLANNER_KEY` protects the endpoint. Never paste any access token into browser JavaScript, this document, or local Business Center state.

Pixel and Events API are a separate connection from reporting. The code now sends `Lead` and `PlaceAnOrder` through the browser Pixel and server Events API with matching event IDs. The server path activates after `TIKTOK_EVENTS_ACCESS_TOKEN` is configured. Compare Events Manager diagnostics and deduplication before using the events for campaign optimization.

## Marketing Automation Boundary

- Resend transactional receipts remain automatic.
- Weekly menu reminders can contact prior customers without rewriting their historical consent answer. Explicit `No` answers and the latest `Email Preferences` unsubscribe record remain authoritative, and anyone with a current-batch order is excluded.
- Scheduled sends run Monday at 6:00 PM CT, Tuesday at 6:00 PM CT, and Wednesday at 2:00 PM CT. The customer-facing checkbox discloses up to three emails per menu cycle.
- Each message contains a signed unsubscribe link and the configured `BUSINESS_POSTAL_ADDRESS`. Sending fails closed if the address is missing.
- Talal, Duaa, and Rida remain excluded from customer reminder audiences.
- Every completed, disabled, or no-recipient run is written to `Automation Log`; Resend idempotency prevents duplicate recipient sends during retries. Intentional `disabled-owner-review` and unpublished-menu runs do not send an owner notification email. Invalid stale dates still alert the owner.
- Resend acceptance is written immediately to `Email Delivery Log`. A signed webhook then updates each message to delivered, delayed, bounced, failed, suppressed, complained, opened, or clicked and sends one owner report when all recipients in a run reach a terminal delivery state.
- Ad reporting may sync automatically. Ad creation, budget changes, and publishing remain manual approvals.
- Collection reminders and customer texts remain human-reviewed until PRPD adopts a compliant business messaging provider and opt-out log.
- Full research and the staged implementation path live in `plans/MARKETING_GROWTH_PLAN.md`.

## Marketing Studio

1. Open **Marketing Studio** after the weekly menu configuration is final.
2. Select the meal that should lead the campaign and generate the weekly pack.
3. Review and edit each hook, caption, shot list, and tracked order link. Generated text is a working draft, not an automatic post.
4. Move each asset through `Idea`, `Needs footage`, `Edited`, `Approved`, and `Posted`.
5. After publishing, record the post URL, views, clicks, leads, paid orders, revenue, spend, and an honest result note.
6. Use **Copy AI analysis brief** only after results are recorded. It prepares a structured evidence packet for ChatGPT and does not invent missing metrics.
7. When the next batch pack is generated, the prior campaign is archived locally for comparison.

The first campaign pack includes a short-form menu launch, a menu carousel, a cutoff reminder, a customer email draft, and a creator tasting brief. It uses the current `config/order-config.js` menu and unique UTM links. Posting, customer sends, creator promises, and ad spend always require human approval.

## Weekly Use

1. Sync live data.
2. Review the Daily Brief and its three ranked actions.
3. Review booked versus collected revenue and outstanding balances.
4. Confirm any unmatched menu item in the direct-cost warning.
5. Sync the matching TikTok date range. Compare the first API result with a CSV export before relying on it.
6. Compare spend, attributable orders, and collected revenue.
7. Review Marketing Studio, approve only finished assets, and record results after publishing.
8. Review the lifecycle queue. Prepare only the recommended draft, edit it for the actual relationship, and record the outcome.
9. Add the verified Google review link once the Business Profile is ready. Until then, feedback drafts request a private reply only.
10. Move only a few local targets forward at a time and save specific next-step notes.
11. Classify bulk groceries as `Inventory purchase`, durable tools as `Equipment`, and current-batch delivery, kitchen, software, marketing, or other costs as operating expenses.
12. Do not enter TikTok spend manually when the same period is already synced through the TikTok report.

## Cost Model

The direct-cost matrix combines the active-menu audits in `costing/ACTIVE_MENU_PRELIMINARY_COST_AUDIT.md` and `costing/NEXT_MENU_DRAFT_COST_AUDIT.md`. It includes saved recipe food, the approved protein reserve, packaging, and approved consumables. It does not include owner labor or unpaid overhead.

The finance view intentionally reports two different operating numbers:

- **Operating contribution:** booked sales minus food actually consumed, packed cost, current-batch operating expenses, and imported ad spend.
- **Net cash movement:** cash collected minus purchases paid during the selected period and imported ad spend. Inventory and equipment purchases reduce cash movement but do not get deducted a second time from recipe contribution.

Unknown dishes are shown as an explicit warning rather than silently assigned a guessed cost. Chocolate-Dipped Cookie Dough Balls use a controlled 14 g total chocolate allowance per serving; production should still record actual coating use to validate that standard.

## Email Delivery Evidence

`Automation Log` proves that a scheduled reminder run executed. `Email Delivery Log` proves what happened to each accepted Resend message afterward.

- `accepted` means Resend accepted the API request.
- `delivered` means the recipient's mail server accepted the message.
- `bounced`, `failed`, `suppressed`, and `complained` are terminal failures or reputation signals.
- Duplicate webhook deliveries are ignored by webhook ID.
- Bounce, suppression, and complaint events also write a defensive unsubscribe preference.

Production requires `RESEND_WEBHOOK_SECRET`. The public endpoint is `/api/resend-webhook`; its signature must always be verified against the untouched raw request body.
