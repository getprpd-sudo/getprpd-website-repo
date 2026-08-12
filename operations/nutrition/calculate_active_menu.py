"""Reproducible working nutrition audit for the July 2026 PRPD menu.

This is an operations calculator, not laboratory analysis. Package-label values take
priority over USDA values. Every estimated or unresolved input is called out in the
generated report so an apparently complete total is never mistaken for label-ready
data.
"""

from __future__ import annotations

from dataclasses import dataclass, fields
from pathlib import Path
from typing import Iterable


@dataclass
class Nutrition:
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fiber: float = 0
    fat: float = 0
    saturated_fat: float = 0
    sugars: float = 0
    added_sugars: float = 0
    sodium: float = 0
    cholesterol: float = 0
    trans_fat: float = 0
    vitamin_d: float = 0
    calcium: float = 0
    iron: float = 0
    potassium: float = 0

    def __add__(self, other: "Nutrition") -> "Nutrition":
        return Nutrition(**{
            field.name: getattr(self, field.name) + getattr(other, field.name)
            for field in fields(self)
        })

    def scale(self, multiplier: float) -> "Nutrition":
        return Nutrition(**{
            field.name: getattr(self, field.name) * multiplier
            for field in fields(self)
        })


@dataclass
class Ingredient:
    name: str
    nutrition: Nutrition
    basis: str
    source: str
    confidence: str = "high"
    note: str = ""


@dataclass
class Portion:
    ingredient: str
    amount: float
    unit: str = "g"
    note: str = ""


@dataclass
class Build:
    portions: list[Portion]
    assumptions: list[str]
    confidence: str


@dataclass
class Meal:
    meal_id: str
    name: str
    lean: Build | None
    bulk: Build | None
    current_lean: tuple[int, int, int, int, int] | None
    current_bulk: tuple[int, int, int, int, int] | None
    status: str
    recommendation: str


def n(
    cal=0, p=0, c=0, fi=0, f=0, sf=0, su=0, ad=0, so=0, ch=0,
    tr=0, vd=0, ca=0, ir=0, k=0,
):
    return Nutrition(cal, p, c, fi, f, sf, su, ad, so, ch, tr, vd, ca, ir, k)


USDA = "USDA FoodData Central SR Legacy"
PACKAGE = "PRPD-transcribed current package label"
MANUFACTURER = "Current manufacturer nutrition page"
WORKING = "Working estimate from closest available product/database record"


