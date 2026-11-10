"""Generate the controlled active-batch label dataset."""

from __future__ import annotations

import json
import hashlib
import subprocess
from collections import defaultdict
from pathlib import Path

import calculate_next_menu as draft
import generate_label_data as active_labels


OUTPUT = Path(__file__).resolve().parent / "next-menu-label-data.js"
PROOF_OUTPUT = Path(__file__).resolve().parent / "batch13-label-proof-data.js"
ROOT = Path(__file__).resolve().parents[2]

EACH_GRAMS = {
    **active_labels.EACH_GRAMS,
    "sourdough_slice": 40,
    "hawaiian_roll": 43,
    "kings_hawaiian_roll": 28,
    "biscoff_cookie": 8,
    "english_muffin": 57,
    "beef_bacon": 20,
    "lasagna_sheet": 17,
    "corn_street_tortilla": 15,
}

ESTIMATED_NET_WEIGHTS = {
    # Owner-approved October 7 estimates. These are finished-food estimates,
    # not raw ingredient sums. Replace them only when a recorded finished
    # weight is deliberately adopted as the new label basis.
    ("Blueberry Vanilla Protein Baked Oatmeal Squares", "lean"): 272,
    ("Blueberry Vanilla Protein Baked Oatmeal Squares", "bulk"): 408,
    ("Cheesy Achiote Chicken Tacos", "lean"): 365,
    ("Cheesy Achiote Chicken Tacos", "bulk"): 465,
    ("Caprese Protein Pasta Box", "single"): 336,
    ("Braised Beef Short Rib", "lean"): 465,
    ("Braised Beef Short Rib", "bulk"): 605,
    # Owner-approved October 21 working estimates. These use the controlled
    # cooked chicken and cooked-rice targets plus the measured glaze inputs.
    # Replace them after a representative finished container is weighed.
    ("Sweet Chili Chicken with Rice", "lean"): 354,
    ("Sweet Chili Chicken with Rice", "bulk"): 458,
    # October 29 owner explicitly approved final recipe-based estimates.
    # Orzo: cooked chicken and starch targets, 80% retention for zucchini,
    # carrot/onion/garlic, other formula inputs retained; rounded down to 5 g.
    # Popcorn: 120 g cooked meat, all coating/oil/spices, egg white at 70%
    # finished mass (water loss only); 165.95 g model rounded down to 165 g.
    ("Lemon Herb Chicken Orzo", "lean"): 385,
    ("Lemon Herb Chicken Orzo", "bulk"): 510,
    ("Oven-Baked Popcorn Chicken", "single"): 165,
    # November 5 owner-approved estimate for the current 78 g raw-thigh wrap.
    # 58.5 g modeled cooked thigh, 43 g tortilla, 62 g produce and 25 g
    # incorporated sauce. Excludes raw-contact marinade; round down to 5 g.
    ("Chicken Tikka Snack Wrap", "single"): 185,
}

# Owner-approved benchmark for the main meal only. The separate Sweet Heat cup
# is not included in the displayed kofta calories or macros.
MEAL_ONLY_LABEL_NUTRITION = {
    "High-Protein Beef Kofta & Roasted Vegetables",
    "Custom Lean Chicken Mince",
}

# These recipes have controlled component targets but no defensible finished
# package weight yet. Label Studio must collect the actual packed net weight
# instead of printing a dry-input or pre-cook ingredient sum as the net weight.
PACKOUT_WEIGHT_REQUIRED = {"Lemon Herb Chicken Orzo", "Chicken Tikka Snack Wrap"}

DISPLAY_INGREDIENTS = {
    "barilla_orzo_dry": "Barilla Classic Orzo (semolina [wheat], durum wheat flour, niacin, iron [ferrous sulfate], thiamin mononitrate, riboflavin, folic acid)",
    **active_labels.DISPLAY_INGREDIENTS,
    "mushroom": "white mushrooms",
    "sourdough_slice": "sourdough bread",
    "sriracha": "sriracha sauce",
    "oats": "rolled oats",
    "chia": "chia seeds",
    "flour": "all-purpose flour",
    "baking_powder": "baking powder",
    "hawaiian_roll": "bakery roll",
    "kings_hawaiian_roll": "King's Hawaiian Original Sweet Roll",
    "hot_sauce": "Sriracha sauce",
    "sunflower_oil": "sunflower oil",
    "bbq_sauce": "G Hughes Original Sugar-Free BBQ Sauce",
    "protein_mac": "Muscle Mac high-protein macaroni and cheese",
    "beef_strips_cooked": "lean beef strips",
    "apple": "apple",
    "sesame_oil": "sesame oil",
    "cornstarch": "cornstarch",
    "cucumber": "cucumber",
    "shrimp_cooked": "shrimp",
    "edamame": "shelled edamame",
    "ny_strip_cooked": "New York strip steak",
    "peanut_butter": "peanut butter",
    "chocolate_chips": "semisweet chocolate chips",
    "biscoff_spread": "Lotus Biscoff cookie butter",
    "biscoff_cookie": "Lotus Biscoff cookies",
    "banana_pudding_mix": "sugar-free banana pudding mix",
    "blueberry": "blueberries",
    "green_bell_pepper": "green bell pepper",
    "carrot": "carrots",
    "zucchini": "zucchini",
    "english_muffin": "English muffin",
    "beef_bacon": "halal beef breakfast slices",
    "tilapia_cooked": "tilapia",
    "pink_salmon_raw": "wild-caught pink salmon",
    "quinoa_dry": "quinoa",
    "green_beans": "green beans",
    "black_beans": "black beans",
    "cannellini_beans": "cannellini beans",
    "parmesan": "Parmesan cheese",
    "croutons": "seasoned croutons",
    "mixed_vegetables": "mixed vegetables",
    "canned_peas_carrots": "peas and carrots",
    "harissa": "harissa paste",
    "coriander": "ground coriander",
    "reduced_cream_cheese": "reduced-fat cream cheese",
    "instant_potato_flakes": "Idahoan Original mashed potato flakes (potatoes, monoglycerides, sodium acid pyrophosphate, sodium bisulfite, citric acid, mixed tocopherols)",
    "beef_96_raw": "96/4 lean ground beef",
    "beef_96_cooked_drained": "96/4 lean ground beef",
    "chicken_mince_cooked": "pure chicken-breast mince",
    "part_skim_ricotta": "part-skim ricotta cheese",
    "part_skim_mozzarella": "part-skim mozzarella cheese",
    "marinara": "marinara sauce",
    "lasagna_sheet": "oven-ready wheat lasagna",
    "hummus": "hummus",
    "feta": "feta cheese",
    "olives": "black olives",
    "enchilada_sauce": "red enchilada sauce",
    "apple_cider_vinegar": "apple cider vinegar",
    "lavash": "whole-wheat lavash",
    "bok_choy": "bok choy",
    "red_bell_pepper": "red bell pepper",
    "basil": "fresh basil",
    "rice_vinegar": "unseasoned rice vinegar",
    "balsamic_vinegar": "balsamic vinegar",
    "hoisin": "hoisin sauce",
    "olive_oil": "olive oil",
    "white_pepper": "ground white pepper",
    "chicken_thigh_standard_cooked": "chicken thighs",
}

