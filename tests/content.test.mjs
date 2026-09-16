import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  cpSync,
  rmSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  readCatalog,
  buildCatalog,
  validateCatalog,
} from '../scripts/atlas/catalog.mjs';
import { createRecord } from '../scripts/atlas/create-record.mjs';
const existing = readCatalog();
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'atlas-test-'));
  cpSync('content', join(root, 'content'), { recursive: true });
  return root;
};
await test('a new semester and a self-study book join an existing concept without duplicating it', () => {
  const root = fixture();
  try {
    createRecord(root, 'source', {
      id: 'test-next-course',
      title: 'Test course',
      kind: 'course',
      term: '2027 Spring',
      institution: 'Test school',
      private: true,
    });
    createRecord(root, 'source', {
      id: 'test-book',
      title: 'Test book',
      kind: 'self',
      format: 'book',
      url: 'https://example.org/book',
    });
    const path = join(root, 'content/concepts/conditional-probability.json');
    const concept = JSON.parse(readFileSync(path, 'utf8'));
    concept.sources.push('test-next-course', 'test-book');
    writeFileSync(path, JSON.stringify(concept));
    const result = buildCatalog(root);
    assert.equal(result.concepts.length, existing.concepts.length);
    assert.equal(result.sources.length, existing.sources.length + 2);
    assert.equal(result.sources.find((s) => s.id === 'test-book').kind, 'self');
    const updated = result.concepts.find((c) => c.id === concept.id);
    assert.equal(updated.sources.length, 3);
    assert.equal(updated.mastery, 'unassessed');
    assert.equal(updated.recordedAt, concept.recordedAt);
    assert.equal(
      JSON.parse(readFileSync(join(root, '.generated/catalog.json'))).sources
        .length,
      result.sources.length,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
await test('new concepts remain unassessed and preserve genuine empty notes', () => {
  const root = fixture();
  try {
    const path = createRecord(root, 'concept', {
      id: 'test-new-topic',
      title: 'Test new topic',
      domain: 'math',
      source: 'coms3261',
      date: '2026-09-16',
    });
    const c = JSON.parse(readFileSync(path));
    assert.equal(c.mastery, 'unassessed');
    assert.equal(c.personalNote, '');
    assert.equal(c.summary, '');
    assert.equal(
      readCatalog(root).concepts.length,
      existing.concepts.length + 1,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
await test('creation rejects traversal and duplicate IDs without touching records', () => {
  const root = fixture();
  try {
    const before = readFileSync(
      join(root, 'content/concepts/sets.json'),
      'utf8',
    );
    assert.throws(
      () => createRecord(root, 'concept', { id: '../escape', title: 'No' }),
      /ID/,
    );
    assert.throws(
      () => createRecord(root, 'concept', { id: 'sets', title: 'No' }),
      /already exists/,
    );
    assert.equal(
      readFileSync(join(root, 'content/concepts/sets.json'), 'utf8'),
      before,
    );
    assert.ok(!existsSync(join(root, 'content/escape.json')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
await test('invalid new records roll back rather than poisoning the registry', () => {
  const root = fixture();
  try {
    assert.throws(
      () =>
        createRecord(root, 'concept', {
          id: 'test-bad',
          title: 'Bad',
          domain: 'math',
          source: 'missing-source',
          date: '2026-09-16',
        }),
      /source/,
    );
    assert.ok(!existsSync(join(root, 'content/concepts/test-bad.json')));
    assert.equal(readCatalog(root).concepts.length, existing.concepts.length);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
await test('catalog rejects broken associations, unsafe URLs, impossible dates and excluded course', () => {
  const mutate = (fn) => {
    const data = structuredClone(existing);
    fn(data);
    return data;
  };
  assert.throws(
    () =>
      validateCatalog(
        mutate((d) => d.concepts[0].related.push('missing-concept')),
      ),
    /Dangling/,
  );
  assert.throws(
    () =>
      validateCatalog(
        mutate((d) => d.concepts[0].sources.push('missing-source')),
      ),
    /source/,
  );
  assert.throws(
    () =>
      validateCatalog(
        mutate((d) => (d.sources[0].url = 'javascript:alert(1)')),
      ),
    /HTTP/,
  );
  assert.throws(
    () =>
      validateCatalog(
        mutate((d) => (d.sources[0].url = 'https://example.org/?token=secret')),
      ),
    /credentials/,
  );
  assert.throws(
    () =>
      validateCatalog(mutate((d) => (d.concepts[0].recordedAt = '2026-09-31'))),
    /calendar/,
  );
  assert.throws(
    () =>
      validateCatalog(mutate((d) => (d.concepts[0].recordedAt = '2026-08-31'))),
    /predates/,
  );
  assert.throws(
    () => validateCatalog(mutate((d) => (d.sources[0].label = 'STAT 4205'))),
    /excluded/,
  );
  assert.throws(
    () => validateCatalog(mutate((d) => d.concepts.push({ ...d.concepts[0] }))),
    /Duplicate/,
  );
});
