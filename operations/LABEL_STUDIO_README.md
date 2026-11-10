# PRPD Label Studio

**October29 Batch17 final send:** Owner explicitly authorized completing standard final labels using recipe-based nutrition and finished-weight estimates, with no provisional/draft/AI/estimate wording on the label. The73 customer meal labels plus6 distinct feedback QR labels reconcile to the live Google Orders source and exclude Duaa,Talal and Home. The21-sheet final PDF was visually checked, all6 QR hashes matched live customer/order records, and the exact file was emailed to Adnan with Gmail SENT verified (message1a186802da1d5028). See the newest current handoff for evidence; earlier review-only holds below are history. Calculation assumptions remain internal and no physical test results were invented.

The exporter supports `--current-orders` for an owner-authorized final run after the published cutoff. It uses the current confirmed feed, retains exact meal/tier counts and all standing exclusions, runs ordinary final data/date validation, and does not mutate the planner lock or cook date. `--job=bags` generates the separate customer QR sheets. `--review-proof` remains a distinct, visibly marked review path; it must not be mistaken for final output.

**October 20, 2026 Batch 16 bag-label proof:** The live locked-planner handoff produced 77 exact meal labels and exactly five customer-specific feedback labels from the five current eligible orders. The customer labels rendered on two separate Avery 5168 sheets with three unused final slots. All five customer names matched, all five QR images were present and distinct, and repeated quantities/lines collapsed to unique dish/tier reviews. The temporary proof lock was released because ordering remains open until Wednesday at 6:00 PM CT. Lock again after cutoff before the final print. A physical plain-paper alignment and phone-scan check remains required before using Avery stock.

**October 5, 2026 audit:** The saved replacement PDF correctly contains 102 labels, including eight Lean quesadillas. No Biryani-specific slot offset was found. Shared clipping is fixed without moving Avery slots; every review proof is visibly marked DRAFT and unknown/unverified weights cannot pass final production checks. The old PDF is preserved, not silently rewritten with corrected nutrition. Physical printer scaling/alignment still requires the new one-page check. See the [complete label audit](records/label-runs/BATCH13_LABEL_AUDIT_2026-10-05.md) and [current handoff](active/HANDOFF_2026-10-05.md).

**October 4, 2026 Batch 13 incident:** Owner reports extra/duplicate-looking labels and lateral displacement on Chicken Biryani. Final Label Studio output was 102 intended labels/26 Avery 5168 sheets, emailed after an earlier proof; the physically printed file and root cause are not confirmed. Next audit must reconcile customer/tier label counts, PDF versions, page slot alignment and printer scaling with a physical calibration sheet. Planned internal spares were not cooked and were not meant to get labels. See [`active/HANDOFF_2026-10-04.md`](active/HANDOFF_2026-10-04.md). The Batch 10 checkpoint below is historical.

Updated: September 8, 2026

The local Label Studio uses a generated dataset only after a menu is owner-approved and published. The current Batch 10 dataset contains **21 controlled dishes and 33 tier-specific builds**, including planner-only recipes. It is an internal tool and is excluded from the public Vercel deployment. Printing remains blocked until the exact locked order plan, active-batch dates, menu shape, recipe payload, and label payload all agree. The reviewed Batch 10 handoff contains 34 labels on nine mixed Avery 5168 sheets, with two unused final slots. Six are `High-Protein Beef Kofta & Roasted Vegetables` labels with the controlled 500 calorie / 75 g protein values. The queue was visually checked but not printed, exported or emailed. See `records/batches/BATCH_6_PREMATURE_PUBLICATION_INCIDENT_2026-08-10.md` for the historical incident that led to these controls.

Open it from the `PRPD Label Studio` desktop shortcut, run `open-label-studio.bat`, or visit `http://127.0.0.1:4173/operations/label-studio.html` while the local operations server is running.

## Current Scope

- Avery 5168, 3.5 x 5 inches, four labels per letter sheet
- Breakfast, Main, Dessert, and Grab & Go categories
- Lean/Bulk controls for meals and Single controls for desserts/add-ons
- Independent meal/tier checkboxes and 1-200 exact individual-label counters
- Mixed four-up print packing so one sheet can contain different meals and tiers without wasting three labels
- Complete calculated nutrition panels, ingredients, allergens, storage, handling, and green meal-specific taglines
- Chilled desserts use **Serve chilled. Do not heat.**
- Buffalo Chicken Pinwheels and both chilled boxes use their generated chilled handling instructions.
- Dish-specific reheat directions for every hot meal
- Read-only recipe, ingredient, allergen, nutrition, weight, storage, and handling fields; changes must be made in the controlled sources and regenerated

## Data Pipeline

Do not hand-edit nutrition in the browser. Regenerate from the controlled recipes:

```powershell
python operations/nutrition/calculate_next_menu.py
python operations/nutrition/generate_next_menu_label_data.py
python operations/nutrition/verify_next_menu_labels.py
```

Current controlled files:

- Recipe and nutrition authority: `nutrition/NEXT_MENU_NUTRITION_2026-09-12.md`
- Generator: `nutrition/generate_next_menu_label_data.py`
- Generated studio data: `nutrition/next-menu-label-data.js`
- Verification: `nutrition/verify_next_menu_labels.py`

The generator reads `config/order-config.js` only after it carries an explicitly approved, published menu, resolves every sellable ID and name to one controlled recipe, validates the customer-facing macros, and emits exactly the required Lean/Bulk or Single tiers. While configuration is unpublished and sanitized, there is no printable current menu. Generation fails if a live dish has no current recipe, if an unused recipe remains in the current calculator, or if an ID, category, tier, or macro is inconsistent.

