const { test } = require('node:test');
const assert = require('node:assert/strict');
const { frameSvg } = require('./frame-snake.cjs');

test('keeps original animation inside a padded, accessible frame', () => {
    const animation = '<style>@keyframes snake{to{transform:translateX(10px)}}</style><path class="snake" d="M0 0h10"/>';
    const framed = frameSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="880" height="192" viewBox="-16 -16 880 192">${animation}</svg>`);
    assert.ok(framed.includes('viewBox="0 0 944 322"'));
    assert.ok(framed.includes('viewBox="-16 -16 880 192"'));
    assert.ok(framed.includes(animation));
    assert.ok(framed.includes('aria-labelledby="trail-title trail-desc"'));
    assert.equal((framed.match(/<svg\b/g) || []).length, 2);
});
test('light and dark frames use different readable palettes', () => {
    const source = '<svg viewBox="0 0 880 192"><path/></svg>';
    assert.ok(frameSvg(source).includes('fill="#0c121b"'));
    assert.ok(frameSvg(source, true).includes('fill="#faf8f3"'));
});
test('accepts px dimensions and rejects missing or invalid sizes', () => {
    assert.ok(frameSvg('<svg width="880px" height="192px"></svg>').includes('width="944"'));
    for (const source of ['invalid', '<svg></svg>', '<svg width="0" height="192"></svg>']) {
        assert.throws(() => frameSvg(source));
    }
});
