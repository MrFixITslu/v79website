import { ServiceExperience } from "./ServiceExperience";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, CheckCircle2,
  ClipboardCheck, Headphones, Layers, MessageSquareText, ShieldCheck,
  Workflow, Wrench
} from "lucide-react";
import { PRODUCT_PAGES, SERVICE_PAGES, type ProductPage, type ServicePage } from "../data/siteOfferings";

const PRIMARY = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-v79-teal-dark px-6 py-3 font-semibold text-white no-underline transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v79-teal";
const SECONDARY = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-btn-sec px-6 py-3 font-semibold text-app-text no-underline transition hover:border-v79-teal/50 dark:text-white";

function Steps({ steps }: { steps: { title: string; detail: string }[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.title} className="h-full rounded-2xl border border-app-border bg-app-bg p-6">
          <span className="font-mono text-sm font-bold text-v79-teal-dark dark:text-v79-teal-light">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-6 font-display text-lg font-bold text-app-text dark:text-white">{step.title}</h3>
          <p className="mt-3 text-sm leading-7 text-app-text-sec">{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}

function FAQs({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-app-border border-y border-app-border">
      {faqs.map(faq => (
        <details key={faq.question} className="group py-5">
          <summary className="cursor-pointer text-base font-semibold text-app-text marker:text-v79-teal-dark dark:text-v79-teal-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v79-teal dark:text-white">{faq.question}</summary>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-app-text-sec">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function ServiceDetailPage({ page }: { page: ServicePage }) {
  const otherServices = SERVICE_PAGES.filter(service => service.slug !== page.slug).slice(0, 3);
  return (
    <article className="pt-28">
      <header className="border-b border-app-border bg-app-aside-bg/40 px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <a href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> All services</a>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">{page.eyebrow}</p>
            <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-app-text sm:text-5xl dark:text-white">{page.title}</h1>
            <p className="max-w-2xl text-xl font-medium leading-8 text-app-text-sec">{page.summary}</p>
            <p className="max-w-2xl leading-8 text-app-text-sec">{page.introduction}</p>
            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <a href={"/contact?topic=" + encodeURIComponent(page.slug)} className={PRIMARY}>Talk to us about this <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
              <a href="/services" className={SECONDARY}>Explore other services</a>
            </div>
          </div>
          <aside className="rounded-3xl border border-v79-teal/20 bg-v79-navy p-7 text-white sm:p-9">
            <div className="flex items-center gap-3 text-v79-teal-light"><Headphones aria-hidden="true" className="h-6 w-6" /><span className="text-sm font-semibold">The V79 approach</span></div>
            <h2 className="mt-6 font-display text-2xl font-bold">Clear scope. Clear next steps.</h2>
            <p className="mt-4 leading-8 text-white/80">We start with a conversation and recommend only what fits your needs. Coverage, deliverables, costs and response arrangements are confirmed before implementation.</p>
          </aside>
        </div>
      </header>

      <ServiceExperience key={page.slug} slug={page.slug} />

      <section aria-labelledby="included-heading" className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_0.72fr] lg:px-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">Typical scope options</p>
          <h2 id="included-heading" className="mt-3 font-display text-3xl font-extrabold text-app-text dark:text-white">What we can help with</h2>
          <p className="mt-3 text-sm leading-7 text-app-text-sec">The services below are discussed and agreed individually; they are not automatically included in every plan.</p>
          <ul className="mt-8 space-y-4">
            {page.includes.map(item => <li key={item} className="flex gap-3 text-base leading-7 text-app-text-sec"><CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-v79-teal-dark dark:text-v79-teal-light" /> {item}</li>)}
          </ul>
        </div>
        <aside className="self-start rounded-3xl border border-app-border bg-app-aside-bg/50 p-7">
          <h2 className="font-display text-xl font-bold text-app-text dark:text-white">Who this is for</h2>
          <ul className="mt-5 space-y-4">
            {page.audiences.map(audience => <li key={audience} className="flex items-start gap-3 text-sm leading-7 text-app-text-sec"><ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-v79-teal-dark dark:text-v79-teal-light" /> {audience}</li>)}
          </ul>
        </aside>
      </section>

      <section aria-labelledby="delivery-heading" className="bg-v79-navy px-6 py-20 text-white lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-light">How we work</p>
          <h2 id="delivery-heading" className="mt-3 font-display text-3xl font-extrabold">From conversation to a practical plan</h2>
          <div className="mt-10 [&_li]:border-white/15 [&_li]:bg-white/[0.05] [&_h3]:text-white [&_p]:text-white/75 [&_span]:text-v79-teal-light">
            <Steps steps={page.steps} />
          </div>
        </div>
      </section>

      <section aria-labelledby="questions-heading" className="mx-auto max-w-5xl px-6 py-20 lg:px-12">
        <h2 id="questions-heading" className="font-display text-3xl font-extrabold text-app-text dark:text-white">Questions worth asking</h2>
        <div className="mt-8"><FAQs faqs={page.faqs} /></div>
        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-app-border bg-app-aside-bg/50 p-6">
          <BookOpen aria-hidden="true" className="h-6 w-6 shrink-0 text-v79-teal-dark dark:text-v79-teal-light" />
          <p className="text-sm leading-7 text-app-text-sec">Want to learn more first? Our <a href="/resources" className="font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline">practical technology guides</a> are free to read.</p>
        </div>
      </section>

      <section aria-labelledby="related-heading" className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <h2 id="related-heading" className="font-display text-2xl font-bold text-app-text dark:text-white">You may also be interested in</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {otherServices.map(service => <a key={service.slug} href={service.path} className="group rounded-2xl border border-app-border bg-app-bg p-6 no-underline hover:border-v79-teal/50">
            <h3 className="font-display font-bold text-app-text group-hover:text-v79-teal-dark dark:text-v79-teal-light dark:text-white">{service.title}</h3>
            <p className="mt-2 text-sm leading-6 text-app-text-sec">{service.summary}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-v79-teal-dark dark:text-v79-teal-light">Read more <ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
          </a>)}
        </div>
      </section>

      <section className="border-t border-app-border bg-app-aside-bg/50 px-6 py-16 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-display text-2xl font-bold text-app-text dark:text-white">Talk through the next step.</h2><p className="mt-2 text-app-text-sec">Our initial discovery conversation is free. We will explain any proposed assessment or implementation scope.</p></div>
          <a href={"/contact?topic=" + encodeURIComponent(page.slug)} className={PRIMARY}>Book a conversation <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </div>
      </section>
    </article>
  );
}

export function ProductDetailPage({ page }: { page: ProductPage }) {
  const isHub = page.slug === "hub";
  return (
    <article className="pt-28">
      <header className="border-b border-app-border bg-app-aside-bg/30 px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <a href="/software" className="inline-flex items-center gap-2 text-sm font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> All V79 software</a>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">Inside the V79 ecosystem</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-app-text sm:text-5xl dark:text-white">{page.title}</h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-app-text-sec">{page.summary}</p>
            <p className="mt-5 max-w-2xl leading-8 text-app-text-sec">{page.problem}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={"/contact?topic=" + encodeURIComponent(page.slug)} className={PRIMARY}>Ask about access or a demo <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
              {isHub && <a href="https://hub.v79sl.com" className={SECONDARY}>Existing customer sign-in <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>}
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-v79-navy p-7 text-white sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-light">Workflow illustration · not a screenshot</p>
            <div className="mt-8 grid gap-3">
              {page.steps.slice(0, 3).map((step, i) => (
                <div key={step.title} className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/[0.05] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-v79-teal/20 font-mono text-sm font-bold text-v79-teal-light">{i + 1}</span>
                  <span className="text-sm font-semibold">{step.title}</span>
                  {i === 2 && <CheckCircle2 aria-hidden="true" className="ml-auto h-5 w-5 text-v79-teal-light" />}
                </div>
              ))}
            </div>
            <p className="mt-7 text-sm leading-7 text-white/70">This diagram explains a typical workflow. A live demonstration should use approved, genuine application screens.</p>
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">What it is designed to do</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-app-text dark:text-white">A clearer way to manage work.</h2>
          <ul className="mt-8 space-y-4">
            {page.capabilities.map(item => <li key={item} className="flex gap-3 text-sm leading-7 text-app-text-sec"><CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-v79-teal-dark dark:text-v79-teal-light" /> {item}</li>)}
          </ul>
        </div>
        <aside className="rounded-3xl border border-app-border bg-app-aside-bg/50 p-7">
          <h2 className="font-display text-xl font-bold text-app-text dark:text-white">Who might use it</h2>
          <ul className="mt-5 space-y-4">
            {page.audiences.map(item => <li key={item} className="flex gap-3 text-sm leading-7 text-app-text-sec"><ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-v79-teal-dark dark:text-v79-teal-light" /> {item}</li>)}
          </ul>
          <p className="mt-6 border-t border-app-border pt-5 text-xs leading-6 text-app-text-muted">Actual product features, access and subscriptions depend on the application and your organisation's enabled services.</p>
        </aside>
      </section>
      <section className="bg-v79-navy px-6 py-20 text-white lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-extrabold">How {page.title} works</h2>
          <div className="mt-10 [&_li]:border-white/15 [&_li]:bg-white/[0.05] [&_h3]:text-white [&_p]:text-white/75 [&_span]:text-v79-teal-light"><Steps steps={page.steps} /></div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-12">
        <h2 className="font-display text-3xl font-extrabold text-app-text dark:text-white">Questions about {page.title}</h2>
        <div className="mt-8"><FAQs faqs={page.faqs} /></div>
      </section>
      <section className="border-t border-app-border bg-app-aside-bg/40 px-6 py-16 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-display text-2xl font-bold text-app-text dark:text-white">See if {page.title} fits your business.</h2><p className="mt-2 text-app-text-sec">Ask about the current demonstration and onboarding options.</p></div>
          <a href={"/contact?topic=" + encodeURIComponent(page.slug)} className={PRIMARY}>Talk to us <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </div>
      </section>
    </article>
  );
}

export function SoftwareOverviewPage() {
  return (
    <div className="pt-28">
      <header className="border-b border-app-border bg-app-aside-bg/40 px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-v79-teal-dark dark:text-v79-teal-light">V79 business applications</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-app-text sm:text-5xl dark:text-white">Software that helps you stay on top of business.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-app-text-sec">Explore the connected V79 ecosystem. Each application focuses on a real area of work, while Hub provides the entry point for your enabled tools.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/software/hub" className={PRIMARY}>Meet V79 Hub <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
            <a href="/contact?topic=software" className={SECONDARY}>Ask about access</a>
          </div>
        </div>
      </header>
      <section aria-labelledby="featured-products" className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <h2 id="featured-products" className="font-display text-3xl font-extrabold text-app-text dark:text-white">Get to know the products</h2>
        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          {PRODUCT_PAGES.map((product, i) => (
            <article key={product.slug} className="flex flex-col rounded-3xl border border-app-border bg-app-bg p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-v79-teal/10 text-v79-teal-dark dark:text-v79-teal-light">{i ? <ClipboardCheck aria-hidden="true" className="h-6 w-6" /> : <Layers aria-hidden="true" className="h-6 w-6" />}</div>
              <h3 className="mt-6 font-display text-2xl font-bold text-app-text dark:text-white">{product.title}</h3>
              <p className="mt-4 flex-1 leading-8 text-app-text-sec">{product.summary}</p>
              <a href={product.path} className="mt-7 inline-flex items-center gap-2 font-semibold text-v79-teal-dark dark:text-v79-teal-light hover:underline">Explore {product.title} <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-3xl border border-app-border bg-app-aside-bg/50 p-7 sm:p-9">
          <h3 className="font-display text-xl font-bold text-app-text dark:text-white">Other tools in the ecosystem</h3>
          <p className="mt-3 max-w-3xl leading-7 text-app-text-sec">V79 also develops tools for point of sale (POS), finance (FFPRO), marketing and learning (Academy). Access and release readiness vary by application. Contact us to confirm current options rather than assuming every tool is available to every customer.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["POS", "FFPRO", "Marketing", "Academy"].map(name => <span key={name} className="rounded-full border border-app-border bg-app-bg px-4 py-2 text-sm font-semibold text-app-text-sec">{name}</span>)}
          </div>
        </div>
      </section>
      <section className="bg-v79-navy px-6 py-16 text-white lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-display text-2xl font-bold">Find the right next step.</h2><p className="mt-2 text-white/75">We can help you understand which product or service best fits your workflow.</p></div>
          <a href="/contact?topic=software" className={PRIMARY}>Ask about V79 software <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </div>
      </section>
    </div>
  );
}
