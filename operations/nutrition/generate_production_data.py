"""Generate browser/Node production data from the audited nutrition builds."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import calculate_active_menu as audit
import calculate_next_menu as next_menu
import mango_habanero_wings as private_wings


STATIONS = {
    "kelloggs_corn_flakes_plain": "Dry Prep & Seasonings",
    "chicken_wings_raw": "Poultry",
    "mango_habanero_sauce": "Sauces & Dairy",
    "bottled_ranch": "Sauces & Dairy",
    "kikkoman_panko": "Dry Prep & Seasonings",
    "heavy_cream": "Sauces & Dairy",
    "whole_milk": "Sauces & Dairy",
    "lemon_zest": "Cold Prep & Produce",
    "sriracha": "Sauces & Dairy",
    "regular_cream_cheese": "Sauces & Dairy",
    "canned_peas_carrots": "Cold Prep & Produce",
    "canned_peas": "Cold Prep & Produce",
    "canned_carrots": "Cold Prep & Produce",
    "cannellini_beans": "Cold Prep & Produce",
    "green_onion": "Cold Prep & Produce",
    "olive_oil": "Dry Prep & Seasonings",
    "garlic_powder": "Dry Prep & Seasonings",
    "onion_powder": "Dry Prep & Seasonings",
    "smoked_paprika": "Dry Prep & Seasonings",
    "oregano": "Dry Prep & Seasonings",
    "thyme": "Dry Prep & Seasonings",
    "cayenne": "Dry Prep & Seasonings",
    "turmeric": "Dry Prep & Seasonings",
    "oreo_pudding_mix": "Breakfast & Desserts",
    "instant_coffee": "Breakfast & Desserts",
    "granulated_sugar": "Breakfast & Desserts",
    "instant_yeast": "Dry Prep & Seasonings",
    "water": "Sauces & Dairy",
    "sunflower_oil": "Dry Prep & Seasonings",
    "chicken_thigh_cooked": "Poultry",
    "chicken_thigh_standard_cooked": "Poultry",
    "chicken_breast_cooked": "Poultry",
    "chicken_breast_raw": "Poultry",
    "chicken_mince_raw": "Poultry",
    "leg_quarter_cooked": "Poultry",
    "ny_strip_cooked": "Beef",
    "short_rib_cooked": "Beef",
    "beef_90_baked": "Beef",
    "beef_90_pan": "Beef",
    "rice_dry": "Starches & Hot Sides",
    "protein_pasta": "Starches & Hot Sides",
    "kroger_protein_pasta": "Starches & Hot Sides",
    "barilla_protein_plus_rotini": "Starches & Hot Sides",
    "protein_mac": "Starches & Hot Sides",
    "potato": "Starches & Hot Sides",
    "instant_potato_flakes": "Starches & Hot Sides",
    "bread_slice": "Breakfast & Desserts",
    "shawarma_bread": "Bread & Packaging",
    "small_tortilla": "Bread & Packaging",
    "street_taco_tortilla": "Bread & Packaging",
    "fajita_tortilla": "Bread & Packaging",
    "large_tortilla": "Bread & Packaging",
    "egg": "Breakfast & Desserts",
    "egg_white": "Breakfast & Desserts",
    "whey": "Breakfast & Desserts",
    "whey_vanilla": "Breakfast & Desserts",
    "whey_chocolate": "Breakfast & Desserts",
    "ladyfingers": "Breakfast & Desserts",
    "mascarpone": "Breakfast & Desserts",
    "philadelphia_no_bake": "Breakfast & Desserts",
    "cocoa": "Breakfast & Desserts",
    "pbfit": "Breakfast & Desserts",
    "oreo_thin": "Breakfast & Desserts",
    "brown_sugar": "Breakfast & Desserts",
    "powdered_sugar": "Breakfast & Desserts",
    "honey": "Breakfast & Desserts",
    "vanilla": "Breakfast & Desserts",
    "cinnamon": "Breakfast & Desserts",
    "strawberry": "Cold Prep & Produce",
    "banana": "Cold Prep & Produce",
    "spinach": "Cold Prep & Produce",
    "tomato": "Cold Prep & Produce",
    "red_onion": "Cold Prep & Produce",
    "parsley": "Cold Prep & Produce",
    "onion": "Cold Prep & Produce",
    "jalapeno": "Cold Prep & Produce",
    "lettuce": "Cold Prep & Produce",
    "corn": "Cold Prep & Produce",
    "broccoli": "Cold Prep & Produce",
    "pickles": "Cold Prep & Produce",
    "cilantro": "Cold Prep & Produce",
    "lime": "Cold Prep & Produce",
    "lemon": "Cold Prep & Produce",
    "garlic": "Cold Prep & Produce",
    "ginger": "Cold Prep & Produce",
    "celery": "Cold Prep & Produce",
    "rosemary": "Cold Prep & Produce",
    "bay_leaf": "Dry Prep & Seasonings",
    "beef_broth": "Sauces & Dairy",
    "fage": "Sauces & Dairy",
    "simple_truth_yogurt": "Sauces & Dairy",
    "cottage": "Sauces & Dairy",
    "mozzarella": "Sauces & Dairy",
    "fairlife_milk": "Sauces & Dairy",
    "whipped_cream": "Sauces & Dairy",
    "butter": "Sauces & Dairy",
    "light_mayo": "Sauces & Dairy",
    "salsa": "Sauces & Dairy",
    "buffalo_sauce": "Sauces & Dairy",
    "cotija": "Sauces & Dairy",
    "sweet_chili": "Sauces & Dairy",
    "soy_sauce": "Sauces & Dairy",
    "ketchup": "Sauces & Dairy",
    "mustard": "Sauces & Dairy",
    "maple_syrup": "Sauces & Dairy",
    "tomato_paste": "Sauces & Dairy",
    "broth": "Sauces & Dairy",
    "crushed_tomatoes": "Sauces & Dairy",
    "breadcrumbs": "Dry Prep & Seasonings",
    "paprika": "Dry Prep & Seasonings",
    "cumin": "Dry Prep & Seasonings",
    "chili_powder": "Dry Prep & Seasonings",
    "salt": "Dry Prep & Seasonings",
    "shan_biryani": "Dry Prep & Seasonings",
    "shan_seekh": "Dry Prep & Seasonings",
    "shan_butter_chicken": "Dry Prep & Seasonings",
    "italian_seasoning": "Dry Prep & Seasonings",
    "black_pepper": "Dry Prep & Seasonings",
    "avocado_oil": "Dry Prep & Seasonings",
    "mushroom": "Cold Prep & Produce",
    "sourdough_slice": "Bread & Packaging",
    "oats": "Breakfast & Desserts",
    "chia": "Breakfast & Desserts",
    "flour": "Dry Prep & Seasonings",
    "baking_powder": "Dry Prep & Seasonings",
    "hawaiian_roll": "Bread & Packaging",
    "kings_hawaiian_roll": "Bread & Packaging",
    "hot_sauce": "Sauces & Dairy",
    "bbq_sauce": "Sauces & Dairy",
    "beef_strips_cooked": "Beef",
    "apple": "Cold Prep & Produce",
    "sesame_oil": "Dry Prep & Seasonings",
    "cornstarch": "Dry Prep & Seasonings",
    "cucumber": "Cold Prep & Produce",
    "shrimp_cooked": "Seafood",
    "edamame": "Cold Prep & Produce",
    "peanut_butter": "Breakfast & Desserts",
    "chocolate_chips": "Breakfast & Desserts",
    "biscoff_spread": "Breakfast & Desserts",
    "biscoff_cookie": "Breakfast & Desserts",
    "banana_pudding_mix": "Breakfast & Desserts",
    "blueberry": "Cold Prep & Produce",
    "green_bell_pepper": "Cold Prep & Produce",
    "carrot": "Cold Prep & Produce",
    "zucchini": "Cold Prep & Produce",
    "english_muffin": "Bread & Packaging",
    "beef_bacon": "Beef",
    "sharifa_beef_bacon": "Beef",
    "red_chili_flakes": "Dry Prep & Seasonings",
    "tilapia_cooked": "Seafood",
    "pink_salmon_raw": "Seafood",
    "quinoa_dry": "Starches & Hot Sides",
    "green_beans": "Cold Prep & Produce",
    "black_beans": "Cold Prep & Produce",
    "parmesan": "Sauces & Dairy",
    "croutons": "Bread & Packaging",
    "mixed_vegetables": "Cold Prep & Produce",
    "harissa": "Sauces & Dairy",
    "coriander": "Dry Prep & Seasonings",
    "reduced_cream_cheese": "Sauces & Dairy",
    "beef_96_raw": "Beef",
    "part_skim_ricotta": "Sauces & Dairy",
    "part_skim_mozzarella": "Sauces & Dairy",
    "marinara": "Sauces & Dairy",
    "lasagna_sheet": "Starches & Hot Sides",
    "hummus": "Sauces & Dairy",
    "feta": "Sauces & Dairy",
    "olives": "Cold Prep & Produce",
    "enchilada_sauce": "Sauces & Dairy",
    "apple_cider_vinegar": "Sauces & Dairy",
    "bok_choy": "Cold Prep & Produce",
    "red_bell_pepper": "Cold Prep & Produce",
    "basil": "Cold Prep & Produce",
    "rice_vinegar": "Sauces & Dairy",
    "balsamic_vinegar": "Sauces & Dairy",
    "hoisin": "Sauces & Dairy",
    "white_pepper": "Dry Prep & Seasonings",
}


RAW_CONVERSIONS = {
    "chicken_thigh_cooked": ("chicken_thigh_raw", "Boneless skinless chicken thighs, raw", 0.75),
    "chicken_thigh_standard_cooked": ("chicken_thigh_raw", "Boneless skinless chicken thighs, raw", 430 / 625),
    "chicken_breast_cooked": ("chicken_breast_raw", "Boneless skinless chicken breast, raw", 0.75),
    "chicken_mince_cooked": ("chicken_mince_raw", "Pure chicken-breast mince, raw", 0.75),
    "beef_90_baked": ("beef_90_raw", "Ground beef 90/10, raw", 0.72),
    "beef_90_pan": ("beef_90_raw", "Ground beef 90/10, raw", 0.69),
    "leg_quarter_cooked": ("leg_quarter_raw", "Bone-in chicken leg quarters, raw", 0.50),
    "ny_strip_cooked": ("ny_strip_raw", "NY strip steak, raw", 0.75),
    "beef_strips_cooked": ("beef_strips_raw", "Lean beef strips, raw", 0.76),
    "shrimp_cooked": ("shrimp_raw", "Shrimp, raw peeled and deveined", 0.75),
    "tilapia_cooked": ("tilapia_raw", "Tilapia fillets, raw", 0.80),
}


MEASUREMENTS = {
    "chicken_wings_raw": {"type": "meat", "weightEstimated": True, "pieceName": "individual split flats/drumettes"},
    "chicken_thigh_raw": {"type": "meat"},
    "chicken_breast_raw": {"type": "meat"},
    "chicken_mince_raw": {"type": "meat"},
    "beef_90_raw": {"type": "meat"},
    "leg_quarter_raw": {"type": "meat", "gramsPerPiece": 400, "pieceName": "leg quarters"},
    "ny_strip_raw": {"type": "meat"},
    "beef_strips_raw": {"type": "meat"},
    "shrimp_raw": {"type": "meat"},
    "tilapia_raw": {"type": "meat"},
    "pink_salmon_raw": {"type": "meat"},
    "beef_96_raw": {"type": "meat"},
    "salt": {"type": "spice", "gramsPerTsp": 6.0},
    "paprika": {"type": "spice", "gramsPerTsp": 2.3},
    "cumin": {"type": "spice", "gramsPerTsp": 2.1},
    "chili_powder": {"type": "spice", "gramsPerTsp": 2.7},
    "black_pepper": {"type": "spice", "gramsPerTsp": 2.3},
    "garlic_powder": {"type": "spice", "gramsPerTsp": 3.1},
    "onion_powder": {"type": "spice", "gramsPerTsp": 2.4},
    "coriander": {"type": "spice", "gramsPerTsp": 1.8},
    "cayenne": {"type": "spice", "gramsPerTsp": 1.8},
    "thyme": {"type": "spice", "gramsPerTsp": 1.0},
    "turmeric": {"type": "spice", "gramsPerTsp": 3.0},
    "oregano": {"type": "spice", "gramsPerTsp": 1.0},
    "white_pepper": {"type": "spice", "gramsPerTsp": 2.4},
    "baking_powder": {"type": "spice", "gramsPerTsp": 4.0},
    "cinnamon": {"type": "spice", "gramsPerTsp": 2.6},
    "cocoa": {"type": "spice", "gramsPerTsp": 2.5},
    "powdered_sugar": {"type": "spice", "gramsPerTsp": 2.5},
    "brown_sugar": {"type": "spice", "gramsPerTsp": 4.0},
    "shan_seekh": {"type": "packet", "gramsPerPacket": 50.0},
    "shan_butter_chicken": {"type": "packet", "gramsPerPacket": 50.0},
    "bay_leaf": {"type": "piece", "gramsPerPiece": 0.2, "pieceName": "bay leaf", "pieceNamePlural": "bay leaves"},
    "vanilla": {"type": "liquid", "density": 0.88},
    "fairlife_milk": {"type": "liquid", "density": 1.03},
    "lemon": {"type": "liquid", "density": 1.03},
    "lime": {"type": "liquid", "density": 1.03},
    "broth": {"type": "liquid", "density": 1.0},
    "avocado_oil": {"type": "liquid", "density": 0.91},
    "maple_syrup": {"type": "liquid", "density": 1.30},
    "buffalo_sauce": {"type": "liquid", "density": 1.05},
    "sweet_chili": {"type": "liquid", "density": 1.10},
    "soy_sauce": {"type": "liquid", "density": 1.16},
    "ketchup": {"type": "liquid", "density": 1.14},
    "mustard": {"type": "liquid", "density": 1.04},
    "salsa": {"type": "liquid", "density": 1.0},
    "honey": {"type": "liquid", "density": 1.42},
    "sriracha": {"type": "liquid", "density": 1.10},
    "rice_vinegar": {"type": "liquid", "density": 1.01},
    "balsamic_vinegar": {"type": "liquid", "density": 1.06},
    "hoisin": {"type": "liquid", "density": 1.18},
    "olive_oil": {"type": "liquid", "density": 0.91},
}


def line_for(portion: audit.Portion) -> dict:
    ingredient = audit.INGREDIENTS[portion.ingredient]
    key = portion.ingredient
    name = ingredient.name
    amount = portion.amount
    note = portion.note
    if key in RAW_CONVERSIONS:
        source_key = key
        key, name, yield_rate = RAW_CONVERSIONS[key]
        amount = portion.amount / yield_rate
        note = (
            "Raw purchasing/prep quantity; measured 68.8% cooked yield from the October 7 component test."
            if source_key == "chicken_thigh_standard_cooked"
            else f"Raw purchasing/prep quantity; modeled {yield_rate:.0%} cooked yield."
        )
    line = {
        "key": key,
        "sourceKey": portion.ingredient,
        "name": name,
        "amount": round(amount, 4),
        "unit": portion.unit,
        "station": STATIONS.get(key, STATIONS.get(portion.ingredient, "Other")),
        "note": note,
        "confidence": ingredient.confidence,
    }
    if portion.note.startswith('component:'):
        line['allocations'] = {portion.note.split(':',1)[1]: round(amount,4)}
    if key in MEASUREMENTS:
        line["measure"] = MEASUREMENTS[key]
    return line


def build_lines(build: audit.Build) -> list[dict]:
    combined: dict[tuple[str, str], dict] = {}
    for portion in build.portions:
        line = line_for(portion)
        marker = (line["key"], line["unit"])
        if marker not in combined:
            combined[marker] = line
        else:
            combined[marker]["amount"] = round(combined[marker]["amount"] + line["amount"], 4)
            for component, amount in line.get('allocations', {}).items():
                allocations = combined[marker].setdefault('allocations', {})
                allocations[component] = round(allocations.get(component, 0) + amount, 4)
            if line["note"] and line["note"] not in combined[marker]["note"]:
                combined[marker]["note"] = "; ".join(filter(None, [combined[marker]["note"], line["note"]]))
    return list(combined.values())


def generate_archived_batch12(*, include_archived_custom: bool = False) -> dict:
    meals = {}
    active_by_name = {meal.name: meal for meal in audit.MEALS}
    next_by_name = {meal.name: meal for meal in next_menu.MEALS}
    ids = ["b1", "b2", "b3", "b4", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "d1", "d2", "d3", "a1", "a2", "a3"]
    if len(ids) != len(next_menu.MEALS):
        raise ValueError("Production ID map and controlled menu length differ.")
    batch_menu = [(meal_id, meal, meal.name) for meal_id, meal in zip(ids, next_menu.MEALS)]
    for meal_id, meal, display_name in batch_menu:
        tiers = {
            "single" if meal.bulk is None else "lean": {
                "ingredients": build_lines(meal.lean),
                "confidence": meal.lean.confidence,
                "assumptions": meal.lean.assumptions,
            }
        }
        if meal.bulk is not None:
            tiers["bulk"] = {
                "ingredients": build_lines(meal.bulk),
                "confidence": meal.bulk.confidence,
                "assumptions": meal.bulk.assumptions,
            }
        meals[meal_id] = {
            "name": display_name,
            "category": (
                getattr(meal, "category", None)
                or ("Breakfast" if meal_id.startswith("b") else "Dessert" if meal_id.startswith("d") else "Main")
            ),
            "status": getattr(meal, "decision", None) or getattr(meal, "status", ""),
            "recommendation": getattr(meal, "validation", None) or getattr(meal, "recommendation", ""),
            "tiers": tiers,
        }
        if meal_id.startswith("p"):
            meals[meal_id]["plannerOnly"] = True

    # Component recipes for the Build-a-Week exclusive. Orders store one
    # bundle line, while the planner expands it into these five individual
    # Lean meal builds for groceries, cooking, labels, and pack-out.
    for meal_id, display_name, recipe in (
        ("x1", "Harissa Honey Chicken", next_menu.with_batch8_purchased_oil(next_menu.harissa_honey_chicken("lean"))),
        ("x2", "Loaded Buffalo Chicken Potato", next_menu.with_batch8_purchased_oil(next_menu.loaded_buffalo_revised("lean"))),
    ):
        meals[meal_id] = {
            "name": display_name,
            "category": "Main",
            "status": "Batch 12 menu-exclusive bundle component",
            "recommendation": "Produce only from an active Build-a-Week order; record finished component yield and individual meal weight.",
            "plannerOnly": True,
            "tiers": {"lean": {
                "ingredients": build_lines(recipe),
                "confidence": recipe.confidence,
                "assumptions": recipe.assumptions,
            }},
        }

    # Paid, internal-only Batch 8 custom meals. These are deliberately absent
    # from the public order config, but must be first-class production recipes
    # so the grocery builder and cook-day planner cannot silently omit them.
    def custom_tier(ingredients: list[dict], assumptions: list[str]) -> dict:
        return {"ingredients": ingredients, "confidence": "medium", "assumptions": assumptions}

    def line(key: str, name: str, amount: float, station: str, note: str = "", measurement: dict | None = None) -> dict:
        item = {"key": key, "name": name, "amount": amount, "unit": "g", "station": station, "note": note, "confidence": "medium"}
        if measurement:
            item["measure"] = measurement
        return item

    meals.update({
        "p1": {
            "name": "High-Protein Beef Kofta & Roasted Vegetables",
            "aliases": ["96/4 Beef Kofta", "96/4 Beef Kofta Meal", "Beef Kofta", "Beef Kafta", "Custom Drained Ground Beef Mince", "Custom Drained Ground Beef Mince Meal"],
            "category": "Internal custom meal",
            "status": "Batch 10 Nouman custom rotation",
            "recommendation": "Use the confirmed 96/4 beef, form kofta on Prep Day, and record raw pull, cooked yield, and plated weight.",
            "plannerOnly": True,
            "tiers": {"lean": {
                "ingredients": build_lines(next_menu.nouman_kofta(next_menu)),
                "confidence": "medium",
                "assumptions": next_menu.nouman_kofta(next_menu).assumptions,
            }},
        },
        "p2": {
            "name": "Custom Lean Chicken Mince",
            "aliases": ["Custom Lean Chicken Mince Meal"],
            "category": "Internal custom meal",
            "status": "Paid Batch 8 custom rotation",
            "recommendation": "Record purchased label, raw pull, cooked yield, and plated weight before publishing nutrition.",
            "plannerOnly": True,
            "tiers": {"lean": custom_tier([
                line("chicken_mince_raw", "Pure chicken-breast mince, raw", 300, "Poultry", "Cook to 165 F.", {"type": "meat"}),
                line("green_beans", "Green beans", 175, "Cold Prep & Produce"),
                line("red_onion", "Red onion", 50, "Cold Prep & Produce"),
                line("garlic", "Minced garlic", 6, "Cold Prep & Produce"),
                line("lemon", "Lemon juice", 15, "Cold Prep & Produce"),
                line("parsley", "Flat-leaf parsley", 5, "Cold Prep & Produce"),
                line("paprika", "Paprika", 1, "Dry Prep & Seasonings", measurement={"type": "spice", "gramsPerTsp": 2.3}),
                line("cumin", "Ground cumin", 0.5, "Dry Prep & Seasonings", measurement={"type": "spice", "gramsPerTsp": 2.1}),
                line("black_pepper", "Ground black pepper", 0.5, "Dry Prep & Seasonings"),
                line("salt", "Salt", 1, "Dry Prep & Seasonings", measurement={"type": "spice", "gramsPerTsp": 6.0}),
            ], ["Owner confirmed the Batch 8 mince is pure lean chicken-breast meat.", "Use 300g raw mince per meal and record the cooked yield."])},
        },
        "p3": {
            "name": "Custom Lebanese-Style Chicken Breast",
            "aliases": ["Custom Lebanese-Style Chicken Breast Meal"],
            "category": "Internal custom meal",
            "status": "Batch 10 Nouman custom control",
            "recommendation": "Portion 225g cooked chicken and keep the salad and dressing cold and separate.",
            "plannerOnly": True,
            "tiers": {"lean": custom_tier([
                line("chicken_breast_raw", "Boneless skinless chicken breast, raw", 300, "Poultry", "Target 225g cooked from a provisional 75% yield.", {"type": "meat"}),
                line("lemon", "Lemon juice", 20, "Cold Prep & Produce"),
                line("garlic", "Minced garlic", 4, "Cold Prep & Produce"),
                line("avocado_oil", "Avocado oil", 3, "Dry Prep & Seasonings", measurement={"type": "liquid", "density": 0.92}),
                line("paprika", "Paprika", 1, "Dry Prep & Seasonings", measurement={"type": "spice", "gramsPerTsp": 2.3}),
                line("cumin", "Ground cumin", 0.5, "Dry Prep & Seasonings", measurement={"type": "spice", "gramsPerTsp": 2.1}),
                line("black_pepper", "Ground black pepper", 0.5, "Dry Prep & Seasonings"),
                line("salt", "Salt", 1, "Dry Prep & Seasonings", measurement={"type": "spice", "gramsPerTsp": 6.0}),
                line("lettuce", "Lettuce", 60, "Cold Prep & Produce"),
                line("cucumber", "Cucumber", 60, "Cold Prep & Produce"),
                line("tomato", "Tomato", 60, "Cold Prep & Produce"),
                line("red_onion", "Red onion", 15, "Cold Prep & Produce"),
                line("parsley", "Flat-leaf parsley", 5, "Cold Prep & Produce"),
            ], ["Sumac remains excluded from this controlled version.", "Pack the hot chicken, 200g cold salad, and 15g dressing separately."])},
        },
    })

    # Previous-batch private custom recipes are not carried into Batch 11.
    if not include_archived_custom:
        for stale_id in ("p1", "p2", "p3"):
            meals.pop(stale_id, None)

    return {
        "version": "2026-09-24.2",
        "batch": 12,
        "notice": "Batch 12 production quantities are generated from the owner-selected recipe builds, including exact Build-a-Week component expansion. Final cooked yields must be measured.",
        "meals": meals,
        "recipeLibrary": {
            "Butter Chicken": {"name": "Butter Chicken", "tiers": {
                tier: {"ingredients": build_lines(next_menu.butter_chicken_no_broth(tier)),
                       "assumptions": next_menu.butter_chicken_no_broth(tier).assumptions}
                for tier in ["lean", "bulk"]
            }},
            "Chicken Enchilada Bake": {"name": "Chicken Enchilada Bake", "tiers": {
                tier: {"ingredients": build_lines(next_menu.with_batch8_purchased_oil(next_menu.chicken_enchilada_bake(tier))),
                       "assumptions": next_menu.chicken_enchilada_bake(tier).assumptions}
                for tier in ["lean", "bulk"]
            }},
        },
    }


def generate(*, include_archived_custom: bool = False) -> dict:
    root = Path(__file__).resolve().parents[2]
    config = json.loads(subprocess.check_output(
        ['node', '-e', "console.log(JSON.stringify(require('./config/order-config')))"],
        cwd=root, text=True))
    import current_recipe_registry as current
    meals = {}
    for section,category,tiers in [('breakfasts','Breakfast',['lean','bulk']),
        ('mains','Main',['lean','bulk']),('premium','Premium meal',['lean','bulk']),('desserts','Dessert',['single']),
        ('addons','Add-on',['single']),('plannerOnly','Internal custom meal',['lean'])]:
        items = config.get(section,[]) if section == 'plannerOnly' else config['menu'][section]
        for item in items:
            name = item['name']
            builds = {}
            item_tiers = current.tiers_for(name) if section == 'plannerOnly' else tiers
            for tier in item_tiers:
                record = current.recipe(name, tier, config['batch']['number'])
                # Batch 15 is a completed historical run. Preserve its recorded
                # Protein Box mustard cup in the generated snapshot even though
                # the October 19 current registry removes that cup for all future
                # batches. The Cook-Day Planner has the matching Batch 15-only
                # service override and must retain the ingredients it packed.
                if config['batch']['number'] == 15 and name == 'PRPD Protein Box':
                    record = current._mustard_bbq_45(next_menu.protein_box())
                builds[tier] = {'ingredients':build_lines(record),
                    'confidence':record.confidence,
                    'assumptions':record.assumptions}
                if name == private_wings.NAME:
                    builds[tier].update(private_wings.production_tier_metadata(tier))
                    for line in builds[tier]['ingredients']:
                        if line['key'] == private_wings.WING_KEY:
                            line['minimumPieces'] = private_wings.PIECES[tier]
                            line['pieceCountBasis'] = 'individual split flats/drumettes'
                            line['estimatedWeight'] = True
                            line['note'] += '; Batch 19 lot average: 3768 g / 49 split pieces; weigh actual portion pulls.'
            meals[item['id']] = {'name':name,'category':category,'aliases':item.get('aliases',[]),
                'status':f"Batch {config['batch']['number']} controlled planning recipe",
                'recommendation':current.QUALITY_CHECKS.get(name, 'Confirm actual purchased panels and measured yields.'),
                'tiers':builds,'plannerOnly':section == 'plannerOnly'}
            if name == private_wings.NAME:
                meals[item['id']].update({
                    'status': 'Batch 19 purchased wing lot measured; approved sauce products identified; exact package panels, cooked yield, and published macro reconciliation pending',
                    'labelsEnabled': False, 'nutritionComplete': False,
                    'finalLabelReady': False, 'nutritionReleaseHold': private_wings.LABEL_RELEASE_HOLD,
                })
            service = current.service(name, config['batch']['number'])
            if service:
                meals[item['id']]['service'] = {'sideCupComponents': service}
            if name in current.HOLDS:
                meals[item['id']]['productionHold'] = current.HOLDS[name]
            if name in current.QUALITY_CHECKS:
                meals[item['id']]['qualityChecks'] = current.QUALITY_CHECKS[name]
    return {'version':f"batch-{config['batch']['number']}-current-v2",'batch':config['batch']['number'],
        'notice':'Generated from the effective current order configuration. Missing current recipes stop generation instead of loading an archived batch. Recipe-required side cups come from the current structured service records; weekly promotional sauce rules must be added separately and explicitly. Owner-released production-run quality checks remain visible.',
        'meals':meals,'recipeLibrary':{},'sauceFormulas':current.STANDALONE_SAUCE_FORMULAS}


def main() -> None:
    output = Path(__file__).with_name("production-data.js")
    payload = json.dumps(generate(), indent=2, ensure_ascii=True)
    output.write_text(
        f"const PRPD_PRODUCTION_DATA = {payload};\n\n"
        "if (typeof window !== 'undefined') window.PRPD_PRODUCTION_DATA = PRPD_PRODUCTION_DATA;\n"
        "if (typeof module !== 'undefined' && module.exports) module.exports = PRPD_PRODUCTION_DATA;\n",
        encoding="utf-8",
    )
    print(output)


if __name__ == "__main__":
    main()
