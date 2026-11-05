// Public, static, product-specific marketing pages for search engines and non-JS clients.
// Build artefacts are generated into public/products before Vite copies public assets.
// Keep these descriptions factual: no invented testimonials, prices or availability promises.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

export const PRODUCTS = [
  {
    slug: "hub",
    name: "V79 Hub",
    category: "BusinessApplication",
    heading: "One secure workspace for your business applications",
    description: "V79 Hub gives organisations a central place to sign in, access enabled V79 apps and view key business information.",
    audience: "Businesses that want a simpler way to access connected operational tools.",
    benefits: ["Central workspace for enabled V79 applications", "Secure sign-in and account access", "One starting point for connected business tools"],
    appUrl: "https://hub.v79sl.com/",
    appLabel: "Open V79 Hub",
  },
  {
    slug: "tiquet",
    name: "V79 Tiquet",
    category: "BusinessApplication",
    heading: "Keep service requests and customer support organised",
    description: "V79 Tiquet helps teams manage service tickets, customer requests, follow-up and support activity through a business-focused workflow.",
    audience: "Service businesses, support teams and organisations handling customer requests.",
    benefits: ["Organise service tickets and customer enquiries", "Track follow-up and support activity", "Keep customer support workflows in one place"],
    appUrl: "https://tiquet.v79sl.com/",
    appLabel: "Open V79 Tiquet",
  },
  {
    slug: "pos",
    name: "V79 POS",
    category: "BusinessApplication",
    heading: "Point-of-sale workflows designed for day-to-day selling",
    description: "V79 POS supports sales transaction workflows and operational sales visibility for businesses exploring connected software tools.",
    audience: "Shops, retail operators and other teams managing customer sales.",
    benefits: ["Support day-to-day sales workflows", "Work with transactions in one business tool", "Access POS from the V79 business ecosystem"],
    appUrl: "https://pos.v79sl.com/",
    appLabel: "Open V79 POS",
  },
  {
    slug: "ffpro",
    name: "FFPRO",
    category: "FinanceApplication",
    heading: "Make personal financial planning easier to manage",
    description: "FFPRO brings budgeting, recurring items, savings goals and personal financial planning into one application.",
    audience: "Individuals who want a clearer view of their finances and goals.",
    benefits: ["Plan and monitor budgets", "Organise recurring finances and savings goals", "Explore financial planning in one place"],
    appUrl: "https://ffpro.v79sl.com/",
    appLabel: "Open FFPRO",
  },
  {
    slug: "marketing",
    name: "V79 Marketing",
    category: "BusinessApplication",
    heading: "Plan campaigns and customer engagement more clearly",
    description: "V79 Marketing is a business campaign workspace for organising marketing activity, leads and customer engagement.",
    audience: "Small businesses looking for more consistent marketing workflows.",
    benefits: ["Organise campaign planning", "Keep marketing activity structured", "Bring marketing into the V79 business workflow"],
    appUrl: "https://marketing.v79sl.com/",
    appLabel: "Open V79 Marketing",
  },
  {
    slug: "academy",
    name: "V79 Academy",
    category: "EducationalApplication",
    heading: "Learn practical AI and business technology skills",
    description: "V79 Academy provides practical technology learning experiences for people and organisations across the Caribbean.",
    audience: "People and teams building confidence with AI, technology and digital tools.",
    benefits: ["Explore business and technology learning", "Develop practical AI understanding", "Find training through the V79 Academy"],
    appUrl: "https://academy.v79sl.com/",
    appLabel: "Explore V79 Academy",
  },
];

const SITE = "https://v79sl.com";
const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const CSS = [
  ":root{color-scheme:light;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#142f39;background:#f7faf9}",
  "*{box-sizing:border-box}body{margin:0}a{color:inherit}a:focus-visible{outline:3px solid #0b7975;outline-offset:4px}",
  ".container{max-width:1080px;margin:auto;padding:0 25px}.header{border-bottom:1px solid #e1eae8;background:#fff}",
  ".header-inner{display:flex;justify-content:space-between;align-items:center;gap:18px;padding-top:20px;padding-bottom:20px;flex-wrap:wrap}",
  ".brand{font-size:19px;font-weight:800;letter-spacing:-.04em;text-decoration:none}.brand span{color:#087b77}",
  "nav{display:flex;flex-wrap:wrap;gap:17px}nav a{text-decoration:none;color:#465d64;font-size:14px;font-weight:600}",
  ".hero{padding:76px 0 64px}.eyebrow{color:#086963;font-weight:800;letter-spacing:.13em;font-size:12px;text-transform:uppercase}",
  "h1{font-size:clamp(2.2rem,5.8vw,4.25rem);letter-spacing:-.055em;line-height:1.09;max-width:820px;margin:20px 0}",
  ".lead{font-size:clamp(1.05rem,2vw,1.28rem);line-height:1.65;color:#4e676e;max-width:730px}",
  ".actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.button{display:inline-block;text-decoration:none;border-radius:12px;padding:14px 21px;font-weight:750;font-size:14px;border:1px solid #007d78}",
  ".primary{background:#087b77;color:#fff}.secondary{background:#fff;color:#085e5c}",
  ".grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;margin-bottom:70px}",
  ".panel{border:1px solid #dce8e6;border-radius:20px;background:#fff;padding:30px;box-shadow:0 8px 24px rgba(19,63,64,.035)}",
  "h2{font-size:1.45rem;letter-spacing:-.03em;margin:0 0 16px}ul{padding-left:22px;line-height:1.9;color:#425e65}",
  "p{line-height:1.7;color:#425e65}.notice{font-size:.9rem;color:#566b71}.related{padding:22px 0 70px}",
  ".related-links{display:flex;gap:12px;flex-wrap:wrap}.related-links a{color:#087b77;text-decoration:underline;font-weight:650;font-size:14px}",
  "footer{border-top:1px solid #dae6e3;padding:30px 0;color:#5d7378;font-size:13px}",
  "@media(max-width:700px){.hero{padding:46px 0 32px}.grid{grid-template-columns:1fr;margin-bottom:40px}.panel{padding:22px}}",
].join("");

