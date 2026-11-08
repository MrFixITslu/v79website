# Newsletter preferences — 28 October 2026

The guide remains an immediate PDF download after signup. No email provider,
confirmation email, welcome email or campaign send is introduced by this change.

New signups receive a signed unsubscribe link on the download confirmation.
Opening it displays a confirmation form without changing subscription state.
Submitting that form saves an opt-out in the existing encrypted SQLite document,
retaining the original consent version and timestamps. Repeated submissions are
idempotent. A later public signup still returns the guide and preserves the opt-out.
Bounce/complaint and other non-active statuses are never silently reactivated.

Existing subscribers' links appear only in the authenticated admin subscriber
response as `unsubscribeUrl`. A public signup for an existing address never
returns its link. Existing links can be supplied through the existing support
process; the invalid/missing-link page points to the contact form. No newsletter
has been sent by this implementation. Any future sending implementation must
check active status AND consent immediately before sending and include the
recipient's signed unsubscribe URL. Email confirmation and delivery receipts
remain separate work if email delivery is requested later.

Links are HMAC-SHA256 capabilities bound to subscriber ID and email hash, with a
newsletter-specific purpose and the existing stable encryption key. Tokens do
not contain email addresses. The confirmation routes use no-store, no-referrer
and noindex headers, and the existing origin restriction and rate limiting.
The signing key is never returned by public or admin APIs. Preserve the existing
encryption key during deployment, as required by the existing storage contract.

Verification: seven focused domain/handler tests passed locally. One additional
built-server HTTP test checks the native form parser, origin restriction,
restart persistence and encrypted-at-rest subscriber data. Run that test on the
built candidate; the previously passed guide PDF and contact/Hub/Tiquet gates
do not need manual repetition. This source change is not production acceptance.
