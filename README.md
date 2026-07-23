# PRPD Website — Full Documentation

## Current Status

PRPD ("Prepped") is a live DFW halal high-protein custom meal prep website.

Live domains:

- `https://getprpd.com`
- `https://www.getprpd.com` (permanent redirect to `https://getprpd.com`)

Host: Vercel. The live domains temporarily remain on `rida-khan-s-projects/getprpd` while production secrets are migrated. The intended long-term project is the GitHub-connected `rida-khan-s-projects/getprpd-website-repo`.
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
2. Enters first name, last name, phone, email, delivery address, city, ZIP, and optional delivery/meal notes
3. May apply an approved partner/referral code and separately opt in to weekly menu emails
4. Selects meals and chooses Lean or Bulk per dish
5. Total is rounded up to the nearest dollar after delivery and any server-approved discount
6. `order.html` posts the order and captured attribution to the same-domain Vercel endpoint `/api/order`
7. Vercel validates the cutoff, menu IDs, quantities, code, and all server-owned prices and totals
8. Vercel writes directly to `Orders` and the first real blank row in `Payment Log`
9. Resend independently sends the owner notification and an itemized order-received email to the customer
10. Rida confirms payment and Saturday delivery by text

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
- `config/order-config.js` — single weekly source of truth for menu, macros, images, prices, delivery rules, and cutoff
- `package.json` / `package-lock.json` — backend dependency lock

### Operations

- `operations/OPERATIONS_INDEX.md` - first-read map of recipe, nutrition, label, source, and cook-day files

- `operations/RECIPE_DATA_SOURCE_OF_TRUTH.md` — first-read master register for recipe decisions, kitchen results, nutrition inputs, archived sources, and label readiness
- `operations/NEXT_MENU_DRAFT_2026-07-25.md` - July 25 live customer-menu record, recipe decisions, and remaining kitchen/production gates
- `operations/nutrition/NEXT_MENU_NUTRITION_DRAFT_2026-07-25.md` - controlled July 25 tier recipes and calculated nutrition estimates
- `operations/recipes/LOTUS_BISCOFF_CHEESECAKE_DRAFT.md` - reduced-calorie 395-calorie/40g-protein Biscoff test build
- `operations/costing/NEXT_MENU_DRAFT_COST_AUDIT.md` - preliminary July 25 direct-cost report; final only after recipe and product approval
- `operations/MASTER_PLAN.md` — prioritized website, recipe, cook-day, label, and compliance workstreams
- `operations/STANDARD_RECIPE_TEMPLATE.md` — controlled production recipe and yield template
- `operations/TIRAMISU_TEST_PLAN.md` — measured kitchen test needed before final tiramisu macros
- `operations/STREETCORN_CHICKEN_TEST_PLAN.md` — yield, portion, storage, and reheating test for the new bowl
- `operations/COOK_DAY_CHECKLIST.md` — post-cutoff through delivery-staging production checklist
- `operations/cook-day-planner.html` - private local planner that syncs the live Orders tab and generates the complete prep sequence, three-lane production plan, nine Friday cook phases, station plan, plating matrix, durable measured cook log, timing log, staging list, and QC record
- `operations/cook-log-store.js` - validated atomic local storage for actual cook-day measurements, with previous-version recovery
- `operations/cook-day-methods.js` - controlled cooking, assembly, equipment, plating, holding, and quality instructions for all active-menu dishes
- `operations/COOK_DAY_PLANNER_README.md` - planner import, printing, privacy, and weekly-use guide
- `operations/grocery-list.html` - private live-order grocery builder with pantry subtraction, package rounding, price estimates, retailer searches, CSV export, and printing
- `operations/GROCERY_LIST_README.md` - grocery builder and weekly sauce operating guide
- `operations/WEEKLY_CLOSEOUT_TEMPLATE.md` - weekly planned-versus-actual record for revenue, cost, yield, time, waste, delivery, and acquisition
- `operations/WEEKLY_CLOSEOUT_2026-07-11.md` - provisional July 11 revenue/LLC-fee reconciliation and opening business-bank transfer record
- `operations/WEEKLY_CLOSEOUT_2026-07-18.md` - completed Batch 2 order revenue, payment reconciliation, purchase split, and closeout record
- `operations/WEEKLY_CLOSEOUT_2026-07-25.md` - open Batch 3 sales, collections, purchase commitments, and post-delivery closeout record
- `operations/MARKETING_GROWTH_PLAN.md` - current capacity-controlled paid, organic, referral, and physical marketing strategy
- `operations/business-center.html` - private local Growth and Financial Center with current/historical batch reporting, separate consolidated receivables, DFW outreach, referral attribution, expenses, TikTok Marketing API sync, and CSV fallback
- `operations/BUSINESS_CENTER_README.md` - Business Center security, access, calculation, and weekly-use guide
- `operations/DFW_LOCAL_DISCOVERY_2026-07-22.md` - prioritized DFW partnership pipeline and official source links
- `operations/archive/README.md` - completed design briefs and implementation handoffs; archive files are historical, not current operating authority

