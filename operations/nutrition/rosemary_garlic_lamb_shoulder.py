"""Owner-authorized recipe-based lamb estimates, November 2, 2026.

Standalone Build-compatible recipe. Does not edit/register a live menu or shared
source catalog. Yield and nutrient retention are planning assumptions, not tests.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
import calculate_next_menu as r

NAME = "Rosemary-Garlic Lamb Shoulder"
SOURCE_RECIPE_URL = "https://www.recipetineats.com/slow-roasted-rosemary-garlic-lamb-shoulder/"
PROFILE_PATH = Path(__file__).with_name("rosemary_garlic_lamb_profiles.json")
PROFILE_DATA = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
PROFILE_PREFIX = "lamb18_"
PLANNING_YIELD_FRACTION = 700 / 1500
WHOLE_RAW_SHOULDER_G = 1800.0
WHOLE_COOKED_EDIBLE_G = WHOLE_RAW_SHOULDER_G * PLANNING_YIELD_FRACTION
GRAVY_FINISHED_G = 650.0
GRAVY_PORTION_G = 45.0
RETAINED_RENDERED_FAT_G = 28.0
PORTION_TARGETS = {
    "lean": {"meat": 160, "mash": 180, "beans": 90, "gravy": 45},
    "bulk": {"meat": 210, "mash": 240, "beans": 120, "gravy": 45},
}
# Purchased inputs for one roast. Retained rendered fat is an INTERNAL transfer,
# not an additional purchase and not charged a second time.
WHOLE_ROAST_INPUTS_G = {
    "lamb_shoulder_bone_in_raw": 1800, "avocado_oil": 28,
    "salt": 9, "black_pepper": 2, "onion": 180,
    "garlic": 65, "rosemary": 8, "water": 750, "flour": 20,
}
MASH_INPUTS_PER_420G_FINISHED = {
    "instant_potato_flakes": 59, "water": 219, "fairlife_milk": 140,
    "butter": 19, "salt": 1, "garlic_powder": 1, "rosemary": 1,
}
BEAN_INPUTS_PER_900G_FINISHED = {
    "green_beans": 1000, "avocado_oil": 25, "garlic": 15,
    "salt": 2, "black_pepper": 2,
}
# Nutrition retains all issued edible aromatics conservatively, despite straining.
# 50g whole garlic bulb is modeled as45g edible plus15g slivers in the meat.
GRAVY_NUTRITION_INPUTS_G = {
    "onion": 180, "garlic": 45, "rosemary": 6, "flour": 20,
    "rendered_lamb_fat_model": RETAINED_RENDERED_FAT_G,
}
ALLERGENS = "CONTAINS: MILK, WHEAT."
INGREDIENT_STATEMENT = (
    "lamb shoulder, water, green beans, Idahoan Original potato flakes, "
    "Fairlife fat-free milk, onion, avocado oil, butter, garlic, wheat flour, "
    "salt, rosemary, black pepper, garlic powder."
)
ASSUMPTIONS = [
    "Owner authorized recipe-based nutrition/costing without a physical shoulder test as a release blocker. No physical pass or measured yield is claimed.",
    "Cooked meat uses USDA FDC174876, NZ square-cut lamb shoulder, lean and fat, slow roasted. A cut/method proxy; supplier country and exact fat trim are unverified.",
    "Raw shopping yield700/1500=46.6667% from the recipe source; whole1800g plans840g edible. It is not the short-rib49.6% yield.",
    "Count all28g external roast avocado oil once over840g edible meat, plus28g separate retained rendered lamb fat in650g gravy. These are disjoint assumed pools; possible overlap can overstate nutrition. Alternative single-pool sensitivity removes rendered-fat contribution only.",
    "Plain cooked USDA lamb already includes its own meat fat. No second fat addition is made to that meat profile. Rendered gravy fat is separate and has zero incremental purchase cost.",
    "Finish one gravy batch to650g using water/reduction as needed; each meal receives45g, not the whole pot. Count all edible pan aromatics conservatively despite straining. Seasoning salt/pepper are allocated once to meat, not repeated in gravy.",
    "Fresh garlic nutrition uses60g edible from65g gross input. Cost uses all65g. Current catalog minced-garlic price is a disclosed proxy for whole fresh garlic; no new quote exists.",
    "Side ingredient ratios exactly match current controlled Idahoan and2g salt/kg raw-green-bean formulas. Unsalted butter follows current grocery-catalog product identity; shared generic salted-butter profile is not silently reused.",
    "All15 nutrient fields include explicit missing-field proxies in the companion profile ledger, notably rosemary sugars and butter trans fat. Recipe totals are not laboratory results.",
]

for _key, _record in PROFILE_DATA["profiles"].items():
    r.add_ingredient(
        PROFILE_PREFIX + _key, _record["name"],
        r.Nutrition(**_record["nutrition"]), source=_record["source"],
        confidence="recipe-based-owner-authorized",
        note=json.dumps(_record.get("derivedFields", {}), sort_keys=True),
        nutrition_complete=True,
    )


def _tier(tier):
    if tier not in PORTION_TARGETS:
        raise ValueError("tier must be lean or bulk")
    return PORTION_TARGETS[tier]


def _parts(formula, scale, component):
    return [r.p(PROFILE_PREFIX + key, grams * scale,
                note="component:" + component) for key, grams in formula.items()]


def rosemary_garlic_lamb_shoulder(tier: str):
    """Return existing calculate_next_menu.Build without modifying live registry."""
    t = _tier(tier)
    share = t["meat"] / WHOLE_COOKED_EDIBLE_G
    portions = _parts({"lamb_shoulder_cooked": t["meat"]}, 1, "lamb-meat")
    portions += _parts({"avocado_oil": 28, "salt": 9, "black_pepper": 2,
                        "garlic": 15, "rosemary": 2}, share, "lamb-roast-finish")
    portions += _parts(GRAVY_NUTRITION_INPUTS_G,
                       t["gravy"] / GRAVY_FINISHED_G, "lamb-pan-gravy")
    portions += _parts(MASH_INPUTS_PER_420G_FINISHED,
                       t["mash"] / 420, "lamb-idahoan-mash")
    portions += _parts(BEAN_INPUTS_PER_900G_FINISHED,
                       t["beans"] / 900, "lamb-green-beans")
    return r.build(portions, ASSUMPTIONS, "recipe-based-owner-authorized")


def raw_meat_plan(tier: str):
    t = _tier(tier)
    return {"rawEquivalentGrams": t["meat"] / PLANNING_YIELD_FRACTION,
            "cookedEdibleGrams": t["meat"],
            "assumedYieldFraction": PLANNING_YIELD_FRACTION,
            "measuredYieldFraction": None,
            "separatePurchaseReserveIncluded": False}


def grocery_allocations(tier: str):
    """Raw purchase quantities; conservatively charge the full roast/gravy inputs.

    Each portion's share of the840g output funds the same share of the entire
    roast and gravy ingredients, including surplus gravy. No gravy cost is then
    charged separately. This prevents both free surplus and double charging.
    """
    t = _tier(tier)
    result = {k: v * t["meat"] / WHOLE_COOKED_EDIBLE_G
              for k, v in WHOLE_ROAST_INPUTS_G.items()}
    for formula, scale in [(MASH_INPUTS_PER_420G_FINISHED, t["mash"] / 420),
                           (BEAN_INPUTS_PER_900G_FINISHED, t["beans"] / 900)]:
        for key, amount in formula.items():
            result[key] = result.get(key, 0) + amount * scale
    return result


def manufacturing_allocations():
    return {"wholeRoastPurchasedInputsGrams": WHOLE_ROAST_INPUTS_G,
            "modeledCookedEdibleMeatGrams": WHOLE_COOKED_EDIBLE_G,
            "gravyFinishedTargetGrams": GRAVY_FINISHED_G,
            "gravyInternalRenderedFatGrams": RETAINED_RENDERED_FAT_G,
            "gravyInternalFatIncrementalPurchaseCost": 0,
            "wholeGravyServingsAt45g": GRAVY_FINISHED_G / GRAVY_PORTION_G,
            "mashInputFor420gFinished": MASH_INPUTS_PER_420G_FINISHED,
            "beansInputFor900gFinished": BEAN_INPUTS_PER_900G_FINISHED,
            "panWaterAdjustmentGrams": "As needed; record actual, no nutrients or food cost",
            "measuredYieldFraction": None}


def nutrition(tier: str, *, single_fat_pool=False):
    result = r.active.total(rosemary_garlic_lamb_shoulder(tier))
    if single_fat_pool:
        # Lower-retention sensitivity, not the selected conservative main model.
        contribution = r.Nutrition(**PROFILE_DATA["profiles"]["rendered_lamb_fat_model"]["nutrition"]).scale(
            RETAINED_RENDERED_FAT_G * GRAVY_PORTION_G / GRAVY_FINISHED_G / 100)
        result = r.Nutrition(**{k: v - getattr(contribution, k)
                               for k, v in vars(result).items()})
    return result


def production_allocations(lean_count=0, bulk_count=0):
    """One combined manufacturing batch; tier divisions are pack-out only."""
    counts = {"lean": lean_count, "bulk": bulk_count}
    if any(not isinstance(n, int) or n < 0 for n in counts.values()):
        raise ValueError("counts must be nonnegative integers")
    totals = {}
    for tier, count in counts.items():
        for key, grams in grocery_allocations(tier).items():
            totals[key] = totals.get(key, 0) + grams * count
    raw = totals.get("lamb_shoulder_bone_in_raw", 0)
    meat = sum(PORTION_TARGETS[t]["meat"] * n for t, n in counts.items())
    roast_equivalents = raw / WHOLE_RAW_SHOULDER_G
    return {
        "counts": counts, "rawGroceryGrams": totals,
        "rawShoulderRequiredGrams": raw, "cookedEdibleRequiredGrams": meat,
        "fractional1800gRoastEquivalents": roast_equivalents,
        "whole1800gRoastsToPurchase": math.ceil(roast_equivalents),
        "wholeRoastRoundingExtraRawGrams": math.ceil(roast_equivalents) * 1800 - raw,
        "gravyBatchOutputGrams": roast_equivalents * GRAVY_FINISHED_G,
        "gravyRequiredGrams": sum(counts.values()) * GRAVY_PORTION_G,
        "assumption": "Linear recipe planning, not measured yield or a fixed oven-time promise. Whole-roast purchase rounding shown separately; no additional5% reserve included.",
    }


def cost_scenario(tier, raw_lamb_price_per_lb, catalog):
    """Use current catalog rates without changing it; retain each rate's source."""
    if raw_lamb_price_per_lb <= 0:
        raise ValueError("raw lamb price must be positive")
    entries = []
    for key, grams in grocery_allocations(tier).items():
        if key == "lamb_shoulder_bone_in_raw":
            rate = raw_lamb_price_per_lb / 453.59237
            source = "Scenario only; owner recalled7.99/lb uncertain and not species/cut-verified. No supplier quote."
            confidence = "unverified-scenario"
        else:
            row = catalog.get(key)
            if row is None and key == "rosemary":
                row = {"price": 1.98, "packageSize": 28,
                       "store": "Existing October12 short-rib costing planning allowance for28g fresh rosemary, not a receipt",
                       "confidence": "planning"}
            if row is None:
                raise KeyError("Missing cost basis for " + key)
            rate = row["price"] / row["packageSize"]
            source = row["store"]
            confidence = row["confidence"]
            if key == "garlic":
                source += "; minced-garlic price proxy for fresh whole/slivered garlic"
        entries.append({"ingredient": key, "grams": grams,
                        "usdPerGram": rate, "costUsd": grams * rate,
                        "confidence": confidence, "source": source})
    container = catalog["meal_container"]
    packaging = container["price"] / container["packageSize"]
    food = sum(e["costUsd"] for e in entries)
    total = food + packaging
    return {"rawPricePerLbUsd": raw_lamb_price_per_lb,
            "foodCostUsd": food, "packagingCostUsd": packaging,
            "directCostUsd": total, "priceAt35PercentDirectCostUsd": total / .35,
            "priceAt40PercentDirectCostUsd": total / .40,
            "renderedFatIncrementalCostUsd": 0,
            "packagingSource": container, "ingredientCosts": entries,
            "exclusions": ["owner labor", "energy", "delivery", "payment/marketing overhead",
                           "bag allocation", "whole-roast purchasing-rounding loss", "extra purchase reserve"],
            "accounting": "Full roast/gravy ingredient cost is allocated by cooked-meat share, including unused gravy. No second gravy-cost line or rendered-fat purchase charge. Per-meal food cost is recipe allocation, not rounded whole-roast cash."}
