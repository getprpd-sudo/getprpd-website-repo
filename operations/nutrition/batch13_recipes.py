"""Batch 13 planning registry. Physical release holds are not recipe approval.

Historical Batch 12 MEALS is deliberately left intact. Never infer a current
dish from a positional slot in that historical list.
"""
import calculate_next_menu as r
from dataclasses import replace

# Only the Batch 13 Hot Pocket pilot uses these dough ingredients. The exact
# purchased yeast panel must replace this low-confidence working profile.
r.add_ingredient('granulated_sugar', 'Granulated sugar',
    r.n(387, 0, 100, 0, 0, 0, 100, 100, 1, 0), confidence='high')
r.add_ingredient('instant_yeast', 'Instant baker\'s yeast',
    r.n(325, 40, 41, 26, 7, 1, 0, 0, 50, 0), confidence='low',
    note='Generic dry-yeast nutrition planning estimate. Verify the purchased instant-yeast package before final nutrition or labels.')

SALMON_HOLD = "Owner confirmed rice, not pasta, and extra same-recipe Alfredo for a side cup. Rice uses 40g dry Lean or 55g dry Bulk. Bulk inputs adapt the recorded Pilot 3 targets; neither tier has a verified finished sauce fill. The extra cup reserves 45g raw sauce input, not a measured finished yield. Purchased dairy panels, edible yield, sauce yield, taste and 24/72-hour reheat remain unverified; old pasta macros are invalid."
HOT_POCKET_HOLD = "The failed 1:1 flour/yogurt dough is retired. This is an untested PRPD 28-pocket adaptation of King Arthur Baking's Homemade Pizza Pockets dough, not the owner's undocumented successful formula. Record incorporated bench flour, 28 dough weights, filling weights, bake quality and reheat before treating it as a validated house recipe."
KOFTA_HOLD = "Verify purchased package panel, retained onion weight, cooked yield and reheat before releasing updated labels."
BOY_KIBBLE_HOLD = "Latest September 30 owner confirmation: Boy Kibble is beef, historically and currently. Saved halal_boy beef build restored with one 45g Sweet Heat cup replacing all three old condiment cups. Confirm finished tier weights before final labels."

# One assignment registry feeds the recipe ingredients and generated methods.
# Sweet Heat is recipe-counted; do not run a second blanket sauce multiplier.
SWEET_HEAT_MEALS = {
    'Breakfast Quesadilla', 'Power Bowl', 'Cheeseburger Hot Pockets',
    'Boy Kibble', 'Beef Seekh Kabab Shawarma',
    'High-Protein Beef Kofta & Roasted Vegetables',
    'Custom Lebanese-Style Chicken Breast', 'Premium NY Strip Steak',
}

def sauce_assignment(name):
    if name in SWEET_HEAT_MEALS:
        return {'name':'PRPD Sweet Heat Sauce','batchGroup':'sweet-heat',
                'gramsPerMeal':45,'componentRef':'batch13-sweet-heat',
                'replacesHistoricalCups':name == 'Boy Kibble'}
    return None

def salmon_rice_alfredo(tier: str):
    # Pilot 3 dairy formula, adapted Sept 30 to owner-confirmed plain rice.
    # Bulk uses the archived Pilot 3's 275 g fish / 130 g broccoli / 127 g
    # incorporated sauce input, with the normal 55 g Bulk dry-rice allocation.
    # These are measured inputs for planning, not a verified cooked yield.
    bulk = tier == 'bulk'
    r.add_ingredient('heavy_cream', 'Heavy cream, package pending', r.n(340,2.8,2.8,0,36), confidence='low')
    r.add_ingredient('whole_milk', 'Whole milk, package pending', r.n(61,3.15,4.8,0,3.25), confidence='low')
    r.add_ingredient('lemon_zest', 'Lemon zest', r.n(47,1.5,16,10.6,.3), confidence='low')
    sauce_scale = 127 / 93.5 if bulk else 1
    amounts = {'pink_salmon_raw':275 if bulk else 220,'rice_dry':55 if bulk else 40,
        'broccoli':130 if bulk else 100,
        'heavy_cream':12*sauce_scale,'whole_milk':45*sauce_scale,
        'regular_cream_cheese':12*sauce_scale,'parmesan':12*sauce_scale,
        'butter':2*sauce_scale,'garlic':6*sauce_scale,
        'cornstarch':2*sauce_scale,'avocado_oil':3 if bulk else 2,
        'salt':.75 if bulk else .5,'black_pepper':.75 if bulk else .5,
        'lemon_zest':.5*sauce_scale,'parsley':2*sauce_scale}
    sauce_keys = {'heavy_cream','whole_milk','regular_cream_cheese','parmesan',
                  'butter','garlic','cornstarch','lemon_zest','parsley'}
    sauce_input = sum(amounts[key] for key in sauce_keys)
    # Extra same-formula sauce, never scraped from the incorporated allocation.
    # 45g is purchasing input only until reduction/bowl loss is measured.
    return r.build([r.p(key, grams) for key,grams in amounts.items()] + [
        r.p(key, amounts[key] * 45 / sauce_input,
            note='component:salmon-alfredo-cup', include_in_menu_macros=False)
        for key in sorted(sauce_keys)
    ], [SALMON_HOLD,
        'Bulk is a PRPD planning adaptation of the recorded Pilot 3 input targets, not a tested finished portion.' if bulk else 'Lean rice adaptation of Pilot 3.',
        'One extra Alfredo cup. Its finished fill must be measured.'], 'low')

