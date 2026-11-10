"""Controlled nutrition estimates for the August 29, 2026 PRPD menu.

This file is intentionally separate from the live-menu calculator. It converts
historical volume language to explicit grams, recalculates every Lean/Bulk build,
and writes one review document. Nothing here publishes to the order page.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import sys
import meal_portion_standards as portions


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))

import calculate_active_menu as active
from shared_recipe_components import garlic_sauce, seekh_seasoning, nouman_kofta


Nutrition = active.Nutrition
Ingredient = active.Ingredient
Build = active.Build
Portion = active.Portion
n = active.n
p = active.p
build = active.build

OUTPUT_PATH = HERE / "NEXT_MENU_NUTRITION_2026-09-26.md"


@dataclass(frozen=True)
class DraftMeal:
    name: str
    category: str
    lean: Build
    bulk: Build | None
    decision: str
    validation: str


def with_cilantro_garnish(record: Build) -> Build:
    """Apply PRPD's controlled savory-meal finish.

    The owner uses fresh cilantro as the standing garnish across the savory
    plated menu. Modeling it here keeps purchasing, nutrition, ingredients,
    labels, prep, and plating synchronized instead of treating garnish as an
    invisible kitchen extra.
    """
    return build(
        [*record.portions, p("cilantro", 2, note="PRPD savory-meal garnish")],
        [*record.assumptions, "Finish each packed savory meal with exactly 2g fresh cilantro."],
        record.confidence,
    )


def with_batch8_purchased_oil(record: Build) -> Build:
    """Use the oil physically purchased for Batch 8 without rewriting history."""
    portions = [
        p("sunflower_oil", portion.amount, portion.unit, portion.note, portion.include_in_menu_macros)
        if portion.ingredient == "avocado_oil" else portion
        for portion in record.portions
    ]
    assumptions = list(record.assumptions)
    if any(portion.ingredient == "sunflower_oil" for portion in portions):
        assumptions.append("Batch 8 uses the purchased Altunsa sunflower oil in every measured cooking-oil allocation.")
    return build(portions, assumptions, record.confidence)


def add_ingredient(key: str, name: str, nutrition: Nutrition, basis: str = "100g", source: str = "USDA FoodData Central or generic packaged-food estimate", confidence: str = "medium", note: str = "", nutrition_complete: bool = True) -> None:
    active.INGREDIENTS[key] = Ingredient(name, nutrition, basis, source, confidence, note, nutrition_complete)


# Supplemental profiles needed only by the next-menu draft. Exact package labels
# should replace medium-confidence packaged-food records before label printing.
add_ingredient("shan_biryani", "Shan Biryani Recipe Mix (standard powder)", n(312.5,12.5,37.5,12.5,12.5,0,25,25,16750,0), source="https://www.shanfoods.com/product/recipe-mixes/rice/biryani/", note="Manufacturer panel per 8g: 25 kcal, 1g protein, 3g carbohydrate, 1g fat, 1340mg sodium. 50g packet. Contains soy. Added sugar not separately reported; conservatively count its reported sugar as added until the purchased panel is verified. Check standard powder, not Bombay/Sindhi or cooking sauce.")
add_ingredient("shan_butter_chicken", "Shan Butter Chicken Recipe Mix (powder)", n(300,10,40,10,10,0,0,0,9000,0), source="https://www.shanfoods.com/product/recipe-mixes/stir-fried/butter-chicken/", note="Manufacturer panel per 10g: 30 kcal, 1g protein, 4g carbohydrate, 1g fat, 900mg sodium. 50g packet. Contains soy. Verify physical packet; recipe uses all measured mix.")
add_ingredient("shan_seekh", "Shan Seekh Kabab Recipe Mix", n(360,12,48,24,12,0,24,24,10200,0), source="https://www.shanfoods.com/product/recipe-mixes/bbq/seekh-kabab/", note="Working conversion: manufacturer lists 6 servings per 50g packet, each 30 kcal, 1g protein, 4g carbs, 2g fiber, 1g fat and 850mg sodium. Serving gram field is absent online; verify purchased panel. Contains soy; check cross-contact warnings. Reported sugar conservatively treated as added. PRPD uses 50g/kg beef without the packet recipe's extra suet or butter.")
add_ingredient("mushroom", "White mushrooms, raw", n(22, 3.09, 3.26, 1.0, 0.34, 0.05, 1.98, 0, 5, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("sourdough_slice", "Sourdough bread", n(100, 4, 20, 1, 1, 0.2, 1, 1, 180, 0), basis="each", note="One working 40g slice; replace with purchased loaf label.")
add_ingredient("sriracha", "Sriracha sauce", n(93, 1.3, 19.2, 0.9, 0.9, 0.1, 15, 10, 2000, 0), note="Generic estimate; sodium and sugar require the current bottle label.")
add_ingredient("lemon", "Bottled lemon juice", active.INGREDIENTS["lemon"].nutrition, source="Owner-confirmed kitchen input; nutrition remains the USDA lemon-juice working profile until the purchased bottle panel is verified.", confidence="medium", note="Use bottled lemon juice for recipe measurements. Buy or cut whole lemons only when a recipe explicitly calls for a served wedge or garnish.")
add_ingredient("mustard", "Prepared Dijon mustard", active.INGREDIENTS["mustard"].nutrition, source="Generic prepared Dijon-mustard working profile", confidence="medium", note="No brand is locked for Batch 16. Confirm the purchased jar panel before final label printing.")
add_ingredient("buffalo_sauce", "Sweet Baby Ray's Mild Buffalo Wing Sauce", n(133.333, 0, 6.667, 0, 13.333, 0, 0, 0, 2733.333, 0), source="https://www.sweetbabyrays.com/sauces/wing-marinade-sauces/mild-buffalo-wing-sauce and current UPC 013409517246 retail panel", confidence="medium", note="Working panel per 15g: 20 calories, 2g fat, 1g carbohydrate, and 410mg sodium. The controlled Batch 16 allergen record declares milk for this retail Mild sauce. Verify the exact physical bottle because online panels conflict; the package label is final authority. Do not substitute the different foodservice Buffalo formulation.")
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
add_ingredient(
    "kings_hawaiian_roll",
    "King's Hawaiian Original Sweet Roll",
    n(90, 3, 15, .5, 2, 1, 5, 5, 75, 15, 0, 0, 15, 1, 44),
    basis="each",
    source="King's Hawaiian SmartLabel, UPC 00073435002307, updated July 24, 2026",
    confidence="high",
    note="One 28g roll. Contains egg, milk, soy, and wheat. Sodium is 75mg per roll.",
)
add_ingredient(
    "corn_street_tortilla",
    "Mission White Corn Street Taco tortilla",
    n(100 / 3, 2 / 3, 19 / 3, 3 / 3, 1 / 3, 0, 2 / 3, 0, 20 / 3, 0, 0, 0, 20 / 3, 0, 80 / 3),
    basis="each",
    source="Mission White Corn Street Taco 24-count package listing, UPC 073731071502",
    confidence="medium",
    note="One 15g tortilla. Three tortillas provide 100 calories and 20mg sodium. Confirm the purchased UPC panel before production.",
)
add_ingredient("hot_sauce", "Sriracha sauce", n(93, 1.3, 19.2, 0.9, 0.9, 0.1, 15, 10, 2000, 0), source="Legacy key mapped to the current approved Sriracha profile", confidence="medium", note="Legacy key retained for older builders. Current sauce identity is Sriracha; confirm the physical package panel before final label printing.")
add_ingredient("sunflower_oil", "Altunsa sunflower oil", n(884, 0, 0, 0, 100, 10.3, 0, 0, 0, 0), source="Generic pure sunflower-oil profile; purchased Altunsa 5 L package", confidence="medium", note="Confirm the physical package is 100% sunflower oil before final label printing.")
add_ingredient("bbq_sauce", "G Hughes sugar-free BBQ sauce", n(33.33, 0, 6.67, 0, 0, 0, 0, 0, 666.67, 0), source="Current G Hughes Original package panel", confidence="high", note="10 calories, 2g carbohydrate, and 200mg sodium per 30g serving.")
add_ingredient("lavash", "Joseph's flax, oat bran and whole-wheat lavash", n(120, 12, 16, 8, 3, 0.5, 1, 0, 440, 0), basis="each", source="Current Joseph's full-lavash package profile", confidence="medium", note="Confirm the purchased package panel before final label printing.")
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
add_ingredient("chicken_mince_cooked", "Pure chicken-breast mince, cooked", n(165, 31.02, 0, 0, 3.57, 1.01, 0, 0, 74, 85), source="USDA FoodData Central comparable cooked chicken breast", confidence="medium", note="Owner confirmed the Batch 8 mince is pure lean chicken-breast meat.")
add_ingredient("carrot", "Carrot, raw", n(41, 0.93, 9.58, 2.8, 0.24, 0.037, 4.74, 0, 69, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("zucchini", "Zucchini, raw", n(17, 1.21, 3.11, 1.0, 0.32, 0.084, 2.5, 0, 8, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("english_muffin", "English muffin", n(130, 5, 25, 1, 1.5, 0.3, 2, 1, 240, 0), basis="each", source="Generic packaged English muffin estimate", confidence="medium", note="Replace with the purchased package label before printing final labels.")
add_ingredient("beef_bacon", "Deen Halal beef breakfast slice", n(100, 4, 0, 0, 9, 3.5, 0, 0, 260, 20), basis="each", source="Deen Halal manufacturer listing and current product databases", confidence="medium", note="One modeled slice is 20g. Confirm the purchased package before final label printing.")
add_ingredient("tilapia_cooked", "Tilapia, cooked", n(128, 26.2, 0, 0, 2.7, 0.9, 0, 0, 56, 57), source="USDA FoodData Central comparable cooked tilapia", confidence="medium")
add_ingredient("mixed_vegetables", "Frozen peas and carrots", n(65, 3, 12, 4, 0.5, 0.1, 4, 0, 45, 0), source="Generic frozen peas-and-carrots blend estimate", confidence="medium")
add_ingredient("canned_peas_carrots", "Peas and carrots, canned, drained", n(58, 2.1, 12.6, 3.3, 0.2, 0.04, 5.4, 1.8, 197, 0), source="Del Monte canned peas and carrots working package profile", confidence="medium", note="Drain before weighing. Confirm the purchased can's Nutrition Facts before final label printing.")
add_ingredient(
    "instant_potato_flakes",
    "Idahoan Original mashed potato flakes",
    n(363.636, 9.091, 77.273, 4.545, 0, 0, 0, 0, 45.455, 0, 0, 0, 45.455, 1.818, 1136.364),
    source="Idahoan Original 26.2 oz package: 80 calories, 2g protein, 17g carbohydrate, 1g fiber, 10mg sodium, 10mg calcium, 0.4mg iron, and 250mg potassium per 22g dry mix",
    confidence="high",
    note="Use Idahoan Original unflavored flakes and the physical package directions. The controlled formula follows the box ratio of 6 cups water, 2.25 tsp salt, 9 tbsp butter, 3 cups cold milk, and one 13.75 oz box for 18 servings.",
)
add_ingredient("water", "Water", n(0, 0, 0, 0, 0, 0, 0, 0, 0, 0), source="Kitchen tap water", confidence="high")
add_ingredient("pink_salmon_raw", "Wild-caught pink salmon, raw", n(115, 20.35, 0, 0, 3.98, 1.33, 0, 0, 150, 49), source="Great Value Wild Caught Pink Salmon working package profile", confidence="medium", note="Skin-on two-pound bag. Confirm the purchased package panel, thawed drained weight, skin loss, pin bones, and cooked yield before final labels.")
add_ingredient("chicken_breast_cooked", "Boneless skinless chicken breast, cooked", n(165, 31.02, 0, 0, 3.57, 1.01, 0, 0, 74, 85), source="USDA FoodData Central comparable roasted chicken breast", confidence="medium", note="Custom pilot uses 225g cooked chicken from 300g raw at a provisional 75% yield; record the actual yield.")
add_ingredient("quinoa_dry", "Quinoa, dry", n(368, 14.1, 64.2, 7.0, 6.1, 0.7, 0, 0, 5, 0), source="USDA FoodData Central generic dry quinoa", confidence="medium")
add_ingredient("green_beans", "Green beans, raw", n(31, 1.83, 6.97, 2.7, 0.22, 0.05, 3.26, 0, 6, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("black_beans", "Black beans, canned, drained", n(91, 6.0, 16.6, 6.9, 0.29, 0.07, 0.3, 0, 238, 0), source="USDA FoodData Central comparable drained canned beans", confidence="medium")
add_ingredient("cannellini_beans", "Cannellini beans, canned, drained", n(96, 6.8, 17.0, 6.3, 0.4, 0.1, 0.5, 0, 210, 0), source="USDA FoodData Central comparable drained canned white kidney beans", confidence="medium", note="Drain and rinse before weighing. Confirm the purchased can's Nutrition Facts before final label printing.")
add_ingredient("parmesan", "Parmesan cheese", n(420, 28.4, 13.9, 0, 27.8, 17.4, 0, 0, 1804, 68), source="USDA FoodData Central generic Parmesan", confidence="medium")
add_ingredient("croutons", "Seasoned croutons", n(407, 11.9, 73.5, 5.1, 7.2, 1.3, 4, 2, 698, 0), source="Generic packaged crouton estimate", confidence="low", note="Replace with purchased package label before final labels.")
add_ingredient("black_pepper", "Ground black pepper", n(251, 10.4, 63.9, 25.3, 3.3, 1.4, 0.6, 0, 20, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("parsley", "Flat-leaf parsley, raw", n(36, 2.97, 6.33, 3.3, 0.79, 0.13, 0.85, 0, 56, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("red_onion", "Red onion, raw", n(40, 1.1, 9.34, 1.7, 0.1, 0.04, 4.24, 0, 4, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("beef_96_raw", "96/4 lean ground beef, raw", n(125, 21.43, 0, 0, 4.02, 1.79, 0, 0, 67, 62), source="Working 96/4 package-equivalent profile", confidence="medium", note="Confirm the purchased 96/4 beef label before final label printing.")
add_ingredient("beef_96_cooked_drained", "96/4 lean ground beef, cooked and thoroughly drained", n(166.67, 28.57, 0, 0, 5.36, 2.39, 0, 0, 89, 83), source="96/4 package-equivalent profile converted at a conservative 75% cooked yield", confidence="medium", note="Owner confirmed 96/4 beef and thorough draining; this profile does not claim an additional calorie reduction from discarded fat.")
add_ingredient("part_skim_ricotta", "Part-skim ricotta cheese", n(129.03, 8.06, 8.06, 0, 6.45, 4.84, 6.45, 0, 153.23, 48.39), source="Frigo-style part-skim ricotta package profile", confidence="medium", note="Modeled from 80 calories, 5g protein, 5g carbohydrate, and 4g fat per 62g. Confirm the purchased tub.")
add_ingredient("part_skim_mozzarella", "Part-skim mozzarella cheese", n(321.43, 25, 3.57, 0, 21.43, 12.5, 1.79, 0, 714.29, 53.57), source="Generic packaged part-skim mozzarella profile", confidence="medium", note="Modeled from 90 calories and 7g protein per 28g. Confirm the purchased package.")
add_ingredient("marinara", "Marinara sauce", n(56, 1.6, 8, 1.6, 2, 0.4, 4, 0, 336, 0), source="Generic lower-sugar marinara package profile", confidence="medium", note="Modeled from 70 calories per 125g. Confirm the purchased jar.")
add_ingredient("italian_seasoning", "Italian seasoning", n(265, 9, 69, 42, 4.3, 1.6, 4.1, 0, 25, 0), source="Generic dried-herb blend estimate", confidence="medium", note="Use the current salt-free Italian seasoning blend.")
add_ingredient("lasagna_sheet", "Oven-ready lasagna sheet", n(60, 2.2, 12.6, 1, .3, .05, .5, 0, 20, 0), basis="each", source="Barilla-style oven-ready lasagna package profile", confidence="medium", note="One modeled sheet is approximately 17g. Confirm the purchased box.")
add_ingredient("hummus", "Prepared hummus", n(166, 7.9, 14.3, 6, 9.6, 1.4, .3, 0, 379, 0), source="USDA FoodData Central comparable prepared hummus", confidence="medium")
add_ingredient("feta", "Feta cheese", n(264, 14.2, 4.1, 0, 21.3, 14.9, 4.1, 0, 1116, 89), source="USDA FoodData Central", confidence="medium")
add_ingredient("olives", "Black olives, drained", n(116, .8, 6, 1.6, 10.9, 2.3, 0, 0, 735, 0), source="USDA FoodData Central comparable canned olives", confidence="medium")
add_ingredient("enchilada_sauce", "Red enchilada sauce", n(30.77, .77, 6.15, 1.54, 0, 0, 2.3, 0, 385, 0), source="Generic packaged red enchilada sauce profile", confidence="medium", note="Modeled from 40 calories per 130g. Confirm the purchased can or jar.")
add_ingredient("apple_cider_vinegar", "Apple cider vinegar", n(21, 0, .93, 0, 0, 0, .4, 0, 5, 0), source="USDA FoodData Central comparable cider vinegar", confidence="medium")
add_ingredient("bok_choy", "Bok choy, raw", n(13, 1.5, 2.18, 1.0, .2, .03, 1.18, 0, 65, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("red_bell_pepper", "Red bell pepper, raw", n(31, 1.0, 6.03, 2.1, .3, .03, 4.2, 0, 4, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("basil", "Fresh basil", n(23, 3.15, 2.65, 1.6, .64, .04, .3, 0, 4, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("rice_vinegar", "Rice vinegar", n(18, 0, .04, 0, 0, 0, .04, 0, 2, 0), source="USDA FoodData Central comparable unseasoned rice vinegar", confidence="medium", note="Use unseasoned rice vinegar so added sugar and sodium are not hidden.")
add_ingredient("balsamic_vinegar", "Balsamic vinegar", n(88, .49, 17.03, 0, 0, 0, 14.95, 0, 23, 0), source="USDA FoodData Central", confidence="medium")
add_ingredient("hoisin", "Hoisin sauce", n(220, 3.3, 44, 2.7, 3.3, .5, 27, 24, 2580, 0), source="Generic packaged hoisin working profile", confidence="medium", note="Confirm the purchased halal ingredient panel. Contains soy and wheat; sesame varies by brand.")
add_ingredient("olive_oil", "Olive oil", n(884, 0, 0, 0, 100, 14, 0, 0, 0, 0), source="USDA FoodData Central", confidence="high")
add_ingredient("white_pepper", "Ground white pepper", n(296, 10.4, 68.6, 26.2, 2.1, .63, .6, 0, 5, 0), source="USDA FoodData Central", confidence="high")
add_ingredient(
    "kroger_protein_pasta",
    "Kroger protein pasta",
    active.INGREDIENTS["protein_pasta"].nutrition,
    basis=active.INGREDIENTS["protein_pasta"].basis,
    source=active.INGREDIENTS["protein_pasta"].source,
    confidence=active.INGREDIENTS["protein_pasta"].confidence,
    note="Current Meatball Arrabbiata purchasing and nutrition identity. Kept separate from the historical generic pasta key and Caprese Barilla Protein+ Rotini.",
)
add_ingredient(
    "barilla_protein_plus_rotini",
    "Barilla Protein+ Rotini",
    n(190, 10, 39, 4, 1, 0, 2, 0, 0, 0),
    basis="manufacturer label serving; serving grams not exposed by the primary data page",
    source="Barilla Protein+ Rotini GTIN 00076808533583; https://www.barilla.com/en-us/products/pasta/protein-plus/proteinplus-rotini and official panel https://www.connect.syncpdi.com/sync_pdi/servlet/ItemDynSpec?GTIN=00076808533583&ID=barillaretail&InstanceID=9c6e678cdec83538c880e1b567dd3ac9",
    confidence="blocked",
    note="The primary panel reports 190 calories, 10g protein, 39g carbohydrate, 4g fiber, 1g fat, 2g sugar, 0mg sodium, and 0mg cholesterol per serving, but does not state the serving mass. Capture the physical package panel before scaling nutrition to the recipe's 66g dry portion.",
    nutrition_complete=False,
)
active.INGREDIENTS["whey_vanilla"] = Ingredient(
    "Premier Protein powder, vanilla",
    active.INGREDIENTS["whey"].nutrition,
    active.INGREDIENTS["whey"].basis,
    active.INGREDIENTS["whey"].source,
    active.INGREDIENTS["whey"].confidence,
    active.INGREDIENTS["whey"].note,
)
active.INGREDIENTS["whey_chocolate"] = Ingredient(
    "Premier Protein powder, chocolate",
    active.INGREDIENTS["whey"].nutrition,
    active.INGREDIENTS["whey"].basis,
    active.INGREDIENTS["whey"].source,
    active.INGREDIENTS["whey"].confidence,
    active.INGREDIENTS["whey"].note,
)


def chicken_thigh(raw_g: float) -> Portion:
    return active.chicken_thigh(raw_g)


# This is deliberately a separate ingredient identity from the older generic
# 75% chicken-thigh model. It lets direct component meals use the measured
# October 7 yield without changing tacos, wraps, pasta, casseroles, or other
# format-specific recipes that have not been validated by the same test.
add_ingredient(
    "chicken_thigh_standard_cooked",
    "Chicken thigh, meat only, roasted",
    active.INGREDIENTS["chicken_thigh_cooked"].nutrition,
    source=active.INGREDIENTS["chicken_thigh_cooked"].source,
    confidence="medium",
    note="Owner-controlled direct component portion. October 7 calibration: 430g cooked before sauce from 625g raw (68.8% one-run yield).",
)


def standard_chicken_component(tier: str) -> Portion:
    cooked_g = portions.tier_value(portions.CHICKEN_COOKED_G, tier)
    return p(
        "chicken_thigh_standard_cooked",
        cooked_g,
        note=(
            f"Owner standard: {cooked_g:g}g cooked before sauce; raw pull uses "
            f"the measured {portions.CHICKEN_MEASURED_YIELD:.1%} yield"
        ),
    )


def standard_chicken_raw_pull(tier: str) -> float:
    """Raw pull behind the cooked control, for proportional seasoning only."""
    return portions.chicken_raw_pull_g(tier)


def standard_rice(tier: str, *, note: str = "") -> Portion:
    dry_g = portions.tier_value(portions.RICE_DRY_G, tier)
    control = "owner standard; targets 120g/160g cooked pending measured rice yield"
    return p("rice_dry", dry_g, note="; ".join(x for x in (note, control) if x))


def standard_ground_beef_component(tier: str) -> Portion:
    raw_g = portions.tier_value(portions.GROUND_BEEF_90_RAW_G, tier)
    return beef_pan(raw_g)


def component_standard_assumptions(tier: str, protein: str) -> list[str]:
    assumptions = [
        f"Owner-approved component standard: {portions.STARCH_COOKED_G[tier]:g}g cooked starch and {portions.VEGETABLE_G[tier]:g}g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
    ]
    if protein == "chicken":
        assumptions.insert(0, f"Plate exactly {portions.CHICKEN_COOKED_G[tier]:g}g cooked boneless skinless chicken thigh before sauce.")
    elif protein == "beef":
        assumptions.insert(0, f"Use exactly {portions.GROUND_BEEF_90_RAW_G[tier]:g}g raw 90/10 beef; working finished seasoned-component target is {portions.GROUND_BEEF_FINISHED_COMPONENT_G[tier]:g}g pending measured 90/10 yield.")
    return assumptions


# Owner-standard savory base for compatible boneless skinless thighs. These
# measured rates come from the retained PRPD neutral-base record, with the
# garlic rate corrected to the 6.75 g/kg Batch 4 production control.
NEUTRAL_CHICKEN_BASE_PER_KG = {
    "salt": 8.0,
    "garlic_powder": 6.75,
    "onion_powder": 4.0,
    "paprika": 3.0,
    "black_pepper": 2.0,
}


def neutral_chicken_base(raw_g: float) -> list[Portion]:
    return [
        p(key, grams_per_kg * raw_g / 1000, note="component:shared-chicken-base")
        for key, grams_per_kg in NEUTRAL_CHICKEN_BASE_PER_KG.items()
    ]


def moderate_salt_savory_chicken_base(raw_g: float) -> list[Portion]:
    """A 5 g/kg salt base for dishes without a strongly salty finish."""
    rates = {**NEUTRAL_CHICKEN_BASE_PER_KG, "salt": 5.0}
    return [
        p(key, grams_per_kg * raw_g / 1000, note="component:shared-chicken-base")
        for key, grams_per_kg in rates.items()
    ]


def low_salt_savory_chicken_base(raw_g: float) -> list[Portion]:
    """Shared aromatic thigh base for recipes with salty finishing components.

    BBQ Mac keeps its controlled 2.5 g salt per kg raw-chicken rate because the
    macaroni mix, mozzarella and two BBQ allocations already contribute sodium.
    The other compatible recipes receive their remaining salt after the shared
    pull is divided.
    """
    rates = {**NEUTRAL_CHICKEN_BASE_PER_KG, "salt": 2.5}
    return [
        p(key, grams_per_kg * raw_g / 1000, note="component:shared-chicken-base")
        for key, grams_per_kg in rates.items()
    ]


def salt_free_savory_chicken_base(raw_g: float) -> list[Portion]:
    """Shared aromatic thigh base for recipes whose packaged finish supplies salt."""
    return [
        p(key, grams_per_kg * raw_g / 1000, note="component:shared-chicken-base")
        for key, grams_per_kg in NEUTRAL_CHICKEN_BASE_PER_KG.items()
        if key != "salt"
    ]


def cilantro_garlic_lime_rice(dry_rice_g: float) -> list[Portion]:
    """One batch-wide rice finish scaled from a 45 g dry-rice serving."""
    scale = dry_rice_g / 45
    return [
        p("rice_dry", dry_rice_g, note="component:shared-cilantro-garlic-lime-rice"),
        p("cilantro", 2 * scale, note="component:shared-cilantro-garlic-lime-rice"),
        p("garlic", 1 * scale, note="component:shared-cilantro-garlic-lime-rice"),
        p("lime", 5 * scale, note="component:shared-cilantro-garlic-lime-rice"),
    ]


def white_garlic_jalapeno_sauce(grams: float, *, include_in_menu_macros: bool = False) -> list[Portion]:
    """Scale the owner-approved 28:5:3:1 yogurt:lime:jalapeno:garlic sauce."""
    source_g = 37
    return [
        p("fage", grams * 28 / source_g, note="component:white-garlic-jalapeno-sauce", include_in_menu_macros=include_in_menu_macros),
        p("lime", grams * 5 / source_g, note="component:white-garlic-jalapeno-sauce", include_in_menu_macros=include_in_menu_macros),
        p("jalapeno", grams * 3 / source_g, note="component:white-garlic-jalapeno-sauce", include_in_menu_macros=include_in_menu_macros),
        p("garlic", grams * 1 / source_g, note="component:white-garlic-jalapeno-sauce", include_in_menu_macros=include_in_menu_macros),
    ]


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
    honey, and 170g hot sauce at the working midpoint. The current owner-approved
    hot-sauce identity is Sriracha. The ratio is encoded
    here so nutrition, allergens, production, grocery, and labels cannot omit
    the cup while the next run confirms its tare and finished yield.
    """
    batch_g = 1020
    return [
        p("light_mayo", 45 * 250 / batch_g, note="45g Sweet Heat cup", include_in_menu_macros=False),
        p("ketchup", 45 * 300 / batch_g, note="45g Sweet Heat cup", include_in_menu_macros=False),
        p("honey", 45 * 300 / batch_g, note="45g Sweet Heat cup", include_in_menu_macros=False),
        p("sriracha", 45 * 170 / batch_g, note="45g Sweet Heat cup", include_in_menu_macros=False),
    ]


