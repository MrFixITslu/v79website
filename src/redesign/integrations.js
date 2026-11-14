export async function recaptchaToken(config) {
  if (!config.captchaEnabled) return '';
  if (!config.recaptchaSiteKey) throw Error('Verification is unavailable. Please call or email us.');
  const key=config.recaptchaSiteKey;
  if(!window.grecaptcha?.execute) await new Promise((resolve,reject)=>{
    let s=document.getElementById('v79-recaptcha-script');
    const timer=setTimeout(()=>reject(Error('Verification timed out. Please try again.')),10000);
    const done=()=>{clearTimeout(timer);resolve();};
    if(!s){s=document.createElement('script');s.id='v79-recaptcha-script';s.src='https://www.google.com/recaptcha/api.js?render='+encodeURIComponent(key);s.async=true;document.head.append(s);}
    s.addEventListener('load',done,{once:true});s.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Verification could not load. Please call or email us.'));},{once:true});
    if(window.grecaptcha?.execute)done();
  });
  return await Promise.race([new Promise((resolve,reject)=>window.grecaptcha.ready(()=>window.grecaptcha.execute(key,{action:'submit'}).then(resolve,reject))),new Promise((_,reject)=>setTimeout(()=>reject(Error('Verification timed out.')),10000))]);
}
export function initContact(root){
 const form=root.querySelector('#contactForm');if(!form)return;
 let requestId=crypto.randomUUID(),lastPayload='';
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity()||form.dataset.busy)return;
  const button=form.querySelector('[type=submit]'),status=root.querySelector('#contactStatus');
  form.dataset.busy='true';button.disabled=true;status.setAttribute('role','status');status.textContent='Sending your enquiry…';
  try{
   const value=id=>root.querySelector('#'+id).value.trim();
   const campaign=['utm_source','utm_medium','utm_campaign'].map(k=>new URL(location.href).searchParams.get(k)).filter(Boolean);
   const body={name:value('cName'),company:value('cCompany'),email:value('cEmail'),phone:value('cPhone'),serviceRequested:value('cTopic'),message:value('cMessage'),pageOrigin:location.pathname+location.search,leadSource:campaign.length?'Website Contact Form ('+campaign.join(' / ')+')':'Website Contact Form'};
   const payload=JSON.stringify(body);if(lastPayload&&payload!==lastPayload)requestId=crypto.randomUUID();lastPayload=payload;
   const cr=await fetch('/api/config',{signal:AbortSignal.timeout(15000)});if(!cr.ok)throw Error('Verification configuration unavailable.');
   const token=await recaptchaToken(await cr.json());
   const r=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestId},body:JSON.stringify({...body,recaptchaToken:token}),signal:AbortSignal.timeout(20000)});
   const data=await r.json();if(!r.ok)throw Error(data.error||'Enquiry could not be saved.');
   status.textContent='Thank you. Your enquiry has been saved (reference '+data.id+'). Our team will follow up with you.';
   form.reset();requestId=crypto.randomUUID();lastPayload='';
  }catch(error){status.setAttribute('role','alert');status.textContent=error.message||'Connection failed. Please try again or call us.';}
  finally{delete form.dataset.busy;button.disabled=false;}
 });
}
export async function loadResources(root){
 const container=root.querySelector('#publishedArticles');if(!container)return;
 try{
  const r=await fetch('/api/articles',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const rows=await r.json();
  if(!Array.isArray(rows))throw Error();container.replaceChildren();
  if(!rows.length){container.textContent='New articles will appear here when published.';return;}
  for(const row of rows){const a=document.createElement('a');a.className='guide-card';a.href='/resources?article='+encodeURIComponent(row.slug);const h=document.createElement('h3');h.textContent=row.title;const p=document.createElement('p');p.className='guide-summary';p.textContent=row.description||'';a.append(h,p);container.append(a);}
 }catch{container.textContent='Published articles could not load. Please refresh to try again.';}
}
