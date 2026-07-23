# PRPD Nutrition Assumptions and Accuracy Upgrade Checklist

Updated: July 14, 2026

The active-menu Nutrition Facts estimates are complete. Exact retail-package matching and laboratory analysis are not required for the current small-batch workflow. This file records the accepted assumptions and the measurements that will improve accuracy over time.

## Accepted Product Assumptions

- Beef: 90/10 ground beef
- Chicken: boneless, skinless chicken thighs unless a recipe states bone-in leg quarters
- Egg whites: standard liquid egg-white nutrition
- Cottage cheese: H-E-B fat-free cottage cheese
- Mozzarella: H-E-B fat-free mozzarella
- Milk: Fairlife fat-free milk
- Protein powder: Premier Protein vanilla or chocolate; 39g scoop = 150 calories and 30g protein
- French Toast bread: D'Italiano sliced bread using the supplied 80-calorie-per-slice panel
- Shawarma bread: standard wrap estimate using the confirmed 240-calorie whole-loaf value
- Sauces: G Hughes sugar-free sweet chili, BBQ, and teriyaki as applicable
- Condiments: Heinz ketchup and mustard
- Syrup: Great Value sugar-free maple syrup
- Cooking fat: avocado-oil spray
- Desserts: standard sugar-free whipped cream, ladyfingers, Oreo Thins, Philadelphia no-bake filling, and generic mascarpone values
- Plain produce, meats, grains, eggs, herbs, and spices: USDA FoodData Central values

## Highest-Value Cook-Day Measurements

These are accuracy upgrades, not blockers.

- [ ] Weigh one finished Lean and one finished Bulk container for each meal to replace estimated net weights.
- [ ] Record raw meat weight and finished cooked yield for each protein batch.
- [ ] Weigh the spray-oil can before and after each recipe batch.
- [ ] Weigh salt added to each batch.
- [ ] Record finished sauce yield and sauce grams served in each tier.
- [ ] Record total finished servings from each batch.
- [ ] For Peri-Peri leg quarters, record representative raw piece weight/count, cooked bone-in serving weight, and edible-meat yield.
- [ ] Record finished dessert cup weight and total cup yield.

## House Components Worth Standardizing

When convenient, record ingredient grams, final batch weight, and serving grams for:

- White garlic yogurt sauce
- Cilantro-lime crema
- Chipotle sauce
- Peri peri marinade
- Butter Chicken sauce
- Halal Cart white sauce
- Streetcorn mixture and crema
- Arrabbiata sauce
- Seekh seasoning mixture
- Potato hash
- Strawberry sauce
- Sweetened cocoa dust for tiramisu

## Regeneration Workflow

After changing any assumption or recipe:

```powershell
python operations/nutrition/calculate_active_menu.py
python operations/nutrition/generate_label_data.py
python operations/nutrition/generate_active_menu_audit_docx.py
python -m unittest discover -s operations/nutrition -p "test_*.py" -v
```

This updates the Markdown audit, browser label data, Word audit, and validation tests from one calculation model.
