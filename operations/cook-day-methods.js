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
    version: '2026-08-10.1',
    batch: 6,
    labelExemptCustomers: ['Talal', 'Duaa', 'Rida'],
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
      policy: 'Batch 6 provides one provisional 40g net PRPD Sweet Heat cup only with Power Bowl, Loaded Beef Cottage Pie, and Premium NY Strip Steak. White sauce, syrup, salsa, and incorporated sauces remain recipe-specific.',
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
      'Pack one measured 30g salsa cup per meal.',
    ],
    'Use exact tier-specific chicken, tortilla, egg, egg-white, cheese, yogurt, and salsa quantities.',
    'Cool on racks before sealing.',
    {
      sideCups: 1,
      sideCup: { name: 'Salsa', gramsPerMeal: 30, instruction: 'Fill one measured 30g salsa cup per Breakfast Quesadilla meal; yogurt remains incorporated.' },
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
    'Prep Day: make and cool high-protein mash. Cook Day: beef filling to 160 F; bake assembled pie until hot.',
    [
      'Use the released Cottage Pie beef filling from the protein block.',
      'Retrieve the measured Prep Day potato-cottage-cheese mash.',
      'Build each container with measured filling, mash, and mozzarella; bake until hot and lightly browned.',
      'Pack one sealed 40g net Sweet Heat cup per meal.',
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
      prepSteps: ['Weigh the raw beef kit.', 'Make the exact potato, cottage-cheese, and mozzarella topping on Prep Day.'],
      prepBatches: [
        prep('protein-portion', 'Raw Cottage Pie beef pull', 'Weigh the complete raw beef pull and keep reserve separate.', ['beef_90_raw'], ['Cover, label, date, refrigerate, and cook to 160 F on Cook Day.']),
        prep('starch-ahead', 'Cottage Pie high-protein mash', 'Make the exact recipe-card mash.', ['potato', 'cottage'], ['Cook potatoes until tender.', 'Mash with the measured cottage cheese.', 'Record finished yield, rapid-cool, label, date, and refrigerate.'], { prepWave: 'mash', prepWaveName: 'High-protein mashed potato wave' }),
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
        prep('starch-ahead', 'Steak high-protein mash', 'Make the exact recipe-card mash.', ['potato', 'fairlife_milk', 'fage', 'butter', 'garlic'], ['Cook potatoes until tender.', 'Mash with measured dairy, butter, and garlic.', 'Record yield, rapid-cool, label, date, and refrigerate.'], { prepWave: 'mash', prepWaveName: 'High-protein mashed potato wave' }),
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
    eligibleMealIds: ['b1', 'm1'],
    customerCupsTotal: 0,
    kitchenUseCupsPerSauce: 0,
    qcCupsPerSauce: 1,
    sauces: [{
      name: 'PRPD Sweet Heat Sauce',
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
    ['beef_bacon', 'egg', 'egg_white', 'cottage', 'mozzarella', 'english_muffin', 'potato'],
    ['sheet pan', 'egg pan', 'toaster or air fryer'],
    ['Cook beef bacon according to the purchased package and record the finished count.', 'Cook the measured egg-patty batch until fully set.', 'Toast muffins, assemble sandwiches, and pack potatoes plus one 45g Sweet Heat cup.'],
    'Lean receives one sandwich and 150g potatoes; Bulk receives two sandwiches and 80g potatoes.',
    'Rapid-cool and refrigerate.',
    { sideCups: 1, sideCup: { name: 'PRPD Sweet Heat Sauce', batchGroup: 'prpd-sweet-heat', gramsPerMeal: 45, instruction: 'Pack one 45g net cup per sandwich meal.' }, endpoint: 'Follow package; eggs fully set', prepSteps: ['Mix the full egg-patty base and stage exact sandwich components on Prep Day.'] },
  );
  data.meals.b2 = meal(4, 20, ['griddle', 'sheet pan'], 'Cook custard-soaked bread until the egg mixture is fully set.', ['Cook the complete French Toast batch.', 'Cool, portion fruit and whipped topping, and pack one measured syrup cup.'], 'Lean receives three slices; Bulk receives four.', 'Refrigerate promptly.', { sideCups: 1, sideCup: { name: 'Sugar-free maple syrup', batchGroup: 'french-toast-syrup', gramsPerMeal: 30, instruction: 'Pack one 30g cup per order.' }, prepSteps: ['Cook French Toast and stage toppings on Prep Day.'], prepBatches: [prep('cook-ahead', 'French Toast wave', 'Cook all ordered French Toast.', ['bread_slice', 'egg', 'egg_white', 'cottage', 'fairlife_milk', 'whey', 'brown_sugar', 'vanilla', 'cinnamon', 'avocado_oil'], ['Cook until set, record slice count, rapid-cool, and refrigerate.'])] });
  data.meals.b3 = proteinMethod('Breakfast Quesadilla chicken', 'chicken', 20, ['chicken_thigh_raw', 'egg', 'egg_white', 'mozzarella', 'small_tortilla', 'large_tortilla'], ['chicken skillet', 'egg pan', 'griddle'], ['Cook and release the labeled chicken pull.', 'Cook the egg mixture, assemble exact-tier quesadillas, dry-grill, and pack one salsa cup.'], 'Use exact Lean/Bulk tortilla, chicken, egg, and cheese builds.', 'Rapid-cool and refrigerate.', { sideCups: 1, sideCup: { name: 'Salsa', batchGroup: 'quesadilla-salsa', gramsPerMeal: 30, instruction: 'Pack one 30g cup per order.' }, prepSteps: ['Stage tortillas, cheese, egg mixture, yogurt, and salsa on Prep Day.'] });
  data.meals.b4 = proteinMethod('Breakfast Burrito beef filling', 'beef', 30, ['beef_90_raw', 'onion', 'tomato_paste', 'egg', 'egg_white', 'mozzarella'], ['beef skillet', 'egg pan', 'griddle'], ['Cook beef and onion to 160 F, drain, and cook the filling dry.', 'Cook eggs, assemble the broth-free burritos, and dry-grill.'], 'Lean uses the controlled small-tortilla build; Bulk uses the large-tortilla build.', 'Rapid-cool and refrigerate.', { prepSteps: ['Stage tortillas, egg mixture, and cheese on Prep Day.'] });
  data.meals.m1 = proteinMethod('Loaded Beef Cottage Pie filling', 'beef', 40, ['beef_90_raw', 'mixed_vegetables', 'onion', 'tomato_paste'], ['beef skillet', 'mash station', 'oven'], ['Cook beef to 160 F, drain, and finish the filling without broth.', 'Layer with measured high-protein mash and cheese, bake until hot, and pack one 45g Sweet Heat cup.'], 'Plate exact Lean/Bulk filling, mash, and cheese weights.', 'Rapid-cool and refrigerate.', { sideCups: 1, sideCup: { name: 'PRPD Sweet Heat Sauce', batchGroup: 'prpd-sweet-heat', gramsPerMeal: 45, instruction: 'Pack one 45g net cup per Cottage Pie.' }, prepSteps: ['Prepare mashed potato, vegetables, and cheese on Prep Day.'], prepBatches: [prep('starch-ahead', 'Cottage Pie mash', 'Cook one measured potato batch and blend with cottage cheese.', ['potato', 'cottage'], ['Record raw potato and finished mash weights.', 'Rapid-cool and refrigerate.'])] });
  data.meals.m2 = proteinMethod('Hot Honey Slider chicken', 'chicken', 50, ['chicken_thigh_raw', 'light_mayo', 'sriracha', 'honey', 'hot_sauce'], ['chicken skillet or oven', 'slider assembly station'], ['Cook and record the labeled chicken pull.', 'Add the measured hot-honey finish, assemble the exact slider count with cheese, onion, and drained house pickles.'], 'Lean receives three sliders; Bulk receives four.', 'Rapid-cool and refrigerate.', { prepSteps: ['Make and drain the house refrigerator pickles at least one day ahead.', 'Stage rolls, cheese, onion, and measured finish.'], prepBatches: [prep('cold-prep', 'House refrigerator pickles', 'Make one vinegar-controlled batch and drain the exact recipe quantity before assembly.', ['pickles'], ['Prepare, chill, drain, weigh, and label.'])] });
  data.meals.m3 = proteinMethod('Loaded Buffalo chicken', 'chicken', 60, ['chicken_thigh_raw', 'buffalo_sauce'], ['chicken skillet or oven', 'potato oven'], ['Cook and record the labeled chicken pull before adding buffalo sauce.', 'Bake potatoes and broccoli, add measured buffalo chicken, and portion by tier.'], 'Use 300g potato and 80g broccoli per meal with tier-specific chicken.', 'Rapid-cool and refrigerate.', { prepSteps: ['Cook the complete potato and broccoli batches on Prep Day.'], prepBatches: [prep('starch-ahead', 'Loaded potato batch', 'Cook the exact total potato requirement.', ['potato'], ['Record raw and finished weights; rapid-cool.']), prep('vegetable-ahead', 'Broccoli batch', 'Cook the exact broccoli requirement.', ['broccoli'], ['Record finished yield; rapid-cool.'])] });
  data.meals.m4 = proteinMethod('Beef Seekh Kabab', 'beef', 70, ['beef_90_raw', 'onion', 'garlic', 'paprika', 'cumin', 'chili_powder'], ['beef skillet or oven', 'wrap station'], ['Cook the shaped seekh beef to 160 F and record yield.', 'Build shawarma with lettuce, onion, sauce, and drained house refrigerator pickles.'], 'Lean uses one bread; Bulk uses one and one-half breads with its exact beef allocation.', 'Use earlier in the week; refrigerate promptly.', { prepSteps: ['Form seekh mixture, make white garlic yogurt sauce, and make house refrigerator pickles on Prep Day.'], sideBags: 1, prepBatches: [prep('cold-prep', 'Shawarma pickles and salad', 'Prepare and drain the exact pickle quantity; wash and dry salad produce.', ['pickles', 'lettuce', 'onion'], ['Drain, weigh, label, and refrigerate.'])] });
  data.meals.m5 = proteinMethod('Harissa Honey chicken', 'chicken', 80, ['chicken_thigh_raw', 'harissa', 'honey', 'tomato_paste', 'lemon', 'garlic', 'avocado_oil', 'paprika', 'coriander'], ['chicken skillet or oven', 'rice cooker', 'broccoli oven'], ['Cook and record the labeled chicken pull.', 'Add only the measured harissa-honey finish, then plate with common rice and roasted broccoli.'], 'Use exact tier-specific chicken, dry-rice, and broccoli quantities.', 'Rapid-cool and refrigerate.', { riceBatchGroup: 'common', prepSteps: ['Mix glaze, cook common rice, and roast broccoli on Prep Day.'], prepBatches: [prep('starch-ahead', 'Common basmati rice allocation', 'Cook the exact Harissa rice allocation in the common rice wave.', ['rice_dry'], ['Record dry and cooked weights; rapid-cool.'], { prepWave: 'rice', prepWaveName: 'Common basmati rice wave' }), prep('sauce', 'Harissa-honey glaze', 'Mix the exact glaze without raw-chicken contact.', ['harissa', 'honey', 'tomato_paste', 'lemon', 'garlic', 'avocado_oil', 'paprika', 'coriander'], ['Record starting and finished weight; refrigerate.'])] });
  data.meals.m6 = proteinMethod('Mexican Streetcorn chicken', 'chicken', 90, ['chicken_thigh_raw', 'salt'], ['chicken skillet or oven', 'rice cooker', 'street-corn skillet'], ['Cook and record the labeled chicken pull.', 'Retrieve the common rice, char the measured corn, pepper, onion, and jalapeno, then fold in the cold dairy finish after cooling.', 'Plate the chicken, rice, and finished street corn in three visible sections.'], 'Use exact tier-specific chicken, dry-rice, and street-corn quantities; the creamy finish is incorporated and receives no side cup.', 'Rapid-cool and refrigerate.', { riceBatchGroup: 'common', prepSteps: ['Include chicken in the shared neutral-chicken pull.', 'Cook common rice and the full street-corn component on Prep Day.'], prepBatches: [prep('starch-ahead', 'Common basmati rice allocation', 'Cook the exact Streetcorn Bowl rice allocation in the common rice wave.', ['rice_dry'], ['Record dry and cooked weights; rapid-cool.'], { prepWave: 'rice', prepWaveName: 'Common basmati rice wave' }), prep('vegetable-ahead', 'Streetcorn hot vegetable allocation', 'Char corn, green bell pepper, onion, and jalapeno before adding the cold dairy finish.', ['corn', 'green_bell_pepper', 'onion', 'jalapeno', 'avocado_oil'], ['Cook in uncrowded high-heat batches until moisture is controlled.', 'Record the hot-component yield and rapid-cool.'], { prepWave: 'vegetables', prepWaveName: 'Vegetable production wave' }), prep('topping', 'Cold street-corn finish', 'Mix the measured cold finish.', ['fage', 'light_mayo', 'cotija', 'cilantro', 'lime'], ['Whisk until uniform.', 'Fold into the cooled corn, record finished yield, cover, label, and refrigerate.'])] });
  data.meals.m7 = proteinMethod('Garlic Butter Shrimp', 'seafood', 100, ['shrimp_raw', 'butter', 'garlic', 'lemon', 'cornstarch'], ['shrimp skillet', 'rice cooker', 'vegetable skillet'], ['Cook shrimp last in the raw-protein block to 145 F and record yield.', 'Finish with measured garlic, butter, and lemon; plate with common rice, edamame, and zucchini.'], 'Use exact tier-specific shrimp, rice, edamame, and zucchini.', 'Rapid-cool immediately and use earlier in the week.', { endpoint: '145 F', riceBatchGroup: 'common', prepSteps: ['Cook common rice and the edamame-zucchini component on Prep Day.'], prepBatches: [prep('starch-ahead', 'Common basmati rice allocation', 'Cook the exact Shrimp rice allocation in the common rice wave.', ['rice_dry'], ['Record dry and cooked weights; rapid-cool.'], { prepWave: 'rice', prepWaveName: 'Common basmati rice wave' }), prep('vegetable-ahead', 'Shrimp vegetable component', 'Cook edamame and zucchini.', ['edamame', 'zucchini'], ['Record finished yield; rapid-cool.'])] });
  data.meals.m8 = proteinMethod('BBQ Chicken', 'chicken', 110, ['chicken_thigh_raw', 'bbq_sauce'], ['chicken skillet or oven', 'pasta pot'], ['Cook and record the labeled chicken pull.', 'Add measured BBQ sauce and fold with the cooked high-protein macaroni and cheese.'], 'Plate exact tier-specific chicken with one controlled macaroni serving.', 'Rapid-cool and refrigerate.', { sideCups: 1, sideCup: { name: 'BBQ sauce', batchGroup: 'bbq-side', gramsPerMeal: 30, instruction: 'Pack one measured BBQ sauce cup per meal.' }, prepSteps: ['Cook the complete high-protein macaroni batch on Prep Day.'], prepBatches: [prep('starch-ahead', 'High-protein macaroni and cheese', 'Cook all ordered macaroni according to the controlled package ratio.', ['protein_mac', 'mozzarella'], ['Record dry package weight, finished yield, and portions; rapid-cool.'])] });
  data.meals.d1 = meal(3, 10, ['blender', 'mixing bowls', 'dessert containers'], 'No final cook.', ['Blend the measured dough, form three equal balls per serving, and use 14g total chocolate per serving.'], 'Three balls per serving.', 'Serve chilled.', { prepSteps: ['Build, coat, count, and chill on Prep Day.'] });
  data.meals.d2 = meal(3, 20, ['mixing bowls', 'whisk', 'dessert cups'], 'No cook.', ['Whisk until smooth, portion by weight, finish with Oreo Thins, and record yield.'], 'One cup per order.', 'Serve chilled.', { prepSteps: ['Build and chill every mousse cup on Prep Day.'] });
  data.meals.d3 = meal(3, 30, ['blender', '8-inch square pan', 'oven'], 'Bake at 325 F until the edges are set and center moves as one piece.', ['Blend the cheesecake base, add cooled strawberry swirl, bake, chill fully, and cut into eight equal weighed squares.'], 'One equal square per order.', 'Serve chilled.', { prepSteps: ['Bake, chill, weigh, and package the complete cheesecake-square batch on Prep Day.'], prepBatches: [prep('dessert', 'Strawberry-Lemon Cheesecake Squares', 'Bake the exact controlled pan formula.', ['reduced_cream_cheese', 'cottage', 'fage', 'egg', 'whey', 'cornstarch', 'vanilla', 'lemon', 'salt', 'strawberry', 'honey'], ['Record raw batter, baked pan, strawberry reduction, and eight square weights.'])] });
  data.meals.a1 = meal(3, 40, ['egg pot', '12 oz divided boxes'], 'Hard-boil eggs until fully cooked; follow beef-bacon package.', ['Cook and chill eggs and beef bacon, then assemble cheese, whole mini apple, cucumber, and sealed dip.'], 'One 12 oz Protein Box per order.', 'Enjoy chilled; refrigerate promptly.', { prepSteps: ['Cook eggs, wash apples/cucumber, mix dip, and test lid closure on Prep Day.'], prepBatches: [prep('cold-kit', 'Protein Box kits', 'Assemble exact 12 oz boxes with one whole mini apple.', ['egg', 'beef_bacon', 'mozzarella', 'apple', 'cucumber', 'fage', 'light_mayo', 'lemon', 'jalapeno', 'garlic'], ['Record apple weights and confirm every lid closes without pressure.'])] });
  data.meals.a2 = proteinMethod('Mini Chicken Snack Wrap chicken', 'chicken', 120, ['chicken_thigh_raw', 'salt'], ['chicken skillet', 'wrap station'], ['Cook and release the labeled chicken pull.', 'Cool enough to avoid steaming, then split each order\'s filling evenly across two 45-calorie Mission Carb Balance Fajita tortillas with cheese, fresh salad, and house sauce.'], 'Two wraps per order.', 'Use earlier in the week; refrigerate promptly.', { prepSteps: ['Wash and dry salad produce and mix house sauce on Prep Day.'] });
  data.meals.a3 = meal(3, 50, ['mixing bowls', '12 oz cups'], 'No cook except strawberry reduction.', ['Reduce 45g strawberries to 30g per serving and cool fully.', 'Mix the measured oat base, pack to the tested fill weight, seal, and refrigerate overnight.'], 'One fixed 12 oz cup per order.', 'Enjoy chilled; stir before eating.', { prepSteps: ['Build and chill all overnight-oat cups on Prep Day.'], prepBatches: [prep('cold-kit', 'Strawberry Protein Overnight Oats', 'Build the exact fixed-size 12 oz formula.', ['oats', 'fage', 'fairlife_milk', 'whey', 'strawberry', 'chia', 'honey', 'vanilla', 'salt'], ['Record strawberry reduction, filled cup weights, lid closure, and final count.'])] });

  for (const method of Object.values(data.meals)) {
    while (method.steps.length < 3) method.steps.push('Verify the finished count, portion weight, label, and cold-holding status before release.');
  }

  return data;
});
