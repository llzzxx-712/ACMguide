import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildTopoTrace,presets,seconds} from '../public/animations/topological-dp/trace.mjs';

function enumeratePaths(n,edges,source) {
  const result=Array(n+1).fill(null),stack=[[source,0,1<<(source-1)]];
  while(stack.length){const[u,value,mask]=stack.pop();if(result[u]===null||value>result[u])result[u]=value;
    for(const[from,to,weight]of edges)if(from===u&&!(mask&(1<<(to-1))))stack.push([to,value+weight,mask|(1<<(to-1))]);
  }
  return result;
}
function verify(trace) {
  const {n,edges,frames,dp,source}=trace;
  for(const frame of frames) {
    assert.equal(new Set(frame.removed).size,frame.removed.length);
    assert.equal(new Set(frame.order).size,frame.order.length);
    assert.equal(new Set(frame.queue).size,frame.queue.length);
    for(let v=1;v<=n;v++){
      assert.equal(frame.indegree[v],edges.filter(e=>e.to===v&&!frame.removed.includes(e.id)).length,'Indegree equals remaining incoming edges');
      if(frame.queue.includes(v)||frame.order.includes(v))assert.equal(frame.indegree[v],0,'Queued and taken vertices must have no remaining dependencies');
    }
    for(const u of frame.queue)assert(!frame.order.includes(u));
    for(const id of frame.removed)assert(frame.order.includes(edges[id].from),'Only a taken vertex releases its outgoing edges');
    if(frame.event==='take')for(const edge of edges.filter(e=>e.to===frame.u))assert(frame.processed.includes(edge.from),'Every predecessor must be fully processed before a vertex is taken');
    if(dp){
      // The currently known candidates come from completed relax events only.
      const expected=Array(n+1).fill(null);expected[source]=0;
      for(const prior of frames.slice(0,frames.indexOf(frame)+1))if(prior.event==='relax'){
        assert.notEqual(expected[prior.u],null);
        const candidate=expected[prior.u]+edges[prior.activeEdge].weight;
        assert.equal(prior.candidate,candidate);
        expected[prior.v]=expected[prior.v]===null?candidate:Math.max(expected[prior.v],candidate);
      }
      assert.deepEqual(frame.f,expected);
    }
  }
  const end=frames.at(-1);
  assert.equal(end.event,'done');assert.equal(end.queue.length,0);
  if(!trace.cycle){
    assert.equal(end.order.length,n);
    const position=new Map(end.order.map((u,i)=>[u,i]));
    for(const e of edges)assert(position.get(e.from)<position.get(e.to));
    if(dp)assert.deepEqual(end.f,enumeratePaths(n,edges.map(e=>[e.from,e.to,e.weight]),source),'Final DP must equal independently enumerated paths');
  }
  const saved=frames.at(-1).indegree.slice();frames[0].indegree[1]=999;
  assert.deepEqual(frames.at(-1).indegree,saved,'Snapshots must not share mutable arrays');
}
for(const mode of Object.keys(presets))verify(buildTopoTrace(mode));
const basic=buildTopoTrace(),longest=buildTopoTrace('longest'),unreachable=buildTopoTrace('unreachable'),cycle=buildTopoTrace('cycle');
assert.deepEqual(basic.frames.at(-1).order,[1,2,3,4]);
assert.equal(basic.frames[basic.joinStep].indegree[4],1);
assert.equal(basic.frames[basic.unlockStep].indegree[4],0);
assert.equal(longest.frames.at(-1).f[4],7);
const rejected=longest.frames.find(f=>f.event==='relax'&&f.u===3&&f.v===4);assert.equal(rejected.candidate,4);assert.equal(rejected.changed,false);assert.equal(rejected.f[4],7);
assert.deepEqual(unreachable.frames.at(-1).f,[null,0,null,2,null,6]);
assert(unreachable.frames.some(f=>f.event==='unreachable'&&f.u===2&&f.v===3));
assert(unreachable.frames.some(f=>f.event==='remove'&&f.u===2&&f.v===3&&f.indegree[3]===0));
assert.equal(cycle.cycle,true);assert.deepEqual(cycle.frames.at(-1).order,[1]);assert.equal(cycle.frames.at(-1).indegree[4],1);
// Exercise shuffled labels, negative weights, parallel edges and isolated vertices.
let seed=28182026;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
for(let test=0;test<40;test++){
  const n=2+rnd(5),order=Array.from({length:n},(_,i)=>i+1);
  for(let i=n-1;i>0;i--){const j=rnd(i+1);[order[i],order[j]]=[order[j],order[i]];}
  const edges=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(rnd(3)===0){edges.push([order[i],order[j],rnd(21)-10]);if(rnd(5)===0)edges.push([order[i],order[j],rnd(21)-10]);}
  verify(buildTopoTrace('longest',{n,edges,source:1,target:n}));
}
const html=await readFile('public/animations/topological-dp/index.html','utf8');
assert(html.includes(`data-duration="${basic.frames.length*seconds}"`));
assert(html.includes(`max="${basic.frames.length-1}"`));
for(const mode of Object.keys(presets))assert(html.includes(`value="${mode}"`));
for(const id of ['mode','play','previous','next','restart','join-step','unlock-step','answer-step','slider','queue-0','degree-4','f-4','code-decrease','node-5'])assert(html.includes(`id="${id}"`));
assert(html.includes("window.__timelines['topological-dp']=timeline"));
console.log('Topological animation checks passed: 4 modes + 40 DAGs, exact remaining indegrees, readiness, independent path maxima, unreachable dependencies, cycles and immutable frames.');
