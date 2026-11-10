"""October28 owner-approved plain-cornflake PRPD popcorn-chicken adaptation.

Physical coating pickup, chicken recovery, oil retention, bake load, packed
weight and held/reheated quality remain unmeasured. October29 owner authorized
complete recipe-based nutrition estimates for final labels; this is not a lab result.
"""
import calculate_next_menu as r
from dataclasses import replace

NAME = "Oven-Baked Popcorn Chicken"
SOURCE_RECIPE_URL = "https://www.heartfoundation.org.nz/wellbeing/healthy-recipes/popcorn-chicken"
COATING_KEY = "kelloggs_corn_flakes_plain"
COATING_PRODUCT = {
    "name": "Kellogg's Corn Flakes, plain unfrosted",
    "source": "https://smartlabel.wkkellogg.com/Product/Index?gtin=00038000001208",
    "alternate_source": "https://smartlabel.kelloggs.com/Product/Index/00038000001109",
    "source_checked": "2026-10-29", "serving_g": 42,
    "reference_gtin": "00038000001208", "package_reference_g": 510.291,
    "ingredients": "Milled corn, sugar, malt flavor, contains2% or less of salt. Vitamins and Minerals: Iron (ferric phosphate), niacinamide, vitamin B6 (pyridoxine hydrochloride), vitamin B2 (riboflavin), vitamin B1 (thiamin hydrochloride), folic acid, vitamin D3, vitamin B12.",
    "known_per_serving": {
        "calories":150,"protein":3,"carbs":36,"fiber":1,"fat":0,
        "saturated_fat":0,"trans_fat":0,"cholesterol":0,
        "sodium":300,"sugars":4,"added_sugars":4,
        "vitamin_d":3,"calcium":0,"iron":12,"potassium":60,
    },
    "manufacturer_panel_verified_online": True,
    "physical_package_verified": False,
    "gluten_free": False,
}
r.add_ingredient(
    COATING_KEY, COATING_PRODUCT["name"],
    r.n(cal=150,p=3,c=36,fi=1,f=0,sf=0,su=4,ad=4,so=300,ch=0,tr=0,
        vd=3,ca=0,ir=12,k=60).scale(100/42),
    source=COATING_PRODUCT["source"], confidence="manufacturer-panel-physical-pending",
    note="Official42g plain Corn Flakes panel, not Frosted Flakes. All required nutrient fields verified online October29; physical purchased-package verification and actual coating retention remain unmeasured. Owner authorized recipe-based final label estimates.",
    nutrition_complete=True,
)
FORMULA_G = {
    "chicken_thigh_cooked":120, COATING_KEY:25, "flour":5,
    "egg_white":15,"avocado_oil":3,"garlic_powder":1,
    "paprika":.5,"black_pepper":.2,"salt":.75,
}
COOKED_MEAT_EQUIVALENT_G = 120
PLANNING_YIELD_FRACTION = .75
RAW_EQUIVALENT_GRAMS = COOKED_MEAT_EQUIVALENT_G/PLANNING_YIELD_FRACTION
RAW_MEAT_PLAN = {
    "rawEquivalentGrams":RAW_EQUIVALENT_GRAMS,
    "cookedUnbreadedMeatEquivalentGrams":COOKED_MEAT_EQUIVALENT_G,
    "assumedYieldFraction":PLANNING_YIELD_FRACTION,"measuredYieldFraction":None,
    "basis":"Unvalidated75% shopping/prep assumption only; no measured breaded-method recovery.",
}
ALLERGENS = "CONTAINS: EGG, WHEAT."
ALLERGEN_ADVISORY = "Corn Flakes contain malt flavor, a source of gluten. This recipe is not gluten free. Verify the actual purchased package."
INGREDIENTS = (
    "boneless skinless chicken thigh, Kellogg's Corn Flakes "
    "(milled corn, sugar, malt flavor, salt, iron [ferric phosphate], niacinamide, "
    "vitamin B6 [pyridoxine hydrochloride], vitamin B2 [riboflavin], "
    "vitamin B1 [thiamin hydrochloride], folic acid, vitamin D3, vitamin B12), "
    "egg whites, wheat flour, avocado oil, garlic powder, salt, paprika, ground black pepper."
)
DIP_INCLUDED = False
REHEAT = "Reheat uncovered in an oven or air fryer until the chicken reaches165 F throughout."
METHOD_STEPS = (
    "Weigh the raw halal thigh pull separately and cut uniform bites.160g raw is only the existing unvalidated75% recovery model behind120g cooked unbreaded meat.",
    "Weigh25g plain unfrosted Kellogg's Corn Flakes per serving BEFORE crushing. Crush in a clean bag or bowl, weigh recovered crumbs and record crushing loss; equal cups are not equal grams. No Frosted Flakes.",
    "Stage flour, egg white and seasoned cornflake crumbs separately. Track issued, unused/discarded coating and oil. Keep raw-contact crumbs out of clean stock.",
    "Coat chicken with flour, then egg white, then cornflake crumbs with the displayed garlic powder, paprika, pepper and salt. Use exactly3g measured oil total per serving across tray and coating.",
    "Bake one uncrowded layer. The source225C/437F is only a pilot starting setting, not a validated load or time. Record oven mode, tray size/load and actual timing; probe thick pieces to165F.",
    "Record finished coated yield, retained coating/oil and actual12oz fit. Breaded net weight does not establish120g unbreaded meat; actual method recovery remains pending.",
    "Cool protected in shallow pans; check135F-to70F within2h and41F within6h total. Seal after chilling, then record fresh and24/72h reheat quality. No guaranteed refrigerated crunch.",
    "No dip is included. Any dip needs an explicit formula, grams, allergens, cost and package-macro calculation.",
)
PHYSICAL_GATES = (
    "Actual halal thigh and plain Kellogg's Corn Flakes panels",
    "Method-specific raw-to-cooked meat recovery",
    "Precrush input, crushing loss and retained coating/oil",
    "Actual coated net weight and12oz fit",
    "Breading time, bake capacity,165F endpoint and protected cooling",
    "Fresh and24/72h held/reheated quality",
)
def oven_baked_popcorn_chicken():
    return r.build(
        [r.p(key,grams,note="component:popcorn-chicken") for key,grams in FORMULA_G.items()],
        [
            "October28 owner approved plain unfrosted Corn Flakes replacing panko25g for25g weighed BEFORE crushing. All other formula quantities remain unchanged.",
            "PRPD adaptation of Heart Foundation NZ, not its unchanged recipe or nutrition claim.",
            "Portion120g cooked UNBREADED thigh equivalent PLUS coating/oil, not120g finished breaded food.",
            "rawEquivalentGrams=160 at an unvalidated75% planning recovery. No new measured yield is claimed.",
            "Count all25g cereal,5g flour,15g egg white and3g oil until actual incorporation is measured.",
            "October29 owner authorized complete recipe-based label nutrition. Use recorded manufacturer/USDA profiles and full issued coating/oil retention; physical panel, pickup, yield and quality observations remain unmeasured.",
            "Contains egg and wheat; malt adds gluten. No gluten-free claim and no required dip.",
            *PHYSICAL_GATES,
        ], "owner-authorized-recipe-estimate",
    )

