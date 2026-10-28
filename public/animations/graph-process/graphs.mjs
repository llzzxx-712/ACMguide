// Shared by the static SVG illustrations and the interactive algorithm traces.
const node = (id,x,y,label=String(id),extra={}) => ({id,x,y,label,...extra});
const edge = (from,to,weight,extra={}) => ({from,to,...(weight===undefined?{}:{weight}),...extra});
export const graphs = {
    campus: {title:'校园道路与孤立点', directed:false, nodes:[node(1,100,155),node(2,290,65),node(3,290,245),node(4,480,155),node(5,640,155)], edges:[edge(1,2),edge(1,3),edge(2,4),edge(3,4)]},
    weighted: {title:'带权邻接表：目标和权值成对保存', directed:true, nodes:[node(1,110,155),node(2,410,65),node(3,410,245)], edges:[edge(1,2,5),edge(1,3,7)]},
    traversal: {title:'有向引用图：从 1 出发，6 不可达', directed:true, nodes:[node(1,75,155),node(2,255,65),node(3,255,245),node(4,465,65),node(5,465,245),node(6,640,155)],edges:[edge(1,2),edge(1,3),edge(2,3),edge(2,4),edge(3,5)]},
    topology: {title:'前置任务指向后续任务',directed:true,nodes:[node(1,90,155,'1',{sub:'耗时 3'}),node(2,340,55,'2',{sub:'耗时 2'}),node(3,340,255,'3',{sub:'耗时 4'}),node(4,600,155,'4',{sub:'耗时 2'})],edges:[edge(1,2),edge(1,3),edge(2,4),edge(3,4)]},
    dag: {title:'两条完整食物链：1→2→4 与 1→3→4',directed:true,nodes:[node(1,100,155),node(2,350,55),node(3,350,255),node(4,600,155)],edges:[edge(1,2),edge(1,3),edge(2,4),edge(3,4)]},
    relaxation: {title:'直达费用 10，绕经 3 的费用只有 2',directed:true,nodes:[node(1,110,100),node(2,600,100),node(3,355,255)],edges:[edge(1,2,10),edge(1,3,1),edge(3,2,1)]},
    zeroOne: {title:'电车：默认方向权为 0，切换方向权为 1',directed:true,nodes:[node(1,120,155),node(2,370,65),node(3,600,235)],edges:[edge(1,2,0,{bend:24}),edge(2,1,0,{bend:24}),edge(1,3,1)]},
    dijkstra: {title:'Dijkstra：先发现不代表已经最短',directed:true,nodes:[node(1,80,155),node(2,340,55),node(3,340,255),node(4,625,155)],edges:[edge(1,2,10),edge(1,3,1),edge(3,2,2),edge(2,4,1),edge(3,4,8)]},
    negative: {title:'从 1 可达的负环：2→3→2，总权为 −2',directed:true,nodes:[node(1,95,155),node(2,335,155),node(3,590,155)],edges:[edge(1,2,1,{bend:20}),edge(2,1,1,{bend:20}),edge(2,3,-3,{bend:32}),edge(3,2,1,{bend:32})]},
    floyd: {title:'允许 3 中转后，1 到 2 从 5 改为 2',directed:true,nodes:[node(1,100,75),node(2,610,75),node(3,355,255)],edges:[edge(1,2,5,{bend:20}),edge(2,1,5,{bend:20}),edge(1,3,1,{bend:20}),edge(3,1,1,{bend:20}),edge(2,3,1,{bend:20}),edge(3,2,1,{bend:20})]},
    layered: {title:'分层图：同层付费，跨层使用一次免费机会',directed:true,nodes:[node(1,95,65,'(0,0)'),node(2,350,65,'(1,0)'),node(3,605,65,'(2,0)'),node(4,95,245,'(0,1)'),node(5,350,245,'(1,1)'),node(6,605,245,'(2,1)')],edges:[edge(1,2,5),edge(2,3,5),edge(4,5,5),edge(5,6,5),edge(1,5,0),edge(2,6,0)]},
    cut: {title:'割把点分成两侧；生成树必须跨过去',directed:false,nodes:[node(1,100,75),node(2,100,245),node(3,550,75),node(4,550,245)],edges:[edge(1,2,2),edge(1,3,3,{tone:'chosen'}),edge(2,3,5),edge(2,4,4),edge(3,4,2)],groups:[{x:48,y:18,w:110,h:280,label:'S'},{x:495,y:18,w:110,h:280,label:'V − S'}]},
    mst: {title:'同一张图：最小生成树总权为 6',directed:false,nodes:[node(1,100,65),node(2,350,65),node(3,350,245),node(4,600,245)],edges:[edge(1,2,1),edge(2,3,2),edge(3,4,3),edge(1,4,10,{bend:45}),edge(1,3,4)]},
    bottleneck: {title:'瓶颈目标：比较路径中最大边，而非边权总和',directed:false,nodes:[node(1,100,75),node(2,350,245),node(3,600,75)],edges:[edge(1,2,4),edge(2,3,5),edge(1,3,8)]},
    replacement: {title:'加入非树边，形成一个环，再删去环上的树边',directed:false,nodes:[node(1,100,75),node(2,350,245),node(3,600,75)],edges:[edge(1,2,1,{tone:'chosen'}),edge(2,3,2,{tone:'chosen'}),edge(1,3,3,{tone:'active'})]},
    lowlink: {title:'三角形可以绕行；3—4、4—5 是桥',directed:false,nodes:[node(1,80,65),node(2,280,65),node(3,180,245),node(4,410,245),node(5,635,245)],edges:[edge(1,2),edge(2,3),edge(3,1,undefined,{tone:'back'}),edge(3,4,undefined,{tone:'bridge'}),edge(4,5,undefined,{tone:'bridge'})]},
    articulation: {title:'两个三角形共用 3：删点 3 后分开，删一条边仍可绕行',directed:false,nodes:[node(1,75,70),node(2,75,245),node(3,305,155,'3',{tone:'active'}),node(4,535,70),node(5,535,245),node(6,660,155)],edges:[edge(1,2),edge(2,3),edge(3,1),edge(3,4),edge(4,5),edge(5,3)]},
    scc: {title:'两个 SCC 之间只有单向联系',directed:true,nodes:[node(1,90,65),node(2,280,65),node(3,185,245),node(4,455,155),node(5,630,155)],edges:[edge(1,2),edge(2,3),edge(3,1),edge(3,4),edge(4,5,undefined,{bend:30}),edge(5,4,undefined,{bend:30})],groups:[{x:35,y:15,w:300,h:285,label:'SCC：1、2、3'},{x:405,y:60,w:280,h:220,label:'SCC：4、5'}]},
    condensation: {title:'原图：将相互可达的 1、2 合成一个点',directed:true,nodes:[node(1,100,80,'1',{sub:'点权 1'}),node(2,100,235,'2',{sub:'点权 2'}),node(3,365,80,'3',{sub:'点权 4'}),node(4,610,235,'4',{sub:'点权 8'})],edges:[edge(1,2,undefined,{bend:24}),edge(2,1,undefined,{bend:24}),edge(2,3),edge(3,4),edge(2,4)],groups:[{x:45,y:18,w:110,h:280,label:'同一 SCC'}]},
    condensed: {title:'缩成 DAG 后：3 + 4 + 8 = 15',directed:true,nodes:[node(1,105,155,'{1,2}',{sub:'权值和 3'}),node(2,355,65,'{3}',{sub:'权值 4'}),node(3,605,155,'{4}',{sub:'权值 8'})],edges:[edge(1,2),edge(2,3),edge(1,3,undefined,{bend:65})]},
    sat: {title:'A 或 B：非 A 推出 B，非 B 推出 A',directed:true,nodes:[node(1,115,75,'A'),node(2,115,240,'¬A'),node(3,585,75,'B'),node(4,585,240,'¬B')],edges:[edge(2,3),edge(4,1)]},
    pathCount: {title:'两条等长最短路在 4 汇合',directed:false,nodes:[node(1,100,155),node(2,350,55),node(3,350,255),node(4,600,155)],edges:[edge(1,2),edge(1,3),edge(2,4),edge(3,4)]},
    euler: {title:'单词是边：每条边恰好使用一次',directed:true,nodes:[node(1,125,155,'a'),node(2,605,155,'b'),node(3,350,270,'c')],edges:[edge(1,2,undefined,{label:'ab'}),edge(1,3,undefined,{label:'ac',bend:26}),edge(3,1,undefined,{label:'ca',bend:26})]},
    constraints: {title:'差分约束：变量是不等式中的点，右侧来源指向左侧目标',directed:true,nodes:[node(1,605,75,'x₁'),node(2,350,255,'x₂'),node(3,100,75,'x₃')],edges:[edge(2,1,3),edge(3,2,-2),edge(3,1,1)]}
};

export function numberedGraph(key) {
    const graph=structuredClone(graphs[key]);
    if(!graph) throw Error('Unknown graph: '+key);
    graph.edges=graph.edges.map((e,id)=>({...e,id}));
    return graph;
}
