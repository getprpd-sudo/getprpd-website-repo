"""Owner-selected PRPD adaptation; exact formula, physical validation pending.

Starting recipe: Emily Teel, The Mediterranean Dish, Lemon Chicken Orzo.
The source is wine-free and permits thighs. PRPD changes its portion controls,
vegetables, stock/milk finish and batch method. Its published macros are not used.
"""

import calculate_next_menu as r
import meal_portion_standards as standards

NAME = "Lemon Herb Chicken Orzo"
SOURCE_RECIPE_URL = "https://www.themediterraneandish.com/lemon-chicken-orzo/"
ORZO_KEY = "barilla_orzo_dry"
ORZO_PRODUCT = {
    "name": "Barilla Classic Blue Box Orzo, 16 oz",
    "retail_gtin": "00076808513981",
    "serving_g": 56,
    "manufacturer_url": "https://www.barilla.com/en-us/products/pasta/classic-blue-box/orzo",
    "specification_url": "https://data.attribytes.com/products/sell_sheet/by_distributor_and_sku/gourmet-foods-international/11472.pdf",
    "retail_panel_url": "https://www.kroger.com/p/barilla-orzo/0007680851398",
    "retail_price_url": "https://www.walmart.com/ip/10309188",
    "price_reference": 1.88,
    "package_g": 453.592,
    "price_checked": "2026-10-26",
    "store_specific_dfw_stock_verified": False,
    "physical_panel_verified": False,
    "contains": ["wheat"],
    "supplier_advisory": "May contain egg; verify the exact purchased package.",
}

# Full recorded US panel per56g; serving mass is explicit. This is classic
# semolina orzo, separate from Protein+ Rotini/Caprese and chickpea products.
# Manufacturer-supplied Syndigo specification is cross-checked to the US retail
# panel. Physical package remains the final authority. No missing fields are
# filled with fabricated measurements.
_PER_56G = r.n(200, 7, 42, 3, 1, 0, 1, 0, 0, 0, 0, 0, 12, 2, 118)
r.add_ingredient(
    ORZO_KEY,
    ORZO_PRODUCT["name"],
    _PER_56G.scale(100 / ORZO_PRODUCT["serving_g"]),
    source=(
        "Barilla US Classic Orzo identity: " + ORZO_PRODUCT["manufacturer_url"]
        + "; manufacturer-supplied Syndigo specification: " + ORZO_PRODUCT["specification_url"]
        + "; explicit56g US retail panel: " + ORZO_PRODUCT["retail_panel_url"]
    ),
    confidence="medium",
    note=(
        "US16oz Classic Orzo, retail GTIN00076808513981. Per56g dry: "
        "200cal,7g protein,42g carbs,3g fiber,1g fat,1g sugars,0g added sugar, "
        "0g saturated/trans fat,0mg sodium/cholesterol,0mcg vitaminD, "
        "12mg calcium,2mg iron,118mg potassium. Contains wheat. May contain egg. "
        "Confirm exact purchased panel; local store stock and new recipe physical tests remain open."
    ),
)

