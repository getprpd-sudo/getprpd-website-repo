"""Generate the controlled Batch 6 label dataset."""

from __future__ import annotations

import json
import hashlib
import subprocess
from collections import defaultdict
from pathlib import Path

import calculate_next_menu as draft
import generate_label_data as active_labels


OUTPUT = Path(__file__).resolve().parent / "next-menu-label-data.js"
ROOT = Path(__file__).resolve().parents[2]

EACH_GRAMS = {
    **active_labels.EACH_GRAMS,
    "sourdough_slice": 40,
    "hawaiian_roll": 43,
    "biscoff_cookie": 8,
    "english_muffin": 57,
    "beef_bacon": 20,
}

DISPLAY_INGREDIENTS = {
    **active_labels.DISPLAY_INGREDIENTS,
    "mushroom": "white mushrooms",
    "sourdough_slice": "sourdough bread",
    "sriracha": "sriracha sauce",
    "oats": "rolled oats",
    "chia": "chia seeds",
    "flour": "all-purpose flour",
    "baking_powder": "baking powder",
    "hawaiian_roll": "bakery roll",
    "hot_sauce": "Frank's-style hot sauce",
    "bbq_sauce": "sugar-free BBQ sauce",
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
    "english_muffin": "English muffin",
    "beef_bacon": "halal beef breakfast slices",
    "tilapia_cooked": "tilapia",
    "mixed_vegetables": "mixed vegetables",
    "harissa": "harissa paste",
    "coriander": "ground coriander",
    "reduced_cream_cheese": "reduced-fat cream cheese",
}

# Customer-facing ingredient names use common names. Exact brands remain in the
# recipe and cost sources, where substitutions and receipt prices are controlled.
DISPLAY_INGREDIENTS.update({
    "mozzarella": "fat-free mozzarella cheese",
    "cottage": "fat-free cottage cheese",
    "fairlife_milk": "fat-free milk",
    "whey": "whey protein powder",
    "maple_syrup": "sugar-free maple syrup",
    "philadelphia_no_bake": "no-bake cheesecake filling",
    "ketchup": "ketchup",
    "mustard": "yellow mustard",
    "sweet_chili": "sugar-free sweet chili sauce",
    "small_tortilla": "high-fiber wheat tortilla",
    "fajita_tortilla": "Mission Carb Balance Fajita flour tortilla",
    "pickles": "house refrigerator-pickled vegetables",
})

ALLERGENS = {
    **active_labels.ALLERGENS,
    "sourdough_slice": "wheat",
    "flour": "wheat",
    "hawaiian_roll": ("sesame", "soy", "wheat"),
    "protein_mac": ("milk", "wheat"),
    "soy_sauce": "soy",
    "shrimp_cooked": "shellfish",
    "peanut_butter": "peanut",
    "chocolate_chips": ("milk", "soy"),
    "biscoff_spread": ("soy", "wheat"),
    "biscoff_cookie": ("soy", "wheat"),
    "english_muffin": "wheat",
    "beef_bacon": "soy",
    "tilapia_cooked": "fish",
    "reduced_cream_cheese": "milk",
    "fajita_tortilla": "wheat",
}

