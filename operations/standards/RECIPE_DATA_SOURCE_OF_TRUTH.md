# PRPD Recipe and Nutrition Data - Source of Truth

## October 20, 2026 current sauce authority

The controlling current formulas for PRPD Sweet Heat and Garlic Herb Yogurt are in [`CURRENT_SAUCE_RECIPE_STANDARD_2026-10-20.md`](../active/CURRENT_SAUCE_RECIPE_STANDARD_2026-10-20.md). Both use a **40 g net customer fill**. Sweet Heat is owner-tested and flavor-approved; its next run still needs finished-bowl recovery measurement. Garlic Herb Yogurt has a locked replacement formula after the first physical trial was rejected as too lemony and watery; its finished recovery, cup count and refrigerated hold remain unmeasured. Any 45 g references later in this file or in Batch 15-and-earlier records are historical batch evidence, not current production authority.

## October 7, 2026 component-meal portion standard

The owner physically approved a reusable component-meal blueprint after plating one container first as Lean and then expanding the same container to Bulk. This standard controls future boneless chicken-thigh bowls and crumbled 90/10 ground-beef component meals. It is not permission to overwrite the ratios of incorporated pasta, casseroles, tacos, wraps, meatballs, kofta, steak, bone-in chicken, seafood or explicitly ordered custom proteins.

| Component | Lean | Bulk |
|---|---:|---:|
| Boneless skinless chicken thigh, cooked before recipe sauce | 160 g | 210 g |
| Ground 90/10 beef, raw recipe input | 210 g | 300 g |
| Ground-beef finished seasoned-component working target | 175 g | 250 g |
| Cooked starch baseline | 120 g | 160 g |
| Basmati/white rice dry input pending measured cooker yield | 45 g | 60 g |
| Vegetable baseline | 75 g | 100 g |

Rules:

- Sauce and recipe-specific toppings remain measured separately. Chicken is weighed before sauce. Incorporated sauce is included in the finished meal macros; separately sealed cups remain excluded only from menu-card macros under the September 14 rule.
- The chicken test produced 430 g cooked before glaze from 625 g raw, a one-run 68.8% yield. The plated 160 g / 210 g targets are approved; raw purchasing must reverse the current verified rolling yield and then apply the existing 5% pooled raw-protein reserve. A single run does not freeze a permanent yield.
- The beef visual test used drained 80/20 and produced 422 g cooked beef, then 570 g complete finished Boy Kibble mixture. The owner approved the 175 g Lean / 250 g Bulk presentation. This is visual evidence only. Customer recipes, groceries, costs and nutrition continue to use actual 90/10, with 210 g Lean / 300 g Bulk raw recipe inputs, until a measured 90/10 run replaces the provisional finished-yield bridge.
- Keep cooked starch at 120 g Lean / 160 g Bulk for now. The tested Lean beef-and-rice bowl already looked filling before its vegetables and cheese were added. A future 140 g / 180 g cooked-rice choice would add about 27 calories and 6 g carbohydrate per meal, but it is not approved.
- Direct chicken and ground-beef component meals inherit this blueprint. Translated builds may use another starch or vegetable of comparable role, but their own ingredient grams and macros must be calculated. True format exceptions preserve their tested recipe structure and are audited explicitly instead of being silently forced into bowl weights.
- Nouman's beef remains actual 96/4 under the October 5 rule. Grouping it under the normal Ground beef work section never changes its ingredient, nutrition, purchasing or label identity.
- Any approved portion change must regenerate recipes, nutrition, customer menu values, labels, costs, production data, Cook-Day Planner quantities, Grocery Builder quantities and regression tests together.

## October 5, 2026 current authority

Nouman's actual beef is always **96/4**, including recipe ingredients, nutrition, purchasing identity and label statements. It belongs in the ordinary Ground beef work section without an extra tab or repeated explanation. Production grouping is presentation metadata, never permission to substitute a 90/10 nutrient profile. The Batch 13 kofta calculator was corrected from `beef_pan(330)` to `beef_96_raw` at 330 g. Old printed labels are retained as historical evidence, not silently rewritten.

The [whole-system audit](../active/RECIPE_SYSTEM_AUDIT_2026-10-05.md) covers 63 structured recipes / 104 tier builds, the 15 uncontrolled historical names and other document-only or unregistered builds. The [kitchen workbook](../active/KITCHEN_CALIBRATION_WORKBOOK_2026-10-05.md) starts with measured shared components and then tests meal-specific exceptions. Input mass is not finished net weight. Review proofs now carry unmeasured weight status and are not production labels. Next-menu selection/publication and Hot Pocket development are deferred by the owner.

## October 4, 2026 physical-validation correction

