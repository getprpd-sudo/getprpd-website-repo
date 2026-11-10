"""Planning packed costs for the explicitly routed current menu.

The recipe quantities come from the current batch's named recipe registry. Shared
ingredient prices come from the active-menu cost model so the two reports cannot
silently use different purchase prices. Supplemental products remain visibly
marked as planning or legacy references until a receipt replaces them.
"""

from __future__ import annotations

from pathlib import Path
import hashlib
import importlib.util
import json
import sys
import subprocess
import math
from datetime import date
from functools import lru_cache
from types import SimpleNamespace


ROOT = Path(__file__).resolve().parents[2]
ACTIVE_COST_PATH = ROOT / "operations" / "costing" / "calculate_active_menu_costs.py"
NEXT_NUTRITION_PATH = ROOT / "operations" / "nutrition" / "calculate_next_menu.py"
OUTPUT_PATH = ROOT / "operations" / "costing" / "NEXT_MENU_DRAFT_COST_AUDIT.md"
OUTPUT_JSON_PATH = ROOT / "api" / "_current-menu-costs-data.json"
OUTPUT_JS_PATH = ROOT / "operations" / "costing" / "current-menu-costs.js"
HISTORY_JSON_PATH = ROOT / "api" / "_historical-menu-costs-data.json"
HISTORY_JS_PATH = ROOT / "operations" / "costing" / "historical-menu-costs.js"


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


active_costs = load_module("prpd_active_costs_for_next", ACTIVE_COST_PATH)
CostBasis = active_costs.CostBasis
per_g = active_costs.per_g
each = active_costs.each


def configured_items(config):
    items = [item for group in config["menu"].values() for item in group]
    all_items = items + config.get("plannerOnly", [])
    for field in ("id", "name"):
        values = [item[field].strip().lower() for item in all_items]
        if len(values) != len(set(values)):
            raise ValueError(f"Duplicate configured {field}; cost routing is ambiguous")
    return items


def load_nutrition_module(config=None):
    config = current_config() if config is None else config
    batch_number = config["batch"]["number"]
    if batch_number not in {13, 14, 15, 16, 17}:
        raise ValueError(f"No cost recipe registry configured for Batch {batch_number}")
    configured_items(config)
    sys.path.insert(0, str(NEXT_NUTRITION_PATH.parent))
    registry_path = NEXT_NUTRITION_PATH.with_name(
        "batch13_recipes.py" if batch_number == 13 else "current_recipe_registry.py"
    )
    registry = load_module(f"prpd_batch{batch_number}_cost_registry", registry_path)
    registry._cost_batch_number = batch_number
    categories = {"breakfasts": "Breakfast", "mains": "Main", "premium": "Premium meal", "desserts": "Dessert", "addons": "Add-on"}
    meals = []
    for section, items in config["menu"].items():
        for item in items:
            if item.get("variants"):
                continue
            name = item["name"]
            if name not in registry.RECIPES:
                raise ValueError(f"No exact current recipe match: {name}")
            single = registry.RECIPES[name][1]
            if single == bool(item.get("bulkMacros")):
                raise ValueError(f"Recipe/config tier mismatch: {name}")
            meals.append(registry.r.DraftMeal(
                name, categories[section], registry.recipe(name, "single" if single else "lean"),
                None if single else registry.recipe(name, "bulk"),
                "Current registry planning formula, not measured consumption",
                registry.HOLDS.get(name, "Record physical yields and consumed inventory before actual margin."),
            ))
    return SimpleNamespace(MEALS=meals, active=registry.r.active, registry=registry, config=config)


