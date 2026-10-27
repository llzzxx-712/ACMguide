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

**题意简述：** 求无向图 MST 的总权，不连通输出 orz。n≤5000、m≤2×10⁵，边权为正。

自拟输入：

```text
4 5
1 2 1
2 3 2
3 4 3
1 4 10
1 3 4
```

输出 `6`，选权值 1、2、3 的三条边。

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

选够 n−1 条才连通。即使没有提前退出，之后的边也都会被判为成环。时间 O(m log m+n)，另有近线性的并查集操作；存储 O(n+m)。

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

起点用费用 0 接入，这不是原图新增了一条边，只是统一“弹出后计入费用”的处理。队列耗尽却没有覆盖 n 个点，就说明图不连通。

该版本把候选边入堆，时间 O((n+m) log(m+1))，空间 O(n+m)。若点数小、图稠密，也可以每次扫描所有未选点维护最便宜连接边，得到 O(n²) 的 Prim。

## 怎么选择实现

输入本来就是边列表，Kruskal 很直接；原问题适合维护每个点向外的邻居或完整距离矩阵时，Prim 也自然。先看图规模、已有存储与建边成本，再选实现，不要给它们强行规定互相排斥的适用题型。

## 练习：同一输入，两种过程，一个总权

先**用两种算法独立重做 P3366**，和上一节的小图枚举器对拍。边集可以不同，总权与连通结论应一致。

### 推荐必做

1. **自编 · 输出 MST 边编号：** 给边保留原始编号，Kruskal 接受时记录，最后检查输出边确为生成树、总权为最小值。
2. **自编 · 最小生成森林：** 原图可不连通，求让每个原有连通块内部连通的最小总权。Kruskal 扫完整张图，输出累计权与最终块数。

### 选做巩固

- **自编 · 允许负权：** 把边权扩展为负数，证明割上的替换仍然成立，测试自环不会成为树边。
- **自编 · 稠密矩阵 Prim：** n≤2000，用 O(n²) 扫描实现，比较无需保存堆中大量候选的空间特点。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最小生成树 #209](https://www.luogu.com.cn/training/209)。

## 本节验收

能解释两种算法各自维护的割；能区分 Prim 的边代价与 Dijkstra 的路线代价；能识别成环候选，并正确判断图不连通。
