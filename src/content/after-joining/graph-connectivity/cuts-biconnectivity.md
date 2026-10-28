---
title: 割点、桥与双连通分量
description: 把删边的绕行判断扩展到删点，再区分边双连通与点双连通的分组方式。
---

## 这一节学什么

桥是关键边，割点是关键点。删掉一个点会连同它的所有邻边一起删除，因此“能绕回这个点”还不够，需要回到它上方。再把没有这些薄弱位置的区域分组，就得到双连通的结构。

> **AI 伴学提示词**
>
> 为我讲解割点与两类双连通分量，用两个三角形共用一个顶点的图比较删点和删边，解释根结点为什么单独判断，并引导我提问。

## 非根割点：存在一个孩子绕不到自己上方

对非根 u，若某个 DFS 孩子 v 满足 low[v]≥dfn[u]，删掉 u 后，v 子树无法回到 u 的祖先一侧，因此 u 是割点。

这里等号也算：回边只能到达 u，若 u 整个消失，这条绕行就没有了。桥删除 u—v 的单条边时，另一条回到 u 的边还能用，所以条件是 low[v]>dfn[u]。

## 根割点：看 DFS 孩子数，不看原图度数

DFS 根没有祖先一侧。如果只有一个 DFS 孩子，删根后其余点仍在这一棵子树内连通；若有两个及以上 DFS 孩子，它们之间没有绕行，否则本应在同一次孩子搜索中被发现，所以删根会分裂。

原图里根邻居很多，不代表 DFS 孩子很多。例如三角形中根的两个邻居会被同一次递归访问到，只有一个树孩子。

## 例题精讲：P3388 · 割点

**原题：** [P3388 · 割点](https://www.luogu.com.cn/problem/P3388)。

**题意简述：** 给不一定连通的无向图，先输出割点数量，再升序输出割点。n≤20000、m≤10⁵。

自拟输入：

```text
6 6
1 2
2 3
3 1
3 4
4 5
5 3
```

输出两行 `1`、`3`。两个三角形共用 3，删它就分开；孤立点 6 不是割点，因为删掉它不会增加全图连通块数。

### 完整代码

沿用上一节的 DFS 栈，只增加孩子计数和返回时的割点判断。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int to, id; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<Edge>> g(n + 1);
    for (int id = 0, u, v; id < m; id++) {
        cin >> u >> v;
        g[u].push_back({v, id});
        g[v].push_back({u, id});
    }
    vector<int> dfn(n + 1), low(n + 1), parent(n + 1), parentEdge(n + 1, -1), next(n + 1), children(n + 1);
    vector<bool> cut(n + 1);
    int timer = 0;
    for (int root = 1; root <= n; root++) if (!dfn[root]) {
        stack<int> calls;
        dfn[root] = low[root] = ++timer;
        calls.push(root);
        while (!calls.empty()) {
            int u = calls.top(), degree = g[u].size();
            if (next[u] < degree) {
                Edge e = g[u][next[u]++];
                if (e.id == parentEdge[u]) continue;
                int v = e.to;
                if (!dfn[v]) {
                    children[u]++;
                    parent[v] = u; parentEdge[v] = e.id;
                    dfn[v] = low[v] = ++timer;
                    calls.push(v);
                } else low[u] = min(low[u], dfn[v]);
            } else {
                calls.pop();
                int p = parent[u];
                if (!p) cut[u] = children[u] >= 2;
                else {
                    if (parent[p] && low[u] >= dfn[p]) cut[p] = true;
                    low[p] = min(low[p], low[u]);
                }
            }
        }
    }
    vector<int> answer;
    for (int u = 1; u <= n; u++) if (cut[u]) answer.push_back(u);
    cout << answer.size() << '\n';
    int count = answer.size();
    for (int i = 0; i < count; i++) cout << answer[i] << (i + 1 == count ? '\n' : ' ');
    if (answer.empty()) cout << '\n';
    return 0;
}
```

一个点可能被多个孩子判为割点，用 bool 标记只计一次。总时间 O(n+m)，空间 O(n+m)。

## 边双连通：删去所有桥，再找连通块

同一个边双连通分量内，删除任意一条边仍保持连通。找到桥后，把它们全部忽略，DFS/BFS 得到的连通块就是边双分量；孤立点也单独成一块。把每块缩成一个点，原来的桥连接这些点，形成一片森林。

上面两个三角形共用 3 的图没有桥，1…5 整体是一个边双分量；它仍然有割点 3。这说明“没有桥”与“没有割点”不能混为一谈。

## 点双连通：割点可以属于多个块

点双连通分量是按删点后仍可相互连接的结构划分的极大块。两个三角形分别是 {1,2,3} 与 {3,4,5}，割点 3 同时属于它们。单条桥的两个端点也形成一个二点块，孤立点单独处理。

对不含自环的无向图，可以在 DFS 中维护边栈：

```text
沿树边 u—v 下去之前：把这条边入栈
v 返回且 low[v]>=dfn[u]：
    连续弹出边，直到弹出 u—v
    这些边的端点去重后，组成一个点双分量
遇到通向祖先的非父边：把它入栈
孤立根：单独形成一个只有自己的块
```

low[v]≥dfn[u] 表示这个孩子区域已不能跨过 u 回到更高处，恰好可以从栈中分出一个块。根是否为割点单独判断，但按这个条件弹块仍然成立。平行边仍要按 id 区分，自环不参与本节的删点分块讨论，可先去掉。

## 练习：把“删一条”与“删一个点”分别验证

先**独立重做 P3388**，对小图逐点删除，再数剩余连通块，与原图块数比较。根、孤立点、链中间点和环上点都要覆盖。

### 推荐必做

1. [P8436 · 边双连通分量](https://www.luogu.com.cn/problem/P8436)：输出无向图的所有边双分量。先按边编号标桥，再忽略桥遍历；注意原题允许重边和自环。
2. [P8435 · 点双连通分量](https://www.luogu.com.cn/problem/P8435)：输出无向图的所有点双分量。用边栈恢复各块，检查割点、孤立点和自环；按原题范围估算内存和遍历深度。

### 选做巩固

- [P3225 · 矿场搭建](https://www.luogu.com.cn/problem/P3225)：设置救援出口，使任意一个挖煤点坍塌后其他点都能到达出口。分析点双分量与割点的关系，统计最少出口数和方案数。
- [P3469 · BLO-Blockade](https://www.luogu.com.cn/problem/P3469)：对每个点，求断开它关联的边后不连通的有序点对数。利用 low 和子树大小统计被分开的部分，分别处理根与非根。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[连通性问题 #210](https://www.luogu.com.cn/training/210)。

## 本节验收

能推导割点与桥条件的等号区别；能解释根的特殊情况；能区分两类双连通分量，并说明割点为什么能属于多个点双块。
