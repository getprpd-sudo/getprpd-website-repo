const PRPD_PRODUCTION_DATA = {
  "version": "2026-07-20.1",
  "batch": 3,
  "notice": "Batch 3 production quantities generated from the controlled July 25 recipe builds. Test-status dishes remain visibly flagged until physical validation.",
  "meals": {
    "b1": {
      "name": "High Protein Omelette",
      "category": "Breakfast",
      "status": "Keep",
      "recommendation": "Confirm purchased sourdough label.",
      "tiers": {
        "lean": {
          "ingredients": [
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
              "key": "egg_white",
              "sourceKey": "egg_white",
              "name": "Liquid egg white",
              "amount": 92,
              "unit": "g",
              "station": "Breakfast & Desserts",
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
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 40,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "mushroom",
              "sourceKey": "mushroom",
              "name": "White mushrooms, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "sourdough_slice",
              "sourceKey": "sourdough_slice",
              "name": "Sourdough bread",
              "amount": 1,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 100,
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
            "Lean uses the updated Cut build; Bulk uses the updated Build build.",
            "Oil spray is controlled at 2g/3g retained."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "egg",
              "sourceKey": "egg",
              "name": "Whole egg",
              "amount": 3,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "egg_white",
              "sourceKey": "egg_white",
              "name": "Liquid egg white",
              "amount": 138,
              "unit": "g",
              "station": "Breakfast & Desserts",
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
              "key": "mushroom",
              "sourceKey": "mushroom",
              "name": "White mushrooms, raw",
              "amount": 50,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "jalapeno",
              "sourceKey": "jalapeno",
              "name": "Jalapeno, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "sourdough_slice",
              "sourceKey": "sourdough_slice",
              "name": "Sourdough bread",
              "amount": 2,
              "unit": "each",
              "station": "Bread & Packaging",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
              "amount": 100,
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
            "Lean uses the updated Cut build; Bulk uses the updated Build build.",
            "Oil spray is controlled at 2g/3g retained."
          ]
        }
      }
    },
    "b2": {
      "name": "Beef Breakfast Skillet",
      "category": "Breakfast",
      "status": "Keep",
      "recommendation": "Record one drained cooked-beef yield.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 200.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "sweet_potato",
              "sourceKey": "sweet_potato",
              "name": "Sweet potato, raw",
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
              "key": "salsa",
              "sourceKey": "salsa",
              "name": "Prepared salsa",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low",
              "measure": {
                "type": "liquid",
                "density": 1.0
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
            "All rendered beef fat is drained.",
            "Uses the updated 200g Lean and 270g Bulk raw-beef limits."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 270.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
              }
            },
            {
              "key": "sweet_potato",
              "sourceKey": "sweet_potato",
              "name": "Sweet potato, raw",
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
              "key": "salsa",
              "sourceKey": "salsa",
              "name": "Prepared salsa",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low",
              "measure": {
                "type": "liquid",
                "density": 1.0
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
            "Uses the updated 200g Lean and 270g Bulk raw-beef limits."
          ]
        }
      }
    },
    "b3": {
      "name": "Power Bowl",
      "category": "Breakfast",
      "status": "Keep",
      "recommendation": "No formula blocker.",
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
              "key": "sweet_potato",
              "sourceKey": "sweet_potato",
              "name": "Sweet potato, raw",
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
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 15,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
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
            "Oil spray and salt are controlled rather than left uncounted."
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
              "key": "sweet_potato",
              "sourceKey": "sweet_potato",
              "name": "Sweet potato, raw",
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
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 15,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
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
            "Oil spray and salt are controlled rather than left uncounted."
          ]
        }
      }
    },
    "b4": {
      "name": "Blueberry Cheesecake Protein Pancakes",
      "category": "Breakfast",
      "status": "Test",
      "recommendation": "New breakfast: verify three/four-pancake yield, topping yield, sweetness, and day-three reheat quality.",
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
              "confidence": "medium"
            },
            {
              "key": "whey",
              "sourceKey": "whey",
              "name": "Premier Protein powder, vanilla/chocolate",
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
              "key": "blueberry",
              "sourceKey": "blueberry",
              "name": "Blueberries, frozen or fresh",
              "amount": 80,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "philadelphia_no_bake",
              "sourceKey": "philadelphia_no_bake",
              "name": "Philadelphia no-bake cheesecake filling",
              "amount": 20,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "low"
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
              "note": "",
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
            "The FAGE total is split between batter and cheesecake topping.",
            "Blueberry compote and cheesecake topping share one side cup; sugar-free syrup uses a second cup.",
            "This is a first-test build. Record finished pancake count, batter yield, topping yield, taste, and day-three reheat quality."
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
              "confidence": "medium"
            },
            {
              "key": "whey",
              "sourceKey": "whey",
              "name": "Premier Protein powder, vanilla/chocolate",
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
              "key": "blueberry",
              "sourceKey": "blueberry",
              "name": "Blueberries, frozen or fresh",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "philadelphia_no_bake",
              "sourceKey": "philadelphia_no_bake",
              "name": "Philadelphia no-bake cheesecake filling",
              "amount": 25,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "low"
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
              "note": "",
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
            "The FAGE total is split between batter and cheesecake topping.",
            "Blueberry compote and cheesecake topping share one side cup; sugar-free syrup uses a second cup.",
            "This is a first-test build. Record finished pancake count, batter yield, topping yield, taste, and day-three reheat quality."
          ]
        }
      }
    },
    "m1": {
      "name": "Cheeseburger Hot Pockets",
      "category": "Main",
      "status": "Keep",
      "recommendation": "Owner confirmed three Bulk pockets fit the container. Confirm dough yield and day-three reheat quality.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "flour",
              "sourceKey": "flour",
              "name": "All-purpose flour",
              "amount": 80,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "baking_powder",
              "sourceKey": "baking_powder",
              "name": "Baking powder",
              "amount": 6,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 82,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "beef_90_raw",
              "sourceKey": "beef_90_pan",
              "name": "Ground beef 90/10, raw",
              "amount": 80.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 69% cooked yield.",
              "confidence": "high",
              "measure": {
                "type": "meat"
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
              "key": "broth",
              "sourceKey": "broth",
              "name": "Prepared chicken/beef broth",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low",
              "measure": {
                "type": "liquid",
                "density": 1.0
              }
            },
            {
              "key": "ketchup",
              "sourceKey": "ketchup",
              "name": "Ketchup",
              "amount": 9,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low",
              "measure": {
                "type": "liquid",
                "density": 1.14
              }
            },
            {
              "key": "pickles",
              "sourceKey": "pickles",
              "name": "Drained mixed pickled vegetables",
              "amount": 12,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 40,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.2,
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
            "Lean is two pockets; Bulk is three pockets.",
            "Dough is scaled from the 10-pocket historical batch: 400g flour plus 410g yogurt."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "flour",
              "sourceKey": "flour",
              "name": "All-purpose flour",
              "amount": 120.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "baking_powder",
              "sourceKey": "baking_powder",
              "name": "Baking powder",
              "amount": 9.0,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 123.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
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
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 30.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "broth",
              "sourceKey": "broth",
              "name": "Prepared chicken/beef broth",
              "amount": 30.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low",
              "measure": {
                "type": "liquid",
                "density": 1.0
              }
            },
            {
              "key": "ketchup",
              "sourceKey": "ketchup",
              "name": "Ketchup",
              "amount": 13.5,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low",
              "measure": {
                "type": "liquid",
                "density": 1.14
              }
            },
            {
              "key": "pickles",
              "sourceKey": "pickles",
              "name": "Drained mixed pickled vegetables",
              "amount": 18.0,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "mozzarella",
              "sourceKey": "mozzarella",
              "name": "H-E-B fat-free mozzarella",
              "amount": 60.0,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 1.8,
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
            "Lean is two pockets; Bulk is three pockets.",
            "Dough is scaled from the 10-pocket historical batch: 400g flour plus 410g yogurt."
          ]
        }
      }
    },
    "m2": {
      "name": "Mexican Streetcorn Chicken Bowl",
      "category": "Main",
      "status": "Keep",
      "recommendation": "Street-corn component still needs its first kitchen check.",
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
            "Green bell pepper is included in the controlled street-corn component."
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
            "Green bell pepper is included in the controlled street-corn component."
          ]
        }
      }
    },
    "m3": {
      "name": "Hot Honey Chicken Sliders",
      "category": "Main",
      "status": "Test",
      "recommendation": "New dish: taste, fit, leakage, and day-three reheat test required.",
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
              "key": "hawaiian_roll",
              "sourceKey": "hawaiian_roll",
              "name": "Great Value Sweet Hawaiian roll",
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
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 10,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 10,
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
              "key": "hot_sauce",
              "sourceKey": "hot_sauce",
              "name": "Frank's-style hot sauce",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "medium"
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
              "key": "corn",
              "sourceKey": "corn",
              "name": "Sweet yellow corn, cooked, no salt",
              "amount": 20,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "pickles",
              "sourceKey": "pickles",
              "name": "Drained mixed pickled vegetables",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
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
            "Lean is two sliders; Bulk is three.",
            "Uses boneless skinless chicken thighs, one controlled cheese, no garlic-butter topping, and measured hot-honey mayo."
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
              "key": "hawaiian_roll",
              "sourceKey": "hawaiian_roll",
              "name": "Great Value Sweet Hawaiian roll",
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
              "amount": 42,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "light_mayo",
              "sourceKey": "light_mayo",
              "name": "Great Value light mayonnaise",
              "amount": 22,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 11,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 11,
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
              "key": "hot_sauce",
              "sourceKey": "hot_sauce",
              "name": "Frank's-style hot sauce",
              "amount": 24,
              "unit": "g",
              "station": "Sauces & Dairy",
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
              "key": "corn",
              "sourceKey": "corn",
              "name": "Sweet yellow corn, cooked, no salt",
              "amount": 25,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "pickles",
              "sourceKey": "pickles",
              "name": "Drained mixed pickled vegetables",
              "amount": 20,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "low"
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
            "Lean is two sliders; Bulk is three.",
            "Uses boneless skinless chicken thighs, one controlled cheese, no garlic-butter topping, and measured hot-honey mayo."
          ]
        }
      }
    },
    "m4": {
      "name": "Chicken Biryani",
      "category": "Main",
      "status": "Keep",
      "recommendation": "Customer favorite; record retained marinade/oil once.",
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
              "amount": 7.5,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 70,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
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
              "amount": 8,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
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
              "name": "Lemon juice, raw",
              "amount": 25,
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
            "Only 25% of the 30g yogurt marinade is counted after scraping.",
            "Includes a separately packed cucumber, tomato, and onion salad with lemon; verify day-three holding quality."
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
              "amount": 7.5,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "onion",
              "sourceKey": "onion",
              "name": "Onion, raw",
              "amount": 70,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "tomato",
              "sourceKey": "tomato",
              "name": "Tomato, raw",
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
              "amount": 8,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
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
              "name": "Lemon juice, raw",
              "amount": 25,
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
            "Only 25% of the 30g yogurt marinade is counted after scraping.",
            "Includes a separately packed cucumber, tomato, and onion salad with lemon; verify day-three holding quality."
          ]
        }
      }
    },
    "m5": {
      "name": "BBQ Chicken Mac & Cheese",
      "category": "Main",
      "status": "Keep",
      "recommendation": "Uses the selected Muscle Mac planning product; confirm the purchased box before label printing.",
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
              "key": "protein_mac",
              "sourceKey": "protein_mac",
              "name": "Muscle Mac high-protein macaroni and cheese",
              "amount": 76,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "bbq_sauce",
              "sourceKey": "bbq_sauce",
              "name": "G Hughes sugar-free BBQ sauce",
              "amount": 60,
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
          "confidence": "low",
          "assumptions": [
            "Includes 30g sauce in the dish plus a 30g side cup.",
            "Exact boxed-mac label is the main remaining nutrition input."
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
              "key": "protein_mac",
              "sourceKey": "protein_mac",
              "name": "Muscle Mac high-protein macaroni and cheese",
              "amount": 76,
              "unit": "g",
              "station": "Starches & Hot Sides",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "bbq_sauce",
              "sourceKey": "bbq_sauce",
              "name": "G Hughes sugar-free BBQ sauce",
              "amount": 60,
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
          "confidence": "low",
          "assumptions": [
            "Includes 30g sauce in the dish plus a 30g side cup.",
            "Exact boxed-mac label is the main remaining nutrition input."
          ]
        }
      }
    },
    "m6": {
      "name": "Korean Bulgogi Beef Bowl",
      "category": "Main",
      "status": "Keep",
      "recommendation": "Confirm smaller beef portions still plate generously.",
      "tiers": {
        "lean": {
          "ingredients": [
            {
              "key": "beef_strips_raw",
              "sourceKey": "beef_strips_cooked",
              "name": "Lean beef strips, raw",
              "amount": 180.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 76% cooked yield.",
              "confidence": "medium",
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
              "key": "broccoli",
              "sourceKey": "broccoli",
              "name": "Broccoli, raw",
              "amount": 35,
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
              "confidence": "high"
            },
            {
              "key": "carrot",
              "sourceKey": "carrot",
              "name": "Carrot, raw",
              "amount": 30,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "soy_sauce",
              "sourceKey": "soy_sauce",
              "name": "Low-sodium soy sauce",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low",
              "measure": {
                "type": "liquid",
                "density": 1.16
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 21,
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
              "key": "sesame_oil",
              "sourceKey": "sesame_oil",
              "name": "Sesame oil",
              "amount": 2.25,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 12,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
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
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 5,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "apple",
              "sourceKey": "apple",
              "name": "Apple, raw with skin",
              "amount": 60,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cornstarch",
              "sourceKey": "cornstarch",
              "name": "Cornstarch",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
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
            "Uses the proposed cost-controlled 180g Lean and 250g Bulk raw portions.",
            "Broccoli, bell pepper, and carrot form the controlled stir-fry vegetable blend."
          ]
        },
        "bulk": {
          "ingredients": [
            {
              "key": "beef_strips_raw",
              "sourceKey": "beef_strips_cooked",
              "name": "Lean beef strips, raw",
              "amount": 250.0,
              "unit": "g",
              "station": "Beef",
              "note": "Raw purchasing/prep quantity; modeled 76% cooked yield.",
              "confidence": "medium",
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
              "key": "broccoli",
              "sourceKey": "broccoli",
              "name": "Broccoli, raw",
              "amount": 45,
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
              "confidence": "high"
            },
            {
              "key": "carrot",
              "sourceKey": "carrot",
              "name": "Carrot, raw",
              "amount": 40,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "soy_sauce",
              "sourceKey": "soy_sauce",
              "name": "Low-sodium soy sauce",
              "amount": 30,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "low",
              "measure": {
                "type": "liquid",
                "density": 1.16
              }
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 21,
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
              "key": "sesame_oil",
              "sourceKey": "sesame_oil",
              "name": "Sesame oil",
              "amount": 2.25,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 12,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
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
              "key": "sriracha",
              "sourceKey": "sriracha",
              "name": "Sriracha sauce",
              "amount": 5,
              "unit": "g",
              "station": "Other",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "apple",
              "sourceKey": "apple",
              "name": "Apple, raw with skin",
              "amount": 60,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "cornstarch",
              "sourceKey": "cornstarch",
              "name": "Cornstarch",
              "amount": 3,
              "unit": "g",
              "station": "Dry Prep & Seasonings",
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
            "Uses the proposed cost-controlled 180g Lean and 250g Bulk raw portions.",
            "Broccoli, bell pepper, and carrot form the controlled stir-fry vegetable blend."
          ]
        }
      }
    },
    "m7": {
      "name": "Garlic Butter Shrimp + Rice",
      "category": "Main",
      "status": "Keep",
      "recommendation": "Confirm current shrimp package label and cooked yield.",
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
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "edamame",
              "sourceKey": "edamame",
              "name": "Shelled edamame, cooked",
              "amount": 74,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
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
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 12,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Lemon juice, raw",
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
            "Rebalanced from the preliminary 180g/240g proposal so Bulk reaches a meaningful calorie and protein tier.",
            "The historical two tablespoons of butter was ambiguous; butter is now explicit per meal."
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
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "edamame",
              "sourceKey": "edamame",
              "name": "Shelled edamame, cooked",
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
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
              "key": "garlic",
              "sourceKey": "garlic",
              "name": "Garlic, raw",
              "amount": 15,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "lemon",
              "sourceKey": "lemon",
              "name": "Lemon juice, raw",
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
            "Rebalanced from the preliminary 180g/240g proposal so Bulk reaches a meaningful calorie and protein tier.",
            "The historical two tablespoons of butter was ambiguous; butter is now explicit per meal."
          ]
        }
      }
    },
    "m8": {
      "name": "Premium NY Strip Steak",
      "category": "Main",
      "status": "Test",
      "recommendation": "Confirm cooked yield, doneness after reheating, and side presentation.",
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
              "amount": 100,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 30,
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
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 20,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 3,
              "unit": "g",
              "station": "Sauces & Dairy",
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
            "Lean uses 240g raw steak; Bulk uses 300g.",
            "The mashed-potato side uses measured Fairlife milk, FAGE, and butter; broccoli is the green vegetable."
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
              "amount": 125,
              "unit": "g",
              "station": "Cold Prep & Produce",
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
              "key": "butter",
              "sourceKey": "butter",
              "name": "Butter",
              "amount": 5,
              "unit": "g",
              "station": "Sauces & Dairy",
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
            "Lean uses 240g raw steak; Bulk uses 300g.",
            "The mashed-potato side uses measured Fairlife milk, FAGE, and butter; broccoli is the green vegetable."
          ]
        }
      }
    },
    "d1": {
      "name": "Cookie Dough Cup",
      "category": "Dessert",
      "status": "Keep",
      "recommendation": "19.5g powder resolves the old scoop ambiguity.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "cottage",
              "sourceKey": "cottage",
              "name": "H-E-B fat-free cottage cheese",
              "amount": 113,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "whey",
              "sourceKey": "whey",
              "name": "Premier Protein powder, vanilla/chocolate",
              "amount": 19.5,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "oats",
              "sourceKey": "oats",
              "name": "Old-fashioned rolled oats",
              "amount": 45,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "peanut_butter",
              "sourceKey": "peanut_butter",
              "name": "Creamy peanut butter",
              "amount": 16,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "honey",
              "sourceKey": "honey",
              "name": "Honey",
              "amount": 7,
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
              "key": "chocolate_chips",
              "sourceKey": "chocolate_chips",
              "name": "Mini semisweet chocolate chips",
              "amount": 14,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "medium"
            }
          ],
          "confidence": "medium",
          "assumptions": [
            "One physical Premier scoop is 19.5g, not the full 39g two-scoop label serving.",
            "Oats are ground into oat flour."
          ]
        }
      }
    },
    "d2": {
      "name": "Lotus Biscoff Cheesecake",
      "category": "Dessert",
      "status": "Test",
      "recommendation": "Reduced-calorie 395-calorie prototype: verify Biscoff flavor, crumb structure, sweetness, and day-three texture; exact Biscoff labels preferred.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "cottage",
              "sourceKey": "cottage",
              "name": "H-E-B fat-free cottage cheese",
              "amount": 113,
              "unit": "g",
              "station": "Sauces & Dairy",
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
              "key": "whey",
              "sourceKey": "whey",
              "name": "Premier Protein powder, vanilla/chocolate",
              "amount": 19.5,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "biscoff_spread",
              "sourceKey": "biscoff_spread",
              "name": "Lotus Biscoff cookie butter",
              "amount": 15,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "powdered_sugar",
              "sourceKey": "powdered_sugar",
              "name": "Powdered sugar",
              "amount": 3,
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
              "key": "biscoff_cookie",
              "sourceKey": "biscoff_cookie",
              "name": "Lotus Biscoff cookie",
              "amount": 2,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "medium"
            },
            {
              "key": "fairlife_milk",
              "sourceKey": "fairlife_milk",
              "name": "Fairlife fat-free ultra-filtered milk",
              "amount": 10,
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
              "key": "salt",
              "sourceKey": "salt",
              "name": "Table salt",
              "amount": 0.2,
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
            "One physical Premier scoop is 19.5g.",
            "Two crushed cookies form the crumb layer; measured Fairlife replaces the old butter binder.",
            "Use 10g cookie butter in the filling and 5g as the top swirl.",
            "The revised cup removes the old butter and honey and reduces cookie butter from 32g to 15g."
          ]
        }
      }
    },
    "d3": {
      "name": "Banana Cream Pie Cup",
      "category": "Dessert",
      "status": "Keep",
      "recommendation": "Exact pudding packet serving weight required before label lock.",
      "tiers": {
        "single": {
          "ingredients": [
            {
              "key": "fage",
              "sourceKey": "fage",
              "name": "FAGE Total 0%",
              "amount": 170,
              "unit": "g",
              "station": "Sauces & Dairy",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "banana_pudding_mix",
              "sourceKey": "banana_pudding_mix",
              "name": "Sugar-free banana pudding mix",
              "amount": 7.5,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "low"
            },
            {
              "key": "whey",
              "sourceKey": "whey",
              "name": "Premier Protein powder, vanilla/chocolate",
              "amount": 9.75,
              "unit": "g",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "banana",
              "sourceKey": "banana",
              "name": "Banana, raw",
              "amount": 59,
              "unit": "g",
              "station": "Cold Prep & Produce",
              "note": "",
              "confidence": "high"
            },
            {
              "key": "biscoff_cookie",
              "sourceKey": "biscoff_cookie",
              "name": "Lotus Biscoff cookie",
              "amount": 2,
              "unit": "each",
              "station": "Breakfast & Desserts",
              "note": "",
              "confidence": "medium"
            }
          ],
          "confidence": "low",
          "assumptions": [
            "Historical half-scoop becomes 9.75g Premier powder.",
            "Half a medium banana is modeled as 59g edible fruit."
          ]
        }
      }
    }
  }
};

if (typeof window !== 'undefined') window.PRPD_PRODUCTION_DATA = PRPD_PRODUCTION_DATA;
if (typeof module !== 'undefined' && module.exports) module.exports = PRPD_PRODUCTION_DATA;