def sweet_heat_incorporated(grams: float) -> list[Portion]:
    """Current 225g PRPD Sweet Heat ratio used inside a finished dish."""
    return [
        p("light_mayo", grams * 55 / 225, note="component:batch13-sweet-heat"),
        p("ketchup", grams * 66 / 225, note="component:batch13-sweet-heat"),
        p("honey", grams * 66 / 225, note="component:batch13-sweet-heat"),
        p("sriracha", grams * 38 / 225, note="component:batch13-sweet-heat"),
    ]


def garlic_herb_yogurt(grams: float, include_in_menu_macros: bool = True) -> list[Portion]:
    """Owner-locked 225g Garlic Herb Yogurt formula, scaled by finished grams."""
    formula = {
        "fage": 165,
        "light_mayo": 25,
        "lemon": 10,
        "cilantro": 10,
        "jalapeno": 6,
        "garlic": 3,
        "parsley": 3,
        "salt": 2.25,
        "cumin": 1.05,
    }
    total = sum(formula.values())
    return [
        p(key, grams * value / total, note="component:garlic-herb-yogurt", include_in_menu_macros=include_in_menu_macros)
        for key, value in formula.items()
    ]


def jalapeno_lime_yogurt_45g() -> list[Portion]:
    """One 45g cup using the Batch 7 Southwest bowl's controlled sauce ratio."""
    return white_garlic_jalapeno_sauce(45)


