# PRPD master recovery and operations guide

Latest October29 result: owner approved completing final labels from recipe-based nutrition/weight estimates, without provisional/draft/AI/estimate wording on the labels.73 meal labels+6 feedback QR labels were finalized, fully reconciled and emailed to Adnan; Gmail SENT verified message1a186802da1d5028. Read the newest sections in AGENTS and HANDOFF_2026-10-29.md before older review-only holds. Physical observations remain separate and unclaimed. New research, final PDF and verification live in the October29 chat outputs; this is not proof of a new cloud backup.

Latest October 29 continuation: Ads research and the operating baseline are complete in `operations/plans/GOOGLE_ADS_OPERATING_BASELINE_2026-10-29.md`; implementation/test results remain pending. The current grocery CSV was independently checked; see the outputs final-verification report and the latest handoff for caveats.

Created October 24, 2026 for Aazim and any future Codex session. This is the single starting document for finding, restoring, understanding, and operating the GETPRPD system.

This document is a map and operating guide. It is not authorization to deploy the public site, contact a customer or partner, change a payment, publish a menu, lock production, print labels, alter a recipe, or make a purchase.

## Current operations, October 29, 2026

Start with `operations/active/HANDOFF_2026-10-29.md` for the completed session, including the latest Ads and finance findings, then `operations/active/CURRENT_MENU_COOK_RECORD.md`. This section controls operations. Earlier dated snapshots remain history.

- Batch 17 cutoff Wednesday October 28 at 6 PM Central has passed. Prep Thursday October 29, cook Friday October 30, delivery Saturday October 31. The editable reviewed run has 9 records, 8 customer/family orders, 92 customer portions plus 6 internal Home portions, 98 total, 14 active dishes and zero automatic spares. Nouman is off/unconfirmed, not an assumed order.
- Keep Tikka and Buffalo Pinwheel chicken cooking Friday. The Thursday move was proposed, rejected by the owner and never implemented. Cook/shred and protectively chill Friday, close/reset the raw-food zone, then cold-assemble.
- Planner streamlining is implemented and actual-browser verified: one Sweet Heat batch; one shared plain-rice base with separate yellow rice; one Popcorn coating station; fresh Friday pancake batter and sandwich assembly; finished-portion omelette instructions. Brief cooking steps remain visible, detailed test notes are optional. Fifteen focused planner checks plus four grocery-persistence checks passed; these are digital checks, not physical passes.
- Current shopping authority: `PRPD_Batch17_Grocery_List_2026-10-28.csv` in the outputs path below, plus the latest saved owner pantry/package state. Reviewed priced checkout estimate $172.10 excludes bottled ranch, manual tortilla-chip extra, tax and store-price changes. It is not a receipt or complete supplier quote. The four owner package choices and updated pantry survived save/reload. Do not import an old backup wholesale.
- Label demand 73 intentionally excludes Duaa 5 and Talal 14 standing family exemptions and Home 6. Five website Popcorn full-nutrition labels are held. A required-label count or existing draft is not permission to print. Supplier panels, truthful earliest-component dates, actual packed weights and physical printing checks remain open.
- Wings: at least 44 individual split flats/drumettes, not whole wings. Duaa one box of 8, Talal two boxes of at least 10, Home two boxes of 8. Five bottled-ranch cups at 40 g planning fill each. The modeled raw grams do not replace piece counting; exact product identities, panels, measured yield and fit remain open.
- No completed meal-production cooling, loaded-fridge, route cold-holding, packout-weight or final-label print pass is recorded. Actual shake tasting and one net bottle-fill observation DO exist; see the latest flavor records. Sensory checks do not validate five-day microbiological shelf life.

Evidence/output directory: `C:\Users\aazim\Documents\Codex\2026-10-26\okay-so-read-all-the-documents\outputs`.
Current proof: `PRPD_Planner_Streamlined_Verification_2026-10-29.json`, `PRPD_Grocery_Package_Reload_Verification_2026-10-29.json`, current CSV and matching screenshots. Recheck live orders when resuming later. This documentation update does not claim a new private backup upload or cloud sync.

### Latest Ads and collections checkpoint, October 29

