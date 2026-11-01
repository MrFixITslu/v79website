import http from "http";
import https from "https";

export interface BusinessInput {
  businessName: string;
  category?: string;
  industry?: string;
  location?: string;
  website?: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  description?: string;
  companySize?: string;
}

export interface ScoreBreakdownItem {
  factor: string;
  points: number;
  description: string;
}

export interface CRMAnalysisResult {
  summary: string;
  category: string;
  problems: string[];
  recommendedServices: string[];
  leadScore: number;
  scoreCategory: "Hot" | "High Potential" | "Medium" | "Low";
  scoreBreakdown: ScoreBreakdownItem[];
  bestApproach: string;
  callPrep: {
    whatTheyDo: string;
    identifiedNeed: string;
    recommendedPitch: string;
    discoveryQuestions: string[];
    suggestedNextAction: string;
  };
  generatedBy: "ollama" | "heuristic_engine";
  modelName?: string;
  timestamp: string;
}

// Configurable scoring weights as requested by prompt
export const DEFAULT_SCORING_RULES = [
  { id: "no_website", label: "Website not listed in source (verification needed)", points: 10, condition: (b: BusinessInput) => !b.website || !b.website.trim() },
  { id: "active_social_no_web", label: "Social URL listed, website not listed (verification needed)", points: 10, condition: (b: BusinessInput) => (!b.website || !b.website.trim()) && Boolean(b.facebookUrl || b.instagramUrl) },
  { id: "contact_available", label: "Direct Phone or WhatsApp Reachable", points: 15, condition: (b: BusinessInput) => Boolean(b.phone && b.phone.trim().length >= 7) },
  { id: "email_available", label: "Public Business Email Listed", points: 10, condition: (b: BusinessInput) => Boolean(b.email && b.email.includes("@")) },
  { id: "saint_lucia_location", label: "High-Commercial Saint Lucia District", points: 15, condition: (b: BusinessInput) => {
    const loc = (b.location || "").toLowerCase();
    return loc.includes("castries") || loc.includes("gros islet") || loc.includes("rodney bay") || loc.includes("vieux fort") || loc.includes("soufrière") || loc.includes("marigot");
  }},
  { id: "high_ict_fit", label: "Fits High-Value V79 Services (Hospitality, Legal, Medical, Retail, Services)", points: 20, condition: (b: BusinessInput) => {
    const text = `${b.category || ""} ${b.industry || ""} ${b.description || ""}`.toLowerCase();
    return /restaurant|hotel|resort|villa|bar|clinic|medical|law|legal|auto|retail|store|logistics|tour|charter|real estate|construction|consult/.test(text);
  }}
];

