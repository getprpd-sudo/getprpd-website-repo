"""Batch18 three new optional40g sauces, complete recipe estimates, not test results.

No network at runtime and no shared recipe/profile keys are replaced. USDA snapshot
is the official final SR Legacy CSV retrieved2026-11-02. Branded overlays and
missing-field assumptions are explicit. Cost rates are planning snapshots.
"""
from dataclasses import asdict
import math
import calculate_active_menu as active

CHECKED_AT = "2026-11-02"
PREFIX = "batch18_"
USDA_DOWNLOAD = "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip"
FIELDS = tuple(asdict(active.n()))
USDA_PROFILES = {'feta': {'fdcId': 173420,
          'name': 'Cheese, feta',
          'values': [265.0, 14.21, 3.88, 0, 21.49, 13.3, 0, 0, 1139.0, 89.0, 0, 0.4, 493.0, 0.65, 62.0],
          'assumed_zero_missing': ['trans_fat']},
 'cucumber': {'fdcId': 168409,
              'name': 'Cucumber, with peel, raw',
              'values': [15.0, 0.65, 3.63, 0.5, 0.11, 0.037, 1.67, 0, 2.0, 0, 0, 0, 16.0, 0.28, 147.0],
              'assumed_zero_missing': []},
 'tomato': {'fdcId': 170457,
            'name': 'Tomatoes, red, ripe, raw, year round average',
            'values': [18.0, 0.88, 3.89, 1.2, 0.2, 0.028, 2.63, 0, 5.0, 0, 0, 0, 10.0, 0.27, 237.0],
            'assumed_zero_missing': []},
 'onion': {'fdcId': 170000,
           'name': 'Onions, raw',
           'values': [40.0, 1.1, 9.34, 1.7, 0.1, 0.042, 4.24, 0, 4.0, 0, 0, 0, 23.0, 0.21, 146.0],
           'assumed_zero_missing': []},
 'parsley': {'fdcId': 170416,
             'name': 'Parsley, fresh',
             'values': [36.0, 2.97, 6.33, 3.3, 0.79, 0.132, 0.85, 0, 56.0, 0, 0, 0, 138.0, 6.2, 554.0],
             'assumed_zero_missing': []},
 'dill': {'fdcId': 172233,
          'name': 'Dill weed, fresh',
          'values': [43.0, 3.46, 7.02, 2.1, 1.12, 0.06, 0, 0, 61.0, 0, 0, 0, 208.0, 6.59, 738.0],
          'assumed_zero_missing': ['sugars']},
 'mint': {'fdcId': 173475,
          'name': 'Spearmint, fresh',
          'values': [44.0, 3.29, 8.41, 6.8, 0.73, 0.191, 0, 0, 30.0, 0, 0, 0, 199.0, 11.87, 458.0],
          'assumed_zero_missing': ['sugars']},
 'lemon': {'fdcId': 167748,
           'name': 'Lemon juice from concentrate, canned or bottled',
           'values': [17.0, 0.45, 5.62, 0.7, 0.07, 0.027, 1.53, 0, 24.0, 0, 0, 0, 10.0, 0.06, 109.0],
           'assumed_zero_missing': []},
 'lime': {'fdcId': 168156,
          'name': 'Lime juice, raw',
          'values': [25.0, 0.42, 8.42, 0.4, 0.07, 0.008, 1.69, 0, 2.0, 0, 0, 0, 14.0, 0.09, 117.0],
          'assumed_zero_missing': []},
 'tahini': {'fdcId': 170189,
            'name': 'Seeds, sesame butter, tahini, from roasted and toasted kernels (most common type)',
            'values': [595.0, 17.0, 21.19, 9.3, 53.76, 7.529, 0.49, 0, 115.0, 0, 0, 0, 426.0, 8.95, 414.0],
            'assumed_zero_missing': ['trans_fat']},
 'mango': {'fdcId': 169910,
           'name': 'Mangos, raw',
           'values': [60.0, 0.82, 14.98, 1.6, 0.38, 0.092, 13.66, 0, 1.0, 0, 0, 0, 11.0, 0.16, 168.0],
           'assumed_zero_missing': []},
 'vinegar': {'fdcId': 173469,
             'name': 'Vinegar, cider',
             'values': [21.0, 0, 0.93, 0, 0, 0, 0.4, 0, 5.0, 0, 0, 0, 7.0, 0.2, 73.0],
             'assumed_zero_missing': []},
 'olive_oil': {'fdcId': 171413,
               'name': 'Oil, olive, salad or cooking',
               'values': [884.0, 0, 0, 0, 100.0, 13.808, 0, 0, 2.0, 0, 0, 0, 1.0, 0.56, 1.0],
               'assumed_zero_missing': ['trans_fat']},
 'honey': {'fdcId': 169640,
           'name': 'Honey',
           'values': [304.0, 0.3, 82.4, 0.2, 0, 0, 82.12, 82.12, 4.0, 0, 0, 0, 6.0, 0.42, 52.0],
           'assumed_zero_missing': ['trans_fat']},
 'garlic': {'fdcId': 169230,
            'name': 'Garlic, raw',
            'values': [149.0, 6.36, 33.06, 2.1, 0.5, 0.089, 1.0, 0, 17.0, 0, 0, 0, 181.0, 1.7, 401.0],
            'assumed_zero_missing': []},
 'black_pepper': {'fdcId': 170931,
                  'name': 'Spices, pepper, black',
                  'values': [251.0, 10.39, 63.95, 25.3, 3.26, 1.392, 0.64, 0, 20.0, 0, 0, 0, 443.0, 9.71, 1329.0],
                  'assumed_zero_missing': []},
 'garlic_powder': {'fdcId': 171325,
                   'name': 'Spices, garlic powder',
                   'values': [331.0, 16.55, 72.73, 9.0, 0.73, 0.249, 2.43, 0, 60.0, 0, 0, 0, 79.0, 5.65, 1193.0],
                   'assumed_zero_missing': []},
 'cumin': {'fdcId': 170923,
           'name': 'Spices, cumin seed',
           'values': [375.0, 17.81, 44.24, 10.5, 22.27, 1.535, 2.25, 0, 168.0, 0, 0, 0, 931.0, 66.36, 1788.0],
           'assumed_zero_missing': ['trans_fat']},
 'salt': {'fdcId': 173468,
          'name': 'Salt, table',
          'values': [0, 0, 0, 0, 0, 0, 0, 0, 38758.0, 0, 0, 0, 24.0, 0.33, 8.0],
          'assumed_zero_missing': []},
 'chickpeas': {'fdcId': 173800,
               'name': 'Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, drained solids',
               'values': [139.0, 7.05, 22.53, 6.4, 2.77, 0.214, 4.01, 0, 246.0, 0, 0, 0, 45.0, 1.07, 126.0],
               'assumed_zero_missing': []},
 'edamame': {'fdcId': 168411,
             'name': 'Edamame, frozen, prepared',
             'values': [121.0, 11.91, 8.91, 5.2, 5.2, 0.62, 2.18, 0, 6.0, 0, 0.009, 0, 63.0, 2.27, 436.0],
             'assumed_zero_missing': []},
 'water': {'fdcId': 173647,
           'name': 'Beverages, water, tap, drinking',
           'values': [0, 0, 0, 0, 0, 0, 0, 0, 4.0, 0, 0, 0, 3.0, 0, 0],
           'assumed_zero_missing': []}}

