import { test } from "node:test";
import assert from "node:assert/strict";
import { NEW_LEAD_DRAFT_KEY, clearNewLeadDraft, readNewLeadDraft, saveNewLeadDraft,
  type NewLeadDraft } from "../src/crm/newLeadDraft";

function withTabStorage(run: (store: Map<string,string>)=>void) {
  const store = new Map<string,string>();
  const old = Object.getOwnPropertyDescriptor(globalThis,"window");
  Object.defineProperty(globalThis,"window",{configurable:true,value:{
    sessionStorage:{
      getItem:(k:string)=>store.get(k)??null,
      setItem:(k:string,v:string)=>{store.set(k,v);},
      removeItem:(k:string)=>{store.delete(k);}
    }
  }});
  try {run(store);}
  finally {
    if(old)Object.defineProperty(globalThis,"window",old);
    else Reflect.deleteProperty(globalThis,"window");
  }
}
const draft:NewLeadDraft={
  name:"Test Lead",company:"Synthetic Example Ltd",email:"example@example.invalid",
  phone:"",whatsapp:"",location:"Castries",serviceRequested:"Managed IT Support",
  estimatedValue:"6000",priority:"Medium",leadSource:"Direct Phone Call",message:"Unsubmitted only"
};

test("CRM draft survives re-authentication reload in the same tab and clears after confirmed save",()=>{
  withTabStorage(store=>{
    assert.equal(readNewLeadDraft(),null);
    saveNewLeadDraft(draft);
    assert.deepEqual(readNewLeadDraft(),draft);
    assert.equal(store.has(NEW_LEAD_DRAFT_KEY),true);
    clearNewLeadDraft();
    assert.equal(readNewLeadDraft(),null);
  });
});

test("CRM lead estimate is stored as typed text; first keypress 6000 is not prefixed with zero",()=>{
  withTabStorage(()=>{
    saveNewLeadDraft({...draft,estimatedValue:"6000"});
    assert.equal(readNewLeadDraft()?.estimatedValue,"6000");
    assert.equal(Number(readNewLeadDraft()?.estimatedValue),6000);
  });
});

test("stale and malformed drafts cannot prefill a new lead",()=>{
  withTabStorage(store=>{
    store.set(NEW_LEAD_DRAFT_KEY,JSON.stringify({savedAt:Date.now()-9*60*60*1000,draft}));
    assert.equal(readNewLeadDraft(),null);
    store.set(NEW_LEAD_DRAFT_KEY,"not json");
    assert.equal(readNewLeadDraft(),null);
    store.set(NEW_LEAD_DRAFT_KEY,JSON.stringify({savedAt:Date.now(),draft:{...draft,name:27}}));
    assert.equal(readNewLeadDraft(),null);
  });
});