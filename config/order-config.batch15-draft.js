const current = require('./order-config');

const draft = JSON.parse(JSON.stringify(current));

draft.batch = {
  number: 15,
  published: true,
  remindersEnabled: false,
  deliveryDate: 'Saturday, October 17, 2026',
  cutoffIso: '2026-10-14T18:00:00-05:00',
  cutoffLabel: 'Wednesday at 6:00 PM CT',
  labelProduction: { madeDate: '2026-10-16', useByDate: '2026-10-19', batchId: 'B15-1016' },
};

draft.release = {
  approvedByOwner: true,
  checks: {
    shortRibRecipeLocked: true,
    exactCostAuditPassed: true,
    menuNutritionPassed: true,
    orderConfigurationPassed: true,
    visualReviewPassed: true,
    taxConfigurationPassed: true,
  },
  blockers: [],
  productionHolds: [
    'Record the EPIC short-rib package and halal source before purchase.',
    'Record short-rib raw purchase weight, removed bones and trim, edible cooked meat, and finished jus. Bones are never packed in customer meals.',
    'Complete the short-rib reheat check and replace the 49.6% planning yield with the measured batch yield.',
    'Regenerate Batch 15 production and label files after the order cutoff from the final sold quantities.',
  ],
};

draft.prices.seafood = { lean: 14.99, bulk: 16.99 };
draft.plannerOnly = [
  { id: 'bw1', name: 'Halal Cart Chicken + Yellow Rice', category: 'standard', plannerOnly: true },
  ...current.plannerOnly.filter(item => item.id !== 'bw1'),
];