FAGE_SOURCE = "https://www.target.com/p/-/A-14729218"
TAHINI_SOURCE = "https://www.harristeeter.com/p/soom-premium-tahini/0081008423000"
CHIPOTLE_SOURCE = "https://www.rolandfoods.com/product/45782-chipotle-peppers-in-adobo-sauce"

# Exact FAGE0percent170g online supplier panel, UPC689544083016, not GV yogurt.
BRANDED_PROFILES = {
    "fage_0": {
        "name": "FAGE Total0% plain nonfat Greek yogurt",
        "nutrition": active.n(90,18,5,0,0,0,5,0,65,10,0,0,200,0,260).scale(100/170),
        "source": FAGE_SOURCE,
        "note": "170g supplier panel read2026-11-02; actual tub not physically reverified. No Great Value substitution.",
    },
    "tahini": {
        "name": "Soom Premium Tahini, plain sesame seeds",
        "nutrition": active.n(190,6,3,1,17,3,0,0,5,0,0,0,0,0,0).scale(100/28),
        "source": TAHINI_SOURCE,
        "note": "Online supplier panel28g. Calcium/iron/potassium use comparable USDA roasted tahini because online panel exposes rounded%DV only. Not a verified purchased jar.",
    },
    "chipotle_adobo": {
        "name": "Roland Chipotle Peppers in Adobo Sauce, UPC041224457805",
        "nutrition": active.n(25,1,4,1,0,0,1,1,320,0,0,0,0,.6,160).scale(100/30),
        "source": CHIPOTLE_SOURCE,
        "note": "Root selected Roland UPC041224457805 before tests. Manufacturer30g panel25cal/320mg sodium; protein<1g and added sugar<1g each conservatively modeled1g. Trans fat not published, explicitly modeled0g. Ingredients: chipotle peppers, water, tomato paste, salt, sugar, onion, acetic acid; no oil or soy listed. No allergen-free claim; verify purchased can and cross-contact. Actual purchase/panel not physically confirmed.",
    },
}

