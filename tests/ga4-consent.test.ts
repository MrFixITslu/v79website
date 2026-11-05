import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "public/ga4-consent.js"), "utf8");

function browser(initialChoice: string | null = null, initialPath = "/") {
  const storage = new Map<string, string>();
  if (initialChoice) storage.set("v79-public-analytics-consent-v1", initialChoice);
  const scripts: any[] = [];
  const onWindow: Record<string, Function> = {};
  const onDocument: Record<string, Function> = {};
  const buttons: Record<string, any> = {};
  let panel: any = null;
  const doc: any = {
    readyState: "complete",
    title: "V79 Digital test",
    cookie: "",
    head: { appendChild(node: any) { scripts.push(node); } },
    body: { appendChild(node: any) { panel = node; } },
    addEventListener(name: string, cb: Function) { onDocument[name] = cb; },
    createElement(name: string) {
      return {
        tag: name,
        style: {},
        hidden: false,
        setAttribute() {},
        querySelector(selector: string) {
          if (!buttons[selector]) {
            buttons[selector] = {
              addEventListener(_name: string, handler: Function) { this.handler = handler; },
              handler: () => {},
            };
          }
          return buttons[selector];
        },
      };
    },
  };
  const location: any = { pathname: initialPath, search: "", hostname: "v79sl.com" };
  const window: any = {
    location,
    dataLayer: undefined,
    localStorage: {
      getItem(key: string) { return storage.get(key) ?? null; },
      setItem(key: string, value: string) { storage.set(key, value); },
    },
    history: {
      pushState(_data: unknown, _title: string, url: string) {
        const parsed = new URL(url, "https://v79sl.com");
        location.pathname = parsed.pathname;
        location.search = parsed.search;
      },
    },
    setTimeout(fn: Function) { fn(); },
    addEventListener(name: string, cb: Function) { onWindow[name] = cb; },
  };
  vm.runInNewContext(source, { window, document: doc, URLSearchParams, Date, console });
  return { window, doc, storage, scripts, onWindow, onDocument, buttons, getPanel: () => panel };
}

function events(b: ReturnType<typeof browser>, name: string) {
  return Array.from(b.window.dataLayer || []).map((v: any) => Array.from(v)).filter((args: any[]) => args[0] === name);
}

test("GA4 is not loaded without opt-in and rejection persists", () => {
  const b = browser();
  assert.ok(b.getPanel(), "Consent preferences should be visible");
  assert.equal(b.scripts.length, 0, "Google script must not load before consent");
  assert.equal(events(b, "consent")[0][1], "default");
  assert.equal(events(b, "consent")[0][2].analytics_storage, "denied");
  b.buttons['[data-v79-ga4-choice="reject"]'].handler();
  assert.equal(b.storage.get("v79-public-analytics-consent-v1"), "denied");
  assert.equal(b.scripts.length, 0);
  assert.equal(events(b, "event").length, 0);
});

test("opt-in loads GA4 exactly once, allows revocation, and excludes private URL params", () => {
  const b = browser();
  b.buttons['[data-v79-ga4-choice="accept"]'].handler();
  assert.equal(b.storage.get("v79-public-analytics-consent-v1"), "granted");
  assert.equal(b.scripts.length, 1);
  assert.match(b.scripts[0].src, /G-51J5TCR1PM$/);
  assert.equal(events(b, "config")[0][1], "G-51J5TCR1PM");
  assert.equal(events(b, "config")[0][2].send_page_view, false);
  assert.equal(events(b, "event").length, 1);
  b.window.history.pushState({}, "", "/solutions?utm_source=linkedin&password=sensitive");
  const pages = events(b, "event");
  assert.equal(pages.length, 2);
  assert.equal(pages[1][2].page_location, "https://v79sl.com/solutions?utm_source=linkedin");
  assert.equal(b.scripts.length, 1);
  b.onDocument.click({
    target: { closest: (q: string) => q === "[data-v79-ga4-preferences]" ? {} : null },
    preventDefault() {},
  });
  b.buttons['[data-v79-ga4-choice="reject"]'].handler();
  assert.equal(b.storage.get("v79-public-analytics-consent-v1"), "denied");
  b.window.history.pushState({}, "", "/services");
  assert.equal(events(b, "event").length, 2, "No page views after revocation");
});

test("existing grant loads once; saved rejection and private admin do not load GA4", () => {
  const consented = browser("granted", "/products/tiquet.html");
  assert.equal(consented.scripts.length, 1);
  assert.equal(events(consented, "event").length, 1);
  const rejected = browser("denied");
  assert.equal(rejected.scripts.length, 0);
  assert.equal(rejected.getPanel(), null);
  const admin = browser("granted", "/admin");
  assert.equal(admin.scripts.length, 0);
  assert.equal(admin.window.dataLayer, undefined);
});