# Shared ingredients inherit the latest confirmed values from the active model.
# Only next-menu-specific products are added here.
COSTS = dict(active_costs.COSTS)
COSTS.update({
    "kelloggs_corn_flakes_plain": per_g(4.98,510.291,"planning","Walmart web18oz Kellogg's Corn Flakes product10818608 reference checked2026-10-28, not local stock or receipt; weigh25g BEFORE crushing"),
    "kikkoman_panko": per_g(3.00,227,"planning","Unverified $3 allowance for227g Kikkoman Panko; not a supplier quote or receipt"),
    "barilla_orzo_dry": per_g(1.88, 453.592, "planning", "Barilla US Classic Orzo16oz GTIN00076808513981, Walmart product10309188 $1.88 reference checked2026-10-26; exact local store stock and receipt unverified"),
    "kroger_protein_pasta": per_g(3.00, 340, "legacy", "Earlier PRPD ingredient-price document; exact current Kroger SKU and receipt required"),
    "barilla_protein_plus_rotini": per_g(2.88, 411, "planning", "Official Barilla 14.5 oz package identity; $2.88 is a historical Barilla pasta receipt reference, not a verified Rotini receipt"),
    "short_rib_cooked": per_g(5.99, 453.592 * .496, "owner-quoted", "EPIC bone-in short rib at $5.99/lb with USDA 49.6% as-purchased-to-edible cooked planning yield"),
    "beef_broth": per_g(3.50, 907, "planning", "Verified low-sodium halal beef broth planning allowance; replace with purchased package"),
    "celery": per_g(1.50, 450, "planning", "One celery bunch planning allowance"),
    "rosemary": per_g(1.98, 28, "planning", "One fresh rosemary clamshell planning allowance"),
    "bay_leaf": per_g(2.00, 14, "planning", "Dried bay leaf jar planning allowance"),
    "shan_biryani": per_g(2.49,50,"planning","50g Shan Biryani powder packet planning allowance only; replace with receipt"),
    "shan_seekh": per_g(2.49,50,"planning","50g Shan Seekh Kabab packet planning allowance only; replace with receipt"),
    "shan_butter_chicken": per_g(2.49,50,"planning","50g Shan Butter Chicken powder packet planning allowance only; replace with receipt"),
    "regular_cream_cheese": per_g(3.48, 226.8, "planning", "8 oz original cream cheese planning allowance; verify receipt"),
    "canned_peas_carrots": per_g(1.23, 241, "verified", "Del Monte peas and carrots 8.5 oz, Walmart online 2026-09-09"),
    "street_taco_tortilla": each(8.49, 12, "planning", "Mission Carb Balance whole-wheat street-taco tortillas, 12-count Walmart online planning price checked 2026-09-24"),
    "cannellini_beans": per_g(0.92, 250, "planning", "Great Value cannellini beans 15.5 oz; conservative usable-drained estimate, Walmart online 2026-09-09"),
    "green_onion": per_g(.98, 100, "planning", "Usable bunch estimate; verify weight and receipt"),
    "olive_oil": per_g(8, 690, "planning", "750mL bottle planning allowance; density0.92"),
    "garlic_powder": per_g(1.24, 96, "planning", "Spice jar estimate"),
    "onion_powder": per_g(1.24, 92, "planning", "Spice jar estimate"),
    "smoked_paprika": per_g(2.48, 57, "planning", "Spice jar estimate"),
    "oregano": per_g(1.24, 21, "planning", "Spice jar estimate"),
    "thyme": per_g(1.24, 21, "planning", "Spice jar estimate"),
    "cayenne": per_g(1.24, 50, "planning", "Spice jar estimate"),
    "turmeric": per_g(1.24, 57, "planning", "Spice jar estimate"),
    "oreo_pudding_mix": per_g(1.98, 120, "planning", "4.2 oz packet estimate; verify receipt"),
    "instant_coffee": per_g(4.48, 85, "planning", "3 oz instant coffee estimate; verify receipt"),
    "granulated_sugar": per_g(3.24, 1814, "planning", "4 lb sugar estimate"),
    "mushroom": per_g(2.08, 227, "planning", "Generic 8 oz package estimate"),
    "sourdough_slice": each(4.00, 20, "planning", "Planning loaf estimate"),
    "sriracha": per_g(2.38, 255, "legacy", "Earlier PRPD ingredient-price document"),
    "oats": per_g(2.98, 1191, "legacy", "Earlier PRPD ingredient-price document"),
    "chia": per_g(8.48, 907, "planning", "Generic 2 lb package estimate"),
    "flour": per_g(2.43, 2268, "planning", "Generic 5 lb all-purpose flour estimate"),
    "baking_powder": per_g(2.00, 230, "planning", "Generic package estimate"),
    "hawaiian_roll": each(4.98, 12, "planning", "Sara Lee Artesano Bakery Rolls 12-count planning estimate; replace with receipt"),
    "kings_hawaiian_roll": each(7.49, 24, "planning", "King's Hawaiian Original Sweet Rolls 24-count, UPC 00073435002307; replace planning price with receipt"),
    "hot_sauce": per_g(3.60, 354, "verified", "Valentina Black Label 12 oz, Restaurant Depot receipt 2026-08-27"),
    "sunflower_oil": per_g(14.99, 4600, "verified", "Altunsa sunflower oil 5 L, EPIC Market receipt 2026-08-27; modeled at 0.92g/mL"),
    "bbq_sauce": per_g(11.89, 3785, "verified", "One-gallon bulk BBQ sauce, Restaurant Depot receipt 2026-08-27"),
    "protein_mac": per_g(2.47, 337, "planning", "Current 11.9 oz box; exact receipt price still pending"),
    "beef_strips_cooked": per_g(4.99, 453.592, "verified", "$4.99/lb EPIC Market boneless beef purchase, 2026-08-27"),
    "apple": per_g(1.48, 453.592, "planning", "Generic produce estimate"),
    "sesame_oil": per_g(5.00, 148, "legacy", "Earlier PRPD ingredient-price document"),
    "cornstarch": per_g(2.00, 454, "legacy", "Earlier PRPD ingredient-price document"),
    "cucumber": per_g(0.98, 453.592, "planning", "Generic produce estimate"),
    "shrimp_cooked": per_g(13.89, 907.184, "verified", "Current $13.89 per 2 lb raw shrimp purchase"),
    "edamame": per_g(1.92, 340, "legacy", "Earlier PRPD ingredient-price document"),
    "ny_strip_cooked": per_g(10.49, 453.592, "verified", "$10.49/lb current NY strip purchase"),
    "peanut_butter": per_g(3.00, 510, "legacy", "Earlier PRPD ingredient-price document"),
    "chocolate_chips": per_g(4.96, 340, "verified", "Walmart receipt 2026-07-23, 12 oz bag"),
    "biscoff_spread": per_g(5.00, 400, "legacy", "Earlier PRPD ingredient-price document"),
    "biscoff_cookie": each(4.00, 32, "legacy", "Earlier PRPD ingredient-price document"),
    "banana_pudding_mix": per_g(2.06, 144, "verified", "Walmart receipt 2026-07-23, 5.1 oz box"),
    "blueberry": per_g(3.12, 453.592, "planning", "Walmart Great Value frozen blueberries 16 oz current planning reference"),
    "green_bell_pepper": per_g(0.78, 160, "planning", "User-supplied $0.78 each; modeled at 160g usable weight"),
    "carrot": per_g(2.08, 907.184, "verified", "Walmart receipt 2026-07-23, 2 lb bag"),
    "zucchini": per_g(1.42, 453.592, "verified", "User-supplied $1.42/lb"),
    "beef_bacon": each(51.06, 113, "planning", "Deen Halal 5 lb case; modeled as 113 x 20 g slices"),
    "english_muffin": each(3.49, 6, "planning", "Six-count English muffin planning reference"),
    "mixed_vegetables": per_g(0.98, 340, "verified", "12 oz frozen peas-and-carrots planning reference; replace with the latest receipt price"),
    "tilapia_cooked": per_g(4.37, 453.592, "planning", "Walmart tilapia planning reference at $4.37/lb raw"),
    "harissa": per_g(8.99, 283, "planning", "Current 10 oz harissa-paste planning estimate"),
    "carolina_gold": per_g(3.98, 510, "planning", "Current H-E-B 18 oz G Hughes Carolina Gold planning price"),
    "whey_vanilla": per_g(32.50, 663, "verified", "PRPD confirmed Premier Protein powder midpoint"),
    "whey_chocolate": per_g(32.50, 663, "verified", "PRPD confirmed Premier Protein powder midpoint"),
    "coriander": per_g(3.98, 198, "planning", "Current ground-coriander planning estimate"),
    "reduced_cream_cheese": per_g(3.48, 226.8, "planning", "Current 8 oz reduced-fat cream-cheese planning estimate"),
    "instant_potato_flakes": per_g(2.56, 389, "planning", "Idahoan Original mashed potatoes 13.75 oz Walmart planning price; replace with receipt"),
    "water": per_g(0, 1000, "verified", "Kitchen tap water"),
    "pink_salmon_raw": per_g(11.46, 907.184, "planning", "Great Value wild-caught pink salmon two-pound bag at $5.73/lb; verify receipt"),
    "quinoa_dry": per_g(4.96, 907.184, "planning", "Generic two-pound dry quinoa planning estimate"),
    "green_beans": per_g(2.48, 907.184, "planning", "Generic two-pound frozen green-bean planning estimate"),
    "black_beans": per_g(0.88, 425, "planning", "Generic 15 oz canned black beans"),
    "parmesan": per_g(4.98, 227, "planning", "Generic eight-ounce grated Parmesan estimate"),
    "croutons": per_g(1.98, 142, "planning", "Generic five-ounce crouton package estimate"),
    "beef_96_raw": per_g(5.98, 453.592, "planning", "Working $5.98/lb 96/4 lean ground-beef estimate; replace with receipt"),
    "black_pepper": per_g(3.98, 85, "planning", "Generic three-ounce ground black-pepper estimate"),
    "parsley": per_g(0.97, 60, "verified", "Walmart receipt 2026-08-26, one fresh parsley bunch"),
    "red_onion": per_g(1.28, 453.592, "planning", "Generic red-onion produce estimate"),
    "pbfit": per_g(9.98, 850, "planning", "PBfit 30 oz package planning estimate; replace with receipt"),
    "part_skim_ricotta": per_g(3.48, 425, "planning", "Generic 15 oz part-skim ricotta estimate"),
    "part_skim_mozzarella": per_g(2.48, 226.8, "planning", "Generic eight-ounce part-skim mozzarella estimate"),
    "marinara": per_g(2.48, 680, "planning", "Generic 24 oz marinara estimate"),
    "italian_seasoning": per_g(1.24, 28, "planning", "Generic one-ounce Italian-seasoning estimate"),
    "lasagna_sheet": each(2.98, 12, "planning", "Generic 12-sheet oven-ready lasagna box estimate"),
    "hummus": per_g(3.48, 283, "planning", "Generic ten-ounce hummus estimate"),
    "feta": per_g(3.48, 170, "planning", "Generic six-ounce feta estimate"),
    "olives": per_g(1.98, 170, "planning", "Generic six-ounce drained black-olive estimate"),
    "enchilada_sauce": per_g(1.98, 283, "planning", "Generic ten-ounce red enchilada sauce estimate"),
    "apple_cider_vinegar": per_g(2.54, 946, "planning", "Great Value apple cider vinegar 32 fl oz, Walmart online 2026-09-21; modeled at approximately 1g/mL"),
    "balsamic_vinegar": per_g(3.92, 250, "planning", "Great Value balsamic vinegar 8.45 fl oz, Walmart online 2026-09-21; modeled at approximately 1g/mL"),
    "basil": per_g(1.78, 14.175, "planning", "Fresh basil 0.5 oz clamshell, Walmart online 2026-09-21"),
    "corn_street_tortilla": each(2.48, 24, "planning", "Mission White Corn Street Taco tortillas, 24-count, UPC 073731071502; exact product identity with planning price, confirm the physical panel because retailer listings conflict"),
    "achiote_paste": per_g(3.00, 100, "planning", "El Yucateco seasoned achiote paste 100g, EAN 7501017660039; exact product identity with planning price until receipt"),
    "chicken_mince_cooked": per_g(5.99, 453.592, "verified", "EPIC Market receipt 2026-08-27: owner-identified halal lean chicken-breast mince at $5.99/lb raw"),
    "lavash": each(3.99, 4, "planning", "Joseph's lavash four-count planning estimate; replace with receipt"),
})