def prpd_mustard_bbq_40g() -> list[Portion]:
    """One 40g house mustard-BBQ cup using the owner-approved 28:10:2 ratio."""
    return [
        p("bbq_sauce", 28, note="40g PRPD Mustard BBQ Sauce cup", include_in_menu_macros=False),
        p("mustard", 10, note="40g PRPD Mustard BBQ Sauce cup", include_in_menu_macros=False),
        p("apple_cider_vinegar", 2, note="40g PRPD Mustard BBQ Sauce cup", include_in_menu_macros=False),
    ]


def instant_mash(prepared_g: float) -> list[Portion]:
    """Idahoan Original mash scaled from the manufacturer's package ratio."""
    # One 13.75 oz / 389 g box: 6 cups water, 2.25 tsp salt,
    # 9 tbsp butter and 3 cups cold milk. Gram conversions use 236.588 g
    # water per cup, 1.03 g/mL milk, 14 g butter per tablespoon and
    # 6 g salt per teaspoon. The finished target controls portioning.
    flakes = 389.0
    water = 1419.5
    milk = 731.1
    butter = 126.0
    salt = 13.5
    formula_total = flakes + water + milk + butter + salt
    return [
        p("instant_potato_flakes", prepared_g * flakes / formula_total, note=f"{prepared_g:g}g prepared Idahoan Original mash allocation"),
        p("water", prepared_g * water / formula_total, note="Idahoan Original package preparation"),
        p("fairlife_milk", prepared_g * milk / formula_total, note="Idahoan Original package preparation"),
        p("butter", prepared_g * butter / formula_total, note="Idahoan Original package preparation"),
        p("salt", prepared_g * salt / formula_total, note="Idahoan Original package preparation"),
    ]


SWEET_HEAT_ASSUMPTION = (
    "Includes one 45g net PRPD Sweet Heat cup using the Batch 5 "
    "250:300:300:170 light-mayo:ketchup:honey:Sriracha-sauce ratio. Tare the cup and "
    "lid and record the exact next-run yield before promoting this to final."
)

JALAPENO_LIME_ASSUMPTION = (
    "Includes one 45g net Creamy Jalapeno-Lime Yogurt Sauce cup using the same "
    "28:5:3:1 yogurt:lime:jalapeno:garlic ratio as the Southwest Beef Taco Bowl."
)

PRPD_MUSTARD_BBQ_ASSUMPTION = (
    "Includes one separate 40g house PRPD Mustard BBQ cup made from 28g sugar-free "
    "barbecue sauce, 10g yellow mustard, and 2g apple cider vinegar."
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
        standard_ground_beef_component(tier), p("potato", 100),
        p("egg", 1 if lean else 2, "each"), p("mozzarella", 28), p("red_onion", 25),
        p("garlic", 6), p("avocado_oil", 3 if lean else 4),
        p("salt", 0.75 if lean else 1),
        *prpd_mustard_bbq_40g(),
    ], [
        "All rendered beef fat is drained.",
        *component_standard_assumptions(tier, "beef"),
        "Breakfast-skillet potato is a translated starch and keeps its recipe-specific input until its cooked yield is measured.",
        "Salsa is not plated on the skillet.",
        PRPD_MUSTARD_BBQ_ASSUMPTION,
    ], "medium")


def power_bowl(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        standard_chicken_component(tier), p("potato", 100),
        p("egg", 2, "each"),
        p("avocado_oil", 2 if lean else 3), p("salt", 0.75 if lean else 1),
        *sweet_heat_45g(),
    ], [*component_standard_assumptions(tier, "chicken"), "Power Bowl potato is a translated starch and keeps its recipe-specific input until its cooked yield is measured.", "Oil spray and salt are controlled rather than left uncounted.", "One 45g PRPD Sweet Heat Sauce cup is packed separately.", SWEET_HEAT_ASSUMPTION], "medium")


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
        p("whey_vanilla", 9.75 if lean else 14.625),
        p("egg", 1, "each"),
        p("egg_white", 80 if lean else 120),
        p("fage", 100 if lean else 120),
        p("fairlife_milk", 60 if lean else 75),
        p("blueberry", 80 if lean else 100),
        p("reduced_cream_cheese", 20 if lean else 25),
        p("powdered_sugar", 4),
        p("maple_syrup", 30, note="separate syrup cup", include_in_menu_macros=False),
        p("vanilla", 2 if lean else 2.5),
        p("cinnamon", 0.5 if lean else 0.75),
        p("avocado_oil", 2 if lean else 3),
        p("salt", 0.5 if lean else 0.75),
    ], [
        "Lean targets three medium pancakes; Bulk targets four.",
        "The FAGE total is split between batter and cheesecake topping; reduced-fat cream cheese replaces the retired Philadelphia no-bake filling gram-for-gram.",
        "Blueberry compote and cheesecake topping share one side cup; sugar-free syrup uses a second cup.",
        "This is a first-test build. Record finished pancake count, batter yield, topping yield, taste, and day-three reheat quality.",
    ], "medium")


def strawberry_cheesecake_pancakes(tier: str) -> Build:
    recipe = blueberry_cheesecake_pancakes(tier)
    return build(
        [p("strawberry", portion.amount, portion.unit, portion.note) if portion.ingredient == "blueberry" else portion for portion in recipe.portions],
        [
            assumption.replace("Blueberry compote", "Strawberry compote")
            for assumption in recipe.assumptions
        ] + ["Strawberries replace blueberries gram-for-gram in the compote."],
        "medium",
    )


def breakfast_sandwich(tier: str) -> Build:
    lean = tier == "lean"
    sandwiches = 1 if lean else 2
    return build([
        p("english_muffin", sandwiches, "each"),
        p("beef_bacon", sandwiches, "each"),
        p("egg", sandwiches, "each"),
        p("egg_white", 75 * sandwiches),
        p("mozzarella", 28 * sandwiches),
        *([p("potato", 150)] if lean else []),
        p("avocado_oil", 2 if lean else 1.5),
        p("salt", .5 if lean else .75),
        *sweet_heat_45g(),
    ], [
        "Lean receives one sandwich and 150g breakfast potatoes; Bulk receives two complete sandwiches and no potatoes.",
        "Each physical sandwich uses one whole egg, 75g liquid egg whites, and 28g fat-free mozzarella. Cottage cheese is not used in this egg patty.",
        "One 45g PRPD Sweet Heat Sauce cup is packed separately.",
        SWEET_HEAT_ASSUMPTION,
        "Beef-bacon and English-muffin package labels must be confirmed before final label printing.",
    ], "medium")


def breakfast_burrito(tier: str) -> Build:
    """Controlled broth-free version of the historical breakfast burrito."""
    lean = tier == "lean"
    return build([
        beef_pan(120 if lean else 180),
        p("small_tortilla", 2 if lean else 3, "each"),
        p("egg", 1, "each"), p("egg_white", 25),
        p("mozzarella", 20 if lean else 28), p("tomato_paste", 16),
        p("onion", 25),
    ], [
        "Broth is intentionally removed from the PRPD recipe system.",
        "The egg component uses the shared breakfast base of one whole egg plus 25g liquid egg whites per order.",
        "Cook the beef-and-onion filling down until dry enough to wrap cleanly; dry-pan grill after assembly.",
        "October 19 second-pass sodium correction: add no salt to the filling and use 20g Lean / 28g Bulk mozzarella because the tortillas and cheese already provide seasoning.",
        "October 21 owner-approved tortilla format: Lean uses two medium tortillas and Bulk uses three medium tortillas. Large tortillas are no longer used for this meal.",
    ], "medium")


