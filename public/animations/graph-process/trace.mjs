import {numberedGraph} from './graphs.mjs';
const clone=x=>JSON.parse(JSON.stringify(x));
const value=x=>x===null?'∞':x;
function recorder(graph,title,columns,code,intro) {
    const frames=[];
    return {graph,title,columns,code,intro,frames,emit(frame){frames.push(clone({active:[],chosen:[],rejected:[],done:[],frontier:[],edge:-1,rows:[],panels:[],...frame}));}};
}
function adjacency(g) {
    const a=Array.from({length:g.nodes.length+1},()=>[]);
    for(const e of g.edges){a[e.from].push({to:e.to,weight:e.weight,id:e.id});if(!g.directed)a[e.to].push({to:e.from,weight:e.weight,id:e.id});}
    return a;
}

export function bstTrace(mode='find7') {
    const insert=mode==='insert6',target=mode==='find7'?7:6;
    const nodes=[{id:1,x:360,y:40,label:'5'},{id:2,x:170,y:125,label:'2'},{id:3,x:535,y:125,label:'8'},{id:4,x:255,y:215,label:'3'},{id:5,x:455,y:215,label:'7'},{id:6,x:635,y:215,label:'9'}];
    const edges=[[1,2],[1,3],[2,4],[3,5],[3,6]].map(([from,to],id)=>({id,from,to}));
    if(target===6){nodes.push({id:7,x:395,y:295,label:'∅'});edges.push({id:5,from:5,to:7});}
    const graph={title:'二叉搜索树',nodes,edges,directed:true};
    const t=recorder(graph,insert?'插入 6：沿比较路径找到空位置':`查找 ${target}：每次比较只走一侧`,['结点编号','保存的值','左孩子编号','右孩子编号'],insert?[
        ['enter','int insertNode(int u, int x) {'],['empty','    if (u == 0) {'],['create','        value[++total] = x; return total;'],['left','    if (x < value[u]) lc[u] = insertNode(lc[u], x);'],['right','    else if (x > value[u]) rc[u] = insertNode(rc[u], x);'],['return','    return u;'],['end','}']
    ]:[['loop','while (u != 0) {'],['equal','    if (x == value[u]) return true;'],['left','    if (x < value[u]) u = lc[u];'],['right','    else u = rc[u];'],['end','}'],['missing','return false;']], '结点内显示数值；表格第一列才是结点编号。左小右大决定下一步，代码中的 u 保存当前位置的编号。');
    const values=[0,5,2,8,3,7,9],lc=[0,2,0,5,0,0,0],rc=[0,3,4,6,0,0,0],path=[],calls=[],chosen=[];
    const emit=(event,line,note,u,extra={})=>t.emit({event,line,note,active:u?[u]:[],chosen,frontier:calls,rows:values.slice(1).map((v,i)=>[i+1,v,lc[i+1],rc[i+1]]),panels:[['正在比较',`x = ${target}；u = ${u}；${u?'value[u] = '+values[u]:'空子树'}`],['已走过的值',path.map(id=>values[id]).join(' → ')||'尚无'],...(insert?[['调用栈 · 右端栈顶',calls.map(id=>`insertNode(${id}, 6)`).join(' → ')||'空']]:[])],...extra});
    emit('init',insert?'enter':'loop',`从根编号 1 开始，目标数值为 ${target}。`,1);
    let u=1;
    while(u){
        path.push(u);if(insert)calls.push(u);
        if(values[u]===target){emit('found','equal',`目标与 value[${u}] 相等，查找成功，不再搜索其他子树。`,u);t.result=true;return t;}
        const left=target<values[u],next=left?lc[u]:rc[u],line=left?'left':'right';
        emit('compare',line,`${target} ${left?'<':'>'} ${values[u]}，${left?'左':'右'}子树才可能包含目标；读取 ${left?'lc':'rc'}[${u}] = ${next}。`,u);
        const eid=edges.find(e=>e.from===u&&e.to===(next||7))?.id;if(eid!==undefined)chosen.push(eid);
        u=next;
        if(u)emit('move',insert?'enter':'loop',`沿刚才选中的边移动，u 变为 ${u}；接下来和 ${values[u]} 比较。`,u);
    }
    if(!insert){emit('missing','missing','来到空子树，u = 0；这一侧没有目标，返回 false。灰色 ∅ 只是空位置，不是真实结点。',0,{active:[7]});t.result=false;return t;}
    emit('empty','empty','来到空子树，u = 0；创建结点保存 6，而不是继续向下比较。',0,{active:[7]});
    values.push(6);lc.push(0);rc.push(0);
    emit('create','create','分配新编号 7，令 value[7] = 6，返回编号 7。当前尚未接回父亲。',7,{labels:{7:'6'},hiddenEdges:[5]});
    lc[5]=7;
    emit('attach','left','父亲编号 5 收到返回值，执行 lc[5] = 7。新结点这时才接进树。',5,{labels:{7:'6'}});
    while(calls.length){const id=calls.pop();emit('return','return',`这一层返回自己的根编号 ${id}。上层把它接回原来的子树位置；整棵树的根仍是编号 1。`,id,{labels:{7:'6'}});}
    emit('done','return','插入完成：6 在 7 的左侧，并且仍位于 5 的右子树。',7,{labels:{7:'6'},done:[1,2,3,4,5,6,7]});t.result=values.slice(1);return t;
}