The verifier rebuilds the expected payload and compares the saved file in full: batch metadata, dates, IDs, names, category, tier shape, net weight, ingredient order, allergen declaration, all nutrition fields, storage mode, and handling copy. `open-label-studio.bat` runs this verifier before opening the studio and blocks on any difference. It never regenerates silently.

The active batch identity is also fail-closed in the browser. `config/order-config.js` supplies the controlled made date, refrigerate-through date, batch ID, optional completion timestamp, and inclusive refrigerated-day count; the generated label dataset carries an independent copy. The studio enables printing only when those records, the active menu, every generated label field, and the printable fields match. Legacy batches retain the day-before-delivery, four-day rule. A batch with an explicit completion timestamp may use that completion date as its made date, and its refrigerate-through date must equal made date plus the declared inclusive window minus one day. The batch ID must follow the controlled made date. Old URL print plans, undeclared items, archived/manual dishes, wrong tiers, stale date parameters, and browser Ctrl+P are blocked. A missing current generated file cannot fall back to the historical `label-data.js` dataset.

Update recipes and purchased-product facts in the controlled calculator, update the active batch/menu in `config/order-config.js`, regenerate, and verify. Do not unlock or hand-edit label facts in the browser.

For production, first require explicit owner menu approval and publication. After the real cutoff, lock the final customer order snapshot in Cook-Day Planner, generate the packet, and use **Open exact Label Studio**. That handoff preserves each individual Lean, Bulk, or Single quantity and declares the total label count. The studio rejects the whole plan if any entry is malformed, duplicated, missing from the generated dataset, assigned to the wrong tier, outside the 1-200 per-variant limit, or inconsistent with the declared total. It never prints a partial subset of an invalid plan.

The same locked-planner handoff now carries a separate customer bag-label queue. Label Studio validates the batch, delivery date, declared customer count, unique order references, customer names, and unique dish/tier rows before it provisions any QR. The **Print customer bag labels** button creates a separate Avery 5168 four-up print job with exactly one bag label per eligible locked customer order. It never mixes bag labels into the aggregate meal-label pages. Each printed QR contains only an opaque private token at `https://getprpd.com/feedback`; customer names and order references are not encoded in the URL.

The live feedback service stores only the token hash, maps the token to the exact unique dishes in that order, autosaves private ratings and notes, and issues at most one $5 credit after every unique dish has a 1-10 score and an eight-character `What did you like?` note. `What would you change?` stays optional. Credits expire after 90 days. Active wallet credit is capped at $30; additional earned credit is queued rather than lost. Feedback links open after the recorded delivery date and expire 30 days later.

The label queue always excludes Talal, Duaa, Rida, and Owner Custom, including orders recorded under their full names. Home-party boxes are excluded by `packageType: 'home_party_box'`. A different custom order may be marked `labelExempt` or `noLabels` at the order or item level; do not infer that every paid made-to-order meal is exempt. These exclusions are enforced in the shared cook-day core even if a screen forgets its batch configuration. The planner and grocery builder use that same eligibility rule. For Batch 11, the corrected locked queue is 27 customer labels on seven sheets; the earlier 42-label PDF is invalid and must not be printed.

## Ingredient And Allergen Standard

Ingredients are displayed in descending recipe weight using common ingredient names. Brands remain in the internal recipe/cost sources. Before treating a label as compliance-ready, copy the complete subingredient statements and allergen declarations from every purchased compound product, including bread, tortillas, protein macaroni and cheese, sauces, cheesecake filling, Biscoff products, protein powder, pudding mix, and beef breakfast slices.

The ingredient statement and allergen declaration are separate from the Nutrition Facts small-business exemption. Do not remove them merely because PRPD is small.

## Printing Test

1. Review the meal, tier, dates, batch ID, net weight, ingredients, allergens, storage, and handling text.
2. Prefer the locked Cook-Day Planner handoff; confirm its automatically selected meal/tier rows and exact individual counts. Manual queue entry is a controlled fallback only.
3. Confirm total sheets equal the ceiling of total labels divided by four. Different meals and tiers share a sheet, and blank slots appear only at the end of the final sheet.
4. Select **Print exact label queue**.
5. Choose Letter, Portrait, 100% or Actual Size, Margins None, headers/footers off, and Background graphics on.
6. Use Labels, Heavyweight, or Cardstock media and Best/High quality in printer properties.
7. Print one plain-paper calibration and hold it behind an Avery 5168 sheet against a light before using label stock.

Every printed meal label is single-batch stock. Never subtract a date-bearing label left from an earlier batch from the current print quantity, even when the meal name and tier match. Mixed four-up packing is the waste-control method. Blank Avery stock can carry forward; finished meal labels cannot.

Never choose Fit to page, Shrink oversized pages, or a driver scaling option.

The official slot positions are left edges 0.5 and 4.5 inches and top edges 0.5 and 5.5 inches. The two rows share the center die line. Artwork is inset and scaled to 96% to tolerate normal feed drift and Avery's rounded corners.

## Accuracy Boundary

The nutrition panels are recipe-based estimates using recorded product labels, manufacturer data, USDA references, and approved equivalents. They are not laboratory analyses. First-production cooked yields, final net weights, retained oil, salt, and sauce quantities should be recorded and used to improve later batches without silently changing already-published values.