def ingredient_key(alias):
    return PREFIX + alias

def install_profiles():
    """Install dedicated scalable estimate profiles only; no canonical aliases."""
    for alias, row in USDA_PROFILES.items():
        nutrition = active.n(*row["values"])
        note = "USDA comparable ingredient, not purchased-product assay."
        if row["assumed_zero_missing"]:
            note += " Unreported fields modeled zero: " + ", ".join(row["assumed_zero_missing"]) + "."
        if alias in ("dill", "mint"):
            # Bound the missing sugar at nonfiber carbohydrate rather than silently
            # assigning a verified zero to fresh herbs.
            nutrition.sugars = max(0, nutrition.carbs - nutrition.fiber)
            note += " Missing herb sugar conservatively modeled as nonfiber carbohydrate."
        if alias == "honey":
            nutrition.added_sugars = nutrition.sugars
            note += " All honey sugars count as added sugar when used in this recipe."
        active.INGREDIENTS[ingredient_key(alias)] = active.Ingredient(
            row["name"], nutrition, "100g", f"{USDA_DOWNLOAD}#fdc-{row['fdcId']}",
            "complete-recipe-estimate", note, True,
        )
    for alias, row in BRANDED_PROFILES.items():
        nutrition = row["nutrition"]
        if alias == "tahini":
            from dataclasses import replace
            generic = active.INGREDIENTS[ingredient_key("tahini")].nutrition
            nutrition = replace(nutrition, calcium=generic.calcium, iron=generic.iron, potassium=generic.potassium)
        active.INGREDIENTS[ingredient_key(alias)] = active.Ingredient(
            row["name"], nutrition, "100g", row["source"],
            "online-brand-and-comparable-estimate", row["note"], True,
        )
    # Same nutrient model after squeezing; the nutrition concentration change is
    # unmeasured. Cost separately includes the explicit conservative raw pull.
    active.INGREDIENTS[ingredient_key("cucumber_squeezed")] = active.INGREDIENTS[ingredient_key("cucumber")]