Archived source documents kept inside the project:

- `operations/source-documents/PRPD_RECIPES_SOURCE_2026-07-13.pdf` — latest archived recipe-library source
- `operations/source-documents/PRPD_INGREDIENT_PRICES_SOURCE_2026-07-14.pdf` — latest archived ingredient-price source
- `operations/source-documents/WALMART_RECEIPT_2026-07-16.png` — itemized Prosper Walmart receipt used for current grocery-price verification

Recipe and label rule: update `operations/RECIPE_DATA_SOURCE_OF_TRUTH.md` whenever a kitchen test, portion, product label, or formula changes. Do not rely on chat history as the only record, and do not print final labels from unverified website estimates.

Additional internal label files:

- `operations/label-studio.html` - local Avery 5168 studio for all 15 active dishes plus the current manual BBQ Mac label, categorized meal selection, Lean/Bulk or Single switching, and multi-sheet four-up printing
- `operations/label-studio-app.js` - Label Studio state, categorized print queue, live label rendering, and one-sheet-per-variant print generation
- `operations/nutrition/label-data.js` - generated meal, ingredient, allergen, storage, and complete nutrition data used by the label studio
- `operations/LABEL_STUDIO_README.md` - regeneration workflow, accuracy standard, and print-test instructions
- `open-label-studio.bat` - one-click local launcher for the label studio
- `open-cook-day-planner.bat` - one-click local launcher for the cook-day planner
- `open-grocery-list.bat` - one-click local launcher for the grocery builder
- `PRPD Grocery Builder.lnk` on the Windows desktop - desktop shortcut for the grocery builder

The cook-day planner's live sync is read-only. It uses a localhost proxy in `operations/cook-day-server.js`, a separate planner key stored in the ignored `operations/.planner-key` file, and `PRPD_PLANNER_KEY` as an encrypted Vercel environment variable. Order exclusions and quantity corrections affect the current packet only; the Google Sheet remains the source record.

The protected planner maintenance route can also insert specifically approved manual orders into canonical Google Sheets columns A:K. That write path is not exposed as a public browser control, validates menu items and quantities, and blocks duplicate manual Order IDs. It does not change the normal read-only sync behavior.

Selecting **Generate Production Packet** opens the Kitchen Queue first. The operator chooses **Prep Day** or **Cook Day** and follows only the **Now** ticket; **Next** and **Later** provide awareness without becoming extra instructions. The active ticket's exact scaled recipe, quantities, planned yields, method, plating/holding instructions, release check, and quick actual fields appear immediately underneath. Every dish receives one cook ticket, one assembly ticket, and no duplicate job from the passive-equipment reference. The Runbook remains the complete printable supporting reference.

