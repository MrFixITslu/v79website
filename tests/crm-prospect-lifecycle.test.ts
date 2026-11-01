import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("rejected prospects are recoverable and approved records cannot be rejected", () => {
  const folder = mkdtempSync(join(tmpdir(), "v79-crm-lifecycle-"));
  try {
    const code = [
      'import assert from "node:assert/strict";',
      'import {crmStorage} from '+JSON.stringify(join(process.cwd(), "server/crm_storage.ts"))+';',
      'import {writeJSON} from '+JSON.stringify(join(process.cwd(), "server/persistence.ts"))+';',
      'writeJSON("business-directory.json",[{businessName:"Fixture Law Firm",category:"Law Firm",location:"Castries"},{businessName:"Fixture Resort",category:"Hospitality",location:"Gros Islet"}]);',
      'let result=crmStorage.stageImportedDirectoryProspects();',
      'assert.equal(result.staged,2);',
      'const all=crmStorage.getProspects();',
      'const firm=all.find(p=>p.businessName==="Fixture Law Firm");',
      'const resort=all.find(p=>p.businessName==="Fixture Resort");',
      'assert.equal(crmStorage.rejectProspect(firm.id),true);',
      'assert.equal(crmStorage.rejectProspect(firm.id),true);',
      'let rejected=crmStorage.getProspects().find(p=>p.id===firm.id);',
      'assert.equal(rejected.workflowStatus,"rejected");',
      'assert.ok(rejected.archivedAt);',
      'assert.equal(crmStorage.restoreArchivedProspect(firm.id)?.workflowStatus,"discovered");',
      'assert.equal(crmStorage.getProspects().find(p=>p.id===firm.id).archivedAt,undefined);',
      'assert.equal(crmStorage.restoreArchivedProspect(firm.id),null);',
      'const lead=crmStorage.approveProspectToLead(resort.id);',
      'assert.ok(lead.id);',
      'assert.equal(crmStorage.rejectProspect(resort.id),false);',
      'assert.equal(crmStorage.getProspects().find(p=>p.id===resort.id).workflowStatus,"approved");',
      'assert.equal(crmStorage.getProspects().find(p=>p.id===resort.id).convertedLeadId,lead.id);',
      'assert.equal(crmStorage.bulkRejectProspects([resort.id,firm.id]),1);',
      'assert.equal(crmStorage.getLeads().length,1);',
      'assert.equal(crmStorage.getProspects().length,2);'
    ].join("\n");
    const result = spawnSync(process.execPath, ["--import", join(process.cwd(), "node_modules/tsx/dist/loader.mjs"), "--input-type=module", "-e", code], {
      cwd: folder, encoding: "utf8", timeout: 25000, env: { ...process.env, ENCRYPTION_KEY: "f".repeat(64) }
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
