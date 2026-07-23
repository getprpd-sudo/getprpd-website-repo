# PRPD Grocery Builder

Updated: July 22, 2026

The Grocery Builder converts the reviewed current-batch orders and controlled recipes into one consolidated shopping list. It is an internal localhost-only tool and is excluded from the public Vercel deployment.

## Open It

- Double-click `PRPD Grocery Builder` on the Windows desktop,
- run `open-grocery-list.bat` in the project root, or
- open `http://127.0.0.1:4173/operations/grocery-list.html` while the local operations server is running.

## Weekly Workflow

1. Finalize and review the current orders in the Cook-Day Planner.
2. Select **Sync current orders** in the Grocery Builder.
3. Confirm the displayed order and customer-meal counts match the planner.
4. Review the weekly sauce settings.
5. Keep the temporary dry-rice controls at 15% allowance and 2.75x cooked yield until one complete PRPD batch has recorded dry and cooked weights.
6. Select **Build grocery list**.
7. Select **I have enough** for pantry items already on hand. They leave the active list and remain available under **Show stocked items**.
8. Use the minus and plus controls only when the package count must differ from the calculated recommendation.
9. Correct a package price when a receipt or store listing is newer than the saved value.
10. Use **Export CSV** or **Print buy list** for the shopping trip.
11. After shopping, update confirmed prices in `PRPD_COSTING_SOURCE_OF_TRUTH.md` and `grocery-catalog.js` when appropriate.

Pantry counts and manual package quantities are saved separately for each batch and delivery date. They do not carry into a newly rolled menu. Confirmed package-price corrections are shared across batches so receipt work is not lost. **Reset this batch** clears only the active batch's pantry and package-count decisions while preserving those shared price corrections.

## What It Includes

- all current Google Sheets orders accepted by the Cook-Day Planner;
- planner-only BBQ Chicken Mac & Cheese and Premium NY Strip orders;
- exact customer-meal recipe quantities;
- a default 5% pooled reserve on raw meat and poultry;
- a temporary 15% dry-rice planning allowance at 2.75x expected cooked yield after the Batch 2 shortage;
- all controlled recipe ingredients and dish-specific sauces;
- both weekly batch sauces;
- meal containers, dessert cups, physical sauce cups, paper bags, and labels;
- pantry subtraction with a reversible stocked-items view;
- package-count steppers and editable package prices;
- whole-package purchase rounding;
- separate food-consumed and cash-checkout totals;
- pounds and ounces for normal shopping weights;
- grocery-store order: meat and seafood, produce, dairy and eggs, bread and tortillas, pantry and sauces, sweets and baking, then packaging;
- Walmart and Restaurant Depot comparison links, CSV export, and a printable buy list.

Customer names, phone numbers, and individual orders are not displayed or stored by this page.

## Current Weekly Sauce Plan

The controlled pair is:

- **Smoky BBQ Yogurt Ranch**
- **Tangy Yogurt Honey Mustard**

The default batch is:

- 30 sealed 2-ounce customer cups of each flavor: 60 customer cups total;
- 10 additional 60-gram cup-equivalents of each flavor held in dated squeeze bottles for assembling wraps, quesadillas, bowls, steak meals, and other savory dishes: 20 cup-equivalents total;
- 1 QC cup of each flavor: 2 QC cups total.

This equals 82 cup-equivalents of sauce across both flavors, but only 62 physical side cups are required. The 20 kitchen-use equivalents stay in squeeze bottles. Recipe-specific sauces such as buffalo sauce, salsa, French-toast syrup, butter-chicken sauce, and street-corn crema are already included through their individual recipes and must not be added again as weekly sauce.

The first production of either weekly sauce remains a taste and yield check. Make one 60-gram pilot, taste it with representative food, record any adjustment, and only then scale the full batch.

## Prices And Internet Search

The tool preserves confirmed PRPD receipt prices and labels estimates as planning or legacy values. It does not silently scrape and overwrite prices because retailer results vary by location, login state, stock, substitutions, and package size. Each row includes a fresh Walmart search link so the operator can verify the current local product and enter the current package price.

The two totals have different jobs:

- **Food used by this batch** values only the portion of each food package consumed by the generated production plan. It excludes packaging.
- **Cash checkout after pantry** assumes every unmarked item must be purchased as a complete package. It includes packaging and inventory left over after the batch.

For the final live July 18 rerun after the manual-order reconciliation, the verified planning values are approximately **$344.78 of food consumed**, **$43.41 of direct packaging consumed**, and **$665.89 at checkout with an empty pantry**. After entering the confirmed meat, onion, egg-white, steak, container, and printed-label inventory, the builder reports approximately **$385.62**, but still assumes zero stock for 65 other lines. The gap is not waste: it is mostly full packages and reusable inventory such as protein powder, rice, seasonings, sauces, oil, cups, containers, and paper bags. The checkout number should be used only after the actual pantry count.

Restaurant Depot's online pickup and delivery prices may be higher than warehouse prices. Compare the in-store unit price and package size before replacing a confirmed PRPD price. Bulk purchasing is appropriate only when the unit price is lower, the product will be used before quality declines, and storage capacity is available.

## Current Quantity Checks

- Breakfast Quesadilla: two tortillas per customer meal in both tiers.
- Grilled Cheese Breakfast Burrito: two tortillas per customer meal in both tiers.
- Beef Seekh Kebab Shawarma: one wrap for Lean and 1.5 wraps for Bulk.
- Current live requirement: 24 small tortillas, 6 large tortillas, and 9 shawarma wraps before package rounding.
- Current combined nonfat Greek-yogurt requirement: approximately 13.31 lb, which rounds to seven 32-ounce tubs when none is on hand. The builder consolidates Fage/Simple Truth recipe references because PRPD can fulfill them with the same current nonfat Greek yogurt.

## Restaurant-Style Purchasing Method

The builder follows the standard small foodservice purchasing loop:

1. confirmed customer orders determine production quantities;
2. controlled recipes convert production into ingredient requirements;
3. the physical pantry count is subtracted;
4. shortages are rounded to real vendor packages;
5. receipts update the price ledger;
6. repeated weekly usage becomes the basis for future par levels and safety stock.

Do not set permanent bulk pars from a single batch. Use several weeks of actual usage, storage capacity, vendor lead time, and waste records before increasing standing inventory.

## Source Files

- `grocery-list.html` - interface and print layout.
- `grocery-list-app.js` - live sync, pantry state, rendering, CSV, and interaction logic.
- `grocery-list-core.js` - requirement merging, purchase rounding, packaging, totals, and CSV calculations.
- `grocery-catalog.js` - package sizes, prices, stores, search terms, and confidence labels.
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
- pantry presence for method-only items whose gram weights are not yet controlled, including strong coffee, black pepper, oregano/yellow-rice spices, garam masala, turmeric, smoked paprika, Italian seasoning, chili flakes, Tajin, mild chile, and the breakfast chicken seasoning blend.
