# PRPD Website — Full Documentation

## Current Status

PRPD ("Prepped") is a live DFW halal high-protein custom meal prep website.

Current weekly state as of August 17, 2026: the owner approved the 18-item Batch 7 menu for Saturday, August 22 delivery and authorized publication of the order page. The complete menu, nutrition, 30 label builds, production data, cook methods, grocery data, and planning costs were regenerated together. The owner subsequently approved customer reminders and resumed the existing Google Search campaign after live verification.

August 11 closeout: the Epic Fit Fest form was submitted; food-forward outreach was sent to Sufaraa, IACC Sisters Committee, EPIC Sports & Recreation, and Islamic Center of Frisco; the final Zee offer was sent to his agent; and the creator-outreach wave remains pending without any approved food delivery or cash fee. `hello@getprpd.com` is now a verified Gmail sending identity for future external outreach. The privacy-safe owner handoff is `operations/active/DAILY_CLOSEOUT_2026-08-11.md`.

Live domains:

- `https://getprpd.com`
- `https://www.getprpd.com` (permanent redirect to `https://getprpd.com`)

Host: Vercel. The live production project is `rida-khan-s-projects/getprpd`. It owns the custom domains and the working Google Sheets, Resend, planner, and security configuration.
Registrar/DNS: GoDaddy

Public brand ownership rule: Rida is the sole operator presented on the customer-facing website. The About section, order confirmations, FAQ, delivery language, and customer-contact copy should consistently describe Rida as handling orders, cook days, food preparation, and delivery.
GitHub backup: `getprpd-sudo/getprpd-website-repo` (push via GitHub Desktop — CLI push blocked by owner mismatch)

---

## Funnels

### Guided Custom-Plan Funnel (index.html)

1. User lands on `getprpd.com`
2. UTM/source parameters captured in `sessionStorage` on landing
3. User can order directly or review food, story, FAQ, and the guided intake
4. User completes the 4-step intake form
5. `script.js` posts an idempotent payload to the same-domain Vercel endpoint `/api/lead`
6. Vercel validates it and writes directly to Google Sheets tab `Website Leads`
7. Resend sends the notification from `leads@mail.getprpd.com` to `getprpd@gmail.com`
8. Rida reviews and follows up personally

### Weekly Order Funnel (order.html)

1. Customer uses the primary `Order This Week` path from `https://getprpd.com/` or visits `https://getprpd.com/order`
2. Enters first name, last name, phone, email, delivery address, city, state, ZIP, conditional apartment/unit information, and optional delivery/meal notes
3. May apply an approved partner/referral code and separately opt in to weekly menu emails
4. Selects meals and chooses Lean or Bulk per dish
5. Total is rounded up to the nearest dollar after delivery and any server-approved discount
6. `order.html` posts the order and captured attribution—including Google Ads click identifiers when present—to the same-domain Vercel endpoint `/api/order`
7. Vercel validates the cutoff, menu IDs, quantities, code, and all server-owned prices and totals
8. Vercel writes directly to `Orders` and the first real blank row in `Payment Log`
9. Resend independently sends the owner notification with readable acquisition data and an itemized order-received email to the customer
10. After API success, the browser records the Google Ads completed-order conversion with confirmed value and transaction ID while TikTok retains its deduplicated `PlaceAnOrder` flow. Successful custom-plan submissions and text/email link clicks use separate zero-value Google Ads actions so inquiry activity can be observed without replacing completed purchases as the Search campaign's bidding goal.
11. The customer pays the business Zelle profile at `payments@getprpd.com`; Rida confirms payment and Saturday delivery by text

Payment notifications are reconciled using `operations/standards/PAYMENT_RECONCILIATION.md`. A row is marked paid only when the notification matches the order reference and amount, or uniquely matches the current sender and amount with the missing reference explicitly documented.

---

## Important Files

### Core Site

- `index.html` — homepage / landing page
- `faq.html` — FAQ page (accordion)
- `order.html` — weekly customer ordering page, served at `/order` via Vercel rewrite
- `privacy.html` — public privacy policy, served at `/privacy` via Vercel rewrite
- `style.css` — global visual system and responsive styles
- `script.js` — nav behavior, animations, form validation/submission, attribution, and TikTok pixel events
- `order.css` / `order.js` — order-page presentation and behavior
- `faq.css` / `faq.js` — FAQ-page presentation and accordion behavior
- `analytics.js` / `structured-data.js` — TikTok initialization and homepage structured data
- `vercel.json` — Vercel routing, headers, and cache rules
- `CLAUDE.md` — Claude working instructions (working style, hard rules, deployment notes)
- `deploy.bat` — double-click to deploy to Vercel production

- `api/order.js` — direct Vercel order backend for Google Sheets, Resend, and fail-soft TikTok order events
- `api/lead.js` — direct Vercel intake backend for Google Sheets, Resend, and fail-soft TikTok lead events
- `api/_tiktok.js` - private TikTok Events API builder and sender with browser/server event deduplication
- `api/tiktok-report.js` - planner-key-protected, read-only TikTok Marketing API reporting endpoint
- `api/planner-orders.js` - protected current-batch planner endpoint: read-only sync plus validated, planner-key-protected manual order insertion
- `api/business-data.js` - protected read-only reporting endpoint for the private Business Center, covering Orders, Payment Log, Website Leads, and Accounts Receivable
- `api/referrals.js` - public referral-code validation plus planner-key-protected code administration backed by the private `Referral Codes` Sheet tab
- `api/operator-brief.js` - protected daily Operator Brief endpoint; reads controlled business ranges, validates customer profile fields, excludes only Talal and Duaa from profile warnings, sends one internal summary through Resend, and records successful sends in the `Automation Log` Sheet tab
- `api/menu-reminders.js` - protected weekly-menu reminder sender; supports prior-customer outreach without rewriting consent, honors explicit opt-outs, excludes current-batch orderers and internal family profiles, records run status in `Automation Log`, sends an owner confirmation report, and refuses to send without a valid business postal address
- `api/menu-unsubscribe.js` - signed public unsubscribe endpoint that records the latest preference in the private `Email Preferences` Sheet tab
- `api/_business-data-source.js` - shared private Google Sheets reader used by protected reporting and automation endpoints
- `api/_business-center-core.js` - shared tested calculations used by the local Business Center and server-side Operator Brief
- `config/order-config.js` — approved public Batch 7 runtime configuration; menu publication and reminder-email approval remain separate controls
- `operations/active/BATCH_7_DRAFT_ORDER_CONFIG.js` — deployment-excluded internal mirror used by local production tools and controlled generation
- `package.json` / `package-lock.json` — backend dependency lock

