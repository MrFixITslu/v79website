/* Consent-first GA4 for public V79 pages. No Google network requests before opt-in. */
(function () {
  "use strict";

  if (/^\/(?:admin|api)(?:\/|$)/i.test(window.location.pathname)) return;

  const STORAGE_KEY = "v79-public-analytics-consent-v1";
  const VALID_ID = /^G-[A-Z0-9]{7,15}$/;
  const ALLOWED_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const CONSENT_DENIED = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };

  let measurementId = "";
  let enabled = false;
  let currentChoice = null;
  let lastLocation = "";
  let banner = null;
  let prefsButton = null;

  function readChoice() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === "accepted" || value === "rejected" ? value : null;
    } catch {
      return null;
    }
  }

  function saveChoice(choice) {
    try { window.localStorage.setItem(STORAGE_KEY, choice); }
    catch { /* Browser storage can be disabled; no consent is assumed next visit. */ }
  }

  function cleanUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      if (url.protocol !== "https:" && url.protocol !== "http:") return "";
      const clean = new URL(url.pathname, url.origin);
      // Campaign metadata only. Never forward form contents, search values or arbitrary query strings.
      for (const name of ALLOWED_UTM) {
        const item = url.searchParams.get(name);
        if (item && /^[A-Za-z0-9][A-Za-z0-9._ -]{0,79}$/.test(item)) {
          clean.searchParams.set(name, item);
        }
      }
      return clean.href;
    } catch { return ""; }
  }

  function analyticsEvent(name, values) {
    if (!enabled || currentChoice !== "accepted" || typeof window.gtag !== "function") return;
    window.gtag("event", name, values);
  }

  function sendPageView() {
    if (!enabled || currentChoice !== "accepted") return;
    const next = cleanUrl(window.location.href);
    if (!next || next === lastLocation) return;
    const referrer = lastLocation || cleanUrl(document.referrer);
    analyticsEvent("page_view", {
      page_title: document.title,
      page_location: next,
      ...(referrer ? { page_referrer: referrer } : {})
    });
    lastLocation = next;
  }

  function installNavigationTracking() {
    if (window.__v79Ga4NavigationInstalled) return;
    window.__v79Ga4NavigationInstalled = true;
    for (const method of ["pushState", "replaceState"]) {
      const original = window.history[method];
      window.history[method] = function () {
        const result = original.apply(this, arguments);
        window.setTimeout(sendPageView, 0);
        return result;
      };
    }
    window.addEventListener("popstate", function () { window.setTimeout(sendPageView, 0); });
  }

  function startAnalytics() {
    if (enabled || !VALID_ID.test(measurementId) || currentChoice !== "accepted") return;
    enabled = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    // Set defaults before loading the Google script. Never enable advertising categories.
    window.gtag("consent", "default", CONSENT_DENIED);
    window.gtag("consent", "update", { ...CONSENT_DENIED, analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });

    installNavigationTracking();
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    script.setAttribute("data-v79-ga4", "true");
    document.head.appendChild(script);
    sendPageView();
  }

  function closeBanner() {
    if (banner) { banner.remove(); banner = null; }
  }

  function setChoice(choice) {
    const wasActive = enabled;
    currentChoice = choice;
    saveChoice(choice);
    closeBanner();
    if (prefsButton) prefsButton.setAttribute("aria-label", "Change analytics privacy choice");
    if (choice === "accepted") startAnalytics();
    else if (wasActive) {
      if (typeof window.gtag === "function") window.gtag("consent", "update", CONSENT_DENIED);
      // A previously loaded third-party script cannot safely be unloaded in place.
      window.location.reload();
    }
  }

  function createBanner() {
    if (banner || !document.body) return;
    banner = document.createElement("section");
    banner.id = "v79-ga4-consent";
    banner.className = "v79-ga4-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Optional website analytics");
    banner.innerHTML =
      '<div class="v79-ga4-copy"><strong>Optional website analytics</strong>' +
      '<p>May we use Google Analytics to understand which public pages are useful? ' +
      'It is off until you agree. Your choice will not affect access to V79 services. ' +
      '<a href="/privacy">Read our Privacy Policy</a>.</p></div>' +
      '<div class="v79-ga4-actions">' +
      '<button type="button" data-v79-choice="rejected">Reject</button>' +
      '<button type="button" data-v79-choice="accepted">Accept analytics</button></div>';
    banner.addEventListener("click", function (event) {
      const button = event.target.closest("[data-v79-choice]");
      if (!button) return;
      setChoice(button.getAttribute("data-v79-choice"));
    });
    document.body.appendChild(banner);
  }

  function createPreferencesButton() {
    if (prefsButton || !document.body) return;
    prefsButton = document.createElement("button");
    prefsButton.id = "v79-ga4-preferences";
    prefsButton.type = "button";
    prefsButton.className = "v79-ga4-preferences";
    prefsButton.textContent = "Analytics choices";
    prefsButton.setAttribute("aria-label", "Change analytics privacy choice");
    prefsButton.addEventListener("click", createBanner);
    document.body.appendChild(prefsButton);
  }

  async function initialise() {
    try {
      const response = await fetch("/api/analytics-config", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) return;
      const config = await response.json();
      if (!config || !VALID_ID.test(config.measurementId)) return;
      measurementId = config.measurementId;
    } catch {
      // No tag, cookies or consent prompt when config is absent or unavailable.
      return;
    }

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/ga4-consent.css";
    document.head.appendChild(stylesheet);

    currentChoice = readChoice();
    createPreferencesButton();
    if (currentChoice === "accepted") startAnalytics();
    else if (currentChoice === null) createBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();
