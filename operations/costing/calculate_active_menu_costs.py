"""Preliminary direct-cost calculator for the active PRPD menu.

The recipe gram amounts come from the audited nutrition calculator. Verified PRPD
purchase prices take priority; legacy or planning values remain visibly flagged.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import importlib.util
import sys


ROOT = Path(__file__).resolve().parents[2]
NUTRITION_PATH = ROOT / "operations" / "nutrition" / "calculate_active_menu.py"
OUTPUT_PATH = ROOT / "operations" / "costing" / "ACTIVE_MENU_PRELIMINARY_COST_AUDIT.md"


@dataclass(frozen=True)
class CostBasis:
    cost: float
    unit: str
    confidence: str
    source: str


def per_g(price: float, grams: float, confidence: str, source: str) -> CostBasis:
    return CostBasis(price / grams, "g", confidence, source)


def each(price: float, count: float, confidence: str, source: str) -> CostBasis:
    return CostBasis(price / count, "each", confidence, source)


def load_nutrition_module():
    spec = importlib.util.spec_from_file_location("prpd_active_nutrition", NUTRITION_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


# Current receipt/user values are marked verified. Earlier PRPD price-document
# values are marked legacy. Generic/local planning estimates must be replaced by
# a receipt when that ingredient is next purchased.
COSTS = {
    "chicken_thigh_cooked": per_g(143.60, 18143.7, "verified", "$143.60/40 lb Restaurant Depot chicken-thigh case"),
    "leg_quarter_cooked": per_g(0.89, 453.592, "verified", "$0.89/lb raw bone-in chicken leg quarters"),
    "beef_90_baked": per_g(5.50, 453.592, "verified", "$5.50/lb raw 90/10 ground beef"),
    "beef_90_pan": per_g(5.50, 453.592, "verified", "$5.50/lb raw 90/10 ground beef"),
    "egg": each(1.47, 12, "planning", "Walmart Great Value 12-count reference"),
    "egg_white": per_g(4.87, 907.185, "planning", "Walmart Great Value 32 oz reference"),
    "cottage": per_g(3.00, 680, "verified", "$3.00/24 oz current purchase"),
    "fage": per_g(3.00, 907, "verified", "$3.00/32 oz current fat-free Greek yogurt purchase"),
    "simple_truth_yogurt": per_g(3.00, 907, "planning", "Costed at current PRPD fat-free Greek yogurt rate"),
    "mozzarella": per_g(10.00, 2267.96, "verified", "$10.00/5 lb current fat-free shredded cheese purchase"),
    "fairlife_milk": per_g(5.00, 1538, "verified", "$5.00/52 fl oz current fat-free milk purchase; 1 mL modeled as 1g"),
    "whey": per_g(32.50, 663, "verified", "Midpoint of user-confirmed $30-$35 range"),
    "rice_dry": per_g(13.00, 9071.85, "verified", "$13.00/20 lb current rice purchase"),
    "small_tortilla": each(10.00, 16, "verified", "$10.00/16 current tortilla purchase; exact size mapping pending"),
    "large_tortilla": each(10.00, 16, "verified", "$10.00/16 current tortilla purchase; exact size mapping pending"),
    "bread_slice": each(3.50, 566.99 / 32, "verified", "$3.50/20 oz D'Italiano loaf; 32g recorded slice weight"),
    "shawarma_bread": each(5.00, 8, "verified", "$5.00/8 current shawarma breads"),
    "protein_pasta": per_g(3.00, 340, "legacy", "Earlier PRPD ingredient-price document"),
    "crushed_tomatoes": per_g(1.50, 794, "legacy", "Planning 28 oz can"),
    "potato": per_g(0.99, 453.592, "planning", "Generic local planning estimate"),
    "broccoli": per_g(2.00, 340.194, "verified", "$2.00/12 oz current frozen broccoli purchase"),
    "spinach": per_g(2.48, 227, "planning", "Generic 8 oz bag estimate"),
    "tomato": per_g(1.78, 453.592, "planning", "Generic local planning estimate"),
    "onion": per_g(0.98, 453.592, "planning", "Generic local planning estimate"),
    "jalapeno": per_g(1.48, 453.592, "planning", "Generic local planning estimate"),
    "lettuce": per_g(2.00, 500, "verified", "$2/head with 500g provisional usable yield"),
    "corn": per_g(0.98, 432, "planning", "Generic 15.25 oz can estimate"),
    "strawberry": per_g(2.48, 453.592, "planning", "Generic local planning estimate"),
    "banana": per_g(0.30, 118, "verified", "$0.30 per medium banana; provisional edible weight"),
    "garlic": per_g(0.50, 50, "planning", "Generic bulb/usable-yield estimate"),
    "ginger": per_g(2.98, 453.592, "planning", "Generic local planning estimate"),
    "lime": per_g(0.33, 30, "planning", "Generic one-lime juice yield"),
    "lemon": per_g(1.00, 48, "verified", "$1/lemon with provisional juice yield"),
    "cilantro": per_g(0.50, 50, "verified", "$0.50/bunch with provisional usable yield"),
    "pickles": per_g(3.00, 680, "planning", "Generic 24 oz jar estimate"),
    "avocado_oil": per_g(8.00, 750, "legacy", "Earlier PRPD ingredient-price document"),
    "butter": per_g(0.15, 14, "legacy", "Earlier PRPD ingredient-price document"),
    "brown_sugar": per_g(2.24, 907, "planning", "Generic 2 lb bag estimate"),
    "powdered_sugar": per_g(2.24, 907, "planning", "Generic 2 lb bag estimate"),
    "honey": per_g(3.74, 340, "legacy", "Earlier PRPD ingredient-price document"),
    "vanilla": per_g(4.98, 59, "planning", "Generic 2 fl oz bottle estimate"),
    "cinnamon": per_g(1.24, 71, "planning", "Generic spice bottle estimate"),
    "paprika": per_g(1.24, 64, "planning", "Generic spice bottle estimate"),
    "cumin": per_g(1.24, 57, "planning", "Generic spice bottle estimate"),
    "chili_powder": per_g(1.24, 71, "planning", "Generic spice bottle estimate"),
    "salt": per_g(0.67, 737, "planning", "Generic table-salt estimate"),
    "tomato_paste": per_g(1.00, 170, "legacy", "Earlier PRPD ingredient-price document"),
    "broth": per_g(2.00, 907, "legacy", "Earlier PRPD ingredient-price document"),
    "light_mayo": per_g(2.97, 850, "legacy", "Earlier PRPD ingredient-price document"),
    "salsa": per_g(3.00, 454, "legacy", "Earlier PRPD ingredient-price document"),
    "buffalo_sauce": per_g(3.48, 354, "planning", "Generic Frank's-style bottle estimate"),
    "cotija": per_g(4.48, 283, "planning", "Generic 10 oz package estimate"),
    "sweet_chili": per_g(3.58, 510, "legacy", "Earlier PRPD ingredient-price document"),
    "soy_sauce": per_g(3.00, 444, "legacy", "Earlier PRPD ingredient-price document"),
    "ketchup": per_g(3.48, 1077, "planning", "Generic 38 oz bottle estimate"),
    "mustard": per_g(1.18, 567, "planning", "Generic 20 oz bottle estimate"),
    "breadcrumbs": per_g(1.77, 425, "planning", "Generic canister estimate"),
    "cocoa": per_g(3.99, 227, "legacy", "Earlier PRPD ingredient-price document"),
    "oreo_thin": each(3.97, 26, "legacy", "Earlier PRPD ingredient-price document"),
    "ladyfingers": per_g(4.00, 200, "planning", "Generic package estimate"),
    "philadelphia_no_bake": per_g(4.98, 680, "planning", "Generic 24 oz tub estimate"),
    "mascarpone": per_g(4.48, 227, "planning", "Generic 8 oz tub estimate"),
    "maple_syrup": per_g(2.78, 710, "planning", "Generic sugar-free syrup estimate"),
    "whipped_cream": per_g(3.48, 184, "planning", "Generic sugar-free whipped cream estimate"),
}


RAW_YIELD = {
    "chicken_thigh_cooked": 0.75,
    "leg_quarter_cooked": 0.55,
    "beef_90_baked": 0.72,
    "beef_90_pan": 0.69,
}
RAW_PROTEIN_BUFFER = 1.05


SIDE_CUPS = {
    "b2": 1,
    "b3": 2,
    "m2": 1,
    "m3": 1,
    "m8": 3,
}

SAUCE_CUP_COST = 15.00 / 250
MEAL_CONTAINER_COST = 42.99 / 150
SHARED_CONSUMABLE_ALLOWANCE = 0.05


PRICE_CATEGORY = {
    "b4": "beef",
    "m6": "beef",
    "m7": "beef",
    "m8": "beef",
}


SELLING_PRICE = {
    "standard": {"Lean": 10.99, "Bulk": 12.99},
    "beef": {"Lean": 13.99, "Bulk": 15.99},
    "dessert": {"Single": 6.99},
}


def portion_cost(portion) -> tuple[float, str]:
    basis = COSTS[portion.ingredient]
    amount = portion.amount
    if portion.ingredient in RAW_YIELD:
        amount = amount / RAW_YIELD[portion.ingredient] * RAW_PROTEIN_BUFFER
    if portion.unit != basis.unit:
        raise ValueError(f"Unit mismatch for {portion.ingredient}: {portion.unit} vs {basis.unit}")
    return amount * basis.cost, basis.confidence


def ingredient_cost_line(portion, module) -> dict:
    basis = COSTS[portion.ingredient]
    costed_amount = portion.amount
    if portion.ingredient in RAW_YIELD:
        costed_amount = costed_amount / RAW_YIELD[portion.ingredient] * RAW_PROTEIN_BUFFER
    if portion.unit != basis.unit:
        raise ValueError(f"Unit mismatch for {portion.ingredient}: {portion.unit} vs {basis.unit}")
    return {
        "ingredient": module.INGREDIENTS[portion.ingredient].name,
        "recipe_amount": portion.amount,
        "costed_amount": costed_amount,
        "unit": portion.unit,
        "source": basis.source,
        "cost": costed_amount * basis.cost,
        "confidence": basis.confidence,
    }


def packaging_cost_lines(meal_id: str, tier_name: str) -> list[dict]:
    lines = [{
        "item": "Dessert cup with lid" if tier_name == "Single" else "Meal container with lid",
        "quantity": 1,
        "unit_cost": 0.34 if tier_name == "Single" else MEAL_CONTAINER_COST,
    }]
    if SIDE_CUPS.get(meal_id, 0):
        lines.append({
            "item": "Sauce cup with lid",
            "quantity": SIDE_CUPS[meal_id],
            "unit_cost": SAUCE_CUP_COST,
        })
    lines.append({
        "item": "Shared gloves and cleaning allowance",
        "quantity": 1,
        "unit_cost": SHARED_CONSUMABLE_ALLOWANCE,
    })
    return lines


def packaging_cost(meal_id: str, tier_name: str) -> float:
    return sum(line["quantity"] * line["unit_cost"] for line in packaging_cost_lines(meal_id, tier_name))


def meal_rows(module):
    rows = []
    for meal in module.MEALS:
        tiers = [("Single" if meal.bulk is None else "Lean", meal.lean), ("Bulk", meal.bulk)]
        for tier_name, build in tiers:
            if build is None:
                continue
            ingredient_lines = [ingredient_cost_line(portion, module) for portion in build.portions]
            food = sum(line["cost"] for line in ingredient_lines)
            pack = packaging_cost(meal.meal_id, tier_name)
            direct = food + pack
            category = "dessert" if tier_name == "Single" else PRICE_CATEGORY.get(meal.meal_id, "standard")
            price = SELLING_PRICE[category][tier_name]
            confidence = "verified" if all(line["confidence"] == "verified" for line in ingredient_lines) else "preliminary"
            rows.append({
                "id": meal.meal_id,
                "meal": meal.name,
                "tier": tier_name,
                "food": food,
                "pack": pack,
                "direct": direct,
                "price": price,
                "retained": price - direct,
                "cost_pct": direct / price * 100,
                "confidence": confidence,
                "ingredient_lines": ingredient_lines,
                "packaging_lines": packaging_cost_lines(meal.meal_id, tier_name),
            })
    return rows


def build_report(module) -> str:
    rows = meal_rows(module)
    average_cost_pct = sum(row["cost_pct"] for row in rows) / len(rows)
    lines = [
        "# PRPD Active Menu Preliminary Cost Audit",
        "",
        "Generated: July 16, 2026",
        "",
        "## Scope",
        "",
        "This is a planning-grade direct-cost audit, not a final profitability statement. Recipe quantities come from the audited active-menu nutrition model. Current PRPD purchase prices override the older ingredient-price PDF; unresolved package prices use visibly documented planning estimates.",
        "",
        "The direct cost below includes recipe ingredients, a 5% pooled allowance on raw meat and poultry, the meal/dessert container, sauce cups, and the approved per-meal gloves/cleaning allowance. It excludes owner labor in the startup cash view, delivery fuel, order-level paper bags, payment fees, and any kitchen expense PRPD does not actually pay.",
        "",
        f"Current unweighted average direct packed cost: **{average_cost_pct:.1f}%**. This is a recipe comparison, not a volume-weighted weekly profit margin.",
        "",
        "## Per-Customer Build",
        "",
        "| Dish | Tier | Food incl. protein reserve | Packaging | Direct packed | Selling price | Dollars retained before labor/overhead | Direct cost % | Status |",
        "|---|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for row in rows:
        lines.append(
            f"| {row['meal']} | {row['tier']} | ${row['food']:.2f} | ${row['pack']:.2f} | "
            f"${row['direct']:.2f} | ${row['price']:.2f} | ${row['retained']:.2f} | "
            f"{row['cost_pct']:.1f}% | {row['confidence'].title()} |"
        )

    flagged = sorted(rows, key=lambda row: row["cost_pct"], reverse=True)[:8]
    lines += [
        "",
        "## Highest Direct-Cost Pressure",
        "",
    ]
    for row in flagged:
        lines.append(f"- {row['meal']} {row['tier']}: {row['cost_pct']:.1f}% direct packed cost before labor, kitchen, delivery, and overhead.")

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
            f"| **Packaging subtotal** |  |  | **${row['pack']:.2f}** |",
            f"| **Direct packed total** |  |  | **${row['direct']:.2f}** |",
        ]

    lines += [
        "",
        "## Raw-Protein Reserve Rule",
        "",
        "Finished production equals sold customer meals. The cost model adds 5% only to raw meat and poultry purchasing quantities to absorb normal trim and cooking-yield variation. It does not add extra containers, starches, vegetables, desserts, or finished meals.",
        "",
        "## Decision Standard",
        "",
        "Use this table for current startup cash planning. Replace planning inputs with receipts as they become available, record owner hours without deducting unpaid owner labor, add a kitchen charge only if PRPD actually pays one, and replace the 5% reserve with measured batch yields when enough production records exist.",
        "",
        "## Order-Level and Weekly Costs",
        "",
        "- Paper delivery bag: $0.81 per customer order, not per meal.",
        "- Delivery fuel: approximately $7.75-$9.04 per Saturday route at 60-70 miles, 24 MPG, and $3.10/gallon. Allocate across the week's delivered orders or meals after orders close.",
        "- Payment processing: $0 under the current fee-free payment method.",
        "- Commercial-kitchen and separate utilities: $0 in the startup cash model unless PRPD is actually charged.",
        "- Owner labor: recorded operationally but excluded from the immediate cash-retained view, per PRPD's current startup priority.",
        "",
        "### Practical 15-order route example",
        "",
        "At 15 delivered customer orders, fuel is approximately $0.52-$0.60 per order. Adding the $0.81 paper bag makes the shared order-level cash cost approximately $1.33-$1.41 per order. If an order contains 4, 8, or 12 meals, that is approximately $0.33-$0.35, $0.17-$0.18, or $0.11-$0.12 per meal respectively. Use the real order and meal counts each week rather than hard-coding one allocation into every recipe.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    module = load_nutrition_module()
    missing = sorted({
        portion.ingredient
        for meal in module.MEALS
        for build in (meal.lean, meal.bulk)
        if build
        for portion in build.portions
        if portion.ingredient not in COSTS
    })
    if missing:
        raise RuntimeError(f"Missing cost inputs: {', '.join(missing)}")
    OUTPUT_PATH.write_text(build_report(module), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