META = {
    "High Protein Omelette": ("Eggs, vegetables, fat-free cheese, and sourdough.", "Breakfast that actually keeps up.", "fridge"),
    "Beef Breakfast Skillet": ("Seasoned beef, potato, egg, vegetables, and fat-free cheese.", "A skillet without the skillet-sized cleanup.", "fridge"),
    "Power Bowl": ("Chicken, potato, eggs, and PRPD Sweet Heat sauce.", "The name is doing exactly what it says.", "fridge"),
    "French Toast": ("Protein French toast with fruit, whipped cream, and sugar-free maple syrup.", "Breakfast can still feel like breakfast.", "fridge"),
    "Breakfast Quesadilla": ("Seasoned chicken, eggs, egg whites, cheese, yogurt, and salsa in high-fiber tortillas.", "A high-protein breakfast built to travel.", "fridge"),
    "Strawberry Cheesecake Protein Pancakes": ("Protein pancakes with strawberry compote and cheesecake-yogurt topping.", "Pancakes dressed like cheesecake.", "fridge"),
    "PRPD Beef Bacon Breakfast Sandwich": ("Beef bacon, a high-protein egg patty, cheese, and PRPD Sweet Heat sauce on an English muffin with breakfast potatoes.", "The breakfast sandwich cleaned up its macros.", "fridge"),
    "Grilled Cheese Breakfast Burrito": ("Seasoned beef, eggs, egg whites, cheese, and onion in grilled high-fiber tortillas.", "Breakfast wrapped and ready.", "fridge"),
    "Loaded Beef Cottage Pie": ("Seasoned beef and vegetables under high-protein mashed potatoes and cheese, with PRPD Sweet Heat sauce.", "Comfort food with the numbers handled.", "freezer"),
    "Hot Honey Chicken Sliders": ("Hot-honey chicken, cheese, house refrigerator pickles, and onion on soft bakery rolls.", "Sweet heat. Very little chance of leftovers.", "freezer"),
    "Loaded Buffalo Chicken Potato": ("Buffalo chicken over a loaded roasted potato with broccoli.", "Loaded potato, handled.", "freezer"),
    "Beef Seekh Kabab Shawarma": ("Seasoned beef seekh, fresh salad, house refrigerator pickles, and garlic yogurt sauce in shawarma bread.", "The wrap that eats like a full meal.", "fridge"),
    "Harissa Honey Chicken": ("Sweet-spicy harissa honey chicken with basmati rice and roasted broccoli.", "Sweet, smoky heat built for the week.", "freezer"),
    "Cheeseburger Hot Pockets": ("Handmade yogurt dough filled with seasoned beef and cheese.", "The drive-thru wishes it thought of this.", "freezer"),
    "Mexican Streetcorn Chicken Bowl": ("Chicken, basmati rice, and creamy Mexican street corn.", "Street corn brought chicken. We brought the container.", "freezer"),
    "Halal Cart Chicken + Yellow Rice": ("Seasoned halal chicken, yellow basmati rice, fresh vegetables, and house sauce.", "The cart classic, built for the week.", "freezer"),
    "Blackened Tilapia with Garlic Potatoes": ("Blackened tilapia with roasted garlic potatoes, broccoli, and PRPD white sauce.", "Tilapia finally stopped playing it safe.", "fridge"),
    "Hot Honey Chicken Sliders": ("Hot-honey chicken, cheese, pickles, and onion on Sara Lee Artesano rolls.", "Sweet heat. Very little chance of leftovers.", "freezer"),
    "Chicken Biryani": ("Spiced halal chicken and fragrant basmati rice.", "The kind of comfort food that still tracks.", "freezer"),
    "BBQ Chicken Mac & Cheese": ("BBQ chicken, high-protein mac and cheese, and fat-free mozzarella.", "Mac and cheese finally joined the program.", "freezer"),
    "Korean Bulgogi Beef Bowl": ("Marinated beef, rice, and stir-fried broccoli, peppers, and carrots.", "Sticky, savory, and worth every bite.", "freezer"),
    "Garlic Butter Shrimp + Rice": ("Garlic-butter shrimp, basmati rice, edamame, zucchini, and lemon.", "A little fancy for a meal prep container.", "freezer"),
    "Premium NY Strip Steak": ("New York strip steak with creamy mashed potatoes, broccoli, and PRPD Sweet Heat sauce.", "Yes, meal prep can look like this.", "fridge"),
    "Sweet Chili Chicken with Vegetable Rice": ("Sweet-chili chicken with basmati vegetable rice.", "Sweet heat without the sugar crash.", "freezer"),
    "Meatball Arrabbiata Pasta": ("Beef meatballs and protein pasta in a slow-simmered arrabbiata sauce.", "A pasta night that still tracks.", "freezer"),
    "Strawberry Cheesecake": ("Strawberry protein cheesecake with a ladyfinger crust.", "The dessert cup that started it all.", "fridge"),
    "Chocolate-Dipped Cookie Dough Balls": ("Three protein cookie-dough balls with a measured chocolate coating.", "No oven. No waiting. No judgment.", "fridge"),
    "Chocolate Oreo Mousse": ("Chocolate protein mousse finished with Oreo Thins.", "Dessert first? We support that decision.", "fridge"),
    "Baked Strawberry-Lemon Protein Cheesecake Square": ("Baked strawberry-lemon protein cheesecake cut into one square.", "A real cheesecake square with the protein handled.", "fridge"),
    "Lotus Biscoff Cheesecake": ("Protein cheesecake with Biscoff cookie butter and a cookie crust.", "Biscoff made it. Your macros survived.", "fridge"),
    "Banana Cream Pie Cup": ("Banana protein cream with a Biscoff cookie finish.", "The banana had bigger plans.", "fridge"),
    "PRPD Protein Box": ("Eggs, halal beef breakfast slices, cheese, fruit, cucumber, and house jalapeno-lemon yogurt dip.", "Protein, packed and ready.", "fridge"),
    "Mini Chicken Snack Wrap": ("Two high-fiber tortillas with seasoned chicken, cheese, fresh chopped salad, and house sauce.", "Two snack wraps. Full PRPD treatment.", "fridge"),
    "Strawberry Protein Overnight Oats": ("Strawberry protein overnight oats with Greek yogurt, chia, and honey.", "Twelve ounces of grab-and-go breakfast.", "fridge"),
}

