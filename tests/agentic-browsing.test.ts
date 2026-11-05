import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("public llms.txt exposes a title and discoverable Markdown links", () => {
  const llms = fs.readFileSync(path.join(root, "public/llms.txt"), "utf8");
  assert.match(llms, /^# V79 Digital \(/m);
  const links = [...llms.matchAll(/^\s*-\s+\[([^\]]+)\]\((https:\/\/[^)]+)\)\s*$/gm)];
  assert.ok(links.length >= 9, "The website should expose its primary navigation as Markdown links");
  assert.ok(links.some((match) => match[2] === "https://v79sl.com/"));
  assert.ok(links.some((match) => match[2] === "https://v79sl.com/contact"));
  assert.doesNotMatch(llms, /^\s*-\s+[^:\n]+:\s+https:\/\//m, "No unrecognised plain-URL entries");
});

test("company LinkedIn profile has a descriptive accessible name", () => {
  const source = fs.readFileSync(path.join(root, "src/components/AboutPage.tsx"), "utf8");
  assert.match(source, /linkedin: "https:\/\/www\.linkedin\.com\/company\/v79digital"/);
  assert.match(source, /aria-label="V79 Digital company profile on LinkedIn \(opens in a new tab\)"/);
  assert.match(source, /<Linkedin[^>]+aria-hidden="true"/);
  assert.doesNotMatch(source, /linkedin: "https:\/\/linkedin\.com"/);
});
