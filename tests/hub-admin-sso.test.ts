import { test } from "node:test";
import assert from "node:assert/strict";
import { createHubSsoFlows, hubBackchannelUrl } from "../server/hub-sso";

test("Hub login flow binds state and PKCE verifier to the initiating browser", () => {
  let time = 1_000_000;
  const flow = createHubSsoFlows({ clock: () => time });
  const a = flow.begin();
  const b = flow.begin();
  assert.match(a.challenge, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(a.state, b.state);
  assert.equal(flow.consume(a.state, b.browser), null);
  assert.equal(flow.consume(a.state, a.browser), null, "wrong browser burns pending flow");
  const verifier = flow.consume(b.state, b.browser);
  assert.match(verifier, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(flow.consume(b.state, b.browser), null, "cannot replay callback");
});
test("flow expires before two minutes and fails on malformed input", () => {
  let time = 100_000;
  const flow = createHubSsoFlows({ clock: () => time });
  const f = flow.begin();
  time += 120_001;
  assert.equal(flow.consume(f.state, f.browser), null);
  assert.equal(flow.consume("bad", "bad"), null);
});
test("backchannel URL allowlist denies SSRF, credentials, user-defined ports", () => {
  assert.equal(hubBackchannelUrl("https://hub.v79sl.com").origin, "https://hub.v79sl.com");
  assert.equal(hubBackchannelUrl("http://v79-hub:3040").origin, "http://v79-hub:3040");
  for (const bad of ["https://evil.example.com","http://127.0.0.1:3000",
    "http://169.254.169.254","https://hub.v79sl.com.evil.example.com",
    "https://user:pass@hub.v79sl.com","https://hub.v79sl.com:444",
    "https://hub.v79sl.com/admin"]) {
    assert.throws(() => hubBackchannelUrl(bad), bad);
  }
});
