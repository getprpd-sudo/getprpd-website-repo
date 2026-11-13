# PRPD Cook-Day Planner

**Batch 19 complimentary cookies, November 12:** The owner will make 20 full-size chocolate chip cookies as a one-time batch, with one per confirmed customer order including pickup and the rest spare. The planner scales Rida's 12-cookie Gmail recipe by 20/12 (with three whole eggs and four extra yolks), adds its ingredients to shopping, shows the full recipe at the top of the Kitchen Guide, and requires a cookie check before each bag can be marked packed. If orders exceed 20, production scales to the next complete 12-cookie recipe batch. Internal meals receive none. This Batch 19 rule does not automatically carry forward to later menus. Bake time and finished yield still need the first physical tray check.

**Batch 19 wing lot, November 12:** The owner reports 49 purchased individual split flats/drumettes weighing 3,768 g raw bone-in, an average of 76.9 g each. The reviewed nine-order plan contains Zain's one Lean box (6 pieces), Muhammad Mahmood's Lean and Bulk boxes (6 + 8), and two owner Bulk boxes (16), for 36 pieces and 13 left before cooking loss or added orders. Grocery Builder marks the 3,768 g purchased lot on hand. The controlled Lean and Bulk raw-weight estimates now use this lot average, about 461 g and 615 g respectively. Portion by piece count and weigh actual pulls; cooked and edible yield are still unmeasured.

**Current Batch 17, October 29, 2026:** Start with [`active/HANDOFF_2026-10-29.md`](active/HANDOFF_2026-10-29.md) and [`active/CURRENT_MENU_COOK_RECORD.md`](active/CURRENT_MENU_COOK_RECORD.md). Actual-browser verified editable run: 9 records, 92 customer/family plus 6 Home, 98 total, 14 dishes, zero automatic spares. Label demand 73 intentionally excludes family 19 and Home 6; five website Popcorn full-label builds remain held. Cutoff has passed; cook October 30, delivery October 31. No physical or print release is implied.

**Implemented current workflow:** One Sweet Heat batch for six cups; one 1,095 g dry plain-rice base, separate yellow 495 g. Southwest garlic/cilantro/lime finishes Friday after split. Popcorn coating is one wet/dry station. Pancake batter and sandwich assembly are Friday. Tikka/Pinwheel chicken stays Friday; Thursday proposal rejected/unimplemented. Hardware inspection and raw-zone closure before cold assembly are visible. Brief essential steps stay on cards; detailed test notes are expandable. Current cook record has allocations and actual/pending measurements. Dated old quantities, sauce fills and test claims below are historical.

**October 20, 2026 current sauce authority:** PRPD Sweet Heat and Garlic Herb Yogurt now use the owner-selected **40 g net customer fill**. The current master formulas, scaling rule and verification boundary are recorded in [`active/CURRENT_SAUCE_RECIPE_STANDARD_2026-10-20.md`](active/CURRENT_SAUCE_RECIPE_STANDARD_2026-10-20.md). Batch 16 scales those whole-gram master formulas in the Cook-Day Planner. References below to 45 g Sweet Heat or garlic-yogurt cups describe dated Batch 15-and-earlier packets only and must not be reused for current production.

**October 7, 2026 approved component-bowl portions:** Compatible boneless skinless chicken-thigh meals now plate 160 g cooked chicken for Lean or 210 g for Bulk, weighed before sauce. At the controlled 430/625 test yield (68.8%), the current raw equivalents are 232.56 g and 305.23 g; the production engine's 5% purchasing reserve remains separate. Compatible actual 90/10 ground-beef meals retain 210 g raw Lean or 300 g raw Bulk and use a working finished seasoned-component target of 175 g or 250 g until an actual 90/10 production yield is recorded. Both use 120 g or 160 g cooked starch and 75 g or 100 g vegetables. Recipe-specific sauces, garnishes and toppings are added afterward. The planner assigns this by protein and dish form, not by weekly slot or batch number. Incorporated pasta and casseroles, wraps and tacos, meatballs and kofta, steak, bone-in poultry, seafood, custom breast or mince, single-tier builds and Nouman's actual 96/4 remain controlled exceptions.

**October 7, 2026 Batch 14 loader repair:** Opening the desktop launcher regenerates the current recipe payload before the server starts and stops instead of opening stale data if generation fails. The page automatically syncs current orders after its saved state is loaded. Browser, server and generated recipe batch identities must match, so an older method fallback cannot silently replace the current batch. Before the cutoff this is a planning preview; sync, review and lock again after cutoff, and do not release held recipes before their physical tests pass.

**October 5, 2026 shared-run rebuild:** The planner and Grocery Builder now consume one versioned production calculation. Review orders, choose any optional internal meals, then **Run editable kitchen plan**. Grocery Builder's **Sync kitchen plan** uses those exact reviewed quantities, settings and extras. Four historical spares default off. Changed orders/recipe versions require review; old tabs cannot overwrite a newer reviewed plan during a measurement autosave. Sweet Heat keeps the batch recipe/cup count/fill visible and puts repeated dish/tier grams in **Allocation details**. Required labels no longer silently omit missing label builds. Held recipes remain planning-only. Read the [rebuild report](records/planner-rebuild-2026-10-05/SHARED_RUN_REBUILD.md), [kitchen test workbook](active/KITCHEN_CALIBRATION_WORKBOOK_2026-10-05.md) and [current handoff](active/HANDOFF_2026-10-05.md). Historical source adapters remain; older snapshots below do not override current counts.