# Use common ingredient names and retain source-confirmed compound-product
# identities where the formulation affects an allergen declaration. These names
# do not reconstruct unverified supplier sub-ingredient panels.
DISPLAY_INGREDIENTS.update({
    "buffalo_sauce": "Sweet Baby Ray's Mild Buffalo Wing Sauce",
    "fage": "FAGE Total 0% nonfat Greek yogurt",
    "light_mayo": "Great Value light mayonnaise",
    "regular_cream_cheese": "Philadelphia Original cream cheese",
    "shan_butter_chicken": "Shan Butter Chicken Recipe Mix (powder)",
    "shan_seekh": "Shan Seekh Kabab Recipe Mix",
    "bread_slice": "D'Italiano bread",
    "short_rib_cooked": "boneless beef short rib",
    "celery": "celery",
    "mozzarella": "fat-free mozzarella cheese",
    "cottage": "fat-free cottage cheese",
    "fairlife_milk": "fat-free milk",
    "whey": "whey protein powder",
    "whey_vanilla": "vanilla whey protein powder",
    "whey_chocolate": "chocolate whey protein powder",
    "maple_syrup": "sugar-free maple syrup",
    "philadelphia_no_bake": "no-bake cheesecake filling",
    "ketchup": "ketchup",
    "mustard": "prepared Dijon mustard",
    "sweet_chili": "G Hughes Sugar-Free Sweet Chili Sauce",
    "small_tortilla": "Mission Carb Balance wheat tortilla",
    "street_taco_tortilla": "high-fiber whole-wheat street-taco tortilla",
    "fajita_tortilla": "Mission Carb Balance Fajita flour tortilla",
    "pickles": "house refrigerator-pickled vegetables",
    "avocado_oil": "avocado oil",
    "red_onion": "red onion",
    "parsley": "flat-leaf parsley",
})

ALLERGENS = {
    "barilla_orzo_dry": "wheat",
    "kikkoman_panko": "wheat",
    "shan_biryani": "soy",
    "shan_seekh": "soy",
    "shan_butter_chicken": "soy",
    "sweet_chili": "soy",
    **active_labels.ALLERGENS,
    "sourdough_slice": "wheat",
    "flour": "wheat",
    "hawaiian_roll": ("sesame", "soy", "wheat"),
    "kings_hawaiian_roll": ("egg", "milk", "soy", "wheat"),
    "protein_mac": ("milk", "wheat"),
    "soy_sauce": ("soy", "wheat"),
    # Batch 16 uses Sweet Baby Ray's Mild Buffalo Wing Sauce. Its retail
    # ingredient panel lists Parmesan, nonfat milk, whey protein concentrate,
    # and natural flavor derived from milk.
    "buffalo_sauce": "milk",
    "hoisin": ("soy", "wheat"),
    "shrimp_cooked": "shellfish",
    "peanut_butter": "peanut",
    "chocolate_chips": ("milk", "soy"),
    "biscoff_spread": ("soy", "wheat"),
    "biscoff_cookie": ("soy", "wheat"),
    "english_muffin": "wheat",
    "beef_bacon": "soy",
    "tilapia_cooked": "fish",
    "pink_salmon_raw": "fish",
    "parmesan": "milk",
    "thai_redboat_40n": "fish (anchovy)",
    "lamb18_fairlife_milk": "milk",
    "lamb18_butter": "milk",
    "lamb18_flour": "wheat",
    "batch18_feta": "milk",
    "batch18_edamame": "soy",
    "shake_fairlife_fatfree": "milk",
    "shake_fage_0": "milk",
    "gainful_everyday_whey_unflavored": "milk",
    "croutons": ("wheat",),
    "reduced_cream_cheese": "milk",
    "fajita_tortilla": "wheat",
    "street_taco_tortilla": "wheat",
    "whey_vanilla": "milk",
    "whey_chocolate": "milk",
    "part_skim_ricotta": "milk",
    "part_skim_mozzarella": "milk",
    "lasagna_sheet": "wheat",
    "hummus": "sesame",
    "feta": "milk",
    "lavash": "wheat",
    "regular_cream_cheese": "milk",
    "penne_dry": "wheat",
    "oreo_pudding_mix": ("wheat", "soy"),
}

# Mandatory major-allergen declarations stay separate from supplier
# cross-contact warnings and other sensitivity statements.
ALLERGEN_ADVISORIES = {
    "barilla_orzo_dry": "Supplier advisory: may contain egg. Verify the exact purchased package.",
    "shan_butter_chicken": "Supplier advisory: may contain sesame and tree nuts. The supplier also flags gluten, sulfites, and mustard.",
    "shan_seekh": "Supplier advisory: may contain sesame and tree nuts. The supplier also flags gluten, sulfites, and mustard.",
    "instant_potato_flakes": "Contains sulfites (sodium bisulfite).",
}

