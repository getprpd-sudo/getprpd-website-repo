// Static Batch18 review draft. Does not load or overwrite the active menu.
const ORDER_CONFIG = {
  "batch": {
    "number": 18,
    "published": false,
    "remindersEnabled": false,
    "deliveryDate": "Saturday, November 7, 2026",
    "cutoffIso": "2026-11-04T18:00:00-06:00",
    "cutoffLabel": "Wednesday at 6:00 PM CT",
    "labelProduction": {
      "madeDate": "",
      "useByDate": "",
      "batchId": "B18",
      "refrigeratedDays": 5,
      "dateBasis": "earliest-prepared-component",
      "plannedComponentDate": "2026-11-05",
      "actualComponentDatesRequired": true
    }
  },
  "policies": {
    "minimumOrder": 60,
    "freeDeliveryThreshold": 85,
    "deliveryFee": 9.99,
    "deliveryZones": {
      "pickup": {
        "id": "pickup",
        "label": "Pickup",
        "city": "The Colony",
        "state": "TX",
        "minimumOrder": 50,
        "freeDeliveryThreshold": 50,
        "deliveryFee": 0
      },
      "core": {
        "id": "core",
        "label": "Local Delivery",
        "minimumOrder": 60,
        "freeDeliveryThreshold": 85,
        "deliveryFee": 9.99
      },
      "regional": {
        "id": "regional",
        "label": "Regional Delivery",
        "minimumOrder": 70,
        "freeDeliveryThreshold": 100,
        "deliveryFee": 12.99
      },
      "extended": {
        "id": "extended",
        "label": "Extended Delivery",
        "minimumOrder": 100,
        "freeDeliveryThreshold": 135,
        "deliveryFee": 14.99
      }
    },
    "maxQtyPerItem": 50,
    "maxTotalItems": 250
  },
  "sauceProgram": {
    "enabled": true,
    "allowanceMode": "meal-tiered",
    "servingGrams": 40,
    "extraPrice": 1,
    "maxExtraCups": 50,
    "taxClass": "taxable-prepared-food",
    "policyStatus": "One free optional 40 g sauce cup per two eligible meals, rounded up. Additional selected cups are $1 each. Recipe-required cups are included separately.",
    "choices": [
      {
        "id": "cucumber-dill-tzatziki",
        "componentRef": "cucumber-dill-tzatziki",
        "name": "Cucumber Dill Tzatziki",
        "image": "/assets/images/sauces/cucumber-dill-tzatziki-concept.png",
        "imageStatus": "concept",
        "gramsPerCup": 40,
        "batchSizeCups": 5,
        "batchInputGrams": 200,
        "batchIngredients": [
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
        ],
        "customerIngredients": "Nonfat Greek yogurt, cucumber, lemon juice, olive oil, dill, garlic, salt, mint and black pepper.",
        "allergens": "CONTAINS: MILK.",
        "newThisWeek": true
      },
      {
        "id": "mango-chipotle-lime",
        "componentRef": "mango-chipotle-lime",
        "name": "Mango Chipotle Lime",
        "image": "/assets/images/sauces/mango-chipotle-lime-concept.png",
        "imageStatus": "concept",
        "gramsPerCup": 40,
        "batchSizeCups": 5,
        "batchInputGrams": 200,
        "batchIngredients": [
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
        ],
        "customerIngredients": "Mango, lime juice, Roland chipotle peppers in adobo sauce, honey, apple cider vinegar, garlic and salt.",
        "allergens": "",
        "newThisWeek": true
      },
      {
        "id": "lemon-tahini",
        "componentRef": "lemon-tahini",
        "name": "Lemon Tahini",
        "image": "/assets/images/sauces/lemon-tahini-concept.png",
        "imageStatus": "concept",
        "gramsPerCup": 40,
        "batchSizeCups": 5,
        "batchInputGrams": 200,
        "batchIngredients": [
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
        ],
        "customerIngredients": "Tahini (sesame), water, lemon juice, garlic, salt, cumin and black pepper.",
        "allergens": "CONTAINS: SESAME.",
        "newThisWeek": true
      }
    ],
    "creditsByDishId": {},
    "reservedByDishId": {}
  },
  "promotions": {
    "remote": true,
    "codes": [
      {
        "code": "WELCOME10",
        "partner": "PRPD First-Order Acquisition",
        "type": "fixed",
        "value": 10,
        "maxDiscount": 10,
        "minimumOrder": 60,
        "firstOrderOnly": true,
        "maxRedemptions": 50,
        "active": true
      }
    ]
  },
  "prices": {
    "standard": {
      "lean": 10.99,
      "bulk": 12.99
    },
    "beef": {
      "lean": 13.99,
      "bulk": 15.99
    },
    "premium": {
      "lean": 24.99,
      "bulk": 31.99
    },
    "dessert": {
      "single": 6.99
    },
    "addon": {
      "single": 7.99
    },
    "seafood": {
      "lean": 14.99,
      "bulk": 16.99
    },
    "thai": {
      "lean": 15.99,
      "bulk": 18.99
    },
    "enchilada": {
      "lean": 12.99,
      "bulk": 15.99
    }
  },
  "plannerOnly": [
    {
      "id": "bw1",
      "name": "Chicken Shakshuka",
      "category": "standard",
      "description": "Chicken and eggs in a tomato-pepper sauce with bread. Available only in the Weekly Five.",
      "macros": {
        "cal": 555,
        "protein": 53,
        "carbs": 36,
        "fiber": 6,
        "fat": 23
      },
      "bulkMacros": {
        "cal": 730,
        "protein": 66,
        "carbs": 55,
        "fiber": 8,
        "fat": 28
      },
      "image": "/assets/images/meals/menu/batch-8-2026-08-29/chicken-shakshuka.webp",
      "sauceEligible": true,
      "taxClass": "exempt-reheatable-meal",
      "newThisWeek": false,
      "plannerOnly": true,
      "bundleOnly": true
    }
  ],
  "menu": {
    "breakfasts": [
      {
        "id": "b1",
        "name": "French Toast",
        "category": "standard",
        "description": "Protein French toast with strawberries, banana, whipped cream and a separate syrup cup.",
        "macros": {
          "cal": 505,
          "protein": 34,
          "carbs": 73,
          "fiber": 6,
          "fat": 8
        },
        "bulkMacros": {
          "cal": 655,
          "protein": 45,
          "carbs": 93,
          "fiber": 7,
          "fat": 11
        },
        "image": "/assets/images/meals/menu/french-toast.jpg",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false,
        "sideCupComponents": [
          {
            "name": "Sugar-free maple syrup",
            "batchGroup": "maple-syrup",
            "cupsPerMeal": 1,
            "gramsPerMeal": 30
          }
        ]
      },
      {
        "id": "b2",
        "name": "Breakfast Quesadilla",
        "category": "standard",
        "description": "Seasoned chicken thighs, egg, egg whites and mozzarella in toasted tortillas.",
        "macros": {
          "cal": 450,
          "protein": 57,
          "carbs": 41,
          "fiber": 30,
          "fat": 17
        },
        "bulkMacros": {
          "cal": 595,
          "protein": 75,
          "carbs": 61,
          "fiber": 45,
          "fat": 22
        },
        "image": "/assets/images/meals/menu/breakfast-quesadilla-lean.jpg",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false,
        "bulkImage": "/assets/images/meals/menu/breakfast-quesadilla-bulk.jpg"
      },
      {
        "id": "b3",
        "name": "Beef Breakfast Skillet",
        "category": "beef",
        "description": "Seasoned ground beef, eggs, mozzarella and potato hash.",
        "macros": {
          "cal": 565,
          "protein": 59,
          "carbs": 23,
          "fiber": 3,
          "fat": 25
        },
        "bulkMacros": {
          "cal": 790,
          "protein": 83,
          "carbs": 24,
          "fiber": 3,
          "fat": 39
        },
        "image": "/assets/images/meals/menu/beef-breakfast-skillet.jpg",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false
      }
    ],
    "mains": [
      {
        "id": "m1",
        "name": "Creamy Chicken Parmesan",
        "category": "standard",
        "description": "Whole breaded chicken thigh topped with mozzarella, served with protein pasta in creamy tomato-Parmesan sauce.",
        "macros": {
          "cal": 660,
          "protein": 69,
          "carbs": 49,
          "fiber": 8,
          "fat": 22
        },
        "bulkMacros": {
          "cal": 935,
          "protein": 100,
          "carbs": 66,
          "fiber": 11,
          "fat": 32
        },
        "image": "",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false
      },
      {
        "id": "m2",
        "name": "Loaded Buffalo Chicken Potato",
        "category": "standard",
        "description": "Buffalo chicken thighs over a loaded potato with broccoli.",
        "macros": {
          "cal": 520,
          "protein": 44,
          "carbs": 44,
          "fiber": 7,
          "fat": 19
        },
        "bulkMacros": {
          "cal": 600,
          "protein": 54,
          "carbs": 46,
          "fiber": 8,
          "fat": 23
        },
        "image": "/assets/images/meals/menu/batch-13-2026-10-03/loaded-buffalo-chicken-potato-batch-13.jpg",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false,
        "imageCrop": "rotate-180-close"
      },
      {
        "id": "m3",
        "name": "Mediterranean Chicken Bowl",
        "category": "standard",
        "description": "Chicken and rice with a separate cold mix of cucumber, tomato, hummus, feta, olives and onion.",
        "macros": {
          "cal": 620,
          "protein": 49,
          "carbs": 51,
          "fiber": 5,
          "fat": 24
        },
        "bulkMacros": {
          "cal": 825,
          "protein": 65,
          "carbs": 67,
          "fiber": 7,
          "fat": 32
        },
        "image": "",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false
      },
      {
        "id": "m4",
        "name": "Thai Basil Beef + Jasmine Rice",
        "category": "thai",
        "description": "Garlic-chili minced beef with basil, jasmine rice and roasted green beans. Contains fish from anchovy fish sauce.",
        "macros": {
          "cal": 610,
          "protein": 49,
          "carbs": 48,
          "fiber": 4,
          "fat": 24
        },
        "bulkMacros": {
          "cal": 890,
          "protein": 71,
          "carbs": 72,
          "fiber": 7,
          "fat": 34
        },
        "image": "",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": true
      },
      {
        "id": "m5",
        "name": "Chicken Enchilada Bake",
        "category": "enchilada",
        "description": "Chicken, corn and tortillas baked in enchilada sauce with cheese.",
        "macros": {
          "cal": 565,
          "protein": 61,
          "carbs": 60,
          "fiber": 34,
          "fat": 20
        },
        "bulkMacros": {
          "cal": 830,
          "protein": 91,
          "carbs": 90,
          "fiber": 52,
          "fat": 30
        },
        "image": "/assets/images/meals/menu/batch-15-2026-10-17/chicken-enchilada-bake.jpg",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false,
        "imageCrop": "landscape-meal-close"
      },
      {
        "id": "m6",
        "name": "Lemon Pepper Tilapia with Garlic Potatoes",
        "category": "seafood",
        "description": "Lemon-pepper tilapia with garlic potatoes and broccoli.",
        "macros": {
          "cal": 510,
          "protein": 55,
          "carbs": 54,
          "fiber": 8,
          "fat": 10
        },
        "bulkMacros": {
          "cal": 675,
          "protein": 74,
          "carbs": 69,
          "fiber": 11,
          "fat": 14
        },
        "image": "/assets/images/meals/menu/batch-15-2026-10-17/lemon-pepper-tilapia.jpg",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false,
        "imageCrop": "landscape-meal-close"
      }
    ],
    "premium": [
      {
        "id": "m7",
        "name": "Rosemary-Garlic Lamb Shoulder",
        "category": "premium",
        "description": "Slow-roasted rosemary-garlic lamb shoulder with garlic mash and green beans.",
        "macros": {
          "cal": 785,
          "protein": 42,
          "carbs": 34,
          "fiber": 5,
          "fat": 54
        },
        "bulkMacros": {
          "cal": 1025,
          "protein": 55,
          "carbs": 44,
          "fiber": 6,
          "fat": 71
        },
        "image": "",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": true
      }
    ],
    "addons": [
      {
        "id": "a1",
        "name": "Chicken Tikka Snack Wrap",
        "category": "addon",
        "description": "Chicken tikka, crisp salad and incorporated Garlic Herb Yogurt in one tortilla.",
        "macros": {
          "cal": 220,
          "protein": 25,
          "carbs": 24,
          "fiber": 16,
          "fat": 8
        },
        "bulkMacros": null,
        "image": "/assets/images/meals/menu/batch-13-2026-10-03/chicken-tikka-snack-wrap-batch-13.jpg",
        "sauceEligible": true,
        "taxClass": "taxable-prepared-food",
        "newThisWeek": false,
        "price": 7.99,
        "incorporatedSauces": [
          {
            "name": "PRPD Garlic Herb Yogurt",
            "componentRef": "garlic-herb-yogurt",
            "gramsPerServing": 25,
            "delivery": "incorporated"
          }
        ],
        "imageCrop": "landscape-wrap-close"
      },
      {
        "id": "a2",
        "name": "Oven-Baked Popcorn Chicken",
        "category": "addon",
        "description": "Bite-size chicken thighs in a seasoned cornflake coating, oven-baked. Choose any dip separately.",
        "macros": {
          "cal": 360,
          "protein": 34,
          "carbs": 26,
          "fiber": 1,
          "fat": 13
        },
        "bulkMacros": null,
        "image": "",
        "sauceEligible": true,
        "taxClass": "taxable-prepared-food",
        "newThisWeek": false,
        "price": 7.99
      },
      {
        "id": "a3",
        "name": "Lemon-Feta Chickpea & Edamame Crunch Box",
        "category": "addon",
        "description": "A chilled box of chickpeas, edamame, crunchy vegetables, feta and lemon dressing.",
        "macros": {
          "cal": 335,
          "protein": 21,
          "carbs": 28,
          "fiber": 10,
          "fat": 17
        },
        "bulkMacros": null,
        "image": "",
        "sauceEligible": true,
        "taxClass": "taxable-prepared-food",
        "newThisWeek": true,
        "price": 7.99
      },
      {
        "id": "dr1",
        "name": "Strawberry Protein Shake",
        "category": "addon",
        "price": 7.99,
        "description": "Strawberry, banana, fat-free milk, Greek yogurt and unflavored whey, finished with strawberry pieces.",
        "servingGrams": 330,
        "macros": {
          "cal": 235,
          "protein": 25,
          "carbs": 32,
          "fiber": 3,
          "fat": 2
        },
        "bulkMacros": null,
        "image": "",
        "newThisWeek": true,
        "sauceEligible": false,
        "taxClass": "taxable-prepared-food",
        "allergens": "CONTAINS: MILK."
      }
    ],
    "desserts": [],
    "exclusives": [
      {
        "id": "x0",
        "name": "Weekly Five: Mediterranean Chicken + Chicken Shakshuka",
        "category": "bundle",
        "price": 49.95,
        "servingCount": 5,
        "sauceEligible": true,
        "description": "Five meals with Mediterranean Chicken Bowl and bundle-exclusive Chicken Shakshuka. Choose Lean or Bulk and your 3/2 split.",
        "taxClass": "exempt-reheatable-meal",
        "variants": [
          {
            "id": "lean-med3-shak2",
            "label": "Lean: 3 Mediterranean Chicken + 2 Chicken Shakshuka",
            "price": 49.95,
            "components": [
              {
                "id": "m3",
                "tier": "lean",
                "qty": 3
              },
              {
                "id": "bw1",
                "tier": "lean",
                "qty": 2
              }
            ]
          },
          {
            "id": "lean-med2-shak3",
            "label": "Lean: 2 Mediterranean Chicken + 3 Chicken Shakshuka",
            "price": 49.95,
            "components": [
              {
                "id": "m3",
                "tier": "lean",
                "qty": 2
              },
              {
                "id": "bw1",
                "tier": "lean",
                "qty": 3
              }
            ]
          },
          {
            "id": "bulk-med3-shak2",
            "label": "Bulk: 3 Mediterranean Chicken + 2 Chicken Shakshuka",
            "price": 59.95,
            "components": [
              {
                "id": "m3",
                "tier": "bulk",
                "qty": 3
              },
              {
                "id": "bw1",
                "tier": "bulk",
                "qty": 2
              }
            ]
          },
          {
            "id": "bulk-med2-shak3",
            "label": "Bulk: 2 Mediterranean Chicken + 3 Chicken Shakshuka",
            "price": 59.95,
            "components": [
              {
                "id": "m3",
                "tier": "bulk",
                "qty": 2
              },
              {
                "id": "bw1",
                "tier": "bulk",
                "qty": 3
              }
            ]
          }
        ],
        "image": ""
      }
    ]
  },
  "tax": {
    "enabled": false,
    "rate": 0.0825,
    "jurisdictionLabel": "Texas state and local sales tax",
    "deliveryMode": "proportional",
    "taxableClasses": [
      "taxable-prepared-food"
    ]
  },
  "release": {
    "status": "local-review-draft",
    "websiteApproved": false,
    "recipeTestWaiverDate": "2026-11-02",
    "nutritionBasis": "Owner-authorized recipe calculations; no physical taste or yield pass claimed.",
    "actualComponentDatesVerified": false
  }
};
if(typeof window!=="undefined")window.PRPD_ORDER_CONFIG=ORDER_CONFIG;
if(typeof module!=="undefined"&&module.exports)module.exports=ORDER_CONFIG;
