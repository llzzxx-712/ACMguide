---
title: Kruskal、并查集与 Prim
description: 分别按边合并连通块，或从一个点集向外扩张，将割上的最小边选择写成程序。
---

## 这一节学什么

上一节已经证明跨割最小边的安全性。现在把证明变成两套执行流程：Kruskal 从边的全局顺序出发；Prim 从当前树的外沿出发。两者求同一个最小总权。

> **AI 伴学提示词**
>
> 为我讲解 Kruskal 与 Prim，手算它们在同一张图中每步选择的边，解释并查集与堆各维护什么，并引导我提问。

## 例题精讲：P3366 · 最小生成树

**原题：** [P3366 · 最小生成树](https://www.luogu.com.cn/problem/P3366)。

**题意简述：** 求无向图 MST 的总权，不连通输出 orz。$n\le 5000$、$m\le 2\times 10^{5}$，边权为正。

自拟输入：

```text
4 5
1 2 1
2 3 2
3 4 3
1 4 10
1 3 4
```

输出 `6`，选权值 `1 2 3` 的三条边。

![Kruskal 与 Prim 的共同示例：四点五边，最小生成树选权 1、2、3](/ACMguide/diagrams/graphs/mst.svg)

### 动手看：两种贪心，在同一张图上怎样选边

<iframe class="lesson-animation-frame graph-process-frame" src="/ACMguide/animations/graph-process/mst.html" title="最小生成树动图：Kruskal 并查集判环与 Prim 从当前树扩张" loading="lazy"></iframe>

[单独打开动图](/ACMguide/animations/graph-process/mst.html)。Kruskal 模式下，先比较边的两端是否同组，再决定合并或跳过；切换到 Prim 后，留意堆中候选的 $\mathrm{cost}$ 是连接到当前树的**单条边代价**，不是源点到它的路程。动图与下方代码一样，将候选边入堆，弹出时跳过已入树的点。两种过程最终都选出总权为 6 的树。

## Kruskal：从便宜边开始，能合并就合并

按权升序扫描边。两端属于不同集合就加入，并查集合并；相同集合则成环，跳过。当前已选边保持森林，所选边又是某个当前块跨出的最小候选，因此可以应用割性质。

注意跳过的是成环的边，不是“这个点以前见过”。一个点可以连接多条树边。

### 完整代码一：Kruskal

```cpp
#include<bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, size;
    DSU(int n) : parent(n + 1), size(n + 1, 1) { iota(parent.begin(), parent.end(), 0); }
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    bool merge(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (size[x] < size[y]) swap(x, y);
        parent[y] = x; size[x] += size[y];
        return true;
    }
};
struct Edge { int u, v, weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<Edge> edges(m);
    for (Edge &e : edges) cin >> e.u >> e.v >> e.weight;
    sort(edges.begin(), edges.end(), [](const Edge &a, const Edge &b) { return a.weight < b.weight; });
    DSU dsu(n);
    long long answer = 0;
    int chosen = 0;
    for (const Edge &e : edges) if (dsu.merge(e.u, e.v)) {
        answer += e.weight;
        chosen++;
    }
    if (chosen == n - 1) cout << answer << '\n';
    else cout << "orz\n";
    return 0;
}
```

选够 $n-1$ 条才连通。即使没有提前退出，之后的边也都会被判为成环。时间 $\mathcal{O}(m \log  m+n)$，另有近线性的并查集操作；存储 $\mathcal{O}(n+m)$。

## Prim：每次给当前点集接入一个新点

从 1 开始，将连接到外部点的边放小根堆，取最便宜的一条跨割边扩张。若候选终点已在树中，这条边不再跨割，弹出后跳过。

堆里保存的是“把这个新点接进来的单条边权”，不是源点到它的总距离。Dijkstra 比较整条路线，Prim 比较跨割的连接代价，松弛目标不同。

### 完整代码二：堆优化 Prim

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int to, weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<Edge>> g(n + 1);
    for (int i = 0, u, v, w; i < m; i++) {
        cin >> u >> v >> w;
        g[u].push_back({v, w});
        g[v].push_back({u, w});
    }
    vector<bool> inTree(n + 1);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> heap;
    heap.push({0, 1});
    long long answer = 0;
    int reached = 0;
    while (!heap.empty()) {
        int cost = heap.top().first, u = heap.top().second;
        heap.pop();
        if (inTree[u]) continue;
        inTree[u] = true;
        reached++;
        answer += cost;
        for (const Edge &e : g[u]) if (!inTree[e.to]) heap.push({e.weight, e.to});
    }
    if (reached == n) cout << answer << '\n';
    else cout << "orz\n";
    return 0;
}
```

起点用费用 0 接入，这不是原图新增了一条边，只是统一“弹出后计入费用”的处理。队列耗尽却没有覆盖 $n$ 个点，就说明图不连通。

该版本把候选边入堆，时间 $\mathcal{O}((n+m)\log(m+1))$，空间 $\mathcal{O}(n+m)$。若点数小、图稠密，也可以每次扫描所有未选点维护最便宜连接边，得到 $\mathcal{O}(n^{2})$ 的 Prim。

## 怎么选择实现

输入本来就是边列表，Kruskal 很直接；原问题适合维护每个点向外的邻居或完整距离矩阵时，Prim 也自然。先看图规模、已有存储与建边成本，再选实现，不要给它们强行规定互相排斥的适用题型。

## 练习：同一输入，两种过程，一个总权

先**用两种算法独立重做 P3366**，用小图手算核对。边集可以不同，总权与连通结论应一致。

### 推荐必做

1. [P1111 · 修复公路](https://www.luogu.com.cn/problem/P1111)：道路在不同时间修复，求所有村庄首次连通的时间。按时间排序，用并查集检查加入边后连通块的变化。
2. [P2872 · Building Roads](https://www.luogu.com.cn/problem/P2872)：已知点坐标和已经存在的道路，求让所有点连通所需增加道路的最小总长度。先合并已有边，再处理按距离排序的候选边。

### 选做巩固

- [P1550 · Watering Hole](https://www.luogu.com.cn/problem/P1550)：可在田地打井或在田地之间建水道，求全部供水的最小费用。增加一个代表水源的点，比较稠密图中的 Prim 与 Kruskal。
- [P1194 · 买礼物](https://www.luogu.com.cn/problem/P1194)：物品可原价购买，也可在购买其他物品后享受指定优惠，求购买全部物品的最小费用。用额外点表示原价购买，构造生成树。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最小生成树 #209](https://www.luogu.com.cn/training/209)。

## 本节验收

能解释两种算法各自维护的割；能区分 Prim 的边代价与 Dijkstra 的路线代价；能识别成环候选，并正确判断图不连通。
