# PRPD Operations Index

Updated: July 22, 2026

This is the starting point for recipe, nutrition, label, and cook-day work. The files are intentionally separated by purpose so calculations, kitchen observations, and historical records do not overwrite each other.

## Authority At A Glance

| Question | Open this file | Do not substitute |
|---|---|---|
| What is sold this week? | `../config/order-config.js` | Historical recipe PDFs |
| What are this week's rebuilt nutrition estimates? | `nutrition/NEXT_MENU_NUTRITION_DRAFT_2026-07-25.md` | The previous July 18 audit |
| What is live for July 25? | `../config/order-config.js` and `NEXT_MENU_DRAFT_2026-07-25.md` | Removed planning alternatives |
| What are the July 25 controlled grams and macros? | `nutrition/NEXT_MENU_NUTRITION_DRAFT_2026-07-25.md` | Historical recipe claims |
| What are the July 25 preliminary direct costs? | `costing/NEXT_MENU_DRAFT_COST_AUDIT.md` | The earlier hand-built cost prototype or chat estimates |
| What ingredient prices are authoritative? | `PRPD_COSTING_SOURCE_OF_TRUTH.md` | Chat estimates or older ingredient PDFs |
| What is ready for production? | `RECIPE_DATA_SOURCE_OF_TRUTH.md` | A recipe merely appearing in the 48-dish library |

Batch 3 contains 15 dishes and 27 tier calculations, not 27 separate dishes. The July 25 calculator is now the current customer-menu nutrition authority. Batch 2 remains isolated as the prior production record.

**Rollover boundary:** the customer order page, cook-day planner, grocery builder, production recipe cards, and Kitchen Queue now use Batch 3. The default active-label dataset remains separate from the July 25 review dataset until physical print testing and the remaining kitchen checks are complete.

## Start Here

1. `RECIPE_DATA_SOURCE_OF_TRUTH.md` - current recipe decisions, portion rules, source priority, nutrition status, and unresolved kitchen checks.
2. `MASTER_PLAN.md` - completed work and remaining business workstreams.
3. `COOK_DAY_CHECKLIST.md` - production-day workflow from final orders through packed-meal reconciliation.
4. `CURRENT_MENU_COOK_RECORD.md` - lightweight sheet for recording actual yields, portions, and exceptions during the next cook.
5. `WEEKLY_MENU_ROLLOVER.md` - reuse and approval procedure for returning, modified, and new dishes.
6. `COOK_DAY_PLANNER_README.md` - operating instructions for the built local planner.
7. `PRPD_COSTING_SOURCE_OF_TRUTH.md` - dated ingredient, packaging, delivery, labor, and overhead costs used for menu pricing.
8. `MEAL_PREP_MARGIN_BENCHMARKS_2026-07-22.md` - meal-prep and limited-service benchmarks, Batch 3 margin interpretation, labor sensitivity, and true-profit requirements.
9. `NEXT_MENU_DRAFT_2026-07-25.md` - July 25 live-customer-menu record and remaining production gates.
10. `nutrition/NEXT_MENU_NUTRITION_DRAFT_2026-07-25.md` - controlled gram recipes and rebuilt calories/macros for the live July 25 customer menu; review this before production promotion.
11. `costing/ACTIVE_MENU_PRELIMINARY_COST_AUDIT.md` - generated direct-cost table for the live July 18 menu.
12. `costing/NEXT_MENU_DRAFT_COST_AUDIT.md` - regenerated preliminary July 25 direct costs from the controlled recipe grams and current price ledger.
13. `costing/FULLY_LOADED_COST_WORKSHEET.md` - plain-language weekly worksheet for labor, kitchen, delivery, utilities, overhead, and actual profit.
14. `GROCERY_LIST_README.md` - live-order grocery consolidation, pantry subtraction, weekly sauces, package rounding, prices, and shopping workflow.
15. `WEEKLY_CLOSEOUT_TEMPLATE.md` - planned-versus-actual weekly operating record for revenue, spend, yield, waste, time, delivery, and acquisition.
16. `BATCH_PRODUCTION_RECORD_TEMPLATE.md` - compact required actuals for counts, yields, portions, food safety, flow, quality, waste, and recipe approval.
17. `WEEKLY_CLOSEOUT_2026-07-11.md` - provisional first cash reconciliation for the completed July 11 cycle and opening business-bank transfer.
18. `WEEKLY_CLOSEOUT_2026-07-18.md` - live Batch 2 revenue, payment-log audit, purchase split, and post-delivery closeout checklist.
19. `WEEKLY_CLOSEOUT_2026-07-25.md` - open Batch 3 booked sales, collections, planned equipment/label purchases, and closeout checklist.
20. `MARKETING_GROWTH_PLAN.md` - capacity-controlled paid, organic, referral, and physical marketing plan with measurement rules.
21. `BUSINESS_CENTER_README.md` - private growth, finance, outreach, ad-import, and data-security operating guide.
22. `DFW_LOCAL_DISCOVERY_2026-07-22.md` - prioritized local gym, MSA, mosque, and fitness-center partnership list.

