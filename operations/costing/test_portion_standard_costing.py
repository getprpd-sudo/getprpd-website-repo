"""Costing regression for the measured component-meal chicken yield."""

import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
NUTRITION = HERE.parent / "nutrition"
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(NUTRITION))

import calculate_active_menu_costs as active_costs
import calculate_next_menu_draft_costs as current_costs
import calculate_next_menu as menu


class PortionStandardCostingTests(unittest.TestCase):
    def test_standard_chicken_cost_reverses_measured_yield_and_adds_reserve(self):
        self.assertAlmostEqual(active_costs.RAW_YIELD["chicken_thigh_standard_cooked"], 0.688)
        self.assertAlmostEqual(current_costs.RAW_YIELD["chicken_thigh_standard_cooked"], 0.688)
        for tier, expected_purchase in (("lean", 244.1860465), ("bulk", 320.4941860)):
            portion = menu.standard_chicken_component(tier)
            line = current_costs.ingredient_cost_line(portion, menu)
            self.assertAlmostEqual(line["costed_amount"], expected_purchase, places=4)

    def test_format_exception_keeps_its_own_provisional_yield(self):
        self.assertEqual(active_costs.RAW_YIELD["chicken_thigh_cooked"], 0.75)
        self.assertEqual(current_costs.RAW_YIELD["chicken_thigh_cooked"], 0.75)


if __name__ == "__main__":
    unittest.main()
