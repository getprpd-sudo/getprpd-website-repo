"""Export controlled recipe quantities for a read-only planner-library audit."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'nutrition'))
from audit_full_menu_library_macros import ENTRIES
import calculate_next_menu as menu
from generate_production_data import build_lines
from archived_recipe_data import read_recipes

def export():
    recipes = {}
    for entry in ENTRIES:
        tiers = ['lean', 'bulk'] if entry.tiers else ['single']
        recipes[entry.name] = {
            'name': entry.name, 'category': entry.category, 'status': entry.status,
            'tiers': {tier: {'ingredients': build_lines(entry.factory(tier) if entry.tiers else entry.factory())}
                      for tier in tiers},
        }
    # Pair published builds with their contemporaneous method version. A bare
    # factory omits menu-level oil/garnish transforms and is not that batch.
    aliases = {'Sweet Chili Chicken with Vegetable Rice': 'Sweet Chili Chicken',
               'Lemon Pepper Tilapia with Garlic Potatoes': 'Lemon Pepper Tilapia'}
    for batch, filename in [(8, 'NEXT_MENU_NUTRITION_2026-08-29.md'),
                            (9, 'NEXT_MENU_NUTRITION_2026-09-05.md'),
                            (10, 'NEXT_MENU_NUTRITION_2026-09-12.md')]:
        for name, recipe in read_recipes(filename, batch, strict=False).items():
            canonical = aliases.get(name, name)
            if canonical in recipes:
                recipe['category'] = recipes[canonical]['category']
                recipe['name'] = canonical
                recipe['methodName'] = 'Pepper Steak' if canonical == 'Pepper Steak Bowl' else name
                recipes[canonical] = recipe
    # Explicit later source revisions supersede retired bottled-sauce drafts.
    # These are the existing house 28:10:2 formula and standing garnish rule,
    # not newly invented substitutions or changes to the public menu.
    for name, factory, single, garnish in [
        ('Beef Breakfast Skillet', menu.breakfast_skillet, False, True),
        ('Lemon Pepper Tilapia', menu.lemon_pepper_tilapia, False, True),
        ('PRPD Protein Box', menu.protein_box, True, False),
    ]:
        def version(tier):
            record = factory() if single else factory(tier)
            if garnish:
                record = menu.with_cilantro_garnish(record)
            return menu.with_batch8_purchased_oil(record)
        recipes[name] = {'name': name, 'category': recipes[name]['category'],
            'source': {'batch': 8, 'document': 'calculate_next_menu.py:house mustard BBQ revision'},
            'tiers': {tier: {'ingredients': build_lines(version(tier))}
                      for tier in (['single'] if single else ['lean', 'bulk'])}}
    # The paid custom kofta is a fixed Lean build, not a public Single SKU.
    kofta = recipes['High-Protein Beef Kofta & Roasted Vegetables']
    kofta['tiers']['lean'] = kofta['tiers'].pop('single')
    return recipes

if __name__ == '__main__':
    print(json.dumps(export()))
