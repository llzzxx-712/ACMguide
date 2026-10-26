import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {values, buildTrace} from '../public/animations/binary-search/trace.mjs';
import {buildTrace as buildDfsTrace} from '../public/animations/dfs-enumeration/trace.mjs';

const trace = buildTrace(2);
assert.deepEqual(trace.map(({le,r,ans,mid})=>[le,r,ans,mid]), [
    [1,7,-1,null],[1,7,-1,4],[1,3,4,null],[1,3,4,2],
    [1,1,2,null],[1,1,2,1],[2,1,2,null],[2,1,2,null]
]);
for (let target = -1; target <= 11; target++) {
    const frames = buildTrace(target);
    const expected = values.indexOf(target);
    const candidate = values.findIndex(value => value >= target);
    const end = frames.at(-1);
    assert.equal(end.ans, candidate < 0 ? -1 : candidate + 1);
    assert.equal(end.result, expected < 0 ? -1 : expected + 1);
    assert.ok(end.le > end.r);
    for (const frame of frames) {
        if (frame.mid !== null) assert.ok(frame.mid >= frame.le && frame.mid <= frame.r);
        if (frame.ans !== -1) assert.ok(values[frame.ans - 1] >= target);
    }
}
const html = await readFile('public/animations/binary-search/index.html','utf8');
for (const target of [2,6,9]) assert.equal(buildTrace(target).length, 8);
assert.ok(html.includes('data-duration="24"'));
assert.ok(html.includes('max="7"'));
assert.ok(html.includes('a[mid] &gt;= x'));
assert.ok(html.includes('ans != -1 &amp;&amp; a[ans] == x'));
for (let i=1;i<=7;i++) assert.ok(html.includes('id="cell-' + i + '"'));
console.log('Animation checks passed: 13 targets, closed-interval trace, answers and timeline length.');

const dfsExpected = {
    two: [[1,1],[1,2],[2,1],[2,2]],
    three: [[1,1,1],[1,1,2],[1,2,1],[1,2,2],[2,1,1],[2,1,2],[2,2,1],[2,2,2]],
    queens: [[2,4,1,3],[3,1,4,2]]
};
for(const mode of Object.keys(dfsExpected)) {
    const {config,frames} = buildDfsTrace(mode);
    const end = frames.at(-1);
    assert.deepEqual(end.outputs,dfsExpected[mode]);
    assert.equal(end.event,'done');
    assert.equal(end.stack.length,0);
    assert.equal(end.pruned,mode==='queens' ? 44 : 0);
    assert.equal(end.attempts,mode==='queens' ? 60 : mode==='two' ? 6 : 14);
    let excludedLeaves=0;
    for(const frame of frames) {
        assert.equal(frame.prefix.length,frame.fixed);
        frame.stack.forEach((call,index)=>assert.equal(call.row,index+1));
        if(frame.event==='output') {
            assert.equal(frame.prefix.length,config.rows);
            assert.equal(frame.stack.at(-1).row,config.rows+1);
        }
        if(frame.event==='back') {
            assert.equal(frame.stack.length,frame.fixed+1);
            assert.ok(frame.stack.at(-1).col>=1 && frame.stack.at(-1).col<=config.cols);
        }
        if(config.queens) {
            for(let i=0;i<frame.prefix.length;i++) for(let j=0;j<i;j++) {
                assert.notEqual(frame.prefix[i],frame.prefix[j]);
                assert.notEqual(Math.abs(frame.prefix[i]-frame.prefix[j]),i-j);
            }
            if(frame.event==='reject') {
                const {row,col}=frame.candidate;
                assert.ok(frame.prefix.some((c,index)=>c===col || Math.abs(c-col)===row-index-1));
                excludedLeaves+=config.cols**(config.rows-row);
            }
        }
    }
    if(config.queens) assert.equal(excludedLeaves+end.outputs.length,4**4);
    // Returning from the first leaf must resume row 2's own loop, not restart row 1.
    if(mode==='two') {
        const firstOutput=frames.findIndex(frame=>frame.event==='output');
        assert.equal(frames[firstOutput+1].event,'back');
        assert.equal(frames[firstOutput+1].stack.at(-1).row,2);
        assert.equal(frames[firstOutput+1].stack.at(-1).col,1);
        assert.equal(frames[firstOutput+2].candidate.col,2);
        assert.deepEqual(frames[firstOutput].outputs,[[1,1]]);
    }
}
const dfsHtml=await readFile('public/animations/dfs-enumeration/index.html','utf8');
assert.ok(dfsHtml.includes('data-duration="58.5"'));
assert.ok(dfsHtml.includes('max="38"'));
assert.equal(buildDfsTrace('two').frames.length,39);
for(const mode of ['two','three','queens']) assert.ok(dfsHtml.includes('data-mode="'+mode+'"'));
console.log('DFS animation checks passed: 3 modes, complete enumeration, sound pruning, local loop variables and returns.');
