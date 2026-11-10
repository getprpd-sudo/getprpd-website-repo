import dataclasses
import importlib.util
import os
from pathlib import Path
import sys
import unittest

repo = Path(os.environ.get("PRPD_REPO_ROOT", Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(repo / "operations/nutrition"))
import calculate_next_menu as r
import meal_portion_standards as standards

source = Path(os.environ.get("PRPD_ORZO_MODULE", repo / "operations/nutrition/lemon_herb_chicken_orzo.py"))
before = {k: dataclasses.asdict(v) for k,v in r.active.INGREDIENTS.items()}
spec = importlib.util.spec_from_file_location("orzo_candidate_under_test", source)
orzo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(orzo)

class OrzoCandidateTest(unittest.TestCase):
    def test_existing_ingredient_profiles_are_not_rewritten(self):
        for key,value in before.items():
            self.assertEqual(value, dataclasses.asdict(r.active.INGREDIENTS[key]), key)

    def test_exact_brand_serving_mass_and_wheat_basis(self):
        self.assertEqual(orzo.ORZO_PRODUCT["serving_g"],56)
        self.assertEqual(orzo.ORZO_PRODUCT["retail_gtin"],"00076808513981")
        self.assertEqual(orzo.ORZO_PRODUCT["contains"],["wheat"])
        self.assertFalse(orzo.ORZO_PRODUCT["physical_panel_verified"])
        self.assertAlmostEqual(r.active.INGREDIENTS[orzo.ORZO_KEY].nutrition.calories*56/100,200)
        self.assertAlmostEqual(r.active.INGREDIENTS[orzo.ORZO_KEY].nutrition.fiber*56/100,3)

    def test_oil_salt_and_other_ingredient_allocations_conserve_mass(self):
        for tier,formula in orzo.FORMULA_G.items():
            allocated={}
            for part in orzo.ALLOCATIONS_G[tier].values():
                for key,g in part.items():allocated[key]=allocated.get(key,0)+g
            for key,g in formula.items():
                if key!="chicken_thigh_standard_cooked":self.assertAlmostEqual(allocated[key],g,msg=tier+key)
            self.assertAlmostEqual(orzo.raw_chicken_pull_g(tier)*standards.CHICKEN_MEASURED_YIELD,formula["chicken_thigh_standard_cooked"])

    def test_tier_macros_use_dry_orzo_and_cooked_thigh_once(self):
        expected={"lean":(527.9322857142857,46.6916,41.9716,4.442114285714286),"bulk":(700.9697142857144,61.4318,55.9851,5.936985714285714)}
        for tier,(cal,p,carb,fiber) in expected.items():
            build=orzo.lemon_herb_chicken_orzo(tier)
            n=r.total(build)
            for actual,want in [(n.calories,cal),(n.protein,p),(n.carbs,carb),(n.fiber,fiber)]:self.assertAlmostEqual(actual,want,places=6)
            self.assertEqual(len([x for x in build.portions if x.ingredient=="chicken_thigh_standard_cooked"]),1)
            self.assertTrue(any("actual packed weight" in note for note in build.assumptions))
        with self.assertRaises(ValueError):orzo.lemon_herb_chicken_orzo("single")

if __name__=="__main__":unittest.main(verbosity=2)
