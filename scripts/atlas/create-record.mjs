import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { readCatalog, validId } from './catalog.mjs';
export function createRecord(root, kind, options) {
  assert.ok(['source', 'concept'].includes(kind), 'Choose source or concept');
  const { id, title } = options;
  assert.ok(
    validId(id),
    'ID must be lowercase letters/numbers separated by hyphens',
  );
  assert.ok(typeof title === 'string' && title.trim(), 'Provide a title');
  const data = readCatalog(root);
  const records = kind === 'source' ? data.sources : data.concepts;
  assert.ok(
    !records.some((record) => record.id === id),
    `ID already exists: ${id}`,
  );
  if (kind === 'concept')
    assert.ok(
      !data.concepts.some(
        (c) =>
          c.title.normalize('NFKC').trim().toLowerCase() ===
          title.normalize('NFKC').trim().toLowerCase(),
      ),
      'This concept title already exists; add a source to its existing record instead',
    );
  const order =
    records.reduce((max, record) => Math.max(max, record.order ?? 0), -1) + 1;
  const record =
    kind === 'source'
      ? {
          id,
          label: options.label || title,
          title,
          name: options.english || '',
          kind: options.kind,
          format:
            options.format || (options.kind === 'course' ? 'course' : 'notes'),
          term: options.term || '',
          institution: options.institution || '',
          url: options.url || '',
          referenceUrl: options['reference-url'] || '',
          private: options.private === true,
          accessNote: options['access-note'] || '',
          order,
        }
      : {
          id,
          title,
          english: options.english || '',
          domain: options.domain,
          tags: [],
          topic: options.topic || title,
          sources: (options.source || '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean),
          coverage: 'recorded',
          mastery: 'unassessed',
          summary: '',
          personalNote: '',
          related: [],
          evidence: '',
          recordedAt:
            options.date ||
            new Intl.DateTimeFormat('en-CA', {
              timeZone: 'America/New_York',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(new Date()),
          order,
        };
  const path = join(
    root,
    'content',
    kind === 'source' ? 'sources' : 'concepts',
    `${id}.json`,
  );
  // Exclusive creation never overwrites an existing record, even after validation.
  writeFileSync(path, JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
  try {
    readCatalog(root);
  } catch (error) {
    unlinkSync(path);
    throw error;
  }
  return path;
}
