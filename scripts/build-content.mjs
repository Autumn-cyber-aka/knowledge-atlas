import { buildCatalog } from './atlas/catalog.mjs';
const data = buildCatalog();
console.log(
  `Catalog ready: ${data.concepts.length} concepts, ${data.sources.length} sources, ${data.domains.length} domains.`,
);
