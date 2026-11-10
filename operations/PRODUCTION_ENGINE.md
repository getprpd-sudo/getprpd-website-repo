# Shared production engine

`production-engine.js` is the pure calculation boundary used by the planner and grocery tools. It exports `PRPD_PRODUCTION_ENGINE` in a browser and the same API in Node. Load order: order config, production data, cook-day core, cooking methods, kitchen workflow, grocery core, production engine. Rendering and saving are outside this module.

## Compile

```js
const plan = ENGINE.compileProduction({
  orders,                 // expanded recipe/tier items; cancelled/held/skipped excluded
  counts,                 // optional; must match supplied active orders if both exist
  data, methods, config,
  buffer: {rawProteinBufferPct: 5, riceBufferPct: 0, riceYieldFactor: 3},
  extras: [],             // optional-extra IDs; [] explicitly selects none
  sauceConfig             // optional override; shared method defaults otherwise
});
```

The result is deeply immutable. Do not mutate a compiled plan to render it. Presentation code can copy the arrays it needs to group or annotate. Numeric `buffer: 5` means a 5% raw-protein reserve; typed settings are preferred. Invalid percentages are rejected before the legacy core can clamp them.

Primary outputs:

- `counts`, `plannedCounts`, `orders`, `totalMeals`, `labelCount`.
- `registry.current`, `registry.historical`, `registry.bySlot`: stable recipe IDs and content versions, separate from weekly menu slots. Explicit recipe IDs take precedence; legacy identities adapt from names. Component IDs/versions are nested in each current recipe reference.
- `recipes`: compiled tier quantities, ingredient ownership, raw/dry typed inputs, unknown cooked output, customer versus extra production counts, pack allocation and relevant customer notes.
- `component`: whole-batch prep quantities and protein/seasoning groups. `dishIngredients[id]` is the whole-dish total, including fixed-batch quantities exactly once. Consumers must not reconstruct it by summing tier views.
- `operational.totals`, `adjustments`, `requirements`, `packaging`: shared production/shopping demand. Feed `requirements` directly into the grocery purchase/catalog calculation; pantry and package prices do not modify recipe demand.
- `cups`, `sauceReserves`, `sauceGroups`: customer, internal and QC demand. Every compiled sauce/topping prep batch has `sauceGroupRef`. Sauce groups supply input grams, cup rows, incorporated allocations and reserves. A raw-input reservation is not a verified finished fill.
- `produce`: shared pulls with exact recipe destinations and declared cuts.
- `conservation`: ingredient-stage ownership, whole-dish versus tier reconciliation and cup/package checks.
- `diagnostics`: structural `errors`, physical `holds`, `warnings`, measurement `decisions` and audit rows. `ok` means structurally valid; `releaseReady` additionally requires active demand and no physical holds or unresolved decisions. Structural failures return no actionable grocery requirements or packaging. Physical holds retain planning quantities but cannot authorize production release.

## Snapshot and reuse

`snapshot` contains a schema/version, deterministic content checksum, order/recipe/demand/extras/buffer/sauce/batch hashes and compact recipe references. Ingestion timestamps, source row positions and expansion flags are not order truth. Actual order identity, items, quantities, notes and fulfillment details are retained. Global quantity-affecting method policies also invalidate the snapshot.

`compareSnapshots(previous, current)` returns `{same, changed, requiresReview}`. Persist only the compact snapshot alongside the reviewed/locked source, not the full compiled methods or recipe graph. `fingerprint(value)` is a deterministic 128-bit content checksum, not an authentication or cryptographic signing primitive.

## Boundaries

This compiler reuses the audited low-level arithmetic primitives while replacing duplicated consumer calculations. It does not rewrite food formulas, invent cooked yields, approve held recipes or alter live orders. Unexpanded bundles, unidentified orders, conflicting quantities, unsupported ingredient overrides and unowned fixed-batch allocations fail closed. Customer omission instructions are routed to affected portions; ingredients set aside are not silently subtracted from shopping.

Historical method adapters still exist behind the boundary. Retire them only after migrating their recipe/component records and freezing the relevant fixtures. A new fixed-batch quantity needs explicit component/tier ownership; the compiler does not guess how to apportion it.

Validation: `node --test tests/production-engine.test.js` exercises the final 118-item fixture, no-order case, shuffled menu IDs, extras/QC, package categories, raw/dry basis, cancelled orders, invalid buffers, bundle expansion, customer omissions, malformed state, immutable snapshots, browser/Node parity and frozen historical recipes.
