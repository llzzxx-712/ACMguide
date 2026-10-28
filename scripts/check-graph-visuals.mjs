import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {graphs,numberedGraph} from '../public/animations/graph-process/graphs.mjs';
import {graphSvg,geometry} from '../public/animations/graph-process/svg.mjs';
import {modes,buildTrace,bstTrace,traversalTrace,dijkstraTrace,mstTrace,lowlinkTrace,tarjanTrace} from '../public/animations/graph-process/trace.mjs';

for(const [key,g] of Object.entries(graphs)){
    const svg=await readFile(`public/diagrams/graphs/${key}.svg`,'utf8');
    assert.equal(svg,graphSvg(g,{id:key})+'\n',`Regenerate stale diagram ${key}`);
    assert(!/NaN|undefined|\[object Object\]/.test(svg));
    for(const e of g.edges){assert(g.nodes.some(n=>n.id===e.from));assert(g.nodes.some(n=>n.id===e.to));assert(e.weight===undefined||Number.isFinite(e.weight));const p=geometry(g,e);assert(Number.isFinite(p.x)&&Number.isFinite(p.y));}
    assert.equal((svg.match(/class="node"/g)||[]).length,g.nodes.length);
    assert.equal((svg.match(/class="edge"/g)||[]).length,g.edges.length);
    for(const n of g.nodes){assert(n.x>=27&&n.x<=693&&n.y>=27&&n.y<=303,'Node is clipped');}
}
let frames=0;
for(const [demo,options] of Object.entries(modes)){
    const html=await readFile(`public/animations/graph-process/${demo}.html`,'utf8');
    for(const id of ['title','mode','play','previous','next','restart','slider','graph','note','panels','head','rows','code'])assert(html.includes(`id="${id}"`));
    assert(html.includes(`data-demo="${demo}"`));
    for(const [mode] of options){const t=buildTrace(demo,mode);frames+=t.frames.length;assert(t.frames.length>3);assert(t.frames.every(f=>t.code.some(([id])=>f.line===id)));const before=JSON.stringify(t.frames.at(-1));t.frames[0].rows.push(['mutated']);assert.equal(JSON.stringify(t.frames.at(-1)),before,'Snapshots must be independent');}
}
assert.equal(bstTrace('find7').result,true);assert.equal(bstTrace('find6').result,false);
const ins=bstTrace('insert6');assert.equal(ins.frames.find(f=>f.event==='attach').rows.find(r=>r[0]===5)[2],7);assert.equal(ins.frames.at(-1).rows.find(r=>r[0]===7)[1],6);
assert.deepEqual(traversalTrace('dfs').result,[1,2,3,5,4]);assert.deepEqual(traversalTrace('bfs').result,[1,2,3,4,5]);
assert.deepEqual(dijkstraTrace().result,[0,3,1,4]);assert(dijkstraTrace().frames.filter(f=>f.event==='stale').length===2);
assert(buildTrace('bellman').result);assert.deepEqual(buildTrace('floyd').result,[[0,2,1],[2,0,1],[1,1,0]]);
for(const mode of ['kruskal','prim'])assert.equal(mstTrace(mode).result.total,6);
assert.deepEqual(lowlinkTrace().result.bridges.slice().sort(),[3,4]);
const scc=tarjanTrace();assert.equal(scc.result.count,2);assert.deepEqual(scc.result.component.slice(1),[2,2,2,1,1]);
assert(scc.frames.some(f=>f.event==='return'&&f.panels[1][1].includes('5')),'A returned call must remain on active until its SCC root finishes');

