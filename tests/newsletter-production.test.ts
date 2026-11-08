import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';

test('built newsletter HTTP flow: consent, scanner-safe link, form POST, restart and suppressed retry', {timeout: 25000}, async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'newsletter-http-'));
  const repo = process.cwd(), key = crypto.randomBytes(32).toString('hex');
  const reservation = createServer();
  await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = (reservation.address() as {port: number}).port;
  await new Promise<void>((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
  const base = `http://127.0.0.1:${port}`;
  let child: ReturnType<typeof spawn> | undefined;
  async function start() {
    child = spawn(process.execPath, [path.join(repo, 'dist/server/server.cjs')], {cwd: directory,
      env: {...process.env, NODE_ENV: 'production', PORT: String(port), CLIENT_DIST: path.join(repo, 'dist/client'),
        CANONICAL_DOMAIN: base, ENCRYPTION_KEY: key, ADMIN_PASSWORD: 'Newsletter-fixture-password-123!',
        V79_HUB_EVENT_URL: '', V79_HUB_EVENT_SECRET: '', V79TIQUET_INTAKE_SECRET: '', GEMINI_API_KEY: ''},
      stdio: ['ignore', 'ignore', 'ignore']});
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) throw Error('NEWSLETTER_FIXTURE_STARTUP_FAILED');
      try {if ((await fetch(base + '/api/ready')).ok) return;} catch {}
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw Error('NEWSLETTER_FIXTURE_STARTUP_TIMEOUT');
  }
  async function stop() {
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    const closed = new Promise<void>(resolve => child!.once('exit', () => resolve()));
    child.kill('SIGTERM');
    await closed;
  }
  const signup = {firstName: 'Newsletter fixture', email: 'newsletter-fixture@example.test', consent: true};
  const post = (body: unknown) => fetch(base + '/api/newsletter/subscribe', {
    method: 'POST', headers: {'Content-Type': 'application/json', Origin: base}, body: JSON.stringify(body)});
  try {
    await start();
    assert.equal((await post({...signup, consent: false})).status, 400);
    const created = await post(signup);
    assert.equal(created.status, 201);
    const data = await created.json() as {unsubscribeUrl: string; downloadUrl: string};
    assert.ok(data.downloadUrl.startsWith('/downloads/V79_AI_Prompting_Guide_Premium_FIXED.pdf?token='));
    assert.equal((await fetch(base + data.downloadUrl)).status, 200);
    const confirmation = await fetch(base + data.unsubscribeUrl);
    assert.equal(confirmation.status, 200);
    assert.equal(confirmation.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(confirmation.headers.get('cache-control'), 'no-store');
    assert.match(await confirmation.text(), /method="post"/);
    // Reading the link has not opted out; a repeated signup remains active.
    const unchanged = await (await post(signup)).json() as any;
    assert.equal(unchanged.subscriptionStatus, 'active');
    assert.equal(unchanged.unsubscribeUrl, undefined);
    const token = new URL(data.unsubscribeUrl, base).searchParams.get('token')!;
    const form = (origin: string) => fetch(base + '/newsletter/unsubscribe', {method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded', Origin: origin},
      body: new URLSearchParams({token})});
    assert.equal((await form('https://untrusted.example.test')).status, 403);
    const saved = await form(base);
    assert.equal(saved.status, 200);
    assert.match(await saved.text(), /You are unsubscribed/);
    await stop();
    await start();
    const retry = await (await post(signup)).json() as any;
    assert.equal(retry.subscriptionStatus, 'unsubscribed');
    assert.ok(retry.downloadUrl.startsWith('/downloads/V79_AI_Prompting_Guide_Premium_FIXED.pdf?token='));
    assert.equal((await fetch(base + retry.downloadUrl)).status, 200);
    assert.equal(retry.unsubscribeUrl, undefined);
    assert.equal((await form(base)).status, 200);
    assert.equal((await fetch(base + '/newsletter/unsubscribe?token=forged')).status, 400);
    for (const name of fs.readdirSync(path.join(directory, 'data')).filter(name => /\.db$|-wal$/.test(name))) {
      assert.equal(fs.readFileSync(path.join(directory, 'data', name)).includes(Buffer.from(signup.email)), false);
    }
  } finally {
    await stop();
    fs.rmSync(directory, {recursive: true, force: true});
  }
});