The Runbook produces the exact sold customer-meal count and applies a default 5% pooled reserve only to raw meat and poultry. This covers normal trim and cooking-yield variation without creating automatic extra containers, starches, sides, desserts, or finished meals. Customer nutrition labels exclude the permanent no-label accounts Talal and Duaa, while their meals remain fully included in production and staging. The Batch 3 packet provides an Avery 5168 customer-label plan, grouped raw-protein pulls with labeled dish-bowl allocations, a scaled master seasoning batch for compatible boneless chicken, per-dish and total rice quantities, produce totals, phased marinade/mix/sauce/dessert/side batches, metric and practical kitchen units, and scaled quantities inside method steps. The shared chicken base is applied once before exact bowl splits for the Power Bowl, street-corn bowl, hot-honey sliders, and BBQ mac; biryani remains a distinct marinade. Thursday prep, Friday cooking, photography, and Saturday delivery remain separate.

The generated workflow is selection-aware. Thursday groups compatible protein pulls, divides them into labeled dish bowls before dish-specific marinades, separates compatible and distinct rice batches, phases measured marinades/mixes/sauces/desserts/sides, handles vegetables, controlled rice cooling, customer labels, and closeout. Friday runs three coordinated lanes (passive equipment, active cooking, and cold/cooling), launches the longest hands-off batch first, produces breakfast/chicken/beef/starch components in equipment-sized batches, releases each component only after temperature and yield checks, assembles one dish/tier at a time, and bags by customer last. Any true overage is recorded after production rather than planned in advance.

Each weekly packet also scales exactly two batch-wide sauces. The current pair is Smoky BBQ Yogurt Ranch and Tangy Yogurt Honey Mustard. The default batch makes 30 sealed customer cups of each flavor, 10 cup-equivalents of each flavor in squeeze bottles for meal assembly, and one quality-control cup of each flavor. This is 82 cup-equivalents but 62 physical side cups. Meal-specific condiments remain part of their individual recipes. These are controlled PRPD adaptations of established sauce styles, so a 60 g pilot tasted with representative food remains required before scaling the full batch.

The Kitchen Queue covers both Prep Day and Cook Day. One current instruction stays visible, its one relevant scaled recipe or prep batch is directly below it, and other work stays collapsed. Prep Day moves through count lock, desserts, sauces, produce/sides, protein prep, rice, and labels. Cook Day moves through startup, breakfast, chicken, beef/formed protein, seafood/remaining hot dishes, dish-by-dish assembly, and customer-by-customer pack-out. Quick actual-yield entries save into the durable Cook Log. Setup, counts, prep completion, day-specific queue position, and guided progress are keyed to the batch and delivery date.

The label studio is an internal working tool and its public Vercel path redirects to the homepage. All required nutrition fields are populated with calculated estimates from the saved recipes, supplied product labels, manufacturer data, USDA records, and approved generic equivalents. Finished net weights and some cooking yields remain practical estimates and should be replaced with cook-day measurements when convenient.

Nutrition and label regeneration:

