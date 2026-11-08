import type { BusinessInput } from "./crm_engine";

export interface PublicBusiness extends BusinessInput {
  sourceUrl: string;
}

export interface PublicSearchOptions {
  location?: string;
  category?: string;
  query?: string;
  limit?: number;
}

interface OsmElement {
  type?: string;
  id?: number;
  tags?: Record<string, string>;
}

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const SAINT_LUCIA_BBOX = "13.68,-61.16,14.14,-60.85";
let lastPublicRequest = 0;

function cleanUrl(value?: string): string | undefined {
  if (!value || value.length > 400) return undefined;
  try {
    const raw = value.trim();
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return undefined;
    if (!url.hostname.includes(".") || /^(localhost|127\.|10\.|192\.168\.)/.test(url.hostname.toLowerCase())) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

function cleanSocialUrl(value: string | undefined, service: "facebook" | "instagram" | "linkedin"): string | undefined {
  const safeUrl = cleanUrl(value);
  if (!safeUrl) return undefined;
  const hostname = new URL(safeUrl).hostname.toLowerCase();
  const allowedDomains = service === "facebook"
    ? ["facebook.com", "fb.com"]
    : service === "instagram" ? ["instagram.com"] : ["linkedin.com"];
  return allowedDomains.some((domain) => hostname === domain || hostname.endsWith("." + domain))
    ? safeUrl : undefined;
}

function firstTag(tags: Record<string, string>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = tags[key]?.trim();
    if (value) return value.split(";")[0].trim();
  }
  return undefined;
}

function categorise(tags: Record<string, string>): string {
  const amenity = (tags.amenity || "").toLowerCase();
  const office = (tags.office || "").toLowerCase();
  if (tags.healthcare || /clinic|hospital|pharmacy|doctors|dentist/.test(amenity)) return "Healthcare & Wellness";
  if (/restaurant|cafe|fast_food|bar|pub/.test(amenity)) return "Restaurant & Hospitality";
  if (tags.tourism || /hotel|guest_house/.test(amenity)) return "Hospitality & Tourism";
  if (office === "lawyer" || office === "accountant" || office === "consulting") return "Professional Services";
  if (office === "estate_agent" || tags["real_estate"]) return "Real Estate & Property";
  if (tags.shop) return "Retail & Wholesale";
  if (tags.craft) return "Artisan & Culture";
  if (office) return "Professional Services";
  return "Commercial Services";
}

export function parsePublicBusinesses(
  elements: unknown,
  options: PublicSearchOptions = {}
): PublicBusiness[] {
  if (!Array.isArray(elements)) return [];
  const wantedLocation = (options.location || "").trim().toLowerCase();
  const wantedCategory = (options.category || "").trim().toLowerCase();
  const wantedQuery = (options.query || "").trim().toLowerCase();
  const limit = Math.max(1, Math.min(20, Number(options.limit) || 10));
  const seen = new Set<string>();
  const result: PublicBusiness[] = [];

  for (const item of elements as OsmElement[]) {
    if (!item || !["node", "way", "relation"].includes(item.type || "") ||
        !Number.isSafeInteger(item.id) || (item.id || 0) <= 0 || !item.tags) continue;
    const tags = item.tags;
    const businessName = typeof tags.name === "string" ? tags.name.trim().slice(0, 150) : "";
    if (!businessName) continue;
    if (!tags.shop && !tags.office && !tags.tourism && !tags.craft && !tags.amenity && !tags.healthcare) continue;
    const category = categorise(tags);
    const industry = firstTag(tags, "shop", "office", "tourism", "amenity", "craft", "healthcare") || category;
    const statedLocation = firstTag(tags, "addr:city", "addr:suburb", "addr:place", "addr:district") || "";
    if (wantedLocation && wantedLocation !== "all" &&
        !statedLocation.toLowerCase().includes(wantedLocation)) continue;
    const matchText = [businessName, category, industry, tags.description || ""].join(" ").toLowerCase();
    if (wantedCategory && wantedCategory !== "all" &&
        !category.toLowerCase().includes(wantedCategory) &&
        !industry.toLowerCase().includes(wantedCategory)) continue;
    if (wantedQuery && !matchText.includes(wantedQuery)) continue;

    const phone = firstTag(tags, "contact:phone", "phone", "contact:mobile");
    const emailCandidate = firstTag(tags, "contact:email", "email");
    const email = emailCandidate && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCandidate) ? emailCandidate : undefined;
    const website = cleanUrl(firstTag(tags, "contact:website", "website", "url"));
    const facebookUrl = cleanSocialUrl(firstTag(tags, "contact:facebook", "facebook"), "facebook");
    const instagramUrl = cleanSocialUrl(firstTag(tags, "contact:instagram", "instagram"), "instagram");
    const linkedinUrl = cleanSocialUrl(firstTag(tags, "contact:linkedin", "linkedin"), "linkedin");
    const dedupeKey = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "") + "|" + (phone || statedLocation).toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    result.push({
      businessName,
      category,
      industry,
      location: statedLocation || "Saint Lucia (district not listed)",
      description: (tags.description || industry).slice(0, 500),
      phone: phone?.slice(0, 80),
      email,
      website,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      sourceUrl: "https://www.openstreetmap.org/" + item.type + "/" + item.id
    });
    if (result.length >= limit) break;
  }
  return result;
}

// Deliberately fixed geographic bounds and endpoint: no user-supplied URL fetch,
// no authenticated social-media scraping, no CAPTCHA bypass and no paid API.
export async function discoverPublicBusinesses(options: PublicSearchOptions): Promise<PublicBusiness[]> {
  const now = Date.now();
  if (now - lastPublicRequest < 25000) {
    throw Object.assign(new Error("Public discovery has a 25-second cooldown. Please retry shortly."), { status: 429 });
  }
  lastPublicRequest = now;
  const bbox = SAINT_LUCIA_BBOX;
  const query = '[out:json][timeout:15];(' +
    'nwr["name"]["shop"](' + bbox + ');' +
    'nwr["name"]["office"](' + bbox + ');' +
    'nwr["name"]["tourism"](' + bbox + ');' +
    'nwr["name"]["craft"](' + bbox + ');' +
    'nwr["name"]["healthcare"](' + bbox + ');' +
    'nwr["name"]["amenity"~"restaurant|cafe|bar|pharmacy|clinic|doctors|dentist|bank|car_rental|marketplace"](' + bbox + ');' +
    ');out center 500;';
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    redirect: "error",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "User-Agent": "V79Digital-CRM/1.0 (public business discovery; v79sl.com)"
    },
    body: new URLSearchParams({ data: query }).toString(),
    signal: AbortSignal.timeout(18000)
  });
  if (!response.ok) throw Object.assign(new Error("Public directory provider unavailable (" + response.status + ")."), { status: 503 });
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 2_000_000) throw Object.assign(new Error("Public directory response too large."), { status: 502 });
  const body = await response.text();
  if (body.length > 2_000_000) throw Object.assign(new Error("Public directory response too large."), { status: 502 });
  const parsed: unknown = JSON.parse(body);
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { elements?: unknown }).elements)) {
    throw Object.assign(new Error("Public directory returned an invalid response."), { status: 502 });
  }
  return parsePublicBusinesses((parsed as { elements: unknown[] }).elements, options);
}
