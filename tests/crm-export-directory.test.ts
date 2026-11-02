import { test } from "node:test";
import assert from "node:assert/strict";
import { parseExportSaintLuciaDirectory, filterExportSaintLuciaDirectory } from "../server/crm_export_directory";

const html = `
<div class="cbp-item  professional-services listingdata-col " id="1">
  <div class="card">
    <a href="https://exportsaintlucia.org/directories/sample-legal-studio/" class="m-0 p-0 cbp-l-grid-projects-title">
      Sample Legal &amp; Co
    </a>
    <p class="card-text p-0 mt-2 address"><i class="icon"></i> Castries</p>
    <p class="mt-2 categories"><i class="icon"></i> Professional Services</p>
    <p class="client-contact"><span class="mcall"><a href="tel:+1 (758) 555-0160">Call</a></span></p>
  </div>
</div>
<div class="cbp-item  tourism listingdata-col " id="2">
  <a href="https://exportsaintlucia.org/directories/sample-villa/" class="cbp-l-grid-projects-title">Sample Villa</a>
  <p class="address">Gros Islet</p>
  <p class="categories">Tourism &amp; Hospitality Services</p>
</div>
`;

test("official directory parsing preserves business/source/phone and never invents email or socials", () => {
  const listings = parseExportSaintLuciaDirectory(html);
  assert.equal(listings.length, 2);
  assert.equal(listings[0].businessName, "Sample Legal & Co");
  assert.equal(listings[0].location, "Castries");
  assert.equal(listings[0].category, "Professional Services");
  assert.equal(listings[0].phone, "+1 (758) 555-0160");
  assert.equal(listings[0].sourceUrl, "https://exportsaintlucia.org/directories/sample-legal-studio/");
  assert.equal(listings[0].email, undefined);
  assert.equal(listings[0].facebookUrl, undefined);
  assert.equal(listings[1].phone, undefined);
});

test("official business lookup filters location/industry/query and caps results", () => {
  const listings = parseExportSaintLuciaDirectory(html);
  assert.equal(filterExportSaintLuciaDirectory(listings, { location: "Castries" }).length, 1);
  assert.equal(filterExportSaintLuciaDirectory(listings, { category: "Tourism" }).length, 1);
  assert.equal(filterExportSaintLuciaDirectory(listings, { query: "villa" }).length, 1);
  assert.equal(filterExportSaintLuciaDirectory(listings, { query: "unknown" }).length, 0);
  assert.equal(filterExportSaintLuciaDirectory(listings, { limit: 1 }).length, 1);
  assert.deepEqual(parseExportSaintLuciaDirectory("<p>unrelated</p>"), []);
  assert.deepEqual(parseExportSaintLuciaDirectory("x".repeat(350001)), []);
});