# Scoped supplements fill old default-zero micronutrient slots without changing
# shared recipe profiles. Official USDA API records fetched October29,2026.
MICRONUTRIENT_SUPPLEMENTS = {
    "flour": {"calcium":15.0,"iron":4.64,"potassium":107.0},
    "garlic_powder": {"calcium":79.0,"iron":5.65,"potassium":1193.0},
    "black_pepper": {"calcium":443.0,"iron":9.71,"potassium":1329.0},
}
SUPPLEMENT_SOURCES = {
    "flour":"https://api.nal.usda.gov/fdc/v1/food/168936",
    "garlic_powder":"https://api.nal.usda.gov/fdc/v1/food/171325",
    "black_pepper":"https://api.nal.usda.gov/fdc/v1/food/170931",
}
LABEL_ESTIMATE_ASSUMPTIONS = (
    "160g raw thigh is modeled as120g cooked unbreaded thigh at75% yield; this remains a model, not a measured recovery.",
    "Count all25g cereal,5g flour,15g eggwhite,3g oil and all measured spices/salt as retained nutrient inputs; no deduction for unused crumbs, tray oil or cooking liquid.",
    "Use the existing cooked-thigh and eggwhite working profiles, the complete manufacturer42g cereal panel, and USDA micronutrient supplements for flour/garlic/pepper.",
    "No dip included. Nutrients are per complete serving, not per100g of the finished food. Modeled evaporation changes mass, not retained ingredient nutrient totals.",
    "USDA enriched all-purpose flour is the working flour equivalent; physical flour enrichment/product identity remains unverified.",
    "Online product records and comparable database profiles are estimates for the actual ingredients; no laboratory or measured-coating result is claimed.",
)

