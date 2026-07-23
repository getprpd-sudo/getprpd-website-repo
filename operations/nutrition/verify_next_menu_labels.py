"""Verify that the saved July 25 label dataset matches its recipe calculator."""

from __future__ import annotations

import json
from pathlib import Path

import calculate_next_menu as draft
import generate_label_data as active_labels


LABEL_PATH = Path(__file__).resolve().parent / "next-menu-label-data.js"
PREFIX = "window.PRPD_NEXT_LABEL_DATA = "


def load_labels() -> dict:
    source = LABEL_PATH.read_text(encoding="utf-8").strip()
    if not source.startswith(PREFIX) or not source.endswith(";"):
        raise AssertionError("Next-menu label data is not in the expected browser format.")
    return json.loads(source[len(PREFIX):-1])


def verify() -> tuple[int, int]:
    payload = load_labels()
    meals = list(payload["meals"].values())
    if payload.get("status") != "draft":
        raise AssertionError("Next-menu labels must remain review-only until weekly approval.")
    if len(meals) != 15:
        raise AssertionError(f"Expected 15 dishes, found {len(meals)}.")

    saved_by_name = {meal["name"]: meal for meal in meals}
    expected_names = {meal.name for meal in draft.MEALS}
    if set(saved_by_name) != expected_names:
        raise AssertionError("Saved label dishes do not match the controlled menu calculator.")
    if any("Overnight Oats" in name for name in saved_by_name):
        raise AssertionError("Rejected overnight oats remain in the next-menu label dataset.")

    build_count = 0
    for meal in draft.MEALS:
        saved = saved_by_name[meal.name]
        builds = [("lean", meal.lean)]
        if meal.bulk is not None:
            builds.append(("bulk", meal.bulk))

        if set(saved["tiers"]) != {tier for tier, _ in builds}:
            raise AssertionError(f"Tier mismatch for {meal.name}.")

        for tier, recipe in builds:
            build_count += 1
            expected = active_labels.nutrition(draft.total(recipe))
            actual = saved["tiers"][tier]["nutrition"]
            if actual != expected:
                raise AssertionError(
                    f"Nutrition mismatch for {meal.name} {tier}: "
                    f"saved={actual}, expected={expected}"
                )
            if not saved["tiers"][tier]["ingredients"].strip(" ."):
                raise AssertionError(f"Missing ingredients for {meal.name} {tier}.")
            if not saved["tiers"][tier]["allergens"].strip(" ."):
                raise AssertionError(f"Missing allergen statement for {meal.name} {tier}.")

    if build_count != 27:
        raise AssertionError(f"Expected 27 sellable builds, found {build_count}.")

    hot_pockets = saved_by_name["Cheeseburger Hot Pockets"]
    if "three pockets" not in next(
        meal for meal in draft.MEALS if meal.name == "Cheeseburger Hot Pockets"
    ).bulk.assumptions[0].lower():
        raise AssertionError("Bulk Hot Pockets are not locked to three pockets.")
    if hot_pockets["tiers"]["lean"]["nutrition"]["calories"] != 540:
        raise AssertionError("Lean Hot Pocket calories changed unexpectedly.")
    if hot_pockets["tiers"]["bulk"]["nutrition"]["calories"] != 815:
        raise AssertionError("Bulk Hot Pocket calories changed unexpectedly.")

    pancakes = saved_by_name["Blueberry Cheesecake Protein Pancakes"]
    if pancakes["tiers"]["lean"]["nutrition"]["protein"] != 42:
        raise AssertionError("Lean pancake protein changed unexpectedly.")
    if pancakes["tiers"]["bulk"]["nutrition"]["protein"] != 55:
        raise AssertionError("Bulk pancake protein changed unexpectedly.")

    biscoff = saved_by_name["Lotus Biscoff Cheesecake"]["tiers"]["lean"]["nutrition"]
    if biscoff["calories"] != 395 or biscoff["protein"] != 40:
        raise AssertionError("Reduced-calorie Biscoff Cheesecake must remain 395 calories and 40g protein.")

    required_ingredient_fragments = {
        "Premium NY Strip Steak": ("potato", "broccoli"),
        "Korean Bulgogi Beef Bowl": ("green bell pepper", "carrots"),
        "Garlic Butter Shrimp + Rice": ("zucchini", "shelled edamame"),
        "Mexican Streetcorn Chicken Bowl": ("green bell pepper",),
        "Chicken Biryani": ("cucumber",),
    }
    for meal_name, fragments in required_ingredient_fragments.items():
        statement = saved_by_name[meal_name]["tiers"]["lean"]["ingredients"].lower()
        for fragment in fragments:
            if fragment not in statement:
                raise AssertionError(f"{meal_name} label is missing {fragment}.")

    return len(meals), build_count


if __name__ == "__main__":
    dish_count, tier_count = verify()
    print(f"Verified {dish_count} dishes and {tier_count} label builds.")
