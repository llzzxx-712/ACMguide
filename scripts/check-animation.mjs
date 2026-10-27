import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {values, buildTrace} from '../public/animations/binary-search/trace.mjs';
import {buildTrace as buildDfsTrace} from '../public/animations/dfs-enumeration/trace.mjs';
import {buildTrace as buildKnapsackTrace,presets as knapsackPresets} from '../public/animations/knapsack/trace.mjs';
import {buildDsuTrace,seconds as dsuSeconds} from '../public/animations/dsu/trace.mjs';
import {buildQueueTrace,values as queueValues,windowSize,seconds as queueSeconds} from '../public/animations/monotonic-queue/trace.mjs';
import {buildKmpTrace,seconds as kmpSeconds} from '../public/animations/kmp/trace.mjs';

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

// Enumerate subsets independently of the displayed DP recurrence.
function subsetBest(items,capacity) {
    let best=0;
    for(let mask=0;mask<2**items.length;mask++) {
        let weight=0,value=0;
        items.forEach((item,index)=>{if(mask & (1<<index)){weight+=item.weight;value+=item.value;}});
        if(weight<=capacity) best=Math.max(best,value);
    }
    return best;
}
for(const preset of Object.keys(knapsackPresets)) for(const mode of ['two','descending','ascending']) {
    const trace=buildKnapsackTrace(preset,mode),{items,capacity}=trace.config;
    let written=new Set();
    for(const frame of trace.frames) {
        if(frame.event==='prepare') written=new Set();
        if(frame.event==='read') {
            const {source,take,notake}=frame;
            assert.equal(source.col,frame.j-items[frame.i-1].weight);
            assert.ok(source.col>=0 && source.col<=capacity);
            assert.equal(source.counts.reduce((sum,count,i)=>sum+count*items[i].value,0),source.value);
            assert.ok(source.counts.reduce((sum,count,i)=>sum+count*items[i].weight,0)<=source.col);
            assert.equal(take.value,source.value+items[frame.i-1].value);
            assert.equal(take.counts[frame.i-1],source.counts[frame.i-1]+1);
            assert.equal(frame.result,Math.max(notake.value,take.value));
            if(mode==='two') {
                assert.equal(source.row,frame.i-1);
                assert.equal(source.stage,'previous');
                assert.equal(source.value,frame.matrix[frame.i-1][source.col]);
                assert.equal(source.counts[frame.i-1],0);
                assert.equal(frame.matrix[frame.i][frame.j],notake.value);
            } else {
                assert.equal(source.stage,written.has(source.col) ? 'current' : 'previous');
                assert.equal(source.value,frame.values[source.col]);
                assert.deepEqual(source.counts,frame.picks[source.col]);
                if(mode==='descending') assert.equal(source.stage,'previous');
            }
        }
        if(frame.event==='write') {
            const counts=frame.resultPicks;
            assert.equal(counts.reduce((sum,count,i)=>sum+count*items[i].value,0),frame.result);
            assert.ok(counts.reduce((sum,count,i)=>sum+count*items[i].weight,0)<=frame.j);
            if(mode!=='ascending') {
                assert.ok(counts.every(count=>count<=1));
                assert.equal(frame.result,subsetBest(items.slice(0,frame.i),frame.j));
            }
            if(mode!=='two') written.add(frame.j);
        }
    }
    for(let i=1;i<=items.length;i++) {
        const order=trace.frames.filter(f=>f.event==='write' && f.i===i).map(f=>f.j);
        const expected=mode==='two' ? [0,1,2,3,4] : Array.from({length:capacity-items[i-1].weight+1},(_,k)=>mode==='descending' ? capacity-k : items[i-1].weight+k);
        assert.deepEqual(order,expected);
    }
    if(mode!=='ascending') assert.equal(trace.result,subsetBest(items,capacity));
    const key=trace.frames[trace.keyStep];
    assert.equal(key.i,1);assert.equal(key.j,capacity);assert.equal(key.event,'read');
}
const singleTwo=buildKnapsackTrace('single','two');
const singleDown=buildKnapsackTrace('single','descending');
const singleUp=buildKnapsackTrace('single','ascending');
assert.deepEqual([singleTwo.result,singleDown.result,singleUp.result],[3,3,6]);
assert.equal(singleTwo.frames.length,16);
assert.equal(singleDown.frames[singleDown.keyStep].source.value,0);
assert.equal(singleUp.frames[singleUp.keyStep].source.value,3);
assert.deepEqual(singleUp.frames[singleUp.keyStep].take.counts,[2]);
assert.equal(singleUp.frames[singleUp.keyStep].reused,true);
assert.deepEqual(buildKnapsackTrace('single','two').frames,singleTwo.frames);
const bagHtml=await readFile('public/animations/knapsack/index.html','utf8');
assert.ok(bagHtml.includes('data-duration="24"'));
assert.ok(bagHtml.includes('max="15"'));
assert.ok(!/__MATRIX__|__ARRAY__|__SNAPSHOT__/.test(bagHtml));
for(const mode of ['two','descending','ascending']) assert.ok(bagHtml.includes('data-mode="'+mode+'"'));
console.log('Knapsack animation checks passed: 2 examples × 3 modes, subset oracles, provenance, loop order and the 3-versus-6 counterexample.');
function dsuRoot(f,x){const seen=new Set();while(f[x]!==x){assert.ok(!seen.has(x),'parent cycle');seen.add(x);x=f[x];}return x;}
function dsuPartition(f){return Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>dsuRoot(f,i+1)===dsuRoot(f,j+1)));}
for(const mode of ['full','compression']){
    const t=buildDsuTrace(mode);
    assert.deepEqual(t,buildDsuTrace(mode));
    for(let i=0;i<t.frames.length;i++){
        const f=t.frames[i],prev=t.frames[i-1];
        assert.ok(f.parents.slice(1).every(p=>p>=1&&p<=5));
        for(let x=1;x<=5;x++)dsuRoot(f.parents,x);
        if(prev&&f.event!=='merge')assert.deepEqual(dsuPartition(f.parents),dsuPartition(prev.parents));
        if(f.event==='merge'){
            const {fx,fy}=f.vars;
            assert.equal(prev.parents[fx],fx);assert.equal(prev.parents[fy],fy);
            assert.equal(f.parents[fx],fy);
            for(let x=1;x<=5;x++)if(x!==fx)assert.equal(f.parents[x],prev.parents[x]);
        }
        if(f.event==='save')assert.equal(f.vars.next,f.parents[f.vars.x]);
        if(f.event==='redirect'){
            assert.equal(prev.event,'save');assert.equal(f.vars.next,prev.vars.next);
            assert.equal(f.parents[f.vars.x],f.vars.root);
        }
        if(f.event==='advance')assert.equal(f.vars.x,prev.vars.next);
    }
    assert.deepEqual(t.frames[t.firstFind].parents,[0,2,3,5,5,5]);
    const key=t.frames[t.keyStep];
    assert.equal(key.parents[1],5);assert.equal(key.vars.next,2);assert.equal(key.vars.x,1);
    assert.equal(t.frames[t.keyStep+1].vars.x,2);
    assert.equal(t.frames.slice(t.firstFind,t.repeatFind).filter(f=>f.event==='walk').length,3);
    assert.equal(t.frames.slice(t.repeatFind).filter(f=>f.event==='walk').length,1);
    assert.deepEqual(t.frames.at(-1).parents,[0,5,5,5,5,5]);
    // Frames must not share a mutable parent array.
    const saved=t.frames[0].parents[1];t.frames.at(-1).parents[1]=99;assert.equal(t.frames[0].parents[1],saved);
}
const dsuHtml=await readFile('public/animations/dsu/index.html','utf8');
const fullDsu=buildDsuTrace('full');
assert.ok(dsuHtml.includes('data-duration="'+Number((fullDsu.frames.length*dsuSeconds).toFixed(1))+'"'));
assert.ok(dsuHtml.includes('max="'+(fullDsu.frames.length-1)+'"'));
for(const id of ['play','previous','next','restart','first-find','key-step','repeat-find','slider','mode','speed'])assert.ok(dsuHtml.includes('id="'+id+'"'));
assert.ok(dsuHtml.includes('window.__timelines.dsu=timeline'));
console.log('DSU animation checks passed: immutable frames, root-only merges, unchanged partitions during compression, saved next pointer, and 3-versus-1 root walks.');
for(const mode of ['min','max']){
    const trace=buildQueueTrace(mode),frames=trace.frames;
    assert.deepEqual(trace,buildQueueTrace(mode));
    const pushed=new Set(),removed=new Set();
    for(let index=0;index<frames.length;index++){
        const f=frames[index],previous=frames[index-1];
        assert.ok(f.queue.every((q,i)=>q>=1&&q<=f.i&&(!i||f.queue[i-1]<q)));
        if(f.event==='push'){
            assert.ok(!pushed.has(f.i));pushed.add(f.i);
            const candidates=[];let best=mode==='min'?Infinity:-Infinity;
            for(let j=f.i;j>=Math.max(1,f.left);j--){const v=queueValues[j-1];if(mode==='min'?v<best:v>best){candidates.unshift(j);best=v;}}
            assert.deepEqual(f.queue,candidates);
        }
        if(f.event==='expire'||f.event==='discard'){
            assert.ok(!removed.has(f.removed));removed.add(f.removed);
            if(f.event==='expire')assert.ok(f.removed<f.left);
            else assert.ok(mode==='min'?queueValues[f.removed-1]>=queueValues[f.i-1]:queueValues[f.removed-1]<=queueValues[f.i-1]);
            assert.equal(f.queue.length,previous.queue.length-1);
        }
        if(f.event==='output'){
            assert.ok(f.queue.every(q=>q>=f.left));
            const part=queueValues.slice(f.left-1,f.i),expected=mode==='min'?Math.min(...part):Math.max(...part);
            assert.equal(f.outputs.at(-1),expected);assert.equal(queueValues[f.queue[0]-1],expected);
        }
    }
    assert.equal(pushed.size,queueValues.length);assert.ok(removed.size<=queueValues.length);
    assert.equal(frames[trace.expireStep].event,'expire');assert.equal(frames[trace.discardStep].event,'discard');assert.equal(frames[trace.equalStep].equal,true);
    assert.deepEqual(frames.at(-1).outputs,mode==='min'?[2,2,2,1,1,1]:[4,5,6,6,6,3]);
    const saved=frames[0].queue.length;frames.at(-1).queue.push(99);assert.equal(frames[0].queue.length,saved);
}
const queueHtml=await readFile('public/animations/monotonic-queue/index.html','utf8');
const queueFrameCount=buildQueueTrace('min').frames.length;
assert.ok(queueHtml.includes('data-duration="'+Number((queueFrameCount*queueSeconds).toFixed(1))+'"'));
assert.ok(queueHtml.includes('max="'+(queueFrameCount-1)+'"'));
for(const id of ['play','previous','next','restart','expire-step','discard-step','equal-step','slider','mode','speed'])assert.ok(queueHtml.includes('id="'+id+'"'));
assert.equal(windowSize,3);
console.log('Monotonic queue checks passed: min/max window oracles, exact undominated candidates, expiry, equal-value replacement and reversible snapshots.');
function kmpPrefixOracle(p){return Array.from({length:p.length},(_,i)=>{let best=0;for(let len=1;len<=i;len++)if(p.slice(0,len)===p.slice(i-len+1,i+1))best=len;return best;});}
function checkKmp(mode,custom){
    const trace=buildKmpTrace(mode,custom),{frames,source:s,pattern:p}=trace,expectedPi=kmpPrefixOracle(p);
    assert.deepEqual(trace,buildKmpTrace(mode,custom));
    for(let index=0;index<frames.length;index++){
        const f=frames[index],before=frames[index-1];
        assert.ok(f.j>=0&&f.j<=p.length);assert.equal(f.alignment,f.consumed-f.j);
        assert.equal(s.slice(f.consumed-f.j,f.consumed),p.slice(0,f.j));
        f.pi.forEach((value,i)=>{if(value!==null)assert.equal(value,expectedPi[i]);});
        if(before){assert.ok(f.i>=before.i);assert.ok(f.consumed>=before.consumed);}
        if(f.event==='fallback'||f.event==='reset'){
            assert.equal(f.j,expectedPi[f.from-1]);assert.ok(f.j<f.from);
            assert.equal(f.i,before.i);assert.equal(f.consumed,before.consumed);assert.equal(f.readIndex,f.from-1);
        }
        if(f.event==='found'){assert.equal(f.j,p.length);assert.equal(s.slice(f.i-p.length+1,f.i+1),p);}
    }
    assert.deepEqual(frames.at(-1).pi,expectedPi);
    if(mode!=='pi'){const starts=[];for(let i=0;i+p.length<=s.length;i++)if(s.startsWith(p,i))starts.push(i+1);assert.deepEqual(frames.at(-1).results,starts);}
    if(frames.length>1){const saved=frames[0].pi[0];frames.at(-1).pi[0]=999;assert.equal(frames[0].pi[0],saved);}
}
for(const mode of ['match','pi','overlap'])checkKmp(mode);
for(let mask=0;mask<64;mask++){
    const source=Array.from({length:6},(_,i)=>mask&(1<<i)?'A':'B').join('');
    for(let length=1;length<=4;length++){
        const pattern=source.slice(0,length);checkKmp('match',{source,pattern});checkKmp('pi',{pattern});
        checkKmp('match',{source,pattern:pattern.replace(/A/g,'C')});
    }
}
const fall=buildKmpTrace('match');assert.deepEqual([fall.frames[fall.fallbackStep].i,fall.frames[fall.fallbackStep].from,fall.frames[fall.fallbackStep].j],[5,5,3]);
assert.deepEqual(buildKmpTrace('overlap').frames.at(-1).results,[1,2,3]);
const kmpHtml=await readFile('public/animations/kmp/index.html','utf8');
assert.ok(kmpHtml.includes('data-duration="'+Number((fall.frames.length*kmpSeconds).toFixed(1))+'"'));
assert.ok(kmpHtml.includes('max="'+(fall.frames.length-1)+'"'));
for(const id of ['mode','play','previous','next','restart','before-fallback','fallback-step','found-step','slider','speed'])assert.ok(kmpHtml.includes('id="'+id+'"'));
console.log('KMP animation checks passed: prefix and substring oracles, preserved suffixes, stationary text on fallback, overlapping matches and independent snapshots.');

