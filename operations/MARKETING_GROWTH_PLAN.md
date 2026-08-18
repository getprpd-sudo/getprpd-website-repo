# PRPD Capacity-Controlled Growth Plan

Updated: July 22, 2026

PRPD's marketing goal is not maximum traffic. It is profitable, serviceable, local first-paid orders that become repeat customers. All channel decisions must be constrained by weekly kitchen capacity.

## Current Baseline

- Current operating batch: 10 orders and 126 customer meals.
- Recorded base order revenue: $1,555.
- Modeled food, packaging, and consumables used: approximately $495.42 before delivery fuel, owner labor, and unrecorded overhead.
- Modeled cash contribution after the standard 65-mile delivery fuel estimate: approximately $1,051.18 before owner labor and unrecorded overhead.
- Working average base revenue per order: approximately $156; this is elevated by Talal's large manual order and should not be treated as a normal-customer guarantee.
- The completed TikTok campaign was the reported source of PRPD's major customer-growth step. Final acquisition cost still requires the campaign's total spend matched to first paid orders.

The contribution figures above include the current manual and promotional order mix. They are planning references, not a promise that every new customer produces the same contribution.

## Measurement Hierarchy

Evaluate every channel in this order:

1. First paid orders.
2. Qualified leads who are in the delivery area and can afford the service.
3. Repeat paid orders.
4. Collected revenue and contribution after acquisition cost.
5. Raw leads.
6. Landing-page views, clicks, views, and likes.

Do not call a campaign successful from clicks or form submissions alone.

## Growth Tracking Now Implemented

- The weekly order page captures UTM source, medium, campaign, content, term, first landing page, and referrer.
- Approved partner codes are validated and priced by `/api/order`; client-submitted discount totals are ignored.
- Orders store the code, partner, discount, and attribution in canonical Google Sheets columns Q:AC.
- The customer may explicitly opt in to weekly-menu email. The checkbox is off by default and the consent result is stored with the order.
- A successful durable order fires TikTok `PlaceAnOrder`. A successful intake fires one canonical TikTok `Lead` event.
- The browser Pixel and server Events API use the same stable `event_id`, so TikTok can deduplicate the two copies of the same conversion.
- TikTok browser identifiers (`_ttp` and `ttclid` when available), request IP, user agent, page URL, and referrer are sent for attribution. Raw customer email and phone are not sent by default. Hashed advanced matching remains opt-in through a server environment variable.
- TikTok delivery is fail-soft: an Events API outage cannot block a lead, order, Google Sheets write, or receipt email.

This closes the old measurement gap between a click or lead and the order that actually reaches production. Amount collected and repeat status still need reconciliation in the weekly closeout.

## Partner + Referral Operating Rule

Use fixed-dollar codes for the first controlled test. Example configuration: `SANA15` gives the customer $15 off and records partner `Sana`. Do not describe it as 15% if the benefit is $15.

Each creator or partner receives one link and matching QR:

`https://getprpd.com/order?ref=SANA15&utm_source=referral&utm_medium=partner&utm_campaign=partner_referrals&utm_content=sana`

The QR is simply a scannable version of that URL. Put it in a delivery bag insert, creator post, gym card, or mosque-approved display. The code prefills on checkout and the complete source is recorded with the order.

For the first test:

1. Approve only one to three partners.
2. Give each partner a unique code and URL.
3. Set an expiry after the promotion window.
4. Reconcile code redemptions only after payment is collected.
5. Measure first paid orders, collected revenue, direct food cost, discount cost, and repeat orders.
6. Do not add a separate ambassador payout unless its amount and trigger are agreed in writing.

A $15 customer discount is acquisition spend. With a $60 pre-discount minimum, the smallest qualifying order can fall to $51.99 after delivery and discount, so the code must be judged against repeat value rather than order count alone.

## Weekly Menu Email

