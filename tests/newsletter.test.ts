import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {mountNewsletter, subscribe, unsubscribe, unsubscribeUrl, validUnsubscribe, GUIDE_DOWNLOAD} from '../server/newsletter.ts';
import type {NewsletterStore, Subscriber} from '../server/newsletter.ts';

function memory(initial: Subscriber[] = []) {
  let rows = structuredClone(initial), writes = 0, fail = false;
  const store: NewsletterStore = {
    key: Buffer.alloc(32, 7), read: () => structuredClone(rows),
    encrypt: value => 'encrypted:' + Buffer.from(value).toString('base64'),
    write: next => {if (fail) throw Error('private storage details'); rows = structuredClone(next); writes++;},
    transaction: fn => {const before = structuredClone(rows); try {return fn();} catch (error) {rows = before; throw error;}},
  };
  return {store, rows: () => structuredClone(rows), writes: () => writes, fail: () => {fail = true;}};
}
const signup = {firstName: 'Test', email: 'test@example.test', consent: true};
function token(url: string) {return new URL(url, 'https://example.test').searchParams.get('token')!;}

test('explicit consent, encrypted fields and a single durable subscription; retry reveals no bearer link', () => {
  const m = memory();
  assert.throws(() => subscribe(m.store, {...signup, consent: 'true'}), /CONSENT_REQUIRED/);
  assert.equal(m.writes(), 0);
  const first = subscribe(m.store, signup);
  assert.equal(first.status, 201);
  assert.equal(first.downloadUrl, GUIDE_DOWNLOAD);
  assert.equal(m.rows()[0].email.startsWith('encrypted:'), true);
  assert.equal(m.rows()[0].consent, true);
  assert.equal(validUnsubscribe(m.store, token(first.unsubscribeUrl!)), true);
  const again = subscribe(m.store, {...signup, email: ' TEST@EXAMPLE.TEST '});
  assert.equal(again.status, 200);
  assert.equal(again.alreadySubscribed, true);
  assert.equal('unsubscribeUrl' in again, false);
  assert.equal(m.rows().length, 1);
  assert.equal(m.writes(), 1);
});

test('GET validation does not unsubscribe; POST is idempotent and later signup preserves opt-out', () => {
  const m = memory();
  const first = subscribe(m.store, signup, '2026-10-28T16:00:00Z');
  const t = token(first.unsubscribeUrl!);
  assert.equal(validUnsubscribe(m.store, t), true);
  assert.equal(m.rows()[0].status, 'active');
  assert.equal(m.writes(), 1);
  assert.equal(unsubscribe(m.store, t, '2026-10-28T17:00:00Z'), true);
  const saved = m.rows();
  assert.equal(saved[0].status, 'unsubscribed');
  assert.equal(saved[0].consent, false);
  assert.equal(saved[0].consentedAt, '2026-10-28T16:00:00Z');
  assert.equal(saved[0].consentRevokedAt, '2026-10-28T17:00:00Z');
  assert.equal(unsubscribe(m.store, t, '2026-10-29T00:00:00Z'), true);
  const retry = subscribe(m.store, signup);
  assert.equal(retry.subscriptionStatus, 'unsubscribed');
  assert.equal(retry.downloadUrl, GUIDE_DOWNLOAD);
  assert.deepEqual(m.rows(), saved);
  assert.equal(m.writes(), 2);
});

test('forged, malformed and cross-address unsubscribe tokens cannot modify subscriptions', () => {
  const m = memory();
  const first = subscribe(m.store, signup);
  subscribe(m.store, {...signup, email: 'other@example.test'});
  const t = token(first.unsubscribeUrl!);
  for (const wrong of [undefined, [], '<script>', '1.abc', '2.' + t.split('.')[1], t.replace(/.$/, t.endsWith('0') ? '1' : '0')]) {
    assert.equal(unsubscribe(m.store, wrong), false);
  }
  assert.equal(m.rows().every(row => row.status === 'active'), true);
  assert.equal(m.writes(), 2);
});