```powershell
python operations/nutrition/calculate_active_menu.py
python operations/nutrition/generate_label_data.py
python operations/nutrition/generate_production_data.py
python operations/nutrition/generate_active_menu_audit_docx.py
python -m unittest discover -s operations/nutrition -p "test_*.py" -v
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
- Delivery fee: `$6.99`
- Free delivery: food subtotal over `$75`
- The minimum and free-delivery threshold use the meal subtotal before any partner discount.
- An approved partner discount is deducted after delivery is calculated.
- Final amount due is rounded up to the nearest dollar after delivery and discount are applied.
- `/api/order` recomputes these totals server-side; do not trust browser-submitted totals.

### Partner Codes + Attribution

Partner codes live in `config/order-config.js` under `promotions.codes`. The shared configuration powers the checkout display, while `/api/order` independently validates the code and recalculates the discount. Never add discount logic only to `order.js`.

```js
promotions: {
  codes: [
    { code: 'SANA15', partner: 'Sana', type: 'fixed', value: 15, active: true },
  ],
},
```

`type` may be `fixed` or `percent`; `maxDiscount` and `expiresIso` are optional. There are no active codes in the repository until a real partner is approved. A partner QR should point to a measurable link such as:

```text
https://getprpd.com/order?ref=SANA15&utm_source=referral&utm_medium=partner&utm_campaign=partner_referrals&utm_content=sana
```

The `ref` value prefills the code. UTM values, landing page, referrer, partner, and redeemed discount are stored with the durable order record. Public codes are not secrets; protection comes from server-side validation, limits, expiry, and reconciliation.

### Weekly Menu Email Consent

The order page includes an unchecked weekly-menu email option. Transactional order confirmations do not enroll customers. Consent is stored per order in `Orders` column V. Do not start automated marketing sends until every email includes PRPD's required sender identification, postal address, and a working unsubscribe method.

### Order Cutoff + Confirmation

- Orders automatically close at the batch `cutoffIso` time (Wednesday at 5:00 PM Central for the current batch).
- The frontend replaces the menu with an orders-closed message after cutoff.
- `/api/order` independently rejects late orders using the shared `batch.cutoffIso` value.
- Successful confirmations show an itemized order, meal subtotal, delivery fee, total due, delivery date, and order reference.
- The customer receives the same itemized order by email. This confirms receipt only; it does not claim the order is paid. Rida confirms payment and delivery separately by text.
- Freezer-friendly dishes can display a `Better later in the week` badge. The page explains that customers planning days 5-7 should freeze those meals on delivery and thaw them overnight in the refrigerator before reheating.
- New order references use `PRPD-B{batch}-{YYYYMMDD}-{8 hex characters}` and are saved in `Orders` column K and `Payment Log` column N. The API also accepts legacy 4-character references from pages that were already open during the migration.
- `/api/order` rejects a duplicate order reference before writing a second row.

### Current Week (Batch 3 - Delivery Saturday July 25, 2026)

The Batch 3 customer order page, cook-day planner, grocery builder, recipe cards, shared chicken plan, weekly sauces, and Kitchen Queue all use the July 25 Batch 3 data. The default active-label dataset remains separate from the July 25 review dataset until physical testing and remaining recipe approvals are complete.

Breakfasts:

| ID | Dish | Category |
|---|---|---|
| b1 | High Protein Omelette | standard |
| b2 | Beef Breakfast Skillet | beef |
| b3 | Power Bowl | standard |
| b4 | Blueberry Cheesecake Protein Pancakes | standard |

Mains:

| ID | Dish | Category |
|---|---|---|
| m1 | Cheeseburger Hot Pockets | beef |
| m2 | Mexican Streetcorn Chicken Bowl | standard |
| m3 | Hot Honey Chicken Sliders | standard |
| m4 | Chicken Biryani | standard |
| m5 | BBQ Chicken Mac & Cheese | standard |
| m6 | Korean Bulgogi Beef Bowl | beef |
| m7 | Garlic Butter Shrimp + Rice | beef |
| m8 | Premium NY Strip Steak | premium |

Desserts:

| ID | Dish | Category |
|---|---|---|
| d1 | Cookie Dough Cup | dessert |
| d2 | Lotus Biscoff Cheesecake | dessert |
| d3 | Banana Cream Pie Cup | dessert |

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
  "orderId": "PRPD-B3-20260720-A4F2C91D",
  "batch": 3,
  "deliveryDate": "Saturday, July 25, 2026",
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
      "name": "High Protein Omelette",
      "category": "standard",
      "section": "Breakfast",
      "tier": "lean",
      "qty": 6,
      "unitPrice": 10.99,
      "subtotal": 65.94
    }
  ],
  "mealSubtotal": 65.94,
  "deliveryFee": 6.99,
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
| B | Batch | e.g. "Batch 3" |
| C | Delivery Date | e.g. "Saturday, July 25, 2026" |
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

Order and lead writes use an exact canonical range rather than Google Sheets table-detection append behavior. New Orders write to A:AC after the last real order record. The original A:K layout remains unchanged for planner compatibility, delivery details remain in L:P, and pricing/growth attribution is appended in Q:AC. New Website Leads write to A:T after the last real lead record. On July 15, two historically shifted order rows were moved back to the canonical layout and the lead stored in an earlier blank row was moved to the chronological bottom of Website Leads. No customer record was discarded.

### Tab: Batch Dashboard (operational view)

`Batch Dashboard` is a non-destructive view over the canonical `Orders` and `Payment Log` ledgers. Select Batch 1, Batch 2, or Batch 3 in cell B3 to update the order count, revenue, amount paid, outstanding balance, batch history, and filtered order table. Do not paste or move customer rows into this tab; the website and Cook-Day Planner continue to use `Orders` as the source of truth.

The raw ledgers stay append-only across batches. Batch separation belongs in this dashboard and filters rather than in duplicate per-batch order tabs, which would split the source of truth and break automated readers.

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

Do not use `deploy.bat` until the migration below is complete because it depends on the local Vercel project link.

Current live bridge: `rida-khan-s-projects/getprpd` (`prj_We7VvuEJKEmwUxC46KSByvxzQOm8`). It currently owns the custom domains and the working Google Sheets, Resend, and planner secrets.

Long-term production target: `rida-khan-s-projects/getprpd-website-repo` (`prj_StlJj0TqH3W2XA1vzZxyWRLx0tJo`). It is connected to `getprpd-sudo/getprpd-website-repo`, has the latest application build and TikTok configuration, and is the project that should own production after migration verification.

Migration sequence:

1. Recreate `GOOGLE_SERVICE_ACCOUNT_BASE64`, `RESEND_API_KEY`, and `PRPD_PLANNER_KEY` on `getprpd-website-repo`; `GOOGLE_SHEET_ID` is already present.
2. Redeploy `getprpd-website-repo` and verify intake, orders, Sheets writes, Resend mail, planner sync, and TikTok Events API using its Vercel URL.
3. Move `getprpd.com` and `www.getprpd.com` to `getprpd-website-repo`.
4. Re-run the complete live test suite.
5. Preserve `getprpd` as a rollback for 7-14 days, then delete it only after explicit approval.

### GitHub backup

Push via GitHub Desktop (not terminal — CLI push blocked by `aazim040607` vs `getprpd-sudo` owner mismatch).
Repo: `getprpd-sudo/getprpd-website-repo`

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

Reported business outcome by July 15: the active customer base grew from approximately one customer to eleven while this campaign was the primary paid acquisition source. Final campaign quality cannot be calculated until total spend, attributed qualified leads, first paid orders, and repeat orders are entered into `operations/WEEKLY_CLOSEOUT_TEMPLATE.md`.

Recommended next controlled campaign test (lead optimization):

- Objective: Lead Generation → Website → Lead event
- Same geo, creative, budget
- URL: `https://getprpd.com/?utm_source=tiktok&utm_medium=paid&utm_campaign=dfw_lead_test&utm_content=original_video_1`
- Before launching: verify pixel events firing in TikTok Events Manager

