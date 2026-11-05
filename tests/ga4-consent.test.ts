import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const script = fs.readFileSync("public/ga4-consent.js", "utf8");

type MockNode = {
  id: string; src: string; rel: string; href: string; innerHTML: string;
  removed: boolean; handlers: Record<string, (event: any) => void>;
  attributes: Record<string, string>; addEventListener: (name: string, fn: (event: any) => void) => void;
  setAttribute: (key: string, value: string) => void; remove: () => void;
};

function mockNode(): MockNode {
  return {
    id: "", src: "", rel: "", href: "", innerHTML: "", removed: false, handlers: {}, attributes: {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    setAttribute(key, value) { this.attributes[key] = value; },
    remove() { this.removed = true; },
  };
}

async function harness(config: { measurementId?: string } = {}, startingChoice: string | null = null, pathname = "/") {
  const head: MockNode[] = [], body: MockNode[] = [], storage = new Map<string, string>();
  if (startingChoice) storage.set("v79-public-analytics-consent-v1", startingChoice);
  let calls = 0, reloaded = 0;
  const win: any = {
    location: { pathname, href: "https://v79sl.com" + pathname, reload() { reloaded++; } },
    localStorage: {
      getItem(key: string) { return storage.get(key) || null; },
      setItem(key: string, value: string) { storage.set(key, value); },
    },
    history: {
      pushState() {},
      replaceState() {},
    },
    addEventListener() {},
    setTimeout(fn: () => void) { fn(); },
  };
  const doc = {
    readyState: "complete",
    title: "V79 Website",
    referrer: "",
    head: { appendChild(el: MockNode) { head.push(el); } },
    body: { appendChild(el: MockNode) { body.push(el); } },
    createElement() { return mockNode(); },
    addEventListener() {},
  };
  const context = {
    window: win, document: doc, URL, Date,
    fetch: async () => { calls++; return { ok: true, json: async () => config }; },
    console,
  };
  vm.runInNewContext(script, context, { timeout: 1500 });
  await new Promise(resolve => setImmediate(resolve));
  return {
    win, head, body, storage, calls, get reloaded() { return reloaded; },
    banner() { return body.find(x => x.id === "v79-ga4-consent" && !x.removed); },
    consent(choice: string) {
      const b = this.banner();
      assert.ok(b, "Consent banner must exist");
      b.handlers.click({ target: { closest() { return { getAttribute() { return choice; } }; } } });
    },
    analyticsTags() { return head.filter(x => x.src.includes("googletagmanager.com")); },
    events() { return (win.dataLayer || []).map((args: IArguments) => Array.from(args)); },
  };
}

test("unknown web stream ID disables GA4 completely", async () => {
  const c = await harness({ measurementId: "" });
  assert.equal(c.calls, 1);
  assert.equal(c.analyticsTags().length, 0);
  assert.equal(c.banner(), undefined);
});

test("numeric GA4 property ID cannot masquerade as the measurement ID", async () => {
  const c = await harness({ measurementId: "253849581" });
  assert.equal(c.analyticsTags().length, 0);
  assert.equal(c.banner(), undefined);
});

test("admin screen never fetches analytics configuration", async () => {
  const c = await harness({ measurementId: "G-TEST123456" }, null, "/admin");
  assert.equal(c.calls, 0);
  assert.equal(c.analyticsTags().length, 0);
});

test("anonymous visitor cannot be measured before explicit opt-in", async () => {
  const c = await harness({ measurementId: "G-TEST123456" });
  assert.ok(c.banner(), "A choice must be shown");
  assert.equal(c.analyticsTags().length, 0);
  assert.equal(c.events().length, 0);
  c.consent("rejected");
  assert.equal(c.analyticsTags().length, 0);
  assert.equal(c.events().length, 0);
  assert.equal(c.storage.get("v79-public-analytics-consent-v1"), "rejected");
});

test("acceptance loads one tag and records one manual page view", async () => {
  const c = await harness({ measurementId: "G-TEST123456" });
  c.consent("accepted");
  assert.equal(c.analyticsTags().length, 1);
  assert.equal(c.storage.get("v79-public-analytics-consent-v1"), "accepted");
  const rows = c.events();
  assert.equal(rows.filter((r: any[]) => r[0] === "config").length, 1);
  assert.equal(rows.find((r: any[]) => r[0] === "config")[2].send_page_view, false);
  assert.equal(rows.find((r: any[]) => r[0] === "config")[2].page_location, "https://v79sl.com/");
  assert.equal(rows.find((r: any[]) => r[0] === "config")[2].allow_ad_personalization_signals, false);
  assert.equal(rows.filter((r: any[]) => r[0] === "event" && r[1] === "page_view").length, 1);
  const consent = rows.filter((r: any[]) => r[0] === "consent");
  assert.equal(consent[0][2].analytics_storage, "denied");
  assert.equal(consent[1][2].analytics_storage, "granted");
  assert.equal(consent[1][2].ad_personalization, "denied");

  c.win.location.href = "https://v79sl.com/solutions?email=private%40example.com&utm_source=facebook";
  c.win.history.pushState({}, "", "/solutions");
  const after = c.events().filter((r: any[]) => r[0] === "event" && r[1] === "page_view");
  assert.equal(after.length, 2, "One page view for the SPA navigation");
  assert.equal(after[1][2].page_location, "https://v79sl.com/solutions?utm_source=facebook");
  c.win.history.replaceState({}, "", "/solutions");
  assert.equal(c.events().filter((r: any[]) => r[0] === "event" && r[1] === "page_view").length, 2, "No double counts");
});

test("rejection after acceptance revokes consent and reloads to unload the tag", async () => {
  const c = await harness({ measurementId: "G-TEST123456" }, "accepted");
  assert.equal(c.analyticsTags().length, 1);
  const prefs = c.body.find(x => x.id === "v79-ga4-preferences");
  assert.ok(prefs);
  prefs.handlers.click({});
  c.consent("rejected");
  assert.equal(c.reloaded, 1);
  assert.equal(c.events().filter((r: any[]) => r[0] === "consent").at(-1)[2].analytics_storage, "denied");
});
