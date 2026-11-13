import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const base = path.resolve("public/preview");
const html = readFileSync(path.join(base,"network-design-v1.html"),"utf8");
const css = readFileSync(path.join(base,"network-design-v1.css"),"utf8");
const js = readFileSync(path.join(base,"network-design-v1.js"),"utf8");

test("Network lesson is a full owner-review draft with reading-first layout", () => {
  assert.match(html,/noindex,nofollow/);
  assert.match(html,/Network Design|Build a network/);
  assert.match(html,/Guest phone/);
  assert.match(html,/copper Ethernet channel/);
  assert.match(html,/YOUR PRACTICAL CHECKLIST/);
  assert.ok(html.indexOf('id="shareLink"') > html.indexOf('id="quiz"'));
  assert.match(html,/not a diagram of a real customer network/i);
});

test("Original diagrams and working interactive controls have unique IDs and labels", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ids.length, new Set(ids).size, "Duplicate HTML IDs");
  const idSet = new Set(ids);
  for (const [, ref] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(idSet.has(ref), "Broken internal anchor "+ref);
  for (const [, ref] of html.matchAll(/\bfor="([^"]+)"/g)) assert.ok(idSet.has(ref), "Missing label target "+ref);
  for (const [, ref] of html.matchAll(/\baria-describedby="([^"]+)"/g)) assert.ok(idSet.has(ref), "Missing described-by target "+ref);
  for (const [, ref] of js.matchAll(/\$\("([^"]+)"\)/g)) assert.ok(idSet.has(ref), "JS target not found "+ref);
  assert.match(html,/<svg[^>]+role="img"/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("The network tools are simulated, do not upload data, and show feedback", () => {
  assert.match(html, /not a test of your real network/i);
  assert.match(html, /Nothing is uploaded or saved/);
  assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|innerHTML\s*=/);
  assert.match(js, /navigator\.clipboard/);
  assert.match(html, /aria-live="polite"/);
});

test("Quiz and planning tools support independent practice with trustworthy sources", () => {
  assert.match(js, /answers=\{q1:"b",q2:"a",q3:"c",q4:"b"\}/);
  for(const key of ["businessType","deviceCount","guestUse","paymentUse","outageUse","copyPlan","cableLength","simulateButton"]) assert.ok(html.includes('id="'+key+'"'));
  for (const hostname of ["ftc.gov","csrc.nist.gov","cisco.com","eaton.com"]) assert.ok(html.includes(hostname));
});
