import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HybridHomePage from "../src/components/HybridHomePage";
import { ServiceDetailPage, ProductDetailPage, SoftwareOverviewPage } from "../src/components/OfferingPages";
import { SERVICE_PAGES, PRODUCT_PAGES, getServicePage, getProductPage } from "../src/data/siteOfferings";

const baseDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(baseDir, "..");
const read = (name: string) => readFileSync(path.join(root, name), "utf8");

test("hybrid site has six distinct service pages and two product pages", () => {
  assert.equal(SERVICE_PAGES.length, 6);
  assert.deepEqual(PRODUCT_PAGES.map(p => p.slug).sort(), ["hub", "tiquet"]);
  const offerings = [...SERVICE_PAGES, ...PRODUCT_PAGES];
  assert.equal(new Set(offerings.map(p => p.path)).size, offerings.length);
  for (const page of offerings) {
    assert.match(page.path, /^\/(?:services|software)\/[a-z0-9-]+$/);
    assert.ok(page.metaTitle.length > 20 && page.metaTitle.length < 90);
    assert.ok(page.metaDescription.length > 50);
    assert.ok(page.summary.length > 30);
    assert.equal(page.steps.length, 4);
    assert.ok(page.faqs.length >= 2);
  }
  for (const p of SERVICE_PAGES) {
    assert.equal(getServicePage(p.path)?.slug, p.slug);
    assert.ok(p.includes.length >= 4);
    assert.ok(p.audiences.length >= 2);
  }
  for (const p of PRODUCT_PAGES) assert.equal(getProductPage(p.path)?.slug, p.slug);
  assert.equal(getServicePage("/services/unknown"), undefined);
  assert.equal(getProductPage("/software/unknown"), undefined);
});

test("homepage has genuine selectable guidance and links to real detail routes", () => {
  const home = read("src/components/HybridHomePage.tsx");
  assert.match(home, /aria-pressed=\{needId === need\.id\}/);
  assert.match(home, /aria-pressed=\{tourId === step\.id\}/);
  assert.match(home, /aria-live="polite"/);
  assert.match(home, /SERVICE_PAGES\.map/);
  assert.match(home, /href=\{service\.path\}/);
  assert.match(home, /Illustrated workflow · not a product screenshot/);
  assert.match(home, /href="\/resources"/);
  assert.match(home, /focus-visible:outline/);
});

test("server has route metadata, readable fallback, canonical and sitemap entries", () => {
  const server = read("server.ts");
  const xml = read("public/sitemap.xml");
  assert.match(server, /SERVICE_PAGES\.map\(page => page\.path\)/);
  assert.match(server, /PRODUCT_PAGES\.map\(page => page\.path\)/);
  assert.match(server, /seoFallbacks\[service\.path\]/);
  assert.match(server, /seoFallbacks\[product\.path\]/);
  assert.match(server, /staticPages\[service\.path\]/);
  assert.match(server, /staticPages\[product\.path\]/);
  assert.match(server, /const marketingOfferingsXml/);
  assert.match(server, /rel="canonical"/);
  for (const offering of [...SERVICE_PAGES, ...PRODUCT_PAGES]) {
    assert.ok(xml.includes("https://v79sl.com" + offering.path), offering.path + " missing sitemap fallback");
  }
  assert.ok(xml.includes("https://v79sl.com/software</loc>"));
});

test("legacy routes, MFA login and guide features were not replaced", () => {
  const app = read("src/App.tsx");
  const server = read("server.ts");
  assert.match(app, /<HybridHomePage \/>/);
  assert.match(app, /<ServiceDetailPage page=\{serviceDetail\} \/>/);
  assert.match(app, /<ProductDetailPage page=\{productDetail\} \/>/);
  assert.match(app, /<SoftwareOverviewPage \/>/);
  assert.match(app, /<ResourcesPage/);
  assert.match(app, /<AboutPage/);
  assert.match(app, /<ServicesPage/);
  assert.match(app, /<ContactPage/);
  assert.match(server, /\/api\/leads/);
  assert.match(server, /\/api\/admin/);
});

test("contact topics are constrained to recognised offerings and never alter auth", () => {
  const source = read("src/components/ContactPage.tsx");
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(TOPIC_PRESETS, selectedTopic\)/);
  assert.match(source, /"\/api\/leads"/);
  assert.match(source, /Idempotency-Key/);
  assert.match(source, /recaptchaToken/);
  assert.match(source, /TOPIC_PRESETS/);
});

test("homepage renders accessible selectors, value proposition and routes without a browser", () => {
  const html = renderToStaticMarkup(React.createElement(HybridHomePage));
  assert.match(html, /Technology that helps your business/);
  assert.match(html, /What would you like to improve/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /aria-live="polite"/);
  for (const page of SERVICE_PAGES) assert.ok(html.includes(page.path), "Missing homepage route: " + page.path);
  assert.match(html, /Inside V79/);
  assert.match(html, /not a product screenshot/);
});

test("each detail page renders its own H1 and a working consultation path", () => {
  for (const page of SERVICE_PAGES) {
    const html = renderToStaticMarkup(React.createElement(ServiceDetailPage, { page }));
    assert.ok(html.includes("<h1"), page.slug + " has no heading");
    assert.ok(html.includes(page.title.replaceAll("&", "&amp;")), page.slug + " title missing");
    assert.ok(html.includes("/contact?topic=" + page.slug), page.slug + " inquiry route missing");
    assert.ok(html.includes("Questions worth asking"), page.slug + " FAQ missing");
  }
  for (const page of PRODUCT_PAGES) {
    const html = renderToStaticMarkup(React.createElement(ProductDetailPage, { page }));
    assert.ok(html.includes("<h1"), page.slug + " has no heading");
    assert.ok(html.includes(page.title.replaceAll("&", "&amp;")), page.slug + " title missing");
    assert.ok(html.includes("/contact?topic=" + page.slug), page.slug + " inquiry route missing");
    assert.ok(html.includes("not a screenshot"), page.slug + " missing illustration disclaimer");
  }
  const software = renderToStaticMarkup(React.createElement(SoftwareOverviewPage));
  assert.ok(software.includes("/software/hub"));
  assert.ok(software.includes("/software/tiquet"));
});
