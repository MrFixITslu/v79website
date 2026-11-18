import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DESIGN_RELEASE, PAGES, META } from '../shared/website-design';

const root = process.cwd();
const source = (name: string) => readFileSync(join(root, name), 'utf8');

test('Hub-first public renderer is canonical without discarding GitHub resources', () => {
  assert.equal(DESIGN_RELEASE, 'v93-complete-20261114-r1');
  for (const route of ['/', '/services', '/services/managed-it-support', '/services/cybersecurity',
    '/services/cloud-backup', '/services/ai-automation', '/services/business-software',
    '/contact', '/faq', '/apps/hub', '/apps/tiquet', '/apps/pos']) {
    assert.ok(PAGES[route]?.includes('<'), 'Missing real V9.3 design page: ' + route);
    assert.ok(META[route]?.[0]?.length > 8, 'Missing page metadata: ' + route);
  }
  assert.match(PAGES['/'], /One connected ecosystem/);
  assert.match(PAGES['/'], /A smarter way to work/);
  assert.ok(PAGES['/'].indexOf('id="apps"') < PAGES['/'].indexOf('id="services"'), 'Ecosystem precedes other services');
  assert.match(PAGES['/'], /href="\/solutions">Explore the V79 ecosystem/);
  assert.match(META['/'][0], /^V79 Hub Ecosystem/);
  assert.match(PAGES['/'], /Illustrative/);
  assert.match(PAGES['/'], /href=\\?"\\?\/contact/);
  assert.match(source('src/public-site.js'), /PAGES,META/);
  assert.match(source('src/public-site.js'), /initContact/);
  assert.match(source('server.ts'), /renderDesignPage/);
  assert.match(source('server.ts'), /\/api\/admin\/crm\/leads/);
  assert.match(source('server.ts'), /\/api\/admin\/hub-sso/);
  for (const name of ['src/components/HybridHomePage.tsx', 'src/components/OfferingPages.tsx',
    'src/data/siteOfferings.ts', 'public/faq-v79.html', 'public/guides/chatgpt-skills.html',
    'public/guides/chatgpt-task-automation.html']) {
    assert.ok(existsSync(join(root, name)), 'Preserved GitHub-only resource missing: ' + name);
  }
});

test('Explore our services places Software and SaaS first and keeps the remaining service order', () => {
  const section = PAGES['/services'].split('Explore our services')[1].split('How we work')[0];
  const cards = [...section.matchAll(/href="\/services\/([^"\/]+)"[\s\S]*?<span class="card-index">(\d\d) · /g)];
  assert.deepEqual(cards.map(card => card[1]), ['business-software', 'website-design', 'managed-it-support', 'cybersecurity', 'cloud-backup', 'networks-voip', 'ai-automation']);
  assert.deepEqual(cards.map(card => card[2]), ['01', '02', '03', '04', '05', '06', '07']);
});
