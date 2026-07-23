"""Sanity checks for the PRPD active-menu nutrition calculator."""

import unittest

import calculate_active_menu as audit


class ActiveMenuNutritionTests(unittest.TestCase):
    def test_all_nutrients_are_nonnegative(self):
        for meal in audit.MEALS:
            for _, build_record, _ in audit.tier_records(meal):
                if build_record is None:
                    continue
                value = audit.total(build_record)
                for field in audit.fields(value):
                    self.assertGreaterEqual(
                        getattr(value, field.name),
                        0,
                        f"{meal.name} has negative {field.name}",
                    )

    def test_every_active_item_has_a_calculated_portion(self):
        self.assertEqual(len(audit.MEALS), 15)
        for meal in audit.MEALS:
            self.assertIsNotNone(meal.lean, meal.name)

    def test_bulk_meals_are_larger_than_lean(self):
        for meal in audit.MEALS:
            if meal.bulk is None:
                continue
            lean = audit.total(meal.lean)
            bulk = audit.total(meal.bulk)
            self.assertGreater(bulk.calories, lean.calories, meal.name)
            self.assertGreater(bulk.protein, lean.protein, meal.name)

    def test_french_toast_uses_confirmed_bread_calories(self):
        lean = audit.total(audit.MEALS[1].lean)
        bulk = audit.total(audit.MEALS[1].bulk)
        self.assertGreater(lean.calories, 3 * 80)
        self.assertGreater(bulk.calories, 4 * 80)
        self.assertAlmostEqual(
            bulk.calories - lean.calories,
            149.1,
            delta=2.0,
        )

    def test_revised_seekh_bulk_lands_in_target_range(self):
        bulk = audit.total(audit.seekh("bulk"))
        self.assertGreater(bulk.calories, 700)
        self.assertLess(bulk.calories, 800)
        self.assertGreater(bulk.protein, 50)
        self.assertGreater(bulk.carbs, 72)

    def test_revised_arrabbiata_tiers_land_in_target_ranges(self):
        lean = audit.total(audit.meatball_pasta("lean"))
        bulk = audit.total(audit.meatball_pasta("bulk"))
        self.assertGreater(lean.calories, 600)
        self.assertLess(lean.calories, 675)
        self.assertGreater(bulk.calories, 700)
        self.assertLess(bulk.calories, 800)
        self.assertGreater(lean.protein, 60)
        self.assertGreater(bulk.protein, 70)

    def test_mousse_confirmed_portion_is_active_recipe(self):
        confirmed = audit.total(audit.mousse(19.5))
        full = audit.total(audit.mousse(39))
        active = next(meal for meal in audit.MEALS if meal.meal_id == "d2")
        active_total = audit.total(active.lean)
        self.assertAlmostEqual(active_total.calories, confirmed.calories)
        self.assertAlmostEqual(active_total.protein, confirmed.protein)
        self.assertLess(abs(confirmed.calories - 281), abs(full.calories - 281))
        self.assertLess(abs(confirmed.protein - 38), abs(full.protein - 38))

    def test_current_premier_protein_label_is_used(self):
        whey = audit.INGREDIENTS["whey"]
        serving = whey.nutrition.scale(0.39)
        self.assertIn("Premier Protein", whey.name)
        self.assertAlmostEqual(serving.calories, 150, delta=0.1)
        self.assertAlmostEqual(serving.protein, 30, delta=0.1)
        self.assertAlmostEqual(serving.calcium, 160, delta=0.1)

    def test_every_meal_has_complete_estimated_label_fields(self):
        required = (
            "trans_fat", "vitamin_d", "calcium", "iron", "potassium",
        )
        for meal in audit.MEALS:
            for _, build_record, _ in audit.tier_records(meal):
                if build_record is None:
                    continue
                value = audit.total(build_record)
                for field in required:
                    self.assertIsNotNone(getattr(value, field), f"{meal.name}: {field}")
                self.assertGreater(value.calcium, 0, meal.name)
                self.assertGreater(value.potassium, 0, meal.name)

    def test_report_contains_estimate_decisions(self):
        report = audit.build_report()
        self.assertIn("Calorie and Protein Reconciliation", report)
        self.assertIn("CALCULATED ESTIMATE - confirm next cook", report)
        self.assertIn("Single", report)

    def test_report_marks_all_required_fields_as_calculated_estimates(self):
        report = audit.build_report()
        self.assertIn("Nutrition Facts Field Completeness", report)
        self.assertIn("Trans fat | Calculated estimate complete", report)
        self.assertIn("Vitamin D | Calculated estimate complete", report)
        self.assertIn("Sodium | Calculated estimate complete", report)


if __name__ == "__main__":
    unittest.main()
