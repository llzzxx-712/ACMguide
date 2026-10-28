export const seconds = 1.8;
export const presets = {
    topology: { title: '先看拓扑排序', n: 4, dp: false,
        edges: [[1,2,3],[1,3,5],[2,4,4],[3,4,-1]], source: 1, target: 4 },
    longest: { title: '接上最长路 DP', n: 4, dp: true,
        edges: [[1,2,3],[1,3,5],[2,4,4],[3,4,-1]], source: 1, target: 4 },
    unreachable: { title: '不可达点也要出队', n: 5, dp: true,
        edges: [[1,3,2],[2,3,8],[3,5,4],[2,4,-2],[4,5,1]], source: 1, target: 5 },
    cycle: { title: '有环时为何停下', n: 4, dp: false,
        edges: [[1,2,1],[2,3,1],[3,2,1],[3,4,1]], source: 1, target: 4 }
};

export function buildTopoTrace(mode = 'topology', options = {}) {
    if (!presets[mode]) throw Error('Unknown topological trace mode');
    const config = {...presets[mode], ...options};
    const {n, source, target, dp} = config;
    if (!Number.isInteger(n) || n < 1 || source < 1 || source > n || target < 1 || target > n) throw Error('Invalid vertices');
    const edges = config.edges.map(([from,to,weight=0],id)=>({id,from,to,weight}));
    const graph = Array.from({length:n+1},()=>[]), indegree=Array(n+1).fill(0);
    for (const edge of edges) {
        if (edge.from<1 || edge.from>n || edge.to<1 || edge.to>n || !Number.isFinite(edge.weight)) throw Error('Invalid edge');
        graph[edge.from].push(edge);
        indegree[edge.to]++;
    }
    const queue=[],order=[],processed=[],removed=[],f=Array(n+1).fill(null),frames=[];
    if (dp) f[source]=0;
    let u=0,v=0,activeEdge=-1,candidate=null,oldValue=null,changed=false;
    const push=(event,line,note)=>frames.push(JSON.parse(JSON.stringify({
        event,line,note,u,v,activeEdge,candidate,oldValue,changed,indegree,queue,order,processed,removed,f
    })));
    push('init','init',dp
        ? `先统计所有入度；只有起点 ${source} 的 f 为 0，其余是不可达。队列负责依赖顺序，f 负责从起点能否到达。`
        : '先统计每个点还有几条入边。入度为 0，表示已经没有前驱需要等待。');
    for (let node=1;node<=n;node++) if (indegree[node]===0) {
        queue.push(node);
        push('seed','seed',`点 ${node} 的入度为 0，将它放入等待队列。所有零入度点都要检查。`);
    }
    while (queue.length) {
        u=queue.shift();v=0;activeEdge=-1;candidate=null;oldValue=null;changed=false;
        order.push(u);
        push('take','pop',`取出队头 ${u}，写入拓扑序。它的全部前驱均已处理${dp?'，f['+u+'] 此时已经确定':''}。`);
        for (const edge of graph[u]) {
            v=edge.to;activeEdge=edge.id;candidate=null;oldValue=f[v];changed=false;
            push('edge','each',`查看有向边 ${u}→${v}${dp?'，边权 '+edge.weight:''}。先处理这条边的贡献，再释放它代表的依赖。`);
            if (dp) {
                if (f[u]===null) {
                    push('unreachable','guard',`f[${u}] 是不可达，不向 ${v} 传播最长路；但这条依赖仍要删除，不能跳过入度更新。`);
                } else {
                    candidate=f[u]+edge.weight;
                    changed=f[v]===null || candidate>f[v];
                    if (changed) f[v]=candidate;
                    push('relax','relax',`候选 f[${u}]+${edge.weight}=${candidate}；f[${v}] 从 ${oldValue===null?'不可达':oldValue}${changed?'更新为 '+f[v]:'保持为 '+f[v]}。`);
                }
            }
            indegree[v]--;removed.push(edge.id);
            push('remove','decrease',`删除 ${u}→${v} 这条依赖，indegree[${v}] 变为 ${indegree[v]}。${indegree[v]===0?'全部前驱已到齐。':'还有前驱未处理，暂时不能入队。'}`);
            if (indegree[v]===0) {
                queue.push(v);
                push('enqueue','enqueue',`indegree[${v}]=0，把 ${v} 放到队尾。入队不等于立即处理，仍按队列顺序等待。`);
            }
        }
        processed.push(u);activeEdge=-1;v=0;candidate=null;
        push('finish','while',`点 ${u} 的全部出边处理完毕，继续查看队头。`);
    }
    u=0;v=0;activeEdge=-1;candidate=null;changed=false;
    const cycle=order.length!==n;
    push('done','done',cycle
        ? `队列已空，但只取出了 ${order.length}/${n} 个点，存在有向环。未出队点也可能位于环的下游，不能全部判为环内点。`
        : dp ? `全部点按拓扑顺序处理完毕。${source}→${target} 的最长路${f[target]===null?'不可达，输出 -1':'为 '+f[target]}。`
        : `全部 ${n} 个点已取出，得到一个合法拓扑序：${order.join(' → ')}。每条边的起点都在终点前面。`);
    const joinStep=frames.findIndex(frame=>frame.event==='remove' && frame.indegree[frame.v]>0);
    const unlockStep=frames.findIndex(frame=>frame.event==='remove' && frame.indegree[frame.v]===0 && edges.filter(e=>e.to===frame.v).length>1);
    return {mode,...config,edges,frames,cycle,joinStep,unlockStep,lastStep:frames.length-1};
}
