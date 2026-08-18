"""Verify that the saved Batch 7 label dataset matches its recipe calculator."""

from __future__ import annotations

import json
from pathlib import Path

import generate_next_menu_label_data as generator


LABEL_PATH = Path(__file__).resolve().parent / "next-menu-label-data.js"
PREFIX = "window.PRPD_NEXT_LABEL_DATA = "


def load_labels() -> dict:
    source = LABEL_PATH.read_text(encoding="utf-8").strip()
    if not source.startswith(PREFIX) or not source.endswith(";"):
        raise AssertionError("Next-menu label data is not in the expected browser format.")
    return json.loads(source[len(PREFIX):-1])


def verify() -> tuple[int, int]:
    payload = load_labels()
    expected = generator.generate_payload()
    if payload != expected:
        if payload.get("production") != expected.get("production"):
            raise AssertionError(
                "Saved label production identity does not match the active order configuration. "
                "Regenerate the label dataset before opening Label Studio."
            )
        if set(payload.get("meals", {})) != set(expected.get("meals", {})):
            raise AssertionError(
                "Saved label meal IDs do not exactly match the active customer menu. "
                "Archived/manual labels cannot carry forward."
            )
        for meal_id, expected_meal in expected["meals"].items():
            saved_meal = payload["meals"].get(meal_id)
            if saved_meal != expected_meal:
                raise AssertionError(
                    f"Saved label data for {meal_id} {expected_meal['name']} is stale. "
                    "Regenerate after any recipe, ingredient, allergen, tier, or handling change."
                )
        raise AssertionError(
            "Saved label dataset metadata is stale. Regenerate it from the active menu and controlled recipes."
        )

    required_nutrition = {
        "calories", "protein", "carbs", "fiber", "fat", "satFat", "transFat",
        "cholesterol", "sodium", "sugars", "addedSugar", "vitaminD", "calcium",
        "iron", "potassium",
    }
    build_count = 0
    for meal_id, meal in payload["meals"].items():
        if not meal.get("description") or not meal.get("reheat"):
            raise AssertionError(f"{meal_id} {meal['name']} is missing controlled label copy.")
        for tier_name, tier in meal["tiers"].items():
            build_count += 1
            if not tier.get("netWeight", "").strip():
                raise AssertionError(f"Missing net weight for {meal['name']} {tier_name}.")
            if not tier.get("ingredients", "").strip(" ."):
                raise AssertionError(f"Missing ingredients for {meal['name']} {tier_name}.")
            if not tier.get("allergens", "").strip(" ."):
                raise AssertionError(f"Missing allergen statement for {meal['name']} {tier_name}.")
            if set(tier.get("nutrition", {})) != required_nutrition:
                raise AssertionError(f"Incomplete nutrition fields for {meal['name']} {tier_name}.")

    if payload.get("recipeFingerprint") != expected.get("recipeFingerprint"):
        raise AssertionError("The saved recipe fingerprint is stale.")
    return len(payload["meals"]), build_count


if __name__ == "__main__":
    dish_count, tier_count = verify()
    print(f"Verified {dish_count} dishes and {tier_count} label builds.")
