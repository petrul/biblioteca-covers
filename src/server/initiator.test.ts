import assert from 'node:assert/strict';
import test from 'node:test';
import { Writable } from 'node:stream';
import { prefixLines, receivedLabel, requestInitiator, runAs } from './initiator';

// The same module as biblioteca-reader's src/services/initiator.ts - its
// initiator.test.ts covers it fully; these pin what this service relies on.
test('runs a request as its caller says, else anonymous', () => {
  assert.equal(requestInitiator('guest_formidable_dictator'), 'guest_formidable_dictator');
  assert.equal(requestInitiator(undefined), 'anonymous');
});

test('accepts only label-shaped headers', () => {
  assert.equal(receivedLabel('petru@scriptorium.ro'), 'petru@scriptorium.ro');
  assert.equal(receivedLabel('a\nFAKE LINE'), undefined);
});

test('prefixes every line with the initiator of the work writing it', () => {
  const chunks: string[] = [];
  const stream = new Writable({ write(chunk, _encoding, done) { chunks.push(chunk.toString()); done(); } });
  prefixLines(stream);
  stream.write('Server listening\n');
  runAs('guest_amber_otter', () => stream.write('rendered cover\n'));
  assert.equal(chunks.join(''), '(system) Server listening\n(guest_amber_otter) rendered cover\n');
});
