"""Current-menu recipe registry.

This module is intentionally batch-number agnostic.  The production generator
loads the effective order configuration and resolves every current menu name
through this registry.  Missing recipes raise an error instead of silently
loading an archived batch.
"""

from dataclasses import replace

import batch13_recipes as prior
import calculate_next_menu as r
from lemon_herb_chicken_orzo import lemon_herb_chicken_orzo
from oven_baked_popcorn_chicken import oven_baked_popcorn_chicken
import mango_habanero_wings as private_wings


r.add_ingredient(
    "corn_street_tortilla",
    "Mission White Corn Street Taco tortilla",
    r.n(100 / 3, 2 / 3, 19 / 3, 3 / 3, 1 / 3, 0, 2 / 3, 0, 20 / 3, 0, 0, 0, 20 / 3, 0, 80 / 3),
    basis="each",
    source="Mission White Corn Street Taco 24-count package listing, UPC 073731071502: 3 tortillas (45g) per serving",
    confidence="medium",
    note="One 15g tortilla. Target and Smart & Final list 100 calories, 2g protein, 19g carbohydrate, 3g fiber, 1g fat and 20mg sodium per three tortillas; ShopRite conflicts at 20g carbohydrate and 2g fiber. Confirm the purchased UPC panel before production.",
)
r.add_ingredient(
    "achiote_paste",
    "El Yucateco seasoned achiote paste",
    r.n(188, 5.7, 35, 0, 2.8, 0, 0, 0, 2596, 0),
    source="El Yucateco 100g product specification: 188 kcal, 5.7g protein, 35g carbohydrate, 2.8g fat and 6.6g salt per 100g",
    confidence="high",
    note="Controlled product is El Yucateco 100g seasoned achiote paste, EAN 7501017660039. Ingredients: water, corn flour, annatto seed, salt, garlic, spices, acetic acid and sodium benzoate.",
)
r.add_ingredient(
    "smoked_paprika",
    "Smoked paprika",
    r.active.INGREDIENTS["paprika"].nutrition,
    source="Nutrition modeled from the current paprika record; purchased smoked-paprika jar controls production",
    confidence="medium",
)
r.add_ingredient(
    "short_rib_cooked",
    "Beef short rib, cooked edible meat after deboning",
    r.n(287, 19.9, 0, 0, 22.0, 9.0, 0, 0, 65, 72),
    source="USDA braised beef short rib, separable lean and fat; rounded working profile",
    confidence="medium",
    note="Finished edible meat only. Bone, cartilage, tough membrane and discarded exterior fat are excluded.",
)
r.add_ingredient("beef_broth", "Verified low-sodium halal beef broth", r.n(7, 1.1, .4, 0, .1, 0, .2, 0, 180, 0), confidence="medium", note="Confirm the exact halal package and Nutrition Facts panel before production.")
r.add_ingredient("celery", "Celery, raw", r.n(14, .69, 2.97, 1.6, .17, .04, 1.34, 0, 80, 0), source="USDA FoodData Central", confidence="high")
r.add_ingredient("rosemary", "Fresh rosemary", r.n(131, 3.31, 20.7, 14.1, 5.86, 2.84, 0, 0, 26, 0), source="USDA FoodData Central", confidence="high")
r.add_ingredient("bay_leaf", "Bay leaf", r.n(313, 7.6, 75, 26, 8.36, 2.28, 0, 0, 23, 0), source="USDA FoodData Central", confidence="high")
r.add_ingredient(
    "sharifa_beef_bacon", "Sharifa Halal beef bacon, as packaged",
    r.n(45 * 100 / 28, 5 * 100 / 28, 0, 0, 3 * 100 / 28, 0, 0, 0, 0, 0),
    source="Sharifa online listing: 45 kcal, 5 g protein and 3 g fat per 28 g; purchased package still controls",
    confidence="planning", nutrition_complete=False,
    note="Planning profile only. Sodium and remaining panel fields were not verified; weigh bacon before cooking and inspect the purchased Sharifa package before final labels.",
)
r.add_ingredient(
    "red_chili_flakes", "Crushed red chili flakes",
    r.active.INGREDIENTS["paprika"].nutrition,
    source="Generic red-pepper seasoning proxy for a small house-sauce quantity",
    confidence="planning",
)


GARLIC_HERB_COMPONENT = "garlic-herb-yogurt"
HONEY_BBQ_MUSTARD_COMPONENT = "honey-barbecue-mustard"
SWEET_HEAT_COMPONENT = "batch13-sweet-heat"
NOUMAN_DRESSING_COMPONENT = "lebanese-dressing"
NOUMAN_KACHUMBER_COMPONENT = "nouman-kachumber"
MUSTARD_BBQ_COMPONENT = "mustard-bbq"
WHITE_GARLIC_JALAPENO_COMPONENT = "white-garlic-jalapeno-sauce"
WHITE_GARLIC_COMPONENT = "white-garlic"


def meatball_arrabbiata(tier: str):
    """Keep current Kroger pasta separate from historical and Caprese Barilla SKUs."""
    record = r.active.meatball_pasta(tier)
    return r.build(
        [
            replace(portion, ingredient="kroger_protein_pasta")
            if portion.ingredient == "protein_pasta" else portion
            for portion in record.portions
        ],
        [*record.assumptions, "Use the exact Kroger protein pasta identity; do not substitute the historical Barilla spaghetti or Caprese Rotini records."],
        record.confidence,
    )


