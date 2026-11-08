import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Check, Search } from 'lucide-react';
import { BUSINESS_FAQS } from '../data/faqs';
import { Button } from './ui/Button';
import './faq.css';

const TOPICS = [['all', 'All'], ['start', 'Getting started'], ['people', 'People & trust'], ['work', 'Everyday work']];
const STEPS = [
  { label: 'Understand', title: 'Choose one real task.', text: 'Where does work get stuck? We look at a recurring task, the people involved and the tools you already use. Together, we choose a practical starting point.', service: 'AI advisory · workflow review', scene: 'One task. A clear purpose.', detail: 'Pick a routine enquiry your team handles often. Agree what a helpful reply needs to include.', foot: 'Understand the work before choosing the tool.' },
  { label: 'Try', title: 'Test it with care.', text: 'Use a small example, suitable information and a clear review step. Your team learns how to check the result before the workflow is used more widely.', service: 'Practical training · scoped implementation', scene: 'A draft, with a checkpoint.', detail: 'Use a fictional enquiry. Check the reply against the original message. A person approves the final wording.', foot: 'Illustrative exercise. No real customer data.' },
  { label: 'Decide', title: 'Measure. Then choose.', text: 'Compare the time, effort and quality against your current process. Expand what proves useful, improve what needs work, and stop what does not justify its cost.', service: 'Pilot review · ongoing support options', scene: 'Useful enough to keep?', detail: 'Compare the effort and corrections with your current process. Agree what to improve before expanding.', foot: 'Measure the task. Do not assume a saving.' },
];
const normalise = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function FAQPage({ onEnquire }: { onEnquire: (id?: string) => void }) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [open, setOpen] = useState<Set<string>>(() => new Set(['q1']));
  const [scene, setScene] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const visible = BUSINESS_FAQS.filter(f => (topic === 'all' || topic === f.topic) && normalise([f.question, f.answer, f.help, f.example].join(' ')).includes(normalise(query.trim())));
  const allOpen = visible.length > 0 && visible.every(f => open.has(f.id));

  function goToQuestion(id: string, updateUrl = true) {
    if (!BUSINESS_FAQS.some(f => f.id === id)) return;
    setQuery(''); setTopic('all');
    setOpen(previous => new Set(previous).add(id));
    if (updateUrl) window.history.replaceState(null, '', window.location.pathname + window.location.search + '#' + id);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      el?.querySelector('summary')?.focus({ preventScroll: true });
    });
  }

  useEffect(() => {
    const handleHash = () => goToQuestion(window.location.hash.slice(1), false);
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [reduced]);

  useEffect(() => {
    if (reduced || !stepsRef.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (window.innerWidth < 768) return;
      const best = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (best) setScene(Number((best.target as HTMLElement).dataset.step));
    }, { rootMargin: '-20% 0px -30% 0px', threshold: [0, 0.25, 0.5, 0.75] });
    stepsRef.current.querySelectorAll('[data-step]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!rootRef.current || !progressRef.current) return;
      const bounds = rootRef.current.getBoundingClientRect();
      const travel = rootRef.current.offsetHeight - window.innerHeight + 112;
      const value = travel > 0 ? Math.max(0, Math.min(1, (112 - bounds.top) / travel)) : 1;
      progressRef.current.style.transform = `scaleX(${value})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    if (rootRef.current) observer.observe(rootRef.current);
    update();
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  return <div className="business-faq" ref={rootRef}>
    <div ref={progressRef} className="faq-reading-progress" aria-hidden="true" />
    <section className="faq-wrap faq-hero" aria-labelledby="faq-heading">
      <div><p className="faq-eyebrow">Practical answers for your business</p><h1 id="faq-heading">AI questions.<br /><em>Human</em> answers.</h1><p className="faq-intro">You know your business. We help you work out where AI and better technology can make a useful difference.</p><div className="faq-actions"><Button href="#faq-answers" icon={<ArrowDown size={16} />}>Find your answer</Button><Button href="#faq-approach" variant="secondary">See how we start</Button></div><p className="faq-small">Based in Saint Lucia. Built around the way you work.</p></div>
      <div className="faq-illustration" aria-label="Illustrative workflow: draft, check, approve"><p className="faq-eyebrow">A small change. A useful start.</p><div className="faq-task"><small>The everyday task</small><p>“Can you help us respond to customer enquiries?”</p></div><div className="faq-connector" aria-hidden="true" /><div className="faq-result"><h2>Draft → check → approve</h2><p>AI helps with the first draft.<br />Your team makes the final call.</p></div><div className="faq-checks">{['Clear task', 'Careful review', 'Human decision'].map(t => <span key={t}><Check size={13} aria-hidden="true" />{t}</span>)}</div></div>
    </section>
    <section className="faq-wrap faq-choices" aria-labelledby="faq-choice-title"><div className="faq-row"><h2 id="faq-choice-title">What's on your mind?</h2><p>Start with the question that sounds like your business.</p></div><div className="faq-choice-grid">{["I'm not sure where to start", 'I need to understand the cost', "I'm concerned about our data", 'My team needs practical skills'].map((t, i) => <button type="button" key={t} onClick={() => goToQuestion(`q${i + 1}`)}>{t}<ArrowUpRight size={19} aria-hidden="true" /></button>)}</div></section>
    <section className="faq-wrap faq-approach" id="faq-approach" aria-labelledby="faq-approach-title"><div className="faq-section-head"><div><p className="faq-eyebrow">A sensible way forward</p><h2 id="faq-approach-title">Start small.<br />Learn something useful.</h2></div><p>A new tool is only useful when it fits your work. Here's how we help you find that fit.</p></div><div className="faq-journey"><div className="faq-scene"><div className="faq-scene-top"><span>Example: customer enquiries</span><span>0{scene + 1} / 03</span></div><div className="faq-scene-content" aria-live="polite" aria-atomic="true"><small>{STEPS[scene].label}</small><h3>{STEPS[scene].scene}</h3><p>{STEPS[scene].detail}</p></div><p className="faq-small">{STEPS[scene].foot}</p><button type="button" className="faq-link" onClick={() => setScene(s => (s + 1) % 3)}>{scene === 2 ? 'Back to first step' : 'Next example step'} →</button></div><div ref={stepsRef}>{STEPS.map((step, i) => <motion.article key={step.label} data-step={i} className="faq-step" initial={reduced ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.4 }}><p className="faq-eyebrow">0{i + 1} / {step.label}</p><h3>{step.title}</h3><p>{step.text}</p><small>{step.service}</small></motion.article>)}</div></div></section>
    <section className="faq-answer-section" id="faq-answers" aria-labelledby="faq-list-title"><div className="faq-wrap faq-layout"><aside className="faq-sidebar"><p className="faq-eyebrow">Your questions, answered</p><h2 id="faq-list-title">Let's make<br />it clearer.</h2><p>Honest answers. Practical examples. A next step that fits your business.</p><label htmlFor="faq-search">Search your question</label><div className="faq-search"><Search size={17} aria-hidden="true" /><input id="faq-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try cost, training or documents…" /></div><div className="faq-filters" role="group" aria-label="Filter questions by topic">{TOPICS.map(([id, label]) => <button key={id} type="button" aria-pressed={topic === id} onClick={() => setTopic(id)}>{label}</button>)}</div></aside><div><div className="faq-tools"><span role="status" aria-live="polite">{visible.length} question{visible.length === 1 ? '' : 's'}</span><button type="button" className="faq-link" disabled={!visible.length} onClick={() => setOpen(previous => { const next = new Set(previous); visible.forEach(f => allOpen ? next.delete(f.id) : next.add(f.id)); return next; })}>{allOpen ? 'Collapse all' : 'Expand all'}</button></div>{BUSINESS_FAQS.map((f, i) => <details key={f.id} id={f.id} className="faq-answer" hidden={!visible.includes(f)} open={open.has(f.id)} onToggle={e => { const isOpen = e.currentTarget.open; setOpen(previous => { if (previous.has(f.id) === isOpen) return previous; const next = new Set(previous); if (isOpen) next.add(f.id); else next.delete(f.id); return next; }); }}><summary><span className="faq-number">{String(i + 1).padStart(2, '0')}</span><span>{f.question}</span><span className="faq-plus" aria-hidden="true" /></summary><div className="faq-answer-body"><p>{f.answer}</p><div className="faq-help"><h3>How V79 can help</h3><p>{f.help}</p></div><p className="faq-example">{f.example}</p><div className="faq-answer-actions"><button type="button" className="faq-link" onClick={() => onEnquire(f.id)}>{f.cta} ↗</button><a className="faq-permalink" href={`#${f.id}`} aria-label={`Link to: ${f.question}`}>Link to this answer</a></div></div></details>)}{visible.length === 0 && <div className="faq-empty"><p>No matching questions. Try a broader word, choose All, or tell us what you need.</p><button type="button" className="faq-link" onClick={() => { setQuery(''); setTopic('all'); }}>Clear search and filters</button></div>}</div></div></section>
    <section className="faq-wrap faq-closeout"><div><p className="faq-eyebrow">Your next step</p><h2>Bring us one thing<br />you want to improve.</h2><p>A recurring task. A stack of paper. A system that does not fit. Let's understand the problem and discuss a practical way forward.</p><div className="faq-actions"><Button onClick={() => onEnquire()} icon={<ArrowUpRight size={17} />}>Tell us about your business</Button></div></div><div className="faq-next"><h3>Here's where we start.</h3><ol><li>You explain the task or challenge.</li><li>We discuss the requirements and possible scope.</li><li>You review a proposal before committing to work.</li></ol><p className="faq-small">No confidential documents needed for an initial enquiry.</p></div></section>
  </div>;
}
