"""Generate browser/Node production data from the audited nutrition builds."""

from __future__ import annotations

import json
from pathlib import Path

import calculate_active_menu as audit
import calculate_next_menu as next_menu


STATIONS = {
    "chicken_thigh_cooked": "Poultry",
    "chicken_breast_cooked": "Poultry",
    "leg_quarter_cooked": "Poultry",
    "ny_strip_cooked": "Beef",
    "beef_90_baked": "Beef",
    "beef_90_pan": "Beef",
    "rice_dry": "Starches & Hot Sides",
    "protein_pasta": "Starches & Hot Sides",
    "protein_mac": "Starches & Hot Sides",
    "potato": "Starches & Hot Sides",
    "bread_slice": "Breakfast & Desserts",
    "shawarma_bread": "Bread & Packaging",
    "small_tortilla": "Bread & Packaging",
    "fajita_tortilla": "Bread & Packaging",
    "large_tortilla": "Bread & Packaging",
    "egg": "Breakfast & Desserts",
    "egg_white": "Breakfast & Desserts",
    "whey": "Breakfast & Desserts",
    "ladyfingers": "Breakfast & Desserts",
    "mascarpone": "Breakfast & Desserts",
    "philadelphia_no_bake": "Breakfast & Desserts",
    "cocoa": "Breakfast & Desserts",
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
    "avocado_oil": "Dry Prep & Seasonings",
    "mushroom": "Cold Prep & Produce",
    "sourdough_slice": "Bread & Packaging",
    "oats": "Breakfast & Desserts",
    "chia": "Breakfast & Desserts",
    "flour": "Dry Prep & Seasonings",
    "baking_powder": "Dry Prep & Seasonings",
    "hawaiian_roll": "Bread & Packaging",
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
    "tilapia_cooked": "Seafood",
    "mixed_vegetables": "Cold Prep & Produce",
    "harissa": "Sauces & Dairy",
    "coriander": "Dry Prep & Seasonings",
    "reduced_cream_cheese": "Sauces & Dairy",
}


RAW_CONVERSIONS = {
    "chicken_thigh_cooked": ("chicken_thigh_raw", "Boneless skinless chicken thighs, raw", 0.75),
    "chicken_breast_cooked": ("chicken_breast_raw", "Boneless skinless chicken breast, raw", 0.75),
    "beef_90_baked": ("beef_90_raw", "Ground beef 90/10, raw", 0.72),
    "beef_90_pan": ("beef_90_raw", "Ground beef 90/10, raw", 0.69),
    "leg_quarter_cooked": ("leg_quarter_raw", "Bone-in chicken leg quarters, raw", 0.50),
    "ny_strip_cooked": ("ny_strip_raw", "NY strip steak, raw", 0.75),
    "beef_strips_cooked": ("beef_strips_raw", "Lean beef strips, raw", 0.76),
    "shrimp_cooked": ("shrimp_raw", "Shrimp, raw peeled and deveined", 0.75),
    "tilapia_cooked": ("tilapia_raw", "Tilapia fillets, raw", 0.80),
}


MEASUREMENTS = {
    "chicken_thigh_raw": {"type": "meat"},
    "chicken_breast_raw": {"type": "meat"},
    "beef_90_raw": {"type": "meat"},
    "leg_quarter_raw": {"type": "meat", "gramsPerPiece": 400, "pieceName": "leg quarters"},
    "ny_strip_raw": {"type": "meat"},
    "beef_strips_raw": {"type": "meat"},
    "shrimp_raw": {"type": "meat"},
    "tilapia_raw": {"type": "meat"},
    "salt": {"type": "spice", "gramsPerTsp": 6.0},
    "paprika": {"type": "spice", "gramsPerTsp": 2.3},
    "cumin": {"type": "spice", "gramsPerTsp": 2.1},
    "chili_powder": {"type": "spice", "gramsPerTsp": 2.7},
    "cinnamon": {"type": "spice", "gramsPerTsp": 2.6},
    "cocoa": {"type": "spice", "gramsPerTsp": 2.5},
    "powdered_sugar": {"type": "spice", "gramsPerTsp": 2.5},
    "brown_sugar": {"type": "spice", "gramsPerTsp": 4.0},
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
}


