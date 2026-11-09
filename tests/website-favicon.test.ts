import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path));
const version = 'v79-digital-exact-upload-20261109-r5';

test('website favicon is derived from the exact uploaded V79 Digital logo, not Hub or another ribbon', () => {
  const master = read('branding/V79_Digital_Logo_Transparent.png');
  assert.equal(
    createHash('sha256').update(master).digest('hex'),
    'a6dc14ca0ccf3d50b42f19761589f204c6c68210ead03cec8d7725a209e7d753',
  );
  assert.equal(master.readUInt32BE(16), 939);
  assert.equal(master.readUInt32BE(20), 760);

  const sizes: Record<string, number> = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon.png': 64,
    'apple-touch-icon.png': 180,
  };
  for (const [file, size] of Object.entries(sizes)) {
    const png = read('public/' + file);
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file);
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }

  const ico = read('public/favicon.ico');
  assert.equal(ico.subarray(0, 4).toString('hex'), '00000100');
  assert.ok(ico.readUInt16LE(4) >= 4, 'ICO contains multiple real resolutions');

  const svg = read('public/favicon.svg').toString('utf8');
  assert.match(svg, /^<svg[^>]+viewBox="0 0 512 512"/);
  assert.match(svg, /data:image\/png;base64,/);
  assert.doesNotMatch(svg, /v79grad|favicon\.svg\?v=v79-symbol/);

  for (const page of ['index.html', 'admin.html']) {
    const html = read(page).toString('utf8');
    for (const asset of ['favicon.svg', 'favicon-32x32.png',
                         'favicon-16x16.png', 'favicon.ico', 'apple-touch-icon.png']) {
      assert.ok(html.includes('/' + asset + '?v=' + version), page + ' includes ' + asset);
    }
  }
});
