"""Direct packed-cost calculator for the PRPD Batch 7 menu.

The recipe quantities come directly from nutrition/calculate_next_menu.py. Shared
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


ROOT = Path(__file__).resolve().parents[2]
ACTIVE_COST_PATH = ROOT / "operations" / "costing" / "calculate_active_menu_costs.py"
NEXT_NUTRITION_PATH = ROOT / "operations" / "nutrition" / "calculate_next_menu.py"
OUTPUT_PATH = ROOT / "operations" / "costing" / "NEXT_MENU_DRAFT_COST_AUDIT.md"
OUTPUT_JSON_PATH = ROOT / "api" / "_current-menu-costs-data.json"
OUTPUT_JS_PATH = ROOT / "operations" / "costing" / "current-menu-costs.js"


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


def load_nutrition_module():
    return load_module("prpd_next_nutrition_for_costs", NEXT_NUTRITION_PATH)


# Shared ingredients inherit the latest confirmed values from the active model.
# Only next-menu-specific products are added here.
COSTS = dict(active_costs.COSTS)
COSTS.update({
    "mushroom": per_g(2.08, 227, "planning", "Generic 8 oz package estimate"),
    "sourdough_slice": each(4.00, 20, "planning", "Planning loaf estimate"),
    "sriracha": per_g(2.38, 255, "legacy", "Earlier PRPD ingredient-price document"),
    "oats": per_g(2.98, 1191, "legacy", "Earlier PRPD ingredient-price document"),
    "chia": per_g(8.48, 907, "planning", "Generic 2 lb package estimate"),
    "flour": per_g(2.43, 2268, "planning", "Generic 5 lb all-purpose flour estimate"),
    "baking_powder": per_g(2.00, 230, "planning", "Generic package estimate"),
    "hawaiian_roll": each(4.98, 12, "planning", "Sara Lee Artesano Bakery Rolls 12-count planning estimate; replace with receipt"),
    "hot_sauce": per_g(3.48, 354, "planning", "Generic Frank's-style bottle estimate"),
    "bbq_sauce": per_g(3.58, 510, "legacy", "Earlier PRPD ingredient-price document"),
    "protein_mac": per_g(2.47, 337, "planning", "Current 11.9 oz box; exact receipt price still pending"),
    "beef_strips_cooked": per_g(7.99, 453.592, "verified", "$7.99/lb current beef-strip purchase"),
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
    "coriander": per_g(3.98, 198, "planning", "Current ground-coriander planning estimate"),
    "reduced_cream_cheese": per_g(3.48, 226.8, "planning", "Current 8 oz reduced-fat cream-cheese planning estimate"),
    "instant_potato_flakes": per_g(5.98, 793, "planning", "Betty Crocker unflavored instant mashed potatoes 28 oz planning estimate; replace with receipt"),
    "water": per_g(0, 1000, "verified", "Kitchen tap water"),
    "pink_salmon_raw": per_g(11.46, 907.184, "planning", "Great Value wild-caught pink salmon two-pound bag at $5.73/lb; verify receipt"),
    "quinoa_dry": per_g(4.96, 907.184, "planning", "Generic two-pound dry quinoa planning estimate"),
    "green_beans": per_g(2.48, 907.184, "planning", "Generic two-pound frozen green-bean planning estimate"),
    "black_beans": per_g(0.88, 425, "planning", "Generic 15 oz canned black beans"),
    "parmesan": per_g(4.98, 227, "planning", "Generic eight-ounce grated Parmesan estimate"),
    "croutons": per_g(1.98, 142, "planning", "Generic five-ounce crouton package estimate"),
})


RAW_YIELD = dict(active_costs.RAW_YIELD)
RAW_YIELD.update({
    "beef_strips_cooked": 0.76,
    "shrimp_cooked": 0.75,
    "ny_strip_cooked": 0.75,
    "tilapia_cooked": 0.80,
})
RAW_PROTEIN_BUFFER = 1.05


STANDARD_PRICE = {"Lean": 10.99, "Bulk": 12.99}
BEEF_PRICE = {"Lean": 13.99, "Bulk": 15.99}
PREMIUM_STEAK_PRICE = {"Lean": 21.99, "Bulk": 26.99}
DESSERT_PRICE = {"Single": 6.99}

UPGRADED_PRICE_MEALS = {
    "PRPD Beef Bacon Breakfast Sandwich",
    "Meatball Arrabbiata Pasta",
    "Cajun Garlic Salmon",
    "Southwest Beef Taco Bowl",
}

SIDE_CUP_MEALS = {
    "PRPD Beef Bacon Breakfast Sandwich",
    "Blueberry Cheesecake Protein Pancakes",
    "Power Bowl",
    "Southwest Beef Taco Bowl",
}


def tier_price(meal_name: str, tier: str) -> float:
    if tier == "Single":
        if meal_name in {"PRPD Protein Box", "Mini Chicken Snack Wrap"}:
            return 7.99
        if meal_name == "Chicken Caesar Crunch Box":
            return 8.99
        return DESSERT_PRICE[tier]
    if meal_name == "Premium NY Strip Steak":
        return PREMIUM_STEAK_PRICE[tier]
    if meal_name in UPGRADED_PRICE_MEALS:
        return BEEF_PRICE[tier]
    return STANDARD_PRICE[tier]


def packaging_cost(meal_name: str, tier: str) -> float:
    shared = active_costs.SHARED_CONSUMABLE_ALLOWANCE
    cup = active_costs.SAUCE_CUP_COST
    container = active_costs.MEAL_CONTAINER_COST
    if meal_name == "Chicken Caesar Crunch Box":
        return container + cup + 0.05 + shared
    if meal_name in {"PRPD Protein Box", "Mini Chicken Snack Wrap"}:
        return container + shared
    if tier == "Single":
        return 0.34 + shared
    if meal_name == "Blueberry Cheesecake Protein Pancakes":
        return container + (2 * cup) + shared
    if meal_name == "High Protein Omelette":
        return container + 0.10 + 0.05 + shared
    if meal_name in SIDE_CUP_MEALS:
        return container + cup + shared
    if meal_name == "Cheeseburger Hot Pockets":
        return container + (0.05 * (2 if tier == "Lean" else 3)) + shared
    if meal_name == "Hot Honey Chicken Sliders":
        return container + shared
    return container + shared


def packaging_cost_lines(meal_name: str, tier: str) -> list[dict]:
    shared = active_costs.SHARED_CONSUMABLE_ALLOWANCE
    cup = active_costs.SAUCE_CUP_COST
    lines = [{
        "item": "Dessert cup with lid" if tier == "Single" and meal_name not in {"PRPD Protein Box", "Mini Chicken Snack Wrap", "Chicken Caesar Crunch Box"} else "Meal container with lid",
        "quantity": 1,
        "unit_cost": 0.34 if tier == "Single" and meal_name not in {"PRPD Protein Box", "Mini Chicken Snack Wrap", "Chicken Caesar Crunch Box"} else active_costs.MEAL_CONTAINER_COST,
    }]
    if meal_name == "High Protein Omelette":
        lines += [
            {"item": "Zipper bag", "quantity": 1, "unit_cost": 0.10},
            {"item": "Parchment", "quantity": 1, "unit_cost": 0.05},
        ]
    if meal_name in SIDE_CUP_MEALS:
        lines.append({"item": "Sauce cup with lid", "quantity": 1, "unit_cost": cup})
    if meal_name == "Blueberry Cheesecake Protein Pancakes":
        lines.append({"item": "Topping and syrup cups with lids", "quantity": 2, "unit_cost": cup})
    if meal_name == "Chicken Caesar Crunch Box":
        lines.append({"item": "Dressing cup with lid", "quantity": 1, "unit_cost": cup})
        lines.append({"item": "Dry crouton bag", "quantity": 1, "unit_cost": 0.05})
    if meal_name == "Cheeseburger Hot Pockets":
        lines.append({"item": "Foil piece", "quantity": 2 if tier == "Lean" else 3, "unit_cost": 0.05})
    lines.append({"item": "Shared gloves and cleaning allowance", "quantity": 1, "unit_cost": shared})
    return lines


def portion_cost(portion) -> tuple[float, str]:
    basis = COSTS[portion.ingredient]
    amount = portion.amount
    if portion.ingredient in RAW_YIELD:
        amount = amount / RAW_YIELD[portion.ingredient] * RAW_PROTEIN_BUFFER
    if portion.unit != basis.unit:
        raise ValueError(
            f"Unit mismatch for {portion.ingredient}: {portion.unit} vs {basis.unit}"
        )
    return amount * basis.cost, basis.confidence


def ingredient_cost_line(portion, module) -> dict:
    basis = COSTS[portion.ingredient]
    costed_amount = portion.amount
    if portion.ingredient in RAW_YIELD:
        costed_amount = costed_amount / RAW_YIELD[portion.ingredient] * RAW_PROTEIN_BUFFER
    if portion.unit != basis.unit:
        raise ValueError(f"Unit mismatch for {portion.ingredient}: {portion.unit} vs {basis.unit}")
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
            packaging = packaging_cost(meal.name, tier)
            direct = food + packaging
            selling_price = tier_price(meal.name, tier)
            confidence = "verified" if all(line["confidence"] == "verified" for line in ingredient_lines) else "preliminary"
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
                "packaging_lines": packaging_cost_lines(meal.name, tier),
            })
    return rows


def report(module) -> str:
    rows = meal_rows(module)
    average_cost_pct = sum(row["cost_pct"] for row in rows) / len(rows)
    lines = [
        "# PRPD Batch 7 Direct Packed-Cost Audit",
        "",
        "Generated: August 10, 2026",
        "",
        "## Scope",
        "",
        "This report prices the exact controlled builds in `../nutrition/calculate_next_menu.py`. It is a planning-grade direct-cost audit, not a final profit statement or customer-price approval.",
        "",
        "Shared ingredients use the current active-menu price model. Next-menu-only products use visibly marked receipt, legacy, or retailer planning references. Direct packed cost includes recipe food, a 5% pooled allowance on raw meat and poultry, meal-specific packaging, and the approved per-meal gloves/cleaning allowance. It excludes delivery fuel, order-level paper bags, owner labor in the startup cash view, and expenses PRPD does not currently pay.",
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
        "2. Test the sliders and steak, confirm the Bulk Hot Pocket fit, and record one cooked yield for beef strips, shrimp, steak, and drained ground beef.",
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
    payload = {
        "batchNumber": 7,
        "directCosts": dict(sorted(direct_costs.items())),
        "provisionalCosts": provisional,
    }
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    payload["fingerprint"] = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return payload


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
    OUTPUT_PATH.write_text(report(module), encoding="utf-8")
    cost_payload = generated_cost_payload(module)
    OUTPUT_JSON_PATH.write_text(json.dumps(cost_payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUTPUT_JS_PATH.write_text(generated_cost_module(cost_payload), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Wrote {OUTPUT_JSON_PATH}")
    print(f"Wrote {OUTPUT_JS_PATH}")


if __name__ == "__main__":
    main()
