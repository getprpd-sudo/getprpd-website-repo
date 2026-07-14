# PRPD Operations Master Plan

Updated: July 14, 2026

This file turns the website, recipes, labels, and cook day into one operating system. It is a working checklist, not a substitute for guidance from PRPD's permitting authority or food-safety professional.

## Priority 0: Compliance Gate

- [ ] Confirm the jurisdiction and permit that covers the kitchen where PRPD meals are prepared.
- [ ] Confirm that the production kitchen is approved for meat and poultry meal preparation.
- [ ] Confirm Certified Food Manager and food-handler requirements for everyone involved.
- [ ] Confirm the exact packaged-food label requirements with the permitting authority.
- [ ] Confirm how the words "high protein" and the displayed macros affect nutrition-labeling requirements.

Why this is first: Texas cottage-food rules exclude meat, poultry, and seafood. Frisco directs food establishments to its Health and Food Safety permitting process. Do not finalize a compliance label until the operating setup is confirmed.

Sources:

- https://capitol.texas.gov/tlodocs/89R/billtext/html/SB00541F.HTM
- https://www.friscotexas.gov/1751/Apply-for-Food-Establishment-Permits
- https://www.dshs.texas.gov/retail-food-establishments/permits-retail-food-establishments
- https://www.fda.gov/food/labeling-nutrition-guidance-documents-regulatory-information/small-business-nutrition-labeling-exemption

## Workstream 1: Website and Ordering

- [x] Keep the lightweight order page with no account or subscription requirement.
- [x] Keep server-owned pricing and validation.
- [x] Move the weekly batch, menu, macros, images, prices, and policies into one shared configuration file.
- [x] Add automated tests for config integrity and server pricing.
- [x] Add a customer-visible sold-out state driven by `available: false`.
- [x] Add optional per-dish quantity caps driven by `maxQty`.
- [ ] Add verified ingredient and allergen details to each dish record.
- [ ] Add dish-specific storage and reheating instructions where they differ.
- [ ] Build an internal weekly-menu editor or checklist after two weeks of using the shared config.

Research conclusion: PRPD does not need enterprise features yet. Local DFW services primarily emphasize the weekly menu, macro visibility, cutoff, delivery day, minimum order, and text updates. Accounts, subscriptions, and complex filters would add work without solving a current customer problem.

References:

- https://www.dfwfitmeals.com/
- https://fortworthmealprep.com/
- https://support.cookunity.com/hc/en-us/articles/27915820242971-How-does-my-subscription-work

## Workstream 2: Recipe Standardization

- [ ] Convert each active dish to the standard recipe template.
- [ ] Replace counts, scoops, and vague measures with grams where practical.
- [ ] Record exact brands when their nutrition values affect macros.
- [ ] Separate purchased weight, ready-to-cook weight, cooked yield, and plated weight.
- [ ] Record target yield and actual yield every test or production batch.
- [ ] Define Lean and Bulk component weights for every dish.
- [ ] Mark every recipe as Draft, Kitchen Tested, or Production Approved.
- [ ] Recalculate macros only from the production-approved formula.
- [ ] Maintain one allergen record per finished dish.
- [ ] Retire the old Cut/Maintain/Build terminology.

USDA and foodservice training sources treat measured yield and portion control as the basis for predictable servings, food cost, and nutrition consistency.

References:

- https://foodbuyingguide.fns.usda.gov/Home/About
- https://theicn.org/memo-may-2023/
- https://extension.unr.edu/publication.aspx?PubID=4644

## Workstream 3: Immediate Recipe Tests

- [ ] Run the tiramisu test in `TIRAMISU_TEST_PLAN.md`.
- [ ] Resolve the ladyfinger count conflict using grams and cup capacity.
- [ ] Record cream yield, coffee pickup, finished cup weight, and chilled texture.
- [ ] Recalculate tiramisu macros from the exact brands and final portion.
- [ ] Record the complete Mexican Streetcorn Chicken Bowl formula.
- [ ] Run the controlled test in `STREETCORN_CHICKEN_TEST_PLAN.md`.
- [ ] Test its chicken, rice, corn, crema, and cotija component yields.
- [ ] Approve Lean and Bulk plating weights before publishing its macros.

## Workstream 4: Cook-Day Control

- [ ] Use `COOK_DAY_CHECKLIST.md` for the next production day.
- [ ] Freeze order counts before shopping and preparation.
- [ ] Convert orders into counts by dish and tier.
- [ ] Convert dish counts into component quantities.
- [ ] Create one mise-en-place list organized by station and equipment.
- [ ] Record cook temperatures, cooling times, component yields, and portion checks.
- [ ] Reconcile packed container count to paid/customer orders before delivery staging.
- [ ] Record shortages, overages, substitutions, and rework for next week's adjustment.

## Workstream 5: Labels

- [ ] Confirm printer model, label stock, and physical label dimensions.
- [ ] Confirm required legal information before finalizing copy.
- [ ] Use the low-ink direction in `LABEL_SYSTEM.md`.
- [ ] Remove unverified fiber or macro values.
- [ ] Generate labels from the approved dish record instead of manually retyping each design.
- [ ] Add batch/made/use-by identification and allergen information.
- [ ] Print one wet-fridge and freezer adhesion test before buying bulk stock.

## Definition of Done

The system is ready when one weekly menu update changes both customer display and server validation, every sold meal has an approved recipe and portion specification, cook-day totals reconcile to orders, cooling and QC records exist, and labels are generated from the same approved data.
