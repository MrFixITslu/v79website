/* Vision79 Digital — practical prompting lab, progressive enhancement only.
   The existing React newsletter form and download flow remain unchanged. */
(() => {
 "use strict";
 const examples = [
  ["Writing","Reply to a customer", "Act as a helpful customer service assistant for a small business in Saint Lucia.\n\nDraft a polite reply to this enquiry: [PASTE ENQUIRY].\n\nContext: [BUSINESS, PRICE OR POLICY THAT APPLIES].\n\nUse friendly UK English, keep it under 150 words, and end with one clear next step. Do not invent prices, policies or delivery times."],
  ["Office","Turn notes into actions", "Act as an organised office assistant.\n\nUse these meeting notes: [PASTE NOTES].\n\nCreate a table with: Decision | Action | Owner | Deadline.\n\nIf the owner or deadline was not provided, write 'Not specified'. Finish with three questions we need to clarify. Do not invent decisions."],
  ["Learning","Study a difficult topic", "Act as a patient tutor for an 18-year-old.\n\nExplain [TOPIC] in simple UK English.\n\nStart with one everyday Caribbean example, then give four short key points and three practice questions with answers. Avoid jargon until you explain it."],
  ["Research","Check facts before sharing", "Act as a careful researcher.\n\nI want to understand [TOPIC OR CLAIM].\n\nSeparate what is supported by evidence from assumptions and unknowns. State which details need current verification, recommend reliable primary sources, and do not invent quotations or links."],
  ["Marketing","Create a useful social post", "Act as a practical marketing adviser for a Caribbean SME.\n\nWrite a Facebook post about [SERVICE] for [CUSTOMER TYPE]. Our genuine benefit is [VERIFIED BENEFIT].\n\nUse a warm professional voice, one helpful tip, a short call to action and two opening alternatives. Do not promise guaranteed results."],
  ["Data","Understand a spreadsheet", "Act as an analyst. I'll paste a small table of non-sensitive figures below: [PASTE DATA].\n\nCheck for missing values, summarise three useful trends, show your calculations and recommend two questions to investigate. Clearly label any assumptions. Do not change or invent figures."],
  ["Planning","Plan a project", "Act as a project coordinator.\n\nGoal: [WHAT WE NEED TO COMPLETE]. Deadline: [DATE]. Team/resources: [DETAILS]. Constraints: [BUDGET, STAFF, HOURS].\n\nCreate five practical stages with owners, deliverables and risks. Highlight dependencies and the first next action."],
  ["Government","Explain a public notice", "Act as a plain-language communications editor.\n\nRewrite this public notice for an 18-year-old reader: [PASTE APPROVED NON-SENSITIVE NOTICE].\n\nKeep all official dates, requirements and contacts unchanged. Use headings: What changed, Who it affects, What to do, Where to get help. Flag anything unclear instead of guessing."],
  ["Support","Troubleshoot carefully", "Act as an IT support assistant.\n\nIssue: [DESCRIBE THE PROBLEM]. Device/service: [DETAILS]. What I tried: [STEPS].\n\nBegin with safe, reversible checks. For each step, explain what it tests and what result to expect. Say when to stop and seek expert support. Do not ask for passwords."],
  ["Improve","Review and improve an answer", "Review your previous answer as a critical editor.\n\nIdentify unsupported assumptions, missing facts, possible errors, privacy concerns and unnecessary complexity. Then give a clearer version using only supported information. Finish with three facts I should independently verify."]
 ];
 function e(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
 function copy(text, button) {
  const fallback=()=>{const box=document.createElement("textarea");box.value=text;box.setAttribute("readonly","");box.style.cssText="position:fixed;left:-10000px;top:0";document.body.append(box);box.select();const ok=document.execCommand("copy");box.remove();if(!ok)throw Error("copy unavailable")};
  Promise.resolve().then(async()=>{if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text)}catch{fallback()}}else fallback()})
  .then(()=>{button.textContent="Copied ✓";button.setAttribute("aria-label","Copied prompt to clipboard")})
  .catch(()=>{button.textContent="Select the prompt text to copy";button.setAttribute("aria-label","Select the prompt text to copy")});
 }
 function mount(){
  if(location.pathname!=="/free-ai-prompting-guide"||document.getElementById("v79-prompt-upgrade"))return;
  const email=document.getElementById("guide-email"),main=document.querySelector("#root main");
  if(!email||!main)return;
  const headerLink=document.querySelector('header a[href="/resources"]');
  if(headerLink){headerLink.textContent="← All Resources";headerLink.setAttribute("aria-label","All Resources")}
  const section=e("section","v79-prompt-upgrade");section.id="v79-prompt-upgrade";
  const wrap=e("div","v79-prompt-wrap");
  const top=e("div","v79-prompt-top");
  top.append(e("p","v79-eyebrow","Free practical lessons · No signup required"));
  top.append(e("h2",null,"Better prompts, better starting points."));
  top.append(e("p","v79-intro","Choose an example, replace the [BRACKETED DETAILS] with your information, and copy it into ChatGPT. These are real templates you can adapt — not one-click automations."));
  const formula=e("div","v79-formula");
  formula.setAttribute("aria-label","Five-part prompt structure");
  [["01","Role"],["02","Task"],["03","Context"],["04","Rules"],["05","Format"]].forEach(([n,label])=>{const item=e("span",null,n+" · "+label);formula.append(item)});
  top.append(formula);wrap.append(top);
  const before=e("section","v79-prompt-before");
  before.append(e("h3",null,"See the difference"));
  const comparison=e("div","v79-compare");
  const weak=e("div","v79-weak");weak.append(e("b",null,"Too vague"));weak.append(e("p",null,"“Write a business email.”"));
  const strong=e("div","v79-strong");strong.append(e("b",null,"Much clearer"));strong.append(e("p",null,"“Draft a friendly 120-word email to a customer confirming a meeting on Friday. Use UK English, include the confirmed time and ask them to reply if it needs changing. Don't invent details.”"));
  comparison.append(weak,strong);before.append(comparison);wrap.append(before);
  const lib=e("section","v79-prompt-library");lib.id="prompt-examples";
  lib.append(e("h3",null,"10 prompts you can use today"));
  lib.append(e("p","v79-section-lead","Real-life tasks for work, learning and small businesses. The text is visible without signing up."));
  const grid=e("div","v79-prompt-grid");
  examples.forEach(([tag,title,body],i)=>{
    const card=e("article","v79-prompt-card");
    const meta=e("div","v79-card-meta");meta.append(e("span","v79-card-number",String(i+1).padStart(2,"0")));meta.append(e("span","v79-card-tag",tag));
    card.append(meta,e("h4",null,title));
    const pre=e("pre","v79-prompt-text",body);pre.tabIndex=0;card.append(pre);
    const button=e("button","v79-copy","Copy prompt");button.type="button";button.setAttribute("aria-label","Copy "+title+" prompt");
    button.addEventListener("click",()=>copy(body,button));
    card.append(button);grid.append(card)
  });
  lib.append(grid);wrap.append(lib);
  const builder=e("section","v79-builder");builder.id="prompt-builder";
  builder.append(e("p","v79-eyebrow","Try it yourself"));
  builder.append(e("h3",null,"Build a prompt in a minute"));
  builder.append(e("p","v79-section-lead","Provide a goal and some background. The draft updates as you type."));
  const form=e("form","v79-builder-form");form.noValidate=true;
  function field(id,label,tag,options){
    const group=e("div","v79-field"), lab=e("label",null,label);lab.htmlFor=id;let el=e(tag,null);
    el.id=id;if(tag==="select"){options.forEach(o=>{const opt=e("option",null,o);opt.value=o;el.add(opt)})} else {el.rows=3;el.maxLength=1100}
    group.append(lab,el);return [group,el]
  }
  const [fr,role]=field("v79-builder-role","Choose a role","select",["Helpful office assistant","Teacher for a beginner","Customer service adviser","Small-business consultant","Careful researcher"]);
  const [fg,goal]=field("v79-builder-goal","What do you need?","textarea");goal.placeholder="For example: Write an email inviting customers to a free workshop.";
  const [fc,context]=field("v79-builder-context","What should AI know?","textarea");context.placeholder="For example: It is on 20 November in Saint Lucia; registration is free.";
  const [fo,format]=field("v79-builder-format","How should it reply?","select",["Short email","Numbered checklist","Simple table","Plain-English summary"]);
  for(const x of [fr,fg,fc,fo])form.append(x);
  const result=e("pre","v79-builder-result");result.id="v79-builder-result";result.tabIndex=0;
  const refresh=()=>{
    result.textContent="Act as a "+role.value.toLowerCase()+".\n\nTask: "+(goal.value.trim()||"[EXPLAIN YOUR GOAL]")+
      "\nContext: "+(context.value.trim()||"[ADD RELEVANT FACTS]")+
      "\n\nUse clear UK English. Do not invent facts. Flag anything missing and ask for details before making important assumptions."+
      "\n\nOutput: "+format.value+".";
  };
  [role,goal,context,format].forEach(el=>el.addEventListener("input",refresh));refresh();
  const buttons=e("div","v79-builder-actions"), copyBtn=e("button","v79-copy","Copy my prompt");copyBtn.type="button";copyBtn.addEventListener("click",()=>copy(result.textContent||"",copyBtn));
  buttons.append(copyBtn);form.append(result,buttons);builder.append(form);wrap.append(builder);
  const safety=e("p","v79-prompt-safety","Always check important claims, names, prices and dates before using AI output. Never paste passwords, private customer records or confidential government information into an unapproved tool.");
  wrap.append(safety);
  section.append(wrap);
  main.append(section);
  console.info("[V79] Updated prompts ready; newsletter form unchanged.");
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
 else mount();
 const observer=new MutationObserver(()=>{if(document.getElementById("v79-prompt-upgrade")){observer.disconnect();return}mount()});
 observer.observe(document.documentElement,{childList:true,subtree:true});
 setTimeout(()=>observer.disconnect(),18000);
})();
