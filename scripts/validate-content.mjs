import { buildCatalog } from './atlas/catalog.mjs';
const data = buildCatalog();
console.log(
  `Content valid: ${data.concepts.length} concepts, ${data.sources.length} sources. References, recording dates, five domains, and STAT4205 exclusion checked.`,
);