Consent capture is live, but automated marketing sends remain intentionally disabled until PRPD supplies a business postal address for the footer and a working unsubscribe workflow. Transactional order receipts continue normally and do not enroll customers.

Once those two requirements are ready, send one menu-open email and at most one cutoff reminder per weekly cycle. Do not email customers whose latest consent is not `Yes` or who opted out.

## Automation Architecture

Automation should prepare, measure, and reconcile work. It should not publish ads, change budgets, or send promotional messages without Rida's review.

### Working now

- Orders, leads, attribution, partner codes, menu-email consent, payments, direct-cost estimates, and consolidated collection requests feed the private Business Center.
- Current Orders sync live into Cook-Day Planner and Grocery Builder.
- Historical Orders, Payment Log, Website Leads, and Accounts Receivable are available in the secured local reporting snapshot.
- TikTok Ads campaign CSV reports can be imported without sharing an ad-account token.
- A protected, read-only TikTok Marketing API reporting endpoint and Business Center sync control are implemented. They activate only after server-side advertiser credentials are configured; CSV remains the fallback.
- Browser Pixel plus server-side `Lead` and `PlaceAnOrder` Events API delivery are configured and production-verified, including shared event-ID deduplication. The access token is stored only in Vercel.
- Resend sends transactional order confirmations; these are separate from marketing consent.

### Next connection: menu email

Use Resend Contacts, a `Weekly menu` Topic, and a consented-customer Segment. Generate a draft when the menu opens, send a test to Rida, and require manual approval before the Broadcast is scheduled. Every promotional email must use accurate sender information, a business postal address, and Resend's unsubscribe URL. One menu-open email and one optional cutoff reminder are the operating maximum.

### TikTok activation and verification

1. Browser Pixel and server Events API are active for `Lead` and `PlaceAnOrder`; test events were accepted by TikTok on July 22, 2026.
2. Keep `PlaceAnOrder` for submitted orders while PRPD collects payment later through Zelle. Do not report `Purchase` or `CompletePayment` until a payment is actually confirmed and tied to the order.
3. Rotate the Events API token because it was once pasted into chat, then replace the encrypted Vercel value without committing it to the repository.
4. Create and authorize a TikTok for Business developer app for read-only Marketing API reporting. Store the token and advertiser ID only as `TIKTOK_MARKETING_ACCESS_TOKEN` and `TIKTOK_ADVERTISER_ID` in Vercel.
5. Use the Business Center's date-range API sync and compare its first report with the matching Ads Manager export. CSV remains available as a controlled fallback.
6. Do not permit automatic campaign creation, targeting changes, budget changes, or ad publishing in the first version.

## PRPD AI Operating System

The complete staged architecture and build sequence are maintained in `PRPD_AUTOMATION_ROADMAP.md`.

AI is best used for work that requires reading, comparing, prioritizing, or drafting. Deterministic automation should handle exact triggers and calculations. The operating rule is: **AI drafts and flags; Rida approves and acts.**

This approach matches the practical pattern found in current small-business guidance and operator discussions: start with a narrow workflow, verify that it saves time or improves a measurable outcome, and keep a person responsible for consequential decisions. Operators repeatedly report value from email triage, follow-up drafting, reporting, and content planning, while generic auto-posting and unsupervised customer chat often sound artificial or create incorrect answers. Forum reports are anecdotal rather than controlled evidence, so PRPD should validate every automation against its own weekly numbers.

### Highest-value work now

1. **Weekly operator brief:** summarize booked orders, paid and outstanding balances, production capacity, channel attribution, and exceptions in one review.
2. **Lead follow-up queue:** identify unreplied or aging leads, summarize their goals and source, and draft a personal response for Rida to approve. Do not auto-send yet.
3. **Ad analyst:** combine TikTok spend and campaign metrics with PRPD leads, orders, payments, direct cost, repeat orders, and capacity. Flag weak landing-page conversion, high acquisition cost, and creative fatigue; never change spend automatically.
4. **Real-content engine:** turn PRPD's real cooking footage, customer questions, and batch notes into hook options, shot lists, captions, and platform-specific edits. Never generate fake food or customer proof.
5. **Customer-feedback analyst:** group reviews, order notes, and replies into taste, portion, delivery, menu, and service themes; surface repeated issues and recipe opportunities.
6. **Production variance analyst:** compare planned versus actual raw weight, cooked yield, portions, waste, time, and purchase price so the recipe, grocery, and costing systems improve each batch.