STANDALONE_SAUCE_FORMULAS = {
    "sweet-heat": {
        "name": "PRPD Sweet Heat Sauce",
        "componentRef": SWEET_HEAT_COMPONENT,
        "gramsPerCup": 40,
        "batchSizeCups": 5,
        "batchInputGrams": 225,
        "ingredients": [
            {"key": "light_mayo", "name": "Great Value light mayonnaise", "grams": 55},
            {"key": "ketchup", "name": "Ketchup", "grams": 66},
            {"key": "honey", "name": "Honey", "grams": 66},
            {"key": "sriracha", "name": "Sriracha sauce", "grams": 38},
        ],
    },
    "garlic-herb-yogurt": {
        "name": "PRPD Garlic Herb Yogurt",
        "componentRef": GARLIC_HERB_COMPONENT,
        "gramsPerCup": 40,
        "batchSizeCups": 5,
        "batchInputGrams": 225,
        "ingredients": [
            {"key": "fage", "name": "FAGE Total 0%", "grams": 165},
            {"key": "light_mayo", "name": "Great Value light mayonnaise", "grams": 25},
            {"key": "lemon", "name": "Lemon juice, raw", "grams": 10},
            {"key": "cilantro", "name": "Cilantro, raw", "grams": 10},
            {"key": "jalapeno", "name": "Jalapeno, raw", "grams": 6},
            {"key": "garlic", "name": "Garlic, raw", "grams": 3},
            {"key": "parsley", "name": "Flat-leaf parsley, raw", "grams": 3},
            {"key": "salt", "name": "Table salt", "grams": 2},
            {"key": "cumin", "name": "Ground cumin", "grams": 1},
        ],
    },
    "honey-barbecue-mustard": {
        "name": "PRPD Honey Barbecue Mustard",
        "componentRef": HONEY_BBQ_MUSTARD_COMPONENT,
        "gramsPerCup": 45,
        "recipeRequiredOnly": True,
        "ingredients": [
            {"key": "mustard", "name": "Yellow mustard", "grams": 18},
            {"key": "bbq_sauce", "name": "G Hughes sugar-free barbecue sauce", "grams": 15},
            {"key": "honey", "name": "Honey", "grams": 8},
            {"key": "apple_cider_vinegar", "name": "Apple cider vinegar", "grams": 3},
            {"key": "garlic_powder", "name": "Garlic powder", "grams": 0.3},
            {"key": "smoked_paprika", "name": "Smoked paprika", "grams": 0.3},
            {"key": "black_pepper", "name": "Ground black pepper", "grams": 0.2},
            {"key": "salt", "name": "Table salt", "grams": 0.2},
        ],
    },
}


def garlic_herb_yogurt(grams: float, *, incorporated: bool = False):
    """Scale the owner-approved October 20 garlic-herb yogurt formula."""
    ratio = {
        "fage": 165,
        "light_mayo": 25,
        "lemon": 10,
        "cilantro": 10,
        "jalapeno": 6,
        "garlic": 3,
        "parsley": 3,
        "salt": 2,
        "cumin": 1,
    }
    return [
        r.p(
            key,
            grams * amount / 225,
            note=f"component:{GARLIC_HERB_COMPONENT}",
            include_in_menu_macros=incorporated,
        )
        for key, amount in ratio.items()
    ]


def honey_barbecue_mustard(grams: float = 45):
    """Scale the researched PRPD honey barbecue mustard formula."""
    ratio = {
        "mustard": 18,
        "bbq_sauce": 15,
        "honey": 8,
        "apple_cider_vinegar": 3,
        "garlic_powder": 0.3,
        "smoked_paprika": 0.3,
        "black_pepper": 0.2,
        "salt": 0.2,
    }
    return [
        r.p(
            key,
            grams * amount / 45,
            note=f"component:{HONEY_BBQ_MUSTARD_COMPONENT}",
            include_in_menu_macros=False,
        )
        for key, amount in ratio.items()
    ]


def sweet_heat(grams: float = 40):
    """Scale the locked October 20 Sriracha Sweet Heat formula."""
    ratio = {
        "light_mayo": 55,
        "ketchup": 66,
        "honey": 66,
        "sriracha": 38,
    }
    return [
        r.p(
            key,
            grams * amount / 225,
            note=f"component:{SWEET_HEAT_COMPONENT}",
            include_in_menu_macros=False,
        )
        for key, amount in ratio.items()
    ]


def breakfast_sandwich(tier: str):
    """Keep the sandwich itself; use the current recipe-required 40 g cup."""
    record = _without_component(
        r.breakfast_sandwich(tier), SWEET_HEAT_COMPONENT, "Sweet Heat"
    )
    return replace(
        record,
        portions=[*record.portions, *sweet_heat(40)],
        assumptions=[
            *record.assumptions,
            "Pack one separate 40g PRPD Sweet Heat cup using the controlled October 20 Sriracha formula. The cup is excluded from displayed menu macros and included in complete-package ingredients and nutrition.",
            "Record actual sauce recovery and filled cup weights; the operational 40g target is not a completed physical yield test.",
        ],
    )


def beef_bacon_breakfast_pizza(tier: str):
    """Batch 19 owner-tested rectangle; egg and finished sauce yields await measurement."""
    if tier not in {"lean", "bulk"}:
        raise ValueError("Breakfast pizza requires Lean or Bulk.")
    dough_grams = 100 if tier == "lean" else 125
    # The accepted pair uses 225 g from a 235 g dough. Include the remaining
    # dough in purchasing while excluding its nutrition from the packed pizza.
    made_share = dough_grams / 225
    eaten_share = dough_grams / 235
    spare_share = made_share - eaten_share
    dough = {"flour": 140, "water": 85, "instant_yeast": 2, "salt": 3, "olive_oil": 5}
    portions = []
    for key, grams in dough.items():
        portions.append(r.p(key, grams * eaten_share, note="component:pizza-dough"))
        portions.append(r.p(key, grams * spare_share, note="component:pizza-dough-spare",
                            include_in_menu_macros=False))
    portions.extend([
        r.p("egg", .45 if tier == "lean" else .55, "each", note="component:pizza-eggs"),
        r.p("egg_white", 80 if tier == "lean" else 95, note="component:pizza-eggs"),
        r.p("green_bell_pepper", 15, note="component:pizza-vegetables"),
        r.p("onion", 15, note="component:pizza-vegetables"),
        r.p("crushed_tomatoes", 15, note="component:pizza-house-sauce"),
        r.p("garlic", .5, note="component:pizza-house-sauce"),
        r.p("olive_oil", .5, note="component:pizza-house-sauce"),
        r.p("italian_seasoning", .2, note="component:pizza-house-sauce"),
        r.p("red_chili_flakes", .1, note="component:pizza-house-sauce"),
        r.p("mozzarella", 30 if tier == "lean" else 58),
        r.p("sharifa_beef_bacon", 50 if tier == "lean" else 60),
    ])
    return r.build(portions, [
        f"Shape one {dough_grams} g raw dough rectangle for this {tier.title()} meal; no cut after baking.",
        "The full 235 g dough batch makes one 100 g Lean and one 125 g Bulk rectangle; the unserved 10 g is included in purchasing but excluded from served nutrition.",
        "The one-medium-egg plus 175 g whites pair is a planning basis. Lean uses an estimated 45% of the egg and 80 g whites; Bulk 55% and 95 g. Record actual cooked egg allocations on Cook Day.",
        "Use only H-E-B fat-free mozzarella: 30 g Lean or 58 g Bulk. Use 50 g or 60 g Sharifa bacon by raw package weight, cook it before topping, then add crisp bits after baking.",
        "Each pizza gets 30 g peppers/onion and 15 g finished house tomato sauce. Sauce input and olive-oil yield remain estimates; record the finished sauce batch and actual portion weight.",
        "Bake on a preheated 425 F stone on the second-lowest rack. The owner's ground-beef placeholder trial finished in 9–10 minutes; customer production uses Sharifa bacon.",
    ], "planning-owner-tested")


