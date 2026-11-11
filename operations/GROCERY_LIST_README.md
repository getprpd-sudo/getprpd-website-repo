# PRPD Grocery Builder

**Batch 19 one-time complimentary cookies:** The Grocery Builder shows the scaled 18-cookie recipe in its own panel and includes all ingredients in the shared shopping requirements, package estimates, pantry subtraction and CSV. The 12-cookie Gmail formula is multiplied by 1.5; six purchased eggs cover three whole eggs and three extra yolks. Small teaspoon ingredients use approximate gram conversions for shopping only. This rule is gated to Batch 19 and grows to 24 cookies only if customer orders exceed 18.

**Current Batch 17, October 29, 2026:** Reviewed planner and actual Grocery Builder match at 98 portions, 19 cups, 73 label demand. Read [`active/HANDOFF_2026-10-29.md`](active/HANDOFF_2026-10-29.md) and current cook record. Current CSV `PRPD_Batch17_Grocery_List_2026-10-28.csv` is in `C:\Users\aazim\Documents\Codex\2026-10-26\okay-so-read-all-the-documents\outputs`. Priced checkout estimate $172.10 excludes bottled ranch, owner-added tortilla chips, tax and store changes; it is not an actual expense or complete quoted total.

**Owner state survives reload:** 52 stocked rows, partial inventory and manual buys retained. Package size/label/store choices now persist per batch; existing price sharing remains. Preserve black beans at estimated 241 g drained per standard can, 28 oz CRUSHED tomatoes, one-dozen eggs and one-pound red onion. Do not restore an old export wholesale and lose updated paprika/onion-powder stock. Containers already ordered: zero buys means ordered, not received. Wings require at least 44 individual split pieces and five 40 g ranch cups; estimated grams do not replace counting. Four persistence checks and actual save/reload passed. Older empty-pantry/package/batch defaults below are history.

**October 7, 2026 portion-control update:** Current boneless-thigh bowl recipes now carry the approved 160 g Lean and 210 g Bulk cooked targets. Grocery quantities reverse those targets through the measured October 7 yield of 430 g cooked from 625 g raw, then apply the reviewed kitchen plan's separate raw-protein reserve, normally 5%. At that reserve the exact planning pulls are about 244.19 g Lean and 320.49 g Bulk before shopping-row display rounding. The controlled 90/10 ground-beef baseline remains 210 g raw Lean and 300 g raw Bulk, or 220.5 g and 315 g with the normal 5% reserve. Dish-specific exceptions keep their own recipe quantities. Nouman's kofta remains actual 96/4 and appears in the normal Meat & Seafood section without being converted to or merged with 90/10.

The Builder does not store another copy of those serving rules. It compiles the active generated recipes on every sync. If the recipe payload or cooking methods do not match the configured batch, it now fails closed and produces no shopping rows. A regenerated recipe snapshot also invalidates an older reviewed list until the Cook-Day Planner reviews it again.

**October 7, 2026 Batch 14 loader repair:** Opening the desktop launcher regenerates the current recipe payload and stops instead of using stale data if generation fails. Grocery Builder waits for its saved state, then automatically syncs the current reviewed kitchen plan. The local server rejects a generated-recipe batch that does not match the effective menu. Before cutoff, the displayed cart is a planning estimate. Re-sync from the final reviewed and locked planner after cutoff, then enter physically verified pantry quantities before shopping.

**October 5, 2026 shared-run rebuild:** Grocery Builder now reads the planner's exact reviewed/locked order quantities, reserve settings and selected extras, and consumes its shared production engine. A changed source or snapshot blocks an actionable new list until planner review. Older locks are explicit planning previews. The compact interface groups shopping by aisle, supports search and partial pantry quantities, and hides allocation/price detail behind disclosures. Receipt-supported catalog prices are updated while uncertain package/cut assumptions remain estimates; saved pantry/manual price overrides were not changed. Read the [rebuild report](records/planner-rebuild-2026-10-05/SHARED_RUN_REBUILD.md), [receipt/cost audit](costing/BATCH_13_COST_RECONCILIATION_2026-10-05.md) and [current handoff](active/HANDOFF_2026-10-05.md). Actual consumption and margin remain unverified.