export function traversalTrace(mode='dfs',custom) {
    const g=custom||numberedGraph('traversal'),a=adjacency(g),n=g.nodes.length,vis=Array(n+1).fill(false),pending=[1],order=[];
    a.forEach(list=>list.sort((x,y)=>x.to-y.to));
    const dfs=mode==='dfs';if(!dfs)vis[1]=true;
    const t=recorder(g,dfs?'DFS：显式栈保存待尝试的点':'BFS：队列按层安排访问',['点','vis：是否已标记'],[
        ['init',dfs?'st.push(start);':'q.push(start); vis[start] = true;'],['take',dfs?'u = st.top(); st.pop();':'u = q.front(); q.pop();'],['skip',dfs?'if (vis[u]) continue;':'// 已入队的点不再重复入队'],['visit',dfs?'vis[u] = true; cout << u;':'cout << u;'],['edge',dfs?'// 按邻居编号倒序枚举':'for (int v : g[u])'],['push',dfs?'if (!vis[v]) st.push(v);':'if (!vis[v]) { vis[v] = true; q.push(v); }'],['done','// 待处理容器为空，搜索结束']
    ],dfs?'图与 P5318 自拟输入相同。栈里允许有重复候选，弹出时才检查 vis；右端是栈顶。':'图与 P5318 自拟输入相同。入队时就标记，避免两个前驱重复安排同一个点；左端是队头。');
    let active=0;
    const emit=(event,line,note,edge=-1)=>t.emit({event,line,note,edge,active:active?[active]:[],done:order,frontier:pending,rows:g.nodes.map(x=>[x.id,vis[x.id]?'true':'false']),panels:[[dfs?'栈 · 右端栈顶':'队列 · 左端队头',pending.join('  ')||'空'],['输出顺序',order.join(' → ')||'尚无']]});
    emit('init','init','放入起点 1。点 6 没有可达路线，不会出现在本次输出中。');
    while(pending.length){active=dfs?pending.pop():pending.shift();emit('take','take',`取出 ${active}。`);
        if(dfs&&vis[active]){emit('skip','skip',`${active} 已经访问，跳过这份重复候选，不再展开邻居。`);continue;}
        vis[active]=true;order.push(active);emit('visit','visit',`正式访问 ${active}，将它写入输出。`);
        for(const e of (dfs?a[active].slice().reverse():a[active])){
            emit('edge','edge',`打开 g[${active}]，查看邻居 ${e.to}。`,e.id);
            if(!vis[e.to]){pending.push(e.to);if(!dfs)vis[e.to]=true;emit('push','push',`把 ${e.to} 放入${dfs?'栈':'队列，并立即标记'}。`,e.id);}else emit('skip','skip',`${e.to} 已标记，无需重复安排。`,e.id);
        }
    }
    active=0;emit('done','done',`本次访问顺序为 ${order.join(' → ')}。`);t.result=order;return t;
}

