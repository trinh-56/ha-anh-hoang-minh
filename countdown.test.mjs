import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TARGET, countdownParts } from './countdown.js';

test('zero and negative become all zeros', () => {
  const zero = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  assert.deepEqual(countdownParts(0), zero);
  assert.deepEqual(countdownParts(-5), zero);
});

test('1 day 1 hour 1 minute 1 second', () => {
  assert.deepEqual(countdownParts(90061000), { days: 1, hours: 1, minutes: 1, seconds: 1 });
});

test('TARGET is 2026-12-17 11:30 in UTC+7', () => {
  assert.equal(TARGET, new Date('2026-12-17T11:30:00+07:00').getTime());
});
