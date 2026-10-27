// Oracles deliberately use small direct enumerations rather than the taught optimizations.
let state = 20261028;
const rnd = n => { state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n; };
const lines = rows => rows.map(row=>row.join(' ')).join('\n')+'\n';
function graph(n,edges,weighted=false) {
    const head=`${n} ${edges.length}\n`;
    const neighbours=Array.from({length:n+1},()=>[]);
    for(const [u,v,w] of edges){neighbours[u].push([v,w]);neighbours[v].push([u,w]);}
    return [head+lines(edges),Array.from({length:n},(_,i)=>{
        const list=neighbours[i+1];
        return weighted ? `${list.length} ${list.reduce((s,e)=>s+e[1],0)}\n` : `${i+1}:`+(list.length?' '+list.map(e=>e[0]).join(' '):' -')+'\n';
    }).join('')];
}
function traversal(n,edges) {
    const a=Array.from({length:n+1},()=>[]);
    for(const [u,v] of edges)a[u].push(v);
    a.forEach(list=>list.sort((x,y)=>x-y));
    let seen=new Set(),order=[];
    function dfs(u){if(seen.has(u))return;seen.add(u);order.push(u);for(const v of a[u])dfs(v);}
    dfs(1);const depthOrder=order.join(' ');seen=new Set([1]);order=[1];
    for(let i=0;i<order.length;i++)for(const v of a[order[i]])if(!seen.has(v)){seen.add(v);order.push(v);}
    return [`${n} ${edges.length}\n`+lines(edges),depthOrder+' \n'+order.join(' ')+' \n'];
}
function chores(n,edges,cost) {
    const finish=[0];
    for(let u=1;u<=n;u++)finish[u]=cost[u]+Math.max(0,...edges.filter(e=>e[1]===u).map(e=>finish[e[0]]));
    return [n+'\n'+Array.from({length:n},(_,i)=>[i+1,cost[i+1],...edges.filter(e=>e[1]===i+1).map(e=>e[0]),0].join(' ')+'\n').join(''),Math.max(...finish)+'\n'];
}
function food(n,edges) {
    const indeg=Array(n+1).fill(0),out=Array.from({length:n+1},()=>[]);
    for(const [u,v] of edges){out[u].push(v);indeg[v]++;}
    // Enumerate each source-to-sink path; parallel edges are distinct choices.
    let total=0;
    function walk(u){if(!out[u].length)total++;else for(const v of out[u])walk(v);}
    for(let u=1;u<=n;u++)if(!indeg[u])walk(u);
    return [`${n} ${edges.length}\n`+lines(edges),total%80112002+'\n'];
}
function longest(n,edges) {
    let best=-Infinity;
    function walk(u,value){if(u===n)best=Math.max(best,value);for(const [a,b,w] of edges)if(a===u)walk(b,value+w);}
    walk(1,0);
    return [`${n} ${edges.length}\n`+lines(edges),(best===-Infinity?-1:best)+'\n'];
}
function words(a) {
    // Exhaust all word permutations, including duplicate input edges.
    let best=null;
    function visit(used,chain){if(chain.length===a.length){const s=chain.join('.');if(best===null||s<best)best=s;return;}for(let i=0;i<a.length;i++)if(!(used&(1<<i))&&(!chain.length||chain[chain.length-1].at(-1)===a[i][0]))visit(used|(1<<i),[...chain,a[i]]);}
    visit(0,[]);return [a.length+'\n'+a.join('\n')+'\n',(best??'***')+'\n'];
}
function square(a,c) {
    let best=-Infinity,pos=[];
    for(let x=0;x+c<=a.length;x++)for(let y=0;y+c<=a[0].length;y++){
        let sum=0;for(let i=x;i<x+c;i++)for(let j=y;j<y+c;j++)sum+=a[i][j];
        if(sum>best){best=sum;pos=[x+1,y+1];}
    }
    return [`${a.length} ${a[0].length} ${c}\n`+lines(a),pos.join(' ')+'\n'];
}
function scores(a,updates) {
    const b=[...a];for(const [l,r,v] of updates)for(let i=l-1;i<r;i++)b[i]+=v;
    return [`${a.length} ${updates.length}\n`+a.join(' ')+'\n'+lines(updates),Math.min(...b)+'\n'];
}
function carpets(n,rects) {
    const a=Array.from({length:n},()=>Array(n).fill(0));
    for(const [x1,y1,x2,y2] of rects)for(let x=x1-1;x<x2;x++)for(let y=y1-1;y<y2;y++)a[x][y]++;
    return [`${n} ${rects.length}\n`+lines(rects),lines(a)];
}
function union(intervals) {
    // Sweep merged intervals, independent of discrete difference marks.
    const sorted=intervals.map(e=>[...e]).sort((a,b)=>a[0]-b[0]);
    let [l,r]=sorted[0],total=0;
    for(const [a,b] of sorted.slice(1)){if(a>r){total+=r-l;l=a;r=b;}else r=Math.max(r,b);}
    total+=r-l;return [intervals.length+'\n'+lines(intervals),total+'\n'];
}
function rooms(capacity,orders) {
    const remaining=[...capacity];let failed=0;
    for(let j=0;j<orders.length;j++){const [v,l,r]=orders[j];for(let i=l-1;i<r;i++)remaining[i]-=v;if(remaining.some(x=>x<0)){failed=j+1;break;}}
    return [`${capacity.length} ${orders.length}\n`+capacity.join(' ')+'\n'+lines(orders),failed?`-1\n${failed}\n`:'0\n'];
}
const undirected=Array.from({length:26},()=>{const n=2+rnd(16);return [n,Array.from({length:rnd(40)},()=>{let u=1+rnd(n),v=1+rnd(n);if(u===v)v=v%n+1;return [u,v];})];});
const directed=Array.from({length:36},()=>{const n=1+rnd(18);return [n,Array.from({length:1+rnd(60)},()=>[1+rnd(n),1+rnd(n)])];});
const dags=Array.from({length:32},()=>{const n=2+rnd(8),edges=[];for(let u=1;u<n;u++)for(let v=u+1;v<=n;v++)if(rnd(3)===0)edges.push([u,v]);return [n,edges];});
const newCases={
    'graph-concepts': [[graph(5,[[1,2],[1,3],[2,4],[3,4]]),...undirected.map(([n,e])=>graph(n,e))]],
    'graph-vector': [[graph(3,[[1,2,5],[1,3,7],[2,3,4]],true),graph(1,[],true),graph(2,[[1,2,1000000000],[1,2,1000000000],[1,2,1000000000]],true),...undirected.map(([n,e])=>graph(n,e.map(([u,v])=>[u,v,1+rnd(1000000000)]),true))]],
    'graph-traversal': [[traversal(6,[[1,2],[1,3],[2,4],[2,3],[3,5]]),traversal(3,[[1,1],[1,2],[1,2],[2,1],[2,3],[3,1]]),...directed.map(([n,e])=>traversal(n,e))]],
    'topological-sort': [[chores(4,[[1,2],[1,3],[2,4],[3,4]],[0,3,2,4,2]),...dags.map(([n,e])=>chores(n,e,Array.from({length:n+1},()=>1+rnd(100))))]],
    'dag-paths': [[food(4,[[1,2],[1,3],[2,4],[3,4]]),...dags.map(([n,e])=>food(n,e))],[longest(4,[[1,2,3],[1,3,2],[2,4,-1],[3,4,5]]),longest(1,[]),longest(3,[[2,1,4],[1,3,-5]]),longest(4,[[1,2,1],[3,4,100000]]),...dags.map(([n,e])=>longest(n,e.map(([u,v])=>[u,v,rnd(21)-10])))],[words(['ab','ac','ca']),words(['aa','aa','aa']),words(['ab','ba','cd','dc']),words(['ab','ac']),words(['a']),...Array.from({length:48},()=>words(Array.from({length:1+rnd(7)},()=>String.fromCharCode(97+rnd(3))+String.fromCharCode(97+rnd(3)))))]],
    'prefix-sums': [[square([[1,2,3],[4,5,6],[7,8,9]],2),square([[-9,-4],[-2,-7]],1),square([[32767,32767],[32767,32767]],2),...Array.from({length:28},()=>{const n=1+rnd(7),m=1+rnd(7);return square(Array.from({length:n},()=>Array.from({length:m},()=>rnd(201)-100)),1+rnd(Math.min(n,m)));})]],
    'difference-arrays': [[scores([3,3,5,2],[[2,3,4],[1,4,1]]),scores([0],[[1,1,100],[1,1,100]]),...Array.from({length:28},()=>{const n=1+rnd(20);return scores(Array.from({length:n},()=>rnd(100)),Array.from({length:rnd(35)},()=>{const a=1+rnd(n),b=1+rnd(n);return [Math.min(a,b),Math.max(a,b),rnd(101)];}));})],[carpets(3,[[1,1,2,2],[2,2,3,3]]),carpets(1,[[1,1,1,1],[1,1,1,1]]),...Array.from({length:28},()=>{const n=1+rnd(10);return carpets(n,Array.from({length:rnd(30)},()=>{let x=1+rnd(n),y=1+rnd(n),a=1+rnd(n),b=1+rnd(n);return [Math.min(x,a),Math.min(y,b),Math.max(x,a),Math.max(y,b)];}));})]],
    'coordinate-compression': [[union([[-2,2],[1,5],[8,10]]),union([[-2147483648,-2147483640],[2147483640,2147483647]]),union([[1,2],[2,3],[1,3],[1,3]]),...Array.from({length:32},()=>union(Array.from({length:1+rnd(25)},()=>{const a=rnd(200)-100;return [a,a+1+rnd(30)];})))]],
    'prefix-binary': [[rooms([3,2,4],[[1,1,2],[2,2,3],[1,1,3]]),rooms([1],[[1,1,1],[1,1,1]]),rooms([0],[[0,1,1]]),rooms([3],[[1,1,1],[2,1,1]]),rooms([1000000000],Array.from({length:100},()=>[1000000000,1,1])),...Array.from({length:45},()=>{const n=1+rnd(15);return rooms(Array.from({length:n},()=>rnd(35)),Array.from({length:1+rnd(25)},()=>{const a=1+rnd(n),b=1+rnd(n);return [rnd(8),Math.min(a,b),Math.max(a,b)];}));})]]
};
// Large structural boundaries without an O(n*m) oracle.
const chainN=100000,chainEdges=Array.from({length:chainN-1},(_,i)=>[i+1,i+2]);
newCases['graph-traversal'][0].push([`${chainN} ${chainN-1}\n`+lines(chainEdges),Array.from({length:chainN},(_,i)=>i+1).join(' ')+' \n'+Array.from({length:chainN},(_,i)=>i+1).join(' ')+' \n']);
newCases['prefix-sums'][0].push(square(Array.from({length:1000},()=>Array(1000).fill(32767)),1000));
const bigRooms=1000000;
newCases['prefix-binary'][0].push([`${bigRooms} 1\n`+'1 '.repeat(bigRooms)+'\n2 1 1000000\n','-1\n1\n']);
// Ten layers with three choices per step: count exceeds the modulus.
const layerEdges=[];
for(let layer=0;layer<19;layer++)for(let a=0;a<3;a++)for(let b=0;b<3;b++)layerEdges.push([layer*3+a+1,(layer+1)*3+b+1]);
newCases['dag-paths'][0].push([`60 ${layerEdges.length}\n`+lines(layerEdges),(3n**20n%80112002n)+'\n']);
export const graphPrefixCases=newCases;