export function calculateDeterministicAnalysis(b: BusinessInput): CRMAnalysisResult {
  const breakdown: ScoreBreakdownItem[] = [];
  let totalScore = 0;

  for (const rule of DEFAULT_SCORING_RULES) {
    if (rule.condition(b)) {
      totalScore += rule.points;
      breakdown.push({
        factor: rule.label,
        points: rule.points,
        description: `Heuristic suggestion from supplied business details: matches ${rule.id.replace(/_/g, " ")} criteria.`
      });
    }
  }

  // Cap score at 100
  const finalScore = Math.min(100, Math.max(10, totalScore));

  let scoreCat: "Hot" | "High Potential" | "Medium" | "Low" = "Low";
  if (finalScore >= 80) scoreCat = "Hot";
  else if (finalScore >= 60) scoreCat = "High Potential";
  else if (finalScore >= 40) scoreCat = "Medium";

  // Opportunity detection & V79 service matching
  const problems: string[] = [];
  const recommendedServices: string[] = [];
  const text = `${b.category || ""} ${b.industry || ""} ${b.description || ""}`.toLowerCase();

  if (!b.website || !b.website.trim()) {
    problems.push("No website URL was present in the public listing; confirm whether the business has a website before proposing one.");
    recommendedServices.push("Website Development & Domain Setup");
    recommendedServices.push("Custom Digital Showcase / Mobile Ordering");
  } else {
    problems.push("A website is listed; a technical review could establish whether modernisation or lead capture would add value.");
    recommendedServices.push("Website Modernization & SEO");
  }

  if (b.facebookUrl || b.instagramUrl) {
    problems.push("Social accounts are listed; ask how customer enquiries and service requests are managed before proposing a CRM.");
    recommendedServices.push("CRM & Helpdesk Implementation");
    recommendedServices.push("WhatsApp & Social Chatbot Automation");
  }

  if (/hotel|restaurant|resort|hospitality|bar|tour|rental/.test(text)) {
    problems.push("Hospitality connectivity and continuity may be worth discussing; no actual problems have been confirmed.");
    recommendedServices.push("Wi-Fi Optimization & Guest Hotspots");
    recommendedServices.push("Automated Disaster Backup & Cloud Redundancy");
  } else if (/medical|clinic|law|legal|accounting|financial/.test(text)) {
    problems.push("Data protection and resilience may be relevant; no security gaps or compliance failures have been verified.");
    recommendedServices.push("Cybersecurity & Firewall Hardening");
    recommendedServices.push("Managed IT Support & Cloud Microsoft 365");
  } else if (/retail|store|wholesale|distributor|supply/.test(text)) {
    problems.push("Explore whether stock and point-of-sale workflows could benefit from integration; current processes are unknown.");
    recommendedServices.push("Inventory Management Integration");
    recommendedServices.push("Business Process Automation");
  } else {
    problems.push("Ask about existing workflows and IT support before suggesting automation or managed services.");
    recommendedServices.push("Managed IT Support");
    recommendedServices.push("Business Automation");
  }

  const category = b.category || b.industry || "General Small Business";
  const summary = `${b.businessName} operates in ${b.location || "Saint Lucia"}. ${
    !b.website ? "No website was recorded in the directory; this does not mean the business lacks a site." : "A website URL is recorded, but its quality and technology needs have not been assessed."
  }`;

  const bestApproach = finalScore >= 80
    ? "Direct executive phone consultation or WhatsApp introduction focusing on immediate customer acquisition and digital branding."
    : "Educational outreach demonstrating modern Saint Lucia peer case studies and automated workflow savings.";

  const discoveryQuestions = [
    `How do customers in ${b.location || "Saint Lucia"} typically find and contact ${b.businessName} today?`,
    `What is your biggest operational or communication bottleneck when handling new inquiries or orders?`,
    `Have you experienced internet dropouts or lost data during power fluctuations or severe weather?`
  ];

  return {
    summary,
    category,
    problems,
    recommendedServices: Array.from(new Set(recommendedServices)),
    leadScore: finalScore,
    scoreCategory: scoreCat,
    scoreBreakdown: breakdown,
    bestApproach,
    callPrep: {
      whatTheyDo: `The public listing describes ${b.businessName} as ${category.toLowerCase()} in ${b.location || "Saint Lucia"}; confirm details before outreach.`,
      identifiedNeed: problems[0] || "Potential ICT opportunities require a discovery conversation",
      recommendedPitch: `Introduce V79 Digital's localized Saint Lucia IT solutions, specifically how ${recommendedServices[0] || "modern IT infrastructure"} drives revenue and prevents costly downtime.`,
      discoveryQuestions,
      suggestedNextAction: finalScore >= 70 ? "Book a 15-minute Discovery Consultation" : "Send V79 Digital Portfolio & Overview via Email"
    },
    generatedBy: "heuristic_engine",
    timestamp: new Date().toISOString()
  };
}

// Local Ollama caller
export async function queryOllama(
  prompt: string,
  systemPrompt: string,
  ollamaBaseUrl: string = "http://ollama:11434",
  model: string = "llama3"
): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const approved = (process.env.OLLAMA_BASE_URL || "http://ollama:11434").replace(/\/$/, "");
      if (ollamaBaseUrl.replace(/\/$/, "") !== approved) return resolve(null);
      const url = new URL(`${ollamaBaseUrl.replace(/\/$/, "")}/api/generate`);
      const postData = JSON.stringify({
        model,
        prompt,
        system: systemPrompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.2,
          top_p: 0.9
        }
      });

      const client = url.protocol === "https:" ? https : http;
      const req = client.request(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === "https:" ? 443 : 80),
          path: url.pathname,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData)
          },
          timeout: 6000 // Fast failover so UI stays snappy
        },
        (res) => {
          let rawData = "";
          res.on("data", (chunk) => { rawData += chunk; if (rawData.length > 1_000_000) { req.destroy(); resolve(null); } });
          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(rawData);
                resolve(parsed.response || null);
              } catch {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          });
        }
      );

      req.on("error", () => resolve(null));
      req.on("timeout", () => { req.destroy(); resolve(null); });
      req.write(postData);
      req.end();
    } catch {
      resolve(null);
    }
  });
}

