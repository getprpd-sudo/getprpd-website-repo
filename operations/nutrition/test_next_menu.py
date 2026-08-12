import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import calculate_next_menu as menu


class NextMenuNutritionTests(unittest.TestCase):
    def test_menu_shape(self):
        self.assertEqual(len(menu.MEALS), 18)
        self.assertEqual(sum(meal.category == "Breakfast" for meal in menu.MEALS), 4)
        self.assertEqual(sum(meal.category == "Main" for meal in menu.MEALS), 8)
        self.assertEqual(sum(meal.category == "Dessert" for meal in menu.MEALS), 3)
        self.assertEqual(sum(meal.category == "Add-on" for meal in menu.MEALS), 3)

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
        # Premier's physical scoop is 19.5g. French Toast retains its measured
        # 8.7g four-slice custard unit, with Lean using 75% of that unit.
        self.assertTrue(all(round(amount, 3) in {5, 6.525, 8.7, 9.75, 14.625, 15, 19.5} for amount in powder_amounts))

    def test_target_ranges_are_flagged_only_where_expected(self):
        for meal in menu.MEALS:
            lean = menu.total(meal.lean)
            self.assertLess(lean.calories, 750, meal.name)
            if meal.bulk:
                bulk = menu.total(meal.bulk)
                self.assertLess(bulk.calories, 900, meal.name)

    def test_batch_6_rotation_excludes_quarantined_dishes(self):
        names = {meal.name for meal in menu.MEALS}
        self.assertTrue({"French Toast", "Breakfast Quesadilla", "PRPD Beef Bacon Breakfast Sandwich"}.issubset(names))
        self.assertTrue({"Harissa Honey Chicken", "Mexican Streetcorn Chicken Bowl", "Garlic Butter Shrimp + Rice"}.issubset(names))
        self.assertNotIn("Korean Bulgogi Beef Bowl", names)
        self.assertFalse({
            "Cheeseburger Hot Pockets",
            "Strawberry Cheesecake",
        }.intersection(names))

    def test_sweet_heat_is_exactly_one_40g_cup_on_eligible_meals(self):
        eligible = {"PRPD Beef Bacon Breakfast Sandwich", "Loaded Beef Cottage Pie"}
        for meal in menu.MEALS:
            for record in [meal.lean] + ([meal.bulk] if meal.bulk else []):
                sweet_heat = [
                    portion for portion in record.portions
                    if portion.ingredient in {"light_mayo", "ketchup", "honey", "sriracha"}
                    and "Sweet Heat" in portion.note
                ]
                if meal.name in eligible:
                    self.assertAlmostEqual(sum(portion.amount for portion in sweet_heat), 45, places=3)
                    self.assertEqual({portion.ingredient for portion in sweet_heat}, {"light_mayo", "ketchup", "honey", "sriracha"})
                else:
                    self.assertEqual([], sweet_heat, meal.name)

    def test_macro_drift_is_reconciled_to_calculator(self):
        expected = {
            "Loaded Beef Cottage Pie": ((705, 56), (850, 71)),
            "Mexican Streetcorn Chicken Bowl": ((595, 48), (790, 65)),
        }
        for meal_name, (lean_expected, bulk_expected) in expected.items():
            meal = next(meal for meal in menu.MEALS if meal.name == meal_name)
            self.assertEqual(menu.display(menu.total(meal.lean))[:2], lean_expected)
            self.assertEqual(menu.display(menu.total(meal.bulk))[:2], bulk_expected)

    def test_grab_and_go_rnd_builds_use_controlled_12oz_formulas(self):
        oats = menu.overnight_oats_12oz()
        chocolate = menu.protein_shake_chocolate_pb_12oz()
        strawberry = menu.protein_shake_strawberry_vanilla_12oz()

        self.assertAlmostEqual(sum(portion.amount for portion in oats.portions), 308.2, places=2)
        self.assertAlmostEqual(sum(portion.amount for portion in chocolate.portions), 323.2, places=2)
        self.assertAlmostEqual(sum(portion.amount for portion in strawberry.portions), 368.0, places=2)

        oats_n = menu.total(oats)
        self.assertAlmostEqual(oats_n.calories, 360.68, places=2)
        self.assertAlmostEqual(oats_n.protein, 34.72, places=2)
        self.assertAlmostEqual(oats_n.carbs, 45.09, places=2)

        chocolate_n = menu.total(chocolate)
        self.assertAlmostEqual(chocolate_n.calories, 264.93, places=2)
        self.assertAlmostEqual(chocolate_n.protein, 44.47, places=2)
        self.assertAlmostEqual(chocolate_n.carbs, 16.06, places=2)

        strawberry_n = menu.total(strawberry)
        self.assertAlmostEqual(strawberry_n.calories, 237.21, places=2)
        self.assertAlmostEqual(strawberry_n.protein, 39.74, places=2)
        self.assertAlmostEqual(strawberry_n.carbs, 15.01, places=2)
        self.assertFalse(any(portion.ingredient == "xanthan" for portion in chocolate.portions + strawberry.portions))

    def test_mini_chicken_wrap_uses_two_confirmed_fajita_tortillas(self):
        wrap = menu.mini_chicken_wrap()
        tortillas = [portion for portion in wrap.portions if portion.ingredient == "fajita_tortilla"]
        self.assertEqual(1, len(tortillas))
        self.assertEqual(2, tortillas[0].amount)
        self.assertEqual("each", tortillas[0].unit)
        self.assertEqual((325, 41, 29, 23, 13), menu.display(menu.total(wrap)))


if __name__ == "__main__":
    unittest.main()
