// @ts-nocheck
import fs from 'fs';
import zlib from 'zlib';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 48;
const NAVY = '#071B33';
const NAVY_2 = '#0C2C50';
const TEAL = '#13B9B1';
const CYAN = '#23A7D9';
const BLUE = '#1769C2';
const INK = '#132238';
const MUTED = '#5D6B7A';
const PALE = '#F3F7FA';
const BORDER = '#D8E3EA';
const WHITE = '#FFFFFF';
const GREEN = '#1E9B74';
const AMBER = '#D8922A';

function hexRgb(hex) {
  const h = hex.replace('#','');
  return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255];
}
function esc(s) {
  return String(s)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[\r\n]+/g,' ');
}
function estimate(s,size,mono=false){
  if(mono) return String(s).length*size*0.60;
  let u=0;
  for(const c of String(s)) {
    if(c===' ') u+=0.28; else if('ilI1.,:;!|\'`'.includes(c)) u+=0.27; else if('mwMW@%&#'.includes(c)) u+=0.78; else if(/[A-Z0-9]/.test(c)) u+=0.57; else u+=0.50;
  }
  return u*size;
}
function wrapText(text,size,maxWidth,mono=false){
  const paras=String(text).split(/\n/); const out=[];
  for(const para of paras){
    if(para===''){out.push('');continue;}
    const words=para.split(/\s+/); let line='';
    for(const word of words){
      const test=line?line+' '+word:word;
      if(line && estimate(test,size,mono)>maxWidth){out.push(line);line=word;} else line=test;
    }
    if(line) out.push(line);
  }
  return out;
}
function wrapCode(text,size,maxWidth){
  const out=[];
  for(const raw of String(text).split('\n')){
    if(raw.trim()===''){out.push('');continue;}
    const indent=(raw.match(/^\s*/)||[''])[0];
    const content=raw.trimEnd();
    if(estimate(content,size,true)<=maxWidth){out.push(content);continue;}
    const words=content.trim().split(/\s+/); let line=indent;
    for(const word of words){
      const test=(line.trim()?line+' ':indent)+word;
      if(line.trim() && estimate(test,size,true)>maxWidth){out.push(line); line=indent+word;} else line=test;
    }
    if(line.trim()) out.push(line);
  }
  return out;
}

function decodePngRgb(filePath){
  const b=fs.readFileSync(filePath);
  if(b.slice(1,4).toString()!=='PNG') throw new Error('Not PNG');
  let off=8,w=0,h=0,bit=8,color=6,interlace=0; const ids=[];
  while(off<b.length){
    const len=b.readUInt32BE(off); const type=b.slice(off+4,off+8).toString(); const data=b.slice(off+8,off+8+len); off+=12+len;
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);bit=data[8];color=data[9];interlace=data[12];}
    if(type==='IDAT') ids.push(data); if(type==='IEND') break;
  }
  if(bit!==8 || interlace!==0 || ![2,6].includes(color)) throw new Error(`Unsupported PNG ${bit}/${color}/${interlace}`);
  const channels=color===6?4:3; const raw=zlib.inflateSync(Buffer.concat(ids)); const stride=w*channels; const rows=Buffer.alloc(h*stride); let pos=0; let prev=Buffer.alloc(stride);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<h;y++){
    const filter=raw[pos++]; const cur=Buffer.alloc(stride);
    for(let x=0;x<stride;x++){
      const val=raw[pos++], a=x>=channels?cur[x-channels]:0, bb=prev[x]||0, c=x>=channels?(prev[x-channels]||0):0;
      let r=val; if(filter===1)r=(val+a)&255; else if(filter===2)r=(val+bb)&255; else if(filter===3)r=(val+Math.floor((a+bb)/2))&255; else if(filter===4)r=(val+paeth(a,bb,c))&255;
      cur[x]=r;
    }
    cur.copy(rows,y*stride); prev=cur;
  }
  const rgb=Buffer.alloc(w*h*3);
  for(let i=0,j=0,k=0;i<w*h;i++){
    const r=rows[j++],g=rows[j++],bl=rows[j++]; let a=255; if(channels===4)a=rows[j++];
    // Composite transparent pixels over white so the original logo looks correct in its white card.
    rgb[k++]=Math.round((r*a+255*(255-a))/255); rgb[k++]=Math.round((g*a+255*(255-a))/255); rgb[k++]=Math.round((bl*a+255*(255-a))/255);
  }
  return {width:w,height:h,data:zlib.deflateSync(rgb,{level:9})};
}

