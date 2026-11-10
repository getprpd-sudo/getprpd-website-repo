# Chicken Enchilada Bake: bean-free return decision

Date: September 16, 2026. Status: owner-approved recipe revision for future production, not a rewrite of previous batches.

## Customer feedback and decision

Sartaj said the most recent enchilada seemed different because it contained beans, and that the earlier version was why they ordered it. The owner chose to remove beans from the recipe. This captures the reported preference without asserting which ingredients were physically used in the earlier pan; the historical records cannot verify that.

## Controlled change

- Omit both black and cannellini beans from Lean and Bulk Chicken Enchilada Bake. Do not silently substitute another bean.
- Keep the existing chicken, tortillas, corn, red enchilada sauce, mozzarella, red onion, seasoning, and cooking process. No replacement ingredient was approved.
- The modeled per-meal removed amounts are 50 g Lean and 70 g Bulk, relative to the most recent cannellini-bean formula. The one-pan Lean:Bulk finished-portion basis changes from 498:716 to 448:646, before actual cooked-yield adjustment.
- Recalculate nutrition, labels, ingredient declarations, costs, grocery requirements, and planner quantities when the dish returns to a live menu. The current Batch 11 menu does not contain Enchilada Bake.
- Keep cannellini beans in unrelated recipes, notably Caprese Protein Pasta Box.

The reusable formula is `../nutrition/calculate_next_menu.py::chicken_enchilada_bake`. The reusable execution method is `../cook-day-methods.js` under `Chicken Enchilada Bake`.