**October 4, 2026 Batch 13 closeout:** Owner says all customer food was delivered October 3, but four planned internal Lean spares (salmon, Butter Chicken, Boy Kibble, shawarma) were not cooked or found. Trace how planned spares appeared in production and grocery counts and ensure planned is never silently treated as cooked. Owner also reports practical recipe-yield uncertainty, especially rice/chicken, and a slow/tough all-at-once Cheeseburger Hot Pocket bake; that version is retired. Next pass should physically test shared bases and representative Lean/Bulk plates, then compare prep-day staging, cook-day timing, actual yield, customer notes, sauce cups and packing in the UI. See [`active/HANDOFF_2026-10-04.md`](active/HANDOFF_2026-10-04.md). Older structural audits below are historical evidence.

## September 21 structural audit

Follow-up cleanup: all 24 legacy kitchen tests now use documented, frozen Batch 10 scenario fixtures instead of live rotating menu slots. Together with active-menu, source-isolation, routing, labels and grocery tests, 89 focused tests pass. The read-only library audit now pairs archived recipe quantities with matching method versions and explicit ingredient-source metadata: 50 of 63 pass arithmetic, while 13 missing-method records remain blocked. None of this promotes a historical recipe to sale-ready. The full Node suite is not green: 50 other failures and 16 existing skipped tests remain. See [cleanup scope and remaining work](records/planner-audit-2026-09-21/CLEANUP.md).

`kitchen-workflow.js` now defines station routing and whether an operation actually consumes an ingredient. Both the dashboard and its embedded guided tickets use that contract. Staged kits remain available for finishing, consumed dessert ingredients are not added twice, unknown operations fail coverage, and per-ingredient allocation totals are checked against scaled operational recipe quantities. Shared seasoning is counted once. Produce has concrete cut defaults and canned vegetables appear once.

The current Batch 11 source audit passes: six orders, 55 portions, 47 customer/family portions, eight home-party boxes, and 27 label-eligible meals. This is arithmetic and workflow verification, not a physical yield certification. Completed production was not unlocked or relocked.

**Supersedes the historical one-pan claims below:** Enchilada Lean and Bulk formulas are not proportional. Keep measured tier allocations physically separate; changing only slice weight cannot preserve both recipes. Lasagna uses proportional recipe shares across the complete measured batch, not a guaranteed pan count or cooked gram target. The owner's September 21 observation is 24 sheets total, 12 per tray and three per layer. That differs from the 13-sheet recipe requirement for six Lean plus two Bulk. The owner confirmed that the noodles were the only increase; meat, sauce, ricotta and mozzarella stayed at the planner quantities. Actual edible yield is not known. Recalibration is required before treating the physical build and label weights as verified.

Detailed evidence, test limitations and screenshots: [September 21 audit](records/planner-audit-2026-09-21/AUDIT.md).

## September 19 correction: meatball pasta sauce

The Arrabbiata sauce was buried inside a combined starch job. It now has its own **Meatball pasta · tomato sauce** card in Sauces, while pasta remains in Cook ahead and mozzarella remains in final assembly. The current four Lean plus four Bulk orders require 1,200 g crushed tomatoes and 128 g tomato paste for the sauce, 564 g dry pasta, and 224 g mozzarella. Ingredients and nutrition were not changed. The reusable named recipe method also includes this separation. [Focused verification and limitations](records/audits/planner-meatball-sauce-2026-09-19/AUDIT.md).

## Current workflow: September 18, 2026

Batch 11 was re-audited against the six live source orders: 55 production portions, including eight Friday home-party boxes; five customer/family bags with 47 portions; 27 label-eligible meals. Family and home-party meals remain unlabeled.

Kitchen Guide and guided Cook Mode now consume the same kitchen job model. Sweet Heat is a complete ingredient-backed sauce job (six 45 g cups for this packet). Plain rice is one 290 g dry cook with 195 g Bok Choy and 95 g Butter Chicken shares, not two cooking jobs. Lasagna meat sauce, ricotta, assembly, bake, and cooling are one contiguous process. Garnishes remain in Produce. Quinoa, Cottage Pie filling, hot-honey slider sauce, and honey-lime BBQ sauce are explicit jobs. Cook Day is grouped by actual equipment; prepared sides are not cooked again. Finish quantities subtract ingredients already used during prep, including split yogurt, seasonings, and garnish shares.

Shared seasoning is already modeled in Batch 11 production ingredients; `baseIncludedInRecipe` prevents a duplicate addition to operational/grocery totals. Arithmetic retains four decimal places until display, including fractional eggs and whole-pan dessert completion. No recipe nutrition, customer order, or label facts were changed in this workflow repair.

Verification: 52 focused tests; live-source quantity audit; all six rendered stages, 39 guided tickets, and five pack-out bags; desktop screenshots and 390 px mobile overflow check. Test commands and evidence are in [the September 18 audit](records/audits/planner-2026-09-18/AUDIT.md). The reviewed method revision was relocked while preserving non-lock cook-log and pack-out fields. Physical yields, purchased products, pan capacity, cooling, and food quality still require kitchen verification.