The owner reports that most current recipe quantities have not been validated by weighed cooking; cook-day rice/chicken and plating were often adjusted by eye. Calculated amounts are planning estimates, not physical yield or final package-weight proof. Run controlled raw-to-cooked/thawed-yield, timing, portion, taste, container-fill and reheat tests before promoting changed recipes/labels; record versioned owner approval. The current Batch 13 Cheeseburger Hot Pocket dough/oven workflow is **retired as-is** after a slow, tough physical result, although its dough was acceptable. Historical formula entries remain evidence only. Four planned internal Lean spares in Batch 13 were not cooked; do not use them as observed yields or consumed cost. See the [October 4 handoff](../active/HANDOFF_2026-10-04.md).

Updated: September 9, 2026

## September 30 current-batch correction

Later September 30 owner decision: Sweet Heat is assigned exactly to the eight dishes named in [the Batch 13 matrix](../active/BATCH_13_SAUCE_ASSIGNMENTS_2026-09-30.md), with one 45 g cup per eligible meal. Boy Kibble replaces its three historical condiment cups. The Lebanese chicken keeps lemon-garlic salad dressing as an additional cup. Salmon uses 40 g dry rice and extra same-formula Alfredo raw input for a separate cup; finished yield and new macros are pending. The meal-specific sauce matrix supersedes the earlier pending-assignment statement in the paragraph below.

Batch 13 latest owner authority is [BATCH_13_OWNER_CORRECTIONS_2026-09-30.md](../active/BATCH_13_OWNER_CORRECTIONS_2026-09-30.md). The owner reconfirmed Boy Kibble is **beef**, historically and currently. The exact `halal_boy` beef source is restored; the intervening chicken interpretation is superseded and must not be carried forward. Sauce-cup assignments and finished weights remain confirmation gates, not a protein-identity question. Sweet Heat is the owner's weekly sauce choice, with exact dish assignments pending. Nouman's mild 96/4 kofta formula is owner-approved, with physical QC/yield checks unrecorded. Historical Batch 10 and older sections below remain evidence for those dated batches only.

## September 14 menu-nutrition scope

- Customer menu macros describe the composed meal and exclude optional sauces, dressings, and syrups supplied in separate sealed cups.
- A sauce mixed into, cooked into, spread inside, or otherwise inseparable from the dish remains in customer menu macros.
- Every supplied side cup remains in the controlled recipe, grocery requirements, production quantities, packaging, costing, ingredients, allergens, and complete-package nutrition record. The order page discloses the menu-macro scope.
- Each separate component must be tagged explicitly in the recipe data. Ingredient-name guessing is prohibited because the same sauce can be incorporated in one dish and packed separately in another.

## September 16 Chicken Enchilada Bake decision

- Sartaj reported that the bean-containing Enchilada Bake differed from the version they expected and ordered. The owner approved removing beans from both Lean and Bulk builds for future production.
- The controlled recipe retains chicken, high-fiber tortillas, corn, red enchilada sauce, mozzarella, and red onion. The future Grocery Builder and Cook-Day Planner must exclude beans from this dish. Cannellini beans remain valid for unrelated recipes, including the Caprese Protein Pasta Box.
- Historical Batch 8 and Batch 10 records describe what was specified then and are not retroactively changed. The revised bean-free meal has calculated Lean/Bulk menu values of 565/830 calories, 61/92 g protein, and 34/61 g fiber. These are model estimates; physical yields and package panels remain verification gates.

## Batch 10 Nouman High-Protein Beef Kofta & Roasted Vegetables Control

- Nouman's confirmed Batch 10 order is six High-Protein Beef Kofta & Roasted Vegetables meals and no chicken meals. The customer-facing name does not replace the required 96/4 beef specification.
- Each complete meal uses 330 g raw 96/4 beef plus 16.5 g Shan Seekh Kabab mix. Divide the complete 346.5 g mixture into five equal logs (nominally 69.3 g each). Each log contains 66 g beef; 66 g is not the finished mixture weight. Weigh the actual mixed batch before dividing.
- The controlled complete-meal estimate is 500 calories, approximately 75 g protein, 18 g carbohydrate, 5 g fiber, and 15 g fat. The purchased 96/4 package panel and actual cooked yield remain the final accuracy checks.
- Per meal, retain the existing 150 g zucchini, 100 g green bell pepper, 50 g red onion, garlic, parsley, cumin, coriander, paprika, black pepper, and salt. Do not add oil.
- For six meals, the exact recipe pull is 1,980 g raw beef and 30 kofta. The Grocery Builder adds the separate 5% raw-protein purchasing reserve; it does not enlarge customer portions.
- Current price remains $15.99 per meal, with delivery calculated separately.
- Nouman's six meals are now an assigned saved-customer order in the planner and grocery builder. Per-batch activation is saved in the cook record; future batches start off. A matching synced order takes priority and suppresses the saved-plan duplicate. The live Sheet itself is not rewritten by this feature.
- Actual 96/4 beef is required for these macros. Draining 90/10 is not proof of nutritional equivalence. The 96/4 grocery unit cost is provisional until the matching receipt/package is confirmed.

