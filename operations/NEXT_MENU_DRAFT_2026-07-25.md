# PRPD Next Menu Draft - July 25, 2026 Delivery

Status: Customer order page published July 20, 2026. Controlled kitchen and product checks remain required before production and label printing.

Target cutoff: Wednesday, July 22, 2026 at 5:00 PM CT

## Readiness Snapshot - July 20

The July 25 customer menu and calculated macros are live. The owner explicitly approved publishing before the remaining physical checks; those checks are still required before cook-day production and customer label printing.

- [x] Working 15-dish menu: four breakfasts, eight mains, and three desserts.
- [x] Controlled Lean/Bulk/Single recipe grams and calculated nutrition estimates for all 27 tier builds.
- [x] Preliminary direct packed-cost report based on the current price ledger.
- [x] Final owner approval of the 15-dish menu direction.
- [ ] Remaining kitchen checks: Blueberry Cheesecake Protein Pancakes, Streetcorn component, Hot Honey Sliders, reduced Bulgogi plating, and the reduced-calorie Biscoff Cheesecake. Cheeseburger Hot Pockets and Premium NY Strip Steak have been taste-tested; three Bulk Hot Pockets fit the container while Lean remains two.
- [ ] Required purchased-product checks: sourdough, slider rolls, boxed protein mac, shrimp, Biscoff products, and banana-pudding mix.
- [x] Publish the controlled dishes, prices, dates, and macros through `config/order-config.js`.
- [x] Generate and verify the isolated July 25 customer label dataset.
- [x] Prepare the corrected real-food photo library without generative editing and wire available Batch 3 photos into the customer order page.
- [ ] Promote the July 25 recipes into the active cook-day and grocery production dataset.
- [x] Verify all 27 saved label builds against the controlled recipe calculator and pass the full automated suite.
- [ ] Visually inspect one label from every changed tier before printing.

The Label Studio exposes the complete July 25 dataset with `?menu=next`. Do not print production labels until the physical checks and active production-data promotion are complete.

## Menu Strategy

- Use a high-rotation menu rather than retaining most of the current week.
- Keep only selected dishes when there is a clear customer, production, or testing reason.
- Introduce one genuinely new main: Hot Honey Chicken Sliders.
- Keep four breakfasts, eight mains, and three desserts so the order-page structure remains familiar.
- Reuse audited nutrition and labels only when the recipe, brands, tier build, and portion sizes are unchanged.

## Confirmed Direction

The following original direction established the planning draft:

1. Cheeseburger Hot Pockets - historical returning dish; recipe and Lean/Bulk construction need rollover verification
2. Mexican Streetcorn Chicken Bowl - current returning dish; street-corn component still needs its kitchen check
3. Hot Honey Chicken Sliders - new dish; full test and nutrition audit required

The complete 15-dish selection is now directionally approved. Directional approval means the dishes belong on the intended menu; it does not override the nutrition, purchased-product, kitchen, reheat, costing, or label gates above.

## Recommended Eight-Main Draft

Seven mains was an operating-efficiency suggestion, not a research-backed magic number. PRPD's high-rotation promise and current customer behavior support retaining eight mains as the practical middle ground between the former ten-main menu and a more restrictive seven-main menu.

1. Cheeseburger Hot Pockets
2. Mexican Streetcorn Chicken Bowl
3. Hot Honey Chicken Sliders
4. Chicken Biryani
5. BBQ Chicken Mac & Cheese
6. Korean Bulgogi Beef Bowl
7. Garlic Butter Shrimp + Rice
8. Premium NY Strip Steak - candidate replacement for Tandoori Drumsticks; portion, side, and margin test required before approval

Chicken Biryani remains even though it appeared last week because it is a verified customer favorite. It serves as the familiar anchor while seven of the eight mains are different from the current July 18 menu. Butter Chicken should not also repeat in this draft; one anchor is enough.

