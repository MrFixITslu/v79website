export interface PublicProfileContact {
  phone?: string;
  email?: string;
  website?: string;
}

const PROFILE_URL = /^https:\/\/exportsaintlucia\.org\/directories\/[a-z0-9-]+\/$/i;
const profileCache = new Map<string, PublicProfileContact>();
let lastProfileFetch = 0;

function extractContactPart(html: string): string {
  const match = /Contact Info\s*<\/h2>/i.exec(html);
  return match ? html.slice(match.index, Math.min(html.length, match.index + 5000)) : "";
}

function websiteLink(input: string | undefined): string | undefined {
  if (!input || input.length > 400) return;
  try {
    const u = new URL(input.replace(/&amp;/g, "&"));
    if (!["https:", "http:"].includes(u.protocol) || u.username || u.password || !u.hostname.includes(".")) return;
    if (u.hostname.toLowerCase() === "exportsaintlucia.org") return;
    return u.href;
  } catch { return; }
}

/** Only fields inside a business profile's Contact Info section count.
 * Site-wide footer socials/emails are intentionally ignored.
 */
export function parseExportProfileContact(html: unknown): PublicProfileContact {
  if (typeof html !== "string" || html.length > 180_000) return {};
  const text = extractContactPart(html);
  if (!text) return {};
  const phone = text.match(/fa-phone-alt[^<]*<\/i>[\s\S]{0,600}?href=["']tel:([^"'<>]+)["']/i)?.[1]?.trim();
  const emailValue = text.match(/fa-envelope[^<]*<\/i>[\s\S]{0,600}?href=["']mailto:([^"'<>]+)["']/i)?.[1]?.trim();
  const website = text.match(/fa-globe[^<]*<\/i>[\s\S]{0,600}?href=["'](https?:\/\/[^"'<>]+)["']/i)?.[1];
  const email = emailValue && /^[^\s@<>"\r\n]+@[^\s@<>"\r\n]+\.[^\s@<>"\r\n]+$/.test(emailValue) ? emailValue.slice(0, 254) : undefined;
  return { phone: phone?.slice(0, 80), email, website: websiteLink(website) };
}

export async function getExportProfileContact(sourceUrl: string): Promise<PublicProfileContact> {
  if (!PROFILE_URL.test(sourceUrl)) {
    throw Object.assign(new Error("Contact enrichment is available only for verified Export Saint Lucia profiles."), { status: 400 });
  }
  const cached = profileCache.get(sourceUrl);
  if (cached) return cached;
  const now = Date.now();
  if (now - lastProfileFetch < 3000) {
    throw Object.assign(new Error("Wait three seconds before requesting another profile."), { status: 429 });
  }
  lastProfileFetch = now;
  const response = await fetch(sourceUrl, {
    method: "GET",
    redirect: "error",
    headers: { "User-Agent": "V79Digital-CRM/1.0 (+https://v79sl.com)", "Accept": "text/html" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok || Number(response.headers.get("content-length") || 0) > 180_000) {
    throw Object.assign(new Error("The public company profile could not be read."), { status: 503 });
  }
  const html = await response.text();
  if (html.length > 180_000) {
    throw Object.assign(new Error("The public company profile is too large."), { status: 502 });
  }
  const details = parseExportProfileContact(html);
  profileCache.set(sourceUrl, details);
  if (profileCache.size > 100) profileCache.delete(profileCache.keys().next().value as string);
  return details;
}