**October 4, 2026 Batch 13 follow-up:** The owner spent $171.65 at Walmart and $113.45 at Epic Market on October 1, $285.10 total, versus a $382.04 saved-stock cart estimate. Audit the $96.94 forecast gap without inventing shortages; incorporate item/package prices from verified receipts, actual home-stock use, unconsumed leftovers and the four planned internal spares that were **not cooked**. Purchased cash and recipe consumption are different. Owner wants this Builder driven by measured, versioned recipes in a more unified workflow. See [`active/HANDOFF_2026-10-04.md`](active/HANDOFF_2026-10-04.md). Older Batch 10 checkpoint below is historical.

Updated: September 8, 2026

The Grocery Builder converts the reviewed current-batch orders and controlled recipes into one consolidated shopping list. It is an internal localhost-only tool and is excluded from the public Vercel deployment.

Current Batch 10 checkpoint: the builder uses five orders and 50 items from the reviewed lock. It resolves 67 buy-list rows and no unresolved items. After the September 9 receipt and Walmart package-price audit, food consumed is estimated at $169.36 and packaging consumed at $24.55, for $193.91 of direct variable cost. The displayed $464.78 empty-pantry checkout buys whole packages with zero pantry items marked stocked, so it is a replacement-value control and not an approved purchase total. Enter only physically verified pantry stock before shopping.

## Open It

- Double-click `PRPD Grocery Builder` on the Windows desktop,
- run `open-grocery-list.bat` in the project root, or
- open `http://127.0.0.1:4173/operations/grocery-list.html` while the local operations server is running.

## Weekly Workflow

1. Review current orders, portion counts, food notes and optional extras in Cook-Day Planner, then select **Run editable kitchen plan**.
2. Select **Sync kitchen plan** in Grocery Builder. The list builds from the reviewed shared plan.
3. Confirm **Same kitchen plan** and its meal/cup/required-label counts. Resolve any changed-source or recipe warning in the planner before shopping.
4. Use **Review plan & settings** to change sauce/reserve/extra decisions in the planner, then run and sync again. There is no second independent grocery settings form.
5. Keep the temporary dry-rice controls at 15% allowance and 2.75x expected cooked yield until a complete PRPD batch records dry and cooked weights. These are estimates, not verified yields.
6. Use **Rebuild list** after a catalog change; inventory controls update purchase quantities without recompiling food demand.
7. Enter a partial on-hand weight or select **Have enough** for pantry items already verified. Stocked items remain available under **Show stocked items**.
8. Use the minus and plus controls only when the package count must differ from the calculated recommendation.
9. Correct a package price when a receipt or store listing is newer than the saved value.
10. Use **Export CSV** or **Print buy list** for the shopping trip.
11. After shopping, update confirmed prices in `finance/PRPD_COSTING_SOURCE_OF_TRUTH.md` and `grocery-catalog.js` when appropriate.

Pantry counts, manual purchase quantities and custom package choices are saved separately for each batch and delivery date. They do not carry into a newly rolled menu. Confirmed package-price corrections retain existing sharing; package identity/size is not shared globally. **Reset this batch** clears only the active batch's pantry and package-count decisions while preserving those shared price corrections.

State now uses the same recovery standard as the Cook-Day Planner: immediate browser storage, an atomically written batch-specific private JSON file, its previous `.bak` version, and manual **Export backup** / **Import backup** controls. The newest valid copy wins when the page opens. Private files live under `operations/private-data/grocery-builder/` and are excluded from Git.

## What It Includes

