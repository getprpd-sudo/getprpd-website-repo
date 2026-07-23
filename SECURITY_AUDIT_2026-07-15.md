# PRPD Production Security Audit

Status: hardening deployed and verified on `codex/security-operations-hardening`
Audit date: July 15, 2026
Production project: `rida-khan-s-projects/getprpd`

## Recovery checkpoint

- Git branch created before hardening: `codex/security-operations-hardening`.
- The existing dirty working tree was preserved; no user files or data were deleted.
- Google Sheets data is not modified by this audit.
- The obsolete Vercel project is preserved as a rollback artifact until the owner approves removal.

## Current architecture

- Public frontend: static `index.html`, `order.html`, `faq.html`, `style.css`, `script.js`, public menu configuration, fonts, and public images.
- Public anonymous APIs: `api/lead.js` and `api/order.js`.
- Private read-only API: `api/planner-orders.js`, protected by a server-side planner key.
- Private operations: the entire `operations/` directory and local launchers. These are excluded from Vercel by `.vercelignore`.
- Trusted services: Vercel Functions, encrypted Vercel environment variables, Google Sheets API, and Resend.
- There is no login, session cookie, card-payment collection, file upload, or public administration interface.

## Public/private boundary

### Intended public files

- `index.html`, `faq.html`, `order.html`
- `style.css`, `script.js`, `config/order-config.js`
- `assets/`, `fonts/`, `favicon.ico`, `robots.txt`, `sitemap.xml`
- `api/lead.js`, `api/order.js`, and the authenticated response surface of `api/planner-orders.js`
- `vercel.json`, `package.json`, and production dependencies required by Vercel

### Private or development-only files

- `operations/` and both `open-*.bat` launchers
- local `.vercel/` linkage
- service-account JSON files, API-key text files, `.env*`, and `operations/.planner-key`
- internal recipe documents, nutrition calculations, production records, tests, and historical Apps Script files

`.gitignore` and `.vercelignore` currently separate these classes. Deployment exposure tests remain required after every deployment.

## Initial findings

### Critical

None confirmed.

### High

None confirmed.

### Medium

1. Anonymous lead and order endpoints initially lacked durable edge rate limiting. Repeated requests could create Sheets writes and email sends. Application code alone cannot provide reliable global rate limiting across stateless serverless instances.
   - Files: `api/lead.js`, `api/order.js`
   - Resolution: Vercel firewall rule `Public form rate limit` is live and enabled for `/api/lead` and `/api/order`, allowing 30 requests per 60 seconds per source IP and denying excess requests.

2. The APIs accept more object fields and option values than necessary. Server-owned prices and totals are already recalculated correctly, but strict request schemas reduce ambiguity and attack surface.
   - Files: `api/lead.js`, `api/order.js`
   - Resolution: implemented allowlisted top-level/item keys, strict object validation, allowed option sets, quantity limits, and explicit Lean/Bulk/Single tier validation.

3. Cross-site browser requests are not explicitly rejected. CORS is not authentication, but an origin/fetch-metadata check reduces browser-based spam and cross-site form abuse.
   - Files: `api/lead.js`, `api/order.js`
   - Resolution: implemented production/local/preview origin validation and Fetch Metadata rejection for cross-site browser requests while preserving same-origin and non-browser recovery requests.

### Low

1. Existing security headers did not include a Content Security Policy, `frame-ancestors`, Cross-Origin-Opener-Policy, or Cross-Origin-Resource-Policy.
   - File: `vercel.json`

2. Error logging could pass complete third-party error objects to Vercel logs. No request body was logged, but diagnostic logging needed to be reduced to safe metadata.
   - Files: `api/lead.js`, `api/order.js`, `api/planner-orders.js`

3. Frontend honeypot protection existed for the intake form but was not enforced by the server. The order form did not have equivalent lightweight bot friction.

All three low-severity findings are resolved. `vercel.json` now sends CSP, COOP, CORP, expanded Permissions Policy, and cross-domain policy headers. API and planner errors use redacted name/code/status logging. Both public forms send honeypot and form-start timing signals that are enforced before any Sheets or email operation.
   - Files: `index.html`, `script.js`, `order.html`, `api/lead.js`, `api/order.js`

### Informational

- Server-side order pricing, delivery fee, minimum order, cutoff, quantities, item availability, and totals are already authoritative.
- Order and lead IDs provide idempotency; Resend also receives an order idempotency key.
- Sheets writes use `valueInputOption=RAW`, preventing spreadsheet-formula execution from submitted text.
- Request content type and body size are already checked.
- HTML email values are escaped.
- Production dependencies currently report zero known npm vulnerabilities.
- No literal private credential was confirmed in the current source. Historical Google Apps Script deployment URLs are public endpoint identifiers, not authentication secrets.
- The obsolete Vercel project `getprpd-website-repo` contains five old static deployments, no current domains, no production environment variables, and no active backend configuration. It is preserved for rollback review.

## Sensitive values found (redacted)

