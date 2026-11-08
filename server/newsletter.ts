import crypto from 'node:crypto';
import type {Express, RequestHandler} from 'express';

export const GUIDE_DOWNLOAD = '/downloads/V79_AI_Prompting_Guide_Premium_FIXED.pdf';
export type Subscriber = {
  id: number; emailHash: string; email: string; firstName: string; status: string;
  consent: boolean; consentVersion?: string; createdAt?: string; updatedAt?: string;
  consentedAt?: string; unsubscribedAt?: string; consentRevokedAt?: string;
  [key: string]: unknown;
};
export type NewsletterStore = {
  read: () => Subscriber[];
  write: (rows: Subscriber[]) => void;
  transaction: <T>(fn: () => T) => T;
  encrypt: (value: string) => string;
  key: Buffer;
};

function signature(row: Subscriber, key: Buffer): string {
  return crypto.createHmac('sha256', key)
    .update(`vision79:newsletter:unsubscribe:v1:${row.id}:${row.emailHash}`).digest('hex');
}

export function unsubscribeUrl(row: Subscriber, key: Buffer): string {
  if (!Number.isSafeInteger(row.id) || row.id < 1 || !/^[a-f0-9]{64}$/.test(row.emailHash)) {
    throw Error('INVALID_NEWSLETTER_IDENTITY');
  }
  return `/newsletter/unsubscribe?token=${row.id}.${signature(row, key)}`;
}

function tokenSubscriber(rows: Subscriber[], token: unknown, key: Buffer): Subscriber | undefined {
  if (typeof token !== 'string' || !/^[1-9]\d{0,15}\.[a-f0-9]{64}$/.test(token)) return;
  const [id, supplied] = token.split('.');
  if (!Number.isSafeInteger(Number(id))) return;
  const row = rows.find(row => row.id === Number(id));
  if (!row || !/^[a-f0-9]{64}$/.test(row.emailHash)) return;
  return crypto.timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(signature(row, key), 'hex')) ? row : undefined;
}

