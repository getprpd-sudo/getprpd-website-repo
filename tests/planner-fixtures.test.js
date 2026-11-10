const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const live = require('../operations/nutrition/production-data');
const fixture = require('./fixtures/batch10/production.json');
const methods = require('./fixtures/batch10/methods.json');
const root = path.resolve(__dirname, '..');
const python = script => JSON.parse(execFileSync(process.env.PYTHON || 'python', ['-c', script], {cwd: root, encoding: 'utf8'}));

test('archived custom fixture access never changes normal production generation', () => {
  const generated = python("import sys,json;sys.path.insert(0,'operations/nutrition');import generate_production_data as g;print(json.dumps({'normal':g.generate(),'archived':g.generate(include_archived_custom=True)}))");
  assert.deepEqual(generated.normal, live);
  // Archived-custom expansion is only a Batch 12 fixture-generation option.
  // It must be a no-op for the live Batch 13 registry, where p1 and p3 have
  // controlled current meanings and p2 remains absent.
  assert.deepEqual(generated.archived, generated.normal);
  assert.deepEqual(generated.normal.meals.p1, live.meals.p1);
  assert.deepEqual(generated.normal.meals.p3, live.meals.p3);
  assert.equal(generated.normal.meals.p2, undefined);
});

test('frozen scenarios retain recipe identities rather than following live menu slots', () => {
  assert.equal(fixture.batch, 10);
  assert.equal(Object.keys(fixture.meals).length, 21);
  assert.equal(Object.values(fixture.meals).reduce((sum, meal) => sum + Object.keys(meal.tiers).length, 0), 33);
  for (const [id, name] of Object.entries(methods.dishNames)) assert.equal(fixture.meals[id].name, name);
  assert.notEqual(fixture.meals.m1.name, live.meals.m1.name);
  assert.deepEqual(fixture.meals.m4.source, {document: 'generate_production_data.py:recipeLibrary', revision: 'bean-free September 16'});
});

test('archive reader fails closed on an unknown ingredient instead of guessing', () => {
  const result = python(`import sys,json
from unittest.mock import patch
sys.path.insert(0,'operations/tools')
from archived_recipe_data import read_recipes
text='## Example\\n### Lean\\n- 10 g Unidentified sauce\\n'
with patch('pathlib.Path.read_text',return_value=text):
    try:
        read_recipes('example.md',10)
    except ValueError as error:
        strict=str(error)
    else:
        strict=None
    tolerant=read_recipes('example.md',10,strict=False)
print(json.dumps({'strict':strict,'recipe':tolerant['Example']}))`);
  assert.match(result.strict, /unresolved historical ingredient/);
  assert.equal(result.recipe.sourceErrors.length, 1);
  assert.deepEqual(result.recipe.tiers.lean.ingredients, []);
});

test('archive reader preserves recorded Cajun pasta quantities and source version', () => {
  const archived = python("import sys,json;sys.path.insert(0,'operations/tools');from archived_recipe_data import read_recipes;print(json.dumps(read_recipes('NEXT_MENU_NUTRITION_2026-09-12.md',10)))");
  const name = 'Creamy Cajun Chicken Pasta';
  assert.ok(archived[name], 'Expected controlled historical Cajun pasta recipe');
  const saved = Object.values(fixture.meals).find(meal => meal.name === name);
  assert.deepEqual(archived[name].tiers, saved.tiers);
  assert.equal(archived[name].source.batch, 10);
  assert.deepEqual(archived[name].sourceErrors, []);
});