SAUCES = {
    "cucumber-dill-tzatziki": {
        "name": "Cucumber Dill Tzatziki", "allergens": "CONTAINS: MILK.",
        "source": "https://nl.fage/recepten/tzatziki-0",
        "formula_g": {"fage_0":140,"cucumber_squeezed":35,"lemon":12,"olive_oil":5,"dill":3,"mint":1,"garlic":2,"salt":1.5,"black_pepper":.5},
        "steps": ["Grate and squeeze cucumber, then weigh the displayed squeezed amount; raw pull is separate.", "Stir all measured ingredients together. Refrigerate30minutes before tasting; do not blend cucumber into a watery puree."],
    },
    "mango-chipotle-lime": {
        "name": "Mango Chipotle Lime", "allergens": "",
        "allergen_advisory": "Roland UPC041224457805 lists no oil or soy. Verify actual can and cross-contact; no allergen-free claim.",
        "source": "https://www.mango.org/wp-content/uploads/2017/10/NMB_Cookbook.pdf",
        "formula_g": {"mango":160,"chipotle_adobo":10,"lime":18,"honey":8,"vinegar":2.5,"garlic":1,"salt":.5},
        "steps": ["Use Roland Chipotle Peppers in Adobo Sauce UPC041224457805 for this calculation. Weigh peeled/pitted ripe mango and chipotle together with its adobo; do not drain off the sauce.", "Blend all displayed ingredients smooth, scrape, cover and refrigerate30minutes before tasting."],
    },
    "lemon-tahini": {
        "name": "Lemon Tahini", "allergens": "CONTAINS: SESAME.",
        "source": "https://soomfoods.com/blogs/recipes/best-basic-tahini-sauce",
        "formula_g": {"tahini":95,"water":78,"lemon":22,"garlic":2,"salt":1.5,"cumin":1,"black_pepper":.5},
        "steps": ["Stir plain tahini in its jar before weighing. Whisk tahini, lemon, garlic and seasonings.", "Add exactly the displayed cold potable water gradually; whisk smooth. Refrigerate30minutes before tasting. Record any gram adjustment as a recipe revision."],
    },
}

# Every ingredient has a finite planning rate. Yields below are explicit COST
# assumptions only, never reported as measured preparation/recovery results.
def rate(price, package_g, source, status="historical-catalog", usable_fraction=1, note=""):
    return dict(price=price, package_g=package_g, source=source, status=status,
                usable_fraction=usable_fraction, note=note)

COST_RATES = {
    "fage_0":rate(7.69,907.184,FAGE_SOURCE,"online-reference-not-local-quote"),
    "tahini":rate(6.99,311.845,"https://www.target.com/p/-/A-94625581","online-reference-not-local-quote"),
    "chipotle_adobo":rate(3.00,200,"Root-authorized explicit Roland planning rate2026-11-02","planning",1,"$3/200g modeled can; NOT a retailer/local quote or verified purchase. UPC041224457805, net7.05oz rounded200g costing basis."),
    "dill":rate(1.92,14.175,"https://www.walmart.com/browse/food/fresh-cut-herbs/976759_976793_3513831_2699039","online-reference-not-local-quote",.9,"FRESH herb, not catalog dried-dill bottle;90% usable planning assumption."),
    "mint":rate(1.92,14.175,"https://www.walmart.com/browse/food/fresh-cut-herbs/976759_976793_3513831_2699039","online-reference-not-local-quote",.9,"Fresh spearmint;90% usable planning assumption."),
    "cucumber":rate(.98,453.592,"operations/grocery-catalog.js receipt2026-08-26","historical-catalog",.9,"90% usable diced-cucumber planning assumption."),
    "cucumber_squeezed":rate(.98,453.592,"operations/grocery-catalog.js receipt2026-08-26","historical-catalog",.5,"50% gross-to-squeezed planning assumption, unmeasured. Nutrition still uses generic cucumber per usable gram."),
    "mango":rate(1.5,200,"PRPD explicit conservative fresh-mango planning allowance","planning",1,"$1.50 per200g edible flesh, not a measured fruit yield or current quote."),
    "lemon":rate(1.94,443,"operations/grocery-catalog.js bottled-lemon reference2026-10-21","historical-planning"),
    "lime":rate(.33,30,"operations/grocery-catalog.js planning price","planning",1,"One lime modeled30g juice; unmeasured."),
    "olive_oil":rate(6.12,460,"operations/grocery-catalog.js reference2026-09-09"),
    "honey":rate(8.97,680,"operations/grocery-catalog.js receipt2026-07-16"),
    "vinegar":rate(2.64,946,"operations/grocery-catalog.js apple-cider-vinegar planning price","planning"),
    "garlic":rate(1,100,"PRPD fresh peeled-garlic planning allowance","planning",1,"$1 per100g usable fresh garlic; do not price using the catalog jar-minced garlic identity."),
    "salt":rate(.94,737,"operations/grocery-catalog.js reference2026-09-09"),
    "black_pepper":rate(3.58,85,"operations/grocery-catalog.js reference2026-09-09"),
    "cumin":rate(1.48,71,"operations/grocery-catalog.js reference2026-09-09"),
    "water":rate(0,1000,"Explicit negligible marginal potable-water allowance","planning"),
    "feta":rate(6.24,283,"operations/grocery-catalog.js Frigo feta receipt2026-08-26"),
    "chickpeas":rate(1.62,250,"https://business.walmart.com/ip/36333611","online-reference-not-local-quote",1,"GOYA15.5oz can;250g drained usable COST assumption, not gross can weight or measured yield. USDA drained nutrition model."),
    "edamame":rate(1.92,340,"operations/grocery-catalog.js legacy shelled-edamame bag","legacy-planning",1,"340g frozen edible shelled beans;1:1 frozen-to-cooked-usable cost assumption, not measured yield."),
    "tomato":rate(2.98,283,"PRPD cherry/grape-tomato planning allowance","planning",.95,"Explicit$2.98/10oz,95% usable; do not price cherry tomatoes as cheap Roma tomatoes."),
    "onion":rate(3.46,1360.78,"operations/grocery-catalog.js red-onion reference2026-09-09","historical-catalog",.9),
    "parsley":rate(.97,60,"operations/grocery-catalog.js receipt2026-08-26","historical-catalog",1,"60g usable bunch is a planning assumption."),
    "garlic_powder":rate(1.08,88,"operations/grocery-catalog.js receipt2026-08-26"),
}
CUP_AND_LID_USD = 15/250
BOX_AND_LID_USD = 17.99/50