### Build after the current systems have clean data

- Consented weekly-menu email drafts with a test-send and Rida approval gate.
- Win-back lists for customers who skipped two or more menus, with personal draft messages instead of generic spam.
- Referral and creator ROI reporting based on paid first orders and repeats, not link clicks alone.
- A creative library tagged by hook, dish, audience, format, organic result, paid result, and reuse rights.
- Capacity forecasting that recommends how many new customers PRPD can accept before advertising spend is approved.

### Do not automate yet

- Customer promises about allergies, medical outcomes, delivery exceptions, refunds, or payment disputes.
- Publishing ads, changing budgets, or choosing winners without a human review.
- Sending marketing email or text without documented consent and opt-out handling.
- Changing recipes, nutrition, menu prices, customer orders, or production counts from an AI suggestion alone.
- Creating artificial reviews, fake food images, fake customer messages, or mass cold outreach.

### Weekly reviewed workflow

1. Menu is approved and opened.
2. System prepares a consented-customer menu-email draft.
3. Rida reviews and sends or schedules it.
4. TikTok/Meta/partner attribution flows into orders and leads.
5. After cutoff, production tools freeze the approved order set.
6. After delivery, payments and expenses are reconciled and the Business Center reports channel-to-paid-order performance.

Vercel Cron can later prepare daily snapshots or reminder drafts. Cron-triggered actions must use a secret, be idempotent, and never send the same campaign twice. On Vercel Hobby, scheduled jobs are limited to daily frequency and may run at any point within the configured UTC hour.

## Google Local Discovery

"Adding PRPD to Google" means creating and verifying a Google Business Profile as a service-area business. Hide a residential address, define the actual DFW service area, add `https://getprpd.com/order` as the order URL, keep hours/menu/photos current, and request honest reviews from real customers without incentives.

Google explains that local visibility is driven mainly by relevance, distance, and prominence. A complete profile, accurate service area, real food photos, and legitimate reviews support those factors; no profile setup can guarantee ranking.

## Budget Guardrail

At $20 per day, one seven-day channel test costs $140:

- 3 first paid customers = $46.67 acquisition cost each.
- 5 first paid customers = $28 acquisition cost each.
- 7 first paid customers = $20 acquisition cost each.

At $60 per day across three platforms, a seven-day test costs $420. At a $30 acquisition target, PRPD would need 14 new paid customers in one week. That is not aligned with the current 11-customer production scale unless capacity is intentionally being doubled.

Initial management target: keep paid customer acquisition cost at or below approximately $30. Treat $45 as a review threshold until repeat-order data proves a higher lifetime value. Set the weekly ad budget from the number of new customers the kitchen can accept, not from the maximum each platform will spend.

## Recommended Test Sequence

### Test 1: TikTok Objective Test

- Finish the current traffic campaign on the planned date without editing it during its final measurement window.
- Record total spend, website leads, qualified leads, first paid orders, and repeat customers attributed to it.
- Build the next TikTok campaign as Website Lead Generation / Website Conversion using the installed Pixel and the canonical `Lead` event.
- Use the proven original Spark post as the control creative. A new video is a challenger, not a guaranteed replacement.
- Keep the budget at $20 per day for seven days and avoid major changes during the test.
- If website lead volume is too low for stable conversion optimization, compare the result with the prior Landing Page View campaign rather than forcing a higher budget.

