import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowRight, BarChart3, BookOpen, CheckCircle2, ChevronDown, Cloud,
  Cpu, FileText, Headphones, Monitor, Network, ShieldCheck, Workflow
} from "lucide-react";

const SERVICES = [
  {
    id: "digital-transformation",
    icon: Workflow,
    title: "Digital Transformation & Process Improvement",
    tagline: "Make everyday work simpler.",
    intro: "When paperwork, repeated tasks and disconnected tools slow people down, we help find a better way to work.",
    features: ["Business process assessments", "Workflow mapping and improvement", "Document digitisation and searchable records", "System integration", "Automation and reporting dashboards"],
    outcome: "Less repetitive work, easier access to information and clearer operational visibility.",
    cta: "Improve my business processes",
  },
  {
    id: "ai-automation",
    icon: Cpu,
    title: "AI & Intelligent Automation",
    tagline: "Put AI to work where it makes sense.",
    intro: "Explore useful AI opportunities with attention to staff readiness, information security and responsible adoption.",
    features: ["AI opportunity assessments", "Practical AI awareness and team training", "AI-assisted document processing", "Internal knowledge assistants", "Workflow automation and reporting"],
    outcome: "Improved productivity and more confident use of appropriate AI tools.",
    cta: "Explore AI for my business",
  },
  {
    id: "software",
    icon: BarChart3,
    title: "Business Software & SaaS Solutions",
    tagline: "Tools that fit how your business actually operates.",
    intro: "Evaluate, build and implement software around real operational needs, including suitable products within the evolving V79 ecosystem.",
    features: ["Custom web applications and portals", "Customer service and ticket management", "Inventory and sales tools", "Finance and performance reporting", "Website development and integrations"],
    outcome: "Less fragmented work and more useful information across business activities.",
    cta: "Discuss a business software solution",
  },
  {
    id: "networking",
    icon: Network,
    title: "ICT Infrastructure & Network Solutions",
    tagline: "Dependable foundations for everything else.",
    intro: "Your digital tools depend on connectivity, equipment and infrastructure that work reliably.",
    features: ["Structured cabling", "Wired and wireless networking", "Network installation and upgrades", "Routers, switches and connectivity troubleshooting", "Infrastructure and equipment assessments"],
    outcome: "A stronger technology foundation with fewer avoidable interruptions.",
    cta: "Discuss my ICT environment",
  },
  {
    id: "managed-it",
    icon: Headphones,
    title: "Managed ICT Services & Support",
    tagline: "Support beyond installation.",
    intro: "Choose practical ongoing ICT assistance and maintenance arrangements matched to your organisation's needs.",
    features: ["Remote and on-site support where available", "Preventative maintenance", "Fault investigation and management", "ICT inventory and vendor coordination", "Monitoring where included in the agreement"],
    outcome: "More predictable support and improved continuity.",
    cta: "Explore ICT support packages",
  },
  {
    id: "cybersecurity",
    icon: ShieldCheck,
    title: "Cybersecurity & Business Continuity",
    tagline: "Protect what keeps your business running.",
    intro: "Understand your risks and choose proportionate safeguards for systems, people and information.",
    features: ["ICT security reviews and MFA guidance", "Access and password practice assessments", "Backup and recovery planning", "Security awareness training", "Business continuity readiness"],
    outcome: "Stronger day-to-day practices and better preparation for disruption.",
    cta: "Review my business risks",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud & Productivity Systems",
    tagline: "Connect people, files and work more effectively.",
    intro: "Assess practical cloud services that help people collaborate while considering cost, access control and recovery needs.",
    features: ["Microsoft 365 and Google Workspace support", "Cloud migration planning", "User and permission configuration", "Cloud backup planning", "Collaboration and productivity systems"],
    outcome: "Better collaboration and clearer management of essential business information.",
    cta: "Explore cloud solutions",
  }
];

const packages = [
  { title: "Essential", who: "Small businesses needing occasional assistance", offer: "Scoped installations, assessments and support when needed." },
  { title: "Business Care", who: "Businesses needing ongoing ICT assistance", offer: "Scheduled maintenance, remote support and agreed response targets." },
  { title: "Managed Plus", who: "More technology-dependent organisations", offer: "A broader support scope, with monitoring and planned maintenance where agreed." }
];

