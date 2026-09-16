import { parseArgs } from 'node:util';
import { createRecord } from './atlas/create-record.mjs';
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: Object.fromEntries([
    ...[
      'id',
      'title',
      'label',
      'english',
      'domain',
      'topic',
      'source',
      'date',
      'kind',
      'format',
      'institution',
      'term',
      'url',
      'reference-url',
      'access-note',
    ].map((name) => [name, { type: 'string' }]),
    ['private', { type: 'boolean' }],
    ['help', { type: 'boolean' }],
  ]),
});
if (values.help || !positionals.length) {
  console.log(`Add a learning source or a canonical concept (does not publish):
  pnpm atlas:new source --id <id> --title <title> --kind course|self [--format course|book|article|project|repository|video|notes] [--url <url>] [--term <term>] [--institution <name>] [--private]
  pnpm atlas:new concept --id <id> --title <title> --domain math|statistics|cs|engineering|ai --source <source-id[,source-id]> [--topic <topic>] [--english <name>] [--date YYYY-MM-DD]

If the concept already exists, add the new source ID to its sources array.
New concepts default to unassessed, with empty summaries and personal notes.`);
} else {
  try {
    console.log(
      `Created ${createRecord(process.cwd(), positionals[0], values)}\nFill in the record, then run pnpm check. Nothing has been published.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
