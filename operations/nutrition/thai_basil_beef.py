"""November2 owner-selected minced-beef PRPD adaptation, recipe estimate.

Inspired by Pailin's traditional beef Pad Kra Pao. PRPD's weighed500g base,
90/10 beef, milder peppers and measured rice/beans are adaptations. No new
physical yield, purchased-package verification or halal certification is claimed.
"""
import calculate_next_menu as r

NAME = "Thai Basil Beef + Jasmine Rice"
SOURCE_RECIPE_URL = "https://hot-thai-kitchen.com/pad-kra-pao-beef/"
PLANNING_YIELD_FRACTION = .69
RAW_BEEF_G = {"lean": 210, "bulk": 300}
PILOT_RAW_BEEF_G = 500
FISH_SAUCE_KEY = "thai_redboat_40n"
RICE_KEY = "thai_jasmine_rice_dry"
BEANS_KEY = "thai_green_beans"
BASIL_KEY = "thai_basil_fresh"
PEPPER_KEY = "thai_red_bell_pepper"
CHILI_KEY = "thai_hot_chili"
SUGAR_KEY = "thai_granulated_sugar"
BLACK_PEPPER_KEY = "thai_black_pepper"
FISH_SAUCE_PRODUCT = {
    "name": "Red Boat40N Fish Sauce", "serving_g": 18.8,
    "manufacturer_url": "https://redboatfishsauce.com/products/fish-sauce-40n",
    "panel_url": "https://cdn.shopify.com/s/files/1/2029/5439/products/RB_amazon_5x4_image2.jpg?v=1746491305",
    "price_source": "https://redboatfishsauce.com/products/fish-sauce-40n.js",
    "price_usd": 14.99, "bottle_ml": 500, "source_checked": "2026-11-02",
    "ingredients": "Anchovy, sea salt", "allergen": "FISH (ANCHOVY)",
    "physical_panel_verified": False, "halal_certification_verified": False,
    "density_basis": "18.8g per15mL tablespoon; modeled bottle contents626.667g, not shipping weight",
}
# The currently published manufacturer image is complete; older databases list
#1490mg sodium. Use the actual image's1430mg rather than mixing the panels.
r.add_ingredient(FISH_SAUCE_KEY, "Red Boat40N fish sauce (anchovy, sea salt)",
    r.n(15,4,0,0,0,0,0,0,1430,0,0,0,4.3,.28,100).scale(100/18.8),
    source=FISH_SAUCE_PRODUCT["panel_url"], confidence="manufacturer-panel-physical-pending",
    note="All15 fields read from manufacturer's18.8g panel November2. Contains fish (anchovy). No halal certification claimed.")

# Scoped profiles avoid rewriting the shared library's older default-zero
# micronutrient fields. USDA SR Legacy CSV was downloaded from the official
# dataset November2; basil/chili are comparable profiles, not cultivar analyses.
USDA_DATASET_URL = "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip"
PROFILES = {
    RICE_KEY: ("Jasmine rice, dry (unenriched long-grain white-rice equivalent)",169756,
        r.n(365,7.13,79.95,1.3,.66,.18,.12,0,5,0,0,0,28,.8,115)),
    BEANS_KEY: ("Green beans, trimmed raw",169961,
        r.n(31,1.83,6.97,2.7,.22,.05,3.26,0,6,0,0,0,37,1.03,211)),
    BASIL_KEY: ("Fresh basil (USDA comparable profile)",172232,
        r.n(23,3.15,2.65,1.6,.64,.041,.3,0,4,0,0,0,177,3.17,295)),
    PEPPER_KEY: ("Mild red bell pepper, trimmed raw",170108,
        r.n(26,.99,6.03,2.1,.3,.059,4.2,0,4,0,0,0,7,.43,211)),
    CHILI_KEY: ("Thai chili (USDA raw green hot-chili equivalent)",170497,
        r.n(40,2,9.46,1.5,.2,.021,5.1,0,7,0,0,0,18,1.2,340)),
    SUGAR_KEY: ("Granulated sugar",169655,
        r.n(387,0,99.98,0,0,0,99.8,99.8,1,0,0,0,1,.05,2)),
    BLACK_PEPPER_KEY: ("Black pepper, ground",170931,
        r.n(251,10.39,63.95,25.3,3.26,1.392,.64,0,20,0,0,0,443,9.71,1329)),
}
for key, (name, fdc_id, nutrition) in PROFILES.items():
    r.add_ingredient(key, name, nutrition,
        source=f"USDA FoodData Central SR Legacy FDC{fdc_id}; {USDA_DATASET_URL}",
        confidence="controlled-comparable-profile",
        note="Complete15-field working estimate. Natural ingredients have0 added sugar; negligible/unreported trans fat modeled0. Jasmine uses an explicitly comparable unenriched white-rice profile, not a verified purchased jasmine panel.")

