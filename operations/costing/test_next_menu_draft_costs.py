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
        self.assertEqual(27, len(self.rows))
        for row in self.rows:
            self.assertGreater(row["direct"], 0, row["meal"])
            self.assertLess(row["direct"], row["selling_price"], f"{row['meal']} {row['tier']}")

    def test_steak_uses_distinct_premium_tiers(self):
        steak = [row for row in self.rows if row["meal"] == "Premium NY Strip Steak"]
        self.assertEqual([row["tier"] for row in steak], ["Lean", "Bulk"])
        self.assertEqual([row["selling_price"] for row in steak], [21.99, 26.99])

    def test_menu_has_four_breakfasts_eight_mains_three_desserts(self):
        meals = self.nutrition.MEALS
        self.assertEqual(4, sum(meal.category == "Breakfast" for meal in meals))
        self.assertEqual(8, sum(meal.category == "Main" for meal in meals))
        self.assertEqual(3, sum(meal.category == "Dessert" for meal in meals))

    def test_shared_confirmed_prices_match_active_model(self):
        self.assertIs(COSTS.COSTS["fage"], COSTS.active_costs.COSTS["fage"])
        self.assertIs(COSTS.COSTS["mozzarella"], COSTS.active_costs.COSTS["mozzarella"])
        self.assertAlmostEqual(15.96 / 907.184, COSTS.COSTS["shrimp_cooked"].cost)
        self.assertAlmostEqual(7.99 / 453.592, COSTS.COSTS["beef_strips_cooked"].cost)
        self.assertAlmostEqual(2.68 / 12, COSTS.COSTS["hawaiian_roll"].cost)
        self.assertAlmostEqual(2.47 / 191.36, COSTS.COSTS["protein_mac"].cost)

    def test_report_contains_line_item_proof(self):
        report = COSTS.report(self.nutrition)
        self.assertIn("## Ingredient-Level Cost Proof", report)
        self.assertIn("## Order-Level and Weekly Costs", report)
        self.assertIn("Purchase-cost quantity", report)


if __name__ == "__main__":
    unittest.main()