META = {
    "Oven-Baked Popcorn Chicken": ("Bite-size chicken thighs with a seasoned plain cornflake coating, oven-baked with measured oil. Dip selected separately.", "Crunchy bites. Big flavor.", "fridge"),
    "Lemon Herb Chicken Orzo": ("Chicken thighs, lemon-herb orzo, and roasted zucchini and carrots.", "Lemon, herbs, and a complete chicken meal.", "fridge"),
    "Blueberry Vanilla Protein Baked Oatmeal Squares": ("Blueberry-vanilla baked oatmeal squares with egg whites, Greek yogurt, banana, and protein powder.", "Keep chilled. Reheat only when ready to eat.", "fridge"),
    "Cheesy Achiote Chicken Tacos": ("Achiote-citrus chicken thighs, melted cheese, pickled onion, Cotija, and cilantro in street-size corn tortillas.", "Physical taco fit and hold testing remain required.", "fridge"),
    "Garlic Butter Wild Argentine Shrimp + Rice": ("Garlic-butter Wild Argentine red shrimp with basmati rice, zucchini, and peas and carrots.", "Reheat gently to protect the shrimp texture.", "fridge"),
    "Egg Bites with Potato Hash": ("Spinach, tomato, jalapeno, cottage-cheese egg bites with seasoned potato hash.", "Sixty grams per well. Zero mystery leftovers.", "fridge"),
    "Chinese-Style Bok Choy Chicken": ("Ginger-hoisin chicken thighs with bok choy, red pepper, scallions, and rice. No fish sauce or tamari.", "Takeout energy. Weekday discipline.", "freezer"),
    "Caprese Protein Pasta Box": ("Protein rotini, cannellini beans, mozzarella, tomatoes, and basil finished with a measured balsamic-yogurt drizzle.", "Caprese packed a lunch.", "fridge"),
    "Peri Peri Chicken": ("Oven-roasted peri peri chicken leg quarters with basmati rice.", "A little fire. A lot of chicken.", "fridge"),
    "Creamy Cajun Chicken Pasta": ("Cajun chicken thighs and protein spaghetti in a creamy crushed-tomato sauce, made without broth.", "Creamy, Cajun, and booked all week.", "fridge"),
    "Oreo Protein Cheesecake Cup": ("Cottage-cheese protein cream with Oreo pudding, cocoa-syrup drizzle, and Oreo Thin garnish.", "A chilled cookies-and-cream dessert.", "fridge"),
    "High Protein Omelette": ("Eggs, vegetables, fat-free cheese, and sourdough.", "Breakfast that actually keeps up.", "fridge"),
    "Beef Breakfast Skillet": ("Seasoned beef, potato, egg, red onion, and fat-free cheese.", "A skillet without the skillet-sized cleanup.", "fridge"),
    "Power Bowl": ("Seasoned chicken, roasted potatoes, eggs, cheese, and PRPD Sweet Heat Sauce.", "The name is doing exactly what it says.", "fridge"),
    "French Toast": ("Protein French toast with fruit, whipped cream, and sugar-free maple syrup.", "Breakfast can still feel like breakfast.", "fridge"),
    "Breakfast Quesadilla": ("Seasoned chicken, a measured egg-and-egg-white base, and cheese in high-fiber tortillas.", "A high-protein breakfast built to travel.", "fridge"),
    "Strawberry Cheesecake Protein Pancakes": ("Protein pancakes with strawberry compote and cheesecake-yogurt topping.", "Pancakes dressed like cheesecake.", "fridge"),
    "Blueberry Cheesecake Protein Pancakes": ("Protein pancakes with blueberry compote, cheesecake-yogurt topping, and sugar-free maple syrup.", "Pancakes dressed like cheesecake.", "fridge"),
    "PRPD Beef Bacon Breakfast Sandwich": ("Beef bacon, an egg-and-egg-white patty, cheese, and PRPD Sweet Heat Sauce. Lean includes one sandwich with breakfast potatoes; Bulk includes two sandwiches with no potatoes.", "The breakfast sandwich cleaned up its macros.", "fridge"),
    "Grilled Cheese Breakfast Burrito": ("Seasoned beef, eggs, egg whites, cheese, and onion in grilled high-fiber tortillas.", "Breakfast understood the assignment.", "fridge"),
    "Loaded Beef Cottage Pie": ("Betty Crocker mashed potatoes topped with seasoned beef, vegetables, mozzarella, and cilantro, with PRPD Sweet Heat sauce.", "Comfort food with the numbers handled.", "freezer"),
    "Loaded Buffalo Chicken Potato": ("Buffalo chicken over a loaded roasted potato with broccoli.", "Loaded potato, handled.", "freezer"),
    "Beef Seekh Kabab Shawarma": ("Seasoned beef seekh, fresh salad, house refrigerator pickles, and garlic yogurt sauce in shawarma bread.", "Kebab rolled up with somewhere to be.", "fridge"),
    "Harissa Honey Chicken": ("Sweet-spicy harissa honey chicken with basmati rice and roasted broccoli.", "Sweet, smoky heat built for the week.", "freezer"),
    "Cheeseburger Hot Pockets": ("Handmade yogurt dough filled with seasoned beef and cheese.", "The drive-thru wishes it thought of this.", "freezer"),
    "Mexican Streetcorn Chicken Bowl": ("Chicken, basmati rice, and creamy Mexican street corn.", "Street corn brought chicken. We brought the container.", "freezer"),
    "Halal Cart Chicken + Yellow Rice": ("Seasoned chicken thighs, yellow basmati rice, lettuce, and tomato.", "Street-cart energy, meal-prep discipline.", "freezer"),
    "Lemon Pepper Tilapia with Garlic Potatoes": ("Lemon-pepper tilapia with roasted garlic potatoes and broccoli.", "Bright lemon, cracked pepper, and a full meal-prep build.", "fridge"),
    "Hot Honey Chicken Sliders": ("Hot-honey chicken, mozzarella, and onion on King's Hawaiian Original Sweet Rolls.", "Sweet heat. Very little chance of leftovers.", "freezer"),
    "Chicken Biryani": ("Spiced halal chicken and fragrant basmati rice.", "Rice with range. Chicken with receipts.", "freezer"),
    "Butter Chicken": ("Broth-free butter chicken in a tomato, yogurt, garlic, and ginger sauce with basmati rice.", "Comfort food with the numbers handled.", "freezer"),
    "BBQ Chicken Mac & Cheese": ("BBQ chicken, high-protein mac and cheese, fat-free mozzarella, and a matching BBQ sauce cup.", "Mac and cheese finally joined the program.", "freezer"),
    "Custom Lebanese Chicken + Fattoush-Style Salad": ("Lebanese-style chicken breast with lettuce, cucumber, tomato, red onion, parsley, and measured lemon dressing.", "A custom lean-protein pilot with the hot and cold components kept separate.", "fridge"),
    "Korean Bulgogi Beef Bowl": ("Marinated beef, rice, and stir-fried broccoli, peppers, and carrots.", "Sticky, savory, and worth every bite.", "freezer"),
    "Garlic Butter Shrimp + Rice": ("Garlic-butter shrimp, basmati rice, peas and carrots, zucchini, and lemon.", "Garlic butter did what it had to do.", "freezer"),
    "Premium NY Strip Steak": ("New York strip steak with Idahoan Original garlic mash, broccoli, and Honey Barbecue Mustard sauce.", "Yes, meal prep can look like this.", "fridge"),
    "Sweet Chili Chicken with Vegetable Rice": ("Sweet-chili chicken with basmati vegetable rice.", "Sweet heat without the sugar crash.", "freezer"),
    "Sweet Chili Chicken with Rice": ("Sweet-chili glazed chicken thighs with plain basmati rice and a matching Sweet Chili sauce cup.", "Sweet heat without the sugar crash.", "freezer"),
    "Meatball Arrabbiata Pasta": ("Beef meatballs and protein pasta in a slow-simmered arrabbiata sauce.", "A pasta night that still tracks.", "freezer"),
    "Cajun Garlic Salmon": ("Cajun-garlic wild pink salmon with lemon-herb quinoa and roasted green beans.", "A seafood meal with sides that actually bring something new.", "fridge"),
    "Southwest Beef Taco Bowl": ("Seasoned beef, cilantro-lime rice, black beans, corn and peppers, lettuce, and cotija.", "Taco night, bowl format, macros handled.", "fridge"),
    "Creamy Garlic Parmesan Chicken Pasta": ("Seasoned chicken thighs, protein pasta, and broccoli in a lighter garlic-Parmesan sauce made without heavy cream.", "Creamy pasta with a measured high-protein build.", "freezer"),
    "Strawberry Cheesecake": ("Strawberry protein cheesecake with a ladyfinger crust.", "The dessert cup that started it all.", "fridge"),
    "Chocolate-Dipped Cookie Dough Balls": ("Three protein cookie-dough balls with a measured chocolate coating.", "No oven. No waiting. No judgment.", "fridge"),
    "Chocolate Oreo Mousse": ("Chocolate protein mousse finished with Oreo Thins.", "Dessert first? We support that decision.", "fridge"),
    "Baked Strawberry-Lemon Protein Cheesecake": ("Crustless baked strawberry-lemon protein cheesecake.", "Real baked cheesecake texture with the protein handled.", "fridge"),
    "Lotus Biscoff Cheesecake": ("Protein cheesecake with Biscoff cookie butter and a cookie crust.", "Biscoff made it. Your macros survived.", "fridge"),
    "Banana Cream Pie Cup": ("Banana protein cream with a Biscoff cookie finish.", "The banana had bigger plans.", "fridge"),
    "High Protein Tiramisu": ("Chilled protein tiramisu with mascarpone cream and coffee-soaked ladyfingers.", "Coffee, cream, and a controlled protein build.", "fridge"),
    "Braised Beef Short Rib": ("Boneless portions of slow-braised beef short rib with garlic-rosemary mashed potatoes, roasted garlic green beans, and reduced pan jus.", "A slow-braised premium meal with every bone removed before portioning.", "fridge"),
    "PRPD Protein Box": ("Eggs, halal beef breakfast slices, cheese, fruit, and cucumber.", "Protein, packed and ready.", "fridge"),
    "Mini Chicken Snack Wrap": ("One high-fiber medium wrap with seasoned chicken, cheese, fresh chopped salad, and house sauce.", "One wrap. Fully loaded.", "fridge"),
    "Strawberry Protein Overnight Oats": ("Strawberry protein overnight oats with Greek yogurt, chia, and honey.", "Twelve ounces of grab-and-go breakfast.", "fridge"),
    "Chicken Caesar Crunch Box": ("Chilled chicken, crisp lettuce, cucumber, Parmesan, house yogurt-Caesar dressing, and croutons packed separately.", "A chilled lunch box that keeps the crunch separate.", "fridge"),
    "Chicken Tikka Snack Wrap": ("One high-fiber medium wrap with yogurt-spiced chicken thigh, crisp vegetables, and a chilled yogurt-herb finish.", "Tikka took the compact route.", "fridge"),
    "Chicken Shakshuka": ("Seasoned chicken and eggs in a tomato-pepper shakshuka sauce with toasted bread.", "Eggs in tomato sauce. Main-character breakfast.", "fridge"),
    "Creamy Chicken Parmesan": ("Breadcrumb-coated chicken thighs and protein pasta in a creamy tomato-Parmesan sauce.", "Chicken Parmesan with the protein handled.", "freezer"),
    "Mediterranean Chicken Bowl": ("Seasoned chicken and rice with cucumber, tomato, hummus, feta, olives, and red onion.", "Hot protein, cold Mediterranean finish.", "fridge"),
    "Thai Basil Beef + Jasmine Rice": ("Garlic-chili beef with fresh basil, jasmine rice, and roasted green beans.", "Garlic, chili, and fresh basil.", "fridge"),
    "Rosemary-Garlic Lamb Shoulder": ("Slow-roasted lamb shoulder with garlic mash, green beans, and pan gravy.", "Slow-roasted with rosemary and garlic.", "fridge"),
    "Lemon-Feta Chickpea & Edamame Crunch Box": ("Chickpeas, edamame, crisp vegetables, feta, and lemon dressing.", "Bright lemon and plenty of crunch.", "fridge"),
    "Strawberry Protein Shake": ("Strawberry, banana, fat-free milk, Greek yogurt, and unflavored whey, finished with strawberry pieces.", "Real strawberry in every sip.", "fridge"),
    "Tandoori Chicken": ("Tandoori-spiced bone-in chicken leg quarters with basmati rice and roasted broccoli.", "A measured bone-in tandoori build for the week.", "freezer"),
    "Pepper Steak Bowl": ("Lean beef strips with peppers, onions, basmati rice, and a savory garlic sauce.", "Pepper steak, bowl format.", "freezer"),
    "Chicken Enchilada Bake": ("Layered chicken, high-fiber tortillas, corn, red enchilada sauce, and cheese.", "Layered, loaded, and not here to be subtle.", "freezer"),
    "High-Protein Beef Lasagna": ("Thoroughly drained ground beef, PRPD house tomato sauce, oven-ready pasta, part-skim ricotta, mozzarella, and Parmesan.", "Classic lasagna structure with a measured high-protein build.", "freezer"),
    "Chocolate Peanut Butter Protein Brownie": ("A baked chocolate protein brownie with PBfit and semisweet chocolate.", "Chocolate and peanut butter, with the protein handled.", "fridge"),
    "Buffalo Chicken Pinwheels": ("Four chilled pinwheel pieces cut from one 70-calorie Mission tortilla with buffalo chicken, regular cream cheese, cheese, lettuce, and red onion.", "Buffalo chicken in its snack era.", "fridge"),
    "BBQ Chicken Lavash Flatbread": ("Four smoky honey-lime BBQ chicken lavash wedges with fat-free mozzarella and red onion.", "A crisp, protein-forward flatbread built for Grab & Go.", "fridge"),
    "Mediterranean Chicken Hummus Box": ("Chicken, hummus, flatbread, cucumber, tomato, feta, olives, and red onion.", "Dip happens. Bring hummus.", "fridge"),
    "High-Protein Beef Kofta & Roasted Vegetables": ("Oven-baked 96/4 beef kofta with a separate cucumber-tomato kachumber and two separate PRPD Sweet Heat cups.", "Five measured kofta, fresh kachumber, and both sauce cups packed separately.", "fridge"),
    "Custom Lean Chicken Mince": ("Moist lean chicken qeema with a separate cucumber-tomato kachumber, lemon-mustard-garlic dressing, and PRPD Sweet Heat.", "Moist chicken qeema with fresh kachumber and two measured cups.", "fridge"),
    "Custom Lebanese-Style Chicken Breast": ("Lebanese-style chicken breast with a cold fattoush-style salad and measured lemon-mustard-garlic dressing packed separately.", "Hot chicken, crisp salad, one complete custom meal.", "fridge"),
}