def nouman_lemon_garlic_dressing():
    """One 15 g light lemon-mustard-garlic dressing cup.

    This is a PRPD adaptation, not a copied published recipe. It follows the
    established 2:1 oil-to-acid vinaigrette direction and uses the owner's
    bottled-lemon and avocado-oil system. Prepared mustard provides the
    emulsifier; the purchased brand remains open until its package is checked.
    """
    note = f"component:{NOUMAN_DRESSING_COMPONENT}"
    return [
        r.p("avocado_oil", 9, note=note, include_in_menu_macros=False),
        r.p("lemon", 4.5, note=note, include_in_menu_macros=False),
        r.p("mustard", .75, note=note, include_in_menu_macros=False),
        r.p("garlic", .3, note=note, include_in_menu_macros=False),
        r.p("salt", .3, note=note, include_in_menu_macros=False),
        r.p("black_pepper", .15, note=note, include_in_menu_macros=False),
    ]


def nouman_kachumber():
    """One separately packed small-cut salad for each Nouman meal."""
    note = f"component:{NOUMAN_KACHUMBER_COMPONENT}"
    return [
        r.p("cucumber", 100, note=note),
        r.p("tomato", 70, note=note),
        r.p("red_onion", 25, note=note),
        r.p("lemon", 4, note=note),
        r.p("cilantro", 3, note=note),
        r.p("jalapeno", 3, note=note),
        # Internal gram equivalents preserve nutrition and purchasing math.
        # Operators measure both seasonings as 7/8 tsp per 10-salad batch.
        r.p("salt", 0.525, note=note),
        r.p("black_pepper", 0.20125, note=note),
    ]


def _replace_white_sauce(record, *, grams: float, incorporated: bool = False):
    portions = [
        portion for portion in record.portions
        if not portion.note.startswith("component:white-garlic-jalapeno-sauce")
    ]
    assumptions = [
        assumption for assumption in record.assumptions
        if "white garlic-jalapeno" not in assumption.lower()
    ]
    return replace(
        record,
        portions=[*portions, *garlic_herb_yogurt(grams, incorporated=incorporated)],
        assumptions=[
            *assumptions,
            f"October 20 owner formula: {'incorporate' if incorporated else 'pack'} exactly {grams:g}g PRPD Garlic Herb Yogurt per meal. The sauce uses the controlled yogurt, light-mayo, reduced-lemon, cilantro and jalapeno formula with no added water.",
        ],
    )


def _mustard_bbq_45(record):
    """Standardize the established 70/25/5 mustard-BBQ cup at 45 g."""
    amounts = {"bbq_sauce": 31.5, "mustard": 11.25, "apple_cider_vinegar": 2.25}
    portions = [
        replace(
            portion,
            amount=amounts[portion.ingredient],
            note=f"component:{MUSTARD_BBQ_COMPONENT}",
        )
        if "PRPD Mustard BBQ" in portion.note and portion.ingredient in amounts
        else portion
        for portion in record.portions
    ]
    assumptions = []
    for assumption in record.assumptions:
        if "40g house PRPD Mustard BBQ" in assumption:
            assumption = assumption.replace("40g house PRPD Mustard BBQ", "45g house PRPD Mustard BBQ")
            assumption = assumption.replace(
                "28g sugar-free barbecue sauce, 10g yellow mustard, and 2g apple cider vinegar",
                "31.5g sugar-free barbecue sauce, 11.25g yellow mustard, and 2.25g apple cider vinegar",
            )
        assumptions.append(assumption)
    return replace(record, portions=portions, assumptions=assumptions)


def _scale_sauce_component(record, component: str, grams: float):
    """Scale one separately packed sauce component without changing the meal itself."""
    matched = [
        portion for portion in record.portions
        if portion.note == f"component:{component}"
    ]
    current = sum(portion.amount for portion in matched)
    if not matched or current <= 0:
        raise ValueError(f"Missing controlled sauce component: {component}")
    factor = grams / current
    portions = [
        replace(portion, amount=portion.amount * factor)
        if portion.note == f"component:{component}"
        else portion
        for portion in record.portions
    ]
    assumptions = []
    for assumption in record.assumptions:
        lower = assumption.lower()
        if component == WHITE_GARLIC_JALAPENO_COMPONENT and (
            "white garlic-jalapeno yogurt sauce" in lower
            or "jalapeno-lime yogurt cup" in lower
        ):
            assumption = assumption.replace("30g", "45g").replace("37g", "45g")
        if component == WHITE_GARLIC_COMPONENT and "white sauce portion" in lower:
            assumption = "Pack one separate 45g PRPD white sauce cup. The cup is excluded from displayed menu macros."
        assumptions.append(assumption)
    return replace(record, portions=portions, assumptions=assumptions)


def _white_garlic_jalapeno_45(record):
    return _scale_sauce_component(record, WHITE_GARLIC_JALAPENO_COMPONENT, 45)


def _white_garlic_45(record):
    return _scale_sauce_component(record, WHITE_GARLIC_COMPONENT, 45)


def _without_component(record, component: str, *assumption_terms: str):
    """Remove a retired side-cup component without altering the meal itself."""
    marker = f"component:{component}"
    terms = tuple(term.lower() for term in assumption_terms)
    return replace(
        record,
        portions=[
            portion for portion in record.portions
            if not portion.note.startswith(marker)
            and not any(term in portion.note.lower() for term in terms)
        ],
        assumptions=[
            assumption for assumption in record.assumptions
            if not any(term in assumption.lower() for term in terms)
        ],
    )


