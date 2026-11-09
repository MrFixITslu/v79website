import { ServiceSelector } from "./ServiceExperience";
import { motion } from "motion/react";
import { BarChart3, ArrowRight, Phone, ShieldCheck, Lightbulb, Map } from "lucide-react";
import { Button } from "./ui/Button";

const ASSESSMENT_SCOPE = [
  { num: "1", title: "Infrastructure Review", items: ["Computer Health", "Router Diagnostics", "ISP Speed Verification", "WiFi Signal Mapping"], badgeClasses: "bg-indigo-500/10 text-indigo-400" },
  { num: "2", title: "Security Audit", items: ["Password Practices", "Multi-Factor Status", "Endpoint Security", "Active User Access"], badgeClasses: "bg-rose-500/10 text-rose-400" },
  { num: "3", title: "Data Protection", items: ["Backup Integrity", "Cloud Storage Setup", "M365 Email Audits", "Recovery Testing"], badgeClasses: "bg-sky-500/10 text-sky-400" },
];

const ASSESSMENT_DELIVERABLES = [
  { icon: BarChart3, label: "Current ICT Security Score" },
  { icon: ShieldCheck, label: "Identified Risks & Vulnerabilities" },
  { icon: Lightbulb, label: "Recommended Practical Solutions" },
  { icon: Map, label: "90-Day Priority Action Roadmap" },
];


export default function ServicesPage({
  onNavigate,
}: {
  onNavigate: (v: string) => void;
  // Lifted up to App.tsx so the nav's Services dropdown can open a specific
  // card directly (e.g. clicking "Cloud Solutions" arrives with that card
  // already expanded, not just scrolled to its collapsed header).
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="pt-10 px-6 lg:px-8 text-center space-y-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[350px] h-[350px] bg-indigo-500/6 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 space-y-4">
          <span className="text-[10px] font-mono uppercase font-extrabold tracking-[0.25em] text-indigo-400">What We Offer</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-app-text dark:text-white">
            Services
          </h1>
          <p className="max-w-xl mx-auto text-sm text-app-text-sec font-light leading-relaxed">
            Practical ICT support, cybersecurity, cloud, networks, software and AI services for Caribbean businesses.
          </p>
        </motion.div>
      </section>

      <section aria-label="Choose a service" className="px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <ServiceSelector />
      </section>

      {/* ── ICT Business Health Assessment ───────────────────────────
           The discovery conversation is free. Formal assessment scope and
           pricing are quoted after the environment is understood. */}
      <section id="assessment" className="px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.04] to-transparent p-6 sm:p-10 space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-extrabold tracking-[0.25em] text-indigo-400">Business Assessment</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-app-text dark:text-white tracking-tight max-w-xl">
                Know Your Technology Risks Before They Become Costly Business Blockades
              </h2>
              <p className="text-sm text-app-text-sec font-light max-w-xl leading-relaxed">
                A thorough diagnostic sweep uncovering hidden system bugs, network limits, server performance issues, and password vulnerabilities.
              </p>
            </div>
            <div className="shrink-0 bg-indigo-600 border border-indigo-400 rounded-xl px-5 py-3 text-white text-center">
              <span className="text-[10px] font-mono block text-indigo-200">ICT Business Health Assessment</span>
              <span className="text-xl font-black font-display tracking-tighter block">Custom Scope</span>
              <span className="text-[9px] font-mono block text-indigo-200">Quoted after discovery</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ASSESSMENT_SCOPE.map((s) => (
              <div key={s.title} className="p-4 rounded-xl border border-app-border bg-app-aside-bg/25 space-y-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${s.badgeClasses}`}>{s.num}</div>
                <p className="text-xs font-bold text-app-text dark:text-white">{s.title}</p>
                <ul className="text-[10px] text-app-text-muted space-y-1 leading-normal font-mono">
                  {s.items.map((it) => <li key={it}>• {it}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.02] space-y-3">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block tracking-wider">The Deliverable: Business Intelligence Report</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ASSESSMENT_DELIVERABLES.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="flex items-center gap-2 text-xs font-mono text-app-text-sec">
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-app-border/40">
            <Button onClick={() => onNavigate("contact")} variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Book a Free ICT Consultation
            </Button>
            <a href="tel:+17587260035" className="flex items-center gap-2 text-sm font-semibold text-app-text-sec hover:text-indigo-400 transition">
              <Phone className="w-4 h-4" /> Or call +1 758 726 0035
            </a>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl border border-indigo-500/20 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold font-display text-app-text dark:text-white">Not sure which service you need?</h2>
            <p className="text-sm text-app-text-sec font-light">Request a free ICT assessment. We'll audit your current setup and recommend exactly what fits your budget.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button onClick={() => onNavigate("contact")} variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Request Affordable ICT Support
            </Button>
            <Button href="tel:+17587260035" variant="secondary" iconBefore={<Phone className="w-4 h-4" />}>
              Call Us
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
