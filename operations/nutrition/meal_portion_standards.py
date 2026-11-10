"""Owner-approved component-meal portion controls, effective 2026-10-07.

These controls apply to separable protein + starch + vegetable meals. They do
not silently rewrite incorporated dishes or format-specific recipes. The first
boneless-thigh calibration produced 430 g cooked before sauce from 625 g raw;
keep that one-run yield visible until a later rolling yield replaces it.
"""

CHICKEN_COOKED_G = {"lean": 160.0, "bulk": 210.0}
CHICKEN_MEASURED_YIELD = 430 / 625
RICE_DRY_G = {"lean": 45.0, "bulk": 60.0}
STARCH_COOKED_G = {"lean": 120.0, "bulk": 160.0}
VEGETABLE_G = {"lean": 75.0, "bulk": 100.0}
GROUND_BEEF_90_RAW_G = {"lean": 210.0, "bulk": 300.0}
GROUND_BEEF_FINISHED_COMPONENT_G = {"lean": 175.0, "bulk": 250.0}


def tier_value(values: dict[str, float], tier: str) -> float:
    if tier not in values:
        raise ValueError(f"Unsupported meal tier for portion standard: {tier}")
    return values[tier]


def chicken_raw_pull_g(tier: str) -> float:
    return tier_value(CHICKEN_COOKED_G, tier) / CHICKEN_MEASURED_YIELD