test('legacy records get stable signed links without mutation; stronger suppressions remain suppressed', () => {
  const emailHash = crypto.createHash('sha256').update(signup.email).digest('hex');
  const legacy: Subscriber = {id: 4, emailHash, email: 'encrypted', firstName: '', status: 'complained', consent: true,
    createdAt: '2025-01-01', consentVersion: 'old-version'};
  const m = memory([legacy]);
  const url = unsubscribeUrl(legacy, m.store.key);
  assert.equal(m.writes(), 0);
  assert.equal(unsubscribe(m.store, token(url)), true);
  assert.equal(m.rows()[0].status, 'complained');
  assert.equal(m.rows()[0].consent, false);
  assert.equal(m.rows()[0].consentedAt, '2025-01-01');
  assert.equal(m.rows()[0].consentVersion, 'old-version');
  subscribe(m.store, signup);
  assert.equal(m.rows()[0].status, 'complained');
});

test('duplicate legacy records cannot bypass suppression', () => {
  const emailHash = crypto.createHash('sha256').update(signup.email).digest('hex');
  const row: Subscriber = {id: 1, emailHash, email: 'encrypted', firstName: '', status: 'active', consent: true};
  const m = memory([row, {...row, id: 2, status: 'unsubscribed', consent: false}]);
  assert.equal(subscribe(m.store, signup).subscriptionStatus, 'unsubscribed');
  assert.equal(m.writes(), 0);
  assert.equal(unsubscribe(m.store, token(unsubscribeUrl(row, m.store.key))), true);
  assert.equal(m.rows().every(row => row.status === 'unsubscribed'), true);
});

function routes(m: ReturnType<typeof memory>) {
  const handlers = new Map<string, any[]>();
  const app = {get: (path: string, ...h: any[]) => handlers.set('GET ' + path, h),
    post: (path: string, ...h: any[]) => handlers.set('POST ' + path, h)};
  const next = (_req: any, _res: any, next: () => void) => next();
  mountNewsletter(app as any, m.store, next as any, next as any);
  function request(method: string, path: string, body: any = {}, query: any = {}) {
    let status = 200, data: any, headers: Record<string, string> = {};
    const response = {status: (s: number) => {status = s; return response;},
      set: (h: Record<string, string>) => {headers = {...headers, ...h}; return response;},
      type: () => response, json: (d: any) => {data = d; return response;},
      send: (d: any) => {data = d; return response;}};
    const chain = handlers.get(method + ' ' + path)!;
    let i = 0;
    function run() {const handler = chain[i++]; if (handler) handler({body, query}, response, run);}
    run();
    return {status, data, headers};
  }
  return request;
}

test('mounted confirmation/submit handlers retain privacy headers, reject injection, and persist opt-out', () => {
  const m = memory(), request = routes(m);
  const created = request('POST', '/api/newsletter/subscribe', signup);
  const t = token(created.data.unsubscribeUrl);
  const get = request('GET', '/newsletter/unsubscribe', {}, {token: t});
  assert.equal(get.status, 200);
  assert.match(get.data, /method="post"/);
  assert.equal(get.headers['Referrer-Policy'], 'no-referrer');
  assert.equal(get.headers['Cache-Control'], 'no-store');
  assert.equal(m.rows()[0].status, 'active');
  assert.equal(request('POST', '/newsletter/unsubscribe', {token: t}).status, 200);
  assert.equal(m.rows()[0].status, 'unsubscribed');
  const invalid = request('GET', '/newsletter/unsubscribe', {}, {token: '\"><script>alert(1)</script>'});
  assert.equal(invalid.status, 400);
  assert.equal(invalid.data.includes('<script>'), false);
});

test('honeypot does not write; storage failures never return false success or private errors', () => {
  const m = memory(), request = routes(m);
  assert.equal(request('POST', '/api/newsletter/subscribe', {...signup, website: 'bot'}).status, 200);
  assert.equal(m.writes(), 0);
  const first = request('POST', '/api/newsletter/subscribe', signup);
  m.fail();
  const failed = request('POST', '/newsletter/unsubscribe', {token: token(first.data.unsubscribeUrl)});
  assert.equal(failed.status, 503);
  assert.equal(failed.data.includes('private storage'), false);
  assert.equal(m.rows()[0].status, 'active');
  assert.equal(request('POST', '/api/newsletter/subscribe', {...signup, email: 'new@example.test'}).status, 500);
});
