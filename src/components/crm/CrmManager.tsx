import { useState, useEffect, useCallback } from "react";
import { CrmHeader } from "./CrmHeader";
import { CrmMetricsDashboard } from "./CrmMetricsDashboard";
import { CrmPipelineBoard } from "./CrmPipelineBoard";
import { CrmLeadTable } from "./CrmLeadTable";
import { CrmLeadDetailModal } from "./CrmLeadDetailModal";
import { CrmColdCallCockpit } from "./CrmColdCallCockpit";
import { CrmProspectFinder } from "./CrmProspectFinder";
import { CrmTasksList } from "./CrmTasksList";
import { CrmSettings } from "./CrmSettings";
import { CrmNewLeadModal } from "./CrmNewLeadModal";
import {
  CRMLead,
  CRMMetrics,
  Prospect,
  ProspectSearchLog,
  CRMTask,
  CRMActivity,
  CRMCallRecord,
  PipelineStage,
  CallOutcome
} from "../../crm/types";

interface CrmManagerProps {
  adminToken: string | null;
  onUnauthorized?: () => void;
}

export function CrmManager({ adminToken, onUnauthorized }: CrmManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "pipeline" | "leads" | "cockpit" | "prospects" | "tasks" | "settings"
  >("dashboard");

  // CRM state
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [searchHistory, setSearchHistory] = useState<ProspectSearchLog[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [selectedLeadActivities, setSelectedLeadActivities] = useState<CRMActivity[]>([]);
  const [selectedLeadCalls, setSelectedLeadCalls] = useState<CRMCallRecord[]>([]);

  // Selection & modal states
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);

  // Status & Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<{ connected: boolean; model?: string; url?: string }>({
    connected: false
  });

  const getHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
  }), [adminToken]);

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        ...getHeaders(),
        ...(options.headers || {})
      }
    });
    if (res.status === 401) {
      onUnauthorized?.();
    }
    return res;
  }, [getHeaders, onUnauthorized]);

  // Fetch metrics & pipeline stats
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/crm/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to load CRM metrics.");
    }
  }, [apiFetch]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/crm/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to load CRM leads.");
    }
  }, [apiFetch]);

  // Fetch prospects & history
  const fetchProspects = useCallback(async () => {
    try {
      const [pRes, hRes] = await Promise.all([
        apiFetch("/api/admin/crm/prospects"),
        apiFetch("/api/admin/crm/prospects/history")
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProspects(pData);
      }
      if (hRes.ok) {
        const hData = await hRes.json();
        setSearchHistory(hData);
      }
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to load prospects.");
    }
  }, [apiFetch]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/crm/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to load CRM tasks.");
    }
  }, [apiFetch]);

  // Check Ollama AI status
  const checkOllamaStatus = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/crm/ai/status");
      if (res.ok) {
        const data = await res.json();
        setOllamaStatus(data);
      }
    } catch {
      setOllamaStatus({ connected: false });
    }
  }, [apiFetch]);

  // Fetch details for selected lead (activities, calls, updated record)
  const fetchLeadDetails = useCallback(async (leadId: number) => {
    try {
      const [actRes, callRes, leadRes] = await Promise.all([
        apiFetch(`/api/admin/crm/leads/${leadId}/activities`),
        apiFetch(`/api/admin/crm/leads/${leadId}/calls`),
        apiFetch(`/api/admin/crm/leads/${leadId}`)
      ]);
      if (actRes.ok) {
        const actData = await actRes.json();
        setSelectedLeadActivities(actData);
      }
      if (callRes.ok) {
        const callData = await callRes.json();
        setSelectedLeadCalls(callData);
      }
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        const actualLead: CRMLead = leadData.lead || leadData;
        setSelectedLead(actualLead);
        setLeads((prev) => prev.map((l) => (l.id === leadId ? actualLead : l)));
      }
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to load lead details.");
    }
  }, [apiFetch]);

  // Refresh all CRM data
  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    setErrorBanner(null);
    try {
      await Promise.all([
        fetchMetrics(),
        fetchLeads(),
        fetchProspects(),
        fetchTasks(),
        checkOllamaStatus()
      ]);
      if (selectedLead) {
        await fetchLeadDetails(selectedLead.id);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchMetrics, fetchLeads, fetchProspects, fetchTasks, checkOllamaStatus, selectedLead, fetchLeadDetails]);

  // Initial load
  useEffect(() => {
    handleRefreshAll();
  }, []);

  // Update lead stage
  const handleUpdateLeadStage = async (leadId: number, newStage: PipelineStage) => {
    try {
      const res = await apiFetch(`/api/admin/crm/leads/${leadId}/stage`, {
        method: "PUT",
        body: JSON.stringify({ stage: newStage })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(data.error || "Failed to update lead stage.");
        return;
      }
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead(data);
      }
      fetchMetrics();
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to update lead stage.");
    }
  };

  // Update lead fields
  const handleUpdateLead = async (leadId: number, updates: Partial<CRMLead>) => {
    try {
      const res = await apiFetch(`/api/admin/crm/leads/${leadId}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(data.error || "Failed to update lead.");
        return;
      }
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead(data);
      }
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to update lead.");
    }
  };

  // Create new lead manually
  const handleCreateLead = async (leadData: any) => {
    const res = await apiFetch("/api/admin/crm/leads", {
      method: "POST",
      body: JSON.stringify(leadData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || "Failed to create lead.";
      setErrorBanner(msg);
      throw new Error(msg);
    }
    const created: CRMLead = data.lead || data;
    setLeads((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
    fetchMetrics();
    setSelectedLead(created);
    if (created?.id) {
      fetchLeadDetails(created.id);
    }
  };

  // Add activity note
  const handleAddActivity = async (leadId: number, type: string, title: string, description: string) => {
    try {
      const res = await apiFetch(`/api/admin/crm/leads/${leadId}/activities`, {
        method: "POST",
        body: JSON.stringify({ type, title, description })
      });
      const act = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(act.error || "Failed to add activity.");
        return;
      }
      setSelectedLeadActivities((prev) => [act, ...prev]);
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to add activity.");
    }
  };

  // Log call record
  const handleAddCall = async (
    leadId: number,
    outcome: CallOutcome,
    durationSecs: number,
    notes: string,
    nextFollowUpAt?: string
  ) => {
    try {
      const res = await apiFetch(`/api/admin/crm/leads/${leadId}/calls`, {
        method: "POST",
        body: JSON.stringify({ outcome, durationSecs, notes, nextFollowUpAt })
      });
      const call = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(call.error || "Failed to log call.");
        return;
      }
      setSelectedLeadCalls((prev) => [call, ...prev]);
      await fetchLeadDetails(leadId);
      await fetchMetrics();
      await fetchTasks();
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to log call.");
    }
  };

  // Add task
  const handleAddTask = async (
    leadId: number,
    title: string,
    dueAt: string,
    priority: "Low" | "Medium" | "High"
  ) => {
    try {
      const res = await apiFetch("/api/admin/crm/tasks", {
        method: "POST",
        body: JSON.stringify({ leadId, title, dueAt, priority })
      });
      const task = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(task.error || "Failed to add task.");
        return;
      }
      setTasks((prev) => [task, ...prev]);
      fetchMetrics();
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to add task.");
    }
  };

  // Toggle task completed/pending
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const res = await apiFetch(`/api/admin/crm/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus })
      });
      const updated = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(updated.error || "Failed to update task.");
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      fetchMetrics();
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to toggle task status.");
    }
  };

  // Conversion errors must remain visible in the confirmation form.
  const handleConvertLead = async (leadId: number, details: { contractValue: number; billingEmail: string; notes: string }) => {
    const res = await apiFetch(`/api/admin/crm/leads/${leadId}/convert`, {
      method: "POST",
      body: JSON.stringify(details)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not convert this lead. Please try again.");
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? data : lead)));
    setSelectedLead(data);
    void fetchMetrics();
  };

  // Archive lead
  const handleArchiveLead = async (leadId: number) => {
    try {
      const res = await apiFetch(`/api/admin/crm/leads/${leadId}/archive`, {
        method: "POST"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(data.error || "Failed to archive lead.");
        return;
      }
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, isArchived: true } : l)));
      setSelectedLead(null);
      fetchMetrics();
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to archive lead.");
    }
  };

  // Merge leads
  const handleMergeLead = async (primaryId: number, duplicateId: number) => {
    try {
      const res = await apiFetch("/api/admin/crm/leads/merge", {
        method: "POST",
        body: JSON.stringify({ primaryLeadId: primaryId, duplicateLeadId: duplicateId })
      });
      const merged = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(merged.error || "Failed to merge leads.");
        return;
      }
      setLeads((prev) =>
        prev.map((l) => (l.id === primaryId ? merged : l.id === duplicateId ? { ...l, isArchived: true } : l))
      );
      setSelectedLead(merged);
      fetchLeadDetails(primaryId);
      fetchMetrics();
    } catch (e: any) {
      setErrorBanner(e?.message || "Failed to merge leads.");
    }
  };

  // Run public business search
  const handleRunSearch = async (params: { location?: string; category?: string; query?: string; limit?: number }) => {
    setIsSearching(true);
    setErrorBanner(null);
    try {
      const res = await apiFetch("/api/admin/crm/prospects/search", {
        method: "POST",
        body: JSON.stringify(params)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(data.error || "Prospect directory search failed.");
        return;
      }
      await fetchProspects();
    } catch (e: any) {
      setErrorBanner(e?.message || "Prospect directory search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  // Analyze prospect with AI
  const handleAnalyzeProspect = async (prospectId: string) => {
    try {
      const res = await apiFetch(`/api/admin/crm/prospects/${prospectId}/analyze`, {
        method: "POST"
      });
      const updated = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(updated.error || "Prospect analysis failed.");
        return;
      }
      setProspects((prev) => prev.map((p) => (p.id === prospectId ? updated : p)));
    } catch (e: any) {
      setErrorBanner(e?.message || "Analysis failed.");
    }
  };

  // Approve prospect into CRM
  const handleApproveProspect = async (prospectId: string) => {
    try {
      const res = await apiFetch(`/api/admin/crm/prospects/${prospectId}/approve`, {
        method: "POST"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(data.error || "Prospect approval failed.");
        return;
      }
      const createdLead: CRMLead = data.lead || data;
      setProspects((prev) => prev.map((p) => (p.id === prospectId ? { ...p, workflowStatus: "approved" } : p)));
      if (createdLead) {
        setLeads((prev) => [createdLead, ...prev.filter((l) => l.id !== createdLead.id)]);
      }
      fetchMetrics();
    } catch (e: any) {
      setErrorBanner(e?.message || "Approval failed.");
    }
  };

  // Bulk approve prospects
  const handleBulkApprove = async (ids: string[]) => {
    try {
      const res = await apiFetch("/api/admin/crm/prospects/bulk-approve", {
        method: "POST",
        body: JSON.stringify({ prospectIds: ids })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(data.error || "Bulk approval failed.");
        return;
      }
      setProspects((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, workflowStatus: "approved" } : p))
      );
      fetchLeads();
      fetchMetrics();
    } catch (e: any) {
      setErrorBanner(e?.message || "Bulk approval failed.");
    }
  };

  // Reject prospect
  const handleRejectProspect = async (prospectId: string) => {
    try {
      const res = await apiFetch(`/api/admin/crm/prospects/${prospectId}/reject`, {
        method: "POST"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(data.error || "Rejection failed.");
        return;
      }
      setProspects((prev) => prev.map((p) => (p.id === prospectId ? { ...p, workflowStatus: "rejected" } : p)));
    } catch (e: any) {
      setErrorBanner(e?.message || "Rejection failed.");
    }
  };

  // Bulk reject prospects
  const handleBulkReject = async (ids: string[]) => {
    try {
      const res = await apiFetch("/api/admin/crm/prospects/bulk-reject", {
        method: "POST",
        body: JSON.stringify({ prospectIds: ids })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorBanner(data.error || "Bulk rejection failed.");
        return;
      }
      setProspects((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, workflowStatus: "rejected" } : p))
      );
    } catch (e: any) {
      setErrorBanner(e?.message || "Bulk rejection failed.");
    }
  };

  const handleOpenLead = (lead: CRMLead) => {
    setSelectedLead(lead);
    fetchLeadDetails(lead.id);
  };

  const handleQuickCall = (lead: CRMLead) => {
    setSelectedLead(lead);
    fetchLeadDetails(lead.id);
  };

  return (
    <div className="space-y-6">
      {errorBanner && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs"
        >
          <span>{errorBanner}</span>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="px-2 py-0.5 rounded bg-red-500/15 hover:bg-red-500/25 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Mode Selector */}
      <CrmHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        ollamaConnected={ollamaStatus.connected}
        ollamaModel={ollamaStatus.model}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
        onNewLeadClick={() => setIsNewLeadOpen(true)}
      />

      {/* Main Tab Content */}
      {activeTab === "dashboard" && (
        <CrmMetricsDashboard
          metrics={metrics}
          leads={leads}
          tasks={tasks}
          onSelectLead={handleOpenLead}
          onGoToPipeline={() => setActiveTab("pipeline")}
          onGoToCockpit={() => setActiveTab("cockpit")}
        />
      )}

      {activeTab === "pipeline" && (
        <CrmPipelineBoard
          leads={leads}
          onSelectLead={handleOpenLead}
          onUpdateLeadStage={handleUpdateLeadStage}
          onQuickCall={handleQuickCall}
        />
      )}

      {activeTab === "leads" && (
        <CrmLeadTable
          leads={leads}
          onSelectLead={handleOpenLead}
          onUpdateLeadStage={handleUpdateLeadStage}
          onConvertLead={(lead) => {
            setSelectedLead(lead);
            fetchLeadDetails(lead.id);
          }}
          onArchiveLead={handleArchiveLead}
          onQuickCall={handleQuickCall}
        />
      )}

      {activeTab === "cockpit" && (
        <CrmColdCallCockpit
          leads={leads}
          onLogCall={handleAddCall}
          onSelectLead={handleOpenLead}
        />
      )}

      {activeTab === "prospects" && (
        <CrmProspectFinder
          prospects={prospects}
          searchHistory={searchHistory}
          onRunSearch={handleRunSearch}
          onAnalyzeProspect={handleAnalyzeProspect}
          onApproveProspect={handleApproveProspect}
          onBulkApprove={handleBulkApprove}
          onRejectProspect={handleRejectProspect}
          onBulkReject={handleBulkReject}
          isSearching={isSearching}
        />
      )}

      {activeTab === "tasks" && (
        <CrmTasksList
          tasks={tasks}
          leads={leads}
          onToggleTaskStatus={handleToggleTaskStatus}
          onAddTask={handleAddTask}
          onSelectLead={handleOpenLead}
        />
      )}

      {activeTab === "settings" && (
        <CrmSettings
          ollamaConnected={ollamaStatus.connected}
          ollamaModel={ollamaStatus.model}
          ollamaUrl={ollamaStatus.url}
          onTestOllama={checkOllamaStatus}
          leadsCount={leads.length}
          leads={leads}
        />
      )}

      {/* Modals */}
      {selectedLead && (
        <CrmLeadDetailModal
          lead={selectedLead}
          activities={selectedLeadActivities}
          calls={selectedLeadCalls}
          tasks={tasks.filter((t) => t.leadId === selectedLead.id)}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          onAddActivity={handleAddActivity}
          onAddCall={handleAddCall}
          onAddTask={handleAddTask}
          onToggleTaskStatus={handleToggleTaskStatus}
          onConvertLead={handleConvertLead}
          onArchiveLead={handleArchiveLead}
          onMergeLead={handleMergeLead}
          allLeads={leads}
        />
      )}

      <CrmNewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onCreateLead={handleCreateLead}
      />
    </div>
  );
}