- Google Ads October 26-28: 5 impressions, 1 click, $2.98 spend, 0 recorded conversions. Strategy now Learning; the earlier Inactive warning cleared. Search impression share 22.73%, lost to rank 63.64%, lost to budget 13.64%. Two additional RSA drafts are ready for review, not published. Existing budget, CPC cap, targeting and Monday-Wednesday schedule remain unchanged.
- Hammad's $50 is verified paid. Talal's promised $990 covers his and Duaa's remaining balances after a $37 combined discount; receipt is still pending. Do not mark the promise paid or separately collect from Duaa. See the private current handoff for ledger allocation and evidence.


## Start here

If the current laptop stops working:

1. Sign into the owner Dropbox account and open `/GETPRPD Recovery/2026-10-24`.
2. Read this file, then `RECOVERY_START_HERE.md`.
3. Use the private GitHub repository or the private workspace ZIP to restore the project.
4. Read `AGENTS.md`, `.codex/Skills/Food skill/SKILL.md`, `operations/active/HANDOFF_2026-10-29.md`, and `operations/active/CURRENT_MENU_COOK_RECORD.md` before taking operational action. The Batch 16 outcome is incident history.
5. Sign into GitHub, Dropbox, Gmail, Google Voice, Google Sheets, Vercel, and Codex through their official applications. Do not copy old browser cookies or authentication tokens.

## What is backed up

This table describes the verified October 24 frozen snapshot, not proof that October 29 edits or this chat outputs are backed up. Verify a fresh private sync before relying on newer records from another computer.

| Layer | Location | Purpose | Current state |
|---|---|---|---|
| Public application source | `https://github.com/getprpd-sudo/getprpd-website-repo` | Privacy-safe website, APIs, calculators, tests, and deployable application source | Verified branch `codex/security-operations-hardening` at `e69d8b6ffd07a273ccd8e2c6f9f14e4b05040d09` |
| Private recovery source | `https://github.com/getprpd-sudo/getprpd-private-recovery` | Owner-only source, handoffs, operating records, finance/relationship/governance documents, recipes, and portable Codex instructions | Verified private `main`; base recovery snapshot `fb26aab25be2cb34f2b0d4df2005159b2b3e9907`, followed by recovery-document updates |
| Full Dropbox workspace mirror | `/GETPRPD Website` | Working copy of the GETPRPD folder, including files intentionally excluded from public Git | Owner-only Dropbox mirror |
| Dated recovery package | `/GETPRPD Recovery/2026-10-24` | Frozen archives, manifest, recovery documents, and Codex backup | Owner-only, no public shared link |
| Public Git bundle | `/GETPRPD Recovery/2026-10-24/GETPRPD-public-repo-e69d8b6.bundle` | Complete Git history and refs for the public repository | Verified bundle, 503,351,382 bytes |
| Private workspace ZIP | `/GETPRPD Recovery/2026-10-24/GETPRPD-private-workspace-2026-10-24.zip` | Full owner-only workspace snapshot, including ignored operating evidence and media | Verified ZIP, 595,013,761 bytes |
| Portable Codex setup | `/GETPRPD Recovery/2026-10-24/Codex-Portable` | `AGENTS.md`, Food skill, and current non-secret Codex configuration | Cloud-visible |
| Full Codex state | `/GETPRPD Recovery/2026-10-24/Codex-Full` | Session transcripts, archived sessions, attachments, generated images, dictation history, plugins, custom skills, visualizations, global state, indexes, and consistent database snapshots | Local snapshot complete; essential transcripts and all databases cloud-verified |

The exact archive hashes, exclusions, test state, and Windows audit are in `BACKUP_MANIFEST_2026-10-24.md`.

## What each backup is for

### Public GitHub repository

Use this for normal application development and for restoring the privacy-safe site source. It deliberately does not contain customer contacts, bank records, unredacted receipts, private planner state, credentials, or Codex authentication.

A GitHub push is not a Vercel deployment. Do not assume the public site changed merely because source was pushed.

### Private GitHub recovery repository

Use this when a new computer or AI session needs the operating context that cannot be public. It includes the dated handoffs and controlled business records needed to understand PRPD. It still excludes secrets and the largest raw evidence folders.

The private repository is not a password manager. Do not add `.env` values, Google service-account JSON, planner keys, access tokens, refresh tokens, or browser sessions.

### Dropbox workspace and recovery folders

Dropbox is the owner-only home for the complete private layer. It contains the working project mirror, frozen recovery archives, raw evidence, private records, and the full Codex point-in-time snapshot.

Do not create a public shared link for the recovery folder. The private workspace ZIP contains sensitive operational state, including the local planner key.

### Codex-Full

