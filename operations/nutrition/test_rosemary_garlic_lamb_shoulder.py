"""Nutrient/accounting checks for the standalone owner-authorized lamb model."""
import unittest
from dataclasses import fields
import calculate_next_menu as r
import rosemary_garlic_lamb_shoulder as lamb


class LambAccountingTests(unittest.TestCase):
    def test_raw_to_cooked_and_combined_batch(self):
        batch = lamb.production_allocations(3, 2)
        self.assertAlmostEqual(batch["cookedEdibleRequiredGrams"], 900)
        self.assertAlmostEqual(batch["rawShoulderRequiredGrams"] * 7 / 15, 900)
        self.assertAlmostEqual(batch["rawGroceryGrams"]["fairlife_milk"], 340)
        # 3x90g plus2x120g finished beans require 566.67g raw at900/1000.
        self.assertAlmostEqual(batch["rawGroceryGrams"]["green_beans"], 510 / .9)
        self.assertEqual(batch["whole1800gRoastsToPurchase"], 2)

    def test_gravy_fraction_and_oil_are_not_whole_pot_per_plate(self):
        b = lamb.rosemary_garlic_lamb_shoulder("lean")
        grams = lambda key, note: sum(p.amount for p in b.portions
                                    if p.ingredient == lamb.PROFILE_PREFIX + key
                                    and p.note == "component:" + note)
        self.assertAlmostEqual(grams("rendered_lamb_fat_model", "lamb-pan-gravy"),
                               28 * 45 / 650)
        self.assertAlmostEqual(grams("avocado_oil", "lamb-roast-finish"),
                               28 * 160 / 840)
        high, low = lamb.nutrition("lean"), lamb.nutrition("lean", single_fat_pool=True)
        self.assertAlmostEqual(high.fat - low.fat, 28 * 45 / 650)
        self.assertAlmostEqual(high.calories - low.calories, 9 * 28 * 45 / 650)

    def test_full_profiles_are_explicit_and_naturally_nonzero(self):
        expected = {f.name for f in fields(r.Nutrition)}
        for profile in lamb.PROFILE_DATA["profiles"].values():
            self.assertEqual(set(profile["nutrition"]), expected)
            self.assertTrue(all(v >= 0 for v in profile["nutrition"].values()))
        p = lamb.PROFILE_DATA["profiles"]
        self.assertEqual(p["lamb_shoulder_cooked"]["fdcId"], 174876)
        self.assertGreater(p["lamb_shoulder_cooked"]["nutrition"]["trans_fat"], 0)
        self.assertGreater(p["fairlife_milk"]["nutrition"]["potassium"], 0)
        self.assertGreater(p["butter"]["nutrition"]["trans_fat"], 0)
        self.assertIn("sugars", p["rosemary"]["derivedFields"])
        for tier in ("lean", "bulk"):
            self.assertTrue(r.active.nutrition_is_complete(lamb.rosemary_garlic_lamb_shoulder(tier)))

    def test_cost_slope_raw_lamb_once_no_fat_purchase(self):
        keys = lamb.grocery_allocations("lean")
        cat = {k: {"price": 1, "packageSize": 100,
                   "store": "unit-test basis", "confidence": "test"}
               for k in keys if k != "lamb_shoulder_bone_in_raw"}
        cat["meal_container"] = {"price": 1, "packageSize": 1}
        a, b = (lamb.cost_scenario("lean", price, cat) for price in (7.99, 9.99))
        self.assertAlmostEqual(b["directCostUsd"] - a["directCostUsd"],
                               2 * (160 * 15 / 7) / 453.59237)
        self.assertEqual(a["renderedFatIncrementalCostUsd"], 0)
        self.assertNotIn("rendered_lamb_fat_model", keys)

    def test_invalid_tiers_and_counts_fail(self):
        with self.assertRaises(ValueError): lamb.rosemary_garlic_lamb_shoulder("large")
        with self.assertRaises(ValueError): lamb.production_allocations(-1, 0)


if __name__ == "__main__":
    unittest.main()