export function dijkstraTrace(custom) {
    const g=custom||numberedGraph('dijkstra'),a=adjacency(g),n=g.nodes.length,dist=Array(n+1).fill(null),heap=[[0,1]],settled=[],chosen=[];dist[1]=0;
    const t=recorder(g,'Dijkstra：候选、松弛与过期堆记录',['点','dist：当前最好距离','已经确定'],[
        ['init','dist[s] = 0; heap.push({0, s});'],['pop','distance = heap.top().first; u = heap.top().second; heap.pop();'],['skip','if (distance != dist[u]) continue;'],['edge','for (const Edge &e : g[u]) {'],['test','    if (distance + e.weight < dist[e.to]) {'],['relax','        dist[e.to] = distance + e.weight;'],['push','        heap.push({dist[e.to], e.to});'],['done','// 堆空，读取 dist']
    ],'与 P4779 自拟输入相同。点旁的表格记录当前最优距离；候选表按小根堆的弹出顺序显示，不是堆的内部数组形状。');
    let u=0,record=null;
    const sort=()=>heap.sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
    const emit=(event,line,note,edge=-1)=>{sort();t.emit({event,line,note,edge,chosen,done:settled,active:u?[u]:[],rows:g.nodes.map(x=>[x.id,value(dist[x.id]),settled.includes(x.id)?'是':'否']),panels:[['候选 · 每项为 (距离,点)',heap.map(([d,v])=>`(${d},${v})${d!==dist[v]?' [过期]':''}`).join('  ')||'空'],['刚取出的候选',record?`(${record[0]},${record[1]})`:'尚无']]});};
    emit('init','init','只有起点的距离为 0，其他点尚不可达。');
    while(heap.length){sort();record=heap.shift();const distance=record[0];u=record[1];emit('pop','pop',`取出当前最小候选 (${distance},${u})。`);
        if(distance!==dist[u]){emit('stale','skip',`记录中的 ${distance} 已不等于 dist[${u}] = ${dist[u]}，这条路线已经过期，直接跳过。`);continue;}
        settled.push(u);emit('settle','edge',`这是一条有效最小候选。所有边权非负，因此 ${u} 的最短距离现在确定。`);
        for(const e of a[u]){const candidate=distance+e.weight;emit('edge','test',`尝试 ${u}→${e.to}：${distance} + ${e.weight} = ${candidate}；原距离为 ${value(dist[e.to])}。`,e.id);
            if(dist[e.to]===null||candidate<dist[e.to]){dist[e.to]=candidate;emit('relax','relax',`候选更小，执行 dist[${e.to}] = ${candidate}。`,e.id);heap.push([candidate,e.to]);emit('push','push',`把新候选 (${candidate},${e.to}) 放入堆；旧记录留在堆中，弹出时再跳过。`,e.id);}else emit('keep','test','候选没有更好，不更新距离，也不入堆。',e.id);
        }
    }
    u=0;emit('done','done',`堆已空，最短距离为 ${dist.slice(1).map(value).join('  ')}。`);t.result=dist.slice(1);return t;
}

export function bellmanTrace() {
    const g=numberedGraph('negative'),n=g.nodes.length,dist=Array(n+1).fill(null);dist[1]=0;
    const t=recorder(g,'Bellman–Ford：为什么第 n 轮仍然改善',['点','dist'],[
        ['init','dist[1] = 0; // 其他为 INF'],['round','for (int round = 1; round <= n; round++) {'],['edge','    for (const Edge &e : edges) {'],['test','        if (dist[e.from] != INF && dist[e.from] + e.weight < dist[e.to])'],['relax','            dist[e.to] = dist[e.from] + e.weight;'],['negative','    // 第 n 轮仍改善：存在从起点可达的负环']
    ],'与 P3385 第一组自拟输入对应；非负记录加入两个方向，负权记录只加入输入方向。同一轮使用刚更新的距离。');
    let round=0;
    const emit=(event,line,note,edge=-1)=>t.emit({event,line,note,edge,active:edge>=0?[g.edges[edge].from,g.edges[edge].to]:[],rows:g.nodes.map(x=>[x.id,value(dist[x.id])]),panels:[['扫描轮次',`${round} / ${n}`],['负环', '2 → 3 → 2；总权 −3 + 1 = −2']]});
    emit('init','init','先只让 1 可达。');
    let negative=false;
    for(round=1;round<=n;round++){emit('round','round',`开始第 ${round} 轮扫描。每轮都再次检查全部边。`);let changed=false;
        for(const e of g.edges){emit('edge','test',`检查 ${e.from}→${e.to}，边权 ${e.weight}。`,e.id);
            if(dist[e.from]!==null&&(dist[e.to]===null||dist[e.from]+e.weight<dist[e.to])){const old=dist[e.to];dist[e.to]=dist[e.from]+e.weight;changed=true;emit('relax','relax',`dist[${e.to}] 从 ${value(old)} 改成 ${dist[e.to]}。`,e.id);}
        }
        if(round===n&&changed)negative=true;if(!changed)break;
    }
    round=Math.min(round,n);emit('done','negative',negative?'第 3 轮仍有改善。不断绕 2→3→2，每次都能再便宜 2，答案是 YES。':'没有可达负环。');t.result=negative;return t;
}

