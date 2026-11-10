"""Current-menu routing and cost proof regressions, not taste/yield approval."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch, Mock


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

    def test_exact_current_recipe_and_tier_parity(self):
        payload = COSTS.generated_cost_payload(self.nutrition)
        self.assertEqual(14, payload["batchNumber"])
        self.assertEqual(28, len(self.rows))
        self.assertEqual(30, len(payload["directCosts"]))
        expected = set()
        for item in COSTS.configured_items(self.nutrition.config):
            tiers = [v["label"] for v in item["variants"]] if item.get("variants") else (["Lean", "Bulk"] if item.get("bulkMacros") else ["Single"])
            expected.update(f"{item['name'].lower()}|{tier.lower()}" for tier in tiers)
        self.assertEqual(expected, set(payload["directCosts"]))
        self.assertEqual(expected, set(payload["provisionalCosts"]))
        self.assertIn("not measured", payload["costBasis"])

    def test_registry_uses_current_component_standard_not_historical_chicken(self):
        for name in ("Mexican Streetcorn Chicken Bowl", "Mediterranean Chicken Bowl"):
            meal = next(m for m in self.nutrition.MEALS if m.name == name)
            for record, chicken, rice in ((meal.lean,160,45),(meal.bulk,210,60)):
                portions = {p.ingredient:p.amount for p in record.portions}
                self.assertEqual(chicken, portions["chicken_thigh_standard_cooked"])
                self.assertEqual(rice, portions["rice_dry"])

    def test_batch15_plain_rice_sweet_chili_cost_uses_current_sources(self):
        expected = {"lean": 2.62, "bulk": 3.34}
        for tier, expected_direct in expected.items():
            build = self.nutrition.registry.recipe("Sweet Chili Chicken with Rice", tier)
            ingredients = {portion.ingredient for portion in build.portions}
            self.assertNotIn("mixed_vegetables", ingredients)
            direct = sum(COSTS.portion_cost(portion)[0] for portion in build.portions)
            direct += COSTS.packaging_cost("Sweet Chili Chicken with Rice", tier.title())
            self.assertEqual(expected_direct, round(direct, 2))

    def test_tiramisu_cost_uses_successful_five_cup_formula(self):
        recipe = self.nutrition.registry.r.tiramisu_complete()
        food = sum(COSTS.portion_cost(portion)[0] for portion in recipe.portions)
        direct = food + COSTS.packaging_cost("High Protein Tiramisu", "Single", self.nutrition.registry)
        self.assertEqual(2.43, round(food, 2))
        self.assertEqual(2.82, round(direct, 2))
        self.assertEqual(0, next(p.amount for p in recipe.portions if p.ingredient == "instant_coffee"))

    def test_every_registry_ingredient_has_a_cost_basis(self):
        for name, (_, single) in self.nutrition.registry.RECIPES.items():
            for tier in (["single"] if single else ["lean", "bulk"]):
                for portion in self.nutrition.registry.recipe(name, tier).portions:
                    self.assertIn(portion.ingredient, COSTS.COSTS, name)
                    self.assertGreaterEqual(COSTS.portion_cost(portion)[0], 0)

    def test_every_build_is_positive_with_exact_config_price(self):
        for row in self.rows:
            self.assertGreater(row["direct"], 0, row["meal"])
            self.assertEqual(row["selling_price"], COSTS.tier_price(row["meal"], row["tier"]))
            self.assertAlmostEqual(row["direct"], row["food"] + row["packaging"])
        addon_rows = [r for r in self.rows if r["category"] == "Add-on"]
        self.assertEqual(3, len(addon_rows))
        self.assertTrue(all(r["selling_price"] == 7.99 for r in addon_rows))
        with self.assertRaisesRegex(ValueError, "No current selling price"):
            COSTS.tier_price("Former nonexistent meal", "Single")

    def test_bundle_uses_public_and_planner_components_and_five_packagings(self):
        rows = COSTS.bundle_rows(self.nutrition)
        self.assertEqual(2, len(rows))
        def direct(name):
            build = self.nutrition.registry.recipe(name, "lean")
            return sum(COSTS.portion_cost(p)[0] for p in build.portions) + COSTS.packaging_cost(name, "Lean")
        mediterranean = direct("Mediterranean Chicken Bowl")
        shakshuka = direct("Chicken Shakshuka")
        self.assertAlmostEqual(3 * mediterranean + 2 * shakshuka, rows[0]["direct"])
        self.assertAlmostEqual(2 * mediterranean + 3 * shakshuka, rows[1]["direct"])

    def test_current_cup_assignments_and_packaging_sum_once(self):
        expected = {
            "French Toast": 1, "Chicken Shakshuka": 1,
            "Cheesy Achiote Chicken Tacos": 2,
            "Garlic Butter Wild Argentine Shrimp + Rice": 1,
            "Tandoori Chicken": 1, "Mediterranean Chicken Bowl": 1,
            "Premium NY Strip Steak": 1, "Caprese Protein Pasta Box": 1,
            "High-Protein Beef Kofta & Roasted Vegetables": 1,
            "Custom Lebanese-Style Chicken Breast": 2,
        }
        for name, count in expected.items():
            lines = COSTS.packaging_cost_lines(name, "Lean")
            self.assertEqual(count, sum(l["quantity"] for l in lines if l["item"] == "Sauce cup with lid"), name)
            self.assertAlmostEqual(COSTS.packaging_cost(name, "Lean"), sum(l["quantity"] * l["unit_cost"] for l in lines))
        pancakes = COSTS.packaging_cost_lines("Blueberry Cheesecake Protein Pancakes", "Lean")
        self.assertEqual(2, sum(l["quantity"] for l in pancakes if "cups" in l["item"]))
        dessert = COSTS.packaging_cost_lines("Chocolate-Dipped Cookie Dough Balls", "Single")
        self.assertEqual("Dessert box allowance", dessert[0]["item"])

    def test_raw_yield_conversion_and_reserve_applied_once(self):
        p = self.nutrition.registry.r.p
        self.assertAlmostEqual(100 / COSTS.RAW_YIELD["chicken_thigh_cooked"] * 1.05, COSTS.costed_quantity(p("chicken_thigh_cooked", 100)))
        self.assertAlmostEqual(160 / .688 * 1.05, COSTS.costed_quantity(p("chicken_thigh_standard_cooked", 160)))
        self.assertAlmostEqual(105, COSTS.costed_quantity(p("pink_salmon_raw", 100)))
        self.assertEqual(100, COSTS.costed_quantity(p("rice_dry", 100)))

    def test_receipt_prices_do_not_relabel_beef_grade(self):
        self.assertAlmostEqual(3.29 / 453.592, COSTS.COSTS["chicken_thigh_cooked"].cost)
        self.assertAlmostEqual(.94 / 453.592, COSTS.COSTS["onion"].cost)
        self.assertIs(COSTS.active_costs.COSTS["beef_90_baked"], COSTS.COSTS["beef_90_baked"])
        self.assertNotAlmostEqual(4.99 / 453.592, COSTS.COSTS["beef_96_raw"].cost)
        self.assertAlmostEqual(COSTS.catalog["beef_96_raw"]["price"] / COSTS.catalog["beef_96_raw"]["packageSize"], COSTS.COSTS["beef_96_raw"].cost)
        self.assertEqual("planning", COSTS.COSTS["beef_96_raw"].confidence)
        self.assertEqual("planning", COSTS.COSTS["ny_strip_cooked"].confidence)

    def test_unknown_batch_name_tier_and_duplicate_id_fail_closed(self):
        for mutate, error in [
            (lambda c: c["batch"].update(number=15), "registry"),
            (lambda c: c["menu"]["mains"][0].update(name="Unknown Meal"), "exact current recipe"),
            (lambda c: c["menu"]["mains"][0].pop("bulkMacros"), "tier mismatch"),
            (lambda c: c["plannerOnly"][0].update(id="m1"), "Duplicate configured id"),
        ]:
            config = copy.deepcopy(self.nutrition.config)
            mutate(config)
            with self.assertRaisesRegex(ValueError, error):
                COSTS.load_nutrition_module(config)

    def test_batch13_registry_path_remains_available_for_historical_rebuilds(self):
        config = copy.deepcopy(self.nutrition.config)
        config["batch"]["number"] = 13
        config["menu"] = {"exclusives": [], "breakfasts": [], "mains": [
            {"id":"m8", "name":"Boy Kibble", "category":"beef", "bulkMacros": {"cal": 1}}
        ], "desserts": [], "addons": []}
        config["plannerOnly"] = []
        module = COSTS.load_nutrition_module(config)
        self.assertIn("Boy Kibble", module.registry.RECIPES)
        self.assertEqual(["Boy Kibble"], [meal.name for meal in module.MEALS])

    def test_bad_bundle_or_missing_cost_cannot_overwrite_outputs(self):
        config = copy.deepcopy(self.nutrition.config)
        config["menu"]["exclusives"][0]["variants"][0]["components"][0]["id"] = "unknown"
        module = COSTS.load_nutrition_module(config)
        with patch.object(COSTS, "load_nutrition_module", return_value=module), patch.object(Path, "write_text") as write:
            with self.assertRaisesRegex(ValueError, "Unknown bundle component"):
                COSTS.main()
            write.assert_not_called()
        with patch.dict(COSTS.COSTS, {}, clear=True), patch.object(Path, "write_text") as write:
            with self.assertRaisesRegex(RuntimeError, "Missing cost inputs"):
                COSTS.main()
            write.assert_not_called()

    def test_bundle_wrong_count_and_tier_fail_closed(self):
        for change, error in [(dict(qty=4), "count mismatch"), (dict(tier="Single"), "component tier")]:
            config = copy.deepcopy(self.nutrition.config)
            config["menu"]["exclusives"][0]["variants"][0]["components"][0].update(change)
            with self.assertRaisesRegex(ValueError, error):
                COSTS.bundle_rows(COSTS.load_nutrition_module(config))

    def test_report_distinguishes_model_receipts_and_actual_margin(self):
        report = COSTS.report(self.nutrition)
        for text in ("## Ingredient-Level Cost Proof", "## Order-Level and Weekly Costs", "Purchase-cost quantity", "$285.10 shopping cash", "No actual weekly margin", "Historical positional MEALS are not used"):
            self.assertIn(text, report)

    def test_current_custom_costs_use_registry_not_batch8_constants(self):
        payload = COSTS.generated_cost_payload(self.nutrition)
        for item in self.nutrition.config["plannerOnly"]:
            name = item["name"]
            recipe = self.nutrition.registry.recipe(name, "lean")
            expected = round(sum(COSTS.portion_cost(p)[0] for p in recipe.portions) + COSTS.packaging_cost(name, "Lean") + 1e-9, 2)
            for alias in [name, *item.get("aliases", [])]:
                self.assertEqual(expected, payload["plannerOnlyCosts"][f"{alias.lower()}|lean"])

    def test_rollover_preserves_exact_prior_payload_without_recosting(self):
        previous = {"batchNumber": 13, "directCosts": {"test historical build|lean": 7.123}, "fingerprint": "original-test-evidence"}
        history_file = Mock()
        history_file.read_text.return_value = json.dumps({"schemaVersion": 1, "snapshots": {}, "unavailableBatches": {"13": "unknown"}})
        current_file = Mock()
        current_file.exists.return_value = True
        current_file.read_text.return_value = json.dumps(previous)
        with patch.object(COSTS, "HISTORY_JSON_PATH", history_file), patch.object(COSTS, "OUTPUT_JSON_PATH", current_file):
            retained = COSTS.retained_history({"batchNumber": 14})
        self.assertEqual(previous, retained["snapshots"]["13"])
        self.assertNotIn("13", retained["unavailableBatches"])

    def test_conflicting_existing_history_is_never_replaced(self):
        history_file = Mock()
        history_file.read_text.return_value = json.dumps({"schemaVersion": 1, "snapshots": {"12": {"batchNumber": 12, "directCosts": {"dish|lean": 2}}}})
        current_file = Mock()
        current_file.exists.return_value = True
        current_file.read_text.return_value = json.dumps({"batchNumber": 12, "directCosts": {"dish|lean": 3}})
        with patch.object(COSTS, "HISTORY_JSON_PATH", history_file), patch.object(COSTS, "OUTPUT_JSON_PATH", current_file):
            with self.assertRaisesRegex(ValueError, "Refusing to replace"):
                COSTS.retained_history({"batchNumber": 13})


if __name__ == "__main__":
    unittest.main()
