import { test } from "node:test";
import assert from "node:assert/strict";
import { safeExternalLink, safeSocialLink, safeEmail } from "../src/crm/linkSafety";
import { calculateDeterministicAnalysis } from "../server/crm_engine";

test("business contact URLs only permit safe web links", () => {
  assert.equal(safeExternalLink("https://example.com/contact"), "https://example.com/contact");
  assert.equal(safeExternalLink("example.com"), "https://example.com/");
  for (const bad of ["javascript:alert(1)", "data:text/html;base64,aaa", "http://localhost/private", "http://127.0.0.1/admin", "http://192.168.1.1", "https://evil.test@business.test/", "http://169.254.169.254/latest", "http://10.0.0.2/secret"]) {
    assert.equal(safeExternalLink(bad), undefined, bad);
  }
});

test("social channel labels cannot open impostor domains", () => {
  assert.equal(safeSocialLink("https://www.facebook.com/company", "facebook"), "https://www.facebook.com/company");
  assert.equal(safeSocialLink("https://instagram.com/company", "instagram"), "https://instagram.com/company");
  assert.equal(safeSocialLink("https://www.linkedin.com/company/example", "linkedin"), "https://www.linkedin.com/company/example");
  assert.equal(safeSocialLink("https://facebook.com.evil.test/test", "facebook"), undefined);
  assert.equal(safeSocialLink("https://example.com/linkedin", "linkedin"), undefined);
});

test("invalid imported emails are not rendered as contact links", () => {
  assert.equal(safeEmail("sales@example.org"), "sales@example.org");
  assert.equal(safeEmail("admin@example.org\nBCC:attacker@example.com"), undefined);
});

test("CRM analysis does not infer that a missing directory field proves a website is absent", () => {
  const a=calculateDeterministicAnalysis({businessName:"Example Shop",location:"Castries",category:"Retail"});
  assert.match(a.summary, /No website was recorded/);
  assert.doesNotMatch(a.summary, /lack a standalone|relies entirely/i);
  assert.match(a.problems[0], /confirm whether/);
  assert.equal(a.generatedBy,"heuristic_engine");
});