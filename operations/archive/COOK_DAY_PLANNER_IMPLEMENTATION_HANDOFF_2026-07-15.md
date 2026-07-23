# PRPD Cook-Day Planner: Next Implementation Pass

> Archived implementation handoff. The listed production-planner features were completed; use `../COOK_DAY_PLANNER_README.md` for current behavior and remaining limits.

Updated: July 15, 2026

This began as the handoff for the next implementation pass. The requested upgrades were implemented on July 15, 2026. Keep this file as the design and regression record.

## Current Confirmed Behavior

- The private local planner reads the active batch from the Google Sheets `Orders` tab through the protected, read-only Vercel endpoint.
- Synced orders remain editable in the planner and exclusions never rewrite Google Sheets.
- Generate Production Packet opens the Runbook first.
- The current real-order test produced 54 meals, 14 ordered dishes, seven phases, six oven jobs, 32 side cups, and zero missing cooking methods.
- Every selected dish receives scaled batch ingredients, equipment, temperature, ordered production steps, plating, holding, and verification instructions.
- The ingredients shown are totals for the entire selected weekly batch of that dish, not a one-serving recipe.
- Production is visibly separated into customer meals, one shared PRPD extra per selected dish, and total output. If both tiers are ordered, that one extra uses the Bulk build. The PRPD extra covers quality control, tasting, photography, or an emergency replacement. Customer portion sizes do not change.
- The Runbook begins with exact label sheets, raw protein pulls, dry rice, produce, and measured sauce/marinade/mix/dessert batches.

## Implemented Measurement Improvements

The planner now adds operator-friendly dual units without removing metric source values:

- Dry seasonings and small quantities: show grams plus teaspoons/tablespoons when conversion is sensible.
- Liquids: show milliliters plus cups/tablespoons.
- Meat: show kilograms/grams plus pounds/ounces.
- Countable proteins: show an estimated physical count in addition to weight when practical.
- Peri-peri uses **chicken leg quarters (attached leg and thigh)**, not drumsticks. Rename the production method and ingredient assumptions accordingly.
- Estimated counts must be visibly labeled as estimates because piece sizes vary. The final plated count remains the controlling specification.

Conversions should be ingredient-aware. Do not use one universal grams-to-teaspoons conversion because ingredient density differs. Store conversion metadata with each controlled ingredient or recipe component.

## Implemented Runbook Improvements

Relevant scaled measurements are repeated inside production method steps. The operator does not need to look back and forth between the ingredient list and method while cooking.

Example structure:

1. Combine `[scaled chicken weight]`, `[scaled sauce volume]`, and `[scaled seasoning quantities]`.
2. Marinate using the stated time and holding procedure.
3. Cook at the stated temperature and record endpoint temperature/yield.
4. Plate the exact Lean and Bulk component quantities.

The method must remain generated from structured recipe data. Do not hard-code a second set of numbers into prose because it could disagree with the scaled ingredient list.

## Implemented PRPD Extra

The earlier hybrid rule made two separate extras for small dish/tier batches. It was replaced with one transparent rule:

`ordered servings + one shared PRPD extra per selected dish`

The PRPD extra is the quality-check, tasting, photography, or emergency-replacement serving. When both Lean and Bulk are ordered, the one extra is Bulk-sized. No separate contingency serving or percentage is added. Countable items still round to complete usable units, and customer portion specifications never change.

The label plan treats Avery 5168 as four identical labels per sheet. It shows paid customer labels required, sheets to print, and unused labels for every selected dish/tier. PRPD extras do not receive customer labels.

## Weekly Production Calendar

The Runbook now explicitly separates four operational periods:

### Thursday: Prep Day

- Reconcile final orders and shopping quantities.
- Marinate chicken and beef.
- Wash and cut vegetables.
- Prepare desserts and begin required chilling.
- Prepare sauces and side cups.
- Print and apply labels to empty containers.
- Stage equipment, pans, and dry seasoning kits for Friday.

### Friday: Cook Day

- Execute hot production using the oven/stove sequence.
- Cook rice, pasta, potatoes, vegetables, chicken, and beef.
- Record temperatures and cooked yields.
- Assemble and portion every Lean, Bulk, and Single item.
- Cool, seal, reconcile, and stage completed customer orders.

### Friday Night or Saturday Morning: Photography Window

- Hold one approved presentation portion of each needed dish.
- Take current menu photographs for the website before delivery.
- Track which dishes still need customer-facing photography.

### Saturday: Delivery Day

- Complete final bag and customer reconciliation.
- Verify cold holding and delivery staging.
- Deliver in the afternoon.

The generated packet should eventually separate tasks into **Prep Day**, **Cook Day**, **Photography**, and **Delivery** views or sections. Recipe steps should be assigned to the correct day so Thursday work is not mixed into Friday's hot-production sequence.

## Completed Implementation Order

1. [x] Correct Peri-Peri from drumsticks to chicken leg quarters across current recipes, production data, labels, methods, and customer copy. Preserve the old name as an order-import alias.
2. [x] Add structured unit-conversion metadata and tests.
3. [x] Add scaled quantity references to production-method steps.
4. [x] Design and test the serving-based/hybrid buffer rule.
5. [x] Split the runbook into Thursday, Friday, photography, and Saturday sections.
6. [x] Run the current five-order dataset and verify all 14 ordered dishes produce complete cards with no missing methods.
7. [ ] Print one complete packet and use it during the next real production cycle.
8. [x] Replace the double-extra hybrid buffer with one PRPD extra.
9. [x] Add label, protein, rice, produce, and measured prep-batch dashboards.

## Required Regression Checks

- Live sync still loads only the active batch.
- Excluded and corrected orders affect the packet only, not Google Sheets.
- Totals still reconcile to customer meals.
- Every active menu ID has a controlled production method.
- Dual-unit displays retain the original metric quantity and do not alter calculations.
- Method-step quantities exactly match the scaled ingredient totals.
- Label counts equal paid customer servings and Avery sheet math rounds by dish/tier; internal PRPD extras remain unlabeled.
- Raw protein and dry-rice values use exact structured quantities; expected cooked yields remain visibly labeled estimates.
- Orange measurement notes remain visible until the missing seasoning gram weights are recorded.
- Peri-peri plate counts and purchased leg-quarter counts are consistent.
- The packet prints without clipping on desktop and remains readable on a phone.
- Label Studio and Cook-Day Planner both open through the shared localhost server on port 4173.

## Known Honest Limit

The production sequence is complete, but exact minute-by-minute durations and capacity limits should be tuned from two real cook days. Record actual starts, finishes, yields, and bottlenecks rather than inventing precision.
