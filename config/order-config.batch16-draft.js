// Batch 16 internal review draft. This file is not loaded by the live order page.
const current = require('./order-config');

const draft = JSON.parse(JSON.stringify(current));

// Keep the last explicitly published menu available to the closed-menu browse
// view without exposing any staged Batch 16 item. This is review-only state;
// the live configuration remains unchanged.
if (current.batch && current.batch.published === true) {
  draft.publishedArchive = {
    published: true,
    batch: JSON.parse(JSON.stringify(current.batch)),
    menu: JSON.parse(JSON.stringify(current.menu)),
    prices: JSON.parse(JSON.stringify(current.prices)),
  };
}

draft.batch = {
  number: 16,
  published: false,
  remindersEnabled: false,
  deliveryDate: 'Saturday, October 24, 2026',
  cutoffIso: '2026-10-21T18:00:00-05:00',
  cutoffLabel: 'Wednesday at 6:00 PM CT',
  labelProduction: {
    madeDate: '2026-10-24',
    useByDate: '2026-10-28',
    batchId: 'B16-1024',
    completedAt: '2026-10-24T00:00:00-05:00',
    refrigeratedDays: 5,
  },
};

draft.sauceProgram = {
  ...draft.sauceProgram,
  enabled: true,
  policyStatus: 'Choose up to three free sauce cups per order. Additional cups are $1 each.',
  servingGrams: 40,
  freeCupsPerOrder: 3,
  extraPrice: 1.00,
  choices: JSON.parse(JSON.stringify(current.sauceProgram.choices)).map(choice => ({
    ...choice,
    customerIngredients: choice.id === 'sweet-heat'
      ? 'Light mayonnaise, ketchup, honey, and Sriracha.'
      : 'Nonfat Greek yogurt, light mayonnaise, lemon, cilantro, jalapeño, garlic, parsley, salt, and cumin.',
    allergens: choice.id === 'sweet-heat' ? 'CONTAINS: EGG.' : 'CONTAINS: EGG, MILK.',
  })),
  creditsByDishId: {},
  reservedByDishId: {},
};

// Owner reactivated the approved public first-order offer on October 19.
// Preserve the same audited terms through any subsequent Batch 16 promotion.
draft.promotions = {
  ...draft.promotions,
  codes: [
    ...(draft.promotions?.codes || []).filter(promotion => promotion.code !== 'WELCOME10'),
    {
      code: 'WELCOME10',
      partner: 'PRPD First-Order Acquisition',
      type: 'fixed',
      value: 10,
      maxDiscount: 10,
      minimumOrder: 60,
      firstOrderOnly: true,
      maxRedemptions: 50,
      active: true,
    },
  ],
};

draft.plannerOnly = [
  { id: 'bw1', name: 'Sweet Chili Chicken with Rice', category: 'standard', plannerOnly: true },
  ...current.plannerOnly.filter(item => item.id !== 'bw1'),
];

