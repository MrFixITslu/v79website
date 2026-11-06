import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, Cloud,
  Headphones, LockKeyhole, MessageSquareText, Network, ShieldCheck,
  Sparkles, Workflow, Wrench, MonitorCheck, MapPin, ClipboardList
} from "lucide-react";
import { SERVICE_PAGES } from "../data/siteOfferings";

const ICONS = [Headphones, ShieldCheck, Cloud, Network, Sparkles, Workflow];

const NEEDS = [
  {
    id: "support",
    label: "My IT keeps interrupting work",
    heading: "Make everyday IT less stressful",
    detail: "Start by understanding what regularly goes wrong, who needs help and what a sensible support plan could cover.",
    service: "/services/managed-it-support",
    cta: "Explore managed IT support"
  },
  {
    id: "security",
    label: "I want to protect important data",
    heading: "Put protection where it matters",
    detail: "Review account security, backup habits and the most important risks before buying unnecessary products.",
    service: "/services/cybersecurity",
    cta: "Explore cybersecurity"
  },
  {
    id: "operations",
    label: "Our business needs better tools",
    heading: "Simplify the work behind the work",
    detail: "See whether a better process, an existing tool or a V79 application could help your team spend less time chasing updates.",
    service: "/services/business-software",
    cta: "Explore business software"
  }
] as const;

const TOUR = [
  {
    id: "receive",
    tab: "01 Receive",
    label: "The request arrives",
    title: "Keep requests in one place",
    detail: "A customer or colleague needs help. Instead of losing the request in a busy inbox, the team starts with a clear record.",
    step: "Request captured"
  },
  {
    id: "manage",
    tab: "02 Manage",
    label: "The team takes action",
    title: "Give every request a next step",
    detail: "The team sees what needs attention, follows up and keeps meaningful updates with the request.",
    step: "Progress visible"
  },
  {
    id: "review",
    tab: "03 Review",
    label: "The work is followed through",
    title: "Build a more reliable service habit",
    detail: "The request and its history are easier to review, helping the team spot what still needs work.",
    step: "History retained"
  }
] as const;

const QUESTIONS = [
  {
    question: "Will someone explain the options without jargon?",
    answer: "Yes. Our first conversation focuses on the problem, what matters to your business and the next practical step. Any detailed technical assessment is scoped separately."
  },
  {
    question: "Do you only support businesses in Saint Lucia?",
    answer: "Saint Lucia is our home market for on-site services. We also design software, training and suitable remote solutions for businesses across the Caribbean; delivery depends on the service and location."
  },
  {
    question: "Does every service come with 24-hour support?",
    answer: "No. Service hours, response targets and emergency arrangements are confirmed in the support agreement or proposal."
  }
];

