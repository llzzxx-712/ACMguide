import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {values, buildTrace} from '../public/animations/binary-search/trace.mjs';

const trace = buildTrace(2);
assert.deepEqual(trace.map(({le,r,ans,mid})=>[le,r,ans,mid]), [
    [1,7,-1,null],[1,7,-1,4],[1,3,4,null],[1,3,4,2],
    [1,1,2,null],[1,1,2,1],[2,1,2,null],[2,1,2,null]
]);
for (let target = -1; target <= 11; target++) {
    const frames = buildTrace(target);
    const expected = values.indexOf(target);
    const end = frames.at(-1);
    assert.equal(end.ans, expected < 0 ? -1 : expected + 1);
    assert.ok(end.le > end.r);
    for (const frame of frames) {
        if (frame.mid !== null) assert.ok(frame.mid >= frame.le && frame.mid <= frame.r);
        if (frame.ans !== -1) assert.equal(values[frame.ans - 1], target);
    }
}
const html = await readFile('public/animations/binary-search/index.html','utf8');
for (const target of [2,6,9]) assert.equal(buildTrace(target).length, 8);
assert.ok(html.includes('data-duration="24"'));
assert.ok(html.includes('max="7"'));
for (let i=1;i<=7;i++) assert.ok(html.includes('id="cell-' + i + '"'));
console.log('Animation checks passed: 13 targets, closed-interval trace, answers and timeline length.');
