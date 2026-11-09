'use strict';
const { valid, render } = require('./difficulty');
exports.name = 'hydro-hardness-better';
exports.inject = ['template'];
exports.apply = function apply(ctx) {
  const undo = [];
  // Hydro's decorators read this metadata on every request. Keep permissions,
  // normalizers and the original handler intact.
  const handlers = require('hydrooj/src/handler/problem');
  for (const Handler of Object.values(handlers)) {
    const metadata = Handler?.prototype?.__param;
    for (const methods of Object.values(metadata || {})) {
      for (const args of Object.values(methods)) {
        for (const arg of args) {
          if (arg.name !== 'difficulty' || undo.some((x) => x.arg === arg)) continue;
          undo.push({ arg, validate: arg.validate });
          arg.validate = valid;
        }
      }
    }
  }
  if (!undo.length) throw new Error('Unsupported Hydro version: difficulty validator not found');
  const registry = ctx.template.registry;
  const originals = new Map();
  // Apply after other template plugins, preserving their unrelated changes.
  const expression = /{{\s*pdoc\['difficulty'\]\s*or\s*lib\.difficulty\(pdoc\.nSubmit,\s*pdoc\.nAccept\)\s*or\s*_\('\(None\)'\)\s*}}/g;
  const patch = () => {
    for (const [key, source] of Object.entries(registry)) {
      if (typeof source !== 'string') continue;
      let result = source.replace(expression, "{{ hydroHardness(pdoc['difficulty']) | safe }}");
      if (key === 'problem_edit.html') result = result.replace("help_text:'From 1-10'", "help_text:'800–4000，整数；留空表示未评级'");
      if (result !== source) { originals.set(key, source); registry[key] = result; }
    }
  };
  ctx.on('handler/after', (handler) => {
    if (handler.response.body && typeof handler.response.body === 'object') {
      handler.response.body.hydroHardness = render;
    }
  });
  ctx.on('app/started', patch);
  // Template service initialization may finish after app/started.
  ctx.on('handler/before', patch);
  patch();
  ctx.on('dispose', () => {
    for (const { arg, validate } of undo) arg.validate = validate;
    for (const [key, source] of originals) registry[key] = source;
  });
};
