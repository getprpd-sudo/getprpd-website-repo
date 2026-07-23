"""Generate review-only label data for the proposed July 25 PRPD menu.

This intentionally writes a separate dataset. It never replaces the active-menu
label data and does not publish anything to the customer order page.
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import calculate_next_menu as draft
import generate_label_data as active_labels


OUTPUT = Path(__file__).resolve().parent / "next-menu-label-data.js"

EACH_GRAMS = {
    **active_labels.EACH_GRAMS,
    "sourdough_slice": 40,
    "hawaiian_roll": 28,
    "biscoff_cookie": 8,
}

DISPLAY_INGREDIENTS = {
    **active_labels.DISPLAY_INGREDIENTS,
    "mushroom": "white mushrooms",
    "sourdough_slice": "sourdough bread",
    "sweet_potato": "sweet potato",
    "sriracha": "sriracha sauce",
    "oats": "rolled oats",
    "chia": "chia seeds",
    "flour": "all-purpose flour",
    "baking_powder": "baking powder",
    "hawaiian_roll": "sweet Hawaiian rolls",
    "hot_sauce": "Frank's-style hot sauce",
    "bbq_sauce": "G Hughes sugar-free BBQ sauce",
    "protein_mac": "high-protein macaroni and cheese",
    "beef_strips_cooked": "lean beef strips",
    "apple": "apple",
    "sesame_oil": "sesame oil",
    "cornstarch": "cornstarch",
    "cucumber": "cucumber",
    "shrimp_cooked": "shrimp",
    "edamame": "shelled edamame",
    "ny_strip_cooked": "New York strip steak",
    "peanut_butter": "peanut butter",
    "chocolate_chips": "semisweet chocolate chips",
    "biscoff_spread": "Lotus Biscoff cookie butter",
    "biscoff_cookie": "Lotus Biscoff cookies",
    "banana_pudding_mix": "sugar-free banana pudding mix",
    "blueberry": "blueberries",
    "green_bell_pepper": "green bell pepper",
    "carrot": "carrots",
    "zucchini": "zucchini",
}

ALLERGENS = {
    **active_labels.ALLERGENS,
    "sourdough_slice": "wheat",
    "flour": "wheat",
    "hawaiian_roll": ("soy", "wheat"),
    "protein_mac": ("milk", "wheat"),
    "soy_sauce": "soy",
    "shrimp_cooked": "shellfish",
    "peanut_butter": "peanut",
    "chocolate_chips": ("milk", "soy"),
    "biscoff_spread": ("soy", "wheat"),
    "biscoff_cookie": ("soy", "wheat"),
}

META = {
    "High Protein Omelette": ("Eggs, vegetables, fat-free cheese, and sourdough.", "Breakfast that actually keeps up.", "fridge"),
    "Beef Breakfast Skillet": ("Seasoned beef, sweet potato, egg, vegetables, and fat-free cheese.", "A skillet without the skillet-sized cleanup.", "fridge"),
    "Power Bowl": ("Chicken, sweet potato, eggs, and a light yogurt-sriracha finish.", "The name is doing exactly what it says.", "fridge"),
    "Blueberry Cheesecake Protein Pancakes": ("Protein pancakes with blueberry compote and cheesecake-yogurt topping.", "Cheesecake for breakfast. We checked the macros.", "fridge"),
    "Cheeseburger Hot Pockets": ("Handmade yogurt dough filled with seasoned beef, cheese, and pickles.", "The drive-thru wishes it thought of this.", "freezer"),
    "Mexican Streetcorn Chicken Bowl": ("Chicken, basmati rice, and creamy Mexican street corn.", "Sweet corn, smoky chicken, zero boring bites.", "freezer"),
    "Hot Honey Chicken Sliders": ("Hot-honey chicken, cheese, pickles, and light sriracha mayo on soft rolls.", "Sweet heat. Very little chance of leftovers.", "freezer"),
    "Chicken Biryani": ("Spiced halal chicken and fragrant basmati rice.", "The kind of comfort food that still tracks.", "freezer"),
    "BBQ Chicken Mac & Cheese": ("BBQ chicken, high-protein mac and cheese, and fat-free mozzarella.", "Mac and cheese finally joined the program.", "freezer"),
    "Korean Bulgogi Beef Bowl": ("Marinated beef, rice, and stir-fried broccoli, peppers, and carrots.", "Sticky, savory, and worth every bite.", "freezer"),
    "Garlic Butter Shrimp + Rice": ("Garlic-butter shrimp, basmati rice, edamame, zucchini, and lemon.", "A little fancy for a meal prep container.", "freezer"),
    "Premium NY Strip Steak": ("New York strip steak with creamy mashed potatoes and broccoli.", "Yes, meal prep can look like this.", "fridge"),
    "Cookie Dough Cup": ("Protein cookie dough with oats, cottage cheese, peanut butter, and chocolate chips.", "No oven. No waiting. No judgment.", "fridge"),
    "Lotus Biscoff Cheesecake": ("Protein cheesecake with Biscoff cookie butter and a cookie crust.", "Biscoff made it. Your macros survived.", "fridge"),
    "Banana Cream Pie Cup": ("Banana protein cream with a Biscoff cookie finish.", "This one understood the assignment.", "fridge"),
}


def grams_for(portion: draft.Portion) -> float:
    if portion.unit == "each":
        return portion.amount * EACH_GRAMS.get(portion.ingredient, 1)
    return portion.amount


def ingredient_statement(build: draft.Build) -> str:
    totals: dict[str, float] = defaultdict(float)
    for portion in build.portions:
        label = DISPLAY_INGREDIENTS.get(portion.ingredient, draft.active.INGREDIENTS[portion.ingredient].name.lower())
        totals[label] += grams_for(portion)
    return ", ".join(sorted(totals, key=totals.get, reverse=True)) + "."


def allergen_statement(build: draft.Build) -> str:
    found = set()
    for portion in build.portions:
        allergens = ALLERGENS.get(portion.ingredient, ())
        if isinstance(allergens, str):
            found.add(allergens)
        else:
            found.update(allergens)
    found = sorted(found)
    return "CONTAINS: " + ", ".join(item.upper() for item in found) + "." if found else "No major allergens identified from the recorded recipe."


def tier_data(build: draft.Build, label: str) -> dict:
    grams = round(sum(grams_for(portion) for portion in build.portions))
    return {
        "label": label.upper(),
        "netWeight": f"Est. {grams / 28.3495:.1f} oz ({grams} g)",
        "ingredients": ingredient_statement(build),
        "allergens": allergen_statement(build),
        "nutrition": active_labels.nutrition(draft.total(build)),
        "confidence": build.confidence,
    }


def main() -> None:
    meals = {}
    counters = {"Breakfast": 0, "Main": 0, "Dessert": 0}
    prefixes = {"Breakfast": "nb", "Main": "nm", "Dessert": "nd"}
    for meal in draft.MEALS:
        counters[meal.category] += 1
        meal_id = f"{prefixes[meal.category]}{counters[meal.category]}"
        description, note, storage = META[meal.name]
        tiers = {"lean": tier_data(meal.lean, "Single" if meal.bulk is None else "Lean")}
        if meal.bulk is not None:
            tiers["bulk"] = tier_data(meal.bulk, "Bulk")
        meals[meal_id] = {
            "name": meal.name,
            "category": meal.category,
            "description": description,
            "note": note,
            "storageMode": storage,
            "validation": meal.validation,
            "decision": meal.decision,
            "tiers": tiers,
        }

    payload = {
        "version": "2026-07-25-draft.1",
        "status": "draft",
        "menuLabel": "July 25 draft",
        "notice": "Review-only July 25 labels. Approve the saved product and kitchen checks before printing or publishing.",
        "meals": meals,
    }
    OUTPUT.write_text(
        "window.PRPD_NEXT_LABEL_DATA = " + json.dumps(payload, indent=2, ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )
    print(OUTPUT)


if __name__ == "__main__":
    main()