def cottage_pie(tier: str) -> Build:
    lean = tier == "lean"
    raw_beef = 170 if lean else 220
    return build([
        beef_pan(raw_beef),
        *instant_mash(220 if lean else 240),
        p("mozzarella", 28 if lean else 35),
        p("canned_peas_carrots", 80 if lean else 100),
        p("onion", 40 if lean else 50),
        p("tomato_paste", 20 if lean else 26),
        p("avocado_oil", 2 if lean else 3),
        p("black_pepper", .5 if lean else .75),
        p("salt", .75 if lean else 1),
        *jalapeno_lime_yogurt_45g(),
    ], [
        "Drain and weigh canned peas and carrots before adding them to the browned beef with onion and tomato paste; cook off excess liquid. No broth is used.",
        "Betty Crocker unflavored instant mashed potatoes are prepared to the package ratio without cottage cheese and portioned as the meal base.",
        "The measured beef-and-vegetable filling is plated over the mash, followed by mozzarella. This meal is assembled by portion weight and is not baked as a casserole.",
        "Record the separate finished filling and mash yields plus every plated serving weight during production.",
        "Pack one separate 45g Creamy Jalapeno-Lime Yogurt Sauce cup. The cup is excluded from displayed menu macros.",
    ], "medium")


def tilapia(raw_g: float) -> Portion:
    return p("tilapia_cooked", raw_g * .80, note=f"{raw_g:g}g raw at 80% cooked yield")


def lemon_pepper_tilapia(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        tilapia(220 if lean else 300),
        p("potato", 250 if lean else 320),
        p("broccoli", 100 if lean else 130),
        p("garlic", 5 if lean else 6),
        p("lemon", 10 if lean else 12),
        p("black_pepper", 1.5 if lean else 2),
        p("avocado_oil", 5 if lean else 7),
        p("salt", .75 if lean else 1),
        *prpd_mustard_bbq_40g(),
    ], [
        "Tilapia is seasoned with a measured 10g Lean/12g Bulk lemon allocation and cracked black pepper; garlic is assigned to the roasted potatoes. It is not marketed as blackened.",
        "Tilapia uses a provisional 80% cooked yield; record the first raw and cooked batch weights.",
        "One separate 40g house PRPD Mustard BBQ Sauce cup replaces the retired PRPD white-sauce cup.",
        "Garlic potatoes use 5g Lean/6g Bulk garlic plus their controlled oil and salt allocations.",
        PRPD_MUSTARD_BBQ_ASSUMPTION,
    ], "medium")


# Compatibility alias for archived references only. New customer copy must use
# Future rotation: Lemon Pepper Tilapia rather than claiming a blackened method.


def sweet_chili_chicken(tier: str) -> Build:
    lean = tier == "lean"
    raw_chicken = standard_chicken_raw_pull(tier)
    return build([
        standard_chicken_component(tier), *neutral_chicken_base(raw_chicken),
        standard_rice(tier),
        p("mixed_vegetables", portions.VEGETABLE_G[tier]),
        p("sweet_chili", 30 if lean else 40, note="component:sweet-chili-incorporated"),
        p("soy_sauce", 8 if lean else 10, note="component:sweet-chili-incorporated"),
        p("garlic", 4 if lean else 5, note="component:sweet-chili-incorporated"),
        p("avocado_oil", 2 if lean else 3),
        p("sweet_chili", 30, note="component:sweet-chili-side-cup", include_in_menu_macros=False),
    ], [
        *component_standard_assumptions(tier, "chicken"),
        "Chicken uses the compatible neutral savory base and receives sweet-chili sauce only after cooking.",
        "Rice and measured peas and carrots remain separately weighable components even when they share a cook wave.",
        "Pack one separate 30g matching G Hughes Sweet Chili sauce cup with every meal. This is recipe-required service, not an interchangeable weekly sauce.",
    ], "medium")


def sweet_chili_chicken_plain_rice(tier: str) -> Build:
    """Batch 15 Sweet Chili build with the approved plain-rice identity.

    Keep the historical vegetable-rice function above intact for archived
    batches. This version uses the October 7 direct-component chicken and rice
    controls without silently carrying the former peas-and-carrots component
    into the current meal.
    """
    lean = tier == "lean"
    raw_chicken = standard_chicken_raw_pull(tier)
    cooked_chicken_g = portions.tier_value(portions.CHICKEN_COOKED_G, tier)
    cooked_rice_target_g = portions.tier_value(portions.STARCH_COOKED_G, tier)
    dry_rice_g = portions.tier_value(portions.RICE_DRY_G, tier)
    return build([
        standard_chicken_component(tier), *neutral_chicken_base(raw_chicken),
        standard_rice(tier),
        p("sweet_chili", 30 if lean else 40, note="component:sweet-chili-incorporated"),
        p("soy_sauce", 8 if lean else 10, note="component:sweet-chili-incorporated"),
        p("garlic", 4 if lean else 5, note="component:sweet-chili-incorporated"),
        p("avocado_oil", 2 if lean else 3),
        p("sweet_chili", 30, note="component:sweet-chili-side-cup", include_in_menu_macros=False),
    ], [
        f"Plate exactly {cooked_chicken_g:g}g cooked boneless skinless chicken thigh before adding the measured glaze.",
        f"Use exactly {dry_rice_g:g}g dry basmati for the current {cooked_rice_target_g:g}g cooked-rice target; record the actual cooked batch yield before pack-out.",
        "Chicken uses the compatible neutral savory base and receives the sweet-chili glaze only after cooking.",
        "Pack one separate 30g matching G Hughes Sweet Chili sauce cup with every meal. This is recipe-required service, not an interchangeable weekly sauce.",
        "This is the plain-rice identity. Do not add the historical peas-and-carrots or substitute vegetable rice.",
        "The October 7 chicken yield is one measured run. Continue recording compatible raw and cooked thigh weights before replacing it with a rolling yield.",
    ], "medium")


def protein_box() -> Build:
    return build([
        p("egg", 2, "each"),
        p("beef_bacon", 1, "each"),
        p("mozzarella", 28),
        p("apple", 70),
        p("cucumber", 60),
        *prpd_mustard_bbq_40g(),
    ], [
        "One add-on box contains two hard-boiled eggs, one 20g beef-breakfast slice, 28g mozzarella, one approximately 70g whole mini apple, 60g cucumber, and one 40g house PRPD Mustard BBQ cup.",
        "The former one-off jalapeno-yogurt dip is removed so the box uses the same controlled mustard-BBQ sauce as the Breakfast Skillet.",
        "Use a divided snack container and keep the sauce in its own sealed well or cup.",
    ], "medium")


def mini_chicken_wrap() -> Build:
    raw_chicken = 130
    return build([
        chicken_thigh(raw_chicken), *neutral_chicken_base(raw_chicken),
        p("small_tortilla", 1, "each"),
        p("mozzarella", 20),
        p("lettuce", 25),
        p("onion", 12),
        p("tomato", 10),
        p("cucumber", 10),
        *garlic_sauce(sys.modules[__name__], 25, green=True),
        p("avocado_oil", .3),
    ], [
        "One add-on order uses one owner-standard 70-calorie Mission Carb Balance medium tortilla, 130g raw chicken thigh, fresh chopped salad, cheese, and 25g house sauce.",
        "Purchased pickled vegetables are removed; lettuce, onion, tomato, and cucumber form the fresh salad mix.",
        "Use the compatible neutral chicken base and cool the chicken before wrapping.",
    ], "medium")


def chicken_tikka_snack_wrap() -> Build:
    """Batch 12 pilot: one medium wrap with cooked tikka thigh and shared white sauce.

    The raw-chicken marinade and ready-to-eat white sauce are deliberately
    separate components. Both stay in customer nutrition because the white
    sauce is incorporated inside the wraps rather than served on the side.
    """
    return build([
        chicken_thigh(130),
        p("small_tortilla", 1, "each"),
        p("fage", 20, note="component:tikka-marinade"),
        p("lemon", 5, note="component:tikka-marinade"),
        p("garlic", 2, note="component:tikka-marinade"),
        p("paprika", .6, note="component:tikka-marinade"),
        p("cumin", .2, note="component:tikka-marinade"),
        p("coriander", .3, note="component:tikka-marinade"),
        p("chili_powder", .15, note="component:tikka-marinade"),
        p("avocado_oil", .5, note="component:tikka-marinade"),
        *white_garlic_jalapeno_sauce(25, include_in_menu_macros=True),
        p("lettuce", 25),
        p("red_onion", 12),
        p("cucumber", 15),
        p("tomato", 10),
    ], [
        "One Grab & Go order is one 70-calorie Mission Carb Balance medium soft-taco tortilla filled with the cooked chicken, vegetables, and shared white garlic-jalapeno sauce.",
        "Marinate 130g boneless skinless chicken thigh only in the ingredients marked tikka-marinade. Cook chicken to 165 F; cool promptly before wrapping.",
        "Use 25g of the batch-wide white garlic-jalapeno yogurt sauce inside each wrap. Never reuse raw-chicken marinade as the chilled finish.",
        "No rice, cheese, cashews, mayonnaise, or side sauce cup is included.",
        "October 19 second-pass sodium correction: add no salt to the tikka marinade because the tortilla and chicken provide the remaining sodium.",
    ], "medium")


