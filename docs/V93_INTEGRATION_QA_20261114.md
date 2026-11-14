# V9.3 integration review and test gates — 14 November 2026

## Scope
Start from local immutable V9.3 preservation commit 128d078. Integrate the previously developed CRM deterministic catalogue matching and align two older source tests with the accepted V9.3 public renderer/favicon. No change to homepage markup, public CSS, assets, static pages, SSO, lead conversion, Tiquet handoff, storage or application routes.

## Three approaches evaluated / red-team
1. Overwrite live with older GitHub layout: rejected — loses approved public renderer and customer workflows.
2. Ignore GitHub: rejected — leaves false-positive CRM scoring and drift.
3. Preserve exact accepted V9.3 baseline, selectively integrate tested GitHub CRM fix in separate branch: selected.

Risk review: Scoring now depends on supplied/explicit business requirements, not absence of a website or unverified business problems. The original CRM handoff and Tiquet creation remain gated on explicit CRM conversion and idempotent retry. Model recommendations remain suggestions; no fabricated customer sales claims.

## Verification
- Preservation baseline: exact live source build and 21/21 existing V9.3 regression tests PASS.
- This integration: source-only change to server/crm_engine.ts plus V9.3-accurate tests/modern-website-release.test.ts and tests/website-favicon.test.ts.
- Isolated Docker builder TypeScript/lint and Vite/esbuild build PASS.
- Host build PASS (dist/server/server.cjs).
- Combined regression suite: 36/36 PASS; includes 9 deterministic CRM matching checks, public route/branding checks, SSO, lead conversion/Tiquet idempotency, encryption and storage safeguards.
- Original accepted live V9.3 browser report: 165/165 PASS, historical baseline; not claimed as a fresh browser run against this feature candidate.
- Current production image remains sha256:a45fe90f04942e1bbf6cc06335a29e6548a47acb1eb1ed39db2da3b5849725c7 until a separate guarded acceptance and release.

## Next release gates
1. Review source diff, provenance, source parity and dependencies.
2. Run candidate in isolated staging with synthetic data, exercising real HTTP routes and screenshots where relevant.
3. Approve and execute guarded deployment only after production checkpoint, rollback proof and public live-account acceptance.
4. Do not merge/push to remote or delete prior worktrees without a separate review.

Evidence: /home/firelion/v79-website-reconciliation-20261114