## Historical workflow: September 10, 2026

The current Kitchen Guide uses `kitchen-dashboard.js` and `kitchen-dashboard.css`. Start with **Preview kitchen plan**. It does not lock orders or enable final labels/pack-out. The primary stages are Proteins, Produce, Sauces, Cook ahead & assemble, Cook & finish, and a searchable Recipe book. Produce starts with a Pantry vegetables callout so canned peas-and-carrots and corn cannot hide below the fresh-cut list. Cook ahead & assemble is organized into continuous workstation blocks: protein cooking, rice and grains, cooked vegetables, cooked sauce bases, measured and cold kits, then pan and filling assembly. Recipe-specific grain batches remain separately labeled inside one grains station so incompatible rice is never mixed; Biryani rice is visibly grouped there but marked **Cook tomorrow**.

One complete Cook Day card replaces separate Lean and Bulk recipe copies. It shows the shared finish sequence once, then separate Lean and Bulk plating blocks with the exact active container counts. Cook Day is grouped into equipment blocks: 400 F oven work, 375 F oven work, stovetop/griddle, cold assembly when needed, and seafood last. Buffalo Pinwheel, Mediterranean Hummus Box, and Mini Wrap chicken are cooked on Cook Day, then rapidly cooled to 41 F or below before cold assembly; only Enchilada chicken remains a Prep Day cook because the complete casserole is assembled and chilled overnight. Prep Day combines Lean and Bulk totals. Chicken Enchilada Bake now uses one deep 9 x 13-inch pan with a weighed portion ratio, rather than separate tier pans. Shared seasoning is driven by recipe family, cut and timing metadata, not menu slot IDs. Pooled reserve is never an automatic meal. A seasoned split includes its share of seasoning mass.

Final lock requires reconciled imported customer quantities and complete controlled recipes. Changed recipes, cook dates or orders require explicit unlock/review/relock; Generate never silently replaces an old lock. Unassigned manual counts do not create imaginary customer orders. The Shan Biryani formula now has a controlled packet dose and counts the full yogurt input. Purchased-panel verification and actual retained yield remain physical production checks, not a software lock blocker.

Current Batch 10 checkpoint: five orders, 50 items, 13 dishes and 19 dish/tier builds. The exact label queue, grocery build and five customer bags reconcile to this packet. Zee's 12 items remain in production and cost but are excluded from revenue and receivables by owner instruction. The Kitchen Guide shows an exact Cook Day protein pull on every active chicken, beef and seafood recipe. Halal Cart, Buffalo Pinwheels, Mediterranean Hummus Box and Mini Wrap chicken now use uncrowded pan batches for browning. The Breakfast Burrito mise en place is visible on Prep Day, while its eggs remain uncracked and are cooked fresh on Cook Day. All hot-cooking blocks, including seafood last, stay ahead of cold assembly. The unchanged five-order packet was reviewed and relocked on September 11, 2026 at 11:59:04 AM CT. Order signature: `1ssz4b8`. Recipe signature: `16j1uvd`, schema `production-content-v2`.

Current records: [recipe logbook](active/CURRENT_MENU_COOK_RECORD.md), [audit](records/audits/planner-2026-09-08/AUDIT.md). Regenerate the logbook with `node operations/tools/generate_current_cook_record.cjs` whenever active recipes change.

The remaining sections are **historical Batch 8 implementation notes**, retained for context. They are not current operating instructions where they conflict with the current recipe data or workflow above.

Updated: August 27, 2026

The Cook-Day Planner converts the final weekly order export into a private production packet. It is an internal local tool and is excluded from the public Vercel deployment.

## Batch-driven system rules