# Unless the basis says "each", values are per 100 g. Energy reported by USDA in
# kJ was converted to kcal using 1 kcal = 4.184 kJ.
INGREDIENTS: dict[str, Ingredient] = {
    "chicken_thigh_cooked": Ingredient("Chicken thigh, meat only, roasted", n(179.25, 24.8, 0, 0, 8.15, 2.31, 0, 0, 106, 133), "100g", f"{USDA}, FDC 172388"),
    "leg_quarter_cooked": Ingredient("Chicken leg quarter, edible meat and skin, roasted", n(190.49, 23.4, 0, 0, 10.2, 2.74, 0, 0, 123, 130), "100g", f"{USDA}, modeled from comparable roasted dark meat and skin", "low", "Piece size and bone percentage vary; record actual raw piece weight and cooked edible yield."),
    "beef_90_baked": Ingredient("Ground beef 90/10, loaf, baked", n(214, 26.6, 0, 0, 11.1, 4.38, 0, 0, 61, 88), "100g", f"{USDA}, FDC 171795"),
    "beef_90_pan": Ingredient("Ground beef 90/10, crumbles, pan-browned", n(230, 28.4, 0, 0, 12.0, 4.71, 0, 0, 87, 89), "100g", f"{USDA}, FDC 171794"),
    "egg": Ingredient("Whole egg", n(71.5, 6.3, 0.36, 0, 4.76, 1.57, 0.19, 0, 71, 186), "each (50g edible)", f"{USDA}, FDC 171287"),
    "egg_white": Ingredient("Liquid egg white", n(51.6, 10.9, 0.73, 0, 0.17, 0, 0.71, 0, 166, 0), "100g", f"{USDA}, FDC 172183; calories/protein agree with PRPD package"),
    "potato": Ingredient("Potato, flesh and skin, raw", n(77, 2.05, 17.5, 2.1, 0.09, 0.025, 0.82, 0, 6, 0), "100g", f"{USDA}, FDC 170026"),
    "broccoli": Ingredient("Broccoli, raw", n(33.7, 2.82, 6.64, 2.6, 0.37, 0.114, 1.7, 0, 33, 0), "100g", f"{USDA}, FDC 170379"),
    "spinach": Ingredient("Spinach, raw", n(23, 2.86, 3.63, 2.2, 0.39, 0.063, 0.42, 0, 79, 0), "100g", f"{USDA}, FDC 168462"),
    "tomato": Ingredient("Tomato, raw", n(18, 0.88, 3.89, 1.2, 0.2, 0.028, 2.63, 0, 5, 0), "100g", f"{USDA}, FDC 170457"),
    "onion": Ingredient("Onion, raw", n(40, 1.1, 9.34, 1.7, 0.1, 0.042, 4.24, 0, 4, 0), "100g", f"{USDA}, FDC 170000"),
    "jalapeno": Ingredient("Jalapeno, raw", n(28.4, 0.91, 6.5, 2.8, 0.37, 0.092, 4.12, 0, 3, 0), "100g", f"{USDA}, FDC 168576"),
    "lettuce": Ingredient("Green leaf lettuce, raw", n(15, 1.36, 2.87, 1.3, 0.15, 0.02, 0.78, 0, 28, 0), "100g", f"{USDA}, FDC 169249"),
    "corn": Ingredient("Sweet yellow corn, cooked, no salt", n(96, 3.41, 21, 2.4, 1.5, 0.197, 4.54, 0, 1, 0), "100g", f"{USDA}, FDC 169999"),
    "strawberry": Ingredient("Strawberries, raw", n(32, 0.67, 7.68, 2.0, 0.3, 0.015, 4.89, 0, 1, 0), "100g", f"{USDA}, FDC 167762"),
    "banana": Ingredient("Banana, raw", n(88.7, 1.09, 22.8, 2.6, 0.33, 0.112, 12.2, 0, 1, 0), "100g", f"{USDA}, FDC 173944"),
    "garlic": Ingredient("Garlic, raw", n(149, 6.36, 33.1, 2.1, 0.5, 0.089, 1.0, 0, 17, 0), "100g", USDA),
    "ginger": Ingredient("Ginger root, raw", n(80, 1.82, 17.8, 2.0, 0.75, 0.203, 1.7, 0, 13, 0), "100g", USDA),
    "lime": Ingredient("Lime juice, raw", n(25, 0.42, 8.42, 0.4, 0.07, 0.012, 1.69, 0, 2, 0), "100g", USDA),
    "lemon": Ingredient("Lemon juice, raw", n(22, 0.35, 6.9, 0.3, 0.24, 0.04, 2.52, 0, 1, 0), "100g", USDA),
    "cilantro": Ingredient("Cilantro, raw", n(23, 2.13, 3.67, 2.8, 0.52, 0.014, 0.87, 0, 46, 0), "100g", USDA),
    "pickles": Ingredient("Drained mixed pickled vegetables", n(15, 0.5, 3.0, 1.2, 0.1, 0.02, 1.5, 0, 700, 0), "100g", WORKING, "low", "Sodium varies substantially by brine and draining."),
    "rice_dry": Ingredient("PRPD basmati/white rice, dry", n(355, 6.75, 78, 1.0, 0.7, 0.18, 0.1, 0, 5, 0), "100g", f"{PACKAGE} for calories/protein; USDA FDC 169756 for remaining fields", "medium"),
    "bread_slice": Ingredient("French toast bread", n(80, 3, 15, 1, 1, 0, 0.5, 0.5, 230, 0), "each (32g)", PACKAGE, "high", "Sugars and added sugars are recorded as 0.5g because the label states less than 1g."),
    "shawarma_bread": Ingredient("Shawarma bread", n(240, 8, 48, 0, 0, 0, 0, 0, 340, 0), "each", PACKAGE, "medium", "Sugars and saturated fat were not present in the transcription and remain provisional zeros."),
    "small_tortilla": Ingredient("Mission Carb Balance small tortilla", n(70, 6, 19, 15, 2.5, 0, 0, 0, 320, 0), "each", f"{MANUFACTURER}; PRPD package record", "medium", "One standard small tortilla used only for Lean breakfast builds; confirm the physical package before final label printing."),
    "fajita_tortilla": Ingredient("Mission Carb Balance Fajita flour tortilla", n(45, 4, 12, 11, 2, 1, 0, 0, 220, 0), "each", "Mission Carb Balance Fajita Flour Tortillas current 8-count package listing; H-E-B product 1528858", "high", "One 28g tortilla used only for the Mini Chicken Snack Wrap. Contains wheat. Confirm the physical package still matches before final label printing."),
    "large_tortilla": Ingredient("Mission Carb Balance large tortilla", n(110, 10, 31, 28, 3.5, 0, 0, 0, 580, 0), "each", f"{PACKAGE} for calories/protein/fiber; remaining fields working estimate", "low"),
    "fage": Ingredient("FAGE Total 0%", n(52.9412, 10.5882, 2.9412, 0, 0, 0, 2.9412, 0, 38.2353, 5.8824), "100g", MANUFACTURER),
    "simple_truth_yogurt": Ingredient("Simple Truth nonfat Greek yogurt", n(64.7059, 10.5882, 4.1176, 0, 0, 0, 3.5294, 0, 50, 5.8824), "100g", "Current Kroger/Fred Meyer product page"),
    "cottage": Ingredient("H-E-B fat-free cottage cheese", n(72.727, 10.909, 4.545, 0, 0, 0, 3.636, 0, 363.636, 4.545, 0, 0, 90.909, 0, 118.182), "100g", "H-E-B current manufacturer nutrition page", "high"),
    "mozzarella": Ingredient("H-E-B fat-free mozzarella", n(142.857, 32.143, 3.571, 0, 0, 0, 0, 0, 750, 17.857, 0, 0, 964.286, 0.357, 107.143), "100g", "H-E-B current manufacturer nutrition page", "high"),
    "fairlife_milk": Ingredient("Fairlife fat-free ultra-filtered milk", n(33.333, 5.417, 2.5, 0, 0, 0, 2.5, 0, 50, 2.083, 0, 2.083, 158.333, 0, 0), "100g", MANUFACTURER, "high", "Per 240mL: 80 calories, 13g protein, 6g carbohydrate, 120mg sodium, 5mg cholesterol, 5mcg vitamin D, and 380mg calcium."),
    "whey": Ingredient("Premier Protein powder, vanilla/chocolate", n(384.615, 76.923, 7.692, 0, 5.128, 2.564, 2.564, 0, 435.897, 141.026, 0, 0, 410.256, 0, 410.256), "100g", "User-supplied Premier Protein label; vanilla and chocolate treated identically", "high", "Per 39g: 150 calories, 30g protein, 2g fat, 3g carbohydrate, 170mg sodium, 55mg cholesterol, 160mg calcium, and 160mg potassium."),
    "whipped_cream": Ingredient("Sugar-free whipped cream", n(150, 2, 10, 0, 12, 8, 3, 0, 80, 45, 0.4, 0.2, 75, 0.05, 100), "100g", WORKING, "medium", "Generic sugar-free dairy whipped topping estimate; only 10g is used per French Toast meal."),
    "butter": Ingredient("Butter", n(717, 0.85, 0.06, 0, 81.1, 51.4, 0.06, 0, 643, 215), "100g", USDA),
    "avocado_oil": Ingredient("Avocado oil", n(884, 0, 0, 0, 100, 11.6, 0, 0, 0, 0), "100g", WORKING, "medium"),
    "brown_sugar": Ingredient("Brown sugar", n(380, 0, 98.1, 0, 0, 0, 97.0, 97.0, 28, 0), "100g", USDA),
    "powdered_sugar": Ingredient("Powdered sugar", n(389, 0, 100, 0, 0, 0, 97.0, 97.0, 1, 0), "100g", USDA),
    "honey": Ingredient("Honey", n(304, 0.3, 82.4, 0.2, 0, 0, 82.1, 82.1, 4, 0), "100g", USDA),
    "vanilla": Ingredient("Vanilla extract", n(288, 0.06, 12.65, 0, 0.06, 0.01, 12.65, 0, 9, 0), "100g", USDA),
    "cinnamon": Ingredient("Ground cinnamon", n(247, 3.99, 80.6, 53.1, 1.24, 0.35, 2.17, 0, 10, 0), "100g", USDA),
    "tomato_paste": Ingredient("Tomato paste", n(82, 4.32, 18.9, 4.1, 0.47, 0.1, 12.2, 0, 59, 0), "100g", USDA),
    "broth": Ingredient("Prepared chicken/beef broth", n(5, 0.6, 0.4, 0, 0.2, 0.06, 0.2, 0, 333, 0), "100g", WORKING, "low", "Sodium is brand-dependent."),
    "light_mayo": Ingredient("Great Value light mayonnaise", n(233.333, 0, 6.6667, 0, 23.3333, 3.3333, 0, 0, 733.333, 26.6667), "100g", "Current Walmart product listing"),
    "salsa": Ingredient("Prepared salsa", n(33.333, 1, 6.667, 2.0, 0, 0, 3.333, 0, 600, 0), "100g", WORKING, "low"),
    "buffalo_sauce": Ingredient("Buffalo sauce", n(0, 0, 0, 0, 0, 0, 0, 0, 3067, 0), "100g", "Working Frank's-style sauce estimate", "low", "Exact brand is essential for sodium."),
    "cotija": Ingredient("Cotija cheese", n(366, 20, 4, 0, 30, 18, 1, 0, 1400, 100), "100g", WORKING, "low"),
    "sweet_chili": Ingredient("G Hughes sugar-free sweet chili", n(16.6667, 0, 6.6667, 0, 0, 0, 0, 0, 833.333, 0), "100g", "Current Kroger product page"),
    "soy_sauce": Ingredient("Low-sodium soy sauce", n(66.667, 6.667, 6.667, 0, 0, 0, 0.667, 0, 3933.333, 0), "100g", WORKING, "low"),
    "ketchup": Ingredient("Ketchup", n(100, 0, 26.667, 0, 0, 0, 21.333, 21.333, 1066.667, 0), "100g", WORKING, "low"),
    "mustard": Ingredient("Yellow mustard", n(60, 4, 6, 4, 4, 0.2, 0, 0, 1100, 0), "100g", WORKING, "low"),
    "protein_pasta": Ingredient("Kroger protein pasta", n(302.6316, 23.6842, 51.3158, 10.5263, 4.6053, 0.6579, 2.6316, 0, 0, 0), "100g", f"{PACKAGE} for calories/protein; remaining fields working estimate", "medium"),
    "crushed_tomatoes": Ingredient("Canned crushed tomatoes", n(23.3333, 1.0, 4.6667, 1.3333, 0.2, 0, 3.0, 0, 140, 0), "100g", f"{PACKAGE} for calories; remaining fields working estimate", "medium"),
    "breadcrumbs": Ingredient("Seasoned dry breadcrumbs", n(360, 12, 70, 4, 5, 1, 7, 3, 1467, 0), "100g", WORKING, "low"),
    "paprika": Ingredient("Paprika", n(282, 14.1, 54.0, 34.9, 12.9, 2.14, 10.3, 0, 68, 0), "100g", USDA),
    "cumin": Ingredient("Ground cumin", n(375, 17.8, 44.2, 10.5, 22.3, 1.54, 2.25, 0, 168, 0), "100g", USDA),
    "chili_powder": Ingredient("Chili powder", n(282, 13.5, 49.7, 34.8, 14.3, 2.46, 7.2, 0, 2867, 0), "100g", USDA),
    "cocoa": Ingredient("Hershey's natural unsweetened cocoa", n(200, 10, 60, 40, 10, 0, 0, 0, 0, 0), "100g", "Hershey SmartLabel", "medium", "Protein label is <1g per 5g; 0.5g is used."),
    "oreo_thin": Ingredient("Oreo Thin", n(35, 0.25, 5.25, 0.25, 1.5, 0.5, 3, 3, 23.75, 0), "each", MANUFACTURER),
    "ladyfingers": Ingredient("Ladyfinger cookies", n(350, 7.5, 75, 1, 5, 1.5, 40, 40, 120, 45), "100g", WORKING, "low", "Exact package label is required."),
    "philadelphia_no_bake": Ingredient("Philadelphia no-bake cheesecake filling", n(279.07, 3.49, 22.09, 0, 19.77, 12.79, 19.77, 19.77, 197.67, 34.88), "100g", "Product listing: 240 calories per 86g; remaining fields estimated from closest product", "low"),
    "mascarpone": Ingredient("Mascarpone", n(429, 3.6, 3.6, 0, 42.9, 28.6, 3.6, 0, 50, 100), "100g", WORKING, "low", "Exact product label is required."),
    "maple_syrup": Ingredient("Great Value reduced-calorie sugar-free syrup", n(25, 0, 10, 0, 0, 0, 0, 0, 200, 0), "100g", "Current Walmart product page; 15 calories per 60mL serving", "medium", "A 30g side cup is modeled as one-half serving."),
    "salt": Ingredient("Table salt", n(0, 0, 0, 0, 0, 0, 0, 0, 39300, 0), "100g", USDA, "high"),
}