- all current Google Sheets orders accepted by the Cook-Day Planner;
- approved planner-only internal meals, including the three current Nouman custom builds;
- exact customer-meal recipe quantities;
- a default 5% pooled reserve on raw meat and poultry;
- a temporary 15% dry-rice planning allowance at 2.75x expected cooked yield after the Batch 2 shortage;
- all controlled recipe ingredients, formula-only seasonings, shared protein-seasoning ingredients, and dish-specific sauces;
- both weekly batch sauces;
- meal containers, dessert cups, physical sauce cups, paper bags, and labels;
- pantry subtraction with a reversible stocked-items view;
- package-count steppers and editable package prices;
- whole-package purchase rounding;
- separate estimated recipe-food cost and checkout totals, neither presented as measured consumption;
- pounds and ounces for normal shopping weights;
- conservative estimated counts for count-friendly produce alongside the controlling weight;
- grocery-store order: meat and seafood, produce, dairy and eggs, bread and tortillas, pantry and sauces, sweets and baking, then packaging;
- Walmart and Restaurant Depot comparison links, CSV export, and a printable buy list.

Customer names and contact details are not displayed in shopping rows or written into grocery inventory records. The shared cook-log order record is read privately to validate demand and snapshot identity.

## Historical Batch 8 Sauce Plan

The following Batch 8 sauce plan is historical and must not seed Batch 10 quantities:

- **PRPD Mustard BBQ:** one separate 40-gram net cup for each Beef Breakfast Skillet, Lemon Pepper Tilapia, and PRPD Protein Box, mixed at 28g sugar-free BBQ sauce + 10g yellow mustard + 2g apple cider vinegar; no salsa, jalapeno-yogurt dip, Tilapia white sauce, or bottled Carolina Gold is purchased for those dishes;
- **PRPD Sweet Heat:** one 45-gram net cup only for each Loaded Beef Cottage Pie;
- **Lemon Pepper Tilapia:** one controlled 40-gram house PRPD Mustard BBQ cup per ordered meal;
- **Strawberry Protein Pancakes and French Toast:** their exact syrup/topping components shown by the active recipes; and
- **Nouman custom chicken breast:** one separate 15-gram lemon-garlic dressing cup per active custom meal, without sumac in the current controlled build.

Every weekly sauce definition has its own explicit eligible-meal IDs; the engine does not divide customer cups evenly between sauces. Other dishes receive no duplicate weekly cup merely because they contain an incorporated sauce. Each active weekly sauce receives one QC cup. Filled leftovers are not subtracted unless they are the identical controlled recipe and remain within the approved food-safety window.

## Prices And Internet Search

The tool preserves confirmed PRPD receipt prices and labels estimates as planning or legacy values. It does not silently scrape and overwrite prices because retailer results vary by location, login state, stock, substitutions, and package size. Each row includes a fresh Walmart search link so the operator can verify the current local product and enter the current package price.

The two totals have different jobs:

- **Food used by this batch** values only the portion of each food package consumed by the generated production plan. It excludes packaging.
- **Cash checkout after pantry** assumes every unmarked item must be purchased as a complete package. It includes packaging and inventory left over after the batch.

Historical July 18 example: the builder reported approximately **$344.78 of food consumed**, **$43.41 of direct packaging consumed**, and **$665.89 at checkout with an empty pantry**. After entering partial confirmed inventory it reported approximately **$385.62**. This example is retained only to explain the distinction between consumed cost and whole-package checkout. It must not seed current prices or quantities.

Restaurant Depot's online pickup and delivery prices may be higher than warehouse prices. Compare the in-store unit price and package size before replacing a confirmed PRPD price. Bulk purchasing is appropriate only when the unit price is lower, the product will be used before quality declines, and storage capacity is available.

## Historical Batch 8 Controls

The bullets in this section document the former Batch 8 implementation. Current Batch 10 quantities and dish activation come from the approved config plus the reviewed `1ssz4b8` lock.