## September 8 kitchen audit

See `../records/audits/planner-2026-09-08/SHAN_AND_CUSTOMER_FOLLOWUP.md`. The primary Kitchen Guide is station-based with preview separate from final lock. Shan standard Biryani and Butter Chicken powder doses follow the manufacturer's 50g/kg meat reference, adapted to PRPD portions. All measured marinade is cooked and counted. Biryani uses 30g yogurt per meal, without the unmeasured scrape-off assumption. The older weekly sections below are historical references, not the current Batch 10 menu.

## Purpose

This file is the handoff entry point for recipes, portions, nutrition calculations, ingredient costs, and future labels. Read it before changing menu macros or printing labels. Conversation history is not an approved data source.

The current generated Batch 10 recipe library contains 21 dishes and 33 tier builds, including controlled planner-only recipes. Exact production quantities come from the reviewed current-order lock, including enabled saved-customer selections. The reconciled packet is locked at five orders, 50 items, 13 dishes and 19 dish/tier builds with order signature `1ssz4b8` and recipe signature `16j1uvd`, schema `production-content-v2`. Recipes that need a purchased package, yield, storage or reheat measurement remain marked accordingly; owner approval and a clean software check do not waive those physical controls.

## Weekly Menu Authority Map

| Menu | Delivery | Dishes | Controlled tier builds | Nutrition authority | Status |
|---|---|---:|---:|---|---|
| Current Batch 10 menu | September 12, 2026 | 18 public | 33 including planner-only builds | `../nutrition/NEXT_MENU_NUTRITION_2026-09-12.md` generated by `../nutrition/calculate_next_menu.py` | Published; production packet requires current-order comparison and relock |
| Previous Batch 9 menu | September 5, 2026 | Historical | Historical | `../nutrition/NEXT_MENU_NUTRITION_2026-09-05.md` and `../records/batches/BATCH_9_CLOSEOUT_REVIEW_2026-09-08.md` | Retained as history; ordering window closed |

Batch 10 has 18 public menu dishes. Controlled planner-only recipes bring the generated library checkpoint to 21 dishes and 33 tier builds.

The historical library remains separate and contains 48 dish concepts. A historical-library entry is not automatically a current recipe, verified nutrition record, label, or sellable menu item.

The public `config/order-config.js` is the approved customer-menu authority while Batch 10 ordering is open. Recipe, nutrition, label, production, Cook-Day Planner, Grocery Builder, costing and tests must be regenerated together after any approved ingredient, name, portion or nutrition-label change.

## August 29 Approved Menu Notes

- The complete approved selection and photo status are recorded in `../active/NEXT_MENU_DRAFT_2026-08-29.md`.
- High-Protein Beef Lasagna uses the controlled drained ground-beef, PRPD house tomato sauce made from canned tomatoes and tomato paste, ricotta, mozzarella, Parmesan, and oven-ready pasta formula. Complete the home test and purchased-package verification before production labels are printed.
- Beef Breakfast Skillet has no plated salsa. Beef Breakfast Skillet, Lemon Pepper Tilapia, and PRPD Protein Box each receive one separate 40g house PRPD Mustard BBQ sauce cup made from 28g sugar-free BBQ sauce, 10g yellow mustard, and 2g apple cider vinegar. The former bottled Carolina Gold and Tilapia white sauce are retired.
- Sweet Heat is 45g net and belongs only with Loaded Beef Cottage Pie in Batch 8. Weekly sauces are assigned by explicit eligible-meal IDs, so a sauce cannot be divided across unrelated dishes.
- Strawberry Cheesecake Protein Pancakes use reduced-fat cream cheese rather than Philadelphia no-bake filling. Chicken Shakshuka and French Toast share one controlled bread SKU. Buffalo Chicken Pinwheels and Lean Chicken Enchilada Bake share the standard 70-calorie tortilla; only Bulk Enchilada Bake uses the large tortilla.
- Red onion is the sole active Batch 8 onion SKU. Current protein-powder requirements remain flavor-specific: vanilla for the breakfast builds and chocolate for the brownie.
- The active generated recipe set contains no Philadelphia no-bake filling, sourdough, fajita tortilla, generic onion, prepared salsa, harissa, or jalapeno. Historical library formulas may retain those ingredients but cannot activate without a future approved menu change and regeneration.
- The full formula-to-method audit split aggregated component ingredients in Pancakes, Breakfast Skillet, Chicken Parmesan, Tilapia, Cottage Pie, and the custom Lebanese Chicken recipe. Current coverage validation fails if one aggregate ingredient is assigned to multiple Prep Day cards without an explicit component formula.
- Loaded Beef Cottage Pie uses mash as the individual container base with beef-and-vegetable filling over it, then mozzarella and cilantro. It is not assembled or baked as a casserole.
- Public menu cards use only exact approved dish photos; the intentional PRPD placeholder remains for 13 dishes until Batch 8 photography.