FORMULA_G = {
    "lean": {
        "chicken_thigh_standard_cooked": 160, ORZO_KEY: 45,
        "zucchini": 45, "carrot": 30, "onion": 15, "garlic": 3,
        "lemon": 12, "parsley": 3, "oregano": .5, "avocado_oil": 5,
        "paprika": 1, "onion_powder": .5, "salt": 1, "black_pepper": .3, "water": 10,
    },
    "bulk": {
        "chicken_thigh_standard_cooked": 210, ORZO_KEY: 60,
        "zucchini": 60, "carrot": 40, "onion": 20, "garlic": 4,
        "lemon": 16, "parsley": 4, "oregano": .7, "avocado_oil": 7,
        "paprika": 1.3, "onion_powder": .7, "salt": 1.35, "black_pepper": .4, "water": 14,
    },
}
# All allocations below SPLIT the formula; none is an extra recipe addition.
ALLOCATIONS_G = {
    "lean": {
        "protein": {"avocado_oil": 2, "salt": .75, "garlic": 2, "oregano": .5, "black_pepper": .3, "paprika": 1, "onion_powder": .5},
        "vegetables": {"zucchini": 45, "carrot": 30, "avocado_oil": 2, "salt": .1},
        "orzo_finish": {ORZO_KEY: 45, "onion": 15, "garlic": 1, "lemon": 12, "parsley": 3, "avocado_oil": 1, "salt": .15, "water": 10},
    },
    "bulk": {
        "protein": {"avocado_oil": 3, "salt": 1, "garlic": 3, "oregano": .7, "black_pepper": .4, "paprika": 1.3, "onion_powder": .7},
        "vegetables": {"zucchini": 60, "carrot": 40, "avocado_oil": 2.5, "salt": .15},
        "orzo_finish": {ORZO_KEY: 60, "onion": 20, "garlic": 1, "lemon": 16, "parsley": 4, "avocado_oil": 1.5, "salt": .2, "water": 14},
    },
}
PHYSICAL_GATES = (
    "Exact purchased Barilla US Orzo panel and price; approved halal thigh supplier",
    "500g uncrowded oven trial and actual cooked edible thigh yield",
    "Measured dry-to-drained-cooked orzo yield against120/160g starch targets",
    "Roasted vegetable yield and actual packed net weight/container fit",
    "Protected cooling135F-to70F within2h and to41F within6h total",
    "Fresh and24h reheat quality; continue72h texture observation",
)
METHOD_STEPS = (
    "Stage measured clean ingredients and tier labels before raw poultry work.",
    "Roast separately labeled halal thighs in an uncrowded single layer using the recorded oven trial setting; cook representative thick pieces to165F. Record load, mode, time and edible yield.",
    "Roast the measured zucchini/carrot separately with their assigned oil and salt; weigh finished output.",
    "Boil orzo separately for batch scale, following the purchased package al-dente directions; drain consistently and weigh before finishing. Process water is not a retained ingredient.",
    "In the emptied pasta pot, soften onion in the assigned orzo oil, briefly cook its garlic, add measured finishing water, then fold in lemon and parsley off strong heat and coat the cooked orzo.",
    "Weigh160g Lean/210g Bulk cooked chicken before sauce. Capture actual orzo output from45g/60g dry;120g/160g cooked is a target, not a measured yield.",
    "Record actual packed weights. Begin protected active cooling promptly in shallow pans under refrigeration/ice bath; check135F-to70F within2h and41F within6h total; seal when chilled.",
)


def raw_chicken_pull_g(tier):
    """Prior-method planning pull only, not a new measured recipe yield."""
    return standards.chicken_raw_pull_g(tier)


def lemon_herb_chicken_orzo(tier):
    if tier not in FORMULA_G:
        raise ValueError("Orzo tier must be lean or bulk")
    amounts = FORMULA_G[tier]
    portions = [
        r.p(key, grams, note=(
            "component:orzo-protein; cooked edible thigh before finish"
            if key == "chicken_thigh_standard_cooked" else
            "component:orzo-protein; dry seasoning"
            if key in {"paprika", "onion_powder"} else
            "component:orzo-vegetables; prepared raw input, roasted yield pending"
            if key in {"zucchini", "carrot"} else
            "component:orzo-starch; measured dry pasta, cooked yield pending"
            if key == ORZO_KEY else
            "component:orzo-incorporated-finish; full allocation counted"
        ))
        for key, grams in amounts.items()
    ]
    return r.build(portions, [
        "October28 owner requested paprika and onion powder: add1g/.5g Lean or1.3g/.7g Bulk to the protein seasoning only. Existing garlic, oregano, pepper, oil and salt remain unchanged.",
        "Owner selected this ONE new dish October26. It is a PRPD adaptation, not the publisher's unchanged recipe or a physically tested return.",
        "Use halal boneless skinless thighs. Cooked protein standard160g Lean/210g Bulk before finish; raw purchasing232.6g/305.2g uses the prior68.8% trial for planning only.",
        "Dry Barilla Classic Orzo45g Lean/60g Bulk is the initial controlled test. Cooked starch targets120g/160g require measured pasta yield; update dry allocation/nutrition together if needed.",
        "Vegetables75g/100g are prepared raw zucchini/carrot input. Finished vegetable yield and actual packout net weight are not established.",
        "Use exactly the displayed TOTAL oil and salt, split by ALLOCATIONS_G. No milk, stock, wine, fresh-zest assumption or separate recipe-required sauce cup.",
        "Bottled lemon follows the owner's kitchen input. Physical current panel,500g oven trial, pasta absorption/drain yield and24h reheat checks remain open.",
        "Do not print input-mass sums as finished net weight; Label Studio must collect actual packed weight.",
        *PHYSICAL_GATES,
    ], "medium")