REHEAT = {
    "High Protein Omelette": "Microwave 60-90 seconds, or until hot. Toast bread separately if desired.",
    "Power Bowl": "Remove sauce cup. Microwave 1-2 minutes, stirring halfway, until hot throughout.",
    "French Toast": "Remove syrup cup. Microwave 45-75 seconds, or until hot; add fruit, whipped cream, and syrup after heating.",
    "Breakfast Quesadilla": "Microwave 60-90 seconds, or air fry at 350 F for 3-5 minutes, until hot throughout.",
    "Strawberry Cheesecake Protein Pancakes": "Remove cold toppings. Microwave pancakes 45-75 seconds; add toppings after heating.",
    "PRPD Beef Bacon Breakfast Sandwich": "Microwave 45-60 seconds. For a toasted finish, air fry at 350 F for 3-5 minutes.",
    "Grilled Cheese Breakfast Burrito": "Microwave 60-90 seconds, or air fry at 350 F for 3-5 minutes, until hot throughout.",
    "Loaded Beef Cottage Pie": "Remove sauce cup. Vent lid and microwave 2-3 minutes, or until hot throughout. Rest 1 minute.",
    "Hot Honey Chicken Sliders": "Microwave 45-75 seconds, or air fry at 350 F for 3-5 minutes, until hot throughout.",
    "Loaded Buffalo Chicken Potato": "Vent lid and microwave 2-3 minutes, stirring halfway, until hot throughout.",
    "Beef Seekh Kabab Shawarma": "Remove cold pickles if packed separately. Microwave 60-90 seconds, or air fry at 350 F for 3-5 minutes.",
    "Harissa Honey Chicken": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Korean Bulgogi Beef Bowl": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Garlic Butter Shrimp + Rice": "Vent lid and microwave at 50% power for 1-2 minutes, stirring halfway, to avoid overcooking shrimp.",
    "BBQ Chicken Mac & Cheese": "Remove sauce cup. Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Mexican Streetcorn Chicken Bowl": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Halal Cart Chicken + Yellow Rice": "Remove cold vegetables and sauce. Microwave chicken and rice 1.5-2 minutes, then add cold toppings.",
    "Blackened Tilapia with Garlic Potatoes": "Remove sauce cup. Microwave at 50% power for 1-2 minutes, or until hot, to avoid overcooking fish.",
    "Premium NY Strip Steak": "Remove sauce cup. Microwave at 50% power for 1-2 minutes, or until hot, to reduce overcooking.",
    "Cheeseburger Hot Pockets": "Air fry at 350 F for 5-7 minutes. Or microwave 45-75 seconds until hot throughout.",
    "Sweet Chili Chicken with Vegetable Rice": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Meatball Arrabbiata Pasta": "Vent lid and microwave 2-3 minutes, stirring halfway, until hot throughout.",
    "Chicken Biryani": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Chocolate-Dipped Cookie Dough Balls": "Serve chilled. Do not heat.",
    "Chocolate Oreo Mousse": "Serve chilled. Do not heat.",
    "Baked Strawberry-Lemon Protein Cheesecake Square": "Serve chilled. Do not heat.",
    "Strawberry Cheesecake": "Serve chilled. Do not heat.",
    "Banana Cream Pie Cup": "Serve chilled. Do not heat.",
    "Lotus Biscoff Cheesecake": "Serve chilled. Do not heat.",
    "PRPD Protein Box": "Enjoy chilled. Do not heat the assembled box.",
    "Mini Chicken Snack Wrap": "Enjoy chilled, or microwave 30-45 seconds if preferred.",
    "Strawberry Protein Overnight Oats": "Enjoy chilled. Stir before eating. Do not heat the sealed cup.",
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
        "netWeight": f"{grams / 28.3495:.1f} oz ({grams} g)",
        "ingredients": ingredient_statement(build),
        "allergens": allergen_statement(build),
        "nutrition": active_labels.nutrition(draft.total(build)),
        "confidence": build.confidence,
    }


MENU_SECTIONS = (
    ("breakfasts", "Breakfast", ("lean", "bulk")),
    ("mains", "Main", ("lean", "bulk")),
    ("desserts", "Dessert", ("single",)),
    ("addons", "Add-on", ("single",)),
)