def streetcorn_updated(tier: str) -> Build:
    recipe = active.streetcorn(tier)
    raw_chicken = standard_chicken_raw_pull(tier)
    replacements = {
        "chicken_thigh_cooked": standard_chicken_component(tier),
        "rice_dry": standard_rice(tier),
        "avocado_oil": p(
            "avocado_oil",
            2 if tier == "lean" else 3,
            note="component:chicken-cooking",
        ),
    }
    return build(
        [replacements.get(portion.ingredient, portion) for portion in recipe.portions if portion.ingredient != "salt"]
        + neutral_chicken_base(raw_chicken)
        + [p("green_bell_pepper", 30 if tier == "lean" else 40)],
        [*recipe.assumptions, *component_standard_assumptions(tier, "chicken"), "The named street-corn vegetables exceed the baseline vegetable minimum and retain their recipe-specific quantities.", "Green bell pepper is included in the controlled street-corn component.", "The measured avocado oil is for cooking the chicken only. Dry-char the corn; do not add oil to the corn or finished bowl."],
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
    raw_chicken = 100 if lean else 133
    return build([
        chicken_thigh(raw_chicken), *moderate_salt_savory_chicken_base(raw_chicken), p("kings_hawaiian_roll", 3 if lean else 4, "each"),
        p("mozzarella", 28), *sweet_heat_incorporated(30 if lean else 40),
        p("onion", 15 if lean else 20),
        p("pickles", 15 if lean else 20, note="one drained pickle chip per slider; plan 5g per chip and record the actual drained weight"),
        p("avocado_oil", 1 if lean else 1.5),
    ], [
        "Lean is three sliders; Bulk is four.",
        "Each slider targets approximately 25g cooked chicken, modeled from raw chicken thighs at a 75% cooked yield and corrected from Batch 6 overproduction.",
        "Uses King's Hawaiian Original Sweet Rolls, the current PRPD Sweet Heat ratio, onion, and one drained pickle chip per slider. There is no separate hot-sauce cup.",
        "Season the slider chicken at the moderate 5g salt per kg raw-chicken rate after the compatible aromatic base is divided.",
    ], "high")


def harissa_honey_chicken(tier: str) -> Build:
    lean = tier == "lean"
    raw_chicken = standard_chicken_raw_pull(tier)
    scale = raw_chicken / 1000
    return build([
        standard_chicken_component(tier), standard_rice(tier),
        p("broccoli", 100 if lean else 130),
        p("harissa", 60 * scale), p("honey", 40 * scale),
        p("tomato_paste", 30 * scale), p("lemon", 30 * scale),
        p("garlic", 15 * scale), p("avocado_oil", 20 * scale),
        p("paprika", 3 * scale), p("coriander", 3 * scale), p("salt", 8 * scale),
    ], [
        *component_standard_assumptions(tier, "chicken"),
        "The named broccoli side exceeds the baseline vegetable minimum and retains its recipe-specific quantity.",
        "Chicken uses the shared neutral savory base, then receives the exact measured harissa-honey finish.",
        "Glaze is incorporated; there is no duplicate sauce cup.",
        "Harissa package data and the first finished glaze/chicken yield must be recorded before label printing.",
    ], "medium")


def biryani(tier: str) -> Build:
    lean = tier == "lean"
    raw = 200 if lean else 300
    return build([
        chicken_thigh(raw), p("rice_dry", 40), p("fage", 30),
        p("onion", 50), p("tomato", 50), p("garlic", 8), p("ginger", 5),
        p("lemon", 15), p("avocado_oil", 2 if lean else 3),
        p("shan_biryani", raw * .05),
        *garlic_sauce(sys.modules[__name__], 30, green=True, include_in_menu_macros=False),
    ], [
        "Owner confirmed Shan standard Biryani powder. Manufacturer reference: one 50g packet per 1kg meat. PRPD adapts that dose to boneless thighs and its existing lower-rice portions, not the full packet recipe.",
        "Weigh 10g mix for Lean / 15g Bulk. No separate added salt; the mix already contains salt. Check the actual purchased packet variant and nutrition panel.",
        "All 30g yogurt per meal and all masala enter the cooking pot and nutrition calculation. Do not scrape off or assume an unmeasured 75% marinade loss.",
        "The discontinued cucumber salad is excluded from production and nutrition.",
        "Serve 30g green jalapeno garlic sauce with mayonnaise cold, separately from the cooked marinade. Its full nutrition is included.",
    ], "medium")


def bbq_mac(tier: str) -> Build:
    lean = tier == "lean"
    raw_chicken = 180 if lean else 250
    return build([
        chicken_thigh(raw_chicken), *salt_free_savory_chicken_base(raw_chicken), p("protein_mac", 50 if lean else 60),
        p("bbq_sauce", 20, note="component:bbq-incorporated"),
        p("apple_cider_vinegar", 5, note="component:bbq-incorporated"),
        p("water", 5, note="component:bbq-incorporated"),
        p("bbq_sauce", 30, note="component:bbq-side-cup", include_in_menu_macros=False),
        p("mozzarella", 28),
    ], ["Use one 30g incorporated finish made from 20g barbecue sauce, 5g apple-cider vinegar, and 5g water.", "Pack one separate 30g matching G Hughes BBQ sauce cup with every meal. This is recipe-required service, not an interchangeable weekly sauce.", "Chicken uses the salt-free aromatic thigh base because Muscle Mac, mozzarella and barbecue sauce provide the seasoning.", "October 22 owner correction: allocate 180g raw chicken to Lean and 250g raw chicken to Bulk.", "Dry Muscle Mac is corrected to 50g Lean and 60g Bulk from the Batch 6 overproduction observation; record the next finished yield."], "medium")


def custom_lebanese_chicken() -> Build:
    """Controlled one-tier build for the paid Batch 7 custom pilot."""
    return build([
        p("chicken_breast_cooked", 225, note="300g raw chicken breast at provisional 75% cooked yield"),
        p("lemon", 8, note="retained chicken seasoning"),
        p("garlic", 3, note="retained chicken seasoning"),
        p("avocado_oil", 2, note="retained chicken seasoning"),
        p("paprika", 1), p("cumin", 0.5), p("black_pepper", 0.4), p("salt", 0.75),
        p("lettuce", 60), p("cucumber", 60), p("tomato", 60),
        p("red_onion", 15), p("parsley", 5),
        p("avocado_oil", 9, note="separate lemon-mustard-garlic dressing cup", include_in_menu_macros=False),
        p("lemon", 4.5, note="separate lemon-mustard-garlic dressing cup", include_in_menu_macros=False),
        p("mustard", 0.75, note="separate lemon-mustard-garlic dressing cup", include_in_menu_macros=False),
        p("garlic", 0.3, note="separate lemon-mustard-garlic dressing cup", include_in_menu_macros=False),
        p("salt", 0.3, note="separate lemon-mustard-garlic dressing cup", include_in_menu_macros=False),
        p("black_pepper", 0.15, note="separate lemon-mustard-garlic dressing cup", include_in_menu_macros=False),
    ], [
        "Planner-only paid custom pilot; it is not a public Batch 7 menu item.",
        "Chicken targets 225g cooked from 300g raw at a provisional 75% yield.",
        "Sumac is intentionally excluded from the Batch 7 recipe and ingredient statement.",
        "Pack the salad and measured 15g lemon-mustard-garlic dressing cold and separately from the chicken. The house formula is a PRPD adaptation of the established 2:1 oil-to-acid vinaigrette direction, using bottled lemon juice, avocado oil, prepared mustard, garlic, salt, and black pepper. Public menu-style macros exclude only the optional dressing cup; complete-package nutrition retains it.",
    ], "medium")


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
    rice_g = 45 if lean else 60
    return build([
        shrimp(200 if lean else 270), *cilantro_garlic_lime_rice(rice_g),
        p("canned_peas_carrots", 74 if lean else 100), p("zucchini", 100 if lean else 130),
        p("butter", 7 if lean else 10),
        p("garlic", 12 if lean else 15), p("lemon", 10 if lean else 12),
        p("cornstarch", 4 if lean else 5), p("salt", 0.5 if lean else 0.75),
        *white_garlic_jalapeno_sauce(30),
    ], ["Use the batch-wide cilantro-garlic-lime rice, then fold drained peas and carrots into the Shrimp destination share after the common rice is divided.", "Drained canned peas and carrots replace the frozen blend for this batch at the owner's request.", "The historical two tablespoons of butter was ambiguous; butter is now explicit per meal.", "Pack one separate 30g white garlic-jalapeno yogurt sauce cup. The cup is excluded from displayed menu macros."], "medium")


def breakfast_quesadilla(tier: str) -> Build:
    """Owner-approved Batch 6 build with the optional salsa cup removed."""
    recipe = active.quesadilla(tier)
    raw_chicken = 120 if tier == "lean" else 160
    return build(
        [
            portion for portion in recipe.portions
            if portion.ingredient not in {"chicken_thigh_cooked", "egg", "egg_white", "fage", "salsa", "salt", "small_tortilla", "large_tortilla", "corn_street_tortilla", "mozzarella"}
        ] + [chicken_thigh(raw_chicken)] + salt_free_savory_chicken_base(raw_chicken) + [
            p("salt", raw_chicken * 0.005, note="component:shared-chicken-base"),
            p("small_tortilla", 2 if tier == "lean" else 3, "each"),
            p("mozzarella", 42 if tier == "lean" else 56),
            p("egg", 1, "each"), p("egg_white", 25),
        ],
        [
            "The egg component uses the shared breakfast base of one whole egg plus 25g liquid egg whites per order.",
            "Greek yogurt is not used in the egg mixture, and the former salsa side cup is removed.",
            "October 22 owner correction: use two Lean or three Bulk Mission 70-calorie Carb Balance medium flour tortillas. Season the shared chicken base at 0.5% salt by raw chicken weight. Lean uses 42g mozzarella; Bulk uses 56g.",
            "Owner corrected the Bulk raw chicken portion from 200g to 160g on October 21, 2026 because the egg, egg-white, cheese, and three-tortilla build already supplies a substantial finished meal.",
        ],
        "medium",
    )


def loaded_buffalo_revised(tier: str) -> Build:
    """Post-Batch-6 potato correction with the October 19 sodium reduction."""
    recipe = active.loaded_buffalo(tier)
    buffalo = 15 if tier == "lean" else 20
    raw_chicken = 200 if tier == "lean" else 250
    return build(
        [
            chicken_thigh(raw_chicken) if portion.ingredient == "chicken_thigh_cooked" else
            p("potato", 200) if portion.ingredient == "potato" else
            p("broccoli", portions.VEGETABLE_G[tier]) if portion.ingredient == "broccoli" else
            p("buffalo_sauce", buffalo, note="component:reduced-sodium-buffalo-finish") if portion.ingredient == "buffalo_sauce" else portion
            for portion in recipe.portions if portion.ingredient != "salt"
        ] + [
            p("water", 10 if tier == "lean" else 14, note="component:reduced-sodium-buffalo-finish"),
            p("apple_cider_vinegar", 3 if tier == "lean" else 4, note="component:reduced-sodium-buffalo-finish"),
            p("garlic_powder", 1, note="component:reduced-sodium-buffalo-finish"),
            p("paprika", 1, note="component:reduced-sodium-buffalo-finish"),
            p("salt", 0.46 if tier == "lean" else 0.5, note="component:potato-roast"),
            p("garlic_powder", 1.375 if tier == "lean" else 1.5, note="component:potato-roast"),
            p("paprika", 1.375 if tier == "lean" else 1.5, note="component:potato-roast"),
        ],
        [
            f"October 22 owner correction: allocate {raw_chicken:g}g raw chicken before cooking; record the actual cooked yield.",
            "The potato allocation is reduced from 300g to 200g per meal after the Batch 6 overproduction report.",
            "Potato is a translated starch and retains its recipe-specific input until its cooked yield is measured.",
            "Use a 30g Lean / 40g Bulk incorporated finish made with 15g/20g Buffalo sauce, water, apple-cider vinegar, garlic and paprika. Add no salt to the chicken or Buffalo finish.",
            "October 22 owner correction: season the complete shared potato-and-broccoli roast with the measured salt, garlic powder, and paprika before dividing it between Egg Bites and Loaded Buffalo.",
        ],
        "medium",
    )


def ny_strip(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        steak(240 if lean else 300), *instant_mash(200), p("broccoli", 100 if lean else 125),
        p("garlic", 6 if lean else 8),
        p("salt", 0.75 if lean else 1),
        *sweet_heat_45g(),
    ], ["Lean uses 240g raw steak; Bulk uses 300g.", "Dry-sear the steak on a properly preheated surface; no added oil is included.", "The 200g mashed-potato side uses Betty Crocker unflavored instant potatoes prepared to the package ratio; broccoli is the green vegetable.", SWEET_HEAT_ASSUMPTION], "medium")


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
        p("egg", 0.25, "each"), p("whey_vanilla", 5), p("cornstarch", 2.875),
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


def butter_chicken_no_broth(tier: str) -> Build:
    """PRPD high-protein Butter Chicken with a smooth tomato-forward sauce."""
    lean = tier == "lean"
    raw_chicken = 200 if lean else 250
    return build([
        chicken_thigh(raw_chicken), p("rice_dry", 40 if lean else 55),
        p("onion", 50 if lean else 70), p("tomato_paste", 10 if lean else 15),
        p("crushed_tomatoes", 130 if lean else 190), p("butter", 5 if lean else 7),
        p("fage", 45 if lean else 60), p("lemon", 3.75 if lean else 5),
        p("garlic", 3 if lean else 4), p("ginger", 2.5 if lean else 3.5),
        p("shan_butter_chicken", raw_chicken * .025),
        p("paprika", raw_chicken * .004),
        p("cumin", raw_chicken * .003),
        p("coriander", raw_chicken * .002),
        p("turmeric", raw_chicken * .001),
        p("black_pepper", raw_chicken * .001),
        p("cayenne", raw_chicken * .0005),
    ], [
        "Owner corrected the raw chicken portion to 200g Lean and 250g Bulk on October 21, 2026 after prior production left excess chicken that did not fit the intended meal balance.",
        "Use canned crushed tomatoes for a consistent tomato-forward sauce. Broth and recipe water are excluded; loosen only with a measured splash during production if the recorded pan needs it.",
        "Use 25g Shan Butter Chicken powder per 1kg raw chicken, split 15g/kg into the marinade and 10g/kg into the browned onion sauce. Add the measured salt-free paprika, cumin, coriander, turmeric, black pepper and cayenne to the sauce. Add no salt.",
        "Use 15g yogurt per meal in the marinade and reserve 30g/45g for the Lean/Bulk sauce finish. Brown onion, bloom the sauce spices, brown the small tomato-paste amount, add crushed tomatoes, simmer, then blend completely smooth before the off-heat yogurt finish.",
        "Record finished sauce and chicken yield before final labels.",
    ], "medium")


