# PRPD Operations Index

**Current entry point, November 9, 2026:** [Current operating brief](active/CURRENT_OPERATIONS.md) and [current sauce policy](active/CURRENT_SAUCE_POLICY.md). Earlier "current" links below refer to dated historical checkpoints.

**Current entry point, November 9, 2026:** [Monday handoff and next-chat prompt](active/HANDOFF_2026-11-09.md). Start here for Batch 18 closeout, Dropbox photography, eight weeks of payments, Google Ads, meal ratings, and this week's marketing and menu.

**Current entry point, October 29, 2026:** [`active/HANDOFF_2026-10-29.md`](active/HANDOFF_2026-10-29.md), then [`active/CURRENT_MENU_COOK_RECORD.md`](active/CURRENT_MENU_COOK_RECORD.md). Reviewed 98 portions, 92 customer/family plus 6 Home. Streamlined planner and owner grocery choices verified. Keep wrap chicken Friday. Latest Ads/finance and remaining physical/label work are in that handoff. Older current-entry headings are dated history.

**Current entry point, October 11, 2026:** [`active/HANDOFF_2026-10-11.md`](active/HANDOFF_2026-10-11.md). It records the Tommy Brachey custom-plan research, two-drop safety model, current R&D recipes, $619.49 working quote, margin assumptions, unsent customer questions and the corrected Texas tax-classification decision. Chilled reheatable meals sold without utensils are likely exempt; no blanket tax or checkout change is authorized. Nothing in the handoff authorizes a customer send, purchase or production lock.

**Current entry point, October 7, 2026:** [`active/HANDOFF_2026-10-07.md`](active/HANDOFF_2026-10-07.md). It controls today's Batch 14 reminder, Story, cutoff, live reconciliation, fulfillment coordination, planner/grocery validation and physical recipe-test queue. Re-read live orders, payments, conversations and holds before acting. October 5 figures are history, not Batch 14 authority.

**Current entry point, October 5, 2026:** [`active/HANDOFF_2026-10-05.md`](active/HANDOFF_2026-10-05.md). Completed reconciliation/photo/label work, current recipe audit, kitchen workbook, planner migration status and remaining gates are recorded there. Owner deferred next-menu creation. Older assertions below are historical where superseded.

**Current entry point, October 4, 2026:** [`active/HANDOFF_2026-10-04.md`](active/HANDOFF_2026-10-04.md), followed by [`records/batches/BATCH_13_CLOSEOUT_NOTES_2026-10-04.md`](records/batches/BATCH_13_CLOSEOUT_NOTES_2026-10-04.md). Batch 13 was delivered per owner report October 3; outstanding work is reconciliation, recipe calibration, labels, photos, prices and payment verification. All older "current operating authority" and Batch 12/13 planning assertions below are dated history where they conflict.

Updated: September 28, 2026

Open `active/HANDOFF_2026-11-09.md` first. Use `active/CURRENT_STATUS.md` for earlier context. Before any repository task, also read `../AGENTS.md` and the complete `../.codex/Skills/Food skill/SKILL.md`. Older dated batch files are historical evidence, not current-menu instructions.

The August 5 and September 8 handoffs are historical. Do not use them for current quantities, payments, menu dates, communications or production state.

## Historical September 28 weekly-cycle navigation

Batch 12 was the September 26 delivery cycle. Its expired configuration remains in `../config/order-config.js` until the next menu is approved and published. The intended next delivery is Saturday, October 3, but the menu and cutoff are not yet approved.

| Question | Authority |
|---|---|
| What can customers order now? | Verify the live order page and `../config/order-config.js`; the checked-in configuration is still expired Batch 12 and is not authority for a new weekly menu |
| What is the public customer authority after publication? | `../config/order-config.js`, only after owner approval and live verification |
| What is the fresh-task handoff? | `active/HANDOFF_2026-10-29.md` |
| What governs menu selection? | Full recipe library plus current controlled recipe records under `standards/RECIPE_DATA_SOURCE_OF_TRUTH.md`; show the proposal for approval before publication |
| Are new menu messages or emails approved? | No. Determine recipients from live orders, conversation history, opt-outs and holds, then follow `plans/MESSAGE_APPROVAL_WORKFLOW_2026-09-08.md` |
| What governs payment status? | Live Orders, Payment Log and Accounts Receivable plus evidence under `standards/PAYMENT_RECONCILIATION.md` |
| What are the latest completed-cycle menu and nutrition records? | `active/BATCH_12_MENU_PROPOSAL_2026-09-21.md` and `nutrition/NEXT_MENU_NUTRITION_2026-09-26.md` |
| How are nutrition values reproduced? | `nutrition/calculate_next_menu.py` |
| What nutrition is generated for labels? | `nutrition/next-menu-label-data.js` |
| Are label values synchronized? | `nutrition/verify_next_menu_labels.py` |
| What are current planning direct packed costs? | `costing/NEXT_MENU_DRAFT_COST_AUDIT.md`, after verifying its batch identity |
| What may drive production or grocery quantities? | The owner-approved config plus a reviewed current-order lock, including confirmed custom orders |
| What is unresolved? | `active/HANDOFF_2026-10-27.md` and the top section of `active/CURRENT_STATUS.md` |
| What permanent controls apply? | `governance/OPERATING_RULES.md` |

