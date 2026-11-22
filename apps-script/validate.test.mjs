import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const src = fs.readFileSync(fileURLToPath(new URL('./Code.gs', import.meta.url)), 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src, ctx);

// Plain copy so vm-realm arrays compare cleanly with deepEqual.
const plain = (x) => JSON.parse(JSON.stringify(x));

test('yes with 2 guests is stored', () => {
  assert.deepEqual(plain(ctx.validateRsvp({ name: 'An', attending: 'yes', guests: '2' })), { ok: true, row: ['An', 'Có', 2] });
});

test('no forces guests to 0', () => {
  assert.deepEqual(plain(ctx.validateRsvp({ name: 'An', attending: 'no', guests: '5' })), { ok: true, row: ['An', 'Không', 0] });
});

test('blank name is rejected', () => {
  assert.deepEqual(plain(ctx.validateRsvp({ name: '  ', attending: 'yes', guests: '1' })), { ok: false, error: 'name' });
});

test('unknown attending value is rejected', () => {
  assert.deepEqual(plain(ctx.validateRsvp({ name: 'An', attending: 'maybe', guests: '1' })), { ok: false, error: 'attending' });
});

test('guests out of range when attending is rejected', () => {
  assert.equal(ctx.validateRsvp({ name: 'An', attending: 'yes', guests: '11' }).error, 'guests');
  assert.equal(ctx.validateRsvp({ name: 'An', attending: 'yes', guests: '0' }).error, 'guests');
});

test('formula-looking name is prefixed with an apostrophe', () => {
  assert.equal(plain(ctx.validateRsvp({ name: '=1+1', attending: 'no' })).row[0], "'=1+1");
});

test('filled honeypot is flagged as spam', () => {
  assert.deepEqual(plain(ctx.validateRsvp({ name: 'x', attending: 'yes', guests: '1', website: 'x' })), { ok: true, spam: true });
});

test('doPost appends a row only for valid, non-spam input', () => {
  const rows = [];
  ctx.SpreadsheetApp = { getActiveSpreadsheet: () => ({ getSheets: () => [{ appendRow: (r) => rows.push(r) }] }) };
  ctx.ContentService = {
    MimeType: { JSON: 'application/json' },
    createTextOutput: (s) => ({ setMimeType: () => ({ body: s }) }),
  };
  ctx.doPost({ parameter: { name: 'An', attending: 'yes', guests: '2' } });
  ctx.doPost({ parameter: { name: 'Bot', attending: 'yes', guests: '1', website: 'spam' } });
  ctx.doPost({ parameter: { name: '', attending: 'yes', guests: '1' } });
  assert.equal(rows.length, 1);
  assert.equal(rows[0][1], 'An');
});
