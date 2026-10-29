const ORDER_CONFIG = {
  "batch": {
    "number": 17,
    "published": true,
    "remindersEnabled": false,
    "deliveryDate": "Saturday, October 31, 2026",
    "cutoffIso": "2026-10-28T18:00:00-05:00",
    "cutoffLabel": "Wednesday at 6:00 PM CT"
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
    "policyStatus": "Choose up to three free sauce cups per order. Additional cups are $1 each.",
    "servingGrams": 40,
    "freeCupsPerOrder": 3,
    "extraPrice": 1,
    "maxExtraCups": 50,
    "taxClass": "taxable-prepared-food",
    "choices": [
      {
        "id": "sweet-heat",
        "componentRef": "batch13-sweet-heat",
        "name": "PRPD Sweet Heat",
        "image": "/assets/images/sauces/sweet-heat-concept.png",
        "imageStatus": "concept",
        "description": "Creamy Sriracha with a sweet finish",
        "steps": [
          "Weigh the displayed light mayonnaise, ketchup, honey and Sriracha. Whisk until uniform.",
          "Fill exactly the selected count at 40 g net per cup. Record transfer loss, seal, label and refrigerate."
        ],
        "gramsPerCup": 40,
        "batchSizeCups": 5,
        "batchInputGrams": 225,
        "batchIngredients": [
          {
            "key": "light_mayo",
            "name": "Great Value light mayonnaise",
            "grams": 55,
            "station": "Sauces & Dairy"
          },
          {
            "key": "ketchup",
            "name": "Ketchup",
            "grams": 66,
            "station": "Sauces & Dairy"
          },
          {
            "key": "honey",
            "name": "Honey",
            "grams": 66,
            "station": "Sauces & Dairy"
          },
          {
            "key": "sriracha",
            "name": "Sriracha sauce",
            "grams": 38,
            "station": "Sauces & Dairy"
          }
        ],
        "customerIngredients": "Light mayonnaise, ketchup, honey, and Sriracha.",
        "allergens": "CONTAINS: EGG."
      },
      {
        "id": "garlic-herb-yogurt",
        "componentRef": "garlic-herb-yogurt",
        "name": "Garlic Herb Yogurt",
        "image": "/assets/images/sauces/garlic-herb-concept.png",
        "imageStatus": "concept",
        "description": "Creamy yogurt, jalapeno, garlic and fresh herbs",
        "steps": [
          "Blend the displayed yogurt, light mayonnaise, lemon, cilantro, jalapeno, garlic, parsley, salt and cumin until smooth. Do not add water.",
          "Fill exactly the selected count at 40 g net per cup. Record transfer loss, seal, label and refrigerate."
        ],
        "gramsPerCup": 40,
        "batchSizeCups": 5,
        "batchInputGrams": 225,
        "batchIngredients": [
          {
            "key": "fage",
            "name": "FAGE Total 0%",
            "grams": 165,
            "station": "Sauces & Dairy"
          },
          {
            "key": "light_mayo",
            "name": "Great Value light mayonnaise",
            "grams": 25,
            "station": "Sauces & Dairy"
          },
          {
            "key": "lemon",
            "name": "Lemon juice, raw",
            "grams": 10,
            "station": "Cold Prep & Produce"
          },
          {
            "key": "cilantro",
            "name": "Cilantro, raw",
            "grams": 10,
            "station": "Cold Prep & Produce"
          },
          {
            "key": "jalapeno",
            "name": "Jalapeno, raw",
            "grams": 6,
            "station": "Cold Prep & Produce"
          },
          {
            "key": "garlic",
            "name": "Garlic, raw",
            "grams": 3,
            "station": "Cold Prep & Produce"
          },
          {
            "key": "parsley",
            "name": "Flat-leaf parsley, raw",
            "grams": 3,
            "station": "Cold Prep & Produce"
          },
          {
            "key": "salt",
            "name": "Table salt",
            "grams": 2,
            "station": "Dry Prep & Seasonings"
          },
          {
            "key": "cumin",
            "name": "Ground cumin",
            "grams": 1,
            "displayMeasure": "about 1/4 tsp",
            "station": "Dry Prep & Seasonings"
          }
        ],
        "customerIngredients": "Nonfat Greek yogurt, light mayonnaise, lemon, cilantro, jalapeno, garlic, parsley, salt, and cumin.",
        "allergens": "CONTAINS: EGG, MILK."
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
      "lean": 21.99,
      "bulk": 26.99
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
        "name": "High Protein Omelette",
        "category": "standard",
        "macros": {
          "cal": 400,
          "protein": 42,
          "carbs": 29,
          "fiber": 3,
          "fat": 13
        },
        "bulkMacros": {
          "cal": 625,
          "protein": 63,
          "carbs": 51,
          "fiber": 4,
          "fat": 20
        },
        "description": "Eggs, vegetables, fat-free cheese, and sourdough.",
        "image": "/assets/images/meals/menu/high-protein-omelette.jpg",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open"
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
      },
      {
        "id": "b4",
        "name": "PRPD Beef Bacon Breakfast Sandwich",
        "category": "beef",
        "description": "Halal beef bacon, egg-and-egg-white patty, cheese, and PRPD sauce on an English muffin.",
        "macros": {
          "cal": 515,
          "protein": 36,
          "carbs": 53,
          "fiber": 4,
          "fat": 18
        },
        "bulkMacros": {
          "cal": 775,
          "protein": 65,
          "carbs": 54,
          "fiber": 2,
          "fat": 32
        },
        "nutritionStatus": "Recipe estimate; package and physical yield verification pending",
        "taxClass": "taxable-prepared-food",
        "image": "/assets/images/meals/menu/batch-6-2026-08-15/prpd-beef-bacon-breakfast-sandwich.webp",
        "newThisWeek": false,
        "nutritionReview": true
      }
    ],
    "mains": [
      {
        "id": "m1",
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
      },
      {
        "id": "m2",
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
        "id": "m3",
        "name": "Lemon Herb Chicken Orzo",
        "category": "standard",
        "macros": {
          "cal": 530,
          "protein": 47,
          "carbs": 42,
          "fiber": 4,
          "fat": 19
        },
        "bulkMacros": {
          "cal": 700,
          "protein": 61,
          "carbs": 56,
          "fiber": 6,
          "fat": 26
        },
        "description": "Chicken thighs, lemon-herb orzo, and roasted zucchini and carrots.",
        "image": "",
        "newThisWeek": true,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open"
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
        "imageCrop": "rotate-180"
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
        "newThisWeek": false,
        "nutritionReview": true,
        "imageStatus": "Owner actual Batch15 photo"
      }
    ],
    "premium": [
      {
        "id": "m7",
        "name": "Premium NY Strip Steak",
        "category": "premium",
        "macros": {
          "cal": 640,
          "protein": 57,
          "carbs": 32,
          "fiber": 4,
          "fat": 31
        },
        "bulkMacros": {
          "cal": 755,
          "protein": 70,
          "carbs": 35,
          "fiber": 5,
          "fat": 37
        },
        "description": "New York strip steak with Idahoan Original garlic mash, broccoli, and Honey Barbecue Mustard sauce.",
        "image": "/assets/images/meals/menu/batch-13-2026-10-03/premium-ny-strip-steak-mashed-potatoes-batch-13.jpg",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open",
        "imageCrop": "rotate-180"
      }
    ],
    "addons": [
      {
        "id": "a2",
        "name": "Chicken Tikka Snack Wrap",
        "category": "addon",
        "price": 7.99,
        "description": "A chilled high-fiber wrap with tikka-spiced chicken thighs, vegetables, and Garlic Herb Yogurt inside.",
        "macros": {
          "cal": 220,
          "protein": 25,
          "carbs": 24,
          "fiber": 16,
          "fat": 8
        },
        "nutritionReview": true,
        "nutritionStatus": "Recipe estimate; package and physical yield verification pending",
        "taxClass": "taxable-prepared-food",
        "image": "/assets/images/meals/menu/batch-13-2026-10-03/chicken-tikka-snack-wrap-batch-13.jpg",
        "imageCrop": "rotate-180",
        "ownerApproved": true,
        "bulkMacros": null,
        "newThisWeek": false
      },
      {
        "id": "a3",
        "name": "Buffalo Chicken Pinwheels",
        "category": "addon",
        "price": 7.99,
        "description": "Four chilled pinwheel pieces made from one 70-calorie Mission tortilla with Buffalo chicken, cream cheese, mozzarella, lettuce, and onion.",
        "macros": {
          "cal": 325,
          "protein": 31,
          "carbs": 23,
          "fiber": 16,
          "fat": 18
        },
        "nutritionReview": true,
        "nutritionStatus": "Recipe estimate; package and physical yield verification pending",
        "taxClass": "taxable-prepared-food",
        "image": "/assets/images/meals/menu/batch-8-2026-08-29/buffalo-chicken-pinwheels.webp",
        "ownerApproved": true,
        "bulkMacros": null,
        "newThisWeek": false
      },
      {
        "id": "a4",
        "name": "Oven-Baked Popcorn Chicken",
        "category": "addon",
        "price": 7.99,
        "description": "Bite-size chicken thighs in a seasoned plain cornflake coating, oven-baked with measured oil. Estimated nutrition; dip selected separately.",
        "macros": {
          "cal": 360,
          "protein": 34,
          "carbs": 26,
          "fat": 13
        },
        "bulkMacros": null,
        "image": "",
        "newThisWeek": true,
        "nutritionReview": true,
        "nutritionStatus": "Estimated per serving; excludes dip.",
        "taxClass": "taxable-prepared-food"
      }
    ],
    "desserts": [],
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
                "id": "m6",
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
                "id": "m6",
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
                "id": "m6",
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
                "id": "m6",
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
  }
};
if(typeof window!=="undefined")window.PRPD_ORDER_CONFIG=ORDER_CONFIG;
if(typeof module!=="undefined"&&module.exports)module.exports=ORDER_CONFIG;
