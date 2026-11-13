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
    componentMap: options.componentMap || [],
    cookDayReservations: options.cookDayReservations || [],
    cookDayEquipment: options.cookDayEquipment || null,
    panBatch: options.panBatch || null,
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
      riceBatchGroup: 'common',
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
  // This tested Batch 6 dessert did not appear in the later rotating-menu
  // snapshots. Keep its method by recipe identity so a future return cannot
  // inherit whichever dessert happens to occupy the same slot.
  const chocolateDippedCookieDoughBallsMethod = JSON.parse(JSON.stringify(data.meals.d1));
  chocolateDippedCookieDoughBallsMethod.recipeName = 'Chocolate-Dipped Cookie Dough Balls';

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
  data.version = '2026-08-20.7';
  data.familyAllocations = [];
  data.familyPlatingReservations = [
    { customer: 'Talal', dishId: 'b2', tier: 'bulk', qty: 3, note: 'Pack separately; three Bulk orders equal six sandwiches.' },
    { customer: 'Talal', dishId: 'm1', tier: 'bulk', qty: 3, note: 'Pack separately; four sliders per Bulk order.' },
    { customer: 'Talal', dishId: 'p1', tier: 'bulk', qty: 3, note: 'Pack separately with one 30g BBQ sauce cup per meal.' },
    { customer: 'Nouman', dishId: 'p2', tier: 'lean', qty: 5, note: 'Five hot chicken containers, five cold salads, and five dressing cups.' },
  ];
  data.labelExemptCustomers = ['Duaa', 'Rida'];
  data.sharedProteinSeasoning = [{
    id: 'approved-b7-neutral-chicken-base',
    name: 'PRPD neutral savory chicken base',
    proteinKey: 'chicken_thigh_raw',
    dishIds: ['b4', 'm1', 'm4', 'm7', 'a2', 'a3', 'p1'],
    note: 'Season compatible chicken together, then split exact recipe pulls before jalapeno-lime, hot-honey, sweet-chili, Buffalo, wrap, or Caesar finishes.',
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
    policy: 'Batch 7 provides one 45g Creamy Jalapeno-Lime Yogurt Sauce cup with the Beef Bacon Breakfast Sandwich and Power Bowl. Use the same 28:5:3:1 formula as the Southwest Beef Taco Bowl sauce so production stays in one shared batch.',
    cupSizeOz: 2,
    eligibleMealIds: ['b2', 'b4'],
    customerCupsTotal: 0,
    kitchenUseCupsPerSauce: 0,
    qcCupsPerSauce: 1,
    sauces: [{
      name: 'Creamy Jalapeno-Lime Yogurt Sauce', batchGroup: 'southwest-yogurt', ingredientsIncludedInRecipes: true,
      estimatedCaloriesPerCup: 22, provisional: false, netGramsPerCup: 45,
      ingredientsPerCup: [
        { key: 'fage', name: 'Nonfat Greek yogurt', grams: 34.0541, station: 'Sauces & Dairy' },
        { key: 'lime', name: 'Lime juice', grams: 6.0811, station: 'Cold Prep & Produce' },
        { key: 'jalapeno', name: 'Jalapeno', grams: 3.6486, station: 'Cold Prep & Produce' },
        { key: 'garlic', name: 'Garlic', grams: 1.2162, station: 'Cold Prep & Produce' },
      ],
      steps: ['Tare every cup and lid.', 'Blend or whisk the controlled 28:5:3:1 yogurt:lime:jalapeno:garlic ratio until smooth.', 'Fill 45g net per Breakfast Sandwich and Power Bowl, 37g net per Southwest Beef Taco Bowl, plus one QC cup.'],
    }],
  };

  const b7Protein = (name, group, sequence, equipment, steps, plating, hold, options = {}) => proteinMethod(
    name, group, sequence, options.recipeKeys || [], equipment, steps, plating, hold, options,
  );
  data.meals = {
    b1: meal(4, 10, ['griddle', 'mixing bowls', 'side cups'], 'Cook until the centers are fully set.', ['Cook three Lean or four Bulk pancakes per order.', 'Cool blueberry compote and cheesecake topping before filling one cup; fill syrup in a second cup.', 'Record batter yield, finished pancake count, and day-three reheat.'], 'Lean: three pancakes. Bulk: four. Pack two sealed cups.', 'Rapid-cool and refrigerate.', { sideCups: 2, prepSteps: ['Prepare compote and cheesecake topping; keep syrup separate.'] }),
    b2: b7Protein('Beef Bacon Breakfast Sandwich', 'beef', 20, ['sheet pan', 'egg pan', 'toaster'], ['Cook one measured egg patty and one beef-bacon slice per sandwich.', 'Lean gets one sandwich plus 150g potatoes; Bulk gets two sandwiches and no potatoes.', 'Pack one 45g Creamy Jalapeno-Lime Yogurt Sauce cup per order.'], 'Lean: one sandwich and potatoes. Bulk: two sandwiches. One sauce cup.', 'Refrigerate promptly.', { recipeKeys: ['beef_bacon'], sideCups: 1, sideCup: { name: 'Creamy Jalapeno-Lime Yogurt Sauce', batchGroup: 'southwest-yogurt', gramsPerMeal: 45, instruction: 'Pack one 45g cup.' } }),
    b3: meal(4, 30, ['egg pan', 'sheet pan', 'toaster'], 'Cook egg mixture until fully set.', ['Cook the complete measured omelette egg-and-vegetable batch.', 'Divide by Lean/Bulk recipe yield and pack sourdough separately.', 'Record finished egg yield.'], 'Pack the tier-specific omelette and bread count.', 'Rapid-cool and refrigerate.'),
    b4: b7Protein('Power Bowl chicken', 'chicken', 40, ['chicken oven', 'egg pan', 'potato oven'], ['Cook the exact chicken pull to 165 F.', 'Plate with 100g potatoes and two eggs.', 'Pack one 45g Creamy Jalapeno-Lime Yogurt Sauce cup.'], 'Tier-specific chicken, 100g potatoes, two eggs, one sauce cup.', 'Rapid-cool and refrigerate.', { recipeKeys: ['chicken_thigh_raw'], sideCups: 1, sideCup: { name: 'Creamy Jalapeno-Lime Yogurt Sauce', batchGroup: 'southwest-yogurt', gramsPerMeal: 45, instruction: 'Pack one 45g cup.' } }),
    m1: b7Protein('Hot Honey Slider chicken', 'chicken', 50, ['chicken oven', 'slider station'], ['Cook exact chicken pull to 165 F and record yield.', 'Add measured sriracha hot-honey finish.', 'Assemble three Lean or four Bulk sliders with cheese, pickles, and onion.'], 'Lean: three sliders. Bulk: four.', 'Rapid-cool and refrigerate.', { recipeKeys: ['chicken_thigh_raw'] }),
    m2: b7Protein('Chicken Biryani', 'chicken', 60, ['heavy pot', 'rice pot'], ['Marinate the separate biryani chicken pull.', 'Par-cook rice; build the onion-tomato chicken base.', 'Layer, steam on low, rest, fluff, and record total usable yield.'], 'Divide the finished biryani by tier-controlled yield.', 'Rapid-cool in shallow pans.', {
      recipeKeys: ['chicken_thigh_raw', 'fage', 'onion', 'tomato', 'garlic', 'ginger', 'lemon', 'avocado_oil', 'salt'],
      riceBatchGroup: 'common',
      prepSteps: ['Measure and refrigerate the complete Chicken Biryani marinade in its own labeled bowl.', 'Keep the Biryani chicken separate from every neutral-seasoned chicken batch.', 'Cook and rapid-cool the exact Biryani rice allocation on Prep Day.'],
      prepBatches: [
        prep('marinade', 'Measured Chicken Biryani marinade', 'Prepare only for the active Biryani order count. Keep this Desi batch completely separate from the shared neutral chicken.', ['chicken_thigh_raw', 'fage', 'onion', 'tomato', 'garlic', 'ginger', 'lemon', 'avocado_oil', 'salt'], [
          'Weigh the exact raw Biryani chicken into its labeled bowl.',
          'Whisk the displayed FAGE, lemon, garlic, ginger, avocado oil, and salt until uniform; coat the chicken completely.',
          'Keep the displayed onion and tomato together in a separate labeled cook-day base container; do not bury them in the raw-chicken bag.',
          'Cover both containers, label Chicken Biryani, date, and refrigerate at 40 F or below.',
        ], { unmeasured: ['The saved recipe does not contain a gram-controlled dry Desi spice blend. Do not invent amounts inside the planner. Record every actual garam masala, turmeric, chile, coriander, or other dry-spice weight used so the recipe, grocery build, and labels can be synchronized after this batch.'] }),
        prep('starch-ahead', 'Chicken Biryani rice allocation', 'Include only the displayed Biryani dry-rice allocation in the active rice work.', ['rice_dry'], ['Record dry weight and finished yield.', 'Rapid-cool in a shallow labeled pan and refrigerate.'], { prepWave: 'rice', prepWaveName: 'Active rice production' }),
      ],
    }),
    m3: b7Protein('Butter Chicken', 'chicken', 70, ['chicken oven', 'sauce pot', 'rice pot'], ['Cook the separate marinated chicken pull to 165 F.', 'Build sauce with tomato paste, measured water, butter, yogurt, garlic, and ginger; never use broth.', 'Combine, record finished yield, and plate with rice.'], 'Tier-specific chicken, sauce, and rice.', 'Rapid-cool in shallow pans.', {
      recipeKeys: ['chicken_thigh_raw', 'fage', 'lemon', 'salt'],
      riceBatchGroup: 'common',
      prepSteps: ['Measure the Butter Chicken yogurt marinade and sauce kit from the exact active tier counts.', 'Keep Butter Chicken separate from the neutral chicken family and never add broth.', 'Cook and rapid-cool its rice allocation on Prep Day.'],
      prepBatches: [
        prep('marinade', 'Butter Chicken marinade and sauce kit', 'Measure the complete active Butter Chicken pull now; marinate the chicken and keep the sauce ingredients in a second labeled container.', ['chicken_thigh_raw', 'fage', 'onion', 'tomato_paste', 'water', 'butter', 'lemon', 'garlic', 'ginger', 'salt'], [
          'Weigh the exact raw Butter Chicken pull into its own labeled bowl.',
          'From the displayed total FAGE, reserve exactly 15 g per ordered meal for the raw-chicken marinade. Keep the remaining FAGE for the sauce.',
          'Mix the marinade FAGE with the displayed lemon and salt, coat the chicken, cover, label, date, and refrigerate at 40 F or below.',
          'In a separate Butter Chicken sauce container, stage the displayed onion, tomato paste, measured water, butter, garlic, ginger, and remaining FAGE. Never use broth.',
        ], { unmeasured: ['The saved recipe does not contain a gram-controlled dry Butter Chicken masala blend. Do not invent amounts inside the planner. Record every actual garam masala, turmeric, chile, coriander, or other dry-spice weight used so the recipe, grocery build, and labels can be synchronized after this batch.'] }),
        prep('starch-ahead', 'Butter Chicken rice allocation', 'Include only the displayed Butter Chicken dry-rice allocation in the active rice work.', ['rice_dry'], ['Record dry weight and finished yield.', 'Rapid-cool in a shallow labeled pan and refrigerate.'], { prepWave: 'rice', prepWaveName: 'Active rice production' }),
      ],
    }),
    m4: b7Protein('Sweet Chili chicken', 'chicken', 80, ['chicken oven', 'rice pot'], ['Cook exact chicken pull to 165 F.', 'Add sweet-chili finish after recording yield.', 'Fold peas and carrots into the measured rice batch and plate.'], 'Tier-specific chicken and vegetable rice.', 'Rapid-cool and refrigerate.', { recipeKeys: ['chicken_thigh_raw'], riceBatchGroup: 'common' }),
    m5: b7Protein('Arrabbiata meatballs', 'beef', 90, ['400 F oven', 'pasta pot', 'sauce pot'], ['Form equal meatballs and bake first to 160 F.', 'Cook protein pasta to controlled yield and simmer the tomato arrabbiata sauce.', 'Plate exact meatball, pasta, sauce, and mozzarella quantities.'], 'Keep meatball count and pasta portion visible by tier.', 'Rapid-cool and refrigerate.', {
      recipeKeys: ['beef_90_raw', 'egg', 'breadcrumbs', 'onion', 'garlic', 'salt'],
      piecePlan: { lean: 8, bulk: 10, formedGrams: 25.5, reservePct: 12, note: 'The reserve protects against damage and yield variance; never shrink a customer portion.' },
      prepSteps: ['Mix and form the complete active Arrabbiata meatball batch on Prep Day.', 'Cook the active protein-pasta and Arrabbiata sauce quantities separately, then rapid-cool.'],
      prepBatches: [
        prep('protein-mix', 'Form every active Arrabbiata meatball', 'Use the exact active Lean/Bulk counts. Form the displayed customer pieces plus the computed 12% damage reserve.', ['beef_90_raw', 'egg', 'breadcrumbs', 'onion', 'garlic', 'salt'], [
          'Mix the displayed beef, egg, breadcrumbs, onion, garlic, and salt only until evenly combined.',
          'Weigh the complete raw mixture, then form every piece at 25-26 g.',
          'Count the displayed customer requirement and reserve separately; cover, label, date, and refrigerate at 40 F or below.',
        ], { pieceNoun: 'meatball', reservePct: 12, pieceTargets: { lean: { piecesPerServing: 8, gramsPerPiece: 25.5, label: 'Lean customer meatballs' }, bulk: { piecesPerServing: 10, gramsPerPiece: 25.5, label: 'Bulk customer meatballs' } } }),
        prep('starch-ahead', 'Meatball pasta · cook the pasta', 'Cook the measured pasta; make its tomato sauce in Sauces.', ['protein_pasta'], [
          'Cook the measured dry protein pasta in boiling water about one minute short of package timing; drain.',
          'Record the cooked pasta yield, rapid-cool in a shallow labeled pan, and refrigerate separately from the sauce.',
        ], { prepWave: 'pasta-sauce', prepWaveName: 'Active pasta production' }),
        prep('sauce', 'Meatball pasta · tomato sauce', 'Make one sauce batch for all Lean and Bulk meatball pasta meals.', ['crushed_tomatoes', 'tomato_paste'], [
          'Combine the displayed crushed tomatoes and tomato paste in a saucepan. Stir until the paste is fully dispersed.',
          'Bring to a gentle simmer over medium heat, then reduce the heat and stir regularly until the sauce coats a spoon; keep it loose enough to coat pasta.',
          'The recipe garlic, onion, and salt are already allocated to the meatballs. Keep mozzarella cold for assembly; do not add those allocations to this sauce again.',
          'If making ahead, record the finished sauce yield, rapid-cool in a shallow labeled pan, and refrigerate. On Cook Day, reheat with the prepared pasta to 165 F and divide the sauce evenly across all ordered meatball pasta meals.',
        ]),
      ],
    }),
    m6: b7Protein('Cajun Garlic Salmon', 'seafood', 100, ['425 F oven', 'quinoa pot', 'green-bean oven tray'], ['Thaw safely, pat dry, check pin bones, season, and roast skin-side down to 145 F.', 'Remove skin after cooking; record thawed, skinless cooked, and plated weights.', 'Plate with lemon-herb quinoa and roasted green beans.'], 'Lean: 220g purchased salmon input, 50g dry quinoa, 120g green beans. Bulk: 300g, 65g, 150g.', 'Use earlier in the week; rapid-cool and refrigerate.', { recipeKeys: ['pink_salmon_raw'], endpoint: '145 F', temperature: 'Cook salmon to 145 F.' }),
    m7: b7Protein('Loaded Buffalo chicken', 'chicken', 110, ['chicken oven', 'potato oven', 'broccoli tray'], ['Cook exact chicken pull to 165 F.', 'Add Buffalo sauce after recording yield.', 'Plate with the corrected 200g potato allocation and broccoli.'], 'Use 200g potatoes per meal with tier-specific chicken.', 'Rapid-cool and refrigerate.', { recipeKeys: ['chicken_thigh_raw'] }),
    m8: b7Protein('Southwest taco beef', 'beef', 120, ['beef skillet', 'rice pot', 'cold topping station'], ['Cook beef to 160 F, drain, and add taco finish.', 'Cook rice and hot corn-pepper-black-bean component.', 'Pack lettuce, cotija, and jalapeno-lime yogurt separately from hot components.'], 'Tier-specific beef, rice, beans, corn and peppers; one cold sauce cup.', 'Use earlier in the week; refrigerate promptly.', { recipeKeys: ['beef_90_raw'], sideCups: 1, sideCup: { name: 'Jalapeno-lime yogurt sauce', batchGroup: 'southwest-yogurt', gramsPerMeal: 37, instruction: 'Pack one sealed cold cup.' }, riceBatchGroup: 'common' }),
    d1: meal(3, 130, ['blender', 'round or square baking pan', 'oven'], 'Bake at 325 F until edges are set and center moves as one piece.', ['Blend the exact batter, swirl in cooled strawberry reduction, bake, and chill fully.', 'Cut into equal weighed individual portions rather than promising a square shape.', 'Record batter, baked pan, and individual weights.'], 'One chilled portion per dessert container.', 'Serve chilled.'),
    d2: meal(3, 140, ['mixing bowls', 'dessert cups'], 'No final cook.', ['Whisk the banana protein cream until smooth.', 'Portion by weight and finish with the measured Biscoff cookies.', 'Record final cup count and filled weight.'], 'One chilled cup per order.', 'Serve chilled.'),
    d3: meal(3, 150, ['mixing bowls', 'coffee tray', 'dessert cups'], 'No final cook.', ['Mix the measured mascarpone protein cream.', 'Dip ladyfingers briefly in cooled coffee, layer, and chill overnight.', 'Record final cup count, filled weight, and overnight set.'], 'One chilled cup per order.', 'Serve chilled.'),
    a1: meal(3, 160, ['egg pot', '12 oz divided boxes'], 'Cook eggs fully.', ['Chill eggs and beef bacon.', 'Assemble cheese, weighed mini apple, cucumber, and sealed dip.', 'Confirm every lid closes freely.'], 'One 12 oz Protein Box per order.', 'Serve chilled.'),
    a2: b7Protein('Mini Snack Wrap chicken', 'chicken', 170, ['chicken oven', 'wrap station'], ['Cook exact chicken pull to 165 F and cool.', 'Split chicken, cheese, fresh salad, and sauce across two tortillas.', 'Roll tightly and pack both wraps together.'], 'Two wraps per order.', 'Use earlier in the week.', { recipeKeys: ['chicken_thigh_raw'] }),
    a3: b7Protein('Caesar Crunch Box chicken', 'chicken', 180, ['chicken oven', 'cold box station'], ['Cook exact chicken pull to 165 F, record yield, and chill.', 'Pack lettuce, cucumber, Parmesan, and chicken in the 12 oz box.', 'Keep 35g dressing sealed and croutons dry and separate.'], 'One chilled 12 oz box, one dressing cup, one dry crouton bag.', 'Use earlier in the week.', { recipeKeys: ['chicken_thigh_raw'], sideCups: 1, sideBags: 1, sideCup: { name: 'Yogurt-Caesar dressing', batchGroup: 'caesar-dressing', gramsPerMeal: 35, instruction: 'Pack one sealed dressing cup.' } }),
    p1: b7Protein('BBQ Chicken Mac chicken', 'chicken', 185, ['chicken oven', 'mac pot', 'sauce-cup station'], ['Cook the exact shared-base chicken pull to 165 F and record the finished yield.', 'Cook 60g dry high-protein mac per Bulk meal; divide only after recording the finished mac yield.', 'Plate chicken and mac with 28g mozzarella, then add one separate 30g BBQ sauce cup per meal.'], 'Bulk: measured chicken, mac, 28g mozzarella, and one 30g BBQ sauce cup.', 'Rapid-cool and refrigerate; freezer-friendly.', { recipeKeys: ['chicken_thigh_raw'], sideCups: 1, sideCup: { name: 'BBQ sauce', batchGroup: 'bbq-mac', gramsPerMeal: 30, instruction: 'Pack one separate 30g BBQ sauce cup.' } }),
    p2: b7Protein('Lebanese-style chicken breast', 'chicken', 190, ['chicken oven or grill', 'cold salad station', 'dressing cups'], ['On Prep Day, marinate the exact customer chicken pull plus a separate 5% pooled reserve with measured lemon, garlic, oil, paprika, cumin, pepper, and salt. Do not use sumac.', 'On Cook Day, cook every chicken piece to 165 F, record the total yield, and portion exactly 225g cooked chicken into each hot container.', 'Pack one separate 200g salad and one separate 15g lemon-garlic dressing cup per meal; keep both cold.'], 'Per meal: 225g cooked chicken in one hot container, 200g salad in one cold container, and one 15g dressing cup.', 'Rapid-cool chicken; hold all components at 40 F or below. Do not freeze the salad.', {
      recipeKeys: ['chicken_breast_raw', 'lemon', 'garlic', 'avocado_oil', 'paprika', 'cumin', 'black_pepper', 'salt'],
      sideCups: 1,
      prepSteps: ['Scale Nouman chicken, marinade, salad, and dressing only from the active custom-meal count.', 'Keep the 5% raw-chicken reserve plain and physically separate until a measured shortage requires it.', 'Wash and dry the salad produce; make the dressing without sumac and hold cold.'],
      prepBatches: [
        prep('marinade', 'Nouman Lebanese chicken marinade', 'For each active custom meal, marinate a 300 g customer chicken pull and hold a separate plain 15 g reserve. The reserve is not automatically cooked.', [], [
          'Weigh the displayed customer chicken and plain reserve into separate labeled containers.',
          'Whisk the displayed lemon, garlic, avocado oil, paprika, cumin, black pepper, and salt; coat only the customer chicken pull.',
          'Do not add sumac. Cover, label, date, and refrigerate both containers at 40 F or below.',
        ], { formulaIngredients: [
          { key: 'chicken_breast_raw_customer', name: 'Chicken breast customer pull', unit: 'g', perServing: 300, includeInGrocery: false },
          { key: 'chicken_breast_raw_reserve', name: 'Plain chicken breast reserve', unit: 'g', perServing: 15, includeInGrocery: false },
          { key: 'lemon_marinade', name: 'Lemon juice for marinade', unit: 'g', perServing: 8, includeInGrocery: false },
          { key: 'garlic_marinade', name: 'Minced garlic for marinade', unit: 'g', perServing: 3, includeInGrocery: false },
          { key: 'avocado_oil_marinade', name: 'Avocado oil for marinade', unit: 'g', perServing: 2, includeInGrocery: false },
          { key: 'paprika_marinade', name: 'Paprika', unit: 'g', perServing: 1, includeInGrocery: false },
          { key: 'cumin_marinade', name: 'Ground cumin', unit: 'g', perServing: 0.5, includeInGrocery: false },
          { key: 'black_pepper_marinade', name: 'Black pepper', unit: 'g', perServing: 0.4, includeInGrocery: false },
          { key: 'salt_marinade', name: 'Fine salt for marinade', unit: 'g', perServing: 0.75, includeInGrocery: false },
        ] }),
        prep('mix', 'Nouman salad produce kits', 'Stage one 200 g cold salad per active custom meal; keep the vegetables dry and separate from dressing.', ['lettuce', 'cucumber', 'tomato', 'red_onion', 'parsley'], ['Wash and dry every vegetable thoroughly.', 'Keep lettuce whole and the other produce in labeled bulk bowls until Cook Day for best texture.', 'Do not dress the salad during Prep Day.']),
        prep('sauce', 'Nouman lemon-garlic dressing cups', 'Make one 15 g dressing cup per active custom meal. Do not use sumac.', [], ['Whisk until uniform.', 'Fill the exact active cup count to 15 g net each; seal, label, date, and refrigerate.'], { formulaIngredients: [
          { key: 'lemon_dressing', name: 'Lemon juice for dressing', unit: 'g', perServing: 12, includeInGrocery: false },
          { key: 'garlic_dressing', name: 'Minced garlic for dressing', unit: 'g', perServing: 1, includeInGrocery: false },
          { key: 'avocado_oil_dressing', name: 'Avocado oil for dressing', unit: 'g', perServing: 1, includeInGrocery: false },
          { key: 'black_pepper_dressing', name: 'Black pepper for dressing', unit: 'g', perServing: 0.1, includeInGrocery: false },
          { key: 'salt_dressing', name: 'Fine salt for dressing', unit: 'g', perServing: 0.25, includeInGrocery: false },
        ] }),
      ],
    }),
  };

  // Complete recipe-owned prep plans for the active Batch 7 production run.
  // Quantities are always scaled from imported counts by componentPlan; these
  // definitions never activate an unordered dish.
  const activeB7PrepPlans = {
    b2: {
      prepSteps: ['Count the purchased beef bacon, cook every measured egg patty, and cook the Lean-only potato allocation today.'],
      prepBatches: [
        prep('protein-portion', 'Breakfast Sandwich beef-bacon count', 'Stage one purchased beef-bacon slice per physical sandwich for tomorrow.', ['beef_bacon'], ['Count the exact physical sandwich requirement.', 'Cover, label, date, and refrigerate the slices.']),
        prep('cook-ahead', 'Breakfast Sandwich egg patties', 'Cook one complete measured egg patty per physical sandwich today.', ['egg', 'egg_white', 'mozzarella', 'avocado_oil'], ['Keep the whole-egg count and liquid egg-white grams visible.', 'Cook every patty until fully set and record the finished count.', 'Rapid-cool, cover, label, and refrigerate.'], { prepWave: 'sandwich-eggs', prepWaveName: 'Breakfast Sandwich egg-patty cook' }),
        prep('starch-ahead', 'Lean Breakfast Sandwich potatoes', 'Cook only the active Lean allocation; Bulk receives two sandwiches and no potatoes.', ['potato', 'avocado_oil', 'salt'], ['Add this quantity to the one active roasted-potato cook.', 'Record finished yield, rapid-cool, cover, label, and refrigerate.'], { activeTiers: ['lean'], prepWave: 'roasted-potatoes', prepWaveName: 'One active roasted-potato cook' }),
      ],
    },
    b4: {
      prepSteps: ['Use the active shared chicken-seasoning pull; cook the complete potato and egg allocations today.'],
      prepBatches: [
        prep('starch-ahead', 'Power Bowl potatoes', 'Cook exactly 100 g potato per active Power Bowl today.', ['potato', 'avocado_oil', 'salt'], ['Add this quantity to the one active roasted-potato cook.', 'Record finished yield, rapid-cool, cover, label, and refrigerate.'], { prepWave: 'roasted-potatoes', prepWaveName: 'One active roasted-potato cook' }),
        prep('cook-ahead', 'Power Bowl eggs', 'Cook the complete two-egg-per-meal allocation today.', ['egg'], ['Cook every egg until fully set.', 'Record finished count and yield, rapid-cool, cover, label, and refrigerate.'], { prepWave: 'power-bowl-eggs', prepWaveName: 'Power Bowl egg cook' }),
      ],
    },
    m1: {
      prepSteps: ['Use the active shared chicken-seasoning pull; mix the hot-honey finish and stage the exact slider kit today.'],
      prepBatches: [
        prep('sauce', 'Hot-honey slider finish', 'Mix the complete active finish without raw-chicken contact.', ['light_mayo', 'sriracha', 'honey'], ['Whisk until uniform.', 'Record finished weight, cover, label, date, and refrigerate.']),
        prep('mix', 'Hot Honey Slider assembly kit', 'Count rolls and cheese; wash, cut, and stage onion and pickles today.', ['hawaiian_roll', 'mozzarella', 'onion', 'pickles'], ['Keep rolls sealed and dry.', 'Cover and refrigerate cheese, onion, and pickles in a labeled assembly kit.']),
      ],
    },
    m4: {
      prepSteps: ['Use the active shared chicken-seasoning pull; cook the vegetable rice and mix the sweet-chili finish today.'],
      prepBatches: [
        prep('starch-ahead', 'Sweet Chili vegetable rice', 'Cook the complete active rice and peas-and-carrots allocation today.', ['rice_dry', 'mixed_vegetables'], ['Cook rice and fold in the measured vegetables.', 'Record dry and finished weights, rapid-cool in a shallow labeled pan, and refrigerate.'], { prepWave: 'rice', prepWaveName: 'Active rice production' }),
        prep('sauce', 'Sweet Chili finishing sauce', 'Mix the complete active finishing sauce without raw-chicken contact.', ['sweet_chili', 'soy_sauce', 'garlic', 'avocado_oil', 'salt'], ['Whisk until uniform.', 'Record finished weight, cover, label, date, and refrigerate.']),
      ],
    },
    m6: {
      prepSteps: ['Thaw, check, and portion the salmon; make its seasoning kit; cook the quinoa and green beans today.'],
      prepBatches: [
        prep('protein-portion', 'Portion salmon and stage Cajun-garlic seasoning', 'Prepare every active salmon portion while keeping the wet seasoning separate until tomorrow.', ['pink_salmon_raw', 'garlic', 'lemon', 'paprika', 'chili_powder', 'avocado_oil', 'salt'], ['Thaw under refrigeration, check pin bones, and weigh every Lean and Bulk purchased-input portion.', 'Mix the displayed garlic, lemon, paprika, chili powder, oil, and salt in a separate labeled cup; do not leave salmon sitting wet overnight.', 'Cover, label, date, and refrigerate salmon and seasoning at 40 F or below.']),
        prep('starch-ahead', 'Lemon-herb quinoa', 'Cook the complete active quinoa allocation today.', ['quinoa_dry', 'cilantro', 'lemon', 'salt'], ['Cook quinoa, then fold in measured lemon, cilantro, and salt.', 'Record dry and finished weights, rapid-cool in a shallow labeled pan, and refrigerate.'], { prepWave: 'quinoa', prepWaveName: 'Active quinoa cook' }),
        prep('vegetable-ahead', 'Roasted green beans', 'Cook the complete active green-bean allocation today.', ['green_beans', 'garlic', 'avocado_oil', 'salt'], ['Roast until just tender so reheating will not make them soft.', 'Record finished yield, rapid-cool, cover, label, and refrigerate.'], { prepWave: 'green-beans', prepWaveName: 'Active green-bean cook' }),
      ],
    },
    m7: {
      prepSteps: ['Use the active shared chicken-seasoning pull; cook the corrected potato and broccoli allocations today.'],
      prepBatches: [
        prep('starch-ahead', 'Loaded Buffalo potatoes', 'Cook exactly 200 g potato per active meal today.', ['potato', 'avocado_oil', 'salt'], ['Add this quantity to the one active roasted-potato cook.', 'Record finished yield, rapid-cool, cover, label, and refrigerate.'], { prepWave: 'roasted-potatoes', prepWaveName: 'One active roasted-potato cook' }),
        prep('vegetable-ahead', 'Loaded Buffalo broccoli', 'Cook the complete active broccoli allocation today.', ['broccoli'], ['Cook until just tender.', 'Record finished yield, rapid-cool, cover, label, and refrigerate.'], { prepWave: 'broccoli', prepWaveName: 'Active broccoli cook' }),
      ],
    },
    m8: {
      prepSteps: ['Weigh the taco-beef pull and separate seasoning kit; cook rice and hot vegetables; stage cold toppings today.'],
      prepBatches: [
        prep('protein-portion', 'Southwest taco beef and seasoning kit', 'Weigh the active beef pull and keep the controlled seasoning kit separate for tomorrow.', ['beef_90_raw', 'avocado_oil', 'salt'], ['Weigh beef into its labeled cook-day container.', 'Measure the displayed oil and salt separately, cover, label, date, and refrigerate.', 'Record any additional taco spices actually used; no additional gram-controlled taco blend is saved.'], { unmeasured: ['Additional taco seasoning beyond the controlled oil and salt is not gram-controlled. Do not invent amounts in the planner.'] }),
        prep('starch-ahead', 'Southwest rice', 'Cook the complete active rice allocation today.', ['rice_dry', 'cilantro'], ['Cook rice and finish with measured cilantro.', 'Record dry and finished weights, rapid-cool in a shallow labeled pan, and refrigerate.'], { prepWave: 'rice', prepWaveName: 'Active rice production' }),
        prep('vegetable-ahead', 'Southwest hot vegetable component', 'Cook black beans, corn, green pepper, and cooking onion today.', ['black_beans', 'corn', 'green_bell_pepper', 'onion'], ['Cook until excess moisture is controlled.', 'Record finished yield, rapid-cool, cover, label, and refrigerate.'], { prepWave: 'southwest-vegetables', prepWaveName: 'Southwest hot vegetable cook' }),
        prep('mix', 'Southwest cold topping kit', 'Wash and dry lettuce; count cotija and keep both cold for tomorrow.', ['lettuce', 'cotija'], ['Keep lettuce whole after washing and drying for best texture.', 'Cover, label, and refrigerate lettuce and cotija separately.']),
      ],
    },
    d3: {
      prepSteps: ['Build and refrigerate every active Tiramisu cup today for its overnight set.'],
      prepBatches: [prep('dessert', 'High Protein Tiramisu', 'Complete every active Tiramisu cup today.', [], ['Mix the measured mascarpone protein cream until smooth.', 'Dip ladyfingers briefly in cooled coffee, layer, dust with cocoa, and portion by weight.', 'Record cup count and filled weight, then seal, label, and refrigerate overnight.'], { includeAllRecipeIngredients: true })],
    },
    a2: {
      prepSteps: ['Use the active shared chicken-seasoning pull; wash and dry salad produce and make the incorporated wrap sauce today.'],
      prepBatches: [
        prep('mix', 'Snack Wrap cold assembly kit', 'Wash and dry produce; count tortillas, cheese, and containers.', ['fajita_tortilla', 'mozzarella', 'lettuce', 'onion', 'tomato', 'cucumber'], ['Keep washed lettuce, tomato, and cucumber whole for best texture tomorrow.', 'Cover and refrigerate cold ingredients; keep tortillas sealed and dry.']),
        prep('sauce', 'Snack Wrap house sauce', 'Mix the complete active incorporated sauce today.', ['fage', 'light_mayo', 'lemon', 'jalapeno', 'garlic', 'avocado_oil', 'salt', 'cumin'], ['Blend or whisk until uniform.', 'Record finished weight, cover, label, date, and refrigerate.']),
      ],
    },
    a3: {
      prepSteps: ['Use the active shared chicken-seasoning pull; wash and dry Caesar produce and make every dressing cup today.'],
      prepBatches: [
        prep('mix', 'Caesar Crunch cold box kit', 'Wash and dry lettuce and cucumber; count Parmesan and dry crouton bags.', ['lettuce', 'cucumber', 'parmesan', 'croutons'], ['Keep lettuce and cucumber whole after washing and drying for best texture tomorrow.', 'Cover and refrigerate produce and Parmesan; keep croutons sealed, dry, and separate.']),
        prep('sauce', 'Yogurt-Caesar dressing cups', 'Mix and fill one 35 g dressing cup per active box today.', ['fage', 'light_mayo', 'lemon', 'garlic', 'salt'], ['Whisk until uniform.', 'Fill, seal, count, label, date, and refrigerate every cup.']),
      ],
    },
    p1: {
      prepSteps: ['Use the active shared chicken-seasoning pull; cook the complete protein-mac batch and fill BBQ sauce cups today.'],
      prepBatches: [
        prep('starch-ahead', 'BBQ Chicken protein mac and cheese', 'Cook exactly 60 g dry high-protein mac per active Bulk meal today.', ['protein_mac', 'mozzarella'], ['Cook about one minute short of final texture.', 'Record dry and finished weights, rapid-cool, cover, label, and refrigerate.'], { prepWave: 'protein-mac', prepWaveName: 'Active protein-mac cook' }),
        prep('sauce', 'BBQ Chicken Mac sauce cups', 'Fill one separate 30 g BBQ sauce cup per active meal today.', ['bbq_sauce'], ['Tare cups and fill 30 g net each.', 'Seal, count, label, date, and refrigerate.']),
      ],
    },
  };
  for (const [id, plan] of Object.entries(activeB7PrepPlans)) {
    data.meals[id].prepSteps = plan.prepSteps;
    data.meals[id].prepBatches = plan.prepBatches;
  }

  // Cook Day never repeats work that the active Prep Day plan completed. The
  // only cooking left here is raw protein, sauce finishing, safe reheating,
  // assembly, and packing.
  const activeB7CookSteps = {
    a2: ['Cook the prepared chicken pull to 165 F and record its finished yield.', 'Slice the chilled chicken and divide it with cheese, fresh salad, and prepared sauce across two tortillas.', 'Roll tightly, pack both wraps together, label, and return to refrigeration.'],
    a3: ['Cook the prepared chicken pull to 165 F, record its finished yield, and chill promptly.', 'Cut the washed lettuce and cucumber, then pack them with Parmesan and chilled chicken.', 'Keep the prepared 35g dressing cup sealed and the counted croutons dry and separate.'],
    b2: ['Cook the staged beef-bacon slices; the egg patties are already fully cooked and chilled.', 'Warm only as needed for assembly, then build one Lean sandwich or two Bulk sandwiches.', 'Lean gets the prepared potato side; every order gets one prepared 45g Creamy Jalapeno-Lime cup.'],
    b4: ['Cook the prepared chicken pull to 165 F and record its finished yield.', 'Reheat the prepared potatoes and eggs to 165 F only as needed for hot assembly.', 'Plate the chicken, 100g potatoes, and two eggs, then add one prepared 45g sauce cup.'],
    d3: ['No Cook Day production is required; verify the overnight set and final cup count.', 'Inspect each sealed cup for clean layers, correct fill, and secure closure.', 'Keep chilled, apply the exact label, and move directly to customer pack-out.'],
    m1: ['Cook the prepared chicken pull to 165 F and record its finished yield.', 'Coat with the prepared hot-honey finish.', 'Assemble the exact slider count with the staged rolls, cheese, pickles, and onion.'],
    m2: ['Cook the marinated Biryani chicken with the staged onion-tomato base to 165 F.', 'Fold in the fully cooked, chilled rice from Prep Day and heat the combined batch to 165 F; do not start a second rice cook.', 'Rest, fluff, record total usable yield, and portion by tier.'],
    m3: ['Cook the marinated Butter Chicken pull to 165 F.', 'Build the sauce from the staged kit, combine with chicken, and heat throughout; never use broth.', 'Reheat the fully cooked Prep Day rice to 165 F as needed, then portion chicken, sauce, and rice by tier.'],
    m4: ['Cook the prepared chicken pull to 165 F and record its finished yield.', 'Coat with the prepared sweet-chili finish.', 'Reheat the fully cooked Prep Day vegetable rice to 165 F as needed and portion with the chicken.'],
    m5: ['Bake every formed meatball to 160 F and verify the final piece count.', 'Reheat and finish the separately prepared pasta and Arrabbiata sauce to 165 F; do not begin another pasta cook.', 'Plate the exact meatball, pasta, sauce, and mozzarella quantities by tier.'],
    m6: ['Pat the pre-portioned salmon dry, apply the prepared Cajun-garlic seasoning, and roast skin-side down to 145 F.', 'Remove skin, check pin bones again, and record skinless cooked and plated weights.', 'Reheat the fully cooked quinoa and green beans to 165 F as needed, then portion by tier.'],
    m7: ['Cook the prepared chicken pull to 165 F and record its finished yield.', 'Add Buffalo sauce after recording yield.', 'Reheat the fully cooked potatoes and broccoli to 165 F as needed, then plate the corrected allocations.'],
    m8: ['Cook the staged beef to 160 F, drain, and apply the recorded taco finish.', 'Reheat the fully cooked Prep Day rice and hot vegetable component to 165 F; do not start another rice or vegetable cook.', 'Pack the staged lettuce, cotija, and prepared jalapeno-lime yogurt separately from the hot components.'],
    p1: ['Cook the prepared shared-base chicken pull to 165 F and record its finished yield.', 'Reheat and finish the fully cooked Prep Day protein mac to 165 F; do not begin another macaroni cook.', 'Plate chicken and mac with mozzarella, then add one prepared 30g BBQ sauce cup per meal.'],
    p2: ['Cook the pre-marinated customer chicken to 165 F and record the total finished yield; keep the plain reserve unused unless a measured shortage exists.', 'Portion exactly 225g cooked chicken into each hot container.', 'Cut and pack one separate 200g salad plus one prepared 15g dressing cup per meal; keep both cold.'],
  };
  for (const [id, steps] of Object.entries(activeB7CookSteps)) data.meals[id].steps = steps;

  // These are the instructions rendered inside the Cook & Pack protein block.
  // Keep them distinct from assembly steps so the operator sees the exact
  // active protein cook, endpoint, finish, and yield release before plating.
  const activeB7ProteinCookSteps = {
    a2: ['Cook the staged Mini Snack Wrap chicken in uncrowded batches to 165 F.', 'Record the raw pull, 165 F endpoint, finished yield, and labeled destination pan; chill promptly before wrap assembly.'],
    a3: ['Cook the staged Caesar Crunch Box chicken in uncrowded batches to 165 F.', 'Record the raw pull, 165 F endpoint, finished yield, and labeled destination pan; rapid-cool before cold-box assembly.'],
    b2: ['Cook the staged beef-bacon slices in an uncrowded pan or sheet tray until browned and 160 F, unless the package requires a higher endpoint.', 'Record the starting slice count, safe endpoint, finished slice count, and labeled sandwich destination.'],
    b4: ['Cook the staged Power Bowl chicken in uncrowded batches to 165 F.', 'Record the raw pull, 165 F endpoint, finished yield, and labeled Power Bowl destination pan.'],
    m1: ['Cook the staged Hot Honey Slider chicken in uncrowded batches to 165 F.', 'Record the raw pull, 165 F endpoint, and finished yield, then coat only this allocation with the prepared hot-honey finish.'],
    m2: ['Cook the separately marinated Chicken Biryani chicken with its staged onion-tomato base until every piece reaches 165 F.', 'Record the raw pull, 165 F endpoint, finished chicken-base yield, and labeled Biryani destination pot; the rice is already cooked.'],
    m3: ['Cook the separately marinated Butter Chicken pull in its staged broth-free sauce until every piece reaches 165 F.', 'Record the raw pull, 165 F endpoint, finished chicken-and-sauce yield, and labeled Butter Chicken destination pan.'],
    m4: ['Cook the staged Sweet Chili chicken in uncrowded batches to 165 F.', 'Record the raw pull, 165 F endpoint, and finished yield, then coat only this allocation with the prepared Sweet Chili finish.'],
    m5: ['Load the formed 25-26 g Arrabbiata meatballs into the first available 400 F oven lane in one uncrowded layer.', 'Bake every piece to 160 F; record the cooked count, weight, damage, reserve used, and labeled destination pan.'],
    m6: ['Pat the pre-portioned salmon dry, apply the staged Cajun-garlic seasoning, and roast skin-side down at 425 F.', 'Release at 145 F; remove skin, check pin bones again, and record thawed input, skinless cooked yield, and labeled destination pan.'],
    m7: ['Cook the staged Loaded Buffalo chicken in uncrowded batches to 165 F.', 'Record the raw pull, 165 F endpoint, and finished yield, then coat only this allocation with the measured Buffalo sauce.'],
    m8: ['Cook the staged Southwest taco beef in an uncrowded skillet to 160 F, then drain and apply the measured taco finish.', 'Record the raw pull, 160 F endpoint, finished yield, and labeled taco-bowl destination pan.'],
    p1: ['Cook the staged BBQ Chicken Mac chicken in uncrowded batches to 165 F.', 'Record the raw pull, 165 F endpoint, finished yield, and labeled BBQ Chicken Mac destination pan.'],
    p2: ['Cook the marinated Lebanese-style chicken breast in uncrowded batches to 165 F; leave the plain reserve untouched unless a measured shortage exists.', 'Record the customer raw pull, any reserve actually used, 165 F endpoint, total finished yield, and labeled Nouman destination pan.'],
  };
  for (const [id, steps] of Object.entries(activeB7ProteinCookSteps)) {
    if (data.meals[id]?.proteinCook) data.meals[id].proteinCook.recipeSteps = steps;
  }

  const b7Guides = {
    b1: { lean: ['Place 3 pancakes in the meal container.', 'Add one blueberry-cheesecake topping cup and one syrup cup.', 'Close, label, and refrigerate.'], bulk: ['Place 4 pancakes in the meal container.', 'Add one blueberry-cheesecake topping cup and one syrup cup.', 'Close, label, and refrigerate.'] },
    b2: { lean: ['Pack 1 complete sandwich.', 'Add 150g roasted potatoes and one 45g Creamy Jalapeno-Lime Yogurt Sauce cup.', 'Close, label, and refrigerate.'], bulk: ['Pack 2 complete sandwiches with no potato side.', 'Add one 45g Creamy Jalapeno-Lime Yogurt Sauce cup.', 'Close, label, and refrigerate.'] },
    b3: { lean: ['Pack one Lean omelette portion and 1 sourdough slice separately.', 'Close, label, and refrigerate.'], bulk: ['Pack one Bulk omelette portion and 2 sourdough slices separately.', 'Close, label, and refrigerate.'] },
    b4: { lean: ['Pack the Lean chicken, 100g potatoes, and 2 eggs.', 'Add one 45g Creamy Jalapeno-Lime Yogurt Sauce cup.', 'Close, label, and refrigerate.'], bulk: ['Pack the Bulk chicken, 100g potatoes, and 2 eggs.', 'Add one 45g Creamy Jalapeno-Lime Yogurt Sauce cup.', 'Close, label, and refrigerate.'] },
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
    p1: { bulk: ['Pack one measured Bulk BBQ chicken and mac portion with 28g mozzarella.', 'Add one sealed 30g BBQ sauce cup.', 'Close, label, and refrigerate.'] },
    p2: { lean: ['Pack exactly 225g cooked chicken in the hot container.', 'Pack exactly 200g salad in a separate cold container and add one sealed 15g dressing cup.', 'Apply the matching Part 1, Part 2, and Part 3 labels; refrigerate all components.'] },
  };
  for (const [id, guide] of Object.entries(b7Guides)) data.meals[id].assemblyGuide = guide;

  // Keep executable history keyed by dish name, not the rotating menu slot.
  // Snapshots are deep copies because later batch overrides mutate nested cards.
  const methodHistoryByName = {};
  const snapshotMethods = (batch, names) => {
    for (const [id, name] of Object.entries(names)) {
      if (!data.meals[id]) continue;
      (methodHistoryByName[name] ||= []).push({ batch, method: JSON.parse(JSON.stringify(data.meals[id])) });
    }
  };
  snapshotMethods(7, {
    b1:'Blueberry Cheesecake Protein Pancakes', b2:'PRPD Beef Bacon Breakfast Sandwich', b3:'High Protein Omelette', b4:'Power Bowl',
    m1:'Hot Honey Chicken Sliders', m2:'Chicken Biryani', m3:'Butter Chicken', m4:'Sweet Chili Chicken with Vegetable Rice',
    m5:'Arrabbiata Meatball Pasta', m6:'Cajun Garlic Salmon', m7:'Loaded Buffalo Chicken Potato', m8:'Southwest Beef Taco Bowl',
    d1:'Baked Strawberry-Lemon Protein Cheesecake', d2:'Banana Cream Pie Cup', d3:'High Protein Tiramisu',
    a1:'PRPD Protein Box', a2:'Mini Chicken Snack Wrap', a3:'Chicken Caesar Crunch Box',
  });

  // Batch 8 owner-approved rotation. This final replacement is deliberately
  // data-driven by the current production recipes so archived weekly IDs can
  // never leak prior dishes into Prep Day, Cook Day, or plating.
  data.batch = 8;
  data.version = '2026-08-27.4';
  data.familyAllocations = [];
  data.familyPlatingReservations = [];
  // Owner/family production stays out of the customer label queue. Nouman's
  // paid custom rotation receives one label per complete main meal; its cold
  // salad and dressing components do not receive additional labels.
  data.labelExemptCustomers = ['Rida', 'Talal'];
  data.groceryAdjustments = [];
  // Explicit kitchen production outside customer orders. These amounts increase
  // grocery and planner pulls but never create a customer label or pack-out row.
  data.productionExtras = [{
    id: 'b8-owner-lasagna-half-pan',
    dishId: 'm7',
    label: 'Owner half-pan High-Protein Beef Lasagna',
    note: 'Build one separate owner half-pan after the Lean and Bulk customer pans. Customer production remains 5 Lean + 6 Bulk; this owner pan receives no customer label and is not part of pack-out.',
    panPlan: 'Three builds total: shallow customer Lean pan, deep customer Bulk pan, and one separate owner half-pan. Use about 30 oven-ready sheets total: 12 Lean customer + 12 Bulk customer + 6 owner half-pan. Dry-fit each layer and trim only as needed for full coverage.',
    ingredients: [
      { key: 'beef_90_raw', name: 'Ground beef 90/10, raw', amount: 354.375, unit: 'g', station: 'Beef', note: 'Owner half-pan production.', confidence: 'high', measure: { type: 'meat' } },
      { key: 'crushed_tomatoes', name: 'Canned crushed tomatoes', amount: 425, unit: 'g', station: 'Sauces & Dairy', note: 'Owner half-pan house lasagna sauce; blend purchased petite-diced tomatoes smooth before measuring.', confidence: 'medium' },
      { key: 'tomato_paste', name: 'Tomato paste', amount: 26.5625, unit: 'g', station: 'Sauces & Dairy', note: 'Owner half-pan house lasagna sauce.', confidence: 'high' },
      { key: 'water', name: 'Water', amount: 37.5, unit: 'g', station: 'Sauces & Dairy', note: 'Owner half-pan house lasagna sauce.', confidence: 'high' },
      { key: 'italian_seasoning', name: 'Italian seasoning', amount: 1.875, unit: 'g', station: 'Dry Prep & Seasonings', note: 'Owner half-pan house lasagna sauce.', confidence: 'medium', measure: { type: 'spice', gramsPerTsp: 2.8 } },
      { key: 'lasagna_sheet', name: 'Oven-ready lasagna sheet', amount: 10.5, unit: 'each', station: 'Starches & Hot Sides', note: 'Physical build adjustment: 4.5 additional sheets for full customer-pan coverage plus 6 sheets for the owner half-pan.', confidence: 'high' },
      { key: 'part_skim_ricotta', name: 'Part-skim ricotta cheese', amount: 132.8125, unit: 'g', station: 'Sauces & Dairy', note: 'Owner half-pan production.', confidence: 'medium' },
      { key: 'part_skim_mozzarella', name: 'Part-skim mozzarella cheese', amount: 70.625, unit: 'g', station: 'Sauces & Dairy', note: 'Owner half-pan production.', confidence: 'medium' },
      { key: 'parmesan', name: 'Parmesan cheese', amount: 17.5, unit: 'g', station: 'Sauces & Dairy', note: 'Owner half-pan production.', confidence: 'medium' },
      { key: 'egg', name: 'Whole egg', amount: 0.625, unit: 'each', station: 'Breakfast & Desserts', note: 'Owner half-pan production; weigh 31g beaten egg.', confidence: 'high' },
      { key: 'red_onion', name: 'Red onion, raw', amount: 37.5, unit: 'g', station: 'Cold Prep & Produce', note: 'Owner half-pan production.', confidence: 'high' },
      { key: 'garlic', name: 'Garlic, raw', amount: 5, unit: 'g', station: 'Cold Prep & Produce', note: 'Owner half-pan production.', confidence: 'high' },
      { key: 'parsley', name: 'Flat-leaf parsley', amount: 4.6875, unit: 'g', station: 'Cold Prep & Produce', note: 'Owner half-pan ricotta layer.', confidence: 'high' },
      { key: 'black_pepper', name: 'Ground black pepper', amount: 0.625, unit: 'g', station: 'Dry Prep & Seasonings', note: 'Owner half-pan production.', confidence: 'high' },
      { key: 'salt', name: 'Table salt', amount: 1.875, unit: 'g', station: 'Dry Prep & Seasonings', note: 'Owner half-pan production.', confidence: 'high', measure: { type: 'spice', gramsPerTsp: 6 } },
      { key: 'cilantro', name: 'Cilantro, raw', amount: 5, unit: 'g', station: 'Cold Prep & Produce', note: 'Owner half-pan garnish allowance.', confidence: 'high' },
    ],
  }];
  data.rawProteinReserveByDish = {};
  data.sharedProteinSeasoning = [];
  // Compatible recipes opt into a reusable seasoning family on their own
  // Prep Day card. The planner discovers whichever tagged recipes are active
  // in the current batch and calculates the shared base and exact finishes.
  // There is no batch-specific dish list in the planner engine.
  data.weeklySauces = {
    enabled: true,
    policy: 'Batch 8 provides one recipe-controlled 40g PRPD Mustard BBQ Sauce cup with each Beef Breakfast Skillet, Lemon Pepper Tilapia, and PRPD Protein Box, plus one recipe-controlled 45g PRPD Sweet Heat cup with each Loaded Beef Cottage Pie. No other Batch 8 dish receives a weekly sauce.',
    cupSizeOz: 2,
    eligibleMealIds: ['b2', 'm5', 'a3', 'm8'],
    customerCupsTotal: 0,
    kitchenUseCupsPerSauce: 0,
    qcCupsPerSauce: 1,
    sauces: [{
      name: 'PRPD Mustard BBQ Sauce', batchGroup: 'mustard-bbq', ingredientsIncludedInRecipes: true,
      eligibleMealIds: ['b2', 'm5', 'a3'],
      estimatedCaloriesPerCup: 20, provisional: true, netGramsPerCup: 40,
      ingredientsPerCup: [
        { key: 'bbq_sauce', name: 'Sugar-free BBQ sauce', grams: 28, station: 'Sauces & Dairy' },
        { key: 'mustard', name: 'Yellow mustard', grams: 10, station: 'Sauces & Dairy' },
        { key: 'apple_cider_vinegar', name: 'Apple cider vinegar', grams: 2, station: 'Sauces & Dairy' },
      ],
      steps: ['Whisk the complete 28:10:2 sugar-free-BBQ:yellow-mustard:apple-cider-vinegar ratio until smooth.', 'Tare every cup and lid.', 'Fill 40g net per Breakfast Skillet, Lemon Pepper Tilapia, and Protein Box plus one QC cup; seal, count, date, and refrigerate.'],
    }, {
      name: 'PRPD Sweet Heat Sauce', batchGroup: 'sweet-heat', ingredientsIncludedInRecipes: true,
      eligibleMealIds: ['m8'],
      estimatedCaloriesPerCup: 87, provisional: false, netGramsPerCup: 45,
      ingredientsPerCup: [
        { key: 'light_mayo', name: 'Light mayonnaise', grams: 11.0294, station: 'Sauces & Dairy' },
        { key: 'ketchup', name: 'Ketchup', grams: 13.2353, station: 'Sauces & Dairy' },
        { key: 'honey', name: 'Honey', grams: 13.2353, station: 'Breakfast & Desserts' },
        { key: 'hot_sauce', name: 'Valentina Black Label hot sauce', grams: 7.5, station: 'Sauces & Dairy' },
      ],
      steps: ['Tare every cup and lid.', 'Whisk the controlled 250:300:300:170 light-mayo:ketchup:honey:Valentina-hot-sauce ratio.', 'Fill 45g net per Cottage Pie plus one QC cup; seal, count, date, and refrigerate.'],
    }],
  };

  const b8Prep = (name, steps, options = {}) => prep(
    options.type || 'measured-prep',
    name,
    options.instruction || `Complete every measured Prep Day component for ${name}.`,
    options.keys || [],
    steps,
    { includeAllRecipeIngredients: options.includeAllRecipeIngredients !== false, ...(options.extra || {}) },
  );
  const b8Method = (name, order, equipment, temperature, steps, plating, hold, prepSteps, assemblyGuide, options = {}) => meal(
    options.phase || 5, order, equipment, temperature, steps, plating, hold,
    {
      sideCups: options.sideCups || 0,
      sideBags: options.sideBags || 0,
      riceBatchGroup: options.riceBatchGroup || 'common',
      prepSteps,
      prepBatches: [b8Prep(`${name} measured prep`, options.prepBatchSteps || prepSteps, options.prepOptions || {})],
      assemblyGuide,
      stepIngredients: options.stepIngredients || {},
      proteinCook: options.proteinCook || null,
      sideCup: options.sideCup || null,
      componentMap: options.componentMap || [],
      cookDayEquipment: options.cookDayEquipment || null,
      panBatch: options.panBatch || null,
    },
  );
  const protein = (name, group, endpoint, recipeKeys, recipeSteps, options = {}) => ({
    name, group, endpoint, recipeKeys, sequence: 10,
    recipeSteps,
    instructions: recipeSteps,
    ...options,
  });
  const tierGuide = (lean, bulk) => ({
    lean: [...lean, 'Close, apply the exact Lean label, and move to cold holding.'],
    bulk: [...bulk, 'Close, apply the exact Bulk label, and move to cold holding.'],
  });
  const singleGuide = (...steps) => ({ single: [...steps, 'Close, apply the exact label, and refrigerate.'] });

  data.meals = {
    b1: b8Method('Strawberry Cheesecake Protein Pancakes', 10, ['mixing bowls', 'griddle', 'two side cups'], 'Cook until centers are fully set.', ['Cook three Lean or four Bulk pancakes per order.', 'Cool strawberry compote and cheesecake topping before filling one cup; fill syrup in a second cup.', 'Record batter, pancake, compote, and topping yields.'], 'Lean: 3 pancakes. Bulk: 4. Pack two sealed cups.', 'Rapid-cool and refrigerate.', ['Make the strawberry compote and cheesecake-yogurt topping; stage the measured batter and syrup.'], tierGuide(['Place 3 pancakes in the meal container.', 'Add one strawberry-cheesecake topping cup and one syrup cup.'], ['Place 4 pancakes in the meal container.', 'Add one strawberry-cheesecake topping cup and one syrup cup.']), { phase: 4, sideCups: 2 }),
    b2: b8Method('Beef Breakfast Skillet', 20, ['beef skillet', 'potato oven', 'egg pan', 'sauce cups'], 'Cook beef to 160 F and eggs fully.', ['Cook and drain the measured beef.', 'Roast potatoes and cook the egg component.', 'Combine the beef, potatoes, eggs, red onion, and cheese by tier; do not add salsa.', 'Add one separate 40g PRPD Mustard BBQ Sauce cup.'], 'Pack the exact tier-specific beef, potato, egg, red onion, and cheese quantities with one sauce cup.', 'Rapid-cool and refrigerate.', ['Weigh beef and seasoning; dice potatoes and red onion; stage eggs and cheese; mix and fill the PRPD Mustard BBQ sauce cups.'], tierGuide(['Pack the Lean beef, 100g potatoes, 1 egg, red onion, and cheese.', 'Add one sealed 40g PRPD Mustard BBQ Sauce cup; do not add salsa.'], ['Pack the Bulk beef, 100g potatoes, 2 eggs, red onion, and cheese.', 'Add one sealed 40g PRPD Mustard BBQ Sauce cup; do not add salsa.']), { proteinCook: protein('Breakfast Skillet beef', 'beef', '160 F', ['beef_90_raw'], ['Cook in uncrowded batches to 160 F.', 'Drain, record finished yield, and move to the labeled skillet pan.']), sideCups: 1, sideCup: { name: 'PRPD Mustard BBQ Sauce', batchGroup: 'mustard-bbq', gramsPerMeal: 40, instruction: 'Pack one sealed 40g cup; do not plate salsa on the skillet.' } }),
    b3: b8Method('Chicken Shakshuka', 30, ['chicken pan', 'shakshuka pan', 'egg pan'], 'Cook chicken and egg mixture to 165 F.', ['Cook the separate chicken pull to 165 F.', 'Simmer the measured tomato-pepper base, add chicken and eggs, and cook until set.', 'Keep the shared PRPD bread separate.'], 'Pack tier-specific shakshuka and the correct shared-bread count.', 'Rapid-cool and refrigerate.', ['Measure the chicken seasoning and tomato-pepper base; count the shared bread; stage eggs and cheese.'], tierGuide(['Pack the Lean shakshuka with 1 shared-bread slice separately.'], ['Pack the Bulk shakshuka with 2 shared-bread slices separately.']), { proteinCook: protein('Shakshuka chicken', 'chicken', '165 F', ['chicken_thigh_raw'], ['Cook to 165 F and record yield.', 'Transfer only to the labeled Shakshuka base.']) }),
    b4: b8Method('French Toast', 40, ['mixing bowl', 'griddle', 'side cups'], 'Cook until the custard is fully set.', ['Whisk the complete measured custard.', 'Cook the exact bread count by tier.', 'Cool before packing fruit, whipped cream, and syrup separately.'], 'Lean: 3 slices. Bulk: 4. Include fruit, whipped cream, and syrup.', 'Rapid-cool and refrigerate.', ['Prepare the measured custard; wash and cut fruit; fill syrup cups.'], tierGuide(['Pack 3 French Toast slices with the measured fruit, whipped cream, and syrup cup.'], ['Pack 4 French Toast slices with the measured fruit, whipped cream, and syrup cup.']), { phase: 4, sideCups: 1 }),
    m1: b8Method('Creamy Chicken Parmesan', 50, ['chicken oven', 'pasta pot', 'sauce pot'], 'Cook chicken to 165 F.', ['Keep every chicken thigh whole: trim and flatten only, coat with the measured garlic-oil seasoning and breadcrumbs, then bake in one uncrowded layer to 165 F.', 'Boil the protein pasta until tender, drain it, and hold it for the sauce.', 'Simmer the crushed-tomato and garlic base. Lower the heat, stir the Parmesan into the sauce until incorporated, remove from heat, then fold in the Greek yogurt. Do not put mozzarella in the sauce.', 'Toss the cooked pasta with the creamy tomato-Parmesan sauce. Top each whole chicken thigh with its mozzarella allocation near the end of baking, then plate the intact thigh with the sauced pasta and cilantro.'], 'Pack one intact Chicken Parmesan thigh with protein pasta coated in creamy tomato-Parmesan sauce. Mozzarella belongs on the chicken; Parmesan belongs in the sauce.', 'Rapid-cool and refrigerate.', ['KEEP WHOLE — do not cube the Chicken Parmesan thighs. Trim and flatten only; keep the chicken, dry breadcrumbs, and wet seasoning separate until Cook Day.'], tierGuide(['Pack the intact Lean chicken thigh with the Lean sauced-pasta allocation; finish the chicken with mozzarella and the meal with cilantro.'], ['Pack the intact Bulk chicken thigh with the Bulk sauced-pasta allocation; finish the chicken with mozzarella and the meal with cilantro.']), { stepIngredients: { 0: ['chicken_thigh_raw', 'breadcrumbs', 'sunflower_oil', 'salt'], 1: ['protein_pasta'], 2: ['crushed_tomatoes', 'garlic', 'parmesan', 'fage'], 3: ['mozzarella', 'cilantro'] }, proteinCook: protein('Chicken Parmesan thighs — KEEP WHOLE', 'chicken', '165 F', ['chicken_thigh_raw', 'breadcrumbs'], ['KEEP EVERY THIGH WHOLE. Trim and flatten to an even thickness; do not cube or dice.', 'Coat the intact thighs immediately before baking, arrange in one uncrowded layer, and bake to 165 F.', 'Add the measured mozzarella on top near the end so it melts. Record cooked yield and transfer the intact thighs to the labeled Chicken Parmesan pan.']) }),
    m2: b8Method('Mediterranean Chicken Bowl', 60, ['chicken oven', 'rice pot', 'cold topping station'], 'Cook chicken to 165 F.', ['Cook chicken and rice, then record yields.', 'Keep cucumber, tomato, hummus, feta, olives, and onion cold.', 'Pack cold components separately from hot components.'], 'Tier-specific chicken and rice with measured cold Mediterranean toppings.', 'Use earlier in the week; refrigerate promptly.', ['Season chicken; cook the common rice allocation; wash and stage every cold topping.'], tierGuide(['Pack Lean chicken and rice; keep the Lean cucumber, tomato, hummus, feta, olives, and onion cold.'], ['Pack Bulk chicken and rice; keep the Bulk cucumber, tomato, hummus, feta, olives, and onion cold.']), { proteinCook: protein('Mediterranean Bowl chicken', 'chicken', '165 F', ['chicken_thigh_raw'], ['Cook to 165 F and record yield.', 'Transfer to the labeled Mediterranean Bowl pan.']), riceBatchGroup: 'common' }),
    m3: b8Method('Tandoori Chicken', 70, ['bone-in chicken oven', 'rice pot', 'broccoli tray'], 'Cook every bone-in leg quarter to 165 F at the thickest edible point without touching bone.', ['Roast the separately marinated bone-in leg quarters skin-side up to 165 F.', 'Cook rice and roast broccoli.', 'Record raw bone-in weight, piece count, cooked edible yield, and portions by tier.'], 'Tier-specific bone-in Tandoori leg quarters, basmati rice, and broccoli.', 'Rapid-cool and refrigerate.', ['Mix the complete tandoori yogurt-spice marinade, coat every leg quarter, arrange skin-side up in labeled cook pans, cover, and refrigerate overnight; stage rice and broccoli.'], tierGuide(['Pack the Lean edible Tandoori portion from the bone-in leg-quarter batch with measured rice and broccoli; include the bone-in piece(s).'], ['Pack the Bulk edible Tandoori portion from the bone-in leg-quarter batch with measured rice and broccoli; include the bone-in piece(s).']), { proteinCook: protein('Tandoori bone-in leg quarters', 'chicken', '165 F', ['leg_quarter_raw', 'fage', 'lemon', 'garlic', 'ginger', 'paprika', 'cumin', 'coriander'], ['Roast skin-side up to 165 F at the thickest edible point without touching bone.', 'Record raw bone-in weight, piece count, cooked edible yield, and transfer to the labeled Tandoori pan.']), riceBatchGroup: 'common' }),
    m4: b8Method('Pepper Steak Bowl', 80, ['beef skillet', 'rice pot', 'vegetable skillet'], 'Cook beef to 145 F minimum and hold safely.', ['Twenty minutes before cooking, toss the beef strips with the displayed baking soda. Rest 20 minutes only, rinse thoroughly under cold water, drain, and pat completely dry.', 'After rinsing, add the measured oil and salt immediately before cooking. Sear in uncrowded high-heat batches and record yield.', 'Cook peppers and onions crisp-tender; add the measured sauce.', 'Plate with rice by tier.'], 'Tier-specific velveted beef, rice, peppers, onions, and sauce.', 'Rapid-cool and refrigerate.', ['Portion the beef dry and stage baking soda separately; do not velvet overnight. Slice peppers and onions, make the measured sauce, and stage rice.'], tierGuide(['Pack Lean pepper steak, rice, peppers, onions, and sauce.'], ['Pack Bulk pepper steak, rice, peppers, onions, and sauce.']), { proteinCook: protein('Pepper Steak beef — velvet before searing', 'beef', '145 F minimum', ['beef_strips_raw'], ['Toss the labeled beef with the displayed baking soda and rest exactly 20 minutes; do not hold it in baking soda overnight.', 'Rinse thoroughly under cold water, drain, and pat completely dry.', 'Add the measured oil and salt only after rinsing, immediately before cooking.', 'Sear in uncrowded high-heat batches to the controlled endpoint. Record cooked yield and transfer to the labeled Pepper Steak pan.']), riceBatchGroup: 'common' }),
    m5: b8Method('Lemon Pepper Tilapia', 90, ['fish oven', 'potato oven', 'broccoli tray', 'sauce cups'], 'Cook tilapia to 145 F.', ['Roast tilapia to 145 F and record yield.', 'Roast garlic potatoes and cook broccoli.', 'Pack one measured PRPD Mustard BBQ Sauce cup per order.'], 'Tier-specific tilapia, garlic potatoes, broccoli, and one 40g PRPD Mustard BBQ cup.', 'Use earlier in the week; refrigerate promptly.', ['Portion tilapia and make the lemon-pepper seasoning; cut potatoes; stage broccoli and PRPD Mustard BBQ cups.'], tierGuide(['Pack Lean tilapia with 250g potatoes and 100g broccoli; add one sealed 40g PRPD Mustard BBQ cup.'], ['Pack Bulk tilapia with 320g potatoes and 130g broccoli; add one sealed 40g PRPD Mustard BBQ cup.']), { proteinCook: protein('Lemon Pepper Tilapia', 'seafood', '145 F', ['tilapia_raw'], ['Roast to 145 F.', 'Record cooked yield and transfer to the labeled Tilapia pan.']), sideCups: 1, sideCup: { name: 'PRPD Mustard BBQ Sauce', batchGroup: 'mustard-bbq', gramsPerMeal: 40, instruction: 'Pack one sealed 40g cup.' } }),
    m6: b8Method('Chicken Enchilada Bake', 100, ['chicken oven', 'casserole pans'], 'Cook chicken and finished casserole to 165 F.', ['Cook chicken to 165 F and shred.', 'Layer chicken, tortillas, beans, corn, sauce, onion, and cheese.', 'Bake, rest, weigh the pan, and divide by tier.'], 'Pack one equal-weight tier-specific enchilada-bake portion.', 'Rapid-cool and refrigerate.', ['Cook and shred chicken; stage tortillas, beans, corn, sauce, onion, and cheese; assemble pans.'], tierGuide(['Pack one equal-weight Lean enchilada-bake portion.'], ['Pack one equal-weight Bulk enchilada-bake portion.']), { proteinCook: protein('Enchilada Bake chicken', 'chicken', '165 F', ['chicken_thigh_raw'], ['Cook to 165 F, record yield, and shred.', 'Transfer only to the labeled Enchilada assembly pan.']) }),
    m7: b8Method('High-Protein Beef Lasagna', 110, ['beef skillet', 'shallow tier-specific pans', '375 F oven', 'rapid-cooling rack or blast chiller', 'digital portion scale'], 'Prep Day: cook beef to 160 F and fully bake lasagna to 165 F. Cook Day: portion only after the intact pan is 41 F or below.', ['Verify each Prep Day pan reached 165 F and passed both cooling checkpoints.', 'Weigh each fully chilled intact tier pan net of its pan, then cut clean squares with a sharp knife.', 'Portion by scale—not by a fixed grid: target 447g for Lean (never below the 442g label weight) and 594g for Bulk (never below the 589g label weight). Shapes may vary slightly, but customer pieces must remain intact and visually comparable.', 'Fill every live customer count first. Only true edge trim remaining after all target weights are packed is owner scrap; never reduce a customer portion to create scrap.'], 'Lean: one clean intact square, target 447g and never below 442g. Bulk: one clean intact square, target 594g and never below 589g.', 'Keep at 41 F or below. Reheat only the finished customer portion according to its label.', ['Cook and drain the beef; make the PRPD house tomato sauce; build the ricotta layer; assemble and fully bake the tier-specific lasagna pans; rapid-cool the intact pans and chill overnight.'], tierGuide(['Cut intact Lean squares and weigh each one individually to a 447g working target; no customer container may be below the 442g labeled net weight. Pack the exact active Lean count before retaining any trim.'], ['Cut intact Bulk squares and weigh each one individually to a 594g working target; no customer container may be below the 589g labeled net weight. Pack the exact active Bulk count before retaining any trim.']), { proteinCook: protein('Lasagna beef and full pan bake', 'beef', 'Beef 160 F; assembled lasagna 165 F on Prep Day', ['beef_90_raw'], ['Cook beef to 160 F and drain the rendered fat thoroughly.', 'Record raw pull and cooked/drained yield before making the house tomato sauce and assembling the tier pans.', 'Bake the complete lasagna on Prep Day and release it only after each pan center reaches 165 F and its cooling log passes.'], { prepDayComplete: true, lane: 'Prep Day stovetop plus 375 F oven', ovenTemperatureF: 375, estimatedMinutes: 55 }) }),
    m8: b8Method('Loaded Beef Cottage Pie', 120, ['beef skillet', 'instant mash station', 'digital portion scale'], 'Cook the beef filling to 160 F; there is no casserole bake.', ['Cook and drain the beef to 160 F and finish the measured vegetable filling.', 'Prepare the instant mashed potatoes to the controlled package ratio.', 'On Cook Day, place the measured mash in the container first, spoon the measured beef filling over it, then finish with mozzarella and cilantro. Do not assemble or bake a casserole pan.', 'Add one separate 45g Sweet Heat cup.'], 'Tier-specific mash base, beef-and-vegetable filling on top, mozzarella, cilantro, and one Sweet Heat cup.', 'Rapid-cool components separately and refrigerate.', ['Cook and chill the beef filling; prepare and chill the measured instant mash; stage mozzarella and Sweet Heat cups separately.'], tierGuide(['Place the Lean mash allocation in the container first, add the Lean beef filling over it, finish with mozzarella and cilantro, and add one 45g Sweet Heat cup.'], ['Place the Bulk mash allocation in the container first, add the Bulk beef filling over it, finish with mozzarella and cilantro, and add one 45g Sweet Heat cup.']), { proteinCook: protein('Cottage Pie beef filling', 'beef', '160 F', ['beef_90_raw'], ['Cook to 160 F, drain, finish the vegetable filling, and record yield.', 'Rapid-cool in the labeled Cottage Pie filling pan; do not build a casserole.']), sideCups: 1, sideCup: { name: 'PRPD Sweet Heat Sauce', batchGroup: 'sweet-heat', gramsPerMeal: 45, instruction: 'Pack one sealed 45g cup.' } }),
    d1: b8Method('Baked Strawberry-Lemon Protein Cheesecake', 130, ['blender', 'baking pan', 'oven'], 'Bake at 325 F until edges set and the center moves as one piece.', ['Blend the measured batter, swirl in cooled strawberry reduction, and bake.', 'Chill fully before weighing and dividing equal portions.', 'Record pan and individual weights.'], 'One chilled equal-weight cheesecake portion.', 'Serve chilled.', ['Make strawberry reduction and complete batter; bake and chill fully.'], singleGuide('Pack one fully chilled equal-weight cheesecake portion.'), { phase: 3 }),
    d2: b8Method('Chocolate Oreo Mousse', 140, ['mixing bowls', 'dessert cups'], 'No final cook.', ['Whisk the measured mousse until smooth.', 'Portion by weight and finish with Oreo Thins.', 'Record filled cup count and weights.'], 'One chilled mousse cup per order.', 'Serve chilled.', ['Complete every mousse cup and refrigerate.'], singleGuide('Pack one measured mousse cup finished with the exact Oreo allocation.'), { phase: 3 }),
    d3: b8Method('Chocolate Peanut Butter Protein Brownie', 150, ['mixing bowls', '8 x 4 x 2.5-inch loaf pan', '350 F oven', 'digital scale'], 'Bake one complete four-serving pan at 350 F until the center is set and a tester has moist crumbs rather than wet batter.', ['Preheat the oven to 350 F and line or lightly grease one 8 x 4 x 2.5-inch loaf pan for every four finished portions.', 'Whisk the measured flour, chocolate protein powder, PBfit, cocoa, baking powder, and salt until uniform.', 'Separately whisk the measured Greek yogurt, milk, honey, and whole egg until completely smooth.', 'Fold wet into dry only until uniform. Fold most of the chocolate chips into the batter and reserve the remainder for the top.', 'Spread the complete batter evenly in the prepared pan, add the reserved chips, and begin checking at 24 minutes. Remove when the center is set and a tester has moist crumbs, not wet batter.', 'Cool completely, record the slab weight, and divide each pan into four equal-weight portions. Pack the live customer count first; owner portions receive no customer label.'], 'One equal-weight brownie portion per customer order; each complete 8 x 4 x 2.5-inch pan yields four equal portions.', 'Serve chilled or at room temperature.', ['Use the permanent PRPD brownie pan standard: one complete 8 x 4 x 2.5-inch pan per four portions. Never scale below one full pan; add a second complete pan when more than four portions are required.'], singleGuide('Pack one equal-weight chocolate peanut butter protein brownie.'), { phase: 3, panBatch: { pan: '8 x 4 x 2.5-inch', servingsPerPan: 4 }, stepIngredients: { 1: ['flour', 'whey_chocolate', 'pbfit', 'cocoa', 'baking_powder', 'salt'], 2: ['fage', 'fairlife_milk', 'honey', 'egg'], 3: ['chocolate_chips'] } }),
    a1: b8Method('Buffalo Chicken Pinwheels', 160, ['chicken oven', 'cold wrap station'], 'Prep Day cooks chicken to 165 F; Cook Day is cold rolling and slicing.', ['Retrieve the fully chilled Buffalo-chicken filling, dry lettuce, and sealed tortillas.', 'Spread one measured filling allocation thinly across each tortilla, add the completely dry lettuce, and leave about a 1-inch clean edge.', 'Roll tightly, place seam-side down, chill 20-30 minutes to set, then slice evenly with a sharp knife and pack every pinwheel.'], 'One 12 oz chilled box containing two tortillas worth of pinwheels.', 'Use earlier in the week; serve chilled.', ['Cook and fully chill chicken; make the chilled Buffalo-cheese filling; wash and dry lettuce; keep tortillas sealed and dry for tomorrow.'], singleGuide('Pack all pinwheels made from exactly 2 tortillas in one 12 oz box.'), { proteinCook: protein('Buffalo Pinwheel chicken', 'chicken', '165 F', ['chicken_thigh_raw'], ['Cook to 165 F and record yield.', 'Rapid-cool before making the chilled filling.']) }),
    a2: b8Method('Mediterranean Chicken Hummus Box', 170, ['chicken oven', 'cold box station'], 'Cook chicken to 165 F.', ['Cook chicken to 165 F, record yield, and chill.', 'Wash and dry vegetables; count flatbread, feta, and olives.', 'Pack the complete chilled box.'], 'One 12 oz box with chicken, hummus, flatbread, vegetables, feta, and olives.', 'Use earlier in the week; serve chilled.', ['Season and cook chicken; wash produce; stage hummus, flatbread, feta, and olives.'], singleGuide('Pack the measured chicken, hummus, half flatbread, cucumber, tomato, feta, olives, and red onion.'), { proteinCook: protein('Hummus Box chicken', 'chicken', '165 F', ['chicken_thigh_raw'], ['Cook to 165 F and record yield.', 'Rapid-cool before cold-box assembly.']) }),
    a3: b8Method('PRPD Protein Box', 180, ['egg pot', 'beef-bacon pan', 'cold box station'], 'Cook eggs and beef bacon fully.', ['Hard-boil eggs and cook beef bacon.', 'Wash cucumber and verify whole mini apples.', 'Fill the measured PRPD Mustard BBQ cup and assemble the divided box.'], 'One 12 oz box with 2 eggs, beef bacon, cheese, mini apple, cucumber, and one 40g PRPD Mustard BBQ cup.', 'Serve chilled.', ['Cook and chill eggs and beef bacon; wash produce; fill PRPD Mustard BBQ cups.'], singleGuide('Pack 2 eggs, 1 beef-bacon slice, 28g cheese, 1 mini apple, 60g cucumber, and one sealed 40g PRPD Mustard BBQ cup.'), { phase: 4, sideCups: 1, sideCup: { name: 'PRPD Mustard BBQ Sauce', batchGroup: 'mustard-bbq', gramsPerMeal: 40, instruction: 'Pack one sealed 40g cup.' } }),
  };

  data.meals.p1 = b8Method('96/4 Beef Kofta', 190, ['beef oven', 'Prep-Day roasted-vegetable pan'], 'Cook the formed kofta to 160 F.', ['Place the Prep-Day formed and seasoned kofta directly into the oven.', 'Bake to 160 F and record raw and cooked yields.', 'Retrieve the fully cooked Prep-Day zucchini, bell pepper, and onion; portion the three complete custom meals without recooking the vegetables.'], 'One measured oven-baked 96/4 beef-kofta portion with Prep-Day roasted zucchini, bell pepper, and onion.', 'Rapid-cool and refrigerate.', ['Mix the measured garlic, parsley, and spices into the separate 96/4 beef pull; form uniform kofta today; cover and refrigerate overnight. Fully cook and chill its vegetables today.'], tierGuide(['Pack an equal share of the oven-baked kofta with the complete Prep-Day roasted-vegetable allocation.'], ['Not used for this custom meal.']), { proteinCook: protein('Nouman 96/4 beef kofta', 'beef', '160 F', ['beef_96_raw', 'garlic', 'parsley', 'cumin', 'coriander', 'paprika', 'black_pepper', 'salt'], ['Bake the refrigerated kofta to 160 F without free-poured oil.', 'Record raw weight, formed count, cooked yield, and move to the labeled Nouman pan.']) });
  data.meals.p2 = b8Method('Custom Lean Chicken Mince', 200, ['poultry skillet', 'Prep-Day green-bean pan'], 'Cook chicken mince to 165 F.', ['Cook the exact chicken-mince pull to 165 F.', 'Retrieve the fully cooked Prep-Day lemon-garlic green beans and onion.', 'Record the chicken yield and portion the three complete custom meals without recooking the vegetables.'], 'One measured chicken-mince portion with Prep-Day lemon-garlic green beans and onion.', 'Rapid-cool and refrigerate.', ['Weigh the exact chicken-mince pull; fully cook and chill the green beans, onion, and measured lemon-herb finish today.'], tierGuide(['Pack the measured chicken mince with the complete Prep-Day green-bean allocation.'], ['Not used for this custom meal.']), { proteinCook: protein('Nouman chicken mince', 'chicken', '165 F', ['chicken_mince_raw'], ['Cook in uncrowded batches to 165 F.', 'Record raw and cooked yields and move to the labeled Nouman pan.']) });
  data.meals.p3 = b8Method('Custom Lebanese-Style Chicken Breast', 210, ['chicken oven or grill', 'cold salad station', 'dressing cups'], 'Cook chicken breast to 165 F.', ['Cook the pre-marinated chicken breast to 165 F and record yield.', 'Portion exactly 225g cooked chicken in the hot container.', 'Pack one separate 200g cold salad and one separate 15g lemon-garlic dressing cup.'], 'One hot chicken container, one cold salad container, and one dressing cup.', 'Rapid-cool chicken; keep all components at 40 F or below. Do not freeze the salad.', ['Marinate the exact chicken pull without sumac; wash and dry salad produce; prepare the measured dressing.'], tierGuide(['Pack 225g cooked chicken, one separate 200g salad, and one separate 15g dressing cup.'], ['Not used for this custom meal.']), { proteinCook: protein('Nouman Lebanese chicken breast', 'chicken', '165 F', ['chicken_breast_raw'], ['Cook the marinated chicken to 165 F.', 'Record raw pull and cooked yield; portion exactly 225g cooked chicken.']), sideCups: 1, sideCup: { name: 'Lemon-garlic dressing', batchGroup: 'nouman-lemon-dressing', gramsPerMeal: 15, instruction: 'Pack one sealed 15g cup with the separate salad.' } });

  // Recipe data defines what each SKU needs. The planner decides whether a
  // card is active from imported Batch 8 counts, then groups the active cards
  // into shared workstations. Nothing in this table activates a dish by name.
  const activeB8PrepPlans = {
    b1: [
      prep('mix', 'Pancake dry and wet mixtures', 'Make the two measured pancake mixtures after produce is finished; this is one breakfast-mixture job, not a cold-topping kit.', ['flour', 'baking_powder', 'whey_vanilla', 'egg', 'egg_white', 'fairlife_milk', 'vanilla', 'cinnamon', 'salt'], ['Whisk flour, baking powder, vanilla protein powder, cinnamon, and salt into one dry container.', 'Whisk eggs, egg whites, milk, vanilla, and the measured yogurt in a second container; cover, date, and refrigerate.', 'Do not combine wet and dry tonight. Combine only until uniform immediately before the Cook Day griddle.'], { prepWave: 'breakfast-mixtures', prepWaveName: 'Breakfast batters and custards', formulaIngredients: [{ key: 'fage_batter', name: 'Nonfat Greek yogurt for pancake wet mix', unit: 'g', lean: 80, bulk: 100, includeInGrocery: false }] }),
      prep('sauce', 'Strawberry cheesecake topping', 'Cook the strawberry component and complete the measured reduced-cream-cheese-and-yogurt topping today.', ['strawberry', 'reduced_cream_cheese', 'powdered_sugar'], ['Cook strawberries until thickened and cool completely.', 'Mix the measured cheesecake topping, portion the required cups, seal, label, and refrigerate.'], { formulaIngredients: [{ key: 'fage_topping', name: 'Nonfat Greek yogurt for cheesecake topping', unit: 'g', lean: 20, bulk: 20, includeInGrocery: false }] }),
      prep('sauce', 'Pancake syrup cups', 'Fill the exact active syrup-cup count.', ['maple_syrup'], ['Tare, fill, seal, count, label, and refrigerate every cup.']),
    ],
    b2: [
      prep('protein-portion', 'Breakfast Skillet beef pull', 'Weigh the exact active beef pull and its measured seasoning kit.', ['beef_90_raw', 'garlic'], ['Keep beef cold.', 'Cook in its own rendered fat; do not add the potato oil.', 'Label the beef and seasoning for the Breakfast Skillet; refrigerate at 40 F or below.'], { formulaIngredients: [{ key: 'salt_beef', name: 'Fine salt for Breakfast Skillet beef', unit: 'g', lean: 0.5, bulk: 0.7, includeInGrocery: false }] }),
      prep('starch-ahead', 'Breakfast Skillet potatoes', 'Roast the complete active potato allocation today.', ['potato', 'avocado_oil'], ['Roast in uncrowded pans until browned and tender.', 'Record finished yield, rapid-cool, label, and refrigerate.'], { prepWave: 'roasted-potatoes', prepWaveName: 'One active roasted-potato cook', formulaIngredients: [{ key: 'salt_potato', name: 'Fine salt for Breakfast Skillet potatoes', unit: 'g', lean: 0.25, bulk: 0.3, includeInGrocery: false }] }),
      prep('cook-ahead', 'Breakfast Skillet eggs', 'Cook the complete active egg allocation today.', ['egg'], ['Cook until fully set.', 'Record finished yield, rapid-cool, label, and refrigerate.'], { prepWave: 'eggs', prepWaveName: 'One coordinated egg station' }),
      prep('cold-kit', 'Breakfast Skillet finish kit', 'Stage the measured red onion and mozzarella for assembly.', ['red_onion', 'mozzarella'], ['Dice red onion, cover, label, and refrigerate. Salsa is not used.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
      prep('sauce', 'Breakfast Skillet PRPD Mustard BBQ cups', 'Mix the house sauce once and fill one measured 40g cup per active Breakfast Skillet order.', ['bbq_sauce', 'mustard', 'apple_cider_vinegar'], ['Whisk the measured 28:10:2 BBQ:mustard:vinegar ratio until smooth.', 'Tare, fill 40g net, seal, count, label, and refrigerate every cup.']),
    ],
    b3: [
      prep('marinade', 'Shakshuka chicken seasoning', 'Season the exact active chicken pull for tomorrow.', ['chicken_thigh_raw', 'garlic', 'paprika', 'cumin', 'avocado_oil', 'salt'], ['Coat evenly, cover, label Chicken Shakshuka, date, and refrigerate at 40 F or below.'], { seasoningFamily: 'neutral-chicken-start', seasoningFamilyName: 'Neutral chicken start', seasoningFinishNote: 'After splitting, add the displayed garlic, paprika, cumin, and any remaining oil and salt.' }),
      prep('cook-ahead', 'Shakshuka tomato-pepper base', 'Cook the complete tomato, red-onion, and pepper base today.', ['crushed_tomatoes', 'red_onion', 'green_bell_pepper'], ['Cook until the vegetables soften and excess moisture is controlled.', 'Record yield, rapid-cool in a shallow labeled pan, and refrigerate.'], { prepWave: 'hot-vegetables', prepWaveName: 'Hot vegetable and sauce-base station' }),
      prep('cold-kit', 'Shakshuka egg, cheese, and bread kit', 'Count the exact eggs, cheese, and shared PRPD bread needed for tomorrow.', ['egg', 'mozzarella', 'bread_slice'], ['Keep eggs and cheese cold; keep bread sealed and dry.', 'Label the complete Shakshuka assembly kit.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
    ],
    b4: [
      prep('mix', 'French Toast custard', 'Blend the complete measured custard after the pancake mixtures in the same breakfast work block.', ['egg', 'egg_white', 'cottage', 'fairlife_milk', 'whey_vanilla', 'brown_sugar', 'vanilla', 'cinnamon'], ['Blend every measured custard ingredient until completely smooth.', 'Record finished weight, cover, label, date, and refrigerate. Bread and fruit remain in normal inventory until Cook Day assembly.'], { prepWave: 'breakfast-mixtures', prepWaveName: 'Breakfast batters and custards' }),
      prep('cold-kit', 'French Toast fruit and bread kit', 'Wash fruit and count the exact bread and whipped-cream allocations.', ['bread_slice', 'strawberry', 'banana', 'whipped_cream'], ['Keep fruit whole after washing when practical.', 'Keep bread sealed and dry; label the kit for French Toast.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
      prep('sauce', 'French Toast syrup cups', 'Fill the exact active syrup-cup count.', ['maple_syrup'], ['Tare, fill, seal, count, label, and refrigerate every cup.']),
    ],
    m1: [
      prep('protein-portion', 'Chicken Parmesan whole-thigh pull', 'KEEP THIS ENTIRE PULL WHOLE. Trim and flatten the thighs only; do not cube, dice, or slice them.', ['chicken_thigh_raw', 'breadcrumbs', 'avocado_oil', 'salt'], ['Set aside the displayed raw Chicken Parmesan quantity before cutting any shared chicken.', 'Trim and flatten every thigh to an even thickness, pat dry, and arrange the intact thighs in one labeled covered pan.', 'Keep breadcrumbs dry and separate. Mix the measured garlic, oil, and salt separately; do not bread tonight.', 'Refrigerate at 40 F or below. Coat the whole thighs immediately before tomorrow\'s 400 F oven cook.'], { formulaIngredients: [{ key: 'garlic_breading', name: 'Minced garlic for Chicken Parmesan breading', unit: 'g', lean: 2, bulk: 3, includeInGrocery: false }] }),
      prep('starch-ahead', 'Chicken Parmesan protein pasta', 'Cook the complete active pasta allocation about one minute short today.', ['protein_pasta'], ['Cook the measured pasta about one minute short of the package time.', 'Record dry and finished weights, then toss with the sauce on the next card.'], { prepWave: 'pasta-and-bakes', prepWaveName: 'Pasta, macaroni, and bake components' }),
      prep('cook-ahead', 'Creamy tomato-Parmesan pasta sauce', 'Make the complete pasta sauce today. Parmesan goes into the sauce; mozzarella does not.', ['crushed_tomatoes', 'fage', 'parmesan'], ['Simmer the measured crushed tomatoes with the measured sauce garlic until blended and slightly thickened.', 'Lower the heat and stir in all measured Parmesan until incorporated.', 'Remove the pot from the heat, fold in all measured Greek yogurt until smooth, then toss with the cooked protein pasta.', 'Rapid-cool the sauced pasta. Keep mozzarella in normal refrigerated inventory; it is weighed onto the whole chicken during Cook Day finishing.'], { prepWave: 'pasta-and-bakes', prepWaveName: 'Pasta and assembled bakes', aheadWorkstation: 'grains', formulaIngredients: [{ key: 'garlic_sauce', name: 'Minced garlic for creamy tomato-Parmesan sauce', unit: 'g', lean: 4, bulk: 5, includeInGrocery: false }], stepIngredientKeys: [['crushed_tomatoes', 'garlic_sauce'], ['parmesan'], ['fage'], ['protein_pasta']] }),
    ],
    m2: [
      prep('marinade', 'Mediterranean Bowl chicken seasoning', 'Season the exact active chicken pull today.', ['chicken_thigh_raw', 'lemon', 'avocado_oil', 'salt'], ['Coat evenly, cover, label, date, and refrigerate at 40 F or below.'], { seasoningFamily: 'mediterranean-lemon-chicken', seasoningFamilyName: 'Mediterranean lemon chicken', seasoningFinishNote: 'After splitting, add the displayed remaining oil and salt.' }),
      prep('starch-ahead', 'Mediterranean Bowl rice allocation', 'Include this exact allocation in the one shared rice cook.', ['rice_dry'], ['Record dry weight and finished yield; rapid-cool in its labeled destination pan.'], { prepWave: 'rice', prepWaveName: 'One shared rice cook' }),
      prep('cold-kit', 'Mediterranean Bowl cold toppings', 'Wash, count, and stage every cold topping today.', ['cucumber', 'tomato', 'hummus', 'feta', 'olives', 'red_onion'], ['Keep produce dry and toppings separated.', 'Cover, label, and refrigerate the complete kit.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
    ],
    m3: [
      prep('marinade', 'Tandoori bone-in leg-quarter marinade', 'Mix the complete measured tandoori marinade and coat the exact active bone-in leg-quarter pull.', ['leg_quarter_raw', 'fage', 'lemon', 'garlic', 'ginger', 'paprika', 'cumin', 'coriander', 'avocado_oil', 'salt'], ['Whisk marinade until uniform.', 'Coat every leg quarter thoroughly, arrange skin-side up in the labeled cook pans, cover, date, and refrigerate overnight at 40 F or below.', 'Record raw bone-in weight and piece count now; tomorrow these pans go directly into the oven.']),
      prep('starch-ahead', 'Tandoori rice allocation', 'Include this exact allocation in the one shared rice cook.', ['rice_dry'], ['Record dry weight and finished yield; rapid-cool in its labeled destination pan.'], { prepWave: 'rice', prepWaveName: 'One shared rice cook' }),
      prep('vegetable-ahead', 'Tandoori broccoli', 'Cook the complete active broccoli allocation today.', ['broccoli'], ['Cook until just tender.', 'Record yield, rapid-cool, label, and refrigerate.'], { prepWave: 'hot-vegetables', prepWaveName: 'One hot vegetable station' }),
    ],
    m4: [
      prep('protein-portion', 'Pepper Steak beef pull and velveting kit', 'Weigh the exact sold Pepper Steak beef pull. Keep baking soda, oil, and salt separate; velveting happens for 20 minutes on Cook Day, never overnight.', ['beef_strips_raw', 'avocado_oil', 'salt'], ['Put the dry beef strips in the labeled covered pan.', 'Measure the baking soda into one labeled cup and the oil and salt into a second labeled cup.', 'Refrigerate the beef at 40 F or below. Keep the dry kits with the recipe card.', 'Cook Day: apply baking soda for 20 minutes, rinse thoroughly, drain, pat completely dry, then add oil and salt immediately before searing.'], { formulaIngredients: [{ key: 'baking_soda', name: 'Baking soda for Pepper Steak velveting', unit: 'g', lean: 0.9, bulk: 1.25, station: 'Dry Prep & Seasonings', note: '0.5% of raw beef weight; rinse thoroughly after a 20-minute rest.' }] }),
      prep('starch-ahead', 'Pepper Steak rice allocation', 'Include this exact allocation in the one shared rice cook.', ['rice_dry'], ['Record dry weight and finished yield; rapid-cool in its labeled destination pan.'], { prepWave: 'rice', prepWaveName: 'One shared rice cook' }),
      prep('vegetable-ahead', 'Pepper Steak peppers and onions', 'Cook the complete active pepper-and-red-onion allocation today.', ['green_bell_pepper', 'red_onion'], ['Cook only until crisp-tender.', 'Record yield, rapid-cool, label, and refrigerate.'], { prepWave: 'hot-vegetables', prepWaveName: 'One hot vegetable station' }),
      prep('sauce', 'Pepper Steak finishing sauce', 'Mix the complete measured sauce today.', ['soy_sauce', 'honey', 'garlic', 'cornstarch'], ['Whisk until uniform.', 'Cover, label, date, and refrigerate.']),
    ],
    m5: [
      prep('protein-portion', 'Lemon Pepper Tilapia portions', 'Portion the exact active fish and stage its measured lemon-pepper seasoning separately; do not hold the fish in lemon overnight.', ['tilapia_raw', 'black_pepper'], ['Pat the fish dry, put it in the labeled covered seafood pan, and refrigerate at 40 F or below.', 'Measure the lemon juice, oil, black pepper, and salt into a separate labeled kit.', 'Apply the kit only immediately before tomorrow\'s final seafood oven pass.'], { formulaIngredients: [{ key: 'lemon_fish', name: 'Lemon juice for tilapia', unit: 'g', lean: 10, bulk: 12, includeInGrocery: false }, { key: 'avocado_oil_fish', name: 'Avocado oil for tilapia', unit: 'g', lean: 2, bulk: 3, includeInGrocery: false }, { key: 'salt_fish', name: 'Fine salt for tilapia', unit: 'g', lean: 0.25, bulk: 0.35, includeInGrocery: false }] }),
      prep('starch-ahead', 'Tilapia garlic potatoes', 'Roast the complete active potato allocation today.', ['potato'], ['Roast until browned and tender.', 'Record yield, rapid-cool, label, and refrigerate.'], { prepWave: 'roasted-potatoes', prepWaveName: 'One active roasted-potato cook', formulaIngredients: [{ key: 'garlic_potato', name: 'Minced garlic for tilapia potatoes', unit: 'g', lean: 5, bulk: 6, includeInGrocery: false }, { key: 'avocado_oil_potato', name: 'Avocado oil for tilapia potatoes', unit: 'g', lean: 3, bulk: 4, includeInGrocery: false }, { key: 'salt_potato', name: 'Fine salt for tilapia potatoes', unit: 'g', lean: 0.5, bulk: 0.65, includeInGrocery: false }] }),
      prep('vegetable-ahead', 'Tilapia broccoli', 'Cook the complete active broccoli allocation today.', ['broccoli'], ['Cook until just tender.', 'Record yield, rapid-cool, label, and refrigerate.'], { prepWave: 'hot-vegetables', prepWaveName: 'One hot vegetable station' }),
      prep('sauce', 'Tilapia PRPD Mustard BBQ cups', 'Use the shared house sauce and fill one measured 40g PRPD Mustard BBQ cup per active Tilapia order.', ['bbq_sauce', 'mustard', 'apple_cider_vinegar'], ['Whisk the measured 28:10:2 BBQ:mustard:vinegar ratio until smooth.', 'Tare, fill 40g net, seal, count, label, and refrigerate every cup.']),
    ],
    m6: [
      prep('protein-cook-ahead', 'Cook and shred Enchilada chicken', 'Cook the exact active chicken pull today so the casserole pans can be assembled tonight.', ['chicken_thigh_raw', 'avocado_oil', 'salt'], ['Cook to 165 F and record finished yield.', 'Shred, rapid-cool in a shallow pan, and keep at 40 F or below.'], { seasoningFamily: 'neutral-chicken-start', seasoningFamilyName: 'Neutral chicken start', seasoningFinishNote: 'After splitting, add any displayed remaining oil and salt, then cook and shred.' }),
      prep('starch-ahead', 'Assemble Chicken Enchilada pans', 'Build every labeled pan tonight; Cook Day only bakes and portions the chilled pans.', ['small_tortilla', 'large_tortilla', 'black_beans', 'corn', 'enchilada_sauce', 'mozzarella', 'red_onion'], ['Set out the labeled Lean and Bulk pans and the fully cooled shredded chicken.', 'For each layer, lay three of that tier\'s assigned tortillas side by side, trimming only when needed for full coverage.', 'Spread the measured chicken, black beans, corn, enchilada sauce, red onion, and mozzarella evenly over the tortillas.', 'Repeat for two complete tortilla-and-filling layers in each pan; finish with the measured sauce and mozzarella so no tortilla edge is dry.', 'Cover, label, date, and refrigerate the assembled pans at 40 F or below. Cook Day: bake the chilled pans to 165 F, rest, weigh, and portion by tier.'], { prepWave: 'assembled-pans', prepWaveName: 'Assemble refrigerated pans' }),
    ],
    m7: [
      prep('sauce', 'PRPD lasagna tomato meat sauce', 'Make the complete house tomato meat sauce once for all active customer pans and the separate owner half-pan.', ['beef_90_raw', 'red_onion', 'garlic', 'crushed_tomatoes', 'tomato_paste', 'water', 'italian_seasoning', 'black_pepper', 'salt'], ['Blend the canned tomatoes smooth if needed.', 'Brown the 90/10 ground beef with the measured onion and garlic to 160 F, then drain the rendered fat thoroughly.', 'Stir in crushed tomatoes, tomato paste, water, Italian seasoning, black pepper, and salt.', 'Simmer 10-15 minutes, stirring regularly. Keep the sauce loose enough to hydrate oven-ready noodles; record the finished sauce weight and move directly to assembly.'], { seasoningFinishNote: 'Cook and drain thoroughly before adding the tomato ingredients.' }),
      prep('mix', 'Lasagna ricotta layer', 'Mix the complete ricotta layer once for all three builds.', ['part_skim_ricotta', 'egg', 'parmesan', 'parsley'], ['Beat the measured egg, then fold it through the ricotta, Parmesan, and parsley until completely uniform.', 'Cover and refrigerate only if the sauce is not ready; otherwise move directly to pan assembly.'], { prepWave: 'pasta-and-bakes', prepWaveName: 'Pasta and assembled bakes' }),
      prep('bake-ahead', 'Assemble, fully bake, and chill Lasagna pans', 'Complete all three lasagna builds on Prep Day: customer Lean, customer Bulk, and one separate owner half-pan.', ['lasagna_sheet', 'part_skim_mozzarella'], ['Before assembly, weigh and record the empty customer Lean-pan tare, customer Bulk-pan tare, and owner half-pan tare. Label all three before filling.', 'Build the shallow customer Lean pan first, the deep customer Bulk pan second, and the separate owner half-pan last. Use about 30 oven-ready sheets total: 12 Lean customer, 12 Bulk customer, and 6 owner half-pan; dry-fit every layer for full coverage.', 'Layer the finished PRPD tomato meat sauce, oven-ready sheets, ricotta mixture, and mozzarella. Repeat until each pan is complete; finish with sauce and mozzarella and cover every dry noodle edge.', 'Cover and bake at 375 F until every pan center reaches 165 F; uncover only for the final 10-15 minutes if browning is needed.', 'Record each finished hot pan weight, then start rapid cooling immediately in the approved shallow-pan setup.', 'Log 135 F to 70 F within 2 hours and 70 F to 41 F or below within 4 additional hours. Do not release an out-of-limit pan.', 'Once 41 F or below, cover, label, date, and chill all three pans intact overnight. Cut and weigh customer portions only on Cook Day; the owner half-pan receives no customer label.'], { prepWave: 'oven-bakes', prepWaveName: 'Prep Day oven bake and overnight chill', equipmentLane: 'oven', ovenTemperatureF: 375, estimatedMinutes: 55, background: true, showProductionExtras: true }),
    ],
    m8: [
      prep('protein-cook-ahead', 'Cook Cottage Pie beef filling', 'Cook the complete active beef-and-vegetable filling tonight.', ['beef_90_raw', 'mixed_vegetables', 'red_onion', 'tomato_paste', 'avocado_oil', 'black_pepper'], ['Cook beef to 160 F and drain thoroughly.', 'Finish the measured filling, record yield, rapid-cool, label, and refrigerate.'], { formulaIngredients: [{ key: 'salt_filling', name: 'Fine salt for Cottage Pie filling', unit: 'g', lean: 0.75, bulk: 1, includeInGrocery: false }] }),
      prep('starch-ahead', 'Cottage Pie packaged mash', 'Prepare the exact packaged instant-mash allocation today.', ['instant_potato_flakes', 'water', 'fairlife_milk', 'butter'], ['Follow the controlled package ratio.', 'Record finished yield, rapid-cool, label, and refrigerate.'], { prepWave: 'instant-mash', prepWaveName: 'One packaged-mash cook', formulaIngredients: [{ key: 'salt_mash', name: 'Fine salt in packaged Cottage Pie mash', unit: 'g', lean: 1.3854, bulk: 1.5113, includeInGrocery: false }] }),
      prep('cold-kit', 'Cottage Pie mozzarella finish kit', 'Stage the exact mozzarella allocations for tomorrow\'s individual meal assembly; no casserole pan is built.', ['mozzarella'], ['Keep the cooled beef filling and packaged mash in separate labeled pans.', 'Weigh and refrigerate the mozzarella finish kit.', 'Tomorrow, plate mash first, beef filling over it, then mozzarella and cilantro.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
    ],
    d1: [prep('dessert', 'Baked Strawberry-Lemon Protein Cheesecake', 'Complete and chill the full active cheesecake batch today.', [], ['Cook and cool the strawberry reduction.', 'Blend batter, swirl, bake, chill fully, record yield, and portion by weight.'], { includeAllRecipeIngredients: true })],
    d2: [prep('dessert', 'Chocolate Oreo Mousse', 'Complete every active mousse cup today.', [], ['Whisk the complete measured mousse until smooth.', 'Portion by weight, finish with Oreo, seal, label, and refrigerate.'], { includeAllRecipeIngredients: true })],
    d3: [prep('dessert', 'Chocolate Peanut Butter Protein Brownie', 'Bake one complete four-serving batch in the permanent 8 x 4 x 2.5-inch brownie pan.', [], ['Preheat to 350 F and line or lightly grease the 8 x 4 x 2.5-inch loaf pan.', 'Whisk flour, chocolate protein powder, PBfit, cocoa, baking powder, and salt until uniform.', 'Whisk Greek yogurt, milk, honey, and the whole egg in a second bowl until smooth.', 'Fold wet into dry only until uniform; fold most chocolate chips through the batter and reserve the rest for the top.', 'Spread the complete batch in the pan, top with the reserved chips, and begin checking at 24 minutes. Remove when the center is set and a tester has moist crumbs rather than wet batter.', 'Cool completely, record the finished slab weight, divide into four equal portions, pack customer portions first, and retain unlabeled owner portions.'], { includeAllRecipeIngredients: true, stepIngredientKeys: { 1: ['flour', 'whey_chocolate', 'pbfit', 'cocoa', 'baking_powder', 'salt'], 2: ['fage', 'fairlife_milk', 'honey', 'egg'], 3: ['chocolate_chips'] } })],
    a1: [
      prep('protein-cook-ahead', 'Cook Buffalo Pinwheel chicken', 'Cook and chill the exact active chicken pull today because the finished pinwheel is served cold and the chicken must be fully chilled before it touches the cream-cheese filling.', ['chicken_thigh_raw', 'avocado_oil', 'salt'], ['Cook to 165 F, record yield, shred, rapid-cool, label, and refrigerate.', 'Do not mix warm chicken into the filling.'], { seasoningFamily: 'neutral-chicken-start', seasoningFamilyName: 'Neutral chicken start', seasoningFinishNote: 'No extra seasoning after the weighed bowl split; cook, shred, and chill.' }),
      prep('mix', 'Buffalo Pinwheel chilled filling', 'Make the complete filling after the cooked chicken is fully chilled.', ['reduced_cream_cheese', 'mozzarella', 'buffalo_sauce', 'red_onion'], ['Fold the shredded chilled chicken into the measured cream cheese, mozzarella, Buffalo sauce, and the onion already chopped in the shared produce block.', 'Record the finished filling weight, cover, label, date, and refrigerate at 40 F or below. Do not put the filling on tortillas tonight.'], { prepWave: 'grab-and-go-mixtures', prepWaveName: 'Grab-and-go fillings' }),
      prep('cold-kit', 'Buffalo Pinwheel dry wrap kit', 'Stage the tortillas and completely dry lettuce today; roll tomorrow for better texture.', ['small_tortilla', 'lettuce'], ['Wash and spin the lettuce completely dry.', 'Keep lettuce covered and cold; keep tortillas sealed and dry at room temperature according to the package.', 'Label the kit for four active orders: eight tortillas total.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
    ],
    a2: [
      prep('protein-cook-ahead', 'Cook Hummus Box chicken', 'Cook and chill the exact active chicken pull today because the Hummus Box is packed and eaten cold; Prep Day cooling prevents warm chicken from heating the cold box.', ['chicken_thigh_raw', 'lemon', 'avocado_oil', 'salt'], ['Cook to 165 F, record yield, rapid-cool, label, and refrigerate.', 'Pack only after the chicken reaches 41 F or below.'], { seasoningFamily: 'mediterranean-lemon-chicken', seasoningFamilyName: 'Mediterranean lemon chicken', seasoningFinishNote: 'After splitting, add the displayed remaining lemon, then cook and chill.' }),
      prep('cold-kit', 'Mediterranean Hummus Box kit', 'Wash, count, and stage every cold box component today.', ['hummus', 'shawarma_bread', 'cucumber', 'tomato', 'feta', 'olives', 'red_onion'], ['Keep produce dry and flatbread sealed.', 'Cover, label, and refrigerate the cold components.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
    ],
    a3: [
      prep('cook-ahead', 'Protein Box eggs and beef bacon', 'Cook and chill the complete active egg and beef-bacon count today.', ['egg', 'beef_bacon'], ['Hard-boil eggs and cook beef bacon to the package-safe endpoint.', 'Record counts, rapid-cool, label, and refrigerate.'], { prepWave: 'eggs', prepWaveName: 'One coordinated egg station' }),
      prep('cold-kit', 'Protein Box produce, cheese, and PRPD Mustard BBQ cups', 'Wash produce, count cheese and apples, and use the shared house sauce cups.', ['mozzarella', 'apple', 'cucumber', 'bbq_sauce', 'mustard', 'apple_cider_vinegar'], ['Keep apples whole and cucumber dry.', 'Use the completed PRPD Mustard BBQ batch; fill each cup to 40g net, seal, count, label, and refrigerate the complete kit.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
    ],
    p1: [
      prep('form-and-marinate', 'Form Nouman seasoned beef', 'Use the shared 90/10 ground-beef pull: weigh exactly 310g raw per active custom meal, mix in the complete measured garlic, parsley, and spice formula, and shape the batch today. Drain thoroughly after cooking.', ['beef_90_raw', 'garlic', 'parsley', 'cumin', 'coriander', 'paprika', 'black_pepper', 'salt'], ['Keep the beef cold while mixing.', 'Shape uniform oven-ready pieces; record the total raw weight, piece count, and average raw piece weight.', 'Arrange in the labeled cook pan, cover, date, and refrigerate overnight at 40 F or below so it goes directly into the oven tomorrow.']),
      prep('vegetable-ahead', 'Nouman roasted beef-meal vegetables', 'Cook the exact zucchini, bell pepper, and red onion allocation today.', ['zucchini', 'green_bell_pepper', 'red_onion'], ['Cut evenly and roast in one labeled pan until just tender, not soft.', 'Record finished yield, rapid-cool in a shallow pan, label, date, and refrigerate.'], { prepWave: 'hot-vegetables', prepWaveName: 'One hot vegetable station' }),
    ],
    p2: [
      prep('protein-portion', 'Nouman chicken-mince pull', 'Weigh exactly 300g raw pure chicken-breast mince per active custom meal.', ['chicken_mince_raw'], ['Keep the mince cold.', 'Label the complete pull Nouman Chicken Mince, date it, and refrigerate at 40 F or below.']),
      prep('vegetable-ahead', 'Nouman chicken-mince green beans and onion', 'Cook the exact green beans and red onion today; keep the measured lemon-herb finish controlled.', ['green_beans', 'red_onion', 'lemon', 'garlic', 'parsley', 'paprika', 'cumin', 'black_pepper', 'salt'], ['Cook the green beans and onion until just tender.', 'Use the measured garlic and spices; add lemon and parsley at the end so the finish stays fresh.', 'Record finished yield, rapid-cool in a shallow labeled pan, date, and refrigerate.'], { prepWave: 'hot-vegetables', prepWaveName: 'One hot vegetable station' }),
    ],
    p3: [
      prep('marinade', 'Nouman Lebanese chicken marinade', 'For each active meal, marinate the exact 300g raw chicken-breast pull without sumac.', ['chicken_breast_raw', 'paprika', 'cumin'], ['Coat evenly, cover, label, date, and refrigerate at 40 F or below.'], { formulaIngredients: [{ key: 'lemon_marinade', name: 'Lemon juice for chicken marinade', unit: 'g', perServing: 8, includeInGrocery: false }, { key: 'garlic_marinade', name: 'Minced garlic for chicken marinade', unit: 'g', perServing: 3, includeInGrocery: false }, { key: 'avocado_oil_marinade', name: 'Avocado oil for chicken marinade', unit: 'g', perServing: 2, includeInGrocery: false }, { key: 'black_pepper_marinade', name: 'Black pepper for chicken marinade', unit: 'g', perServing: 0.4, includeInGrocery: false }, { key: 'salt_marinade', name: 'Fine salt for chicken marinade', unit: 'g', perServing: 0.75, includeInGrocery: false }] }),
      prep('cold-kit', 'Nouman salad produce kit', 'Stage one 200g cold salad per active meal; keep it dry and undressed.', ['lettuce', 'cucumber', 'tomato', 'red_onion', 'parsley'], ['Wash and dry every vegetable thoroughly.', 'Cover, label, and refrigerate; do not dress the salad.'], { prepWave: 'cold-kits', prepWaveName: 'Cold toppings and assembly kits' }),
      prep('sauce', 'Nouman lemon-garlic dressing cups', 'Make and seal one 15g dressing cup per active meal without sumac.', [], ['Whisk until uniform.', 'Tare, fill to 15g net, seal, count, label, and refrigerate.'], { formulaIngredients: [{ key: 'lemon_dressing', name: 'Lemon juice for dressing', unit: 'g', perServing: 12, includeInGrocery: false }, { key: 'garlic_dressing', name: 'Minced garlic for dressing', unit: 'g', perServing: 1, includeInGrocery: false }, { key: 'avocado_oil_dressing', name: 'Avocado oil for dressing', unit: 'g', perServing: 1, includeInGrocery: false }, { key: 'black_pepper_dressing', name: 'Black pepper for dressing', unit: 'g', perServing: 0.1, includeInGrocery: false }, { key: 'salt_dressing', name: 'Fine salt for dressing', unit: 'g', perServing: 0.25, includeInGrocery: false }] }),
    ],
  };
  const cilantroGarnishMealIds = ['b2', 'b3', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
  for (const id of cilantroGarnishMealIds) {
    activeB8PrepPlans[id].push(prep(
      'garnish-kit',
      'PRPD cilantro garnish allocation',
      'Wash, spin completely dry, and stage the exact 2g-per-meal cilantro allocation in one shared garnish station.',
      ['cilantro'],
      ['Keep the cilantro dry and cold.', 'Do not scatter it during bulk cooking; add exactly 2g only during final plating so every labeled meal receives its controlled amount.'],
      { prepWave: 'cilantro-garnish', prepWaveName: 'One PRPD cilantro garnish station' },
    ));
  }
  for (const [id, prepBatches] of Object.entries(activeB8PrepPlans)) data.meals[id].prepBatches = prepBatches;

  // Every active recipe ingredient belongs to exactly one operational component.
  // The planner uses this map to keep proteins, bases, sides, toppings, and cups
  // visible at assembly without relying on free-form recipe prose.
  const component = (role, label, ingredientKeys, handling) => ({ role, label, ingredientKeys, handling });
  const activeB8Components = {
    b1: [
      component('base', 'Pancake batter', ['flour', 'baking_powder', 'whey_vanilla', 'egg', 'egg_white', 'fage', 'fairlife_milk', 'vanilla', 'cinnamon', 'avocado_oil', 'salt'], 'Cook as one measured batter; 3 Lean or 4 Bulk pancakes.'),
      component('topping', 'Strawberry-cheesecake topping', ['strawberry', 'reduced_cream_cheese', 'powdered_sugar'], 'Keep chilled in its own sealed cup.'),
      component('cup', 'Sugar-free maple syrup', ['maple_syrup'], 'Pack separately; never pour onto pancakes before delivery.'),
    ],
    b2: [
      component('protein', 'Drained seasoned beef', ['beef_90_raw', 'garlic'], 'Cook to 160 F, drain, and keep in its labeled pan.'),
      component('base', 'Roasted potatoes', ['potato', 'avocado_oil'], 'Roast one shared potato batch, then divide by recipe.'),
      component('side', 'Egg component', ['egg'], 'Cook in the coordinated egg station and hold separately.'),
      component('topping', 'Cheese and red onion', ['mozzarella', 'red_onion'], 'Add during final assembly; no salsa.'),
      component('seasoning', 'Measured salt', ['salt'], 'Split between beef and potatoes exactly as shown on Prep Day.'),
      component('cup', 'PRPD Mustard BBQ Sauce', ['bbq_sauce', 'mustard', 'apple_cider_vinegar'], 'Pack one sealed 40g cup.'),
    ],
    b3: [
      component('protein', 'Seasoned chicken', ['chicken_thigh_raw'], 'Cook to 165 F and fold only into the labeled Shakshuka base.'),
      component('base', 'Tomato-pepper egg base', ['egg', 'crushed_tomatoes', 'red_onion', 'green_bell_pepper', 'mozzarella'], 'Cook the vegetable base ahead; finish the egg component to 165 F.'),
      component('side', 'Shared PRPD bread', ['bread_slice'], 'Keep dry and pack separately: 1 Lean or 2 Bulk slices.'),
      component('seasoning', 'Shakshuka seasoning', ['garlic', 'paprika', 'cumin', 'avocado_oil', 'salt'], 'Measure into the chicken/base according to the Prep Day card.'),
    ],
    b4: [
      component('base', 'Protein French Toast', ['egg', 'egg_white', 'cottage', 'fairlife_milk', 'whey_vanilla', 'brown_sugar', 'vanilla', 'cinnamon', 'avocado_oil', 'bread_slice'], 'Cook in the coordinated griddle block; 3 Lean or 4 Bulk slices.'),
      component('topping', 'Fresh fruit and whipped cream', ['strawberry', 'banana', 'whipped_cream'], 'Pack cold and protect from warm toast moisture.'),
      component('cup', 'Sugar-free maple syrup', ['maple_syrup'], 'Pack one separate sealed cup.'),
    ],
    m1: [
      component('protein', 'Breaded chicken thighs', ['chicken_thigh_raw', 'breadcrumbs', 'avocado_oil', 'salt'], 'Bake in one uncrowded oven layer to 165 F.'),
      component('base', 'Protein pasta and creamy tomato sauce', ['protein_pasta', 'crushed_tomatoes', 'fage'], 'Cook pasta one minute short; fold yogurt into the sauce off heat.'),
      component('topping', 'Parmesan and mozzarella finish', ['parmesan', 'mozzarella'], 'Divide by tier during assembly.'),
      component('seasoning', 'Split garlic', ['garlic'], 'Use the exact breading and tomato-sauce splits shown on Prep Day.'),
    ],
    m2: [
      component('protein', 'Mediterranean chicken', ['chicken_thigh_raw'], 'Oven-roast to 165 F and keep in its labeled pan.'),
      component('base', 'Basmati rice', ['rice_dry'], 'Cook once in the common rice wave and divide after weighing the finished yield.'),
      component('side', 'Cold Mediterranean toppings', ['cucumber', 'tomato', 'hummus', 'feta', 'olives', 'red_onion'], 'Keep cold and dry; add only at assembly.'),
      component('seasoning', 'Lemon-oil seasoning', ['lemon', 'avocado_oil', 'salt'], 'Apply to the exact chicken pull on Prep Day.'),
    ],
    m3: [
      component('protein', 'Tandoori bone-in leg quarters and marinade', ['leg_quarter_raw', 'fage', 'lemon', 'garlic', 'ginger', 'paprika', 'cumin', 'coriander', 'avocado_oil', 'salt'], 'Marinate in labeled cook pans overnight and oven-roast skin-side up to 165 F.'),
      component('base', 'Basmati rice', ['rice_dry'], 'Cook in the common rice wave and divide after recording yield.'),
      component('side', 'Broccoli', ['broccoli'], 'Roast in the shared hot-vegetable oven block until just tender.'),
    ],
    m4: [
      component('protein', 'Pepper steak', ['beef_strips_raw', 'avocado_oil', 'salt'], 'Sear in uncrowded watched batches to the controlled endpoint.'),
      component('base', 'Basmati rice', ['rice_dry'], 'Cook in the common rice wave.'),
      component('side', 'Peppers and red onion', ['green_bell_pepper', 'red_onion'], 'Cook crisp-tender in the coordinated vegetable block.'),
      component('sauce', 'Pepper-steak glaze', ['soy_sauce', 'honey', 'garlic', 'cornstarch'], 'Mix ahead and add only after the vegetables and beef are cooked.'),
    ],
    m5: [
      component('protein', 'Lemon-pepper tilapia', ['tilapia_raw', 'lemon', 'black_pepper', 'avocado_oil', 'salt'], 'Roast seafood last to 145 F; use the exact fish-specific seasoning split.'),
      component('side', 'Garlic potatoes and broccoli', ['potato', 'broccoli', 'garlic'], 'Roast potatoes and broccoli in labeled pans during the shared Prep Day oven blocks.'),
      component('cup', 'PRPD Mustard BBQ Sauce', ['bbq_sauce', 'mustard', 'apple_cider_vinegar'], 'Pack one separate sealed 40g cup.'),
    ],
    m6: [
      component('protein', 'Cooked shredded chicken', ['chicken_thigh_raw', 'avocado_oil', 'salt'], 'Cook to 165 F on Prep Day and shred before pan assembly.'),
      component('base', 'Layered enchilada bake', ['small_tortilla', 'large_tortilla', 'black_beans', 'corn', 'enchilada_sauce'], 'Assemble on Prep Day; bake on Cook Day to 165 F.'),
      component('topping', 'Cheese and red onion', ['mozzarella', 'red_onion'], 'Layer inside and over the controlled pan.'),
    ],
    m7: [
      component('protein', 'Cooked and drained beef layer', ['beef_90_raw', 'red_onion', 'garlic', 'black_pepper', 'salt'], 'Cook to 160 F and drain thoroughly before assembly.'),
      component('base', 'PRPD house tomato meat sauce, pasta, and ricotta layers', ['crushed_tomatoes', 'tomato_paste', 'water', 'italian_seasoning', 'lasagna_sheet', 'part_skim_ricotta', 'egg', 'parsley'], 'Make the sauce from canned tomatoes, assemble, and fully bake on Prep Day.'),
      component('topping', 'Mozzarella and Parmesan', ['part_skim_mozzarella', 'parmesan'], 'Finish the pan before baking; cut only after the intact pan is fully chilled.'),
    ],
    m8: [
      component('protein', 'Beef-and-vegetable filling', ['beef_90_raw', 'mixed_vegetables', 'red_onion', 'tomato_paste', 'avocado_oil', 'black_pepper'], 'Cook to 160 F, drain, and complete on Prep Day; plate over the mash rather than baking a casserole.'),
      component('base', 'Packaged instant mash', ['instant_potato_flakes', 'water', 'fairlife_milk', 'butter', 'salt'], 'Use the controlled package ratio; cottage cheese is not used. Portion this into the meal container first.'),
      component('topping', 'Mozzarella', ['mozzarella'], 'Finish each individually plated meal after the beef filling is placed over the mash.'),
      component('cup', 'PRPD Sweet Heat', ['light_mayo', 'ketchup', 'honey', 'hot_sauce'], 'Pack one separate sealed 45g cup.'),
    ],
    d1: [
      component('dessert', 'Protein cheesecake batter', ['reduced_cream_cheese', 'cottage', 'fage', 'egg', 'whey_vanilla', 'cornstarch', 'vanilla', 'lemon', 'salt'], 'Blend, bake, and chill fully on Prep Day.'),
      component('topping', 'Strawberry-honey swirl', ['strawberry', 'honey'], 'Cook down, cool, and swirl before baking.'),
    ],
    d2: [
      component('dessert', 'Chocolate protein mousse', ['fage', 'whey_chocolate', 'cocoa', 'honey'], 'Whisk smooth and portion cold.'),
      component('topping', 'Oreo finish', ['oreo_thin'], 'Add the exact cookie allocation after portioning.'),
    ],
    d3: [
      component('dessert', 'Chocolate-peanut-butter brownie batter', ['flour', 'whey_chocolate', 'egg', 'fage', 'pbfit', 'cocoa', 'honey', 'baking_powder', 'fairlife_milk', 'salt'], 'Mix only until uniform; bake and cool fully on Prep Day.'),
      component('topping', 'Chocolate chips', ['chocolate_chips'], 'Fold or place according to the controlled brownie build.'),
    ],
    a1: [
      component('protein', 'Cooked Buffalo chicken', ['chicken_thigh_raw', 'avocado_oil', 'salt'], 'Oven-cook to 165 F and chill fully on Prep Day.'),
      component('base', 'Pinwheel wrap and chilled filling', ['small_tortilla', 'reduced_cream_cheese', 'mozzarella', 'buffalo_sauce'], 'Make the filling on Prep Day after the chicken is cold; keep tortillas dry and roll on Cook Day.'),
      component('side', 'Lettuce and red onion', ['lettuce', 'red_onion'], 'Keep lettuce completely dry; red onion belongs in the chilled filling. Roll and slice on Cook Day.'),
    ],
    a2: [
      component('protein', 'Mediterranean chicken', ['chicken_thigh_raw', 'lemon', 'avocado_oil', 'salt'], 'Oven-cook to 165 F and chill fully on Prep Day.'),
      component('base', 'Hummus and flatbread', ['hummus', 'shawarma_bread'], 'Keep flatbread dry and separate from wet components.'),
      component('side', 'Mediterranean produce and cheese', ['cucumber', 'tomato', 'feta', 'olives', 'red_onion'], 'Pack chilled after the chicken has cooled.'),
    ],
    a3: [
      component('protein', 'Egg, beef bacon, and cheese', ['egg', 'beef_bacon', 'mozzarella'], 'Cook eggs and bacon on Prep Day, then chill.'),
      component('side', 'Mini apple and cucumber', ['apple', 'cucumber'], 'Keep apple whole and cucumber dry.'),
      component('cup', 'PRPD Mustard BBQ Sauce', ['bbq_sauce', 'mustard', 'apple_cider_vinegar'], 'Pack one separate sealed 40g cup.'),
    ],
    p1: [
      component('protein', 'Formed seasoned 90/10 ground beef', ['beef_90_raw', 'garlic', 'parsley', 'cumin', 'coriander', 'paprika', 'black_pepper', 'salt'], 'Mix and form on Prep Day; oven-cook to 160 F tomorrow, drain thoroughly, and record the formed count and drained yield.'),
      component('side', 'Roasted vegetables', ['zucchini', 'green_bell_pepper', 'red_onion'], 'Oven-roast and rapid-cool on Prep Day; portion with the cooked beef tomorrow.'),
    ],
    p2: [
      component('protein', 'Lean chicken mince', ['chicken_mince_raw'], 'Cook to 165 F in uncrowded watched batches.'),
      component('side', 'Lemon-garlic green beans and onion', ['green_beans', 'red_onion'], 'Cook and rapid-cool on Prep Day; portion with the chicken mince tomorrow.'),
      component('seasoning', 'Lemon-herb seasoning', ['garlic', 'lemon', 'parsley', 'paprika', 'cumin', 'black_pepper', 'salt'], 'Use the exact measured formula in the Prep-Day vegetable cook.'),
    ],
    p3: [
      component('protein', 'Lebanese-style chicken breast', ['chicken_breast_raw'], 'Marinate on Prep Day and oven-cook to 165 F on Cook Day.'),
      component('side', 'Undressed fattoush-style salad', ['lettuce', 'cucumber', 'tomato', 'red_onion', 'parsley'], 'Pack exactly 200g in a separate cold container.'),
      component('cup', 'Marinade and lemon-garlic dressing formula', ['lemon', 'garlic', 'avocado_oil', 'paprika', 'cumin', 'black_pepper', 'salt'], 'Use the displayed split: marinade on chicken and one separate 15g dressing cup.'),
    ],
  };
  for (const id of cilantroGarnishMealIds) {
    activeB8Components[id].push(component('garnish', 'Fresh cilantro finish', ['cilantro'], 'Add exactly 2g to each finished meal at final plating.'));
  }
  for (const [id, componentMap] of Object.entries(activeB8Components)) data.meals[id].componentMap = componentMap;

  // The purchased Batch 8 cooking oil is Altunsa sunflower oil. Normalize only
  // this batch's executable keys after historical methods have been selected.
  const batch8OilKey = key => typeof key === 'string' && key.startsWith('avocado_oil')
    ? key.replace(/^avocado_oil/, 'sunflower_oil')
    : key;
  for (const meal of Object.values(data.meals)) {
    if (meal.proteinCook) meal.proteinCook.recipeKeys = meal.proteinCook.recipeKeys.map(batch8OilKey);
    for (const batch of meal.prepBatches || []) {
      batch.ingredientKeys = (batch.ingredientKeys || []).map(batch8OilKey);
      if (batch.formulaIngredients) {
        batch.formulaIngredients = batch.formulaIngredients.map(item => ({
          ...item,
          key: batch8OilKey(item.key),
          name: String(item.name || '').replace(/Avocado oil/gi, 'Sunflower oil'),
        }));
      }
    }
    for (const part of meal.componentMap || []) part.ingredientKeys = part.ingredientKeys.map(batch8OilKey);
  }

  const setPrepEquipment = (dishId, batchName, equipment) => {
    const batch = (data.meals[dishId]?.prepBatches || []).find(item => item.name === batchName);
    if (batch) Object.assign(batch, equipment);
  };
  setPrepEquipment('d1', 'Baked Strawberry-Lemon Protein Cheesecake', { equipmentLane: 'oven', ovenTemperatureF: 325, estimatedMinutes: 50, sequence: 10, background: true });
  setPrepEquipment('d3', 'Chocolate Peanut Butter Protein Brownie', { equipmentLane: 'oven', ovenTemperatureF: 350, estimatedMinutes: 25, sequence: 20, background: true });
  setPrepEquipment('m7', 'Assemble, fully bake, and chill Lasagna pans', { equipmentLane: 'oven', ovenTemperatureF: 375, estimatedMinutes: 55, sequence: 30, background: true });
  setPrepEquipment('m6', 'Cook and shred Enchilada chicken', { equipmentLane: 'oven', ovenTemperatureF: 400, estimatedMinutes: 25, sequence: 40, background: true });
  setPrepEquipment('a1', 'Cook Buffalo Pinwheel chicken', { equipmentLane: 'oven', ovenTemperatureF: 400, estimatedMinutes: 25, sequence: 40, background: true });
  setPrepEquipment('a2', 'Cook Hummus Box chicken', { equipmentLane: 'oven', ovenTemperatureF: 400, estimatedMinutes: 25, sequence: 40, background: true });
  setPrepEquipment('m3', 'Tandoori broccoli', { equipmentLane: 'oven', ovenTemperatureF: 425, estimatedMinutes: 20, sequence: 50, background: true });
  setPrepEquipment('m4', 'Pepper Steak peppers and onions', { equipmentLane: 'oven', ovenTemperatureF: 425, estimatedMinutes: 18, sequence: 50, background: true });
  setPrepEquipment('m5', 'Tilapia garlic potatoes', { equipmentLane: 'oven', ovenTemperatureF: 425, estimatedMinutes: 35, sequence: 50, background: true });
  setPrepEquipment('m5', 'Tilapia broccoli', { equipmentLane: 'oven', ovenTemperatureF: 425, estimatedMinutes: 20, sequence: 50, background: true });
  setPrepEquipment('p1', 'Nouman roasted beef-meal vegetables', { equipmentLane: 'oven', ovenTemperatureF: 425, estimatedMinutes: 22, sequence: 50, background: true });
  setPrepEquipment('p2', 'Nouman chicken-mince green beans and onion', { equipmentLane: 'oven', ovenTemperatureF: 425, estimatedMinutes: 22, sequence: 50, background: true });

  // Explicit equipment metadata replaces fragile keyword inference and lets the
  // current batch build one real oven/stovetop schedule.
  const cookDayEquipment = {
    b1: { lane: 'griddle', estimatedMinutes: 25, sequence: 60 },
    b2: { lane: 'stovetop', estimatedMinutes: 25, sequence: 20 },
    b3: { lane: 'oven', temperatureF: 400, estimatedMinutes: 25, sequence: 30 },
    b4: { lane: 'griddle', estimatedMinutes: 30, sequence: 70 },
    m1: { lane: 'oven', temperatureF: 400, estimatedMinutes: 30, sequence: 30 },
    m2: { lane: 'oven', temperatureF: 400, estimatedMinutes: 25, sequence: 30 },
    m3: { lane: 'oven', temperatureF: 400, estimatedMinutes: 50, sequence: 30 },
    m4: { lane: 'stovetop', estimatedMinutes: 25, sequence: 40 },
    m5: { lane: 'oven', temperatureF: 400, estimatedMinutes: 18, sequence: 90, seafoodFinal: true },
    m6: { lane: 'oven', temperatureF: 375, estimatedMinutes: 35, sequence: 10 },
    m7: { lane: 'cold-portion', estimatedMinutes: 20, sequence: 50 },
    m8: { lane: 'assembly', estimatedMinutes: 15, sequence: 50 },
    d1: { lane: 'cold-release', estimatedMinutes: 10, sequence: 80 },
    d2: { lane: 'cold-release', estimatedMinutes: 10, sequence: 80 },
    d3: { lane: 'cold-release', estimatedMinutes: 10, sequence: 80 },
    a1: { lane: 'cold-assembly', estimatedMinutes: 20, sequence: 80 },
    a2: { lane: 'cold-assembly', estimatedMinutes: 20, sequence: 80 },
    a3: { lane: 'cold-assembly', estimatedMinutes: 15, sequence: 80 },
    p1: { lane: 'oven', temperatureF: 425, estimatedMinutes: 25, sequence: 40 },
    p2: { lane: 'stovetop', estimatedMinutes: 22, sequence: 40 },
    p3: { lane: 'oven', temperatureF: 400, estimatedMinutes: 25, sequence: 30 },
  };
  for (const [id, equipment] of Object.entries(cookDayEquipment)) {
    data.meals[id].cookDayEquipment = equipment;
    if (data.meals[id].proteinCook && !data.meals[id].proteinCook.prepDayComplete) {
      data.meals[id].proteinCook.lane = equipment.lane;
      data.meals[id].proteinCook.sequence = equipment.sequence;
      if (equipment.temperatureF) data.meals[id].proteinCook.ovenTemperatureF = equipment.temperatureF;
      data.meals[id].proteinCook.estimatedMinutes = equipment.estimatedMinutes;
    }
  }

  for (const id of ['m6', 'm7', 'm8', 'a1', 'a2']) {
    if (data.meals[id].proteinCook) data.meals[id].proteinCook.prepDayComplete = true;
  }
  data.meals.m6.steps = ['Bake the fully assembled refrigerated Enchilada pans to 165 F.', 'Rest, record the finished pan weight, and divide into the exact Lean and Bulk portions.', 'Rapid-cool and release to assembly.'];
  data.meals.m7.steps = ['Verify each intact Prep Day Lasagna tier pan reached 165 F and its cooling log reached 70 F within 2 hours and 41 F or below within 6 hours total.', 'Cut it cold with a clean sharp knife, tare the container, and weigh every square individually: Lean target 447g with a 442g absolute lower bound; Bulk target 594g with a 589g absolute lower bound.', 'Pack the exact live tier counts before setting aside any edge trim. Keep only genuine remainder as owner scrap; do not reheat either master pan before cutting.'];
  data.meals.m8.steps = ['Retrieve the separately chilled packaged mash, beef-and-vegetable filling, mozzarella, cilantro, and Sweet Heat cups; there is no casserole pan and no Cook-Day bake.', 'Tare each meal container, portion the tier-specific mash first, and spoon the tier-specific beef filling over it.', 'Finish with mozzarella and 2g cilantro, add one prepared 45g Sweet Heat cup, verify the filled weight, and release to cold holding.'];
  data.meals.a1.steps = ['Retrieve the fully chilled Buffalo-chicken filling, completely dry lettuce, and sealed tortillas.', 'Spread one measured filling allocation thinly across each tortilla, add lettuce, leave a 1-inch clean edge, and roll tightly.', 'Set seam-side down in the refrigerator for 20-30 minutes, slice evenly with a sharp knife, pack exactly two tortillas worth per order, and release to cold holding.'];
  data.meals.a2.steps = ['Verify the Prep Day chicken is chilled and the cold kit is complete.', 'Assemble the exact chicken, hummus, flatbread, produce, feta, and olive quantities.', 'Seal, label, and release to cold holding.'];

  for (const method of Object.values(data.meals)) {
    if (!method.prepSteps.length) method.prepSteps = [method.steps[0]];
    while (method.steps.length < 3) method.steps.push('Verify the finished count, portion weight, label, and cold-holding status before release.');
  }

  snapshotMethods(8, {
    b1:'Strawberry Cheesecake Protein Pancakes', b2:'Beef Breakfast Skillet', b3:'Chicken Shakshuka', b4:'French Toast',
    m1:'Creamy Chicken Parmesan', m2:'Mediterranean Chicken Bowl', m3:'Tandoori Chicken', m4:'Pepper Steak',
    m5:'Lemon Pepper Tilapia', m6:'Chicken Enchilada Bake', m7:'High Protein Beef Lasagna', m8:'Loaded Beef Cottage Pie',
    d1:'Baked Strawberry-Lemon Protein Cheesecake', d2:'Chocolate Oreo Mousse', d3:'Chocolate Peanut Butter Protein Brownie',
    a1:'Buffalo Chicken Pinwheels', a2:'Mediterranean Chicken Hummus Box', a3:'PRPD Protein Box',
  });

  // Batch 9 uses the same stable dish IDs as prior menus, but the recipes behind
  // those IDs changed. Never allow an older batch's executable methods to attach
  // to the current recipes: replace the complete method table as one atomic batch.
  data.version = '2026-09-03.6';
  data.batch = 9;
  data.labelExemptCustomers = ['Talal'];
  data.familyAllocations = [];
  data.familyPlatingReservations = [];
  data.groceryAdjustments = [];
  data.productionExtras = [];
  data.rawProteinReserveByDish = {};
  data.sharedProteinSeasoning = [];
  data.phases = [
    { title: '1. Confirm counts and labels', detail: 'Lock the final Batch 9 counts and stage only the exact customer containers and labels.' },
    { title: '2. Raw proteins and seasoning', detail: 'Reserve first, weigh every recipe pull, apply the shared neutral chicken base, then finish each labeled recipe separately.' },
    { title: '3. Produce, sauces, and measured prep', detail: 'Sanitize the raw station, chop shared produce once, then complete sauces, grains, sides, desserts, and cold components.' },
    { title: '4. Cook proteins and sides', detail: 'Start ready oven items while active stovetop and grain work continues; record every finished yield.' },
    { title: '5. Assemble by dish and tier', detail: 'Use the controlled Lean, Bulk, or Single plating guide and verify every container count.' },
    { title: '6. Customer pack-out', detail: 'Pack one complete customer bag at a time and reconcile all meals, desserts, add-ons, cups, and side bags.' },
  ];
  data.weeklySauces = {
    enabled: false,
    policy: 'Batch 9 recipe sauces are measured inside their owning controlled recipes.',
    cupSizeOz: 2,
    eligibleMealIds: [],
    customerCupsTotal: 0,
    kitchenUseCupsPerSauce: 0,
    qcCupsPerSauce: 0,
    sauces: [],
  };

  const batch9Keys = {
    b1: ['flour','baking_powder','whey_vanilla','egg','egg_white','fage','fairlife_milk','strawberry','reduced_cream_cheese','powdered_sugar','maple_syrup','vanilla','cinnamon','sunflower_oil','salt'],
    b2: ['english_muffin','beef_bacon','egg','egg_white','mozzarella','potato','sunflower_oil','salt','light_mayo','ketchup','honey','hot_sauce'],
    b3: ['egg','egg_white','mozzarella','mushroom','jalapeno','sourdough_slice','tomato','sunflower_oil','salt'],
    b4: ['chicken_thigh_raw','potato','egg','sunflower_oil','salt','light_mayo','ketchup','honey','hot_sauce','cilantro'],
    m1: ['chicken_thigh_raw','hawaiian_roll','mozzarella','light_mayo','sriracha','honey','onion','pickles','sunflower_oil','salt'],
    m2: ['chicken_thigh_raw','rice_dry','onion','tomato_paste','water','butter','fage','lemon','garlic','ginger','salt','cilantro'],
    m3: ['chicken_thigh_raw','rice_dry','corn','onion','jalapeno','fage','light_mayo','cotija','cilantro','lime','sunflower_oil','salt','green_bell_pepper'],
    m4: ['chicken_thigh_raw','rice_dry','broccoli','harissa','honey','tomato_paste','lemon','garlic','sunflower_oil','paprika','coriander','salt','cilantro'],
    m5: ['chicken_thigh_raw','potato','broccoli','buffalo_sauce','sunflower_oil','salt','cilantro'],
    m6: ['chicken_thigh_raw','protein_pasta','broccoli','fairlife_milk','fage','reduced_cream_cheese','parmesan','garlic','sunflower_oil','salt','black_pepper','cilantro'],
    m7: ['beef_90_raw','rice_dry','cilantro','black_beans','corn','green_bell_pepper','onion','lettuce','cotija','fage','lime','jalapeno','garlic','sunflower_oil','salt'],
    m8: ['pink_salmon_raw','quinoa_dry','cilantro','green_beans','garlic','lemon','paprika','chili_powder','sunflower_oil','salt'],
    d1: ['reduced_cream_cheese','cottage','fage','egg','whey_vanilla','cornstarch','vanilla','lemon','salt','strawberry','honey'],
    d2: ['flour','whey_chocolate','egg','fage','pbfit','cocoa','chocolate_chips','honey','baking_powder','fairlife_milk','salt'],
    d3: ['fage','banana_pudding_mix','whey','banana','biscoff_cookie'],
    a1: ['chicken_thigh_raw','small_tortilla','reduced_cream_cheese','mozzarella','buffalo_sauce','lettuce','red_onion','sunflower_oil','salt'],
    a2: ['chicken_thigh_raw','lettuce','cucumber','parmesan','croutons','fage','light_mayo','lemon','garlic','salt'],
    a3: ['chicken_thigh_raw','lavash','mozzarella','red_onion','bbq_sauce','honey','lime','cilantro','sunflower_oil','paprika','salt'],
    p1: ['beef_96_raw','zucchini','green_bell_pepper','red_onion','garlic','parsley','cumin','coriander','paprika','black_pepper','salt'],
    p2: ['chicken_mince_raw','green_beans','red_onion','garlic','lemon','parsley','paprika','cumin','black_pepper','salt'],
    p3: ['chicken_breast_raw','lemon','garlic','sunflower_oil','paprika','cumin','black_pepper','salt','lettuce','cucumber','tomato','red_onion','parsley'],
  };
  const completeComponent = (id, label, handling) => [component('complete', label, batch9Keys[id], handling)];
  const guides = (leanText, bulkText = leanText) => tierGuide([leanText], [bulkText]);
  const prepAll = (name, steps, options = {}) => ({
    prepBatchSteps: steps,
    prepOptions: { includeAllRecipeIngredients: true, extra: options },
  });
  const b9 = (id, name, order, equipment, temperature, prepSteps, cookSteps, leanPlate, bulkPlate, options = {}) => b8Method(
    name, order, equipment, temperature, cookSteps,
    bulkPlate ? `Lean: ${leanPlate} Bulk: ${bulkPlate}` : leanPlate,
    options.hold || 'Rapid-cool promptly and refrigerate at 41 F or below.',
    prepSteps,
    options.single ? singleGuide(leanPlate) : guides(leanPlate, bulkPlate || leanPlate),
    {
      ...prepAll(name, prepSteps, options.prepEquipment || {}),
      phase: options.phase || 5,
      sideCups: options.sideCups || 0,
      sideBags: options.sideBags || 0,
      riceBatchGroup: options.riceBatchGroup || 'common',
      proteinCook: options.proteinCook || null,
      sideCup: options.sideCup || null,
      panBatch: options.panBatch || null,
      componentMap: completeComponent(id, `${name} complete measured build`, 'Use the exact scaled ingredients and the practical recipe steps shown on this card.'),
      cookDayEquipment: options.cookDayEquipment || null,
    },
  );
  const b9Protein = (name, group, endpoint, key, steps, options = {}) => protein(name, group, endpoint, [key], steps, options);

  data.meals = {
    b1: b9('b1','Strawberry Cheesecake Protein Pancakes',10,['mixing bowls','griddle','side cups'],'Cook until the pancake centers are set.',
      ['Cook the strawberries until thickened, cool them, and mix the measured cheesecake topping.','Measure the dry mix and wet mix separately; refrigerate the wet mix and do not combine until cooking.','Fill one measured syrup cup and one cheesecake-topping cup per order.'],
      ['Combine wet and dry only until smooth, then cook the full batter on the griddle.','Turn when the surface bubbles and the underside is browned; finish until the centers are set.','Cool briefly before packing the pancakes with both sealed cups.'],
      'Pack 3 pancakes with one cheesecake-topping cup and one syrup cup.','Pack 4 pancakes with one cheesecake-topping cup and one syrup cup.',{phase:4,sideCups:2}),
    b2: b9('b2','PRPD Beef Bacon Breakfast Sandwich',20,['oven','egg pan','toaster'],'Cook eggs fully and beef bacon to its package-safe endpoint.',
      ['For Lean only, cut and season the 150 g potato allocation for roasting; Bulk has no potato.','Whisk the measured egg and egg-white mixture.','Mix the exact Sweet Heat ingredients and fill one sealed 45 g cup per order.'],
      ['Roast the potatoes only when Lean is active.','Cook the egg mixture until fully set and cook the beef bacon.','Toast the English muffins and assemble each with one egg patty, one beef-bacon slice, and 28 g mozzarella.'],
      'Pack 1 sandwich, 150 g raw potato cooked as breakfast potatoes, and one 45 g Sweet Heat cup.','Pack 2 complete sandwiches, no potatoes, and one 45 g Sweet Heat cup.',{phase:4,sideCups:1,sideCup:{name:'PRPD Sweet Heat Sauce',batchGroup:'sweet-heat',gramsPerMeal:45,instruction:'Pack one sealed measured cup per order.'}}),
    b3: b9('b3','High Protein Omelette',30,['mixing bowl','nonstick pan','toaster'],'Cook the omelette mixture until fully set.',
      ['Wash and cut the tomato, mushroom, and jalapeno.','Whisk eggs, egg whites, salt, and the measured vegetables; keep the bread dry.'],
      ['Cook the measured omelette mixture until completely set.','Add mozzarella near the end so it melts.','Toast the sourdough separately and pack it dry beside the omelette.'],
      'Pack the Lean omelette with its measured sourdough.','Pack the Bulk omelette with its measured sourdough.',{phase:4}),
    b4: b9('b4','Power Bowl',40,['chicken oven','potato oven','egg pan'],'Cook chicken to 165 F and eggs fully.',
      ['Divide and season the exact chicken pull.','Cut and season the potatoes for roasting.','Mix and fill one measured Sweet Heat cup per bowl.'],
      ['Roast the chicken to 165 F and the potatoes until browned and tender.','Cook the eggs until fully set.','Plate the measured chicken, potatoes, eggs, cilantro, and sealed sauce cup.'],
      'Pack the exact Lean chicken, potato, and egg build with one sauce cup.','Pack the exact Bulk chicken, potato, and egg build with one sauce cup.',{sideCups:1,proteinCook:b9Protein('Power Bowl chicken','chicken','165 F','chicken_thigh_raw',['Roast the labeled chicken pull to 165 F.','Record cooked yield and move it to the labeled Power Bowl pan.']),sideCup:{name:'PRPD Sweet Heat Sauce',batchGroup:'sweet-heat',gramsPerMeal:45,instruction:'Pack one sealed measured cup.'}}),
    m1: b9('m1','Hot Honey Chicken Sliders',50,['chicken oven','sheet pan'],'Cook chicken to 165 F.',
      ['Divide and season the exact chicken pull.','Slice the onions and stage pickles, rolls, mozzarella, and the measured hot-honey sauce.'],
      ['Roast chicken to 165 F and record its yield.','Split the cooked chicken evenly among the rolls; add mozzarella, onion, pickles, and hot-honey sauce.','Warm the assembled sliders only until the cheese melts; do not dry the rolls.'],
      'Pack 3 complete sliders.','Pack 4 complete sliders.',{proteinCook:b9Protein('Slider chicken','chicken','165 F','chicken_thigh_raw',['Roast the labeled chicken pull to 165 F.','Record cooked yield and hold for slider assembly.'])}),
    m2: b9('m2','Butter Chicken',60,['chicken oven','sauce pot','rice cooker'],'Cook chicken to 165 F.',
      ['Divide the chicken and mix it with the measured yogurt, lemon, garlic, ginger, and salt.','Chop onion and measure the tomato paste, butter, water, and rice.'],
      ['Cook rice and record its finished yield.','Roast or sear the chicken to 165 F.','Cook onion in butter, add tomato paste and water, simmer until cohesive, then fold in chicken and finish with yogurt off high heat.'],
      'Pack the Lean butter chicken and rice; finish with cilantro.','Pack the Bulk butter chicken and rice; finish with cilantro.',{proteinCook:b9Protein('Butter Chicken thighs','chicken','165 F','chicken_thigh_raw',['Cook the marinated chicken to 165 F.','Record yield and combine only with the labeled Butter Chicken sauce.']),riceBatchGroup:'common'}),
    m3: b9('m3','Mexican Streetcorn Chicken Bowl',70,['chicken oven','rice cooker','large skillet'],'Cook chicken to 165 F.',
      ['Divide and season the chicken.','Chop onion, bell pepper, jalapeno, cilantro, and lime for the street-corn mixture.','Measure rice and keep the yogurt, mayonnaise, and cotija cold.'],
      ['Cook rice and record yield; roast chicken to 165 F.','Char corn, onion, bell pepper, and jalapeno until excess moisture is controlled, then cool briefly.','Fold in yogurt, mayonnaise, cotija, lime, and cilantro; plate chicken, rice, and street corn in distinct sections.'],
      'Pack the Lean chicken, rice, and street-corn portions.','Pack the Bulk chicken, rice, and street-corn portions.',{proteinCook:b9Protein('Streetcorn Bowl chicken','chicken','165 F','chicken_thigh_raw',['Roast the labeled chicken pull to 165 F.','Record cooked yield and hold for Streetcorn Bowl assembly.']),riceBatchGroup:'common'}),
    m4: b9('m4','Harissa Honey Chicken',80,['chicken oven','rice cooker','broccoli tray'],'Cook chicken to 165 F.',
      ['Whisk harissa, honey, tomato paste, lemon, garlic, oil, paprika, coriander, and salt.','Coat the exact chicken pull; cut broccoli and measure rice.'],
      ['Cook rice and roast broccoli until just tender.','Roast the glazed chicken to 165 F, applying the remaining measured glaze during cooking.','Record yields and plate the tier-specific chicken, rice, and broccoli; finish with cilantro.'],
      'Pack the Lean harissa chicken, rice, and broccoli.','Pack the Bulk harissa chicken, rice, and broccoli.',{proteinCook:b9Protein('Harissa Honey chicken','chicken','165 F','chicken_thigh_raw',['Roast the glazed chicken to 165 F.','Record yield and move to the labeled Harissa pan.']),riceBatchGroup:'common'}),
    m5: b9('m5','Loaded Buffalo Chicken Potato',90,['chicken oven','potato oven','broccoli tray'],'Cook chicken to 165 F.',
      ['Divide and season the chicken.','Scrub and cut the potatoes; cut broccoli and measure Buffalo sauce.'],
      ['Roast potatoes until tender and broccoli until just cooked.','Roast chicken to 165 F, record yield, then coat it with the measured Buffalo sauce.','Split potatoes, add Buffalo chicken and broccoli, and finish with cilantro.'],
      'Pack the Lean loaded potato build.','Pack the Bulk loaded potato build.',{proteinCook:b9Protein('Loaded Buffalo chicken','chicken','165 F','chicken_thigh_raw',['Roast the labeled chicken to 165 F.','Record yield, then coat with its measured Buffalo sauce.'])}),
    m6: b9('m6','Creamy Garlic Parmesan Chicken Pasta',100,['chicken oven','pasta pot','sauce pot'],'Cook chicken to 165 F.',
      ['Keep the boneless thighs whole; trim only loose fat, then divide and season them. Do not cube or slice the raw chicken.','Cut broccoli and measure pasta and all sauce ingredients separately.'],
      ['Roast the whole thighs to 165 F, rest briefly, then slice them into even strips; roast broccoli until just tender.','Boil pasta until tender and drain.','Cook garlic briefly, add milk and cream cheese, whisk smooth, then add Parmesan; remove from high heat before folding in yogurt. Toss with pasta and plate the sliced chicken on top with broccoli and cilantro.'],
      'Pack the Lean sliced chicken over creamy pasta with broccoli.','Pack the Bulk sliced chicken over creamy pasta with broccoli.',{proteinCook:b9Protein('Garlic Parmesan chicken','chicken','165 F','chicken_thigh_raw',['Keep every boneless thigh whole; trim only loose fat and do not cube or slice it raw.','Roast the whole thighs to 165 F, rest briefly, then slice into even strips.','Record the cooked yield before plating over the pasta.'])}),
    m7: b9('m7','Southwest Beef Taco Bowl',110,['beef skillet','rice cooker','vegetable skillet'],'Cook beef to 160 F.',
      ['Divide the beef and measure its garlic, oil, and salt.','Chop pepper, onion, jalapeno, cilantro, and lettuce; rinse and drain beans and corn.','Mix the measured yogurt-lime-jalapeno finish and keep it cold.'],
      ['Cook rice and record yield.','Brown beef to 160 F, drain thoroughly, and record yield.','Cook beans, corn, pepper, and onion until excess moisture is controlled; plate with rice and beef, then add lettuce, cotija, cilantro, and the cold yogurt finish.'],
      'Pack the Lean beef, rice, hot vegetables, and cold toppings.','Pack the Bulk beef, rice, hot vegetables, and cold toppings.',{proteinCook:b9Protein('Southwest Taco beef','beef','160 F','beef_90_raw',['Brown the beef to 160 F.','Drain thoroughly, record yield, and move to the labeled Southwest pan.']),riceBatchGroup:'common'}),
    m8: b9('m8','Cajun Garlic Salmon',120,['salmon oven','quinoa pot','green-bean tray'],'Cook salmon to 145 F.',
      ['Portion salmon and apply the measured garlic, lemon, paprika, chili powder, oil, and salt.','Measure quinoa and trim the green beans.'],
      ['Cook the measured lemon-herb quinoa and record its finished yield; roast the separately measured garlic green beans until just tender.','Bake the separately Cajun-seasoned salmon skin-side down to 145 F, remove skin, check pin bones, and record the edible cooked yield.','Plate the measured salmon, quinoa, and green beans; finish with the reserved cilantro.'],
      'Pack the Lean salmon, quinoa, and green beans.','Pack the Bulk salmon, quinoa, and green beans.',{proteinCook:b9Protein('Cajun Garlic salmon','seafood','145 F','pink_salmon_raw',['Bake salmon to 145 F.','Record yield and move to the labeled salmon pan.'],{sequence:90}),riceBatchGroup:'quinoa'}),
    d1: b9('d1','Baked Strawberry-Lemon Protein Cheesecake',130,['blender','baking pan','325 F oven'],'Bake until edges are set and the center moves as one piece.',
      ['Cook strawberries and honey into a thick reduction, then cool it.','Blend the measured cheesecake batter until smooth and swirl in the cooled strawberry reduction.','Bake at 325 F, cool, and refrigerate intact until fully chilled.'],
      ['Verify the cheesecake is fully chilled.','Weigh the finished pan and divide it into equal customer portions.','Pack each portion cold and record the individual weights.'],
      'Pack one equal-weight chilled cheesecake portion.',null,{single:true,phase:3,prepEquipment:{equipmentLane:'oven',ovenTemperatureF:325,estimatedMinutes:50,sequence:10,background:true},hold:'Keep refrigerated at 41 F or below.'}),
    d2: b9('d2','Chocolate Peanut Butter Protein Brownie',140,['mixing bowls','8 x 4 x 2.5-inch pan','350 F oven'],'Bake until the center is set and a tester has moist crumbs.',
      ['Whisk dry ingredients together; whisk yogurt, milk, honey, and egg separately.','Fold wet into dry only until uniform, add most chips, spread into the 8 x 4 x 2.5-inch pan, and top with remaining chips.','Bake at 350 F, cool completely, weigh the slab, and divide into four equal portions per full pan.'],
      ['Verify the brownie slab is fully cooled.','Divide each full pan into four equal-weight pieces.','Pack the live customer count first and record finished weights.'],
      'Pack one equal-weight brownie portion.',null,{single:true,phase:3,panBatch:{pan:'8 x 4 x 2.5-inch',servingsPerPan:4},prepEquipment:{equipmentLane:'oven',ovenTemperatureF:350,estimatedMinutes:28,sequence:20,background:true,showProductionExtras:true}}),
    d3: b9('d3','Banana Cream Pie Cup',150,['mixing bowl','dessert cups'],'No cook; keep refrigerated.',
      ['Whisk yogurt, banana pudding mix, and protein powder until smooth.','Fold in the measured banana, portion evenly, and finish with Biscoff.','Seal, count, label, and refrigerate every cup.'],
      ['Verify every cup is sealed, cold, and at the controlled weight.','Move the complete count directly to dessert staging.','Do not leave the cups at room temperature during pack-out.'],
      'Pack one chilled Banana Cream Pie cup.',null,{single:true,phase:3,hold:'Keep refrigerated at 41 F or below.'}),
    a1: b9('a1','Buffalo Chicken Pinwheels',160,['chicken oven','cold wrap station'],'Cook chicken to 165 F; serve pinwheels chilled.',
      ['Divide and season the chicken, then cook it to 165 F and chill completely.','Mix cold chicken with cream cheese, mozzarella, Buffalo sauce, and red onion; keep lettuce completely dry.','Spread the filling over each tortilla, add lettuce, roll tightly, set seam-side down, and chill before slicing.'],
      ['Slice each firmly chilled roll evenly with a sharp knife.','Pack four visually even pinwheels per container for this production standard.','Seal and return immediately to refrigeration.'],
      'Pack 4 pinwheels in one chilled Grab & Go container.',null,{single:true,phase:4,proteinCook:b9Protein('Buffalo Pinwheel chicken','chicken','165 F','chicken_thigh_raw',['Cook the labeled chicken pull to 165 F.','Rapid-cool completely before mixing the cold filling.'],{prepDayComplete:true})}),
    a2: b9('a2','Chicken Caesar Crunch Box',170,['chicken oven','cold box station'],'Cook chicken to 165 F; serve box chilled.',
      ['Divide and season the chicken; cook to 165 F, record yield, and chill.','Wash and completely dry lettuce and cucumber.','Mix the measured yogurt Caesar dressing; keep croutons dry.'],
      ['Place chilled chicken, lettuce, cucumber, and Parmesan in the box.','Keep croutons protected from wet ingredients and add the measured dressing.','Seal, label, and refrigerate immediately.'],
      'Pack one complete chilled Caesar Crunch Box.',null,{single:true,phase:4,proteinCook:b9Protein('Caesar Crunch chicken','chicken','165 F','chicken_thigh_raw',['Cook the labeled chicken pull to 165 F.','Record yield and chill completely before box assembly.'],{prepDayComplete:true})}),
    a3: b9('a3','BBQ Chicken Lavash Flatbread',180,['chicken oven','sheet pan'],'Cook chicken to 165 F and bake flatbread until crisp.',
      ['Divide chicken and coat it with the measured barbecue, honey, lime, paprika, oil, and salt.','Slice red onion; stage lavash, mozzarella, and cilantro.'],
      ['Cook chicken to 165 F and record yield.','Top lavash with the measured barbecue chicken, mozzarella, and red onion; bake until the edges crisp and cheese melts.','Cool briefly, cut into four wedges, finish with cilantro, and pack all four wedges in the single Grab & Go box.'],
      'Pack the complete four-wedge flatbread allocation in one Grab & Go box.',null,{single:true,phase:4,proteinCook:b9Protein('BBQ Lavash chicken','chicken','165 F','chicken_thigh_raw',['Cook the barbecue chicken to 165 F.','Record yield and hold for flatbread assembly.'])}),
    p1: b9('p1','High-Protein Beef Kofta & Roasted Vegetables',190,['beef oven','vegetable tray'],'Cook kofta to 160 F.',
      ['Mix the 96/4 beef with the complete measured seasoning.','For every active meal, weigh the complete mixture and divide it into five equal short kofta logs. Each log contains 66 g beef plus its equal share of seasoning. Record the total piece count and average raw mixture weight, then refrigerate covered.','Cut and roast zucchini, bell pepper, and red onion until just tender.'],
      ['Bake the formed kofta to 160 F.','Drain thoroughly and record the finished yield plus average cooked piece weight.','Pack exactly five kofta with one equal share of roasted vegetables in every active container.'],
      'Pack exactly 5 kofta with one equal share of roasted vegetables.',null,{proteinCook:b9Protein('Nouman high-protein beef kofta','beef','160 F','beef_96_raw',['Bake the refrigerated kofta to 160 F.','Drain thoroughly, record yield and average cooked piece weight, and move to Nouman staging.'])}),
    p2: b9('p2','Custom Lean Chicken Mince',200,['nonstick skillet','green-bean tray'],'Cook chicken mince to 165 F.',
      ['Divide chicken mince into its labeled pull.','Cook green beans and onion with measured garlic, lemon, parsley, paprika, cumin, pepper, and salt; cool promptly.'],
      ['Cook chicken mince in uncrowded batches to 165 F.','Record the cooked yield.','Divide chicken mince and the prepared green-bean mixture equally among the active containers.'],
      'Pack one equal share of chicken mince and green beans.',null,{proteinCook:b9Protein('Nouman chicken mince','chicken','165 F','chicken_mince_raw',['Cook in uncrowded batches to 165 F.','Record yield and move to Nouman staging.'])}),
    p3: b9('p3','Custom Lebanese-Style Chicken Breast',210,['chicken oven','cold salad station','dressing cups'],'Cook chicken breast to 165 F.',
      ['Marinate chicken breast with the measured lemon, garlic, oil, paprika, cumin, pepper, and salt.','Wash and completely dry lettuce, cucumber, tomato, red onion, and parsley; keep the salad undressed.','Fill one measured lemon-garlic dressing cup per meal and refrigerate.'],
      ['Bake or grill the marinated chicken to 165 F and record yield.','Portion 225 g cooked chicken into each of the three hot-meal containers; record any measured yield variance instead of silently shrinking a portion.','Pack one separate 200 g undressed salad and one sealed 15 g dressing cup per meal; never dress it before delivery.'],
      'Pack 225 g cooked chicken, one separate 200 g undressed salad, and one sealed 15 g dressing cup.',null,{sideCups:1,sideBags:1,proteinCook:b9Protein('Nouman Lebanese chicken breast','chicken','165 F','chicken_breast_raw',['Cook the marinated breast to 165 F.','Record yield and portion 225 g cooked chicken into each active Nouman meal.']),sideCup:{name:'Lemon-garlic dressing',batchGroup:'nouman-lemon-dressing',gramsPerMeal:15,instruction:'Pack one sealed 15g cup with the separate salad.'}}),
  };

  // Batch 9 operational decomposition. The production recipe owns the total
  // quantity; these maps state where each total is used so prep, seasoning,
  // cooking, and plating cannot silently assign the same ingredient twice.
  const mapped = (role, label, ingredientKeys, handling) => component(role, label, ingredientKeys, handling);
  const batch9Components = {
    b1: [
      mapped('base','Pancake batter',['flour','baking_powder','whey_vanilla','egg','egg_white','fairlife_milk','cinnamon','sunflower_oil','salt'],'Mix wet and dry only on Cook Day and griddle the complete tier batch.'),
      mapped('topping','Strawberry cheesecake topping',['fage','strawberry','reduced_cream_cheese','powdered_sugar','vanilla'],'Cook and cool the fruit; mix the measured chilled cheesecake topping.'),
      mapped('cup','Sugar-free syrup cup',['maple_syrup'],'Fill one measured syrup cup per order.'),
    ],
    b2: [
      mapped('base','Breakfast sandwiches',['english_muffin','beef_bacon','egg','egg_white','mozzarella'],'Lean builds one sandwich; Bulk builds two.'),
      mapped('side','Lean breakfast potatoes',['potato','sunflower_oil','salt'],'This side exists only for Lean; Bulk receives no potatoes.'),
      mapped('cup','PRPD Sweet Heat cup',['light_mayo','ketchup','honey','hot_sauce'],'Fill one 45 g cup per order, not per sandwich.'),
    ],
    b3: [
      mapped('base','Omelette',['egg','egg_white','mozzarella','mushroom','jalapeno','sunflower_oil','salt'],'Cook until fully set.'),
      mapped('side','Toast',['sourdough_slice'],'Toast and keep dry.'),
      mapped('topping','Fresh tomato',['tomato'],'Prepare once in the shared produce block.'),
    ],
    b4: [
      mapped('protein','Power Bowl chicken',['chicken_thigh_raw'],'Use the measured neutral-chicken seasoning split.'),
      mapped('side','Potatoes and eggs',['potato','egg','sunflower_oil','salt'],'The displayed oil and salt are split exactly between chicken and potato prep.'),
      mapped('cup','PRPD Sweet Heat cup',['light_mayo','ketchup','honey','hot_sauce'],'Fill one 45 g cup per bowl.'),
      mapped('topping','Cilantro garnish',['cilantro'],'Reserve for final garnish.'),
    ],
    m1: [
      mapped('protein','Slider chicken',['chicken_thigh_raw','sunflower_oil','salt'],'Use the measured neutral-chicken base.'),
      mapped('base','Slider build',['hawaiian_roll','mozzarella','light_mayo','sriracha','honey'],'Build three Lean or four Bulk sliders.'),
      mapped('topping','Onion and pickles',['onion','pickles'],'Distribute evenly among the sliders.'),
    ],
    m2: [
      mapped('protein','Butter Chicken marinade',['chicken_thigh_raw','lemon','garlic','ginger','salt'],'Use 15 g yogurt per order in the scraped marinade.'),
      mapped('base','Butter Chicken sauce',['onion','tomato_paste','water','butter','fage'],'The aggregate yogurt is split between marinade and sauce.'),
      mapped('side','Rice',['rice_dry'],'Cook in the shared rice batch, weigh, then divide.'),
      mapped('topping','Cilantro garnish',['cilantro'],'Reserve for final garnish.'),
    ],
    m3: [
      mapped('protein','Streetcorn chicken',['chicken_thigh_raw','sunflower_oil','salt'],'Use the exact neutral-chicken split; the remaining salt belongs to the street-corn mixture.'),
      mapped('side','Rice',['rice_dry'],'Cook in the shared rice batch, weigh, then divide.'),
      mapped('base','Street-corn mixture',['corn','onion','jalapeno','fage','light_mayo','cotija','lime','green_bell_pepper'],'Char vegetables, then add the measured cold finish.'),
      mapped('topping','Cilantro',['cilantro'],'Use in the street-corn finish and final garnish.'),
    ],
    m4: [
      mapped('protein','Harissa Honey chicken and glaze',['chicken_thigh_raw','harissa','honey','tomato_paste','lemon','garlic','sunflower_oil','paprika','coriander','salt'],'Apply the neutral base first, then the exact harissa-honey finish.'),
      mapped('side','Rice',['rice_dry'],'Cook in the shared rice batch, weigh, then divide.'),
      mapped('side','Broccoli',['broccoli'],'Roast separately from raw chicken.'),
      mapped('topping','Cilantro garnish',['cilantro'],'Reserve for final garnish.'),
    ],
    m5: [
      mapped('protein','Buffalo chicken',['chicken_thigh_raw','buffalo_sauce'],'Season with the neutral split, cook, then coat with Buffalo sauce.'),
      mapped('side','Potato and broccoli',['potato','broccoli','sunflower_oil','salt'],'Use the separately displayed vegetable oil and salt split.'),
      mapped('topping','Cilantro garnish',['cilantro'],'Reserve for final garnish.'),
    ],
    m6: [
      mapped('protein','Garlic Parmesan chicken',['chicken_thigh_raw','sunflower_oil'],'Season with its displayed salt and pepper split and cook separately.'),
      mapped('base','Creamy garlic Parmesan pasta',['protein_pasta','fairlife_milk','fage','reduced_cream_cheese','parmesan','garlic','salt','black_pepper'],'Parmesan goes into the sauce; yogurt is folded in off direct heat.'),
      mapped('side','Broccoli',['broccoli'],'Cook separately until just tender.'),
      mapped('topping','Cilantro garnish',['cilantro'],'Reserve for final garnish.'),
    ],
    m7: [
      mapped('protein','Drained taco beef',['beef_90_raw','salt'],'Brown to 160 F, drain thoroughly, then apply its measured salt split.'),
      mapped('side','Cilantro-lime rice',['rice_dry','cilantro'],'Cook, weigh, and reserve 2 g cilantro per meal for final garnish.'),
      mapped('base','Corn, bean, pepper, and onion mixture',['black_beans','corn','green_bell_pepper','onion','sunflower_oil'],'Cook until excess moisture is controlled.'),
      mapped('cup','Jalapeno-lime yogurt finish',['fage','lime','jalapeno','garlic'],'This is a measured 37 g cold finish per meal.'),
      mapped('topping','Lettuce and cotija',['lettuce','cotija'],'Add cold during final assembly.'),
    ],
    m8: [
      mapped('protein','Cajun salmon',['pink_salmon_raw','paprika','chili_powder'],'Bake skin-side down, remove skin, and verify edible yield.'),
      mapped('side','Lemon-herb quinoa',['quinoa_dry','cilantro'],'Use its measured lemon, garlic, and salt split.'),
      mapped('side','Garlic green beans',['green_beans'],'Use their measured lemon, garlic, oil, and salt split.'),
      mapped('seasoning','Measured lemon-garlic split',['garlic','lemon','sunflower_oil','salt'],'The planner divides these totals across salmon, quinoa, and green beans.'),
    ],
    d1: [mapped('complete','Strawberry-lemon cheesecake',['reduced_cream_cheese','cottage','fage','egg','whey_vanilla','cornstarch','vanilla','lemon','salt','strawberry','honey'],'Bake one controlled pan and portion only after fully chilled.')],
    d2: [mapped('complete','Chocolate peanut-butter brownie',['flour','whey_chocolate','egg','fage','pbfit','cocoa','chocolate_chips','honey','baking_powder','fairlife_milk','salt'],'Bake the full 8 x 4 x 2.5-inch pan and cut four equal-weight portions.')],
    d3: [mapped('complete','Banana Cream Pie cups',['fage','banana_pudding_mix','whey','banana','biscoff_cookie'],'Mix, portion, finish, seal, and chill.')],
    a1: [
      mapped('protein','Pinwheel chicken',['chicken_thigh_raw','sunflower_oil','salt'],'Use the neutral-chicken base, cook, shred, and chill completely.'),
      mapped('base','Chilled Buffalo filling',['reduced_cream_cheese','mozzarella','buffalo_sauce'],'Mix only with fully chilled chicken.'),
      mapped('topping','Dry wrap vegetables',['lettuce','red_onion'],'Keep lettuce completely dry.'),
      mapped('base','Tortilla wraps',['small_tortilla'],'Use two tortillas and cut into four total pinwheels per order.'),
    ],
    a2: [
      mapped('protein','Caesar chicken',['chicken_thigh_raw','salt'],'Cook to 165 F and chill completely.'),
      mapped('base','Caesar box',['lettuce','cucumber','parmesan'],'Keep produce dry.'),
      mapped('cup','Yogurt-Caesar dressing',['fage','light_mayo','lemon','garlic'],'Fill one 35 g measured portion per box.'),
      mapped('side','Dry croutons',['croutons'],'Protect from wet ingredients.'),
    ],
    a3: [
      mapped('protein','Honey-lime BBQ chicken',['chicken_thigh_raw','bbq_sauce','honey','lime','sunflower_oil','paprika','salt'],'Cook to 165 F and retain the measured sauce allocation.'),
      mapped('base','Lavash flatbread',['lavash','mozzarella','red_onion'],'Bake until crisp and cut into four wedges.'),
      mapped('topping','Cilantro garnish',['cilantro'],'Reserve for final garnish.'),
    ],
    p1: [
      mapped('protein','High-Protein Beef Kofta & Roasted Vegetables',['beef_96_raw','garlic','parsley','cumin','coriander','paprika','black_pepper','salt'],'Mix the complete beef and seasoning quantity, divide into exactly five equal logs per active meal, refrigerate, then bake to 160 F.'),
      mapped('side','Roasted vegetables',['zucchini','green_bell_pepper','red_onion'],'Roast separately and divide equally among the three meals.'),
    ],
    p2: [
      mapped('protein','Lean chicken mince',['chicken_mince_raw'],'Cook to 165 F and divide by finished yield.'),
      mapped('side','Lemon-herb green beans',['green_beans','red_onion','garlic','lemon','parsley','paprika','cumin','black_pepper','salt'],'Cook the measured side separately.'),
    ],
    p3: [
      mapped('protein','Lebanese chicken breast',['chicken_breast_raw','paprika','cumin'],'Marinate without sumac and cook to 165 F.'),
      mapped('seasoning','Marinade and dressing split',['lemon','garlic','sunflower_oil','black_pepper','salt'],'Split the aggregate totals into the exact marinade and 15 g dressing formulas.'),
      mapped('side','Separate 200 g undressed salad',['lettuce','cucumber','tomato','red_onion','parsley'],'Pack cold and separate from the hot chicken.'),
    ],
  };
  for (const [id, components] of Object.entries(batch9Components)) data.meals[id].componentMap = components;

  const measuredFormula = (key, name, amounts) => ({ key, name, unit: 'g', includeInGrocery: false, ...amounts });
  const neutralChickenPrep = (name, proteinKey, amounts, extraKeys = [], extraFormulas = [], extraSteps = [], workflow = {}) => prep(
    'marinade', name, 'Season the exact active chicken pull; the pooled reserve remains plain.', [proteinKey, ...extraKeys],
    ['Weigh the active recipe chicken before adding anything.', 'Apply the displayed neutral base to the combined compatible pull.', ...extraSteps, 'Cover, label, date, and refrigerate at 40 F or below.'],
    {
      seasoningFamily: 'batch9-neutral-chicken',
      seasoningFamilyName: 'Batch 9 neutral chicken base',
      seasoningFinishNote: 'After weighing the labeled split, add only the recipe-specific finish displayed here.',
      proteinForm: workflow.proteinForm || 'standard pieces',
      releaseTiming: workflow.releaseTiming || 'cook-day',
      finishTiming: workflow.finishTiming || 'cook-day',
      poolStorage: workflow.poolStorage !== false,
      formulaIngredients: [
        measuredFormula('neutral_chicken_oil','Sunflower oil for neutral chicken base',amounts.oil),
        measuredFormula('neutral_chicken_salt','Salt for neutral chicken base',amounts.salt),
        ...extraFormulas,
      ],
    },
  );
  const workCard = (type, name, instruction, keys, steps, options = {}) => prep(type, name, instruction, keys, steps, options);

  data.meals.b4.prepBatches = [
    neutralChickenPrep('Power Bowl chicken seasoning','chicken_thigh_raw',{oil:{lean:1,bulk:1.5},salt:{lean:.5,bulk:.75}}),
    workCard('side','Power Bowl potatoes and eggs','Prepare the tier-controlled potato and egg components.',['potato','egg','cilantro'],['Cut potatoes and apply the displayed vegetable oil and salt.','Keep the measured eggs cold for Cook Day.'],{formulaIngredients:[measuredFormula('b4_side_oil','Oil for Power Bowl potatoes',{lean:1,bulk:1.5}),measuredFormula('b4_side_salt','Salt for Power Bowl potatoes',{lean:.25,bulk:.25})]}),
    workCard('sauce','Power Bowl Sweet Heat cups','Fill one sealed 45 g cup per active bowl.',['light_mayo','ketchup','honey','hot_sauce'],['Whisk until uniform.','Tare, fill, seal, count, and refrigerate.']),
  ];
  data.meals.m1.prepBatches = [
    neutralChickenPrep('Hot Honey Slider chicken seasoning','chicken_thigh_raw',{oil:{lean:1,bulk:1.5},salt:{lean:.5,bulk:.75}}),
    workCard('mise-en-place','Hot Honey Slider assembly','Stage the exact roll, cheese, sauce, onion, and pickle pull.',['hawaiian_roll','mozzarella','light_mayo','sriracha','honey','onion','pickles'],['Mix the measured sriracha, honey, and mayonnaise.','Keep rolls sealed; cover and refrigerate the remaining measured components.']),
  ];
  data.meals.m2.prepBatches = [
    workCard('marinade','Butter Chicken marinade','Marinate only the exact active chicken pull.',['chicken_thigh_raw','lemon','garlic','ginger','salt'],['Whisk the displayed marinade with 15 g yogurt per order.','Coat chicken, cover, label, date, and refrigerate.'],{formulaIngredients:[measuredFormula('m2_marinade_yogurt','Yogurt retained in Butter Chicken marinade',{lean:15,bulk:15})]}),
    workCard('sauce','Butter Chicken sauce','Measure the complete sauce separately.',['onion','tomato_paste','water','butter'],['Chop onion and measure the tomato paste, water, butter, and sauce yogurt.','Keep the sauce yogurt cold for the off-heat finish.'],{formulaIngredients:[measuredFormula('m2_sauce_yogurt','Yogurt for Butter Chicken sauce',{lean:30,bulk:45})]}),
    workCard('grain','Butter Chicken rice','Add the exact dry amount to the shared rice cook.',['rice_dry','cilantro'],['Record the dry amount and destination.','Reserve cilantro for final garnish.'],{prepWave:'rice',prepWaveName:'One shared rice cook'}),
  ];
  data.meals.m3.prepBatches = [
    neutralChickenPrep('Streetcorn Bowl chicken seasoning','chicken_thigh_raw',{oil:{lean:2,bulk:3},salt:{lean:.25,bulk:.5}}),
    workCard('grain','Streetcorn Bowl rice','Add the exact dry amount to the shared rice cook.',['rice_dry'],['Record the dry amount and destination.'],{prepWave:'rice',prepWaveName:'One shared rice cook'}),
    workCard('vegetable-ahead','Street-corn mixture','Prepare the complete corn, pepper, onion, jalapeno, and cold finish.',['corn','onion','jalapeno','fage','light_mayo','cotija','cilantro','lime','green_bell_pepper'],['Char corn, pepper, onion, and jalapeno until excess moisture is controlled.','Rapid-cool the vegetables before folding in yogurt, mayonnaise, cotija, lime, and cilantro. No additional salt is allocated to this component.']),
  ];
  data.meals.m4.prepBatches = [
    neutralChickenPrep('Harissa Honey chicken seasoning','chicken_thigh_raw',{oil:{lean:2,bulk:3},salt:{lean:.5,bulk:.75}},['harissa','honey','tomato_paste','lemon','garlic','paprika','coriander'],[measuredFormula('m4_glaze_oil','Additional oil in Harissa Honey glaze',{lean:2,bulk:3}),measuredFormula('m4_glaze_salt','Additional salt in Harissa Honey glaze',{lean:1.1,bulk:1.65})],['Whisk and add the displayed harissa-honey finish only after the neutral base is divided.'],{releaseTiming:'prep-day',finishTiming:'prep-day'}),
    workCard('grain','Harissa Honey rice','Add the exact dry amount to the shared rice cook.',['rice_dry'],['Record the dry amount and destination.'],{prepWave:'rice',prepWaveName:'One shared rice cook'}),
    workCard('vegetable-ahead','Harissa broccoli and garnish','Cut the exact broccoli pull and reserve cilantro.',['broccoli','cilantro'],['Keep broccoli on a separate labeled tray from raw chicken.','Reserve cilantro for final garnish.']),
  ];
  data.meals.m5.prepBatches = [
    neutralChickenPrep('Loaded Buffalo chicken seasoning','chicken_thigh_raw',{oil:{lean:2,bulk:2},salt:{lean:.25,bulk:.5}},['buffalo_sauce'],[],['Keep Buffalo sauce measured separately and coat the chicken only after it reaches 165 F.']),
    workCard('side','Loaded Buffalo potatoes and broccoli','Prepare the vegetables on trays separate from raw chicken.',['potato','broccoli','cilantro'],['Cut potatoes and broccoli.','Apply the displayed vegetable oil and salt; reserve cilantro for garnish.'],{formulaIngredients:[measuredFormula('m5_side_oil','Oil for potato and broccoli',{lean:2,bulk:2}),measuredFormula('m5_side_salt','Salt for potato and broccoli',{lean:.25,bulk:.25})]}),
  ];
  data.meals.m6.prepBatches = [
    neutralChickenPrep('Garlic Parmesan chicken seasoning','chicken_thigh_raw',{oil:{lean:2,bulk:3},salt:{lean:.5,bulk:.75}},[],[measuredFormula('m6_chicken_pepper','Black pepper for chicken',{lean:.25,bulk:.4})],['Keep the thighs whole; trim only loose fat and do not cube or slice the raw chicken.','Add the displayed chicken pepper after the neutral split.'],{proteinForm:'whole thighs'}),
    workCard('sauce','Creamy garlic Parmesan pasta and sauce','Measure pasta, broccoli, and every sauce component.',['protein_pasta','broccoli','fairlife_milk','fage','reduced_cream_cheese','parmesan','garlic','cilantro'],['Keep Parmesan with the sauce ingredients.','Keep yogurt cold; fold it into the finished sauce off direct heat.'],{formulaIngredients:[measuredFormula('m6_sauce_salt','Salt for pasta sauce',{lean:.25,bulk:.25}),measuredFormula('m6_sauce_pepper','Black pepper for pasta sauce',{lean:.25,bulk:.35})]}),
  ];
  data.meals.m7.prepBatches = [
    workCard('protein-portion','Southwest taco beef','Weigh the exact beef pull; reserve stays plain.',['beef_90_raw'],['Keep beef ground.','Brown to 160 F on Cook Day, drain thoroughly, then add the displayed beef salt.'],{formulaIngredients:[measuredFormula('m7_beef_salt','Salt for drained taco beef',{lean:.5,bulk:.75})]}),
    workCard('grain','Southwest cilantro-lime rice','Add the exact dry amount to the shared rice cook.',['rice_dry','cilantro'],['Reserve 2 g cilantro per meal for final garnish; use the remainder in the rice.'],{prepWave:'rice',prepWaveName:'One shared rice cook'}),
    workCard('vegetable-ahead','Southwest hot vegetables','Prepare the beans, corn, pepper, and onion.',['black_beans','corn','green_bell_pepper','onion','sunflower_oil'],['Drain beans and corn.','Cook with pepper, onion, oil, and the displayed vegetable salt until moisture is controlled.'],{formulaIngredients:[measuredFormula('m7_vegetable_salt','Salt for Southwest vegetables',{lean:.25,bulk:.25})]}),
    workCard('sauce','Jalapeno-lime yogurt finish','Make one measured 37 g cold finish per meal.',['fage','lime','jalapeno','garlic'],['Whisk until uniform.','Hold cold with the measured lettuce and cotija topping.']),
    workCard('cold-kit','Southwest cold toppings','Keep toppings cold and dry.',['lettuce','cotija'],['Wash and dry lettuce.','Cover, label, and refrigerate with cotija separate.']),
  ];
  data.meals.m8.prepBatches = [
    workCard('marinade','Cajun salmon seasoning','Season only the salmon with the displayed fish allocation.',['pink_salmon_raw','paprika','chili_powder'],['Keep skin on for baking and check pin bones.','Apply the displayed salmon lemon, garlic, oil, and salt; cover and refrigerate.'],{formulaIngredients:[measuredFormula('m8_salmon_garlic','Garlic for salmon',{lean:5,bulk:6}),measuredFormula('m8_salmon_lemon','Lemon for salmon',{lean:5,bulk:6}),measuredFormula('m8_salmon_oil','Oil for salmon',{lean:3,bulk:4}),measuredFormula('m8_salmon_salt','Salt for salmon',{lean:.5,bulk:.65})]}),
    workCard('grain','Lemon-herb quinoa','Measure the quinoa and its exact seasoning split.',['quinoa_dry'],['Measure the displayed quinoa garlic, lemon, cilantro, and salt separately.'],{formulaIngredients:[measuredFormula('m8_quinoa_garlic','Garlic for quinoa',{lean:1,bulk:1}),measuredFormula('m8_quinoa_lemon','Lemon for quinoa',{lean:5,bulk:6}),measuredFormula('m8_quinoa_cilantro','Cilantro for quinoa',{lean:3,bulk:4}),measuredFormula('m8_quinoa_salt','Salt for quinoa',{lean:.1,bulk:.15})],prepWave:'quinoa',prepWaveName:'Separate quinoa cook'}),
    workCard('vegetable-ahead','Garlic green beans','Prepare green beans with their exact seasoning split.',['green_beans'],['Trim green beans.','Apply the displayed garlic, lemon, oil, and salt before roasting.'],{formulaIngredients:[measuredFormula('m8_beans_garlic','Garlic for green beans',{lean:2,bulk:3}),measuredFormula('m8_beans_lemon','Lemon for green beans',{lean:2,bulk:3}),measuredFormula('m8_beans_oil','Oil for green beans',{lean:2,bulk:3}),measuredFormula('m8_beans_salt','Salt for green beans',{lean:.15,bulk:.2})]}),
    workCard('cold-kit','Salmon garnish','Reserve only the final garnish.',[],['Reserve exactly 2 g cilantro per meal after measuring the quinoa herb allocation.'],{formulaIngredients:[measuredFormula('m8_garnish_cilantro','Cilantro reserved for garnish',{lean:2,bulk:2})]}),
  ];
  data.meals.a1.prepBatches = [
    neutralChickenPrep('Buffalo Pinwheel chicken seasoning','chicken_thigh_raw',{oil:{single:1},salt:{single:.25}},[],[],['Cook to 165 F, shred, and chill completely before mixing the filling.'],{releaseTiming:'prep-day'}),
    workCard('mix','Buffalo Pinwheel filling and wraps','Prepare the filling only after chicken is fully chilled.',['small_tortilla','reduced_cream_cheese','mozzarella','buffalo_sauce','lettuce','red_onion'],['Mix chilled chicken with cream cheese, mozzarella, Buffalo sauce, and onion.','Keep lettuce dry; roll two tortillas and cut into four total pinwheels per order.']),
  ];
  data.meals.a2.prepBatches = [
    workCard('protein-cook-ahead','Caesar Crunch chicken','Season and cook the exact chicken pull today.',['chicken_thigh_raw'],['Apply the displayed salt, cook to 165 F, record yield, and chill to 41 F or below.'],{formulaIngredients:[measuredFormula('a2_chicken_salt','Salt for Caesar chicken',{single:.3})]}),
    workCard('sauce','Yogurt-Caesar dressing','Make one measured 35 g dressing portion per box.',['fage','light_mayo','lemon','garlic'],['Whisk until uniform and refrigerate.']),
    workCard('cold-kit','Caesar box components','Keep cold components dry and separate.',['lettuce','cucumber','parmesan','croutons'],['Wash and dry produce.','Keep croutons protected from wet ingredients.']),
  ];
  data.meals.a3.prepBatches = [
    neutralChickenPrep('BBQ Lavash chicken seasoning','chicken_thigh_raw',{oil:{single:1},salt:{single:.25}},['bbq_sauce','honey','lime','paprika'],[],['Keep the BBQ, honey, lime, and paprika finish measured separately. Add it only after the BBQ chicken amount is pulled from the master batch on Cook Day.']),
    workCard('mise-en-place','BBQ Lavash assembly','Stage the flatbread components.',['lavash','mozzarella','red_onion','cilantro'],['Slice onion and keep cilantro cold.','Keep lavash sealed and dry.']),
  ];
  data.meals.p1.prepBatches = [
    workCard('form-and-marinate','Nouman high-protein beef kofta','Season the active customer portions and form exactly five kofta per meal today.',['beef_96_raw','garlic','parsley','cumin','coriander','paprika','black_pepper','salt'],['Mix until seasonings are evenly distributed.','Weigh the complete mixture and divide it into five equal logs per active meal. Record the total count and average raw mixture weight, cover, and refrigerate.']),
    workCard('vegetable-ahead','Nouman kofta vegetables','Roast the complete vegetable side today.',['zucchini','green_bell_pepper','red_onion'],['Cut evenly and roast until just tender.','Record yield, cool promptly, and refrigerate in the labeled Nouman pan.']),
  ];
  data.meals.p2.prepBatches = [
    workCard('protein-portion','Nouman lean chicken mince','Weigh the exact active chicken-mince pull.',['chicken_mince_raw'],['Keep mince ground and refrigerated for Cook Day.'],{formulaIngredients:[measuredFormula('p2_chicken_salt','Salt for chicken mince',{lean:.5})]}),
    workCard('vegetable-ahead','Nouman lemon-herb green beans','Prepare the complete vegetable side.',['green_beans','red_onion','garlic','lemon','parsley','paprika','cumin','black_pepper'],['Cook green beans and onion with the displayed seasoning.','Cool promptly and refrigerate.'],{formulaIngredients:[measuredFormula('p2_side_salt','Salt for chicken-mince side',{lean:.5})]}),
  ];
  data.meals.p3.prepBatches = [
    workCard('marinade','Nouman Lebanese chicken marinade','Marinate the exact 300 g raw chicken breast per meal without sumac.',['chicken_breast_raw','paprika','cumin'],['Whisk the displayed marinade formula.','Coat only the customer chicken pull; keep reserve plain.','Cover, label, date, and refrigerate.'],{formulaIngredients:[measuredFormula('p3_marinade_lemon','Lemon juice for chicken marinade',{lean:8}),measuredFormula('p3_marinade_garlic','Garlic for chicken marinade',{lean:3}),measuredFormula('p3_marinade_oil','Oil for chicken marinade',{lean:2}),measuredFormula('p3_marinade_pepper','Black pepper for chicken marinade',{lean:.4}),measuredFormula('p3_marinade_salt','Salt for chicken marinade',{lean:.75})]}),
    workCard('sauce','Nouman lemon-garlic dressing cups','Make one 15 g cup per active meal without sumac.',[],['Whisk until uniform.','Tare each cup, fill to 15 g net, seal, count, and refrigerate.'],{formulaIngredients:[measuredFormula('p3_dressing_lemon','Lemon juice for dressing',{lean:12}),measuredFormula('p3_dressing_garlic','Garlic for dressing',{lean:1}),measuredFormula('p3_dressing_oil','Oil for dressing',{lean:1}),measuredFormula('p3_dressing_pepper','Black pepper for dressing',{lean:.1}),measuredFormula('p3_dressing_salt','Salt for dressing',{lean:.25})]}),
    workCard('cold-kit','Nouman 200 g salad kits','Prepare one undressed salad per active meal.',['lettuce','cucumber','tomato','red_onion','parsley'],['Wash and dry every vegetable thoroughly.','Portion 200 g per meal, cover, and refrigerate separately from hot chicken.']),
  ];

  for (const method of Object.values(data.meals)) {
    if (!method.prepSteps.length) method.prepSteps = [method.steps[0]];
    while (method.steps.length < 3) method.steps.push('Verify the finished count, portion weight, label, and cold-holding status before release.');
  }

  snapshotMethods(9, {
    b1:'Strawberry Cheesecake Protein Pancakes', b2:'PRPD Beef Bacon Breakfast Sandwich', b3:'High Protein Omelette', b4:'Power Bowl',
    m1:'Hot Honey Chicken Sliders', m2:'Butter Chicken', m3:'Mexican Streetcorn Chicken Bowl', m4:'Harissa Honey Chicken',
    m5:'Loaded Buffalo Chicken Potato', m6:'Creamy Garlic Parmesan Chicken Pasta', m7:'Southwest Beef Taco Bowl', m8:'Cajun Garlic Salmon',
    d1:'Baked Strawberry-Lemon Protein Cheesecake', d2:'Chocolate Peanut Butter Protein Brownie', d3:'Banana Cream Pie Cup',
    a1:'Buffalo Chicken Pinwheels', a2:'Chicken Caesar Crunch Box', a3:'BBQ Chicken Lavash Flatbread',
    p1:'Nouman High-Protein Beef Kofta & Roasted Vegetables', p2:'Nouman Lean Chicken Mince', p3:'Nouman Lebanese Chicken Breast',
  });
  const batch10CustomMethods = Object.fromEntries(['p1','p2','p3'].map(id => [id, JSON.parse(JSON.stringify(data.meals[id]))]));

  // Batch 10 is selected by recipe identity. Slot IDs are only an adapter for the
  // existing renderer, never a source of methods for a returning dish.
  const batch10DishNames = {
    b1:'Blueberry Cheesecake Protein Pancakes', b2:'French Toast', b3:'Grilled Cheese Breakfast Burrito', b4:'Chicken Shakshuka',
    m1:'Peri Peri Chicken', m2:'Halal Cart Chicken + Yellow Rice', m3:'Chicken Biryani', m4:'Chicken Enchilada Bake',
    m5:'Beef Seekh Kabab Shawarma', m6:'Creamy Cajun Chicken Pasta', m7:'Sweet Chili Chicken with Vegetable Rice', m8:'Garlic Butter Shrimp + Rice',
    d1:'Baked Strawberry-Lemon Protein Cheesecake', d2:'High Protein Tiramisu', d3:'Oreo Protein Cheesecake Cup',
    a1:'Buffalo Chicken Pinwheels', a2:'Mediterranean Chicken Hummus Box', a3:'Mini Chicken Snack Wrap',
  };
  const batch10MethodsByName = {};
  const card10 = (type, name, keys, steps, options = {}) => prep(type, name, steps[0], keys, steps, options);
  const garlicSauceCard = (green=false, use='Pack cold') => card10('sauce', green?'Green jalapeno garlic sauce':'White garlic sauce',
    ['fage','light_mayo','garlic','lemon',...(green?['jalapeno']:[])],
    ['Blend the measured yogurt, light mayonnaise, garlic and lemon until smooth.', ...(green?['Blend the measured jalapeno into this allocated portion of the same white base.']:[]), `${use}. Keep at 41 F or below.`],
    {componentRef:green?'green-garlic':'white-garlic',sharedSauceFamily:'house-garlic',sauceVariant:green?'green':'white',sauceUse:use});
  const raw10 = (name, keys, steps, options = {}) => card10('marinade', name, keys,
    [...steps, 'Cover, label, date, and refrigerate at 40 F or below; keep any plain reserve separate.'], {stage:'proteins',...options});
  const grain10 = (name, keys = ['rice_dry'], group = 'common', options = {}) => {
    const {cookAhead=false,steps:customSteps,...cardOptions}=options;
    return card10(cookAhead ? 'starch-ahead' : 'grain', name, keys,
    customSteps || (cookAhead
      ? ['Cook the complete displayed dry-grain allocation today with its displayed additions.','Record dry and finished weights, spread in a shallow pan, rapid-cool, cover, label, date, and refrigerate at 41 F or below.']
      : ['Weigh this exact dry grain allocation and label its destination.','Keep dry until the coordinated Cook Day grain wave; record the finished yield before dividing.']),
    {prepWave:group,prepWaveName:group === 'common' ? 'Shared plain rice cook' : name,...cardOptions});
  };
  const coldRelease10 = ['Verify the sealed portions are fully chilled and match the active count.','Check each portion weight and exact label.','Keep at 41 F or below through pack-out.'];
  const define10 = (name, cards, steps, plating, options = {}) => {
    // Cooking ahead is a different action from opening and seasoning raw meat.
    // Its metadata follows the recipe across menu slots, never a weekly count.
    if (options.prepDayComplete && options.proteinKey) {
      for (const card of cards.filter(c=>c.type==='marinade' && c.ingredientKeys.includes(options.proteinKey))) {
        const finish = /shred/i.test(card.steps.join(' ')) ? 'Shred' : 'Dice';
        card.steps = ['Keep thighs whole for cooking. Coat the exact chicken pull with the displayed seasonings.', 'Cover and refrigerate until the cook-ahead station.'];
        card.proteinForm = 'Whole thighs; cut after cooking';
        card.releaseTiming = 'prep-day'; card.finishTiming = 'prep-day';
        card.cookAhead = {lane:'stovetop',steps:['Cook the seasoned thighs in uncrowded batches to 165 F. Record cooked yield.',`${finish} the cooked chicken, then spread in shallow pans and rapid-cool to 41 F or below before mixing cold fillings or assembling cold pans.`]};
        if (card.ingredientKeys.every(key=>[options.proteinKey,'sunflower_oil','salt'].includes(key))) {
          card.seasoningFamily = 'neutral-oil-salt';
          card.seasoningFamilyName = 'Neutral chicken base';
        }
      }
    }
    const keys = [...new Set(cards.flatMap(card => card.ingredientKeys || []))];
    const method = meal(options.phase || 5, options.order || 50, options.equipment || ['digital scale','labeled pans'],
      options.temperature || 'Cook chicken to 165 F; rapid-cool and hold at 41 F or below.', steps,
      plating.join(' '), 'Rapid-cool cooked food promptly; hold at 41 F or below.', {
        prepSteps: cards.map(card => card.instruction), prepBatches: cards,
        assemblyGuide: options.single ? singleGuide(...plating) : tierGuide([plating[0]], [plating[1] || plating[0]]),
        componentMap: options.components || [component('complete', `${name} measured recipe`, keys, 'Use the exact tier weights and the component instructions on the measured prep cards.')],
        proteinCook: options.proteinKey ? protein(name, options.proteinGroup || 'chicken', options.endpoint || '165 F', [options.proteinKey],
          options.prepDayComplete ? ['Verify the cooked protein is fully chilled before assembly.'] : steps,
          {prepDayComplete:!!options.prepDayComplete,lane:options.lane || 'oven',ovenTemperatureF:options.ovenTemperatureF || 0,sequence:options.sequence || 30}) : null,
        sideCups:options.sideCups || 0, sideCup:options.sideCup || null, sideBags:options.sideBags || 0,
        riceBatchGroup:options.riceBatchGroup || 'common',
        panBatch:options.panBatch || null,
        cookDayEquipment:{lane:options.lane || 'assembly',temperatureF:options.ovenTemperatureF || 0,estimatedMinutes:options.minutes || 25,sequence:options.sequence || 30},
      });
    method.recipeName = name;
    method.source = options.source || 'Current controlled Batch 10 recipe; historical returns are not a substitute for live ingredient weights.';
    method.validation = options.validation || 'Record finished yield, portion weights, package fit, and cold-hold quality. No automatic owner portions.';
    batch10MethodsByName[name] = method;
    return method;
  };

  define10('Blueberry Cheesecake Protein Pancakes', [
    card10('measured-prep','Pancake batter and topping split',['flour','baking_powder','whey_vanilla','egg','egg_white','fage','fairlife_milk','blueberry','reduced_cream_cheese','powdered_sugar','vanilla','cinnamon','sunflower_oil','salt'],
      ['Measure the batter ingredients and cheesecake topping separately. Reserve 20 g yogurt per meal for topping; the remaining yogurt belongs in the batter (80 g Lean or 100 g Bulk).','Cook blueberries to a thick compote, record yield, and cool. Mix cream cheese, powdered sugar, and the reserved topping yogurt.','Keep batter yogurt with the chilled wet batter kit; keep dry ingredients separate until griddling. Fill one combined compote-cheesecake cup per order.']),
    card10('sauce','Pancake syrup cups',['maple_syrup'],['Fill and seal one measured syrup cup per order; refrigerate.']),
  ], ['Combine the wet and dry batter only until uniform.','Use the measured griddle oil and cook 3 Lean or 4 Bulk pancakes, turning when bubbles form; centers must be fully set.','Record pancake yield and pack both chilled topping cups separately.'],
  ['Lean: 3 pancakes, one blueberry-cheesecake cup, and one syrup cup.','Bulk: 4 pancakes, one blueberry-cheesecake cup, and one syrup cup.'],
  {phase:4,order:10,lane:'griddle',sequence:60,sideCups:2,temperature:'Cook pancake centers fully; keep topping cups cold.',validation:'Yogurt split preserves the historical measured method: 80 g Lean / 100 g Bulk batter plus 20 g topping. Record pancake and topping yields and day-three reheat quality.'});

  define10('French Toast', [
    card10('mix','French Toast custard',['egg','egg_white','cottage','fairlife_milk','whey_vanilla','brown_sugar','vanilla','cinnamon','sunflower_oil','bread_slice'],['Blend the measured cottage cheese, eggs, whites, milk, protein powder, sugar, vanilla, and cinnamon smooth.','Keep custard cold, bread dry, and the measured griddle oil separate; do not soak bread overnight.']),
    card10('cold-kit','French Toast fruit and cream',['strawberry','banana','whipped_cream'],['Wash and dry strawberries; keep banana whole until assembly.','Keep whipped cream refrigerated and separate from warm toast.']),
    card10('sauce','French Toast syrup cups',['maple_syrup'],['Fill and seal one 30 g syrup cup per order.']),
  ], ['Briefly coat each slice in its tier-controlled custard; use the complete measured custard allocation.','Griddle in measured oil until both faces are golden and the egg custard is fully set.','Slice the banana, add the measured fruit and cold whipped cream, and pack the sealed syrup cup.'],
  ['Lean: 3 French Toast slices, measured fruit and whipped cream, one 30 g syrup cup.','Bulk: 4 French Toast slices, measured fruit and whipped cream, one 30 g syrup cup.'],
  {phase:4,order:20,lane:'griddle',sequence:60,sideCups:1,temperature:'Cook egg custard fully; keep fruit and cream chilled.'});

  define10('Grilled Cheese Breakfast Burrito', [
    raw10('Breakfast Burrito beef pull',['beef_90_raw','salt'],['Weigh the raw ground beef and its exact salt; keep it ground.']),
    card10('mise-en-place','Breakfast Burrito prep kit',['onion','tomato_paste','egg','egg_white','mozzarella','small_tortilla','large_tortilla','cilantro'],['Dice the onion and measure the tomato paste, mozzarella, and cilantro into labeled containers.','Count the eggs and measure the egg-white requirement, but keep both uncracked and refrigerated. Cook the eggs fresh on Cook Day for better texture.','Count the correct Lean or Bulk tortillas and keep them sealed.'],{stage:'ahead'}),
  ], ['Brown beef and onion to 160 F, drain the rendered fat, and cook in tomato paste until the filling is dry enough to wrap.','Cook the measured egg mixture until fully set. Split beef, eggs, cheese, and cilantro across the two correct-tier tortillas.','Roll tightly and dry-pan grill seam-side down, then turn until crisp and the cheese melts. No broth.'],
  ['Lean: pack both small-tortilla burritos with the Lean beef and cheese allocation.','Bulk: pack both large-tortilla burritos with the Bulk beef and cheese allocation.'],
  {phase:4,order:30,proteinKey:'beef_90_raw',proteinGroup:'beef',endpoint:'160 F',lane:'stovetop',sequence:20,temperature:'Cook beef to 160 F and eggs fully.'});

  define10('Chicken Shakshuka', [
    raw10('Shakshuka chicken',['chicken_thigh_raw','garlic_powder','onion_powder','paprika','black_pepper','salt'],['Use the shared seasoned pull. Keep the tomato-base spices separate.'],{excludeComponentRefs:['shakshuka-base']}),
    card10('cook-ahead','Shakshuka tomato-pepper base',['crushed_tomatoes','red_onion','green_bell_pepper','garlic','paprika','cumin','sunflower_oil'],['Soften the diced onion and green pepper in the measured oil. Add garlic, paprika, and cumin; cook briefly until fragrant.','Add the crushed tomatoes and simmer until the base is thick, not watery. Record finished weight, rapid-cool in a shallow pan, cover, label, date, and refrigerate.'],{stage:'ahead',prepWave:'sauce-bases',prepWaveName:'Cooked tomato sauce bases',excludeComponentRefs:['shared-chicken-base']}),
    card10('cold-kit','Shakshuka eggs, cheese, bread and garnish',['egg','mozzarella','bread_slice','cilantro'],['Count eggs, weigh cheese and cilantro tomorrow before cooking.','Keep bread dry and separate: 1 Lean or 2 Bulk slices.']),
  ], ['Reheat the prepared tomato-pepper base to a simmer. Add the seasoned raw chicken pieces and cook until the chicken reaches 165 F.','Make wells, add the measured eggs, cover, and cook the eggs fully to 165 F; melt mozzarella over the top.','Record the finished pan yield, divide by tier, finish with cilantro, and pack bread separately.'],
  ['Lean: measured Shakshuka with 2 fully cooked eggs and 1 separate bread slice.','Bulk: measured Shakshuka with 2 fully cooked eggs and 2 separate bread slices.'],
  {order:40,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:30,sideBags:1,temperature:'Chicken and eggs must reach 165 F.'});

  define10('Peri Peri Chicken', [
    raw10('Peri Peri leg-quarter marinade',['leg_quarter_raw','jalapeno','garlic','lemon','paprika','chili_powder','cumin','sunflower_oil','salt'],['Keep the bone-in leg quarters intact; score the thick meat without cutting through the bone.','Blend the displayed jalapeno, garlic, lemon, paprika, chili powder, cumin, oil, and salt. Coat the exact leg-quarter pull, including inside the scores.']),
    grain10('Peri Peri rice',['rice_dry'],'common',{cookAhead:true,steps:['Cook the complete displayed dry-rice allocation today.','Record dry and cooked weights, spread in a shallow pan, rapid-cool, cover, label, date, and refrigerate at 41 F or below.']}),
    card10('cold-kit','Peri Peri garnish',['cilantro'],['Wash, dry, and reserve the measured cilantro.']),
  ], ['Roast the marinated leg quarters skin-side up on racks at 400 F while the plain rice cooks.','Probe the thickest meat away from bone to at least 165 F; rest briefly and record edible cooked yield separately from bones. Never brush cooked chicken with uncooked marinade.','Weigh the edible meat allocation for each tier, plate with measured rice, and finish with cilantro.'],
  ['Lean: 215 g edible cooked leg-quarter meat, measured rice, and cilantro; bone weight does not count as meat.','Bulk: 286 g edible cooked leg-quarter meat, measured rice, and cilantro; bone weight does not count as meat.'],
  {order:50,proteinKey:'leg_quarter_raw',lane:'oven',ovenTemperatureF:400,minutes:50,sequence:10,validation:'Leg quarters are bone-in, not boneless thighs. Raw-to-edible yield and 50% marinade retention are working assumptions; record actual marinade input, loss, bone weight, and edible yield.'});

  define10('Halal Cart Chicken + Yellow Rice', [
    raw10('Halal Cart thigh seasoning',['chicken_thigh_raw','oregano','garlic_powder','cumin','paprika','lemon','salt'],['Reserve 0.3 g cumin and 0.3 g paprika per meal for yellow rice. The displayed lemon is for chicken only; sauce lemon is already separated.','Coat chicken with the remaining spices, lemon and salt.'],{excludeComponentRefs:['white-garlic']}),
    grain10('Separate Halal Cart yellow rice',['rice_dry','turmeric'],'halal-yellow-rice',{cookAhead:true,steps:['Cook this rice today with the displayed turmeric and the cumin and paprika explicitly reserved on the Halal chicken card. Keep it separate from plain rice.','Record dry and cooked weights, spread in a shallow pan, rapid-cool, cover, label, date, and refrigerate at 41 F or below.']}),
    garlicSauceCard(false,'Pack one sealed 30 g cup per meal'),
    card10('cold-kit','Halal Cart salad and garnish',['lettuce','tomato','cilantro'],['Wash, dry, and chop lettuce and tomato; reserve cilantro.','Keep this cold salad separate from raw chicken and hot rice.']),
  ], ['Start the separate rice with its measured turmeric and reserved cumin and paprika; do not combine it with plain rice.','Heat a wide pan, then cook the seasoned thighs in uncrowded batches to 165 F, turning for deep browning. Rest briefly, chop, and record cooked yield. Do not add unmeasured oil.','Plate the exact chicken and yellow rice with cold lettuce, tomato, cilantro, and the measured white sauce cup.'],
  ['Lean: exact Lean chicken, yellow rice, cold salad, and one 30 g white sauce cup.','Bulk: exact Bulk chicken, yellow rice, cold salad, and one 30 g white sauce cup.'],
  {order:60,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:25,sideCups:1,riceBatchGroup:'halal-yellow-rice',validation:'Chicken spices follow the historical source conversion. Yellow-rice spice gram weights are working conversions, not a historical tested formula; verify seasoning and cooked yield.'});

  define10('Chicken Biryani', [
    raw10('Shan Biryani marinade',['chicken_thigh_raw','fage','lemon','garlic','ginger','shan_biryani'],['Cut thighs into bite-size pieces. Mix the weighed Shan Biryani powder, yogurt, lemon, garlic and ginger; coat chicken. These quantities exclude the cold green serving sauce.','Use 50 g standard powder per 1 kg raw thighs. Weigh partial packets; refrigerate overnight. No extra salt.','Cook all this marinade with the chicken; do not scrape it off.'],{proteinForm:'Bite-size thigh pieces; separate Shan Biryani marinade',excludeComponentRefs:['green-garlic']}),
    garlicSauceCard(true,'Pack one sealed 30 g cup per meal; add cold after reheating'),
    card10('mise-en-place','Biryani onion-tomato masala',['onion','tomato','sunflower_oil'],['Slice onions, chop tomatoes, and measure the oil into the Biryani kit.']),
    grain10('Biryani rice',['rice_dry'],'biryani',{stage:'ahead',deferred:true,steps:['Weigh and label the complete dry Biryani rice allocation today. Keep it dry; do not cook it with today’s rice batches.','Cook this rice tomorrow to three-quarters done, drain, then steam it over the chicken masala as directed in Cook & finish.']}),
    card10('cold-kit','Biryani garnish',['cilantro'],['Wash, dry, and reserve cilantro.']),
  ], ['Soften sliced onions in the measured oil. Add the chicken with ALL its Shan-yogurt marinade, then the tomatoes. Cover and simmer until chicken reaches 165 F. Add a measured splash of water only if the pot starts drying.','Boil the separate Biryani rice until about three-quarters cooked, drain, and layer over the cooked chicken masala. Cover tightly and steam on low until tender, about 5-10 minutes; check the rice rather than relying only on time.','Gently combine, record finished yield, divide into the exact tier portions, and finish with cilantro. No extra masala, salt or cucumber salad.'],
  ['Lean: measured chicken, masala, rice, cilantro and one 30 g green garlic sauce cup.','Bulk: measured chicken, masala, rice, cilantro and one 30 g green garlic sauce cup.'],
  {order:70,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:20,riceBatchGroup:'biryani',sideCups:1,sideCup:{name:'Green jalapeno garlic sauce',gramsPerMeal:30},source:'https://www.shanfoods.com/product/recipe-mixes/rice/biryani/ | PRPD adaptation with a separate green garlic mayonnaise sauce.',validation:'Standard Shan Biryani 50 g packet per kg raw meat. Confirm purchased variant; no extra salt. Cold sauce is included in nutrition, never in the marinade.'});

  // A reusable named method, not an extra dish silently added to this menu.
  define10('Butter Chicken', [
    raw10('Shan Butter Chicken marinade',['chicken_thigh_raw','shan_butter_chicken','lemon','garlic','ginger','fage'],['From the total yogurt, use exactly 15 g per meal in the marinade. Reserve the remaining 30 g Lean / 45 g Bulk per meal for the sauce in a clean container before handling raw chicken.','Cut boneless skinless thighs into bite-size cubes. Coat with Shan Butter Chicken mix, lemon, garlic, ginger and the marinade yogurt.','Use 50 g powder per 1 kg raw thighs (one 50 g packet). Marinate refrigerated for 1-3 hours, or overnight for the next-day prep schedule. No extra salt; keep separate from Biryani.','Use all marinade in the cooked sauce; do not scrape or discard it.'],{proteinForm:'Bite-size thigh cubes; separate Shan Butter Chicken marinade'}),
    card10('sauce','Butter Chicken sauce',['onion','tomato_paste','water','butter'],['Soften the chopped onion in the measured butter. Stir in tomato paste, then measured water and simmer until smooth.','Cool the sauce for tomorrow; keep the reserved finishing yogurt cold and separate. Do not use broth.']),
    grain10('Butter Chicken rice'),
  ], ['Warm the prepared tomato sauce. Add chicken and ALL its Shan-yogurt marinade; cover and simmer gently until chicken reaches 165 F. Do not add a second dose of masala or salt.','Take off high heat and stir in the reserved sauce yogurt until smooth. Reheat the prepared Butter Chicken share of the shared rice to 165 F; do not cook another rice batch.','Record chicken-sauce and rice yields separately, divide by tier, then finish with the measured garnish when included.'],
  ['Lean: measured Lean chicken and sauce with the Lean rice portion.','Bulk: measured Bulk chicken and sauce with the Bulk rice portion.'],
  {order:70,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:20,source:'https://www.shanfoods.com/product/recipe-mixes/stir-fried/butter-chicken/ | PRPD lighter yogurt/tomato-paste adaptation, without broth or the packet recipe full cream/butter amounts.',validation:'Weigh the 50 g packet proportionally to raw meat. Actual package allergen panel and cooked yields govern production.'});

  define10('Chicken Enchilada Bake', [
    raw10('Enchilada chicken cook-ahead',['chicken_thigh_raw','garlic_powder','onion_powder','paprika','black_pepper','salt','sunflower_oil'],['Use the shared seasoned pull.','Cook to 165 F in the prep protein wave, record yield, shred, and rapid-cool completely.']),
    card10('mise-en-place','Enchilada pan assembly',['small_tortilla','large_tortilla','corn','enchilada_sauce','mozzarella','red_onion'],['Drain the corn and use the diced onion from Produce. Check actual fill depth and leave at least 1.5 cm rim headspace; use another pan if needed.','Keep Lean and Bulk ingredient allocations in physically separated, labeled sections or pans. Their tortilla, chicken, sauce, and cheese ratios differ; a different slice weight alone cannot reproduce both recipes.','Within each tier, mix chilled shredded chicken, corn, onion, and sauce. Build two even tortilla layers, distribute the tier cheese, cover and refrigerate.'],{stage:'ahead'}),
  ], ['Bake each assembled pan at 375 F until its center reaches 165 F.','Rest until the layers hold, then weigh each labeled tier section without its container.','Divide each tier section by its ordered container count. Do not mix tier sections.'],
  ['Lean: divide the complete Lean section equally among Lean containers.','Bulk: divide the complete Bulk section equally among Bulk containers.'],
  {order:80,proteinKey:'chicken_thigh_raw',prepDayComplete:true,lane:'oven',ovenTemperatureF:375,sequence:10,minutes:35,temperature:'Bake the assembled pan to 165 F; chicken is already cooked and chilled.',panBatch:{name:'Deep casserole pan; verify fit',portionBasis:{lean:448,bulk:646},separateTiers:true}});

  define10('Beef Seekh Kabab Shawarma', [
    raw10('Shan Seekh beef mixture',['beef_90_raw','shan_seekh'],['Mix beef with all the measured Shan Seekh Kabab powder, 50 g per kg raw beef. No extra salt, homemade spices, oil, suet or butter.','Form short kebabs. Cover and refrigerate 2-3 hours or overnight for the prep schedule. Keep separate from any different beef specification.']),
    garlicSauceCard(false,'Spread 30 g inside the bread for each meal; no extra cup'),
    card10('cold-kit','Seekh bread, salad and garnish',['shawarma_bread','lettuce','onion','pickles','cilantro'],['Wash and dry lettuce, slice the salad onion, and drain pickles.','Count the exact flatbread allocation and keep it dry.']),
  ], ['Bake the formed kebabs at 400 F to 160 F, drain fat, and record cooked yield.','Warm the exact tier flatbread and spread its measured white garlic sauce.','Add the measured beef, lettuce, salad onion, pickles, and cilantro; roll or fold securely.'],
  ['Lean: all Lean beef in 1 flatbread with its measured sauce and salad.','Bulk: all Bulk beef across 1.5 flatbreads with its measured sauce and salad.'],
  {order:90,proteinKey:'beef_90_raw',proteinGroup:'beef',endpoint:'160 F',lane:'oven',ovenTemperatureF:400,sequence:20,temperature:'Cook ground-beef kebabs to 160 F.'});

  define10('Creamy Cajun Chicken Pasta', [
    raw10('Cajun chicken finish',['chicken_thigh_raw','garlic_powder','onion_powder','paprika','black_pepper','salt','smoked_paprika','oregano','thyme','cayenne'],['Use the shared seasoned pull. Cut this allocation into 1.5-2 cm cubes.','Add only the displayed smoked paprika, oregano, thyme, and cayenne finish.']),
    card10('cook-ahead','Cajun tomato-onion sauce base',['crushed_tomatoes','onion','olive_oil','butter'],['Soften the diced onion in the measured olive oil and butter. Add the crushed tomatoes and simmer until the raw tomato taste is gone and the sauce lightly thickens.','Record finished weight, rapid-cool in a shallow pan, cover, label, date, and refrigerate. Do not add cream cheese yet.'],{stage:'ahead',prepWave:'sauce-bases',prepWaveName:'Cooked tomato sauce bases'}),
    card10('mise-en-place','Creamy Cajun pasta setup',['protein_pasta','water','regular_cream_cheese','green_onion'],['Weigh the dry protein spaghetti and measured water; keep them separate. Keep cream cheese and sliced green onion cold.','Do not cook the spaghetti today. It cooks once in the sauce tomorrow so it does not soften twice or break during reheating.'],{stage:'ahead'}),
  ], ['Sear the seasoned thigh cubes in a wide nonstick pan in uncrowded batches; no unrecorded oil. Cook chicken to 165 F.','Add the prepared tomato-onion sauce base, measured water, and dry protein spaghetti. As strands soften, submerge and separate them; cover and simmer, stirring often.','Cook until spaghetti is tender. Add water only in measured increments if needed; do not use broth or assume a penne cook time.','Stir in the measured regular cream cheese until smooth, finish with green onion, and record the complete pan yield before portioning.'],
  ['Lean: divide the measured Lean chicken, protein spaghetti, and creamy tomato sauce by the actual finished yield.','Bulk: divide the measured Bulk chicken, protein spaghetti, and creamy tomato sauce by the actual finished yield.'],
  {order:100,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:40,source:'Budget Bytes One Pot Creamy Cajun Chicken Pasta, explicitly adapted to PRPD cubed thighs, protein spaghetti, and water instead of broth.',validation:'Read all quantities from the current controlled recipe. Record added water and actual final pan weight; cooking water is not a guaranteed net weight.'});

  define10('Sweet Chili Chicken with Vegetable Rice', [
    raw10('Sweet Chili chicken',['chicken_thigh_raw','garlic_powder','onion_powder','paprika','black_pepper','salt','sunflower_oil'],['Use the shared seasoned pull. Keep the sweet-chili glaze separate until chicken is cooked.']),
    grain10('Sweet Chili vegetable rice',['rice_dry','mixed_vegetables'],'vegetable-rice'),
    card10('sauce','Sweet Chili finishing glaze',['sweet_chili','soy_sauce','garlic'],['Mince garlic and whisk it with sweet-chili sauce and soy sauce. Cover and refrigerate without raw chicken contact.']),
    card10('cold-kit','Sweet Chili garnish',['cilantro'],['Wash, dry, and reserve cilantro.']),
  ], ['Cook the measured rice with peas and carrots in the vegetable-rice wave; record finished yield.','Roast thighs at 400 F to 165 F and record cooked yield. Heat the measured garlic-sweet-chili glaze and coat the cooked chicken.','Plate the exact tier chicken and vegetable rice, then finish with cilantro.'],
  ['Lean: measured Lean thigh chicken, sweet-chili glaze, and vegetable rice.','Bulk: measured Bulk thigh chicken, sweet-chili glaze, and vegetable rice.'],
  {order:110,proteinKey:'chicken_thigh_raw',lane:'oven',ovenTemperatureF:400,sequence:30,riceBatchGroup:'vegetable-rice'});

  define10('Garlic Butter Shrimp + Rice', [
    card10('protein-portion','Shrimp thaw and portion',['shrimp_raw'],['Thaw shrimp under refrigeration; peel, devein, drain, and weigh the exact raw allocation.','Keep shrimp cold and separate; do not cook until the final seafood wave.']),
    grain10('Shrimp vegetable rice',['rice_dry','canned_peas_carrots'],'vegetable-rice',{cookAhead:true,steps:['Drain the peas and carrots. Cook them with the complete displayed dry-rice allocation today.','Record dry and cooked weights, spread in a shallow pan, rapid-cool, cover, label, date, and refrigerate at 41 F or below.']}),
    card10('vegetable-ahead','Shrimp zucchini',['zucchini'],['Cut zucchini into even bite-size pieces. Roast on a lined pan without unrecorded oil until just tender; do not overcook.','Record finished weight, rapid-cool separately from the rice, cover, label, date, and refrigerate.'],{stage:'ahead',prepWave:'vegetables',prepWaveName:'Cook-ahead vegetables'}),
    card10('sauce','Garlic-butter shrimp sauce setup',['butter','garlic','lemon','cornstarch','salt'],['Mince the garlic. Measure butter, lemon, cornstarch, and salt separately.','Keep the cornstarch dry and lemon separate until tomorrow; cover and refrigerate the measured sauce ingredients.']),
    card10('cold-kit','Shrimp cilantro garnish',['cilantro'],['Use the chopped cilantro from Produce tomorrow for the final garnish.']),
  ], ['Reheat the prepared vegetable rice and zucchini gently; do not recook them.','Melt butter, soften garlic briefly, add shrimp and salt, and cook to 145 F; shrimp should be opaque.','Mix cornstarch with a small recorded amount of cold cooking water, stir into the pan with lemon, and heat until the sauce thickens.','Record shrimp yield; plate with the prepared rice and zucchini, finish with cilantro, then rapid-cool.'],
  ['Lean: measured Lean shrimp, garlic-butter sauce, vegetable rice, zucchini, and cilantro.','Bulk: measured Bulk shrimp, garlic-butter sauce, vegetable rice, zucchini, and cilantro.'],
  {order:120,proteinKey:'shrimp_raw',proteinGroup:'seafood',endpoint:'145 F',lane:'stovetop',sequence:90,riceBatchGroup:'vegetable-rice',temperature:'Cook shrimp to 145 F; run seafood last.'});

  // These true returns reuse named, frozen history and then receive current
  // handoff corrections. They are never inherited from d1/a1/a2 slot identity.
  const cheesecake10 = JSON.parse(JSON.stringify(methodHistoryByName['Baked Strawberry-Lemon Protein Cheesecake'].find(item => item.batch === 9).method));
  cheesecake10.recipeName = 'Baked Strawberry-Lemon Protein Cheesecake';
  cheesecake10.cookDayEquipment = {lane:'cold-release',estimatedMinutes:10,sequence:80};
  batch10MethodsByName[cheesecake10.recipeName] = cheesecake10;

  define10('High Protein Tiramisu', [
    card10('dessert','Tiramisu cream, coffee and layers',['mascarpone','fage','cottage','whey','powdered_sugar','vanilla','ladyfingers','granulated_sugar','cocoa','instant_coffee','water','salt'],['Blend cottage cheese smooth. Mix with mascarpone, yogurt, whey, vanilla, salt, and the measured cream sugar. Reserve 2 g powdered sugar per cup for the cocoa topping.','Dissolve the displayed instant coffee in the measured water and cool. Divide the coffee solution in a 5:50 cream-to-dip ratio; fold the smaller portion into the cream and dissolve the granulated sugar in the dipping portion.','Briefly dip ladyfingers, layer with cream, and finish with cocoa and reserved powdered sugar. Record unused dipping coffee, filled cup weights, and count; seal and chill overnight.']),
  ], coldRelease10, ['Pack one measured chilled Tiramisu cup.'],
  {single:true,phase:3,order:140,lane:'cold-release',sequence:80,temperature:'No final cook; keep cups at 41 F or below.',source:'Current PRPD TIRAMISU_TEST_PLAN.md three-cup formula, scaled to active portions.',validation:'The three-cup formula is a recipe ratio, not a required customer count. Coffee uptake and final cup weight must be measured.'});

  define10('Oreo Protein Cheesecake Cup', [
    card10('dessert','Original Oreo cheesecake cups',['cottage','whey','oreo_pudding_mix','honey','cocoa','maple_syrup','oreo_thin'],['Blend cottage cheese completely smooth. Whisk in the measured whey and dry Oreo pudding mix, then stir in honey.','Divide the complete mixture by the active cup count. Mix cocoa and maple syrup, drizzle evenly, and add the measured Oreo Thin garnish.','The source formula makes two cups: split one physical whey scoop, one quarter pudding packet, and half an Oreo Thin across both cups. Seal and chill at least two hours; record finished weights.']),
  ], coldRelease10, ['Pack one measured Oreo Protein Cheesecake Cup with cocoa-maple drizzle and its quarter-cookie garnish.'],
  {single:true,phase:3,order:150,lane:'cold-release',sequence:80,temperature:'No cook; chill at least two hours and hold at 41 F or below.',source:'PRPD_RECIPES_SOURCE_2026-07-13.pdf page 19, original two-cup formula.',validation:'Scale from the controlled per-cup ingredients. Two cups is the source ratio, not an automatic extra production requirement. Confirm the 4.2 oz Oreo pudding package.'});

  define10('Buffalo Chicken Pinwheels', [
    raw10('Pinwheel chicken',['chicken_thigh_raw','garlic_powder','onion_powder','paprika','black_pepper','salt','sunflower_oil'],['Use the shared seasoned pull. Keep whole, covered, and refrigerated for Cook Day.']),
    card10('sauce','Buffalo filling base',['regular_cream_cheese','mozzarella','buffalo_sauce','red_onion'],['Mix the regular cream cheese, mozzarella, Buffalo sauce, and minced onion without the chicken.','Cover and refrigerate at 41 F or below. Add only the freshly cooked, rapidly chilled chicken on Cook Day.']),
    card10('cold-kit','Pinwheel tortillas and lettuce',['small_tortilla','lettuce'],['Keep tortillas sealed and lettuce dry for tomorrow’s assembly.']),
  ], ['Pan-cook the seasoned thighs in uncrowded batches to 165 F, turning for deep browning. Record yield, shred, then rapid-cool in a shallow pan to 41 F or below. Do not mix warm chicken into the filling.','Mix the chilled chicken into the prepared Buffalo filling base. Spread across two tortillas and add the dry lettuce.','Roll tightly, place seam-side down, and chill until firm. Cut each roll in half to make exactly 4 pinwheels total, then pack all 4 pieces in one chilled container.'],
  ['Pack exactly 4 pinwheels made from the complete two-tortilla allocation.'],
  {single:true,phase:4,order:160,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:35,temperature:'Pan-cook chicken to 165 F today; rapid-cool to 41 F or below before cold assembly.'});

  define10('Mediterranean Chicken Hummus Box', [
    raw10('Hummus Box lemon chicken',['chicken_thigh_raw','garlic_powder','onion_powder','paprika','black_pepper','salt','lemon','sunflower_oil'],['Use the shared seasoned pull. Add the measured lemon, then keep whole, covered, and refrigerated for Cook Day.']),
    card10('cold-kit','Hummus Box components',['hummus','shawarma_bread','cucumber','tomato','feta','olives','red_onion'],['Wash and dry produce, dice cucumber and tomato, slice onion, and drain olives tomorrow.','Keep hummus, feta, and produce chilled in separate sections; keep the half-flatbread allocation dry.']),
  ], ['Pan-cook the seasoned lemon chicken in uncrowded batches to 165 F, turning for deep browning. Record yield, dice, then rapid-cool in a shallow pan to 41 F or below.','Pack the chilled measured chicken, hummus, cucumber, tomato, feta, olives, and onion in separate sections.','Add the half-flatbread in a dry area, close without crushing, and refrigerate.'],
  ['Pack one complete chilled box with the measured chicken, hummus, half flatbread, vegetables, feta, and olives.'],
  {single:true,phase:4,order:170,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:35,temperature:'Pan-cook chicken to 165 F today; rapid-cool to 41 F or below before packing the cold box.'});

  define10('Mini Chicken Snack Wrap', [
    raw10('Mini Wrap chicken',['chicken_thigh_raw','garlic_powder','onion_powder','paprika','black_pepper','salt','sunflower_oil'],['Use the shared seasoned pull. Keep whole, covered, and refrigerated for Cook Day.']),
    garlicSauceCard(true,'Split 25 g across both mini wraps per order; no extra cup'),
    card10('cold-kit','Mini Wrap fresh salad and tortillas',['small_tortilla','mozzarella','lettuce','onion','tomato','cucumber'],['Wash, dry, and finely chop the fresh salad tomorrow. Keep cheese cold and tortillas sealed.','Count two owner-standard 70-calorie Mission Carb Balance tortillas per order. No purchased pickled vegetable substitution.']),
  ], ['Pan-cook the seasoned thighs in uncrowded batches to 165 F, turning for deep browning. Record yield, dice, then rapid-cool in a shallow pan to 41 F or below.','Lay out two owner-standard 70-calorie tortillas per order. Split all chilled chicken, mozzarella, fresh salad, and house sauce evenly across both tortillas.','Roll tightly, pack both complete wraps together, and refrigerate immediately.'],
  ['Pack both complete mini chicken wraps, using exactly two owner-standard 70-calorie tortillas.'],
  {single:true,phase:4,order:180,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:35,temperature:'Pan-cook chicken to 165 F today; rapid-cool to 41 F or below before cold assembly.'});

  data.batch = 10;
  data.version = '2026-09-11.2';
  data.meals = {...Object.fromEntries(Object.entries(batch10DishNames).map(([id,name]) => {
    if (!batch10MethodsByName[name]) throw new Error(`Missing Batch 10 method: ${name}`);
    return [id, JSON.parse(JSON.stringify(batch10MethodsByName[name]))];
  })), ...batch10CustomMethods};
  // Preserve custom recipes but make their wording count-driven, not a stale
  // instruction to produce three paid orders regardless of the live import.
  for (const id of ['p1','p2','p3']) {
    data.meals[id] = JSON.parse(JSON.stringify(data.meals[id])
      .replace(/all three customer portions/g, 'the active customer portions')
      .replace(/among the three meals/g, 'among the active meals')
      .replace(/Nouman's three containers/g, "Nouman's active containers")
      .replace(/all three meals/g, 'the active meals'));
  }
  data.meals.p3.steps = data.meals.p3.steps.map(step=>step.replace('each of the three hot-meal containers','each active hot-meal container'));
  const koftaPrep = data.meals.p1.prepBatches.find(card=>card.type==='form-and-marinate');
  koftaPrep.ingredientKeys = ['beef_96_raw','shan_seekh'];
  koftaPrep.proteinForm = 'Five short logs per meal';
  koftaPrep.steps = ['Mix beef with all measured Shan Seekh Kabab powder, 50 g per kg raw beef. No extra salt, homemade spices, oil, suet or butter.', 'Weigh the complete seasoned mixture and divide into five equal logs per meal. Each contains 66 g beef plus 3.3 g Shan mix. Cover and refrigerate 2-3 hours or overnight.'];
  data.meals.p1.prepSteps = [...koftaPrep.steps,'Roast the measured zucchini, pepper and red onion separately.'];
  const koftaComponent=data.meals.p1.componentMap.find(c=>c.role==='protein');
  koftaComponent.ingredientKeys=['beef_96_raw','shan_seekh']; koftaComponent.handling=koftaPrep.steps[1];
  data.meals.p1.source='https://www.shanfoods.com/product/recipe-mixes/bbq/seekh-kabab/ | PRPD Shan-only seasoning adaptation; no added suet or butter.';
  data.meals.p1.proteinCook.lane = 'oven';
  data.meals.p1.proteinCook.ovenTemperatureF = 400;
  data.meals.p1.steps[0] = 'Bake the formed kofta at 400 F until their centers reach 160 F.';
  data.meals.p1.proteinCook.recipeSteps[0] = data.meals.p1.steps[0];
  data.meals.p1.proteinCook.instructions[0] = data.meals.p1.steps[0];
  // Current recipe forms are explicit operating data, not inferred from dish IDs
  // by the dashboard. Exceptional breast and bone-in cuts remain distinct.
  const forms10 = {
    'Chicken Shakshuka':'Bite-size thigh pieces',
    'Peri Peri Chicken':'Keep bone-in leg quarters whole',
    'Halal Cart Chicken + Yellow Rice':'Keep thighs whole; chop after pan-cooking',
    'Chicken Biryani':'Bite-size thigh pieces; separate marinade',
    'Beef Seekh Kabab Shawarma':'Ground beef; form short kebabs',
    'Creamy Cajun Chicken Pasta':'1.5–2 cm thigh cubes',
    'Sweet Chili Chicken with Vegetable Rice':'Bite-size thigh pieces',
  };
  for (const [name,form] of Object.entries(forms10)) {
    const id = Object.keys(data.meals).find(id=>data.meals[id].recipeName===name);
    for (const card of data.meals[id]?.prepBatches || []) if (card.type==='marinade') card.proteinForm=form;
  }
  // Compatible raw seasoning is one job even if a portion is cooked ahead.
  // Immediate splitting prevents Cajun finish or raw storage from leaking into
  // another dish. Meat specification and cut still govern compatibility.
  const sharedThighFinishes10 = {
    'Chicken Shakshuka': {form:'Bite-size thigh pieces', note:'Add the displayed tomato-base paprika and cumin after splitting.'},
    'Chicken Enchilada Bake': {form:'Whole thighs; shred after cooking', note:'Cook this allocation at the cook-ahead station, then shred.'},
    'Creamy Cajun Chicken Pasta': {form:'1.5-2 cm thigh cubes', note:'Cut into 1.5-2 cm cubes, then add the displayed Cajun finish.'},
    'Sweet Chili Chicken with Vegetable Rice': {form:'Whole thighs; cut after cooking', note:'Cook whole; add the sweet-chili glaze after cooking.'},
    'Buffalo Chicken Pinwheels': {form:'Whole thighs; shred after cooking', note:'Cook whole, shred, chill, then add the Buffalo filling.'},
    'Mediterranean Chicken Hummus Box': {form:'Whole thighs; dice after cooking', note:'Add lemon, cook whole, then dice and chill.'},
    'Mini Chicken Snack Wrap': {form:'Whole thighs; dice after cooking', note:'Cook whole, then dice and chill.'},
  };
  for (const [name, workflow] of Object.entries(sharedThighFinishes10)) {
    const method=Object.values(data.meals).find(m=>m.recipeName===name);
    const raw=method.prepBatches.find(c=>c.type==='marinade');
    Object.assign(raw,{seasoningFamily:'neutral-thigh-prep',seasoningFamilyName:'Shared savory thigh base',seasoningBaseForm:'Whole boneless skinless thighs',proteinForm:workflow.form,splitAfterSeasoning:true,poolStorage:false});
    raw.seasoningFinishNote=workflow.note;
    if(name==='Chicken Enchilada Bake') {
      raw.steps=['Keep thighs whole. Apply this allocation of the shared seasoning base.','Cook this split allocation at the cook-ahead station; keep other recipe pulls raw and refrigerated.'];
      raw.cookAhead.steps=['Cook the seasoned whole thighs in uncrowded batches to 165 F. Record cooked yield, rest, and shred.','Spread in a shallow pan and rapid-cool to 41 F or below before assembling the labeled Enchilada pans or separated tier sections.'];
    }
  }
  const stepMeasures10 = {
    'Creamy Cajun Chicken Pasta': [['chicken_thigh_raw'],['crushed_tomatoes','onion','olive_oil','butter','water','protein_pasta'],[],['regular_cream_cheese','green_onion']],
    'Chicken Shakshuka': [['crushed_tomatoes','red_onion','green_bell_pepper','garlic','paprika','cumin','sunflower_oil','chicken_thigh_raw'],['egg','mozzarella'],['cilantro','bread_slice']],
    'Grilled Cheese Breakfast Burrito': [['onion','tomato_paste'],['egg','egg_white','mozzarella','cilantro','small_tortilla','large_tortilla'],[]],
    'French Toast': [['bread_slice'],['sunflower_oil'],['banana','strawberry','whipped_cream','maple_syrup']],
    'Chicken Biryani': [['onion','sunflower_oil','tomato'],['rice_dry'],['cilantro']],
    'Garlic Butter Shrimp + Rice': [['rice_dry','canned_peas_carrots','zucchini'],['butter','garlic','shrimp_raw','salt'],['cornstarch','lemon'],['cilantro']],
    'Buffalo Chicken Pinwheels': [['small_tortilla','lettuce'],[],[]],
  };
  for (const method of Object.values(data.meals)) {
    if (stepMeasures10[method.recipeName]) method.stepIngredients = stepMeasures10[method.recipeName];
    method.produceCuts = {onion:'Dice',red_onion:'Dice',garlic:'Mince',ginger:'Grate or mince',green_bell_pepper:'Dice',jalapeno:'Finely mince',green_onion:'Thinly slice',zucchini:'Even bite-size pieces',lettuce:'Shred and dry',cucumber:'Dice',tomato:'Dice',parsley:'Finely chop',cilantro:'Chop for garnish',strawberry:'Wash; slice when used',banana:'Keep whole until serving',lemon:'Measure bottled lemon juice; do not cut or squeeze whole lemons unless a served wedge is explicitly listed',lime:'Juice; weigh the juice',black_beans:'Drain and rinse',cannellini_beans:'Drain and rinse',canned_peas_carrots:'Drain',corn:'Drain if canned; keep frozen if frozen',pickles:'Drain; slice for serving'};
    if (method.recipeName==='Chicken Biryani') method.produceCuts.onion='Thinly slice';
    if (method.recipeName==='Beef Seekh Kabab Shawarma') method.produceCuts.onion='Thinly slice for salad';
    if (method.recipeName==='Mediterranean Chicken Hummus Box') method.produceCuts.red_onion='Thinly slice';
    if (method.recipeName==='Peri Peri Chicken') method.produceCuts.jalapeno='Rough-chop for marinade blender';
  }
  const cheesecakePrep10 = data.meals.d1.prepBatches[0];
  cheesecakePrep10.steps = ['Simmer strawberries and honey until thick, then cool the reduction.', 'Blend cream cheese, cottage cheese, yogurt, egg, whey, cornstarch, vanilla, lemon and salt until smooth. Pour into the prepared pan and swirl the strawberry reduction through it.', 'Bake at 325 F until the edges set and the center reaches 160 F. Cool using shallow portions or an approved rapid-cooling method, then cover and refrigerate until fully chilled.'];
  cheesecakePrep10.stepIngredientKeys = [['strawberry','honey'],['reduced_cream_cheese','cottage','fage','egg','whey_vanilla','cornstarch','vanilla','lemon','salt'],[]];
  data.meals.d1.temperature = 'Release fully chilled cheesecake at 41 F or below; its egg-containing batter was baked to 160 F.';
  // Keep an independent named copy so editing a future menu slot cannot mutate
  // the retained recipe registry through a shared object reference.
  for (const [id,name] of Object.entries(batch10DishNames)) batch10MethodsByName[name] = JSON.parse(JSON.stringify(data.meals[id]));
  batch10MethodsByName['High-Protein Beef Kofta & Roasted Vegetables']=JSON.parse(JSON.stringify(data.meals.p1));
  data.servingSaucePolicy={version:'2026-09-08',active:['white-garlic','green-garlic'],sharedBase:{fage:100,light_mayo:15,garlic:6,lemon:15},greenAddition:{jalapeno:10},note:'Only these cold garlic serving sauces are active. Historical dips remain archived; intrinsic cooking sauces, glazes, dessert toppings and explicit custom dressings are not replaced.'};
  data.methodHistoryByName = methodHistoryByName;
  data.methodsByName = batch10MethodsByName;
  data.dishNames = batch10DishNames;
  data.sharedProteinSeasoning = [];
  data.familyAllocations = [];
  data.familyPlatingReservations = [];
  data.productionExtras = [];
  data.rawProteinReserveByDish = {};
  data.groceryAdjustments = [];
  data.weeklySauces = {enabled:false,policy:'Batch 10 sauces belong to their exact controlled recipes; no extra weekly sauce batch.',cupSizeOz:2,eligibleMealIds:[],customerCupsTotal:0,kitchenUseCupsPerSauce:0,qcCupsPerSauce:0,sauces:[]};
  data.phases = [
    {title:'1. Confirm live counts',detail:'Use only active Batch 10 orders and exact tiers. No automatic family meals, extras, or fixed custom counts.'},
    {title:'2. Raw protein and marinades',detail:'Apply the shared savory base to compatible whole thighs, split and label, then add each finish. Keep Halal Cart, Biryani, Peri Peri, breast and mince separate.'},
    {title:'3. Produce and measured prep',detail:'Sanitize after raw proteins. Chop shared produce once, divide by recipe, then make cold sauces, dessert batches, and assembly kits.'},
    {title:'4. Concurrent cooking',detail:'Start the long oven pans and bone-in chicken first. Run plain, yellow, Biryani, and vegetable rice as separate compatible groups while watched stovetop and griddle work proceeds. Cook shrimp last.'},
    {title:'5. Weigh and assemble',detail:'Record actual cooked yields, portion by tier, keep cold components cold, and verify piece and side-cup counts.'},
    {title:'6. Customer pack-out',detail:'Reconcile one complete customer bag at a time against the current order import and exact labels.'},
  ];

  // A display label such as "salt_beef" is a measured split of recipe salt,
  // not a second ingredient. Link historical allocations without changing
  // their measured quantities or silently adding new recipe ingredients.
  const formulaSourceKeys = {
    a2_chicken_salt:'salt', b4_side_oil:'sunflower_oil', b4_side_salt:'salt',
    fage_batter:'fage', fage_topping:'fage', garlic_breading:'garlic',
    garlic_potato:'garlic', garlic_sauce:'garlic', lemon_fish:'lemon',
    m2_marinade_yogurt:'fage', m2_sauce_yogurt:'fage',
    m4_glaze_oil:'sunflower_oil', m4_glaze_salt:'salt',
    m5_side_oil:'sunflower_oil', m5_side_salt:'salt',
    m6_chicken_pepper:'black_pepper', m6_sauce_pepper:'black_pepper', m6_sauce_salt:'salt',
    m7_beef_salt:'salt', m7_vegetable_salt:'salt',
    neutral_chicken_oil:'sunflower_oil', neutral_chicken_salt:'salt',
    p2_chicken_salt:'salt', p2_side_salt:'salt',
    salt_beef:'salt', salt_filling:'salt', salt_fish:'salt', salt_mash:'salt', salt_potato:'salt',
    sunflower_oil_fish:'sunflower_oil', sunflower_oil_potato:'sunflower_oil',
  };
  for(const prefix of ['m8_beans','m8_quinoa','m8_salmon','m8_garnish','p3_marinade','p3_dressing']) {
    for(const [suffix,key] of Object.entries({garlic:'garlic',lemon:'lemon',oil:'sunflower_oil',salt:'salt',cilantro:'cilantro',pepper:'black_pepper'})) formulaSourceKeys[`${prefix}_${suffix}`]=key;
  }
  const linkFormulaSources = method => {
    for(const card of method.prepBatches || []) for(const formula of card.formulaIngredients || []) {
      if(!formula.sourceKey && formulaSourceKeys[formula.key]) formula.sourceKey=formulaSourceKeys[formula.key];
    }
  };
  for(const method of [...Object.values(data.meals),...Object.values(batch10MethodsByName),
    ...Object.values(methodHistoryByName).flatMap(rows=>rows.map(row=>row.method))]) linkFormulaSources(method);

  // Retain the complete recipe registry before weekly slots are replaced.
  for (const [name,method] of Object.entries(batch10MethodsByName)) {
    (methodHistoryByName[name] ||= []).push({batch:10,method:JSON.parse(JSON.stringify(method))});
  }
  // Batch 11 approved rotation. Returning recipes are selected by their
  // recorded recipe identity, while the two new dishes receive complete
  // measured methods here. Bundle components are first-class planner meals.
  const clone11 = (name, replacement = name) => {
    const current = batch10MethodsByName[name];
    const history = methodHistoryByName[name] || [];
    const source = current || history[history.length - 1]?.method;
    if (!source) throw new Error(`Missing Batch 11 method: ${name}`);
    let text = JSON.stringify(source);
    if (replacement !== name) text = text.split(name).join(replacement);
    const method = JSON.parse(text);
    method.recipeName = replacement;
    return method;
  };

  define10('Breakfast Quesadilla', [
    raw10('Breakfast Quesadilla chicken',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper'],[
      'Season the compatible whole-thigh pull in the shared savory base, split this exact allocation into its labeled pan, and keep refrigerated for Cook Day.',
    ]),
    card10('measured-prep','Breakfast Quesadilla egg and wrap kit',['egg','egg_white','mozzarella','small_tortilla','large_tortilla'],[
      'Count one whole egg plus 25 g liquid egg white per meal. Keep uncracked and refrigerated for best Cook Day texture.',
      'Weigh cheese and count two correct-tier tortillas per meal. Keep tortillas sealed and dry.',
    ]),
  ], [
    'Pan-cook the seasoned thighs in uncrowded batches to 165 F. Rest, dice finely, and record the cooked yield.',
    'Cook the measured egg and egg-white allocation until fully set. Divide chicken, egg, and cheese across the two correct-tier tortillas.',
    'Fold and dry-pan toast both quesadillas until crisp and the cheese melts. Cool on a rack before sealing.',
  ], [
    'Lean: two small-tortilla quesadillas with the complete Lean chicken, egg, and cheese allocation.',
    'Bulk: two large-tortilla quesadillas with the complete Bulk chicken, egg, and cheese allocation.',
  ], {phase:4,order:30,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:20,temperature:'Cook chicken to 165 F and eggs fully.',source:'PRPD controlled Breakfast Quesadilla recipe. Chicken uses the owner-standard shared savory thigh base.'});

  define10('Chinese-Style Bok Choy Chicken', [
    raw10('Chinese-style chicken pull',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper'],[
      'Season the compatible whole-thigh pull in the shared savory base. Split this exact allocation, then cut it into even 2 cm pieces.',
    ]),
    grain10('Chinese-style rice',['rice_dry'],'plain-rice',{cookAhead:true,steps:[
      'Cook the complete displayed dry-rice allocation today.',
      'Record dry and cooked weights, spread in a shallow pan, rapid-cool, cover, label, date, and refrigerate at 41 F or below.',
    ]}),
    card10('sauce','Ginger-hoisin stir-fry sauce',['soy_sauce','hoisin','rice_vinegar','honey','garlic','ginger','sesame_oil','cornstarch','white_pepper'],[
      'Whisk the exact soy sauce, hoisin, unseasoned rice vinegar, honey, ginger, garlic, sesame oil, cornstarch, and white pepper until smooth.',
      'Cover, label, date, and refrigerate. This sauce contains no tamari, fish sauce, oyster sauce, or shellfish ingredient.',
    ]),
    card10('mise-en-place','Bok choy, pepper, and scallion kit',['bok_choy','red_bell_pepper','green_onion'],[
      'Separate bok choy stems from leaves. Slice stems across the grain; keep leaves in wide ribbons.',
      'Slice red pepper and scallions. Keep all vegetables dry, covered, labeled, and refrigerated.',
    ]),
  ], [
    'Pan-sear the seasoned chicken in uncrowded batches to 165 F and record cooked yield. Remove it from the pan.',
    'Stir-fry bok choy stems and red pepper first. Add leaves only when the stems are crisp-tender, then add the chicken back.',
    'Whisk the measured sauce again, pour it into the hot pan, and toss until glossy and fully thickened. Fold in scallions.',
    'Reheat the prepared rice, record vegetable and sauce yields, and plate the exact tier build.',
  ], [
    'Lean: exact Lean chicken, rice, bok choy, red pepper, scallions, and measured ginger-hoisin sauce.',
    'Bulk: exact Bulk chicken, rice, bok choy, red pepper, scallions, and measured ginger-hoisin sauce.',
  ], {order:45,proteinKey:'chicken_thigh_raw',lane:'stovetop',sequence:25,riceBatchGroup:'plain-rice',temperature:'Cook chicken to 165 F; keep bok choy crisp-tender.',source:'PRPD Chinese-style adaptation. No tamari, fish sauce, oyster sauce, or shellfish ingredient.',validation:'Confirm the purchased halal soy and hoisin panels. Record cooked chicken, rice, vegetable, sauce, and plated yields plus day-three reheat texture.'});

  define10('Caprese Protein Pasta Box', [
    card10('starch-ahead','Caprese Protein+ rotini',['protein_pasta'],[
      'Cook the complete displayed dry-pasta allocation just to al dente.',
      'Drain thoroughly, rinse briefly with cold water, spread in a shallow pan, and cool to 41 F or below. Record dry and cooked weights.',
    ],{prepWave:'pasta',prepWaveName:'Protein pasta cook'}),
    card10('sauce','Caprese balsamic-yogurt cups',['fage','balsamic_vinegar','olive_oil','garlic_powder','salt','black_pepper','water'],[
      'Whisk the exact 20 g dressing formula until smooth.',
      'Tare, fill one 20 g net cup per active box, seal, count, label, date, and refrigerate.',
    ]),
    card10('cold-kit','Caprese beans, cheese, tomato, and basil',['cannellini_beans','mozzarella','tomato','basil'],[
      'Drain and rinse the cannellini beans, then drain them completely. Weigh the fat-free mozzarella.',
      'Wash and dry tomatoes and basil thoroughly. Keep basil whole until final assembly.',
    ]),
  ], [
    'Verify the pasta and every component are at 41 F or below before cold assembly.',
    'Combine the exact chilled pasta, beans, mozzarella, dry tomatoes, and torn basil without dressing.',
    'Pack one complete box with one sealed 20 g balsamic-yogurt cup. Record the finished box weight and refrigerate immediately.',
  ], [
    'Pack one chilled Caprese Protein Pasta Box plus one sealed 20 g balsamic-yogurt dressing cup.',
  ], {single:true,phase:4,order:170,lane:'cold-assembly',sequence:70,sideCups:1,temperature:'No final cook after assembly; keep every component and finished box at 41 F or below.',source:'PRPD adaptation of Caprese pasta salad using Protein+ rotini and cannellini beans.',validation:'Confirm the pasta, mozzarella, and balsamic package panels. Record cooked pasta yield, 12 oz box fit, finished weight, and 72-hour texture.'});

  define10('Mango Habanero Chicken Wings', [
    raw10('Family wing dry marinade',['chicken_wings_raw','sunflower_oil','salt','paprika','garlic_powder','onion_powder'],[
      'Count about six split flats/drumettes and weigh 400 g raw bone-in wings per meal. The piece count is a provisional target; record the actual count and weight.',
      'Coat with the measured oil, salt, paprika, garlic powder, and onion powder. Cover and marinate under refrigeration; keep this bone-in pull separate from boneless thighs.',
    ],{proteinForm:'Split bone-in flats and drumettes; about six pieces per meal'}),
    card10('sauce','Mango habanero finishing sauce',['mango_habanero_sauce'],[
      'Measure 45 g purchased mango habanero sauce per meal in a clean covered container. Verify the purchased bottle and allergen panel.',
      'Keep the finishing sauce away from raw wings. Do not use a contaminated marinade as a finishing sauce.',
    ]),
  ], [
    'Air-fry the wings in uncrowded batches until crisp and the thickest part of each batch reaches 165 F, probing away from bone. Record the finished count and weight.',
    'Toss the cooked wings with the measured clean mango habanero sauce. No separate sauce cup or unmeasured second coating.',
    'Pack six split pieces per meal when the purchased wing size allows, verify each portion against the 400 g raw bone-in planning pull, and chill promptly for delivery.',
  ], [
    'One family wing meal: about six split pieces, fully cooked and coated with 45 g mango habanero sauce. Bones are included; no rice or side.',
  ], {single:true,phase:5,order:105,proteinKey:'chicken_wings_raw',lane:'air-fryer',sequence:20,temperature:'Air-fry to 165 F in the thickest meat, away from bone; hold cold at 41 F or below.',source:'Owner-directed Batch 11 family-only wing pilot; portion weights and purchased sauce are provisional. No nutrition claim.',validation:'Confirm actual split-piece count, raw bone-in weight, sauce product/allergens, cooked yield, and container fit. Do not publish macros or produce customer nutrition labels.'});

  const batch11DishNames = {
    b1:'Strawberry Cheesecake Protein Pancakes', b2:'PRPD Beef Bacon Breakfast Sandwich', b3:'Breakfast Quesadilla', b4:'High Protein Omelette',
    m1:'Chinese-Style Bok Choy Chicken', m2:'Hot Honey Chicken Sliders', m3:'Butter Chicken', m4:'Meatball Arrabbiata Pasta',
    m5:'Loaded Beef Cottage Pie', m6:'High-Protein Beef Lasagna', m7:'Cajun Garlic Salmon',
    d1:'Baked Strawberry-Lemon Protein Cheesecake', d2:'Chocolate Oreo Mousse', d3:'Chocolate Peanut Butter Protein Brownie',
    a1:'Buffalo Chicken Pinwheels', a2:'BBQ Chicken Lavash Flatbread', a3:'Caprese Protein Pasta Box',
    x1:'Mediterranean Chicken Bowl', x2:'Mexican Streetcorn Chicken Bowl',
    w1:'Mango Habanero Chicken Wings',
    h1:'Mediterranean Chicken Hummus Box',
  };
  const batch11MethodsByName = {
    'Strawberry Cheesecake Protein Pancakes': clone11('Strawberry Cheesecake Protein Pancakes'),
    'PRPD Beef Bacon Breakfast Sandwich': clone11('PRPD Beef Bacon Breakfast Sandwich'),
    'Breakfast Quesadilla': clone11('Breakfast Quesadilla'),
    'High Protein Omelette': clone11('High Protein Omelette'),
    'Chinese-Style Bok Choy Chicken': clone11('Chinese-Style Bok Choy Chicken'),
    'Hot Honey Chicken Sliders': clone11('Hot Honey Chicken Sliders'),
    'Butter Chicken': clone11('Butter Chicken'),
    'Chicken Enchilada Bake': clone11('Chicken Enchilada Bake'),
    'Meatball Arrabbiata Pasta': clone11('Arrabbiata Meatball Pasta','Meatball Arrabbiata Pasta'),
    'Loaded Beef Cottage Pie': clone11('Loaded Beef Cottage Pie'),
    'High-Protein Beef Lasagna': clone11('High Protein Beef Lasagna','High-Protein Beef Lasagna'),
    'Cajun Garlic Salmon': clone11('Cajun Garlic Salmon'),
    'Baked Strawberry-Lemon Protein Cheesecake': clone11('Baked Strawberry-Lemon Protein Cheesecake'),
    'Chocolate Oreo Mousse': clone11('Chocolate Oreo Mousse'),
    'Chocolate Peanut Butter Protein Brownie': clone11('Chocolate Peanut Butter Protein Brownie'),
    'Buffalo Chicken Pinwheels': clone11('Buffalo Chicken Pinwheels'),
    'BBQ Chicken Lavash Flatbread': clone11('BBQ Chicken Lavash Flatbread'),
    'Caprese Protein Pasta Box': clone11('Caprese Protein Pasta Box'),
    'Mediterranean Chicken Bowl': clone11('Mediterranean Chicken Bowl'),
    'Mexican Streetcorn Chicken Bowl': clone11('Mexican Streetcorn Chicken Bowl'),
    'Mango Habanero Chicken Wings': clone11('Mango Habanero Chicken Wings'),
    'Mediterranean Chicken Hummus Box': clone11('Mediterranean Chicken Hummus Box'),
  };
  // Batch 11 uses one onion pull and one fat-free mozzarella pull. Historical
  // method records stay unchanged; only the current production overlay is normalized.
  for (const [name, method] of Object.entries(batch11MethodsByName)) {
    batch11MethodsByName[name] = JSON.parse(JSON.stringify(method)
      .replaceAll('red_onion', 'onion')
      .replaceAll('Red onion', 'Onion')
      .replaceAll('red onion', 'onion')
      .replaceAll('part_skim_mozzarella', 'mozzarella')
      .replaceAll('part-skim mozzarella', 'fat-free mozzarella'));
  }
  batch11MethodsByName['Loaded Beef Cottage Pie'] = JSON.parse(JSON.stringify(batch11MethodsByName['Loaded Beef Cottage Pie'])
    .replaceAll('mixed_vegetables', 'canned_peas_carrots')
    .replaceAll('frozen peas and carrots', 'drained canned peas and carrots'));
  data.batch = 11;
  data.version = '2026-09-14.2';
  data.labelExemptCustomers = ['Talal', 'Duaa', 'Rida', 'Owner Custom'];
  data.meals = {
    ...Object.fromEntries(Object.entries(batch11DishNames).map(([id,name]) => [id, JSON.parse(JSON.stringify(batch11MethodsByName[name]))])),
  };
  const meatballMix11 = data.meals.m4.prepBatches.find(card => card.type === 'protein-mix');
  if (meatballMix11) {
    meatballMix11.instruction = 'Form the exact customer count from the complete measured recipe mix: eight per Lean and ten per Bulk.';
    meatballMix11.steps = [
      'Mix the displayed beef, egg, breadcrumbs, onion, garlic, and salt only until evenly combined.',
      'Weigh the complete raw mix. Form eight meatballs per Lean meal and ten per Bulk meal from the displayed live counts. Divide the actual mix weight by that piece count; keep tier allocations labeled.',
      'Do not remove a damage reserve from the measured customer recipe. Form any extra pieces only from separately measured extra mix; cover, label, date, and refrigerate at 40 F or below.',
    ];
    meatballMix11.reservePct = 0;
    meatballMix11.pieceTargets.lean.gramsPerPiece = 32.5;
    meatballMix11.pieceTargets.bulk.gramsPerPiece = 32.5;
  }
  data.meals.m4.piecePlan = {
    lean: 8, bulk: 10, formedGrams: 32.5, reservePct: 0,
    note: 'The measured recipe mix is for customer pieces. Only separately weighed extra mix can become a damage reserve.',
  };
  data.meals.m4.proteinCook.recipeSteps = [
    'Load the formed approximately 32.5 g raw Arrabbiata meatballs into the first available 400 F oven lane in one uncrowded layer.',
    'Bake every piece to 160 F; record the cooked count, weight, damage, and labeled destination pan.',
  ];
  const sandwichPrep11 = data.meals.b2.prepBatches.find(card => card.type === 'measured-prep');
  if (sandwichPrep11) {
    sandwichPrep11.includeAllRecipeIngredients = false;
    sandwichPrep11.ingredientKeys = ['potato', 'sunflower_oil', 'salt', 'egg', 'egg_white'];
    sandwichPrep11.steps = [
      'Cut and season the displayed Lean potato allocation for roasting; Bulk has no potato.',
      'Count the displayed whole eggs and liquid egg whites, but keep eggs whole and whites sealed until the Cook Day egg cook for best texture.',
    ];
  }
  for (const id of ['b2', 'm5']) {
    data.meals[id].sideCup = {
      ...data.meals[id].sideCup,
      ingredientKeys: ['light_mayo', 'ketchup', 'honey', 'hot_sauce'],
      steps: [
        'Weigh the displayed mayonnaise, ketchup, honey, and Valentina Black Label hot sauce into one clean bowl. Whisk until uniform.',
        'Tare each 2 oz cup, fill exactly 45 g net per ordered meal, seal, count, and refrigerate at 41 F or below.',
      ],
    };
  }
  const lasagnaSauceText11 = data.meals.m6.prepBatches.find(card => card.type === 'sauce');
  if (lasagnaSauceText11) lasagnaSauceText11.steps = lasagnaSauceText11.steps.map(step => step.replace('measuonion', 'measured onion'));
  const butterRice11 = data.meals.m3.prepBatches.find(card => card.type === 'grain' && (card.ingredientKeys || []).includes('rice_dry'));
  const chineseRice11 = data.meals.m1.prepBatches.find(card => (card.ingredientKeys || []).includes('rice_dry'));
  if (chineseRice11) {
    chineseRice11.prepWave = 'rice';
    chineseRice11.prepWaveName = 'One plain-rice cook for Bok Choy and Butter Chicken';
    chineseRice11.instruction = 'Cook one combined plain-rice batch for Chinese-Style Bok Choy Chicken and Butter Chicken on Prep Day.';
    chineseRice11.steps = [
      'Use the combined dry recipe pull shown in the shared plain-rice job. Cook one pot for Bok Choy Chicken and Butter Chicken; keep the grocery allowance dry.',
      'Record dry and cooked weights, divide by recipe allocation into shallow labeled pans, rapid-cool, and refrigerate at 41 F or below.',
    ];
  }
  if (butterRice11) {
    butterRice11.type = 'starch-ahead';
    butterRice11.prepWave = 'rice';
    butterRice11.prepWaveName = 'One plain-rice cook for Bok Choy and Butter Chicken';
    butterRice11.instruction = 'Use the Butter Chicken share of the combined plain-rice Prep Day cook, not a second pot.';
    butterRice11.steps = [
      'Use the combined plain-rice batch with Chinese-Style Bok Choy Chicken. Do not start another pot.',
      'Record and chill the Butter Chicken cooked share separately in a shallow labeled pan.',
    ];
  }
  data.meals.m1.riceBatchGroup = 'common';
  data.meals.m3.riceBatchGroup = 'common';
  data.meals.m1.prepSteps = data.meals.m1.prepBatches.map(card => card.instruction);
  data.meals.m3.prepSteps = data.meals.m3.prepBatches.map(card => card.instruction);
  const pieFilling11 = data.meals.m5.prepBatches.find(card => card.type === 'protein-cook-ahead');
  if (pieFilling11) {
    pieFilling11.steps = [
      'Drain canned peas and carrots, then weigh 80 g per Lean and 100 g per Bulk meal after draining.',
      'Brown the measured beef to 160 F, drain thoroughly, then add onion, tomato paste, and drained vegetables. Cook off excess canning liquid; do not add broth.',
      'Record filling yield, rapid-cool, label, and refrigerate.',
    ];
  }
  const lasagnaMeatSauce11 = data.meals.m6.prepBatches.find(card => card.type === 'sauce' && (card.ingredientKeys || []).includes('beef_90_raw'));
  if (lasagnaMeatSauce11) lasagnaMeatSauce11.stage = 'ahead';
  data.meals.m6.prepFlowGroup = 'lasagna-pan';
  data.meals.m6.prepFlowTitle = 'High-Protein Beef Lasagna: meat sauce, ricotta, assemble and bake';
  data.meals.h1.steps = [
    'Friday home party, not Saturday customer Cook Day: pan-cook this separate seasoned lemon-chicken pull in uncrowded batches to 165 F. Record yield, dice, then rapid-cool in a shallow pan to 41 F or below.',
    'For the home party, measure eight servings of chicken, hummus, cucumber, tomato, feta, olives, and onion into eight clean home meal containers. These are not customer Grab & Go boxes and receive no customer nutrition labels.',
    'Keep four whole flatbreads dry for eight half-bread portions. Refrigerate the finished boxes at 41 F or below until serving.',
  ];
  data.meals.h1.prepDayOnly = true;
  if (data.meals.h1.proteinCook) data.meals.h1.proteinCook.prepDayComplete = true;
  data.meals.h1.phase = 1;
  data.meals.h1.order = 5;
  const partyChicken11 = data.meals.h1.prepBatches.find(card => card.type === 'marinade');
  if (partyChicken11) {
    partyChicken11.name = 'Friday home-party Mediterranean chicken';
    partyChicken11.instruction = 'Keep this 8-serving Friday party pull separate from Saturday customer chicken. Season and cook it fresh on Friday.';
    partyChicken11.steps = [
      'Pull the displayed raw thigh and seasoning quantities for eight party servings. Do not include this meat in the Saturday customer shared-seasoning bowl.',
      'Season with the displayed base and lemon. Keep covered at 41 F or below until Friday pan-cooking to 165 F.',
      'Rapid-cool in a shallow pan before mixing with cold hummus-box ingredients; keep cold until the party.',
    ];
    partyChicken11.seasoningFamily = '';
    partyChicken11.seasoningFamilyName = '';
    partyChicken11.splitAfterSeasoning = false;
    partyChicken11.releaseTiming = 'Friday home party';
    partyChicken11.finishTiming = 'Friday home party';
  }
  const partyComponents11 = data.meals.h1.prepBatches.find(card => card.type === 'cold-kit');
  if (partyComponents11) {
    partyComponents11.name = 'Friday home-party chicken cook and box assembly';
    partyComponents11.stage = 'ahead';
    partyComponents11.equipmentLane = 'stovetop';
    partyComponents11.instruction = 'Cook the separate Friday party chicken pull to 165 F, rapid-cool, and assemble eight home boxes with the measured hummus-box components.';
    partyComponents11.steps = [
      'Pan-cook the labeled Friday party chicken pull in uncrowded batches to 165 F. Record cooked yield, dice, and rapid-cool in a shallow pan to 41 F or below.',
      'Wash and dry produce; dice cucumber and tomato, slice onion, and drain olives.',
      'Measure chicken, hummus, cucumber, tomato, feta, olives, and onion into eight covered home boxes. Keep four whole flatbreads dry for eight half-bread portions.',
      'Refrigerate at 41 F or below until the Friday party. These are not Saturday customer bags.',
    ];
  }
  data.meals.h1.prepSteps = data.meals.h1.prepBatches.map(card => card.instruction);
  const extendIngredientKeys11 = (dishId, cardMatch, keys, componentMatch) => {
    const method = data.meals[dishId];
    const card = method.prepBatches.find(cardMatch);
    if (!card) throw new Error(`Missing Batch 11 prep card for ${dishId}`);
    card.ingredientKeys = [...new Set([...(card.ingredientKeys || []), ...keys])];
    const componentEntry = method.componentMap.find(componentMatch);
    if (!componentEntry) throw new Error(`Missing Batch 11 component for ${dishId}`);
    componentEntry.ingredientKeys = [...new Set([...(componentEntry.ingredientKeys || []), ...keys])];
  };
  const neutralFinishKeys11 = ['garlic_powder','onion_powder','paprika','black_pepper'];
  extendIngredientKeys11('m2', card=>card.type==='marinade', neutralFinishKeys11, item=>item.role==='protein');
  extendIngredientKeys11('a2', card=>card.type==='marinade', ['garlic_powder','onion_powder','black_pepper'], item=>item.role==='protein');
  extendIngredientKeys11('x1', card=>card.type==='marinade', neutralFinishKeys11, item=>item.role==='protein');
  extendIngredientKeys11('x2', card=>card.type==='marinade', neutralFinishKeys11, item=>item.role==='protein');
  data.meals.m3.prepBatches.push(card10('garnish-kit','Butter Chicken cilantro finish',['cilantro'],['Wash, dry, chop, and refrigerate the exact cilantro allocation for final plating.']));
  data.meals.m3.componentMap.push(component('topping','Cilantro finish',['cilantro'],'Add only at final plating.'));
  data.meals.m4.componentMap = [component('complete','Meatball Arrabbiata measured recipe',['beef_90_raw','protein_pasta','crushed_tomatoes','garlic','tomato_paste','mozzarella','onion','egg','breadcrumbs','salt'],'Form the meatballs in Proteins, make the tomato sauce in Sauces, and cook the pasta in Cook ahead. Add mozzarella at final assembly.')];
  for (const dishId of ['m6','x1']) {
    data.meals[dishId].prepBatches = data.meals[dishId].prepBatches.filter(card=>!(card.ingredientKeys || []).includes('cilantro'));
    data.meals[dishId].componentMap = data.meals[dishId].componentMap.filter(item=>!(item.ingredientKeys || []).includes('cilantro'));
    data.meals[dishId].prepSteps = data.meals[dishId].prepBatches.map(card=>card.instruction);
  }
  const lasagnaSauce11 = data.meals.m6.prepBatches.find(card=>card.type==='sauce');
  if (lasagnaSauce11) {
    lasagnaSauce11.instruction = 'Make one complete house tomato meat sauce for the exact live customer count.';
  }
  const lasagnaRicotta11 = data.meals.m6.prepBatches.find(card=>card.type==='mix');
  if (lasagnaRicotta11) {
    lasagnaRicotta11.instruction = 'Mix one complete ricotta layer for the exact live customer count.';
  }
  const lasagnaBake11 = data.meals.m6.prepBatches.find(card=>card.type==='bake-ahead');
  if (lasagnaBake11) {
    lasagnaBake11.name = 'Assemble, fully bake, and chill the consolidated Lasagna batch';
    lasagnaBake11.instruction = 'Build one consolidated customer batch on Prep Day. Use a second pan only when the live count exceeds safe pan capacity.';
    lasagnaBake11.steps = [
      'Before assembly, weigh and record the empty customer-pan tare. Label every pan before filling.',
      'Dry-fit the displayed noodle quantity against the chosen pans and layer count before filling. If the layout requires more sheets, review the recipe and nutrition first; do not silently add noodles or double the other ingredients.',
      'Use all displayed customer ingredients in one consolidated build. Add a second pan only if needed for even depth, complete cooking, and safe cooling.',
      'Layer the finished PRPD tomato meat sauce, oven-ready sheets, ricotta mixture, and mozzarella. Repeat until complete; finish with sauce and mozzarella and cover every dry noodle edge.',
      'Cover and bake at 375 F until the center of every pan reaches 165 F; uncover only for the final 10-15 minutes if browning is needed.',
      'Record each finished hot pan weight, then start rapid cooling immediately in the approved shallow-pan setup.',
      'Log 135 F to 70 F within 2 hours and 70 F to 41 F or below within 4 additional hours. Do not release an out-of-limit pan.',
      'Once 41 F or below, cover, label, date, and chill intact overnight. Cut and weigh exact Lean and Bulk portions on Cook Day.',
    ];
    lasagnaBake11.showProductionExtras = false;
  }
  data.meals.m6.prepSteps = data.meals.m6.prepBatches.map(card=>card.instruction);
  data.meals.m6.steps = [
    'Verify the consolidated Prep Day Lasagna batch reached 165 F and its cooling log reached 70 F within 2 hours and 41 F or below within 6 hours total.',
    'Weigh the actual chilled edible batch after removing pan tare. Divide by the displayed recipe shares; modeled ingredient mass is not a guaranteed finished weight. Verify the approved package net weight before labeling.',
    'Pack the exact live tier counts before setting aside genuine edge trim. Do not create a separate owner pan or automatic extra portions.',
  ];
  data.meals.m6.panBatch={name:'Lasagna batch',portionBasis:{lean:3,bulk:4},yieldStatus:'unverified'};
  data.meals.m6.assemblyGuide=tierGuide(['Pack each Lean portion using 3 shares of the measured chilled batch. Verify the approved label net weight before release.'],['Pack each Bulk portion using 4 shares of the measured chilled batch. Verify the approved label net weight before release.']);
  // Workflow-only repairs: quantities remain in production-data; no second
  // ingredient formula or batch-specific count is introduced here.
  const sliderKit11 = data.meals.m2.prepBatches.find(card=>card.type==='mise-en-place');
  if (sliderKit11) {
    sliderKit11.ingredientKeys = ['hawaiian_roll','mozzarella','onion','pickles'];
    sliderKit11.steps = ['Keep rolls sealed; refrigerate the measured cheese, onion, and pickles for Cook Day.'];
    data.meals.m2.prepBatches.push(card10('sauce','Hot-honey slider sauce',['light_mayo','sriracha','honey'],[
      'Whisk the measured mayonnaise, sriracha, and honey until uniform. Cover, label, and refrigerate for Cook Day sliders.',
    ]));
  }
  const bbqMarinade11 = data.meals.a2.prepBatches.find(card=>card.type==='marinade');
  if (bbqMarinade11) {
    bbqMarinade11.ingredientKeys = bbqMarinade11.ingredientKeys.filter(key=>!['bbq_sauce','honey','lime'].includes(key));
    data.meals.a2.prepBatches.push(card10('sauce','Honey-lime BBQ sauce',['bbq_sauce','honey','lime'],[
      'Mix the measured BBQ sauce, honey, and lime. Cover and refrigerate separately from raw chicken; use this complete sauce batch on Cook Day.',
    ]));
  }
  data.meals.m3.steps[1] = 'Take off high heat and stir in the reserved sauce yogurt until smooth. Reheat the prepared Butter Chicken share of the shared rice; do not cook another pot.';
  data.meals.m3.proteinCook.recipeSteps = [...data.meals.m3.steps];
  data.meals.m3.proteinCook.instructions = [...data.meals.m3.steps];
  const butterMarinade11 = data.meals.m3.prepBatches.find(card=>card.type==='marinade');
  butterMarinade11.ingredientKeys = butterMarinade11.ingredientKeys.filter(key=>key!=='fage');
  butterMarinade11.formulaIngredients = [{key:'fage_marinade',name:'Yogurt for Butter Chicken marinade',unit:'g',perServing:15,includeInGrocery:false}];
  butterMarinade11.steps[0] = 'Use only the displayed marinade yogurt here. The finishing yogurt is measured separately in Sauces; keep it away from raw chicken.';
  data.meals.m3.prepBatches.find(card=>card.type==='sauce').formulaIngredients = [
    {key:'fage_finish',name:'Finishing yogurt · reserve cold, add on Cook Day',unit:'g',lean:30,bulk:45,includeInGrocery:false},
  ];
  const pancakeBase11 = data.meals.b1.prepBatches[0];
  pancakeBase11.name = 'Pancake dry and wet kits';
  pancakeBase11.includeAllRecipeIngredients = false;
  pancakeBase11.ingredientKeys = ['flour','baking_powder','whey_vanilla','egg','egg_white','fairlife_milk','vanilla','cinnamon','sunflower_oil','salt'];
  pancakeBase11.formulaIngredients = [{key:'fage_batter',name:'Yogurt for pancake batter',unit:'g',lean:80,bulk:100,includeInGrocery:false}];
  pancakeBase11.steps = ['Measure dry and wet ingredients into separate labeled kits. Keep eggs whole and whites sealed until Cook Day; refrigerate the dairy.', 'Keep the displayed oil for the griddle. Combine the batter only just before cooking.'];
  const pancakeTopping11 = card10('sauce','Strawberry cheesecake topping',['strawberry','reduced_cream_cheese','powdered_sugar'],[
    'Cook the measured strawberries until thickened and cool completely. Mix cream cheese, powdered sugar, and the displayed topping yogurt.',
    'Divide the fruit and cheesecake topping into one combined cup per ordered meal, using the tier allocations. Seal and refrigerate.',
  ]);
  pancakeTopping11.formulaIngredients = [{key:'fage_topping',name:'Yogurt for cheesecake topping',unit:'g',perServing:20,includeInGrocery:false}];
  data.meals.b1.prepBatches.push(pancakeTopping11,card10('sauce','Pancake syrup cups',['maple_syrup'],['Fill one measured syrup cup per ordered meal, seal, and refrigerate.']));
  const salmonQuinoa11 = data.meals.m7.prepBatches.find(card=>card.type==='grain');
  if (salmonQuinoa11) {
    salmonQuinoa11.type = 'starch-ahead';
    salmonQuinoa11.steps = [
      'Rinse the displayed dry quinoa and cook according to its package directions. Fold in the displayed quinoa garlic, lemon, cilantro, and salt.',
      'Weigh the finished quinoa, rapid-cool in a shallow labeled pan, and refrigerate. Keep the final garnish allocation separate.',
    ];
  }
  const salmonBeans11 = data.meals.m7.prepBatches.find(card=>card.type==='vegetable-ahead');
  if (salmonBeans11) salmonBeans11.steps = [
    'Use the trimmed beans from Produce. Toss with the displayed bean garlic, lemon, oil, and salt.',
    'Roast at 400 F until just tender, checking regularly. Record yield, rapid-cool in a shallow labeled pan, and refrigerate for Cook Day.',
  ];
  data.meals.m7.steps[0] = 'Retrieve the cooked lemon-herb quinoa and garlic green beans from Prep Day. Verify cooling and cold holding; do not cook a second batch.';
  const sandwichPotatoes11 = sandwichPrep11;
  if (sandwichPotatoes11) {
    sandwichPotatoes11.name = 'Breakfast Sandwich potatoes';
    sandwichPotatoes11.type = 'starch-ahead';
    sandwichPotatoes11.ingredientKeys = ['potato','sunflower_oil','salt'];
    sandwichPotatoes11.steps = [
      'Toss the displayed Lean potatoes with the measured oil and salt. Roast at 400 F until tender, turning as needed.',
      'Rapid-cool in a shallow labeled pan and refrigerate. Bulk has no potato; keep eggs whole and egg whites sealed for Cook Day.',
    ];
    data.meals.b2.steps[0] = 'Reheat the prepared Lean potatoes. Cook eggs and beef bacon fresh today; no potatoes are required for Bulk.';
  }
  // These are full-recipe steps, not separate cooking and assembly tickets.
  // References attach scaled quantities to the point of use.
  data.meals.b2.stepIngredients = [['potato'],['egg','egg_white','beef_bacon'],['english_muffin','mozzarella']];
  data.meals.b3.stepIngredients = [['chicken_thigh_raw'],['egg','egg_white','mozzarella','small_tortilla','large_tortilla'],[]];
  data.meals.m1.stepIngredients = [['chicken_thigh_raw'],['bok_choy','red_bell_pepper'],['green_onion'],[]];
  data.meals.m2.stepIngredients = [['chicken_thigh_raw'],['hawaiian_roll','mozzarella','onion','pickles'],[]];
  data.meals.a1.stepIngredients = [['chicken_thigh_raw'],['small_tortilla','lettuce'],[]];
  for (const id of ['x1','x2']) {
    data.meals[id].riceBatchGroup = 'common';
    const riceCard = data.meals[id].prepBatches.find(card=>card.ingredientKeys?.includes('rice_dry'));
    if (riceCard) {
      riceCard.type = 'starch-ahead';
      riceCard.steps = ['Use this allocation in the shared plain-rice pot. Divide the cooked yield by the displayed dry shares, rapid-cool, and refrigerate.'];
    }
  }
  data.meals.x1.steps[0] = 'Cook the labeled chicken pull to 165 F and record yield. Use the prepared Mediterranean share of the shared rice, not a second rice cook.';
  data.meals.x2.steps = [
    'Roast the labeled chicken pull to 165 F and record yield. Use the prepared Streetcorn share of the shared rice.',
    'Retrieve the prepared street-corn mixture. Verify safe cooling and cold holding; do not char and mix a second batch.',
    'Plate the measured chicken, rice, and street-corn mixture in distinct sections.',
  ];
  data.meals.d2.steps = [
    'Verify the prepared mousse cups are sealed and at 41 F or below. Do not mix a second batch.',
    'Check the finished weights and exact customer count, then keep cold for pack-out.',
  ];
  data.meals.b4.prepBatches[0].steps = [
    'Use the cut vegetables from Produce. Measure the cheese and keep the bread sealed and dry.',
    'Keep eggs whole and liquid whites sealed and refrigerated. Mix and cook fresh on Cook Day.',
  ];
  const formulaSources11 = {fage_marinade:'fage',fage_finish:'fage',fage_batter:'fage',fage_topping:'fage',salt_filling:'salt',salt_mash:'salt',m3_streetcorn_salt:'salt'};
  for(const method of Object.values(data.meals)) for(const card of method.prepBatches) for(const formula of card.formulaIngredients || []) {
    formula.sourceKey = formulaSources11[formula.key] || (/^m8_/.test(formula.key) ? {garlic:'garlic',lemon:'lemon',oil:'sunflower_oil',salt:'salt',cilantro:'cilantro'}[formula.key.split('_').at(-1)] : formula.sourceKey);
    if(formula.key==='fage_finish') formula.deferredUntilCook=true;
  }
  for(const id of ['m2','m4','m7','a2','x2']) {
    data.meals[id].cookDayEquipment={lane:'oven',temperatureF:400,sequence:id==='m4'?10:id==='m7'?30:20};
    data.meals[id].proteinCook.lane='oven';
    data.meals[id].proteinCook.ovenTemperatureF=400;
  }
  data.meals.b1.cookDayEquipment={lane:'griddle',sequence:10};
  data.meals.b2.cookDayEquipment={lane:'griddle',sequence:12};
  data.meals.b4.cookDayEquipment={lane:'griddle',sequence:14};
  data.meals.x1.cookDayEquipment={lane:'stovetop',sequence:35};
  for(const id of ['m5','m6','a3','d1','d2','d3']) data.meals[id].cookDayEquipment={lane:'cold-assembly',sequence:30};
  // Cutting belongs to Produce. Deferred assembly cards describe today's work.
  const bokChoyProduce11=data.meals.m1.prepBatches.find(card=>card.type==='mise-en-place');
  if(bokChoyProduce11) bokChoyProduce11.stage='produce';
  const pinwheelAssembly11=data.meals.a1.prepBatches.find(card=>card.type==='cold-kit');
  if(pinwheelAssembly11) pinwheelAssembly11.steps=['Retrieve the sealed tortillas and prepared dry lettuce for assembly after the chicken is chilled.'];
  const cottageAssembly11=data.meals.m5.prepBatches.find(card=>card.type==='cold-kit');
  if(cottageAssembly11) cottageAssembly11.steps=['Retrieve the separately chilled beef filling and mash. Keep them separate until portioning; weigh the mozzarella for each tier.'];
  const flatbreadAssembly11=data.meals.a2.prepBatches.find(card=>card.type==='mise-en-place' || card.type==='cold-kit');
  if(flatbreadAssembly11) flatbreadAssembly11.steps=['Retrieve the prepared onion and cilantro; keep lavash dry until topping.'];
  for (const method of Object.values(data.meals)) method.prepSteps = method.prepBatches.map(card=>card.instruction);
  for (const method of Object.values(data.meals)) {
    method.produceCuts = {
      ...(method.produceCuts || {}),
      bok_choy:'Separate stems and leaves; slice stems, ribbon leaves',
      red_bell_pepper:'Thin strips',
      green_onion:'Thinly slice',
      basil:'Keep whole and dry; tear at assembly',
      tomato:'Dry dice or halve, as shown on the recipe card',
      cannellini_beans:'Drain, rinse, and dry thoroughly',
    };
  }
  // Library consumers pair with historical recipeLibrary ingredient keys.
  // Current batch normalization belongs in meals, not the reusable source map.
  const libraryEnchilada11 = JSON.parse(JSON.stringify(clone11('Chicken Enchilada Bake')));
  data.methodsByName = {...batch10MethodsByName,...batch11MethodsByName,'Chicken Enchilada Bake':libraryEnchilada11};
  data.dishNames = batch11DishNames;
  data.sharedProteinSeasoning = [{
    id:'batch11-shared-savory-thigh-base',
    baseIncludedInRecipe:true,
    name:'Shared savory thigh base',
    proteinKey:'chicken_thigh_raw',
    dishIds:['b3','m1','m2','a1','a2','x1','x2'],
    note:'Season compatible boneless skinless thighs together, divide exact recipe pulls immediately, then add each dish finish. Butter Chicken remains separate with its Shan formula.',
    basePerKg:[
      {key:'salt',name:'Fine salt',grams:8,measure:{type:'spice',gramsPerTsp:6}},
      {key:'garlic_powder',name:'Garlic powder',grams:6.75,measure:{type:'spice',gramsPerTsp:3.1}},
      {key:'onion_powder',name:'Onion powder',grams:4,measure:{type:'spice',gramsPerTsp:2.4}},
      {key:'paprika',name:'Paprika',grams:3,measure:{type:'spice',gramsPerTsp:2.3}},
      {key:'black_pepper',name:'Black pepper',grams:2,measure:{type:'spice',gramsPerTsp:2.3}},
    ],
    finishes:{
      b3:{note:'Cook whole, then dice finely for the quesadilla.',perKg:[]},
      m1:{note:'After splitting, cut to 2 cm pieces; the Chinese sauce is added only after cooking.',perKg:[]},
      m2:{note:'Cook whole, then shred and add hot-honey finish.',perKg:[]},
      a1:{note:'Cook whole, shred, rapid-cool, then mix into the cold Buffalo filling.',perKg:[]},
      a2:{note:'Cook whole, chop, and coat with the measured honey-lime BBQ sauce.',perKg:[]},
      x1:{note:'Cook whole, dice, and pack with the cold Mediterranean components.',perKg:[]},
      x2:{note:'Cook whole, dice, and add the measured street-corn component during assembly.',perKg:[]},
    },
  }];
  data.weeklySauces = {enabled:false,policy:'Batch 11 sauces are assigned only to their exact recipes; no extra weekly sauce batch.',cupSizeOz:2,eligibleMealIds:[],customerCupsTotal:0,kitchenUseCupsPerSauce:0,qcCupsPerSauce:0,sauces:[]};
  data.phases = [
    {title:'1. Confirm live Batch 11 counts',detail:'Import only active orders. Expand each Build-a-Week bundle into its five individual Lean meal components.'},
    {title:'2. Raw proteins and marinades',detail:'Season compatible thighs once, split exact recipe pulls immediately, and keep Butter Chicken, beef, salmon, and beef bacon separate.'},
    {title:'3. Produce, sauces, desserts, and cold kits',detail:'Chop shared produce once by cut, then divide it into labeled recipe allocations. Make every measured sauce and dessert batch.'},
    {title:'4. Prep Day cooking',detail:'Complete safe make-ahead rice, pasta, potatoes, beef fillings, baked lasagna, desserts, and other displayed components. Keep customer-facing chicken cooking on Cook Day.'},
    {title:'5. Cook Day protein and assembly',detail:'Run oven work first, pan-cook chicken in grouped waves, finish watched stovetop items, then assemble each exact SKU and tier.'},
    {title:'6. Customer pack-out',detail:'Pack one customer at a time, including every expanded exclusive meal, dressing cup, topping cup, and Grab & Go item.'},
  ];

  // Batch 12 owner-selected rotation. Build every slot from a named recipe,
  // never from the dish that happened to occupy the same ID last week.
  const clone12 = name => {
    const source = data.methodsByName?.[name] || methodHistoryByName[name]?.at(-1)?.method;
    if (!source) throw new Error(`Missing Batch 12 method: ${name}`);
    const method = JSON.parse(JSON.stringify(source));
    method.recipeName = name;
    return method;
  };

  const eggBites12 = meal(3, 10, ['blender', 'digital scale', 'two 12-well muffin pans', 'sheet pan'], 'Bake egg bites to 160 F; roast potatoes until tender.', [
    'Retrieve the fully chilled measured egg bites and potato hash from Prep Day. Verify the recorded 24-piece yield and cold holding.',
    'Pack exactly 4 egg bites and 120 g potato hash per Lean meal, or 6 egg bites and 150 g potato hash per Bulk meal.',
  ], 'Lean: 4 egg bites plus 120 g hash. Bulk: 6 egg bites plus 150 g hash.', 'Refrigerate promptly; reheat until hot throughout.', {
    prepDayComplete: true,
    prepBatches: [
      prep('cook-ahead', 'One controlled 24-well Egg Bite batch', 'Make only the scaled number of complete 24-well batches shown. Never multiply the old meal formula.', ['egg','egg_white','cottage','mozzarella','spinach','tomato','onion','jalapeno','salt','garlic_powder','black_pepper','sunflower_oil'], [
        'Blend eggs, egg whites, and cottage cheese smooth. Fold in mozzarella and the prepared vegetables.',
        'Weigh the complete raw batter. It must total 1,440 g; keep the separate 3 g pan-oil allocation out of that weight.',
        'Prepare 24 standard wells and deposit exactly 60 g in each. Wells should be one-half to three-quarters full.',
        'Bake at 350 F until the centers reach 160 F. Record baked count, total baked weight, average bite weight, and any leftover batter; rapid-cool and refrigerate.',
      ], {excludeComponentRefs:['potato-hash'], prepWave:'eggs', prepWaveName:'Measured egg production'}),
      prep('starch-ahead', 'Egg Bite potato hash', 'Roast the exact potato-hash allocation once.', ['potato','sunflower_oil','paprika','garlic_powder','salt'], [
        'Dice potatoes evenly and toss with only the displayed hash oil and seasonings.',
        'Roast at 400 F until browned and tender. Record yield, rapid-cool in a shallow labeled pan, and refrigerate.',
      ], {componentRef:'potato-hash', prepWave:'roasted-potatoes', prepWaveName:'Roasted potato wave'}),
    ],
    assemblyGuide: tierGuide(
      ['Pack exactly 4 egg bites and 120 g potato hash. Verify the bite count before closing.'],
      ['Pack exactly 6 egg bites and 150 g potato hash. Verify the bite count before closing.'],
    ),
    componentMap: [
      component('base', 'Measured Egg Bites', ['egg','egg_white','cottage','mozzarella','spinach','tomato','onion','jalapeno','salt','garlic_powder','black_pepper'], 'Deposit exactly 60 g batter in each of 24 standard muffin wells and bake to 160 F.'),
      component('side', 'Roasted potato hash', ['potato','paprika'], 'Roast once, record the finished yield, and portion 120 g Lean or 150 g Bulk.'),
      component('seasoning', 'Separated cooking oil', ['sunflower_oil'], 'Use only the displayed split between the muffin pans and potato hash.'),
    ],
  });
  eggBites12.prepSteps = eggBites12.prepBatches.map(card => card.instruction);
  eggBites12.recipeName = 'Egg Bites with Potato Hash';

  const bbqMac12 = meal(4, 60, ['chicken pan or oven', 'pasta pot', 'sauce cups'], 'Cook chicken to 165 F; use the recorded Prep Day macaroni yield.', [
    'Cook the measured chicken thigh pull in uncrowded batches to 165 F and record the cooked yield.',
    'Bring forward the recorded Prep Day macaroni yield. Do not cook a second batch.',
    'Fold only the incorporated BBQ allocation and mozzarella through the chicken and macaroni. Divide by tier.',
    'Pack one separately measured 30 g BBQ sauce cup with every meal.',
  ], 'Pack the exact Lean or Bulk chicken-mac allocation plus one sealed 30 g BBQ cup.', 'Rapid-cool and refrigerate.', {
    sideCups: 1,
    sideCup: {name:'Sugar-free BBQ sauce', gramsPerMeal:30, instruction:'Fill and seal one 30 g net cup per meal.'},
    proteinCook: {group:'chicken', sequence:45, name:'BBQ Mac chicken', endpoint:'165 F', recipeKeys:['chicken_thigh_raw','salt'], recipeSteps:['Cook the measured thigh pull to 165 F and record yield.'], instructions:['Cook in uncrowded batches to 165 F.', 'Record raw weight, cooked yield, endpoint, and destination pan.']},
    prepBatches: [
      prep('protein-portion', 'BBQ Mac chicken pull', 'Weigh the exact raw thigh and salt allocation for Cook Day.', ['chicken_thigh_raw','salt'], ['Keep the chicken cold and separately labeled. Do not add unrecorded seasoning or sauce.']),
      prep('starch-ahead', 'BBQ Mac macaroni', 'Cook the exact displayed dry macaroni allocation on Prep Day.', ['protein_mac'], [
        'Weigh the dry macaroni. Do not use a full box by assumption.',
        'Cook just to al dente so it does not become soft during tomorrow\'s reheating and assembly.',
        'Drain thoroughly, record the finished usable yield, rapid-cool in a shallow labeled pan, cover, and refrigerate at 41 F or below.',
      ], {prepWave:'pasta', prepWaveName:'Pasta cook'}),
      prep('mise-en-place', 'BBQ Mac mozzarella finish', 'Stage the exact mozzarella allocation for Cook Day assembly.', ['mozzarella'], [
        'Keep the mozzarella covered, labeled, and refrigerated.',
        'Fold it through the chicken and prepared macaroni only during Cook Day assembly.',
      ], {stage:'cook', consumesIngredients:false}),
      prep('sauce', 'BBQ Mac incorporated sauce', 'Measure the sauce that is mixed into the dish separately from customer cups.', ['bbq_sauce'], ['Label as incorporated sauce; do not fill customer cups from this allocation.'], {componentRef:'bbq-incorporated'}),
      prep('sauce', 'BBQ Mac customer sauce cups', 'Fill one separate 30 g cup per active meal.', ['bbq_sauce'], ['Tare, fill to 30 g net, seal, count, date, and refrigerate.'], {componentRef:'bbq-side-cup'}),
    ],
    assemblyGuide: tierGuide(
      ['Pack the exact Lean chicken, macaroni, incorporated sauce, and mozzarella allocation. Add one sealed 30 g BBQ cup.'],
      ['Pack the exact Bulk chicken, macaroni, incorporated sauce, and mozzarella allocation. Add one sealed 30 g BBQ cup.'],
    ),
    componentMap: [
      component('protein', 'Seasoned chicken thighs', ['chicken_thigh_raw','salt'], 'Cook to 165 F, record the yield, and keep in the labeled BBQ Mac pan.'),
      component('base', 'Prepared macaroni, mozzarella, and incorporated BBQ', ['protein_mac','mozzarella'], 'Cook the exact dry pasta pull on Prep Day, record its finished yield, then fold it with the chicken, cheese, and displayed incorporated sauce on Cook Day.'),
      component('sauce', 'Split BBQ sauce allocation', ['bbq_sauce'], 'Keep the incorporated share and the separately measured 30 g customer cups in distinct labeled containers.'),
    ],
  });
  bbqMac12.prepSteps = bbqMac12.prepBatches.map(card => card.instruction);
  bbqMac12.recipeName = 'BBQ Chicken Mac & Cheese';

  const tikkaWrap12 = meal(5, 160, ['mixing bowls', 'wide chicken pan', 'digital scale', 'wrap station'], 'Cook chicken to 165 F; assemble only after it cools to 41 F or below.', [
    'Pan-cook the yogurt-spiced chicken in uncrowded batches to 165 F. Record yield and rapid-cool in a shallow labeled pan.',
    'Lay out one 70-calorie medium soft-taco tortilla per order. Add the chilled chicken, dry vegetables, and shared white garlic-jalapeño sauce.',
    'Roll tightly, pack the complete wrap, label, and return immediately to refrigeration.',
  ], 'One order is exactly 1 complete medium wrap. No rice, cheese, mayonnaise, or extra sauce cup.', 'Serve chilled and hold at 41 F or below.', {
    proteinCook: {group:'chicken', sequence:55, name:'Chicken Tikka Snack Wrap chicken', endpoint:'165 F', recipeKeys:['chicken_thigh_raw'], recipeSteps:['Cook the yogurt-spiced thigh to 165 F; cool before cold assembly.'], instructions:['Cook in uncrowded batches to 165 F.', 'Record cooked yield and rapid-cool to 41 F or below before wrapping.']},
    prepBatches: [
      prep('protein-portion', 'Tikka Wrap chicken pull', 'Weigh exactly 130 g raw boneless skinless thigh per order.', ['chicken_thigh_raw'], ['Keep this pull separate from the shared savory chicken base; it receives the tikka yogurt marinade.']),
      prep('marinade', 'Tikka chicken marinade', 'Mix only the measured raw-chicken marinade and coat the labeled chicken pull.', ['fage','lemon','garlic','paprika','cumin','coriander','chili_powder','salt','sunflower_oil'], ['Use 20 g yogurt per order here. Coat the chicken, cover, label, and refrigerate. This mixture contacts raw chicken and can never become the chilled finish.'], {componentRef:'tikka-marinade'}),
      prep('sauce', 'White garlic-jalapeño yogurt sauce · Tikka Wrap spread', 'Use the batch-wide white sauce inside the wraps. This sanitized sauce never contacts raw chicken.', ['fage','lime','jalapeno','garlic'], ['Measure 25 g per order from the shared white sauce batch.', 'Spread it across the two tortillas during cold assembly; do not pack a separate cup.'], {componentRef:'white-garlic-jalapeno-sauce', sharedSauceFamily:'jalapeno-lime-yogurt', sauceDelivery:'incorporated', sauceUse:'Spread 25 g inside each two-wrap order; no separate cup.'}),
      prep('cold-kit', 'Tikka Wrap tortillas and crisp vegetables', 'Prepare dry cold components for one wrap per order.', ['small_tortilla','lettuce','red_onion','cucumber','tomato'], ['Count one 70-calorie medium soft-taco tortilla per order. Wash, dry, and cut the vegetables; keep every component cold and dry.']),
    ],
    assemblyGuide: singleGuide('Pack exactly 1 complete medium wrap using the measured chilled chicken, crisp vegetables, and shared white sauce.'),
    componentMap: [
      component('protein', 'Tikka-marinated chicken thigh', ['chicken_thigh_raw','paprika','coriander','chili_powder','sunflower_oil'], 'Keep the raw-chicken marinade separate from the cold finish; cook to 165 F and rapid-cool before assembly.'),
      component('base', 'One medium wrap and crisp vegetables', ['small_tortilla','lettuce','red_onion','cucumber','tomato'], 'Build one complete wrap in one 70-calorie medium soft-taco tortilla.'),
      component('topping', 'Separated tikka marinade and shared white sauce', ['fage','lemon','lime','garlic','jalapeno','cumin','salt'], 'Keep the raw-chicken marinade separate. Use 25 g sanitized batch-wide white sauce inside each finished order.'),
    ],
  });
  tikkaWrap12.prepSteps = tikkaWrap12.prepBatches.map(card => card.instruction);
  tikkaWrap12.recipeName = 'Chicken Tikka Snack Wrap';

  const batch12MethodsByName = {
    'Egg Bites with Potato Hash': eggBites12,
    'Chicken Shakshuka': clone12('Chicken Shakshuka'),
    'French Toast': clone12('French Toast'),
    'Beef Breakfast Skillet': clone12('Beef Breakfast Skillet'),
    'Creamy Chicken Parmesan': clone12('Creamy Chicken Parmesan'),
    'BBQ Chicken Mac & Cheese': bbqMac12,
    'Southwest Beef Taco Bowl': clone12('Southwest Beef Taco Bowl'),
    'Tandoori Chicken': clone12('Tandoori Chicken'),
    'Garlic Butter Shrimp + Rice': clone12('Garlic Butter Shrimp + Rice'),
    'Chicken Enchilada Bake': clone12('Chicken Enchilada Bake'),
    'Loaded Beef Cottage Pie': clone12('Loaded Beef Cottage Pie'),
    'Baked Strawberry-Lemon Protein Cheesecake': clone12('Baked Strawberry-Lemon Protein Cheesecake'),
    'Chocolate Oreo Mousse': clone12('Chocolate Oreo Mousse'),
    'Chocolate Peanut Butter Protein Brownie': clone12('Chocolate Peanut Butter Protein Brownie'),
    'Chicken Tikka Snack Wrap': tikkaWrap12,
    'PRPD Protein Box': clone12('PRPD Protein Box'),
    'Caprese Protein Pasta Box': clone12('Caprese Protein Pasta Box'),
    'Harissa Honey Chicken': clone12('Harissa Honey Chicken'),
    'Loaded Buffalo Chicken Potato': clone12('Loaded Buffalo Chicken Potato'),
  };
  const cheesecake12 = batch12MethodsByName['Baked Strawberry-Lemon Protein Cheesecake'];
  cheesecake12.equipment = ['blender', '8-inch square baking pan', '325 F oven', 'digital scale'];
  cheesecake12.panBatch = { pan: '8-inch square', servingsPerPan: 8 };
  cheesecake12.prepEquipment = {
    ...(cheesecake12.prepEquipment || {}),
    equipmentLane: 'oven',
    ovenTemperatureF: 325,
    estimatedMinutes: 50,
    sequence: 10,
    background: true,
    showProductionExtras: true,
  };
  cheesecake12.validation = 'One customer serving is one-eighth of a complete 8-inch square pan. Never scale below eight portions; pack the live customer count first and keep surplus portions unlabeled.';
  // Several historical methods carried the former universal 2 g cilantro
  // garnish even when the controlled recipe did not. Batch 12 removes that
  // phantom component instead of adding an uncosted ingredient to the recipe.
  const cleanCilantroText12 = value => String(value || '')
    .replace(/,?\s*(?:and\s+)?finish(?:ed)? with (?:the reserved )?cilantro/gi, '')
    .replace(/;?\s*reserve(?:d)? cilantro(?: for final garnish)?/gi, '')
    .replace(/,?\s*(?:and\s+)?cilantro\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;])/g, '$1')
    .trim();
  const removeUnmodeledCilantro12 = method => {
    method.prepBatches = (method.prepBatches || []).flatMap(card => {
      const ingredientKeys = (card.ingredientKeys || []).filter(key => key !== 'cilantro');
      if (!ingredientKeys.length && (card.ingredientKeys || []).includes('cilantro') && !(card.formulaIngredients || []).length) return [];
      return [{...card, ingredientKeys, name:cleanCilantroText12(card.name), instruction:cleanCilantroText12(card.instruction), steps:(card.steps || []).map(cleanCilantroText12).filter(Boolean)}];
    });
    method.componentMap = (method.componentMap || []).flatMap(item => {
      const ingredientKeys = (item.ingredientKeys || []).filter(key => key !== 'cilantro');
      if (!ingredientKeys.length && (item.ingredientKeys || []).includes('cilantro')) return [];
      return [{...item, ingredientKeys, label:cleanCilantroText12(item.label), handling:cleanCilantroText12(item.handling)}];
    });
    method.steps = (method.steps || []).map(cleanCilantroText12).filter(Boolean);
    method.plating = cleanCilantroText12(method.plating);
    if (method.assemblyGuide) {
      for (const tier of Object.keys(method.assemblyGuide)) method.assemblyGuide[tier] = method.assemblyGuide[tier].map(cleanCilantroText12).filter(Boolean);
    }
    method.prepSteps = method.prepBatches.map(card => card.instruction);
    return method;
  };
  for (const name of ['Chicken Shakshuka','Beef Breakfast Skillet','Creamy Chicken Parmesan','Tandoori Chicken','Garlic Butter Shrimp + Rice','Loaded Beef Cottage Pie','Harissa Honey Chicken','Loaded Buffalo Chicken Potato']) {
    removeUnmodeledCilantro12(batch12MethodsByName[name]);
  }

  // Batch 12 workflow controls. These stay attached to the recipe methods so
  // every future order mix renders from the same recipe-driven rules instead
  // of relying on one-off planner text.
  const parmesan12 = batch12MethodsByName['Creamy Chicken Parmesan'];
  const parmesanProtein12 = parmesan12.prepBatches.find(card => card.type === 'protein-portion');
  if (parmesanProtein12) parmesanProtein12.proteinForm = 'Whole thighs; trim and flatten only';

  const bbqProteinKeys12 = ['chicken_thigh_raw','garlic_powder','onion_powder','paprika','black_pepper','salt'];
  bbqMac12.proteinCook.recipeKeys = bbqProteinKeys12;
  bbqMac12.prepBatches[0] = prep('protein-portion', 'BBQ Mac chicken', 'Season this whole-thigh pull in the shared savory base, then split it into the labeled BBQ Mac pan.', bbqProteinKeys12, [
    'Use the displayed low-salt shared base. Garlic, onion, paprika, and pepper complement the BBQ dish.',
    'Do not add the higher Shakshuka or Enchilada salt finish to this pull.',
    'Keep thighs whole for seasoning and cooking; cut or shred only after the chicken reaches 165 F and rests.',
  ], {
    stage:'proteins',
    proteinForm:'Whole thighs; cut after cooking for BBQ Mac',
    seasoningFamily:'neutral-thigh-prep',
    seasoningFamilyName:'Shared savory thigh base',
    seasoningBaseForm:'Whole boneless skinless thighs',
    splitAfterSeasoning:true,
    poolStorage:false,
    seasoningFinishNote:'Keep the low-salt BBQ pull separate. Do not add the Shakshuka or Enchilada salt finish.',
  });
  const bbqIncorporatedIndex12 = bbqMac12.prepBatches.findIndex(card => card.componentRef === 'bbq-incorporated');
  if (bbqIncorporatedIndex12 >= 0) bbqMac12.prepBatches[bbqIncorporatedIndex12] = prep('mise-en-place', 'BBQ sauce added during Mac assembly', 'No Prep Day sauce work. Pour the displayed bottled BBQ sauce into the dish during Cook Day assembly.', ['bbq_sauce'], [
    'Use only the incorporated BBQ allocation shown on the Cook Day card.',
    'Keep the separate 30 g customer cups distinct from this incorporated allocation.',
  ], {componentRef:'bbq-incorporated', stage:'cook', consumesIngredients:false});
  bbqMac12.componentMap[0] = component('protein', 'Shared-base seasoned chicken thighs', bbqProteinKeys12, 'Cook whole to 165 F, rest, then cut or shred into the labeled BBQ Mac pan.');
  bbqMac12.prepSteps = bbqMac12.prepBatches.map(card => card.instruction);

  tikkaWrap12.prepSteps = tikkaWrap12.prepBatches.map(card => card.instruction);

  const whiteSaucePrep12 = (dishLabel, grams, delivery = 'cup') => prep('sauce', `White garlic-jalapeño yogurt sauce · ${dishLabel}`, 'Make this allocation as part of the one shared white garlic-jalapeño yogurt batch.', ['fage','lime','jalapeno','garlic'], [
    'Whisk or blend the measured yogurt, lime, jalapeño, and garlic until uniform.',
    delivery === 'cup'
      ? `Fill one sealed ${grams} g cup per meal; keep refrigerated.`
      : `Measure ${grams} g per order for incorporated assembly; do not fill a customer cup.`,
  ], {componentRef:'white-garlic-jalapeno-sauce', sharedSauceFamily:'jalapeno-lime-yogurt', sauceDelivery:delivery,
    sauceUse:delivery === 'cup' ? `Fill one ${grams} g cup per meal.` : `Use ${grams} g inside each order; no separate cup.`});

  const attachWhiteSauce12 = (method, dishLabel, grams, componentKeys) => {
    method.prepBatches = method.prepBatches.map(card => ({...card,
      excludeComponentRefs:[...new Set([...(card.excludeComponentRefs || []),'white-garlic-jalapeno-sauce'])],
    }));
    method.prepBatches.push(whiteSaucePrep12(`${dishLabel} cups`, grams));
    method.sideCups = Number(method.sideCups || 0) + 1;
    method.sideCup = {name:'White garlic-jalapeño yogurt sauce',batchGroup:'jalapeno-lime-yogurt',gramsPerMeal:grams,instruction:`Pack one sealed ${grams} g cup per meal.`};
    method.steps = [...(method.steps || []), `Pack one prepared ${grams} g white garlic-jalapeño yogurt sauce cup with every meal.`];
    method.plating = `${method.plating || ''}${method.plating ? ' ' : ''}Add one sealed ${grams} g white garlic-jalapeño yogurt sauce cup.`;
    for (const tier of Object.keys(method.assemblyGuide || {})) method.assemblyGuide[tier].push(`Add one sealed ${grams} g white garlic-jalapeño yogurt sauce cup.`);
    method.componentMap = [...(method.componentMap || []), component('cup','White garlic-jalapeño yogurt sauce',componentKeys,`Pack one separate sealed ${grams} g cup per meal.`)];
    method.prepSteps = method.prepBatches.map(card => card.instruction);
  };

  const shakshuka12 = batch12MethodsByName['Chicken Shakshuka'];
  attachWhiteSauce12(shakshuka12, 'Shakshuka', 30, ['fage','lime','jalapeno']);
  shakshuka12.prepBatches.push(prep('sauce', 'White garlic-jalapeño yogurt sauce · kitchen reserve', 'Make a fixed 100 g reserve in the same shared batch for drizzling and short fills.', [], [
    'Transfer 100 g into one sanitized labeled squeeze bottle after customer allocations are measured.',
    'Keep refrigerated. Use only as operational reserve; it is not an additional customer cup.',
  ], {sharedSauceFamily:'jalapeno-lime-yogurt', sauceDelivery:'reserve', sauceReserve:true, oncePerDish:true, sauceUse:'Hold 100 g in one sanitized squeeze bottle.', formulaIngredients:[
    {key:'fage',sourceKey:'fage',name:'FAGE Total 0%',unit:'g',fixedAmount:75.6757},
    {key:'lime',sourceKey:'lime',name:'Lime juice, raw',unit:'g',fixedAmount:13.5135},
    {key:'jalapeno',sourceKey:'jalapeno',name:'Jalapeño, raw',unit:'g',fixedAmount:8.1081},
    {key:'garlic',sourceKey:'garlic',name:'Garlic, raw',unit:'g',fixedAmount:2.7027},
  ]}));
  shakshuka12.prepSteps = shakshuka12.prepBatches.map(card => card.instruction);

  const southwest12 = batch12MethodsByName['Southwest Beef Taco Bowl'];
  southwest12.riceBatchGroup = 'cilantro-garlic-lime';
  southwest12.prepBatches = southwest12.prepBatches.map(card => {
    if (card.type === 'grain' || card.type === 'starch-ahead') return prep('starch-ahead', 'Southwest cilantro-garlic-lime rice share', 'Include this exact share in the one batch-wide cilantro-garlic-lime rice cook.', ['rice_dry','cilantro','garlic','lime'], [
      'Cook with the Tandoori and Shrimp rice shares in one measured pot.',
      'Record the finished yield, then divide proportionally into labeled destination pans.',
    ], {componentRef:'shared-cilantro-garlic-lime-rice', prepWave:'rice', prepWaveName:'One cilantro-garlic-lime rice cook'});
    if (card.type === 'sauce') return prep('sauce', 'White garlic-jalapeño yogurt sauce · Southwest cups', 'Make this as part of the shared white garlic-jalapeño yogurt batch.', ['fage','lime','jalapeno','garlic'], [
      'Whisk or blend the measured yogurt, lime, jalapeño, and garlic until uniform.',
      'Fill one sealed 37 g cup per Southwest meal; keep refrigerated.',
    ], {componentRef:'white-garlic-jalapeno-sauce', sharedSauceFamily:'jalapeno-lime-yogurt', sauceDelivery:'cup', sauceUse:'Fill one 37 g cup per meal.'});
    return card;
  });
  southwest12.sideCups = 1;
  southwest12.sideCup = {name:'White garlic-jalapeño yogurt sauce',batchGroup:'jalapeno-lime-yogurt',gramsPerMeal:37,instruction:'Pack one sealed 37 g cup per Southwest meal.'};
  southwest12.prepSteps = southwest12.prepBatches.map(card => card.instruction);

  const tandoori12 = batch12MethodsByName['Tandoori Chicken'];
  tandoori12.riceBatchGroup = 'cilantro-garlic-lime';
  tandoori12.prepBatches = tandoori12.prepBatches.map(card => {
    if (card.type === 'marinade') return {...card, excludeComponentRefs:[...new Set([...(card.excludeComponentRefs || []),'shared-cilantro-garlic-lime-rice'])]};
    if (card.type === 'starch-ahead' || card.type === 'grain') return prep('starch-ahead', 'Tandoori cilantro-garlic-lime rice share', 'Include this exact share in the one batch-wide cilantro-garlic-lime rice cook.', ['rice_dry','cilantro','garlic','lime'], [
      'Cook with the Southwest and Shrimp rice shares in one measured pot.',
      'Record the finished yield, then divide proportionally into labeled destination pans.',
    ], {componentRef:'shared-cilantro-garlic-lime-rice', prepWave:'rice', prepWaveName:'One cilantro-garlic-lime rice cook'});
    return card;
  });
  tandoori12.componentMap = [component('complete','Tandoori Chicken measured recipe',['leg_quarter_raw','rice_dry','cilantro','lime','broccoli','fage','lemon','garlic','ginger','paprika','cumin','coriander','sunflower_oil','salt'],'Follow the measured marinade, shared-rice, broccoli, and plating instructions; common garlic is split by its recipe component allocation.')];
  attachWhiteSauce12(tandoori12, 'Tandoori Chicken', 30, ['jalapeno']);
  tandoori12.prepSteps = tandoori12.prepBatches.map(card => card.instruction);

  const shrimp12 = batch12MethodsByName['Garlic Butter Shrimp + Rice'];
  shrimp12.riceBatchGroup = 'cilantro-garlic-lime';
  shrimp12.prepBatches = shrimp12.prepBatches.flatMap(card => {
    if (card.name === 'Shrimp vegetable rice') return [
      prep('starch-ahead', 'Shrimp cilantro-garlic-lime rice share', 'Include this exact share in the one batch-wide cilantro-garlic-lime rice cook.', ['rice_dry','cilantro','garlic','lime'], [
        'Cook with the Southwest and Tandoori rice shares in one measured pot.',
        'Record the finished yield, then divide proportionally into the labeled Shrimp rice pan.',
      ], {componentRef:'shared-cilantro-garlic-lime-rice', prepWave:'rice', prepWaveName:'One cilantro-garlic-lime rice cook'}),
      prep('vegetable-ahead', 'Shrimp peas-and-carrots rice finish', 'Drain and heat the peas and carrots, then fold them only into the Shrimp rice share after the common rice is divided.', ['canned_peas_carrots'], [
        'Drain and weigh the exact peas-and-carrots allocation.',
        'Heat until excess moisture is controlled, fold into the labeled Shrimp rice share, record the finished yield, rapid-cool, and refrigerate.',
      ], {prepWave:'hot-vegetables', prepWaveName:'Cooked vegetable finishes'}),
    ];
    if (card.type === 'sauce') return [{...card, excludeComponentRefs:[...new Set([...(card.excludeComponentRefs || []),'shared-cilantro-garlic-lime-rice'])]}];
    return [card];
  });
  shrimp12.componentMap = [component('complete','Garlic Butter Shrimp + Rice measured recipe',['shrimp_raw','rice_dry','cilantro','lime','canned_peas_carrots','zucchini','butter','garlic','lemon','cornstarch','salt'],'Follow the measured shared-rice, vegetable finish, shrimp sauce, and plating instructions; common garlic is split by its recipe component allocation.')];
  attachWhiteSauce12(shrimp12, 'Garlic Butter Shrimp', 30, ['fage','jalapeno']);
  shrimp12.prepSteps = shrimp12.prepBatches.map(card => card.instruction);

  const enchilada12 = batch12MethodsByName['Chicken Enchilada Bake'];
  attachWhiteSauce12(enchilada12, 'Chicken Enchilada Bake', 30, ['fage','lime','jalapeno','garlic']);

  const cottage12 = batch12MethodsByName['Loaded Beef Cottage Pie'];
  cottage12.steps = [
    'Brown the displayed raw beef to 160 F on Cook Day and drain thoroughly.',
    'Add the displayed drained peas and carrots, onion, tomato paste, oil, pepper, and salt. Cook until the filling is cohesive and excess moisture is gone; record the finished yield.',
    'Reheat the prepared packaged mash. Tare each container, portion the tier-specific mash first, add the tier-specific beef filling, then finish with mozzarella.',
    'Pack one prepared 45 g white garlic-jalapeño yogurt sauce cup with every meal and release to cold holding.',
  ];
  cottage12.plating = 'Tier-specific mash base, same-day beef-and-vegetable filling, mozzarella, and one 45 g white garlic-jalapeño yogurt cup.';
  cottage12.prepBatches = [
    prep('protein-portion', 'Raw Cottage Pie beef pull', 'Weigh the complete raw beef pull and keep it cold for Cook Day.', ['beef_90_raw'], [
      'Keep the beef ground and separately labeled.',
      'Do not cook this filling on Prep Day. Brown it to 160 F on Cook Day.',
    ], {proteinForm:'Ground beef'}),
    prep('starch-ahead', 'Cottage Pie packaged mash', 'Prepare the exact packaged instant-mash allocation today.', ['instant_potato_flakes','water','fairlife_milk','butter'], [
      'Follow the controlled package ratio.',
      'Record finished yield, rapid-cool, label, and refrigerate.',
    ], {prepWave:'instant-mash', prepWaveName:'One packaged-mash cook', formulaIngredients:[{key:'salt_mash',name:'Fine salt in packaged Cottage Pie mash',unit:'g',lean:1.3854,bulk:1.5113,includeInGrocery:false,sourceKey:'salt'}]}),
    prep('mise-en-place', 'Cottage Pie Cook Day filling kit', 'Stage the non-beef filling ingredients together for Cook Day without cooking the filling.', ['canned_peas_carrots','onion','tomato_paste','sunflower_oil','black_pepper'], [
      'Drain the peas and carrots, keep the diced onion cold, and stage tomato paste, oil, pepper, and filling salt.',
      'Add this complete measured kit only after the beef is browned to 160 F and drained.',
    ], {stage:'cook', consumesIngredients:false, formulaIngredients:[{key:'salt_filling',name:'Fine salt for Cottage Pie filling',unit:'g',lean:0.75,bulk:1,includeInGrocery:false,sourceKey:'salt'}]}),
    prep('cold-kit', 'Cottage Pie mozzarella finish', 'Stage the exact mozzarella allocations for Cook Day individual meal assembly.', ['mozzarella'], [
      'Keep the prepared mash, raw beef, filling kit, and mozzarella separate.',
      'On Cook Day, plate mash first, same-day beef filling over it, then mozzarella.',
    ], {prepWave:'cold-kits', prepWaveName:'Cold toppings and assembly kits'}),
    prep('sauce', 'White garlic-jalapeño yogurt sauce · Cottage Pie cups', 'Make this as part of the shared white garlic-jalapeño yogurt batch.', ['fage','lime','jalapeno','garlic'], [
      'Whisk or blend the measured yogurt, lime, jalapeño, and garlic until uniform.',
      'Fill one sealed 45 g cup per Cottage Pie meal; keep refrigerated.',
    ], {componentRef:'white-garlic-jalapeno-sauce', sharedSauceFamily:'jalapeno-lime-yogurt', sauceDelivery:'cup', sauceUse:'Fill one 45 g cup per meal.'}),
  ];
  cottage12.prepSteps = cottage12.prepBatches.map(card => card.instruction);
  cottage12.proteinCook = {
    name:'Cottage Pie beef filling', group:'beef', endpoint:'160 F', sequence:50,
    recipeKeys:['beef_90_raw','canned_peas_carrots','onion','tomato_paste','sunflower_oil','black_pepper','salt'],
    recipeSteps:cottage12.steps.slice(0,2), instructions:cottage12.steps.slice(0,2),
    lane:'stovetop', estimatedMinutes:25, prepDayComplete:false,
  };
  cottage12.cookDayEquipment = {lane:'stovetop',estimatedMinutes:25,sequence:50};
  cottage12.sideCups = 1;
  cottage12.sideCup = {name:'White garlic-jalapeño yogurt sauce',batchGroup:'jalapeno-lime-yogurt',gramsPerMeal:45,instruction:'Pack one sealed 45 g cup per Cottage Pie.'};
  cottage12.assemblyGuide = tierGuide(
    ['Place the Lean mash allocation first, add the same-day Lean beef filling, finish with mozzarella, and add one sealed 45 g white garlic-jalapeño yogurt cup.'],
    ['Place the Bulk mash allocation first, add the same-day Bulk beef filling, finish with mozzarella, and add one sealed 45 g white garlic-jalapeño yogurt cup.'],
  );
  cottage12.componentMap = [
    component('protein','Same-day beef-and-vegetable filling',['beef_90_raw','canned_peas_carrots','onion','tomato_paste','sunflower_oil','black_pepper'],'Cook on Cook Day to 160 F, drain, finish the filling, and record its yield.'),
    component('base','Packaged instant mash',['instant_potato_flakes','water','fairlife_milk','butter'],'Prepare on Prep Day to the controlled package ratio; portion into each container first.'),
    component('topping','Mozzarella',['mozzarella'],'Finish each individually plated meal after the beef filling.'),
    component('seasoning','Measured salt split',['salt'],'Use only the displayed filling-salt and packaged-mash salt allocations.'),
    component('cup','White garlic-jalapeño yogurt sauce',['fage','lime','jalapeno','garlic'],'Pack one separate sealed 45 g cup per meal.'),
  ];
  const batch12DishNames = {
    b1:'Egg Bites with Potato Hash', b2:'Chicken Shakshuka', b3:'French Toast', b4:'Beef Breakfast Skillet',
    m1:'Creamy Chicken Parmesan', m2:'BBQ Chicken Mac & Cheese', m3:'Southwest Beef Taco Bowl', m4:'Tandoori Chicken',
    m5:'Garlic Butter Shrimp + Rice', m6:'Chicken Enchilada Bake', m7:'Loaded Beef Cottage Pie',
    d1:'Baked Strawberry-Lemon Protein Cheesecake', d2:'Chocolate Oreo Mousse', d3:'Chocolate Peanut Butter Protein Brownie',
    a1:'Chicken Tikka Snack Wrap', a2:'PRPD Protein Box', a3:'Caprese Protein Pasta Box',
    x1:'Harissa Honey Chicken', x2:'Loaded Buffalo Chicken Potato',
  };
  data.batch = 12;
  data.version = '2026-09-24.2';
  data.meals = Object.fromEntries(Object.entries(batch12DishNames).map(([id,name]) => [id, JSON.parse(JSON.stringify(batch12MethodsByName[name]))]));
  data.methodsByName = {...data.methodsByName, ...batch12MethodsByName};
  data.dishNames = batch12DishNames;
  data.sharedProteinSeasoning = [];
  data.familyAllocations = [];
  data.familyPlatingReservations = [];
  data.productionExtras = [];
  data.rawProteinReserveByDish = {};
  data.groceryAdjustments = [
    {key:'canned_peas_carrots',name:'Canned peas and carrots',unit:'g',delta:-514,reason:'Batch 12 inventory substitution: replace the combined canned blend with equal drained sweet peas and sliced carrots.'},
    {key:'canned_peas',name:'Canned sweet peas, drained',unit:'g',delta:257,station:'Cold Prep & Produce',reason:'Batch 12 inventory substitution: use the owner\'s existing canned sweet peas.'},
    {key:'canned_carrots',name:'Canned sliced carrots, drained',unit:'g',delta:257,station:'Cold Prep & Produce',reason:'Batch 12 inventory substitution: buy one can of carrots and combine with equal drained sweet peas.'},
    {key:'small_tortilla',name:'Mission Carb Balance medium soft-taco tortilla',unit:'each',delta:-4,reason:'Batch 12 inventory substitution: use four existing large tortillas cut to fit in place of four medium Enchilada tortillas.'},
    {key:'large_tortilla',name:'Mission Carb Balance large tortilla',unit:'each',delta:4,reason:'Batch 12 inventory substitution: assign four extra existing large tortillas to the Enchilada pan.'},
  ];
  data.weeklySauces = {enabled:false,policy:'Batch 12 uses one recipe-controlled white garlic-jalapeño yogurt batch for Shakshuka, Southwest, Tandoori, Shrimp, Enchilada, Cottage Pie, the incorporated Tikka Wrap spread, and a fixed 100 g kitchen reserve. BBQ customer cups remain bottled sauce. There is no Sweet Heat batch.',cupSizeOz:2,eligibleMealIds:[],customerCupsTotal:0,kitchenUseCupsPerSauce:0,qcCupsPerSauce:0,sauces:[]};
  data.phases = [
    {title:'1. Confirm live Batch 12 counts',detail:'Import only active orders. Expand each Harissa/Buffalo Build-a-Week bundle into five individual Lean meals.'},
    {title:'2. Raw proteins and marinades',detail:'Weigh every exact protein pull. Keep bone-in Tandoori, shrimp, beef, Chicken Parmesan, Tikka marinade, and other recipe-specific chicken clearly separated.'},
    {title:'3. Produce, sauces, desserts, and measured egg work',detail:'Chop shared produce once by cut, make every exact sauce, and deposit Egg Bites at 60 g per standard well.'},
    {title:'4. Prep Day cooking',detail:'Complete safe make-ahead egg bites, potatoes, grains, sauces, desserts, and other displayed components. Cottage Pie filling remains raw until Cook Day. Record and rapid-cool every cooked yield.'},
    {title:'5. Cook Day proteins and assembly',detail:'Run long oven work first, cook chicken and beef in grouped waves, cook shrimp last, then assemble every exact SKU and tier.'},
    {title:'6. Customer pack-out',detail:'Pack one customer at a time, including every expanded bundle meal, Grab & Go item, topping, and required side cup.'},
  ];

  // Current identities must not inherit previous-week positional recipe slots.
  // Keep historical records above for provenance; this overlay uses exact names.
  const config13 = typeof module !== 'undefined' && module.exports ? require('../config/order-config') : globalThis.PRPD_ORDER_CONFIG;
  const production13 = typeof module !== 'undefined' && module.exports ? require('./nutrition/production-data') : globalThis.PRPD_PRODUCTION_DATA;
  if (config13?.batch?.number === 13 && production13?.batch === 13) {
    const copy13 = name => JSON.parse(JSON.stringify(data.methodsByName[name] || methodHistoryByName[name]?.at(-1)?.method || {}));
    const ids13 = Object.fromEntries(Object.entries(production13.meals).map(([id,recipe])=>[id,recipe.name]));
    const fallback13 = {};
    data.meals = Object.fromEntries(Object.entries(ids13).map(([id,name])=>{
      const method=copy13(fallback13[name] || name);
      method.recipeName=name;
      return [id,method];
    }));
    data.batch=13; data.version='2026-10-05.2'; data.dishNames=ids13;
    data.sharedProteinSeasoning=[]; data.familyAllocations=[]; data.familyPlatingReservations=[];
    data.productionExtras=[
      ['m4','Creamy Garlic Parmesan Salmon'],
      ['bw1','Butter Chicken'],
      ['m5','Boy Kibble'],
      ['m7','Beef Seekh Kabab Shawarma'],
    ].map(([dishId,label])=>({
      id:`batch13-owner-spare-${dishId}`,dishId,label:`Owner spare Lean ${label}`,
      ownerServings:1,tier:'lean',optional:true,enabled:false,
      note:`Make one additional Lean ${label} for owner inventory. This is not a customer order and receives no customer label.`,
      panPlan:'Include one extra Lean serving in the shared ingredient pull; pack and identify it separately from customer meals.',
      ingredients:production13.meals[dishId].tiers.lean.ingredients.map(ingredient=>({...ingredient,note:'One internal Lean spare, not a customer order.'})),
      packaging:[
        {key:'meal_container',name:'Meal container with lid',unit:'each',station:'Packaging',required:1},
        ...(production13.meals[dishId].ownerSauceAssignment || dishId==='m4' ? [{key:'sauce_cup',name:'2 oz sauce cup with lid',unit:'each',station:'Packaging',required:1}]:[]),
      ],
    }));
    data.extraPackaging=[
      {key:'parchment_roll',name:'Parchment paper rolls',unit:'each',station:'Packaging',required:2},
      {key:'aluminum_foil_roll',name:'Aluminum foil roll',unit:'each',station:'Packaging',required:1},
    ];
    data.rawProteinReserveByDish={}; data.groceryAdjustments=[];
    data.weeklySauces={enabled:false,selectedSauce:'PRPD Sweet Heat Sauce',assignmentStatus:'September 30 whole week assignments confirmed: Quesadilla, Power Bowl, Hot Pockets, beef Boy Kibble, Shawarma, both Nouman meals and steak. One 45 g cup each. Recipe-controlled quantities prevent a duplicate weekly multiplier.',eligibleMealIds:Object.entries(production13.meals).filter(([,r])=>r.ownerSauceAssignment).map(([id])=>id),sauces:[],policy:'Sauce ingredients are already in each recipe. Boy Kibble replaces three old condiment cups with one Sweet Heat cup. Lebanese chicken keeps its separate dressing too. No extra blanket batch.'};
    data.phases=[{title:'Batch 13 planning review',detail:'Use the latest synced customer counts. Production holds must be resolved before locking. Re-sync at cutoff.'}];
    const complete13 = (id,endpoint,cards,steps,assembly,options={})=>{
      const method=meal(5,50,['scale','probe thermometer'],endpoint,steps,assembly,
        'Rapid-cool in shallow pans. Record 135 F to 70 F within 2 hours and 41 F within 6 hours total; hold cold at 41 F or below.',{
          prepSteps:cards.map(c=>c.instruction),prepBatches:cards,
          assemblyGuide:Object.fromEntries(Object.keys(production13.meals[id].tiers).map(t=>[t,[assembly,'Count and pack the exact customer quantity. Record finished weight.']])),
          componentMap:cards.filter(c=>c.ingredientKeys.length).map(c=>component(c.type==='sauce'?'cup':c.type==='grain'?'base':'component',c.name,c.ingredientKeys,c.instruction)),
          ...options,
        });
      method.recipeName=ids13[id]; method.source='Controlled recipe registry and current recipe document. See production hold where present.';
      data.meals[id]=method;
      return method;
    };
    complete13('b1','Egg mixture fully set, 160 F.',[
      prep('measured-prep','Omelette ingredients','Measure eggs, whites, cheese, mushrooms, jalapeno, oil and salt.',['egg','egg_white','mozzarella','mushroom','jalapeno','sunflower_oil','salt'],['Keep egg mixture refrigerated. The source contains no chicken; public description needs correction before an omelette order is accepted.']),
      prep('garnish-kit','Omelette toast and tomato','Stage the tier-specific sourdough and tomato.',['sourdough_slice','tomato'],['Wash and slice tomatoes with clean tools. Toast bread at service.']),
    ],['Use the measured oil to soften vegetables, add egg and white mixture, cook fully and finish with cheese.','Toast the measured bread and add the cold tomato portion.'],
    'Lean: 2 eggs, 92 g whites and 1 toast. Bulk: 3 eggs, 138 g whites and 2 toast. Pack exact vegetables and cheese from the recipe.');
    complete13('d2','No-cook dessert. Hold at 41 F or below.',[
      prep('dessert','Chocolate Oreo mousse','Mix yogurt, chocolate whey, cocoa and honey smooth.',['fage','whey_chocolate','cocoa','honey'],['Weigh finished mousse and divide evenly. Refrigerate.']),
      prep('topping','Oreo Thins','Stage two cookies per serving.',['oreo_thin'],['Keep dry until finishing to preserve texture.']),
    ],['Finish each cold mousse with two Oreo Thins.','Record filled net weight, seal and refrigerate.'],
    'One exact mousse portion and two Oreo Thins per dessert.');
    complete13('d3','No-cook dessert. Hold at 41 F or below.',[
      prep('dessert','Cookie dough balls','Blend cottage cheese smooth and mix the exact protein, oats, peanut butter, honey and vanilla.',['cottage','whey','oats','peanut_butter','honey','vanilla'],['Record dough yield. Form three equal balls per full dessert serving.']),
      prep('topping','Chocolate coating','Melt and allocate 14 g chocolate per dessert serving.',['chocolate_chips'],['Record incorporated chocolate rather than counting unused bowl residue as consumed. Coat balls and chill until set.']),
    ],['Count three full-size balls per ordered dessert and verify the coating allocation.','Seal, label and refrigerate. Mini event bites are not this full-size order build.'],
    'Three chocolate-dipped balls per full dessert order.');
    complete13('m4','Fish 145 F; reheated leftovers 165 F.',[
      prep('protein-portion','Salmon Pilot 3 fish','Thaw refrigerated, drain, pat dry, check bones and record skin/trim loss. Weigh the exact fish, oil, salt and pepper pull.',['pink_salmon_raw','sunflower_oil','salt','black_pepper'],['Keep raw fish separate from ready-to-eat food. Refrigerate covered.']),
      prep('grain','Salmon plain rice','Use 40 g dry rice per Lean meal or 55 g per Bulk meal in the shared plain-rice cook.',['rice_dry'],['Owner confirmed rice instead of pasta. Record cooked yield and portion by dry-rice input shares. Cool rapidly.']),
      prep('vegetable-ahead','Salmon broccoli','Roast or steam separately, record yield and rapid-cool.',['broccoli'],['Keep separate from raw fish.']),
      prep('sauce','Salmon Alfredo, incorporated and extra cups','Make the same controlled Alfredo formula, including the extra side-cup input. Keep both allocations separate.',['heavy_cream','whole_milk','regular_cream_cheese','parmesan','butter','garlic','cornstarch','lemon_zest','parsley'],['Melt butter gently, soften garlic without browning. Whisk starch into cold milk. Add milk and cream, thicken gently, whisk cream cheese smooth, lower heat and fold zest and parsley. Do not boil after cheese.','Per meal, reserve 93.5 g Lean or 127 g Bulk raw sauce input for incorporation, plus 45 g extra same-ratio input for its side cup. These are not guaranteed finished fills. Record reduction and bowl loss, confirm enough sauce for all cups and incorporated portions, and close the yield hold before customer production. Taste and reheat approval is still required.'],{sauceDelivery:'incorporated-and-cup'}),
    ],['Roast salmon to 145 F, record edible cooked weight.','Reheat plain rice, broccoli and Alfredo gently. Portion from measured yields and pack the extra Alfredo cup.'],
    'Salmon with tier-specific 40 g Lean or 55 g Bulk dry-input rice, broccoli, incorporated Alfredo and one extra Alfredo cup. Old pasta macros are invalid.',{sideCups:1,sideCup:{name:'Same-recipe Alfredo sauce',batchGroup:'salmon-alfredo',gramsPerMeal:45,instruction:'Extra 45 g raw input reservation per meal; measure finished yield and approve actual fill before packing.'}});
    complete13('m3','Ground beef 160 F. Filled pocket reheat 165 F.',[
      prep('protein-portion','Hot Pocket filling pull','Weigh the beef, onion, ketchup and cheese separately for the cooked-down filling.',['beef_90_raw','onion','ketchup','mozzarella'],['Keep raw beef cold. Keep cheese separate until the cooked filling has cooled. Do not stuff raw or wet filling into dough.']),
      prep('protein-cook-ahead','Cook and chill Hot Pocket beef filling on Prep Day','Cook the measured beef and onion filling today; cool it completely before tomorrow’s assembly.',[],['Brown the measured beef and onion to 160 F, drain excess liquid, add the measured ketchup and salt, and record finished filling weight.','Rapid-cool in shallow pans, cover, label and refrigerate at 41 F or below. Keep the measured mozzarella separate.'],{consumesIngredients:false,workflowOnly:true}),
      prep('measured-prep','Cook Day Hot Pocket dough · 28-pocket pilot','Mix and shape the source-adapted dough on Cook Day, not overnight.',['flour','water','butter','granulated_sugar','instant_yeast','salt'],['For 28 pockets, measure 1,260 g AP flour plus up to 35 g bench flour, 795 g cold water, 200 g cold unsalted butter, 42 g sugar, 21 g instant yeast and 25 g table salt. Record actual bench flour used.','Mix the dry ingredients, rub in cold butter, then add water gradually until cohesive. Rest chilled 20 minutes to 4 hours. Divide into 28 approximately 84 g pieces before bench flour.','Roll each piece thin, add only cooled dry filling and measured mozzarella, seal edges with water and a fork, and vent tops. Bake at 400 F until golden and cooked through; check actual timing for these larger PRPD pockets.'],{stage:'cook',consumesIngredients:false}),
    ],['Use the cooked, chilled filling from Prep Day; verify its recorded yield.','Bake the 28 filled pockets from the Cook Day dough card. Probe the filling for 165 F on reheat and record actual baked piece weights.'],
    'Form two finished pockets per Lean meal and three per Bulk meal, 28 total for the current batch. The King Arthur pizza-pocket dough is an untested PRPD adaptation; do not update customer labels from these pilot macros.');
    const sweetChili13=data.meals.bw2;
    const sweetChiliRice13=sweetChili13.prepBatches.find(card=>card.type==='grain');
    sweetChiliRice13.name='Sweet Chili plain rice';
    sweetChiliRice13.instruction='Weigh the plain-rice allocation and keep vegetables out of this rice.';
    sweetChiliRice13.ingredientKeys=['rice_dry'];
    sweetChiliRice13.steps=['Weigh the tier-specific dry rice.', 'Cook as plain rice in the coordinated grain wave, record cooked yield, and cool promptly.'];
    sweetChiliRice13.prepWave='rice';
    sweetChiliRice13.prepWaveName='One shared plain-rice cook';
    sweetChiliRice13.workBatchGroup='plain-rice';
    sweetChili13.riceBatchGroup='common';
    sweetChili13.steps=['Cook and record the plain rice yield.','Roast thighs at 400 F to 165 F and record cooked yield. Heat the measured garlic-sweet-chili glaze and coat the cooked chicken.','Plate the exact tier chicken and plain rice.'];
    sweetChili13.plating='Pack the tier-specific sweet-chili chicken and plain rice. No peas or carrots in the rice.';
    sweetChili13.assemblyGuide={lean:[sweetChili13.plating],bulk:[sweetChili13.plating]};
    sweetChili13.componentMap.forEach(card=>{card.ingredientKeys=card.ingredientKeys.filter(key=>key!=='mixed_vegetables');});
    sweetChili13.prepSteps=sweetChili13.prepBatches.map(card=>card.instruction);
    // The dashboard groups physical kitchen actions, not recipe-card names.
    // Split the inherited mixed side card so its broccoli can join every other
    // compatible broccoli allocation while the potatoes remain one potato job.
    const loadedBuffalo13=data.meals.m2;
    const loadedSideIndex13=loadedBuffalo13.prepBatches.findIndex(card=>card.ingredientKeys?.includes('potato') && card.ingredientKeys?.includes('broccoli'));
    if(loadedSideIndex13>=0) {
      const loadedSide13=loadedBuffalo13.prepBatches[loadedSideIndex13];
      loadedBuffalo13.prepBatches.splice(loadedSideIndex13,1,
        prep('starch-ahead','Loaded Buffalo roasted potatoes','Roast the measured potato allocation in the coordinated potato block.',['potato'],[
          'Cut the potatoes into even pieces. Use the displayed Loaded Buffalo side oil and salt across its vegetable trays.',
          'Roast until browned and tender, record the finished potato yield, rapid-cool and refrigerate.',
        ],{formulaIngredients:loadedSide13.formulaIngredients || [],prepWave:'roasted-potatoes',prepWaveName:'One roasted-potato cook',workBatchGroup:'roasted-potatoes',workBatchName:'Roasted potatoes · one batch',workOperation:'roast',ovenTemperatureF:400}),
        prep('vegetable-ahead','Loaded Buffalo broccoli','Add this broccoli to the shared broccoli roast.',['broccoli'],[
          'Cut into even florets and keep the Loaded Buffalo destination labeled.',
          'Roast with the shared broccoli batch to tender-crisp; record the combined yield before dividing.',
        ],{prepWave:'broccoli',prepWaveName:'One shared broccoli roast',workBatchGroup:'roasted-broccoli',workBatchName:'Broccoli · one shared roast',workOperation:'roast',ovenTemperatureF:400})
      );
      loadedBuffalo13.prepSteps=loadedBuffalo13.prepBatches.map(card=>card.instruction);
    }
    for(const id of ['m4','m6','m8']) {
      const broccoliCard=data.meals[id].prepBatches?.find(card=>card.type==='vegetable-ahead' && card.ingredientKeys?.includes('broccoli'));
      if(!broccoliCard) continue;
      Object.assign(broccoliCard,{prepWave:'broccoli',prepWaveName:'One shared broccoli roast',workBatchGroup:'roasted-broccoli',workBatchName:'Broccoli · one shared roast',workOperation:'roast',ovenTemperatureF:400});
      broccoliCard.instruction='Add this allocation to the one shared 400 F broccoli roast.';
    }
    const quesadillaChicken13=data.meals.b3.prepBatches.find(card=>card.type==='marinade');
    Object.assign(quesadillaChicken13,{
      seasoningFamily:'neutral-thigh-prep',seasoningFamilyName:'Shared savory thigh base',
      seasoningBaseForm:'Whole boneless skinless thighs',splitAfterSeasoning:true,
      proteinForm:'Whole thighs; cut after cooking',
      seasoningFinishNote:'Cook the labeled pull, then dice for quesadillas.',
    });
    quesadillaChicken13.steps=['Season the compatible whole thighs in the shared savory base. Split and label the exact Quesadilla pull after seasoning.','Keep cold for Cook Day. Cook to 165 F, then dice for quesadillas. Do not add the shared spices a second time.'];
    const seekhShape13=data.meals.m7.prepBatches.find(card=>card.type==='marinade');
    Object.assign(seekhShape13,{
      pieceNoun:'kebab',pieceTargets:{
        lean:{piecesPerServing:1,gramsPerPiece:178.5,label:'170 g beef + 8.5 g Shan'},
        bulk:{piecesPerServing:1,gramsPerPiece:220.5,label:'210 g beef + 10.5 g Shan'},
      },
      pieceWeightNote:'Weights include beef and dry Shan mix. Weigh the complete mixed beef, divide by the displayed piece count and keep Lean and Bulk separate.',
    });
    seekhShape13.steps=['Mix the exact measured beef and Shan Seekh powder: 50 g Shan per 1 kg raw beef. No extra salt, oil, suet or butter.','Shape one short kebab per meal: 178.5 g raw mixed Lean or 220.5 g raw mixed Bulk. Include the separate owner Lean spare. Weigh every piece; do not average Lean and Bulk together.','Cover and refrigerate for the next-day bake. Record the formed piece count and any mixture left in the bowl.'];
    const cookie13=data.meals.d3;
    cookie13.prepBatches.find(card=>card.type==='dessert').steps=[
      'Grind the measured oats to a fine flour. Blend the measured cottage cheese until smooth.',
      'Mix oat flour, cottage cheese, protein powder, peanut butter, honey and vanilla until no dry patches remain. Chill until firm enough to shape; record the complete dough weight.',
      'Divide the dough evenly into three medium balls for each ordered serving. Weigh the balls and refrigerate on parchment before dipping.',
    ];
    const cookieCoating13=cookie13.prepBatches.find(card=>card.type==='topping');
    cookieCoating13.stage='ahead';
    cookieCoating13.steps=['Melt the measured mini chocolate chips gently, stirring until smooth. The 14 g per serving is the total coating allocation, not an additional mix-in.','Dip or drizzle the chilled balls; record actual chocolate used. Set on parchment, chill until firm, then pack three balls per serving in a small food-safe dessert box.'];
    const tiramisu13=data.meals.d1;
    tiramisu13.prepBatches[0].name='Complete High Protein Tiramisu cups — Prep Day';
    tiramisu13.prepBatches[0].instruction='Make and layer complete tiramisu cups on Prep Day so they chill overnight. This is not just a cream-prep task.';
    tiramisu13.prepSteps=tiramisu13.prepBatches.map(card=>card.instruction);
    // Exact Lebanese component splits, kept separate from the raw marinade.
    complete13('p3','Chicken breast 165 F.',[
      prep('marinade','Lebanese chicken','Use 300 g raw breast per meal and only the recipe marinade.',['chicken_breast_raw','paprika','cumin','lemon','garlic','sunflower_oil','black_pepper','salt'],['Weigh and marinate cold without sumac. Refrigerate covered.'],{componentRef:'lebanese-marinade'}),
      prep('sauce','Lebanese lemon-garlic dressing','Measure the separate dressing. No contact with raw chicken.',['lemon','garlic','sunflower_oil','black_pepper','salt'],['Whisk clean dressing, record yield, divide into three sealed cups. Source inputs total 14.35 g per meal, not 15 g; do not invent topping-up oil.'],{componentRef:'lebanese-dressing'}),
    ],['Cook the marinated breast to 165 F and record yield.','Target 225 g edible cooked chicken per meal; document any shortage instead of silently reducing portions.'],
    'Pack one chicken container, one measured lemon-garlic dressing cup, and one Sweet Heat cup per meal. No salad.',{sideCups:1,sideCup:{name:'Lemon-garlic dressing',batchGroup:'nouman-lemon-dressing',gramsPerMeal:14.35,instruction:'Pack the source formula, 14.35 g input allocation per meal; record actual finished yield.'}});
    // Shared ingredient keys belong to one component map even when raw/cold
    // prep cards split their exact amounts with allocation references.
    data.meals.p3.componentMap=[component('protein','Lebanese chicken and separate dressing',['chicken_breast_raw','paprika','cumin','lemon','garlic','sunflower_oil','black_pepper','salt'],'Use explicit marinade/dressing allocations. Never reuse marinade.')];
    complete13('p1','Ground beef 160 F; reheated leftovers 165 F.',[
      prep('protein-mix','Lower-spice Nouman kofta','Use the measured 96/4 beef, reduced Shan and dry squeezed onion. No yogurt or added water.',['beef_96_raw','shan_seekh','onion','garlic','ginger','cilantro'],['Record the actual beef grade and retained onion pulp. Knead cold until tacky and cohesive, chill 45-60 minutes.','Use the separate 5% reserve for a QC cook before forming the customer logs. Do not consume a customer log.']),
      prep('vegetable-ahead','Nouman roasted vegetables','Roast the zucchini, green pepper and side red onion without added oil.',['zucchini','green_bell_pepper','red_onion'],['Record yield and divide into three customer portions.']),
      prep('sauce','Nouman Sweet Heat cups','Use the owner-selected sriracha Sweet Heat formula.',['light_mayo','ketchup','honey','sriracha'],['Mix the controlled ratio, tare and seal three 45 g customer cups. Keep the separately listed QC cup out of customer portions.']),
    ],['Cook the separate QC portion first. Confirm heat, salt, cohesion and juiciness before the customer batch.','Bake the 15 shaped customer logs on a lined tray to 160 F. Do not add a pan-oil coating or overcook to chase crispness.','Record raw mixture, log weights, cooked yield and next-day QC reheat.'],
    'Five kofta logs plus one roasted vegetable portion and one separate sealed 45 g Sweet Heat cup per meal.',{sideCups:1,sideCup:{name:'PRPD Sweet Heat Sauce',batchGroup:'sweet-heat',gramsPerMeal:45,instruction:'One sealed 45 g cup per kofta meal.'}});
    const koftaShape13=data.meals.p1.prepBatches.find(card=>card.type==='protein-mix');
    Object.assign(koftaShape13,{
      pieceNoun:'kofta log',pieceTargets:{lean:{piecesPerServing:5,gramsPerPiece:75.1,label:'pre-squeeze benchmark'}},
      pieceWeightNote:'The 75.1 g figure includes 330 g beef and all mix-ins before onion moisture is squeezed out. Weigh the actual retained customer mixture after squeezing, then divide that number by 15 for the real raw log target. Keep the separate QC reserve out of those 15 logs.',
    });
    koftaShape13.steps=['Squeeze grated onion dry and weigh the retained pulp. Mix with measured beef, reduced Shan, garlic, ginger and cilantro; no yogurt or water.','Cook a small QC portion from the separate reserve on Prep Day. Confirm heat, salt and cohesion. Then weigh the customer mixture and divide by 15 for the exact raw weight per log.','Shape 15 short customer logs, five per meal, about 1.5–2 cm thick. Record actual log weights, cover and refrigerate for Cook Day.'];
    complete13('m8','Intact steak at least 145 F, rest 3 minutes; reheated leftovers 165 F.',[
      prep('protein-portion','NY Strip steak portions','Weigh 240 g raw Lean or 300 g raw Bulk steak and the measured garlic, oil and salt.',['ny_strip_raw','garlic','sunflower_oil','salt'],['Keep steaks covered, labeled and refrigerated. Do not substitute steak bites or beef strips.']),
      prep('starch-ahead','NY Strip instant mash','Prepare the package-ratio mash to 200 g per meal.',['instant_potato_flakes','water','fairlife_milk','butter'],['Measure every dry and wet input. Record finished mash yield and cool rapidly.']),
      prep('vegetable-ahead','Steak broccoli','Roast broccoli separately and record yield.',['broccoli'],['Lean 100 g raw; Bulk 125 g raw.']),
      prep('sauce','Steak Sweet Heat cups','Prepare and fill one separate 45 g net Sweet Heat cup per meal.',['light_mayo','ketchup','honey','sriracha'],['Mix the controlled ratio, tare cups, seal, count and refrigerate.']),
    ],['Sear or grill the measured intact steaks in uncrowded batches. Verify at least 145 F and rest 3 minutes.','Record trimmed edible cooked yield. Reheat the measured mash and broccoli, then plate.'],
    'Pack the tier-specific steak allocation, 200 g prepared mash, broccoli and one sealed 45 g Sweet Heat cup.',{sideCups:1,sideCup:{name:'PRPD Sweet Heat Sauce',batchGroup:'sweet-heat',gramsPerMeal:45,instruction:'One sealed 45 g net cup per steak meal.'}});
    const steak13=data.meals.m8;
    const steakSalt13={lean:.75,bulk:1};
    const mashSaltPerMeal13=200*1.5/(34.5+157.7+30.5+14+1.5);
    const steakProtein13=steak13.prepBatches.find(card=>card.type==='protein-portion');
    const steakMash13=steak13.prepBatches.find(card=>card.ingredientKeys?.includes('instant_potato_flakes'));
    const steakBroccoli13=steak13.prepBatches.find(card=>card.type==='vegetable-ahead' && card.ingredientKeys?.includes('broccoli'));
    steakProtein13.ingredientAmounts={...(steakProtein13.ingredientAmounts || {}),salt:steakSalt13};
    steakMash13.ingredientKeys=[...new Set([...steakMash13.ingredientKeys,'salt'])];
    steakMash13.ingredientAmounts={...(steakMash13.ingredientAmounts || {}),salt:{lean:mashSaltPerMeal13,bulk:mashSaltPerMeal13}};
    Object.assign(steakMash13,{prepWave:'instant-mash',prepWaveName:'One packaged instant-mash cook',workBatchGroup:'package-ratio',workBatchName:'Packaged instant mash · one batch'});
    Object.assign(steakBroccoli13,{prepWave:'broccoli',prepWaveName:'One shared broccoli roast',workBatchGroup:'roasted-broccoli',workBatchName:'Broccoli · one shared roast',workOperation:'roast',ovenTemperatureF:400,
      instruction:'Add this allocation to the one shared 400 F broccoli roast.'});
    steakMash13.steps=[
      'Weigh the displayed water, butter, mash salt, milk and potato flakes. Keep the milk and flakes beside the stove.',
      'Heat the water, butter and mash salt to a boil, then remove the pot from the heat.',
      'Stir in the measured milk and potato flakes. Let stand 2 minutes, then whip with a fork or spoon until even. Do not add unmeasured liquid.',
      'Weigh and record the finished mash yield, rapid-cool in a shallow labeled pan and refrigerate.',
    ];
    for(const row of steak13.componentMap) row.ingredientKeys=row.ingredientKeys.filter(key=>key!=='salt');
    steak13.componentMap.push(component('seasoning','Measured steak and mash salt',['salt'],'Use 0.75 g Lean or 1 g Bulk on the steak and the separately displayed package-ratio salt in the mash.'));
    steak13.prepSteps=steak13.prepBatches.map(card=>card.instruction);
    // Reserve seasoning and one Sweet Heat QC cup separately. The 49.5 g beef
    // reserve is already provided by the normal 5% raw-protein buffer.
    data.groceryAdjustments=[
      ['shan_seekh',1.5],['onion',3.75],['garlic',.75],['ginger',.3],['cilantro',.5],
      ['light_mayo',45*250/1020],['ketchup',45*300/1020],['honey',45*300/1020],['sriracha',45*170/1020],
    ].map(([key,delta])=>({key,name:production13.meals.p1.tiers.lean.ingredients.find(i=>i.key===key)?.name || key,unit:'g',delta,reason:'Batch 13 Nouman separate QC reserve, not extra customer portions.'}));
    // Expand the 300 g drained house-pickle requirement into the recorded
    // first-test refrigerator-pickle base. The final drained yield is a cook
    // check; these are shopping inputs, not a claim of tested yield.
    data.groceryAdjustments.push(
      {key:'pickles',unit:'g',delta:-300,reason:'Replace finished house pickles with raw first-test inputs.'},
      {key:'red_onion',name:'Red onion, raw',unit:'g',delta:225,reason:'House-pickle vegetable reserve.'},
      {key:'carrot',name:'Carrot, raw',unit:'g',delta:225,reason:'House-pickle vegetable reserve.'},
      {key:'jalapeno',name:'Jalapeno, raw',unit:'g',delta:20,reason:'House-pickle vegetable reserve.'},
      {key:'white_vinegar',name:'5%-acidity white vinegar',unit:'g',delta:240,reason:'One-cup house-pickle brine base.'},
      {key:'water',name:'Water',unit:'g',delta:240,reason:'One-cup house-pickle brine base.'},
      {key:'pickling_salt',name:'Pickling salt',unit:'g',delta:18,reason:'One-tablespoon house-pickle brine base.'},
      {key:'granulated_sugar',name:'Granulated sugar',unit:'g',delta:12,reason:'One-tablespoon house-pickle brine base.'},
    );
    data.meals.m7.prepBatches.push(prep('measured-prep','House refrigerator pickles — Prep Day',
      'First-test refrigerated batch for shawarma. Prepare at least one day before serving; verify 300 g drained yield.',[],[
        'Wash and thinly slice 225 g red onion, 225 g carrot and 20 g jalapeño. Pack into clean food-safe jars with about 1/2 inch headspace.',
        'Simmer 240 g verified 5%-acidity white vinegar, 240 g water, 18 g pickling salt and 12 g sugar just until dissolved. Pour warm brine over the vegetables to cover; close with clean lids and refrigerate immediately. Do not reduce vinegar or increase water.',
        'Hold refrigerated 1 to 3 days for flavor. Before shawarma assembly, drain and weigh the vegetables; confirm at least 300 g finished. If short, resolve the shortage before packing. Do not reuse vegetable-contact brine.',
        'Keep Tania’s shawarma separate and pickle-free. These are refrigerator pickles, never shelf-stable. Record the cold-holding check and actual drained yield.',
      ],{oncePerDish:true,formulaIngredients:[
        {key:'pickles',name:'Finished house pickles, drained target',fixedAmount:300,unit:'g',includeInGrocery:false},
        {key:'red_onion',name:'Red onion, raw',fixedAmount:225,unit:'g',includeInGrocery:false},
        {key:'carrot',name:'Carrot, raw',fixedAmount:225,unit:'g',includeInGrocery:false},
        {key:'jalapeno',name:'Jalapeno, raw',fixedAmount:20,unit:'g',includeInGrocery:false},
        {key:'white_vinegar',name:'5%-acidity white vinegar',fixedAmount:240,unit:'g',includeInGrocery:false},
        {key:'water',name:'Water',fixedAmount:240,unit:'g',includeInGrocery:false},
        {key:'pickling_salt',name:'Pickling salt',fixedAmount:18,unit:'g',includeInGrocery:false},
        {key:'granulated_sugar',name:'Granulated sugar',fixedAmount:12,unit:'g',includeInGrocery:false},
      ]}));
    // A current one-wrap order must not retain last week's two-wrap wording.
    const tikka13=data.meals.a3;
    complete13('m5','Ground beef 160 F; reheated leftovers 165 F.',[
      prep('protein-portion','Boy Kibble beef build','Latest owner confirmation restores the source: 210 g raw Lean or 300 g raw Bulk 90/10 beef.',['beef_90_raw','onion','garlic','salt','sweet_chili','soy_sauce'],['Keep raw beef refrigerated. Brown to 160 F, drain, add measured onion, garlic and incorporated sweet-chili/soy finish. Record yield.']),
      prep('grain','Boy Kibble rice','Allocate 40 g dry rice per tier in the shared plain-rice cook.',['rice_dry'],['Record cooked yield and divide by dry input shares. Cool rapidly.']),
      prep('garnish-kit','Boy Kibble cold toppings','Stage the measured tomato, lettuce and mozzarella.',['tomato','lettuce','mozzarella'],['Wash and dry produce with clean tools. Keep cold components separate from raw meat.']),
      prep('sauce','Boy Kibble sauce assignment pending','Historical source assumes 15 g light mayo, 15 g ketchup and 5 g mustard as separate sauce allocations.',['light_mayo','ketchup','mustard'],['Three source cups are provisional reservations only. Apply the owner-approved weekly sauce matrix before preparing or finalizing cups. Do not carry the removed chicken or white-garlic interpretation forward.']),
    ],['Cook and drain measured beef to 160 F and add the source recipe finish.','Plate tier-specific beef, measured rice, tomato, lettuce and cheese. Pack the owner-confirmed sauce after the weekly assignment is recorded.'],
    'Lean 210 g raw beef, Bulk 300 g; each 40 g dry rice, 50 g tomato, 30 g mozzarella and 30 g lettuce. Sauce assignment pending owner confirmation.',{sideCups:3});
    // The Produce table already carries the exact cold-topping cuts and splits.
    // Do not create a second empty/duplicative cold-kit card for Boy Kibble.
    data.meals.m5.prepBatches=data.meals.m5.prepBatches.filter(card=>card.name!=='Boy Kibble cold toppings');
    data.meals.m5.prepSteps=data.meals.m5.prepBatches.map(card=>card.instruction);
    // Only ready-to-eat additions belong here. Tomato cooked into biryani or
    // sauce is not a raw-tomato finish and must stay in the base recipe.
    for(const id of ['b1','m5','a2','a3']) {
      data.meals[id].customerOmissionRules={...(data.meals[id].customerOmissionRules || {}),rawTomato:{ingredientKey:'tomato',action:'Omit the raw tomato from this customer portion. Keep it out of the cold topping or salad kit.'}};
    }
    data.meals.m7.customerOmissionRules={pickles:{ingredientKey:'pickles',action:'Omit pickles from this customer shawarma. Assemble and label it separately.'}};
    // The current controlled Hot Pocket filling has no pickle quantity, but
    // preserve the customer restriction when the held final filling is set.
    data.meals.m3.customerOmissionRules={pickles:{action:'No pickles in this customer Hot Pocket filling, including any finalized recipe change.'}};
    data.meals.p3.extraPackagingPerMeal=[];
    data.meals.p1.extraBatchPackaging=[{key:'sauce_cup',name:'Separate Sweet Heat QC cup with lid',qty:1}];
    const oneWrap13=s=>typeof s==='string'?s.replace(/two (?:mini )?wraps|two tortillas|two-wrap order/gi,'one wrap'):s;
    const walk13=o=>{for(const k of Object.keys(o || {})){if(typeof o[k]==='string')o[k]=oneWrap13(o[k]);else if(o[k] && typeof o[k]==='object')walk13(o[k]);}};
    walk13(tikka13);
    // Do not carry undocumented neutral bases into formula-only Harissa glaze.
    const harissa13=data.meals.m6;
    harissa13.prepBatches[0]=prep('marinade','Harissa honey chicken and glaze','Coat the exact chicken pull with the complete measured glaze. There is no additional neutral base.',
      ['chicken_thigh_raw','harissa','honey','tomato_paste','lemon','garlic','sunflower_oil','paprika','coriander','salt'],['Mix the complete measured glaze, coat, cover, label and refrigerate.']);
    harissa13.prepSteps[0]=harissa13.prepBatches[0].instruction;
    harissa13.componentMap[0].handling=harissa13.prepBatches[0].instruction;
    harissa13.prepBatches[2].steps=['Cut broccoli, keep separate from raw chicken, roast to tender-crisp and record yield.'];
    harissa13.prepBatches[2].instruction='Cut the exact broccoli pull and stage separately.';
    harissa13.prepSteps[2]=harissa13.prepBatches[2].instruction;
    // The owner assignment is generated from the same registry as ingredients.
    // Explicit component splits prevent shared mayo/ketchup from being counted
    // twice in Shawarma spread or Hot Pocket filling and the separate cup.
    for (const [id,source] of Object.entries(production13.meals)) {
      const assignment=source.ownerSauceAssignment;
      if (!assignment) continue;
      const method=data.meals[id],ref=assignment.componentRef;
      const cupKeys=['light_mayo','ketchup','honey','sriracha'];
      const replacing=assignment.replacesHistoricalCups;
      const alreadySweetHeat=['b4','p1','m8'].includes(id);
      method.prepBatches=method.prepBatches.filter(card=>
        !/Sweet Heat|Boy Kibble sauce assignment pending/.test(card.name));
      method.prepBatches=method.prepBatches.map(card=>({...card,
        excludeComponentRefs:[...new Set([...(card.excludeComponentRefs || []),ref])],
      }));
      method.prepBatches.push(prep('sauce','PRPD Sweet Heat cups','Make one shared measured Sweet Heat batch for all assigned meals and internal spares.',cupKeys,[
        'Use 250:300:300:170 light mayo:ketchup:honey:sriracha by weight.',
        'Pack one 45 g net cup per assigned meal. Tare, seal, count and refrigerate. The separate QC cup is not a customer portion.',
      ],{componentRef:ref,sharedSauceFamily:'sweet-heat',sauceDelivery:'cup',sauceUse:'One separate 45 g cup per meal.'}));
      method.sideCups=replacing?1:Number(method.sideCups || 0)+(alreadySweetHeat?0:1);
      method.sideCup={...assignment,instruction:'Pack one separate sealed 45 g net Sweet Heat cup per meal.'};
      const instructions=replacing?[
        'Brown the measured beef to 160 F, drain, and add the measured sweet-chili/soy finish.',
        'Plate the tier-specific rice, beef, tomato, lettuce and mozzarella.',
      ]:(method.steps || []);
      method.steps=[...instructions,'Pack one sealed 45 g Sweet Heat cup. Keep any recipe-specific incorporated sauce and the Lebanese lemon-garlic dressing unchanged.'];
      method.plating=(replacing?'Tier-specific beef, rice, tomato, lettuce and mozzarella.':method.plating || '')+' Pack one sealed 45 g Sweet Heat cup.';
      for (const guide of Object.values(method.assemblyGuide || {})) {
        if (replacing) guide.splice(0,guide.length,method.plating);
        else guide.push('Pack one sealed 45 g Sweet Heat cup.');
      }
      const lines=Object.values(source.tiers).flatMap(t=>t.ingredients);
      const mainKeys=new Set(lines.filter(i=>i.amount-(i.allocations?.[ref] || 0)>.001).map(i=>i.key));
      method.componentMap=(method.componentMap || []).map(card=>({...card,
        ingredientKeys:card.ingredientKeys.filter(k=>mainKeys.has(k)),
      })).filter(card=>card.ingredientKeys.length);
      const owned=new Set(method.componentMap.flatMap(c=>c.ingredientKeys));
      method.componentMap.push(component('cup','Sweet Heat side cup, with explicit shared-ingredient splits',cupKeys.filter(k=>!owned.has(k)),
        'Pack one 45 g cup. Any mayo or ketchup also present in the main recipe is split using the batch13-sweet-heat ingredient allocation, never duplicated.'));
      method.componentMap=method.componentMap.filter(c=>c.ingredientKeys.length);
      method.prepSteps=method.prepBatches.map(c=>c.instruction);
    }
    for(const [id,method] of Object.entries(data.meals)) {
      const keys=new Set(Object.values(production13.meals[id].tiers).flatMap(t=>t.ingredients.map(i=>i.key)));
      if(!keys.has('cilantro')) {
        for(const card of [...(method.componentMap || []),...(method.prepBatches || [])]) card.ingredientKeys=card.ingredientKeys.filter(k=>k!=='cilantro');
        method.prepBatches=(method.prepBatches || []).filter(c=>c.ingredientKeys.length || c.formulaIngredients?.length || c.workflowOnly);
        method.componentMap=(method.componentMap || []).filter(c=>c.ingredientKeys.length);
      }
      method.validation=production13.meals[id].productionHold || method.validation || '';
    }
    for (const extra of data.productionExtras) {
      const firstCard=data.meals[extra.dishId]?.prepBatches?.[0];
      if (firstCard) firstCard.showProductionExtras=true;
    }
    // Cup identity and workflow belong to recipes/components, not rotating
    // menu slot checks in renderers. Both shopping and kitchen use this data.
    for (const [id,method] of Object.entries(data.meals)) {
      method.sideCupComponents=method.sideCups===1 && method.sideCup ? [{...method.sideCup,cupsPerMeal:1}] : [];
      for (const card of method.prepBatches || []) {
        card.flavorCategory=/dessert/i.test(production13.meals[id]?.category || '')
          || card.ingredientKeys?.includes('maple_syrup') ? 'sweet' : 'savory';
      }
    }
    data.meals.b2.sideCupComponents=[
      {name:'Blueberry cheesecake topping',batchGroup:'blueberry-cheesecake',cupsPerMeal:1,weightBasis:'measured-yield'},
      {name:'Pancake syrup',batchGroup:'pancake-syrup',cupsPerMeal:1,gramsPerMeal:30},
    ];
    const pancakeBatter=data.meals.b2.prepBatches.find(card=>card.type==='measured-prep');
    const pancakeToppingKeys=['blueberry','reduced_cream_cheese','powdered_sugar'];
    pancakeBatter.name='Pancake batter';
    pancakeBatter.ingredientKeys=pancakeBatter.ingredientKeys.filter(key=>!pancakeToppingKeys.includes(key));
    pancakeBatter.ingredientAmounts={fage:{lean:80,bulk:100}};
    pancakeBatter.steps=['Keep wet and dry batter ingredients separate and refrigerated until griddling.'];
    pancakeBatter.instruction=pancakeBatter.steps[0];
    data.meals.b2.prepBatches.push(prep('topping','Blueberry cheesecake topping','Make one combined topping cup per meal.',
      [...pancakeToppingKeys,'fage'],[
        'Cook blueberries to a thick compote; cool. Mix cream cheese, powdered sugar and the displayed yogurt.',
        'Weigh finished compote and cheesecake mixture. Divide into one combined topping cup per meal.',
      ],{ingredientAmounts:{fage:{perServing:20}},flavorCategory:'sweet'}));
    data.meals.m3.finishedPiecesPerMeal={lean:2,bulk:3};
    data.meals.m7.productionSequence=20;
    data.meals.p1.productionSequence=20;
    const seekhShape=data.meals.m7.prepBatches.find(card=>card.type==='marinade');
    seekhShape.steps[1]='Shape one short kebab per meal using the displayed Lean and Bulk piece counts and mixed weights. Only include explicitly selected internal extras. Weigh every piece; do not average tiers together.';
    const koftaShape=data.meals.p1.prepBatches.find(card=>card.type==='protein-mix');
    koftaShape.pieceWeightNote='After squeezing onion, weigh the retained customer mixture and divide by the displayed customer piece count. Keep the separate QC reserve out of customer logs.';
    koftaShape.steps=[
      'Squeeze grated onion dry and weigh the retained pulp. Mix with measured beef, reduced Shan, garlic, ginger and cilantro; no yogurt or water.',
      'Cook a small QC portion from the separate reserve. Confirm heat, salt and cohesion. Weigh the customer mixture, then divide by the displayed customer piece count.',
      'Shape five short logs per meal, about 1.5–2 cm thick. Record actual log weights, cover and refrigerate for Cook Day.',
    ];
    data.meals.p3.sideCupComponents=[
      {name:'Lemon-garlic dressing',batchGroup:'lebanese-dressing',cupsPerMeal:1,gramsPerMeal:14.35,weightBasis:'raw-input'},
      {...data.meals.p3.sideCup,cupsPerMeal:1},
    ];
    data.meals.m4.sideCupComponents=[{...data.meals.m4.sideCup,cupsPerMeal:1,weightBasis:'raw-input'}];
    const butterMarinade=data.meals.bw1.prepBatches.find(card=>card.type==='marinade');
    butterMarinade.ingredientAmounts={fage:{perServing:15}};
    butterMarinade.operatorSteps=[
      'Cube the thighs. Coat with all displayed marinade ingredients. No extra salt.',
      'Cover and refrigerate for 1–3 hours or overnight. Cook all marinade with the chicken.',
    ];
    butterMarinade.referenceNotes=['The remaining yogurt is reserved for finishing and is shown in Cook & finish.'];
    const salmonSauce=data.meals.m4.prepBatches.find(card=>card.type==='sauce');
    salmonSauce.operatorSteps=[salmonSauce.steps[0],
      'Weigh finished sauce. Reserve each meal’s share for incorporation and its separate cup; record reduction and bowl loss.'];
    salmonSauce.referenceNotes=[salmonSauce.steps[1]];
    for (const adjustment of data.groceryAdjustments) {
      if (/Nouman separate QC/.test(adjustment.reason)) {
        adjustment.dishId='p1';
        if (!['light_mayo','ketchup','honey','sriracha'].includes(adjustment.key)) adjustment.referenceServings=3;
      } else {
        adjustment.dishId='m7';
        adjustment.scaleToIngredient={key:'pickles',referenceAmount:300};
      }
    }
    const picklePrep=data.meals.m7.prepBatches.find(card=>card.name==='House refrigerator pickles — Prep Day');
    picklePrep.scaleToIngredient={key:'pickles',referenceAmount:300};
    picklePrep.instruction='Make the displayed weighed target of drained refrigerator pickles. Keep refrigerated.';
    picklePrep.formulaIngredients=[
      {key:'pickles',name:'Finished house pickles, drained target',fixedAmount:300},
      ...data.groceryAdjustments.filter(item=>item.dishId==='m7' && item.delta>0).map(item=>({key:item.key,name:item.name,fixedAmount:item.delta})),
    ].map(item=>({...item,unit:'g',includeInGrocery:false}));
    picklePrep.steps=[
      'Thinly slice the displayed red onion, carrot and jalapeño. Pack into clean food-safe jars with about 1/2 inch headspace.',
      'Simmer the measured vinegar, water, salt and sugar until dissolved. Pour over the vegetables, close and refrigerate. Preserve the listed vinegar-to-water ratio.',
      'Hold refrigerated 1–3 days. Drain, weigh and confirm the finished target shown above before assembly. Keep pickle-free portions separate.',
    ];
    data.methodsByName={...data.methodsByName,...Object.fromEntries(Object.values(data.meals).map(m=>[m.recipeName,m]))};
  }

  // Current-menu overlay. The historical blocks above remain available for
  // archived fixtures, but the live planner must always follow the effective
  // order configuration and its generated production file. Never fall back to
  // a prior batch merely because a new batch number was published.
  const portionStandards={
    version:'owner-approved-2026-10-07-v1',
    status:'approved-plating-blueprint',
    common:{
      cookedStarchG:{lean:120,bulk:160},
      vegetableSideG:{lean:75,bulk:100},
      sauceRule:'Weigh the protein before sauce. Add the exact recipe-specific sauce, garnish and toppings afterward.',
    },
    chickenThighComponent:{
      proteinKey:'chicken_thigh_raw',
      finishedCookedBeforeSauceG:{lean:160,bulk:210},
      observedTestYieldPct:68.8,
      workingRawEquivalentG:{lean:232.56,bulk:305.23},
      rawPullRule:'Plan raw pull from the current measured rolling yield. The cooked plating target controls; reserve is separate.',
    },
    groundBeef90Component:{
      proteinKey:'beef_90_raw',
      rawRecipeInputG:{lean:210,bulk:300},
      workingFinishedSeasonedComponentG:{lean:175,bulk:250},
      yieldStatus:'Working finished target pending one measured actual 90/10 production yield.',
      rawPullRule:'Use actual 90/10 beef. Do not convert an 80/20 test batch into a purchasing or label identity.',
    },
    exceptions:[
      'incorporated pasta or casserole',
      'wrap, taco, burrito, quesadilla or flatbread',
      'meatball, kofta or kebab',
      'steak or beef strips',
      'bone-in poultry',
      'seafood',
      'custom chicken breast or mince',
      'Nouman actual 96/4 beef',
      'single-tier or otherwise non-comparable builds',
    ],
  };
  const portionExceptionPattern=/pasta|lasagna|casserole|\bbake\b|shakshuka|hot pocket|wrap|taco|burrito|quesadilla|flatbread|pinwheel|meatball|kofta|kebab|biryani/i;
  const compatibleStarchKeys=new Set(['rice_dry','potato','sweet_potato','instant_potato_flakes','quinoa']);
  const resolvePortionStandard=({name='',proteinKey='',tiers=[],ingredientKeys=[]}={})=>{
    const tierSet=new Set(tiers);
    if (!proteinKey) return {status:'not-applicable',reason:'No controlled meat component.'};
    if (proteinKey==='beef_96_raw') return {status:'recipe-specific-exception',reason:'Nouman beef remains actual 96/4 and never inherits the 90/10 blanket.'};
    if (['leg_quarter_raw','beef_strips_raw','ny_strip_raw','shrimp_raw','tilapia_raw','pink_salmon_raw','chicken_breast_raw','chicken_mince_raw'].includes(proteinKey)) {
      return {status:'recipe-specific-exception',reason:'The protein form is explicitly outside the component-bowl blanket.'};
    }
    if (portionExceptionPattern.test(name)) return {status:'recipe-specific-exception',reason:'The dish form requires its controlled recipe-specific build.'};
    if (!tierSet.has('lean') || !tierSet.has('bulk')) return {status:'recipe-specific-exception',reason:'The blanket requires comparable Lean and Bulk builds.'};
    const starchKey=ingredientKeys.find(key=>compatibleStarchKeys.has(key));
    if (!starchKey) return {status:'manual-review',reason:'Compatible protein found without a recognized plated starch; keep the protein logic but review the complete build before release.'};
    if (proteinKey==='chicken_thigh_raw') return {status:'blanket-standard',standardKey:'chickenThighComponent',starchKey};
    if (proteinKey==='beef_90_raw') return {status:'blanket-standard',standardKey:'groundBeef90Component',starchKey};
    return {status:'recipe-specific-exception',reason:'The protein identity is not covered by the approved chicken-thigh or 90/10 ground-beef blanket.'};
  };
  const portionInstruction=(policy,tier)=>{
    if (policy?.status!=='blanket-standard' || !['lean','bulk'].includes(tier)) return '';
    const common=portionStandards.common;
    if (policy.standardKey==='chickenThighComponent') {
      const chicken=portionStandards.chickenThighComponent;
      const protein=chicken.finishedCookedBeforeSauceG[tier];
      const raw=chicken.workingRawEquivalentG[tier];
      return `Approved ${tier} blueprint: ${protein} g cooked boneless skinless chicken thigh before sauce (working raw equivalent ${raw} g at the measured ${chicken.observedTestYieldPct}% yield), ${common.cookedStarchG[tier]} g cooked starch, and ${common.vegetableSideG[tier]} g vegetable side. Keep the production reserve separate from the plated portion. ${common.sauceRule}`;
    }
    const beef=portionStandards.groundBeef90Component;
    return `Approved ${tier} blueprint: ${beef.rawRecipeInputG[tier]} g raw 90/10 beef input and a working ${beef.workingFinishedSeasonedComponentG[tier]} g finished seasoned beef component, plus ${common.cookedStarchG[tier]} g cooked starch and ${common.vegetableSideG[tier]} g vegetable side. ${beef.yieldStatus} ${common.sauceRule}`;
  };
  data.portionStandards=portionStandards;
  data.resolvePortionStandard=resolvePortionStandard;
  let liveConfig=null, liveProduction=null;
  try {
    if (typeof require === 'function') {
      liveConfig=require('../config/order-config');
      liveProduction=require('./nutrition/production-data');
    }
  } catch (_) {}
  if (!liveConfig && typeof window !== 'undefined') liveConfig=window.PRPD_ORDER_CONFIG;
  if (!liveProduction && typeof window !== 'undefined') liveProduction=window.PRPD_PRODUCTION_DATA;
  if (liveConfig?.batch?.number && liveProduction?.batch === liveConfig.batch.number) {
    const proteinKeys=new Set(['chicken_thigh_raw','chicken_breast_raw','chicken_mince_raw','leg_quarter_raw','beef_90_raw','beef_96_raw','beef_strips_raw','ny_strip_raw','short_rib_cooked','shrimp_raw','tilapia_raw','pink_salmon_raw']);
    const roleFor=station=>/poultry|beef|seafood/i.test(station)?'protein':/starch|hot side/i.test(station)?'base':/sauce|dairy/i.test(station)?'sauce':/produce/i.test(station)?'topping':'side';
    const labelFor=station=>station || 'Measured recipe component';
    const historicalMethodsByName={...(data.methodsByName || {})};
    for (const [name,history] of Object.entries(methodHistoryByName)) {
      if (!historicalMethodsByName[name] && history.length) historicalMethodsByName[name]=history[history.length-1].method;
    }
    historicalMethodsByName['Chocolate-Dipped Cookie Dough Balls']=chocolateDippedCookieDoughBallsMethod;
    const historicalMethodAliases={
      'Sweet Chili Chicken with Rice':'Sweet Chili Chicken with Vegetable Rice',
    };
    const historicalMethodFor=name=>historicalMethodsByName[name] || historicalMethodsByName[historicalMethodAliases[name]] || null;
    // These IDs describe the Batch 14 layout in the hand-authored operational
    // tables below. Convert that layout to stable recipe names before applying
    // it to any current or future menu.
    const operationalSlotRecipeNames={
      b1:'Egg Bites with Potato Hash', b2:'French Toast', b3:'Grilled Cheese Breakfast Burrito', b4:'Blueberry Vanilla Protein Baked Oatmeal Squares',
      m1:'Mexican Streetcorn Chicken Bowl', m2:'Cheesy Achiote Chicken Tacos', m3:'Meatball Arrabbiata Pasta', m4:'Garlic Butter Wild Argentine Shrimp + Rice',
      m5:'Tandoori Chicken', m6:'Mediterranean Chicken Bowl', m7:'Premium NY Strip Steak',
      d1:'Chocolate Peanut Butter Protein Brownie', d2:'Oreo Protein Cheesecake Cup', d3:'Banana Cream Pie Cup',
      a1:'Chicken Tikka Snack Wrap', a2:'BBQ Chicken Lavash Flatbread', a3:'Caprese Protein Pasta Box',
      bw1:'Chicken Shakshuka', p1:'High-Protein Beef Kofta & Roasted Vegetables', p2:'Custom Lean Chicken Mince', p3:'Custom Lebanese-Style Chicken Breast',
    };
    const operationalSpecs={
      b1:{todayTitle:'Bake the egg bites and roast the potato hash',today:[
        'Keep the egg-bite batter and potato hash in separate labeled bowls. Blend eggs, egg whites, and cottage cheese smooth; fold in mozzarella and the measured vegetables and seasonings.',
        'Weigh the finished batter, portion 60 g into each prepared well, and bake at 350 F until every bite reaches 160 F. Record the finished count and yield.',
        'Cut and season the potatoes separately. Roast until browned and tender, record the finished yield, then rapid-cool both components and refrigerate at 41 F or below.'
      ],tomorrow:['Reheat and pack 4 egg bites plus 120 g potato hash for each Lean meal, and 6 egg bites plus 150 g hash for each Bulk meal.']},
      b2:{todayTitle:'Cook the complete French Toast batch',today:[
        'Blend the eggs, egg whites, cottage cheese, milk, protein powder, brown sugar, vanilla, and cinnamon until completely smooth.',
        'Dip each bread slice evenly and cook on a preheated griddle until the custard is fully set and both sides are browned. Record the cooked slice count.',
        'Rapid-cool in a single layer, then cover and refrigerate. Wash and dry the fruit, but keep it whole until Cook Day.'
      ],tomorrow:['Reheat the cooked French Toast, cut the fruit fresh, and pack the measured fruit, whipped cream, and syrup with the correct Lean or Bulk slice count.']},
      b3:{todayTitle:'Prepare the burrito egg filling and measured beef set',today:[
        'Keep raw beef isolated. Weigh the exact beef, onion, tomato paste, and seasonings into a labeled raw-protein set for tomorrow.',
        'Cook the measured eggs and egg whites until fully set. Record the finished egg yield, rapid-cool, cover, and refrigerate.',
        'Count the correct tortillas and cheese into a separate clean assembly set. Do not assemble or grill the burritos today.'
      ],tomorrow:['Cook the beef filling to 160 F and drain well, combine it with the prepared egg filling, build the exact tier portions, and dry-grill each burrito.']},
      b4:{deferred:true,todayTitle:'Mix and bake Blueberry Vanilla Oatmeal Squares',today:[
        'Do not mix the batter on Prep Day. Keep the weighed dry ingredients, refrigerated ingredients, banana, and blueberries in separate labeled Cook Day sets.',
        'On Cook Day, mash the banana, whisk the wet ingredients, combine with the dry ingredients just until uniform, then fold in blueberries.',
        'Spread in the prepared 9 x 13 pan, bake at 350 F until the center is set, cool fully, weigh the pan, and cut the controlled square count.'
      ],tomorrow:['Mix and bake the complete Blueberry Vanilla Oatmeal Squares recipe. The raw batter is not held overnight. Cool fully before cutting and packing.']},
      m1:{todayTitle:'Finish the street-corn component, rice, and chicken prep',today:[
        'Keep the raw chicken in its own labeled pan. Apply the complete measured chicken seasoning, cover, and refrigerate for Cook Day.',
        'Cook the displayed dry rice, record its finished yield, rapid-cool, and refrigerate in the labeled Streetcorn destination pan.',
        'Dry-char the corn, pepper, onion, and jalapeno until excess moisture is gone. Cool before folding in yogurt, mayonnaise, Cotija, cilantro, and lime. Record the finished street-corn yield and refrigerate.'
      ],tomorrow:['Cook the seasoned chicken to 165 F and record the cooked yield. Plate the controlled chicken, rice, and finished street corn in three visible sections.']},
      m2:{todayTitle:'Marinate achiote chicken and quick-pickle the onion',today:[
        'Whisk the measured achiote paste, lime, garlic, cumin, paprika, oil, and salt. Coat only the labeled raw chicken, cover, and refrigerate.',
        'Combine the measured onion, vinegar, water, honey, and salt for the quick pickle. Submerge, cover, label, and refrigerate.',
        'Count tortillas and cheeses into a clean labeled assembly set. Make the displayed Honey Barbecue Mustard and Garlic Herb Yogurt at the sauce station.'
      ],tomorrow:['Cook the achiote chicken to 165 F, warm the tortillas, melt the measured cheese, and assemble with drained pickled onion and the exact sauces.']},
      m3:{todayTitle:'Form meatballs, cook pasta, and make arrabbiata sauce',today:[
        'Mix the beef, egg, breadcrumbs, onion, and measured seasonings only until combined. Form the exact controlled meatball count, cover, and refrigerate raw at 41 F or below.',
        'Cook the protein pasta just to firm al dente, drain, cool promptly, weigh the finished yield, and refrigerate in its labeled pan.',
        'Cook the crushed tomato, garlic, tomato paste, and measured seasonings into a thick arrabbiata sauce. Record yield, rapid-cool, and refrigerate. Keep mozzarella separate.'
      ],tomorrow:['Cook meatballs to 160 F, record yield, then portion with the prepared pasta and arrabbiata sauce and finish with measured mozzarella.']},
      m4:{todayTitle:'Cook cilantro-lime rice and the shrimp vegetable side',today:[
        'Cook the displayed rice with its measured cilantro, garlic, and lime finish. Record finished yield, rapid-cool, and refrigerate.',
        'Cook the peas, carrot, and zucchini until just tender and excess moisture is controlled. Record finished yield, rapid-cool, and refrigerate.',
        'Keep the shrimp raw and cold. Measure the butter, garlic, lemon, and cornstarch separately for tomorrow; do not combine the lemon and cornstarch today.'
      ],tomorrow:['Cook shrimp last to 145 F, finish with the measured garlic-butter-lemon mixture, and plate with the prepared rice and vegetables.']},
      m5:{todayTitle:'Marinate Tandoori chicken and prepare both sides',today:[
        'Mix the measured yogurt, lemon, ginger, paprika, cumin, coriander, oil, and seasonings. Coat the leg quarters evenly, cover, and refrigerate.',
        'Cook the displayed cilantro-garlic-lime rice, record the finished yield, rapid-cool, and refrigerate.',
        'Roast the broccoli until just tender, record the finished yield, rapid-cool, and refrigerate. Make Garlic Herb Yogurt at the sauce station.'
      ],tomorrow:['Roast the marinated leg quarters to 165 F at the thickest safe point, rest, and pack with the prepared rice, broccoli, and sauce.']},
      m6:{todayTitle:'Season Mediterranean chicken and prepare rice and cold toppings',today:[
        'Keep raw chicken isolated. Apply the complete measured chicken seasoning, cover, label, and refrigerate.',
        'Cook the rice, record the finished yield, rapid-cool, and refrigerate in the labeled destination pan.',
        'Wash and thoroughly dry cucumber, tomato, onion, and herbs. Keep them whole or in large dry pieces for fresh Cook Day cutting. Stage hummus, feta, olives, lemon, and oil separately.'
      ],tomorrow:['Cook chicken to 165 F, cut the fresh vegetables, and assemble the controlled rice, chicken, hummus, feta, olives, fresh vegetables, and Garlic Herb Yogurt.']},
      m7:{todayTitle:'Season steak and cook the mash and broccoli',today:[
        'Weigh and season each steak portion. Cover, label, and refrigerate raw for Cook Day.',
        'Prepare the Idahoan Original instant mashed potato formula with the displayed package-ratio water, cold milk, butter, and salt. Do not use fresh potatoes. Record the finished yield, rapid-cool, and refrigerate.',
        'Roast the broccoli and garlic until just tender. Record the finished yield, rapid-cool, and refrigerate. Make Honey Barbecue Mustard at the sauce station.'
      ],tomorrow:['Cook steaks to the controlled doneness while meeting the 145 F plus 3-minute-rest food-safety endpoint, then pack with reheated mash, broccoli, and sauce.']},
      d1:{todayTitle:'Bake and portion the Chocolate Peanut Butter Brownies',today:[
        'Mix the complete measured brownie formula in the stated order without overmixing.',
        'Spread evenly in the prepared pan and bake until the center is set. Record the hot pan yield.',
        'Cool completely, weigh, cut the controlled serving count, package, and refrigerate.'
      ],tomorrow:['Verify the chilled brownie count and place each finished serving into customer pack-out.']},
      d2:{todayTitle:'Make and chill the Oreo Protein Cheesecake Cups',today:[
        'Blend the complete measured cheesecake base until smooth and uniform.',
        'Portion the exact net weight into each dessert cup, add the measured Oreo component, and record filled weights and count.',
        'Seal, label, and refrigerate overnight at 41 F or below.'
      ],tomorrow:['Verify every chilled cup is fully set, sealed, and assigned to the correct customer.']},
      d3:{todayTitle:'Make the Banana Cream Pie cup base',today:[
        'Whisk the complete measured cream base until smooth and thickened.',
        'Portion the base into labeled cups and refrigerate. Keep fresh banana and cookie garnish separate so they do not brown or soften overnight.',
        'Record the filled base weight and cup count before closing Prep Day.'
      ],tomorrow:['Slice banana fresh, add the measured banana and cookie finish to each chilled cup, seal, and return promptly to refrigeration.']},
      a1:{todayTitle:'Marinate Tikka chicken and prepare the cold wrap set',today:[
        'Mix the measured yogurt, lemon, garlic, paprika, cumin, coriander, chili powder, salt, and oil. Coat only the raw chicken, cover, and refrigerate.',
        'Wash and thoroughly dry lettuce, onion, cucumber, and tomato. Keep the vegetables uncut or in large dry pieces until Cook Day.',
        'Count tortillas into a clean labeled set. Make the Garlic Herb Yogurt spread at the sauce station.'
      ],tomorrow:['Cook chicken to 165 F, cool promptly for cold assembly, cut the vegetables fresh, and build the exact chilled wrap count.']},
      a2:{todayTitle:'Season BBQ chicken and make the honey-lime BBQ finish',today:[
        'Keep raw chicken isolated. Apply the complete measured chicken seasoning, cover, and refrigerate.',
        'Whisk the measured BBQ sauce, honey, and lime until uniform. Cover, label, and refrigerate; keep cilantro dry and separate.',
        'Count lavash, mozzarella, and onion into a clean labeled assembly set. Do not build or bake the flatbreads today.'
      ],tomorrow:['Cook chicken to 165 F, chop it, pre-crisp lavash 2 to 3 minutes, assemble, bake 5 to 7 minutes, finish with cilantro, and cut into four wedges.']},
      a3:{todayTitle:'Cook Caprese pasta and prepare the dressing',today:[
        'Cook the protein pasta firm, drain, cool promptly, and record the finished yield.',
        'Drain and rinse the cannellini beans. Keep them dry and refrigerated with the measured mozzarella in a clean labeled set.',
        'Whisk the measured yogurt, balsamic, garlic powder, salt, pepper, and water dressing. Refrigerate separately. Keep tomato and basil whole until Cook Day.'
      ],tomorrow:['Cut and drain tomatoes, tear basil fresh, combine pasta, beans, mozzarella, tomato, and basil, then add the measured dressing and pack cold.']},
      bw1:{todayTitle:'Season Shakshuka chicken and cook the tomato-pepper base',today:[
        'Keep raw chicken isolated. Apply the complete measured chicken seasoning, cover, and refrigerate.',
        'Cook crushed tomatoes, red onion, green pepper, paprika, and measured seasonings until thick and spoonable. Record yield, rapid-cool, and refrigerate.',
        'Count eggs, mozzarella, and bread into clean labeled sets. Make Garlic Herb Yogurt at the sauce station.'
      ],tomorrow:['Cook chicken to 165 F, reheat the shakshuka base, set the measured eggs in the sauce, and pack with mozzarella, bread, and Garlic Herb Yogurt.']},
      p1:{todayTitle:'Mix and shape Nouman\'s 96/4 beef kofta',today:[
        'Use actual 96/4 ground beef. Mix in squeezed-dry onion, finely minced jalapeno, measured seekh masala, paprika, black pepper and salt.',
        'Shape exactly five short kofta logs per meal and place them directly on the lined Cook Day tray.',
        'Wash and dry the full displayed cubed-salad allocation. Keep the vegetables whole and cold so they can be cut fresh tomorrow.',
        'Prepare two 40 g Sweet Heat cups per beef meal. Keep the sauce cold and separate.'
      ],tomorrow:['Cook kofta to 160 F and record finished yield. Cut cucumber, tomato and onion into small even cubes, blend the jalapeno evenly with the lemon, add the cilantro and whole-gram batch seasonings, and pack one 205 g cold salad box per meal. Add two 40 g Sweet Heat cups per beef meal.']},
      p2:{todayTitle:'Prepare Nouman\'s moist chicken qeema and kachumber set',today:[
        'Keep chicken mince isolated in its labeled raw-protein pan with the measured onion, garlic, lemon, parsley and spices. Keep the measured water separate for cooking.',
        'Wash and dry the full displayed cubed-salad allocation. Keep the vegetables whole and cold so they can be cut fresh tomorrow.',
        'Prepare one 40 g Sweet Heat cup and one measured lemon-garlic dressing cup per chicken-mince meal.'
      ],tomorrow:['Cook the chicken qeema to 165 F with its measured 60 g water per meal; keep it moist and lightly saucy rather than dry. Record finished yield. Cut cucumber, tomato and onion into small even cubes, blend the jalapeno evenly with the lemon, add the cilantro and whole-gram batch seasonings, and pack one 205 g cold salad box per meal. Add one 40 g Sweet Heat cup and one lemon-garlic dressing cup per chicken meal.']},
      p3:{todayTitle:'Marinate the Lebanese-style chicken breast',today:[
        'Whisk the measured lemon, garlic, oil, paprika, cumin, pepper, and salt marinade.',
        'Coat only the labeled chicken breast pull, cover, and refrigerate.',
        'Make and fill the measured lemon-garlic dressing cups. Keep them sealed and cold.'
      ],tomorrow:['Cook chicken breast to 165 F, rest, record finished yield, and pack with the controlled dressing and Sweet Heat allocation.']}
    };
    const job=(type,name,ingredientKeys,steps,options={})=>({type,name,ingredientKeys,steps,...options});
    const componentJob=(type,name,componentRef,steps,options={})=>job(type,name,[],steps,{componentRef,...options});
    const operationalTasks={
      b1:[
        componentJob('cook-ahead','Bake egg bites','egg-bite-batter',['Blend the eggs, egg whites, and cottage cheese smooth, then fold in the measured cheese, vegetables, and seasonings.','Fill every assigned muffin well with 60 g batter: 4 bites per Lean meal and 6 per Bulk meal. Bake at 350 F until every center reaches 160 F.'],{prepWave:'eggs',prepWaveName:'Egg production',pieceNoun:'egg bite',pieceTargets:{lean:{piecesPerServing:4,gramsPerPiece:60,label:'Lean egg bites'},bulk:{piecesPerServing:6,gramsPerPiece:60,label:'Bulk egg bites'}}}),
        componentJob('starch-ahead','Roast potato hash','potato-hash',['Cut and season the potatoes with the complete displayed potato-hash allocation.','Roast at 400 F until browned and tender.','Record the finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'roasted-potatoes',prepWaveName:'Roasted potato work'}),
      ],
      b2:[
        job('cook-ahead','Cook French Toast',['egg','egg_white','cottage','fairlife_milk','whey_vanilla','brown_sugar','vanilla','cinnamon','bread_slice'],['Blend the eggs, egg whites, cottage cheese, milk, protein powder, brown sugar, vanilla and cinnamon until smooth.','Coat every assigned bread slice, using all measured custard evenly. Griddle until browned on both sides and fully set through the center.'],{prepWave:'griddle',prepWaveName:'Breakfast griddle work',pieceNoun:'French toast slice',pieceTargets:{lean:{piecesPerServing:3,gramsPerPiece:0,label:'Lean slices'},bulk:{piecesPerServing:4,gramsPerPiece:0,label:'Bulk slices'}}}),
        job('cold-kit','Stage whole fruit and whipped cream',['strawberry','banana','whipped_cream'],['Wash and dry the strawberries, but do not cut them today.','Keep bananas whole and whipped cream refrigerated for fresh Cook Day finishing.']),
        job('sauce','Fill French Toast syrup cups',['maple_syrup'],['Fill and seal the displayed syrup allocation.','Label, date, and refrigerate with the French Toast set.']),
      ],
      b3:[
        job('protein-portion','Stage breakfast-burrito beef filling',['beef_90_raw','onion','tomato_paste','salt'],['Keep raw beef isolated and weigh the exact beef, onion, tomato paste, and salt allocation.','Cover, label, and refrigerate. Cook to 160 F and drain well on Cook Day.']),
        job('cook-ahead','Cook the separate burrito egg filling',['egg','egg_white'],['Cook the measured whole eggs and egg whites until fully set.','Record the finished yield, rapid-cool, cover, label, and refrigerate.']),
        job('cold-kit','Count burrito tortillas and cheese',['small_tortilla','large_tortilla','mozzarella'],['Count the exact tier-specific tortillas and weigh the mozzarella.','Keep the clean assembly set covered and refrigerated; do not assemble or grill today.']),
      ],
      b4:[
        componentJob('measured-prep','RESERVE FOR COOK DAY — Mix and bake Blueberry Vanilla Oatmeal Squares','oatmeal-square-pan',['Do not mix the batter today. Keep refrigerated ingredients cold and dry ingredients, banana, and blueberries separate.','Tomorrow, mix in the controlled order, bake at 350 F until set, cool fully, weigh, and cut the controlled square count.'],{deferred:true,releaseTiming:'cook-day',finishTiming:'cook-day',prepWave:'active-recipe-kits',prepWaveName:'Cook Day recipe kits'}),
      ],
      m1:[
        job('marinade','Season Streetcorn chicken',['chicken_thigh_raw','avocado_oil','salt','garlic_powder','onion_powder','paprika','black_pepper'],['Keep the raw chicken isolated and apply the complete displayed seasoning and oil.','Cover, label, and refrigerate for cooking to 165 F tomorrow.']),
        job('starch-ahead','Cook Streetcorn rice',['rice_dry'],['Cook the complete displayed dry-rice allocation.','Record dry input and finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'rice',prepWaveName:'Rice production'}),
        job('vegetable-ahead','Cook and finish creamy street corn',['corn','onion','jalapeno','green_bell_pepper','fage','light_mayo','cotija','cilantro','lime'],['Dry-char corn, bell pepper, onion, and jalapeno until excess moisture is controlled.','Cool before folding in yogurt, mayonnaise, Cotija, cilantro, and lime.','Record the finished yield, cover, label, and refrigerate.'],{prepWave:'hot-vegetables',prepWaveName:'Vegetable production'}),
      ],
      m2:[
        job('protein-portion','Weigh Cheesy Achiote chicken',['chicken_thigh_raw'],['Weigh the exact raw chicken pull into its own labeled pan.','Keep covered and refrigerated while the marinade is mixed.']),
        componentJob('marinade','Make achiote marinade','achiote-marinade',['Whisk the displayed achiote paste, lime, garlic, cumin, paprika, oil, and salt until uniform.','Coat only the labeled taco chicken, cover, and refrigerate.']),
        componentJob('topping','Quick-pickle red onion','achiote-pickled-onion',['Combine the displayed onion, vinegar, water, honey, and salt.','Keep the onion submerged, cover, label, and refrigerate.']),
        componentJob('sauce','Make Honey Barbecue Mustard','honey-barbecue-mustard',['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed cups, seal, label, and refrigerate.'],{sharedSauceFamily:'honey-barbecue-mustard',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
        componentJob('sauce','Make Garlic Herb Yogurt','garlic-herb-yogurt',['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed cups, seal, label, and refrigerate.'],{sharedSauceFamily:'garlic-herb-yogurt',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
        job('cold-kit','Count taco tortillas, cheese, and garnish',['corn_street_tortilla','mozzarella','cotija','cilantro'],['Count the exact tortillas and weigh both cheeses and cilantro into a clean labeled set.','Keep cold and dry; assemble tacos only after the chicken is cooked tomorrow.'],{excludeComponentRefs:['achiote-pickled-onion','achiote-marinade','honey-barbecue-mustard','garlic-herb-yogurt']}),
      ],
      m3:[
        job('protein-mix','Mix and form raw meatballs',['beef_90_raw','egg','breadcrumbs','onion','salt'],['Mix the beef, egg, breadcrumbs, onion and salt only until combined.','Shape 8 meatballs per Lean meal and 10 per Bulk meal at the displayed raw targets. Place them directly on the lined baking trays for tomorrow.'],{pieceNoun:'meatball',pieceTargets:{lean:{piecesPerServing:8,gramsPerPiece:28,label:'Lean meatballs'},bulk:{piecesPerServing:10,gramsPerPiece:29.6,label:'Bulk meatballs'}}}),
        job('starch-ahead','Boil Meatball Arrabbiata Kroger protein pasta',['kroger_protein_pasta'],['Cook the Kroger protein pasta to firm al dente and drain thoroughly.','Record the finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'pasta-and-bakes',prepWaveName:'Pasta production'}),
        job('cook-ahead','Cook arrabbiata sauce',['crushed_tomatoes','garlic','tomato_paste'],['Cook the crushed tomatoes, garlic, and tomato paste until thick and spoonable.','Record the finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'sauce-bases',prepWaveName:'Cooked sauce bases'}),
        job('cold-kit','Weigh Meatball Pasta mozzarella',['mozzarella'],['Weigh the complete mozzarella finish.','Cover, label, and refrigerate for assembly tomorrow.']),
      ],
      m4:[
        job('protein-portion','Weigh and reserve raw shrimp',['shrimp_raw'],['Weigh the exact raw shrimp pull, cover, label, and refrigerate.','Cook the shrimp last tomorrow to 145 F.']),
        componentJob('starch-ahead','Cook cilantro-garlic-lime rice','shared-cilantro-garlic-lime-rice',['Cook the displayed rice and finish with its measured cilantro, garlic, and lime.','Record finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'rice',prepWaveName:'Rice production'}),
        job('vegetable-ahead','Cook shrimp vegetables',['canned_peas_carrots','zucchini'],['Cook the peas, carrots, and zucchini until just tender and excess moisture is controlled.','Record finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'hot-vegetables',prepWaveName:'Vegetable production'}),
        job('mise-en-place','Measure garlic-butter shrimp finish',['butter','garlic','lemon','cornstarch','salt'],['Measure butter, the unallocated garlic, lemon, salt, and cornstarch into separate labeled containers.','Do not combine lemon and cornstarch today. Hold this measured set for tomorrow.'],{excludeComponentRefs:['shared-cilantro-garlic-lime-rice','garlic-herb-yogurt']}),
        componentJob('sauce','Make Garlic Herb Yogurt','garlic-herb-yogurt',['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed portion, seal, label, and refrigerate.'],{sharedSauceFamily:'garlic-herb-yogurt',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
      m5:[
        job('marinade','Marinate Tandoori leg quarters',['leg_quarter_raw','fage','lemon','ginger','paprika','cumin','coriander','avocado_oil','salt','garlic','cilantro'],['Mix the displayed marinade remainder after the rice and sauce allocations are removed. Coat the leg quarters evenly.','Cover, label, and refrigerate for roasting to 165 F tomorrow.'],{excludeComponentRefs:['shared-cilantro-garlic-lime-rice','garlic-herb-yogurt']}),
        componentJob('starch-ahead','Cook cilantro-garlic-lime rice','shared-cilantro-garlic-lime-rice',['Cook the displayed rice and finish with its measured cilantro, garlic, and lime.','Record finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'rice',prepWaveName:'Rice production'}),
        job('vegetable-ahead','Roast Tandoori broccoli',['broccoli'],['Roast the displayed broccoli until just tender.','Record finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'broccoli',prepWaveName:'Broccoli roasting'}),
        componentJob('sauce','Make Garlic Herb Yogurt','garlic-herb-yogurt',['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed portions, seal, label, and refrigerate.'],{sharedSauceFamily:'garlic-herb-yogurt',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
      m6:[
        job('marinade','Season Mediterranean chicken',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper','avocado_oil','lemon'],['Keep raw chicken isolated and apply the displayed chicken seasoning, lemon, and oil remainder.','Cover, label, and refrigerate for cooking to 165 F tomorrow.'],{excludeComponentRefs:['garlic-herb-yogurt']}),
        job('starch-ahead','Cook Mediterranean rice',['rice_dry'],['Cook the complete displayed dry-rice allocation.','Record dry input and finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'rice',prepWaveName:'Rice production'}),
        job('cold-kit','Stage Mediterranean toppings',['cucumber','tomato','hummus','feta','olives','onion'],['Wash and dry cucumber, tomato, and onion; keep them whole or in large dry pieces for fresh cutting tomorrow.','Weigh hummus, feta, and olives separately, cover, label, and refrigerate.']),
        componentJob('sauce','Make Garlic Herb Yogurt','garlic-herb-yogurt',['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed cups, seal, label, and refrigerate.'],{sharedSauceFamily:'garlic-herb-yogurt',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
      m7:[
        job('protein-portion','Season tiered NY strip steaks',['ny_strip_raw','salt'],['Weigh every tier-specific steak and apply its measured steak salt.','Cover, label, and refrigerate for cooking tomorrow.'],{ingredientAmounts:{salt:{lean:.75,bulk:1}}}),
        job('starch-ahead','Prepare Idahoan Original garlic mash',['instant_potato_flakes','water','fairlife_milk','butter','salt','garlic'],['Use Idahoan Original unflavored mashed potato flakes and the displayed package-ratio water, cold Fairlife milk, butter, mash salt, and garlic. Do not use fresh potatoes.','Record finished yield, rapid-cool, cover, label, and refrigerate.'],{ingredientAmounts:{salt:{lean:1.0078011272442238,bulk:1.0078011272442238}},prepWave:'instant-mash',prepWaveName:'Packaged instant mash'}),
        job('vegetable-ahead','Roast steak broccoli',['broccoli'],['Roast the displayed broccoli until just tender.','Record finished yield, rapid-cool, cover, label, and refrigerate.'],{prepWave:'broccoli',prepWaveName:'Broccoli roasting'}),
        job('sauce','Make Honey Barbecue Mustard',['mustard','bbq_sauce','honey','apple_cider_vinegar','garlic_powder','smoked_paprika','black_pepper','salt'],['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed cups, seal, label, and refrigerate.'],{ingredientAmounts:{salt:{lean:.2,bulk:.2}},sharedSauceFamily:'honey-barbecue-mustard',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
      d1:[job('dessert','Bake Chocolate Peanut Butter Protein Brownies',['flour','whey_chocolate','egg','fage','pbfit','cocoa','chocolate_chips','honey','baking_powder','fairlife_milk','salt'],['Mix the complete measured formula without overmixing and spread evenly in the prepared pan.','Bake until the center is set, cool fully, weigh, cut the controlled count, package, and refrigerate.'])],
      d2:[job('dessert','Fill Oreo Protein Cheesecake Cups',['cottage','whey','oreo_pudding_mix','honey','cocoa','maple_syrup','oreo_thin'],['Blend the complete cheesecake base until smooth.','Fill the exact cup weights, add the measured Oreo finish, seal, label, and refrigerate overnight.'])],
      d3:[
        job('dessert','Make Banana Cream Pie cup base',['fage','banana_pudding_mix','whey'],['Whisk the complete cream base until smooth and thickened.','Fill the displayed base weight into labeled cups, record count, seal, and refrigerate.']),
        job('cold-kit','Reserve banana and cookie garnish',['banana','biscoff_cookie'],['Keep banana whole and cookies dry today.','Slice and add both measured garnishes immediately before sealing tomorrow.'],{deferred:true,releaseTiming:'cook-day',finishTiming:'cook-day'}),
      ],
      a1:[
        job('protein-portion','Weigh Tikka wrap chicken',['chicken_thigh_raw'],['Weigh the exact raw chicken pull into its own labeled pan.','Keep covered and refrigerated while the marinade is mixed.']),
        componentJob('marinade','Make Tikka marinade','tikka-marinade',['Whisk the displayed yogurt, lemon, garlic, spices, salt, and oil.','Coat only the labeled chicken, cover, and refrigerate.']),
        componentJob('sauce','Make Garlic Herb Yogurt','garlic-herb-yogurt',['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed portion, seal, label, and refrigerate.'],{sharedSauceFamily:'garlic-herb-yogurt',sauceDelivery:'incorporated',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
        job('cold-kit','Stage Tikka wrap tortillas and vegetables',['small_tortilla','lettuce','red_onion','cucumber','tomato'],['Count tortillas and wash and thoroughly dry every vegetable.','Keep vegetables whole or in large dry pieces for fresh cutting tomorrow.'],{excludeComponentRefs:['tikka-marinade','garlic-herb-yogurt']}),
      ],
      a2:[
        job('marinade','Season BBQ flatbread chicken',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper','avocado_oil'],['Keep raw chicken isolated and apply the complete displayed seasoning and oil.','Cover, label, and refrigerate for cooking to 165 F tomorrow.']),
        job('sauce','Make honey-lime BBQ finish',['bbq_sauce','honey','lime'],['Whisk the displayed BBQ sauce, honey, and lime until uniform.','Cover, label, and refrigerate.']),
        job('cold-kit','Count flatbread assembly set',['lavash','mozzarella','onion','cilantro'],['Count lavash and weigh mozzarella, onion, and cilantro into a clean labeled set.','Keep cold and dry; do not assemble or bake the flatbreads today.']),
      ],
      a3:[
        job('starch-ahead','Boil Caprese Barilla Protein+ Rotini',['barilla_protein_plus_rotini'],['Cook the rotini firm, drain thoroughly, and cool promptly.','Record the finished yield, cover, label, and refrigerate.'],{prepWave:'pasta-and-bakes',prepWaveName:'Pasta production'}),
        job('cold-kit','Stage Caprese beans and mozzarella',['cannellini_beans','mozzarella'],['Drain, rinse, and thoroughly dry the beans.','Weigh beans and mozzarella into a clean labeled cold set.']),
        componentJob('sauce','Make Caprese balsamic-yogurt dressing','caprese-dressing',['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed cups, seal, label, and refrigerate.'],{sharedSauceFamily:'caprese-dressing',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
        job('cold-kit','Reserve Caprese tomato and basil',['tomato','basil'],['Keep tomato and basil whole, dry, and refrigerated today.','Cut and drain tomato and tear basil fresh immediately before cold assembly tomorrow.'],{deferred:true,releaseTiming:'cook-day',finishTiming:'cook-day'}),
      ],
      bw1:[
        job('marinade','Season Shakshuka chicken',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper','avocado_oil'],['Keep raw chicken isolated and apply the displayed chicken seasoning and oil remainder.','Cover, label, and refrigerate for cooking to 165 F tomorrow.'],{excludeComponentRefs:['garlic-herb-yogurt'],ingredientAmounts:{paprika:{lean:.39,bulk:.54}}}),
        job('cook-ahead','Cook Shakshuka tomato-pepper base',['crushed_tomatoes','red_onion','green_bell_pepper','paprika','garlic','cumin'],['Cook the tomatoes, onion, pepper, paprika, and the unallocated garlic and cumin until thick and spoonable.','Record finished yield, rapid-cool, cover, label, and refrigerate.'],{excludeComponentRefs:['garlic-herb-yogurt'],ingredientAmounts:{paprika:{lean:2,bulk:2}},prepWave:'sauce-bases',prepWaveName:'Cooked sauce bases'}),
        job('cold-kit','Count Shakshuka eggs, cheese, and bread',['egg','mozzarella','bread_slice'],['Count eggs and bread and weigh the mozzarella into clean labeled sets.','Keep refrigerated and add only during Cook Day finishing.']),
        componentJob('sauce','Make Garlic Herb Yogurt','garlic-herb-yogurt',['Whisk every displayed ingredient until completely uniform.','Record yield, fill the displayed cups, seal, label, and refrigerate.'],{sharedSauceFamily:'garlic-herb-yogurt',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
      p1:[
        componentJob('protein-mix','Mix and shape Nouman 96/4 kofta','nouman-kofta',['Grate the onion, squeeze it dry, and use the listed retained onion weight. Finely mince the jalapeno.','Mix the 96/4 beef, drained onion, jalapeno, Shan mix, paprika, black pepper and salt only until even.','Shape five short kofta logs per meal at the displayed raw target. Place them directly on the lined baking tray for tomorrow.'],{pieceNoun:'kofta log',pieceTargets:{lean:{piecesPerServing:5,gramsPerPiece:76.5,label:'Nouman kofta logs'}},pieceWeightNote:'Each 76.5 g target includes the drained onion and all seasoning. Keep every meal as five logs.'}),
        componentJob('cold-kit','Stage Nouman cubed salad · beef meals','nouman-kachumber',['Wash and dry the displayed cucumber, tomato, red onion, cilantro and jalapeno. Keep them whole, dry, labeled and refrigerated.','Keep the measured lemon juice, salt and black pepper in a separate labeled set. Measure salt and black pepper in teaspoons at the full multi-serving batch level.','Tomorrow, remove loose jalapeno seeds but retain some white rib, blend the measured jalapeno with the lemon juice, cut the vegetables into small even cubes, chop the cilantro finely, toss with the measured seasonings, and pack one 205 g cold portion per meal.'],{workBatchGroup:'nouman-kachumber',workBatchName:'Nouman small-cut salad'}),
        componentJob('sauce','Fill Nouman Sweet Heat cups','batch13-sweet-heat',['Whisk the displayed Sweet Heat batch until uniform.','Fill two 40 g cups per beef meal, seal, label, and refrigerate.'],{sharedSauceFamily:'batch13-sweet-heat',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
      p2:[
        job('protein-portion','Season Nouman moist chicken qeema',['chicken_mince_raw','red_onion','garlic','lemon','parsley','paprika','cumin','black_pepper','salt'],['Combine the chicken mince with the listed onion, garlic, lemon, parsley and seasonings.','Cover and refrigerate. Add the recipe-controlled 60 g water per meal only while cooking tomorrow.'],{excludeComponentRefs:['nouman-kachumber','lebanese-dressing']}),
        componentJob('cold-kit','Stage Nouman cubed salad · chicken meals','nouman-kachumber',['Wash and dry the displayed cucumber, tomato, red onion, cilantro and jalapeno. Keep them whole, dry, labeled and refrigerated.','Keep the measured lemon juice, salt and black pepper in a separate labeled set. Measure salt and black pepper in teaspoons at the full multi-serving batch level.','Tomorrow, remove loose jalapeno seeds but retain some white rib, blend the measured jalapeno with the lemon juice, cut the vegetables into small even cubes, chop the cilantro finely, toss with the measured seasonings, and pack one 205 g cold portion per meal.'],{workBatchGroup:'nouman-kachumber',workBatchName:'Nouman small-cut salad'}),
        componentJob('sauce','Fill Nouman lemon-garlic dressing cups','lebanese-dressing',['Whisk the displayed dressing until uniform.','Fill one cup per chicken-mince meal, seal, label, and refrigerate.'],{sharedSauceFamily:'lebanese-dressing',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
        componentJob('sauce','Fill Nouman Sweet Heat cups','batch13-sweet-heat',['Whisk the displayed Sweet Heat batch until uniform.','Fill one 40 g cup per chicken-mince meal, seal, label, and refrigerate.'],{sharedSauceFamily:'batch13-sweet-heat',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
      p3:[
        componentJob('marinade','Marinate Lebanese-style chicken breast','lebanese-marinade',['Whisk the displayed marinade and coat only the labeled chicken breast.','Cover, label, and refrigerate for cooking to 165 F tomorrow.']),
        componentJob('sauce','Fill lemon-garlic dressing cups','lebanese-dressing',['Whisk the displayed dressing until uniform.','Fill, seal, label, and refrigerate the displayed cups.'],{sharedSauceFamily:'lebanese-dressing',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
    };
    const operationalSpecsByName=Object.fromEntries(Object.entries(operationalSlotRecipeNames)
      .filter(([id])=>operationalSpecs[id])
      .map(([id,name])=>[name,operationalSpecs[id]]));
    const operationalTasksByName=Object.fromEntries(Object.entries(operationalSlotRecipeNames)
      .filter(([id])=>operationalTasks[id])
      .map(([id,name])=>[name,operationalTasks[id]]));
    const currentNoRequiredCupNames=new Set([
      'Cheesy Achiote Chicken Tacos',
      'Tandoori Chicken',
      'Mediterranean Chicken Bowl',
      'PRPD Protein Box',
      'Chicken Shakshuka',
      'Beef Breakfast Skillet',
    ]);
    const reusableCurrentFlowNames=new Set([
      'Sweet Chili Chicken with Rice',
      'High Protein Tiramisu',
      'Braised Beef Short Rib',
    ]);
    const historicalIngredientAliases={sunflower_oil:'avocado_oil'};
    const retiredHistoricalTaskKeys={
      'High-Protein Beef Lasagna':new Set(['cilantro']),
      'Halal Cart Chicken + Yellow Rice':new Set(['cilantro']),
      'High Protein Tiramisu':new Set(['granulated_sugar','salt']),
      'Sweet Chili Chicken with Rice':new Set(['mixed_vegetables','cilantro']),
    };
    const currentServiceSpecCorrections={
      'Cheesy Achiote Chicken Tacos':{todayTitle:'Marinate achiote chicken and quick-pickle the onion',today:[
        'Whisk the measured achiote paste, lime, garlic, cumin, paprika, oil, and salt. Coat only the labeled raw chicken, cover, and refrigerate.',
        'Combine the measured onion, vinegar, water, honey, and salt for the quick pickle. Submerge, cover, label, and refrigerate.',
        'Count tortillas and cheeses into a clean labeled assembly set.',
      ],tomorrow:['Cook the achiote chicken to 165 F, warm the tortillas, melt the measured cheese, and assemble with drained pickled onion.']},
      'Tandoori Chicken':{todayTitle:'Marinate Tandoori chicken and prepare both sides',today:[
        'Mix the measured yogurt, lemon, ginger, paprika, cumin, coriander, oil, and seasonings. Coat the leg quarters evenly, cover, and refrigerate.',
        'Cook the displayed cilantro-garlic-lime rice, record the finished yield, rapid-cool, and refrigerate.',
        'Roast the broccoli until just tender, record the finished yield, rapid-cool, and refrigerate.',
      ],tomorrow:['Roast the marinated leg quarters to 165 F at the thickest safe point, rest, and pack with the prepared rice and broccoli.']},
      'Mediterranean Chicken Bowl':{todayTitle:'Season Mediterranean chicken and prepare rice and cold toppings',today:[
        'Keep raw chicken isolated. Apply the complete measured chicken seasoning, cover, label, and refrigerate.',
        'Cook the rice, record the finished yield, rapid-cool, and refrigerate in the labeled destination pan.',
        'Wash and thoroughly dry cucumber, tomato, onion, and herbs. Keep them whole or in large dry pieces for fresh Cook Day cutting. Stage hummus, feta, olives, lemon, and oil separately.',
      ],tomorrow:['Cook chicken to 165 F, cut the fresh vegetables, and assemble the controlled rice, chicken, hummus, feta, olives, and fresh vegetables.']},
      'PRPD Protein Box':{todayTitle:'Cook and stage the protein-box components',today:[
        'Hard-boil 2 eggs per box and cook 1 beef-bacon slice per box to its package-safe endpoint. Cool both promptly.',
        'Wash and dry apples and cucumbers. Keep apples whole and cucumber uncut until packing. Stage mozzarella separately.',
      ],tomorrow:['Cut the cucumber fresh. Pack 2 eggs, 1 beef-bacon slice, 28 g mozzarella, 1 mini apple, and 60 g cucumber in each divided box.']},
      'Beef Breakfast Skillet':{todayTitle:'Prepare the Breakfast Skillet beef, potatoes, eggs, and finish kit',today:[
        'Weigh the exact active beef pull and its measured seasoning kit.',
        'Roast the complete active potato allocation and cook the complete egg allocation. Record both finished yields, rapid-cool, and refrigerate.',
        'Stage the measured red onion and mozzarella for assembly. No salsa or recipe-required sauce cup is included.',
      ],tomorrow:['Cook and drain the measured beef, then combine it with the potatoes, eggs, red onion, and cheese by tier.']},
      'Chicken Enchilada Bake':{todayTitle:'Cook the chicken and assemble the tiered enchilada pans',today:[
        'Apply the measured chicken seasoning, cook the thighs to 165 F, record the finished yield, shred, and rapid-cool.',
        'Drain the corn and stage the diced onion, enchilada sauce, mozzarella, and correct tier tortillas. Keep Lean and Bulk allocations in separate labeled pans.',
        'Build two even tortilla layers per tier, distribute the measured filling and cheese, cover, and refrigerate. No recipe-required sauce cup is included.',
      ],tomorrow:['Bake each assembled pan at 375 F until its center reaches 165 F. Rest until the layers hold, weigh each tier section, and divide it by the exact ordered container count.']},
      'Halal Cart Chicken + Yellow Rice':{todayTitle:'Season Halal Cart chicken and cook the yellow rice',today:[
        'Reserve 0.3 g cumin and 0.3 g paprika per meal for the yellow rice. Apply the remaining measured spices, lemon, and salt to the chicken, cover, and refrigerate.',
        'Cook the rice with its measured turmeric and reserved cumin and paprika. Record dry and finished weights, rapid-cool, and refrigerate separately from plain rice.',
        'Wash and dry the lettuce and tomato. Keep them cold and separate from raw chicken and hot rice.',
      ],tomorrow:['Cook the seasoned chicken in uncrowded batches to 165 F, rest briefly, chop, and record yield. Pack the exact chicken and yellow rice with cold lettuce and tomato; no recipe-required sauce cup is included.']},
      'Chicken Shakshuka':{todayTitle:'Season Shakshuka chicken and cook the tomato-pepper base',today:[
        'Keep raw chicken isolated. Apply the complete measured chicken seasoning, cover, and refrigerate.',
        'Cook crushed tomatoes, red onion, green pepper, paprika, and measured seasonings until thick and spoonable. Record yield, rapid-cool, and refrigerate.',
        'Count eggs, mozzarella, and bread into clean labeled sets.',
      ],tomorrow:['Cook chicken to 165 F, reheat the shakshuka base, set the measured eggs in the sauce, and pack with mozzarella and bread.']},
    };
    const batch15FlowByName={
      'Strawberry Cheesecake Protein Pancakes':{
        type:'cook-ahead',title:'Cook the pancakes and prepare both finishes',
        today:['Whisk the measured wet ingredients, fold in the dry ingredients just until combined, and cook exactly 3 medium pancakes per Lean meal or 4 per Bulk meal.','Cook the strawberries to a thick compote and cool it completely. Mix the measured cream cheese, yogurt, and powdered sugar, then combine the two finishes in one topping cup per meal.','Fill one separate syrup cup per meal. Record pancake count and finished batter and topping yields, then rapid-cool and refrigerate.'],
        tomorrow:['Reheat the correct pancake count, add one strawberry-cheesecake topping cup and one syrup cup, seal, and refrigerate.'],
        pieceNoun:'pancake',pieceTargets:{lean:{piecesPerServing:3,gramsPerPiece:0,label:'Lean pancakes'},bulk:{piecesPerServing:4,gramsPerPiece:0,label:'Bulk pancakes'}},
      },
      'PRPD Beef Bacon Breakfast Sandwich':{
        type:'cook-ahead',title:'Cook the sandwich components and breakfast potatoes',
        today:['Cook one egg patty and one beef-bacon slice per physical sandwich. Lean needs 1 sandwich; Bulk needs 2. Melt 28 g mozzarella into each sandwich.','For Lean meals only, roast the displayed potatoes until browned and tender. Bulk receives no potato side.','Whisk the measured Sweet Heat ingredients, fill one 45 g cup per meal, and refrigerate. Cool all cooked components promptly and keep muffins dry until assembly.'],
        tomorrow:['Cook one egg patty and one beef-bacon slice per physical sandwich. Toast the English muffins, melt 28 g mozzarella into each sandwich, assemble 1 Lean or 2 Bulk sandwiches, and add the Lean potatoes where ordered.'],
        pieceNoun:'sandwich',pieceTargets:{lean:{piecesPerServing:1,gramsPerPiece:0,label:'Lean sandwich'},bulk:{piecesPerServing:2,gramsPerPiece:0,label:'Bulk sandwiches'}},
      },
      'Blueberry Vanilla Protein Baked Oatmeal Squares':{
        type:'measured-prep',title:'Reserve the measured oatmeal-square set for Cook Day',deferred:true,componentRef:'oatmeal-square-pan',
        today:['Keep dry ingredients together in one labeled set. Keep eggs, egg whites, milk, yogurt, banana, blueberries, honey, butter, and vanilla cold and separate. Do not mix raw batter overnight.'],
        tomorrow:['Mash the banana, whisk the wet ingredients, combine with the dry ingredients just until uniform, and fold in blueberries. Bake in the parchment-lined 9 x 13 pan at 350 F until the center is set. Cool fully and cut 8 equal-weight squares. Pack 2 squares per Lean and 3 per Bulk.'],
      },
      'Beef Breakfast Skillet':{
        type:'protein-portion',title:'Stage the skillet beef and cook the potato and egg components',
        today:['Keep the raw 90/10 beef isolated with its measured onion, garlic, oil, and salt. Cover and refrigerate for Cook Day.','Roast the displayed potatoes until browned and tender. Cook the eggs fully. Record both finished yields, rapid-cool, and refrigerate.','Whisk the barbecue sauce, mustard, and vinegar. Fill one 45 g cup per meal and refrigerate. Keep mozzarella separate.'],
        tomorrow:['Brown the beef to 160 F and drain thoroughly. Cook the displayed eggs fully, then pack the exact tier beef, potatoes, egg, red onion, garlic, and mozzarella. Do not add salsa.'],
      },
      'Sweet Chili Chicken with Rice':{
        type:'marinade',title:'Season the chicken, cook the plain rice, and make the glaze',
        today:['Apply the displayed salt, garlic powder, onion powder, paprika, black pepper, and oil to the raw chicken. Cover and refrigerate.','Cook the displayed dry rice as one plain-rice batch. Record dry input and finished cooked yield, rapid-cool, and refrigerate.','Mix the incorporated sweet chili sauce, soy sauce, and garlic. Keep this glaze separate from the raw chicken. Fill one separate 30 g matching Sweet Chili sauce cup per meal from its own allocation.'],
        tomorrow:['Cook chicken to 165 F, record the cooked yield, and add the measured glaze only after cooking. Pack 160 g cooked chicken plus 120 g cooked rice per Lean, or 210 g chicken plus 160 g rice per Bulk. Add one sealed 30 g Sweet Chili sauce cup to every meal.'],
      },
      'Creamy Cajun Chicken Pasta':{
        type:'marinade',title:'Cut and season Cajun chicken and stage the one-pot pasta set',
        today:['Cut the thighs into 1.5 to 2 cm cubes. Keep the Lean chicken and Bulk chicken in separate labeled pans and apply each tier\'s displayed Cajun seasoning.','Dice the yellow onion and slice the green onion. Use the Recipe Book tier quantities to make one labeled Lean pasta kit and one labeled Bulk pasta kit. Keep pasta, tomatoes, water, cream cheese, oil, butter, and onions separate within each kit. Do not cook or hold the pasta overnight.'],
        tomorrow:['Cook the Lean and Bulk Cajun pasta as two separate labeled batches. For each batch, brown chicken to 165 F, cook onion in the measured oil and butter, add tomatoes and water, soften the protein spaghetti while stirring to prevent clumping, then finish with cream cheese and green onion.'],
      },
      'Chicken Enchilada Bake':{
        type:'marinade',title:'Season the chicken and stage the enchilada pans and white sauce',
        today:['Apply the displayed chicken seasoning and oil, cover, and refrigerate.','Count the correct Lean or Bulk tortillas and stage corn, enchilada sauce, mozzarella, and red onion by pan. Keep each tier separate.','Whisk the yogurt, lime, jalapeno, and garlic until uniform. Fill one 45 g cup per meal, seal, and refrigerate.'],
        tomorrow:['Weigh each fully chilled enchilada pan net of the pan. Cut the exact Lean and Bulk portion counts by scale, fill every sold portion first, and retain only true edge trim.'],
      },
      'High-Protein Beef Lasagna':{
        type:'protein-cook-ahead',title:'Cook, assemble, and fully bake the lasagna',
        today:['Brown the 90/10 beef to 160 F and drain thoroughly. Cook the onion and garlic, then add crushed tomatoes, tomato paste, water, Italian seasoning, salt, and pepper for the house sauce.','Mix ricotta, egg, parsley, and parmesan. Build separate Lean and Bulk pans with the exact sheets, sauce, ricotta layer, mozzarella, and parmesan.','Bake each pan to 165 F. Record hot pan weight, then rapid-cool the intact pans to 41 F or below and refrigerate overnight.'],
        tomorrow:['Weigh each fully chilled intact pan net of the pan. Cut clean portions by scale, targeting 447 g Lean and 594 g Bulk while never going below the 442 g and 589 g label weights. Fill sold portions before retaining any true edge trim.'],
      },
      'Southwest Beef Taco Bowl':{
        type:'protein-portion',title:'Stage the taco beef and cook the rice and vegetable components',
        today:['Keep raw 90/10 beef isolated with the displayed salt and oil. Cover and refrigerate.','Cook the cilantro-garlic-lime rice, record finished yield, rapid-cool, and refrigerate. Heat black beans and cook corn, pepper, and onion until excess moisture is controlled, then cool promptly.','Whisk the yogurt, jalapeno, lime, and garlic until uniform. Fill one 45 g cup per meal. Wash and dry lettuce, keep it uncut, and stage Cotija separately.'],
        tomorrow:['Brown beef to 160 F and drain thoroughly. Cut lettuce fresh. Pack the exact tier rice, beef, beans, cooked vegetables, lettuce, and Cotija.'],
      },
      'Lemon Pepper Tilapia with Garlic Potatoes':{
        type:'protein-portion',title:'Portion the tilapia and prepare the potato, broccoli, and sauce set',
        today:['Portion the raw tilapia and keep it covered at 40 F or below. Measure lemon, black pepper, oil, and fish salt separately. Do not hold the fish in lemon overnight.','Cut potatoes and broccoli. Roast the garlic potatoes and broccoli until tender, record finished yields, rapid-cool, and refrigerate.','Whisk barbecue sauce, mustard, and vinegar. Fill one 40 g cup per meal and refrigerate.'],
        tomorrow:['Pat fish dry, apply the measured lemon-pepper set immediately before cooking, and cook to 145 F. Pack the exact tier fish, garlic potatoes, and broccoli.'],
      },
      'Braised Beef Short Rib':{
        type:'protein-cook-ahead',title:'Braise and debone the short ribs; chill the jus overnight',
        today:['Start this first. Pull and record the displayed raw bone-in short-rib amount. That displayed weight already includes the 5 percent reserve. Sear in batches until deeply browned, then remove.','Brown onion, carrot, celery, and garlic. Toast tomato paste, deglaze with water and balsamic, add thyme, coriander, bay leaf, salt, and pepper, return the ribs, cover, and braise at 325 F for about 2.75 to 3.5 hours until very tender. Do not use beef broth, stock, or bouillon.','Remove every bone, cartilage fragment, tough membrane, and excessive loose fat. Record the finished edible meat weight and finished strained jus weight. Chill meat and liquid separately and refrigerate so the fat can be lifted cleanly. This measurement replaces the provisional 49.6 percent planning yield after production.'],
        tomorrow:['Remove the hardened fat and reduce the braising liquid to a glossy jus. Reheat the deboned meat gently in the jus. Retrieve the chilled Prep Day Idahoan garlic-rosemary mash and prepare the roasted green beans. Pack Lean with 150 g beef, 45 g jus, 180 g mash, and 90 g beans; Bulk with 200 g beef, 45 g jus, 240 g mash, and 120 g beans.'],
      },
      'Baked Strawberry-Lemon Protein Cheesecake':{
        type:'dessert',title:'Bake and portion the strawberry-lemon cheesecake',
        today:['Blend cream cheese, cottage cheese, yogurt, egg, protein powder, cornstarch, vanilla, lemon, and salt until smooth. Cook the strawberries with honey to a thick compote and cool slightly.','Spread the cheesecake base in the prepared pan, swirl in the compote, and bake until the center is set. Cool completely, weigh, cut the controlled serving count, package, and refrigerate.'],
        tomorrow:['Verify every chilled portion is set, sealed, and assigned to the correct customer.'],
      },
      'Chocolate Oreo Mousse':{
        type:'dessert',title:'Mix and fill the chocolate Oreo mousse cups',
        today:['Whisk yogurt, chocolate protein powder, cocoa, and honey until completely smooth. Portion the exact net weight into each cup, add the measured Oreo finish, record filled weights and count, seal, and refrigerate.'],
        tomorrow:['Verify every mousse cup is cold, sealed, and assigned to the correct customer.'],
      },
      'High Protein Tiramisu':{
        type:'dessert',title:'Build and chill the tiramisu cups',
        today:['Blend cottage cheese with the displayed water until smooth. Whisk with yogurt, mascarpone, protein powder, sugars, and vanilla.','Prepare 30 g cooled strong coffee per ordered cup using the displayed dry-coffee preparation allowance. Dip ladyfingers for about one second per side, record their before-and-after weight so actual coffee pickup is known, layer with cream, dust with cocoa, seal, and refrigerate overnight.'],
        tomorrow:['Verify the cups are fully chilled and set. Record the actual coffee prepared and absorbed before final production closeout.'],
        formulaIngredients:[{key:'instant_coffee',name:'Instant coffee powder for dipping coffee',unit:'g',perServing:1.3333,station:'Breakfast & Desserts',confidence:'planning',note:'Operational allowance based on the documented 8 g instant coffee per 180 g prepared-coffee strength. Record actual prepared coffee and ladyfinger pickup.'}],
      },
      'Buffalo Chicken Pinwheels':{
        type:'protein-cook-ahead',title:'Cook and chill the Buffalo chicken filling',
        today:['Season the chicken with the displayed salt, garlic powder, onion powder, paprika, pepper, and oil. Cook to 165 F, record yield, shred, and rapid-cool.','Mix the chilled chicken with cream cheese, mozzarella, and Buffalo sauce. Wash and completely dry the lettuce and onion. Keep tortillas sealed and dry.'],
        tomorrow:['Spread the measured filling over exactly 1 Mission Carb Balance tortilla per order, add dry lettuce and onion, roll tightly, chill 20 to 30 minutes, cut into exactly 4 even pieces, and pack one complete 12 oz box per order.'],
        pieceNoun:'pinwheel piece',pieceTargets:{single:{piecesPerServing:4,gramsPerPiece:0,label:'Four pieces from one tortilla'}},
      },
      'Mediterranean Chicken Hummus Box':{
        type:'marinade',title:'Season the chicken and stage the cold hummus-box set',
        today:['Apply the displayed salt, garlic powder, onion powder, paprika, pepper, lemon, and oil to the chicken. Cover and refrigerate.','Wash and thoroughly dry cucumber, tomato, and onion. Keep them whole or in large dry pieces for fresh cutting tomorrow. Stage hummus, feta, olives, and flatbread separately.'],
        tomorrow:['Cook chicken to 165 F, cool promptly, and cut the vegetables fresh. Pack one chilled box with the exact chicken, hummus, half flatbread, cucumber, tomato, feta, olives, and onion.'],
      },
      'PRPD Protein Box':{
        type:'cook-ahead',title:'Cook and stage the protein-box components',
        today:['Hard-boil 2 eggs per box and cook 1 beef-bacon slice per box to its package-safe endpoint. Cool both promptly.','Wash and dry apples and cucumbers. Keep apples whole and cucumber uncut until packing. Stage mozzarella separately.','Whisk barbecue sauce, mustard, and vinegar. Fill one 45 g cup per box and refrigerate.'],
        tomorrow:['Cut the cucumber fresh. Pack 2 eggs, 1 beef-bacon slice, 28 g mozzarella, 1 mini apple, 60 g cucumber, and one separate 45 g Mustard BBQ cup in each divided box.'],
      },
      'Halal Cart Chicken + Yellow Rice':{
        type:'marinade',title:'Marinate the chicken, cook yellow rice, and make white sauce',
        today:['Use the displayed lemon, oregano, cumin, paprika, garlic powder, and salt to season the chicken. Cover and refrigerate.','Cook the displayed dry rice with its turmeric, cumin, and paprika allocation. Record dry input and finished yield, rapid-cool, and refrigerate.','Whisk the displayed yogurt, mayonnaise, garlic, and lemon into white sauce. Fill one 45 g cup per meal. Wash and dry lettuce and tomato, but keep them whole until Cook Day.'],
        tomorrow:['Cook chicken to 165 F and record yield. Cut lettuce and tomato fresh. Pack Lean with 160 g cooked chicken and 120 g cooked rice, or Bulk with 210 g chicken and 160 g rice, plus the measured vegetables.'],
      },
    };
    // Separate raw-protein work from complete Prep Day recipes. The previous
    // one-ticket-per-dish fallback put pasta, vegetables, sauces, and casserole
    // ingredients inside the protein station whenever a dish contained meat.
    const batch15PrepTasksByName={
      'Strawberry Cheesecake Protein Pancakes': flow => [
        job('cook-ahead',flow.title,['flour','baking_powder','whey_vanilla','egg','egg_white','fage','fairlife_milk','strawberry','reduced_cream_cheese','powdered_sugar','maple_syrup','vanilla','cinnamon','avocado_oil','salt'],flow.today,{pieceNoun:flow.pieceNoun,pieceTargets:flow.pieceTargets}),
      ],
      'PRPD Beef Bacon Breakfast Sandwich': () => [
        job('starch-ahead','Roast the Lean breakfast potatoes',['potato'],['Roast the displayed Lean potato allocation until browned and tender.','Record the finished yield, rapid-cool, and refrigerate.'],{prepWave:'roasted-potatoes',prepWaveName:'Roasted potato work'}),
      ],
      'Blueberry Vanilla Protein Baked Oatmeal Squares': flow => [
        componentJob(flow.type,flow.title,flow.componentRef,flow.today,{deferred:true,releaseTiming:'cook-day',finishTiming:'cook-day'}),
      ],
      'Beef Breakfast Skillet': () => [
        job('protein-portion','Stage the raw skillet beef',['beef_90_raw','red_onion','garlic','avocado_oil','salt'],['Keep the raw beef isolated with its displayed onion, garlic, oil, and salt.','Cover and refrigerate for Cook Day browning to 160 F.']),
        job('starch-ahead','Roast the skillet potatoes',['potato'],['Roast the displayed potatoes until browned and tender.','Record the finished yield, rapid-cool, and refrigerate.'],{prepWave:'roasted-potatoes',prepWaveName:'Roasted potato work'}),
      ],
      'Sweet Chili Chicken with Rice': () => [
        job('marinade','Season the Sweet Chili chicken',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper','avocado_oil'],['Apply the displayed seasoning and oil to the raw chicken.','Cover and refrigerate for Cook Day cooking to 165 F.']),
        job('starch-ahead','Cook the plain rice',['rice_dry'],['Cook the displayed dry rice as one plain-rice batch.','Record dry input and finished yield, rapid-cool, and refrigerate.'],{prepWave:'rice',prepWaveName:'Rice production'}),
        componentJob('sauce','Mix the incorporated Sweet Chili glaze','sweet-chili-incorporated',['Mix the displayed sweet chili sauce, soy sauce, and garlic until uniform.','Cover and refrigerate. Keep this glaze separate from the raw chicken and the customer side cups.'],{sauceDelivery:'incorporated'}),
        componentJob('sauce','Fill Sweet Chili side cups','sweet-chili-side-cup',['Tare each cup and fill exactly 30 g net with the matching G Hughes Sweet Chili sauce.','Seal, count, label, date, and refrigerate one cup per active meal.'],{sharedSauceFamily:'sweet-chili-side-cup',sauceDelivery:'cup',prepWave:'sauces',prepWaveName:'Current sauce batches'}),
      ],
      'Creamy Cajun Chicken Pasta': () => [
        job('marinade','Cut and season the Cajun chicken',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper','smoked_paprika','oregano','thyme','cayenne'],['Cut the thighs into 1.5 to 2 cm cubes.','Apply the displayed seasonings, cover, and refrigerate for Cook Day cooking to 165 F.']),
        job('measured-prep','Stage the one-pot Cajun pasta set',['protein_pasta','crushed_tomatoes','water','regular_cream_cheese','onion','green_onion','olive_oil','butter'],['Dice the yellow onion and slice the green onion.','Keep pasta, tomatoes, water, cream cheese, oil, butter, and both onions in separate labeled Cook Day sets. Do not cook or hold the pasta overnight.'],{prepWave:'active-recipe-kits',prepWaveName:'Cook Day recipe sets',aheadWorkstation:'grains'}),
      ],
      'Chicken Enchilada Bake': () => [
        job('protein-cook-ahead','Cook, assemble, and fully bake the enchilada pans',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper','avocado_oil','small_tortilla','corn','enchilada_sauce','mozzarella','red_onion'],['Season and cook the chicken to 165 F, record its finished yield, then shred it.','Use medium tortillas for every pan. Build the measured chicken, corn, enchilada sauce, red onion, and mozzarella into three pans, then cut the larger finished portions for Bulk.','Bake to 165 F. Record each hot pan weight, then rapid-cool the intact pans to 41 F or below and refrigerate overnight.'],{prepWave:'assembled-pans',prepWaveName:'Complete Prep Day bakes',equipmentLane:'oven',ovenTemperatureF:375,estimatedMinutes:50}),
      ],
      'High-Protein Beef Lasagna': flow => [
        job('protein-cook-ahead',flow.title,['beef_90_raw','crushed_tomatoes','tomato_paste','water','italian_seasoning','lasagna_sheet','part_skim_ricotta','mozzarella','parmesan','egg','onion','garlic','parsley','black_pepper','salt'],flow.today,{prepWave:'assembled-pans',prepWaveName:'Complete Prep Day bakes',equipmentLane:'oven',ovenTemperatureF:375,estimatedMinutes:55}),
      ],
      'Southwest Beef Taco Bowl': () => [
        job('protein-portion','Stage the Southwest taco beef',['beef_90_raw','salt','avocado_oil'],['Keep the raw beef isolated with the displayed salt and oil.','Cover and refrigerate for Cook Day browning to 160 F.']),
        componentJob('starch-ahead','Cook cilantro-garlic-lime rice','shared-cilantro-garlic-lime-rice',['Cook the displayed rice and finish it with the displayed cilantro, garlic, and lime.','Record finished yield, rapid-cool, and refrigerate.'],{prepWave:'rice',prepWaveName:'Rice production'}),
        job('vegetable-ahead','Cook Southwest beans and vegetables',['black_beans','corn','green_bell_pepper','onion'],['Heat the beans and cook the corn, pepper, and onion until excess moisture is controlled.','Record finished yields, rapid-cool, and refrigerate.'],{prepWave:'hot-vegetables',prepWaveName:'Hot vegetables'}),
      ],
      'Lemon Pepper Tilapia with Garlic Potatoes': () => [
        job('protein-portion','Portion the Lemon Pepper tilapia',['tilapia_raw','lemon','black_pepper','avocado_oil','salt'],['Portion the raw tilapia and keep it covered at 40 F or below.','Measure the lemon-pepper finish separately. Do not hold fish in lemon overnight.']),
        job('starch-ahead','Roast the garlic potatoes',['potato','garlic'],['Roast the displayed garlic potatoes until browned and tender.','Record finished yield, rapid-cool, and refrigerate.'],{prepWave:'roasted-potatoes',prepWaveName:'Roasted potato work'}),
        job('vegetable-ahead','Roast the tilapia broccoli',['broccoli'],['Roast the displayed broccoli until just tender.','Record finished yield, rapid-cool, and refrigerate.'],{prepWave:'hot-vegetables',prepWaveName:'Hot vegetables'}),
      ],
      'Braised Beef Short Rib': flow => [
        job('protein-cook-ahead',flow.title,['short_rib_cooked','onion','carrot','celery','garlic','tomato_paste','water','balsamic_vinegar','thyme','coriander','bay_leaf','avocado_oil','salt','black_pepper'],flow.today,{excludeComponentRefs:['short-rib-mash'],prepWave:'complete-braises',prepWaveName:'Complete Prep Day braises',aheadWorkstation:'protein-cooking',sequence:1,equipmentLane:'oven',ovenTemperatureF:325,estimatedMinutes:210}),
        componentJob('starch-ahead','Prepare Idahoan garlic-rosemary mash','short-rib-mash',[
          'Use Idahoan Original unflavored mashed potato flakes with the displayed package-ratio water, cold milk, butter, and mash salt. Do not use fresh potatoes. Do not peel, cut, boil, or mash fresh potatoes for this component.',
          'Melt the displayed butter over low heat. Add the displayed garlic and cook for 30 to 60 seconds without browning.',
          'Add the displayed water and mash salt. Bring to a full boil, then remove the pot from the heat.',
          'Add the displayed cold Fairlife milk. Sprinkle in the displayed Idahoan flakes, stir gently until evenly moistened, and let stand for 1 minute.',
          'Fold in the displayed rosemary and whip lightly with a fork or spoon. Do not blend and do not add unmeasured liquid.',
          'Weigh and record the finished mash yield. Portion only after confirming enough for 180 g per Lean meal or 240 g per Bulk meal, then rapid-cool in a shallow labeled pan and refrigerate at 41 F or below.',
        ],{prepWave:'instant-mash',prepWaveName:'Idahoan packaged mash'}),
      ],
      'Baked Strawberry-Lemon Protein Cheesecake': flow => [job('dessert',flow.title,['reduced_cream_cheese','cottage','fage','egg','whey_vanilla','cornstarch','vanilla','lemon','salt','strawberry','honey'],flow.today)],
      'Chocolate Oreo Mousse': flow => [job('dessert',flow.title,['fage','whey_chocolate','cocoa','honey','oreo_thin'],flow.today)],
      'High Protein Tiramisu': flow => [job('dessert',flow.title,['fage','mascarpone','cottage','water','whey','powdered_sugar','brown_sugar','vanilla','ladyfingers','cocoa'],flow.today,{formulaIngredients:flow.formulaIngredients})],
      'Buffalo Chicken Pinwheels': () => [
        job('protein-cook-ahead','Cook and make the Buffalo chicken filling',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper','avocado_oil','regular_cream_cheese','mozzarella','buffalo_sauce'],['Season the chicken, cook to 165 F, record the yield, shred, and rapid-cool.','Mix the chilled chicken with the displayed cream cheese, mozzarella, and Buffalo sauce. Cover and refrigerate.']),
      ],
      'Mediterranean Chicken Hummus Box': () => [
        job('marinade','Season the Hummus Box chicken',['chicken_thigh_raw','salt','garlic_powder','onion_powder','paprika','black_pepper','lemon','avocado_oil'],['Apply the displayed seasoning, lemon, and oil to the raw chicken.','Cover and refrigerate for Cook Day cooking to 165 F.']),
      ],
      'PRPD Protein Box': () => [
        componentJob('sauce','Make Mustard BBQ cups','mustard-bbq',['Whisk the displayed barbecue sauce, mustard, and vinegar until uniform.','Fill one 45 g cup per box, seal, and refrigerate.'],{sharedSauceFamily:'mustard-bbq',sauceDelivery:'cup'}),
      ],
      'Halal Cart Chicken + Yellow Rice': () => [
        job('marinade','Season the Halal Cart chicken',['chicken_thigh_raw','lemon','oregano','cumin','paprika','garlic_powder','salt'],['Apply the displayed lemon, oregano, cumin, paprika, garlic powder, and salt to the raw chicken.','Cover and refrigerate for Cook Day cooking to 165 F.'],{excludeComponentRefs:['white-garlic']}),
        job('starch-ahead','Cook the yellow rice',['rice_dry','turmeric'],['Cook the displayed dry rice with its measured turmeric.','Record dry input and finished yield, rapid-cool, and refrigerate.'],{prepWave:'rice',prepWaveName:'Rice production'}),
      ],
    };
    const batch15SideCupsByName={
      'Strawberry Cheesecake Protein Pancakes':[
        {name:'Strawberry-cheesecake topping',batchGroup:'strawberry-cheesecake',cupsPerMeal:1,weightBasis:'measured-yield'},
        {name:'Sugar-free maple syrup',batchGroup:'pancake-syrup',cupsPerMeal:1,gramsPerMeal:30},
      ],
      'PRPD Protein Box':[{name:'PRPD Mustard BBQ Sauce',batchGroup:'mustard-bbq',cupsPerMeal:1,gramsPerMeal:45}],
      'Custom Lebanese-Style Chicken Breast':[
        {name:'Lemon-garlic dressing',batchGroup:'lebanese-dressing',componentRef:'lebanese-dressing',cupsPerMeal:1,gramsPerMeal:14.35,weightBasis:'raw-input'},
        {name:'PRPD Sweet Heat Sauce',batchGroup:'sweet-heat',componentRef:'batch13-sweet-heat',cupsPerMeal:1,gramsPerMeal:45},
      ],
    };
    const batch15WeeklySauceIds=new Set(['b2','b4','m1','m2','m3','m4','m5','m6','m7','bw1']);
    const weeklyGreenFormula=[
      {key:'fage',name:'FAGE Total 0%',unit:'g',perServing:34.0541,station:'Sauces & Dairy',confidence:'high'},
      {key:'lime',name:'Lime juice, raw',unit:'g',perServing:6.0811,station:'Cold Prep & Produce',confidence:'high'},
      {key:'jalapeno',name:'Jalapeno, raw',unit:'g',perServing:3.6486,station:'Cold Prep & Produce',confidence:'high'},
      {key:'garlic',name:'Garlic, raw',unit:'g',perServing:1.2162,station:'Cold Prep & Produce',confidence:'high'},
    ];
    const endpointFor=key=>key==='shrimp_raw'||key==='tilapia_raw'?'145 F':key==='ny_strip_raw'?'145 F plus a 3-minute rest':key==='short_rib_cooked'?'At least 145 F plus a 3-minute rest; continue the covered braise until fork-tender':/^beef_/.test(key||'')?'160 F':'165 F';
    const methods={};
    for (const [id,record] of Object.entries(liveProduction.meals || {})) {
      const allLines=Object.values(record.tiers || {}).flatMap(tier=>tier.ingredients || []);
      const byKey=new Map();
      for (const line of allLines) if (!byKey.has(line.key)) byKey.set(line.key,line);
      const keys=[...byKey.keys()];
      const measurableKeys=keys.filter(key=>allLines.some(line=>line.key===key && Number(line.amount)>0));
      const groups=new Map();
      for (const line of byKey.values()) {
        const station=line.station || 'Measured recipe component';
        if (!groups.has(station)) groups.set(station,[]);
        groups.get(station).push(line.key);
      }
      const proteinKey=keys.find(key=>proteinKeys.has(key));
      const portionPolicy=resolvePortionStandard({
        name:record.name,
        proteinKey,
        tiers:Object.keys(record.tiers || {}),
        ingredientKeys:keys,
      });
      const isCold=/dessert|add-on/i.test(record.category || '') && !proteinKey;
      const componentRefs=[...new Set(allLines.flatMap(line=>Object.keys(line.allocations || {})))];
      const currentFlow=liveProduction.batch===15 ? batch15FlowByName[record.name] : null;
      const reusableCurrentFlow=liveProduction.batch!==15 && reusableCurrentFlowNames.has(record.name) ? batch15FlowByName[record.name] : null;
      const sourceMethod=liveProduction.batch===15 ? null : historicalMethodFor(record.name);
      const sourceSpec=sourceMethod ? {
        todayTitle:sourceMethod.prepBatches?.[0]?.name || `Prepare the measured ${record.name} recipe`,
        today:sourceMethod.prepSteps?.length ? sourceMethod.prepSteps : ['Weigh and stage the complete controlled recipe.'],
        tomorrow:sourceMethod.cookDayReservations?.length ? sourceMethod.cookDayReservations : (sourceMethod.steps?.length ? sourceMethod.steps : ['Finish and assemble the controlled recipe.']),
      } : null;
      const spec=currentFlow || currentServiceSpecCorrections[record.name] || reusableCurrentFlow || operationalSpecsByName[record.name] || sourceSpec || {
        todayTitle:`Prepare the measured ${record.name} recipe`,
        today:['Separate raw proteins from ready-to-eat ingredients. Weigh every displayed ingredient into its labeled destination.','Complete every safe Prep Day component, record finished yields, rapid-cool cooked food, and refrigerate at 41 F or below.'],
        tomorrow:['Cook any reserved raw protein to its safe endpoint, then assemble the controlled tier build.'],
      };
      const selectedPrepTasks=(liveProduction.batch===15 && currentFlow)
        ? (batch15PrepTasksByName[record.name]?.(currentFlow) || [(currentFlow.componentRef
          ? componentJob(currentFlow.type,currentFlow.title,currentFlow.componentRef,currentFlow.today,{
              deferred:currentFlow.deferred===true,
              releaseTiming:currentFlow.deferred?'cook-day':'prep-day',
              finishTiming:currentFlow.deferred?'cook-day':'prep-day',
              pieceNoun:currentFlow.pieceNoun,
              pieceTargets:currentFlow.pieceTargets,
              formulaIngredients:currentFlow.formulaIngredients,
            })
          : job(currentFlow.type,currentFlow.title,measurableKeys,currentFlow.today,{
              deferred:currentFlow.deferred===true,
              releaseTiming:currentFlow.deferred?'cook-day':'prep-day',
              finishTiming:currentFlow.deferred?'cook-day':'prep-day',
              pieceNoun:currentFlow.pieceNoun,
              pieceTargets:currentFlow.pieceTargets,
              formulaIngredients:currentFlow.formulaIngredients,
            }))])
        : (reusableCurrentFlow
          ? (batch15PrepTasksByName[record.name]?.(reusableCurrentFlow) || [])
          : (operationalTasksByName[record.name] || sourceMethod?.prepBatches || [job(
            spec.deferred ? 'measured-prep' : (proteinKey ? 'marinade' : 'cook-ahead'),
            `${spec.deferred ? 'RESERVE FOR COOK DAY' : 'DO TODAY'} — ${spec.todayTitle}`,
            keys,
            spec.today,
            {deferred:spec.deferred===true,releaseTiming:spec.deferred?'cook-day':'prep-day',finishTiming:spec.deferred?'cook-day':'prep-day'},
          )]));
      const assemblyGuide=Object.fromEntries(Object.entries(record.tiers || {}).map(([tier,build])=>[
        tier,
        [
          `Stage the ${tier} container and verify every measured component before filling.`,
          portionInstruction(portionPolicy,tier),
          `Use the controlled ${tier} recipe quantities shown in the ingredient panel; do not substitute from an archived batch.`,
          'Add every listed side cup, seal, label, reconcile the finished count, and move promptly to the required hold.',
        ].filter(Boolean),
      ]));
      const method=meal(
        isCold ? 3 : 5,
        100,
        proteinKey ? ['digital gram scale','labeled ingredient pans','instant-read thermometer','sanitized utensils'] : ['digital gram scale','labeled ingredient pans','sanitized utensils'],
        spec.tomorrow?.[0] || (isCold ? 'Assemble the complete chilled recipe.' : `Cook the complete measured ${record.name} recipe.`),
        proteinKey ? [
          'Retrieve the labeled measured recipe kit and verify its identity against the current batch.',
          'Cook the protein in uncrowded batches to its safe endpoint. Record raw pull, endpoint and finished yield.',
          'Finish the remaining measured components, assemble the exact tier build, add required cups, seal and refrigerate.',
        ] : [
          'Retrieve the labeled measured recipe kit and verify its identity against the current batch.',
          isCold ? 'Mix and assemble the complete chilled formula by weight.' : 'Cook or bake the complete measured formula and record the finished yield.',
          'Assemble the exact tier build, add required cups, seal and refrigerate.',
        ],
        'Use the current generated tier quantities and customer count. Record any actual yield variance before changing a portion.',
        'Keep cold food at 41 F or below. Rapid-cool cooked food before sealed refrigerated holding.',
        {
          validation: record.productionHold || record.qualityChecks || '',
          prepSteps: [
            'Print the current recipe card and label one destination pan for this dish.',
            'Pull and weigh every displayed ingredient from the current generated batch.',
            'Record package substitutions or shortages before production begins.',
          ],
          prepBatches: selectedPrepTasks.map((rawTask,index)=>{
            let task=rawTask;
            if (liveProduction.batch>=16 && record.name==='Hot Honey Chicken Sliders' && task.name==='Hot Honey Slider chicken seasoning') {
              task={...task,
                seasoningFamilyName:'Low-salt slider chicken base',
                steps:[
                  'Weigh the active recipe chicken before adding anything.',
                  'Apply the displayed low-salt aromatic base at 2.5 g salt per kg raw chicken.',
                  'Cover, label, date, and refrigerate at 40 F or below.',
                ],
                formulaIngredients:(task.formulaIngredients || []).map(formula=>formula.sourceKey==='salt'
                  ? {...formula,name:'Salt for low-salt slider chicken base',lean:.25,bulk:.3325}
                  : formula),
              };
            }
            if (liveProduction.batch>=16 && record.name==='Loaded Buffalo Chicken Potato' && task.name==='Loaded Buffalo chicken seasoning') {
              task={...task,
                steps:[
                  'Weigh the active recipe chicken before adding anything.',
                  'Apply only the displayed chicken oil. The reduced salt belongs to the vegetable trays.',
                  'Keep Buffalo sauce measured separately at 30 g Lean or 40 g Bulk and coat the chicken only after it reaches 165 F.',
                  'Cover, label, date, and refrigerate at 40 F or below.',
                ],
                formulaIngredients:(task.formulaIngredients || []).filter(formula=>formula.sourceKey!=='salt'),
              };
            }
            if (liveProduction.batch>=16 && record.name==='Loaded Buffalo Chicken Potato' && task.name==='Loaded Buffalo potatoes and broccoli') {
              task={...task,
                steps:[
                  'Cut potatoes and broccoli.',
                  'Apply the displayed vegetable oil and exactly 0.25 g Lean or 0.375 g Bulk salt across the vegetable trays.',
                ],
                formulaIngredients:(task.formulaIngredients || []).map(formula=>formula.sourceKey==='salt'
                  ? {...formula,name:'Reduced salt for potato and broccoli',lean:.25,bulk:.375}
                  : formula),
              };
            }
            if (liveProduction.batch!==15 && currentNoRequiredCupNames.has(record.name) && task.type==='sauce') return null;
            if (liveProduction.batch!==15 && record.name==='Caprese Protein Pasta Box' && task.componentRef==='caprese-dressing') {
              task={...task,
                name:'Make Caprese balsamic-yogurt drizzle',
                sauceDelivery:'incorporated',
                steps:['Whisk every displayed ingredient until completely uniform.','Record the finished yield and refrigerate it in the labeled Caprese container. Drizzle the measured dressing over the assembled pasta box; do not fill a separate cup.'],
              };
            }
            if (liveProduction.batch!==15 && record.name==='PRPD Protein Box' && task.name==='Protein Box produce, cheese, and PRPD Mustard BBQ cups') {
              task={...task,
                name:'Protein Box produce and cheese kit',
                instruction:'Wash produce and stage the measured cheese and apples.',
                ingredientKeys:['mozzarella','apple','cucumber'],
                steps:['Keep apples whole and cucumber dry.','Weigh the cheese, cover the complete cold kit, label, and refrigerate. No recipe-required sauce cup is packed.'],
              };
            }
            if (liveProduction.batch!==15 && (task.formulaIngredients || []).length) {
              task={...task,formulaIngredients:task.formulaIngredients.map(formula=>{
                const sourceKey=formula.sourceKey;
                const replacement=sourceKey && !keys.includes(sourceKey) && keys.includes(historicalIngredientAliases[sourceKey])
                  ? historicalIngredientAliases[sourceKey]
                  : sourceKey;
                return replacement===sourceKey ? formula : {...formula,sourceKey:replacement,name:formula.name.replace(/^Sunflower oil/, 'Avocado oil')};
              })};
            }
            const retiredKeys=retiredHistoricalTaskKeys[record.name] || new Set();
            const ingredientKeys=task.componentRef
              ? [...new Set(allLines.filter(line=>Number(line.allocations?.[task.componentRef])>0).map(line=>line.key))]
              : (task.ingredientKeys || [])
                  .filter(key=>!retiredKeys.has(key))
                  .map(key=>(!keys.includes(key) && keys.includes(historicalIngredientAliases[key])) ? historicalIngredientAliases[key] : key);
            const tierSafeIngredientKeys=ingredientKeys.filter(key=>keys.includes(key) || !['small_tortilla','large_tortilla'].includes(key));
            if (task.componentRef && !tierSafeIngredientKeys.length && !(task.formulaIngredients || []).length) return null;
            if ((task.ingredientKeys || []).length && !tierSafeIngredientKeys.length && !(task.formulaIngredients || []).length) return null;
            return prep(
              task.type,
              task.name,
              task.deferred ? 'Hold this measured set for Cook Day. Complete only the displayed safe staging steps today.' : (task.instruction || task.steps[0]),
              tierSafeIngredientKeys,
              task.steps,
              {
                includeAllRecipeIngredients:false,
                workflowOnly:false,
                releaseTiming:task.deferred?'cook-day':'prep-day',
                finishTiming:task.deferred?'cook-day':'prep-day',
                sequence:10+index,
                ...task,
                ingredientKeys:tierSafeIngredientKeys,
              },
            );
          }).filter(Boolean),
          proteinCook: proteinKey ? {
            group: proteinKey,
            sequence: 100,
            name: `${record.name} protein`,
            endpoint: endpointFor(proteinKey),
            recipeKeys: [proteinKey],
            recipeSteps: spec.tomorrow,
          } : null,
          cookDayReservations: spec.tomorrow,
          assemblyGuide,
          componentMap:[...groups.entries()].map(([station,ingredientKeys])=>({
            role:roleFor(station),
            label:labelFor(station),
            handling:`Use the exact current-batch quantities assigned to ${station.toLowerCase()}.`,
            ingredientKeys,
          })),
        },
      );
      method.recipeName=record.name;
      method.cookDayReservations=spec.tomorrow;
      method.prepSteps=spec.deferred ? ['Reserved for Cook Day by owner direction; do not mix or cook this recipe on Prep Day.'] : spec.today;
      method.steps=spec.tomorrow;
      if (liveProduction.batch===15 && record.name==='Creamy Cajun Chicken Pasta') {
        method.packMode='finished-tier-batch';
        method.finishedPackName='Cajun pasta';
      }
      if (liveProduction.batch===15) {
        const controlledPackBuilds={
          'Custom Lean Chicken Mince':{
            lean:[
              {amount:'1 finished portion',name:'moist chicken qeema made from the measured 300 g raw chicken mince'},
              {amount:'205 g',name:'small-cut kachumber salad'},
            ],
          },
          'Mediterranean Chicken Hummus Box':{
            single:[{amount:'1 finished portion',name:'cooled Mediterranean chicken'},{amount:'60 g',name:'prepared hummus'},{amount:'½',name:'shawarma flatbread'},{amount:'50 g',name:'diced cucumber'},{amount:'50 g',name:'diced tomato'},{amount:'14 g',name:'feta'},{amount:'15 g',name:'drained sliced olives'},{amount:'10 g',name:'sliced onion'}],
          },
          'Halal Cart Chicken + Yellow Rice':{
            lean:[{amount:'160 g',name:'cooked Halal Cart chicken'},{amount:'120 g',name:'cooked yellow rice'},{amount:'30 g',name:'shredded lettuce'},{amount:'45 g',name:'diced tomato'}],
            bulk:[{amount:'210 g',name:'cooked Halal Cart chicken'},{amount:'160 g',name:'cooked yellow rice'},{amount:'40 g',name:'shredded lettuce'},{amount:'60 g',name:'diced tomato'}],
          },
          'Sweet Chili Chicken with Rice':{
            lean:[{amount:'160 g',name:'cooked chicken before glaze'},{amount:'120 g',name:'cooked rice'},{amount:'1 measured Lean share',name:'Sweet Chili glaze'}],
            bulk:[{amount:'210 g',name:'cooked chicken before glaze'},{amount:'160 g',name:'cooked rice'},{amount:'1 measured Bulk share',name:'Sweet Chili glaze'}],
          },
          'Beef Breakfast Skillet':{
            lean:[{amount:'1 measured Lean share',name:'finished seasoned beef'},{amount:'1',name:'fully cooked egg'},{amount:'1 measured Lean share',name:'roasted skillet potatoes'},{amount:'28 g',name:'melted mozzarella'}],
            bulk:[{amount:'1 measured Bulk share',name:'finished seasoned beef'},{amount:'2',name:'fully cooked eggs'},{amount:'1 measured Bulk share',name:'roasted skillet potatoes'},{amount:'56 g',name:'melted mozzarella'}],
          },
          'High-Protein Beef Kofta & Roasted Vegetables':{
            lean:[{amount:'5',name:'fully cooked 96/4 beef kofta logs'},{amount:'205 g',name:'small-cut kachumber salad'}],
          },
          'Southwest Beef Taco Bowl':{
            lean:[{amount:'1 measured Lean share',name:'finished taco beef'},{amount:'1 measured Lean share',name:'cilantro-garlic-lime rice'},{amount:'1 measured Lean share',name:'Southwest beans and vegetables'},{amount:'25 g',name:'shredded lettuce'},{amount:'12 g',name:'Cotija'}],
            bulk:[{amount:'1 measured Bulk share',name:'finished taco beef'},{amount:'1 measured Bulk share',name:'cilantro-garlic-lime rice'},{amount:'1 measured Bulk share',name:'Southwest beans and vegetables'},{amount:'25 g',name:'shredded lettuce'},{amount:'16 g',name:'Cotija'}],
          },
          'Lemon Pepper Tilapia with Garlic Potatoes':{
            lean:[{amount:'1 finished Lean portion',name:'lemon-pepper tilapia'},{amount:'1 measured Lean share',name:'roasted garlic potatoes'},{amount:'1 measured Lean share',name:'roasted broccoli'}],
            bulk:[{amount:'1 finished Bulk portion',name:'lemon-pepper tilapia'},{amount:'1 measured Bulk share',name:'roasted garlic potatoes'},{amount:'1 measured Bulk share',name:'roasted broccoli'}],
          },
          'PRPD Beef Bacon Breakfast Sandwich':{
            lean:[{amount:'1',name:'toasted English muffin'},{amount:'1',name:'cooked egg patty'},{amount:'1',name:'cooked halal beef-bacon slice'},{amount:'28 g',name:'melted mozzarella'},{amount:'1 measured Lean share',name:'roasted breakfast potatoes'}],
            bulk:[{amount:'2',name:'toasted English muffins'},{amount:'2',name:'cooked egg patties'},{amount:'2',name:'cooked halal beef-bacon slices'},{amount:'56 g',name:'melted mozzarella'}],
          },
          'Strawberry Cheesecake Protein Pancakes':{
            lean:[{amount:'3',name:'prepared pancakes'}],
            bulk:[{amount:'4',name:'prepared pancakes'}],
          },
          'Baked Strawberry-Lemon Protein Cheesecake':{
            single:[{amount:'1',name:'chilled strawberry-lemon cheesecake portion'}],
          },
          'Chocolate Oreo Mousse':{
            single:[{amount:'1 sealed cup',name:'finished Chocolate Oreo Mousse'}],
          },
          'High Protein Tiramisu':{
            single:[{amount:'1 sealed cup',name:'finished High Protein Tiramisu'}],
          },
          'Braised Beef Short Rib':{
            lean:[{amount:'150 g',name:'finished deboned short-rib meat'},{amount:'45 g',name:'reduced short-rib jus'},{amount:'180 g',name:'finished Idahoan garlic-rosemary mash'},{amount:'90 g',name:'finished roasted green beans'}],
            bulk:[{amount:'200 g',name:'finished deboned short-rib meat'},{amount:'45 g',name:'reduced short-rib jus'},{amount:'240 g',name:'finished Idahoan garlic-rosemary mash'},{amount:'120 g',name:'finished roasted green beans'}],
          },
        };
        method.packBuildByTier=controlledPackBuilds[record.name] || null;
        const controlledCookPackSteps={
          'Custom Lean Chicken Mince':['Cook the chicken qeema to 165 F with 60 g water per meal, keeping it moist and lightly saucy.','Cut and season the kachumber, then portion 205 g into each separate salad box.','Pack one measured lemon-garlic dressing cup and one 40 g Sweet Heat cup per meal.'],
          'High-Protein Beef Kofta & Roasted Vegetables':['Bake the formed kofta to 160 F and pack five cooked logs per meal.','Cut and season the kachumber, then portion 205 g into each separate salad box.','Pack two 40 g Sweet Heat cups per meal.'],
          'Beef Breakfast Skillet':['Brown the beef with its measured onion and garlic to 160 F, then drain thoroughly. Cook the eggs fully.','Pack the finished beef, roasted potatoes, egg, and mozzarella by tier. Do not add salsa.'],
        };
        method.cookPackSteps=controlledCookPackSteps[record.name] || null;
      }
      method.portionPolicy=portionPolicy;
      if (portionPolicy.status==='blanket-standard') {
        method.plating=`${portionInstruction(portionPolicy,'lean')} Bulk uses its corresponding approved blueprint. Preserve recipe-specific sauce, garnish and topping quantities.`;
      }
      method.sideCupComponents=record.service?.sideCupComponents || [];
      if (liveProduction.batch===15 && batch15SideCupsByName[record.name]) {
        method.sideCupComponents=JSON.parse(JSON.stringify(batch15SideCupsByName[record.name]));
      }
      if (liveProduction.batch===15 && batch15WeeklySauceIds.has(id)) {
        const greenComponentKeys=[...new Set(allLines.filter(line=>Number(line.allocations?.['white-garlic-jalapeno-sauce'])>0).map(line=>line.key))];
        const useExistingGreen=greenComponentKeys.length>0;
        if (id==='b2') {
          method.prepBatches.push(prep('sauce','Mix and fill the breakfast sandwich Sweet Heat cups','Make one 45 g Sweet Heat cup per breakfast sandwich meal.',['light_mayo','ketchup','honey','sriracha'],[
            'Whisk the mayonnaise, ketchup, honey, and Sriracha until completely uniform.',
            'Fill one 45 g cup per breakfast sandwich meal, seal, and refrigerate.',
          ],{sharedSauceFamily:'breakfast-sandwich-sweet-heat',sauceDelivery:'cup',flavorCategory:'savory'}));
          method.sideCupComponents=[
            {name:'PRPD Sweet Heat Sauce',batchGroup:'breakfast-sandwich-sweet-heat',cupsPerMeal:1,gramsPerMeal:45},
          ];
        } else {
          method.prepBatches.push(prep('sauce','Mix and fill the weekly green yogurt cups','Make one 45 g green jalapeno-yogurt cup per meal.',useExistingGreen?greenComponentKeys:[],[
            'Whisk the yogurt, lime, jalapeno, and garlic until completely uniform.',
            'Fill one 45 g cup per meal, seal, and refrigerate.',
          ],{componentRef:useExistingGreen?'white-garlic-jalapeno-sauce':'',sharedSauceFamily:'weekly-green-yogurt',sauceDelivery:'cup',flavorCategory:'savory',formulaIngredients:useExistingGreen?[]:weeklyGreenFormula}));
          method.sideCupComponents=[
            {name:'Green jalapeno yogurt sauce',batchGroup:'weekly-green-yogurt',cupsPerMeal:1,gramsPerMeal:45},
          ];
        }
      }
      method.sideCups=method.sideCupComponents.reduce((sum,cup)=>sum+(Number(cup.cupsPerMeal)||1),0);
      method.sideCup=method.sideCupComponents[0] || null;
      if (method.proteinCook && method.prepBatches.some(batch=>batch.type==='protein-cook-ahead')) {
        method.proteinCook.prepDayComplete=true;
      }
      if (liveProduction.batch>=15 && record.name==='Braised Beef Short Rib') {
        method.groceryOverrides={
          short_rib_cooked:{
            lean:302.4,
            bulk:403.2,
            unit:'g',
            name:'Bone-in beef short ribs, raw',
            station:'Meat & Seafood',
            applyRawProteinReserve:true,
            confidence:'planning',
            note:'Raw bone-in pull at the provisional USDA 49.6% cooked-edible planning benchmark, not a measured PRPD yield. The configured raw-protein reserve is added separately.',
          },
        };
      }
      if (id==='p1' || id==='p2') method.extraPackagingPerMeal=[{
        key:'grab_go_container',name:'12 oz cold kachumber box with lid',qty:1,
      }];
      if (liveProduction.batch>=17 && record.name==='High Protein Omelette') {
        method.prepBatches=[
          prep('measured-prep','Stage the omelette egg, cheese, and cooking set','Weigh the existing egg, white, cheese, oil, and salt allocations.',['egg','egg_white','mozzarella','avocado_oil','salt'],[
            'Keep eggs and whites refrigerated. Keep cheese, oil, and salt in separate labeled containers. No chicken or yogurt finish.',
            'Hold the measured set for Cook Day. Cook as an omelette, not as a shared Quesadilla or Burrito egg base.',
          ],{includeAllRecipeIngredients:false,workflowOnly:false}),
          prep('cold-kit','Prepare omelette vegetables and toast kit','Wash and cut the measured mushrooms, jalapeno, and tomato; keep tomato separate.',['mushroom','jalapeno','tomato','sourdough_slice'],[
            'Keep mushrooms and jalapeno ready for cooking. Cover the separate ready-to-eat tomato portion and refrigerate.',
            'Count one sourdough slice per Lean or two per Bulk. Keep bread dry and toast on Cook Day.',
          ],{includeAllRecipeIngredients:false,workflowOnly:false}),
        ];
        method.prepSteps=method.prepBatches.map(task=>task.instruction);
        method.steps=[
          'Soften the measured mushrooms and jalapeno in the displayed cooking oil. Add only the measured eggs, egg whites, and salt; cook until fully set to 160 F.',
          'Add the measured mozzarella near the end so it melts. Toast the counted sourdough separately.',
          'Pack the complete omelette with its measured tomato and dry toast. No chicken or recipe-required sauce cup.',
        ];
        method.cookDayReservations=method.steps;
        method.cookPackSteps=method.steps;
        method.temperature='Cook the measured egg mixture until fully set to 160 F.';
        method.assemblyGuide={
          lean:['Pack the complete 2-egg / 92 g-white omelette with 40 g mozzarella, 50 g mushrooms, 15 g jalapeno, 100 g tomato, and 1 sourdough slice. Use only the recipe oil and salt.'],
          bulk:['Pack the complete 3-egg / 138 g-white omelette with 56 g mozzarella, 50 g mushrooms, 15 g jalapeno, 100 g tomato, and 2 sourdough slices. Use only the recipe oil and salt.'],
        };
      }
      if (liveProduction.batch>=17 && record.name==='Cheesy Achiote Chicken Tacos') {
        method.steps=[
          'Cook the labeled achiote thigh allocation with its measured marinade to 165 F and record the cooked yield.',
          'Warm the counted corn tortillas. Divide the complete measured chicken and melting mozzarella evenly across 3 Lean or 4 Bulk tacos.',
          'Finish with the measured Cotija, drained pickled red onion, and cilantro. Record finished taco count and weight. No recipe-required sauce cup.',
        ];
        method.cookDayReservations=method.steps;
        method.cookPackSteps=method.steps;
        if(method.proteinCook) method.proteinCook.recipeSteps=[method.steps[0]];
        method.assemblyGuide={
          lean:['Pack 3 complete street tacos with all assigned chicken, mozzarella, Cotija, drained pickled onion, and cilantro. No automatic sauce cup.'],
          bulk:['Pack 4 complete street tacos with all assigned chicken, mozzarella, Cotija, drained pickled onion, and cilantro. No automatic sauce cup.'],
        };
      }
      if (liveProduction.batch>=17 && record.name==='Halal Cart Chicken + Yellow Rice') {
        method.riceBatchGroup='halal-yellow-rice';
        const chicken=method.prepBatches.find(task=>task.name==='Halal Cart thigh seasoning');
        const rice=method.prepBatches.find(task=>task.name==='Separate Halal Cart yellow rice');
        if(chicken && rice){
          chicken.ingredientAmounts={...(chicken.ingredientAmounts || {})};
          rice.ingredientAmounts={...(rice.ingredientAmounts || {})};
          for(const key of ['cumin','paprika']){
            rice.ingredientKeys=[...new Set([...rice.ingredientKeys,key])];
            rice.ingredientAmounts[key]={};
            chicken.ingredientAmounts[key]={};
            for(const [tier,build] of Object.entries(record.tiers || {})){
              const total=(build.ingredients || []).filter(line=>line.key===key).reduce((sum,line)=>sum+Number(line.amount || 0),0);
              rice.ingredientAmounts[key][tier]=0.3;
              chicken.ingredientAmounts[key][tier]=total-0.3;
            }
          }
          chicken.instruction='Coat only the labeled raw chicken with its displayed marinade allocation. The separate yellow-rice card already owns its cumin and paprika.';
          chicken.steps=[chicken.instruction,'Cover, label, and refrigerate for Cook Day. Do not borrow the yellow-rice spice allocation.'];
          rice.workBatchGroup='halal-yellow-rice';
          rice.instruction='Cook this separate yellow rice with its own displayed turmeric, cumin, and paprika allocations.';
          rice.steps=[rice.instruction,'Record dry input and cooked yield, rapid-cool, label, and refrigerate. Do not cook a second batch on Cook Day.'];
        }
        const salad=method.prepBatches.find(task=>task.name==='Halal Cart salad and garnish');
        if(salad){
          salad.instruction='Wash and dry the displayed lettuce and tomato; keep them covered and separate from raw chicken.';
          salad.steps=[salad.instruction,'Cut fresh for Cook Day pack-out and keep cold. No cilantro or recipe-required sauce cup is assigned.'];
        }
        method.assemblyGuide={
          lean:['Pack 160 g cooked chicken, 120 g cooked yellow rice, 30 g lettuce, and 45 g tomato. No automatic sauce cup.'],
          bulk:['Pack 210 g cooked chicken, 160 g cooked yellow rice, 40 g lettuce, and 60 g tomato. No automatic sauce cup.'],
        };
      }
      if (liveProduction.batch>=17 && record.name==='Southwest Beef Taco Bowl') {
        method.riceBatchGroup='cilantro-garlic-lime';
        method.temperature='Cook beef to 160 F. Reuse the recorded Prep Day rice and vegetables; do not cook them again.';
        const rice=method.prepBatches.find(task=>task.name==='Southwest cilantro-garlic-lime rice share');
        if(rice){
          rice.workBatchGroup='cilantro-garlic-lime';
          rice.instruction='Cook this exact cilantro-garlic-lime rice allocation with compatible selected rice jobs only.';
          rice.steps=[rice.instruction,'Record the combined finished yield and divide by the displayed destination shares. Rapid-cool, label, and refrigerate.'];
        }
        method.steps=[
          'Retrieve the recorded Prep Day cilantro-garlic-lime rice and cooked beans, corn, pepper, and onion. Reheat safely for assembly; do not cook either allocation again.',
          'Brown only the staged beef allocation to 160 F, drain, and add its displayed beef salt. Record the finished yield.',
          'Pack the exact rice, beef, and hot-vegetable shares, then add the measured cold lettuce and Cotija. No retired yogurt finish or automatic sauce cup.',
        ];
        method.cookDayReservations=method.steps;
        method.cookPackSteps=method.steps;
        if(method.proteinCook) method.proteinCook.recipeSteps=[method.steps[1]];
      }
      if (liveProduction.batch>=17 && record.name==='Blueberry Vanilla Protein Baked Oatmeal Squares') {
        method.assemblyGuide={
          lean:['Pack 2 equal standard squares. The full controlled pan makes 8 equal squares; follow the active scaled recipe and record actual cut count and weights.'],
          bulk:['Pack 3 equal standard squares. The full controlled pan makes 8 equal squares; follow the active scaled recipe and record actual cut count and weights.'],
        };
        method.packBuildByTier={
          lean:[{amount:'2',name:'equal standard baked oatmeal squares'}],
          bulk:[{amount:'3',name:'equal standard baked oatmeal squares'}],
        };
      }
      if (liveProduction.batch>=17 && record.name==='Garlic Butter Wild Argentine Shrimp + Rice') {
        method.riceBatchGroup='cilantro-garlic-lime';
        for(const task of method.prepBatches.filter(task=>task.ingredientKeys?.includes('rice_dry'))) task.workBatchGroup='cilantro-garlic-lime';
        method.assemblyGuide={
          lean:['Pack the complete cooked shrimp portion from 200 g raw shrimp, the rice share from 45 g dry rice, and the finished vegetable share from 74 g drained peas/carrots plus 100 g zucchini. Add the measured garlic-butter finish and one sealed 40 g Garlic Herb Yogurt cup.'],
          bulk:['Pack the complete cooked shrimp portion from 270 g raw shrimp, the rice share from 60 g dry rice, and the finished vegetable share from 100 g drained peas/carrots plus 130 g zucchini. Add the measured garlic-butter finish and one sealed 40 g Garlic Herb Yogurt cup.'],
        };
        method.packBuildByTier={
          lean:[{amount:'1 finished portion',name:'shrimp from 200 g raw allocation'},{amount:'1 finished share',name:'cilantro-garlic-lime rice from 45 g dry'},{amount:'1 finished share',name:'vegetables from 74 g drained peas/carrots and 100 g zucchini'},{amount:'1 measured Lean share',name:'garlic-butter-lemon finish'}],
          bulk:[{amount:'1 finished portion',name:'shrimp from 270 g raw allocation'},{amount:'1 finished share',name:'cilantro-garlic-lime rice from 60 g dry'},{amount:'1 finished share',name:'vegetables from 100 g drained peas/carrots and 130 g zucchini'},{amount:'1 measured Bulk share',name:'garlic-butter-lemon finish'}],
        };
      }
      if (liveProduction.batch>=17 && record.name==='Premium NY Strip Steak') {
        for(const task of method.prepBatches.filter(task=>task.ingredientKeys?.includes('instant_potato_flakes'))) task.workBatchGroup='ny-strip-garlic-mash';
        method.assemblyGuide={
          lean:['Pack the complete cooked steak portion from 240 g raw NY strip, 200 g finished Idahoan Original garlic mash, and the roasted broccoli share from 100 g raw. Add one sealed 45 g Honey Barbecue Mustard cup.'],
          bulk:['Pack the complete cooked steak portion from 300 g raw NY strip, 200 g finished Idahoan Original garlic mash, and the roasted broccoli share from 125 g raw. Add one sealed 45 g Honey Barbecue Mustard cup.'],
        };
        method.packBuildByTier={
          lean:[{amount:'1 cooked portion',name:'NY strip from 240 g raw allocation'},{amount:'200 g',name:'finished Idahoan Original garlic mash'},{amount:'1 finished share',name:'roasted broccoli from 100 g raw'}],
          bulk:[{amount:'1 cooked portion',name:'NY strip from 300 g raw allocation'},{amount:'200 g',name:'finished Idahoan Original garlic mash'},{amount:'1 finished share',name:'roasted broccoli from 125 g raw'}],
        };
      }
      if (liveProduction.batch>=17 && record.name==='Lemon Herb Chicken Orzo') {
        const allocations={"lean":{"protein":{"avocado_oil":2,"salt":0.75,"garlic":2,"oregano":0.5,"black_pepper":0.3},"vegetables":{"zucchini":45,"carrot":30,"avocado_oil":2,"salt":0.1},"orzo_finish":{"barilla_orzo_dry":45,"onion":15,"garlic":1,"lemon":12,"parsley":3,"avocado_oil":1,"salt":0.15,"water":10}},"bulk":{"protein":{"avocado_oil":3,"salt":1,"garlic":3,"oregano":0.7,"black_pepper":0.4},"vegetables":{"zucchini":60,"carrot":40,"avocado_oil":2.5,"salt":0.15},"orzo_finish":{"barilla_orzo_dry":60,"onion":20,"garlic":1,"lemon":16,"parsley":4,"avocado_oil":1.5,"salt":0.2,"water":14}}};
        const allocationAmounts=group=>Object.fromEntries(
          [...new Set(Object.values(allocations).flatMap(tier=>Object.keys(tier[group])))].map(key=>[
            key,Object.fromEntries(Object.entries(allocations).map(([tier,groups])=>[tier,groups[group][key] || 0])),
          ]),
        );
        method.prepBatches=[
          prep('marinade','Stage lemon-herb Orzo chicken','Use only the labeled raw thigh pull and its displayed protein seasoning allocation.',['chicken_thigh_raw',...Object.keys(allocations.lean.protein)],[
            'Coat the labeled raw thighs with only this protein kit oil, salt, garlic, oregano, and pepper.',
            'Cover, label, and refrigerate for Cook Day. Keep vegetable and orzo-finish allocations separate.',
          ],{ingredientAmounts:allocationAmounts('protein'),includeAllRecipeIngredients:false,workflowOnly:false}),
          prep('cold-kit','Stage Orzo roasting vegetables','Clean-cut and weigh the zucchini and carrot. Stage only; roast on Cook Day.',Object.keys(allocations.lean.vegetables),[
            'Keep the prepared vegetables covered and cold. Hold their measured oil and salt separately.',
            'Do not borrow oil or salt from the chicken or orzo-finish kits. Roast this vegetable allocation on Cook Day.',
          ],{ingredientAmounts:allocationAmounts('vegetables'),includeAllRecipeIngredients:false,workflowOnly:false}),
          prep('measured-prep','Stage dry Orzo and lemon-herb finish','Weigh dry Barilla Classic Orzo and the separate onion, garlic, lemon, parsley, oil, salt, and finishing water.',Object.keys(allocations.lean.orzo_finish),[
            'Keep dry orzo dry. Keep the measured fresh ingredients refrigerated and each finish allocation labeled.',
            'Boil, drain, weigh, and finish orzo on Cook Day. The displayed water is retained finishing water; pasta-boiling water is process water and is drained.',
          ],{ingredientAmounts:allocationAmounts('orzo_finish'),includeAllRecipeIngredients:false,workflowOnly:false}),
        ];
        method.prepSteps=method.prepBatches.map(task=>task.instruction);
        method.steps=[
          'Cook the reserved seasoned thighs in an uncrowded oven single layer using the recorded trial setting, to 165 F. Record pan load, time, raw input, and cooked edible yield.',
          'Roast the staged zucchini and carrot with only their assigned oil and salt; record finished vegetable output.',
          'Boil the exact dry Barilla Orzo allocation to package al-dente directions. Drain consistently and weigh the cooked output before finishing.',
          'Soften onion in the assigned orzo-finish oil, briefly cook its garlic, add only the measured finishing water, then fold in lemon and parsley off strong heat. Coat the cooked orzo with this complete finish.',
          'Pack 160 g Lean or 210 g Bulk cooked chicken before finish with the complete assigned orzo and vegetable shares. Record actual packed weight; there is no recipe-required cup.',
        ];
        method.cookDayReservations=method.steps;
        method.cookPackSteps=method.steps;
        if(method.proteinCook) method.proteinCook.recipeSteps=[method.steps[0]];
        method.portionPolicy={status:'recipe-specific-exception',reason:'New Orzo recipe retains measured dry-pasta and prepared-raw-vegetable inputs until cooked yields are recorded.'};
        method.plating='Pack the controlled tier chicken, measured cooked output from its dry-orzo input, and its full finished roasted-vegetable share. Enter the actual packed weight.';
        method.assemblyGuide={
          lean:['Pack 160 g cooked thigh before finish, the complete orzo share from 45 g dry, and the roasted vegetable share from 45 g zucchini plus 30 g carrot prepared raw. All oil and salt are already split between the three kits. Record actual packed weight; no cup.'],
          bulk:['Pack 210 g cooked thigh before finish, the complete orzo share from 60 g dry, and the roasted vegetable share from 60 g zucchini plus 40 g carrot prepared raw. All oil and salt are already split between the three kits. Record actual packed weight; no cup.'],
        };
        method.packBuildByTier={
          lean:[{amount:'160 g',name:'cooked boneless skinless thigh before finish'},{amount:'1 finished share',name:'lemon-herb orzo from 45 g dry Barilla Orzo'},{amount:'1 finished share',name:'roasted vegetables from 45 g zucchini and 30 g carrot raw input'}],
          bulk:[{amount:'210 g',name:'cooked boneless skinless thigh before finish'},{amount:'1 finished share',name:'lemon-herb orzo from 60 g dry Barilla Orzo'},{amount:'1 finished share',name:'roasted vegetables from 60 g zucchini and 40 g carrot raw input'}],
        };
      }
      if (liveProduction.batch>=17) {
        const currentPrep=(type,name,instruction,ingredientKeys,steps,options={})=>prep(type,name,instruction,ingredientKeys,steps,{
          includeAllRecipeIngredients:false,workflowOnly:false,releaseTiming:'prep-day',finishTiming:'prep-day',...options,
        });
        const setSteps=steps=>{method.steps=steps;method.cookPackSteps=steps;method.cookDayReservations=steps;if(method.proteinCook)method.proteinCook.recipeSteps=[steps[0]];};
        if (record.name==='Strawberry Cheesecake Protein Pancakes') {
          method.prepBatches=[
            currentPrep('measured-prep','Stage pancake dry mix','Weigh the dry batter set; do not mix wet and dry overnight.',['flour','baking_powder','whey_vanilla','cinnamon','salt'],['Keep the dry set sealed and labeled for the Cook Day griddle.']),
            currentPrep('measured-prep','Stage pancake wet mix and cooking oil','Use 80 g Lean or 100 g Bulk FAGE in the batter; the remaining 20 g belongs to the topping.',['egg','egg_white','fage','fairlife_milk','vanilla','avocado_oil'],['Keep the wet mix refrigerated. Hold the measured cooking oil separately and use only that complete recipe allocation during griddling.'],{ingredientAmounts:{fage:{lean:80,bulk:100}}}),
            currentPrep('topping','Make strawberry-cheesecake topping','Cook the measured strawberries to compote; cool before combining with the cheesecake topping.',['strawberry','reduced_cream_cheese','powdered_sugar','fage'],['Use exactly 20 g FAGE per meal from the recipe total. Record compote and finished topping yield; pack one combined topping cup per meal.','Rapid-cool the cooked fruit under protection, then cover, date, and refrigerate the finished topping at 41 F or below.'],{ingredientAmounts:{fage:{perServing:20}},sauceDelivery:'cup',sharedSauceFamily:'strawberry-cheesecake'}),
            currentPrep('sauce','Fill pancake syrup cups','Fill one separate 30 g syrup cup per meal.',['maple_syrup'],['Tare, fill, seal, count, label, and hold according to the purchased product.'],{sauceDelivery:'cup',sharedSauceFamily:'pancake-syrup'}),
          ];
          setSteps(['Combine the staged wet and dry batter only until uniform, then griddle until the centers are fully set. Record actual timing, count, and finished yield.','Pack 3 pancakes Lean or 4 Bulk, one strawberry-cheesecake topping cup, and one separate 30 g syrup cup.','Rapid-cool cooked pancakes using protected shallow pans, record cooling, and refrigerate. Confirm taste and day-three reheat; these checks are not marked passed.']);
          method.assemblyGuide={lean:['Pack 3 pancakes, one complete strawberry-cheesecake topping allocation, and one sealed 30 g syrup cup.'],bulk:['Pack 4 pancakes, one complete strawberry-cheesecake topping allocation, and one sealed 30 g syrup cup.']};
          method.validation=[method.validation,'Returning formula retains first-test batter/count, compote/topping yield, taste, and day-three reheat checks. The historical yogurt split is 80/100 g batter plus 20 g topping; no extra yogurt.'].filter(Boolean).join(' ');
        }
        if (record.name==='PRPD Beef Bacon Breakfast Sandwich') {
          method.temperature='Egg patties fully set and 160 F; halal beef bacon to its purchased package-safe endpoint.';
          method.prepBatches=[
            currentPrep('measured-prep','Stage the exact sandwich and Lean potato sets','Stage one physical sandwich Lean or two Bulk. Only Lean has potatoes.',['english_muffin','beef_bacon','egg','egg_white','mozzarella','potato','avocado_oil','salt'],['Keep eggs, egg whites, cheese, and beef bacon refrigerated and muffins dry. Leave measured potatoes whole until the cooking/produce block.','Each sandwich uses one egg, 75 g whites, one bacon slice, and 28 g mozzarella. Keep the tier total oil and salt measured separately; record how it is divided between egg and potato work and add no extra.']),
            currentPrep('sauce','Fill breakfast sandwich Sweet Heat cups','Make one separate 40 g current Sriracha Sweet Heat cup per meal, not per sandwich.',['light_mayo','ketchup','honey','sriracha'],['Whisk the displayed recipe amounts, record recovery, then tare and seal one 40 g cup per meal. Do not use the retired 45 g instruction.'],{componentRef:'batch13-sweet-heat',sauceDelivery:'cup',sharedSauceFamily:'sweet-heat'}),
          ];
          setSteps(['For Lean only, cook the exact 150 g raw potato allocation to tenderness and record the finished yield. Bulk has no potato side.','Cook each measured egg patty until fully set and 160 F. Cook halal beef bacon to its package-safe endpoint. Toast the muffins and assemble one sandwich Lean or two Bulk, each with 28 g mozzarella.','Pack the complete tier build and one separate 40 g Sweet Heat cup per meal. Record cooked yields and packed weight, then rapid-cool and refrigerate.']);
          method.assemblyGuide={lean:['Pack 1 complete sandwich, the cooked share from 150 g raw potatoes, and one sealed 40 g Sweet Heat cup.'],bulk:['Pack 2 complete sandwiches, no potatoes, and one sealed 40 g Sweet Heat cup.']};
        }
        if (record.name==='Creamy Cajun Chicken Pasta') {
          const chicken=method.prepBatches.find(task=>task.name==='Cajun chicken finish');
          if(chicken){
            for(const key of ['seasoningFamily','seasoningFamilyName','seasoningBaseForm','seasoningFinishNote','splitAfterSeasoning','poolStorage']) delete chicken[key];
            chicken.instruction='Weigh this dish\'s raw thigh pull and apply only its complete displayed seasoning allocation.';
            chicken.steps=[chicken.instruction,'Cut into 1.5-2 cm cubes. Cover, label, and refrigerate for Cook Day. No shared-base oil or salt is added.'];
          }
          method.validation=[method.validation,'Record actual pan load, one-pot spaghetti timing, final pan yield, and reheat quality; do not substitute a penne cook time or an unmeasured shared seasoning base.'].filter(Boolean).join(' ');
        }
        if (record.name==='Chicken Tikka Snack Wrap') {
          const marinade=method.prepBatches.find(task=>task.name==='Make Tikka marinade');
          if(marinade){marinade.instruction='Whisk only the displayed Tikka-marinade yogurt, lemon, garlic, spices, and oil. Add no salt.';marinade.steps=[marinade.instruction,'Coat only the labeled chicken, cover, and refrigerate. Keep the separate Garlic Herb Yogurt allocation clean and cold.'];}
          const spread=method.prepBatches.find(task=>task.componentRef==='garlic-herb-yogurt');
          if(spread){spread.instruction='Reserve the complete 25 g Garlic Herb Yogurt allocation per wrap for incorporation, not a side cup.';spread.steps=['Whisk the displayed allocated ingredients, record finished recovery, and keep covered at 41 F or below.','Spread the controlled 25 g allocation inside each finished wrap. Do not borrow marinade yogurt or fill a duplicate cup.'];}
          setSteps(['Cook the separate Tikka chicken allocation to 165 F, record cooked yield, then rapid-cool under protection to 41 F or below before cold assembly.','Use exactly one controlled tortilla per order. Add the full chicken share from 130 g raw, the 25 g incorporated Garlic Herb Yogurt, and the complete measured dry vegetable allocation.','Roll tightly and pack one complete wrap in the selected 12 oz Grab & Go container. Record actual weight and fit, then return immediately to cold holding.']);
          method.assemblyGuide={single:['One tortilla, the full cooked chicken share from 130 g raw, 25 g incorporated Garlic Herb Yogurt, and the measured vegetables. No separate recipe-required cup.']};
        }
        if (record.name==='Buffalo Chicken Pinwheels') {
          const chicken=method.prepBatches.find(task=>task.name==='Pinwheel chicken');
          if(chicken){
            chicken.ingredientKeys=chicken.ingredientKeys.filter(key=>key!=='salt');
            for(const key of ['seasoningFamily','seasoningFamilyName','seasoningBaseForm','seasoningFinishNote','splitAfterSeasoning','poolStorage']) delete chicken[key];
            chicken.instruction='Season the isolated raw thigh pull with its displayed salt-free aromatics and measured oil.';
            chicken.steps=[chicken.instruction,'Keep whole, covered, labeled, and refrigerated for Cook Day. Add no shared salty base or extra oil.'];
          }
          const filling=method.prepBatches.find(task=>task.name==='Buffalo filling base');
          if(filling){filling.ingredientKeys=[...new Set([...filling.ingredientKeys,'apple_cider_vinegar','water'])];filling.instruction='Mix the exact cold filling, including its 5 g Buffalo sauce, 2 g vinegar, and 3 g water per order.';filling.steps=[filling.instruction,'Keep covered at 41 F or below. Add only cooked chicken that has been rapidly chilled to 41 F or below.'];}
          setSteps(['Cook the separate salt-free seasoned thigh pull to 165 F, record yield, shred, and rapid-cool under protection to 41 F or below. Never add warm chicken to the cold filling.','Mix the full chilled chicken share from 100 g raw with the complete measured Buffalo filling. Spread across exactly ONE controlled tortilla per order and add 20 g completely dry lettuce.','Roll tightly and chill until firm, then cut the one roll into exactly 4 equal pieces. Pack all 4 in one 12 oz Grab & Go container, seal, and refrigerate.']);
          method.assemblyGuide={single:['Pack all 4 pieces from exactly 1 tortilla, the complete Buffalo chicken filling from 100 g raw thigh, and 20 g dry lettuce.']};
          method.packBuildByTier={single:[{amount:'1',name:'controlled tortilla'},{amount:'1 complete share',name:'chilled filling from 100 g raw thigh and controlled Buffalo mixture'},{amount:'20 g',name:'dry lettuce'},{amount:'4',name:'equal pinwheel pieces'}]};
        }
        if (record.name==='Harissa Honey Chicken') {
          method.temperature='Chicken and any raw-contact glaze to 165 F; record actual cook time and yield.';
          method.prepBatches=[
            currentPrep('protein-portion','Stage Harissa thigh pull','Use only the current generated raw thigh allocation.',['chicken_thigh_raw'],['Keep this labeled pull separate. No historical neutral-base oil or salt is added. Cover and refrigerate.']),
            currentPrep('marinade','Make the exact Harissa Honey glaze','Use every displayed glaze ingredient once, including the current complete oil and salt totals.',['harissa','honey','tomato_paste','lemon','garlic','avocado_oil','paprika','coriander','salt'],['Whisk the controlled glaze. If a clean finishing share is reserved, separate it before any contact with raw chicken and record the split.','Apply the raw-chicken share only to its labeled pull, cover, and refrigerate. No extra neutral seasoning formula or duplicate cup is made.']),
            currentPrep('grain','Cook Harissa rice share','Use the exact dry rice share in the coordinated rice cook.',['rice_dry'],['Record dry input and cooked yield. Portion by the actual allocated input share, rapid-cool under protection, cover, label, and refrigerate.'],{prepWave:'rice',prepWaveName:'Coordinated rice cook'}),
            currentPrep('cold-kit','Stage Harissa broccoli','Weigh the complete recipe broccoli share; no removed cilantro garnish or extra oil is added.',['broccoli'],['Keep clean, covered, and cold for Cook Day roasting.']),
          ];
          setSteps(['Cook the labeled Harissa-glazed thighs in an uncrowded layer to 165 F. Any raw-contact glaze must also reach 165 F; only a separately reserved clean finish may be added later. Record actual time, pan load, chicken and glaze yield.','Roast the complete broccoli share and bring forward the recorded rice share. Do not duplicate the grain cook or add unlisted oil.','Pack the complete tier chicken/glaze allocation, rice share from 45 g Lean or 60 g Bulk dry input, and broccoli share from 100 g Lean or 130 g Bulk raw. Record packed weights; no recipe-required cup.']);
          method.portionPolicy={status:'recipe-specific-exception',reason:'Harissa raw pulls retain the current planning conversion; this coated/glazed method\'s measured meat and glaze recovery is not established.'};
          method.assemblyGuide={lean:['Pack the full Harissa chicken/glaze share from 232.5581 g raw thigh, rice from 45 g dry, and broccoli from 100 g raw. The 160 g cooked-meat reference is a planning target, not measured glazed yield.'],bulk:['Pack the full Harissa chicken/glaze share from 305.2326 g raw thigh, rice from 60 g dry, and broccoli from 130 g raw. The 210 g cooked-meat reference is a planning target, not measured glazed yield.']};
        }
        if (record.name==='Oven-Baked Popcorn Chicken') {
          const part=(type,name,keys,instruction,steps)=>currentPrep(type,name,instruction,keys,steps,{componentRef:'popcorn-chicken'});
          method.prepBatches=[
            part('protein-portion','Stage raw Popcorn chicken',['chicken_thigh_raw'],'Weigh the modeled 160 g raw thigh pull per serving; cut uniform bite-size pieces.',['The 160 g raw pull assumes 75% recovery for a 120 g cooked UNBREADED meat equivalent. That is not a validated yield or the finished coated weight.','Keep covered, labeled, and refrigerated. Bread on Cook Day, not overnight.']),
            part('measured-prep','Stage Popcorn flour',['flour'],'Weigh 5 g flour per serving into a clean labeled set.',['Keep dry and separate from the binder and crumb set until Cook Day.']),
            part('measured-prep','Stage Popcorn egg-white binder',['egg_white'],'Weigh 15 g egg white per serving.',['Keep covered at 41 F or below; issue only the needed amount to the contained raw-poultry breading station.']),
            part('measured-prep','Stage Popcorn seasoned panko',['kikkoman_panko','garlic_powder','paprika','black_pepper','salt'],'Use 25 g exact Kikkoman panko plus 1 g garlic powder, 0.5 g paprika, 0.2 g pepper, and 0.75 g salt per serving.',['Combine the measured dry crumb set. Verify the physical purchased panko panel before release; it contains wheat.']),
            part('measured-prep','Measure Popcorn coating and tray oil',['avocado_oil'],'Weigh exactly 3 g oil TOTAL per serving across coating and tray.',['Record the tray/coating split. Do not add an unmeasured spray or a second oil allowance.']),
          ];
          setSteps(['Before production release, run the controlled physical pilot with a separately authorized test pull. Do not consume a customer serving or silently create a reserve. Record raw meat, coating issued, time and tray load.','Coat uniform raw chicken pieces with the measured flour, then egg white, then seasoned panko. Track issued, leftover, and discarded coating; discard raw-contact leftovers rather than returning them to clean stock.','Use the one measured 3 g oil allowance across tray and coating. Bake in one uncrowded layer; 225 C / 437 F is only the source-inspired PILOT starting setting. Record actual mode, tray dimensions, load and time. Time and tray capacity remain unvalidated.','Probe representative thick pieces and confirm 165 F. Golden crumbs are not proof of a safe center. Record finished coated yield and measured meat recovery; finished coated weight does not establish 120 g unbreaded meat.','Cool in protected shallow pans under refrigeration or an ice bath. Record 135 F to 70 F within 2 hours and 41 F within 6 hours total; seal only after chilling and hold at 41 F or below.','Pack one full controlled serving in the proposed 12 oz container only after actual coated net weight and fit are verified. Record fresh and 24/72-hour oven or air-fryer reheat quality to 165 F. No mandatory dip is included.']);
          method.temperature='Pilot oven start 225 C / 437 F; chicken core 165 F. Time and tray capacity unvalidated.';
          method.hold='Protected shallow-pan cooling: 135 F to 70 F within 2 hours, 41 F within 6 hours total; then covered cold holding at 41 F or below.';
          method.proteinCook={group:'chicken',name:'Popcorn chicken pilot',endpoint:'165 F',recipeKeys:['chicken_thigh_raw'],recipeSteps:method.steps.slice(0,4),prepDayComplete:false,ovenTemperatureF:437,estimatedMinutes:0,timingStatus:'pilot-unvalidated'};
          method.cookDayEquipment={lane:'oven',ovenTemperatureF:437,estimatedMinutes:0,timingStatus:'pilot-unvalidated'};
          method.componentMap=[{role:'protein',label:'Popcorn raw meat planning pull',ingredientKeys:['chicken_thigh_raw'],handling:'160 g raw planning pull; measure actual recovery.'},{role:'component',label:'Popcorn coating and measured oil',ingredientKeys:['flour','egg_white','kikkoman_panko','garlic_powder','paprika','black_pepper','salt','avocado_oil'],handling:'All ingredient allocations remain popcorn-chicken; no duplicate component or oil.'}];
          method.portionPolicy={status:'recipe-specific-exception',reason:'120 g cooked unbreaded meat equivalent plus coating; raw conversion, retained coating/oil and actual finished net weight are unvalidated.'};
          method.assemblyGuide={single:['Pack 1 full controlled serving after measured yield and 12 oz fit checks. Do not weigh 120 g of finished breaded chicken as a substitute for the 120 g cooked-meat equivalent. No required dip.']};
          method.packBuildByTier={single:[{amount:'1 controlled serving',name:'120 g cooked UNBREADED meat equivalent plus the complete measured coating/oil allocation; actual coated net weight pending'}]};
          method.sideCups=0;method.sideCup=null;method.sideCupComponents=[];
          method.validation=[method.validation,'PRODUCTION PILOT OPEN: purchased chicken/panko panels, actual meat recovery, retained coating/oil, breading time, oven load/time, coated packout weight, 12 oz fit, protected cooling, and fresh/24/72-hour reheat. Full Nutrition Facts remains blocked by incomplete panko data. No physical test is marked passed.'].filter(Boolean).join(' ');
        }
        if(['Strawberry Cheesecake Protein Pancakes','PRPD Beef Bacon Breakfast Sandwich','Chicken Tikka Snack Wrap','Buffalo Chicken Pinwheels','Harissa Honey Chicken','Oven-Baked Popcorn Chicken'].includes(record.name)) method.prepSteps=method.prepBatches.map(task=>task.instruction);
      }
      methods[id]=method;
    }
    // Positional overrides below describe the completed Batch 16 layout only.
    if (liveProduction.batch===16) {
      const findTask=(mealId,name)=>methods[mealId]?.prepBatches?.find(task=>task.name===name);
      const removeKey=(task,key)=>{ if(task) task.ingredientKeys=(task.ingredientKeys||[]).filter(item=>item!==key); };
      const addKeys=(task,keys)=>{ if(task) task.ingredientKeys=[...new Set([...(task.ingredientKeys||[]),...keys])]; };

      const burritoBeef=findTask('b2','Stage breakfast-burrito beef filling');
      removeKey(burritoBeef,'salt');
      if(burritoBeef){
        burritoBeef.instruction='Keep raw beef isolated and weigh the exact beef, onion, and tomato-paste allocation. Add no salt.';
        burritoBeef.steps=[burritoBeef.instruction,'Cover, label, and refrigerate. Cook to 160 F and drain well on Cook Day.'];
      }

      const quesadillaChicken=findTask('b3','Breakfast Quesadilla chicken');
      addKeys(quesadillaChicken,['salt']);
      if(quesadillaChicken){
        quesadillaChicken.instruction='Add this chicken to the one shared seasoned aromatic thigh batch.';
        quesadillaChicken.steps=['Add this exact pull to the shared Quesadilla, Shakshuka, Slider, and Hummus Box chicken batch.','Season once with the shared salt, garlic, onion, paprika, and pepper, then divide and label every dish immediately. Use only a light cooking-oil drizzle when each pull reaches the pan.'];
        quesadillaChicken.seasoningFamily='batch16-shared-aromatic-chicken';
        quesadillaChicken.seasoningFamilyName='Shared Quesadilla, Shakshuka, Slider, and Hummus Box chicken';
        quesadillaChicken.seasoningBaseForm='Whole boneless skinless thighs';
        quesadillaChicken.splitAfterSeasoning=true;
      }
      const quesadillaKit=findTask('b3','Breakfast Quesadilla egg and wrap kit');
      addKeys(quesadillaKit,['small_tortilla']);
      removeKey(quesadillaKit,'corn_street_tortilla');
      removeKey(quesadillaKit,'egg'); removeKey(quesadillaKit,'egg_white');
      if(quesadillaKit){
        quesadillaKit.name='Breakfast Quesadilla wrap and cheese kit';
        quesadillaKit.instruction='Weigh the cheese and count 2 Lean or 3 Bulk Mission 70-calorie Carb Balance medium flour tortillas per meal. The eggs are cooked in the shared Prep Day egg batch.';
        quesadillaKit.steps=[quesadillaKit.instruction,'Keep tortillas sealed and dry. Cheese is added only during final assembly.'];
      }
      const burritoEgg=findTask('b2','Cook the separate burrito egg filling');
      if(burritoEgg){
        burritoEgg.name='Cook shared Quesadilla and Burrito egg base';
        burritoEgg.prepWave='shared-breakfast-eggs';
        burritoEgg.prepWaveName='One shared Quesadilla and Burrito egg cook';
        burritoEgg.workBatchGroup='shared-breakfast-eggs';
        burritoEgg.workBatchName='Shared Quesadilla and Burrito egg base';
        burritoEgg.steps=['Combine the complete measured whole-egg and liquid-egg-white pull for both dishes. Add no cheese.','Cook until fully set, record the finished yield, then divide into the labeled Burrito and Quesadilla destinations by exact order count. Rapid-cool and refrigerate.'];
      }
      if(methods.b3) methods.b3.prepBatches.push(job('cook-ahead','Cook shared Quesadilla and Burrito egg base',['egg','egg_white'],['Add this dish\'s measured whole eggs and egg whites to the one shared breakfast-egg cook. Add no cheese.','Use the recorded combined yield to divide the finished egg base into the labeled Quesadilla and Burrito destinations.'],{instruction:'Add the Quesadilla egg pull to the one shared Quesadilla and Burrito egg cook; cheese stays out until assembly.',includeAllRecipeIngredients:false,workflowOnly:false,releaseTiming:'prep-day',finishTiming:'prep-day',sequence:12,prepWave:'shared-breakfast-eggs',prepWaveName:'One shared Quesadilla and Burrito egg cook',workBatchGroup:'shared-breakfast-eggs',workBatchName:'Shared Quesadilla and Burrito egg base'}));

      const eggHash=findTask('b1','Roast potato hash');
      if(eggHash){
        eggHash.workBatchGroup='batch16-potato-roast';
        eggHash.workBatchName='One garlic-paprika potato and broccoli roast';
        eggHash.workOperation='roast';
        eggHash.workPrimaryKeys=['potato'];
        eggHash.ovenTemperatureF=400;
        eggHash.steps=['Combine this potato pull with the Loaded Buffalo potato and broccoli trays.','Season the complete roast once with the displayed salt, garlic powder, and paprika. Add only a light cooking-oil drizzle.','Roast at 400 F until browned and tender, record the finished yield, then divide into the two labeled destinations.'];
      }
      const eggBites=findTask('b1','Bake egg bites');
      if(eggBites){
        eggBites.stage='cook';
        eggBites.deferred=true;
        eggBites.releaseTiming='cook-day';
        eggBites.finishTiming='cook-day';
        eggBites.sequence=5;
        eggBites.instruction='Blend, portion, and bake the egg bites on Cook Day.';
        eggBites.steps=['Blend eggs, egg whites, and cottage cheese smooth. Fold in the measured cheese, vegetables, and seasonings.','Fill each assigned well with 60 g batter. Bake at 350 F to 160 F: 4 bites per Lean meal, 6 per Bulk meal.'];
      }
      methods.b3.steps=[
        'Pan-cook the shared-seasoned thighs in uncrowded batches to 165 F. Rest, dice finely, and record the cooked yield.',
        'Retrieve the chilled Quesadilla share of the Prep Day egg base. Divide chicken, egg, and cheese evenly across the exact Mission medium-tortilla count.',
        'Fold and dry-pan toast 2 Lean or 3 Bulk quesadillas until crisp and the cheese melts. Cool on a rack before sealing.',
      ];
      methods.b3.prepSteps=[
        'Season the compatible whole-thigh pull in the shared savory base, split this exact allocation into its labeled pan, and keep refrigerated for Cook Day.',
        'Add one whole egg plus 25 g liquid egg white per meal to the shared Quesadilla and Burrito Prep Day egg cook. Divide and label the finished yield by destination.',
        'Count 2 Lean or 3 Bulk Mission 70-calorie Carb Balance medium flour tortillas per meal and weigh the cheese separately.',
      ];
      methods.b3.cookDayReservations=[...methods.b3.steps];
      if(methods.b3.proteinCook) methods.b3.proteinCook.recipeSteps=[methods.b3.steps[0]];

      const seekhShape=findTask('m5','Shan Seekh beef mixture');
      if(seekhShape){
        seekhShape.type='protein-mix';
        seekhShape.name='Mix and shape Beef Seekh shawarma logs';
        seekhShape.pieceNoun='seekh log';
        seekhShape.pieceTargets={lean:{piecesPerServing:1,gramsPerPiece:170,label:'Lean seekh log'},bulk:{piecesPerServing:1,gramsPerPiece:210,label:'Bulk seekh log'}};
        seekhShape.reservePct=8;
        seekhShape.reserveFormulaIngredients=[
          {key:'beef_90_raw',name:'Ground beef 90/10, raw',unit:'g',lean:170,bulk:210,station:'Beef',includeInGrocery:false},
          {key:'shan_seekh',name:'Shan Seekh Kabab Recipe Mix',unit:'g',lean:3.4,bulk:4.2,station:'Dry Prep & Seasonings'},
          {key:'onion',name:'Grated and squeezed onion',unit:'g',lean:13.6,bulk:16.8,station:'Cold Prep & Produce'},
          {key:'garlic',name:'Garlic',unit:'g',lean:1.7,bulk:2.1,station:'Cold Prep & Produce'},
          {key:'jalapeno',name:'Jalapeno',unit:'g',lean:3.4,bulk:4.2,station:'Cold Prep & Produce'},
          {key:'paprika',name:'Paprika',unit:'g',lean:.51,bulk:.63,station:'Dry Prep & Seasonings'},
          {key:'cumin',name:'Ground cumin',unit:'g',lean:.34,bulk:.42,station:'Dry Prep & Seasonings'},
          {key:'coriander',name:'Ground coriander',unit:'g',lean:.34,bulk:.42,station:'Dry Prep & Seasonings'},
          {key:'black_pepper',name:'Ground black pepper',unit:'g',lean:.255,bulk:.315,station:'Dry Prep & Seasonings'},
          {key:'turmeric',name:'Ground turmeric',unit:'g',lean:.085,bulk:.105,station:'Dry Prep & Seasonings'},
          {key:'cayenne',name:'Ground cayenne',unit:'g',lean:.085,bulk:.105,station:'Dry Prep & Seasonings'},
        ];
        seekhShape.pieceWeightNote='Shape the sold Lean and Bulk logs at their exact raw-beef targets, then shape the displayed 8% spare count from the proportionally mixed reserve. Never reduce a customer log to create a spare.';
        seekhShape.steps=['Mix beef with exactly 20 g Shan Seekh powder per kg raw beef plus the displayed salt-free fresh aromatics and spices.','Grate the seasoning onion, squeeze it dry, then mix only until even. Add no salt, oil, suet, or butter.','Shape the exact sold Lean and Bulk log counts plus the displayed 8% spare count. Weigh every customer log, line the oven trays, cover, label, and refrigerate for Cook Day.'];
      }

      const noumanKofta=findTask('p1','Mix and shape Nouman 96/4 kofta');
      if(noumanKofta){
        noumanKofta.reservePct=8;
        noumanKofta.reserveFormulaIngredients=[
          {key:'beef_96_raw',name:'96/4 lean ground beef, raw',unit:'g',lean:66,station:'Beef',includeInGrocery:false},
          {key:'shan_seekh',name:'Shan Seekh Kabab Recipe Mix',unit:'g',lean:3.3,station:'Dry Prep & Seasonings'},
          {key:'onion',name:'Grated and squeezed onion',unit:'g',lean:5,station:'Cold Prep & Produce'},
          {key:'jalapeno',name:'Jalapeno',unit:'g',lean:2,station:'Cold Prep & Produce'},
          {key:'paprika',name:'Paprika',unit:'g',lean:.2,station:'Dry Prep & Seasonings'},
          {key:'black_pepper',name:'Ground black pepper',unit:'g',lean:.1,station:'Dry Prep & Seasonings'},
          {key:'salt',name:'Table salt',unit:'g',lean:.1,station:'Dry Prep & Seasonings'},
        ];
        noumanKofta.pieceWeightNote='Each 76.5 g target includes the drained onion and all seasoning. Shape five customer logs per meal plus the displayed 8% spare count. Never shrink a customer log to create a spare.';
        noumanKofta.steps=['Grate the onion, squeeze it dry, and use the listed retained onion weight. Finely mince the jalapeno.','Mix the 96/4 beef, drained onion, jalapeno, Shan mix, paprika, black pepper and salt only until even.','Shape five 76.5 g customer kofta logs per meal plus the displayed 8% spare count. Place them directly on the lined baking tray for tomorrow.'];
      }

      const shakshukaChicken=findTask('b4','Season Shakshuka chicken');
      addKeys(shakshukaChicken,['salt']);
      if(shakshukaChicken){
        shakshukaChicken.instruction='Add this chicken to the one shared seasoned aromatic thigh batch.';
        shakshukaChicken.steps=['Add this exact pull to the shared Quesadilla, Shakshuka, Slider, and Hummus Box chicken batch.','Season once with the shared salt, garlic, onion, paprika, and pepper, then divide and label every dish immediately. Use only a light cooking-oil drizzle when each pull reaches the pan.'];
        shakshukaChicken.seasoningFamily='batch16-shared-aromatic-chicken';
        shakshukaChicken.seasoningFamilyName='Shared Quesadilla, Shakshuka, Slider, and Hummus Box chicken';
        shakshukaChicken.seasoningBaseForm='Whole boneless skinless thighs';
        shakshukaChicken.splitAfterSeasoning=true;
      }
      const shakshukaBase=findTask('b4','Cook Shakshuka tomato-pepper base');
      removeKey(shakshukaBase,'crushed_tomatoes'); addKeys(shakshukaBase,['tomato']);
      if(shakshukaBase){
        shakshukaBase.instruction='Cook the fresh tomatoes, onion, pepper, paprika, garlic, and cumin down until thick and spoonable. Add no salt.';
        shakshukaBase.steps=['Soften onion and pepper. Add garlic, paprika, and cumin.','Add fresh tomatoes and simmer until thick and spoonable. Add no salt.','Record yield, rapid-cool, label, and refrigerate.'];
        shakshukaBase.stage='ahead';
        shakshukaBase.aheadWorkstation='sauce-bases';
        shakshukaBase.sequence=2;
      }

      const sliderChicken=findTask('m1','Hot Honey Slider chicken seasoning');
      if(sliderChicken){
        addKeys(sliderChicken,['garlic_powder','onion_powder','paprika','black_pepper']);
        sliderChicken.seasoningFamily='batch16-shared-aromatic-chicken';
        sliderChicken.seasoningFamilyName='Shared Quesadilla, Shakshuka, Slider, and Hummus Box chicken';
        sliderChicken.seasoningBaseForm='Whole boneless skinless thighs';
        sliderChicken.splitAfterSeasoning=true;
        sliderChicken.steps=['Add this exact pull to the shared Quesadilla, Shakshuka, Slider, and Hummus Box chicken batch.','Season once with the shared salt, garlic, onion, paprika, and pepper, then divide and label every dish immediately. Use only a light cooking-oil drizzle when each pull reaches the pan.'];
        sliderChicken.formulaIngredients=(sliderChicken.formulaIngredients||[]).map(item=>item.sourceKey==='salt'?{...item,key:'salt',sourceKey:'salt',name:'Table salt',lean:.5,bulk:.665}:item);
      }
      const sliderKit=findTask('m1','Hot Honey Slider assembly');
      if(sliderKit){
        sliderKit.ingredientKeys=['kings_hawaiian_roll','mozzarella','onion','pickles'];
        sliderKit.instruction='Stage the exact King\'s Hawaiian rolls, cheese, onion, and one drained pickle chip per slider.';
        sliderKit.steps=['Count 3 rolls and 3 pickle chips per Lean meal or 4 rolls and 4 pickle chips per Bulk meal. Plan 5 g drained weight per chip and record the actual drained pickle weight.','Keep rolls sealed; cover and refrigerate cheese, onion, and pickles.'];
      }
      methods.m1.prepBatches.push(job('sauce','Reserve slider Sweet Heat from the shared batch',['light_mayo','ketchup','honey','sriracha'],['Make the one current PRPD Sweet Heat batch for weekly cups and sliders.','Reserve the displayed incorporated slider share in a labeled container. Do not mix a separate slider sauce.'],{instruction:'Reserve the incorporated slider share from the one current PRPD Sweet Heat batch.',includeAllRecipeIngredients:false,workflowOnly:false,releaseTiming:'prep-day',finishTiming:'prep-day',sequence:12,componentRef:'batch13-sweet-heat',sharedSauceFamily:'batch13-sweet-heat',sauceDelivery:'incorporated',prepWave:'sauces',prepWaveName:'Current sauce batches'}));
      methods.m1.steps=['Roast chicken to 165 F and record its yield.','Split chicken evenly among the King\'s Hawaiian rolls; add mozzarella, onion, one drained pickle chip per slider, and the reserved shared-batch Sweet Heat.','Warm only until the cheese melts; do not dry the rolls.'];
      methods.m1.cookPackSteps=methods.m1.steps;
      methods.m1.cookDayReservations=methods.m1.steps;

      const butterMarinade=findTask('m2','Shan Butter Chicken marinade');
      if(butterMarinade){
        butterMarinade.ingredientAmounts={
          ...(butterMarinade.ingredientAmounts || {}),
          fage:{lean:15,bulk:15},
          shan_butter_chicken:{lean:3,bulk:3.75},
        };
        butterMarinade.steps=[
          'Reserve the sauce yogurt and sauce Shan before touching raw chicken.',
          'Cube the thighs. Mix with the displayed marinade yogurt, Shan, bottled lemon juice, garlic, and ginger. Add no salt.',
          'Cover and refrigerate. Keep every drop of marinade for cooking.',
        ];
      }
      const butterSauce=findTask('m2','Butter Chicken sauce');
      removeKey(butterSauce,'water'); addKeys(butterSauce,['crushed_tomatoes','paprika','cumin','coriander','turmeric','black_pepper','cayenne','shan_butter_chicken','fage']);
      if(butterSauce){
        butterSauce.ingredientAmounts={
          ...(butterSauce.ingredientAmounts || {}),
          shan_butter_chicken:{lean:2,bulk:2.5},
          fage:{lean:30,bulk:45},
        };
        butterSauce.instruction='Make only the smooth onion-tomato sauce base on Prep Day. Keep the displayed finishing yogurt cold in a separate labeled container for Cook Day.';
        butterSauce.steps=[
          'Before any raw chicken work, measure the displayed sauce yogurt into a separate labeled container. Cover and refrigerate at 41 F or below for Cook Day; do not add it to this base.',
          'Brown onion in the measured butter until deeply golden. Bloom only the displayed sauce Shan and spices, then brown the small tomato-paste amount.',
          'Add canned crushed tomatoes, simmer until the raw taste is gone, and blend completely smooth. Record the base yield separately from the reserved yogurt.',
          'Begin cooling the base promptly in shallow pans in the refrigerator with airflow or in an ice bath: 135 F to 70 F within 2 hours, then to 41 F within 6 hours total. Keep loosely covered and protected with no raw food above; seal, label and keep refrigerated when chilled.',
        ];
        butterSauce.stage='ahead';
        butterSauce.aheadWorkstation='sauce-bases';
        butterSauce.sequence=1;
      }
      methods.m2.steps=[
        'Brown the marinated chicken and cook it with all retained marinade to 165 F.',
        'Reheat the prepared smooth onion-tomato sauce base and combine with the cooked chicken. Do not remake the base or add a second dose of sauce Shan or spices.',
        'Take off direct heat and stir in the separately reserved finishing yogurt once until smooth. Use the rice from its assigned rice job; if already cooked and chilled, reheat it to 165 F rather than cooking a second batch.',
        'Pack by tier. Record finished chicken-sauce and rice yields separately, keeping all internal and customer allocations.',
      ];
      methods.m2.cookPackSteps=methods.m2.steps;
      methods.m2.cookDayReservations=methods.m2.steps;

      const buffaloChicken=findTask('m3','Loaded Buffalo chicken seasoning');
      addKeys(buffaloChicken,['water','apple_cider_vinegar','garlic_powder','paprika']);
      if(buffaloChicken){
        delete buffaloChicken.seasoningFamily;
        delete buffaloChicken.seasoningFamilyName;
        buffaloChicken.splitAfterSeasoning=false;
        buffaloChicken.steps=[
          'Keep this chicken separate. Apply only its displayed cooking oil.',
          'Mix the Buffalo finish exactly as displayed: sauce, water, apple-cider vinegar, garlic, and paprika.',
          'Cook chicken to 165 F, then coat it with the complete measured finish. Add no salt.',
        ];
      }
      const buffaloVegetables=findTask('m3','Loaded Buffalo potatoes and broccoli');
      if(buffaloVegetables){
        buffaloVegetables.steps=['Add the potatoes and broccoli to the one shared garlic-paprika roast.','Season the complete roast once with the displayed salt, garlic powder, and paprika. Add only a light cooking-oil drizzle.','Roast at 400 F, record the finished yield, then divide into the labeled Loaded Buffalo and Egg Bite destinations.'];
        buffaloVegetables.formulaIngredients=[
          ...(buffaloVegetables.formulaIngredients || []).filter(item=>!['salt','garlic_powder','paprika'].includes(item.sourceKey || item.key)),
          {key:'salt',name:'Salt for the Loaded Buffalo vegetable share',unit:'g',lean:.46,bulk:.5,includeInGrocery:false,measure:{type:'spice',gramsPerTsp:6}},
          {key:'garlic_powder',name:'Garlic powder for the Loaded Buffalo vegetable share',unit:'g',lean:1.375,bulk:1.5,includeInGrocery:false,measure:{type:'spice',gramsPerTsp:3.1}},
          {key:'paprika',name:'Paprika for the Loaded Buffalo vegetable share',unit:'g',lean:1.375,bulk:1.5,includeInGrocery:false,measure:{type:'spice',gramsPerTsp:2.3}},
        ];
        buffaloVegetables.workBatchGroup='batch16-potato-roast';
        buffaloVegetables.workBatchName='One garlic-paprika potato and broccoli roast';
        buffaloVegetables.workOperation='roast';
        buffaloVegetables.workPrimaryKeys=['potato'];
        buffaloVegetables.ovenTemperatureF=400;
      }
      methods.m3.steps=['Bring forward the measured share of the shared garlic-paprika potato and broccoli roast.','Roast chicken to 165 F, record yield, then coat with the complete reduced-sodium Buffalo finish.','Pack chicken, potatoes, and broccoli by tier.'];
      methods.m3.cookPackSteps=['Bring forward the recorded Prep Day roasted potato and broccoli yields. Do not roast a second batch.','Roast chicken to 165 F, record yield, then coat it with the complete measured Buffalo sauce, water, vinegar, garlic, and paprika finish. Add no salt.','Divide the finished chicken, potatoes, and broccoli by the exact tier builds and cool promptly.'];
      methods.m3.cookDayReservations=methods.m3.cookPackSteps;

      const bbqChicken=findTask('m4','BBQ Mac chicken');
      removeKey(bbqChicken,'salt');
      if(bbqChicken){
        delete bbqChicken.seasoningFamily;
        delete bbqChicken.seasoningFamilyName;
        bbqChicken.splitAfterSeasoning=false;
        bbqChicken.steps=['Season the BBQ Mac thigh pull separately with its displayed salt-free garlic, onion, paprika, and pepper.','Keep thighs whole. Cut or shred only after they reach 165 F and rest.'];
      }
      const bbqFinish=findTask('m4','BBQ sauce added during Mac assembly');
      if(bbqFinish) bbqFinish.steps=['Mix exactly 20 g BBQ sauce, 5 g apple-cider vinegar, and 5 g water per meal.','Use the complete 30 g finish in the dish. Keep it separate from the matching 30 g customer side cups.'];
      const bbqCups=findTask('m4','BBQ Mac customer sauce cups');
      if(bbqCups) bbqCups.steps=['Tare each cup and fill exactly 30 g net with the matching G Hughes BBQ sauce.','Seal, count, label, date, and refrigerate one cup per active meal.'];
      methods.m4.steps=['Cook the measured chicken thigh pull in uncrowded batches to 165 F and record the cooked yield.','Bring forward the recorded Prep Day macaroni yield. Do not cook a second batch.','Fold the complete incorporated 30 g lower-sodium BBQ finish and mozzarella through the chicken and macaroni. Divide by tier.','Stage one sealed 30 g matching BBQ sauce cup per meal for Customer Pack-out. Keep every cup out of the meal container.'];
      methods.m4.cookPackSteps=methods.m4.steps;
      methods.m4.cookDayReservations=methods.m4.steps;

      if(methods.bw1?.recipeName==='Sweet Chili Chicken with Rice'){
        const sweetChiliGlaze=findTask('bw1','Mix the incorporated Sweet Chili glaze');
        addKeys(sweetChiliGlaze,['soy_sauce','garlic']);
        if(sweetChiliGlaze) sweetChiliGlaze.steps=['Whisk the displayed Sweet Chili sauce, low-sodium soy sauce, and minced garlic until uniform.','Cover and refrigerate separately from the raw chicken and customer side cups.'];
        methods.bw1.steps=['Bring forward the recorded plain-rice yield.','Cook the seasoned chicken to 165 F and record the cooked yield. Coat it with the measured incorporated Sweet Chili glaze only after cooking.','Stage one sealed 30 g matching Sweet Chili sauce cup per meal for Customer Pack-out. Keep every cup out of the meal container.'];
        methods.bw1.cookPackSteps=methods.bw1.steps;
        methods.bw1.cookDayReservations=methods.bw1.steps;
      }

      const noumanDressing=findTask('p2','Fill Nouman lemon-garlic dressing cups');
      if(noumanDressing){
        noumanDressing.name='Fill Nouman lemon-mustard-garlic dressing cups';
        noumanDressing.instruction='Whisk the displayed avocado oil, bottled lemon juice, prepared Dijon mustard, garlic, salt, and black pepper until uniform.';
        noumanDressing.steps=[
          noumanDressing.instruction,
          'Tare and fill one 15 g cup per chicken-mince meal, then seal, label, date, and refrigerate.',
        ];
      }
      if(methods.p2){
        methods.p2.steps=[
          'Cook the chicken qeema to 165 F with 60 g water per meal. Keep it moist and lightly saucy, then record the finished yield.',
          'Cut and season the kachumber. Portion exactly 205 g into each separate cold salad box.',
          'Stage one 15 g lemon-mustard-garlic dressing cup and one 40 g Sweet Heat cup per meal for Customer Pack-out. Keep both cups loose in the customer bag.',
        ];
        methods.p2.cookPackSteps=methods.p2.steps;
        methods.p2.cookDayReservations=methods.p2.steps;
      }

      const seekhMix=findTask('m5','Shan Seekh beef mixture') || findTask('m5','Mix and shape Beef Seekh shawarma logs');
      addKeys(seekhMix,['onion','garlic','jalapeno','paprika','cumin','coriander','black_pepper','turmeric','cayenne']);
      if(seekhMix){
        seekhMix.type='protein-mix';
        seekhMix.name='Mix and shape Beef Seekh shawarma logs';
        seekhMix.instruction='Mix beef with exactly 20 g Shan Seekh powder per kg raw beef plus the displayed salt-free fresh aromatics and spices.';
        seekhMix.pieceNoun='seekh log';
        seekhMix.pieceTargets={lean:{piecesPerServing:1,gramsPerPiece:170,label:'Lean seekh log'},bulk:{piecesPerServing:1,gramsPerPiece:210,label:'Bulk seekh log'}};
        seekhMix.reservePct=8;
        seekhMix.reserveFormulaIngredients=[
          {key:'beef_90_raw',name:'Ground beef 90/10, raw',unit:'g',lean:170,bulk:210,station:'Beef',includeInGrocery:false},
          {key:'shan_seekh',name:'Shan Seekh Kabab Recipe Mix',unit:'g',lean:3.4,bulk:4.2,station:'Dry Prep & Seasonings'},
          {key:'onion',name:'Grated and squeezed onion',unit:'g',lean:13.6,bulk:16.8,station:'Cold Prep & Produce'},
          {key:'garlic',name:'Garlic',unit:'g',lean:1.7,bulk:2.1,station:'Cold Prep & Produce'},
          {key:'jalapeno',name:'Jalapeno',unit:'g',lean:3.4,bulk:4.2,station:'Cold Prep & Produce'},
          {key:'paprika',name:'Paprika',unit:'g',lean:.51,bulk:.63,station:'Dry Prep & Seasonings'},
          {key:'cumin',name:'Ground cumin',unit:'g',lean:.34,bulk:.42,station:'Dry Prep & Seasonings'},
          {key:'coriander',name:'Ground coriander',unit:'g',lean:.34,bulk:.42,station:'Dry Prep & Seasonings'},
          {key:'black_pepper',name:'Ground black pepper',unit:'g',lean:.255,bulk:.315,station:'Dry Prep & Seasonings'},
          {key:'turmeric',name:'Ground turmeric',unit:'g',lean:.085,bulk:.105,station:'Dry Prep & Seasonings'},
          {key:'cayenne',name:'Ground cayenne',unit:'g',lean:.085,bulk:.105,station:'Dry Prep & Seasonings'},
        ];
        seekhMix.pieceWeightNote='Shape the sold Lean and Bulk logs at their exact raw-beef targets, then shape the displayed 8% spare count from the proportionally mixed reserve. Never reduce a customer log to create a spare.';
        seekhMix.steps=[seekhMix.instruction,'Grate the seasoning onion, squeeze it dry, then mix only until even. Add no salt, oil, suet, or butter.','Shape the exact sold Lean and Bulk log counts plus the displayed 8% spare count. Weigh every customer log, line the oven trays, cover, label, and refrigerate for Cook Day.'];
        seekhMix.ingredientAmounts={
          onion:{lean:13.6,bulk:16.8},
          garlic:{lean:1.7,bulk:2.1},
          jalapeno:{lean:3.4,bulk:4.2},
          cumin:{lean:.34,bulk:.42},
        };
      }
      const seekhSauce=findTask('m5','White garlic sauce');
      if(seekhSauce){
        seekhSauce.name='Use shared Garlic Herb Yogurt';
        seekhSauce.componentRef='garlic-herb-yogurt';
        seekhSauce.sharedSauceFamily='garlic-herb-yogurt';
        seekhSauce.sauceVariant='current';
        seekhSauce.instruction='Make one Garlic Herb Yogurt batch for every weekly cup and incorporated use. Reserve 30 g per Seekh meal from that same batch.';
        seekhSauce.steps=['Whisk the current Garlic Herb Yogurt formula once until uniform.','Reserve the displayed Seekh allocation in a labeled incorporated-use container. Do not make a separate white-garlic base or second yogurt batch.'];
      }
      if(!findTask('m5','Reserve Seekh Garlic Herb Yogurt')) methods.m5.prepBatches.push(job('sauce','Reserve Seekh Garlic Herb Yogurt',['fage','lemon','garlic','cumin','light_mayo','cilantro','jalapeno','parsley','salt'],[
        'Make one shared Garlic Herb Yogurt batch for every weekly cup and every incorporated meal use.',
        'Reserve exactly 30 g per Seekh meal in one labeled incorporated-use container. Do not fill individual Seekh cups.',
      ],{instruction:'Reserve the Seekh share from the one Garlic Herb Yogurt batch.',componentRef:'garlic-herb-yogurt',ingredientAmounts:{fage:{perServing:21.9707},light_mayo:{perServing:3.3289},lemon:{perServing:1.3316},garlic:{perServing:.3995},jalapeno:{perServing:.7989},cumin:{perServing:.1398},cilantro:{perServing:1.3316},parsley:{perServing:.3995},salt:{perServing:.2996}},sharedSauceFamily:'garlic-herb-yogurt',sauceDelivery:'incorporated',sauceUse:'Spread 30 g inside each Seekh shawarma.',prepWave:'sauces',prepWaveName:'Current sauce batches'}));
      const seekhKit=findTask('m5','Seekh bread, salad and garnish');
      addKeys(seekhKit,['cucumber','cilantro']);
      if(seekhKit){
        seekhKit.steps=['Wash and dry lettuce, cucumber, and cilantro. Slice the salad onion, chop the cilantro, and drain the reduced pickle allocation.','Count the exact flatbread allocation and keep it dry.'];
        seekhKit.ingredientAmounts={onion:{lean:15,bulk:15},cilantro:{lean:2,bulk:2}};
      }
      methods.m5.steps=['Bake the formed kebabs at 400 F to 160 F, drain fat, and record cooked yield.','Warm the exact tier flatbread and spread its measured Garlic Herb Yogurt.','Add the measured beef, lettuce, cucumber, salad onion, cilantro, and light pickle allocation; roll or fold securely.'];
      methods.m5.cookPackSteps=methods.m5.steps;
      methods.m5.cookDayReservations=methods.m5.steps;

      methods.m6.steps=['Bring forward the recorded Prep Day lemon-herb quinoa and garlic green-bean yields. Do not cook either side a second time.','Bake the separately Cajun-seasoned salmon skin-side down to 145 F, remove skin, check pin bones, and record the edible cooked yield.','Plate the measured salmon, quinoa, and green beans; finish with the reserved cilantro and cool promptly.'];
      methods.m6.cookPackSteps=methods.m6.steps;
      methods.m6.cookDayReservations=methods.m6.steps;

      const mash=findTask('m7','Prepare Idahoan garlic-rosemary mash');
      removeKey(mash,'garlic');
      addKeys(mash,['garlic_powder','salt']);
      if(mash){
        mash.instruction='Use the October 20 owner-tested Idahoan Original formula with extra cold milk, controlled salt, garlic powder, and rosemary. Do not use chopped fresh garlic or fresh potatoes.';
        mash.steps=[
          'Use Idahoan Original unflavored mashed potato flakes with the displayed water, cold Fairlife milk, butter, salt, garlic powder, and rosemary. Do not peel, cut, boil, or mash fresh potatoes.',
          'Bring the displayed water, butter, and salt to a boil, then remove the pot from the heat.',
          'Add the displayed cold Fairlife milk. Sprinkle in the flakes and garlic powder, stir gently until evenly moistened, and let stand for 2 minutes.',
          'Fold in the finely chopped rosemary and whip lightly with a fork or spoon. Do not blend or add unmeasured liquid.',
          'Record finished mash yield. The formula includes a small handling/tasting allowance; pack exactly 180 g Lean or 240 g Bulk, rapid-cool, and refrigerate at 41 F or below.',
        ];
      }

      const tikkaMarinade=findTask('a1','Make Tikka marinade');
      if(tikkaMarinade){
        tikkaMarinade.instruction='Whisk the displayed yogurt, lemon, garlic, salt-free spices, and oil.';
        tikkaMarinade.steps=[tikkaMarinade.instruction,'Coat only the labeled chicken, cover, and refrigerate. Add no salt.'];
      }

      const pinwheelChicken=findTask('a2','Pinwheel chicken');
      removeKey(pinwheelChicken,'salt');
      if(pinwheelChicken){
        delete pinwheelChicken.seasoningFamily;
        delete pinwheelChicken.seasoningFamilyName;
        pinwheelChicken.splitAfterSeasoning=false;
        pinwheelChicken.instruction='Use the displayed salt-free garlic, onion, paprika, and pepper base. Keep whole, covered, and refrigerated for Cook Day.';
        pinwheelChicken.steps=['Season the Pinwheel thigh pull separately with its displayed salt-free garlic, onion, paprika, and pepper.','Keep it isolated from the salty Buffalo filling. Cover, label, and refrigerate.'];
      }
      const pinwheelFilling=findTask('a2','Buffalo filling base');
      addKeys(pinwheelFilling,['apple_cider_vinegar','water']);
      if(pinwheelFilling) pinwheelFilling.steps=['Mix cream cheese, mozzarella, 5 g Buffalo sauce, 2 g apple-cider vinegar, 3 g water, and minced onion per order.','Cover and refrigerate at 41 F or below. Add only rapidly chilled cooked chicken.'];
      const pinwheelKit=findTask('a2','Pinwheel tortillas and lettuce');
      removeKey(pinwheelKit,'lavash');
      addKeys(pinwheelKit,['small_tortilla']);
      if(pinwheelKit){pinwheelKit.name='Pinwheel tortilla and lettuce';pinwheelKit.instruction='Keep one 70-calorie Mission Carb Balance medium flour tortilla per order sealed and the lettuce completely dry for assembly.';pinwheelKit.steps=[pinwheelKit.instruction];}
      methods.a2.steps=['Cook the salt-free seasoned thighs to 165 F, record yield, shred, and rapid-cool to 41 F or below.','Mix chilled chicken into the prepared Buffalo filling. Spread the complete order across one 70-calorie Mission Carb Balance medium flour tortilla and add dry lettuce.','Roll tightly, chill until firm, cut into exactly four pinwheel pieces, and pack the complete order.'];
      methods.a2.cookPackSteps=methods.a2.steps;
      methods.a2.cookDayReservations=methods.a2.steps;
      methods.a2.packBuildByTier={single:[{amount:'1',name:'Mission Carb Balance medium flour tortilla'},{amount:'1 finished portion',name:'Buffalo chicken filling made from the controlled 100 g raw thigh pull'},{amount:'20 g',name:'completely dry shredded lettuce'},{amount:'4',name:'equal pinwheel pieces'}]};

      const hummusChicken=findTask('a3','Hummus Box lemon chicken');
      addKeys(hummusChicken,['salt']);
      if(hummusChicken){
        hummusChicken.instruction='Add this chicken to the one shared seasoned aromatic thigh batch.';
        hummusChicken.steps=['Add this exact pull to the shared Quesadilla, Shakshuka, Slider, and Hummus Box chicken batch.','Season once with the shared salt, garlic, onion, paprika, and pepper, then divide and label every dish immediately. Use only a light cooking-oil drizzle when each pull reaches the pan.','Add the displayed bottled lemon juice only after the Hummus Box pull is separated.'];
        hummusChicken.seasoningFamily='batch16-shared-aromatic-chicken';
        hummusChicken.seasoningFamilyName='Shared Quesadilla, Shakshuka, Slider, and Hummus Box chicken';
        hummusChicken.splitAfterSeasoning=true;
      }
      methods.a3.cookPackSteps=['Cook the shared-seasoned lemon chicken to 165 F, record yield, dice, and rapid-cool to 41 F or below.','Cut the vegetables fresh and keep every chilled component at 41 F or below.','Pack the complete chicken portion made from 100 g raw thigh with 60 g hummus, half a flatbread, 50 g cucumber, 50 g tomato, 14 g feta, 15 g olives, and 10 g onion.'];
      methods.a3.packBuildByTier={single:[{amount:'1 finished portion',name:'chilled chicken made from the controlled 100 g raw thigh pull'},{amount:'60 g',name:'hummus'},{amount:'½',name:'flatbread'},{amount:'50 g',name:'cucumber'},{amount:'50 g',name:'tomato'},{amount:'14 g',name:'feta'},{amount:'15 g',name:'drained olives'},{amount:'10 g',name:'onion'}]};

      if(methods.m7){
        methods.m7.productionSequence=1;
        const shortRibBraise=findTask('m7','Braise and debone the short ribs; chill the jus overnight');
        if(shortRibBraise){
          shortRibBraise.sequence=0;
          shortRibBraise.instruction='Start this first. Weigh and record the complete raw bone-in short-rib pull before searing.';
          shortRibBraise.ingredientKeys=(shortRibBraise.ingredientKeys||[]).filter(key=>key!=='short_rib_cooked');
          shortRibBraise.formulaIngredients=[
            {key:'short_rib_cooked',sourceKey:'short_rib_cooked',name:'Bone-in beef short ribs, raw, before the separate 5% reserve',unit:'g',lean:302.4,station:'Meat & Seafood',includeInGrocery:false},
          ];
          shortRibBraise.steps=['Start first: weigh the complete raw bone-in pull, then sear in batches until deeply browned.','Brown onion, carrot, celery, and garlic. Toast tomato paste, deglaze, add the measured braising ingredients, cover, and braise at 325 F until very tender.','Debone completely. Record edible meat and strained jus yields, then chill them separately so the fat can be lifted cleanly.'];
        }
        methods.m7.cookPackSteps=[...(methods.m7.steps || [])];
      }
    }
    data.batch=liveProduction.batch;
    data.version=liveProduction.version;
    data.meals=methods;
    data.dishNames=Object.fromEntries(Object.entries(liveProduction.meals || {}).map(([id,record])=>[id,record.name]));
    data.methodsByName=Object.fromEntries(Object.values(methods).map(method=>[method.recipeName,method]));
    data.familyPlatingReservations=[];
    data.groceryAdjustments=liveProduction.batch===14 ? [
      {key:'canned_peas_carrots',name:'Canned peas and carrots',unit:'g',delta:-74,reason:'Batch 14 owner pantry substitution: replace the one Shrimp meal\'s 74 g canned blend with equal drained peas and fresh carrot.'},
      {key:'canned_peas',name:'Canned sweet peas, drained',unit:'g',delta:37,station:'Cold Prep & Produce',reason:'Batch 14 owner pantry substitution: use 37 g of the canned peas already at home for the Shrimp meal.'},
      {key:'carrot',name:'Fresh carrot',unit:'g',delta:37,station:'Cold Prep & Produce',reason:'Batch 14 owner pantry substitution: buy one carrot and use 37 g in the Shrimp meal.'},
    ] : [];
    if(liveProduction.batch===19) data.groceryAdjustments.push({
      key:'tortilla_chips',name:'Tortilla chips, owner shopping item',unit:'each',delta:1,
      station:'Pantry & Sauces',reason:'One bag requested for this week; no meal recipe allocation.',
    });
    data.rawProteinReserveByDish=liveProduction.batch===16 ? {m5:100/7,p1:8} : {};
    data.sharedProteinSeasoning=[];
    data.extraPackaging=liveProduction.batch===16 ? [{
      key:'cling_film_roll',name:'Clear food-service cling film / transparent plastic wrap',unit:'each',station:'Packaging',required:1,
    }] : [];
    if(liveProduction.batch===19) data.extraPackaging.push({
      key:'food_prep_gloves',name:'Disposable food-prep gloves',unit:'box',station:'Packaging',required:1,
    });
    const buildInternalExtra = (dishId, label, ownerServings, tier='lean') => {
      const sideCups=(methods[dishId]?.sideCupComponents || [])
        .reduce((sum,cup)=>sum+(Number(cup.cupsPerMeal)||1),0);
      const packageType=liveProduction.meals[dishId]?.packageType
        || (liveProduction.meals[dishId]?.category==='Add-on'?'grab_go':'meal');
      return {
        id:`batch${liveProduction.batch}-internal-${dishId}-${tier}`,
        dishId,
        label:`Internal ${label} x ${ownerServings}`,
        ownerServings,
        tier,
        optional:false,
        enabled:true,
        note:`Make ${ownerServings} additional ${tier === 'single' ? '' : tier === 'lean' ? 'Lean ' : 'Bulk '}${label} ${ownerServings === 1 ? 'meal' : 'meals'} for home. These are explicit internal meals, not customer orders, and receive no customer labels.`,
        ingredients:(liveProduction.meals[dishId]?.tiers?.[tier]?.ingredients || []).map(ingredient=>({
          ...JSON.parse(JSON.stringify(ingredient)),
          amount:(Number(ingredient.amount)||0)*ownerServings,
          allocations:Object.fromEntries(Object.entries(ingredient.allocations || {}).map(([component,amount])=>[
            component,
            (Number(amount)||0)*ownerServings,
          ])),
        })),
        packaging:[
          {key:packageType==='grab_go'?'grab_go_container':'meal_container',name:packageType==='grab_go'?'12 oz Grab & Go box with lid':'Meal container with lid',unit:'each',station:'Packaging',required:ownerServings},
          ...(sideCups ? [{key:'sauce_cup',name:'2 oz sauce cup with lid',unit:'each',station:'Packaging',required:sideCups*ownerServings}] : []),
        ],
      };
    };
    data.productionExtras=liveProduction.batch===19 ? [
      buildInternalExtra('m6','Mango Habanero Chicken Wings',2,'bulk'),
      buildInternalExtra('b3','Beef Bacon Breakfast Pizza',1,'lean'),
      buildInternalExtra('m1','BBQ Chicken Mac & Cheese',2,'lean'),
      buildInternalExtra('a1','Oven-Baked Popcorn Chicken',2,'single'),
    ] : liveProduction.batch===16 ? [
      buildInternalExtra('m1','Hot Honey Chicken Sliders',1),
      buildInternalExtra('m4','BBQ Chicken Mac & Cheese',1),
      buildInternalExtra('m2','Butter Chicken',2),
    ] : liveProduction.batch===15 ? [
      buildInternalExtra('m7','Braised Beef Short Rib',3),
      buildInternalExtra('m2','Creamy Cajun Chicken Pasta',1),
      buildInternalExtra('m3','Chicken Enchilada Bake',1),
      buildInternalExtra('m4','High-Protein Beef Lasagna',1),
    ] : liveProduction.batch===14 ? [
      ['b3','Grilled Cheese Breakfast Burrito'],
      ['m1','Mexican Streetcorn Chicken Bowl'],
      ['m2','Cheesy Achiote Chicken Tacos'],
      ['m3','Meatball Arrabbiata Pasta'],
      ['bw1','Chicken Shakshuka'],
    ].map(([dishId,label])=>({
      id:`batch14-owner-extra-${dishId}`,
      dishId,
      label:`Owner extra Lean ${label}`,
      ownerServings:1,
      tier:'lean',
      optional:true,
      enabled:false,
      note:`Make one additional Lean ${label} for owner inventory. This is not a customer order and receives no customer label.`,
      ingredients:JSON.parse(JSON.stringify(liveProduction.meals[dishId]?.tiers?.lean?.ingredients || [])),
      packaging:[
        {key:'meal_container',name:'Meal container with lid',unit:'each',station:'Packaging',required:1},
        ...((methods[dishId]?.sideCupComponents || []).length ? [{
          key:'sauce_cup',name:'2 oz sauce cup with lid',unit:'each',station:'Packaging',
          required:(methods[dishId].sideCupComponents || []).reduce((sum,cup)=>sum+(Number(cup.cupsPerMeal)||1),0),
        }] : []),
      ],
    })) : [];
    if (liveProduction.batch===15) {
      data.weeklySauces={
        enabled:true,
        selectedSauce:'Green jalapeño yogurt',
        assignmentStatus:'Batch 15: one 45 g green jalapeño-yogurt cup with every standard savory PRPD meal.',
        eligibleMealIds:Object.entries(methods).filter(([,method])=>(method.sideCupComponents || []).length).map(([id])=>id),
        sauces:[],
        policy:'Desserts, pancake topping, grab-and-go items, and Nouman custom meals keep their own controlled service. All other current savory meals receive one weekly green cup.',
      };
    } else if (liveConfig?.sauceProgram?.enabled) {
      data.weeklySauces={
        enabled:true,
        selectionMode:'order-selections',
        complimentaryPerOrder:liveProduction.batch===19?1:0,
        complimentaryDefaultSauceId:'cucumber-dill-tzatziki',
        eligibleMealIds:[],
        sauces:liveConfig.sauceProgram.choices || [],
        policy:liveProduction.batch===19
          ? 'Customer-selected order-level cups plus one complimentary 40 g weekly sauce cup per customer order. Match an ordered sauce when present; otherwise pack Cucumber Dill Tzatziki. Recipe cups remain separate.'
          : 'Only customer-selected order-level cups. Recipe cups remain separate.',
      };
    } else {
      data.weeklySauces={
        enabled:false,
        selectedSauce:'',
        assignmentStatus:'No weekly blanket sauce program is active.',
        eligibleMealIds:Object.entries(methods).filter(([,method])=>(method.sideCupComponents || []).length).map(([id])=>id),
        sauces:[],
        policy:'Sauce inputs are recipe-controlled and scale with current orders. No blanket sauce multiplier and no archived sauce fallback.',
      };
    }
    data.phases=[
      {title:'1. Reconcile, print, and label',detail:'Sync the current order snapshot, verify the batch number, print labels and stage exact packaging.'},
      {title:'2. Current recipe kits',detail:'Pull only the active generated recipes. Weigh and label every destination set before cooking.'},
      {title:'3. Sauces and cold work',detail:'Make every current recipe-specific sauce and cup from the displayed measured totals, then complete cold components.'},
      {title:'4. Starches, vegetables, and baked items',detail:'Complete measured non-protein work, record yields and rapid-cool.'},
      {title:'5. Continuous protein block',detail:'Cook each labeled protein batch to its safe endpoint, record yields, then sanitize the raw station.'},
      {title:'6. Assemble by current SKU',detail:'Follow the generated tier cards, add the exact cups, seal and refrigerate.'},
      {title:'7. Customer pack-out',detail:'Pack one customer at a time and reconcile every item, add-on, dessert and sauce cup.'},
    ];
  }

  if(Number(data.batch)>=17) {
    data.labelExemptCustomers=[...new Set([...(data.labelExemptCustomers || []),'Home'])];
    const wings=Object.values(data.meals).find(method=>method.recipeName==='Mango Habanero Chicken Wings');
    if(wings) {
      const currentWingPieces=Number(data.batch)>=19?{lean:6,bulk:8}:{lean:8,bulk:10};
      wings.single=false;
      wings.wingPiecesByTier=currentWingPieces;
      wings.prepBatches=[
        prep('marinade','Count and season split wings','Count individual flats and drumettes, not whole joined wings.',['chicken_wings_raw',Number(data.batch)>=19?'avocado_oil':'sunflower_oil','salt','paprika','garlic_powder','onion_powder'],[
          `Count ${currentWingPieces.lean} individual split flats/drumettes per Lean box and ${currentWingPieces.bulk} per Bulk box. Keep mixed flats and drumettes. ${Number(data.batch)>=19?'The owner-measured purchase lot is 49 split pieces / 3768 g raw bone-in (76.9 g each on average). Compare this stock with the current order count. ':''}Weigh each actual raw bone-in portion; the displayed grams are a lot-average planning allocation, not an exact portion target.`,
          'Apply only the displayed oil and dry seasoning. Cover, label, date and refrigerate separately from boneless chicken.',
        ],{proteinForm:`Individual bone-in flats/drumettes; Lean ${currentWingPieces.lean} pieces, Bulk ${currentWingPieces.bulk}`}),
        prep('sauce','Stage clean mango habanero finish','Keep the complete displayed tier sauce allocation separate from raw chicken.',['mango_habanero_sauce'],[
          'Verify the exact purchased sauce and allergen panel. Measure the displayed allocation into a covered clean container; do not reuse raw-contact marinade as a finishing sauce.',
        ]),
        prep('sauce','Fill bottled ranch cups','Use one separate 40 g planning cup per wing box; purchased bottle identity and panel remain pending.',['bottled_ranch'],[
          'Verify the exact ranch product before release. Tare and fill one 40 g net cup per wing box, seal, label and refrigerate at 41 F or below.',
        ],{componentRef:'bottled-ranch'}),
        ...(Number(data.batch)>=19?[prep('sauce','Fill mango habanero dip cups','Use one separate 20 g clean mango-habanero dip cup per wing box.',['mango_habanero_sauce'],[
          'Use only sauce that has never touched raw wings. Tare and fill one 20 g net cup per box, seal, label and refrigerate at 41 F or below.',
        ],{componentRef:'wings-extra-dip'})]:[]),
      ];
      wings.proteinCook={...(wings.proteinCook || {}),group:'chicken_wings_raw',recipeKeys:['chicken_wings_raw'],endpoint:'165 F away from bone',recipeSteps:[
        'Air-fry or oven-cook the counted seasoned wings in uncrowded batches until crisp and 165 F in the thickest edible meat away from bone. Record actual settings, tray load, raw bone-in weight, finished count and yield.',
      ]};
      wings.steps=[
        ...wings.proteinCook.recipeSteps,
        'Toss the cooked wings with only the measured clean mango habanero finish. Do not add a second unmeasured coating.',
        `Pack ${currentWingPieces.lean} split pieces per Lean box or ${currentWingPieces.bulk} per Bulk box. Include one separately sealed 40 g bottled ranch cup${Number(data.batch)>=19?' and one 20 g mango-habanero dip cup':''} per box. No starch or vegetable side is assigned. Cool under protection, record both checkpoints and refrigerate.`,
      ];
      wings.cookPackSteps=wings.steps;
      wings.cookDayReservations=wings.steps;
      wings.temperature=`Cook wings to 165 F away from bone. Lean ${currentWingPieces.lean} individual pieces; Bulk ${currentWingPieces.bulk}. The purchased-lot average is measured for Batch 19; actual portion weights and cooked edible yield remain unmeasured.`;
      wings.sideCup=null;
      wings.sideCups=Number(data.batch)>=19?2:1;
      wings.sideCupComponents=[
        {name:'Bottled ranch',batchGroup:'bottled-ranch',componentRef:'bottled-ranch',ingredientKeys:['bottled_ranch'],cupsPerMeal:1,gramsPerMeal:40},
        ...(Number(data.batch)>=19?[{name:'Mango habanero dip',batchGroup:'wings-extra-dip',componentRef:'wings-extra-dip',ingredientKeys:['mango_habanero_sauce'],cupsPerMeal:1,gramsPerMeal:20}]:[]),
      ];
      wings.packBuildByTier={
        lean:[{amount:`${currentWingPieces.lean} individual pieces`,name:'cooked mango-habanero-coated split flats/drumettes'}],
        bulk:[{amount:`${currentWingPieces.bulk} individual pieces`,name:'cooked mango-habanero-coated split flats/drumettes'}],
      };
      wings.assemblyGuide={
        lean:[`Pack ${currentWingPieces.lean} individual split flats/drumettes, one separate 40 g bottled ranch cup${Number(data.batch)>=19?' and one 20 g mango-habanero dip cup':''}. Record actual raw and cooked weights; no nutrition label is released.`],
        bulk:[`Pack ${currentWingPieces.bulk} individual split flats/drumettes, one separate 40 g bottled ranch cup${Number(data.batch)>=19?' and one 20 g mango-habanero dip cup':''}. Record actual raw and cooked weights; no nutrition label is released.`],
      };
      wings.validation='Batch 19 owner-measured wing lot is 49 split pieces / 3768 g raw bone-in; weigh actual portion pulls and verify purchased sauce/ranch panels, seasoning coverage, cooked edible yield, fit and cooling. No full nutrition label is released.';
    }
    if(Number(data.batch)>=19) {
      const lasagna=Object.values(data.meals).find(method=>method.recipeName==='High-Protein Beef Lasagna');
      if(lasagna) {
        const sauce=lasagna.prepBatches.find(task=>task.name==='PRPD lasagna tomato meat sauce');
        if(sauce) {
          sauce.instruction='Make the complete house tomato meat sauce once for the active Lean and Bulk lasagna pans.';
          sauce.steps=[
            'Blend the canned tomatoes smooth if needed.',
            'Brown the 90/10 ground beef with the measured onion and garlic to 160 F, then drain the rendered fat thoroughly.',
            'Stir in crushed tomatoes, tomato paste, water, Italian seasoning, black pepper, and salt.',
            'Simmer until thick enough for already-boiled pasta; record finished sauce weight. Do not leave it watery for no-boil noodles.',
          ];
        }
        const ricotta=lasagna.prepBatches.find(task=>task.name==='Lasagna ricotta layer');
        if(ricotta) ricotta.instruction='Mix the complete ricotta layer once for the active Lean and Bulk lasagna pans.';
        const bake=lasagna.prepBatches.find(task=>task.name==='Assemble, fully bake, and chill Lasagna pans');
        if(bake) {
          bake.instruction='On Prep Day, boil the exact displayed dry weight of regular lasagna pasta, assemble the active tier pans, bake, and chill intact.';
          bake.steps=[
            'Weigh the exact dry Barilla Wavy Lasagne allocation. Boil the regular sheets according to the package, stopping just short of fully tender; drain and separate without adding unmeasured oil.',
            'Tare and label one pan for each active tier. Fit the boiled sheets to the pan without adding pasta beyond the weighed dry allocation; note the actual sheet count and trim.',
            'Layer the thickened PRPD tomato meat sauce, boiled pasta, ricotta mixture, and H-E-B fat-free mozzarella. Finish with sauce and mozzarella.',
            'Cover and bake at 375 F until every pan center reaches 165 F; uncover briefly for browning if needed.',
            'Record each finished hot pan weight, then start rapid cooling immediately in the approved shallow-pan setup.',
            'Log 135 F to 70 F within 2 hours and 70 F to 41 F or below within 4 additional hours. Do not release an out-of-limit pan.',
            'Once 41 F or below, cover, label, date, and chill the pans intact overnight. Cut and weigh the exact customer portions on Cook Day.',
          ];
        }
        lasagna.prepSteps=lasagna.prepBatches.map(task=>task.instruction);
      }
      const pizza=Object.values(data.meals).find(method=>method.recipeName==='Beef Bacon Breakfast Pizza');
      if(pizza) {
        pizza.equipment=['digital gram scale','mixing bowl','skillet','pizza stone','parchment rated for 425 F','instant-read thermometer'];
        pizza.temperature='Preheat the stone at 425 F for 45–60 minutes. Bake on the second-lowest rack, check at 8 minutes; the owner trial took about 9–10 minutes. Cook egg to 160 F before topping.';
        pizza.prepBatches=[prep('measured-prep','Prepare breakfast pizza dough, toppings and sauce','Use the current 100 g Lean and 125 g Bulk dough rectangles. Keep cooked toppings cold until Cook Day.',
          ['flour','water','instant_yeast','salt','olive_oil','egg','egg_white','green_bell_pepper','onion','crushed_tomatoes','garlic','italian_seasoning','red_chili_flakes','mozzarella','sharifa_beef_bacon'],[
            'Mix the measured dough on Prep Day; one 235 g batch makes one 100 g Lean rectangle and one 125 g Bulk rectangle, with 10 g unused. Cover and refrigerate the portioned dough overnight for a slow rise. Do not first mix it on Cook Day.',
            'Simmer canned tomato, garlic, olive oil, Italian seasoning and chili flakes. Record finished sauce yield; reserve 15 g for each pizza.',
            'Saute 30 g pepper/onion per pizza until excess moisture evaporates. Scramble the egg and whites gently to 160 F; weigh the finished mixture and record each tier allocation.',
            'Weigh Sharifa bacon as packaged at 50 g Lean or 60 g Bulk. Cook it fully before topping; reserve one pliable cooked slice for each pizza, then crisp and chop the rest.',
            'Keep the cooked toppings protected at 41 F or below. Stage 30 g H-E-B fat-free mozzarella for Lean and 58 g for Bulk.',
          ])];
        pizza.prepSteps=pizza.prepBatches.map(task=>task.instruction);
        pizza.steps=[
          'Preheat the pizza stone to 425 F for 45–60 minutes on the second-lowest rack. Shape one 100 g Lean or 125 g Bulk dough portion into its own box-fitting rectangle on oven-rated parchment.',
          'Top with 15 g finished house sauce, its measured cooked egg, 30 g sauteed vegetables, one cooked bacon slice and the tier mozzarella. Hold the crisp chopped bacon until after baking.',
          'Bake on the hot stone; check at 8 minutes and continue until the underside is browned, center is cooked and cheese is melted. The owner trial took about 9–10 minutes.',
          'Scatter the reserved crisp bacon bits over the baked pizza. Cool briefly on a rack, pack each whole rectangle, check lid fit and record net weight.',
        ];
        pizza.cookPackSteps=pizza.steps;
        pizza.cookDayReservations=pizza.steps;
        pizza.packBuildByTier={
          lean:[{amount:'one whole 100 g dough rectangle',name:'breakfast pizza with 50 g raw-weight cooked Sharifa bacon, 30 g H-E-B fat-free mozzarella and measured egg/vegetables/sauce'}],
          bulk:[{amount:'one whole 125 g dough rectangle',name:'breakfast pizza with 60 g raw-weight cooked Sharifa bacon, 58 g H-E-B fat-free mozzarella and measured egg/vegetables/sauce'}],
        };
        pizza.assemblyGuide={lean:[pizza.steps[3]],bulk:[pizza.steps[3]]};
        pizza.validation='The owner tested the dough and bake with ground beef as a placeholder. Record purchased Sharifa panel, actual cooked egg allocation, house sauce oil and yield, bacon cooked yield, packed weight, lid fit and next-day reheat before final nutrition labels.';
      }
    }
    const currentTikka=Object.values(data.meals).find(method=>method.recipeName==='Chicken Tikka Snack Wrap');
    if(currentTikka) {
      const rewrite=value=>typeof value==='string'?value.replace(/130\s*g\b/g,'78 g'):Array.isArray(value)?value.map(rewrite):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,entry])=>[key,rewrite(entry)])):value;
      Object.assign(currentTikka,rewrite(currentTikka));
      currentTikka.validation=[currentTikka.validation,'October28 owner-approved40% reduction:78g raw chicken and60% of its original raw-contact marinade. One tortilla,25g current Garlic Herb Yogurt and salad unchanged. Existing75% yield is modeled, not a new measured result; weigh the final packed wrap.'].filter(Boolean).join(' ');
      currentTikka.prepSteps=currentTikka.prepBatches.map(task=>task.instruction);
    }
    const currentPopcorn=Object.values(data.meals).find(method=>method.recipeName==='Oven-Baked Popcorn Chicken');
    if(currentPopcorn) {
      const rewrite=value=>typeof value==='string'?value.replace(/kikkoman_panko/g,'kelloggs_corn_flakes_plain').replace(/Kikkoman panko|panko/gi,"plain unfrosted Kellogg's Corn Flakes").replace('; it contains wheat.', '; the complete recipe contains wheat and egg; the cereal contains malt flavor.'):Array.isArray(value)?value.map(rewrite):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,entry])=>[key==='kikkoman_panko'?'kelloggs_corn_flakes_plain':key,rewrite(entry)])):value;
      Object.assign(currentPopcorn,rewrite(currentPopcorn));
      currentPopcorn.validation='Weigh25g plain unfrosted Kellogg\'s Corn Flakes per serving BEFORE crushing; record crushing loss and retained coating/oil. Malt supplies gluten; no gluten-free claim. Actual product panel,160g raw-to-cooked recovery, bake load,165F endpoint, net weight,12oz fit, cooling and24/72-hour reheat remain unverified. Full food-label release stays held; no dip.';
      currentPopcorn.prepBatches.forEach(task=>{if((task.ingredientKeys||[]).includes('kelloggs_corn_flakes_plain')) {task.steps=[...(task.steps||[]),'Weigh25g whole plain Corn Flakes per serving BEFORE crushing, then weigh recovered crumbs. Do not replace grams with cup volume or use Frosted Flakes.'];}});
      currentPopcorn.prepSteps=currentPopcorn.prepBatches.map(task=>task.instruction);
    }
    for(const method of Object.values(data.meals)) {
      if(['Chicken Tikka Snack Wrap','Buffalo Chicken Pinwheels','Mediterranean Hummus Box'].includes(method.recipeName)) {
        method.coldAssembly=true;
        method.coldAssemblySteps=(method.cookPackSteps || method.steps || []).slice(1);
      }
    }

    // October28 owner refinement: concise operating cards, detailed checks retained.
    const findCurrent17=name=>Object.values(data.meals).find(method=>method.recipeName===name);
    const shortCook17=(method,steps)=>{
      if(!method)return;
      method.cookValidationNotes=[...new Set([...(method.cookValidationNotes || []),method.validation,...(method.cookPackSteps || method.steps || [])].filter(Boolean))];
      method.steps=steps;method.cookPackSteps=steps;method.cookDayReservations=steps;
    };
    const eggHold17='If mixed Thursday, cover, time-label and refrigerate at 40 F or below; cook within 24 hours. Otherwise mix Friday.';
    const omelette17=findCurrent17('High Protein Omelette');
    if(omelette17){
      const eggKit=omelette17.prepBatches.find(task=>task.ingredientKeys?.includes('egg'));
      if(eggKit){eggKit.name='Prepare omelette egg mixture';eggKit.instruction='Whisk the displayed eggs and whites; keep cheese, oil and salt in their assigned sets.';eggKit.steps=[eggKit.instruction,eggHold17];eggKit.aheadWorkstation='cold-kits';}
      shortCook17(omelette17,[
        'Friday: soften the measured mushrooms and jalapeno in the assigned oil. Add eggs, whites and salt; cook until fully set to 160 F.',
        'Melt the measured mozzarella into the omelette. Toast the counted sourdough.',
        'Pack the complete tier omelette with 100 g tomato and the toast. Cool promptly in protected shallow pans, then refrigerate.',
      ]);
      omelette17.packBuildByTier={
        lean:[{amount:'1',name:'finished Lean omelette'},{amount:'1 slice',name:'sourdough toast'},{amount:'100 g',name:'tomato'}],
        bulk:[{amount:'1',name:'finished Bulk omelette'},{amount:'2 slices',name:'sourdough toast'},{amount:'100 g',name:'tomato'}],
      };
    }
    const sandwich17=findCurrent17('PRPD Beef Bacon Breakfast Sandwich');
    if(sandwich17){
      const sauceJobs=sandwich17.prepBatches.filter(task=>task.componentRef==='batch13-sweet-heat');
      sandwich17.prepBatches=[
        prep('measured-prep','Prepare sandwich egg mixture','Whisk only the displayed whole eggs and egg whites.',['egg','egg_white'],[
          eggHold17,'Each physical sandwich gets the complete cooked patty from 1 egg and 75 g whites. Keep counted muffins dry and bacon, cheese and Lean potatoes separate until Friday.',
        ],{stage:'ahead',aheadWorkstation:'cold-kits',consumesIngredients:false}),
        ...sauceJobs,
      ];
      shortCook17(sandwich17,[
        'Friday: roast the Lean potato allocation. Cook egg patties until fully set to 160 F and halal beef bacon to its package endpoint.',
        'Toast muffins and assemble 1 sandwich Lean or 2 Bulk, with 28 g mozzarella per sandwich.',
        'Pack the finished sandwiches and Lean potatoes; stage one 40 g Sweet Heat cup per meal. Cool promptly and refrigerate.',
      ]);
      sandwich17.packBuildByTier={
        lean:[{amount:'1',name:'finished egg, beef-bacon and mozzarella sandwich'},{amount:'1 finished share',name:'roasted potatoes from 150 g raw allocation'}],
        bulk:[{amount:'2',name:'finished egg, beef-bacon and mozzarella sandwiches'}],
      };
    }
    const pancake17=findCurrent17('Strawberry Cheesecake Protein Pancakes');
    if(pancake17){
      const finishes=pancake17.prepBatches.filter(task=>['topping','sauce'].includes(task.type));
      pancake17.prepBatches=[
        ...finishes,
        prep('mix','Mix pancake batter Friday','Whisk the displayed wet ingredients, then fold in the dry ingredients just until combined.',['flour','baking_powder','whey_vanilla','cinnamon','salt','egg','egg_white','fage','fairlife_milk','vanilla','avocado_oil'],[
          'Use 80 g Lean or 100 g Bulk yogurt in the batter; the topping owns the remaining 20 g. Keep the measured griddle oil separate.',
          'Griddle promptly. This whey/yogurt batter has not been quality-tested overnight.',
        ],{stage:'cook',releaseTiming:'cook-day',finishTiming:'cook-day',ingredientAmounts:{fage:{lean:80,bulk:100}},ingredientSections:[
          {title:'Dry ingredients',ingredientKeys:['flour','baking_powder','whey_vanilla','cinnamon','salt']},
          {title:'Wet ingredients',ingredientKeys:['egg','egg_white','fage','fairlife_milk','vanilla']},
          {title:'Measured griddle oil',ingredientKeys:['avocado_oil']},
        ]}),
      ];
      shortCook17(pancake17,[
        'Friday: mix the displayed batter and griddle until centers are set. Make 3 pancakes Lean or 4 Bulk.',
        'Pack the counted pancakes; stage one strawberry-cheesecake topping cup and one 30 g syrup cup per meal.',
        'Rapid-cool in protected shallow pans and refrigerate.',
      ]);
      const batter=pancake17.prepBatches.find(task=>task.name==='Mix pancake batter Friday');
      pancake17.cookIngredientKeys=batter.ingredientKeys;
      pancake17.cookIngredientSections=batter.ingredientSections;
      pancake17.cookIngredientHeading='Friday batter';
      pancake17.cookIngredientPrepName=batter.name;
      pancake17.cookIngredientAmounts={fage:{lean:80,bulk:100}};
      pancake17.cookValidationNotes.push('Thursday: prepare topping and syrup. Default batter mixing is Friday; overnight whey/yogurt batter lift and viscosity remain untested. Do not add extra leavener.');
      pancake17.packBuildByTier={lean:[{amount:'3',name:'cooked pancakes'}],bulk:[{amount:'4',name:'cooked pancakes'}]};
    }
    const popcorn17=findCurrent17('Oven-Baked Popcorn Chicken');
    if(popcorn17){
      const rawKit=popcorn17.prepBatches.find(task=>task.ingredientKeys?.includes('chicken_thigh_raw'));
      if(rawKit){rawKit.instruction='Weigh the displayed raw thigh pull and cut uniform bite-size pieces.';rawKit.steps=[rawKit.instruction,'Cover, label and refrigerate. Bread Friday.'];}
      const coatingKeys=['flour','egg_white','kelloggs_corn_flakes_plain','garlic_powder','paprika','black_pepper','salt','avocado_oil'];
      const sections=[
        {title:'Dry flour',ingredientKeys:['flour']},
        {title:'Wet binder',ingredientKeys:['egg_white']},
        {title:'Seasoned cereal crumbs',ingredientKeys:['kelloggs_corn_flakes_plain','garlic_powder','paprika','black_pepper','salt']},
        {title:'Measured oil',ingredientKeys:['avocado_oil']},
      ];
      popcorn17.prepBatches=[
        ...(rawKit?[rawKit]:[]),
        prep('measured-prep','Prepare Popcorn breading station','Weigh the full displayed kit into separate flour, egg-white, seasoned-crumb and oil containers.',coatingKeys,[
          'Per serving: 5 g flour, 15 g egg white, 25 g plain Corn Flakes weighed BEFORE crushing, 1 g garlic powder, 0.5 g paprika, 0.2 g pepper, 0.75 g salt and 3 g oil TOTAL.',
          'Crush cereal and mix in the spices. Keep flour and crumbs dry; cover and refrigerate egg white at 40 F or below. Keep each set separate until Friday breading.',
        ],{ingredientSections:sections,aheadWorkstation:'cold-kits',componentRef:'popcorn-chicken'}),
      ];
      shortCook17(popcorn17,[
        'Friday: coat chicken in flour, then egg white, then Corn Flakes seasoned with the measured garlic powder, paprika, pepper and salt.',
        'Use the single measured oil allowance across chicken and tray. Bake one uncrowded layer to 165 F in thick pieces; the 437 F starting setting still needs the recorded load/time check.',
        'Cool under protection in shallow pans: 135 to 70 F within 2 hours, then to 41 F within 6 hours total. Seal after chilling.',
        'Pack one complete measured serving after its weight and container fit are verified. Refrigerate at 41 F or below.',
      ]);
      popcorn17.cookIngredientKeys=coatingKeys;popcorn17.cookIngredientSections=sections;popcorn17.cookIngredientCollapsible=true;
      popcorn17.cookIngredientHeading='Measured coating';
      popcorn17.proteinCook={...popcorn17.proteinCook,recipeSteps:popcorn17.steps.slice(0,2)};
      popcorn17.packBuildByTier={single:[{amount:'1 complete serving',name:'cooked, chilled Popcorn chicken; weigh actual coated net fill'}]};
    }
    const pinwheel17=findCurrent17('Buffalo Chicken Pinwheels');
    if(pinwheel17){
      shortCook17(pinwheel17,[
        'Friday: cook the seasoned whole thighs to 165 F, shred, then cool in protected shallow pans to 41 F or below.',
        'Mix the chilled chicken with its measured Buffalo filling. Spread across 1 tortilla per order and add 20 g dry lettuce.',
        'Roll tightly, chill until firm, and cut into 4 equal pieces. Pack all 4 and refrigerate.',
      ]);
      pinwheel17.proteinCook={...pinwheel17.proteinCook,recipeSteps:[pinwheel17.steps[0]]};
      pinwheel17.coldAssemblySteps=pinwheel17.steps.slice(1);
      pinwheel17.packBuildByTier={single:[{amount:'4 equal pieces',name:'finished Buffalo Chicken Pinwheels from one complete wrap'}]};
    }
    const orzo17=findCurrent17('Lemon Herb Chicken Orzo');
    if(orzo17){
      const proteinKit=orzo17.prepBatches.find(task=>task.name==='Stage lemon-herb Orzo chicken');
      if(proteinKit){
        proteinKit.ingredientKeys=[...new Set([...proteinKit.ingredientKeys,'paprika','onion_powder'])];
        proteinKit.ingredientAmounts={...proteinKit.ingredientAmounts,paprika:{lean:1,bulk:1.3},onion_powder:{lean:.5,bulk:.7}};
        proteinKit.instruction='Thursday: coat the chicken with its displayed oil, garlic, oregano, paprika, onion powder, pepper and salt.';
        proteinKit.steps=[proteinKit.instruction,'Cover, label and refrigerate. Roast Friday.'];
      }
      shortCook17(orzo17,[
        'Friday: roast the seasoned thighs in one uncrowded layer to 165 F. Roast the staged zucchini and carrot with their own oil and salt.',
        'Boil the measured dry Orzo to package al-dente directions; drain and weigh.',
        'Soften onion in the assigned finish oil, briefly cook garlic, add measured finishing water, then fold in lemon and parsley. Coat the cooked Orzo.',
        'Pack 160 g cooked chicken Lean or 210 g Bulk, plus each complete Orzo and roasted-vegetable share. Cool promptly in protected shallow pans and refrigerate.',
      ]);
      orzo17.proteinCook={...orzo17.proteinCook,recipeSteps:[orzo17.steps[0]]};
      orzo17.cookValidationNotes.push('Thursday is staging only for Orzo pasta and vegetables. Friday cooks each once. Record actual chicken/pasta/vegetable yields, packed weight and cooling checkpoints; source physical and label holds remain open.');
    }
    for(const name of ['Harissa Honey Chicken','Southwest Beef Taco Bowl','Garlic Butter Wild Argentine Shrimp + Rice']){
      const method=findCurrent17(name);if(method)method.sharedPlainRiceBase=true;
    }
    const southwest17=findCurrent17('Southwest Beef Taco Bowl');
    if(southwest17){
      southwest17.riceFinishDay='cook';
      const rice=southwest17.prepBatches.find(task=>task.ingredientKeys?.includes('rice_dry'));
      if(rice)rice.cookDayIngredientKeys=['cilantro','garlic','lime'];
      southwest17.riceFinishSteps=[
        'Friday: warm the measured rice-kit garlic with the reheating Southwest vegetables in their existing allocated oil. Add no extra oil.',
        'Use only the Southwest share of the plain rice. Add its measured cilantro and lime juice as the bowls are built.',
      ];
      southwest17.cookValidationNotes=[...(southwest17.cookValidationNotes || []),southwest17.validation].filter(Boolean);
      southwest17.steps=[
        'Friday: bring forward the plain rice and cooked Southwest vegetables. Reheat safely for assembly; warm the rice-kit garlic with the vegetables using their existing allocated oil.',
        'Brown the staged beef to 160 F, drain and add its measured beef salt.',
        'Pack the exact rice, beef and hot-vegetable shares. Add the measured cilantro and lime at plating, then the cold lettuce and Cotija. Cool promptly and refrigerate.',
      ];
      southwest17.cookPackSteps=southwest17.steps;southwest17.cookDayReservations=southwest17.steps;
      if(southwest17.proteinCook)southwest17.proteinCook.recipeSteps=[southwest17.steps[1]];
    }
    // October30: keep protein cooking, remaining components, and assembly separate.
    // This routing does not record a temperature, yield, or physical completion.
    if(Number(data.batch)===17) {
      const onCookDay=task=>Object.assign(task,{stage:'cook',deferred:true,consumesIngredients:false,releaseTiming:'cook-day',finishTiming:'cook-day'});
      const proteinOnly=(method,lines)=>{
        if(!method?.proteinCook)return;
        method.proteinCook.recipeSteps=lines;
        method.proteinCook.instructions=lines;
      };
      const components=(method,lines,keys=[],prepNames=[])=>{
        if(!method)return;
        method.cookDayComponentSteps=lines;
        method.cookDayComponentKeys=keys;
        method.cookDayComponentPrepNames=prepNames;
      };
      for(const method of Object.values(data.meals)) {components(method,[]);method.cookDayAssemblySteps=[];}

      if(omelette17) {
        const eggs=omelette17.prepBatches.find(task=>task.name==='Prepare omelette egg mixture');
        if(eggs){onCookDay(eggs);eggs.instruction='Cook Day: whisk the displayed eggs and whites just before cooking.';eggs.steps=[eggs.instruction,'Keep cheese, oil and salt in their assigned recipe amounts. Do not add another seasoning allowance.'];}
        components(omelette17,[
          'After the chicken block: whisk the measured eggs and whites. Bring forward the prepared mushrooms and jalapeno; do not cook a second vegetable batch.',
          'Warm the prepared vegetables in their assigned omelette oil, add eggs, whites and salt, and cook fully set to 160 F. If that oil was already used for the vegetables, do not add it again.',
          'Melt the measured mozzarella into each omelette and toast the counted sourdough. Keep the separate 100 g tomato share cold for final assembly.',
        ],['egg','egg_white','mozzarella','avocado_oil','salt','sourdough_slice'],['Prepare omelette egg mixture','Prepare omelette vegetables and toast kit']);
      }
      if(sandwich17) {
        const eggs=sandwich17.prepBatches.find(task=>task.name==='Prepare sandwich egg mixture');
        if(eggs){onCookDay(eggs);eggs.instruction='Cook Day: whisk the displayed whole eggs and egg whites, then cook the patties.';eggs.steps=[eggs.instruction,'Each sandwich gets the whole patty from 1 egg and 75 g whites. Keep the existing cooked Lean potato share; do not roast it again.'];}
        components(sandwich17,[
          'After the chicken block: whisk 1 egg and 75 g whites per sandwich. Cook each complete patty fully set to 160 F; cook the halal beef bacon to its package endpoint.',
          'Toast the counted muffins and melt 28 g mozzarella onto each patty. Bring forward the already-cooked Lean potato share without a second roast.',
        ],['egg','egg_white','beef_bacon','english_muffin','mozzarella'],['Prepare sandwich egg mixture']);
      }
      if(pancake17) {
        const batter=pancake17.prepBatches.find(task=>task.name==='Mix pancake batter Friday');
        if(batter)onCookDay(batter);
        components(pancake17,[
          'After the chicken block: whisk the measured wet batter ingredients, then fold in the dry ingredients just until combined. Use 80 g Lean or 100 g Bulk FAGE in batter; the prepared topping already owns its separate 20 g.',
          'Use only the measured griddle oil and cook until the centers are set, making 3 pancakes Lean or 4 Bulk. Bring forward the prepared topping and 30 g syrup cup; do not mix those again.',
        ],pancake17.cookIngredientKeys || [],batter?[batter.name]:[]);
      }
      if(popcorn17) {
        const breading=popcorn17.prepBatches.find(task=>task.name==='Prepare Popcorn breading station');
        if(breading){onCookDay(breading);breading.instruction='Cook Day, within the chicken block: prepare the measured breading station immediately before coating.';breading.steps=[
          'Per serving: 5 g flour, 15 g egg white, 25 g plain Corn Flakes weighed BEFORE crushing, 1 g garlic powder, 0.5 g paprika, 0.2 g pepper, 0.75 g salt and 3 g oil TOTAL.',
          'Keep flour, egg white and seasoned cereal crumbs separate. If the seasoning was already applied to this chicken, do not add it a second time; use only the remaining displayed allocation.',
        ];}
        proteinOnly(popcorn17,[
          'Within the chicken block, before this chicken cooks: weigh the complete breading kit. Crush the plain Corn Flakes and combine only the assigned crumb seasoning; keep flour and egg-white binder separate.',
          'Coat the raw chicken in flour, egg white, then seasoned Corn Flakes. Use the single 3 g oil allowance per serving across tray and chicken; no second spray or seasoning batch.',
          'Bake one uncrowded layer to 165 F in thick pieces. The 437 F starting setting still needs the actual load/time recorded. Move finished chicken into protected cooling; do not wait for final plating to begin cooling.',
        ]);
        popcorn17.proteinCook.recipeKeys=['chicken_thigh_raw',...(popcorn17.cookIngredientKeys || [])];
        popcorn17.proteinCook.cookIngredientPrepNames=breading?[breading.name]:[];
        popcorn17.proteinCook.cookIngredientSections=popcorn17.cookIngredientSections;
      }
      if(orzo17) {
        const finish=orzo17.prepBatches.find(task=>task.name==='Stage dry Orzo and lemon-herb finish');
        if(finish){onCookDay(finish);finish.instruction='Cook Day, after the chicken block: cook and finish the measured Orzo.';finish.steps=[
          'Boil the exact dry Barilla Orzo allocation to package al-dente directions, drain consistently and weigh.',
          'Soften the prepared onion in only the Orzo-finish oil; briefly cook its garlic, add the measured finishing water, then fold in lemon, parsley and the assigned finish salt. Toss with cooked Orzo. Do not reuse the chicken oil, salt or garlic allocation.',
        ];}
        proteinOnly(orzo17,['Roast the already-seasoned thighs in one uncrowded layer to 165 F. Do not add a second marinade or vegetable tray. Rest and record the cooked chicken yield.']);
        components(orzo17,[
          ...(finish?.steps || []),
          'Bring forward the already-cooked zucchini and carrot allocation. Do not roast it again or add its oil and salt a second time. Hold the chicken, finished Orzo and vegetables separately for final plating.',
        ],finish?.ingredientKeys || [],finish?[finish.name]:[]);
      }
      const cajun17=findCurrent17('Creamy Cajun Chicken Pasta');
      if(cajun17) {
        const pasta=cajun17.prepBatches.find(task=>task.name==='Creamy Cajun pasta setup');
        if(pasta){onCookDay(pasta);pasta.instruction='Cook Day, after chicken: cook the spaghetti once in the already-made Cajun tomato-onion base.';pasta.steps=[
          'Bring forward the prepared Cajun sauce base. Add only its measured cooking water and dry protein spaghetti; as strands soften, separate and submerge them, cover and simmer, stirring often.',
          'Cook until the spaghetti is tender. Record any extra water in measured increments. Off heat, stir in the measured regular cream cheese only if it was not already added to the prepared sauce; finish with the green onion. No second tomato-onion base, oil, butter, dairy or spice allocation.',
        ];}
        proteinOnly(cajun17,['Sear the already-seasoned thigh cubes in uncrowded batches to 165 F with no unrecorded oil. Record yield and hold the cooked chicken separately for the pasta finish.']);
        components(cajun17,[...(pasta?.steps || []),'Cook one combined pasta-and-sauce batch. Weigh the finished pasta and cooked chicken separately for final portioning.'],pasta?.ingredientKeys || [],pasta?[pasta.name]:[]);
      }
      const halal17=findCurrent17('Halal Cart Chicken + Yellow Rice');
      proteinOnly(halal17,['Cook the already-seasoned chicken in uncrowded batches to 165 F, rest briefly, chop and record yield. Keep the cooked chicken separate from rice and cold salad until final plating.']);
      components(halal17,['Bring forward the already-cooked yellow rice. Use the existing complete rice allocation without another rice cook or another seasoning batch. Keep lettuce and tomato cold until final plating.']);
      const steak17=findCurrent17('Premium NY Strip Steak');
      proteinOnly(steak17,['Cook the already-seasoned steaks to 145 F, then rest at least 3 minutes. Record the cooked yield; keep mash, broccoli and sauce separate until final plating.']);
      components(steak17,['Bring forward the already-cooked mashed potatoes and broccoli. Reheat only as needed using their existing recipe allocations; do not remake the mash or roast another broccoli batch.']);
      const harissa17=findCurrent17('Harissa Honey Chicken');
      components(harissa17,['Bring forward the already-cooked plain rice and broccoli shares. Do not repeat the rice cook or broccoli roast and do not add a second oil or seasoning allocation.']);
      if(southwest17)components(southwest17,[
        'Bring forward the already-cooked Southwest vegetables and its share of plain rice. Warm the rice-kit garlic with those vegetables using their existing oil; if already incorporated, do not add it again.',
        'Hold the measured rice-kit cilantro and lime for final plating. Keep the cold lettuce and Cotija separate. Do not cook another rice or vegetable batch.',
      ],['garlic','cilantro','lime']);
      const shrimp17=findCurrent17('Garlic Butter Wild Argentine Shrimp + Rice');
      proteinOnly(shrimp17,['Cook the shrimp last to 145 F and finish with its measured garlic-butter-lemon mixture. Keep the prepared rice and vegetables separate until final plating.']);
      components(shrimp17,['Bring forward the already-cooked rice and vegetables; do not duplicate either cook. Use the existing finished sauce allocation.']);
      proteinOnly(findCurrent17('High-Protein Beef Kofta & Roasted Vegetables'),['Cook the prepared 96/4 kofta to 160 F, drain and record finished yield. Hold separately from the prepared cold salad and sauce cups.']);
      proteinOnly(findCurrent17('Custom Lean Chicken Mince'),['Cook the prepared chicken qeema to 165 F with its measured 60 g water per meal. Keep it moist and lightly saucy, record yield, and hold separately from cold salad and sauces.']);
      proteinOnly(findCurrent17('Custom Lebanese-Style Chicken Breast'),['Cook the marinated chicken breast to 165 F, rest and record cooked yield. Keep the existing dressing and Sweet Heat allocation separate until final plating.']);
      const assembly17={
        'High Protein Omelette':['Pack one complete finished tier omelette, 1 sourdough slice Lean or 2 Bulk, and the separate 100 g tomato share.'],
        'Strawberry Cheesecake Protein Pancakes':['Pack 3 finished pancakes Lean or 4 Bulk. Add the already-prepared strawberry-cheesecake topping cup and one 30 g syrup cup per meal.'],
        'PRPD Beef Bacon Breakfast Sandwich':['Build 1 sandwich Lean or 2 Bulk from the toasted muffins and cooked egg, bacon and mozzarella portions. Pack the prepared Lean potato share and one existing 40 g Sweet Heat cup per meal, not per sandwich.'],
        'Halal Cart Chicken + Yellow Rice':['Pack the exact cooked chicken and yellow-rice shares. Add the cold lettuce and tomato; no recipe-required sauce cup.'],
        'Cheesy Achiote Chicken Tacos':['Warm the counted corn tortillas. Divide the cooked chicken and measured melting mozzarella evenly across 3 Lean or 4 Bulk tacos.','Finish with the measured Cotija, drained prepared pickled red onion and cilantro. Pack the complete taco count; no recipe-required sauce cup.'],
        'Lemon Herb Chicken Orzo':['Pack 160 g cooked chicken Lean or 210 g Bulk, with the complete finished Orzo share and the already-cooked zucchini/carrot share. Do not add another oil, salt or marinade allocation.'],
        'Southwest Beef Taco Bowl':['Pack the exact plain-rice, cooked beef and prepared hot-vegetable shares. Add the reserved rice-kit cilantro and lime, then the cold lettuce and Cotija. Do not add rice-kit garlic again if it was finished with the vegetables.'],
        'Garlic Butter Wild Argentine Shrimp + Rice':['Pack the cooked finished shrimp with the complete prepared rice and vegetable shares and its assigned sauce cup.'],
        'Creamy Cajun Chicken Pasta':['Weigh the finished pasta with sauce and the cooked chicken separately. Portion each using the batch-weight shares below, then combine in each container.'],
        'Premium NY Strip Steak':['Pack the finished tier steak with the prepared mashed-potato and broccoli shares. Add the existing Honey Barbecue Mustard cup.'],
        'Oven-Baked Popcorn Chicken':['After protected cooling, pack one complete Popcorn chicken serving per ordered box. Check the actual finished fill and container fit; no recipe-required dip.'],
        'Mango Habanero Chicken Wings':['Toss the cooked wings with only the measured clean mango-habanero finish. Do not reuse raw-contact sauce or add a second coating.',`Pack ${Number(data.batch)>=19?6:8} individual split pieces per Lean box or ${Number(data.batch)>=19?8:10} per Bulk box, with one existing sealed 40 g ranch cup${Number(data.batch)>=19?' and one sealed 20 g mango dip cup':''} per box. No starch or vegetable side.`],
        'Harissa Honey Chicken':['Pack the complete cooked tier chicken/glaze share, its prepared plain-rice share and prepared broccoli share. No recipe-required sauce cup or extra glaze batch.'],
        'High-Protein Beef Kofta & Roasted Vegetables':['Pack the complete cooked kofta share, one existing 205 g cold salad box and two existing 40 g Sweet Heat cups per beef meal.'],
        'Custom Lean Chicken Mince':['Pack the complete cooked moist chicken-qeema share, one existing 205 g cold salad box, one existing 40 g Sweet Heat cup and the controlled lemon-garlic dressing cup.'],
        'Custom Lebanese-Style Chicken Breast':['Pack the complete cooked chicken-breast share with the existing controlled dressing and Sweet Heat allocation.'],
      };
      for(const [name,lines] of Object.entries(assembly17)) {
        const method=findCurrent17(name);
        if(method)method.cookDayAssemblySteps=lines;
      }
      // Match the existing recipe raw-to-cooked conversions. The October7 68.8%
      // standard-component result does not calibrate these format-specific cooks.
      for(const name of ['Creamy Cajun Chicken Pasta','Cheesy Achiote Chicken Tacos','Chicken Tikka Snack Wrap','Buffalo Chicken Pinwheels','Oven-Baked Popcorn Chicken']) {
        const method=findCurrent17(name);
        if(method?.proteinCook)method.proteinCook.yieldByProteinKey={
          chicken_thigh_raw:{factor:.75,label:'Recipe-modeled 75% cooked meat yield; actual output must be weighed.'},
        };
      }
      if(southwest17?.proteinCook)southwest17.proteinCook.yieldByProteinKey={
        beef_90_raw:{factor:.69,label:'Recipe-modeled 69% cooked beef yield after draining; actual output must be weighed.'},
      };
      if(cajun17)cajun17.prepSteps=cajun17.prepBatches.map(task=>task.instruction);
    }
    if(Number(data.batch)>=18) {
      const kofta=Object.values(data.meals).find(method=>method.recipeName==='High-Protein Beef Kofta & Roasted Vegetables');
      if(kofta) {
        kofta.deliveryDayProduceComponent='nouman-kachumber';
        const saladSteps=[
          'Stage whole produce and the measured seasoning set in the refrigerator. Keep the produce whole until delivery day.',
          'On delivery day, use prechilled produce and a clean, sanitized board to cut and season the kachumber near departure. Blend the measured jalapeno with the lemon, then toss with the measured vegetables, herbs and seasonings.',
          'Portion 205 g per meal into separate covered boxes. Refrigerate immediately, check that the salad is 40°F or colder, then load it into the insulated bag with ice packs just before departure.',
        ];
        const cupCount=kofta.sideCupComponents[0]?.cupsPerMeal || 2;
        kofta.prepBatches=kofta.prepBatches.map(task=>{
          if(task.componentRef==='nouman-kachumber') return {...task,instruction:saladSteps[0],steps:saladSteps};
          if(task.type==='sauce' && task.componentRef==='batch13-sweet-heat') return {...task,
            steps:['Whisk the displayed Sweet Heat batch until uniform.',`Fill ${cupCount} × 40 g per beef meal, seal, label, and refrigerate.`]};
          return task;
        });
        kofta.prepSteps=kofta.prepBatches.map(task=>task.instruction);
        kofta.cookPackSteps=[
          'Bake the formed kofta to 160 F and pack five cooked logs per meal.',
          'Keep the salad produce whole and refrigerated until the delivery-day kachumber step.',
          ...saladSteps.slice(1),
          `Pack ${cupCount} × 40 g Sweet Heat per meal. Add any separately listed sampler cups during pack-out.`,
        ];
        kofta.steps=kofta.cookPackSteps;
      }
    }
    if (Number(data.batch) >= 18) {
      const update = (name, {tasks, finish, pack, proteinSteps, ...options}) => {
        const method = findCurrent17(name);
        if (!method) return;
        if (tasks) {
          method.prepBatches = tasks;
          method.prepSteps = tasks.map(task => task.instruction);
        }
        Object.assign(method, options, {steps:finish, cookPackSteps:finish, cookDayReservations:finish, temperature:finish[0]});
        if (proteinSteps && method.proteinCook) method.proteinCook.recipeSteps = finish.slice(0, proteinSteps);
        if (pack) {
          method.packBuildByTier = pack;
          method.assemblyGuide = Object.fromEntries(Object.entries(pack).map(([tier, rows]) =>
            [tier, [`Pack ${rows.map(row => `${row.amount} ${row.name}`).join(', ')}.`]]));
        }
      };
      const task = (type, name, keys, steps, options) => prep(type, name, steps[0], keys, steps, options);
      const byComponent = (name, type, title, ref, steps, options) => {
        const record = Object.values(liveProduction.meals).find(meal => meal.name === name);
        const keys = [...new Set(Object.values(record?.tiers || {}).flatMap(tier => tier.ingredients)
          .filter(line => line.allocations?.[ref] > 0).map(line => line.key))];
        return task(type, title, keys, steps, {componentRef:ref, ...options});
      };
      const portion = (amount, name) => ({amount, name});
      const share = name => portion('1 measured tier share', name);
      const chill = 'Weigh the finished batch, rapid-cool in a shallow labeled pan, and refrigerate.';

      const lamb = 'Rosemary-Garlic Lamb Shoulder';
      const lambRaw = {lean:160 * 1500 / 700, bulk:210 * 1500 / 700};
      // Scale the physical roast formula against the source's 840 g edible yield.
      // Gravy includes drippings from the roast. Its retained fat is an internal transfer.
      const lambInput = (key, name, fullRoastGrams) => ({
        key, name, unit:'g', lean:fullRoastGrams * 160 / 840, bulk:fullRoastGrams * 210 / 840, includeInGrocery:false,
      });
      const roastInputs = [
        lambInput('lamb_raw_pull','Bone-in lamb shoulder, raw',1800),
        lambInput('lamb18_avocado_oil','Avocado oil for the roast',28),
        lambInput('lamb18_salt','Salt for the roast',9),
        lambInput('lamb18_black_pepper','Black pepper for the roast',2),
        lambInput('lamb18_garlic','Whole garlic and slivers for the roast',65),
        lambInput('lamb18_rosemary','Fresh rosemary for the roast',8),
        lambInput('lamb18_onion','Quartered onion for the roasting pan',180),
        lambInput('lamb_process_water','Water for roasting and gravy',750),
        lambInput('lamb18_flour','Flour for pan gravy',20),
        lambInput('lamb18_rendered_lamb_fat_model','Rendered lamb fat to retain for gravy',28),
      ];
      const lambSides = (meat, mash, beans) => [
        portion(`${meat} g`, 'cooked boneless lamb'), portion('45 g', 'pan gravy'),
        portion(`${mash} g`, 'garlic-rosemary Idahoan mash'), portion(`${beans} g`, 'roasted green beans'),
      ];
      update(lamb, {
        productionGroup:'braise',
        groceryOverrides:Object.fromEntries([
          ['lamb18_lamb_shoulder_cooked',{...lambRaw, name:'Bone-in lamb shoulder, raw', station:'Meat & Seafood', applyRawProteinReserve:true,
            note:'Raw purchase at the 46.7% edible planning yield. Keep the purchase reserve separate from the recipe pull.'}],
          ...roastInputs.filter(input => ['lamb18_onion','lamb18_flour'].includes(input.key))
            .map(({key, name, lean, bulk}) => [key,{name, lean, bulk}]),
          ['lamb18_garlic',{name:'Garlic',lean:65 * 160 / 840 + 1.5,bulk:65 * 210 / 840 + 2}],
          ['lamb18_rosemary',{name:'Fresh rosemary',lean:8 * 160 / 840 + 180 / 420,bulk:8 * 210 / 840 + 240 / 420}],
          ['lamb18_rendered_lamb_fat_model',{perServing:0}],
        ]),
        tasks:[
          task('protein-cook-ahead','Slow-roast the Rosemary-Garlic Lamb Shoulder and make pan gravy',
            ['lamb18_lamb_shoulder_cooked','lamb18_avocado_oil','lamb18_salt','lamb18_black_pepper','lamb18_garlic',
             'lamb18_rosemary','lamb18_onion','lamb18_flour','lamb18_rendered_lamb_fat_model'],[
            'Start with the bone-in shoulder. Rub with the measured avocado oil, salt and pepper. Slit the meat and insert garlic slivers and rosemary. Put the onion, remaining garlic and rosemary under the lamb in a snug roasting pan. Use some of the measured water in the pan and reserve the rest for the gravy.',
            'Cover tightly and roast at 350°F conventional (320°F fan) until the shoulder pulls apart easily with two forks. Allow roughly 3 hours and start checking smaller pieces earlier. Probe the meat away from bone and record the endpoint.',
            'Uncover and brown at 425°F, watching the pan and adding some reserved water if it runs dry. Rest briefly, then remove bone, cartilage and excess loose fat. Weigh the edible cooked lamb.',
            'Keep the pan juices and the measured portion of rendered fat. Stir the flour into the retained fat, then whisk in the juices and reserved water. Simmer, press the aromatics, and strain. Weigh the finished gravy and set aside 45 g per meal.',
            'Cool the deboned lamb and gravy in separate shallow labeled pans and record the cooling checkpoints.',
          ],{aheadWorkstation:'protein-cooking',sequence:1,equipmentLane:'oven',ovenTemperatureF:350,estimatedMinutes:210,
            excludeComponentRefs:['lamb-idahoan-mash','lamb-green-beans'],
            consumesIngredients:false,useFormulaInputsOnly:true,formulaIngredients:roastInputs}),
          byComponent(lamb,'starch-ahead','Make the lamb garlic-rosemary Idahoan mash','lamb-idahoan-mash',[
            'Heat the measured water, butter, salt and garlic powder, then remove from heat and add the measured cold milk.',
            'Fold in the measured Idahoan flakes and rosemary, let hydrate, then fluff gently.', chill,
          ],{aheadWorkstation:'sides'}),
          byComponent(lamb,'vegetable-ahead','Roast the lamb green beans','lamb-green-beans',[
            'Toss the trimmed beans with the measured avocado oil, garlic, salt and pepper. Roast until tender with browned spots.',chill,
          ]),
        ],
        finish:['Use the recorded yield of the slow-roasted, deboned lamb and the finished pan gravy. Retrieve the labeled garlic mash and green beans.','Weigh the four cooked components into the correct containers using the tier quantities below.'],
        pack:{lean:lambSides(160,180,90),bulk:lambSides(210,240,120)},
      });

      const thai = 'Thai Basil Beef + Jasmine Rice';
      const thaiFinish = 'Measure the Thai basil beef finish';
      const thaiKeys = ['beef_90_raw','garlic','thai_red_bell_pepper','thai_hot_chili','thai_basil_fresh','avocado_oil','thai_redboat_40n','thai_granulated_sugar','water','thai_black_pepper'];
      update(thai,{
        tasks:[
          task('protein-portion','Weigh Thai basil beef',['beef_90_raw'],['Weigh and refrigerate the 90/10 ground beef. Keep it separate from the sauce and produce.']),
          byComponent(thai,'measured-prep',thaiFinish,'thai-basil-beef_finish',[
            'Mince the garlic and Thai chili, chop the red bell pepper, and pick the sweet basil leaves. Hold the basil separately.',
            'Measure the fish sauce, sugar, water and pepper into one labeled Cook Day set. Keep the beef cooking oil separate.',
          ],{aheadWorkstation:'cold-kits'}),
          byComponent(thai,'starch-ahead','Cook Thai Basil Beef jasmine rice','thai-basil-rice',[
            'Rinse and cook the displayed dry jasmine rice using the package water directions. Use a separate pot from Mediterranean rice.',
            'Weigh the cooked rice. Divide by the 40 g Lean and 60 g Bulk dry-rice shares, then rapid-cool and refrigerate.',
          ],{aheadWorkstation:'grains'}),
          byComponent(thai,'vegetable-ahead','Roast the Thai basil green beans','thai-basil-beans',[
            'Toss trimmed beans with their displayed oil, garlic, salt and pepper. Roast until tender with browned spots.',
            'Weigh the cooked beans. Divide by the 100 g Lean and 150 g Bulk raw-bean shares, then rapid-cool and refrigerate.',
          ]),
        ],
        cookIngredientPrepName:thaiFinish, cookIngredientKeys:thaiKeys, proteinSteps:2,
        finish:[
          'Brown the measured minced 90/10 beef to 160°F in uncrowded batches. Drain and record the cooked beef weight.',
          'Use the displayed beef oil to cook the garlic, Thai chili and red bell pepper. Return the beef, add the measured fish sauce, sugar, water and pepper, and reduce until the mixture is coated. Fold in sweet basil at the end.',
          'Weigh the finished beef mixture and split it by 210 g Lean and 300 g Bulk raw-beef shares. Use the separately prepared jasmine rice and roasted green beans.',
        ],
        pack:{lean:[portion('Share from 210 g raw', 'finished Thai basil beef'),portion('Share from 40 g dry','cooked jasmine rice'),portion('Share from 100 g raw','roasted green beans')],
          bulk:[portion('Share from 300 g raw','finished Thai basil beef'),portion('Share from 60 g dry','cooked jasmine rice'),portion('Share from 150 g raw','roasted green beans')]},
      });

      const fish = 'Lemon Pepper Tilapia with Garlic Potatoes';
      const fishKit = 'Portion tilapia and measure lemon-pepper seasoning';
      const fishKeys = ['tilapia_raw','lemon','black_pepper','avocado_oil','salt'];
      update(fish,{
        tasks:[
          task('protein-portion',fishKit,fishKeys,[
            'Pat dry and refrigerate the labeled tilapia pull. Hold the measured lemon juice, black pepper, oil and salt separately until just before cooking.',
          ],{ingredientAmounts:{avocado_oil:{lean:2,bulk:3},salt:{lean:.25,bulk:.35}}}),
          task('starch-ahead','Roast the tilapia garlic potatoes',['potato','garlic','avocado_oil','salt'],[
            'Cut the potatoes evenly. Toss with the measured garlic, oil and salt. Roast until browned and fork tender.',chill,
          ],{ingredientAmounts:{avocado_oil:{lean:3,bulk:4},salt:{lean:.5,bulk:.65}}}),
          task('vegetable-ahead','Roast the tilapia broccoli',['broccoli'],[
            'Roast the displayed broccoli in its own tray until tender.',chill,
          ]),
        ],
        cookIngredientPrepName:fishKit,cookIngredientKeys:fishKeys,proteinSteps:1,
        finish:[
          'Apply the measured lemon-pepper kit just before cooking. Roast the tilapia in one layer until it reaches 145°F in the thickest part. Record the cooked yield.',
          'Use the prepared garlic potatoes and broccoli from Batch recipes. Pack each fish portion with its measured sides.',
        ],
        pack:{lean:[share('cooked lemon-pepper tilapia'),share('roasted garlic potatoes'),share('roasted broccoli')],
          bulk:[share('cooked lemon-pepper tilapia'),share('roasted garlic potatoes'),share('roasted broccoli')]},
      });

      update('Creamy Chicken Parmesan',{proteinSteps:1,finish:[
        'Keep the thighs whole. Coat with the measured garlic-oil seasoning and breadcrumbs and bake in one uncrowded layer to 165°F.',
        'Melt the measured mozzarella on the chicken near the end of baking. Pack with the sauced protein pasta already prepared in Batch recipes.',
      ]});
      const buffalo = findCurrent17('Loaded Buffalo Chicken Potato');
      if (buffalo) {
        buffalo.prepBatches = buffalo.prepBatches.map(card => card.type !== 'side' ? card : {
          ...card, type:'vegetable-ahead', instruction:'Roast the potatoes and broccoli in separate trays.',
          steps:[...card.steps, 'Roast the potatoes until fork tender and the broccoli until just tender.', chill],
        });
        update(buffalo.recipeName,{tasks:buffalo.prepBatches,proteinSteps:1,finish:[
          'Roast the chicken to 165°F, record the yield, and coat it with the measured Buffalo sauce.',
          'Split the prepared potatoes and fill them with the finished Buffalo chicken. Add the prepared broccoli.',
        ]});
      }
      update('Beef Breakfast Skillet',{proteinSteps:1,finish:[
        'Brown the measured beef with its garlic to 160°F and drain. Use the eggs and potatoes already cooked in Batch recipes.',
        'Pack the beef, potatoes, fully cooked egg, measured red onion and mozzarella by tier.',
      ]});
      const crunch = 'Lemon-Feta Chickpea & Edamame Crunch Box';
      update(crunch,{
        tasks:[
          task('vegetable-ahead','Cook and chill the shelled edamame',['batch18_edamame'],[
            'Cook shelled edamame fully according to the package. Drain, cool and surface-dry before weighing the cooked portion.',
          ]),
          task('cold-kit','Stage Crunch Box beans, produce and dressing',['batch18_chickpeas','batch18_cucumber','batch18_tomato','batch18_feta',
            'batch18_onion','batch18_parsley','batch18_lemon','batch18_olive_oil','batch18_garlic_powder','batch18_salt','batch18_black_pepper'],[
            'Rinse and drain the chickpeas. Wash and dry the produce, then dice the cucumber, halve and drain the tomatoes, and finely chop the onion and parsley.',
            'Whisk the measured lemon juice, olive oil, garlic powder, salt and pepper for the incorporated dressing.',
          ]),
        ],
        finish:['Combine cold edamame, drained chickpeas, onion and parsley with the measured dressing.',
          'Fold in the drained cucumber and tomatoes and the measured feta. Pack one complete chilled portion per box and record its net weight.'],
        pack:{single:[portion('1 complete portion','chilled Crunch Box with incorporated dressing')]},
      });
      const shake = 'Strawberry Protein Shake';
      update(shake,{
        tasks:[task('cold-kit','Stage the Strawberry Protein Shake blend and chunks',
          ['shake_fairlife_fatfree','gainful_everyday_whey_unflavored','shake_fage_0','strawberry','banana','honey','vanilla'],[
            'Keep the milk and yogurt cold. Reserve 3/11 of the weighed strawberries as small chunks for the finish.',
          ])],
        finish:['Blend the measured milk, whey, yogurt, banana, honey, vanilla and remaining strawberries until smooth.',
          'Fold in the reserved strawberry chunks and let foam settle cold. Tare the bottles, fill each to 330 g net and record the actual recovered yield.'],
        pack:{single:[portion('330 g net','finished Strawberry Protein Shake per bottle')]},
      });
    }
    for(const method of [omelette17,sandwich17,pancake17,popcorn17,pinwheel17,orzo17].filter(Boolean))
      method.prepSteps=method.prepBatches.map(task=>task.instruction);


  }

  if (Number(data.batch) === 19) {
    const byName = name => Object.values(data.meals).find(meal => meal.recipeName === name);
    const removeSalt = task => {
      if (!task) return;
      task.ingredientKeys = (task.ingredientKeys || []).filter(key => key !== 'salt');
    };
    const bbq = byName('BBQ Chicken Mac & Cheese');
    const bbqChicken = bbq?.prepBatches?.find(task => task.name === 'BBQ Mac chicken');
    removeSalt(bbqChicken);
    if (bbqChicken) {
      delete bbqChicken.seasoningFamily;
      delete bbqChicken.seasoningFamilyName;
      bbqChicken.splitAfterSeasoning = false;
      bbqChicken.instruction = 'Season the BBQ Mac whole-thigh pull separately with its measured salt-free garlic, onion, paprika, and pepper.';
      bbqChicken.steps = [bbqChicken.instruction, 'Keep thighs whole; cut or shred only after cooking to 165 F and resting.'];
      bbqChicken.seasoningFinishNote = 'No added salt in the BBQ Mac chicken pull.';
      bbq.prepSteps = bbq.prepBatches.map(task => task.instruction);
    }
    const burrito = byName('Grilled Cheese Breakfast Burrito');
    const burritoBeef = burrito?.prepBatches?.find(task => task.name === 'Stage breakfast-burrito beef filling');
    removeSalt(burritoBeef);
    if (burritoBeef) {
      burritoBeef.instruction = 'Keep raw beef isolated and weigh the exact beef, onion, and tomato paste. Add no salt.';
      burritoBeef.steps = [burritoBeef.instruction, 'Cover, label, and refrigerate. Cook to 160 F and drain well on Cook Day.'];
      burrito.prepSteps = burrito.prepBatches.map(task => task.instruction);
    }
    const wings = byName('Mango Habanero Chicken Wings');
    const wingFinish = wings?.prepBatches?.find(task => task.name === 'Stage clean mango habanero finish');
    if (wingFinish) {
      wingFinish.type = 'measured-prep';
      wingFinish.name = 'Toss wings with clean mango habanero after cooking';
      wingFinish.instruction = 'Reserve the measured wing-coating sauce for the Cook Day toss.';
      wingFinish.steps = ['After the wings reach 165 F, measure and toss the clean finish. Keep the separate 20 g dip cups untouched.'];
      wingFinish.componentRef = 'wings-finish';
      wingFinish.deferred = true;
      wingFinish.releaseTiming = 'cook-day';
      wingFinish.finishTiming = 'cook-day';
      wingFinish.hidePrepCard = true;
      wings.steps = [
        'Cook the counted split wings in uncrowded batches to 165 F, probing thick meat away from bone.',
        'After cooking, toss with the measured clean mango-habanero finish. Keep the separate 20 g dip cups clean and sealed.',
        'Pack 6 pieces per Lean or 8 per Bulk with one 40 g bottled ranch cup and one 20 g mango-habanero dip cup.',
      ];
      wings.cookPackSteps = wings.steps;
      wings.cookDayReservations = wings.steps;
      wings.prepSteps = wings.prepBatches.map(task => task.instruction);
    }
    const tacos = byName('Cheesy Achiote Chicken Tacos');
    const pickle = tacos?.prepBatches?.find(task => task.name === 'Quick-pickle red onion');
    if (pickle) {
      pickle.type = 'sauce';
      pickle.prepWave = 'sauces';
      pickle.prepWaveName = 'Sauces and cold garnishes';
      tacos.prepSteps = tacos.prepBatches.map(task => task.instruction);
    }
    const lasagna = byName('High-Protein Beef Lasagna');
    const ricotta = lasagna?.prepBatches?.find(task => task.name === 'Lasagna ricotta layer');
    if (ricotta) {
      ricotta.type = 'sauce';
      ricotta.prepWave = 'sauces';
      ricotta.prepWaveName = 'Sauces and cold garnishes';
      lasagna.prepSteps = lasagna.prepBatches.map(task => task.instruction);
    }
    const skillet = byName('Beef Breakfast Skillet');
    if (skillet) {
      skillet.prepBatches = skillet.prepBatches.filter(task => task.name !== 'Breakfast Skillet eggs');
      skillet.steps = [
        'On Cook Day, brown the measured beef with its garlic to 160 F; drain.',
        'Cook the tier eggs fresh and fully set. Use the prepared potatoes.',
        'Pack beef, potatoes, eggs, red onion and H-E-B fat-free mozzarella by tier.',
      ];
      skillet.cookPackSteps = skillet.steps;
      skillet.cookDayReservations = skillet.steps;
      if (skillet.proteinCook) skillet.proteinCook.recipeSteps = [skillet.steps[0]];
      skillet.prepSteps = skillet.prepBatches.map(task => task.instruction);
    }
    const popcorn = byName('Oven-Baked Popcorn Chicken');
    if (popcorn) {
      popcorn.prepBatches = popcorn.prepBatches.filter(task => task.name !== 'Prepare Popcorn breading station');
      popcorn.steps = [
        'On Cook Day, immediately before baking, weigh per serving: 5 g flour, 15 g egg white, 25 g plain Corn Flakes before crushing, 1 g garlic powder, 0.5 g paprika, 0.2 g pepper, 0.75 g salt and 3 g oil total.',
        'Make separate flour, egg-white and seasoned-crumb bowls. Coat the cold chicken in that order; discard raw-contact leftovers.',
        'Bake in an uncrowded layer to 165 F in the thickest pieces. Record the actual oven setting, time and yield.',
        'Cool under protection, pack one complete serving per box and refrigerate.',
      ];
      popcorn.cookPackSteps = popcorn.steps;
      popcorn.cookDayReservations = popcorn.steps;
      if (popcorn.proteinCook) popcorn.proteinCook.recipeSteps = popcorn.steps.slice(0,3);
      popcorn.cookIngredientKeys = ['flour','egg_white','kelloggs_corn_flakes_plain','garlic_powder','paprika','black_pepper','salt','avocado_oil'];
      popcorn.prepSteps = popcorn.prepBatches.map(task => task.instruction);
    }
    const pizza = byName('Beef Bacon Breakfast Pizza');
    if (pizza) {
      const prepCard = pizza.prepBatches.find(task => task.name === 'Prepare breakfast pizza dough, toppings and sauce');
      if (prepCard) {
        prepCard.name = 'Pizza dough balls, sauce and vegetables';
        prepCard.instruction = 'Make the dough, sauce and vegetables on Prep Day; eggs and bacon cook fresh on Cook Day.';
        prepCard.ingredientKeys = prepCard.ingredientKeys.filter(key => !['egg','egg_white','sharifa_beef_bacon'].includes(key));
        prepCard.steps = [
          'Mix the measured dough. Divide into 100 g Lean dough balls and 125 g Bulk dough balls; these are unshaped portions, not finished rectangles. Cover and refrigerate overnight.',
          'Simmer the measured canned tomato, garlic, olive oil, Italian seasoning and chili flakes. Reserve 15 g finished sauce per pizza.',
          'Saute 30 g pepper and onion per pizza until excess moisture evaporates; cool and refrigerate.',
          'Stage H-E-B fat-free mozzarella: 30 g Lean or 58 g Bulk. Leave the eggs and Sharifa beef bacon raw and refrigerated until Cook Day.',
        ];
      }
      pizza.steps = [
        'Start first: preheat the pizza stone at 425 F for 45–60 minutes on the second-lowest rack.',
        'Cook the measured eggs and whites fully to 160 F. Cook the Sharifa beef bacon to its package endpoint; reserve one pliable cooked slice per pizza and crisp the remaining pieces for bits.',
        'Shape each cold 100 g Lean or 125 g Bulk dough ball into its own box-fitting rectangle on oven-rated parchment. A dough ball is one whole pizza, with no cutting after baking.',
        'Add 15 g house sauce, the tier egg share, 30 g vegetables, one cooked bacon slice and 30 g Lean or 58 g Bulk H-E-B fat-free mozzarella.',
        'Bake on the hot stone; check at 8 minutes, then continue until the crust is browned and the cheese melts. The owner trial took 9–10 minutes.',
        'Add crisp bacon bits after baking so they do not char. Cool briefly on a rack; pack the whole rectangle and check the 8 × 5.2 inch box fit.',
      ];
      pizza.cookPackSteps = pizza.steps;
      pizza.cookDayReservations = pizza.steps;
      pizza.prepSteps = pizza.prepBatches.map(task => task.instruction);
    }
  }

  return data;
});
