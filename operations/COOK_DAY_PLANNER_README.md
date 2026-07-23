# PRPD Cook-Day Planner

Updated: July 22, 2026

The Cook-Day Planner converts the final weekly order export into a private production packet. It is an internal local tool and is excluded from the public Vercel deployment.

## Open It

- Double-click `PRPD Cook-Day Planner` on the Windows desktop, or
- run `open-cook-day-planner.bat` from the project root.

The launcher opens `http://127.0.0.1:4173/operations/cook-day-planner.html`. The local server must remain open only while the planner is in use.

## Sync Final Orders

The normal workflow is now:

1. Select **Sync current orders**.
2. Review every loaded order in **Review synced orders**.
3. Uncheck duplicates, tests, cancellations, or orders that should not be produced.
4. Correct any item quantity that was entered incorrectly.
5. Confirm the resulting final dish counts.

Sync is read-only. Exclusions and quantity corrections change the current cook-day packet but never modify the Google Sheet. Selecting Sync again pulls new submissions while preserving review decisions for matching Order IDs and stable legacy rows.

Approved manual orders can be inserted through the protected `POST /api/planner-orders` maintenance route. It requires the same private planner key, validates every item against the public menu plus the explicitly approved planner-only dishes, writes only canonical Orders columns A:K, blocks duplicate manual Order IDs, and uses RAW Google Sheets values. This route is for controlled maintenance scripts only; it is not exposed in the planner interface.

If live sync is unavailable, open **CSV, pasted rows, or manual fallback**:

1. Download the Google Sheets `Orders` tab as CSV and import it, or
2. Copy columns A:K, including the header row, and paste them, or
3. Use manual counts.

Only the active batch is counted.

## Generate the Packet

1. Confirm the meal/tier counts against the Orders sheet.
2. Set the cook date, pack-complete time, pooled raw-protein reserve, temporary dry-rice planning allowance/yield, team size, and equipment counts.
3. Under **Completed before cook day**, mark desserts, weekly sauces, and rice only when those batches are finished, counted, and held safely.
4. Select **Generate Production Packet**.
5. The planner opens the **Kitchen Queue** automatically. Choose **Prep Day** or **Cook Day** and work only from the ticket marked **Now**. **Next** and **Later** show what is coming without asking the operator to start it.
6. The active ticket's exact scaled ingredients, method, planned yield, plating/holding instructions, and actual-yield fields appear directly underneath. Complete the ticket only after its stated release check is satisfied.
7. Review every warning before shopping or cooking.
8. Use the remaining tabs as supporting count sheets and records.
9. Select **Print Packet** to print or save the complete packet as PDF.

Guided production cards are the main execution view; the Runbook is the complete printable production reference behind them. For every dish present in the reviewed orders, the packet includes:

- the Lean, Bulk, or Single production count;
- exact sold customer-meal counts, with no automatic finished extra meals;
- a default 5% pooled reserve applied only to raw meat and poultry quantities;
- a paid-customer-only label print plan with Avery 5168 sheets to print and unused labels;
- grouped raw protein pull weights, labeled dish-bowl allocations, and clearly labeled expected cooked-yield estimates;
- per-dish dry rice allocations, a combined rice total, and clearly labeled expected cooked-yield estimates;
- a consolidated wash-and-cut produce list;
- measured sauce, marinade, mix, side, and dessert batches;
- exactly two batch-wide weekly sauces with separate customer-cup, kitchen-assembly, and quality-control quantities;
- dual operator units: metric plus spoons/cups/pounds and estimated piece counts where supported;
- required equipment and oven temperature;
- the complete ordered cooking or assembly method;
- sauce, rice, side, garnish, and packaging requirements;
- exact plating instructions; and
- holding, chilling, yield, and quality checks.

### Current Batch 3 system state

The planner, grocery builder, production recipe cards, cook methods, weekly sauces, and customer order configuration now share the same 15-dish Batch 3 identifiers and names. Automated consistency tests fail if any customer-menu dish is missing from production data or cook methods. Live order counts remain reviewable and editable before each packet is generated; held or cancelled orders stay visible but contribute no ingredients, labels, production, or staging quantities.

The sticky Runbook section bar jumps directly to Overview, Labels & Quantities, Prep Batches, Thursday, Friday, or Recipe Cards. It is screen-only and does not appear in the printed packet.

It also starts with the seven-stage prep sequence, three simultaneous kitchen lanes, a longest-passive-batch-first equipment plan, and a nine-stage Friday production sequence. Summary, Production, Stations, Plating, Timing Log, Staging, and QC are supporting views; they are not substitutes for the Runbook.

The default production allowance is explicit: finished meals equal sold customer meals. A 5% pooled reserve is applied to raw meat and poultry pulls to absorb normal trim and cooking-yield variation; it does not create extra containers, labels, sides, desserts, or finished meals. After the confirmed Batch 2 rice shortage, dry rice temporarily receives a 15% planning allowance and uses a conservative 2.75x cooked-yield factor. That rice control is not a permanent recipe change: replace it with PRPD's measured dry-to-cooked yield after one complete batch. The summary, count table, ingredient scaling, recipe cards, and grocery list use the same policy. The label plan counts customer meals only. The Buy/Prep column rounds countable purchased items up to whole units. Customer portions never change.