# Batch 13 receipt evidence. Prices without an established package weight stay
# planning-grade. The receipt's 80/20 beef is NOT a 90/10 or 96/4 price match.
COSTS.update({
    "chicken_thigh_cooked": per_g(3.29, 453.592, "verified", "EPIC receipt 2026-10-01: owner-identified boneless thighs at $3.29/lb raw"),
    "chicken_thigh_standard_cooked": per_g(3.29, 453.592, "verified", "EPIC receipt 2026-10-01: owner-identified boneless thighs at $3.29/lb raw; October 7 direct-component yield is 430/625"),
    "chicken_breast_cooked": per_g(2.49, 453.592, "verified", "EPIC receipt 2026-10-01: breast at $2.49/lb raw"),
    "ny_strip_cooked": per_g(10.99, 453.592, "planning", "EPIC receipt 2026-10-01: steak $10.99/lb; exact NY strip cut not printed, confirm cut"),
    "pink_salmon_raw": per_g(12.47, 907.184, "planning", "Walmart receipt 2026-10-01: frozen salmon $12.47/bag; owner-recorded 2 lb bag, verify panel/usable yield"),
    "shan_biryani": per_g(2.29, 50, "planning", "EPIC receipt 2026-10-01: 3 packets $6.87; 50 g packet is recipe assumption, verify package"),
    "onion": per_g(.94, 453.592, "verified", "Walmart receipt 2026-10-01: onions $0.94/lb"),
    "tomato": per_g(.97, 453.592, "verified", "Walmart receipt 2026-10-01: Roma tomato $0.97/lb"),
    "ginger": per_g(3.97, 453.592, "verified", "Walmart receipt 2026-10-01: ginger $3.97/lb"),
    "jalapeno": per_g(1.32, 453.592, "verified", "Walmart receipt 2026-10-01: jalapeno $1.32/lb"),
    "zucchini": per_g(1.42, 453.592, "verified", "Walmart receipt 2026-10-01: zucchini $1.42/lb"),
})