REHEAT = {
    "Oven-Baked Popcorn Chicken": "Transfer to an oven-safe tray and reheat in an oven or air fryer until 165 F throughout. Remove any cold dip. Microwave reheating gives a softer coating.",
    "Lemon Herb Chicken Orzo": "Vent lid and microwave until hot throughout, stirring the orzo halfway.",
    "Blueberry Vanilla Protein Baked Oatmeal Squares": "Microwave 30-60 seconds, or enjoy chilled. Keep refrigerated.",
    "Cheesy Achiote Chicken Tacos": "Reheat tacos until hot throughout.",
    "Garlic Butter Wild Argentine Shrimp + Rice": "Remove cold sauce. Vent lid and microwave at 50% power for 1-2 minutes, stirring halfway, until hot throughout.",
    "Egg Bites with Potato Hash": "Vent lid and microwave 60-90 seconds, or until the egg bites and potato hash are hot throughout.",
    "Chinese-Style Bok Choy Chicken": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Caprese Protein Pasta Box": "Enjoy chilled. The measured balsamic-yogurt dressing is already drizzled over the box. Do not heat the assembled box.",
    "Peri Peri Chicken": "Vent lid and microwave until hot throughout. Check around the bone; remove cold sauce before heating.",
    "Creamy Cajun Chicken Pasta": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout. Add a small splash of water if needed.",
    "Oreo Protein Cheesecake Cup": "Serve chilled. Do not heat.",
    "High Protein Omelette": "Microwave 60-90 seconds, or until hot. Toast bread separately if desired.",
    "Power Bowl": "Remove sauce cup. Microwave 1-2 minutes, stirring halfway, until hot throughout.",
    "French Toast": "Remove syrup cup. Microwave 45-75 seconds, or until hot; add fruit, whipped cream, and syrup after heating.",
    "Breakfast Quesadilla": "Microwave 60-90 seconds, or air fry at 350 F for 3-5 minutes, until hot throughout.",
    "Strawberry Cheesecake Protein Pancakes": "Remove cold toppings. Microwave pancakes 45-75 seconds; add toppings after heating.",
    "Blueberry Cheesecake Protein Pancakes": "Remove cold toppings and syrup. Microwave pancakes 45-75 seconds; add toppings after heating.",
    "PRPD Beef Bacon Breakfast Sandwich": "Microwave 45-60 seconds. For a toasted finish, air fry at 350 F for 3-5 minutes.",
    "Grilled Cheese Breakfast Burrito": "Microwave 60-90 seconds, or air fry at 350 F for 3-5 minutes, until hot throughout.",
    "Loaded Beef Cottage Pie": "Remove sauce cup. Vent lid and microwave 2-3 minutes, or until hot throughout. Rest 1 minute.",
    "Hot Honey Chicken Sliders": "Microwave 45-75 seconds, or air fry at 350 F for 3-5 minutes, until hot throughout.",
    "Loaded Buffalo Chicken Potato": "Vent lid and microwave 2-3 minutes, stirring halfway, until hot throughout.",
    "Beef Seekh Kabab Shawarma": "Microwave 60-90 seconds, or air fry at 350 F for 3-5 minutes, until the beef is hot throughout.",
    "Harissa Honey Chicken": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Korean Bulgogi Beef Bowl": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Garlic Butter Shrimp + Rice": "Vent lid and microwave at 50% power for 1-2 minutes, stirring halfway, to avoid overcooking shrimp.",
    "BBQ Chicken Mac & Cheese": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout. Add the matching BBQ sauce from the customer bag after heating.",
    "Custom Lebanese Chicken + Fattoush-Style Salad": "Remove the cold salad and dressing. Vent the chicken container and microwave 1-2 minutes, or until hot throughout. Add the cold salad and dressing after heating.",
    "Mexican Streetcorn Chicken Bowl": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Halal Cart Chicken + Yellow Rice": "Remove the cold lettuce and tomato. Microwave chicken and rice 1.5-2 minutes until hot throughout, then add the cold vegetables.",
    "Lemon Pepper Tilapia with Garlic Potatoes": "Microwave at 50% power for 1-2 minutes, or until hot, to avoid overcooking fish.",
    "Premium NY Strip Steak": "Remove the Honey Barbecue Mustard cup. Microwave at 50% power for 1-2 minutes, or until hot, to reduce overcooking.",
    "Cheeseburger Hot Pockets": "Air fry at 350 F for 5-7 minutes. Or microwave 45-75 seconds until hot throughout.",
    "Sweet Chili Chicken with Vegetable Rice": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Sweet Chili Chicken with Rice": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout. Add the matching Sweet Chili sauce from the customer bag after heating.",
    "Meatball Arrabbiata Pasta": "Vent lid and microwave 2-3 minutes, stirring halfway, until hot throughout.",
    "Chicken Biryani": "Remove the green sauce cup. Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout. Add the cold sauce after heating.",
    "Butter Chicken": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Cajun Garlic Salmon": "Vent lid and microwave at 50% power for 1-2 minutes, or until hot, to avoid overcooking the salmon.",
    "Southwest Beef Taco Bowl": "Remove lettuce. Vent lid and microwave the hot components 1.5-2.5 minutes, then add cold toppings.",
    "Creamy Garlic Parmesan Chicken Pasta": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Chocolate-Dipped Cookie Dough Balls": "Serve chilled. Do not heat.",
    "Chocolate Oreo Mousse": "Serve chilled. Do not heat.",
    "Baked Strawberry-Lemon Protein Cheesecake": "Serve chilled. Do not heat.",
    "Strawberry Cheesecake": "Serve chilled. Do not heat.",
    "Banana Cream Pie Cup": "Serve chilled. Do not heat.",
    "High Protein Tiramisu": "Serve chilled. Do not heat.",
    "Braised Beef Short Rib": "Loosen the lid and microwave 2 minutes. Turn the beef, stir the potatoes, then heat in 30-second intervals until the center reaches 165 F. Rest covered 1 minute.",
    "Lotus Biscoff Cheesecake": "Serve chilled. Do not heat.",
    "PRPD Protein Box": "Enjoy chilled. Do not heat the assembled box.",
    "Mini Chicken Snack Wrap": "Enjoy chilled, or microwave 30-45 seconds if preferred.",
    "Strawberry Protein Overnight Oats": "Enjoy chilled. Stir before eating. Do not heat the sealed cup.",
    "Chicken Caesar Crunch Box": "Enjoy chilled. Add dressing and croutons immediately before eating. Do not heat the assembled box.",
    "Chicken Tikka Snack Wrap": "Enjoy chilled. Do not heat the assembled wrap.",
    "Beef Breakfast Skillet": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Chicken Shakshuka": "Remove bread. Vent lid and microwave 1.5-2 minutes, until hot throughout. Toast bread separately if desired.",
    "Creamy Chicken Parmesan": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Mediterranean Chicken Bowl": "Remove the cold toppings and hummus. Microwave chicken and rice 1.5-2 minutes, then add the cold components.",
    "Thai Basil Beef + Jasmine Rice": "Vent lid and microwave until hot throughout, stirring halfway.",
    "Rosemary-Garlic Lamb Shoulder": "Vent lid and microwave until hot throughout. Stir the mash and gravy halfway.",
    "Lemon-Feta Chickpea & Edamame Crunch Box": "Serve chilled. Do not heat.",
    "Strawberry Protein Shake": "Serve chilled. Shake gently before drinking. Do not heat.",
    "Tandoori Chicken": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Pepper Steak Bowl": "Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout.",
    "Chicken Enchilada Bake": "Vent lid and microwave 2-3 minutes, until hot throughout. Rest 1 minute.",
    "High-Protein Beef Lasagna": "Vent lid and microwave 2-3 minutes, until hot throughout. Rest 1 minute.",
    "Chocolate Peanut Butter Protein Brownie": "Enjoy chilled or bring to room temperature. Do not microwave in the sealed container.",
    "Buffalo Chicken Pinwheels": "Enjoy chilled. Do not heat the assembled box.",
    "BBQ Chicken Lavash Flatbread": "Air fry at 350 F for 3-5 minutes for the best texture, or microwave 45-60 seconds until hot.",
    "Mediterranean Chicken Hummus Box": "Enjoy chilled. Do not heat the assembled box.",
    "High-Protein Beef Kofta & Roasted Vegetables": "Remove the kachumber and both sauce cups. Vent lid and microwave 1.5-2.5 minutes, until hot throughout. Add sauce after heating and serve with the cold kachumber.",
    "Custom Lean Chicken Mince": "Remove the kachumber and both cold cups. Vent lid and microwave 1.5-2.5 minutes, stirring halfway, until hot throughout. Serve with the cold kachumber and add dressing and sauce after heating.",
    "Custom Lebanese-Style Chicken Breast": "Remove the cold salad and dressing. Vent the chicken container and microwave 1-2 minutes, or until hot throughout. Add the cold salad and dressing after heating.",
}


