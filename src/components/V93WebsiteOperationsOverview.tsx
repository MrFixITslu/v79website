import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";

type WebsiteMetrics = { enquiries: number; prospects: number; articles: number; subscribers: number; };
const routes = [
  { label: "V79 Hub", description: "Central business dashboard", href: "https://hub.v79sl.com" },
  { label: "Tiquet", description: "Approved client jobs", href: "https://tiquet.v79sl.com" },
  { label: "Marketing", description: "Campaigns and scheduling", href: "https://marketing.v79sl.com" },
];
async function fetchArray(endpoint: string, signal: AbortSignal): Promise<unknown[]> {
  const response = await fetch(endpoint, { credentials: "same-origin", cache: "no-store", signal });
  if (!response.ok) throw new Error(`Could not load ${endpoint} (HTTP ${response.status})`);
  const body: unknown = await response.json();
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object" && "leads" in body && Array.isArray((body as {leads?:unknown}).leads))
    return (body as {leads:unknown[]}).leads;
  throw new Error(`Unexpected response format from ${endpoint}`);
}
export function V93WebsiteOperationsOverview() {
  const [metrics, setMetrics] = useState<WebsiteMetrics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const [enquiries, prospects, articles, subscribers] = await Promise.all([
        fetchArray("/api/admin/leads",signal),
        fetchArray("/api/admin/crm/leads",signal),
        fetchArray("/api/articles",signal),
        fetchArray("/api/admin/newsletter/subscribers",signal),
      ]);
      if (!signal.aborted) setMetrics({
        enquiries: enquiries.length, prospects: prospects.length,
        articles: articles.length, subscribers: subscribers.length,
      });
    } catch (reason) {
      if (!signal.aborted) {
        setMetrics(null);
        setError(reason instanceof Error ? reason.message : "Unable to load website metrics");
      }
    } finally { if (!signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => {
    const controller=new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const refresh=()=>{ const controller=new AbortController(); void load(controller.signal); };
  return (
    <section aria-labelledby="v93-operations-heading" className="mb-8 rounded-3xl border border-app-border bg-white/90 p-5 shadow-sm dark:bg-v79-navy-light/70 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-v79-teal-dark dark:text-v79-teal-light">Website operations</p>
          <h2 id="v93-operations-heading" className="mt-2 font-display text-2xl font-bold tracking-tight text-app-text dark:text-white">Publish, capture, follow through.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-app-text-sec">Website publishing and enquiries live here. V79 Hub is the central business dashboard; Tiquet receives work only after approved CRM conversion.</p>
        </div>
        <button type="button" disabled={loading} onClick={refresh} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-app-border bg-app-btn-sec px-4 text-sm font-semibold text-app-text disabled:opacity-60" aria-label="Refresh real website metrics">
          <RefreshCw aria-hidden="true" className="h-4 w-4"/> Refresh
        </button>
      </div>
      {error && <p role="alert" className="mt-5 flex items-center gap-2 text-sm text-red-700 dark:text-red-300"><AlertCircle className="h-4 w-4"/>{error} — values withheld until verified.</p>}
      {!error && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
          {([
            ["Website enquiries",metrics?.enquiries],
            ["CRM prospects",metrics?.prospects],
            ["Published resources",metrics?.articles],
            ["Newsletter subscribers",metrics?.subscribers]
          ] as const).map(([label,value]) => (
            <div key={label} className="rounded-2xl border border-app-border bg-app-bg p-5">
              <p className="text-xs font-medium text-app-text-sec">{label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-app-text" aria-label={`${label}: ${value ?? 'not loaded'}`}>{value ?? "—"}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {routes.map(route=><a key={route.href} href={route.href} target="_blank" rel="noopener noreferrer" className="group flex justify-between gap-3 rounded-2xl border border-app-border bg-app-bg p-4 no-underline transition hover:-translate-y-0.5 hover:border-v79-teal/50 hover:shadow-md motion-reduce:transform-none">
          <span><strong className="block text-sm text-app-text">{route.label}</strong><span className="mt-1 block text-xs text-app-text-sec">{route.description}</span></span>
          <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-v79-teal"/>
        </a>)}
      </div>
      <p className="mt-5 inline-flex items-center gap-2 text-xs text-app-text-muted"><ShieldCheck className="h-4 w-4"/>Real API counts only. No demonstration data or fabricated operational status.</p>
    </section>
  );
}