# Reuse the existing purchasing assumptions rather than inventing new bases for
# ingredients newly introduced by the current registry.
catalog = json.loads(subprocess.check_output(["node", "-e", "process.stdout.write(JSON.stringify(require('./operations/grocery-catalog.js').catalog))"], cwd=ROOT, text=True))
for key in ("heavy_cream", "whole_milk", "lemon_zest", "instant_yeast", "beef_96_raw"):
    entry = catalog[key]
    COSTS[key] = per_g(entry["price"], entry["packageSize"], "planning", f"{entry['packageLabel']}; {entry['store']}")


RAW_YIELD = dict(active_costs.RAW_YIELD)
RAW_YIELD.update({
    "beef_strips_cooked": 0.76,
    "shrimp_cooked": 0.75,
    "ny_strip_cooked": 0.75,
    "tilapia_cooked": 0.80,
    "chicken_breast_cooked": 0.75,
    "chicken_mince_cooked": 0.75,
})
RAW_PROTEIN_BUFFER = 1.05


GRAB_AND_GO_MEALS = {
    "Oven-Baked Popcorn Chicken",
    "PRPD Protein Box",
    "Chicken Tikka Snack Wrap",
    "Caprese Protein Pasta Box",
    "Buffalo Chicken Pinwheels",
    "Mediterranean Chicken Hummus Box",
    "Mini Chicken Snack Wrap",
}


@lru_cache(maxsize=1)
def current_config():
    return json.loads(subprocess.check_output(["node", "-e", "process.stdout.write(JSON.stringify(require('./config/order-config.js')))"], cwd=ROOT, text=True))


def tier_price(meal_name: str, tier: str, config=None) -> float:
    config = current_config() if config is None else config
    for item in configured_items(config):
        if item["name"] == meal_name:
            if "price" in item:
                return item["price"]
            return config["prices"][item["category"]][tier.lower()]
    raise ValueError(f"No current selling price for {meal_name} {tier}")


def packaging_cost(meal_name: str, tier: str, registry=None) -> float:
    return sum(
        line["quantity"] * line["unit_cost"]
        for line in packaging_cost_lines(meal_name, tier, registry)
    )