- Imported active orders are the only activation source. A recipe definition cannot make an unordered dish appear on Prep Day or Cook Day.
- Batch 8 includes three internal-only Nouman recipes (`p1` through `p3`). Their historical Sheet names ending in `Meal` are accepted as aliases, they contribute to grocery and production totals, and they stay off the public order page.
- Every active measured component is assigned to a shared workstation such as potato/mash, grains, hot vegetables, eggs, pasta/bakes, cold kits, or remaining active mise en place. Shared rice is generated once from the rice plan so it cannot be pulled twice.
- Proteins completed safely on Prep Day are marked `prepDayComplete` and are omitted from the Cook Day protein sequence. Automated coverage fails closed if an ordered tier lacks production, Prep Day, Cook Day, or plating instructions.
- Batch 8 weekly sauces are recipient-specific rather than pooled: Beef Breakfast Skillet, Lemon Pepper Tilapia, and PRPD Protein Box receive one separate 40g house PRPD Mustard BBQ cup (28g sugar-free BBQ sauce, 10g yellow mustard, 2g apple cider vinegar); Loaded Beef Cottage Pie receives one separate 45g Sweet Heat cup. The planner adds one QC cup per sauce and cannot allocate either sauce to another meal.
- The active generated recipe payload contains no harissa, prepared salsa, jalapeno, Philadelphia no-bake filling, sourdough, fajita tortilla, or generic onion. Historical method text cannot activate an ingredient unless the current production payload and an ordered meal require it.
- Coverage validation rejects an aggregate recipe ingredient assigned to multiple Prep Day cards. Component formulas must split shared totals explicitly so the kitchen cannot be told to use the same yogurt, garlic, oil, lemon, or salt twice.
- Every controlled recipe ingredient must also appear exactly once in a component map: protein, base/starch, vegetable/side, topping/finish, cooking seasoning, dessert base, or separate cup. Assembly cards display these tier-specific component amounts before the packing steps; a missing or duplicate component blocks coverage.
- Prep Day generates an ascending-temperature oven schedule from only the active ordered pans. Every oven wave embeds its exact active recipe cards before the load instruction; the operator cannot encounter a temperature-only block before seeing how to build the pans. Oven-scheduled prep cards are removed from later workstation sections so one component is not accidentally made twice.
- High-Protein Beef Lasagna is now fully baked to 165 F on Prep Day, rapid-cooled in its intact shallow tier pan through both FDA cooling checkpoints, chilled overnight, and cut cold on Cook Day. Cold squares are weighed individually to the controlled tier targets rather than divided by a fixed grid; sold portions are completed before any genuine edge trim is retained. A pan that misses either checkpoint is not released.

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
6. Select **Lock final batch** after the customer list, tiers, quantities, raw-protein reserve, rice allowance, and sauce plan are final.

Sync is read-only. Exclusions and quantity corrections change the current cook-day packet but never modify the Google Sheet. Selecting Sync again pulls new submissions while preserving review decisions for matching Order IDs and stable legacy rows.

The batch lock freezes the approved customer-order snapshot, counts, recipe data signature, buffer settings, and sauce settings. Reloading the planner uses that frozen order snapshot, so customer labels and weekly-sauce allocations cannot fall to zero merely because live sync is temporarily unavailable. Lock payloads use a separate protected size allowance from free-text cook notes, and the local server rejects any locked autosave whose frozen-order JSON is missing or incomplete. A later order or recipe change is detected rather than silently changing production. Use **Unlock to revise** only when a real correction is required, review the revised plan, then lock it again. Unlocking preserves measured cook records but clears the old pack-out checklist because the physical bag plan may have changed.

Approved manual orders can be inserted through the protected `POST /api/planner-orders` maintenance route. It requires the same private planner key, validates every item against the public menu plus the explicitly approved planner-only dishes, writes only canonical Orders columns A:K, blocks duplicate manual Order IDs, and uses RAW Google Sheets values. This route is for controlled maintenance scripts only; it is not exposed in the planner interface.

If live sync is unavailable, open **CSV, pasted rows, or manual fallback**:

1. Download the Google Sheets `Orders` tab as CSV and import it, or
2. Copy columns A:P, including the header row, and paste them, or
3. Use manual counts.

Only the active batch is counted.

## Generate the Packet

1. Confirm the meal/tier counts against the Orders sheet.
2. Set the cook date, pack-complete time, pooled raw-protein reserve, temporary dry-rice planning allowance/yield, team size, and equipment counts.
3. Under **Completed before cook day**, mark desserts, weekly sauces, and the combined eggs/sides/rice/pasta/potato control only when those batches are finished, counted, cooled, and held safely.
4. Select **Generate and lock production packet**. This freezes the reviewed imported orders and counts before any customer labels or pack-out work can be generated.
5. The planner opens the **Kitchen Guide** automatically. Choose **Prep Day** or **Cook & Pack**, open the current numbered stage, finish it, collapse it, and open the next. Only stage 1 is expanded by default so the page does not expose an entire production shift at once.
6. Every required scaled recipe appears directly inside its operating phase. Prep Day portions and seasons raw proteins, forms meatballs, and cooks all eggs, sides, rice, pasta, potatoes, sauces, and desserts. Cook & Pack completes every protein in one continuous block, closes the raw-protein station, then combines the released proteins with the recorded Prep Day components.
7. Review every warning before shopping or cooking.
8. Use the remaining tabs as supporting count sheets and records.
9. Select **Open exact Label Studio** after locking and generating. The planner passes the active made date, refrigerate-through date, batch ID, and exact label-eligible customer count for every Lean, Bulk, and Single build.
10. Select **Print Packet** to print or save the complete packet as PDF.

The **Kitchen Guide** is the main execution view and the complete printable production reference. It is an ordered kitchen runbook, not a recipe library. **Focus Mode** is optional: use it only when isolating one ticket would reduce distraction. For every dish present in the reviewed orders, the packet includes:

- the Lean, Bulk, or Single production count;
- exact sold customer-meal counts, with no automatic finished extra meals;
- a default 5% pooled reserve applied only to raw meat and poultry quantities;
- a label-eligible locked-customer print queue with exact per-tier counts, mixed Avery 5168 sheets, and unused slots only on the final sheet;
- grouped raw protein pull weights, labeled dish-bowl allocations, and clearly labeled expected cooked-yield estimates;
- one combined dry-rice cook, a clearly labeled expected cooked yield, and destination-pan allocations made only after the rice is cooked;
- a consolidated wash-and-cut produce list;
- measured sauce, marinade, mix, customer-side-cup, recipe-component, and dessert batches;
- recipe-specific customer sauce cups only for meals that require them, with no automatic extra cup on already-sauced dishes;
- dual operator units: metric plus spoons/cups/pounds and estimated piece counts where supported;
- required equipment and oven temperature;
- the dynamic Prep-Day oven order and safe parallel work that can run while each block is occupied;
- an explicit protein/base/side/topping/seasoning/cup map for every tier;
- the complete ordered cooking or assembly method;
- sauce, common-rice, biryani-rice, customer-side-cup, garnish, and packaging requirements;
- exact plating instructions; and
- holding, chilling, yield, and quality checks.

