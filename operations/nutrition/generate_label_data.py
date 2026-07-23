"""Generate the browser-ready data used by the internal PRPD Label Studio."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import calculate_active_menu as audit


OUTPUT = Path(__file__).resolve().parent / "label-data.js"

EACH_GRAMS = {
    "egg": 50,
    "bread_slice": 32,
    "shawarma_bread": 80,
    "small_tortilla": 43,
    "large_tortilla": 70,
    "oreo_thin": 7.5,
}

DISPLAY_INGREDIENTS = {
    "chicken_thigh_cooked": "boneless skinless chicken thigh",
    "chicken_breast_cooked": "boneless skinless chicken breast",
    "leg_quarter_cooked": "bone-in chicken leg quarter",
    "beef_90_baked": "90/10 ground beef",
    "beef_90_pan": "90/10 ground beef",
    "egg": "whole egg",
    "egg_white": "egg whites",
    "potato": "potato",
    "broccoli": "broccoli",
    "spinach": "spinach",
    "tomato": "tomato",
    "onion": "onion",
    "jalapeno": "jalapeno",
    "lettuce": "lettuce",
    "corn": "sweet corn",
    "strawberry": "strawberries",
    "banana": "banana",
    "garlic": "garlic",
    "ginger": "ginger",
    "lime": "lime juice",
    "lemon": "lemon juice",
    "cilantro": "cilantro",
    "pickles": "pickled vegetables",
    "rice_dry": "basmati rice",
    "bread_slice": "D'Italiano bread",
    "shawarma_bread": "shawarma bread",
    "small_tortilla": "Mission Carb Balance tortilla",
    "large_tortilla": "Mission Carb Balance tortilla",
    "fage": "nonfat Greek yogurt",
    "simple_truth_yogurt": "nonfat Greek yogurt",
    "cottage": "H-E-B fat-free cottage cheese",
    "mozzarella": "H-E-B fat-free mozzarella",
    "fairlife_milk": "Fairlife fat-free milk",
    "whey": "Premier Protein powder",
    "whipped_cream": "sugar-free whipped cream",
    "butter": "butter",
    "avocado_oil": "avocado oil spray",
    "brown_sugar": "brown sugar",
    "powdered_sugar": "powdered sugar",
    "honey": "honey",
    "vanilla": "vanilla extract",
    "cinnamon": "cinnamon",
    "tomato_paste": "tomato paste",
    "broth": "broth",
    "maple_syrup": "Great Value sugar-free syrup",
    "light_mayo": "light mayonnaise",
    "salsa": "salsa",
    "buffalo_sauce": "Buffalo sauce",
    "cotija": "Cotija cheese",
    "sweet_chili": "G Hughes sugar-free sweet chili sauce",
    "soy_sauce": "low-sodium soy sauce",
    "ketchup": "Heinz ketchup",
    "mustard": "Heinz yellow mustard",
    "protein_pasta": "protein pasta",
    "crushed_tomatoes": "crushed tomatoes",
    "breadcrumbs": "seasoned breadcrumbs",
    "paprika": "paprika",
    "cumin": "cumin",
    "chili_powder": "chili powder",
    "cocoa": "unsweetened cocoa powder",
    "ladyfingers": "ladyfinger cookies",
    "philadelphia_no_bake": "Philadelphia no-bake cheesecake filling",
    "oreo_thin": "Oreo Thins",
    "mascarpone": "mascarpone",
    "salt": "salt",
}

ALLERGENS = {
    "egg": "egg", "egg_white": "egg", "light_mayo": "egg",
    "bread_slice": "wheat", "shawarma_bread": "wheat",
    "small_tortilla": "wheat", "large_tortilla": "wheat",
    "protein_pasta": "wheat", "breadcrumbs": "wheat",
    "ladyfingers": "wheat", "oreo_thin": "wheat",
    "soy_sauce": "soy",
    "fage": "milk", "simple_truth_yogurt": "milk", "cottage": "milk",
    "mozzarella": "milk", "fairlife_milk": "milk", "whey": "milk",
    "whipped_cream": "milk", "butter": "milk", "cotija": "milk",
    "philadelphia_no_bake": "milk", "mascarpone": "milk",
}

MEAL_META = {
    "b1": ("Breakfast", "Baked egg bites with vegetables, fat-free cheese, and seasoned potato hash.", "Breakfast handled. You're welcome.", "fridge"),
    "b2": ("Breakfast", "Protein French toast with fresh fruit, whipped cream, and sugar-free syrup.", "Yes, it tastes as good as it smells.", "freezer"),
    "b3": ("Breakfast", "Chicken, eggs, and fat-free cheese folded into high-fiber tortillas.", "Breakfast with a little more personality.", "freezer"),
    "b4": ("Breakfast", "Savory beef, eggs, and fat-free cheese in a grilled high-fiber burrito.", "Built for mornings that start moving.", "freezer"),
    "m1": ("Main", "Tender halal chicken in a creamy spiced tomato sauce with basmati rice.", "A little comfort, a lot of protein.", "freezer"),
    "m2": ("Main", "Halal chicken, yellow rice, fresh vegetables, and house white garlic sauce.", "Tastes like you just landed in New York.", "fridge"),
    "m3": ("Main", "Buffalo chicken with roasted potatoes and broccoli.", "Gym food was never supposed to be boring.", "fridge"),
    "m4": ("Main", "Oven-roasted peri peri chicken leg quarters with seasoned basmati rice.", "A little heat. A lot worth coming back for.", "fridge"),
    "m5": ("Main", "Chicken, basmati rice, and creamy Mexican street corn.", "Sweet corn, smoky chicken, zero boring bites.", "freezer"),
    "m6": ("Main", "Spiced beef seekh served shawarma-style with pickled vegetables and house sauce.", "Wrapped up like we actually care.", "freezer"),
    "m7": ("Main", "Beef meatballs and protein pasta in a slow-simmered arrabbiata sauce.", "Saucy, spicy, and worth the extra napkin.", "freezer"),
    "m8": ("Main", "Seasoned beef, rice, fresh toppings, fat-free cheese, and house sauces.", "Looks messy. Tastes like the right decision.", "freezer"),
    "d1": ("Dessert", "Strawberry cheesecake with a ladyfinger crust and protein-enriched filling.", "Cheesecake with a protein plot twist.", "freezer"),
    "d2": ("Dessert", "Chocolate protein mousse finished with Oreo Thins.", "Dessert first? We support that decision.", "freezer"),
    "d3": ("Dessert", "Coffee-soaked ladyfingers layered with a light mascarpone protein cream.", "Tiramisu that did its reps.", "fridge"),
}


def grams_for(portion: audit.Portion) -> float:
    if portion.unit == "each":
        return portion.amount * EACH_GRAMS[portion.ingredient]
    return portion.amount


def ingredient_statement(build: audit.Build) -> str:
    totals: dict[str, float] = defaultdict(float)
    labels: dict[str, str] = {}
    for portion in build.portions:
        label = DISPLAY_INGREDIENTS.get(portion.ingredient, audit.INGREDIENTS[portion.ingredient].name.lower())
        totals[label] += grams_for(portion)
        labels[label] = label
    ordered = sorted(totals, key=totals.get, reverse=True)
    return ", ".join(labels[key] for key in ordered) + "."


def allergen_statement(build: audit.Build) -> str:
    found = sorted({ALLERGENS[p.ingredient] for p in build.portions if p.ingredient in ALLERGENS})
    return "CONTAINS: " + ", ".join(item.upper() for item in found) + "." if found else "No major allergens identified from the recorded recipe."


def nutrition(value: audit.Nutrition) -> dict[str, float | int]:
    return {
        "calories": audit.display_value(value.calories, "calories"),
        "protein": round(value.protein),
        "carbs": round(value.carbs),
        "fiber": round(value.fiber),
        "fat": round(value.fat),
        "satFat": round(value.saturated_fat, 1),
        "transFat": round(value.trans_fat, 1),
        "cholesterol": round(value.cholesterol / 5) * 5,
        "sodium": round(value.sodium / 10) * 10,
        "sugars": round(value.sugars),
        "addedSugar": round(value.added_sugars),
        "vitaminD": round(value.vitamin_d, 1),
        "calcium": round(value.calcium / 10) * 10,
        "iron": round(value.iron, 1),
        "potassium": round(value.potassium / 10) * 10,
    }


def tier_data(build: audit.Build, label: str) -> dict:
    grams = round(sum(grams_for(portion) for portion in build.portions))
    return {
        "label": label.upper(),
        "netWeight": f"Est. {grams / 28.3495:.1f} oz ({grams} g)",
        "ingredients": ingredient_statement(build),
        "allergens": allergen_statement(build),
        "nutrition": nutrition(audit.total(build)),
        "confidence": build.confidence,
    }


def main() -> None:
    meals = {}
    for meal in audit.MEALS:
        category, description, note, storage = MEAL_META[meal.meal_id]
        tiers = {"lean": tier_data(meal.lean, "Single" if meal.bulk is None else "Lean")}
        if meal.bulk is not None:
            tiers["bulk"] = tier_data(meal.bulk, "Bulk")
        meals[meal.meal_id] = {
            "name": meal.name,
            "category": category,
            "description": description,
            "note": note,
            "storageMode": storage,
            "tiers": tiers,
        }

    payload = {
        "version": "2026-07-14.1",
        "notice": "Calculated estimates from recorded PRPD recipes, package labels, manufacturer data, and USDA/generic equivalents. Not laboratory analysis.",
        "meals": meals,
    }
    OUTPUT.write_text(
        "window.PRPD_LABEL_DATA = " + json.dumps(payload, indent=2, ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )
    print(OUTPUT)


if __name__ == "__main__":
    main()