def baked_oatmeal_squares(tier: str):
    squares = 2 if tier == "lean" else 3
    share = squares / 8
    pan = {
        "oats": 220,
        "whey_vanilla": 48,
        "egg_white": 220,
        "egg": 1,
        "fairlife_milk": 180,
        "fage": 160,
        "banana": 120,
        "blueberry": 200,
        "honey": 24,
        "butter": 10,
        "baking_powder": 4,
        "vanilla": 8,
        "cinnamon": 2,
        "salt": 2,
    }
    portions = [
        r.p(key, amount * share, "each" if key == "egg" else "g", note="component:oatmeal-square-pan")
        for key, amount in pan.items()
    ]
    return r.build(
        portions,
        [
            f"{tier.title()} receives {squares} of eight equal-weight squares from one parchment-lined 9 x 13-inch pan.",
            "The safer controlled test pan uses 220g oats, 48g vanilla protein powder, 220g egg whites, 1 whole egg, 180g milk, 160g yogurt, 120g banana, 200g blueberries, 24g honey, 10g butter, 4g baking powder, 8g vanilla, 2g cinnamon and 2g salt.",
            "This October 7 revision increases the oat structure, adds whole-egg binding, reduces the dairy-liquid load, and adds modest honey and butter for a more conventional baked-oatmeal texture and flavor. It remains physically test-gated.",
            "Record raw batter weight, baked slab weight, eight chilled cut weights, center set, 24/48/72-hour texture and reheating before label release.",
        ],
        "low",
    )


def cheesy_achiote_chicken_tacos(tier: str):
    """First physical-test build; intentionally held from release."""
    tacos = 3 if tier == "lean" else 4
    raw_chicken = 60 * tacos
    return r.build([
        r.chicken_thigh(raw_chicken),
        r.p("corn_street_tortilla", tacos, "each"),
        r.p("mozzarella", 15 * tacos),
        r.p("cotija", 5 * tacos),
        r.p("red_onion", 10 * tacos, note="component:achiote-pickled-onion"),
        r.p("apple_cider_vinegar", 2 * tacos, note="component:achiote-pickled-onion"),
        r.p("water", 2 * tacos, note="component:achiote-pickled-onion"),
        r.p("honey", 0.2 * tacos, note="component:achiote-pickled-onion"),
        r.p("salt", 0.1 * tacos, note="component:achiote-pickled-onion"),
        r.p("achiote_paste", 4.8 * tacos, note="component:achiote-marinade"),
        r.p("lime", 4 * tacos, note="component:achiote-marinade"),
        r.p("garlic", 1 * tacos, note="component:achiote-marinade"),
        r.p("cumin", 0.2 * tacos, note="component:achiote-marinade"),
        r.p("paprika", 0.2 * tacos, note="component:achiote-marinade"),
        r.p("avocado_oil", 0.7 * tacos, note="component:achiote-marinade"),
        r.p("salt", 0.25 * tacos, note="component:achiote-marinade"),
        r.p("cilantro", 0.7 * tacos),
    ], [
        f"First fit test uses {tacos} complete street-size tacos and {raw_chicken:g}g raw boneless skinless chicken thigh.",
        "October 19 owner correction: this meal has no recipe-required separate sauce cup. Optional order-level sauces are selected separately from the meal recipe; up to three selected cups per customer order are free, then additional cups are $1 each.",
        "Test assembled versus kit packaging, tortilla cracking, cheese choice, cooked chicken yield and 48/72-hour reheat before release.",
    ], "low")


def custom_lean_chicken_mince():
    """Nouman's moist chicken-breast qeema with separately packed kachumber."""
    return r.build([
        r.p("chicken_mince_cooked", 225, note="300g raw pure chicken-breast mince at the controlled 75% planning yield"),
        r.p("red_onion", 35),
        r.p("garlic", 6),
        r.p("lemon", 5),
        r.p("parsley", 5),
        r.p("paprika", 1),
        r.p("cumin", 0.5),
        r.p("black_pepper", 0.3),
        r.p("salt", 1),
        r.p("water", 60, note="Moist qeema cooking liquid; reduce only to a moist, lightly saucy consistency"),
        *nouman_kachumber(),
        *nouman_lemon_garlic_dressing(),
        *sweet_heat(40),
    ], [
        "Use pure chicken-breast mince: 300g raw per meal, cooked to 165 F.",
        "Cook with the measured onion, garlic, lemon, spices and water. Keep the finished qeema moist and lightly saucy, not dry or fully salan-style.",
        "Pack one separate 205g small-cut salad portion with cucumber, tomato, red onion, lemon, cilantro and evenly blended jalapeno. Measure salt and black pepper in teaspoons at the full multi-serving batch level.",
        "Pack one separate 15g lemon-mustard-garlic dressing cup and one separate 40g PRPD Sweet Heat cup per meal.",
        "The dressing is PRPD's light adaptation of the established 2:1 oil-to-acid vinaigrette direction: bottled lemon juice, avocado oil, prepared mustard, garlic, salt, and black pepper.",
        "This follows Nouman's October 7 Google Voice request for three moist chicken qeema meals with kachumber; record the actual cooked mince yield during production.",
    ], "medium")


def _steak(tier: str):
    record = r.ny_strip(tier)
    portions = [
        portion for portion in record.portions
        if "Sweet Heat" not in portion.note and not portion.note.startswith("component:batch13-sweet-heat")
    ]
    assumptions = [
        (
            "The 200g mashed-potato side uses Idahoan Original unflavored mashed potato flakes "
            "prepared to the controlled package ratio; broccoli is the green vegetable. "
            "Do not use fresh potatoes."
        )
        if assumption.startswith("The 200g mashed-potato side uses ")
        else assumption
        for assumption in record.assumptions
        if "Sweet Heat" not in assumption
    ]
    return replace(
        record,
        portions=[*portions, *honey_barbecue_mustard(45)],
        assumptions=[*assumptions, "Pack one separate 45g PRPD Honey Barbecue Mustard cup."],
    )


def _mediterranean(tier: str):
    return _without_component(
        r.mediterranean_chicken_bowl(tier),
        GARLIC_HERB_COMPONENT,
        "Garlic Herb Yogurt",
        "white garlic-jalapeno",
    )


