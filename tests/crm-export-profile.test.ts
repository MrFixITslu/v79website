import { test } from "node:test";
import assert from "node:assert/strict";
import { parseExportProfileContact, getExportProfileContact } from "../server/crm_export_profile";

const profile = `
<section class="profile">
<h2>Contact Info </h2>
<div class="col-md-1"><i class="fas fa-phone-alt"></i></div>
<div class="col-md-11"><a href="tel:1-758-555-0101">1-758-555-0101</a></div>
<div class="col-md-1"><i class="fas fa-envelope"></i></div>
<div class="col-md-11"><a href="mailto:contact@sample-company.org">contact@sample-company.org</a></div>
<div class="col-md-1"><i class="fas fa-globe"></i></div>
<div class="col-md-11"><a href="https://sample-company.org">Visit company</a></div>
</section>
<footer>
<a href="mailto:info@exportsaintlucia.org">Publisher email</a>
<a href="https://www.facebook.com/ExportSaintLucia/">Publisher Facebook</a>
</footer>
`;

test("profile contact enrichment reads only the business's Contact Info area", () => {
  const parsed = parseExportProfileContact(profile);
  assert.deepEqual(parsed, {
    phone: "1-758-555-0101",
    email: "contact@sample-company.org",
    website: "https://sample-company.org/"
  });
  assert.equal(Object.hasOwn(parsed, "facebookUrl"), false);
  assert.doesNotMatch(JSON.stringify(parsed), /exportsaintlucia\.org/);
});

test("provider footer-only email is never assigned to a business", () => {
  const parsed = parseExportProfileContact('<footer><a href="mailto:info@exportsaintlucia.org">Contact</a></footer>');
  assert.equal(parsed.email, undefined);
});

test("rejects off-domain enrichment URLs before network lookup", async () => {
  await assert.rejects(getExportProfileContact("http://localhost:11434/api/tags"), /verified Export Saint Lucia/);
  await assert.rejects(getExportProfileContact("https://exportsaintlucia.org.evil.example/directories/test/"), /verified Export Saint Lucia/);
  await assert.rejects(getExportProfileContact("https://exportsaintlucia.org/wp-admin/"), /verified Export Saint Lucia/);
});
