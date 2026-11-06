import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const base = path.resolve(process.cwd(), "public/preview");
const page = fs.readFileSync(path.join(base, "chatgpt-skills-v2.html"), "utf8");
const js = fs.readFileSync(path.join(base, "chatgpt-skills-v2.js"), "utf8");
const css = fs.readFileSync(path.join(base, "chatgpt-skills-v2.css"), "utf8");
const skill = fs.readFileSync(path.resolve("skills/v79-interactive-learning-post/SKILL.md"), "utf8");

test("Preview is unlisted, readable and never requires sharing", () => {
  assert.match(page, /name="robots" content="noindex,nofollow,noarchive"/);
  assert.match(page, /Start reading/);
  assert.match(page, /A Skill is a saved recipe/);
  assert.match(page, /id="share"/);
  assert.ok(page.indexOf('id="share"') > page.indexOf('id="answers"'));
  assert.doesNotMatch(page.slice(0,page.indexOf('<article')), /id="shareLink"/);
  assert.match(page, /no sign-up|no sharing|Sharing is completely optional|Sharing is completely optional/i);
});

test("Tutorial is a full lesson with real practice, not a teaser", () => {
  for(const id of ["what", "create", "prompt-lab", "install", "use", "edit", "test", "answers"]) {
    assert.ok(page.includes('id="'+id+'"'),"Missing section "+id);
  }
  assert.match(page, /id="skillOutput"/);
  assert.match(page, /id="quiz"/);
  assert.match(page, /class="task-check"/);
  assert.match(page, /<svg/);
  assert.match(page, /Original illustration/);
  assert.match(page, /Menus may differ|may look different/);
});

test("Safe interactions, accessibility and reduced-motion support", () => {
  assert.match(page, /role="tablist"/);
  assert.match(page, /aria-controls="panel-shared"/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /<label for="skillName"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /max-width:540px/);
  assert.doesNotMatch(js, /\.innerHTML\s*=/);
  assert.doesNotMatch(js, /\bfetch\(/);
  assert.match(js, /navigator\.clipboard/);
  assert.match(js, /if \(!result\) throw/);
  assert.doesNotMatch(page, /<button[^>]*>[^<]*<a /);
});

test("Skill includes an approval gate and reusable quality criteria", () => {
  assert.match(skill, /name: v79-interactive-learning-post/);
  assert.match(skill, /Do \*\*not\*\* publish/);
  assert.match(skill, /one post only/);
  assert.match(skill, /prefers-reduced-motion/);
  assert.match(skill, /\/REDTEAM/);
});