def _tikka():
    """October28 owner-approved40% chicken/marinade reduction; history unchanged."""
    record = _replace_white_sauce(r.chicken_tikka_snack_wrap(), grams=25, incorporated=True)
    updated = []
    for portion in record.portions:
        if portion.ingredient == "chicken_thigh_cooked":
            updated.append(replace(
                portion, amount=portion.amount * 0.6,
                note="78g raw thigh at the existing unmeasured75% cooked-yield planning model",
            ))
        elif portion.note == "component:tikka-marinade":
            updated.append(replace(portion, amount=portion.amount * 0.6))
        else:
            updated.append(portion)
    return replace(
        record, portions=updated,
        assumptions=[
            text.replace("Marinate 130g", "Marinate 78g").replace(
                "No rice, cheese, cashews, mayonnaise, or side sauce cup is included.",
                "No rice, cheese, cashews, or side sauce cup is included. The unchanged25g current Garlic Herb Yogurt finish contains its controlled light mayonnaise.",
            )
            for text in record.assumptions
        ] + [
            "October28 owner approved40% less chicken:78g raw thigh per SINGLE wrap, with only its raw-contact marinade scaled to60%. Keep one tortilla,25g current Garlic Herb Yogurt and all salad unchanged.",
            "The75% cooked-yield model is not a new measured result. Record actual cooked meat and final wrap net weight; no retrospective Tikka leftovers remain for weighing.",
        ],
    )


def _nouman_kofta(sweet_heat_cups=2):
    """Preserve the owner-approved actual-96/4 five-log formula."""
    record = r.nouman_kofta(r)
    return replace(
        record,
        portions=[*record.portions, *nouman_kachumber(), *sweet_heat(40 * sweet_heat_cups)],
        assumptions=[
            *record.assumptions,
            "Cook the kofta on a lined tray with no added oil. Preserve the successful five-log actual-96/4 house formula with drained onion and jalapeno mixed into the beef.",
            "Pack one separate 205g small-cut salad portion with cucumber, tomato, red onion, lemon, cilantro and evenly blended jalapeno. Measure salt and black pepper in teaspoons at the full multi-serving batch level.",
            f"Pack {sweet_heat_cups} separate 40g PRPD Sweet Heat cup(s) per meal.",
        ],
    )


def _nouman_lebanese_current():
    """Use the established Nouman build with PRPD's current avocado-oil standard."""
    record = prior.recipe("Custom Lebanese-Style Chicken Breast", "lean")
    portions = [
        replace(portion, ingredient="avocado_oil")
        if portion.ingredient == "sunflower_oil" else portion
        for portion in record.portions
        if not portion.note.startswith(f"component:{SWEET_HEAT_COMPONENT}")
        and not portion.note.startswith(f"component:{NOUMAN_DRESSING_COMPONENT}")
        and "separate lemon-mustard-garlic dressing cup" not in portion.note.lower()
    ]
    assumptions = [
        assumption.replace("sunflower oil", "avocado oil").replace("Altunsa", "PRPD")
        for assumption in record.assumptions
        if not assumption.startswith("September 30 owner assignment:")
        and "lemon-garlic dressing" not in assumption.lower()
    ]
    return replace(record, portions=[*portions, *nouman_lemon_garlic_dressing()], assumptions=[
        *assumptions,
        "Do not add an automatic Sweet Heat cup; Batch 16 house sauces come only from the customer's order-level selections.",
        "Pack one separate 15g lemon-mustard-garlic dressing cup. This is PRPD's light adaptation of the established 2:1 oil-to-acid vinaigrette direction using bottled lemon juice, avocado oil, prepared mustard, garlic, salt, and black pepper.",
    ])


def braised_beef_short_rib(tier: str):
    """Batch 16 short rib using water and the USDA 49.6% raw-to-edible planning yield."""
    cooked_beef = 150 if tier == "lean" else 200
    mash = 180 if tier == "lean" else 240
    beans = 90 if tier == "lean" else 120
    raw_equivalent = cooked_beef / .496
    braise_scale = raw_equivalent / 1000
    # October 20 owner-tested richer Idahoan formula. One Lean + one Bulk target
    # uses 59 g flakes, 219 g water, 140 g milk, 19 g butter and 1 g each salt,
    # garlic powder and rosemary. The 440 g input gives a 20 g handling/tasting
    # allowance above the 420 g packed target; record actual recovery next run.
    mash_scale = mash / 420
    packaged_mash = [
        r.p("instant_potato_flakes", 59 * mash_scale, note="component:short-rib-mash"),
        r.p("water", 219 * mash_scale, note="component:short-rib-mash"),
        r.p("fairlife_milk", 140 * mash_scale, note="component:short-rib-mash"),
        r.p("butter", 19 * mash_scale, note="component:short-rib-mash"),
        r.p("salt", 1 * mash_scale, note="component:short-rib-mash"),
        r.p("garlic_powder", 1 * mash_scale, note="component:short-rib-mash"),
        r.p("rosemary", 1 * mash_scale, note="component:short-rib-mash"),
    ]
    bean_scale = beans / 900
    return r.build([
        r.p("short_rib_cooked", cooked_beef, note=f"{raw_equivalent:.1f}g raw bone-in planning pull at 49.6% cooked-edible yield"),
        r.p("onion", 200 * braise_scale, note="component:short-rib-jus"),
        r.p("carrot", 100 * braise_scale, note="component:short-rib-jus"),
        r.p("celery", 60 * braise_scale, note="component:short-rib-jus"),
        r.p("garlic", 20 * braise_scale, note="component:short-rib-jus"),
        r.p("tomato_paste", 30 * braise_scale, note="component:short-rib-jus"),
        r.p("water", 600 * braise_scale, note="component:short-rib-jus"),
        r.p("balsamic_vinegar", 25 * braise_scale, note="component:short-rib-jus"),
        r.p("thyme", 1.5 * braise_scale, note="component:short-rib-jus"),
        r.p("coriander", .8 * braise_scale, note="component:short-rib-jus"),
        r.p("bay_leaf", .4 * braise_scale, note="component:short-rib-jus"),
        r.p("avocado_oil", 12 * braise_scale, note="component:short-rib-jus"),
        r.p("salt", 3 * braise_scale, note="component:short-rib-jus"),
        r.p("black_pepper", 3 * braise_scale, note="component:short-rib-jus"),
        *packaged_mash,
        r.p("green_beans", 1000 * bean_scale, note="component:short-rib-green-beans"),
        r.p("avocado_oil", 25 * bean_scale, note="component:short-rib-green-beans"),
        r.p("garlic", 15 * bean_scale, note="component:short-rib-green-beans"),
        r.p("salt", 2 * bean_scale, note="component:short-rib-green-beans"),
        r.p("black_pepper", 2 * bean_scale, note="component:short-rib-green-beans"),
    ], [
        f"Pack {cooked_beef}g finished deboned short-rib meat, 45g reduced jus, {mash}g finished Idahoan Original garlic-rosemary mash and {beans}g finished roasted garlic green beans.",
        f"Pull {raw_equivalent:.1f}g raw bone-in short rib per sold meal before the separate five-percent purchase reserve.",
        "Braise at 325 F until tender, remove every bone and cartilage fragment, defat and reduce the jus, and weigh edible cooked meat before portioning.",
        "Use water and the browned pan fond for the braising liquid. Do not use beef broth, bouillon, or stock.",
        "Prepare the October 20 owner-tested Idahoan Original mash on Prep Day with the controlled extra-milk ratio, 1g salt and 1g garlic powder per 420g packed Lean-plus-Bulk target. Do not use chopped fresh garlic or fresh potatoes for mash.",
        "October 20 mash correction: use 3g salt per kg raw short-rib pull in the braise, 2g salt per kg green beans, and the controlled low-salt mash formula rather than the rejected salt-free version.",
        "The public nutrition values are the owner-approved Batch 15 recipe estimates. Production still records actual raw pull and finished edible yield.",
    ], "medium")


