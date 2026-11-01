import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGeoapifyPlaces, geoapifyReady, discoverGeoapifyBusinesses } from "../server/crm_geoapify";

const fixture = { features: [
  { properties: {
    name: "Fixture Castries Accounting", country_code: "lc", city: "Castries",
    categories: ["office.accountant"], formatted: "Castries, Saint Lucia",
    website: "https://example.org", phone: "+1 758 555 0100",
    email: "office@example.org",
    datasource: { raw: { osm_type: "node", osm_id: 4567, "contact:facebook": "https://facebook.com/example" } }
  }},
  { properties: {
    name: "Fixture Rodney Bay Restaurant", country_code: "LC", city: "Rodney Bay",
    categories: ["catering.restaurant"], formatted: "Rodney Bay, Saint Lucia"
  }},
  { properties: {
    name: "Outside Saint Lucia", country_code: "bb", city: "Bridgetown",
    categories: ["commercial.supermarket"]
  }},
  { properties: {
    name: "Fixture Castries Accounting", country_code: "lc", city: "Castries",
    categories: ["office.accountant"]
  }}
] };

test("Geoapify fixtures stay in Saint Lucia and preserve only sourced contacts", () => {
  const p=parseGeoapifyPlaces(fixture,{limit:20});
  assert.equal(p.length,2);
  assert.equal(p[0].category,"Professional Services");
  assert.equal(p[0].email,"office@example.org");
  assert.equal(p[0].phone,"+1 758 555 0100");
  assert.equal(p[0].sourceUrl,"https://www.openstreetmap.org/node/4567");
  assert.equal(p[0].facebookUrl,"https://facebook.com/example");
  assert.equal(p[1].email,undefined);
  assert.equal(p[1].website,undefined);
  assert.equal(p[1].sourceUrl,"https://www.geoapify.com/places-api/");
  assert.equal(parseGeoapifyPlaces(fixture,{location:"Castries"}).length,1);
  assert.equal(parseGeoapifyPlaces(fixture,{query:"restaurant"}).length,1);
  assert.equal(parseGeoapifyPlaces(fixture,{limit:1}).length,1);
});

test("Geoapify refuses unsafe links and invalid provider records", () => {
  const parsed=parseGeoapifyPlaces({features:[{
    properties:{
      name:"Fixture Retail",country_code:"lc",categories:["commercial"],
      website:"javascript:alert(1)", email:"", phone:"",
      datasource:{raw:{osm_type:"node",osm_id:"bad-id","contact:facebook":"https://facebook.com.evil.example"}}
    }
  }]});
  assert.equal(parsed.length,1);
  assert.equal(parsed[0].website,undefined);
  assert.equal(parsed[0].facebookUrl,undefined);
  assert.equal(parsed[0].email,undefined);
  assert.equal(parsed[0].sourceUrl,"https://www.geoapify.com/places-api/");
  assert.deepEqual(parseGeoapifyPlaces(null),[]);
});

test("Geoapify is off without BOTH the server flag and API key", async () => {
  const oldFlag=process.env.CRM_GEOAPIFY_DISCOVERY_ENABLED;
  const oldKey=process.env.GEOAPIFY_API_KEY;
  try {
    delete process.env.CRM_GEOAPIFY_DISCOVERY_ENABLED;
    delete process.env.GEOAPIFY_API_KEY;
    assert.equal(geoapifyReady(),false);
    await assert.rejects(discoverGeoapifyBusinesses(),{status:503});
    process.env.CRM_GEOAPIFY_DISCOVERY_ENABLED="true";
    assert.equal(geoapifyReady(),false);
    await assert.rejects(discoverGeoapifyBusinesses(),{status:503});
    process.env.GEOAPIFY_API_KEY="fixture-not-a-real-key";
    assert.equal(geoapifyReady(),true);
  } finally {
    if(oldFlag === undefined) delete process.env.CRM_GEOAPIFY_DISCOVERY_ENABLED;
    else process.env.CRM_GEOAPIFY_DISCOVERY_ENABLED=oldFlag;
    if(oldKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY=oldKey;
  }
});
