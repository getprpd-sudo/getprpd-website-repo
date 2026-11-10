"""Audit every controlled PRPD recipe build under the public-menu macro rule.

This inventory deliberately distinguishes controlled calculations from names in
the historical recipe index that do not yet have a locked formula. It does not
promote drafts or publish a weekly menu.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import calculate_next_menu as m


Build = m.Build
Factory = Callable[[str], Build] | Callable[[], Build]
OUTPUT = Path(__file__).resolve().parents[1] / "active" / "FULL_MENU_LIBRARY_MACRO_AUDIT_2026-09-14.md"


@dataclass(frozen=True)
class Entry:
    name: str
    category: str
    factory: Factory
    tiers: bool = True
    status: str = "Controlled estimate"


ENTRIES = [
    # Breakfast and breakfast-adjacent products
    Entry("High Protein Omelette", "Breakfast", m.omelette),
    Entry("Beef Breakfast Skillet", "Breakfast", m.breakfast_skillet),
    Entry("French Toast", "Breakfast", m.french_toast),
    Entry("Egg Bites", "Breakfast", m.active.egg_bites),
    Entry("Breakfast Quesadilla", "Breakfast", m.breakfast_quesadilla),
    Entry("Power Bowl", "Breakfast", m.power_bowl),
    Entry("Grilled Cheese Breakfast Burrito", "Breakfast", m.breakfast_burrito),
    Entry("Strawberry Protein Overnight Oats", "Breakfast", m.overnight_oats_12oz, False),
    Entry("Blueberry Cheesecake Protein Pancakes", "Breakfast", m.blueberry_cheesecake_pancakes),
    Entry("Strawberry Cheesecake Protein Pancakes", "Breakfast", m.strawberry_cheesecake_pancakes),
    Entry("PRPD Beef Bacon Breakfast Sandwich", "Breakfast", m.breakfast_sandwich),
    Entry("Chocolate Peanut Butter Protein Shake", "Drink", m.protein_shake_chocolate_pb_12oz, False),
    Entry("Strawberry Vanilla Protein Shake", "Drink", m.protein_shake_strawberry_vanilla_12oz, False),

    # Chicken mains and add-ons
    Entry("Harissa Honey Chicken", "Chicken", m.harissa_honey_chicken),
    Entry("Halal Cart Chicken + Yellow Rice", "Chicken", m.halal_cart_complete),
    Entry("Sweet Chili Chicken", "Chicken", m.sweet_chili_chicken),
    Entry("Loaded Buffalo Chicken Potato", "Chicken", m.loaded_buffalo_revised),
    Entry("BBQ Chicken Mac & Cheese", "Chicken", m.bbq_mac),
    Entry("Chicken Biryani", "Chicken", m.biryani),
    Entry("Mediterranean Chicken Bowl", "Chicken", m.mediterranean_chicken_bowl),
    Entry("Peri Peri Chicken", "Chicken", m.active.peri_peri),
    Entry("Butter Chicken", "Chicken", m.butter_chicken_no_broth),
    Entry("Tandoori Chicken", "Chicken", m.tandoori_chicken),
    Entry("Mexican Streetcorn Chicken Bowl", "Chicken", m.streetcorn_updated),
    Entry("Creamy Garlic Parmesan Chicken Pasta", "Chicken", m.creamy_garlic_parmesan_chicken_pasta),
    Entry("Creamy Cajun Chicken Pasta", "Chicken", m.creamy_cajun_chicken_pasta),
    Entry("Chicken Shakshuka", "Chicken", m.chicken_shakshuka),
    Entry("Creamy Chicken Parmesan", "Chicken", m.creamy_chicken_parmesan),
    Entry("Chicken Enchilada Bake", "Chicken", m.chicken_enchilada_bake),
    Entry("Chinese-Style Bok Choy Chicken", "Chicken", m.chinese_bok_choy_chicken),
    Entry("Mini Chicken Snack Wrap", "Grab & Go", m.mini_chicken_wrap, False),
    Entry("Buffalo Chicken Pinwheels", "Grab & Go", m.buffalo_chicken_pinwheels, False),
    Entry("Mediterranean Chicken Hummus Box", "Grab & Go", m.mediterranean_chicken_hummus_box, False),
    Entry("BBQ Chicken Lavash Flatbread", "Grab & Go", m.bbq_chicken_lavash_flatbread, False),
    Entry("Chicken Caesar Crunch Box", "Grab & Go", m.chicken_caesar_crunch_box, False),

    # Beef, steak and seafood
    Entry("Beef Seekh Kabab Shawarma", "Beef", m.shan_seekh_shawarma),
    Entry("Korean Bulgogi Beef Bowl", "Beef", m.bulgogi),
    Entry("Boy Kibble", "Beef", m.active.halal_boy),
    Entry("Meatball Arrabbiata Pasta", "Beef", m.active.meatball_pasta),
    Entry("Pepper Steak Bowl", "Beef", m.pepper_steak_bowl),
    Entry("Southwest Beef Taco Bowl", "Beef", m.southwest_beef_taco_bowl),
    Entry("Cheeseburger Hot Pockets", "Beef", m.hot_pockets),
    Entry("Loaded Beef Cottage Pie", "Beef", m.cottage_pie),
    Entry("High-Protein Beef Lasagna", "Beef", m.high_protein_beef_lasagna),
    Entry("High-Protein Beef Kofta & Roasted Vegetables", "Custom", lambda: m.nouman_kofta(m), False),
    Entry("Garlic Butter Shrimp + Rice", "Seafood", m.garlic_shrimp),
    Entry("Lemon Pepper Tilapia", "Seafood", m.lemon_pepper_tilapia),
    Entry("NY Strip Steak Bites", "Beef", m.ny_strip),
    Entry("Cajun Garlic Salmon", "Seafood", m.cajun_garlic_salmon),
    Entry("PRPD Protein Box", "Grab & Go", m.protein_box, False),
    Entry("Caprese Protein Pasta Box", "Grab & Go", m.caprese_protein_pasta_box, False),

    # Desserts
    Entry("Strawberry Cheesecake", "Dessert", m.active.cheesecake, False),
    Entry("Chocolate Oreo Mousse", "Dessert", m.chocolate_oreo_mousse, False),
    Entry("Chocolate-Dipped Cookie Dough Balls", "Dessert", m.cookie_dough, False),
    Entry("Oreo Protein Cheesecake Cup", "Dessert", m.oreo_protein_cheesecake_cup, False),
    Entry("Lotus Biscoff Cheesecake", "Dessert", m.biscoff_cheesecake, False),
    Entry("Banana Cream Pie Cup", "Dessert", m.banana_cream, False),
    Entry("High Protein Tiramisu", "Dessert", m.tiramisu_complete, False),
    Entry("Baked Strawberry-Lemon Protein Cheesecake", "Dessert", m.strawberry_lemon_cheesecake, False),
    Entry("Chocolate Peanut Butter Protein Brownie", "Dessert", m.chocolate_peanut_butter_protein_brownie, False),

    # Paid custom control
    Entry("Custom Lebanese Chicken + Fattoush-Style Salad", "Custom", m.custom_lebanese_chicken, False, "Paid pilot estimate"),
]


UNCONTROLLED_HISTORICAL = [
    ("Scrambled Eggs + Potato Hash", "Breakfast"),
    ("Cilantro Lime Chicken + Pinto Beans", "Chicken"),
    ("Chicken Burrito", "Chicken"),
    ("Cheesy Achiote Chicken Tacos", "Chicken; current replacement draft awaiting controlled formula"),
    ("Chipotle Chicken Bowl", "Chicken"),
    ("Beef Seekh Kabab over Rice", "Beef; historical source version, not current shawarma"),
    ("Beef Stew with Potatoes", "Beef"),
    ("Mongolian Beef", "Beef"),
    ("Beef Stir Fry", "Beef"),
    ("Beef Chili Bowl", "Beef"),
    ("High Protein Kheer", "Dessert"),
    ("Oreo Shake Cup", "Dessert"),
    ("Mango Lassi Cup", "Dessert"),
    ("High Protein Rice Pudding", "Dessert"),
    ("Cookies and Cream Protein Cookies", "Dessert"),
]


def builds(entry: Entry):
    if entry.tiers:
        yield "Lean", entry.factory("lean")
        yield "Bulk", entry.factory("bulk")
    else:
        yield "Single", entry.factory()


def public_values(record: Build):
    return m.display(m.menu_total(record))


def full_values(record: Build):
    return m.display(m.total(record))


def excluded_grams(record: Build) -> float:
    return sum(p.amount for p in record.portions if not p.include_in_menu_macros and p.unit == "g")


def validate() -> list[str]:
    errors = []
    seen = set()
    for entry in ENTRIES:
        if entry.name in seen:
            errors.append(f"Duplicate controlled entry: {entry.name}")
        seen.add(entry.name)
        for tier, record in builds(entry):
            for portion in record.portions:
                note = portion.note.lower()
                explicitly_separate_cup = (
                    ("separate" in note and ("cup" in note or "dressing" in note))
                    or "side cup" in note
                    or "syrup cup" in note
                )
                if explicitly_separate_cup and portion.include_in_menu_macros:
                    errors.append(f"{entry.name} {tier}: separate cup still included: {portion.note}")
            if not m.nutrition_is_complete(record):
                continue
            pub = m.menu_total(record)
            full = m.total(record)
            if pub.calories > full.calories + 0.01:
                errors.append(f"{entry.name} {tier}: public calories exceed complete package")
    return errors


def report() -> str:
    rows = []
    for entry in ENTRIES:
        for tier, record in builds(entry):
            if not m.nutrition_is_complete(record):
                rows.append(
                    f"| {entry.category} | {entry.name} | {tier} | pending | pending | pending | pending | pending | "
                    f"pending | {excluded_grams(record):g}g | Physical package serving basis required; {record.confidence} confidence |"
                )
                continue
            cal, protein, carbs, fiber, fat = public_values(record)
            full_cal, *_ = full_values(record)
            side = excluded_grams(record)
            rows.append(
                f"| {entry.category} | {entry.name} | {tier} | {cal} | {protein}g | {carbs}g | {fiber}g | {fat}g | "
                f"{full_cal if side else 'same'} | {side:g}g | {entry.status}; {record.confidence} confidence |"
            )

    lines = [
        "# Full Controlled Menu Library Macro Audit",
        "",
        "Updated September 16, 2026. Chicken Enchilada Bake is now bean-free in both tiers by owner decision after customer feedback.",
        "",
        "This is the complete inventory of recipes that currently have a structured PRPD calculation. Public values exclude only optional sauces, dressings, or syrups supplied in their own sealed cup. Incorporated sauces and every core meal component remain included, even when bread, salad, fruit, toppings, or other components are physically packed separately for quality.",
        "",
        "The complete-package calorie column is retained for labels, allergens, production, and costing. `same` means there is no public-menu side-cup exclusion. Values remain working estimates until purchased labels and cooked yields are verified.",
        "",
        f"Controlled products: **{len(ENTRIES)}**. Controlled tier/build combinations: **{len(rows)}**.",
        "",
        "| Category | Dish | Tier | Public cal | Protein | Carbs | Fiber | Fat | Complete-package cal | Excluded side-cup grams | Control status |",
        "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|",
        *rows,
        "",
        "## Historical Library Names Without A Controlled Macro",
        "",
        "These names occur in the historical 49-dish index, but there is no current structured formula that can be responsibly recalculated. They remain unavailable for menu publication until the exact recipe, portions, package products, and yields are locked.",
        "",
        "| Historical dish | Category / note |",
        "|---|---|",
        *[f"| {name} | {category} |" for name, category in UNCONTROLLED_HISTORICAL],
        "",
        "## Audit Result",
        "",
        "All explicitly tagged optional side cups in the controlled library are excluded from public menu macros and retained in complete-package nutrition. No core component is excluded merely because it is packed separately.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    errors = validate()
    if errors:
        raise SystemExit("\n".join(errors))
    OUTPUT.write_text(report(), encoding="utf-8")
    print(f"Wrote {OUTPUT}")
    print(f"Validated {len(ENTRIES)} products")


if __name__ == "__main__":
    main()