The **Plating** view and the Cook & Pack assembly phases are intentionally instruction-only. They show one card per ordered dish and tier, the exact number of containers to make, component placement, piece counts, toppings, omitted components, and required side cups or bags. Recipe formulas and first/middle/final yield-entry columns do not appear in plating; measured variance belongs in the separate **Cook Log**. Current family allocations are highlighted directly on affected cards: the line states exactly how many containers to set aside for Duaa or Talal without exposing ordinary customer names, and it blocks with a reconciliation warning if a reservation exceeds the dish/tier production count.

Desserts have their own prominent Plating section and a dedicated Cook & Pack phase. The cards state the exact dessert-container count and per-container piece count; if desserts were packaged on Prep Day, Cook Day uses the same step to verify the count and condition before customer bagging.

### Archived Batch 7 system state

The planner, Grocery Builder, production recipe cards, cook methods, weekly sauces, Label Studio, and customer order configuration share the same 18 public Batch 7 identifiers and exact names. Two controlled planner-only builds cover the active manual BBQ Chicken Mac and custom Lebanese Chicken orders without exposing them on the public menu, for 20 controlled dishes and 33 Lean/Bulk/Single label builds total. Automated consistency tests fail if any active dish is missing its production recipe, measured Prep Day cards, Cook Day steps, ordered tier, or plating instructions. Live order counts remain reviewable before the packet is locked; held or cancelled orders contribute no ingredients, labels, production, or staging quantities.

Batch 7 begins from the current live Orders tab plus explicitly approved planner-only orders, then locks the exact reviewed snapshot. The locked snapshot now contains 8 production orders and 65 meals. Cajun Garlic Salmon is roasted to 145 F and paired with lemon-herb quinoa and roasted green beans. Compatible neutral chicken is pooled only for the explicitly listed Batch 7 dishes; Biryani and Butter Chicken retain their separate Desi preparations. The 5% raw-protein reserve remains one pooled allowance rather than extra servings assigned to individual dishes.

The sticky Kitchen Guide bar jumps directly to the overview, quantities, measured prep, or cook phases. A jump switches to the correct day automatically. It is screen-only and does not appear in the printed packet.

Prep Day is generated only from positive locked counts. It locks counts and labels; weighs, splits, marinates, or forms every active raw protein; completes the raw-zone sanitation reset; washes and divides produce; starts non-oven starches; prepares each active recipe before loading its oven wave; finishes remaining stations, sauces, cups, and no-oven desserts; then reconciles the labeled Cook Day kits. Inactive historical dishes cannot create cards. A shared production wave means one physical batch, or one coordinated equipment block when recipes must remain in separate pans. It does not mean an additional recipe or a second cook.

Clean cooked components are condensed into equipment-based workstation cards generated from the active locked batch. Rice and quinoa share one grain station, broccoli/green beans/other hot vegetables share one vegetable station, active egg builds share one egg station, and pasta plus protein mac share one pasta/mac station. Each exact recipe remains in its own inner tab with its own measurements and destinations, so the guide supports concurrent work without implying that separate recipes should be mixed. Cook & Pack mirrors these same workstations during component release. Future dishes join the appropriate workstation through their method metadata; historical inactive dishes cannot create tabs.

The raw-protein block is one visible **Protein Cutting & Seasoning Station**. It shows the total pull for each protein type first, followed immediately by the dish splits, exact seasoning or kit ingredients, and Prep Day action. The operator can cut or trim one protein type together, hold its reserve plain, divide the recipe weights, and season without opening tabs or numbered bag cards. Proteins may share a base seasoning only when the active method file explicitly names them together in `sharedProteinSeasoning`; an empty family list means the protein may be cut together but every dish split is seasoned separately.

The raw-protein-first order is an operational choice, not permission to mix raw and ready-to-eat work. Proteins stay at 41 F or below, every dish allocation is labeled before seasoning, and produce or ready-to-eat work cannot begin until the raw zone, tools, apron/gloves, and contact surfaces have completed the sanitation gate.

The following exact 104-item quantities are a **historical Batch 6 example only** and must not seed Batch 7 counts. For Batch 6, the reviewed production plan shaped exactly six Beef Seekh logs on Prep Day: five Lean logs at 170 g each and one Bulk log at 210 g. The two Bulk steak portions were seasoned on Prep Day with 600 g raw steak, 16 g garlic, 4 g avocado oil, and 2 g salt total, then covered and held at 40 F or below for Cook Day. Common basmati rice was weighed and cooked as one batch. After the post-batch corrections, all 2,500 g of fresh potatoes were one physical roast. This paragraph remains only as production history; Batch 7 quantities come from the new live-order lock.

