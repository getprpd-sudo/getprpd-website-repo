"""Focused conservation/profile/cost checks for the four new Batch18 estimates."""
from dataclasses import asdict
import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"operations"/"nutrition"))
import calculate_next_menu as existing
import batch18_sauces as sauces
import edamame_feta_crunch_box as box

class Batch18RecipeEstimateTests(unittest.TestCase):
    def test_namespaces_preserve_canonical_profiles_and_exact_fage(self):
        before={key:asdict(value) for key,value in existing.active.INGREDIENTS.items() if not key.startswith(sauces.PREFIX)}
        sauces.install_profiles()
        after={key:asdict(value) for key,value in existing.active.INGREDIENTS.items() if not key.startswith(sauces.PREFIX)}
        self.assertEqual(before,after)
        fage=existing.active.INGREDIENTS[sauces.ingredient_key("fage_0")]
        self.assertAlmostEqual(fage.nutrition.protein*1.7,18)
        self.assertAlmostEqual(fage.nutrition.potassium*1.7,260)
        self.assertIn("FAGE",fage.name)
        self.assertEqual(sauces.COST_RATES["fage_0"]["price"],7.69)

    def test_sauce_mass_nutrient_scaling_and_complete_cost(self):
        for key,row in sauces.SAUCES.items():
            self.assertAlmostEqual(sum(row["formula_g"].values()),200)
            cup=sauces.build_sauce(key)
            self.assertAlmostEqual(sum(p.amount for p in cup.portions),40)
            small=asdict(sauces.full_nutrition_estimate(key))
            batch=asdict(sauces.full_nutrition_estimate(key,200))
            self.assertEqual(len(small),15)
            for field,value in small.items():
                self.assertTrue(math.isfinite(value) and value>=0)
                self.assertAlmostEqual(value*5,batch[field])
            cost=sauces.sauce_report(key)["cost_per40g"]
            self.assertEqual(len(cost["ingredients"]),len(row["formula_g"]))
            self.assertAlmostEqual(cost["total"],sum(p["cost"] for p in cost["ingredients"])+.06)
            self.assertEqual(sauces.sauce_report(key)["measured_recovered_g"],None)
        for value in [float("nan"),float("inf"),-1]:
            with self.assertRaises(ValueError):sauces.lemon_tahini(value)

    def test_chosen_box_mass_prepared_basis_allergens_and_cost(self):
        self.assertAlmostEqual(sum(box.FORMULA_G.values()),277.8)
        self.assertEqual(box.FORMULA_G["chickpeas"],60)
        self.assertEqual(box.FORMULA_G["edamame"],100)
        self.assertEqual(box.FORMULA_G["feta"],30)
        nutrients=box.full_nutrition_estimate()
        self.assertGreater(nutrients.protein,20)
        self.assertLess(nutrients.protein,23)
        self.assertGreater(nutrients.calcium,200)
        self.assertGreater(nutrients.iron,3)
        self.assertGreater(nutrients.potassium,600)
        self.assertIn("MILK",box.ALLERGENS)
        self.assertIn("SOY",box.ALLERGENS)
        self.assertEqual(box.SEPARATE_SAUCE_CUPS,0)
        cost=box.cost_estimate()
        self.assertEqual(len(cost["ingredients"]),len(box.FORMULA_G))
        self.assertAlmostEqual(cost["total"],sum(p["cost"] for p in cost["ingredients"])+17.99/50)
        self.assertLess(cost["total"],7.99*.35)
        report=box.recipe_report()
        self.assertFalse(report["physical_tests_completed"])
        self.assertIsNone(report["measured_net_weight_g"])

    def test_mango_uses_oil_free_roland_without_changing_formula(self):
        row=sauces.SAUCES["mango-chipotle-lime"]
        self.assertEqual(row["formula_g"]["chipotle_adobo"],10)
        self.assertEqual(sum(row["formula_g"].values()),200)
        self.assertEqual(row["allergens"],"")
        self.assertIn("cross-contact",row["allergen_advisory"])
        profile=sauces.BRANDED_PROFILES["chipotle_adobo"]
        self.assertIn("041224457805",profile["name"])
        self.assertIn("rolandfoods.com",profile["source"])
        self.assertAlmostEqual(profile["nutrition"].sodium*.3,320)
        self.assertAlmostEqual(profile["nutrition"].protein*.3,1)
        self.assertAlmostEqual(profile["nutrition"].added_sugars*.3,1)
        self.assertEqual(sauces.COST_RATES["chipotle_adobo"]["price"],3)
        self.assertEqual(sauces.COST_RATES["chipotle_adobo"]["status"],"planning")

if __name__=="__main__":unittest.main()
