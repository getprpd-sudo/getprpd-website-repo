(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  if (root) root.PRPD_COOK_METHODS = data;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const meal = (phase, order, equipment, temperature, steps, plating, hold, options = {}) => ({
    phase,
    order,
    equipment,
    temperature,
    steps,
    plating,
    hold,
    sideCups: options.sideCups || 0,
    sideBags: options.sideBags || 0,
    validation: options.validation || '',
    prepSteps: options.prepSteps || [],
    prepBatches: options.prepBatches || [],
    stepIngredients: options.stepIngredients || {},
    groceryOverrides: options.groceryOverrides || {},
    sideCup: options.sideCup || null,
    proteinCook: options.proteinCook || null,
    piecePlan: options.piecePlan || null,
    riceBatchGroup: options.riceBatchGroup || 'common',
    assemblyGuide: options.assemblyGuide || null,
  });

  const prep = (type, name, instruction, ingredientKeys, steps = [], options = {}) => ({
    type,
    name,
    instruction,
    ingredientKeys,
    steps,
    ...options,
  });

  const data = {
    version: '2026-08-14.2',
    batch: 6,
    labelExemptCustomers: ['Talal', 'Duaa', 'Rida'],
    // Named family allocations appear only in plating so these unlabeled
    // containers are separated from ordinary customer production immediately.
    familyPlatingReservations: [
      { customer: 'Duaa', dishId: 'b1', tier: 'lean', qty: 2 },
      { customer: 'Duaa', dishId: 'm1', tier: 'lean', qty: 1 },
      { customer: 'Duaa', dishId: 'm2', tier: 'lean', qty: 2 },
      { customer: 'Talal', dishId: 'b1', tier: 'bulk', qty: 2 },
      { customer: 'Talal', dishId: 'm1', tier: 'bulk', qty: 3 },
      { customer: 'Talal', dishId: 'm2', tier: 'bulk', qty: 1 },
      { customer: 'Talal', dishId: 'm8', tier: 'bulk', qty: 1 },
      { customer: 'Talal', dishId: 'p1', tier: 'bulk', qty: 2 },
    ],
    // Batch 6 operational variance: no refrigerator-pickle batch was made.
    // The controlled nutrition source remains historical recipe evidence, while the
    // current planner and grocery build omit the component without inventing a substitute.
    groceryAdjustments: [],
    rawProteinReserveByDish: { m7: 12 },
    sharedProteinSeasoning: [{
      id: 'neutral-chicken-base',
      name: 'PRPD neutral savory chicken base',
      proteinKey: 'chicken_thigh_raw',
      dishIds: ['b2', 'b4', 'm2', 'm3', 'm6', 'a1'],
      note: 'Season compatible boneless thighs together, record the master weight, then divide exact recipe pulls into labeled destination bowls before adding distinct finishes. Chicken Biryani remains a separate Desi batch.',
      basePerKg: [
        { key: 'salt', name: 'Fine salt', grams: 8, measure: { type: 'spice', gramsPerTsp: 6 } },
        { key: 'garlic_powder', name: 'Garlic powder', grams: 8, measure: { type: 'spice', gramsPerTsp: 3.1 } },
        { key: 'onion_powder', name: 'Onion powder', grams: 4, measure: { type: 'spice', gramsPerTsp: 2.4 } },
        { key: 'paprika', name: 'Paprika', grams: 3, measure: { type: 'spice', gramsPerTsp: 2.3 } },
        { key: 'black_pepper', name: 'Black pepper', grams: 2, measure: { type: 'spice', gramsPerTsp: 2.3 } },
      ],
      finishes: {
        b2: { note: 'No additional raw marinade; cook as Power Bowl chicken.', perKg: [] },
        b4: { note: 'No additional raw marinade; finish inside the quesadilla with the recorded yogurt and salsa.', perKg: [] },
        m2: { note: 'Add the Mexican street-corn component only during assembly.', perKg: [] },
        m3: { note: 'Add the halal-cart cumin finish before cooking.', perKg: [{ key: 'cumin', name: 'Ground cumin', grams: 2, measure: { type: 'spice', gramsPerTsp: 2.1 } }] },
        m6: { note: 'Add sweet-chili glaze only after cooked yield is recorded.', perKg: [] },
        a1: { note: 'Cool before wrapping; finish with the incorporated house sauce.', perKg: [] },
      },
    }],
    weeklySauces: {
      enabled: true,
      policy: 'Superseded unpublished candidate. The owner-approved Batch 6 sauce policy is assigned in the approved-menu override below.',
      cupSizeOz: 2,
      eligibleMealIds: ['b2', 'm1', 'm5'],
      customerCupsTotal: 0,
      kitchenUseCupsPerSauce: 0,
      qcCupsPerSauce: 1,
      sauces: [{
        name: 'PRPD Sweet Heat Sauce',
        estimatedCaloriesPerCup: 77,
        provisional: true,
        netGramsPerCup: 40,
        ingredientsPerCup: [
          { key: 'light_mayo', name: 'Light mayonnaise', grams: 9.8039, station: 'Sauces & Dairy' },
          { key: 'ketchup', name: 'Ketchup', grams: 11.7647, station: 'Sauces & Dairy' },
          { key: 'honey', name: 'Honey', grams: 11.7647, station: 'Breakfast & Desserts' },
          { key: 'sriracha', name: 'Sriracha sauce', grams: 6.6667, station: 'Sauces & Dairy' },
        ],
        steps: [
          'Tare one empty sauce cup and lid before scaling. Do not treat gross cup weight as net sauce.',
          'Whisk the exact 250:300:300:170 light-mayo:ketchup:honey:sriracha ratio by weight.',
          'Fill one 40g net cup per eligible meal plus one separately measured QC cup.',
          'Record ingredient weights, finished batch weight, customer cup count, QC cup, bowl loss, and gross filled-cup weight; seal, date, and refrigerate.',
        ],
      }],
    },
    phases: [
      { title: '1. Reconcile, print, and label', detail: 'Lock orders, print customer labels, apply them to empty containers, and stage packaging.' },
      { title: '2. Raw protein and produce', detail: 'Cut and portion every raw protein, apply measured shared bases, divide labeled destination batches, sanitize, then move to produce.' },
      { title: '3. Desserts, sauces, and cold kits', detail: 'Build desserts, Sweet Heat, white sauce, syrup/salsa cups, and cold assembly kits.' },
      { title: '4. Prep Day non-protein cooking', detail: 'Cook eggs, French Toast, rice, pasta, potatoes, vegetables, and other safe non-protein components; record yields and rapid-cool.' },
      { title: '5. Cook Day protein block', detail: 'Cook every labeled protein in one continuous block, close and sanitize the raw station, then release prepared components for assembly.' },
      { title: '6. Assemble by SKU', detail: 'Record cooked yields, assemble one dish and tier at a time, verify portions, and move sealed food to cold holding.' },
      { title: '7. Customer pack-out', detail: 'Pack one customer at a time and reconcile meals, add-ons, desserts, and every required sauce cup.' },
    ],
    meals: {},
  };

  data.meals.b1 = meal(
    4,
    10,
    ['mixing bowls', 'nonstick skillet', 'sheet pan', 'toaster'],
    'Cook eggs until fully set; rapid-cool promptly.',
    [
      'Retrieve the complete Prep Day omelette batch and verify its finished count and holding record.',
      'Toast the measured sourdough separately and cool it before packing.',
      'Pack the exact Lean or Bulk build. This meal intentionally receives no sauce cup.',
    ],
    'Use the exact tier-specific egg, egg-white, vegetable, cheese, and bread quantities.',
    'Refrigerate promptly.',
    {
      prepSteps: ['Cut the omelette vegetables in the bulk produce block.', 'Cook the entire ordered omelette batch on Prep Day.'],
      prepBatches: [prep(
        'cook-ahead',
        'Omelette egg batch',
        'Cook every ordered omelette on Prep Day.',
        ['egg', 'egg_white', 'mozzarella', 'mushroom', 'jalapeno', 'tomato', 'avocado_oil', 'salt'],
        ['Mix the complete scaled recipe.', 'Cook until fully set.', 'Record finished count and weight, rapid-cool, cover, label, date, and refrigerate at 41 F or below.'],
        { prepWave: 'eggs', prepWaveName: 'Egg production wave' },
      )],
    },
  );

  data.meals.b2 = meal(
    5,
    20,
    ['chicken skillet', 'sheet pans', 'egg skillet'],
    'Prep Day: cook eggs and potatoes. Cook Day: chicken to 165 F.',
    [
      'Use the released Power Bowl chicken from the all-protein block.',
      'Retrieve the Prep Day eggs and potatoes and verify both yields.',
      'Plate the exact tier build and add one sealed 40g net Sweet Heat cup.',
    ],
    'Use tier-specific chicken, potato, and egg quantities. The retired yogurt-sriracha finish remains removed.',
    'Cool components before sealing.',
    {
      proteinCook: {
        group: 'chicken',
        sequence: 10,
        name: 'Power Bowl chicken',
        endpoint: '165 F',
        recipeKeys: ['chicken_thigh_raw', 'salt'],
        recipeSteps: ['Cook the complete labeled Power Bowl chicken allocation in uncrowded batches.', 'Release only at 165 F; record raw weight, cooked yield, endpoint, and destination pan.'],
        instructions: ['Cook the labeled Power Bowl chicken during the continuous protein block.', 'Record raw weight, endpoint, cooked yield, and destination pan before moving on.'],
      },
      prepSteps: ['Include chicken in the shared neutral-chicken pull.', 'Cook eggs and roasted potatoes on Prep Day.'],
      prepBatches: [
        prep('cook-ahead', 'Power Bowl egg allocation', 'Cook the complete scaled egg allocation.', ['egg', 'salt'], ['Cook until fully set.', 'Record finished weight, rapid-cool, label, date, and refrigerate.'], { prepWave: 'eggs', prepWaveName: 'Egg production wave' }),
        prep('starch-ahead', 'Power Bowl roasted potatoes', 'Roast the complete recipe-card potato allocation.', ['potato', 'avocado_oil'], ['Roast until browned and tender.', 'Record finished weight, rapid-cool, label, date, and refrigerate.'], { prepWave: 'roasted-potatoes', prepWaveName: 'Roasted potato wave' }),
      ],
    },
  );

  data.meals.b3 = meal(
    4,
    30,
    ['mixing bowls', 'blender', 'griddle', 'sheet pans'],
    'Cook French Toast on Prep Day until the custard is set and both sides are browned.',
    [
      'Use the controlled custard formula and soak only the required bread slices.',
      'Cook three slices per Lean and four per Bulk.',
      'Record finished slice count and weight; rapid-cool in one layer.',
      'Pack fruit and whipped cream cold, with one measured 30g syrup cup.',
    ],
    'Lean: three slices. Bulk: four slices. Include measured fruit, whipped cream, and one syrup cup.',
    'Refrigerate; keep syrup separate.',
    {
      sideCups: 1,
      sideCup: { name: 'Sugar-free maple syrup', gramsPerMeal: 30, instruction: 'Fill one measured 30g syrup cup per French Toast meal.' },
      prepSteps: ['Cook the entire French Toast order on Prep Day and prepare cold toppings.'],
      prepBatches: [prep(
        'cook-ahead',
        'French Toast batch',
        'Cook every ordered French Toast serving on Prep Day.',
        ['egg', 'egg_white', 'cottage', 'fairlife_milk', 'whey', 'brown_sugar', 'vanilla', 'cinnamon', 'avocado_oil', 'bread_slice'],
        ['Mix the complete custard.', 'Cook three slices per Lean and four per Bulk until set.', 'Record yield, rapid-cool in one layer, cover, label, date, and refrigerate.'],
        { prepWave: 'eggs', prepWaveName: 'Egg and custard wave' },
      )],
    },
  );

  data.meals.b4 = meal(
    5,
    40,
    ['chicken skillet', 'egg skillet', 'griddle', 'wrap station'],
    'Prep Day: cook egg mixture. Cook Day: chicken to 165 F and final quesadilla assembly.',
    [
      'Use the released Breakfast Quesadilla chicken from the all-protein block.',
      'Retrieve the Prep Day egg mixture and verify its finished yield.',
      'Assemble with measured cheese and yogurt, griddle until the tortilla is crisp and filling hot.',
      'Do not pack salsa; the yogurt remains incorporated in the filling.',
    ],
    'Use exact tier-specific chicken, tortilla, egg, egg-white, cheese, and yogurt quantities.',
    'Cool on racks before sealing.',
    {
      sideCups: 0,
      proteinCook: {
        group: 'chicken',
        sequence: 20,
        name: 'Breakfast Quesadilla chicken',
        endpoint: '165 F',
        recipeKeys: ['chicken_thigh_raw', 'salt'],
        recipeSteps: ['Cook the labeled chicken allocation in uncrowded batches.', 'Release at 165 F; record raw weight, cooked yield, endpoint, and destination pan.'],
        instructions: ['Cook the Breakfast Quesadilla chicken during the continuous protein block.', 'Record raw weight, endpoint, cooked yield, and destination pan.'],
      },
      prepSteps: ['Include chicken in the shared neutral-chicken pull.', 'Cook the complete egg mixture on Prep Day.'],
      prepBatches: [prep(
        'cook-ahead',
        'Breakfast Quesadilla egg allocation',
        'Cook the complete egg and egg-white allocation on Prep Day.',
        ['egg', 'egg_white', 'salt'],
        ['Cook until fully set.', 'Record finished weight, rapid-cool, cover, label, date, and refrigerate.'],
        { prepWave: 'eggs', prepWaveName: 'Egg production wave' },
      )],
    },
  );

  data.meals.m1 = meal(
    5,
    50,
    ['beef skillet', 'stockpot', 'sheet pans', 'oven'],
    'Prep Day: make and cool Betty Crocker instant mash. Cook Day: beef filling to 160 F; bake assembled pie until hot.',
    [
      'Use the released Cottage Pie beef filling from the protein block.',
      'Retrieve the measured Prep Day Betty Crocker instant mash; Cottage Pie mash contains no cottage cheese.',
      'Build each container with measured filling, mash, and mozzarella; bake until hot and lightly browned.',
      'Pack one sealed 45g net Sweet Heat cup per meal.',
    ],
    'Use the exact tier recipe; do not substitute unmeasured prepared mash.',
    'Freezer-friendly; rapid-cool after baking.',
    {
      proteinCook: {
        group: 'ground-beef',
        sequence: 20,
        name: 'Cottage Pie beef filling',
        endpoint: '160 F',
        lane: 'Stovetop filling lane',
        recipeKeys: ['beef_90_raw', 'mixed_vegetables', 'onion', 'tomato_paste', 'avocado_oil', 'salt'],
        recipeSteps: ['Brown the complete beef allocation to 160 F and drain excess rendered fat.', 'Add onion, peas and carrots, tomato paste, oil, and salt; cook until cohesive and excess moisture is gone. Do not add broth.', 'Record finished filling weight and move to the labeled pan.'],
        instructions: ['Cook the complete Cottage Pie filling during the continuous protein block.', 'Record raw beef, endpoint, finished filling yield, and destination pan.'],
      },
      prepSteps: ['Weigh the raw beef kit.', 'Prepare Betty Crocker unflavored instant mash to the package ratio and stage the mozzarella topping on Prep Day. Cottage cheese is not part of the Cottage Pie recipe.'],
      prepBatches: [
        prep('protein-portion', 'Raw Cottage Pie beef pull', 'Weigh the complete raw beef pull and keep reserve separate.', ['beef_90_raw'], ['Cover, label, date, refrigerate, and cook to 160 F on Cook Day.']),
        prep('starch-ahead', 'Cottage Pie instant mash', 'Prepare the exact recipe-card amount of Betty Crocker unflavored instant mash.', ['instant_potato_flakes', 'water', 'fairlife_milk', 'butter', 'salt'], ['Follow the controlled package ratio; do not use fresh potatoes or cottage cheese for this mash.', 'Record finished yield, rapid-cool, label, date, and refrigerate.'], { prepWave: 'instant-mash', prepWaveName: 'Packaged instant mashed-potato wave' }),
        prep('mix', 'Cottage Pie vegetable kit', 'Stage the vegetable finish separately from raw beef.', ['mixed_vegetables', 'onion', 'tomato_paste'], ['Keep frozen vegetables frozen.', 'Cover diced onion and tomato paste as a labeled finish kit.']),
      ],
    },
  );

  data.meals.m2 = meal(
    5,
    60,
    ['chicken skillet', 'rice cooker', 'cast-iron skillet'],
    'Prep Day: rice and street-corn component. Cook Day: chicken to 165 F.',
    [
      'Use the released Streetcorn chicken from the all-protein block.',
      'Retrieve the cooked rice and charred street-corn component and verify yields.',
      'Fold the cold dairy finish into cooled corn, then plate exact tier quantities.',
    ],
    'Street-corn sauce is incorporated; no duplicate sauce cup.',
    'Freezer-friendly.',
    {
      proteinCook: {
        group: 'chicken',
        sequence: 30,
        name: 'Mexican Streetcorn chicken',
        endpoint: '165 F',
        recipeKeys: ['chicken_thigh_raw', 'salt'],
        recipeSteps: ['Cook the labeled chicken allocation in uncrowded batches.', 'Release at 165 F and record raw weight, cooked yield, endpoint, and destination pan.'],
        instructions: ['Cook Streetcorn chicken during the continuous protein block.', 'Record raw weight, endpoint, cooked yield, and destination pan.'],
      },
      riceBatchGroup: 'common',
      prepSteps: ['Include chicken in the shared neutral-chicken pull.', 'Cook rice and the full corn component on Prep Day.'],
      prepBatches: [
        prep('starch-ahead', 'Streetcorn rice allocation', 'Cook the exact dry-rice requirement.', ['rice_dry'], ['Record dry weight and cooked yield.', 'Rapid-cool, label, date, and refrigerate.'], { prepWave: 'rice', prepWaveName: 'Rice production wave' }),
        prep('vegetable-ahead', 'Streetcorn hot vegetable allocation', 'Char corn, bell pepper, onion, and jalapeno before adding cold dairy.', ['corn', 'green_bell_pepper', 'onion', 'jalapeno', 'avocado_oil'], ['Cook in uncrowded high-heat batches until moisture is controlled.', 'Record yield and rapid-cool.'], { prepWave: 'vegetables', prepWaveName: 'Vegetable production wave' }),
        prep('topping', 'Cold street-corn finish', 'Mix the measured cold finish.', ['fage', 'light_mayo', 'cotija', 'cilantro', 'lime'], ['Whisk until uniform.', 'Cover, label, date, and refrigerate.']),
      ],
    },
  );

  data.meals.m3 = meal(
    5,
    70,
    ['chicken skillet', 'rice cooker', 'produce station'],
    'Prep Day: yellow rice and white sauce. Cook Day: chicken to 165 F and fresh-vegetable finish.',
    [
      'Use the released Halal Cart chicken from the all-protein block.',
      'Retrieve yellow rice and verify its dry and cooked yields.',
      'Plate with fresh lettuce and tomato and one measured 30g white-sauce cup.',
    ],
    'Use exact tier-specific chicken and rice. White sauce is recipe-specific.',
    'Pack cold vegetables and sauce separately.',
    {
      sideCups: 1,
      sideCup: { name: 'PRPD white sauce', batchGroup: 'prpd-white-sauce', gramsPerMeal: 30, instruction: 'Fill one measured 30g white-sauce cup per Halal Cart meal from the shared Halal Cart and Tilapia batch.' },
      proteinCook: {
        group: 'chicken',
        sequence: 40,
        name: 'Halal Cart chicken',
        endpoint: '165 F',
        recipeKeys: ['chicken_thigh_raw', 'cumin', 'salt'],
        recipeSteps: ['Cook the cumin-finished chicken separately from neutral finishes.', 'Release at 165 F and record raw weight, cooked yield, endpoint, and destination pan.'],
        instructions: ['Cook Halal Cart chicken during the continuous protein block.', 'Record raw weight, endpoint, cooked yield, and destination pan.'],
      },
      riceBatchGroup: 'common',
      prepSteps: ['Include chicken in the shared neutral-chicken pull before its cumin finish.', 'Cook yellow rice and shared white sauce on Prep Day.'],
      prepBatches: [prep('starch-ahead', 'Halal Cart yellow rice', 'Cook the complete exact rice allocation.', ['rice_dry'], ['Record dry weight and cooked yield.', 'Rapid-cool, label, date, and refrigerate.'], { prepWave: 'rice', prepWaveName: 'Rice production wave' })],
    },
  );

  data.meals.m4 = meal(
    5,
    80,
    ['air fryer', 'sheet pans', 'mixing bowl'],
    'Prep Day: potatoes, broccoli, and white sauce. Cook Day: tilapia to 145 F or opaque and flaking.',
    [
      'Use the released air-fried Tilapia from the final raw-protein lane.',
      'Retrieve roasted potatoes and broccoli and verify yields.',
      'Plate exact tier quantities with one measured 30g white-sauce cup.',
    ],
    'Use exact tier fish, potato, broccoli, and sauce quantities.',
    'Cool fish rapidly; avoid overcooking during reheating.',
    {
      sideCups: 1,
      sideCup: { name: 'PRPD white sauce', batchGroup: 'prpd-white-sauce', gramsPerMeal: 30, instruction: 'Fill one measured 30g white-sauce cup per Tilapia meal from the shared Halal Cart and Tilapia batch.' },
      proteinCook: {
        group: 'seafood',
        sequence: 80,
        name: 'Blackened tilapia',
        endpoint: '145 F or opaque and flaking',
        lane: 'Air-fryer lane - final raw protein',
        recipeKeys: ['tilapia_raw', 'paprika', 'chili_powder', 'salt'],
        recipeSteps: ['Pat fillets dry and apply measured blackening seasoning.', 'Air-fry in one uncrowded layer or numbered batches; release only at 145 F or when opaque and flaking.', 'Record raw weight, cooked yield, endpoint, and destination pan.'],
        instructions: ['Cook Tilapia in the dedicated air-fryer lane as the final raw protein.', 'Record raw weight, endpoint, cooked yield, and destination pan before raw-station closure.'],
      },
      prepSteps: ['Portion tilapia but keep dry seasoning separate.', 'Roast potatoes and broccoli and make white sauce on Prep Day.'],
      prepBatches: [
        prep('protein-portion', 'Portioned tilapia trays', 'Portion raw fillets without seasoning early.', ['tilapia_raw'], ['Cover, label, date, and refrigerate.', 'Pat dry and season immediately before cooking.']),
        prep('starch-ahead', 'Tilapia roasted potatoes', 'Roast the exact recipe-card potato allocation.', ['potato', 'avocado_oil'], ['Roast until browned and tender.', 'Record yield, rapid-cool, label, date, and refrigerate.'], { prepWave: 'roasted-potatoes', prepWaveName: 'Roasted potato wave' }),
        prep('vegetable-ahead', 'Tilapia broccoli', 'Cook the exact broccoli allocation.', ['broccoli'], ['Cook until just tender.', 'Record yield, rapid-cool, label, date, and refrigerate.'], { prepWave: 'broccoli', prepWaveName: 'Broccoli wave' }),
      ],
    },
  );

  data.meals.m5 = meal(
    5,
    90,
    ['heavy skillet or grill', 'stockpot', 'sheet pans'],
    'Prep Day: exact high-protein mash and broccoli. Cook Day: steak to approved doneness and food-safety procedure.',
    [
      'Use the released and rested Steak from the protein block; slice across the grain.',
      'Retrieve exact recipe mash and broccoli and verify yields.',
      'Plate tier quantities and add one sealed 40g net Sweet Heat cup.',
    ],
    'Use exact recipe quantities; do not substitute unmeasured prepared mash.',
    'Do not seal steaming-hot steak.',
    {
      proteinCook: {
        group: 'steak',
        sequence: 70,
        name: 'NY Strip steak',
        endpoint: 'Approved doneness and food-safety procedure',
        recipeKeys: ['ny_strip_raw', 'avocado_oil', 'garlic', 'salt'],
        recipeSteps: ['Sear or grill the tiered steak trays in uncrowded batches.', 'Rest, record doneness and cooked yield, then move to the labeled destination pan.'],
        instructions: ['Cook steak during the continuous protein block before seafood.', 'Record raw weight, endpoint, cooked yield, rest, and destination pan.'],
      },
      prepSteps: ['Portion steaks by tier.', 'Make exact mash and broccoli allocations on Prep Day.'],
      prepBatches: [
        prep('protein-portion', 'Tiered steak trays', 'Weigh every Lean and Bulk steak.', ['ny_strip_raw'], ['Cover, label, date, and refrigerate.']),
        prep('starch-ahead', 'Steak instant mash', 'Prepare the exact recipe-card amount of Betty Crocker unflavored instant mash.', ['instant_potato_flakes', 'water', 'fairlife_milk', 'butter', 'salt', 'garlic'], ['Follow the controlled package ratio; do not use fresh potatoes for this mash.', 'Fold in the measured garlic.', 'Record yield, rapid-cool, label, date, and refrigerate.'], { prepWave: 'instant-mash', prepWaveName: 'Packaged instant mashed-potato wave' }),
        prep('vegetable-ahead', 'Steak broccoli', 'Cook the exact broccoli allocation.', ['broccoli'], ['Cook until just tender.', 'Record yield, rapid-cool, label, date, and refrigerate.'], { prepWave: 'broccoli', prepWaveName: 'Broccoli wave' }),
      ],
    },
  );

  data.meals.m6 = meal(
    5,
    100,
    ['chicken skillet or oven', 'rice cooker', 'vegetable skillet'],
    'Prep Day: vegetable rice and glaze. Cook Day: chicken to 165 F.',
    [
      'Use the released Sweet Chili chicken from the all-protein block.',
      'Retrieve vegetable rice and verify dry-rice and finished yields.',
      'Confirm the chicken glaze was added only after cooked yield was recorded.',
      'Plate exact tier quantities. Sauce is incorporated; no duplicate cup.',
    ],
    'Use exact tier chicken, rice, peas-and-carrots, and glaze quantities.',
    'Freezer-friendly.',
    {
      proteinCook: {
        group: 'chicken',
        sequence: 50,
        name: 'Sweet Chili chicken',
        endpoint: '165 F',
        recipeKeys: ['chicken_thigh_raw', 'sweet_chili', 'soy_sauce', 'garlic', 'salt'],
        recipeSteps: ['Cook chicken to 165 F and record cooked yield before adding glaze.', 'Add only the measured sweet-chili, soy, and garlic glaze; record final yield and destination pan.'],
        instructions: ['Cook Sweet Chili chicken during the continuous protein block.', 'Record raw weight, endpoint, cooked yield before glaze, finished yield after glaze, and destination pan.'],
      },
      riceBatchGroup: 'common',
      prepSteps: ['Include chicken in the shared neutral-chicken pull.', 'Cook vegetable rice and mix glaze on Prep Day.'],
      prepBatches: [
        prep('starch-ahead', 'Sweet Chili vegetable rice', 'Cook the exact rice and peas-and-carrots allocation.', ['rice_dry', 'mixed_vegetables'], ['Record dry rice and finished yield.', 'Rapid-cool, label, date, and refrigerate.'], { prepWave: 'rice', prepWaveName: 'Rice production wave' }),
        prep('sauce', 'Sweet Chili finishing glaze', 'Mix the complete measured glaze.', ['sweet_chili', 'soy_sauce', 'garlic'], ['Whisk until uniform.', 'Cover, label, date, and refrigerate.']),
      ],
    },
  );

  data.meals.m7 = meal(
    5,
    110,
    ['mixing bowls', 'sheet pans', 'oven', 'pasta pot', 'sauce pot'],
    'Prep Day: form 25-26g meatballs, cook pasta and sauce. Cook Day: bake meatballs at 400 F to 160 F.',
    [
      'Use the released meatball count and cooked yield from the first oven load.',
      'Retrieve separately chilled pasta and Arrabbiata sauce and verify yields.',
      'Plate eight meatballs per Lean and ten per Bulk with exact pasta and sauce amounts.',
    ],
    'Lean: eight meatballs. Bulk: ten. Arrabbiata sauce is incorporated.',
    'Freezer-friendly.',
    {
      piecePlan: { lean: 8, bulk: 10, formedGrams: 25.5, reservePct: 12, note: 'Use a 12% dish-specific piece reserve for damage and yield variance; never shrink customer portions.' },
      proteinCook: {
        group: 'ground-beef',
        sequence: 10,
        name: 'Arrabbiata meatballs',
        endpoint: '160 F',
        lane: 'Oven lane - first load',
        recipeKeys: ['beef_90_raw', 'egg', 'breadcrumbs', 'onion', 'garlic', 'salt'],
        recipeSteps: ['Load formed 25-26g meatballs first into a 400 F oven in one uncrowded layer.', 'Bake to 160 F; count and weigh cooked pieces and record damage and reserve use.', 'Move to the labeled destination pan without combining with pasta until raw-station closure.'],
        instructions: ['Put formed meatballs into the 400 F oven as the first oven load.', 'Release at 160 F and record cooked count, weight, damage, reserve use, and destination pan.'],
      },
      prepSteps: ['Form the complete meatball recipe.', 'Cook pasta one minute short and cook Arrabbiata sauce separately.'],
      prepBatches: [
        prep('protein-mix', 'Form all Arrabbiata meatballs', 'Form the exact required pieces plus the displayed 12% reserve.', ['beef_90_raw', 'egg', 'breadcrumbs', 'onion', 'garlic', 'salt'], ['Record complete raw mixture weight.', 'Form 25-26g pieces and count the exact planner requirement plus reserve.', 'Cover, label, date, and refrigerate.']),
        prep('starch-ahead', 'Protein pasta and Arrabbiata sauce', 'Cook pasta and sauce separately.', ['protein_pasta', 'crushed_tomatoes', 'tomato_paste', 'mozzarella'], ['Cook pasta one minute short.', 'Cook sauce separately.', 'Record both yields, rapid-cool in separate pans, label, date, and refrigerate.'], { prepWave: 'pasta-sauce', prepWaveName: 'Pasta and Arrabbiata sauce wave' }),
      ],
    },
  );

  data.meals.m8 = meal(
    5,
    120,
    ['mixing bowls', 'chicken skillet', 'rice cooker', 'stockpot'],
    'Prep Day: marinate chicken and cook fragrant rice. Cook Day: chicken to 165 F.',
    [
      'Use the released Biryani chicken from its separate Desi protein batch.',
      'Retrieve the Prep Day fragrant rice and verify dry and cooked yields.',
      'Fold chicken and rice together only after all protein is released and the raw station is closed.',
      'This build intentionally receives no cucumber salad or side sauce.',
    ],
    'Use exact tier chicken and rice quantities. No discontinued cucumber salad.',
    'Freezer-friendly.',
    {
      proteinCook: {
        group: 'chicken-desi',
        sequence: 60,
        name: 'Chicken Biryani chicken',
        endpoint: '165 F',
        recipeKeys: ['chicken_thigh_raw', 'fage', 'onion', 'tomato', 'garlic', 'ginger', 'lemon', 'avocado_oil', 'salt'],
        recipeSteps: ['Cook the separately marinated Biryani chicken in uncrowded batches.', 'Release at 165 F and record raw weight, cooked yield, endpoint, and destination pan.'],
        instructions: ['Keep Biryani separate from the neutral chicken base.', 'Cook to 165 F and record raw weight, endpoint, cooked yield, and destination pan.'],
      },
      riceBatchGroup: 'biryani',
      prepSteps: ['Mix and refrigerate the exact Biryani marinade.', 'Cook fragrant Biryani rice on Prep Day.'],
      prepBatches: [
        prep('protein-marinade', 'Chicken Biryani marinade', 'Marinate the exact chicken pull separately from neutral chicken.', ['chicken_thigh_raw', 'fage', 'onion', 'tomato', 'garlic', 'ginger', 'lemon', 'avocado_oil', 'salt'], ['Mix the exact measured marinade.', 'Coat the chicken, cover, label, date, and refrigerate.']),
        prep('starch-ahead', 'Chicken Biryani rice', 'Cook the exact Biryani rice allocation separately.', ['rice_dry'], ['Record dry weight and cooked yield.', 'Rapid-cool, label, date, and refrigerate.'], { prepWave: 'rice', prepWaveName: 'Rice production wave' }),
      ],
    },
  );

  data.meals.d1 = meal(
    3,
    10,
    ['blender', 'mixing bowls', 'sheet pan', 'dessert containers'],
    'No final cook; keep refrigerated.',
    [
      'Blend cottage cheese until smooth, then mix with measured protein powder, oat flour, peanut butter, honey, and vanilla.',
      'Form three equal medium balls per serving.',
      'Use exactly 14g total chocolate per serving across the complete coating.',
      'Record complete dough weight, ball count, chocolate used, and finished servings.',
    ],
    'Three medium balls per serving.',
    'Refrigerate immediately.',
    {
      prepSteps: ['Build, coat, count, and chill every Cookie Dough Ball serving on Prep Day.'],
      prepBatches: [prep('dessert', 'Chocolate-Dipped Cookie Dough Balls', 'Build every dessert serving to the exact controlled formula.', ['cottage', 'whey', 'oats', 'peanut_butter', 'honey', 'vanilla', 'chocolate_chips'], ['Record complete dough weight.', 'Form three medium balls per serving.', 'Use 14g total chocolate per serving, record actual coating use, and refrigerate.'], { prepWave: 'desserts', prepWaveName: 'Dessert production wave' })],
    },
  );

  data.meals.d2 = meal(
    3,
    20,
    ['mixing bowls', 'whisk or mixer', 'dessert cups'],
    'No cook; refrigerate immediately.',
    [
      'Whisk the complete measured chocolate mousse formula until smooth.',
      'Portion by weight and finish with measured Oreo pieces.',
      'Record finished batch weight, cup count, and average filled weight.',
    ],
    'One controlled dessert cup per order.',
    'Serve chilled.',
    {
      prepSteps: ['Build and chill every mousse cup on Prep Day.'],
      prepBatches: [prep('dessert', 'Chocolate Oreo Mousse', 'Build every cup from the taste-approved 19.5g protein-powder formula.', ['fage', 'whey', 'cocoa', 'honey', 'oreo_thin'], ['Whisk until smooth.', 'Portion by weight, finish with Oreo, record yield, and refrigerate.'], { prepWave: 'desserts', prepWaveName: 'Dessert production wave' })],
    },
  );

  data.meals.a1 = meal(
    5,
    130,
    ['chicken skillet', 'knife station', 'wrap station'],
    'Cook chicken to 165 F; cool enough to wrap without steaming the tortilla.',
    [
      'Use the released Snack Wrap chicken from the protein block.',
      'For each order, build two Mission Carb Balance Fajita tortillas with the measured chicken, mozzarella, fresh chopped salad, and incorporated house sauce split evenly between them.',
      'Wrap both tortillas tightly, reconcile two wraps per order, label the container, and refrigerate.',
    ],
    'Two Mini Chicken Snack Wraps per order; no duplicate side cup.',
    'Use earlier in the week because it contains fresh salad.',
    {
      proteinCook: {
        group: 'chicken',
        sequence: 55,
        name: 'Mini Chicken Snack Wrap chicken',
        endpoint: '165 F',
        recipeKeys: ['chicken_thigh_raw', 'salt'],
        recipeSteps: ['Cook the labeled chicken allocation in uncrowded batches.', 'Release at 165 F; record raw weight, cooked yield, endpoint, and destination pan.'],
        instructions: ['Cook Snack Wrap chicken during the continuous protein block.', 'Record raw weight, endpoint, cooked yield, and destination pan; cool before wrapping.'],
      },
      prepSteps: ['Include chicken in the shared neutral-chicken pull.', 'Wash and dry salad produce; mix house sauce on Prep Day.'],
      prepBatches: [prep('sauce', 'Snack Wrap house sauce', 'Mix the exact incorporated house sauce.', ['fage', 'light_mayo', 'lemon', 'jalapeno', 'garlic', 'avocado_oil', 'salt', 'cumin'], ['Whisk until uniform.', 'Cover, label, date, and refrigerate.'])],
    },
  );

  // Owner-approved August 15 menu. These assignments intentionally replace
  // the earlier unpublished candidate methods above while preserving the
  // tested method schema used by the planner.
  data.version = '2026-08-11.1';
  data.rawProteinReserveByDish = {};
  data.sharedProteinSeasoning = [{
    id: 'approved-b6-neutral-chicken-base',
    name: 'PRPD neutral savory chicken base',
    proteinKey: 'chicken_thigh_raw',
    dishIds: ['b3', 'm2', 'm3', 'm5', 'm6', 'm8', 'a2'],
    note: 'Season all compatible boneless chicken together, record the master raw weight, then split exact labeled pulls before adding dish-specific finishes.',
    basePerKg: [
      { key: 'salt', name: 'Fine salt', grams: 8, measure: { type: 'spice', gramsPerTsp: 6 } },
      { key: 'garlic_powder', name: 'Garlic powder', grams: 8, measure: { type: 'spice', gramsPerTsp: 3.1 } },
      { key: 'onion_powder', name: 'Onion powder', grams: 4, measure: { type: 'spice', gramsPerTsp: 2.4 } },
      { key: 'paprika', name: 'Paprika', grams: 3, measure: { type: 'spice', gramsPerTsp: 2.3 } },
      { key: 'black_pepper', name: 'Black pepper', grams: 2, measure: { type: 'spice', gramsPerTsp: 2.3 } },
    ],
    finishes: {
      b3: { note: 'Cool before quesadilla assembly; salsa and yogurt remain recipe-specific.', perKg: [] },
      m2: { note: 'Add the measured hot-honey finish only after the cooked yield is recorded.', perKg: [] },
      m3: { note: 'Add measured buffalo sauce only after the cooked yield is recorded.', perKg: [] },
      m5: { note: 'Add the measured harissa-honey glaze only after the cooked yield is recorded.', perKg: [] },
      m6: { note: 'Reserve this pull for the Streetcorn Bowl; add the cooked street-corn component only during assembly.', perKg: [] },
      m8: { note: 'Add measured BBQ sauce only after the cooked yield is recorded.', perKg: [] },
      a2: { note: 'Cool before wrapping; house sauce remains incorporated.', perKg: [] },
    },
  }];
  data.weeklySauces = {
    enabled: true,
    policy: 'Batch 6 provides one 45g net PRPD Sweet Heat cup only with the Beef Bacon Breakfast Sandwich and Loaded Beef Cottage Pie.',
    cupSizeOz: 2,
    eligibleMealIds: ['b1', 'm1', 'p1'],
    customerCupsTotal: 0,
    kitchenUseCupsPerSauce: 0,
    qcCupsPerSauce: 1,
    sauces: [{
      name: 'PRPD Sweet Heat Sauce',
      batchGroup: 'prpd-sweet-heat',
      ingredientsIncludedInRecipes: true,
      estimatedCaloriesPerCup: 87,
      provisional: false,
      netGramsPerCup: 45,
      ingredientsPerCup: [
        { key: 'light_mayo', name: 'Light mayonnaise', grams: 11.0294, station: 'Sauces & Dairy' },
        { key: 'ketchup', name: 'Ketchup', grams: 13.2353, station: 'Sauces & Dairy' },
        { key: 'honey', name: 'Honey', grams: 13.2353, station: 'Breakfast & Desserts' },
        { key: 'sriracha', name: 'Sriracha sauce', grams: 7.5, station: 'Sauces & Dairy' },
      ],
      steps: [
        'Tare the cup and lid, then fill every customer cup to 45g net.',
        'Whisk the exact 250:300:300:170 light-mayo:ketchup:honey:sriracha ratio by weight.',
        'Fill one cup per eligible meal plus one separately labeled QC cup and record bowl loss.',
      ],
    }],
  };

  const proteinMethod = (name, group, sequence, recipeKeys, equipment, steps, plating, hold, options = {}) => meal(
    5,
    sequence,
    equipment,
    options.temperature || (group === 'beef' ? 'Cook ground beef to 160 F.' : group === 'seafood' ? 'Cook shrimp until opaque and 145 F.' : 'Cook chicken to 165 F.'),
    steps,
    plating,
    hold,
    {
      ...options,
      proteinCook: {
        group,
        sequence,
        name,
        endpoint: options.endpoint || (group === 'beef' ? '160 F' : group === 'seafood' ? '145 F' : '165 F'),
        recipeKeys,
        recipeSteps: options.recipeSteps || ['Cook the exact labeled protein pull in uncrowded batches.', 'Record raw weight, endpoint, cooked yield, and destination pan before adding the measured finish.'],
        instructions: options.proteinInstructions || ['Cook during the continuous protein block.', 'Record raw weight, endpoint, cooked yield, and destination pan.'],
      },
    },
  );

  data.meals = {};
  data.meals.b1 = proteinMethod(
    'Beef Bacon Breakfast Sandwich components', 'beef', 10,
    ['beef_bacon'],
    ['sheet pan', 'egg pan', 'toaster or air fryer'],
    ['Cook beef bacon according to the purchased package and record the finished count.', 'Retrieve the cooked Prep Day egg patties and the Lean-only roasted potatoes; reheat only as needed.', 'Toast muffins and assemble the exact sandwich count. Pack 150g potatoes with Lean only; Bulk receives two sandwiches and no potatoes. Add one 45g Sweet Heat cup to either tier.'],
    'Lean receives one sandwich and 150g potatoes; Bulk receives two complete sandwiches and no potatoes.',
    'Rapid-cool and refrigerate.',
    { sideCups: 1, sideCup: { name: 'PRPD Sweet Heat Sauce', batchGroup: 'prpd-sweet-heat', gramsPerMeal: 45, instruction: 'Pack one 45g net cup per sandwich meal.' }, endpoint: 'Follow the purchased beef-bacon package', prepSteps: ['Cook one egg patty per physical sandwich using one whole egg, 75g liquid egg whites, and 28g mozzarella per patty; do not add cottage cheese.', 'Include only the Lean breakfast-sandwich potatoes in the shared roasted-potato batch.'], prepBatches: [prep('cook-ahead', 'Breakfast sandwich egg patties', 'Cook one measured patty per physical sandwich: one whole egg, 75g liquid egg whites, and 28g mozzarella. Cottage cheese is not used.', ['egg', 'egg_white', 'mozzarella', 'avocado_oil'], ['Keep the egg count and liquid egg-white grams visible.', 'Cook until fully set.', 'Record finished weight and physical patty count.', 'Rapid-cool, label, and refrigerate.'], { prepWave: 'eggs', prepWaveName: 'Cooked breakfast egg wave' }), prep('starch-ahead', 'Lean breakfast-sandwich potato allocation', 'Include only the Lean allocation in the one shared fresh-potato cook; Bulk gets no potatoes.', ['potato', 'avocado_oil', 'salt'], ['Cook all fresh potato allocations together.', 'Record the combined finished yield, rapid-cool, then divide on Cook Day by the recipe portions.'], { prepWave: 'roasted-potatoes', prepWaveName: 'One fresh roasted-potato cook' })] },
  );
  data.meals.b2 = meal(4, 20, ['griddle', 'sheet pan'], 'Cook custard-soaked bread until the egg mixture is fully set.', ['Cook the complete French Toast batch.', 'Cool, portion fruit and whipped topping, and pack one measured syrup cup.'], 'Lean receives three slices; Bulk receives four.', 'Refrigerate promptly.', { sideCups: 1, sideCup: { name: 'Sugar-free maple syrup', batchGroup: 'french-toast-syrup', gramsPerMeal: 30, instruction: 'Pack one 30g cup per order.' }, prepSteps: ['Cook French Toast and stage toppings on Prep Day.'], prepBatches: [prep('cook-ahead', 'French Toast wave', 'Cook all ordered French Toast.', ['bread_slice', 'egg', 'egg_white', 'cottage', 'fairlife_milk', 'whey', 'brown_sugar', 'vanilla', 'cinnamon', 'avocado_oil'], ['Cook until set, record slice count, rapid-cool, and refrigerate.'])] });
  data.meals.b3 = proteinMethod('Breakfast Quesadilla chicken', 'chicken', 20, ['chicken_thigh_raw'], ['chicken skillet', 'egg pan', 'griddle'], ['Cook and release the labeled chicken pull.', 'Retrieve the shared cooked breakfast egg base, assemble exact-tier quesadillas, and dry-grill.'], 'Use one whole egg plus 25g liquid egg whites per order. No Greek yogurt or salsa cup.', 'Rapid-cool and refrigerate.', { prepSteps: ['Cook the Quesadilla and Breakfast Burrito egg base together, then divide by exact order count before assembly.'], prepBatches: [prep('cook-ahead', 'Shared Quesadilla and Burrito egg base', 'Cook one whole egg plus 25g liquid egg whites per Quesadilla or Burrito order. Do not add yogurt.', ['egg', 'egg_white'], ['Combine the two dishes only at this common egg-base stage.', 'Cook until fully set.', 'Record total finished yield, divide by exact order count, rapid-cool, label, and refrigerate.'], { prepWave: 'shared-breakfast-eggs', prepWaveName: 'Shared Quesadilla and Burrito egg base' })] });
  data.meals.b4 = proteinMethod('Breakfast Burrito beef filling', 'beef', 30, ['beef_90_raw', 'onion', 'tomato_paste'], ['beef skillet', 'egg pan', 'griddle'], ['Cook beef and onion to 160 F, drain, and cook the filling dry.', 'Retrieve the shared cooked breakfast egg base, assemble the broth-free burritos, and dry-grill.'], 'Lean uses the controlled small-tortilla build; Bulk uses the large-tortilla build. Both use one egg plus 25g whites per order.', 'Rapid-cool and refrigerate.', { prepSteps: ['Cook the Quesadilla and Breakfast Burrito egg base together, then divide by exact order count before assembly.'], prepBatches: [prep('cook-ahead', 'Shared Quesadilla and Burrito egg base', 'Cook one whole egg plus 25g liquid egg whites per Quesadilla or Burrito order.', ['egg', 'egg_white'], ['Combine the two dishes only at this common egg-base stage.', 'Cook until fully set.', 'Record total finished yield, divide by exact order count, rapid-cool, label, and refrigerate.'], { prepWave: 'shared-breakfast-eggs', prepWaveName: 'Shared Quesadilla and Burrito egg base' })] });
  data.meals.m1 = proteinMethod('Loaded Beef Cottage Pie filling', 'beef', 40, ['beef_90_raw', 'mixed_vegetables', 'onion', 'tomato_paste'], ['beef skillet', 'instant mash station', 'oven'], ['Cook beef to 160 F, drain, and finish the filling without broth.', 'Layer with measured packaged instant mash and mozzarella, bake until hot, and pack one 45g Sweet Heat cup.'], 'Plate exact Lean/Bulk filling, mash, and mozzarella weights.', 'Rapid-cool and refrigerate.', { sideCups: 1, sideCup: { name: 'PRPD Sweet Heat Sauce', batchGroup: 'prpd-sweet-heat', gramsPerMeal: 45, instruction: 'Pack one 45g net cup per Cottage Pie.' }, prepSteps: ['Prepare Betty Crocker unflavored instant mash, vegetables, and mozzarella on Prep Day. Cottage cheese is not part of this recipe.'], prepBatches: [prep('starch-ahead', 'Cottage Pie instant mash', 'Prepare one measured Betty Crocker instant-mash batch to the package ratio without cottage cheese.', ['instant_potato_flakes', 'water', 'fairlife_milk', 'butter', 'salt'], ['Do not use fresh potatoes or cottage cheese for this mash.', 'Record dry flakes and finished mash weights.', 'Rapid-cool and refrigerate.'], { prepWave: 'instant-mash', prepWaveName: 'One packaged instant-mash cook' })] });
  data.meals.m2 = proteinMethod('Hot Honey Slider chicken', 'chicken', 50, ['chicken_thigh_raw', 'light_mayo', 'sriracha', 'honey'], ['chicken skillet or oven', 'slider assembly station'], ['Cook and record the labeled chicken pull.', 'Add the measured sriracha hot-honey finish, then assemble the exact slider count with cheese and onion. Pickles are omitted for this batch.'], 'Lean receives three sliders; Bulk receives four; do not add a separate hot-sauce cup or an unplanned pickle substitute.', 'Rapid-cool and refrigerate.', { groceryOverrides: { pickles: { lean: 0, bulk: 0, unit: 'g', name: 'House refrigerator-pickled vegetables', note: 'Batch 6 owner-directed omission; no substitute.' } }, prepSteps: ['Stage rolls, cheese, onion, and measured sriracha hot-honey finish. Pickles are omitted for this batch.'], prepBatches: [] });
  data.meals.m3 = proteinMethod('Loaded Buffalo chicken', 'chicken', 60, ['chicken_thigh_raw', 'buffalo_sauce'], ['chicken skillet or oven', 'potato oven'], ['Cook and record the labeled chicken pull before adding buffalo sauce.', 'Retrieve the shared cooked potato and broccoli waves, add measured buffalo chicken, and portion by tier.'], 'Use the corrected 200g potato and 80g broccoli per meal with tier-specific chicken.', 'Rapid-cool and refrigerate.', { prepSteps: ['Include the corrected 200g-per-meal potato allocation in the one shared fresh-potato cook and broccoli in the one shared broccoli cook on Prep Day.'], prepBatches: [prep('starch-ahead', 'Loaded Buffalo potato allocation', 'Include 200g per ordered meal in the one shared fresh-potato cook.', ['potato', 'avocado_oil', 'salt'], ['Cook all fresh potato allocations together.', 'Record the combined finished yield, rapid-cool, then divide on Cook Day by the recipe portions.'], { prepWave: 'roasted-potatoes', prepWaveName: 'One fresh roasted-potato cook' }), prep('vegetable-ahead', 'Loaded Buffalo broccoli allocation', 'Include this allocation in the one shared broccoli cook.', ['broccoli'], ['Cook the combined broccoli until just tender.', 'Record the combined yield, rapid-cool, then divide on Cook Day.'], { prepWave: 'broccoli', prepWaveName: 'One shared broccoli cook' })] });
  data.meals.m4 = proteinMethod('Beef Seekh Kabab', 'beef', 70, ['beef_90_raw', 'onion', 'garlic', 'paprika', 'cumin', 'chili_powder'], ['beef oven', 'wrap station'], ['Place the already shaped, chilled seekh logs directly onto the oven tray.', 'Bake to 160 F, record the finished yield, then build shawarma with lettuce, onion, and garlic yogurt sauce. Pickles are omitted for this batch.'], 'Lean uses one 170g raw seekh log and one bread; Bulk uses one 210g raw seekh log and one and one-half breads.', 'Use earlier in the week; refrigerate promptly.', { groceryOverrides: { pickles: { lean: 0, bulk: 0, unit: 'g', name: 'House refrigerator-pickled vegetables', note: 'Batch 6 owner-directed omission; no substitute.' } }, prepSteps: ['Mix and shape every seekh log on Prep Day so tomorrow is oven-only.', 'Make the white garlic yogurt sauce; pickles are omitted for this batch.'], sideBags: 1, prepBatches: [prep('protein-mix', 'Shape every Beef Seekh log', 'Mix, weigh, and shape all shawarma beef today; tomorrow it goes directly into the oven.', [], ['Grate the measured onion and squeeze out excess moisture.', 'Mix only until evenly combined.', 'Shape the exact Lean and Bulk log counts shown above, place on lined trays, cover, label, date, and refrigerate.'], { pieceTargets: { lean: { piecesPerServing: 1, gramsPerPiece: 170, label: 'Lean log' }, bulk: { piecesPerServing: 1, gramsPerPiece: 210, label: 'Bulk log' } }, formulaIngredients: [
    { key: 'beef_90_raw', name: 'Ground beef 90/10, raw', unit: 'g', lean: 170, bulk: 210, includeInGrocery: false },
    { key: 'onion', name: 'Grated and squeezed onion', unit: 'g', lean: 18.7, bulk: 23.1, includeInGrocery: false },
    { key: 'garlic', name: 'Garlic', unit: 'g', lean: 2.04, bulk: 2.52, includeInGrocery: false },
    { key: 'avocado_oil', name: 'Avocado oil', unit: 'g', lean: 2.38, bulk: 2.94, includeInGrocery: false },
    { key: 'paprika', name: 'Paprika', unit: 'g', lean: 0.782, bulk: 0.966, includeInGrocery: false },
    { key: 'cumin', name: 'Ground cumin', unit: 'g', lean: 0.714, bulk: 0.882, includeInGrocery: false },
    { key: 'chili_powder', name: 'Chili powder', unit: 'g', lean: 0.459, bulk: 0.567, includeInGrocery: false },
    { key: 'salt', name: 'Fine salt', unit: 'g', lean: 0.75, bulk: 1, includeInGrocery: false },
  ] }), prep('cold-prep', 'Shawarma fresh salad', 'Wash and dry the lettuce and onion; do not make or substitute pickles for this batch.', ['lettuce', 'onion'], ['Keep lettuce whole after washing and drying; slice it tomorrow for best texture.', 'Prepare the correct onion cut, cover, label, and refrigerate.'])] });
  data.meals.m5 = proteinMethod('Harissa Honey chicken', 'chicken', 80, ['chicken_thigh_raw', 'harissa', 'honey', 'tomato_paste', 'lemon', 'garlic', 'avocado_oil', 'paprika', 'coriander'], ['chicken skillet or oven', 'rice cooker', 'broccoli oven'], ['Cook and record the labeled chicken pull.', 'Add only the measured harissa-honey finish, then plate with common rice and roasted broccoli.'], 'Use exact tier-specific chicken, dry-rice, and broccoli quantities.', 'Rapid-cool and refrigerate.', { riceBatchGroup: 'common', prepSteps: ['Mix glaze, cook common rice, and roast broccoli on Prep Day.'], prepBatches: [prep('starch-ahead', 'Common basmati rice allocation', 'Cook the exact Harissa rice allocation in the common rice wave.', ['rice_dry'], ['Record dry and cooked weights; rapid-cool.'], { prepWave: 'rice', prepWaveName: 'Common basmati rice wave' }), prep('vegetable-ahead', 'Harissa broccoli batch', 'Cook the exact broccoli allocation today.', ['broccoli'], ['Cook until just tender.', 'Record finished yield, rapid-cool, label, and refrigerate.'], { prepWave: 'broccoli', prepWaveName: 'Broccoli wave' }), prep('sauce', 'Harissa-honey glaze', 'Mix the exact glaze without raw-chicken contact.', ['harissa', 'honey', 'tomato_paste', 'lemon', 'garlic', 'avocado_oil', 'paprika', 'coriander'], ['Record starting and finished weight; refrigerate.'])] });
  data.meals.m6 = proteinMethod('Mexican Streetcorn chicken', 'chicken', 90, ['chicken_thigh_raw', 'salt'], ['chicken skillet or oven', 'rice cooker', 'street-corn skillet'], ['Cook and record the labeled chicken pull.', 'Retrieve the common rice and the fully finished Prep Day street corn.', 'Plate the chicken, rice, and finished street corn in three visible sections.'], 'Use exact tier-specific chicken, dry-rice, and street-corn quantities; the creamy finish is incorporated and receives no side cup.', 'Rapid-cool and refrigerate.', { riceBatchGroup: 'common', prepSteps: ['Include chicken in the shared neutral-chicken pull.', 'Cook, fully mix, and refrigerate the complete street-corn component on Prep Day.'], prepBatches: [prep('starch-ahead', 'Common basmati rice allocation', 'Include this allocation in the one shared rice cook.', ['rice_dry'], ['Record dry and cooked weights; rapid-cool.'], { prepWave: 'rice', prepWaveName: 'One shared rice cook' }), prep('vegetable-ahead', 'Complete Mexican street-corn batch', 'Cook and fully finish the entire street-corn component today.', ['corn', 'green_bell_pepper', 'onion', 'jalapeno', 'avocado_oil', 'fage', 'light_mayo', 'cotija', 'cilantro', 'lime'], ['Char corn, green bell pepper, onion, and jalapeno in uncrowded high-heat batches until moisture is controlled.', 'Rapid-cool the hot vegetable mixture before adding dairy.', 'Fold in the measured FAGE, light mayonnaise, cotija, cilantro, and lime.', 'Record the finished yield, cover, label, and refrigerate the fully mixed street corn for tomorrow.'], { prepWave: 'streetcorn', prepWaveName: 'Complete Mexican street-corn batch' })] });
  data.meals.m7 = proteinMethod('Garlic Butter Shrimp', 'seafood', 100, ['shrimp_raw', 'butter', 'garlic', 'lemon', 'cornstarch'], ['shrimp skillet', 'rice cooker', 'vegetable skillet'], ['Cook shrimp last in the raw-protein block to 145 F and record yield.', 'Finish with measured garlic, butter, and lemon; plate with common rice, peas and carrots, and zucchini.'], 'Use exact tier-specific shrimp, rice, frozen peas-and-carrots, and zucchini.', 'Rapid-cool immediately and use earlier in the week.', { endpoint: '145 F', riceBatchGroup: 'common', prepSteps: ['Cook common rice and run the peas-carrots-zucchini component beside the broccoli and street-corn work on Prep Day.'], prepBatches: [prep('starch-ahead', 'Common basmati rice allocation', 'Include this allocation in the one shared rice cook.', ['rice_dry'], ['Record dry and cooked weights; rapid-cool.'], { prepWave: 'rice', prepWaveName: 'One shared rice cook' }), prep('vegetable-ahead', 'Shrimp peas-carrots-zucchini component', 'Cook this beside the broccoli and street-corn work, but keep it in its own pan.', ['mixed_vegetables', 'zucchini'], ['Cook until the zucchini is tender and excess moisture is controlled.', 'Record finished yield, rapid-cool, label, and refrigerate.'], { prepWave: 'shrimp-vegetables', prepWaveName: 'Shrimp vegetables beside broccoli' })] });
  data.meals.m8 = proteinMethod('BBQ Chicken', 'chicken', 110, ['chicken_thigh_raw', 'bbq_sauce'], ['chicken skillet or oven', 'pasta pot'], ['Cook and record the labeled chicken pull.', 'Add measured BBQ sauce and fold with the cooked high-protein macaroni and cheese.'], 'Plate exact tier-specific chicken with the corrected macaroni portion: 50g dry-equivalent Lean or 60g dry-equivalent Bulk.', 'Rapid-cool and refrigerate.', { sideCups: 1, sideCup: { name: 'BBQ sauce', batchGroup: 'bbq-side', gramsPerMeal: 30, instruction: 'Pack one measured BBQ sauce cup per meal.' }, prepSteps: ['Cook the corrected high-protein macaroni batch on Prep Day: 50g dry per Lean and 60g dry per Bulk.'], prepBatches: [prep('starch-ahead', 'High-protein macaroni and cheese', 'Cook the corrected ordered macaroni quantity: 50g dry per Lean and 60g dry per Bulk.', ['protein_mac', 'mozzarella'], ['Record dry package weight, finished yield, and portions; rapid-cool.'])] });
  data.meals.p1 = proteinMethod('Premium NY Strip Steak', 'steak', 105, ['ny_strip_raw', 'avocado_oil', 'garlic', 'salt'], ['heavy skillet or grill', 'instant mash station', 'broccoli oven'], ['Sear or grill the already seasoned, chilled Bulk steaks in uncrowded batches.', 'Rest, record endpoint and cooked yield, then slice across the grain.', 'Plate each steak with the exact 200g packaged instant mash and broccoli allocation plus one sealed 45g Sweet Heat cup.'], 'Bulk uses 300g raw steak, 200g Betty Crocker instant mash prepared to the package ratio, 125g broccoli, 8g garlic, 2g avocado oil, and 1g salt per meal.', 'Do not seal steaming-hot steak; rapid-cool and refrigerate.', { temperature: 'Cook to the owner-approved doneness while following the food-safety procedure; record the released endpoint.', sideCups: 1, sideCup: { name: 'PRPD Sweet Heat Sauce', batchGroup: 'prpd-sweet-heat', gramsPerMeal: 45, instruction: 'Pack one 45g net cup per steak meal.' }, endpoint: 'Approved doneness and food-safety procedure', proteinInstructions: ['Cook the already seasoned steak during the continuous protein block before shrimp.', 'Record raw weight, endpoint, cooked yield, rest, and destination pan.'], prepSteps: ['Season and refrigerate the exact raw Bulk steaks today.', 'Prepare the exact packaged instant mash and broccoli allocations on Prep Day.'], prepBatches: [prep('protein-portion', 'Season the Bulk steak trays today', 'Season every 300g raw NY strip portion now and refrigerate it for tomorrow.', [], ['Weigh each 300g raw Bulk steak.', 'Apply the exact measured garlic, avocado oil, and salt shown in this card.', 'Cover, label, date, and refrigerate at 40 F or below until tomorrow.'], { formulaIngredients: [
    { key: 'ny_strip_raw', name: 'NY strip steak, raw', unit: 'g', bulk: 300, includeInGrocery: false },
    { key: 'garlic', name: 'Garlic', unit: 'g', bulk: 8, includeInGrocery: false },
    { key: 'avocado_oil', name: 'Avocado oil', unit: 'g', bulk: 2, includeInGrocery: false },
    { key: 'salt', name: 'Fine salt', unit: 'g', bulk: 1, includeInGrocery: false },
  ] }), prep('starch-ahead', 'Steak instant mash allocation', 'Include this allocation in the one packaged instant-mash cook.', ['instant_potato_flakes', 'water', 'fairlife_milk', 'butter', 'salt'], ['Prepare the full packaged instant-mash total once; do not use fresh potatoes.', 'Record the combined finished mash yield, rapid-cool, then divide on Cook Day.'], { prepWave: 'instant-mash', prepWaveName: 'One packaged instant-mash cook' }), prep('vegetable-ahead', 'Steak broccoli allocation', 'Include this allocation in the one shared broccoli cook.', ['broccoli'], ['Cook the combined broccoli until just tender.', 'Record the combined yield, rapid-cool, then divide on Cook Day.'], { prepWave: 'broccoli', prepWaveName: 'One shared broccoli cook' })] });
  data.meals.d1 = meal(3, 10, ['blender', 'mixing bowls', 'dessert containers'], 'No final cook.', ['Blend the measured dough, form three equal balls per serving, and use 14g total chocolate per serving.'], 'Three balls per serving.', 'Serve chilled.', { prepSteps: ['Build, coat, count, and chill on Prep Day.'] });
  data.meals.d2 = meal(3, 20, ['mixing bowls', 'whisk', 'dessert cups'], 'No cook.', ['Whisk until smooth, portion by weight, finish with Oreo Thins, and record yield.'], 'One cup per order.', 'Serve chilled.', { prepSteps: ['Build and chill every mousse cup on Prep Day.'] });
  data.meals.d3 = meal(3, 30, ['blender', '8-inch square pan', 'oven'], 'Bake at 325 F until the edges are set and center moves as one piece.', ['Blend the cheesecake base, add cooled strawberry swirl, bake, chill fully, and cut into eight equal weighed squares.'], 'One equal square per order.', 'Serve chilled.', { prepSteps: ['Bake, chill, weigh, and package the complete cheesecake-square batch on Prep Day.'], prepBatches: [prep('dessert', 'Strawberry-Lemon Cheesecake Squares', 'Bake the exact controlled pan formula.', ['reduced_cream_cheese', 'cottage', 'fage', 'egg', 'whey', 'cornstarch', 'vanilla', 'lemon', 'salt', 'strawberry', 'honey'], ['Record raw batter, baked pan, strawberry reduction, and eight square weights.'])] });
  data.meals.a1 = meal(3, 40, ['egg pot', '12 oz divided boxes'], 'Hard-boil eggs until fully cooked; follow beef-bacon package.', ['Cook and chill eggs and beef bacon, then assemble cheese, whole mini apple, cucumber, and sealed dip.'], 'One 12 oz Protein Box per order.', 'Enjoy chilled; refrigerate promptly.', { prepSteps: ['Cook eggs, wash apples/cucumber, mix dip, and test lid closure on Prep Day.'], prepBatches: [prep('cold-kit', 'Protein Box kits', 'Assemble exact 12 oz boxes with one whole mini apple.', ['egg', 'beef_bacon', 'mozzarella', 'apple', 'cucumber', 'fage', 'light_mayo', 'lemon', 'jalapeno', 'garlic'], ['Record apple weights and confirm every lid closes without pressure.'])] });
  data.meals.a2 = proteinMethod('Mini Chicken Snack Wrap chicken', 'chicken', 120, ['chicken_thigh_raw', 'salt'], ['chicken skillet', 'wrap station'], ['Cook and release the labeled chicken pull.', 'Cool enough to avoid steaming, then split each order\'s filling evenly across two 45-calorie Mission Carb Balance Fajita tortillas with cheese, fresh salad, and house sauce.'], 'Two wraps per order.', 'Use earlier in the week; refrigerate promptly.', { prepSteps: ['Wash and dry salad produce and mix house sauce on Prep Day.'] });
  data.meals.a3 = meal(3, 50, ['mixing bowls', '12 oz cups'], 'No cook except strawberry reduction.', ['Reduce 45g strawberries to 30g per serving and cool fully.', 'Mix the measured oat base, pack to the tested fill weight, seal, and refrigerate overnight.'], 'One fixed 12 oz cup per order.', 'Enjoy chilled; stir before eating.', { prepSteps: ['Build and chill all overnight-oat cups on Prep Day.'], prepBatches: [prep('cold-kit', 'Strawberry Protein Overnight Oats', 'Build the exact fixed-size 12 oz formula.', ['oats', 'fage', 'fairlife_milk', 'whey', 'strawberry', 'chia', 'honey', 'vanilla', 'salt'], ['Record strawberry reduction, filled cup weights, lid closure, and final count.'])] });

  const assemblyGuides = {
    b1: {
      lean: [
        'Open 1 English muffin in the main section.',
        'Build 1 sandwich with 1 beef-bacon slice, the Lean egg patty, and 28 g mozzarella; close the muffin.',
        'Place the measured 150 g roasted-potato allocation beside the sandwich.',
        'Add 1 sealed 45 g PRPD Sweet Heat cup beside the sandwich, then close and label the container.',
      ],
      bulk: [
        'Open 2 English muffins in the main section.',
        'Divide the Bulk egg-and-cheese filling evenly between both muffins; add 1 beef-bacon slice to each and close both sandwiches.',
        'Do not add potatoes; the Bulk serving is exactly 2 complete sandwiches.',
        'Add 1 sealed 45 g PRPD Sweet Heat cup beside the sandwiches, then close and label the container.',
      ],
    },
    b2: {
      lean: [
        'Place 3 French Toast slices in the main section, slightly overlapped so all three are visible.',
        'Place 50 g strawberries and 40 g banana together on the side.',
        'Add 10 g whipped cream beside the fruit, not under the hot toast.',
        'Pack 1 sealed 30 g sugar-free maple-syrup cup beside the toast, then close and label the container.',
      ],
      bulk: [
        'Place 4 French Toast slices in the main section, slightly overlapped so all four are visible.',
        'Place 50 g strawberries and 40 g banana together on the side.',
        'Add 10 g whipped cream beside the fruit, not under the hot toast.',
        'Pack 1 sealed 30 g sugar-free maple-syrup cup beside the toast, then close and label the container.',
      ],
    },
    b3: {
      lean: [
        'Lay out 2 small tortillas.',
        'Split the Lean chicken, cooked egg mixture, and 56 g mozzarella evenly between both tortillas.',
        'Fold and dry-grill both quesadillas, then place both together in the container.',
        'Do not add a salsa or sauce cup; close and label the container.',
      ],
      bulk: [
        'Lay out 2 large tortillas.',
        'Split the Bulk chicken, cooked egg mixture, and 56 g mozzarella evenly between both tortillas.',
        'Fold and dry-grill both quesadillas, then place both together in the container.',
        'Do not add a salsa or sauce cup; close and label the container.',
      ],
    },
    b4: {
      lean: [
        'Lay out 2 small tortillas.',
        'Split the Lean beef filling, cooked egg mixture, and 28 g mozzarella evenly between both tortillas.',
        'Roll 2 tight burritos, dry-grill seam-side down, and place both in the container.',
        'Do not add a side cup; close and label the container.',
      ],
      bulk: [
        'Lay out 2 large tortillas.',
        'Split the Bulk beef filling, cooked egg mixture, and 42 g mozzarella evenly between both tortillas.',
        'Roll 2 tight burritos, dry-grill seam-side down, and place both in the container.',
        'Do not add a side cup; close and label the container.',
      ],
    },
    m1: {
      lean: [
        'Spread 1 measured Lean beef-and-vegetable filling portion evenly across the bottom of the container.',
        'Cover the filling completely with the measured Lean packaged mashed-potato portion.',
        'Sprinkle 28 g mozzarella evenly over the mash.',
        'Add 1 sealed 45 g PRPD Sweet Heat cup beside the pie, then close and label the container.',
      ],
      bulk: [
        'Spread 1 measured Bulk beef-and-vegetable filling portion evenly across the bottom of the container.',
        'Cover the filling completely with the measured Bulk packaged mashed-potato portion.',
        'Sprinkle 35 g mozzarella evenly over the mash.',
        'Add 1 sealed 45 g PRPD Sweet Heat cup beside the pie, then close and label the container.',
      ],
    },
    m2: {
      lean: [
        'Open 3 slider rolls and line them up in the container.',
        'Split the Lean hot-honey chicken evenly across all 3 rolls.',
        'Divide 28 g mozzarella and 15 g onion evenly across the sliders, then close each roll.',
        'Do not add pickles or a separate sauce cup this batch; close and label the container.',
      ],
      bulk: [
        'Open 4 slider rolls and line them up in the container.',
        'Split the Bulk hot-honey chicken evenly across all 4 rolls.',
        'Divide 42 g mozzarella and 20 g onion evenly across the sliders, then close each roll.',
        'Do not add pickles or a separate sauce cup this batch; close and label the container.',
      ],
    },
    m3: {
      lean: [
        'Place the measured 200 g roasted-potato allocation across the main section.',
        'Place 80 g broccoli neatly in the side section.',
        'Spread 1 measured Lean buffalo-chicken portion over the potatoes.',
        'No side cup is required; close and label the container.',
      ],
      bulk: [
        'Place the measured 200 g roasted-potato allocation across the main section.',
        'Place 80 g broccoli neatly in the side section.',
        'Spread 1 measured Bulk buffalo-chicken portion over the potatoes.',
        'No side cup is required; close and label the container.',
      ],
    },
    m4: {
      lean: [
        'Open 1 shawarma bread and add the cooked Lean seekh log.',
        'Add the measured lettuce, onion, and garlic-yogurt sauce; do not add pickles this batch.',
        'Roll tightly, cut into 2 equal halves, and wrap both halves together.',
        'Place the 2 wrapped halves in the labeled side bag or container and seal it.',
      ],
      bulk: [
        'Use 1.5 shawarma breads with the cooked Bulk seekh portion divided evenly between them.',
        'Add the measured lettuce, onion, and garlic-yogurt sauce; do not add pickles this batch.',
        'Roll tightly and cut into 3 equal wrapped halves.',
        'Place all 3 wrapped halves in the labeled side bag or container and seal it.',
      ],
    },
    m5: {
      lean: [
        'Place 1 measured Lean rice portion in the first section.',
        'Place 1 measured Lean roasted-broccoli portion in the second section.',
        'Place 1 measured Lean harissa-honey chicken portion in the main section.',
        'No side cup is required; close and label the container.',
      ],
      bulk: [
        'Place 1 measured Bulk rice portion in the first section.',
        'Place 1 measured Bulk roasted-broccoli portion in the second section.',
        'Place 1 measured Bulk harissa-honey chicken portion in the main section.',
        'No side cup is required; close and label the container.',
      ],
    },
    m6: {
      lean: [
        'Place 1 measured Lean rice portion in the first section.',
        'Place 1 measured Lean finished street-corn portion in the second section.',
        'Place 1 measured Lean chicken portion in the main section so all three components remain visible.',
        'The creamy street-corn finish is already mixed in; add no side cup, then close and label.',
      ],
      bulk: [
        'Place 1 measured Bulk rice portion in the first section.',
        'Place 1 measured Bulk finished street-corn portion in the second section.',
        'Place 1 measured Bulk chicken portion in the main section so all three components remain visible.',
        'The creamy street-corn finish is already mixed in; add no side cup, then close and label.',
      ],
    },
    m7: {
      lean: [
        'Place 1 measured Lean rice portion in the first section.',
        'Place 1 measured Lean peas-carrots-zucchini portion in the second section.',
        'Place 1 measured Lean garlic-butter shrimp portion in the main section and finish with its measured lemon.',
        'No side cup is required; close and label the container for earlier-week use.',
      ],
      bulk: [
        'Place 1 measured Bulk rice portion in the first section.',
        'Place 1 measured Bulk peas-carrots-zucchini portion in the second section.',
        'Place 1 measured Bulk garlic-butter shrimp portion in the main section and finish with its measured lemon.',
        'No side cup is required; close and label the container for earlier-week use.',
      ],
    },
    m8: {
      lean: [
        'Place 1 measured high-protein macaroni-and-cheese portion across the main section.',
        'Place 1 measured Lean BBQ-chicken portion over or directly beside the macaroni.',
        'Keep the 28 g mozzarella distributed with the macaroni.',
        'Add 1 sealed 30 g BBQ-sauce cup beside the meal, then close and label the container.',
      ],
      bulk: [
        'Place 1 measured high-protein macaroni-and-cheese portion across the main section.',
        'Place 1 measured Bulk BBQ-chicken portion over or directly beside the macaroni.',
        'Keep the 28 g mozzarella distributed with the macaroni.',
        'Add 1 sealed 30 g BBQ-sauce cup beside the meal, then close and label the container.',
      ],
    },
    p1: {
      lean: [
        'Place the sliced Lean steak portion in the main section.',
        'Place the measured Lean packaged mashed-potato portion in the first side section.',
        'Place the measured 100 g broccoli allocation in the second side section.',
        'Add 1 sealed 45 g PRPD Sweet Heat cup, then close and label the container.',
      ],
      bulk: [
        'Place the sliced Bulk steak portion in the main section.',
        'Place the measured 200 g packaged mashed-potato portion in the first side section.',
        'Place the measured 125 g broccoli allocation in the second side section.',
        'Add 1 sealed 45 g PRPD Sweet Heat cup, then close and label the container.',
      ],
    },
    d1: { single: [
      'Place exactly 3 chocolate-dipped cookie dough balls in 1 dessert container.',
      'Keep the balls separated enough that the chocolate coating does not stick them together.',
      'Close, label, and refrigerate the dessert container.',
    ] },
    d2: { single: [
      'Spoon 1 measured mousse portion into 1 dessert cup and level the top.',
      'Finish the cup with exactly 2 Oreo Thins.',
      'Close, label, and refrigerate the dessert cup.',
    ] },
    d3: { single: [
      'Place exactly 1 fully chilled, equal-weight cheesecake square in 1 dessert container.',
      'Keep the strawberry top facing upward and clean the container rim.',
      'Close, label, and refrigerate the dessert container.',
    ] },
    a1: { single: [
      'Use 1 clean 12 oz divided box.',
      'Place 2 chilled hard-boiled eggs, 1 beef-bacon slice, and 28 g cheese in the protein section.',
      'Place 1 whole mini apple and 60 g cucumber in the remaining section without crushing the apple.',
      'Add 1 sealed measured jalapeno-lemon yogurt dip cup, confirm the lid closes freely, then label and refrigerate.',
    ] },
    a2: { single: [
      'Lay out exactly 2 Mission Carb Balance 45-calorie tortillas.',
      'Split the cooled chicken, 20 g mozzarella, fresh salad, and house sauce evenly between both tortillas.',
      'Roll 2 tight snack wraps and place both together in the 12 oz box.',
      'Close, label, and refrigerate for earlier-week use.',
    ] },
    a3: { single: [
      'Fill 1 clean 12 oz cup with 1 measured overnight-oat portion.',
      'Keep the cooled strawberry reduction distributed through or over the oat base according to the finished batch.',
      'Clean the rim, seal the lid, label, and refrigerate overnight.',
    ] },
  };

  for (const [id, guide] of Object.entries(assemblyGuides)) {
    if (data.meals[id]) data.meals[id].assemblyGuide = guide;
  }

  // Batch 7 owner-approved rotation. This final override deliberately replaces
  // every archived Batch 6 method so the planner cannot pair a reused weekly ID
  // with the prior dish's cooking or plating instructions.
  data.batch = 7;
  data.version = '2026-08-17.1';
  data.familyAllocations = [];
  data.familyPlatingReservations = [];
  data.sharedProteinSeasoning = [{
    id: 'approved-b7-neutral-chicken-base',
    name: 'PRPD neutral savory chicken base',
    proteinKey: 'chicken_thigh_raw',
    dishIds: ['b4', 'm1', 'm4', 'm7', 'a2', 'a3'],
    note: 'Season compatible chicken together, then split exact recipe pulls before Sweet Heat, hot-honey, sweet-chili, Buffalo, wrap, or Caesar finishes.',
    basePerKg: [
      { key: 'salt', name: 'Fine salt', grams: 8, measure: { type: 'spice', gramsPerTsp: 6 } },
      { key: 'garlic_powder', name: 'Garlic powder', grams: 8, measure: { type: 'spice', gramsPerTsp: 3.1 } },
      { key: 'onion_powder', name: 'Onion powder', grams: 4, measure: { type: 'spice', gramsPerTsp: 2.4 } },
      { key: 'paprika', name: 'Paprika', grams: 3, measure: { type: 'spice', gramsPerTsp: 2.3 } },
      { key: 'black_pepper', name: 'Black pepper', grams: 2, measure: { type: 'spice', gramsPerTsp: 2.3 } },
    ],
  }];
  data.weeklySauces = {
    enabled: true,
    policy: 'Batch 7 provides one 45g PRPD Sweet Heat cup only with the Beef Bacon Breakfast Sandwich and Power Bowl.',
    cupSizeOz: 2,
    eligibleMealIds: ['b2', 'b4'],
    customerCupsTotal: 0,
    kitchenUseCupsPerSauce: 0,
    qcCupsPerSauce: 1,
    sauces: [{
      name: 'PRPD Sweet Heat Sauce', batchGroup: 'prpd-sweet-heat', ingredientsIncludedInRecipes: true,
      estimatedCaloriesPerCup: 87, provisional: false, netGramsPerCup: 45,
      ingredientsPerCup: [
        { key: 'light_mayo', name: 'Light mayonnaise', grams: 11.0294, station: 'Sauces & Dairy' },
        { key: 'ketchup', name: 'Ketchup', grams: 13.2353, station: 'Sauces & Dairy' },
        { key: 'honey', name: 'Honey', grams: 13.2353, station: 'Breakfast & Desserts' },
        { key: 'sriracha', name: 'Sriracha', grams: 7.5, station: 'Sauces & Dairy' },
      ],
      steps: ['Tare every cup and lid.', 'Whisk the controlled 250:300:300:170 ratio by weight.', 'Fill 45g net per eligible meal plus one QC cup.'],
    }],
  };

  const b7Protein = (name, group, sequence, equipment, steps, plating, hold, options = {}) => proteinMethod(
    name, group, sequence, options.recipeKeys || [], equipment, steps, plating, hold, options,
  );
  data.meals = {
    b1: meal(4, 10, ['griddle', 'mixing bowls', 'side cups'], 'Cook until the centers are fully set.', ['Cook three Lean or four Bulk pancakes per order.', 'Cool blueberry compote and cheesecake topping before filling one cup; fill syrup in a second cup.', 'Record batter yield, finished pancake count, and day-three reheat.'], 'Lean: three pancakes. Bulk: four. Pack two sealed cups.', 'Rapid-cool and refrigerate.', { sideCups: 2, prepSteps: ['Prepare compote and cheesecake topping; keep syrup separate.'] }),
    b2: b7Protein('Beef Bacon Breakfast Sandwich', 'beef', 20, ['sheet pan', 'egg pan', 'toaster'], ['Cook one measured egg patty and one beef-bacon slice per sandwich.', 'Lean gets one sandwich plus 150g potatoes; Bulk gets two sandwiches and no potatoes.', 'Pack one 45g Sweet Heat cup per order.'], 'Lean: one sandwich and potatoes. Bulk: two sandwiches. One Sweet Heat cup.', 'Refrigerate promptly.', { recipeKeys: ['beef_bacon'], sideCups: 1, sideCup: { name: 'PRPD Sweet Heat Sauce', batchGroup: 'prpd-sweet-heat', gramsPerMeal: 45, instruction: 'Pack one 45g cup.' } }),
    b3: meal(4, 30, ['egg pan', 'sheet pan', 'toaster'], 'Cook egg mixture until fully set.', ['Cook the complete measured omelette egg-and-vegetable batch.', 'Divide by Lean/Bulk recipe yield and pack sourdough separately.', 'Record finished egg yield.'], 'Pack the tier-specific omelette and bread count.', 'Rapid-cool and refrigerate.'),
    b4: b7Protein('Power Bowl chicken', 'chicken', 40, ['chicken oven', 'egg pan', 'potato oven'], ['Cook the exact chicken pull to 165 F.', 'Plate with 100g potatoes and two eggs.', 'Pack one 45g Sweet Heat cup.'], 'Tier-specific chicken, 100g potatoes, two eggs, one sauce cup.', 'Rapid-cool and refrigerate.', { recipeKeys: ['chicken_thigh_raw'], sideCups: 1, sideCup: { name: 'PRPD Sweet Heat Sauce', batchGroup: 'prpd-sweet-heat', gramsPerMeal: 45, instruction: 'Pack one 45g cup.' } }),
    m1: b7Protein('Hot Honey Slider chicken', 'chicken', 50, ['chicken oven', 'slider station'], ['Cook exact chicken pull to 165 F and record yield.', 'Add measured sriracha hot-honey finish.', 'Assemble three Lean or four Bulk sliders with cheese, pickles, and onion.'], 'Lean: three sliders. Bulk: four.', 'Rapid-cool and refrigerate.', { recipeKeys: ['chicken_thigh_raw'] }),
    m2: b7Protein('Chicken Biryani', 'chicken', 60, ['heavy pot', 'rice pot'], ['Marinate the separate biryani chicken pull.', 'Par-cook rice; build the onion-tomato chicken base.', 'Layer, steam on low, rest, fluff, and record total usable yield.'], 'Divide the finished biryani by tier-controlled yield.', 'Rapid-cool in shallow pans.', { recipeKeys: ['chicken_thigh_raw'], riceBatchGroup: 'biryani' }),
    m3: b7Protein('Butter Chicken', 'chicken', 70, ['chicken oven', 'sauce pot', 'rice pot'], ['Cook the separate marinated chicken pull to 165 F.', 'Build sauce with tomato paste, measured water, butter, yogurt, garlic, and ginger; never use broth.', 'Combine, record finished yield, and plate with rice.'], 'Tier-specific chicken, sauce, and rice.', 'Rapid-cool in shallow pans.', { recipeKeys: ['chicken_thigh_raw'], riceBatchGroup: 'common' }),
    m4: b7Protein('Sweet Chili chicken', 'chicken', 80, ['chicken oven', 'rice pot'], ['Cook exact chicken pull to 165 F.', 'Add sweet-chili finish after recording yield.', 'Fold peas and carrots into the measured rice batch and plate.'], 'Tier-specific chicken and vegetable rice.', 'Rapid-cool and refrigerate.', { recipeKeys: ['chicken_thigh_raw'], riceBatchGroup: 'common' }),
    m5: b7Protein('Arrabbiata meatballs', 'beef', 90, ['400 F oven', 'pasta pot', 'sauce pot'], ['Form equal meatballs and bake first to 160 F.', 'Cook protein pasta to controlled yield and simmer the tomato arrabbiata sauce.', 'Plate exact meatball, pasta, sauce, and mozzarella quantities.'], 'Keep meatball count and pasta portion visible by tier.', 'Rapid-cool and refrigerate.', { recipeKeys: ['beef_90_raw'] }),
    m6: b7Protein('Cajun Garlic Salmon', 'seafood', 100, ['425 F oven', 'quinoa pot', 'green-bean oven tray'], ['Thaw safely, pat dry, check pin bones, season, and roast skin-side down to 145 F.', 'Remove skin after cooking; record thawed, skinless cooked, and plated weights.', 'Plate with lemon-herb quinoa and roasted green beans.'], 'Lean: 220g purchased salmon input, 50g dry quinoa, 120g green beans. Bulk: 300g, 65g, 150g.', 'Use earlier in the week; rapid-cool and refrigerate.', { recipeKeys: ['pink_salmon_raw'], endpoint: '145 F', temperature: 'Cook salmon to 145 F.' }),
    m7: b7Protein('Loaded Buffalo chicken', 'chicken', 110, ['chicken oven', 'potato oven', 'broccoli tray'], ['Cook exact chicken pull to 165 F.', 'Add Buffalo sauce after recording yield.', 'Plate with the corrected 200g potato allocation and broccoli.'], 'Use 200g potatoes per meal with tier-specific chicken.', 'Rapid-cool and refrigerate.', { recipeKeys: ['chicken_thigh_raw'] }),
    m8: b7Protein('Southwest taco beef', 'beef', 120, ['beef skillet', 'rice pot', 'cold topping station'], ['Cook beef to 160 F, drain, and add taco finish.', 'Cook rice and hot corn-pepper-black-bean component.', 'Pack lettuce, cotija, and jalapeno-lime yogurt separately from hot components.'], 'Tier-specific beef, rice, beans, corn and peppers; one cold sauce cup.', 'Use earlier in the week; refrigerate promptly.', { recipeKeys: ['beef_90_raw'], sideCups: 1, sideCup: { name: 'Jalapeno-lime yogurt sauce', batchGroup: 'southwest-yogurt', gramsPerMeal: 37, instruction: 'Pack one sealed cold cup.' }, riceBatchGroup: 'common' }),
    d1: meal(3, 130, ['blender', 'round or square baking pan', 'oven'], 'Bake at 325 F until edges are set and center moves as one piece.', ['Blend the exact batter, swirl in cooled strawberry reduction, bake, and chill fully.', 'Cut into equal weighed individual portions rather than promising a square shape.', 'Record batter, baked pan, and individual weights.'], 'One chilled portion per dessert container.', 'Serve chilled.'),
    d2: meal(3, 140, ['mixing bowls', 'dessert cups'], 'No final cook.', ['Whisk the banana protein cream until smooth.', 'Portion by weight and finish with the measured Biscoff cookies.', 'Record final cup count and filled weight.'], 'One chilled cup per order.', 'Serve chilled.'),
    d3: meal(3, 150, ['mixing bowls', 'coffee tray', 'dessert cups'], 'No final cook.', ['Mix the measured mascarpone protein cream.', 'Dip ladyfingers briefly in cooled coffee, layer, and chill overnight.', 'Record final cup count, filled weight, and overnight set.'], 'One chilled cup per order.', 'Serve chilled.'),
    a1: meal(3, 160, ['egg pot', '12 oz divided boxes'], 'Cook eggs fully.', ['Chill eggs and beef bacon.', 'Assemble cheese, weighed mini apple, cucumber, and sealed dip.', 'Confirm every lid closes freely.'], 'One 12 oz Protein Box per order.', 'Serve chilled.'),
    a2: b7Protein('Mini Snack Wrap chicken', 'chicken', 170, ['chicken oven', 'wrap station'], ['Cook exact chicken pull to 165 F and cool.', 'Split chicken, cheese, fresh salad, and sauce across two tortillas.', 'Roll tightly and pack both wraps together.'], 'Two wraps per order.', 'Use earlier in the week.', { recipeKeys: ['chicken_thigh_raw'] }),
    a3: b7Protein('Caesar Crunch Box chicken', 'chicken', 180, ['chicken oven', 'cold box station'], ['Cook exact chicken pull to 165 F, record yield, and chill.', 'Pack lettuce, cucumber, Parmesan, and chicken in the 12 oz box.', 'Keep 35g dressing sealed and croutons dry and separate.'], 'One chilled 12 oz box, one dressing cup, one dry crouton bag.', 'Use earlier in the week.', { recipeKeys: ['chicken_thigh_raw'], sideCups: 1, sideBags: 1, sideCup: { name: 'Yogurt-Caesar dressing', batchGroup: 'caesar-dressing', gramsPerMeal: 35, instruction: 'Pack one sealed dressing cup.' } }),
  };

  const b7Guides = {
    b1: { lean: ['Place 3 pancakes in the meal container.', 'Add one blueberry-cheesecake topping cup and one syrup cup.', 'Close, label, and refrigerate.'], bulk: ['Place 4 pancakes in the meal container.', 'Add one blueberry-cheesecake topping cup and one syrup cup.', 'Close, label, and refrigerate.'] },
    b2: { lean: ['Pack 1 complete sandwich.', 'Add 150g roasted potatoes and one 45g Sweet Heat cup.', 'Close, label, and refrigerate.'], bulk: ['Pack 2 complete sandwiches with no potato side.', 'Add one 45g Sweet Heat cup.', 'Close, label, and refrigerate.'] },
    b3: { lean: ['Pack one Lean omelette portion and 1 sourdough slice separately.', 'Close, label, and refrigerate.'], bulk: ['Pack one Bulk omelette portion and 2 sourdough slices separately.', 'Close, label, and refrigerate.'] },
    b4: { lean: ['Pack the Lean chicken, 100g potatoes, and 2 eggs.', 'Add one 45g Sweet Heat cup.', 'Close, label, and refrigerate.'], bulk: ['Pack the Bulk chicken, 100g potatoes, and 2 eggs.', 'Add one 45g Sweet Heat cup.', 'Close, label, and refrigerate.'] },
    m1: { lean: ['Pack exactly 3 assembled sliders.', 'Close, label, and refrigerate.'], bulk: ['Pack exactly 4 assembled sliders.', 'Close, label, and refrigerate.'] },
    m2: { lean: ['Pack one measured Lean biryani portion.', 'Close, label, and refrigerate.'], bulk: ['Pack one measured Bulk biryani portion.', 'Close, label, and refrigerate.'] },
    m3: { lean: ['Pack Lean butter chicken and sauce with the measured rice.', 'Close, label, and refrigerate.'], bulk: ['Pack Bulk butter chicken and sauce with the measured rice.', 'Close, label, and refrigerate.'] },
    m4: { lean: ['Pack Lean sweet-chili chicken with vegetable rice.', 'Close, label, and refrigerate.'], bulk: ['Pack Bulk sweet-chili chicken with vegetable rice.', 'Close, label, and refrigerate.'] },
    m5: { lean: ['Pack the Lean meatball, pasta, sauce, and mozzarella portions.', 'Close, label, and refrigerate.'], bulk: ['Pack the Bulk meatball, pasta, sauce, and mozzarella portions.', 'Close, label, and refrigerate.'] },
    m6: { lean: ['Pack the verified Lean salmon portion with quinoa and 120g green beans.', 'Close, label, and refrigerate.'], bulk: ['Pack the verified Bulk salmon portion with quinoa and 150g green beans.', 'Close, label, and refrigerate.'] },
    m7: { lean: ['Pack Lean Buffalo chicken with 200g potatoes and broccoli.', 'Close, label, and refrigerate.'], bulk: ['Pack Bulk Buffalo chicken with 200g potatoes and broccoli.', 'Close, label, and refrigerate.'] },
    m8: { lean: ['Pack Lean beef, rice, beans, corn and peppers.', 'Keep lettuce/cotija cold and add one sauce cup.', 'Close, label, and refrigerate.'], bulk: ['Pack Bulk beef, rice, beans, corn and peppers.', 'Keep lettuce/cotija cold and add one sauce cup.', 'Close, label, and refrigerate.'] },
    d1: { single: ['Pack one fully chilled equal-weight cheesecake portion.', 'Close, label, and refrigerate.'] },
    d2: { single: ['Pack one measured Banana Cream Pie Cup.', 'Close, label, and refrigerate.'] },
    d3: { single: ['Pack one fully chilled Tiramisu cup.', 'Close, label, and refrigerate.'] },
    a1: { single: ['Pack 2 eggs, 1 beef-bacon slice, cheese, mini apple, cucumber, and dip.', 'Close, label, and refrigerate.'] },
    a2: { single: ['Pack exactly 2 snack wraps.', 'Close, label, and refrigerate.'] },
    a3: { single: ['Pack chicken, lettuce, cucumber, and Parmesan in one 12 oz box.', 'Add one dressing cup and one dry crouton bag.', 'Close, label, and refrigerate.'] },
  };
  for (const [id, guide] of Object.entries(b7Guides)) data.meals[id].assemblyGuide = guide;

  for (const method of Object.values(data.meals)) {
    if (!method.prepSteps.length) method.prepSteps = [method.steps[0]];
    while (method.steps.length < 3) method.steps.push('Verify the finished count, portion weight, label, and cold-holding status before release.');
  }

  return data;
});
