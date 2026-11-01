import { useState } from "react";
import { Search, MapPin, Sparkles, CheckCircle2, XCircle, ShieldCheck, Globe, Phone, Mail, History, ExternalLink, RefreshCw } from "lucide-react";
import { Prospect, ProspectSearchLog, SAINT_LUCIA_LOCATIONS } from "../../crm/types";
import { safeExternalLink, safeSocialLink, safeEmail } from "../../crm/linkSafety";

interface CrmProspectFinderProps {
  prospects: Prospect[];
  searchHistory: ProspectSearchLog[];
  sourceCapabilities: { directory: boolean; exports: boolean; osm: boolean; geoapify: boolean };
  onImportDirectory: (file: File) => Promise<{ count: number; skipped: number; total: number; staged: number; reviewTotal: number }>;
  onRunSearch: (params: { location?: string; category?: string; query?: string; source?: "directory" | "public" | "exports" | "geoapify"; limit?: number }) => Promise<void>;
  onAnalyzeProspect: (prospectId: string) => Promise<void>;
  onEnrichProspect: (prospectId: string) => Promise<boolean>;
  onApproveProspect: (prospectId: string) => Promise<void>;
  onBulkApprove: (ids: string[]) => Promise<void>;
  onRejectProspect: (prospectId: string) => Promise<void>;
  onBulkReject: (ids: string[]) => Promise<void>;
  isSearching: boolean;
  searchError?: string | null;
}

const CATEGORIES = [
  "Restaurant & Hospitality",
  "Maritime & Tourism",
  "Healthcare & Wellness",
  "Automotive & Retail",
  "Hospitality & Tourism",
  "Agriculture & Logistics",
  "Manufacturing & Retail",
  "Artisan & Culture",
  "Real Estate & Property",
  "Professional Services",
  "Retail & Wholesale",
  "Technology & Education"
];