RECIPES = {
    private_wings.NAME: (private_wings.mango_habanero_wings, False),
    "High Protein Omelette": (r.omelette, False),
    "Lemon Herb Chicken Orzo": (lemon_herb_chicken_orzo, False),
    "Strawberry Cheesecake Protein Pancakes": (r.strawberry_cheesecake_pancakes, False),
    "PRPD Beef Bacon Breakfast Sandwich": (breakfast_sandwich, False),
    "Egg Bites with Potato Hash": (r.egg_bites_reconciled, False),
    "French Toast": (r.french_toast, False),
    "Grilled Cheese Breakfast Burrito": (r.breakfast_burrito, False),
    "Breakfast Quesadilla": (r.breakfast_quesadilla, False),
    "Blueberry Vanilla Protein Baked Oatmeal Squares": (baked_oatmeal_squares, False),
    "Beef Breakfast Skillet": (lambda tier: _without_component(r.breakfast_skillet(tier), MUSTARD_BBQ_COMPONENT, "Mustard BBQ"), False),
    "Beef Bacon Breakfast Pizza": (beef_bacon_breakfast_pizza, False),
    "Creamy Cajun Chicken Pasta": (r.creamy_cajun_chicken_pasta, False),
    "Harissa Honey Chicken": (r.harissa_honey_chicken, False),
    "BBQ Chicken Mac & Cheese": (r.bbq_mac, False),
    "Chicken Enchilada Bake": (lambda tier: _without_component(r.chicken_enchilada_bake(tier), WHITE_GARLIC_JALAPENO_COMPONENT, "white garlic-jalapeno"), False),
    "High-Protein Beef Lasagna": (r.high_protein_beef_lasagna, False),
    "Southwest Beef Taco Bowl": (lambda tier: _without_component(r.southwest_beef_taco_bowl(tier), WHITE_GARLIC_JALAPENO_COMPONENT, "jalapeno-lime yogurt", "white garlic-jalapeno"), False),
    "Lemon Pepper Tilapia with Garlic Potatoes": (lambda tier: _without_component(r.lemon_pepper_tilapia(tier), MUSTARD_BBQ_COMPONENT, "Mustard BBQ", "retired PRPD white-sauce"), False),
    "Braised Beef Short Rib": (braised_beef_short_rib, False),
    "Halal Cart Chicken + Yellow Rice": (lambda tier: _without_component(r.halal_cart_complete(tier), WHITE_GARLIC_COMPONENT, "white sauce"), False),
    "Hot Honey Chicken Sliders": (r.sliders, False),
    "Mexican Streetcorn Chicken Bowl": (r.streetcorn_updated, False),
    "Cheesy Achiote Chicken Tacos": (cheesy_achiote_chicken_tacos, False),
    "Meatball Arrabbiata Pasta": (meatball_arrabbiata, False),
    "Garlic Butter Wild Argentine Shrimp + Rice": (lambda tier: _replace_white_sauce(r.garlic_shrimp(tier), grams=40), False),
    "Cajun Garlic Salmon": (r.cajun_garlic_salmon, False),
    "Tandoori Chicken": (lambda tier: _without_component(r.tandoori_chicken(tier), WHITE_GARLIC_JALAPENO_COMPONENT, "white garlic-jalapeno"), False),
    "Mediterranean Chicken Bowl": (_mediterranean, False),
    "Premium NY Strip Steak": (_steak, False),
    "Baked Strawberry-Lemon Protein Cheesecake": (r.strawberry_lemon_cheesecake, True),
    "Chocolate Oreo Mousse": (r.chocolate_oreo_mousse, True),
    "High Protein Tiramisu": (r.tiramisu_complete, True),
    "Chocolate Peanut Butter Protein Brownie": (r.chocolate_peanut_butter_protein_brownie, True),
    "Oreo Protein Cheesecake Cup": (r.oreo_protein_cheesecake_cup, True),
    "Banana Cream Pie Cup": (r.banana_cream, True),
    "Oven-Baked Popcorn Chicken": (oven_baked_popcorn_chicken, True),
    "Chicken Tikka Snack Wrap": (_tikka, True),
    "Buffalo Chicken Pinwheels": (r.buffalo_chicken_pinwheels, True),
    "Mediterranean Chicken Hummus Box": (r.mediterranean_chicken_hummus_box, True),
    "PRPD Protein Box": (lambda: _without_component(r.protein_box(), MUSTARD_BBQ_COMPONENT, "Mustard BBQ", "jalapeno-yogurt", "sauce in its own sealed well or cup"), True),
    "BBQ Chicken Lavash Flatbread": (r.bbq_chicken_lavash_flatbread, True),
    "Caprese Protein Pasta Box": (r.caprese_protein_pasta_box, True),
    "Chicken Shakshuka": (lambda tier: _without_component(r.chicken_shakshuka(tier), WHITE_GARLIC_JALAPENO_COMPONENT, "white garlic-jalapeno"), False),
    "Sweet Chili Chicken with Rice": (r.sweet_chili_chicken_plain_rice, False),
    "Butter Chicken": (r.butter_chicken_no_broth, False),
    "Loaded Buffalo Chicken Potato": (r.loaded_buffalo_revised, False),
    "Beef Seekh Kabab Shawarma": (r.shan_seekh_shawarma, False),
    "Chocolate-Dipped Cookie Dough Balls": (r.cookie_dough, True),
    "High-Protein Beef Kofta & Roasted Vegetables": (_nouman_kofta, True),
    "Custom Lean Chicken Mince": (custom_lean_chicken_mince, True),
    "Custom Lebanese-Style Chicken Breast": (_nouman_lebanese_current, True),
}


