(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  if (root) root.PRPD_COOK_METHODS = data;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const meal = (phase, order, equipment, temperature, steps, plating, hold, options = {}) => ({
    phase, order, equipment, temperature, steps, plating, hold,
    sideCups: options.sideCups || 0,
    sideBags: options.sideBags || 0,
    validation: options.validation || '',
    prepSteps: options.prepSteps || [],
    prepBatches: options.prepBatches || [],
    stepIngredients: options.stepIngredients || {},
  });

  const data = {
    version: '2026-07-20.1',
    batch: 3,
    labelExemptCustomers: ['Talal', 'Duaa'],
    sharedProteinSeasoning: [{
      id: 'neutral-chicken-base',
      name: 'PRPD neutral savory chicken base',
      proteinKey: 'chicken_thigh_raw',
      dishIds: ['b3', 'm2', 'm3', 'm5'],
      note: 'Season these compatible boneless chicken thighs together, record the master weight, then divide into labeled dish bowls before adding each finish. Biryani remains separate.',
      basePerKg: [
        { name: 'Fine salt', grams: 8 },
        { name: 'Garlic powder', grams: 4 },
        { name: 'Onion powder', grams: 4 },
        { name: 'Paprika', grams: 3 },
        { name: 'Black pepper', grams: 2 },
      ],
      finishes: {
        b3: { note: 'No extra finish. Cook and portion for the Power Bowl.', perKg: [] },
        m2: { note: 'Add cumin, smoked paprika, mild chile, and lime after splitting.', perKg: [{ name:'Ground cumin', grams:2 }, { name:'Smoked paprika', grams:2 }, { name:'Mild chili powder', grams:1 }, { name:'Lime juice', grams:15 }] },
        m3: { note: 'Add hot sauce and measured honey after cooking.', perKg: [] },
        m5: { note: 'Coat with the measured BBQ sauce after cooking.', perKg: [] },
      },
    }],
    weeklySauces: {
      policy: 'Prepare two batch-wide sauces. Allocate one sealed 2 oz cup per eligible savory meal, split evenly between flavors, plus measured squeeze-bottle portions for assembly and one QC cup per flavor.',
      cupSizeOz: 2,
      customerCupsPerSauce: 30,
      kitchenUseCupsPerSauce: 10,
      qcCupsPerSauce: 1,
      sauces: [
        {
          name: 'Smoky BBQ Yogurt Ranch', estimatedCaloriesPerCup: 25,
          ingredientsPerCup: [
            { key:'fage', name:'Fat-free Greek yogurt', grams:33, station:'Sauces & Dairy' },
            { key:'bbq_sauce', name:'Sugar-free BBQ sauce', grams:18, station:'Sauces & Dairy' },
            { key:'fairlife_milk', name:'Fat-free milk', grams:7, station:'Sauces & Dairy', measure:{type:'liquid',density:1.03} },
            { key:'garlic_powder', name:'Garlic powder', grams:.6, station:'Dry Prep & Seasonings', measure:{type:'spice',gramsPerTsp:3.1} },
            { key:'onion_powder', name:'Onion powder', grams:.5, station:'Dry Prep & Seasonings', measure:{type:'spice',gramsPerTsp:2.4} },
            { key:'paprika', name:'Smoked paprika', grams:.4, station:'Dry Prep & Seasonings', measure:{type:'spice',gramsPerTsp:2.3} },
            { key:'dill', name:'Dried dill', grams:.3, station:'Dry Prep & Seasonings', measure:{type:'spice',gramsPerTsp:1} },
            { key:'salt', name:'Fine salt', grams:.2, station:'Dry Prep & Seasonings', measure:{type:'spice',gramsPerTsp:6} },
          ],
          steps:['Whisk smooth. Taste a 60 g pilot with chicken and a potato before scaling.','Reserve kitchen-use sauce first, then fill, seal, count, date, and refrigerate customer cups.'],
        },
        {
          name: 'Tangy Yogurt Honey Mustard', estimatedCaloriesPerCup: 45,
          ingredientsPerCup: [
            { key:'fage', name:'Fat-free Greek yogurt', grams:39, station:'Sauces & Dairy' },
            { key:'mustard', name:'Dijon or prepared mustard', grams:14, station:'Sauces & Dairy' },
            { key:'honey', name:'Honey', grams:5, station:'Breakfast & Desserts' },
            { key:'apple_cider_vinegar', name:'Apple cider vinegar', grams:2, station:'Sauces & Dairy', measure:{type:'liquid',density:1.01} },
          ],
          steps:['Whisk smooth. Taste a 60 g pilot with a savory meal before scaling.','Reserve kitchen-use sauce first, then fill, seal, count, date, and refrigerate customer cups.'],
        },
      ],
    },
    phases: [
      { title:'1. Reconcile and stage', detail:'Lock orders, labels, containers, side cups, ingredients, equipment, and cold-holding capacity.' },
      { title:'2. Desserts and cold work', detail:'Build desserts, sauces, cold toppings, and produce before raw-protein work.' },
      { title:'3. Oven and breakfast line', detail:'Start passive oven work, then run egg and griddle batches while equipment is occupied.' },
      { title:'4. Rice, pasta, potatoes, and vegetables', detail:'Cook shared bases in controlled batches, record yields, then divide into labeled pans.' },
      { title:'5. Protein production', detail:'Cook by labeled dish batch, verify endpoint temperature and cooked yield, and hold each component separately.' },
      { title:'6. Cool and assemble by SKU', detail:'Release measured components, assemble one dish and tier at a time, then move finished containers to cold holding.' },
      { title:'7. Customer pack-out', detail:'Bag one customer at a time, reconcile items and sauces, and record shortages, overage, or corrections.' },
    ],
    meals: {},
  };

  data.meals.b1 = meal(3, 10, ['egg skillet','sheet pans','400 F oven'], 'Cook eggs until fully set; roast sweet potato at 400 F until browned.', [
    'Roast measured tomato and sweet potato separately so the omelette stays dry.',
    'Saute mushrooms and jalapeno; record finished vegetable weight.',
    'Whisk eggs, egg whites, FAGE, and salt; cook omelettes by tier.',
    'Add mozzarella, fold, and verify the first Lean and Bulk builds before continuing.',
  ], 'Lean: 2 eggs, 92 g egg whites, 40 g cheese, vegetables, one sourdough slice. Bulk: 3 eggs, 138 g egg whites, 56 g cheese, vegetables, two slices.', 'Cool hot components before sealing. Pack toast so condensation does not soften it.', {
    prepSteps:['Wash and cut mushrooms, jalapeno, tomato, and sweet potato.','Count sourdough slices and pre-weigh egg and cheese builds by tier.'],
    prepBatches:[{type:'side',name:'Omelette vegetable and sweet-potato kit',ingredientKeys:['mushroom','jalapeno','tomato','sweet_potato','avocado_oil'],instruction:'Wash, cut, weigh, and stage in labeled oven/skillet pans.'}],
  });

  data.meals.b2 = meal(5, 20, ['beef skillet','egg skillet','sheet pan'], 'Cook ground beef to 160 F and drain thoroughly; cook eggs until set.', [
    'Brown and drain the labeled beef batch with onion and garlic.',
    'Roast sweet potato with measured oil until browned but reheat-friendly.',
    'Cook eggs by tier and keep slightly moist.',
    'Assemble measured beef, sweet potato, eggs, mozzarella, and salsa after all yields are recorded.',
  ], 'Lean: 200 g raw beef build and 1 egg. Bulk: 270 g raw beef build and 2 eggs. Both receive 100 g sweet potato, 28 g mozzarella, and 30 g salsa.', 'Record drained beef yield. Keep salsa separate.', {
    sideCups:1, prepSteps:['Dice sweet potato and onion.','Pre-weigh beef, eggs, cheese, salsa, and seasonings by tier.'],
    prepBatches:[{type:'mix',name:'Breakfast skillet beef and vegetable kit',ingredientKeys:['beef_90_raw','sweet_potato','egg','mozzarella','onion','garlic','salsa','avocado_oil','salt'],instruction:'Stage raw beef separately from the clean vegetable and finishing components.'}],
  });

  data.meals.b3 = meal(5, 30, ['chicken skillet','egg skillet','sheet pans'], 'Cook chicken to 165 F; eggs must be fully set.', [
    'Use the labeled Power Bowl chicken split from the shared seasoning batch and cook to 165 F.',
    'Roast sweet potato with measured oil.',
    'Cook the two-egg portion and record finished egg weight.',
    'Whisk FAGE and sriracha, then assemble only after chicken yield is released.',
  ], 'Lean: 200 g raw chicken build. Bulk: 300 g raw chicken build. Both receive 100 g sweet potato, 2 eggs, and 30 g FAGE with 15 g sriracha.', 'Keep yogurt finish cold until assembly.', {
    prepSteps:['Cut sweet potato and portion the yogurt-sriracha finish.','Include chicken in the compatible master seasoning pull.'],
    prepBatches:[{type:'sauce',name:'Power Bowl yogurt-sriracha finish',ingredientKeys:['fage','sriracha'],instruction:'Whisk, taste, cover, and refrigerate.'}],
  });

  data.meals.b4 = meal(3, 40, ['blender','nonstick griddle','small saucepans'], 'Cook pancakes over medium heat until centers are set; compote must cool before packing.', [
    'Simmer blueberries into a light compote and cool completely.',
    'Whisk the cheesecake topping smooth and refrigerate.',
    'Mix dry and wet pancake ingredients separately, then combine only until incorporated.',
    'Cook a test pancake, adjust batter consistency once, then finish the batch.',
    'Record batter weight, pancake count, topping yield, and the day-three test sample.',
  ], 'Lean: 3 medium pancakes. Bulk: 4. Each gets measured blueberry compote, cheesecake-yogurt topping, and a separate sugar-free syrup cup.', 'TEST REQUIRED: verify sweetness, exact pancake count, topping yield, fit, and day-three reheat quality before final label printing.', {
    sideCups:2, validation:'Physical test required', prepSteps:['Make compote and topping first.','Pre-weigh dry pancake mix by tier and count syrup cups.'],
    prepBatches:[{type:'mix',name:'Blueberry cheesecake pancake set',ingredientKeys:['flour','baking_powder','whey','egg','egg_white','fage','fairlife_milk','blueberry','philadelphia_no_bake','powdered_sugar','maple_syrup','vanilla','cinnamon','avocado_oil','salt'],instruction:'Keep compote, topping, syrup, and batter components separated until their method step.'}],
  });

  data.meals.m1 = meal(3, 50, ['mixing bowls','rolling station','375 F oven'], 'Cook beef to 160 F; bake pockets until dough is fully set and browned.', [
    'Brown beef and onion, drain completely, then finish with broth, ketchup, and pickles.',
    'Mix yogurt dough, rest 10 minutes, and divide into equal Lean-size pocket portions.',
    'Fill with cooled beef and mozzarella; seal every edge firmly.',
    'Bake without crowding, cool on racks, and record finished pocket count and weight.',
  ], 'Lean: 2 pockets. Bulk: 3 pockets. Pocket size stays constant between tiers.', 'Freezer-friendly. Filling must be cool before sealing dough. Record dough and finished-count yield.', {
    validation:'Confirm dough yield and day-three reheat quality', prepSteps:['Prepare and cool beef filling.','Pre-weigh dough and cheese; stage pickles drained dry.'],
    prepBatches:[{type:'mix',name:'Hot Pocket dough and beef filling',ingredientKeys:['flour','baking_powder','fage','beef_90_raw','onion','broth','ketchup','pickles','mozzarella','salt'],instruction:'Prepare filling and dough as separate labeled batches.'}],
  });

  data.meals.m2 = meal(5, 60, ['chicken skillet','rice cooker','high-heat corn skillet'], 'Cook chicken to 165 F; char corn over high heat and add dairy off heat.', [
    'Cook the labeled Streetcorn chicken split to 165 F and record yield.',
    'Cook the controlled rice batch and record dry and cooked weights.',
    'Char corn, pepper, and onion; remove from high heat before adding FAGE, mayo, Cotija, lime, and cilantro.',
    'Record finished corn-mixture yield before assembling three visible sections.',
  ], 'Use tier-specific chicken and rice builds with a distinct creamy street-corn section.', 'Freezer-friendly. Record corn-mixture and rice yields because prior production ran short on rice.', {
    prepSteps:['Include chicken in the compatible master seasoning pull.','Wash and cut peppers, onions, cilantro, and lime; pre-weigh the corn-crema set.'],
    prepBatches:[{type:'sauce',name:'Mexican street-corn mixture',ingredientKeys:['corn','green_bell_pepper','onion','jalapeno','fage','light_mayo','cotija','lime','cilantro','avocado_oil','salt'],instruction:'Keep dairy cold until charred vegetables are off high heat.'}],
  });

  data.meals.m3 = meal(5, 70, ['chicken skillet or oven','sheet pans','375 F oven'], 'Cook chicken to 165 F; bake assembled sliders at 375 F for 10-12 minutes.', [
    'Cook the labeled slider chicken split to 165 F and record yield.',
    'Mix measured hot sauce, honey, light mayo, and sriracha; taste a pilot before scaling.',
    'Build sliders with chicken, mozzarella, onion, corn, and drained pickles.',
    'Bake 10-12 minutes, cool on racks, and record fit, leakage, and finished count.',
  ], 'Lean: 2 sliders. Bulk: 3 sliders. Slider size remains constant.', 'TEST REQUIRED: verify flavor, leakage, container fit, and day-three reheat before final label printing.', {
    validation:'Physical test required', prepSteps:['Include chicken in the compatible master seasoning pull.','Mix hot-honey mayo and stage rolls, cheese, onion, corn, and drained pickles.'],
    prepBatches:[{type:'sauce',name:'Hot-honey slider sauce',ingredientKeys:['hot_sauce','honey','light_mayo','sriracha'],instruction:'Make a pilot, approve it with chicken, then scale and refrigerate.'}],
  });

  data.meals.m4 = meal(5, 80, ['marinating pans','heavy pot','rice cooker'], 'Cook chicken to 165 F; hold cooked rice under the commercial kitchen procedure.', [
    'Marinate chicken separately with FAGE, lemon, garlic, ginger, spices, and salt.',
    'Cook chicken to 165 F and record cooked yield.',
    'Cook the measured biryani rice base with onion, tomato, and spices; record dry and cooked weights.',
    'Prepare cucumber, tomato, onion, and lemon salad cold and drain before packing.',
  ], 'Both tiers receive the controlled rice build and salad; use the tier-specific chicken quantity.', 'Freezer-friendly main; pack salad separately because it is not freezer-friendly.', {
    sideCups:1, prepSteps:['Marinate chicken as a distinct batch.','Cut salad produce and hold cold; pre-weigh rice and aromatics.'],
    prepBatches:[{type:'marinade',name:'Chicken biryani marinade',ingredientKeys:['chicken_thigh_raw','fage','lemon','garlic','ginger','onion','tomato','rice_dry','avocado_oil','salt'],instruction:'Keep this distinct from the neutral chicken batch.'},{type:'side',name:'Biryani cucumber salad',ingredientKeys:['cucumber','tomato','onion','lemon'],instruction:'Cut, drain, portion, and refrigerate.'}],
  });

  data.meals.m5 = meal(5, 90, ['chicken skillet or oven','large pot','sauce-cup station'], 'Cook chicken to 165 F; prepare protein mac according to its purchased package.', [
    'Cook the labeled BBQ chicken split to 165 F and record yield.',
    'Prepare protein mac according to package directions and record finished weight.',
    'Reserve measured side sauce first, then coat chicken with the remaining BBQ sauce.',
    'Assemble chicken and mac, top with mozzarella, and cool before sealing.',
  ], 'Lean and Bulk use their tier-specific chicken quantity with one controlled mac serving, 28 g mozzarella, and a 30 g BBQ side cup.', 'Freezer-friendly. Confirm the purchased mac package and finished yield before final label printing.', {
    sideCups:1, prepSteps:['Include chicken in the compatible master seasoning pull.','Stage protein mac, mozzarella, and counted BBQ cups.'],
    prepBatches:[{type:'sauce',name:'BBQ coating and cups',ingredientKeys:['bbq_sauce'],instruction:'Reserve side cups before coating cooked chicken.'},{type:'side',name:'Protein mac set',ingredientKeys:['protein_mac','mozzarella'],instruction:'Stage package-equivalent dry portions and cheese.'}],
  });

  data.meals.m6 = meal(5, 100, ['marinating tubs','high-heat skillet','rice cooker'], 'Cook beef in uncrowded batches to the commercial kitchen endpoint.', [
    'Blend soy, honey, apple, garlic, ginger, sriracha, sesame oil, and cornstarch.',
    'Marinate beef strips, then sear in uncrowded batches and record cooked yield.',
    'Cook rice and record dry and cooked weights.',
    'Stir-fry broccoli, pepper, and carrot; combine only after each component is released.',
  ], 'Use tier-specific beef, rice, and vegetable quantities. Keep vegetables visibly distinct.', 'Freezer-friendly. Verify the reduced beef portions still plate generously.', {
    prepSteps:['Slice and marinate beef separately.','Cut the stir-fry vegetables and pre-weigh rice.'],
    prepBatches:[{type:'marinade',name:'Korean bulgogi marinade',ingredientKeys:['beef_strips_raw','soy_sauce','honey','sesame_oil','garlic','ginger','sriracha','apple','cornstarch'],instruction:'Blend, taste, and coat the complete beef pull.'},{type:'side',name:'Bulgogi vegetable blend',ingredientKeys:['broccoli','green_bell_pepper','carrot'],instruction:'Wash, cut evenly, and stage for high-heat cooking.'}],
  });

  data.meals.m7 = meal(5, 110, ['shrimp skillet','rice cooker','vegetable skillet'], 'Cook shrimp until opaque and firm; do not overcook. Follow the commercial kitchen seafood endpoint.', [
    'Cook rice and record dry and cooked weights.',
    'Cook zucchini and edamame until just tender; hold separately.',
    'Cook shrimp in uncrowded batches with garlic, butter, lemon, and cornstarch finish.',
    'Record raw pull, cooked shrimp yield, and first/middle/final portions.',
  ], 'Use tier-specific shrimp, rice, edamame, and zucchini quantities.', 'Fridge-only. Confirm the current shrimp package and actual cooked yield.', {
    prepSteps:['Thaw shrimp safely and drain well.','Cut zucchini; pre-weigh edamame, rice, butter, garlic, lemon, and cornstarch.'],
    prepBatches:[{type:'side',name:'Shrimp rice and vegetable set',ingredientKeys:['rice_dry','edamame','zucchini','butter','garlic','lemon','cornstarch','salt'],instruction:'Keep drained shrimp cold and separate until cook time.'}],
  });

  data.meals.m8 = meal(5, 120, ['heavy skillet','potato pot','sheet pans','instant-read thermometer'], 'Sear steak to the selected doneness under the commercial kitchen procedure; cook broccoli until reheat-friendly.', [
    'Boil potatoes until tender, drain thoroughly, then mash with measured milk, FAGE, butter, garlic, and salt.',
    'Roast or steam broccoli until just tender.',
    'Pat steak dry, season, and sear in uncrowded batches.',
    'Rest before slicing; record raw pull, cooked yield, and reheated test quality.',
  ], 'Lean: 240 g raw steak build. Bulk: 300 g. Both receive 200 g potato build and tier-specific broccoli.', 'TEST REQUIRED: verify steak yield, doneness after reheating, and side presentation.', {
    validation:'Physical reheat check required', prepSteps:['Portion raw steak by tier.','Cut potato and broccoli; pre-weigh milk, FAGE, butter, garlic, oil, and salt.'],
    prepBatches:[{type:'side',name:'Mashed potato and broccoli set',ingredientKeys:['potato','broccoli','fairlife_milk','fage','butter','avocado_oil','garlic','salt'],instruction:'Stage potato and broccoli separately with measured finishing ingredients.'}],
  });

  data.meals.d1 = meal(2, 10, ['blender or food processor','mixing bowl','dessert cups'], 'No cook. Refrigerate immediately after portioning.', [
    'Blend cottage cheese completely smooth.',
    'Mix whey, ground oats, peanut butter, honey, vanilla, and salt until dough-like.',
    'Fold in chocolate chips, portion evenly, seal, count, and refrigerate.',
  ], 'One controlled dessert cup per order.', 'Record finished total weight and cup yield.', {
    prepSteps:['Complete, seal, count, and chill before raw-protein work.'],
    prepBatches:[{type:'dessert',name:'Cookie Dough Cup batch',ingredientKeys:['cottage','whey','oats','peanut_butter','honey','vanilla','chocolate_chips'],instruction:'Blend the base, mix, portion, seal, count, and chill.'}],
  });

  data.meals.d2 = meal(2, 20, ['blender','mixing bowl','dessert cups'], 'No cook. Refrigerate immediately after portioning.', [
    'Blend cottage cheese smooth, then mix with FAGE, whey, powdered sugar, vanilla, milk, and salt.',
    'Fold 10 g Biscoff spread per cup into the filling.',
    'Build the two-cookie crumb layer, portion filling, and finish with the 5 g Biscoff swirl.',
    'Seal, count, chill, and reserve a day-three texture sample.',
  ], 'One controlled dessert cup per order.', 'TEST REQUIRED: verify Biscoff flavor, crumb structure, sweetness, and day-three texture.', {
    validation:'Physical test required', prepSteps:['Run one test cup before scaling the full ordered batch.'],
    prepBatches:[{type:'dessert',name:'Lotus Biscoff Cheesecake batch',ingredientKeys:['cottage','fage','whey','biscoff_spread','powdered_sugar','vanilla','biscoff_cookie','fairlife_milk','salt'],instruction:'Approve one cup, then scale, portion, seal, count, and chill.'}],
  });

  data.meals.d3 = meal(2, 30, ['mixing bowl','whisk','dessert cups'], 'No cook. Refrigerate immediately after portioning.', [
    'Whisk FAGE, pudding mix, whey, and half the banana smooth.',
    'Fold in the remaining banana pieces.',
    'Layer with crushed Biscoff cookies, portion evenly, seal, count, and refrigerate.',
  ], 'One controlled dessert cup per order.', 'Confirm the purchased pudding packet serving weight before final label printing.', {
    prepSteps:['Complete, seal, count, and chill before raw-protein work.'],
    prepBatches:[{type:'dessert',name:'Banana Cream Pie Cup batch',ingredientKeys:['fage','banana_pudding_mix','whey','banana','biscoff_cookie'],instruction:'Mix, layer, portion, seal, count, and chill.'}],
  });

  return data;
});