def cajun_garlic_salmon(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        p("pink_salmon_raw", 220 if lean else 300, note="skin-on purchased weight; portion by verified edible yield"),
        p("quinoa_dry", 50 if lean else 65), p("cilantro", 3 if lean else 4),
        p("green_beans", 120 if lean else 150),
        p("garlic", 8 if lean else 10), p("lemon", 12 if lean else 15),
        p("paprika", 2 if lean else 2.5), p("chili_powder", .5 if lean else .75),
        p("avocado_oil", 5 if lean else 7), p("salt", .75 if lean else 1),
    ], [
        "Wild pink salmon is roasted skin-side down; skin is removed after cooking and pin bones are checked before portioning.",
        "Lemon-herb quinoa and roasted green beans are new controlled sides and are not pooled with the rice or potato waves.",
        "The fish is Cajun-seasoned, not marketed as blackened. Record thawed drained, skinless cooked, and plated weights.",
    ], "medium")


def southwest_beef_taco_bowl(tier: str) -> Build:
    lean = tier == "lean"
    rice_g = portions.RICE_DRY_G[tier]
    return build([
        standard_ground_beef_component(tier), *cilantro_garlic_lime_rice(rice_g),
        p("black_beans", 55 if lean else 70), p("corn", 60 if lean else 75),
        p("green_bell_pepper", 30 if lean else 40), p("onion", 20 if lean else 25),
        p("lettuce", 25), p("cotija", 12 if lean else 16),
        *white_garlic_jalapeno_sauce(37),
        p("avocado_oil", 2 if lean else 3), p("salt", .75 if lean else 1),
    ], [
        *component_standard_assumptions(tier, "beef"),
        "Ground beef is browned to 160 F and drained before taco seasoning is added.",
        "The bowl uses cilantro-lime rice, black beans, corn-pepper vegetables, lettuce, cotija, and a 37g jalapeno-lime yogurt cup.",
        "Record the first filled weights and day-three texture before treating the formula as final.",
    ], "medium")


def chicken_caesar_crunch_box() -> Build:
    return build([
        chicken_thigh(160), p("lettuce", 60), p("cucumber", 50),
        p("parmesan", 14), p("croutons", 15),
        p("fage", 25, note="separate Caesar cup", include_in_menu_macros=False),
        p("light_mayo", 5, note="separate Caesar cup", include_in_menu_macros=False),
        p("lemon", 4, note="separate Caesar cup", include_in_menu_macros=False),
        p("garlic", 1, note="separate Caesar cup", include_in_menu_macros=False),
        p("salt", .3, note="separate Caesar cup", include_in_menu_macros=False),
    ], [
        "Single 12 oz chilled box with chicken, romaine-style lettuce, cucumber, Parmesan, a 35g yogurt-Caesar cup, and croutons packed dry and separate.",
        "Confirm the exact crouton and Parmesan package panels, full box fit, dressing yield, and 72-hour crunch before final labels.",
    ], "medium")


def creamy_garlic_parmesan_chicken_pasta(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(180 if lean else 280),
        p("protein_pasta", 55 if lean else 75),
        p("broccoli", 100 if lean else 130),
        p("fairlife_milk", 80 if lean else 110),
        p("fage", 35 if lean else 50),
        p("reduced_cream_cheese", 15 if lean else 22),
        p("parmesan", 14 if lean else 20),
        p("garlic", 6 if lean else 8),
        p("avocado_oil", 2 if lean else 3),
        p("salt", .75 if lean else 1),
        p("black_pepper", .5 if lean else .75),
    ], [
        "Chicken thighs are seasoned and cooked separately, then sliced and folded through the finished pasta.",
        "The lighter white sauce uses measured fat-free milk, Greek yogurt, reduced-fat cream cheese, Parmesan, and garlic; it contains no heavy cream.",
        "Whisk milk, cream cheese, Parmesan, and garlic over low heat, remove from direct heat, then fold in Greek yogurt before combining with pasta and broccoli.",
        "Record cooked pasta, chicken, broccoli, and finished sauce yields before label lock.",
    ], "medium")


def bbq_chicken_lavash_flatbread() -> Build:
    raw_chicken = 150
    return build([
        chicken_thigh(raw_chicken), *neutral_chicken_base(raw_chicken),
        p("lavash", 1, "each"),
        p("mozzarella", 35),
        p("onion", 20),
        p("bbq_sauce", 25),
        p("honey", 4),
        p("lime", 5),
        p("cilantro", 2),
        p("avocado_oil", 1, note="component:chicken-cooking"),
    ], [
        "One full lavash is topped with smoky honey-lime BBQ chicken, mozzarella, and onion, baked until crisp, then cut into four wedges.",
        "Mix the measured BBQ sauce, honey, and lime as one controlled sauce; use part on the lavash and part to coat the cooked chicken.",
        "Record the purchased lavash label, baked weight, four-wedge fit, and reheating quality before final label printing.",
    ], "medium")


def strawberry_lemon_cheesecake() -> Build:
    return strawberry_lemon_cheesecake_square()


def french_toast(tier: str) -> Build:
    multiplier = .75 if tier == "lean" else 1
    slices = 3 if tier == "lean" else 4
    return build(
        [p("whey_vanilla", portion.amount, portion.unit, portion.note) if portion.ingredient == "whey" else portion
         for portion in active.french_custard(multiplier) if portion.ingredient != "avocado_oil"]
        + [p("bread_slice", slices, "each")]
        + active.common_french_sides(),
        [
            f"{tier.title()} receives {slices} slices and its controlled share of the protein custard.",
            "Fruit, whipped cream, and one 30g sugar-free maple syrup cup are included in nutrition and packing.",
            "Cook on a clean nonstick surface with no added oil.",
        ],
        "medium",
    )


def egg_bites_reconciled(tier: str) -> Build:
    """Research-reconciled 24-well recipe with a fixed 60 g raw fill.

    The former per-meal formula overproduced because it was multiplied by meal
    count without a tray-yield control. This build allocates one measured
    1,440 g batch across exactly 24 standard muffin wells.
    """
    lean = tier == "lean"
    bites = 4 if lean else 6
    share = bites / 24
    portions = [
        p("egg", 8 * share, "each", note="component:egg-bite-batter"),
        p("egg_white", 504.5 * share, note="component:egg-bite-batter"),
        p("cottage", 200 * share, note="component:egg-bite-batter"),
        p("mozzarella", 150 * share, note="component:egg-bite-batter"),
        p("spinach", 65 * share, note="component:egg-bite-batter"),
        p("tomato", 50 * share, note="component:egg-bite-batter"),
        p("onion", 40 * share, note="component:egg-bite-batter"),
        p("jalapeno", 25 * share, note="component:egg-bite-batter"),
        p("salt", 1.5 * share, note="component:egg-bite-batter"),
        p("garlic_powder", 3 * share, note="component:egg-bite-batter"),
        p("black_pepper", 1 * share, note="component:egg-bite-batter"),
        p("potato", 120 if lean else 150, note="component:potato-hash"),
        p("paprika", .6 if lean else .75, note="component:potato-hash"),
        p("garlic_powder", .6 if lean else .75, note="component:potato-hash"),
        p("salt", .2 if lean else .25, note="component:potato-hash"),
    ]
    return build(portions, [
        f"{tier.title()} receives exactly {bites} of the 24 standard-size egg bites plus measured potato hash.",
        "The complete raw egg-bite batter weighs 1,440 g and is deposited at exactly 60 g into each of 24 standard muffin wells.",
        "Use silicone or a clean nonstick pan for the egg bites. Roast or air-fry the potato hash on parchment with no added oil.",
        "Blend eggs, egg whites, and cottage cheese smooth; fold in cheese and vegetables. Fill prepared wells one-half to three-quarters full and bake at 350 F until the centers reach 160 F.",
        "Research basis: Utah State University Extension recommends 1/4-1/3 cup egg mixture and one-half to three-quarters well fill; the American Egg Board uses a 1/4-cup portion for a 12-well recipe.",
        "Record total mixed-batter weight, actual 60 g deposits, baked count, average finished bite weight, and any leftover batter. Do not estimate yield from meal count.",
        "October 19 sodium correction: the complete 24-well batter uses 1.5g salt; potato hash uses 0.2g Lean / 0.25g Bulk salt.",
    ], "medium")


def chicken_shakshuka(tier: str) -> Build:
    lean = tier == "lean"
    raw_chicken = 130 if lean else 180
    return build([
        chicken_thigh(raw_chicken), *salt_free_savory_chicken_base(raw_chicken),
        p("salt", raw_chicken * 0.005, note="component:shared-chicken-base"), p("egg", 2, "each"),
        p("tomato", 200 if lean else 250, note="fresh tomatoes cooked down for the shakshuka base"), p("red_onion", 50 if lean else 60),
        p("green_bell_pepper", 50 if lean else 60), p("mozzarella", 28),
        p("bread_slice", 1 if lean else 2, "each"), p("garlic", 5 if lean else 6),
        p("paprika", 2, note="component:shakshuka-base"), p("cumin", 1),
        p("avocado_oil", 3 if lean else 4, note="component:chicken-cooking"),
    ], [
        "Chicken and eggs are cooked to 165 F in a measured tomato-pepper shakshuka base. The measured oil is for the chicken only; do not add oil to the tomato-pepper base.",
        "Pack the same controlled bread used for French Toast separately so it can be toasted after reheating.",
        "There is no recipe-required sauce cup. Customer-selected Garlic Herb Yogurt or Sweet Heat cups are handled once through the weekly sauce program.",
        "Use fresh cooked-down tomatoes instead of salted canned tomatoes. Season the shared chicken base at 0.5% salt by raw chicken weight; do not add a separate salt dose to the tomato-pepper base.",
        "Owner corrected raw chicken to 130g Lean and 180g Bulk on October 21, 2026 because each serving also contains two whole eggs and mozzarella.",
    ], "medium")


def creamy_chicken_parmesan(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        chicken_thigh(200 if lean else 300), p("protein_pasta", 50 if lean else 70),
        p("crushed_tomatoes", 150 if lean else 180), p("fage", 30 if lean else 40),
        p("parmesan", 14 if lean else 18), p("mozzarella", 28 if lean else 42),
        p("breadcrumbs", 15 if lean else 20), p("garlic", 6 if lean else 8),
        p("avocado_oil", 3 if lean else 4), p("salt", .75 if lean else 1),
    ], [
        "Chicken thighs use a measured breadcrumb coating and are cooked to 165 F.",
        "Greek yogurt is folded into the tomato-Parmesan sauce off heat; record finished pasta and sauce yields.",
    ], "medium")


def mediterranean_chicken_bowl(tier: str) -> Build:
    lean = tier == "lean"
    raw_chicken = standard_chicken_raw_pull(tier)
    return build([
        standard_chicken_component(tier), *neutral_chicken_base(raw_chicken), standard_rice(tier),
        p("cucumber", 50 if lean else 60), p("tomato", 50 if lean else 60),
        p("hummus", 40 if lean else 55), p("feta", 14 if lean else 18),
        p("olives", 15 if lean else 20), p("onion", 20 if lean else 25),
        p("lemon", 5 if lean else 6),
        p("avocado_oil", 2 if lean else 3, note="component:chicken-cooking"),
    ], [
        *component_standard_assumptions(tier, "chicken"),
        "The named Mediterranean vegetables exceed the baseline vegetable minimum and retain their recipe-specific quantities.",
        "Pack cucumber, tomato, hummus, feta, olives, and onion cold and separate from the chicken and rice. The measured oil is for cooking the chicken only; do not dress the cold components with oil.",
        "Record the first finished bowl weights and chilled component hold quality.",
    ], "medium")


