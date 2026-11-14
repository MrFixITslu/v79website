# Website V9.3: verified production preservation baseline

Deployed source: V79website, release v93-complete-20261114-r1, image sha256:a45fe90f04942e1bbf6cc06335a29e6548a47acb1eb1ed39db2da3b5849725c7.
Accepted live source directory: /home/firelion/v79-website-complete-v93-r1/source.

This branch starts at Git commit cfaf0b04ae1227bdeb7fc316d3a74883c56cdea4. The deployed files have been copied byte-for-byte over that worktree while retaining Git-only assets and historical code. It is NOT a blind functional merge of every GitHub-only feature. The original worktrees and 15 GitHub WIP paths remain untouched.

## Verified
- Exact production Docker image and container health match the accepted release.
- Previous full browser acceptance: 165/165 checks; contact, newsletter, publishing, cookie session and logout passed.
- Isolated Git-backed Docker builder passed lint, TypeScript and Vite/esbuild build.
- The exact 21 live V9.3 tests were rerun against the Git-backed build: 21/21 PASS, including Hub SSO, CRM-to-Tiquet conversion and data integrity.

## Remaining reconciliation
- Three old GitHub regression tests still target a different React homepage, favicon marker and CRM catalogue matching API. They must be updated or ported as meaningful coverage, not deleted or treated as proof the deployed V9.3 release is broken.
- Proposed websiteTiquetHandoff.ts and its test from the prior WIP were preserved separately at /home/firelion/v79-website-reconciliation-20261114/preserved-proposals because its CRMLead type is incompatible with accepted V9.3.
- Git-only routes/resources are retained but not assumed activated in the live public renderer. Reconcile the CRM matching model, route coverage and visual test expectations in a separate integration branch.
- Keep Website enquiry -> CRM -> client conversion -> Tiquet. Never make a prospect enquiry create a Tiquet job.
- No production deployment, GitHub push, Git merge, deletion of original source, or data migration in this preservation operation.