export function renderProduct(product) {
  const canonical = SITE + "/products/" + product.slug + ".html";
  const benefits = product.benefits.map((item) => "<li>" + escapeHtml(item) + "</li>").join("");
  const related = PRODUCTS.filter((other) => other.slug !== product.slug).map((other) => '<a href="/products/' + other.slug + '.html">' + escapeHtml(other.name) + "</a>").join("");
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": canonical + "#software",
    name: product.name,
    applicationCategory: product.category,
    operatingSystem: "Web",
    url: canonical,
    description: product.description,
    publisher: { "@type": "Organization", name: "V79 Digital", url: SITE + "/" },
  }).replace(/</g, "\\u003c");
  return [
    "<!doctype html>",
    '<html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>" + escapeHtml(product.name + " | Caribbean Business Software | V79 Digital") + "</title>",
    '<meta name="description" content="' + escapeHtml(product.description) + '">',
    '<link rel="canonical" href="' + canonical + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="V79 Digital">',
    '<meta property="og:title" content="' + escapeHtml(product.name + " | V79 Digital") + '">',
    '<meta property="og:description" content="' + escapeHtml(product.description) + '">',
    '<meta property="og:url" content="' + canonical + '">',
    '<meta property="og:image" content="' + SITE + '/og-image.png">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<link rel="icon" href="/favicon.ico">',
    '<script type="application/ld+json">' + structuredData + "</script>",
    '<script defer src="/ga4-consent.js?v=20261105"></script>',
    "<style>" + CSS + "</style></head><body>",
    '<header class="header"><div class="container header-inner"><a class="brand" href="/">V79 <span>Digital</span></a>',
    '<nav aria-label="Main navigation"><a href="/">Home</a><a href="/services">Services</a><a href="/solutions">Solutions</a><a href="/contact">Contact</a></nav></div></header>',
    '<main id="main"><section class="container hero">',
    '<div class="eyebrow">V79 business tools · ' + escapeHtml(product.name) + "</div>",
    "<h1>" + escapeHtml(product.heading) + "</h1>",
    '<p class="lead">' + escapeHtml(product.description) + "</p>",
    '<div class="actions"><a class="button primary" href="' + escapeHtml(product.appUrl) + '">' + escapeHtml(product.appLabel) + '</a><a class="button secondary" href="/contact">Ask about access</a></div>',
    "</section>",
    '<section class="container grid" aria-label="Product information">',
    '<article class="panel"><h2>What it helps you do</h2><ul>' + benefits + "</ul></article>",
    '<article class="panel"><h2>Who it is for</h2><p>' + escapeHtml(product.audience) + "</p>",
    '<p class="notice">Available features and access depend on the current release and your organisation’s subscription or eligibility. Contact V79 Digital for availability and pricing.</p></article>',
    "</section>",
    '<section class="container related"><h2>Explore the V79 ecosystem</h2><div class="related-links">' + related + "</div></section></main>",
    '<footer><div class="container">V79 Digital · Caribbean business technology · <a href="/contact">Contact us</a> · <a href="/privacy">Privacy</a> · <button type="button" data-v79-ga4-preferences style="border:0;background:none;color:#087b77;text-decoration:underline;cursor:pointer;font:inherit">Analytics preferences</button></div></footer>',
    "</body></html>",
  ].join("\n");
}

export function checkPages() {
  assert.equal(PRODUCTS.length, 6, "Expected six public product pages");
  assert.equal(new Set(PRODUCTS.map((p) => p.slug)).size, PRODUCTS.length, "Duplicate product slugs");
  for (const product of PRODUCTS) {
    const output = renderProduct(product);
    assert.match(output, /<h1>/);
    assert.match(output, /<link rel="canonical"/);
    assert.match(output, /application\/ld\+json/);
    assert.match(output, new RegExp("/products/" + product.slug + "\\.html"));
    assert.ok(!/noindex|ratingValue|aggregateRating|priceCurrency/i.test(output), "Do not introduce unverified search claims");
    assert.ok(product.appUrl.startsWith("https://"), "Application destinations must use HTTPS");
  }
}

checkPages();
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname) && !process.argv.includes("--check")) {
  const target = path.resolve("public", "products");
  fs.mkdirSync(target, { recursive: true });
  for (const product of PRODUCTS) fs.writeFileSync(path.join(target, product.slug + ".html"), renderProduct(product), "utf8");
  console.log("Generated " + PRODUCTS.length + " public product landing pages in " + target);
} else if (process.argv.includes("--check")) {
  console.log("Product landing page checks passed");
}
