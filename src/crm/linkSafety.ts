/** Safe client-side links for untrusted imported/public business records. */
export function safeExternalLink(input?: string): string | undefined {
  if (!input || typeof input !== "string" || input.length > 500) return;
  try {
    const raw = input.trim();
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    if (!["https:", "http:"].includes(u.protocol) || u.username || u.password) return;
    const hostname = u.hostname.toLowerCase();
    if (!hostname.includes(".") || hostname === "localhost" || hostname.endsWith(".local") ||
        hostname.startsWith("127.") || hostname.startsWith("10.") || hostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
        hostname.startsWith("169.254.") || hostname === "[::1]") return;
    return u.href;
  } catch {
    return;
  }
}

export function safeSocialLink(input: string | undefined, provider: "facebook" | "instagram" | "linkedin"): string | undefined {
  const link = safeExternalLink(input);
  if (!link) return;
  const domain = new URL(link).hostname.toLowerCase();
  const allowed = provider === "facebook" ? ["facebook.com", "fb.com"] :
    provider === "instagram" ? ["instagram.com"] : ["linkedin.com"];
  return allowed.some(value => domain === value || domain.endsWith("." + value)) ? link : undefined;
}

export function safeEmail(input?: string): string | undefined {
  if (typeof input !== "string" || input.length > 254) return;
  const email = input.trim();
  return /^[^\s@<>"\r\n]+@[^\s@<>"\r\n]+\.[^\s@<>"\r\n]+$/.test(email) ? email : undefined;
}
