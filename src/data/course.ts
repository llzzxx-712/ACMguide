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
    { slug: 'setup', title: '1.1 编辑器下载与环境准备', days: [1], summary: '安装 Dev-C++，建立自己的代码文件夹。' },
    { slug: 'hello-world', title: '1.2 Hello, World!', days: [2], summary: '写下、运行并提交你的第一个 C++ 程序。' },
    { slug: 'io', title: '1.3 变量、输入输出与运算', days: [3,4], summary: '从 A+B 开始，把题意翻译成顺序执行的代码。' },
    { slug: 'conditions', title: '1.4 分支结构', days: [5], summary: '用条件判断，让程序处理不同情况。' },
    { slug: 'loops', title: '1.5 循环结构', days: [6,7], summary: '理解 for 和 while，练习计数、求和与多重循环。' },
    { slug: 'arrays', title: '1.6 数组', days: [8,9], summary: '用一维、二维数组保存和处理一组数据。' },
    { slug: 'strings', title: '1.7 字符串', days: [10], summary: '使用 char 与 string，处理字符、单词和整行文本。' },
    { slug: 'functions', title: '1.8 函数与结构体', days: [11], summary: '把程序拆成函数，用结构体记录一个对象。' },
    { slug: 'checkpoint', title: '1.9 语言基础复盘', days: [12], summary: '独立完成小测，学会读评测结果与定位错误。' }
  ]},
  { id: 2, title: '模拟、排序与枚举', range: '第 13—16 天', training: [106,107,108], lessons: [
    { slug: 'simulation', title: '2.1 模拟与复杂度入门', days: [13], summary: '按规则模拟，先估算程序需要执行多少次。', topics: ['题意转流程与边界处理','时间与空间复杂度入门','模拟练习（排除高精度）'] },
    { slug: 'sorting', title: '2.2 排序与自定义比较', days: [14], summary: '使用 sort，为数字和结构体制定排序规则。', topics: ['基础排序思想','sort 与比较函数','排序后的统计与去重'] },
    { slug: 'enumeration', title: '2.3 暴力枚举与优化', days: [15,16], summary: '枚举候选答案，再减少不必要的尝试。', topics: ['枚举对象与范围','多重循环与可行性判断','剪枝、预处理与对拍意识'] }
  ]},
  { id: 3, title: '递推、递归与贪心', range: '第 17—19 天', training: [109,110], lessons: [
    { slug: 'recursion', title: '3.1 递推与递归', days: [17,18], summary: '从已知推到未知，理解递归的出口和调用过程。', topics: ['递推关系与初始条件','递归调用与终止条件','简单分治与递归展开'] },
    { slug: 'greedy', title: '3.2 贪心', days: [19], summary: '选择当前最优策略，并说明它为什么成立。', topics: ['贪心策略与反例','交换思路入门','排序与贪心结合'] }
  ]},
  { id: 4, title: '二分查找与二分答案', range: '第 20—21 天', training: [111], lessons: [
    { slug: 'binary-search', title: '4.1 二分查找', days: [20], summary: '维护有序区间，定位元素与边界。', topics: ['有序性与二分边界','lower_bound / upper_bound','循环不变量与边界测试'] },
    { slug: 'binary-answer', title: '4.2 二分答案', days: [21], summary: '把最优化问题转换成单调的可行性判断。', topics: ['答案单调性','check 函数','整数答案的左右边界'] }
  ]},
  { id: 5, title: '搜索', range: '第 22—23 天', training: [112], lessons: [
    { slug: 'dfs', title: '5.1 深度优先搜索与回溯', days: [22], summary: '用状态、选择和回退枚举解。', topics: ['DFS 搜索树','排列、组合与回溯','访问标记与基础剪枝'] },
    { slug: 'bfs', title: '5.2 广度优先搜索', days: [23], summary: '用队列逐层扩展状态，求无权步数。', topics: ['BFS 与队列','网格、状态搜索与最少步数','入队标记与边界判断（不展开图论章节）'] }
  ]},
  { id: 6, title: '线性表', range: '第 24 天', training: [113], lessons: [
    { slug: 'linear', title: '6.1 线性表、栈与队列', days: [24], summary: '认识顺序表、链表、栈与队列的基本操作。', topics: ['vector 与顺序表','链表及数组模拟链表','stack、queue 与基本应用'] }
  ]},
  { id: 7, title: '基础数学问题', range: '第 25—26 天', training: [117], lessons: [
    { slug: 'math', title: '7.1 整除、质数与最大公约数', days: [25], summary: '用基础数论解决整除和约数问题。', topics: ['整除、质数判断与筛法','约数与质因数分解','gcd、lcm 与溢出处理'] },
    { slug: 'math-applications', title: '7.2 数学应用与规律', days: [26], summary: '整理进制、计数、模运算与基础几何。', topics: ['进制转换与模运算','基础组合计数与规律观察','基础几何与数学应用'] }
  ]},
  { id: 8, title: '简单动态规划', range: '第 27—28 天', lessons: [
    { slug: 'dp', title: '8.1 从递推到线性 DP', days: [27], summary: '定义状态，写出转移，确定初始值和顺序。', topics: ['状态、转移、边界和计算顺序','简单线性 DP','最大连续子段和与基础序列问题'] },
    { slug: 'knapsack', title: '8.2 简单背包与网格 DP', days: [28], summary: '理解 0/1 背包与网格路径的基本模型。', topics: ['二维网格 DP','0/1 背包基础','基础模型练习'] }
  ]},
  { id: 9, title: '简单博弈论与赛前练习', range: '第 29—30 天', lessons: [
    { slug: 'games', title: '9.1 必胜态与必败态', days: [29], summary: '从小规模局面找规律，理解简单取石子游戏。', topics: ['必胜态和必败态','简单取石子与巴什博弈','从小规模局面推导规律'] },
    { slug: 'contest', title: '9.2 模拟赛与复盘', days: [30], summary: '限时做题、选择题目，赛后补题并总结。', topics: ['新生组模拟练习','读题、时间分配与部分进展','错题复盘与后续学习路线'] }
  ]}
];

export const lessons = chapters.flatMap(chapter => chapter.lessons.map(lesson => ({ ...lesson, chapter })));
export const dayLabel = (days: number[]) => days.length === 1 ? `第 ${days[0]} 天` : `第 ${days[0]}—${days.at(-1)} 天`;
