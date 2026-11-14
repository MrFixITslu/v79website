import {PAGES,META} from '../shared/website-design';
import './redesign/theme.js';
import {initContact,loadResources} from './redesign/integrations.js';
const isSpecial=()=>!!new URLSearchParams(location.search).get('article')||/^\/(free-ai-prompting-guide|course\/\d+)$/.test(location.pathname);
async function mountSpecial(root){try{const {mount}=await import('./redesign/SpecialPages');await mount(root);}catch{root.textContent='This page could not load. Please refresh or contact V79 Digital.';}}
if(location.hash.startsWith('#/'))history.replaceState({},'',location.hash.slice(1));
const root=document.getElementById('pageRoot');
const menu=document.getElementById('menuBtn');
const nav=document.getElementById('mainNav');
let homeTimer=null,homeObserver=null,homeHandlers=[], pageMotion=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function $ (s){return root.querySelector(s)}
function $$ (s){return Array.from(root.querySelectorAll(s))}
function cleanHome(){if(homeTimer){clearInterval(homeTimer);homeTimer=null}if(homeObserver){homeObserver.disconnect();homeObserver=null}homeHandlers.forEach(([node,ev,fn])=>node.removeEventListener(ev,fn));homeHandlers=[];}
function on(node,ev,fn,opts){if(node){node.addEventListener(ev,fn,opts);homeHandlers.push([node,ev,fn])}}
function currentRoute(){return location.pathname.replace(/\/+$/,'')||'/'}
function route(){cleanHome();let r=currentRoute();if(isSpecial()){void mountSpecial(root);return;} root.innerHTML=PAGES[r]||PAGES['/404'];root.querySelector('h1')?.setAttribute('tabindex','-1');const [ttl,desc]=META[r]||['Page not found | V79 Digital','This page does not exist in the V79 site preview.'];document.title=ttl;document.querySelector('meta[name=description]').setAttribute('content',desc);nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰';for(const a of nav.querySelectorAll('a[href^="/"]')){let href=a.getAttribute('href');let active=r===href||(href!=='/'&&r.startsWith(href+'/'))||(href==='/solutions'&&r.startsWith('/apps/'));a.removeAttribute('aria-current');if(active)a.setAttribute('aria-current','page');}window.scrollTo(0,0);if(r==='/')initHome();if(r==='/services')initExploded();if(r.startsWith('/resources/'))initReadingProgress();if(r==='/faq')initFaq();if(r==='/contact')initContact(root);if(r==='/resources')loadResources(root);initReveal();initTilt();}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰';});
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const u=new URL(a.href);if(u.origin!==location.origin)return;if(a.dataset.scroll&&currentRoute()==='/'){e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:pageMotion?'smooth':'auto'});return;}if(!PAGES[u.pathname]||u.search||u.hash||isSpecial())return;e.preventDefault();history.pushState({},'',u.pathname);route();document.querySelector('#pageRoot h1')?.focus({preventScroll:true});});
window.addEventListener('popstate',()=>isSpecial()?location.reload():route());
menu.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement){e.target.hidden=true;const fallback=e.target.nextElementSibling;if(fallback)fallback.hidden=false;}},true);
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');motionPreference.addEventListener('change',()=>{pageMotion=!motionPreference.matches;document.body.classList.toggle('motion-off',!pageMotion);if(!isSpecial())route();});
function initReveal(){if(!pageMotion||!('IntersectionObserver' in window)){root.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));return;}homeObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');entry.target.classList.remove('will-animate');homeObserver.unobserve(entry.target);}})},{threshold:.05});root.querySelectorAll('.reveal').forEach(e=>{if(e.getBoundingClientRect().top>innerHeight+60)e.classList.add('will-animate');else e.classList.add('visible');homeObserver.observe(e);});document.body.classList.add('motion-ready');}
function initTilt(){root.querySelectorAll('.service,.product,.interactive-card,.guide-card').forEach(card=>{let handle=e=>{if(!pageMotion||e.pointerType!=='mouse')return;const rect=card.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width-.5,y=(e.clientY-rect.top)/rect.height-.5;card.style.transform=`translateY(-13px) perspective(1050px) rotateX(${-y*9}deg) rotateY(${x*9}deg) scale(1.024)`;};let reset=()=>card.style.transform='';on(card,'pointermove',handle,{passive:true});on(card,'pointerleave',reset);on(card,'blur',reset);});}