## Current Recipe Records

The `recipes/` folder contains the dishes that received a dedicated test, correction, or current-build record:

- `recipes/EGG_BITES_CURRENT_RECIPE.md`
- `recipes/FRENCH_TOAST_TASTE_TEST.md`
- `recipes/BEEF_SEEKH_SHAWARMA_DRAFT.md`
- `recipes/MEATBALL_ARRABBIATA_CURRENT_RECIPE.md`
- `recipes/MEXICAN_STREETCORN_CHICKEN_CURRENT_DRAFT.md`
- `recipes/STRAWBERRY_CHEESECAKE_ADAPTATION.md`
- `recipes/CHOCOLATE_OREO_MOUSSE_MACRO_AUDIT.md`

Supporting recipe records:

- `CURRENT_MENU_TASTE_TESTS.md` - current test formulas and results.
- `ACTIVE_MENU_RECIPE_AUDIT.md` - active-menu comparison against the archived recipe source.
- `FULL_RECIPE_LIBRARY_INDEX.md` - inventory of the historical 48-recipe library and sauce formulas.
- `STANDARD_RECIPE_TEMPLATE.md` - reusable controlled recipe format.
- `MACRO_VERIFICATION_PROTOCOL.md` - taste-first calculation and approval rules.
- `WEEKLY_SIDE_SYSTEM.md` - shared side and freezer-suitability plan.
- `WEEKLY_MENU_ROLLOVER.md` - next-menu reuse and recalculation rules.
- `archive/COOK_DAY_SYSTEM_DESIGN_2026-07-15.md` - archived design specification; the working planner README is authoritative now.
- `PRPD_COSTING_SOURCE_OF_TRUTH.md` - price authority, current verified costs, delivery costing, and weekly margin workflow.
- `costing/calculate_active_menu_costs.py` - regenerates current-menu direct costs from audited recipes.
- `costing/calculate_next_menu_draft_costs.py` - imports the controlled July 25 nutrition builds and regenerates the current-menu preliminary cost report without changing the live order page.
- `costing/test_active_menu_costs.py` and `costing/test_next_menu_draft_costs.py` - verify complete cost coverage, shared confirmed prices, menu shape, and basic pricing invariants.

`PRPD_RECIPE_MASTER.docx` is a standardization workbook and template, not a claim that every historical recipe has been fully kitchen-verified.

## Nutrition System

The `nutrition/` folder is the reproducible calculation system:

