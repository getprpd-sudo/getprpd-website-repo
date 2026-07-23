# PRPD Business Center

Updated: July 22, 2026

## Purpose

The Business Center is the private operating view for growth and cash visibility. It combines:

- read-only Google Sheets data from `Orders`, `Payment Log`, `Website Leads`, and `Accounts Receivable`;
- booked revenue, collected cash, outstanding balances, estimated direct packed cost, and contribution;
- source, UTM, referral-code, partner, and menu-email opt-in reporting;
- a prioritized DFW partnership pipeline with editable status and notes;
- read-only TikTok Marketing API reporting with CSV fallback;
- a local expense ledger for costs not already included in meal direct cost.

It is not a replacement for the Google Sheet, bank account, tax records, or formal accounting software. Estimated contribution is not accounting profit.

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
- Outreach notes, ad imports, and manual expenses are saved atomically to `operations/private-data/business-center/state.json`.
- `operations/private-data/` is excluded from Git and Vercel.
- No outreach email is sent automatically. The UI prepares a draft for Rida to review.
- TikTok access tokens are read only by protected Vercel functions. They are never returned to the browser, saved in local Business Center state, or committed to Git.

## TikTok Reporting

The Business Center supports two reporting paths:

1. **Marketing API sync:** choose a date range and press **Sync TikTok API**. The localhost server calls the protected Vercel endpoint, which calls TikTok server-to-server and returns normalized campaign totals. This activates after an approved TikTok developer/Marketing API app, advertiser ID, and access token are configured.
2. **CSV fallback:** export a campaign report from Ads Manager and import it locally. Use this while API access is pending or to audit the API result.

Required Vercel variables are `TIKTOK_MARKETING_ACCESS_TOKEN` and `TIKTOK_ADVERTISER_ID`. The existing `PRPD_PLANNER_KEY` protects the endpoint. Never paste any access token into browser JavaScript, this document, or local Business Center state.

Pixel and Events API are a separate connection from reporting. The code now sends `Lead` and `PlaceAnOrder` through the browser Pixel and server Events API with matching event IDs. The server path activates after `TIKTOK_EVENTS_ACCESS_TOKEN` is configured. Compare Events Manager diagnostics and deduplication before using the events for campaign optimization.

## Marketing Automation Boundary

- Resend transactional receipts remain automatic.
- Promotional menu emails must use only explicit opt-ins, Resend Topics/Segments, an unsubscribe link, a valid postal address, and Rida's final send approval.
- The system may prepare a draft and scheduled time automatically; it must not silently send marketing email.
- Ad reporting may sync automatically. Ad creation, budget changes, and publishing remain manual approvals.
- Collection reminders and customer texts remain human-reviewed until PRPD adopts a compliant business messaging provider and opt-out log.
- Full research and the staged implementation path live in `MARKETING_GROWTH_PLAN.md`.

## Weekly Use

1. Sync live data.
2. Review booked versus collected revenue and outstanding balances.
3. Confirm any unmatched menu item in the direct-cost warning.
4. Sync the matching TikTok date range. Compare the first API result with a CSV export before relying on it.
5. Compare spend, attributable orders, and collected revenue.
6. Move only a few local targets forward at a time and save specific next-step notes.
7. Enter delivery, marketing, equipment, software, or kitchen expenses only when they are not already inside meal direct cost.

## Cost Model

The current direct-cost matrix comes from `costing/NEXT_MENU_DRAFT_COST_AUDIT.md`. It includes saved recipe food, the approved protein reserve, packaging, and approved consumables. It does not include owner labor or unpaid overhead. Unknown dishes are shown as a warning rather than silently assigned a guessed cost.
