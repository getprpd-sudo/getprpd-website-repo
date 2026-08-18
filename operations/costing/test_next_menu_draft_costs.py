import importlib.util
from pathlib import Path
import sys
import unittest


MODULE_PATH = Path(__file__).with_name("calculate_next_menu_draft_costs.py")
SPEC = importlib.util.spec_from_file_location("next_costs", MODULE_PATH)
COSTS = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = COSTS
SPEC.loader.exec_module(COSTS)


class NextMenuDraftCostTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.nutrition = COSTS.load_nutrition_module()
        cls.rows = COSTS.meal_rows(cls.nutrition)

    def test_every_controlled_recipe_ingredient_has_a_cost_basis(self):
        used = {
            portion.ingredient
            for meal in self.nutrition.MEALS
            for recipe in (meal.lean, meal.bulk)
            if recipe
            for portion in recipe.portions
        }
        self.assertEqual([], sorted(used - COSTS.COSTS.keys()))

    def test_every_build_is_positive_and_below_price(self):
        self.assertEqual(30, len(self.rows))
        for row in self.rows:
            self.assertGreater(row["direct"], 0, row["meal"])
            self.assertLess(row["direct"], row["selling_price"], f"{row['meal']} {row['tier']}")

    def test_beef_and_seafood_use_upgraded_tiers(self):
        for meal_name in {"Loaded Beef Cottage Pie", "Garlic Butter Shrimp + Rice"}:
            rows = [row for row in self.rows if row["meal"] == meal_name]
            self.assertEqual([row["tier"] for row in rows], ["Lean", "Bulk"])
            self.assertEqual([row["selling_price"] for row in rows], [13.99, 15.99])

        streetcorn_rows = [row for row in self.rows if row["meal"] == "Mexican Streetcorn Chicken Bowl"]
        self.assertEqual([row["selling_price"] for row in streetcorn_rows], [10.99, 12.99])

    def test_menu_has_four_breakfasts_eight_mains_and_six_single_extras(self):
        meals = self.nutrition.MEALS
        self.assertEqual(4, sum(meal.category == "Breakfast" for meal in meals))
        self.assertEqual(8, sum(meal.category == "Main" for meal in meals))
        self.assertEqual(3, sum(meal.category == "Dessert" for meal in meals))
        self.assertEqual(3, sum(meal.category == "Add-on" for meal in meals))

    def test_grab_and_go_prices_and_cost_ceiling(self):
        rows = {row["meal"]: row for row in self.rows if row["category"] == "Add-on"}
        self.assertEqual(7.99, rows["PRPD Protein Box"]["selling_price"])
        self.assertEqual(7.99, rows["Mini Chicken Snack Wrap"]["selling_price"])
        self.assertEqual(6.99, rows["Strawberry Protein Overnight Oats"]["selling_price"])
        self.assertLessEqual(rows["PRPD Protein Box"]["cost_pct"], 32)
        # The owner-approved two-tortilla correction raises this limited add-on
        # above the former 32% target while still retaining 65%+ direct margin.
        self.assertLessEqual(rows["Mini Chicken Snack Wrap"]["cost_pct"], 35)

    def test_every_side_cup_is_costed(self):
        for meal_name in COSTS.SIDE_CUP_MEALS:
            rows = [row for row in self.rows if row["meal"] == meal_name]
            self.assertTrue(rows, meal_name)
            for row in rows:
                self.assertTrue(
                    any(line["item"] == "Sauce cup with lid" for line in row["packaging_lines"]),
                    f"{meal_name} {row['tier']}",
                )

    def test_shared_confirmed_prices_match_active_model(self):
        self.assertIs(COSTS.COSTS["fage"], COSTS.active_costs.COSTS["fage"])
        self.assertIs(COSTS.COSTS["mozzarella"], COSTS.active_costs.COSTS["mozzarella"])
        self.assertAlmostEqual(13.89 / 907.184, COSTS.COSTS["shrimp_cooked"].cost)
        self.assertAlmostEqual(7.99 / 453.592, COSTS.COSTS["beef_strips_cooked"].cost)
        self.assertAlmostEqual(4.98 / 12, COSTS.COSTS["hawaiian_roll"].cost)
        self.assertAlmostEqual(2.47 / 337, COSTS.COSTS["protein_mac"].cost)

    def test_report_contains_line_item_proof(self):
        report = COSTS.report(self.nutrition)
        self.assertIn("## Ingredient-Level Cost Proof", report)
        self.assertIn("## Order-Level and Weekly Costs", report)
        self.assertIn("Purchase-cost quantity", report)


if __name__ == "__main__":
    unittest.main()
