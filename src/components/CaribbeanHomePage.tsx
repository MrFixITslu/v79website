import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight, ArrowUpRight, BarChart3, CheckCircle2, ChevronDown,
  ClipboardList, Cloud, Database, Headphones, HeartHandshake, Layers3,
  LockKeyhole, Network, ShieldCheck, Sparkles, Workflow, Zap,
} from "lucide-react";
import { V79OfficialLogo } from "./V79OfficialLogo";

interface HomePageProps {
  onNavigate: (view: string) => void;
}

const services = [
  {
    number: "01",
    icon: Workflow,
    category: "WORK SMARTER",
    title: "Digital transformation & automation",
    description: "Simplify everyday work, reduce repetitive tasks and turn scattered information into better decisions.",
    points: ["Workflow and process improvement", "AI and practical automation", "Reporting and KPI dashboards"],
    action: "Explore digital transformation",
  },
  {
    number: "02",
    icon: Network,
    category: "BUILD STRONGER",
    title: "ICT infrastructure & managed services",
    description: "Get the reliable networks, devices, connectivity and ongoing technical support your business needs to operate confidently.",
    points: ["Structured cabling and Wi-Fi", "ICT installation and support", "Maintenance, backups and continuity"],
    action: "Explore ICT services & packages",
  },
  {
    number: "03",
    icon: Layers3,
    category: "GROW FURTHER",
    title: "Business software & digital solutions",
    description: "Connect your people, processes and business information with tools tailored to how you actually operate.",
    points: ["Business applications and websites", "Inventory and service management", "Connected workflows and portals"],
    action: "Explore business solutions",
  },
];

const challenges = [
  { icon: ClipboardList, title: "Too much manual work", answer: "Replace repetitive paperwork with simpler digital processes." },
  { icon: Database, title: "Information everywhere", answer: "Connect records and make important details easier to find." },
  { icon: BarChart3, title: "Limited business visibility", answer: "Make sales, operations and performance easier to understand." },
  { icon: LockKeyhole, title: "Security concerns", answer: "Assess risks and put appropriate protections in place." },
  { icon: Network, title: "Unreliable connectivity", answer: "Improve the network foundation your work depends on." },
  { icon: Sparkles, title: "Not sure where AI fits", answer: "Identify practical uses before investing in unnecessary tools." },
  { icon: Cloud, title: "Outdated systems", answer: "Plan sensible upgrades and migrations at the right pace." },
  { icon: Headphones, title: "Limited in-house IT support", answer: "Access technical expertise matched to your requirements." },
  { icon: HeartHandshake, title: "Customer follow-up gaps", answer: "Organise enquiries, requests and service workflows." },
  { icon: ShieldCheck, title: "Unexpected disruption", answer: "Prepare backups and business-continuity processes." },
];

