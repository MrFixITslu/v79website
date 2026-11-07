# Website evidence remediation — 7 November 2026

Status: development candidate; no merge or production changes.

## Direct observations
Homepage, FAQ, llms.txt, sitemap and readiness respond HTTP 200 from the owner's connected Acer. Running image is sha256:de899b2a2fe7367354150345f87f7147b3771ff2bd3710a352daf4b9ca500e14, healthy; main-CCTAQ6J_.js matches PR #78's documented frontend.

Runtime analytics script SHA-256 is 892b6587f3d2be0a80d566c84a3021874d11a7ec5725ad53b47fb0fc2099dd3c and serves G-RY6Y7F15TN. Owner supplied G-51J5TCR1PM. The candidate preserves the current consent-first script and changes only that measurement ID. It includes the prior reviewed three consent tests covering default denial, opt-in, revocation, private URL exclusion and admin exclusion.

Live llms.txt contains plain URLs rather than Markdown links. Candidate converts the existing list to proper links without changing service copy. This is a discoverability-format fix, not a ranking promise.

## CI repair
Original PR #78 CI fails because Node's test runner imports CSS through ServiceExperience. A test-only module hook handles CSS while retaining real React server-render assertions. Stale source-layout assertions now test the actual rendered service links. The asynchronous delivery test polls for at most 5 seconds and still requires failed; it never treats pending as a pass. No production delivery logic changed.

Local checks: npm ci audit reported 0 vulnerabilities; TypeScript passed; build passed; 29 tests passed, including consent and production synthetic persistence/auth tests. No real leads submitted.

## Source-to-live reconciliation
Live backend SHA-256: e1648f92351e140d9f53dfaabac8fd93a180fc18ce7677e744b4780c803d3678.
Live index: 90f2939b9f089e612b44f398f8f34312ee7fdad21c04e880fb0f2414afc1a220.
Live admin: 42174b9b257f04477d512690ebdf54a8ca320f1579f1f7a1fee9c4021f2fb6df.
Live GA4: 892b6587f3d2be0a80d566c84a3021874d11a7ec5725ad53b47fb0fc2099dd3c.
Live llms: e556c193b0e86a15f61a6dbe6fb4067df014a7add3a37ca79ff6343094be6c1f.

This branch is stacked on #78 and does not define the whole live overlay. Runtime protected backend/resource/guide overlays remain outside that source baseline. The separate c39ea96 hybrid worktree is clean but predates the final overlay. The six-guide source worktree also has a different compiled backend hash. Preserve these records and existing guide/FAQ/admin/consent/data/SSO behaviour; do not rebuild or deploy the full branch blindly.

Public mobile/desktop PageSpeed probes both returned 429 quota exceeded. No fresh public score or GA4 ingestion acceptance is claimed. The on-site network review preview responds 200 at https://v79sl.com/preview/network-design-v1.html; reconcile content approval before publication changes.

## Existing website-to-Hub evidence
Website lead 2 has sent status and event 48dc6a55-e35a-4370-9566-2f19c485fac8. Current Hub receipt matches that event and leadId 2, state received, receivedAt 2026-10-28T16:09:29.072Z, correlation to existing Tiquet event. Receipt sets executionEnabled false: it does not create an account/task or authorise outreach. No new event was submitted.
