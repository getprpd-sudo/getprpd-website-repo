# PRPD Automation Roadmap

Updated: July 23, 2026

This document defines the practical "PRPD Operator" system: an internal assistant that watches connected business data, identifies exceptions, prepares work, and drafts decisions for Rida. It is not an autonomous customer chatbot and it does not replace food-safety, recipe, payment, or customer-service judgment.

## Operating Principle

Use deterministic code for exact facts and AI for interpretation:

- Code calculates orders, quantities, totals, balances, dates, inventory requirements, and conversion rates.
- AI summarizes, compares, prioritizes, explains anomalies, and drafts messages or content.
- Rida approves customer communication, menu changes, recipes, prices, refunds, advertising changes, and public content.

This matches the business's present scale and the industry direction. The National Restaurant Association reports that operators are prioritizing digital/local marketing, loyalty, back-office systems, and inventory management, while NIST recommends clearly defined human oversight for AI systems.

## What Is Connected Now

| Area | Current capability | Status |
|---|---|---|
| Website orders | Validated orders, itemized totals, attribution, confirmation email, Google Sheets write | Working |
| Leads | Intake records, attribution, notification email, Google Sheets write | Working |
| Production | Live orders feed Cook-Day Planner and Grocery Builder | Working |
| Finance | Orders, Payment Log, Accounts Receivable, expenses, costs, and historical batches feed Business Center | Working |
| Transactional email | Resend sends customer order confirmations | Working |
| TikTok conversion data | Browser Pixel plus server Events API for `Lead` and `PlaceAnOrder`, with shared event-ID deduplication | Working and production-verified |
| TikTok reporting | Protected read-only Marketing API endpoint and CSV fallback | Endpoint built; developer-app advertiser authorization still required |
| Local growth | DFW outreach pipeline and source/referral attribution | Working |
| Menu marketing email | Consent captured with orders | Sending intentionally blocked until postal address and unsubscribe workflow are ready |

## The PRPD Operator

The system should have four layers.

### 1. Observation

Collect facts from:

- Orders, leads, payments, receivables, referrals, and consent in Google Sheets
- TikTok conversion events and, later, ad-spend reporting
- Resend delivery, bounce, and unsubscribe events
- Gmail customer replies when explicitly connected
- Grocery receipts and pantry counts
- Cook Log yields, timing, waste, quality, and notes
- Website errors and failed order or lead submissions

### 2. Rules

Rules run before AI and create reliable exceptions:

- New lead has no recorded response after a set period
- Confirmed order is missing phone, address, tier, or payment
- Duplicate or malformed order
- Unpaid order is approaching prep day
- Orders exceed stated kitchen capacity
- Ingredient requirement exceeds recorded inventory
- Grocery price increased materially from the saved baseline
- Planned and actual cooked yield differ beyond tolerance
- Website form, Sheets write, email, or TikTok event failed
- Customer skipped two consecutive menus
- Paid advertising is producing clicks or leads but no paid orders

### 3. Reasoning and Drafting

AI turns the exception list and weekly numbers into:

- A short morning operator brief
- Ranked follow-up drafts for leads and unpaid customers
- Plain-language explanations of cost, yield, or conversion changes
- A post-batch review with recipe and process improvement candidates
- Content hooks, captions, and shot lists based only on real PRPD footage and customer questions
- Suggested local partnership follow-ups

AI never silently edits source records. Every recommendation cites the data that caused it.

### 4. Approval and Action

Low-risk actions may be automatic:

- Refresh read-only reports
- Generate a brief
- Create a draft
- Flag an exception
- Archive a completed internal snapshot

Human approval is required for:

- Sending promotional email or text
- Customer promises, refunds, disputes, allergy claims, or delivery exceptions
- Ad publishing, budget changes, targeting changes, or winner selection
- Recipe, nutrition, price, inventory, or order changes
- Public social content

## Recommended Build Sequence

### Phase 1: Daily Operator Brief

Implementation status: built and locally verified on July 23, 2026. Production activation requires `CRON_SECRET` and deployment.

A secured daily job reads the current connected records and prepares one brief containing:

1. New leads and how long each has waited
2. New and changed orders
3. Missing addresses or contact details
4. Paid, unpaid, and consolidated outstanding balances
5. Production capacity and order cutoff status
6. Data-delivery failures from Sheets, Resend, TikTok, or website APIs
7. The three highest-priority actions for Rida

Delivery should initially be one internal email to Rida and one Business Center view. Do not automatically contact customers.

Implemented controls:

- secured Vercel endpoint at `/api/operator-brief`;
- daily Vercel Cron schedule at `0 14 * * *` UTC;
- one internal Resend email to Rida;
- Daily Brief view in the local Business Center;
- Google Sheets `Automation Log` send ledger;
- one Chicago-date run ID plus Resend idempotency;
- planner-key JSON preview that does not send email;
- no customer messaging, record edits, ad changes, or AI-generated financial values.