def packaging_cost_lines(meal_name: str, tier: str, registry=None) -> list[dict]:
    registry = load_current_registry() if registry is None else registry
    container_cost = 43.49 / 150 if getattr(registry, "_cost_batch_number", None) == 17 else active_costs.MEAL_CONTAINER_COST
    shared = active_costs.SHARED_CONSUMABLE_ALLOWANCE
    cup = active_costs.SAUCE_CUP_COST
    lines = [{
        "item": ("Dessert box allowance" if meal_name == "Chocolate-Dipped Cookie Dough Balls" else "Dessert cup with lid") if tier == "Single" and meal_name not in GRAB_AND_GO_MEALS else "Meal container with lid",
        "quantity": 1,
        "unit_cost": 0.34 if tier == "Single" and meal_name not in GRAB_AND_GO_MEALS else container_cost,
    }]
    if meal_name == "High Protein Omelette":
        lines += [
            {"item": "Zipper bag", "quantity": 1, "unit_cost": 0.10},
            {"item": "Parchment", "quantity": 1, "unit_cost": 0.05},
        ]
    # The same current assignment registry counts Sweet Heat ingredients and
    # its container. Incorporated sauces do not create extra cups.
    registry = load_current_registry() if registry is None else registry
    if hasattr(registry, "service"):
        cup_count = sum(int(item.get("cupsPerMeal", 0)) for item in registry.service(meal_name))
        # These private recipes predate the Batch 14 SERVICE map, but their
        # controlled builds and packing instructions still require the cups.
        cup_count += {
            "Custom Lebanese-Style Chicken Breast": 2,
        }.get(meal_name, 0)
    else:
        cup_count = int(bool(registry.sauce_assignment(meal_name)))
        cup_count += int(meal_name in {"Chicken Biryani", "Creamy Garlic Parmesan Salmon", "Custom Lebanese-Style Chicken Breast"})
    if cup_count:
        lines.append({"item": "Sauce cup with lid", "quantity": cup_count, "unit_cost": cup})
    if meal_name in {"Strawberry Cheesecake Protein Pancakes", "Blueberry Cheesecake Protein Pancakes"}:
        lines.append({"item": "Topping and syrup cups with lids", "quantity": 2, "unit_cost": cup})
    if meal_name == "Cheeseburger Hot Pockets":
        lines.append({"item": "Foil piece", "quantity": 2 if tier == "Lean" else 3, "unit_cost": 0.05})
    lines.append({"item": "Shared gloves and cleaning allowance", "quantity": 1, "unit_cost": shared})
    return lines


@lru_cache(maxsize=1)
def load_current_registry():
    sys.path.insert(0, str(NEXT_NUTRITION_PATH.parent))
    batch_number = current_config()["batch"]["number"]
    if batch_number not in {13, 14, 15, 16, 17}:
        raise ValueError(f"No packaging registry configured for Batch {batch_number}")
    path = NEXT_NUTRITION_PATH.with_name(
        "batch13_recipes.py" if batch_number == 13 else "current_recipe_registry.py"
    )
    registry = load_module(f"prpd_batch{batch_number}_packaging_registry", path)
    registry._cost_batch_number = batch_number
    return registry


def costed_quantity(portion):
    if portion.ingredient not in COSTS:
        raise ValueError(f"Missing cost input: {portion.ingredient}")
    basis = COSTS[portion.ingredient]
    if not math.isfinite(portion.amount) or portion.amount < 0 or not math.isfinite(basis.cost) or basis.cost < 0:
        raise ValueError(f"Invalid cost quantity or rate: {portion.ingredient}")
    amount = portion.amount
    if portion.ingredient in RAW_YIELD:
        amount = amount / RAW_YIELD[portion.ingredient] * RAW_PROTEIN_BUFFER
    elif portion.ingredient in {"pink_salmon_raw", "beef_96_raw"}:
        amount *= RAW_PROTEIN_BUFFER
    if portion.unit != basis.unit:
        raise ValueError(
            f"Unit mismatch for {portion.ingredient}: {portion.unit} vs {basis.unit}"
        )
    return amount


def portion_cost(portion) -> tuple[float, str]:
    amount = costed_quantity(portion)
    basis = COSTS[portion.ingredient]
    return amount * basis.cost, basis.confidence


def ingredient_cost_line(portion, module) -> dict:
    costed_amount = costed_quantity(portion)
    basis = COSTS[portion.ingredient]
    if module.config["batch"]["number"] == 17 and portion.ingredient == "lemon":
        basis = per_g(1.94, 443, "planning", "Current bottled-lemon catalog: Great Value 15oz, approximately443g, $1.94 online reference checked2026-10-21; physical panel and receipt remain required")
    return {
        "ingredient": module.active.INGREDIENTS[portion.ingredient].name,
        "recipe_amount": portion.amount,
        "costed_amount": costed_amount,
        "unit": portion.unit,
        "source": basis.source,
        "cost": costed_amount * basis.cost,
        "confidence": basis.confidence,
    }