### Operations

- `operations/OPERATIONS_INDEX.md` - first-read map of recipe, nutrition, label, source, and cook-day files
- `operations/active/CURRENT_STATUS.md` - current financial facts, open tasks, special-customer rules, and deferred work
- `operations/governance/OPERATING_RULES.md` - permanent internal controls for data, finance, production, privacy, and approvals
- `operations/governance/DOCUMENT_CONTROL.md` - folder definitions, naming, retention, and weekly organization procedure
- `operations/records/finance/RECEIPT_REGISTER.md` - receipt totals, evidence status, and missing-source tracker

- `operations/standards/RECIPE_DATA_SOURCE_OF_TRUTH.md` — first-read master register for recipe decisions, kitchen results, nutrition inputs, archived sources, and label readiness
- `operations/active/NEXT_MENU_DRAFT_2026-08-22.md` - owner-approved Batch 7 menu and publication record
- `operations/nutrition/NEXT_MENU_NUTRITION_2026-08-22.md` - reproducible calculated nutrition for the approved menu
- `operations/records/batches/BATCH_6_PREMATURE_PUBLICATION_INCIDENT_2026-08-10.md` - containment record for the menu and reminder that were published before owner approval
- `operations/recipes/LOTUS_BISCOFF_CHEESECAKE_DRAFT.md` - reduced-calorie 395-calorie/40g-protein Biscoff test build
- `operations/costing/NEXT_MENU_DRAFT_COST_AUDIT.md` - current planning direct packed-cost report for Batch 7
- `operations/active/MASTER_PLAN.md` — prioritized website, recipe, cook-day, label, and compliance workstreams
- `operations/standards/STANDARD_RECIPE_TEMPLATE.md` — controlled production recipe and yield template
- `operations/TIRAMISU_TEST_PLAN.md` — measured kitchen test needed before final tiramisu macros
- `operations/STREETCORN_CHICKEN_TEST_PLAN.md` — yield, portion, storage, and reheating test for the new bowl
- `operations/standards/COOK_DAY_CHECKLIST.md` — post-cutoff through delivery-staging production checklist
- `operations/cook-day-planner.html` - private local planner that syncs the live Orders tab and generates the complete prep sequence, three-lane production plan, nine Friday cook phases, station plan, plating matrix, durable measured cook log, timing log, staging list, and QC record
- `operations/cook-log-store.js` - validated atomic local storage for actual cook-day measurements, with previous-version recovery
- `operations/cook-day-methods.js` - controlled cooking, assembly, equipment, plating, holding, and quality instructions for all active-menu dishes
- `operations/COOK_DAY_PLANNER_README.md` - planner import, printing, privacy, and weekly-use guide
- `operations/grocery-list.html` - private live-order grocery builder with pantry subtraction, package rounding, price estimates, retailer searches, CSV export, and printing
- `operations/GROCERY_LIST_README.md` - grocery builder and weekly sauce operating guide
- `operations/standards/WEEKLY_CLOSEOUT_TEMPLATE.md` - weekly planned-versus-actual record for revenue, cost, yield, time, waste, delivery, and acquisition
- `operations/records/finance/weekly-closeouts/WEEKLY_CLOSEOUT_2026-07-11.md` - provisional July 11 revenue/LLC-fee reconciliation and opening business-bank transfer record
- `operations/records/finance/weekly-closeouts/WEEKLY_CLOSEOUT_2026-07-18.md` - completed Batch 2 order revenue, payment reconciliation, purchase split, and closeout record
- `operations/records/finance/weekly-closeouts/WEEKLY_CLOSEOUT_2026-07-25.md` - open Batch 3 sales, collections, purchase commitments, and post-delivery closeout record
- `operations/plans/MARKETING_GROWTH_PLAN.md` - current capacity-controlled paid, organic, referral, and physical marketing strategy
- `operations/business-center.html` - private local Growth, Marketing, and Financial Center with campaign workflow, tracked links, current/historical batch reporting, consolidated receivables, DFW outreach, referral attribution, expenses, TikTok Marketing API sync, and CSV fallback
- `operations/BUSINESS_CENTER_README.md` - Business Center security, access, calculation, and weekly-use guide
- `operations/plans/PRPD_AUTOMATION_ROADMAP.md` - staged PRPD Operator plan, automation boundaries, and implementation status
- `operations/plans/DFW_LOCAL_DISCOVERY_2026-07-22.md` - prioritized DFW partnership pipeline and official source links
- `operations/relationships/README.md` - organized customer, testimonial, referral, and partnership program hub with private-record placement rules
- `operations/archive/README.md` - completed design briefs and implementation handoffs; archive files are historical, not current operating authority

Historical recipe and price sources kept inside the project:

- `operations/source-documents/reference/PRPD_RECIPES_SOURCE_2026-07-13.pdf` — latest archived recipe-library source
- `operations/source-documents/reference/PRPD_INGREDIENT_PRICES_SOURCE_2026-07-14.pdf` — latest archived ingredient-price source
- `operations/private-records/receipts/WALMART_RECEIPT_2026-07-16.png` — itemized Prosper Walmart receipt used for current grocery-price verification
- `operations/private-records/receipts/WALMART_RECEIPT_2026-07-23.png` — itemized Batch 3 Walmart receipt used for current grocery-price verification

Receipts, LLC formation records, customer-specific evidence, signed testimonial consents, raw submissions, partnership agreements/approvals, and other sensitive evidence live under the Git-ignored `operations/private-records/` folder. See `operations/PRIVATE_RECORDS_POLICY.md`; do not move those originals into a public or deployed path.

