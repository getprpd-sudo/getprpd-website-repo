import dataclasses
import importlib
import math
import unittest
import calculate_next_menu as r

before = {key:dataclasses.asdict(value) for key,value in r.active.INGREDIENTS.items()}
t = importlib.import_module("thai_basil_beef")

class ThaiBasilBeefTests(unittest.TestCase):
    def test_import_does_not_rewrite_existing_shared_profiles(self):
        for key, value in before.items():
            self.assertEqual(dataclasses.asdict(r.active.INGREDIENTS[key]),value,key)

    def test_agreed_pilot_ratios_and_beef_yield_are_preserved(self):
        for tier, raw in [("lean",210),("bulk",300)]:
            record=t.thai_basil_beef(tier)
            self.assertEqual(record.portions[0].ingredient,"beef_90_pan")
            self.assertAlmostEqual(record.portions[0].amount,raw*.69)
            for key, grams in t.PILOT_FINISH_G.items():
                self.assertAlmostEqual(t.allocations_g(tier)["beef_finish"][key],grams*raw/500)
            self.assertEqual(t.allocations_g(tier)["rice"][t.RICE_KEY],40 if tier=="lean" else 60)
            self.assertEqual(t.allocations_g(tier)["beans"][t.BEANS_KEY],100 if tier=="lean" else 150)

    def test_component_oil_and_salt_are_separate_without_an_extra_cup(self):
        for tier, oil, salt in [("lean",5.86,.2),("bulk",8.55,.3)]:
            record=t.thai_basil_beef(tier)
            self.assertAlmostEqual(sum(p.amount for p in record.portions if p.ingredient=="avocado_oil"),oil)
            self.assertAlmostEqual(sum(p.amount for p in record.portions if p.ingredient=="salt"),salt)
            self.assertTrue(all(p.include_in_menu_macros for p in record.portions))
        self.assertEqual(t.REQUIRED_SAUCE_CUPS,0)

    def test_manufacturer_fish_sauce_complete_panel_and_allergen(self):
        panel=r.active.INGREDIENTS[t.FISH_SAUCE_KEY].nutrition.scale(18.8/100)
        self.assertAlmostEqual(panel.sodium,1430)
        self.assertAlmostEqual(panel.protein,4)
        self.assertAlmostEqual(panel.calcium,4.3)
        self.assertAlmostEqual(panel.iron,.28)
        self.assertAlmostEqual(panel.potassium,100)
        self.assertIn("FISH (ANCHOVY)",t.ALLERGENS)
        self.assertFalse(t.FISH_SAUCE_PRODUCT["halal_certification_verified"])

    def test_all_fifteen_fields_are_finite_and_scaling_preserves_batch_finish(self):
        for tier in ["lean","bulk"]:
            fields=dataclasses.asdict(t.full_nutrition_estimate(tier))
            self.assertEqual(len(fields),15)
            self.assertTrue(all(math.isfinite(v) and v>=0 for v in fields.values()))
        for key, grams in t.PILOT_FINISH_G.items():
            combined=t.allocations_g("lean")["beef_finish"][key]+t.allocations_g("bulk")["beef_finish"][key]
            self.assertAlmostEqual(combined,grams*(210+300)/500)
        with self.assertRaises(ValueError):t.thai_basil_beef("single")

if __name__=="__main__":unittest.main()
