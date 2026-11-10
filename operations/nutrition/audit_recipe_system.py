"""Repeatable whole-library audit and weighed pilot worksheets, never a menu.

The historical inventory is overlaid with explicit latest recipe versions.
Outputs retain source portions and raw purchasing conversions separately.
Nothing here marks a recipe tested, changes a public menu, or releases labels.
"""
from __future__ import annotations

import hashlib
import json
import math
from dataclasses import asdict
from pathlib import Path

import audit_full_menu_library_macros as historical
import batch13_recipes as prior
import current_recipe_registry as current
import calculate_next_menu as m
from generate_production_data import RAW_CONVERSIONS, build_lines
from generate_next_menu_label_data import load_order_config

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'operations' / 'active'
ALIASES = {
    'Sweet Chili Chicken': 'Sweet Chili Chicken with Vegetable Rice',
    'NY Strip Steak Bites': 'Premium NY Strip Steak',
    'Custom Lebanese Chicken + Fattoush-Style Salad': 'Custom Lebanese-Style Chicken Breast',
}
NUTRIENTS = ('calories', 'protein', 'carbs', 'fiber', 'fat')
PROTEINS = {
    'chicken_thigh_raw': 'Boneless chicken thighs',
    'chicken_breast_raw': 'Custom chicken breast',
    'chicken_mince_raw': 'Custom chicken mince',
    'leg_quarter_raw': 'Bone-in chicken',
    'beef_90_raw': 'Ground beef', 'beef_96_raw': 'Ground beef',
    'ny_strip_raw': 'Steak / beef strips', 'beef_strips_raw': 'Steak / beef strips',
    'pink_salmon_raw': 'Fish / seafood', 'tilapia_raw': 'Fish / seafood',
    'shrimp_raw': 'Fish / seafood',
}
BASES = {'rice_dry', 'quinoa_dry', 'potato', 'instant_potato_flakes',
         'protein_pasta', 'kroger_protein_pasta', 'barilla_protein_plus_rotini', 'protein_mac', 'lasagna_sheet', 'shawarma_bread',
         'small_tortilla', 'large_tortilla', 'fajita_tortilla', 'lavash', 'bread_slice'}
REVIEW_NOTES = {
    'High-Protein Beef Lasagna': 'The September 21 24-versus-13-sheet observation is historical. The locked Batch 15 recipe uses the later controlled 12-sheet standard. Use the current registry and method, not the earlier test layout.',
    'Mexican Streetcorn Chicken Bowl': 'The historical ingredient table omitted green pepper. The current registry explicitly includes 30g Lean /40g Bulk; use that resolved baseline rather than omitting pepper or reopening the historical omission.',
    'Blueberry Cheesecake Protein Pancakes': 'July pilot names no-bake filling; later authority uses reduced-fat cream cheese. The older pilot must not silently override the current ingredient.',
    'High Protein Tiramisu': 'The July 18 successful five-cup production formula is the controlled calculation source. The older three-cup test remains historical; measure coffee pickup, cup weight, exact package panels, and refrigerated hold before label release.',
    'High-Protein Beef Kofta & Roasted Vegetables': 'September 30 R&D text still describes Valentina and pan oil. Later owner decisions select sriracha and no pan oil. Current registry takes priority.',
    'Custom Lebanese-Style Chicken Breast': 'Original pilot includes salad; October 1 owner revision removes salad and keeps two cups. Current registry takes priority.',
    'Strawberry Cheesecake': 'Former cup format was retired pending a replacement; historical calculator availability is not permission to return it.',
    'Lotus Biscoff Cheesecake': 'Older cup test and later baked-square direction conflict. Treat as historical development, not a ready return.',
    'Cheesy Achiote Chicken Tacos': 'This current draft supersedes the incomplete historical Cheesy Chicken Tacos name. Keep it unavailable until the tortilla, weighted formula, avocado finish, 72-hour hold and reheat tests pass.',
}
OUTSIDE_NUTRITION_REGISTRY = [
    {'name':'Mango Habanero Chicken Wings', 'source':'recipes/MANGO_HABANERO_WINGS_BATCH_11_PILOT.md',
     'status':'Provisional family-only recipe; wing count/size, sauce panel and macros unresolved'},
]


