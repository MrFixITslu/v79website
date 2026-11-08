import { test } from "node:test";
import assert from "node:assert/strict";
import type { Prospect } from "../src/crm/types";
import { filterAndSortProspects, industryChoices } from "../src/crm/prospectFilters";

function fixture(name: string, category: string, industry = category, description = "", leadScore = 50): Prospect {
  return {
    id: "fixture-" + name, businessName: name, category, industry,
    location: "Castries", description, sourceUrl: "https://example.test",
    discoveredAt: "2026-10-31T00:00:00Z", workflowStatus: "discovered",
    leadScore, scoreCategory: "Medium"
  };
}
const records = [
  fixture("Attorney Chambers", "Law Firm", "Law Firm", "", 70),
  fixture("Legal Associates", "Law Firm", "Law Firm", "", 60),
  fixture("Island Electrical Services", "Facility & Field Services", "Facility & Field Services", "Certified electrical works", 55),
  fixture("Island Construction", "Construction & Engineering", "Construction & Engineering", "General construction", 95),
  fixture("Seaside Villas", "Hospitality", "Hospitality", "Holiday villa accommodation", 30),
  fixture("Hospitality Events", "Hospitality", "Hospitality", "Event staffing", 45),
  fixture("Beach Resort", "Hospitality & Tourism", "accommodation", "Resort", 85),
  fixture("Hardware Store", "Retail & Distribution", "Retail & Distribution", "", 40)
];

test("industry choices come from actual category and industry values", () => {
  const entries = industryChoices(records);
  assert.equal(entries.find(x => x.value === "industry:law firm")?.count, 2);
  assert.equal(entries.find(x => x.value === "industry:accommodation")?.count, 1);
  assert.equal(entries.find(x => x.value === "industry:hospitality")?.count, 2);
  assert.equal(entries.filter(x => x.value === "industry:law firm").length, 1);
});

test("electrician shortcut excludes unrelated construction and facility entries", () => {
  const filtered = filterAndSortProspects(records, { industry: "preset:electricians", text: "", order: "industry" });
  assert.deepEqual(filtered.map(x => x.businessName), ["Island Electrical Services"]);
});

test("accommodation shortcut uses actual accommodation/lodging evidence", () => {
  const matches = filterAndSortProspects(records, { industry: "preset:accommodation", text: "", order: "business" });
  assert.deepEqual(matches.map(x => x.businessName), ["Beach Resort", "Seaside Villas"]);
  assert.equal(matches.some(x => x.businessName === "Hospitality Events"), false);
});

test("law firms match exactly or via explicit profession evidence", () => {
  const matches = filterAndSortProspects(records, { industry: "preset:law-firms", text: "", order: "business" });
  assert.deepEqual(matches.map(x => x.businessName), ["Attorney Chambers", "Legal Associates"]);
});

test("category choices apply to both source fields, with search and sort in memory", () => {
  const byCategory = filterAndSortProspects(records, { industry: "industry:hospitality", text: "", order: "business" });
  assert.deepEqual(byCategory.map(x => x.businessName), ["Hospitality Events", "Seaside Villas"]);
  const byIndustry = filterAndSortProspects(records, { industry: "industry:accommodation", text: "", order: "score" });
  assert.deepEqual(byIndustry.map(x => x.businessName), ["Beach Resort"]);
  const keyword = filterAndSortProspects(records, { industry: "all", text: "Castries", order: "score" });
  assert.equal(keyword[0].businessName, "Island Construction");
  assert.equal(keyword.length, records.length);
  assert.deepEqual(filterAndSortProspects(records, { industry: "industry:not-a-category", text: "", order: "industry" }), []);
  assert.equal(records[0].businessName, "Attorney Chambers", "original records remain unchanged");
});

test("unclassified businesses do not get invented trade labels", () => {
  const unclassified = fixture("General Company", "Commercial", "General Industry", "General services");
  assert.equal(filterAndSortProspects([unclassified], { industry: "preset:electricians", text: "", order: "industry" }).length, 0);
});
