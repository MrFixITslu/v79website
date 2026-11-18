import {PAGES,META} from '../shared/website-design';
import './redesign/theme.js';
import {initContact,loadResources} from './redesign/integrations.js';
const normalizePath=(p)=>p.replace(/\/+$/,'')||'/';
const isSpecial=(u=location)=>!!new URLSearchParams(u.search).get('article')||/^\/(free-ai-prompting-guide|course\/[a-zA-Z0-9_-]+)$/.test(normalizePath(u.pathname));
let specialMod=null,specialModPromise=null;
function loadSpecialMod(){if(!specialModPromise){specialModPromise=import('./redesign/SpecialPages').then(m=>{specialMod=m;return m;});}return specialModPromise;}
async function mountSpecial(root){try{const mod=await loadSpecialMod();await mod.mount(root);}catch{root.textContent='This page could not load. Please refresh or contact V79 Digital.';}}
function unmountSpecial(root){if(specialMod)specialMod.unmount(root);}
if(location.hash.startsWith('#/'))history.replaceState({},'',location.hash.slice(1));
const root=document.getElementById('pageRoot');
const menu=document.getElementById('menuBtn');
const nav=document.getElementById('mainNav');
let homeTimer=null,homeObserver=null,homeHandlers=[], pageMotion=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function $ (s){return root.querySelector(s)}
function $$ (s){return Array.from(root.querySelectorAll(s))}
function cleanHome(){if(homeTimer){clearInterval(homeTimer);homeTimer=null}if(homeObserver){homeObserver.disconnect();homeObserver=null}homeHandlers.forEach(([node,ev,fn])=>node.removeEventListener(ev,fn));homeHandlers=[];}
function on(node,ev,fn,opts){if(node){node.addEventListener(ev,fn,opts);homeHandlers.push([node,ev,fn])}}
function currentRoute(){return normalizePath(location.pathname)}
const APP_FAVICONS={hub:{icon:'/design-assets/apps/hub-icon.png',apple:'/design-assets/apps/hub-icon.png'},tiquet:{icon:'/design-assets/apps/tiquet-icon.png',apple:'/design-assets/apps/tiquet-icon.png'},pos:{icon:'/design-assets/apps/pos-favicon.png',apple:'/design-assets/apps/pos-icon.png'},ffpro:{icon:'/design-assets/apps/ffpro-icon.png',apple:'/design-assets/apps/ffpro-icon.png'},marketing:{icon:'/design-assets/apps/marketing-icon.png',apple:'/design-assets/apps/marketing-icon.png'},academy:{icon:'/design-assets/apps/academy-icon.png',apple:'/design-assets/apps/academy-icon.png'}};
function syncFavicon(r){const m=r.match(/^\/(?:apps|software)\/([a-z0-9-]+)$/);const app=m&&APP_FAVICONS[m[1]];const links=Array.from(document.querySelectorAll('link[rel="icon"]'));if(app){links.forEach(l=>{l.setAttribute('href',app.icon);l.setAttribute('type','image/png');});const apple=document.querySelector('link[rel="apple-touch-icon"]');if(apple)apple.setAttribute('href',app.apple);}else{links.forEach(l=>{const sizes=l.getAttribute('sizes');if(sizes==='32x32'){l.setAttribute('href','/favicon-32x32.png');l.setAttribute('type','image/png');}else if(sizes==='16x16'){l.setAttribute('href','/favicon-16x16.png');l.setAttribute('type','image/png');}else{l.setAttribute('href','/favicon.ico');l.removeAttribute('type');}});const apple=document.querySelector('link[rel="apple-touch-icon"]');if(apple)apple.setAttribute('href','/apple-touch-icon.png');}}
function syncSeoMeta(r,ttl,desc){
 const canonicalUrl='https://v79sl.com'+(r==='/'?'/':r);
 document.title=ttl;
 document.querySelector('meta[name=description]')?.setAttribute('content',desc);
 document.querySelector('link[rel="canonical"]')?.setAttribute('href',canonicalUrl);
 document.querySelector('meta[property="og:title"]')?.setAttribute('content',ttl);
 document.querySelector('meta[property="og:description"]')?.setAttribute('content',desc);
 document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonicalUrl);
 document.querySelector('meta[name="twitter:title"]')?.setAttribute('content',ttl);
 document.querySelector('meta[name="twitter:description"]')?.setAttribute('content',desc);
}
function syncNav(r){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰';for(const a of nav.querySelectorAll('a[href^="/"]')){let href=a.getAttribute('href');let active=r===href||(href!=='/'&&href!=='/services'&&r.startsWith(href+'/'))||(href==='/services'&&r.startsWith('/services')&&r!=='/services/website-design')||(href==='/solutions'&&r.startsWith('/apps/'))||(href==='/solutions'&&r.startsWith('/course/'))||(href==='/resources'&&(r==='/free-ai-prompting-guide'||!!new URLSearchParams(location.search).get('article')));a.removeAttribute('aria-current');if(active)a.setAttribute('aria-current','page');}}
function route(){cleanHome();let r=currentRoute();syncFavicon(r);if(isSpecial()){syncNav(r);window.scrollTo(0,0);void mountSpecial(root);return;}unmountSpecial(root);root.innerHTML=PAGES[r]||PAGES['/404'];root.querySelector('h1')?.setAttribute('tabindex','-1');const [ttl,desc]=META[r]||['Page not found | V79 Digital','This page could not be found on V79 Digital.'];syncSeoMeta(r,ttl,desc);syncNav(r);window.scrollTo(0,0);if(r==='/')initHome();if(r==='/services')initExploded();if(r.startsWith('/resources/'))initReadingProgress();if(r==='/faq')initFaq();if(r==='/contact')initContact(root);if(r==='/resources')loadResources(root);initAppGallery();initReveal();initTilt();}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰';});
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const u=new URL(a.href);if(u.origin!==location.origin)return;if(a.dataset.scroll&&currentRoute()==='/'){e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:pageMotion?'smooth':'auto'});return;}const targetPath=normalizePath(u.pathname);if(isSpecial(u)){e.preventDefault();history.pushState({},'',targetPath+u.search);route();return;}if(!PAGES[targetPath]||u.search||u.hash)return;e.preventDefault();history.pushState({},'',targetPath);route();document.querySelector('#pageRoot h1')?.focus({preventScroll:true});});
window.addEventListener('popstate',()=>route());
menu.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement){e.target.hidden=true;const fallback=e.target.nextElementSibling;if(fallback)fallback.hidden=false;}},true);
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');motionPreference.addEventListener('change',()=>{pageMotion=!motionPreference.matches;document.body.classList.toggle('motion-off',!pageMotion);if(!isSpecial())route();});
function initReveal(){if(!pageMotion||!('IntersectionObserver' in window)){root.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));return;}homeObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');entry.target.classList.remove('will-animate');homeObserver.unobserve(entry.target);}})},{threshold:.01,rootMargin:'180px 0px'});root.querySelectorAll('.reveal').forEach(e=>{if(e.getBoundingClientRect().top>innerHeight+180)e.classList.add('will-animate');else e.classList.add('visible');homeObserver.observe(e);});document.body.classList.add('motion-ready');}
function initTilt(){root.querySelectorAll('.service,.product,.interactive-card,.guide-card').forEach(card=>{let handle=e=>{if(!pageMotion||e.pointerType!=='mouse')return;const rect=card.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width-.5,y=(e.clientY-rect.top)/rect.height-.5;card.style.transform=`translate3d(0,-6px,0) perspective(1100px) rotateX(${(-y*5.5).toFixed(2)}deg) rotateY(${(x*5.5).toFixed(2)}deg)`;};let reset=()=>card.style.transform='';on(card,'pointermove',handle,{passive:true});on(card,'pointerleave',reset);on(card,'blur',reset);});}

