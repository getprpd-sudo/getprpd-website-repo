"""Controlled nutrition drafts for the proposed July 25, 2026 PRPD menu.

This file is intentionally separate from the live-menu calculator. It converts
historical volume language to explicit grams, recalculates every Lean/Bulk build,
and writes one review document. Nothing here publishes to the order page.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import sys


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))

import calculate_active_menu as active


Nutrition = active.Nutrition
Ingredient = active.Ingredient
Build = active.Build
Portion = active.Portion
n = active.n
p = active.p
build = active.build

OUTPUT_PATH = HERE / "NEXT_MENU_NUTRITION_DRAFT_2026-07-25.md"


@dataclass(frozen=True)
class DraftMeal:
    name: str
    category: str
    lean: Build
    bulk: Build | None
    decision: str
    validation: str


def add_ingredient(key: str, name: str, nutrition: Nutrition, basis: str = "100g", source: str = "USDA FoodData Central or generic packaged-food estimate", confidence: str = "medium", note: str = "") -> None:
    active.INGREDIENTS[key] = Ingredient(name, nutrition, basis, source, confidence, note)


# Supplemental profiles needed only by the next-menu draft. Exact package labels
# should replace medium-confidence packaged-food records before label printing.
add_ingredient("mushroom", "White mushrooms, raw", n(22, 3.09, 3.26, 1.0, 0.34, 0.05, 1.98, 0, 5, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("sourdough_slice", "Sourdough bread", n(100, 4, 20, 1, 1, 0.2, 1, 1, 180, 0), basis="each", note="One working 40g slice; replace with purchased loaf label.")
add_ingredient("sweet_potato", "Sweet potato, raw", n(86, 1.57, 20.12, 3.0, 0.05, 0.02, 4.18, 0, 55, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("sriracha", "Sriracha sauce", n(93, 1.3, 19.2, 0.9, 0.9, 0.1, 15, 10, 2000, 0), note="Generic estimate; sodium and sugar require the current bottle label.")
add_ingredient("oats", "Old-fashioned rolled oats", n(379, 13.15, 67.7, 10.1, 6.52, 1.22, 1.0, 0, 6, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("chia", "Chia seeds", n(486, 16.5, 42.1, 34.4, 30.7, 3.33, 0, 0, 16, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("flour", "All-purpose flour", n(364, 10.3, 76.3, 2.7, 0.98, 0.16, 0.27, 0, 2, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("baking_powder", "Baking powder", n(53, 0, 27.7, 0, 0, 0, 0, 0, 10600, 0), source="USDA FoodData Central", confidence="medium")
add_ingredient("hawaiian_roll", "Great Value Sweet Hawaiian roll", n(70, 2, 13, 0, 0.5, 0, 1, 1, 130, 0), basis="each", source="Walmart current product reference and package-equivalent nutrition", confidence="medium", note="Selected accessible 12-count roll; replace with the purchased package if substituted.")
add_ingredient("hot_sauce", "Frank's-style hot sauce", n(0, 0, 0, 0, 0, 0, 0, 0, 2700, 0), note="Calories round to zero; sodium requires current bottle label.")
add_ingredient("bbq_sauce", "G Hughes sugar-free BBQ sauce", n(33.33, 0, 6.67, 0, 0, 0, 0, 0, 966.67, 0), source="Working current product profile", confidence="medium", note="Modeled as 10 calories per 30g.")
add_ingredient("protein_mac", "Muscle Mac high-protein macaroni and cheese", n(394.74, 26.32, 64.47, 5.26, 6.58, 2.0, 5, 2, 700, 10), source="Walmart current Muscle Mac product reference plus conservative package-equivalent fields", note="Modeled as 300 calories, 20g protein, 49g carbs, 4g fiber, and 5g fat per 76g dry serving.", confidence="medium")
add_ingredient("beef_strips_cooked", "Lean beef strips, cooked", n(206, 29.9, 0, 0, 8.0, 3.2, 0, 0, 55, 90), source="USDA FoodData Central comparable cooked lean beef", confidence="medium")
add_ingredient("apple", "Apple, raw with skin", n(52, 0.26, 13.8, 2.4, 0.17, 0.03, 10.4, 0, 1, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("sesame_oil", "Sesame oil", n(884, 0, 0, 0, 100, 14.2, 0, 0, 0, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("cornstarch", "Cornstarch", n(381, 0.26, 91.3, 0.9, 0.05, 0.01, 0, 0, 9, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("cucumber", "Cucumber with peel, raw", n(15, 0.65, 3.63, 0.5, 0.11, 0.04, 1.67, 0, 2, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("shrimp_cooked", "Shrimp, cooked", n(99, 24, 0.2, 0, 0.3, 0.1, 0, 0, 111, 189), source="USDA FoodData Central comparable cooked shrimp", confidence="medium")
add_ingredient("edamame", "Shelled edamame, cooked", n(121, 11.9, 8.9, 5.2, 5.2, 0.62, 2.2, 0, 6, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("ny_strip_cooked", "NY strip steak, cooked, trimmed", n(227, 27, 0, 0, 13, 5, 0, 0, 54, 80), source="USDA FoodData Central comparable cooked strip steak", confidence="medium")
add_ingredient("peanut_butter", "Creamy peanut butter", n(588, 25.1, 20, 6, 50, 10, 9, 4, 459, 0), source="USDA FoodData Central", confidence="medium")
add_ingredient("chocolate_chips", "Mini semisweet chocolate chips", n(500, 4, 64, 4, 29, 18, 57, 57, 0, 0), note="Generic package estimate; replace with purchased bag label.")
add_ingredient("biscoff_spread", "Lotus Biscoff cookie butter", n(584, 3.0, 58, 0, 38, 8, 37, 37, 250, 0), source="Manufacturer-equivalent package values", confidence="medium")
add_ingredient("biscoff_cookie", "Lotus Biscoff cookie", n(38, 0.5, 5.7, 0.1, 1.5, 0.7, 3, 3, 29, 0), basis="each", source="Manufacturer-equivalent package values", confidence="medium")
add_ingredient("banana_pudding_mix", "Sugar-free banana pudding mix", n(267, 0, 66.7, 0, 0, 0, 0, 0, 1067, 0), note="Modeled as 20 calories per 7.5g; exact packet serving weight required.", confidence="low")
add_ingredient("blueberry", "Blueberries, frozen or fresh", n(57, 0.74, 14.49, 2.4, 0.33, 0.028, 9.96, 0, 1, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("green_bell_pepper", "Green bell pepper, raw", n(20, 0.86, 4.64, 1.7, 0.17, 0.058, 2.4, 0, 3, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("carrot", "Carrot, raw", n(41, 0.93, 9.58, 2.8, 0.24, 0.037, 4.74, 0, 69, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("zucchini", "Zucchini, raw", n(17, 1.21, 3.11, 1.0, 0.32, 0.084, 2.5, 0, 8, 0), source="USDA FoodData Central", confidence="high")


def chicken_thigh(raw_g: float) -> Portion:
    return active.chicken_thigh(raw_g)


def beef_pan(raw_g: float) -> Portion:
    return active.beef_pan(raw_g)


def beef_strips(raw_g: float) -> Portion:
    return p("beef_strips_cooked", raw_g * 0.76, note=f"{raw_g:g}g raw at 76% cooked yield")


def shrimp(raw_g: float) -> Portion:
    return p("shrimp_cooked", raw_g * 0.75, note=f"{raw_g:g}g raw at 75% cooked yield")


def steak(raw_g: float) -> Portion:
    return p("ny_strip_cooked", raw_g * 0.75, note=f"{raw_g:g}g raw at 75% cooked yield")


def omelette(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        p("egg", 2 if lean else 3, "each"), p("egg_white", 92 if lean else 138),
        p("fage", 30), p("mozzarella", 40 if lean else 56), p("mushroom", 50),
        p("jalapeno", 15), p("sourdough_slice", 1 if lean else 2, "each"),
        p("tomato", 100), p("avocado_oil", 2 if lean else 3),
        p("salt", 0.5 if lean else 0.75),
    ], ["Lean uses the updated Cut build; Bulk uses the updated Build build.", "Oil spray is controlled at 2g/3g retained."], "medium")


def breakfast_skillet(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        beef_pan(200 if lean else 270), p("sweet_potato", 100),
        p("egg", 1 if lean else 2, "each"), p("mozzarella", 28), p("onion", 25),
        p("garlic", 6), p("salsa", 30), p("avocado_oil", 3 if lean else 4),
        p("salt", 0.75 if lean else 1),
    ], ["All rendered beef fat is drained.", "Uses the updated 200g Lean and 270g Bulk raw-beef limits."], "medium")


def power_bowl(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(200 if lean else 300), p("sweet_potato", 100),
        p("egg", 2, "each"), p("fage", 30), p("sriracha", 15),
        p("avocado_oil", 2 if lean else 3), p("salt", 0.75 if lean else 1),
    ], ["Oil spray and salt are controlled rather than left uncounted."], "medium")


def overnight_oats(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        p("oats", 50 if lean else 65), p("fage", 150 if lean else 200),
        p("fairlife_milk", 120), p("whey", 19.5), p("strawberry", 80),
        p("chia", 15), p("honey", 7), p("maple_syrup", 15),
    ], ["One physical Premier scoop is 19.5g. The label serving of 39g equals two physical scoops."], "high")


def blueberry_cheesecake_pancakes(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        p("flour", 45 if lean else 60),
        p("baking_powder", 3 if lean else 4),
        p("whey", 9.75 if lean else 14.625),
        p("egg", 1, "each"),
        p("egg_white", 80 if lean else 120),
        p("fage", 100 if lean else 120),
        p("fairlife_milk", 60 if lean else 75),
        p("blueberry", 80 if lean else 100),
        p("philadelphia_no_bake", 20 if lean else 25),
        p("powdered_sugar", 4),
        p("maple_syrup", 30),
        p("vanilla", 2 if lean else 2.5),
        p("cinnamon", 0.5 if lean else 0.75),
        p("avocado_oil", 2 if lean else 3),
        p("salt", 0.5 if lean else 0.75),
    ], [
        "Lean targets three medium pancakes; Bulk targets four.",
        "The FAGE total is split between batter and cheesecake topping.",
        "Blueberry compote and cheesecake topping share one side cup; sugar-free syrup uses a second cup.",
        "This is a first-test build. Record finished pancake count, batter yield, topping yield, taste, and day-three reheat quality.",
    ], "medium")


def streetcorn_updated(tier: str) -> Build:
    recipe = active.streetcorn(tier)
    return build(
        [*recipe.portions, p("green_bell_pepper", 30 if tier == "lean" else 40)],
        [*recipe.assumptions, "Green bell pepper is included in the controlled street-corn component."],
        "medium",
    )


def hot_pockets(tier: str) -> Build:
    scale = 1 if tier == "lean" else 1.5
    return build([
        p("flour", 80 * scale), p("baking_powder", 6 * scale), p("fage", 82 * scale),
        beef_pan(80 * scale), p("onion", 20 * scale), p("broth", 20 * scale),
        p("ketchup", 9 * scale), p("pickles", 12 * scale), p("mozzarella", 40 * scale),
        p("salt", 1.2 * scale),
    ], ["Lean is two pockets; Bulk is three pockets.", "Dough is scaled from the 10-pocket historical batch: 400g flour plus 410g yogurt."], "medium")


def sliders(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(200 if lean else 240), p("hawaiian_roll", 2 if lean else 3, "each"),
        p("mozzarella", 28 if lean else 42), p("light_mayo", 20 if lean else 22),
        p("sriracha", 10 if lean else 11), p("honey", 10 if lean else 11),
        p("hot_sauce", 20 if lean else 24), p("onion", 15 if lean else 20),
        p("corn", 20 if lean else 25), p("pickles", 15 if lean else 20),
        p("avocado_oil", 3 if lean else 4), p("salt", 0.75 if lean else 1),
    ], ["Lean is two sliders; Bulk is three.", "Uses boneless skinless chicken thighs, one controlled cheese, no garlic-butter topping, and measured hot-honey mayo."], "medium")


def biryani(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(200 if lean else 300), p("rice_dry", 40), p("fage", 7.5),
        p("onion", 50), p("tomato", 50), p("garlic", 8), p("ginger", 5),
        p("lemon", 15), p("cucumber", 50), p("tomato", 50), p("onion", 20),
        p("lemon", 10), p("avocado_oil", 2 if lean else 3),
        p("salt", 0.75 if lean else 1),
    ], ["Only 25% of the 30g yogurt marinade is counted after scraping.", "Includes a separately packed cucumber, tomato, and onion salad with lemon; verify day-three holding quality."], "medium")


def bbq_mac(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(200 if lean else 300), p("protein_mac", 76), p("bbq_sauce", 60),
        p("mozzarella", 28), p("salt", 0.5 if lean else 0.75),
    ], ["Includes 30g sauce in the dish plus a 30g side cup.", "Exact boxed-mac label is the main remaining nutrition input."], "low")


def bulgogi(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        beef_strips(180 if lean else 250), p("rice_dry", 40),
        p("broccoli", 35 if lean else 45), p("green_bell_pepper", 30 if lean else 40),
        p("carrot", 30 if lean else 40), p("soy_sauce", 30), p("honey", 21),
        p("sesame_oil", 2.25), p("garlic", 12), p("ginger", 5),
        p("sriracha", 5), p("apple", 60), p("cornstarch", 3),
        p("avocado_oil", 3),
    ], ["Uses the proposed cost-controlled 180g Lean and 250g Bulk raw portions.", "Broccoli, bell pepper, and carrot form the controlled stir-fry vegetable blend."], "medium")


def garlic_shrimp(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        shrimp(200 if lean else 270), p("rice_dry", 45 if lean else 60),
        p("edamame", 74 if lean else 100), p("zucchini", 100 if lean else 130),
        p("butter", 7 if lean else 10),
        p("garlic", 12 if lean else 15), p("lemon", 10 if lean else 12),
        p("cornstarch", 4 if lean else 5), p("salt", 0.5 if lean else 0.75),
    ], ["Rebalanced from the preliminary 180g/240g proposal so Bulk reaches a meaningful calorie and protein tier.", "The historical two tablespoons of butter was ambiguous; butter is now explicit per meal."], "medium")


def ny_strip(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        steak(240 if lean else 300), p("potato", 200), p("broccoli", 100 if lean else 125),
        p("fairlife_milk", 30 if lean else 40), p("fage", 20 if lean else 25),
        p("butter", 3 if lean else 5), p("avocado_oil", 2), p("garlic", 6 if lean else 8),
        p("salt", 0.75 if lean else 1),
    ], ["Lean uses 240g raw steak; Bulk uses 300g.", "The mashed-potato side uses measured Fairlife milk, FAGE, and butter; broccoli is the green vegetable."], "medium")


def cookie_dough() -> Build:
    return build([
        p("cottage", 113), p("whey", 19.5), p("oats", 45), p("peanut_butter", 16),
        p("honey", 7), p("vanilla", 2), p("chocolate_chips", 14),
    ], ["One physical Premier scoop is 19.5g, not the full 39g two-scoop label serving.", "Oats are ground into oat flour."], "medium")


def biscoff_cheesecake() -> Build:
    return build([
        p("cottage", 113), p("fage", 100), p("whey", 19.5), p("biscoff_spread", 15),
        p("powdered_sugar", 3), p("vanilla", 2), p("biscoff_cookie", 2, "each"),
        p("fairlife_milk", 10), p("salt", 0.2),
    ], [
        "One physical Premier scoop is 19.5g.",
        "Two crushed cookies form the crumb layer; measured Fairlife replaces the old butter binder.",
        "Use 10g cookie butter in the filling and 5g as the top swirl.",
        "The revised cup removes the old butter and honey and reduces cookie butter from 32g to 15g.",
    ], "medium")


def banana_cream() -> Build:
    return build([
        p("fage", 170), p("banana_pudding_mix", 7.5), p("whey", 9.75),
        p("banana", 59), p("biscoff_cookie", 2, "each"),
    ], ["Historical half-scoop becomes 9.75g Premier powder.", "Half a medium banana is modeled as 59g edible fruit."], "low")


MEALS = [
    DraftMeal("High Protein Omelette", "Breakfast", omelette("lean"), omelette("bulk"), "Keep", "Confirm purchased sourdough label."),
    DraftMeal("Beef Breakfast Skillet", "Breakfast", breakfast_skillet("lean"), breakfast_skillet("bulk"), "Keep", "Record one drained cooked-beef yield."),
    DraftMeal("Power Bowl", "Breakfast", power_bowl("lean"), power_bowl("bulk"), "Keep", "No formula blocker."),
    DraftMeal("Blueberry Cheesecake Protein Pancakes", "Breakfast", blueberry_cheesecake_pancakes("lean"), blueberry_cheesecake_pancakes("bulk"), "Test", "New breakfast: verify three/four-pancake yield, topping yield, sweetness, and day-three reheat quality."),
    DraftMeal("Cheeseburger Hot Pockets", "Main", hot_pockets("lean"), hot_pockets("bulk"), "Keep", "Owner confirmed three Bulk pockets fit the container. Confirm dough yield and day-three reheat quality."),
    DraftMeal("Mexican Streetcorn Chicken Bowl", "Main", streetcorn_updated("lean"), streetcorn_updated("bulk"), "Keep", "Street-corn component still needs its first kitchen check."),
    DraftMeal("Hot Honey Chicken Sliders", "Main", sliders("lean"), sliders("bulk"), "Test", "New dish: taste, fit, leakage, and day-three reheat test required."),
    DraftMeal("Chicken Biryani", "Main", biryani("lean"), biryani("bulk"), "Keep", "Customer favorite; record retained marinade/oil once."),
    DraftMeal("BBQ Chicken Mac & Cheese", "Main", bbq_mac("lean"), bbq_mac("bulk"), "Keep", "Uses the selected Muscle Mac planning product; confirm the purchased box before label printing."),
    DraftMeal("Korean Bulgogi Beef Bowl", "Main", bulgogi("lean"), bulgogi("bulk"), "Keep", "Confirm smaller beef portions still plate generously."),
    DraftMeal("Garlic Butter Shrimp + Rice", "Main", garlic_shrimp("lean"), garlic_shrimp("bulk"), "Keep", "Confirm current shrimp package label and cooked yield."),
    DraftMeal("Premium NY Strip Steak", "Main", ny_strip("lean"), ny_strip("bulk"), "Test", "Confirm cooked yield, doneness after reheating, and side presentation."),
    DraftMeal("Cookie Dough Cup", "Dessert", cookie_dough(), None, "Keep", "19.5g powder resolves the old scoop ambiguity."),
    DraftMeal("Lotus Biscoff Cheesecake", "Dessert", biscoff_cheesecake(), None, "Test", "Reduced-calorie 395-calorie prototype: verify Biscoff flavor, crumb structure, sweetness, and day-three texture; exact Biscoff labels preferred."),
    DraftMeal("Banana Cream Pie Cup", "Dessert", banana_cream(), None, "Keep", "Exact pudding packet serving weight required before label lock."),
]


def total(record: Build) -> Nutrition:
    return active.total(record)


def display(value: Nutrition) -> tuple[int, int, int, int, int]:
    return (
        int(round(value.calories / 5) * 5), int(round(value.protein)),
        int(round(value.carbs)), int(round(value.fiber)), int(round(value.fat)),
    )


def amount_text(portion: Portion) -> str:
    ingredient = active.INGREDIENTS[portion.ingredient]
    amount = f"{portion.amount:g} {portion.unit}" if portion.unit != "each" else f"{portion.amount:g} each"
    return f"{amount} {ingredient.name}"


def report() -> str:
    lines = [
        "# PRPD July 25 Menu - Controlled Recipe and Nutrition Draft",
        "",
        "Generated: July 20, 2026",
        "",
        "## What Is Locked Here",
        "",
        "This document rebuilds the proposed menu from ingredient quantities. It does not copy historical calorie claims. It is a development document and does not publish anything to the customer order page.",
        "",
        "Protein-powder rule: the current Premier label serving is 39g and equals two physical scoops. Therefore one physical scoop is 19.5g and one-half physical scoop is 9.75g. Every recipe below uses grams, never the word scoop.",
        "",
        "## Executive Nutrition Table",
        "",
        "| Category | Dish | Tier | Calories | Protein | Carbs | Fiber | Fat | Decision |",
        "|---|---|---|---:|---:|---:|---:|---:|---|",
    ]
    for meal in MEALS:
        for tier, record in (("Single" if meal.bulk is None else "Lean", meal.lean), ("Bulk", meal.bulk)):
            if record is None:
                continue
            calories, protein, carbs, fiber, fat = display(total(record))
            lines.append(f"| {meal.category} | {meal.name} | {tier} | {calories} | {protein}g | {carbs}g | {fiber}g | {fat}g | {meal.decision} |")

    lines += [
        "",
        "## Portion Decisions",
        "",
        "- Lean meals generally land around 500-650 calories. The omelette is intentionally lighter, while the premium steak sits near the top of the range.",
        "- Bulk meals generally land around 650-800 calories. Bulk Hot Pockets remain three pockets at about 815 calories because the owner confirmed that three fit the container; dough yield and day-three reheat quality still require a kitchen check.",
        "- Bulgogi remains at 180g raw Lean and 250g raw Bulk because the rebuilt meal still supplies a strong protein serving after rice and sauce are counted.",
        "- Blueberry Cheesecake Protein Pancakes target three Lean and four Bulk pancakes, with compote, cheesecake-yogurt topping, and syrup packed separately. Physical yield and reheat approval remain required.",
        "- Shrimp is adjusted to 200g raw Lean and 270g raw Bulk, with 45g/60g dry rice, 74g/100g edamame, and zucchini. This produces a more meaningful Bulk tier than the earlier 180g/240g proposal.",
        "- Steak remains 240g raw Lean and 300g raw Bulk. The 200g mashed-potato base, measured dairy/butter, and broccoli keep the plate near the desired calorie range.",
        "- Desserts use the intended physical scoop quantities: 19.5g in Cookie Dough and Biscoff Cheesecake, and 9.75g in Banana Cream Pie. This improves taste and cost without pretending every dessert needs 50g protein.",
        "",
        "## Remaining Approval Gates",
        "",
        "1. Buy the exact slider rolls, boxed protein mac, shrimp, sourdough, Biscoff products, banana pudding mix, blueberries, and pancake flour; photograph their labels.",
        "2. Test Blueberry Cheesecake Protein Pancakes, Hot Honey Chicken Sliders, and the plated NY strip meal.",
        "3. Confirm the three-pocket Bulk Hot Pocket fit, street-corn component, biryani salad holding quality, zucchini-shrimp presentation, and reduced bulgogi plate size.",
        "4. Record one actual cooked yield for pancakes, steak, beef strips, shrimp, and drained ground beef.",
        "5. Only after these recipes are approved, regenerate direct packed cost and margins from the observed final builds.",
        "",
        "## Controlled Builds",
    ]
    for meal in MEALS:
        lines += ["", f"### {meal.name}", "", f"Decision: {meal.decision}. Validation: {meal.validation}"]
        for tier, record in (("Single" if meal.bulk is None else "Lean", meal.lean), ("Bulk", meal.bulk)):
            if record is None:
                continue
            calories, protein, carbs, fiber, fat = display(total(record))
            lines += ["", f"**{tier}: {calories} calories | {protein}g protein | {carbs}g carbs | {fiber}g fiber | {fat}g fat**", ""]
            lines.extend(f"- {amount_text(portion)}" + (f" ({portion.note})" if portion.note else "") for portion in record.portions)
            if record.assumptions:
                lines.append("")
                lines.extend(f"- Assumption: {note}" for note in record.assumptions)

    lines += [
        "",
        "## Accuracy Standard",
        "",
        "Whole foods use USDA or equivalent generic records. Current PRPD package labels take priority where available. These are calculated estimates appropriate for PRPD's current small-batch operation, not laboratory analyses. Calories and macros are ready for menu decisions; final customer nutrition labels still require the listed package/yield checks.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    OUTPUT_PATH.write_text(report(), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    for meal in MEALS:
        values = [display(total(meal.lean))]
        if meal.bulk:
            values.append(display(total(meal.bulk)))
        print(meal.name, values)


if __name__ == "__main__":
    main()