- Google service-account credential: private secret, stored only in encrypted Vercel environment variables and ignored local files.
- Resend API key: private secret, stored only in encrypted Vercel environment variables and ignored local files.
- Planner key: private secret, stored in encrypted Vercel environment variables and an ignored local file.
- Google Sheet ID: restricted identifier, server-side only in the current architecture. Access still depends on Google sharing permissions.
- TikTok Pixel ID: public/restricted public identifier expected in frontend code.
- Historical Apps Script URLs: public endpoint identifiers; retained only as rollback history.

## Platform limitations

- Vercel platform DDoS protection is automatic, but application-specific request limits require a WAF rule or another shared rate-limit store.
- Anonymous forms cannot prove that every submitter is human. Honeypots, timing checks, validation, idempotency, and rate limits reduce abuse but do not eliminate it.
- Google Sheet and Drive sharing permissions must be reviewed in Google; source code cannot enforce account-level sharing policy.

## References

- OWASP REST Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- Vercel Firewall: https://vercel.com/docs/vercel-firewall
- Vercel WAF rate limiting: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting

## Verification completed

- The latest July 15 production deployment completed successfully and was aliased to `https://getprpd.com`.
- Node API/config/security/planner test suite passes: 45/45.
- Nutrition generation and calculation tests pass: 11/11.
- Production dependency audit reports no known vulnerabilities.
- Label Studio browser check confirms 15 categorized meals, 27 selectable variants, 27 generated Avery sheets, and 108 labels when Select All is used.
- Cook-Day Planner browser check confirms 6 live orders, 60 customer meals, one shared PRPD extra per selected dish, 74 total production servings, 60 customer-only labels, grouped component pulls, and generated Thursday and Friday workflow stages.
- Vercel reports the firewall rule enabled in the live configuration.
- Live homepage, order, and FAQ routes return HTTP 200 with CSP, HSTS, COOP, CORP, and the remaining configured security headers.
- Live `/api/order` and `/api/lead` reject GET with HTTP 405; `/api/planner-orders` rejects missing authorization with HTTP 401.
- Internal planner, tests, audit docs, README, and legacy Apps Script paths return HTTP 404. The legacy `/operations/label-studio.html` compatibility rewrite returns the public homepage and exposes no Label Studio data.
- The live order page renders 15 dish cards, 10 explicit later-week badges, storage guidance, and no browser console errors.

## Rollback

1. Code rollback: redeploy the previous known-good Vercel deployment or revert this branch's hardening changes.
2. Firewall rollback: run `vercel firewall rules list`, remove or disable `Public form rate limit`, review `vercel firewall diff`, then publish the change.
3. Do not delete or modify Google Sheets rows as part of a code rollback.
4. Do not rotate Google/Resend/planner secrets unless exposure is suspected; no source exposure was confirmed in this audit.
5. The obsolete `getprpd-website-repo` Vercel project is preserved but should not receive normal production deployments.

## July 21, 2026 re-audit

### Resolved high finding: customer spreadsheet link sharing

The production spreadsheet `Get Started With PRPD (Responses)` previously allowed `Anyone with the link: Viewer`. That access has been removed. The permission list was rechecked on July 21, 2026 and now contains only:

- `getprpd@gmail.com` as owner
- `prpd-vercel-orders@prpd-website.iam.gserviceaccount.com` as editor for production order and lead writes

No `anyone` permission remains. Customer data is no longer link-accessible.

Status: **resolved and verified July 21, 2026**.

### Reverification results

- Full automated test suite passes: 84/84.
- Production dependency audit reports zero known vulnerabilities.
- Live security headers remain present on the homepage, order page, and FAQ page.
- Live public APIs reject unsupported GET requests with HTTP 405.
- The private planner API rejects missing authorization with HTTP 401 and accepts the configured planner credential.
- Internal operations pages, README, audit documents, `.env`, and service-account filename probes return HTTP 404 in production.
- The Vercel firewall rule `Public form rate limit` remains enabled for `/api/order` and `/api/lead` at 30 requests per 60 seconds per source IP.
- No committed credential or current local secret file was found. Local planner credentials remain ignored by Git.
- A public privacy policy now explains the information PRPD collects, why it is used, the service providers involved, and how customers can request correction or deletion.
- Public inline scripts, styles, and event handlers were moved to external files. The Content Security Policy no longer permits `'unsafe-inline'` and explicitly blocks script and style attributes.

### Remaining defense-in-depth work

- Confirm the Google, Vercel, and Resend accounts use two-step verification or passkeys and have current recovery information.
- Confirm production secrets are stored as Vercel Sensitive Environment Variables and never pasted into source files or support messages.
- Recheck Google Sheet sharing, Vercel environment variables, firewall rules, dependency audit results, and public security headers after major infrastructure changes.

## Final risk statement

No critical or high-severity issue remains open from this audit. The customer spreadsheet is Restricted, the public site has a privacy policy, and the browser policy no longer permits inline scripts or styles. Strict schemas, server-owned business rules, same-site checks, bot traps, idempotency, RAW Sheets writes, redacted logs, platform DDoS protection, and the live per-IP rate limit provide appropriate defense in depth for the current small-business traffic level. Account two-step verification and periodic permission reviews remain operational responsibilities.