// Small independent oracles: distances, all spanning trees, reachability and deleting an edge.
function graph(n,edges,directed){return {title:'test',directed,nodes:Array.from({length:n},(_,i)=>({id:i+1,x:70+i*85,y:150,label:String(i+1)})),edges:edges.map(([from,to,weight=1],id)=>({id,from,to,weight}))};}
function distances(g){const n=g.nodes.length,d=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?0:Infinity));for(const e of g.edges){d[e.from-1][e.to-1]=Math.min(d[e.from-1][e.to-1],e.weight);if(!g.directed)d[e.to-1][e.from-1]=Math.min(d[e.to-1][e.from-1],e.weight);}for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);return d;}
function connected(g,ids=g.edges.map(e=>e.id)){const seen=new Set([1]);for(let k=0;k<g.nodes.length;k++)for(const e of g.edges)if(ids.includes(e.id)){if(seen.has(e.from))seen.add(e.to);if(seen.has(e.to))seen.add(e.from);}return seen.size===g.nodes.length;}
function mstOracle(g){let best=Infinity;for(let mask=0;mask<2**g.edges.length;mask++){const es=g.edges.filter((e,i)=>mask&(1<<i));if(es.length===g.nodes.length-1&&connected(g,es.map(e=>e.id)))best=Math.min(best,es.reduce((s,e)=>s+e.weight,0));}return best;}
let seed=1729;const random=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
for(let run=0;run<55;run++){
    const n=2+random(5),edges=[];for(let u=1;u<=n;u++)for(let v=1;v<=n;v++)if(u!==v&&random(4)===0)edges.push([u,v,random(10)]);
    const g=graph(n,edges,true),oracle=distances(g);
    assert.deepEqual(dijkstraTrace(structuredClone(g)).result,oracle[0].map(x=>Number.isFinite(x)?x:null));
    const t=tarjanTrace(structuredClone(g)),c=t.result.component;
    for(let u=1;u<=n;u++)for(let v=1;v<=n;v++)assert.equal(c[u]===c[v],Number.isFinite(oracle[u-1][v-1])&&Number.isFinite(oracle[v-1][u-1]));
    for(const mode of ['dfs','bfs'])assert.deepEqual(traversalTrace(mode,structuredClone(g)).result.slice().sort((a,b)=>a-b),g.nodes.filter(x=>Number.isFinite(oracle[0][x.id-1])).map(x=>x.id));
}
for(let run=0;run<35;run++){
    const n=2+random(4),edges=[];for(let v=2;v<=n;v++)edges.push([v-1,v,random(8)-2]);for(let u=1;u<=n;u++)for(let v=u+2;v<=n;v++)if(random(3)===0)edges.push([u,v,random(8)-2]);
    // Include a parallel edge to verify parent-edge IDs, not just parent vertices.
    if(run%3===0)edges.push(edges[0].slice());
    const g=graph(n,edges,false),best=mstOracle(g);
    for(const mode of ['kruskal','prim']){const t=mstTrace(mode,structuredClone(g));assert.equal(t.result.total,best);assert.equal(t.result.chosen.length,n-1);assert(connected(g,t.result.chosen));}
    const bridges=g.edges.filter(e=>!connected(g,g.edges.filter(x=>x.id!==e.id).map(x=>x.id))).map(e=>e.id);
    assert.deepEqual(lowlinkTrace(structuredClone(g)).result.bridges.slice().sort((a,b)=>a-b),bridges);
}

const lessons={
    'graph-basics':['graph-concepts','graph-vector','graph-traversal','topological-sort','dag-paths'],
    'shortest-paths':['shortest-relaxation','dijkstra','negative-cycles','floyd-closure','shortest-models'],
    'minimum-spanning-trees':['spanning-cut','kruskal-prim','mst-applications'],
    'graph-connectivity':['dfs-lowlink','cuts-biconnectivity','tarjan-scc','condensation-dag','two-sat']
};
for(const [dir,slugs] of Object.entries(lessons))for(const slug of slugs){const md=await readFile(`src/content/after-joining/${dir}/${slug}.md`,'utf8');assert(md.includes('/diagrams/graphs/'),`Missing graph illustration: ${slug}`);}
const bstMd=await readFile('src/content/after-joining/binary-trees/tree-reconstruction.md','utf8');assert(bstMd.includes('/graph-process/bst.html'));assert(!bstMd.includes('查找 7：和 5 比较'));
console.log(`Graph visual checks passed: ${Object.keys(graphs).length} SVG diagrams, ${Object.values(modes).flat().length} interactive modes, ${frames} default frames; distance, traversal, MST, bridges and SCC oracles.`);
