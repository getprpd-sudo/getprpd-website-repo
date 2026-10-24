# PRPD feedback label and QR flow design QA

> Historical prototype QA. The production backend and public feedback route were implemented afterward. Current production status and remaining redemption/print gates are recorded in `operations/plans/ORDER_FEEDBACK_QR_SPEC_2026-10-20.md` and `operations/active/HANDOFF_2026-10-21.md`.

Date: October 20, 2026

## Comparison target

- Source visual truth: `C:/Users/aazim/AppData/Local/Temp/codex-clipboard-0ea19e29-858a-4b1c-b218-0c55c0eea97d.png` (568 x 243 px crop supplied by the owner).
- Owner direction: align `Meals. Prepped.` and `Your Order · Your Feedback`, remove the mixed-baseline jumble, require every unique dish for the reward, and make the distinction between selected ratings and complete reviews obvious.
- Existing brand reference: `output/rendered/PRPD_Current_Meal_Label_Reference.png`.
- Label proof: `operations/prototypes/bag-feedback-label-demo.html`.
- Customer-flow proof: `operations/prototypes/order-feedback-demo.html?t=sample-order-token&m=m2`.
- Browser-rendered implementation evidence: in-app Browser captures of `bag-feedback-label-demo.html?rev=6` and `order-feedback-demo.html?t=sample-order-token&m=m2&rev=5` at a 920 x 668 browser viewport. The label itself remains 5 x 3.5 inches, or 480 x 336 CSS px at 96 px/in.
- Decorative asset: `operations/prototypes/assets/bag-feedback-contour-lines-v3.png`.
- Print viewport: 5 x 3.5 inches, Avery 5168 landscape ratio.
- State: local working prototypes. No production backend or real credit issuance.

## Label comparison evidence

- The former isolated left and right columns were replaced with three horizontal bands. The oversized two-line headline now spans the central field, so the middle is no longer empty.
- The reward occupies the lower middle and the QR is contained in a compact lower-right action block.
- Dynamic `Prepared for` customer identity fills the former lower-left dead space, while a compact unique-dish count occupies the middle-right without competing with the QR.
- The tan strip and bright reward pill are absent. The palette stays warm paper, deep forest and controlled PRPD green.
- The selected contour asset is visible at lower left and a smaller matching contour floats from the upper-right edge.
- The PRPD masthead remains prominent and the code keeps a clean white quiet zone.
- `Meals. Prepped.` and `Your Order · Your Feedback` now use the same small-text scale and share one baseline beside the PRPD wordmark. The owner-provided crop and the revised rendered header were compared as the focused typography region.
- In the browser proof, clicking the QR opens the working local customer-flow prototype for review.
- A browser-rendered full-view inspection showed the complete label without overlap or horizontal clipping.

## QR customer-flow evidence

- The browser page opens directly to the sample delivered order without login, search or order-number entry.
- Five unique sample dishes appear once, while ordered quantities remain visible as context.
- Each dish provides ten numbered score controls. CSS converts them to two rows of five below 620 px.
- `What did you like?` is required for a dish to count and uses an eight-character minimum. `What would you change?` remains optional.
- With all five scores selected but only one qualifying note, the page now states `5 of 5 ratings selected`, `1 of 5 reviews complete`, and `4 required notes left`. This resolves the earlier misleading `Complete 3 more dishes` state.
- Completing all five required notes changed the page to `5 of 5 reviews complete`, `$5 credit unlocked`, and enabled `Finish and save feedback`.
- Rating and note state use versioned local autosave so stale optional-note prototype data cannot qualify under the new rule.
- Testimonial consent appeared only after a written note existed. It was off by default and revealed first-name, initials and anonymous choices only after being enabled.
- The Done action produced the explicit `You earned $5 in PRPD credit` confirmation.
- The QR asset was decoded after regeneration and contains only `https://getprpd.com/feedback?t=demo_6f1a8c29b47e5d3a`. It contains no name, email, phone, address or raw order ID.

## Findings

- P0: none.
- P1: production data and credit issuance are intentionally not connected. A backend must validate hashed order tokens, load exact delivered line items, persist feedback and post wallet credits before launch.
- P2: the bag-label QR points to a non-live production-shaped URL and is visibly marked `Sample QR · Not live`. Replace it with the generated per-order production token only after the backend is available.
- P3: the contour PNG has light raster texture. It is unobtrusive at the current opacity and intended print size.

## Comparison history

- Earlier P2: the two small header phrases used different sizes and did not share a baseline. Fix: the header is now a three-column grid, both phrases use the same 5.75 pt scale, and both align to the same baseline. Post-fix evidence: the rev 6 print-size render shows a clean left-to-right lockup without overlap.
- Earlier P1: progress treated four of five complete reviews as sufficient and described missing required notes as missing dishes. Fix: the threshold is now all unique dishes, with separate selected-rating and complete-review counts. Post-fix evidence: the all-rated/one-complete state reports four required notes, and the all-complete state unlocks the credit.

## Primary checks

- Both prototypes load in the in-app browser.
- All five meal images load.
- Progress, the all-dishes required-liked-note threshold, optional change note, testimonial consent and completion confirmation work.
- Rating and note state persist through refresh.
- The label remains a separate bag sticker and does not obscure the required meal-label nutrition, ingredients or allergens.

Production release remains gated on backend integration and a physical QR scan test.

final result: passed
