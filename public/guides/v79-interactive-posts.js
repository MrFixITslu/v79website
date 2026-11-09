/* V79 Digital — shared interactivity for static, self-contained educational posts.
   All educational text exists in HTML and remains readable without JavaScript. */
(() => {
 "use strict";
 const root=document.querySelector('main[data-v79-guide]');
 if(!root)return;
 const scenario=root.querySelector('#scenario');
 if(scenario){
  const feedback=scenario.querySelector('.feedback');
  scenario.querySelectorAll('button[data-feedback]').forEach(button=>{
   button.addEventListener('click',()=>{
    scenario.querySelectorAll('button[data-feedback]').forEach(b=>b.setAttribute('aria-pressed','false'));
    button.setAttribute('aria-pressed','true');
    feedback.textContent=button.getAttribute('data-feedback')||'';
   });
  });
 }
 const field=root.querySelector('#plan-topic'),result=root.querySelector('#plan-output');
 const original=result?.textContent||'';
 function update(){
  if(!field||!result)return;
  const chosen=field.value.trim();
  result.textContent=original.replace('[YOUR MAIN PRIORITY]',chosen||'[YOUR MAIN PRIORITY]');
 }
 if(field)field.addEventListener('input',update);
 const checklist=root.querySelector('#checklist');
 if(checklist){
  function progress(){
   const inputs=[...checklist.querySelectorAll('input[type=checkbox]')];
   const done=inputs.filter(i=>i.checked).length;
   const label=root.querySelector('#check-progress');
   if(label) label.textContent=done+' of '+inputs.length+' steps marked complete.';
  }
  checklist.querySelectorAll('input[type=checkbox]').forEach(x=>x.addEventListener('change',progress));
  progress();
 }
 async function copy(text){
  try{
   if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
   else throw Error('Clipboard API unavailable');
  }catch{
   const box=document.createElement('textarea');
   box.value=text;box.style.cssText='position:fixed;left:-10000px;top:0';
   document.body.append(box);box.select();
   try{if(!document.execCommand('copy'))throw Error('Copy failed')}
   finally{box.remove()}
  }
 }
 const copyButton=root.querySelector('#copy-plan');
 if(copyButton&&result)copyButton.addEventListener('click',async()=>{
  try{await copy(result.textContent||'');copyButton.textContent='Copied ✓';}
  catch{copyButton.textContent='Select the text above to copy';}
 });
 const quiz=root.querySelector('#knowledge-quiz');
 if(quiz)quiz.addEventListener('submit',e=>{
  e.preventDefault();
  const questions=[...quiz.querySelectorAll('fieldset[data-answer]')];
  let correct=0;
  questions.forEach(q=>{
    const selected=q.querySelector('input:checked');
    if(selected&&selected.value===q.getAttribute('data-answer'))correct++;
  });
  const output=root.querySelector('#quiz-result');
  if(output){
   output.textContent=correct+' out of '+questions.length+' correct. '+(correct===questions.length?'Excellent — you can put these ideas into practice.':'Review the lesson and try again.');
   output.focus();
  }
 });
 const share=root.querySelector('#share-guide');
 if(share)share.addEventListener('click',async()=>{
  try{
   if(navigator.share){await navigator.share({title:document.title,url:location.href});return;}
   await copy(location.href);
   share.textContent='Link copied ✓';
  }catch{share.textContent='Copy this page address to share';}
 });
})();
