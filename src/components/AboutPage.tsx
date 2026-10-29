import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight, BookOpen, CheckCircle2, Compass, HeartHandshake,
  Network, ShieldCheck, Sparkles, Target, Users, Workflow
} from "lucide-react";

const values = [
  { icon: HeartHandshake, title: "Relationships first", detail: "We listen, communicate clearly and understand the people behind each business." },
  { icon: Target, title: "Value over complexity", detail: "The best solution is the one that solves a meaningful business problem." },
  { icon: Workflow, title: "Practical progress", detail: "We focus on improvements your team can adopt, use and maintain." },
  { icon: ShieldCheck, title: "Trust and responsibility", detail: "We take privacy, security, clear expectations and responsible technology seriously." },
  { icon: Users, title: "Long-term growth", detail: "We want customers to gain skills, confidence and greater independence." }
];

const story = [
  { n: "01", title: "Understand the business", desc: "Start with the people, the goals and the day-to-day challenges—not a product pitch." },
  { n: "02", title: "Find practical improvements", desc: "Identify the systems, workflows and technology foundations that will make the most difference." },
  { n: "03", title: "Build lasting capability", desc: "Implement thoughtfully, share knowledge and help teams keep improving." }
];

export default function AboutPage() {
  const reducedMotion = useReducedMotion();
  const reveal = reducedMotion ? {} : {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.55, ease: "easeOut" as const }
  };
  return (
    <div className="space-y-20 pb-16 sm:space-y-28">
      <section className="relative overflow-hidden px-6 pt-12 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(14,143,136,.11),transparent_58%)]" />
        <div className="relative mx-auto max-w-6xl">
          <motion.p {...reveal} className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-v79-teal">About V79 Digital</motion.p>
          <motion.h1 {...reveal} className="max-w-5xl text-4xl font-bold leading-[1.1] tracking-[-.05em] sm:text-6xl lg:text-7xl">
            Your ambitions deserve more than <span className="text-v79-teal">just technology.</span>
          </motion.h1>
          <motion.p {...reveal} className="mt-8 max-w-3xl text-lg leading-8 text-app-text-sec">
            They deserve a partner who understands what you're trying to achieve. We help Caribbean businesses turn challenges into opportunities through practical solutions, dependable ICT services and relationships built on trust.
          </motion.p>
          <motion.p {...reveal} className="mt-6 text-sm font-semibold uppercase tracking-[.18em] text-v79-teal">From Idea to Advantage</motion.p>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <motion.div {...reveal} className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Our story</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Built on experience. Driven by purpose.</h2>
            <p className="text-base leading-8 text-app-text-sec">Vision79 was built around a simple belief: technology should help people and businesses move forward. Through V79 Digital, we bring together telecommunications and ICT experience, business-focused problem-solving and a commitment to practical digital transformation.</p>
            <p className="text-base leading-8 text-app-text-sec">Our goal is not to introduce technology for its own sake. We want to understand how a business operates, identify what is holding it back and help create solutions that deliver lasting value.</p>
            <p className="text-base leading-8 text-app-text-sec">When our customers become more efficient and confident, the relationships we build can help both their businesses and ours grow.</p>
          </motion.div>
          <motion.div {...reveal} className="rounded-[2rem] border border-app-border bg-v79-navy p-8 text-white shadow-xl sm:p-10">
            <HeartHandshake className="mb-10 h-12 w-12 text-v79-teal-light" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[.18em] text-v79-teal-light">What guides our work</p>
            <p className="mt-5 text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">Technology is the tool. <span className="text-v79-teal-light">Your progress is the reason.</span></p>
            <div className="mt-10 border-t border-white/20 pt-6 text-sm leading-7 text-white/70">Our work starts with your goals, not a pre-selected platform or an unnecessary upgrade.</div>
          </motion.div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          <motion.article {...reveal} className="rounded-[2rem] border border-app-border bg-white/70 p-8 dark:bg-v79-navy-light/45 sm:p-10">
            <Compass className="mb-7 h-9 w-9 text-v79-teal" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Our mission</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Help Caribbean businesses work smarter and grow stronger.</h2>
            <p className="mt-5 leading-7 text-app-text-sec">Make useful technology, digital knowledge and effective business systems more accessible, while reducing complexity and improving everyday operations.</p>
          </motion.article>
          <motion.article {...reveal} className="rounded-[2rem] border border-app-border bg-white/70 p-8 dark:bg-v79-navy-light/45 sm:p-10">
            <Sparkles className="mb-7 h-9 w-9 text-v79-teal" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Our vision</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">A Caribbean where businesses compete with confidence.</h2>
            <p className="mt-5 leading-7 text-app-text-sec">A region where businesses of every size can access the skills, infrastructure and digital solutions needed to serve customers and pursue new opportunities.</p>
          </motion.article>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">What matters to us</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Relationships, value and real progress.</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => { const Icon = v.icon; return (
              <motion.article {...reveal} key={v.title} className="rounded-2xl border border-app-border bg-app-aside-bg/40 p-6">
                <Icon className="h-7 w-7 text-v79-teal" aria-hidden="true" />
                <h3 className="mt-6 text-lg font-bold">{v.title}</h3>
                <p className="mt-3 text-sm leading-7 text-app-text-sec">{v.detail}</p>
              </motion.article>
            ); })}
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto grid max-w-6xl gap-10 rounded-[2rem] border border-app-border bg-app-aside-bg/45 p-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center sm:p-12">
          <motion.div {...reveal}>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Experience behind the business</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Technical experience. Business perspective.</h2>
            <p className="mt-6 leading-8 text-app-text-sec">V79 Digital is led by Neil Verdant, who brings more than 20 years of experience across Caribbean telecommunications, ICT operations, service delivery, technology planning and team leadership.</p>
            <p className="mt-4 leading-8 text-app-text-sec">That experience informs an approach focused on reliable service, business continuity, customer communication and operational improvement.</p>
          </motion.div>
          <motion.div {...reveal} className="space-y-3">
            {[
              ["Service delivery", "Clear expectations, practical support and accountable communication."],
              ["ICT foundations", "Experience across networks, connectivity and business technology."],
              ["Business improvement", "A focus on efficiency, decision-making and useful outcomes."]
            ].map(([heading,desc])=><div key={heading} className="flex gap-4 rounded-2xl border border-app-border bg-app-bg p-5">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-v79-teal" aria-hidden="true" />
              <div><h3 className="font-bold">{heading}</h3><p className="mt-1 text-sm leading-6 text-app-text-sec">{desc}</p></div>
            </div>)}
          </motion.div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
          <motion.div {...reveal} className="rounded-[2rem] border border-app-border p-8 sm:p-10">
            <BookOpen className="mb-5 h-8 w-8 text-v79-teal" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Knowledge and community</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Progress grows when knowledge is shared.</h2>
            <p className="mt-4 leading-7 text-app-text-sec">We are developing practical AI and technology training initiatives to help business owners, employees and young people build digital confidence. Learning programmes and training resources are managed through V79 Academy.</p>
            <a href="https://academy.v79sl.com" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-v79-teal hover:underline">Explore V79 Academy <ArrowRight size={17} aria-hidden="true" /></a>
          </motion.div>
          <motion.div {...reveal} className="rounded-[2rem] border border-app-border p-8 sm:p-10">
            <Network className="mb-5 h-8 w-8 text-v79-teal" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Our approach</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">A partner for each step forward.</h2>
            <div className="mt-6 space-y-5">{story.map(s=><div key={s.n} className="flex gap-4"><span className="text-sm font-bold text-v79-teal">{s.n}</span><div><h3 className="font-bold">{s.title}</h3><p className="mt-1 text-sm leading-6 text-app-text-sec">{s.desc}</p></div></div>)}</div>
          </motion.div>
        </div>
      </section>

      <section className="px-6">
        <motion.div {...reveal} className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] bg-v79-navy p-9 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal-light">From Idea to Advantage</p><h2 className="mt-3 text-3xl font-bold tracking-tight">We start with your goals.</h2><p className="mt-3 max-w-2xl leading-7 text-white/70">Tell us what you're trying to improve. We'll explore the practical options together.</p></div>
          <a href="mailto:vision79slu@gmail.com?subject=V79%20Digital%20Consultation" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-v79-teal px-7 py-4 text-sm font-bold text-white hover:bg-v79-teal-dark">Talk to V79 Digital <ArrowRight size={17} aria-hidden="true" /></a>
        </motion.div>
      </section>
    </div>
  );
}
