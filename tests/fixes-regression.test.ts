import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repo = process.cwd();

function collectFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

test("src/ contains zero blocking browser dialog or popup calls", () => {
  const srcFiles = collectFiles(path.join(repo, "src"));
  assert.ok(srcFiles.length > 0, "Expected source files under src/");
  const forbidden = /window\.(alert|confirm|open)\(|\balert\(|\bconfirm\(/;
  const matches: string[] = [];
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, "utf8");
    if (forbidden.test(content)) {
      matches.push(path.relative(repo, file));
    }
  }
  assert.deepEqual(matches, [], `Forbidden browser dialogs found in: ${matches.join(", ")}`);
});

test("CRMStorage.deleteLead cascades related records and getMetrics excludes archived/orphaned tasks", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "v79-crm-regression-"));
  try {
    const script = `
      import assert from "node:assert/strict";
      import { CRMStorage } from ${JSON.stringify(path.join(repo, "server/crm_storage.ts"))};

      const storage = new CRMStorage();
      const first = storage.addLead({
        name: "Cascade Lead",
        company: "Cascade Co",
        email: "cascade@example.test",
        phone: "7585550101",
        estimatedValue: 4000
      }).lead;
      const second = storage.addLead({
        name: "Archived Lead",
        company: "Archived Co",
        email: "archived@example.test",
        phone: "7585550202",
        estimatedValue: 3000
      }).lead;

      storage.addCall({
        leadId: first.id,
        caller: "Admin",
        outcome: "Interested",
        notes: "Follow up tomorrow"
      });
      const pastDue = new Date(Date.now() - 86400000).toISOString();
      storage.addTask({
        leadId: first.id,
        title: "Call back cascade lead",
        dueAt: pastDue,
        priority: "High",
        status: "pending",
        type: "call",
        assignedTo: "Admin"
      });
      storage.addTask({
        leadId: second.id,
        title: "Call back archived lead",
        dueAt: pastDue,
        priority: "Medium",
        status: "pending",
        type: "call",
        assignedTo: "Admin"
      });

      assert.equal(storage.getMetrics().followUpsDue, 2);

      // Archiving second lead excludes its tasks from followUpsDue
      storage.archiveLead(second.id, "Admin");
      assert.equal(storage.getMetrics().totalLeads, 1);
      assert.equal(storage.getMetrics().followUpsDue, 1);

      // Deleting first lead cascades activities, calls, and tasks
      const deleted = storage.deleteLead(first.id);
      assert.equal(deleted, true);
      assert.equal(storage.getLeadById(first.id), null);
      assert.equal(storage.getActivities(first.id).length, 0);
      assert.equal(storage.getCalls(first.id).length, 0);
      assert.equal(storage.getTasks(first.id).length, 0);
      assert.equal(storage.getMetrics().totalLeads, 0);
      assert.equal(storage.getMetrics().followUpsDue, 0);
    `;
    const result = spawnSync(
      process.execPath,
      ["--import", path.join(repo, "node_modules/tsx/dist/loader.mjs"), "--input-type=module", "-e", script],
      { cwd: tmp, env: { ...process.env, ENCRYPTION_KEY: "c".repeat(64) }, encoding: "utf8" }
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("reading-material course slug resolution and CRM lead merge without :id param", { timeout: 25000 }, async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "v79-server-regression-"));
  fs.mkdirSync(path.join(tmp, "data"), { recursive: true });

  const readingCourse = {
    id: 91,
    name: "Cloud Hygiene Essentials",
    category: "courses",
    price: 0,
    pricingType: "free",
    curriculum: JSON.stringify([
      {
        title: "Module 1",
        lectures: [
          {
            id: "read1",
            title: "Written Checklist",
            readingMaterial: "Verify MFA, offline backups, and least-privilege roles."
          }
        ]
      }
    ]),
    exam: JSON.stringify([
      {
        question: "Which backup approach protects against ransomware?",
        options: ["Local-only copy", "Immutable offline backups"],
        correctAnswer: 1
      }
    ])
  };
  fs.writeFileSync(path.join(tmp, "data/vision79_saas.json"), JSON.stringify([readingCourse]));

  const port = 38500 + Math.floor(Math.random() * 4000);
  const base = `http://127.0.0.1:${port}`;
  const adminPassword = "Initial-regression-password-123!";
  const env = {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    CLIENT_DIST: path.join(repo, "dist/client"),
    CANONICAL_DOMAIN: base,
    CAPTCHA_MODE: "disabled",
    ADMIN_PASSWORD: adminPassword,
    ADMIN_RESET_TOKEN: "",
    ENCRYPTION_KEY: crypto.randomBytes(32).toString("hex"),
    GEMINI_API_KEY: ""
  };

  let logs = "";
  const child = spawn(process.execPath, [path.join(repo, "dist/server/server.cjs")], {
    cwd: tmp,
    env,
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout!.on("data", (d) => (logs += d));
  child.stderr!.on("data", (d) => (logs += d));

  async function waitReady() {
    for (let i = 0; i < 200; i++) {
      try {
        if ((await fetch(base + "/api/ready")).ok) return;
      } catch {}
      if (child.exitCode !== null) throw new Error(logs);
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error("Server startup timeout: " + logs);
  }

  class Client {
    cookie = "";
    async call(url: string, method = "GET", body?: unknown) {
      const r = await fetch(base + url, {
        method,
        headers: {
          Origin: base,
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(this.cookie ? { Cookie: this.cookie } : {})
        },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const c = r.headers.get("set-cookie");
      if (c) this.cookie = c.split(";")[0];
      const text = await r.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {}
      return { status: r.status, data, text };
    }
  }

  try {
    await waitReady();
    const admin = new Client();
    const student = new Client();

    // Admin login & forced password rotation
    assert.equal((await admin.call("/api/admin/login", "POST", { password: adminPassword })).status, 200);
    assert.equal(
      (
        await admin.call("/api/admin/change-password", "POST", {
          currentPassword: adminPassword,
          newPassword: "Updated-regression-password-456!"
        })
      ).status,
      200
    );

    // Reading-material course is complete & accessible via slug route and student slug endpoint
    const coursePage = await student.call("/course/cloud-hygiene-essentials");
    assert.equal(coursePage.status, 200);

    const reg = await student.call("/api/student/register", "POST", {
      name: "Slug Tester",
      email: "slug-tester@example.test",
      password: "Learner-regression-123!"
    });
    assert.equal(reg.status, 201);

    const bySlug = await student.call("/api/student/courses/cloud-hygiene-essentials");
    assert.equal(bySlug.status, 200);
    assert.equal(bySlug.data.course.id, 91);

    // CRM merge endpoint works without :id route parameter
    const primaryRes = await admin.call("/api/admin/crm/leads", "POST", {
      name: "Primary Contact",
      company: "Harbor Logistics",
      email: "primary@harbor.test",
      phone: "7585551111"
    });
    assert.equal(primaryRes.status, 201);
    const primaryId = primaryRes.data.lead?.id ?? primaryRes.data.id;

    const dupRes = await admin.call("/api/admin/crm/leads", "POST", {
      name: "Duplicate Contact",
      company: "Harbor Logistics Ltd",
      email: "dup@harbor.test",
      phone: "7585552222",
      message: "Extra detail from second submission"
    });
    assert.equal(dupRes.status, 201);
    const dupId = dupRes.data.lead?.id ?? dupRes.data.id;

    const mergeRes = await admin.call("/api/admin/crm/leads/merge", "POST", {
      primaryLeadId: primaryId,
      duplicateLeadId: dupId
    });
    assert.equal(mergeRes.status, 200);
    assert.ok(String(mergeRes.data.adminNotes || "").includes("Extra detail from second submission"));

    const activeLeads = await admin.call("/api/admin/crm/leads");
    const list = Array.isArray(activeLeads.data) ? activeLeads.data : activeLeads.data.leads;
    assert.equal(list.some((l: any) => l.id === dupId), false, "Merged duplicate must be archived");
    assert.equal(list.some((l: any) => l.id === primaryId), true, "Primary lead must remain active");
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill();
      await new Promise((r) => child.once("exit", r));
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("hero removes Saint Lucia roots pill, theme removes visible Appearance label, and primary CTA matches teal", () => {
  const themeJs = fs.readFileSync(path.join(repo, "src/redesign/theme.js"), "utf8");
  assert.equal(themeJs.includes("v79-appearance-label"), false, "Visible Appearance label span should be removed from theme.js");

  const websiteDesign = fs.readFileSync(path.join(repo, "shared/website-design.ts"), "utf8");
  assert.equal(websiteDesign.includes("SAINT LUCIA ROOTS"), false, "SAINT LUCIA ROOTS kicker should be removed from homepage");
  assert.equal(websiteDesign.includes('class="hero-kicker"'), false, "hero-kicker element should be removed from homepage");

  const hybridHome = fs.readFileSync(path.join(repo, "src/components/HybridHomePage.tsx"), "utf8");
  assert.equal(hybridHome.includes("Saint Lucia roots"), false, "Saint Lucia roots badge should be removed from HybridHomePage");

  const publicCss = fs.readFileSync(path.join(repo, "src/redesign/public.css"), "utf8");
  assert.ok(publicCss.includes(".assist-hero .assist-primary{background:#087f86"), "Hero CTA should use V79 teal");
});

test("Software & Apps cards use local icons and only privacy-reviewed previews", () => {
  const websiteDesignPath = path.join(repo, "shared/website-design.ts");
  const rawDesign = fs.readFileSync(websiteDesignPath, "utf8");
  const pagesLine = rawDesign.split("\n")[2];
  const PAGES = JSON.parse(pagesLine.slice("export const PAGES: Record<string,string> = ".length, -1));

  const apps = [
    { slug: "hub", icon: "/design-assets/apps/hub-icon.png", favicon: "/design-assets/apps/hub-icon.png" },
    { slug: "tiquet", icon: "/design-assets/apps/tiquet-icon.png", favicon: "/design-assets/apps/tiquet-icon.png" },
    { slug: "pos", icon: "/design-assets/apps/pos-icon.png", favicon: "/design-assets/apps/pos-favicon.png" },
    { slug: "ffpro", icon: "/design-assets/apps/ffpro-icon.png", favicon: "/design-assets/apps/ffpro-icon.png" },
    { slug: "marketing", icon: "/design-assets/apps/marketing-icon.png", favicon: "/design-assets/apps/marketing-icon.png" },
    { slug: "academy", icon: "/design-assets/apps/academy-icon.png", favicon: "/design-assets/apps/academy-icon.png" },
  ];

  // Home page product-grid must use local Hub icons, not broken external GitHub raw links
  assert.equal(PAGES["/"].includes("raw.githubusercontent.com"), false, "Home must not link broken external GitHub raw images");
  for (const app of apps) {
    assert.ok(PAGES["/"].includes(app.icon), `Home product grid missing local icon for ${app.slug}`);
    assert.ok(PAGES["/solutions"].includes(app.icon), `/solutions card missing Hub icon for ${app.slug}`);
    assert.ok(PAGES["/solutions"].includes(app.favicon), `/solutions card missing favicon for ${app.slug}`);

    const route = `/apps/${app.slug}`;
    const html = PAGES[route];
    assert.ok(html, `Missing page ${route}`);
    assert.ok(html.includes(app.icon), `${route} missing Hub app icon`);
    assert.ok(html.includes(app.favicon), `${route} missing matching favicon`);
    assert.equal(html.includes('class="product-avatar"'), false, `${route} still contains placeholder text avatar`);

    assert.ok(fs.existsSync(path.join(repo, "public", app.icon)), `Missing icon file on disk: ${app.icon}`);
    assert.ok(fs.existsSync(path.join(repo, "public", app.favicon)), `Missing favicon file on disk: ${app.favicon}`);

    const approvedScreens = app.slug === 'hub' ? 1 : ['pos', 'academy'].includes(app.slug) ? 5 : 0;
    for (let i = 1; i <= 5; i++) {
      const shotPath = `/design-assets/screenshots/${app.slug}/screen-${i}.png`;
      assert.equal(html.includes(shotPath), i <= approvedScreens, `${route} preview policy for ${i}`);
      assert.equal(fs.existsSync(path.join(repo, "public", shotPath)), i <= approvedScreens, `Public asset policy: ${shotPath}`);
    }
  }

  assert.equal(PAGES["/solutions"].includes('class="icon-chip"'), false, "/solutions cards must use real app icons instead of text chips");

  const publicSiteJs = fs.readFileSync(path.join(repo, "src/public-site.js"), "utf8");
  assert.ok(publicSiteJs.includes("APP_FAVICONS") && publicSiteJs.includes("syncFavicon") && publicSiteJs.includes("initAppGallery"));

  const serverTs = fs.readFileSync(path.join(repo, "server.ts"), "utf8");
  assert.ok(serverTs.includes("applyAppFavicon") && serverTs.includes("/design-assets/apps/pos-favicon.png"));
});

test("resolveTrustProxy honors TRUSTED_PROXIES, uses safe private subnets on Cloud Run, and stays false locally", async () => {
  const { resolveTrustProxy } = await import(path.join(repo, "server/rateLimit.ts"));

  assert.deepEqual(resolveTrustProxy({ TRUSTED_PROXIES: " 172.18.0.5 , 172.18.0.0/16 " }), [
    "172.18.0.5",
    "172.18.0.0/16",
  ]);
  assert.equal(resolveTrustProxy({ TRUSTED_PROXIES: "true, *, " }), false);
  assert.deepEqual(resolveTrustProxy({ K_SERVICE: "ais-dev-preview" }), [
    "loopback",
    "linklocal",
    "uniquelocal",
  ]);
  assert.equal(resolveTrustProxy({ TRUSTED_PROXIES: "", K_SERVICE: "", K_REVISION: "", CLOUD_RUN_JOB: "" }), false);
});

test("X-Forwarded-For never triggers express-rate-limit ValidationError with or without TRUSTED_PROXIES", { timeout: 25000 }, async () => {
  for (const kService of ["", "ais-dev-preview"]) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "v79-proxy-regression-"));
    fs.mkdirSync(path.join(tmp, "data"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "data/vision79_saas.json"), JSON.stringify([]));

    const port = 43000 + Math.floor(Math.random() * 4000);
    const base = `http://127.0.0.1:${port}`;
    const env = {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
      CLIENT_DIST: path.join(repo, "dist/client"),
      CANONICAL_DOMAIN: base,
      CAPTCHA_MODE: "disabled",
      ADMIN_PASSWORD: "Proxy-regression-password-123!",
      ADMIN_RESET_TOKEN: "",
      ENCRYPTION_KEY: crypto.randomBytes(32).toString("hex"),
      TRUSTED_PROXIES: "",
      K_SERVICE: kService,
      K_REVISION: kService ? `${kService}-00001` : "",
      CLOUD_RUN_JOB: "",
      GEMINI_API_KEY: "",
    };

    let logs = "";
    const child = spawn(process.execPath, [path.join(repo, "dist/server/server.cjs")], {
      cwd: tmp,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout!.on("data", (d) => (logs += d));
    child.stderr!.on("data", (d) => (logs += d));

    try {
      let ready = false;
      for (let i = 0; i < 200; i++) {
        try {
          if ((await fetch(base + "/api/ready")).ok) {
            ready = true;
            break;
          }
        } catch {}
        if (child.exitCode !== null) throw new Error(logs);
        await new Promise((r) => setTimeout(r, 50));
      }
      assert.ok(ready, `Server failed to start (K_SERVICE=${kService}): ${logs}`);

      const forwardedHeaders = {
        Origin: base,
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.10",
      };

      const appsRes = await fetch(base + "/api/apps", { headers: { "X-Forwarded-For": "203.0.113.10" } });
      assert.equal(appsRes.status, 200);

      const incrementRes = await fetch(base + "/api/apps/increment", {
        method: "POST",
        headers: forwardedHeaders,
        body: JSON.stringify({ id: 999999 }),
      });
      assert.equal(incrementRes.status, 404);

      const feedbackRes = await fetch(base + "/api/feedback", {
        method: "POST",
        headers: forwardedHeaders,
        body: JSON.stringify({ appId: 999999, rating: 5, comment: "ok" }),
      });
      assert.equal(feedbackRes.status, 404);

      const leadsRes = await fetch(base + "/api/leads", {
        method: "POST",
        headers: forwardedHeaders,
        body: JSON.stringify({ name: "Proxy Test", company: "Test Co", email: "proxy@example.test", phone: "7585550101" }),
      });
      assert.equal(leadsRes.status, 201);

      const newsletterRes = await fetch(base + "/api/newsletter/subscribe", {
        method: "POST",
        headers: forwardedHeaders,
        body: JSON.stringify({ email: "invalid" }),
      });
      assert.equal(newsletterRes.status, 400);

      const loginRes = await fetch(base + "/api/student/login", {
        method: "POST",
        headers: forwardedHeaders,
        body: JSON.stringify({ email: "nobody@example.test", password: "wrong" }),
      });
      assert.equal(loginRes.status, 401);

      assert.equal(logs.includes("ERR_ERL_UNEXPECTED_X_FORWARDED_FOR"), false, `Unexpected XFF ValidationError:\n${logs}`);
      assert.equal(logs.includes("ERR_ERL_PERMISSIVE_TRUST_PROXY"), false, `Unexpected trust proxy ValidationError:\n${logs}`);
      assert.equal(logs.includes("ValidationError"), false, `Unexpected ValidationError in server logs:\n${logs}`);
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill();
        await new Promise((r) => child.once("exit", r));
      }
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
});

test("editorial redesign enforces non-bold equal-width wordmark, clean footer without /admin, bespoke SMB imagery, and SEO metadata", () => {
  const indexHtml = fs.readFileSync(path.join(repo, "index.html"), "utf8");
  const publicCss = fs.readFileSync(path.join(repo, "src/redesign/public.css"), "utf8");
  const websiteDesignRaw = fs.readFileSync(path.join(repo, "shared/website-design.ts"), "utf8");
  const PAGES = JSON.parse(websiteDesignRaw.split("\n")[2].slice("export const PAGES: Record<string,string> = ".length, -1));

  // Footer must NOT link to Website admin / /admin
  const footerHtml = indexHtml.slice(indexHtml.indexOf("<footer"));
  assert.equal(footerHtml.includes("/admin"), false, "Public footer must not contain /admin link");
  assert.equal(/website\s+admin/i.test(footerHtml), false, "Public footer must not mention Website admin");

  // Header wordmark lockup and non-bold tagline CSS
  assert.ok(indexHtml.includes('class="site-brand-name">V79 Digital</span>'), "Missing V79 Digital brand name span");
  assert.ok(indexHtml.includes('class="site-brand-tagline"'), "Missing FROM VISION TO VALUE brand tagline flex container");
  assert.match(publicCss, /\.site-brand-tagline\s*\{[^}]*font-weight:\s*400;/, "FROM VISION TO VALUE tagline must be non-bold (font-weight: 400)");
  assert.match(publicCss, /\.site-brand-tagline\s*\{[^}]*width:\s*100%;/, "Tagline must be width: 100% to match V79 Digital width");
  assert.match(publicCss, /\.site-brand-tagline\s*\{[^}]*justify-content:\s*space-between;/, "Tagline must stretch words flush with justify-content: space-between");

  // No generic Inter font in public entry or redesign stylesheet
  assert.equal(indexHtml.includes("family=Inter"), false, "index.html must not load Inter font");
  assert.equal(publicCss.includes("font-family:Inter"), false, "public.css must not use Inter font");

  // Website building service & unique editorial assets exist on disk
  assert.ok(PAGES["/services/website-design"], "Missing /services/website-design page");
  assert.ok(PAGES["/"].includes("/services/website-design"), "Home page should feature /services/website-design for SMB buyers");
  assert.ok(PAGES["/services"].includes("explode-lines-svg"), "/services explode deck should include SVG radial architecture vectors");
  for (const imgName of [
    "hero-smb-owner.jpg",
    "web-design-studio.jpg",
    "network-security.jpg",
    "cloud-collaboration.jpg",
    "retail-hospitality.jpg",
    "automation-systems.jpg",
  ]) {
    assert.ok(fs.existsSync(path.join(repo, "public/design-assets/editorial", imgName)), `Missing editorial asset: ${imgName}`);
  }
});