class PDF {
  constructor(logo){this.objs=[null];this.pages=[];this.logo=logo;this.catalog=this.reserve();this.pagesObj=this.reserve();this.f1=this.add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');this.f2=this.add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');this.f3=this.add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');this.logoObj=logo?this.addStream(logo.data,`/Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode`):0;}
  reserve(){this.objs.push(Buffer.from(''));return this.objs.length-1;}
  add(data){this.objs.push(Buffer.isBuffer(data)?data:Buffer.from(data));return this.objs.length-1;}
  set(id,data){this.objs[id]=Buffer.isBuffer(data)?data:Buffer.from(data);}
  addStream(buf,dict=''){return this.add(Buffer.concat([Buffer.from(`<< ${dict} /Length ${buf.length} >>\nstream\n`),buf,Buffer.from('\nendstream')]));}
  addPage(content){const cb=Buffer.from(content,'binary');const cs=this.addStream(cb);const xobj=this.logoObj?` /XObject << /Logo ${this.logoObj} 0 R >>`:'';const p=this.add(`<< /Type /Page /Parent ${this.pagesObj} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${this.f1} 0 R /F2 ${this.f2} 0 R /F3 ${this.f3} 0 R >>${xobj} >> /Contents ${cs} 0 R >>`);this.pages.push(p);}
  finish(){this.set(this.pagesObj,`<< /Type /Pages /Count ${this.pages.length} /Kids [${this.pages.map(id=>`${id} 0 R`).join(' ')}] >>`);this.set(this.catalog,`<< /Type /Catalog /Pages ${this.pagesObj} 0 R >>`);const parts=[Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n','binary')];const offsets=[0];let pos=parts[0].length;for(let i=1;i<this.objs.length;i++){offsets[i]=pos;const head=Buffer.from(`${i} 0 obj\n`),tail=Buffer.from('\nendobj\n');parts.push(head,this.objs[i],tail);pos+=head.length+this.objs[i].length+tail.length;}const xref=pos;let xt=`xref\n0 ${this.objs.length}\n0000000000 65535 f \n`;for(let i=1;i<this.objs.length;i++)xt+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';xt+=`trailer\n<< /Size ${this.objs.length} /Root ${this.catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;parts.push(Buffer.from(xt));return Buffer.concat(parts);}
}
class Canvas {
  constructor(){this.s=[];}
  cmd(x){this.s.push(x);}
  fill(hex){const [r,g,b]=hexRgb(hex);return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`;}
  stroke(hex){const [r,g,b]=hexRgb(hex);return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`;}
  rect(x,top,w,h,fill,stroke=null,lw=1){const y=PAGE_H-top-h;this.cmd(`${this.fill(fill)}${stroke?' '+this.stroke(stroke):''} ${lw} w ${x} ${y} ${w} ${h} re ${stroke?'B':'f'}`);}
  rounded(x,top,w,h,r,fill,stroke=null,lw=1){const y=PAGE_H-top-h,k=.5522847498,rr=Math.min(r,w/2,h/2),x2=x+w,y2=y+h;let p=`${x+rr} ${y} m ${x2-rr} ${y} l ${x2-rr+k*rr} ${y} ${x2} ${y+rr-k*rr} ${x2} ${y+rr} c ${x2} ${y2-rr} l ${x2} ${y2-rr+k*rr} ${x2-rr+k*rr} ${y2} ${x2-rr} ${y2} c ${x+rr} ${y2} l ${x+rr-k*rr} ${y2} ${x} ${y2-rr+k*rr} ${x} ${y2-rr} c ${x} ${y+rr} l ${x} ${y+rr-k*rr} ${x+rr-k*rr} ${y} ${x+rr} ${y} c h`;this.cmd(`${this.fill(fill)}${stroke?' '+this.stroke(stroke):''} ${lw} w ${p} ${stroke?'B':'f'}`);}
  circle(cx,topCenter,r,fill){const cy=PAGE_H-topCenter,k=.5522847498*r;this.cmd(`${this.fill(fill)} ${cx+r} ${cy} m ${cx+r} ${cy+k} ${cx+k} ${cy+r} ${cx} ${cy+r} c ${cx-k} ${cy+r} ${cx-r} ${cy+k} ${cx-r} ${cy} c ${cx-r} ${cy-k} ${cx-k} ${cy-r} ${cx} ${cy-r} c ${cx+k} ${cy-r} ${cx+r} ${cy-k} ${cx+r} ${cy} c f`);}
  line(x1,t1,x2,t2,color,lw=1){this.cmd(`${this.stroke(color)} ${lw} w ${x1} ${PAGE_H-t1} m ${x2} ${PAGE_H-t2} l S`);}
  text(x,top,str,size=10,font='F1',color=INK){this.cmd(`BT /${font} ${size} Tf ${this.fill(color)} 1 0 0 1 ${x} ${PAGE_H-top-size} Tm (${esc(str)}) Tj ET`);}
  textLines(x,top,lines,size=10,font='F1',color=INK,leading=size*1.35){let t=top;for(const line of lines){this.text(x,t,line,size,font,color);t+=leading;}return t;}
  paragraph(x,top,text,size,maxWidth,color=INK,leading=size*1.42,font='F1'){return this.textLines(x,top,wrapText(text,size,maxWidth,false),size,font,color,leading);}
  image(name,x,top,w,h){this.cmd(`q ${w} 0 0 ${h} ${x} ${PAGE_H-top-h} cm /${name} Do Q`);}
  out(){return this.s.join('\n');}
}
function header(c,kicker,title,page){
  c.text(M,38,kicker.toUpperCase(),8.3,'F2',TEAL);
  c.text(M,56,title,22,'F2',NAVY);
  c.line(M,91,PAGE_W-M,91,BORDER,1);
  if(page) c.text(PAGE_W-M-18,40,String(page).padStart(2,'0'),8,'F2',MUTED);
}
function footer(c){c.line(M,800,PAGE_W-M,800,BORDER,.7);c.text(M,813,'V79 DIGITAL  |  FROM IDEA TO ADVANTAGE',7.5,'F2',MUTED);c.text(PAGE_W-M-50,813,'v79sl.com',7.5,'F2',TEAL);}
function pill(c,x,top,text,fill=TEAL,color=NAVY){const w=estimate(text,8,true)+22;c.rounded(x,top,w,22,11,fill);c.text(x+11,top+6,text,8,'F2',color);return w;}
function codeBox(c,x,top,w,text,{font=8.25,maxH=260}={}){const pad=14;let lines=wrapCode(text,font,w-pad*2);let leading=font*1.35;let h=pad*2+lines.length*leading+2;if(h>maxH){font=Math.max(7.1,font*(maxH-2*pad)/(lines.length*leading));leading=font*1.34;lines=wrapCode(text,font,w-pad*2);h=Math.min(maxH,pad*2+lines.length*leading+2);}c.rounded(x,top,w,h,10,'#0C2038','#163A5D',.7);let y=top+pad;for(const line of lines){c.text(x+pad,y,line,font,'F3','#DDEAF3');y+=leading;}return h;}
function card(c,x,top,w,h,title,body,number=null){c.rounded(x,top,w,h,12,WHITE,BORDER,.8);if(number){c.circle(x+27,top+27,15,TEAL);c.text(x+18,top+18,String(number).padStart(2,'0'),8.5,'F2',NAVY);}c.text(x+(number?52:18),top+17,title,12,'F2',NAVY);c.paragraph(x+18,top+47,body,9,w-36,MUTED,12.8);}
function promptPage(pdf,pageNum,n1,t1,p1,n2,t2,p2,note=''){const c=new Canvas();header(c,'COPY + USE',`Prompts ${n1} & ${n2}`,pageNum);const x=M,w=PAGE_W-2*M;const top1=112;const titleH=24;c.circle(x+18,top1+12,14,TEAL);c.text(x+10,top1+4,String(n1).padStart(2,'0'),8.2,'F2',NAVY);c.text(x+42,top1+4,t1,14,'F2',NAVY);const h1=codeBox(c,x,top1+34,w,p1,{font:8.05,maxH:260});const top2=top1+34+h1+30;c.circle(x+18,top2+12,14,CYAN);c.text(x+10,top2+4,String(n2).padStart(2,'0'),8.2,'F2',NAVY);c.text(x+42,top2+4,t2,14,'F2',NAVY);const max2=775-(top2+34);const h2=codeBox(c,x,top2+34,w,p2,{font:8.05,maxH:max2});if(note){const nt=top2+34+h2+12;if(nt<783)c.paragraph(x,nt,note,8.4,w,MUTED,11.5);}footer(c);pdf.addPage(c.out());}

export function generateAiPromptGuidePdf(logoPath){
  let logo=null;try{logo=decodePngRgb(logoPath);}catch(e){console.warn('logo skipped',e.message)}
  const pdf=new PDF(logo);
  // Cover
  {const c=new Canvas();c.rect(0,0,PAGE_W,PAGE_H,NAVY);c.circle(520,100,120,'#0A385A');c.circle(520,100,78,'#0E5873');c.circle(74,750,145,'#082945');c.rounded(48,54,155,25,12,TEAL);c.text(63,61,"V79 DIGITAL | FIELD GUIDE",8.2,'F2',NAVY);c.text(48,139,'How to Prompt AI',31,'F2',WHITE);c.text(48,180,'for Better Results',31,'F2','#B9FFF9');c.paragraph(48,236,'A practical beginner's guide to clearer instructions, stronger answers and more useful AI - with 10 prompts you can copy today.',13.2,455,'#C6D6E4',19);c.line(48,340,265,340,TEAL,3);c.text(48,360,'ROLE  +  GOAL  +  CONTEXT  +  REQUIREMENTS  +  OUTPUT',9.1,'F2','#E6FAF8');c.rounded(48,632,499,142,18,WHITE);if(logo)c.image('Logo',70,648,170,116);c.text(268,655,'Built for practical use',10,'F2',TEAL);c.text(268,678,'10 copy-and-use prompts',16,'F2',NAVY);c.text(268,706,'Simple. Specific. Repeatable.',11,'F1',MUTED);c.text(268,731,'V79 Digital  |  v79sl.com',9,'F2',BLUE);pdf.addPage(c.out());}
  // Why prompting matters
  {const c=new Canvas();header(c,'START HERE','Better input. Better output.',2);c.paragraph(M,118,'AI can be incredibly useful, but vague instructions usually create generic answers. The fastest way to improve the result is to improve the instruction.',13,499,INK,18);c.rounded(M,205,499,170,16,'#F7FBFD',BORDER,.8);c.text(68,226,'THE RESTAURANT TEST',9,'F2',TEAL);c.text(68,252,'"Give me food."',22,'F2',NAVY);c.text(68,288,'You may get something - but not necessarily what you wanted.',10.5,'F1',MUTED);c.line(68,322,525,322,BORDER,.8);c.text(68,340,'Better:',9,'F2',GREEN);c.paragraph(120,337,'"Chicken, not too spicy, under $30, and ready quickly."',11.5,385,INK,16);c.text(M,414,'AI works the same way.',18,'F2',NAVY);c.paragraph(M,447,'The more clearly you describe the job, the background, the limits and the format you want, the less the AI has to guess.',11.2,499,MUTED,16);card(c,M,522,154,154,'Be specific','Tell the AI exactly what outcome you need.',1);card(c,M+172,522,154,154,'Add context','Give it the background that changes the answer.',2);card(c,M+344,522,155,154,'Set the finish line','Describe the format, length or structure.',3);c.rounded(M,700,499,65,12,NAVY_2);c.text(67,719,'Remember',9,'F2',TEAL);c.text(67,741,'A useful prompt reduces guessing.',14,'F2',WHITE);footer(c);pdf.addPage(c.out());}
  // Formula
  {const c=new Canvas();header(c,'THE METHOD','The 5-part prompt formula',3);c.paragraph(M,113,'Use all five parts when the task matters. For simple questions, use only the parts that help.',10.5,499,MUTED,15);const items=[['ROLE','Who should the AI act like?','Act as a digital marketing specialist.'],['GOAL','What do you want to accomplish?','Help me create a marketing plan.'],['CONTEXT','What background changes the answer?','My business is in Saint Lucia and serves small offices.'],['REQUIREMENTS','What rules or limits matter?','Keep the budget below $500 EC per month.'],['OUTPUT','What should the final answer look like?','Give me a 30-day plan in a simple table.']];let top=175;items.forEach((it,i)=>{c.rounded(M,top,499,94,14,i%2===0?'#F7FBFD':WHITE,BORDER,.7);c.circle(78,top+31,18,i===0?TEAL:i===1?CYAN:i===2?BLUE:i===3?AMBER:GREEN);c.text(68,top+21,String(i+1).padStart(2,'0'),8.5,'F2',WHITE);c.text(110,top+16,it[0],9,'F2',TEAL);c.text(110,top+36,it[1],11.4,'F2',NAVY);c.text(110,top+60,it[2],9.5,'F1',MUTED);top+=105;});c.rounded(M,710,499,58,12,NAVY);c.text(68,727,'ROLE  +  GOAL  +  CONTEXT  +  REQUIREMENTS  +  OUTPUT',10.4,'F2','#CFFDF9');footer(c);pdf.addPage(c.out());}
  // Weak vs better
  {const c=new Canvas();header(c,'BEFORE + AFTER','Weak prompt vs. better prompt',4);c.text(M,116,'Weak prompt',10,'F2','#B04A4A');c.rounded(M,140,499,70,12,'#FFF6F5','#F0D1CE',.8);c.text(68,162,'Write me a business plan.',15,'F2','#7A3131');c.text(M,238,'Better prompt',10,'F2',GREEN);const better=`Act as a small-business adviser.\n\nHelp me create a simple business plan for a mobile car-washing business in Saint Lucia.\n\nMy customers will mainly be busy professionals and small businesses.\nKeep the startup cost below $10,000 EC.\n\nInclude:\n- services\n- pricing ideas\n- startup equipment\n- estimated monthly expenses\n- marketing ideas\n- major risks\n\nWrite it in simple language that someone starting their first business can understand.`;codeBox(c,M,262,499,better,{font:8.5,maxH:365});c.rounded(M,651,499,112,14,'#F2FBF9','#CBEAE3',.7);c.text(68,671,'WHY IT WORKS',9,'F2',GREEN);c.paragraph(68,695,'The AI now has a role, a clear objective, local context, a budget limit, required sections and a defined reading level.',10.2,455,INK,15);footer(c);pdf.addPage(c.out());}

  const prompts=[
    ['Learn Something New',`Act as a patient teacher.\n\nExplain [TOPIC] to me as if I am completely new to it.\nUse simple language and everyday examples.\nAvoid unnecessary jargon.\n\nAfter explaining it, give me:\n1. The five most important things to remember\n2. One real-world example\n3. Five questions I can use to test my understanding`],
    ['Improve Your Writing',`Improve the text below without changing what I am trying to say.\n\nMake it clear, natural and professional.\nUse simple language.\nAvoid overly formal words and phrases people would not normally use in conversation.\n\nHere is the text:\n[PASTE YOUR TEXT]`],
    ['Brainstorm a Business Idea',`Act as a small-business adviser.\n\nI am considering starting this business:\n[BUSINESS IDEA]\n\nMy location is: [LOCATION]\nMy approximate budget is: [BUDGET]\n\nAnalyse the idea and tell me:\n- who the likely customers are\n- what problem the business solves\n- possible ways to make money\n- startup requirements\n- major risks\n- competitors I should investigate\n- three cheap ways I could test the idea before investing heavily\n\nUse simple, practical language.`],
    ['Create a Social-Media Post',`Act as a social-media marketer.\n\nWrite a Facebook post promoting:\n[PRODUCT OR SERVICE]\n\nThe target customer is: [TARGET CUSTOMER]\nThe main benefit is: [BENEFIT]\n\nMake the post friendly and natural.\nDo not make it sound like an aggressive advertisement.\nInclude a clear call to action.\nGive me three versions with different opening lines.`],
    ['Solve a Problem',`Help me solve this problem:\n[DESCRIBE THE PROBLEM]\n\nBefore recommending a solution:\n1. Identify the most likely causes\n2. Separate facts from assumptions\n3. Give me the safest troubleshooting steps first\n4. Explain what each step is testing\n5. Tell me when I should stop and ask an expert\n\nUse simple instructions.\nStart with the most likely cause.`],
    ['Make a Better Decision',`Help me decide between these two options:\n\nOPTION A: [DETAILS]\nOPTION B: [DETAILS]\n\nWhat matters most to me: [YOUR PRIORITIES]\nMy budget or limitations: [CONSTRAINTS]\n\nCompare both options based on:\n- cost\n- benefits\n- disadvantages\n- risks\n- long-term value\n\nRecommend one option at the end and explain why.`],
    ['Research a Topic',`Help me research: [TOPIC]\n\nI want to understand: [QUESTIONS]\n\nStart with a simple explanation.\nThen separate the information into:\n- what is well established\n- what may still be uncertain\n- important facts I should verify\n- questions I should investigate next\n\nDo not present guesses as facts.`],
    ['Create a Step-by-Step Plan',`I want to achieve this goal: [GOAL]\n\nMy starting point is: [CURRENT SITUATION]\nMy deadline is: [DATE]\nMy limitations are: [TIME, MONEY, EXPERIENCE OR OTHER LIMITATIONS]\n\nCreate a realistic step-by-step plan.\nBreak large tasks into smaller actions.\nTell me what I should do first.\nAlso identify the three biggest things that could prevent me from reaching the goal.`],
    ['Ask AI to Review Its Own Answer',`Review the answer you just gave me.\n\nAct as a critical reviewer trying to find weaknesses in it.\n\nIdentify:\n- anything unclear\n- unsupported assumptions\n- missing information\n- possible mistakes\n- unnecessary complexity\n- ways the answer could be more useful\n\nThen give me an improved version.`],
    ['Make AI Writing Sound More Human',`Rewrite the text below so it sounds natural and human.\nKeep the original meaning, facts and important details.\n\nUse:\n- natural sentence lengths\n- simple everyday language\n- contractions where appropriate\n- a conversational rhythm\n- occasional short sentences for emphasis\n\nAvoid:\n- unnecessary buzzwords\n- repetitive sentence structures\n- exaggerated claims\n- generic introductions\n- overly formal language\n- phrases such as "in today's fast-paced world"\n\nDo not intentionally add spelling or grammar mistakes.\n\nText: [PASTE YOUR TEXT]`]
  ];
  promptPage(pdf,5,1,prompts[0][0],prompts[0][1],2,prompts[1][0],prompts[1][1]);
  promptPage(pdf,6,3,prompts[2][0],prompts[2][1],4,prompts[3][0],prompts[3][1]);
  promptPage(pdf,7,5,prompts[4][0],prompts[4][1],6,prompts[5][0],prompts[5][1]);
  promptPage(pdf,8,7,prompts[6][0],prompts[6][1],8,prompts[7][0],prompts[7][1]);
  promptPage(pdf,9,9,prompts[8][0],prompts[8][1],10,prompts[9][0],prompts[9][1],'The goal is clearer, more natural writing - not tricking people or trying to "beat" AI detectors.');
  // Conversation page
  {const c=new Canvas();header(c,'ITERATE','The biggest prompting secret',10);c.text(M,117,'Keep talking to the AI.',22,'F2',NAVY);c.paragraph(M,154,'Do not treat AI like a search box where you ask once and stop. The first answer is often a draft. Use follow-up instructions to shape it.',11.2,499,MUTED,16);const qs=['That's too technical. Explain it more simply.','Give me a real-world example.','Turn this into a checklist I can follow.'];let top=235;qs.forEach((q,i)=>{c.rounded(M,top,499,76,14,i===0?'#F0FAF9':i===1?'#F2F7FD':'#F7F7FC',BORDER,.7);c.circle(77,top+38,15,i===0?TEAL:i===1?BLUE:'#6E6BC4');c.text(71,top+29,'>',12,'F2',WHITE);c.text(110,top+25,q,11.4,'F2',INK);top+=91;});c.rounded(M,542,499,162,16,NAVY);c.text(68,565,'A BETTER MINDSET',9,'F2',TEAL);c.paragraph(68,592,'Prompting is a conversation. Ask for examples. Ask for simpler language. Point out what is missing. Challenge assumptions. Request a different format.',13,455,WHITE,18,'F2');c.paragraph(68,666,'You are allowed to say, "That is not what I meant - try again this way."',10.5,455,'#C8D7E5',15);footer(c);pdf.addPage(c.out());}
  // Boundaries & questions
  {const c=new Canvas();header(c,'CONTROL THE ANSWER','Tell AI what you don't want',11);c.paragraph(M,114,'Constraints can be just as useful as instructions. They help the AI avoid common failure modes.',10.7,499,MUTED,15);const items=['Explain this without using technical jargon.','Keep the answer under 500 words.','Do not give me ten options. Recommend the best three.','Do not assume I already understand accounting.'];let top=175;items.forEach((q,i)=>{c.rounded(M,top,499,57,12,'#F7FBFD',BORDER,.7);c.text(66,top+18,'-',12,'F2',TEAL);c.text(91,top+17,q,10.5,'F2',INK);top+=69;});c.text(M,481,'Ask AI to ask you questions',18,'F2',NAVY);c.paragraph(M,516,'If you are not sure what context to provide, make the AI interview you before it starts.',10.6,499,MUTED,15);const q=`I want you to help me create a business plan.\n\nBefore writing anything, ask me the questions you need answered to create a useful plan.`;codeBox(c,M,570,499,q,{font:9,maxH:125});c.rounded(M,718,499,55,12,'#F2FBF9','#CBEAE3',.7);c.text(68,735,'This turns prompting into a guided conversation.',11,'F2',GREEN);footer(c);pdf.addPage(c.out());}
  // AI can be wrong
  {const c=new Canvas();header(c,'VERIFY IMPORTANT CLAIMS','AI can be wrong',12);c.rounded(M,115,499,112,15,'#FFF9F0','#F1D9B1',.8);c.text(68,136,'CONFIDENCE IS NOT PROOF',9,'F2',AMBER);c.paragraph(68,160,'AI can sound certain and still be incorrect. Treat important answers as a starting point for verification, not automatic truth.',11.4,455,INK,16);c.text(M,262,'Be extra careful with:',14,'F2',NAVY);const risks=['medical information','legal advice','financial decisions & investments','important statistics','current news & government rules','contracts','technical instructions that could damage equipment or data'];let y=299;for(let i=0;i<risks.length;i+=2){const a=risks[i],b=risks[i+1];c.rounded(M,y,239,44,10,'#F7FBFD',BORDER,.6);c.text(M+16,y+15,'| '+a,9.2,'F2',INK);if(b){c.rounded(M+260,y,239,44,10,'#F7FBFD',BORDER,.6);c.text(M+276,y+15,'| '+b,9.2,'F2',INK);}y+=55;}c.text(M,520,'Three verification prompts',16,'F2',NAVY);const v=['Which parts of this answer should I independently verify?','What assumptions are you making in this answer?','What information would change your recommendation?'];let vt=558;v.forEach((q,i)=>{c.rounded(M,vt,499,58,11,NAVY_2);c.text(67,vt+18,String(i+1).padStart(2,'0'),8.5,'F2',TEAL);c.text(103,vt+17,q,9.9,'F2',WHITE);vt+=69;});footer(c);pdf.addPage(c.out());}
  // concise + cheat sheet
  {const c=new Canvas();header(c,'QUALITY > LENGTH','Better prompts don't need to be longer',13);c.paragraph(M,114,'A good prompt needs the right information - not the maximum number of words.',11,499,MUTED,16);c.text(M,171,'Instead of',9,'F2','#B04A4A');c.rounded(M,193,499,58,11,'#FFF6F5','#F0D1CE',.7);c.text(68,211,'Help me market my business.',13,'F2','#7A3131');c.text(M,278,'Try this',9,'F2',GREEN);const market=`Act as a marketing adviser.\n\nHelp me attract more local customers to my small bakery in Saint Lucia.\nMy marketing budget is $300 EC per month.\n\nGive me the five most practical strategies I can start this month.\nRank them from highest to lowest priority.`;codeBox(c,M,300,499,market,{font:9,maxH:170});c.text(M,502,'Quick-reference cheat sheet',17,'F2',NAVY);const cheat=[['ROLE','Who should AI act like?'],['GOAL','What should it help you do?'],['CONTEXT','What background matters?'],['REQUIREMENTS','What rules or limits apply?'],['OUTPUT','What should the finished answer look like?']];let top=540;cheat.forEach((x,i)=>{c.rounded(M,top,499,39,9,i%2?'#F7FBFD':WHITE,BORDER,.6);c.text(66,top+12,x[0],8.5,'F2',TEAL);c.text(168,top+12,x[1],9.5,'F2',INK);top+=45;});c.rounded(M,772,499,20,10,TEAL);footer(c);pdf.addPage(c.out());}
  // Closing
  {const c=new Canvas();c.rect(0,0,PAGE_W,PAGE_H,NAVY);c.circle(525,115,150,'#0A314F');c.circle(525,115,88,'#0C4E6C');c.rounded(48,55,499,190,18,WHITE);if(logo)c.image('Logo',72,75,195,158);c.text(302,92,'V79 DIGITAL',11,'F2',TEAL);c.text(302,121,'From Idea',24,'F2',NAVY);c.text(302,151,'to Advantage.',24,'F2',NAVY);c.text(48,326,'Put the guide to work today.',26,'F2',WHITE);c.paragraph(48,373,'Pick one prompt, replace the placeholders with your information, and start a conversation with your AI tool. Then refine the answer until it is genuinely useful.',12.5,460,'#C9D7E4',18);c.rounded(48,515,499,100,16,NAVY_2,'#164870',.8);c.text(68,540,'REMEMBER',9,'F2',TEAL);c.paragraph(68,565,'The better your instructions become, the more useful AI becomes.',16,455,WHITE,21,'F2');c.paragraph(48,666,'AI is most valuable when it helps you think, learn and work better - not when it replaces your own judgement.',11.5,455,'#C9D7E4',17);c.line(48,751,250,751,TEAL,3);c.text(48,773,'v79sl.com',12,'F2',TEAL);c.text(454,773,'V79 Digital',10,'F2',WHITE);pdf.addPage(c.out());}
  return pdf.finish();
}
