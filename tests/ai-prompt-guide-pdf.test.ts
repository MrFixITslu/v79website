import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { generateAiPromptGuidePdf } from "../server/aiPromptGuidePdf";

test("premium AI prompting guide is a complete PDF", () => {
  const logoPath = path.resolve(process.cwd(), "public", "v79-digital-original.png");
  const pdf = generateAiPromptGuidePdf(logoPath);

  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok(pdf.length > 100_000, "guide should contain the branded logo and full content");

  const body = pdf.toString("latin1");
  const pageCount = (body.match(/\/Type \/Page\b/g) || []).length;
  assert.equal(pageCount, 14);
  assert.match(body, /How to Prompt AI/);
  assert.match(body, /FROM IDEA TO ADVANTAGE/);
});
