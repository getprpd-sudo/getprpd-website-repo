const PRPD_PRODUCTION_DATA = {
  "version": "batch-20-current-v2",
  "batch": 20,
  "notice": "Generated from the effective current order configuration. Missing current recipes stop generation instead of loading an archived batch. Recipe-required side cups come from the current structured service records; weekly promotional sauce rules must be added separately and explicitly. Owner-released production-run quality checks remain visible.",
  "meals": {
    "b1": {
      "name": "Beef Bacon Breakfast Pizza",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "flour",
              "sourceKey": "flour",
              "name": "All-purpose flour",
              "amount": 62.2223,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-dough; component:pizza-dough-spare",
              "confidence": "high",
              "allocations": {
                "pizza-dough": 59.5745,
                "pizza-dough-spare": 2.6478
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 37.7778,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:pizza-dough; component:pizza-dough-spare",
              "confidence": "high",
              "allocations": {
                "pizza-dough": 36.1702,
                "pizza-dough-spare": 1.6076
              }
            },
            {
              "key": "instant_yeast",
              "sourceKey": "instant_yeast",
              "name": "Instant baker's yeast",
              "amount": 0.8889,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-dough; component:pizza-dough-spare",
              "confidence": "low",
              "allocations": {
                "pizza-dough": 0.8511,
                "pizza-dough-spare": 0.0378
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.3333,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-dough; component:pizza-dough-spare",
              "confidence": "high",
              "allocations": {
                "pizza-dough": 1.2766,
                "pizza-dough-spare": 0.0567
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "olive_oil",
              "sourceKey": "olive_oil",
              "name": "Olive oil",
              "amount": 2.7223,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-dough; component:pizza-dough-spare; component:pizza-house-sauce",
              "confidence": "medium",
              "allocations": {
                "pizza-dough": 2.1277,
                "pizza-dough-spare": 0.0946,
                "pizza-house-sauce": 0.5
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.45,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "component:pizza-eggs",
              "confidence": "high",
              "allocations": {
                "pizza-eggs": 0.45
              }
            },
            {
              "key": "egg_white",
              "sourceKey": "egg_white",
              "name": "Liquid egg white",
              "amount": 80,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:pizza-eggs",
              "confidence": "high",
              "allocations": {
                "pizza-eggs": 80
              }
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:pizza-vegetables",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "pizza-vegetables": 15
              }
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:pizza-vegetables",
              "confidence": "high",
              "allocations": {
                "pizza-vegetables": 15
              }
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 15,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:pizza-house-sauce",
              "confidence": "medium",
              "allocations": {
                "pizza-house-sauce": 15
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 0.5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:pizza-house-sauce",
              "confidence": "high",
              "allocations": {
                "pizza-house-sauce": 0.5
              }
            },
            {
              "key": "italian_seasoning",
              "sourceKey": "italian_seasoning",
              "name": "Italian seasoning",
              "amount": 0.2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-house-sauce",
              "confidence": "medium",
              "allocations": {
                "pizza-house-sauce": 0.2
              }
            },
            {
              "key": "red_chili_flakes",
              "sourceKey": "red_chili_flakes",
              "name": "Crushed red chili flakes",
              "amount": 0.1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-house-sauce",
              "confidence": "planning",
              "allocations": {
                "pizza-house-sauce": 0.1
              }
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "sharifa_beef_bacon",
              "sourceKey": "sharifa_beef_bacon",
              "name": "Sharifa Halal beef bacon, as packaged",
              "amount": 50,
              "unit": "g",
              "station": "Beef",
              "note": "",
              "confidence": "medium"
            }
          ],
          "confidence": "planning-owner-tested",
          "assumptions": [
            "Shape one 100 g raw dough rectangle for this Lean meal; no cut after baking.",
            "The full 235 g dough batch makes one 100 g Lean and one 125 g Bulk rectangle; the unserved 10 g is included in purchasing but excluded from served nutrition.",
            "The one-medium-egg plus 175 g whites pair is a planning basis. Lean uses an estimated 45% of the egg and 80 g whites; Bulk 55% and 95 g. Record actual cooked egg allocations on Cook Day.",
            "Use only H-E-B fat-free mozzarella: 30 g Lean or 58 g Bulk. Use 50 g or 60 g Sharifa bacon by raw package weight, cook it before topping, then add crisp bits after baking.",
            "Each pizza gets 30 g peppers/onion and 15 g finished house tomato sauce. Sauce input and olive-oil yield remain estimates; record the finished sauce batch and actual portion weight.",
            "Bake on a preheated 425 F stone on the second-lowest rack. The owner's ground-beef placeholder trial finished in 9\u201310 minutes; customer production uses Sharifa bacon."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "flour",
              "sourceKey": "flour",
              "name": "All-purpose flour",
              "amount": 77.7778,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-dough; component:pizza-dough-spare",
              "confidence": "high",
              "allocations": {
                "pizza-dough": 74.4681,
                "pizza-dough-spare": 3.3097
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 47.2223,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:pizza-dough; component:pizza-dough-spare",
              "confidence": "high",
              "allocations": {
                "pizza-dough": 45.2128,
                "pizza-dough-spare": 2.0095
              }
            },
            {
              "key": "instant_yeast",
              "sourceKey": "instant_yeast",
              "name": "Instant baker's yeast",
              "amount": 1.1111,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-dough; component:pizza-dough-spare",
              "confidence": "low",
              "allocations": {
                "pizza-dough": 1.0638,
                "pizza-dough-spare": 0.0473
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.6666,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-dough; component:pizza-dough-spare",
              "confidence": "high",
              "allocations": {
                "pizza-dough": 1.5957,
                "pizza-dough-spare": 0.0709
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "olive_oil",
              "sourceKey": "olive_oil",
              "name": "Olive oil",
              "amount": 3.2778,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-dough; component:pizza-dough-spare; component:pizza-house-sauce",
              "confidence": "medium",
              "allocations": {
                "pizza-dough": 2.6596,
                "pizza-dough-spare": 0.1182,
                "pizza-house-sauce": 0.5
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.55,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "component:pizza-eggs",
              "confidence": "high",
              "allocations": {
                "pizza-eggs": 0.55
              }
            },
            {
              "key": "egg_white",
              "sourceKey": "egg_white",
              "name": "Liquid egg white",
              "amount": 95,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:pizza-eggs",
              "confidence": "high",
              "allocations": {
                "pizza-eggs": 95
              }
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:pizza-vegetables",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "pizza-vegetables": 15
              }
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:pizza-vegetables",
              "confidence": "high",
              "allocations": {
                "pizza-vegetables": 15
              }
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 15,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:pizza-house-sauce",
              "confidence": "medium",
              "allocations": {
                "pizza-house-sauce": 15
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 0.5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:pizza-house-sauce",
              "confidence": "high",
              "allocations": {
                "pizza-house-sauce": 0.5
              }
            },
            {
              "key": "italian_seasoning",
              "sourceKey": "italian_seasoning",
              "name": "Italian seasoning",
              "amount": 0.2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-house-sauce",
              "confidence": "medium",
              "allocations": {
                "pizza-house-sauce": 0.2
              }
            },
            {
              "key": "red_chili_flakes",
              "sourceKey": "red_chili_flakes",
              "name": "Crushed red chili flakes",
              "amount": 0.1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:pizza-house-sauce",
              "confidence": "planning",
              "allocations": {
                "pizza-house-sauce": 0.1
              }
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 58,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "sharifa_beef_bacon",
              "sourceKey": "sharifa_beef_bacon",
              "name": "Sharifa Halal beef bacon, as packaged",
              "amount": 60,
              "unit": "g",
              "station": "Beef",
              "note": "",
              "confidence": "medium"
            }
          ],
          "confidence": "planning-owner-tested",
          "assumptions": [
            "Shape one 125 g raw dough rectangle for this Bulk meal; no cut after baking.",
            "The full 235 g dough batch makes one 100 g Lean and one 125 g Bulk rectangle; the unserved 10 g is included in purchasing but excluded from served nutrition.",
            "The one-medium-egg plus 175 g whites pair is a planning basis. Lean uses an estimated 45% of the egg and 80 g whites; Bulk 55% and 95 g. Record actual cooked egg allocations on Cook Day.",
            "Use only H-E-B fat-free mozzarella: 30 g Lean or 58 g Bulk. Use 50 g or 60 g Sharifa bacon by raw package weight, cook it before topping, then add crisp bits after baking.",
            "Each pizza gets 30 g peppers/onion and 15 g finished house tomato sauce. Sauce input and olive-oil yield remain estimates; record the finished sauce batch and actual portion weight.",
            "Bake on a preheated 425 F stone on the second-lowest rack. The owner's ground-beef placeholder trial finished in 9\u201310 minutes; customer production uses Sharifa bacon."
          ]
        }
      },
      "plannerOnly": false
    },
    "b2": {
      "name": "Beef Breakfast Skillet",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 210.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "potato",
              "sourceKey": "potato",
              "name": "Potato, flesh and skin, raw",
              "amount": 100,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 1,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 28,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 6,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.75,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "All rendered beef fat is drained.",
            "Use exactly 210g raw 90/10 beef; working finished seasoned-component target is 175g pending measured 90/10 yield.",
            "Owner-approved component standard: 120g cooked starch and 75g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "Breakfast-skillet potato is a translated starch and keeps its recipe-specific input until its cooked yield is measured.",
            "Salsa is not plated on the skillet."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 300.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "potato",
              "sourceKey": "potato",
              "name": "Potato, flesh and skin, raw",
              "amount": 100,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 2,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 28,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 6,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 4,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "All rendered beef fat is drained.",
            "Use exactly 300g raw 90/10 beef; working finished seasoned-component target is 250g pending measured 90/10 yield.",
            "Owner-approved component standard: 160g cooked starch and 100g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "Breakfast-skillet potato is a translated starch and keeps its recipe-specific input until its cooked yield is measured.",
            "Salsa is not plated on the skillet."
          ]
        }
      },
      "plannerOnly": false
    },
    "b3": {
      "name": "Strawberry Cheesecake Protein Pancakes",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "flour",
              "sourceKey": "flour",
              "name": "All-purpose flour",
              "amount": 45,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "baking_powder",
              "sourceKey": "baking_powder",
              "name": "Baking powder",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 4.0
              }
            },
            {
              "key": "whey_vanilla",
              "sourceKey": "whey_vanilla",
              "name": "Premier Protein powder, vanilla",
              "amount": 9.75,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 1,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg_white",
              "sourceKey": "egg_white",
              "name": "Liquid egg white",
              "amount": 80,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 100,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 60,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "strawberry",
              "sourceKey": "strawberry",
              "name": "Strawberries, raw",
              "amount": 80,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "reduced_cream_cheese",
              "sourceKey": "reduced_cream_cheese",
              "name": "Reduced-fat cream cheese",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "powdered_sugar",
              "sourceKey": "powdered_sugar",
              "name": "Powdered sugar",
              "amount": 4,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.5
              }
            },
            {
              "key": "maple_syrup",
              "sourceKey": "maple_syrup",
              "name": "Great Value reduced-calorie sugar-free syrup",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "separate syrup cup",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.3
              }
            },
            {
              "key": "vanilla",
              "sourceKey": "vanilla",
              "name": "Vanilla extract",
              "amount": 2,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 0.88
              }
            },
            {
              "key": "cinnamon",
              "sourceKey": "cinnamon",
              "name": "Ground cinnamon",
              "amount": 0.5,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.6
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Lean targets three medium pancakes; Bulk targets four.",
            "The FAGE total is split between batter and cheesecake topping; reduced-fat cream cheese replaces the retired Philadelphia no-bake filling gram-for-gram.",
            "Strawberry compote and cheesecake topping share one side cup; sugar-free syrup uses a second cup.",
            "This is a first-test build. Record finished pancake count, batter yield, topping yield, taste, and day-three reheat quality.",
            "Strawberries replace blueberries gram-for-gram in the compote."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "flour",
              "sourceKey": "flour",
              "name": "All-purpose flour",
              "amount": 60,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "baking_powder",
              "sourceKey": "baking_powder",
              "name": "Baking powder",
              "amount": 4,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 4.0
              }
            },
            {
              "key": "whey_vanilla",
              "sourceKey": "whey_vanilla",
              "name": "Premier Protein powder, vanilla",
              "amount": 14.625,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 1,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg_white",
              "sourceKey": "egg_white",
              "name": "Liquid egg white",
              "amount": 120,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 120,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 75,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "strawberry",
              "sourceKey": "strawberry",
              "name": "Strawberries, raw",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "reduced_cream_cheese",
              "sourceKey": "reduced_cream_cheese",
              "name": "Reduced-fat cream cheese",
              "amount": 25,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "powdered_sugar",
              "sourceKey": "powdered_sugar",
              "name": "Powdered sugar",
              "amount": 4,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.5
              }
            },
            {
              "key": "maple_syrup",
              "sourceKey": "maple_syrup",
              "name": "Great Value reduced-calorie sugar-free syrup",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "separate syrup cup",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.3
              }
            },
            {
              "key": "vanilla",
              "sourceKey": "vanilla",
              "name": "Vanilla extract",
              "amount": 2.5,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 0.88
              }
            },
            {
              "key": "cinnamon",
              "sourceKey": "cinnamon",
              "name": "Ground cinnamon",
              "amount": 0.75,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.6
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.75,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Lean targets three medium pancakes; Bulk targets four.",
            "The FAGE total is split between batter and cheesecake topping; reduced-fat cream cheese replaces the retired Philadelphia no-bake filling gram-for-gram.",
            "Strawberry compote and cheesecake topping share one side cup; sugar-free syrup uses a second cup.",
            "This is a first-test build. Record finished pancake count, batter yield, topping yield, taste, and day-three reheat quality.",
            "Strawberries replace blueberries gram-for-gram in the compote."
          ]
        }
      },
      "plannerOnly": false,
      "service": {
        "sideCupComponents": [
          {
            "name": "Strawberry-cheesecake topping",
            "batchGroup": "strawberry-cheesecake",
            "cupsPerMeal": 1,
            "weightBasis": "measured-yield"
          },
          {
            "name": "Sugar-free maple syrup",
            "batchGroup": "pancake-syrup",
            "cupsPerMeal": 1,
            "gramsPerMeal": 30
          }
        ]
      }
    },
    "m1": {
      "name": "Hot Honey Chicken Sliders",
      "category": "Main",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Use the exact King's Hawaiian Original Sweet Roll build with three Lean or four Bulk sliders and incorporated reduced-Sriracha hot-honey mayo. The source's 75% chicken-yield assumption is method-specific and still needs an exact-method capture; do not silently replace it with the separate 68.8% standard-chicken run. Verify the current roll panel and container fit. The historical photo's visible cup is stale presentation and does not authorize a recipe-required cup.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 100.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.5
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 0.675,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.675
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "onion_powder",
              "sourceKey": "onion_powder",
              "name": "Onion powder",
              "amount": 0.4,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.4
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.4
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.3
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.2
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "kings_hawaiian_roll",
              "sourceKey": "kings_hawaiian_roll",
              "name": "King's Hawaiian Original Sweet Roll",
              "amount": 3,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 28,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 7.3333,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "high",
              "allocations": {
                "batch13-sweet-heat": 7.3333
              }
            },
            {
              "key": "ketchup",
              "sourceKey": "ketchup",
              "name": "Ketchup",
              "amount": 8.8,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "low",
              "allocations": {
                "batch13-sweet-heat": 8.8
              },
              "measure": {
                "type": "liquid",
                "density": 1.14
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 8.8,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:batch13-sweet-heat",
              "confidence": "high",
              "allocations": {
                "batch13-sweet-heat": 8.8
              },
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 5.0667,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "medium",
              "allocations": {
                "batch13-sweet-heat": 5.0667
              },
              "measure": {
                "type": "liquid",
                "density": 1.1
              }
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "pickles",
              "sourceKey": "pickles",
              "name": "House refrigerator-pickled vegetables",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "one drained pickle chip per slider; plan 5g per chip and record the actual drained weight",
              "confidence": "medium"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            }
          ],
          "confidence": "high",
          "assumptions": [
            "Lean is three sliders; Bulk is four.",
            "Each slider targets approximately 25g cooked chicken, modeled from raw chicken thighs at a 75% cooked yield and corrected from Batch 6 overproduction.",
            "Uses King's Hawaiian Original Sweet Rolls, the current PRPD Sweet Heat ratio, onion, and one drained pickle chip per slider. There is no separate hot-sauce cup.",
            "Season the slider chicken at the moderate 5g salt per kg raw-chicken rate after the compatible aromatic base is divided."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 133.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.665,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.665
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 0.8978,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.8978
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "onion_powder",
              "sourceKey": "onion_powder",
              "name": "Onion powder",
              "amount": 0.532,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.532
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.4
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.399,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.399
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.266,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.266
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "kings_hawaiian_roll",
              "sourceKey": "kings_hawaiian_roll",
              "name": "King's Hawaiian Original Sweet Roll",
              "amount": 4,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 28,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 9.7778,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "high",
              "allocations": {
                "batch13-sweet-heat": 9.7778
              }
            },
            {
              "key": "ketchup",
              "sourceKey": "ketchup",
              "name": "Ketchup",
              "amount": 11.7333,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "low",
              "allocations": {
                "batch13-sweet-heat": 11.7333
              },
              "measure": {
                "type": "liquid",
                "density": 1.14
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 11.7333,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:batch13-sweet-heat",
              "confidence": "high",
              "allocations": {
                "batch13-sweet-heat": 11.7333
              },
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 6.7556,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "medium",
              "allocations": {
                "batch13-sweet-heat": 6.7556
              },
              "measure": {
                "type": "liquid",
                "density": 1.1
              }
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 20,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "pickles",
              "sourceKey": "pickles",
              "name": "House refrigerator-pickled vegetables",
              "amount": 20,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "one drained pickle chip per slider; plan 5g per chip and record the actual drained weight",
              "confidence": "medium"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 1.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            }
          ],
          "confidence": "high",
          "assumptions": [
            "Lean is three sliders; Bulk is four.",
            "Each slider targets approximately 25g cooked chicken, modeled from raw chicken thighs at a 75% cooked yield and corrected from Batch 6 overproduction.",
            "Uses King's Hawaiian Original Sweet Rolls, the current PRPD Sweet Heat ratio, onion, and one drained pickle chip per slider. There is no separate hot-sauce cup.",
            "Season the slider chicken at the moderate 5g salt per kg raw-chicken rate after the compatible aromatic base is divided."
          ]
        }
      },
      "plannerOnly": false,
      "qualityChecks": "Use the exact King's Hawaiian Original Sweet Roll build with three Lean or four Bulk sliders and incorporated reduced-Sriracha hot-honey mayo. The source's 75% chicken-yield assumption is method-specific and still needs an exact-method capture; do not silently replace it with the separate 68.8% standard-chicken run. Verify the current roll panel and container fit. The historical photo's visible cup is stale presentation and does not authorize a recipe-required cup."
    },
    "m2": {
      "name": "Creamy Cajun Chicken Pasta",
      "category": "Main",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 200.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.6,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 1.6
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.35,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.35
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "onion_powder",
              "sourceKey": "onion_powder",
              "name": "Onion powder",
              "amount": 0.8,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.8
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.4
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.6,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.6
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.4,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.4
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "protein_pasta",
              "sourceKey": "protein_pasta",
              "name": "Kroger protein pasta",
              "amount": 50.0,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 93.6123,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 104.6256,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "regular_cream_cheese",
              "sourceKey": "regular_cream_cheese",
              "name": "Philadelphia Original cream cheese",
              "amount": 12.5551,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 33.0396,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "green_onion",
              "sourceKey": "green_onion",
              "name": "Green onion",
              "amount": 9.9119,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "olive_oil",
              "sourceKey": "olive_oil",
              "name": "Olive oil",
              "amount": 2.9736,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 3.0837,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "smoked_paprika",
              "sourceKey": "smoked_paprika",
              "name": "Smoked paprika",
              "amount": 2.0264,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "oregano",
              "sourceKey": "oregano",
              "name": "Dried oregano",
              "amount": 0.4405,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.0
              }
            },
            {
              "key": "thyme",
              "sourceKey": "thyme",
              "name": "Dried thyme",
              "amount": 0.4405,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.0
              }
            },
            {
              "key": "cayenne",
              "sourceKey": "cayenne",
              "name": "Ground cayenne",
              "amount": 0.1982,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.8
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Budget Bytes Cajun pasta adapted to owner-requested thighs, regular crushed tomatoes, usual protein spaghetti, and water instead of broth. US quantities converted to grams.",
            "Lean: 200g raw thighs and 50g dry protein spaghetti. Bulk: 275g raw thighs and 65g dry protein spaghetti. Source sauce proportions scale with dry pasta; Cajun seasoning scales with chicken. Owner requested Lean in the 500-calorie range and a lighter Bulk.",
            "Do not use the source website's breast-and-broth nutrition or the withdrawn PRPD prototype macros.",
            "Working produce conversion: one yellow onion = 150g; three green onions = 45g. Record actual usable weight.",
            "Apply the shared savory base to whole thighs, split the Cajun pull, then cut it into 1.5-2cm cubes and add the measured smoked-paprika, oregano, thyme, and cayenne finish.",
            "Protein spaghetti replaces short penne. Use a wide deep pan, submerge the strands as they soften, and stir to prevent clumping; adjust water in measured additions until the pasta is tender. Do not assume penne's cook time applies.",
            "Water is a cooking input, not a verified final net weight. Weigh the finished pan before printing final net-weight labels."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 275.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 2.2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 2.2
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.8562,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.8562
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "onion_powder",
              "sourceKey": "onion_powder",
              "name": "Onion powder",
              "amount": 1.1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.1
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.4
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.825,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.825
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.55,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.55
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "protein_pasta",
              "sourceKey": "protein_pasta",
              "name": "Kroger protein pasta",
              "amount": 65.0,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 121.696,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 136.0132,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "regular_cream_cheese",
              "sourceKey": "regular_cream_cheese",
              "name": "Philadelphia Original cream cheese",
              "amount": 16.3216,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 42.9515,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "green_onion",
              "sourceKey": "green_onion",
              "name": "Green onion",
              "amount": 12.8855,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "olive_oil",
              "sourceKey": "olive_oil",
              "name": "Olive oil",
              "amount": 3.8656,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 4.0088,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "smoked_paprika",
              "sourceKey": "smoked_paprika",
              "name": "Smoked paprika",
              "amount": 2.7863,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "oregano",
              "sourceKey": "oregano",
              "name": "Dried oregano",
              "amount": 0.6057,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.0
              }
            },
            {
              "key": "thyme",
              "sourceKey": "thyme",
              "name": "Dried thyme",
              "amount": 0.6057,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.0
              }
            },
            {
              "key": "cayenne",
              "sourceKey": "cayenne",
              "name": "Ground cayenne",
              "amount": 0.2726,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.8
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Budget Bytes Cajun pasta adapted to owner-requested thighs, regular crushed tomatoes, usual protein spaghetti, and water instead of broth. US quantities converted to grams.",
            "Lean: 200g raw thighs and 50g dry protein spaghetti. Bulk: 275g raw thighs and 65g dry protein spaghetti. Source sauce proportions scale with dry pasta; Cajun seasoning scales with chicken. Owner requested Lean in the 500-calorie range and a lighter Bulk.",
            "Do not use the source website's breast-and-broth nutrition or the withdrawn PRPD prototype macros.",
            "Working produce conversion: one yellow onion = 150g; three green onions = 45g. Record actual usable weight.",
            "Apply the shared savory base to whole thighs, split the Cajun pull, then cut it into 1.5-2cm cubes and add the measured smoked-paprika, oregano, thyme, and cayenne finish.",
            "Protein spaghetti replaces short penne. Use a wide deep pan, submerge the strands as they soften, and stir to prevent clumping; adjust water in measured additions until the pasta is tender. Do not assume penne's cook time applies.",
            "Water is a cooking input, not a verified final net weight. Weigh the finished pan before printing final net-weight labels."
          ]
        }
      },
      "plannerOnly": false
    },
    "m3": {
      "name": "Chicken Enchilada Bake",
      "category": "Main",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 200.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.6,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 1.6
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.35,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.35
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "onion_powder",
              "sourceKey": "onion_powder",
              "name": "Onion powder",
              "amount": 0.8,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.8
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.4
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.6,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.6
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.4,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.4
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "small_tortilla",
              "sourceKey": "small_tortilla",
              "name": "Mission Carb Balance medium soft-taco tortilla",
              "amount": 2,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "corn",
              "sourceKey": "corn",
              "name": "Sweet yellow corn, cooked, no salt",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "enchilada_sauce",
              "sourceKey": "enchilada_sauce",
              "name": "Red enchilada sauce",
              "amount": 100,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 28,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Chicken, corn, tortillas, sauce, and cheese are layered and baked as one controlled casserole. Beans are excluded by the September 16 owner decision after customer feedback.",
            "Record finished pan weight and equal serving weights before final labels."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 290.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 2.32,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 2.32
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.9575,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.9575
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "onion_powder",
              "sourceKey": "onion_powder",
              "name": "Onion powder",
              "amount": 1.16,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.16
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.4
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.87,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.87
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.58,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.58
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "small_tortilla",
              "sourceKey": "small_tortilla",
              "name": "Mission Carb Balance medium soft-taco tortilla",
              "amount": 3.125,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "corn",
              "sourceKey": "corn",
              "name": "Sweet yellow corn, cooked, no salt",
              "amount": 70,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "enchilada_sauce",
              "sourceKey": "enchilada_sauce",
              "name": "Red enchilada sauce",
              "amount": 130,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 42,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 35,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Chicken, corn, tortillas, sauce, and cheese are layered and baked as one controlled casserole. Beans are excluded by the September 16 owner decision after customer feedback.",
            "Record finished pan weight and equal serving weights before final labels."
          ]
        }
      },
      "plannerOnly": false
    },
    "m4": {
      "name": "Southwest Beef Taco Bowl",
      "category": "Main",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 210.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 45.0,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "medium",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 45.0
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 2.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 2.0
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 1.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 1.0
              }
            },
            {
              "key": "lime",
              "sourceKey": "lime",
              "name": "Lime juice, raw",
              "amount": 5.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 5.0
              },
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "black_beans",
              "sourceKey": "black_beans",
              "name": "Black beans, canned, drained",
              "amount": 55,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "corn",
              "sourceKey": "corn",
              "name": "Sweet yellow corn, cooked, no salt",
              "amount": 60,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 30,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "controlled-comparable-profile"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 20,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lettuce",
              "sourceKey": "lettuce",
              "name": "Green leaf lettuce, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cotija",
              "sourceKey": "cotija",
              "name": "Cotija cheese",
              "amount": 12,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.75,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Use exactly 210g raw 90/10 beef; working finished seasoned-component target is 175g pending measured 90/10 yield.",
            "Owner-approved component standard: 120g cooked starch and 75g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "Ground beef is browned to 160 F and drained before taco seasoning is added.",
            "Record the first filled weights and day-three texture before treating the formula as final."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 300.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 60.0,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "medium",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 60.0
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 2.6667,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 2.6667
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 1.3333,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 1.3333
              }
            },
            {
              "key": "lime",
              "sourceKey": "lime",
              "name": "Lime juice, raw",
              "amount": 6.6667,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 6.6667
              },
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "black_beans",
              "sourceKey": "black_beans",
              "name": "Black beans, canned, drained",
              "amount": 70,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "corn",
              "sourceKey": "corn",
              "name": "Sweet yellow corn, cooked, no salt",
              "amount": 75,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 40,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "controlled-comparable-profile"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lettuce",
              "sourceKey": "lettuce",
              "name": "Green leaf lettuce, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cotija",
              "sourceKey": "cotija",
              "name": "Cotija cheese",
              "amount": 16,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Use exactly 300g raw 90/10 beef; working finished seasoned-component target is 250g pending measured 90/10 yield.",
            "Owner-approved component standard: 160g cooked starch and 100g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "Ground beef is browned to 160 F and drained before taco seasoning is added.",
            "Record the first filled weights and day-three texture before treating the formula as final."
          ]
        }
      },
      "plannerOnly": false
    },
    "m5": {
      "name": "Thai Basil Beef + Jasmine Rice",
      "category": "Main",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Owner-approved minced format. Recipe-based15-field estimate uses210/300g raw90/10,69% existing cooked/drained model, identified RedBoat fish sauce and measured finish. Contains fish. No physical test or new yield is claimed.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 210.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 9.9,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:thai-basil-beef_finish; component:thai-basil-beans",
              "confidence": "high",
              "allocations": {
                "thai-basil-beef_finish": 8.4,
                "thai-basil-beans": 1.5
              }
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 33.6,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:thai-basil-beef_finish",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 33.6
              }
            },
            {
              "key": "thai_hot_chili",
              "sourceKey": "thai_hot_chili",
              "name": "Thai chili (USDA raw green hot-chili equivalent)",
              "amount": 1.26,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 1.26
              }
            },
            {
              "key": "thai_basil_fresh",
              "sourceKey": "thai_basil_fresh",
              "name": "Fresh basil (USDA comparable profile)",
              "amount": 12.6,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 12.6
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 5.86,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:thai-basil-beef_finish; component:thai-basil-beans",
              "confidence": "medium",
              "allocations": {
                "thai-basil-beef_finish": 3.36,
                "thai-basil-beans": 2.5
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "thai_redboat_40n",
              "sourceKey": "thai_redboat_40n",
              "name": "Red Boat40N fish sauce (anchovy, sea salt)",
              "amount": 10.5,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish",
              "confidence": "manufacturer-panel-physical-pending",
              "allocations": {
                "thai-basil-beef_finish": 10.5
              }
            },
            {
              "key": "thai_granulated_sugar",
              "sourceKey": "thai_granulated_sugar",
              "name": "Granulated sugar",
              "amount": 3.36,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 3.36
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 25.2,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:thai-basil-beef_finish",
              "confidence": "high",
              "allocations": {
                "thai-basil-beef_finish": 25.2
              }
            },
            {
              "key": "thai_black_pepper",
              "sourceKey": "thai_black_pepper",
              "name": "Black pepper, ground",
              "amount": 0.41,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish; component:thai-basil-beans",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 0.21,
                "thai-basil-beans": 0.2
              }
            },
            {
              "key": "thai_jasmine_rice_dry",
              "sourceKey": "thai_jasmine_rice_dry",
              "name": "Jasmine rice, dry (unenriched long-grain white-rice equivalent)",
              "amount": 40,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-rice",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-rice": 40
              }
            },
            {
              "key": "green_beans",
              "sourceKey": "green_beans",
              "name": "Green beans, trimmed raw",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:thai-basil-beans",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beans": 100
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:thai-basil-beans",
              "confidence": "high",
              "allocations": {
                "thai-basil-beans": 0.2
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "owner-authorized-recipe-estimate",
          "assumptions": [
            "Owner-selected minced halal90/10 beef, not strips: 210g raw perlean;69% existing cooked/drained model gives144.9g plain cooked beef equivalent, not a new measurement.",
            "November2 owner authorized completing recipe-based estimates.500g beef finish ratios are a PRPD adaptation inspired by Pailin's traditional Pad Kra Pao, not a verbatim original recipe or tasted result.",
            "All finish ingredients and measured oils are counted retained; beef nutrition uses cooked/drained USDA90/10 crumbles. Purchase-only5% raw reserve is not eaten nutrition.",
            "Owner selected regular fresh sweet basil on November 2. Use the existing leaf quantities; no specialty basil purchase is required. This is a PRPD adaptation. The existing USDA ordinary fresh basil profile already matches this choice; chili remains a comparable profile.",
            "Rice uses a complete USDA unenriched long-grain white-rice equivalent; confirm actual jasmine package when bought. Fresh produce nutrients use raw-input profiles with no claimed measured retention.",
            "Green bell pepper is shared with the breakfast pizza and Southwest bowl so one pepper color is purchased. Red Boat manufacturer ingredients are anchovy and sea salt; no certification claim. Fish allergen remains present in this beef dish. No required cup, optional sauce, fried egg or additional garnish is included in this builder.",
            "One combined batch per component across tiers; portion finished beef/finish by210:300 raw-beef shares. Finished cooked/sauced weights have not been physically measured."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 300.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 14.25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:thai-basil-beef_finish; component:thai-basil-beans",
              "confidence": "high",
              "allocations": {
                "thai-basil-beef_finish": 12.0,
                "thai-basil-beans": 2.25
              }
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 48.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:thai-basil-beef_finish",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 48.0
              }
            },
            {
              "key": "thai_hot_chili",
              "sourceKey": "thai_hot_chili",
              "name": "Thai chili (USDA raw green hot-chili equivalent)",
              "amount": 1.8,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 1.8
              }
            },
            {
              "key": "thai_basil_fresh",
              "sourceKey": "thai_basil_fresh",
              "name": "Fresh basil (USDA comparable profile)",
              "amount": 18.0,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 18.0
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 8.55,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:thai-basil-beef_finish; component:thai-basil-beans",
              "confidence": "medium",
              "allocations": {
                "thai-basil-beef_finish": 4.8,
                "thai-basil-beans": 3.75
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "thai_redboat_40n",
              "sourceKey": "thai_redboat_40n",
              "name": "Red Boat40N fish sauce (anchovy, sea salt)",
              "amount": 15.0,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish",
              "confidence": "manufacturer-panel-physical-pending",
              "allocations": {
                "thai-basil-beef_finish": 15.0
              }
            },
            {
              "key": "thai_granulated_sugar",
              "sourceKey": "thai_granulated_sugar",
              "name": "Granulated sugar",
              "amount": 4.8,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 4.8
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 36.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:thai-basil-beef_finish",
              "confidence": "high",
              "allocations": {
                "thai-basil-beef_finish": 36.0
              }
            },
            {
              "key": "thai_black_pepper",
              "sourceKey": "thai_black_pepper",
              "name": "Black pepper, ground",
              "amount": 0.6,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-beef_finish; component:thai-basil-beans",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beef_finish": 0.3,
                "thai-basil-beans": 0.3
              }
            },
            {
              "key": "thai_jasmine_rice_dry",
              "sourceKey": "thai_jasmine_rice_dry",
              "name": "Jasmine rice, dry (unenriched long-grain white-rice equivalent)",
              "amount": 60,
              "unit": "g",
              "station": "Other",
              "note": "component:thai-basil-rice",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-rice": 60
              }
            },
            {
              "key": "green_beans",
              "sourceKey": "green_beans",
              "name": "Green beans, trimmed raw",
              "amount": 150,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:thai-basil-beans",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "thai-basil-beans": 150
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:thai-basil-beans",
              "confidence": "high",
              "allocations": {
                "thai-basil-beans": 0.3
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "owner-authorized-recipe-estimate",
          "assumptions": [
            "Owner-selected minced halal90/10 beef, not strips: 300g raw perbulk;69% existing cooked/drained model gives207g plain cooked beef equivalent, not a new measurement.",
            "November2 owner authorized completing recipe-based estimates.500g beef finish ratios are a PRPD adaptation inspired by Pailin's traditional Pad Kra Pao, not a verbatim original recipe or tasted result.",
            "All finish ingredients and measured oils are counted retained; beef nutrition uses cooked/drained USDA90/10 crumbles. Purchase-only5% raw reserve is not eaten nutrition.",
            "Owner selected regular fresh sweet basil on November 2. Use the existing leaf quantities; no specialty basil purchase is required. This is a PRPD adaptation. The existing USDA ordinary fresh basil profile already matches this choice; chili remains a comparable profile.",
            "Rice uses a complete USDA unenriched long-grain white-rice equivalent; confirm actual jasmine package when bought. Fresh produce nutrients use raw-input profiles with no claimed measured retention.",
            "Green bell pepper is shared with the breakfast pizza and Southwest bowl so one pepper color is purchased. Red Boat manufacturer ingredients are anchovy and sea salt; no certification claim. Fish allergen remains present in this beef dish. No required cup, optional sauce, fried egg or additional garnish is included in this builder.",
            "One combined batch per component across tiers; portion finished beef/finish by210:300 raw-beef shares. Finished cooked/sauced weights have not been physically measured."
          ]
        }
      },
      "plannerOnly": false,
      "qualityChecks": "Owner-approved minced format. Recipe-based15-field estimate uses210/300g raw90/10,69% existing cooked/drained model, identified RedBoat fish sauce and measured finish. Contains fish. No physical test or new yield is claimed."
    },
    "m6": {
      "name": "Halal Cart Chicken + Yellow Rice",
      "category": "Main",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_standard_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 232.5581,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; measured 68.8% cooked yield from the October 7 component test.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 45.0,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "owner standard; targets 120g/160g cooked pending measured rice yield",
              "confidence": "medium"
            },
            {
              "key": "lettuce",
              "sourceKey": "lettuce",
              "name": "Green leaf lettuce, raw",
              "amount": 30,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 45,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.75,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "oregano",
              "sourceKey": "oregano",
              "name": "Dried oregano",
              "amount": 0.9896,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Chicken marinade",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.0
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 2.3782,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Chicken marinade; Yellow rice",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 2.5761,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Chicken marinade; Yellow rice",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 3.0678,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Chicken marinade",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 9.8961,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "Chicken marinade",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "turmeric",
              "sourceKey": "turmeric",
              "name": "Ground turmeric",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Yellow rice",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Rice oil is excluded; 0.75g/1g Lean/Bulk salt is modeled.",
            "Plate exactly 160g cooked boneless skinless chicken thigh before sauce.",
            "Owner-approved component standard: 120g cooked starch and 75g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "Original recipe page 8 specifies oregano, cumin, paprika, garlic powder and lemon for chicken, plus turmeric/cumin/paprika for rice. Chicken seasonings scale from the source's 235g raw reference; rice spices remain working kitchen-control amounts until the standardized rice cook is measured."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_standard_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 305.2326,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; measured 68.8% cooked yield from the October 7 component test.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 60.0,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "owner standard; targets 120g/160g cooked pending measured rice yield",
              "confidence": "medium"
            },
            {
              "key": "lettuce",
              "sourceKey": "lettuce",
              "name": "Green leaf lettuce, raw",
              "amount": 40,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 60,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "oregano",
              "sourceKey": "oregano",
              "name": "Dried oregano",
              "amount": 1.2989,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Chicken marinade",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.0
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 3.0276,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Chicken marinade; Yellow rice",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 3.2874,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Chicken marinade; Yellow rice",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 4.0265,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Chicken marinade",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 12.9886,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "Chicken marinade",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "turmeric",
              "sourceKey": "turmeric",
              "name": "Ground turmeric",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Yellow rice",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Rice oil is excluded; 0.75g/1g Lean/Bulk salt is modeled.",
            "Plate exactly 210g cooked boneless skinless chicken thigh before sauce.",
            "Owner-approved component standard: 160g cooked starch and 100g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "Original recipe page 8 specifies oregano, cumin, paprika, garlic powder and lemon for chicken, plus turmeric/cumin/paprika for rice. Chicken seasonings scale from the source's 235g raw reference; rice spices remain working kitchen-control amounts until the standardized rice cook is measured."
          ]
        }
      },
      "plannerOnly": false
    },
    "m7": {
      "name": "Braised Beef Short Rib",
      "category": "Premium meal",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "short_rib_cooked",
              "sourceKey": "short_rib_cooked",
              "name": "Beef short rib, cooked edible meat after deboning",
              "amount": 150,
              "unit": "g",
              "station": "Beef",
              "note": "302.4g raw bone-in planning pull at 49.6% cooked-edible yield",
              "confidence": "medium"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 60.4839,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 60.4839
              }
            },
            {
              "key": "carrot",
              "sourceKey": "carrot",
              "name": "Carrot, raw",
              "amount": 30.2419,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 30.2419
              }
            },
            {
              "key": "celery",
              "sourceKey": "celery",
              "name": "Celery, raw",
              "amount": 18.1452,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 18.1452
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 7.5484,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-jus; component:short-rib-green-beans",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 6.0484,
                "short-rib-green-beans": 1.5
              }
            },
            {
              "key": "tomato_paste",
              "sourceKey": "tomato_paste",
              "name": "Tomato paste",
              "amount": 9.0726,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 9.0726
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 275.3087,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-jus; component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 181.4516,
                "short-rib-mash": 93.8571
              }
            },
            {
              "key": "balsamic_vinegar",
              "sourceKey": "balsamic_vinegar",
              "name": "Balsamic vinegar",
              "amount": 7.5605,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-jus",
              "confidence": "medium",
              "allocations": {
                "short-rib-jus": 7.5605
              },
              "measure": {
                "type": "liquid",
                "density": 1.06
              }
            },
            {
              "key": "thyme",
              "sourceKey": "thyme",
              "name": "Dried thyme",
              "amount": 0.4536,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus",
              "confidence": "medium",
              "allocations": {
                "short-rib-jus": 0.4536
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.0
              }
            },
            {
              "key": "coriander",
              "sourceKey": "coriander",
              "name": "Ground coriander",
              "amount": 0.2419,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 0.2419
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.8
              }
            },
            {
              "key": "bay_leaf",
              "sourceKey": "bay_leaf",
              "name": "Bay leaf",
              "amount": 0.121,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 0.121
              },
              "measure": {
                "type": "piece",
                "gramsPerPiece": 0.2,
                "pieceName": "bay leaf",
                "pieceNamePlural": "bay leaves"
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 6.129,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus; component:short-rib-green-beans",
              "confidence": "medium",
              "allocations": {
                "short-rib-jus": 3.629,
                "short-rib-green-beans": 2.5
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.5359,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus; component:short-rib-mash; component:short-rib-green-beans",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 0.9073,
                "short-rib-mash": 0.4286,
                "short-rib-green-beans": 0.2
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 1.1073,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus; component:short-rib-green-beans",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 0.9073,
                "short-rib-green-beans": 0.2
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "instant_potato_flakes",
              "sourceKey": "instant_potato_flakes",
              "name": "Idahoan Original mashed potato flakes",
              "amount": 25.2857,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-mash": 25.2857
              }
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 60.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-mash": 60.0
              },
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 8.1429,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-mash": 8.1429
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 0.4286,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-mash",
              "confidence": "medium",
              "allocations": {
                "short-rib-mash": 0.4286
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "rosemary",
              "sourceKey": "rosemary",
              "name": "Fresh rosemary",
              "amount": 0.4286,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-mash": 0.4286
              }
            },
            {
              "key": "green_beans",
              "sourceKey": "green_beans",
              "name": "Green beans, trimmed raw",
              "amount": 100.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-green-beans",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "short-rib-green-beans": 100.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Pack 150g finished deboned short-rib meat, 45g reduced jus, 180g finished Idahoan Original garlic-rosemary mash and 90g finished roasted garlic green beans.",
            "Pull 302.4g raw bone-in short rib per sold meal before the separate five-percent purchase reserve.",
            "Braise at 325 F until tender, remove every bone and cartilage fragment, defat and reduce the jus, and weigh edible cooked meat before portioning.",
            "Use water and the browned pan fond for the braising liquid. Do not use beef broth, bouillon, or stock.",
            "Prepare the October 20 owner-tested Idahoan Original mash on Prep Day with the controlled extra-milk ratio, 1g salt and 1g garlic powder per 420g packed Lean-plus-Bulk target. Do not use chopped fresh garlic or fresh potatoes for mash.",
            "October 20 mash correction: use 3g salt per kg raw short-rib pull in the braise, 2g salt per kg green beans, and the controlled low-salt mash formula rather than the rejected salt-free version.",
            "The public nutrition values are the owner-approved Batch 15 recipe estimates. Production still records actual raw pull and finished edible yield."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "short_rib_cooked",
              "sourceKey": "short_rib_cooked",
              "name": "Beef short rib, cooked edible meat after deboning",
              "amount": 200,
              "unit": "g",
              "station": "Beef",
              "note": "403.2g raw bone-in planning pull at 49.6% cooked-edible yield",
              "confidence": "medium"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 80.6452,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 80.6452
              }
            },
            {
              "key": "carrot",
              "sourceKey": "carrot",
              "name": "Carrot, raw",
              "amount": 40.3226,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 40.3226
              }
            },
            {
              "key": "celery",
              "sourceKey": "celery",
              "name": "Celery, raw",
              "amount": 24.1935,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 24.1935
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 10.0645,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-jus; component:short-rib-green-beans",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 8.0645,
                "short-rib-green-beans": 2.0
              }
            },
            {
              "key": "tomato_paste",
              "sourceKey": "tomato_paste",
              "name": "Tomato paste",
              "amount": 12.0968,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 12.0968
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 367.0784,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-jus; component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 241.9355,
                "short-rib-mash": 125.1429
              }
            },
            {
              "key": "balsamic_vinegar",
              "sourceKey": "balsamic_vinegar",
              "name": "Balsamic vinegar",
              "amount": 10.0806,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-jus",
              "confidence": "medium",
              "allocations": {
                "short-rib-jus": 10.0806
              },
              "measure": {
                "type": "liquid",
                "density": 1.06
              }
            },
            {
              "key": "thyme",
              "sourceKey": "thyme",
              "name": "Dried thyme",
              "amount": 0.6048,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus",
              "confidence": "medium",
              "allocations": {
                "short-rib-jus": 0.6048
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.0
              }
            },
            {
              "key": "coriander",
              "sourceKey": "coriander",
              "name": "Ground coriander",
              "amount": 0.3226,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 0.3226
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.8
              }
            },
            {
              "key": "bay_leaf",
              "sourceKey": "bay_leaf",
              "name": "Bay leaf",
              "amount": 0.1613,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 0.1613
              },
              "measure": {
                "type": "piece",
                "gramsPerPiece": 0.2,
                "pieceName": "bay leaf",
                "pieceNamePlural": "bay leaves"
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 8.172,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus; component:short-rib-green-beans",
              "confidence": "medium",
              "allocations": {
                "short-rib-jus": 4.8387,
                "short-rib-green-beans": 3.3333
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 2.0478,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus; component:short-rib-mash; component:short-rib-green-beans",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 1.2097,
                "short-rib-mash": 0.5714,
                "short-rib-green-beans": 0.2667
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 1.4764,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-jus; component:short-rib-green-beans",
              "confidence": "high",
              "allocations": {
                "short-rib-jus": 1.2097,
                "short-rib-green-beans": 0.2667
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "instant_potato_flakes",
              "sourceKey": "instant_potato_flakes",
              "name": "Idahoan Original mashed potato flakes",
              "amount": 33.7143,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-mash": 33.7143
              }
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 80.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-mash": 80.0
              },
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 10.8571,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-mash": 10.8571
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 0.5714,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:short-rib-mash",
              "confidence": "medium",
              "allocations": {
                "short-rib-mash": 0.5714
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "rosemary",
              "sourceKey": "rosemary",
              "name": "Fresh rosemary",
              "amount": 0.5714,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-mash",
              "confidence": "high",
              "allocations": {
                "short-rib-mash": 0.5714
              }
            },
            {
              "key": "green_beans",
              "sourceKey": "green_beans",
              "name": "Green beans, trimmed raw",
              "amount": 133.3333,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-green-beans",
              "confidence": "controlled-comparable-profile",
              "allocations": {
                "short-rib-green-beans": 133.3333
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Pack 200g finished deboned short-rib meat, 45g reduced jus, 240g finished Idahoan Original garlic-rosemary mash and 120g finished roasted garlic green beans.",
            "Pull 403.2g raw bone-in short rib per sold meal before the separate five-percent purchase reserve.",
            "Braise at 325 F until tender, remove every bone and cartilage fragment, defat and reduce the jus, and weigh edible cooked meat before portioning.",
            "Use water and the browned pan fond for the braising liquid. Do not use beef broth, bouillon, or stock.",
            "Prepare the October 20 owner-tested Idahoan Original mash on Prep Day with the controlled extra-milk ratio, 1g salt and 1g garlic powder per 420g packed Lean-plus-Bulk target. Do not use chopped fresh garlic or fresh potatoes for mash.",
            "October 20 mash correction: use 3g salt per kg raw short-rib pull in the braise, 2g salt per kg green beans, and the controlled low-salt mash formula rather than the rejected salt-free version.",
            "The public nutrition values are the owner-approved Batch 15 recipe estimates. Production still records actual raw pull and finished edible yield."
          ]
        }
      },
      "plannerOnly": false
    },
    "d1": {
      "name": "Chocolate Chip Cookie Drop",
      "category": "Dessert",
      "aliases": [
        "Classic Chocolate Chip Cookie"
      ],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 12.1692,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "brown_sugar",
              "sourceKey": "brown_sugar",
              "name": "Brown sugar",
              "amount": 11.3077,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 4.0
              }
            },
            {
              "key": "cookie_white_sugar",
              "sourceKey": "cookie_white_sugar",
              "name": "granulated white sugar",
              "amount": 5.3846,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.1077,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cookie_egg_yolk",
              "sourceKey": "cookie_egg_yolk",
              "name": "egg yolk",
              "amount": 1.8308,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "vanilla",
              "sourceKey": "vanilla",
              "name": "Vanilla extract",
              "amount": 1.0769,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 0.88
              }
            },
            {
              "key": "flour",
              "sourceKey": "flour",
              "name": "All-purpose flour",
              "amount": 16.1538,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cookie_baking_soda",
              "sourceKey": "cookie_baking_soda",
              "name": "baking soda",
              "amount": 0.2692,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "baking_powder",
              "sourceKey": "baking_powder",
              "name": "Baking powder",
              "amount": 0.1077,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 4.0
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.1615,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "cookie_chips",
              "sourceKey": "cookie_chips",
              "name": "semisweet chocolate chips",
              "amount": 16.1538,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "low"
            }
          ],
          "confidence": "low",
          "assumptions": [
            "Proven Batch 19 formula, 300 g chips and original 100 g white sugar per full batch.",
            "Portion exactly 70 g raw dough per cookie; count saleable baked cookies and record finished weight.",
            "Chip panel is incomplete; full label printing is held until the purchased bag is checked."
          ]
        }
      },
      "plannerOnly": false
    },
    "a1": {
      "name": "Chicken Tikka Snack Wrap",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 78.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "small_tortilla",
              "sourceKey": "small_tortilla",
              "name": "Mission Carb Balance medium soft-taco tortilla",
              "amount": 1,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 30.3333,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:tikka-marinade; component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "tikka-marinade": 12.0,
                "garlic-herb-yogurt": 18.3333
              }
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 4.1111,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:tikka-marinade; component:garlic-herb-yogurt",
              "confidence": "medium",
              "allocations": {
                "tikka-marinade": 3.0,
                "garlic-herb-yogurt": 1.1111
              },
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 1.5333,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:tikka-marinade; component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "tikka-marinade": 1.2,
                "garlic-herb-yogurt": 0.3333
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.36,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:tikka-marinade",
              "confidence": "high",
              "allocations": {
                "tikka-marinade": 0.36
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 0.2311,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:tikka-marinade; component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "tikka-marinade": 0.12,
                "garlic-herb-yogurt": 0.1111
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            },
            {
              "key": "coriander",
              "sourceKey": "coriander",
              "name": "Ground coriander",
              "amount": 0.18,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:tikka-marinade",
              "confidence": "high",
              "allocations": {
                "tikka-marinade": 0.18
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.8
              }
            },
            {
              "key": "chili_powder",
              "sourceKey": "chili_powder",
              "name": "Chili powder",
              "amount": 0.09,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:tikka-marinade",
              "confidence": "high",
              "allocations": {
                "tikka-marinade": 0.09
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.7
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:tikka-marinade",
              "confidence": "medium",
              "allocations": {
                "tikka-marinade": 0.3
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "lettuce",
              "sourceKey": "lettuce",
              "name": "Green leaf lettuce, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 12,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cucumber",
              "sourceKey": "cucumber",
              "name": "Cucumber with peel, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 10,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 2.7778,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 2.7778
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 1.1111,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 1.1111
              }
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 0.6667,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 0.6667
              }
            },
            {
              "key": "parsley",
              "sourceKey": "parsley",
              "name": "Flat-leaf parsley, raw",
              "amount": 0.3333,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 0.3333
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.2222,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 0.2222
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Marinate 78g boneless skinless chicken thigh only in the ingredients marked tikka-marinade. Cook chicken to 165 F; cool promptly before wrapping.",
            "No rice, cheese, cashews, or side sauce cup is included. The unchanged25g current Garlic Herb Yogurt finish contains its controlled light mayonnaise.",
            "October 19 second-pass sodium correction: add no salt to the tikka marinade because the tortilla and chicken provide the remaining sodium.",
            "October 20 owner formula: incorporate exactly 25g PRPD Garlic Herb Yogurt per meal. The sauce uses the controlled yogurt, light-mayo, reduced-lemon, cilantro and jalapeno formula with no added water.",
            "October28 owner approved40% less chicken:78g raw thigh per SINGLE wrap, with only its raw-contact marinade scaled to60%. Keep one tortilla,25g current Garlic Herb Yogurt and all salad unchanged.",
            "The75% cooked-yield model is not a new measured result. Record actual cooked meat and final wrap net weight; no retrospective Tikka leftovers remain for weighing."
          ]
        }
      },
      "plannerOnly": false
    },
    "a2": {
      "name": "Oven-Baked Popcorn Chicken",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "October29 owner authorized complete recipe-based nutrient and net-weight estimates for final labels. Formula unchanged:160g raw thigh model,25g plain unfrosted Kellogg's Corn Flakes before crushing,5g flour,15g eggwhite,3g oil and measured spices/salt. Nutrients count all issued coating/oil retained; no dip. USDA flour/garlic/pepper micronutrients supplement the complete cereal panel. Physical panels, recovery, retained coating/oil, bake load,165F endpoint, net weight,12oz fit, cooling and24/72-hour reheat remain unmeasured checks, not invented results. Malt supplies gluten; contains wheat/egg.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 160.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "allocations": {
                "popcorn-chicken": 160.0
              },
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "kelloggs_corn_flakes_plain",
              "sourceKey": "kelloggs_corn_flakes_plain",
              "name": "Kellogg's Corn Flakes, plain unfrosted",
              "amount": 25,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:popcorn-chicken",
              "confidence": "manufacturer-panel-physical-pending",
              "allocations": {
                "popcorn-chicken": 25
              }
            },
            {
              "key": "flour",
              "sourceKey": "flour",
              "name": "All-purpose flour",
              "amount": 5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:popcorn-chicken",
              "confidence": "high",
              "allocations": {
                "popcorn-chicken": 5
              }
            },
            {
              "key": "egg_white",
              "sourceKey": "egg_white",
              "name": "Liquid egg white",
              "amount": 15,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:popcorn-chicken",
              "confidence": "high",
              "allocations": {
                "popcorn-chicken": 15
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:popcorn-chicken",
              "confidence": "medium",
              "allocations": {
                "popcorn-chicken": 3
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:popcorn-chicken",
              "confidence": "medium",
              "allocations": {
                "popcorn-chicken": 1
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:popcorn-chicken",
              "confidence": "high",
              "allocations": {
                "popcorn-chicken": 0.5
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:popcorn-chicken",
              "confidence": "high",
              "allocations": {
                "popcorn-chicken": 0.2
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.75,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:popcorn-chicken",
              "confidence": "high",
              "allocations": {
                "popcorn-chicken": 0.75
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "owner-authorized-recipe-estimate",
          "assumptions": [
            "October28 owner approved plain unfrosted Corn Flakes replacing panko25g for25g weighed BEFORE crushing. All other formula quantities remain unchanged.",
            "PRPD adaptation of Heart Foundation NZ, not its unchanged recipe or nutrition claim.",
            "Portion120g cooked UNBREADED thigh equivalent PLUS coating/oil, not120g finished breaded food.",
            "rawEquivalentGrams=160 at an unvalidated75% planning recovery. No new measured yield is claimed.",
            "Count all25g cereal,5g flour,15g egg white and3g oil until actual incorporation is measured.",
            "October29 owner authorized complete recipe-based label nutrition. Use recorded manufacturer/USDA profiles and full issued coating/oil retention; physical panel, pickup, yield and quality observations remain unmeasured.",
            "Contains egg and wheat; malt adds gluten. No gluten-free claim and no required dip.",
            "Actual halal thigh and plain Kellogg's Corn Flakes panels",
            "Method-specific raw-to-cooked meat recovery",
            "Precrush input, crushing loss and retained coating/oil",
            "Actual coated net weight and12oz fit",
            "Breading time, bake capacity,165F endpoint and protected cooling",
            "Fresh and24/72h held/reheated quality"
          ]
        }
      },
      "plannerOnly": false,
      "qualityChecks": "October29 owner authorized complete recipe-based nutrient and net-weight estimates for final labels. Formula unchanged:160g raw thigh model,25g plain unfrosted Kellogg's Corn Flakes before crushing,5g flour,15g eggwhite,3g oil and measured spices/salt. Nutrients count all issued coating/oil retained; no dip. USDA flour/garlic/pepper micronutrients supplement the complete cereal panel. Physical panels, recovery, retained coating/oil, bake load,165F endpoint, net weight,12oz fit, cooling and24/72-hour reheat remain unmeasured checks, not invented results. Malt supplies gluten; contains wheat/egg."
    },
    "dr1": {
      "name": "Classic Mango Lassi",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 72.439,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 100.6098,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "deep_alphonso_pulp",
              "sourceKey": "deep_alphonso_pulp",
              "name": "Deep Alphonso mango pulp",
              "amount": 144.878,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 12.0732,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            }
          ],
          "confidence": "low",
          "assumptions": [
            "Owner-tasted fresh recipe: 90 g FAGE 0%, 125 g Fairlife fat-free milk, 180 g Deep Alphonso pulp, 15 g honey.",
            "330 g bottle assumes homogeneous blend from 410 g input; actual recovered mass and fill remain unmeasured.",
            "Pulp panel is incomplete; full label printing is held until the purchased can is checked."
          ]
        }
      },
      "plannerOnly": false
    },
    "p1": {
      "name": "High-Protein Beef Kofta & Roasted Vegetables",
      "category": "Internal custom meal",
      "aliases": [
        "96/4 Beef Kofta",
        "96/4 Beef Kofta Meal",
        "Beef Kofta",
        "Beef Kafta",
        "Custom Drained Ground Beef Mince",
        "Custom Drained Ground Beef Mince Meal"
      ],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Preserve Nouman's successful five-log actual-96/4 house formula with drained onion and jalapeno mixed into the beef. Pack the kachumber separately.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_96_raw",
              "sourceKey": "beef_96_raw",
              "name": "96/4 lean ground beef, raw",
              "amount": 330,
              "unit": "g",
              "station": "Beef",
              "note": "component:nouman-kofta",
              "confidence": "medium",
              "allocations": {
                "nouman-kofta": 330
              },
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "shan_seekh",
              "sourceKey": "shan_seekh",
              "name": "Shan Seekh Kabab Recipe Mix",
              "amount": 16.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:nouman-kofta",
              "confidence": "medium",
              "allocations": {
                "nouman-kofta": 16.5
              },
              "measure": {
                "type": "packet",
                "gramsPerPacket": 50.0
              }
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kofta",
              "confidence": "high",
              "allocations": {
                "nouman-kofta": 25
              }
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 13,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kofta; component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kofta": 10,
                "nouman-kachumber": 3
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:nouman-kofta",
              "confidence": "high",
              "allocations": {
                "nouman-kofta": 1
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.7013,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:nouman-kofta; component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kofta": 0.5,
                "nouman-kachumber": 0.2013
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.025,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:nouman-kofta; component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kofta": 0.5,
                "nouman-kachumber": 0.525
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "cucumber",
              "sourceKey": "cucumber",
              "name": "Cucumber with peel, raw",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 100
              }
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 70,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 70
              }
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 25
              }
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 4,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "medium",
              "allocations": {
                "nouman-kachumber": 4
              },
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 3,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 3
              }
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 19.5556,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "high",
              "allocations": {
                "batch13-sweet-heat": 19.5556
              }
            },
            {
              "key": "ketchup",
              "sourceKey": "ketchup",
              "name": "Ketchup",
              "amount": 23.4667,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "low",
              "allocations": {
                "batch13-sweet-heat": 23.4667
              },
              "measure": {
                "type": "liquid",
                "density": 1.14
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 23.4667,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:batch13-sweet-heat",
              "confidence": "high",
              "allocations": {
                "batch13-sweet-heat": 23.4667
              },
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 13.5111,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "medium",
              "allocations": {
                "batch13-sweet-heat": 13.5111
              },
              "measure": {
                "type": "liquid",
                "density": 1.1
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Use actual 96/4 beef; draining 90/10 does not make its nutrition 96/4.",
            "Grate the onion, squeeze it dry, and weigh 25g retained pulp per meal. Finely mince the jalapeno.",
            "Mix beef, drained onion, jalapeno, Shan mix, paprika, black pepper and salt, then divide into five equal logs per meal. All mixture is used.",
            "This is the owner-described PRPD house formula, not the unadapted Shan package recipe. It intentionally omits suet, butter and added oil.",
            "Nouman's beef meal has no roasted vegetable side. The onion and jalapeno shown here are kofta mix-ins; the kachumber is packed separately.",
            "Nutrition includes all the Shan mix. Owner retained 330g beef and five kofta; calculated calories are not reduced by assuming extra drained fat loss.",
            "Cook the kofta on a lined tray with no added oil. Preserve the successful five-log actual-96/4 house formula with drained onion and jalapeno mixed into the beef.",
            "Pack one separate 205g small-cut salad portion with cucumber, tomato, red onion, lemon, cilantro and evenly blended jalapeno. Measure salt and black pepper in teaspoons at the full multi-serving batch level.",
            "Pack 2 separate 40g PRPD Sweet Heat cup(s) per meal."
          ]
        }
      },
      "plannerOnly": true,
      "service": {
        "sideCupComponents": [
          {
            "name": "PRPD Sweet Heat Sauce",
            "batchGroup": "sweet-heat",
            "componentRef": "batch13-sweet-heat",
            "cupsPerMeal": 2,
            "gramsPerMeal": 40
          }
        ]
      },
      "qualityChecks": "Preserve Nouman's successful five-log actual-96/4 house formula with drained onion and jalapeno mixed into the beef. Pack the kachumber separately."
    },
    "p2": {
      "name": "Custom Lean Chicken Mince",
      "category": "Internal custom meal",
      "aliases": [
        "Custom Lean Chicken Mince Meal",
        "Custom Chicken Breast Mince",
        "Chicken Breast Mince"
      ],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_mince_raw",
              "sourceKey": "chicken_mince_cooked",
              "name": "Pure chicken-breast mince, raw",
              "amount": 300.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 60,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 25
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 6.3,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:lebanese-dressing",
              "confidence": "high",
              "allocations": {
                "lebanese-dressing": 0.3
              }
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 13.5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber; component:lebanese-dressing",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              },
              "allocations": {
                "nouman-kachumber": 4,
                "lebanese-dressing": 4.5
              }
            },
            {
              "key": "parsley",
              "sourceKey": "parsley",
              "name": "Flat-leaf parsley, raw",
              "amount": 5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 0.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.6513,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:nouman-kachumber; component:lebanese-dressing",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              },
              "allocations": {
                "nouman-kachumber": 0.2013,
                "lebanese-dressing": 0.15
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.825,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:nouman-kachumber; component:lebanese-dressing",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              },
              "allocations": {
                "nouman-kachumber": 0.525,
                "lebanese-dressing": 0.3
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 60,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "Moist qeema cooking liquid; reduce only to a moist, lightly saucy consistency",
              "confidence": "high"
            },
            {
              "key": "cucumber",
              "sourceKey": "cucumber",
              "name": "Cucumber with peel, raw",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 100
              }
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 70,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 70
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 3,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 3
              }
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 3,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:nouman-kachumber",
              "confidence": "high",
              "allocations": {
                "nouman-kachumber": 3
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 9,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:lebanese-dressing",
              "confidence": "medium",
              "allocations": {
                "lebanese-dressing": 9
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "mustard",
              "sourceKey": "mustard",
              "name": "Prepared Dijon mustard",
              "amount": 0.75,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:lebanese-dressing",
              "confidence": "medium",
              "allocations": {
                "lebanese-dressing": 0.75
              },
              "measure": {
                "type": "liquid",
                "density": 1.04
              }
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 9.7778,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "high",
              "allocations": {
                "batch13-sweet-heat": 9.7778
              }
            },
            {
              "key": "ketchup",
              "sourceKey": "ketchup",
              "name": "Ketchup",
              "amount": 11.7333,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "low",
              "allocations": {
                "batch13-sweet-heat": 11.7333
              },
              "measure": {
                "type": "liquid",
                "density": 1.14
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 11.7333,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:batch13-sweet-heat",
              "confidence": "high",
              "allocations": {
                "batch13-sweet-heat": 11.7333
              },
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 6.7556,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:batch13-sweet-heat",
              "confidence": "medium",
              "allocations": {
                "batch13-sweet-heat": 6.7556
              },
              "measure": {
                "type": "liquid",
                "density": 1.1
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Use pure chicken-breast mince: 300g raw per meal, cooked to 165 F.",
            "Cook with the measured onion, garlic, lemon, spices and water. Keep the finished qeema moist and lightly saucy, not dry or fully salan-style.",
            "Pack one separate 205g small-cut salad portion with cucumber, tomato, red onion, lemon, cilantro and evenly blended jalapeno. Measure salt and black pepper in teaspoons at the full multi-serving batch level.",
            "Pack one separate 15g lemon-mustard-garlic dressing cup and one separate 40g PRPD Sweet Heat cup per meal.",
            "The dressing is PRPD's light adaptation of the established 2:1 oil-to-acid vinaigrette direction: bottled lemon juice, avocado oil, prepared mustard, garlic, salt, and black pepper.",
            "This follows Nouman's October 7 Google Voice request for three moist chicken qeema meals with kachumber; record the actual cooked mince yield during production."
          ]
        }
      },
      "plannerOnly": true,
      "service": {
        "sideCupComponents": [
          {
            "name": "Lemon-mustard-garlic dressing",
            "batchGroup": "lebanese-dressing",
            "componentRef": "lebanese-dressing",
            "cupsPerMeal": 1,
            "gramsPerMeal": 15,
            "weightBasis": "raw-input"
          },
          {
            "name": "PRPD Sweet Heat Sauce",
            "batchGroup": "sweet-heat",
            "componentRef": "batch13-sweet-heat",
            "cupsPerMeal": 1,
            "gramsPerMeal": 40
          }
        ]
      }
    },
    "p3": {
      "name": "Custom Lebanese-Style Chicken Breast",
      "category": "Internal custom meal",
      "aliases": [
        "Custom Lebanese-Style Chicken Breast Meal",
        "Custom Lebanese Chicken + Fattoush-Style Salad"
      ],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_breast_raw",
              "sourceKey": "chicken_breast_cooked",
              "name": "Boneless skinless chicken breast, raw",
              "amount": 300.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "medium",
              "allocations": {
                "lebanese-marinade": 300.0
              },
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 17.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:lebanese-marinade; component:lebanese-dressing",
              "confidence": "medium",
              "allocations": {
                "lebanese-marinade": 12.5,
                "lebanese-dressing": 4.5
              },
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 3.6,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:lebanese-marinade; component:lebanese-dressing",
              "confidence": "high",
              "allocations": {
                "lebanese-marinade": 3.3,
                "lebanese-dressing": 0.3
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 20,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:lebanese-marinade; component:lebanese-dressing",
              "confidence": "medium",
              "allocations": {
                "lebanese-marinade": 11,
                "lebanese-dressing": 9
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:lebanese-marinade",
              "confidence": "high",
              "allocations": {
                "lebanese-marinade": 1
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 0.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:lebanese-marinade",
              "confidence": "high",
              "allocations": {
                "lebanese-marinade": 0.5
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.7,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:lebanese-marinade; component:lebanese-dressing",
              "confidence": "high",
              "allocations": {
                "lebanese-marinade": 0.55,
                "lebanese-dressing": 0.15
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.35,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:lebanese-marinade; component:lebanese-dressing",
              "confidence": "high",
              "allocations": {
                "lebanese-marinade": 1.05,
                "lebanese-dressing": 0.3
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "mustard",
              "sourceKey": "mustard",
              "name": "Prepared Dijon mustard",
              "amount": 0.75,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:lebanese-dressing",
              "confidence": "medium",
              "allocations": {
                "lebanese-dressing": 0.75
              },
              "measure": {
                "type": "liquid",
                "density": 1.04
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Planner-only paid custom pilot; it is not a public Batch 7 menu item.",
            "Chicken targets 225g cooked from 300g raw at a provisional 75% yield.",
            "Sumac is intentionally excluded from the Batch 7 recipe and ingredient statement.",
            "Batch 8 uses the purchased PRPD avocado oil in every measured cooking-oil allocation.",
            "Do not add an automatic Sweet Heat cup; Batch 16 house sauces come only from the customer's order-level selections.",
            "Pack one separate 15g lemon-mustard-garlic dressing cup. This is PRPD's light adaptation of the established 2:1 oil-to-acid vinaigrette direction using bottled lemon juice, avocado oil, prepared mustard, garlic, salt, and black pepper."
          ]
        }
      },
      "plannerOnly": true,
      "service": {
        "sideCupComponents": [
          {
            "name": "Lemon-mustard-garlic dressing",
            "batchGroup": "lebanese-dressing",
            "componentRef": "lebanese-dressing",
            "cupsPerMeal": 1,
            "gramsPerMeal": 15,
            "weightBasis": "raw-input"
          }
        ]
      }
    },
    "bw1": {
      "name": "Harissa Honey Chicken",
      "category": "Internal custom meal",
      "aliases": [],
      "status": "Batch 20 controlled planning recipe",
      "recommendation": "Returning controlled PRPD adaptation with an incorporated harissa-honey glaze and no recipe-required sauce cup. Verify the actual purchased harissa jar panel and record finished glaze, chicken, rice, broccoli and packed weights; the Mina-style harissa profile and jar price remain planning placeholders.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_standard_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 232.5581,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; measured 68.8% cooked yield from the October 7 component test.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 45.0,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "owner standard; targets 120g/160g cooked pending measured rice yield",
              "confidence": "medium"
            },
            {
              "key": "broccoli",
              "sourceKey": "broccoli",
              "name": "Broccoli, raw",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "harissa",
              "sourceKey": "harissa",
              "name": "Harissa paste",
              "amount": 13.9535,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 9.3023,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "tomato_paste",
              "sourceKey": "tomato_paste",
              "name": "Tomato paste",
              "amount": 6.9767,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 6.9767,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 3.4884,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 4.6512,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.6977,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "coriander",
              "sourceKey": "coriander",
              "name": "Ground coriander",
              "amount": 0.6977,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.8
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.8605,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Plate exactly 160g cooked boneless skinless chicken thigh before sauce.",
            "Owner-approved component standard: 120g cooked starch and 75g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "The named broccoli side exceeds the baseline vegetable minimum and retains its recipe-specific quantity.",
            "Chicken uses the shared neutral savory base, then receives the exact measured harissa-honey finish.",
            "Glaze is incorporated; there is no duplicate sauce cup.",
            "Harissa package data and the first finished glaze/chicken yield must be recorded before label printing."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_standard_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 305.2326,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; measured 68.8% cooked yield from the October 7 component test.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 60.0,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "owner standard; targets 120g/160g cooked pending measured rice yield",
              "confidence": "medium"
            },
            {
              "key": "broccoli",
              "sourceKey": "broccoli",
              "name": "Broccoli, raw",
              "amount": 130,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "harissa",
              "sourceKey": "harissa",
              "name": "Harissa paste",
              "amount": 18.314,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 12.2093,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "tomato_paste",
              "sourceKey": "tomato_paste",
              "name": "Tomato paste",
              "amount": 9.157,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 9.157,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 4.5785,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 6.1047,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.9157,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "coriander",
              "sourceKey": "coriander",
              "name": "Ground coriander",
              "amount": 0.9157,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 1.8
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 2.4419,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Plate exactly 210g cooked boneless skinless chicken thigh before sauce.",
            "Owner-approved component standard: 160g cooked starch and 100g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "The named broccoli side exceeds the baseline vegetable minimum and retains its recipe-specific quantity.",
            "Chicken uses the shared neutral savory base, then receives the exact measured harissa-honey finish.",
            "Glaze is incorporated; there is no duplicate sauce cup.",
            "Harissa package data and the first finished glaze/chicken yield must be recorded before label printing."
          ]
        }
      },
      "plannerOnly": true,
      "qualityChecks": "Returning controlled PRPD adaptation with an incorporated harissa-honey glaze and no recipe-required sauce cup. Verify the actual purchased harissa jar panel and record finished glaze, chicken, rice, broccoli and packed weights; the Mina-style harissa profile and jar price remain planning placeholders."
    }
  },
  "recipeLibrary": {},
  "sauceFormulas": {
    "sweet-heat": {
      "name": "PRPD Sweet Heat Sauce",
      "componentRef": "batch13-sweet-heat",
      "gramsPerCup": 40,
      "batchSizeCups": 5,
      "batchInputGrams": 225,
      "ingredients": [
        {
          "key": "light_mayo",
          "name": "Great Value light mayonnaise",
          "grams": 55
        },
        {
          "key": "ketchup",
          "name": "Ketchup",
          "grams": 66
        },
        {
          "key": "honey",
          "name": "Honey",
          "grams": 66
        },
        {
          "key": "sriracha",
          "name": "Sriracha sauce",
          "grams": 38
        }
      ]
    },
    "garlic-herb-yogurt": {
      "name": "PRPD Garlic Herb Yogurt",
      "componentRef": "garlic-herb-yogurt",
      "gramsPerCup": 40,
      "batchSizeCups": 5,
      "batchInputGrams": 225,
      "ingredients": [
        {
          "key": "fage",
          "name": "FAGE Total 0%",
          "grams": 165
        },
        {
          "key": "light_mayo",
          "name": "Great Value light mayonnaise",
          "grams": 25
        },
        {
          "key": "lemon",
          "name": "Lemon juice, raw",
          "grams": 10
        },
        {
          "key": "cilantro",
          "name": "Cilantro, raw",
          "grams": 10
        },
        {
          "key": "jalapeno",
          "name": "Jalapeno, raw",
          "grams": 6
        },
        {
          "key": "garlic",
          "name": "Garlic, raw",
          "grams": 3
        },
        {
          "key": "parsley",
          "name": "Flat-leaf parsley, raw",
          "grams": 3
        },
        {
          "key": "salt",
          "name": "Table salt",
          "grams": 2
        },
        {
          "key": "cumin",
          "name": "Ground cumin",
          "grams": 1
        }
      ]
    },
    "honey-barbecue-mustard": {
      "name": "PRPD Honey Barbecue Mustard",
      "componentRef": "honey-barbecue-mustard",
      "gramsPerCup": 45,
      "recipeRequiredOnly": true,
      "ingredients": [
        {
          "key": "mustard",
          "name": "Yellow mustard",
          "grams": 18
        },
        {
          "key": "bbq_sauce",
          "name": "G Hughes sugar-free barbecue sauce",
          "grams": 15
        },
        {
          "key": "honey",
          "name": "Honey",
          "grams": 8
        },
        {
          "key": "apple_cider_vinegar",
          "name": "Apple cider vinegar",
          "grams": 3
        },
        {
          "key": "garlic_powder",
          "name": "Garlic powder",
          "grams": 0.3
        },
        {
          "key": "smoked_paprika",
          "name": "Smoked paprika",
          "grams": 0.3
        },
        {
          "key": "black_pepper",
          "name": "Ground black pepper",
          "grams": 0.2
        },
        {
          "key": "salt",
          "name": "Table salt",
          "grams": 0.2
        }
      ]
    },
    "cucumber-dill-tzatziki": {
      "name": "Cucumber Dill Tzatziki",
      "componentRef": "cucumber-dill-tzatziki",
      "gramsPerCup": 40,
      "batchSizeCups": 5,
      "batchInputGrams": 200,
      "batchSizeBasis": "theoretical composition; recovered fill not measured",
      "allergens": "CONTAINS: MILK.",
      "steps": [
        "Grate and squeeze cucumber, then weigh the displayed squeezed amount; raw pull is separate.",
        "Stir all measured ingredients together. Refrigerate30minutes before tasting; do not blend cucumber into a watery puree."
      ],
      "ingredients": [
        {
          "key": "batch18_fage_0",
          "name": "FAGE Total0% plain nonfat Greek yogurt",
          "grams": 140
        },
        {
          "key": "batch18_cucumber_squeezed",
          "name": "Cucumber, with peel, raw",
          "grams": 35
        },
        {
          "key": "batch18_lemon",
          "name": "Lemon juice from concentrate, canned or bottled",
          "grams": 12
        },
        {
          "key": "batch18_olive_oil",
          "name": "Oil, olive, salad or cooking",
          "grams": 5
        },
        {
          "key": "batch18_dill",
          "name": "Dill weed, fresh",
          "grams": 3
        },
        {
          "key": "batch18_mint",
          "name": "Spearmint, fresh",
          "grams": 1
        },
        {
          "key": "batch18_garlic",
          "name": "Garlic, raw",
          "grams": 2
        },
        {
          "key": "batch18_salt",
          "name": "Salt, table",
          "grams": 1.5
        },
        {
          "key": "batch18_black_pepper",
          "name": "Spices, pepper, black",
          "grams": 0.5
        }
      ]
    },
    "mango-chipotle-lime": {
      "name": "Mango Chipotle Lime",
      "componentRef": "mango-chipotle-lime",
      "gramsPerCup": 40,
      "batchSizeCups": 5,
      "batchInputGrams": 200,
      "batchSizeBasis": "theoretical composition; recovered fill not measured",
      "allergens": "",
      "steps": [
        "Use Roland Chipotle Peppers in Adobo Sauce UPC041224457805 for this calculation. Weigh peeled/pitted ripe mango and chipotle together with its adobo; do not drain off the sauce.",
        "Blend all displayed ingredients smooth, scrape, cover and refrigerate30minutes before tasting."
      ],
      "ingredients": [
        {
          "key": "batch18_mango",
          "name": "Mangos, raw",
          "grams": 160
        },
        {
          "key": "batch18_chipotle_adobo",
          "name": "Roland Chipotle Peppers in Adobo Sauce, UPC041224457805",
          "grams": 10
        },
        {
          "key": "batch18_lime",
          "name": "Lime juice, raw",
          "grams": 18
        },
        {
          "key": "batch18_honey",
          "name": "Honey",
          "grams": 8
        },
        {
          "key": "batch18_vinegar",
          "name": "Vinegar, cider",
          "grams": 2.5
        },
        {
          "key": "batch18_garlic",
          "name": "Garlic, raw",
          "grams": 1
        },
        {
          "key": "batch18_salt",
          "name": "Salt, table",
          "grams": 0.5
        }
      ]
    },
    "lemon-tahini": {
      "name": "Lemon Tahini",
      "componentRef": "lemon-tahini",
      "gramsPerCup": 40,
      "batchSizeCups": 5,
      "batchInputGrams": 200,
      "batchSizeBasis": "theoretical composition; recovered fill not measured",
      "allergens": "CONTAINS: SESAME.",
      "steps": [
        "Stir plain tahini in its jar before weighing. Whisk tahini, lemon, garlic and seasonings.",
        "Add exactly the displayed cold potable water gradually; whisk smooth. Refrigerate30minutes before tasting. Record any gram adjustment as a recipe revision."
      ],
      "ingredients": [
        {
          "key": "batch18_tahini",
          "name": "Soom Premium Tahini, plain sesame seeds",
          "grams": 95
        },
        {
          "key": "batch18_water",
          "name": "Beverages, water, tap, drinking",
          "grams": 78
        },
        {
          "key": "batch18_lemon",
          "name": "Lemon juice from concentrate, canned or bottled",
          "grams": 22
        },
        {
          "key": "batch18_garlic",
          "name": "Garlic, raw",
          "grams": 2
        },
        {
          "key": "batch18_salt",
          "name": "Salt, table",
          "grams": 1.5
        },
        {
          "key": "batch18_cumin",
          "name": "Spices, cumin seed",
          "grams": 1
        },
        {
          "key": "batch18_black_pepper",
          "name": "Spices, pepper, black",
          "grams": 0.5
        }
      ]
    }
  }
};

if (typeof window !== 'undefined') window.PRPD_PRODUCTION_DATA = PRPD_PRODUCTION_DATA;
if (typeof module !== 'undefined' && module.exports) module.exports = PRPD_PRODUCTION_DATA;