The owner did not make refrigerator pickles for this Batch 6 production run. Sliders and Shawarma therefore omit pickles without an improvised substitute. The Cook-Day Planner and Grocery Builder remove the pickle quantity and brine expansion for this run while retaining the planned recipe as historical source evidence.

Cooking a customer protein on Thursday is not a default prep shortcut. A Thursday cook starts the cooked-food refrigeration clock one day before the normal Friday production date. Unless a recipe card is explicitly marked as an approved cook-ahead component, Thursday protein work stops at cutting, marinating, mixing, or forming. Meatballs, peri-peri chicken, and seekh are held raw under refrigeration Thursday and cooked Friday. Any exception requires a completed rapid-cooling log plus made/use-by and customer freeze instructions based on the earlier cook date. USDA guidance uses 160 F for ground beef, 165 F for poultry, and about 3-4 refrigerated days for promptly chilled cooked ground beef or poultry.

Cook & Pack follows one hard sequence: startup; every breakfast, chicken, ground-beef, steak, and seafood protein batch; raw-protein reconciliation and station closure; one release pass for the recorded Prep Day rice, potatoes, packaged mash, eggs, broccoli, street corn, shrimp vegetables, pasta, sauces, and other components; breakfast assembly; main-dish assembly; then customer-by-customer bags. Cook Day release cards explicitly say to verify, reheat only as needed, and divide the prepared batch rather than remaking it. Every base protein is cooked and released inside the same protein block. All customer meat, poultry, and seafood cooks Friday; eggs, sides, starches, sauces, and desserts are already complete from Prep Day.

The default production allowance is explicit: finished meals equal sold customer meals. A 5% pooled reserve is applied to raw meat and poultry pulls to absorb normal trim and cooking-yield variation; it does not create extra containers, labels, sides, desserts, or finished meals. After the confirmed Batch 2 rice shortage, dry rice temporarily receives a 15% planning allowance and uses a conservative 2.75x cooked-yield factor. That rice control is not a permanent recipe change: replace it with PRPD's measured dry-to-cooked yield after one complete batch. The summary, count table, ingredient scaling, recipe cards, and grocery list use the same policy. The label plan counts label-eligible locked customer meals only. It consolidates duplicate meal/tier lines, then packs all variants together: total sheets equal `ceil(total labels / 4)`, and only the last sheet may contain blank slots. The Buy/Prep column rounds countable purchased items up to whole units. Customer portions never change.

The planner-to-studio handoff is fail-closed. An unlocked batch, empty label-eligible order snapshot, missing generated dish, wrong tier, malformed or duplicate URL entry, non-integer quantity, quantity outside 1-200, stale batch identity, or a declared-count mismatch disables label printing instead of silently dropping part of the queue. Approved manual dishes must be present as explicitly controlled `plannerOnly` label builds; arbitrary archived labels remain blocked.

The retired `prpdExtraServings` and `qcServings` settings are no longer accepted by the shared calculation engine. Finished production cannot be increased through those legacy fields; any planned overage must be represented transparently as raw-protein reserve, rice allowance, or an explicit manual order.

The planner never silently converts a generic seasoning estimate into PRPD's approved formula. Active recipes use controlled grams. If a historical recipe still lacks an approved quantity, its prep card shows **Recipe decision still required**; run and record a measured pilot, then update the source recipe before locking that value.

The workflow is generated from the reviewed meal selection rather than a fixed generic checklist. Prep Day begins with labels and raw proteins, then completes the sanitation reset before ready-to-eat work. Beef appears as exact raw recipe kits and formed meatballs; all customer beef cooks Friday. Produce for cooked components is cut in one clean block and stored by physical form. Fresh lettuce, tomato, cucumber, and apple are washed and dried on Prep Day but cut Friday to protect texture and moisture control.

Friday is a protein-first production sequence:

1. Verify the locked counts and completed Thursday prep.
2. Cook every selected protein in the displayed protein-family order. Do not assemble a dish during this block.
3. Keep different marinades and finished dish pans separate. Shared pulling or base prep is allowed only when the actual base formula is identical.
4. Split oversized recipes into numbered equipment-capacity sub-batches instead of crowding pans.
5. Record raw weight, endpoint temperature, actual cooked yield, reserve used, and destination pan before releasing each protein.
6. Reconcile all protein pulls, remove raw tools, wash, rinse, sanitize, and visibly mark the raw station **CLOSED**.
7. Only after closure, release or gently reheat the recorded Prep Day eggs, dough, starches, vegetables, and sauces; do not remake them.
8. Assemble one dish and tier at a time. Complete Lean, reset the line, then complete Bulk.
9. Bag by customer only after dish-level production is reconciled.

Focus Mode retains a three-ticket queue: **Now**, **Next**, and **Later**. Only **Now** is an instruction. Its relevant recipe or prep batch sits directly underneath with exact quantities and release checks. The Prep Day equipment ticket renders the same recipe-first oven waves as the Kitchen Guide. Every oven card is prepared before loading, and every dish is cooked once. Prep Day and Cook Day remember their own last-open ticket. This is a secondary concentration tool, not the default production path.