HOLDS = {}


QUALITY_CHECKS = {
    private_wings.NAME: private_wings.QUALITY_CHECK,
    "Oven-Baked Popcorn Chicken": "October29 owner authorized complete recipe-based nutrient and net-weight estimates for final labels. Formula unchanged:160g raw thigh model,25g plain unfrosted Kellogg's Corn Flakes before crushing,5g flour,15g eggwhite,3g oil and measured spices/salt. Nutrients count all issued coating/oil retained; no dip. USDA flour/garlic/pepper micronutrients supplement the complete cereal panel. Physical panels, recovery, retained coating/oil, bake load,165F endpoint, net weight,12oz fit, cooling and24/72-hour reheat remain unmeasured checks, not invented results. Malt supplies gluten; contains wheat/egg.",
    "PRPD Beef Bacon Breakfast Sandwich": "Use one separate 40g current Sriracha Sweet Heat cup per meal. Confirm the purchased English-muffin and halal beef-bacon panels, egg-patty and Lean-potato yields, sauce recovery, filled cup weights and container fit before final printing.",
    "Harissa Honey Chicken": "Returning controlled PRPD adaptation with an incorporated harissa-honey glaze and no recipe-required sauce cup. Verify the actual purchased harissa jar panel and record finished glaze, chicken, rice, broccoli and packed weights; the Mina-style harissa profile and jar price remain planning placeholders.",
    "Lemon Herb Chicken Orzo": "New PRPD adaptation. Verify the purchased Barilla Orzo panel, uncrowded 500 g oven trial, edible chicken yield, dry-to-cooked orzo and roasted-vegetable yields, actual packed weight, and 24-hour reheat. Keep all oil and salt allocations separate; no recipe-required sauce cup.",
    "Hot Honey Chicken Sliders": "Use the exact King's Hawaiian Original Sweet Roll build with three Lean or four Bulk sliders and incorporated reduced-Sriracha hot-honey mayo. The source's 75% chicken-yield assumption is method-specific and still needs an exact-method capture; do not silently replace it with the separate 68.8% standard-chicken run. Verify the current roll panel and container fit. The historical photo's visible cup is stale presentation and does not authorize a recipe-required cup.",
    "Blueberry Vanilla Protein Baked Oatmeal Squares": "Labels use the owner-approved conservative estimated net weights. Still record the baked slab weight, cut eight equal squares, and continue the 24/48/72-hour texture log for recipe improvement.",
    "Cheesy Achiote Chicken Tacos": "Labels use the owner-approved conservative estimated net weights. Use Mission White Corn Street Taco tortillas and El Yucateco seasoned achiote paste, and record tortilla/reheat quality.",
    "Caprese Protein Pasta Box": "Drizzle the measured oil-free 20g balsamic-yogurt dressing over the finished chilled box before sealing; it is not packed in a cup. Keep the owner-approved conservative estimated net weight for package planning, continue the cold-hold log, and withhold customer macros and the final nutrition label until the physical Barilla Protein+ Rotini panel confirms serving grams.",
    "BBQ Chicken Mac & Cheese": "Owner approved one matching 30g BBQ side cup per meal in addition to the 30g incorporated lower-sodium BBQ finish. Keep both allocations separate and never replace the required BBQ cup with a weekly sauce selection.",
    "Cajun Garlic Salmon": "Record thawed and drained purchased salmon, skin and pin-bone loss, skinless cooked yield, quinoa yield, green-bean yield and plated weights. Use the honest branded placeholder until an exact current dish photo is approved.",
    "High-Protein Beef Kofta & Roasted Vegetables": "Preserve Nouman's successful five-log actual-96/4 house formula with drained onion and jalapeno mixed into the beef. Pack the kachumber separately.",
}