Do not replace the proven Spark post with an unproven creative in the same test that changes the objective. Use the original post as the control and treat a new video as a challenger. The full cross-channel budget and physical-marketing plan is in `operations/MARKETING_GROWTH_PLAN.md`.

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

Resend verified sending domain: `mail.getprpd.com`. Website notifications use `orders@mail.getprpd.com` and `leads@mail.getprpd.com`; receiving is not required.

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

- `getprpd` is the temporary live bridge. It owns the domains and working business credentials, but it is not the intended long-term GitHub-connected project.
- `getprpd-website-repo` is the long-term production target and GitHub-connected project. Its frontend is currently identical to the live site, but its backend migration must pass before domains move.
- Never delete either project during migration. Delete `getprpd` only after the target project has served production successfully through the rollback window.

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

1. Read `operations/RECIPE_DATA_SOURCE_OF_TRUTH.md` and use only Current Recipe values for customer-facing macros.
2. Update `config/order-config.js` only.
3. Update its `batch` object (batch number, delivery date, cutoff ISO timestamp, and cutoff label).
4. Replace the `menu` dishes with that week's offerings.
5. Set `image: '/assets/images/meals/filename.jpg'` only for dishes that have an uploaded photo in `assets/images/meals/`. Set `image: ''` for all others.
6. Verify descriptions have no em dashes (they look AI-generated).
7. Verify macros match a Production Approved recipe.
8. Use `available: false` or a dish-specific `maxQty` only when needed.
9. Run `npm.cmd test` and one labeled test submission when pricing logic changes.
10. Deploy to Vercel; the attached apex and `www` domains update automatically.