# Supplemental label nutrients. Values are in each ingredient's existing basis:
# per 100g unless the ingredient basis says "each". Exact package data is used
# where available; otherwise USDA SR Legacy or a close generic product estimate
# is used. A zero means a defensible estimated zero, not a laboratory finding.
SUPPLEMENTAL_NUTRIENTS = {
    "chicken_thigh_cooked": (0.044, 0.2, 9, 1.13, 269),
    "leg_quarter_cooked": (0.055, 0.1, 11, 1.11, 247),
    "beef_90_baked": (0.373, 0, 13, 2.89, 300),
    "beef_90_pan": (0.359, 0, 16, 3.08, 433),
    "egg": (0.019, 1.0, 28, 0.875, 69),
    "egg_white": (0, 0, 7, 0.08, 163),
    "potato": (0, 0, 12, 0.81, 425),
    "broccoli": (0, 0, 47, 0.73, 316),
    "spinach": (0, 0, 99, 2.71, 558),
    "tomato": (0, 0, 10, 0.27, 237),
    "onion": (0, 0, 23, 0.21, 146),
    "jalapeno": (0, 0, 12, 0.25, 248),
    "lettuce": (0, 0, 36, 0.86, 194),
    "corn": (0, 0, 3, 0.45, 218),
    "strawberry": (0, 0, 16, 0.41, 153),
    "banana": (0, 0, 5, 0.26, 358),
    "garlic": (0, 0, 181, 1.7, 401),
    "ginger": (0, 0, 16, 0.6, 415),
    "lime": (0, 0, 14, 0.09, 117),
    "lemon": (0, 0, 6, 0.08, 103),
    "cilantro": (0, 0, 67, 1.77, 521),
    "pickles": (0, 0, 57, 0.26, 117),
    "rice_dry": (0, 0, 28, 0.8, 115),
    "bread_slice": (0, 0, 30, 0.9, 30),
    "shawarma_bread": (0, 0, 40, 2.5, 100),
    "small_tortilla": (0, 0, 80, 1.2, 40),
    "large_tortilla": (0, 0, 130, 2.0, 65),
    "fage": (0, 0, 117.647, 0, 141.176),
    "simple_truth_yogurt": (0, 0, 117.647, 0, 141.176),
    "butter": (3.278, 0, 24, 0.02, 24),
    "avocado_oil": (0, 0, 0, 0, 0),
    "brown_sugar": (0, 0, 83, 0.71, 133),
    "powdered_sugar": (0, 0, 1, 0.06, 2),
    "honey": (0, 0, 6, 0.42, 52),
    "vanilla": (0, 0, 11, 0.12, 148),
    "cinnamon": (0, 0, 1002, 8.32, 431),
    "tomato_paste": (0, 0, 36, 2.98, 1014),
    "broth": (0, 0, 4, 0.07, 18),
    "light_mayo": (0, 0, 8, 0.2, 30),
    "salsa": (0, 0, 30, 0.42, 275),
    "buffalo_sauce": (0, 0, 0, 0.1, 30),
    "cotija": (1.0, 0.5, 700, 0.5, 90),
    "sweet_chili": (0, 0, 0, 0, 20),
    "soy_sauce": (0, 0, 30, 1.35, 352),
    "ketchup": (0, 0, 15, 0.35, 281),
    "mustard": (0.009, 0, 63, 1.61, 152),
    "protein_pasta": (0, 0, 50, 2.5, 300),
    "crushed_tomatoes": (0, 0, 25, 1.0, 300),
    "breadcrumbs": (0, 0, 140, 4.5, 250),
    "paprika": (0, 0, 229, 21.14, 2280),
    "cumin": (0, 0, 931, 66.36, 1788),
    "chili_powder": (0, 0, 330, 17.3, 1950),
    "cocoa": (0, 0, 128, 13.86, 1524),
    "oreo_thin": (0, 0, 2.5, 0.35, 10),
    "ladyfingers": (0, 0, 47, 3.58, 113),
    "philadelphia_no_bake": (0.6, 0, 80, 0.2, 120),
    "mascarpone": (1.2, 0.2, 120, 0.2, 130),
    "maple_syrup": (0, 0, 0, 0, 0),
    "salt": (0, 0, 0, 0, 0),
}