export function floydTrace() {
    const g=numberedGraph('floyd'),d=[[0,5,1],[5,0,1],[1,1,0]],t=recorder(g,'Floyd：逐步放开中间点',['起点 / 终点','1','2','3'],[
        ['init','// d 初始化为直接代价，d[i][i] = 0'],['middle','for (int k = 0; k < n; k++) {'],['test','    // 枚举 i、j，比较原路线和 i → k → j'],['relax','    d[i][j] = min(d[i][j], d[i][k] + d[k][j]);'],['done','// 每对点之间的最短路都已算好']
    ],'与 P2910 自拟矩阵相同。图上始终标原始边权；表格才是逐轮更新的最短距离。只把会改善的比较单步展开，其余比较在轮次说明中汇总。');
    let k=-1;
    const emit=(event,line,note,active=[],chosen=[])=>t.emit({event,line,note,active,chosen,rows:d.map((r,i)=>[i+1,...r]),panels:[['当前中间点',k<0?'尚未放开':String(k+1)],['允许的中间点',k<0?'空集':Array.from({length:k+1},(_,i)=>i+1).join('  ')]]});
    emit('init','init','矩阵开始保存直接代价。');
    for(k=0;k<3;k++){emit('middle','middle',`现在允许 ${k+1} 也作为中间点；完整枚举全部起点和终点。`,[k+1]);let count=0;
        for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(d[i][k]+d[k][j]<d[i][j]){const candidate=d[i][k]+d[k][j],chosen=g.edges.filter(e=>(e.from===i+1&&e.to===k+1)||(e.from===k+1&&e.to===j+1)).map(e=>e.id);emit('test','test',`${i+1}→${k+1}→${j+1}：${d[i][k]} + ${d[k][j]} = ${candidate}，比原来的 ${d[i][j]} 小。`,[i+1,k+1,j+1],chosen);d[i][j]=candidate;emit('relax','relax',`更新 d[${i+1}][${j+1}] = ${candidate}。`,[i+1,k+1,j+1],chosen);count++;}}
        emit('round','middle',`中间点 ${k+1} 的所有点对已比较，本轮改善 ${count} 项。`,[k+1]);
    }
    k=2;emit('done','done','所有中间点已放开。要求按 1、2、3 经过时，总费用为 d[1][2] + d[2][3] = 2 + 1 = 3。');t.result=d;return t;
}