TikTok's current guidance distinguishes Traffic / Landing Page View from Website Lead or Conversion campaigns and requires a Pixel for website conversion optimization. TikTok also recommends avoiding major changes during a learning period and notes that conversion campaigns need materially more conversion volume than PRPD currently guarantees.

### Test 2: Meta, Not Separate Facebook and Instagram Budgets

- Facebook and Instagram should run as placements inside one Meta Leads campaign, not as two independent $20 daily campaigns.
- Start with one combined $20 daily campaign using Website as the conversion location.
- Install and verify Meta Pixel before spending. Add Conversions API later for more reliable server-side lead measurement.
- Keep Advantage+ placements so Meta can distribute the budget between Instagram, Facebook, Reels, Stories, and Feed.
- Use broad local eligibility controls: serviceable DFW geography, age 18+, and all genders. Let the halal, high-protein creative qualify the audience rather than building fragile interest stacks.
- Use two or three creatives: the proven food/process video, a Rida/founder explanation, and a customer or creator result story.
- Never use a TikTok-watermarked export as the Meta master creative.

Do not launch Meta and a new TikTok objective on the same day unless PRPD intentionally accepts that channel learning will be harder to interpret.

### Test 3: Google Search Later

- Claim and complete the free Google Business Profile first.
- Install Google Ads conversion tracking before paid search.
- Start with Search only; do not begin with Display or Performance Max.
- Use high-intent exact and phrase themes such as halal meal prep DFW, halal meal prep Dallas, high protein meal prep Frisco, and meal prep delivery near me.
- Target people physically present or regularly present in the actual service area; review Google's advanced location option so mere interest in DFW does not spend the budget.
- Add negative terms such as free, recipe, jobs, salary, wholesale, and catering when they are not part of the offer.
- Begin only after TikTok or Meta has a measured acquisition baseline and PRPD has capacity for additional orders.

## Physical and Community Marketing

Priority order:

1. Add a referral insert to every paid delivery. Issue the reward only after the referred customer's first paid order. A $10 future-order credit is cheaper and easier to measure than an untracked discount.
2. Trial Islamic Center of Frisco's in-masjid digital signage. Its published offer is $200 per month for four displays and directly reaches the Frisco Muslim community. Use a unique QR code and UTM source; the required creative is 1920 x 1080 and must respect its no-people guideline.
3. Arrange small approved sampling partnerships with local gyms, trainers, mosque programs, MSAs, and community events. Give every partner a unique QR or referral code.
4. Ask satisfied repeat customers for an honest Google review. Do not pay for positive reviews or screen out negative reviewers.
5. Use targeted apartment or gym sampling only after a named manager agrees to distribute it. Avoid broad untracked flyer drops.
6. Delay large event booths and Every Door Direct Mail until the referral, signage, and partner channels have measured conversion rates.

Every offline QR should use a unique source, for example:

`https://getprpd.com/?utm_source=icf&utm_medium=offline&utm_campaign=frisco_masjid_july`

## Creative Rules

- First two seconds: state the problem and location, such as `DFW halal meal prep that actually fits your macros.`
- Show real PRPD food, packing, labels, cooking, and delivery. Do not use stock or AI food.
- Prove the offer: halal, measured macros, fresh delivery, actual meals, and a real person behind the business.
- Use one call to action: complete the intake at `getprpd.com`.
- Build reusable footage, but edit natively for each platform.
- Keep the winning ad as a control while testing one major change at a time: hook, offer, creator, objective, or channel.

## Required Tracking Before Scaling

- Add `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content` to every paid or offline link.
- Record lead source, first paid order, amount collected, and repeat status in the weekly closeout.
- Add Meta Pixel before Meta spend.
- Add Meta Conversions API only after the browser Pixel and lead event are verified.
- Add Google conversion tracking before Google Ads.
- Keep deduplicated TikTok Pixel plus Events API `Lead` and `PlaceAnOrder` verification in the campaign launch checklist.

## Current Recommendation