def registry():
    """No slot IDs. Known latest revisions take priority, others stay historical."""
    records = {}
    for entry in historical.ENTRIES:
        name = ALIASES.get(entry.name, entry.name)
        records[name] = {
            'category': entry.category, 'single': not entry.tiers,
            'factory': entry.factory, 'source': 'Historical structured library',
        }
    # The September 21 fixed-well formula supersedes the old per-meal multiplier.
    records['Egg Bites'].update(factory=m.egg_bites_reconciled,
                               source='September 21 fixed 24-well formula')
    for name, (factory, single) in prior.RECIPES.items():
        if name not in records:
            records[name] = {'category': 'Historical addition', 'single': single,
                             'factory': factory, 'source': 'Historical structured library'}
    for name, (factory, single) in current.RECIPES.items():
        previous = records.get(name, {})
        records[name] = {'category': previous.get('category', 'Current addition'),
                         'single': single, 'factory': factory,
                         'source': 'Current recipe registry'}
    return records


def versions(name, spec):
    tiers = ['lean'] if name in {'High-Protein Beef Kofta & Roasted Vegetables',
                                 'Custom Lebanese-Style Chicken Breast'} else (
        ['single'] if spec['single'] else ['lean', 'bulk'])
    for tier in tiers:
        if name in current.RECIPES:
            record = current.recipe(name, tier)
        else:
            record = spec['factory']() if spec['single'] else spec['factory'](tier)
        yield tier, record


def checks(name, tier, record, lines):
    errors = []
    if not record.portions:
        errors.append('Empty recipe')
    for portion in record.portions:
        if portion.ingredient not in m.active.INGREDIENTS:
            errors.append(f'Unknown ingredient {portion.ingredient}')
        if not math.isfinite(portion.amount) or portion.amount < 0:
            errors.append(f'Invalid amount for {portion.ingredient}')
        if portion.unit not in {'g', 'each'}:
            errors.append(f'Uncontrolled unit {portion.unit}')
    for row in lines:
        if sum(row.get('allocations', {}).values()) > row['amount'] + .001:
            errors.append(f"Overallocated component {row['key']}")
    if m.active.nutrition_is_complete(record) and m.menu_total(record).calories > m.total(record).calories + .001:
        errors.append('Menu calories exceed complete package')
    keys = {p.ingredient for p in record.portions}
    if name == 'High-Protein Beef Kofta & Roasted Vegetables':
        if 'beef_96_raw' not in keys or any(k.startswith('beef_90') for k in keys):
            errors.append('Custom kofta must retain actual 96/4 nutrition')
    if any(k.startswith('chicken_breast') for k in keys) and not name.startswith('Custom '):
        errors.append('Standard chicken recipe uses breast instead of thighs')
    return [f'{name} / {tier}: {error}' for error in errors]