export function mstTrace(mode='kruskal',custom) {
    const g=custom||numberedGraph('mst'),n=g.nodes.length,a=adjacency(g),parent=Array.from({length:n+1},(_,i)=>i),chosen=[],rejected=[],inside=[],dist=Array(n+1).fill(null),heap=[];let total=0;
    const find=x=>{while(parent[x]!==x)x=parent[x];return x;},prim=mode==='prim';
    const t=recorder(g,prim?'Prim：只从当前树的外沿选最便宜的连接':'Kruskal：便宜的边也要先检查会不会成环',prim?['点','已知最便宜的接入代价','已在树内']:['点','所在并查集代表'],prim?[
        ['init','heap.push({0, 1});'],['choose','cost = heap.top().first; u = heap.top().second; heap.pop();'],['skip','if (inTree[u]) continue;'],['join','inTree[u] = true; reached++; answer += cost;'],['edge','for (const Edge &e : g[u])'],['update','    if (!inTree[e.to]) heap.push({e.weight, e.to});'],['done','// reached == n 时得到生成树']
    ]:[['init','sort(edges.begin(), edges.end(), byWeight);'],['edge','for (const Edge &e : edges) {'],['test','    if (dsu.find(e.u) == dsu.find(e.v)) continue;'],['join','    dsu.merge(e.u, e.v);'],['sum','    answer += e.weight; chosen++;'],['done','// chosen == n - 1 时得到生成树']], '与 P3366 自拟图相同。绿色实线是已选树边；红色虚线是已经检查后跳过的边。比较两种算法如何得到相同总权。');
    const emit=(event,line,note,edge=-1,active=[])=>t.emit({event,line,note,edge,active,chosen,rejected,done:inside,rows:g.nodes.map(x=>prim?[x.id,value(dist[x.id]),inside.includes(x.id)?'是':'否']:[x.id,find(x.id)]),panels:[['已选边',chosen.map(id=>{const e=g.edges[id];return `${e.from}—${e.to}(${e.weight})`;}).join('  ')||'尚无'],['总权',String(total)],['下一步的候选',prim?heap.slice().sort((x,y)=>x[0]-y[0]||x[1]-y[1]).map(([w,v])=>`(${w},${v})${inside.includes(v)?' [已入树]':''}`).join('  ')||'空':g.edges.slice().sort((x,y)=>x.weight-y.weight||x.id-y.id).map(e=>`${e.from}—${e.to}(${e.weight})`).join('  ')]]});
    if(!prim){emit('init','init','先将所有边按权值升序排列。');for(const e of g.edges.slice().sort((x,y)=>x.weight-y.weight||x.id-y.id)){
        emit('edge','test',`考虑 ${e.from}—${e.to}，权 ${e.weight}；两端代表分别为 ${find(e.from)}、${find(e.to)}。`,e.id,[e.from,e.to]);
        if(find(e.from)===find(e.to)){rejected.push(e.id);emit('reject','test','两端已经在同一块，加入会形成环，跳过。',e.id);continue;}
        parent[find(e.to)]=find(e.from);chosen.push(e.id);total+=e.weight;emit('join','sum',`合并两个连通块，选边数变为 ${chosen.length}，总权变为 ${total}。`,e.id);
    }}else{
        dist[1]=0;heap.push([0,1,-1]);emit('init','init','从点 1 开始。候选 (cost,u) 的 cost 是接入当前树的单条边代价，并非从 1 出发的路径长度。');
        while(heap.length){heap.sort((x,y)=>x[0]-y[0]||x[1]-y[1]||x[2]-y[2]);const [cost,u,eid]=heap.shift();emit('choose','choose',`从堆中弹出 (${cost},${u})，先检查 ${u} 是否已在树内。`,eid,[u]);
            if(inside.includes(u)){emit('reject','skip',`${u} 已经加入过当前树，跳过这份候选；不能重复计费。`,eid,[u]);continue;}
            inside.push(u);if(eid>=0)chosen.push(eid);dist[u]=cost;total+=cost;emit('join','join',`将 ${u} 加入树，使用这条接入边，总权变为 ${total}。`,eid,[u]);
            for(const e of a[u]){emit('edge','edge',`检查从 ${u} 到 ${e.to} 的连接，边权 ${e.weight}。`,e.id,[u,e.to]);if(!inside.includes(e.to)){heap.push([e.weight,e.to,e.id]);if(dist[e.to]===null||e.weight<dist[e.to])dist[e.to]=e.weight;emit('update','update',`把候选 (${e.weight},${e.to}) 放入堆。即使它比已有连接贵，也先保存，弹出时再检查是否已入树。`,e.id,[e.to]);}}
        }
    }
    emit('done','done',chosen.length===n-1?`选出 ${n-1} 条边，连通所有点，总权 ${total}。`:'未能连通全部点，原图不存在生成树。');t.result={total,chosen,connected:chosen.length===n-1};return t;
}

