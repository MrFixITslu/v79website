/* Narrow navigation bridge: keeps the Resources card and share links on the
   canonical interactive post. Normal V79 navigation is unaffected. */
(() => {
  "use strict";
  const TARGET = "chatgpt-task-automation";
  const CANONICAL = "/resources?article=" + TARGET;
  const matches = value => {
    if (value == null) return false;
    try {
      const u = new URL(String(value), window.location.href);
      return u.origin === window.location.origin &&
        u.searchParams.get("article") === TARGET &&
        (u.pathname === "/" || u.pathname === "/resources");
    } catch {
      return false;
    }
  };
  const originalPushState = window.history.pushState;
  window.history.pushState = function(state, unused, url) {
    if (matches(url)) {
      window.location.assign(CANONICAL);
      return;
    }
    // The six remaining Resources cards use the same canonical interactive lesson URLs.
    if (url != null) {
      try {
        const u = new URL(String(url), window.location.href);
        const slugs = ["cybersecurity-best-practices", "importance-of-cloud-backups", "migrating-to-microsoft-365", "how-to-choose-it-support-saint-lucia", "digital-transformation-and-telecoms-saint-lucia", "network-design-and-implementation-caribbean"];
        const id=u.searchParams.get("article");
        if (u.origin===window.location.origin && slugs.includes(id) &&
            (u.pathname==="/" || u.pathname==="/resources")) {
          window.location.assign("/resources/"+id+".html");
          return;
        }
      } catch {}
    }
    if (url != null) {
      try {
        const u = new URL(String(url), window.location.href);
        if (u.origin === window.location.origin && u.searchParams.get("article") === "chatgpt-skills-how-to" &&
            (u.pathname === "/" || u.pathname === "/resources")) {
          window.location.assign("/resources/chatgpt-skills-how-to.html");
          return;
        }
      } catch {}
    }
    return originalPushState.apply(this, arguments);
  };
  // After rapid site releases, browser back/forward cache can restore an
  // older in-memory webpage even when HTML is served with no-store.
  window.addEventListener("pageshow", event => {
    if (event.persisted) window.location.reload();
  });
})();
