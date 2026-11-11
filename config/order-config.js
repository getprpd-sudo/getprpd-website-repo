const ORDER_CONFIG = {
  "batch": {
    "number": 19,
    "published": true,
    "remindersEnabled": false,
    "deliveryDate": "Saturday, November 14, 2026",
    "cutoffIso": "2026-11-11T18:00:00-06:00",
    "cutoffLabel": "Wednesday at 6:00 PM CT",
    "labelProduction": {
      "madeDate": "",
      "useByDate": "",
      "batchId": "B19-1114",
      "completedAt": null,
      "refrigeratedDays": 5,
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
    "codes": []
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
    },
    "wings": {
      "lean": 14.99,
      "bulk": 17.99
    }
  },
  "plannerOnly": [
    {
      "id": "p1",
      "name": "High-Protein Beef Kofta & Roasted Vegetables",
      "aliases": [
        "96/4 Beef Kofta",
        "96/4 Beef Kofta Meal",
        "Beef Kofta",
        "Beef Kafta",
        "Custom Drained Ground Beef Mince",
        "Custom Drained Ground Beef Mince Meal"
      ],
      "category": "standard",
      "plannerOnly": true
    },
    {
      "id": "p2",
      "name": "Custom Lean Chicken Mince",
      "aliases": [
        "Custom Lean Chicken Mince Meal",
        "Custom Chicken Breast Mince",
        "Chicken Breast Mince"
      ],
      "category": "standard",
      "plannerOnly": true
    },
    {
      "id": "p3",
      "name": "Custom Lebanese-Style Chicken Breast",
      "aliases": [
        "Custom Lebanese-Style Chicken Breast Meal",
        "Custom Lebanese Chicken + Fattoush-Style Salad"
      ],
      "category": "standard",
      "plannerOnly": true
    }
  ],
  "menu": {
    "breakfasts": [
      {
        "id": "b1",
        "name": "Grilled Cheese Breakfast Burrito",
        "category": "beef",
        "laterWeek": true,
        "description": "Seasoned beef, eggs, egg whites, cheese, and onion in grilled high-fiber tortillas, with no added salt.",
        "macros": {
          "cal": 465,
          "protein": 52,
          "carbs": 45,
          "fiber": 31,
          "fat": 20
        },
        "bulkMacros": {
          "cal": 645,
          "protein": 72,
          "carbs": 64,
          "fiber": 46,
          "fat": 27
        },
        "nutritionReview": true,
        "nutritionStatus": "source-generated-medium-confidence-pending-actual-90-10-yield-current-tortilla-panels-and-container-fit",
        "taxClass": "exempt-reheatable-meal",
        "image": "/assets/images/meals/menu/batch-6-2026-08-15/grilled-cheese-breakfast-burrito.webp",
        "ownerApproved": true,
        "newThisWeek": false
      },
      {
        "id": "b2",
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
      },
      {
        "id": "b3",
        "name": "Beef Bacon Breakfast Pizza",
        "category": "beef",
        "description": "One rectangular breakfast pizza per meal with Sharifa halal beef bacon, eggs, peppers, house tomato sauce and H-E-B fat-free mozzarella. Bulk is larger with extra toppings.",
        "macros": {
          "cal": 450,
          "protein": 36,
          "carbs": 54,
          "fiber": 3,
          "fat": 10
        },
        "bulkMacros": {
          "cal": 580,
          "protein": 51,
          "carbs": 68,
          "fiber": 3,
          "fat": 12
        },
        "image": "",
        "newThisWeek": true,
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal"
      }
    ],
    "mains": [
      {
        "id": "m1",
        "name": "BBQ Chicken Mac & Cheese",
        "category": "standard",
        "laterWeek": true,
        "description": "BBQ chicken thighs with high-protein macaroni and cheese, H-E-B fat-free mozzarella, and one included matching 30 g BBQ sauce cup.",
        "macros": {
          "cal": 495,
          "protein": 56,
          "carbs": 37,
          "fiber": 3,
          "fat": 14
        },
        "bulkMacros": {
          "cal": 635,
          "protein": 72,
          "carbs": 44,
          "fiber": 4,
          "fat": 19
        },
        "nutritionReview": true,
        "nutritionStatus": "source-generated-medium-confidence-pending-chicken-and-mac-yields",
        "taxClass": "exempt-reheatable-meal",
        "image": "/assets/images/meals/menu/bbq-chicken-mac-and-cheese-lean.jpg",
        "ownerApproved": true,
        "newThisWeek": false,
        "sideCupComponents": [
          {
            "name": "Matching BBQ sauce",
            "batchGroup": "bbq-sauce",
            "cupsPerMeal": 1,
            "gramsPerMeal": 30
          }
        ]
      },
      {
        "id": "m2",
        "name": "Mexican Streetcorn Chicken Bowl",
        "category": "standard",
        "description": "Chicken, basmati rice, and creamy Mexican street corn.",
        "macros": {
          "cal": 590,
          "protein": 48,
          "carbs": 53,
          "fiber": 3,
          "fat": 21
        },
        "bulkMacros": {
          "cal": 785,
          "protein": 65,
          "carbs": 70,
          "fiber": 4,
          "fat": 27
        },
        "image": "/assets/images/meals/menu/mexican-streetcorn-chicken-bowl-v2.jpg",
        "newThisWeek": false,
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal"
      },
      {
        "id": "m3",
        "name": "Cheesy Achiote Chicken Tacos",
        "category": "standard",
        "macros": {
          "cal": 535,
          "protein": 55,
          "carbs": 32,
          "fiber": 4,
          "fat": 19
        },
        "bulkMacros": {
          "cal": 710,
          "protein": 73,
          "carbs": 43,
          "fiber": 5,
          "fat": 26
        },
        "description": "Achiote-citrus chicken thighs, melted cheese, pickled onion, Cotija, and cilantro in street-size corn tortillas.",
        "image": "",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open"
      },
      {
        "id": "m4",
        "name": "High-Protein Beef Lasagna",
        "category": "beef",
        "laterWeek": true,
        "description": "Halal 90/10 beef, house tomato sauce, ricotta, mozzarella, Parmesan, and oven-ready pasta.",
        "macros": {
          "cal": 530,
          "protein": 51,
          "carbs": 38,
          "fiber": 5,
          "fat": 19
        },
        "bulkMacros": {
          "cal": 710,
          "protein": 67,
          "carbs": 51,
          "fiber": 7,
          "fat": 26
        },
        "nutritionStatus": "controlled-12-sheet-recipe-calculation",
        "taxClass": "exempt-reheatable-meal",
        "image": "/assets/images/meals/menu/high-protein-beef-lasagna.webp",
        "newThisWeek": false
      },
      {
        "id": "m5",
        "name": "Garlic Butter Wild Argentine Shrimp + Rice",
        "category": "seafood",
        "macros": {
          "cal": 455,
          "protein": 43,
          "carbs": 57,
          "fiber": 4,
          "fat": 7
        },
        "bulkMacros": {
          "cal": 615,
          "protein": 58,
          "carbs": 75,
          "fiber": 6,
          "fat": 10
        },
        "description": "Garlic-butter Wild Argentine red shrimp with basmati rice, zucchini, and peas and carrots.",
        "image": "/assets/images/meals/menu/batch-6-2026-08-15/garlic-butter-shrimp-and-rice.jpg",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open",
        "imageStatus": "Historical library photo; updated Wild Argentine plating photo pending"
      },
      {
        "id": "m6",
        "name": "Mango Habanero Chicken Wings",
        "category": "wings",
        "description": "Six split wings in Lean or eight in Bulk, with mango habanero glaze, an extra mango dip and a low-calorie ranch cup included.",
        "macros": {
          "cal": 585,
          "protein": 43,
          "carbs": 14,
          "fiber": 1,
          "fat": 38
        },
        "bulkMacros": {
          "cal": 750,
          "protein": 58,
          "carbs": 15,
          "fiber": 1,
          "fat": 49
        },
        "image": "",
        "newThisWeek": true,
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "sideCupComponents": [
          {
            "name": "Low-calorie ranch",
            "batchGroup": "wing-ranch",
            "cupsPerMeal": 1,
            "gramsPerMeal": 40
          },
          {
            "name": "Mango habanero dip",
            "batchGroup": "mango-habanero-dip",
            "cupsPerMeal": 1,
            "gramsPerMeal": 20
          }
        ]
      }
    ],
    "premium": [
      {
        "id": "m7",
        "name": "Braised Beef Short Rib",
        "category": "premium",
        "displayCategory": "Premium Meal",
        "description": "Boneless slow-braised beef short rib with garlic-rosemary Idahoan Original mash, roasted garlic green beans, and reduced pan jus.",
        "macros": {
          "cal": 760,
          "protein": 39,
          "carbs": 45,
          "fiber": 7,
          "fat": 46
        },
        "bulkMacros": {
          "cal": 1015,
          "protein": 52,
          "carbs": 60,
          "fiber": 10,
          "fat": 62
        },
        "nutritionReview": true,
        "nutritionStatus": "source-generated-medium-confidence-pending-reviewed-actual-raw-bone-in-to-edible-yield",
        "taxClass": "exempt-reheatable-meal",
        "image": "/assets/images/meals/menu/batch-15-2026-10-17/braised-beef-short-rib.jpg",
        "imageCrop": "rotate-180-low",
        "ownerApproved": true,
        "newThisWeek": false
      }
    ],
    "addons": [
      {
        "id": "a1",
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
        "image": "/assets/images/meals/menu/batch-18-2026-11-07/oven-baked-popcorn-chicken.jpg",
        "imageCrop": "landscape-tight",
        "sauceEligible": true,
        "taxClass": "taxable-prepared-food",
        "newThisWeek": false,
        "price": 7.99
      },
      {
        "id": "a2",
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
        "imageCrop": "landscape-wrap-raised"
      },
      {
        "id": "a3",
        "name": "Mediterranean Chicken Hummus Box",
        "category": "addon",
        "price": 7.99,
        "description": "Chilled chicken thighs, hummus, flatbread, cucumber, tomato, feta, olives, and onion.",
        "macros": {
          "cal": 445,
          "protein": 31,
          "carbs": 40,
          "fiber": 5,
          "fat": 18
        },
        "nutritionReview": true,
        "nutritionStatus": "source-generated-medium-confidence-pending-current-package-and-hold-review",
        "taxClass": "taxable-prepared-food",
        "image": "/assets/images/meals/menu/batch-8-2026-08-29/mediterranean-chicken-hummus-box.webp",
        "imageCrop": "portrait-low",
        "ownerApproved": true,
        "newThisWeek": false
      },
      {
        "id": "dr1",
        "name": "Strawberry Protein Shake",
        "category": "addon",
        "price": 7.99,
        "description": "Strawberry, banana, fat-free milk, Greek yogurt and unflavored whey, finished with strawberry pieces.",
        "servingGrams": 330,
        "macros": {
          "cal": 240,
          "protein": 25,
          "carbs": 32,
          "fiber": 3,
          "fat": 2
        },
        "bulkMacros": null,
        "image": "/assets/images/meals/menu/batch-19-2026-11-14/strawberry-protein-shake.webp",
        "newThisWeek": false,
        "sauceEligible": false,
        "taxClass": "taxable-prepared-food",
        "allergens": "CONTAINS: MILK."
      }
    ],
    "desserts": [],
    "exclusives": [
      {
        "id": "x0",
        "name": "Weekly Five: BBQ Mac + Mexican Streetcorn",
        "category": "bundle",
        "price": 49.95,
        "servingCount": 5,
        "sauceEligible": true,
        "description": "Five chicken meals: BBQ Chicken Mac & Cheese and Mexican Streetcorn Chicken Bowl. Pick Lean or Bulk, then choose your 3/2 split. No substitutions.",
        "taxClass": "exempt-reheatable-meal",
        "image": "",
        "variants": [
          {
            "id": "lean-mac3-corn2",
            "label": "Lean: 3 BBQ Mac + 2 Streetcorn Chicken",
            "price": 49.95,
            "components": [
              {
                "id": "m1",
                "tier": "lean",
                "qty": 3
              },
              {
                "id": "m2",
                "tier": "lean",
                "qty": 2
              }
            ]
          },
          {
            "id": "lean-mac2-corn3",
            "label": "Lean: 2 BBQ Mac + 3 Streetcorn Chicken",
            "price": 49.95,
            "components": [
              {
                "id": "m1",
                "tier": "lean",
                "qty": 2
              },
              {
                "id": "m2",
                "tier": "lean",
                "qty": 3
              }
            ]
          },
          {
            "id": "bulk-mac3-corn2",
            "label": "Bulk: 3 BBQ Mac + 2 Streetcorn Chicken",
            "price": 59.95,
            "components": [
              {
                "id": "m1",
                "tier": "bulk",
                "qty": 3
              },
              {
                "id": "m2",
                "tier": "bulk",
                "qty": 2
              }
            ]
          },
          {
            "id": "bulk-mac2-corn3",
            "label": "Bulk: 2 BBQ Mac + 3 Streetcorn Chicken",
            "price": 59.95,
            "components": [
              {
                "id": "m1",
                "tier": "bulk",
                "qty": 2
              },
              {
                "id": "m2",
                "tier": "bulk",
                "qty": 3
              }
            ]
          }
        ]
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
    "status": "published",
    "websiteApproved": true,
    "recipeTestWaiverDate": "2026-11-09",
    "nutritionBasis": "Owner-authorized recipe-calculated estimates; physical taste and yield observations may prompt revisions.",
    "actualComponentDatesVerified": false,
    "approvedByOwner": true,
    "approvalRecordedAt": "2026-11-09",
    "approvalScope": "Owner selected the full menu and explicitly directed immediate publication while pizza and drink photographs are in progress; mango lassi deferred to next week.",
    "adsActivationAuthorized": true
  }
};
if(typeof window!=="undefined")window.PRPD_ORDER_CONFIG=ORDER_CONFIG;
if(typeof module!=="undefined"&&module.exports)module.exports=ORDER_CONFIG;