The current source data supports recent-order reporting but not a reliable audit trail of changed orders. Website-error aggregation and Resend/TikTok delivery-health monitoring remain future work.

### Phase 2: Lead and Customer Follow-Up Queue

- Draft a personal first response using the lead's name, goal, city, and source.
- Flag unreplied leads and show the recommended next action.
- Prepare, but do not send, payment reminders and missing-address requests.
- Create win-back drafts for consented customers who skipped two menus.
- Record reviewed/sent/dismissed status so the same person is not repeatedly flagged.

### Phase 3: Weekly Cycle Orchestrator

The system should understand the operating week:

- **Menu open:** verify menu, images, prices, ordering status, and links; prepare the consented menu-email draft.
- **Before cutoff:** report missing payments/details and available capacity.
- **After cutoff:** freeze the reviewed order set and regenerate labels, groceries, production counts, and pack-out.
- **Prep day:** surface pantry gaps, raw pulls, sauces, desserts, labels, and food-safety checks.
- **Cook day:** use Kitchen Queue and record actual yield, time, waste, and exceptions.
- **Delivery day:** verify customer pack-out, address, payment state, and delivery status.
- **Closeout:** reconcile revenue, collections, expenses, food cost, acquisition, repeats, and production variance.

### Phase 4: Receipt, Inventory, and Production Learning

- Accept a receipt image and extract line items into a review screen.
- Match known products to the grocery catalog and retain the receipt as evidence.
- Ask Rida only about ambiguous or household items.
- Accept voice notes after cooking and convert them into structured raw weight, cooked yield, portions, time, waste, and taste notes.
- Recommend updated yield assumptions only after repeated evidence; never change a recipe automatically.
- Add par levels only for repeatedly used, shelf-stable, or frozen items.

### Phase 5: Marketing and Growth Analyst

- Complete TikTok Marketing API authorization and reconcile spend with Events API conversions.
- Calculate cost per lead, first paid customer, and repeat customer by campaign and creator code.
- Flag creative fatigue, weak landing-page conversion, and campaigns exceeding the approved acquisition threshold.
- Build a real-media content library tagged by dish, hook, audience, result, and usage rights.
- Draft a weekly content plan and partnership follow-ups.
- Keep advertising changes behind approval.

### Phase 6: Customer Lifecycle

Build only after consent and communication records are reliable:

- Menu-open and cutoff email drafts
- Honest review requests after confirmed delivery
- Referral and creator-code reporting
- Repeat-customer and win-back segments
- Reorder shortcuts based on the customer's own prior order
- A future business texting provider with opt-out, logging, and escalation

## What Not To Build Yet

- An autonomous customer chatbot that can invent answers
- Automatic ad-budget or targeting changes
- Automatic purchasing from suppliers
- Automatic recipe, nutrition, price, or production edits
- Mass cold outreach
- Predictive inventory models before several clean weekly closeouts exist
- A large POS, ERP, or warehouse system for a roughly 10-to-20-client operation

## Scheduling and Cost

Version 1 can reuse Vercel, Google Sheets, Resend, Gmail, and the existing Business Center. Vercel Cron is available on Hobby, but Hobby jobs run at most daily and may execute at any point within the selected UTC hour. A daily brief fits that limit. Every scheduled endpoint must use `CRON_SECRET`, idempotency, and a send ledger so retries cannot duplicate messages.

Continuous AI processing would add model usage cost, but one compact daily brief and one weekly closeout should remain small. Do not add a separate automation subscription until the current stack cannot reliably support a measured workflow.

## Success Measures

The automation is useful only if it improves one of these:

- Median time from lead submission to personal response
- Missing or unpaid orders caught before prep
- Minutes spent assembling weekly reports
- Grocery variance and food waste
- Planned-versus-actual production yield
- Customer reorder rate
- Paid first-customer acquisition cost
- Number of operator mistakes or repeated manual reconciliations

Review results after four complete batches. Keep, change, or remove each automation based on measured value.

## Research Basis

- National Restaurant Association Technology Landscape Report: https://restaurant.org/research-and-media/research/research-reports/2024-technology-landscape-report/
- National Restaurant Association operator technology priorities: https://restaurant.org/education-and-resources/resource-library/where-operators-plan-to-invest-in-tech/
- National Restaurant Association inventory and cost-control examples: https://restaurant.org/education-and-resources/resource-library/restaurants-arm-themselves-with-technology-while-grappling-with-inflation/
- NIST AI Risk Management Framework: https://airc.nist.gov/airmf-resources/airmf/
- FTC CAN-SPAM compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- FCC consent-revocation rules for automated calls and texts: https://docs.fcc.gov/public/attachments/FCC-24-24A1_Rcd.pdf
- TikTok Events API guidance: https://ads.tiktok.com/help/article/events-api
- Google service-area business guidance: https://support.google.com/business/answer/9157481
- Vercel Cron documentation: https://vercel.com/docs/cron-jobs
- Vercel Cron usage and Hobby limitations: https://vercel.com/docs/cron-jobs/usage-and-pricing
