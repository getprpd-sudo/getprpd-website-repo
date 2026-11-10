"""Incomplete package panels must block nutrition without hiding library recipes."""
import unittest

import audit_recipe_system as audit


class RecipeSystemAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result = audit.audit()

    def test_inventory_survives_explicit_nutrition_hold(self):
        self.assertFalse(self.result['errors'])
        self.assertEqual(self.result['counts']['controlledRecipes'], 72)
        self.assertEqual(self.result['counts']['tierBuilds'], 121)
        self.assertTrue(set(audit.current.RECIPES).issubset(
            {item['name'] for item in self.result['recipes']}))
        caprese = next(item for item in self.result['recipes']
                       if item['name'] == 'Caprese Protein Pasta Box')
        self.assertIsNone(caprese['tiers']['single']['menuEstimate']['calories'])
        self.assertTrue(caprese['tiers']['single']['purchasingInputs'])
        self.assertIn('Hold:', caprese['status'])

    def test_hold_is_reported_and_nutrition_still_fails_closed(self):
        hold = next(item for item in self.result['nutritionBlocks']
                    if item['name'] == 'Caprese Protein Pasta Box')
        self.assertIn('serving mass', hold['reason'])
        self.assertIn('Nutrition release holds', audit.report(self.result))
        with self.assertRaisesRegex(ValueError, 'not scalable'):
            audit.m.total(audit.m.caprese_protein_pasta_box())


if __name__ == '__main__':
    unittest.main()
