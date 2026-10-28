import {readFile,writeFile} from 'node:fs/promises';
const template=await readFile('public/animations/graph-process/bst.html','utf8');
const demos={traversal:'DFS 与 BFS',dijkstra:'Dijkstra 最短路',bellman:'Bellman–Ford 与负环',floyd:'Floyd 中间点',mst:'Kruskal 与 Prim',lowlink:'无向图 low 与桥',tarjan:'Tarjan 强连通分量'};
for(const [id,title] of Object.entries(demos)){
    const html=template.replaceAll('二叉搜索树的插入与查找',title).replace('data-demo="bst"',`data-demo="${id}"`).replace('已走过的路径','已选树边 / 已处理点').replace('∅ 表示空位置',id==='lowlink'?'红色：确认的桥':'蓝色：等待处理');
    await writeFile(`public/animations/graph-process/${id}.html`,html);
}
console.log(`Generated ${Object.keys(demos).length+1} interactive graph players.`);
