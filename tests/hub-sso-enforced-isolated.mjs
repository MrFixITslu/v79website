// No real Hub account, MFA session, network delivery or customer data is used.
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {createServer} from "node:net";
import {mkdtempSync,mkdirSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {randomBytes} from "node:crypto";

const repo=process.cwd();
const temp=mkdtempSync(join(tmpdir(),"v79-website-sso-enforced-"));
mkdirSync(join(temp,"data"));
const bundle=resolve(repo,"dist/server/server.cjs");
const freePort=await new Promise((ok,fail)=>{
  const listener=createServer();
  listener.once("error",fail);
  listener.listen(0,"127.0.0.1",()=>{
    const port=listener.address().port;
    listener.close(()=>ok(port));
  });
});
const base="http://127.0.0.1:"+freePort;
const env={
  ...process.env,
  PORT:String(freePort),NODE_ENV:"production",CANONICAL_DOMAIN:base,
  CLIENT_DIST:resolve(repo,"dist/client"),CAPTCHA_MODE:"disabled",
  ADMIN_PASSWORD:"Synthetic-Website-Password-2026-Only",
  ADMIN_RESET_TOKEN:"",
  ENCRYPTION_KEY:randomBytes(32).toString("hex"),
  WEBSITE_HUB_SSO_ENABLED:"true",
  WEBSITE_HUB_SSO_ENFORCED:"true",
  V79_WEBSITE_SSO_SHARED_SECRET:"synthetic-sso-only-do-not-use-outside-ci-1234567890123456",
  WEBSITE_HUB_SSO_INTERNAL_URL:"http://v79-hub:3040",
  CRM_PUBLIC_DISCOVERY_ENABLED:"false",
  CRM_GEOAPIFY_DISCOVERY_ENABLED:"false",
  OLLAMA_BASE_URL:"http://127.0.0.1:9",
};
let child,logs="";
const request=async (path,options={})=>fetch(base+path,{
  redirect:"manual",...options,
  headers:{origin:base,...options.headers}
});
try {
  child=spawn(process.execPath,[bundle],{cwd:temp,env,stdio:["ignore","pipe","pipe"]});
  child.stdout.on("data",c=>{logs+=String(c).slice(0,500)});
  child.stderr.on("data",c=>{logs+=String(c).slice(0,500)});
  let ready=false;
  for(let i=0;i<80;i++){
    if(child.exitCode!==null)throw Error("Preview exited before readiness");
    try{if((await request("/api/ready")).status===200){ready=true;break}}catch{}
    await new Promise(done=>setTimeout(done,100));
  }
  assert.ok(ready,"Isolated preview must become ready (no external Hub required)");
  const config=await request("/api/admin/hub-sso/config");
  assert.equal(config.status,200);
  assert.deepEqual(await config.json(),{enabled:true,enforced:true});
  const login=await request("/api/admin/login",{
    method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({password:env.ADMIN_PASSWORD})
  });
  assert.equal(login.status,403,"even correct synthetic legacy password is forbidden");
  assert.equal((await login.json()).code,"HUB_SSO_REQUIRED");
  const change=await request("/api/admin/change-password",{
    method:"POST",headers:{"content-type":"application/json"},body:"{}"
  });
  assert.equal(change.status,403,"password reset/change cannot bypass Hub enforcement");
  for(const path of [
    "/api/admin/verify-session",
    "/api/admin/crm/leads",
    "/api/admin/crm/metrics",
    "/api/admin/newsletter/subscribers",
  ]){
    assert.equal((await request(path)).status,401,path+" must deny anonymous access");
  }
  const forgedNotes=await request("/api/admin/crm/leads/999",{
    method:"PUT",headers:{"content-type":"application/json"},
    body:JSON.stringify({adminNotes:"Unauthorised write"})
  });
  assert.equal(forgedNotes.status,401,"CRM write requires Hub owner session");
  assert.equal((await request("/api/admin/hub-sso/callback?state=bad&code=bad")).status,401,
    "callback must require valid browser-bound state and PKCE");
  const start=await request("/api/admin/hub-sso/start");
  assert.equal(start.status,302);
  const redirect=new URL(start.headers.get("location"));
  assert.equal(redirect.origin,"https://hub.v79sl.com");
  assert.equal(redirect.pathname,"/api/website-sso/authorize");
  assert.equal(redirect.searchParams.get("redirect_uri"),"https://v79sl.com/api/admin/hub-sso/callback");
  assert.match(start.headers.get("set-cookie")||"",/HttpOnly/i);
  assert.match(start.headers.get("set-cookie")||"",/SameSite=Lax/i);
  assert.equal((await request("/")).status,200,"public website remains accessible");
  console.log("ENFORCED_HUB_SSO_ANONYMOUS_AND_LEGACY_DENIAL=PASS");
  console.log("HUB_SSO_BROWSER_FLOW_ORIGIN_AND_COOKIE=PASS");
  console.log("PUBLIC_WEBSITE_ACCESS_PRESERVED=PASS");
  console.log("REAL_HUB_SESSIONS_OR_SECRETS_USED=NO");
  console.log("PRODUCTION_CHANGES=NONE");
}finally{
  if(child && child.exitCode===null && child.signalCode===null){
    child.kill("SIGTERM");
    await Promise.race([
      new Promise(resolve=>child.once("exit",resolve)),
      new Promise(resolve=>setTimeout(resolve,2500))
    ]);
    if(child.exitCode===null && child.signalCode===null)child.kill("SIGKILL");
  }
  rmSync(temp,{recursive:true,force:true});
}
