import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const source = (name: string) => readFileSync(join(root, name), 'utf8');

test('approved November 2026 modern homepage remains the website source', () => {
  const app = source('src/App.tsx');
  const home = source('src/components/HybridHomePage.tsx');
  const server = source('server.ts');

  assert.match(app, /HybridHomePage/);
  assert.match(app, /getServicePage/);
  assert.match(app, /getProductPage/);
  assert.match(home, /Technology that helps your business/);
  assert.match(home, /What better technology makes possible/);

  assert.match(server, /Technology that helps your business move forward/);
  assert.match(server, /\/services\/managed-it-support/);
  assert.match(server, /\/software\/hub/);
  assert.match(server, /faq-v79\.html/);
  assert.match(server, /'\/resources', '\/resources\/'/);
  assert.match(server, /\/api\/admin\/hub-sso/);
  assert.match(server, /\/api\/admin\/crm\/leads/);

  for (const name of [
    'src/components/OfferingPages.tsx',
    'src/components/ServiceExperience.tsx',
    'src/data/siteOfferings.ts',
    'public/faq-v79.html',
    'public/guides/chatgpt-skills.html',
    'public/guides/chatgpt-task-automation.html',
    'public/resources/chatgpt-skills-how-to.html',
    'public/illustrations/service-stories-v2/cloud-equipment.webp',
    'public/illustrations/service-stories-v2/network-hardware.webp',
    'public/illustrations/service-stories-v2/security-equipment.webp',
    'public/illustrations/service-stories-v2/support-workplace.webp',
    'public/illustrations/service-stories-v2/human-review.webp',
  ]) {
    assert.ok(existsSync(join(root, name)), 'Missing modern website asset: ' + name);
  }
  assert.match(source('index.html'), /v79-digital-exact-upload-20261109-r5/);
  assert.match(source('admin.html'), /v79-digital-exact-upload-20261109-r5/);
});
