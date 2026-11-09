// Compatibility entrypoint: generate favicon assets from the user's exact
// transparent V79 Digital logo. Do not rewrite website logos or OG images.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'generate-exact-digital-favicons.py');
const result = spawnSync('python3', [script], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