def validate_grams(grams):
    value = float(grams)
    if not math.isfinite(value) or value < 0:
        raise ValueError("Ingredient/recipe grams must be finite and nonnegative")
    return value

def build_formula(formula, component, multiplier=1):
    install_profiles()
    factor = validate_grams(multiplier)
    return active.build([active.p(ingredient_key(k),v*factor,note=f"component:{component}") for k,v in formula.items()],
        ["Owner-authorized complete recipe estimate; all issued edible ingredients retained in nutrient model.",
         "Finished yield, transfer loss, net fill, taste, fit and refrigerated quality are not measured test results.",
         "No shelf life inferred from recipe calculation; keep actual preparation/quality records separately."],
        "owner-authorized-recipe-estimate")

def build_sauce(sauce_id, grams=40):
    return build_formula(SAUCES[sauce_id]["formula_g"],sauce_id,validate_grams(grams)/200)

def cucumber_dill_tzatziki(grams=40): return build_sauce("cucumber-dill-tzatziki",grams)
def mango_chipotle_lime(grams=40): return build_sauce("mango-chipotle-lime",grams)
def lemon_tahini(grams=40): return build_sauce("lemon-tahini",grams)

def full_nutrition_estimate(sauce_id, grams=40):
    return active.total(build_sauce(sauce_id,grams))

def cost_formula(formula, packaging=0, multiplier=1):
    factor=validate_grams(multiplier)
    lines=[]
    for key,grams in formula.items():
        row=COST_RATES[key]
        unit=row["price"]/(row["package_g"]*row["usable_fraction"])
        lines.append(dict(ingredient=ingredient_key(key),grams=grams*factor,
                          unit_cost_per_usable_g=unit,cost=unit*grams*factor,**row))
    food=sum(row["cost"] for row in lines)
    return dict(ingredients=lines,food=food,packaging=packaging,total=food+packaging,
                basis="Complete ingredient-plus-container planning cost, excluding labor/delivery/payment/overhead and unmeasured transfer loss.")

def sauce_report(sauce_id):
    row=SAUCES[sauce_id]
    return dict(id=sauce_id,name=row["name"],allergens=row["allergens"],allergen_advisory=row.get("allergen_advisory",""),formula_g=row["formula_g"],
                batch_input_g=200,serving_g=40,theoretical_composition_cups=5,measured_recovered_g=None,
                source_recipe=row["source"],adaptation=True,physical_tests_completed=False,
                steps=row["steps"],nutrition_per40g=asdict(full_nutrition_estimate(sauce_id)),
                nutrition_batch200g=asdict(full_nutrition_estimate(sauce_id,200)),
                cost_per40g=cost_formula(row["formula_g"],CUP_AND_LID_USD,.2),
                cost_batch200g_ingredients=cost_formula(row["formula_g"]))
