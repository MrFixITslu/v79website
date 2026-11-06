---
name: v79-interactive-learning-post
description: Plan, design, build, quality-check and revise one V79 Digital educational website post at a time as an original, accessible, interactive learning experience for readers aged about 18. Trigger for new or existing V79 Resources articles and guided tutorials; never move to the next post without owner approval.
version: 0.2.0
---

# V79 Interactive Learning Post — v0.2.0

## Purpose
Produce genuinely useful, mobile-friendly, brand-consistent educational posts that teach a reader **how to do something independently**. A post itself must be the lesson, not a short teaser linking to another guide. Readers can read for free without logging in, sharing, subscribing, or completing an activity. Sharing is optional and appears **after** the lesson.

## Scope and workflow
Process **one post only** at a time, newest first unless the owner specifies another. For the first pilot, use “How to Create, Install, Use and Edit ChatGPT Skills” (slug: `chatgpt-skills-how-to`).

1. **Inspect existing post and route.** Confirm the real live article, its content, website stack, and any recently deployed overlays. Never assume local checkout matches production.
2. **Research and verify.** Confirm product UI, menu paths, availability, account restrictions, dates and other time-sensitive facts using primary sources. Record official source URLs and “last checked” date. Explicitly distinguish mock-up illustrations from real screenshots; do not fabricate UI or copy copyrighted visual assets.
3. **Brainstorm three concepts**: (A) improved article, (B) embedded guide, (C) reusable interactive native article. Compare accessibility, maintainability, useful depth, mobile UX and costs. Prefer C for future posts: direct, same-site, accessible interactive article pages with reusable design patterns; use React integration only when it does not risk regressing the production app. Never use an iframe as the primary article.
4. **/REDTEAM before changes.** Look for misleading steps, stale links, copied imagery, security/privacy issues, inaccessible controls, broken keyboard navigation, motion sickness, blocked content, bad mobile layout, performance, XSS, tracking, and accidental live regressions. Mitigate each.
5. **Design first.** Create a rough layout and reading journey. Follow V79's clean Apple-inspired style using its own teal/navy palette and large whitespace, not generic purple gradients. Original visuals must add learning value. A screenshot must be genuine and appropriately licensed; otherwise use a clearly labelled original diagram.
6. **Write for an 18-year-old.** Explain one new term at a time, use plain UK English, short paragraphs, specific examples, numbered steps, success signals, troubleshooting and safety advice. Do not invent features, metrics, testimonials, or results.
7. **Build real interaction.** At minimum include (a) an always-readable explanation, (b) original illustration(s) or trustworthy current screenshots with descriptive alt text, (c) interactive practice (e.g. prompt builder, tabs, checklist, or scored quiz), (d) copy-to-clipboard with honest feedback, (e) accessible keyboard/focus behaviour, and (f) a useful next step. Don't use locked content or sharing gates.
8. **Keep UI semantic and safe.** Text remains readable with JavaScript unavailable where feasible; no injected raw HTML from user content, no external scripts, no unauthorised API calls, no collection of answers/PII by default. Respect `prefers-reduced-motion`, focus visibility, text contrast and touch targets. All images must have alt text or be explicitly decorative.
9. **Stage and test.** Work in an isolated branch or unlisted `noindex` preview. Never edit the running container, production data, or approved releases merely to prepare a draft. Test desktop/mobile, links, keyboard, JavaScript, no-JavaScript fallback, content correctness, caching, share flow, health and regressions. Keep rollback notes.
10. **Owner approval gate.** Present the preview link or artefact, changes, open issues and the exact approval needed. Do **not** publish the redesigned post as the live article or move to another article until owner explicitly approves. After approval, perform a guarded live release and check that the Resources card opens the *interactive lesson itself*; keep share controls optional and at the end.
11. **Style and reuse contract.** Preserve the approved pilot style: clean navy/teal Vision79 branding, airy readable typography, responsive illustrated hero, clear learning outcomes, numbered interactive steps, at least one live practice tool, immediate useful feedback, checklists or short quiz, and optional sharing only after the lesson. Use original diagrams labelled as illustrations, not pretend screenshots. Readers should learn and try each step independently. Record exact published route; Resources card and previously shared links must open the full lesson directly. Do not alter approved published lessons when improving the skill.
12. **Iterate and version.** Record feedback and edits in a version history. New changes create a revision; old posts must not silently change when the master skill changes. Re-test only affected areas and necessary release safety gates; avoid repeating passed tests without reason.

## Content blueprint
Each post contains: headline + one-sentence promise; reader outcomes; “what this means” in simple English; prerequisite and availability note; practical steps with visual cues; interactive “try it yourself”; worked example; troubleshooting and common mistakes; mini-quiz or checklist; summary; primary sources with review date; optional share at end. See `references/post-brief.md` and `references/quality-gate.md`.

## Version history
- **0.1.0 (6 Nov 2026):** Pilot interactive ChatGPT Skills preview; owner approved.
- **0.2.0 (6 Nov 2026):** Fixed the navy/teal interactive style, explicit direct reading routes, no iframe/teaser, original animations and illustrations, accessible practice, and owner approval per next post. Future changes require a new version.

## Definition of done
- **Draft:** full lesson content and design exist; factual claims checked; visual and interactive parts implemented.
- **Preview:** testable read-only/unlisted review link or file, with known limitations documented; production article is unchanged.
- **Approved:** owner explicitly accepts the specified revision.
- **Published:** live Resource card, direct URL and share link all open the *actual interactive lesson*, with verified responsive rendering, operation and website health. Never label a preview as published.