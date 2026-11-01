import crypto from "node:crypto";

const encode = (bytes: Buffer) => bytes.toString("base64url");
const sha = (value: string) => crypto.createHash("sha256").update(value).digest("base64url");

/** Each flow is tied to a site-only HttpOnly browser cookie and never reused. */
export function createHubSsoFlows({ clock = Date.now, capacity = 500 } = {}) {
  const pending = new Map<string, { verifier: string; browserHash: string; expires: number }>();
  function prune() {
    for (const [key, value] of pending) if (value.expires <= clock()) pending.delete(key);
    while (pending.size >= capacity) pending.delete(pending.keys().next().value!);
  }
  function begin() {
    prune();
    const state = encode(crypto.randomBytes(24));
    const verifier = encode(crypto.randomBytes(32));
    const browser = encode(crypto.randomBytes(24));
    pending.set(state, { verifier, browserHash: sha(browser), expires: clock() + 120_000 });
    return { state, browser, challenge: sha(verifier) };
  }
  function consume(state: unknown, browser: unknown) {
    prune();
    if (typeof state !== "string" || typeof browser !== "string" ||
        !/^[A-Za-z0-9_-]{32}$/.test(state) || !/^[A-Za-z0-9_-]{32}$/.test(browser)) return null;
    const item = pending.get(state);
    if (!item) return null;
    pending.delete(state);
    const stored = Buffer.from(item.browserHash), received = Buffer.from(sha(browser));
    if (stored.length !== received.length || !crypto.timingSafeEqual(stored, received)) return null;
    return item.verifier;
  }
  return { begin, consume };
}

/** Only the one configured Hub host, or the explicitly allowed Docker DNS name. */
export function hubBackchannelUrl(raw: string): URL {
  const url = new URL(raw);
  const external = url.protocol === "https:" && url.hostname === "hub.v79sl.com" && !url.port;
  const internal = url.protocol === "http:" && url.hostname === "v79-hub" && url.port === "3000";
  if ((!external && !internal) || url.username || url.password || url.pathname !== "/" ||
      url.search || url.hash) throw Error("Invalid Hub SSO backchannel origin");
  return url;
}