The first TikTok campaign is complete and proved that paid social can acquire PRPD customers. Do not restart it merely to generate more views. Preserve its final spend and paid-customer result as the control benchmark.

Recommended next sequence:

- Launch the partner-code test first with one to three local creators and no more than one offer structure.
- Create and complete the free Google Business Profile; begin requesting honest reviews from fulfilled repeat customers.
- Build one combined Meta campaign for Facebook and Instagram only after Meta Pixel lead/order events are verified. Start at $20/day for seven days if the kitchen has declared room for the resulting customers.
- Run a new TikTok campaign only with a defined hypothesis, such as a new creator, offer, or conversion objective. Do not change all three at once.
- Defer Google Ads until the Business Profile, search conversion tracking, and a measured target acquisition cost are ready.
- Keep total acquisition spend constrained by the number of additional weekly customers PRPD can produce and deliver without lowering quality.

## Research Sources

- TikTok new-advertiser campaign objectives: https://ads.tiktok.com/help/article/how-to-create-an-ad-in-tiktok-ads-manager-for-new-advertisers
- TikTok conversion objective and Pixel requirement: https://ads.tiktok.com/help/article/conversions-objective
- TikTok traffic campaign guidance: https://ads.tiktok.com/help/article/best-practices-for-getting-started-with-traffic-campaigns
- TikTok creative guidance: https://ads.tiktok.com/business/en-US/blog/creative-best-practices-top-performing-ads
- Meta Advantage+ leads: https://www.facebook.com/business/ads/meta-advantage-plus/leads
- Meta Conversions API: https://www.facebook.com/business/help/AboutConversionsAPI
- Google conversion tracking: https://support.google.com/google-ads/answer/6308
- Google geographic targeting: https://support.google.com/google-ads/answer/2453995
- Google keyword list guidance: https://support.google.com/google-ads/answer/10039665
- Google Business Profile: https://support.google.com/business/answer/7039811
- Google local ranking factors: https://support.google.com/business/answer/7091
- Google service-area business settings: https://support.google.com/business/answer/9157481
- Google review policies and review link: https://support.google.com/business/answer/3474122
- FTC CAN-SPAM compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- TikTok Events API: https://ads.tiktok.com/help/article/events-api?lang=en
- TikTok Events API setup: https://ads.tiktok.com/help/article/getting-started-events-api?lang=en
- TikTok event deduplication: https://ads.tiktok.com/help/article/event-deduplication?lang=en
- TikTok website data connection methods: https://ads.tiktok.com/help/article/website-data-connection-setup-methods?lang=en
- TikTok Creative Center trends: https://ads.tiktok.com/help/article/how-to-use-trends?lang=en
- TikTok Creative Center overview: https://ads.tiktok.com/help/article/creative-center
- TikTok Symphony creative AI suite: https://ads.tiktok.com/business/en-US/blog/tiktok-symphony-ai-creative-suite
- TikTok API for Business: https://business-api.tiktok.com/portal
- TikTok standard web events: https://ads.tiktok.com/help/article/standard-events-parameters
- Meta Advantage+ creative: https://www.facebook.com/business/ads/meta-advantage-plus/creative
- SBA AI for small business: https://www.sba.gov/business-guide/manage-your-business/ai-small-business
- Small-business operator discussion on useful versus generic AI automation: https://www.reddit.com/r/smallbusiness/comments/1rfbwih/are_you_actually_using_ai_in_your_business/
- Small-business operator discussion on marketing and sales automation outcomes: https://www.reddit.com/r/smallbusiness/comments/1r9sfhg/small_business_owners_what_ai_tools_are_actually/
- Resend Contacts and marketing preferences: https://resend.com/docs/dashboard/audiences/introduction
- Resend Broadcasts: https://resend.com/docs/dashboard/broadcasts/introduction
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
- Islamic Center of Frisco in-masjid advertising: https://friscomasjid.org/forms/in-masjid-advertisements