def load_order_config() -> dict:
    """Read the explicitly unpublished weekly draft configuration.

    This deliberately fails instead of carrying forward a prior week's label
    menu when Node or the active configuration cannot be loaded.
    """
    command = (
        "const config=require('./operations/active/BATCH_6_DRAFT_ORDER_CONFIG.js');"
        "process.stdout.write(JSON.stringify(config));"
    )
    try:
        result = subprocess.run(
            ["node", "-e", command],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)
    except (OSError, subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        raise RuntimeError("Could not load the active order configuration; label generation is blocked.") from exc


def assert_macro_parity(item: dict, tier_key: str, generated: dict) -> None:
    configured = item.get("bulkMacros") if tier_key == "bulk" else item.get("macros")
    if not isinstance(configured, dict):
        raise ValueError(f"{item['id']} {item['name']} is missing {tier_key} customer-menu macros.")
    fields = {"cal": "calories", "protein": "protein", "carbs": "carbs", "fiber": "fiber", "fat": "fat"}
    for config_key, label_key in fields.items():
        if configured.get(config_key) != generated["nutrition"].get(label_key):
            raise ValueError(
                f"{item['id']} {item['name']} {tier_key} {label_key} differs between "
                "the active order menu and controlled recipe calculator."
            )


def generate_payload(order_config: dict | None = None) -> dict:
    order_config = order_config or load_order_config()
    batch = order_config.get("batch") or {}
    production = batch.get("labelProduction") or {}
    menu = order_config.get("menu") or {}
    batch_number = batch.get("number")
    if not isinstance(batch_number, int) or batch_number < 1:
        raise ValueError("The active order configuration has no valid batch number.")
    required_production = ("madeDate", "useByDate", "batchId")
    if any(not production.get(field) for field in required_production) or not batch.get("deliveryDate"):
        raise ValueError("The active order configuration has incomplete label-production identity.")

    meals = {}
    recipes_by_name = {meal.name: meal for meal in draft.MEALS}
    if len(recipes_by_name) != len(draft.MEALS):
        raise ValueError("The controlled recipe calculator contains duplicate dish names.")
    configured_names = set()
    for section_key, category, expected_tiers in MENU_SECTIONS:
        items = menu.get(section_key)
        if not isinstance(items, list):
            raise ValueError(f"The active order menu is missing its {section_key} section.")
        for item in items:
            meal_id = item.get("id")
            meal_name = item.get("name")
            if not meal_id or not meal_name:
                raise ValueError(f"The active {section_key} menu contains an item without an ID and name.")
            if meal_id in meals:
                raise ValueError(f"The active order menu repeats meal ID {meal_id}.")
            if meal_name in configured_names:
                raise ValueError(f"The active order menu repeats dish name {meal_name}.")
            configured_names.add(meal_name)
            meal = recipes_by_name.get(meal_name)
            if meal is None:
                raise ValueError(
                    f"{meal_id} {meal_name} is sellable but has no controlled current recipe; "
                    "label generation is blocked."
                )
            if meal.category != category:
                raise ValueError(f"{meal_id} {meal_name} has recipe category {meal.category}, expected {category}.")
            recipe_tiers = ("single",) if meal.bulk is None else ("lean", "bulk")
            if recipe_tiers != expected_tiers:
                raise ValueError(
                    f"{meal_id} {meal_name} has recipe tiers {recipe_tiers}, expected {expected_tiers}."
                )

            tiers = {expected_tiers[0]: tier_data(meal.lean, "Single" if meal.bulk is None else "Lean")}
            if meal.bulk is not None:
                tiers["bulk"] = tier_data(meal.bulk, "Bulk")
            for tier_key, generated in tiers.items():
                assert_macro_parity(item, tier_key, generated)
            try:
                description, note, storage = META[meal_name]
                reheat = REHEAT[meal_name]
            except KeyError as exc:
                raise ValueError(f"{meal_id} {meal_name} is missing controlled label copy.") from exc
            meals[meal_id] = {
                "name": meal_name,
                "category": category,
                "description": description,
                "note": note,
                "storageMode": storage,
                "reheat": reheat,
                "validation": meal.validation,
                "decision": meal.decision,
                "tiers": tiers,
            }

    unused_recipes = set(recipes_by_name) - configured_names
    if unused_recipes:
        raise ValueError(
            "The controlled recipe calculator and active customer menu differ; unused recipes: "
            + ", ".join(sorted(unused_recipes))
        )

    recipe_fingerprint = hashlib.sha256(
        json.dumps(meals, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    ).hexdigest()

    return {
        "version": f"{production['madeDate']}-generated.1",
        "status": f"batch-{batch_number}-approved" if batch.get("published") is True else f"batch-{batch_number}-draft",
        "menuLabel": f"Batch {batch_number} - {batch['deliveryDate']}",
        "production": {
            "batchNumber": batch_number,
            "deliveryDate": batch["deliveryDate"],
            "madeDate": production["madeDate"],
            "useByDate": production["useByDate"],
            "batchId": production["batchId"],
        },
        "recipeFingerprint": recipe_fingerprint,
        "notice": f"Batch {batch_number} calculated label data generated from the active customer menu and controlled recipes. Resolve every listed physical validation gate before final printing.",
        "meals": meals,
    }


def main() -> None:
    payload = generate_payload()
    OUTPUT.write_text(
        "window.PRPD_NEXT_LABEL_DATA = " + json.dumps(payload, indent=2, ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )
    print(OUTPUT)


if __name__ == "__main__":
    main()
