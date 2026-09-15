/**
 * Vinext beta.5 prerenders '/' instead of basePath + '/' during static export.
 * Render the correct URL for GitHub project Pages, then flatten the asset
 * directory because Pages itself supplies the /knowledge-atlas mount point.
 * Root-path Sites exports use the framework's normal output unchanged.
 */
import assert from 'node:assert/strict';
import { existsSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const base = process.env.PAGES_BASE_PATH || '';
if (base) {
  assert.match(
    base,
    /^\/[a-z0-9-]+$/,
    'Expected a single safe Pages project path',
  );
  const { startProdServer } =
    await import('../node_modules/vinext/dist/server/prod-server.js');
  const { extractRscPayloadFromPrerenderedHtml } =
    await import('../node_modules/vinext/dist/build/prerender.js');
  const { server } = await startProdServer({
    port: 0,
    host: '127.0.0.1',
    outDir: resolve('dist'),
    noCompression: true,
    silent: true,
  });
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const response = await fetch(`http://127.0.0.1:${address.port}${base}/`);
    assert.equal(response.status, 200, 'Project home did not render');
    const html = await response.text();
    assert.ok(
      html.includes('我的知识图谱'),
      'Unexpected project home response',
    );
    const rsc = extractRscPayloadFromPrerenderedHtml(html);
    assert.ok(rsc, 'Missing hydration payload');
    writeFileSync('dist/client/index.html', html);
    writeFileSync('dist/client/index.rsc', rsc);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  const nested = resolve('dist/client', base.slice(1), '_next');
  if (existsSync(nested)) {
    assert.ok(
      !existsSync('dist/client/_next'),
      'Refusing to overwrite existing assets',
    );
    renameSync(nested, 'dist/client/_next');
    rmSync(resolve('dist/client', base.slice(1)), { recursive: true });
  }
  console.log(`Prepared project export for ${base}/`);
}
