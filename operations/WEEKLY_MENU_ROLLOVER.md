# PRPD Weekly Menu Rollover

Updated: July 15, 2026

Use this procedure whenever the next menu is prepared. The July 14 nutrition audit created the ingredient library, calculation model, label layout, and approval rules. Future menus should reuse that work instead of recalculating every returning dish from zero.

## Current Automation Boundary

PRPD has a controlled weekly rollover system, but it is not yet a one-button menu publisher.

Already reusable or generated:

- audited returning-dish recipes and nutrient calculations;
- separate next-menu nutrition and direct-cost reports;
- generated label and cook-day production data;
- automated menu, nutrition, pricing, API, label, planner, and grocery tests; and
- one shared live order configuration for customer display and server validation.

Still deliberately manual:

- owner approval of the final menu;
- kitchen validation of new or materially changed dishes;
- promotion of approved next-menu recipes into the live active-menu dataset;
- the final update to `config/order-config.js`;
- visual inspection of changed labels; and
- production deployment.

This separation prevents a planning recipe from silently becoming a customer-facing claim. Once the core recipe library has been kitchen-tested and several weekly rollovers have been completed without exceptions, an internal menu editor can automate these promotion steps while preserving the same approval gates.

## Returning Dish

1. Select the latest authoritative recipe record.
2. Confirm that the brand, ingredient grams, cooking method, yield, and Lean or Bulk build have not changed.
3. Import the existing dish calculation into the active menu.
4. Update only dates, batch, menu status, price, and any changed ingredients.
5. Regenerate the nutrition audit and label data.
6. Run the nutrition tests and visually inspect one label per affected tier.

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

- Recipe/build matches what will be cooked.
- Portion and yield assumptions are recorded.
- Calories and required label nutrients regenerate successfully.
- Label ingredients and allergens match the current formula.
- Customer-facing name, price, and tier options match the order page.
- A new or changed item never silently inherits an older dish's macros.

## Regeneration Commands

```powershell
python operations/nutrition/calculate_active_menu.py
python operations/nutrition/generate_label_data.py
python operations/nutrition/generate_production_data.py
python operations/nutrition/generate_active_menu_audit_docx.py
python -m unittest discover -s operations/nutrition -p "test_*.py" -v
```

The July 14 audit was the foundation. A normal returning menu should now be a controlled update, not another full rebuild.