The eighth-dish gate for future weeks is operational rather than arbitrary: retain an eighth main when it is a proven favorite, shares meaningful ingredients/equipment with the rest of the menu, or fills a clear variety gap without creating a disproportionate prep burden. Otherwise, seven is acceptable. Ten should be reserved for substantially higher order volume or a production system that can absorb more low-volume recipes.

The steak candidate should be presented as a plated premium main with mashed potatoes and broccoli. This prevents the menu from becoming another collection of rice bowls and makes the premium price visually understandable. The original 340 g raw steak build is not approved for Lean; evaluate approximately 225-255 g raw for Lean and 300-340 g raw for Bulk.

### Approved Format and Vegetable Direction - July 20

- Premium NY Strip Steak: mashed potatoes and broccoli.
- Korean Bulgogi Beef Bowl: rice, bulgogi beef, and a controlled stir-fry vegetable blend.
- Garlic Butter Shrimp: rice with zucchini as the primary vegetable.
- Mexican Streetcorn Chicken Bowl: retain the corn component and include peppers/onions in the controlled street-corn build.
- Chicken Biryani: serve with a separately packed cucumber-forward salad; verify refrigerated holding quality before approval.

These side decisions are approved as menu direction, but their exact grams, nutrition, costs, allergen statements, and labels remain provisional until the kitchen builds are tested. Do not add generic vegetables to every meal merely for appearance; each side must suit the dish and reheat properly.

Strawberry Protein Overnight Oats is rejected for this menu because it has not earned customer demand. Blueberry Cheesecake Protein Pancakes now occupy that slot as the new breakfast prototype. Keep four breakfast slots unless a fifth item has a clear demand and production case.

### Confirmed Four-Breakfast Draft

1. High Protein Omelette
2. Beef Breakfast Skillet
3. Power Bowl
4. Blueberry Cheesecake Protein Pancakes - new; three-pancake Lean and four-pancake Bulk builds require one kitchen and reheat test

### Nutrition-First Portion Direction

The July 25 controlled nutrition draft now takes priority over the earlier cost-only prototypes. Recipe grams and nutrition must be approved before costs are regenerated:

- Premium NY Strip Steak Lean: 240 g raw steak, mashed potatoes, and broccoli at $21.99.
- Premium NY Strip Steak Bulk: 300 g raw steak with larger mashed-potato and broccoli portions at $26.99.
- Hot Honey Chicken Sliders Lean: two sliders with 200 g raw boneless skinless chicken thighs at $10.99.
- Hot Honey Chicken Sliders Bulk: three sliders with 240 g raw boneless skinless chicken thighs at $12.99.
- Korean Bulgogi Beef Bowl: test 180 g raw Lean and 250 g raw Bulk instead of the historical 210/300 g portions.
- Garlic Butter Shrimp + Rice: test 200 g raw Lean and 270 g raw Bulk, with 45 g/60 g dry rice and 74 g/100 g edamame. The earlier 180 g/240 g cost prototype did not produce a meaningful enough Bulk tier.
- Lotus Biscoff Cheesecake: one full dessert cup at approximately 395 calories and 40g protein. The revised build uses two cookies, 15g cookie butter, no butter, and no honey; complete one taste and refrigerated-hold test before production approval.

These are controlled nutrition prototypes, not approved production builds. The full ingredient quantities and recalculated macros are in `nutrition/NEXT_MENU_NUTRITION_DRAFT_2026-07-25.md`. Test the finished portions before publishing, then regenerate the cost model from the approved grams.

The eight-main draft is balanced by format, not only flavor: four rice-based dishes and four non-rice dishes, with handhelds, pasta, one seafood dish, and one plated premium meal. Bulgogi remains useful for flavor and protein variety, but its separate velveting workflow and higher beef-strip cost make it the first main to remove if the kitchen workload or receipt price is unfavorable.

## Rotated Off This Draft

- Grilled Cheese Breakfast Burrito
- Peri Peri Chicken
- Beef Seekh Kabab Shawarma
- Boy Kibble
- High Protein Tiramisu
- Strawberry Protein Overnight Oats

These remain in the recipe library and can return later. Rotation is not retirement.

## Hot Honey Chicken Sliders - Prototype Build

