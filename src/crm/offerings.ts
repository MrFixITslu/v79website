/**
 * Shared, customer-facing V79 catalogue. These are solutions we can actually
 * discuss with a prospect, not assumptions about a prospect's website.
 * Keep CRM labels aligned with the Services page and Hub app names.
 */
export type OfferingKind = "ICT Service" | "Hub App";
export interface V79Offering {
  id: string;
  label: string;
  kind: OfferingKind;
  benefit: string;
  aliases: readonly string[];
  needSignals: readonly string[];
  sectorSignals: readonly string[];
}

export const V79_OFFERINGS: readonly V79Offering[] = [
  {
    id: "managed-it", label: "Managed IT Support", kind: "ICT Service",
    benefit: "ongoing IT support, fault prevention and reliable operations",
    aliases: ["managed it", "managed it services", "it support", "help desk support"],
    needSignals: ["computer support", "it downtime", "recurring faults", "technical support", "it maintenance", "device support", "slow computers"],
    sectorSignals: ["professional services", "law firm", "accounting", "medical", "clinic"]
  },
  {
    id: "network", label: "Network Infrastructure & Wi-Fi", kind: "ICT Service",
    benefit: "reliable business networking and wireless coverage",
    aliases: ["networking", "network installation", "wifi", "wi fi", "network design"],
    needSignals: ["poor wifi", "weak wifi", "network outage", "slow internet", "network issues", "connectivity", "guest wifi", "access points"],
    sectorSignals: ["hospitality", "hotel", "resort", "villa", "accommodation"]
  },
  {
    id: "cabling", label: "Structured Cabling & Fibre", kind: "ICT Service",
    benefit: "dependable structured cabling, fibre and physical infrastructure",
    aliases: ["cabling", "structured cabling", "fibre", "fiber", "lan installation"],
    needSignals: ["cable installation", "network cabling", "fibre optic", "fiber optic", "wiring", "new office network"],
    sectorSignals: ["construction", "property developer"]
  },
  {
    id: "cybersecurity", label: "Cybersecurity & Firewall Protection", kind: "ICT Service",
    benefit: "stronger protection for accounts, devices and business information",
    aliases: ["cybersecurity", "security audit", "firewall", "endpoint protection"],
    needSignals: ["data breach", "phishing", "ransomware", "malware", "security risk", "firewall", "account compromise", "access control"],
    sectorSignals: ["law firm", "legal", "clinic", "medical", "accounting", "financial services"]
  },
  {
    id: "cloud", label: "Cloud & Microsoft 365", kind: "ICT Service",
    benefit: "secure cloud collaboration, email and productivity",
    aliases: ["cloud migration", "microsoft 365", "office 365", "cloud solutions", "google workspace"],
    needSignals: ["email migration", "document sharing", "remote collaboration", "cloud storage", "cloud migration", "microsoft 365", "office 365"],
    sectorSignals: ["professional services", "accounting"]
  },
  {
    id: "backup", label: "Backup & Disaster Recovery", kind: "ICT Service",
    benefit: "recoverability after data loss, disruption or severe weather",
    aliases: ["backup", "disaster recovery", "data recovery", "cloud backup"],
    needSignals: ["lost files", "data loss", "backup failure", "disaster recovery", "business continuity", "restore data", "offsite backup"],
    sectorSignals: ["hotel", "medical", "clinic", "accounting"]
  },
  {
    id: "consulting", label: "ICT Consulting & Troubleshooting", kind: "ICT Service",
    benefit: "practical ICT advice, assessments and fault resolution",
    aliases: ["ict consultation", "ict assessment", "it consultation", "troubleshooting"],
    needSignals: ["ict advice", "it strategy", "technical assessment", "system troubleshooting", "ict assessment", "it consultation"],
    sectorSignals: []
  },
  {
    id: "hardware", label: "ICT Hardware & Procurement", kind: "ICT Service",
    benefit: "selecting, installing and supporting suitable business equipment",
    aliases: ["hardware procurement", "device procurement", "hardware setup", "equipment purchase"],
    needSignals: ["new computers", "replace laptops", "office hardware", "hardware refresh", "equipment setup", "new workstations"],
    sectorSignals: []
  },
  {
    id: "workflow", label: "Workflow & Inventory Automation", kind: "ICT Service",
    benefit: "less manual administration and more accurate operations",
    aliases: ["inventory management", "business process automation", "workflow automation", "digital transformation"],
    needSignals: ["manual process", "manual entry", "manual stock", "stock count", "stock reconciliation", "inventory errors", "spreadsheet workflow", "repetitive tasks", "workflow automation"],
    sectorSignals: ["wholesale", "distribution", "retail"]
  },
  {
    id: "ai", label: "AI & Business Automation", kind: "ICT Service",
    benefit: "automated reporting, customer assistance and routine workflows",
    aliases: ["ai automation", "ai consulting", "chatbot", "artificial intelligence"],
    needSignals: ["ai assistant", "chatbot", "automated reports", "ai training", "document processing", "customer enquiries", "ai workflow"],
    sectorSignals: []
  },
  {
    id: "software", label: "Custom Software & SaaS Development", kind: "ICT Service",
    benefit: "purpose-built software for business operations",
    aliases: ["app development", "saas development", "custom app", "software development", "system integration"],
    needSignals: ["custom application", "custom software", "build an app", "system integration", "software integration"],
    sectorSignals: []
  },
  {
    id: "hub", label: "V79 Hub", kind: "Hub App",
    benefit: "one secure place to access V79 services and connected apps",
    aliases: ["v79 hub", "hub app", "customer hub", "customer portal"],
    needSignals: ["customer portal", "single sign on", "central app access", "account dashboard"],
    sectorSignals: []
  },
  {
    id: "tiquet", label: "V79 Tiquet", kind: "Hub App",
    benefit: "ticket tracking, support ownership and service visibility",
    aliases: ["tiquet", "ticketing system", "helpdesk app"],
    needSignals: ["support tickets", "unresolved tickets", "ticket tracking", "fault tracking", "service requests", "helpdesk tickets", "complaint tracking"],
    sectorSignals: ["service provider", "maintenance"]
  },
  {
    id: "pos", label: "V79 POS", kind: "Hub App",
    benefit: "sales and stock management from a point-of-sale system",
    aliases: ["v79 pos", "point of sale", "pos system", "cash register"],
    needSignals: ["point of sale", "sales tracking", "stock control", "stock count", "inventory tracking", "sales register"],
    sectorSignals: ["retail", "shop", "restaurant", "store", "wholesale"]
  },
  {
    id: "ffpro", label: "V79 FFPRO", kind: "Hub App",
    benefit: "budgeting, expenses and financial planning",
    aliases: ["ffpro", "fire finance pro", "finance tracker", "budgeting app"],
    needSignals: ["budget tracking", "expense tracking", "financial planning", "cash flow forecast", "personal finance", "savings goals"],
    sectorSignals: []
  },
  {
    id: "marketing", label: "V79 Marketing", kind: "Hub App",
    benefit: "social content planning and marketing workflow management",
    aliases: ["v79 marketing", "marketing app", "content scheduler", "social media manager"],
    needSignals: ["social media scheduling", "social posts", "content creation", "marketing campaigns", "content calendar", "social media management"],
    sectorSignals: ["tour operator", "hospitality", "restaurant"]
  },
  {
    id: "academy", label: "V79 Academy", kind: "Hub App",
    benefit: "digital-skills courses and staff training",
    aliases: ["v79 academy", "academy app", "staff training", "online courses"],
    needSignals: ["staff training", "employee upskilling", "digital skills", "online learning", "training courses", "ai literacy"],
    sectorSignals: []
  }
] as const;

export const V79_SERVICE_CATALOG = V79_OFFERINGS.map((offering) => offering.label);

export function offeringByLabel(label: string): V79Offering | undefined {
  return V79_OFFERINGS.find((offering) => offering.label === label);
}