def grams_for(portion: draft.Portion) -> float:
    if portion.unit == "each":
        return portion.amount * EACH_GRAMS.get(portion.ingredient, 1)
    return portion.amount


def ingredient_statement(build: draft.Build) -> str:
    totals: dict[str, float] = defaultdict(float)
    for portion in build.portions:
        label = DISPLAY_INGREDIENTS.get(portion.ingredient, draft.active.INGREDIENTS[portion.ingredient].name.lower())
        totals[label] += grams_for(portion)
    return ", ".join(sorted(totals, key=totals.get, reverse=True)) + "."


def allergen_statement(build: draft.Build) -> str:
    found = set()
    for portion in build.portions:
        allergens = ALLERGENS.get(portion.ingredient, ())
        if isinstance(allergens, str):
            found.add(allergens)
        else:
            found.update(allergens)
    found = sorted(found)
    return "CONTAINS: " + ", ".join(item.upper() for item in found) + "." if found else "No major allergens identified from the recorded recipe."


def allergen_advisory(build: draft.Build) -> str:
    advisories = []
    for portion in build.portions:
        advisory = ALLERGEN_ADVISORIES.get(portion.ingredient)
        if advisory and advisory not in advisories:
            advisories.append(advisory)
    return " ".join(advisories)


def tier_data(build: draft.Build, label: str, meal_name: str = "") -> dict:
    if meal_name == "Oven-Baked Popcorn Chicken":
        from oven_baked_popcorn_chicken import website_tier
        result = website_tier(label)
        estimate = ESTIMATED_NET_WEIGHTS[(meal_name, label.lower())]
        result.update({
            "netWeight": f"{estimate / 28.3495:.1f} oz ({estimate} g)",
            "netWeightStatus": "estimated", "netWeightMeasured": False,
            "estimatedNetWeightGrams": estimate,
            "requiresPackoutWeight": False,
            "netWeightBasis": "October 29 owner-approved recipe-based finished-food estimate; no measured packout claimed",
        })
        result.pop("netWeightVerified", None)
        return result
    grams = round(sum(grams_for(portion) for portion in build.portions))
    menu_nutrition = active_labels.nutrition(draft.menu_total(build))
    complete_nutrition = active_labels.nutrition(draft.total(build))
    result = {
        "label": label.upper(),
        "netWeight": f"{grams / 28.3495:.1f} oz ({grams} g)",
        "ingredients": ingredient_statement(build),
        "allergens": allergen_statement(build),
        "allergenAdvisory": allergen_advisory(build),
        "menuNutrition": menu_nutrition,
        "nutrition": menu_nutrition if meal_name in MEAL_ONLY_LABEL_NUTRITION else complete_nutrition,
        "confidence": build.confidence,
    }
    if meal_name in MEAL_ONLY_LABEL_NUTRITION:
        result["nutritionBasis"] = "Main meal only; separate sauce cup excluded"
    if meal_name in PACKOUT_WEIGHT_REQUIRED:
        result.update({
            "inputMassGrams": grams,
            "netWeight": "Enter packed weight",
            "netWeightVerified": False,
            "netWeightStatus": "packout-required",
            "requiresPackoutWeight": True,
            "netWeightBasis": "Enter the actual packed net weight before printing.",
        })
    estimate = ESTIMATED_NET_WEIGHTS.get((meal_name, label.lower()))
    if estimate is not None:
        result.update({
            "inputMassGrams": grams,
            "netWeight": f"{estimate / 28.3495:.1f} oz ({estimate} g)",
            "netWeightStatus": "estimated",
            "netWeightMeasured": False,
            "estimatedNetWeightGrams": estimate,
            "netWeightBasis": "Owner-approved conservative finished-food estimate",
            "requiresPackoutWeight": False,
        })
        result.pop("netWeightVerified", None)
    return result


