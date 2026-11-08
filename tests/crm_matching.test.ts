import test from "node:test";
import assert from "node:assert/strict";
import { calculateDeterministicAnalysis, matchV79Offerings } from "../server/crm_engine";
import { V79_OFFERINGS } from "../src/crm/offerings";

test("catalogue covers V79 ICT services and six customer-facing Hub apps", () => {
  assert.ok(V79_OFFERINGS.filter((item) => item.kind === "ICT Service").length >= 10);
  const apps = V79_OFFERINGS.filter((item) => item.kind === "Hub App").map((item) => item.label);
  for (const label of ["V79 Hub", "V79 Tiquet", "V79 POS", "V79 FFPRO", "V79 Marketing", "V79 Academy"]) {
    assert.ok(apps.includes(label), label);
  }
  assert.equal(new Set(V79_OFFERINGS.map((item) => item.label)).size, V79_OFFERINGS.length);
});

test("website presence is completely irrelevant to score and matching", () => {
  const business = {
    businessName: "Example Retailer",
    industry: "Retail",
    description: "We need stock control and sales tracking.",
    email: "info@example.test",
    phone: "17585551234"
  };
  const missing = calculateDeterministicAnalysis({ ...business });
  const present = calculateDeterministicAnalysis({ ...business, website: "https://example.test" });
  assert.equal(missing.leadScore, present.leadScore);
  assert.deepEqual(missing.recommendedServices, present.recommendedServices);
  assert.ok(!missing.recommendedServices.some((name) => /website/i.test(name)));
  assert.ok(!missing.scoreBreakdown.some((factor) => /website/i.test(factor.factor)));
});

test("stock-control retailer maps to POS and workflow services", () => {
  const result = calculateDeterministicAnalysis({
    businessName: "Local shop",
    industry: "Retail",
    description: "Manual stock count and sales tracking take too long."
  });
  assert.ok(result.recommendedServices.includes("V79 POS"));
  assert.ok(result.recommendedServices.includes("Workflow & Inventory Automation"));
  assert.ok(result.summary.includes("not confirmed needs"));
});

test("explicit service request maps to the exact V79 offer, not a website", () => {
  const result = calculateDeterministicAnalysis({
    businessName: "Property manager",
    serviceRequested: "V79 Tiquet",
    description: "We want to track support tickets."
  });
  assert.equal(result.recommendedServices[0], "V79 Tiquet");
  assert.ok(result.scoreBreakdown.some((item) => item.factor.includes("explicitly requested")));
});

test("unqualified general ICT enquiry does not become an assumed consulting sale", () => {
  const result = calculateDeterministicAnalysis({
    businessName: "New customer",
    serviceRequested: "General ICT Inquiry"
  });
  assert.deepEqual(result.recommendedServices, []);
  assert.equal(result.leadScore, 0);
});

test("email + telephone alone do not produce fabricated needs", () => {
  const result = calculateDeterministicAnalysis({
    businessName: "Unknown business",
    phone: "+1 758 555 1234",
    email: "owner@example.test"
  });
  assert.deepEqual(result.recommendedServices, []);
  assert.equal(result.leadScore, 20);
  assert.equal(result.problems.length, 0);
});

test("negative statements do not become an upsell recommendation", () => {
  const matches = matchV79Offerings({
    businessName: "Test",
    description: "We do not need a POS system."
  });
  assert.ok(!matches.some((item) => item.offering.id === "pos"));
});

test("service needs map to Microsoft 365, disaster recovery and cybersecurity", () => {
  const result = calculateDeterministicAnalysis({
    businessName: "Professional practice",
    description: "We need Microsoft 365, disaster recovery, and a security audit."
  });
  for (const label of ["Cloud & Microsoft 365", "Backup & Disaster Recovery", "Cybersecurity & Firewall Protection"]) {
    assert.ok(result.recommendedServices.includes(label), label);
  }
});

test("no invented SaaS products or website-only score drivers", () => {
  const result = calculateDeterministicAnalysis({
    businessName: "Tour provider",
    industry: "Hospitality",
    website: "",
    facebookUrl: "https://social.example/someone"
  });
  assert.ok(result.recommendedServices.every((label) => V79_OFFERINGS.some((offering) => offering.label === label)));
  assert.ok(!result.scoreBreakdown.some((item) => /website|social/i.test(item.factor)));
  assert.ok(result.leadScore <= 20);
});