Customer-facing concept: sweet and spicy chopped chicken thigh, melted cheese, pickles, and hot honey sauce on soft Hawaiian-style rolls.

Working bread for the first test: Great Value Sweet Hawaiian Rolls, approximately 70 calories and 2g protein per roll, priced at $2.68 for 12. Replace these values with the purchased package label if the product changes. A connected 12-count tray is preferred because it can be assembled and baked as a slab, then cut into portions.

Supplier note: the planning product is not recorded as halal-certified. PRPD should inspect the purchased ingredient panel and apply its normal halal ingredient standard before approval.

### Lean - 2 Sliders

- 2 Hawaiian rolls: approximately 140 calories, 4g protein
- 200g raw boneless skinless chicken thighs, targeting about 150g cooked
- 28g PRPD fat-free shredded cheese: approximately 50 calories, 9g protein
- Red onion, corn, and pickles: approximately 20 calories
- Controlled hot honey and sriracha-mayo components: target 65-75 calories
- Measured cooking spray/oil: target 15-20 calories

Current calculated estimate: approximately 590 calories and 51g protein.

### Bulk - 3 Sliders

- 3 Hawaiian rolls: approximately 210 calories, 6g protein
- 240g raw boneless skinless chicken thighs, targeting about 180g cooked
- 42g PRPD fat-free shredded cheese: approximately 75 calories, 14g protein
- Red onion, corn, and pickles: approximately 20 calories
- Controlled hot honey and sriracha-mayo components: target 70-80 calories
- Measured cooking spray/oil: target 15-20 calories

Current calculated estimate: approximately 760 calories and 65g protein.

These are development targets, not approved label numbers.

## Recipe Decisions for the First Test

- Use PRPD's standard boneless skinless chicken thighs and current fat-free shredded cheese; control the sauce portions to keep the build balanced.
- Do not use all three cheeses from the source recipe. One controlled reduced-fat cheese is enough.
- Omit the garlic-butter topping in the first test.
- Apply only enough hot honey inside to flavor the chicken. Pack the remaining sauce separately to reduce sogginess.
- Cool completely before closing the container.
- Test microwave plus air-fryer reheating and a refrigerated day-three sample.
- Treat it as an early-week meal until freeze-and-reheat quality is tested.

## Approval Work Before Sunday Deployment

1. Test Blueberry Cheesecake Protein Pancakes for three/four-pancake yield, sweetness, topping yield, finished weight, and day-three reheat quality.
2. Pull the authoritative historical recipes for Beef Breakfast Skillet, Chicken Biryani, Korean Bulgogi Beef Bowl, and Cookie Dough Cup.
3. Complete the Streetcorn component test.
4. Test Hot Honey Chicken Sliders for taste, bun fit, leakage, finished weight, reheat quality, and Lean/Bulk presentation.
5. Test mashed-potato and broccoli portions with the NY Strip, including steak doneness after reheating.
6. Confirm biryani salad holding quality, zucchini-shrimp presentation, and the Bulgogi stir-fry vegetable blend.
7. Regenerate active-menu nutrition, production data, labels, costing, and automated tests from the approved builds.
8. Update the order page only after the approval gate passes.

## Costing Workstream - Required After Menu Approval

Cost every dish on both this week's final menu and next week's approved menu.

Planning reports now available:

- `costing/ACTIVE_MENU_PRELIMINARY_COST_AUDIT.md`
- `costing/NEXT_MENU_DRAFT_COST_AUDIT.md`

The second report prices the full 15-dish draft but remains provisional until the menu and exact products are approved.

For each Lean, Bulk, and Single build, calculate:

1. Ingredient cost from exact recipe grams and current purchase prices.
2. Sauce, topping, side, garnish, and cooking-oil cost.
3. Packaging cost: container, lid, label, side cup, sauce cup, bag, foil, or wrap as applicable.
4. Expected yield loss and the pooled raw-protein reserve.
5. Direct food-and-packaging cost per customer meal.
6. Selling price, gross dollars retained, and food-cost percentage.
7. Flag meals whose Bulk upgrade or beef/seafood price does not cover the additional cost.
8. After the upcoming cook day records real task times, add a second fully loaded view with labor, commercial-kitchen expense, and an allocated share of operating overhead.