const faqs = [
  {
    q: "What is digital transformation for a small business?",
    a: "It means improving how your business works by using technology where it adds value. That could be as simple as a digital form or dashboard, or as involved as connecting several business systems.",
  },
  {
    q: "Do I need to replace all my current systems?",
    a: "Usually not. We begin by understanding what already works, where time or money is being lost and which improvements are most worthwhile.",
  },
  {
    q: "Can you help reduce paperwork and repetitive work?",
    a: "Yes. Depending on your needs, we can help streamline approvals, forms, reporting, information capture and other repeatable processes.",
  },
  {
    q: "What if my business has unreliable Wi-Fi or network problems?",
    a: "We can assess your ICT setup and scope networking, connectivity, installation, maintenance or managed-support services appropriate to your location and equipment.",
  },
  {
    q: "Can you help us use AI without making things complicated?",
    a: "We start with your goals and existing workflows, then assess whether an AI-enabled tool, a simpler automation or a process change is the best fit. Training can be included.",
  },
  {
    q: "Can different business applications work together?",
    a: "Often they can, depending on the tools, available integrations and permissions. We evaluate what is technically practical before recommending a solution.",
  },
  {
    q: "Can you develop a website or custom business application?",
    a: "Yes. We can discuss websites, web applications, customer portals and custom software based on your requirements, budget and support needs.",
  },
  {
    q: "How can I protect business information against cyber threats?",
    a: "A sensible starting point is to review access controls, updates, backups, authentication, staff practices and recovery plans. Any assessment and implementation are scoped to your business.",
  },
  {
    q: "Do you work with businesses across the Caribbean?",
    a: "V79 Digital is positioned to serve Caribbean businesses. Remote consultation and project work can be discussed regionally; on-site delivery depends on the project and location.",
  },
  {
    q: "How do we get started, and what will it cost?",
    a: "Start with a free 30-minute discovery conversation. We will discuss your priorities, then outline practical next steps and a proposal if further work makes sense. Project fees and support packages depend on scope.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function CaribbeanHomePage({ onNavigate }: HomePageProps) {
  const reducedMotion = useReducedMotion();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const reveal = reducedMotion ? {} : {
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: { once: true, amount: 0.13 },
    transition: { duration: 0.65, ease: "easeOut" as const },
    variants: fadeUp,
  };

  return (
    <div className="bg-app-bg text-app-text">
      <section className="relative isolate overflow-hidden px-6 pb-24 pt-20 sm:pt-28 lg:pb-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(14,143,136,.10),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(232,98,47,.07),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <div className="space-y-8">
            <motion.div initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-v79-teal/25 bg-v79-teal/10 px-4 py-2 text-xs font-semibold tracking-wide text-v79-teal">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-v79-teal" />
                Built for businesses across the Caribbean
              </span>
            </motion.div>
            <motion.div className="space-y-6" initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08 }}>
              <p className="text-sm font-semibold uppercase tracking-[.22em] text-v79-teal">From Idea to Advantage</p>
              <h1 className="max-w-3xl text-5xl font-bold tracking-[-.055em] leading-[1.07] sm:text-6xl lg:text-[4.8rem]">
                Better business starts with <span className="text-v79-teal">smarter technology.</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-app-text-sec">
                Your goals come first. We help Caribbean businesses simplify operations, build dependable ICT foundations and use digital solutions to make meaningful progress.
              </p>
            </motion.div>
            <motion.div className="flex flex-wrap gap-3" initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }}>
              <button type="button" onClick={() => onNavigate("contact")} className="inline-flex items-center gap-2 rounded-full bg-v79-teal px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-v79-teal/20 transition hover:-translate-y-0.5 hover:bg-v79-teal-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-v79-teal">
                Book a free consultation <ArrowUpRight size={17} aria-hidden="true" />
              </button>
              <a href="#services-overview" className="inline-flex items-center gap-2 rounded-full border border-app-border px-7 py-4 text-sm font-semibold text-app-text transition hover:border-v79-teal hover:text-v79-teal">
                Explore our services <ArrowRight size={17} aria-hidden="true" />
              </a>
            </motion.div>
            <p className="text-sm text-app-text-muted">Practical advice. Clear priorities. A partner invested in your progress.</p>
          </div>
          <motion.div {...reveal} className="relative mx-auto w-full max-w-[510px]">
            <div className="rounded-[2.5rem] border border-app-border bg-white/80 p-6 shadow-[0_30px_80px_rgba(11,31,51,.11)] backdrop-blur-md dark:bg-v79-navy-light/80 sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-v79-teal">Business progress</p><h2 className="mt-1 text-xl font-bold">It starts with understanding.</h2></div>
                <V79OfficialLogo size="sm" />
              </div>
              <div className="grid gap-3">
                {[
                  { step: "01", icon: HeartHandshake, title: "Your goals", detail: "What matters most to you?" },
                  { step: "02", icon: Workflow, title: "A practical plan", detail: "The right improvements, in the right order." },
                  { step: "03", icon: Zap, title: "Real progress", detail: "Tools, support and room to grow." },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return <div key={item.step} className="flex items-center gap-4 rounded-2xl border border-app-border bg-app-bg p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-v79-teal/10 text-v79-teal"><Icon size={22} aria-hidden="true" /></span>
                    <div className="flex-1"><p className="text-xs font-semibold text-v79-teal">STEP {item.step}</p><h3 className="font-semibold">{item.title}</h3><p className="text-xs leading-5 text-app-text-sec">{item.detail}</p></div>
                    {i < 2 ? <ArrowRight className="text-app-text-muted" size={17} aria-hidden="true" /> : <CheckCircle2 className="text-v79-teal" size={19} aria-hidden="true" />}
                  </div>;
                })}
              </div>
              <p className="mt-6 text-center text-xs text-app-text-muted">People first. Technology with purpose.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services-overview" className="scroll-mt-24 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="mb-12 max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-v79-teal">What we do</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">One business partner. Three ways to move forward.</h2>
            <p className="mt-5 text-lg leading-8 text-app-text-sec">Whether you need better processes, reliable ICT support or business software, we start with the challenge—not a product pitch.</p>
          </motion.div>
          <div className="grid gap-5 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = service.icon;
              return <motion.article key={service.number} {...reveal} transition={{ duration: 0.55, delay: reducedMotion ? 0 : i * 0.07 }} className="group flex h-full flex-col rounded-[2rem] border border-app-border bg-white/65 p-7 transition duration-300 hover:-translate-y-1 hover:border-v79-teal/30 hover:shadow-xl dark:bg-v79-navy-light/65 sm:p-9">
                <div className="mb-9 flex items-start justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-v79-teal/10 text-v79-teal"><Icon size={27} aria-hidden="true" /></span><span className="text-sm text-app-text-muted">{service.number} / 03</span></div>
                <p className="mb-3 text-xs font-semibold tracking-[.2em] text-v79-teal">{service.category}</p>
                <h3 className="text-2xl font-bold tracking-tight">{service.title}</h3>
                <p className="mt-4 leading-7 text-app-text-sec">{service.description}</p>
                <ul className="mt-7 flex-1 space-y-3">{service.points.map(point => <li key={point} className="flex gap-2 text-sm text-app-text-sec"><CheckCircle2 className="mt-0.5 shrink-0 text-v79-teal" size={16} aria-hidden="true" />{point}</li>)}</ul>
                <button type="button" onClick={() => onNavigate("services")} className="mt-8 inline-flex items-center gap-2 self-start text-sm font-bold text-v79-teal hover:underline">{service.action}<ArrowUpRight size={16} aria-hidden="true" /></button>
              </motion.article>;
            })}
          </div>
        </div>
      </section>

      <section id="cost-of-downtime" className="scroll-mt-24 bg-v79-navy px-6 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="mb-12 max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-v79-teal-light">Business challenges</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">You know the problems. Let's work on the possibilities.</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">Here are some everyday challenges we help businesses think through and address.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {challenges.map((item) => {
              const Icon = item.icon;
              return <motion.article {...reveal} key={item.title} className="rounded-2xl border border-white/15 bg-white/[.055] p-5">
                <Icon className="mb-5 text-v79-teal-light" size={24} aria-hidden="true" />
                <h3 className="font-semibold leading-6">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{item.answer}</p>
              </motion.article>;
            })}
          </div>
        </div>
      </section>

      <section id="why-v79" className="scroll-mt-24 px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-24">
          <motion.div {...reveal}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-v79-teal">Why V79 Digital</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">A relationship built around your business.</h2>
            <p className="mt-5 text-lg leading-8 text-app-text-sec">We want your investment in technology to be worthwhile. That means listening, explaining your options clearly and staying focused on what helps you make progress.</p>
            <p className="mt-6 text-sm font-semibold text-v79-teal">20+ years of Caribbean ICT and telecommunications experience</p>
          </motion.div>
          <motion.div {...reveal} className="grid gap-4 sm:grid-cols-2">
            {[
              ["Listen first", "We learn how your business works before proposing changes."],
              ["Make it practical", "We recommend solutions that suit your needs and capacity."],
              ["Support the journey", "Technology works best with training, maintenance and improvement."],
              ["Measure what matters", "We aim for clear operational value, not unnecessary complexity."],
            ].map(([title, desc], i) => <article key={title} className="rounded-3xl border border-app-border bg-white/60 p-7 dark:bg-v79-navy-light/60"><span className="text-sm font-bold text-v79-teal">0{i + 1}</span><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-app-text-sec">{desc}</p></article>)}
          </motion.div>
        </div>
      </section>

      <section className="bg-v79-sand-light/40 px-6 py-20 dark:bg-v79-navy-light/40 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="mb-12 max-w-3xl"><p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-v79-teal">How we work</p><h2 className="text-4xl font-bold tracking-tight sm:text-5xl">No complicated starting point.</h2><p className="mt-5 text-lg leading-8 text-app-text-sec">A clear, manageable path from understanding your challenges to improving the way you work.</p></motion.div>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              ["Discover", "Talk through your goals and current challenges."],
              ["Prioritise", "Agree which improvements will deliver value first."],
              ["Implement", "Put the right services, processes or tools in place."],
              ["Improve", "Review outcomes and continue to support growth."],
            ].map(([title, desc], i) => <motion.div {...reveal} key={title} className="rounded-3xl border border-app-border bg-white/80 p-7 dark:bg-v79-navy/80"><span className="text-4xl font-bold text-v79-teal/45">0{i + 1}</span><h3 className="mt-7 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-app-text-sec">{desc}</p></motion.div>)}
          </div>
        </div>
      </section>

      <section id="free-assessment" className="scroll-mt-24 px-6 py-20 sm:py-28">
        <motion.div {...reveal} className="mx-auto max-w-5xl rounded-[2.5rem] bg-v79-teal px-8 py-14 text-white sm:px-16 sm:py-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-white/75">Let's talk about your business</p>
          <h2 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Start with a conversation, not a commitment.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">Tell us what you're trying to improve. We'll explore your options together and identify a sensible next step.</p>
          <button type="button" onClick={() => onNavigate("contact")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-v79-navy transition hover:-translate-y-0.5 hover:shadow-xl">Book a free 30-minute consultation <ArrowUpRight size={17} aria-hidden="true" /></button>
        </motion.div>
      </section>

      <section aria-labelledby="faq-heading" className="px-6 pb-24 pt-10 sm:pb-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <motion.div {...reveal}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-v79-teal">Frequently asked questions</p>
            <h2 id="faq-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">A few answers to help you get started.</h2>
            <p className="mt-5 leading-8 text-app-text-sec">You don't have to know the technical language to find the right solution.</p>
          </motion.div>
          <div className="divide-y divide-app-border border-y border-app-border">
            {faqs.map((faq, i) => {
              const expanded = activeFaq === i;
              return <div key={faq.q} className="py-1"><h3><button type="button" aria-expanded={expanded} aria-controls={"caribbean-faq-" + i} onClick={() => setActiveFaq(expanded ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold focus-visible:outline-2 focus-visible:outline-v79-teal"><span>{faq.q}</span><ChevronDown className={expanded ? "shrink-0 rotate-180 text-v79-teal transition-transform" : "shrink-0 text-v79-teal transition-transform"} size={20} aria-hidden="true" /></button></h3><div id={"caribbean-faq-" + i} hidden={!expanded} className="pb-6 pr-8 text-sm leading-7 text-app-text-sec">{faq.a}</div></div>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