Recipe and label rule: update `operations/standards/RECIPE_DATA_SOURCE_OF_TRUTH.md` whenever a kitchen test, portion, product label, or formula changes. Do not rely on chat history as the only record, and do not print final labels from unverified website estimates.

Additional internal label files:

- `operations/label-studio.html` - local Avery 5168 studio for exact-count printing; the approved dataset contains 18 dishes and 30 Lean/Bulk/Single builds and remains fail-closed on stale batch data
- `operations/label-studio-app.js` - Label Studio state, categorized exact-count print queue, live-menu/current-batch validation, and label rendering
- `operations/nutrition/next-menu-label-data.js` - sole generated current-batch meal, ingredient, allergen, storage, and complete nutrition dataset used by Label Studio
- `operations/LABEL_STUDIO_README.md` - regeneration workflow, accuracy standard, and print-test instructions
- `open-label-studio.bat` - one-click local launcher for the label studio
- `open-cook-day-planner.bat` - one-click local launcher for the cook-day planner
- `open-grocery-list.bat` - one-click local launcher for the grocery builder
- `PRPD Grocery Builder.lnk` on the Windows desktop - desktop shortcut for the grocery builder

The cook-day planner's live sync is read-only. It uses a localhost proxy in `operations/cook-day-server.js`, a separate planner key stored in the ignored `operations/.planner-key` file, and `PRPD_PLANNER_KEY` as an encrypted Vercel environment variable. Order exclusions and quantity corrections affect the current packet only; the Google Sheet remains the source record.

The protected planner maintenance route can also insert specifically approved manual orders into canonical Google Sheets columns A:K. That write path is not exposed as a public browser control, validates menu items and quantities, and blocks duplicate manual Order IDs. It does not change the normal read-only sync behavior.

Selecting **Generate Production Packet** opens the **Kitchen Guide** first. The operator chooses **Prep Day** or **Cook & Pack** and works straight down one complete guide. Prep Day starts by locking counts, printing labels, and applying them to empty containers; it then moves through raw proteins, the sanitation reset, produce, sauces, desserts, clean mixtures, and starches. Cook & Pack groups similar work into coordinated production waves before dish-and-tier portioning and customer-by-customer pack-out. Exact scaled recipes appear inside the phase where they are used. **Focus Mode** remains available as an optional single-ticket view when isolating one action is useful.

The Kitchen Guide produces the exact sold customer-meal count and applies a default 5% pooled reserve only to raw meat and poultry. This covers normal trim and cooking-yield variation without creating automatic extra containers, starches, sides, desserts, or finished meals. Customer nutrition labels exclude the permanent no-label accounts Talal, Duaa, and Rida, while their meals remain fully included in production and staging. The Batch 5 packet provides an Avery 5168 customer-label plan, grouped raw-protein pulls, compatible chicken seasoning, produce totals, measured recipe components, metric and practical kitchen units, and complete scaled recipe cards.

The generated workflow is selection-aware. Thursday groups compatible protein pulls, divides them into labeled dish bowls before dish-specific marinades, separates compatible and distinct rice batches, phases measured marinades/mixes/sauces/desserts/sides, handles vegetables, controlled rice cooling, customer labels, and closeout. Friday runs three coordinated lanes (passive equipment, active cooking, and cold/cooling), launches the longest hands-off batch first, produces breakfast/chicken/beef/starch components in equipment-sized batches, releases each component only after temperature and yield checks, assembles one dish/tier at a time, and bags by customer last. Any true overage is recorded after production rather than planned in advance.

Each weekly packet also scales exactly two batch-wide sauces. Automatic mode makes one sealed weekly cup per eligible full savory meal, splits those cups between the two flavors, and adds one quality-control cup per flavor. Recipe-specific sauce portions are counted separately. Desserts, pancakes, the chilled Protein Box, and the already-sauced Mini Chicken Snack Wrap do not receive redundant weekly cups.

The Kitchen Guide covers both Prep Day and Cook & Pack. Prep Day moves through counts and pre-labeling, raw proteins, sanitation, produce, sauces/cold sides, desserts, egg/pancake/dough/filling kits, starches, and final reconciliation. Cook & Pack moves through kitchen startup, breakfast, parallel base-protein and hot-side lanes, dependency-based assemblies, dish-and-tier portioning, and customer-by-customer pack-out. Passive equipment, planning lanes, and timing logic remain available in a collapsed reference. Focus Mode provides the old Now/Next/Later queue without controlling the default workflow. Setup, counts, prep completion, guide-day preference, Focus Mode position, and measured Cook Log entries are keyed to the batch and delivery date.

The label studio is an internal working tool and its public Vercel path redirects to the homepage. All required nutrition fields are populated with calculated estimates from the saved recipes, supplied product labels, manufacturer data, USDA records, and approved generic equivalents. Finished net weights and some cooking yields remain practical estimates and should be replaced with cook-day measurements when convenient.

Nutrition and label regeneration:

```powershell
python operations/nutrition/calculate_next_menu.py
python operations/nutrition/generate_next_menu_label_data.py
python operations/nutrition/verify_next_menu_labels.py
python operations/nutrition/generate_production_data.py
python operations/costing/calculate_next_menu_draft_costs.py
python -m unittest discover -s operations/nutrition -p "test_*.py" -v
npm test
```

### Supplemental Pages

- `dish-preview.html` — dish/photo preview helper
- `360-shoot-guide.html` — guide for 360 dish capture workflow

### Legacy / Deprecated

- `netlify.toml` — old Netlify config; no longer active, kept as artifact
- `GetPRPD Website/` - empty nested Git checkout metadata from an earlier clone; it is not the active workspace and can be removed after confirming no external shortcut points to it

---

## Assets

### Fonts

- `fonts/Cathez.otf` / `fonts/Cathez.ttf` — brand display font (PRPD wordmark)

### Images

Homepage images (`assets/images/`):

- `hero-spread.jpg` — hero section food spread
- `halal-cart-chicken.jpg` — hero + menu
- `hero-dish-2.jpg` — hero section
- `sweet-chilli-chicken-thighs.jpg`
- `beef-chilli-bowl.jpg`
- `garlic-butter-shrimp.jpg`
- `high-protein-omelette.jpg`
- `french-toast.jpg`
- `breakfast-skillet.jpg`
- `mediterranean-chicken-bowl.jpg` (replaced June 2026 — top-down shot, 234KB)
- `duo-halal-garlic.jpg`
- `about-rida.jpg`