for key, values in SUPPLEMENTAL_NUTRIENTS.items():
    nutrient = INGREDIENTS[key].nutrition
    nutrient.trans_fat, nutrient.vitamin_d, nutrient.calcium, nutrient.iron, nutrient.potassium = values


def p(key: str, amount: float, unit: str = "g", note: str = "") -> Portion:
    return Portion(key, amount, unit, note)


def build(portions: Iterable[Portion], assumptions: Iterable[str], confidence: str) -> Build:
    return Build(list(portions), list(assumptions), confidence)


def chicken_thigh(raw_g: float) -> Portion:
    return p("chicken_thigh_cooked", raw_g * 0.75, note=f"{raw_g:g}g raw at 75% cooked yield")


def beef_baked(raw_g: float) -> Portion:
    # USDA Cooking Yield Data for Meat and Poultry reports 72% yield for
    # low-fat (<12%) ground-beef loaf. Use that until PRPD records its own yield.
    return p("beef_90_baked", raw_g * 0.72, note=f"{raw_g:g}g raw at 72% cooked yield")


def beef_pan(raw_g: float) -> Portion:
    # USDA reports 69% yield for low-fat (<12%) ground-beef crumbles.
    return p("beef_90_pan", raw_g * 0.69, note=f"{raw_g:g}g raw at 69% cooked/drained yield")


def common_french_sides() -> list[Portion]:
    return [
        p("strawberry", 50), p("banana", 40), p("whipped_cream", 10),
        p("maple_syrup", 30, note="one 30g side cup"),
    ]


def french_custard(multiplier: float) -> list[Portion]:
    return [
        p("egg", 1 * multiplier, "each"), p("egg_white", 75 * multiplier),
        p("cottage", 75 * multiplier), p("fairlife_milk", 40 * multiplier),
        p("whey", 8.7 * multiplier), p("brown_sugar", 12 * multiplier),
        p("vanilla", 2.5 * multiplier), p("cinnamon", 1.3 * multiplier),
        p("avocado_oil", 1 * multiplier, note="unmeasured spray; 1g per four-slice batch assumed"),
    ]


def egg_bites(tier: str) -> Build:
    if tier == "lean":
        portions = [p("egg", 3, "each"), p("egg_white", 90), p("cottage", 75), p("mozzarella", 38), p("spinach", 30), p("tomato", 25), p("onion", 20), p("jalapeno", 15), p("potato", 120), p("avocado_oil", 3), p("salt", 0.75)]
        note = "White onion was not weighed; 20g, 3g retained oil, and 0.75g salt are working assumptions."
    else:
        portions = [p("egg", 4, "each"), p("egg_white", 130), p("cottage", 113), p("mozzarella", 56), p("spinach", 30), p("tomato", 25), p("onion", 20), p("jalapeno", 15), p("potato", 150), p("avocado_oil", 4), p("salt", 1)]
        note = "White onion was not weighed; 20g, 4g retained oil, and 1g salt are working assumptions."
    return build(portions, [note, "Garlic powder and pepper are nutritionally immaterial working exclusions."], "medium")


def quesadilla(tier: str) -> Build:
    is_lean = tier == "lean"
    portions = [
        chicken_thigh(120 if is_lean else 200),
        p("small_tortilla" if is_lean else "large_tortilla", 2, "each"),
        p("egg", 2, "each"), p("egg_white", 61.3), p("mozzarella", 56),
        p("fage", 30), p("salsa", 30), p("salt", 0.75 if is_lean else 1),
    ]
    return build(portions, ["Four tablespoons egg whites treated as 61.3g.", "Salsa is 30g; dry-pan cooking and 0.75g/1g Lean/Bulk salt are modeled."], "medium")


def burrito(tier: str) -> Build:
    is_lean = tier == "lean"
    portions = [
        beef_pan(120 if is_lean else 180),
        p("small_tortilla" if is_lean else "large_tortilla", 2, "each"),
        p("egg", 2, "each"), p("egg_white", 61.3),
        p("mozzarella", 28 if is_lean else 42), p("tomato_paste", 16),
        p("broth", 30), p("onion", 25), p("salt", 0.75 if is_lean else 1),
    ]
    return build(portions, ["Onion assumed at 25g.", "Dry-pan grilling and 0.75g/1g Lean/Bulk salt are modeled."], "medium")


def halal_cart(tier: str) -> Build:
    portions = [chicken_thigh(235 if tier == "lean" else 330), p("rice_dry", 40), p("lettuce", 30), p("tomato", 50), p("salt", 0.75 if tier == "lean" else 1)]
    # 30g of a 136g sauce batch: 100g Fage, 15g light mayo, 6g garlic, 15g lemon.
    portions += [p("fage", 22.06), p("light_mayo", 3.31), p("garlic", 1.32), p("lemon", 3.31)]
    return build(portions, ["White sauce portion is assumed at 30g from the documented 136g batch.", "Rice oil is excluded; 0.75g/1g Lean/Bulk salt is modeled."], "medium")


