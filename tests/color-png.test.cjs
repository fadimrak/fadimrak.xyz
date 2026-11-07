const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const html = readFileSync(join(__dirname, '../araclar/genel/index.html'), 'utf8');
const handler = html.slice(html.indexOf("site.$('#cpng').onsubmit"), html.indexOf("site.$('#ci').oninput"));

function run(w, h, { valid = true, blob = {}, fail = false } = {}) {
  const fields = { '#cpng': {}, '#cpngw': { value: w }, '#cpngh': { value: h }, '#cc': { value: '#12abef' } };
  const result = { downloads: [], messages: [], draws: [] };
  const context = { fillRect: (...args) => result.draws.push([context.fillStyle, ...args]) };
  const canvas = { getContext: () => { if (fail) throw Error('unavailable'); return context; }, toBlob: (cb, type) => { result.type = type; cb(blob); } };
  vm.runInNewContext(handler, {
    site: { $: id => fields[id], dl: (...args) => result.downloads.push(args) },
    document: { createElement: tag => { assert.equal(tag, 'canvas'); result.canvas = canvas; return canvas; } },
    toast: message => result.messages.push(message),
  });
  fields['#cpng'].onsubmit({ preventDefault() {}, currentTarget: { reportValidity: () => valid } });
  return result;
}

test('exports the selected color across the requested dimensions as PNG', () => {
  for (const [w, h] of [[1080, 1080], [1920, 1080], [1, 4096]]) {
    const r = run(w, h);
    assert.deepEqual(r.draws, [['#12abef', 0, 0, w, h]]);
    assert.equal(r.canvas.width, w);
    assert.equal(r.canvas.height, h);
    assert.equal(r.type, 'image/png');
    assert.equal(r.downloads[0][1], `renk-12abef-${w}x${h}.png`);
  }
});

test('rejects invalid sizes before allocating a canvas', () => {
  for (const value of ['', 0, -1, 1.5, 4097, Infinity, 'abc']) {
    for (const [w, h] of [[value, 1080], [1080, value]]) assert.equal(run(w, h).canvas, undefined);
  }
  assert.equal(run(1080, 1080, { valid: false }).canvas, undefined);
});

test('reports failed PNG generation without downloading', () => {
  for (const options of [{ blob: null }, { fail: true }]) {
    const r = run(1080, 1080, options);
    assert.equal(r.downloads.length, 0);
    assert.equal(r.messages.length, 1);
  }
});
