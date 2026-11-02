/** Per-tab, short-lived unsaved CRM lead draft.
 * It is never transmitted until Save and is cleared on save, cancel or
 * intentional admin logout. Do not use localStorage for contact details. */
export const NEW_LEAD_DRAFT_KEY = "v79-admin:crm-new-lead-draft:v1";
const MAX_DRAFT_AGE_MS = 8 * 60 * 60 * 1000;

export interface NewLeadDraft {
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  serviceRequested: string;
  estimatedValue: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  leadSource: string;
  message: string;
}
function storage(): Storage | null {
  try { return typeof window === "undefined" ? null : window.sessionStorage; }
  catch { return null; }
}
export function readNewLeadDraft(): NewLeadDraft | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(NEW_LEAD_DRAFT_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw) as { savedAt?: unknown; draft?: unknown };
    if (typeof record.savedAt !== "number" || record.savedAt > Date.now() + 1000 ||
        Date.now() - record.savedAt > MAX_DRAFT_AGE_MS ||
        !record.draft || typeof record.draft !== "object") {
      s.removeItem(NEW_LEAD_DRAFT_KEY);
      return null;
    }
    const d = record.draft as Record<string, unknown>;
    const keys = ["name", "company", "email", "phone", "whatsapp", "location",
      "serviceRequested", "estimatedValue", "priority", "leadSource", "message"];
    if (keys.some(key => typeof d[key] !== "string" || (d[key] as string).length > 10000)) {
      s.removeItem(NEW_LEAD_DRAFT_KEY);
      return null;
    }
    return d as unknown as NewLeadDraft;
  } catch {
    try { s.removeItem(NEW_LEAD_DRAFT_KEY); } catch {}
    return null;
  }
}
export function saveNewLeadDraft(draft: NewLeadDraft): void {
  try { storage()?.setItem(NEW_LEAD_DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), draft })); }
  catch { /* private browsing/storage quota; keep in-memory form */ }
}
export function clearNewLeadDraft(): void {
  try { storage()?.removeItem(NEW_LEAD_DRAFT_KEY); } catch {}
}
