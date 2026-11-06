# Pilot: How to Create, Install, Use and Edit ChatGPT Skills

- Slug: `chatgpt-skills-how-to`
- Original public Resources route: `https://v79sl.com/?article=chatgpt-skills-how-to`
- Owner review preview (not canonical): `https://v79sl.com/preview/chatgpt-skills-v2.html`
- Revision: `0.1.0` · 6 November 2026 · **PENDING APPROVAL**
- Audience: curious 18-year-old, no coding skills, Caribbean reader.
- Learning outcomes: understand a Skill, build sample instructions, install safely, use & improve.
- Interactive blocks: highlighted mock UI steps, editable prompt builder & copy, installation tabs, scenario practice, before/after instruction comparison, checklist, four-question quiz.
- Illustrations: original inline SVG and clearly labelled CSS mock interface; **not** OpenAI screenshots.
- Factual sources last checked 6 November 2026: `https://help.openai.com/en/articles/20001066-skills-in-chatgpt` and `https://openai.com/academy/skills/`.
- Important limitation: Features vary by plan/workspace; eligibility noted clearly in guide.
- Preview is **unlisted** with `noindex,nofollow,noarchive`. **Not** the live article until approved.

## Three options considered

A. More polished Markdown: quickest, still limited exercises.
B. Iframe of standalone interactive guide: quick but poor reading/navigation and nested-scrolling risks.
C. Reusable native interactive lesson: best UX and future flexibility; requires careful integration and QA.

Chosen: **C**. Prototype uses a static standalone preview that will replace the Resources article reading experience on approval. Never treat preview as published.

## /REDTEAM

- **Misleading screenshots** → use original diagrams with prominent illustration labels.
- **Reader confused by “Share”** → do not put share buttons before content; reading is never gated.
- **Outdated app menu and eligibility** → link official OpenAI docs, show account caveat, review facts before approval.
- **Accessibility and animations** → keyboard navigation, labels, focus rings, reduced-motion CSS, always-readable text.
- **Security** → no user data collection, no API calls, sanitize inputs using `textContent`.
- **Accidental regression** → isolate preview assets; don't edit current article route until approval.
- **Maintenance** → version skill and pilot, store reusable checklist and sources.

## Approval sequence

1. Owner reviews preview on phone and desktop.
2. Capture requested changes, update version, retest affected controls.
3. Owner explicitly says **Approve this post**.
4. Integrate the new interactive lesson into the **actual** Resources reading route. Remove or redirect the Markdown teaser appropriately. Ensure existing share URLs resolve to interactive content, not the old article.
5. Guarded production deployment with rollback, live route + resource card + mobile verification.
6. Only then choose the next-most-recent post. One article at a time.