def loaded_buffalo(tier: str) -> Build:
    return build([
        chicken_thigh(225 if tier == "lean" else 330), p("potato", 300),
        p("broccoli", 80), p("buffalo_sauce", 60), p("avocado_oil", 4),
        p("salt", 0.5 if tier == "lean" else 0.75),
    ], ["Four tablespoons buffalo sauce treated as 60g.", "Four grams retained roasting oil and 0.5g/0.75g Lean/Bulk salt are modeled."], "medium")


def peri_peri(tier: str) -> Build:
    edible = 215 if tier == "lean" else 286
    # Half of the documented sauce is treated as retained after rack roasting.
    portions = [p("leg_quarter_cooked", edible), p("rice_dry", 40), p("jalapeno", 3.5), p("garlic", 3), p("lemon", 11.25), p("paprika", 3.4), p("chili_powder", 0.675), p("cumin", 0.525), p("avocado_oil", 7), p("salt", 0.75 if tier == "lean" else 1)]
    return build(portions, ["Uses working edible cooked weights of 215g/286g for bone-in leg quarters.", "Raw production uses a provisional 50% edible cooked yield and approximately 400g per purchased leg quarter.", "Fifty percent of the peri sauce and oil is assumed retained after rack roasting.", "0.75g/1g Lean/Bulk salt is modeled."], "low")


def butter_chicken(tier: str) -> Build:
    portions = [
        chicken_thigh(225 if tier == "lean" else 330), p("rice_dry", 40),
        p("onion", 50), p("tomato_paste", 32), p("broth", 120),
        p("butter", 14), p("fage", 30), p("fage", 15), p("lemon", 3.75),
        p("garlic", 3), p("ginger", 2.5), p("salt", 0.75 if tier == "lean" else 1),
    ]
    return build(portions, ["Only 25% of the documented 60g yogurt marinade is counted after scraping.", "The full 14g butter and sauce formula are treated as one meal's portion.", "0.75g/1g Lean/Bulk salt is modeled; tiny spice calories remain excluded."], "low")


def streetcorn(tier: str) -> Build:
    if tier == "lean":
        portions = [chicken_thigh(200), p("rice_dry", 40), p("corn", 88), p("onion", 10), p("jalapeno", 4), p("fage", 25), p("light_mayo", 7), p("cotija", 10), p("cilantro", 3), p("lime", 10), p("avocado_oil", 2), p("salt", 0.5)]
    else:
        portions = [chicken_thigh(275), p("rice_dry", 55), p("corn", 110), p("onion", 12), p("jalapeno", 5), p("fage", 30), p("light_mayo", 7), p("cotija", 12), p("cilantro", 4), p("lime", 12), p("avocado_oil", 3), p("salt", 0.75)]
    return build(portions, ["0.5g/0.75g Lean/Bulk salt is modeled; Tajin and garlic powder remain small working exclusions.", "Draft corn formula has not been kitchen-tested."], "medium")


def seekh(tier: str) -> Build:
    raw_beef = 170 if tier == "lean" else 210
    bread = 1 if tier == "lean" else 1.5
    portions = [
        beef_baked(raw_beef), p("shawarma_bread", bread, "each"),
        p("lettuce", 25), p("onion", 15), p("pickles", 30 if tier == "lean" else 45),
        p("fage", 22), p("light_mayo", 3.3), p("garlic", 1.3), p("lemon", 3.3),
        p("avocado_oil", raw_beef * 14 / 1000), p("onion", raw_beef * 110 / 1000),
        p("garlic", raw_beef * 12 / 1000), p("paprika", raw_beef * 4.6 / 1000),
        p("cumin", raw_beef * 4.2 / 1000), p("chili_powder", raw_beef * 2.7 / 1000),
        p("salt", 0.75 if tier == "lean" else 1),
    ]
    return build(portions, ["Beef yield is estimated at 72% from USDA low-fat ground-beef loaf guidance.", "One 30g white-garlic sauce serving is used because the rotating two-sauce portions are not yet measured.", "Pickle sodium and 0.75g/1g Lean/Bulk salt are modeled estimates."], "medium")


def meatball_pasta(tier: str) -> Build:
    raw_beef = 165 if tier == "lean" else 220
    pasta_g = 65 if tier == "lean" else 76
    portions = [
        beef_baked(raw_beef), p("protein_pasta", pasta_g), p("crushed_tomatoes", 150),
        p("garlic", 18), p("tomato_paste", 16), p("mozzarella", 28), p("onion", 50),
        p("egg", raw_beef / 100 * 0.25, "each"), p("breadcrumbs", raw_beef / 100 * 3.75),
        p("salt", 0.75 if tier == "lean" else 1),
    ]
    return build(portions, ["One garlic clove is treated as 3g.", "Half tablespoon breadcrumbs treated as 3.75g per 100g beef.", "No cooking oil is counted; 0.75g/1g Lean/Bulk salt is modeled."], "medium")


def halal_boy(tier: str) -> Build:
    raw_beef = 210 if tier == "lean" else 300
    portions = [
        beef_pan(raw_beef), p("rice_dry", 40), p("sweet_chili", 30), p("soy_sauce", 15),
        p("tomato", 50), p("mozzarella", 30), p("lettuce", 30), p("onion", 25),
        p("garlic", 6), p("light_mayo", 15), p("ketchup", 15), p("mustard", 5),
        p("salt", 0.75 if tier == "lean" else 1),
    ]
    return build(portions, ["Side cups assumed at 15g mayo, 15g ketchup, and 5g mustard.", "0.75g/1g Lean/Bulk salt is modeled."], "low")


def cheesecake() -> Build:
    return build([
        p("ladyfingers", 26), p("butter", 4), p("philadelphia_no_bake", 32),
        p("simple_truth_yogurt", 70), p("whey", 11.6), p("vanilla", 1.5),
        p("strawberry", 40),
    ], ["Zero-calorie monk-fruit sweetener and water contribute no declared energy.", "Original supplied recipe total is retained as a cross-check; ladyfinger and filling sub-values are provisional."], "medium")


def mousse(protein_powder_g: float) -> Build:
    return build([
        p("fage", 200), p("whey", protein_powder_g), p("cocoa", 10),
        p("honey", 7), p("oreo_thin", 2, "each"),
    ], [f"Protein powder modeled at {protein_powder_g:g}g.", "The current taste-approved recipe uses 19.5g Premier Protein powder."], "medium")


def tiramisu() -> Build:
    # Entire formula makes three cups; every amount below is divided by three.
    return build([
        p("mascarpone", 30), p("fage", 100), p("cottage", 30), p("whey", 17.5 / 3),
        p("powdered_sugar", 10), p("vanilla", 5 / 3), p("ladyfingers", 30),
        p("brown_sugar", 3), p("cocoa", 1), p("powdered_sugar", 2),
    ], ["Calculated as one-third of the current three-cup test formula.", "Mascarpone and ladyfinger labels are provisional; recipe is untested."], "low")