With a two-person team, the planner intentionally schedules only one hands-on stove/griddle task alongside the passive lane. More burners do not create more practical active capacity when the same two people must also monitor temperatures, receive cooked batches, cool food, and record yields. Recipe cards remain the source for exact scaled quantities and plating instructions.

## Measured Cook Log

The `Cook Log` tab is the permanent measurement surface for each batch. It records:

- whole-batch staffing, prep/cook/assembly times, refrigeration temperatures, container totals, damage, rework, and notes;
- per-dish actual raw protein or starting mix, cooked protein, edible bone-in yield, dry and cooked starch, finished sauce/filling, oil, salt, piece count, sub-batches, endpoint temperature, leftovers, waste, and timing;
- per-tier actual container count, protein/starch/side/sauce portions, first/middle/final net container weights, and notes;
- phase start/finish/owner/variance records and all food-safety/QC checkpoints.

Blank means unknown. Do not type an estimate into an `Actual` field. The measured log is reviewed after the batch and then used to replace provisional yields and recipe assumptions.

Each dish compares recorded actuals with the locked production target. Once raw and cooked weights or produced-container counts are entered, the card shows cook yield, raw-weight variance from plan, and container variance. A variance is evidence for review, not an automatic recipe edit. The approved master recipe changes only after the operator decides that the measured correction should become the next locked formula.

## Pack-out Mode

The dedicated `Pack-out` tab is available after the batch is locked and final orders are synced. It expands every sold line into one checkbox per physical container, then requires four final bag checks:

- customer and delivery address verified;
- weekly or dish-specific sauces checked, or confirmed not applicable;
- desserts and other cold items included; and
- the customer bag sealed.

Customer address, city, ZIP, phone, email, delivery notes, and order notes appear when they exist in Orders columns L:P. Talal, Duaa, Rida, and other label-exempt production orders still receive pack-out cards because label exemption does not mean bag exemption.

Pack-out checks and handoff notes use the same redundant autosave system as the Cook Log. Closing or refreshing the tab does not erase completed checks. The progress header reports both completed bags and checked physical containers. Pack one open customer card at a time; do not treat the static Staging table as the final bag-control record.

Every Focus Mode and Cook Log recipe card includes a controlled adjustment record. If a batter, dough, sauce, or filling needs correction, record the ingredient added, measured amount, unit, and reason before continuing. Then mark the batch `On-formula — released`, `Adjusted — released`, `Hold`, or `Failed`, and write the proposed next-batch action. An in-service adjustment never silently edits the approved recipe: it becomes a candidate change only after the post-batch review. `Print blank / current records` produces a kitchen copy that can be completed by hand and entered later without losing the original formula.

After production, use `standards/BATCH_PRODUCTION_RECORD_TEMPLATE.md` as the short human-readable closeout. The Cook Log preserves detailed measurements; the batch record reconciles planned/prepared/packed/leftover quantities, safety exceptions, quality results, waste, and the decisions that must carry into the next menu.

Compatible boneless chicken has a dedicated master-seasoning record. In Batch 6, the compatible neutral pull covers Power Bowl, Breakfast Quesadilla, Mexican Streetcorn Chicken Bowl, Halal Cart Chicken, Sweet Chili Chicken, and Mini Chicken Snack Wrap. Chicken Biryani remains a separate Desi batch. The planner scales the neutral base once, then gives the exact raw split for every labeled dish bowl and only the finish that belongs after splitting. The Cook Log captures combined raw weight, base seasoning, handling loss, actual splits, finishing adjustments, timing, and notes.

Entries auto-save after input. Storage is redundant: browser local storage, browser session recovery, an atomically written private JSON file, the previous project-file version as `.bak`, and an optional downloaded JSON backup. Private records live under `operations/private-data/cook-day-logs/`, which is gitignored. The main `Clear` action preserves measured logs; only `Clear this cook log` removes the current batch values after confirmation.

The **Start dictation** control writes into whichever Cook Log textarea was selected most recently and defaults to Batch notes. Spoken text dispatches through the same auto-save path as typed text. Dictation requires browser microphone permission and supported browser speech recognition; it is an input convenience, not the storage system. A visibility change, tab close, refresh, or browser crash still leaves the typed or transcribed record in the redundant recovery stores above.

## Batch 7 Sauce Rule

Batch 7 uses one shared Creamy Jalapeno-Lime Yogurt Sauce formula: Beef Bacon Breakfast Sandwich and Power Bowl each receive one 45-gram net cup, while Southwest Beef Taco Bowl receives one 37-gram net cup from the same batch. Pancakes retain their measured component cups, and Chicken Caesar Crunch Box keeps dressing and croutons separate. Recipe-incorporated sauces are never duplicated as side cups.

## Historical Batch 6 Sauce Rule

