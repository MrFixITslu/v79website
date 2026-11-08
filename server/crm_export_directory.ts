import type { PublicBusiness, PublicSearchOptions } from "./crm_public_discovery";

const LISTING_URL = "https://exportsaintlucia.org/directories/";
let cached: { timestamp: number; businesses: PublicBusiness[] } | null = null;
let lastAttempt = 0;

function decodeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Math.min(1114111, Number(decimal))))
    .replace(/\s+/g, " ")
    .trim();
}

export function parseExportSaintLuciaDirectory(html: unknown): PublicBusiness[] {
  if (typeof html !== "string" || html.length > 350_000) return [];
  const sections = html.split(/<div\s+class=["'][^"']*\bcbp-item\b[^"']*\blistingdata-col\b[^"']*["'][^>]*>/i);
  const results: PublicBusiness[] = [];
  const seen = new Set<string>();
  for (const block of sections.slice(1, 501)) {
    const nameMatch = block.match(/<a\s+href=["'](https:\/\/exportsaintlucia\.org\/directories\/[a-z0-9-]+\/)["'][^>]*\bcbp-l-grid-projects-title\b[^>]*>([\s\S]*?)<\/a>/i);
    if (!nameMatch) continue;
    const businessName = decodeText(nameMatch[2]).slice(0, 150);
    if (!businessName || seen.has(businessName.toLowerCase())) continue;
    seen.add(businessName.toLowerCase());
    const address = block.match(/<p[^>]*\baddress\b[^>]*>([\s\S]*?)<\/p>/i);
    const categories = block.match(/<p[^>]*\bcategories\b[^>]*>([\s\S]*?)<\/p>/i);
    const tel = block.match(/href=["']tel:([^"']+)["']/i);
    const phone = tel ? decodeText(tel[1]).slice(0, 80) : undefined;
    const location = address ? decodeText(address[1]).slice(0, 120) : "Saint Lucia";
    const category = categories ? decodeText(categories[1]).slice(0, 150) : "Commercial Services";
    results.push({
      businessName,
      location: location || "Saint Lucia",
      category: category || "Commercial Services",
      industry: category || "Commercial Services",
      description: "Public directory listing; company needs and website not verified.",
      phone,
      sourceUrl: nameMatch[1]
    });
  }
  return results;
}

export function filterExportSaintLuciaDirectory(items: PublicBusiness[], options: PublicSearchOptions): PublicBusiness[] {
  const location = (options.location || "").trim().toLowerCase();
  const category = (options.category || "").trim().toLowerCase();
  const query = (options.query || "").trim().toLowerCase();
  const limit = Math.max(1, Math.min(20, Number(options.limit) || 10));
  return items.filter(b =>
    (!location || location === "all" || (b.location || "").toLowerCase().includes(location)) &&
    (!category || category === "all" || (b.category || "").toLowerCase().includes(category)) &&
    (!query || [b.businessName, b.category, b.description].join(" ").toLowerCase().includes(query))
  ).slice(0, limit);
}

/** Bounded user-initiated discovery from a public, explicitly allowlisted directory. */
export async function discoverExportSaintLucia(options: PublicSearchOptions): Promise<PublicBusiness[]> {
  const now = Date.now();
  if (!cached || now - cached.timestamp > 600_000) {
    if (now - lastAttempt < 25_000) {
      throw Object.assign(new Error("Please wait before refreshing the public directory."), { status: 429 });
    }
    lastAttempt = now;
    const response = await fetch(LISTING_URL, {
      method: "GET",
      redirect: "error",
      headers: { "User-Agent": "V79Digital-CRM/1.0 (+https://v79sl.com)", "Accept": "text/html" },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      throw Object.assign(new Error("Public business directory is unavailable."), { status: 503 });
    }
    if (Number(response.headers.get("content-length") || 0) > 350_000) {
      throw Object.assign(new Error("Public directory response exceeds the allowed size."), { status: 502 });
    }
    const html = await response.text();
    if (html.length > 350_000) {
      throw Object.assign(new Error("Public directory response exceeds the allowed size."), { status: 502 });
    }
    const businesses = parseExportSaintLuciaDirectory(html);
    if (!businesses.length) {
      throw Object.assign(new Error("Public directory format has changed; no records were imported."), { status: 502 });
    }
    cached = { timestamp: now, businesses };
  }
  return filterExportSaintLuciaDirectory(cached.businesses, options);
}
