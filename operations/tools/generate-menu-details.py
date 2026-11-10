"""Generate customer-safe menu detail data from the controlled label records."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
NUTRITION_DIR = ROOT / "operations" / "nutrition"
OUTPUT = ROOT / "config" / "menu-details.js"
DRAFT_OUTPUT = ROOT / "config" / "menu-details.batch16-draft.js"

sys.path.insert(0, str(NUTRITION_DIR))
import generate_next_menu_label_data as labels  # noqa: E402
import current_recipe_registry as recipe_registry  # noqa: E402


PUBLIC_NUTRIENTS = (
    "calories",
    "protein",
    "carbs",
    "fiber",
    "fat",
    "satFat",
    "sugars",
    "sodium",
    "cholesterol",
)


def load_config(relative_path: str) -> dict:
    command = (
        "const config=require(process.argv[1]);"
        "process.stdout.write(JSON.stringify(config));"
    )
    result = subprocess.run(
        ["node", "-e", command, str(ROOT / relative_path)],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def public_tier(tier: dict) -> dict:
    nutrition = tier.get("menuNutrition") or tier.get("nutrition") or {}
    return {
        "label": tier.get("label", ""),
        "netWeight": "" if tier.get("requiresPackoutWeight") or tier.get("netWeightVerified") is False else tier.get("netWeight", ""),
        "ingredients": tier.get("ingredients", ""),
        "allergens": tier.get("allergens", "CONTAINS: NONE DECLARED."),
        "allergenAdvisory": tier.get("allergenAdvisory", ""),
        "nutritionBasis": tier.get("nutritionBasis", ""),
        "nutrition": {
            key: nutrition[key]
            for key in PUBLIC_NUTRIENTS
            if nutrition.get(key) is not None
        },
    }


def public_meal(meal: dict) -> dict:
    return {
        "type": "meal",
        "name": meal["name"],
        "description": meal.get("description", ""),
        "storageMode": meal.get("storageMode", "fridge"),
        "reheat": meal.get("reheat", ""),
        "tiers": {
            tier_key: public_tier(tier)
            for tier_key, tier in meal.get("tiers", {}).items()
        },
    }


def public_bundle(item: dict, payload_meals: dict) -> dict:
    variants = {}
    for variant in item.get("variants", []):
        components = []
        for component in variant.get("components", []):
            source = payload_meals[component["id"]]
            source_tier = source["tiers"].get(component["tier"])
            if source_tier is None:
                build = recipe_registry.recipe(source["name"], component["tier"])
                source_tier = labels.tier_data(
                    build,
                    component["tier"].title(),
                    source["name"],
                )
            tier = public_tier(source_tier)
            components.append({
                "id": component["id"],
                "name": source["name"],
                "qty": component["qty"],
                "tier": component["tier"],
                "storageMode": source.get("storageMode", "fridge"),
                "reheat": source.get("reheat", ""),
                **tier,
            })
        variants[variant["id"]] = {
            "label": variant["label"],
            "components": components,
        }
    return {
        "type": "bundle",
        "name": item["name"],
        "description": item.get("description", ""),
        "variants": variants,
    }


def build_batch(config: dict) -> dict:
    payload = labels.generate_payload(config)
    public = {}
    for section in ("breakfasts", "mains", "premium", "desserts", "addons"):
        for item in config.get("menu", {}).get(section, []):
            public[item["id"]] = public_meal(payload["meals"][item["id"]])
    for item in config.get("menu", {}).get("exclusives", []):
        public[item["id"]] = public_bundle(item, payload["meals"])
    return public


def main() -> None:
    active = load_config("config/order-config.js")
    draft = load_config("config/order-config.batch16-draft.js")
    active_result = {
        "version": "2026-10-19.7",
        "batches": {
            str(active["batch"]["number"]): build_batch(active),
        },
    }
    draft_result = {
        "version": "2026-10-19.7-draft",
        "batches": {
            str(draft["batch"]["number"]): build_batch(draft),
        },
    }
    for output, result, heading in (
        (OUTPUT, active_result, "Generated customer-facing meal details. Do not hand-edit."),
        (DRAFT_OUTPUT, draft_result, "Generated private draft meal details. Do not deploy or hand-edit."),
    ):
        source = (
            f"// {heading}\n"
            f"const PRPD_MENU_DETAILS = {json.dumps(result, indent=2)};\n\n"
            "if (typeof window !== 'undefined') window.PRPD_MENU_DETAILS = PRPD_MENU_DETAILS;\n"
            "if (typeof module !== 'undefined' && module.exports) module.exports = PRPD_MENU_DETAILS;\n"
        )
        output.write_text(source, encoding="utf-8")
        count = sum(len(batch) for batch in result["batches"].values())
        print(f"Wrote {output.relative_to(ROOT)} with {count} batch-scoped records.")


if __name__ == "__main__":
    main()
