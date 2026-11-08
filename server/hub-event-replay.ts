// Disabled historical events stay parked unless their lead IDs are selected.
// With a selection, the sweep is restricted to that set, including pending IDs.
export function shouldReplayHubLead(lead: {id: unknown; hubEventStatus?: string},
  selected = process.env.V79_HUB_EVENT_REPLAY_LEAD_IDS || ""): boolean {
  if (!["pending", "disabled"].includes(lead.hubEventStatus || "")) return false;
  if (!selected.trim()) return lead.hubEventStatus === "pending";
  const ids = selected.split(",").map(id => id.trim());
  if (ids.some(id => !/^[1-9]\d{0,15}$/.test(id))) return false;
  return ids.includes(String(lead.id));
}