def tandoori_chicken(tier: str) -> Build:
    lean = tier == "lean"
    rice_g = 45 if lean else 60
    return build([
        # Tandoori is a bone-in leg-quarter recipe. Keep the edible cooked
        # portion equal to the approved build while allowing the production
        # generator to convert it to the larger bone-in raw purchase weight.
        p("leg_quarter_cooked", 165 if lean else 240), *cilantro_garlic_lime_rice(rice_g),
        p("broccoli", 100 if lean else 130), p("fage", 15 if lean else 22),
        p("lemon", 12 if lean else 15), p("garlic", 6 if lean else 8),
        p("ginger", 4 if lean else 5), p("paprika", 2), p("cumin", 1),
        p("coriander", 1), p("avocado_oil", 3 if lean else 4, note="component:chicken-marinade"),
        p("salt", .75 if lean else 1),
        *white_garlic_jalapeno_sauce(30),
    ], [
        "The yogurt and spice allocation is the retained tandoori marinade, not a separate sauce cup.",
        "Bone-in chicken leg quarters are marinated overnight and cooked to 165 F; record raw bone-in weight, cooked edible yield, and piece count.",
        "Pack one separate 30g white garlic-jalapeno yogurt sauce cup. The cup is excluded from displayed menu macros.",
    ], "medium")


def pepper_steak_bowl(tier: str) -> Build:
    lean = tier == "lean"
    return build([
        beef_strips(180 if lean else 250), p("rice_dry", 40 if lean else 55),
        p("green_bell_pepper", 70 if lean else 90), p("red_onion", 40 if lean else 50),
        p("soy_sauce", 15 if lean else 20), p("honey", 8 if lean else 10),
        p("garlic", 5 if lean else 7), p("cornstarch", 3 if lean else 4),
        p("avocado_oil", 3 if lean else 4), p("salt", .5 if lean else .75),
    ], [
        "Beef is seared in batches; peppers and onions stay crisp-tender before the measured sauce is added.",
        "Record raw and cooked beef yield and finished sauce weight.",
    ], "medium")


def chicken_enchilada_bake(tier: str) -> Build:
    lean = tier == "lean"
    raw_chicken = 200 if lean else 290
    return build([
        chicken_thigh(raw_chicken), *neutral_chicken_base(raw_chicken),
        # Both tiers use the medium tortilla. The larger Bulk slice receives
        # the equivalent tortilla share from the finished pan, not a large wrap.
        # At the current 7 Lean / 8 Bulk run this produces exactly 39 tortillas.
        p("small_tortilla", 2 if lean else 3.125, "each"),
        p("corn", 50 if lean else 70),
        p("enchilada_sauce", 100 if lean else 130), p("mozzarella", 28 if lean else 42),
        p("red_onion", 25 if lean else 35), p("avocado_oil", 2 if lean else 3),
        *white_garlic_jalapeno_sauce(30),
    ], [
        "Chicken, corn, tortillas, sauce, and cheese are layered and baked as one controlled casserole. Beans are excluded by the September 16 owner decision after customer feedback.",
        "Record finished pan weight and equal serving weights before final labels.",
        "Pack one separate 30g white garlic-jalapeno yogurt sauce cup. The cup is excluded from displayed menu macros.",
    ], "medium")


def high_protein_beef_lasagna(tier: str) -> Build:
    lean = tier == "lean"
    divisor = 8 if lean else 6
    return build([
        beef_pan(1134 / divisor), p("crushed_tomatoes", 1360 / divisor),
        p("tomato_paste", 85 / divisor), p("water", 120 / divisor),
        p("italian_seasoning", 6 / divisor),
        p("lasagna_sheet", 12 / divisor, "each"), p("part_skim_ricotta", 425 / divisor),
        p("mozzarella", 226 / divisor), p("parmesan", 56 / divisor),
        p("egg", 2 / divisor, "each"), p("onion", 120 / divisor),
        p("garlic", 16 / divisor), p("parsley", 15 / divisor), p("black_pepper", 2 / divisor),
        p("salt", .75 if lean else 1),
    ], [
        "PRPD house lasagna sauce is made from canned tomatoes, tomato paste, water, onion, garlic, and Italian seasoning; purchased marinara is not used.",
        "Portion the fully chilled lasagna by individual scale weight, not by a fixed pan grid: Lean label weight 442g and Bulk label weight 589g.",
        "Use a 5g operational overfill target (447g Lean; 594g Bulk), fill every sold portion first, and retain only genuine edge trim after the customer count is complete.",
        "Uses a traditional separate part-skim ricotta layer and the same fat-free mozzarella as the other Batch 11 dishes; cottage cheese and white sauce are not used. Confirm the melt and moisture in the first pan.",
        "This is a new pilot. Confirm the purchased packages, baked pan weight, set, and equal serving weights before final labels.",
    ], "medium")


def chocolate_peanut_butter_protein_brownie() -> Build:
    return build([
        p("flour", 20), p("whey_chocolate", 19.5), p("egg", .25, "each"),
        p("fage", 60), p("pbfit", 12), p("cocoa", 5),
        p("chocolate_chips", 7), p("honey", 7), p("baking_powder", 1),
        p("fairlife_milk", 20), p("salt", .2),
    ], [
        "One serving is one controlled baked brownie portion.",
        "Confirm the pan yield, finished portion weight, and purchased protein powder and chocolate labels.",
    ], "medium")


def chocolate_oreo_mousse() -> Build:
    recipe = active.mousse(19.5)
    return build(
        [p("whey_chocolate", portion.amount, portion.unit, portion.note) if portion.ingredient == "whey" else portion for portion in recipe.portions],
        [*recipe.assumptions, "The chocolate protein-powder flavor is explicit and must match the purchased package."],
        recipe.confidence,
    )


def buffalo_chicken_pinwheels() -> Build:
    raw_chicken = 100
    return build([
        chicken_thigh(raw_chicken), *salt_free_savory_chicken_base(raw_chicken), p("small_tortilla", 1, "each"),
        p("regular_cream_cheese", 20), p("mozzarella", 14),
        p("buffalo_sauce", 5), p("apple_cider_vinegar", 2), p("water", 3), p("lettuce", 20), p("onion", 10),
        p("avocado_oil", 1),
    ], [
        "One chilled Grab & Go order uses one 70-calorie Mission Carb Balance medium flour tortilla, rolled tightly and sliced into four pinwheel pieces.",
        "Cool chicken fully before assembly; record pinwheel count, 12 oz box fit, and 72-hour hold quality.",
        "Use Sweet Baby Ray's Mild Buffalo Wing Sauce. Add no chicken salt and use a 10g incorporated finish made from 5g sauce, 2g apple-cider vinegar and 3g water.",
    ], "medium")


def mediterranean_chicken_hummus_box() -> Build:
    raw_chicken = 100
    return build([
        chicken_thigh(raw_chicken), *salt_free_savory_chicken_base(raw_chicken),
        p("salt", raw_chicken * 0.005, note="component:shared-chicken-base"), p("hummus", 60), p("shawarma_bread", .5, "each"),
        p("cucumber", 50), p("tomato", 50), p("feta", 14),
        p("olives", 15), p("onion", 10), p("lemon", 5),
        p("avocado_oil", 1),
    ], [
        "One chilled Grab & Go box with cooked chicken, hummus, half a flatbread, vegetables, feta, and olives.",
        "Record the 12 oz box fit and 72-hour cold hold before final labels.",
        "October 22 owner correction: season the shared chicken base at 0.5% salt by raw chicken weight. Do not add a second salt dose after the Hummus Box pull is divided.",
    ], "medium")


def chinese_bok_choy_chicken(tier: str) -> Build:
    """PRPD Chinese-style chicken with a fish-free ginger-hoisin pan sauce."""
    lean = tier == "lean"
    raw_chicken = standard_chicken_raw_pull(tier)
    return build([
        standard_chicken_component(tier), *neutral_chicken_base(raw_chicken),
        standard_rice(tier),
        p("bok_choy", 120 if lean else 160),
        p("red_bell_pepper", 50 if lean else 65),
        p("green_onion", 10 if lean else 12),
        p("soy_sauce", 20 if lean else 28),
        p("hoisin", 15 if lean else 20),
        p("rice_vinegar", 8 if lean else 10),
        p("honey", 8 if lean else 10),
        p("garlic", 8 if lean else 10),
        p("ginger", 6 if lean else 8),
        p("sesame_oil", 3 if lean else 4),
        p("cornstarch", 4 if lean else 5),
        p("white_pepper", .4 if lean else .5),
    ], [
        *component_standard_assumptions(tier, "chicken"),
        "The named bok choy, pepper, and scallion vegetables exceed the baseline vegetable minimum and retain their recipe-specific quantities.",
        "PRPD Chinese-style adaptation. It contains no tamari, fish sauce, oyster sauce, or shellfish ingredient.",
        "The measured sauce uses low-sodium soy sauce, hoisin, unseasoned rice vinegar, honey, ginger, garlic, toasted sesame oil, cornstarch, and white pepper.",
        "Cook bok choy stems before the leaves so the stems stay crisp and the greens do not turn watery. Red bell pepper and scallions stay visible in the finished meal.",
        "Confirm the purchased soy and hoisin halal ingredient panels and record chicken, rice, vegetable, and finished sauce yields.",
    ], "medium")


def caprese_protein_pasta_box() -> Build:
    """One fixed chilled Grab & Go box finished with measured dressing."""
    return build([
        p("barilla_protein_plus_rotini", 66),
        p("cannellini_beans", 100),
        p("mozzarella", 28),
        p("tomato", 45),
        p("basil", 4),
        p("fage", 14, note="component:caprese-dressing"),
        p("balsamic_vinegar", 5, note="component:caprese-dressing"),
        p("garlic_powder", .3, note="component:caprese-dressing"),
        p("salt", .3, note="component:caprese-dressing"),
        p("black_pepper", .2, note="component:caprese-dressing"),
        p("water", .2, note="component:caprese-dressing"),
    ], [
        "One fixed chilled 12 oz Grab & Go box. The 66g dry Protein+ rotini is cooked, rinsed briefly, drained thoroughly, and cooled before assembly.",
        "Drain and rinse cannellini beans. Use the existing PRPD fat-free mozzarella, dry tomatoes, and fresh basil.",
        "Whisk the 20g oil-free balsamic-yogurt dressing exactly as listed and drizzle it evenly over the finished chilled pasta box immediately before sealing. Do not pack a separate cup.",
        "This is a PRPD adaptation of a Caprese pasta salad, with beans and the existing fat-free mozzarella for additional protein and fiber at a lower calorie load. Record cooked pasta yield, finished box weight, box fit, and 72-hour texture before final label printing.",
    ], "blocked")