## August 22 Historical Menu Notes

- The complete approved selection and photo status are recorded in `../active/NEXT_MENU_DRAFT_2026-08-22.md`.
- Cajun Garlic Salmon uses wild pink salmon, lemon-cilantro quinoa, and roasted green beans. Southwest Beef Taco Bowl uses cilantro-lime rice. Both controlled recipes contain 3 g cilantro in Lean and 4 g in Bulk; these herbs must not be omitted from groceries or labels. The salmon is roasted rather than marketed as blackened. The future tilapia recipe is named Lemon Pepper Tilapia and is not part of Batch 7.
- Butter Chicken remains broth-free. Chicken Caesar Crunch Box keeps dressing and croutons separate.
- Sweet Heat is 45g net and belongs only with the Beef Bacon Breakfast Sandwich and Power Bowl in Batch 7.
- Public menu cards use only an exact approved dish photo; an intentional PRPD placeholder is used when no exact photo exists.

## August 15 Approved Menu Notes

- The complete approved selection and sauce matrix are recorded in `../active/NEXT_MENU_DRAFT_2026-08-15.md`.
- Cheeseburger Hot Pockets and the former Strawberry Cheesecake cup remain excluded. The Beef Bacon Breakfast Sandwich and Protein Box returned under their current controlled builds.
- Sweet Heat is 45g net and belongs only with the Beef Bacon Breakfast Sandwich and Loaded Beef Cottage Pie. Its recipe grams, calories, egg allergen, production data, grocery quantities, cups, and costing are synchronized.
- The Mission Carb Balance Fajita tortilla is controlled from the current eight-count package at 45 calories, 4g protein, 12g carbohydrate, 11g fiber, 2g fat, and 220mg sodium per 28g tortilla. It is exclusive to the Snack Wrap, which changed from one to two tortillas on August 11. The Grilled Cheese Breakfast Burrito uses two standard medium tortillas for Lean and three standard medium tortillas for Bulk as of the owner-approved October 21 change; the meal no longer uses large tortillas. Breakfast Quesadilla retains its separate white-corn street-tortilla build.
- The current Snack Wrap is two tortillas per order and calculates to 325 calories, 41g protein, 29g carbohydrate, 23g fiber, and 13g fat. Its $7.99 price is retained for this ordering window; direct food and packaging cost is provisionally $2.75, or 34.4%, before labor, delivery, and overhead.
- See `../records/batches/BATCH_6_PREMATURE_PUBLICATION_INCIDENT_2026-08-10.md` only for the earlier premature-publication incident; it does not override the later explicit approval.

## Source Priority

1. A dated kitchen result recorded in an active recipe file under `operations/recipes/`.
2. A current product Nutrition Facts panel photographed or transcribed by PRPD.
3. The archived recipe and ingredient-price source documents listed below.
4. An appropriate USDA FoodData Central record, with raw/cooked state recorded.
5. A historical PRPD estimate, clearly marked as a working estimate.

Never replace a confirmed kitchen result with an older PDF value merely because the PDF looks more complete.

## Permanent Mashed-Potato Rule

- Every PRPD dish described or plated with mashed potatoes uses the owner-selected packaged unflavored instant mashed potatoes. Fresh raw potatoes are reserved for roasted, baked, chopped, hash-style, or whole-potato components.
- A mashed-potato recipe must model the exact package preparation inputs, including dry flakes, water, milk, butter, and salt, plus any measured PRPD add-ins. It may not use a generic raw-potato nutrition or grocery line as a substitute.
- The Grocery Builder must show dry instant-potato flakes for mash and fresh potatoes only for non-mash uses. The Cook-Day Planner must place all packaged mash in its own consolidated Prep Day wave and must never tell the operator to boil fresh potatoes for mash.
- Labels must declare the packaged potato ingredient and its sub-ingredients from the current physical package. If the brand, package directions, milk, butter, salt, or add-ins change, regenerate nutrition, allergens, costs, production data, and labels before printing.
- The current owner-selected product is **Idahoan Original mashed potatoes**, unflavored flakes, prepared to the recorded package ratio. The physical package remains authoritative if its directions or ingredient statement change. Do not substitute Betty Crocker or a flavored Idahoan pouch without regenerating nutrition, allergens, costs, groceries, production data and labels.

## August 8 Batch 5 Kitchen Results

The complete post-delivery record is `../records/batches/BATCH_5_PRODUCTION_NOTES_2026-08-10.md`.

