import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = (name) =>
  JSON.parse(
    readFileSync(new URL(`../content/${name}.json`, import.meta.url), 'utf8'),
  );
const concepts = load('concepts');
const sources = load('sources');
const domains = load('domains');
const meta = load('meta');
const unique = (items, name) =>
  assert.equal(
    new Set(items.map((x) => x.id)).size,
    items.length,
    `Duplicate ${name} ID`,
  );
unique(concepts, 'concept');
unique(sources, 'source');
unique(domains, 'domain');
assert.equal(meta.startedAt, '2026-09');
for (const source of sources) {
  assert.ok(
    !/4205/i.test(JSON.stringify(source)),
    'STAT4205 must remain excluded',
  );
  assert.ok(
    ['course', 'self'].includes(source.kind),
    `Unknown source type: ${source.id}`,
  );
  assert.equal(new URL(source.repository).protocol, 'https:');
}
for (const c of concepts) {
  assert.ok(
    c.title && c.summary && c.english,
    `Missing concept content: ${c.id}`,
  );
  assert.ok(
    domains.some((d) => d.id === c.domain),
    `Unknown domain: ${c.id}`,
  );
  assert.ok(
    c.tags.every((id) => domains.some((d) => d.id === id)),
    `Unknown cross-domain tag: ${c.id}`,
  );
  assert.ok(
    c.sources.length &&
      c.sources.every((id) => sources.some((s) => s.id === id)),
    `Unknown source: ${c.id}`,
  );
  assert.ok(
    c.related.every(
      (id) => id !== c.id && concepts.some((other) => other.id === id),
    ),
    `Dangling or self link: ${c.id}`,
  );
  assert.ok(
    ['recorded', 'planned'].includes(c.coverage),
    `Unknown coverage: ${c.id}`,
  );
  assert.ok(
    ['unassessed', 'encountered', 'explain', 'apply', 'transfer'].includes(
      c.mastery,
    ),
    `Unknown mastery: ${c.id}`,
  );
  assert.ok(
    /^\d{4}-\d{2}-\d{2}$/.test(c.recordedAt) &&
      c.recordedAt >= `${meta.startedAt}-01`,
    `Invalid recording date: ${c.id}`,
  );
}
console.log(
  `Content valid: ${concepts.length} concepts, ${sources.length} sources, ${domains.length} domains. No STAT4205, broken references, or pre-September records.`,
);