def line_for(portion: audit.Portion) -> dict:
    ingredient = audit.INGREDIENTS[portion.ingredient]
    key = portion.ingredient
    name = ingredient.name
    amount = portion.amount
    note = portion.note
    if key in RAW_CONVERSIONS:
        key, name, yield_rate = RAW_CONVERSIONS[key]
        amount = portion.amount / yield_rate
        note = f"Raw purchasing/prep quantity; modeled {yield_rate:.0%} cooked yield."
    line = {
        "key": key,
        "sourceKey": portion.ingredient,
        "name": name,
        "amount": round(amount, 4),
        "unit": portion.unit,
        "station": STATIONS.get(portion.ingredient, "Other"),
        "note": note,
        "confidence": ingredient.confidence,
    }
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
            if line["note"] and line["note"] not in combined[marker]["note"]:
                combined[marker]["note"] = "; ".join(filter(None, [combined[marker]["note"], line["note"]]))
    return list(combined.values())


def generate() -> dict:
    meals = {}
    active_by_name = {meal.name: meal for meal in audit.MEALS}
    next_by_name = {meal.name: meal for meal in next_menu.MEALS}
    batch_menu = [
        ("b1", next_by_name["PRPD Beef Bacon Breakfast Sandwich"], "PRPD Beef Bacon Breakfast Sandwich"),
        ("b2", next_by_name["French Toast"], "French Toast"),
        ("b3", next_by_name["Breakfast Quesadilla"], "Breakfast Quesadilla"),
        ("b4", next_by_name["Grilled Cheese Breakfast Burrito"], "Grilled Cheese Breakfast Burrito"),
        ("m1", next_by_name["Loaded Beef Cottage Pie"], "Loaded Beef Cottage Pie"),
        ("m2", next_by_name["Hot Honey Chicken Sliders"], "Hot Honey Chicken Sliders"),
        ("m3", next_by_name["Loaded Buffalo Chicken Potato"], "Loaded Buffalo Chicken Potato"),
        ("m4", next_by_name["Beef Seekh Kabab Shawarma"], "Beef Seekh Kabab Shawarma"),
        ("m5", next_by_name["Harissa Honey Chicken"], "Harissa Honey Chicken"),
        ("m6", next_by_name["Mexican Streetcorn Chicken Bowl"], "Mexican Streetcorn Chicken Bowl"),
        ("m7", next_by_name["Garlic Butter Shrimp + Rice"], "Garlic Butter Shrimp + Rice"),
        ("m8", next_by_name["BBQ Chicken Mac & Cheese"], "BBQ Chicken Mac & Cheese"),
        ("d1", next_by_name["Chocolate-Dipped Cookie Dough Balls"], "Chocolate-Dipped Cookie Dough Balls"),
        ("d2", next_by_name["Chocolate Oreo Mousse"], "Chocolate Oreo Mousse"),
        ("d3", next_by_name["Baked Strawberry-Lemon Protein Cheesecake Square"], "Baked Strawberry-Lemon Protein Cheesecake Square"),
        ("a1", next_by_name["PRPD Protein Box"], "PRPD Protein Box"),
        ("a2", next_by_name["Mini Chicken Snack Wrap"], "Mini Chicken Snack Wrap"),
        ("a3", next_by_name["Strawberry Protein Overnight Oats"], "Strawberry Protein Overnight Oats"),
    ]
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

    return {
        "version": "2026-08-10.1",
        "batch": 6,
        "notice": "Batch 6 production quantities generated by dish name from the controlled Batch 6 recipe builds. Power Bowl, Cottage Pie, and Steak include the provisional 40g net Sweet Heat formula so nutrition, allergens, grocery totals, and sauce counts remain synchronized pending the next tare-and-yield run.",
        "meals": meals,
    }


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
