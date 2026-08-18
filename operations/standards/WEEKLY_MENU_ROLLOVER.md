# PRPD Weekly Menu Rollover

Updated: August 10, 2026

Use this procedure whenever the next menu is prepared. The July 14 nutrition audit created the ingredient library, calculation model, label layout, and approval rules. Future menus should reuse that work instead of recalculating every returning dish from zero.

## Current Automation Boundary

PRPD has a controlled weekly rollover system, but it is not a one-button menu publisher. `config/order-config.js` stays sanitized and unpublished until the owner explicitly approves the final menu. Only then may it control the active batch and what customers can order. Label generation reads approved published configuration directly and refuses to carry forward a prior menu, archived dish, old tier, or old production date.

Already reusable or generated:

- audited returning-dish recipes and nutrient calculations;
- separate next-menu nutrition and direct-cost reports;
- generated label and cook-day production data tied to the exact live dish IDs;
- automated menu, nutrition, pricing, API, label, planner, and grocery tests; and
- one shared live order configuration for customer display and server validation.

Still deliberately manual and mandatory:

- owner approval of the final menu;
- kitchen validation of new or materially changed dishes;
- promotion of approved next-menu recipes into the controlled current recipe calculator;
- a dated record of the owner's explicit publish approval;
- the final approved update to `config/order-config.js` and its published flag;
- visual inspection of changed labels; and
- production deployment.

This separation prevents a planning recipe from silently becoming a customer-facing claim. Digital consistency is not permission to deploy, email customers, advertise, accept orders, shop, print labels, or cook. The August 10 failure is recorded in `../records/batches/BATCH_6_PREMATURE_PUBLICATION_INCIDENT_2026-08-10.md`.

## Returning Dish

1. Select the latest authoritative recipe record.
2. Confirm that the brand, ingredient grams, cooking method, yield, and Lean or Bulk build have not changed.
3. Import the existing dish calculation into the active menu.
4. Add the dish to the controlled current recipe calculator with the same customer-facing name and required Lean/Bulk or Single structure.
5. Keep the candidate internal while the owner reviews the complete menu.
6. After explicit owner approval, record it and update `config/order-config.js` with `published: true`, the approved IDs, names, prices, macros, batch number, delivery date, made date, refrigerate-through date, and batch ID.
7. Regenerate the nutrition audit, label data, and production data.
8. Run the verifier and full tests, visually inspect one label per affected tier, and only then deploy.

If the formula and brands are unchanged, the prior nutrient calculation remains the working estimate. Do not repeat the original full audit merely because the dish returns to the menu.

## Modified Returning Dish

Recalculate only changed inputs, such as a different tortilla, portion, sauce, side, or cooking yield. Record what changed, the old and new grams, updated yield or finished portion, any required taste/storage result, and the new nutrition and label version.

## New Dish

A new dish requires:

1. Ingredient formula in grams.
2. Exact brands for ingredients that materially affect nutrition.
3. Target batch and serving yield.
4. Lean and Bulk finished builds, or a documented Single portion.
5. At least one kitchen test for taste, fit, yield, and reheat quality.
6. Nutrition calculation from the shared ingredient library plus any new items.
7. Ingredients, sub-ingredients, allergens, storage, reheating, and freezer fit.
8. Label review and automated test pass before production printing.

## Weekly Approval Gate

- The owner explicitly approved the final dish list and publication after review; a draft, generated file, passing test, or inferred chat intent is not approval.
- Unpublished configuration exposes no draft menu, blocks checkout and reminders, and keeps Google Ads paused.
- Recipe/build matches what will be cooked.
- Portion and yield assumptions are recorded.
- Calories and required label nutrients regenerate successfully.
- Label ingredients and allergens match the current formula.
- Customer-facing ID, name, price, macros, and Lean/Bulk or Single options match the order page exactly.
- A new or changed item never silently inherits an older dish's macros.
- Made date is the day before delivery; refrigerate-through is three days after production; the batch ID is derived from that made date.
- Every active order-page item has generated current-recipe label data, and generated data contains no extra historical or manual item.
- The saved generated file passes the full-payload verifier after every recipe, ingredient, allergen, nutrition, handling, tier, or batch change.
- Every mashed-potato dish uses the controlled packaged instant-potato build. Confirm that grocery output contains dry flakes rather than raw potatoes for mash and that the planner groups it into the packaged instant-mash Prep Day wave.

## Regeneration Commands

```powershell
python operations/nutrition/calculate_next_menu.py
python operations/nutrition/generate_next_menu_label_data.py
python operations/nutrition/verify_next_menu_labels.py
python operations/nutrition/generate_production_data.py
python operations/costing/calculate_next_menu_draft_costs.py
python -m unittest discover -s operations/nutrition -p "test_*.py" -v
npm test
```

`generate_next_menu_label_data.py` reads the live order config, resolves every active ID/name to one controlled current recipe, validates customer-facing macros, and generates the required Lean/Bulk or Single label tiers. It fails closed if a sellable dish lacks a recipe or if the recipe calculator contains an unused carryover. `verify_next_menu_labels.py` independently rebuilds the expected payload and compares dates, batch ID, dish IDs, names, categories, tier shape, net weights, ingredients, allergens, all nutrition fields, storage, and handling copy.

`open-label-studio.bat` runs the verifier before opening the studio. It does not silently regenerate or overwrite data. A failure blocks launch with instructions to correct the controlled source, regenerate, and verify again. The browser repeats the active batch and exact menu-parity checks before both button printing and Ctrl+P; a missing generated dataset cannot fall back to the historical `label-data.js` file.

After orders close, sync and review the live customer orders, then lock the final Cook-Day Planner snapshot before opening Label Studio. The planner sends exact individual counts for each Lean, Bulk, and Single build plus the active made date, refrigerate-through date, batch ID, and declared total. Label Studio mixes variants four-up, so sheet count is `ceil(total labels / 4)` and only the last page may have blanks. Any missing/archived dish, wrong tier, duplicate or malformed entry, invalid quantity, stale batch context, or total mismatch blocks the entire queue; never replace a blocked item with a historical label or print the remaining subset.

The July 14 audit was the foundation. A normal returning menu should now be a controlled update, not another full rebuild, but every weekly rollover still requires regeneration and verification before labels are printed.
