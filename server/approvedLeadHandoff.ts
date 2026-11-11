/**
 * V79 Ecosystem v2: consented, staff-approved website → Tiquet handoff.
 * Never guess a CRM-to-website lead association from email/company names.
 * The Website owns the original enquiry. Tiquet owns the service customer/job.
 */
export const reviewModeEnabled = () => process.env.V79_ECOSYSTEM_V2_REVIEW_MODE === "1";
const SAFE_ID = /^[A-Za-z0-9._:@-]{4,180}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ApprovedHandoffResult =
  | { status:"confirmed"; clientId:string; jobId:string }
  | { status:"unavailable" }
  | { status:"rejected" };

export function findExactlyLinkedWebsiteLead(
  websiteLeads: Array<Record<string, unknown>>, crmLeadId:number,
) {
  if (!Number.isSafeInteger(crmLeadId) || crmLeadId <= 0) return null;
  const exact = websiteLeads.filter(v=>v.crmLeadId === crmLeadId);
  if (exact.length !== 1) return null;
  const lead=exact[0];
  if (!Number.isSafeInteger(lead.id) || Number(lead.id)<=0 ||
      !UUID.test(String(lead.tiquetEventId || ""))) return null;
  return lead;
}

export function hasApprovalToSend(lead:Record<string,unknown>, mode=reviewModeEnabled()) {
  return !mode || lead.tiquetApproval === "approved";
}

/**
 * Handles the existing Tiquet idempotent intake endpoint. No credentials
 * in persisted errors or outgoing response. A 2xx without BOTH IDs is
 * inconclusive and MUST NOT mark a conversion complete.
 */
export async function deliverApprovedTiquetLead({
  lead, url, secret, fetcher = fetch,
}:{
  lead:Record<string,unknown>; url:string; secret:string; fetcher?:typeof fetch;
}):Promise<ApprovedHandoffResult> {
  if(!lead || lead.tiquetApproval!=="approved" || !UUID.test(String(lead.tiquetEventId||"")) ||
     typeof secret!=="string" || secret.length<24) return {status:"unavailable"};
  let target:URL;
  try {
    target=new URL(url);
    if (!["http:","https:"].includes(target.protocol) ||
        !target.hostname || target.username || target.password ||
        target.pathname!=="/api/public/intake" || target.search || target.hash)
      return {status:"unavailable"};
  }catch {return {status:"unavailable"};}
  const payload={
    eventId:lead.tiquetEventId,
    source:"website2026-approved",
    name:lead.name,company:lead.company,email:lead.email,phone:lead.phone,
    employees:lead.employees||undefined,
    biggestChallenge:lead.biggestChallenge||undefined,
    message:lead.message||undefined,
  };
  if(![payload.name,payload.company,payload.email,payload.phone].every(v=>
    typeof v==="string" && v.length>0 && v.length<=250)) return {status:"rejected"};
  try {
    const response=await fetcher(target.toString(),{
      method:"POST",headers:{"Content-Type":"application/json","X-Intake-Secret":secret},
      body:JSON.stringify(payload),signal:AbortSignal.timeout(8000),
    });
    if(response.status===408 || response.status===429 || response.status>=500)
      return {status:"unavailable"};
    if(!response.ok) return {status:"rejected"};
    const body=await response.json().catch(()=>null);
    if(!body || body.success!==true ||
       !SAFE_ID.test(body.clientId||"") || !SAFE_ID.test(body.jobId||""))
      return {status:"unavailable"};
    return {status:"confirmed",clientId:body.clientId,jobId:body.jobId};
  }catch{return {status:"unavailable"};}
}