def full_nutrition_estimate():
    result=r.n()
    for key,grams in FORMULA_G.items():
        profile=r.active.INGREDIENTS[key].nutrition
        if key in MICRONUTRIENT_SUPPLEMENTS:
            profile=replace(profile,**MICRONUTRIENT_SUPPLEMENTS[key])
        result+=profile.scale(grams/100)
    return result

def full_label_nutrition():
    # 21CFR101.9: calories>50 nearest10; fat<5 nearest0.5; trans<0.5=0.
    value=full_nutrition_estimate()
    def fat_round(amount):
        return 0 if amount<.5 else round(amount*2)/2 if amount<5 else round(amount)
    return {
        "calories":round(value.calories/10)*10,"protein":round(value.protein),
        "carbs":round(value.carbs),"fiber":round(value.fiber),"fat":fat_round(value.fat),
        "satFat":fat_round(value.saturated_fat),"transFat":fat_round(value.trans_fat),
        "cholesterol":round(value.cholesterol/5)*5,"sodium":round(value.sodium/10)*10,
        "sugars":round(value.sugars),"addedSugar":round(value.added_sugars),
        "vitaminD":round(value.vitamin_d,1),"calcium":round(value.calcium/10)*10,
        "iron":round(value.iron,1),"potassium":round(value.potassium/10)*10,
    }
def macro_estimate():
    result=dict.fromkeys(("calories","protein","carbs","fat"),0.0)
    for key,grams in FORMULA_G.items():
        profile=r.active.INGREDIENTS[key].nutrition
        for field in result: result[field]+=getattr(profile,field)*grams/100
    return result
def menu_macros():
    value=macro_estimate()
    return {"cal":int(round(value["calories"]/5)*5),"protein":round(value["protein"]),
            "carbs":round(value["carbs"]),"fat":round(value["fat"])}
def website_tier(label="Single"):
    nutrition=full_label_nutrition()
    return {
        "label":str(label).upper(),"netWeight":"","ingredients":INGREDIENTS,
        "allergens":ALLERGENS,"allergenAdvisory":ALLERGEN_ADVISORY,
        "nutrition":dict(nutrition),"menuNutrition":dict(nutrition),
        "netWeightVerified":False,"requiresPackoutWeight":True,
        "finalLabelReady":False,"nutritionComplete":True,
        "nutritionStatus":"owner-authorized-complete-recipe-estimate",
        "nutritionBasis":"Complete serving; dip excluded.",
        "nutritionProvenance": {"method":"recipe-estimate","ownerAuthorizedAt":"2026-10-29",
            "physicalRetentionMeasured":False,"manufacturerSource":COATING_PRODUCT["source"],
            "supplementSources":SUPPLEMENT_SOURCES,"assumptions":list(LABEL_ESTIMATE_ASSUMPTIONS)},
    }