- Batch 5 first suggested a roughly 40 g cup from ingredient-total arithmetic. The owner later confirmed that the cup and lid were tared and selected **45 g net** as the Batch 6 control.
- Current Sweet Heat uses the measured Batch 5 direction of 250:300:300:170 light mayonnaise:ketchup:honey:sriracha by weight. The next full run still records exact finished yield and bowl loss for process improvement.
- The owner selected Sweet Heat to replace the Beef Bacon Breakfast Sandwich's retired maple-Dijon treatment. The approved Batch 6 recipients are only the Beef Bacon Breakfast Sandwich and Loaded Beef Cottage Pie. Power Bowl, Steak, and Hot Pockets are not on the Batch 6 menu.
- Historical Batch 6 control: the current 45 g cup was included in combined package nutrition, costing, production quantities, packaging counts, and the egg allergen declaration. Under the September 14 menu-display rule above, a separately sealed cup is excluded only from customer menu macros while remaining in the complete-package record. White sauce, salsa, syrup, glaze, BBQ sauce, street-corn finish, dessert topping, and incorporated wrap sauces remain recipe-specific and are never duplicated automatically.
- The pancake production method currently undercounts packaging: strawberry topping/compote and syrup require two component cups per order.
- The Hot Pocket dough needed materially more flour, but the owner recollection is not precise enough to change nutrition. The dish is quarantined pending a measured ten-pocket hydration test using 480 g flour and 360 g Greek yogurt to start, with up to 50 g yogurt added in 10 g increments only as needed and all incorporated yogurt/bench flour weighed.
- The seven-cup dessert run exposed a 1.5-cup crust shortage. The next Biscoff crust starts at 1.273x the applicable prior batch quantity and must be locked in actual grams per cup. Do not transfer one exact crust formula between the currently different Strawberry and Biscoff builds. Biscoff also changes nutrition and adds soy to the allergen statement.
- The current Strawberry Cheesecake is retired from the next public menu pending a thicker or replacement strawberry dessert test.
- The Protein Box's full apple did not fit. Batch 5 used cherry tomatoes; a small whole apple or a measured savory tomato build must be selected and recalculated before reuse.
- The owner rated Batch 5 the strongest operational batch so far. Preserve the grouped protein block, concurrent equipment lanes, bulk starch/egg work, and customer-by-customer pack-out.

## July 30 Batch 4 Operational Controls

- The compatible neutral chicken seasoning base uses 6.75 g garlic powder per kilogram of assigned raw chicken. This is based on the approximately 32 g actually used in Batch 4; the prior 18.9 g generated amount was too low.
- Chicken Biryani and Butter Chicken share one measured dry Desi base, then split into exact labeled recipe weights before their separate wet marinades and finishes are added.
- Meatball Arrabbiata uses exact dry-seasoning quantities. For nine Lean orders, the controlled batch uses 5.94 g garlic powder, 4.5 g Italian seasoning, and 2.97 g black pepper.
- The Batch 4 seekh mixture uses 12 g finely chopped fresh coriander. This replaces the unmeasured coriander instruction.
- All customer beef cooks Friday. Thursday preparation is limited to raw portion kits, mixtures, and formed pieces unless a dated cook-ahead exception and cooling log are approved.
- Grocery Builder totals include formula-only ingredients and shared-seasoning ingredients. Mascarpone and breadcrumbs therefore cannot disappear from shopping output when their recipes are active.
- Current Batch 4 peri-peri does not contain bell pepper. A red-bell-pepper and vinegar variant is a next-batch controlled pilot, not a silent change to the already-marinated current batch.
- `Measure before scaling` is not an approved formula. Where a house value is still unresolved, the planner must say `Recipe decision still required` until a pilot is measured and accepted.

## Archived Source Documents

These copies are stored inside the website project so they are not lost if a download, Google Drive connection, or chat history becomes unavailable.

| File | Source date | SHA-256 |
|---|---|---|
| `../source-documents/reference/PRPD_RECIPES_SOURCE_2026-07-13.pdf` | July 13, 2026 | `B592AC15C58DD6E18B77236CF09ADA848B240FBE2B17187985DFD1023A978A14` |
| `../source-documents/reference/PRPD_INGREDIENT_PRICES_SOURCE_2026-07-14.pdf` | July 14, 2026 | `48D199BFF18FE8A014472F6A8EA165462325774C9D81D38416CC0F2EA18C2DE9` |

Related working records:

- `PRPD_RECIPE_MASTER.docx`: local Word working master.
- `FULL_RECIPE_LIBRARY_INDEX.md`: inventory of all historical recipes.
- `../active/ACTIVE_MENU_RECIPE_AUDIT.md`: status of this week's live dishes.
- `../active/CURRENT_MENU_COOK_RECORD.md`: lightweight cook-day capture sheet.
- `MACRO_VERIFICATION_PROTOCOL.md`: calculation and approval rules.
- `../active/CURRENT_MENU_TASTE_TESTS.md`: this week's test formulas and results.
- `WEEKLY_SIDE_SYSTEM.md`: shared side plan.
- `../nutrition/ACTIVE_MENU_NUTRITION_AUDIT_2026-07-14.md`: historical Batch 2 ingredient-by-ingredient audit for its 15 dishes.
- `../nutrition/calculate_active_menu.py`: reproducible calculator that generates the active-menu audit.
- `../nutrition/test_active_menu.py`: validation tests for yields, tier scaling, complete nutrient fields, current products, and calorie/protein ranges.
- `../nutrition/NEXT_MENU_NUTRITION_2026-08-22.md`: controlled Batch 7 recipes and recalculated macros.
- `../nutrition/calculate_next_menu.py`: reproducible Batch 7 calculator.
- `../nutrition/test_next_menu.py`: validation tests for menu shape, tier scaling, and explicit protein-powder grams.
- `../nutrition/generate_label_data.py` and `../nutrition/label-data.js`: historical active-menu generator/output retained for reference; Label Studio does not fall back to them.
- `../nutrition/generate_next_menu_label_data.py`: reads the live order configuration and generates the exact current-batch Label Studio dataset from the controlled recipes.
- `../nutrition/next-menu-label-data.js`: sole generated dataset loaded by the current Label Studio.
- `../nutrition/verify_next_menu_labels.py`: rebuilds and compares the complete saved label payload, including dates, IDs, tiers, ingredients, allergens, nutrition, weights, storage, and handling.
- `../recipes/LOTUS_BISCOFF_CHEESECAKE_DRAFT.md`: controlled 395-calorie/40g-protein first-test Biscoff cup.
- `../nutrition/INGREDIENT_LABEL_AND_MEASUREMENT_CHECKLIST.md`: accepted product assumptions and optional cook-day accuracy upgrades.
- `../nutrition/PRPD_ACTIVE_MENU_NUTRITION_AUDIT.docx`: formatted operator copy of the complete audit for review, printing, or Google Docs import.

## July 14 Independent Nutrition Audit

The live website values were not accepted as source data. Every active meal was rebuilt from recorded ingredient quantities using current package labels or manufacturer data when known, USDA FoodData Central for whole foods, and explicitly marked estimates where a product or measurement is missing.

Important findings:

- French Toast calories are close to the website, but the supported protein is about 34g Lean and 45g Bulk rather than 40g/52g.
- Halal Cart and Loaded Buffalo calories are reasonably close, but their website protein values are materially overstated under the recorded raw-to-cooked chicken yields.
- Beef Seekh Shawarma must replace the inherited rice-dish values. The revised builds are about 575 calories/44g protein Lean and 770 calories/56g protein Bulk.
- Meatball Arrabbiata now uses 165g raw beef plus 65g dry protein pasta Lean, and 220g raw beef plus 76g dry pasta Bulk. Working totals are about 640/63 Lean and 775/77 Bulk.
- Chocolate Oreo Mousse uses the confirmed 19.5g Premier Protein portion and calculates to about 292 calories and 38g protein per cup.
- High Protein Tiramisu's July 18 five-cup formula passed taste and yield after using 225g mascarpone and a 195g blended cottage-cheese base. As of October 12, `../nutrition/batch10_recipes.py::tiramisu` uses one-fifth of that successful batch as the controlled calculation source. The older three-cup test is historical. Coffee pickup, finished cup weight, exact mascarpone and ladyfinger panels, and refrigerated hold still block final label release.
- Butter Chicken, Peri Peri, Boy Kibble, and Tiramisu retain recipe-status cautions where taste, yield, storage, or portion approval is still pending. Oreo Mousse is taste approved with its 19.5g protein-powder portion locked. Their label nutrient fields are populated as documented calculated estimates.

The calculation model now includes standardized salt estimates and all required label nutrients: calories, total fat, saturated fat, trans fat, cholesterol, sodium, carbohydrates, fiber, sugars, added sugars, protein, vitamin D, calcium, iron, and potassium. FDA-style display rounding is applied in the label studio. These are practical calculated estimates, not laboratory analyses.

## Status Meanings

- **Historical estimate:** appears in an old source or on the website but is not supported by the current build.
- **Draft:** ingredients or portions are proposed but not fully tested.
- **Fresh taste approved:** tasted successfully when freshly made; storage/reheat or final portion data may still be pending.
- **Current recipe:** ingredients, tier portions, and working calories/protein are recorded for the version being sold.
- **Label ready:** current recipe plus complete ingredients, sub-ingredients, allergens, net weight, and required nutrition inputs are recorded.

No active meal is automatically Label Ready merely because calories and protein appear on the order page.

## July 14 Kitchen Results

### Shared Cooking-Fat Control

