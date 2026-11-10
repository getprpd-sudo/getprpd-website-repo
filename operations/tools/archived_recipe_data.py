"""Read versioned, controlled recipe documents without changing their formulas.

Used by the library audit and immutable regression-fixture preparation, never
as a nutrition publisher. Unknown ingredient names fail instead of guessing.
"""
import re
import sys
from pathlib import Path

NUTRITION = Path(__file__).resolve().parents[1] / 'nutrition'
sys.path.insert(0, str(NUTRITION))
import calculate_next_menu as menu
from generate_production_data import build_lines

# Exact historical labels whose controlled ingredient identity was later renamed.
# These aliases preserve archived wording without weakening unknown-ingredient
# failure behavior for any other label.
HISTORICAL_INGREDIENT_ALIASES = {
    'Mission Carb Balance small tortilla': 'small_tortilla',
}

def read_recipes(filename, batch, *, strict=True):
    names = {item.name: key for key, item in menu.active.INGREDIENTS.items()}
    ordered_names = sorted(names, key=len, reverse=True)
    recipes, name, tier, portions, problems = {}, None, None, [], []
    text = (NUTRITION / filename).read_text(encoding='utf-8')
    older_format = '## Controlled Builds' in text

    def flush():
        if name and tier and (portions or problems):
            recipe = recipes.setdefault(name, {'name': name, 'tiers': {},
                'source': {'batch': batch, 'document': filename}})
            recipe['tiers'][tier] = {'ingredients': build_lines(menu.build(portions, [], 'medium'))}
            recipe.setdefault('sourceErrors', []).extend(problems)

    for line in text.splitlines():
        if (older_format and line.startswith('### ')) or (not older_format and line.startswith('## ')):
            flush()
            name, tier, portions, problems = line.lstrip('#').strip(), None, [], []
        elif older_format and (match := re.match(r'^\*\*(Lean|Bulk|Single):', line)):
            flush()
            tier, portions, problems = match.group(1).lower(), [], []
        elif line.startswith('### ') and line[4:].strip().lower() in ('lean', 'bulk', 'single'):
            flush()
            tier, portions, problems = line[4:].strip().lower(), [], []
        elif name and tier and (match := re.match(r'^- ([\d.]+) (g|each) (.+)$', line)):
            amount, unit, label = match.groups()
            ingredient = next((candidate for candidate in ordered_names
                if label == candidate or label.startswith(candidate + ' (')), None)
            if ingredient is None and label in HISTORICAL_INGREDIENT_ALIASES:
                ingredient = menu.active.INGREDIENTS[HISTORICAL_INGREDIENT_ALIASES[label]].name
            if ingredient is None:
                message = f'{filename}: unresolved historical ingredient {amount} {unit} {label!r}'
                if strict:
                    raise ValueError(message)
                problems.append(message)
                continue
            note = label[len(ingredient):].strip().removeprefix('(').removesuffix(')')
            portions.append(menu.p(names[ingredient], float(amount), unit, note))
    flush()
    return recipes

if __name__ == '__main__':
    import json
    print(json.dumps(read_recipes(sys.argv[1], int(sys.argv[2]))))
