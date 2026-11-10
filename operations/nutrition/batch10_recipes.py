"""Batch 10 additions. Ingredient weights, not historical marketing macros.

Cajun source: https://www.budgetbytes.com/one-pot-creamy-cajun-chicken-pasta/
Oreo source: PRPD_RECIPES_SOURCE_2026-07-13.pdf, page 19, TWO cups.
Package references checked September 8, 2026. Kitchen yields remain estimates.
"""


def configure(m):
    add, n, p = m.add_ingredient, m.n, m.p
    add("garlic_powder", "Garlic powder", n(331,16.6,72.7,9,.73,.25,2.4,0,60,0))
    add("onion_powder", "Onion powder", n(341,10.4,79.1,15.2,1,.22,6.6,0,73,0))
    add("turmeric", "Ground turmeric", n(312,9.7,67.1,22.7,3.25,1.84,3.2,0,27,0))
    add("instant_coffee", "Instant coffee powder", n(353,12.2,75.4,0,.5,.2,0,0,37,0), note="Working dry coffee profile. Verify purchased coffee; all prepared dipping coffee counted conservatively until absorption is measured.")
    add("granulated_sugar", "Granulated sugar", n(387,0,100,0,0,0,100,100,1,0))
    add("regular_cream_cheese", "Philadelphia Original cream cheese", n(100/28*100, 2/28*100, 1/28*100, 0, 10/28*100, 6/28*100, 1/28*100, 0, 110/28*100, 30/28*100), source="https://www.kraftheinz.com/philadelphia/products/00021000075997-original-cream-cheese", confidence="high")
    add("penne_dry", "Dry semolina penne", n(200/56*100, 7/56*100, 42/56*100, 3/56*100, 1/56*100, 0, 2/56*100, 0, 0, 0), source="Barilla classic penne working package profile; confirm purchased package", confidence="medium")
    add("olive_oil", "Olive oil", n(884, 0, 0, 0, 100, 13.8, 0, 0, 0, 0))
    add("green_onion", "Green onion", n(32, 1.83, 7.34, 2.6, .19, .03, 2.33, 0, 16, 0))
    add("smoked_paprika", "Smoked paprika", n(282, 14.1, 54, 34.9, 12.9, 2.14, 10.3, 0, 68, 0))
    add("oregano", "Dried oregano", n(265, 9, 68.9, 42.5, 4.3, 1.55, 4.1, 0, 25, 0))
    add("thyme", "Dried thyme", n(276, 9.1, 63.9, 37, 7.4, 2.7, 1.7, 0, 55, 0))
    add("cayenne", "Ground cayenne", n(318, 12, 56.6, 27.2, 17.3, 3.3, 10.3, 0, 30, 0))
    add("oreo_pudding_mix", "Jell-O Oreo instant pudding mix, dry", n(110/30*100, 0, 90, 0, 1/30*100, 0, 20/30*100, 20/30*100, 370/30*100, 0), source="https://www.kraftheinz.com/jell-o/products/00043000967263-oreo-cookies-n-creme-instant-pudding-pie-filling-mix", confidence="high", note="4.2 oz / approximately 120g packet; 30g is one quarter packet. Contains wheat and soy.")

    def cajun(tier):
        # Source sauce proportions, with owner-requested protein spaghetti and
        # PRPD chicken portions. This is explicitly an adaptation, not source macros.
        pasta_g = 50 if tier == "lean" else 65
        factor = pasta_g / 227
        raw_chicken = 200 if tier == "lean" else 275
        amounts = [("protein_pasta",227),("crushed_tomatoes",425),("water",475),
                   ("regular_cream_cheese",57),("onion",150),("green_onion",45),
                   ("olive_oil",13.5),("butter",14)]
        spices = [("smoked_paprika",4.6),
                   ("oregano",1),("thyme",1),("garlic_powder",1.55),
                   ("onion_powder",1.2),("cayenne",.45),("black_pepper",.575),("salt",1.5)]
        cajun_finish = [(k, g) for k, g in spices if k not in {"garlic_powder", "onion_powder", "black_pepper", "salt"}]
        return m.build([m.chicken_thigh(raw_chicken), *m.neutral_chicken_base(raw_chicken),
                        *[p(k,g*factor) for k,g in amounts],
                        *[p(k,g*raw_chicken/454) for k,g in cajun_finish]], [
            "Budget Bytes Cajun pasta adapted to owner-requested thighs, regular crushed tomatoes, usual protein spaghetti, and water instead of broth. US quantities converted to grams.",
            "Lean: 200g raw thighs and 50g dry protein spaghetti. Bulk: 275g raw thighs and 65g dry protein spaghetti. Source sauce proportions scale with dry pasta; Cajun seasoning scales with chicken. Owner requested Lean in the 500-calorie range and a lighter Bulk.",
            "Do not use the source website's breast-and-broth nutrition or the withdrawn PRPD prototype macros.",
            "Working produce conversion: one yellow onion = 150g; three green onions = 45g. Record actual usable weight.",
            "Apply the shared savory base to whole thighs, split the Cajun pull, then cut it into 1.5-2cm cubes and add the measured smoked-paprika, oregano, thyme, and cayenne finish.",
            "Protein spaghetti replaces short penne. Use a wide deep pan, submerge the strands as they soften, and stir to prevent clumping; adjust water in measured additions until the pasta is tender. Do not assume penne's cook time applies.",
            "Water is a cooking input, not a verified final net weight. Weigh the finished pan before printing final net-weight labels.",
        ], "medium")

    def oreo():
        return m.build([p("cottage",100),p("whey",9.75),p("oreo_pudding_mix",15),
                        p("honey",3.5),p("cocoa",1.25),p("maple_syrup",7.5),p("oreo_thin",.25,"each")], [
            "Exactly half of the original two-cup formula. One physical Premier scoop is 19.5g per full two-cup batch, not per cup.",
            "Quarter packet standardized to 30g dry Jell-O Oreo mix per two cups. Verify physical box is 4.2 oz.",
            "Blend cottage cheese smooth, whisk in powder and pudding, stir in honey, divide into two cups. Split cocoa-syrup drizzle and half-cookie garnish between both cups. Chill at least two hours.",
            "Small dessert serving; original 16oz vessel is not a filled-volume claim. Confirm portion and packaging in the kitchen.",
        ], "medium")

    def halal_cart(tier):
        raw = m.standard_chicken_raw_pull(tier)
        recipe = m.active.halal_cart(tier)
        # Replace the historical rounded sauce with the exact shared formula.
        plain = [x for x in recipe.portions if x.ingredient not in {'chicken_thigh_cooked','rice_dry','lettuce','tomato','fage','light_mayo','garlic','lemon'}]
        vegetables = [p("lettuce", 30 if tier == "lean" else 40), p("tomato", 45 if tier == "lean" else 60)]
        return m.build([m.standard_chicken_component(tier), m.standard_rice(tier), *vegetables, *plain, *m.garlic_sauce(m,30,include_in_menu_macros=False),
            *[p(k,g*raw/235,note="Chicken marinade") for k,g in [("oregano",1),("cumin",2.1),("paprika",2.3),("garlic_powder",3.1),("lemon",10)]],
            p("turmeric",.3,note="Yellow rice"),p("cumin",.3,note="Yellow rice"),p("paprika",.3,note="Yellow rice")],
            [*recipe.assumptions,*m.component_standard_assumptions(tier,"chicken"),"Original recipe page 8 specifies oregano, cumin, paprika, garlic powder and lemon for chicken, plus turmeric/cumin/paprika for rice. Chicken seasonings scale from the source's 235g raw reference; rice spices remain working kitchen-control amounts until the standardized rice cook is measured."],"medium")

    def tiramisu():
        # One-fifth of the successful July 18 five-cup production batch. The
        # older three-cup taste-test formula is historical and must not feed
        # staged nutrition, labels, costing, groceries, or production.
        return m.build([
            p("fage", 100, note="one-fifth of the successful five-cup batch"),
            p("mascarpone", 45, note="one-fifth of the successful five-cup batch"),
            p("cottage", 30, note="blended with the recorded water allocation"),
            p("water", 9, note="approximately 45g used across the successful five-cup batch"),
            p("whey", 5.82, note="29.1g across the successful five-cup batch"),
            p("powdered_sugar", 11, note="cream allocation"),
            p("brown_sugar", 3),
            p("vanilla", 1.68),
            p("ladyfingers", 30),
            p("cocoa", 1, note="sweet cocoa finish"),
            p("powdered_sugar", 1, note="sweet cocoa finish"),
            p("instant_coffee", 0, note="dipping coffee is required but its consumed weight was not recorded"),
        ], [
            "Controlled calculation source is one-fifth of the July 18 successful five-cup production record: taste, texture, and exact five-cup yield passed.",
            "The successful cream used 150g cottage cheese plus approximately 45g water, yielding 195g blended cottage mixture. The later 30g coffee plus 15g water idea was only an untested next-test proposal and is not used here.",
            "Cooled strong dipping coffee remains required, but the production record says only staged as needed. Zero grams is a deliberate unresolved placeholder so no coffee nutrition, cost, or net weight is invented.",
            "Record dry coffee and water prepared, dipped-ladyfinger coffee pickup, finished cup weight, exact mascarpone and ladyfinger package panels, and refrigerated hold result before final label release.",
        ], "medium")

    return cajun, oreo, halal_cart, tiramisu
