import crypto from 'node:crypto';
import type { Express, Request, Response, RequestHandler } from 'express';
import { createRateLimiter } from './rateLimit';
import { readJSON, writeJSON, transaction } from './persistence';
const file = 'learners.json';
type State = {enrolled: boolean; requested?: boolean; completed: Record<string, boolean>; note: string; failedAt?: number; certificate?: {id: string; issuedAt: string; name: string}};
type Account = {id: string; email: string; name: string; salt: string; hash: string; recovery: string; courses: Record<string, State>};
type Store = {accounts: Account[]; sessions: {hash: string; id: string; expires: number}[]};
const load = () => readJSON<Store>(file, {accounts: [], sessions: []});
const digest = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
function safeJsonParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
function slugifyCourse(title: string): string {
  return (title || 'course').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'course';
}
function field(value: unknown, min: number, max: number): value is string { return typeof value === 'string' && value.trim().length >= min && value.length <= max; }
export function cookie(req: Request, name: string) { return (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(name+'='))?.slice(name.length+1) || ''; }
export const cookieOptions = () => ({httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/'});
const requestAccounts = new WeakMap<Request, Account | undefined>();
export function learner(req: Request): Account | undefined {
  const token = cookie(req, 'v79_student');
  if (!token) return undefined;
  if (requestAccounts.has(req)) return requestAccounts.get(req);
  const data = load(), hash = digest(token);
  const session = data.sessions.find(s => s.hash === hash && s.expires > Date.now());
  const account = session ? data.accounts.find(a => a.id === session.id) : undefined;
  requestAccounts.set(req, account);
  return account;
}
function authenticated(req: Request, res: Response, next: () => void) { if (!learner(req)) { res.status(401).json({error:'Sign in to your learner account.'}); return; } next(); }
export function publicCourse(course: any, req: Request) {
  const copy = {...course};
  if (copy.category !== 'courses') return copy;
  const enrolled = learner(req)?.courses[String(course.id)]?.enrolled;
  const paid = Number(course.price) > 0 || course.pricingType === 'premium';
  const examQuestions = safeJsonParse<any[]>(course.exam, []);
  copy.exam = JSON.stringify((Array.isArray(examQuestions) ? examQuestions : []).map((q: any) => ({question:q?.question, options:q?.options})));
  if (paid && !enrolled) {
    const chapters = safeJsonParse<any[]>(course.curriculum, []);
    copy.curriculum = JSON.stringify((Array.isArray(chapters) ? chapters : []).map((chapter: any) => ({...chapter, lectures:(chapter.lectures || []).map((l: any) => l.freePreview ? l : {id:l.id,title:l.title,duration:l.duration,freePreview:false})})));
  }
  return copy;
}
export function mountLearners(app: Express, db: any, requireAdmin: RequestHandler, isComplete: (c:any)=>boolean) {
  const authLimit = createRateLimiter({windowMs:15*60*1000,max:15});
  const course = (idOrSlug: string) => {
    const key = String(idOrSlug || '').trim();
    if (!key) return undefined;
    return db.getApps().find((c:any) =>
      c.category === 'courses' && isComplete(c) && (
        String(c.id) === key ||
        c.accessUrl === `/course/${key}` ||
        slugifyCourse(c.name) === key
      )
    );
  };
  const newState = (): State => ({enrolled:false,completed:{},note:''});
  function createSession(data:Store, account:Account): string {
    const token=crypto.randomBytes(32).toString('base64url');
    data.sessions=data.sessions.filter(s=>s.expires>Date.now() && s.id!==account.id);
    data.sessions.push({hash:digest(token),id:account.id,expires:Date.now()+7*86400000});
    writeJSON(file,data);
    return token;
  }
  function setSessionCookie(res:Response, token:string) {
    res.cookie('v79_student',token,{...cookieOptions(),maxAge:7*86400000});
  }
  app.post('/api/student/register',authLimit,(req,res)=>{
    const {email,name,password}=req.body || {};
    if (!field(email,3,254)||!/^\S+@\S+\.\S+$/.test(email)||!field(name,2,100)||!field(password,12,256)) return res.status(400).json({error:'Enter a valid email, name and password of at least 12 characters.'});
    const normalizedEmail = email.toLowerCase().trim();
    const out = transaction(() => {
      const data=load();
      if(data.accounts.some(a=>a.email===normalizedEmail)) return {conflict:true as const};
      const salt=crypto.randomBytes(16).toString('hex'),recoveryCode=crypto.randomBytes(24).toString('base64url');
      const account:Account={id:crypto.randomUUID(),email:normalizedEmail,name:name.trim(),salt,hash:crypto.scryptSync(password,salt,64).toString('hex'),recovery:digest(recoveryCode),courses:{}};
      data.accounts.push(account);
      const token=createSession(data,account);
      return {conflict:false as const, account, recoveryCode, token};
    });
    if(out.conflict) return res.status(409).json({error:'An account already uses this email. Sign in or recover it.'});
    setSessionCookie(res,out.token);
    res.status(201).json({id:out.account.id,name:out.account.name,email:out.account.email,recoveryCode:out.recoveryCode});
  });
  app.post('/api/student/login',authLimit,(req,res)=>{
    const {email,password}=req.body||{};if(!field(email,3,254)||!field(password,1,256)) return res.status(400).json({error:'Invalid login.'});
    const normalizedEmail = email.toLowerCase().trim();
    const out = transaction(() => {
      const data=load(),account=data.accounts.find(a=>a.email===normalizedEmail);
      const hash=crypto.scryptSync(password,account?.salt || 'unregistered-account-salt',64).toString('hex');
      if(!account||!crypto.timingSafeEqual(Buffer.from(hash,'hex'),Buffer.from(account.hash,'hex'))) return null;
      const token=createSession(data,account);
      return {account, token};
    });
    if(!out) return res.status(401).json({error:'Incorrect email or password.'});
    setSessionCookie(res,out.token);
    res.json({id:out.account.id,name:out.account.name,email:out.account.email});
  });
  app.post('/api/student/recover',authLimit,(req,res)=>{
    const {email,recoveryCode,password}=req.body||{};
    if(!field(email,3,254)||!field(recoveryCode,20,100)||!field(password,12,256)) return res.status(400).json({error:'Email, saved recovery code and a new 12-character password are required.'});
    const normalizedEmail = email.toLowerCase().trim();
    const out = transaction(() => {
      const data=load(),a=data.accounts.find(a=>a.email===normalizedEmail && a.recovery===digest(recoveryCode));
      if(!a) return null;
      const replacement=crypto.randomBytes(24).toString('base64url');a.recovery=digest(replacement);a.salt=crypto.randomBytes(16).toString('hex');a.hash=crypto.scryptSync(password,a.salt,64).toString('hex');
      const token=createSession(data,a);
      return {replacement, token};
    });
    if(!out)return res.status(401).json({error:'Recovery details not accepted.'});
    setSessionCookie(res,out.token);
    res.json({recoveryCode:out.replacement});
  });
  app.get('/api/student/me',authenticated,(req,res)=>{const a=learner(req)!;res.json({id:a.id,name:a.name,email:a.email});});
  app.post('/api/student/logout',(req,res)=>{
    const tokenHash = digest(cookie(req,'v79_student'));
    transaction(()=>{const data=load();data.sessions=data.sessions.filter(s=>s.hash!==tokenHash);writeJSON(file,data);});
    res.clearCookie('v79_student',cookieOptions());res.json({success:true});
  });
  app.get('/api/student/courses/:id',authenticated,(req,res)=>{const c=course(String(req.params.id));if(!c)return res.status(404).json({error:'Course unavailable.'});res.json({state:learner(req)!.courses[String(c.id)]||newState(),course:publicCourse(c,req)});});
  app.post('/api/student/courses/:id/enroll',authenticated,(req,res)=>{
    const c=course(String(req.params.id));if(!c)return res.status(404).json({error:'Course unavailable.'});
    const learnerId = learner(req)!.id;
    const state = transaction(()=>{
      const data=load(),a=data.accounts.find(a=>a.id===learnerId)!;
      const s=a.courses[String(c.id)] ||= newState();
      if(Number(c.price)>0||c.pricingType==='premium')s.requested=true;else s.enrolled=true;
      writeJSON(file,data);
      return s;
    });
    res.json({state,message:state.enrolled?'Enrolled.':'Enrollment requested. Contact V79 Digital to arrange payment and approval.'});
  });
  app.put('/api/student/courses/:id/progress',authenticated,(req,res)=>{
    const c=course(String(req.params.id));if(!c)return res.status(404).json({error:'Course unavailable.'});
    const {completed,note}=req.body||{};
    if(!completed||Array.isArray(completed)||typeof completed!=='object'||typeof note!=='string'||note.length>10000)return res.status(400).json({error:'Invalid progress.'});
    const learnerId = learner(req)!.id;
    const ids=safeJsonParse<any[]>(c.curriculum,[]).flatMap((ch:any)=>(ch.lectures||[]).map((l:any)=>String(l.id)));
    const state = transaction(()=>{
      const data=load(),a=data.accounts.find(a=>a.id===learnerId)!,s=a.courses[String(c.id)];
      if(!s?.enrolled) return null;
      s.completed=Object.fromEntries(ids.map((id:string)=>[id,completed[id]===true]));s.note=note;writeJSON(file,data);
      return s;
    });
    if(!state)return res.status(403).json({error:'Enrollment required.'});
    res.json(state);
  });
  app.get('/api/student/courses/:id/questions',authenticated,(req,res)=>{
    const c=course(String(req.params.id));if(!c)return res.status(404).json({error:'Course unavailable.'});
    const id=String(c.id);if(!learner(req)!.courses[id]?.enrolled)return res.status(403).json({error:'Enrollment required'});
    res.json(readJSON<any[]>('discussion-'+id+'.json',[]));
  });
  app.post('/api/student/courses/:id/questions',authenticated,createRateLimiter({windowMs:3600000,max:20}),(req,res)=>{
    const c=course(String(req.params.id));if(!c)return res.status(404).json({error:'Course unavailable.'});
    const id=String(c.id),a=learner(req)!;if(!a.courses[id]?.enrolled)return res.status(403).json({error:'Enrollment required'});
    if(!field(req.body?.text,1,2000))return res.status(400).json({error:'Question must contain 1–2000 characters'});
    const question=transaction(()=>{
      const list=readJSON<any[]>('discussion-'+id+'.json',[]);
      const q={id:crypto.randomUUID(),author:a.name,text:req.body.text.trim(),date:new Date().toISOString(),replies:[]};
      list.unshift(q);writeJSON('discussion-'+id+'.json',list);
      return q;
    });
    res.status(201).json(question);
  });
  app.post('/api/exam/attempt',authenticated,createRateLimiter({windowMs:60000,max:5}),(req,res)=>{
    const c=course(String(req.body?.appId));if(!c)return res.status(404).json({error:'Course unavailable.'});
    const learnerId = learner(req)!.id;
    const lectures=safeJsonParse<any[]>(c.curriculum,[]).flatMap((ch:any)=>ch.lectures||[]);
    const questions=safeJsonParse<any[]>(c.exam,[]);
    const answers=req.body?.answers;
    const out = transaction(()=>{
      const data=load(),a=data.accounts.find(a=>a.id===learnerId)!,state=a.courses[String(c.id)];
      if(!state?.enrolled) return {status:403,body:{error:'Enrollment required.'}};
      if(!lectures.length||lectures.some((l:any)=>!state.completed[String(l.id)])) return {status:403,body:{error:'Complete all lectures first.'}};
      if(state.certificate) return {status:200,body:{passed:true,certificate:state.certificate}};
      if(state.failedAt && Date.now()-state.failedAt<48*3600000) return {status:429,body:{error:'The 48-hour review period is still active.',failedAt:state.failedAt}};
      if(!questions.length||!Array.isArray(answers)||answers.length!==questions.length||answers.some((x:any,i:number)=>!Number.isInteger(x)||x<0||x>=(questions[i]?.options?.length||0))) return {status:400,body:{error:'Answer every question.'}};
      const score=answers.filter((x:number,i:number)=>x===questions[i].correctAnswer).length,passed=score===questions.length;
      if(passed){state.certificate={id:'V79-'+crypto.randomBytes(16).toString('hex'),issuedAt:new Date().toISOString(),name:a.name};delete state.failedAt;}else state.failedAt=Date.now();
      db.addExamAttempt({appId:c.id,studentId:a.id,studentName:a.name,score:`${score}/${questions.length}`,passed});
      writeJSON(file,data);
      return {status:201,body:{passed,score:`${score}/${questions.length}`,failedAt:state.failedAt,certificate:state.certificate}};
    });
    res.status(out.status).json(out.body);
  });
  app.get('/api/certificates/:id',(req,res)=>{
    for(const a of load().accounts)for(const [courseId,s] of Object.entries(a.courses))if(s.certificate?.id===req.params.id)return res.json({valid:true,course:course(courseId)?.name||'Course',...s.certificate});
    res.status(404).json({valid:false});
  });
  app.get('/api/admin/discussions',requireAdmin,(_req,res)=>res.json(db.getApps().filter((c:any)=>c.category==='courses').flatMap((c:any)=>readJSON<any[]>('discussion-'+c.id+'.json',[]).map(q=>({...q,courseId:c.id,courseName:c.name})))));
  app.post('/api/admin/discussions/:courseId/:questionId/reply',requireAdmin,(req,res)=>{
    const c=course(String(req.params.courseId));if(!c)return res.status(404).json({error:'Course unavailable'});
    if(!field(req.body?.text,1,2000))return res.status(400).json({error:'Reply must contain 1–2000 characters'});
    const ok = transaction(()=>{
      const dFile='discussion-'+c.id+'.json',list=readJSON<any[]>(dFile,[]),q=list.find(q=>q.id===req.params.questionId);
      if(!q) return false;
      q.replies.push({id:crypto.randomUUID(),author:'Vision79 Digital instructor',text:req.body.text.trim(),date:new Date().toISOString(),isInstructor:true});
      writeJSON(dFile,list);
      return true;
    });
    if(!ok)return res.status(404).json({error:'Question unavailable'});
    res.json({success:true});
  });
  app.get('/api/admin/enrollments',requireAdmin,(_req,res)=>res.json(load().accounts.flatMap(a=>Object.entries(a.courses).filter(([,s])=>s.requested&&!s.enrolled).map(([id])=>({studentId:a.id,name:a.name,email:a.email,courseId:id,course:course(id)?.name})))));
  app.post('/api/admin/enrollments',requireAdmin,(req,res)=>{
    const c=course(String(req.body?.courseId));if(!c)return res.status(404).json({error:'Student or course unavailable.'});
    const ok = transaction(()=>{
      const data=load(),a=data.accounts.find(a=>a.id===req.body?.studentId);
      if(!a) return false;
      const state=a.courses[String(c.id)] ||= newState();state.enrolled=true;state.requested=false;writeJSON(file,data);
      return true;
    });
    if(!ok)return res.status(404).json({error:'Student or course unavailable.'});
    res.json({success:true});
  });
}
