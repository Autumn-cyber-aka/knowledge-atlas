import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { buildCatalog } from './atlas/catalog.mjs';
buildCatalog();
const child = spawn(
  process.execPath,
  ['node_modules/vinext/dist/cli.js', 'dev', ...process.argv.slice(2)],
  { stdio: 'inherit' },
);
let timer;
const watcher = watch('content', { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      const data = buildCatalog();
      console.log(`Content refreshed: ${data.concepts.length} concepts.`);
    } catch (error) {
      console.error(
        `Content update rejected; fix the record to refresh: ${error.message}`,
      );
    }
  }, 150);
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    watcher.close();
    clearTimeout(timer);
    child.kill(signal);
  });
child.on('exit', (code) => {
  watcher.close();
  clearTimeout(timer);
  process.exitCode = code ?? 0;
});