export default function HybridHomePage() {
  const [needId, setNeedId] = useState<string>("support");
  const [tourId, setTourId] = useState<string>("receive");
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const activeNeed = NEEDS.find(need => need.id === needId) || NEEDS[0];
  const activeTour = TOUR.find(step => step.id === tourId) || TOUR[0];

  return (
    <div className="overflow-hidden">
      <section aria-labelledby="home-headline" className="relative isolate overflow-hidden bg-app-bg px-6 pt-12 pb-20 sm:pt-20 lg:px-12 lg:pt-24 lg:pb-28">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-4 h-80 w-80 rounded-full border border-v79-teal/10 sm:h-[32rem] sm:w-[32rem]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-16 h-72 w-72 rounded-full border border-v79-teal/10 sm:h-[27rem] sm:w-[27rem]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-v79-teal/25 bg-v79-teal/5 px-4 py-2 text-xs font-semibold tracking-wide text-v79-teal-dark dark:text-v79-teal-light">
              <MapPin aria-hidden="true" className="h-4 w-4" /> Saint Lucia roots · Caribbean reach
            </div>
            <h1 id="home-headline" className="max-w-4xl font-display text-4xl font-extrabold leading-[1.09] tracking-tight text-app-text sm:text-5xl lg:text-[clamp(3rem,4.8vw,5rem)] dark:text-white">
              Technology that helps your business <span className="text-v79-teal-dark dark:text-v79-teal-light">move forward.</span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-app-text-sec sm:text-lg">
              Managed IT, cybersecurity, practical business software and AI guidance for Caribbean organisations that want reliable systems without unnecessary complexity.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="/contact?topic=managed-it-support" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-v79-teal-dark px-6 py-3 font-semibold text-white no-underline shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v79-teal">
                Discuss your IT needs <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a href="/software" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-btn-sec px-6 py-3 font-semibold text-app-text no-underline transition hover:border-v79-teal/50 dark:text-white">
                Explore V79 software <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm text-app-text-muted">A clear first conversation. A practical plan. Support and response arrangements agreed before work begins.</p>
          </div>

          <div className="relative rounded-[2rem] border border-v79-teal/15 bg-v79-navy p-6 text-white shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-5">
              <div className="flex items-center gap-2"><MonitorCheck className="h-5 w-5 text-v79-teal-light" aria-hidden="true" /><span className="text-sm font-semibold">What better technology makes possible</span></div>
              <span className="h-2 w-2 rounded-full bg-v79-teal-light" aria-hidden="true" />
            </div>
            <div className="space-y-4 py-8">
              {[
                ["01", "Less disruption", "A clear route to IT support and maintenance."],
                ["02", "More confidence", "Practical safeguards and recovery planning."],
                ["03", "Smoother work", "Digital tools that fit real business processes."]
              ].map(([num, title, detail]) => (
                <div key={num} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <span className="font-mono text-sm font-bold text-v79-teal-light">{num}</span>
                  <div><h2 className="font-display text-base font-semibold">{title}</h2><p className="mt-1 text-sm leading-relaxed text-white/70">{detail}</p></div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-white/15 pt-5 text-sm text-white/70">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-v79-teal-light" /> Designed around your business, not a one-size-fits-all package
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="who-we-help" className="border-y border-app-border bg-app-aside-bg/50 px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="who-we-help" className="font-display text-lg font-bold text-app-text dark:text-white">Who we help</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-app-text-sec">Independent businesses, professional offices and growing Caribbean organisations that want practical support and useful tools.</p>
          </div>
          <a href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline">Meet V79 Digital <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </div>
      </section>

      <section aria-labelledby="needs-heading" className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">Start with the problem</p>
          <h2 id="needs-heading" className="mt-3 font-display text-3xl font-extrabold text-app-text sm:text-4xl dark:text-white">What would you like to improve?</h2>
          <p className="mt-3 text-app-text-sec">Choose a challenge to see a sensible first step. You can still explore every service below.</p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.05fr]">
          <div className="grid gap-3" role="group" aria-label="Choose a business challenge">
            {NEEDS.map((need, i) => (
              <button key={need.id} type="button" aria-pressed={needId === need.id} onClick={() => setNeedId(need.id)}
                className={"flex min-h-20 items-center gap-4 rounded-2xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v79-teal " +
                (needId === need.id ? "border-v79-teal bg-v79-teal/10 text-app-text shadow-sm dark:text-white" : "border-app-border bg-app-bg text-app-text-sec hover:border-v79-teal/40")}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current/20 font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-semibold">{need.label}</span>
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div aria-live="polite" aria-atomic="true" className="flex flex-col justify-between rounded-3xl bg-v79-navy px-7 py-8 text-white sm:px-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-v79-teal-light">A helpful first step</p>
              <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{activeNeed.heading}</h3>
              <p className="mt-4 max-w-lg leading-7 text-white/80">{activeNeed.detail}</p>
            </div>
            <a href={activeNeed.service} className="mt-8 inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-white/20 px-4 py-2.5 font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {activeNeed.cta} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="services-overview" aria-labelledby="services-heading" className="scroll-mt-32 border-t border-app-border bg-app-aside-bg/40 px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">Our services</p>
            <h2 id="services-heading" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl dark:text-white">The right help, without the jargon.</h2>
            <p className="mt-3 text-app-text-sec">From day-to-day support to smarter ways of working, explore the service that fits your needs.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {SERVICE_PAGES.map((service, i) => {
              const Icon = ICONS[i] || Wrench;
              return (
                <article key={service.slug} className="group flex h-full flex-col rounded-2xl border border-app-border bg-app-bg p-6 transition hover:-translate-y-0.5 hover:border-v79-teal/40 hover:shadow-lg motion-reduce:transform-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-v79-teal/10 text-v79-teal-dark dark:text-v79-teal-light"><Icon aria-hidden="true" className="h-6 w-6" /></div>
                  <h3 className="mt-6 font-display text-xl font-bold text-app-text dark:text-white">{service.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-app-text-sec">{service.summary}</p>
                  <a href={service.path} className="mt-7 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v79-teal">
                    Learn more <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why-v79" aria-labelledby="why-v79-heading" className="scroll-mt-32 mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">Our approach</p>
            <h2 id="why-v79-heading" className="mt-3 font-display text-3xl font-extrabold text-app-text sm:text-4xl dark:text-white">Practical by design. Personal by nature.</h2>
            <p className="mt-5 leading-8 text-app-text-sec">V79 combines hands-on Caribbean ICT experience with a straightforward way of working. We start by understanding the business problem, not selling a list of products.</p>
            <a href="/about" className="mt-6 inline-flex items-center gap-2 font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline">How we work <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {[
              { icon: Wrench, title: "Real technical experience", copy: "Our founder's telecommunications and ICT career informs a practical approach to service delivery." },
              { icon: MessageSquareText, title: "A reachable point of contact", copy: "Talk through your challenge and agree clear next steps, responsibilities and communication." },
              { icon: LockKeyhole, title: "Security considered early", copy: "Protecting information and making recovery plans are part of technology decisions." },
              { icon: MapPin, title: "Caribbean operating context", copy: "Connectivity, storms, budget and available support all shape sensible solutions." }
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="border-t border-app-border pt-5">
                <Icon aria-hidden="true" className="h-6 w-6 text-v79-teal-dark dark:text-v79-teal-light" />
                <h3 className="mt-4 font-display text-lg font-bold text-app-text dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-app-text-sec">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-we-work" aria-labelledby="how-heading" className="scroll-mt-32 bg-v79-navy px-6 py-20 text-white lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-light">A clear process</p>
          <h2 id="how-heading" className="mt-3 max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">Know what happens next.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Discuss", "Tell us what your business needs to improve."],
              ["02", "Assess", "Agree the right scope, priorities and available options."],
              ["03", "Implement", "Make the approved changes with a clear handover."],
              ["04", "Support", "Review the agreed support and next improvements."]
            ].map(([number, title, detail]) => (
              <div key={number} className="rounded-2xl border border-white/15 bg-white/[0.05] p-6">
                <p className="font-mono text-sm font-bold text-v79-teal-light">{number}</p>
                <h3 className="mt-6 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inside-v79" aria-labelledby="inside-heading" className="scroll-mt-32 mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">Inside V79</p>
            <h2 id="inside-heading" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl dark:text-white">A connected way to work.</h2>
            <p className="mt-4 leading-8 text-app-text-sec">Our business tools have their own jobs. V79 Hub provides access to enabled applications, while Tiquet helps teams organise requests and follow-up.</p>
          </div>
          <a href="/software" className="inline-flex items-center gap-2 pb-1 font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline">Explore the applications <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </div>
        <div className="mt-10 grid overflow-hidden rounded-3xl border border-app-border lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6 bg-app-aside-bg/60 p-7 sm:p-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-v79-teal-dark dark:text-v79-teal-light"><ClipboardList aria-hidden="true" className="h-5 w-5" /> Example service workflow</div>
            <div className="space-y-2" role="group" aria-label="Explore request tracking steps">
              {TOUR.map(step => (
                <button key={step.id} onClick={() => setTourId(step.id)} aria-pressed={tourId === step.id} type="button"
                  className={"flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v79-teal " +
                    (tourId === step.id ? "border-v79-teal bg-v79-teal/10 text-app-text dark:text-white" : "border-app-border text-app-text-sec hover:border-v79-teal/40")}>
                  <span className="font-mono text-xs text-v79-teal-dark dark:text-v79-teal-light">{step.tab}</span><span className="flex-1">{step.label}</span><ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              ))}
            </div>
            <a href="/software/tiquet" className="inline-flex items-center gap-2 font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline">Learn how Tiquet works <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
          <div aria-live="polite" aria-atomic="true" className="flex flex-col justify-center bg-v79-navy p-7 text-white sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-light">Illustrated workflow · not a product screenshot</p>
            <div className="mt-7 flex items-center gap-3">
              <div className="rounded-xl border border-white/25 bg-white/[0.06] p-4"><MessageSquareText aria-hidden="true" className="h-7 w-7 text-v79-teal-light" /></div>
              <ArrowRight aria-hidden="true" className="h-5 w-5 text-white/50" />
              <div className="rounded-xl border border-v79-teal-light/40 bg-v79-teal/20 px-5 py-4 text-sm font-semibold">{activeTour.step}</div>
            </div>
            <h3 className="mt-9 font-display text-2xl font-bold">{activeTour.title}</h3>
            <p className="mt-3 max-w-md leading-8 text-white/80">{activeTour.detail}</p>
            <div className="mt-8 flex items-center gap-2 text-sm text-white/70"><CheckCircle2 aria-hidden="true" className="h-4 w-4 text-v79-teal-light" /> Every request deserves a next step</div>
          </div>
        </div>
      </section>

      <section aria-labelledby="resources-heading" className="border-y border-app-border bg-app-aside-bg/50 px-6 py-16 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">Learn something useful</p>
            <h2 id="resources-heading" className="mt-3 font-display text-2xl font-extrabold text-app-text sm:text-3xl dark:text-white">Practical guides you can actually use.</h2>
            <p className="mt-3 leading-7 text-app-text-sec">Explore our interactive resources on AI, security and business technology. Learning should be useful before you ever become a customer.</p>
          </div>
          <a href="/resources" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-bg px-6 py-3 font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:border-v79-teal/40">
            <BookOpen aria-hidden="true" className="h-5 w-5" /> Browse resources <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">Good questions</p>
        <h2 id="faq-heading" className="mt-3 font-display text-3xl font-extrabold text-app-text sm:text-4xl dark:text-white">A few things worth knowing.</h2>
        <div className="mt-8 divide-y divide-app-border border-y border-app-border">
          {QUESTIONS.map((item, i) => (
            <div key={item.question} className="py-2">
              <h3>
                <button type="button" aria-expanded={openQuestion === i} aria-controls={"home-faq-" + i}
                  onClick={() => setOpenQuestion(openQuestion === i ? null : i)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left font-semibold text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v79-teal dark:text-white">
                  {item.question} <ChevronRight aria-hidden="true" className={"h-5 w-5 shrink-0 text-v79-teal-dark dark:text-v79-teal-light transition-transform " + (openQuestion === i ? "rotate-90" : "")} />
                </button>
              </h3>
              <div id={"home-faq-" + i} hidden={openQuestion !== i} className="pb-5 pr-7 text-sm leading-7 text-app-text-sec">{item.answer}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="free-assessment" aria-labelledby="final-cta-heading" className="scroll-mt-32 px-6 pb-20 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl bg-v79-navy p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-light">Your next step</p>
            <h2 id="final-cta-heading" className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Tell us what you want to improve.</h2>
            <p className="mt-4 leading-7 text-white/75">Our initial discovery conversation is free. If a technical assessment or implementation is needed, we explain the scope and costs before work begins.</p>
          </div>
          <a href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-v79-teal-dark px-6 py-3 font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Book a conversation <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