def meal_rows(module):
    rows = []
    for meal in module.MEALS:
        tiers = [("Single" if meal.bulk is None else "Lean", meal.lean), ("Bulk", meal.bulk)]
        for tier, recipe in tiers:
            if recipe is None:
                continue
            ingredient_lines = [ingredient_cost_line(portion, module) for portion in recipe.portions]
            food = sum(line["cost"] for line in ingredient_lines)
            packaging = packaging_cost(meal.name, tier, module.registry)
            direct = food + packaging
            selling_price = tier_price(meal.name, tier, module.config)
            # A receipt does not validate cooked yield or provisional packaging.
            confidence = "preliminary"
            rows.append({
                "category": meal.category,
                "meal": meal.name,
                "tier": tier,
                "food": food,
                "packaging": packaging,
                "direct": direct,
                "selling_price": selling_price,
                "retained": selling_price - direct,
                "cost_pct": direct / selling_price * 100,
                "confidence": confidence,
                "decision": meal.decision,
                "validation": meal.validation,
                "ingredient_lines": ingredient_lines,
                "packaging_lines": packaging_cost_lines(meal.name, tier, module.registry),
            })
    return rows


def bundle_rows(module):
    """Price each customer-selectable five-meal bundle split.

    Bundle components are planner-only recipes, so they are not present in
    ``MEALS``. Keeping their direct costs here prevents a valid bundle order
    from becoming an unknown-cost line in the Business Center.
    """
    config = module.config
    configured_items(config)
    components = {
        item["id"]: item
        for item in [
            *(entry for section in config.get("menu", {}).values() for entry in section if not entry.get("variants")),
            *config.get("plannerOnly", []),
        ]
    }
    rows = []
    for bundle in config.get("menu", {}).get("exclusives", []):
        for variant in bundle.get("variants", []):
            direct = 0
            count = 0
            for item in variant.get("components", []):
                if item["id"] not in components:
                    raise ValueError(f"Unknown bundle component ID: {item['id']}")
                name = components[item["id"]]["name"]
                if name not in module.registry.RECIPES:
                    raise ValueError(f"No exact bundle recipe: {name}")
                tier = item.get("tier", "").lower()
                if tier not in {"lean", "bulk"} or module.registry.RECIPES[name][1]:
                    raise ValueError(f"Unsupported bundle component tier: {name} {tier}")
                qty = item["qty"]
                if isinstance(qty, bool) or not isinstance(qty, int) or qty <= 0:
                    raise ValueError(f"Invalid bundle quantity: {name} {qty}")
                recipe = module.registry.recipe(name, tier)
                food = sum(ingredient_cost_line(p, module)["cost"] for p in recipe.portions)
                direct += (food + packaging_cost(name, tier.title(), module.registry)) * qty
                count += qty
            if count != bundle["servingCount"]:
                raise ValueError(f"Bundle serving count mismatch: {bundle['name']}")
            selling_price = variant.get("price", bundle.get("price"))
            if not isinstance(selling_price, (int, float)) or selling_price <= 0:
                raise ValueError(f"Bundle variant is missing a valid price: {bundle['name']} {variant.get('label', '')}")
            rows.append({
                "meal": bundle["name"],
                "tier": variant["label"],
                "direct": direct,
                "selling_price": selling_price,
                "retained": selling_price - direct,
                "cost_pct": direct / selling_price * 100,
                "confidence": "preliminary",
            })
    return rows


