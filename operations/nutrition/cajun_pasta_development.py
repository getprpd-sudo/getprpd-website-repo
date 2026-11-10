"""WITHDRAWN CUSTOM DRAFT. Owner requested an actual published recipe instead.

Do not use these estimates for Batch 10 production or labels. Retained only as
development history. See recipes/CAJUN_PASTA_SOURCE_DECISION_2026-09-08.md.

Run directly to print recipe totals and component estimates. All gram amounts
are raw/as purchased unless explicitly named cooked. Milk is measured in mL.
"""
import json
import calculate_next_menu as base

# US Barilla Protein+ label: 190 kcal, 10g protein, 38g carbs, 1g fat per 56g.
# Kept recipe-local. Do not overwrite the existing Kroger pasta profile.
PROFILES = {k: base.active.INGREDIENTS[k].nutrition for k in (
    "chicken_thigh_cooked", "green_bell_pepper", "onion", "tomato",
    "fairlife_milk", "reduced_cream_cheese", "parmesan", "cornstarch",
    "garlic", "avocado_oil", "paprika", "black_pepper", "salt", "cilantro")}
PROFILES.update({
    "protein_penne": base.n(190, 10, 38, 5, 1).scale(100/56),
    "garlic_powder": base.n(331, 16.55, 72.73, 9, .73),
    "onion_powder": base.n(341, 10.41, 79.12, 15.2, 1.04),
    "oregano": base.n(265, 9, 68.92, 42.5, 4.28),
    "thyme": base.n(276, 9.11, 63.94, 37, 7.43),
    "cayenne": base.n(318, 12.01, 56.63, 27.2, 17.27),
})
SPICES = {"paprika":1.5,"garlic_powder":1,"onion_powder":.5,
          "oregano":.25,"thyme":.25,"black_pepper":.25,"cayenne":.1,"salt":1}
TIERS = {
    "lean": {"raw_thigh":180,"protein_penne":50,"green_bell_pepper":80,
             "onion":35,"tomato":50,"fairlife_milk":100,
             "reduced_cream_cheese":12,"parmesan":8,"cornstarch":3,
             "garlic":5,"avocado_oil":2,"cilantro":2,"spice_multiplier":1},
    "bulk": {"raw_thigh":240,"protein_penne":65,"green_bell_pepper":100,
             "onion":45,"tomato":65,"fairlife_milk":130,
             "reduced_cream_cheese":18,"parmesan":8,"cornstarch":4,
             "garlic":7,"avocado_oil":3,"cilantro":2,"spice_multiplier":1.4},
}

def estimate(tier):
    recipe = TIERS[tier]
    amounts = {k:v for k,v in recipe.items() if k not in ("raw_thigh","spice_multiplier")}
    # Existing PRPD working yield and meat-only roasted profile, not a measured
    # batch result. Raw 180/240g becomes an estimated 135/180g cooked.
    amounts["chicken_thigh_cooked"] = recipe["raw_thigh"] * .75
    amounts.update({k:v*recipe["spice_multiplier"] for k,v in SPICES.items()})
    nutrition = base.n()
    for key, amount in amounts.items():
        nutrition += PROFILES[key].scale(amount/100)
    return {"tier":tier,"estimated_cooked_chicken_g":amounts["chicken_thigh_cooked"],
            "nutrition":{k:round(getattr(nutrition,k),2) for k in
                         ("calories","protein","carbs","fat","fiber")},
            "as_purchased_recipe":recipe,
            "spice_g":round(sum(SPICES.values())*recipe["spice_multiplier"],3)}

if __name__ == "__main__":
    raise SystemExit("WITHDRAWN: custom Cajun formula is not the selected published recipe. Do not use for production or labels.")
    assert abs(sum(SPICES.values())-4.85)<1e-9
    assert all(v>=0 for r in TIERS.values() for v in r.values())
    for tier in TIERS:
        print(json.dumps(estimate(tier),indent=2))