Meal card images for `order.html` live in `assets/images/meals/`. The standardized, web-ready real-food library lives in `assets/images/meals/menu/`.

The approved Batch 7 menu currently has verified exact-dish photos for 10 of 18 items. Photograph Blueberry Cheesecake Protein Pancakes, Power Bowl, Cajun Garlic Salmon, Southwest Beef Taco Bowl, Banana Cream Pie Cup, PRPD Protein Box, Mini Chicken Snack Wrap, and Chicken Caesar Crunch Box during Batch 7 production to complete this rotation at 18 of 18. Existing photos remain reusable whenever the exact dish returns; newly introduced or materially changed dishes still require a fresh exact-dish photo.

- Source originals remain unchanged in `C:\Users\aazim\Dropbox\PRPD PRINT\Menu Images`.
- `scripts/prepare-menu-images.ps1` performs deterministic orientation, crop, color, resize, and JPEG compression. It does not use generative AI or redraw food.
- Web outputs are 1200 x 1200 pixels and use corrected semantic filenames.
- Batch 3 currently uses real photos for High Protein Omelette, Beef Breakfast Skillet, Mexican Streetcorn Chicken Bowl, Chicken Biryani, BBQ Chicken Mac & Cheese, and Premium NY Strip Steak.
- BBQ Chicken Mac & Cheese and Premium NY Strip Steak expose separate Lean and Bulk photos through the tier-photo control.
- Dishes without a verified real photo continue to use the branded placeholder.
- The explicitly unidentified source image is excluded from processing and the website.

After correcting or replacing originals, regenerate the library with `powershell -ExecutionPolicy Bypass -File .\scripts\prepare-menu-images.ps1`, then update the dish's `image` or `images` field in `config/order-config.js`.

Favicon:

- `favicon.ico` (16x16 + 32x32 embedded PNGs)
- `assets/images/favicon-16x16.png`
- `assets/images/favicon-32x32.png`
- `assets/images/favicon-512.png`
- `assets/images/apple-touch-icon.png` (180x180, iOS)

Important: Do not replace real PRPD food/founder photos with stock or AI images.

