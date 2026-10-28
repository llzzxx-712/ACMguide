---
title: DFS 树、时间戳与 low 值
description: 记录子树能否绕过来时的树边回到更早结点，从搜索返回过程推导桥的条件。
---

## 这一节学什么

并查集能合并连通块，但删掉一条边后会怎样，不能直接从普通并查集中得到。我们先用 DFS 把图组织成搜索树，再观察树边是否有别的路线可以绕过。

> **AI 伴学提示词**
>
> 为我讲解无向图 DFS 树、$\mathrm{dfn}$ 与 $\mathrm{low}$，用三角形接一条链的图追踪返回过程，解释一条边为什么是桥，并引导我提问。

## 搜索树边与回到旧点的边

第一次发现 $v$ 时，从 $u$ 走过去的边成为 DFS 树边。若遇到已经访问过的祖先，说明存在一条绕回更早位置的边。无向图中每条边存了两个方向，返回父亲的那一个反向记录不能被当作绕行。

但不能把“所有通往父点的边”都跳过：两个点可能有平行边，沿第一条走下去后，第二条确实提供了替代路线。所以每条无向边分配一个 $\mathrm{id}$，两侧邻接表保存相同 $\mathrm{id}$，只跳过进入当前点时的那条边。

## $\mathrm{dfn}$ 是发现时间，$\mathrm{low}$ 是返回信息

`dfn[u]` 是第一次进入 $u$ 的时间编号。`low[u]` 表示从 $u$ 的 DFS 子树内，沿向下树边并至多用一条回边，能抵达的最早发现时间。

```text
进入 u：low[u] = dfn[u]
树孩子 v 处理完：low[u] = min(low[u], low[v])
遇到非父边连接的已发现点 v：low[u] = min(low[u], dfn[v])
```

两次 min 的对象不同：孩子把整棵子树的信息交回来；直接看到的旧点提供的是它自己的时间戳。无向 DFS 的非树边连接祖先与后代，向已发现后代更新不会降低 $\mathrm{low}$，也不影响结果。

## 例题精讲：P1656 · 炸铁路

**原题：** [P1656 · 炸铁路](https://www.luogu.com.cn/problem/P1656)。

**题意简述：** 连通无向图，找删除后会让图不连通的边，即桥。原题无重边，$n\le 150$、$m\le 5000$。每条桥按较小端点在前输出，再按两个端点排序。

自拟输入：

```text
5 5
1 2
2 3
3 1
3 4
4 5
```

输出：

```text
3 4
4 5
```

三角形中一条边断开还能绕另一侧；后面链上的边没有替代路线。

### 为什么是 $\mathrm{low}[v]>\mathrm{dfn}[u]$

对树边 $u$—$v$，若 $v$ 子树能回到 $u$ 或 $u$ 的祖先，删掉这条边仍能绕回来。只有 `low[v]` 严格大于 `dfn[u]`，才说明 $v$ 子树无法绕过它，这条边是桥。

若恰好相等，存在另一条回到 $u$ 的路线，边仍可绕过，所以桥条件是严格大于。下一节删的是整个 $u$，届时等号的意义会变化。

### 完整代码

先用上面三步理解递归过程，再读显式栈实现。`next[u]` 保存这一层 for 已处理到哪个邻居，栈顶完成所有邻居后弹出，正好对应递归返回的时刻。

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
    vector<int> dfn(n + 1), low(n + 1), parent(n + 1), parentEdge(n + 1, -1), next(n + 1);
    vector<pair<int, int>> answer;
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
                    parent[v] = u; parentEdge[v] = e.id;
                    dfn[v] = low[v] = ++timer;
                    calls.push(v);
                } else low[u] = min(low[u], dfn[v]);
            } else {
                calls.pop();
                int p = parent[u];
                if (p) {
                    if (low[u] > dfn[p]) answer.push_back({min(u, p), max(u, p)});
                    low[p] = min(low[p], low[u]);
                }
            }
        }
    }
    sort(answer.begin(), answer.end());
    for (const auto &e : answer) cout << e.first << ' ' << e.second << '\n';
    return 0;
}
```

外层从所有未发现的点开始，让程序也能处理不连通图；桥的含义此时是“删除后连通块数增加”。每条邻接记录只扫描一次，找桥 $\mathcal{O}(n+m)$，输出排序 $\mathcal{O}(b \log  b)$，$b$ 为桥数，存储 $\mathcal{O}(n+m)$。

显式栈保存的是暂停的搜索层，不能替换成一个随意的 BFS 顺序：$\mathrm{low}$ 的父子关系与返回过程建立在 DFS 树上。

## 练习：用真的删边验证绕行关系

先**独立重做 P1656**。对小图逐条删除一条边，用 BFS 重新统计连通块数，核对 $\mathrm{low}$ 条件得到的桥。

### 推荐必做

1. [P8436 · 边双连通分量](https://www.luogu.com.cn/problem/P8436)：输出无向图各边双分量。先标记桥，再忽略桥遍历；图中有重边和自环，跳过父边时使用边编号。
2. [P3388 · 割点](https://www.luogu.com.cn/problem/P3388)：输出删除后会增加连通块数量的顶点。比较割点的 $\mathrm{low}$ 条件和桥的严格不等式，注意图可能不连通。

### 选做巩固

- [P2860 · Redundant Paths](https://www.luogu.com.cn/problem/P2860)：添加最少道路，使任意两点间有两条边不重复的路径。先求桥和边双分量，再分析缩成树后的叶子。
- [P3469 · BLO-Blockade](https://www.luogu.com.cn/problem/P3469)：对每个点统计断开其关联边后不连通的有序点对数。用 $\mathrm{low}$ 判断分离的子树并统计各块大小。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[连通性问题 #210](https://www.luogu.com.cn/training/210)。

## 本节验收

能区分树边与回边；能说明 $\mathrm{low}$ 的来源和返回时机；能推导桥的严格不等式，并正确处理父边编号与平行边。
