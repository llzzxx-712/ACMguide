---
title: 强连通分量与 Tarjan 算法
description: 用尚未归组的点栈保存相互可达的候选区域，在搜索返回时一次弹出一个强连通分量。
---

## 这一节学什么

有向图中，能从 u 到 v，并不保证能从 v 回来。把所有彼此都能到达的点放到同一组，得到强连通分量 SCC。它是“相互可达”的等价类，每个点恰好属于一组。

> **AI 伴学提示词**
>
> 为我讲解强连通分量与 Tarjan，手算两个栈的不同作用，解释何时更新 low、何时弹出一整组，并引导我提问。

## 先按可达关系理解分组

例如 1→2→3→1，且 3→4、4→5、5→4。1、2、3 互相可达，4、5 互相可达；前一组能到后一组，后一组回不来，所以是两个 SCC。

单个点也属于一个 SCC，即使没有自环。“至少两个点组成的环形区域”和“一般 SCC”在统计时要分清。

## dfn、low 与尚未归组的点栈

进入 u 时给 dfn[u] 编号，令 low[u]=dfn[u]，并将 u 放入 active 栈。这个栈保存已发现但尚未确定归组的点。

- 遇到未发现的 v，继续 DFS，返回后用 low[v] 更新 low[u]。
- 遇到已经发现且仍在 active 栈中的 v，用 dfn[v] 更新 low[u]。
- 遇到已经弹栈归组的 v，不更新 low；单向走进一个完成的分量不代表它还能回到自己。

这里 low 汇集搜索子树与指向栈内点的连接信息，用于判断当前未归组区域能否连接到更早的栈内位置。它与无向桥算法名称相同，但更新条件、栈的意义和最终判定都不同，不能直接互换。

当 u 的邻居全部处理完，若 low[u]==dfn[u]，u 是一个尚未归组 SCC 的最早入口；从 active 连续弹到 u，这些点就是同一分量。弹栈时同时清除 inStack，并赋 component 编号。

## 例题精讲：P2863 · The Cow Prom

**原题：** [P2863 · The Cow Prom](https://www.luogu.com.cn/problem/P2863)。

**题意简述：** 给有向图，求点数大于 1 的 SCC 数量。n≤10000，m≤50000。

自拟输入：

```text
5 6
1 2
2 3
3 1
3 4
4 5
5 4
```

输出 `2`。从 1 搜索时会先完成并弹出 {4,5}，再弹出 {1,2,3}；两组之间的单向边不能把它们合并。

### 完整代码

calls 是模拟函数调用的栈，next[u] 是这一层暂停的循环位置；active 是等待归组的点栈。一个点完成 DFS、离开 calls 时，仍可能留在 active，等待更高的入口统一弹出。不要把它们合成同一个栈。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct SCC {
    int n, timer = 0, count = 0;
    vector<vector<int>> g;
    vector<int> dfn, low, parent, next, component, active, calls;
    vector<bool> inStack;
    SCC(int size) : n(size), g(size + 1), dfn(size + 1), low(size + 1),
        parent(size + 1), next(size + 1), component(size + 1), inStack(size + 1) {}
    void enter(int u) {
        dfn[u] = low[u] = ++timer;
        active.push_back(u);
        calls.push_back(u);
        inStack[u] = true;
    }
    void run() {
        for (int root = 1; root <= n; root++) if (!dfn[root]) {
            enter(root);
            while (!calls.empty()) {
                int u = calls.back(), degree = g[u].size();
                if (next[u] < degree) {
                    int v = g[u][next[u]++];
                    if (!dfn[v]) { parent[v] = u; enter(v); }
                    else if (inStack[v]) low[u] = min(low[u], dfn[v]);
                } else {
                    calls.pop_back();
                    if (low[u] == dfn[u]) {
                        count++;
                        while (true) {
                            int v = active.back();
                            active.pop_back();
                            inStack[v] = false;
                            component[v] = count;
                            if (v == u) break;
                        }
                    }
                    if (parent[u]) low[parent[u]] = min(low[parent[u]], low[u]);
                }
            }
        }
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    SCC graph(n);
    for (int i = 0, u, v; i < m; i++) { cin >> u >> v; graph.g[u].push_back(v); }
    graph.run();
    vector<int> size(graph.count + 1);
    for (int u = 1; u <= n; u++) size[graph.component[u]]++;
    int answer = 0;
    for (int c = 1; c <= graph.count; c++) if (size[c] > 1) answer++;
    cout << answer << '\n';
    return 0;
}
```

所有点都在外层检查，图不连通也会完整分组。每点进出两个栈各一次，每条有向边扫描一次，时间与空间均为 O(n+m)。显式调用栈避免长链造成深函数递归。

这份编号按分量弹出顺序递增。如果分量 A 有边到不同分量 B，则 component[A]>component[B]，即先弹出后继、后弹出前驱。之后构造方案时会用到这一顺序。

## 练习：先用小图的可达矩阵核对分组

先**独立重做 P2863**。对小图分别从每点搜索；两点互相可达时应被分在一起，不互相可达时不能混组。

### 推荐必做

1. [P1726 · 上白泽慧音](https://www.luogu.com.cn/problem/P1726)：在单向或双向道路组成的图中求最大的强连通区域，并按题目要求输出编号。练习收集每个 SCC 的成员和处理并列。
2. [P2341 · 受欢迎的牛](https://www.luogu.com.cn/problem/P2341)：喜欢关系可传递，求被所有牛喜欢的牛数。求出 SCC 后统计分量出度及唯一汇分量的大小。

### 选做巩固

- [P3387 · 缩点](https://www.luogu.com.cn/problem/P3387)：有向图中重复经过的点只计一次权值，求最大路径权值和。先统计各 SCC 的点权，再在缩图上求最优值。
- [P2746 · 校园网](https://www.luogu.com.cn/problem/P2746)：求软件覆盖所有学校需要的最少下发点，以及让任意单点都能覆盖全网所需的最少新增边。缩点后统计源与汇。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[连通性问题 #210](https://www.luogu.com.cn/training/210)。

## 本节验收

能按相互可达解释 SCC；能区分调用栈与分量栈；能说出 inStack 的用途以及整个分量弹出的条件，并正确统计单点分量。