Batch 6 uses one controlled weekly sauce: Beef Bacon Breakfast Sandwich and Loaded Beef Cottage Pie each receive one 45-gram net PRPD Sweet Heat Sauce cup, with the current planner-only family steak portions supplied from the same batch and one additional QC cup for the batch. French Toast receives one 30-gram syrup cup, Breakfast Quesadilla has no salsa cup, and BBQ Chicken Mac & Cheese receives its measured BBQ cup. The Kitchen Guide presents the weekly batch, customer side cups, and make-ahead recipe sauces together under **All sauces, finishes, and customer cups**. Sweet Heat customer portions already present in controlled recipes are counted once; the weekly grocery merge adds only the QC or explicit kitchen reserve. Sauces and finishes already incorporated into Sliders, Loaded Buffalo Chicken Potato, Harissa Honey Chicken, Streetcorn Chicken, Shawarma, Garlic Butter Shrimp, Mini Chicken Snack Wrap, desserts, and Grab & Go recipes are not counted again.

Filled leftovers may be credited only when they match the exact controlled recipe and remain within the approved food-safety window. An unlabeled or expired leftover is recorded as waste, not used to reduce a new customer batch.

The Kitchen Guide begins with Prep Day and Cook & Pack. The only optional reference retained below the guide is the delivery and photography checklist. Each recipe card repeats its scaled measurements inside the relevant method steps.

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
python operations/nutrition/calculate_next_menu.py
python operations/nutrition/generate_next_menu_label_data.py
python operations/nutrition/verify_next_menu_labels.py
python operations/nutrition/generate_production_data.py
python operations/costing/calculate_next_menu_draft_costs.py
python -m unittest discover -s operations/nutrition -p "test_*.py" -v
npm.cmd test
```

Do not edit `nutrition/production-data.js` by hand.

## Focus Mode

Focus Mode converts the selected workflow into two simple step lists. **Prep Day** covers count lock and pre-labeling, compatible chicken seasoning, exact raw beef/steak/fish kits, formed meatballs, sanitation, produce, sauces, desserts, measured clean mixtures, and every cooked egg/side/starch batch. **Cook Day** covers kitchen startup, one continuous all-protein block, the hard raw-station closure gate, prepared-component release, assembly, and one-customer-at-a-time pack-out.

Use Focus Mode only when the complete Kitchen Guide feels visually distracting or when resuming one interrupted task. It is not the default cook-day plan.

Use the planner in this order:

1. Read **Now** and ignore the later work except for awareness.
2. Use the recipe and quantities directly below the active step.
3. Record the endpoint, actual yield, and produced-container count.
4. Satisfy the step's release condition.
5. Select **Done - show next step**.

**Previous step** returns to the prior step. Progress and the last-open step for each day are saved under the current batch key, so refreshes and Prep/Cook switches resume correctly. **Open full Kitchen Guide** and **Full Cook Log** return to the complete references and detailed records.

Every recipe card includes an optional inline cook record for actual starting weight, finished yield, containers produced, oil retained, and free-text notes. These fields write to the same durable batch Cook Log as the full form. Changes save automatically to browser storage and the private planner-state file, and duplicate fields stay synchronized.

Planner setup and manual counts use the same batch-and-delivery boundary. A newly rolled menu therefore starts with zero manual quantities and unchecked prep-completion controls; saving within the active batch still preserves the operator's reviewed setup.

The current configured no-label accounts are Duaa and Rida. Their meals remain in every production, ingredient, container, staging, and yield calculation but are removed from the Avery label count. Talal is not currently label-exempt, so his active meals are included in the exact locked label queue.

Sauce packaging is controlled by each Batch 6 recipe. Beef Bacon Breakfast Sandwich, Loaded Beef Cottage Pie, and the current planner-only family steak portions receive Sweet Heat; French Toast receives syrup; Breakfast Quesadilla has no salsa cup; and BBQ Chicken Mac & Cheese receives its measured BBQ cup. The planner and Grocery Builder count exactly one cup per eligible meal plus the single Sweet Heat QC cup, and show all sauce work in one operating section. Incorporated sauces and finishes remain recipe components rather than duplicate side cups or duplicate grocery quantities.

The planner no longer uses a generic **Sides and cold components** lane. Biryani rice and every dish-specific finish stay inside their owning recipe cards. Compatible plain rice is cooked once as one common batch and divided only after the total cooked yield is recorded; Chicken Biryani remains a separate seasoned-rice batch when it is on a future menu.

`Measure before scaling` was previously used when a historical recipe did not contain an approved house measurement. Active Batch 6 formulas use explicit grams wherever the recipe is published. Any genuinely unresolved formula is labeled **Recipe decision still required** and must be piloted before it becomes a locked recipe.

## Current Limits

The planner now creates a complete scaled Kitchen Guide, optional Focus Mode, label print plan, protein/rice/produce prep plan, measured prep batches, component build, station plan, plating matrix, staging list, food-safety/yield log, and production flow. Expected cooked weights are planning estimates, not final facts; record actual yields during production. Exact minute-by-minute task durations and equipment-capacity timing remain provisional until they are recorded during two real cook days. Use the Timing Log during production so later capacity planning is based on observed kitchen performance rather than invented time estimates.

The completed July 15 implementation record is archived at `archive/COOK_DAY_PLANNER_IMPLEMENTATION_HANDOFF_2026-07-15.md`. Dual units, method-step quantities, exact sold-meal production with a pooled raw-protein reserve, component prep dashboards, phased workflow, and guided Prep Day/Cook Day cards are implemented. Exact timing, actual yields, and explicitly flagged unmeasured seasonings remain the primary inputs for the next revision.
