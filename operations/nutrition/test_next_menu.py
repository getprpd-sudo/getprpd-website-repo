import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import calculate_next_menu as menu
import audit_full_menu_library_macros as full_library_audit


class NextMenuNutritionTests(unittest.TestCase):
    def test_full_controlled_library_side_cup_audit(self):
        self.assertEqual(61, len(full_library_audit.ENTRIES))
        self.assertEqual([], full_library_audit.validate())

    def test_custom_lebanese_dressing_is_not_in_public_meal_macros(self):
        record = menu.custom_lebanese_chicken()
        excluded = [portion for portion in record.portions if not portion.include_in_menu_macros]
        self.assertAlmostEqual(15, sum(portion.amount for portion in excluded), places=2)
        self.assertTrue(all("dressing cup" in portion.note for portion in excluded))
        self.assertLess(menu.menu_total(record).calories, menu.total(record).calories)

    def test_menu_shape(self):
        self.assertEqual(len(menu.MEALS), 17)
        self.assertEqual(sum(meal.category == "Breakfast" for meal in menu.MEALS), 4)
        self.assertEqual(sum(meal.category == "Main" for meal in menu.MEALS), 7)
        self.assertEqual(sum(meal.category == "Dessert" for meal in menu.MEALS), 3)
        self.assertEqual(sum(meal.category == "Add-on" for meal in menu.MEALS), 3)

    def test_all_meals_have_positive_core_nutrition(self):
        for meal in menu.MEALS:
            records = [meal.lean] + ([meal.bulk] if meal.bulk else [])
            for record in records:
                if not menu.nutrition_is_complete(record):
                    continue
                value = menu.total(record)
                self.assertGreater(value.calories, 0, meal.name)
                self.assertGreater(value.protein, 0, meal.name)
                self.assertGreater(value.carbs, 0, meal.name)

    def test_public_menu_excludes_only_explicit_separate_cups(self):
        affected = {
            "French Toast",
            "Beef Breakfast Skillet",
            "Chicken Shakshuka",
            "Southwest Beef Taco Bowl",
            "Tandoori Chicken",
            "Garlic Butter Shrimp + Rice",
            "Chicken Enchilada Bake",
            "Loaded Beef Cottage Pie",
            "PRPD Protein Box",
        }
        found = set()
        for meal in menu.MEALS:
            records = [meal.lean] + ([meal.bulk] if meal.bulk else [])
            for record in records:
                excluded = [portion for portion in record.portions if not portion.include_in_menu_macros]
                if excluded:
                    found.add(meal.name)
                    self.assertLess(menu.menu_total(record).calories, menu.total(record).calories)
                    self.assertTrue(all("cup" in portion.note or "dressing" in portion.note or "component:white-garlic-jalapeno-sauce" in portion.note for portion in excluded))
        self.assertEqual(affected, found)

    def test_bulk_exceeds_lean(self):
        for meal in menu.MEALS:
            if meal.bulk:
                lean = menu.total(meal.lean)
                bulk = menu.total(meal.bulk)
                self.assertGreater(bulk.calories, lean.calories, meal.name)
                self.assertGreater(bulk.protein, lean.protein, meal.name)

    def test_powder_is_explicit_grams(self):
        powder_portions = []
        for meal in menu.MEALS:
            records = [meal.lean] + ([meal.bulk] if meal.bulk else [])
            for record in records:
                powder_portions += [
                    portion for portion in record.portions
                    if portion.ingredient in {"whey", "whey_vanilla", "whey_chocolate"}
                ]
        self.assertTrue(powder_portions)
        self.assertTrue(all(portion.unit == "g" for portion in powder_portions))
        self.assertTrue(all(portion.amount > 0 for portion in powder_portions))
        self.assertFalse(any("scoop" in portion.note.lower() for portion in powder_portions))

    def test_target_ranges_are_flagged_only_where_expected(self):
        for meal in menu.MEALS:
            if not menu.nutrition_is_complete(meal.lean):
                continue
            lean = menu.total(meal.lean)
            self.assertLess(lean.calories, 750, meal.name)
            if meal.bulk:
                bulk = menu.total(meal.bulk)
                limit = 1000 if meal.name == "Southwest Beef Taco Bowl" else 950
                self.assertLess(bulk.calories, limit, meal.name)

    def test_caprese_rotini_nutrition_fails_closed_until_serving_grams_are_captured(self):
        record = menu.caprese_protein_pasta_box()
        pasta = next(portion for portion in record.portions if portion.ingredient == "barilla_protein_plus_rotini")
        self.assertEqual(66, pasta.amount)
        self.assertFalse(menu.nutrition_is_complete(record))
        with self.assertRaisesRegex(ValueError, "physical package panel"):
            menu.total(record)

    def test_batch_12_rotation_matches_the_owner_selected_menu(self):
        names = {meal.name for meal in menu.MEALS}
        self.assertTrue({"Egg Bites with Potato Hash", "Chicken Shakshuka", "French Toast", "Beef Breakfast Skillet"}.issubset(names))
        self.assertTrue({"Creamy Chicken Parmesan", "BBQ Chicken Mac & Cheese", "Southwest Beef Taco Bowl", "Tandoori Chicken", "Garlic Butter Shrimp + Rice", "Chicken Enchilada Bake", "Loaded Beef Cottage Pie"}.issubset(names))
        self.assertTrue({"Chicken Tikka Snack Wrap", "PRPD Protein Box", "Caprese Protein Pasta Box"}.issubset(names))
        self.assertNotIn("Cheeseburger Hot Pockets", names)

    def test_reconciled_egg_bites_are_exactly_one_24_well_batch(self):
        lean = menu.egg_bites_reconciled("lean")
        bulk = menu.egg_bites_reconciled("bulk")
        for record, fraction in ((lean, 4 / 24), (bulk, 6 / 24)):
            batter = [portion for portion in record.portions if portion.note == "component:egg-bite-batter"]
            raw_mass = sum(
                portion.amount * (50 if portion.ingredient == "egg" else 1)
                for portion in batter
            )
            self.assertAlmostEqual(raw_mass, 1440 * fraction, places=5)

    def test_white_sauce_allocations_match_batch_12_policy(self):
        expected = {
            "Chicken Shakshuka": 30,
            "Southwest Beef Taco Bowl": 37,
            "Tandoori Chicken": 30,
            "Garlic Butter Shrimp + Rice": 30,
            "Chicken Enchilada Bake": 30,
            "Loaded Beef Cottage Pie": 45,
            "Chicken Tikka Snack Wrap": 25,
        }
        for meal in menu.MEALS:
            for record in [meal.lean] + ([meal.bulk] if meal.bulk else []):
                sauce = [portion for portion in record.portions if "component:white-garlic-jalapeno-sauce" in portion.note]
                self.assertAlmostEqual(sum(portion.amount for portion in sauce), expected.get(meal.name, 0), places=3, msg=meal.name)
                if meal.name == "Chicken Tikka Snack Wrap":
                    self.assertTrue(all(portion.include_in_menu_macros for portion in sauce))
                else:
                    self.assertTrue(all(not portion.include_in_menu_macros for portion in sauce))

    def test_macro_drift_is_reconciled_to_calculator(self):
        expected = {
            "Egg Bites with Potato Hash": ((305, 32), (435, 48)),
            "Loaded Beef Cottage Pie": ((620, 50), (760, 63)),
            "Chicken Tikka Snack Wrap": ((295, 35), None),
        }
        for meal_name, (lean_expected, bulk_expected) in expected.items():
            meal = next(meal for meal in menu.MEALS if meal.name == meal_name)
            self.assertEqual(menu.display(menu.menu_total(meal.lean))[:2], lean_expected)
            if bulk_expected is not None:
                self.assertEqual(menu.display(menu.menu_total(meal.bulk))[:2], bulk_expected)

    def test_peri_peri_is_bone_in_leg_quarter_not_boneless_thigh(self):
        for record in [menu.active.peri_peri("lean"), menu.active.peri_peri("bulk")]:
            ingredients = {portion.ingredient for portion in record.portions}
            self.assertIn("leg_quarter_cooked", ingredients)
            self.assertNotIn("chicken_thigh_cooked", ingredients)

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

    def test_mini_chicken_wrap_uses_one_confirmed_medium_tortilla(self):
        wrap = menu.mini_chicken_wrap()
        tortillas = [portion for portion in wrap.portions if portion.ingredient == "small_tortilla"]
        self.assertEqual(1, len(tortillas))
        self.assertEqual(1, tortillas[0].amount)
        self.assertEqual("each", tortillas[0].unit)
        self.assertEqual((310, 39, 25, 16, 12), menu.display(menu.total(wrap)))

    def test_breakfast_burrito_uses_owner_approved_medium_tortilla_format(self):
        lean = menu.breakfast_burrito("lean")
        bulk = menu.breakfast_burrito("bulk")
        for record, expected_count in ((lean, 2), (bulk, 3)):
            tortillas = [portion for portion in record.portions if portion.ingredient == "small_tortilla"]
            self.assertEqual(1, len(tortillas))
            self.assertEqual(expected_count, tortillas[0].amount)
            self.assertFalse(any(portion.ingredient == "large_tortilla" for portion in record.portions))
        self.assertEqual((465, 52, 45, 31, 20), menu.display(menu.total(lean)))
        self.assertEqual((645, 72, 64, 46, 27), menu.display(menu.total(bulk)))

    def test_chicken_tikka_wrap_separates_raw_marinade_from_shared_white_sauce(self):
        wrap = menu.chicken_tikka_snack_wrap()
        tortillas = [portion for portion in wrap.portions if portion.ingredient == "small_tortilla"]
        marinade = [portion for portion in wrap.portions if portion.note == "component:tikka-marinade"]
        finish = [portion for portion in wrap.portions if "component:white-garlic-jalapeno-sauce" in portion.note]

        self.assertEqual(1, tortillas[0].amount)
        self.assertEqual(20, next(x.amount for x in marinade if x.ingredient == "fage"))
        self.assertAlmostEqual(25 * 28 / 37, next(x.amount for x in finish if x.ingredient == "fage"), places=5)
        self.assertTrue(all(x.include_in_menu_macros for x in marinade + finish))
        self.assertEqual((295, 35, 25, 16, 11), menu.display(menu.total(wrap)))

    def test_every_mashed_potato_build_uses_packaged_instant_flakes(self):
        mashed_builds = {
            "Loaded Beef Cottage Pie": [menu.cottage_pie("lean"), menu.cottage_pie("bulk")],
            "Premium NY Strip Steak": [menu.ny_strip("lean"), menu.ny_strip("bulk")],
        }
        for meal_name, records in mashed_builds.items():
            for record in records:
                ingredients = {portion.ingredient for portion in record.portions}
                self.assertIn("instant_potato_flakes", ingredients, meal_name)
                self.assertNotIn("potato", ingredients, meal_name)

    def test_cottage_pie_mash_contains_no_cottage_cheese(self):
        for record in [menu.cottage_pie("lean"), menu.cottage_pie("bulk")]:
            ingredients = {portion.ingredient for portion in record.portions}
            self.assertNotIn("cottage", ingredients)
            self.assertIn("mozzarella", ingredients)

    def test_enchilada_is_bean_free_in_both_tiers(self):
        for tier, expected in (("lean", (565, 61, 60, 34, 20)), ("bulk", (830, 91, 90, 52, 30))):
            record = menu.chicken_enchilada_bake(tier)
            ingredients = {portion.ingredient for portion in record.portions}
            self.assertNotIn("cannellini_beans", ingredients)
            self.assertNotIn("black_beans", ingredients)
            self.assertIn("corn", ingredients)
            self.assertEqual(menu.display(menu.menu_total(record)), expected)

    def test_batch15_sweet_chili_is_plain_rice_with_october_7_portions(self):
        expected = {
            "lean": (160, 45, (490, 44, 42, 1, 16)),
            "bulk": (210, 60, (650, 58, 55, 2, 21)),
        }
        for tier, (chicken_g, rice_g, macros) in expected.items():
            record = menu.sweet_chili_chicken_plain_rice(tier)
            portions = {portion.ingredient: portion.amount for portion in record.portions}
            self.assertEqual(chicken_g, portions["chicken_thigh_standard_cooked"])
            self.assertEqual(rice_g, portions["rice_dry"])
            self.assertNotIn("mixed_vegetables", portions)
            self.assertEqual(macros, menu.display(menu.menu_total(record)))
            self.assertTrue(any("record the actual cooked batch yield" in note for note in record.assumptions))


if __name__ == "__main__":
    unittest.main()
