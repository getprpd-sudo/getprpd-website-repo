"""Controlled nutrition estimates for the August 15, 2026 PRPD menu.

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

OUTPUT_PATH = HERE / "NEXT_MENU_NUTRITION_2026-08-15.md"


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
add_ingredient("sriracha", "Sriracha sauce", n(93, 1.3, 19.2, 0.9, 0.9, 0.1, 15, 10, 2000, 0), note="Generic estimate; sodium and sugar require the current bottle label.")
add_ingredient("oats", "Old-fashioned rolled oats", n(379, 13.15, 67.7, 10.1, 6.52, 1.22, 1.0, 0, 6, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("chia", "Chia seeds", n(486, 16.5, 42.1, 34.4, 30.7, 3.33, 0, 0, 16, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("pickles", "House refrigerator-pickled vegetables", n(15, 0.5, 3, 1, 0.2, 0, 1, 0, 800, 0), source="Conservative drained refrigerator-pickle working profile", confidence="medium", note="Use the tested house refrigerator-pickle recipe; verify finished drained yield and salt before final label printing.")
add_ingredient("pbfit", "PBfit Classic powdered peanut butter", n(375, 50, 31.25, 18.75, 12.5, 0, 6.25, 0, 250, 0), source="PBfit Classic package specification", confidence="medium", note="Modeled from 60 calories, 8g protein, 5g carbohydrate, 3g fiber, and 2g fat per 16g. Confirm the purchased package before final labeling.")
add_ingredient("harissa", "Harissa paste", n(66.67, 0, 6.67, 0, 3.33, 0, 3.33, 0, 800, 0), source="Mina-style packaged harissa working profile", confidence="low", note="Modeled as 10 calories per 15g. Replace with the purchased jar label before label printing.")
add_ingredient("coriander", "Ground coriander", n(298, 12.4, 55, 41.9, 17.8, 1, 0, 0, 35, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("reduced_cream_cheese", "Reduced-fat cream cheese", n(250, 7.14, 7.14, 0, 21.43, 14.29, 7.14, 0, 357, 71), source="Generic one-third-less-fat cream cheese package profile", confidence="medium", note="Modeled from 70 calories per 28g. Confirm the purchased package before label printing.")
add_ingredient("flour", "All-purpose flour", n(364, 10.3, 76.3, 2.7, 0.98, 0.16, 0.27, 0, 2, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("baking_powder", "Baking powder", n(53, 0, 27.7, 0, 0, 0, 0, 0, 10600, 0), source="USDA FoodData Central", confidence="medium")
add_ingredient(
    "hawaiian_roll",
    "Sara Lee Artesano Bakery Roll",
    n(120, 4, 23, 0.5, 1.5, 0, 3, 2, 210, 0),
    basis="each",
    source="Sara Lee Artesano Bakery Rolls manufacturer specification",
    confidence="high",
    note="One 43g roll. Contains wheat, soy, and sesame; may contain milk.",
)
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
add_ingredient("english_muffin", "English muffin", n(130, 5, 25, 1, 1.5, 0.3, 2, 1, 240, 0), basis="each", source="Generic packaged English muffin estimate", confidence="medium", note="Replace with the purchased package label before printing final labels.")
add_ingredient("beef_bacon", "Deen Halal beef breakfast slice", n(100, 4, 0, 0, 9, 3.5, 0, 0, 260, 20), basis="each", source="Deen Halal manufacturer listing and current product databases", confidence="medium", note="One modeled slice is 20g. Confirm the purchased package before final label printing.")
add_ingredient("tilapia_cooked", "Tilapia, cooked", n(128, 26.2, 0, 0, 2.7, 0.9, 0, 0, 56, 57), source="USDA FoodData Central comparable cooked tilapia", confidence="medium")
add_ingredient("mixed_vegetables", "Frozen peas and carrots", n(65, 3, 12, 4, 0.5, 0.1, 4, 0, 45, 0), source="Generic frozen peas-and-carrots blend estimate", confidence="medium")


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


def sweet_heat_45g() -> list[Portion]:
    """Owner-confirmed net 45g cup using the measured Batch 5 ratio.

    Batch 5 used approximately 250g light mayonnaise, 300g ketchup, 300g
    honey, and 170g sriracha at the working midpoint. The ratio is encoded
    here so nutrition, allergens, production, grocery, and labels cannot omit
    the cup while the next run confirms its tare and finished yield.
    """
    batch_g = 1020
    return [
        p("light_mayo", 45 * 250 / batch_g, note="45g Sweet Heat cup"),
        p("ketchup", 45 * 300 / batch_g, note="45g Sweet Heat cup"),
        p("honey", 45 * 300 / batch_g, note="45g Sweet Heat cup"),
        p("sriracha", 45 * 170 / batch_g, note="45g Sweet Heat cup"),
    ]


SWEET_HEAT_ASSUMPTION = (
    "Includes one 45g net PRPD Sweet Heat cup using the Batch 5 "
    "250:300:300:170 light-mayo:ketchup:honey:sriracha ratio. Tare the cup and "
    "lid and record the exact next-run yield before promoting this to final."
)


def omelette(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        p("egg", 2 if lean else 3, "each"), p("egg_white", 92 if lean else 138),
        p("mozzarella", 40 if lean else 56), p("mushroom", 50),
        p("jalapeno", 15), p("sourdough_slice", 1 if lean else 2, "each"),
        p("tomato", 100), p("avocado_oil", 2 if lean else 3),
        p("salt", 0.5 if lean else 0.75),
    ], ["Lean uses the updated Cut build; Bulk uses the updated Build build.", "The retired yogurt finish is removed.", "Oil spray is controlled at 2g/3g retained."], "medium")


def breakfast_skillet(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        beef_pan(200 if lean else 270), p("potato", 100),
        p("egg", 1 if lean else 2, "each"), p("mozzarella", 28), p("onion", 25),
        p("garlic", 6), p("salsa", 30), p("avocado_oil", 3 if lean else 4),
        p("salt", 0.75 if lean else 1),
    ], ["All rendered beef fat is drained.", "Uses the updated 200g Lean and 270g Bulk raw-beef limits."], "medium")


def power_bowl(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(200 if lean else 300), p("potato", 100),
        p("egg", 2, "each"),
        p("avocado_oil", 2 if lean else 3), p("salt", 0.75 if lean else 1),
        *sweet_heat_45g(),
    ], ["The retired yogurt-sriracha finish is removed.", "Oil spray and salt are controlled rather than left uncounted.", SWEET_HEAT_ASSUMPTION], "medium")


def overnight_oats_12oz() -> Build:
    return build([
        p("oats", 40), p("fage", 120), p("fairlife_milk", 75),
        p("whey", 15), p("strawberry", 45), p("chia", 5),
        p("honey", 7), p("vanilla", 1), p("salt", 0.2),
    ], [
        "One fixed Grab & Go size; this is not a Lean/Bulk build.",
        "Raw ingredient input is 308.2g. Reduce 45g strawberries to a recorded 30g before assembly for an estimated 293.2g finished fill.",
        "Physical fit, 72-hour texture, package labels, and final filled weight remain required before sale.",
    ], "medium")


def protein_shake_chocolate_pb_12oz() -> Build:
    return build([
        p("fairlife_milk", 275), p("whey", 30), p("pbfit", 12),
        p("cocoa", 5), p("vanilla", 1), p("salt", 0.2),
    ], [
        "Development formula for one nominal 12 fl oz bottle; ingredient weight is 323.2g before blender loss.",
        "Xanthan gum is intentionally excluded. Separation is acceptable; label the bottle SHAKE WELL.",
        "Use the exact Premier Protein chocolate powder package before final nutrition/allergen labeling.",
        "Physical volume, density, blender loss, 72-hour hold, cap fit, and leak tests remain required.",
    ], "medium")


def protein_shake_strawberry_vanilla_12oz() -> Build:
    return build([
        p("fairlife_milk", 220), p("fage", 40), p("whey", 30),
        p("strawberry", 75), p("lemon", 2), p("vanilla", 1),
    ], [
        "Development formula for one nominal 12 fl oz bottle; raw ingredient input is 368g.",
        "Reduce and strain 75g strawberries to a recorded 50g, then cool fully. Estimated filled formula weight is 343g before blender loss.",
        "Xanthan gum is intentionally excluded. Separation is acceptable; label the bottle SHAKE WELL.",
        "Physical volume, density, blender loss, 72-hour hold, cap fit, and leak tests remain required.",
    ], "medium")


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


def strawberry_cheesecake_pancakes(tier: str) -> Build:
    recipe = blueberry_cheesecake_pancakes(tier)
    return build(
        [p("strawberry", portion.amount, portion.unit, portion.note) if portion.ingredient == "blueberry" else portion for portion in recipe.portions],
        [*recipe.assumptions, "Strawberries replace blueberries gram-for-gram in the compote."],
        "medium",
    )


def breakfast_sandwich(tier: str) -> Build:
    lean = tier == "lean"
    sandwiches = 1 if lean else 2
    return build([
        p("english_muffin", sandwiches, "each"),
        p("beef_bacon", sandwiches, "each"),
        p("egg", 1, "each"),
        p("egg_white", 80 if lean else 150),
        p("cottage", 40 if lean else 60),
        p("mozzarella", 28 if lean else 42),
        p("potato", 150 if lean else 80),
        p("avocado_oil", 2 if lean else 1.5),
        p("salt", .5 if lean else .75),
        *sweet_heat_45g(),
    ], [
        "Lean receives one sandwich and 150g breakfast potatoes; Bulk receives two sandwiches and an 80g potato garnish.",
        "Egg, egg white, and cottage cheese are blended and baked as a sheet-pan patty before cutting.",
        "The retired maple-Dijon is removed; one 45g PRPD Sweet Heat cup is packed separately.",
        "Beef-bacon and English-muffin package labels must be confirmed before final label printing.",
    ], "medium")


def breakfast_burrito(tier: str) -> Build:
    """Controlled broth-free version of the historical breakfast burrito."""
    lean = tier == "lean"
    return build([
        beef_pan(120 if lean else 180),
        p("small_tortilla" if lean else "large_tortilla", 2, "each"),
        p("egg", 2, "each"), p("egg_white", 61.3),
        p("mozzarella", 28 if lean else 42), p("tomato_paste", 16),
        p("onion", 25), p("salt", 0.75 if lean else 1),
    ], [
        "Broth is intentionally removed from the PRPD recipe system.",
        "Cook the beef-and-onion filling down until dry enough to wrap cleanly; dry-pan grill after assembly.",
    ], "medium")


def cottage_pie(tier: str) -> Build:
    lean = tier == "lean"
    raw_beef = 170 if lean else 220
    return build([
        beef_pan(raw_beef),
        p("potato", 220 if lean else 240),
        p("cottage", 50 if lean else 65),
        p("mozzarella", 28 if lean else 35),
        p("mixed_vegetables", 80 if lean else 100),
        p("onion", 40 if lean else 50),
        p("tomato_paste", 20 if lean else 26),
        p("avocado_oil", 2 if lean else 3),
        p("salt", .75 if lean else 1),
        *sweet_heat_45g(),
    ], [
        "Ground beef is cooked to 160 F, drained, and combined with measured peas and carrots plus tomato paste; no broth is used.",
        "Mashed potatoes are blended with cottage cheese, spread over the filling, topped with mozzarella, and baked.",
        "Record the finished pan weight and plated serving count during the first production batch.",
        SWEET_HEAT_ASSUMPTION,
    ], "medium")


def tilapia(raw_g: float) -> Portion:
    return p("tilapia_cooked", raw_g * .80, note=f"{raw_g:g}g raw at 80% cooked yield")


def blackened_tilapia(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        tilapia(220 if lean else 300),
        p("potato", 250 if lean else 320),
        p("broccoli", 100 if lean else 130),
        # Same controlled 30g white sauce used by Halal Cart Chicken.
        p("fage", 22.06),
        p("light_mayo", 3.31),
        p("garlic", 1.32),
        p("lemon", 3.31),
        p("paprika", 2 if lean else 2.5),
        p("chili_powder", .5 if lean else .75),
        p("avocado_oil", 5 if lean else 7),
        p("salt", .75 if lean else 1),
    ], [
        "Tilapia uses a provisional 80% cooked yield; record the first raw and cooked batch weights.",
        "The standard 30g PRPD white sauce is packed separately and potatoes are roasted with the controlled oil allocation.",
    ], "medium")


def sweet_chili_chicken(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(200 if lean else 275),
        p("rice_dry", 45 if lean else 60),
        p("mixed_vegetables", 75 if lean else 100),
        p("sweet_chili", 30 if lean else 40),
        p("soy_sauce", 8 if lean else 10),
        p("garlic", 4 if lean else 5),
        p("avocado_oil", 2 if lean else 3),
        p("salt", .5 if lean else .75),
    ], [
        "Chicken uses the compatible neutral savory base and receives sweet-chili sauce only after cooking.",
        "Rice plus measured peas and carrots are cooked as one controlled vegetable-rice batch.",
    ], "medium")


def protein_box() -> Build:
    return build([
        p("egg", 2, "each"),
        p("beef_bacon", 1, "each"),
        p("mozzarella", 28),
        p("apple", 70),
        p("cucumber", 60),
        p("fage", 22),
        p("light_mayo", 4),
        p("lemon", 2.4),
        p("jalapeno", 2.4),
        p("garlic", 1.2),
        p("avocado_oil", .4),
        p("salt", .3),
        p("cumin", .1),
    ], [
        "One add-on box contains two hard-boiled eggs, one 20g beef-breakfast slice, 28g mozzarella, one approximately 70g whole mini apple, 60g cucumber, and 32g house sauce.",
        "Use a divided snack container and keep the sauce in its own sealed well or cup.",
    ], "medium")


def mini_chicken_wrap() -> Build:
    return build([
        chicken_thigh(130),
        p("fajita_tortilla", 2, "each"),
        p("mozzarella", 20),
        p("lettuce", 25),
        p("onion", 12),
        p("tomato", 10),
        p("cucumber", 10),
        p("fage", 17),
        p("light_mayo", 3),
        p("lemon", 1.9),
        p("jalapeno", 1.9),
        p("garlic", .9),
        p("avocado_oil", .3),
        p("salt", .25),
        p("cumin", .08),
    ], [
        "One add-on order uses two 45-calorie Mission Carb Balance Fajita tortillas, 130g raw chicken thigh, fresh chopped salad, cheese, and 25g house sauce.",
        "Purchased pickled vegetables are removed; lettuce, onion, tomato, and cucumber form the fresh salad mix.",
        "Use the compatible neutral chicken base and cool the chicken before wrapping.",
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
        beef_pan(80 * scale), p("onion", 20 * scale),
        p("ketchup", 9 * scale), p("mozzarella", 40 * scale),
        p("salt", 1.2 * scale),
    ], ["Lean is two pockets; Bulk is three pockets.", "The beef filling uses no broth and must be cooked down before cooling and assembly.", "Purchased pickled vegetables are removed from the filling.", "Dough is scaled from the 10-pocket historical batch: 400g flour plus 410g yogurt."], "medium")


def sliders(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(140 if lean else 187), p("hawaiian_roll", 3 if lean else 4, "each"),
        p("mozzarella", 28 if lean else 42), p("light_mayo", 9 if lean else 12),
        p("sriracha", 6 if lean else 8), p("honey", 6 if lean else 8),
        p("hot_sauce", 12 if lean else 16), p("onion", 15 if lean else 20),
        p("pickles", 15 if lean else 20),
        p("avocado_oil", 1 if lean else 1.5), p("salt", 0.5 if lean else 0.75),
    ], [
        "Lean is three sliders; Bulk is four.",
        "Each slider targets 35g cooked chicken, modeled from raw chicken thighs at a 75% cooked yield.",
        "Uses Sara Lee Artesano Bakery Rolls, measured hot-honey mayo, onion, pickles, and no corn.",
    ], "high")


def harissa_honey_chicken(tier: str) -> Build:
    lean = tier == "lean"
    raw_chicken = 200 if lean else 300
    scale = raw_chicken / 1000
    return build([
        chicken_thigh(raw_chicken), p("rice_dry", 55 if lean else 70),
        p("broccoli", 100 if lean else 130),
        p("harissa", 60 * scale), p("honey", 40 * scale),
        p("tomato_paste", 30 * scale), p("lemon", 30 * scale),
        p("garlic", 15 * scale), p("avocado_oil", 20 * scale),
        p("paprika", 3 * scale), p("coriander", 3 * scale), p("salt", 8 * scale),
    ], [
        "Chicken uses the shared neutral savory base, then receives the exact measured harissa-honey finish.",
        "Glaze is incorporated; there is no duplicate sauce cup.",
        "Harissa package data and the first finished glaze/chicken yield must be recorded before label printing.",
    ], "medium")


def biryani(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(200 if lean else 300), p("rice_dry", 40), p("fage", 7.5),
        p("onion", 50), p("tomato", 50), p("garlic", 8), p("ginger", 5),
        p("lemon", 15), p("avocado_oil", 2 if lean else 3),
        p("salt", 0.75 if lean else 1),
    ], [
        "Only 25% of the 30g yogurt marinade is counted after scraping.",
        "The discontinued cucumber salad is excluded from production and nutrition.",
    ], "medium")


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
        *sweet_heat_45g(),
    ], ["Lean uses 240g raw steak; Bulk uses 300g.", "The mashed-potato side uses measured Fairlife milk, FAGE, and butter; broccoli is the green vegetable.", SWEET_HEAT_ASSUMPTION], "medium")


def cookie_dough() -> Build:
    return build([
        p("cottage", 113), p("whey", 19.5), p("oats", 45), p("peanut_butter", 16),
        p("honey", 7), p("vanilla", 2), p("chocolate_chips", 14),
    ], [
        "One physical Premier scoop is 19.5g, not the full 39g two-scoop label serving.",
        "Oats are ground into oat flour.",
        "The 14g chocolate allocation is the total per serving, including the outer coating; it is not an additional coating on top of 14g mixed into the dough.",
        "Form three medium balls per serving.",
    ], "medium")


def strawberry_lemon_cheesecake_square() -> Build:
    """One of eight equal baked squares from the controlled pilot pan."""
    return build([
        p("reduced_cream_cheese", 42.5), p("cottage", 37.5), p("fage", 12.5),
        p("egg", 0.25, "each"), p("whey", 5), p("cornstarch", 2.875),
        p("vanilla", 0.5), p("lemon", 2.25), p("salt", 0.125),
        p("strawberry", 31.25), p("honey", 7.8125),
    ], [
        "One serving is one-eighth of the baked 8-inch square pan.",
        "The strawberry component is cooked down before swirling; nutrition counts its full raw ingredient weight.",
        "Honey replaces an unspecified sweetener so the customer ingredient statement and nutrition remain auditable.",
        "Record baked pan weight and eight finished square weights before label printing.",
    ], "medium")


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
    DraftMeal("PRPD Beef Bacon Breakfast Sandwich", "Breakfast", breakfast_sandwich("lean"), breakfast_sandwich("bulk"), "Owner approved", "Confirm the purchased beef-bacon and English-muffin labels; pack one 45g Sweet Heat cup."),
    DraftMeal("French Toast", "Breakfast", active.MEALS[1].lean, active.MEALS[1].bulk, "Owner approved", "Use the confirmed three-Lean/four-Bulk slice builds and measured syrup cup."),
    DraftMeal("Breakfast Quesadilla", "Breakfast", active.quesadilla("lean"), active.quesadilla("bulk"), "Owner approved", "Use the controlled salsa and yogurt portions."),
    DraftMeal("Grilled Cheese Breakfast Burrito", "Breakfast", breakfast_burrito("lean"), breakfast_burrito("bulk"), "Owner approved", "Use the broth-free controlled filling."),
    DraftMeal("Loaded Beef Cottage Pie", "Main", cottage_pie("lean"), cottage_pie("bulk"), "Owner approved", "Record finished pan yield and pack one 45g Sweet Heat cup."),
    DraftMeal("Hot Honey Chicken Sliders", "Main", sliders("lean"), sliders("bulk"), "Owner approved", "Record slider count, cooked chicken allocation, and day-three reheat."),
    DraftMeal("Loaded Buffalo Chicken Potato", "Main", active.loaded_buffalo("lean"), active.loaded_buffalo("bulk"), "Owner approved", "Record potato and buffalo-sauce yield."),
    DraftMeal("Beef Seekh Kabab Shawarma", "Main", active.seekh("lean"), active.seekh("bulk"), "Owner approved", "Use drained house refrigerator pickles packed separately."),
    DraftMeal("Harissa Honey Chicken", "Main", harissa_honey_chicken("lean"), harissa_honey_chicken("bulk"), "Owner approved", "Confirm the harissa package and first glaze/chicken yield."),
    DraftMeal("Mexican Streetcorn Chicken Bowl", "Main", streetcorn_updated("lean"), streetcorn_updated("bulk"), "Owner approved", "Reuse the neutral chicken and common-rice waves; record the finished street-corn yield."),
    DraftMeal("Garlic Butter Shrimp + Rice", "Main", garlic_shrimp("lean"), garlic_shrimp("bulk"), "Owner approved", "Record raw-to-cooked shrimp yield and day-three quality."),
    DraftMeal("BBQ Chicken Mac & Cheese", "Main", bbq_mac("lean"), bbq_mac("bulk"), "Owner approved", "Confirm the purchased high-protein macaroni label and record finished yield."),
    DraftMeal("Chocolate-Dipped Cookie Dough Balls", "Dessert", cookie_dough(), None, "Owner approved", "Form three balls and keep total chocolate at 14g per serving."),
    DraftMeal("Chocolate Oreo Mousse", "Dessert", active.mousse(19.5), None, "Owner approved", "Use the taste-approved 19.5g protein-powder build."),
    DraftMeal("Baked Strawberry-Lemon Protein Cheesecake Square", "Dessert", strawberry_lemon_cheesecake_square(), None, "Owner approved", "Record baked pan yield and eight equal finished weights."),
    DraftMeal("PRPD Protein Box", "Add-on", protein_box(), None, "Owner approved", "Use one weighed whole mini apple and record the 12 oz box fit."),
    DraftMeal("Mini Chicken Snack Wrap", "Add-on", mini_chicken_wrap(), None, "Owner approved", "Record wrap weight and day-three texture."),
    DraftMeal("Strawberry Protein Overnight Oats", "Add-on", overnight_oats_12oz(), None, "Owner approved", "Use one fixed 12 oz build and record filled weight and 72-hour texture."),
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
        "# PRPD Batch 6 Menu - Controlled Recipe and Nutrition Estimates",
        "",
        "Generated: August 10, 2026",
        "",
        "## What Is Locked Here",
        "",
        "This document rebuilds the owner-approved Batch 6 menu from controlled ingredient quantities rather than copying historical calorie claims. Public menu publication is controlled separately by config/order-config.js.",
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
        "- The four breakfasts average about 575 calories and 54g protein Lean, and about 770 calories and 74g protein Bulk.",
        "- The eight mains average about 611 calories and 51g protein Lean, and about 782 calories and 68g protein Bulk after included sauces.",
        "- French Toast retains the confirmed three-slice Lean and four-slice Bulk builds, including fruit, whipped cream, and one 30g syrup cup.",
        "- The Beef Bacon Breakfast Sandwich and Loaded Beef Cottage Pie each include one 45g net Sweet Heat cup. Its nutrition and egg allergen are included so the sauce cannot be silently omitted.",
        "- House refrigerator pickles replace purchased mixed pickled vegetables for Hot Honey Chicken Sliders and Beef Seekh Kabab Shawarma.",
        "- Chocolate-Dipped Cookie Dough Balls use three medium balls and 14g total chocolate per serving; Chocolate Oreo Mousse retains the taste-approved 19.5g protein-powder portion; the strawberry dessert is now a crustless baked square.",
        "",
        "## Remaining Physical Production Gates",
        "",
        "1. Record the next complete 45g Sweet Heat batch: exact ingredient weights, finished batch weight, customer/QC cup count, and bowl loss.",
        "2. Confirm the purchased harissa, reduced-fat cream cheese, tortilla, beef-bacon, chocolate-chip, Oreo, and protein-powder package labels before final label printing.",
        "3. Record representative raw and cooked yields for chicken, drained ground beef, beef strips, shrimp, and beef bacon.",
        "4. Record the finished Cookie Dough Ball count/coating weight, Mousse cup weight, refrigerator-pickle drained yield, and eight cheesecake-square weights.",
        "5. Confirm the whole mini apple and complete Protein Box fit and hold safely in the 12 oz box.",
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
