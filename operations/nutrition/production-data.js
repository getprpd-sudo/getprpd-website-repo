const PRPD_PRODUCTION_DATA = {
  "version": "batch-19-current-v2",
  "batch": 19,
  "notice": "Generated from the effective current order configuration. Missing current recipes stop generation instead of loading an archived batch. Recipe-required side cups come from the current structured service records; weekly promotional sauce rules must be added separately and explicitly. Owner-released production-run quality checks remain visible.",
  "meals": {
    "b1": {
      "name": "Grilled Cheese Breakfast Burrito",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 120.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
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
              "amount": 25,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "tomato_paste",
              "sourceKey": "tomato_paste",
              "name": "Tomato paste",
              "amount": 16,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
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
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Broth is intentionally removed from the PRPD recipe system.",
            "The egg component uses the shared breakfast base of one whole egg plus 25g liquid egg whites per order.",
            "Cook the beef-and-onion filling down until dry enough to wrap cleanly; dry-pan grill after assembly.",
            "October 19 second-pass sodium correction: add no salt to the filling and use 20g Lean / 28g Bulk mozzarella because the tortillas and cheese already provide seasoning.",
            "October 21 owner-approved tortilla format: Lean uses two medium tortillas and Bulk uses three medium tortillas. Large tortillas are no longer used for this meal."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 180.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "small_tortilla",
              "sourceKey": "small_tortilla",
              "name": "Mission Carb Balance medium soft-taco tortilla",
              "amount": 3,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "medium"
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
              "amount": 25,
              "unit": "g",
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
              "key": "tomato_paste",
              "sourceKey": "tomato_paste",
              "name": "Tomato paste",
              "amount": 16,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
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
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Broth is intentionally removed from the PRPD recipe system.",
            "The egg component uses the shared breakfast base of one whole egg plus 25g liquid egg whites per order.",
            "Cook the beef-and-onion filling down until dry enough to wrap cleanly; dry-pan grill after assembly.",
            "October 19 second-pass sodium correction: add no salt to the filling and use 20g Lean / 28g Bulk mozzarella because the tortillas and cheese already provide seasoning.",
            "October 21 owner-approved tortilla format: Lean uses two medium tortillas and Bulk uses three medium tortillas. Large tortillas are no longer used for this meal."
          ]
        }
      },
      "plannerOnly": false
    },
    "b2": {
      "name": "Beef Breakfast Skillet",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
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
      "name": "Beef Bacon Breakfast Pizza",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
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
              "confidence": "high",
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
              "confidence": "planning"
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
              "confidence": "high",
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
              "confidence": "planning"
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
    "m1": {
      "name": "BBQ Chicken Mac & Cheese",
      "category": "Main",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
      "recommendation": "Owner approved one matching 30g BBQ side cup per meal in addition to the 30g incorporated lower-sodium BBQ finish. Keep both allocations separate and never replace the required BBQ cup with a weekly sauce selection.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 180.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.215,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.215
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
              "amount": 0.72,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.72
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
              "amount": 0.54,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.54
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
              "amount": 0.36,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.36
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "protein_mac",
              "sourceKey": "protein_mac",
              "name": "Muscle Mac high-protein macaroni and cheese",
              "amount": 50,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "bbq_sauce",
              "sourceKey": "bbq_sauce",
              "name": "G Hughes sugar-free BBQ sauce",
              "amount": 50,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:bbq-incorporated; component:bbq-side-cup",
              "confidence": "high",
              "allocations": {
                "bbq-incorporated": 20,
                "bbq-side-cup": 30
              }
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 5,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:bbq-incorporated",
              "confidence": "medium",
              "allocations": {
                "bbq-incorporated": 5
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 5,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:bbq-incorporated",
              "confidence": "high",
              "allocations": {
                "bbq-incorporated": 5
              }
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
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Use one 30g incorporated finish made from 20g barbecue sauce, 5g apple-cider vinegar, and 5g water.",
            "Pack one separate 30g matching G Hughes BBQ sauce cup with every meal. This is recipe-required service, not an interchangeable weekly sauce.",
            "Chicken uses the salt-free aromatic thigh base because Muscle Mac, mozzarella and barbecue sauce provide the seasoning.",
            "October 22 owner correction: allocate 180g raw chicken to Lean and 250g raw chicken to Bulk.",
            "Dry Muscle Mac is corrected to 50g Lean and 60g Bulk from the Batch 6 overproduction observation; record the next finished yield."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 250.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.6875,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.6875
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
              "amount": 1.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.0
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
              "amount": 0.75,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.75
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
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "protein_mac",
              "sourceKey": "protein_mac",
              "name": "Muscle Mac high-protein macaroni and cheese",
              "amount": 60,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "bbq_sauce",
              "sourceKey": "bbq_sauce",
              "name": "G Hughes sugar-free BBQ sauce",
              "amount": 50,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:bbq-incorporated; component:bbq-side-cup",
              "confidence": "high",
              "allocations": {
                "bbq-incorporated": 20,
                "bbq-side-cup": 30
              }
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 5,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:bbq-incorporated",
              "confidence": "medium",
              "allocations": {
                "bbq-incorporated": 5
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 5,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:bbq-incorporated",
              "confidence": "high",
              "allocations": {
                "bbq-incorporated": 5
              }
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
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Use one 30g incorporated finish made from 20g barbecue sauce, 5g apple-cider vinegar, and 5g water.",
            "Pack one separate 30g matching G Hughes BBQ sauce cup with every meal. This is recipe-required service, not an interchangeable weekly sauce.",
            "Chicken uses the salt-free aromatic thigh base because Muscle Mac, mozzarella and barbecue sauce provide the seasoning.",
            "October 22 owner correction: allocate 180g raw chicken to Lean and 250g raw chicken to Bulk.",
            "Dry Muscle Mac is corrected to 50g Lean and 60g Bulk from the Batch 6 overproduction observation; record the next finished yield."
          ]
        }
      },
      "plannerOnly": false,
      "service": {
        "sideCupComponents": [
          {
            "name": "G Hughes Sugar-Free BBQ Sauce",
            "batchGroup": "bbq-side-cup",
            "componentRef": "bbq-side-cup",
            "cupsPerMeal": 1,
            "gramsPerMeal": 30
          }
        ]
      },
      "qualityChecks": "Owner approved one matching 30g BBQ side cup per meal in addition to the 30g incorporated lower-sodium BBQ finish. Keep both allocations separate and never replace the required BBQ cup with a weekly sauce selection."
    },
    "m2": {
      "name": "Mexican Streetcorn Chicken Bowl",
      "category": "Main",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
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
              "key": "corn",
              "sourceKey": "corn",
              "name": "Sweet yellow corn, cooked, no salt",
              "amount": 88,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 10,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 4,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 25,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 7,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cotija",
              "sourceKey": "cotija",
              "name": "Cotija cheese",
              "amount": 10,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 3,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lime",
              "sourceKey": "lime",
              "name": "Lime juice, raw",
              "amount": 10,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:chicken-cooking",
              "confidence": "medium",
              "allocations": {
                "chicken-cooking": 2
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
              "amount": 1.8605,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 1.8605
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
              "amount": 1.5698,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.5698
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
              "amount": 0.9302,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.9302
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
              "amount": 0.6977,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.6977
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
              "amount": 0.4651,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.4651
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 30,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "0.5g/0.75g Lean/Bulk salt is modeled; Tajin and garlic powder remain small working exclusions.",
            "Draft corn formula has not been kitchen-tested.",
            "Plate exactly 160g cooked boneless skinless chicken thigh before sauce.",
            "Owner-approved component standard: 120g cooked starch and 75g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "The named street-corn vegetables exceed the baseline vegetable minimum and retain their recipe-specific quantities.",
            "Green bell pepper is included in the controlled street-corn component.",
            "The measured avocado oil is for cooking the chicken only. Dry-char the corn; do not add oil to the corn or finished bowl."
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
              "key": "corn",
              "sourceKey": "corn",
              "name": "Sweet yellow corn, cooked, no salt",
              "amount": 110,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 12,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 7,
              "unit": "g",
              "station": "Sauces & Dairy",
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
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 4,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lime",
              "sourceKey": "lime",
              "name": "Lime juice, raw",
              "amount": 12,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:chicken-cooking",
              "confidence": "medium",
              "allocations": {
                "chicken-cooking": 3
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
              "amount": 2.4419,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 2.4419
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
              "amount": 2.0603,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 2.0603
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
              "amount": 1.2209,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.2209
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
              "amount": 0.9157,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.9157
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
              "amount": 0.6105,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.6105
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 40,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "0.5g/0.75g Lean/Bulk salt is modeled; Tajin and garlic powder remain small working exclusions.",
            "Draft corn formula has not been kitchen-tested.",
            "Plate exactly 210g cooked boneless skinless chicken thigh before sauce.",
            "Owner-approved component standard: 160g cooked starch and 100g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "The named street-corn vegetables exceed the baseline vegetable minimum and retain their recipe-specific quantities.",
            "Green bell pepper is included in the controlled street-corn component.",
            "The measured avocado oil is for cooking the chicken only. Dry-char the corn; do not add oil to the corn or finished bowl."
          ]
        }
      },
      "plannerOnly": false
    },
    "m3": {
      "name": "Cheesy Achiote Chicken Tacos",
      "category": "Main",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
      "recommendation": "Labels use the owner-approved conservative estimated net weights. Use Mission White Corn Street Taco tortillas and El Yucateco seasoned achiote paste, and record tortilla/reheat quality.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 180.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "corn_street_tortilla",
              "sourceKey": "corn_street_tortilla",
              "name": "Mission White Corn Street Taco tortilla",
              "amount": 3,
              "unit": "each",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 45,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cotija",
              "sourceKey": "cotija",
              "name": "Cotija cheese",
              "amount": 15,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 30,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:achiote-pickled-onion",
              "confidence": "high",
              "allocations": {
                "achiote-pickled-onion": 30
              }
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 6,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:achiote-pickled-onion",
              "confidence": "medium",
              "allocations": {
                "achiote-pickled-onion": 6
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 6,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:achiote-pickled-onion",
              "confidence": "high",
              "allocations": {
                "achiote-pickled-onion": 6
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 0.6,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:achiote-pickled-onion",
              "confidence": "high",
              "allocations": {
                "achiote-pickled-onion": 0.6
              },
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.05,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:achiote-pickled-onion; component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-pickled-onion": 0.3,
                "achiote-marinade": 0.75
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "achiote_paste",
              "sourceKey": "achiote_paste",
              "name": "El Yucateco seasoned achiote paste",
              "amount": 14.4,
              "unit": "g",
              "station": "Other",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 14.4
              }
            },
            {
              "key": "lime",
              "sourceKey": "lime",
              "name": "Lime juice, raw",
              "amount": 12,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 12
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
              "amount": 3,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 3
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 0.6,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 0.6
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.6,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 0.6
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 2.1,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:achiote-marinade",
              "confidence": "medium",
              "allocations": {
                "achiote-marinade": 2.1
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 2.1,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            }
          ],
          "confidence": "low",
          "assumptions": [
            "First fit test uses 3 complete street-size tacos and 180g raw boneless skinless chicken thigh.",
            "October 19 owner correction: this meal has no recipe-required separate sauce cup. Optional order-level sauces are selected separately from the meal recipe; up to three selected cups per customer order are free, then additional cups are $1 each.",
            "Test assembled versus kit packaging, tortilla cracking, cheese choice, cooked chicken yield and 48/72-hour reheat before release."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 240.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "corn_street_tortilla",
              "sourceKey": "corn_street_tortilla",
              "name": "Mission White Corn Street Taco tortilla",
              "amount": 4,
              "unit": "each",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 60,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cotija",
              "sourceKey": "cotija",
              "name": "Cotija cheese",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 40,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:achiote-pickled-onion",
              "confidence": "high",
              "allocations": {
                "achiote-pickled-onion": 40
              }
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 8,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:achiote-pickled-onion",
              "confidence": "medium",
              "allocations": {
                "achiote-pickled-onion": 8
              }
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 8,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:achiote-pickled-onion",
              "confidence": "high",
              "allocations": {
                "achiote-pickled-onion": 8
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 0.8,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:achiote-pickled-onion",
              "confidence": "high",
              "allocations": {
                "achiote-pickled-onion": 0.8
              },
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.4,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:achiote-pickled-onion; component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-pickled-onion": 0.4,
                "achiote-marinade": 1.0
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "achiote_paste",
              "sourceKey": "achiote_paste",
              "name": "El Yucateco seasoned achiote paste",
              "amount": 19.2,
              "unit": "g",
              "station": "Other",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 19.2
              }
            },
            {
              "key": "lime",
              "sourceKey": "lime",
              "name": "Lime juice, raw",
              "amount": 16,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 16
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
              "amount": 4,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 4
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 0.8,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 0.8
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 0.8,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:achiote-marinade",
              "confidence": "high",
              "allocations": {
                "achiote-marinade": 0.8
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 2.8,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:achiote-marinade",
              "confidence": "medium",
              "allocations": {
                "achiote-marinade": 2.8
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 2.8,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            }
          ],
          "confidence": "low",
          "assumptions": [
            "First fit test uses 4 complete street-size tacos and 240g raw boneless skinless chicken thigh.",
            "October 19 owner correction: this meal has no recipe-required separate sauce cup. Optional order-level sauces are selected separately from the meal recipe; up to three selected cups per customer order are free, then additional cups are $1 each.",
            "Test assembled versus kit packaging, tortilla cracking, cheese choice, cooked chicken yield and 48/72-hour reheat before release."
          ]
        }
      },
      "plannerOnly": false,
      "qualityChecks": "Labels use the owner-approved conservative estimated net weights. Use Mission White Corn Street Taco tortillas and El Yucateco seasoned achiote paste, and record tortilla/reheat quality."
    },
    "m4": {
      "name": "High-Protein Beef Lasagna",
      "category": "Main",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 141.75,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 170.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "tomato_paste",
              "sourceKey": "tomato_paste",
              "name": "Tomato paste",
              "amount": 10.625,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 15.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "italian_seasoning",
              "sourceKey": "italian_seasoning",
              "name": "Italian seasoning",
              "amount": 0.75,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "lasagna_sheet",
              "sourceKey": "lasagna_sheet",
              "name": "Oven-ready lasagna sheet",
              "amount": 1.5,
              "unit": "each",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "part_skim_ricotta",
              "sourceKey": "part_skim_ricotta",
              "name": "Part-skim ricotta cheese",
              "amount": 53.125,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 28.25,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "parmesan",
              "sourceKey": "parmesan",
              "name": "Parmesan cheese",
              "amount": 7.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.25,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 15.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 2.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "parsley",
              "sourceKey": "parsley",
              "name": "Flat-leaf parsley, raw",
              "amount": 1.875,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.25,
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
            "PRPD house lasagna sauce is made from canned tomatoes, tomato paste, water, onion, garlic, and Italian seasoning; purchased marinara is not used.",
            "Portion the fully chilled lasagna by individual scale weight, not by a fixed pan grid: Lean label weight 442g and Bulk label weight 589g.",
            "Use a 5g operational overfill target (447g Lean; 594g Bulk), fill every sold portion first, and retain only genuine edge trim after the customer count is complete.",
            "Uses a traditional separate part-skim ricotta layer and the same fat-free mozzarella as the other Batch 11 dishes; cottage cheese and white sauce are not used. Confirm the melt and moisture in the first pan.",
            "This is a new pilot. Confirm the purchased packages, baked pan weight, set, and equal serving weights before final labels."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 189.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 226.6667,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "tomato_paste",
              "sourceKey": "tomato_paste",
              "name": "Tomato paste",
              "amount": 14.1667,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 20.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "italian_seasoning",
              "sourceKey": "italian_seasoning",
              "name": "Italian seasoning",
              "amount": 1.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "lasagna_sheet",
              "sourceKey": "lasagna_sheet",
              "name": "Oven-ready lasagna sheet",
              "amount": 2.0,
              "unit": "each",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "part_skim_ricotta",
              "sourceKey": "part_skim_ricotta",
              "name": "Part-skim ricotta cheese",
              "amount": 70.8333,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 37.6667,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "parmesan",
              "sourceKey": "parmesan",
              "name": "Parmesan cheese",
              "amount": 9.3333,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.3333,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 20.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 2.6667,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "parsley",
              "sourceKey": "parsley",
              "name": "Flat-leaf parsley, raw",
              "amount": 2.5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.3333,
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
            "PRPD house lasagna sauce is made from canned tomatoes, tomato paste, water, onion, garlic, and Italian seasoning; purchased marinara is not used.",
            "Portion the fully chilled lasagna by individual scale weight, not by a fixed pan grid: Lean label weight 442g and Bulk label weight 589g.",
            "Use a 5g operational overfill target (447g Lean; 594g Bulk), fill every sold portion first, and retain only genuine edge trim after the customer count is complete.",
            "Uses a traditional separate part-skim ricotta layer and the same fat-free mozzarella as the other Batch 11 dishes; cottage cheese and white sauce are not used. Confirm the melt and moisture in the first pan.",
            "This is a new pilot. Confirm the purchased packages, baked pan weight, set, and equal serving weights before final labels."
          ]
        }
      },
      "plannerOnly": false
    },
    "m5": {
      "name": "Garlic Butter Wild Argentine Shrimp + Rice",
      "category": "Main",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "shrimp_raw",
              "sourceKey": "shrimp_cooked",
              "name": "Shrimp, raw peeled and deveined",
              "amount": 200.0,
              "unit": "g",
              "station": "Seafood",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 45,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "medium",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 45
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 3.7778,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice; component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 2.0,
                "garlic-herb-yogurt": 1.7778
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 13.5333,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice; component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 1.0,
                "garlic-herb-yogurt": 0.5333
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
              "key": "canned_peas_carrots",
              "sourceKey": "canned_peas_carrots",
              "name": "Peas and carrots, canned, drained",
              "amount": 74,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "zucchini",
              "sourceKey": "zucchini",
              "name": "Zucchini, raw",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 7,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 11.7778,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              },
              "allocations": {
                "garlic-herb-yogurt": 1.7778
              }
            },
            {
              "key": "cornstarch",
              "sourceKey": "cornstarch",
              "name": "Cornstarch",
              "amount": 4,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.8556,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              },
              "allocations": {
                "garlic-herb-yogurt": 0.3556
              }
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 29.3333,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 29.3333
              }
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 4.4444,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 4.4444
              }
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 1.0667,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 1.0667
              }
            },
            {
              "key": "parsley",
              "sourceKey": "parsley",
              "name": "Flat-leaf parsley, raw",
              "amount": 0.5333,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 0.5333
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 0.1778,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 0.1778
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Use the batch-wide cilantro-garlic-lime rice, then fold drained peas and carrots into the Shrimp destination share after the common rice is divided.",
            "Drained canned peas and carrots replace the frozen blend for this batch at the owner's request.",
            "The historical two tablespoons of butter was ambiguous; butter is now explicit per meal.",
            "October 20 owner formula: pack exactly 40g PRPD Garlic Herb Yogurt per meal. The sauce uses the controlled yogurt, light-mayo, reduced-lemon, cilantro and jalapeno formula with no added water."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "shrimp_raw",
              "sourceKey": "shrimp_cooked",
              "name": "Shrimp, raw peeled and deveined",
              "amount": 270.0,
              "unit": "g",
              "station": "Seafood",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 60,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "component:shared-cilantro-garlic-lime-rice",
              "confidence": "medium",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 60
              }
            },
            {
              "key": "cilantro",
              "sourceKey": "cilantro",
              "name": "Cilantro, raw",
              "amount": 4.4445,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice; component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 2.6667,
                "garlic-herb-yogurt": 1.7778
              }
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 16.8666,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:shared-cilantro-garlic-lime-rice; component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "shared-cilantro-garlic-lime-rice": 1.3333,
                "garlic-herb-yogurt": 0.5333
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
              "key": "canned_peas_carrots",
              "sourceKey": "canned_peas_carrots",
              "name": "Peas and carrots, canned, drained",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "zucchini",
              "sourceKey": "zucchini",
              "name": "Zucchini, raw",
              "amount": 130,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 10,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 13.7778,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              },
              "allocations": {
                "garlic-herb-yogurt": 1.7778
              }
            },
            {
              "key": "cornstarch",
              "sourceKey": "cornstarch",
              "name": "Cornstarch",
              "amount": 5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.1056,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              },
              "allocations": {
                "garlic-herb-yogurt": 0.3556
              }
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 29.3333,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 29.3333
              }
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 4.4444,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 4.4444
              }
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 1.0667,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 1.0667
              }
            },
            {
              "key": "parsley",
              "sourceKey": "parsley",
              "name": "Flat-leaf parsley, raw",
              "amount": 0.5333,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 0.5333
              }
            },
            {
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 0.1778,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:garlic-herb-yogurt",
              "confidence": "high",
              "allocations": {
                "garlic-herb-yogurt": 0.1778
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.1
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Use the batch-wide cilantro-garlic-lime rice, then fold drained peas and carrots into the Shrimp destination share after the common rice is divided.",
            "Drained canned peas and carrots replace the frozen blend for this batch at the owner's request.",
            "The historical two tablespoons of butter was ambiguous; butter is now explicit per meal.",
            "October 20 owner formula: pack exactly 40g PRPD Garlic Herb Yogurt per meal. The sauce uses the controlled yogurt, light-mayo, reduced-lemon, cilantro and jalapeno formula with no added water."
          ]
        }
      },
      "plannerOnly": false,
      "service": {
        "sideCupComponents": [
          {
            "name": "PRPD Garlic Herb Yogurt",
            "batchGroup": "garlic-herb-yogurt",
            "componentRef": "garlic-herb-yogurt",
            "cupsPerMeal": 1,
            "gramsPerMeal": 40
          }
        ]
      }
    },
    "m6": {
      "name": "Mango Habanero Chicken Wings",
      "category": "Main",
      "aliases": [],
      "status": "Private family wing planning recipe; measured weights and package panels pending",
      "recommendation": "Pack six individual split flats/drumettes for Lean and eight for Bulk, plus one separate 40 g NET bottled-ranch planning cup and a separate 20 g clean mango-habanero dip per box. No rice or vegetable side. Raw masses and scaled seasoning/glaze are old-pilot planning estimates, not measured piece weights or yields. Count/weigh the supplier lot, verify both sauce panels and stock, record raw/cooked output and fit, and measure 165 F away from bone. Keep ranch cold and separate. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_wings_raw",
              "sourceKey": "chicken_wings_raw",
              "name": "Split chicken wings, raw bone-in (estimated mass; count pieces)",
              "amount": 400.0,
              "unit": "g",
              "station": "Poultry",
              "note": "component:wings-seasoning; ESTIMATED mass from old400 g / about 6-piece pilot; count and weigh actual lot.",
              "confidence": "planning-unmeasured",
              "allocations": {
                "wings-seasoning": 400.0
              },
              "measure": {
                "type": "meat",
                "weightEstimated": true,
                "pieceName": "individual split flats/drumettes"
              },
              "minimumPieces": 6,
              "pieceCountBasis": "individual split flats/drumettes",
              "estimatedWeight": true
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 5.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 5.0
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
              "amount": 2.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "high",
              "allocations": {
                "wings-seasoning": 2.0
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 2.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "high",
              "allocations": {
                "wings-seasoning": 2.0
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 1.0
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
              "amount": 1.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 1.0
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.4
              }
            },
            {
              "key": "mango_habanero_sauce",
              "sourceKey": "mango_habanero_sauce",
              "name": "Purchased mango-habanero wing sauce (exact bottle panel pending)",
              "amount": 65.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:wings-finish; component:wings-extra-dip",
              "confidence": "planning-unmeasured",
              "allocations": {
                "wings-finish": 45.0,
                "wings-extra-dip": 20.0
              }
            },
            {
              "key": "bottled_ranch",
              "sourceKey": "bottled_ranch",
              "name": "Purchased bottled ranch (40 g net planning cup; exact product pending)",
              "amount": 40.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:bottled-ranch",
              "confidence": "planning-unmeasured",
              "allocations": {
                "bottled-ranch": 40.0
              }
            }
          ],
          "confidence": "planning-unmeasured",
          "assumptions": [
            "Owner-confirmed Lean box: at least 6 INDIVIDUAL flats/drumettes, not whole unsplit wings.",
            "ESTIMATED raw bone-in planning mass 400.0 g from the old400 g / about 6-piece pilot. No measured piece weight or cooked/edible yield.",
            "The old pilot's oil, dry seasoning and 45 g finishing sauce scale with that provisional raw-mass estimate. Count/weigh actual wings and confirm coverage before locking production quantities.",
            "Count usable individual split pieces as a separate purchase/pack floor. The normal 5% raw-mass shopping reserve does not replace the required piece count.",
            "Pack ONE separate 40 g NET bottled-ranch planning cup and ONE separate 20 g clean mango-habanero dip per box. Product ingredients, allergens, package cost and exact filled recovery remain unverified.",
            "No rice, starch or vegetable side is included. Keep bones accounted for; bone-in packed mass is not edible meat.",
            "Cook uncrowded air-fryer batches to 165 F in thick meat away from bone. Keep clean finishing sauce separate from raw poultry; ranch stays cold.",
            "Record raw count/mass, cooked count/mass, sauce used, final net weight and container fit. Cool protected in shallow pans and keep at 41 F or below.",
            "Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
          ],
          "portionControl": {
            "wingPiecesPerMeal": 6,
            "pieceCountBasis": "individual split flats/drumettes",
            "minimumPieces": 6,
            "rawMassPlanningGrams": 400.0,
            "rawWeightVerified": false,
            "rawMassBasis": "Old pilot400 g / about 6 pieces; count and weigh actual purchased wings.",
            "cookedYieldVerified": false,
            "edibleMeatYieldVerified": false,
            "ranchCupsPerMeal": 1,
            "ranchCupGrams": 40.0,
            "mangoDipCupsPerMeal": 1,
            "mangoDipGrams": 20.0,
            "ranchFillPlanningOnly": true,
            "ranchProductVerified": false,
            "extraStarchOrVegetableSide": false
          },
          "labelsEnabled": false,
          "nutritionComplete": false,
          "finalLabelReady": false,
          "nutritionReleaseHold": "Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_wings_raw",
              "sourceKey": "chicken_wings_raw",
              "name": "Split chicken wings, raw bone-in (estimated mass; count pieces)",
              "amount": 533.3333,
              "unit": "g",
              "station": "Poultry",
              "note": "component:wings-seasoning; ESTIMATED mass from old400 g / about 6-piece pilot; count and weigh actual lot.",
              "confidence": "planning-unmeasured",
              "allocations": {
                "wings-seasoning": 533.3333
              },
              "measure": {
                "type": "meat",
                "weightEstimated": true,
                "pieceName": "individual split flats/drumettes"
              },
              "minimumPieces": 8,
              "pieceCountBasis": "individual split flats/drumettes",
              "estimatedWeight": true
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 6.6667,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 6.6667
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
              "amount": 2.6667,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "high",
              "allocations": {
                "wings-seasoning": 2.6667
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            },
            {
              "key": "paprika",
              "sourceKey": "paprika",
              "name": "Paprika",
              "amount": 2.6667,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "high",
              "allocations": {
                "wings-seasoning": 2.6667
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.3333,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 1.3333
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
              "amount": 1.3333,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 1.3333
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.4
              }
            },
            {
              "key": "mango_habanero_sauce",
              "sourceKey": "mango_habanero_sauce",
              "name": "Purchased mango-habanero wing sauce (exact bottle panel pending)",
              "amount": 80.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:wings-finish; component:wings-extra-dip",
              "confidence": "planning-unmeasured",
              "allocations": {
                "wings-finish": 60.0,
                "wings-extra-dip": 20.0
              }
            },
            {
              "key": "bottled_ranch",
              "sourceKey": "bottled_ranch",
              "name": "Purchased bottled ranch (40 g net planning cup; exact product pending)",
              "amount": 40.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:bottled-ranch",
              "confidence": "planning-unmeasured",
              "allocations": {
                "bottled-ranch": 40.0
              }
            }
          ],
          "confidence": "planning-unmeasured",
          "assumptions": [
            "Owner-confirmed Bulk box: at least 8 INDIVIDUAL flats/drumettes, not whole unsplit wings.",
            "ESTIMATED raw bone-in planning mass 533.3 g from the old400 g / about 6-piece pilot. No measured piece weight or cooked/edible yield.",
            "The old pilot's oil, dry seasoning and 45 g finishing sauce scale with that provisional raw-mass estimate. Count/weigh actual wings and confirm coverage before locking production quantities.",
            "Count usable individual split pieces as a separate purchase/pack floor. The normal 5% raw-mass shopping reserve does not replace the required piece count.",
            "Pack ONE separate 40 g NET bottled-ranch planning cup and ONE separate 20 g clean mango-habanero dip per box. Product ingredients, allergens, package cost and exact filled recovery remain unverified.",
            "No rice, starch or vegetable side is included. Keep bones accounted for; bone-in packed mass is not edible meat.",
            "Cook uncrowded air-fryer batches to 165 F in thick meat away from bone. Keep clean finishing sauce separate from raw poultry; ranch stays cold.",
            "Record raw count/mass, cooked count/mass, sauce used, final net weight and container fit. Cool protected in shallow pans and keep at 41 F or below.",
            "Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
          ],
          "portionControl": {
            "wingPiecesPerMeal": 8,
            "pieceCountBasis": "individual split flats/drumettes",
            "minimumPieces": 8,
            "rawMassPlanningGrams": 533.3333333333334,
            "rawWeightVerified": false,
            "rawMassBasis": "Old pilot400 g / about 6 pieces; count and weigh actual purchased wings.",
            "cookedYieldVerified": false,
            "edibleMeatYieldVerified": false,
            "ranchCupsPerMeal": 1,
            "ranchCupGrams": 40.0,
            "mangoDipCupsPerMeal": 1,
            "mangoDipGrams": 20.0,
            "ranchFillPlanningOnly": true,
            "ranchProductVerified": false,
            "extraStarchOrVegetableSide": false
          },
          "labelsEnabled": false,
          "nutritionComplete": false,
          "finalLabelReady": false,
          "nutritionReleaseHold": "Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
        }
      },
      "plannerOnly": false,
      "labelsEnabled": false,
      "nutritionComplete": false,
      "finalLabelReady": false,
      "nutritionReleaseHold": "Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released.",
      "service": {
        "sideCupComponents": [
          {
            "name": "Purchased bottled ranch",
            "batchGroup": "bottled-ranch",
            "componentRef": "bottled-ranch",
            "cupsPerMeal": 1,
            "gramsPerMeal": 40.0,
            "weightBasis": "finished",
            "planningOnly": true,
            "productPanelVerified": false
          },
          {
            "name": "Mango habanero dip",
            "batchGroup": "wings-extra-dip",
            "componentRef": "wings-extra-dip",
            "cupsPerMeal": 1,
            "gramsPerMeal": 20.0,
            "weightBasis": "finished",
            "planningOnly": true,
            "productPanelVerified": false
          }
        ]
      },
      "qualityChecks": "Pack six individual split flats/drumettes for Lean and eight for Bulk, plus one separate 40 g NET bottled-ranch planning cup and a separate 20 g clean mango-habanero dip per box. No rice or vegetable side. Raw masses and scaled seasoning/glaze are old-pilot planning estimates, not measured piece weights or yields. Count/weigh the supplier lot, verify both sauce panels and stock, record raw/cooked output and fit, and measure 165 F away from bone. Keep ranch cold and separate. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
    },
    "m7": {
      "name": "Braised Beef Short Rib",
      "category": "Premium meal",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
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
              "name": "Green beans, raw",
              "amount": 100.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-green-beans",
              "confidence": "high",
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
              "name": "Green beans, raw",
              "amount": 133.3333,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:short-rib-green-beans",
              "confidence": "high",
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
    "a1": {
      "name": "Oven-Baked Popcorn Chicken",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
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
    "a2": {
      "name": "Chicken Tikka Snack Wrap",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
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
    "a3": {
      "name": "Mediterranean Chicken Hummus Box",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "single": {
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
              "key": "hummus",
              "sourceKey": "hummus",
              "name": "Prepared hummus",
              "amount": 60,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "shawarma_bread",
              "sourceKey": "shawarma_bread",
              "name": "Shawarma bread",
              "amount": 0.5,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "cucumber",
              "sourceKey": "cucumber",
              "name": "Cucumber with peel, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "feta",
              "sourceKey": "feta",
              "name": "Feta cheese",
              "amount": 14,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "olives",
              "sourceKey": "olives",
              "name": "Black olives, drained",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 10,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 5,
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
          "confidence": "medium",
          "assumptions": [
            "One chilled Grab & Go box with cooked chicken, hummus, half a flatbread, vegetables, feta, and olives.",
            "Record the 12 oz box fit and 72-hour cold hold before final labels.",
            "October 22 owner correction: season the shared chicken base at 0.5% salt by raw chicken weight. Do not add a second salt dose after the Hummus Box pull is divided."
          ]
        }
      },
      "plannerOnly": false
    },
    "dr1": {
      "name": "Strawberry Protein Shake",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 19 controlled planning recipe",
      "recommendation": "Owner locked180g milk/30g FAGE with other base ingredients unchanged plus30g strawberry chunks.407g input;330g working bottle serving is proportional, not whole-batch nutrition. Prior330g fill/345g recovery were the200g-milk trial, not measured recovery for this update. Contains milk.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "shake_fairlife_fatfree",
              "sourceKey": "shake_fairlife_fatfree",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 145.9459,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "gainful_everyday_whey_unflavored",
              "sourceKey": "gainful_everyday_whey_unflavored",
              "name": "Gainful Everyday Whey, unflavored",
              "amount": 16.2162,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "shake_fage_0",
              "sourceKey": "shake_fage_0",
              "name": "FAGE Total0% plain Greek yogurt",
              "amount": 24.3243,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "strawberry",
              "sourceKey": "strawberry",
              "name": "Strawberries, raw",
              "amount": 89.1892,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "banana",
              "sourceKey": "banana",
              "name": "Banana, raw",
              "amount": 40.5405,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 12.973,
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
              "key": "vanilla",
              "sourceKey": "vanilla",
              "name": "Vanilla extract",
              "amount": 0.8108,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 0.88
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Owner explicitly locked180g milk/30g FAGE onNovember2; other base ingredients unchanged,30g chunks added after blending.",
            "Full input407g;330g is a proportional serving, not the entire recipe assigned to one bottle.",
            "Assume mixed composition and nonselective product loss for this recipe estimate; some chunks/foam actually remained in the pilot.",
            "Prior200g-milk trial recovered345g including chunks and filled330g. Those observations are not a measured yield for the new formula.",
            "No settledmL, new cold-hold result, measured milk density or shelf-life validation is invented."
          ]
        }
      },
      "plannerOnly": false,
      "qualityChecks": "Owner locked180g milk/30g FAGE with other base ingredients unchanged plus30g strawberry chunks.407g input;330g working bottle serving is proportional, not whole-batch nutrition. Prior330g fill/345g recovery were the200g-milk trial, not measured recovery for this update. Contains milk."
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
      "status": "Batch 19 controlled planning recipe",
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
      "status": "Batch 19 controlled planning recipe",
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
      "status": "Batch 19 controlled planning recipe",
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
