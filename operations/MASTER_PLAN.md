# PRPD Operations Master Plan

Updated: July 16, 2026

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

- [x] Inventory the complete 48-recipe library and embedded sauce formulas in `FULL_RECIPE_LIBRARY_INDEX.md`.
- [x] Audit the active website menu against the latest recipe PDF in `ACTIVE_MENU_RECIPE_AUDIT.md`.
- [x] Create the controlled draft master and reusable recipe record in `PRPD_RECIPE_MASTER.docx`.
- [x] Retire the rice-based customer description for Beef Seekh Kabab Shawarma; its formula and macros remain Draft.
- [x] Define the practical taste-first working-macro method in `MACRO_VERIFICATION_PROTOCOL.md`.
- [x] Confirm the published Chocolate/Oreo Mousse macros conflict with its documented formula.
- [x] Confirm Egg Bites as 4 bites + 120g hash Lean and 6 bites + 150g hash Bulk.
- [x] Create the lightweight current-menu cook record in `CURRENT_MENU_COOK_RECORD.md`.
- [x] Create taste-test records for French Toast and Chocolate/Oreo Mousse.
- [ ] Convert each active dish into a Current Recipe record as it is cooked or tested.
- [ ] Replace vague measures with grams where doing so makes cook day or macros more consistent.
- [ ] Record exact brands when their nutrition values affect macros.
- [ ] Separate purchased weight, ready-to-cook weight, cooked yield, and plated weight.
- [ ] Record target yield and actual yield every test or production batch.
- [x] Define working Lean and Bulk component weights for every active dish in the calculation model.
- [ ] Mark every recipe as Draft, Kitchen Tested, or Current Recipe.
- [x] Recalculate complete working nutrition estimates for all 15 active dishes and 27 meal/tier combinations.
- [x] Maintain a working allergen statement for every active dish in generated label data.
- [x] Retire the old Cut/Maintain/Build terminology from the active ordering and label workflow.

USDA and foodservice training sources treat measured yield and portion control as the basis for predictable servings, food cost, and nutrition consistency.

References:

- https://foodbuyingguide.fns.usda.gov/Home/About
- https://theicn.org/memo-may-2023/
- https://extension.unr.edu/publication.aspx?PubID=4644

## Workstream 3: Immediate Recipe Tests

- [ ] Confirm the 4-bite Lean and 6-bite Bulk Egg Bite builds during the next real batch.
- [ ] Test the 12-slice taste-first French Toast formula and record the final bread and sides.
- [ ] Test the half-scoop Chocolate/Oreo Mousse prototype and record cocoa/honey amounts.
- [ ] Run the tiramisu test in `TIRAMISU_TEST_PLAN.md`.
- [ ] Resolve the ladyfinger count conflict using grams and cup capacity.
- [ ] Record cream yield, coffee pickup, finished cup weight, and chilled texture.
- [ ] Recalculate tiramisu macros from the exact brands and final portion.
- [ ] Record the complete Mexican Streetcorn Chicken Bowl formula.
- [ ] Run the controlled test in `STREETCORN_CHICKEN_TEST_PLAN.md`.
- [ ] Test its chicken, rice, corn, crema, and cotija component yields.
- [ ] Approve Lean and Bulk plating weights before publishing its macros.

## Workstream 4: Cook-Day Control

