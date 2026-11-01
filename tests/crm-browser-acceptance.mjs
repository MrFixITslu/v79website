import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3299";
const OLD_PASSWORD = "BrowserFixturePass-2026-Only";
const NEW_PASSWORD = "BrowserFixtureChanged-2026-Only";
const company = "Synthetic Browser CRM Company";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({
  baseURL: BASE,
  viewport: { width: 1365, height: 900 },
  reducedMotion: "reduce"
});

const check = (name) => console.log("PASS: " + name);
try {
  const ready = await context.request.get("/api/ready");
  assert.equal(ready.status(), 200, "preview server readiness");
  const login = await context.request.post("/api/admin/login", { data: { password: OLD_PASSWORD } });
  assert.equal(login.status(), 200, await login.text());
  const auth = await login.json();
  // In the CI-only HTTP preview, explicitly install the *actual server-issued*
  // secure cookie as a loopback cookie. Production still enforces Secure/HttpOnly.
  const putPreviewCookie = async (response) => {
    const value = response.headers()["set-cookie"]?.match(/v79_admin=([^;]+)/)?.[1];
    assert.ok(value, "server must issue an administrator cookie");
    await context.addCookies([{
      name: "v79_admin", value, url: BASE, httpOnly: true,
      secure: false, sameSite: "Strict"
    }]);
  };
  await putPreviewCookie(login);
  if (auth.mustChangePassword) {
    const changed = await context.request.post("/api/admin/change-password", {
      data: { currentPassword: OLD_PASSWORD, newPassword: NEW_PASSWORD }
    });
    assert.equal(changed.status(), 200, await changed.text());
    await putPreviewCookie(changed);
  }
  check("isolated admin session and password rotation");

  const records = await context.request.post("/api/admin/crm/directory", {
    data: { entries: [{
      businessName: company,
      category: "Professional Services",
      industry: "Consulting",
      location: "Castries",
      phone: "+1 758 555 0101",
      email: "company@example.test",
      website: "https://example.com",
      facebookUrl: "https://facebook.com/examplecompany",
      instagramUrl: "https://instagram.com/examplecompany",
      linkedinUrl: "https://linkedin.com/company/examplecompany",
      description: "Synthetic business created only for isolated CRM testing."
    }] }
  });
  assert.equal(records.status(), 200, await records.text());
  check("synthetic directory import through authenticated admin API");

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
  await page.locator("#btn-workspace-crm").waitFor({ state: "visible", timeout: 20000 });
  await page.locator("#btn-workspace-crm").click();
  await page.locator("#crm-tab-prospects").click();
  await page.getByText("AI Business Prospect Finder", { exact: true }).waitFor();
  check("CRM Prospect Finder visible in authenticated browser");

  // Real public-source network calls are deliberately disabled in CI.
  const selector = page.getByText("Discovery source", { exact: true }).locator("select");
  await selector.selectOption("directory");
  await page.getByRole("button", { name: "Find businesses", exact: true }).click();
  await page.getByText(company, { exact: true }).waitFor({ timeout: 15000 });
  const card = page.locator("div.glass").filter({ has: page.getByText(company, { exact: true }) }).last();
  await page.locator('a[href="mailto:company@example.test"]').waitFor();
  await page.locator('a[href="tel:+1 758 555 0101"]').waitFor();
  await page.locator('a[href="https://example.com/"]').waitFor();
  await page.locator('a[href="https://facebook.com/examplecompany"]').waitFor();
  await page.locator('a[href="https://instagram.com/examplecompany"]').waitFor();
  await page.locator('a[href="https://linkedin.com/company/examplecompany"]').waitFor();
  check("contact email, telephone, website and three social links are visible");

  const before = await context.request.get("/api/admin/crm/leads");
  assert.equal(before.status(), 200);
  assert.equal((await before.json()).filter(l => l.company === company).length, 0, "must not create CRM lead before approval");
  check("discovery is separated from lead approval");

  await page.getByRole("button", { name: "Approve to CRM", exact: true }).click();
  const after = await context.request.get("/api/admin/crm/leads");
  assert.equal(after.status(), 200);
  const approved = await after.json();
  assert.equal(approved.filter(l => l.company === company).length, 1);
  check("manual approval creates exactly one CRM lead");

  await selector.selectOption("exports");
  await page.getByRole("button", { name: "Find businesses", exact: true }).click();
  await page.getByText("Public business discovery is not enabled on this server.").waitFor({ timeout: 10000 });
  check("default-off feature flag prevents external discovery");

  assert.equal(errors.length, 0, "browser JavaScript errors: " + errors.join(" | "));
  await page.screenshot({ path: "crm-browser-acceptance.png", fullPage: true });
  check("browser UI acceptance and screenshot saved");
} finally {
  await browser.close();
}