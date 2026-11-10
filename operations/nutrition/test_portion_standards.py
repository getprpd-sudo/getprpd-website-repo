"""Focused regression checks for the October 7 component-meal standard."""

import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import calculate_next_menu as menu
import current_recipe_registry as current
import meal_portion_standards as policy
from generate_next_menu_label_data import MENU_SECTIONS, generate_payload, load_order_config
from generate_production_data import build_lines, generate


class PortionStandardTests(unittest.TestCase):
    def test_measured_chicken_yield_and_raw_pull(self):
        self.assertAlmostEqual(policy.CHICKEN_MEASURED_YIELD, 0.688)
        self.assertAlmostEqual(policy.chicken_raw_pull_g("lean"), 232.5581395)
        self.assertAlmostEqual(policy.chicken_raw_pull_g("bulk"), 305.2325581)

    def test_direct_chicken_library_uses_cooked_control_and_standard_rice(self):
        factories = [
            menu.sweet_chili_chicken,
            menu.streetcorn_updated,
            menu.harissa_honey_chicken,
            menu.mediterranean_chicken_bowl,
            menu.chinese_bok_choy_chicken,
            menu.halal_cart_complete,
        ]
        for factory in factories:
            for tier in ("lean", "bulk"):
                record = factory(tier)
                chicken = [p for p in record.portions if p.ingredient == "chicken_thigh_standard_cooked"]
                rice = [p for p in record.portions if p.ingredient == "rice_dry"]
                self.assertEqual([p.amount for p in chicken], [policy.CHICKEN_COOKED_G[tier]])
                self.assertEqual([p.amount for p in rice], [policy.RICE_DRY_G[tier]])

    def test_current_batch_production_uses_measured_raw_pull(self):
        data = generate()
        for meal_id in ("m1", "m6"):
            for tier in ("lean", "bulk"):
                lines = data["meals"][meal_id]["tiers"][tier]["ingredients"]
                chicken = next(row for row in lines if row["key"] == "chicken_thigh_raw")
                rice = next(row for row in lines if row["key"] == "rice_dry")
                self.assertEqual(chicken["sourceKey"], "chicken_thigh_standard_cooked")
                self.assertAlmostEqual(chicken["amount"], policy.chicken_raw_pull_g(tier), places=4)
                self.assertIn("measured 68.8%", chicken["note"])
                self.assertEqual(rice["amount"], policy.RICE_DRY_G[tier])

    def test_boy_kibble_uses_standard_90_10_beef_rice_and_vegetables(self):
        for tier in ("lean", "bulk"):
            record = menu.active.halal_boy(tier)
            lines = build_lines(record)
            beef = next(row for row in lines if row["key"] == "beef_90_raw")
            rice = next(row for row in lines if row["key"] == "rice_dry")
            vegetables = sum(p.amount for p in record.portions if p.ingredient in {"lettuce", "tomato"})
            self.assertEqual(beef["amount"], policy.GROUND_BEEF_90_RAW_G[tier])
            self.assertEqual(rice["amount"], policy.RICE_DRY_G[tier])
            self.assertEqual(vegetables, policy.VEGETABLE_G[tier])

    def test_format_exceptions_do_not_inherit_component_chicken_identity(self):
        exception_builds = [
            current.recipe("Cheesy Achiote Chicken Tacos", "lean"),
            current.recipe("Meatball Arrabbiata Pasta", "lean"),
            current.recipe("Tandoori Chicken", "lean"),
            current.recipe("Chicken Tikka Snack Wrap", "single"),
            current.recipe("BBQ Chicken Lavash Flatbread", "single"),
        ]
        self.assertTrue(all(
            all(p.ingredient != "chicken_thigh_standard_cooked" for p in record.portions)
            for record in exception_builds
        ))

    def test_nouman_remains_actual_96_4(self):
        record = current.recipe("High-Protein Beef Kofta & Roasted Vegetables", "lean")
        keys = {p.ingredient for p in record.portions}
        self.assertIn("beef_96_raw", keys)
        self.assertNotIn("beef_90_pan", keys)

    def test_current_label_generator_uses_current_registry(self):
        config = copy.deepcopy(load_order_config())
        for section, _category, tiers in MENU_SECTIONS:
            for item in config["menu"][section]:
                for tier in tiers:
                    values = menu.display(menu.menu_total(current.recipe(item["name"], tier)))
                    macros = dict(zip(("cal", "protein", "carbs", "fiber", "fat"), values))
                    item["bulkMacros" if tier == "bulk" else "macros"] = macros
        payload = generate_payload(config)
        self.assertEqual(payload["production"]["batchNumber"], 14)
        self.assertEqual(payload["meals"]["m1"]["tiers"]["lean"]["menuNutrition"]["calories"], 640)
        self.assertEqual(payload["meals"]["m6"]["tiers"]["bulk"]["menuNutrition"]["calories"], 825)


if __name__ == "__main__":
    unittest.main()
