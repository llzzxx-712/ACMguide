export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (path = '') => `${base}/${path.replace(/^\//, '')}`;
export const repo = 'https://github.com/llzzxx-712/ACMguide';

export type Lesson = {
  slug: string;
  title: string;
  days: number[];
  summary: string;
  topics?: string[];
};
export type Chapter = {
  id: number;
  title: string;
  range: string;
  lessons: Lesson[];
  training?: number[];
};

export const chapters: Chapter[] = [
  { id: 1, title: '语言基础', range: '第 1—12 天', training: [100,101,102,103,104,105], lessons: [
    { slug: 'setup', title: '1.1 编辑器下载与环境准备', days: [1], summary: '安装 Dev-C++，复制代码运行，确认环境可用。' },
    { slug: 'hello-world', title: '1.2 Hello, World!', days: [2], summary: '写下、运行并提交你的第一个 C++ 程序。' },
    { slug: 'io', title: '1.3 变量、输入输出与运算', days: [3,4], summary: '用苹果采购理解变量和输入，掌握整数运算与 printf。' },
    { slug: 'conditions', title: '1.4 分支结构', days: [5], summary: '用条件判断，让程序处理不同情况。' },
    { slug: 'loops', title: '1.5 循环结构', days: [6,7], summary: '理解 for 和 while，练习计数、求和与多重循环。' },
    { slug: 'arrays', title: '1.6 数组', days: [8,9], summary: '用一维、二维数组保存和处理一组数据。' },
    { slug: 'strings', title: '1.7 字符与字符串', days: [10], summary: '从 char 与 ASCII 开始，学习 string、常用操作和整行输入。' },
    { slug: 'functions', title: '1.8 函数与结构体', days: [11], summary: '把程序拆成函数，用结构体记录一个对象。' },
    { slug: 'checkpoint', title: '1.9 语言基础复盘', days: [12], summary: '独立完成小测，学会读评测结果与定位错误。' }
  ]},
  { id: 2, title: '模拟、排序与枚举', range: '第 13—16 天', training: [106,107,108], lessons: [
    { slug: 'simulation', title: '2.1 模拟与复杂度入门', days: [13], summary: '记录状态、按规则更新，代入最大规模估算能否通过，处理百万级输入。', topics: ['题意转流程与边界处理','复杂度、常数与最大规模估算','cin 关闭流同步与连续状态的维护'] },
    { slug: 'sorting', title: '2.2 排序与 sort 的应用', days: [14], summary: '用 sort 完成升降序、多字段排名和排序后的统计。', topics: ['sort 的区间与升降序','比较函数与奖学金排名','排序后的统计与去重'] },
    { slug: 'enumeration', title: '2.3 暴力枚举与优化', days: [15,16], summary: '选定枚举对象与范围，通过减少变量和批量计数降低计算量。', topics: ['枚举对象、范围与检验条件','减少枚举变量与提前排除','统计方形与预处理思路'] }
  ]},
  { id: 3, title: '递推、递归与贪心', range: '第 17—20 天', training: [109,110], lessons: [
    { slug: 'recurrence', title: '3.1 递推与前缀和', days: [17], summary: '从已知推到未知，用数的计算练递推，用前缀和快速回答区间和。', topics: ['递推关系、初始值与顺序','数的计算','前缀和与区间查询'] },
    { slug: 'recursion', title: '3.2 递归', days: [18], summary: '追踪阶乘的调用与返回，用 Function 学会递归与记忆化。', topics: ['递归出口、调用栈与返回','重复计算与记忆化','Function 与简单分治'] },
    { slug: 'greedy', title: '3.3 贪心', days: [19,20], summary: '从反例与交换理由出发，用 sort 安排比赛，再完成采购、分组等练习。', topics: ['贪心策略与反例','交换思路与排序扫描','两天练习：4 道必做、4 道选做'] }
  ]},
  { id: 4, title: '二分查找与二分答案', range: '第 21—22 天', training: [111], lessons: [
    { slug: 'binary-search', title: '4.1 二分查找', days: [21], summary: '用闭区间和 ans 查找第一次出现的位置，通过动图观察左右边界变化。', topics: ['闭区间、ans 与边界动图','lower_bound / upper_bound','重复值、查找失败与越界检查'] },
    { slug: 'binary-answer', title: '4.2 二分答案', days: [22], summary: '用砍树理解 check 与单调性，使用闭区间和 ans 求最优答案。', topics: ['答案单调性与 check 函数','用 ans 记录最大、最小可行值','每次检查与整体复杂度'] }
  ]},
  { id: 5, title: '线性表：栈与队列', range: '第 23 天', training: [113], lessons: [
    { slug: 'linear', title: '5.1 线性表、栈与队列', days: [23], summary: '用括号匹配理解栈，用机器翻译理解队列，认识 vector 与数组模拟链表。', topics: ['stack 与后进先出','queue 与先进先出','括号匹配、机器翻译与线性表'] }
  ]},
  { id: 6, title: '搜索：DFS 与 BFS', range: '第 24—25 天', training: [112], lessons: [
    { slug: 'dfs', title: '6.1 深度优先搜索与回溯', days: [24], summary: '把搜索理解为暴力枚举，用动图观察递归怎样实现动态层数的 for，再完成选数与八皇后。', topics: ['暴力枚举与动态层数的 for','动图：每层循环、暂停与返回','选数、八皇后与剪枝'] },
    { slug: 'bfs', title: '6.2 广度优先搜索', days: [25], summary: '从按层枚举的思路出发，用队列求马的最少步数，再用八方向搜索统计水塘。', topics: ['按层枚举与队列','马的遍历、距离与入队标记','八方向搜索与水塘计数'] }
  ]},
  { id: 7, title: '基础数学问题', range: '第 26—27 天', training: [117], lessons: [
    { slug: 'math', title: '7.1 整除、质数与最大公约数', days: [26], summary: '从约数配对到质数筛，再用 gcd、lcm 的关系减少枚举。', topics: ['整除、约数与质数判断','埃氏筛与质因数分解','gcd、lcm 与因子对计数'] },
    { slug: 'math-applications', title: '7.2 进制、取模与基础计数', days: [27], summary: '手算进制转换与快速幂，用分类、分步和递推理解计数。', topics: ['进制转换、取模与快速幂','加法与乘法原理、排列与组合','二进制运算、基础几何与规律'] }
  ]},
  { id: 8, title: '简单动态规划', range: '第 28—29 天', lessons: [
    { slug: 'dp', title: '8.1 从递推到线性 DP', days: [28], summary: '从固定结尾的小问题出发，推导最大子段和与最长上升子序列。', topics: ['状态、转移、边界与计算顺序','最大子段和与最长上升子序列','保存最优结果、记忆化与复杂度'] },
    { slug: 'knapsack', title: '8.2 网格 DP 与简单背包', days: [29], summary: '手填数字三角形和采药的状态表，理解二维转移与背包循环顺序。', topics: ['数字三角形与网格依赖','二维 0/1 背包与一维倒序优化','完全背包、恰好与至多的初始化'] }
  ]},
  { id: 9, title: '简单博弈论', range: '第 30 天', lessons: [
    { slug: 'games', title: '9.1 必胜态与必败态', days: [30], summary: '从小规模局面找规律，理解简单取石子游戏。', topics: ['必胜态和必败态','简单取石子与巴什博弈','从小规模局面推导规律'] }
  ]}
];

export const lessons = chapters.flatMap(chapter => chapter.lessons.map(lesson => ({ ...lesson, chapter })));
export const dayLabel = (days: number[]) => days.length === 1 ? `第 ${days[0]} 天` : `第 ${days[0]}—${days.at(-1)} 天`;
