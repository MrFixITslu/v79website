/* Vision79 Digital FAQ discovery: makes the existing /faq visible on the public site.
   Idempotent, conservative DOM enhancement; does not change React state or the FAQ itself. */
(()=> {
 "use strict";
 function install(){
  if(location.pathname==="/faq")return;
  const desktop=document.querySelector('header nav[aria-label="Main Navigation"]');
  if(desktop&&!desktop.querySelector('a[data-v79-faq]')){
   const anchor=document.createElement('a');
   anchor.href="/faq";
   anchor.textContent="FAQ";
   anchor.dataset.v79Faq="header";
   anchor.setAttribute("aria-label","Frequently Asked Questions");
   anchor.className="relative z-10 inline-flex items-center min-h-11 px-3 py-2 text-xs font-semibold tracking-wide text-app-text-sec hover:text-v79-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded-lg";
   desktop.append(anchor);
  }
  const footer=document.querySelector('footer');
  if(footer&&!footer.querySelector('a[data-v79-faq]')){
    const guide=footer.querySelector('a[href="/free-ai-prompting-guide"]');
    const sibling=guide?.closest("li");
    if(sibling?.parentElement){
      const li=document.createElement('li');
      const a=document.createElement('a');
      a.href="/faq";a.textContent="Frequently Asked Questions";
      a.dataset.v79Faq="footer";a.className=guide.className;
      li.append(a);
      sibling.insertAdjacentElement("afterend",li);
    }else{
      const a=document.createElement('a');
      a.href="/faq";a.textContent="Frequently Asked Questions";
      a.dataset.v79Faq="footer";a.className="text-xs font-semibold underline";
      footer.append(a);
    }
  }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
 const obs=new MutationObserver(()=>install());
 obs.observe(document.documentElement,{childList:true,subtree:true});
 // Existing React route renders sometimes replace nav/footer: keep it idempotent for the tab.
 window.addEventListener("pageshow",install);
})();
