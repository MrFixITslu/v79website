# CRM owner-admin AI Lead Finder — development/release gate (31 October 2026)

## Current delivery
- Single website-admin CRM remains authoritative. No Hub/Tiquet lead, customer, subscription or payment semantics changed.
- Three selectable discovery sources:
  1. **Export Saint Lucia public business directory** (default UI selection): fixed `https://exportsaintlucia.org/directories/`, cached 10 minutes, capped to 20 source-linked company listings per query. Public name, category, location and company telephone are extracted. No guessed email/website/social profiles.
  2. **OpenStreetMap public listing discovery** (optional/best effort): fixed Saint Lucia bounding box, 20-result limit, 25-second cooldown, 18-second timeout, HTTPS and source links. Public endpoints currently timed out in actual Dell probes; do not claim availability.
  3. **Imported local business directory** (existing): unchanged import API and directory search.
- Ollama is a local *analysis* engine, not a public search index. The first two newly found public businesses are offered for AI scoring (heuristic fallback if needed), and the existing per-prospect button can re-score.
- Each prospect presents the public business phone/email, website, Facebook, Instagram, LinkedIn and source link **where actually supplied**. Missing data are shown as missing. External/social URLs pass an explicit allowlist/protocol check.
- **Find contact info:** admin-triggered, per-company profile lookup for a link under `https://exportsaintlucia.org/directories/<slug>/` only, with strict origin/path restriction, no redirects, 10-second timeout, 180-kB response limit, 3-second request interval and 24-hour in-memory cache. Parse only the company's Contact Info area; NEVER attribute Export Saint Lucia's footer emails or social profiles to that business. Preserve existing operator data and record `contactCheckedAt`.
- Search staging and search logs now use a synchronous atomic transaction after asynchronous model calls. Concurrent new prospects/leads cannot be overwritten by a stale AI snapshot. Admin approval is still required before CRM lead creation.
- Business analysis calls possible needs *hypotheses*, not verified problems. Missing directory website metadata is not proof of no website.

## Source and security constraints
- All public search/enrichment routes require owner admin and `CRM_PUBLIC_DISCOVERY_ENABLED=true`. Default is **false**.
- Business profile information is public; it can be outdated. Review before outreach. No automatic emails, bulk contact harvesting, private information, direct social scraping, CAPTCHA bypass, headless browser or unsolicited social messaging.
- Export Saint Lucia `robots.txt` allows the public directories path, and a bounded read-only GET from the Dell returned HTTP 200 (~197 kB). Public facts may be compiled for preliminary research subject to source terms, applicable law and responsible contact policies; confirm any necessary permissions for ongoing commercial reuse before promotion.
- OpenStreetMap data are subject to ODbL and attribution requirements; public servers lack SLAs. OpenStreetMap links and attribution are displayed in Prospect Finder.
- No general-purpose arbitrary URL fetch: public endpoints and profile hostname/path are fixed.
- No default customer-tenant exposure. Future multitenancy requires explicit access boundary, per-tenant rate limits, source licensing and opt-in.
- Do not write to production until a human-approved guarded release. Keep old website image, persisted encrypted SQLite records/config and rollback manifest; do not repeat already-verified off-host restores.

## Recorded evidence
- Website container → `http://ollama:11434/api/tags` over `proxy_network`: HTTP 200, models `qwen2.5:1.5b` and `qwen2.5:3b`. **Inference execution and resource budget remain unverified.**
- Overpass public endpoints: query timeouts on host (both IPv4 and IPv6 on alternative service); **NOT release-ready** as a primary source.
- Export Saint Lucia directory parsed in a networkless Node parser after fetching public HTML: **47 business listings, 47 listed telephones, 47 source permalinks; 0 emails on the summary page**.
- One sample company profile's Contact Info parser returned a business phone and email, and excluded Export Saint Lucia's own footer address.
- GitHub CI checks passed on earlier branch heads, covering TypeScript, build, tests, audit, Docker image and smoke. Always inspect checks at the **latest** head; older success is not release clearance.
- Expected final acceptance: browser login, search/empty/timeout and source choice, company detail lookup, email/phone/website/social source presence or correct blanks, admin approval, CRM persistence, red-team safeguards, and rollback plan.

**Release status: DRAFT, feature OFF, no merge, no deploy, no automated customer contact.**