MENU_SECTIONS = (
    ("breakfasts", "Breakfast", ("lean", "bulk")),
    ("mains", "Main", ("lean", "bulk")),
    ("premium", "Premium meal", ("lean", "bulk")),
    ("desserts", "Dessert", ("single",)),
    ("addons", "Add-on", ("single",)),
)

# These builds are part of the locked production batch but are intentionally
# absent from the public order menu. Keeping them explicit here lets Label
# Studio print exact customer labels without exposing a private/custom order as
# a sellable menu card.
NOUMAN_BEEF_KOFTA = draft.nouman_kofta(draft)

NOUMAN_CHICKEN_MINCE = draft.build([
    draft.p("chicken_mince_cooked", 300 * 0.75, note="300g raw pure chicken-breast mince at a provisional 75% cooked yield"),
    draft.p("green_beans", 175), draft.p("red_onion", 50), draft.p("garlic", 6), draft.p("lemon", 15),
    draft.p("parsley", 5), draft.p("paprika", 1), draft.p("cumin", 0.5), draft.p("black_pepper", 0.5), draft.p("salt", 1),
], ["One complete main meal per label; no separate component labels."], "medium")

NOUMAN_LEBANESE_CHICKEN = draft.build([
    draft.p("chicken_breast_cooked", 225, note="300g raw chicken at the controlled 75% yield"),
    draft.p("lemon", 20), draft.p("garlic", 4), draft.p("avocado_oil", 3), draft.p("paprika", 1),
    draft.p("cumin", 0.5), draft.p("black_pepper", 0.5), draft.p("salt", 1), draft.p("lettuce", 60),
    draft.p("cucumber", 60), draft.p("tomato", 60), draft.p("red_onion", 15), draft.p("parsley", 5),
], ["The main-meal label covers the hot chicken, cold salad, and dressing as one complete meal; do not print separate salad or dressing labels."], "medium")

PLANNER_ONLY_LABEL_MEALS = (
    ("x1", "Harissa Honey Chicken", "Main", ("lean",), draft.with_batch8_purchased_oil(draft.harissa_honey_chicken("lean")), None),
    ("x2", "Loaded Buffalo Chicken Potato", "Main", ("lean",), draft.with_batch8_purchased_oil(draft.loaded_buffalo_revised("lean")), None),
)