const challenges = [
  { title: "Too much paperwork", answer: "Digitise documents, make records easier to find and simplify approvals.", service: "digital-transformation" },
  { title: "Customer requests getting lost", answer: "Improve ticket tracking, follow-up and team communication.", service: "software" },
  { title: "Disconnected applications", answer: "Map data flows and explore integration opportunities.", service: "digital-transformation" },
  { title: "Unreliable infrastructure", answer: "Review your network and support arrangements.", service: "networking" },
  { title: "Unclear opportunities for AI", answer: "Identify useful, responsible applications and train staff.", service: "ai-automation" },
  { title: "Not enough operational visibility", answer: "Bring key data into meaningful dashboards and reports.", service: "software" }
];

const steps = [
  { n: "01", title: "Understand", text: "We listen to your goals, challenges and current ways of working." },
  { n: "02", title: "Recommend", text: "We outline practical options and explain trade-offs and costs." },
  { n: "03", title: "Implement", text: "We deliver the agreed solution with your team." },
  { n: "04", title: "Support", text: "Where agreed, we provide ongoing help, training and improvements." }
];

export default function ServicesPage({
  onNavigate, openId, setOpenId
}: {
  onNavigate: (v: string) => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const reduce = useReducedMotion();
  const reveal = reduce ? {} : {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.55, ease: "easeOut" as const }
  };
  return (
    <div className="space-y-20 pb-16 sm:space-y-28">
      <section className="px-6 pt-12 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <motion.p {...reveal} className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Our services</motion.p>
          <motion.h1 {...reveal} className="mt-5 max-w-5xl text-4xl font-bold leading-[1.1] tracking-[-.05em] sm:text-6xl">
            Better systems. Smoother operations. <span className="text-v79-teal">More room to grow.</span>
          </motion.h1>
          <motion.p {...reveal} className="mt-7 max-w-3xl text-lg leading-8 text-app-text-sec">
            Your business doesn't need technology that creates more work. V79 Digital brings together digital transformation, business software and ICT expertise to help Caribbean organisations work more efficiently.
          </motion.p>
          <button onClick={() => onNavigate("contact")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-v79-teal px-7 py-4 text-sm font-bold text-white hover:bg-v79-teal-dark">Book a discovery call <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">How we help</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Start with the challenge. Find the right solution.</h2>
            <p className="mt-5 leading-8 text-app-text-sec">Digital transformation leads our approach. ICT infrastructure, ongoing support and business software are the foundations that make change practical.</p>
          </motion.div>
          <div className="grid gap-4">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              const expanded = s.id === openId;
              return (
                <motion.article {...reveal} key={s.id} id={s.id} className={"scroll-mt-36 overflow-hidden rounded-[1.5rem] border bg-app-bg transition-colors " + (expanded ? "border-v79-teal/50 shadow-lg" : "border-app-border hover:border-v79-teal/30")}>
                  <button type="button" onClick={() => setOpenId(expanded ? null : s.id)} aria-expanded={expanded} aria-controls={s.id + "-details"} className="flex w-full items-center gap-4 p-5 text-left sm:p-7">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-v79-teal/10 text-v79-teal"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-xs font-bold uppercase tracking-[.15em] text-v79-teal">{String(i + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}</span><span className="mt-1 block text-lg font-bold sm:text-2xl">{s.title}</span><span className="mt-1 block text-sm text-app-text-sec">{s.tagline}</span></span>
                    <ChevronDown className={"h-5 w-5 shrink-0 text-v79-teal transition-transform " + (expanded ? "rotate-180" : "")} aria-hidden="true" />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && <motion.div id={s.id + "-details"} initial={reduce ? false : {height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={reduce ? undefined : {height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                      <div className="grid gap-7 border-t border-app-border px-6 py-7 sm:grid-cols-[1fr_.95fr] sm:px-9">
                        <div>
                          <p className="leading-8 text-app-text-sec">{s.intro}</p>
                          <p className="mt-6 text-xs font-bold uppercase tracking-[.13em] text-v79-teal">What this can improve</p>
                          <p className="mt-2 text-sm leading-7 text-app-text-sec">{s.outcome}</p>
                          <button onClick={() => onNavigate("contact")} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-v79-teal hover:underline">{s.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                        </div>
                        <ul className="space-y-3">{s.features.map(feature => <li key={feature} className="flex items-start gap-3 rounded-xl bg-app-aside-bg/40 p-3 text-sm leading-6 text-app-text-sec"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-v79-teal" aria-hidden="true" />{feature}</li>)}</ul>
                      </div>
                    </motion.div>}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
          <p className="mt-6 text-sm leading-7 text-app-text-muted">Services, delivery locations, response times and technical scope are confirmed in each proposal or service agreement.</p>
        </div>
      </section>

      <section id="assessment" className="scroll-mt-32 bg-v79-navy px-6 py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[1fr_.85fr] lg:items-center">
          <motion.div {...reveal}>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-v79-teal-light">Business discovery</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Not sure what needs to change first?</h2>
            <p className="mt-5 leading-8 text-white/75">Start with a conversation about your business. We'll discuss priorities and immediate concerns, then recommend whether a more detailed, separately quoted technical or process assessment is worthwhile.</p>
            <button onClick={() => onNavigate("contact")} className="mt-7 inline-flex items-center gap-2 rounded-full bg-v79-teal px-6 py-3.5 text-sm font-bold text-white hover:bg-v79-teal-dark">Book a free discovery call <ArrowRight size={17} aria-hidden="true" /></button>
          </motion.div>
          <motion.div {...reveal} className="grid gap-3">
            {[
              [Monitor, "Technology foundations", "Networks, equipment, systems and support arrangements."],
              [ShieldCheck, "Risks and continuity", "Security practices, backups and operational dependencies."],
              [Workflow, "Workflows and information", "Paperwork, manual tasks, reporting and systems integration."]
            ].map(([Icon,heading,desc]) => { const Graphic=Icon as typeof Monitor; return <div key={heading as string} className="flex gap-4 rounded-2xl border border-white/15 bg-white/[.06] p-5"><Graphic className="mt-1 h-5 w-5 shrink-0 text-v79-teal-light" aria-hidden="true" /><div><h3 className="font-bold">{heading as string}</h3><p className="mt-1 text-sm leading-6 text-white/70">{desc as string}</p></div></div>; })}
          </motion.div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">ICT support packages</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Support that fits your business.</h2>
            <p className="mt-5 leading-8 text-app-text-sec">The right level of support depends on your systems, locations and team. These are example package structures for discussion, not published offers or guaranteed SLAs.</p>
          </motion.div>
          <div className="grid gap-4 lg:grid-cols-3">
            {packages.map(p => <motion.article {...reveal} key={p.title} className="rounded-[1.5rem] border border-app-border bg-app-aside-bg/35 p-7">
              <h3 className="text-2xl font-bold">{p.title}</h3><p className="mt-4 text-sm font-semibold text-v79-teal">{p.who}</p><p className="mt-4 leading-7 text-app-text-sec">{p.offer}</p>
              <button onClick={() => onNavigate("contact")} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-v79-teal hover:underline">Ask about this package <ArrowRight size={16} aria-hidden="true" /></button>
            </motion.article>)}
          </div>
          <p className="mt-5 text-xs leading-6 text-app-text-muted">Package naming, scope, prices, availability and service levels require separate commercial confirmation.</p>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mb-9 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Everyday business problems</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Tell us what's slowing you down.</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map(c=><motion.button {...reveal} type="button" key={c.title} className="rounded-2xl border border-app-border p-6 text-left transition hover:border-v79-teal/40 hover:shadow-lg" onClick={() => {setOpenId(c.service);document.getElementById(c.service)?.scrollIntoView({behavior:reduce?"auto":"smooth",block:"center"});}}>
              <h3 className="font-bold">{c.title}</h3><p className="mt-3 text-sm leading-7 text-app-text-sec">{c.answer}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-v79-teal">Explore solution <ArrowRight size={15} aria-hidden="true" /></span>
            </motion.button>)}
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Our approach</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">A clearer path forward.</h2></motion.div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{steps.map(s=><motion.div {...reveal} key={s.n} className="rounded-2xl border border-app-border bg-app-bg p-6"><span className="text-sm font-bold text-v79-teal">{s.n}</span><h3 className="mt-5 text-xl font-bold">{s.title}</h3><p className="mt-3 text-sm leading-7 text-app-text-sec">{s.text}</p></motion.div>)}</div>
        </div>
      </section>

      <section className="px-6">
        <motion.div {...reveal} className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] bg-v79-navy p-9 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal-light">From Idea to Advantage</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Your next improvement starts with a conversation.</h2><p className="mt-3 max-w-2xl leading-7 text-white/70">Let's identify the right priorities and a practical way forward for your business.</p></div>
          <button onClick={()=>onNavigate("contact")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-v79-teal px-7 py-4 text-sm font-bold text-white hover:bg-v79-teal-dark">Book a discovery call <ArrowRight size={17} aria-hidden="true" /></button>
        </motion.div>
      </section>
    </div>
  );
}
