"""Regression checks for actual ingredient identity and whole-library coverage."""
import unittest
from dataclasses import replace

import audit_recipe_system as audit
import batch13_recipes as b13
import calculate_next_menu as m
import current_recipe_registry as current
from generate_next_menu_label_data import generate_payload, ingredient_statement, tier_data
from generate_production_data import build_lines, generate


class RecipeSystemTests(unittest.TestCase):
    def test_nouman_actual_grade_survives_recipe_and_production(self):
        record = current.recipe('High-Protein Beef Kofta & Roasted Vegetables', 'lean')
        beef = [p for p in record.portions if p.ingredient.startswith('beef_')]
        self.assertEqual([(p.ingredient,p.amount) for p in beef], [('beef_96_raw',330)])
        lines = build_lines(record)
        self.assertEqual([r['key'] for r in lines if r['station'] == 'Beef'], ['beef_96_raw'])
        self.assertEqual(generate()['meals']['p1']['tiers']['lean']['ingredients'], lines)

    def test_nouman_current_sauce_allocations_are_customer_specific(self):
        kofta = current.recipe('High-Protein Beef Kofta & Roasted Vegetables', 'lean')
        chicken = current.recipe('Custom Lean Chicken Mince', 'lean')
        self.assertAlmostEqual(sum(p.amount for p in kofta.portions if p.note == 'component:batch13-sweet-heat'), 90)
        self.assertAlmostEqual(sum(p.amount for p in chicken.portions if p.note == 'component:batch13-sweet-heat'), 45)
        self.assertAlmostEqual(sum(p.amount for p in chicken.portions if p.note == 'component:lebanese-dressing'), 15)
        self.assertEqual(current.service('High-Protein Beef Kofta & Roasted Vegetables')[0]['cupsPerMeal'], 2)
        self.assertEqual(sum(row['cupsPerMeal'] for row in current.service('Custom Lean Chicken Mince')), 2)

    def test_nouman_nutrition_uses_actual_96_panel_not_90_conversion(self):
        record = b13.recipe('High-Protein Beef Kofta & Roasted Vegetables', 'lean')
        rest = replace(record, portions=[p for p in record.portions if p.ingredient != 'beef_96_raw'])
        expected_beef = m.active.INGREDIENTS['beef_96_raw'].nutrition
        result = m.total(record)
        baseline = m.total(rest)
        for nutrient in ['calories','protein','fat']:
            self.assertAlmostEqual(getattr(result,nutrient)-getattr(baseline,nutrient),
                                   getattr(expected_beef,nutrient)*3.3, places=6)

    def test_standard_beef_is_not_converted_to_custom_grade(self):
        for name in ['Boy Kibble','Beef Seekh Kabab Shawarma']:
            for tier in ['lean','bulk']:
                keys = {r['key'] for r in build_lines(b13.recipe(name,tier))}
                self.assertIn('beef_90_raw',keys)
                self.assertNotIn('beef_96_raw',keys)

    def test_current_ingredients_and_macros_agree_on_96_4(self):
        record = current.recipe('High-Protein Beef Kofta & Roasted Vegetables', 'lean')
        kofta = tier_data(record, 'Lean')
        self.assertIn('96/4 lean ground beef',kofta['ingredients'])
        self.assertNotIn('90/10',kofta['ingredients'])
        self.assertIn('onion',kofta['ingredients'])
        self.assertIn('jalapeno',kofta['ingredients'])
        self.assertEqual(kofta['menuNutrition']['calories'],530)
        self.assertEqual(kofta['menuNutrition']['protein'],75)

    def test_current_label_release_uses_owner_approved_estimated_weights(self):
        payload = generate_payload()
        for meal_id in ['b4', 'm2', 'a3']:
            for tier in payload['meals'][meal_id]['tiers'].values():
                self.assertEqual(tier['netWeightStatus'], 'estimated')
                self.assertTrue(tier['netWeight'].startswith('Est. '))
                self.assertNotIn('requiresPackoutWeight', tier)

    def test_nouman_label_uses_owner_approved_meal_only_benchmark(self):
        kofta = generate_payload()['meals']['p1']['tiers']['lean']
        self.assertEqual(kofta['nutrition'], kofta['menuNutrition'])
        self.assertEqual(kofta['nutrition']['calories'], 530)
        self.assertEqual(kofta['nutrition']['protein'], 75)
        self.assertEqual(kofta['nutrition']['carbs'], 21)
        self.assertEqual(kofta['nutrition']['fat'], 16)
        self.assertIn('separate sauce cup excluded', kofta['nutritionBasis'])

    def test_nouman_kachumber_is_identical_for_all_six_meals(self):
        expected = {
            'cucumber': 100, 'tomato': 70, 'red_onion': 25, 'lemon': 4,
            'cilantro': 3, 'jalapeno': 3, 'salt': 0.525, 'black_pepper': 0.20125,
        }
        for name in ['High-Protein Beef Kofta & Roasted Vegetables', 'Custom Lean Chicken Mince']:
            record = current.recipe(name, 'lean')
            actual = {p.ingredient:p.amount for p in record.portions if p.note == 'component:nouman-kachumber'}
            self.assertEqual(actual, expected)
        chicken = current.recipe('Custom Lean Chicken Mince', 'lean')
        self.assertEqual(sum(p.amount for p in chicken.portions if p.ingredient == 'water'), 60)

    def test_current_lebanese_copy_does_not_claim_omitted_salad(self):
        record = current.recipe('Custom Lebanese-Style Chicken Breast', 'lean')
        ingredients = ingredient_statement(record)
        self.assertNotIn('lettuce',ingredients)
        self.assertNotIn('cucumber',ingredients)
        self.assertTrue(any('lemon-mustard-garlic dressing' in note for note in record.assumptions))

    def test_current_required_cups_have_permanent_service_records(self):
        expected = {
            'Strawberry Cheesecake Protein Pancakes': [
                ('Strawberry-cheesecake topping', 1),
                ('Sugar-free maple syrup', 1),
            ],
            'PRPD Beef Bacon Breakfast Sandwich': [('PRPD Sweet Heat Sauce', 1)],
            'Custom Lebanese-Style Chicken Breast': [
                ('Lemon-garlic dressing', 1),
                ('PRPD Sweet Heat Sauce', 1),
            ],
        }
        generated = generate()['meals']
        meal_ids = {'Strawberry Cheesecake Protein Pancakes': 'b1',
                    'PRPD Beef Bacon Breakfast Sandwich': 'b2',
                    'Custom Lebanese-Style Chicken Breast': 'p3'}
        for name, cups in expected.items():
            actual = [(row['name'], row['cupsPerMeal']) for row in current.service(name)]
            self.assertEqual(actual, cups)
            generated_cups = generated[meal_ids[name]]['service']['sideCupComponents']
            self.assertEqual([(row['name'], row['cupsPerMeal']) for row in generated_cups], cups)

    def test_october_19_owner_no_cup_corrections(self):
        no_cup_meals = [
            'Cheesy Achiote Chicken Tacos',
            'Tandoori Chicken',
            'Mediterranean Chicken Bowl',
            'PRPD Protein Box',
            'Chicken Shakshuka',
        ]
        for name in no_cup_meals:
            self.assertEqual(current.service(name), [], name)
            for tier in current.tiers_for(name):
                record = current.recipe(name, tier)
                side_sauce = [p for p in record.portions if not p.include_in_menu_macros and 'sauce' in p.note.lower()]
                self.assertEqual(side_sauce, [], name)

    def test_caprese_dressing_is_drizzled_and_included(self):
        record = current.recipe('Caprese Protein Pasta Box', 'lean')
        dressing = [p for p in record.portions if p.note == 'component:caprese-dressing']
        self.assertAlmostEqual(sum(p.amount for p in dressing), 20)
        self.assertTrue(all(p.include_in_menu_macros for p in dressing))
        self.assertEqual(current.service('Caprese Protein Pasta Box'), [])
        self.assertTrue(any('drizzle' in note.lower() and 'no' in note.lower() and 'cup' in note.lower()
                            for note in record.assumptions))

    def test_steak_and_shrimp_required_service_are_preserved(self):
        self.assertEqual(current.service('Premium NY Strip Steak')[0]['cupsPerMeal'], 1)
        self.assertEqual(current.service('Garlic Butter Wild Argentine Shrimp + Rice')[0]['cupsPerMeal'], 1)

    def test_current_sweet_heat_uses_sriracha_only(self):
        for name in current.RECIPES:
            for tier in current.tiers_for(name):
                record = current.recipe(name, tier)
                self.assertNotIn('Valentina', ' '.join(record.assumptions), name)
                self.assertNotIn('hot_sauce', {p.ingredient for p in record.portions}, name)
        formulas = current.STANDALONE_SAUCE_FORMULAS
        self.assertEqual([row['key'] for row in formulas['sweet-heat']['ingredients']][-1], 'sriracha')
        for formula in formulas.values():
            self.assertAlmostEqual(sum(row['grams'] for row in formula['ingredients']), 45)
        self.assertTrue(formulas['honey-barbecue-mustard']['recipeRequiredOnly'])
        self.assertEqual(generate()['sauceFormulas'], formulas)

    def test_every_current_recipe_has_one_sauce_classification(self):
        required = {
            'Strawberry Cheesecake Protein Pancakes',
            'PRPD Beef Bacon Breakfast Sandwich',
            'French Toast',
            'Garlic Butter Wild Argentine Shrimp + Rice',
            'Premium NY Strip Steak',
            'High-Protein Beef Kofta & Roasted Vegetables',
            'Custom Lean Chicken Mince',
            'Custom Lebanese-Style Chicken Breast',
        }
        optional = {
            'Egg Bites with Potato Hash', 'Grilled Cheese Breakfast Burrito',
            'Breakfast Quesadilla',
            'Beef Breakfast Skillet', 'Creamy Cajun Chicken Pasta',
            'Chicken Enchilada Bake', 'High-Protein Beef Lasagna',
            'Southwest Beef Taco Bowl', 'Lemon Pepper Tilapia with Garlic Potatoes',
            'Braised Beef Short Rib', 'Halal Cart Chicken + Yellow Rice',
            'Mexican Streetcorn Chicken Bowl', 'Cheesy Achiote Chicken Tacos',
            'Meatball Arrabbiata Pasta', 'Tandoori Chicken',
            'Mediterranean Chicken Bowl', 'PRPD Protein Box',
            'Caprese Protein Pasta Box', 'Chicken Shakshuka',
            'Sweet Chili Chicken with Rice', 'Chicken Tikka Snack Wrap',
            'Buffalo Chicken Pinwheels', 'Mediterranean Chicken Hummus Box',
            'BBQ Chicken Lavash Flatbread', 'Butter Chicken',
            'Loaded Buffalo Chicken Potato', 'Beef Seekh Kabab Shawarma',
            'Hot Honey Chicken Sliders',
        }
        no_prompt = {
            'Blueberry Vanilla Protein Baked Oatmeal Squares',
            'Baked Strawberry-Lemon Protein Cheesecake',
            'Chocolate Oreo Mousse', 'High Protein Tiramisu',
            'Chocolate Peanut Butter Protein Brownie',
            'Oreo Protein Cheesecake Cup', 'Banana Cream Pie Cup',
            'Chocolate-Dipped Cookie Dough Balls',
        }
        self.assertFalse(required & optional or required & no_prompt or optional & no_prompt)
        self.assertEqual(required | optional | no_prompt, set(current.RECIPES))
        self.assertEqual(required, set(current.SERVICE))

    def test_current_short_rib_uses_idahoan_packaged_mash(self):
        for tier, finished_mash in [('lean', 180), ('bulk', 240)]:
            record = current.recipe('Braised Beef Short Rib', tier)
            ingredients = {portion.ingredient for portion in record.portions}
            self.assertIn('instant_potato_flakes', ingredients)
            self.assertNotIn('potato', ingredients)
            mash = [portion for portion in record.portions if 'component:short-rib-mash' in portion.note]
            self.assertAlmostEqual(sum(portion.amount for portion in mash), finished_mash * 440 / 420, places=4)
            self.assertTrue(any('Idahoan Original mash on Prep Day' in note for note in record.assumptions))
            self.assertIn('garlic_powder', ingredients)

    def test_october_19_second_pass_sodium_reductions_are_in_current_recipes(self):
        def amount(name, tier, ingredient, note=''):
            portions = current.recipe(name, tier).portions
            return sum(
                portion.amount for portion in portions
                if portion.ingredient == ingredient and (not note or note in portion.note)
            )

        expected_salt = {
            ('Egg Bites with Potato Hash', 'lean'): .45,
            ('Egg Bites with Potato Hash', 'bulk'): .625,
            ('Grilled Cheese Breakfast Burrito', 'lean'): 0,
            ('Grilled Cheese Breakfast Burrito', 'bulk'): 0,
            ('Breakfast Quesadilla', 'lean'): 0,
            ('Breakfast Quesadilla', 'bulk'): 0,
            ('Chicken Shakshuka', 'lean'): 0,
            ('Chicken Shakshuka', 'bulk'): 0,
            ('Hot Honey Chicken Sliders', 'lean'): 0,
            ('Hot Honey Chicken Sliders', 'bulk'): 0,
            ('Loaded Buffalo Chicken Potato', 'lean'): 0,
            ('Loaded Buffalo Chicken Potato', 'bulk'): 0,
            ('BBQ Chicken Mac & Cheese', 'lean'): 0,
            ('BBQ Chicken Mac & Cheese', 'bulk'): 0,
            ('Buffalo Chicken Pinwheels', 'single'): 0,
            ('Mediterranean Chicken Hummus Box', 'single'): 0,
        }
        for (name, tier), expected in expected_salt.items():
            self.assertAlmostEqual(amount(name, tier, 'salt'), expected, places=5, msg=f'{name} {tier}')

        self.assertEqual(amount('Chicken Tikka Snack Wrap', 'single', 'salt', 'tikka-marinade'), 0)
        self.assertEqual(amount('Loaded Buffalo Chicken Potato', 'lean', 'buffalo_sauce'), 15)
        self.assertEqual(amount('Loaded Buffalo Chicken Potato', 'bulk', 'buffalo_sauce'), 20)
        self.assertEqual(amount('Buffalo Chicken Pinwheels', 'single', 'buffalo_sauce'), 5)
        self.assertEqual(amount('Butter Chicken', 'lean', 'shan_butter_chicken'), 5.625)
        self.assertEqual(amount('Beef Seekh Kabab Shawarma', 'lean', 'shan_seekh'), 3.4)
        self.assertEqual(amount('Breakfast Quesadilla', 'lean', 'corn_street_tortilla'), 4)
        self.assertEqual(amount('Breakfast Quesadilla', 'bulk', 'corn_street_tortilla'), 6)
        self.assertEqual(amount('Hot Honey Chicken Sliders', 'lean', 'kings_hawaiian_roll'), 3)

        for tier, expected_jus, expected_beans in [('lean', .9072581, .2), ('bulk', 1.2096774, .2666667)]:
            self.assertAlmostEqual(amount('Braised Beef Short Rib', tier, 'salt', 'short-rib-jus'), expected_jus, places=5)
            self.assertAlmostEqual(amount('Braised Beef Short Rib', tier, 'salt', 'short-rib-green-beans'), expected_beans, places=5)
            expected_mash_salt = .4285714 if tier == 'lean' else .5714286
            self.assertAlmostEqual(amount('Braised Beef Short Rib', tier, 'salt', 'short-rib-mash'), expected_mash_salt, places=5)

    def test_all_registered_formulas_are_audited_once(self):
        data = audit.audit()
        self.assertEqual(data['counts']['controlledRecipes'],72)
        self.assertEqual(data['counts']['tierBuilds'],121)
        self.assertEqual(data['counts']['uncontrolledHistorical'],15)
        self.assertEqual(data['errors'],[])
        names = [r['name'] for r in data['recipes']]
        self.assertEqual(len(names),len(set(names)))
        self.assertTrue(set(b13.RECIPES).issubset(names))
        self.assertTrue(set(current.RECIPES).issubset(names))

    def test_latest_egg_bites_replaces_retired_multiplier(self):
        spec = audit.registry()['Egg Bites']
        self.assertIs(spec['factory'],m.egg_bites_reconciled)
        versions = dict(audit.versions('Egg Bites',spec))
        self.assertEqual(versions['lean'].portions,m.egg_bites_reconciled('lean').portions)

    def test_current_sweet_chili_restores_controlled_vegetables(self):
        spec = audit.registry()['Sweet Chili Chicken with Vegetable Rice']
        expected = {'lean':75, 'bulk':100}
        for tier,record in audit.versions('Sweet Chili Chicken with Vegetable Rice',spec):
            vegetables = [p.amount for p in record.portions if p.ingredient == 'mixed_vegetables']
            self.assertEqual(vegetables,[expected[tier]])

    def test_retired_pockets_not_promoted(self):
        pocket = next(r for r in audit.audit()['recipes'] if r['name']=='Cheeseburger Hot Pockets')
        self.assertTrue(pocket['status'].startswith('Retired'))

    def test_pilot_totals_and_no_hidden_sauce_double_count(self):
        rows = {row['key']:row for row in audit.pilot_rows('Sweet Chili Chicken with Vegetable Rice',['lean','bulk'])}
        self.assertAlmostEqual(sum(rows['chicken_thigh_raw']['amounts'].values()),537.7906977, places=4)
        self.assertEqual(sum(rows['rice_dry']['amounts'].values()),105)
        record = b13.recipe('High-Protein Beef Kofta & Roasted Vegetables','lean')
        self.assertAlmostEqual(sum(p.amount for p in record.portions if p.note=='component:batch13-sweet-heat'),45)


if __name__ == '__main__':
    unittest.main()