draft.menu = {
  exclusives: [{
    id: 'x0',
    name: 'Weekly Five: Cajun + Halal Cart',
    category: 'bundle',
    servingCount: 5,
    description: 'Five meals. Pick Lean or Bulk, then choose which featured dish you want three of. No substitutions.',
    taxClass: 'exempt-reheatable-meal',
    variants: [
      { id: 'lean-cajun3-cart2', label: 'Lean: 3 Cajun + 2 Halal Cart', price: 49.95, compareAtPrice: 54.95, components: [{ id: 'm2', tier: 'lean', qty: 3 }, { id: 'bw1', tier: 'lean', qty: 2 }] },
      { id: 'lean-cajun2-cart3', label: 'Lean: 2 Cajun + 3 Halal Cart', price: 49.95, compareAtPrice: 54.95, components: [{ id: 'm2', tier: 'lean', qty: 2 }, { id: 'bw1', tier: 'lean', qty: 3 }] },
      { id: 'bulk-cajun3-cart2', label: 'Bulk: 3 Cajun + 2 Halal Cart', price: 59.95, compareAtPrice: 64.95, components: [{ id: 'm2', tier: 'bulk', qty: 3 }, { id: 'bw1', tier: 'bulk', qty: 2 }] },
      { id: 'bulk-cajun2-cart3', label: 'Bulk: 2 Cajun + 3 Halal Cart', price: 59.95, compareAtPrice: 64.95, components: [{ id: 'm2', tier: 'bulk', qty: 2 }, { id: 'bw1', tier: 'bulk', qty: 3 }] },
    ],
    image: '',
  }],
  breakfasts: [
    { id: 'b1', name: 'Strawberry Cheesecake Protein Pancakes', category: 'standard', description: 'Protein pancakes with strawberries, cheesecake-yogurt topping, and sugar-free maple syrup.', macros: { cal: 505, protein: 43, carbs: 54, fat: 12 }, bulkMacros: { cal: 645, protein: 56, carbs: 69, fat: 15 }, nutritionStatus: 'historical-calculation-pending-physical-review', taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/batch-8-2026-08-29/strawberry-cheesecake-protein-pancakes.webp' },
    { id: 'b2', name: 'PRPD Beef Bacon Breakfast Sandwich', category: 'beef', description: 'Halal beef bacon, egg-and-egg-white patty, cheese, and PRPD sauce on an English muffin.', macros: { cal: 515, protein: 36, carbs: 53, fat: 18 }, bulkMacros: { cal: 775, protein: 65, carbs: 54, fat: 32 }, nutritionStatus: 'historical-calculation-pending-package-review', taxClass: 'taxable-prepared-food', image: '/assets/images/meals/menu/batch-6-2026-08-15/prpd-beef-bacon-breakfast-sandwich.webp' },
    { id: 'b3', name: 'Blueberry Vanilla Protein Baked Oatmeal Squares', category: 'standard', laterWeek: true, description: 'Soft blueberry-vanilla baked oatmeal with egg whites, Greek yogurt, banana, and protein powder. Lean includes two squares, Bulk includes three.', macros: { cal: 435, protein: 31, carbs: 61, fat: 8 }, bulkMacros: { cal: 655, protein: 47, carbs: 91, fat: 12 }, nutritionStatus: 'controlled-estimate-pending-physical-review', taxClass: 'exempt-reheatable-meal', image: '' },
    { id: 'b4', name: 'Beef Breakfast Skillet', category: 'beef', description: 'Seasoned halal beef, roasted potatoes, eggs, onions, cheese, and a separate PRPD Mustard BBQ sauce.', macros: { cal: 565, protein: 59, carbs: 23, fat: 25 }, bulkMacros: { cal: 790, protein: 83, carbs: 24, fat: 39 }, nutritionStatus: 'historical-calculation-pending-physical-review', taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/beef-breakfast-skillet.jpg' },
  ],
  mains: [
    { id: 'm1', name: 'Sweet Chili Chicken with Rice', category: 'standard', description: 'Sweet-chili glazed chicken thighs with plain basmati rice.', macros: { cal: 490, protein: 44, carbs: 42, fiber: 1, fat: 16 }, bulkMacros: { cal: 650, protein: 58, carbs: 55, fiber: 2, fat: 21 }, nutritionStatus: 'source-calculated-pending-cooked-rice-yield-record', taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/batch-13-2026-10-03/sweet-chili-chicken-rice-batch-13.jpg', imageCrop: 'landscape-closer' },
    { id: 'm2', name: 'Creamy Cajun Chicken Pasta', category: 'standard', description: 'Cajun-spiced chicken thighs and protein spaghetti in a creamy crushed-tomato sauce.', macros: { cal: 570, protein: 52, carbs: 38, fat: 25 }, bulkMacros: { cal: 765, protein: 71, carbs: 50, fat: 34 }, nutritionStatus: 'historical-calculation-pending-physical-review', taxClass: 'exempt-reheatable-meal', image: '' },
    { id: 'm3', name: 'Chicken Enchilada Bake', category: 'standard', laterWeek: true, description: 'Layered chicken thighs, high-fiber tortillas, corn, enchilada sauce, red onion, and cheese. No beans.', macros: { cal: 565, protein: 61, carbs: 60, fat: 20 }, bulkMacros: { cal: 830, protein: 92, carbs: 93, fat: 29 }, nutritionStatus: 'controlled-estimate-pending-physical-review', taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/batch-8-2026-08-29/chicken-enchilada-bake.webp' },
    { id: 'm4', name: 'High-Protein Beef Lasagna', category: 'beef', laterWeek: true, description: 'Halal 90/10 beef, house tomato sauce, ricotta, mozzarella, Parmesan, and oven-ready pasta.', macros: { cal: 530, protein: 51, carbs: 38, fiber: 5, fat: 19 }, bulkMacros: { cal: 710, protein: 67, carbs: 51, fiber: 7, fat: 26 }, nutritionStatus: 'controlled-12-sheet-recipe-calculation', taxClass: 'exempt-reheatable-meal', image: '/assets/images/meals/menu/high-protein-beef-lasagna.webp' },
    { id: 'm5', name: 'Southwest Beef Taco Bowl', category: 'beef', description: 'Seasoned halal beef, cilantro-lime rice, black beans, corn and peppers, lettuce, Cotija, and jalapeño-lime yogurt sauce.', macros: { cal: 685, protein: 53, carbs: 62, fat: 24 }, bulkMacros: { cal: 935, protein: 74, carbs: 81, fat: 35 }, nutritionStatus: 'historical-calculation-pending-physical-review', taxClass: 'exempt-reheatable-meal', image: '' },
    { id: 'm6', name: 'Lemon Pepper Tilapia with Garlic Potatoes', category: 'seafood', displayCategory: 'Seafood', description: 'Lemon-pepper tilapia with roasted garlic potatoes, broccoli, and a separate PRPD Mustard BBQ sauce.', macros: { cal: 510, protein: 55, carbs: 54, fat: 10 }, bulkMacros: { cal: 675, protein: 74, carbs: 69, fat: 14 }, nutritionStatus: 'historical-calculation-pending-yield-review', taxClass: 'exempt-reheatable-meal', image: '' },
  ],
  premium: [
    { id: 'm7', name: 'Braised Beef Short Rib', category: 'premium', displayCategory: 'Premium Meal', description: 'Boneless portions of slow-braised beef short rib with garlic-rosemary mashed potatoes, roasted garlic green beans, and reduced pan jus.', macros: { cal: 680, protein: 45, carbs: 40, fiber: 4, fat: 37 }, bulkMacros: { cal: 885, protein: 60, carbs: 54, fiber: 5, fat: 49 }, nutritionStatus: 'USDA-cooked-edible-beef-and-leaner-controlled-mash-calculation', productionStatus: 'bones-and-trim-removed-before-portioning; measured-yield-record-required', taxClass: 'exempt-reheatable-meal', image: '' },
  ],
  desserts: [
    { id: 'd1', name: 'Baked Strawberry-Lemon Protein Cheesecake', category: 'dessert', price: 6.99, description: 'A crustless baked protein cheesecake with a strawberry-lemon swirl.', macros: { cal: 225, protein: 14, carbs: 17, fat: 11 }, nutritionStatus: 'historical-calculation-pending-physical-review', taxClass: 'exempt-bakery-item', image: '/assets/images/meals/menu/batch-6-2026-08-15/baked-strawberry-lemon-protein-cheesecake-square.webp' },
    { id: 'd2', name: 'Chocolate Oreo Mousse', category: 'dessert', price: 6.99, description: 'Chocolate protein mousse with an Oreo finish.', macros: { cal: 290, protein: 38, carbs: 30, fat: 5 }, nutritionStatus: 'controlled-estimate-pending-cup-calibration', taxClass: 'taxable-prepared-food', image: '/assets/images/meals/menu/chocolate-oreo-mousse.jpg' },
    { id: 'd3', name: 'High Protein Tiramisu', category: 'dessert', price: 6.99, description: 'Chilled mascarpone protein cream with coffee-soaked ladyfingers and cocoa.', macros: { cal: 460, protein: 22, carbs: 45, fiber: 1, fat: 21 }, nutritionReview: true, macrosPending: false, nutritionStatus: 'controlled-five-cup-estimate-pending-coffee-weight-cup-weight-panels-and-hold', taxClass: 'taxable-prepared-food', image: '/assets/images/meals/menu/high-protein-tiramisu.jpg', imageCrop: 'square-raised' },
  ],
  addons: [
    { id: 'a1', name: 'Buffalo Chicken Pinwheels', category: 'addon', price: 7.99, description: 'Four chilled high-fiber pinwheels with buffalo chicken, cream cheese, cheese, lettuce, and onion.', macros: { cal: 430, protein: 43, carbs: 42, fat: 21 }, nutritionStatus: 'controlled-estimate-pending-physical-review', taxClass: 'taxable-prepared-food', image: '/assets/images/meals/menu/batch-8-2026-08-29/buffalo-chicken-pinwheels.webp' },
    { id: 'a2', name: 'Mediterranean Chicken Hummus Box', category: 'addon', price: 7.99, description: 'Chilled chicken, hummus, flatbread, cucumber, tomato, feta, olives, and onion.', macros: { cal: 485, protein: 36, carbs: 41, fat: 20 }, nutritionStatus: 'controlled-estimate-pending-physical-review', taxClass: 'taxable-prepared-food', image: '/assets/images/meals/menu/batch-8-2026-08-29/mediterranean-chicken-hummus-box.webp', imageCrop: 'portrait-low' },
    { id: 'a3', name: 'PRPD Protein Box', category: 'addon', price: 7.99, description: 'Eggs, halal beef breakfast slices, cheese, fruit, cucumber, and PRPD Mustard BBQ sauce.', macros: { cal: 330, protein: 26, carbs: 14, fat: 19 }, nutritionStatus: 'historical-calculation-pending-product-fit', taxClass: 'taxable-prepared-food', image: '' },
  ],
};

module.exports = draft;
