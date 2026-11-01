import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDirectoryFile } from "../src/crm/directoryImport";

test("owner CSV supports quoted commas and deduplicates within file", () => {
  const input="businessName,location,phone,description,website\n" +
    "\"Island, Office Ltd\",Castries,7585550100,\"Digital filing, cloud\",https://example.org\n" +
    "\"Island, Office Ltd\",Castries,7585550100,\"Digital filing, cloud\",https://example.org\n";
  const result=parseDirectoryFile("business.csv",input);
  assert.equal(result.length,1);
  assert.equal(result[0].businessName,"Island, Office Ltd");
  assert.equal(result[0].description,"Digital filing, cloud");
  assert.equal(result[0].phone,"7585550100");
});

test("owner JSON array preserves only allowlisted text fields",()=>{
  const r=parseDirectoryFile("contacts.json",JSON.stringify([{businessName:"Consultancy Test",email:"office@example.org"}]));
  assert.equal(r[0].email,"office@example.org");
});

test("rejects malformed, oversized or destructive directory uploads",()=>{
  for (const [filename,content] of [
    ["rows.csv","name,email\nwrong,x@example.org"],
    ["rows.csv","businessName\n\"unfinished"],
    ["rows.csv","businessName,unauthorised\nA,secret"],
    ["rows.json",JSON.stringify([{businessName:"A",token:"SECRET"}])],
    ["rows.json",JSON.stringify([{businessName:""}])],
    ["rows.csv","businessName\n"+Array.from({length:501},(_,i)=>"Test "+i).join("\n")]
  ] as const){
    assert.throws(()=>parseDirectoryFile(filename,content),undefined,filename);
  }
});
