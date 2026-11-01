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

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
  await page.locator("#btn-workspace-crm").waitFor({ state: "visible", timeout: 20000 });
  await page.locator("#btn-workspace-crm").click();
  await page.locator("#crm-tab-prospects").click();
  await page.getByText("AI Business Prospect Finder", { exact: true }).waitFor();
  check("CRM Prospect Finder visible in authenticated browser");

  const csv = [
    "businessName,category,industry,location,phone,email,website,facebookUrl,instagramUrl,linkedinUrl,description,sourceUrl",
    [company,"Professional Services","Consulting","Castries","+1 758 555 0101",
     "company@example.test","https://example.com","https://facebook.com/examplecompany",
     "https://instagram.com/examplecompany","https://linkedin.com/company/examplecompany",
     "Synthetic business for isolated browser tests","https://example.com/directory-test-profile"].join(",")
  ].join("\n");
  await page.locator("#crm-directory-import").setInputFiles({
    name: "owner-authorised-test.csv", mimeType: "text/csv", buffer: Buffer.from(csv)
  });
  await page.getByText("Imported 1 businesses", { exact: false }).waitFor();
  await page.getByText(company, { exact: true }).waitFor({ timeout: 15000 });
  const leadsAfterImport = await context.request.get("/api/admin/crm/leads");
  assert.equal(leadsAfterImport.status(), 200);
  assert.equal((await leadsAfterImport.json()).filter(l => l.company === company).length, 0,
    "CSV staging must not automatically approve leads");
  const secondSync = await context.request.post("/api/admin/crm/directory/sync");
  assert.equal(secondSync.status(), 200);
  assert.equal((await secondSync.json()).staged, 0, "sync must not duplicate imported prospects");
  check("CSV import immediately shows the business for review without auto-approval or duplicates");
  const industryFilter = page.getByRole("combobox", { name: "Filter existing prospects by industry" });
  await industryFilter.selectOption("industry:professional services");
  await page.getByText(company, { exact: true }).waitFor();
  await industryFilter.selectOption("industry:consulting");
  await page.getByText(company, { exact: true }).waitFor();
  await industryFilter.selectOption("preset:law-firms");
  await page.getByText("No matching businesses in your existing prospects.", { exact: false }).waitFor();
  assert.equal(await page.locator('input[type="checkbox"]:visible').count(), 0, "filtered-out prospects cannot be selected");
  await industryFilter.selectOption("all");
  await page.getByRole("searchbox", { name: "Search existing prospects" }).fill("not-in-directory");
  await page.getByText("No matching businesses in your existing prospects.", { exact: false }).waitFor();
  await page.getByRole("searchbox", { name: "Search existing prospects" }).fill("");
  await page.getByRole("combobox", { name: "Sort existing prospects" }).selectOption("business");
  await page.getByText(company, { exact: true }).waitFor();
  check("industry, trade, keyword and sort controls filter local records without network discovery");


  // Real public-source network calls are deliberately disabled in CI.
  const selector = page.locator("label").filter({ hasText: "Discovery source" }).locator("select");
  await selector.selectOption("directory");
  await page.getByRole("button", { name: "Find businesses", exact: true }).click();
  await page.getByText(company, { exact: true }).waitFor({ timeout: 15000 });
  const card = page.locator("div.glass").filter({ has: page.getByText(company, { exact: true }) }).last();
  await page.locator('a[href="mailto:company@example.test"]').waitFor();
  await page.locator('a[href="tel:+1 758 555 0101"]').waitFor();
  await page.getByRole("link", { name: "Website", exact: true }).waitFor();
  await page.getByRole("link", { name: "Source", exact: true }).waitFor();
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

  assert.deepEqual(await selector.locator("option").allTextContents(), ["My imported business directory"]);
  await page.getByText("Public directory discovery is not enabled.", { exact: false }).waitFor();
  const capabilities = await context.request.get("/api/admin/crm/discovery-capabilities");
  assert.equal(capabilities.status(), 200);
  const enabled = await capabilities.json();
  assert.equal(enabled.exports, false);
  assert.equal(enabled.osm, false);
  const declined = await context.request.post("/api/admin/crm/prospects/search", {
    data: { source: "exports", limit: 1 }
  });
  assert.equal(declined.status(), 503);
  check("provider is hidden in UI and server refuses disabled external discovery");

  assert.equal(errors.length, 0, "browser JavaScript errors: " + errors.join(" | "));
  await page.screenshot({ path: "crm-browser-acceptance.png", fullPage: true });
  check("browser UI acceptance and screenshot saved");
} finally {
  await browser.close();
}