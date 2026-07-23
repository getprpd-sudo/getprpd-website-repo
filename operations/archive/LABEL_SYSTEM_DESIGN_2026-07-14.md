# PRPD Label System

> Archived implementation brief. For current operation and printing, use `../LABEL_STUDIO_README.md`.

## Implementation Status - July 14, 2026

The label generator is complete and available through `label-studio.html` or the
`PRPD Label Studio` desktop shortcut. It uses the shared active-menu nutrition
data, supports Lean and Bulk labels, and prints four 3.5 x 5 inch labels on an
Avery 5168 Letter sheet.

Completed:

- Low-ink PRPD label design with a light background and green brand accents
- Nutrition Facts, ingredients, allergens, storage, reheating, dates, and net weight fields
- Current active-menu dishes and both meal tiers
- Four-label Avery 5168 print layout
- Local desktop launcher and documented regeneration workflow

Physical checks still required before printing a production run:

- Confirm the printer is laser-compatible with Avery 5168 stock
- Run a plain-paper alignment test at 100% scale
- Enter representative finished net weights for the actual packed meals
- Test one applied label through refrigeration and freezing
- Confirm final business/legal label copy with the applicable regulator

## Finding

The current Beef Seekh Kebab Shawarma label is visually strong, but nearly the entire label is a dark-green ink field. A pixel review of the supplied 1500 x 1050 artwork found 87.7% very-dark coverage and only 1.9% light coverage. That is not a printer cost estimate, but it confirms that almost the entire label receives heavy color. On an inkjet or laser printer, it will use substantially more ink or toner than a light label with dark text. White areas on white label stock are normally unprinted, so a warm white/cream background is the efficient direction.

## Recommended Visual Direction

- Warm white or very light cream label stock/background.
- Forest-green PRPD logo, dish name, rules, and body text.
- Sage accent only for tier or category cues.
- One dark-green brand band or logo block, not a full dark background.
- Large dish name with a clearly visible LEAN / BULK marker.
- Macro hierarchy: calories and protein first; carbs and fat second.
- Avoid listing fiber unless it has been calculated from the approved formula.

This keeps the same PRPD identity while sharply reducing printed coverage.

## Data That Should Drive Every Label

- Dish name
- Tier
- Batch or lot ID
- Made date
- Use-by/date-marking information
- Net quantity, if required for the approved package/operation
- Calories and macros only from the production-approved formula
- Ingredients in the required order
- Major allergens
- Storage
- Reheating
- PRPD business identification/contact information required by the regulator

Final legal copy depends on PRPD's permit and packaging setup. FDA allergen rules extend to retail and food-service establishments that package and label foods before the customer's order. "May contain" language does not replace cross-contact controls.

References:

- https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies
- https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-food-labeling-guide

## Efficient Production Options

### Option A: Use the Current Printer More Efficiently

- Print a low-ink two-color design on freezer-safe white labels.
- Generate labels from a CSV or the shared dish database.
- Print only the exact quantity required for the final order count.
- Test moisture, refrigeration, freezing, reheating, and removal before buying bulk stock.

Avery lists freezer-safe films and food-service label materials for laser and inkjet printers:

- https://www.avery.com/help/article/freezer-safe-labels
- https://www.avery.com/category/usage/food-service-labels/

### Option B: Direct Thermal at Higher Weekly Volume

Direct-thermal printers use no ink or toner. A Brother QL-800 supports labels up to 2.4 inches wide, while a QL-1100 supports labels up to 4 inches wide. Thermal would reduce supplies and eliminate wasted partially used sheets, but the exact printer should not be purchased until label width, moisture resistance, freezer performance, and required information are confirmed.

- https://www.brother-usa.com/p/thermal-printers-labelers/QL800
- https://www.brother-usa.com/p/desktop-label-printers/QL1100

## Proposed Automation Flow

1. Approve the weekly menu and recipes.
2. Freeze customer order counts at cutoff.
3. Generate exact label quantities by dish and tier.
4. Pull dish name, macros, ingredients, allergens, and instructions from the approved dish record.
5. Produce a print-ready sheet or roll layout.
6. Reconcile printed label count with packed container count.

## Remaining Physical Inputs

- Current printer make/model
- Container dimensions and label placement
- Final permit/label requirements

The label stock and dimensions are already fixed: Avery 5168, four labels per
Letter sheet, 3.5 x 5 inches each. Labels are expected to survive refrigeration
and freezing; that performance still needs to be confirmed with one real package.
