import rateLimit, { type Options } from "express-rate-limit";

const CLOUD_RUN_SAFE_PROXY_RANGES = ["loopback", "linklocal", "uniquelocal"];
const UNSAFE_PROXY_TOKENS = new Set(["true", "false", "*", "all"]);

export function resolveTrustProxy(env: Record<string, string | undefined> = process.env): string[] | false {
  const raw = String(env.TRUSTED_PROXIES || "").trim();
  if (raw) {
    const parsed = raw
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0 && !UNSAFE_PROXY_TOKENS.has(entry.toLowerCase()));
    if (parsed.length > 0) {
      return parsed;
    }
  }

  if (env.K_SERVICE || env.K_REVISION || env.CLOUD_RUN_JOB) {
    return [...CLOUD_RUN_SAFE_PROXY_RANGES];
  }

  return false;
}

export function createRateLimiter(options: Partial<Options> = {}) {
  const validate =
    typeof options.validate === "boolean"
      ? options.validate
      : {
          xForwardedForHeader: false,
          ...(options.validate || {}),
        };

  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
    validate,
  });
}