export function lowlinkTrace(custom) {
    const g=custom||numberedGraph('lowlink'),n=g.nodes.length,a=adjacency(g),dfn=Array(n+1).fill(0),low=Array(n+1).fill(0),calls=[],tree=[],bridges=[],back=[];let timer=0;
    // Tones in the static illustration are conclusions; the animation discovers them afresh.
    g.edges.forEach(e=>delete e.tone);
    const t=recorder(g,'无向图 low：返回时判断树边能否绕过',['点','dfn','low'],[
        ['enter','dfn[u] = low[u] = ++timer;'],['edge','for (Edge e : g[u]) {'],['parent','    if (e.id == parentEdge) continue;'],['tree','    if (!dfn[v]) dfs(v, e.id);'],['back','    else low[u] = min(low[u], dfn[v]);'],['return','// 孩子返回：low[u] = min(low[u], low[v]);'],['bridge','// low[v] > dfn[u]：u—v 是桥'],['done','// 所有连通块处理完毕']
    ],'与 P1656 自拟输入相同。蓝色边是非树绕行边；绿色边是 DFS 树边；最终标出的红色边才是桥。调用栈右端是当前函数。');
    const emit=(event,line,note,u=0,edge=-1)=>t.emit({event,line,note,edge,active:u?[u]:[],chosen:tree,bridges,back,rows:g.nodes.map(x=>[x.id,dfn[x.id]||'—',low[x.id]||'—']),panels:[['调用栈 · 右端栈顶',calls.join(' → ')||'空'],['已找到的桥',bridges.map(id=>`${g.edges[id].from}—${g.edges[id].to}`).join('  ')||'尚无']]});
    function dfs(u,pe){calls.push(u);dfn[u]=low[u]=++timer;emit('enter','enter',`进入 ${u}，给它发现时间 ${dfn[u]}；low 先设成自己。`,u);
        for(const e of a[u]){const v=e.to;emit('edge','edge',`查看 ${u}—${v}。`,u,e.id);if(e.id===pe){emit('parent','parent','这正是进入当前点的父边，反向记录不是另一条绕行路线，跳过。',u,e.id);continue;}
            if(!dfn[v]){tree.push(e.id);emit('tree','tree',`${v} 尚未发现，沿树边进入它；当前循环暂停，等待孩子返回。`,u,e.id);dfs(v,e.id);low[u]=Math.min(low[u],low[v]);emit('return','return',`孩子 ${v} 返回 low[${v}] = ${low[v]}；更新 low[${u}] = ${low[u]}。`,u,e.id);if(low[v]>dfn[u]){bridges.push(e.id);emit('bridge','bridge',`${low[v]} > ${dfn[u]}，孩子一侧绕不到 ${u} 或更早祖先，${u}—${v} 是桥。`,u,e.id);}else emit('safe','bridge',`${low[v]} ≤ ${dfn[u]}，存在替代路线，这条树边不是桥。`,u,e.id);
            }else{low[u]=Math.min(low[u],dfn[v]);if(!tree.includes(e.id)&&!back.includes(e.id))back.push(e.id);emit('back','back',`已发现 ${v}，用它的 dfn = ${dfn[v]} 更新；low[${u}] 变为 ${low[u]}。`,u,e.id);}
        }
        calls.pop();emit('leave','return',`${u} 的邻居全部处理完，返回上一层。`,calls.at(-1)||0);
    }
    for(const x of g.nodes)if(!dfn[x.id])dfs(x.id,-1);
    emit('done','done',`DFS 完成，共找到 ${bridges.length} 条桥。`);t.result={dfn,low,bridges};return t;
}

