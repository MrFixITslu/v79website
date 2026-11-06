# V79 Digital — Hybrid Website Redesign Review

**Date:** 6 November 2026, Saint Lucia
**Decision:** Approved hybrid: Trusted Technology Partner + interactive solution finder + Inside V79.
**Release gate:** HOLD. No merge and no deployment.

## 1. Brief and implementation

The approved direction uses the original logo, light-first brand, plain-English services and regional software positioning. The primary audiences are Saint Lucia SMEs needing ICT support and Caribbean businesses exploring V79 software.

- New HybridHomePage: hero, who-we-help, business needs selector, six linked service cards, Why V79, four-step process, Tiquet interactive explanation, resources, FAQ and final CTA.
- siteOfferings: six detailed service definitions, V79 Hub and Tiquet product content, audiences, scoped capabilities, processes, FAQs and unique SEO metadata.
- OfferingPages: six dedicated service URLs, /software overview, /software/hub and /software/tiquet.
- Simplified navigation and footer links; existing legacy sections and resources remain.
- ContactPage recognises a strict allowlist of topic presets. It uses the original server validation, CAPTCHA, idempotency and CRM delivery.
- Server SEO: unique titles, canonical URLs, readable no-JavaScript fallback, route allowlist and runtime/static sitemap updates. llms.txt and homepage metadata updated.
- About: only genuine founder details, no unconfirmed vacancies or generic profile; unconditional reporting guarantees removed.
- Brand contrast: darker teal for light-background text and CTAs.

## 2. Truth and trust register

No fabricated testimonials, customer outcomes, fake product images or universal service guarantees were added. Hub/Tiquet access is qualified by customer eligibility and release status. The illustrated request workflow is labelled as an illustration rather than an application screenshot. Obtain real app captures only from approved current builds.

## 3. Preservation and release boundaries

- Existing production checkout /home/firelion/website2026 was read only; existing local edits were not changed.
- Existing guide worktree /home/firelion/.v79-interactive-post-20261106/site was read only.
- Isolated redesign worktree /home/firelion/v79-hybrid-redesign-20261106 was based on MrFixITslu/v79website main commit 2d8dbadd.
- The pending network guide PR #75 and other ongoing website work must be reconciled before any later merge.
- No live configuration, database, CRM records, API keys, Hub MFA, DNS, containers or deployment were changed.

## 4. Specialist review and evidence

Strategy: distinct managed services and SaaS enquiry journeys.
UX: real links work without the selectors; dedicated routes and mobile-friendly controls.
Visual: original navy/teal, large readable editorial headings and restrained motion.
Security: whitelisted contact topics; server-side protection preserved.
SEO: matching visible content, routes, canonical metadata and XML sitemap.
Accessibility: labelled controls, focus indicators and SSR output; manual assistive technology review still needed.
Performance: code builds; real user performance not yet measured.

### Test status

- Focused tests: 7/7 PASS, including server-rendered HTML of all new pages.
- Full regression suite: 22/22 PASS, including direct HTTP 200, canonical and no-JavaScript checks for all nine new URLs, plus unknown URL 404.
- Client/server TypeScript checks: PASS.
- Final integrated Vite + esbuild build: PASS.
- Static XML sitemap: 18 unique URLs, parsed successfully.
- Production/browser mobile and accessibility hands-on acceptance: NOT RUN.
- Full CI check: verify on draft PR before owner review.
- Deployment: NOT AUTHORISED.

## 5. Handover and outstanding steps

1. Inspect draft PR and accept or revise copy and visuals.
2. Reconcile any newly accepted educational guide and current production-only changes.
3. Use isolated browser review to check actual desktop/mobile layout, keyboard navigation, enquiry routing, metadata and performance.
4. Supply genuine app screenshots and confirm product access or subscriptions before public promotion.
5. Require a fresh explicit release decision and guarded rollout procedure later.

**Implementation is development-only. Do not merge or deploy.**