def load_order_config() -> dict:
    """Read the current public weekly configuration without stale carryover."""
    command = (
        "const config=require('./config/order-config.js');"
        "process.stdout.write(JSON.stringify(config));"
    )
    try:
        result = subprocess.run(
            ["node", "-e", command],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)
    except (OSError, subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        raise RuntimeError("Could not load the active order configuration; label generation is blocked.") from exc


def assert_macro_parity(item: dict, tier_key: str, build: draft.Build) -> None:
    if item.get("name") == "Braised Beef Short Rib":
        return
    configured = item.get("bulkMacros") if tier_key == "bulk" else item.get("macros")
    if not isinstance(configured, dict):
        raise ValueError(f"{item['id']} {item['name']} is missing {tier_key} customer-menu macros.")
    fields = {"cal": "calories", "protein": "protein", "carbs": "carbs", "fiber": "fiber", "fat": "fat"}
    if item.get("name") == "Oven-Baked Popcorn Chicken":
        from oven_baked_popcorn_chicken import website_tier
        menu_nutrition = website_tier(tier_key)["menuNutrition"]
    else:
        menu_nutrition = active_labels.nutrition(draft.menu_total(build))
    for config_key, label_key in fields.items():
        # Older public cards omit fiber rather than asserting a zero value.
        # Validate every macro that the active menu actually publishes while
        # retaining the calculated fiber value in the generated label data.
        if config_key not in configured:
            continue
        if configured.get(config_key) != menu_nutrition.get(label_key):
            raise ValueError(
                f"{item['id']} {item['name']} {tier_key} {label_key} differs between "
                "the active order menu and controlled recipe calculator."
            )


def generate_payload(order_config: dict | None = None) -> dict:
    order_config = order_config or load_order_config()
    batch = order_config.get("batch") or {}
    production = batch.get("labelProduction") or {}
    menu = order_config.get("menu") or {}
    batch_number = batch.get("number")
    if not isinstance(batch_number, int) or batch_number < 1:
        raise ValueError("The active order configuration has no valid batch number.")
    required_production = ("madeDate", "useByDate", "batchId")
    if any(not production.get(field) for field in required_production) or not batch.get("deliveryDate"):
        raise ValueError("The active order configuration has incomplete label-production identity.")

    if batch_number == 13:
        import batch13_recipes as current
        raise ValueError('Batch 13 final labels are blocked by unresolved source and physical release gates: ' + '; '.join(f'{name}: {reason}' for name, reason in current.HOLDS.items()) + '. Do not overwrite the saved label dataset or reuse Batch 12 labels.')

    meals = {}
    current_registry = None
    recipes_by_name = {meal.name: meal for meal in draft.MEALS}
    if batch_number >= 14:
        import current_recipe_registry as current_registry
        recipes_by_name = dict(current_registry.RECIPES)
    elif len(recipes_by_name) != len(draft.MEALS):
        raise ValueError("The controlled recipe calculator contains duplicate dish names.")
    configured_names = set()
    for section_key, category, expected_tiers in MENU_SECTIONS:
        items = menu.get(section_key)
        if not isinstance(items, list):
            raise ValueError(f"The active order menu is missing its {section_key} section.")
        for item in items:
            meal_id = item.get("id")
            meal_name = item.get("name")
            if not meal_id or not meal_name:
                raise ValueError(f"The active {section_key} menu contains an item without an ID and name.")
            if meal_id in meals:
                raise ValueError(f"The active order menu repeats meal ID {meal_id}.")
            if meal_name in configured_names:
                raise ValueError(f"The active order menu repeats dish name {meal_name}.")
            configured_names.add(meal_name)
            meal = recipes_by_name.get(meal_name)
            if meal is None:
                raise ValueError(
                    f"{meal_id} {meal_name} is sellable but has no controlled current recipe; "
                    "label generation is blocked."
                )
            if current_registry is not None:
                builds = {tier: current_registry.recipe(meal_name, tier) for tier in expected_tiers}
            else:
                if meal.category != category:
                    raise ValueError(f"{meal_id} {meal_name} has recipe category {meal.category}, expected {category}.")
                recipe_tiers = ("single",) if meal.bulk is None else ("lean", "bulk")
                if recipe_tiers != expected_tiers:
                    raise ValueError(
                        f"{meal_id} {meal_name} has recipe tiers {recipe_tiers}, expected {expected_tiers}."
                    )
                builds = {expected_tiers[0]: meal.lean}
                if meal.bulk is not None:
                    builds["bulk"] = meal.bulk
            tiers = {
                tier: tier_data(build, "Single" if tier == "single" else tier.title(), meal_name)
                for tier, build in builds.items()
            }
            if meal_name == "Braised Beef Short Rib":
                for tier_key, tier_record in tiers.items():
                    configured = item.get("bulkMacros") if tier_key == "bulk" else item.get("macros")
                    controlled = dict(tier_record["nutrition"])
                    controlled.update({
                        "calories": configured["cal"],
                        "protein": configured["protein"],
                        "carbs": configured["carbs"],
                        "fiber": configured.get("fiber", 0),
                        "fat": configured["fat"],
                    })
                    tier_record["menuNutrition"] = controlled
                    tier_record["nutrition"] = controlled
                    tier_record["nutritionBasis"] = "Owner-approved Batch 15 recipe estimate"
            for tier_key, build_record in builds.items():
                assert_macro_parity(item, tier_key, build_record)
            try:
                description, note, storage = META[meal_name]
                reheat = REHEAT[meal_name]
            except KeyError as exc:
                raise ValueError(f"{meal_id} {meal_name} is missing controlled label copy.") from exc
            meals[meal_id] = {
                "name": meal_name,
                "category": category,
                "description": description,
                "note": note,
                "storageMode": storage,
                "reheat": reheat,
                "validation": (current_registry.HOLDS.get(meal_name, "Confirm actual finished yield and package weight before printing.")
                               if current_registry is not None else meal.validation),
                "decision": ("Current controlled registry" if current_registry is not None else meal.decision),
                "tiers": tiers,
            }

    unused_recipes = set(recipes_by_name) - configured_names
    if unused_recipes and current_registry is None:
        raise ValueError(
            "The controlled recipe calculator and active customer menu differ; unused recipes: "
            + ", ".join(sorted(unused_recipes))
        )

    planner_builds = PLANNER_ONLY_LABEL_MEALS
    if current_registry is not None:
        planner_builds = []
        for item in order_config.get("plannerOnly", []):
            meal_name = item["name"]
            if meal_name == "Mango Habanero Chicken Wings":
                # Private counted family wing boxes have no verified wing,
                # sauce or ranch panel/yield. Do not manufacture a food label.
                continue
            expected_tiers = tuple(current_registry.tiers_for(meal_name))
            built = [current_registry.recipe(meal_name, tier, batch_number) for tier in expected_tiers]
            planner_builds.append((item["id"], meal_name, "Internal custom meal", expected_tiers,
                                   built[0], built[1] if len(built) > 1 else None))
    for meal_id, meal_name, category, expected_tiers, lean_build, bulk_build in planner_builds:
        if meal_id in meals:
            raise ValueError(f"Planner-only label ID {meal_id} collides with the active customer menu.")
        if meal_name in configured_names:
            raise ValueError(f"Planner-only label name {meal_name} collides with the active customer menu.")
        tiers = {
            expected_tiers[0]: tier_data(
                lean_build,
                "Single" if expected_tiers == ("single",) else "Lean",
                meal_name,
            )
        }
        if bulk_build is not None:
            tiers["bulk"] = tier_data(bulk_build, "Bulk", meal_name)
        if tuple(tiers) != expected_tiers:
            raise ValueError(f"Planner-only label {meal_id} has tiers {tuple(tiers)}, expected {expected_tiers}.")
        try:
            description, note, storage = META[meal_name]
            reheat = REHEAT[meal_name]
        except KeyError as exc:
            raise ValueError(f"Planner-only label {meal_id} {meal_name} is missing controlled label copy.") from exc
        if batch_number == 18 and meal_name == "High-Protein Beef Kofta & Roasted Vegetables":
            description = "Oven-baked 96/4 beef kofta with separate cucumber-tomato kachumber and two PRPD Sweet Heat cups."
            note = "Five measured kofta, fresh kachumber, and two sauce cups packed separately."
            reheat = "Remove the kachumber and sauce cup. Vent lid and microwave 1.5-2.5 minutes, until hot throughout. Add sauce after heating and serve with the cold kachumber."
        meals[meal_id] = {
            "name": meal_name,
            "category": category,
            "description": description,
            "note": note,
            "storageMode": storage,
            "reheat": reheat,
            "validation": "Verify the locked customer tier, finished yield, and first filled weight before printing.",
            "decision": "Planner-only locked production item",
            "plannerOnly": True,
            "tiers": tiers,
        }

    recipe_fingerprint = hashlib.sha256(
        json.dumps(meals, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    ).hexdigest()

    return {
        "version": f"{production['madeDate']}-generated.2",
        "status": f"batch-{batch_number}-approved" if batch.get("published") is True else f"batch-{batch_number}-draft",
        "menuLabel": f"Batch {batch_number} - {batch['deliveryDate']}",
        "production": {
            "batchNumber": batch_number,
            "deliveryDate": batch["deliveryDate"],
            "madeDate": production["madeDate"],
            "useByDate": production["useByDate"],
            "batchId": production["batchId"],
            **({"completedAt": production["completedAt"]} if production.get("completedAt") else {}),
            **({"refrigeratedDays": production["refrigeratedDays"]} if production.get("refrigeratedDays") else {}),
        },
        "recipeFingerprint": recipe_fingerprint,
        "notice": f"Batch {batch_number} calculated label data generated from the active customer menu and controlled recipes. Resolve every listed physical validation gate before final printing.",
        "meals": meals,
    }


def generate_batch13_proof(order_config: dict | None = None) -> dict:
    """Current recipe-based Label Studio artwork; never a released food label."""
    import batch13_recipes as current

    order_config = order_config or load_order_config()
    batch = order_config['batch']
    if batch['number'] != 13:
        raise ValueError('Batch 13 proof generation requires Batch 13 to be active.')
    production = batch['labelProduction']
    meals = {}
    def proof_tier(record, label):
        # Ingredient input mass is not finished net weight. Rice gains water;
        # proteins and sauces lose moisture. Never turn the sum into a claim.
        result = tier_data(record, label)
        result['inputMassGrams'] = round(sum(grams_for(p) for p in record.portions), 2)
        result['netWeight'] = 'Not measured'
        result['netWeightVerified'] = False
        return result
    sections = (("breakfasts", "Breakfast", ("lean", "bulk")),
                ("mains", "Main", ("lean", "bulk")),
                ("desserts", "Dessert", ("single",)),
                ("addons", "Add-on", ("single",)))
    for section, category, tiers in sections:
        for item in order_config['menu'][section]:
            name = item['name']
            if name not in current.RECIPES:
                raise ValueError(f'{name} has no Batch 13 recipe.')
            builds = {tier: current.recipe(name, tier) for tier in tiers}
            description, note, storage = META.get(name, (item.get('description') or name, '', 'fridge'))
            if name == 'Creamy Garlic Parmesan Salmon':
                description = 'Salmon with rice, broccoli, and creamy garlic-Parmesan Alfredo sauce, including a separate sauce cup.'
                storage = 'fridge'
            if name == 'Boy Kibble':
                description = 'Seasoned beef with rice and one separate PRPD Sweet Heat sauce cup.'
            meals[item['id']] = {
                'name': name, 'category': category, 'description': description,
                'note': note or 'Current Batch 13 recipe estimate.',
                'storageMode': storage,
                'reheat': REHEAT.get(name, 'Heat until hot throughout. Remove cold sauce before heating.'),
                'productionHold': current.HOLDS.get(name, 'Finished weight and package verification pending.'),
                'tiers': {tier: proof_tier(build, 'Single' if tier == 'single' else tier) for tier, build in builds.items()},
            }
    planner_only = (
        ('bw1', 'Butter Chicken', ('lean', 'bulk')),
        ('bw2', 'Sweet Chili Chicken with Vegetable Rice', ('lean', 'bulk')),
        ('p1', 'High-Protein Beef Kofta & Roasted Vegetables', ('lean',)),
        ('p3', 'Custom Lebanese-Style Chicken Breast', ('lean',)),
    )
    for meal_id, name, tiers in planner_only:
        if name not in current.RECIPES:
            raise ValueError(f'{name} has no Batch 13 recipe.')
        description, note, storage = META[name]
        reheat = REHEAT[name]
        if name == 'Custom Lebanese-Style Chicken Breast':
            description = 'Lebanese-style chicken breast with separate lemon-mustard-garlic dressing and Sweet Heat cups.'
            note = 'Chicken with two measured sauce cups.'
            reheat = 'Remove cold sauce cups. Reheat chicken to 165 F.'
        meals[meal_id] = {
            'name': name, 'category': 'Main', 'description': description,
            'note': note, 'storageMode': storage, 'reheat': reheat,
            'plannerOnly': True,
            'productionHold': current.HOLDS.get(name, 'Finished weight and package verification pending.'),
            'tiers': {tier: proof_tier(current.recipe(name, tier), 'Single' if tier == 'single' else tier) for tier in tiers},
        }
    return {
        'version': '2026-10-05-batch13-review.2',
        'status': 'batch-13-unapproved-review-proof',
        'proofOnly': True,
        'menuLabel': f"Batch 13 - {batch['deliveryDate']}",
        'production': {
            'batchNumber': 13, 'deliveryDate': batch['deliveryDate'],
            'madeDate': production['madeDate'], 'useByDate': production['useByDate'],
            'batchId': production['batchId'],
        },
        'notice': 'DRAFT REVIEW ONLY. Not for food labeling. Finished weights and recipe release checks remain unverified.',
        'meals': meals,
    }


def main() -> None:
    if '--batch13-proof' in __import__('sys').argv:
        payload = generate_batch13_proof()
        PROOF_OUTPUT.write_text(
            'window.PRPD_BATCH13_PROOF_DATA = ' + json.dumps(payload, indent=2, ensure_ascii=True) + ';\n',
            encoding='utf-8',
        )
        print(PROOF_OUTPUT)
        return
    payload = generate_payload()
    OUTPUT.write_text(
        "window.PRPD_NEXT_LABEL_DATA = " + json.dumps(payload, indent=2, ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )
    print(OUTPUT)


if __name__ == "__main__":
    main()
