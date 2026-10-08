import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { V79OfficialLogo } from "./V79OfficialLogo";

type SubscribeResponse = {
  success?: boolean;
  alreadySubscribed?: boolean;
  downloadUrl?: string;
  error?: string;
};

export default function AIPromptGuideLandingPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!consent) {
      setMessage("Please confirm that you want to join the free V79 Digital newsletter.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          email,
          consent,
          website,
          source: "Free AI Prompting Guide",
          pageOrigin: "/free-ai-prompting-guide",
        }),
      });

      const data = (await response.json().catch(() => ({}))) as SubscribeResponse;
      if (!response.ok) {
        throw new Error(data.error || "We could not complete your signup. Please try again.");
      }

      setDownloadUrl(data.downloadUrl || "/downloads/V79_AI_Prompting_Guide_Premium_FIXED.pdf");
      setMessage(
        data.alreadySubscribed
          ? "You are already on the list. Your guide is ready below."
          : "You are subscribed. Your free guide is ready below."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <header className="border-b border-app-border bg-app-header-bg/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between gap-4">
          <a href="/" aria-label="Return to V79 Digital home" className="inline-flex items-center">
            <V79OfficialLogo size="md" />
          </a>
          <a
            href="/resources"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-app-text-sec hover:text-v79-teal transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Resources
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-app-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(24,185,178,0.13),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.12),transparent_42%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 sm:py-20 lg:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-v79-teal/25 bg-v79-teal/10 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-v79-teal">
                <Sparkles className="w-3.5 h-3.5" />
                Free V79 Digital Resource
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-[1.03] text-app-text dark:text-white">
                  Get Better Results from AI with Better Prompts
                </h1>
                <p className="max-w-2xl text-base sm:text-lg text-app-text-sec leading-relaxed">
                  Download the free V79 AI Prompting Guide: a practical, beginner-friendly guide to writing clearer prompts,
                  getting more useful answers, and making AI output sound more natural.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "The 5-part prompt formula",
                  "10 copy-and-use prompt templates",
                  "Human-sounding writing prompt",
                  "Verification and fact-checking prompts",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 rounded-xl border border-app-border bg-app-aside-bg/50 px-4 py-3 text-sm text-app-text-sec">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-app-text-muted">
                <span className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> Easy to understand</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> No spam</span>
                <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4 text-v79-teal" /> Free newsletter</span>
              </div>
            </div>

            <div className="glass rounded-3xl border border-app-border p-6 sm:p-8 shadow-2xl">
              <div className="space-y-2 mb-6">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] font-bold text-v79-teal">Free Download</div>
                <h2 className="text-2xl font-extrabold font-display text-app-text dark:text-white">
                  Join the newsletter and get the guide
                </h2>
                <p className="text-sm text-app-text-sec leading-relaxed">
                  Enter your details below. You will get immediate access to the PDF after signup.
                </p>
              </div>

              {downloadUrl ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-app-text dark:text-white">Your guide is ready</h3>
                      <p className="text-sm text-app-text-sec mt-1">{message}</p>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-v79-teal hover:brightness-110 text-v79-navy-dark px-5 py-3 font-extrabold text-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    Download the PDF Guide
                  </a>
                  <p className="text-[11px] text-app-text-muted text-center">
                    Keep this page open until your download starts.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="guide-first-name" className="block text-xs font-semibold text-app-text mb-1.5">
                      First name
                    </label>
                    <input
                      id="guide-first-name"
                      name="firstName"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      maxLength={80}
                      autoComplete="given-name"
                      className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-sm text-app-text outline-none focus:border-v79-teal focus:ring-2 focus:ring-v79-teal/20"
                      placeholder="Your first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="guide-email" className="block text-xs font-semibold text-app-text mb-1.5">
                      Email address
                    </label>
                    <input
                      id="guide-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      maxLength={250}
                      autoComplete="email"
                      className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-sm text-app-text outline-none focus:border-v79-teal focus:ring-2 focus:ring-v79-teal/20"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="guide-website">Website</label>
                    <input
                      id="guide-website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                    />
                  </div>

                  <label className="flex items-start gap-3 text-xs text-app-text-sec cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-v79-teal"
                    />
                    <span>
                      I want the free guide and occasional V79 Digital emails with practical AI, ICT and business technology tips.
                      I can unsubscribe at any time.
                    </span>
                  </label>

                  {message && (
                    <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-app-text-sec">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-v79-teal hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-v79-navy-dark px-5 py-3.5 font-extrabold text-sm transition"
                  >
                    <Mail className="w-4 h-4" />
                    {submitting ? "Joining..." : "Join Free & Get the Guide"}
                  </button>

                  <p className="text-[11px] text-app-text-muted text-center leading-relaxed">
                    Your email is used for the V79 Digital newsletter and delivery of this free resource. Read our{" "}
                    <a href="/privacy" className="text-v79-teal hover:underline">Privacy Policy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-14 sm:py-16">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              ["Prompt with context", "Give AI enough background to understand the job instead of forcing it to guess."],
              ["Control the output", "Tell AI the format, tone, length and constraints you actually need."],
              ["Improve the first answer", "Use follow-up prompts to challenge, simplify and refine the result."],
            ].map(([title, copy], index) => (
              <div key={title} className="rounded-2xl border border-app-border bg-app-aside-bg/40 p-5">
                <div className="text-xs font-mono font-bold text-indigo-400">0{index + 1}</div>
                <h3 className="mt-3 font-bold font-display text-app-text dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-app-text-sec leading-relaxed">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
