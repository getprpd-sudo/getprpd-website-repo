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
        "description": "Creamy yogurt, jalapeÃ±o, garlic and fresh herbs",
        "steps": [
          "Blend the displayed yogurt, light mayonnaise, lemon, cilantro, jalapeÃ±o, garlic, parsley, salt and cumin until smooth. Do not add water.",
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
        "customerIngredients": "Nonfat Greek yogurt, light mayonnaise, lemon, cilantro, jalapeÃ±o, garlic, parsley, salt, and cumin.",
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
        "id": "b2",
        "name": "Blueberry Vanilla Protein Baked Oatmeal Squares",
        "category": "standard",
        "macros": {
          "cal": 435,
          "protein": 31,
          "carbs": 61,
          "fiber": 8,
          "fat": 8
        },
        "bulkMacros": {
          "cal": 655,
          "protein": 47,
          "carbs": 91,
          "fiber": 12,
          "fat": 12
        },
        "description": "Blueberry-vanilla baked oatmeal squares with egg whites, Greek yogurt, banana, and protein powder.",
        "image": "",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open"
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
        "image": "",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open"
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
        "image": "",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open"
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
        "id": "a1",
        "name": "BBQ Chicken Lavash Flatbread",
        "category": "addon",
        "macros": {
          "cal": 420,
          "protein": 52,
          "carbs": 26,
          "fiber": 9,
          "fat": 13
        },
        "bulkMacros": null,
        "description": "Four smoky honey-lime BBQ chicken lavash wedges with fat-free mozzarella and red onion.",
        "image": "",
        "newThisWeek": false,
        "nutritionReview": true,
        "nutritionStatus": "Controlled calculation; physical yield and finished-weight verification remain open",
        "price": 7.99
      }
    ],
    "desserts": [],
    "exclusives": []
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
