# GETPRPD emergency recovery manifest

Created October 24, 2026. This is an owner-only disaster-recovery record. It does not authorize a production deployment, customer communication, payment change, order change, or recipe change.

## Recovery locations

### Public application source

- Repository: `https://github.com/getprpd-sudo/getprpd-website-repo`
- Recovery branch: `codex/security-operations-hardening`
- Verified remote commit: `e69d8b6ffd07a273ccd8e2c6f9f14e4b05040d09`
- Commit message: `Emergency backup: publish current public website snapshot`
- Scope: privacy-safe website and application source only.
- Important: this commit is a recovery snapshot, not a verified production release and not a Vercel deployment.

### Private source and operating knowledge

- Private repository: `https://github.com/getprpd-sudo/getprpd-private-recovery`
- Visibility verified in GitHub as: `Private`
- Intended branch: `main`
- Base recovery snapshot commit: `fb26aab25be2cb34f2b0d4df2005159b2b3e9907`
- Scope: application source, repository instructions, dated handoffs, controlled operating records, finance/relationship/governance documentation, recipes, and portable Codex knowledge.
- Deliberate exclusions: credentials, `operations/.planner-key`, `.env*`, Codex authentication, raw private-record folders, raw source receipts/reference evidence, generated archives, and large media. Those belong only in the owner-controlled Dropbox recovery copy.

### Owner-only Dropbox recovery

- Cloud folder: `/GETPRPD Recovery/2026-10-24`
- Full local mirror: `C:\Users\aazim\Dropbox\GETPRPD Website`
- No public shared link was created.
- Start with `/GETPRPD Recovery/2026-10-24/RECOVERY_START_HERE.md`.

## Verified archives

| Archive | Size | SHA-256 | Purpose |
|---|---:|---|---|
| `GETPRPD-public-repo-e69d8b6.bundle` | 503,351,382 bytes | `5CFE30B522487577B982809933BA3602BB3B91641AD1C8F65D26D9236EE31E0D` | Complete Git bundle for the public repository history and refs. |
| `GETPRPD-private-workspace-2026-10-24.zip` | 595,013,761 bytes | `39B6E0A5805BCDEDF74FC2ECAE1F3EB0FAD12CB70D119F4ACDE29D5593FB15E3` | Owner-only workspace snapshot, including ignored operating evidence and media. |

Both archives were validated locally. `git bundle verify` accepted the bundle as complete. The ZIP central directory was read successfully and key recovery files were confirmed present.

Security warning: the private workspace ZIP contains sensitive owner-only operational state, including the local planner key. Keep it inside the owner-controlled Dropbox account. Do not attach it to email, publish it, or add it to GitHub.

## Codex recovery boundary

Portable, non-secret Codex knowledge is stored with this recovery set:

- `AGENTS.md`
- `.codex/Skills/Food skill/SKILL.md`
- `RECOVERY_START_HERE.md`
- `operations/active/PRPD_PORTABLE_RECOVERY_2026-10-24.md`
- `operations/active/HANDOFF_2026-10-24.md`
- `operations/active/BATCH_16_COOK_DAY_OUTCOME_2026-10-24.md`
- a private copy of the current Codex `config.toml`

The owner-only `/GETPRPD Recovery/2026-10-24/Codex-Full` snapshot was completed locally at 11,521,458,223 bytes. It includes 138 session files totaling 8,289,293,404 bytes, archived sessions, attachments, generated images, dictation history, plugins, custom skills, visualizations, global state, indexes, and eight SQLite database snapshots. Every database passed `PRAGMA quick_check`; no copied JSONL file required tail repair. `BACKUP_COMPLETE.json` and `SHA256SUMS.csv` record the snapshot.

Dropbox cloud verification confirmed the complete 8,289,293,404-byte session directory and the complete database snapshot set, including the 2,085,994,496-byte thread-history database. Generated visualization files continued syncing after the essential transcripts and databases were already cloud-visible.

Codex authentication files, access tokens, refresh tokens, sandbox secrets, caches, and machine runtimes were deliberately excluded and must not be copied to GitHub. Sign in again on a replacement computer.

The definitive owner-and-AI operating map is `PRPD_MASTER_RECOVERY_AND_OPERATIONS_GUIDE_2026-10-24.md`.

## Verification state

- Public Git remote and local recovery commit match at `e69d8b6ffd07a273ccd8e2c6f9f14e4b05040d09`.
- Public snapshot privacy scan found no customer/contact records or real high-confidence secrets.
- Private Git snapshot contains 819 files. Before adding this manifest it contained 818 files and 106,166,473 bytes. No file exceeds GitHub's 100 MB limit.
- The base private snapshot was pushed successfully to `origin/main`; remote verification must match the commit above or the later manifest-only commit that records it.
- Private Git exclusions were checked for `.planner-key`, `.env*`, auth JSON, raw private-record folders, raw receipt/reference folders, and `output`; none were staged.
- The only high-confidence private-index secret-pattern hit is the intentional private-key test fixture in `tests/security.test.js`.
- Full current test run is not green: 561 tests total, 367 passed, 67 failed, 127 skipped. The public-focused subset had 129 tests, 112 passed and 17 failed. Known failures reflect stale historical Batch 14 assumptions versus current Batch 16 data plus a sodium expectation. Treat the snapshot as recoverable source, not a release candidate.

## Windows recovery status

No full-machine image is currently verified. The laptop has one internal 512 GB drive with about 435 GB used and only about 41.8 GB free. File History is not configured, and there is no external or network backup target attached. Dropbox/OneDrive do not constitute a Windows system image.

For a true PC image, attach a separate 1 TB or larger USB HDD/SSD, validate its exact drive letter and free space, then create the image from an elevated Administrator session. Never place a Windows image on the same internal drive or inside the Dropbox folder on that drive.

## Restore order

1. Open `RECOVERY_START_HERE.md` and the portable recovery guide.
2. Clone the private recovery repository for source and working knowledge, or restore the owner-only workspace ZIP from Dropbox.
3. Verify each downloaded archive against the SHA-256 values above.
4. Restore credentials only from the owner-controlled private backup. Never infer or recreate them from chat.
5. Install Git, Node.js/npm and Python, then run the documented generation and verification commands.
6. Reconnect GitHub, Dropbox, Gmail, Google Voice, Google Sheets and Vercel using the intended PRPD accounts.
7. Confirm the current batch, live order data and planner lock before using any operational tool.
8. Do not deploy or contact anyone merely because restoration succeeded.

