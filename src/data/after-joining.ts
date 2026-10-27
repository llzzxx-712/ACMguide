export type OutlineChapter = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  sections: string[];
  lessonSlugs?: string[];
  training: { id: number; title: string }[];
};
type OutlinePhase = {
  slug: string;
  title: string;
  summary: string;
  chapters: OutlineChapter[];
};

export const afterJoiningPhases: OutlinePhase[] = [
  {
    slug: 'complete-foundations', title: '一、补齐基础篇',
    summary: '接着招新前的课程，补上二叉树、集合和图的基本应用。',
    chapters: [
      { id: 1, slug: 'binary-trees', title: '二叉树',
        summary: '从父子关系与递归性质出发，学习树的表示和遍历。',
        sections: ['根、父亲、孩子、叶子与树的深度', '用数组存储二叉树', '前序、中序、后序遍历与层序遍历', '遍历序列还原与二叉搜索树入门'],
        lessonSlugs: ['tree-basics', 'tree-storage', 'tree-traversals', 'tree-reconstruction'],
        training: [{ id: 114, title: '二叉树' }] },
      { id: 2, slug: 'sets-and-dsu', title: '集合、映射与并查集',
        summary: '根据需要查询的关系，选择集合容器、哈希或并查集。',
        sections: ['set、multiset 与有序集合的操作', 'map、unordered_map 与键值映射', '哈希的思想与集合去重', '并查集：查找、合并与路径压缩', '按大小合并、连通块统计与关系维护'],
        lessonSlugs: ['ordered-sets', 'maps', 'hash-basics', 'dsu', 'dsu-size'],
        training: [{ id: 115, title: '集合' }] },
      { id: 3, slug: 'graph-basics', title: '图的存储、遍历与拓扑排序',
        summary: '把对象和关系表示成点与边，将已经学过的搜索应用到图上。',
        sections: ['有向图、无向图、边权与度数', '用 vector 存图：每个结点的邻居名单', '图上的 DFS、BFS 与连通块', '拓扑排序与依赖关系', '有向无环图上的路径与计数、欧拉路径初步'],
        lessonSlugs: ['graph-concepts', 'graph-vector', 'graph-traversal', 'topological-sort', 'dag-paths'],
        training: [{ id: 116, title: '图的基本应用' }] }
    ]
  },
  {
    slug: 'algorithm-tools', title: '二、扩展算法工具',
    summary: '从已学的前缀和、枚举、递归与搜索出发，继续减少重复计算和无效尝试。',
    chapters: [
      { id: 4, slug: 'prefix-difference-compression', title: '前缀和、差分与离散化',
        summary: '把逐个处理转化为区间处理，并保留解题所需的相对关系。',
        sections: ['一维前缀和复习与二维前缀和', '一维、二维差分与区间修改', '离散化：排序、去重与编号映射', '前缀统计、差分与二分的综合应用'],
        lessonSlugs: ['prefix-sums', 'difference-arrays', 'coordinate-compression', 'prefix-binary'],
        training: [{ id: 200, title: '前缀和、差分与离散化' }] },
      { id: 5, slug: 'linear-optimizations', title: '常见优化技巧',
        summary: '分析哪些选项可以被排除，用单调性维护有用的信息。',
        sections: ['双指针与滑动窗口', '计数、预处理与空间换时间', '单调栈：维护下一个更大或更小的元素', '单调队列：维护滑动窗口最值'],
        lessonSlugs: ['two-pointers', 'counting-precomputation', 'monotonic-stack', 'monotonic-queue'],
        training: [{ id: 201, title: '常见优化技巧' }] },
      { id: 6, slug: 'divide-and-doubling', title: '分治与倍增',
        summary: '拆分同类子问题，或把多次操作组合成二的幂次跳跃。',
        sections: ['分治的拆分、递归与合并', '归并排序与逆序对', '倍增：预处理跳跃与二进制拆分', 'ST 表与静态区间最值'],
        lessonSlugs: ['divide-conquer', 'merge-inversions', 'binary-lifting', 'sparse-table'],
        training: [{ id: 202, title: '分治与倍增' }] },
      { id: 7, slug: 'string-algorithms', title: '字符串算法',
        summary: '从字符比较走向字符串匹配、前缀关系和快速检索。',
        sections: ['字符串哈希与子串比较', '前缀函数、失配信息与 KMP', '字符串周期与匹配的应用', 'Trie 字典树与 01 Trie'],
        lessonSlugs: ['substring-hash', 'kmp', 'string-periods', 'trie'],
        training: [{ id: 115, title: '集合 · 字符串哈希' }, { id: 203, title: '字符串' }] },
      { id: 8, slug: 'advanced-search', title: '进阶搜索',
        summary: '继续把搜索看作枚举，通过剪枝、拆分和搜索顺序提高效率。',
        sections: ['可行性剪枝、最优性剪枝与搜索顺序', '双向搜索与折半搜索', '迭代加深搜索', '估价函数、A* 与 IDA*', '搜索状态设计与综合应用'],
        training: [{ id: 204, title: '进阶搜索' }] }
    ]
  },
  {
    slug: 'data-structures', title: '三、维护动态变化的数据',
    summary: '在查询之外加入修改，学习堆、树状数组和线段树。',
    chapters: [
      { id: 9, slug: 'heap-and-fenwick', title: '二叉堆与树状数组',
        summary: '分别处理动态取最值，以及修改后的前缀和与区间和。',
        sections: ['二叉堆的结构与 priority_queue', '合并、调度与动态中位数', '树状数组、lowbit 与单点修改区间查询', '差分树状数组与逆序对统计'],
        training: [{ id: 205, title: '二叉堆与树状数组' }] },
      { id: 10, slug: 'segment-trees', title: '线段树',
        summary: '让每个结点维护一个区间的信息，用递归完成修改与查询。',
        sections: ['区间划分、建树与信息合并', '单点修改与区间查询', '区间修改与懒标记', '加法、乘法、赋值与多种信息维护'],
        training: [{ id: 206, title: '线段树' }] }
    ]
  },
  {
    slug: 'graph-algorithms', title: '四、树与图论',
    summary: '利用前面的图、并查集、堆和线段树，处理路径、连通与树上关系。',
    chapters: [
      { id: 11, slug: 'tree-algorithms', title: '树上的关系与路径',
        summary: '把树上的父子关系转化为可计算的祖先、距离和区间。',
        sections: ['树的遍历、子树大小与 DFS 序', '树的直径与重心', '倍增与最近公共祖先 LCA', '树上差分与路径统计', '重链剖分与树上路径维护'],
        training: [{ id: 207, title: '树' }] },
      { id: 12, slug: 'shortest-paths', title: '最短路',
        summary: '将路程、代价和状态转移建成图，按边权特点选择算法。',
        sections: ['松弛操作与 BFS 最短路的衔接', 'Dijkstra 与堆优化', 'Bellman–Ford、SPFA 与负环', 'Floyd 与传递闭包', '最短路计数、分层图与差分约束'],
        training: [{ id: 208, title: '最短路' }] },
      { id: 13, slug: 'minimum-spanning-trees', title: '最小生成树',
        summary: '在保持全部结点连通的同时，让所选边的总代价最小。',
        sections: ['生成树、割与贪心选择', 'Kruskal、并查集与 Prim', '瓶颈路径、次小生成树与综合应用'],
        training: [{ id: 209, title: '最小生成树' }] },
      { id: 14, slug: 'graph-connectivity', title: '图的连通性',
        summary: '找出影响连通的关键点、关键边，并把复杂关系缩成更简单的图。',
        sections: ['DFS 树、时间戳与 low 值', '割点、桥与双连通分量', '强连通分量与 Tarjan 算法', '缩点、DAG 与连通性应用', '2-SAT 与布尔条件建图'],
        training: [{ id: 210, title: '连通性问题' }] }
    ]
  },
  {
    slug: 'dynamic-programming', title: '五、系统学习动态规划',
    summary: '从已学的状态与转移继续推进，学习更多模型，再分析怎样降低转移代价。',
    chapters: [
      { id: 15, slug: 'linear-dp-and-knapsack', title: '线性 DP 与背包进阶',
        summary: '复盘状态、边界与顺序，将序列、网格和背包问题联系起来。',
        sections: ['状态设计、记忆化与递推复盘', '最长上升子序列、最长公共子序列与编辑距离', '网格 DP、多条路径与多维状态', '多重背包、分组背包与混合背包', '二维费用、依赖背包与方案计数', '记录决策与还原方案'],
        training: [{ id: 211, title: '动态规划的引入' }, { id: 212, title: '线性状态动态规划' }] },
      { id: 16, slug: 'interval-dp', title: '区间与环形 DP',
        summary: '用连续区间定义子问题，按长度组织计算。',
        sections: ['区间状态、分割点与计算顺序', '石子合并、回文与区间决策', '环形问题与断环成链'],
        training: [{ id: 213, title: '区间与环形动态规划' }] },
      { id: 17, slug: 'tree-and-graph-dp', title: '树与图上的 DP',
        summary: '顺着树的子结构或 DAG 的依赖关系传递状态。',
        sections: ['树形 DP：子树状态与父子转移', '树上选择、覆盖与树形背包', '换根 DP 与二次扫描', 'DAG 上的 DP 与拓扑顺序'],
        training: [{ id: 214, title: '树与图上的动态规划' }] },
      { id: 18, slug: 'bitmask-dp', title: '状态压缩 DP',
        summary: '用二进制保存一个集合，让集合本身成为状态的一部分。',
        sections: ['位运算、集合表示与子集枚举', '子集 DP 与路径状态', '棋盘、行状态与相容性', '状压与搜索、最短路的结合'],
        training: [{ id: 215, title: '状态压缩动态规划' }] },
      { id: 19, slug: 'dp-design-and-optimization', title: 'DP 的设计与优化',
        summary: '先得到正确的状态转移，再定位并减少重复的计算。',
        sections: ['状态维度、转移瓶颈与复杂度分析', '前缀和、单调队列与数据结构优化', '斜率优化与凸壳维护', '分治优化与综合状态设计'],
        training: [{ id: 225, title: '动态规划的设计与优化' }] }
    ]
  },
  {
    slug: 'mathematics', title: '六、数学与计数',
    summary: '从整除、取模与基础计数出发，继续学习数论、概率和线性代数。',
    chapters: [
      { id: 20, slug: 'number-theory', title: '进阶数论',
        summary: '围绕同余与整除关系，推导可用于计算的性质。',
        sections: ['裴蜀定理、扩展欧几里得与线性同余方程', '模意义下的逆元与除法', '中国剩余定理 CRT', '线性筛、欧拉函数与欧拉定理', '整除分块与数论综合应用'],
        training: [{ id: 216, title: '进阶数论' }] },
      { id: 21, slug: 'combinatorics', title: '组合数学与计数',
        summary: '明确统计对象，通过分类、递推与排除重复完成计数。',
        sections: ['排列组合复习、组合恒等式与二项式定理', '阶乘、逆元预处理与组合数取模', '容斥原理与补集计数', '错排、卡特兰数与经典递推', '盒子与球、斯特林数与综合计数'],
        training: [{ id: 217, title: '组合数学与计数' }] },
      { id: 22, slug: 'probability-and-expectation', title: '概率、统计与期望',
        summary: '把随机过程拆成事件和状态，计算发生概率与平均结果。',
        sections: ['古典概型、几何概型与事件运算', '条件概率、全概率与贝叶斯公式', '数学期望与期望的线性性质', '概率 DP、期望 DP 与随机过程'],
        training: [{ id: 218, title: '概率与统计' }] },
      { id: 23, slug: 'linear-algebra', title: '基础线性代数',
        summary: '用向量、矩阵和线性方程组表达批量计算与转移。',
        sections: ['向量、矩阵与矩阵乘法', '矩阵快速幂与递推加速', '高斯消元与线性方程组', '异或方程组与行列式初步'],
        training: [{ id: 219, title: '基础线性代数' }] }
    ]
  },
  {
    slug: 'advanced-data-structures', title: '七、线段树的进一步应用',
    summary: '在普通线段树的基础上，继续处理值域、历史版本与多维查询。',
    chapters: [
      { id: 24, slug: 'advanced-segment-trees', title: '线段树进阶',
        summary: '从权值信息出发，学习版本复用与多层结构的组合。',
        sections: ['权值线段树与动态开点', '可持久化线段树与静态区间第 k 小', '线段树合并与树状数组套线段树', '离线处理、偏序与动态排名'],
        training: [{ id: 221, title: '线段树的进阶用法' }] }
    ]
  }
];

export const afterJoiningChapters = afterJoiningPhases.flatMap(phase => phase.chapters);
export const afterJoiningSectionCount = afterJoiningChapters.reduce((total, chapter) => total + chapter.sections.length, 0);
export const afterJoiningChapterPath = (slug: string) => `after-joining/chapter/${slug}/`;
export const afterJoiningSectionId = (index: number) => `section-${index + 1}`;
export const afterJoiningLessonPath = (slug: string) => `after-joining/learn/${slug}/`;
export const afterJoiningLessons = afterJoiningChapters.flatMap(chapter => (chapter.lessonSlugs || []).map((slug, index) => ({
  slug, chapter, index, title: `${chapter.id}.${index + 1} ${chapter.sections[index]}`
})));