Assets excluded from project (stored in `C:\Users\aazim\Documents\PRPD Assets Backup\`):

- `_raw_originals/` — 32MB raw photo originals
- `assets-360/` — 11MB full 360 frame set
- `assets-models/` — 3MB 3D model

---

## Order Page (order.html)

Live at `https://getprpd.com/order` (Vercel rewrite: `/order` → `/order.html`)

This is the primary public conversion page. It is indexable and has its own canonical URL, description, social metadata, and sitemap entry.

### Shared Weekly Order Config

The batch, menu, macros, images, prices, and order policies live in `config/order-config.js`. Both `order.html` and `api/order.js` consume this file. Update it once each week; do not recreate menu or pricing constants in either consumer.

Shape of each dish entry:

```js
{
  id: 'b1',                    // unique ID: b1-b4 (breakfast), m1-m8 (mains), d1-d3 (desserts)
  name: 'Egg Bites',
  category: 'standard',        // 'standard' | 'beef' | 'dessert'
  description: 'Short plain-English description. No em dashes.',
  macros:     { cal, protein, carbs, fiber, fat },  // lean tier macros
  bulkMacros: { cal, protein, carbs, fiber, fat },  // bulk tier macros
  image: '/assets/images/meals/egg-bites.jpg',      // '' if no photo yet
  available: true,              // set false to show sold out and reject new orders
  maxQty: 20,                   // optional dish-specific cap; omit for global cap
  laterWeek: true,              // optional: show freeze-on-delivery guidance for days 5-7
}
```

### Pricing Tiers

| Category | Lean | Bulk |
|---|---|---|
| Standard (chicken mains + most breakfasts) | $10.99 | $12.99 |
| Beef / Seafood mains | $13.99 | $15.99 |
| Desserts (no tier) | $6.99 | $6.99 |

Bulk is always $2 more than lean. Desserts have no tier toggle.

### Order Minimum + Delivery

- Minimum food subtotal: `$60`
- Local delivery: `$60` minimum, `$9.99` delivery, free delivery at an `$85` food subtotal.
- Regional delivery: `$80` minimum, `$12.99` delivery, free delivery at a `$125` food subtotal.
- Extended delivery: `$100` minimum, `$14.99` delivery, free delivery at a `$150` food subtotal.
- The server uses the five-digit delivery ZIP centroid and a controlled routing estimate: up to `25` one-way miles is local, more than `25` through `35` miles is regional, more than `35` through `60` miles is extended, and farther ZIPs cannot complete automatic checkout.
- The public quote returns only eligibility and pricing; it does not expose the internal dispatch reference, city lookup, or calculated mileage.
- The minimum and free-delivery threshold use the meal subtotal before any partner discount.
- An approved partner discount is deducted after delivery is calculated.
- Final amount due is rounded up to the nearest dollar after delivery and discount are applied.
- `/api/order` recomputes these totals server-side; do not trust browser-submitted totals.

### Partner Codes + Attribution

Active customer and partner codes live in the private Google Sheet tab `Referral Codes`. Create and maintain them through the local Business Center. Checkout calls `/api/referrals` for public validation, while `/api/order` independently reloads the private record, blocks self-referrals, enforces first-order-only use, and recalculates the discount. The public endpoint returns only the offer fields needed by checkout; owner contact details and credit balances stay protected.

The default controlled offer is `$10` off a referred customer's first order and `$10` in future credit for the owner after that referred order is fully paid. Credit application remains manual and is recorded in the Business Center ledger. Static emergency codes may still be placed in `config/order-config.js`, but the repository normally keeps that list empty.

Every owner receives a measurable link such as:

```text
https://getprpd.com/order?ref=SANA15&utm_source=referral&utm_medium=partner&utm_campaign=partner_referrals&utm_content=sana
```

The `ref` value prefills and validates the code. UTM values, landing page, referrer, partner, and redeemed discount are stored with the durable order record. Public codes are not secrets; protection comes from server-side validation, first-order checks, limits, expiry, paid-order reconciliation, and the ability to deactivate a code immediately.

### Weekly Menu Email Consent

The order page includes an unchecked weekly-menu email option. Transactional order confirmations do not enroll customers. Consent is stored per order in `Orders` column V. The reminder workflow can contact prior customers without rewriting that consent field, but an explicit `No` remains authoritative. It also checks the `Email Preferences` opt-out ledger and automatically suppresses anyone who already ordered the current batch. Talal, Duaa, and Rida remain excluded from customer marketing.

The scheduled cadence is Monday at 6:00 PM CT, Tuesday at 6:00 PM CT, and Wednesday at 2:00 PM CT. A valid `BUSINESS_POSTAL_ADDRESS` Vercel environment variable is a hard requirement: without it, the job records a disabled run and sends nothing. Every sent message includes the mailing address and a signed unsubscribe link. Every completed, empty, disabled, or failed run also sends a recipient-level owner report to `getprpd@gmail.com`.

### Order Cutoff + Confirmation

- Orders automatically close at the batch `cutoffIso` time. The standard Wednesday 6:00 PM Central cutoff was restored after the one-time Batch 6 extension closed.
- Delivery pricing is ZIP-based. The current Local / Regional / Extended policies are respectively: $60 / $80 / $100 food-order minimums; $9.99 / $12.99 / $14.99 delivery fees; and free delivery at $85 / $125 / $150 food subtotals. An order minimum and a free-delivery threshold are separate rules.
- The frontend replaces the menu with an orders-closed message after cutoff.
- `/api/order` independently rejects late orders using the shared `batch.cutoffIso` value.
- Successful confirmations show an itemized order, meal subtotal, delivery fee, total due, delivery date, and order reference.
- The customer receives the same itemized order by email with Zelle instructions for the dedicated business payment profile at `payments@getprpd.com`. This confirms receipt only; it does not claim the order is paid. Rida confirms payment and delivery separately by text.
- If a customer's bank blocks the new Zelle recipient, customer-facing guidance says not to repeatedly retry and to reply or text for an alternative payment option.
- Freezer-friendly dishes can display a `Better later in the week` badge. The page explains that customers planning days 5-7 should freeze those meals on delivery and thaw them overnight in the refrigerator before reheating.
- New order references use `PRPD-B{batch}-{YYYYMMDD}-{8 hex characters}` and are saved in `Orders` column K and `Payment Log` column N. The API also accepts legacy 4-character references from pages that were already open during the migration.
- `/api/order` rejects a duplicate order reference before writing a second row.

### Current Ordering State - Batch 7 Live

The owner approved the 18-item Batch 7 customer menu for Saturday, August 22 delivery and authorized website publication. The standard cutoff is Wednesday, August 19 at 6:00 PM CT. The owner separately authorized the existing `PRPD | Search | North DFW` campaign to resume on August 17; it remains Search-only at $15/day with the $3.50 maximum CPC preserved.

Customer reminders remain separately gated from menu publication. The owner approved Batch 7 outreach on August 17 after reviewing the live website, so `batch.remindersEnabled` is `true`; the consent, current-order, internal-profile, hold, unsubscribe, stale-date, and duplicate-run safeguards remain active. Final groceries, production labels, and the Cook-Day packet must use the fresh live-order lock after cutoff. See `operations/active/NEXT_MENU_DRAFT_2026-08-22.md` and the historical `operations/records/batches/BATCH_6_PREMATURE_PUBLICATION_INCIDENT_2026-08-10.md`.

The approved Batch 7 Monday campaign sent to all 10 eligible prior customers on August 17. Reminder delivery is recoverable at the individual-recipient level: a retry reads the delivery ledger, skips addresses already accepted under the same run ID, reuses provider idempotency keys, and applies bounded backoff to rate-limited email or Sheets operations.

### Lean / Bulk Tier System

- Each non-dessert dish has independent Lean and Bulk quantity controls.
- A customer can order both Lean and Bulk versions of the same dish in one order.
- Each tier row displays its own price, calories, protein, and quantity.
- Desserts have no tier toggle; they show at flat $6.99.
- The order payload sends Lean and Bulk selections as separate item lines with the same dish ID and the appropriate `tier` value. Desserts use `tier: null`.

### Image System

Meal assets use a one-hour revalidation cache so updated weekly photos do not remain stale for a year. Dishes may provide a single `image` or separate `images.lean` and `images.bulk` paths. When tier photos exist, the card displays a Lean/Bulk photo switch and selecting a quantity also selects that tier's photo.

If an image is unavailable, the card falls back to the default dish image and then to the branded placeholder. No broken image icon is shown.

### Vercel Order API

`order.html` submits to `/api/order`. The endpoint accepts POST only, rejects malformed requests, validates required customer and delivery fields, recalculates every price and total, writes directly to Google Sheets, repairs a missing Payment Log row on retry, and prevents duplicate rows by Order ID. Resend sends the owner and customer messages with separate Order-ID-based idempotency keys. Email is attempted only after the durable sheet writes, so an email failure cannot lose an order.

`script.js` submits intake leads to `/api/lead`. The endpoint validates required contact fields, writes with `RAW` Sheets values to prevent formula injection, preserves UTM attribution, and prevents duplicate rows by Lead ID.

### Order Submission Payload

```json
{
  "action": "order",
  "orderId": "PRPD-B4-20260727-A4F2C91D",
  "batch": 4,
  "deliveryDate": "Saturday, August 1, 2026",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "4691234567",
  "email": "jane@example.com",
  "deliveryAddress": "123 Main Street",
  "deliveryCity": "Frisco",
  "deliveryZip": "75035",
  "deliveryInstructions": "Leave at the front desk",
  "items": [
    {
      "id": "b1",
      "name": "French Toast",
      "category": "standard",
      "section": "Breakfast",
      "tier": "lean",
      "qty": 6,
      "unitPrice": 10.99,
      "subtotal": 65.94
    }
  ],
  "mealSubtotal": 65.94,
  "deliveryFee": 9.99,
  "promoCode": "SANA15",
  "discountAmount": 15,
  "exactTotal": 57.93,
  "total": 58,
  "menuEmailOptIn": true,
  "notes": "no jalapeno please",
  "utmSource": "referral",
  "utmMedium": "partner",
  "utmCampaign": "partner_referrals",
  "utmContent": "sana",
  "utmTerm": "",
  "landingPage": "https://getprpd.com/order?ref=SANA15",
  "referrer": ""
}
```

---

## Google Sheets

Sheet ID:

```
1NV0QIpRINRP5IUs550kKPdYSQZcOrTm9ncHkTcXilFg
```

### Tab: Orders (auto-filled by Vercel)

Columns written when an order is submitted:

| Col | Field | Notes |
|---|---|---|
| A | Submitted At | timestamp string, CT |
| B | Batch | e.g. "Batch 4" |
| C | Delivery Date | e.g. "Saturday, August 1, 2026" |
| D | First Name | |
| E | Last Name | |
| F | Phone | |
| G | Items | multi-line: `2x High Protein Omelette (Lean) - $21.98` per line |
| H | Exact Total | decimal, e.g. 181.84 |
| I | Total (Rounded) | integer, e.g. 182 |
| J | Notes | customer's optional note |
| K | Order ID | retry/idempotency reference |
| L | Email | customer confirmation destination |
| M | Delivery Address | street address |
| N | City | delivery city |
| O | ZIP Code | five-digit ZIP |
| P | Delivery Instructions | optional gate/drop-off details |
| Q | Meal Subtotal | server-calculated before delivery/discount |
| R | Delivery Fee | server-calculated |
| S | Discount Code | approved code or blank |
| T | Discount Amount | server-calculated |
| U | Referral Partner | configured partner name |
| V | Menu Email Opt-In | `Yes` only after explicit checkbox consent |
| W | UTM Source | attribution |
| X | UTM Medium | attribution |
| Y | UTM Campaign | attribution |
| Z | UTM Content | attribution |
| AA | UTM Term | attribution |
| AB | Landing Page | first captured page |
| AC | Referrer | captured browser referrer |

### Tab: Payment Log (partially auto-filled, partially manual)

When an order arrives, Vercel writes the first real blank row with:

| Col | Field | Auto or Manual |
|---|---|---|
| A | Batch | Auto |
| B | Delivery Date | Auto |
| C | Paid Date | Manual |
| D | Client | Auto (First + Last name) |
| E | Tier | Auto (Lean / Bulk / Mixed) |
| F | Standard Meals # | Auto (total qty) |
| G | Beef/Seafood # | Auto (total qty) |
| H | Dessert # | Auto (total qty) |
| I | Total Due | Auto |
| J | Amount Paid | Manual |
| K | Balance | Manual |
| L | Method | Manual |
| M | Notes | Auto (customer notes) |
| N | Order ID | Auto (retry/idempotency reference) |
| O | Discount Code | Auto |
| P | Referral Partner | Auto |

### Tab: Website Leads (auto-filled by Vercel)

Written when the index.html intake form is submitted:

Columns A:T preserve contact details, intake answers, UTM attribution, landing page/referrer, and Lead ID.

### Tab: Funnel Events (auto-filled by Vercel)

Google-attributed website sessions write privacy-limited acquisition stages to A:O: recorded time, event/session references, stage, public page path, UTM fields, yes/no Google-click presence, device category, bounded stage detail, value, and batch. The public tracker does not send customer name, email, phone, street address, ZIP, or the raw Google click identifier. The tab is created on first use with a frozen formatted header and filter; event IDs make retries idempotent.

The live Search ad group appends campaign attribution and Google ValueTrack keyword, creative, match-type, device, and network values. The tracker preserves those values from the dedicated paid-search landing page through the order flow so funnel stages can be compared without collecting customer PII.

Order and lead writes use an exact canonical range rather than Google Sheets table-detection append behavior. New Orders write to A:AC after the last real order record. The original A:K layout remains unchanged for planner compatibility, delivery details remain in L:P, and pricing/growth attribution is appended in Q:AC. New Website Leads write to A:T after the last real lead record. On July 15, two historically shifted order rows were moved back to the canonical layout and the lead stored in an earlier blank row was moved to the chronological bottom of Website Leads. No customer record was discarded.

### Tab: Batch Dashboard (operational view)

`Batch Dashboard` is a non-destructive view over the canonical `Orders` and `Payment Log` ledgers. Cell B3 automatically follows the highest real batch number in `Orders`, so the dashboard opens on the current batch instead of silently showing an older selection. Do not paste or move customer rows into this tab; the website and Cook-Day Planner continue to use `Orders` as the source of truth.

The raw ledgers stay append-only across batches. Batch separation belongs in this dashboard and filters rather than in duplicate per-batch order tabs, which would split the source of truth and break automated readers.

### Tab: Operations Health (aggregate integrity view)

`Operations Health` automatically follows the current batch and surfaces aggregate checks for missing required order fields, duplicate Order IDs, missing or orphaned Payment Log rows, and order/payment total mismatches. It contains no customer list and does not replace the source ledgers. Review any `REVIEW` result in `Orders` and `Payment Log`; do not fix it by overwriting the health formulas.

### Tab: Form Responses 1

Native response tab for the existing Google Form used by older flyers and links. It remains active and independent of the website backend. Leave it connected.

---

## Apps Script (Legacy Rollback)

The website no longer depends on Apps Script after the Vercel migration is promoted to `getprpd.com`. Keep `apps-script.gs` and the existing deployment temporarily as a rollback path. The separate Google Form used by older flyers continues writing natively to `Form Responses 1` and is unaffected.

### Legacy Apps Script Rollback Only

`apps-script.gs` is retained only as a temporary rollback reference. The live website does not call it:

- `index.html` submits leads to `/api/lead`.
- `order.html` submits orders to `/api/order`.
- Both endpoints run on Vercel, write directly to Google Sheets, and send through Resend.
- The old flyer Google Form remains independent and continues writing to `Form Responses 1`.

Do not paste or redeploy `apps-script.gs` for normal website updates. If a rollback is ever required, first document why the Vercel API cannot be used and verify the old Apps Script deployment in a separate test before changing either frontend endpoint.

---

## Direct Backend Migration (July 13, 2026)

The live website now uses same-domain Vercel functions instead of Apps Script:

- `/api/order` validates menu IDs, tiers, quantities, cutoff, minimum order, delivery fee, and server-owned prices.
- It writes one itemized row to `Orders` and one summary row to the first real blank row in `Payment Log`.
- `/api/lead` validates required intake fields and writes to the first real blank row in `Website Leads`.
- Stable Order IDs and Lead IDs prevent duplicate rows when a customer retries.
- A retry repairs a missing Payment Log row without duplicating the corresponding Orders row.
- Resend sends order and lead notifications from the verified `mail.getprpd.com` domain.
- Google and Resend credentials exist only as encrypted Vercel environment variables.

Migration verification completed successfully on July 13, 2026. Both emails arrived, both sheet paths were verified, duplicate and partial-recovery behavior passed, custom domains were switched to the tested build, and labeled migration-test rows were cleared.

---

## Deployment

### To deploy the website

```bash
vercel --prod
```

`deploy.bat` deterministically links this folder to `rida-khan-s-projects/getprpd` before deploying. It stops without deploying if that link fails.

Production project: `rida-khan-s-projects/getprpd` (`prj_We7VvuEJKEmwUxC46KSByvxzQOm8`). It is the newer project, owns `getprpd.com` and `www.getprpd.com`, and contains the working Google Sheets, Resend, planner, and production security configuration.

Duplicate project: `rida-khan-s-projects/getprpd-website-repo` (`prj_StlJj0TqH3W2XA1vzZxyWRLx0tJo`). It is older and is connected to the same canonical repository, but it does not contain all production backend credentials and must not receive the custom domains. Keep it only as a temporary rollback target.

Consolidation sequence:

1. Completed July 23, 2026: pushed the reviewed code through commit `b6de15e` to `getprpd-sudo/getprpd-website-repo` on `main`. The private `aazim040607/getprpd-website-backup` branch remains a separate off-machine backup.
2. Completed July 23, 2026: connected the production `getprpd` project to the canonical repository and verified the resulting production deployment on the custom domains.
3. Add and verify the TikTok Events API access token on `getprpd`, then run browser and server event tests.
4. Verify intake, orders, Sheets writes, Resend mail, planner sync, and TikTok Events API on `getprpd.com`.
5. Preserve `getprpd-website-repo` as a rollback for 7-14 days, then delete it only after explicit approval.

### GitHub backup

Canonical repo: `getprpd-sudo/getprpd-website-repo`

The GitHub CLI is authenticated as `getprpd-sudo`, so terminal pushes to the canonical repository work. The separate private backup remains at `aazim040607/getprpd-website-backup`.

---

## Form + Attribution

### Website intake form (index.html)

Required fields (as of July 2026):

- Full Name
- Phone Number (exactly 10 digits)
- Location
- Referral source
- Fitness Goal

Optional fields:

- Mosque/Gym detail (shown only when Mosque or Gym selected)
- Dietary restrictions (multi-select)
- Notes

Intentionally omitted to keep the form shorter:

- Training Days per Week
- Halal Preference

Validation/spam:

- Final submit re-checks all required steps
- Phone must be exactly 10 digits
- Honeypot field `hpWebsite` silently blocks obvious bots
- Browser timing and honeypot signals are sent to the server; suspicious submissions receive a generic acknowledgement without writing to Sheets or sending email
- `/api/lead` independently validates all required fields and exact allowed values before writing to Sheets

### Attribution capture

`script.js` reads UTM params on landing and stores in `sessionStorage`:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `landing_page` (first URL visited)
- `referrer` (document.referrer)

These are sent with every website intake submission and weekly order. Recommended paid-ad URL format:

```
https://getprpd.com/?utm_source=tiktok&utm_medium=paid&utm_campaign=dfw_launch&utm_content=original_video_1
```

---

## TikTok Pixel

Pixel ID: `D8KU48BC77U7CO3SHUSG`

Installed through `analytics.js` on `index.html`, `order.html`, `faq.html`, and `privacy.html`.

Events fired through both the browser Pixel and server Events API after durable storage:

- `PageView` — every page load
- `Lead` — on successful intake form submission
- `PlaceAnOrder` — on successful weekly order submission; this is not reported as a paid purchase because payment is collected later

Browser and server copies use the same `event_id` for TikTok deduplication. TikTok delivery is fail-soft and cannot block a customer order or intake. Raw email and phone are not sent to TikTok by default; advanced matching requires the explicit `TIKTOK_ADVANCED_MATCHING_ENABLED=true` server setting.

---

## TikTok Ads

Original TikTok campaign launched June 29, 2026:

- Campaign: `PRPD_DFW_Traffic_OriginalVideo_001`
- Objective: Traffic → Landing page view
- Budget: $20/day
- Geo: Collin, Dallas, Denton, Tarrant counties
- Age: 18–44, All genders
- Creative: original high-performing organic Spark post
- CTA: Learn More
- Destination: `https://getprpd.com/?utm_source=tiktok&utm_medium=paid&utm_campaign=dfw_launch&utm_content=original_video_1`

Initial performance (June 29 ~11AM): $6.58 spend, 3,063 impressions, 16 clicks, $0.41 CPC, 0 leads.

Reported business outcome by July 15: the active customer base grew from approximately one customer to eleven while this campaign was the primary paid acquisition source. Final campaign quality cannot be calculated until total spend, attributed qualified leads, first paid orders, and repeat orders are entered into `operations/standards/WEEKLY_CLOSEOUT_TEMPLATE.md`.

Recommended next controlled campaign test (lead optimization):

- Objective: Lead Generation → Website → Lead event
- Same geo, creative, budget
- URL: `https://getprpd.com/?utm_source=tiktok&utm_medium=paid&utm_campaign=dfw_lead_test&utm_content=original_video_1`
- Before launching: verify pixel events firing in TikTok Events Manager

Do not replace the proven Spark post with an unproven creative in the same test that changes the objective. Use the original post as the control and treat a new video as a challenger. The full cross-channel budget and physical-marketing plan is in `operations/plans/MARKETING_GROWTH_PLAN.md`.

---

## Vercel Configuration

Production environment variables (values are encrypted in Vercel and must never be committed):

- `GOOGLE_SERVICE_ACCOUNT_BASE64`
- `GOOGLE_SHEET_ID`
- `PRPD_PLANNER_KEY`
- `RESEND_API_KEY`
- `TIKTOK_PIXEL_ID` (existing Pixel; defaults to the documented PRPD Pixel ID)
- `TIKTOK_EVENTS_ACCESS_TOKEN`
- `TIKTOK_EVENTS_TEST_CODE` (temporary, test-only; remove after Events Manager verification)
- `TIKTOK_ADVANCED_MATCHING_ENABLED` (optional; defaults off)
- `TIKTOK_MARKETING_ACCESS_TOKEN`
- `TIKTOK_ADVERTISER_ID`

Resend verified sending domain: `mail.getprpd.com`. Automated website messages send from `orders@mail.getprpd.com` and `leads@mail.getprpd.com`. Public contact links and customer receipt replies use the Namecheap mailbox `hello@getprpd.com`; Zelle payments use the dedicated Namecheap alias `payments@getprpd.com`. Internal order, lead, and operator alerts continue going to `getprpd@gmail.com`.

Migration verification completed July 13, 2026:

- Direct order created exactly one Orders row and one Payment Log row.
- Spoofed client prices/totals were ignored; server stored `$72.93` exact and `$73` rounded.
- Lean and Bulk quantities for the same dish remained separate.
- Retry with the same Order ID created no duplicate rows.
- Missing Payment Log row was restored from the existing Orders submission on retry.
- Direct lead wrote all 20 columns A:T, including UTM attribution and Lead ID.
- Retry with the same Lead ID created no duplicate row.
- Resend accepted the first order and lead notifications.
- Labeled migration test rows were cleared after verification.

Headers set in `vercel.json`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- Content Security Policy with `object-src 'none'`, `frame-ancestors 'none'`, restricted scripts/connections, HTTPS upgrading, no `'unsafe-inline'`, and blocked script/style attributes
- `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- `Cross-Origin-Resource-Policy: same-site`
- `X-Permitted-Cross-Domain-Policies: none`
- Long cache for `/fonts/*` and `/assets/*`

Production abuse controls:

- Vercel custom firewall rule `Public form rate limit` is enabled for `/api/order` and `/api/lead` only.
- The rule allows 30 requests per 60 seconds per source IP and denies excess requests.
- Both APIs also enforce exact request schemas, same-site browser source checks, body limits, server-side honeypot/timing checks, idempotent references, and redacted error logging.
- The customer spreadsheet is Restricted to the business owner and production service-account editor; no link-access permission remains.
- `/privacy` explains data collection, use, service providers, retention/security practices, and customer correction/deletion requests.
- Full audit and rollback notes are in `SECURITY_AUDIT_2026-07-15.md`.

Vercel project inventory:

- `getprpd` is the canonical production project. It owns the domains and working business credentials.
- `getprpd-website-repo` is an older GitHub-connected Vercel duplicate. Its frontend source now follows the same canonical `main` branch, but its backend configuration remains incomplete.
- Never move the custom domains to the duplicate. Delete `getprpd-website-repo` only after the canonical repository connection and production verification are complete and the rollback window has passed.

Search/indexing controls:

- `robots.txt` allows public pages and excludes `/api/`.
- `sitemap.xml` lists the homepage, FAQ, weekly order page, and privacy policy.
- The homepage includes Organization and WebSite structured data using confirmed PRPD contact/social details.
- `order.html` is public and indexable because weekly ordering is now the primary conversion path.

Do not remove `vercel.json`.

---

## Favicon

- Dark green (`#1E2E1E`) rounded square, cream (`#ECE7DF`) Cathez "P"
- Files: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-512.png`, `apple-touch-icon.png`
- Google Search favicon updates on Google's own crawl schedule (1–7 days). Speed up via Google Search Console → URL Inspection → Request Indexing.

---

## Brand Notes

PRPD should feel:

- Premium but local
- Warm, handmade, trustworthy
- Fitness-focused without aggressive gym-bro branding
- Human and real, not corporate or AI-template

Audience:

- DFW locals, Muslim men roughly 22–40
- People who train, care about macros, want halal food, and are too busy to cook

Key positioning: Halal · High protein · Custom macros · Fresh DFW delivery · Seed oil free · Twice-weekly delivery

---

## Instructions for Future Claude Work

Open: `C:\Users\aazim\Documents\GETPRPD Website`

Always read `CLAUDE.md` and `README.md` first.

Hard rules:

- Never revert to Netlify
- Never remove `vercel.json`
- Never put Google, Resend, or TikTok credentials into source files; use Vercel environment variables
- Never point the website forms back to Apps Script unless intentionally performing a rollback
- Never replace real PRPD images with stock or AI photos
- Never remove phone validation from either form
- No alcohol in any PRPD recipe (halal brand)

Before major edits:

- Check current deployed site
- Check mobile layout
- Preserve warm, premium, local, human brand direction

When updating the weekly menu:

1. Read `operations/standards/RECIPE_DATA_SOURCE_OF_TRUTH.md` and use only Current Recipe values for customer-facing macros.
2. Update `config/order-config.js` only.
3. Update its `batch` object (batch number, delivery date, cutoff ISO timestamp, and cutoff label).
4. Replace the `menu` dishes with that week's offerings.
5. Set `image: '/assets/images/meals/filename.jpg'` only for dishes that have an uploaded photo in `assets/images/meals/`. Set `image: ''` for all others.
6. Verify descriptions have no em dashes (they look AI-generated).
7. Verify macros match a Production Approved recipe.
8. Use `available: false` or a dish-specific `maxQty` only when needed.
9. Run `npm.cmd test` and one labeled test submission when pricing logic changes.
10. Deploy to Vercel; the attached apex and `www` domains update automatically.