def audit():
    config = load_order_config()
    public = {item['name']: item for section in ('breakfasts','mains','desserts','addons')
              for item in config['menu'][section]}
    result = {'version': '2026-10-19.2', 'scope': 'Current registry plus historical inventory, not release approval',
              'recipes': [], 'errors': [], 'nutritionBlocks': [], 'publicMacroDifferences': [],
              'uncontrolledHistorical': historical.UNCONTROLLED_HISTORICAL,
              'outsideNutritionRegistry': OUTSIDE_NUTRITION_REGISTRY,
              'sourceDocuments': []}
    for path in sorted((ROOT / 'operations' / 'recipes').glob('*.md')):
        result['sourceDocuments'].append({'path': path.relative_to(ROOT).as_posix(),
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    for name, spec in registry().items():
        item = {'name': name, 'source': spec['source'], 'category': spec['category'],
                'status': 'Measured calibration pending', 'tiers': {}}
        if name in REVIEW_NOTES:
            item['documentReview'] = REVIEW_NOTES[name]
        if name == 'Cheeseburger Hot Pockets':
            item['status'] = 'Retired; do not test or offer unless owner reopens'
        elif name == 'High Protein Tiramisu':
            item['status'] = ('Controlled five-cup estimate; coffee pickup, cup weight, exact '
                              'package panels and refrigerated hold pending')
        elif name in current.HOLDS:
            item['status'] = 'Hold: ' + current.HOLDS[name]
        elif spec['source'] == 'Historical structured library':
            item['status'] = 'Historical calculation; review recipe record before return'
        for tier, record in versions(name, spec):
            lines = build_lines(record)
            errors = checks(name, tier, record, lines)
            result['errors'].extend(errors)
            if m.active.nutrition_is_complete(record):
                public_values = dict(zip(NUTRIENTS, m.display(m.menu_total(record))))
                full_values = dict(zip(NUTRIENTS, m.display(m.total(record))))
            else:
                blocked = [m.active.INGREDIENTS[p.ingredient] for p in record.portions
                           if not m.active.INGREDIENTS[p.ingredient].nutrition_complete]
                reason = '; '.join(f'{ingredient.name}: {ingredient.note}' for ingredient in blocked)
                result['nutritionBlocks'].append({'name': name, 'tier': tier, 'reason': reason})
                item['status'] = 'Hold: nutrition basis incomplete. ' + reason
                public_values = dict.fromkeys(NUTRIENTS)
                full_values = dict.fromkeys(NUTRIENTS)
            families = sorted({PROTEINS[row['key']] for row in lines if row['key'] in PROTEINS})
            item['tiers'][tier] = {
                'testFamilies': families or [spec['category']],
                'bases': [row['name'] for row in lines if row['key'] in BASES],
                'menuEstimate': public_values, 'packageEstimate': full_values,
                'sourcePortions': [asdict(p) for p in record.portions],
                'purchasingInputs': lines,
                'lowConfidenceIngredients': sorted({p.ingredient for p in record.portions
                    if m.active.INGREDIENTS[p.ingredient].confidence == 'low'}),
                'modeledYieldConversions': {p.ingredient: RAW_CONVERSIONS[p.ingredient][2]
                    for p in record.portions if p.ingredient in RAW_CONVERSIONS},
                'explicitComponentRefs': sorted({p.note.split(':',1)[1] for p in record.portions
                                                if p.note.startswith('component:')}),
                'assumptions': record.assumptions,
                'finishedWeight': None,
            }
            menu_item = public.get(name)
            if menu_item:
                saved = menu_item.get('bulkMacros') if tier == 'bulk' else menu_item.get('macros')
                expected = {('cal' if key == 'calories' else key): value for key,value in public_values.items()}
                if saved != expected:
                    result['publicMacroDifferences'].append({'name':name, 'tier':tier,
                        'published':saved, 'calculatedMenu':expected,
                        'action':'Review only; no automatic public update'})
        result['recipes'].append(item)
    result['counts'] = {'controlledRecipes':len(result['recipes']),
        'tierBuilds':sum(len(x['tiers']) for x in result['recipes']),
        'uncontrolledHistorical':len(result['uncontrolledHistorical']),
        'recipeDocuments':len(result['sourceDocuments'])}
    return result


def report(result):
    c = result['counts']
    lines = ['# Whole recipe-system audit - October 19, 2026', '',
        f"{c['controlledRecipes']} structured recipes / {c['tierBuilds']} tier builds, plus {c['uncontrolledHistorical']} historical names without controlled formulas. {c['recipeDocuments']} recipe documents are fingerprinted in the companion JSON.", '',
        'This audits all registered formulas, not merely the last menu. A calculation is not a measured kitchen test. Historical drafts are not promoted to approved recipes. The companion JSON contains every ingredient, raw/cooked basis, conversion, source and unresolved input.', '',
        '## Findings and changes', '',
        '- Nouman kofta used the generic 90/10 crumble function. It now uses 330 g actual raw 96/4 beef. Grouping remains Ground beef; grouping must not alter the ingredient, package panel or label. No drained-fat calorie discount is inferred.',
        '- The old whole-library audit used the retired per-meal Egg Bites formula. This audit explicitly selects the September 21 fixed 24-well recipe; a successful taste report is not a measured tray yield.',
        '- The current recipe registry overrides historical versions. It includes later additions and the owner-selected Hot Honey Chicken Sliders return. Positional menu IDs are not recipe identities.',
        '- Finished net weight is UNKNOWN for every unmeasured build. Input grams cannot become printed finished weight: rice gains water, meat loses moisture, sauces reduce, and onion is squeezed.',
        '- The recipe source layer still mixes code formulas, dated Markdown revisions and generated files. The planner migration must consume versioned components, not reproduce these exceptions in the display.',
        '- Shared tests cover only the same ingredient, grade, cut, method and equipment load. Do not transfer a whole-thigh yield to breast, mince, bone-in chicken or an incompatible marinade. Test full assembly/pack-out per meal.',
        '- Ordinary beef purchased on the Epic receipt is marked 80/20 versus the recipe model 90/10. Owner clarified Nouman is always 96/4, not the other beef. Keep the ordinary-beef mismatch open until its actual package is confirmed.', '',
        '## Public menu discrepancies (no public edits)', '',
        '| Dish | Tier | Saved calories / protein | Calculated meal calories / protein |',
        '|---|---|---:|---:|']
    for mismatch in result['publicMacroDifferences']:
        saved, calculated = mismatch['published'] or {}, mismatch['calculatedMenu']
        lines.append(f"| {mismatch['name']} | {mismatch['tier']} | {saved.get('cal')} / {saved.get('protein')} g | {calculated['cal']} / {calculated['protein']} g |")
    if result.get('nutritionBlocks'):
        lines += ['', '## Nutrition release holds', '',
                  'These builds remain in the structural inventory, but their nutrition is withheld. They are not label-ready.', '']
        for blocked in result['nutritionBlocks']:
            lines.append(f"- {blocked['name']} / {blocked['tier']}: {blocked['reason']}")
    lines += ['', 'These are meal-only figures. Complete-package labels also include separate cups. Hot Pockets are retired, salmon is held, and physical/package validation is still required; matching one number does not establish correctness.', '',
        '## Full structured inventory', '',
        '| Dish | Test family | Base | Version | Status |', '|---|---|---|---|---|']
    for item in result['recipes']:
        tiers = list(item['tiers'].values())
        families = ', '.join(sorted({v for t in tiers for v in t['testFamilies']}))
        bases = ', '.join(sorted({v for t in tiers for v in t['bases']})) or 'Recipe-specific / no starch'
        status = item['status']
        if status.startswith('Hold:'):
            status = 'Hold: see source and detailed JSON'
        lines.append(f"| {item['name']} | {families} | {bases} | {item['source']} | {status} |")
    lines += ['', '## Historical names still missing formulas', '']
    lines += [f'- {name} ({category}).' for name,category in result['uncontrolledHistorical']]
    lines += ['', '## Other recorded builds outside this nutrition registry', '']
    lines += [f"- {item['name']}: {item['status']}. Source: `{item['source']}`."
              for item in result['outsideNutritionRegistry']]
    lines += ['', '## Written-recipe conflicts requiring version cleanup', '']
    lines += [f'- {name}: {note}' for name,note in REVIEW_NOTES.items()]
    lines += ['', '## Verification', '',
        f"Automated structural errors: {len(result['errors'])}. This checks ingredient identity, finite quantities, allocation limits, nutrition scope and standard thigh/custom breast distinctions; it does not validate taste or real yield.",
        *[f'- {error}' for error in result['errors']], '',
        'Next physical work: [Current plain-text kitchen tests](KITCHEN_TESTS_2026-10-19.txt). The October 5 workbook is historical, not today\'s test schedule. Record observations first; review recipe/version changes before publishing or printing.', '']
    return '\n'.join(lines)


def pilot_rows(name, tiers):
    by_key = {}
    records = dict(versions(name, registry()[name]))
    for tier in tiers:
        for row in build_lines(records[tier]):
            key = (row['key'], row['unit'])
            target = by_key.setdefault(key, {'name': row['name'], 'unit':row['unit'],
                                             'amounts':{}, 'key':row['key']})
            target['amounts'][tier] = row['amount']
    return list(by_key.values())


def workbook():
    lines = ['# Kitchen calibration workbook', '', 'October 5, 2026 - internal weighed tests, not a menu or released nutrition label.', '',
        '## Start here', '',
        'You do not need to cook the whole library this week. Start with A, B and C. Each row gives exact current INPUTS, not promised cooked portions. D validates the shared cup process. Record every addition instead of fixing a thin sauce or small portion by eye.', '',
        'Use a gram scale, a small-quantity scale for spices, thermometer, timer and the real meal containers. Photograph each package panel once. Tare bowls and containers. Keep one observation sheet per cooking method and actual meat grade, even though the planner shows one beef section.', '',
        '| Record for every test | Actual |', '|---|---|',
        '| Date, recipe version, equipment and pan size | |',
        '| Purchased brand, package panel, raw weight after thawing, trim discarded | |',
        '| Exact ingredients added, including spray oil and extra water | |',
        '| Raw meat / dry starch / cooked drained edible output, weighed separately | |',
        '| Finished sauce, bowl/pot residue, packed amount and leftover | |',
        '| Active time, cook time and thermometer endpoint | |',
        '| Lean and Bulk component weights, full net container weight and photo | |',
        '| Taste, fullness, ease of making, next-day texture | |',
        '| 24-hour and 72-hour reheated texture, if safely held | |', '',
        'Keep input food identity unchanged. Water loss alone does not change the total nutrients assigned to a batch. Do not calculate fat loss from weight loss or assume draining 90/10 makes it 96/4.', '',
        '## A. Chicken + plain rice + glaze', '',
        'Use one Lean and one Bulk Sweet Chili Chicken build. Both use thighs. Plate 160g cooked Lean and 210g cooked Bulk BEFORE glaze. The October 7 test measured 430g cooked from 625g raw, so the current raw pulls reverse the 68.8% yield. Keep the 75g/100g vegetables separately weighable from the rice and make the two glaze allocations separately.', '']
    def table(name, tiers):
        cols = ' | '.join(t.capitalize() for t in tiers)
        result = [f'| Ingredient input | {cols} | Total to weigh |',
                  '|---|' + '---:|' * (len(tiers)+1)]
        for row in pilot_rows(name, tiers):
            values = [row['amounts'].get(tier,0) for tier in tiers]
            result.append('| '+row['name']+' | '+' | '.join(f'{v:.2f} {row["unit"]}' for v in values)+f' | {sum(values):.2f} {row["unit"]} |')
        return result
    lines += table('Sweet Chili Chicken with Vegetable Rice', ['lean','bulk'])
    lines += ['', 'Rice: weigh the 105 g dry input and the exact water you actually use, following your package/equipment directions. Weigh the cooked batch and allocate 45/105 to Lean and 60/105 to Bulk, checking against the 120g/160g plated targets. Water amount and cook time are measurement fields, not invented house standards. Record whether this small batch differs from a normal cooker load.', '',
        '## B. Ground beef + rice + toppings', '',
        'One Lean and one Bulk Boy Kibble using actual 90/10 beef. Cook the two beef pulls separately (210g and 300g), or weigh plain cooked output before the differing seasonings/toppings and allocate in that ratio. Rice is 45g dry Lean / 60g dry Bulk. Working finished seasoned-component targets are 175g / 250g until an actual 90/10 yield is measured.', '']
    lines += table('Boy Kibble', ['lean','bulk'])
    lines += ['', 'The final four ingredients make one 45 g Sweet Heat cup per meal. They are not added again on top of a pre-made cup. Keep cold lettuce/tomato and the separate cup out of the hot-cook yield.', '',
        '## C. Kofta and vegetables', '',
        'One fixed five-log portion, using actual 96/4 beef. No separate pan-oil allocation. Weigh onion before squeezing and retained pulp after squeezing. Mix, weigh the complete meat mixture, and divide into five equal logs. Record the combined cooked weight before plating. Vegetables are weighed separately. One 45 g Sweet Heat cup is already included below.', '']
    lines += table('High-Protein Beef Kofta & Roasted Vegetables', ['lean'])
    lines += ['', 'The working calculation is about 535 calories / 76 g protein for the meal and 620 calories / 76 g protein with the cup. This is not a validated label. Purchased panel, retained onion and finished weights still need checking.', '',
        '## D. Shared Sweet Heat cup yield', '',
        'One 450 g input batch: 110.29 g light mayonnaise + 132.35 g ketchup + 132.35 g honey + 75.00 g sriracha (rounding totals 449.99 g). These preserve the existing 250:300:300:170 ratio.', '',
        'Weigh the empty bowl, full mix, empty cup/lid, every 45 g net fill, remaining sauce and bowl residue. A 450 g INPUT does not guarantee ten filled cups after transfer loss. Record the actual count. If this batch supplies B and C, allocate three cups from it, not an extra three-cup batch; the remaining cups are test stock, not customer production.', '',
        '## Next rounds, only after the first results', '',
        '| Round | What needs its own measured test | Why it cannot be inferred from A-D |',
        '|---|---|---|',
        '| 2 | Butter Chicken and Biryani, one Lean + one Bulk each | Separate marinades, yogurt split, sauce reduction and combined cooking |',
        '| 2 | Instant mash using actual package; roasted potato; broccoli/roasted vegetables | Different water/trim/cooking losses. Mash is packaged flakes, never raw potatoes |',
        '| 3 | Salmon + rice + incorporated Alfredo + separate Alfredo cup | Fish edible yield, dairy panels, reduction and finished cup fill |',
        '| 3 | Shawarma, Tikka Wrap, pinwheels and hummus box | Closure/container fit, cold assembly and held texture |',
        '| 4 | Fixed-well Egg Bites, pancakes, egg/tortilla breakfasts | Batter deposits, piece counts, eggs, pan capacity |',
        '| 4 | Desserts, shakes and other chilled builds | Cup fill, thickening, coating and stored texture |',
        '| Later | Steak, seafood, bone-in chicken, pasta and historical returns | Their own cut, endpoint, liquid uptake and portioning |', '',
        'Hot Pockets are deliberately absent from testing. Do not cook or develop a replacement until the owner reopens it.', '',
        '## How results update the system', '',
        '1. Record raw/dry input, cooked edible output and any discarded material by component.',
        '2. Calculate yield = cooked edible grams / raw edible grams; rice expansion = cooked rice / dry rice. Use only for the same method and product.',
        '3. Check mass balance: packed + leftover + measured process loss equals the measured finished batch, within the scale precision. Explain any difference.',
        '4. Rate the actual Lean/Bulk meal and approve exact component weights. A prettier box alone does not validate macros.',
        '5. Update one recipe version and package panels, then regenerate groceries, cooking, cups, costs and label estimates together. Print net weight only from a finished measurement.', '',
        '## Food-safety checkpoints', '',
        'Use a thermometer: poultry 165 F; ground beef 160 F; reheated leftovers 165 F. Refrigerate promptly in shallow containers, keep cold food at 40 F or below, and do not taste an improperly cooled or stored test. A sensory reheat check is not a shelf-life study. Follow the business food-safety plan for production cooling and holding.',
        'Reference: [USDA food-safety basics](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/steps-keep-food-safe).', '']
    return '\n'.join(lines)


def main():
    result = audit()
    for name, content in (
        ('RECIPE_SYSTEM_AUDIT_2026-10-19.json', json.dumps(result, indent=2)+'\n'),
        ('RECIPE_SYSTEM_AUDIT_2026-10-19.md', report(result)),
    ):
        path = OUT / name
        path.write_text(content, encoding='utf-8')
        print(path)
    print(json.dumps({'counts':result['counts'], 'errors':result['errors'],
                      'publicMacroDifferences':len(result['publicMacroDifferences'])}))
    if result['errors']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