ARCHIVED_BATCH9_MEALS = [
    DraftMeal("Strawberry Cheesecake Protein Pancakes", "Breakfast", strawberry_cheesecake_pancakes("lean"), strawberry_cheesecake_pancakes("bulk"), "Owner approved return", "Record pancake count, compote and topping yields, and day-three reheat."),
    DraftMeal("PRPD Beef Bacon Breakfast Sandwich", "Breakfast", breakfast_sandwich("lean"), breakfast_sandwich("bulk"), "Owner approved return", "Confirm bread and beef-bacon panels; record egg-patty and potato yields."),
    DraftMeal("High Protein Omelette", "Breakfast", omelette("lean"), omelette("bulk"), "Owner approved return", "Record cooked egg yield, bread count, and finished weights."),
    DraftMeal("Power Bowl", "Breakfast", with_cilantro_garnish(power_bowl("lean")), with_cilantro_garnish(power_bowl("bulk")), "Owner approved return", "Record chicken, potato, egg, and sauce-cup yields."),
    DraftMeal("Hot Honey Chicken Sliders", "Main", sliders("lean"), sliders("bulk"), "Owner approved return", "Record slider count, cooked chicken yield, and package panels."),
    DraftMeal("Butter Chicken", "Main", with_cilantro_garnish(butter_chicken_no_broth("lean")), with_cilantro_garnish(butter_chicken_no_broth("bulk")), "Owner approved return", "Record cooked chicken, finished sauce, and rice yields."),
    DraftMeal("Mexican Streetcorn Chicken Bowl", "Main", with_cilantro_garnish(streetcorn_updated("lean")), with_cilantro_garnish(streetcorn_updated("bulk")), "Owner approved return", "Record cooked chicken, rice, and finished street-corn yields."),
    DraftMeal("Harissa Honey Chicken", "Main", with_cilantro_garnish(harissa_honey_chicken("lean")), with_cilantro_garnish(harissa_honey_chicken("bulk")), "Owner approved return", "Confirm harissa panel and record glaze, chicken, rice, and broccoli yields."),
    DraftMeal("Loaded Buffalo Chicken Potato", "Main", with_cilantro_garnish(loaded_buffalo_revised("lean")), with_cilantro_garnish(loaded_buffalo_revised("bulk")), "Owner approved return", "Record potato, chicken, broccoli, and finished meal yields."),
    DraftMeal("Creamy Garlic Parmesan Chicken Pasta", "Main", with_cilantro_garnish(creamy_garlic_parmesan_chicken_pasta("lean")), with_cilantro_garnish(creamy_garlic_parmesan_chicken_pasta("bulk")), "Owner approved pilot", "Record chicken, pasta, broccoli, sauce, and finished serving yields."),
    DraftMeal("Southwest Beef Taco Bowl", "Main", with_cilantro_garnish(southwest_beef_taco_bowl("lean")), with_cilantro_garnish(southwest_beef_taco_bowl("bulk")), "Owner approved return", "Record drained beef, rice, hot vegetables, cold toppings, and sauce-cup yields."),
    DraftMeal("Cajun Garlic Salmon", "Main", with_cilantro_garnish(cajun_garlic_salmon("lean")), with_cilantro_garnish(cajun_garlic_salmon("bulk")), "Owner approved return", "Confirm salmon yield and record quinoa and green-bean yields."),
    DraftMeal("Baked Strawberry-Lemon Protein Cheesecake", "Dessert", strawberry_lemon_cheesecake(), None, "Owner approved return", "Record baked pan yield and individual portion weights."),
    DraftMeal("Chocolate Peanut Butter Protein Brownie", "Dessert", chocolate_peanut_butter_protein_brownie(), None, "Owner approved return", "Record baked pan yield and equal portion weights."),
    DraftMeal("Banana Cream Pie Cup", "Dessert", banana_cream(), None, "Owner approved return", "Confirm pudding and Biscoff package panels and record filled cup weight."),
    DraftMeal("Buffalo Chicken Pinwheels", "Add-on", buffalo_chicken_pinwheels(), None, "Owner approved return", "Cut the one rolled tortilla into four total pinwheel pieces and record box fit and 72-hour hold."),
    DraftMeal("Chicken Caesar Crunch Box", "Add-on", chicken_caesar_crunch_box(), None, "Owner approved return", "Record chilled box, dressing cup, crouton bag, and 72-hour hold."),
    DraftMeal("BBQ Chicken Lavash Flatbread", "Add-on", bbq_chicken_lavash_flatbread(), None, "Owner approved pilot", "Confirm lavash panel and record baked four-wedge fit and reheat quality."),
]

import sys as _sys
from batch10_recipes import configure as _configure_batch10
creamy_cajun_chicken_pasta, oreo_protein_cheesecake_cup, halal_cart_complete, tiramisu_complete = _configure_batch10(_sys.modules[__name__])

def returning(name, category, recipe, single=False, garnish=False):
    def portion(tier):
        result = recipe() if single else recipe(tier)
        return with_cilantro_garnish(result) if garnish else result
    return DraftMeal(name, category, portion("lean"), None if single else portion("bulk"),
                     "Owner approved Batch 12", "Confirm purchased package labels and record actual finished yield before production labels.")


def shan_seekh_shawarma(tier):
    raw = 170 if tier == "lean" else 210
    scale = raw / 1000
    return build([
        active.beef_baked(raw),
        p("shan_seekh", raw * .02, note="component:reduced-sodium-seekh-seasoning"),
        p("onion", raw * .08, note="component:reduced-sodium-seekh-seasoning; grate and squeeze dry"),
        p("garlic", raw * .01, note="component:reduced-sodium-seekh-seasoning"),
        p("jalapeno", raw * .02, note="component:reduced-sodium-seekh-seasoning"),
        p("paprika", 3 * scale, note="component:reduced-sodium-seekh-seasoning"),
        p("cumin", 2 * scale, note="component:reduced-sodium-seekh-seasoning"),
        p("coriander", 2 * scale, note="component:reduced-sodium-seekh-seasoning"),
        p("black_pepper", 1.5 * scale, note="component:reduced-sodium-seekh-seasoning"),
        p("turmeric", .5 * scale, note="component:reduced-sodium-seekh-seasoning"),
        p("cayenne", .5 * scale, note="component:reduced-sodium-seekh-seasoning"),
        p("shawarma_bread", 1 if tier == "lean" else 1.5, "each"),
        p("lettuce", 25), p("onion", 15), p("pickles", 10 if tier == "lean" else 15),
        p("cucumber", 20 if tier == "lean" else 30),
        p("cilantro", 2, note="fresh Seekh garnish"),
        *garlic_herb_yogurt(30),
    ], ["October 19 second-pass sodium formula: use 20g Shan Seekh mix per 1kg raw beef and restore aroma with measured fresh onion, garlic, jalapeno and salt-free spices.",
        "Keep actual 90/10 and 96/4 meat batches separate. Add no salt, oil, suet or butter to the meat.",
        "Use 10g Lean / 15g Bulk drained pickles plus fresh cucumber and 2g cilantro for fresh crunch and garnish.",
        "Use 30g of the same current Garlic Herb Yogurt batch inside the bread. Do not make a separate white-garlic base."], "medium")

MEALS = [
    returning("Egg Bites with Potato Hash", "Breakfast", egg_bites_reconciled),
    returning("Chicken Shakshuka", "Breakfast", chicken_shakshuka),
    returning("French Toast", "Breakfast", french_toast),
    returning("Beef Breakfast Skillet", "Breakfast", breakfast_skillet),
    returning("Creamy Chicken Parmesan", "Main", creamy_chicken_parmesan),
    returning("BBQ Chicken Mac & Cheese", "Main", bbq_mac),
    returning("Southwest Beef Taco Bowl", "Main", southwest_beef_taco_bowl),
    returning("Tandoori Chicken", "Main", tandoori_chicken),
    returning("Garlic Butter Shrimp + Rice", "Main", garlic_shrimp),
    returning("Chicken Enchilada Bake", "Main", chicken_enchilada_bake),
    returning("Loaded Beef Cottage Pie", "Main", cottage_pie),
    returning("Baked Strawberry-Lemon Protein Cheesecake", "Dessert", strawberry_lemon_cheesecake, single=True),
    returning("Chocolate Oreo Mousse", "Dessert", chocolate_oreo_mousse, single=True),
    returning("Chocolate Peanut Butter Protein Brownie", "Dessert", chocolate_peanut_butter_protein_brownie, single=True),
    returning("Chicken Tikka Snack Wrap", "Add-on", chicken_tikka_snack_wrap, single=True),
    returning("PRPD Protein Box", "Add-on", protein_box, single=True),
    returning("Caprese Protein Pasta Box", "Add-on", caprese_protein_pasta_box, single=True),
]

# Apply the current-batch oil package only after assembling the menu. Historical
# recipe functions and archived batches therefore retain their recorded oils.
MEALS = [
    DraftMeal(
        meal.name,
        meal.category,
        with_batch8_purchased_oil(meal.lean),
        with_batch8_purchased_oil(meal.bulk) if meal.bulk else None,
        meal.decision,
        meal.validation,
    )
    for meal in MEALS
]


def total(record: Build) -> Nutrition:
    return active.total(record)


def menu_total(record: Build) -> Nutrition:
    return active.menu_total(record)


def nutrition_is_complete(record: Build) -> bool:
    return active.nutrition_is_complete(record)


def display(value: Nutrition) -> tuple[int, int, int, int, int]:
    return (
        int(round(value.calories / 5) * 5), int(round(value.protein)),
        int(round(value.carbs)), int(round(value.fiber)), int(round(value.fat)),
    )


def amount_text(portion: Portion) -> str:
    ingredient = active.INGREDIENTS[portion.ingredient]
    amount = f"{portion.amount:g} {portion.unit}" if portion.unit != "each" else f"{portion.amount:g} each"
    return f"{amount} {ingredient.name}"


def archived_batch8_report() -> str:
    lines = [
        "# PRPD Batch 8 Menu - Controlled Recipe and Nutrition Estimates",
        "",
        "Generated: August 24, 2026",
        "",
        "## What Is Locked Here",
        "",
        "This document rebuilds the owner-approved Batch 8 menu from controlled ingredient quantities rather than copying historical calorie claims. Public menu publication is controlled separately by config/order-config.js.",
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
            calories, protein, carbs, fiber, fat = display(menu_total(record))
            lines.append(f"| {meal.category} | {meal.name} | {tier} | {calories} | {protein}g | {carbs}g | {fiber}g | {fat}g | {meal.decision} |")

    lines += [
        "",
        "## Portion Decisions",
        "",
        "- Four breakfasts, eight mains, three desserts, and three Grab & Go items are controlled together for Batch 8.",
        "- French Toast retains the confirmed three-slice Lean and four-slice Bulk builds, including fruit, whipped cream, and one 30g syrup cup.",
        "- High-Protein Beef Lasagna uses the standard 90/10 ground beef, cooked to 160 F and thoroughly drained, plus a traditional separate part-skim ricotta layer; cottage cheese and white sauce are not used.",
        "- Chicken Enchilada Bake and Chicken Shakshuka are first-run controlled casseroles whose finished pan weights must be recorded.",
        "- Chocolate Oreo Mousse retains the taste-approved 19.5g protein-powder portion.",
        "",
        "## Remaining Physical Production Gates",
        "",
        "1. Complete the Beef Lasagna home test and record its exact package labels, baked pan weight, set, and equal serving weights.",
        "2. Confirm the purchased canned tomatoes, tomato paste, ricotta, fat-free mozzarella, lasagna, enchilada sauce, hummus, feta, tortilla, Oreo, chocolate-chip, and protein-powder package labels before final label printing.",
        "3. Record representative raw and cooked yields for chicken thighs, drained ground beef, beef strips, and tilapia.",
        "4. Record the finished casserole, dessert, pinwheel, and chilled-box yields and 72-hour hold checks.",
        "5. Confirm the whole mini apple and complete Protein Box fit and hold safely in the 12 oz box.",
        "",
        "## Controlled Builds",
    ]
    for meal in MEALS:
        lines += ["", f"### {meal.name}", "", f"Decision: {meal.decision}. Validation: {meal.validation}"]
        for tier, record in (("Single" if meal.bulk is None else "Lean", meal.lean), ("Bulk", meal.bulk)):
            if record is None:
                continue
            calories, protein, carbs, fiber, fat = display(menu_total(record))
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


def report() -> str:
    lines = ["# Batch 12 controlled recipes and calculated nutrition", "", "Updated September 21, 2026. Delivery September 26. Customer reminders remain a separate control.", "",
             "The table reports composed-meal nutrition and excludes optional sauces or dressings supplied in separate sealed cups. Incorporated sauces remain included. Complete-package label nutrition, ingredient/allergen records, groceries and costing continue to retain every supplied component. Nutrition is calculated from ingredient profiles, not laboratory results. Actual cooked yields, package panels and final net weights must be checked before printing production labels. Kitchen testing is not completed by software verification.", "",
             "| Dish | Tier | Calories | Protein | Carbs | Fiber | Fat |", "|---|---|---:|---:|---:|---:|---:|"]
    for meal in MEALS:
        for tier, record in [("Lean" if meal.bulk else "Single", meal.lean), ("Bulk", meal.bulk)]:
            if record:
                cal, protein, carbs, fiber, fat = display(menu_total(record))
                lines.append(f"| {meal.name} | {tier} | {cal} | {protein}g | {carbs}g | {fiber}g | {fat}g |")
    for meal in MEALS:
        lines += ["", f"## {meal.name}", "", meal.validation]
        for tier, record in [("Lean" if meal.bulk else "Single", meal.lean), ("Bulk", meal.bulk)]:
            if record:
                lines += ["", f"### {tier}", ""]
                lines += [f"- {amount_text(x)}" + (f" ({x.note})" if x.note else "") for x in record.portions]
                lines += ["", *[f"- Control: {note}" for note in record.assumptions]]
    return "\n".join(lines) + "\n"


def main() -> None:
    OUTPUT_PATH.write_text(report(), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    for meal in MEALS:
        values = [display(menu_total(meal.lean))]
        if meal.bulk:
            values.append(display(menu_total(meal.bulk)))
        print(meal.name, values)


if __name__ == "__main__":
    main()