export function CrmProspectFinder({
  prospects,
  searchHistory,
  sourceCapabilities,
  onImportDirectory,
  onRunSearch,
  onAnalyzeProspect,
  onEnrichProspect,
  onApproveProspect,
  onBulkApprove,
  onRejectProspect,
  onBulkReject,
  isSearching,
  searchError
}: CrmProspectFinderProps) {
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "history">("catalog");
  const [source, setSource] = useState<"directory" | "public" | "exports" | "geoapify">("directory");
  const [location, setLocation] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRunSearch({
      source,
      location: location === "all" ? undefined : location,
      category: category === "all" ? undefined : category,
      query: query.trim() || undefined,
      limit
    });
  };

  const handleFileImport = async (file?: File) => {
    if (!file) return;
    setImporting(true);
    setImportMessage(null);
    try {
      const result = await onImportDirectory(file);
      setImportMessage(`Imported ${result.count} businesses; skipped ${result.skipped} duplicates. ${result.staged} added to Prospect Finder for review (${result.reviewTotal} total). Leads are only created after approval.`);
      setVisibleCount(20);
      setActiveSubTab("catalog");
      setSource("directory");
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Directory import failed.");
    } finally {
      setImporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const visible = prospects.slice(0, visibleCount).map(p => p.id);
    if (visible.every(id => selectedIds.includes(id))) {
      setSelectedIds(ids => ids.filter(id => !visible.includes(id)));
    } else {
      setSelectedIds(ids => Array.from(new Set([...ids, ...visible])));
    }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      await onAnalyzeProspect(id);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleEnrich = async (id: string) => {
    setEnrichingId(id);
    try {
      await onEnrichProspect(id);
    } finally {
      setEnrichingId(null);
    }
  };

  const handleApproveSingle = async (id: string) => {
    setActionLoading(id);
    try {
      await onApproveProspect(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSingle = async (id: string) => {
    setActionLoading(id);
    try {
      await onRejectProspect(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApproveClick = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading("bulk");
    try {
      await onBulkApprove(selectedIds);
      setSelectedIds([]);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRejectClick = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading("bulk");
    try {
      await onBulkReject(selectedIds);
      setSelectedIds([]);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-once">
      {/* Search Header and Compliance Notice */}
      <div className="glass p-6 rounded-3xl border border-app-border bg-app-aside-bg/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-bold text-app-text font-display">
                AI Business Prospect Finder
              </h2>
            </div>
            <p className="text-xs text-app-text-sec mt-0.5">
              Find businesses from public listings or your imported directory, then analyse them using local Ollama. Public contact details may be incomplete.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("catalog")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeSubTab === "catalog" ? "bg-app-text text-app-bg" : "bg-app-btn-sec text-app-text"
              }`}
            >
              Discovered Prospects ({prospects.length})
            </button>
            <button
              onClick={() => setActiveSubTab("history")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "history" ? "bg-app-text text-app-bg" : "bg-app-btn-sec text-app-text"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Search History ({searchHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Discovery Query Form */}
        {activeSubTab === "catalog" && (
          <form onSubmit={handleSearchSubmit} className="space-y-3 pt-2 border-t border-app-border/40">
            <label className="block text-xs text-app-text-sec">Discovery source
              <select value={source} onChange={(e) => setSource(e.target.value as "directory" | "public" | "exports" | "geoapify")} className="block mt-1 w-full sm:w-80 bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs">
                {sourceCapabilities.geoapify && <option value="geoapify">Geoapify Places — Saint Lucia businesses</option>}
                {sourceCapabilities.exports && <option value="exports">Export Saint Lucia business directory</option>}
                <option value="directory">My imported business directory</option>
              </select>
            </label>
            <div className="rounded-xl border border-app-border p-3 bg-app-aside-bg/50 space-y-2">
              <label htmlFor="crm-directory-import" className="block font-semibold text-xs text-app-text">
                Add businesses you are authorised to use
              </label>
              <p className="text-xs text-app-text-sec">Import CSV or JSON with a businessName column. Optional: category, location, email, phone, website and social links. New records are merged, never replace existing entries.</p>
              <input id="crm-directory-import" type="file" accept=".csv,.json,text/csv,application/json"
                disabled={importing} className="text-xs max-w-full text-app-text-sec"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  await handleFileImport(file);
                }} />
              {importing && <p role="status" className="text-xs text-app-text-sec">Importing directory…</p>}
              {importMessage && <p role="status" className="text-xs text-app-text-sec">{importMessage}</p>}
            </div>
            {!sourceCapabilities.exports && !sourceCapabilities.geoapify && (
              <p className="text-xs text-app-text-sec" role="status">
                Public directory discovery is not enabled. You can search your imported business directory and use local AI to assess prospects.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">
                  Saint Lucia District / Community
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  <option value="all">All Locations</option>
                  {SAINT_LUCIA_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">
                  Industry / Business Sector
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  <option value="all">All Industries</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">
                  Keyword / Specific Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. resort, clinic, auto..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="w-20">
                  <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">
                    Limit
                  </label>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Search className={`w-4 h-4 ${isSearching ? "animate-spin" : ""}`} />
                  <span>{isSearching ? "Searching..." : "Find businesses"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
        {searchError && <p role="alert" className="text-xs text-red-500">{searchError}</p>}

        {/* Compliance & Policy Footer */}
        <div className="pt-2 flex items-center gap-2 text-[11px] text-app-text-sec">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Public business directories only. Details may be incomplete; review the source before outreach. No login-based social scraping or automated outreach.
          </span>
        </div>
        <p className="text-[11px] text-app-text-muted">
          Public listing data: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">© OpenStreetMap contributors (ODbL)</a>.
          Verify each contact before outreach.
        </p>
      </div>

      {/* SUB-TAB 1: PROSPECT CATALOG */}
      {activeSubTab === "catalog" && (
        <div className="space-y-4">
          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="glass p-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 flex items-center justify-between text-xs animate-fade-in-once">
              <span className="font-semibold text-sky-500">
                {selectedIds.length} {selectedIds.length === 1 ? "prospect" : "prospects"} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkApproveClick}
                  disabled={actionLoading === "bulk"}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve to CRM Leads</span>
                </button>
                <button
                  onClick={handleBulkRejectClick}
                  disabled={actionLoading === "bulk"}
                  className="px-3 py-1.5 rounded-xl bg-app-btn-sec hover:bg-red-500/10 hover:text-red-500 text-app-text font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}

          {(sourceCapabilities.geoapify || prospects.some(p => p.sourceProvider === "geoapify")) && (
            <p className="text-xs text-app-text-sec">
              Place data from <a className="underline" href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a> and{" "}
              <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors (ODbL)</a>.
              Listings are unverified leads for human review, not confirmed customer problems.
            </p>
          )}
          {/* Prospects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prospects.length === 0 ? (
              <div className="col-span-2 glass p-12 text-center text-xs text-app-text-muted rounded-2xl border border-app-border">
                No prospects yet. Choose a discovery source and search above.
              </div>
            ) : (
              prospects.slice(0, visibleCount).map((p) => {
                const websiteHref = safeExternalLink(p.website);
                const facebookHref = safeSocialLink(p.facebookUrl, "facebook");
                const instagramHref = safeSocialLink(p.instagramUrl, "instagram");
                const linkedinHref = safeSocialLink(p.linkedinUrl, "linkedin");
                const sourceHref = safeExternalLink(p.sourceUrl);
                const email = safeEmail(p.email);
                const isSelected = selectedIds.includes(p.id);
                const isApproved = p.workflowStatus === "approved";
                const isRejected = p.workflowStatus === "rejected";

                return (
                  <div
                    key={p.id}
                    className={`glass p-5 rounded-2xl border transition space-y-4 ${
                      isApproved
                        ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                        : isRejected
                        ? "border-app-border/40 opacity-50 bg-app-aside-bg/10"
                        : isSelected
                        ? "border-sky-500/50 bg-sky-500/5"
                        : "border-app-border bg-app-aside-bg/30 hover:border-app-border/80"
                    }`}
                  >
                    {/* Top Row: Checkbox, Name, Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p.id)}
                          disabled={isApproved || isRejected}
                          className="w-4 h-4 rounded text-sky-500 mt-1 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-app-text font-display">{p.businessName}</h3>
                            {isApproved && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-white">
                                Approved
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/20 text-red-500">
                                Rejected
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-app-text-sec flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-sky-500" />
                            <span>{p.location}</span>
                            <span>•</span>
                            <span>{p.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 text-xs font-mono font-bold rounded-md block ${
                            p.scoreCategory === "Hot"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                              : "bg-sky-500/10 text-sky-500 border border-sky-500/30"
                          }`}
                        >
                          {p.leadScore} pts
                        </span>
                        <span className="text-[9px] text-app-text-muted font-mono uppercase">
                          {p.scoreCategory}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-app-text-sec line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Contact points discovered */}
                    <div className="flex items-center flex-wrap gap-2 text-[11px]">
                      {p.phone ? (
                        <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-app-text font-mono hover:text-sky-500">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{p.phone}</span>
                        </a>
                      ) : <span className="text-app-text-muted">Phone not listed</span>}
                      {email ? (
                        <a href={`mailto:${email}`} className="flex items-center gap-1 text-app-text hover:text-sky-500">
                          <Mail className="w-3 h-3 text-emerald-500" />
                          <span>{email}</span>
                        </a>
                      ) : <span className="text-app-text-muted">Email not listed</span>}
                      {websiteHref ? (
                        <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-500 hover:underline truncate max-w-[150px]">
                          <Globe className="w-3 h-3" />
                          <span>Website</span>
                        </a>
                      ) : (
                        <span className="text-amber-500 font-mono text-[10px]">No website listed</span>
                      )}
                      {facebookHref && (
                        <a href={facebookHref} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">Facebook</a>
                      )}
                      {instagramHref && (
                        <a href={instagramHref} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">Instagram</a>
                      )}
                      {linkedinHref && (
                        <a href={linkedinHref} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">LinkedIn</a>
                      )}
                      {sourceHref && (
                        <a href={sourceHref} target="_blank" rel="noopener noreferrer" className="text-app-text-sec hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Source
                        </a>
                      )}
                    </div>

                    {/* AI Opportunities detected */}
                    {p.aiAnalysis?.problems && p.aiAnalysis.problems.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-app-bg/80 border border-app-border text-[11px] space-y-1">
                        <span className="font-bold text-app-text flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Opportunity Detected:</span>
                        </span>
                        <p className="text-app-text-sec line-clamp-1">{p.aiAnalysis.problems[0]}</p>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="pt-2 border-t border-app-border/40 flex items-center justify-between">
                      <button
                        onClick={() => handleAnalyze(p.id)}
                        disabled={analyzingId === p.id}
                        className="text-xs text-sky-500 hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${analyzingId === p.id ? "animate-spin" : ""}`} />
                        <span>{analyzingId === p.id ? "Analyzing..." : "Re-Score with AI"}</span>
                      </button>

                      {!isApproved && !isRejected && p.sourceUrl?.startsWith("https://exportsaintlucia.org/directories/") && (
                        <button type="button" onClick={() => handleEnrich(p.id)}
                          disabled={enrichingId === p.id}
                          className="text-xs text-sky-500 hover:underline font-semibold disabled:opacity-50">
                          {enrichingId === p.id ? "Checking..." : p.contactCheckedAt ? "Refresh contact" : "Find contact info"}
                        </button>
                      )}
                      {!isApproved && !isRejected && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectSingle(p.id)}
                            disabled={actionLoading === p.id}
                            className="px-2.5 py-1.5 rounded-lg border border-app-border hover:bg-red-500/10 hover:text-red-500 text-app-text-sec text-xs font-semibold transition cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveSingle(p.id)}
                            disabled={actionLoading === p.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve to CRM</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SEARCH HISTORY LOGS */}
      {activeSubTab === "history" && (
        <div className="glass rounded-2xl border border-app-border overflow-hidden bg-app-aside-bg/30">
          <div className="p-4 border-b border-app-border flex items-center justify-between">
            <h3 className="font-bold text-xs font-mono uppercase text-app-text-muted">
              Discovery Audit Log & Search History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-app-text">
              <thead className="bg-app-btn-sec/40 border-b border-app-border text-[11px] font-mono text-app-text-muted uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Search Query</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Found</th>
                  <th className="py-3 px-4">New Prospects</th>
                  <th className="py-3 px-4">Duplicates Filtered</th>
                  <th className="py-3 px-4">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/40 font-mono text-[11px]">
                {searchHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-app-text-muted">
                      No search history recorded yet.
                    </td>
                  </tr>
                ) : (
                  searchHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-app-btn-sec/20">
                      <td className="py-3 px-4 text-app-text-muted">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-app-text">
                        {log.query}
                      </td>
                      <td className="py-3 px-4 text-sky-500">{log.location}</td>
                      <td className="py-3 px-4">{log.category}</td>
                      <td className="py-3 px-4 font-bold">{log.totalFound}</td>
                      <td className="py-3 px-4 text-emerald-500 font-bold">+{log.newProspects}</td>
                      <td className="py-3 px-4 text-amber-500">{log.duplicates}</td>
                      <td className="py-3 px-4 text-app-text-muted">{log.searchProvider}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

