import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePublicBusinesses } from "../server/crm_public_discovery";

const elements = [
  {
    type: "node", id: 123,
    tags: {
      name: "Sample Castries Clinic",
      healthcare: "clinic",
      "addr:city": "Castries",
      "contact:phone": "+1 758 555 0101",
      "contact:email": "contact@example.org",
      "contact:website": "example.org",
      "contact:facebook": "https://facebook.com/exampleclinic",
      "contact:instagram": "https://instagram.com/exampleclinic",
      "contact:linkedin": "https://www.linkedin.com/company/exampleclinic"
    }
  },
  {
    type: "way", id: 456,
    tags: {
      name: "Sample Rodney Bay Restaurant",
      amenity: "restaurant",
      "addr:city": "Rodney Bay",
      "contact:phone": "+1 758 555 0202"
    }
  },
  {
    type: "way", id: 789,
    tags: {
      name: "Sample Castries Clinic",
      healthcare: "clinic",
      "addr:city": "Castries",
      "contact:phone": "+1 758 555 0101"
    }
  },
  {
    type: "node", id: 999,
    tags: { name: "Irrelevant Landmark", historic: "monument" }
  }
];

test("public discovery retains sourced contact information without inventing fields", () => {
  const results = parsePublicBusinesses(elements, { limit: 20 });
  assert.equal(results.length, 2);
  const clinic = results.find((business) => business.businessName === "Sample Castries Clinic");
  assert.ok(clinic);
  assert.equal(clinic.email, "contact@example.org");
  assert.equal(clinic.phone, "+1 758 555 0101");
  assert.equal(clinic.website, "https://example.org/");
  assert.equal(clinic.facebookUrl, "https://facebook.com/exampleclinic");
  assert.equal(clinic.instagramUrl, "https://instagram.com/exampleclinic");
  assert.equal(clinic.linkedinUrl, "https://www.linkedin.com/company/exampleclinic");
  assert.equal(clinic.sourceUrl, "https://www.openstreetmap.org/node/123");
  const restaurant = results.find((business) => business.businessName.includes("Restaurant"));
  assert.ok(restaurant);
  assert.equal(restaurant.email, undefined);
  assert.equal(restaurant.website, undefined);
});

test("location, category, keyword and limit filters are bounded", () => {
  assert.equal(parsePublicBusinesses(elements, { location: "Castries" }).length, 1);
  assert.equal(parsePublicBusinesses(elements, { category: "Restaurant & Hospitality" }).length, 1);
  assert.equal(parsePublicBusinesses(elements, { query: "clinic" }).length, 1);
  assert.equal(parsePublicBusinesses(elements, { query: "unlisted" }).length, 0);
  assert.equal(parsePublicBusinesses(elements, { limit: 1 }).length, 1);
  assert.equal(parsePublicBusinesses(elements, { limit: 100 }).length, 2);
  assert.deepEqual(parsePublicBusinesses(null), []);
});

test("rejects unsafe URL schemes and malformed publicly listed contact data", () => {
  const results = parsePublicBusinesses([{
    type: "node", id: 345,
    tags: {
      name: "Test Retail",
      shop: "convenience",
      "contact:website": "javascript:alert(1)",
      "contact:facebook": "https://localhost/private",
      "contact:email": "not-an-email"
    }
  }]);
  assert.equal(results.length, 1);
  assert.equal(results[0].website, undefined);
  assert.equal(results[0].facebookUrl, undefined);
  assert.equal(results[0].email, undefined);
});
