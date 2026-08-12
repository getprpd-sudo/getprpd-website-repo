# PRPD Batch 6 Approved Menu

Status: **OWNER APPROVED FOR PUBLICATION**
Approval recorded: August 10, 2026; operational simplification approved August 11, 2026
Delivery: Saturday, August 15, 2026
Order cutoff: Wednesday, August 12 at 6:00 PM CT
Customer reminders: **owner approved August 10 after live-site review**

This is the approved customer menu. `config/order-config.js` is the public
runtime authority. The deployment-excluded internal mirror, nutrition
calculator, label data, production data, planner methods, grocery catalog, and
cost report were regenerated from the same selection.

## Breakfasts

| Dish | Lean | Bulk | Price | Service control |
|---|---:|---:|---:|---|
| PRPD Beef Bacon Breakfast Sandwich | 630 cal / 41g protein | 875 cal / 62g protein | $13.99 / $15.99 | One 45g PRPD Sweet Heat cup |
| French Toast | 520 cal / 34g protein | 670 cal / 45g protein | $10.99 / $12.99 | One measured syrup cup |
| Breakfast Quesadilla | 580 cal / 75g protein | 770 cal / 98g protein | $10.99 / $12.99 | Lean uses two 70-calorie tortillas; one measured salsa cup |
| Grilled Cheese Breakfast Burrito | 570 cal / 65g protein | 765 cal / 89g protein | $13.99 / $15.99 | Lean uses two 70-calorie tortillas; broth-free beef filling |

## Mains

| Dish | Lean | Bulk | Price | Service control |
|---|---:|---:|---:|---|
| Loaded Beef Cottage Pie | 705 cal / 56g protein | 850 cal / 71g protein | $13.99 / $15.99 | One 45g PRPD Sweet Heat cup |
| Hot Honey Chicken Sliders | 650 cal / 47g protein | 875 cal / 65g protein | $10.99 / $12.99 | House refrigerator pickles; sauce incorporated |
| Loaded Buffalo Chicken Potato | 595 cal / 50g protein | 735 cal / 70g protein | $10.99 / $12.99 | Buffalo sauce incorporated |
| Beef Seekh Kabab Shawarma | 575 cal / 44g protein | 770 cal / 56g protein | $13.99 / $15.99 | House refrigerator pickles and garlic yogurt sauce incorporated |
| Harissa Honey Chicken | 580 cal / 44g protein | 820 cal / 65g protein | $10.99 / $12.99 | Measured harissa-honey finish; rice and broccoli |
| Mexican Streetcorn Chicken Bowl | 595 cal / 48g protein | 790 cal / 65g protein | $10.99 / $12.99 | Neutral chicken and common rice; creamy street-corn component incorporated |
| Garlic Butter Shrimp + Rice | 500 cal / 50g protein | 670 cal / 67g protein | $13.99 / $15.99 | Garlic-butter finish; rice, edamame, and zucchini |
| BBQ Chicken Mac & Cheese | 630 cal / 66g protein | 765 cal / 85g protein | $10.99 / $12.99 | BBQ finish plus one measured BBQ cup |

## Desserts

| Dish | Serving | Price | Control |
|---|---:|---:|---|
| Chocolate-Dipped Cookie Dough Balls | 520 cal / 38g protein | $6.99 | Three balls; 14g total chocolate |
| Chocolate Oreo Mousse | 290 cal / 38g protein | $6.99 | Fixed measured mousse formula |
| Baked Strawberry-Lemon Protein Cheesecake Square | 225 cal / 14g protein | $6.99 | Crustless baked square; not a layered Biscoff cup |

## Grab And Go

| Dish | Serving | Price | Control |
|---|---:|---:|---|
| PRPD Protein Box | 355 cal / 29g protein | $7.99 | One 12 oz box with a whole approximately 70g mini apple |
| Mini Chicken Snack Wrap | 325 cal / 41g protein | $7.99 | Two 45-calorie fajita tortillas; filling split evenly; sauce incorporated |
| Strawberry Protein Overnight Oats | 360 cal / 35g protein | $6.99 | Fixed single-size 12 oz cup |

## Batch-Wide Controls

- Sweet Heat: 45g net in a 2 oz cup. Formula ratio by weight is
  250:300:300:170 light mayonnaise:ketchup:honey:sriracha. It is assigned only
  to the Beef Bacon Breakfast Sandwich and Loaded Beef Cottage Pie.
- Chicken synergy: compatible chicken for Breakfast Quesadilla, Sliders,
  Buffalo Potato, Harissa Honey Chicken, Streetcorn Bowl, BBQ Mac, and Snack Wrap uses one
  neutral savory base, then splits into exact labeled destination pulls before
  recipe-specific finishes.
- Rice synergy: Harissa Chicken, Streetcorn Chicken, and Shrimp use one common basmati-rice
  production wave, then split into exact dish allocations.
- House refrigerator pickles replace purchased mixed pickled vegetables for
  Sliders and Shawarma.
- Overnight oats are packed only in the normal 12 oz cup.
- The Snack Wrap alone uses the Mission Carb Balance Fajita eight-count package:
  45 calories, 4g protein, 12g carbohydrate, 11g fiber, and 2g fat per 28g
  tortilla, with two tortillas per order. Lean breakfast builds retain two
  70-calorie standard small tortillas; Bulk breakfast builds retain two
  110-calorie large tortillas.
- Protein shakes remain next-batch R&D. Xanthan gum was removed; future bottles
  will say `SHAKE WELL` and require tamper-evident seal testing before sale.

## Explicit Exclusions

- Cheeseburger Hot Pockets are not on Batch 6.
- High Protein Omelette and Power Bowl are not on Batch 6.
- The former Strawberry Cheesecake cup is retired.
- Protein shakes are not on Batch 6.
- Korean Bulgogi Beef Bowl was removed on August 11 before any Batch 6 customer
  ordered it; the live Sheet contained zero current-batch Bulgogi selections.

## Controlled Sources

- Public configuration: `../../config/order-config.js`
- Internal production mirror: `BATCH_6_DRAFT_ORDER_CONFIG.js`
- Reproducible recipes and nutrition: `../nutrition/calculate_next_menu.py`
- Generated nutrition report: `../nutrition/NEXT_MENU_NUTRITION_2026-08-15.md`
- Generated label data: `../nutrition/next-menu-label-data.js`
- Label synchronization check: `../nutrition/verify_next_menu_labels.py`
- Generated production data: `../nutrition/production-data.js`
- Planner methods and sauce assignments: `../cook-day-methods.js`
- Direct packed-cost audit: `../costing/NEXT_MENU_DRAFT_COST_AUDIT.md`

## Remaining Physical Checks Before Production Labels And Shopping Lock

These do not block website publication, but must be resolved from the actual
purchased packages or first measured batch before final label printing:

1. Confirm the purchased harissa, reduced-fat cream cheese, tortillas, beef
   bacon, chocolate, Oreo, and protein-powder package panels.
2. Record representative cooked yields for chicken, drained ground beef, beef
   strips, shrimp, and beef bacon.
3. Confirm the whole mini apple fits the 12 oz Protein Box after the complete
   build is packed and held cold.
4. Record the refrigerator-pickle finished drained yield and the first baked
   cheesecake pan and eight-square weights.
5. After cutoff, sync live orders before generating the final production packet,
   grocery checkout list, or exact-count labels.
