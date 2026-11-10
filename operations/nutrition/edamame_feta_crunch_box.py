"""Chosen higher-protein277.8g cold-box recipe; original chickpea-only proposal retired.

Complete ingredient nutrition/cost estimate, not evidence of completed physical tests.
No main recipe registry, global cost catalog, or live menu mutation.
"""
from dataclasses import asdict
import calculate_active_menu as active
import batch18_sauces as shared

NAME = "Lemon-Feta Chickpea & Edamame Crunch Box"
ALLERGENS = "CONTAINS: MILK, SOY."
SOURCE_RECIPE_URL = "https://mallorythedietitian.com/chickpea-cucumber-salad/"
FORMULA_G = {"chickpeas":60,"edamame":100,"cucumber":35,"tomato":25,"feta":30,
             "onion":8,"parsley":3,"lemon":12,"olive_oil":4,"garlic_powder":.3,"salt":.4,"black_pepper":.1}
INPUT_GRAMS = 277.8
DRESSING_GRAMS = 16.8
SEPARATE_SAUCE_CUPS = 0
METHOD_STEPS = (
    "Cook shelled edamame fully by the purchased bag instructions, cool under the existing process, drain/surface-dry, then weigh100g cooked usable per box. No pods or raw frozen beans.",
    "Rinse canned chickpeas, drain5minutes and weigh60g after draining. Record actual can count and recovered mass.",
    "Wash/chop produce; drain halved cherry tomatoes and surface-dry diced cucumber before weighing35g cucumber and25g tomatoes. Finely chop8g onion and3g parsley.",
    "Whisk12g bottled lemon juice,4g olive oil,.3g garlic powder,.4g salt and.1g pepper:16.8g incorporated dressing per box. No separate cup or optional-sauce substitution.",
    "Combine cold beans, edamame, onion and parsley with the measured dressing. Gently fold in cucumber/tomato and30g feta last. No additional cheese, chicken or pita.",
    "Tare actual12oz box/lid, fill without compression, record net weight and test normal lid closure/stacking.277.8g input is not a measured net fill or volume/fit claim.",
    "Keep chilled and separate from hot food/raw work. Record fresh and next-day texture, pooling and taste. These observations do not establish shelf life.",
)

def edamame_feta_crunch_box():
    record=shared.build_formula(FORMULA_G,"edamame-feta-crunch-box")
    record.assumptions.extend([
        "Owner selected higher-protein variant with60g drained chickpeas/100g cooked edamame; original130g chickpea-only proposal is not active.",
        "Use Frigo feta purchasing identity with USDA generic feta nutrition estimate until actual purchased panel is captured.",
        "Use USDA canned DRAINED chickpeas and PREPARED shelled edamame nutrition, not dry beans, can liquid or pod weights.",
        "Milk and soy; verify actual feta enzyme specification and all ingredient labels. No unverified high-protein nutrient-content claim.",
    ])
    return record

def full_nutrition_estimate():
    return active.total(edamame_feta_crunch_box())

def cost_estimate():
    return shared.cost_formula(FORMULA_G,shared.BOX_AND_LID_USD)

def recipe_report():
    return dict(name=NAME,allergens=ALLERGENS,formula_g=FORMULA_G,input_g=INPUT_GRAMS,
                dressing_g=DRESSING_GRAMS,separate_sauce_cups=SEPARATE_SAUCE_CUPS,
                source_recipe=SOURCE_RECIPE_URL,adaptation=True,physical_tests_completed=False,
                measured_net_weight_g=None,steps=METHOD_STEPS,
                nutrition=asdict(full_nutrition_estimate()),cost=cost_estimate(),
                proposed_price=7.99,direct_cost_target_fraction=.35,
                direct_cost_fraction=cost_estimate()["total"]/7.99)
