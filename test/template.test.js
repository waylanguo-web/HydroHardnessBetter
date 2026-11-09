const { test } = require('node:test');
const assert = require('node:assert/strict');
const nunjucks = require('nunjucks');
const { patchTemplate } = require('../template');
const { bands } = require('../difficulty');
test('render without any request helper, including isolated macros', () => {
  const env = new nunjucks.Environment(null, { autoescape: true });
  const source = patchTemplate("{{ pdoc['difficulty'] or lib.difficulty(pdoc.nSubmit, pdoc.nAccept) or _('(None)') }}");
  assert.equal(source.includes('hydroHardness('), false);
  for (const value of [800,899,900,1199,1200,1599,1600,1999,2000,2399,2400,2699,2700,3099,3100,4000]) {
    const expected = bands.find(([max]) => value <= max)[1];
    for (const tpl of [source, `{% macro row(pdoc) %}${source}{% endmacro %}{{ row(pdoc) }}`]) {
      const result = env.renderString(tpl, { pdoc: { difficulty: value } });
      assert.ok(result.includes(`rgb(${expected})`));
      assert.ok(result.includes(`>${value}</span>`));
    }
  }
  for (const value of [undefined, null, 0, 10, 799, 4001, 800.5]) {
    assert.ok(env.renderString(source, { pdoc: { difficulty: value } }).includes('hardness-unrated'));
  }
  assert.equal(patchTemplate(source), source);
});
