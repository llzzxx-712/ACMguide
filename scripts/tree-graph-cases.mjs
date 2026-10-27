// Oracles use direct paths, exhaustive subsets, reachability, and truth assignments.
let state=2712712;
function rnd(n){state=(Math.imul(state,1664525)+1013904223)>>>0;return (state>>>8)%n;}
const line=x=>x.join(' '), lines=x=>x.map(line).join('\n');
function adjacency(n,edges,directed=false){const g=Array.from({length:n+1},()=>[]);for(const [u,v,w=1]of edges){g[u].push([v,w]);if(!directed)g[v].push([u,w]);}return g;}
function treeInfo(n,edges,root=1){const g=adjacency(n,edges),parent=Array(n+1).fill(0),order=[root],children=Array.from({length:n+1},()=>[]);for(let i=0;i<order.length;i++){const u=order[i];for(const [v]of g[u])if(v!==parent[u]){parent[v]=u;children[u].push(v);order.push(v);}}return {g,parent,children};}
function path(n,edges,start,end){const g=adjacency(n,edges),previous=Array(n+1).fill(-1),q=[start];previous[start]=0;for(let i=0;i<q.length&&previous[end]===-1;i++)for(const [v]of g[q[i]])if(previous[v]===-1){previous[v]=q[i];q.push(v);}const out=[];for(let u=end;u;u=previous[u])out.push(u);return out;}
function subtree(children,u){const q=[u];for(let i=0;i<q.length;i++)q.push(...children[q[i]]);return q;}
function randomTree(n){return Array.from({length:n-1},(_,i)=>[i+2,1+rnd(i+1)]);}
function eulerCase(n,edges,values,ops){const {children}=treeInfo(n,edges),a=[0,...values],out=[];for(const [op,u,d]of ops){if(op===1)a[u]+=d;else out.push(subtree(children,u).reduce((s,v)=>s+a[v],0));}return [`${n} ${ops.length}\n${line(values)}\n${lines(edges)}${edges.length?'\n':''}${lines(ops)}\n`,out.join('\n')+'\n'];}
function diameterCase(n,edges){const g=adjacency(n,edges);let best=0;for(let s=1;s<=n;s++){const q=[[s,0,0]];for(let i=0;i<q.length;i++){const [u,p,d]=q[i];best=Math.max(best,d);for(const [v,w]of g[u])if(v!==p)q.push([v,u,d+w]);}}return [n+'\n'+lines(edges)+(edges.length?'\n':''),best+'\n'];}
function meetingCase(n,edges){const g=adjacency(n,edges);let best=Infinity,point=0;for(let s=1;s<=n;s++){const d=Array(n+1).fill(-1),q=[s];d[s]=0;for(let i=0;i<q.length;i++)for(const[v]of g[q[i]])if(d[v]===-1){d[v]=d[q[i]]+1;q.push(v);}const sum=d.slice(1).reduce((a,b)=>a+b,0);if(sum<best){best=sum;point=s;}}return [n+'\n'+lines(edges)+(edges.length?'\n':''),`${point} ${best}\n`];}
function lcaCase(n,edges,root,queries){const {parent}=treeInfo(n,edges,root),out=[];for(let [u,v]of queries){const ancestors=new Set();for(;u;u=parent[u])ancestors.add(u);while(!ancestors.has(v))v=parent[v];out.push(v);}return [`${n} ${queries.length} ${root}\n${lines(edges)}${edges.length?'\n':''}${lines(queries)}\n`,out.join('\n')+'\n'];}
function differenceCase(n,edges,queries){const count=Array(n+1).fill(0);for(const[u,v]of queries)for(const x of path(n,edges,u,v))count[x]++;return [`${n} ${queries.length}\n${lines(edges)}\n${lines(queries)}\n`,Math.max(...count)+'\n'];}
function hldCase(n,edges,root,mod,values,ops){const {children}=treeInfo(n,edges,root),a=[0,...values],out=[];for(const[op,x,y,z]of ops){const points=op<=2?path(n,edges,x,y):subtree(children,x);if(op===1||op===3){const delta=op===1?z:y;for(const u of points)a[u]=(a[u]+delta)%mod;}else out.push(points.reduce((s,u)=>(s+a[u])%mod,0));}return [`${n} ${ops.length} ${root} ${mod}\n${line(values)}\n${lines(edges)}${edges.length?'\n':''}${lines(ops)}\n`,out.join('\n')+'\n'];}
const INF=1e50;
function floyd(n,edges,directed=true){const d=Array.from({length:n+1},()=>Array(n+1).fill(INF));for(let i=1;i<=n;i++)d[i][i]=0;for(const[u,v,w]of edges){d[u][v]=Math.min(d[u][v],w);if(!directed)d[v][u]=Math.min(d[v][u],w);}for(let k=1;k<=n;k++)for(let i=1;i<=n;i++)if(d[i][k]<INF)for(let j=1;j<=n;j++)if(d[k][j]<INF)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);return d;}
function zeroOneCase(n,edges){const answer=floyd(n,edges)[1][n];return [`${n} ${edges.length}\n${lines(edges)}${edges.length?'\n':''}`, (answer===INF?-1:answer)+'\n'];}
function dijkstraCase(n,edges,s){const d=floyd(n,edges)[s].slice(1);return [`${n} ${edges.length} ${s}\n${lines(edges)}${edges.length?'\n':''}`,d.map(x=>x===INF?-1:x).join(' ')+'\n'];}
function negativeCase(groups){const out=[];for(const[n,records]of groups){const edges=records.flatMap(([u,v,w])=>w<0?[[u,v,w]]:[[u,v,w],[v,u,w]]),d=floyd(n,edges);out.push(d.some((row,i)=>i>0&&d[1][i]<INF&&row[i]<0)?'YES':'NO');}return [groups.length+'\n'+groups.map(([n,e])=>`${n} ${e.length}\n${lines(e)}${e.length?'\n':''}`).join(''),out.join('\n')+'\n'];}
function routeCase(matrix,route){const n=matrix.length,dist=[];for(let s=0;s<n;s++){const d=Array(n).fill(INF);d[s]=0;for(let k=1;k<n;k++){const old=d.slice();for(let u=0;u<n;u++)for(let v=0;v<n;v++)d[v]=Math.min(d[v],old[u]+matrix[u][v]);}dist.push(d);}let answer=0;for(let i=1;i<route.length;i++)answer+=dist[route[i-1]-1][route[i]-1];return [`${n} ${route.length}\n${route.join('\n')}\n${lines(matrix)}\n`,answer+'\n'];}
function countCase(n,edges){const directed=edges.flatMap(([u,v])=>[[u,v,1],[v,u,1]]),distance=floyd(n,directed)[1],out=Array(n+1).fill(0);let walk=Array(n+1).fill(0);walk[1]=out[1]=1;for(let len=1;len<n;len++){const next=Array(n+1).fill(0);for(const[u,v]of directed)next[v]=(next[v]+walk[u])%100003;for(let v=1;v<=n;v++)if(distance[v]===len)out[v]=next[v];walk=next;}return [`${n} ${edges.length}\n${lines(edges)}${edges.length?'\n':''}`,out.slice(1).join('\n')+'\n'];}
function flightCase(n,edges,k,s,t){const expanded=[],id=(u,j)=>j*n+u+1;for(let j=0;j<=k;j++)for(const[u,v,w]of edges){expanded.push([id(u,j),id(v,j),w],[id(v,j),id(u,j),w]);if(j<k)expanded.push([id(u,j),id(v,j+1),0],[id(v,j),id(u,j+1),0]);}const d=floyd(n*(k+1),expanded)[id(s,0)];let answer=INF;for(let j=0;j<=k;j++)answer=Math.min(answer,d[id(t,j)]);return [`${n} ${edges.length} ${k}\n${s} ${t}\n${lines(edges)}${edges.length?'\n':''}`,(answer===INF?-1:answer)+'\n'];}
function constraintCase(n,records){const d=floyd(n,records.map(([c,p,w])=>[p,c,w]));const no=d.some((r,i)=>i>0&&r[i]<0);const answer=Array.from({length:n},(_,i)=>Math.min(0,...d.slice(1).map(r=>r[i+1])));return [`${n} ${records.length}\n${lines(records)}${records.length?'\n':''}`,no?'NO\n':answer.join(' ')+'\n'];}
function components(n,edges,removedPoint=0,removedEdge=-1){const g=Array.from({length:n+1},()=>[]);edges.forEach(([u,v],i)=>{if(i!==removedEdge&&u!==removedPoint&&v!==removedPoint){g[u].push(v);g[v].push(u);}});const seen=new Set();let count=0;for(let u=1;u<=n;u++)if(u!==removedPoint&&!seen.has(u)){count++;const q=[u];seen.add(u);for(let i=0;i<q.length;i++)for(const v of g[q[i]])if(!seen.has(v)){seen.add(v);q.push(v);}}return count;}
function spanningCase(n,edges,selected){const picked=selected.map(i=>edges[i-1]),valid=picked.length===n-1&&components(n,picked)===1;return [`${n} ${edges.length}\n${lines(edges)}${edges.length?'\n':''}${selected.length}\n${line(selected)}\n`,valid?'YES '+picked.reduce((s,e)=>s+e[2],0)+'\n':'NO\n'];}
function allTreeWeights(n,edges){const weights=[];for(let mask=0;mask<2**edges.length;mask++){const selected=[];for(let i=0;i<edges.length;i++)if(mask&(1<<i))selected.push(edges[i]);if(selected.length===n-1&&components(n,selected)===1)weights.push(selected.reduce((s,e)=>s+e[2],0));}return [...new Set(weights)].sort((a,b)=>a-b);}
function mstCase(n,edges,strict=false){const weights=allTreeWeights(n,edges);return [`${n} ${edges.length}\n${lines(edges)}${edges.length?'\n':''}`,strict?(weights.length>1?weights[1]:'-1')+'\n':(weights.length?weights[0]:'orz')+'\n'];}
function bottleneckCase(n,edges,s,t){const d=Array.from({length:n+1},()=>Array(n+1).fill(INF));for(let i=1;i<=n;i++)d[i][i]=0;for(const[u,v,w]of edges)d[u][v]=d[v][u]=Math.min(d[u][v],w);for(let k=1;k<=n;k++)for(let i=1;i<=n;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i][j],Math.max(d[i][k],d[k][j]));return [`${n} ${edges.length} ${s} ${t}\n${lines(edges)}${edges.length?'\n':''}`,(d[s][t]===INF?-1:d[s][t])+'\n'];}
function bridgeCase(n,edges){const before=components(n,edges),answer=[];for(let i=0;i<edges.length;i++)if(components(n,edges,0,i)>before)answer.push(edges[i].slice().sort((a,b)=>a-b));answer.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);return [`${n} ${edges.length}\n${lines(edges)}${edges.length?'\n':''}`,lines(answer)+(answer.length?'\n':'')];}
function cutCase(n,edges){const before=components(n,edges),answer=[];for(let u=1;u<=n;u++)if(components(n,edges,u)>before)answer.push(u);return [`${n} ${edges.length}\n${lines(edges)}${edges.length?'\n':''}`,answer.length+'\n'+line(answer)+'\n'];}
function sccCase(n,edges){const d=floyd(n,edges.map(([u,v])=>[u,v,1])),used=new Set();let answer=0;for(let u=1;u<=n;u++)if(!used.has(u)){const group=[];for(let v=1;v<=n;v++)if(d[u][v]<INF&&d[v][u]<INF){group.push(v);used.add(v);}if(group.length>1)answer++;}return [`${n} ${edges.length}\n${lines(edges)}${edges.length?'\n':''}`,answer+'\n'];}
function condensationCase(n,edges,values){const g=adjacency(n,edges,true),seen=new Set(),q=[];for(let u=1;u<=n;u++){q.push([u,1<<(u-1)]);seen.add(u+':'+(1<<(u-1)));}const sums=Array(1<<n).fill(0);for(let mask=1;mask<1<<n;mask++)for(let i=0;i<n;i++)if(mask&(1<<i))sums[mask]+=values[i];let best=0;for(let i=0;i<q.length;i++){const[u,mask]=q[i];best=Math.max(best,sums[mask]);for(const[v]of g[u]){const next=mask|(1<<(v-1)),key=v+':'+next;if(!seen.has(key)){seen.add(key);q.push([v,next]);}}}return [`${n} ${edges.length}\n${line(values)}\n${lines(edges)}${edges.length?'\n':''}`,best+'\n'];}
function satCase(n,clauses,known=null){let exists=known;if(exists===null){exists=false;for(let mask=0;mask<2**n;mask++)if(clauses.every(([i,a,j,b])=>((mask>>(i-1))&1)===a||((mask>>(j-1))&1)===b)){exists=true;break;}}
 const validate=output=>{const tokens=output.trim().split(/\s+/);if(!exists)return tokens.length===1&&tokens[0]==='IMPOSSIBLE';if(tokens[0]!=='POSSIBLE'||tokens.length!==n+1)return false;const a=tokens.slice(1).map(Number);return a.every(x=>x===0||x===1)&&clauses.every(([i,x,j,y])=>a[i-1]===x||a[j-1]===y);};
 return [`${n} ${clauses.length}\n${lines(clauses)}${clauses.length?'\n':''}`,'a truth assignment satisfying every clause, or proven IMPOSSIBLE',validate];}