function initExploded(){
 const section=$('#explode'),deck=$('#explodeDeck');if(!section||!deck)return;
 const tiles=Array.from(deck.querySelectorAll('[data-explode-tile]'));
 const coords=[[-.79,-.38,-8],[.79,-.38,8],[0,-.77,0],[-.8,.55,5],[.8,.55,-6]];
 const descr=$('#explodeDescription'),caption=$('#explodeCaption'),bar=$('#explodeProgress');let raf=0, lastStep=-1;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches||!pageMotion||window.innerWidth<=800;
 function update(){raf=0;const staticMode=reduced();const scrollDistance=Math.max(1,section.offsetHeight-innerHeight+80);const progress=staticMode?1:Math.max(0,Math.min(1,(scrollY-section.offsetTop+85)/scrollDistance));
  const visual=staticMode?1:Math.max(0,Math.min(1,(progress-.10)/.80));const ease=visual*visual*(3-2*visual);
  const radius=Math.min(deck.clientWidth*.34,260);const vradius=Math.min(deck.clientHeight*.38,180);
  tiles.forEach((tile,i)=>{if(staticMode){tile.style.transform='';tile.style.zIndex='3';return;}const [x,y,rot]=coords[i];const dx=x*radius*ease,dy=y*vradius*ease;const r=rot*ease;const scale=.82+.18*ease;tile.style.transform=`translate(calc(-50% + ${dx.toFixed(1)}px),calc(-50% + ${dy.toFixed(1)}px)) rotate(${r.toFixed(2)}deg) scale(${scale.toFixed(3)})`;tile.style.zIndex=String(3+i);});
  if(bar)bar.style.width=(progress*100).toFixed(1)+'%';const step=staticMode?2:progress<.33?0:progress<.67?1:2;if(step!==lastStep){lastStep=step;const ds=[['One business. Many disconnected moving parts.','01 / 03 · Start with the essentials'],['Bring each important system into focus.','02 / 03 · Understand how the pieces fit'],['A connected plan built around your team.','03 / 03 · Explore each service below']];if(descr)descr.textContent=ds[step][0];if(caption)caption.textContent=ds[step][1];}}
 function schedule(){if(!raf)raf=requestAnimationFrame(update)}on(window,'scroll',schedule,{passive:true});on(window,'resize',schedule,{passive:true});update();
}
function initReadingProgress(){const bar=$('#readingProgress');if(!bar)return;let raf=0;function render(){raf=0;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);bar.style.width=(Math.max(0,Math.min(1,scrollY/max))*100).toFixed(2)+'%'}function req(){if(!raf)raf=requestAnimationFrame(render)}on(window,'scroll',req,{passive:true});on(window,'resize',req,{passive:true});render();}

function initHome(){const stages=[
 {title:'A customer request is captured',desc:'Instead of starting with disconnected messages, begin with a clear record and a reference to follow.',action:'Request recorded',detail:'An enquiry is ready for follow-up',tag:'RECEIVE'},
 {title:'A clear next step is assigned',desc:'The team can see what needs attention and who should follow up, reducing the need to chase for updates.',action:'Team action identified',detail:'Work stays visible as it progresses',tag:'MANAGE'},
 {title:'Progress is easier to review',desc:'A shared history makes follow-through and later improvements simpler. This is an example of the intended workflow, not a live integration.',action:'Next step documented',detail:'Follow-up and context kept together',tag:'REVIEW'}];
 let stage=0;const auto=$('#autoBtn'),motionBtn=$('#motionBtn');
 function applyStage(n){stage=(n+stages.length)%stages.length;const d=stages[stage];for(const [id,value] of [['#stageTitle',d.title],['#stageDesc',d.desc],['#stageAction',d.action],['#stageDetail',d.detail],['#stageTag',d.tag],['#stageIcon',String(stage+1).padStart(2,'0')],['#stageProgress','Step '+(stage+1)+' of 3']]){let el=$(id);if(el)el.textContent=value;}let bar=$('#stageBar');if(bar)bar.style.width=((stage+1)/3*100)+'%';$$('.step').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===stage)));let board=$('#workflowBoard');if(board&&pageMotion){board.classList.remove('animated');void board.offsetWidth;board.classList.add('animated');}}
 function pause(){if(homeTimer){clearInterval(homeTimer);homeTimer=null;}if(auto){auto.textContent='▶ Resume the story';auto.setAttribute('aria-pressed','false');}}
 function play(){if(homeTimer||!pageMotion||document.hidden)return;if(auto){auto.textContent='Ⅱ Pause the story';auto.setAttribute('aria-pressed','true');}homeTimer=setInterval(()=>applyStage(stage+1),2900);}
 $$('.step').forEach(b=>on(b,'click',()=>{pause();applyStage(Number(b.dataset.stage));}));on(auto,'click',()=>homeTimer?pause():play());
 function setMotion(state){pageMotion=state;document.body.classList.toggle('motion-off',!state);if(motionBtn){motionBtn.textContent='Motion: '+(state?'ON':'OFF');motionBtn.setAttribute('aria-pressed',String(!state));}if(state)play();else pause();}
 on(motionBtn,'click',()=>setMotion(!pageMotion));let visibility=()=>{if(document.hidden){if(homeTimer){clearInterval(homeTimer);homeTimer=null;}}else if(pageMotion)play()};on(document,'visibilitychange',visibility);
 const options={it:{n:'01 / 03',title:'Less downtime. More peace of mind.',desc:'A practical plan for keeping your essential technology running.',symbol:'✧',width:'33.3%'},work:{n:'02 / 03',title:'A clearer way to work.',desc:'Connect requests, customers and everyday activity across V79 apps.',symbol:'▧',width:'66.6%'},ai:{n:'03 / 03',title:'AI with a practical purpose.',desc:'Find simple opportunities to automate repeat tasks and build digital skills.',symbol:'✦',width:'100%'}};
 $$('.solution-chip').forEach(btn=>on(btn,'click',()=>{let d=options[btn.dataset.focus];if(!d)return;$$('.solution-chip').forEach(b=>{let act=b===btn;b.classList.toggle('is-active',act);b.setAttribute('aria-pressed',String(act));});for(const [id,val] of [['#focusNum',d.n],['#focusTitle',d.title],['#focusDesc',d.desc],['#focusSymbol',d.symbol]]){if($(id))$(id).textContent=val;}if($('#focusProgress'))$('#focusProgress').style.width=d.width;}));
 applyStage(0);setMotion(pageMotion);
}
function initFaq(){const input=$('#faqSearch');input?.addEventListener('input',()=>{let n=0;$$('#faqItems details').forEach(d=>{let match=d.textContent.toLowerCase().includes(input.value.toLowerCase().trim());d.hidden=!match;if(match)n++;});$('#faqEmpty').hidden=n>0;});}

route();
