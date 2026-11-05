/* V79 public-site GA4: basic consent mode, no Google tag before explicit opt-in. */
(() => {
  "use strict";

  const measurementId = "G-51J5TCR1PM";
  const storageKey = "v79-public-analytics-consent-v1";
  const domain = "https://v79sl.com";

  if (!/^G-[A-Z0-9]{8,15}$/.test(measurementId)) return;
  if (/^\/admin(?:\/|$)/i.test(window.location.pathname)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const denied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };

  // Set privacy defaults synchronously before any analytics library loads.
  window.gtag("consent", "default", denied);
  window.gtag("set", "allow_google_signals", false);
  window.gtag("set", "allow_ad_personalization_signals", false);

  let consent = null;
  let loaded = false;
  let lastPage = "";
  let panel = null;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "granted" || saved === "denied") consent = saved;
  } catch { /* Private browsing or blocked storage: require a new choice. */ }

  function safePage() {
    const pathname = window.location.pathname || "/";
    if (/^\/admin(?:\/|$)/i.test(pathname)) return null;
    const query = new URLSearchParams(window.location.search);
    const safe = new URLSearchParams();
    for (const key of ["article", "utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const value = query.get(key);
      if (value && /^[A-Za-z0-9_-]{1,80}$/.test(value)) safe.set(key, value);
    }
    const suffix = safe.toString();
    return pathname + (suffix ? "?" + suffix : "");
  }

  function trackPage() {
    if (consent !== "granted" || !loaded) return;
    const page = safePage();
    if (!page || page === lastPage) return;
    lastPage = page;
    window.gtag("event", "page_view", {
      page_location: domain + page,
      page_path: page.split("?")[0],
      page_title: document.title,
    });
  }

  function enableAnalytics() {
    if (loaded) return;
    loaded = true;
    window.gtag("consent", "update", { ...denied, analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    document.head.appendChild(script);
    trackPage();
  }

  function clearGaCookies() {
    try {
      const names = (document.cookie || "")
        .split(";")
        .map((x) => x.trim().split("=")[0])
        .filter((x) => /^_ga(?:_|$)|^_gid$|^_gat/.test(x));
      for (const name of names) {
        for (const host of ["", "; domain=.v79sl.com", "; domain=v79sl.com"]) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + host + "; SameSite=Lax; Secure";
        }
      }
    } catch { /* Browser controls may block cookie access. */ }
  }

  function setConsent(allow) {
    consent = allow ? "granted" : "denied";
    try { window.localStorage.setItem(storageKey, consent); } catch {}
    if (allow) {
      enableAnalytics();
    } else {
      window.gtag("consent", "update", denied);
      clearGaCookies();
    }
    if (panel) panel.hidden = true;
  }

  function showPreferences() {
    if (panel) {
      panel.hidden = false;
      return;
    }
    panel = document.createElement("section");
    panel.id = "v79-analytics-preferences";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "Optional analytics preferences");
    panel.style.cssText = "position:fixed;bottom:16px;left:16px;z-index:2147483000;" +
      "box-sizing:border-box;width:min(540px,calc(100vw - 32px));max-height:calc(100vh - 32px);" +
      "overflow:auto;border:1px solid #a9d0ca;border-radius:16px;padding:22px;" +
      "background:#ffffff;color:#16323b;box-shadow:0 12px 44px rgba(8,35,45,.22);" +
      "font:14px/1.6 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
    panel.innerHTML =
      '<h2 style="font-size:18px;margin:0 0 8px;font-weight:750;color:#11313b">Help improve V79 Digital</h2>' +
      '<p style="margin:0 0 15px">May we use optional Google Analytics to understand visits to our public pages? ' +
      'No advertising tracking is enabled. You can change your choice at any time. ' +
      '<a href="/privacy" style="color:#006e69;text-decoration:underline">Privacy details</a>.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px">' +
      '<button type="button" data-v79-ga4-choice="accept" style="border:1px solid #087b77;background:#087b77;' +
      'color:#fff;border-radius:9px;padding:10px 17px;font:inherit;font-weight:700;cursor:pointer">Allow analytics</button>' +
      '<button type="button" data-v79-ga4-choice="reject" style="border:1px solid #8aa8a7;background:#fff;' +
      'color:#19363c;border-radius:9px;padding:10px 17px;font:inherit;font-weight:700;cursor:pointer">Reject analytics</button>' +
      '</div>';
    panel.querySelector('[data-v79-ga4-choice="accept"]').addEventListener("click", () => setConsent(true));
    panel.querySelector('[data-v79-ga4-choice="reject"]').addEventListener("click", () => setConsent(false));
    document.body.appendChild(panel);
  }

  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const prior = safePage();
    const result = originalPushState.apply(this, args);
    if (safePage() !== prior) window.setTimeout(trackPage, 0);
    return result;
  };
  window.addEventListener("popstate", () => window.setTimeout(trackPage, 0));

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target && typeof target.closest === "function" &&
      target.closest("[data-v79-ga4-preferences]")) {
      event.preventDefault();
      showPreferences();
    }
  });

  function initialise() {
    if (consent === "granted") enableAnalytics();
    else if (consent === null) showPreferences();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
  else initialise();
})();