- `nutrition/calculate_active_menu.py` - one calculation model for all 15 active dishes and 27 meal/tier combinations.
- `nutrition/ACTIVE_MENU_NUTRITION_AUDIT_2026-07-14.md` - generated ingredient-by-ingredient audit.
- `nutrition/test_active_menu.py` - calculation validation tests.
- `nutrition/calculate_next_menu.py` - controlled recipe calculator for the July 25 customer menu; it does not directly change live customer data.
- `nutrition/NEXT_MENU_NUTRITION_DRAFT_2026-07-25.md` - generated July 25 recipe and macro review document.
- `nutrition/test_next_menu.py` - verifies menu shape, positive nutrition, tier scaling, and explicit protein-powder grams.
- `nutrition/INGREDIENT_LABEL_AND_MEASUREMENT_CHECKLIST.md` - accepted product assumptions and optional accuracy upgrades.
- `nutrition/generate_active_menu_audit_docx.py` - Word audit generator.
- `nutrition/generate_label_data.py` - browser label-data generator.
- `nutrition/label-data.js` - generated label data; do not hand-edit.
- `nutrition/generate_next_menu_label_data.py` - creates the separate review-only July 25 label dataset without changing active labels.
- `nutrition/next-menu-label-data.js` - generated July 25 draft labels; do not use for customer printing until the saved approval gates pass.

`PRPD_ACTIVE_MENU_NUTRITION_AUDIT.docx` is the formatted operator copy covering the complete active menu.

## Label System

- `label-studio.html` - internal Avery 5168 label tool.
- `LABEL_STUDIO_README.md` - access, regeneration, and printing instructions.
- `open-label-studio.bat` in the project root - one-click launcher.
- `PRPD Label Studio.lnk` on the Windows desktop - desktop shortcut.

The Label Studio supports categorized meal selection, Lean/Bulk variants, Select All/Clear, and multi-sheet print generation. Every Avery 5168 page contains four identical labels for one meal/tier variant. The Cook-Day Planner supplies the number of copies and sheets required for the reviewed order batch. Use the header switch to review the separate July 25 draft dataset; returning to active labels restores the current production menu.

## Cook-Day Planner

The planner supports all 15 dishes in the active Batch 3 public menu. Protected manual-order maintenance writes canonical Orders rows for approved manual customers without weakening ordinary read-only sync.

- `cook-day-planner.html` - private order-to-production planner with live Google Sheets sync and editable order review.
- `cook-day-core.js` - tested order import, aggregation, and scaling logic.
- `cook-day-methods.js` - complete cooking, assembly, plating, holding, and equipment instructions for every active-menu dish.
- `cook-day-server.js` - localhost-only static server and protected proxy for the live Orders endpoint.
- `nutrition/generate_production_data.py` - creates the planner's controlled component matrix from the nutrition model.
- `nutrition/production-data.js` - generated production data; do not hand-edit.
- `COOK_DAY_PLANNER_README.md` - import, generation, printing, privacy, and weekly-use instructions.
- `open-cook-day-planner.bat` in the project root - one-click local launcher.
- `PRPD Cook-Day Planner.lnk` on the Windows desktop - desktop shortcut.

The Kitchen Queue is the execution view for Prep Day and Cook Day. It shows **Now**, **Next**, and **Later**, but only the Now ticket is actionable. One relevant scaled recipe or prep batch sits directly below with exact ingredients, measured method, planned yield, release check, plating/holding instructions, and quick actual fields. Each dish is cooked once in its own ticket, assembled once in its own ticket, and each customer is packed in a separate ticket. Quick fields write to the durable Cook Log; day positions survive switching and refreshes. The Runbook remains the complete printable production authority.

## Grocery Builder

- `grocery-list.html` - private live-order grocery, pantry, package, cost, search, CSV, and print interface.
- `grocery-list-app.js` - sync and interaction logic.
- `grocery-list-core.js` - tested requirement, packaging, purchase, and export calculations.
- `grocery-catalog.js` - controlled package sizes, prices, confidence, and retailer search terms.
- `GROCERY_LIST_README.md` - weekly operating instructions and sauce-count explanation.
- `CURRENT_GROCERY_TRIP_2026-07-16.md` - current freezer subtraction, vendor split, buy thresholds, and July 18 batch shopping quantities.
- `PACKAGING_SLEEVE_RESEARCH_2026-07-16.md` - universal sleeve recommendation, variable-label strategy, vendor findings, and prototype approval gates.
- `open-grocery-list.bat` in the project root - one-click local launcher.
- `PRPD Grocery Builder.lnk` on the Windows desktop - desktop shortcut.

