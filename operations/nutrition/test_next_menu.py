import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import calculate_next_menu as menu


class NextMenuNutritionTests(unittest.TestCase):
    def test_menu_shape(self):
        self.assertEqual(len(menu.MEALS), 15)
        self.assertEqual(sum(meal.category == "Breakfast" for meal in menu.MEALS), 4)
        self.assertEqual(sum(meal.category == "Main" for meal in menu.MEALS), 8)
        self.assertEqual(sum(meal.category == "Dessert" for meal in menu.MEALS), 3)

    def test_all_meals_have_positive_core_nutrition(self):
        for meal in menu.MEALS:
            records = [meal.lean] + ([meal.bulk] if meal.bulk else [])
            for record in records:
                value = menu.total(record)
                self.assertGreater(value.calories, 0, meal.name)
                self.assertGreater(value.protein, 0, meal.name)
                self.assertGreater(value.carbs, 0, meal.name)

    def test_bulk_exceeds_lean(self):
        for meal in menu.MEALS:
            if meal.bulk:
                lean = menu.total(meal.lean)
                bulk = menu.total(meal.bulk)
                self.assertGreater(bulk.calories, lean.calories, meal.name)
                self.assertGreater(bulk.protein, lean.protein, meal.name)

    def test_powder_is_explicit_grams(self):
        powder_amounts = []
        for meal in menu.MEALS:
            records = [meal.lean] + ([meal.bulk] if meal.bulk else [])
            for record in records:
                powder_amounts += [portion.amount for portion in record.portions if portion.ingredient == "whey"]
        self.assertTrue(powder_amounts)
        # Premier's physical scoop is 19.5g. Recipes may use 1/2, 3/4, or 1 scoop.
        self.assertTrue(all(amount in {9.75, 14.625, 19.5} for amount in powder_amounts))

    def test_target_ranges_are_flagged_only_where_expected(self):
        for meal in menu.MEALS:
            lean = menu.total(meal.lean)
            self.assertLess(lean.calories, 750, meal.name)
            if meal.bulk:
                bulk = menu.total(meal.bulk)
                self.assertLess(bulk.calories, 900, meal.name)

    def test_reduced_biscoff_cup_stays_in_target(self):
        meal = next(meal for meal in menu.MEALS if meal.name == "Lotus Biscoff Cheesecake")
        calories, protein, *_ = menu.display(menu.total(meal.lean))
        self.assertEqual(calories, 395)
        self.assertEqual(protein, 40)
        ingredients = {portion.ingredient: portion.amount for portion in meal.lean.portions}
        self.assertEqual(ingredients["biscoff_spread"], 15)
        self.assertEqual(ingredients["biscoff_cookie"], 2)
        self.assertNotIn("butter", ingredients)
        self.assertNotIn("honey", ingredients)


if __name__ == "__main__":
    unittest.main()
