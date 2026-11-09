'use strict';
const { bands } = require('./difficulty');
const expression = /{{\s*pdoc\['difficulty'\]\s*or\s*lib\.difficulty\(pdoc\.nSubmit,\s*pdoc\.nAccept\)\s*or\s*_\('\(None\)'\)\s*}}/g;
// Self-contained markup works in full pages, includes, macros and PJAX renders.
// No request-scoped callable or safe HTML injection is needed.
const markup = '{% set hardnessValue = pdoc["difficulty"] %}'
  + '{% if hardnessValue >= 800 and hardnessValue <= 4000 and hardnessValue == (hardnessValue | int) %}'
  + '<span class="hydro-hardness" style="font-weight:700;color:rgb('
  + bands.map(([max, color], i) => `{% ${i ? 'elif' : 'if'} hardnessValue <= ${max} %}${color}`).join('')
  + '{% endif %})">{{ hardnessValue }}</span>'
  + '{% else %}<span class="hardness-unrated">—</span>{% endif %}';
function patchTemplate(source) {
  return source.replace(expression, () => markup)
    .replace(/{{\s*hydroHardness\(pdoc\['difficulty'\]\)\s*\|\s*safe\s*}}/g, () => markup);
}
module.exports = { patchTemplate };
