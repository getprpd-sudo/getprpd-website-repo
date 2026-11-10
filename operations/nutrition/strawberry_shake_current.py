"""Owner-locked November2 strawberry formula; recipe-based nutrition/cost model.

The330g serving is the reported bottle fill. The lower-milk recipe has not been
physically remeasured. Ingredient/proportional-loss assumptions stay internal.
"""
from dataclasses import asdict
import calculate_next_menu as r

NAME = 'Strawberry Protein Shake'
SERVING_G = 330
FORMULA = [('shake_fairlife_fatfree',180),('gainful_everyday_whey_unflavored',20),
 ('shake_fage_0',30),('strawberry',80),('banana',50),('honey',16),('vanilla',1),
 ('strawberry',30)]
INPUT_G = sum(g for _,g in FORMULA)

r.add_ingredient('shake_fairlife_fatfree','Fairlife fat-free ultra-filtered milk',
 r.n(80,13,6,0,0,0,6,0,120,5,0,5,380,0,400).scale(100/240),
 source='https://fairlife.com/ultra-filtered-milk/fat-free-skim-milk/',
 note='Manufacturer240mL panel. Working mass conversion1g=1mL is an approximation, not measured density.')
r.add_ingredient('gainful_everyday_whey_unflavored','Gainful Everyday Whey, unflavored',
 r.n(120,23,1,0,2.5,1.5,0,0,60,65,0,0,150,0,120).scale(100/28),
 source='https://www.gainful.com/cdn/shop/files/PROG14-White_abeb5879-4065-4477-917b-cd5d080a3627.jpg?v=1744991514',
 note='Manufacturer panel visually checkedNovember2:28g120cal23P. Carbs<1g conservatively modeled1g; trans/fiber/D/iron not significant. No flavored packet.')
r.add_ingredient('shake_fage_0','FAGE Total0% plain Greek yogurt',
 r.n(90,18,5,0,0,0,5,0,65,10,0,0,200,0,260).scale(100/170),
 source='https://www.target.com/p/-/A-14729218',
 note='Manufacturer-supplied panel on exactUPC689544083016 listing, checkedNovember2. Do not price at the GreatValue catalog alias.')

def strawberry_shake(serving_g=SERVING_G):
 if serving_g <= 0:
  raise ValueError('Positive serving mass required')
 factor=serving_g/INPUT_G
 return r.build([r.p(k,g*factor) for k,g in FORMULA], [
  'Owner explicitly locked180g milk/30g FAGE onNovember2; other base ingredients unchanged,30g chunks added after blending.',
  'Full input407g;330g is a proportional serving, not the entire recipe assigned to one bottle.',
  'Assume mixed composition and nonselective product loss for this recipe estimate; some chunks/foam actually remained in the pilot.',
  'Prior200g-milk trial recovered345g including chunks and filled330g. Those observations are not a measured yield for the new formula.',
  'No settledmL, new cold-hold result, measured milk density or shelf-life validation is invented.'
 ],'medium')

RATES = {
 'shake_fairlife_fatfree':(5/1538,'Recorded PRPD52floz bottle5USD; historic planning mass1538g'),
 'gainful_everyday_whey_unflavored':(33.99/(14*28),'Gainful manufacturer14serving product page33.99USD, checkedNovember2; web quote, not receipt'),
 'shake_fage_0':(7.69/907.18474,'Target32oz FAGE0%7.69USD checkedNovember2, not local receipt'),
 'strawberry':(2.52/454,'Walmart receiptAugust26,1lb clamshell2.52USD; usable-fruit loss not measured'),
 'banana':(.49/453.59237,'Walmart receiptOctober15,.49USD/lb; peeled/gross yield not measured'),
 'honey':(8.97/680,'Walmart receiptJuly16,24oz8.97USD'),
 'vanilla':(4.98/59,'Recorded local planning59g equivalent4.98USD, exact SKU/density unverified'),
}

def cost_model(saleable_recovery=1.0):
 if not 0 < saleable_recovery <= 1:
  raise ValueError('Recovery must be greater than0 and at most1')
 factor=SERVING_G/(INPUT_G*saleable_recovery)
 usable={'strawberry':.95,'banana':.65}
 lines=[dict(ingredient=k,edible_recipe_g=g*factor,usable_fraction=usable.get(k,1),
             issued_g=g*factor/usable.get(k,1),unit_cost=RATES[k][0],
             cost=g*factor/usable.get(k,1)*RATES[k][0],source=RATES[k][1],
             trim_basis='95%hulled strawberry/65%peeled banana planning scenarios, not measured' if k in usable else'no additional trim factor')
        for k,g in FORMULA]
 # Delivered20-count bottle+cap Amazon order, owner purchase reverified November2.
 bottle=19.47/20
 label=.15
 consumables=.15
 ingredients=sum(x['cost'] for x in lines)
 return dict(saleable_recovery=saleable_recovery,ingredient_lines=lines,ingredients=ingredients,
  bottle_and_cap=bottle,label_print_allowance=label,shared_consumables_allowance=consumables,
  direct_total=ingredients+bottle+label+consumables,
  limits='No labor/delivery/profit/tax charge. Label/consumables and fruit trim are planning assumptions. Current prices are not all fresh local quotes. No new bottle purchase needed.')

def report():
 return dict(name=NAME,owner_locked=True,input_g=INPUT_G,serving_g=SERVING_G,
  formula=[dict(ingredient=k,grams=g) for k,g in FORMULA],
  full_batch_nutrition=asdict(r.active.total(strawberry_shake(INPUT_G))),
  per_bottle_nutrition=asdict(r.active.total(strawberry_shake())),
  cost_no_process_loss=cost_model(),
  cost_prior_trial_saleable_ratio_sensitivity=cost_model(330/427),
  prior_trial_ratio_not_new_yield=True,
  ingredients_statement='Fat-free ultra-filtered milk, strawberries, banana, nonfat Greek yogurt, unflavored whey/casein protein blend, honey, vanilla.',
  allergens=['MILK'])