MEALS = [
    Meal("b1", "Egg Bites", egg_bites("lean"), egg_bites("bulk"), (440,48,24,0,16), (615,69,30,0,24), "Current portion, unverified oil/yield", "Keep recipe; replace published totals with audited working values after one tray yield check."),
    Meal("b2", "French Toast", build(french_custard(.75)+[p("bread_slice",3,"each")]+common_french_sides(), ["Lean receives 75% of the confirmed four-slice custard unit.", "Sugar-free syrup not included; oil spray modeled at 0.75g."], "medium"), build(french_custard(1)+[p("bread_slice",4,"each")]+common_french_sides(), ["Bulk receives the confirmed four-slice custard unit.", "Sugar-free syrup not included; oil spray modeled at 1g."], "medium"), (520,40,62,3,12), (650,52,76,4,14), "Fresh taste approved", "Calories are close; lower the displayed protein to the recalculated value unless the custard changes."),
    Meal("b3", "Breakfast Quesadilla", quesadilla("lean"), quesadilla("bulk"), (553,77,26,0,16), (729,102,32,0,21), "Historical/current build", "Keep build; current protein is slightly overstated and fiber is materially omitted."),
    Meal("b4", "Grilled Cheese Breakfast Burrito", burrito("lean"), burrito("bulk"), (557,64,32,0,19), (749,89,40,0,26), "Historical/current build", "Keep build; published calories are modestly low, especially Bulk."),
    Meal("m1", "Butter Chicken", butter_chicken("lean"), butter_chicken("bulk"), (484,57,44,0,12), (600,76,48,0,15), "Formula interpretation unresolved", "Do not publish a final label until the sauce recipe's batch yield is confirmed; if the listed sauce is per meal, current calories are substantially low."),
    Meal("m2", "Halal Cart Chicken + Yellow Rice", halal_cart("lean"), halal_cart("bulk"), (500,58,44,0,11), (605,78,48,0,14), "Historical/current build", "Current calories are close; protein is overstated because cooked chicken yield was not handled consistently."),
    Meal("m3", "Loaded Buffalo Chicken Potato", loaded_buffalo("lean"), loaded_buffalo("bulk"), (605,68,48,0,16), (720,86,52,0,20), "Historical/current build", "Calories are close; protein is materially overstated and sodium needs the actual Buffalo sauce label."),
    Meal("m4", "Peri Peri Chicken", peri_peri("lean"), peri_peri("bulk"), (560,62,42,0,18), (690,81,45,0,24), "Leg-quarter yield estimate required", "Weigh representative raw leg quarters, cooked bone-in pieces, edible meat, and retained sauce once; current nutrition remains a working estimate."),
    Meal("m5", "Mexican Streetcorn Chicken Bowl", streetcorn("lean"), streetcorn("bulk"), (530,54,44,0,10), (660,73,58,0,12), "Draft", "Lean needs a small calorie increase; Bulk is understated by roughly one meal component."),
    Meal("m6", "Beef Seekh Kabab Shawarma", seekh("lean"), seekh("bulk"), (505,48,36,0,18), (605,60,37,0,23), "Fresh taste approved; revised Bulk portion", "Use 210g raw seekh mixture across 1.5 breads for Bulk; verify even filling, cooked yield, and sauce grams once before label lock."),
    Meal("m7", "Meatball Arrabbiata Pasta", meatball_pasta("lean"), meatball_pasta("bulk"), (660,72,52,0,20), (775,86,58,0,24), "Revised tier portions", "Use 165g beef and 65g dry pasta Lean; use 220g beef and 76g dry pasta Bulk. Verify meatball count, cooked yield, and package labels once before label lock."),
    Meal("m8", "Boy Kibble", halal_boy("lean"), halal_boy("bulk"), (545,56,46,0,17), (660,69,50,0,21), "Historical/current build", "Current calories omit a meaningful portion of beef/sides; weigh sauce cups before label printing."),
    Meal("d1", "Strawberry Cheesecake", cheesecake(), None, (280,24,18,4,6), None, "Approved base with protein adaptation", "Use the supplied recipe cross-check of about 314 calories and 21g protein; current website values are not supported."),
    Meal("d2", "Chocolate Oreo Mousse", mousse(19.5), None, (281,38,18,0,6), None, "Taste approved; 19.5g Premier Protein portion confirmed", "Use 19.5g Premier Protein powder. The current calculated estimate is about 292 calories and 38g protein."),
    Meal("d3", "High Protein Tiramisu", tiramisu(), None, (295,38,26,0,6), None, "Draft, untested", "Current three-cup formula is about 390 calories/23g protein per cup; do not print the old values."),
]


def portion_nutrition(portion: Portion) -> Nutrition:
    ingredient = INGREDIENTS[portion.ingredient]
    if portion.unit == "each":
        return ingredient.nutrition.scale(portion.amount)
    return ingredient.nutrition.scale(portion.amount / 100)


def total(build_record: Build) -> Nutrition:
    result = Nutrition()
    for portion in build_record.portions:
        result += portion_nutrition(portion)
    return result


def rounded(value: float, digits: int = 1) -> str:
    return f"{value:.{digits}f}"


def display_value(value: float, kind: str) -> int:
    if kind == "calories":
        return int(round(value / 5) * 5)
    return int(round(value))


def result_cells(value: Nutrition) -> str:
    return " | ".join([
        str(display_value(value.calories, "calories")),
        str(display_value(value.protein, "macro")),
        str(display_value(value.carbs, "macro")),
        str(display_value(value.fiber, "macro")),
        str(display_value(value.fat, "macro")),
        str(display_value(value.saturated_fat, "macro")),
        f"{value.trans_fat:.1f}",
        str(display_value(value.sugars, "macro")),
        str(display_value(value.added_sugars, "macro")),
        str(int(round(value.sodium / 10) * 10)),
        str(int(round(value.cholesterol / 5) * 5)),
        f"{value.vitamin_d:.1f}",
        str(int(round(value.calcium / 10) * 10)),
        f"{value.iron:.1f}",
        str(int(round(value.potassium / 10) * 10)),
    ])


def tier_records(meal: Meal):
    single_item = meal.bulk is None
    return [
        ("Single" if single_item else "Lean", meal.lean, meal.current_lean),
        ("Bulk", meal.bulk, meal.current_bulk),
    ]


def decision_for(build_record: Build) -> str:
    if build_record.confidence == "low":
        return "CALCULATED ESTIMATE - confirm next cook"
    return "CALCULATED ESTIMATE - usable for draft label"


