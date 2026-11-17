"""Owner-approved Batch 20 cookie and lassi working builds.

These are recipe estimates. Purchased chip and pulp macro panels, baked cookie
weight, and bottled fill still need recording before final package labels.
"""

import calculate_next_menu as r


def install_profiles():
    r.add_ingredient(
        "cookie_white_sugar", "granulated white sugar",
        r.n(387, 0, 100, 0, 0, 0, 100, 100, 1, 0),
        source="USDA FoodData Central", confidence="high",
    )
    r.add_ingredient(
        "cookie_egg_yolk", "egg yolk",
        r.n(322, 15.9, 3.6, 0, 26.5, 9.6, 0.6, 0, 48, 1085),
        source="USDA FoodData Central comparable raw egg yolk", confidence="medium",
    )
    r.add_ingredient(
        "cookie_baking_soda", "baking soda", r.n(0, 0, 0, 0, 0, 0, 0, 0, 27360, 0),
        source="USDA FoodData Central comparable sodium bicarbonate", confidence="medium",
    )
    r.add_ingredient(
        "cookie_chips", "semisweet chocolate chips",
        r.n(533.333, 6.67, 60, 3, 33.33, 19, 53, 53, 0, 0),
        source="Owner-reported Great Value panel: 80 kcal per 15 g; other macro lines are provisional generic estimates",
        confidence="low", nutrition_complete=True,
        note="Confirm the actual purchased bag's full nutrition and ingredient/allergen panel before printing.",
    )
    r.add_ingredient(
        "deep_alphonso_pulp", "Deep Alphonso mango pulp",
        r.n(100, 2, 23, 1, 0, 0, 21, 0, 0, 0),
        source="Owner-read Deep can 100 kcal per 100 g; online matching macro record for carbohydrate/protein",
        confidence="low", nutrition_complete=True,
        note="Purchased can's carbohydrate, sugar, and added-sugar lines remain unverified.",
    )


def classic_cookie():
    # Original successful batch, including the owner's extra chocolate.
    # 70 g is raw dough; the baked net weight must be measured separately.
    full_g = 226 + 210 + 100 + 100 + 34 + 20 + 300 + 5 + 2 + 3 + 300
    s = 70 / full_g
    return r.build([
        r.p("butter", 226 * s), r.p("brown_sugar", 210 * s),
        r.p("cookie_white_sugar", 100 * s), r.p("egg", 2 * s, "each"),
        r.p("cookie_egg_yolk", 34 * s), r.p("vanilla", 20 * s),
        r.p("flour", 300 * s), r.p("cookie_baking_soda", 5 * s),
        r.p("baking_powder", 2 * s), r.p("salt", 3 * s),
        r.p("cookie_chips", 300 * s),
    ], [
        "Proven Batch 19 formula, 300 g chips and original 100 g white sugar per full batch.",
        "Portion exactly 70 g raw dough per cookie; count saleable baked cookies and record finished weight.",
        "Chip panel is incomplete; full label printing is held until the purchased bag is checked.",
    ], "low")


def mango_lassi():
    s = 330 / 410
    return r.build([
        r.p("fage", 90 * s), r.p("fairlife_milk", 125 * s),
        r.p("deep_alphonso_pulp", 180 * s), r.p("honey", 15 * s),
    ], [
        "Owner-tasted fresh recipe: 90 g FAGE 0%, 125 g Fairlife fat-free milk, 180 g Deep Alphonso pulp, 15 g honey.",
        "330 g bottle assumes homogeneous blend from 410 g input; actual recovered mass and fill remain unmeasured.",
        "Pulp panel is incomplete; full label printing is held until the purchased can is checked.",
    ], "low")
