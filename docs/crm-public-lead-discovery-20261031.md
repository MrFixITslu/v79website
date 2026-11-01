# CRM Public Lead Finder — development candidate (31 October 2026)

## Scope and behaviour
- Existing **website admin → CRM → Prospect Finder** remains the single CRM.
- The source selector offers an imported directory (unchanged) or an explicitly requested public lookup.
- Public lookup uses OpenStreetMap's Overpass API with fixed Saint Lucia bounds, a capped response, 25-second cooldown, 18-second request timeout and a strict 20-business limit.
- Extract only fields published in business map tags: name, industry, location, business phone/email, website, Facebook, Instagram and LinkedIn. Each prospect retains a clickable OpenStreetMap source URL. Missing values remain blank.
- An owner-initiated search writes *prospects* only, not leads. Duplicate candidate names are checked against stored prospects and CRM leads. The operator must approve prospects before they enter the pipeline.
- The first two new public prospects are offered to the configured local Ollama model for analysis; the deterministic scorer remains the fallback and other records can be re-scored by the existing admin button. AI is not the source of contact details.
- Failed lookups show an error in the admin UI. The existing stale search-result assignment bug is corrected.

## Deployment and safety
- **Feature flag default OFF:** `CRM_PUBLIC_DISCOVERY_ENABLED=false`. Do not enable, merge or deploy until an owner-approved release and a fresh isolated browser/backend validation.
- Public service dependency: Overpass API. Its availability and map contact coverage are not guaranteed. Public listings are *not* verified business contact details or a complete directory.
- No platform login, social scraping, site crawling, CAPTCHA circumvention, private contact enrichment, emails, calls, lead conversion, or automatic campaigns.
- The AI analysis reflects potential *hypotheses*, not verified customer needs. Review before contact.
- This first implementation is **Saint Lucia only**. Caribbean expansion should use country-scoped public data or a licensed search provider (for example Brave Search), a provenance ledger, and source-specific verification.
- Before release verify the configured Ollama network address from the running website container; never assume `localhost:11434` inside Docker points at the host.
- Preserve the existing encrypted website SQLite database and website / Hub / Tiquet lead event paths. Create a scoped rollback checkpoint at release time.

## /REDTEAM gaps for the next iteration
1. Sparse OpenStreetMap contact tags mean some businesses have no email or website. Never synthesize one.
2. Overpass may return incomplete or truncated lists. Treat search as bounded discovery, not a complete census.
3. Individual public OSM details may be stale or user-entered. Keep original source and operator review.
4. Public data could include malicious social links or prompt-injection text; only send data to local inference and never grant the model tools. Add source-domain verification and stronger de-duplication before general release.
5. Do not reuse this website-owner feature for multi-tenant Hub users without explicit tenant scoping and quotas.