The planner never invents missing seasoning quantities. When an instruction mentions a seasoning that has not yet been stored in controlled grams, the relevant prep-batch card shows an orange **Measure before scaling** note. Record that amount during the next real cook, then update the recipe source before treating the batch as exact.

The workflow is generated from the reviewed meal selection rather than a fixed generic checklist. Thursday groups compatible raw-protein pulls, divides them into labeled dish bowls before dish-specific marinades, separates compatible rice bases from recipe-specific rice sub-batches, and phases marinades, savory mixtures, sauces/toppings, desserts, and sides. It then handles produce, controlled rice cooling, paid-customer labeling, and closeout.

Friday uses a professional component-production model. The equipment launch order is an opening reference; every dish then appears once as its own controlled job ticket:

1. Lock the counts and verify completed prep.
2. Run three lanes at once: passive equipment, active cooking, and cold/cooling.
3. Review the passive-equipment launch order, then start only the active ticket.
4. Produce components by family: breakfast, chicken, beef/formed protein, then seafood and remaining hot dishes.
5. Keep different marinades and finished dish pans separate. Shared pulling or base prep is allowed only when the actual base formula is identical.
6. Split oversized recipes into numbered equipment-capacity sub-batches instead of crowding pans.
7. Record endpoint temperature and actual yield before releasing a component.
8. Assemble one dish and tier at a time. Complete Lean, reset the line, then complete Bulk.
9. Bag by customer only after dish-level production is reconciled.

The active phase uses a three-ticket queue: **Now**, **Next**, and **Later**. Only **Now** is an instruction. Its one relevant recipe or prep batch sits directly underneath with exact quantities and release checks. Every dish is cooked once in one ticket; the opening equipment plan does not create duplicate cook jobs. Prep Day and Cook Day remember their own last-open ticket when the operator switches between them. The full Runbook remains available when a complete batch overview or printed packet is needed.

With a two-person team, the planner intentionally schedules only one hands-on stove/griddle task alongside the passive lane. More burners do not create more practical active capacity when the same two people must also monitor temperatures, receive cooked batches, cool food, and record yields. Recipe cards remain the source for exact scaled quantities and plating instructions.

## Measured Cook Log

The `Cook Log` tab is the permanent measurement surface for each batch. It records:

- whole-batch staffing, prep/cook/assembly times, refrigeration temperatures, container totals, damage, rework, and notes;
- per-dish actual raw protein or starting mix, cooked protein, edible bone-in yield, dry and cooked starch, finished sauce/filling, oil, salt, piece count, sub-batches, endpoint temperature, leftovers, waste, and timing;
- per-tier actual container count, protein/starch/side/sauce portions, first/middle/final net container weights, and notes;
- phase start/finish/owner/variance records and all food-safety/QC checkpoints.

Blank means unknown. Do not type an estimate into an `Actual` field. The measured log is reviewed after the batch and then used to replace provisional yields and recipe assumptions.

After production, use `BATCH_PRODUCTION_RECORD_TEMPLATE.md` as the short human-readable closeout. The Cook Log preserves detailed measurements; the batch record reconciles planned/prepared/packed/leftover quantities, safety exceptions, quality results, waste, and the decisions that must carry into the next menu.

Compatible boneless chicken has a dedicated master-seasoning record. When selected, Power Bowl, Mexican Streetcorn Chicken Bowl, Hot Honey Chicken Sliders, and BBQ Chicken Mac & Cheese are combined into one neutral seasoned batch. The planner scales the complete base blend, then gives the exact raw split for every labeled dish bowl and only the dish-specific finish that belongs after splitting. Chicken Biryani and any other distinct marinade remain separate. The Cook Log captures the actual combined raw weight, every base seasoning weight, post-seasoning weight, handling loss, actual bowl splits, finishing-seasoning weight, timing, and notes.

Entries auto-save after input. Storage is redundant: browser local storage, browser session recovery, an atomically written private JSON file, the previous project-file version as `.bak`, and an optional downloaded JSON backup. Private records live under `operations/private-data/cook-day-logs/`, which is gitignored. The main `Clear` action preserves measured logs; only `Clear this cook log` removes the current batch values after confirmation.

## Weekly Sauce Rule

The current controlled pair is **Smoky BBQ Yogurt Ranch** and **Tangy Yogurt Honey Mustard**. The default batch makes 30 sealed 2-ounce customer cups of each flavor, 10 additional 60-gram cup-equivalents of each flavor in dated squeeze bottles for assembly, and one quality-control cup of each flavor. This is 82 cup-equivalents of sauce across both flavors, but only 62 physical cups; the 20 kitchen-use equivalents stay in squeeze bottles. Recipe-specific items such as French-toast syrup, buffalo sauce, salsa, butter-chicken sauce, street-corn crema, or another controlled meal sauce remain attached to their own recipes and do not replace or duplicate the weekly pair.