def kofta():
    # Onion purchasing amount is pre-squeeze. Record retained pulp in kitchen.
    return r.build([
        r.p('beef_96_raw',330),r.p('shan_seekh',10),r.p('onion',25),
        r.p('garlic',5),r.p('ginger',2),r.p('cilantro',10/3),r.p('avocado_oil',1),
        r.p('zucchini',150),r.p('green_bell_pepper',100),r.p('red_onion',50),
        *r.sweet_heat_45g(),
    ], [KOFTA_HOLD,'Five logs per meal. No yogurt in the meat. One separate 45g Sweet Heat cup.'], 'low')

def hot_pockets_published_pilot(tier: str):
    """Measured 28-pocket pilot; the source recipe is not a tested PRPD return.

    King Arthur Baking's Homemade Pizza Pockets dough has 360 g flour,
    227 g water and 57 g butter for twelve small pockets. This PRPD pilot
    scales that dough 3.5x for 28 larger beef-and-cheese pockets, lowers
    the source's salt to 2% of flour, and omits its egg wash. The beef,
    onion, ketchup and mozzarella filling remains the existing PRPD build.
    """
    pockets = 2 if tier == 'lean' else 3
    per_pocket = {
        'flour': 1260 / 28,
        'water': 795 / 28,
        'butter': 200 / 28,
        'granulated_sugar': 42 / 28,
        'instant_yeast': 21 / 28,
        'salt': 25 / 28,
    }
    filling_scale = pockets / 2
    return r.build([
        *[r.p(key, grams * pockets, note='component:hot-pocket-dough')
          for key, grams in per_pocket.items()],
        r.p('flour', 35 / 28 * pockets,
            note='component:hot-pocket-bench-reserve', include_in_menu_macros=False),
        r.active.beef_pan(80 * filling_scale),
        r.p('onion', 20 * filling_scale, note='component:hot-pocket-filling'),
        r.p('ketchup', 9 * filling_scale, note='component:hot-pocket-filling'),
        r.p('mozzarella', 40 * filling_scale, note='component:hot-pocket-filling'),
        r.p('salt', 1.2 * filling_scale, note='component:hot-pocket-filling'),
    ], [
        HOT_POCKET_HOLD,
        'Published source: King Arthur Baking, Homemade Pizza Pockets, https://www.kingarthurbaking.com/recipes/homemade-pizza-pockets-recipe (360g flour, 227g water, 57g butter, sugar, instant yeast and salt for twelve 4-by-3-inch pizza pockets).',
        'PRPD adaptation: 28 larger pockets, about 84g dough each before bench flour, for eleven Lean two-pocket meals and two Bulk three-pocket meals in the current order set. Source ratios of flour, water, butter, sugar and yeast are scaled 3.5x; salt is reduced to 25g for the batch. No yogurt, baking powder or egg wash.',
        'For the current 28-pocket batch mix 1260g flour, 795g cold water, 200g cold unsalted butter, 42g sugar, 21g instant yeast and 25g table salt; reserve no more than 35g additional flour for shaping and record actual incorporated grams.',
        'Mix dry ingredients, rub in cold butter, add water gradually until cohesive, and chill 20 minutes to four hours as the source directs. Mix/shape on Cook Day, not overnight. Divide into 28 equal pieces, weigh each, roll thin and seal the cooled cooked-down beef/cheese filling with water and a fork; vent the tops and bake at 400F until golden and fully cooked. The source bakes small pizza pockets 20-25 minutes; PRPD larger filled pockets require an observed bake-time check.',
        'Current filling remains beef, onion, ketchup, mozzarella and measured salt with no broth or purchased pickles. Cook beef filling down and chill it on Prep Day; do not enclose warm or wet filling. Lean packs two pockets; Bulk packs three.',
        'Do not update customer labels from this untested adaptation. Record actual dough, bench flour, filling and baked yields, plus a reheat check before calculating final nutrition.',
    ], 'low')

