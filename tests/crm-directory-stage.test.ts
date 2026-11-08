import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("existing imported CSV records stage once without creating leads or losing existing prospects", () => {
  const root=process.cwd();
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),"v79-crm-directory-sync-"));
  try {
    const code=[
      'import assert from "node:assert/strict";',
      'import {crmStorage} from '+JSON.stringify(path.join(root,"server/crm_storage.ts"))+';',
      'import {writeJSON} from '+JSON.stringify(path.join(root,"server/persistence.ts"))+';',
      'const directory=Array.from({length:100},(_,i)=>({businessName:"Fixture Business "+i,category:"Professional Services",location:"Castries",email:"fixture"+i+"@example.test"}));',
      'writeJSON("business-directory.json",directory);',
      'const fromPreviousSearch=await crmStorage.runProspectSearch({source:"directory",limit:1});',
      'assert.equal(fromPreviousSearch.newCount,1);',
      'const oldProspect=crmStorage.getProspects()[0];',
      'const existingLead=crmStorage.approveProspectToLead(oldProspect.id);',
      'const before=crmStorage.getLeads().length;',
      'const first=crmStorage.stageImportedDirectoryProspects();',
      'assert.equal(first.staged,99);',
      'assert.equal(first.directoryCount,100);',
      'assert.equal(first.total,100);',
      'assert.equal(crmStorage.getProspects().length,100);',
      'assert.equal(crmStorage.getLeads().length,before);',
      'assert.equal(crmStorage.getProspects().find(p=>p.id===oldProspect.id).convertedLeadId,existingLead.id);',
      'assert.equal(crmStorage.getProspects().filter(p=>p.workflowStatus==="discovered").length,99);',
      'const second=crmStorage.stageImportedDirectoryProspects();',
      'assert.equal(second.staged,0);',
      'assert.equal(crmStorage.getProspects().length,100);',
      'directory.push({businessName:"Fixture Business 100",location:"Vieux Fort"});',
      'writeJSON("business-directory.json",directory);',
      'const third=crmStorage.stageImportedDirectoryProspects();',
      'assert.equal(third.staged,1);',
      'assert.equal(third.total,101);',
      'assert.equal(crmStorage.getLeads().length,before);'
    ].join("\n");
    const execution=spawnSync(process.execPath,
      ["--import",path.join(root,"node_modules/tsx/dist/loader.mjs"),"--input-type=module","-e",code],
      {cwd:temp,encoding:"utf8",timeout:18000,env:{
        ...process.env,ENCRYPTION_KEY:"a".repeat(64),OLLAMA_BASE_URL:"http://127.0.0.1:1",
        CRM_PUBLIC_DISCOVERY_ENABLED:"false",CRM_GEOAPIFY_DISCOVERY_ENABLED:"false"
      }});
    assert.equal(execution.status,0,execution.stderr||execution.stdout||String(execution.error));
  } finally {
    fs.rmSync(temp,{recursive:true,force:true});
  }
});