Track delivery expense separately at the order level, then calculate an average delivery allocation per delivered meal for management reporting. Do not distort individual recipe food cost by treating the entire delivery route as a recipe ingredient.

### Known Cost Inputs - July 15, 2026

Do not duplicate ingredient prices in this menu draft. Use `PRPD_COSTING_SOURCE_OF_TRUTH.md` for all current purchase prices, package conversions, retailer planning references, delivery assumptions, and superseded values. That file is the only price authority for both current and future menus.

### Required Cost Views

Maintain two separate views so cash cost and sustainable profitability are not confused:

1. **Packed contribution cost:** ingredients, measured oil/sauces/garnishes, yield loss, pooled raw-protein reserve, container, side/sauce cups, foil/wrap, bag, and other per-order consumables.
2. **Fully loaded cost:** packed contribution cost plus prep/cook/pack/admin labor, commercial-kitchen expense, utilities not already included in kitchen rent, delivery vehicle cost, payment fees, spoilage/refunds, and allocated monthly overhead.

For delivery, record both actual fuel expense (`route miles / 24 MPG x fuel price`) and a management vehicle-cost estimate. The IRS business mileage rate is useful as a broad wear/depreciation/operating-cost benchmark, but it is not the same as the week's cash fuel expense and should not be added on top of itemized vehicle costs.

### Remaining Inputs Before Final Costing

- Exact package prices and usable weights for rice, slider buns, specialty wraps/breads, eggs, egg whites, sauces, spices, and cooking spray
- Frozen broccoli package weight and usable weights for produce purchased per item or bunch
- Side cup, sauce cup/lid, bag, foil/wrap, glove, parchment, and cleaning-supply costs
- Commercial-kitchen fee and whether water/electricity/gas are included
- Actual prep, cook, packing, admin, and delivery hours; choose a management labor rate even when owners are not currently taking payroll
- Actual delivery miles and fuel receipt price each week
- Monthly insurance, permits, software/domain, phone, marketing, and other overhead to allocate
- Payment-processing fees by payment method

## Full PRPD Library Available for Substitution

### Breakfasts

High Protein Omelette; Beef Breakfast Skillet; French Toast Sticks; Egg Bites; Breakfast Quesadilla; Power Bowl; Grilled Cheese Breakfast Burrito; Strawberry Protein Overnight Oats; Scrambled Eggs + Potato Hash.

### Chicken Mains

Harissa Honey Chicken; Halal Cart Chicken + Yellow Rice; Sweet Chili Chicken; Cilantro Lime + Pinto Beans; Chicken Burrito; Loaded Buffalo Chicken Potato; Cheesy Chicken Tacos; Chipotle Chicken Bowl; BBQ Chicken Mac & Cheese; Chicken Biryani; Mediterranean Chicken Bowl; Peri Peri Drumsticks; Butter Chicken; Tandoori Drumsticks.

### Beef, Steak, and Seafood Mains

Beef Seekh Kabab / current Shawarma adaptation; Beef Stew with Potatoes; Korean Bulgogi Beef Bowl; Boy Kibble; Meatball Arrabbiata Pasta; Mongolian Beef; Pepper Steak Bowl; Beef Stir Fry; Beef Chili Bowl; Beef Taco Bowl; Garlic Butter Shrimp + Rice; Lemon Garlic Tilapia; Steak Bites + Garlic Butter Rice; Cheeseburger Hot Pockets.

### Desserts

Chocolate / Oreo Mousse; High Protein Kheer; Oreo Shake Cup; Cookie Dough Cup; Oreo Cheesecake Cup; Mango Lassi Cup; Lotus Biscoff Cheesecake; Banana Cream Pie Cup; High Protein Rice Pudding; Protein Tiramisu Cup; Cookies and Cream Protein Cookies.