RECIPES = {
    'High Protein Omelette': (r.omelette, False),
    'Blueberry Cheesecake Protein Pancakes': (r.blueberry_cheesecake_pancakes, False),
    'Breakfast Quesadilla': (r.breakfast_quesadilla, False),
    'Power Bowl': (r.power_bowl, False),
    'Chicken Biryani': (r.biryani, False),
    'Loaded Buffalo Chicken Potato': (r.loaded_buffalo_revised, False),
    'Cheeseburger Hot Pockets': (hot_pockets_published_pilot, False),
    'Creamy Garlic Parmesan Salmon': (salmon_rice_alfredo, False),
    'Boy Kibble': (r.active.halal_boy, False),
    'Harissa Honey Chicken': (r.harissa_honey_chicken, False),
    'Beef Seekh Kabab Shawarma': (r.shan_seekh_shawarma, False),
    'Premium NY Strip Steak': (r.ny_strip, False),
    'High Protein Tiramisu': (r.tiramisu_complete, True),
    'Chocolate Oreo Mousse': (r.chocolate_oreo_mousse, True),
    'Chocolate-Dipped Cookie Dough Balls': (r.cookie_dough, True),
    'Buffalo Chicken Pinwheels': (r.buffalo_chicken_pinwheels, True),
    'Mediterranean Chicken Hummus Box': (r.mediterranean_chicken_hummus_box, True),
    'Chicken Tikka Snack Wrap': (r.chicken_tikka_snack_wrap, True),
    'Butter Chicken': (r.butter_chicken_no_broth, False),
    'Sweet Chili Chicken with Vegetable Rice': (r.sweet_chili_chicken, False),
    'High-Protein Beef Kofta & Roasted Vegetables': (kofta, True),
    'Custom Lebanese-Style Chicken Breast': (r.custom_lebanese_chicken, True),
}
HOLDS = {
    'Creamy Garlic Parmesan Salmon': SALMON_HOLD,
    'Cheeseburger Hot Pockets': HOT_POCKET_HOLD,
    'Boy Kibble': BOY_KIBBLE_HOLD,
    'High Protein Omelette': 'Public card promises chicken, absent from the controlled omelette formula. Resolve description or measure an approved recipe change.',
    'Power Bowl': 'Public card promises vegetables and cheese, absent from the controlled Power Bowl formula. Resolve description or measure an approved recipe change.',
    'High-Protein Beef Kofta & Roasted Vegetables': KOFTA_HOLD,
}

def recipe(name, tier):
    func,single = RECIPES[name]
    record = func() if single else func(tier)
    if name in SWEET_HEAT_MEALS:
        if name == 'Boy Kibble':
            record = replace(record,
                portions=[p for p in record.portions if p.note != 'separate sauce cup'],
                assumptions=[a for a in record.assumptions if not a.startswith('Side cups assumed')])
        # Existing Power Bowl, steak and kofta cups must not be added twice.
        existing = [p for p in record.portions if p.note == '45g Sweet Heat cup']
        portions = [p for p in record.portions if p.note != '45g Sweet Heat cup']
        portions += [replace(p, ingredient='sriracha' if p.ingredient == 'hot_sauce' else p.ingredient,
                            note='component:batch13-sweet-heat')
                     for p in (existing or r.sweet_heat_45g())]
        record = replace(record, portions=portions,
            assumptions=[*record.assumptions,
                'September 30 owner assignment: one separate 45g Sweet Heat cup. Sriracha replaces Valentina at the existing measured 250:300:300:170 ratio. Included in groceries and complete-package nutrition, excluded only from menu macros.'])
    if name == 'Custom Lebanese-Style Chicken Breast':
        # October 1 owner correction: Nouman wants the chicken and both
        # dressing/Sweet Heat cups, but no separate fattoush-style salad.
        record = replace(record, portions=[p for p in record.portions
            if p.ingredient not in {'lettuce','cucumber','tomato','red_onion','parsley'}],
            assumptions=[a for a in record.assumptions
                if not ('Pack the salad' in a or 'salad and measured' in a)] +
                ['October 1 owner correction: no salad with the Lebanese chicken. Keep the measured lemon-garlic dressing and Sweet Heat cups.'])
        # Identify exact raw-marinade/cold-dressing splits before combining keys.
        record = replace(record, portions=[replace(p, note=('component:lebanese-dressing'
            if 'separate lemon-garlic dressing' in p.note else 'component:lebanese-marinade'))
            if p.ingredient in {'chicken_breast_cooked','lemon','garlic','avocado_oil','black_pepper','salt','paprika','cumin'} else p
            for p in record.portions])
    if name == 'Sweet Chili Chicken with Vegetable Rice':
        record = replace(record, assumptions=[
            a for a in record.assumptions
            if 'October 1 owner correction' not in a
        ] + [
            'October 7 owner approval: restore the measured 75g Lean / 100g Bulk vegetable component and keep it separately weighable from the rice.'
        ])
    if name == 'High-Protein Beef Kofta & Roasted Vegetables':
        record = replace(record, portions=[p for p in record.portions if p.ingredient != 'avocado_oil'],
            assumptions=[*record.assumptions,
                'October 1 owner correction: no separate kofta pan coating. Cook on a lined tray; do not add recipe oil.'])
    return r.with_batch8_purchased_oil(record)
