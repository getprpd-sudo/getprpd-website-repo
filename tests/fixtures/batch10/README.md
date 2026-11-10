# Batch 10 planner regression scenarios

These frozen inputs keep the 24 kitchen-dashboard and kitchen-consolidation tests independent of rotating live menu slot IDs. They are **not** an exact reconstruction of the meals delivered on September 12 and must never be imported into a production lock.

## Provenance

- Public recipe quantities: `operations/nutrition/NEXT_MENU_NUTRITION_2026-09-12.md`, parsed using exact known ingredient names and the existing production-unit conversion.
- Enchilada exception: approved September 16 bean-free reusable recipe. The maintained method had already adopted that change. Its Lean and Bulk allocations remain separate, with no unsupported one-pan capacity guarantee.
- Three historical private recipe scenarios: the explicit archived custom definitions in `generate_production_data.py`. Normal generation still excludes those recipes from the live menu.
- Methods: the preserved Batch 10 identities before the Batch 11 rotation in `cook-day-methods.js`, including current ingredient-source metadata, cooling and routing corrections.
- Created September 21, 2026. Twenty-one recipes and 33 tier scenarios. No customer records or personal data.

## Maintenance

Tests load these JSON files directly, never regenerate them from the live menu. `node operations/tools/build-planner-regression-fixture.cjs` prints candidate production JSON; add `--methods` for candidate method JSON. It writes nothing. Review the resulting diff and source provenance before intentionally updating either fixture.

Do not refresh fixtures to make an unexpected failure disappear. Keep recipe quantities fixed when changing planner code. Active-menu tests separately verify the current production dataset and every current tier.
