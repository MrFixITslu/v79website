import type { PublicBusiness, PublicSearchOptions } from "./crm_public_discovery";

/** Geoapify Places: commercial terms with attribution. Strictly server-side key.
 * No public Overpass traffic; no automated outreach.
 */
const ENDPOINT = "https://api.geoapify.com/v2/places";
const ALLOWED_CATEGORIES = ["commercial", "catering", "accommodation", "healthcare", "office"] as const;
const MAX_RESULTS = 20;
const MIN_REQUEST_INTERVAL_MS = 60_000;
/** Bounded Saint Lucia rectangle; provider's country-code filter currently responds 400. */
export const SAINT_LUCIA_SEARCH_FILTER = Object.freeze({
  type: "rect" as const,
  lon1: -61.16, lat1: 14.14, lon2: -60.85, lat2: 13.68
});
let lastRequest = 0;
let inFlight = false;

type PlaceProperties = {
  place_id?: string; name?: string; country_code?: string;
  city?: string; suburb?: string; state?: string; formatted?: string;
  categories?: unknown; website?: string; phone?: string; email?: string;
  datasource?: { raw?: Record<string, unknown> };
};

function cleanText(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanExternalUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 500) return undefined;
  try {
    const u = new URL(/^https?:\/\//i.test(value) ? value : "https://" + value);
    const host = u.hostname.toLowerCase();
    if (!["http:", "https:"].includes(u.protocol) || u.username || u.password ||
        !host.includes(".") || host === "localhost" || host.endsWith(".local") ||
        /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(host)) return undefined;
    return u.href;
  } catch {
    return undefined;
  }
}
function cleanSocial(value: unknown, domain: string): string | undefined {
  const url = cleanExternalUrl(value);
  if (!url) return undefined;
  const host = new URL(url).hostname.toLowerCase();
  return host === domain || host.endsWith("." + domain) ? url : undefined;
}
function categoryFor(categories: string[]): string {
  const cat = categories.join(",").toLowerCase();
  if (/healthcare/.test(cat)) return "Healthcare & Wellness";
  if (/catering/.test(cat)) return "Restaurant & Hospitality";
  if (/accommodation/.test(cat)) return "Hospitality & Tourism";
  if (/office/.test(cat)) return "Professional Services";
  return "Retail & Wholesale";
}
function osmReference(raw: Record<string, unknown>): string | undefined {
  const type = raw.osm_type;
  const id = raw.osm_id;
  if ((type === "node" || type === "way" || type === "relation") &&
      (typeof id === "string" || typeof id === "number") && /^[1-9]\d{0,17}$/.test(String(id))) {
    return "https://www.openstreetmap.org/" + type + "/" + id;
  }
  return undefined;
}

/** Pure transformation for isolated fixture testing; no unauthenticated fetching. */
export function parseGeoapifyPlaces(payload: unknown, options: PublicSearchOptions = {}): PublicBusiness[] {
  const data = payload as { features?: unknown };
  if (!data || !Array.isArray(data.features)) return [];
  const allowed = Math.max(1, Math.min(MAX_RESULTS, Number(options.limit) || 10));
  const query = cleanText(options.query, 100).toLowerCase();
  const location = cleanText(options.location, 80).toLowerCase();
  const category = cleanText(options.category, 80).toLowerCase();
  const seen = new Set<string>();
  const result: PublicBusiness[] = [];
  for (const feature of data.features) {
    if (!feature || typeof feature !== "object") continue;
    const props = (feature as { properties?: PlaceProperties }).properties;
    if (!props || typeof props !== "object") continue;
    if (cleanText(props.country_code, 3).toLowerCase() !== "lc") continue;
    const businessName = cleanText(props.name, 150);
    if (!businessName) continue;
    const raw = props.datasource?.raw && typeof props.datasource.raw === "object" ? props.datasource.raw : {};
    const categories = Array.isArray(props.categories) ? props.categories.filter((v): v is string => typeof v === "string") : [];
    const group = categoryFor(categories);
    const industry = cleanText(categories[0], 100) || group;
    const place = cleanText(props.city || props.suburb || props.state || props.formatted, 150) || "Saint Lucia";
    if (query && ![businessName,group,industry].join(" ").toLowerCase().includes(query)) continue;
    if (location && location !== "all" && !place.toLowerCase().includes(location)) continue;
    if (category && category !== "all" &&
        !group.toLowerCase().includes(category) && !industry.toLowerCase().includes(category)) continue;
    const normalized = businessName.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const website = cleanExternalUrl(props.website || raw.website || raw["contact:website"]);
    const phone = cleanText(props.phone || raw.phone || raw["contact:phone"], 80);
    const email = cleanText(props.email || raw.email || raw["contact:email"], 200);
    const sourceUrl = osmReference(raw) || "https://www.geoapify.com/places-api/";
    result.push({
      businessName,
      category: group,
      industry,
      location: place,
      description: cleanText(props.formatted, 350),
      website, phone: phone || undefined, email: email || undefined,
      facebookUrl: cleanSocial(raw.facebook || raw["contact:facebook"], "facebook.com"),
      instagramUrl: cleanSocial(raw.instagram || raw["contact:instagram"], "instagram.com"),
      linkedinUrl: cleanSocial(raw.linkedin || raw["contact:linkedin"], "linkedin.com"),
      sourceUrl
    });
    if (result.length >= allowed) break;
  }
  return result;
}

export function geoapifyReady(): boolean {
  return process.env.CRM_GEOAPIFY_DISCOVERY_ENABLED === "true" &&
    !!process.env.GEOAPIFY_API_KEY?.trim();
}

export async function discoverGeoapifyBusinesses(options: PublicSearchOptions = {}): Promise<PublicBusiness[]> {
  const key = process.env.GEOAPIFY_API_KEY?.trim();
  if (!geoapifyReady() || !key) throw Object.assign(new Error("Geoapify discovery needs an enabled server-side API key."), { status: 503 });
  if (inFlight || Date.now() - lastRequest < MIN_REQUEST_INTERVAL_MS) {
    throw Object.assign(new Error("Please wait at least one minute between external searches."), { status: 429 });
  }
  inFlight = true;
  lastRequest = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key },
        body: JSON.stringify({
          categories: [...ALLOWED_CATEGORIES],
          filter: SAINT_LUCIA_SEARCH_FILTER,
          limit: Math.max(1, Math.min(MAX_RESULTS, Number(options.limit) || 10)),
          lang: "en"
        }),
        signal: controller.signal
      });
      if (response.status === 429) throw Object.assign(new Error("Provider usage limit reached."), { status: 429 });
      if (response.status === 401 || response.status === 403) throw Object.assign(new Error("Geoapify API key is not authorised."), { status: 503 });
      if (!response.ok) throw Object.assign(new Error("External business lookup is temporarily unavailable."), { status: 502 });
      const bytes = await response.text();
      if (bytes.length > 1_000_000) throw Object.assign(new Error("Provider response is too large."), { status: 502 });
      return parseGeoapifyPlaces(JSON.parse(bytes), options);
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw Object.assign(new Error("External business lookup timed out."), { status: 502 });
    throw err;
  } finally {
    inFlight = false;
  }
}