const euler=[],diameter=[],meeting=[],lca=[],difference=[],hld=[];
for(let t=0;t<40;t++){
 const n=1+rnd(11),edges=randomTree(n),values=Array.from({length:n},()=>rnd(31)-15),root=1+rnd(n),queries=Array.from({length:25},()=>[1+rnd(n),1+rnd(n)]);
 euler.push(eulerCase(n,edges,values,Array.from({length:30},(_,j)=>j%3===0?[1,1+rnd(n),rnd(31)-15]:[2,1+rnd(n)])));
 diameter.push(diameterCase(n,edges.map(e=>[...e,rnd(20)])));meeting.push(meetingCase(n,edges));lca.push(lcaCase(n,edges,root,queries));difference.push(differenceCase(n,edges,queries));
 const mod=[1,100,1073741824][rnd(3)],positive=Array.from({length:n},()=>rnd(2147483647)),ops=Array.from({length:36},(_,j)=>{const u=1+rnd(n),v=1+rnd(n),z=rnd(2147483647);return j%4===0?[1,u,v,z]:j%4===1?[2,u,v]:j%4===2?[3,u,z]:[4,u];});
 hld.push(hldCase(n,edges,root,mod,positive,ops));
}
const zeroOne=[],dijkstra=[],negative=[],route=[],counts=[],flights=[],constraints=[],spanning=[],mst=[],strict=[],bottleneck=[],bridges=[],cuts=[],scc=[],condensation=[],sat=[];
for(let t=0;t<50;t++){
 const n=2+rnd(6),edges=Array.from({length:1+rnd(12)},()=>[1+rnd(n),1+rnd(n),rnd(11)]),plain=edges.map(e=>e.slice(0,2));
 zeroOne.push(zeroOneCase(n,edges.map(e=>[e[0],e[1],e[2]%2])));dijkstra.push(dijkstraCase(n,edges,1+rnd(n)));
 negative.push(negativeCase([[n,edges.map(e=>[e[0],e[1],e[2]-5])]]));
 const matrix=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?0:rnd(20)));route.push(routeCase(matrix,[1,...Array.from({length:6},()=>1+rnd(n)),n]));
 counts.push(countCase(n,plain));flights.push(flightCase(n,edges.map(([u,v,w])=>[u-1,v-1,w]),rnd(4),rnd(n),rnd(n)));constraints.push(constraintCase(n,edges.map(e=>[e[0],e[1],e[2]-5])));
 spanning.push(spanningCase(n,edges,Array.from({length:rnd(n+2)},()=>1+rnd(edges.length))));
 if(edges.length<=12){mst.push(mstCase(n,edges));strict.push(mstCase(n,edges,true));}
 bottleneck.push(bottleneckCase(n,edges,1+rnd(n),1+rnd(n)));bridges.push(bridgeCase(n,plain));cuts.push(cutCase(n,plain));scc.push(sccCase(n,plain));condensation.push(condensationCase(n,plain,Array.from({length:n},()=>rnd(10))));
 sat.push(satCase(n,Array.from({length:1+rnd(15)},()=>[1+rnd(n),rnd(2),1+rnd(n),rnd(2)])));
}
const chain=n=>Array.from({length:n-1},(_,i)=>[i+1,i+2]);
const chain500k=chain(500000),chain100k=chain(100000),chain20k=chain(20000),chain10k=chain(10000);
euler.push(eulerCase(100000,chain100k,Array(100000).fill(1000000000),[[2,1],[1,100000,1000000000],[2,100000],[2,1]]));
diameter.push(['200000\n'+lines(chain(200000).map(e=>[...e,1000000000]))+'\n','199999000000000\n']);
meeting.push(['50000\n'+lines(chain(50000))+'\n','25000 625000000\n']);
lca.push(['500000 3 500000\n'+lines(chain500k)+'\n1 2\n1 500000\n250000 250000\n','2\n500000\n250000\n']);
difference.push(['50000 100000\n'+lines(chain(50000))+'\n'+'1 50000\n'.repeat(100000),'100000\n']);
hld.push(hldCase(100000,chain100k,100000,1073741824,Array(100000).fill(1000000000),[[2,1,100000],[1,1,100000,2147483647],[3,50000,2147483647],[4,100000],[2,1,50000],[4,1]]));
zeroOne.push(zeroOneCase(1,[]));
dijkstra.push(['100000 99999 1\n'+lines(chain100k.map(e=>[...e,9999]))+'\n',Array.from({length:100000},(_,i)=>i*9999).join(' ')+'\n']);
negative.push(negativeCase([[4,[[1,2,1],[3,4,-2],[4,3,1]]],[3,[[1,2,0],[2,3,0],[3,1,0]]],[3,[[1,2,1],[2,3,-3],[3,2,1]]]]));
counts.push(['200000 199999\n'+lines(chain(200000))+'\n','1\n'.repeat(200000)]);
spanning.push(spanningCase(1,[[1,1,3]],[]));
mst.push(mstCase(1,[[1,1,3]]));
strict.push(mstCase(3,[[1,2,1],[2,3,2],[1,3,2]],true),mstCase(4,[[1,2,0],[2,3,0],[3,4,2],[1,4,2],[1,3,1],[2,2,0]],true));
strict.push(['100000 100000\n'+lines(chain100k.map(e=>[...e,1]))+'\n1 100000 2\n','100000\n']);
cuts.push(['20000 19999\n'+lines(chain20k)+'\n','19998\n'+Array.from({length:19998},(_,i)=>i+2).join(' ')+'\n']);
scc.push(['10000 10000\n'+lines(chain10k)+'\n10000 1\n','1\n'],['10000 9999\n'+lines(chain10k)+'\n','0\n']);
condensation.push(['10000 10000\n'+'1000 '.repeat(9999)+'1000\n'+lines(chain10k)+'\n10000 1\n','10000000\n']);
const forced=Array.from({length:150000},(_,i)=>i===0?[1,1,1,1]:[i,0,i+1,1]);sat.push(satCase(150000,forced,true),satCase(1,[[1,0,1,0],[1,1,1,1]]),satCase(1,[[1,0,1,1]]));

export const treeGraphCases={
 'tree-euler':[euler], 'tree-diameter-centroid':[diameter,meeting], 'tree-lca':[lca], 'tree-difference':[difference], 'heavy-light':[hld],
 'shortest-relaxation':[zeroOne], 'dijkstra':[dijkstra], 'negative-cycles':[negative], 'floyd-closure':[route], 'shortest-models':[counts,flights,constraints],
 'spanning-cut':[spanning], 'kruskal-prim':[mst,mst], 'mst-applications':[bottleneck,strict],
 'dfs-lowlink':[bridges], 'cuts-biconnectivity':[cuts], 'tarjan-scc':[scc], 'condensation-dag':[condensation], 'two-sat':[sat]
};
