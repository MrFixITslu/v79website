import { useState } from "react";
import { Sparkles, Sliders, CheckCircle2, XCircle, RefreshCw, Download, Database, Shield } from "lucide-react";
import { CRMLead } from "../../crm/types";
import { V79_OFFERINGS } from "../../crm/offerings";

interface CrmSettingsProps {
  ollamaConnected: boolean;
  ollamaModel?: string;
  onTestOllama: () => Promise<void>;
  leadsCount: number;
  leads?: CRMLead[];
}

export function CrmSettings({
  ollamaConnected,
  ollamaModel,
  onTestOllama,
  leadsCount,
  leads = []
}: CrmSettingsProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await onTestOllama();
      setTestResult("Connection checked successfully.");
    } catch (e: any) {
      setTestResult(`Check failed: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleExportJson = () => {
    try {
      const jsonStr = JSON.stringify(leads, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `v79_crm_leads_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      window.open("/api/admin/crm/leads", "_blank");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-once max-w-4xl">
      {/* Header */}
      <div className="bg-app-aside-bg/40 p-5 rounded-2xl border border-app-border space-y-1">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-bold text-app-text font-display">
            CRM Intelligence & System Configuration
          </h2>
        </div>
        <p className="text-xs text-app-text-sec">
          Match leads to real V79 ICT services and Hub SaaS products using their stated needs, not their websites.
        </p>
      </div>

      {/* Ollama Local AI Integration Card */}
      <div className="glass p-6 rounded-3xl border border-app-border bg-app-aside-bg/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-app-text">Local Ollama AI Inference Engine</h3>
              <p className="text-xs text-app-text-sec">
                Powers deterministic lead scoring, sales call preparation cards, and prospect ICT analysis.
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold border ${
              ollamaConnected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            {ollamaConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ollama Online ({ollamaModel || "llama3"})</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Offline — Heuristic Fallback Active</span>
              </>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-app-bg/80 border border-app-border space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-app-text-muted uppercase block mb-1">
                Local Host Endpoint
              </label>
              <input
                type="text"
                disabled
                value="http://localhost:11434"
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-app-text-muted uppercase block mb-1">
                Configured Model
              </label>
              <input
                type="text"
                disabled
                value={ollamaModel || "llama3 (or mistral/phi3)"}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2 font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-app-text-sec">
              Safe Graceful Degradation: If Ollama is offline or processing, the CRM automatically utilizes the V79 Deterministic Scoring Algorithm.
            </span>
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-app-text text-app-bg text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
              <span>Test Ollama Link</span>
            </button>
          </div>

          {testResult && (
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500 text-xs font-mono">
              {testResult}
            </div>
          )}
        </div>
      </div>

      {/* Evidence-led matching and catalogue */}
      <div className="glass p-6 rounded-3xl border border-app-border bg-app-aside-bg/30 space-y-4">
        <h3 className="font-bold text-sm text-app-text">Lead Opportunity Score (0–100)</h3>
        <p className="text-xs text-app-text-sec">
          A higher score means the supplied information supports a stronger match. This does not confirm a sale or a customer problem.
          Website ownership and social links have zero scoring weight.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            ["Service or Hub app requested", "+40", "The enquiry explicitly names one of our offerings."],
            ["Operational need described", "+30", "The prospect describes a matching problem or goal."],
            ["Possible industry fit", "+10", "A sector clue only; staff must confirm the need."],
            ["Contact details supplied", "+20", "Up to 10 each for phone and email; neither is assumed verified."]
          ].map(([name, weight, description]) => (
            <div key={name} className="p-3 rounded-xl border border-app-border bg-app-bg/80 space-y-1">
              <div className="flex justify-between font-semibold text-app-text gap-2">
                <span>{name}</span><span className="font-mono text-emerald-500 shrink-0">{weight} pts</span>
              </div>
              <p className="text-[11px] text-app-text-sec">{description}</p>
            </div>
          ))}
        </div>
        {(["ICT Service", "Hub App"] as const).map((kind) => (
          <div key={kind} className="space-y-2">
            <h4 className="text-xs font-bold text-app-text">{kind === "ICT Service" ? "V79 ICT Services" : "V79 Hub SaaS Products"}</h4>
            <div className="flex flex-wrap gap-1.5">
              {V79_OFFERINGS.filter((item) => item.kind === kind).map((item) => (
                <span key={item.id} className="text-[11px] border border-app-border rounded-lg px-2.5 py-1 text-app-text-sec">{item.label}</span>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-app-text-sec">
          Newly captured leads use these rules. Open any older lead and select “Refresh V79 Match” to update its stored score and recommendations without changing its status or notes.
        </p>
      </div>

      {/* Data Export & Backup */}
      <div className="glass p-6 rounded-3xl border border-app-border bg-app-aside-bg/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-app-text">Data Export & Resilience</h3>
              <p className="text-xs text-app-text-sec">
                {leadsCount} total leads securely persisted in local storage.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-app-btn-sec hover:bg-app-btn-sec/80 text-app-text text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Raw JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