The flavor directions are PRPD adaptations of established Greek-yogurt ranch, barbecue-ranch, and yogurt honey-mustard formulas. They are not copied recipes and the exact low-calorie PRPD versions do not have independent public ratings. Treat the first production batch as the approval test for smokiness, sweetness, acidity, thickness, and finished yield before calling either formula locked.

The first real batch is a yield and taste check. Fill each cup to 60 grams, record the final number of cups, and update the controlled formula if blending loss or flavor adjustment changes the measured yield. The planner's calorie figures are practical calculated estimates, not laboratory results.

The Runbook begins with Thursday Prep Day, Friday Cook Day, the Friday-night/Saturday-morning photography window, and Saturday Delivery. Each recipe card repeats its scaled measurements inside the relevant method steps.

## Privacy

- Live sync uses a protected, read-only Vercel endpoint and the existing Google service account.
- The same endpoint accepts protected manual-order writes only when called with the private planner key. There is no public browser control for this operation.
- The sync reader scans columns A:Z and normalizes any accidentally shifted active-batch row back to the canonical 11-column order structure; it never edits the Sheet.
- The separate planner key is held by the local proxy and an encrypted Vercel environment variable. It is not embedded in the planner page.
- Imported customer rows stay in the current browser session only.
- Customer names and orders are not written to local storage.
- Only planner settings and manual dish counts are saved locally.
- The entire `operations/` folder is excluded from Vercel by `.vercelignore` because it contains internal recipes and production records.

## Troubleshooting Sync

- If Sync fails, confirm the planner was opened through the desktop shortcut rather than by double-clicking the HTML file.
- Confirm the local address starts with `http://127.0.0.1:4173/`.
- Use the CSV or pasted-row fallback if Google or Vercel is temporarily unavailable.
- Never paste the contents of `operations/.planner-key` into chat, source code, or the public website.

## Recipe Changes

When a formula or portion changes, regenerate all dependent outputs from the project root:

```powershell
python operations/nutrition/calculate_active_menu.py
python operations/nutrition/generate_label_data.py
python operations/nutrition/generate_production_data.py
python operations/nutrition/generate_active_menu_audit_docx.py
python -m unittest discover -s operations/nutrition -p "test_*.py" -v
npm.cmd test
```

Do not edit `nutrition/production-data.js` by hand.

## Kitchen Queue

The Kitchen Queue converts the selected Batch 3 workflow into two operator days. **Prep Day** covers count lock, desserts, weekly and dish-specific sauces, produce/sides, compatible chicken seasoning and distinct marinades, rice, and labels. **Cook Day** covers kitchen startup, one cook ticket per dish, one assembly ticket per dish, and one pack-out ticket per customer. Every ticket has a stable ID and release condition. Dish tickets show the customer count, finished target, raw and expected cooked protein, dry and expected cooked rice where applicable, exact scaled ingredients, measured method, plating/holding instructions, and quick actual-yield fields.

Use the planner in this order:

1. Read **Now** and ignore the later work except for awareness.
2. Use the recipe and quantities directly below the active ticket.
3. Record the endpoint, actual yield, and produced-container count.
4. Satisfy the ticket's release condition.
5. Select **Complete ticket - show next**.

**Back** returns to the prior ticket. **Other steps in this phase** stays collapsed unless the operator must review or deliberately jump. Quick measurements save into the same durable Cook Log as the full measurement form. Progress and the last-open ticket for each day are saved under the current batch key, so refreshes and Prep/Cook switches resume correctly. **Full printable Runbook** and **Full Cook Log** remain secondary tools for complete references and detailed records.

Planner setup and manual counts use the same batch-and-delivery boundary. A newly rolled menu therefore starts with zero manual quantities and unchecked prep-completion controls; saving within the active batch still preserves the operator's reviewed setup.

Talal and Duaa are permanent no-label accounts. Their meals remain in every production, ingredient, container, staging, and yield calculation, but are removed from the Avery label count. This is a planner rule rather than a customer-order rule.

Weekly sauce quantities are controlled at the batch level because PRPD uses sauce both as sealed customer sides and during assembly. The current pair is a PRPD lower-calorie adaptation of established barbecue-ranch and Greek-yogurt honey-mustard styles. Neither exact PRPD formula has public reviews, so each cook begins with one 60 g pilot cup tasted with food before the full batch is scaled.

## Current Limits

The planner now creates a complete scaled runbook, phase-focused Cook Mode, label print plan, protein/rice/produce prep plan, measured prep batches, component build, station plan, plating matrix, staging list, food-safety/yield log, and production flow. Expected cooked weights are planning estimates, not final facts; record actual yields during production. Exact minute-by-minute task durations and equipment-capacity timing remain provisional until they are recorded during two real cook days. Use the Timing Log during production so later capacity planning is based on observed kitchen performance rather than invented time estimates.

The completed July 15 implementation record is archived at `archive/COOK_DAY_PLANNER_IMPLEMENTATION_HANDOFF_2026-07-15.md`. Dual units, method-step quantities, exact sold-meal production with a pooled raw-protein reserve, component prep dashboards, phased workflow, and guided Prep Day/Cook Day cards are implemented. Exact timing, actual yields, and explicitly flagged unmeasured seasonings remain the primary inputs for the next revision.
