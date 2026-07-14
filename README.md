# PRPD Website — Full Documentation

## Current Status

PRPD ("Prepped") is a live DFW halal high-protein custom meal prep website.

Live domains:

- `https://getprpd.com`
- `https://www.getprpd.com`

Host: Vercel (project: `rida-khan-s-projects/getprpd`, deployed via `vercel --prod`)
Registrar/DNS: GoDaddy
GitHub backup: `getprpd-sudo/getprpd-website-repo` (push via GitHub Desktop — CLI push blocked by owner mismatch)

---

## Funnels

### Lead/Intake Funnel (index.html)

1. User lands on `getprpd.com`
2. UTM/source parameters captured in `sessionStorage` on landing
3. User reviews food, menu, story, FAQ
4. User completes the 4-step intake form
5. `script.js` posts an idempotent payload to the same-domain Vercel endpoint `/api/lead`
6. Vercel validates it and writes directly to Google Sheets tab `Website Leads`
7. Resend sends the notification from `leads@mail.getprpd.com` to `getprpd@gmail.com`
8. Rida reviews and follows up personally

### Weekly Order Funnel (order.html)

1. Customer goes to `https://getprpd.com/order`
2. Enters first name, last name, phone number, optional notes
3. Selects meals, chooses lean or bulk tier per dish
4. Total is rounded up to nearest dollar
5. `order.html` posts payload with `action: "order"` to the same-domain Vercel endpoint `/api/order`
6. Vercel validates the request, cutoff, menu IDs, quantities, and server-owned prices
7. Vercel writes directly to `Orders` and the first real blank row in `Payment Log`
8. Resend sends an itemized notification from `orders@mail.getprpd.com` to `getprpd@gmail.com`
9. Rida confirms by text and sends Zelle payment info

---

## Important Files

### Core Site

- `index.html` — homepage / landing page
- `faq.html` — FAQ page (accordion)
- `order.html` — weekly customer ordering page, served at `/order` via Vercel rewrite
- `style.css` — global visual system and responsive styles
- `script.js` — nav behavior, animations, form validation/submission, attribution, and TikTok pixel events
- `vercel.json` — Vercel routing, headers, and cache rules
- `CLAUDE.md` — Claude working instructions (working style, hard rules, deployment notes)
- `deploy.bat` — double-click to deploy to Vercel production

- `api/order.js` — direct Vercel order backend for Google Sheets and Resend
- `api/lead.js` — direct Vercel intake backend for Google Sheets and Resend
- `package.json` / `package-lock.json` — backend dependency lock

### Supplemental Pages

- `dish-preview.html` — dish/photo preview helper
- `360-shoot-guide.html` — guide for 360 dish capture workflow

### Legacy / Deprecated

- `netlify.toml` — old Netlify config; no longer active, kept as artifact

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
- `about-aazim.jpg`

Meal card images for order.html (`assets/images/meals/`):

These are the dish photos displayed on the weekly order page cards. Only images for dishes currently on the week's menu should be wired (others get `image: ''`).

Currently uploaded (as of July 13, 2026):

- `egg-bites.jpg` → wired to Egg Bites (b1)
- `chicken-quesadillas.jpg` → wired to Breakfast Quesadilla (b3)
- `beef-seekh-shawarma.jpg` → wired to Beef Seekh Kabab Shawarma (m6)
- `bbq-mac-and-cheese.jpg` → not this week's menu (BBQ Chicken Mac & Cheese)
- `biryani.jpg` → not this week's menu (Chicken Biryani)
- `breakfast-skillet.jpg` → not this week's menu (Beef Breakfast Skillet)
- `omellete.jpg` → not this week's menu (High Protein Omelette)
- `steak.jpg` → not this week's menu
- `sweet-chilli-chicken-thighs.jpg` → not this week's menu

To add more dish images: drop the file in `assets/images/meals/`, then update the `image:` field in the MENU config in `order.html`.

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

Not indexed by search engines (`noindex, nofollow`). Intended for existing customers being sent the link by Rida.

### MENU Config

The MENU config is a JavaScript object at the top of the inline `<script>` in `order.html`. Update it every week to reflect the current batch's dishes.

Shape of each dish entry:

```js
{
  id: 'b1',                    // unique ID: b1-b4 (breakfast), m1-m8 (mains), d1-d3 (desserts)
  name: 'Egg Bites',
  category: 'standard',        // 'standard' | 'beef' | 'dessert'
  leanPrice: 10.99,
  bulkPrice: 12.99,
  description: 'Short plain-English description. No em dashes.',
  macros:     { cal, protein, carbs, fiber, fat },  // lean tier macros
  bulkMacros: { cal, protein, carbs, fiber, fat },  // bulk tier macros
  image: '/assets/images/meals/egg-bites.jpg',      // '' if no photo yet
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
- Final amount due is rounded up to the nearest dollar after delivery is applied.
- Apps Script recomputes these totals server-side; do not trust browser-submitted totals.

### Order Cutoff + Confirmation

- Orders automatically close at the batch `cutoffIso` time (Wednesday at 5:00 PM Central for the current batch).
- The frontend replaces the menu with an orders-closed message after cutoff.
- Apps Script independently rejects late orders using `ORDER_BATCH.cutoffIso`.
- Successful confirmations show an itemized order, meal subtotal, delivery fee, total due, delivery date, and order reference.
- Order references use `PRPD-B{batch}-{YYYYMMDD}-{4 hex characters}` and are saved in `Orders` column K and `Payment Log` column N.
- Apps Script rejects a duplicate order reference before writing a second row.

### Current Week (Batch 2 — Delivery Saturday July 18, 2026)

Breakfasts:

| ID | Dish | Category |
|---|---|---|
| b1 | Egg Bites | standard |
| b2 | French Toast | standard |
| b3 | Breakfast Quesadilla | standard |
| b4 | Grilled Cheese Breakfast Burrito | beef |

Mains:

| ID | Dish | Category |
|---|---|---|
| m1 | Butter Chicken | standard |
| m2 | Halal Cart Chicken + Yellow Rice | standard |
| m3 | Loaded Buffalo Chicken Potato | standard |
| m4 | Peri Peri Drumsticks | standard |
| m5 | Mexican Streetcorn Chicken Bowl | standard |
| m6 | Beef Seekh Kabab Shawarma | beef |
| m7 | Meatball Arrabbiata Pasta | beef |
| m8 | Halal Boy Kibble | beef |

Desserts:

| ID | Dish | Category |
|---|---|---|
| d1 | Strawberry Cheesecake | dessert |
| d2 | Chocolate Oreo Mousse | dessert |
| d3 | High Protein Tiramisu | dessert |

### Lean / Bulk Tier System

- Each non-dessert dish has independent Lean and Bulk quantity controls.
- A customer can order both Lean and Bulk versions of the same dish in one order.
- Each tier row displays its own price, calories, protein, and quantity.
- Desserts have no tier toggle; they show at flat $6.99.
- The order payload sends Lean and Bulk selections as separate item lines with the same dish ID and the appropriate `tier` value. Desserts use `tier: null`.

### Image System

French Toast and Halal Cart Chicken are wired to versioned meal-photo URLs. Meal assets use a one-hour revalidation cache so updated weekly photos do not remain stale for a year.

The `<img>` tag in each dish card uses `onerror="this.style.display='none'"`. If the image file doesn't exist or `image: ''`, the card shows a green PRPD placeholder instead — no broken image icons.

### Vercel Order API

`order.html` submits to `/api/order`. The endpoint accepts POST only, rejects malformed requests, recalculates every price and total, writes directly to Google Sheets, repairs a missing Payment Log row on retry, and prevents duplicate rows by Order ID. Resend uses the same Order ID as its email idempotency key.

`script.js` submits intake leads to `/api/lead`. The endpoint validates required contact fields, writes with `RAW` Sheets values to prevent formula injection, preserves UTM attribution, and prevents duplicate rows by Lead ID.

### Order Submission Payload

```json
{
  "action": "order",
  "orderId": "PRPD-B2-20260713-A4F2",
  "batch": 2,
  "deliveryDate": "Saturday, July 18, 2026",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "4691234567",
  "items": [
    {
      "id": "b1",
      "name": "Egg Bites",
      "category": "standard",
      "section": "Breakfast",
      "tier": "lean",
      "qty": 2,
      "unitPrice": 10.99,
      "subtotal": 21.98
    }
  ],
  "exactTotal": 21.98,
  "total": 22,
  "notes": "no jalapeño please",
  "submittedAt": "7/13/2026, 5:16:00 PM"
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
| B | Batch | e.g. "Batch 2" |
| C | Delivery Date | e.g. "Saturday, July 18, 2026" |
| D | First Name | |
| E | Last Name | |
| F | Phone | |
| G | Items | multi-line: `2x Egg Bites (Lean) — $21.98` per line |
| H | Exact Total | decimal, e.g. 181.84 |
| I | Total (Rounded) | integer, e.g. 182 |
| J | Notes | customer's optional note |
| K | Order ID | retry/idempotency reference |

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

### Tab: Website Leads (auto-filled by Vercel)

Written when the index.html intake form is submitted:

Columns A:T preserve contact details, intake answers, UTM attribution, landing page/referrer, and Lead ID.

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
vercel alias [deployment-url] getprpd.com
vercel alias [deployment-url] www.getprpd.com
```

Or double-click `deploy.bat`. Always run both alias commands after every deploy — the domains are pinned per deployment and will drift otherwise.

### GitHub backup

Push via GitHub Desktop (not terminal — CLI push blocked by `aazim040607` vs `getprpd-sudo` owner mismatch).
Repo: `getprpd-sudo/getprpd-website-repo`

---

## Form + Attribution

### Website intake form (index.html)

Required fields (as of June 2026):

- Full Name
- Phone Number (exactly 10 digits)
- Location
- Referral source
- Fitness Goal

Optional fields:

- Mosque/Gym detail (shown only when Mosque or Gym selected)
- Dietary restrictions (multi-select)
- Notes

Removed from form (June 2026 — too much friction):

- Training Days per Week
- Do you eat Halal? (redundant — all PRPD food is halal)

Validation/spam:

- Final submit re-checks all required steps
- Phone must be exactly 10 digits
- Honeypot field `hpWebsite` silently blocks obvious bots

### Attribution capture

`script.js` reads UTM params on landing and stores in `sessionStorage`:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `landing_page` (first URL visited)
- `referrer` (document.referrer)

These are sent with every form and order submission. Recommended TikTok ad URL format:

```
https://getprpd.com/?utm_source=tiktok&utm_medium=paid&utm_campaign=dfw_launch&utm_content=original_video_1
```

---

## TikTok Pixel

Pixel ID: `D8KU48BC77U7CO3SHUSG`

Installed in `<head>` of `index.html` and `faq.html`.

Events fired:

- `PageView` — every page load
- `CompleteRegistration` — on successful intake form submission
- `Lead` — on successful intake form submission

---

## TikTok Ads

Current live ad as of June 29, 2026:

- Campaign: `PRPD_DFW_Traffic_OriginalVideo_001`
- Objective: Traffic → Landing page view
- Budget: $20/day
- Geo: Collin, Dallas, Denton, Tarrant counties
- Age: 18–44, All genders
- Creative: original high-performing organic Spark post
- CTA: Learn More
- Destination: `https://getprpd.com/?utm_source=tiktok&utm_medium=paid&utm_campaign=dfw_launch&utm_content=original_video_1`

Initial performance (June 29 ~11AM): $6.58 spend, 3,063 impressions, 16 clicks, $0.41 CPC, 0 leads.

Recommended next campaign (lead optimization):

- Objective: Lead Generation → Website → Lead or CompleteRegistration event
- Same geo, creative, budget
- URL: `https://getprpd.com/?utm_source=tiktok&utm_medium=paid&utm_campaign=dfw_lead_test&utm_content=original_video_1`
- Before launching: verify pixel events firing in TikTok Events Manager

---

## Vercel Configuration

Production environment variables (values are encrypted in Vercel and must never be committed):

- `GOOGLE_SERVICE_ACCOUNT_BASE64`
- `GOOGLE_SHEET_ID`
- `RESEND_API_KEY`

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
- Labeled migration test rows were intentionally left in Sheets pending owner review.

Headers set in `vercel.json`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Long cache for `/fonts/*` and `/assets/*`

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
- Never put Google or Resend credentials into source files; use Vercel environment variables
- Never point the website forms back to Apps Script unless intentionally performing a rollback
- Never replace real PRPD images with stock or AI photos
- Never remove phone validation from either form
- No alcohol in any PRPD recipe (halal brand)

Before major edits:

- Check current deployed site
- Check mobile layout
- Preserve warm, premium, local, human brand direction

When updating the weekly menu in `order.html`:

1. Update the `BATCH` object (batch number, delivery date, cutoff ISO timestamp, and cutoff label)
2. Replace the `MENU` config dishes with that week's offerings
3. Set `image: '/assets/images/meals/filename.jpg'` only for dishes that have an uploaded photo in `assets/images/meals/`. Set `image: ''` for all others.
4. Verify descriptions have no em dashes (they look AI-generated)
5. Verify macros match the recipe doc
6. Mirror the batch/cutoff constants in `api/order.js`
7. Mirror dish IDs, names, categories, and prices in `api/order.js`
8. Run the order validation tests and one labeled test submission when pricing logic changes
9. Deploy to Vercel + alias both domains
