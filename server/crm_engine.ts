import { V79_OFFERINGS, type V79Offering } from "../src/crm/offerings";
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
  serviceRequested?: string;
  biggestChallenge?: string;
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

/**
 * Each match is based on a stated enquiry, a described need or a sector clue.
 * Websites and social-media profile URLs are never used to rank a lead.
 */
function normalized(value?: string): string {
  return " " + (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " ";
}

function hasSignal(text: string, needle: string): boolean {
  const phrase = normalized(needle);
  const idx = text.indexOf(phrase);
  if (idx < 0) return false;
  // Avoid obvious false-positive upsells such as "we do not need a POS system".
  const before = text.slice(Math.max(0, idx - 55), idx).trim();
  if (/(?:no|not|never|do not need|dont need|not interested in|without a need for)(?:\s+(?:a|an|any|new))?$/i.test(before)) return false;
  return true;
}

type OfferingMatch = {
  offering: V79Offering;
  source: "requested" | "described" | "sector";
  weight: number;
};

export function matchV79Offerings(b: BusinessInput): OfferingMatch[] {
  const request = normalized(b.serviceRequested);
  const described = normalized([b.biggestChallenge, b.description].filter(Boolean).join(" "));
  const sector = normalized([b.category, b.industry].filter(Boolean).join(" "));
  return V79_OFFERINGS.flatMap((offering): OfferingMatch[] => {
    const phrases = [offering.label, ...offering.aliases];
    if (phrases.some((phrase) => hasSignal(request, phrase))) {
      return [{ offering, source: "requested", weight: 40 }];
    }
    if (offering.needSignals.some((phrase) => hasSignal(described, phrase)) ||
        phrases.some((phrase) => hasSignal(described, phrase))) {
      return [{ offering, source: "described", weight: 30 }];
    }
    if (offering.sectorSignals.some((phrase) => hasSignal(sector, phrase))) {
      return [{ offering, source: "sector", weight: 10 }];
    }
    return [];
  }).sort((a, b) => b.weight - a.weight);
}

export function calculateDeterministicAnalysis(b: BusinessInput): CRMAnalysisResult {
  const matches = matchV79Offerings(b);
  const breakdown: ScoreBreakdownItem[] = [];
  let points = 0;

  const score = (factor: string, value: number, description: string) => {
    points += value;
    breakdown.push({ factor, points: value, description });
  };
  if (matches.some((m) => m.source === "requested")) {
    score("V79 offering explicitly requested", 40, "The supplied enquiry names a V79 ICT service or Hub app.");
  }
  if (matches.some((m) => m.source === "described")) {
    score("Operational need described", 30, "A relevant need appears in the prospect's own description or challenge.");
  }
  if (matches.some((m) => m.source === "sector")) {
    score("Possible sector fit", 10, "Industry-only indication; staff must validate this possible opportunity.");
  }
  if (b.phone?.trim().length && b.phone.replace(/\D/g, "").length >= 7) {
    score("Contact telephone available", 10, "A telephone contact was supplied; not proof that the number was verified.");
  }
  if (b.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
    score("Contact email available", 10, "An email address was supplied; not proof that the address was verified.");
  }

  const finalScore = Math.min(100, points);
  const scoreCategory: CRMAnalysisResult["scoreCategory"] =
    finalScore >= 80 ? "Hot" : finalScore >= 60 ? "High Potential" : finalScore >= 40 ? "Medium" : "Low";
  const unique = [...new Set(matches.map((m) => m.offering.label))].slice(0, 4);
  const first = matches[0];
  const category = b.category || b.industry || "Unspecified industry";
  const problems = matches
    .filter((m) => m.source === "described")
    .slice(0, 3)
    .map((m) => "Possible requirement to confirm: " + m.offering.benefit + ".");
  const summary = unique.length
    ? `Possible V79 matches for ${b.businessName}: ${unique.join(", ")}. These are suggestions based on supplied details, not confirmed needs.`
    : `No specific V79 solution can be identified for ${b.businessName} from the details provided. Start with a discovery conversation.`;
  const identifiedNeed = first?.source === "requested"
    ? `The enquiry mentions ${first.offering.label}; confirm requirements and budget.`
    : first?.source === "described"
    ? `The supplied description suggests a possible fit for ${first.offering.label}; verify with the prospect.`
    : first?.source === "sector"
    ? `Possible sector fit for ${first.offering.label}, not a verified business problem.`
    : "The business has not yet described a specific ICT or SaaS requirement.";
  const discoveryQuestions = [
    "What is your biggest day-to-day technology or workflow challenge?",
    first ? `How is your team currently handling ${first.offering.benefit}?` : "Which ICT services or business apps would help your team most?",
    "What outcome would make a new solution worthwhile, and when do you need it?"
  ];
  const bestApproach = "Confirm the operational need and decision-maker before presenting a relevant V79 service or Hub app.";

  return {
    summary, category, problems, recommendedServices: unique,
    leadScore: finalScore, scoreCategory, scoreBreakdown: breakdown,
    bestApproach,
    callPrep: {
      whatTheyDo: `Listed as ${category} in ${b.location || "Saint Lucia"}; business activity has not been independently verified.`,
      identifiedNeed,
      recommendedPitch: first
        ? `Ask about the current process, then explain how ${first.offering.label} may help with ${first.offering.benefit}. Do not assume they need it.`
        : "Introduce V79's ICT services and Hub apps, then ask which operational challenge matters most.",
      discoveryQuestions,
      suggestedNextAction: "Arrange a short discovery call to validate fit"
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

  // Ollama may re-order evidence-backed matches, but must never invent a
  // product, an operational problem or a new score.
  const systemPrompt = `You support the V79 CRM. Use ONLY the approved V79 offering labels below.
Never infer a need from whether a company has a website. Do not invent facts.
Reply as JSON with recommendedServices (an array of approved labels).
Approved: ${V79_OFFERINGS.map((o) => o.label).join(", ")}`;
  const userPrompt = `Consider only these supplied details and existing evidence-backed matches:
Business: ${business.businessName}
Industry: ${business.industry || business.category || "Unknown"}
Request: ${business.serviceRequested || "None"}
Described challenge: ${business.biggestChallenge || business.description || "None"}
Existing evidence-backed matches: ${fallback.recommendedServices.join(", ") || "None"}`;

  try {
    const rawOllamaResponse = await queryOllama(userPrompt, systemPrompt, ollamaBaseUrl, model);
    if (rawOllamaResponse) {
      const parsed = JSON.parse(rawOllamaResponse);
      if (Array.isArray(parsed.recommendedServices)) {
        const approved = parsed.recommendedServices.filter(
          (label: unknown): label is string => typeof label === "string" && fallback.recommendedServices.includes(label)
        );
        const sorted = [...new Set([...approved, ...fallback.recommendedServices])];
        if (sorted.join("|") !== fallback.recommendedServices.join("|")) {
          return {
            ...fallback,
            recommendedServices: sorted,
            generatedBy: "ollama",
            modelName: model
          };
        }
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
