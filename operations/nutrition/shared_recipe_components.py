"""Reusable kitchen formulas, independent of menu slots and customer counts.

Owner decisions, 2026-09-08: Shan Seekh mix replaces the homemade kebab
seasoning. White garlic serving sauce contains mayonnaise; green is the same
base plus jalapeno. These are PRPD adaptations, not the complete Shan recipe.
"""

WHITE_GARLIC = {"fage": 100, "light_mayo": 15, "garlic": 6, "lemon": 15}
GREEN_GARLIC = {**WHITE_GARLIC, "jalapeno": 10}
SHAN_SEEKH_PER_KG = 50
NOUMAN_RAW_BEEF_G = 330  # Owner explicitly retained the portion after seeing updated calories.


def garlic_sauce(m, grams=30, green=False, include_in_menu_macros=True):
    ratio = GREEN_GARLIC if green else WHITE_GARLIC
    name = "green-garlic" if green else "white-garlic"
    return [m.p(key, grams * value / sum(ratio.values()), note=f"component:{name}",
                include_in_menu_macros=include_in_menu_macros)
            for key, value in ratio.items()]


def seekh_seasoning(m, raw_grams):
    return [m.p("shan_seekh", raw_grams * SHAN_SEEKH_PER_KG / 1000,
                note="Shan-only kebab seasoning. No extra homemade spices, salt, suet or butter.")]


def nouman_kofta(m):
    # Owner-described house kofta, corrected 2026-10-12. The fresh-mix-in
    # direction is supported by Shan's published Seekh Kabab method, but the
    # paprika, pepper and small added-salt amounts are PRPD's house adaptation.
    # Onion weight is the retained, squeezed-dry pulp that actually enters the
    # beef, not the wet onion weight before draining.
    return m.build([
        m.p("beef_96_raw", NOUMAN_RAW_BEEF_G, note="component:nouman-kofta"),
        m.p("shan_seekh", NOUMAN_RAW_BEEF_G * SHAN_SEEKH_PER_KG / 1000, note="component:nouman-kofta"),
        m.p("onion", 25, note="component:nouman-kofta"),
        m.p("jalapeno", 10, note="component:nouman-kofta"),
        m.p("paprika", 1, note="component:nouman-kofta"),
        m.p("black_pepper", 0.5, note="component:nouman-kofta"),
        m.p("salt", 0.5, note="component:nouman-kofta"),
    ], ["Use actual 96/4 beef; draining 90/10 does not make its nutrition 96/4.",
        "Grate the onion, squeeze it dry, and weigh 25g retained pulp per meal. Finely mince the jalapeno.",
        "Mix beef, drained onion, jalapeno, Shan mix, paprika, black pepper and salt, then divide into five equal logs per meal. All mixture is used.",
        "This is the owner-described PRPD house formula, not the unadapted Shan package recipe. It intentionally omits suet, butter and added oil.",
        "Nouman's beef meal has no roasted vegetable side. The onion and jalapeno shown here are kofta mix-ins; the kachumber is packed separately.",
        "Nutrition includes all the Shan mix. Owner retained 330g beef and five kofta; calculated calories are not reduced by assuming extra drained fat loss."], "medium")