export async function analyzeBusinessWithAI(
  business: BusinessInput,
  ollamaBaseUrl: string = process.env.OLLAMA_BASE_URL || "http://ollama:11434",
  model: string = process.env.OLLAMA_MODEL || "qwen2.5:3b"
): Promise<CRMAnalysisResult> {
  const fallback = calculateDeterministicAnalysis(business);

  const systemPrompt = `You are the Lead Intelligence AI for V79 Digital, a premier Information and Communications Technology (ICT) consultancy in Saint Lucia (Caribbean).
You analyze businesses discovered through public directories.
All issues are questions to investigate, not established customer problems. A missing website field is not proof the company has no website. Never assert unverified security vulnerabilities, manual workflows, social responsiveness, or compliance failures.
Do not fabricate missing details. Strictly rely on provided facts.
Return ONLY valid JSON with this exact schema:
{
  "summary": string,
  "category": string,
  "problems": string[],
  "recommendedServices": string[],
  "leadScore": number (0 to 100),
  "scoreCategory": "Hot" | "High Potential" | "Medium" | "Low",
  "bestApproach": string,
  "callPrep": {
    "whatTheyDo": string,
    "identifiedNeed": string,
    "recommendedPitch": string,
    "discoveryQuestions": string[],
    "suggestedNextAction": string
  }
}`;

  const userPrompt = `Analyze this Saint Lucia business for digital and IT opportunities:
Business Name: ${business.businessName}
Category: ${business.category || "Unknown"}
Industry: ${business.industry || "Unknown"}
Location: ${business.location || "Saint Lucia"}
Website: ${business.website || "None"}
Phone: ${business.phone || "None"}
Email: ${business.email || "None"}
Facebook: ${business.facebookUrl || "None"}
Instagram: ${business.instagramUrl || "None"}
LinkedIn: ${business.linkedinUrl || "None"}
Description: ${business.description || "None"}

Evaluate whether they need: Website Development/Modernization, Business Automation, CRM, Wi-Fi Optimization, Cybersecurity, or Managed IT.`;

  try {
    const rawOllamaResponse = await queryOllama(userPrompt, systemPrompt, ollamaBaseUrl, model);
    if (rawOllamaResponse) {
      const parsed = JSON.parse(rawOllamaResponse);
      if (parsed.summary && typeof parsed.leadScore === "number") {
        return {
          summary: parsed.summary,
          category: parsed.category || fallback.category,
          problems: Array.isArray(parsed.problems) ? parsed.problems : fallback.problems,
          recommendedServices: Array.isArray(parsed.recommendedServices) ? parsed.recommendedServices : fallback.recommendedServices,
          leadScore: Math.min(100, Math.max(0, Math.round(parsed.leadScore))),
          scoreCategory: parsed.scoreCategory || fallback.scoreCategory,
          scoreBreakdown: fallback.scoreBreakdown,
          bestApproach: parsed.bestApproach || fallback.bestApproach,
          callPrep: parsed.callPrep || fallback.callPrep,
          generatedBy: "ollama",
          modelName: model,
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn("[CRM Engine] Ollama query failed, using deterministic engine:", (err as any)?.message);
  }

  return fallback;
}

export async function pingOllama(ollamaBaseUrl: string = "http://ollama:11434"): Promise<{
  connected: boolean;
  models: string[];
  latencyMs?: number;
  url: string;
}> {
  const startTime = Date.now();
  return new Promise((resolve) => {
    try {
      const url = new URL(`${ollamaBaseUrl.replace(/\/$/, "")}/api/tags`);
      const client = url.protocol === "https:" ? https : http;
      const req = client.request(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === "https:" ? 443 : 80),
          path: url.pathname,
          method: "GET",
          timeout: 3000
        },
        (res) => {
          let rawData = "";
          res.on("data", (c) => { rawData += c; });
          res.on("end", () => {
            const latency = Date.now() - startTime;
            if (res.statusCode === 200) {
              try {
                const data = JSON.parse(rawData);
                const models = (data.models || []).map((m: any) => m.name || m.model);
                resolve({ connected: true, models, latencyMs: latency, url: ollamaBaseUrl });
              } catch {
                resolve({ connected: false, models: [], latencyMs: latency, url: ollamaBaseUrl });
              }
            } else {
              resolve({ connected: false, models: [], latencyMs: latency, url: ollamaBaseUrl });
            }
          });
        }
      );
      req.on("error", () => resolve({ connected: false, models: [], url: ollamaBaseUrl }));
      req.on("timeout", () => { req.destroy(); resolve({ connected: false, models: [], url: ollamaBaseUrl }); });
      req.end();
    } catch {
      resolve({ connected: false, models: [], url: ollamaBaseUrl });
    }
  });
}

// No invented business records. Operators import verified directory entries.
export const SAINT_LUCIA_PUBLIC_BUSINESS_DIRECTORY: BusinessInput[] = [];
