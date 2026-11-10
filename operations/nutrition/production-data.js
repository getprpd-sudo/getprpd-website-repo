const PRPD_PRODUCTION_DATA = {
  "version": "batch-18-current-v2",
  "batch": 18,
  "notice": "Generated from the effective current order configuration. Missing current recipes stop generation instead of loading an archived batch. Recipe-required side cups come from the current structured service records; weekly promotional sauce rules must be added separately and explicitly. Owner-released production-run quality checks remain visible.",
  "meals": {
    "b1": {
      "name": "French Toast",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
    "b2": {
      "name": "Breakfast Quesadilla",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 120.0,
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
              "amount": 0.81,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.81
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
              "amount": 0.48,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.48
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
              "key": "black_pepper",
              "sourceKey": "black_pepper",
              "name": "Ground black pepper",
              "amount": 0.24,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.24
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
                "gramsPerTsp": 6.0
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
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "The egg component uses the shared breakfast base of one whole egg plus 25g liquid egg whites per order.",
            "Greek yogurt is not used in the egg mixture, and the former salsa side cup is removed.",
            "October 22 owner correction: use two Lean or three Bulk Mission 70-calorie Carb Balance medium flour tortillas. Season the shared chicken base at 0.5% salt by raw chicken weight. Lean uses 42g mozzarella; Bulk uses 56g.",
            "Owner corrected the Bulk raw chicken portion from 200g to 160g on October 21, 2026 because the egg, egg-white, cheese, and three-tortilla build already supplies a substantial finished meal."
          ]
        },
        "bulk": {
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
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "garlic_powder",
              "sourceKey": "garlic_powder",
              "name": "Garlic powder",
              "amount": 1.08,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 1.08
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
              "amount": 0.64,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.64
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
              "amount": 0.48,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.48
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
              "amount": 0.32,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.32
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
              "amount": 0.8,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.8
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
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
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 56,
              "unit": "g",
              "station": "Sauces & Dairy",
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
              "amount": 25,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "The egg component uses the shared breakfast base of one whole egg plus 25g liquid egg whites per order.",
            "Greek yogurt is not used in the egg mixture, and the former salsa side cup is removed.",
            "October 22 owner correction: use two Lean or three Bulk Mission 70-calorie Carb Balance medium flour tortillas. Season the shared chicken base at 0.5% salt by raw chicken weight. Lean uses 42g mozzarella; Bulk uses 56g.",
            "Owner corrected the Bulk raw chicken portion from 200g to 160g on October 21, 2026 because the egg, egg-white, cheese, and three-tortilla build already supplies a substantial finished meal."
          ]
        }
      },
      "plannerOnly": false
    },
    "b3": {
      "name": "Beef Breakfast Skillet",
      "category": "Breakfast",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
    "m1": {
      "name": "Creamy Chicken Parmesan",
      "category": "Main",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
              "key": "protein_pasta",
              "sourceKey": "protein_pasta",
              "name": "Kroger protein pasta",
              "amount": 50,
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
              "key": "parmesan",
              "sourceKey": "parmesan",
              "name": "Parmesan cheese",
              "amount": 14,
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
              "key": "breadcrumbs",
              "sourceKey": "breadcrumbs",
              "name": "Seasoned dry breadcrumbs",
              "amount": 15,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "low"
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
            "Chicken thighs use a measured breadcrumb coating and are cooked to 165 F.",
            "Greek yogurt is folded into the tomato-Parmesan sauce off heat; record finished pasta and sauce yields."
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
              "key": "protein_pasta",
              "sourceKey": "protein_pasta",
              "name": "Kroger protein pasta",
              "amount": 70,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "crushed_tomatoes",
              "sourceKey": "crushed_tomatoes",
              "name": "Canned crushed tomatoes",
              "amount": 180,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 40,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "parmesan",
              "sourceKey": "parmesan",
              "name": "Parmesan cheese",
              "amount": 18,
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
              "key": "breadcrumbs",
              "sourceKey": "breadcrumbs",
              "name": "Seasoned dry breadcrumbs",
              "amount": 20,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "low"
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
            "Chicken thighs use a measured breadcrumb coating and are cooked to 165 F.",
            "Greek yogurt is folded into the tomato-Parmesan sauce off heat; record finished pasta and sauce yields."
          ]
        }
      },
      "plannerOnly": false
    },
    "m2": {
      "name": "Loaded Buffalo Chicken Potato",
      "category": "Main",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
              "key": "buffalo_sauce",
              "sourceKey": "buffalo_sauce",
              "name": "Sweet Baby Ray's Mild Buffalo Wing Sauce",
              "amount": 15,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:reduced-sodium-buffalo-finish",
              "confidence": "medium",
              "allocations": {
                "reduced-sodium-buffalo-finish": 15
              },
              "measure": {
                "type": "liquid",
                "density": 1.05
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
          "confidence": "medium",
          "assumptions": [
            "October 22 owner correction: allocate 200g raw chicken before cooking; record the actual cooked yield.",
            "The potato allocation is reduced from 300g to 200g per meal after the Batch 6 overproduction report.",
            "Potato is a translated starch and retains its recipe-specific input until its cooked yield is measured.",
            "Use a 30g Lean / 40g Bulk incorporated finish made with 15g/20g Buffalo sauce, water, apple-cider vinegar, garlic and paprika. Add no salt to the chicken or Buffalo finish.",
            "October 22 owner correction: season the complete shared potato-and-broccoli roast with the measured salt, garlic powder, and paprika before dividing it between Egg Bites and Loaded Buffalo."
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
              "key": "buffalo_sauce",
              "sourceKey": "buffalo_sauce",
              "name": "Sweet Baby Ray's Mild Buffalo Wing Sauce",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:reduced-sodium-buffalo-finish",
              "confidence": "medium",
              "allocations": {
                "reduced-sodium-buffalo-finish": 20
              },
              "measure": {
                "type": "liquid",
                "density": 1.05
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
          "confidence": "medium",
          "assumptions": [
            "October 22 owner correction: allocate 250g raw chicken before cooking; record the actual cooked yield.",
            "The potato allocation is reduced from 300g to 200g per meal after the Batch 6 overproduction report.",
            "Potato is a translated starch and retains its recipe-specific input until its cooked yield is measured.",
            "Use a 30g Lean / 40g Bulk incorporated finish made with 15g/20g Buffalo sauce, water, apple-cider vinegar, garlic and paprika. Add no salt to the chicken or Buffalo finish.",
            "October 22 owner correction: season the complete shared potato-and-broccoli roast with the measured salt, garlic powder, and paprika before dividing it between Egg Bites and Loaded Buffalo."
          ]
        }
      },
      "plannerOnly": false
    },
    "m3": {
      "name": "Mediterranean Chicken Bowl",
      "category": "Main",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
              "key": "hummus",
              "sourceKey": "hummus",
              "name": "Prepared hummus",
              "amount": 40,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
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
              "amount": 20,
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
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Plate exactly 160g cooked boneless skinless chicken thigh before sauce.",
            "Owner-approved component standard: 120g cooked starch and 75g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "The named Mediterranean vegetables exceed the baseline vegetable minimum and retain their recipe-specific quantities.",
            "Pack cucumber, tomato, hummus, feta, olives, and onion cold and separate from the chicken and rice. The measured oil is for cooking the chicken only; do not dress the cold components with oil.",
            "Record the first finished bowl weights and chilled component hold quality."
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
              "key": "cucumber",
              "sourceKey": "cucumber",
              "name": "Cucumber with peel, raw",
              "amount": 60,
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
              "key": "hummus",
              "sourceKey": "hummus",
              "name": "Prepared hummus",
              "amount": 55,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "feta",
              "sourceKey": "feta",
              "name": "Feta cheese",
              "amount": 18,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "olives",
              "sourceKey": "olives",
              "name": "Black olives, drained",
              "amount": 20,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "medium"
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
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Bottled lemon juice",
              "amount": 6,
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
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Plate exactly 210g cooked boneless skinless chicken thigh before sauce.",
            "Owner-approved component standard: 160g cooked starch and 100g vegetables; 45g/60g dry basmati is the controlled rice equivalent until rice yield is measured.",
            "The named Mediterranean vegetables exceed the baseline vegetable minimum and retain their recipe-specific quantities.",
            "Pack cucumber, tomato, hummus, feta, olives, and onion cold and separate from the chicken and rice. The measured oil is for cooking the chicken only; do not dress the cold components with oil.",
            "Record the first finished bowl weights and chilled component hold quality."
          ]
        }
      },
      "plannerOnly": false
    },
    "m4": {
      "name": "Thai Basil Beef + Jasmine Rice",
      "category": "Main",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
              "key": "thai_red_bell_pepper",
              "sourceKey": "thai_red_bell_pepper",
              "name": "Mild red bell pepper, trimmed raw",
              "amount": 33.6,
              "unit": "g",
              "station": "Other",
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
              "key": "thai_green_beans",
              "sourceKey": "thai_green_beans",
              "name": "Green beans, trimmed raw",
              "amount": 100,
              "unit": "g",
              "station": "Other",
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
            "Red Boat manufacturer ingredients are anchovy and sea salt; no certification claim. Fish allergen remains present in this beef dish. No required cup, optional sauce, fried egg or additional garnish is included in this builder.",
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
              "key": "thai_red_bell_pepper",
              "sourceKey": "thai_red_bell_pepper",
              "name": "Mild red bell pepper, trimmed raw",
              "amount": 48.0,
              "unit": "g",
              "station": "Other",
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
              "key": "thai_green_beans",
              "sourceKey": "thai_green_beans",
              "name": "Green beans, trimmed raw",
              "amount": 150,
              "unit": "g",
              "station": "Other",
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
            "Red Boat manufacturer ingredients are anchovy and sea salt; no certification claim. Fish allergen remains present in this beef dish. No required cup, optional sauce, fried egg or additional garnish is included in this builder.",
            "One combined batch per component across tiers; portion finished beef/finish by210:300 raw-beef shares. Finished cooked/sauced weights have not been physically measured."
          ]
        }
      },
      "plannerOnly": false,
      "qualityChecks": "Owner-approved minced format. Recipe-based15-field estimate uses210/300g raw90/10,69% existing cooked/drained model, identified RedBoat fish sauce and measured finish. Contains fish. No physical test or new yield is claimed."
    },
    "m5": {
      "name": "Chicken Enchilada Bake",
      "category": "Main",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
    "m6": {
      "name": "Lemon Pepper Tilapia with Garlic Potatoes",
      "category": "Main",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
    "m7": {
      "name": "Rosemary-Garlic Lamb Shoulder",
      "category": "Premium meal",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
      "recommendation": "Owner explicitly authorized recipe-based costing/nutrition without requiring a shoulder pilot. Cooked USDA shoulder profile,700/1500 planning edible yield and conservative oil/gravy allocation are documented in the standalone model. Supplier quote and actual production weights remain unmeasured; no physical pass is invented. Contains milk/wheat.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "lamb18_lamb_shoulder_cooked",
              "sourceKey": "lamb18_lamb_shoulder_cooked",
              "name": "Lamb, New Zealand, imported, square-cut shoulder, separable lean and fat, cooked, slow roasted",
              "amount": 160,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-meat",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-meat": 160
              }
            },
            {
              "key": "lamb18_avocado_oil",
              "sourceKey": "lamb18_avocado_oil",
              "name": "Avocado oil",
              "amount": 7.8333,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 5.3333,
                "lamb-green-beans": 2.5
              }
            },
            {
              "key": "lamb18_salt",
              "sourceKey": "lamb18_salt",
              "name": "Table salt",
              "amount": 2.3429,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-idahoan-mash; component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 1.7143,
                "lamb-idahoan-mash": 0.4286,
                "lamb-green-beans": 0.2
              }
            },
            {
              "key": "lamb18_black_pepper",
              "sourceKey": "lamb18_black_pepper",
              "name": "Spices, pepper, black",
              "amount": 0.581,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 0.381,
                "lamb-green-beans": 0.2
              }
            },
            {
              "key": "lamb18_garlic",
              "sourceKey": "lamb18_garlic",
              "name": "Garlic, raw",
              "amount": 7.4725,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-pan-gravy; component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 2.8571,
                "lamb-pan-gravy": 3.1154,
                "lamb-green-beans": 1.5
              }
            },
            {
              "key": "lamb18_rosemary",
              "sourceKey": "lamb18_rosemary",
              "name": "Rosemary, fresh",
              "amount": 1.225,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-pan-gravy; component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 0.381,
                "lamb-pan-gravy": 0.4154,
                "lamb-idahoan-mash": 0.4286
              }
            },
            {
              "key": "lamb18_onion",
              "sourceKey": "lamb18_onion",
              "name": "Onions, raw",
              "amount": 12.4615,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-pan-gravy",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-pan-gravy": 12.4615
              }
            },
            {
              "key": "lamb18_flour",
              "sourceKey": "lamb18_flour",
              "name": "Wheat flour, white, all-purpose, enriched, bleached",
              "amount": 1.3846,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-pan-gravy",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-pan-gravy": 1.3846
              }
            },
            {
              "key": "lamb18_rendered_lamb_fat_model",
              "sourceKey": "lamb18_rendered_lamb_fat_model",
              "name": "Rendered lamb fat, pure-lipid planning model",
              "amount": 1.9385,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-pan-gravy",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-pan-gravy": 1.9385
              }
            },
            {
              "key": "lamb18_instant_potato_flakes",
              "sourceKey": "lamb18_instant_potato_flakes",
              "name": "Idahoan Original mashed potato flakes",
              "amount": 25.2857,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 25.2857
              }
            },
            {
              "key": "lamb18_water",
              "sourceKey": "lamb18_water",
              "name": "Water",
              "amount": 93.8571,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 93.8571
              }
            },
            {
              "key": "lamb18_fairlife_milk",
              "sourceKey": "lamb18_fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 60.0,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 60.0
              }
            },
            {
              "key": "lamb18_butter",
              "sourceKey": "lamb18_butter",
              "name": "Butter, without salt",
              "amount": 8.1429,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 8.1429
              }
            },
            {
              "key": "lamb18_garlic_powder",
              "sourceKey": "lamb18_garlic_powder",
              "name": "Spices, garlic powder",
              "amount": 0.4286,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 0.4286
              }
            },
            {
              "key": "lamb18_green_beans",
              "sourceKey": "lamb18_green_beans",
              "name": "Beans, snap, green, raw",
              "amount": 100.0,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-green-beans": 100.0
              }
            }
          ],
          "confidence": "recipe-based-owner-authorized",
          "assumptions": [
            "Owner authorized recipe-based nutrition/costing without a physical shoulder test as a release blocker. No physical pass or measured yield is claimed.",
            "Cooked meat uses USDA FDC174876, NZ square-cut lamb shoulder, lean and fat, slow roasted. A cut/method proxy; supplier country and exact fat trim are unverified.",
            "Raw shopping yield700/1500=46.6667% from the recipe source; whole1800g plans840g edible. It is not the short-rib49.6% yield.",
            "Count all28g external roast avocado oil once over840g edible meat, plus28g separate retained rendered lamb fat in650g gravy. These are disjoint assumed pools; possible overlap can overstate nutrition. Alternative single-pool sensitivity removes rendered-fat contribution only.",
            "Plain cooked USDA lamb already includes its own meat fat. No second fat addition is made to that meat profile. Rendered gravy fat is separate and has zero incremental purchase cost.",
            "Finish one gravy batch to650g using water/reduction as needed; each meal receives45g, not the whole pot. Count all edible pan aromatics conservatively despite straining. Seasoning salt/pepper are allocated once to meat, not repeated in gravy.",
            "Fresh garlic nutrition uses60g edible from65g gross input. Cost uses all65g. Current catalog minced-garlic price is a disclosed proxy for whole fresh garlic; no new quote exists.",
            "Side ingredient ratios exactly match current controlled Idahoan and2g salt/kg raw-green-bean formulas. Unsalted butter follows current grocery-catalog product identity; shared generic salted-butter profile is not silently reused.",
            "All15 nutrient fields include explicit missing-field proxies in the companion profile ledger, notably rosemary sugars and butter trans fat. Recipe totals are not laboratory results."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "lamb18_lamb_shoulder_cooked",
              "sourceKey": "lamb18_lamb_shoulder_cooked",
              "name": "Lamb, New Zealand, imported, square-cut shoulder, separable lean and fat, cooked, slow roasted",
              "amount": 210,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-meat",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-meat": 210
              }
            },
            {
              "key": "lamb18_avocado_oil",
              "sourceKey": "lamb18_avocado_oil",
              "name": "Avocado oil",
              "amount": 10.3333,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 7.0,
                "lamb-green-beans": 3.3333
              }
            },
            {
              "key": "lamb18_salt",
              "sourceKey": "lamb18_salt",
              "name": "Table salt",
              "amount": 3.0881,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-idahoan-mash; component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 2.25,
                "lamb-idahoan-mash": 0.5714,
                "lamb-green-beans": 0.2667
              }
            },
            {
              "key": "lamb18_black_pepper",
              "sourceKey": "lamb18_black_pepper",
              "name": "Spices, pepper, black",
              "amount": 0.7667,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 0.5,
                "lamb-green-beans": 0.2667
              }
            },
            {
              "key": "lamb18_garlic",
              "sourceKey": "lamb18_garlic",
              "name": "Garlic, raw",
              "amount": 8.8654,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-pan-gravy; component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 3.75,
                "lamb-pan-gravy": 3.1154,
                "lamb-green-beans": 2.0
              }
            },
            {
              "key": "lamb18_rosemary",
              "sourceKey": "lamb18_rosemary",
              "name": "Rosemary, fresh",
              "amount": 1.4868,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-roast-finish; component:lamb-pan-gravy; component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-roast-finish": 0.5,
                "lamb-pan-gravy": 0.4154,
                "lamb-idahoan-mash": 0.5714
              }
            },
            {
              "key": "lamb18_onion",
              "sourceKey": "lamb18_onion",
              "name": "Onions, raw",
              "amount": 12.4615,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-pan-gravy",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-pan-gravy": 12.4615
              }
            },
            {
              "key": "lamb18_flour",
              "sourceKey": "lamb18_flour",
              "name": "Wheat flour, white, all-purpose, enriched, bleached",
              "amount": 1.3846,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-pan-gravy",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-pan-gravy": 1.3846
              }
            },
            {
              "key": "lamb18_rendered_lamb_fat_model",
              "sourceKey": "lamb18_rendered_lamb_fat_model",
              "name": "Rendered lamb fat, pure-lipid planning model",
              "amount": 1.9385,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-pan-gravy",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-pan-gravy": 1.9385
              }
            },
            {
              "key": "lamb18_instant_potato_flakes",
              "sourceKey": "lamb18_instant_potato_flakes",
              "name": "Idahoan Original mashed potato flakes",
              "amount": 33.7143,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 33.7143
              }
            },
            {
              "key": "lamb18_water",
              "sourceKey": "lamb18_water",
              "name": "Water",
              "amount": 125.1429,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 125.1429
              }
            },
            {
              "key": "lamb18_fairlife_milk",
              "sourceKey": "lamb18_fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 80.0,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 80.0
              }
            },
            {
              "key": "lamb18_butter",
              "sourceKey": "lamb18_butter",
              "name": "Butter, without salt",
              "amount": 10.8571,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 10.8571
              }
            },
            {
              "key": "lamb18_garlic_powder",
              "sourceKey": "lamb18_garlic_powder",
              "name": "Spices, garlic powder",
              "amount": 0.5714,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-idahoan-mash",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-idahoan-mash": 0.5714
              }
            },
            {
              "key": "lamb18_green_beans",
              "sourceKey": "lamb18_green_beans",
              "name": "Beans, snap, green, raw",
              "amount": 133.3333,
              "unit": "g",
              "station": "Other",
              "note": "component:lamb-green-beans",
              "confidence": "recipe-based-owner-authorized",
              "allocations": {
                "lamb-green-beans": 133.3333
              }
            }
          ],
          "confidence": "recipe-based-owner-authorized",
          "assumptions": [
            "Owner authorized recipe-based nutrition/costing without a physical shoulder test as a release blocker. No physical pass or measured yield is claimed.",
            "Cooked meat uses USDA FDC174876, NZ square-cut lamb shoulder, lean and fat, slow roasted. A cut/method proxy; supplier country and exact fat trim are unverified.",
            "Raw shopping yield700/1500=46.6667% from the recipe source; whole1800g plans840g edible. It is not the short-rib49.6% yield.",
            "Count all28g external roast avocado oil once over840g edible meat, plus28g separate retained rendered lamb fat in650g gravy. These are disjoint assumed pools; possible overlap can overstate nutrition. Alternative single-pool sensitivity removes rendered-fat contribution only.",
            "Plain cooked USDA lamb already includes its own meat fat. No second fat addition is made to that meat profile. Rendered gravy fat is separate and has zero incremental purchase cost.",
            "Finish one gravy batch to650g using water/reduction as needed; each meal receives45g, not the whole pot. Count all edible pan aromatics conservatively despite straining. Seasoning salt/pepper are allocated once to meat, not repeated in gravy.",
            "Fresh garlic nutrition uses60g edible from65g gross input. Cost uses all65g. Current catalog minced-garlic price is a disclosed proxy for whole fresh garlic; no new quote exists.",
            "Side ingredient ratios exactly match current controlled Idahoan and2g salt/kg raw-green-bean formulas. Unsalted butter follows current grocery-catalog product identity; shared generic salted-butter profile is not silently reused.",
            "All15 nutrient fields include explicit missing-field proxies in the companion profile ledger, notably rosemary sugars and butter trans fat. Recipe totals are not laboratory results."
          ]
        }
      },
      "plannerOnly": false,
      "qualityChecks": "Owner explicitly authorized recipe-based costing/nutrition without requiring a shoulder pilot. Cooked USDA shoulder profile,700/1500 planning edible yield and conservative oil/gravy allocation are documented in the standalone model. Supplier quote and actual production weights remain unmeasured; no physical pass is invented. Contains milk/wheat."
    },
    "a1": {
      "name": "Chicken Tikka Snack Wrap",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
      "status": "Batch 18 controlled planning recipe",
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
    "a3": {
      "name": "Lemon-Feta Chickpea & Edamame Crunch Box",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
      "recommendation": "277.8g recipe input, not measured finished pack. Higher-protein variant uses100g cooked shelled edamame and60g drained chickpeas. All15 nutrients and every ingredient/container cost modeled. Contains milk/soy; physical tasting/fit not claimed.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "batch18_chickpeas",
              "sourceKey": "batch18_chickpeas",
              "name": "Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, drained solids",
              "amount": 60.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 60.0
              }
            },
            {
              "key": "batch18_edamame",
              "sourceKey": "batch18_edamame",
              "name": "Edamame, frozen, prepared",
              "amount": 100.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 100.0
              }
            },
            {
              "key": "batch18_cucumber",
              "sourceKey": "batch18_cucumber",
              "name": "Cucumber, with peel, raw",
              "amount": 35.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 35.0
              }
            },
            {
              "key": "batch18_tomato",
              "sourceKey": "batch18_tomato",
              "name": "Tomatoes, red, ripe, raw, year round average",
              "amount": 25.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 25.0
              }
            },
            {
              "key": "batch18_feta",
              "sourceKey": "batch18_feta",
              "name": "Cheese, feta",
              "amount": 30.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 30.0
              }
            },
            {
              "key": "batch18_onion",
              "sourceKey": "batch18_onion",
              "name": "Onions, raw",
              "amount": 8.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 8.0
              }
            },
            {
              "key": "batch18_parsley",
              "sourceKey": "batch18_parsley",
              "name": "Parsley, fresh",
              "amount": 3.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 3.0
              }
            },
            {
              "key": "batch18_lemon",
              "sourceKey": "batch18_lemon",
              "name": "Lemon juice from concentrate, canned or bottled",
              "amount": 12.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 12.0
              }
            },
            {
              "key": "batch18_olive_oil",
              "sourceKey": "batch18_olive_oil",
              "name": "Oil, olive, salad or cooking",
              "amount": 4.0,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 4.0
              }
            },
            {
              "key": "batch18_garlic_powder",
              "sourceKey": "batch18_garlic_powder",
              "name": "Spices, garlic powder",
              "amount": 0.3,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 0.3
              }
            },
            {
              "key": "batch18_salt",
              "sourceKey": "batch18_salt",
              "name": "Salt, table",
              "amount": 0.4,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 0.4
              }
            },
            {
              "key": "batch18_black_pepper",
              "sourceKey": "batch18_black_pepper",
              "name": "Spices, pepper, black",
              "amount": 0.1,
              "unit": "g",
              "station": "Other",
              "note": "component:edamame-feta-crunch-box",
              "confidence": "complete-recipe-estimate",
              "allocations": {
                "edamame-feta-crunch-box": 0.1
              }
            }
          ],
          "confidence": "owner-authorized-recipe-estimate",
          "assumptions": [
            "Owner-authorized complete recipe estimate; all issued edible ingredients retained in nutrient model.",
            "Finished yield, transfer loss, net fill, taste, fit and refrigerated quality are not measured test results.",
            "No shelf life inferred from recipe calculation; keep actual preparation/quality records separately.",
            "Owner selected higher-protein variant with60g drained chickpeas/100g cooked edamame; original130g chickpea-only proposal is not active.",
            "Use Frigo feta purchasing identity with USDA generic feta nutrition estimate until actual purchased panel is captured.",
            "Use USDA canned DRAINED chickpeas and PREPARED shelled edamame nutrition, not dry beans, can liquid or pod weights.",
            "Milk and soy; verify actual feta enzyme specification and all ingredient labels. No unverified high-protein nutrient-content claim."
          ]
        }
      },
      "plannerOnly": false,
      "qualityChecks": "277.8g recipe input, not measured finished pack. Higher-protein variant uses100g cooked shelled edamame and60g drained chickpeas. All15 nutrients and every ingredient/container cost modeled. Contains milk/soy; physical tasting/fit not claimed."
    },
    "dr1": {
      "name": "Strawberry Protein Shake",
      "category": "Add-on",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
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
    "bw1": {
      "name": "Chicken Shakshuka",
      "category": "Internal custom meal",
      "aliases": [],
      "status": "Batch 18 controlled planning recipe",
      "recommendation": "Confirm actual purchased panels and measured yields.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "chicken_thigh_raw",
              "sourceKey": "chicken_thigh_cooked",
              "name": "Boneless skinless chicken thighs, raw",
              "amount": 130.0,
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
              "amount": 0.8775,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.8775
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
              "amount": 0.52,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "medium",
              "allocations": {
                "shared-chicken-base": 0.52
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
              "amount": 2.39,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base; component:shakshuka-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.39,
                "shakshuka-base": 2
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
              "amount": 0.26,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.26
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
              "amount": 0.65,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.65
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
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
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 200,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "fresh tomatoes cooked down for the shakshuka base",
              "confidence": "high"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "green_bell_pepper",
              "sourceKey": "green_bell_pepper",
              "name": "Green bell pepper, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
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
              "key": "bread_slice",
              "sourceKey": "bread_slice",
              "name": "French toast bread",
              "amount": 1,
              "unit": "each",
              "station": "Breakfast & Desserts",
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
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 1,
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
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Chicken and eggs are cooked to 165 F in a measured tomato-pepper shakshuka base. The measured oil is for the chicken only; do not add oil to the tomato-pepper base.",
            "Pack the same controlled bread used for French Toast separately so it can be toasted after reheating.",
            "There is no recipe-required sauce cup. Customer-selected Garlic Herb Yogurt or Sweet Heat cups are handled once through the weekly sauce program.",
            "Use fresh cooked-down tomatoes instead of salted canned tomatoes. Season the shared chicken base at 0.5% salt by raw chicken weight; do not add a separate salt dose to the tomato-pepper base.",
            "Owner corrected raw chicken to 130g Lean and 180g Bulk on October 21, 2026 because each serving also contains two whole eggs and mozzarella."
          ]
        },
        "bulk": {
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
              "amount": 2.54,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base; component:shakshuka-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.54,
                "shakshuka-base": 2
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
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.9,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:shared-chicken-base",
              "confidence": "high",
              "allocations": {
                "shared-chicken-base": 0.9
              },
              "measure": {
                "type": "spice",
                "gramsPerTsp": 6.0
              }
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
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 250,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "fresh tomatoes cooked down for the shakshuka base",
              "confidence": "high"
            },
            {
              "key": "red_onion",
              "sourceKey": "red_onion",
              "name": "Red onion, raw",
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
              "amount": 60,
              "unit": "g",
              "station": "Cold Prep & Produce",
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
              "key": "bread_slice",
              "sourceKey": "bread_slice",
              "name": "French toast bread",
              "amount": 2,
              "unit": "each",
              "station": "Breakfast & Desserts",
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
              "key": "cumin",
              "sourceKey": "cumin",
              "name": "Ground cumin",
              "amount": 1,
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
              "key": "avocado_oil",
              "sourceKey": "avocado_oil",
              "name": "Avocado oil",
              "amount": 4,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:chicken-cooking",
              "confidence": "medium",
              "allocations": {
                "chicken-cooking": 4
              },
              "measure": {
                "type": "liquid",
                "density": 0.91
              }
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "Chicken and eggs are cooked to 165 F in a measured tomato-pepper shakshuka base. The measured oil is for the chicken only; do not add oil to the tomato-pepper base.",
            "Pack the same controlled bread used for French Toast separately so it can be toasted after reheating.",
            "There is no recipe-required sauce cup. Customer-selected Garlic Herb Yogurt or Sweet Heat cups are handled once through the weekly sauce program.",
            "Use fresh cooked-down tomatoes instead of salted canned tomatoes. Season the shared chicken base at 0.5% salt by raw chicken weight; do not add a separate salt dose to the tomato-pepper base.",
            "Owner corrected raw chicken to 130g Lean and 180g Bulk on October 21, 2026 because each serving also contains two whole eggs and mozzarella."
          ]
        }
      },
      "plannerOnly": true
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
      "status": "Batch 18 controlled planning recipe",
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
      "status": "Batch 18 controlled planning recipe",
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
      "status": "Batch 18 controlled planning recipe",
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
    "w1": {
      "name": "Mango Habanero Chicken Wings",
      "category": "Internal custom meal",
      "aliases": [
        "Mango Habanero Wings"
      ],
      "status": "Private family wing planning recipe; measured weights and package panels pending",
      "recommendation": "Pack exactly eight individual split flats/drumettes for Lean and at least ten for Bulk; current five boxes require at least 44 usable pieces, plus five separate 40 g NET bottled-ranch planning cups. No rice or vegetable side. Raw masses and scaled seasoning/glaze are old-pilot planning estimates, not measured piece weights or yields. Count/weigh the supplier lot, verify both sauce panels and stock, record raw/cooked output and fit, and measure 165 F away from bone. Keep ranch cold and separate. Private family production only. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released.",
      "tiers": {
        "lean": {
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
              "key": "sunflower_oil",
              "sourceKey": "sunflower_oil",
              "name": "Altunsa sunflower oil",
              "amount": 6.6667,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 6.6667
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
              "amount": 60.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:wings-finish",
              "confidence": "planning-unmeasured",
              "allocations": {
                "wings-finish": 60.0
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
          "confidence": "private-planning-unmeasured",
          "assumptions": [
            "Owner-confirmed Lean box: at least 8 INDIVIDUAL flats/drumettes, not whole unsplit wings.",
            "ESTIMATED raw bone-in planning mass 533.3 g from the old400 g / about 6-piece pilot. No measured piece weight or cooked/edible yield.",
            "The old pilot's oil, dry seasoning and 45 g finishing sauce scale with that provisional raw-mass estimate. Count/weigh actual wings and confirm coverage before locking production quantities.",
            "Count usable individual split pieces as a separate purchase/pack floor. The normal 5% raw-mass shopping reserve does not replace the required piece count.",
            "Pack ONE separate 40 g NET bottled-ranch planning cup per box. Product ingredients, allergens, package cost and exact filled recovery remain unverified.",
            "No rice, starch or vegetable side is included. Keep bones accounted for; bone-in packed mass is not edible meat.",
            "Cook uncrowded air-fryer batches to 165 F in thick meat away from bone. Keep clean finishing sauce separate from raw poultry; ranch stays cold.",
            "Record raw count/mass, cooked count/mass, sauce used, final net weight and ten-piece container fit. Cool protected in shallow pans and keep at 41 F or below.",
            "Private family production only. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
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
            "ranchFillPlanningOnly": true,
            "ranchProductVerified": false,
            "extraStarchOrVegetableSide": false
          },
          "labelsEnabled": false,
          "nutritionComplete": false,
          "finalLabelReady": false,
          "nutritionReleaseHold": "Private family production only. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
        },
        "bulk": {
          "ingredients": [
            {
              "key": "chicken_wings_raw",
              "sourceKey": "chicken_wings_raw",
              "name": "Split chicken wings, raw bone-in (estimated mass; count pieces)",
              "amount": 666.6667,
              "unit": "g",
              "station": "Poultry",
              "note": "component:wings-seasoning; ESTIMATED mass from old400 g / about 6-piece pilot; count and weigh actual lot.",
              "confidence": "planning-unmeasured",
              "allocations": {
                "wings-seasoning": 666.6667
              },
              "measure": {
                "type": "meat",
                "weightEstimated": true,
                "pieceName": "individual split flats/drumettes"
              },
              "minimumPieces": 10,
              "pieceCountBasis": "individual split flats/drumettes",
              "estimatedWeight": true
            },
            {
              "key": "sunflower_oil",
              "sourceKey": "sunflower_oil",
              "name": "Altunsa sunflower oil",
              "amount": 8.3333,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 8.3333
              }
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 3.3333,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "high",
              "allocations": {
                "wings-seasoning": 3.3333
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
              "amount": 3.3333,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "high",
              "allocations": {
                "wings-seasoning": 3.3333
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
              "amount": 1.6667,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 1.6667
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
              "amount": 1.6667,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "component:wings-seasoning",
              "confidence": "medium",
              "allocations": {
                "wings-seasoning": 1.6667
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
              "amount": 75.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "component:wings-finish",
              "confidence": "planning-unmeasured",
              "allocations": {
                "wings-finish": 75.0
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
          "confidence": "private-planning-unmeasured",
          "assumptions": [
            "Owner-confirmed Bulk box: at least 10 INDIVIDUAL flats/drumettes, not whole unsplit wings.",
            "ESTIMATED raw bone-in planning mass 666.7 g from the old400 g / about 6-piece pilot. No measured piece weight or cooked/edible yield.",
            "The old pilot's oil, dry seasoning and 45 g finishing sauce scale with that provisional raw-mass estimate. Count/weigh actual wings and confirm coverage before locking production quantities.",
            "Count usable individual split pieces as a separate purchase/pack floor. The normal 5% raw-mass shopping reserve does not replace the required piece count.",
            "Pack ONE separate 40 g NET bottled-ranch planning cup per box. Product ingredients, allergens, package cost and exact filled recovery remain unverified.",
            "No rice, starch or vegetable side is included. Keep bones accounted for; bone-in packed mass is not edible meat.",
            "Cook uncrowded air-fryer batches to 165 F in thick meat away from bone. Keep clean finishing sauce separate from raw poultry; ranch stays cold.",
            "Record raw count/mass, cooked count/mass, sauce used, final net weight and ten-piece container fit. Cool protected in shallow pans and keep at 41 F or below.",
            "Private family production only. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
          ],
          "portionControl": {
            "wingPiecesPerMeal": 10,
            "pieceCountBasis": "individual split flats/drumettes",
            "minimumPieces": 10,
            "rawMassPlanningGrams": 666.6666666666666,
            "rawWeightVerified": false,
            "rawMassBasis": "Old pilot400 g / about 6 pieces; count and weigh actual purchased wings.",
            "cookedYieldVerified": false,
            "edibleMeatYieldVerified": false,
            "ranchCupsPerMeal": 1,
            "ranchCupGrams": 40.0,
            "ranchFillPlanningOnly": true,
            "ranchProductVerified": false,
            "extraStarchOrVegetableSide": false
          },
          "labelsEnabled": false,
          "nutritionComplete": false,
          "finalLabelReady": false,
          "nutritionReleaseHold": "Private family production only. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
        }
      },
      "plannerOnly": true,
      "labelsEnabled": false,
      "nutritionComplete": false,
      "finalLabelReady": false,
      "nutritionReleaseHold": "Private family production only. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released.",
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
          }
        ]
      },
      "qualityChecks": "Pack exactly eight individual split flats/drumettes for Lean and at least ten for Bulk; current five boxes require at least 44 usable pieces, plus five separate 40 g NET bottled-ranch planning cups. No rice or vegetable side. Raw masses and scaled seasoning/glaze are old-pilot planning estimates, not measured piece weights or yields. Count/weigh the supplier lot, verify both sauce panels and stock, record raw/cooked output and fit, and measure 165 F away from bone. Keep ranch cold and separate. Private family production only. Wing size, actual raw/cooked/edible weights, mango-habanero and bottled-ranch product panels/costs and container fit are unverified. No consumer macros or complete Nutrition Facts may be released."
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
