"""Complete recipe estimates retain actual formula inputs and honest provenance."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'operations'/'nutrition'))
import oven_baked_popcorn_chicken as p

class PopcornNutritionTests(unittest.TestCase):
    def test_formula_and_model_are_preserved(self):
        self.assertEqual(p.RAW_EQUIVALENT_GRAMS,160)
        self.assertEqual(p.FORMULA_G,{"chicken_thigh_cooked":120,p.COATING_KEY:25,"flour":5,
            "egg_white":15,"avocado_oil":3,"garlic_powder":1,"paprika":.5,"black_pepper":.2,"salt":.75})
        self.assertIsNone(p.RAW_MEAT_PLAN['measuredYieldFraction'])
        self.assertFalse(p.DIP_INCLUDED)

    def test_complete_fields_and_fat_rounding(self):
        values=p.full_label_nutrition()
        self.assertEqual(len(values),15)
        self.assertTrue(all(isinstance(v,(int,float)) and v>=0 for v in values.values()))
        # The nonzero natural trans-fat input must round to0 below0.5g;
        # saturated fat below5g rounds to the nearest0.5g, not a false tenth.
        self.assertGreater(p.full_nutrition_estimate().trans_fat,0)
        self.assertEqual(values['transFat'],0)
        self.assertEqual(values['satFat'],3)
        self.assertEqual({k:values[k] for k in ('calories','protein','carbs','fat')},
            {'calories':360,'protein':34,'carbs':26,'fat':13})

    def test_supplements_repair_missing_micronutrients_without_shared_profile_edits(self):
        base=p.r.active.INGREDIENTS['flour'].nutrition
        self.assertEqual(base.calcium,0)
        full=p.full_nutrition_estimate()
        # Chicken+cereal alone already provide over8mg Fe; flour/garlic/pepper
        # contributions must not vanish into the old placeholder zeros.
        self.assertGreater(full.iron,8.9)
        self.assertGreater(full.potassium,414)
        self.assertGreater(full.calcium,15)
        self.assertEqual(base.calcium,0)

    def test_complete_estimate_does_not_claim_physical_measurements(self):
        tier=p.website_tier()
        self.assertTrue(tier['nutritionComplete'])
        self.assertFalse(tier['netWeightVerified'])
        self.assertFalse(tier['nutritionProvenance']['physicalRetentionMeasured'])
        self.assertFalse(p.COATING_PRODUCT['physical_package_verified'])

if __name__=='__main__':
    unittest.main()