`Codex-Full` is a point-in-time backup of local Codex history and durable state. It excludes authentication and device secrets. Its `Database-Snapshots` directory contains online-consistent snapshots of:

- `thread_history_1.sqlite`
- `state_5.sqlite`
- `goals_1.sqlite`
- `memories_1.sqlite`
- `queue_1.sqlite`
- `logs_2.sqlite`
- `sqlite/codex-dev.db`
- `sqlite/codex-thread-summaries-dev.db`

Every database passed SQLite `PRAGMA quick_check`. `BACKUP_COMPLETE.json` identifies the locally completed snapshot. `SHA256SUMS.csv` contains file hashes.

Never restore Codex databases while Codex or ChatGPT is open. On a new computer, install and sign in first, close the app, preserve its new empty state, then restore durable files carefully. Authentication must be recreated by signing in.

## What is intentionally not copied

The following are excluded because they are unsafe, machine-specific, transient, or rebuildable:

- Codex `auth.json`
- Codex `.sandbox-secrets/`
- Codex `cap_sid` and `installation_id`
- browser cookies and saved login sessions
- GitHub, Google, Vercel, Dropbox, and OpenAI access or refresh tokens
- active process locks, live voice continuity state, and computer-use runtime state
- sandbox binaries, temporary caches, and rebuildable runtime files
- a Windows system image

Excluding these does not reduce business recovery. Sign in again on the replacement computer. Do not copy authentication tokens between machines.

## Windows backup limitation

There is no verified full Windows image. The laptop has one internal 512 GB drive, about 435 GB is used, and there was no external or network backup target attached during the audit. File History is not configured. A restore point on the same internal disk is not disaster recovery.

For a true computer clone:

1. Connect a separate 1 TB or larger USB HDD or SSD.
2. Confirm its exact drive letter and free space.
3. Run the backup from an Administrator session.
4. Create Windows recovery media on a separate removable drive if desired. Creating recovery media erases that target and requires separate approval.
5. Never store the system image on the same internal drive or inside Dropbox on that drive.

Until that is done, the GETPRPD business files and Codex data are recoverable, but Windows, installed applications, drivers, and local app settings would need to be reinstalled.

## Authority and reading order for Codex

When instructions conflict, use this order:

1. The owner's newest explicit instruction and current live evidence.
2. `AGENTS.md`.
3. The complete `.codex/Skills/Food skill/SKILL.md`.
4. This guide and `RECOVERY_START_HERE.md` for recovery routing.
5. `operations/active/HANDOFF_2026-10-29.md` for the current operating boundary.
6. `operations/active/BATCH_16_COOK_DAY_OUTCOME_2026-10-24.md` for physical Batch 16 results.
7. `operations/active/CURRENT_MENU_COOK_RECORD.md` and the reviewed planner for Batch 17; older handoffs only for history.
8. Controlled standards, current recipe records, and dated evidence.
9. Older handoffs and batch drafts only as history.

The root `README.md` and `operations/OPERATIONS_INDEX.md` contain older paragraphs that call prior handoffs current. Use them as navigation, not as present-day authority.

## Rules an AI must follow

- Read the complete Food skill before every repository task.
- Use live evidence before claiming an order, payment, contact, label, route, or deployment state.
- Do not send a customer or partner message without reading `operations/plans/MESSAGE_APPROVAL_WORKFLOW_2026-09-08.md` and showing the final recipient, channel, and wording for owner approval.
- Do not deploy, publish, print, relock production, change payment state, or alter recipes merely because a draft or old chat says to do so.
- Review the full recipe library and current controlled recipe records before menu planning.
- Standard chicken recipes use boneless skinless thighs unless a controlled exception explicitly says otherwise.
- Nouman's beef remains actual 96/4 in recipe ingredients, nutrition, purchasing identity, and labels. Display grouping must never change that identity to 90/10.
- Keep private customer, bank, receipt, credential, and legal data out of the public repository.
- Preserve the current worktree. Never reset or overwrite unrelated owner changes.

## New-computer restoration

### Fastest recovery

1. Install Git, Node.js, npm, Python 3, Dropbox, Chrome, and Codex/ChatGPT.
2. Sign into the owner Dropbox and GitHub accounts.
3. Clone `getprpd-private-recovery`, or extract the private workspace ZIP into a normal local development folder.
4. Do not work directly in the same Dropbox Git folder from two computers at once.
5. Restore private ignored files from the Dropbox workspace only after confirming their dates.
6. Install dependencies with `npm ci`.
7. Read the authority files listed above.
8. Reconnect Vercel and Google through official sign-in. Restore environment values only from the owner-controlled private source.
9. Run the verification commands below.
10. Confirm the current live batch, order count, delivery date, and planner lock before using any operations tool.

