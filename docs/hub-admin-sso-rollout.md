# V79 website admin — Hub MFA sign-in rollout

Status: **live pilot is now flagged enforced; authenticated founder browser acceptance still unverified**. The source remains in a draft PR and must not be treated as merged. Paired changes: V79hub [PR #224](https://github.com/MrFixITslu/V79hub/pull/224) and v79website [PR #62](https://github.com/MrFixITslu/v79website/pull/62).

## Identity architecture

- Hub remains the sole identity provider and authenticates the platform owner using **existing session-completed MFA**. A Hub account that merely has MFA configured is not sufficient.
- Browser starts at `https://v79sl.com/api/admin/hub-sso/start`; the website sets an HttpOnly/SameSite=Lax browser-bound, 2-minute state cookie and generates PKCE S256 verifier and challenge.
- Browser navigates to the fixed Hub authorisation endpoint; only a current MFA-verified Hub platform-owner session (15-minute recent challenge) may authorise a handoff to **exactly** `https://v79sl.com/api/admin/hub-sso/callback`.
- The code is single-use and expires in 60 seconds. The website redeems it server-to-server with a dedicated high-entropy service secret plus PKCE verifier. No Hub cookie, authenticator seed, or password is copied to the website.
- The website issues its own 30-minute HttpOnly admin cookie and verifies the Hub session by backchannel (cached for 5 seconds). A Hub logout/permission loss/MFA lapse or Hub outage denies protected admin API calls. Website logout revokes the Hub handoff handle.

## Flags: all off by default

Hub: `V79_HUB_WEBSITE_SSO_ENABLED=1` only when paired image is ready.

Website: `WEBSITE_HUB_SSO_ENABLED=true` enables a Hub sign-in button alongside the existing password flow for the **owner acceptance pilot**; `WEBSITE_HUB_SSO_ENFORCED=true` blocks the legacy website password login and requires Hub identity on all admin routes, including CRM.

Both containers need the **same dedicated** `V79_WEBSITE_SSO_SHARED_SECRET` (32+ random characters). Keep it out of GitHub, log output and browser JavaScript. The website backchannel endpoint must be the pinned service origin `http://v79-hub:3040` on the private Docker `proxy_network` (or verified `https://hub.v79sl.com`).

## Required release gates

1. Verify Hub release base exactly matches the protected live Skill Manager image revision, and preserve every unrelated image mount, environment variable, health check and service.
2. Take consistent encrypted Hub and website database/config snapshots and retain both previous image digests and working rollback commands.
3. Test SSO endpoints in isolation: wrong code, wrong PKCE verifier, wrong state/browser cookie, expired/replayed code, unauthorised user, stale/no MFA, logout/revocation and Hub unavailable. Ensure all website-admin APIs deny unauthenticated or password-only sessions while enforcement is on.
4. Deploy both images with flags OFF; check Hub, Tiquet, website and all other protected services remain healthy. Then enable Hub provider and the website **pilot only** (no legacy lockout yet).
5. Owner signs into Hub using existing MFA and uses the website **Sign in with V79 Hub MFA** button. Confirm CRM, lead notes, archive/restore and session expiry in the browser. Verify signed-in access only for Hub owner and unauthenticated APIs return 401/403.
6. **After owner visual acceptance**, set `WEBSITE_HUB_SSO_ENFORCED=true` and verify password-only sign-in is rejected, Hub logout/revocation takes effect and re-login works. Make a fresh checkpoint, then remove the unused legacy password reset flow only in a separate reviewed change.

## /REDTEAM

- Never copy the Hub MFA seed or cookie across origins; never let `mfaEnabled=true` substitute for session MFA proof.
- No open redirect, user-supplied introspection URL, shared generic key, unchecked cross-tenant identity or recovery bypass.
- Do not activate mandatory SSO before successful Hub MFA browser acceptance and tested rollback.
- Fail closed when Hub is unavailable, including for website CRM APIs; warn the owner about this operational dependency.
- Historical accepted release fingerprints remain separate from the new staged branch. Do not repin a prior accepted release to disguise changes.

This document is a release guide, **not proof of a deployed feature**.

## Live read-back and independent negative acceptance — 1 November 2026

- Production website container is healthy and, at the latest read-only check, both `WEBSITE_HUB_SSO_ENABLED=true` and `WEBSITE_HUB_SSO_ENFORCED=true`. Hub SSO provider is enabled.
- `GET /api/admin/hub-sso/config` returned `{"enabled":true,"enforced":true}`. A synthetic/no-password login request to `POST /api/admin/login` returned HTTP **403**; a callback without valid state returned **401**; unauthenticated `GET /api/admin/verify-session` and CRM endpoints returned **401**.
- These checks establish server-side legacy and anonymous denial only. They **do not prove** that the actual owner completed a fresh Hub MFA website sign-in, or that all browser flows, timeout, logout and cross-app revocation have been accepted.
- Added non-deploying enforced-mode HTTP regression `tests/hub-sso-enforced-isolated.mjs` and isolated workflow, testing correct synthetic legacy-password denial, forged callback denial, protected CRM writes, fixed Hub redirect and public page access. The first exact-head workflow, the existing CRM browser suite and production checks passed.
- Running website source fingerprint and release/rollback provenance still need independent read-back. No credential/cookie/owner MFA secrets should be posted to GitHub.
- Because mandatory SSO is already flagged on, any recovery plan must preserve an authenticated owner path; never switch back to password-only fallback without a reviewed incident decision and owner approval.
