"""Mango habanero wing production planning data; no completed label release.

The owner counted 49 purchased split pieces weighing 3768 g raw bone-in for
Batch 19. This measures the lot average, not any plated portion or edible yield.
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
PURCHASED_RAW_GRAMS = 3768.0
PURCHASED_PIECES = 49
RAW_GRAMS_PER_PIECE = PURCHASED_RAW_GRAMS / PURCHASED_PIECES
RANCH_CUP_GRAMS = 40.0
MANGO_DIP_GRAMS = 20.0
LABEL_RELEASE_HOLD = (
    "Actual portion weights and cooked/edible yields, "
    "the purchased G Hughes and Bolthouse package panels/costs, and container "
    "fit are unverified. No complete Nutrition Facts may be released."
)
QUALITY_CHECK = (
    "Pack six individual split flats/drumettes for Lean and eight "
    "for Bulk, plus one separate 40 g NET bottled-ranch planning cup and a separate 20 g clean mango-habanero dip per box. No rice or vegetable side. "
    "Owner-measured purchased lot: 49 split pieces / 3768 g raw bone-in, averaging 76.9 g per piece. "
    "Actual portion and cooked yields remain unmeasured. Verify both purchased "
    "package panels and stock, record raw/cooked output and fit, and measure 165 F "
    "away from bone. Keep ranch cold and separate. " + LABEL_RELEASE_HOLD
)

# USDA SR28 NDB 05100 lists 191 kcal, 17.52 g protein and 12.85 g fat per
# 100 g edible raw wing, with 38% bone/connective refuse. This converts to a
# raw bone-in purchase-weight estimate, not a measured yield for this lot.
r.add_ingredient(
    WING_KEY, "Split chicken wings, raw bone-in (49-piece purchased lot average)",
    r.n(118.42, 10.8624, 0, 0, 7.967, 2.1917, 0, 0, 52.08, 68.82,
        0, .062, 6.82, .2852, 115.94),
    source="USDA SR28 NDB 05100; 62% edible raw meat-and-skin proxy for purchased bone-in mass",
    confidence="planning-yield", nutrition_complete=True,
    note="Batch 19 lot: 3768 g / 49 individual flats/drumettes. USDA 38% refuse is a recipe estimate; weigh cooked and edible recovery before a final label release.",
)
r.add_ingredient(
    SAUCE_KEY, "G Hughes Zero Sugar Mango Habanero Wing Sauce (12 fl oz bottle)",
    r.n(5*100/15, 0, 1*100/15, 0, 0, 0, 0, 0, 100*100/15, 0),
    source="G Hughes manufacturer nutrition panel: 5 kcal, 1 g carbs, 100 mg sodium per 1 tbsp (15 mL)",
    confidence="medium", nutrition_complete=True,
    note="Working density is 1 g/mL; measure bottle net mass and verify purchased panel. Owner approved this lower-carb product for coating and dip.",
)
r.add_ingredient(
    RANCH_KEY, "Bolthouse Farms Classic Ranch yogurt dressing (40 g net planning cup)",
    r.n(50*100/30, 1*100/30, 3*100/30, 0, 4*100/30,
        1*100/30, 2*100/30, 0, 260*100/30, 5*100/30,
        0, 0, 33*100/30, 0, 52*100/30),
    source="Bolthouse Farms Classic Ranch 12 fl oz bottle back panel, UPC 071464022853, per 30 g",
    confidence="medium", nutrition_complete=True,
    note="Online bottle photo: 50 kcal, 4 g fat, 3 g carbs, 1 g protein, 260 mg sodium per 30 g. Contains egg and milk. Verify purchased package revision.",
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
        "rawMassPlanningGrams": round(pieces * RAW_GRAMS_PER_PIECE, 4),
        "rawWeightVerified": False,
        "rawMassBasis": "Owner-measured Batch 19 purchase lot: 3768 g / 49 split pieces; weigh actual portion pulls.",
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
        r.p(WING_KEY, round(pieces*RAW_GRAMS_PER_PIECE, 4), note="component:"+SEASONING_COMPONENT),
        r.p("avocado_oil",5*scale,note="component:"+SEASONING_COMPONENT),
        r.p("salt",2*scale,note="component:"+SEASONING_COMPONENT),
        r.p("paprika",2*scale,note="component:"+SEASONING_COMPONENT),
        r.p("garlic_powder",1*scale,note="component:"+SEASONING_COMPONENT),
        r.p("onion_powder",1*scale,note="component:"+SEASONING_COMPONENT),
        r.p(SAUCE_KEY,45*scale,note="component:"+FINISH_COMPONENT),
        r.p(SAUCE_KEY,MANGO_DIP_GRAMS,note="component:wings-extra-dip",
            include_in_menu_macros=False),
        r.p(RANCH_KEY,RANCH_CUP_GRAMS,note="component:"+RANCH_COMPONENT,
            include_in_menu_macros=False),
    ],[
        f"Owner-confirmed {tier.title()} box: at least {pieces} INDIVIDUAL flats/drumettes, not whole unsplit wings.",
        f"Batch 19 purchased lot is 3768 g / 49 split pieces; {pieces} pieces average {pieces*RAW_GRAMS_PER_PIECE:.1f} g raw bone-in. Weigh each actual portion; cooked/edible yield is unmeasured.",
        "Oil, dry seasoning and finishing sauce retain the controlled piece-based recipe amounts. Confirm coating coverage with the measured larger wings.",
        "Count usable individual split pieces as a separate purchase/pack floor. The normal 5% raw-mass shopping reserve does not replace the required piece count.",
        "Pack ONE separate 40 g NET Bolthouse Classic Ranch planning cup and ONE separate 20 g clean G Hughes mango-habanero dip per box. Verify the purchased product panels, package costs, and exact filled recovery.",
        "No rice, starch or vegetable side is included. Keep bones accounted for; bone-in packed mass is not edible meat.",
        "Cook uncrowded air-fryer batches to 165 F in thick meat away from bone. Keep clean finishing sauce separate from raw poultry; ranch stays cold.",
        "Record raw count/mass, cooked count/mass, sauce used, final net weight and container fit. Cool protected in shallow pans and keep at 41 F or below.",
        LABEL_RELEASE_HOLD,
    ], "planning-unmeasured")