- [x] Build Cook-Day Planner Version 1 for order import, production quantities, stations, plating, staging, QC, and printing.
- [x] Add tested CSV and copied-Sheet order parsing with active-batch filtering.
- [x] Add protected read-only live sync from the current Google Sheets Orders tab.
- [x] Add non-destructive order review for duplicate/test exclusion and quantity corrections.
- [x] Preserve review decisions across refreshes without altering the source Sheet.
- [x] Keep imported customer data session-only and exclude internal operations files from Vercel.
- [ ] Use the generated packet and `COOK_DAY_CHECKLIST.md` for the next production day.
- [ ] Freeze order counts before shopping and preparation.
- [x] Automate conversion of orders into counts by dish and tier.
- [x] Automate conversion of dish counts into component quantities with an explicit buffer.
- [x] Generate a mise-en-place list organized by station and equipment.
- [x] Generate a complete seven-phase runbook with scaled ingredients, equipment, temperatures, methods, sauces/sides, plating, holding, and verification instructions for every active-menu dish.
- [x] Generate the current real-order packet with no missing dish methods.
- [ ] Record cook temperatures, cooling times, component yields, and portion checks.
- [ ] Reconcile packed container count to paid/customer orders before delivery staging.
- [ ] Record shortages, overages, substitutions, and rework for next week's adjustment.
- [x] Add ingredient-aware dual-unit displays: grams plus spoons, milliliters plus cups, and kilograms plus pounds/estimated counts.
- [x] Repeat generated scaled quantities inside the relevant method steps.
- [x] Replace automatic finished extra meals with exact customer production plus a 5% pooled raw meat and poultry reserve.
- [x] Print nutrition labels for customer meals only; the raw-protein reserve does not create containers or labels.
- [x] Group compatible protein pulls and rice bases while preserving labeled dish allocations and recipe-specific marinades/finishes.
- [x] Add direct Runbook navigation for overview, quantities, prep batches, Thursday, Friday, and recipe cards.
- [x] Correct Peri-Peri production from drumsticks to attached chicken leg quarters throughout the current controlled data while preserving legacy-order parsing.
- [x] Split the generated workflow into Thursday prep, Friday cook, Friday-night/Saturday-morning photography, and Saturday delivery sections.
- [x] Build the Grocery Builder for live-order ingredient aggregation, pooled raw-protein reserve, weekly sauces, packaging, pantry subtraction, package rounding, price estimates, retailer searches, CSV export, and printing.
- [x] Separate 60 sealed weekly-sauce cups, 20 kitchen-use cup-equivalents, and 2 QC cups so bulk assembly sauce does not inflate the physical cup purchase.
- [ ] Run the generated Grocery Builder list against the physical pantry before this week's shopping trip and replace planning prices with receipt prices when materially different.
- [ ] Complete the first weekly closeout using actual grocery spend, production yield, waste, labor time, delivery mileage, collected revenue, and remaining inventory.
- [x] Use the first live planner run to record every search, recalculation, interruption, and bottleneck before designing a simplified Kitchen Mode.

## Workstream 5: Labels

- [x] Confirm Avery 5168 stock, 3.5 x 5 inch dimensions, and four-label Letter-sheet geometry.
- [ ] Confirm the production printer model and that it is compatible with Avery 5168 laser stock.
- [ ] Confirm required legal information before finalizing copy.
- [x] Implement the low-ink design recorded in `archive/LABEL_SYSTEM_DESIGN_2026-07-14.md`.
- [x] Rebuild and document every displayed nutrient from recorded recipes and accepted sources.
- [x] Generate all labels from the shared nutrition model instead of manually retyping each design.
- [x] Add meal/tier selection, batch, made date, refrigerate-through date, net weight, ingredients, allergens, storage, reheating, and meal-specific notes.
- [x] Create and test a one-click desktop launcher for the internal label studio.
- [x] Generate four correctly sized labels on one Avery 5168 Letter sheet.
- [ ] Print one wet-fridge and freezer adhesion test before buying bulk stock.
- [ ] Replace estimated net weights with representative finished-container weights before production printing.
- [ ] Add a mixed-meal print queue if four identical labels per sheet creates meaningful waste.

## July 14 Completion Summary

- [x] Rebuilt the active menu nutrition model using recorded recipes, supplied labels, manufacturer data, USDA records, and approved generic equivalents.
- [x] Added calories and every required Nutrition Facts nutrient to the model.
- [x] Revised Beef Seekh Shawarma and Meatball Arrabbiata portions into the intended working calorie ranges.
- [x] Recorded the successful French Toast and Beef Seekh Shawarma kitchen tests.
- [x] Built the complete active-menu nutrition audit in Markdown and Word formats.
- [x] Built the Avery 5168 label studio for all active meals, tiers, dates, storage modes, ingredients, allergens, notes, and four-up printing.
- [x] Added automated nutrition and website/order validation tests.
- [x] Created `OPERATIONS_INDEX.md` so cook-day work has a single entry point.

## July 15 Weekly Operations Design

- [x] Document the faster returning/modified/new dish workflow in `WEEKLY_MENU_ROLLOVER.md`.
- [x] Implement the structured order-to-production packet specified in `archive/COOK_DAY_SYSTEM_DESIGN_2026-07-15.md`.
- [x] Base the design on standardized recipes, production records, backward scheduling, mise en place, food-safety checkpoints, and final reconciliation.
- [x] Build and test Cook-Day Planner Version 1.
- [x] Connect Version 1 to the live Orders tab through an authenticated local proxy.
- [x] Add a local desktop launcher and a printable eight-part production packet.
- [x] Make the complete Runbook the first view after generation instead of leaving the operator on a count summary.
- [x] Exclude private recipe and production files from the public deployment.
- [x] Generate and reconcile the expanded July 18 live batch: 11 orders, 105 customer meals, exact finished-meal counts, a 5% pooled raw-protein reserve, and no parser warnings. The batch includes approved manual/no-label production accounts and one zero-total promotional order.
- [ ] Record equipment capacity, task durations, yields, and bottlenecks during the next two cook days.
- [ ] Use those two real cook-day records to tune Version 2 timing and capacity rules.

