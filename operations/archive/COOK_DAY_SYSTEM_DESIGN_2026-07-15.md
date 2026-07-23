# PRPD Cook-Day System Design

> Archived design specification. For current operation, use `../COOK_DAY_PLANNER_README.md`.

Updated: July 15, 2026

## Decision

Build one internal Cook-Day Planner that converts final website orders and approved recipes into a single production packet. Do not rely on a newly written chat response each week. Chat can diagnose exceptions, but quantities, counts, and the recurring sequence should come from structured data.

## Why the Old Method Failed

A prose order of operations mixes five separate jobs: order counting, ingredient scaling, equipment/labor scheduling, food-safety records, and plating/reconciliation. The new system keeps them connected but gives each one its own working view.

## Required Inputs

- Final Orders rows from the website order system
- Current menu and delivery date
- Approved recipe version for every ordered item
- Per-serving Lean, Bulk, or Single component specification
- Raw-to-cooked yield for major proteins and starches
- Shared components for rice, chicken, sauces, vegetables, and sides
- Available ovens, burners, rice cookers, pans, refrigerator space, and staff
- Production start time and required pack-complete time
- Controlled buffer percentage or exact extra-portion policy

Missing data must become a visible warning. The planner must never invent a quantity silently.

## Generated Production Packet

### 1. Order Reconciliation

Customer and order counts; dishes by tier; restrictions and notes; total containers, sauce cups, labels, bags, and delivery groups.

### 2. Component Build Sheet

Aggregate shared work once: total chicken by preparation, beef by recipe, dry rice/pasta, vegetables/sides, sauces/garnishes, desserts, planned yield, buffer, and expected portions.

`required ready-to-cook quantity = required finished quantity / verified yield`

Buffers remain visible and separate from recipe portions.

### 3. Shopping and Inventory Sheet

Required, on-hand, and purchase quantities; package rounding; vendor/cost; packaging and labels.

### 4. Backward Production Schedule

Start from pack-complete time and work backward. Every task carries station, equipment, owner, prerequisite, active time, cook time, cooling window, start/finish, and holding location. Prioritize equipment bottlenecks and cooling rather than menu order. Consolidate shared chopping, spices, rice, and sauces. Separate ready-to-eat work from raw poultry and beef work.

### 5. Station Cards

Short cards for cold prep, poultry, beef, starches, sauces, breakfast/desserts, cooling, and assembly. Each card contains batch quantity, recipe version, equipment, method, temperature checkpoint, target yield, and destination container.

### 6. Plating Matrix

One row per dish/tier with exact protein, starch, vegetable, sauce, garnish, finished weight, container, and label. Assemble by dish and tier; stage customer orders only after dish-level counts reconcile.

### 7. Food-Safety and Yield Log

Opening cold-storage temperatures, cooking temperatures, cooling checkpoints, actual yields, portion checks, corrective actions, and final cold-holding temperature.

### 8. Final Reconciliation

Planned versus packed counts, extras/shorts/damage, customer bag count, label count, actual ingredient use, leftovers, and changes required before the recipe returns.

## Right-Sized Small-Business System

PRPD needs one source of orders, one approved build per item, one component sheet, one backward timeline, one plating matrix, one concise safety/yield log, and one final reconciliation. This provides professional control without copying a factory's paperwork burden.

## Build Sequence

### Version 1 - Next Cook Day

Generate counts, scaled quantities, shopping list, station cards, plating matrix, and a printable timeline from final Orders plus a controlled recipe/component table. Enter actual yields and temperatures manually.

### Version 2 - After Two Real Cook Days

Use recorded durations, bottlenecks, and yields to add automatic backward scheduling, equipment conflicts, package rounding, label counts, and reusable component batches.

### Version 3 - Only If Volume Justifies It

Add inventory history, purchasing forecasts, staff assignments, cost variance, and mobile entry.

## Official Operating Basis

- FDA Food Code 2022: https://www.fda.gov/food/fda-food-code/food-code-2022
- Texas retail food establishment guidance: https://www.dshs.texas.gov/retail-food-establishments/permitting-information-retail-food-establishments/starting-a-new-retail
- USDA/FNS standardized recipes and production records: https://www.fns.usda.gov/tn/professional-standards/training-objectives-topics
- Institute of Child Nutrition mise en place guidance: https://theicn.org/resources/2533/2024-mealtime-memo/127207/may-2024-mealtime-memo-culinary-basics-mise-en-place-the-key-to-kitchen-efficiency.pdf
- Safe cooking temperatures: https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures
- USDA refrigeration/cooling guidance: https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/refrigeration

The planner supports operations; it does not replace requirements from PRPD's permitting authority or the commercial kitchen's approved procedures.
