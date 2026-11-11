"""Mango habanero wing production planning data; no completed label release.

The only piece/mass relationship is the old pilot's approximate 400g / six
split pieces. It is an explicit SHOPPING ESTIMATE, not a measured wing size,
edible-meat yield or a public Lean/Bulk nutrition claim.
"""
import calculate_next_menu as r

NAME = "Mango Habanero Chicken Wings"
SOURCE = "operations/recipes/MANGO_HABANERO_WINGS_BATCH_11_PILOT.md"
WING_KEY = "chicken_wings_raw"
SAUCE_KEY = "mango_habanero_sauce"
RANCH_KEY = "bottled_ranch"
SEASONING_COMPONENT = "wings-seasoning"
FINISH_COMPONENT = "wings-finish"
RANCH_COMPONENT = "bottled-ranch"
PIECES = {"lean": 6, "bulk": 8}
PILOT_RAW_GRAMS = 400.0
PILOT_APPROXIMATE_PIECES = 6.0
RANCH_CUP_GRAMS = 40.0
MANGO_DIP_GRAMS = 20.0
LABEL_RELEASE_HOLD = (
    "Wing size, actual raw/cooked/edible weights, "
    "mango-habanero and bottled-ranch product panels/costs and container fit are "
    "unverified. No consumer macros or complete Nutrition Facts may be released."
)
QUALITY_CHECK = (
    "Pack six individual split flats/drumettes for Lean and eight "
    "for Bulk, plus one separate 40 g NET bottled-ranch planning cup and a separate 20 g clean mango-habanero dip per box. No rice or vegetable side. "
    "Raw masses and scaled seasoning/glaze are old-pilot planning estimates, not "
    "measured piece weights or yields. Count/weigh the supplier lot, verify both "
    "sauce panels and stock, record raw/cooked output and fit, and measure 165 F "
    "away from bone. Keep ranch cold and separate. " + LABEL_RELEASE_HOLD
)

for key, name, note in (
    (WING_KEY, "Split chicken wings, raw bone-in (estimated mass; count pieces)",
     "Old pilot400 g / about 6 individual flats/drumettes only. No measured piece mass or edible yield."),
    (SAUCE_KEY, "Purchased mango-habanero wing sauce (exact bottle panel pending)",
     "Old pilot 45 g sauce per 400 g raw wings. Verify actual product and retained amount."),
    (RANCH_KEY, "Purchased bottled ranch (40 g net planning cup; exact product pending)",
     "Owner will buy bottled ranch.40 g net per cup is a planning standard, not a verified formulation or panel."),
):
    # Numeric placeholders allow ingredient scaling only. The explicit incomplete
    # flag blocks these values from becoming a fabricated complete food label.
    r.add_ingredient(
        key, name, r.n(), source=SOURCE, confidence="planning-unmeasured",
        note=note + " Nutrition unknown; zero placeholders are NOT nutrition claims.",
        nutrition_complete=False,
    )


def _tier(tier):
    value=str(tier).lower()
    if value not in PIECES:
        raise ValueError("Wings require an explicit lean or bulk tier.")
    return value


def portion_control(tier):
    tier=_tier(tier)
    pieces=PIECES[tier]
    return {
        "wingPiecesPerMeal": pieces,
        "pieceCountBasis": "individual split flats/drumettes",
        "minimumPieces": pieces,
        "rawMassPlanningGrams": pieces * PILOT_RAW_GRAMS / PILOT_APPROXIMATE_PIECES,
        "rawWeightVerified": False,
        "rawMassBasis": "Old pilot400 g / about 6 pieces; count and weigh actual purchased wings.",
        "cookedYieldVerified": False,
        "edibleMeatYieldVerified": False,
        "ranchCupsPerMeal": 1,
        "ranchCupGrams": RANCH_CUP_GRAMS,
        "mangoDipCupsPerMeal": 1,
        "mangoDipGrams": MANGO_DIP_GRAMS,
        "ranchFillPlanningOnly": True,
        "ranchProductVerified": False,
        "extraStarchOrVegetableSide": False,
    }


def production_tier_metadata(tier):
    return {
        "portionControl": portion_control(tier),
        "labelsEnabled": False,
        "nutritionComplete": False,
        "finalLabelReady": False,
        "nutritionReleaseHold": LABEL_RELEASE_HOLD,
    }


def mango_habanero_wings(tier):
    tier=_tier(tier)
    pieces=PIECES[tier]
    scale=pieces/PILOT_APPROXIMATE_PIECES
    return r.build([
        r.p(WING_KEY, PILOT_RAW_GRAMS*scale, note="component:"+SEASONING_COMPONENT,
            include_in_menu_macros=False),
        r.p("sunflower_oil",5*scale,note="component:"+SEASONING_COMPONENT),
        r.p("salt",2*scale,note="component:"+SEASONING_COMPONENT),
        r.p("paprika",2*scale,note="component:"+SEASONING_COMPONENT),
        r.p("garlic_powder",1*scale,note="component:"+SEASONING_COMPONENT),
        r.p("onion_powder",1*scale,note="component:"+SEASONING_COMPONENT),
        r.p(SAUCE_KEY,45*scale,note="component:"+FINISH_COMPONENT,
            include_in_menu_macros=False),
        r.p(SAUCE_KEY,MANGO_DIP_GRAMS,note="component:wings-extra-dip",
            include_in_menu_macros=False),
        r.p(RANCH_KEY,RANCH_CUP_GRAMS,note="component:"+RANCH_COMPONENT,
            include_in_menu_macros=False),
    ],[
        f"Owner-confirmed {tier.title()} box: at least {pieces} INDIVIDUAL flats/drumettes, not whole unsplit wings.",
        f"ESTIMATED raw bone-in planning mass {PILOT_RAW_GRAMS*scale:.1f} g from the old400 g / about 6-piece pilot. No measured piece weight or cooked/edible yield.",
        "The old pilot's oil, dry seasoning and 45 g finishing sauce scale with that provisional raw-mass estimate. Count/weigh actual wings and confirm coverage before locking production quantities.",
        "Count usable individual split pieces as a separate purchase/pack floor. The normal 5% raw-mass shopping reserve does not replace the required piece count.",
        "Pack ONE separate 40 g NET bottled-ranch planning cup and ONE separate 20 g clean mango-habanero dip per box. Product ingredients, allergens, package cost and exact filled recovery remain unverified.",
        "No rice, starch or vegetable side is included. Keep bones accounted for; bone-in packed mass is not edible meat.",
        "Cook uncrowded air-fryer batches to 165 F in thick meat away from bone. Keep clean finishing sauce separate from raw poultry; ranch stays cold.",
        "Record raw count/mass, cooked count/mass, sauce used, final net weight and container fit. Cool protected in shallow pans and keep at 41 F or below.",
        LABEL_RELEASE_HOLD,
    ], "planning-unmeasured")
