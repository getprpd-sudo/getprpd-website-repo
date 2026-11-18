const ORDER_CONFIG = {
  "batch": {
    "number": 20,
    "published": true,
    "remindersEnabled": false,
    "deliveryDate": "Saturday, November 21, 2026",
    "cutoffIso": "2026-11-18T18:00:00-06:00",
    "cutoffLabel": "Wednesday at 6:00 PM CT",
    "labelProduction": {
      "madeDate": "2026-11-21",
      "useByDate": "2026-11-25",
      "batchId": "B20-1121",
      "completedAt": null,
      "dateBasis": "owner-approved-advance-print",
      "advancePrintApproved": true,
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
    },
    {
      "id": "bw1",
      "name": "Harissa Honey Chicken",
      "category": "standard",
      "plannerOnly": true,
      "bundleOnly": true,
      "description": "Harissa-honey chicken thighs with basmati rice and roasted broccoli. Available only in the Weekly Five."
    }
  ],
  "menu": {
    "breakfasts": [
      {
        "id": "b1",
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
        "newThisWeek": false,
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal"
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
        "name": "Strawberry Cheesecake Protein Pancakes",
        "category": "standard",
        "description": "Protein pancakes with strawberries, cheesecake-yogurt topping, and sugar-free maple syrup.",
        "macros": {
          "cal": 505,
          "protein": 43,
          "carbs": 54,
          "fiber": 3,
          "fat": 12
        },
        "bulkMacros": {
          "cal": 645,
          "protein": 56,
          "carbs": 69,
          "fiber": 4,
          "fat": 15
        },
        "nutritionStatus": "Recipe estimate; package and physical yield verification pending",
        "taxClass": "exempt-reheatable-meal",
        "image": "/assets/images/meals/menu/batch-8-2026-08-29/strawberry-cheesecake-protein-pancakes.webp",
        "newThisWeek": false,
        "nutritionReview": true
      }
    ],
    "mains": [
      {
        "id": "m1",
        "name": "Hot Honey Chicken Sliders",
        "category": "standard",
        "description": "Seasoned chicken thighs, mozzarella, onion, one pickle chip per slider, and PRPD Sweet Heat on King's Hawaiian Original Sweet Rolls.",
        "macros": {
          "cal": 525,
          "protein": 37,
          "carbs": 60,
          "fiber": 2,
          "fat": 15
        },
        "bulkMacros": {
          "cal": 685,
          "protein": 46,
          "carbs": 80,
          "fiber": 3,
          "fat": 20
        },
        "nutritionReview": true,
        "nutritionStatus": "source-generated-high-confidence-pending-slider-method-75-percent-yield-current-roll-panel-container-fit-and-photo-service-reconciliation",
        "taxClass": "exempt-reheatable-meal",
        "image": "/assets/images/meals/menu/batch-6-2026-08-15/hot-honey-chicken-sliders.webp",
        "ownerApproved": true,
        "newThisWeek": false
      },
      {
        "id": "m2",
        "name": "Creamy Cajun Chicken Pasta",
        "category": "standard",
        "description": "Cajun-spiced chicken thighs and protein spaghetti in a creamy crushed-tomato sauce.",
        "macros": {
          "cal": 570,
          "protein": 52,
          "carbs": 38,
          "fiber": 9,
          "fat": 25
        },
        "bulkMacros": {
          "cal": 765,
          "protein": 71,
          "carbs": 50,
          "fiber": 12,
          "fat": 34
        },
        "nutritionStatus": "Recipe estimate; package and physical yield verification pending",
        "taxClass": "exempt-reheatable-meal",
        "image": "/assets/images/meals/menu/batch-15-2026-10-17/creamy-cajun-chicken-pasta.jpg",
        "imageCrop": "landscape-pasta-inverted-close",
        "newThisWeek": false,
        "nutritionReview": true,
        "imageStatus": "Owner actual Batch15 photo"
      },
      {
        "id": "m3",
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
        "imageCrop": "landscape-meal-inverted-close"
      },
      {
        "id": "m4",
        "name": "Southwest Beef Taco Bowl",
        "category": "beef",
        "macros": {
          "cal": 685,
          "protein": 53,
          "carbs": 62,
          "fiber": 7,
          "fat": 24
        },
        "bulkMacros": {
          "cal": 935,
          "protein": 74,
          "carbs": 81,
          "fiber": 9,
          "fat": 35
        },
        "description": "Seasoned beef, cilantro-lime rice, black beans, corn and peppers, lettuce, and cotija.",
        "image": "/assets/images/meals/menu/batch-15-2026-10-17/southwest-beef-taco-bowl.jpg",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open",
        "imageCrop": "landscape-bowl-inverted-close"
      },
      {
        "id": "m5",
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
          "cal": 885,
          "protein": 71,
          "carbs": 71,
          "fiber": 6,
          "fat": 34
        },
        "image": "/assets/images/meals/menu/batch-18-2026-11-07/thai-basil-beef-jasmine-rice.jpg",
        "imageCrop": "landscape-bowl-close",
        "sauceEligible": true,
        "taxClass": "exempt-reheatable-meal",
        "newThisWeek": false
      },
      {
        "id": "m6",
        "name": "Halal Cart Chicken + Yellow Rice",
        "category": "standard",
        "macros": {
          "cal": 490,
          "protein": 45,
          "carbs": 44,
          "fiber": 3,
          "fat": 14
        },
        "bulkMacros": {
          "cal": 645,
          "protein": 59,
          "carbs": 58,
          "fiber": 4,
          "fat": 19
        },
        "description": "Seasoned chicken thighs, yellow basmati rice, lettuce, and tomato.",
        "image": "/assets/images/meals/menu/halal-cart-chicken-yellow-rice.jpg",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open",
        "imageStatus": "Existing library photo"
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
        "imageCrop": "landscape-short-rib-low",
        "ownerApproved": true,
        "newThisWeek": false
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
        "imageCrop": "landscape-wrap-lower"
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
        "image": "/assets/images/meals/menu/batch-18-2026-11-07/oven-baked-popcorn-chicken.jpg",
        "imageCrop": "landscape-snack-close",
        "sauceEligible": true,
        "taxClass": "taxable-prepared-food",
        "newThisWeek": false,
        "price": 7.99
      },
      {
        "id": "dr1",
        "name": "Classic Mango Lassi",
        "category": "addon",
        "price": 6.99,
        "description": "Alphonso mango pulp, yogurt, milk, and honey. Chilled in our 12 oz bottle.",
        "servingGrams": 330,
        "macros": {
          "cal": 255,
          "protein": 16,
          "carbs": 48,
          "fat": 0
        },
        "bulkMacros": null,
        "image": "",
        "newThisWeek": true,
        "sauceEligible": false,
        "taxClass": "classification-pending",
        "allergens": "CONTAINS: MILK.",
        "nutritionReview": true,
        "nutritionStatus": "330 g homogeneous recipe estimate; actual Deep can panel and fill weight pending"
      }
    ],
    "desserts": [
      {
        "id": "d1",
        "name": "Chocolate Chip Cookie Drop",
        "aliases": ["Classic Chocolate Chip Cookie"],
        "category": "dessert",
      "price": 2.99,
        "description": "Our classic chocolate chip cookie, baked from a 70 g dough portion. Choose 1, 3, or 6.",
        "image": "",
        "newThisWeek": true,
        "sauceEligible": false,
        "taxClass": "exempt-bakery-item",
        "macros": {
          "cal": 315,
          "protein": 4,
          "carbs": 39,
          "fat": 16
        },
        "bulkMacros": null,
        "nutritionReview": true,
        "nutritionStatus": "Per-cookie recipe estimate; ingredient panels pending",
        "variants": [
          {
            "id": "one",
            "label": "1 cookie",
            "price": 2.99,
            "unitCount": 1
          },
          {
            "id": "three",
            "label": "3 cookies",
            "price": 7.99,
            "unitCount": 3
          },
          {
            "id": "six",
            "label": "6 cookies",
            "price": 13.99,
            "unitCount": 6
          }
        ]
      }
    ],
    "exclusives": [
      {
        "id": "x0",
        "name": "Weekly Five: Cajun + Harissa Honey",
        "category": "bundle",
        "price": 49.95,
        "servingCount": 5,
        "description": "Five meals featuring Creamy Cajun Chicken Pasta and bundle-exclusive Harissa Honey Chicken. Choose Lean or Bulk and your 3/2 split. No substitutions.",
        "taxClass": "exempt-reheatable-meal",
        "variants": [
          {
            "id": "lean-cajun3-harissa2",
            "label": "Lean: 3 Cajun Pasta + 2 Harissa Honey Chicken",
            "price": 49.95,
            "compareAtPrice": 54.95,
            "components": [
              {
                "id": "m2",
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
            "id": "lean-cajun2-harissa3",
            "label": "Lean: 2 Cajun Pasta + 3 Harissa Honey Chicken",
            "price": 49.95,
            "compareAtPrice": 54.95,
            "components": [
              {
                "id": "m2",
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
            "id": "bulk-cajun3-harissa2",
            "label": "Bulk: 3 Cajun Pasta + 2 Harissa Honey Chicken",
            "price": 59.95,
            "compareAtPrice": 64.95,
            "components": [
              {
                "id": "m2",
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
            "id": "bulk-cajun2-harissa3",
            "label": "Bulk: 2 Cajun Pasta + 3 Harissa Honey Chicken",
            "price": 59.95,
            "compareAtPrice": 64.95,
            "components": [
              {
                "id": "m2",
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
    "status": "published",
    "websiteApproved": true,
    "approvedByOwner": true,
    "approvalRecordedAt": "2026-11-16",
    "approvalScope": "Owner approved the Batch 20 full lineup, Weekly Five, $6.99 lassi, and $2.99/$7.99/$13.99 cookie packs and directed publication without new bottle or box tests.",
    "nutritionBasis": "Recipe-calculated estimates; exact packaged ingredient panels and physical packout may change numbers.",
    "actualComponentDatesVerified": false,
    "adsActivationAuthorized": false
  }
};
if(typeof window!=="undefined")window.PRPD_ORDER_CONFIG=ORDER_CONFIG;
if(typeof module!=="undefined"&&module.exports)module.exports=ORDER_CONFIG;
