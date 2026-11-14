import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (name: string) => readFileSync(join(root, name));

test('accepted V9.3 brand icons remain valid and linked in the actual public entry', () => {
  assert.ok(existsSync(join(root, 'branding/V79_Digital_Logo_Transparent.png')));
  const sizes: Record<string, number> = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon.png': 64,
    'apple-touch-icon.png': 180,
  };
  for (const [name, size] of Object.entries(sizes)) {
    const png = read('public/' + name);
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', name + ' PNG signature');
    assert.equal(png.readUInt32BE(16), size, name + ' width');
    assert.equal(png.readUInt32BE(20), size, name + ' height');
  }
  const ico = read('public/favicon.ico');
  assert.equal(ico.subarray(0, 4).toString('hex'), '00000100');
  const svg = read('public/favicon.svg').toString('utf8');
  assert.match(svg, /<svg/);
  assert.doesNotMatch(svg, /v79grad|favicon\.svg\?v=v79-symbol/);
  const html = read('index.html').toString('utf8');
  for (const asset of ['favicon.ico', 'favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png']) {
    assert.ok(html.includes('/' + asset), 'Canonical homepage missing icon: ' + asset);
  }
});