### Verification commands

Run from the repository root in PowerShell:

```powershell
npm ci
python operations/nutrition/calculate_next_menu.py
python operations/nutrition/generate_next_menu_label_data.py
python operations/nutrition/verify_next_menu_labels.py
python operations/nutrition/generate_production_data.py
python operations/costing/calculate_next_menu_draft_costs.py
npm test
```

Read every failure. The October 24 recovery snapshot has known stale-test failures. Do not change production data merely to make old historical tests green.

### Git verification

```powershell
git remote -v
git branch --show-current
git status --short
git log -1 --format=fuller
git rev-parse HEAD
git ls-files -- operations/.planner-key .env.local operations/private-data operations/private-records private-records
```

The last command should return no sensitive tracked files in the public repository.

## Running the local system

The root launchers start the localhost-only operations server and open the selected tool:

| Tool | Launcher | Address | Use |
|---|---|---|---|
| Cook-Day Planner | `open-cook-day-planner.bat` | `http://127.0.0.1:4173/operations/cook-day-planner.html` | Sync current orders, review exact counts, follow Prep Day and Cook & Pack, record results, and pack by customer |
| Grocery Builder | `open-grocery-list.bat` | `http://127.0.0.1:4173/operations/grocery-list.html` | Use the same production data, subtract owner inventory, round packages, and estimate purchasing |
| Label Studio | `open-label-studio.bat` | `http://127.0.0.1:4173/operations/label-studio.html` | Generate exact-count labels from the reviewed current lock and pass physical print gates |
| Business Center | `open-business-center.bat` | `http://127.0.0.1:4173/operations/business-center` | Review orders, collections, receivables, costs, cash movement, marketing, outreach, referrals, and expenses |

Manual server start:

```powershell
node --env-file-if-exists=.env.local operations/cook-day-server.js
```

The server must remain bound to `127.0.0.1`. Do not expose the private operations server to the internet.

## How the operating system fits together

```text
Owner-approved menu and controlled recipes
        |
        v
config/order-config.js + recipe/nutrition sources
        |
        v
generated production-data.js
        |
        +--> Cook-Day Planner
        +--> Grocery Builder
        +--> Label Studio
        |
        v
Reviewed order lock and physical production
        |
        v
Packout, delivery, payment reconciliation, closeout, and measured recipe learning
```

The Cook-Day Planner and Grocery Builder must use the same generated production data. Do not patch quantities in only one UI. Change the controlled source, regenerate, and review the effect across groceries, planner, labels, macros, and costs.

## Weekly operating sequence

### 1. Menu planning

- Review the full recipe library, current controlled recipes, recent performance, allergens, nutrition, and costs.
- Distinguish tested returns from drafts and experiments.
- Show the owner a proposal before publication.
- Do not publish merely because a config file exists.

### 2. Order intake and reconciliation

- Treat live Orders and protected planner data as order authority.
- Confirm named and custom orders, current delivery date, holds, and exclusions.
- Reconcile payments from Gmail and the payment ledger using `operations/standards/PAYMENT_RECONCILIATION.md`.
- Never invent a payment confirmation or infer that a similar amount belongs to a customer.

### 3. Production lock

- Generate current nutrition, label, production, and costing data.
- Sync live orders in the planner.
- Confirm order count and meal count.
- Review custom ingredient identities, allergens, sauces, Grab & Go items, home meals, and exclusions.
- Lock only after owner review.

### 4. Grocery building

- Start from the same reviewed editable kitchen plan or approved lock. Grocery review does not itself require production locking or label printing.
- Enter what is already at home.
- Separate consumed batch cost from package purchase cash outlay.
- Round to real package sizes and keep intentional overbuy visible.
- Reconcile receipts after purchase rather than replacing requirements with receipt quantities.

### 5. Labels

- Generate from the exact current order lock.
- Verify names, counts, meal names, tier, macros, ingredients, allergens, made date, refrigeration date, QR codes, and sheet alignment.
- Do not reuse labels from another batch.
- Printing or emailing a label file requires the owner's explicit approval.

### 6. Prep, cook, and packout