draft.menu = {
  exclusives: [{
    id: 'x0',
    name: 'Weekly Five: Butter Chicken + Sweet Chili',
    category: 'bundle',
    servingCount: 5,
    description: 'Five meals. Pick Lean or Bulk, then choose which featured dish you want three of. No substitutions.',
    taxClass: 'exempt-reheatable-meal',
    variants: [
      { id: 'lean-butter3-sweet2', label: 'Lean: 3 Butter Chicken + 2 Sweet Chili', price: 49.95, compareAtPrice: 54.95, components: [{ id: 'm2', tier: 'lean', qty: 3 }, { id: 'bw1', tier: 'lean', qty: 2 }] },
      { id: 'lean-butter2-sweet3', label: 'Lean: 2 Butter Chicken + 3 Sweet Chili', price: 49.95, compareAtPrice: 54.95, components: [{ id: 'm2', tier: 'lean', qty: 2 }, { id: 'bw1', tier: 'lean', qty: 3 }] },
      { id: 'bulk-butter3-sweet2', label: 'Bulk: 3 Butter Chicken + 2 Sweet Chili', price: 59.95, compareAtPrice: 64.95, components: [{ id: 'm2', tier: 'bulk', qty: 3 }, { id: 'bw1', tier: 'bulk', qty: 2 }] },
      { id: 'bulk-butter2-sweet3', label: 'Bulk: 2 Butter Chicken + 3 Sweet Chili', price: 59.95, compareAtPrice: 64.95, components: [{ id: 'm2', tier: 'bulk', qty: 2 }, { id: 'bw1', tier: 'bulk', qty: 3 }] },
    ],
    image: '/assets/images/meals/menu/batch-13-2026-10-03/butter-chicken-sweet-chili-bundle-overhead-batch-13.jpg',
    imageCrop: 'rotate-180',
    ownerApproved: true,
  }],
  breakfasts: [
    {
      id: 'b1', name: 'Egg Bites with Potato Hash', category: 'standard',
      description: 'Protein egg bites with roasted breakfast potatoes.',
      macros: { cal: 305, protein: 32, carbs: 27, fiber: 3, fat: 7 },
      bulkMacros: { cal: 435, protein: 48, carbs: 36, fiber: 4, fat: 10 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-tray-yield',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/egg-bites-lean.jpg',
      ownerApproved: true,
    },
    {
      id: 'b2', name: 'Grilled Cheese Breakfast Burrito', category: 'beef', laterWeek: true,
      description: 'Seasoned beef, eggs, egg whites, cheese, and onion in grilled high-fiber tortillas, with no added salt.',
      macros: { cal: 465, protein: 52, carbs: 45, fiber: 31, fat: 20 },
      bulkMacros: { cal: 645, protein: 72, carbs: 64, fiber: 46, fat: 27 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-actual-90-10-yield-current-tortilla-panels-and-container-fit',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/batch-6-2026-08-15/grilled-cheese-breakfast-burrito.webp',
      ownerApproved: true,
    },
    {
      id: 'b3', name: 'Breakfast Quesadilla', category: 'standard',
      description: 'Seasoned chicken thighs, egg, egg whites, and cheese in Mission 70-calorie Carb Balance medium flour tortillas.',
      macros: { cal: 450, protein: 57, carbs: 41, fiber: 30, fat: 17 },
      bulkMacros: { cal: 595, protein: 75, carbs: 61, fiber: 45, fat: 22 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-owner-corrected-mission-medium-tortillas-and-bulk-chicken-pending-physical-review',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/breakfast-quesadilla-lean.jpg',
      ownerApproved: true,
    },
    {
      id: 'b4', name: 'Chicken Shakshuka', category: 'standard', laterWeek: true,
      description: 'Chicken thighs and eggs in a fresh tomato-pepper sauce with bread and no added salt.',
      macros: { cal: 555, protein: 53, carbs: 36, fiber: 6, fat: 23 },
      bulkMacros: { cal: 730, protein: 66, carbs: 55, fiber: 8, fat: 28 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-owner-corrected-chicken-pending-finished-sauce-and-egg-yields',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/batch-8-2026-08-29/chicken-shakshuka.webp',
      ownerApproved: true,
    },
  ],
  mains: [
    {
      id: 'm1', name: 'Hot Honey Chicken Sliders', category: 'standard',
      description: 'Seasoned chicken thighs, mozzarella, onion, one pickle chip per slider, and PRPD Sweet Heat on King\'s Hawaiian Original Sweet Rolls.',
      macros: { cal: 525, protein: 37, carbs: 60, fiber: 2, fat: 15 },
      bulkMacros: { cal: 685, protein: 46, carbs: 80, fiber: 3, fat: 20 },
      nutritionReview: true, nutritionStatus: 'source-generated-high-confidence-pending-slider-method-75-percent-yield-current-roll-panel-container-fit-and-photo-service-reconciliation',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/batch-6-2026-08-15/hot-honey-chicken-sliders.webp',
      ownerApproved: true,
    },
    {
      id: 'm2', name: 'Butter Chicken', category: 'standard',
      description: 'Chicken thighs in a fully blended browned-onion, Shan, crushed-tomato, and Greek-yogurt butter sauce with basmati rice.',
      macros: { cal: 560, protein: 48, carbs: 50, fiber: 5, fat: 18 },
      bulkMacros: { cal: 735, protein: 61, carbs: 69, fiber: 6, fat: 23 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-owner-corrected-portions-pending-finished-sauce-and-chicken-yields',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/butter-chicken-lean.jpg',
      ownerApproved: true,
    },
    {
      id: 'm3', name: 'Loaded Buffalo Chicken Potato', category: 'standard', laterWeek: true,
      description: 'Buffalo chicken thighs over roasted potato with broccoli.',
      macros: { cal: 520, protein: 44, carbs: 44, fiber: 7, fat: 19 },
      bulkMacros: { cal: 600, protein: 54, carbs: 46, fiber: 8, fat: 23 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-potato-and-full-assembly-yields',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/loaded-buffalo-chicken-potato.jpg', imageCrop: 'square-low',
      ownerApproved: true,
    },
    {
      id: 'm4', name: 'BBQ Chicken Mac & Cheese', category: 'standard', laterWeek: true,
      description: 'BBQ chicken thighs with high-protein macaroni and cheese, mozzarella, and an incorporated lower-sodium BBQ finish.',
      macros: { cal: 495, protein: 56, carbs: 37, fiber: 3, fat: 14 },
      bulkMacros: { cal: 635, protein: 72, carbs: 44, fiber: 4, fat: 19 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-chicken-and-mac-yields',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/bbq-chicken-mac-and-cheese-lean.jpg',
      ownerApproved: true,
    },
    {
      id: 'm5', name: 'Beef Seekh Kabab Shawarma', category: 'beef', displayCategory: 'Beef',
      description: 'Halal 90/10 beef seekh with reduced Shan mix, salt-free house spices, lettuce, cucumber, onion, light pickles, and garlic sauce in shawarma bread.',
      macros: { cal: 565, protein: 45, carbs: 57, fiber: 3, fat: 15 },
      bulkMacros: { cal: 755, protein: 57, carbs: 83, fiber: 3, fat: 19 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-cooked-yield-and-bulk-fit',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/beef-seekh-shawarma-landscape-v2.png',
      ownerApproved: true,
    },
    {
      id: 'm6', name: 'Cajun Garlic Salmon', category: 'seafood', displayCategory: 'Seafood', laterWeek: true,
      description: 'Cajun-garlic wild pink salmon with lemon-herb quinoa and roasted green beans.',
      macros: { cal: 540, protein: 55, carbs: 45, fiber: 8, fat: 17 },
      bulkMacros: { cal: 720, protein: 74, carbs: 58, fiber: 10, fat: 24 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-current-salmon-package-edible-yield-quinoa-and-green-bean-yields-and-exact-photo',
      taxClass: 'exempt-reheatable-meal', image: '',
      ownerApproved: true,
    },
  ],
  premium: [
    {
      id: 'm7', name: 'Braised Beef Short Rib', category: 'premium', displayCategory: 'Premium Meal',
      description: 'Boneless slow-braised beef short rib with garlic-rosemary Idahoan Original mash, roasted garlic green beans, and reduced pan jus.',
      macros: { cal: 760, protein: 39, carbs: 45, fiber: 7, fat: 46 },
      bulkMacros: { cal: 1015, protein: 52, carbs: 60, fiber: 10, fat: 62 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-reviewed-actual-raw-bone-in-to-edible-yield',
      taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/batch-15-2026-10-17/braised-beef-short-rib.jpg', imageCrop: 'landscape-low',
      ownerApproved: true,
    },
  ],
  desserts: [],
  addons: [
    {
      id: 'a1', name: 'Chicken Tikka Snack Wrap', category: 'addon', price: 7.99,
      description: 'A chilled high-fiber wrap with tikka-spiced chicken thighs, vegetables, and Garlic Herb Yogurt inside.',
      macros: { cal: 300, protein: 35, carbs: 25, fiber: 16, fat: 12 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-physical-review',
      taxClass: 'taxable-prepared-food', image: '/assets/images/meals/menu/batch-13-2026-10-03/chicken-tikka-snack-wrap-batch-13.jpg', imageCrop: 'landscape-tikka-close',
      ownerApproved: true,
    },
    {
      id: 'a2', name: 'Buffalo Chicken Pinwheels', category: 'addon', price: 7.99,
      description: 'Four chilled pinwheel pieces made from one 70-calorie Mission tortilla with Buffalo chicken, cream cheese, mozzarella, lettuce, and onion.',
      macros: { cal: 325, protein: 31, carbs: 23, fiber: 16, fat: 18 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-current-tortilla-panel-and-hold-review',
      taxClass: 'taxable-prepared-food', image: '/assets/images/meals/menu/batch-8-2026-08-29/buffalo-chicken-pinwheels.webp',
      ownerApproved: true,
    },
    {
      id: 'a3', name: 'Mediterranean Chicken Hummus Box', category: 'addon', price: 7.99,
      description: 'Chilled chicken thighs, hummus, flatbread, cucumber, tomato, feta, olives, and onion.',
      macros: { cal: 445, protein: 31, carbs: 40, fiber: 5, fat: 18 },
      nutritionReview: true, nutritionStatus: 'source-generated-medium-confidence-pending-current-package-and-hold-review',
      taxClass: 'taxable-prepared-food', image: '/assets/images/meals/menu/batch-8-2026-08-29/mediterranean-chicken-hummus-box.webp', imageCrop: 'portrait-low',
      ownerApproved: true,
    },
  ],
};

draft.release = {
  approvedByOwner: true,
  checks: {
    menuLineupApproved: true,
    weeklyFiveApproved: true,
    weeklySaucePairApproved: true,
    kitchenTestsReviewed: false,
    exactCostAuditPassed: false,
    menuNutritionPassed: true,
    orderConfigurationPassed: true,
    visualReviewPassed: true,
    taxConfigurationPassed: true,
  },
  blockers: [],
  productionHolds: [
    'Use boneless skinless chicken thighs for standard chicken recipes. Do not substitute breast.',
    'BBQ Chicken Mac uses 50 g Lean / 60 g Bulk dry Muscle Mac, one 30 g incorporated lower-sodium finish, and one separate 30 g matching BBQ sauce cup per meal. Sweet Chili Chicken receives one separate 30 g matching Sweet Chili sauce cup per meal. Recipe-required cups never use an interchangeable weekly sauce.',
    'Cajun Garlic Salmon uses 220/300 g purchased skin-on wild pink salmon, 50/65 g dry quinoa and 120/150 g green beans. Portion only from recorded edible cooked yield and photograph the exact finished dish.',
    'Review the October 19 sauce, slider assembly, and Loaded Buffalo vegetable/full-mass-balance tests before production.',
    'For Hot Honey Chicken Sliders, verify the source-specific 75% chicken-yield assumption, King\'s Hawaiian UPC 00073435002307, 3/4-slider container fit, one drained pickle chip per slider, and the incorporated shared-batch Sweet Heat during production.',
    'Short-rib mash uses Idahoan Original unflavored flakes to the physical package ratio. Any fresh-potato or Betty Crocker instruction is stale and must not reach the Cook-Day Planner. Record actual raw bone-in to finished edible beef yield at the next production.',
    'Desserts are discontinued for future menus. Preserve historical records only; do not restage dessert cards.',
    'Regenerate final quantity-based production and grocery data after the order cutoff.',
  ],
};

module.exports = draft;