- The builder supports all 18 public Batch 8 dishes plus the three approved internal-only Nouman recipes and uses the same generated production data as the planner.
- Historical Sheet names ending in `Meal` are accepted as aliases for the Nouman builds, so those paid custom meals cannot disappear from grocery or production totals.
- Imported current-batch orders are the only activation source. An inactive historical recipe cannot generate a grocery requirement.
- A physical disposable food-prep glove box is tracked separately from the per-item cleaning and consumables allowance.
- Customer labels are calculated only after current orders sync; Rida, Talal, and Nouman remain excluded from customer-label printing while their food stays in production and pack-out.
- Physical sauce cups include the active PRPD Mustard BBQ and Sweet Heat customer cups, one QC cup per weekly sauce, and exact recipe-specific cups. Already-sauced dishes do not receive a redundant cup.
- The active generated Batch 8 requirements use one red-onion SKU, one shared breakfast bread SKU, standard small tortillas for Pinwheels and Lean Enchilada Bake, and large tortillas only for Bulk Enchilada Bake. They contain no Philadelphia no-bake filling, sourdough, fajita tortillas, generic onion, prepared salsa, harissa, or jalapeno.
- Vanilla and chocolate protein powders remain separate grocery lines. Chocolate powder on hand covers only chocolate builds; it does not silently substitute for vanilla breakfast recipes.
- Formula-only seasonings and every published recipe ingredient must appear as shopping requirements before pantry subtraction.
- Cooking-lane, Prep-Day/Cook-Day, side, topping, and component-map metadata never creates a second grocery pull. The Grocery Builder continues to total each controlled production ingredient once; the planner uses the component map only to route that same quantity through preparation and assembly.

## Restaurant-Style Purchasing Method

The builder follows the standard small foodservice purchasing loop:

1. confirmed customer orders determine production quantities;
2. controlled recipes convert production into ingredient requirements;
3. the physical pantry count is subtracted;
4. shortages are rounded to real vendor packages;
5. receipts update the price ledger;
6. repeated weekly usage becomes the basis for future par levels and safety stock.

Do not set permanent bulk pars from a single batch. Use several weeks of actual usage, storage capacity, vendor lead time, and waste records before increasing standing inventory.

## Shared Planner Logic

The Grocery Builder and Cook-Day Planner import the same active `nutrition/production-data.js`, `cook-day-methods.js`, and `cook-day-core.js` aggregation functions. The planner's production quantities and the builder's ingredient requirements therefore come from one recipe calculation path. This includes formula-only prep ingredients, shared neutral/Desi seasonings, weekly sauces, and recipe-specific customer cups. The Grocery Builder adds only pantry subtraction, package rounding, packaging, vendor prices, and shopping presentation.

Operational prep quantities may be larger than nutrition-label quantities when a marinade or sauce is only partly retained by the finished food. The Grocery Builder uses `groceryOverrides` from `cook-day-methods.js` for those cases, while nutrition labels continue using the retained amounts in `production-data.js`. This currently applies to chicken biryani yogurt, butter-chicken yogurt, and the peri-peri marinade.

Receipt-backed catalog values were refreshed on July 27 for the July 23 broccoli florets, Fuji apples, and garlic powder purchases. Receipt lines whose package size is not identifiable remain planning values rather than being treated as false precision.

## Source Files

- `grocery-list.html` - interface and print layout.
- `grocery-list-app.js` - live sync, pantry state, rendering, CSV, and interaction logic.
- `grocery-list-core.js` - requirement merging, purchase rounding, packaging, totals, and CSV calculations.
- `grocery-catalog.js` - package sizes, prices, stores, search terms, and confidence labels.
- `grocery-state-store.js` - validated private-file persistence, atomic replacement, and `.bak` recovery.
- `cook-day-core.js` - reviewed order aggregation, production extras, recipe totals, and weekly sauce scaling.
- `cook-day-methods.js` - controlled weekly sauce formulas.
- `tests/grocery-list.test.js` - calculation and packaging regression tests.
- `PRPD Grocery Builder.lnk` on the Windows desktop - one-click launcher.

## Known Operator Inputs

The generated list is only as current as the reviewed orders, controlled recipe data, pantry quantities, and package prices. The operator must still verify:

- what is physically in the kitchen;
- current package availability and substitutions;
- receipt prices for new products;
- whether the sauce pilot requires a recorded adjustment;
- final produce quality and usable yield;
- produce size: estimated counts are rounded-up shopping guidance, while the displayed recipe weight remains authoritative;
- pantry presence for genuinely unresolved or product-dependent inputs such as strong coffee and any future pilot-only seasoning. Controlled Batch 4 black pepper, garam masala, turmeric, Italian seasoning, chili flakes, garlic powder, and ground coriander are already included in generated quantities.