- PRPD generally cooks with spray oil rather than pouring oil directly into the pan.
- Spray oil is not calorie-free when enough is used; its retained amount has not yet been measured.
- On the next production run, weigh the spray can before and after each recipe batch. Record the difference as grams used, then divide by the number of finished portions. This replaces the calculator's temporary retained-oil assumptions.
- The same method applies to any butter or liquid oil added to a batch: record grams added, finished batch yield, and portions produced.

### French Toast

Status: Fresh taste approved; calculated nutrition estimate complete. Refrigerated reheat check remains useful.

Test custard used:

- 1 large whole egg
- 75g egg whites
- 75g cottage cheese
- 40g milk
- 8.7g vanilla protein powder
- 6g brown sugar
- 2.5g vanilla extract
- 1.3g cinnamon
- Pinch of fine salt
- No butter; pan was coated with oil spray, amount not measured

Result:

- Tasted excellent fresh but needed more sweetness.
- Produced four fully coated slices plus one partially coated fifth slice.
- Treat the controlled yield as four fully coated slices.
- Next custard test uses 12g brown sugar; all other custard ingredients remain unchanged.
- Great Value sugar-free maple syrup is modeled as a 30g side cup for both tiers.
- Planned finished builds remain 3 slices Lean and 4 slices Bulk with 50g strawberries, 40g banana, and 10g whipped cream unless the final packing test changes them.

Bread Nutrition Facts, per 1 slice (32g):

- Calories: 80
- Total fat: 1g
- Saturated fat: 0g
- Trans fat: 0g
- Cholesterol: 0mg
- Sodium: 230mg
- Total carbohydrate: 15g
- Dietary fiber: 1g
- Total sugars: less than 1g
- Includes added sugars: less than 1g
- Protein: 3g

The working bread record is D'Italiano using the supplied 80-calorie-per-slice panel.

Detailed file: `../recipes/FRENCH_TOAST_TASTE_TEST.md`.

### Beef Seekh Kabab Shawarma

Status: Fresh taste and container presentation approved; calculated nutrition estimate complete. Cooked yield, finished weight, and exact sauce/pickle grams remain useful accuracy upgrades.

Confirmed construction:

- Beef: 90/10 ground beef seekh mixture.
- Lean: one full shawarma using 170g raw seekh mixture, cut into two halves.
- Bulk: one and one-half shawarmas using 210g raw seekh mixture total, cut into three halves.
- Distribute the Bulk mixture evenly so each half contains approximately 70g raw-equivalent seekh filling.
- The three Bulk pieces fit the container perfectly.
- Pickled vegetables will be included.
- The bread is folded around the meat; 170g replaces the 180g test to improve closure.
- Baking method tested at 400 F. Ground beef must reach the approved food-safety endpoint; baking time is not yet standardized.

Bread Nutrition Facts, per full bread:

- Calories: 240
- Total fat: 0g
- Cholesterol: 0mg
- Sodium: 340mg
- Total carbohydrate: 48g
- Dietary fiber: 0g
- Protein: 8g

Bread contribution:

- Lean, 1 bread: 240 calories, 48g carbohydrate, 8g protein, 340mg sodium.
- Bulk, 1.5 breads: 360 calories, 72g carbohydrate, 12g protein, 510mg sodium.

The bread brand, bread weight, sugars, ingredient statement, and allergen statement remain to be recorded.

Detailed file: `../recipes/BEEF_SEEKH_SHAWARMA_DRAFT.md`.

## Active Menu Status Register