const {buildFenwickTrace,seconds:fenwickSeconds}=await import('../public/animations/fenwick/trace.mjs');
for(let n=1;n<=8;n++){
  const values=[0,...Array.from({length:n},(_,i)=>i*3-7)];
  for(let pos=0;pos<=n;pos++){
    const trace=buildFenwickTrace('query',{values,pos});
    for(const f of trace.frames){
      assert.equal(new Set(f.covered).size,f.covered.length,'Query intervals must not overlap');
      assert.equal(f.result,f.covered.reduce((s,i)=>s+values[i],0));
      for(let i=1;i<=n;i++)assert.equal(f.bit[i],values.slice(i-(i&-i)+1,i+1).reduce((s,x)=>s+x,0));
    }
    const last=trace.frames.at(-1);assert.equal(last.x,0);assert.equal(last.result,values.slice(1,pos+1).reduce((s,x)=>s+x,0));
    assert.deepEqual(last.covered.slice().sort((a,b)=>a-b),Array.from({length:pos},(_,i)=>i+1));
  }
  for(let pos=1;pos<=n;pos++)for(const delta of [-10,0,10]){
    const trace=buildFenwickTrace('update',{values,pos,delta});
    for(const f of trace.frames)for(let i=1;i<=n;i++){
      const original=values.slice(i-(i&-i)+1,i+1).reduce((s,x)=>s+x,0);
      assert.equal(f.bit[i],original+(f.visited.includes(i)?delta:0));
      if(f.visited.includes(i))assert(i-(i&-i)+1<=pos&&pos<=i,'Modified interval must contain the point');
    }
    const last=trace.frames.at(-1);assert(last.x>n);
    const containing=Array.from({length:n},(_,i)=>i+1).filter(i=>i-(i&-i)+1<=pos&&pos<=i);
    assert.deepEqual(last.visited,containing);
    assert.equal(trace.frames[0].a[pos],values[pos]);assert.equal(last.a[pos],values[pos]+delta);
    const saved=last.bit[pos];trace.frames[0].bit[pos]=999;assert.equal(last.bit[pos],saved,'Snapshots must be independent');
  }
}
const fenwickQuery=buildFenwickTrace(),fenwickUpdate=buildFenwickTrace('update');
assert.deepEqual(fenwickQuery.frames.at(-1).visited,[7,6,4]);assert.equal(fenwickQuery.frames.at(-1).result,28);
assert.deepEqual(fenwickUpdate.frames.at(-1).visited,[5,6,8]);
assert.deepEqual([5,6,8].map(i=>fenwickUpdate.frames.at(-1).bit[i]),[15,21,46]);
const fenwickHtml=await readFile('public/animations/fenwick/index.html','utf8');
assert(fenwickHtml.includes(`data-duration="${fenwickQuery.frames.length*fenwickSeconds}"`));
for(const id of ['mode','play','previous','next','restart','change-step','done-step','slider','bar-8','code-move'])assert(fenwickHtml.includes(`id="${id}"`));
console.log('Fenwick animation checks passed: disjoint prefix coverage, exact sums, every containing update interval, boundaries and independent snapshots.');
