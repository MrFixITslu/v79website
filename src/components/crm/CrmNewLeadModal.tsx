import { useEffect, useState } from "react";
import { clearNewLeadDraft, readNewLeadDraft, saveNewLeadDraft } from "../../crm/newLeadDraft";
import { X, UserPlus, Building, Mail, Phone, MapPin, DollarSign, Briefcase } from "lucide-react";
import { SAINT_LUCIA_LOCATIONS } from "../../crm/types";

interface CrmNewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (leadData: any) => Promise<void>;
}

export function CrmNewLeadModal({ isOpen, onClose, onCreateLead }: CrmNewLeadModalProps) {
  const [restored] = useState(() => readNewLeadDraft());
  const [name, setName] = useState(restored?.name || "");
  const [company, setCompany] = useState(restored?.company || "");
  const [email, setEmail] = useState(restored?.email || "");
  const [phone, setPhone] = useState(restored?.phone || "");
  const [whatsapp, setWhatsapp] = useState(restored?.whatsapp || "");
  const [location, setLocation] = useState(restored?.location || "Castries");
  const [serviceRequested, setServiceRequested] = useState(restored?.serviceRequested || "Managed IT Support");
  // Empty input instead of a number that becomes 06000 when typing.
  const [estimatedValue, setEstimatedValue] = useState(restored?.estimatedValue || "");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">(restored?.priority || "Medium");
  const [leadSource, setLeadSource] = useState(restored?.leadSource || "Direct Phone Call");
  const [message, setMessage] = useState(restored?.message || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const hasDraftContent = Boolean(name || company || email || phone || whatsapp || estimatedValue || message);
  useEffect(() => {
    if (!isOpen) return;
    if (!hasDraftContent) return;
    saveNewLeadDraft({ name, company, email, phone, whatsapp, location, serviceRequested,
      estimatedValue, priority, leadSource, message });
  }, [isOpen, name, company, email, phone, whatsapp, location, serviceRequested,
      estimatedValue, priority, leadSource, message, hasDraftContent]);

  const resetForm = () => {
    setName(""); setCompany(""); setEmail(""); setPhone(""); setWhatsapp("");
    setLocation("Castries"); setServiceRequested("Managed IT Support");
    setEstimatedValue(""); setPriority("Medium"); setLeadSource("Direct Phone Call");
    setMessage(""); setSubmitError("");
  };

  const closeAndDiscard = () => {
    if (hasDraftContent && !window.confirm("Discard this unsaved lead?")) return;
    clearNewLeadDraft();
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !name.trim()) return;
    const amount = estimatedValue.trim() === "" ? 0 : Number(estimatedValue);
    if (!Number.isFinite(amount) || amount < 0) {
      setSubmitError("Enter a valid estimate of zero or more.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      await onCreateLead({
        name: name.trim(),
        company: company.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || phone.trim() || undefined,
        location,
        serviceRequested,
        estimatedValue: amount,
        priority,
        leadSource,
        message: message.trim() || undefined
      });
      clearNewLeadDraft();
      resetForm();
      onClose();
    } catch (error: any) {
      // Keep every field and its temporary draft when a save fails.
      setSubmitError(error?.message || "Could not save this lead. Your draft has been kept.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-app-bg border border-app-border rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs shadow-2xl animate-fade-in-once">
        <div className="flex items-center justify-between border-b border-app-border/60 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-app-text font-display">Capture New CRM Lead</h3>
          </div>
          <button
            type="button"
            onClick={closeAndDiscard}
            className="p-1.5 rounded-xl hover:bg-app-btn-sec text-app-text-muted hover:text-app-text transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rodney Bay Hotel"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Contact Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Marcus Joseph"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +1 (758) 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">WhatsApp Number</label>
              <input
                type="tel"
                placeholder="e.g. +17585550199"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="contact@company.lc"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Saint Lucia Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
              >
                {SAINT_LUCIA_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Service Requested</label>
              <select
                value={serviceRequested}
                onChange={(e) => setServiceRequested(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
              >
                <option value="Managed IT Support">Managed IT Support</option>
                <option value="Network Infrastructure & Wi-Fi">Network Infrastructure & Wi-Fi</option>
                <option value="VoIP Phone Systems">VoIP Phone Systems</option>
                <option value="Cybersecurity & Backup">Cybersecurity & Backup</option>
                <option value="Web & SaaS Development">Web & SaaS Development</option>
                <option value="Cloud Migration">Cloud Migration</option>
                <option value="Hardware Procurement">Hardware Procurement</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Est. Deal Value (XCD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Lead Source</label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
              >
                <option value="Direct Phone Call">Direct Phone Call</option>
                <option value="WhatsApp Inquiry">WhatsApp Inquiry</option>
                <option value="Referral / Word of Mouth">Referral / Word of Mouth</option>
                <option value="In-Person Meeting">In-Person Meeting</option>
                <option value="Website Contact Form">Website Contact Form</option>
                <option value="Cold Outreach">Cold Outreach</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-app-text-muted block mb-1">Initial Inquiry / Message</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Client's initial questions, pain points, or project scope..."
              className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none"
            />
          </div>

          {restored && (
            <p className="text-amber-500 text-[11px]" role="status">Unsaved lead draft restored in this tab.</p>
          )}
          {submitError && <p className="text-red-500 text-[11px]" role="alert">{submitError}</p>}
          <div className="flex justify-end gap-2 pt-2 border-t border-app-border/40">
            <button
              type="button"
              onClick={closeAndDiscard}
              className="px-4 py-2 rounded-xl bg-app-btn-sec text-app-text font-semibold hover:bg-app-btn-sec/80 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Saving Lead..." : "Save & Score Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
