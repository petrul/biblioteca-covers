import assert from 'node:assert/strict';
import test from 'node:test';
import { Writable } from 'node:stream';
import { guestLabel, prefixLines, receivedLabel, runAs } from './initiator';

// The same module as biblioteca-reader's src/services/initiator.ts - its
// initiator.test.ts covers it fully; these pin what this service relies on.
test('derives the same guest label as the reader and biblioteca-server', () => {
  assert.equal(guestLabel('visitor-1'), 'guest-witty-owl-38c6');
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
  runAs('guest-amber-otter-3f2a', () => stream.write('rendered cover\n'));
  assert.equal(chunks.join(''), '(system) Server listening\n(guest-amber-otter-3f2a) rendered cover\n');
});