PILOT_FINISH_G = {
    "garlic":20, PEPPER_KEY:80, CHILI_KEY:3, BASIL_KEY:30,
    "avocado_oil":8, FISH_SAUCE_KEY:25, SUGAR_KEY:8,
    "water":60, BLACK_PEPPER_KEY:.5,
}
# Exact current controlled roasted-bean method from registry's
#braised_beef_short_rib: per1000g trimmed RAW beans,25g oil/15g garlic/
#2g salt/2g pepper. The100/150g below are RAW allocations, not finished claims.
BEAN_METHOD_PER_KG_G = {"avocado_oil":25,"garlic":15,"salt":2,BLACK_PEPPER_KEY:2}
DRY_RICE_G = {"lean":40,"bulk":60}
RAW_BEANS_G = {"lean":100,"bulk":150}
ALLERGENS = "CONTAINS: FISH (ANCHOVY)."
REQUIRED_SAUCE_CUPS = 0
METHOD_STEPS = (
    "Sum all sold Lean/Bulk inputs. Cook one shared beef/finish batch, one jasmine-rice batch and one green-bean batch; split tiers only at portioning.",
    "Rinse and cook the total dry jasmine rice with process water using its package instructions. No unlisted rice oil or salt.",
    "Roast trimmed beans with their measured oil, garlic, salt and pepper; these are separate from the beef finish's allocations.",
    "Brown minced halal90/10 beef in uncrowded batches to160F. Drain before finishing; the69% cooked/drained recovery is the existing planning model only.",
    "Use the measured beef oil to cook garlic/chilies and mild pepper. Return beef, add measured fish sauce, sugar, water and black pepper; reduce to coat. Fold in basil at the end. Do not add soy/oyster sauce, ginger, sesame oil or an egg.",
    "Weigh the complete combined beef/finish output; divide by each tier's raw-beef share (210:300), not equal meal counts. Divide cooked rice by40:60 dry shares and beans by100:150 raw shares. Do not weigh144.9/207g of the finished sauced mixture as if it were pure cooked beef.",
    "Refrigerate promptly using the established monitored cooling procedure. Record actual component recovery and pack weights when produced; no new shelf-life claim.",
)

def raw_beef_pull_g(tier):
    if tier not in RAW_BEEF_G:
        raise ValueError("Thai basil beef tier must be lean or bulk")
    return RAW_BEEF_G[tier]

def allocations_g(tier):
    raw = raw_beef_pull_g(tier)
    return {
        "beef_finish": {key:grams*raw/PILOT_RAW_BEEF_G for key,grams in PILOT_FINISH_G.items()},
        "rice": {RICE_KEY:DRY_RICE_G[tier]},
        "beans": {BEANS_KEY:RAW_BEANS_G[tier],
            **{key:grams*RAW_BEANS_G[tier]/1000 for key,grams in BEAN_METHOD_PER_KG_G.items()}},
    }

def thai_basil_beef(tier):
    raw = raw_beef_pull_g(tier)
    portions = [r.beef_pan(raw)]
    for component, amounts in allocations_g(tier).items():
        portions += [r.p(key,grams,note="component:thai-basil-"+component) for key,grams in amounts.items()]
    return r.build(portions, [
        f"Owner-selected minced halal90/10 beef, not strips: {raw}g raw per{tier};69% existing cooked/drained model gives{raw*.69:g}g plain cooked beef equivalent, not a new measurement.",
        "November2 owner authorized completing recipe-based estimates.500g beef finish ratios are a PRPD adaptation inspired by Pailin's traditional Pad Kra Pao, not a verbatim original recipe or tasted result.",
        "All finish ingredients and measured oils are counted retained; beef nutrition uses cooked/drained USDA90/10 crumbles. Purchase-only5% raw reserve is not eaten nutrition.",
        "Owner selected regular fresh sweet basil on November 2. Use the existing leaf quantities; no specialty basil purchase is required. This is a PRPD adaptation. The existing USDA ordinary fresh basil profile already matches this choice; chili remains a comparable profile.",
        "Rice uses a complete USDA unenriched long-grain white-rice equivalent; confirm actual jasmine package when bought. Fresh produce nutrients use raw-input profiles with no claimed measured retention.",
        "Red Boat manufacturer ingredients are anchovy and sea salt; no certification claim. Fish allergen remains present in this beef dish. No required cup, optional sauce, fried egg or additional garnish is included in this builder.",
        "One combined batch per component across tiers; portion finished beef/finish by210:300 raw-beef shares. Finished cooked/sauced weights have not been physically measured.",
    ],"owner-authorized-recipe-estimate")

def full_nutrition_estimate(tier):
    return r.total(thai_basil_beef(tier))

def menu_macros(tier):
    cal,protein,carbs,fiber,fat = r.display(r.menu_total(thai_basil_beef(tier)))
    return dict(cal=cal,protein=protein,carbs=carbs,fiber=fiber,fat=fat)