## Workstream 6: Weekly Learning and Growth

- [ ] Complete `WEEKLY_CLOSEOUT_TEMPLATE.md` after each delivery cycle.
- [x] Build the private Business Center for live Sheets reporting, booked-versus-collected cash visibility, direct-cost contribution, referrals, local outreach, and TikTok CSV imports.
- [x] Build and source the first prioritized DFW partnership pipeline for independent gyms, MSAs, mosque programs, and fitness centers.
- [ ] Compare planned ingredient consumption with receipt spend and actual leftovers.
- [ ] Track lead, qualified-lead, first-paid-order, and repeat-order counts by UTM/referral source.
- [ ] Calculate customer acquisition cost from paid customers, not clicks or raw form submissions.
- [ ] Set the next week's acquisition budget from available production capacity and the observed acquisition cost.
- [ ] Run one controlled paid-media change at a time so creative, channel, and objective effects remain distinguishable.
- [x] Build guided Prep Day and Cook Day production cards with one current instruction, directly attached scaled recipes, quick actuals, assembly builds, and customer pack-out.
- [ ] Build one-button weekly menu promotion only after the core recipe library and rollover approval process are stable.
- [x] Build a server-side, read-only TikTok Marketing API reporting connection with a protected Business Center sync and CSV fallback. Account authorization and Vercel credential activation remain external setup steps; never expose the access token in browser code.
- [x] Build fail-soft TikTok Events API delivery for durable `Lead` and `PlaceAnOrder` conversions with browser/server event-ID deduplication. Verify with a temporary test-event code before campaign optimization.
- [ ] Build the first AI-assisted weekly operator brief and lead follow-up queue. AI may summarize, prioritize, and draft; Rida must approve any customer message, campaign change, or public content.

## Workstream 7: Business Banking and Customer Communications

- [x] Open a dedicated PRPD business checking account.
- [ ] Enroll the business account in Zelle using a dedicated business email, mobile number, or Zelle tag that is not already tied to a personal account.
- [ ] Route all new customer payments into the business account and pay PRPD groceries, packaging, advertising, phone service, and software from that account.
- [ ] Record any personal item paid from a business purchase as an owner draw or reimbursement; do not treat it as a PRPD expense.
- [ ] Reconcile the bank transaction list to Payment Log weekly and complete the weekly closeout after delivery.
- [ ] Monitor the Bank of America Fundamentals monthly-fee waiver before the 12-month introductory period ends.
- [ ] Trial Quo Starter with a temporary number before porting the existing Google Voice number. Test calls, customer texts, shared access, carrier registration, and automation before changing the number customers already know.
- [ ] Begin with human-reviewed text templates and missed-call acknowledgments. Do not enable an autonomous customer chatbot until consent, opt-out handling, escalation, and message logging are defined.

Current recommendation: keep Zelle identity separate from any phone number being tested or ported. Use a business email or Zelle tag for payments and the business phone for customer communication. Quo Starter is the strongest current fit for future API/webhook automation; Google Voice remains the lowest-friction fallback, and Twilio should wait until PRPD actually needs a custom messaging system.

Current finance interpretation: Duaa's undelivered Batch 2 order is waived. Talal's account carries one **$1,190 consolidated payment request** covering Batch 1 Talal and Duaa, Batch 2 Talal only, and Batch 3 Talal only. It has been requested but not collected. Talal's Batch 2 and Batch 3 base Payment Log rows remain for batch reporting but are embedded in the `$1,190` and must not be collected again. Duaa's new Batch 3 order is excluded and will be billed next week. Record the consolidated payment in Accounts Receivable only when it is actually received, then allocate revenue across batches during final closeout.

References:

- https://business.bankofamerica.com/en/deposits/checking-accounts
- https://www.bankofamerica.com/online-banking/zelle-faqs/
- https://www.sba.gov/business-guide/launch-your-business/open-business-bank-account
- https://support.google.com/voice/answer/9249103
- https://www.quo.com/pricing
- https://support.quo.com/core-concepts/integrations/api

## Definition of Done

The system is ready when one weekly menu update changes both customer display and server validation, every sold meal has a current recipe and clear portion specification, cook-day totals reconcile to orders, cooling and QC records exist, and labels use the same current working values.