def signed(value: float, suffix: str = "") -> str:
    rounded_value = int(round(value))
    return f"{rounded_value:+d}{suffix}"


def build_report() -> str:
    lines = [
        "# PRPD Active Menu Nutrition Audit",
        "",
        "Audit date: July 14, 2026",
        "",
        "## What This Audit Means",
        "",
        "Every nutrient total below was rebuilt from the recorded ingredient quantities. Existing website values were used only for comparison. Whole-food values come from USDA FoodData Central; packaged foods use PRPD's current package transcriptions or manufacturer data where available. Remaining packaged items use close generic equivalents approved for this small-batch working system. These are calculated estimates, not laboratory results.",
        "",
        "Customer-facing recommendations are rounded to the nearest 5 calories and nearest whole gram. Sodium is rounded to the nearest 10mg and cholesterol to the nearest 5mg.",
        "",
        "## Executive Results",
        "",
        "| ID | Dish | Tier | Audited kcal | Protein | Carbs | Fiber | Fat | Current kcal/protein | Confidence |",
        "|---|---|---|---:|---:|---:|---:|---:|---|---|",
    ]
    for meal in MEALS:
        for tier_name, build_record, current in tier_records(meal):
            if build_record is None:
                continue
            value = total(build_record)
            current_text = f"{current[0]} / {current[1]}g" if current else "n/a"
            lines.append(f"| {meal.meal_id} | {meal.name} | {tier_name} | {display_value(value.calories, 'calories')} | {display_value(value.protein, 'macro')}g | {display_value(value.carbs, 'macro')}g | {display_value(value.fiber, 'macro')}g | {display_value(value.fat, 'macro')}g | {current_text} | {build_record.confidence.title()} |")

    lines += [
        "",
        "## Calorie and Protein Reconciliation",
        "",
        "A positive delta means the independently rebuilt value is higher than the live website. A negative delta means it is lower. These values can feed PRPD's clearly identified estimated labels; they should be revised whenever a recipe, portion, or product changes.",
        "",
        "| Dish | Tier | Current kcal | Audited kcal | Calorie delta | Current protein | Audited protein | Protein delta | Decision |",
        "|---|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for meal in MEALS:
        for tier_name, build_record, current in tier_records(meal):
            if build_record is None or current is None:
                continue
            value = total(build_record)
            audited_calories = display_value(value.calories, "calories")
            audited_protein = display_value(value.protein, "macro")
            lines.append(
                f"| {meal.name} | {tier_name} | {current[0]} | {audited_calories} | "
                f"{signed(audited_calories - current[0])} | {current[1]}g | {audited_protein}g | "
                f"{signed(audited_protein - current[1], 'g')} | {decision_for(build_record)} |"
            )

    lines += [
        "",
        "## Calorie Scrutiny Checks",
        "",
        "These checks are independent of the website totals and are intended to catch a plausible-looking number built from an impossible recipe.",
        "",
    ]
    half_mousse = total(mousse(19.5))
    full_mousse = total(mousse(39))
    lean_seekh = total(seekh("lean"))
    bulk_seekh = total(seekh("bulk"))
    lean_french = total(MEALS[1].lean)
    bulk_french = total(MEALS[1].bulk)
    lines += [
        f"- Chocolate Oreo Mousse: the confirmed 19.5g Premier portion = {half_mousse.calories:.1f} calories / {half_mousse.protein:.1f}g protein; the superseded 39g portion = {full_mousse.calories:.1f} calories / {full_mousse.protein:.1f}g protein. The recipe record now uses 19.5g.",
        f"- Beef Seekh Shawarma: bread alone contributes 240 calories Lean and 360 calories Bulk. The approved reduction from 255g to 210g raw Bulk seekh mixture rebuilds to {bulk_seekh.calories:.1f} calories and {bulk_seekh.protein:.1f}g protein while preserving the three-half presentation.",
        f"- French Toast: bread, the tested 12g-sugar custard, fruit, whipped cream, and a 30g sugar-free syrup cup produce {lean_french.calories:.1f} calories Lean and {bulk_french.calories:.1f} Bulk. Protein remains lower than the old published value.",
        "- Butter Chicken: the full listed butter/sauce formula was modeled per meal. If that formula is actually a multi-meal batch, divide the sauce by its finished batch yield before using the result.",
        "- Ground beef: low-fat USDA cooked yields (72% baked loaf; 69% pan-browned crumbles) replace the earlier blanket 75% assumption. PRPD's own measured cooked yield should override these estimates later.",
        "- Sodium includes a standardized 0.5g-1g added-salt estimate for savory servings. Replace that estimate with salt-per-batch divided by actual yield after the next cook.",
    ]

    lines += [
        "",
        "## Full Working Nutrient Totals",
        "",
        "| Dish | Tier | Calories | Protein g | Carbs g | Fiber g | Fat g | Sat fat g | Trans fat g | Sugars g | Added sugars g | Sodium mg | Cholesterol mg | Vitamin D mcg | Calcium mg | Iron mg | Potassium mg |",
        "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for meal in MEALS:
        for tier_name, build_record, _ in tier_records(meal):
            if build_record is None:
                continue
            lines.append(f"| {meal.name} | {tier_name} | {result_cells(total(build_record))} |")

    lines += [
        "",
        "## Nutrition Facts Field Completeness",
        "",
        "The calculator now covers every nutrient required on the standard U.S. Nutrition Facts panel. Exact package values are used where available and approved generic/database estimates are used for the remaining inputs. Labels must say that values are calculated estimates and be regenerated whenever ingredients or portions change.",
        "",
        "| Label field | Current status | What remains |",
        "|---|---|---|",
        "| Calories | Calculated estimate complete | Regenerate after portion or product changes. |",
        "| Total fat | Calculated estimate complete | Retained spray oil is modeled from the recipe record. |",
        "| Saturated fat | Calculated estimate complete | Generic equivalents remain documented in the source ledger. |",
        "| Trans fat | Calculated estimate complete | Package values and USDA data are used; tiny unknown packaged contributions are estimated as zero. |",
        "| Cholesterol | Calculated estimate complete | Package values and USDA data are used. |",
        "| Sodium | Calculated estimate complete | Includes standardized added-salt estimates; replace with weighed batch salt later. |",
        "| Total carbohydrate | Calculated estimate complete | Package values and USDA data are used. |",
        "| Dietary fiber | Calculated estimate complete | Tortilla, bread, pasta, and generic package estimates are documented. |",
        "| Total sugars | Calculated estimate complete | Package values and USDA data are used. |",
        "| Added sugars | Calculated estimate complete | Package values and generic estimates are used. |",
        "| Protein | Calculated estimate complete | Premier Protein uses the supplied 39g label. |",
        "| Vitamin D | Calculated estimate complete | Package values and USDA data are used. |",
        "| Calcium | Calculated estimate complete | Package values and USDA data are used. |",
        "| Iron | Calculated estimate complete | Package values and USDA data are used. |",
        "| Potassium | Calculated estimate complete | Package values and USDA data are used. |",
        "",
        "Result: the audit now provides complete calculated estimates for the label workflow. It is suitable for PRPD's internal small-batch label production when identified as estimated, but it is not laboratory-certified nutrition analysis.",
    ]

    lines += ["", "## Meal-by-Meal Calculation Records", ""]
    for meal in MEALS:
        lines += [f"### {meal.meal_id}: {meal.name}", "", f"Status: {meal.status}", ""]
        for tier_name, build_record, current in tier_records(meal):
            if build_record is None:
                continue
            value = total(build_record)
            lines += [f"#### {tier_name}", "", "| Ingredient | Recorded amount | Calories | Protein | Carbs | Fat | Source confidence |", "|---|---:|---:|---:|---:|---:|---|"]
            for portion in build_record.portions:
                ingredient = INGREDIENTS[portion.ingredient]
                part = portion_nutrition(portion)
                amount = f"{portion.amount:g} {portion.unit}"
                if portion.note:
                    amount += f" ({portion.note})"
                lines.append(f"| {ingredient.name} | {amount} | {rounded(part.calories)} | {rounded(part.protein)}g | {rounded(part.carbs)}g | {rounded(part.fat)}g | {ingredient.confidence.title()} |")
            lines.append(f"| **Calculated total** |  | **{rounded(value.calories)}** | **{rounded(value.protein)}g** | **{rounded(value.carbs)}g** | **{rounded(value.fat)}g** | **{build_record.confidence.title()} overall** |")
            if current:
                lines.append(f"\nCurrent website comparison: {current[0]} calories / {current[1]}g protein / {current[2]}g carbs / {current[3]}g fiber / {current[4]}g fat.")
            lines += ["", "Assumptions:"] + [f"- {assumption}" for assumption in build_record.assumptions] + [""]
        lines += [f"Recommendation: {meal.recommendation}", ""]

    lines += [
        "## Ingredient Source Ledger",
        "",
        "| Ingredient | Basis | Source | Confidence | Note |",
        "|---|---|---|---|---|",
    ]
    for ingredient in INGREDIENTS.values():
        lines.append(f"| {ingredient.name} | {ingredient.basis} | {ingredient.source} | {ingredient.confidence.title()} | {ingredient.note} |")

    lines += [
        "",
        "## Next-Cook Accuracy Upgrades",
        "",
        "1. Record rotating sauce-cup grams and photograph a label only when the purchased brand changes from this source ledger.",
        "2. Weigh retained oil or cooking spray once for egg bites/hash, potatoes, broccoli, chicken, and corn.",
        "3. Butter Chicken sauce batch yield and the number of meals that receive the listed sauce formula.",
        "4. Peri Peri cooked edible meat weight and retained marinade weight from one Lean and one Bulk meal.",
        "5. Portion Chocolate Oreo Mousse with 19.5g Premier Protein powder and record finished cup weight when convenient.",
        "6. Replace generic ladyfinger, mascarpone, Philadelphia filling, whipped cream, and shawarma-wrap estimates when convenient.",
        "7. Record salt in each full recipe batch and divide by actual yield to replace the current standardized estimate.",
        "8. Finished batch yield and finished serving/net weight for each item.",
        "",
        "## Source Notes",
        "",
        "- USDA FoodData Central records cited in the ingredient ledger were queried July 14, 2026.",
        "- Chicken remains at PRPD's documented approximately 75% cooked yield until an actual kitchen yield is recorded.",
        "- For 90/10 ground beef, the calculator uses USDA's more specific 72% baked-loaf yield and 69% pan-browned-crumbles yield.",
        "- Manufacturer/package values override generic food-database values when the exact current product is known.",
        "- Calories printed on a package are retained even when 4/4/9 arithmetic differs because fiber treatment and label rounding can cause legitimate differences.",
        "",
        "## Reference URLs",
        "",
        "- USDA FoodData Central: https://fdc.nal.usda.gov/",
        "- USDA Cooking Yield Data for Meat and Poultry: https://www.ars.usda.gov/ARSUserFiles/80400525/Data/retn/USDA_CookingYields_MeatPoultry.pdf",
        "- FAGE Total 0%: https://usa.fage/products/yogurt/fage-total-0",
        "- Mission Carb Balance Soft Taco Flour Tortillas: https://www.missionfoods.com/products/carb-balance-soft-taco-flour-tortillas",
        "- OREO Thins Original: https://www.oreo.com/products/oreo-thins-original-cookies",
        "- HERSHEY'S Natural Unsweetened Cocoa SmartLabel: https://smartlabel.hersheys.com/034000058006-0010-en-US/index.html",
        "- Premier Protein powder: user-supplied package label (39g serving, 150 calories, 30g protein)",
        "- Fairlife fat-free ultra-filtered milk: https://fairlife.com/ultra-filtered-milk/fat-free-skim-milk/",
        "- H-E-B fat-free mozzarella: https://www.heb.com/product-detail/h-e-b-fat-free-mozzarella-cheese/978138",
        "- H-E-B fat-free cottage cheese: https://www.heb.com/product-detail/h-e-b-fat-free-small-curd-cottage-cheese/314101",
        "- Great Value reduced-calorie sugar-free syrup: https://www.walmart.com/ip/10315918",
        "- Simple Truth Organic Plain Nonfat Greek Yogurt: https://www.kroger.com/p/simple-truth-organic-plain-greek-nonfat-yogurt/0001111010760",
        "- G Hughes Sugar Free Sweet Chili Sauce: https://www.kroger.com/p/g-hughes-sugar-free-sweet-chili-sauce/0002682500007",
        "- Great Value Light Mayonnaise: https://www.walmart.com/ip/17056887",
        "- FDA database-based nutrition-labeling guidance: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-guide-developing-and-using-data-bases-nutrition-labeling",
        "- FDA required nutrients and Daily Values: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    output = Path(__file__).with_name("ACTIVE_MENU_NUTRITION_AUDIT_2026-07-14.md")
    output.write_text(build_report(), encoding="utf-8")
    print(output)
    for meal in MEALS:
        lean = total(meal.lean) if meal.lean else None
        bulk = total(meal.bulk) if meal.bulk else None
        first_tier = "Single" if meal.bulk is None else "Lean"
        print(meal.meal_id, meal.name,
              f"{first_tier} {lean.calories:.1f}/{lean.protein:.1f}" if lean else "",
              f"Bulk {bulk.calories:.1f}/{bulk.protein:.1f}" if bulk else "")


if __name__ == "__main__":
    main()