def report(module) -> str:
    rows = meal_rows(module)
    average_cost_pct = sum(row["cost_pct"] for row in rows) / len(rows)
    lines = [
        f"# PRPD Batch {module.config['batch']['number']} Direct Packed-Cost Audit",
        "",
        f"Generated: {date.today().strftime('%B %d, %Y').replace(' 0', ' ')}",
        "",
        "## Scope",
        "",
        f"This report prices the named Batch {module.config['batch']['number']} planning builds in the batch's exact recipe registry, matched to the current order configuration. Historical positional MEALS are not used. It is not a final profit statement, measured consumption, recipe release, or customer-price approval.",
        "",
        "Shared ingredients use the current active-menu price model. Next-menu-only products use visibly marked receipt, legacy, or retailer planning references. Direct packed cost includes recipe food, a 5% pooled allowance on raw meat and poultry, meal-specific packaging, and the approved per-meal gloves/cleaning allowance. It excludes delivery fuel, order-level paper bags, owner labor in the startup cash view, and expenses PRPD does not currently pay.",
        "",
        "Receipt update: October 1 EPIC $113.45 plus Walmart $171.65 equals $285.10 shopping cash, not ingredient consumption. Receipt beef is 80/20 and is not substituted for the recipes' 90/10 or 96/4 cost bases. The four unmade internal spares are not evidence of actual production. No actual weekly margin has been replaced by this model. All totals remain provisional because yields, packaging and some package identities are unmeasured.",
        "",
        f"Current unweighted average direct packed cost: **{average_cost_pct:.1f}%**. This is not a volume-weighted weekly margin.",
        "",
        "## Controlled Build Costs",
        "",
        "| Category | Dish | Tier | Food incl. protein reserve | Packaging | Direct packed | Selling price | Retained before shared costs | Direct cost % | Status |",
        "|---|---|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for row in rows:
        lines.append(
            f"| {row['category']} | {row['meal']} | {row['tier']} | "
            f"${row['food']:.2f} | ${row['packaging']:.2f} | ${row['direct']:.2f} | "
            f"${row['selling_price']:.2f} | ${row['retained']:.2f} | {row['cost_pct']:.1f}% | "
            f"{row['confidence'].title()} |"
        )

    bundles = bundle_rows(module)
    if bundles:
        lines += [
            "",
            "## Weekly Bundle Costs",
            "",
            "Bundle direct cost includes all five individual meal containers and recipe food. Delivery fuel and the order-level paper bag remain separate shared order costs.",
            "",
            "| Bundle | Split | Direct packed | Selling price | Retained before shared costs | Direct cost % | Status |",
            "|---|---|---:|---:|---:|---:|---|",
        ]
        for row in bundles:
            lines.append(
                f"| {row['meal']} | {row['tier']} | ${row['direct']:.2f} | ${row['selling_price']:.2f} | "
                f"${row['retained']:.2f} | {row['cost_pct']:.1f}% | {row['confidence'].title()} |"
            )

    pressure = sorted(rows, key=lambda row: row["cost_pct"], reverse=True)[:8]
    lines += ["", "## Highest Direct-Cost Pressure", ""]
    for row in pressure:
        lines.append(
            f"- {row['meal']} {row['tier']}: {row['cost_pct']:.1f}% including the pooled raw-protein reserve, before labor, delivery, and overhead."
        )

    lines += [
        "",
        "## Ingredient-Level Cost Proof",
        "",
        "Recipe quantity is the amount in one customer build. Purchase-cost quantity reverses the documented cooked yield for meat and adds the 5% pooled raw-protein reserve so purchase cost is not understated.",
    ]
    for row in rows:
        lines += [
            "",
            f"### {row['meal']} - {row['tier']}",
            "",
            f"Validation: {row['validation']}",
            "",
            "| Ingredient | Recipe quantity | Purchase-cost quantity | Price basis | Line cost | Status |",
            "|---|---:|---:|---|---:|---|",
        ]
        for line in row["ingredient_lines"]:
            lines.append(
                f"| {line['ingredient']} | {line['recipe_amount']:.2f} {line['unit']} | "
                f"{line['costed_amount']:.2f} {line['unit']} | {line['source']} | "
                f"${line['cost']:.2f} | {line['confidence'].title()} |"
            )
        lines += [
            f"| **Ingredient subtotal** |  |  |  | **${row['food']:.2f}** |  |",
            "",
            "| Packaging / consumable | Quantity | Unit cost | Line cost |",
            "|---|---:|---:|---:|",
        ]
        for line in row["packaging_lines"]:
            lines.append(
                f"| {line['item']} | {line['quantity']} | ${line['unit_cost']:.2f} | "
                f"${line['quantity'] * line['unit_cost']:.2f} |"
            )
        lines += [
            f"| **Packaging subtotal** |  |  | **${row['packaging']:.2f}** |",
            f"| **Direct packed total** |  |  | **${row['direct']:.2f}** |",
        ]

    lines += [
        "",
        "## Required Before Price Approval",
        "",
        "1. Replace planning prices for sourdough, tortillas, produce, dessert products, and estimated consumables with receipts as they become available.",
        "2. Close the current recipe holds and record cooked protein, sauce, portion and packaging yields. A cost calculation does not close a recipe or label hold.",
        "3. Replace the default 5% pooled raw-protein reserve with measured batch yields once enough production records exist.",
        "4. Add the actual weekly fuel allocation and any paid kitchen or consumable expense before calling retained dollars profit.",
        "5. Keep owner labor separate in the startup cash view, while still recording hours for future sustainable pricing.",
        "",
        "## Order-Level and Weekly Costs",
        "",
        "- Paper delivery bag: $0.81 per customer order, not per meal.",
        "- Delivery fuel: approximately $7.75-$9.04 per Saturday route at 60-70 miles, 24 MPG, and $3.10/gallon.",
        "- Payment processing: $0 under the current fee-free payment method.",
        "- Commercial-kitchen and separate utilities: $0 in the startup cash model unless PRPD is actually charged.",
        "",
        "### Practical 15-order route example",
        "",
        "At 15 delivered customer orders, fuel is approximately $0.52-$0.60 per order. Adding the $0.81 paper bag makes the shared order-level cash cost approximately $1.33-$1.41 per order. If an order contains 4, 8, or 12 meals, that is approximately $0.33-$0.35, $0.17-$0.18, or $0.11-$0.12 per meal respectively. Use the real order and meal counts each week rather than hard-coding one allocation into every recipe.",
    ]
    return "\n".join(lines) + "\n"


def generated_cost_payload(module) -> dict:
    rows = meal_rows(module)
    direct_costs = {
        f"{row['meal'].strip().lower()}|{row['tier'].strip().lower()}": round(row["direct"] + 1e-9, 2)
        for row in rows
    }
    provisional = sorted(
        f"{row['meal'].strip().lower()}|{row['tier'].strip().lower()}"
        for row in rows
        if row["confidence"] != "verified"
    )
    for row in bundle_rows(module):
        key = f"{row['meal'].strip().lower()}|{row['tier'].strip().lower()}"
        direct_costs[key] = round(row["direct"] + 1e-9, 2)
        if row["confidence"] != "verified":
            provisional.append(key)
    provisional = sorted(set(provisional))
    expected = set()
    for item in configured_items(module.config):
        tiers = [v["label"] for v in item["variants"]] if item.get("variants") else (["Lean", "Bulk"] if item.get("bulkMacros") else ["Single"])
        for tier in tiers:
            key = f"{item['name'].strip().lower()}|{tier.strip().lower()}"
            if key in expected:
                raise ValueError(f"Duplicate configured cost key: {key}")
            expected.add(key)
    if set(direct_costs) != expected:
        raise ValueError(f"Current-menu cost parity failure: missing={sorted(expected - direct_costs.keys())}, extra={sorted(direct_costs.keys() - expected)}")
    if any(not math.isfinite(value) or value <= 0 for value in direct_costs.values()):
        raise ValueError("Current-menu costs must be finite and positive")
    payload = {
        "batchNumber": module.config["batch"]["number"],
        "costBasis": "Planning direct packed cost; not measured production consumption or actual margin",
        "directCosts": dict(sorted(direct_costs.items())),
        "provisionalCosts": provisional,
    }
    planner_costs = {}
    planner_unpriced = {}
    for item in module.config.get("plannerOnly", []):
        name = item["name"]
        if name not in module.registry.RECIPES:
            raise ValueError(f"No exact planner-only cost recipe: {name}")
        single = module.registry.RECIPES[name][1]
        if name == "Mango Habanero Chicken Wings":
            for tier in ("lean", "bulk"):
                planner_unpriced[f"{name.lower()}|{tier}"] = "Unpriced private family wing build: actual wing/sauce/ranch packages and supplier prices pending."
            continue
        for tier in (["Lean"] if single else ["Lean", "Bulk"]):
            recipe = module.registry.recipe(name, tier.lower())
            cost = sum(ingredient_cost_line(p, module)["cost"] for p in recipe.portions) + packaging_cost(
                name, tier, module.registry
            )
            for alias in [name, *item.get("aliases", [])]:
                key = f"{alias.strip().lower()}|{tier.lower()}"
                if key in direct_costs or key in planner_costs:
                    raise ValueError(f"Duplicate planner-only cost key: {key}")
                planner_costs[key] = round(cost + 1e-9, 2)
    payload["plannerOnlyCosts"] = dict(sorted(planner_costs.items()))
    if planner_unpriced:
        payload["plannerOnlyUnpricedCosts"] = dict(sorted(planner_unpriced.items()))
    payload["plannerOnlyProvisionalCosts"] = sorted(planner_costs)
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    payload["fingerprint"] = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return payload


def retained_history(current_payload):
    """Archive exact previous generated bytes' data on rollover, never recost it."""
    history = json.loads(HISTORY_JSON_PATH.read_text(encoding="utf-8"))
    if history.get("schemaVersion") != 1 or not isinstance(history.get("snapshots"), dict):
        raise ValueError("Invalid historical cost registry")
    if OUTPUT_JSON_PATH.exists():
        previous = json.loads(OUTPUT_JSON_PATH.read_text(encoding="utf-8"))
        batch = str(previous["batchNumber"])
        if previous["batchNumber"] != current_payload["batchNumber"]:
            existing = history["snapshots"].get(batch)
            if existing is not None and existing != previous:
                raise ValueError(f"Refusing to replace different preserved Batch {batch} costs")
            history["snapshots"][batch] = previous
            history.setdefault("provenance", {}).setdefault(batch, "Exact prior current-menu generated planning payload retained on rollover; not actual consumed cost.")
            history.setdefault("unavailableBatches", {}).pop(batch, None)
    return history


def generated_cost_module(payload) -> str:
    encoded = json.dumps(payload, indent=2, sort_keys=True)
    return (
        "(function currentMenuCosts(root, factory) {\n"
        "  const data = factory();\n"
        "  if (typeof module === 'object' && module.exports) module.exports = data;\n"
        "  else root.PRPDCurrentMenuCosts = data;\n"
        "}(typeof globalThis !== 'undefined' ? globalThis : this, function factory() {\n"
        f"  return Object.freeze({encoded});\n"
        "}));\n"
    )


def main() -> None:
    module = load_nutrition_module()
    missing = sorted({
        portion.ingredient
        for meal in module.MEALS
        for recipe in (meal.lean, meal.bulk)
        if recipe
        for portion in recipe.portions
        if portion.ingredient not in COSTS
    })
    if missing:
        raise RuntimeError(f"Missing cost inputs: {', '.join(missing)}")
    # Complete all validation before replacing any previous generated artifact.
    cost_payload = generated_cost_payload(module)
    history = retained_history(cost_payload)
    report_text = report(module)
    json_text = json.dumps(cost_payload, indent=2, sort_keys=True) + "\n"
    js_text = generated_cost_module(cost_payload)
    history_json = json.dumps(history, indent=2, sort_keys=True) + "\n"
    history_js = generated_cost_module(history).replace("PRPDCurrentMenuCosts", "PRPDHistoricalMenuCosts")
    OUTPUT_PATH.write_text(report_text, encoding="utf-8")
    OUTPUT_JSON_PATH.write_text(json_text, encoding="utf-8")
    OUTPUT_JS_PATH.write_text(js_text, encoding="utf-8")
    HISTORY_JSON_PATH.write_text(history_json, encoding="utf-8")
    HISTORY_JS_PATH.write_text(history_js, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Wrote {OUTPUT_JSON_PATH}")
    print(f"Wrote {OUTPUT_JS_PATH}")


if __name__ == "__main__":
    main()
