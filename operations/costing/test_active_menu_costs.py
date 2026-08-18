import importlib.util
from pathlib import Path
import sys
import unittest


MODULE_PATH = Path(__file__).with_name("calculate_active_menu_costs.py")
SPEC = importlib.util.spec_from_file_location("active_costs", MODULE_PATH)
COSTS = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = COSTS
SPEC.loader.exec_module(COSTS)


class ActiveMenuCostTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.nutrition = COSTS.load_nutrition_module()

    def test_every_active_recipe_ingredient_has_a_cost_basis(self):
        used = {
            portion.ingredient
            for meal in self.nutrition.MEALS
            for build in (meal.lean, meal.bulk)
            if build
            for portion in build.portions
        }
        self.assertEqual([], sorted(used - COSTS.COSTS.keys()))

    def test_raw_meat_cost_reverses_the_nutrition_yield(self):
        portion = self.nutrition.chicken_thigh(200)
        cost, _ = COSTS.portion_cost(portion)
        expected = 200 * COSTS.RAW_PROTEIN_BUFFER * (143.60 / 18143.7)
        self.assertAlmostEqual(expected, cost, places=6)

    def test_latest_confirmed_package_prices_are_loaded(self):
        self.assertAlmostEqual(143.60 / 18143.7, COSTS.COSTS["chicken_thigh_cooked"].cost)
        self.assertAlmostEqual(5.50 / 453.592, COSTS.COSTS["beef_90_baked"].cost)
        self.assertAlmostEqual(3.00 / 907, COSTS.COSTS["fage"].cost)
        self.assertAlmostEqual(10.00 / 16, COSTS.COSTS["small_tortilla"].cost)
        self.assertAlmostEqual(3.72 / 8, COSTS.COSTS["fajita_tortilla"].cost)
        self.assertAlmostEqual(10.00 / 2267.96, COSTS.COSTS["mozzarella"].cost)
        self.assertAlmostEqual(13.00 / 9071.85, COSTS.COSTS["rice_dry"].cost)
        self.assertAlmostEqual(5.00 / 8, COSTS.COSTS["shawarma_bread"].cost)
        self.assertAlmostEqual(2.00 / 340.194, COSTS.COSTS["broccoli"].cost)
        self.assertAlmostEqual(15.00 / 250, COSTS.SAUCE_CUP_COST)
        self.assertAlmostEqual(42.99 / 150, COSTS.MEAL_CONTAINER_COST)

    def test_one_row_exists_for_every_active_tier(self):
        expected = sum(1 + (meal.bulk is not None) for meal in self.nutrition.MEALS)
        rows = COSTS.meal_rows(self.nutrition)
        self.assertEqual(expected, len(rows))
        self.assertTrue(all(row["direct"] > 0 for row in rows))
        self.assertTrue(all(row["price"] > row["direct"] for row in rows))

    def test_report_contains_line_item_proof(self):
        report = COSTS.build_report(self.nutrition)
        self.assertIn("## Ingredient-Level Cost Proof", report)
        self.assertIn("## Order-Level and Weekly Costs", report)
        self.assertIn("Purchase-cost quantity", report)


if __name__ == "__main__":
    unittest.main()