function initAppGallery(){
 const g=$('[data-app-gallery]');if(!g)return;
 const thumbs=Array.from(g.querySelectorAll('[data-gallery-item]'));
 if(!thumbs.length)return;
 const mainImg=g.querySelector('[data-gallery-main-img]'),titleEl=g.querySelector('[data-gallery-title]'),capEl=g.querySelector('[data-gallery-caption]'),badgeEl=g.querySelector('[data-gallery-badge]'),countEl=g.querySelector('[data-gallery-counter]');
 const dialog=g.querySelector('[data-gallery-dialog]'),dImg=g.querySelector('[data-dialog-img]'),dTitle=g.querySelector('[data-dialog-title]'),dCap=g.querySelector('[data-dialog-caption]'),dBadge=g.querySelector('[data-dialog-badge]'),dCount=g.querySelector('[data-dialog-counter]');
 let idx=0;
 function setSlide(n){
  idx=(n+thumbs.length)%thumbs.length;
  const item=thumbs[idx],src=item.dataset.src||'',title=item.dataset.title||'',caption=item.dataset.caption||'',badge=item.dataset.badge||'Preview',counter=String(idx+1).padStart(2,'0')+' / '+String(thumbs.length).padStart(2,'0');
  if(mainImg){mainImg.hidden=false;mainImg.src=src;mainImg.alt=title;}
  if(titleEl)titleEl.textContent=title;
  if(capEl)capEl.textContent=caption;
  if(badgeEl)badgeEl.textContent=badge;
  if(countEl)countEl.textContent=counter;
  if(dImg){dImg.hidden=false;dImg.src=src;dImg.alt=title;}
  if(dTitle)dTitle.textContent=title;
  if(dCap)dCap.textContent=caption;
  if(dBadge)dBadge.textContent=badge;
  if(dCount)dCount.textContent=counter;
  g.querySelectorAll('[data-gallery-open]').forEach(btn=>btn.setAttribute('aria-label','Expand '+title+' preview'));
  thumbs.forEach((btn,i)=>{const act=i===idx;btn.classList.toggle('is-active',act);btn.setAttribute('aria-pressed',String(act));});
 }
 thumbs.forEach((btn,i)=>on(btn,'click',()=>setSlide(i)));
 g.querySelectorAll('[data-gallery-prev],[data-dialog-prev]').forEach(btn=>on(btn,'click',()=>setSlide(idx-1)));
 g.querySelectorAll('[data-gallery-next],[data-dialog-next]').forEach(btn=>on(btn,'click',()=>setSlide(idx+1)));
 g.querySelectorAll('[data-gallery-open]').forEach(btn=>on(btn,'click',()=>{if(dialog&&typeof dialog.showModal==='function'){dialog.showModal();}}));
 const closeBtn=g.querySelector('[data-dialog-close]');
 if(closeBtn&&dialog)on(closeBtn,'click',()=>dialog.close());
 if(dialog){
  on(dialog,'click',e=>{if(e.target===dialog)dialog.close();});
  on(dialog,'keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();setSlide(idx-1);}else if(e.key==='ArrowRight'){e.preventDefault();setSlide(idx+1);}});
 }
 setSlide(0);
}

function initExploded(){
 const section=$('#explode'),deck=$('#explodeDeck');if(!section||!deck)return;
 const tiles=Array.from(deck.querySelectorAll('[data-explode-tile]'));
 const lines=Array.from(deck.querySelectorAll('[data-explode-line]'));
 const rings=Array.from(deck.querySelectorAll('.explode-orbit-ring'));
 const centre=deck.querySelector('.explode-centre');
 // 6 orbital architectural vectors: [xNorm, yNorm, rotZdeg, tiltYdeg, tiltXdeg]
 const coords=[
  [-0.78,-0.72,-5,8,-5],
  [ 0.78,-0.72, 5,-8,-5],
  [-0.96, 0.02,-2,10,0],
  [ 0.96, 0.02, 2,-10,0],
  [-0.78, 0.74, 4,8,5],
  [ 0.78, 0.74,-4,-8,5]
 ];
 const descr=$('#explodeDescription'),caption=$('#explodeCaption'),bar=$('#explodeProgress'),toggleBtn=$('#explodeToggleBtn');
 let raf=0,lastStep=-1,forceExpanded=false,focusedIdx=-1;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches||!pageMotion||window.innerWidth<=800;

 lines.forEach(line=>{
  const len=Math.hypot(
   Number(line.getAttribute('x2'))-Number(line.getAttribute('x1')),
   Number(line.getAttribute('y2'))-Number(line.getAttribute('y1'))
  );
  line.style.strokeDasharray=len.toFixed(1);
  line.dataset.len=len.toFixed(1);
 });

 function update(){
  raf=0;
  const staticMode=reduced();
  const scrollDistance=Math.max(1,section.offsetHeight-innerHeight+80);
  const rawProgress=staticMode?1:Math.max(0,Math.min(1,(scrollY-section.offsetTop+120)/scrollDistance));
  const progress=forceExpanded?1:rawProgress;
  const visual=staticMode?1:forceExpanded?1:Math.max(0,Math.min(1,(progress-.06)/.78));
  const ease=visual<0.5?4*visual*visual*visual:1-Math.pow(-2*visual+2,3)/2;
  const radiusX=Math.min(deck.clientWidth*.36,275);
  const radiusY=Math.min(deck.clientHeight*.38,205);

  deck.classList.toggle('is-exploded',ease>0.55);
  deck.style.setProperty('--explode-ease',ease.toFixed(3));

  if(centre&&!staticMode){
   const cScale=1-0.08*ease;
   centre.style.transform=`translate3d(-50%,-50%,0) scale(${cScale.toFixed(3)})`;
  }else if(centre){
   centre.style.transform='';
  }

  rings.forEach((ring,idx)=>{
   ring.style.opacity=(0.15+0.55*ease).toFixed(2);
   ring.style.transform=`scale(${(0.74+(idx===0?0.28:0.22)*ease).toFixed(3)})`;
  });

  lines.forEach((line,i)=>{
   const len=Number(line.dataset.len||240);
   const draw=staticMode?1:Math.max(0,Math.min(1,(ease-i*0.04)/0.76));
   line.style.strokeDashoffset=(len*(1-draw)).toFixed(1);
   line.style.opacity=(draw*(focusedIdx===-1||focusedIdx===i?0.92:0.25)).toFixed(2);
   line.classList.toggle('is-highlighted',focusedIdx===i);
  });

  tiles.forEach((tile,i)=>{
   if(staticMode){
    tile.style.transform='';
    tile.style.opacity='1';
    tile.style.zIndex='3';
    return;
   }
   const [x,y,rotZ,rotY,rotX]=coords[i]||[0,0,0,0,0];
   const stagger=Math.max(0,Math.min(1,(visual-i*0.035)/0.82));
   const e=stagger*stagger*(3-2*stagger);
   const dx=x*radiusX*e;
   const dy=y*radiusY*e;
   const rz=rotZ*e;
   const ry=rotY*(1-e)*0.6;
   const rx=rotX*(1-e)*0.6;
   const sc=0.72+0.28*e+(focusedIdx===i?0.05:0);
   tile.style.transform=`translate3d(calc(-50% + ${dx.toFixed(1)}px),calc(-50% + ${dy.toFixed(1)}px),${(e*28).toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
   tile.style.opacity=(0.45+0.55*e).toFixed(2);
   tile.style.zIndex=focusedIdx===i?'9':String(3+i);
   tile.classList.toggle('is-dimmed',focusedIdx!==-1&&focusedIdx!==i);
   tile.classList.toggle('is-focused',focusedIdx===i);
  });

  if(bar)bar.style.width=(progress*100).toFixed(1)+'%';
  const step=staticMode||forceExpanded?3:progress<.22?0:progress<.50?1:progress<.80?2:3;
  if(step!==lastStep&&focusedIdx===-1){
   lastStep=step;
   const ds=[
    ['Six layers, one coherent business system.','01 / 04 · Unified core before separation'],
    ['Separate website presence from office infrastructure.','02 / 04 · Separating the layers'],
    ['Trace how security, cloud, and networks reinforce revenue.','03 / 04 · Inspecting vector dependencies'],
    ['Select any separated node to review scope and deliverables.','04 / 04 · Architecture fully separated']
   ];
   if(descr)descr.textContent=ds[step][0];
   if(caption)caption.textContent=ds[step][1];
  }
 }

 tiles.forEach((tile,i)=>{
  const enter=()=>{
   focusedIdx=i;
   const label=tile.querySelector('span')?.textContent||'Service layer';
   if(caption)caption.textContent=`Inspecting · ${label}`;
   update();
  };
  const leave=()=>{
   focusedIdx=-1;
   lastStep=-1;
   update();
  };
  on(tile,'pointerenter',enter);
  on(tile,'focus',enter);
  on(tile,'pointerleave',leave);
  on(tile,'blur',leave);
 });

 if(toggleBtn){
  on(toggleBtn,'click',()=>{
   forceExpanded=!forceExpanded;
   toggleBtn.setAttribute('aria-pressed',String(forceExpanded));
   toggleBtn.textContent=forceExpanded?'Follow scroll position':'Expand all layers';
   update();
  });
 }

 function schedule(){if(!raf)raf=requestAnimationFrame(update)}
 on(window,'scroll',schedule,{passive:true});
 on(window,'resize',schedule,{passive:true});
 update();
}

function initReadingProgress(){const bar=$('#readingProgress');if(!bar)return;let raf=0;function render(){raf=0;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);bar.style.width=(Math.max(0,Math.min(1,scrollY/max))*100).toFixed(2)+'%'}function req(){if(!raf)raf=requestAnimationFrame(render)}on(window,'scroll',req,{passive:true});on(window,'resize',req,{passive:true});render();}

function initHome(){const stages=[
 {title:'A customer request is captured',desc:'Instead of starting with disconnected messages, begin with a clear record and a reference to follow.',action:'Request recorded',detail:'An enquiry is ready for follow-up',tag:'RECEIVE'},
 {title:'A clear next step is assigned',desc:'The team can see what needs attention and who should follow up, reducing the need to chase for updates.',action:'Team action identified',detail:'Work stays visible as it progresses',tag:'MANAGE'},
 {title:'Progress is easier to review',desc:'A shared history makes follow-through and later improvements simpler. This is an example of the intended workflow, not a live integration.',action:'Next step documented',detail:'Follow-up and context kept together',tag:'REVIEW'}];
 let stage=0;const auto=$('#autoBtn'),motionBtn=$('#motionBtn'),heroExplodeBtn=$('#heroExplodeBtn'),heroStack=$('#heroStack'),heroExplodeLabel=$('#heroExplodeLabel');
 function applyStage(n){stage=(n+stages.length)%stages.length;const d=stages[stage];for(const [id,value] of [['#stageTitle',d.title],['#stageDesc',d.desc],['#stageAction',d.action],['#stageDetail',d.detail],['#stageTag',d.tag],['#stageIcon',String(stage+1).padStart(2,'0')],['#stageProgress','Step '+(stage+1)+' of 3']]){let el=$(id);if(el)el.textContent=value;}let bar=$('#stageBar');if(bar)bar.style.width=((stage+1)/3*100)+'%';$$('.step').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===stage)));let board=$('#workflowBoard');if(board&&pageMotion){board.classList.remove('animated');void board.offsetWidth;board.classList.add('animated');}}
 function pause(){if(homeTimer){clearInterval(homeTimer);homeTimer=null;}if(auto){auto.textContent='▶ Resume the story';auto.setAttribute('aria-pressed','false');}}
 function play(){if(homeTimer||!pageMotion||document.hidden)return;if(auto){auto.textContent='Ⅱ Pause the story';auto.setAttribute('aria-pressed','true');}homeTimer=setInterval(()=>applyStage(stage+1),2900);}
 $$('.step').forEach(b=>on(b,'click',()=>{pause();applyStage(Number(b.dataset.stage));}));on(auto,'click',()=>homeTimer?pause():play());
 if(heroExplodeBtn&&heroStack){
  on(heroExplodeBtn,'click',()=>{
   const next=heroStack.getAttribute('data-exploded')!=='true';
   heroStack.setAttribute('data-exploded',String(next));
   heroExplodeBtn.setAttribute('aria-pressed',String(next));
   if(heroExplodeLabel)heroExplodeLabel.textContent=next?'Collapse stack view':'Explode stack view';
  });
 }
 function setMotion(state){pageMotion=state;document.body.classList.toggle('motion-off',!state);if(motionBtn){motionBtn.textContent='Motion: '+(state?'ON':'OFF');motionBtn.setAttribute('aria-pressed',String(!state));}if(state)play();else pause();}
 on(motionBtn,'click',()=>setMotion(!pageMotion));let visibility=()=>{if(document.hidden){if(homeTimer){clearInterval(homeTimer);homeTimer=null;}}else if(pageMotion)play()};on(document,'visibilitychange',visibility);
 const options={
  web:{n:'02 / 04',title:'Websites built to earn client trust and enquiries.',desc:'Fast, mobile-first websites with structured SEO, clear service messaging, and lead capture built around how small businesses actually win work.',symbol:'WEB',width:'50%'},
  it:{n:'03 / 04',title:'Less downtime. More peace of mind.',desc:'Proactive IT support, MFA hardening, and tested backups so essential office systems keep running smoothly.',symbol:'ICT',width:'75%'},
  work:{n:'01 / 04',title:'A clearer way to work.',desc:'Connect service, sales, financial planning, marketing and learning through V79 business applications.',symbol:'HUB',width:'25%'},
  ai:{n:'04 / 04',title:'AI with a practical purpose.',desc:'Automate repeat admin tasks safely with team training and clear human review boundaries.',symbol:'AI',width:'100%'}
 };
 $$('.solution-chip').forEach(btn=>on(btn,'click',()=>{let d=options[btn.dataset.focus];if(!d)return;$$('.solution-chip').forEach(b=>{let act=b===btn;b.classList.toggle('is-active',act);b.setAttribute('aria-pressed',String(act));});for(const [id,val] of [['#focusNum',d.n],['#focusTitle',d.title],['#focusDesc',d.desc],['#focusSymbol',d.symbol]]){if($(id))$(id).textContent=val;}if($('#focusProgress'))$('#focusProgress').style.width=d.width;}));
 applyStage(0);setMotion(pageMotion);
}
function initFaq(){const input=$('#faqSearch');input?.addEventListener('input',()=>{let n=0;$$('#faqItems details').forEach(d=>{let match=d.textContent.toLowerCase().includes(input.value.toLowerCase().trim());d.hidden=!match;if(match)n++;});$('#faqEmpty').hidden=n>0;});}

route();
