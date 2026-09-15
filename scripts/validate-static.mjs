import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const base = process.argv[2] || process.env.PAGES_BASE_PATH || '';
const directory = resolve('dist/client');
const html = readFileSync(resolve(directory, 'index.html'), 'utf8');
assert.ok(html.includes('2026 年 9 月'), 'Missing recording start disclosure');
assert.ok(html.includes('个人知识图谱'), 'Missing page metadata');
assert.ok(
  !html.includes('STAT4205') && !html.includes('Building your site'),
  'Unexpected excluded/starter content',
);
let checked = 0;
for (const [, url] of html.matchAll(
  /(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g,
)) {
  if (!url.startsWith('/') || !/\.(?:js|css|svg|woff2?)$/.test(url)) continue;
  assert.ok(
    !base || url.startsWith(base + '/'),
    `Missing project base path: ${url}`,
  );
  const local = url.slice(base.length).replace(/^\//, '');
  assert.ok(
    existsSync(resolve(directory, local)),
    `Missing static asset: ${url}`,
  );
  checked++;
}
assert.ok(checked > 0, 'No assets validated');
writeFileSync(resolve(directory, '.nojekyll'), '');
console.log(
  `Static export valid: ${checked} resource references, base path ${base || '/'}.`,
);
