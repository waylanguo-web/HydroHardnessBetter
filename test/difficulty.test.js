const { test } = require('node:test');
const assert = require('node:assert/strict');
const { valid, render, bands } = require('../difficulty');
test('every integer uses the requested band', () => {
  for (let n = 800; n <= 4000; n++) {
    assert.ok(valid(n));
    assert.ok(render(n).includes(`rgb(${bands.find(([max]) => n <= max)[1]})`));
    assert.ok(render(n).includes(`>${n}</span>`));
  }
});
test('reject malformed, fractional and out-of-range ratings', () => {
  for (const value of [799, 4001, 0, -1, 800.5, NaN, Infinity, '', '8e2', '800.5', null, true, '<script>']) {
    assert.equal(valid(value), false, String(value));
    assert.equal(render(value), '<span class="hardness-unrated">—</span>');
  }
  assert.ok(valid('800')); assert.ok(valid('4000'));
});
