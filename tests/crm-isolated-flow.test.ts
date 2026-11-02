import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

test("prospect discovery persists, deduplicates and only creates a lead after admin approval", () => {
  const root = process.cwd();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "v79-crm-isolated-"));
  try {
    const code = [
      'import assert from "node:assert/strict";',
      'import { crmStorage } from ' + JSON.stringify(path.join(root, "server/crm_storage.ts")) + ';',
      'import { writeJSON } from ' + JSON.stringify(path.join(root, "server/persistence.ts")) + ';',
      'writeJSON("business-directory.json", [{businessName:"Fixture Accounting Co",category:"Professional Services",location:"Castries",phone:"+1 758 555 0199",email:"office@example.org",website:"https://example.org",description:"Accounting"}]);',
      'const first = await crmStorage.runProspectSearch({source:"directory", limit:10});',
      'assert.equal(first.newCount,1);',
      'assert.equal(first.duplicatesCount,0);',
      'assert.equal(crmStorage.getProspects().length,1);',
      'assert.equal(crmStorage.getLeads().length,0);',
      'assert.equal(crmStorage.getProspects()[0].phone,"+1 758 555 0199");',
      'assert.equal(crmStorage.getProspects()[0].email,"office@example.org");',
      'const second = await crmStorage.runProspectSearch({source:"directory", limit:10});',
      'assert.equal(second.newCount,0);',
      'assert.equal(second.duplicatesCount,1);',
      'assert.equal(crmStorage.getProspects().length,1);',
      'assert.equal(crmStorage.getSearchHistory().length,2);',
      'const prospectId = crmStorage.getProspects()[0].id;',
      'const lead1 = crmStorage.approveProspectToLead(prospectId, "Fixture Admin");',
      'assert.equal(lead1.company,"Fixture Accounting Co");',
      'assert.equal(crmStorage.getLeads().length,1);',
      'const lead2 = crmStorage.approveProspectToLead(prospectId, "Fixture Admin");',
      'assert.equal(lead1.id,lead2.id);',
      'assert.equal(crmStorage.getLeads().length,1);'
    ].join("\n");
    const result = spawnSync(process.execPath,
      ["--import", path.join(root, "node_modules/tsx/dist/loader.mjs"), "--input-type=module", "-e", code],
      { cwd: tmp, encoding: "utf8", timeout: 12000,
        env: { ...process.env, ENCRYPTION_KEY: "a".repeat(64), OLLAMA_BASE_URL: "http://127.0.0.1:1" } });
    assert.equal(result.status, 0, result.stderr || result.stdout || String(result.error));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
