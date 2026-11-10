import unittest
import calculate_next_menu as menu
import generate_next_menu_label_data as labels
import generate_production_data as production


class Batch10Tests(unittest.TestCase):
    def test_shan_packets_are_measured_and_all_marinade_is_counted(self):
        for tier, grams in [("lean",10),("bulk",15)]:
            recipe=menu.biryani(tier)
            parts={}
            for part in recipe.portions:
                if not part.note.startswith('component:'):
                    parts[part.ingredient]=parts.get(part.ingredient,0)+part.amount
            self.assertEqual(parts["shan_biryani"],grams)
            self.assertEqual(parts["fage"],30)
            self.assertNotIn("salt",parts)
            self.assertIn("SOY",labels.allergen_statement(recipe))
        for tier, grams in [("lean",11.25),("bulk",16.5)]:
            recipe=menu.butter_chicken_no_broth(tier)
            parts={p.ingredient:p.amount for p in recipe.portions}
            self.assertEqual(parts["shan_butter_chicken"],grams)
            self.assertNotIn("broth",parts)
            self.assertNotIn("salt",parts)
            self.assertIn("SOY",labels.allergen_statement(recipe))

    def test_live_menu_recipe_and_labels_match(self):
        payload = labels.generate_payload()
        self.assertEqual(len(menu.MEALS), 17)
        self.assertEqual(production.generate()["batch"], 12)
        self.assertEqual(len(payload["meals"]), 19)

    def test_cajun_calorie_and_protein_targets(self):
        for tier, raw, pasta, minimum, maximum, protein in [
            ("lean",200,50,500,600,50),("bulk",275,65,700,800,65)]:
            recipe = menu.creamy_cajun_chicken_pasta(tier)
            portions = {p.ingredient:p.amount for p in recipe.portions}
            self.assertEqual(portions["chicken_thigh_cooked"],raw*.75)
            self.assertEqual(portions["protein_pasta"],pasta)
            self.assertIn("regular_cream_cheese", portions)
            self.assertIn("water", portions)
            self.assertFalse({"penne_dry","broth","chicken_breast_cooked","cornstarch","parmesan"}.intersection(portions))
            value = menu.total(recipe)
            self.assertGreaterEqual(value.calories,minimum)
            self.assertLess(value.calories,maximum)
            self.assertGreater(value.protein,protein)

    def test_oreo_two_cup_yield_and_allergens(self):
        recipe = menu.oreo_protein_cheesecake_cup()
        portions = {p.ingredient:p.amount for p in recipe.portions}
        self.assertEqual(portions["cottage"],100)
        self.assertEqual(portions["whey"],9.75)
        self.assertEqual(portions["oreo_pudding_mix"],15)
        for allergen in ["MILK", "WHEAT", "SOY"]:
            self.assertIn(allergen,labels.allergen_statement(recipe))

    def test_tiramisu_uses_successful_five_cup_formula(self):
        recipe = menu.tiramisu_complete()
        amounts = {}
        for portion in recipe.portions:
            amounts[portion.ingredient] = amounts.get(portion.ingredient, 0) + portion.amount

        self.assertEqual(amounts["fage"], 100)
        self.assertEqual(amounts["mascarpone"], 45)
        self.assertEqual(amounts["cottage"], 30)
        self.assertEqual(amounts["water"], 9)
        self.assertEqual(amounts["whey"], 5.82)
        self.assertEqual(amounts["powdered_sugar"], 12)
        self.assertEqual(amounts["brown_sugar"], 3)
        self.assertEqual(amounts["vanilla"], 1.68)
        self.assertEqual(amounts["ladyfingers"], 30)
        self.assertEqual(amounts["cocoa"], 1)
        self.assertEqual(amounts["instant_coffee"], 0)
        self.assertTrue(any("successful five-cup" in note for note in recipe.assumptions))
        self.assertTrue(any("coffee pickup" in note for note in recipe.assumptions))
        self.assertEqual(menu.display(menu.total(recipe)), (460, 22, 45, 1, 21))
        self.assertIn("MILK", labels.allergen_statement(recipe))
        self.assertIn("WHEAT", labels.allergen_statement(recipe))

    def test_snack_wrap_uses_standard_tortilla(self):
        portions = {p.ingredient:p.amount for p in menu.mini_chicken_wrap().portions}
        self.assertEqual(portions["small_tortilla"],2)
        self.assertNotIn("fajita_tortilla",portions)

    def test_compatible_thigh_recipes_use_the_same_measured_savory_base(self):
        recipes = [
            menu.chicken_shakshuka("lean"),
            menu.chicken_enchilada_bake("lean"),
            menu.creamy_cajun_chicken_pasta("lean"),
            menu.sweet_chili_chicken("lean"),
            menu.buffalo_chicken_pinwheels(),
            menu.mediterranean_chicken_hummus_box(),
            menu.mini_chicken_wrap(),
        ]
        for recipe in recipes:
            raw = next(p.amount / .75 for p in recipe.portions if p.ingredient == "chicken_thigh_cooked")
            base = {
                p.ingredient: p.amount for p in recipe.portions
                if p.note == "component:shared-chicken-base"
            }
            self.assertEqual(set(base), set(menu.NEUTRAL_CHICKEN_BASE_PER_KG))
            for key, grams_per_kg in menu.NEUTRAL_CHICKEN_BASE_PER_KG.items():
                self.assertAlmostEqual(base[key], grams_per_kg * raw / 1000, places=4)

    def test_no_missing_stations_for_public_recipes(self):
        for item in production.generate()["meals"].values():
            if item.get("plannerOnly"):
                continue
            for tier in item["tiers"].values():
                for line in tier["ingredients"]:
                    self.assertNotEqual(line["station"],"Other",(item["name"],line["key"]))

    def test_nouman_keeps_approved_portion_and_counts_all_shan(self):
        current = production.generate()["meals"]
        self.assertNotIn("p1", current)
        production_recipe = production.generate(include_archived_custom=True)["meals"]["p1"]["tiers"]["lean"]
        amounts = {line["key"]: line["amount"] for line in production_recipe["ingredients"]}
        self.assertEqual(amounts["beef_96_raw"], 330)
        self.assertEqual(amounts['shan_seekh'],16.5)
        self.assertNotIn("p1", labels.generate_payload()["meals"])


if __name__ == "__main__":
    unittest.main()
