import assert from 'node:assert/strict';
import test from 'node:test';
import { FOLIO_STUDIO_DESIGNS } from './folioStudioDesigns';
import { LAYOUT_ARCHETYPES } from './themePresets';

test('Folio Studio designs share one render interface and are the automatic defaults', () => {
  assert.deepEqual(FOLIO_STUDIO_DESIGNS.map(d => d.id), [
    'folio_bauhaus', 'folio_ethereal', 'folio_topographic',
    'folio_brutalist', 'folio_nocturne', 'folio_botanical',
  ]);
  for (const design of FOLIO_STUDIO_DESIGNS) {
    assert.equal(typeof design.render, 'function');
    assert.equal(LAYOUT_ARCHETYPES.find(a => a.id === design.id)?.default, true);
  }
});
