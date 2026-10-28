// Real OJ examples: independent small-instance oracles and format boundaries.
let seed = 20261028;
const rnd = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
const line = a => a.join(' ') + '\n';
function topoCase(n, edges) {
    const g = Array.from({length:n},()=>[]);
    for (const [u,v] of edges) g[u-1].push(v);
    const input=n+'\n'+g.map(a=>line([...a,0])).join('');
    return [input,'any topological ordering',out=>{
        const a=out.trim().split(/\s+/).map(Number);
        if(a.length!==n||new Set(a).size!==n||a.some(x=>x<1||x>n))return false;
        const pos=new Map(a.map((x,i)=>[x,i]));
        return edges.every(([u,v])=>pos.get(u)<pos.get(v));
    }];
}
function subsetCase(a,L,R,X) {
    let answer=0;
    function visit(i, selected) {
        if(i===a.length) {
            if(selected.length<2)return;
            const sum=selected.reduce((s,x)=>s+x,0);
            if(L<=sum&&sum<=R&&Math.max(...selected)-Math.min(...selected)>=X)answer++;
            return;
        }
        visit(i+1,selected); visit(i+1,[...selected,a[i]]);
    }
    visit(0,[]);
    return [`${a.length} ${L} ${R} ${X}\n`+line(a),answer+'\n'];
}
function keyCase(n,m,p,doors,keys) {
    const cells=n*m, states=1<<p, gate=new Map(), key=Array(cells).fill(0);
    const id=(x,y)=>(x-1)*m+y-1;
    for(const [x,y,X,Y,t] of doors){const u=id(x,y),v=id(X,Y);gate.set(u+','+v,t);gate.set(v+','+u,t);}
    for(const [x,y,t] of keys)key[id(x,y)]|=1<<(t-1);
    const dist=Array(cells*states).fill(Infinity);
    dist[key[0]]=0;
    // Bellman-Ford on the expanded state graph, without a BFS queue.
    for(let pass=0;pass<cells*states;pass++) {
        let changed=false;
        for(let u=0;u<cells;u++)for(let mask=0;mask<states;mask++) {
            const at=u*states+mask;if(!Number.isFinite(dist[at]))continue;
            const x=Math.floor(u/m),y=u%m;
            for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
                const X=x+dx,Y=y+dy;if(X<0||X>=n||Y<0||Y>=m)continue;
                const v=X*m+Y,t=gate.get(u+','+v)??-1;
                if(t===0||(t>0&&!(mask&(1<<(t-1)))))continue;
                const to=v*states+(mask|key[v]);
                if(dist[to]>dist[at]+1){dist[to]=dist[at]+1;changed=true;}
            }
        }
        if(!changed)break;
    }
    const best=Math.min(...dist.slice((cells-1)*states));
    return [`${n} ${m} ${p}\n${doors.length}\n`+doors.map(line).join('')+keys.length+'\n'+keys.map(line).join(''),(Number.isFinite(best)?best:-1)+'\n'];
}
function windowCase(a,L,R) {
    const n=a.length-1, f=Array(a.length).fill(-Infinity); f[0]=0;
    for(let i=1;i<=n;i++)for(let step=L;step<=R;step++)if(i-step>=0)f[i]=Math.max(f[i],f[i-step]+a[i]);
    return [`${n} ${L} ${R}\n`+line(a),Math.max(...f.slice(n-R+1))+'\n'];
}
function packingCase(a,L) {
    let best=null;
    for(let cuts=0;cuts<2**(a.length-1);cuts++) {
        let cost=0n,length=0;
        for(let i=0;i<a.length;i++) {
            length+=a[i];
            if(i===a.length-1||(cuts&(1<<i))){const d=BigInt(length-L);cost+=d*d;length=0;}
            else length++;
        }
        if(best===null||cost<best)best=cost;
    }
    return [`${a.length} ${L}\n`+a.join('\n')+'\n',best+'\n'];
}
function postCase(values,k) {
    const a=values.slice().sort((x,y)=>x-y);
    let best=Infinity;
    function visit(start,left,cost) {
        if(left===0){if(start===a.length)best=Math.min(best,cost);return;}
        for(let end=start;end<=a.length-left;end++) {
            const mid=a[Math.floor((start+end)/2)];
            let add=0;for(let i=start;i<=end;i++)add+=Math.abs(a[i]-mid);
            visit(end+1,left-1,cost+add);
        }
    }
    visit(0,k,0);
    return [`${a.length} ${k}\n`+line(values),best+'\n'];
}
function xorCase(n, rows) {
    let feasible=Array.from({length:1<<n},(_,i)=>i), earliest=-1,solution;
    for(let i=0;i<rows.length;i++) {
        const [mask,rhs]=rows[i];
        feasible=feasible.filter(x=>{let v=0;for(let j=0;j<n;j++)if((mask>>j)&1)v^=(x>>j)&1;return v===rhs;});
        if(earliest===-1&&feasible.length===1){earliest=i+1;solution=feasible[0];}
    }
    const input=`${n} ${rows.length}\n`+rows.map(([mask,rhs])=>Array.from({length:n},(_,i)=>(mask>>i)&1).join('')+' '+rhs+'\n').join('');
    const output=earliest===-1?'Cannot Determine\n':earliest+'\n'+Array.from({length:n},(_,i)=>((solution>>i)&1)?'?y7M#\n':'Earth\n').join('');
    return [input,output];
}
function determinant(a) {
    const n=a.length;let answer=0n;
    function permute(chosen,used) {
        if(chosen.length===n) {
            let inv=0,term=1n;
            for(let i=0;i<n;i++){term*=BigInt(a[i][chosen[i]]);for(let j=i+1;j<n;j++)if(chosen[i]>chosen[j])inv++;}
            answer+=inv%2?-term:term;return;
        }
        for(let x=0;x<n;x++)if(!used.has(x)){used.add(x);chosen.push(x);permute(chosen,used);chosen.pop();used.delete(x);}
    }
    permute([],new Set());return answer;
}
function detCase(a,p) {
    const mod=BigInt(p),answer=(determinant(a)%mod+mod)%mod;
    return [`${a.length} ${p}\n`+a.map(line).join(''),answer+'\n'];
}
function colorsCase(color,parent) {
    const n=color.length,g=Array.from({length:n},()=>[]);
    parent.forEach((p,i)=>g[p-1].push(i+1));
    function collect(u){return [color[u],...g[u].flatMap(collect)];}
    const answers=color.map((_,u)=>{
        const count=new Map();for(const x of collect(u))count.set(x,(count.get(x)||0)+1);
        const best=Math.max(...count.values());return [...count].filter(([,v])=>v===best).reduce((s,[x])=>s+x,0);
    });
    return [n+'\n'+line(color)+parent.map((p,i)=>`${p} ${i+2}\n`).join(''),line(answers)];
}
export function applyRealAdvancedCases(cases) {
    cases['dag-dp'][0]=[topoCase(1,[]),topoCase(4,[[1,2],[1,3],[2,4],[3,4]]),...Array.from({length:30},()=>{
        const n=2+rnd(9),edges=[];for(let u=1;u<=n;u++)for(let v=u+1;v<=n;v++)if(rnd(3)===0)edges.push([u,v]);return topoCase(n,edges);
    }),topoCase(100,Array.from({length:99},(_,i)=>[100-i,99-i]))];
    cases['subset-enumeration']=[[subsetCase([1,2,3],5,6,1),subsetCase([7],1,100,1),...Array.from({length:30},()=>subsetCase(Array.from({length:2+rnd(10)},()=>1+rnd(20)),10,50,1+rnd(10))),subsetCase(Array.from({length:15},(_,i)=>i+1),1,1000000000,1)]];
    cases['mask-search']=[[keyCase(1,1,1,[],[]),keyCase(1,3,1,[[1,2,1,3,1]],[[1,2,1]]),keyCase(1,2,1,[[1,1,1,2,0]],[]),keyCase(1,3,2,[[1,1,1,2,1],[1,2,1,3,2]],[[1,1,1],[1,1,2]]),...Array.from({length:30},()=>{
        const n=2+rnd(2),m=2+rnd(2),p=2,doors=[],keys=[];
        for(let x=1;x<=n;x++)for(let y=1;y<=m;y++)for(const [X,Y] of [[x+1,y],[x,y+1]])if(X<=n&&Y<=m&&rnd(2))doors.push([x,y,X,Y,rnd(3)]);
        for(let x=1;x<=n;x++)for(let y=1;y<=m;y++)for(let t=1;t<=p;t++)if(rnd(4)===0)keys.push([x,y,t]);
        return keyCase(n,m,p,doors,keys);
    }),keyCase(10,10,10,[],Array.from({length:10},(_,i)=>[1,1,i+1]))]];
    cases['dp-window-optimization']=[[windowCase([0,1,-2,4,10,-1],2,3),windowCase([0,-5],1,1),...Array.from({length:35},()=>{const n=1+rnd(30),L=1+rnd(n),R=L+rnd(n-L+1);return windowCase([0,...Array.from({length:n},()=>rnd(31)-15)],L,R);}),['200000 1 200000\n0 '+'1 '.repeat(200000)+'\n','200000\n']]];
    cases['convex-hull-dp']=[[packingCase([1,1,1],3),packingCase([10000000],10000000),...Array.from({length:35},()=>packingCase(Array.from({length:1+rnd(9)},()=>1+rnd(20)),1+rnd(30))),['50000 1\n'+'10000000\n'.repeat(50000),(50000n*9999999n**2n)+'\n']]];
    cases['divide-conquer-dp']=[[postCase([1,2,3,10,11],2),postCase([5],1),postCase([7,7,7,7],2),...Array.from({length:32},()=>{const n=1+rnd(9);return postCase(Array.from({length:n},()=>1+rnd(40)),1+rnd(n));}),['3000 300\n'+line(Array.from({length:3000},(_,i)=>i+1)),'7500\n']]];
    cases['xor-determinants']=[
        [xorCase(2,[[1,1],[1,1],[2,0]]),xorCase(2,[[3,1]]),...Array.from({length:35},()=>{const n=1+rnd(7),actual=rnd(1<<n),rows=[];for(let i=0;i<1+rnd(15);i++){const mask=rnd(1<<n);let v=0;for(let j=0;j<n;j++)if((mask>>j)&1)v^=(actual>>j)&1;rows.push([mask,v]);}return xorCase(n,rows);}),['1000 1000\n'+Array.from({length:1000},(_,i)=>'0'.repeat(i)+'1'+'0'.repeat(999-i)+' '+(i%2)+'\n').join(''),'1000\n'+Array.from({length:1000},(_,i)=>i%2?'?y7M#\n':'Earth\n').join('')]],
        [detCase([[1,2],[3,4]],6),detCase([[2,4],[4,8]],8),detCase([[2,1],[1,2]],1),...Array.from({length:40},()=>{const n=1+rnd(6),p=[4,6,8,11,1000000007][rnd(5)];return detCase(Array.from({length:n},()=>Array.from({length:n},()=>1+rnd(30))),p);}),['600 1000000006\n'+Array.from({length:600},(_,i)=>line(Array.from({length:600},(_,j)=>i===j?2:1))).join(''),'601\n']]
    ];
    cases['segment-tree-merging'][0]=[colorsCase([2,1,2,1,1],[1,1,2,2]),colorsCase([1],[]),...Array.from({length:35},()=>{const n=1+rnd(20);return colorsCase(Array.from({length:n},()=>1+rnd(n)),Array.from({length:n-1},(_,i)=>1+rnd(i+1)));}),['100000\n'+line(Array.from({length:100000},(_,i)=>i+1))+Array.from({length:99999},(_,i)=>`1 ${i+2}\n`).join(''),line([5000050000,...Array.from({length:99999},(_,i)=>i+2)])]];
}