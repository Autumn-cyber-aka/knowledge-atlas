import assert from 'node:assert/strict';
import {
  readFileSync,
  readdirSync,
  lstatSync,
  mkdirSync,
  writeFileSync,
  renameSync,
} from 'node:fs';
import { resolve, join, basename } from 'node:path';
export const domainIds = ['math', 'statistics', 'cs', 'engineering', 'ai'];
export const masteryValues = [
  'unassessed',
  'encountered',
  'explain',
  'apply',
  'transfer',
];
export const formats = [
  'course',
  'book',
  'article',
  'project',
  'repository',
  'video',
  'notes',
];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validId(id) {
  return typeof id === 'string' && idPattern.test(id);
}
const object = (v, context) =>
  assert.ok(
    v && typeof v === 'object' && !Array.isArray(v),
    `${context}: expected an object`,
  );
const text = (v, context, required = false) =>
  assert.ok(
    typeof v === 'string' && (!required || v.trim().length),
    `${context}: expected ${required ? 'non-empty ' : ''}text`,
  );
const list = (v, context) => {
  assert.ok(Array.isArray(v), `${context}: expected an array`);
  assert.ok(
    v.every((x) => typeof x === 'string'),
    `${context}: expected string IDs`,
  );
  assert.equal(new Set(v).size, v.length, `${context}: duplicate entries`);
};
const date = (v, context) => {
  assert.ok(
    typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v),
    `${context}: invalid date`,
  );
  const parsed = new Date(v);
  assert.ok(
    Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === v,
    `${context}: invalid calendar date`,
  );
};
const url = (v, context) => {
  if (!v) return;
  text(v, context);
  let parsed;
  try {
    parsed = new URL(v);
  } catch {
    assert.fail(`${context}: invalid URL`);
  }
  assert.ok(
    parsed.protocol === 'https:' || parsed.protocol === 'http:',
    `${context}: only HTTP(S) links are allowed`,
  );
  assert.ok(
    !parsed.username && !parsed.password && !parsed.searchParams.has('token'),
    `${context}: no embedded credentials`,
  );
};
function unique(records, kind) {
  const seen = new Set();
  for (const record of records) {
    object(record, kind);
    assert.ok(validId(record.id), `${kind}: invalid ID`);
    assert.ok(!seen.has(record.id), `Duplicate ${kind} ID: ${record.id}`);
    seen.add(record.id);
  }
  return seen;
}
export function validateCatalog(catalog) {
  object(catalog, 'catalog');
  const { meta, domains, sources, concepts } = catalog;
  object(meta, 'meta');
  assert.equal(meta.schemaVersion, 1, 'Unsupported content schema version');
  assert.equal(meta.startedAt, '2026-09', 'Recording begins September 2026');
  date(meta.updatedAt, 'meta.updatedAt');
  assert.ok(
    meta.updatedAt >= `${meta.startedAt}-01`,
    'Updated date predates start',
  );
  text(meta.owner, 'meta.owner', true);
  text(meta.scope, 'meta.scope', true);
  for (const [key, rows] of Object.entries({ domains, sources, concepts }))
    assert.ok(Array.isArray(rows), `${key}: expected array`);
  const domainSet = unique(domains, 'domain'),
    sourceSet = unique(sources, 'source'),
    conceptSet = unique(concepts, 'concept');
  assert.deepEqual(
    [...domainSet].sort((a, b) => a.localeCompare(b)),
    [...domainIds].sort((a, b) => a.localeCompare(b)),
    'Keep the five canonical domains',
  );
  domains.forEach((d) => {
    text(d.name, `${d.id}.name`, true);
    text(d.english, `${d.id}.english`, true);
    assert.match(d.color, /^#[\da-fA-F]{6}$/, `Invalid domain color: ${d.id}`);
  });
  for (const s of sources) {
    assert.ok(
      !/stat[\s_-]*4205/i.test(`${s.id} ${s.label} ${s.url || ''}`),
      'STAT4205 remains excluded',
    );
    ['label', 'title'].forEach((key) => text(s[key], `${s.id}.${key}`, true));
    assert.ok(
      ['course', 'self'].includes(s.kind),
      `Unknown source kind: ${s.id}`,
    );
    assert.ok(formats.includes(s.format), `Unknown source format: ${s.id}`);
    ['name', 'term', 'institution', 'accessNote'].forEach((key) => {
      if (s[key] !== undefined) text(s[key], `${s.id}.${key}`);
    });
    assert.equal(
      typeof s.private,
      'boolean',
      `Source privacy must be explicit: ${s.id}`,
    );
    url(s.url, `${s.id}.url`);
    url(s.referenceUrl, `${s.id}.referenceUrl`);
  }
  for (const c of concepts) {
    ['title', 'topic'].forEach((key) => text(c[key], `${c.id}.${key}`, true));
    ['english', 'summary', 'personalNote', 'evidence'].forEach((key) =>
      text(c[key], `${c.id}.${key}`),
    );
    assert.ok(domainSet.has(c.domain), `Unknown domain: ${c.id}`);
    list(c.tags, `${c.id}.tags`);
    assert.ok(
      c.tags.every((id) => domainSet.has(id) && id !== c.domain),
      `Invalid cross-domain tag: ${c.id}`,
    );
    list(c.sources, `${c.id}.sources`);
    assert.ok(
      c.sources.length && c.sources.every((id) => sourceSet.has(id)),
      `Unknown or missing source: ${c.id}`,
    );
    list(c.related, `${c.id}.related`);
    assert.ok(
      c.related.every((id) => id !== c.id && conceptSet.has(id)),
      `Dangling or self link: ${c.id}`,
    );
    assert.ok(
      ['recorded', 'planned'].includes(c.coverage),
      `Unknown coverage: ${c.id}`,
    );
    assert.ok(masteryValues.includes(c.mastery), `Unknown mastery: ${c.id}`);
    date(c.recordedAt, `${c.id}.recordedAt`);
    assert.ok(
      c.recordedAt >= `${meta.startedAt}-01`,
      `Record predates September 2026: ${c.id}`,
    );
  }
  return catalog;
}
function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
function readRecords(root, dir) {
  const rows = readdirSync(join(root, 'content', dir))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const path = join(root, 'content', dir, name);
      assert.ok(
        !lstatSync(path).isSymbolicLink(),
        `Content records cannot be symlinks: ${name}`,
      );
      const row = readJson(path);
      assert.equal(
        row.id,
        basename(name, '.json'),
        `Record ID must match filename: ${name}`,
      );
      return row;
    });
  return rows.sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) -
        (b.order ?? Number.MAX_SAFE_INTEGER) || a.id.localeCompare(b.id, 'en'),
  );
}
export function readCatalog(root = process.cwd()) {
  return validateCatalog({
    meta: readJson(join(root, 'content/meta.json')),
    domains: readJson(join(root, 'content/domains.json')),
    sources: readRecords(root, 'sources'),
    concepts: readRecords(root, 'concepts'),
  });
}
export function buildCatalog(root = process.cwd()) {
  const catalog = readCatalog(root);
  const directory = resolve(root, '.generated');
  mkdirSync(directory, { recursive: true });
  const target = join(directory, 'catalog.json');
  const tmp = target + '.tmp';
  writeFileSync(tmp, JSON.stringify(catalog, null, 2) + '\n');
  renameSync(tmp, target);
  return catalog;
}
