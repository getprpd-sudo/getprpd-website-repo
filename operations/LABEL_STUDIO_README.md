# PRPD Label Studio

The studio opens on the July 18 active menu. A separate **Review July 25 draft** switch is available in the header. Draft review never replaces the active dataset, changes the customer order page, or publishes the proposed menu.

Double-click `PRPD Label Studio` on the Windows desktop or run `open-label-studio.bat` in the project folder. It starts the shared PRPD local tool server, verifies that the Label Studio returns successfully, and then opens `http://127.0.0.1:4173/operations/label-studio.html`. This is an internal production tool and is not part of the public customer website.

If the page displays `{"error":"Not found."}`, close that tab and launch it again from the desktop shortcut. Do not use a `getprpd.com/operations/...` address because internal operations files are intentionally excluded from the public website.

## Current Scope

- Avery 5168, 3.5 x 5 inches, four labels per letter sheet
- All 15 active menu dishes, plus the manual BBQ Chicken Mac & Cheese label needed for the current PR collaboration order
- Categorized Breakfasts, Mains, and Desserts meal selection
- Lean and Bulk switching where a meal has two tiers; Single for desserts
- Multi-sheet print queue with independent meal/tier checkboxes and 1-25 sheet counters
- Select all, clear, and current-label-only queue controls
- Four matching labels on every sheet, with separate quantities for every checked meal/tier variant
- Complete calculated nutrition estimates: calories, fat, saturated fat, trans fat, cholesterol, sodium, carbohydrates, fiber, sugars, added sugars, protein, vitamin D, calcium, iron, and potassium
- Editable made date, refrigerate-through date, batch ID, net weight, ingredients, allergens, storage, reheating, and meal-specific note
- Freezer-friendly and fridge-only storage wording
- Low-ink white and forest-green layout
- Four-up browser printing

## Data Pipeline

The label studio does not contain a second manual nutrition database. Its data is generated from the active-menu calculator.

```powershell
python operations/nutrition/calculate_active_menu.py
python operations/nutrition/generate_label_data.py
python operations/nutrition/generate_active_menu_audit_docx.py
```

Generated label data is stored in `operations/nutrition/label-data.js`. Run all three commands after a recipe, tier portion, product assumption, or nutrient value changes.

The proposed July 25 labels are generated separately:

```powershell
python operations/nutrition/calculate_next_menu.py
python operations/nutrition/generate_next_menu_label_data.py
```

The output is `operations/nutrition/next-menu-label-data.js`. It is review-only until the validation items in `NEXT_MENU_DRAFT_2026-07-25.md` are approved. Do not print a customer label merely because its draft renders successfully.

The active studio imports only BBQ Chicken Mac & Cheese from the draft dataset for the current manual PR order. Premium NY Strip Steak remains absent because Talal is a no-label account. This internal convenience does not publish either dish on the customer order page.

## Printing Test

1. Select a meal and tier to review its editable label fields.
2. Review the production date, batch, net weight, ingredients, allergens, storage, and reheating fields.
3. In the print queue, check every meal/tier needed. Use `Current only` for one test sheet or `Select all` for a complete active-menu run.
4. Set the `Sheets` counter for each checked meal/tier. The default is one sheet; every sheet contains four matching labels.
5. Confirm the queue summary shows the expected sheet and label totals.
6. Click `Print selected sheets`.
7. In the browser print dialog select Letter, portrait, 100% or Actual Size, no margins, turn off browser headers and footers, and turn on Background graphics.
8. In the printer properties, select Labels, Heavyweight, or Cardstock as the media type and Best or High print quality. Feed one Avery sheet at a time.
9. First print on plain paper.
10. Hold the paper behind an Avery 5168 sheet against a light source and verify alignment.
11. Only then run an actual label sheet.

Do not select `Fit to page`; it changes physical alignment.

The print layout uses the official Avery 5168 portrait coordinates rather than a browser landscape grid: left edges at 0.5 and 4.5 inches, top edges at 0.5 and 5.5 inches, and four identical 3.5 x 5 inch physical slots. The two rows intentionally have no vertical gap; their die lines meet at 5.5 inches. Each 5 x 3.5-inch landscape artwork panel is rotated inside its portrait slot, matched to Avery's 0.1-inch rounded corners, and scaled to 96%. That leaves approximately 0.07 inch at the physical left/right edges and 0.10 inch at the top/bottom edges so normal sheet-feed drift does not cut the brand footer or merge artwork across the center die line.

If saving a PDF before printing, print that PDF at `Actual size` and never use `Fit`, `Shrink oversized pages`, or a printer-driver scaling option. A scaling option can make the preview look aligned while moving the artwork off the Avery cuts.

## Accuracy Standard

The nutrition panels are complete calculated estimates based on the recorded PRPD recipes, named package labels, manufacturer data, USDA FoodData Central records, and approved generic equivalents. They are not laboratory analyses.

The most useful next-cook upgrades are actual finished net weight, meat cooking yield, spray-oil use, salt used per batch, and sauce grams per serving. These measurements improve the estimates without blocking current small-batch label production.

When a product or recipe changes, update the calculator and regenerate the labels. Do not manually change only the printed nutrition panel because that would separate the label from the saved recipe model.