Current and historical exact-dish photo coverage is tracked in `standards/MENU_PHOTO_COVERAGE.md`. Completing one rotation does not imply that the full recipe library has photos.

The August 10 premature four-email send remains an incident record. Batches 1 through 12 are historical for the new weekly cycle unless a specific controlled record is intentionally reused. Current operational detail is in `active/HANDOFF_2026-09-28.md`.

## Weekly Tools

- `cook-day-planner.html`: sync current orders, review counts, follow Prep Day and Cook & Pack phases, record recipe-specific observations, and pack by customer.
- `grocery-list.html`: use the same current orders and production recipes, subtract pantry inventory, round packages, and estimate checkout cost.
- `label-studio.html`: exact-count Avery 5168 four-up printing. Generate from locked actual orders only and pass the physical label gates before printing. Cross-batch preprinted labels are never reusable because dates, storage, ingredients, allergens, nutrition, and batch IDs can be stale. Talal, Duaa, and Rida remain excluded unless explicitly requested.
- `business-center.html`: review booked revenue, collections, direct costs, expenses, receivables, attribution, and outreach.

The Cook-Day Planner and Grocery Builder must remain on the same generated `production-data.js`. Do not manually patch quantities in one tool without changing the controlled recipe and regenerating both.

## Recipe And Label Controls

- `standards/PAYMENT_RECONCILIATION.md`: Gmail-to-Payment-Log evidence matching, ambiguity rules, and the non-blocking phone-review policy.
- `standards/RECIPE_DATA_SOURCE_OF_TRUTH.md`: permanent recipe hierarchy and kitchen-learning register.
- `standards/STANDARD_RECIPE_TEMPLATE.md`: required controlled-recipe format.
- `standards/MACRO_VERIFICATION_PROTOCOL.md`: calculation and approval rules.
- `recipes/`: dish-specific tests and corrections.
- `recipes/BATCH_6_OPEN_RECIPE_PILOTS_2026-08-10.md`: unapproved physical tests for the mini-apple Protein Box, Hot Pocket dough, strawberry dessert, house refrigerator pickles, Sweet Heat reconciliation, and the corrected single-size 12 oz Strawberry Protein Overnight Oats.
- `recipes/BOTTLED_PROTEIN_SHAKE_RND_2026-08-10.md`: calculator-backed Chocolate Peanut Butter and Strawberry Vanilla 12 oz formulas plus a matching tamper-evident bottle/cap, waterproof label, leak/cold-hold, regulatory, and margin test plan; following-batch R&D only and not approved for sale.
- `recipes/BOTTLED_PROTEIN_SHAKE_PILOT_RUN_2026-08-17.md`: exact one-bottle flavor test, current small-lot packaging cart, bottle/tamper-band/leak procedure, label-fit test, and launch gates for the physical shake pilot.
- `recipes/CUSTOM_LEBANESE_CHICKEN_FATTOUSH_PILOT.md`: paid Batch 7 five-meal custom chicken-breast pilot targeting at least 70 g protein below 500 calories. It is planner-only, not publicly orderable. Sumac is excluded from this production version; the first measured cook must lock chicken, salad, dressing, cost, and final nutrition yields.
- `recipes/NOUMAN_HIGH_PROTEIN_ROTATION_RND_2026-08-24.md`: the 96/4 `High-Protein Beef Kofta & Roasted Vegetables` build is approved for Batch 10 at six meals and the controlled label values recorded there. The smoky garlic chicken and conditional eye-of-round variants remain planning only.
- `LABEL_STUDIO_README.md`: label generation, review, and print calibration.
- `COOK_DAY_PLANNER_README.md`: order sync and production workflow.
- `GROCERY_LIST_README.md`: inventory subtraction, package rounding, and purchasing workflow.
- `plans/MEAL_PREP_COMPANY_FEATURE_BENCHMARK_2026-08-10.md`: competitor feature research and PRPD's prioritized Grab & Go, outreach, website, and modular-add-on opportunities.
- `plans/CUSTOMER_ORDER_PATTERN_AND_BUNDLE_ANALYSIS_2026-08-17.md`: privacy-safe live Batch 2-6 basket analysis and the evidence-backed 8-, 10-, and 14-meal shortcut pricing model.
- `plans/CUSTOMER_EXPERIENCE_BACKLOG_2026-08-17.md`: prioritized low-complexity retention improvements including repeat/favorites, delivery-status messages, meal ratings, extra-protein add-ons, Grab & Go bundles, and reheating/freezer clarity.
- `plans/MEAL_PREP_COMPETITOR_FEATURE_AUDIT_2026-08-17.md`: August 17 official-site review of 15 local halal, fitness, and general prepared-meal services, recurring market features, and PRPD's implement-now/test-next decisions.
- `relationships/README.md`: entry point for customers, testimonials, referrals, and partnerships, with a strict public/private records boundary.
- `relationships/creators/README.md`: controlled six-meal/two-dessert content-for-food program; no creator package leaves without written deliverables, posting window, disclosure, and rights terms.
- `relationships/creators/CREATOR_PROSPECT_SHORTLIST_2026-08-11.md`: public-source DFW creator discovery list, screening scorecard, and two-package pilot gate.
- `relationships/templates/CREATOR_CONTENT_EXCHANGE_TEMPLATE.md`: reusable unsigned creator agreement; signed copies remain private.
- `relationships/partnerships/zee-hamoda/README.md`: Zee pilot hub, current offer artifact, signature gate, deliverables, and private-record locations.
- `plans/DFW_POPUP_EVENT_PIPELINE_2026-08-11.md`: Epic Fit Fest application status, Muslim fitness/sports outreach, food-safety gates, and event economics.
- `active/DAILY_CLOSEOUT_2026-08-11.md`: August 11 completion record and the owner-visible Wednesday cutoff handoff.
- `active/SYSTEM_RELIABILITY_AUDIT_2026-08-12.md`: permanent reminder, costing, dashboard, schema, validation, and documentation controls from the August 12 full-system audit.
- `plans/ATHLETE_TESTIMONIAL_REFERRAL_PILOT_2026-08-10.md`: underlying athlete economics, customer testimonial compensation, referral rules, and outreach research.
- `relationships/testimonials/CUSTOMER_TESTIMONIAL_FILMING_GUIDE.md`: customer-facing $35 testimonial filming checklist, consent language, privacy controls, delivery requirements, and editing blueprint.

