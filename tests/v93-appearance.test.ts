import { test } from "node:test";
import assert from "node:assert/strict";
import { saintLuciaTheme } from "../src/components/V79Appearance.tsx";

test("St Lucia Auto theme: light from 06:00 to 17:59 local", () => {
  assert.equal(saintLuciaTheme(new Date("2026-11-11T09:59:00Z")), "dark");
  assert.equal(saintLuciaTheme(new Date("2026-11-11T10:00:00Z")), "light");
  assert.equal(saintLuciaTheme(new Date("2026-11-11T21:59:00Z")), "light");
  assert.equal(saintLuciaTheme(new Date("2026-11-11T22:00:00Z")), "dark");
});