- Use the reviewed planner, not an old browser tab or stale saved lock.
- Group physically compatible work, but preserve recipe-specific seasoning, allergen, nutrition, and ingredient identity.
- Record raw input, cooked yield, packed count, leftover, waste, and elapsed time for high-volume components.
- Keep cooling controls intact. Cool TCS food from 135 F to 70 F within 2 hours and to 41 F or below within 6 hours total.
- Sauce cups follow the controlled meal rule and should be visible in packout by customer.

### 7. Delivery and communication

- Verify the route and live customer instructions.
- Draft one-purpose messages that are warm, concise, and natural.
- Show recipient, channel, and exact wording for approval before sending.
- Verify delivery after a connected channel reports success.

### 8. Finance and closeout

- Record collected cash, receivables, grocery receipts, consumed direct cost, and owner-approved adjustments.
- Distinguish operating contribution from accounting profit.
- Capture physical yield failures and quality results before changing recipes, macros, labels, groceries, or costs.
- Write a dated closeout and update the current handoff.

## Historical Batch 16 boundary, October 24

The prior incident record is `operations/active/BATCH_16_COOK_DAY_OUTCOME_2026-10-24.md`. These are October 24 reported observations, not current Batch 17 quantities. Partial Tikka leftovers cannot reconstruct old excess; current owner-released Tikka uses 78 g raw chicken. Butter is not ordered this week. Historical observations:

- Protected source: 11 customer orders and 138 customer meals.
- The older 10-order, 123-meal planner lock is obsolete.
- The slider mismatch is a physical production-count incident, not proof that protected order data is wrong.
- Chicken Tikka Snack Wrap chicken was roughly double the physical need.
- Butter Chicken retained roughly 25 percent excess chicken.
- Green beans were short, rice was excessive, and quinoa was good.
- Loaded Buffalo Chicken Potato and Sweet Chili Chicken portions were good.
- Oven cooking reduced difficulty, but plating and cleanup remained the main bottleneck.
- Do not convert these estimates into recipes, labels, macros, groceries, or costs until the recorded closeout measurements are collected.

## Backup maintenance

After a major website, recipe, batch, finance, or operating change:

1. Update the dated handoff and current controlled records.
2. Push privacy-safe application changes to the public repository only after a secret/privacy scan and appropriate tests.
3. Push owner-only documentation to the private recovery repository.
4. Allow the Dropbox workspace mirror to finish syncing.
5. Create a new dated private workspace archive and Git bundle at meaningful checkpoints.
6. Refresh the Codex point-in-time snapshot after important long sessions or at least weekly during active operations.
7. Keep the laptop awake and online until Dropbox web shows the expected files and sizes.
8. Never use backup work as implicit authorization to deploy or communicate externally.

## Exact archive hashes

- `GETPRPD-public-repo-e69d8b6.bundle`
  - SHA-256: `5CFE30B522487577B982809933BA3602BB3B91641AD1C8F65D26D9236EE31E0D`
- `GETPRPD-private-workspace-2026-10-24.zip`
  - SHA-256: `39B6E0A5805BCDEDF74FC2ECAE1F3EB0FAD12CB70D119F4ACDE29D5593FB15E3`

## Prompt for a fresh Codex session

> Read `AGENTS.md`, the complete Food skill, this handbook, `operations/active/HANDOFF_2026-10-29.md` and `operations/active/CURRENT_MENU_COOK_RECORD.md`. Read the latest planner/grocery proof and CSV at the outputs path above. Continue from 98 portions: 92 customer/family and 6 Home. Keep wrap chicken Friday; the Thursday move was rejected. Preserve pantry/package choices, standing family label exemptions and physical holds. Use the latest handoff for Ads/finance; do not reopen bank investigation, duplicate sent outreach or publish draft ads from old notes. Carry forward authorization already granted and ask only for genuinely missing decisions.

## Final recovery checklist

- [ ] Open the owner-only Dropbox recovery folder.
- [ ] Read this guide and the current handoff.
- [ ] Restore the private repository or workspace ZIP.
- [ ] Verify archive hashes if an archive is used.
- [ ] Install dependencies and run the controlled verification commands.
- [ ] Restore private configuration without committing it.
- [ ] Sign into all services through official applications.
- [ ] Confirm the live batch, order count, payment state, planner lock, label queue, and website state.
- [ ] Keep private data out of the public repository.
- [ ] Obtain a separate 1 TB or larger drive before creating a full Windows system image.