export function tarjanTrace(custom) {
    const g=custom||numberedGraph('scc'),n=g.nodes.length,a=adjacency(g),dfn=Array(n+1).fill(0),low=Array(n+1).fill(0),component=Array(n+1).fill(0),calls=[],active=[],tree=[];let timer=0,count=0;
    // The animation must reveal groups, not display the completed SCC partition at the start.
    delete g.groups;
    const t=recorder(g,'Tarjan：调用返回与整组弹栈是两件事',['点','dfn','low','在 active 中','分量编号'],[
        ['enter','dfn[u] = low[u] = ++timer; active.push_back(u); inStack[u] = true;'],['edge','for (int v : g[u]) {'],['tree','    if (!dfn[v]) { dfs(v); low[u] = min(low[u], low[v]); }'],['back','    else if (inStack[v]) low[u] = min(low[u], dfn[v]);'],['ignore','    // 已经归组的 v 不参与 low 更新'],['root','if (low[u] == dfn[u]) {'],['pop','    // active 连续弹到 u，赋相同 component 编号'],['return','// 当前调用返回；active 中可能仍然留有 u'],['done','// 每个点恰好属于一个 SCC']
    ],'与 P2863 自拟输入相同。calls 模拟函数调用，active 保存尚未归组的点；它们不能合成一个栈。两栈的右端都是栈顶。');
    const emit=(event,line,note,u=0,edge=-1)=>t.emit({event,line,note,edge,active:u?[u]:[],chosen:tree,done:g.nodes.filter(x=>component[x.id]).map(x=>x.id),groups:component,rows:g.nodes.map(x=>[x.id,dfn[x.id]||'—',low[x.id]||'—',active.includes(x.id)?'是':'否',component[x.id]||'—']),panels:[['calls · 当前函数栈',calls.join(' → ')||'空'],['active · 尚未归组',active.join(' → ')||'空'],['归组进度 · 弹栈中的组还会增加',Array.from({length:count},(_,i)=>`${i+1}: {${g.nodes.filter(x=>component[x.id]===i+1).map(x=>x.id).join(',')}}`).join('  ')||'尚无']]});
    function dfs(u){calls.push(u);active.push(u);dfn[u]=low[u]=++timer;emit('enter','enter',`进入 ${u}，同时加入 calls 与 active；dfn 和 low 初始化为 ${timer}。`,u);
        for(const e of a[u]){const v=e.to;emit('edge','edge',`查看有向边 ${u}→${v}。`,u,e.id);
            if(!dfn[v]){tree.push(e.id);emit('tree','tree',`${v} 尚未发现，调用 dfs(${v})。当前这一层的邻居循环暂停。`,u,e.id);dfs(v);low[u]=Math.min(low[u],low[v]);emit('propagate','tree',`${v} 返回，用孩子的 low[${v}] = ${low[v]} 更新，low[${u}] = ${low[u]}。`,u,e.id);}
            else if(active.includes(v)){low[u]=Math.min(low[u],dfn[v]);emit('back','back',`${v} 已发现且尚在 active，用 dfn[${v}] = ${dfn[v]} 更新，low[${u}] = ${low[u]}。`,u,e.id);}
            else emit('ignore','ignore',`${v} 已弹栈归组。只有通向它的单向路线，不能据此把两个分量合并，忽略这条边。`,u,e.id);
        }
        emit('root','root',`邻居处理完：low[${u}] = ${low[u]}，dfn[${u}] = ${dfn[u]}，${low[u]===dfn[u]?'相等，准备弹出一个完整分量':'不相等，暂不归组'}。`,u);
        if(low[u]===dfn[u]){count++;let v;do{v=active.pop();component[v]=count;emit('pop','pop',`从 active 弹出 ${v}，清除 inStack 并赋分量编号 ${count}；${v===u?'已弹到入口 '+u+'，本组结束':'还未弹到入口 '+u+'，继续弹'}。`,u);}while(v!==u);}
        calls.pop();emit('return','return',`调用 dfs(${u}) 结束。${active.includes(u)?u+' 仍留在 active，等待更早入口统一归组。':u+' 已经归组。'}`,calls.at(-1)||0);
    }
    for(const x of g.nodes)if(!dfn[x.id])dfs(x.id);
    emit('done','done',`全部调用结束，共 ${count} 个 SCC。分量之间的单向边没有让它们成为同一组。`);t.result={component,count,dfn,low};return t;
}

export const modes={
    bst:[['find7','查找 7：成功'],['find6','查找 6：不存在'],['insert6','插入 6']],
    traversal:[['dfs','DFS：显式栈'],['bfs','BFS：队列']],
    dijkstra:[['dijkstra','堆优化 Dijkstra']],bellman:[['bellman','Bellman–Ford 与负环']],floyd:[['floyd','Floyd 中间点']],
    mst:[['kruskal','Kruskal：选边合并'],['prim','Prim：扩张当前树']],lowlink:[['lowlink','无向图 low 与桥']],tarjan:[['tarjan','Tarjan 强连通分量']]
};
export function buildTrace(demo,mode){
    if(demo==='bst')return bstTrace(mode);if(demo==='traversal')return traversalTrace(mode);
    if(demo==='dijkstra')return dijkstraTrace();if(demo==='bellman')return bellmanTrace();if(demo==='floyd')return floydTrace();
    if(demo==='mst')return mstTrace(mode);if(demo==='lowlink')return lowlinkTrace();if(demo==='tarjan')return tarjanTrace();
    throw Error('Unknown demo: '+demo);
}