Current regeneration commands:

```powershell
python operations/nutrition/calculate_next_menu.py
python operations/nutrition/generate_next_menu_label_data.py
python operations/nutrition/verify_next_menu_labels.py
python operations/nutrition/generate_production_data.py
python operations/costing/calculate_next_menu_draft_costs.py
npm test
```

## Finance And Evidence

- `finance/PRPD_COSTING_SOURCE_OF_TRUTH.md`: controlled ingredient, packaging, and delivery cost assumptions.
- `records/finance/RECEIPT_REGISTER.md`: receipt evidence and missing-source tracker.
- `records/finance/weekly-closeouts/`: dated batch reconciliation records.
- `standards/WEEKLY_CLOSEOUT_TEMPLATE.md`: planned-versus-actual closeout format.
- `private-records/`: ignored local-only receipts, bank exports, and legal records.

Never commit customer contact data, bank statements, access tokens, private keys, or unredacted receipts. See `PRIVATE_RECORDS_POLICY.md`.

## Folder Roles

| Folder | Role |
|---|---|
| `active/` | Current status and active menu decisions |
| `standards/` | Reusable operating authority |
| `recipes/` | Dish-specific development and corrections |
| `nutrition/` | Calculators and generated nutrition/label/production data |
| `costing/` | Cost calculators, tests, and current reports |
| `records/` | Dated batch, grocery, receipt, and closeout history |
| `finance/` | Current costing and margin interpretation |
| `plans/` | Deferred or staged growth and automation work |
| `relationships/` | Privacy-safe customer, testimonial, referral, and partnership program hubs |
| `governance/` | Privacy, approval, and document-control rules |
| `source-documents/` | Non-sensitive historical references |
| `private-records/` | Git-ignored sensitive originals |
| `archive/` | Superseded implementation notes |

## Historical Boundary

Batch 1-12 menu, production and finance files remain valid historical records. They do not establish the next weekly menu. Menu publication does not authorize unreviewed communications, advertising changes, final groceries or label release. Those remain separately gated by owner approval, live review, current order lock and the applicable production controls.