| ID | Dish | Current status | Authoritative record | Next useful accuracy upgrade |
|---|---|---|---|---|
| b1 | Egg Bites | Portion count retained; July 18 formula failed tray-yield control | `../recipes/EGG_BITES_CURRENT_RECIPE.md` | Rebuild from measured batter grams per well before reuse |
| b2 | French Toast | Fresh taste approved; estimate complete | `../recipes/FRENCH_TOAST_TASTE_TEST.md` | Refrigerated reheat result and finished weight |
| b3 | Breakfast Quesadilla | Current modeled build; estimate complete | Archived recipe PDF plus nutrition audit | Finished weight and sauce grams |
| b4 | Grilled Cheese Breakfast Burrito | Current modeled build; July 18 used nonconforming leftover egg-bite mix | `../recipes/GRILLED_CHEESE_BREAKFAST_BURRITO_CURRENT_RECIPE.md` | Separate burrito egg batch, cooked yields, and finished weight |
| m1 | Butter Chicken | Current modeled build; estimate complete | Archived recipe PDF plus nutrition audit | Sauce batch yield and serving grams |
| m2 | Halal Cart Chicken + Yellow Rice | Current modeled build; 1,675g cooked batch output recorded July 18 | Archived recipe PDF, nutrition audit, and Batch 2 production notes | Verify raw start and sauce-free cooked definition |
| m3 | Loaded Buffalo Chicken Potato | Current modeled build; estimate complete | Archived recipe PDF plus nutrition audit | Finished weight and spray-oil use |
| m4 | Peri Peri Chicken | Corrected bone-in leg-quarter production build; estimate complete | Archived recipe PDF, user correction, and nutrition audit | Representative raw piece weight, cooked bone-in weight, edible yield, and retained marinade |
| m5 | Mexican Streetcorn Chicken Bowl | Draft taste status; estimate complete | `../recipes/MEXICAN_STREETCORN_CHICKEN_CURRENT_DRAFT.md` | Corn taste test, cooked yield, and reheat result |
| m6 | Beef Seekh Kabab Shawarma | Fresh taste approved; estimate complete | `../recipes/BEEF_SEEKH_SHAWARMA_DRAFT.md` | Cooked beef yield and finished weight |
| m7 | Meatball Arrabbiata Pasta | Revised tiers; 25-26g formed size and Friday oven method confirmed July 30 | `../recipes/MEATBALL_ARRABBIATA_CURRENT_RECIPE.md` | Cooked batch yield, endpoint log, and finished weight |
| m8 | Boy Kibble | Current modeled build; estimate complete | Archived recipe PDF plus nutrition audit | Finished weight and sauce grams |
| d1 | Strawberry Cheesecake | Taste approved base; estimate complete | `../recipes/STRAWBERRY_CHEESECAKE_ADAPTATION.md` | Finished cup weight |
| d2 | Chocolate Oreo Mousse | Taste approved; estimate complete | `../recipes/CHOCOLATE_OREO_MOUSSE_MACRO_AUDIT.md` | Finished cup weight and final batch yield |
| d3 | High Protein Tiramisu | July 18 taste and five-cup yield approved; five-cup formula now controls the calculation | `../records/batches/BATCH_2_PRODUCTION_NOTES_2026-07-17.md` and `../recipes/TIRAMISU_TEST_PLAN.md` | Nutrition recalculated; measure coffee pickup and cup weight, verify exact panels, and pass refrigerated hold before label release |

## Confirmed Portion Decisions

- Egg Bites Lean: intended 4 bites plus 120g potato hash; batter formula is quarantined after July 18 overyield.
- Egg Bites Bulk: intended 6 bites plus 150g potato hash; batter formula is quarantined after July 18 overyield.
- French Toast Lean: 3 slices plus packed fruit and whipped cream.
- French Toast Bulk: 4 slices plus packed fruit and whipped cream.
- Shawarma Lean: 1 full shawarma cut into 2 halves; 170g raw seekh mixture.
- Shawarma Bulk: 1.5 shawarmas cut into 3 halves; 210g raw seekh mixture distributed evenly.
- Arrabbiata Lean: 165g raw 90/10 beef and 65g dry protein pasta.
- Arrabbiata Bulk: 220g raw 90/10 beef and 76g dry protein pasta.
- Strawberry Cheesecake: one cup; current adaptation adds 11.6g vanilla protein powder to the approved base.

## Deferred Tests

- Mexican Streetcorn Chicken Bowl: corn was unavailable on July 14. If ordered, taste a small corn mixture before scaling production.
- High Protein Tiramisu: fresh taste and five-cup yield passed July 18, and the controlled calculator now uses that tested formula. Record coffee pickup, finished cup weight, exact package panels, and refrigerated hold before publishing again.
- French Toast: refrigerate and reheat one approved slice before changing status to Current Recipe.

## Label Lock Gate

The current label studio includes the following for every Lean/Bulk or Single label:

1. Exact product names and brands.
2. Ingredient grams for the full batch.
3. Cooking oil, spray, butter, marinades, and sauces actually used.
4. Finished batch yield or a documented working yield assumption.
5. Exact tier construction and finished net weight.
6. Calories, protein, carbohydrate, fat, fiber, sodium, sugars, saturated fat, trans fat, cholesterol, added sugars, vitamin D, calcium, iron, and potassium from traceable sources.
7. Ingredients in descending weight order, including packaged-product sub-ingredients.
8. Allergen statement.
9. Storage/freezer classification and reheating instructions.
10. Recipe status, version, and approval date.

Where an exact package or cook-day measurement was unavailable, the calculator uses a documented standard product or USDA equivalent. Replace an estimate when a better measured value becomes available; do not manually edit only the printed label.

## Next Work Order

1. Review the selected label before printing, especially dates, batch, storage, allergens, and net weight.
2. Record finished weights, meat yields, spray oil, salt, and sauce grams during production when practical.
3. Update `../nutrition/calculate_active_menu.py` when a recipe or accepted assumption changes.
4. Run the calculator, label-data generator, Word generator, and nutrition tests.
5. Update customer-facing menu calories/protein after the applicable recipe and taste status is approved.
