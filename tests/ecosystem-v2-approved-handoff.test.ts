import { test } from "node:test";
import assert from "node:assert/strict";
import { findExactlyLinkedWebsiteLead, hasApprovalToSend, deliverApprovedTiquetLead } from "../server/approvedLeadHandoff";

const eventId="11111111-2222-4333-8444-555555555555";
const lead={
  id:5,crmLeadId:9,tiquetEventId:eventId,tiquetApproval:"approved",
  tiquetSyncStatus:"awaiting_delivery",
  name:"John",company:"SME",email:"john@example.com",phone:"17581234567",
};
const url="http://tiquet-service:3050/api/public/intake";
const secret="s".repeat(40);
test("only explicitly linked website lead maps to CRM",()=>{
 assert.equal(findExactlyLinkedWebsiteLead([lead],9)?.id,5);
 assert.equal(findExactlyLinkedWebsiteLead([lead],10),null);
 assert.equal(findExactlyLinkedWebsiteLead([lead,{...lead,id:6}],9),null);
 assert.equal(findExactlyLinkedWebsiteLead([{...lead,tiquetEventId:"unknown"}],9),null);
 assert.equal(findExactlyLinkedWebsiteLead([{...lead,crmLeadId:"9"}],9),null);
});
test("review mode blocks all unapproved Tiquet delivery",()=>{
 assert.equal(hasApprovalToSend(lead,true),true);
 assert.equal(hasApprovalToSend({...lead,tiquetApproval:"awaiting_approval"},true),false);
 assert.equal(hasApprovalToSend({...lead,tiquetApproval:"awaiting_approval"},false),true);
});
test("no secret or unreviewed lead means no network call",async()=>{
 let called=false;
 const fake=(async()=>{called=true;throw Error("should not be called")}) as typeof fetch;
 for(const input of [
  {lead:{...lead,tiquetApproval:"awaiting_approval"},secret},
  {lead,secret:"short"},
  {lead:{...lead,tiquetEventId:"bad"},secret},
 ]) {
  const result=await deliverApprovedTiquetLead({...input,url,fetcher:fake});
  assert.equal(result.status,"unavailable");
 }
 assert.equal(called,false);
});
test("only configured intake endpoint is permitted",async()=>{
 let called=false;
 const fake=(async()=>{called=true;throw Error("not allowed")}) as typeof fetch;
 for(const bad of [
  "https://example.com/private",
  "file:///etc/passwd",
  "https://user:pass@example.com/api/public/intake",
  "https://example.com/api/public/intake?override=1",
 ]) {
  assert.equal((await deliverApprovedTiquetLead({lead,url:bad,secret,fetcher:fake})).status,"unavailable");
 }
 assert.equal(called,false);
});
test("approved link must return real Tiquet client and job identities",async()=>{
 let attempts=0;let received:any;
 const fake=(async (_url:any,opts:any)=>{
  attempts++;received=JSON.parse(opts.body);
  assert.equal(opts.headers["X-Intake-Secret"],secret);
  return {ok:true,status:201,json:async()=>({
   success:true,clientId:"real-client-uuid",jobId:"real-job-uuid",
  })};
 }) as typeof fetch;
 const result=await deliverApprovedTiquetLead({lead,url,secret,fetcher:fake});
 assert.deepEqual(result,{status:"confirmed",clientId:"real-client-uuid",jobId:"real-job-uuid"});
 assert.equal(received.eventId,eventId);
 assert.equal(received.email,"john@example.com");
 assert.equal(attempts,1);
});
test("ambiguous 2xx responses are never accepted as verified conversions",async()=>{
 for(const obj of [{success:true,jobId:"job1"},{success:true,clientId:"client1"},{success:false,clientId:"client1",jobId:"job1"}]){
  const fake=(async()=>({ok:true,status:200,json:async()=>obj})) as typeof fetch;
  assert.equal((await deliverApprovedTiquetLead({lead,url,secret,fetcher:fake})).status,"unavailable");
 }
});
test("transient failures never manufacture a customer",async()=>{
 const fake=(async()=>({ok:false,status:503,json:async()=>null})) as typeof fetch;
 assert.equal((await deliverApprovedTiquetLead({lead,url,secret,fetcher:fake})).status,"unavailable");
});
test("source-code gate preserves legacy default and forbids hidden sends during review",async()=>{
 const {readFileSync}=await import("node:fs");
 const s=readFileSync(new URL("../server.ts",import.meta.url),"utf8");
 const helper=readFileSync(new URL("../server/approvedLeadHandoff.ts",import.meta.url),"utf8");
 assert.match(helper,/V79_ECOSYSTEM_V2_REVIEW_MODE/);
 assert.match(s,/reviewModeEnabled\(\) \? "awaiting_approval" : "pending"/);
 assert.match(s,/if \(!reviewModeEnabled\(\)\) \{/);
 assert.match(s,/if\(reviewModeEnabled\(\)\)\s+return res\.status\(409\)/);
 assert.match(s,/db\.setApprovedTiquetLink\(/);
});