export function subscribe(store: NewsletterStore, input: Record<string, unknown>, now = new Date().toISOString()) {
  const firstName = typeof input.firstName === 'string' ? input.firstName.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (input.consent !== true) throw Error('CONSENT_REQUIRED');
  if (firstName.length > 80) throw Error('FIRST_NAME_TOO_LONG');
  if (!email || email.length > 250 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('INVALID_EMAIL');
  const source = typeof input.source === 'string' ? input.source.trim().slice(0, 200) : 'Website Newsletter';
  const pageOrigin = typeof input.pageOrigin === 'string' ? input.pageOrigin.trim().slice(0, 200) : '/free-ai-prompting-guide';
  const emailHash = crypto.createHash('sha256').update(email).digest('hex');
  return store.transaction(() => {
    const rows = store.read();
    const matches = rows.filter(row => row.emailHash === emailHash);
    const existing = matches.find(row => row.status !== 'active' || row.consent !== true) || matches[0];
    if (existing) {
      // A public signup cannot prove address ownership or undo an opt-out,
      // bounce, complaint or any other suppression. Never mint its bearer link.
      const active = existing.status === 'active' && existing.consent === true;
      return {status: 200, success: true, alreadySubscribed: active,
        subscriptionStatus: active ? 'active' : 'unsubscribed', downloadUrl: GUIDE_DOWNLOAD};
    }
    const id = rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
    const row: Subscriber = {id, firstName: store.encrypt(firstName), email: store.encrypt(email), emailHash,
      status: 'active', source, pageOrigin, consent: true, consentVersion: '2026-10-ai-guide-v1',
      consentedAt: now, createdAt: now, updatedAt: now};
    const manageUrl = unsubscribeUrl(row, store.key);
    rows.push(row);
    store.write(rows);
    // The capability is returned only to this new signup, never for an existing address.
    return {status: 201, success: true, alreadySubscribed: false, subscriptionStatus: 'active',
      downloadUrl: GUIDE_DOWNLOAD, unsubscribeUrl: manageUrl};
  });
}

export function validUnsubscribe(store: NewsletterStore, token: unknown): boolean {
  if (typeof token !== 'string' || !/^[1-9]\d{0,15}\.[a-f0-9]{64}$/.test(token)) return false;
  return Boolean(tokenSubscriber(store.read(), token, store.key));
}

export function unsubscribe(store: NewsletterStore, token: unknown, now = new Date().toISOString()): boolean {
  return store.transaction(() => {
    const rows = store.read();
    const subscriber = tokenSubscriber(rows, token, store.key);
    if (!subscriber) return false;
    let changed = false;
    for (const row of rows.filter(row => row.emailHash === subscriber.emailHash)) {
      if (row.status === 'active') {
        row.status = 'unsubscribed';
        changed = true;
      }
      // Preserve stronger bounce/complaint suppressions and the original consent evidence.
      if (row.consent !== false || !row.consentRevokedAt || !row.unsubscribedAt) {
        row.consentedAt ||= row.createdAt;
        row.consent = false;
        row.consentRevokedAt ||= now;
        row.unsubscribedAt ||= now;
        row.updatedAt = now;
        changed = true;
      }
    }
    if (changed) store.write(rows);
    return true;
  });
}

function page(kind: 'confirm' | 'done' | 'invalid', token = ''): string {
  const title = kind === 'confirm' ? 'Unsubscribe from the newsletter' : kind === 'done' ? 'You are unsubscribed' : 'Newsletter preferences';
  const content = kind === 'confirm'
    ? `<p>Stop occasional Vision79 Digital newsletter emails. This does not change your account or support services.</p>
       <form method="post" action="/newsletter/unsubscribe"><input type="hidden" name="token" value="${token}"><button type="submit">Unsubscribe</button></form>`
    : kind === 'done'
      ? '<p>Your newsletter opt-out has been saved. Your account, support services and access to the free guide are unchanged.</p>'
      : '<p>This unsubscribe link is missing or invalid. Use your saved unsubscribe link or <a href="/contact">contact us</a> to request removal.</p>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} | Vision79 Digital</title></head><body><main><p>Vision79 Digital</p><h1>${title}</h1>${content}<p><a href="/free-ai-prompting-guide">Free AI prompting guide</a> · <a href="/privacy">Privacy policy</a></p></main></body></html>`;
}

export function mountNewsletter(app: Express, store: NewsletterStore, limiter: RequestHandler, formParser: RequestHandler) {
  const privatePage: RequestHandler = (_req, res, next) => {
    res.set({'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow'});
    next();
  };
  app.post('/api/newsletter/subscribe', limiter, (req, res) => {
    if (typeof req.body?.website === 'string' && req.body.website.trim()) {
      return res.status(200).json({success: true, downloadUrl: GUIDE_DOWNLOAD});
    }
    try {
      const {status, ...body} = subscribe(store, req.body || {});
      return res.status(status).json(body);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      const messages: Record<string, string> = {
        CONSENT_REQUIRED: 'Please confirm that you want to join the free Vision79 Digital newsletter.',
        FIRST_NAME_TOO_LONG: 'First name is too long.', INVALID_EMAIL: 'Please enter a valid email address.'};
      return res.status(messages[code] ? 400 : 500).json({error: messages[code] || 'We could not complete your signup. Please try again.'});
    }
  });
  // GET never changes subscription state: link scanners must not opt users out.
  app.get('/newsletter/unsubscribe', privatePage, limiter, (req, res) => {
    try {
      const valid = validUnsubscribe(store, req.query.token);
      return res.status(valid ? 200 : 400).type('html').send(page(valid ? 'confirm' : 'invalid', valid ? String(req.query.token) : ''));
    } catch {
      return res.status(503).type('html').send('<p>Newsletter preferences are temporarily unavailable. Please try again.</p>');
    }
  });
  app.post('/newsletter/unsubscribe', privatePage, limiter, formParser, (req, res) => {
    try {
      const valid = unsubscribe(store, req.body?.token);
      return res.status(valid ? 200 : 400).type('html').send(page(valid ? 'done' : 'invalid'));
    } catch {
      return res.status(503).type('html').send('<p>Your preference could not be saved. Please try again.</p>');
    }
  });
}
