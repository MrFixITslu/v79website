# V79 Digital GA4 release and verification

**Current gate:** The GA4 connector property \`253849581\` is reporting no rows. Its website's \`G-...\` Measurement ID has **not** been verified. This integration is intentionally **disabled** until the correct ID is supplied and linked to **v79sl.com**.

## Source of truth

In [Google Analytics](https://analytics.google.com/analytics/web/), select the intended property. Open **Admin → Data streams → Web → v79sl.com**. Copy the **Measurement ID** beginning with \`G-\`. Verify the stream URL is \`https://v79sl.com\`. The numeric property ID \`253849581\` is not a valid tracking ID.

## Release approach

1. Use a guarded website release on top of the current PR #62/PR #65/PR #66 integration, preserving the running non-root, Hub MFA, CRM, three bind mounts, secrets, network, rollout flags, backups and rollback image. Do **not** run the historical \`docker-compose.yml\` unchanged.
2. Add **only** \`GA4_MEASUREMENT_ID=G-...\` to the production website container environment when the verified stream ID is available, using the guarded release workflow. Do not put this in a shared master secret or expose other environment variables.
3. After deployment, check \`GET /api/analytics-config\` responds with the correct public \`G-...\` ID. Confirm a page request has the intended restricted Google tag CSP origins.
4. In a private browser session, visit \`https://v79sl.com/\`. **Before acceptance:** check no \`googletagmanager.com/gtag/js\` or \`google-analytics.com/g/collect\` requests occur. Select **Accept analytics**, and check that one Google tag loads and a \`page_view\` request is sent. Navigate to **Services → Solutions** and ensure one page view per change, not multiples. Reject again through **Analytics choices** and verify requests stop after reload.
5. Open GA4 **Reports → Realtime** or **Admin → DebugView** and verify events appear for the correct stream. The connected Windsor.ai GA4 property may need time to refresh; its older empty reports are not evidence of new activity.
6. In GA4 Web stream Enhanced measurement settings, check automatic **page changes based on browser history events** is not independently sending duplicate page views. The V79 script uses explicit, duplicate-suppressed page views (\`send_page_view:false\`). Confirm before enabling the property-wide enhanced page-change option.
7. No public admin/private CRM routes, form contents, arbitrary query strings or unverified conversions are transmitted. Consent is opt-in, changeable, and is unrelated to newsletter marketing consent.

## /REDTEAM

- Missing/invalid ID is a hard disable, not a reason to guess.
- Pre-consent tag loading, uncontrolled Google domains in CSP, missing privacy notice, private page tracking or automatic conversion claims are unacceptable.
- GA4 Realtime/DebugView confirmation is required before claiming operational tracking; only Google controls report processing and attribution.
- Disable ad storage, personalisation and ad user data even when analytics consent is granted.
- Keep a production rollback checkpoint and run a consolidated website/admin smoke check before declaring a release complete.