The Grocery Builder uses the same reviewed current-batch orders and controlled recipe data as the Cook-Day Planner. It combines every recipe ingredient, a 5% pooled raw meat and poultry reserve, both weekly sauces, containers, dessert cups, physical sauce cups, bags, and labels. The reserve does not inflate finished meals or non-protein ingredients. The operator subtracts pantry stock before shopping. Confirmed PRPD prices remain authoritative; retailer search links are for current availability and price checks, not automatic silent replacement.

Selecting Generate opens Cook Mode first. It combines the reviewed live-order counts with controlled production quantities and `cook-day-methods.js` to produce a customer label print plan, grouped protein pulls and labeled dish bowls, per-dish and total rice quantities, produce prep totals, phased marinades/mixes/sauces/desserts/sides, the full cook-day sequence, and a scaled recipe card for every ordered dish. Finished production equals sold customer meals; raw meat and poultry pulls include the pooled reserve. The Runbook and remaining tabs are supporting master references, count sheets, and production records.

## Business Center

- `business-center.html` - local growth, finance, attribution, outreach, expense, and ad-reporting UI.
- `business-center-core.js` - tested order normalization, cost, attribution, referral, finance, and TikTok CSV calculations.
- `business-center-store.js` - validated atomic local state for outreach, expenses, and ad imports.
- `local-discovery-data.js` - reviewed DFW target list used by the outreach pipeline.
- `../api/business-data.js` - key-protected, read-only reporting endpoint for Orders, Payment Log, Website Leads, and Accounts Receivable.
- `BUSINESS_CENTER_README.md` - access, security boundaries, calculations, and weekly workflow.
- `open-business-center.bat` in the project root - one-click local launcher.

The Business Center does not change Google Sheets. It treats Orders as booked sales, Payment Log as per-order cash status, Accounts Receivable as consolidated collection requests, and the saved cost audit as the direct-cost basis. Consolidated requests are displayed separately and never added to booked sales, preventing double-counting. Unknown menu items produce a visible warning instead of a guessed margin.

The `operations/` folder is excluded from Vercel because it contains proprietary recipes and internal production records.

## Document Retention

The operations workspace currently contains 47 document files: 43 Markdown records, two Word files, and two source PDFs. Five of those documents are already in `archive/`; the two source PDFs remain preserved as evidence. The remaining documents are intentionally split between current batch records, reusable operating procedures, recipe records, and generated audits.

Do not delete current recipe drafts or taste-test plans until the matching dish has been physically validated and promoted to Current Recipe. After each delivery, move completed one-time design/implementation briefs to `archive/`, retain weekly closeouts as financial history, and keep generated reports only when they remain the current review copy. Python `__pycache__` folders are disposable build artifacts and are not operating records.

## Completed Design Archive

The `archive/` folder holds completed design briefs and implementation handoffs. They are retained for decision history and are not current operating authority. See `archive/README.md` for the map. No weekly recipe, nutrition calculation, active price, customer label, or planner runtime file belongs in the archive.

## Archived Sources

The `source-documents/` folder preserves the original business files used during the audit:

- `source-documents/PRPD_RECIPES_SOURCE_2026-07-13.pdf`
- `source-documents/PRPD_INGREDIENT_PRICES_SOURCE_2026-07-14.pdf`
- `source-documents/WALMART_RECEIPT_2026-07-16.png`

These files are evidence and historical reference. Do not edit or replace them with generated reports.

## Regenerate After a Recipe Change

From the project root:

```powershell
python operations/nutrition/calculate_active_menu.py
python operations/nutrition/calculate_next_menu.py
python operations/nutrition/generate_label_data.py
python operations/nutrition/generate_production_data.py
python operations/nutrition/generate_active_menu_audit_docx.py
python -m unittest discover -s operations/nutrition -p "test_*.py" -v
```

Then review the affected label before printing.
