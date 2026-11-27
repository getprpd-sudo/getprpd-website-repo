const PRPD_PRODUCTION_DATA = {
  "version": "batch-21-current-v2",
  "batch": 21,
  "notice": "Generated from the effective current order configuration. Missing current recipes stop generation instead of loading an archived batch. Recipe-required side cups come from the current structured service records; weekly promotional sauce rules must be added separately and explicitly. Owner-released production-run quality checks remain visible.",
  "meals": {
    "b1": {
      "name": "Beef Bacon Breakfast Pizza",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
      "name": "French Toast",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.75,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg_white",
              "sourceKey": "egg_white",
              "name": "Liquid egg white",
              "amount": 56.25,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cottage",
              "sourceKey": "cottage",
              "name": "H-E-B fat-free cottage cheese",
              "amount": 56.25,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 30.0,
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
              "key": "whey_vanilla",
              "sourceKey": "whey_vanilla",
              "name": "Premier Protein powder, vanilla",
              "amount": 6.525,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "brown_sugar",
              "sourceKey": "brown_sugar",
              "name": "Brown sugar",
              "amount": 9.0,
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
              "key": "vanilla",
              "sourceKey": "vanilla",
              "name": "Vanilla extract",
              "amount": 1.875,
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
              "amount": 0.975,
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
              "key": "bread_slice",
              "sourceKey": "bread_slice",
              "name": "French toast bread",
              "amount": 3,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "strawberry",
              "sourceKey": "strawberry",
              "name": "Strawberries, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "banana",
              "sourceKey": "banana",
              "name": "Banana, raw",
              "amount": 40,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "whipped_cream",
              "sourceKey": "whipped_cream",
              "name": "Sugar-free whipped cream",
              "amount": 10,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "maple_syrup",
              "sourceKey": "maple_syrup",
              "name": "Great Value reduced-calorie sugar-free syrup",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "one 30g side cup",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.3
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Lean receives 3 slices and its controlled share of the protein custard.",
            "Fruit, whipped cream, and one 30g sugar-free maple syrup cup are included in nutrition and packing.",
            "Cook on a clean nonstick surface with no added oil."
          ]
        },
        "bulk": {
          "ingredients": [
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
              "amount": 75,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cottage",
              "sourceKey": "cottage",
              "name": "H-E-B fat-free cottage cheese",
              "amount": 75,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 40,
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
              "key": "whey_vanilla",
              "sourceKey": "whey_vanilla",
              "name": "Premier Protein powder, vanilla",
              "amount": 8.7,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "brown_sugar",
              "sourceKey": "brown_sugar",
              "name": "Brown sugar",
              "amount": 12,
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
              "amount": 1.3,
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
              "key": "bread_slice",
              "sourceKey": "bread_slice",
              "name": "French toast bread",
              "amount": 4,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "strawberry",
              "sourceKey": "strawberry",
              "name": "Strawberries, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "banana",
              "sourceKey": "banana",
              "name": "Banana, raw",
              "amount": 40,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "whipped_cream",
              "sourceKey": "whipped_cream",
              "name": "Sugar-free whipped cream",
              "amount": 10,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "maple_syrup",
              "sourceKey": "maple_syrup",
              "name": "Great Value reduced-calorie sugar-free syrup",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "one 30g side cup",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.3
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Bulk receives 4 slices and its controlled share of the protein custard.",
            "Fruit, whipped cream, and one 30g sugar-free maple syrup cup are included in nutrition and packing.",
            "Cook on a clean nonstick surface with no added oil."
          ]
        }
      },
      "plannerOnly": false,
      "service": {
        "sideCupComponents": [
          {
            "name": "Sugar-free maple syrup",
            "batchGroup": "maple-syrup",
            "cupsPerMeal": 1,
            "gramsPerMeal": 30
          }
        ]
      }
    },
    "b3": {
      "name": "Grilled Cheese Breakfast Burrito",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
    "m1": {
      "name": "Chicken Biryani",
      "category": "Main",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 40,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 50.5479,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:green-garlic",
              "confidence": "high",
              "allocations": {
                "green-garlic": 20.5479
              }
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
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
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 9.2329,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:green-garlic",
              "confidence": "high",
              "allocations": {
                "green-garlic": 1.2329
              }
            },
            {
              "key": "ginger",
              "sourceKey": "ginger",
              "name": "Ginger root, raw",
              "amount": 5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 18.0822,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:green-garlic",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              },
              "allocations": {
                "green-garlic": 3.0822
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
              "key": "shan_biryani",
              "sourceKey": "shan_biryani",
              "name": "Shan Biryani Recipe Mix (standard powder)",
              "amount": 10.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 3.0822,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:green-garlic",
              "confidence": "high",
              "allocations": {
                "green-garlic": 3.0822
              }
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 2.0548,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:green-garlic",
              "confidence": "high",
              "allocations": {
                "green-garlic": 2.0548
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Owner confirmed Shan standard Biryani powder. Manufacturer reference: one 50g packet per 1kg meat. PRPD adapts that dose to boneless thighs and its existing lower-rice portions, not the full packet recipe.",
            "Weigh 10g mix for Lean / 15g Bulk. No separate added salt; the mix already contains salt. Check the actual purchased packet variant and nutrition panel.",
            "All 30g yogurt per meal and all masala enter the cooking pot and nutrition calculation. Do not scrape off or assume an unmeasured 75% marinade loss.",
            "The discontinued cucumber salad is excluded from production and nutrition.",
            "Serve 30g green jalapeno garlic sauce with mayonnaise cold, separately from the cooked marinade. Its full nutrition is included.",
            "Use FAGE Total 0% Greek yogurt in both the chicken marinade and the separate 30g green garlic sauce. Keep the two components identified and test the finished flavor before release."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 300.0,
              "unit": "g",
              "station": "Poultry",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 40,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 50.5479,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:green-garlic",
              "confidence": "high",
              "allocations": {
                "green-garlic": 20.5479
              }
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
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
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 9.2329,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:green-garlic",
              "confidence": "high",
              "allocations": {
                "green-garlic": 1.2329
              }
            },
            {
              "key": "ginger",
              "sourceKey": "ginger",
              "name": "Ginger root, raw",
              "amount": 5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 18.0822,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:green-garlic",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 1.03
              },
              "allocations": {
                "green-garlic": 3.0822
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
              "key": "shan_biryani",
              "sourceKey": "shan_biryani",
              "name": "Shan Biryani Recipe Mix (standard powder)",
              "amount": 15.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 3.0822,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:green-garlic",
              "confidence": "high",
              "allocations": {
                "green-garlic": 3.0822
              }
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 2.0548,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "component:green-garlic",
              "confidence": "high",
              "allocations": {
                "green-garlic": 2.0548
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Owner confirmed Shan standard Biryani powder. Manufacturer reference: one 50g packet per 1kg meat. PRPD adapts that dose to boneless thighs and its existing lower-rice portions, not the full packet recipe.",
            "Weigh 10g mix for Lean / 15g Bulk. No separate added salt; the mix already contains salt. Check the actual purchased packet variant and nutrition panel.",
            "All 30g yogurt per meal and all masala enter the cooking pot and nutrition calculation. Do not scrape off or assume an unmeasured 75% marinade loss.",
            "The discontinued cucumber salad is excluded from production and nutrition.",
            "Serve 30g green jalapeno garlic sauce with mayonnaise cold, separately from the cooked marinade. Its full nutrition is included.",
            "Use FAGE Total 0% Greek yogurt in both the chicken marinade and the separate 30g green garlic sauce. Keep the two components identified and test the finished flavor before release."
          ]
        }
      },
      "plannerOnly": false,
      "service": {
        "sideCupComponents": [
          {
            "name": "PRPD Green Garlic Sauce",
            "batchGroup": "green-garlic",
            "componentRef": "green-garlic",
            "cupsPerMeal": 1,
            "gramsPerMeal": 30
          }
        ]
      },
      "productionHold": "Verify the purchased FAGE Greek yogurt and Shan packet, then test the chicken marinade and separate green sauce before final label release."
    },
    "m2": {
      "name": "Butter Chicken",
      "category": "Main",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 40,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 160,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 15,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "chicken marinade only",
              "confidence": "high"
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 8,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "tomato sauce finish",
              "confidence": "high"
            },
            {
              "key": "heavy_cream",
              "sourceKey": "heavy_cream",
              "name": "Great Value Heavy Whipping Cream",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "stir in off heat",
              "confidence": "planning"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "chicken sear",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 4,
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
              "amount": 3,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "ginger",
              "sourceKey": "ginger",
              "name": "Ginger root, raw",
              "amount": 2.5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "shan_butter_chicken",
              "sourceKey": "shan_butter_chicken",
              "name": "Shan Butter Chicken Recipe Mix (powder)",
              "amount": 10.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "packet",
                "gramsPerPacket": 50.0
              }
            }
          ],
          "confidence": "planning",
          "assumptions": [
            "Batch 21 Shan-inspired butter chicken: yogurt is limited to the chicken marinade; the cooked tomato sauce is finished with measured unsalted butter and heavy cream.",
            "Use 50g Shan Butter Chicken powder per kg raw chicken, following the manufacturer's packet ratio. Do not add the former onion, tomato paste, extra dry spices, extra salt, broth or recipe water.",
            "Marinate chicken with Shan mix, 15g/20g yogurt, lemon, garlic and ginger. Sear in the measured oil; simmer with crushed tomatoes to 165F. Melt butter into the reduced tomato sauce, then stir cream in off heat.",
            "Weigh sauce and chicken after cooking and check 24-hour reheat before approving net weights and labels. The manufacturer uses much more butter; PRPD intentionally measures a smaller portion for macro control."
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
              "key": "rice_dry",
              "sourceKey": "rice_dry",
              "name": "PRPD basmati/white rice, dry",
              "amount": 55,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 200,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "chicken marinade only",
              "confidence": "high"
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 10,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "tomato sauce finish",
              "confidence": "high"
            },
            {
              "key": "heavy_cream",
              "sourceKey": "heavy_cream",
              "name": "Great Value Heavy Whipping Cream",
              "amount": 25,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "stir in off heat",
              "confidence": "planning"
            },
            {
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 2.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "chicken sear",
              "confidence": "medium",
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
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
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 4,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "ginger",
              "sourceKey": "ginger",
              "name": "Ginger root, raw",
              "amount": 3.5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "shan_butter_chicken",
              "sourceKey": "shan_butter_chicken",
              "name": "Shan Butter Chicken Recipe Mix (powder)",
              "amount": 12.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium",
              "measure": {
                "type": "packet",
                "gramsPerPacket": 50.0
              }
            }
          ],
          "confidence": "planning",
          "assumptions": [
            "Batch 21 Shan-inspired butter chicken: yogurt is limited to the chicken marinade; the cooked tomato sauce is finished with measured unsalted butter and heavy cream.",
            "Use 50g Shan Butter Chicken powder per kg raw chicken, following the manufacturer's packet ratio. Do not add the former onion, tomato paste, extra dry spices, extra salt, broth or recipe water.",
            "Marinate chicken with Shan mix, 15g/20g yogurt, lemon, garlic and ginger. Sear in the measured oil; simmer with crushed tomatoes to 165F. Melt butter into the reduced tomato sauce, then stir cream in off heat.",
            "Weigh sauce and chicken after cooking and check 24-hour reheat before approving net weights and labels. The manufacturer uses much more butter; PRPD intentionally measures a smaller portion for macro control."
          ]
        }
      },
      "plannerOnly": false,
      "productionHold": "New butter-and-cream sauce is a measured planning recipe. Verify the purchased cream, Shan mix and butter panels, then taste-test and record cooked chicken, sauce and rice yields before final label release."
    },
    "m3": {
      "name": "Loaded Buffalo Chicken Potato",
      "category": "Main",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
              "key": "potato",
              "sourceKey": "potato",
              "name": "Potato, flesh and skin, raw",
              "amount": 200,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "broccoli",
              "sourceKey": "broccoli",
              "name": "Broccoli, raw",
              "amount": 75.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "franks_buffalo_wings",
              "sourceKey": "franks_buffalo_wings",
              "name": "Frank's RedHot Buffalo Wings Sauce",
              "amount": 15,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:reduced-sodium-buffalo-finish",
              "confidence": "planning",
              "allocations": {
                "reduced-sodium-buffalo-finish": 15
              }
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
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 10,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:reduced-sodium-buffalo-finish",
              "confidence": "high",
              "allocations": {
                "reduced-sodium-buffalo-finish": 10
              }
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 3,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:reduced-sodium-buffalo-finish",
              "confidence": "medium",
              "allocations": {
                "reduced-sodium-buffalo-finish": 3
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 2.375,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:reduced-sodium-buffalo-finish; component:potato-roast",
              "confidence": "medium",
              "allocations": {
                "reduced-sodium-buffalo-finish": 1,
                "potato-roast": 1.375
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
              "amount": 2.375,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:reduced-sodium-buffalo-finish; component:potato-roast",
              "confidence": "high",
              "allocations": {
                "reduced-sodium-buffalo-finish": 1,
                "potato-roast": 1.375
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
              "amount": 0.46,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:potato-roast",
              "confidence": "high",
              "allocations": {
                "potato-roast": 0.46
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "planning",
          "assumptions": [
            "October 22 owner correction: allocate 200g raw chicken before cooking; record the actual cooked yield.",
            "The potato allocation is reduced from 300g to 200g per meal after the Batch 6 overproduction report.",
            "Potato is a translated starch and retains its recipe-specific input until its cooked yield is measured.",
            "Use a 30g Lean / 40g Bulk incorporated finish made with 15g/20g Buffalo sauce, water, apple-cider vinegar, garlic and paprika. Add no salt to the chicken or Buffalo finish.",
            "October 22 owner correction: season the complete shared potato-and-broccoli roast with the measured salt, garlic powder, and paprika before dividing it between Egg Bites and Loaded Buffalo.",
            "For every Batch 21 Buffalo Chicken Potato, use the purchased Frank's Buffalo Wings Sauce in the same measured incorporated finish. No dairy sauce is added."
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
              "key": "potato",
              "sourceKey": "potato",
              "name": "Potato, flesh and skin, raw",
              "amount": 200,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "broccoli",
              "sourceKey": "broccoli",
              "name": "Broccoli, raw",
              "amount": 100.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "franks_buffalo_wings",
              "sourceKey": "franks_buffalo_wings",
              "name": "Frank's RedHot Buffalo Wings Sauce",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:reduced-sodium-buffalo-finish",
              "confidence": "planning",
              "allocations": {
                "reduced-sodium-buffalo-finish": 20
              }
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
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 14,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:reduced-sodium-buffalo-finish",
              "confidence": "high",
              "allocations": {
                "reduced-sodium-buffalo-finish": 14
              }
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 4,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:reduced-sodium-buffalo-finish",
              "confidence": "medium",
              "allocations": {
                "reduced-sodium-buffalo-finish": 4
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 2.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:reduced-sodium-buffalo-finish; component:potato-roast",
              "confidence": "medium",
              "allocations": {
                "reduced-sodium-buffalo-finish": 1,
                "potato-roast": 1.5
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
              "amount": 2.5,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:reduced-sodium-buffalo-finish; component:potato-roast",
              "confidence": "high",
              "allocations": {
                "reduced-sodium-buffalo-finish": 1,
                "potato-roast": 1.5
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
              "note": "component:potato-roast",
              "confidence": "high",
              "allocations": {
                "potato-roast": 0.5
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
            }
          ],
          "confidence": "planning",
          "assumptions": [
            "October 22 owner correction: allocate 250g raw chicken before cooking; record the actual cooked yield.",
            "The potato allocation is reduced from 300g to 200g per meal after the Batch 6 overproduction report.",
            "Potato is a translated starch and retains its recipe-specific input until its cooked yield is measured.",
            "Use a 30g Lean / 40g Bulk incorporated finish made with 15g/20g Buffalo sauce, water, apple-cider vinegar, garlic and paprika. Add no salt to the chicken or Buffalo finish.",
            "October 22 owner correction: season the complete shared potato-and-broccoli roast with the measured salt, garlic powder, and paprika before dividing it between Egg Bites and Loaded Buffalo.",
            "For every Batch 21 Buffalo Chicken Potato, use the purchased Frank's Buffalo Wings Sauce in the same measured incorporated finish. No dairy sauce is added."
          ]
        }
      },
      "plannerOnly": false,
      "productionHold": "Verify the purchased Frank's Buffalo bottle and the revised finished sauce portion before final label release."
    },
    "m4": {
      "name": "Meatball Arrabbiata Pasta",
      "category": "Main",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_baked",
              "name": "Ground beef 90/10, raw",
              "amount": 165.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 72% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "kroger_protein_pasta",
              "sourceKey": "kroger_protein_pasta",
              "name": "Kroger protein pasta",
              "amount": 65,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 150,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 18,
              "unit": "g",
              "station": "Cold Prep & Produce",
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
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.4125,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "breadcrumbs",
              "sourceKey": "breadcrumbs",
              "name": "Seasoned dry breadcrumbs",
              "amount": 6.1875,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "low"
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
            "One garlic clove is treated as 3g.",
            "Half tablespoon breadcrumbs treated as 3.75g per 100g beef.",
            "No cooking oil is counted; 0.75g/1g Lean/Bulk salt is modeled.",
            "Use the exact Kroger protein pasta identity; do not substitute the historical Barilla spaghetti or Caprese Rotini records."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_baked",
              "name": "Ground beef 90/10, raw",
              "amount": 220.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 72% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "kroger_protein_pasta",
              "sourceKey": "kroger_protein_pasta",
              "name": "Kroger protein pasta",
              "amount": 76,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 150,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 18,
              "unit": "g",
              "station": "Cold Prep & Produce",
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
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.55,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "breadcrumbs",
              "sourceKey": "breadcrumbs",
              "name": "Seasoned dry breadcrumbs",
              "amount": 8.25,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "low"
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
            "One garlic clove is treated as 3g.",
            "Half tablespoon breadcrumbs treated as 3.75g per 100g beef.",
            "No cooking oil is counted; 0.75g/1g Lean/Bulk salt is modeled.",
            "Use the exact Kroger protein pasta identity; do not substitute the historical Barilla spaghetti or Caprese Rotini records."
          ]
        }
      },
      "plannerOnly": false
    },
    "m5": {
      "name": "Lemon Pepper Tilapia with Garlic Potatoes",
      "category": "Main",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "tilapia_raw",
              "sourceKey": "tilapia_cooked",
              "name": "Tilapia fillets, raw",
              "amount": 220.0,
              "unit": "g",
              "station": "Seafood",
              "note": "Raw purchasing/prep quantity; modeled 80% cooked yield.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "potato",
              "sourceKey": "potato",
              "name": "Potato, flesh and skin, raw",
              "amount": 250,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "high"
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
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 5,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 10,
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
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 1.5,
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
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 5,
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
            "Tilapia is seasoned with a measured 10g Lean/12g Bulk lemon allocation and cracked black pepper; garlic is assigned to the roasted potatoes. It is not marketed as blackened.",
            "Tilapia uses a provisional 80% cooked yield; record the first raw and cooked batch weights.",
            "Garlic potatoes use 5g Lean/6g Bulk garlic plus their controlled oil and salt allocations."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "tilapia_raw",
              "sourceKey": "tilapia_cooked",
              "name": "Tilapia fillets, raw",
              "amount": 300.0,
              "unit": "g",
              "station": "Seafood",
              "note": "Raw purchasing/prep quantity; modeled 80% cooked yield.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "potato",
              "sourceKey": "potato",
              "name": "Potato, flesh and skin, raw",
              "amount": 320,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "high"
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
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 12,
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
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 2,
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
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 7,
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
            "Tilapia is seasoned with a measured 10g Lean/12g Bulk lemon allocation and cracked black pepper; garlic is assigned to the roasted potatoes. It is not marketed as blackened.",
            "Tilapia uses a provisional 80% cooked yield; record the first raw and cooked batch weights.",
            "Garlic potatoes use 5g Lean/6g Bulk garlic plus their controlled oil and salt allocations."
          ]
        }
      },
      "plannerOnly": false
    },
    "m6": {
      "name": "Mexican Streetcorn Chicken Bowl",
      "category": "Main",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
              "confidence": "controlled-comparable-profile"
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
              "confidence": "controlled-comparable-profile"
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
    "m7": {
      "name": "Premium NY Strip Steak",
      "category": "Premium meal",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "ny_strip_raw",
              "sourceKey": "ny_strip_cooked",
              "name": "NY strip steak, raw",
              "amount": 240.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "instant_potato_flakes",
              "sourceKey": "instant_potato_flakes",
              "name": "Idahoan Original mashed potato flakes",
              "amount": 29.0396,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "200g prepared Idahoan Original mash allocation",
              "confidence": "high"
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 105.9684,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "Idahoan Original package preparation",
              "confidence": "high"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 54.578,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "Idahoan Original package preparation",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 9.4061,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "Idahoan Original package preparation",
              "confidence": "high"
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.9578,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Idahoan Original package preparation; component:honey-barbecue-mustard",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              },
              "allocations": {
                "honey-barbecue-mustard": 0.2
              }
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
              "key": "mustard",
              "sourceKey": "mustard",
              "name": "Prepared Dijon mustard",
              "amount": 18.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:honey-barbecue-mustard",
              "confidence": "medium",
              "allocations": {
                "honey-barbecue-mustard": 18.0
              },
              "measure": {
                "type": "liquid",
                "density": 1.04
              }
            },
            {
              "key": "bbq_sauce",
              "sourceKey": "bbq_sauce",
              "name": "G Hughes sugar-free BBQ sauce",
              "amount": 15.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:honey-barbecue-mustard",
              "confidence": "high",
              "allocations": {
                "honey-barbecue-mustard": 15.0
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 8.0,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:honey-barbecue-mustard",
              "confidence": "high",
              "allocations": {
                "honey-barbecue-mustard": 8.0
              },
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 3.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:honey-barbecue-mustard",
              "confidence": "medium",
              "allocations": {
                "honey-barbecue-mustard": 3.0
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:honey-barbecue-mustard",
              "confidence": "medium",
              "allocations": {
                "honey-barbecue-mustard": 0.3
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "smoked_paprika",
              "sourceKey": "smoked_paprika",
              "name": "Smoked paprika",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:honey-barbecue-mustard",
              "confidence": "medium",
              "allocations": {
                "honey-barbecue-mustard": 0.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:honey-barbecue-mustard",
              "confidence": "high",
              "allocations": {
                "honey-barbecue-mustard": 0.2
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Lean uses 240g raw steak; Bulk uses 300g.",
            "Dry-sear the steak on a properly preheated surface; no added oil is included.",
            "The 200g mashed-potato side uses Idahoan Original unflavored mashed potato flakes prepared to the controlled package ratio; broccoli is the green vegetable. Do not use fresh potatoes.",
            "Pack one separate 45g PRPD Honey Barbecue Mustard cup."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "ny_strip_raw",
              "sourceKey": "ny_strip_cooked",
              "name": "NY strip steak, raw",
              "amount": 300.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 75% cooked yield.",
              "confidence": "medium",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "instant_potato_flakes",
              "sourceKey": "instant_potato_flakes",
              "name": "Idahoan Original mashed potato flakes",
              "amount": 29.0396,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "200g prepared Idahoan Original mash allocation",
              "confidence": "high"
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 105.9684,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "Idahoan Original package preparation",
              "confidence": "high"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 54.578,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "Idahoan Original package preparation",
              "confidence": "high",
              "measure": {
                "type": "liquid",
                "density": 1.03
              }
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 9.4061,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "Idahoan Original package preparation",
              "confidence": "high"
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 2.2078,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "Idahoan Original package preparation; component:honey-barbecue-mustard",
              "confidence": "high",
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              },
              "allocations": {
                "honey-barbecue-mustard": 0.2
              }
            },
            {
              "key": "broccoli",
              "sourceKey": "broccoli",
              "name": "Broccoli, raw",
              "amount": 125,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 8,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "mustard",
              "sourceKey": "mustard",
              "name": "Prepared Dijon mustard",
              "amount": 18.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:honey-barbecue-mustard",
              "confidence": "medium",
              "allocations": {
                "honey-barbecue-mustard": 18.0
              },
              "measure": {
                "type": "liquid",
                "density": 1.04
              }
            },
            {
              "key": "bbq_sauce",
              "sourceKey": "bbq_sauce",
              "name": "G Hughes sugar-free BBQ sauce",
              "amount": 15.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:honey-barbecue-mustard",
              "confidence": "high",
              "allocations": {
                "honey-barbecue-mustard": 15.0
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 8.0,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "component:honey-barbecue-mustard",
              "confidence": "high",
              "allocations": {
                "honey-barbecue-mustard": 8.0
              },
              "measure": {
                "type": "liquid",
                "density": 1.42
              }
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 3.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:honey-barbecue-mustard",
              "confidence": "medium",
              "allocations": {
                "honey-barbecue-mustard": 3.0
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:honey-barbecue-mustard",
              "confidence": "medium",
              "allocations": {
                "honey-barbecue-mustard": 0.3
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 3.1
              }
            },
            {
              "key": "smoked_paprika",
              "sourceKey": "smoked_paprika",
              "name": "Smoked paprika",
              "amount": 0.3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:honey-barbecue-mustard",
              "confidence": "medium",
              "allocations": {
                "honey-barbecue-mustard": 0.3
              }
            },
            {
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.2,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:honey-barbecue-mustard",
              "confidence": "high",
              "allocations": {
                "honey-barbecue-mustard": 0.2
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 2.3
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Lean uses 240g raw steak; Bulk uses 300g.",
            "Dry-sear the steak on a properly preheated surface; no added oil is included.",
            "The 200g mashed-potato side uses Idahoan Original unflavored mashed potato flakes prepared to the controlled package ratio; broccoli is the green vegetable. Do not use fresh potatoes.",
            "Pack one separate 45g PRPD Honey Barbecue Mustard cup."
          ]
        }
      },
      "plannerOnly": false,
      "service": {
        "sideCupComponents": [
          {
            "name": "PRPD Honey Barbecue Mustard",
            "batchGroup": "honey-barbecue-mustard",
            "componentRef": "honey-barbecue-mustard",
            "cupsPerMeal": 1,
            "gramsPerMeal": 45
          }
        ]
      }
    },
    "d1": {
      "name": "Chocolate Chip Cookie Drop",
      "category": "Dessert",
      "aliases": [
        "Classic Chocolate Chip Cookie"
      ],
      "status": "Batch 21 controlled planning recipe",
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
      "plannerOnly": false,
      "productionHold": "Verify the purchased semisweet chocolate chip ingredient and allergen panel, then weigh the cooled baked cookie before final label release."
    },
    "a1": {
      "name": "Buffalo Chicken Pinwheels",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
              "key": "regular_cream_cheese",
              "sourceKey": "regular_cream_cheese",
              "name": "Philadelphia Original cream cheese",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 14,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "franks_buffalo_wings",
              "sourceKey": "franks_buffalo_wings",
              "name": "Frank's RedHot Buffalo Wings Sauce",
              "amount": 5,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "planning"
            },
            {
              "key": "apple_cider_vinegar",
              "sourceKey": "apple_cider_vinegar",
              "name": "Apple cider vinegar",
              "amount": 2,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "water",
              "sourceKey": "water",
              "name": "Water",
              "amount": 3,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lettuce",
              "sourceKey": "lettuce",
              "name": "Green leaf lettuce, raw",
              "amount": 20,
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
          "confidence": "planning",
          "assumptions": [
            "One chilled Grab & Go order uses one 70-calorie Mission Carb Balance medium flour tortilla, rolled tightly and sliced into four pinwheel pieces.",
            "Cool chicken fully before assembly; record pinwheel count, 12 oz box fit, and 72-hour hold quality.",
            "Use Sweet Baby Ray's Mild Buffalo Wing Sauce. Add no chicken salt and use a 10g incorporated finish made from 5g sauce, 2g apple-cider vinegar and 3g water.",
            "Use the same Frank's Buffalo Wings Sauce as the potato. Pinwheels still contain milk from cream cheese and mozzarella."
          ]
        }
      },
      "plannerOnly": false,
      "productionHold": "Verify the purchased Frank's Buffalo bottle and the pinwheel's dairy-containing cheese and cream-cheese panels before final label release."
    },
    "a2": {
      "name": "Oven-Baked Popcorn Chicken",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
      "status": "Batch 21 controlled planning recipe",
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
      "plannerOnly": false,
      "productionHold": "Verify the purchased Deep Alphonso pulp, FAGE yogurt and Fairlife milk ingredient and allergen panels, and the actual 330 g bottle fill before final label release."
    },
    "a3": {
      "name": "Mediterranean Chicken Hummus Box",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
      "status": "Batch 21 controlled planning recipe",
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
      "productionHold": "Verify the purchased Shan Seekh mix, mayonnaise, ketchup and sriracha ingredient and allergen panels, then confirm the complete packed serving weight before final label release.",
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
      "status": "Batch 21 controlled planning recipe",
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
      "status": "Batch 21 controlled planning recipe",
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
    "p4": {
      "name": "Private Dairy-Free Breakfast Pizza",
      "category": "Internal custom meal",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
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
              "key": "daiya_mozzarella",
              "sourceKey": "daiya_mozzarella",
              "name": "Daiya Dairy-Free Mozzarella Shreds",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "planning"
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
          "confidence": "planning",
          "assumptions": [
            "Shape one 100 g raw dough rectangle for this Lean meal; no cut after baking.",
            "The full 235 g dough batch makes one 100 g Lean and one 125 g Bulk rectangle; the unserved 10 g is included in purchasing but excluded from served nutrition.",
            "The one-medium-egg plus 175 g whites pair is a planning basis. Lean uses an estimated 45% of the egg and 80 g whites; Bulk 55% and 95 g. Record actual cooked egg allocations on Cook Day.",
            "Use only H-E-B fat-free mozzarella: 30 g Lean or 58 g Bulk. Use 50 g or 60 g Sharifa bacon by raw package weight, cook it before topping, then add crisp bits after baking.",
            "Each pizza gets 30 g peppers/onion and 15 g finished house tomato sauce. Sauce input and olive-oil yield remain estimates; record the finished sauce batch and actual portion weight.",
            "Bake on a preheated 425 F stone on the second-lowest rack. The owner's ground-beef placeholder trial finished in 9\u201310 minutes; customer production uses Sharifa bacon.",
            "Barry-only pizza: substitute Daiya dairy-free mozzarella gram for gram. This lowers protein versus milk mozzarella. Bake separately and verify egg set, melt, fit and reheat. The standard Breakfast Pizza keeps dairy mozzarella."
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
              "key": "daiya_mozzarella",
              "sourceKey": "daiya_mozzarella",
              "name": "Daiya Dairy-Free Mozzarella Shreds",
              "amount": 58,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "planning"
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
          "confidence": "planning",
          "assumptions": [
            "Shape one 125 g raw dough rectangle for this Bulk meal; no cut after baking.",
            "The full 235 g dough batch makes one 100 g Lean and one 125 g Bulk rectangle; the unserved 10 g is included in purchasing but excluded from served nutrition.",
            "The one-medium-egg plus 175 g whites pair is a planning basis. Lean uses an estimated 45% of the egg and 80 g whites; Bulk 55% and 95 g. Record actual cooked egg allocations on Cook Day.",
            "Use only H-E-B fat-free mozzarella: 30 g Lean or 58 g Bulk. Use 50 g or 60 g Sharifa bacon by raw package weight, cook it before topping, then add crisp bits after baking.",
            "Each pizza gets 30 g peppers/onion and 15 g finished house tomato sauce. Sauce input and olive-oil yield remain estimates; record the finished sauce batch and actual portion weight.",
            "Bake on a preheated 425 F stone on the second-lowest rack. The owner's ground-beef placeholder trial finished in 9\u201310 minutes; customer production uses Sharifa bacon.",
            "Barry-only pizza: substitute Daiya dairy-free mozzarella gram for gram. This lowers protein versus milk mozzarella. Bake separately and verify egg set, melt, fit and reheat. The standard Breakfast Pizza keeps dairy mozzarella."
          ]
        }
      },
      "plannerOnly": true,
      "productionHold": "Barry-only planning variant. Dairy-free cheese has less protein than the standard milk mozzarella. Confirm Daiya package, egg set, melt/reheat, container fit, finished weight and dairy-free prep before production or labeling."
    },
    "p5": {
      "name": "Private Dairy-Free Meatball Arrabbiata",
      "category": "Internal custom meal",
      "aliases": [],
      "status": "Batch 21 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_baked",
              "name": "Ground beef 90/10, raw",
              "amount": 165.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 72% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "kroger_protein_pasta",
              "sourceKey": "kroger_protein_pasta",
              "name": "Kroger protein pasta",
              "amount": 65,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 150,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 18,
              "unit": "g",
              "station": "Cold Prep & Produce",
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
              "key": "daiya_mozzarella",
              "sourceKey": "daiya_mozzarella",
              "name": "Daiya Dairy-Free Mozzarella Shreds",
              "amount": 28,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "planning"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.4125,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "breadcrumbs",
              "sourceKey": "breadcrumbs",
              "name": "Seasoned dry breadcrumbs",
              "amount": 6.1875,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "low"
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
          "confidence": "planning",
          "assumptions": [
            "One garlic clove is treated as 3g.",
            "Half tablespoon breadcrumbs treated as 3.75g per 100g beef.",
            "No cooking oil is counted; 0.75g/1g Lean/Bulk salt is modeled.",
            "Use the exact Kroger protein pasta identity; do not substitute the historical Barilla spaghetti or Caprese Rotini records.",
            "Barry-only pasta: substitute Daiya dairy-free mozzarella gram for gram. Check the actual breadcrumb and protein-pasta packages for milk before preparing it."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_baked",
              "name": "Ground beef 90/10, raw",
              "amount": 220.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 72% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "kroger_protein_pasta",
              "sourceKey": "kroger_protein_pasta",
              "name": "Kroger protein pasta",
              "amount": 76,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 150,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 18,
              "unit": "g",
              "station": "Cold Prep & Produce",
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
              "key": "daiya_mozzarella",
              "sourceKey": "daiya_mozzarella",
              "name": "Daiya Dairy-Free Mozzarella Shreds",
              "amount": 28,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "planning"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 0.55,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "breadcrumbs",
              "sourceKey": "breadcrumbs",
              "name": "Seasoned dry breadcrumbs",
              "amount": 8.25,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "low"
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
          "confidence": "planning",
          "assumptions": [
            "One garlic clove is treated as 3g.",
            "Half tablespoon breadcrumbs treated as 3.75g per 100g beef.",
            "No cooking oil is counted; 0.75g/1g Lean/Bulk salt is modeled.",
            "Use the exact Kroger protein pasta identity; do not substitute the historical Barilla spaghetti or Caprese Rotini records.",
            "Barry-only pasta: substitute Daiya dairy-free mozzarella gram for gram. Check the actual breadcrumb and protein-pasta packages for milk before preparing it."
          ]
        }
      },
      "plannerOnly": true,
      "productionHold": "Barry-only planning variant. Confirm Daiya, breadcrumb and pasta packages, finished weight and dairy-free prep before production or labeling."
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
