// Direct multiset and subarray oracles for chapter 25; no tree implementation here.
export const advancedTreeCases = {};
let seed=28252026;
function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
const rows=a=>a.map(x=>x.join(' ')).join('\n');
function multisetCase(operations){const a=[],out=[];for(const[op,x]of operations){if(op===1){a.push(x);a.sort((a,b)=>a-b);}else if(op===2){const i=a.indexOf(x);if(i>=0)a.splice(i,1);}else if(op===3)out.push(a.filter(v=>v<x).length+1);else if(op===4)out.push(a[x-1]);else if(op===5)out.push(a.filter(v=>v<x).at(-1));else out.push(a.find(v=>v>x));}return[operations.length+'\n'+rows(operations)+'\n',out.join('\n')+'\n'];}
const multisets=[];
for(let t=0;t<35;t++){const ops=[],current=[];for(let z=0;z<100;z++){let op=current.length?1+rnd(6):1,x;if(op===1){x=rnd(41)-20;current.push(x);}else if(op===2){x=current[rnd(current.length)];current.splice(current.indexOf(x),1);}else if(op===3)x=rnd(51)-25;else if(op===4)x=1+rnd(current.length);else if(op===5)x=current[rnd(current.length)]+1;else x=current[rnd(current.length)]-1;ops.push([op,x]);}multisets.push(multisetCase(ops));}
multisets.push(multisetCase([[1,-10000000],[1,10000000],[1,0],[1,0],[3,0],[5,0],[6,0],[2,0],[4,2]]));
const largeMulti=[];for(let i=0;i<50000;i++)largeMulti.push([1,i]);for(let i=0;i<50000;i++)largeMulti.push([4,i+1]);
multisets.push([largeMulti.length+'\n'+rows(largeMulti)+'\n',Array.from({length:50000},(_,i)=>i).join('\n')+'\n']);
function persistentCase(a,queries){return[`${a.length} ${queries.length}\n${a.join(' ')}\n${rows(queries)}\n`,queries.map(([l,r,k])=>a.slice(l-1,r).sort((a,b)=>a-b)[k-1]).join('\n')+'\n'];}
const persistents=[];for(let t=0;t<35;t++){const n=1+rnd(30),a=Array.from({length:n},()=>rnd(15));const qs=Array.from({length:35},()=>{const l=1+rnd(n),r=l+rnd(n-l+1);return[l,r,1+rnd(r-l+1)];});persistents.push(persistentCase(a,qs));}
persistents.push(persistentCase(Array.from({length:200000},(_,i)=>200000-i),[[1,200000,1],[1,200000,200000],[199999,200000,2],[1,1,1]]));
function colorCase(colors,edges){const n=colors.length,graph=Array.from({length:n},()=>[]);for(const[a,b]of edges){graph[a].push(b);graph[b].push(a);}const parent=Array(n).fill(-1),order=[0];for(const u of order)for(const v of graph[u])if(v!==parent[u]){parent[v]=u;order.push(v);}const out=[];for(let u=0;u<n;u++){const count=new Map(),stack=[u];while(stack.length){const v=stack.pop();count.set(colors[v],(count.get(colors[v])||0)+1);for(const w of graph[v])if(parent[w]===v)stack.push(w);}const best=[...count].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0];out.push(best);}return[n+'\n'+colors.join(' ')+'\n'+rows(edges.map(([a,b])=>[a+1,b+1]))+'\n',rows(out)+'\n'];}
const colors=[];for(let t=0;t<35;t++){const n=1+rnd(40);colors.push(colorCase(Array.from({length:n},()=>1+rnd(8)),Array.from({length:n-1},(_,i)=>[i+1,rnd(i+1)])));}
colors.push([`100000\n${Array.from({length:100000},(_,i)=>i+1).join(' ')}\n${rows(Array.from({length:99999},(_,i)=>[i+1,i+2]))}\n`,Array.from({length:100000},(_,i)=>`${i+1} 1`).join('\n')+'\n']);
function dynamicCase(initial,ops){const a=initial.slice(),out=[];for(const op of ops){if(op[0]==='C')a[op[1]-1]=op[2];else out.push(a.slice(op[1]-1,op[2]).sort((a,b)=>a-b)[op[3]-1]);}return[`${a.length} ${ops.length}\n${initial.join(' ')}\n${rows(ops)}\n`,out.join('\n')+'\n'];}
const dynamics=[];for(let t=0;t<35;t++){const n=1+rnd(30),a=Array.from({length:n},()=>rnd(31)),ops=[];for(let z=0;z<80;z++){if(rnd(2))ops.push(['C',1+rnd(n),rnd(31)]);else{const l=1+rnd(n),r=l+rnd(n-l+1);ops.push(['Q',l,r,1+rnd(r-l+1)]);}}dynamics.push(dynamicCase(a,ops));}
const largeN=100000,largeOps=[];for(let i=0;i<99998;i++)largeOps.push(['C',1,100001+i]);largeOps.push(['Q',1,largeN,1],['Q',1,largeN,largeN]);
dynamics.push([`${largeN} ${largeOps.length}\n${Array.from({length:largeN},(_,i)=>i+1).join(' ')}\n${rows(largeOps)}\n`,'2\n199998\n']);
function dominanceCase(points,K){const distribution=Array(points.length).fill(0);for(let i=0;i<points.length;i++){let count=0;for(let j=0;j<points.length;j++)if(j!==i&&points[j].every((x,d)=>x<=points[i][d]))count++;distribution[count]++;}return[`${points.length} ${K}\n${rows(points)}\n`,distribution.join('\n')+'\n'];}
const dominance=[];for(let t=0;t<40;t++)dominance.push(dominanceCase(Array.from({length:1+rnd(45)},()=>[1+rnd(6),1+rnd(6),1+rnd(6)]),6));
dominance.push(dominanceCase([[1,1,1],[1,1,1],[2,2,2],[1,2,1]],2),[`100000 200000\n${'200000 200000 200000\n'.repeat(100000)}`,'0\n'.repeat(99999)+'100000\n'],[`100000 200000\n${rows(Array.from({length:100000},(_,i)=>[i+1,i+1,i+1]))}\n`,'1\n'.repeat(100000)]);
Object.assign(advancedTreeCases,{'dynamic-value-tree':[multisets],'persistent-kth':[persistents],'segment-tree-merging':[colors,dynamics],'offline-dominance':[dominance]});