SERVICE = {
    private_wings.NAME: [{
        "name": "Purchased bottled ranch",
        "batchGroup": private_wings.RANCH_COMPONENT,
        "componentRef": private_wings.RANCH_COMPONENT,
        "cupsPerMeal": 1,
        "gramsPerMeal": private_wings.RANCH_CUP_GRAMS,
        "weightBasis": "finished",
        "planningOnly": True,
        "productPanelVerified": False,
    }, {
        "name": "Mango habanero dip",
        "batchGroup": "wings-extra-dip",
        "componentRef": "wings-extra-dip",
        "cupsPerMeal": 1,
        "gramsPerMeal": private_wings.MANGO_DIP_GRAMS,
        "weightBasis": "finished",
        "planningOnly": True,
        "productPanelVerified": False,
    }],
    # Recipe-required cups are permanent dish service. They must match the
    # named recipe and never be replaced by optional order-level sauce choices.
    "BBQ Chicken Mac & Cheese": [
        {"name": "G Hughes Sugar-Free BBQ Sauce", "batchGroup": "bbq-side-cup", "componentRef": "bbq-side-cup", "cupsPerMeal": 1, "gramsPerMeal": 30},
    ],
    "Sweet Chili Chicken with Rice": [
        {"name": "G Hughes Sugar-Free Sweet Chili Sauce", "batchGroup": "sweet-chili-side-cup", "componentRef": "sweet-chili-side-cup", "cupsPerMeal": 1, "gramsPerMeal": 30},
    ],
    "Strawberry Cheesecake Protein Pancakes": [
        {"name": "Strawberry-cheesecake topping", "batchGroup": "strawberry-cheesecake", "cupsPerMeal": 1, "weightBasis": "measured-yield"},
        {"name": "Sugar-free maple syrup", "batchGroup": "pancake-syrup", "cupsPerMeal": 1, "gramsPerMeal": 30},
    ],
    "PRPD Beef Bacon Breakfast Sandwich": [
        {"name": "PRPD Sweet Heat Sauce", "batchGroup": "sweet-heat", "cupsPerMeal": 1, "gramsPerMeal": 40},
    ],
    "French Toast": [{"name": "Sugar-free maple syrup", "batchGroup": "maple-syrup", "cupsPerMeal": 1, "gramsPerMeal": 30}],
    "Garlic Butter Wild Argentine Shrimp + Rice": [{"name": "PRPD Garlic Herb Yogurt", "batchGroup": GARLIC_HERB_COMPONENT, "componentRef": GARLIC_HERB_COMPONENT, "cupsPerMeal": 1, "gramsPerMeal": 40}],
    "Premium NY Strip Steak": [{"name": "PRPD Honey Barbecue Mustard", "batchGroup": HONEY_BBQ_MUSTARD_COMPONENT, "componentRef": HONEY_BBQ_MUSTARD_COMPONENT, "cupsPerMeal": 1, "gramsPerMeal": 45}],
    "High-Protein Beef Kofta & Roasted Vegetables": [{"name": "PRPD Sweet Heat Sauce", "batchGroup": "sweet-heat", "componentRef": SWEET_HEAT_COMPONENT, "cupsPerMeal": 2, "gramsPerMeal": 40}],
    "Custom Lean Chicken Mince": [
        {"name": "Lemon-mustard-garlic dressing", "batchGroup": NOUMAN_DRESSING_COMPONENT, "componentRef": NOUMAN_DRESSING_COMPONENT, "cupsPerMeal": 1, "gramsPerMeal": 15, "weightBasis": "raw-input"},
        {"name": "PRPD Sweet Heat Sauce", "batchGroup": "sweet-heat", "componentRef": SWEET_HEAT_COMPONENT, "cupsPerMeal": 1, "gramsPerMeal": 40},
    ],
    "Custom Lebanese-Style Chicken Breast": [
        {"name": "Lemon-mustard-garlic dressing", "batchGroup": NOUMAN_DRESSING_COMPONENT, "componentRef": NOUMAN_DRESSING_COMPONENT, "cupsPerMeal": 1, "gramsPerMeal": 15, "weightBasis": "raw-input"},
    ],
}


def recipe(name: str, tier: str, batch_number=None):
    try:
        function, single = RECIPES[name]
    except KeyError as exc:
        raise KeyError(f"Current menu recipe is not registered: {name}") from exc
    return function() if single else function(tier)


def tiers_for(name: str):
    if name == private_wings.NAME:
        return ["lean", "bulk"]
    if name in {"Chicken Shakshuka", "Halal Cart Chicken + Yellow Rice", "Sweet Chili Chicken with Rice", "Harissa Honey Chicken"}:
        return ["lean", "bulk"]
    if name in {"High-Protein Beef Kofta & Roasted Vegetables", "Custom Lean Chicken Mince", "Custom Lebanese-Style Chicken Breast"}:
        return ["lean"]
    return ["lean"]


def service(name: str, batch_number=None):
    return SERVICE.get(name, [])


# November2 owner-authorized recipe estimates for the next menu. Registering
# builders does not select/publish a menu or overwrite fulfilled Batch17 data.
from thai_basil_beef import thai_basil_beef as _thai_basil_beef
from rosemary_garlic_lamb_shoulder import rosemary_garlic_lamb_shoulder as _lamb_shoulder
from edamame_feta_crunch_box import edamame_feta_crunch_box as _edamame_box
import batch18_sauces as _batch18_sauces
from strawberry_shake_current import strawberry_shake as _strawberry_shake

RECIPES.update({
    "Creamy Chicken Parmesan": (r.creamy_chicken_parmesan, False),
    "Thai Basil Beef + Jasmine Rice": (_thai_basil_beef, False),
    "Rosemary-Garlic Lamb Shoulder": (_lamb_shoulder, False),
    "Lemon-Feta Chickpea & Edamame Crunch Box": (_edamame_box, True),
    "Strawberry Protein Shake": (_strawberry_shake, True),
})
QUALITY_CHECKS.update({
    "Thai Basil Beef + Jasmine Rice": "Owner-approved minced format. Recipe-based15-field estimate uses210/300g raw90/10,69% existing cooked/drained model, identified RedBoat fish sauce and measured finish. Contains fish. No physical test or new yield is claimed.",
    "Rosemary-Garlic Lamb Shoulder": "Owner explicitly authorized recipe-based costing/nutrition without requiring a shoulder pilot. Cooked USDA shoulder profile,700/1500 planning edible yield and conservative oil/gravy allocation are documented in the standalone model. Supplier quote and actual production weights remain unmeasured; no physical pass is invented. Contains milk/wheat.",
    "Lemon-Feta Chickpea & Edamame Crunch Box": "277.8g recipe input, not measured finished pack. Higher-protein variant uses100g cooked shelled edamame and60g drained chickpeas. All15 nutrients and every ingredient/container cost modeled. Contains milk/soy; physical tasting/fit not claimed.",
    "Strawberry Protein Shake": "Owner locked180g milk/30g FAGE with other base ingredients unchanged plus30g strawberry chunks.407g input;330g working bottle serving is proportional, not whole-batch nutrition. Prior330g fill/345g recovery were the200g-milk trial, not measured recovery for this update. Contains milk.",
})

_batch18_sauces.install_profiles()
for _sauce_id, _sauce in _batch18_sauces.SAUCES.items():
    STANDALONE_SAUCE_FORMULAS[_sauce_id] = {
        "name": _sauce["name"], "componentRef": _sauce_id,
        "gramsPerCup": 40, "batchSizeCups": 5, "batchInputGrams": 200,
        "batchSizeBasis": "theoretical composition; recovered fill not measured",
        "allergens": _sauce["allergens"], "steps": _sauce["steps"],
        "ingredients": [{"key": _batch18_sauces.ingredient_key(key),
                         "name": r.active.INGREDIENTS[_batch18_sauces.ingredient_key(key)].name,
                         "grams": grams}
                        for key, grams in _sauce["formula_g"].items()],
    }
