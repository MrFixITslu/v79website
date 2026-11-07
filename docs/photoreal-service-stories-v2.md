# Photoreal service visuals v2

Status: review candidate only, not deployed or merged. Parent source: 6fbbfaa5f1806cc7d11afcc7fcf923da4922853d (the previous live frontend).

The owner approved the story concept and requested substantially more realistic visuals. Compared polished 3D, photoreal cutout layers and photographs; selected photoreal layers plus two illustrative workplace scenes. Red-team: keep technical explanations in semantic text, not generated image labels; do not portray generated staff or equipment as real installations or exact manufacturer models.

Five authored generated assets: a six-cell rack atlas (empty cabinet, router, switch, patch panel, server, UPS); cloud equipment atlas (laptop, security key, monitor, tablet, backup SSD, backup appliance); security equipment atlas (devices, security key, laptop, gateway, headset, SSD); an illustrative Caribbean office support scene; and an illustrative human review scene. Built-in image generation was used. The review photo was corrected to remove impossible screen content on the laptop lid. ImageMagick was used for WebP format optimisation only. Generated PNG originals were retained; browser SVG clips select the required atlas regions without rewriting image pixels.

Generation prompt set: neutral studio product photography, soft upper-left lighting, realistic graphite metal/glass/rubber, isolated alpha cutouts, no branding or readable generated UI; workplace photography uses natural daylight and credible Caribbean SME offices, no futuristic holograms. Separate code-authored labels and concept screen interfaces carry the exact story information. All on-page photos are explicitly labelled generated illustrations rather than actual V79 staff or customers.

Story behaviour preserved: native scroll, five component stages, assembly, reverse, manual controls, pause, static mobile and reduced-motion alternatives. Equipment atlases are reused across scenes to bound payload. Source photo paths and hashes are recorded in the accompanying asset manifest.

Observed QA: six desktop scenes visually inspected in the browser. Found and fixed a global SVG sizing rule exposing whole atlases; replaced viewport crops with explicit SVG clip paths and scoped root sizing. Adjusted the rack placement to keep the UPS inside the cabinet and keep rack units registered. All six scenes at iframe widths 320 and 390 have matching client/scroll widths and five components. JavaScript syntax and bounded static output checks passed. No full integrated Vite build, physical-device test, alternate-browser check or live deployment performed for this visual-only review candidate.

Delivery: one self-contained HTML review, with all imagery embedded, plus a draft source branch. Backend, payments, authentication, credentials and service scope were not changed. No new dependencies or running monitoring jobs were introduced. The earlier live source consolidation limitation still applies when preparing a future release.
